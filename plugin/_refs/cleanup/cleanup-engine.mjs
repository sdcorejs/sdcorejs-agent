import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { classifyArtifact, parseArtifactFrontmatter, scanSensitiveArtifactContent, scanSensitiveArtifactPath, isBinaryArtifactPath } from '../shared/artifact-lifecycle.mjs';
import { systemRegistry } from '../shared/system-registry.mjs';
import { CLEANUP_RUNTIME_ROOT, cleanupPath, isCleanupRuntimePath, cleanupFingerprint, validateCleanupPlan, cleanupActionAuthorized, hasCompleteCleanupConsumerCoverage, validateCleanupPosixBoundary, validateCleanupMaintenance } from './cleanup-contract.mjs';
import { acquireSafeCleanupWriter, performSafeFileOperation, releaseSafeCleanupWriter } from './native-file-operation.mjs';

const exec = promisify(execFile);
const TEXT = /\.(?:md|txt|json|ya?ml|[cm]?[jt]sx?|html?|css|scss|svg|astro|xml|toml)$/iu;
const ASSET = /\.(?:png|jpe?g|webp|gif|svg|ico|woff2?|ttf|mp[34]|webm|pdf)$/iu;
const CONSUMER_PATH = /(?:^|\/)(?:assets?|media|images?|fonts?|audio|video|exports)(?:\/|$)/iu;
const EXCLUDED = new Set(['.git', 'node_modules', '.aws', '.codex', '.agents']);
const SECRET = /(?:^|\/)(?:\.env(?:\..*)?|[^/]*(?:private-key|credentials|secrets|auth-state|storage-state|browser-state)[^/]*)$/iu;
const SESSION = /^\.sdcorejs\/(?:tasks\/)?(?:sessions(?:\/|$)|current-session\.md$)/iu;
const samePath = (a, b) => process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
const bytesHash = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const failure = (code, itemPath, message = code) => ({ code, path: itemPath, message });

async function exists(target) { try { await lstat(target); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } }

/** Reject every link component and Git boundary before reading or mutating a scoped path. */
async function checkedPath(root, relative, { missing = false, runtime = false } = {}) {
  cleanupPath(relative);
  if (!runtime && (isCleanupRuntimePath(relative) || SESSION.test(relative) || relative.split('/').some((part) => EXCLUDED.has(part.toLowerCase())))) throw new Error('PROTECTED_BOUNDARY');
  let current = root;
  for (const [index, segment] of relative.split('/').entries()) {
    current = path.join(current, segment);
    let stat;
    try { stat = await lstat(current); } catch (error) { if (missing && error.code === 'ENOENT') return current; throw error; }
    if (stat.isSymbolicLink()) throw new Error('SYMLINK_BOUNDARY');
    const resolved = await realpath(current);
    if (!samePath(resolved, path.resolve(current))) throw new Error('CANONICAL_BOUNDARY_CHANGED');
    if (stat.isDirectory() && await exists(path.join(current, '.git'))) throw new Error('NESTED_REPOSITORY');
    if (index < relative.split('/').length - 1 && !stat.isDirectory()) throw new Error('INVALID_PARENT');
  }
  return current;
}

async function canonicalRoot(root) {
  const requested = path.resolve(root);
  const stat = await lstat(requested);
  if (stat.isSymbolicLink() || !stat.isDirectory()) throw new Error('UNSAFE_ROOT');
  const resolved = await realpath(requested);
  if (!samePath(requested, resolved)) throw new Error('ROOT_ALIAS');
  return resolved;
}

async function gitState(root) {
  try {
    const { stdout: top } = await exec('git', ['rev-parse', '--show-toplevel'], { cwd: root, windowsHide: true });
    if (!samePath(path.resolve(top.trim()), root)) throw new Error('AMBIGUOUS_REPOSITORY_ROOT');
    const [{ stdout: revision }, { stdout: dirty }, { stdout: index }] = await Promise.all([
      exec('git', ['rev-parse', 'HEAD'], { cwd: root, windowsHide: true }),
      exec('git', ['status', '--porcelain=v1', '-z', '--untracked-files=all'], { cwd: root, windowsHide: true, maxBuffer: 4 * 1024 * 1024 }),
      exec('git', ['ls-files', '--stage', '-z'], { cwd: root, windowsHide: true, maxBuffer: 4 * 1024 * 1024 }),
    ]);
    const records = dirty.split('\0').filter(Boolean).filter((record) => !isCleanupRuntimePath(record.slice(3)));
    const entries = index.split('\0').filter(Boolean).map((entry) => ({ mode: entry.slice(0, 6), path: entry.slice(entry.indexOf('\t') + 1) }));
    const tracked = entries.map((entry) => entry.path).sort();
    const submodules = entries.filter((entry) => entry.mode === '160000').map((entry) => entry.path).sort();
    return { revision: revision.trim(), records: records.sort(), tracked, submodules, fingerprint: cleanupFingerprint({ records: records.sort(), tracked, submodules }) };
  } catch (error) {
    if (error.message === 'AMBIGUOUS_REPOSITORY_ROOT') throw error;
    if (await exists(path.join(root, '.git'))) throw new Error('GIT_STATE_UNAVAILABLE');
    return { revision: null, records: [], tracked: [], submodules: [], fingerprint: cleanupFingerprint({ records: [], tracked: [], submodules: [] }) };
  }
}

const observeStat = target => lstat(target, process.platform === 'win32' ? undefined : { bigint: true });
function stateOf(stat) {
  if (typeof stat.size === 'bigint' ? stat.size < 0n || stat.size > BigInt(Number.MAX_SAFE_INTEGER)
    : !Number.isSafeInteger(stat.size) || stat.size < 0) throw new Error('UNREPRESENTABLE_FILE_SIZE');
  if (typeof stat.ino !== 'bigint') return { size: stat.size, mtime: stat.mtimeMs, ctime: stat.ctimeMs, ino: stat.ino, dev: stat.dev, mode: stat.mode, nlink: stat.nlink };
  return { size: Number(stat.size), mtime: Number(stat.mtimeNs / 1_000_000n), ctime: Number(stat.ctimeNs / 1_000_000n),
    ino: stat.ino.toString(), dev: stat.dev.toString(), mode: Number(stat.mode), nlink: Number(stat.nlink),
    mtime_ns: stat.mtimeNs.toString(), ctime_ns: stat.ctimeNs.toString(), uid: Number(stat.uid), gid: Number(stat.gid) };
}
const rootStateOf = stat => ({ ino: typeof stat.ino === 'bigint' ? stat.ino.toString() : stat.ino,
  dev: typeof stat.dev === 'bigint' ? stat.dev.toString() : stat.dev });

async function inventory(root, scopes, { max_files = 5000, max_bytes = 32 * 1024 * 1024, read_text = false, git = null } = {}) {
  const files = [], directories = [], blocked = [], seen = new Set(); let hashedBytes = 0;
  async function visit(relative) {
    if (seen.has(relative) || isCleanupRuntimePath(relative) || SESSION.test(relative)) return;
    seen.add(relative);
    if (git?.submodules.some((boundary) => relative === boundary || relative.startsWith(`${boundary}/`))) { blocked.push(failure('SUBMODULE_BOUNDARY', relative)); return; }
    let absolute, stat;
    try { absolute = await checkedPath(root, relative); stat = await observeStat(absolute); }
    catch (error) { blocked.push(failure(error.code === 'ENOENT' ? 'MISSING_PATH' : error.message, relative)); return; }
    if (stat.isDirectory()) {
      const entries = await readdir(absolute, { withFileTypes: true });
      const names = entries.map((entry) => entry.name).sort();
      directories.push({ path: relative, entries: names.filter((name) => !isCleanupRuntimePath(`${relative}/${name}`)) });
      for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
        if (EXCLUDED.has(entry.name.toLowerCase())) { blocked.push(failure('PROTECTED_BOUNDARY', `${relative}/${entry.name}`)); continue; }
        await visit(`${relative}/${entry.name}`);
      }
      return;
    }
    if (!stat.isFile()) { blocked.push(failure('UNSUPPORTED_FILE_TYPE', relative)); return; }
    if (files.length >= max_files) { blocked.push(failure('SCAN_LIMIT', relative)); return; }
    const record = { path: relative, state: stateOf(stat), fingerprint: null };
    if (SECRET.test(relative) || scanSensitiveArtifactPath(relative).length) { record.sensitive = true; files.push(record); return; }
    // Use the checked numeric size for counters; lossless identity stays in state.
    if (record.state.size > max_bytes - hashedBytes) { record.unknowns = ['file or aggregate exceeds bounded hashing limit']; files.push(record); return; }
    const bytes = await readFile(absolute);
    hashedBytes += bytes.length;
    const after = await observeStat(absolute);
    if (cleanupFingerprint(stateOf(after)) !== cleanupFingerprint(record.state)) { blocked.push(failure('FILE_CHANGED_DURING_SCAN', relative)); return; }
    record.fingerprint = bytesHash(bytes);
    const scanText = !isBinaryArtifactPath(relative) || !bytes.subarray(0, 8000).includes(0) ? bytes.toString('utf8') : null;
    if (scanSensitiveArtifactContent(relative, scanText).length) record.sensitive = true;
    if (read_text && TEXT.test(relative) && !record.sensitive) record.text = bytes.toString('utf8');
    files.push(record);
  }
  for (const scope of scopes) await visit(cleanupPath(scope));
  return { files: files.sort((a, b) => a.path.localeCompare(b.path)), directories: directories.sort((a, b) => a.path.localeCompare(b.path)), blocked };
}

function snapshot({ root, root_state, scope, reference_scope, own, references, git, evidence, task }) {
  const strip = ({ text, ...file }) => file;
  const payload = { root_id: root, root_state, scope, reference_scope,
    inventory: own.files.map(strip), directories: own.directories, blocked: own.blocked,
    references: references.files.map(strip), reference_directories: references.directories, reference_blocked: references.blocked,
    git, evidence, task };
  return { ...payload, fingerprint: cleanupFingerprint(payload), revision: git.revision, git_state_fingerprint: git.fingerprint };
}

/** Current snapshot is evidence only; it never grants cleanup authority. */
export async function captureCleanupState({ root, scope, reference_scope = [], evidence = {}, task = null } = {}) {
  root = await canonicalRoot(root);
  const root_state = rootStateOf(await observeStat(root));
  const git = await gitState(root);
  const [own, references] = await Promise.all([inventory(root, scope, { git }), inventory(root, reference_scope, { git })]);
  return snapshot({ root, root_state, scope, reference_scope, own, references, git, evidence, task });
}

function isProtectedDurable(relative) {
  const roots = Object.values(systemRegistry.artifact_roots).flatMap((value) => typeof value === 'string' ? [value] : []);
  return roots.some((root) => /(?:specs|architecture|plans|product|design|conventions|approvals)/u.test(root) && relative.toLowerCase().startsWith(`${root.replace(/\/+$/u, '').toLowerCase()}/`))
    || /^\.sdcorejs\/(?:specs|architecture|plans|product|design|conventions|approvals)(?:\/|$)/iu.test(relative)
    || /(?:^|\/)(?:adr|decisions|architecture-decisions)(?:\/|$)/iu.test(relative);
}

function referencesTo(candidate, references) {
  const basename = path.posix.basename(candidate.path);
  const hits = references.files.filter((file) => file.text && file.path !== candidate.path && (file.text.includes(candidate.path) || file.text.includes(basename))).map((file) => file.path);
  const dynamic = references.files.filter((file) => file.text && (/(?:\$\{|require\.context|import\.meta\.glob|new URL\(|assets\s*[:=]|"assets"\s*:|"exports"\s*:)/u.test(file.text)
    || /(?:["'][^"'\r\n]*\/[^"'\r\n]*["']\s*\+|\+\s*["']\.[a-z0-9]+["'])/iu.test(file.text))).map((file) => file.path);
  const complete = references.blocked.length === 0 && references.files.every((file) =>
    file.fingerprint && !file.sensitive && !file.unknowns?.length && typeof file.text === 'string'
    && scanSensitiveArtifactContent(file.path, file.text).length === 0);
  return { hits, dynamic, complete };
}

function classify(file, { references, evidence, task, git, skill_pack }) {
  const info = evidence[file.path] ?? {};
  let metadata = file.text ? parseArtifactFrontmatter(file.text) : {};
  if (/\.json$/iu.test(file.path) && file.text) {
    try { const data = JSON.parse(file.text); if (data?.metadata?.approval_hash) metadata = data.metadata; }
    catch { /* Unparseable data cannot establish approved metadata. */ }
  }
  const lifecycle = classifyArtifact({ path: file.path, metadata });
  const refs = referencesTo(file, references);
  const record = { path: file.path, fingerprint: file.fingerprint, state_fingerprint: cleanupFingerprint(file.state), bytes: file.state.size,
    lifecycle: lifecycle.lifecycle, classification: 'unknown', risk: 'BLOCKED', certainty: 'unknown', impact: 'unknown', recoverability: 'unknown',
    reasons: [], evidence: [...(info.evidence ?? []).map((item) => String(item)), ...refs.hits], unknowns: [], protected: false,
    owner: info.owner ?? null, task_owned: !!task && info.task_id === task.id && !!info.owner,
    reproducible: info.reproducible === true, producer_finished: info.producer_status === 'finished', needed_for_evidence: info.needed_for_evidence !== false };
  const protect = (classification, reason) => Object.assign(record, { classification, protected: true, risk: 'HIGH', certainty: 'supported', reasons: [reason], impact: 'durable or public contract', recoverability: 'retain original' });
  if (file.sensitive || (file.text && scanSensitiveArtifactContent(file.path, file.text).length)) { record.reasons.push('potentially sensitive content'); return record; }
  const localDesignDiagnostic = /^\.sdcorejs\/design\//iu.test(file.path) && lifecycle.bucket === 'local_only';
  if (isProtectedDurable(file.path) && !localDesignDiagnostic || metadata.approval_hash || ['spec', 'architecture', 'plan'].includes(metadata.artifact_kind) || info.immutable || info.approved || info.historical) return protect('historical', 'immutable approved or historical evidence');
  if (skill_pack && /^(?:\.claude\/(?:skills|_refs)|plugin\/(?:skills|_refs)|codex\/skills)(?:\/|$)/iu.test(file.path)) return protect('intentional-duplicate', 'canonical distribution mirror');
  if (/(?:^|\/)(?:public|baselines|snapshots|reference-screenshots)(?:\/|$)/iu.test(file.path)) return protect('public-or-baseline', 'public assets and test/reference evidence are protected');
  if (info.intentional || /(?:^|\/)fixtures?(?:\/|$)/iu.test(file.path)) return protect('intentional-duplicate', 'independent fixture or explicitly intentional copy');
  if (task && task.status !== 'completed') return protect('recovery-evidence', 'failed, interrupted or unfinished task retains evidence');
  if (!info.owner || info.needed_for_evidence === undefined) { record.unknowns.push(!info.owner ? 'unknown artifact owner' : 'evidence retention need is unknown'); return record; }
  if (info.needed_for_evidence !== false) return protect('current-evidence', 'debug, review, reproducibility or recovery need has not been discharged');
  if (!Array.isArray(info.evidence) || !info.evidence.some((item) => typeof item === 'string' && item.trim())) record.unknowns.push('ownership and producer evidence is missing');
  if (!refs.complete) record.unknowns.push('reference scope contains unread or unresolved evidence');
  if (!file.fingerprint || file.state.nlink > 1) record.unknowns.push(file.state.nlink > 1 ? 'hard-linked file has independent aliases' : 'content fingerprint unavailable');
  if (!info.owner) record.unknowns.push('unknown artifact owner');
  if (info.producer_status !== 'finished') record.unknowns.push('producer completion is unproven');
  if (Number.isInteger(info.producer_pid) && info.producer_pid > 0) {
    try { process.kill(info.producer_pid, 0); record.unknowns.push('producer process remains active'); }
    catch (error) { if (error.code !== 'ESRCH') record.unknowns.push('producer process state is unavailable'); }
  }
  if (info.active || git.records.some((line) => ['M', 'A', 'R', 'C', 'U'].some((flag) => line.slice(0, 2).includes(flag)) && line.slice(3) === file.path)) record.unknowns.push('actively produced or modified file');
  if (refs.hits.length) return protect('referenced', 'current references retain this file');
  const tracked = info.tracked === true || git.tracked.includes(file.path);
  record.risk = tracked ? 'HIGH' : 'MEDIUM'; record.impact = tracked ? 'tracked content' : 'bounded local artifact'; record.recoverability = 'quarantine available';
  // Consumer role and opaque outputs cannot bypass coverage by using an unlisted format.
  // Proven current-task diagnostics remain distinct from declared or semantic consumer assets.
  const consumerRole = CONSUMER_PATH.test(file.path) || Object.hasOwn(info, 'reference_coverage');
  const requiresConsumerCoverage = consumerRole || ASSET.test(file.path) || isBinaryArtifactPath(file.path) || !TEXT.test(file.path);
  const incompleteConsumerCoverage = refs.dynamic.length || !hasCompleteCleanupConsumerCoverage(info.reference_coverage) || !references.files.length || !refs.complete;
  // Consumer absence cannot discharge documentation retention; coverage only adds constraints.
  if (/\.md$/iu.test(file.path)) {
    record.classification = info.doc_status ?? 'unknown';
    if (info.doc_status === 'abandoned-draft' && info.unique_information === false && info.durable_value === false && info.evidence?.length) {
      record.certainty = 'supported'; record.reasons.push('owner-confirmed abandoned draft with no unique or durable information');
    } else return protect(info.doc_status ?? 'current', 'documentation history, unique content or abandonment is not discharged');
    if (requiresConsumerCoverage) {
      if (incompleteConsumerCoverage) record.unknowns.push('dynamic, copy/glob, export or external-consumer coverage is incomplete');
      else record.reasons.push('explicit complete owner-bound consumer coverage');
    }
  } else if (record.reproducible && record.task_owned && !tracked && lifecycle.bucket === 'local_only' && !consumerRole) {
    record.classification = 'reproducible-output'; record.risk = 'LOW'; record.certainty = 'supported';
    record.reasons.push('current-task diagnostic output with finished producer and discharged evidence need');
  } else if (requiresConsumerCoverage) {
    record.classification = 'asset-review';
    if (incompleteConsumerCoverage) record.unknowns.push('dynamic, copy/glob, export or external-consumer coverage is incomplete');
    else { record.classification = 'unused-candidate'; record.certainty = 'supported'; record.reasons.push('explicit complete owner-bound consumer coverage'); }
  } else if (record.reproducible) {
    record.classification = 'reproducible-output'; record.certainty = 'supported'; record.reasons.push('finished producer and explicit reproducibility evidence');
    if (record.task_owned && !tracked && lifecycle.bucket === 'local_only') record.risk = 'LOW';
  } else record.unknowns.push('disposability has not been proven');
  if (record.unknowns.length) { record.risk = 'BLOCKED'; record.certainty = 'unknown'; }
  return record;
}

/** Explicitly bounded read-only discovery; names, age and grep absence never authorize mutation. */
export async function scanCleanup({ root, scope, reference_scope = [], evidence = {}, task = null, limits = {} } = {}) {
  if (!Array.isArray(scope) || !scope.length || !Array.isArray(reference_scope)) throw new Error('EXPLICIT_SCOPE_REQUIRED');
  root = await canonicalRoot(root); scope = [...new Set(scope.map(cleanupPath))].sort(); reference_scope = [...new Set(reference_scope.map(cleanupPath))].sort();
  const root_state = rootStateOf(await observeStat(root));
  const git = await gitState(root);
  const [own, references] = await Promise.all([inventory(root, scope, { ...limits, git, read_text: true }), inventory(root, reference_scope, { ...limits, git, read_text: true })]);
  const skill_pack = await exists(path.join(root, 'MIRROR_POLICY.md')) && await exists(path.join(root, 'scripts/sync-skills.mjs'));
  const findings = own.files.map((file) => classify(file, { references, evidence, task, git, skill_pack }));
  const exact_duplicates = [], near_duplicates = [];
  const bySize = new Map();
  for (const file of own.files) { if (!file.fingerprint) continue; const group = bySize.get(file.state.size) ?? []; group.push(file); bySize.set(file.state.size, group); }
  for (const group of bySize.values()) for (let i = 0; i < group.length; i++) for (let j = i + 1; j < group.length; j++) {
    const a = group[i], b = group[j]; if (a.fingerprint !== b.fingerprint) continue;
    const brand = (relative) => relative.match(/(?:^|\/)(?:brands?|themes?)\/([^/]+)\//iu)?.[1];
    const intentional = (brand(a.path) && brand(b.path) && brand(a.path) !== brand(b.path)) || findings.filter((f) => [a.path, b.path].includes(f.path)).some((f) => f.classification === 'intentional-duplicate');
    exact_duplicates.push({ paths: [a.path, b.path], fingerprint: a.fingerprint, classification: intentional ? 'intentional' : 'exact-review', reason: intentional ? 'independent semantic path or distribution/fixture boundary' : 'byte equality is evidence, not deletion authority' });
  }
  const texts = own.files.filter((file) => file.text && /\.(?:md|txt|svg)$/iu.test(file.path)).slice(0, 100);
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    if (texts[i].fingerprint === texts[j].fingerprint) continue;
    const tokens = (text) => new Set(text.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.slice(0, 8000) ?? []);
    const a = tokens(texts[i].text), b = tokens(texts[j].text); if (a.size < 8 || b.size < 8) continue;
    const overlap = [...a].filter((token) => b.has(token)).length / new Set([...a, ...b]).size;
    if (overlap >= 0.85) near_duplicates.push({ paths: [texts[i].path, texts[j].path], classification: 'near-review', similarity: overlap, reason: 'content overlap requires semantic review; never automatic mutation' });
  }
  return { schema_version: 1, root_id: root, scope, reference_scope, task, evidence,
    state: snapshot({ root, root_state, scope, reference_scope, own, references, git, evidence, task }), findings, exact_duplicates, near_duplicates, blocked: own.blocked, writes: [] };
}

/** Freeze exact actions and their evidence; directory/glob deletion is never a plan action. */
export function freezeCleanupPlan(analysis, { actions = [], posix_boundary = null } = {}) {
  if (!analysis?.state?.fingerprint || !Array.isArray(actions)) throw new Error('ANALYSIS_REQUIRED');
  if (posix_boundary) validateCleanupPosixBoundary(posix_boundary, analysis.root_id);
  const transactionRoot = posix_boundary ? `${CLEANUP_RUNTIME_ROOT}/transactions/${cleanupFingerprint({
    state: analysis.state.fingerprint, boundary: posix_boundary, actions }).split(':').at(-1)}` : null;
  const planned = actions.map((requested, index) => {
    const finding = analysis.findings.find((item) => item.path === cleanupPath(requested.path));
    if (!finding) throw new Error('ACTION_OUTSIDE_ANALYSIS');
    const action = { ...structuredClone(finding), id: `cleanup-${index + 1}`, action: requested.action,
      destination: requested.destination ? cleanupPath(requested.destination) : null,
      restore_strategy: requested.action === 'delete' ? 'irreversible-approved-reproducible-delete' : 'exact-fingerprint-no-overwrite',
      verification: ['exact-state', 'reference-and-boundary-state', 'quarantine-integrity'] };
    if (posix_boundary && !['keep', 'review'].includes(action.action)) action.posix_transaction = {
      capture: `${transactionRoot}/${action.id}/captured`, journal: `${transactionRoot}/${action.id}/journal.ndjson`, recovery: `${transactionRoot}/${action.id}/recovery` };
    if (requested.action === 'archive' && !action.destination) throw new Error('EXACT_ARCHIVE_DESTINATION_REQUIRED');
    if (requested.action === 'delete' && !finding.reproducible && !finding.protected && finding.risk !== 'BLOCKED') throw new Error('RELIABLE_RECOVERY_REQUIRED');
    return action;
  });
  const payload = { schema_version: 1, root_id: analysis.root_id, scope: analysis.scope, reference_scope: analysis.reference_scope,
    task: analysis.task, evidence: analysis.evidence, state: analysis.state, actions: planned,
    ...(posix_boundary ? { posix_boundary: structuredClone(posix_boundary) } : {}) };
  const plan = { ...payload, plan_id: cleanupFingerprint(payload) }; validateCleanupPlan(plan); return plan;
}

function receiptBase(plan) { return { schema_version: 1, plan_id: plan.plan_id, task_id: plan.task?.id ?? null, root_id: plan.root_id, status: 'blocked', actions: [], errors: [], source_before: { fingerprint: plan.state?.fingerprint, revision: plan.state?.revision, git_state_fingerprint: plan.state?.git_state_fingerprint }, metrics: { removed_active_bytes: 0, quarantine_bytes: 0, reclaimed_bytes: 0, archived_bytes: 0 }, verification: { result: 'NOT RUN', checks: [], affected_checks: 'NOT RUN' } }; }
function seal(receipt) { const { receipt_id, ...payload } = receipt; return { ...payload, receipt_id: cleanupFingerprint(payload) }; }

/** Exact file apply with exclusive writer ownership and stale-plan failure before mutation. */
export async function applyCleanupPlan({ root, plan, approval = null, policy = null, task = plan?.task, evidence = plan?.evidence, verify = null, observe = null, maintenance = null } = {}) {
  const receipt = receiptBase(plan ?? {}); let lock;
  try {
    validateCleanupPlan(plan); root = await canonicalRoot(root);
    if (!samePath(root, plan.root_id)) throw new Error('ROOT_SCOPE_CHANGED');
    if (!plan.actions.some((action) => !['keep', 'review'].includes(action.action))) { receipt.actions = plan.actions.map((action) => ({ ...action, status: 'retained' })); receipt.status = 'applied'; return seal(receipt); }
    if (plan.actions.some((action) => !cleanupActionAuthorized({ plan, action, approval, policy }))) throw new Error('MUTATION_AUTHORITY_REQUIRED');
    if (process.platform !== 'win32') {
      validateCleanupPosixBoundary(plan.posix_boundary, root);
      validateCleanupMaintenance(plan.posix_boundary.maintenance, maintenance);
      receipt.posix_boundary = structuredClone(plan.posix_boundary);
    }
    const operations = plan.posix_boundary ? plan.actions.filter(action => !['keep','review'].includes(action.action)).map(action => ({
      source: action.path, destination: action.action === 'quarantine' ? action.posix_transaction.recovery : action.destination,
      fingerprint: action.fingerprint, state: plan.state.inventory.find(file => file.path === action.path)?.state,
      remove_source: true, transaction: action.posix_transaction })) : undefined;
    lock = await acquireSafeCleanupWriter({ root, root_state: plan.state.root_state, identity: plan.plan_id,
      posix_boundary: plan.posix_boundary, maintenance, operations });
    if (!lock.lock_verified || lock.errors.length) throw new Error(lock.errors[0]?.code ?? 'WRITER_VERIFICATION_FAILED');
    const live = observe ? await observe() : { task, evidence };
    const currentAnalysis = await scanCleanup({ root, scope: plan.scope, reference_scope: plan.reference_scope, ...live });
    const current = currentAnalysis.state;
    if (current.fingerprint !== plan.state.fingerprint) throw new Error('STALE_PLAN');
    for (const action of plan.actions.filter((item) => !['keep', 'review'].includes(item.action))) {
      const finding = currentAnalysis.findings.find((item) => item.path === action.path);
      const { id, action: operation, destination, restore_strategy, verification, posix_transaction, ...frozenFinding } = action;
      if (!finding || finding.protected || finding.risk === 'BLOCKED' || finding.unknowns.length
        || cleanupFingerprint(finding) !== cleanupFingerprint(frozenFinding)) throw new Error('CLASSIFICATION_CHANGED');
    }
    const completed = new Set(), expectedDestinations = new Set(), recoveryStates = new Map();
    for (const action of plan.actions) {
      if (['keep', 'review'].includes(action.action)) { receipt.actions.push({ ...action, status: 'retained' }); continue; }
      let destination = action.destination, recoveryCopy = false, recoveryBytes = 0, mutation = null;
      try {
        const liveNow = observe ? await observe() : { task, evidence };
        if (cleanupFingerprint(liveNow) !== cleanupFingerprint({ task: plan.task, evidence: plan.evidence })) throw new Error('OWNERSHIP_OR_PRODUCER_CHANGED');
        const before = await captureCleanupState({ root, scope: plan.scope, reference_scope: plan.reference_scope, ...liveNow });
        const expectedFiles = plan.state.inventory.filter((item) => !completed.has(item.path));
        if (cleanupFingerprint(before.inventory.filter((item) => !expectedDestinations.has(item.path))) !== cleanupFingerprint(expectedFiles)
          || cleanupFingerprint(before.references) !== cleanupFingerprint(plan.state.references)
          || cleanupFingerprint(before.reference_directories) !== cleanupFingerprint(plan.state.reference_directories)
          || before.revision !== plan.state.revision) throw new Error('STALE_ACTION');
        for (const [relative, expected] of recoveryStates) {
          const recovery = await checkedPath(root, relative, { runtime: isCleanupRuntimePath(relative) });
          if (bytesHash(await readFile(recovery)) !== expected.fingerprint || cleanupFingerprint(stateOf(await observeStat(recovery))) !== expected.state_fingerprint) throw new Error('RECOVERY_STATE_CHANGED');
        }
        const expectedGit = (records) => records.filter((record) => !completed.has(record.slice(3)) && !expectedDestinations.has(record.slice(3)));
        if (cleanupFingerprint(expectedGit(before.git.records)) !== cleanupFingerprint(expectedGit(plan.state.git.records))
          || cleanupFingerprint(before.git.tracked) !== cleanupFingerprint(plan.state.git.tracked)
          || cleanupFingerprint(before.git.submodules) !== cleanupFingerprint(plan.state.git.submodules)) throw new Error('MATERIAL_GIT_STATE_CHANGED');
        for (const directory of plan.state.directories) {
          const now = before.directories.find((item) => item.path === directory.path);
          const removedNames = [...completed].filter((relative) => path.posix.dirname(relative) === directory.path).map((relative) => path.posix.basename(relative));
          const addedNames = [...expectedDestinations].filter((relative) => relative.startsWith(`${directory.path}/`)).map((relative) => relative.slice(directory.path.length + 1).split('/')[0]);
          const expectedEntries = [...new Set([...directory.entries.filter((name) => !removedNames.includes(name)), ...addedNames])].sort();
          if (!now || cleanupFingerprint(now.entries) !== cleanupFingerprint(expectedEntries)) throw new Error('DIRECTORY_INVENTORY_CHANGED');
        }
        const absolute = await checkedPath(root, action.path);
        const bytes = await readFile(absolute), stat = await observeStat(absolute);
        if (bytesHash(bytes) !== action.fingerprint || cleanupFingerprint(stateOf(stat)) !== action.state_fingerprint || stateOf(stat).nlink !== 1) throw new Error('STALE_ACTION');
        if (action.action === 'quarantine') destination = plan.posix_boundary ? action.posix_transaction.recovery : `${CLEANUP_RUNTIME_ROOT}/quarantine/${plan.plan_id.split(':').at(-1)}/${action.path}`;
        if (destination) {
          if (destination === action.path || destination.startsWith(`${action.path}/`)) throw new Error('INVALID_DESTINATION');
          await checkedPath(root, destination, { missing: true, runtime: action.action === 'quarantine' });
        }
        mutation = await performSafeFileOperation({ root, root_state: plan.state.root_state,
          source: action.path, destination, fingerprint: action.fingerprint, state: stateOf(stat), writer: lock,
          transaction: action.posix_transaction, maintenance });
        if (mutation.partial || mutation.transaction?.contract_breach) receipt.metrics_known = false;
        if (mutation.copy_created) {
          recoveryCopy = true;
          const heldBytes = mutation.destination_state?.size;
          if (!Number.isSafeInteger(heldBytes) || heldBytes < 0) receipt.metrics_known = false;
          recoveryBytes = Number.isSafeInteger(heldBytes) && heldBytes >= 0 ? heldBytes : 0;
          if (action.action === 'quarantine') receipt.metrics.quarantine_bytes += recoveryBytes;
          if (action.action === 'archive') receipt.metrics.archived_bytes += recoveryBytes;
          if (mutation.copy_verified) {
            expectedDestinations.add(destination);
            recoveryStates.set(destination, { fingerprint: action.fingerprint,
              state_fingerprint: cleanupFingerprint(mutation.destination_state) });
          }
        }
        if (!mutation.source_removed) {
          if (mutation.source_removed === null || mutation.copy_created === null) receipt.metrics_known = false;
          throw new Error(mutation.errors[0]?.code ?? 'NATIVE_OPERATION_INCOMPLETE');
        }
        completed.add(action.path);
        const allocationKnown = action.action !== 'delete' || Number.isSafeInteger(mutation.allocated_bytes) && mutation.allocated_bytes >= 0;
        const reclaimed_bytes = action.action === 'delete' && allocationKnown ? mutation.allocated_bytes : 0;
        receipt.actions.push({ id: action.id, path: action.path, action: action.action, status: action.action === 'delete' ? 'removed' : action.action === 'archive' ? 'archived' : 'quarantined', destination, fingerprint: action.fingerprint, bytes: action.bytes, reclaimed_bytes,
          ...(mutation.transaction ? { native_transaction: mutation.transaction, posix_transaction: action.posix_transaction, recovery_state: mutation.destination_state } : {}) });
        receipt.metrics.removed_active_bytes += action.bytes;
        if (action.action === 'delete') receipt.metrics.reclaimed_bytes += reclaimed_bytes;
        if (!allocationKnown) { receipt.metrics_known = false; throw new Error('ALLOCATION_MEASUREMENT_UNAVAILABLE'); }
        if (mutation.errors.length) throw new Error(mutation.errors[0].code);
      } catch (error) {
        receipt.errors.push(failure(error.code ?? error.message, action.path));
        if (!receipt.actions.some((item) => item.id === action.id)) receipt.actions.push({ id: action.id, path: action.path, action: action.action,
          status: mutation?.source_removed === null ? 'unknown' : 'failed', destination: recoveryCopy ? destination : null,
          recovery_copy: recoveryCopy, fingerprint: recoveryCopy ? mutation?.fingerprint : action.fingerprint, bytes: recoveryBytes,
          ...(mutation?.transaction ? { native_transaction: mutation.transaction, posix_transaction: action.posix_transaction, contract_breach: mutation.transaction.contract_breach, recovery_state: mutation.destination_state } : {}) });
        break;
      }
    }
    for (const action of plan.actions) if (!receipt.actions.some((item) => item.id === action.id)) receipt.actions.push({ id: action.id, path: action.path, action: action.action, status: 'retained' });
    receipt.status = receipt.errors.length ? (completed.size || receipt.metrics_known === false ? 'partial' : 'blocked') : 'applied';
    if (!receipt.errors.length) {
      for (const action of receipt.actions.filter((item) => ['removed', 'quarantined', 'archived'].includes(item.status))) {
        if (await exists(path.join(root, action.path))) throw new Error('ACTIVE_PATH_VERIFICATION_FAILED');
        if (action.destination && bytesHash(await readFile(path.join(root, action.destination))) !== action.fingerprint) throw new Error('RECOVERY_VERIFICATION_FAILED');
      }
      receipt.verification.result = 'PASSED'; receipt.verification.checks.push({ id: 'exact-state-and-recovery', result: 'PASSED', evidence: receipt.actions.map(({ path, status, fingerprint }) => ({ path, status, fingerprint })) });
    }
  } catch (error) { receipt.errors.push(failure(error.code ?? error.message, null)); receipt.status = receipt.actions.some((item) => ['removed', 'quarantined', 'archived'].includes(item.status)) ? 'partial' : 'blocked'; receipt.verification.result = receipt.actions.length ? 'FAILED' : 'NOT RUN'; }
  finally {
    if (lock?.lock_verified) {
      const release = await releaseSafeCleanupWriter({ root, root_state: plan.state.root_state, writer: lock, maintenance });
      if (!release.released || release.errors.length) { receipt.errors.push(failure('WRITER_LOCK_BOUNDARY_CHANGED', lock.path)); receipt.status = 'partial'; }
    }
  }
  if (root) {
    try { receipt.source_after = await captureCleanupState({ root, scope: plan.scope, reference_scope: plan.reference_scope, task, evidence }); }
    catch (error) { receipt.errors.push(failure(error.message, null)); receipt.status = 'partial'; }
  }
  if (receipt.status === 'applied' && verify) {
    try {
      const result = await verify({ root, plan, receipt: structuredClone(receipt) });
      if (result?.result !== 'PASSED' || !Array.isArray(result.checks) || !result.checks.length || result.checks.some((check) => check.result !== 'PASSED' || !Array.isArray(check.actual_command) || !check.actual_command.length || check.actual_command.some((part) => typeof part !== 'string' || !part.trim()) || !check.evidence)) throw new Error('AFFECTED_VERIFICATION_INCOMPLETE');
      receipt.verification.affected_checks = 'PASSED'; receipt.verification.checks.push(...result.checks);
      const afterVerify = await captureCleanupState({ root, scope: plan.scope, reference_scope: plan.reference_scope, task, evidence });
      if (afterVerify.fingerprint !== receipt.source_after.fingerprint) throw new Error('VERIFICATION_CHANGED_CLEANUP_STATE');
      receipt.status = 'verified';
    } catch (error) { receipt.errors.push(failure(error.message, null)); receipt.verification.affected_checks = 'FAILED'; receipt.status = 'partial'; }
  }
  return seal(receipt);
}

/** Restore approved recovery entries without overwriting any destination. */
export async function restoreCleanup({ root, receipt, approval, verify = null, maintenance = null } = {}) {
  const { receipt_id, ...payload } = receipt ?? {};
  if (receipt_id !== cleanupFingerprint(payload) || approval?.authority !== 'restore' || approval.source !== 'conversation' || approval.receipt_id !== receipt_id || approval.root_id !== receipt.root_id) throw new Error('RESTORE_AUTHORITY_REQUIRED');
  root = await canonicalRoot(root); if (!samePath(root, receipt.root_id)) throw new Error('ROOT_SCOPE_CHANGED');
  const entries = receipt.actions.filter((action) => ['quarantined', 'archived'].includes(action.status));
  const context = receipt.source_after;
  if (!Array.isArray(context?.scope) || !context.scope.length || !Array.isArray(context.reference_scope)) throw new Error('RESTORE_SOURCE_CONTEXT_REQUIRED');
  const capture = () => captureCleanupState({ root, scope: context.scope, reference_scope: context.reference_scope, task: context.task, evidence: context.evidence });
  const before = await capture();
  const result = { schema_version: 1, operation: 'restore', restore_of_receipt_id: receipt_id,
    plan_id: receipt.plan_id, root_id: root, task_id: receipt.task_id, status: 'restored', restored: [], actions: [], errors: [],
    source_before: { fingerprint: before.fingerprint, revision: before.revision, git_state_fingerprint: before.git_state_fingerprint },
    metrics: { removed_active_bytes: 0, quarantine_bytes: 0, reclaimed_bytes: 0, archived_bytes: 0, restored_bytes: 0 },
    verification: { result: 'NOT RUN', checks: [], affected_checks: 'NOT RUN' } };
  const posixBoundary = approval.posix_boundary ?? null;
  const operations = [];
  if (process.platform !== 'win32') {
    validateCleanupPosixBoundary(posixBoundary, root);
    validateCleanupMaintenance(posixBoundary.maintenance, maintenance);
    if (!receipt.posix_boundary || approval.posix_boundary_fingerprint !== cleanupFingerprint(posixBoundary)) throw new Error('POSIX_RESTORE_AUTHORITY_REQUIRED');
    result.posix_boundary = structuredClone(posixBoundary);
    for (const action of entries) {
      if (!action.recovery_state) throw new Error('RESTORE_SOURCE_STATE_REQUIRED');
      const transactionRoot = `${CLEANUP_RUNTIME_ROOT}/transactions/${cleanupFingerprint({ restore: receipt_id, boundary: posixBoundary }).split(':').at(-1)}/${action.id}`;
      operations.push({ source: action.destination, destination: action.path, fingerprint: action.fingerprint, state: action.recovery_state, remove_source: true,
        transaction: { capture: `${transactionRoot}/captured`, journal: `${transactionRoot}/journal.ndjson`, recovery: `${transactionRoot}/recovery` } });
    }
  }
  const lock = await acquireSafeCleanupWriter({ root, root_state: before.root_state, identity: receipt_id,
    posix_boundary: posixBoundary, maintenance, operations });
  if (!lock.lock_verified || lock.errors.length) throw new Error(lock.errors[0]?.code ?? 'WRITER_VERIFICATION_FAILED');
  try {
  for (const action of entries) {
    const source = await checkedPath(root, action.destination, { runtime: action.status === 'quarantined' });
    await checkedPath(root, action.path, { missing: true });
    if (await exists(path.join(root, action.path))) throw new Error('RESTORE_DESTINATION_OCCUPIED');
    if (bytesHash(await readFile(source)) !== action.fingerprint) throw new Error('RECOVERY_FINGERPRINT_CHANGED');
  }
  for (const action of entries) {
    let mutation = null;
    try {
      await checkedPath(root, action.path, { missing: true });
      const source = await checkedPath(root, action.destination, { runtime: action.status === 'quarantined' });
      if (bytesHash(await readFile(source)) !== action.fingerprint) throw new Error('RECOVERY_FINGERPRINT_CHANGED');
      mutation = await performSafeFileOperation({ root, root_state: before.root_state,
        source: action.destination, destination: action.path, fingerprint: action.fingerprint, state: stateOf(await observeStat(source)),
        writer: lock, transaction: operations.find(operation => operation.source === action.destination)?.transaction, maintenance });
      if (mutation.copy_verified) {
        result.restored.push(action.path);
        result.actions.push({ ...action, action: 'restore', status: 'restored',
          restored_destination: action.path, recovery_retained: mutation.source_removed !== true,
          active_copy: { path: action.path, created: true, verified: true, fingerprint: mutation.fingerprint, state: mutation.destination_state },
          ...(mutation.transaction ? { native_transaction: mutation.transaction } : {}) });
        result.metrics.restored_bytes += mutation.destination_state.size;
      }
      if (!mutation.source_removed || !mutation.copy_verified || mutation.errors.length) throw new Error(mutation.errors[0]?.code ?? 'RESTORE_VERIFICATION_FAILED');
    } catch (error) {
      result.errors.push(failure(error.code ?? error.message, action.path));
      if (!result.actions.some((item) => item.id === action.id)) result.actions.push({ ...action, action: 'restore', status: 'failed',
        restored_destination: action.path, recovery_retained: mutation?.source_removed !== true,
        active_copy: mutation ? { path: action.path, created: mutation.copy_created, verified: mutation.copy_verified,
          fingerprint: mutation.fingerprint, state: mutation.destination_state ?? null } : null,
        ...(mutation?.transaction ? { native_transaction: mutation.transaction, contract_breach: mutation.transaction.contract_breach } : {}) });
      if (mutation?.source_removed === null || mutation?.copy_created === null) result.metrics_known = false;
      break;
    }
  }
  for (const action of entries) if (!result.actions.some((item) => item.id === action.id)) result.actions.push({ ...action, action: 'restore', status: 'retained' });
  } finally {
    const release = await releaseSafeCleanupWriter({ root, root_state: before.root_state, writer: lock, maintenance });
    if (!release.released || release.errors.length) {
      result.errors.push(failure('WRITER_LOCK_BOUNDARY_CHANGED', lock.path)); result.status = 'partial';
    }
  }
  try { result.source_after = await capture(); }
  catch (error) { result.errors.push(failure(error.message, null)); result.status = 'partial'; }
  if (result.errors.length) result.status = 'partial';
  else {
    result.verification.result = 'PASSED';
    result.verification.checks.push({ id: 'exact-restore-and-recovery', result: 'PASSED', evidence: result.restored });
    if (verify) {
      try {
        const checked = await verify({ root, receipt: structuredClone(result) });
        if (checked?.result !== 'PASSED' || !Array.isArray(checked.checks) || !checked.checks.length
          || checked.checks.some((check) => check.result !== 'PASSED' || !Array.isArray(check.actual_command)
            || !check.actual_command.length || check.actual_command.some((part) => typeof part !== 'string' || !part.trim()) || !check.evidence)) throw new Error('AFFECTED_VERIFICATION_INCOMPLETE');
        result.verification.affected_checks = 'PASSED'; result.verification.checks.push(...checked.checks);
        if ((await capture()).fingerprint !== result.source_after.fingerprint) throw new Error('VERIFICATION_CHANGED_CLEANUP_STATE');
        result.status = 'verified';
      } catch (error) { result.errors.push(failure(error.message, null)); result.verification.affected_checks = 'FAILED'; result.status = 'partial'; }
    }
  }
  return seal(result);
}
