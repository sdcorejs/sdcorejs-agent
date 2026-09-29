import { createHash, randomUUID } from 'node:crypto';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual as equal } from 'node:util';
import { createApprovedArtifact } from './approved-artifact.mjs';
import { resolveEvidenceArtifact } from './evidence-artifact.mjs';
import { stableRepositoryId } from './repository-contract.mjs';
import { assertVolatileLedger, beginVolatileWindow, captureRepository, changedRepositoryPaths, containedRepositoryFile, endVolatileWindow,
  registerVolatileLedger, repositoryGit, safeRepositoryPath, validateVolatilePaths } from './repository-observation.mjs';
import { readVerifiedDesignSources, verifyDesignHandoff } from './design-verification.mjs';
import { validateDocumentationVisualEvidence } from './documentation-layout.mjs';
import { systemRegistry } from './system-registry.mjs';
import { CONSISTENCY_FINDING_KINDS, validateConsistencyFinding } from './convention-contract.mjs';

export const reviewFindingSeverities = Object.freeze(['Critical', 'High', 'Important', 'Medium', 'Minor', 'Low', 'Info']);
const findingDimensions = Object.freeze({ functional: 'code', accessibility: 'accessibility', convention: 'consistency', aesthetic: 'code' });

const runtimes = new WeakMap();
const purposes = ['design-artifact', 'implemented-ui-conformance'];
const kinds = ['source', 'rendered', 'interaction'];
const text = v => typeof v === 'string' && v.trim() !== '';
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const hash = v => createHash('sha256').update(v).digest('hex');
const need = (value, message) => { if (!value) throw Error(message); };
const keys = (v, allowed) => object(v) && Object.keys(v).every(k => allowed.includes(k));
const paths = v => Array.isArray(v) && new Set(v).size === v.length && v.every(safeRepositoryPath);
const sameTarget = (a, b) => equal(a, b);
const receiptContract = 'ui-command-receipt:v1';
const array = v => Array.isArray(v) ? v : [];

/** Canonical, case-sensitive finding gates. A gate is optional; any other value is rejected. */
export const UI_REVIEW_GATES = Object.freeze(['BLOCKER', 'REQUIRED', 'ADVISORY', 'N/A']);

// Closed lexicons for source-only findings (D-009). Prose is never evidence:
// runtime status comes only from host receipts. These lists lint the sentences
// that mention runtime behavior so a source-only finding cannot claim a result.
export const UI_RUNTIME_TOPICS = Object.freeze(['render', 'interact', 'keyboard', 'focus', 'tab order', 'tabbing', 'tab key', 'hover', 'click',
  'contrast', 'clip', 'viewport', 'responsive', 'screen reader', 'screen-reader', 'scroll', 'zoom', 'assistive technology', 'assistive-technology']);
export const UI_IMPERATIVE_VERBS = Object.freeze(['render', 'run', 'open', 'inspect', 'check', 'verify', 'test', 'press', 'tab', 'click', 'hover',
  'focus', 'navigate', 'resize', 'scroll', 'zoom', 'capture', 'compare', 'measure', 'execute', 'load', 'trigger', 'observe', 'use', 'record', 'confirm']);
export const UI_RUNTIME_OUTCOME_WORDS = Object.freeze(['works', 'worked', 'working', 'pass', 'passes', 'passed', 'correct', 'correctly', 'fine', 'ok', 'okay',
  'verified', 'confirmed', 'behaves', 'behaved', 'succeeds', 'succeeded', 'successful', 'successfully', 'properly', 'as expected', 'as intended']);
// "no failures observed", "none found", "nothing observed failing", "zero issues found",
// "never fails": a negated finding reports a run result. A negated runtime activity is
// stripped first as a disclaimer.
const NEGATED_FINDING_PATTERN = '\\b(?:no|none|nothing|zero|never)\\b[^.;]*?\\b(?:observed|found|detected|seen|confirmed|verified|reported|noticed|fails?|failed|failing)\\b';
const words = list => list.map(item => item.replace(/[-\s]/gu, '[-\\s]')).join('|');
const RUNTIME_TOPIC = new RegExp(`\\b(?:${words(UI_RUNTIME_TOPICS)})\\w*`, 'iu');
const OUTCOME_WORDS = new RegExp(`\\b(?:${words(UI_RUNTIME_OUTCOME_WORDS)})\\b`, 'iu');
const NEGATED_FINDING = new RegExp(NEGATED_FINDING_PATTERN, 'iu');
// Disclaimers negate the runtime activity itself: "not run", "NOT RUN", "not yet verified",
// "has not been rendered", "was never run", "was not manually tested", or
// "no <runtime activity> <completion>" such as "no rendering observed". Only auxiliaries and
// the closed manner adverbs below may separate the negation from the completion verb;
// "never works when tested" or "not correct once rendered" negates a result instead.
const COMPLETION_VERBS = '(?:run|ran|executed|verified|confirmed|observed|rendered|tested|checked|exercised|inspected|captured|measured)';
const NEGATION_AUXILIARIES = '(?:has|have|had|was|were|is|are|been|be|being|yet)';
export const UI_DISCLAIMER_ADVERBS = Object.freeze(['manually', 'visually', 'independently', 'automatically', 'fully', 'actually', 'formally',
  'directly', 'locally', 'separately', 'interactively', 'programmatically', 'physically', 'explicitly']);
const NOT_RUN_PATTERN = `\\b(?:not|never)(?:\\s+(?:${NEGATION_AUXILIARIES}|${UI_DISCLAIMER_ADVERBS.join('|')}))*\\s+${COMPLETION_VERBS}\\b|\\bno\\s+(?:${words(UI_RUNTIME_TOPICS)})\\w*\\s+${COMPLETION_VERBS}\\b`;
const NOT_RUN = new RegExp(NOT_RUN_PATTERN, 'iu');
// A repository file (with extension) under a directory, or file:line.
const LOCATOR = /(?:[\w@.-]+\/)+[\w@-]+\.\w+(?::\d+)?|\b[\w@-]+\.\w+:\d+/u;
const RUNTIME_RESULT_FIELDS = Object.freeze(['evidence_ref', 'result', 'outcome', 'status', 'assertions', 'coverage']);
const sentences = value => String(value ?? '').split(/(?<=[.!?;])\s+|\r?\n+/u).map(item => item.trim()).filter(Boolean);
// A disclaimer ("keyboard behavior not run") makes no runtime claim; lint the rest of the sentence.
const claimPart = sentence => sentence.replace(new RegExp(NOT_RUN_PATTERN, 'giu'), ' ');
// Inline code (`…`) is code, not prose, so it cannot form a negated finding: a CSS value such
// as `none` is no negation. Topics, locators, outcome words and disclaimers are still read
// from the whole sentence, so code can neither hide a result claim nor bridge a disclaimer.
const prose = sentence => sentence.replace(/`[^`\n]*`/gu, ' ');
const outcomeClaim = sentence => OUTCOME_WORDS.test(claimPart(sentence)) || NEGATED_FINDING.test(claimPart(prose(sentence)));
const imperative = sentence => UI_IMPERATIVE_VERBS.includes((sentence.replace(/^[\s\-*>#`\d.)]+/u, '').match(/^[A-Za-z]+/u)?.[0] ?? '').toLowerCase());

function sourceOnlyClaimError(item) {
  const u = item.uiux;
  if (RUNTIME_RESULT_FIELDS.some(field => Object.hasOwn(u, field))) return 'is source-only and cannot carry runtime evidence or result fields';
  for (const sentence of sentences(u.verification)) {
    if (RUNTIME_TOPIC.test(claimPart(sentence)) && (!imperative(sentence) || outcomeClaim(sentence))) return 'is source-only; its runtime verification must be an imperative method without a result claim';
  }
  for (const sentence of sentences(item.evidence)) {
    if (RUNTIME_TOPIC.test(claimPart(sentence)) && (!LOCATOR.test(sentence) || outcomeClaim(sentence))) return 'is source-only; evidence about runtime behavior needs a source locator and no result claim';
  }
  for (const sentence of sentences(u.limitation)) {
    if (RUNTIME_TOPIC.test(sentence) && (!NOT_RUN.test(sentence) || outcomeClaim(sentence))) return 'is source-only; its limitation must mark runtime checks as not run or not verified';
  }
  for (const field of ['impact', 'required_fix']) {
    for (const sentence of sentences(item[field])) {
      if (RUNTIME_TOPIC.test(claimPart(sentence)) && outcomeClaim(sentence)) return `is source-only and its ${field} claims a runtime result`;
    }
  }
  return null;
}

/** One UI finding contract for ordinary Review and direct UI consumers. */
export function validateUiReviewFinding(item, dimensions = []) {
  if (!object(item) || !reviewFindingSeverities.includes(item.severity) ||
      !['id', 'evidence', 'locator', 'repository_id', 'impact', 'required_fix'].every(key => text(item[key]))) return 'does not satisfy the durable schema';
  if (item.kind !== 'uiux' && item.uiux === undefined) return null;
  const u = item.uiux;
  if (!object(u) || !Object.hasOwn(findingDimensions, u.classification) || !kinds.includes(u.evidence_kind) ||
      !text(u.rule_id) || !text(u.verification) || u.evidence_kind === 'source' && !text(u.limitation)) return 'lacks UI/UX classification, evidence scope, verification, or source-only limitation';
  if (item.gate !== undefined && !UI_REVIEW_GATES.includes(item.gate)) return 'uses a non-canonical gate; use BLOCKER, REQUIRED, ADVISORY or N/A';
  if (u.evidence_kind === 'source') {
    const claim = sourceOnlyClaimError(item);
    if (claim) return claim;
  }
  if (u.classification === 'aesthetic' && (!['Minor', 'Low', 'Info'].includes(item.severity) ||
      ['BLOCKER', 'REQUIRED'].includes(item.gate) || item.repair_tier === 'auto' || item.write_tier === 'auto' || item.eligible_for_automatic_repair === true)) return 'cannot make an aesthetic preference blocking';
  if (!systemRegistry.review_dimensions.some(d => d.id === item.dimension) ||
      u.classification !== 'convention' && !dimensions.includes(item.dimension) && !dimensions.includes('ALL') &&
      !(dimensions.includes('site-audit') && ['code', 'accessibility'].includes(item.dimension))) return 'expands a narrow review into an unrequested UI/UX dimension';
  if (item.dimension !== findingDimensions[u.classification]) return 'has a contradictory UI/UX classification and dimension';
  if (u.classification === 'convention') {
    if (!CONSISTENCY_FINDING_KINDS.includes(item.finding_kind)) return 'must use the existing consistency finding contract';
    const scopes = dimensions.map(id => systemRegistry.review_dimensions.find(d => d.id === id)?.consistency_scope);
    if (!scopes.some(scope => ['complete', 'applicable', 'structural'].includes(scope)) && item.affects_requested_dimension !== true) return 'expands a narrow review into a consistency audit';
    const check = validateConsistencyFinding(item);
    if (!check.ok) return 'is not a valid consistency finding: ' + check.errors.join('; ');
  }
  return null;
}

function validateRaster(bytes, execution, revision) {
  // Byte-decoder adapter only: these virtual paths never represent a persisted
  // guide, real-product provenance, or documentation approval.
  const file = '.sdcorejs/documentation/user-guides/decoder/images/input.png';
  return validateDocumentationVisualEvidence({ record: {
    schema_version: 1, capture_id: 'decoder-input', classification: 'documentation',
    result: 'verified', blocker: null, evidence_origin: 'illustration', generator: 'byte-decoder-adapter',
    source_revision: revision, app_revision: revision, associated_HEAD_or_diff: revision,
    guide_path: '.sdcorejs/documentation/user-guides/decoder/decoder.md',
    image: { kind: 'documentation', file, exists: true, non_empty: true, decodable: true,
      sha256: hash(bytes), width: execution.image_width, height: execution.image_height },
  }, sourceFiles: { [file]: bytes } }).ok;
}

export function readUiReviewRequirements(artifact) {
  let body;
  try { body = JSON.parse(artifact?.body); } catch { /* Markdown uses the canonical JSON block. */ }
  const block = artifact?.body?.match(/\x60{3}ui-review-requirements\s*\n([\s\S]*?)\n\x60{3}/u);
  const policy = body?.ui_review_requirements ?? (block ? JSON.parse(block[1]) : null);
  const rows = body?.plan_context?.validation_map ?? body?.validation_map;
  const projected = array(rows).filter(row => row?.ui_review).map(row => row.ui_review);
  if (projected.length) {
    need(policy && projected.every(row => policy.obligations.some(value => equal(value, row))) &&
      policy.obligations.every(value => projected.some(row => equal(value, row))), 'approved UI applicability projection drift');
  }
  need(policy || !/(?:^|\n)\s*ui_review\s*:/u.test(artifact?.body ?? ''), 'UI applicability requires the canonical JSON requirements block');
  return policy;
}

export function validateUiReviewObligation(value) {
  const errors = [];
  if (!keys(value, ['schema_version', 'purpose', 'target_id', 'evidence_kinds', 'independent_review_required', 'baseline_required']) ||
      value.schema_version !== 1 || !purposes.includes(value.purpose) || !text(value.target_id) ||
      !Array.isArray(value.evidence_kinds) || !value.evidence_kinds.length ||
      new Set(value.evidence_kinds).size !== value.evidence_kinds.length || !value.evidence_kinds.every(k => kinds.includes(k)) ||
      typeof value.independent_review_required !== 'boolean' || typeof value.baseline_required !== 'boolean') errors.push('invalid UI review obligation');
  return errors;
}

export function validateUiReviewContext(context) {
  const blockers = [], ui = context?.ui_review;
  const track = systemRegistry.tracks.find(t => t.id === context?.subject_track);
  if (context?.schema_version !== 1 || !track || context.review_profile !== track.review_profile) blockers.push('invalid ordinary review schema or registry profile');
  if (context?.mode !== 'read-only' || !Array.isArray(context?.write_actions) || context.write_actions.length) blockers.push('UI review must stay read-only without write actions');
  if (!purposes.includes(context?.purpose)) blockers.push('UI review purpose is required');
  if (!keys(ui, ['schema_version', 'assessment_id', 'baseline', 'targets', 'evidence_refs', 'assessment_context']) ||
      ui.schema_version !== 1 || !text(ui.assessment_id)) blockers.push('invalid UI review schema');
  const baseline = ui?.baseline;
  if (!keys(baseline, ['kind', 'artifact_ref', 'reason']) ||
      !['design-artifact', 'visual-contract', 'unavailable', 'not-applicable'].includes(baseline?.kind) ||
      (['unavailable', 'not-applicable'].includes(baseline?.kind)
        ? baseline.artifact_ref !== null || !text(baseline.reason)
        : !object(baseline.artifact_ref))) blockers.push('invalid UI baseline');
  if (!paths(context?.file_scope) || !context.file_scope.length) blockers.push('UI file scope is required');
  if (!Array.isArray(context?.dimensions) || !context.dimensions.length ||
      !context.dimensions.every(id => systemRegistry.review_dimensions.some(d => d.id === id))) blockers.push('UI dimensions must use the registry');
  if (!Array.isArray(context?.reported_findings)) blockers.push('UI findings must be an array');
  for (const item of array(context?.reported_findings)) {
    const error = validateUiReviewFinding(item, array(context?.dimensions));
    if (error) blockers.push('finding ' + (item?.id ?? 'unknown') + ' ' + error);
  }
  if (!Array.isArray(ui?.targets) || !ui.targets.length || new Set(ui.targets.map(t => t?.id)).size !== ui.targets.length) blockers.push('UI targets must be unique and nonempty');
  for (const t of array(ui?.targets)) {
    if (!keys(t, ['id', 'screen', 'state', 'viewport', 'viewport_reason', 'source_paths', 'build_paths']) ||
        !text(t.id) || !text(t.screen) || !text(t.state) || !paths(t.source_paths) || !t.source_paths.length || !paths(t.build_paths) ||
        !(t.viewport === null ? text(t.viewport_reason) : keys(t.viewport, ['width', 'height']) &&
          Number.isInteger(t.viewport.width) && t.viewport.width > 0 && Number.isInteger(t.viewport.height) && t.viewport.height > 0)) blockers.push('invalid UI target');
    if ([...array(t?.source_paths), ...array(t?.build_paths)].some(p => !array(context?.file_scope).includes(p))) blockers.push('UI target expands file scope');
  }
  if (!Array.isArray(ui?.evidence_refs)) blockers.push('UI evidence references must be an array');
  for (const e of array(ui?.evidence_refs)) {
    if (!keys(e, ['kind', 'target_id', 'artifact_ref', 'approval_hash', 'requirement_refs']) ||
        !kinds.includes(e.kind) || !array(ui.targets).some(t => t?.id === e.target_id) ||
        !safeRepositoryPath(e.artifact_ref) || !/^sha256:v1:[a-f0-9]{64}$/u.test(e.approval_hash ?? '') ||
        !Array.isArray(e.requirement_refs)) blockers.push('invalid UI evidence reference');
  }
  const assessment = ui?.assessment_context;
  if (!keys(assessment, ['kind', 'author_context', 'reviewer_context']) ||
      !['independent', 'self-critique', 'limited'].includes(assessment?.kind) ||
      !text(assessment?.author_context) || !text(assessment?.reviewer_context)) blockers.push('invalid assessment context');
  return { valid: blockers.length === 0, blockers };
}

function observe(state) {
  need(stableRepositoryId({ remote_url: repositoryGit(state, ['remote', 'get-url', 'origin']).trim() }) === state.owner, 'UI owner differs from actual repository');
  const snapshot = captureRepository(state);
  assertVolatileLedger(state.ledger, snapshot);
  return snapshot;
}

// Volatile paths come only from the verified plan's finish policy; a direct
// review without a plan has none, and an unreadable plan grants no exemption.
function planVolatilePaths(state) {
  if (!state.source_runtime) return { change_ref: state.authority.change_ref, volatile: [] };
  try {
    const sources = readVerifiedDesignSources(state.source_runtime);
    let body;
    try { body = JSON.parse(sources.plan?.body); } catch { /* Markdown plans use the finish-policy fence. */ }
    const block = sources.plan?.body?.match(/\x60{3}finish-policy\r?\n([\s\S]*?)\r?\n\x60{3}/u);
    const policy = body?.finish_policy ?? (block ? JSON.parse(block[1]) : null);
    sources.finish();
    return { change_ref: sources.spec.metadata.change_ref, volatile: validateVolatilePaths(policy?.volatile_paths ?? []) };
  } catch { return { change_ref: state.authority.change_ref, volatile: [] }; }
}

// Output freshness uses lstat metadata as well as bytes: a rerun that writes the
// same bytes is still new, while an output left by an earlier run is not.
function outputState(state, file) {
  if (!safeRepositoryPath(file)) return { exists: false };
  let stat;
  try { stat = lstatSync(path.join(state.root, file), { bigint: true }); } catch { return { exists: false }; }
  return { exists: true, mtime_ns: String(stat.mtimeNs), ino: String(stat.ino), size: String(stat.size),
    sha256: hash(readFileSync(containedRepositoryFile(state, file))) };
}
function manifest(snapshot, target) {
  return Object.fromEntries([...target.source_paths, ...target.build_paths].sort().map(p => {
    need(safeRepositoryPath(p) && snapshot.files[p]?.kind === 'file', 'UI source/build file unavailable: ' + p);
    return [p, snapshot.files[p]];
  }));
}
function authoritySources(state) {
  if (!state.source_runtime) {
    need(state.authority.origin === 'explicit-user-request' && text(state.authority.request_id) &&
      text(state.authority.change_ref), 'approved sources or scoped host-observed user request required');
    const policy = { targets: state.authority.targets, obligations: state.authority.obligations ?? [] };
    need(Array.isArray(policy.targets) && Array.isArray(policy.obligations), 'direct review scope unavailable');
    for (const obligation of policy.obligations) need(!validateUiReviewObligation(obligation).length, 'invalid requested UI obligation');
    return { policy, sources: { spec: null, plan: null, expected: {}, finish() {},
      load() { throw Error('approved baseline source unavailable for direct review'); } } };
  }
  const sources = readVerifiedDesignSources(state.source_runtime);
  need(sources.spec.metadata.owner_repository_id === state.owner, 'UI authority owner mismatch');
  const spec = readUiReviewRequirements(sources.spec), plan = sources.plan && readUiReviewRequirements(sources.plan);
  if (spec && plan) need(equal(spec, plan), 'plan changed approved UI requirements');
  const policy = plan ?? spec ?? { targets: state.authority.targets, obligations: [] };
  need(object(policy) && Array.isArray(policy.targets) && Array.isArray(policy.obligations), 'approved UI applicability unavailable');
  for (const obligation of policy.obligations) need(!validateUiReviewObligation(obligation).length, 'invalid approved UI obligation');
  need(new Set(policy.targets.map(t => t.id)).size === policy.targets.length, 'duplicate approved UI target');
  return { sources, policy };
}

/** Host-only constructor. Never reconstruct these options from review payloads. */
export function createUiReviewRuntime(options = {}) {
  const token = Object.freeze({ kind: 'ui-review-runtime' });
  const { source_runtime, design_runtime, run_command, prior_reviews = [], ...data } = options;
  const state = { ...structuredClone(data), source_runtime, design_runtime, run_command, prior_reviews,
    receipts: new Map(), assessments: new Map(), before: null };
  try {
    state.root = realpathSync.native(state.root);
    need(text(state.owner) && state.authority?.owner_repository_id === state.owner, 'UI host owner authority unavailable');
    const { change_ref: changeRef, volatile } = planVolatilePaths(state);
    // UI inputs and outputs may not be links, and never volatile.
    state.guarded = [...new Set([...array(state.authority.targets).flatMap(t => [...array(t?.source_paths), ...array(t?.build_paths)]), ...array(state.authority.output_paths)])];
    for (const file of state.guarded) {
      need(!volatile.some(pattern => file === pattern || (pattern.endsWith('/**') && file.startsWith(pattern.slice(0, -2)))), 'volatile path intersects UI input/output: ' + file);
    }
    state.volatile = volatile;
    state.before = observe(state);
    state.ledger = registerVolatileLedger({ root: state.root, change_ref: changeRef, volatile_paths: volatile, snapshot: state.before });
  } catch (error) { state.initial_error = error.message; }
  runtimes.set(token, state);
  return token;
}

/** Starts the separately authorized read-only operation after Test has finished. */
export function beginUiReviewObservation(runtime) {
  const state = runtimes.get(runtime);
  need(state && state.authority?.review_authorized === true, 'review invocation is not authorized');
  need(!state.review_started || state.review_completed, 'review observation already started');
  state.before = observe(state); state.review_started = true; state.review_completed = false;
}

/** Test producer. Review evaluators never invoke this entrypoint or a runner. */
export function recordUiEvidence(runtime, request) {
  const state = runtimes.get(runtime);
  need(state && !state.review_started && state.authority?.test_authorized === true, 'Test evidence execution is not authorized');
  const { sources, policy } = authoritySources(state);
  const target = policy.targets.find(t => t.id === request.target_id);
  need(target && kinds.includes(request.kind), 'unknown evidence target or kind');
  const before = observe(state), inputs = manifest(before, target);
  let execution = null, output = null, outcome = 'PASS';
  if (request.kind !== 'source') {
    need(text(request.command) && state.authority.commands?.includes(request.command) && typeof state.run_command === 'function', 'command is not authorized or runner unavailable');
    need(target.viewport !== null, 'runtime evidence requires a viewport');
    const outputsBefore = Object.fromEntries(array(state.authority.output_paths).map(file => [file, outputState(state, file)]));
    // The command is a host window: only declared volatile paths may change inside it.
    const window = beginVolatileWindow(state.ledger, 'command', before);
    // A failed capture still closes the window; without a snapshot nothing is recorded.
    let windowAfter;
    try {
      try { execution = state.run_command({ command: request.command, cwd: state.root, target: structuredClone(target), kind: request.kind }); }
      finally { windowAfter = captureRepository(state); }
    } finally { endVolatileWindow(window, windowAfter); }
    need(execution?.command === request.command && execution.cwd === '.', 'UI command did not execute successfully');
    // A completed run has an integer exit code and reports neither interruption nor timeout.
    need(Number.isInteger(execution.exit_code) && execution.interrupted === false && execution.timed_out === false,
      'UI command run is incomplete: interrupted, timed out, or missing its exit code or completion flags');
    need(execution.kind === request.kind && sameTarget(execution.target, target), 'runner target/kind mismatch');
    need(execution.provenance === 'real-product' && text(execution.build_id), 'mockup or unknown product provenance');
    need(safeRepositoryPath(execution.artifact_path) && state.authority.output_paths?.includes(execution.artifact_path), 'output path is not authorized');
    const produced = outputState(state, execution.artifact_path);
    need(produced.exists && !equal(produced, outputsBefore[execution.artifact_path]), 'UI output was not produced by this run');
    const bytes = readFileSync(containedRepositoryFile(state, execution.artifact_path));
    need(bytes.length > 0, 'empty UI output');
    if (request.kind === 'rendered') need(validateRaster(bytes, execution, before.revision), 'rendered output is not a valid decoded image');
    if (request.kind === 'interaction') need(execution.assertions?.length > 0 && execution.assertions.every(a => text(a.id) && ['PASS', 'FAIL'].includes(a.result)), 'interaction assertions were not executed');
    // A completed failing run is FAIL evidence, not a gap.
    outcome = execution.exit_code === 0 && array(execution.assertions).every(a => a.result === 'PASS') ? 'PASS' : 'FAIL';
    output = { path: execution.artifact_path, sha256: hash(bytes) };
  }
  const after = observe(state);
  need(equal(inputs, manifest(after, target)), 'source/build changed during evidence execution');
  const changed = changedRepositoryPaths(before, after);
  need(before.revision === after.revision && before.index_hash === after.index_hash, 'Git changed during UI execution');
  need(changed.every(p => state.authority.output_paths?.includes(p) || after.files[p]?.kind === 'directory' && state.authority.output_paths.some(o => o.startsWith(p + '/'))), 'Test command wrote outside authorized outputs');
  sources.finish();
  const id = randomUUID(), artifactPath = '.sdcorejs/evidence/ui/' + id + '.json';
  const body = { kind: request.kind, target, inputs, source_revision: after.revision, execution, output, outcome };
  const artifact = createApprovedArtifact({ metadata: {
    schema_version: 1, artifact_id: id, artifact_kind: 'release-evidence', contract_id: receiptContract,
    requirement_id: sources.spec?.metadata.requirement_id ?? state.authority.request_id,
    change_ref: sources.spec?.metadata.change_ref ?? state.authority.change_ref,
    track: 'test', stack_profile: 'node-general', owner_repository_id: state.owner,
    owner_repository_role: sources.spec?.metadata.owner_repository_role ?? state.authority.owner_repository_role,
    owner_module_id: sources.spec?.metadata.owner_module_id ?? state.authority.owner_module_id ?? null,
    parent_repository_id: null, parent_references: [], repository_relative_path: artifactPath,
    source_revision: after.revision, approved_by: 'observed-test-runner', approved_at: new Date().toISOString(),
    approval_source: 'trusted-command-runner', supersedes: null,
  }, body: JSON.stringify(body) });
  state.receipts.set(artifactPath, artifact);
  return { kind: request.kind, target_id: target.id, artifact_ref: artifactPath, approval_hash: artifact.metadata.approval_hash, requirement_refs: request.requirement_refs ?? [] };
}

function verifyReceipt(state, reference, target, snapshot, change) {
  const artifact = state.receipts.get(reference.artifact_ref), errors = [];
  need(artifact, 'UI receipt was not observed by this host');
  const resolved = resolveEvidenceArtifact(reference, [artifact], receiptContract, errors, 'UI evidence');
  need(resolved, errors.join('; '));
  const { body, metadata } = resolved;
  need(metadata.owner_repository_id === state.owner && metadata.change_ref === change && metadata.source_revision === snapshot.revision, 'foreign or stale UI receipt');
  need(body.kind === reference.kind && sameTarget(body.target, target), 'UI receipt target mismatch');
  need(equal(body.inputs, manifest(snapshot, target)), 'stale UI source/build content');
  if (reference.kind !== 'source') {
    need(text(body.execution?.command) && body.execution.cwd === '.' && Number.isInteger(body.execution.exit_code) && body.execution.interrupted === false &&
      body.execution.timed_out === false && body.execution.provenance === 'real-product' && ['PASS', 'FAIL'].includes(body.outcome), 'unverified UI execution');
    need(hash(readFileSync(containedRepositoryFile(state, body.output.path))) === body.output.sha256, 'stale UI output content');
  }
  return body;
}

export function evaluateUiReview(context, { runtime } = {}) {
  const structural = validateUiReviewContext(context);
  const result = { valid: structural.valid, verified: false, assessment_completed: false, independence: 'unverified',
    read_only_proven: false, conformance: 'NOT RUN', coverage: [], gaps: [], failures: [], blockers: [...structural.blockers], limitations: [], findings: [] };
  const state = runtimes.get(runtime);
  try {
    need(structural.valid, 'UI structure invalid');
    need(state && !state.initial_error, state?.initial_error ?? 'trusted UI runtime unavailable');
    need(state.authority.review_authorized === true && state.review_started, 'independent review invocation/observation is not authorized');
    need(context.owner_repository_id === state.owner, 'UI review owner mismatch');
    need(state.authority.purposes?.includes(context.purpose), 'UI purpose exceeds request');
    need(context.dimensions.every(d => state.authority.dimensions.includes(d)) && context.file_scope.every(p => state.authority.file_scope.includes(p)), 'UI review expands authorized scope');
    const current = observe(state);
    need(state.review_completed && state.assessments.has(context.ui_review.assessment_id) ||
      state.before && state.before.fingerprint === current.fingerprint, 'review observation changed: undeclared write/persistence or stale assessment');
    result.read_only_proven = true;
    const { sources, policy } = authoritySources(state);
    need(context.change_ref === (sources.spec?.metadata.change_ref ?? state.authority.change_ref), 'UI review change identity mismatch');
    const declared = context.ui_review.assessment_context, actual = state.reviewer_context;
    need(actual && declared.author_context === actual.author_context && declared.reviewer_context === actual.reviewer_context, 'reviewer provenance unavailable or mismatched');
    const independent = actual.kind === 'independent' && actual.author_context !== actual.reviewer_context && actual.separate_context === true;
    result.independence = independent ? 'independent' : actual.kind === 'self-critique' ? 'self-critique' : 'limited';
    need(declared.kind !== 'independent' || independent || actual.separate_context_supported === false, 'self-critique cannot claim independent review');
    if (!independent) result.limitations.push('Separate independent reviewer context was not observed.');
    if (actual.separate_context_supported === true) need(independent, 'available separate reviewer context was not used');
    const obligations = policy.obligations.filter(o => o.purpose === context.purpose);
    const baseline = context.ui_review.baseline;
    if (baseline.kind === 'design-artifact') {
      const artifact = sources.load(baseline.artifact_ref);
      need(artifact.metadata.artifact_kind === 'design-handoff' && artifact.metadata.owner_repository_id === state.owner,
        'baseline is not a Design artifact of this owner');
      if (context.purpose === 'implemented-ui-conformance') {
        const verified = verifyDesignHandoff(JSON.parse(artifact.body), { runtime: state.design_runtime });
        need(verified.verified, 'approved Design baseline is unverified: ' + verified.blockers.join('; '));
      }
      result.conformance = 'PASS';
    } else if (baseline.kind === 'visual-contract') {
      const artifact = sources.load(baseline.artifact_ref);
      const contract = JSON.parse(artifact.body).visual_contract;
      need(contract && contract.owner_repository_id === state.owner && contract.change_ref === context.change_ref &&
        context.ui_review.targets.every(t => contract.target_ids?.includes(t.id)), 'visual contract does not authorize these targets');
      result.conformance = 'PASS';
    } else {
      result.conformance = baseline.kind === 'unavailable' ? 'UNAVAILABLE' : 'NOT APPLICABLE';
      if (baseline.kind === 'not-applicable') need(state.authority.baseline_not_applicable_reason === baseline.reason, 'baseline not-applicable lacks authority');
    }
    for (const obligation of obligations) {
      need(context.ui_review.targets.some(t => t.id === obligation.target_id), 'required UI target omitted');
      if (obligation.baseline_required && result.conformance !== 'PASS') result.gaps.push('Required design/visual baseline unavailable: ' + obligation.target_id);
      if (obligation.independent_review_required && !independent) result.gaps.push('Required independent review unavailable: ' + obligation.target_id);
    }
    for (const target of context.ui_review.targets) {
      const approved = policy.targets.find(t => t.id === target.id);
      need(approved && sameTarget(approved, target), 'target differs from approved/authorized source closure');
      manifest(current, target);
      const required = new Set(obligations.filter(o => o.target_id === target.id).flatMap(o => o.evidence_kinds));
      const row = { target_id: target.id, source: 'PASS', rendered: 'NOT RUN', interaction: 'NOT RUN' };
      for (const kind of kinds) {
        const references = context.ui_review.evidence_refs.filter(e => e.target_id === target.id && e.kind === kind);
        need(references.length <= 1, 'duplicate UI evidence for target/kind');
        if (references.length) {
          try {
            const body = verifyReceipt(state, references[0], target, current, context.change_ref);
            row[kind] = kind === 'source' ? 'PASS' : body.outcome;
            // A completed failing run is a reported defect, kept apart from missing proof.
            if (row[kind] === 'FAIL') result.failures.push(kind + ' evidence FAIL for ' + target.id);
          } catch (error) { row[kind] = /stale/.test(error.message) ? 'STALE' : 'GAP'; result.gaps.push(error.message); }
        } else if (required.has(kind) && kind !== 'source') {
          row[kind] = 'GAP'; result.gaps.push('Missing ' + kind + ' evidence for ' + target.id);
        }
      }
      result.coverage.push(row);
    }
    for (const finding of context.reported_findings ?? []) {
      if (!finding.uiux) continue;
      const u = finding.uiux;
      if (u.classification === 'aesthetic') need(!(u.requirement_refs?.length || u.invariant_refs?.length), 'approved conformance cannot be downgraded to aesthetic');
      // A runtime finding cites a current receipt (PASS or FAIL) of its target and kind;
      // source-only claims are closed structurally by validateUiReviewFinding.
      if (u.evidence_kind !== 'source') need(context.ui_review.evidence_refs.some(e => e.artifact_ref === u.evidence_ref &&
        e.kind === u.evidence_kind && ['PASS', 'FAIL'].includes(result.coverage.find(r => r.target_id === e.target_id)?.[e.kind])), 'finding lacks verified target runtime evidence');
      if (u.classification !== 'aesthetic' && ['BLOCKER', 'REQUIRED'].includes(finding.gate)) result.conformance = 'FAIL';
    }
    sources.finish();
    need(observe(state).fingerprint === current.fingerprint, 'content changed during review');
    const assessmentInputs = { targets: context.ui_review.targets.map(t => manifest(current, t)),
      baseline: context.ui_review.baseline, context: context.ui_review.assessment_context,
      findings: context.reported_findings, evidence_refs: context.ui_review.evidence_refs,
      authority_hashes: [sources.spec?.metadata.approval_hash ?? state.authority.request_id, sources.plan?.metadata.approval_hash] };
    const previous = state.assessments.get(context.ui_review.assessment_id);
    if (previous && !equal(previous, assessmentInputs)) result.gaps.push('stale review assessment; run a new assessment on current content');
    else state.assessments.set(context.ui_review.assessment_id, assessmentInputs);
    result.assessment_completed = true;
    state.review_completed = true;
    result.assessment_verified = result.gaps.length === 0;
    result.verified = result.gaps.length === 0 && result.failures.length === 0 && result.conformance !== 'FAIL';
  } catch (error) { result.blockers.push(error.message); }
  result.blockers.push(...result.gaps);
  result.findings = result.gaps.map((gap, index) => ({
    id: 'UI-GAP-' + (index + 1), kind: 'verification-gap', severity: 'High', gate: 'REQUIRED',
    locator: context.ui_review.assessment_id, evidence: gap, repository_id: context.owner_repository_id,
    impact: 'Required UI proof is unavailable or stale; this is not an observed product defect.',
    required_fix: 'Route the missing focused evidence to its authorized Test/Review owner.',
    repair_tier: 'confirm', eligible_for_automatic_repair: false,
  }));
  return result;
}

export function evaluateUiReviewConsumer(context, { runtime, source_runtime, consumer, phase = 'postflight', approved_artifacts = [], validation_map = [], repair_finding } = {}) {
  const state = runtimes.get(runtime);
  let required = array(validation_map).filter(r => r?.ui_review).map(r => r.ui_review);
  try {
    for (const artifact of approved_artifacts) required.push(...(readUiReviewRequirements(artifact)?.obligations ?? []));
    if (source_runtime) {
      const sources = readVerifiedDesignSources(source_runtime);
      required.push(...(readUiReviewRequirements(sources.plan)?.obligations ?? readUiReviewRequirements(sources.spec)?.obligations ?? []));
      sources.finish();
    }
    if (state) required.push(...authoritySources(state).policy.obligations);
    required = required.filter(o => phase !== 'preflight' || o.purpose === 'design-artifact');
    for (const obligation of required) need(!validateUiReviewObligation(obligation).length, 'invalid UI applicability');
    // A UI review context names a UI purpose or carries ui_review. An ordinary review
    // context is NOT APPLICABLE only when no source declares an obligation; it never masks one.
    const uiContext = object(context) && (purposes.includes(context.purpose) || context.ui_review !== undefined);
    if (!required.length && !uiContext) return { verified: true, status: 'NOT APPLICABLE', blockers: [], pending_postflight: phase === 'preflight' };
    if (phase === 'preflight' && context?.purpose === 'implemented-ui-conformance' && !required.length) return { verified: true, status: 'NOT RUN', blockers: [], pending_postflight: true };
    need(uiContext, 'required UI review/evidence payload missing');
    // Repair consumes only an assessment that an earlier review recorded in this host runtime.
    // It is checked before evaluating, because evaluation records an assessment: a repair call
    // never records one, so a fresh assessment id cannot rewrite the finding, even on a retry.
    need(phase !== 'repair' || Boolean(state?.assessments?.has(context?.ui_review?.assessment_id)),
      'repair needs the UI assessment recorded by an earlier review in this host runtime');
    const result = evaluateUiReview(context, { runtime });
    // Repair accepts a completed failing run only as the input of the finding it repairs,
    // the finding whose runtime evidence cites that receipt; every other case requires PASS.
    // The citation comes from the observed assessment entry with the same identity,
    // never from the caller's copy of the finding.
    const observedFinding = phase === 'repair' && object(repair_finding)
      ? array(context.reported_findings).find(item => item?.id === repair_finding.id && item?.repository_id === repair_finding.repository_id) : null;
    const cited = text(observedFinding?.uiux?.evidence_ref)
      ? array(context.ui_review?.evidence_refs).find(ref => ref.artifact_ref === observedFinding.uiux.evidence_ref && ref.kind === observedFinding.uiux.evidence_kind) : null;
    const repairInput = (targetId, kind) => Boolean(cited) && cited.target_id === targetId && cited.kind === kind;
    const accepted = (targetId, kind, value) => value === 'PASS' || (value === 'FAIL' && repairInput(targetId, kind));
    const assessmentAcceptable = value => phase === 'repair' ? value.assessment_verified === true : value.verified;
    for (const failure of result.failures) {
      if (!(cited && failure === `${cited.kind} evidence FAIL for ${cited.target_id}`)) result.blockers.push('UI ' + failure + ' is a product defect');
    }
    if (!assessmentAcceptable(result) && !result.blockers.length) result.blockers.push('UI assessment contains a conformance blocker');
    const prior = new Map();
    // Other purposes must be rechecked through their original opaque host runtime;
    // serialized PASS and recursive handoff graphs are never consumed.
    for (const entry of state?.prior_reviews ?? []) {
      need(entry.context?.change_ref === context.change_ref && entry.context?.owner_repository_id === context.owner_repository_id,
        'foreign prior UI assessment');
      need(!prior.has(entry.context.purpose), 'duplicate prior UI purpose');
      prior.set(entry.context.purpose, evaluateUiReview(entry.context, { runtime: entry.runtime }));
    }
    for (const obligation of required) {
      const assessment = obligation.purpose === context.purpose ? result : prior.get(obligation.purpose);
      const row = assessment?.coverage.find(item => item.target_id === obligation.target_id);
      if (!assessment || !assessmentAcceptable(assessment) || !row || !obligation.evidence_kinds.every(k => accepted(obligation.target_id, k, row[k]))) {
        result.blockers.push(row && obligation.evidence_kinds.some(k => row[k] === 'FAIL')
          ? 'required UI evidence FAIL for ' + obligation.target_id + ': a completed run failed'
          : 'required UI coverage missing for ' + obligation.target_id);
      }
      if (obligation.independent_review_required && assessment?.independence !== 'independent') result.blockers.push('required independent review missing');
      if (obligation.baseline_required && !(phase === 'repair' ? ['PASS', 'FAIL'] : ['PASS']).includes(assessment?.conformance)) result.blockers.push('required design conformance unavailable');
    }
    const verified = assessmentAcceptable(result) && !result.blockers.length;
    return { ...result, consumer, verified, status: verified ? 'PASS' : 'BLOCKED' };
  } catch (error) { return { verified: false, status: 'BLOCKED', blockers: [error.message], consumer }; }
}
