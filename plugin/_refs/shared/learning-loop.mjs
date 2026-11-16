import { createHash } from 'node:crypto';
import { resolveExploreWriteAuthority } from './explore-contract.mjs';

const DIMENSIONS = ['tracks', 'modules', 'boundaries', 'paths', 'keywords'];
const isText = value => typeof value === 'string' && value.trim() !== '';
const isMapping = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isHash = value => typeof value === 'string' && /^[a-f0-9]{64}$/u.test(value);
const isRelative = value => isText(value) && !/[\\:\u0000-\u001f]/u.test(value) && !value.startsWith('/') && value.split('/').every(part => part !== '' && part !== '.' && part !== '..');
const isRepository = value => isText(value) && /^[a-z0-9.-]+\/[a-z0-9._-]+\/[a-z0-9._/-]+$/iu.test(value) && !value.split('/').includes('..');
const uniqueSorted = values => [...new Set(Array.isArray(values) ? values : [])].sort();
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (isMapping(value)) return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
const hash = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');

/** Stable semantic identity excludes timestamps, source revisions and retrieval tags. */
export function lessonIdentity(document = {}) {
  return `lesson-${hash({ repository: document.owner_repository_id, concept: document.concept_id,
    applicability: Object.fromEntries(DIMENSIONS.filter(key => key !== 'keywords').map(key => [key, uniqueSorted(document.applicability?.[key])])),
  })}`;
}

function contentHash(document) {
  const normalized = structuredClone(document);
  normalized.applicability = Object.fromEntries(DIMENSIONS.map(key => [key, uniqueSorted(document.applicability?.[key])]));
  normalized.source_fingerprints.sort((a, b) => a.path.localeCompare(b.path));
  normalized.regression_protection.paths = uniqueSorted(normalized.regression_protection.paths);
  return hash(normalized);
}

export function validateLesson(document) {
  const errors = [];
  if (!isMapping(document)) return { ok: false, errors: ['lesson must be a mapping'] };
  if (document.schema_version !== 1 || document.artifact_kind !== 'memory') errors.push('verified lessons use schema_version 1 and artifact_kind memory');
  if (document.owner !== 'sdcorejs-explore') errors.push('owner must be sdcorejs-explore');
  if (!isRepository(document.owner_repository_id)) errors.push('owner_repository_id must be a stable repository identity');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(document.track ?? '')) errors.push('track must be a safe path segment');
  if (!isText(document.concept_id) || !/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/u.test(document.concept_id)) errors.push('concept_id must be a stable lowercase dotted or kebab-case identifier');
  for (const key of ['problem', 'root_cause', 'resolution', 'source_revision']) if (!isText(document[key])) errors.push(`${key} is required`);
  if (document.redaction_applied !== true) errors.push('redaction_applied must be true');
  if (document.lesson_id !== lessonIdentity(document)) errors.push('lesson_id must match semantic identity');
  if (document.artifact_id !== `memory-${document.lesson_id}`) errors.push('artifact_id must match lesson_id');
  const applicability = document.applicability;
  if (!isMapping(applicability)) errors.push('applicability must be a mapping');
  else for (const key of Object.keys(applicability)) if (!DIMENSIONS.includes(key)) errors.push(`unknown applicability dimension: ${key}`);
  for (const key of DIMENSIONS) {
    if (!Array.isArray(applicability?.[key]) || applicability[key].some(value => !isText(value))) errors.push(`applicability.${key} must be an array of non-empty strings`);
  }
  if (!DIMENSIONS.some(key => Array.isArray(applicability?.[key]) && applicability[key].length)) errors.push('applicability needs at least one explicit scope');
  for (const item of Array.isArray(applicability?.paths) ? applicability.paths : []) if (!isRelative(item)) errors.push('applicability paths must be repository-relative');
  if (!isText(document.regression_protection?.description) || !Array.isArray(document.regression_protection?.paths) || document.regression_protection.paths.length === 0 || document.regression_protection.paths.some(item => !isRelative(item))) errors.push('regression_protection requires a description and repository-relative test/check paths');
  const fingerprints = document.source_fingerprints;
  if (!Array.isArray(fingerprints) || fingerprints.length === 0) errors.push('source_fingerprints must contain relevant current sources');
  const seen = new Set();
  for (const entry of Array.isArray(fingerprints) ? fingerprints : []) {
    if (!isRelative(entry?.path) || !isHash(entry?.sha256)) errors.push('source fingerprint requires a repository-relative path and sha256');
    if (seen.has(entry?.path)) errors.push('duplicate source fingerprint path');
    seen.add(entry?.path);
  }
  for (const relative of Array.isArray(document.regression_protection?.paths) ? document.regression_protection.paths : []) {
    if (!seen.has(relative)) errors.push(`regression protection requires a source fingerprint: ${relative}`);
  }
  const verification = document.verification;
  if (verification?.result !== 'PASSED') errors.push('verification must have result PASSED');
  if (!isText(verification?.command) || !(verification?.cwd === '.' || isRelative(verification?.cwd))) errors.push('verification requires the actual command and repository-relative cwd');
  if (verification?.source_revision !== document.source_revision) errors.push('verification source_revision must match the lesson source_revision');
  if (!isRelative(verification?.proof?.path) || !isHash(verification?.proof?.sha256)) errors.push('verification requires a sanitized proof path and sha256');
  const proposal = document.proposed_convention;
  if (proposal != null && (!isMapping(proposal) || proposal.status !== 'proposed' || !isText(proposal.rule_id) || !isText(proposal.rationale))) errors.push('proposed_convention must remain a proposed candidate with rule_id and rationale');
  return { ok: errors.length === 0, errors };
}

/** Caller hashes current files; absent evidence is unknown, never fresh. */
export function evaluateLessonFreshness(document, { source_hashes: sources = {}, conflicting_paths: conflicts = [] } = {}) {
  const validation = validateLesson(document);
  if (!validation.ok) return { status: 'invalid', reasons: validation.errors };
  if (!isMapping(sources) || !Array.isArray(conflicts)) return { status: 'unknown', reasons: ['current source/proof hashes and conflict paths are malformed'] };
  const expected = [...document.source_fingerprints, document.verification.proof];
  const conflicting = expected.filter(entry => conflicts.includes(entry.path)).map(entry => entry.path);
  if (conflicting.length) return { status: 'conflicting', reasons: conflicting };
  const stale = expected.filter(entry => isHash(sources[entry.path]) && sources[entry.path] !== entry.sha256).map(entry => entry.path);
  if (stale.length) return { status: 'stale', reasons: stale };
  const unknown = expected.filter(entry => !Object.hasOwn(sources, entry.path) || !isHash(sources[entry.path])).map(entry => entry.path);
  return { status: unknown.length ? 'unknown' : 'fresh', reasons: unknown };
}

function relevant(document, scope) {
  if (!isMapping(scope)) return false;
  const requested = DIMENSIONS.filter(key => Array.isArray(scope[key]) && scope[key].length > 0);
  if (!requested.length) return false;
  return requested.every(key => scope[key].some(value => document.applicability[key].some(candidate =>
    key === 'paths' ? isRelative(value) && (value === candidate || value.startsWith(`${candidate}/`)) : value === candidate)));
}

/** Return records for advisory reading only. Never import their instructions as authority. */
export function selectRelevantLessons(documents = [], options = {}) {
  const selected = [], excluded = [], candidates = [];
  for (const document of Array.isArray(documents) ? documents : []) {
    const validation = validateLesson(document);
    const id = document?.lesson_id ?? null;
    if (!validation.ok) { excluded.push({ lesson_id: id, reason: 'invalid', details: validation.errors }); continue; }
    if (document.owner_repository_id !== options.owner_repository_id || !relevant(document, options.scope)) { excluded.push({ lesson_id: id, reason: 'unrelated' }); continue; }
    const freshness = evaluateLessonFreshness(document, options);
    if (freshness.status !== 'fresh') { excluded.push({ lesson_id: id, reason: freshness.status, details: freshness.reasons }); continue; }
    candidates.push(document);
  }
  for (const id of [...new Set(candidates.map(document => document.lesson_id))].sort()) {
    const matches = candidates.filter(document => document.lesson_id === id);
    if (new Set(matches.map(contentHash)).size > 1) { excluded.push({ lesson_id: id, reason: 'conflicting' }); continue; }
    selected.push(structuredClone(matches[0]));
    if (matches.length > 1) excluded.push({ lesson_id: id, reason: 'duplicate' });
  }
  return { selected, excluded, advisory_only: true, current_source_precedence: true };
}

/** Produce an immutable write proposal; the owning host performs lifecycle checks and I/O. */
export function planLessonCapture(options = {}) {
  const { candidate, existing = [] } = options;
  const validation = validateLesson(candidate);
  const reasons = [...validation.errors];
  if (options.action !== 'memories-write-approved') reasons.push('the exact memories-write-approved Explore action is required');
  const authority = resolveExploreWriteAuthority(options);
  if (!authority.write_allowed) reasons.push(authority.reason);
  if (!options.owner_repository_id || options.owner_repository_id !== candidate?.owner_repository_id) reasons.push('semantic owner repository mismatch; no portal fallback');
  if (!Array.isArray(existing)) reasons.push('existing lesson inventory must be an array');
  const freshness = evaluateLessonFreshness(candidate, options);
  if (freshness.status !== 'fresh') reasons.push(`lesson is ${freshness.status}`, ...freshness.reasons);
  if (reasons.length) return { status: 'blocked', reasons };
  const matching = existing.filter(document => document?.lesson_id === candidate.lesson_id);
  if (matching.length > 1) return { status: 'conflict', reasons: ['duplicate stored lesson identity requires owner reconciliation'] };
  if (matching.length === 1) {
    if (!validateLesson(matching[0]).ok || contentHash(matching[0]) !== contentHash(candidate)) return { status: 'conflict', reasons: ['existing lesson differs; preserve it and request an evidence-backed owner reconciliation'] };
    return { status: 'unchanged', reasons: [], lesson_id: candidate.lesson_id };
  }
  return { status: 'ready', reasons: [], lesson_id: candidate.lesson_id, write: {
    path: `.sdcorejs/memories/${candidate.track}/${candidate.lesson_id}.json`,
    expected_existing: 'absent', content_hash: contentHash(candidate), document: structuredClone(candidate),
  }, proposed_convention: candidate.proposed_convention ? structuredClone(candidate.proposed_convention) : null };
}
