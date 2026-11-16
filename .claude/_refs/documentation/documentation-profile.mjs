import { createHash } from 'node:crypto';

const AUDIENCES = new Set(['end-user', 'admin', 'operator', 'support', 'developer', 'maintainer', 'api-consumer']);
const TECHNICAL_AUDIENCES = new Set(['developer', 'maintainer', 'api-consumer']);
const SCOPE_SECTIONS = {
  module: ['purpose', 'capabilities'],
  entity: ['records', 'fields'],
  feature: ['goal', 'behavior'],
  task: ['goal', 'steps', 'outcome'],
  role: ['responsibilities', 'allowed-tasks'],
  state: ['states', 'transitions'],
  journey: ['goal', 'journey-steps', 'handoffs'],
};
const EVIDENCE_KEYS = ['modules', 'entities', 'features', 'tasks', 'roles', 'states', 'journeys', 'apis', 'ui_states', 'frameworks'];
const ID = /^[a-z][a-z0-9-]{0,63}$/;
const HASH = /^sha256:[a-f0-9]{64}$/;
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const stringList = value => Array.isArray(value) && value.length > 0 && value.every(nonempty);

/** Select an outline from inspected evidence. No filesystem, discovery or write authority. */
export function selectDocumentationProfile({ audience, requested_scope = null, evidence = {} } = {}) {
  if (!AUDIENCES.has(audience)) throw new TypeError('Unsupported documentation audience');
  if (requested_scope !== null && !Object.hasOwn(SCOPE_SECTIONS, requested_scope)) {
    throw new TypeError('Unsupported documentation scope');
  }
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) {
    throw new TypeError('Documentation evidence must be an object');
  }
  const facts = {};
  for (const key of Object.keys(evidence)) {
    if (!EVIDENCE_KEYS.includes(key)) throw new TypeError(`Unknown documentation evidence: ${key}`);
  }
  for (const key of EVIDENCE_KEYS) {
    const entries = evidence[key] ?? [];
    if (!Array.isArray(entries)) throw new TypeError(`${key} evidence must be an array`);
    for (const entry of entries) {
      if (!entry || !nonempty(entry.id) || !stringList(entry.source_refs)) {
        throw new TypeError(`${key} evidence requires id and nonempty source_refs`);
      }
      for (const field of ['steps', 'transitions']) {
        if (Object.hasOwn(entry, field) && !stringList(entry[field])) {
          throw new TypeError(`${key}.${field} must contain source-backed identifiers`);
        }
      }
    }
    facts[key] = entries;
  }
  const predicates = {
    module: facts.modules.length > 0,
    entity: facts.entities.length > 0,
    feature: facts.features.length > 0 || facts.apis.length > 0,
    task: facts.tasks.length > 0,
    role: facts.roles.length > 0,
    state: facts.states.some(entry => entry.transitions?.length > 0),
    journey: facts.journeys.some(entry => entry.steps?.length >= 2),
  };
  const priority = ['journey', ...(['admin', 'operator', 'support'].includes(audience) ? ['role'] : []),
    'state', 'task', 'feature', 'entity', 'module', 'role'];
  const scope = requested_scope
    ? (predicates[requested_scope] ? requested_scope : null)
    : priority.find(candidate => predicates[candidate]) ?? null;
  const technical = TECHNICAL_AUDIENCES.has(audience);
  const sections = scope ? ['overview', ...SCOPE_SECTIONS[scope]] : [];
  if (scope && technical) {
    sections.push('contracts', 'verification');
    if (facts.apis.length) sections.push('authentication', 'endpoints', 'requests-responses', 'errors');
    if (facts.frameworks.length) sections.push('framework-inventory');
  } else if (scope) {
    if (facts.roles.length) sections.push('access-and-permissions');
    if (facts.ui_states.length) sections.push('verified-ui-evidence');
  }
  return {
    status: scope ? 'selected' : 'blocked',
    documentation_profile_version: 1,
    documentation_scope: scope,
    documentation_audience: audience,
    mode: technical ? 'write-technical-doc' : 'write-user-guide',
    sections,
    predicates,
    evidence_refs: [...new Set(EVIDENCE_KEYS.flatMap(key => facts[key].flatMap(entry => entry.source_refs)))].sort(),
    reasons: scope
      ? [`${requested_scope ? 'Requested' : 'Selected'} ${scope} scope is supported by inspected evidence.`]
      : [requested_scope ? `Requested ${requested_scope} scope lacks supporting evidence.` : 'No supported documentation scope has inspected evidence.'],
  };
}

export function hashDocumentationContent(content) {
  if (typeof content !== 'string') throw new TypeError('Documentation content must be a string');
  return `sha256:${createHash('sha256').update(content, 'utf8').digest('hex')}`;
}

const SPEC_IDENTITY_FIELDS = ['repository_id', 'artifact_id', 'contract_id', 'change_ref',
  'source_revision', 'repository_relative_path', 'approval_hash'];
const COVERAGE_LIFECYCLES = new Set(['active', 'superseded', 'deferred', 'retired']);
const coverageScopeKey = source => JSON.stringify([source.repository_id, source.contract_id]);
function specIdentityKey(identity) {
  if (!identity || !SPEC_IDENTITY_FIELDS.every(field => nonempty(identity[field]))
    || !/^[a-f0-9]{40}$/.test(identity.source_revision)
    || !/^sha256:v1:[a-f0-9]{64}$/.test(identity.approval_hash)) {
    throw new TypeError('Coverage spec identity requires canonical source revision and approval hash');
  }
  return JSON.stringify(SPEC_IDENTITY_FIELDS.map(field => identity[field]));
}

/** Consume trusted host verification receipts; never infer approval from document labels. */
export function selectDocumentationCoverage({ sources = [], verified_current_specs = [] } = {}) {
  if (!Array.isArray(sources) || !Array.isArray(verified_current_specs)) {
    throw new TypeError('Coverage sources and verified current specs must be arrays');
  }
  const accepted = [], proposals = [], provenance = [], excluded = [], conflicts = [], gaps = [];
  const receipts = new Map(), blockedScopes = new Set(), seenSources = new Map(), matchedScopes = new Set();
  const conflict = (kind, scope, sourceIds, reason, criterionId = null) => {
    conflicts.push({ kind, repository_id: scope.repository_id, contract_id: scope.contract_id,
      criterion_id: criterionId, source_ids: [...sourceIds], reason });
  };
  for (const receipt of verified_current_specs) {
    if (receipt?.authority_verified !== true || !stringList(receipt.verification_refs)) {
      gaps.push('Current spec authority lacks trusted host verification evidence.');
      continue;
    }
    specIdentityKey(receipt.identity);
    if (!HASH.test(receipt.content_hash ?? '') || !HASH.test(receipt.criteria_hash ?? '')) {
      gaps.push('Current spec verification lacks exact content/extraction hash binding.');
      continue;
    }
    const key = coverageScopeKey(receipt.identity);
    if (receipts.has(key)) {
      blockedScopes.add(key);
      conflict('current-spec-identity', receipt.identity, [], 'Duplicate or competing current spec receipts for one repository/contract.');
    } else receipts.set(key, receipt);
  }
  const verifiedSources = new Set();
  for (const source of sources) {
    if (!source || !['source_id', 'repository_id', 'contract_id', 'source_ref'].every(field => nonempty(source[field]))
      || !['spec', 'prd', 'requirement', 'observation'].includes(source.kind)
      || !COVERAGE_LIFECYCLES.has(source.lifecycle) || typeof source.content !== 'string'
      || !Array.isArray(source.criteria)) {
      throw new TypeError('Coverage sources require stable identity, kind, lifecycle, content and criteria');
    }
    const scopeKey = coverageScopeKey(source);
    if (seenSources.has(source.source_id)) {
      blockedScopes.add(scopeKey);
      blockedScopes.add(coverageScopeKey(seenSources.get(source.source_id)));
      conflict('duplicate-source', source, [source.source_id], 'Duplicate coverage source_id.');
    }
    seenSources.set(source.source_id, source);
    for (const criterion of source.criteria) {
      if (!criterion || !/^AC-[0-9]{3}$/.test(criterion.id ?? '') || !nonempty(criterion.text)
        || !['accepted', 'proposed', 'rejected'].includes(criterion.status)
        || !COVERAGE_LIFECYCLES.has(criterion.lifecycle)) {
        throw new TypeError('Coverage criteria require canonical AC IDs, text, explicit status and lifecycle');
      }
    }
    if (source.kind !== 'spec' || source.lifecycle !== 'active') continue;
    const identity = specIdentityKey(source.identity);
    if (source.repository_id !== source.identity.repository_id || source.contract_id !== source.identity.contract_id
      || source.source_ref !== source.identity.repository_relative_path) {
      blockedScopes.add(scopeKey);
      conflict('source-identity', source, [source.source_id], 'Source scope/path disagrees with its spec identity.');
      continue;
    }
    const receipt = receipts.get(scopeKey);
    if (!receipt || identity !== specIdentityKey(receipt.identity)) continue;
    matchedScopes.add(scopeKey);
    if (hashDocumentationContent(source.content) !== receipt.content_hash
      || hashDocumentationContent(JSON.stringify(source.criteria)) !== receipt.criteria_hash) {
      blockedScopes.add(scopeKey);
      conflict('stale-verification', source, [source.source_id], 'Current spec bytes or verified criterion extraction changed.');
    } else verifiedSources.add(source);
  }
  for (const [key] of receipts) {
    if (!matchedScopes.has(key) && !blockedScopes.has(key)) gaps.push('A verified current approved spec source is unavailable.');
  }
  if (receipts.size === 0) gaps.push('No verified current approved spec is available for requirement coverage.');

  const occurrences = new Map();
  for (const source of sources) {
    const scopeKey = coverageScopeKey(source);
    const authoritative = verifiedSources.has(source) && !blockedScopes.has(scopeKey);
    const seenCriteria = new Set();
    for (const criterion of source.criteria) {
      const entry = { ...criterion, source_id: source.source_id, source_kind: source.kind,
        repository_id: source.repository_id, contract_id: source.contract_id, source_ref: source.source_ref,
        source_content_hash: hashDocumentationContent(source.content),
        identity: source.identity ? structuredClone(source.identity) : null };
      provenance.push({ ...entry, authority: authoritative ? 'verified-current-spec' : 'supporting-source' });
      if (source.lifecycle !== 'active' || criterion.lifecycle !== 'active' || criterion.status === 'rejected') {
        excluded.push({ ...entry, reason: source.lifecycle !== 'active' ? `Source is ${source.lifecycle}.` : 'Criterion is inactive or rejected.' });
        continue;
      }
      const key = JSON.stringify([source.repository_id, source.contract_id, criterion.id]);
      if (seenCriteria.has(criterion.id)) {
        conflict('duplicate-criterion-id', source, [source.source_id], 'A source repeats the same active AC ID.', criterion.id);
      }
      seenCriteria.add(criterion.id);
      if (!occurrences.has(key)) occurrences.set(key, []);
      occurrences.get(key).push(entry);
      if (authoritative && criterion.status === 'accepted') accepted.push(entry);
      else proposals.push({ ...entry, claimed_status: criterion.status, status: 'proposed',
        reason: authoritative ? 'Not accepted in the current approved spec.' : 'Supporting sources cannot approve criteria.' });
    }
  }
  const conflictingIds = new Set();
  for (const [key, entries] of occurrences) {
    if (new Set(entries.map(entry => entry.text)).size > 1) {
      conflict('criterion-meaning', entries[0], entries.map(entry => entry.source_id), 'The same stable AC ID has conflicting source statements.', entries[0].id);
    }
    if (entries.filter(entry => accepted.includes(entry)).length > 1) conflictingIds.add(key);
  }
  const accepted_criteria = accepted.filter(entry => !conflictingIds.has(JSON.stringify([entry.repository_id, entry.contract_id, entry.id])));
  if (!gaps.length && !conflicts.length && accepted_criteria.length === 0) gaps.push('The verified current spec has no active accepted criteria.');
  const status = conflicts.length ? 'conflict' : gaps.length ? 'gap' : 'selected';
  return { status, accepted_criteria, proposals, provenance, excluded, conflicts, gaps,
    coverage_total: status === 'selected' ? accepted_criteria.length : null };
}

// Reserved markers must occupy entire lines. Reject ambiguity, including damaged
// markers, instead of guessing where human-owned content starts or ends.
function parseManagedBlocks(document) {
  const blocks = new Map();
  let open = null;
  let offset = 0;
  for (const line of document.match(/[^\n]*(?:\n|$)/g) ?? []) {
    if (line.includes('sdcorejs:managed')) {
      const marker = /^<!-- sdcorejs:managed:([a-z][a-z0-9-]{0,63}):(start|end) -->$/.exec(line.replace(/\r?\n$/, ''));
      if (!marker) throw new Error('Malformed managed marker');
      const [, id, kind] = marker;
      if (kind === 'start') {
        if (open || blocks.has(id)) throw new Error('Nested or duplicate managed marker');
        if (!line.endsWith('\n')) throw new Error('Managed start marker must end with a newline');
        open = { id, bodyStart: offset + line.length, eol: line.endsWith('\r\n') ? '\r\n' : '\n' };
      } else {
        if (!open || open.id !== id) throw new Error('Unmatched managed end marker');
        blocks.set(id, { ...open, bodyEnd: offset, content: document.slice(open.bodyStart, offset) });
        open = null;
      }
    }
    offset += line.length;
  }
  if (open) throw new Error('Unclosed managed marker');
  return blocks;
}

/** Project guide bodies without carrying source ownership markers into an aggregate. */
export function stripDocumentationManagedMarkers(document) {
  if (typeof document !== 'string') throw new TypeError('Documentation content must be a string');
  parseManagedBlocks(document);
  return document.replace(/^<!-- sdcorejs:managed:[a-z][a-z0-9-]{0,63}:(?:start|end) -->(?:\r?\n|$)/gm, '');
}

/** Pure plan only: the host must compare current bytes again before an authorized atomic write. */
export function planDocumentationUpdate({
  existing = null,
  generated,
  blocks,
  expected_content_hash,
  generated_ownership,
} = {}) {
  if (existing !== null && typeof existing !== 'string') throw new TypeError('Existing documentation must be a string or null');
  const beforeHash = existing === null ? null : hashDocumentationContent(existing);
  const result = (status, content, reasons = [], proposal = null) => ({
    status, changed: status === 'created' || status === 'updated', content,
    previous_content_hash: beforeHash,
    content_hash: content === null ? null : hashDocumentationContent(content), reasons, proposal,
  });
  const conflict = reason => result('conflict', existing, [reason]);
  if ((generated !== undefined) === (blocks !== undefined)) {
    return conflict('Provide exactly one generated document or managed-block update list.');
  }
  let existingBlocks;
  try {
    existingBlocks = parseManagedBlocks(existing ?? '');
    if (generated !== undefined) {
      if (typeof generated !== 'string') return conflict('Generated documentation must be a string.');
      parseManagedBlocks(generated);
    } else {
      if (!Array.isArray(blocks) || blocks.length === 0) return conflict('Managed-block updates must be a nonempty array.');
      const seen = new Set();
      for (const block of blocks) {
        if (!block || typeof block.id !== 'string' || !ID.test(block.id) || typeof block.content !== 'string' || seen.has(block.id)) {
          return conflict('Managed-block updates require unique valid ids and string content.');
        }
        if (block.content.includes('sdcorejs:managed')) return conflict('Replacement content must not contain managed markers.');
        seen.add(block.id);
      }
    }
  } catch (error) {
    return conflict(error.message);
  }
  if (existing === null) {
    return generated === undefined
      ? conflict('A new document requires complete generated content.')
      : result('created', generated);
  }
  if (!HASH.test(expected_content_hash ?? '') || expected_content_hash !== beforeHash) {
    return conflict('Current document hash is missing or stale; re-read before proposing an update.');
  }
  if (generated_ownership !== undefined) {
    if (generated === undefined || generated_ownership?.owner !== 'sdcorejs-documentation'
      || generated_ownership.content_hash !== beforeHash) {
      return conflict('Generated ownership must bind the exact previously generated document bytes.');
    }
    return result(generated === existing ? 'unchanged' : 'updated', generated);
  }
  if (generated !== undefined || existingBlocks.size === 0) {
    return result('proposal', existing, ['Preserve existing human content; review a scoped patch or establish explicit generated ownership.'],
      generated !== undefined ? { generated } : { blocks: blocks.map(block => ({ ...block })) });
  }
  const replacements = [];
  for (const block of blocks) {
    const target = existingBlocks.get(block.id);
    if (!target) return conflict(`Managed block ${block.id} does not exist; do not append or guess ownership.`);
    if (!HASH.test(block.expected_hash ?? '') || block.expected_hash !== hashDocumentationContent(target.content)) {
      return conflict(`Managed block ${block.id} changed or lacks its previously generated content hash.`);
    }
    let body = block.content.replace(/\r\n|\n/g, target.eol);
    if (body && !body.endsWith(target.eol)) body += target.eol;
    replacements.push({ ...target, body });
  }
  let content = existing;
  for (const replacement of replacements.sort((a, b) => b.bodyStart - a.bodyStart)) {
    content = content.slice(0, replacement.bodyStart) + replacement.body + content.slice(replacement.bodyEnd);
  }
  return result(content === existing ? 'unchanged' : 'updated', content);
}
