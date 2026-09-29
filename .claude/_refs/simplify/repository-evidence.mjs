import { safeRepositoryPath as safeSimplifyPath, containedRepositoryFile as containedFile, repositoryGit as git, captureRepository,
  registerVolatileLedger, beginVolatileWindow, endVolatileWindow, assertVolatileLedger, assertSingleLinkWriteTarget, changedRepositoryPaths,
  validateVolatilePaths } from '../shared/repository-observation.mjs';
import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { lstatSync, readdirSync, readFileSync, realpathSync, existsSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { createApprovedArtifact, verifyApprovedArtifactGraph, validateApprovedWriteScope } from '../shared/approved-artifact.mjs';
import { resolveEvidenceArtifact } from '../shared/evidence-artifact.mjs';

export const simplifyLimits = Object.freeze({ max_passes: 2, max_files_per_pass: 5, max_total_files_without_reconfirmation: 8, max_hunks_without_reconfirmation: 20 });
export const simplifyPreservedSurfaces = Object.freeze([
  'return_values', 'output_shape', 'public_exports', 'public_types', 'public_API_and_signatures',
  'routes_status_errors_validation_order', 'side_effects_and_order', 'async_concurrency_transaction',
  'retry_timeout_cache', 'auth_permissions_tenant_approval', 'persistence_and_query',
  'rendering_DOM_accessibility', 'telemetry_and_audit', 'strings_and_prompts', 'framework_metadata', 'dependencies_and_config',
]);

const sessions = new WeakMap();
// One host process owns a change for its entire lifetime, including repair.
// A serialized payload cannot create/resume a session or reset its ledger.
const activeChanges = new Map();
const SNAPSHOT = 'simplify-repository-snapshot:v2';
const COMMAND = 'simplify-command-receipt:v2';
const PREFLIGHT = 'simplify-preflight:v2';
const PRESERVATION = 'simplify-preservation:v2';
const COMPLETION = 'simplify-completion:v2';
const hash = value => `sha256:${createHash('sha256').update(value).digest('hex')}`;
const clone = value => structuredClone(value);
const equal = isDeepStrictEqual;
const text = value => typeof value === 'string' && value.trim() !== '';
// Every equality check in a session uses the stable fingerprint: declared
// volatile caches may change inside registered command windows only.
const capture = state => {
  const snapshot = captureRepository(state);
  return { ...snapshot, fingerprint: snapshot.stable_fingerprint, full_fingerprint: snapshot.fingerprint };
};

export { safeSimplifyPath };
function inside(root, file) {
  const rel = path.relative(root, file);
  return rel === '' || (!rel.startsWith('..'+path.sep) && rel !== '..' && !path.isAbsolute(rel));
}

function issue(state, contract, body, revision) {
  const id = `${state.id}-${++state.sequence}`;
  const artifact = createApprovedArtifact({
    metadata: {
      schema_version: 1, artifact_id: id, artifact_kind: 'release-evidence', contract_id: contract,
      requirement_id: 'simplify', change_ref: state.change, track: 'workflow', stack_profile: 'node-general',
      owner_repository_id: state.owner, owner_repository_role: state.module === null ? 'standalone' : 'module', owner_module_id: state.module,
      parent_repository_id: null, parent_references: [], supersedes: null,
      approved_by: contract === COMMAND ? 'trusted-command-runner' : 'trusted-repository-snapshot',
      approval_source: contract === COMMAND ? 'trusted-command-runner' : 'trusted-repository-snapshot',
      approved_at: new Date().toISOString(), source_revision: revision,
      repository_relative_path: `.sdcorejs/evidence/simplify/${state.id}/${id}.json`,
    },
    body: JSON.stringify({ schema_version: 2, session_id: state.id, change_ref: state.change, event_sequence: state.sequence, ...body }),
  });
  state.artifacts.push(artifact);
  return { artifact_ref: artifact.metadata.repository_relative_path, approval_hash: artifact.metadata.approval_hash };
}

function resolve(state, reference, kind) {
  const errors = [];
  const result = resolveEvidenceArtifact(reference, state.artifacts, kind, errors, 'simplify evidence');
  if (!result || result.body.session_id !== state.id || result.body.change_ref !== state.change) throw new Error(errors.join('; ') || 'foreign simplify evidence');
  return result.body;
}

function saveSnapshot(state, snapshot = capture(state)) {
  const { bytes, ...body } = snapshot;
  const ref = issue(state, SNAPSHOT, body, snapshot.revision);
  state.snapshots.set(ref.approval_hash, snapshot);
  return ref;
}

function snapshotFrom(state, ref) {
  resolve(state, ref, SNAPSHOT);
  const snapshot = state.snapshots.get(ref.approval_hash);
  if (!snapshot) throw new Error('snapshot was not observed by this host');
  return snapshot;
}

function changedPaths(before, after) {
  return changedRepositoryPaths(before, after);
}

function diffHunks(before, after) {
  if (before.equals(after)) return [];
  if (before.includes(0) || after.includes(0)) throw new Error('binary source hunk mapping is unsupported');
  const temporary = mkdtempSync(path.join(tmpdir(), 'simplify-hunks-'));
  try {
    const oldPath = path.join(temporary, 'before'), newPath = path.join(temporary, 'after');
    writeFileSync(oldPath, before); writeFileSync(newPath, after);
    const result = spawnSync('git', ['-c', 'core.autocrlf=false', 'diff', '--no-index', '--no-ext-diff', '--no-textconv', '--unified=0', '--', oldPath, newPath], { encoding: 'utf8', windowsHide: true, shell: false, timeout: 30000, maxBuffer: 4 * 1024 * 1024 });
    if (result.error || ![0, 1].includes(result.status)) throw new Error('hunk observation failed');
    const hunks = [...result.stdout.matchAll(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/gmu)].map(m => ({
      old_start: Number(m[1]), old_count: m[2] === undefined ? 1 : Number(m[2]),
      new_start: Number(m[3]), new_count: m[4] === undefined ? 1 : Number(m[4]),
    }));
    if (!hunks.length) throw new Error('content change has no proven text hunks');
    return hunks;
  } finally {
    if (realpathSync.native(path.dirname(temporary)) !== realpathSync.native(tmpdir()) || !path.basename(temporary).startsWith('simplify-hunks-') || lstatSync(temporary).isSymbolicLink()) throw new Error('temporary diff cleanup containment failed');
    rmSync(temporary, { recursive: true, force: true });
  }
}

/** Actual text hunks (old/new coordinates) between two byte buffers. */
export function simplifyDiffHunks(before, after) {
  return diffHunks(Buffer.from(before ?? ''), Buffer.from(after ?? ''));
}

function covers(allowed, selected) {
  return allowed.path === selected.path && allowed.start_line <= selected.start_line && allowed.end_line >= selected.end_line;
}

function lineCount(bytes) {
  const value = bytes.toString('utf8');
  return value.length ? value.replace(/\n$/u, '').split('\n').length : 0;
}

function protectedPath(file) {
  return /(^|\/)(?:\.claude|\.cursor|\.sdcorejs|_refs|skills|prompts?|instructions?|tests?|__tests__|fixtures?|__snapshots__|snapshots?|migrations?|node_modules|vendor|dist|build|coverage|generated|codex|plugin)(\/|$)/iu.test(file) ||
    /(?:^|\/)(?:\.env[^/]*|[^/]*lock[^/]*|package\.json|[^/]*config[^/]*|[^/]*(?:\.test|\.spec)\.[^/]+)$/iu.test(file) ||
    /\.(?:mdx?|txt|rst|adoc|json|ya?ml|toml|ini|properties|lock|sql|graphql|gql|proto|csv|snap|html|css|scss)$/iu.test(file);
}

function planAllows(state, file) {
  if (!state.plan) return true;
  const matches = (pattern) => pattern === file || (pattern.endsWith('/**') && file.startsWith(pattern.slice(0, -2)));
  return state.plan.step.allowed_paths.some(matches) && !state.plan.step.prohibited_paths.some(matches);
}

function scopeCheck(state, context, baseline) {
  const files = context.scope.eligible_files, hunks = context.scope.eligible_hunks;
  if (state.hunkHistoryUnproven) throw new Error('actual hunk history is unproven; further Apply requires an authority handoff');
  if (state.ledger.reduce((sum, pass) => sum + pass.hunks.length, 0) >= 20) throw new Error('simplify hunk cap exhausted by observed passes');
  if (!files.length || !hunks.length) throw new Error('empty simplify scope cannot authorize writes');
  if (files.length > 5 || hunks.length > 20) throw new Error('simplify file/hunk cap exceeded');
  if (new Set([...state.ledger.flatMap(p => p.changed_paths), ...files]).size > 8) throw new Error('simplify total file cap exceeded');
  for (const file of files) {
    containedFile(state, file);
    if (!context.scope.requested.includes(file) || !planAllows(state, file)) throw new Error(`outside user/plan scope: ${file}`);
    if (protectedPath(file)) throw new Error(`protected source boundary: ${file}`);
    const selected = hunks.filter(h => h.path === file);
    const initialLines = lineCount(state.initial.bytes[file]), currentLines = lineCount(baseline.bytes[file]);
    const wholeFile = state.userScope.some(a => a.path === file && a.start_line === 1 && a.end_line >= initialLines);
    const shifted = !state.initial.bytes[file].equals(baseline.bytes[file]) && diffHunks(state.initial.bytes[file], baseline.bytes[file]).some(h => h.old_count !== h.new_count);
    if (shifted && (!wholeFile || state.userOwned.some(h => h.path === file))) throw new Error(`hunk coordinates changed; partial/user-owned ranges require fresh authority: ${file}`);
    const authority = wholeFile ? [{ path: file, start_line: 1, end_line: currentLines }] : state.userScope;
    if (!selected.length || selected.some(h => !authority.some(a => covers(a, h)))) throw new Error(`outside user hunk scope: ${file}`);
    const classification = state.classify?.({ path: file, content: Buffer.from(baseline.bytes[file]), fingerprint: baseline.fingerprint });
    if (classification?.kind !== 'executable' || !Array.isArray(classification.hunks) || !Array.isArray(classification.protected_surfaces)) throw new Error(`source eligibility is unproven: ${file}`);
    if (classification.protected_surfaces.length || classification.generated === true) throw new Error(`protected simplify surface: ${file}`);
    if (selected.some(h => !classification.hunks.some(a => covers(a, h)))) throw new Error(`outside eligible source hunks: ${file}`);
    const lines = currentLines;
    if (selected.some(h => h.end_line > lines)) throw new Error(`hunk exceeds baseline: ${file}`);
    const overlaps = (a, b) => a.path === b.path && a.start_line <= b.end_line && b.start_line <= a.end_line;
    if (selected.some(h => state.userOwned.some(a => overlaps(a, h)))) throw new Error(`user-owned changes are protected: ${file}`);
    if (state.initialDirty.has(file) && selected.some(h => !state.workflowHunks.some(a => covers(a, h)))) throw new Error(`dirty source ownership is unproven: ${file}`);
    if (context.action.endsWith('current-diff')) {
      const output = git(state, ['diff', 'HEAD', '--no-ext-diff', '--no-textconv', '--unified=0', '--', file]);
      const ranges = [...output.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gmu)].map(m => ({ path: file, start_line: Number(m[1]), end_line: Number(m[1]) + (m[2] === undefined ? 1 : Number(m[2])) - 1 }));
      if (selected.some(h => !ranges.some(a => covers(a, h)))) throw new Error(`outside current-diff boundary: ${file}`);
    }
  }
}

function observeActualChanges(before, after) {
  const files = changedPaths(before, after), hunks = [], unmapped = [];
  for (const file of files) {
    if (!before.bytes[file] && !after.bytes[file]) continue;
    try {
      hunks.push(...diffHunks(before.bytes[file] ?? Buffer.alloc(0), after.bytes[file] ?? Buffer.alloc(0)).map(hunk => ({ path: file, ...hunk })));
    } catch { unmapped.push(file); }
  }
  return { files, hunks, unmapped };
}

function actualScope(state, grant, after, observed = observeActualChanges(grant.before, after)) {
  const before = grant.before, { files, hunks, unmapped } = observed;
  if (before.revision !== after.revision || before.index_hash !== after.index_hash) throw new Error('Git HEAD/index writes are forbidden');
  if (unmapped.length) throw new Error(`actual hunk observation is incomplete: ${unmapped.join(', ')}`);
  for (const file of files) {
    if (protectedPath(file)) throw new Error(`protected actual write: ${file}`);
    if (!grant.context.scope.eligible_files.includes(file) || !planAllows(state, file)) throw new Error(`actual write outside scope: ${file}`);
    containedFile(state, file);
    if (before.files[file]?.kind !== 'file' || after.files[file]?.kind !== 'file' || before.files[file].mode !== after.files[file].mode) throw new Error(`addition/deletion/rename/mode boundary requires planning: ${file}`);
    for (const h of hunks.filter(hunk => hunk.path === file)) {
      const lineCount = before.bytes[file].toString('utf8').replace(/\n$/u, '').split('\n').length;
      const insideHunk = grant.context.scope.eligible_hunks.some(a => a.path === file && (h.old_count === 0
        ? h.old_start >= a.start_line && (h.old_start < a.end_line || (h.old_start === a.end_line && a.end_line === lineCount))
        : h.old_start >= a.start_line && h.old_start + h.old_count - 1 <= a.end_line));
      if (!insideHunk) throw new Error(`actual write outside authorized hunk: ${file}`);
    }
  }
  const total = new Set([...state.ledger.flatMap(p => p.changed_paths), ...files]);
  const previousHunks = state.ledger.filter(p => p.pass !== grant.pass).reduce((sum, p) => sum + p.hunks.length, 0);
  if (files.length > 5 || total.size > 8 || previousHunks + hunks.length > 20) throw new Error('simplify file/hunk cap exceeded');
  return { files, hunks };
}

function validateCommand(state, spec) {
  if (!Array.isArray(spec?.command) || !spec.command.length || !spec.command.every(value => typeof value === 'string' && !value.includes('\0')) || !text(spec.command[0])) throw new Error('non-empty command argument array is required');
  if (!Array.isArray(spec.scope) || !spec.scope.length || spec.scope.some(h => !h || !safeSimplifyPath(h.path) || !Number.isInteger(h.start_line) || h.start_line < 1 || !Number.isInteger(h.end_line) || h.end_line < h.start_line)) throw new Error('command scope must contain valid source hunks');
  if (!state.commands.some(command => equal(command, spec))) throw new Error('command/cwd/scope is not the host-selected verification oracle');
  const cwd = spec.cwd === '.' ? state.root : containedDirectory(state, spec.cwd);
  return cwd;
}

function containedDirectory(state, relative) {
  if (!safeSimplifyPath(relative)) throw new Error('unsafe command cwd');
  let current = state.root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if (lstatSync(current).isSymbolicLink() || !inside(state.root, realpathSync.native(current)) || existsSync(path.join(current, '.git'))) throw new Error('command cwd crosses owner root');
  }
  if (!lstatSync(current).isDirectory()) throw new Error('command cwd must be a directory');
  return current;
}

function run(state, spec) {
  const cwd = validateCommand(state, spec), before = capture(state), started = new Date().toISOString();
  const window = beginVolatileWindow(state.volatileLedger, 'command', before);
  const result = spawnSync(spec.command[0], spec.command.slice(1), { cwd, shell: false, windowsHide: true, encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024 });
  let after;
  try { after = capture(state); } finally { endVolatileWindow(window, after); }
  const stable = before.fingerprint === after.fingerprint;
  return issue(state, COMMAND, {
    kind: 'command-receipt', command: clone(spec.command), cwd: spec.cwd, real_cwd: cwd,
    owner_repository_id: state.owner, root: state.root, scope: clone(spec.scope),
    source_revision: before.revision, source_fingerprint: before.fingerprint, after_fingerprint: after.fingerprint,
    exit_code: result.status, result: !result.error && result.status === 0 && stable ? 'passed' : 'failed',
    interrupted: Boolean(result.error || result.signal), content_stable: stable,
    started_at: started, finished_at: new Date().toISOString(), output_digest: hash(`${result.stdout ?? ''}\n${result.stderr ?? ''}`),
  }, before.revision);
}

function verifyCommands(state, refs, snapshot, selected, minimumSequence = 0) {
  if (!state.commands.length || !Array.isArray(refs) || refs.length !== state.commands.length) throw new Error('focused command receipts are missing');
  const receipts = refs.map(ref => resolve(state, ref, COMMAND));
  for (const spec of state.commands) {
    const receipt = receipts.find(r => equal(r.command, spec.command) && r.cwd === spec.cwd && equal(r.scope, spec.scope));
    if (!receipt || receipt.result !== 'passed' || receipt.exit_code !== 0 || receipt.interrupted || !receipt.content_stable) throw new Error('focused verification failed or command mutated source');
    if (receipt.event_sequence <= minimumSequence) throw new Error('after command must run after the preflight or failed-pass event');
    if (receipt.source_fingerprint !== snapshot.fingerprint || receipt.after_fingerprint !== snapshot.fingerprint || receipt.source_revision !== snapshot.revision) throw new Error('stale command evidence: working-tree content differs');
  }
  if (selected.some(h => !state.commands.some(spec => spec.scope.some(a => covers(a, h))))) throw new Error('verification does not cover selected hunks');
}

function identity(state, context) {
  if (context.session_id !== state.id || context.artifact_context.change_ref !== state.change) throw new Error('simplify session/change identity mismatch');
  if (context.artifact_identity.owner_repository_id !== state.owner || context.artifact_identity.owner_module_id !== state.module || context.artifact_identity.execution_host_repository_id !== state.host || realpathSync.native(context.target_root) !== state.root) throw new Error('simplify owner or Git root mismatch');
  if (!equal(context.approved_plan_step, state.plan?.reference ?? null)) throw new Error('approved plan step must come from trusted authority');
  if (context.invocation === 'approved-plan' && !state.plan) throw new Error('approved-plan authority is missing');
  if (context.scope.expansions.length) throw new Error('scope expansion requires a new approved authority and planning handoff');
}

function preflight(state, context) {
  identity(state, context);
  if (state.repaired) throw new Error('simplify/repair recursion is forbidden');
  if (!equal(context.passes, state.ledger)) throw new Error('pass ledger omitted, reset or forged');
  const before = snapshotFrom(state, context.baseline.snapshot), current = capture(state);
  assertVolatileLedger(state.volatileLedger, current);
  if (before.fingerprint !== current.fingerprint || context.source_revision !== current.revision || current.fingerprint !== state.expectedFingerprint) throw new Error('preflight baseline is stale or contains unaccounted writes');
  const apply = context.action.startsWith('apply-');
  if (!apply && state.ledger.length) throw new Error('Analyze cannot replace verification of an earlier Apply pass');
  if (state.pending) throw new Error('previous pass has not completed or failed pass was not rolled back');
  if (apply) {
    if (state.ledger.length >= 2) throw new Error('simplify pass cap exceeded');
    if (typeof state.preserve !== 'function' || typeof state.classify !== 'function') throw new Error('no behavior/preservation oracle; Analyze-only');
    scopeCheck(state, context, before);
    verifyCommands(state, context.verification.before, before, context.scope.eligible_hunks);
    const buffers = () => Object.fromEntries(Object.entries(before.bytes).map(([file, bytes]) => [file, Buffer.from(bytes)]));
    const applicability = state.preserve({ before: buffers(), after: buffers(), changed_paths: [], before_fingerprint: before.fingerprint, after_fingerprint: before.fingerprint });
    for (const surface of simplifyPreservedSurfaces) {
      const item = applicability?.[surface];
      if (!item || !text(item.reason) || !['verified', 'not-applicable'].includes(item.status) || (['strings_and_prompts', 'dependencies_and_config'].includes(surface) && item.status !== 'verified')) throw new Error(`preservation applicability is unproven: ${surface}`);
    }
    if (capture(state).fingerprint !== before.fingerprint) throw new Error('preflight inspector changed source');
  }
  const ref = issue(state, PREFLIGHT, { baseline: context.baseline.snapshot, action: context.action, scope: context.scope }, before.revision);
  const grant = { ref, before, context: clone(context), pass: apply ? state.ledger.length + 1 : null, edited: false, minimumAfterSequence: state.sequence };
  state.grants.set(ref.approval_hash, grant);
  if (apply) {
    state.pending = grant;
    state.ledger.push({ pass: grant.pass, preflight_ref: clone(ref), before_snapshot: clone(context.baseline.snapshot), after_snapshot: null, changed_paths: [], hunks: [], verification_result: 'not-run', reverted: false, rollback_snapshot: null, rollback_receipts: [] });
  }
  return { status: apply ? 'authorized' : 'analyzed', write_authorized: apply, preflight_ref: clone(ref), evidence_current: true };
}

function grantFrom(state, reference) {
  resolve(state, reference, PREFLIGHT);
  const grant = state.grants.get(reference.approval_hash);
  if (!grant) throw new Error('preflight authority was not issued by this host');
  return grant;
}

function sameAuthorization(context, grant) {
  return ['action', 'invocation', 'artifact_identity', 'source_revision', 'approved_plan_step', 'target_root', 'target_root_kind', 'scope', 'limits', 'artifact_context'].every(key => equal(context[key], grant.context[key])) &&
    equal(context.baseline, grant.context.baseline) && equal(context.verification.before, grant.context.verification.before);
}

function postflight(state, context) {
  identity(state, context);
  const grant = grantFrom(state, context.preflight_ref);
  if (!sameAuthorization(context, grant) || !equal(context.passes, state.ledger)) throw new Error('postflight changed authority or pass ledger');
  const output = clone(context), apply = context.action.startsWith('apply-');
  let after;
  try { after = capture(state); }
  catch (error) {
    if (apply && state.pending === grant) {
      state.hunkHistoryUnproven = true;
      state.ledger[grant.pass - 1].verification_result = 'failed';
      grant.minimumAfterSequence = ++state.sequence;
    }
    throw error;
  }
  const actual = changedPaths(grant.before, after), errors = [];
  if (!apply) {
    if (grant.before.fingerprint !== after.fingerprint) throw new Error('Analyze mode must remain read-only: actual repository writes observed');
    // Analyze never carries caller-declared verification: every referenced receipt
    // must resolve in this session, and unrun checks stay unrun.
    for (const reference of [...context.verification.before, ...context.verification.after]) resolve(state, reference, COMMAND);
    if (context.verification.preservation) resolve(state, context.verification.preservation, PRESERVATION);
    output.verification.git_diff_check = 'not-run';
    output.verification.behavior_verification = 'not-verified';
    for (const surface of simplifyPreservedSurfaces) output.preserved_surfaces[surface] = 'pending';
    output.result.status = 'analyzed'; output.result.files_changed = [];
  } else {
    if (state.repaired) throw new Error('simplify/repair recursion is forbidden');
    const entry = state.ledger[grant.pass - 1];
    if (state.pending !== grant) throw new Error('no active simplify pass; completed authority cannot be replayed');
    const observed = observeActualChanges(grant.before, after);
    if (observed.unmapped.length) state.hunkHistoryUnproven = true;
    const previouslyFailed = entry.verification_result === 'failed';
    // Path of the pass: its eligible files plus every path the host wrote for it.
    const passPaths = [...new Set([...grant.context.scope.eligible_files, ...(grant.edited_paths ?? []), ...entry.changed_paths])].sort();
    const concurrent = observed.files.filter(file => !passPaths.includes(file));
    let reverted = false;
    if (previouslyFailed) {
      // Scoped rollback (D-005): pass paths return to the exact checkpoint; unrelated
      // concurrent edits are preserved and listed; edits to pass paths, protected
      // paths or verification inputs block.
      const inputs = new Set(state.commands.flatMap(spec => spec.scope.map(item => item.path)));
      for (const file of concurrent) {
        if (protectedPath(file) || inputs.has(file)) errors.push(`concurrent change on a protected path or verification input blocks rollback: ${file}`);
        if (state.oraclePaths.includes(file)) errors.push(`concurrent change on an oracle module blocks rollback: ${file}`);
      }
      reverted = passPaths.every(file => Buffer.from(after.bytes[file] ?? '').equals(Buffer.from(grant.before.bytes[file] ?? '')) && equal(after.files[file], grant.before.files[file]));
      if (!reverted) errors.push('failed simplify pass was not rolled back to its exact checkpoint');
      output.result.concurrent_changes = concurrent;
    } else {
      try { actualScope(state, grant, after, observed); } catch (error) { errors.push(error.message); }
    }
    try { verifyCommands(state, context.verification.after, after, context.scope.eligible_hunks, grant.minimumAfterSequence); } catch (error) { errors.push(error.message); }
    let preservation = null;
    try {
      const buffers = source => Object.fromEntries(Object.entries(source.bytes).map(([file, bytes]) => [file, Buffer.from(bytes)]));
      preservation = state.preserve({ before: buffers(grant.before), after: buffers(after), changed_paths: actual, before_fingerprint: grant.before.fingerprint, after_fingerprint: after.fingerprint });
      for (const surface of simplifyPreservedSurfaces) {
        const item = preservation?.[surface];
        if (!item || !text(item.reason) || !['verified', 'not-applicable'].includes(item.status) || (['strings_and_prompts', 'dependencies_and_config'].includes(surface) && item.status !== 'verified')) throw new Error(`preservation unproven: ${surface}`);
        output.preserved_surfaces[surface] = item.status;
      }
      if (capture(state).fingerprint !== after.fingerprint) throw new Error('preservation checker changed source');
      output.verification.preservation = issue(state, PRESERVATION, { before_fingerprint: grant.before.fingerprint, after_fingerprint: after.fingerprint, checks: preservation }, after.revision);
    } catch (error) { errors.push(error.message); }
    // Whitespace check covers only lines this pass added, under repository rules.
    try {
      const whitespace = passWhitespaceErrors(state, grant.before, after, passPaths);
      if (whitespace.length) { errors.push(...whitespace.map(message => `git diff --check failed: ${message}`)); output.verification.git_diff_check = 'failed'; }
      else output.verification.git_diff_check = 'passed';
    } catch (error) { errors.push(`git diff --check failed: ${error.message}`); output.verification.git_diff_check = 'failed'; }
    if (capture(state).fingerprint !== after.fingerprint) errors.push('repository changed during postflight; evidence is stale');
    const observedSnapshot = saveSnapshot(state, after);
    if (reverted && !errors.length) {
      // Preserve the failed attempt's original files, hunks and failure result.
      // Rollback is separate evidence, not a rewrite of history into a pass.
      entry.reverted = true;
      entry.rollback_snapshot = observedSnapshot;
      entry.rollback_receipts = clone(context.verification.after);
    } else if (!previouslyFailed) {
      entry.after_snapshot = observedSnapshot;
      entry.changed_paths = observed.files; entry.hunks = observed.hunks;
      entry.verification_result = errors.length ? 'failed' : 'passed'; entry.reverted = false;
    }
    if (!errors.length) { state.pending = null; grant.completed = true; state.expectedFingerprint = after.fingerprint; }
    else { state.pending = grant; grant.completed = false; grant.minimumAfterSequence = state.sequence; }
    output.passes = clone(state.ledger);
    output.verification.behavior_verification = errors.length ? 'not-verified' : 'covered-by-current-tests';
    output.result.status = errors.length ? 'blocked' : reverted ? 'reverted' : actual.length ? 'simplified' : 'unchanged';
    output.result.files_changed = changedPaths(state.initial, after);
  }
  output.verification.blockers = errors;
  output.result.receipt = null;
  if (!errors.length) {
    const receipt = issue(state, COMPLETION, { fingerprint: after.fingerprint, context: output }, after.revision);
    output.result.receipt = receipt;
    state.completions.set(receipt.approval_hash, { context: clone(output), fingerprint: after.fingerprint });
  }
  return { status: errors.length ? 'blocked' : apply ? 'verified' : 'analyzed', write_authorized: false, evidence_current: !errors.length, actual_changed_paths: clone(actual), context: output, blockers: errors };
}

function consume(state, context, consumer) {
  identity(state, context);
  if (!['sdcorejs-test', 'sdcorejs-review', 'sdcorejs-repair-loop', 'sdcorejs-ship', 'sdcorejs-git'].includes(consumer)) throw new Error('unknown simplify consumer');
  // Test/repair can accept structurally valid, stale context for revalidation or
  // diagnostics. They never promote it to current verification or write authority.
  const pending = state.pending;
  const observed = capture(state);
  let current = false, outcome = null;
  if (context.result.receipt) {
    resolve(state, context.result.receipt, COMPLETION);
    const completion = state.completions.get(context.result.receipt.approval_hash);
    current = Boolean(completion && equal(context, completion.context) && equal(context.passes, state.ledger) && !state.repaired && !pending && completion.fingerprint === observed.fingerprint);
    // The outcome comes from the host-held completion, never from the payload. Like a runner
    // verdict it follows the composite diff: when any pass path still differs from the
    // session start, simplified code is in the tree, whatever the last pass did.
    const status = completion?.context?.result?.status ?? null;
    const passPaths = new Set(state.ledger.flatMap(entry => entry.changed_paths ?? []));
    const netChanged = (completion?.context?.result?.files_changed ?? []).some(file => passPaths.has(file));
    outcome = ['reverted', 'unchanged'].includes(status) && netChanged ? 'simplified' : status;
  }
  if (!current && !['sdcorejs-test', 'sdcorejs-repair-loop'].includes(consumer)) throw new Error('stale or unverified post-simplification evidence');
  if (consumer === 'sdcorejs-repair-loop' && pending) throw new Error('failed or pending simplify pass must be verified or rolled back before repair');
  const applied = context.action.startsWith('apply-');
  return { status: current ? (applied ? 'verified' : 'analyzed') : 'revalidation-required', evidence_current: current, outcome,
    analysis_current: current && !applied, verification_current: current && applied,
    source_revision: observed.revision, source_fingerprint: observed.fingerprint, owner_repository_id: state.owner, write_authorized: false, blockers: [] };
}

// Read-only registry query: finish looks up the in-process session for (root, change)
// so omitting simplify_context cannot hide a pending pass.
export function findSimplifySession(root, changeRef) {
  let key;
  try { key = `${realpathSync.native(root)}\0${changeRef}`; } catch { return null; }
  const session = activeChanges.get(key);
  const state = session && sessions.get(session);
  if (!state) return null;
  return { session_id: state.id, pending: Boolean(state.pending), repaired: state.repaired, ledger: clone(state.ledger) };
}

function whitespaceRules(state, file) {
  const rules = { 'blank-at-eol': true, 'space-before-tab': true, 'blank-at-eof': true, 'cr-at-eol': false };
  const apply = spec => {
    for (const token of String(spec ?? '').split(',').map(item => item.trim()).filter(Boolean)) {
      const enabled = !token.startsWith('-'), name = token.replace(/^-/u, '');
      if (name === 'trailing-space') { rules['blank-at-eol'] = enabled; rules['blank-at-eof'] = enabled; }
      else if (Object.hasOwn(rules, name)) rules[name] = enabled;
    }
  };
  apply(git(state, ['config', '--get', 'core.whitespace'], [0, 1]).trim());
  const attributes = Object.fromEntries(git(state, ['check-attr', 'whitespace', 'eol', '--', file]).split(/\r?\n/u).filter(Boolean)
    .map(line => line.split(': ').slice(1)).filter(parts => parts.length === 2));
  if (attributes.whitespace === 'unset') for (const key of Object.keys(rules)) rules[key] = false;
  else if (attributes.whitespace && !['set', 'unspecified'].includes(attributes.whitespace)) apply(attributes.whitespace);
  if (attributes.eol === 'crlf') rules['cr-at-eol'] = true;
  return rules;
}

// Whitespace errors introduced by the lines a pass added, compared with its checkpoint.
function passWhitespaceErrors(state, before, after, files) {
  const errors = [];
  for (const file of files) {
    const previous = Buffer.from(before.bytes[file] ?? ''), next = after.bytes[file] ? Buffer.from(after.bytes[file]) : null;
    if (!next || previous.equals(next)) continue;
    const rules = whitespaceRules(state, file);
    const previousText = previous.toString('utf8'), nextText = next.toString('utf8');
    // A checkpoint that already used CRLF line endings keeps CR as part of the line ending.
    const crlf = rules['cr-at-eol'] || (previousText.includes('\r\n') && !/(^|[^\r])\n/u.test(previousText));
    const lines = nextText.split('\n');
    for (const hunk of diffHunks(previous, next)) {
      for (let number = hunk.new_start; number < hunk.new_start + hunk.new_count; number += 1) {
        let line = lines[number - 1] ?? '';
        if (crlf && line.endsWith('\r')) line = line.slice(0, -1);
        if (rules['blank-at-eol'] && /[ \t\r]+$/u.test(line)) errors.push(`${file}:${number}: trailing whitespace`);
        if (rules['space-before-tab'] && / \t/u.test(line.match(/^[ \t]*/u)[0])) errors.push(`${file}:${number}: space before tab in indent`);
        if (/^(?:<{7}|>{7}|={7})(?: |$)/u.test(line)) errors.push(`${file}:${number}: leftover conflict marker`);
      }
    }
    if (rules['blank-at-eof'] && /\n[ \t\r]*\n$/u.test(nextText) && !/\n[ \t\r]*\n$/u.test(previousText)) errors.push(`${file}: new blank line at end of file`);
  }
  return errors;
}

/**
 * HEAD content as checkout writes it (smudge filters and end-of-line conversion),
 * so an autocrlf work tree compares equal to its committed file. Null when absent.
 */
export function filteredHeadBlob(root, file) {
  const result = spawnSync('git', ['--no-optional-locks', 'cat-file', '--filters', `HEAD:${file}`], { cwd: root, windowsHide: true, shell: false, timeout: 30000, maxBuffer: 16 * 1024 * 1024 });
  return result.error || result.status !== 0 ? null : Buffer.from(result.stdout);
}
const headBlob = filteredHeadBlob;

const hunkRange = (file, hunk) => ({ path: file, start_line: Math.max(hunk.new_start, 1), end_line: Math.max(hunk.new_start, 1) + Math.max(hunk.new_count, 1) - 1 });

/**
 * Hunk ownership for a host-snapshot anchor (A7), in anchor coordinates. Workflow
 * hunks come from observed implementation windows whose output is still the anchor
 * content. User-owned hunks are the lines already dirty against HEAD when the
 * runtime started; when such a file changed afterwards, the whole file stays
 * user-owned because its line mapping is unproven.
 */
export function deriveHostHunkOwnership({ root, files = [], anchor, initial, windows = [] } = {}) {
  const workflow = [], userOwned = [];
  for (const file of files) {
    if (!anchor?.bytes?.[file]) continue;
    const anchored = Buffer.from(anchor.bytes[file]), head = headBlob(root, file);
    const start = initial?.bytes?.[file] ? Buffer.from(initial.bytes[file]) : null;
    if (start && !(head && head.equals(start))) {
      if (anchored.equals(start)) userOwned.push(...diffHunks(head ?? Buffer.alloc(0), start).map(hunk => hunkRange(file, hunk)));
      else userOwned.push({ path: file, start_line: 1, end_line: Math.max(lineCount(anchored), 1) });
    }
    for (const window of windows) {
      const written = window?.after?.bytes?.[file] ? Buffer.from(window.after.bytes[file]) : null;
      const previous = window?.before?.bytes?.[file] ? Buffer.from(window.before.bytes[file]) : Buffer.alloc(0);
      if (!written || !written.equals(anchored) || previous.equals(written)) continue;
      workflow.push(...diffHunks(previous, written).map(hunk => hunkRange(file, hunk)));
    }
  }
  return { workflow_hunks: workflow, user_owned_hunks: userOwned };
}

function stepAllows(step, file) {
  const matches = pattern => pattern === file || pattern === '**' || (pattern.endsWith('/**') && file.startsWith(pattern.slice(0, -2)));
  return Array.isArray(step?.allowed_paths) && step.allowed_paths.some(matches) && !(step.prohibited_paths ?? []).some(matches);
}

function hunkInside(hunk, allowed, lines) {
  return allowed.some(a => a.path === hunk.path && (hunk.old_count === 0
    ? hunk.old_start >= a.start_line && (hunk.old_start < a.end_line || (hunk.old_start === a.end_line && a.end_line === lines))
    : hunk.old_start >= a.start_line && hunk.old_start + hunk.old_count - 1 <= a.end_line));
}

/**
 * Consumer-side re-derivation of a host-runner receipt (D-004). The before-state
 * comes only from the consumer's own anchor: a host-held snapshot or HEAD. Every
 * receipt field is an index that must match what the consumer recomputes.
 */
export function revalidateSimplifyHostReceipt(input = {}) {
  const blockers = [];
  const result = extra => ({ verified: blockers.length === 0, outcome: blockers.length ? 'blocked' : extra.outcome, pass_paths: blockers.length ? [] : extra.pass_paths, blockers });
  const { receipt, authority, anchor } = input;
  const chain = [...(input.chain ?? []), receipt];
  try {
    if (!['head', 'host-snapshot'].includes(anchor?.kind)) throw new Error('a head or host-snapshot anchor held by the consumer is required');
    if (anchor.kind === 'host-snapshot' && !anchor.snapshot?.bytes) throw new Error('host-snapshot anchors can only be revalidated by the host that captured them');
    for (const [index, item] of chain.entries()) {
      if (item?.kind !== 'simplify-host-receipt:v1' || item.schema_version !== 1) throw new Error('host receipt kind/schema is invalid');
      if (item.repository_id !== input.repository_id || item.change_ref !== input.change_ref) throw new Error('host receipt identity differs from the consumer');
      if (item.plan?.approval_hash !== authority?.plan?.approval_hash || item.plan?.step_id !== authority?.step?.step_id) throw new Error('host receipt plan identity differs from the consumer authority');
      if (!['verified', 'reverted'].includes(item.status)) throw new Error(`host receipt ${index + 1} is not a completed pass (${item.status})`);
      if (!Array.isArray(item.pass_paths) || item.pass_paths.length > simplifyLimits.max_files_per_pass || new Set(item.pass_paths).size !== item.pass_paths.length || !item.pass_paths.every(safeSimplifyPath)) throw new Error('host receipt pass paths are invalid');
    }
    if (chain.length > simplifyLimits.max_passes) throw new Error('simplify pass cap exceeded across the receipt chain');
    const root = realpathSync.native(input.root);
    const union = [...new Set(chain.flatMap(item => item.pass_paths))].sort();
    if (union.length > simplifyLimits.max_total_files_without_reconfirmation) throw new Error('simplify total file cap exceeded across the receipt chain');
    const requested = input.requested_scope ?? {};
    const anchorBytes = file => anchor.kind === 'host-snapshot' ? (anchor.snapshot.bytes[file] ? Buffer.from(anchor.snapshot.bytes[file]) : null) : headBlob(root, file);
    const currentBytes = file => (input.after?.bytes?.[file] ? Buffer.from(input.after.bytes[file]) : (() => { try { return readFileSync(containedFile({ root }, file)); } catch { return null; } })());
    const before = {}, after = {};
    for (const file of union) {
      if (protectedPath(file)) throw new Error(`protected simplify path: ${file}`);
      if (!stepAllows(authority.step, file)) throw new Error(`outside the approved plan step: ${file}`);
      if (!Array.isArray(requested.files) || !requested.files.includes(file)) throw new Error(`outside the requested simplify scope: ${file}`);
      before[file] = anchorBytes(file); after[file] = currentBytes(file);
      if (!before[file]) throw new Error(`before-state of ${file} is unavailable at the ${anchor.kind} anchor`);
      if (!after[file]) throw new Error(`current content of ${file} is unavailable`);
    }
    // Chain continuity: the first pass starts at the anchor, each pass starts where the previous ended.
    const expected = Object.fromEntries(union.map(file => [file, hash(before[file])]));
    for (const item of chain) {
      for (const file of item.pass_paths) {
        if (item.before?.[file] !== expected[file]) throw new Error(`receipt before-state of ${file} does not match the ${anchor.kind} anchor or the previous pass`);
        // A reverted pass restored its checkpoint, so its after-state is its before-state.
        if (item.status === 'reverted' && item.after?.[file] !== item.before?.[file]) throw new Error(`reverted receipt does not restore the before-state of ${file}`);
        expected[file] = item.after?.[file];
      }
    }
    for (const file of union) if (expected[file] !== hash(after[file])) throw new Error(`receipt after-state of ${file} does not match current content`);
    let hunkTotal = 0, changed = false;
    for (const file of union) {
      if (before[file].equals(after[file])) continue;
      changed = true;
      const hunks = diffHunks(before[file], after[file]).map(hunk => ({ path: file, ...hunk }));
      hunkTotal += hunks.length;
      const lines = lineCount(before[file]);
      if (hunks.some(hunk => !hunkInside(hunk, requested.hunks ?? [], lines))) throw new Error(`actual change outside the requested hunks: ${file}`);
      const classification = authority.oracles?.classify_source?.({ path: file, content: Buffer.from(before[file]), fingerprint: hash(before[file]) });
      if (classification?.kind !== 'executable' || !Array.isArray(classification.hunks) || !Array.isArray(classification.protected_surfaces) || classification.protected_surfaces.length) throw new Error(`source eligibility is unproven: ${file}`);
      if (hunks.some(hunk => !hunkInside(hunk, classification.hunks, lines))) throw new Error(`actual change outside eligible source hunks: ${file}`);
      // A file that is not in HEAD is dirty too: its changed lines need proven ownership.
      const head = anchor.kind === 'host-snapshot' ? headBlob(root, file) : null;
      if (anchor.kind === 'host-snapshot' && !(head && head.equals(before[file]))) {
        const overlaps = (a, b) => a.path === b.path && a.start_line <= b.old_start + Math.max(b.old_count, 1) - 1 && b.old_start <= a.end_line;
        if (hunks.some(hunk => (input.user_owned_hunks ?? []).some(owned => overlaps(owned, hunk)))) throw new Error(`user-owned changes are protected: ${file}`);
        if (hunks.some(hunk => !hunkInside(hunk, input.workflow_hunks ?? [], lines))) throw new Error(`dirty source ownership is unproven: ${file}`);
      }
    }
    if (hunkTotal > simplifyLimits.max_hunks_without_reconfirmation) throw new Error('simplify hunk cap exceeded across the receipt chain');
    if (changed) {
      // Oracles receive Buffer copies, as in a host session (a structured clone would
      // hand them Uint8Arrays and silently change how they read text).
      const buffers = source => Object.fromEntries(Object.entries(source).map(([file, bytes]) => [file, Buffer.from(bytes)]));
      const preservation = authority.oracles?.verify_preservation?.({ before: buffers(before), after: buffers(after), changed_paths: union.filter(file => !before[file].equals(after[file])), before_fingerprint: hash(JSON.stringify(expected)), after_fingerprint: hash(JSON.stringify(union.map(file => hash(after[file])))) });
      for (const surface of simplifyPreservedSurfaces) {
        const item = preservation?.[surface];
        if (!item || !text(item.reason) || !['verified', 'not-applicable'].includes(item.status) || (['strings_and_prompts', 'dependencies_and_config'].includes(surface) && item.status !== 'verified')) throw new Error(`preservation unproven: ${surface}`);
      }
    }
    if (input.run_verification !== false) {
      if (!Array.isArray(authority.commands) || authority.commands.length === 0) throw new Error('fresh verification commands are required');
      // Fresh commands run inside command windows of the shared host ledger, so a
      // finish or UI runtime in this process accepts their declared cache writes.
      const volatile = validateVolatilePaths(input.volatile_paths ?? []);
      const observe = () => captureRepository({ root, owner: input.repository_id, volatile, guarded: [] });
      const ledger = registerVolatileLedger({ root, change_ref: input.change_ref, volatile_paths: volatile, snapshot: observe() });
      for (const spec of authority.commands) {
        const window = beginVolatileWindow(ledger, 'command', observe());
        // A failed capture still closes the window; without a snapshot nothing is recorded.
        let run, observed;
        try {
          run = spawnSync(spec.command[0], spec.command.slice(1), { cwd: spec.cwd === '.' ? root : containedDirectory({ root }, spec.cwd), shell: false, windowsHide: true, encoding: 'utf8', timeout: 120000, maxBuffer: 4 * 1024 * 1024 });
          observed = observe();
        } finally { endVolatileWindow(window, observed); }
        if (run.error || run.signal || run.status !== 0) throw new Error(`fresh verification failed: ${spec.command.join(' ')}`);
      }
      for (const file of union) if (!currentBytes(file)?.equals(after[file])) throw new Error(`verification changed ${file}`);
    }
    // The outcome follows the composite diff: simplified code in the tree is never
    // reported as reverted, whatever the last pass did.
    return result({ outcome: changed ? 'simplified' : receipt.status === 'reverted' ? 'reverted' : 'unchanged', pass_paths: union });
  } catch (error) {
    blockers.push(error.message);
    return result({});
  }
}

export function evaluateRepositoryEvidence(context, runtime, phase) {
  const state = sessions.get(runtime?.session);
  if (!state) return { status: 'blocked', write_authorized: false, evidence_current: false, blockers: ['trusted simplify evidence session is required'] };
  try {
    return phase === 'preflight' ? preflight(state, context) : phase === 'postflight' ? postflight(state, context) : consume(state, context, runtime.consumer);
  } catch (error) {
    let actual = [];
    try { actual = changedPaths(state.initial, capture(state)); } catch { /* report original observation failure */ }
    return { status: 'blocked', write_authorized: false, evidence_current: false, blockers: [error.message], actual_changed_paths: actual };
  }
}

export function createSimplifyEvidenceSession(options) {
  if (!options || !text(options.root) || !text(options.repository_id) || !text(options.change_ref)) throw new Error('trusted root, owner and change are required');
  const state = {
    id: randomUUID(), root: realpathSync.native(options.root), owner: options.repository_id,
    host: options.execution_host_repository_id ?? options.repository_id, module: options.owner_module_id ?? null, change: options.change_ref,
    userScope: clone(options.user_scope ?? []), userOwned: clone(options.user_owned_hunks ?? []), workflowHunks: clone(options.workflow_hunks ?? []),
    classify: options.classify_source, preserve: options.verify_preservation, commands: clone(options.verification_commands ?? []),
    artifacts: [], snapshots: new Map(), grants: new Map(), completions: new Map(), ledger: [], sequence: 0, pending: null, repaired: false, hunkHistoryUnproven: false, plan: null,
    volatile: validateVolatilePaths(options.volatile_paths ?? []),
    // The trusted oracle import closure; a concurrent change to it blocks rollback.
    oraclePaths: [...new Set(options.oracle_paths ?? [])],
  };
  if (!state.oraclePaths.every(safeSimplifyPath)) throw new Error('oracle paths must be safe repository paths');
  // Scope, command and oracle paths (and their ancestors) may never be links; volatile
  // paths may never be scope or verification inputs.
  state.guarded = [...new Set([...state.userScope.map(item => item?.path), ...state.commands.flatMap(spec => (spec?.scope ?? []).map(item => item?.path)), ...state.oraclePaths].filter(file => typeof file === 'string'))];
  for (const file of state.guarded) {
    const pattern = state.volatile.find(item => file === item || (item.endsWith('/**') && (file === item.slice(0, -3) || file.startsWith(item.slice(0, -2)))));
    if (pattern) throw new Error(`volatile path ${pattern} intersects simplify scope ${file}`);
  }
  const key = `${state.root}\0${state.change}`;
  if (activeChanges.has(key)) throw new Error('reuse the existing host session; change history cannot be reset');
  if (options.approved_plan) {
    const { artifact, parents, step_id: stepId, resolve_step: resolveStep, approval_hash: expectedHash } = options.approved_plan;
    verifyApprovedArtifactGraph(artifact, parents);
    if (typeof resolveStep !== 'function' || !text(stepId)) throw new Error('trusted approved step loader is required; do not accept a payload step projection');
    const step = resolveStep({ artifact: clone(artifact), step_id: stepId });
    if (artifact.metadata.approval_hash !== expectedHash || artifact.metadata.artifact_kind !== 'plan' || artifact.metadata.owner_repository_id !== state.owner || artifact.metadata.owner_module_id !== state.module || step?.owner_repository_id !== state.owner || step.step_id !== stepId) throw new Error('approved plan owner/hash/step mismatch');
    validateApprovedWriteScope(artifact.metadata, step);
    state.plan = { step: clone(step), reference: { artifact_ref: artifact.metadata.repository_relative_path, approval_hash: expectedHash, step_id: step.step_id } };
  }
  state.initial = capture(state);
  if (options.approved_plan && options.approved_plan.artifact.metadata.source_revision !== state.initial.revision) throw new Error('approved plan source revision is stale');
  state.volatileLedger = registerVolatileLedger({ root: state.root, change_ref: state.change, volatile_paths: state.volatile, snapshot: state.initial });
  state.expectedFingerprint = state.initial.fingerprint;
  state.initialDirty = new Set([
    ...git(state, ['diff', 'HEAD', '--name-only', '-z']).split('\0'),
    ...git(state, ['ls-files', '--others', '--exclude-standard', '-z']).split('\0'),
  ].filter(Boolean));
  const session = Object.freeze({
    id: state.id,
    captureSnapshot: () => saveSnapshot(state),
    runVerification: spec => run(state, spec),
    ledger: () => clone(state.ledger),
    evidenceArtifacts: () => clone(state.artifacts),
    recordRepair: () => { state.repaired = true; },
    applyEdits: (reference, edits) => {
      const grant = grantFrom(state, reference);
      if (state.repaired || state.pending !== grant || grant.edited || !grant.context.action.startsWith('apply-')) throw new Error('no current write authority');
      const current = capture(state);
      if (current.fingerprint !== grant.before.fingerprint) throw new Error('preflight baseline is stale at write boundary');
      if (!Array.isArray(edits) || !edits.length || new Set(edits.map(e => e.path)).size !== edits.length) throw new Error('edits must be a non-empty unique file list');
      const candidate = { ...current, files: clone(current.files), bytes: { ...current.bytes } };
      for (const edit of edits) {
        // Every target is checked before any byte is written, including its link count.
        const file = assertSingleLinkWriteTarget(state, edit.path);
        if (typeof edit.content !== 'string') throw new Error('source edit content must be text');
        const bytes = Buffer.from(edit.content);
        candidate.bytes[edit.path] = bytes;
        candidate.files[edit.path] = { class: 'content', kind: 'file', mode: lstatSync(file).mode, sha256: hash(bytes) };
      }
      actualScope(state, grant, candidate);
      // Host must hold exclusive edit ownership for this synchronous batch. Other
      // writers invalidate snapshots; this API is not an OS filesystem sandbox.
      const window = beginVolatileWindow(state.volatileLedger, 'apply', current);
      let after;
      try {
        for (const edit of edits) writeFileSync(assertSingleLinkWriteTarget(state, edit.path), candidate.bytes[edit.path]);
        after = capture(state);
      } finally { endVolatileWindow(window, after); }
      grant.edited = true; grant.edited_paths = edits.map(edit => edit.path);
      return { evidence_stale: ['test', 'review', 'simplify', 'ship'] };
    },
  });
  sessions.set(session, state); activeChanges.set(key, session);
  return session;
}
