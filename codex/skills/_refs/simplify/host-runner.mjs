// Canonical simplify host runner (D-004): one process runs a whole pass
// (baseline, verification before, preflight, apply, verification after,
// postflight, scoped rollback on failure) and prints a receipt that is only an
// index. Consumers re-derive every conclusion from Git and current content.
//
// Usage: node host-runner.mjs --authority <authority.json> --request <request.json>
// --authority is issued by the orchestrating host; --request carries only the
// action, the edit set and an optional narrowing scope.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readApprovedArtifactFile, verifyApprovedArtifactGraph, validateApprovedWriteScope } from '../shared/approved-artifact.mjs';
import { assertSingleLinkWriteTarget, beginVolatileWindow, captureRepository, containedRepositoryFile, endVolatileWindow, registerVolatileLedger,
  safeRepositoryPath, validateVolatilePaths } from '../shared/repository-observation.mjs';
import { createSimplifyEvidenceSession, deriveHostHunkOwnership, evaluateRepositoryEvidence, filteredHeadBlob, revalidateSimplifyHostReceipt,
  simplifyDiffHunks, simplifyLimits, simplifyPreservedSurfaces } from './repository-evidence.mjs';

export const SIMPLIFY_HOST_RECEIPT = 'simplify-host-receipt:v1';
const REQUEST_FIELDS = new Set(['schema_version', 'action', 'edits', 'scope']);
const APPLY_ACTIONS = new Set(['apply-explicit-scope', 'apply-current-diff']);
const ANALYZE_ACTIONS = new Set(['analyze-explicit-scope', 'analyze-current-diff']);
const sha = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const git = (root, args) => spawnSync('git', ['--no-optional-locks', ...args], { cwd: root, windowsHide: true, shell: false, timeout: 30000, maxBuffer: 16 * 1024 * 1024 });

// Only these pure computation built-ins may be imported statically by a trusted
// oracle; every other built-in import (file system, process, network, test runner,
// inspector, module loading) is refused.
const TRUSTED_BUILTINS = new Set(['node:assert', 'node:assert/strict', 'node:buffer', 'node:crypto', 'node:events', 'node:path', 'node:path/posix',
  'node:path/win32', 'node:querystring', 'node:string_decoder', 'node:url', 'node:util']);

// Every static module specifier of an oracle source. The raw text is scanned, so a
// string or comment cannot hide a statement: any dynamic or computed module loading,
// any global that reaches code, the process or the network, any \u or \x escape
// (which can spell such a name without its token), and any `import` keyword or `from`
// clause the static forms do not account for (including one inside a comment or
// string) makes the oracle untrusted. The scan is a conservative heuristic, not a
// sandbox: it cannot prove that no computed access reaches the process, so trust
// rests on the oracle being tracked, unchanged from HEAD and named by the approved plan.
function oracleSpecifiers(code, file) {
  if (/\b(?:require|createRequire|getBuiltinModule|eval|Function|Reflect|constructor|globalThis|global|process|WebAssembly|fetch|WebSocket|EventSource|XMLHttpRequest|setEngine)\b|\bimport\s*\(|\bimport\s*\.\s*meta\b/u.test(code)) {
    throw new Error(`oracle loads or evaluates code dynamically, or reaches the process or network: ${file}`);
  }
  if (/\\u[{0-9a-fA-F]|\\x[0-9a-fA-F]/u.test(code)) throw new Error(`oracle source uses an escape sequence that can spell a refused name: ${file}`);
  const imports = [...code.matchAll(/\bimport\s*(?:(?:[\w$]+\s*,?\s*)?(?:\*\s*as\s*[\w$]+|\{[^}]*\})?\s*from\s*)?(['"])([^'"\n]+)\1/gu)];
  const reexports = [...code.matchAll(/\bexport\s*(?:\*(?:\s*as\s*[\w$]+)?|\{[^}]*\})\s*from\s*(['"])([^'"\n]+)\1/gu)];
  const importKeywords = (code.match(/\bimport\b/gu) ?? []).length, fromClauses = (code.match(/\bfrom\s*['"]/gu) ?? []).length;
  if (importKeywords !== imports.length || fromClauses !== imports.filter(match => /\bfrom\s*['"]/u.test(match[0])).length + reexports.length) {
    throw new Error(`oracle has an unrecognized module statement: ${file}`);
  }
  return [...imports, ...reexports].map(match => match[2]);
}

// Oracle modules and their static relative import closure must be tracked,
// unchanged from HEAD and inside the root. Only the pure node: built-ins above and
// tracked relative modules are trusted; otherwise the runner only Analyzes.
function assertTrustedOracleClosure(root, file, seen = new Set()) {
  if (seen.has(file)) return seen;
  seen.add(file);
  if (!safeRepositoryPath(file)) throw new Error(`oracle path is unsafe: ${file}`);
  containedRepositoryFile({ root }, file);
  // Only ES module files join the closure: a CommonJS file reaches its module wrapper's
  // require through `arguments` without any refused token.
  if (!file.endsWith('.mjs')) throw new Error(`oracle closure accepts only ES module files (.mjs): ${file}`);
  // Literal pathspecs: a bracketed name must not match another tracked file as a glob.
  if (git(root, ['--literal-pathspecs', 'ls-files', '--error-unmatch', '--', file]).status !== 0) throw new Error(`oracle module is not tracked: ${file}`);
  if (git(root, ['--literal-pathspecs', 'diff', '--quiet', 'HEAD', '--', file]).status !== 0) throw new Error(`oracle module differs from HEAD: ${file}`);
  for (const specifier of oracleSpecifiers(readFileSync(path.join(root, file), 'utf8'), file)) {
    if (specifier.startsWith('node:')) {
      if (!TRUSTED_BUILTINS.has(specifier)) throw new Error(`oracle imports a built-in outside the pure allowlist (${specifier}): ${file}`);
      continue;
    }
    if (!specifier.startsWith('./') && !specifier.startsWith('../')) throw new Error(`oracle imports a package (${specifier}); only node: built-ins and tracked relative modules are trusted: ${file}`);
    // Node resolves a specifier as a URL: it decodes %XX, drops ?query and #fragment and
    // reads \ as a separator, so such a specifier could load another file than the one checked.
    if (/[%?#\\]/u.test(specifier)) throw new Error(`oracle import specifier is not a plain relative path (${specifier}): ${file}`);
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
    const loaded = fileURLToPath(new URL(specifier, pathToFileURL(path.join(root, file))));
    if (path.resolve(loaded) !== path.resolve(root, target)) throw new Error(`oracle import resolves to another file than the checked one (${specifier}): ${file}`);
    assertTrustedOracleClosure(root, target, seen);
  }
  return seen;
}

// Synchronous ES module loading keeps consumer revalidation synchronous; the
// supported Node engines load ES modules through require().
const requireModule = createRequire(import.meta.url);

function loadOracles(root, declared) {
  if (!declared?.classify_source || !declared?.verify_preservation) return { available: false, reason: 'oracle modules are not declared in the approved simplify-host-policy' };
  try {
    const loaded = {}, closure = new Set();
    for (const name of ['classify_source', 'verify_preservation']) {
      const [file, exportName] = String(declared[name]).split('#');
      assertTrustedOracleClosure(root, file, closure);
      const module = requireModule(path.join(root, file));
      if (typeof module[exportName] !== 'function') throw new Error(`oracle export ${declared[name]} is not a function`);
      loaded[name] = module[exportName];
    }
    return { available: true, ...loaded, paths: [...closure].sort() };
  } catch (error) {
    return { available: false, reason: error.message };
  }
}

function validateCommands(commands) {
  if (!Array.isArray(commands) || commands.length === 0) throw new Error('approved verification commands are required');
  for (const spec of commands) {
    if (!Array.isArray(spec?.command) || !spec.command.length || spec.command.some(part => typeof part !== 'string' || part.includes('\0')) || !spec.command[0].trim()) throw new Error('approved verification command is invalid');
    if (spec.cwd !== '.' && !safeRepositoryPath(spec.cwd)) throw new Error('approved verification cwd is invalid');
    if (!Array.isArray(spec.scope) || !spec.scope.length || spec.scope.some(item => !safeRepositoryPath(item?.path))) throw new Error('approved verification scope must list source hunks');
  }
  return structuredClone(commands);
}

/** Load plan authority from disk: the file hash must equal the host-issued approval hash. */
export function loadSimplifyHostAuthority(authority) {
  const root = realpathSync.native(authority?.root);
  const plan = readApprovedArtifactFile(root, authority?.plan?.path);
  if (plan.approval_hash !== authority.plan.approval_hash) throw new Error('approved plan hash differs from the host-issued approval_hash');
  const parents = (authority.parents ?? []).map(parent => {
    const loaded = readApprovedArtifactFile(root, parent.path);
    if (loaded.approval_hash !== parent.approval_hash) throw new Error(`approved parent hash differs from the host-issued approval_hash: ${parent.path}`);
    return loaded.artifact;
  });
  verifyApprovedArtifactGraph(plan.artifact, parents);
  for (const parent of parents) verifyApprovedArtifactGraph(parent, parents.filter(other => other !== parent));
  const metadata = plan.artifact.metadata;
  if (metadata.artifact_kind !== 'plan' || metadata.owner_repository_id !== authority.repository_id || metadata.change_ref !== authority.change_ref) throw new Error('approved plan owner/change differs from the host authority');
  const policyBlock = plan.artifact.body.match(/```simplify-host-policy\r?\n([\s\S]*?)\r?\n```/u);
  if (!policyBlock) throw new Error('approved simplify-host-policy is unavailable');
  const policy = JSON.parse(policyBlock[1]);
  const step = policy?.steps?.find(item => item?.step_id === authority.step_id);
  if (policy?.schema_version !== 1 || !step) throw new Error('approved simplify-host-policy step is unavailable');
  if (step.owner_repository_id !== authority.repository_id) throw new Error('approved step owner differs from the host authority');
  validateApprovedWriteScope(metadata, step);
  const finishBlock = plan.artifact.body.match(/```finish-policy\r?\n([\s\S]*?)\r?\n```/u);
  const volatile = validateVolatilePaths(finishBlock ? (JSON.parse(finishBlock[1]).volatile_paths ?? []) : []);
  return { root, plan: plan.artifact, parents, step: structuredClone(step), commands: validateCommands(step.verification_commands),
    oracles: loadOracles(root, step.oracles), volatile, plan_ref: { path: authority.plan.path, approval_hash: authority.plan.approval_hash, step_id: step.step_id } };
}

// A direct fix has no approved plan step, so it has no verification or oracle
// source: the runner can only Analyze it (A7).
function directAuthority(authority) {
  return { root: realpathSync.native(authority?.root), plan: null, parents: [], step: null, commands: [], volatile: [], plan_ref: null,
    oracles: { available: false, reason: 'a direct fix has no approved plan step', paths: [] } };
}

function buildContext({ session, action, root, repositoryId, changeRef, revision, planRef, spec, files, hunks }) {
  return {
    schema_version: 2, source: 'sdcorejs-simplify', phase: 'preflight', session_id: session.id, action, invocation: planRef ? 'approved-plan' : 'direct',
    artifact_identity: { owner_repository_id: repositoryId, owner_module_id: null, execution_host_repository_id: repositoryId },
    source_revision: revision, approved_plan_step: planRef ? { artifact_ref: planRef.path, approval_hash: planRef.approval_hash, step_id: planRef.step_id } : null,
    target_root: root, target_root_kind: 'target-project', baseline: { snapshot: null }, preflight_ref: null,
    scope: { requested: [...files], eligible_files: [...files], eligible_hunks: structuredClone(hunks), excluded: [], expansions: [] },
    preserved_surfaces: Object.fromEntries(simplifyPreservedSurfaces.map(surface => [surface, 'pending'])),
    limits: { ...simplifyLimits }, passes: [], result: { status: 'pending', files_changed: [], receipt: null },
    verification: { before: [], after: [], preservation: null, behavior_verification: 'not-verified', git_diff_check: 'not-run', blockers: [], risks: [] },
    artifact_context: { schema_version: 1, change_ref: changeRef, source_spec: spec ?? 'none', source_plan: planRef?.path ?? 'none',
      required_with_change: [], shared_owned: [], conditional: [], local_only: [], unrelated_observed: [] },
  };
}

function narrowScope(authority, request) {
  const files = authority.scope?.files ?? [], hunks = authority.scope?.hunks ?? [];
  if (!Array.isArray(files) || !files.length || !files.every(safeRepositoryPath)) throw new Error('host authority scope is required');
  if (request.scope === undefined) return { files: [...files], hunks: structuredClone(hunks) };
  const narrowed = { files: request.scope.files ?? [], hunks: request.scope.hunks ?? [] };
  const within = (inner, outer) => outer.some(item => item.path === inner.path && item.start_line <= inner.start_line && item.end_line >= inner.end_line);
  if (!narrowed.files.every(file => files.includes(file)) || !narrowed.hunks.every(item => within(item, hunks))) throw new Error('request scope must narrow the host-resolved simplify scope');
  return narrowed;
}

function checkAnchorAndChain(authority, root, files) {
  const prior = authority.prior_receipts ?? [];
  if (authority.repaired === true) throw new Error('repair closed the simplify chain; no further pass is allowed');
  if (prior.length + 1 > simplifyLimits.max_passes) throw new Error('simplify pass cap exceeded across the receipt chain');
  const anchor = authority.anchor ?? {};
  const anchorHash = file => {
    if (anchor.kind === 'head') {
      // Filtered HEAD content, as checkout writes it (eol and smudge conversion).
      const blob = filteredHeadBlob(root, file);
      return blob ? sha(blob) : null;
    }
    if (anchor.kind === 'host-snapshot') return anchor.files?.[file] ?? null;
    throw new Error('a head or host-snapshot anchor issued by the host is required');
  };
  const expected = {};
  for (const receipt of prior) {
    if (receipt?.kind !== SIMPLIFY_HOST_RECEIPT || !['verified', 'reverted'].includes(receipt.status)) throw new Error('prior receipt chain contains an incomplete pass');
    for (const file of receipt.pass_paths ?? []) {
      const start = Object.hasOwn(expected, file) ? expected[file] : anchorHash(file);
      if (receipt.before?.[file] !== start) throw new Error(`receipt chain is discontinuous at ${file}; the chain must start at the anchor`);
      if (receipt.status === 'reverted' && receipt.after?.[file] !== receipt.before?.[file]) throw new Error(`reverted receipt does not restore the before-state of ${file}`);
      expected[file] = receipt.after?.[file];
    }
  }
  const union = new Set([...prior.flatMap(receipt => receipt.pass_paths ?? []), ...files]);
  if (union.size > simplifyLimits.max_total_files_without_reconfirmation) throw new Error('simplify total file cap exceeded across the receipt chain');
  const priorHunks = prior.reduce((total, receipt) => total + (Number.isInteger(receipt.hunks) ? receipt.hunks : 0), 0);
  if (priorHunks >= simplifyLimits.max_hunks_without_reconfirmation) throw new Error('simplify hunk cap exhausted across the receipt chain');
  const chainOwned = [];
  for (const file of files) {
    const start = Object.hasOwn(expected, file) ? expected[file] : anchorHash(file);
    const bytes = readFileSync(containedRepositoryFile({ root }, file));
    if (sha(bytes) !== start) throw new Error(`current content of ${file} does not match the anchor or the last receipt; supply the complete receipt chain`);
    // With a head anchor, continuity proves every change since HEAD came from a
    // prior pass of this chain, so the file holds no user-owned uncommitted work.
    if (anchor.kind === 'head' && Object.hasOwn(expected, file)) chainOwned.push({ path: file, start_line: 1, end_line: Math.max(1, bytes.toString('utf8').split('\n').length) });
  }
  return { prior, priorHunks, chainOwned };
}

function blockedReceipt(base, blockers) {
  return { ...base, status: 'blocked', pass_paths: [], before: {}, after: {}, hunks: 0, commands: [], blockers };
}

/** Run one pass in this process. Returns { receipt, simplify_context }. */
export async function runSimplifyHostPass(authorityInput, request) {
  const base = { schema_version: 1, kind: SIMPLIFY_HOST_RECEIPT, repository_id: authorityInput?.repository_id ?? null, change_ref: authorityInput?.change_ref ?? null,
    plan: { path: authorityInput?.plan?.path ?? null, approval_hash: authorityInput?.plan?.approval_hash ?? null, step_id: authorityInput?.step_id ?? null },
    anchor: { kind: authorityInput?.anchor?.kind ?? null }, base_revision: null, action: request?.action ?? null, chain_index: (authorityInput?.prior_receipts ?? []).length };
  // Armed before the pass writes: a later failure restores only paths that still hold
  // this pass's output, so a partial or refused write never overwrites other changes.
  let restore = null, passRecord = null, root = null;
  const readPassPath = file => { try { return readFileSync(containedRepositoryFile({ root }, file)); } catch { return null; } };
  try {
    for (const key of Object.keys(request ?? {})) if (!REQUEST_FIELDS.has(key)) throw new Error(`request carries authority field ${key}; authority comes only from --authority`);
    if (request?.schema_version !== 1 || (!APPLY_ACTIONS.has(request.action) && !ANALYZE_ACTIONS.has(request.action))) throw new Error('request schema or action is invalid');
    const apply = APPLY_ACTIONS.has(request.action);
    const direct = authorityInput?.plan == null;
    if (direct && apply) throw new Error('a direct fix without an approved plan step can only Analyze');
    const authority = direct ? directAuthority(authorityInput) : loadSimplifyHostAuthority(authorityInput);
    root = authority.root;
    const scope = narrowScope(authorityInput, request);
    const edits = apply ? request.edits : [];
    if (apply && (!Array.isArray(edits) || !edits.length || edits.some(edit => !scope.files.includes(edit?.path) || typeof edit.content !== 'string'))) throw new Error('edits must target the resolved simplify scope with text content');
    if (apply && !authority.oracles.available) throw new Error(`no trusted oracle; the runner can only Analyze: ${authority.oracles.reason}`);
    const { priorHunks, chainOwned } = checkAnchorAndChain(authorityInput, root, scope.files);
    const revision = git(root, ['rev-parse', 'HEAD']).stdout.toString().trim();
    base.base_revision = revision;
    if (authorityInput.anchor.kind === 'host-snapshot') base.anchor.fingerprint = authorityInput.anchor.fingerprint ?? null;
    const session = createSimplifyEvidenceSession({ root, repository_id: authorityInput.repository_id, change_ref: authorityInput.change_ref,
      execution_host_repository_id: authorityInput.repository_id, user_scope: scope.hunks, user_owned_hunks: authorityInput.user_owned_hunks ?? [],
      workflow_hunks: [...(authorityInput.workflow_hunks ?? []), ...chainOwned], classify_source: authority.oracles.classify_source, verify_preservation: authority.oracles.verify_preservation,
      verification_commands: authority.commands, volatile_paths: authority.volatile, oracle_paths: authority.oracles.paths ?? [],
      ...(direct ? {} : { approved_plan: { artifact: authority.plan, parents: authority.parents, step_id: authority.step.step_id, resolve_step: () => structuredClone(authority.step), approval_hash: authority.plan_ref.approval_hash } }) });
    const spec = authority.parents.find(parent => parent.metadata.artifact_kind === 'spec')?.metadata.repository_relative_path;
    const context = buildContext({ session, action: request.action, root, repositoryId: authorityInput.repository_id, changeRef: authorityInput.change_ref, revision,
      planRef: authority.plan_ref, spec, files: scope.files, hunks: scope.hunks });
    context.baseline.snapshot = session.captureSnapshot();
    context.verification.before = authority.commands.map(command => session.runVerification(command));
    const preflight = evaluateRepositoryEvidence(context, { session }, 'preflight');
    if (preflight.status === 'blocked') return finish(blockedReceipt(base, preflight.blockers), context, null);
    const checkpoint = Object.fromEntries(scope.files.map(file => [file, readFileSync(containedRepositoryFile({ root }, file))]));
    // The whole-chain hunk budget is checked before any byte is written.
    const predicted = edits.reduce((total, edit) => total + simplifyDiffHunks(checkpoint[edit.path], edit.content).length, 0);
    if (priorHunks + predicted > simplifyLimits.max_hunks_without_reconfirmation) throw new Error('simplify hunk cap exceeded across the receipt chain');
    const observed = { root, owner: authorityInput.repository_id, volatile: authority.volatile, guarded: [...scope.files] };
    const restorePassPaths = () => {
      // Rollback restores only bytes this pass wrote. A path still at its checkpoint is
      // skipped; a path holding neither the checkpoint nor the pass output changed
      // concurrently, so nothing is written and the host must resolve it.
      const current = Object.fromEntries(edits.map(edit => [edit.path, readPassPath(edit.path)]));
      const conflicts = edits.filter(edit => !current[edit.path] || (!current[edit.path].equals(checkpoint[edit.path]) && !current[edit.path].equals(Buffer.from(edit.content))));
      if (conflicts.length) throw new Error(`concurrent change on a pass path blocks rollback: ${conflicts.map(edit => edit.path).join(', ')}`);
      const pending = edits.filter(edit => !current[edit.path].equals(checkpoint[edit.path]));
      // Rollback is a host window in which declared volatile paths may not change.
      const ledger = registerVolatileLedger({ root, change_ref: authorityInput.change_ref, volatile_paths: authority.volatile, snapshot: captureRepository(observed) });
      const window = beginVolatileWindow(ledger, 'rollback', captureRepository(observed));
      // A failed capture still closes the window; without a snapshot nothing is recorded.
      let after;
      try {
        for (const edit of pending) writeFileSync(assertSingleLinkWriteTarget({ root }, edit.path), checkpoint[edit.path]);
        after = captureRepository(observed);
      } finally { endVolatileWindow(window, after); }
      return pending.length;
    };
    // A refused or failed pass still names its paths and hashes so the host can act on them.
    const record = () => ({ pass_paths: edits.map(edit => edit.path),
      before: Object.fromEntries(edits.map(edit => [edit.path, sha(checkpoint[edit.path])])),
      after: Object.fromEntries(edits.map(edit => { const bytes = readPassPath(edit.path); return [edit.path, bytes ? sha(bytes) : null]; })) });
    const post = structuredClone(context);
    Object.assign(post, { phase: 'postflight', preflight_ref: preflight.preflight_ref });
    if (apply) { restore = restorePassPaths; passRecord = record; session.applyEdits(preflight.preflight_ref, edits); }
    post.passes = session.ledger();
    post.verification.after = authority.commands.map(command => session.runVerification(command));
    let outcome = evaluateRepositoryEvidence(post, { session }, 'postflight');
    let status = outcome.status === 'verified' ? 'verified' : outcome.status === 'analyzed' ? 'analyzed' : 'blocked';
    const blockers = [...(outcome.blockers ?? [])];
    if (apply && status === 'blocked') {
      // Scoped rollback: restore only the pass paths, re-run verification and postflight.
      restore = null;
      // A refused rollback keeps the postflight failure that triggered it.
      try { restorePassPaths(); } catch (error) { error.pass_blockers = [...blockers]; throw error; }
      const rollback = structuredClone(outcome.context ?? post);
      Object.assign(rollback, { phase: 'postflight', preflight_ref: preflight.preflight_ref, passes: session.ledger() });
      rollback.verification.after = authority.commands.map(command => session.runVerification(command));
      outcome = evaluateRepositoryEvidence(rollback, { session }, 'postflight');
      status = outcome.context?.result?.status === 'reverted' ? 'reverted' : 'blocked';
      if (status === 'blocked') blockers.push(...(outcome.blockers ?? []));
    }
    const passPaths = apply ? edits.map(edit => edit.path) : [];
    const artifacts = session.evidenceArtifacts();
    const afterRefs = new Set((outcome.context?.verification?.after ?? post.verification.after).map(ref => ref.artifact_ref));
    const commands = artifacts.filter(artifact => afterRefs.has(artifact.metadata.repository_relative_path)).map(artifact => {
      const body = JSON.parse(artifact.body);
      return { command: body.command, cwd: body.cwd, exit_code: body.exit_code, result: body.result, output_digest: body.output_digest };
    });
    const hunks = session.ledger().reduce((total, pass) => total + pass.hunks.length, 0);
    if (priorHunks + hunks > simplifyLimits.max_hunks_without_reconfirmation) throw new Error('simplify hunk cap exceeded across the receipt chain');
    const receipt = { ...base, status, pass_paths: passPaths,
      before: Object.fromEntries(passPaths.map(file => [file, sha(checkpoint[file])])),
      after: Object.fromEntries(passPaths.map(file => [file, sha(readFileSync(containedRepositoryFile({ root }, file)))])),
      hunks, commands, blockers: status === 'verified' || status === 'analyzed' || status === 'reverted' ? [] : blockers };
    restore = null;
    return finish(receipt, outcome.context ?? post, outcome);
  } catch (error) {
    const blockers = [error.message, ...(Array.isArray(error.pass_blockers) ? error.pass_blockers : [])];
    if (restore) {
      try { blockers.push(restore() ? 'the pass writes were rolled back to the checkpoint' : 'no pass write needed rollback'); }
      catch (rollbackError) { blockers.push(`rollback failed; the pass paths need host attention: ${rollbackError.message}`); }
    }
    const receipt = blockedReceipt(base, blockers);
    if (passRecord) Object.assign(receipt, passRecord());
    return finish(receipt, null, null);
  }
}

/**
 * Canonical finish verifier (A7), injected as the observation runtime's
 * `simplify_verifier`. It takes the plan step and oracles from the runtime's
 * verified plan, the scope from the finish scope, hunk ownership from observed
 * implementation windows and the initial snapshot, and the anchor and chain from
 * the host, then re-derives the composite diff. Fresh verification belongs to the
 * finish `reverify` phase, so commands are not rerun here.
 */
export function createFinishSimplifyVerifier({ step_id: stepId } = {}) {
  if (typeof stepId !== 'string' || !stepId.trim()) throw new Error('the finish simplify verifier needs the approved plan step id');
  return input => {
    const blocked = reason => ({ verified: false, outcome: 'blocked', pass_paths: [], blockers: [reason] });
    const plan = input?.plan?.artifact;
    if (!plan) return blocked('the verified plan is unavailable; a direct fix can only Analyze');
    try {
      const policyBlock = plan.body.match(/```simplify-host-policy\r?\n([\s\S]*?)\r?\n```/u);
      const step = policyBlock ? JSON.parse(policyBlock[1])?.steps?.find(item => item?.step_id === stepId) : null;
      if (!step || step.owner_repository_id !== input.repository_id) return blocked('approved simplify-host-policy step is unavailable');
      validateApprovedWriteScope(plan.metadata, step);
      const oracles = loadOracles(input.root, step.oracles);
      if (!oracles.available) return blocked(`no trusted oracle: ${oracles.reason}`);
      const files = (input.scope ?? []).filter(file => input.anchor?.bytes?.[file]);
      const hunks = files.map(file => ({ path: file, start_line: 1, end_line: Math.max(1, Buffer.from(input.anchor.bytes[file]).toString('utf8').replace(/\n$/u, '').split('\n').length) }));
      const ownership = deriveHostHunkOwnership({ root: input.root, files, anchor: input.anchor, initial: input.initial, windows: input.implementation_windows ?? [] });
      return revalidateSimplifyHostReceipt({ root: input.root, receipt: input.receipt, chain: input.chain ?? [], anchor: { kind: 'host-snapshot', snapshot: input.anchor },
        authority: { plan: { approval_hash: plan.metadata.approval_hash }, step, commands: validateCommands(step.verification_commands), oracles },
        requested_scope: { files, hunks }, after: input.after, run_verification: false, ...ownership,
        repository_id: input.repository_id, change_ref: input.change_ref });
    } catch (error) { return blocked(error.message); }
  };
}

function finish(receipt, context, outcome) {
  if (!context) return { receipt, simplify_context: null };
  const output = structuredClone(context);
  Object.assign(output, { host_kind: 'runner', session_id: null, baseline: { snapshot: null }, preflight_ref: null, passes: [],
    anchor: structuredClone(receipt.anchor), host_receipt_digest: `sha256:${createHash('sha256').update(JSON.stringify(receipt)).digest('hex')}` });
  output.verification.before = []; output.verification.after = []; output.verification.preservation = null;
  output.verification.behavior_verification = receipt.status === 'verified' ? 'covered-by-current-tests' : 'not-verified';
  output.verification.blockers = [...receipt.blockers];
  output.result = { status: receipt.status === 'verified' ? (receipt.pass_paths.length ? 'simplified' : 'unchanged') : receipt.status === 'analyzed' ? 'analyzed' : receipt.status === 'reverted' ? 'reverted' : 'blocked',
    files_changed: receipt.status === 'verified' ? [...receipt.pass_paths] : [], receipt: null, concurrent_changes: outcome?.context?.result?.concurrent_changes ?? [] };
  return { receipt, simplify_context: output };
}

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    if (!['--authority', '--request'].includes(argv[index]) || !argv[index + 1]) throw new Error('usage: host-runner.mjs --authority <authority.json> --request <request.json>');
    options[argv[index].slice(2)] = argv[index + 1];
  }
  if (!options.authority || !options.request) throw new Error('usage: host-runner.mjs --authority <authority.json> --request <request.json>');
  return options;
}

const isCli = typeof process.argv[1] === 'string' && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isCli) {
  (async () => {
    let result;
    try {
      const options = parseArguments(process.argv.slice(2));
      result = await runSimplifyHostPass(JSON.parse(readFileSync(options.authority, 'utf8')), JSON.parse(readFileSync(options.request, 'utf8')));
    } catch (error) {
      result = { receipt: { schema_version: 1, kind: SIMPLIFY_HOST_RECEIPT, status: 'blocked', blockers: [error.message] }, simplify_context: null };
    }
    process.stdout.write(`${JSON.stringify(result)}\n`);
    process.exitCode = ['verified', 'analyzed'].includes(result.receipt.status) ? 0 : 1;
  })();
}
