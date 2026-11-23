// Pure Product intake/delivery policy. The host owns all connector operations and
// target filesystem writes. Untrusted source text never supplies instructions.
import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
import { systemRegistry } from '../shared/system-registry.mjs';
import { evaluateValidationEvidence } from '../shared/validation-map.mjs';
import { REDACTED, redactValue, scanSecrets, stableJson } from './task-breakdown/safety.mjs';

const DIGEST = /^[a-f0-9]{64}$/u;
const SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const MEDIA = Object.freeze({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'text/plain': 'txt', 'application/json': 'json' });
const BEHAVIOR_LEVELS = Object.freeze({ ui: 'browser-e2e', api: 'api-e2e', cli: 'integration', job: 'integration' });
const sha = (value) => createHash('sha256').update(value).digest('hex');
const encode = (value) => { portableData(value); return Buffer.from(`${stableJson(value)}\n`, 'utf8'); };
const fingerprint = (value) => sha(encode(value));
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;

function record(value, field) {
  if (!object(value)) throw new TypeError(`${field} must be a plain object`);
  return value;
}

function fields(value, expected, field) {
  record(value, field);
  if (Object.keys(value).length !== expected.length || expected.some((key) => !Object.hasOwn(value, key))) throw new TypeError(`${field} has missing or unsupported fields`);
}

function sanitized(value, field, options) {
  if (clean(value, field, options) !== value) throw new TypeError(`${field} must already be sanitized`);
}

function artifactMetadata(value, kind) {
  if (value.schema_version !== 1 || value.artifact_kind !== kind || value.owner !== 'sdcorejs-product' || value.commit_policy !== 'with-change' || value.redaction_applied !== true) throw new TypeError('artifact metadata is invalid');
  exact(value.owner_repository_id, 'owner_repository_id');
  exact(value.change_ref, 'change_ref');
}

function portableData(value, ancestors = new Set(), depth = 0) {
  if (value === null || ['string', 'boolean'].includes(typeof value) || (typeof value === 'number' && Number.isFinite(value))) return;
  if (depth > 100 || (!Array.isArray(value) && !object(value)) || ancestors.has(value)) throw new TypeError('data must contain finite, acyclic portable JSON values');
  ancestors.add(value);
  for (const child of Object.values(value)) portableData(child, ancestors, depth + 1);
  ancestors.delete(value);
}

function string(value, field, { empty = false } = {}) {
  if (typeof value !== 'string' || (!empty && !value.trim()) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)) {
    throw new TypeError(`${field} must be ${empty ? 'a' : 'a non-empty'} safe string`);
  }
  return value;
}

function clean(value, field, options) {
  const redacted = scanSecrets(string(value, field, options), { source: 'ticket-intake', field }).redacted;
  // Tracker prose often embeds JSON examples. The shared scanner handles known
  // token forms; quoted credential keys additionally protect opaque short values.
  return redacted.replace(/(["'](?:api[_-]?key|secret|token|password|passwd|client[_-]?secret|access[_-]?key|authorization|cookie)["']\s*:\s*)(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/giu, (_match, prefix) => `${prefix}"${REDACTED}"`);
}

function exact(value, field) {
  const result = string(value, field);
  if (result !== result.trim() || /[\r\n\t]/u.test(result) || scanSecrets(result).findings.length > 0) throw new TypeError(`${field} must be an exact non-secret identifier`);
  return result;
}

function array(value, field) {
  if (!Array.isArray(value)) throw new TypeError(`${field} must be an explicit array`);
  return value;
}

function timestamp(value, field) {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/u.test(value) || Number.isNaN(Date.parse(value))) throw new TypeError(`${field} must be a UTC ISO timestamp`);
  return value;
}

function safeUrl(value, field, { instance = false } = {}) {
  string(value, `${field} URL`);
  if (/[\\\s\u0000-\u001f]/u.test(value) || /%(?:2e|2f|5c|00)/iu.test(value) || /(?:^|\/)\.\.(?:\/|$)/u.test(value)) throw new TypeError(`${field} URL contains an unsafe path`);
  let url;
  try { url = new URL(value); } catch { throw new TypeError(`${field} URL is invalid`); }
  if (url.protocol !== 'https:' || url.username || url.password || url.hash || !url.hostname.includes('.') || isIP(url.hostname.replace(/^\[|\]$/gu, '')) || /(?:^|\.)(?:localhost|local|internal|test|invalid)$/iu.test(url.hostname)) {
    throw new TypeError(`${field} URL must be a public HTTPS URL without credentials or fragment`);
  }
  if (instance && url.search) throw new TypeError(`${field} URL cannot contain a query`);
  url.search = '';
  if (scanSecrets(url.href).findings.length) throw new TypeError(`${field} URL contains a secret`);
  return instance ? url.href.replace(/\/+$/u, '') : url.href;
}

function ticketRoutePath(route) {
  try {
    const url = new URL(route, 'https://route.invalid');
    if (url.protocol === 'https:' || url.protocol === 'http:') return exact(url.pathname, 'UI route path');
  } catch { /* The tracker payload never includes raw route input on error. */ }
  throw new TypeError('UI evidence requires a safe route path');
}

function root() {
  const value = systemRegistry.artifact_roots.tickets;
  if (typeof value !== 'string' || !/^\.sdcorejs\/[a-z0-9-]+$/u.test(value)) throw new TypeError('registry artifact_roots.tickets is missing or unsafe');
  return value;
}

/** The scope kind is part of identity; never derive identity from title or slug. */
export function ticketIdentity(input) {
  record(input, 'identity');
  const provider = exact(input.provider, 'identity.provider');
  if (!SEGMENT.test(provider)) throw new TypeError('identity.provider must be a lowercase provider key');
  const hasProject = input.project !== undefined;
  if (hasProject === (input.repository !== undefined)) throw new TypeError('identity requires exactly one project or repository');
  const scopeKind = hasProject ? 'project' : 'repository';
  const value = { provider, instance: safeUrl(input.instance, 'identity.instance', { instance: true }), [scopeKind]: exact(input[scopeKind], `identity.${scopeKind}`), id: exact(input.id, 'identity.id') };
  const digest = fingerprint(value);
  return { value, hash: digest, directory: `${root()}/${digest}` };
}

/** Narrow path recognition only; callers must still verify bytes and ownership. */
export function classifyTicketArtifactPath(path) {
  const prefix = root();
  if (typeof path !== 'string' || !(path === prefix || path.startsWith(`${prefix}/`))) return null;
  const suffix = path.slice(prefix.length + 1);
  const match = /^([a-f0-9]{64})\/(?:(snapshots|delivery)\/([a-f0-9]{64})\.json|assets\/(reference|real-ui-evidence)\/([a-f0-9]{64})\.(png|jpg|webp|txt|json))$/u.exec(suffix);
  if (!match) return { ok: false, code: 'TICKET_PATH_INVALID', path };
  if (match[4] === 'real-ui-evidence' && ['txt', 'json'].includes(match[6])) return { ok: false, code: 'TICKET_EVIDENCE_MEDIA_INVALID', path };
  const kind = match[2] === 'snapshots' ? 'ticket-snapshot' : match[2] === 'delivery' ? 'ticket-delivery' : 'ticket-asset';
  return { ok: true, kind, artifact_kind: kind, root: prefix, path, identity_hash: match[1], sha256: match[3] ?? match[5], role: match[4] ?? null, commit_policy: 'with-change' };
}

function fileBundle(directory, section, artifactKind, body) {
  const bytes = encode(body);
  const digest = sha(bytes);
  const path = `${directory}/${section}/${digest}.json`;
  return { artifact: { ...body, content_hash: digest, path }, file: { path, bytes, sha256: digest, artifact_kind: artifactKind, media_type: 'application/json', commit_policy: 'with-change' } };
}

function imageSignature(bytes, mediaType) {
  if (mediaType === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mediaType === 'image/jpeg') return bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (mediaType === 'image/webp') return bytes.length >= 12 && bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  return false;
}

function attachmentHeader(input) {
  record(input, 'attachment');
  const id = exact(input.id, 'attachment.id');
  const filename = clean(input.filename, 'attachment.filename');
  if (filename !== filename.trim() || /[\\/%:\r\n]/u.test(filename) || filename === '.' || filename === '..') throw new TypeError('attachment.filename must be a safe basename');
  const mediaType = exact(input.media_type, 'attachment.media_type');
  if (!/^[a-z0-9.+-]+\/[a-z0-9.+-]+$/u.test(mediaType)) throw new TypeError('attachment.media_type must be a MIME type');
  if (!['reference', 'real-ui-evidence'].includes(input.role)) throw new TypeError('attachment.role must be reference or real-ui-evidence');
  const metadata = { id, filename, media_type: mediaType, role: input.role, url: input.url == null ? null : safeUrl(input.url, 'attachment.url') };
  if (input.role === 'real-ui-evidence') {
    const provenance = record(input.provenance, 'attachment.provenance');
    if (provenance.source !== 'real-browser' || !mediaType.startsWith('image/')) throw new TypeError('attachment.provenance must describe a real browser image capture');
    metadata.provenance = { source: 'real-browser', run_id: exact(provenance.run_id, 'provenance.run_id'), case_id: exact(provenance.case_id, 'provenance.case_id'), associated_HEAD_or_diff: exact(provenance.associated_HEAD_or_diff, 'provenance.associated_HEAD_or_diff'), captured_at: timestamp(provenance.captured_at, 'provenance.captured_at') };
  }
  return metadata;
}

function asset(input, directory, blockers) {
  const metadata = attachmentHeader(input);
  const mediaType = metadata.media_type;
  if (!Object.hasOwn(MEDIA, mediaType)) {
    blockers.push('ASSET_MEDIA_UNSUPPORTED');
    return { metadata: { ...metadata, status: 'unsupported', path: null, sha256: null }, file: null };
  }
  if (input.bytes === undefined || input.bytes === null) {
    blockers.push('ASSET_UNAVAILABLE');
    return { metadata: { ...metadata, status: 'unavailable', reason: clean(input.reason ?? 'No bytes supplied by connector', 'attachment.reason'), path: null, sha256: null }, file: null };
  }
  if (!(input.bytes instanceof Uint8Array) || input.bytes.byteLength === 0) throw new TypeError('attachment.bytes must be non-empty Uint8Array bytes');
  let bytes = Buffer.from(input.bytes);
  const originalHash = sha(bytes);
  let privacyReview = null;
  if (mediaType.startsWith('image/')) {
    if (!imageSignature(bytes, mediaType)) throw new TypeError('attachment bytes do not match the declared image signature');
    const review = input.privacy_review;
    if (!object(review) || review.status !== 'approved' || review.sha256 !== originalHash || typeof review.reviewed_by !== 'string' || !review.reviewed_by.trim()) {
      blockers.push('ASSET_PRIVACY_REVIEW_REQUIRED');
      return { metadata: { ...metadata, status: 'privacy-review-required', path: null, sha256: null }, file: null };
    }
    privacyReview = { status: 'approved', reviewed_by: clean(review.reviewed_by, 'privacy_review.reviewed_by'), sha256: originalHash };
  } else {
    let decoded;
    try { decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { throw new TypeError('text attachment.bytes must be valid UTF-8'); }
    if (mediaType === 'application/json') {
      let parsed;
      try { parsed = JSON.parse(decoded); } catch { throw new TypeError('attachment.bytes must contain valid JSON'); }
      const redactKeys = (value, depth = 0) => {
        if (depth > 100) throw new TypeError('attachment JSON nesting is too deep');
        if (Array.isArray(value)) return value.map((child) => redactKeys(child, depth + 1));
        if (!object(value)) return value;
        return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, /^(?:api[_-]?key|secret|token|password|passwd|client[_-]?secret|access[_-]?key|authorization|cookie)$/iu.test(key) ? REDACTED : redactKeys(child, depth + 1)]));
      };
      bytes = encode(redactValue(redactKeys(parsed), { source: 'ticket-attachment' }).value);
    } else bytes = Buffer.from(clean(decoded, 'attachment.bytes', { empty: true }), 'utf8');
  }
  const digest = sha(bytes);
  const path = `${directory}/assets/${input.role}/${digest}.${MEDIA[mediaType]}`;
  return {
    metadata: { ...metadata, status: 'available', path, sha256: digest, bytes: bytes.byteLength, redaction_applied: true, privacy_review: privacyReview },
    file: { path, bytes, sha256: digest, media_type: mediaType, artifact_kind: 'ticket-asset', commit_policy: 'with-change' },
  };
}

function uniqueRecords(values, field, map) {
  const seen = new Set();
  return array(values, field).map((value) => {
    record(value, field);
    const result = map(value);
    if (seen.has(result.id)) throw new TypeError(`${field} contains duplicate ids`);
    seen.add(result.id);
    return result;
  });
}

function sourceReferences(value, known) {
  const refs = array(value, 'source_refs');
  if (!refs.length || new Set(refs).size !== refs.length || refs.some((ref) => typeof ref !== 'string' || !known.has(ref))) throw new TypeError('source_refs must resolve to unique captured source fields');
  return [...refs];
}

/** Returns actual sanitized bytes. Missing assets produce a partial snapshot. */
export function createTicketSnapshot(input) {
  record(input, 'intake');
  const identity = ticketIdentity(input.identity);
  if (typeof input.attachments_complete !== 'boolean') throw new TypeError('attachments_complete must explicitly describe enumeration completeness');
  const blockers = input.attachments_complete ? [] : ['ATTACHMENT_LIST_INCOMPLETE'];
  const attachments = [];
  const files = new Map();
  uniqueRecords(input.attachments, 'attachments', (value) => {
    const result = asset(value, identity.directory, blockers);
    attachments.push(result.metadata);
    if (result.file) files.set(result.file.path, result.file);
    return result.metadata;
  });
  const original = {
    title: clean(input.title, 'title'), description: clean(input.description, 'description', { empty: true }),
    comments: uniqueRecords(input.comments, 'comments', (value) => ({ id: exact(value.id, 'comment.id'), body: clean(value.body, 'comment.body', { empty: true }) })),
    acceptance_criteria: uniqueRecords(input.acceptance_criteria, 'acceptance_criteria', (value) => ({ id: exact(value.id, 'criterion.id'), text: clean(value.text, 'criterion.text') })),
  };
  const known = new Set(['title', 'description', ...original.comments.map(({ id }) => `comment:${id}`), ...original.acceptance_criteria.map(({ id }) => `criterion:${id}`), ...attachments.map(({ id }) => `attachment:${id}`)]);
  const criterionIds = new Set();
  const requirements = uniqueRecords(input.requirements, 'requirements', (value) => {
    const id = exact(value.id, 'requirement.id');
    if (!/^R-(?!000)\d{3}$/u.test(id)) throw new TypeError('requirement.id must use R-###');
    if (value.authority !== undefined && value.authority !== 'draft') throw new TypeError('intake requirements have draft authority only');
    const proposed = uniqueRecords(value.proposed_acceptance_criteria, 'proposed_acceptance_criteria', (criterion) => {
      const criterionId = exact(criterion.id, 'proposed criterion.id');
      if (!/^AC-(?!000)\d{3}$/u.test(criterionId) || criterionIds.has(criterionId)) throw new TypeError('proposed criterion ids must be unique AC-### identities');
      criterionIds.add(criterionId);
      if (criterion.status !== undefined && criterion.status !== 'proposed') throw new TypeError('intake acceptance criteria must remain proposed');
      return { id: criterionId, statement: clean(criterion.statement, 'criterion.statement'), source_refs: sourceReferences(criterion.source_refs, known), status: 'proposed' };
    });
    return { id, statement: clean(value.statement, 'requirement.statement'), source_refs: sourceReferences(value.source_refs, known), authority: 'draft', proposed_acceptance_criteria: proposed };
  });
  const source = { identity: identity.value, url: safeUrl(input.url, 'source.url'), updated_at: timestamp(input.updated_at, 'updated_at'), original, attachments_complete: input.attachments_complete, attachments };
  const body = {
    schema_version: 1, artifact_kind: 'ticket-snapshot', owner: 'sdcorejs-product',
    owner_repository_id: exact(input.owner_repository_id, 'owner_repository_id'), change_ref: exact(input.change_ref, 'change_ref'),
    commit_policy: 'with-change', redaction_applied: true, authority: 'external-source-data', ...source,
    revision: exact(input.revision, 'revision'), captured_at: timestamp(input.captured_at, 'captured_at'), source_hash: fingerprint(source),
    requirements, complete: blockers.length === 0, blockers: [...new Set(blockers)],
  };
  const bundle = fileBundle(identity.directory, 'snapshots', 'ticket-snapshot', body);
  return { snapshot: bundle.artifact, assets: [...files.values()], files: [bundle.file, ...files.values()] };
}

function checkedSnapshot(snapshot) {
  record(snapshot, 'snapshot');
  const { content_hash: digest, path, ...body } = snapshot;
  const identity = ticketIdentity(snapshot.identity);
  if (!DIGEST.test(digest ?? '') || fingerprint(body) !== digest || path !== `${identity.directory}/snapshots/${digest}.json`) throw new TypeError('snapshot hash or path is invalid');
  fields(body, ['schema_version', 'artifact_kind', 'owner', 'owner_repository_id', 'change_ref', 'commit_policy', 'redaction_applied', 'authority', 'identity', 'url', 'updated_at', 'original', 'attachments_complete', 'attachments', 'revision', 'captured_at', 'source_hash', 'requirements', 'complete', 'blockers'], 'snapshot');
  artifactMetadata(body, 'ticket-snapshot');
  if (snapshot.authority !== 'external-source-data' || !DIGEST.test(snapshot.source_hash ?? '') || typeof snapshot.complete !== 'boolean' || typeof snapshot.attachments_complete !== 'boolean' || stableJson(snapshot.identity) !== stableJson(identity.value)) throw new TypeError('snapshot shape is invalid');
  if (safeUrl(snapshot.url, 'source.url') !== snapshot.url) throw new TypeError('source URL must already be sanitized');
  exact(snapshot.revision, 'revision');
  timestamp(snapshot.updated_at, 'updated_at');
  timestamp(snapshot.captured_at, 'captured_at');
  const derivedBlockers = snapshot.attachments_complete ? [] : ['ATTACHMENT_LIST_INCOMPLETE'];
  uniqueRecords(snapshot.attachments, 'attachments', (entry) => {
    const header = attachmentHeader(entry);
    const headerKeys = Object.keys(header);
    if (headerKeys.some((key) => stableJson(header[key]) !== stableJson(entry[key]))) throw new TypeError('attachment metadata must already be sanitized');
    if (entry.role === 'real-ui-evidence') fields(entry.provenance, ['source', 'run_id', 'case_id', 'associated_HEAD_or_diff', 'captured_at'], 'attachment.provenance');
    const supported = Object.hasOwn(MEDIA, entry.media_type);
    if (entry.status === 'available') {
      fields(entry, [...headerKeys, 'status', 'path', 'sha256', 'bytes', 'redaction_applied', 'privacy_review'], 'available attachment');
      if (!supported || !DIGEST.test(entry.sha256 ?? '') || !Number.isSafeInteger(entry.bytes) || entry.bytes < 0 || entry.redaction_applied !== true || entry.path !== `${identity.directory}/assets/${entry.role}/${entry.sha256}.${MEDIA[entry.media_type]}`) throw new TypeError('available attachment integrity is invalid');
      if (entry.media_type.startsWith('image/')) {
        fields(entry.privacy_review, ['status', 'reviewed_by', 'sha256'], 'attachment privacy review');
        if (entry.bytes === 0 || entry.privacy_review.status !== 'approved' || entry.privacy_review.sha256 !== entry.sha256) throw new TypeError('attachment privacy approval does not match its bytes');
        sanitized(entry.privacy_review.reviewed_by, 'privacy reviewer');
      } else if (entry.privacy_review !== null) throw new TypeError('text attachment privacy metadata is invalid');
    } else {
      const gapCodes = { unavailable: 'ASSET_UNAVAILABLE', unsupported: 'ASSET_MEDIA_UNSUPPORTED', 'privacy-review-required': 'ASSET_PRIVACY_REVIEW_REQUIRED' };
      if (!Object.hasOwn(gapCodes, entry.status) || entry.path !== null || entry.sha256 !== null || (entry.status === 'unsupported') === supported || (entry.status === 'privacy-review-required' && !entry.media_type.startsWith('image/'))) throw new TypeError('attachment gap state is invalid');
      fields(entry, [...headerKeys, 'status', 'path', 'sha256', ...(entry.status === 'unavailable' ? ['reason'] : [])], 'unavailable attachment');
      if (entry.status === 'unavailable') sanitized(entry.reason, 'attachment reason');
      derivedBlockers.push(gapCodes[entry.status]);
    }
    return entry;
  });
  const expected = [...new Set(derivedBlockers)].sort();
  const blockers = array(snapshot.blockers, 'snapshot.blockers');
  if (blockers.some((value) => typeof value !== 'string') || new Set(blockers).size !== blockers.length || stableJson([...blockers].sort()) !== stableJson(expected) || snapshot.complete !== (expected.length === 0)) throw new TypeError('snapshot completeness contradicts attachment state');
  fields(snapshot.original, ['title', 'description', 'comments', 'acceptance_criteria'], 'original source');
  sanitized(snapshot.original.title, 'original.title');
  sanitized(snapshot.original.description, 'original.description', { empty: true });
  for (const [key, textKey] of [['comments', 'body'], ['acceptance_criteria', 'text']]) uniqueRecords(snapshot.original[key], key, (entry) => {
    fields(entry, ['id', textKey], key);
    exact(entry.id, `${key}.id`);
    sanitized(entry[textKey], key, { empty: key === 'comments' });
    return entry;
  });
  const known = new Set(['title', 'description', ...snapshot.original.comments.map(({ id }) => `comment:${id}`), ...snapshot.original.acceptance_criteria.map(({ id }) => `criterion:${id}`), ...snapshot.attachments.map(({ id }) => `attachment:${id}`)]);
  const criterionIds = new Set();
  uniqueRecords(snapshot.requirements, 'requirements', (entry) => {
    fields(entry, ['id', 'statement', 'source_refs', 'authority', 'proposed_acceptance_criteria'], 'requirement');
    if (!/^R-(?!000)\d{3}$/u.test(entry.id ?? '') || entry.authority !== 'draft') throw new TypeError('snapshot requirement authority is invalid');
    sanitized(entry.statement, 'requirement.statement');
    sourceReferences(entry.source_refs, known);
    uniqueRecords(entry.proposed_acceptance_criteria, 'proposed acceptance criteria', (criterion) => {
      fields(criterion, ['id', 'statement', 'source_refs', 'status'], 'proposed criterion');
      if (!/^AC-(?!000)\d{3}$/u.test(criterion.id ?? '') || criterion.status !== 'proposed' || criterionIds.has(criterion.id)) throw new TypeError('snapshot acceptance criteria must remain unique and proposed');
      criterionIds.add(criterion.id);
      sanitized(criterion.statement, 'criterion.statement');
      sourceReferences(criterion.source_refs, known);
      return criterion;
    });
    return entry;
  });
  const source = { identity: snapshot.identity, url: snapshot.url, updated_at: snapshot.updated_at, original: snapshot.original, attachments_complete: snapshot.attachments_complete, attachments: snapshot.attachments };
  if (fingerprint(source) !== snapshot.source_hash) throw new TypeError('snapshot source hash is invalid');
  return identity;
}

/** Hydrate an immutable JSON snapshot only after checking its actual file bytes. */
export function readTicketSnapshot(bytes, path) {
  const { body, classification } = readStoredTicket(bytes, path, 'ticket-snapshot');
  const snapshot = { ...body, content_hash: classification.sha256, path };
  checkedSnapshot(snapshot);
  return snapshot;
}

function readStoredTicket(bytes, path, kind) {
  if (!(bytes instanceof Uint8Array)) throw new TypeError('ticket bytes must be Uint8Array');
  const classification = classifyTicketArtifactPath(path);
  if (!classification?.ok || classification.kind !== kind || sha(bytes) !== classification.sha256) throw new TypeError('ticket file hash or path is invalid');
  let body;
  try { body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch { throw new TypeError('ticket file must contain UTF-8 JSON'); }
  record(body, 'ticket body');
  if (Object.hasOwn(body, 'content_hash') || Object.hasOwn(body, 'path')) throw new TypeError('ticket body cannot override file identity');
  if (!encode(body).equals(Buffer.from(bytes))) throw new TypeError('ticket file must use canonical encoding');
  return { body, classification };
}

/** A refresh changes source facts only; accepting behavior still belongs to Spec. */
export function compareTicketSnapshots(previous, next) {
  const before = checkedSnapshot(previous);
  const after = checkedSnapshot(next);
  if (before.hash !== after.hash) throw new TypeError('snapshot identity mismatch');
  if (previous.owner_repository_id !== next.owner_repository_id || previous.change_ref !== next.change_ref) throw new TypeError('snapshot ownership or change mismatch');
  const revisionChanged = previous.revision !== next.revision;
  const contentChanged = previous.source_hash !== next.source_hash;
  return { status: !next.complete ? 'blocked' : revisionChanged || contentChanged ? 'changed' : 'unchanged', revision_changed: revisionChanged, content_changed: contentChanged, requires_spec_review: revisionChanged || contentChanged, approved_behavior_changed: false };
}

function evaluation(input) {
  // Preserve the canonical map/envelope/freshness rules, including MANUAL.
  try {
    record(input, 'validation_evidence');
    portableData(input);
    return evaluateValidationEvidence(input);
  } catch {
    return { ready: false, result: 'FAIL', blockers: [{ code: 'VALIDATION_EVIDENCE_INVALID', message: 'Canonical evidence input is malformed.' }] };
  }
}

function behaviorPolicy(policy, evidence) {
  const failure = (code) => ({ blockers: [code], policy: null });
  if (!object(policy)) return failure('BEHAVIOR_POLICY_REQUIRED');
  const additive = Object.hasOwn(policy, 'behaviors');
  if (additive && Object.hasOwn(policy, 'behavior')) return failure('BEHAVIOR_POLICY_AMBIGUOUS');
  const entries = additive ? policy.behaviors : [policy];
  if (!Array.isArray(entries) || entries.length === 0) return failure('BEHAVIOR_POLICY_REQUIRED');
  const rows = Array.isArray(evidence?.validation_map) ? evidence.validation_map : [];
  const records = Array.isArray(evidence?.decision_coverage?.records) ? evidence.decision_coverage.records : [];
  const accepted = new Set(records.filter((value) => value?.type === 'acceptance-criterion').map(({ id }) => id));
  if (!accepted.size) return failure('BEHAVIOR_AC_SCOPE_INVALID');
  // These are existing canonical validation-map levels, not a second evidence
  // classification. Canonical evaluation still decides execution and freshness.
  const levels = BEHAVIOR_LEVELS;
  const blockers = [];
  const covered = new Set();
  const normalized = [];
  for (const entry of entries) {
    if (!object(entry) || (!Object.hasOwn(levels, entry.behavior) && !['pure-logic', 'documentation'].includes(entry.behavior))) {
      blockers.push('BEHAVIOR_POLICY_REQUIRED');
      continue;
    }
    const refs = Object.hasOwn(entry, 'acceptance_criterion_refs') ? entry.acceptance_criterion_refs : additive ? null : [...accepted];
    if (!Array.isArray(refs) || !refs.length || new Set(refs).size !== refs.length || refs.some((ref) => typeof ref !== 'string' || !accepted.has(ref))) {
      blockers.push('BEHAVIOR_AC_SCOPE_INVALID');
      continue;
    }
    for (const ref of refs) covered.add(ref);
    const value = { behavior: entry.behavior, acceptance_criterion_refs: [...refs] };
    if (Object.hasOwn(levels, entry.behavior)) {
      if (refs.some((ref) => !rows.some((row) => object(row) && row.acceptance_criterion_id === ref && Array.isArray(row.levels) && row.levels.includes(levels[entry.behavior]) && row.evidence_class === 'FULL_E2E' && row.automation === 'automated'))) blockers.push('BEHAVIOR_E2E_REQUIRED');
    } else {
      const exception = entry.exception;
      const decision = records.find((record) => record?.id === exception?.decision_ref && record.type === 'decision' && record.status === 'approved');
      if (!object(exception) || typeof exception.reason !== 'string' || !exception.reason.trim() || !Array.isArray(decision?.downstream_refs) || refs.some((ref) => !decision.downstream_refs.includes(ref))) blockers.push('E2E_EXCEPTION_DECISION_REQUIRED');
      else value.exception = { reason: clean(exception.reason, 'e2e exception reason'), decision_ref: exception.decision_ref };
    }
    normalized.push(value);
  }
  if ([...accepted].some((ref) => !covered.has(ref))) blockers.push('BEHAVIOR_AC_UNCOVERED');
  return { blockers: [...new Set(blockers)], policy: blockers.length ? null : { behaviors: normalized } };
}

function evidenceHash(evidence) {
  // Hash only canonical inputs: unrelated convenience fields cannot weaken proof.
  const { validation_map, coverage_matrix, test_evidence, current, decision_coverage } = evidence;
  return fingerprint({ validation_map, coverage_matrix, test_evidence, current, decision_coverage });
}

function evidenceScopeBlockers(scope, evidence) {
  const blockers = [];
  if (evidence?.test_evidence?.change_ref !== scope.change_ref) blockers.push('EVIDENCE_CHANGE_MISMATCH');
  const approval = evidence?.decision_coverage?.approved_artifact?.metadata;
  if (approval?.owner_repository_id !== scope.owner_repository_id || approval?.change_ref !== scope.change_ref) blockers.push('DECISION_COVERAGE_SCOPE_MISMATCH');
  const records = Array.isArray(evidence?.decision_coverage?.records) ? evidence.decision_coverage.records : [];
  const byId = new Map(records.filter(object).map((value) => [value.id, value]));
  const rows = Array.isArray(evidence?.validation_map) ? evidence.validation_map.filter(object) : [];
  const requirements = new Set(rows.map((row) => row.requirement_id));
  const caseIds = new Set(rows.flatMap((row) => Array.isArray(row.case_ids) ? row.case_ids : []));
  for (const row of rows) {
    const criterion = byId.get(row.acceptance_criterion_id);
    for (const ref of Array.isArray(criterion?.requirement_refs) ? criterion.requirement_refs : []) requirements.add(ref);
    if (row.owner_repository_id != null && row.owner_repository_id !== scope.owner_repository_id) blockers.push('EVIDENCE_REPOSITORY_MISMATCH');
  }
  const cases = Array.isArray(evidence?.test_evidence?.cases) ? evidence.test_evidence.cases.filter((value) => object(value) && caseIds.has(value.case_id)) : [];
  const appliedRuns = new Set(cases.map((value) => value.evidence_run_id));
  for (const evidenceCase of cases) for (const ref of Array.isArray(evidenceCase.requirement_refs) ? evidenceCase.requirement_refs : []) if (byId.get(ref)?.type === 'requirement') requirements.add(ref);
  if ([...requirements].some((ref) => byId.get(ref)?.type !== 'requirement' || byId.get(ref)?.owner_repository_id !== scope.owner_repository_id)) blockers.push('REQUIREMENT_OWNER_MISMATCH');
  const runs = Array.isArray(evidence?.test_evidence?.runs) ? evidence.test_evidence.runs : [];
  if (runs.some((run) => object(run) && appliedRuns.has(run.run_id) && run.repository_id !== scope.owner_repository_id)) blockers.push('EVIDENCE_REPOSITORY_MISMATCH');
  return [...new Set(blockers)];
}

function sourceReference(source, identity, owner, change) {
  fields(source, ['revision', 'source_hash', 'snapshot_hash', 'snapshot_path', 'owner_repository_id', 'change_ref'], 'delivery source');
  exact(source.revision, 'delivery source revision');
  if (!DIGEST.test(source.source_hash ?? '') || !DIGEST.test(source.snapshot_hash ?? '') || source.snapshot_path !== `${identity.directory}/snapshots/${source.snapshot_hash}.json`) throw new TypeError('delivery source snapshot identity or hash is invalid');
  if (source.owner_repository_id !== owner || source.change_ref !== change) throw new TypeError('delivery source ownership or change mismatch');
}

function rawDelivery(value) {
  const { content_hash: _hash, path: _path, ...body } = value;
  return body;
}

function storedBehaviorPolicy(policy) {
  fields(policy, ['behaviors'], 'stored behavior policy');
  if (!array(policy.behaviors, 'stored behaviors').length) throw new TypeError('stored behaviors cannot be empty');
  for (const entry of policy.behaviors) {
    record(entry, 'stored behavior');
    const exception = ['pure-logic', 'documentation'].includes(entry.behavior);
    if (!exception && !Object.hasOwn(BEHAVIOR_LEVELS, entry.behavior)) throw new TypeError('stored behavior is invalid');
    fields(entry, ['behavior', 'acceptance_criterion_refs', ...(exception ? ['exception'] : [])], 'stored behavior');
    const refs = array(entry.acceptance_criterion_refs, 'stored behavior AC refs');
    if (!refs.length || new Set(refs).size !== refs.length || refs.some((ref) => typeof ref !== 'string' || !/^AC-(?!000)\d{3}$/u.test(ref))) throw new TypeError('stored behavior AC refs are invalid');
    if (exception) {
      fields(entry.exception, ['reason', 'decision_ref'], 'stored behavior exception');
      sanitized(entry.exception.reason, 'stored behavior exception reason');
      if (!/^D-(?!000)\d{3}$/u.test(entry.exception.decision_ref ?? '')) throw new TypeError('stored behavior exception decision is invalid');
    }
  }
}

function planCheck(plan) {
  try {
    record(plan, 'plan');
    const raw = rawDelivery(plan);
    const { plan_hash: digest, ...body } = raw;
    const identity = ticketIdentity(plan.identity);
    artifactMetadata(raw, 'ticket-delivery');
    fields(raw, ['schema_version', 'artifact_kind', 'record_type', 'identity', 'delivery_id', 'marker', 'owner', 'owner_repository_id', 'change_ref', 'commit_policy', 'redaction_applied', 'source', 'evidence_hash', 'e2e_policy', 'payload', 'payload_hash', 'implementation_status', 'plan_hash'], 'delivery plan');
    if (raw.record_type !== 'plan' || !['PASS', 'MANUAL'].includes(plan.implementation_status) || stableJson(plan.identity) !== stableJson(identity.value)) return false;
    if (!DIGEST.test(digest ?? '') || fingerprint(body) !== digest || fingerprint(plan.payload) !== plan.payload_hash || !DIGEST.test(plan.evidence_hash ?? '')) return false;
    if ((Object.hasOwn(plan, 'content_hash') || Object.hasOwn(plan, 'path')) && (plan.content_hash !== fingerprint(raw) || plan.path !== `${identity.directory}/delivery/${plan.content_hash}.json`)) return false;
    if (!SEGMENT.test(plan.delivery_id ?? '') || plan.marker !== `<!-- sdcorejs-delivery:${fingerprint({ identity: identity.value, delivery_id: plan.delivery_id })} -->`) return false;
    fields(plan.payload, ['operation', 'body'], 'delivery payload');
    if (plan.payload?.operation !== 'comment' || typeof plan.payload.body !== 'string' || plan.payload.body.split(plan.marker).length !== 2) return false;
    sanitized(plan.payload.body, 'delivery payload');
    storedBehaviorPolicy(plan.e2e_policy);
    sourceReference(plan.source, identity, plan.owner_repository_id, plan.change_ref);
    return true;
  } catch { return false; }
}

/** Verify stored plans/receipts; current execution and source freshness remain host gates. */
export function readTicketDelivery(bytes, path) {
  const { body, classification } = readStoredTicket(bytes, path, 'ticket-delivery');
  const identity = ticketIdentity(body.identity);
  if (classification.identity_hash !== identity.hash || stableJson(body.identity) !== stableJson(identity.value)) throw new TypeError('delivery file identity does not match its directory');
  artifactMetadata(body, 'ticket-delivery');
  sourceReference(body.source, identity, body.owner_repository_id, body.change_ref);
  if (body.record_type === 'plan') {
    if (!planCheck(body)) throw new TypeError('delivery plan integrity is invalid');
  } else {
    fields(body, ['schema_version', 'artifact_kind', 'record_type', 'owner', 'owner_repository_id', 'change_ref', 'commit_policy', 'redaction_applied', 'identity', 'delivery_id', 'plan_hash', 'payload_hash', 'evidence_hash', 'source', 'implementation_status', 'remote_sync_status', 'remote_id', 'remote_revision', 'verified_at', 'plan', 'readback', 'write_result'], 'delivery receipt');
    if (body.record_type !== 'receipt' || !planCheck(body.plan) || Object.hasOwn(body.plan, 'content_hash') || Object.hasOwn(body.plan, 'path')) throw new TypeError('delivery receipt plan is invalid');
    for (const key of ['owner_repository_id', 'change_ref', 'identity', 'delivery_id', 'plan_hash', 'payload_hash', 'evidence_hash', 'source', 'implementation_status']) if (stableJson(body[key]) !== stableJson(body.plan[key])) throw new TypeError('delivery receipt contradicts its exact plan');
    if (body.remote_sync_status !== 'verified') throw new TypeError('delivery receipt sync is not verified');
    exact(body.remote_id, 'receipt remote id');
    exact(body.remote_revision, 'receipt remote revision');
    timestamp(body.verified_at, 'receipt verified_at');
    fields(body.readback, ['identity', 'revision', 'remote_id', 'payload_hash'], 'receipt readback');
    fields(body.write_result, ['previous_revision', 'revision', 'payload_hash', 'remote_id'], 'receipt write result');
    if (stableJson(body.readback.identity) !== stableJson(body.identity) || body.readback.revision !== body.remote_revision || body.readback.remote_id !== body.remote_id || body.readback.payload_hash !== body.payload_hash || body.write_result.previous_revision !== body.source.revision || body.write_result.revision !== body.remote_revision || body.write_result.remote_id !== body.remote_id || body.write_result.payload_hash !== body.payload_hash) throw new TypeError('delivery receipt readback or write version is inconsistent');
  }
  return { ...body, content_hash: classification.sha256, path };
}

/** Prepare an append-only delivery comment; this result grants no write authority. */
export function createTicketUpdatePlan(input) {
  record(input, 'delivery');
  const result = evaluation(input.validation_evidence);
  const policy = behaviorPolicy(input.e2e_policy, input.validation_evidence);
  const scopeBlockers = evidenceScopeBlockers(input.snapshot, input.validation_evidence);
  const blockers = [...result.blockers.map(({ code }) => code), ...policy.blockers, ...scopeBlockers];
  const identity = checkedSnapshot(input.snapshot);
  const refresh = compareTicketSnapshots(input.snapshot, input.latest_snapshot);
  if (!input.snapshot.complete || !input.latest_snapshot.complete) blockers.push('SNAPSHOT_INCOMPLETE');
  if (refresh.status !== 'unchanged') blockers.push('SOURCE_CHANGED');
  if (blockers.length) return { status: 'blocked', implementation_status: scopeBlockers.length ? 'FAIL' : result.result, remote_sync_status: 'not-requested', blockers: [...new Set(blockers)], plan: null };
  const deliveryId = exact(input.delivery_id, 'delivery_id');
  if (!SEGMENT.test(deliveryId)) throw new TypeError('delivery_id must be a stable lowercase segment');
  const summary = clean(input.summary, 'summary');
  if (summary.includes('sdcorejs-delivery:')) throw new TypeError('summary cannot contain delivery markers');
  const marker = `<!-- sdcorejs-delivery:${fingerprint({ identity: identity.value, delivery_id: deliveryId })} -->`;
  const trace = input.validation_evidence.validation_map.map((row) => `${row.requirement_id} / ${row.acceptance_criterion_id}: ${row.case_ids.join(', ')} [${row.evidence_class}]`).join('\n');
  const visualTrace = (result.ui_handoff ?? []).map(sample => {
    const ref = exact(sample.evidence_ref, 'UI evidence reference');
    const hosted = /^https?:\/\//iu.test(ref);
    if (!hosted && /https?:\/\//iu.test(ref)) throw new TypeError('UI evidence link must be a standalone URL');
    const evidenceRef = hosted ? safeUrl(ref, 'UI evidence reference') : ref;
    const routePath = ticketRoutePath(sample.route);
    return clean(
      `- ${sample.screen} (${routePath}, ${sample.device}, ${sample.state}, ${sample.content_width_css_px} CSS px) — ${sample.result} (${evidenceRef})`,
      'UI handoff evidence',
    );
  }).join('\n');
  if (visualTrace.includes('sdcorejs-delivery:')) throw new TypeError('UI handoff evidence cannot contain delivery markers');
  const visualEvidence = visualTrace ? `\n\nUI handoff evidence\n${visualTrace}` : '';
  const payload = { operation: 'comment', body: `${marker}\n${summary}\n\nImplementation evidence: ${result.result}\nSource snapshot: ${input.snapshot.path}\nSource revision: ${input.snapshot.revision}\nCode: ${clean(input.validation_evidence.current.associated_HEAD_or_diff, 'current code')}\n${trace}${visualEvidence}` };
  const body = {
    schema_version: 1, artifact_kind: 'ticket-delivery', record_type: 'plan', identity: identity.value, delivery_id: deliveryId, marker,
    owner: 'sdcorejs-product', owner_repository_id: input.snapshot.owner_repository_id, change_ref: input.snapshot.change_ref, commit_policy: 'with-change', redaction_applied: true,
    source: { revision: input.snapshot.revision, source_hash: input.snapshot.source_hash, snapshot_hash: input.snapshot.content_hash, snapshot_path: input.snapshot.path, owner_repository_id: input.snapshot.owner_repository_id, change_ref: input.snapshot.change_ref },
    evidence_hash: evidenceHash(input.validation_evidence), e2e_policy: policy.policy,
    payload, payload_hash: fingerprint(payload), implementation_status: result.result,
  };
  const plan = { ...body, plan_hash: fingerprint(body) };
  return { status: 'ready', implementation_status: result.result, remote_sync_status: 'pending', blockers: [], plan, files: [fileBundle(identity.directory, 'delivery', 'ticket-delivery', plan).file] };
}

function matchingUpdates(updates, plan) {
  return array(updates, 'updates').map((update) => {
    record(update, 'update');
    return { id: exact(update.id, 'update.id'), body: string(update.body, 'update.body', { empty: true }) };
  }).filter(({ body }) => body.includes(plan.marker));
}

function currentEvidence(plan, evidence) {
  const result = evaluation(evidence);
  const scopeBlockers = evidenceScopeBlockers(plan, evidence);
  const blockers = [...result.blockers.map(({ code }) => code), ...behaviorPolicy(plan.e2e_policy, evidence).blockers, ...scopeBlockers];
  if (result.ready && evidenceHash(evidence) !== plan.evidence_hash) blockers.push('EVIDENCE_CHANGED');
  return { result: scopeBlockers.length ? { ...result, ready: false, result: 'FAIL' } : result, blockers };
}

/** Re-run immediately before a connector write and use source.revision as If-Match. */
export function verifyTicketUpdatePreconditions(input) {
  if (!object(input) || !planCheck(input.plan)) return { status: 'blocked', blockers: ['PLAN_INTEGRITY_INVALID'] };
  const { plan, authorization } = input;
  const { result, blockers } = currentEvidence(plan, input.validation_evidence);
  if (!object(authorization) || !['explicit-user', 'session-delegation'].includes(authorization.source) || typeof authorization.reference !== 'string' || !authorization.reference.trim() || authorization.plan_hash !== plan.plan_hash || authorization.payload_hash !== plan.payload_hash) blockers.push('WRITE_AUTHORIZATION_REQUIRED');
  let matches = [];
  try { matches = matchingUpdates(input.existing_updates, plan); } catch { blockers.push('REMOTE_UPDATES_INVALID'); }
  if (blockers.length) return { status: 'blocked', implementation_status: result.result, remote_sync_status: 'pending', blockers };
  if (matches.length > 1 || (matches.length === 1 && matches[0].body !== plan.payload.body)) return { status: 'conflict', implementation_status: result.result, remote_sync_status: 'conflict', blockers: ['MANAGED_COMMENT_CONFLICT'] };
  // An exact prior write can be reused even when that write advanced the tracker
  // revision. It grants no permission to write again; read-back is still required.
  if (matches.length === 1) return { status: 'already-applied', implementation_status: result.result, remote_sync_status: 'readback-required', remote_id: matches[0].id, blockers: [] };
  try {
    const identity = checkedSnapshot(input.latest_snapshot);
    if (identity.hash !== ticketIdentity(plan.identity).hash || !input.latest_snapshot.complete || input.latest_snapshot.revision !== plan.source.revision || input.latest_snapshot.source_hash !== plan.source.source_hash || input.latest_snapshot.owner_repository_id !== plan.owner_repository_id || input.latest_snapshot.change_ref !== plan.change_ref) blockers.push('SOURCE_CHANGED');
  } catch { blockers.push('SOURCE_REFRESH_INVALID'); }
  return { status: blockers.length ? 'blocked' : 'ready', implementation_status: result.result, remote_sync_status: 'pending', blockers, ...(blockers.length ? {} : { expected_revision: plan.source.revision, payload: structuredClone(plan.payload), payload_hash: plan.payload_hash }) };
}

/** Read-back, never a connector success flag, produces the immutable receipt. */
export function verifyTicketUpdateReadback(input) {
  if (!object(input) || !planCheck(input.plan)) return { verified: false, implementation_status: 'FAIL', remote_sync_status: 'unverified', blockers: ['PLAN_INTEGRITY_INVALID'], receipt: null, files: [] };
  const { plan } = input;
  const { result, blockers } = currentEvidence(plan, input.validation_evidence);
  let match = null;
  let remoteStatus = 'unverified';
  try {
    const readback = record(input.readback, 'readback');
    if (ticketIdentity(readback.identity).hash !== ticketIdentity(plan.identity).hash) throw new TypeError('target identity mismatch');
    exact(readback.revision, 'readback.revision');
    const matches = matchingUpdates(readback.updates, plan);
    if (matches.length === 1 && matches[0].body === plan.payload.body) { match = matches[0]; remoteStatus = 'verified'; }
    else if (matches.length > 0) remoteStatus = 'conflict';
  } catch { blockers.push('READBACK_INVALID'); }
  if (!match) blockers.push('READBACK_PAYLOAD_MISMATCH');
  const write = input.write_result;
  if (!object(write) || write.previous_revision !== plan.source.revision || write.revision !== input.readback?.revision || write.payload_hash !== plan.payload_hash || write.remote_id !== match?.id) blockers.push('WRITE_VERSION_UNVERIFIED');
  if (blockers.length) return { verified: false, implementation_status: result.result, remote_sync_status: remoteStatus, blockers, receipt: null, files: [] };
  const body = {
    schema_version: 1, artifact_kind: 'ticket-delivery', record_type: 'receipt', owner: 'sdcorejs-product', owner_repository_id: plan.owner_repository_id, change_ref: plan.change_ref, commit_policy: 'with-change', redaction_applied: true,
    identity: plan.identity, delivery_id: plan.delivery_id, plan_hash: plan.plan_hash, payload_hash: plan.payload_hash, evidence_hash: plan.evidence_hash,
    source: plan.source, implementation_status: result.result, remote_sync_status: 'verified', remote_id: match.id, remote_revision: input.readback.revision,
    verified_at: timestamp(input.verified_at, 'verified_at'),
    plan: structuredClone(rawDelivery(plan)),
    readback: { identity: structuredClone(plan.identity), revision: input.readback.revision, remote_id: match.id, payload_hash: plan.payload_hash },
    write_result: { previous_revision: write.previous_revision, revision: write.revision, payload_hash: write.payload_hash, remote_id: write.remote_id },
  };
  const bundle = fileBundle(ticketIdentity(plan.identity).directory, 'delivery', 'ticket-delivery', body);
  readTicketDelivery(bundle.file.bytes, bundle.file.path);
  return { verified: true, implementation_status: result.result, remote_sync_status: 'verified', blockers: [], receipt: bundle.artifact, files: [bundle.file] };
}
