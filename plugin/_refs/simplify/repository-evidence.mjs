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

export function safeSimplifyPath(value) {
  return text(value) && value === value.trim() && !/[\\:\0\r\n*?]/u.test(value) &&
    !value.startsWith('/') && !value.split('/').some(segment => !segment || segment === '.' || segment === '..' || /[. ]$/u.test(segment) || /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(segment));
}

function inside(root, file) {
  const rel = path.relative(root, file);
  return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel));
}

function containedFile(state, file) {
  if (!safeSimplifyPath(file)) throw new Error(`unsafe repository path: ${file}`);
  let cursor = state.root;
  for (const segment of file.split('/')) {
    cursor = path.join(cursor, segment);
    if (!existsSync(cursor)) throw new Error(`source path is unavailable: ${file}`);
    const stat = lstatSync(cursor);
    if (stat.isSymbolicLink() || !inside(state.root, realpathSync.native(cursor))) throw new Error(`symlink containment is unproven: ${file}`);
    if (stat.isDirectory() && existsSync(path.join(cursor, '.git'))) throw new Error(`different nested Git root: ${file}`);
  }
  if (!lstatSync(cursor).isFile()) throw new Error(`not a regular source file: ${file}`);
  return cursor;
}

function git(state, args, accept = [0]) {
  const result = spawnSync('git', ['--no-optional-locks', ...args], { cwd: state.root, encoding: 'utf8', windowsHide: true, shell: false, timeout: 30000, maxBuffer: 32 * 1024 * 1024 });
  if (result.error || !accept.includes(result.status)) throw new Error(`repository observation failed: git ${args[0]}`);
  return result.stdout;
}

function capture(state) {
  const realRoot = realpathSync.native(state.root);
  const [rootPath, revision, indexPath] = git(state, ['rev-parse', '--show-toplevel', 'HEAD', '--git-path', 'index']).trim().split(/\r?\n/u);
  const gitRoot = realpathSync.native(rootPath);
  if (realRoot !== state.root || gitRoot !== state.root) throw new Error('different Git root');
  if (!/^[a-f0-9]{40}$/u.test(revision)) throw new Error('repository HEAD is unavailable');
  const indexFile = path.resolve(state.root, indexPath);
  const readIndex = () => existsSync(indexFile) ? readFileSync(indexFile) : Buffer.alloc(0);
  const index = readIndex();
  // Bind staged path/mode/blob identities, not Git's refreshable stat cache.
  const indexEntries = git(state, ['ls-files', '--stage', '-z']);
  const files = {}, bytes = {};
  let totalBytes = 0, count = 0;
  function walk(directory, prefix = '') {
    for (const name of readdirSync(directory).sort()) {
      if (!prefix && name === '.git') continue;
      const file = prefix + name, absolute = path.join(directory, name);
      if (!safeSimplifyPath(file)) throw new Error(`unobservable repository path: ${file}`);
      if (++count > 100000) throw new Error('repository inventory limit exceeded');
      const stat = lstatSync(absolute);
      if (stat.isSymbolicLink()) {
        throw new Error(`symlink content/containment is unproven: ${file}`);
      } else if (stat.isDirectory()) {
        if (name === '.git') {
          files[file] = { kind: 'nested-repository', mode: stat.mode, sha256: hash('nested-repository') };
        } else {
          files[file] = { kind: 'directory', mode: stat.mode, sha256: hash('directory') };
          walk(absolute, `${file}/`);
        }
      } else if (stat.isFile()) {
        // Include ignored output. Excluding it based on agent scope would hide writes.
        totalBytes += stat.size;
        if (totalBytes > 128 * 1024 * 1024) throw new Error('repository byte limit exceeded; observation incomplete');
        const content = readFileSync(absolute), after = lstatSync(absolute);
        if (stat.size !== after.size || stat.mtimeMs !== after.mtimeMs || stat.ino !== after.ino) throw new Error('repository changed during snapshot');
        bytes[file] = content;
        files[file] = { kind: name === '.git' ? 'nested-repository' : 'file', mode: stat.mode, sha256: hash(content) };
      } else throw new Error(`unsupported filesystem entry: ${file}`);
    }
  }
  walk(state.root);
  if (revision !== git(state, ['rev-parse', 'HEAD']).trim() || !index.equals(readIndex())) throw new Error('Git identity changed during snapshot');
  const manifest = { root: state.root, repository_id: state.owner, revision, index_hash: hash(indexEntries), files };
  return { ...manifest, bytes, fingerprint: hash(JSON.stringify(manifest)), complete: true, ignored_policy: 'include-all-except-root-git-metadata' };
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
  return [...new Set([...Object.keys(before.files), ...Object.keys(after.files)])].filter(file => !equal(before.files[file], after.files[file])).sort();
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
  const result = spawnSync(spec.command[0], spec.command.slice(1), { cwd, shell: false, windowsHide: true, encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024 });
  const after = capture(state), stable = before.fingerprint === after.fingerprint;
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
    output.result.status = 'analyzed'; output.result.files_changed = [];
  } else {
    if (state.repaired) throw new Error('simplify/repair recursion is forbidden');
    const entry = state.ledger[grant.pass - 1];
    if (state.pending !== grant) throw new Error('no active simplify pass; completed authority cannot be replayed');
    const observed = observeActualChanges(grant.before, after);
    if (observed.unmapped.length) state.hunkHistoryUnproven = true;
    try { actualScope(state, grant, after, observed); } catch (error) { errors.push(error.message); }
    try { verifyCommands(state, context.verification.after, after, context.scope.eligible_hunks, grant.minimumAfterSequence); } catch (error) { errors.push(error.message); }
    const previouslyFailed = entry.verification_result === 'failed';
    const reverted = previouslyFailed && after.fingerprint === grant.before.fingerprint;
    if (previouslyFailed && !reverted) errors.push('failed simplify pass was not rolled back to its exact checkpoint');
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
    try {
      git(state, ['diff', '--no-ext-diff', '--no-textconv', '--check']); git(state, ['diff', '--cached', '--no-ext-diff', '--no-textconv', '--check']);
      output.verification.git_diff_check = 'passed';
    } catch { errors.push('git diff --check failed'); output.verification.git_diff_check = 'failed'; }
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
  let current = false;
  if (context.result.receipt) {
    resolve(state, context.result.receipt, COMPLETION);
    const completion = state.completions.get(context.result.receipt.approval_hash);
    current = Boolean(completion && equal(context, completion.context) && equal(context.passes, state.ledger) && !state.repaired && !pending && completion.fingerprint === observed.fingerprint);
  }
  if (!current && !['sdcorejs-test', 'sdcorejs-repair-loop'].includes(consumer)) throw new Error('stale or unverified post-simplification evidence');
  if (consumer === 'sdcorejs-repair-loop' && pending) throw new Error('failed or pending simplify pass must be verified or rolled back before repair');
  return { status: current ? (context.action.startsWith('apply-') ? 'verified' : 'analyzed') : 'revalidation-required', evidence_current: current, source_revision: observed.revision, source_fingerprint: observed.fingerprint, owner_repository_id: state.owner, write_authorized: false, blockers: [] };
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
  };
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
        const file = containedFile(state, edit.path);
        if (typeof edit.content !== 'string') throw new Error('source edit content must be text');
        const bytes = Buffer.from(edit.content);
        candidate.bytes[edit.path] = bytes;
        candidate.files[edit.path] = { kind: 'file', mode: lstatSync(file).mode, sha256: hash(bytes) };
      }
      actualScope(state, grant, candidate);
      // Host must hold exclusive edit ownership for this synchronous batch. Other
      // writers invalidate snapshots; this API is not an OS filesystem sandbox.
      for (const edit of edits) writeFileSync(containedFile(state, edit.path), candidate.bytes[edit.path]);
      grant.edited = true;
      return { evidence_stale: ['test', 'review', 'simplify', 'ship'] };
    },
  });
  sessions.set(session, state); activeChanges.set(key, session);
  return session;
}
