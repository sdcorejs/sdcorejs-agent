import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { lstatSync, readdirSync, readFileSync, realpathSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createApprovedArtifact, verifyApprovedArtifactGraph } from './approved-artifact.mjs';
import { resolveEvidenceArtifact } from './evidence-artifact.mjs';
import { resolveDecision } from '../harness/runtime-policy.mjs';

// Read-only extraction: preserve simplify manifest/fingerprint and inventory caps.
const hash = value => 'sha256:' + createHash('sha256').update(value).digest('hex');
const text = value => typeof value === 'string' && value.trim() !== '';
const observationRuntimes = new WeakMap();
const observedSnapshots = new WeakMap();
const PHASE_RECEIPT = 'repository-phase-receipt:v1';

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
  return { policy, artifact: loaded?.artifact, parents: loaded?.parents };
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

/** Existing host observation/receipt infrastructure; never portable authorization. */
export function createRepositoryObservationRuntime(options) {
  const state = { root: realpathSync.native(options.root), owner: options.repository_id, change: options.change_ref,
    scope: [...options.scope], scopeFingerprint: repositoryScopeFingerprint(options.scope), commands: structuredClone(options.commands ?? {}),
    loadPlan: options.load_plan, readResponse: options.read_response, classify: options.classify_source, readReview: options.read_review,
    policy: structuredClone(options.policy), policyDecision: structuredClone(options.policy_decision),
    artifacts: [], sequence: 0, snapshots: new Map() };
  if (!text(state.owner) || !text(state.change)) throw new Error('repository owner and change are required');
  const initial = captureRepository(state); observedPolicy(state, initial); state.initial = initial;
  const runtime = Object.freeze({
    snapshot: () => { const snapshot = captureRepository(state); state.snapshots.set(snapshot.fingerprint, snapshot); return { fingerprint: snapshot.fingerprint, revision: snapshot.revision, scope_fingerprint: state.scopeFingerprint }; },
    run: phase => {
      const before = captureRepository(state); observedPolicy(state, before);
      const spec = state.commands[phase];
      if (!spec || !Array.isArray(spec.command) || !spec.command.length || spec.command.some(arg => typeof arg !== 'string' || arg.includes('\0')) || !text(spec.command[0]) || !Array.isArray(spec.scope) || !spec.scope.length || spec.scope.some(file => !safeRepositoryPath(file))) throw new Error('host-selected command/cwd/scope required');
      if (['verify','branch-ready'].includes(phase) && state.scope.some(file => !spec.scope.includes(file))) throw new Error('command must cover the complete finish scope');
      if (spec.cwd !== '.' && !safeRepositoryPath(spec.cwd)) throw new Error('invalid command cwd');
      const cwd = spec.cwd === '.' ? state.root : path.join(state.root, spec.cwd);
      let cursor = state.root;
      for (const part of spec.cwd === '.' ? [] : spec.cwd.split('/')) { cursor = path.join(cursor, part); if (lstatSync(cursor).isSymbolicLink() || !inside(state.root, realpathSync.native(cursor)) || existsSync(path.join(cursor, '.git'))) throw new Error('command cwd crosses owner root'); }
      const started = new Date().toISOString();
      const result = spawnSync(spec.command[0], spec.command.slice(1), { cwd, shell: false, windowsHide: true, encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024 });
      const after = captureRepository(state);
      return issuePhase(state, { kind: 'command', phase, command: spec.command, cwd: spec.cwd, real_cwd: cwd, scope: spec.scope,
        started_at: started, finished_at: new Date().toISOString(), exit_code: result.status, interrupted: Boolean(result.error || result.signal),
        content_stable: before.fingerprint === after.fingerprint, source_fingerprint: before.fingerprint,
        assessment_digest: phase === 'review' && state.readReview ? hash(JSON.stringify(state.readReview())) : null,
        scoped_fingerprint: scopedContent(after, spec.scope), output_digest: hash(String(result.stdout ?? '') + String(result.stderr ?? '')) }, after);
    },
    recordHook: (phase, beforeFingerprint) => {
      const before = state.snapshots.get(beforeFingerprint), after = captureRepository(state);
      const { policy } = observedPolicy(state, after), hook = policy.hooks.find(item => item.id === phase);
      if (!before || !hook || !Array.isArray(hook.paths) || hook.paths.some(file => !state.scope.includes(file))) throw new Error('owned hook scope/baseline is unavailable');
      const changed = [...new Set([...Object.keys(before.files), ...Object.keys(after.files)])].filter(file => JSON.stringify(before.files[file]) !== JSON.stringify(after.files[file]));
      if (changed.some(file => !hook.paths.includes(file) && !(after.files[file]?.kind === 'directory' && !before.files[file] && hook.paths.some(allowed => allowed.startsWith(file + '/'))))) throw new Error('hook wrote outside authorized paths');
      return issuePhase(state, { kind: 'hook', phase, scope: [...new Set([...hook.paths, ...(hook.inputs ?? [])])], changed_paths: changed,
        before_fingerprint: before.fingerprint, source_fingerprint: after.fingerprint,
        scoped_fingerprint: scopedContent(after, [...new Set([...hook.paths, ...(hook.inputs ?? [])])]) }, after);
    },
  });
  observationRuntimes.set(runtime, state);
  return runtime;
}

export function observeRepositoryRuntime(runtime) {
  const state = observationState(runtime), snapshot = captureRepository(state), loaded = observedPolicy(state, snapshot);
  const changedSinceStart = [...new Set([...Object.keys(state.initial.files), ...Object.keys(snapshot.files)])].filter(file => JSON.stringify(state.initial.files[file]) !== JSON.stringify(snapshot.files[file]));
  if (changedSinceStart.some(file => !state.scope.includes(file) && !(snapshot.files[file]?.kind === 'directory' && !state.initial.files[file] && state.scope.some(allowed => allowed.startsWith(file + '/'))))) throw new Error('write outside the observed finish scope; preserve user changes and resolve authority');
  const changed = [...new Set([...repositoryGit(state, ['diff', 'HEAD', '--name-only', '-z']).split('\0'), ...repositoryGit(state, ['ls-files', '--others', '--exclude-standard', '-z']).split('\0')].filter(Boolean))];
  const candidates = changed.filter(file => state.scope.includes(file) && snapshot.files[file]?.kind === 'file');
  const classified = candidates.map(file => ({ path: file, kind: typeof state.classify === 'function' ? state.classify({ path: file, content: snapshot.bytes[file] })?.kind : 'unknown' }));
  const observation = { root: state.root, repository_id: state.owner, change_ref: state.change, revision: snapshot.revision, source_fingerprint: snapshot.fingerprint, scope_fingerprint: state.scopeFingerprint,
    scope: [...state.scope], changed_paths: changed, eligible_paths: classified.filter(item => item.kind === 'executable').map(item => item.path),
    eligibility_known: classified.every(item => ['executable','protected','not-applicable'].includes(item.kind)), policy: loaded.policy,
    decision_runtime: { current_revision: snapshot.revision, load_plan: state.loadPlan, read_response: state.readResponse } };
  observedSnapshots.set(observation, { runtime, snapshot });
  state.currentObservation = observation;
  return observation;
}

export function verifyRepositoryPhase(runtime, reference, phase, observation) {
  const state = observationState(runtime), sampled = observedSnapshots.get(observation);
  const snapshot = sampled?.runtime === runtime && state.currentObservation === observation ? sampled.snapshot : captureRepository(state), blockers = [];
  const record = resolveEvidenceArtifact(reference, state.artifacts, PHASE_RECEIPT, blockers, phase);
  if (!record) return { valid: false, current: false, blockers };
  const body = record.body;
  if (body.phase !== phase || body.repository_id !== state.owner || body.change_ref !== state.change || body.scope_fingerprint !== state.scopeFingerprint || record.metadata.source_revision !== snapshot.revision) blockers.push('phase identity differs');
  if (body.kind === 'command' && (body.interrupted || !body.content_stable || body.exit_code !== (phase === 'red' ? 1 : 0))) blockers.push('command did not prove the required outcome without writes');
  if (!['command','hook'].includes(body.kind)) blockers.push('unknown phase proof');
  return { valid: !blockers.length, current: !blockers.length && body.scoped_fingerprint === scopedContent(snapshot, body.scope) && (!['verify','branch-ready'].includes(phase) || body.source_fingerprint === snapshot.fingerprint), body, blockers };
}

export function readRepositoryReview(runtime, proof) {
  const state = observationState(runtime);
  const assessment = state.readReview?.();
  if (!assessment || !proof?.body?.assessment_digest || hash(JSON.stringify(assessment)) !== proof.body.assessment_digest) return null;
  return structuredClone(assessment);
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

export function repositoryGit(state, args, accept = [0]) {
  const result = spawnSync('git', ['--no-optional-locks', ...args], { cwd: state.root, encoding: 'utf8', windowsHide: true, shell: false, timeout: 30000, maxBuffer: 32 * 1024 * 1024 });
  if (result.error || !accept.includes(result.status)) throw new Error(`repository observation failed: git ${args[0]}`);
  return result.stdout;
}

export function captureRepository(state) {
  const realRoot = realpathSync.native(state.root);
  const [rootPath, revision, indexPath] = repositoryGit(state, ['rev-parse', '--show-toplevel', 'HEAD', '--git-path', 'index']).trim().split(/\r?\n/u);
  const gitRoot = realpathSync.native(rootPath);
  if (realRoot !== state.root || gitRoot !== state.root) throw new Error('different Git root');
  if (!/^[a-f0-9]{40}$/u.test(revision)) throw new Error('repository HEAD is unavailable');
  const indexFile = path.resolve(state.root, indexPath);
  const readIndex = () => existsSync(indexFile) ? readFileSync(indexFile) : Buffer.alloc(0);
  const index = readIndex();
  // Bind staged path/mode/blob identities, not Git's refreshable stat cache.
  const indexEntries = repositoryGit(state, ['ls-files', '--stage', '-z']);
  const files = {}, bytes = {};
  let totalBytes = 0, count = 0;
  function walk(directory, prefix = '') {
    for (const name of readdirSync(directory).sort()) {
      if (!prefix && name === '.git') continue;
      const file = prefix + name, absolute = path.join(directory, name);
      if (!safeRepositoryPath(file)) throw new Error(`unobservable repository path: ${file}`);
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
  if (revision !== repositoryGit(state, ['rev-parse', 'HEAD']).trim() || !index.equals(readIndex())) throw new Error('Git identity changed during snapshot');
  const manifest = { root: state.root, repository_id: state.owner, revision, index_hash: hash(indexEntries), files };
  return { ...manifest, bytes, fingerprint: hash(JSON.stringify(manifest)), complete: true, ignored_policy: 'include-all-except-root-git-metadata' };
}
