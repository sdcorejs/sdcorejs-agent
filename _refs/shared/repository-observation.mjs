import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { lstatSync, readdirSync, readFileSync, readlinkSync, realpathSync, existsSync } from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { createApprovedArtifact, verifyApprovedArtifactGraph } from './approved-artifact.mjs';
import { resolveEvidenceArtifact } from './evidence-artifact.mjs';
import { resolveDecision } from '../harness/runtime-policy.mjs';

// Read-only extraction: preserve simplify manifest/fingerprint and inventory caps.
const hash = value => 'sha256:' + createHash('sha256').update(value).digest('hex');
const text = value => typeof value === 'string' && value.trim() !== '';
const observationRuntimes = new WeakMap();
const observedSnapshots = new WeakMap();
const PHASE_RECEIPT = 'repository-phase-receipt:v1';
// A verified runner dispatch names what happened; the host never assumes an outcome.
const SIMPLIFY_DISPATCH_OUTCOMES = Object.freeze(['simplified', 'unchanged', 'reverted']);
// Content caps apply only to tracked and untracked-not-ignored files. Ignored
// output, links and nested worktrees are observed as metadata under their own cap.
const CONTENT_BYTE_LIMIT = 128 * 1024 * 1024;
const CONTENT_COUNT_LIMIT = 100000;
const METADATA_COUNT_LIMIT = 1000000;
// One host-level volatile ledger per (root, change) in this process. Every
// registered command window records its volatile state here; drift outside a
// window is a write, whichever runtime observes it.
const volatileLedgers = new Map();

export function repositoryScopeFingerprint(paths) {
  if (!Array.isArray(paths) || !paths.length || paths.some(file => !safeRepositoryPath(file)) || new Set(paths).size !== paths.length) throw new Error('explicit unique repository scope is required');
  return hash(JSON.stringify([...paths].sort()));
}

function scopedContent(snapshot, scope) {
  return hash(JSON.stringify(scope.map(file => [file, snapshot.files[file] ?? null])));
}

function observationState(runtime) {
  const state = observationRuntimes.get(runtime);
  if (!state) throw new Error('current host repository observation runtime is required');
  return state;
}

const matchesPattern = (file, pattern) => {
  const base = pattern.endsWith('/**') ? pattern.slice(0, -3) : pattern;
  return file === base || (pattern.endsWith('/**') && file.startsWith(`${base}/`));
};

export function validateVolatilePaths(patterns) {
  if (!Array.isArray(patterns)) throw new Error('volatile_paths must be an explicit array');
  if (new Set(patterns).size !== patterns.length) throw new Error('volatile_paths must be unique');
  for (const pattern of patterns) {
    const base = typeof pattern === 'string' && pattern.endsWith('/**') ? pattern.slice(0, -3) : pattern;
    if (!safeRepositoryPath(base)) throw new Error(`invalid volatile path pattern: ${String(pattern)}`);
  }
  return [...patterns].sort();
}

function assertVolatileDisjoint(patterns, paths, label) {
  for (const file of paths) {
    const pattern = patterns.find(item => matchesPattern(file, item) || matchesPattern(item.endsWith('/**') ? item.slice(0, -3) : item, file.endsWith('/**') ? file : `${file}/**`));
    if (pattern) throw new Error(`volatile path ${pattern} intersects ${label} ${file}; volatile paths are never write targets or inputs`);
  }
}

function volatileState(snapshot) {
  return Object.fromEntries(Object.entries(snapshot.files).filter(([, entry]) => entry.volatile === true));
}

export function registerVolatileLedger({ root, change_ref: changeRef, volatile_paths: volatilePaths = [], snapshot }) {
  const key = `${root}\0${changeRef}`;
  const patterns = validateVolatilePaths(volatilePaths);
  const existing = volatileLedgers.get(key);
  if (existing) {
    if (!isDeepStrictEqual(existing.patterns, patterns)) throw new Error('volatile path declarations differ for this change; one list per change is allowed');
    return existing;
  }
  const ledger = { key, patterns, recorded: volatileState(snapshot), open: 0 };
  volatileLedgers.set(key, ledger);
  return ledger;
}

export function assertVolatileLedger(ledger, snapshot) {
  if (!ledger || ledger.open > 0) return;
  if (!isDeepStrictEqual(volatileState(snapshot), ledger.recorded)) throw new Error('volatile path changed outside a host command window');
}

export function beginVolatileWindow(ledger, kind, snapshot) {
  if (!['command', 'dispatch', 'hook', 'apply', 'rollback'].includes(kind)) throw new Error(`unknown host window kind: ${kind}`);
  assertVolatileLedger(ledger, snapshot);
  if (ledger) ledger.open += 1;
  return { ledger, kind, before: volatileState(snapshot), closed: false };
}

export function endVolatileWindow(window, snapshot) {
  if (!window || window.closed) throw new Error('host window is unknown or already closed');
  window.closed = true;
  if (window.ledger) window.ledger.open -= 1;
  if (!snapshot) return;
  const after = volatileState(snapshot);
  if (['command', 'dispatch'].includes(window.kind)) {
    if (window.ledger) window.ledger.recorded = after;
  } else if (!isDeepStrictEqual(after, window.before)) {
    throw new Error(`volatile path changed inside a ${window.kind} window`);
  }
}

function commandPaths(commands) {
  return Object.values(commands ?? {}).flatMap(spec => Array.isArray(spec?.scope) ? spec.scope.filter(item => typeof item === 'string') : []);
}

function observedPolicy(state, snapshot) {
  let loaded, metadata, policy;
  if (typeof state.loadPlan === 'function') {
    loaded = state.loadPlan();
    verifyApprovedArtifactGraph(loaded?.artifact, loaded?.parents);
    metadata = loaded.artifact.metadata;
    if (metadata.artifact_kind !== 'plan' || metadata.owner_repository_id !== state.owner || metadata.change_ref !== state.change || metadata.source_revision !== snapshot.revision) throw new Error('finish policy owner/change/revision mismatch');
    const block = loaded.artifact.body.match(/```finish-policy\r?\n([\s\S]*?)\r?\n```/u);
    if (!block) throw new Error('approved finish policy is unavailable; resolve an explicit scoped policy without mutating history');
    policy = JSON.parse(block[1]);
  } else {
    const decision = state.policyDecision?.decision;
    const resolved = resolveDecision(state.policyDecision, { read_response: state.readResponse, current_revision: snapshot.revision });
    if (!state.policy || decision?.gate !== 'finish:policy' || decision.approval !== false || decision.owner_repository_id !== state.owner || decision.change_ref !== state.change || decision.scope_fingerprint !== state.scopeFingerprint || decision.revision !== snapshot.revision || resolved.status !== 'resolved' || resolved.value !== hash(JSON.stringify(state.policy))) throw new Error('explicit current scoped finish policy is required');
    policy = state.policy;
    metadata = { allowed_paths: state.scope, prohibited_paths: [] };
  }
  if (policy.schema_version !== 1 || policy.scope_fingerprint !== state.scopeFingerprint || !Array.isArray(policy.required_phases) || !Array.isArray(policy.hooks) || !['tdd','regression-first','existing-tests','post-hoc'].includes(policy.test_strategy)) throw new Error('finish policy schema/scope mismatch');
  if (state.scope.some(file => !metadata.allowed_paths.some(allowed => file === allowed || allowed === '**' || allowed.endsWith('/**') && file.startsWith(allowed.slice(0,-2))))) throw new Error('finish scope exceeds approved plan');
  if (state.scope.some(file => (metadata.prohibited_paths ?? []).some(blocked => file === blocked || blocked === '**' || blocked.endsWith('/**') && file.startsWith(blocked.slice(0,-2))))) throw new Error('finish scope intersects prohibited plan paths');
  const phases = new Set(['baseline', 'review', 'verify', 'branch-ready']);
  if (policy.required_phases.some(phase => !phases.has(phase))) throw new Error('unknown required phase; use a scoped host command in a canonical phase');
  if (new Set(policy.hooks.map(hook => hook.id)).size !== policy.hooks.length || policy.hooks.some(hook => !text(hook.id) || phases.has(hook.id) || ['red','simplify','reverify','repair','unit-review-a','unit-review-b'].includes(hook.id) || !text(hook.owner) || !Array.isArray(hook.paths) || !hook.paths.length || hook.paths.some(file => !state.scope.includes(file)) || (hook.inputs ?? []).some(file => !safeRepositoryPath(file)))) throw new Error('invalid owned hook policy');
  const volatile = validateVolatilePaths(policy.volatile_paths ?? []);
  assertVolatileDisjoint(volatile, state.scope, 'finish scope');
  assertVolatileDisjoint(volatile, policy.hooks.flatMap(hook => [...hook.paths, ...(hook.inputs ?? [])]), 'hook path');
  assertVolatileDisjoint(volatile, commandPaths(state.commands), 'command scope');
  if (state.volatile !== undefined && !isDeepStrictEqual(state.volatile, volatile)) throw new Error('finish volatile paths changed after the host started');
  return { policy, artifact: loaded?.artifact, parents: loaded?.parents, volatile };
}

function issuePhase(state, body, snapshot) {
  const artifact = createApprovedArtifact({ metadata: {
    schema_version: 1, artifact_id: `phase-${++state.sequence}`, artifact_kind: 'release-evidence', contract_id: PHASE_RECEIPT,
    requirement_id: 'finish-evidence', change_ref: state.change, track: 'workflow', stack_profile: 'markdown-skill-pack',
    owner_repository_id: state.owner, owner_repository_role: 'standalone', owner_module_id: null, parent_repository_id: null,
    parent_references: [], repository_relative_path: `evidence/phase-${state.sequence}.json`, source_revision: snapshot.revision,
    approval_source: 'trusted-command-runner', approved_by: 'trusted-command-runner', approved_at: new Date().toISOString(), supersedes: null,
  }, body: JSON.stringify({ ...body, event_sequence: state.sequence, repository_id: state.owner, change_ref: state.change, scope_fingerprint: state.scopeFingerprint }) });
  state.artifacts.push(artifact);
  return { artifact_ref: artifact.metadata.repository_relative_path, approval_hash: artifact.metadata.approval_hash };
}

// Paths whose non-volatile observation differs between two snapshots.
export function changedRepositoryPaths(before, after) {
  return [...new Set([...Object.keys(before.files), ...Object.keys(after.files)])]
    .filter(file => before.files[file]?.volatile !== true && after.files[file]?.volatile !== true)
    .filter(file => !isDeepStrictEqual(before.files[file], after.files[file])).sort();
}

/** Existing host observation/receipt infrastructure; never portable authorization. */
export function createRepositoryObservationRuntime(options) {
  const state = { root: realpathSync.native(options.root), owner: options.repository_id, change: options.change_ref,
    scope: [...options.scope], scopeFingerprint: repositoryScopeFingerprint(options.scope), commands: structuredClone(options.commands ?? {}),
    loadPlan: options.load_plan, readResponse: options.read_response, classify: options.classify_source, readReview: options.read_review,
    simplifyVerifier: options.simplify_verifier, policy: structuredClone(options.policy), policyDecision: structuredClone(options.policy_decision),
    artifacts: [], sequence: 0, snapshots: new Map(), dispatches: [], implementationWindows: [], simplifyAnchor: null, simplifyChain: [] };
  if (!text(state.owner) || !text(state.change)) throw new Error('repository owner and change are required');
  state.guarded = [...state.scope, ...commandPaths(state.commands)];
  const probe = captureRepository(state);
  const { policy, volatile } = observedPolicy(state, probe);
  state.volatile = volatile;
  state.guarded = [...new Set([...state.guarded, ...policy.hooks.flatMap(hook => [...hook.paths, ...(hook.inputs ?? [])])])];
  const initial = captureRepository(state);
  state.ledger = registerVolatileLedger({ root: state.root, change_ref: state.change, volatile_paths: volatile, snapshot: initial });
  state.initial = initial;
  const runtime = Object.freeze({
    snapshot: () => {
      const snapshot = captureRepository(state); assertVolatileLedger(state.ledger, snapshot);
      state.snapshots.set(snapshot.fingerprint, snapshot);
      return { fingerprint: snapshot.fingerprint, revision: snapshot.revision, scope_fingerprint: state.scopeFingerprint };
    },
    run: phase => {
      const before = captureRepository(state); observedPolicy(state, before);
      const spec = state.commands[phase];
      if (!spec || !Array.isArray(spec.command) || !spec.command.length || spec.command.some(arg => typeof arg !== 'string' || arg.includes('\0')) || !text(spec.command[0]) || !Array.isArray(spec.scope) || !spec.scope.length || spec.scope.some(file => !safeRepositoryPath(file))) throw new Error('host-selected command/cwd/scope required');
      if (['verify','branch-ready'].includes(phase) && state.scope.some(file => !spec.scope.includes(file))) throw new Error('command must cover the complete finish scope');
      if (spec.cwd !== '.' && !safeRepositoryPath(spec.cwd)) throw new Error('invalid command cwd');
      const cwd = spec.cwd === '.' ? state.root : path.join(state.root, spec.cwd);
      let cursor = state.root;
      for (const part of spec.cwd === '.' ? [] : spec.cwd.split('/')) { cursor = path.join(cursor, part); if (lstatSync(cursor).isSymbolicLink() || !inside(state.root, realpathSync.native(cursor)) || existsSync(path.join(cursor, '.git'))) throw new Error('command cwd crosses owner root'); }
      const window = beginVolatileWindow(state.ledger, 'command', before);
      const started = new Date().toISOString();
      const result = spawnSync(spec.command[0], spec.command.slice(1), { cwd, shell: false, windowsHide: true, encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024 });
      let after;
      try { after = captureRepository(state); } finally { endVolatileWindow(window, after); }
      return issuePhase(state, { kind: 'command', phase, command: spec.command, cwd: spec.cwd, real_cwd: cwd, scope: spec.scope,
        started_at: started, finished_at: new Date().toISOString(), exit_code: result.status, interrupted: Boolean(result.error || result.signal),
        content_stable: before.stable_fingerprint === after.stable_fingerprint, source_fingerprint: before.stable_fingerprint,
        assessment_digest: phase === 'review' && state.readReview ? hash(JSON.stringify(state.readReview())) : null,
        scoped_fingerprint: scopedContent(after, spec.scope), output_digest: hash(String(result.stdout ?? '') + String(result.stderr ?? '')) }, after);
    },
    recordHook: (phase, beforeFingerprint) => {
      const before = state.snapshots.get(beforeFingerprint), after = captureRepository(state);
      const { policy } = observedPolicy(state, after), hook = policy.hooks.find(item => item.id === phase);
      if (!before || !hook || !Array.isArray(hook.paths) || hook.paths.some(file => !state.scope.includes(file))) throw new Error('owned hook scope/baseline is unavailable');
      if (!isDeepStrictEqual(volatileState(after), volatileState(before))) throw new Error('volatile path changed inside a hook window; run checks through a host command window');
      const changed = changedRepositoryPaths(before, after);
      if (changed.some(file => !hook.paths.includes(file) && !(after.files[file]?.kind === 'directory' && !before.files[file] && hook.paths.some(allowed => allowed.startsWith(file + '/'))))) throw new Error('hook wrote outside authorized paths');
      if (phase === 'implementation') state.implementationWindows.push({ before, after });
      return issuePhase(state, { kind: 'hook', phase, scope: [...new Set([...hook.paths, ...(hook.inputs ?? [])])], changed_paths: changed,
        before_fingerprint: before.fingerprint, source_fingerprint: after.stable_fingerprint,
        scoped_fingerprint: scopedContent(after, [...new Set([...hook.paths, ...(hook.inputs ?? [])])]) }, after);
    },
    // A host-runner dispatch is a registered window. The anchor snapshot is taken
    // before the first dispatch and shared by the whole chain; each token is
    // consumed exactly once, and the host hands its verified chain to the runner.
    beginSimplify: () => {
      const current = captureRepository(state); observedPolicy(state, current);
      if (state.dispatches.some(dispatch => dispatch.status === 'open')) throw new Error('a simplify dispatch is already open for this change');
      state.simplifyAnchor ??= current;
      const anchor = state.simplifyAnchor;
      const window = beginVolatileWindow(state.ledger, 'dispatch', current);
      const token = randomUUID();
      state.dispatches.push({ token, status: 'open', window });
      return { token, chain: structuredClone(state.simplifyChain), anchor: { kind: 'host-snapshot', fingerprint: anchor.stable_fingerprint, revision: anchor.revision,
        files: Object.fromEntries(state.scope.filter(file => anchor.files[file]?.sha256).map(file => [file, anchor.files[file].sha256])) } };
    },
    recordSimplify: (token, receipt) => {
      const dispatch = state.dispatches.find(item => item.token === token);
      if (!dispatch || dispatch.status !== 'open') throw new Error('simplify dispatch token is unknown or already consumed');
      dispatch.status = 'failed';
      let after;
      try { after = captureRepository(state); } finally { endVolatileWindow(dispatch.window, after); }
      const { policy } = observedPolicy(state, after);
      if (!receipt) return { valid: false, blockers: ['runner produced no receipt; the dispatch stays unverified'] };
      if (typeof state.simplifyVerifier !== 'function') return { valid: false, blockers: ['host simplify verifier is unavailable'] };
      // The verifier receives only host-held inputs: the verified plan, the finish scope,
      // the shared anchor, the verified chain and the observed implementation windows.
      let plan = null;
      if (typeof state.loadPlan === 'function') {
        try {
          const loaded = state.loadPlan();
          verifyApprovedArtifactGraph(loaded.artifact, loaded.parents);
          plan = { artifact: structuredClone(loaded.artifact), parents: structuredClone(loaded.parents ?? []) };
        } catch (error) { return { valid: false, blockers: [`verified plan is unavailable: ${error.message}`] }; }
      }
      let verdict;
      try {
        verdict = state.simplifyVerifier({ anchor: state.simplifyAnchor, after, receipt: structuredClone(receipt), chain: structuredClone(state.simplifyChain),
          scope: [...state.scope], policy, plan, root: state.root, repository_id: state.owner, change_ref: state.change, initial: state.initial,
          implementation_windows: state.implementationWindows.map(item => ({ before: item.before, after: item.after })) });
      } catch (error) { verdict = { verified: false, blockers: [error.message] }; }
      if (verdict?.verified !== true || !Array.isArray(verdict.pass_paths)) return { valid: false, blockers: verdict?.blockers?.length ? verdict.blockers : ['simplify dispatch was not verified'] };
      if (!SIMPLIFY_DISPATCH_OUTCOMES.includes(verdict.outcome)) return { valid: false, blockers: ['simplify dispatch verdict must name its outcome'] };
      const passPaths = [...new Set([...state.simplifyChain.flatMap(item => item.pass_paths ?? []), ...verdict.pass_paths])].sort();
      const unexplained = changedRepositoryPaths(state.simplifyAnchor, after).filter(file => !passPaths.includes(file));
      if (unexplained.length) return { valid: false, blockers: [`unexplained changes during the simplify dispatch: ${unexplained.join(', ')}`] };
      dispatch.status = 'verified';
      state.simplifyChain.push(structuredClone(receipt));
      const scope = passPaths.length ? passPaths : [...state.scope];
      const proof = issuePhase(state, { kind: 'simplify', phase: 'simplify', scope, verified: true, outcome: verdict.outcome, chain_length: state.simplifyChain.length,
        before_fingerprint: state.simplifyAnchor.stable_fingerprint, source_fingerprint: after.stable_fingerprint,
        scoped_fingerprint: scopedContent(after, scope), receipt_digest: hash(JSON.stringify(receipt)) }, after);
      return { valid: true, proof, outcome: verdict.outcome, blockers: [] };
    },
  });
  observationRuntimes.set(runtime, state);
  return runtime;
}

export function observeRepositoryRuntime(runtime) {
  const state = observationState(runtime), snapshot = captureRepository(state), loaded = observedPolicy(state, snapshot);
  assertVolatileLedger(state.ledger, snapshot);
  const changedSinceStart = changedRepositoryPaths(state.initial, snapshot);
  if (changedSinceStart.some(file => !state.scope.includes(file) && !(snapshot.files[file]?.kind === 'directory' && !state.initial.files[file] && state.scope.some(allowed => allowed.startsWith(file + '/'))))) throw new Error('write outside the observed finish scope; preserve user changes and resolve authority');
  const changed = [...new Set([...repositoryGit(state, ['diff', 'HEAD', '--name-only', '-z']).split('\0'), ...repositoryGit(state, ['ls-files', '--others', '--exclude-standard', '-z']).split('\0')].filter(Boolean))];
  const candidates = changed.filter(file => state.scope.includes(file) && snapshot.files[file]?.kind === 'file');
  const classified = candidates.map(file => ({ path: file, kind: typeof state.classify === 'function' ? state.classify({ path: file, content: snapshot.bytes[file] })?.kind : 'unknown' }));
  const observation = { root: state.root, repository_id: state.owner, change_ref: state.change, revision: snapshot.revision, source_fingerprint: snapshot.stable_fingerprint, scope_fingerprint: state.scopeFingerprint,
    scope: [...state.scope], changed_paths: changed, eligible_paths: classified.filter(item => item.kind === 'executable').map(item => item.path),
    eligibility_known: classified.every(item => ['executable','protected','not-applicable'].includes(item.kind)), policy: loaded.policy,
    simplify_dispatches: state.dispatches.map(dispatch => ({ status: dispatch.status })),
    simplify_runner_available: typeof state.simplifyVerifier === 'function',
    decision_runtime: { current_revision: snapshot.revision, load_plan: state.loadPlan, read_response: state.readResponse } };
  observedSnapshots.set(observation, { runtime, snapshot });
  state.currentObservation = observation;
  return observation;
}

export function verifyRepositoryPhase(runtime, reference, phase, observation) {
  const state = observationState(runtime), sampled = observedSnapshots.get(observation);
  const snapshot = sampled?.runtime === runtime && state.currentObservation === observation ? sampled.snapshot : captureRepository(state), blockers = [];
  const record = resolveEvidenceArtifact(reference, state.artifacts, PHASE_RECEIPT, blockers, phase);
  if (!record) return { valid: false, current: false, blockers: blockers.map(message => `${phase} receipt is invalid: ${message}; run ${phase} again`) };
  const body = record.body;
  if (body.phase !== phase || body.repository_id !== state.owner || body.change_ref !== state.change || body.scope_fingerprint !== state.scopeFingerprint || record.metadata.source_revision !== snapshot.revision) blockers.push(`${phase} receipt is invalid: phase identity differs; run ${phase} again`);
  if (body.kind === 'command' && (body.interrupted || !body.content_stable || body.exit_code !== (phase === 'red' ? 1 : 0))) blockers.push(`${phase} command did not prove the required outcome without writes; run ${phase} again`);
  if (body.kind === 'simplify' && body.verified !== true) blockers.push('simplify dispatch was not verified');
  if (!['command','hook','simplify'].includes(body.kind)) blockers.push(`${phase} receipt is an unknown phase proof`);
  return { valid: !blockers.length, current: !blockers.length && body.scoped_fingerprint === scopedContent(snapshot, body.scope) && (!['verify','branch-ready'].includes(phase) || body.source_fingerprint === snapshot.stable_fingerprint), body, blockers };
}

export function readRepositoryReview(runtime, proof) {
  const state = observationState(runtime);
  const assessment = state.readReview?.();
  if (!assessment || !proof?.body?.assessment_digest || hash(JSON.stringify(assessment)) !== proof.body.assessment_digest) return null;
  return structuredClone(assessment);
}

// Same-flow consumers read the host-verified simplify dispatch through the observation runtime.
export function readRepositorySimplify(runtime, reference) {
  const state = observationState(runtime), snapshot = captureRepository(state), blockers = [];
  const record = resolveEvidenceArtifact(reference, state.artifacts, PHASE_RECEIPT, blockers, 'simplify');
  const identity = { owner_repository_id: state.owner, source_revision: snapshot.revision, source_fingerprint: snapshot.stable_fingerprint };
  if (!record || record.body.kind !== 'simplify') return { ...identity, verified: false, current: false, outcome: null, pass_paths: [], blockers: blockers.length ? blockers : ['host-verified simplify receipt is required'] };
  const verified = record.body.verified === true && record.body.change_ref === state.change && record.body.repository_id === state.owner;
  const current = verified && record.metadata.source_revision === snapshot.revision && record.body.scoped_fingerprint === scopedContent(snapshot, record.body.scope);
  return { ...identity, verified, current, outcome: record.body.outcome, pass_paths: [...record.body.scope], blockers: current ? [] : ['simplify evidence is stale or unverified'] };
}

export function safeRepositoryPath(value) {
  return text(value) && value === value.trim() && !/[\\:\0\r\n*?]/u.test(value) &&
    !value.startsWith('/') && !value.split('/').some(segment => !segment || segment === '.' || segment === '..' || /[. ]$/u.test(segment) || /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(segment));
}

function inside(root, file) {
  const rel = path.relative(root, file);
  return rel === '' || (!rel.startsWith(`..${path.sep}`) && rel !== '..' && !path.isAbsolute(rel));
}

export function containedRepositoryFile(state, file) {
  if (!safeRepositoryPath(file)) throw new Error(`unsafe repository path: ${file}`);
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

// A host write target must be a contained regular file with exactly one link.
export function assertSingleLinkWriteTarget(state, file) {
  const target = containedRepositoryFile(state, file);
  if (lstatSync(target).nlink > 1) throw new Error(`write target has multiple hard links: ${file}`);
  return target;
}

// Scope, hook, command and UI paths and their ancestors may never be links.
function assertGuardedPaths(state) {
  for (const file of state.guarded ?? []) {
    if (!safeRepositoryPath(file)) throw new Error(`unsafe repository path: ${file}`);
    let cursor = state.root;
    for (const segment of file.split('/')) {
      cursor = path.join(cursor, segment);
      let stat;
      try { stat = lstatSync(cursor); } catch { break; }
      if (stat.isSymbolicLink() || !inside(state.root, realpathSync.native(cursor))) throw new Error(`symlink containment is unproven: ${file}`);
    }
  }
}

export function repositoryGit(state, args, accept = [0]) {
  const result = spawnSync('git', ['--no-optional-locks', ...args], { cwd: state.root, encoding: 'utf8', windowsHide: true, shell: false, timeout: 30000, maxBuffer: 64 * 1024 * 1024 });
  if (result.error || !accept.includes(result.status)) throw new Error(`repository observation failed: git ${args[0]}`);
  return result.stdout;
}

export function captureRepository(state) {
  const realRoot = realpathSync.native(state.root);
  const [rootPath, revision] = repositoryGit(state, ['rev-parse', '--show-toplevel', 'HEAD']).trim().split(/\r?\n/u);
  const gitRoot = realpathSync.native(rootPath);
  if (realRoot !== state.root || gitRoot !== state.root) throw new Error('different Git root');
  if (!/^[a-f0-9]{40}$/u.test(revision)) throw new Error('repository HEAD is unavailable');
  // Bind staged path/mode/blob identities, not Git's refreshable stat cache.
  const indexEntries = repositoryGit(state, ['ls-files', '--stage', '-z']);
  const tracked = new Set(indexEntries.split('\0').filter(Boolean).map(entry => entry.slice(entry.indexOf('\t') + 1)));
  const untracked = new Set(repositoryGit(state, ['ls-files', '--others', '--exclude-standard', '-z']).split('\0').filter(Boolean));
  const volatile = validateVolatilePaths(state.volatile ?? []);
  const isVolatile = file => volatile.some(pattern => matchesPattern(file, pattern));
  assertGuardedPaths(state);
  const files = {}, bytes = {};
  let contentBytes = 0, contentCount = 0, metadataCount = 0;
  const metadata = (file, entry) => {
    if (++metadataCount > METADATA_COUNT_LIMIT) throw new Error('repository metadata inventory limit exceeded; observation incomplete');
    files[file] = isVolatile(file) ? { ...entry, volatile: true } : entry;
  };
  function walk(directory, prefix = '') {
    for (const name of readdirSync(directory).sort()) {
      if (!prefix && name === '.git') continue;
      const file = prefix + name, absolute = path.join(directory, name);
      const stat = lstatSync(absolute, { bigint: true });
      // Metadata entries record lstat only: kind, mode, size and mtime (links also their target).
      const lstatFields = { mode: Number(stat.mode), size: String(stat.size), mtime_ns: String(stat.mtimeNs) };
      if (stat.isSymbolicLink()) {
        // Links are recorded by target and never followed.
        metadata(file, { class: 'metadata', kind: 'symlink', ...lstatFields, target: readlinkSync(absolute) });
      } else if (stat.isDirectory()) {
        if (name === '.git') {
          metadata(file, { class: 'metadata', kind: 'nested-repository', ...lstatFields, sha256: hash('nested-repository') });
        } else {
          metadata(file, { class: 'directory', kind: 'directory', mode: Number(stat.mode), sha256: hash('directory') });
          walk(absolute, `${file}/`);
        }
      } else if (stat.isFile()) {
        if (name === '.git') {
          metadata(file, { class: 'metadata', kind: 'nested-repository', ...lstatFields, sha256: hash('nested-repository') });
        } else if (tracked.has(file) || untracked.has(file)) {
          if (isVolatile(file)) throw new Error(`volatile path matches repository content ${file}; volatile paths must be ignored output`);
          if (!safeRepositoryPath(file)) throw new Error(`unobservable repository path: ${file}`);
          if (++contentCount > CONTENT_COUNT_LIMIT) throw new Error('repository content inventory limit exceeded; observation incomplete');
          contentBytes += Number(stat.size);
          if (contentBytes > CONTENT_BYTE_LIMIT) throw new Error('repository content byte limit exceeded; observation incomplete');
          const content = readFileSync(absolute), after = lstatSync(absolute, { bigint: true });
          if (stat.size !== after.size || stat.mtimeNs !== after.mtimeNs || stat.ino !== after.ino) throw new Error('repository changed during snapshot');
          bytes[file] = content;
          files[file] = { class: 'content', kind: 'file', mode: Number(stat.mode), sha256: hash(content) };
        } else {
          metadata(file, { class: 'metadata', kind: 'file', ...lstatFields });
        }
      } else throw new Error(`unsupported filesystem entry: ${file}`);
    }
  }
  walk(state.root);
  if (revision !== repositoryGit(state, ['rev-parse', 'HEAD']).trim() || indexEntries !== repositoryGit(state, ['ls-files', '--stage', '-z'])) throw new Error('Git identity changed during snapshot');
  const manifest = { root: state.root, repository_id: state.owner, revision, index_hash: hash(indexEntries), files };
  const stableFiles = Object.fromEntries(Object.entries(files).filter(([, entry]) => entry.volatile !== true));
  return { ...manifest, bytes, fingerprint: hash(JSON.stringify(manifest)), stable_fingerprint: hash(JSON.stringify({ ...manifest, files: stableFiles })),
    complete: true, ignored_policy: 'content-tracked-and-untracked; metadata-ignored-links-and-nested' };
}
