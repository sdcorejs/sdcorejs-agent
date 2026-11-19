import { lstat, realpath, statfs } from 'node:fs/promises';
import path from 'node:path';
import { scanCleanup, freezeCleanupPlan, applyCleanupPlan } from './cleanup-engine.mjs';
import { approveCleanupPlan, cleanupFingerprint, cleanupPath, validateCleanupPlan } from './cleanup-contract.mjs';
import { runStorageAudit } from './storage-audit.mjs';
import { containsPath, retainedContent, workspaceAgeGroups } from './workspace-inventory.mjs';
import { observeLocalRepository } from './resource-audit.mjs';

const errorCode = error => error.code ?? error.message;
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const samePath = (first, second) => typeof first === 'string' && typeof second === 'string' && path.relative(first, second) === '';
const overlaps = (first, second) => containsPath(first, second) || containsPath(second, first);
const sourceRows = view => [...view.workspaces.filter(row => row.path !== view.root.path), ...view.details];

async function gitRootHold(root) {
  try { await lstat(path.join(root, '.git')); }
  catch (error) { return error.code === 'ENOENT' ? null : 'git-root-state-unknown'; }
  const state = await observeLocalRepository(root, Date.now() + 5000, { ignoreCleanupRuntime: true });
  return state === 'no-local-changes-observed' ? null : state;
}

function activeProducers(evidence) {
  for (const record of Object.values(evidence)) {
    if (record?.active === true) throw new Error('active-producer');
    if (!record || !Object.hasOwn(record, 'producer_pid')) continue;
    if (!Number.isInteger(record.producer_pid) || record.producer_pid <= 0) throw new Error('producer-process-state-unknown');
    try { process.kill(record.producer_pid, 0); }
    catch (error) {
      if (error.code === 'ESRCH') continue;
      throw new Error('producer-process-state-unknown');
    }
    throw new Error('active-producer');
  }
}

async function observedAllocation(root, files) {
  let bytes = 0;
  if (process.platform === 'win32') return null;
  try {
    for (const file of files) {
      const stat = await lstat(path.join(root, file.path), { bigint: true });
      if (!stat.isFile() || stat.nlink !== 1n || stat.ino.toString() !== file.state.ino ||
        stat.dev.toString() !== file.state.dev || stat.ctimeNs.toString() !== file.state.ctime_ns ||
        typeof stat.blocks !== 'bigint') return null;
      bytes += Number(stat.blocks) * 512;
    }
  } catch { return null; }
  return Number.isSafeInteger(bytes) ? bytes : null;
}

const sizeEstimate = value => Number.isSafeInteger(value) && value >= 0 ? value : null;

function disposition(row, root) {
  const state = row.keep_signals.filter(signal => retainedContent.has(signal) ||
    ['partial-scan', 'recent-write', 'redirect-not-followed', 'hardlink-allocation-shared', 'different-filesystem',
      'special-file', 'unreadable-or-changed'].includes(signal));
  for (const project of row.projects) {
    if (!project.git_state) continue;
    // An exact clean repository root can own explicit local artifact cleanup.
    // From a collection root, nested repositories remain separate owners.
    if (!samePath(project.path, root)) state.push('git-boundary');
    if (project.git_state !== 'no-local-changes-observed') state.push(project.git_state);
  }
  return [...new Set(state)];
}

/** Turn an age filter into a review list, then freeze only evidenced exact selections. */
export async function planWorkspaceBatch({ root, inventory, age_group, selections = [], python, task = null, posix_boundary = null } = {}) {
  const view = inventory?.workspace_inventory;
  if (!path.isAbsolute(root ?? '') || inventory?.kind !== 'storage-audit' || !view || !samePath(root, inventory.root) ||
    !samePath(root, view.root.path) || !workspaceAgeGroups.includes(age_group) || !Array.isArray(selections)) throw new Error('INVALID_WORKSPACE_SELECTION');
  if (!samePath(root, await realpath(root))) throw new Error('ROOT_ALIAS');
  const candidates = view.workspaces.filter(row => row.age_group === age_group).map(row => ({
    ...row, status: 'review', proposed_operation: 'delete exact approved reproducible files',
    review_reasons: [...disposition(row, root), 'exact scope and recovery evidence required'],
  }));
  const index = new Map(sourceRows(view).map(row => [path.relative(root, row.path).split(path.sep).join('/'), row]));
  const units = [], held = [], requests = [];
  for (const selection of selections) {
    if (!isObject(selection) || !isObject(selection.evidence) || selection.reference_scope !== undefined && !Array.isArray(selection.reference_scope)) throw new Error('INVALID_WORKSPACE_SELECTION');
    const relative = cleanupPath(selection.path);
    const absolute = path.join(root, relative);
    const row = index.get(relative);
    if (!row || row.age_group !== age_group || !containsPath(root, row.path) || !samePath(row.path, absolute)) throw new Error('SELECTION_OUTSIDE_AGE_FILTER');
    const reference_scope = (selection.reference_scope ?? []).map(cleanupPath);
    if (Object.keys(selection.evidence).some(file => !containsPath(absolute, path.join(root, cleanupPath(file))))) throw new Error('EVIDENCE_OUTSIDE_UNIT');
    requests.push({ selection, absolute, row, relative, reference_scope });
  }
  for (const [index, request] of requests.entries()) {
    if (requests.some((other, at) => at !== index && overlaps(request.absolute, other.absolute)) ||
      request.reference_scope.some(reference => requests.some(other => overlaps(path.join(root, reference), other.absolute)))) {
      throw new Error('OVERLAPPING_BATCH_SCOPES');
    }
  }
  for (const { selection, absolute, row, relative, reference_scope } of requests) {
    const hold = (reasons, extra = {}) => held.push({ path: absolute, status: 'retained', proposed_operation: 'none',
      logical_bytes: row.logical_bytes, reclaimable_bytes: null, contents: row.contents, reasons, ...extra });
    const reasons = disposition(row, root);
    if (reasons.length) { hold(reasons); continue; }
    try {
      if (row.files === 0) throw new Error('no-regular-files');
      if (row.files > 5000 || row.logical_bytes > 32 * 1024 * 1024) throw new Error('scope-exceeds-engine-inventory-limit');
      if (typeof python !== 'string' || !path.isAbsolute(python)) throw new Error('ABSOLUTE_PYTHON_REQUIRED');
      activeProducers(selection.evidence);
      const rootHold = await gitRootHold(root);
      if (rootHold) throw new Error(rootHold);
      const scopedAudit = await runStorageAudit(['--root', absolute, '--python', python, '--as-of', view.as_of,
        '--time-zone', view.time_zone, '--max-seconds', '15'], {
        inspectGit: false, measureAllocation: process.platform === 'win32', classificationRoot: root,
      });
      const fresh = scopedAudit.workspace_inventory.root;
      const freshReasons = disposition(fresh, root);
      if (freshReasons.length) { hold(freshReasons); continue; }
      if (fresh.files !== row.files || fresh.logical_bytes !== row.logical_bytes ||
        fresh.latest_write_observed !== row.latest_write_observed ||
        cleanupFingerprint(fresh.contents) !== cleanupFingerprint(row.contents)) throw new Error('inventory-changed-refresh-report');
      const analysis = await scanCleanup({ root, scope: [relative], reference_scope, task, evidence: selection.evidence });
      const tracked = new Set(analysis.state.git.tracked);
      if (analysis.findings.some(item => tracked.has(item.path))) {
        hold(['tracked-file-retained']);
        continue;
      }
      const logicalBytes = analysis.findings.reduce((total, item) => total + item.bytes, 0);
      const latestWrite = analysis.state.inventory.reduce((latest, item) => Math.max(latest, item.state.mtime), -Infinity);
      if (logicalBytes !== fresh.logical_bytes || Number.isFinite(latestWrite) &&
        Math.abs(latestWrite - Date.parse(fresh.latest_write_observed)) > 1) throw new Error('inventory-changed-refresh-report');
      const unsafe = analysis.findings.filter(item => item.protected || !item.reproducible || item.risk === 'BLOCKED' || item.unknowns.length);
      if (analysis.blocked.length || unsafe.length || analysis.findings.length !== fresh.files) {
        hold(['exact-file-scope-unproven'], { blockers: [...analysis.blocked, ...unsafe.map(item => ({
          path: path.join(root, item.path), reasons: [...item.reasons, ...item.unknowns], classification: item.classification,
        }))] });
        continue;
      }
      const plan = freezeCleanupPlan(analysis, { posix_boundary,
        actions: analysis.findings.map(item => ({ path: item.path, action: 'delete' })) });
      units.push({ path: absolute, operation: 'delete', scope: 'exact regular files; directory entries remain',
        contents: fresh.contents, logical_bytes: logicalBytes,
        estimated_reclaimable_bytes: process.platform === 'win32' ? sizeEstimate(scopedAudit.observed_allocation_bytes) :
          await observedAllocation(root, analysis.state.inventory),
        recovery: [...new Set(analysis.findings.flatMap(finding => finding.evidence))], plan });
    } catch (error) { hold([errorCode(error)]); }
  }
  const payload = { schema_version: 1, kind: 'workspace-delete-batch', root_id: root, age_group,
    as_of: view.as_of, time_zone: view.time_zone, candidates, units, held, mutation_authorized: false,
    native_precondition: process.platform === 'win32' ? 'supported Windows local drive' :
      posix_boundary ? 'current POSIX maintenance required' : 'native apply requires a frozen POSIX maintenance boundary' };
  return { ...payload, batch_id: cleanupFingerprint(payload) };
}

async function volumeFree(root) {
  try {
    const info = await lstat(root, { bigint: true });
    if (!info.isDirectory() || info.isSymbolicLink() || !samePath(root, await realpath(root))) return null;
    const stat = await statfs(root, { bigint: true });
    const free = Number(stat.bavail * stat.bsize), total = Number(stat.blocks * stat.bsize);
    if (Number.isSafeInteger(free) && Number.isSafeInteger(total) && free >= 0 && total >= free) {
      return { free, total, root_identity: `${info.dev}:${info.ino}`, observed_at: new Date().toISOString() };
    }
  } catch { /* Reporting does not establish authority. */ }
  return null;
}

function validateWorkspaceBatch(root, batch, approval) {
  if (batch?.kind !== 'workspace-delete-batch' || batch.schema_version !== 1 || !Array.isArray(batch.units) ||
    !Array.isArray(batch.held) || !path.isAbsolute(root ?? '') || !samePath(root, batch.root_id)) throw new Error('INVALID_WORKSPACE_BATCH');
  const { batch_id, ...payload } = batch;
  if (batch_id !== cleanupFingerprint(payload)) throw new Error('BATCH_IDENTITY_CHANGED');
  if (approval?.source !== 'conversation' || approval.decision !== 'approve' || approval.authority !== 'mutation' ||
    approval.batch_id !== batch_id) throw new Error('BATCH_AUTHORITY_REQUIRED');
  const scopes = [];
  for (const unit of batch.units) {
    validateCleanupPlan(unit.plan);
    const tracked = new Set(unit.plan.state.git.tracked);
    if (!samePath(root, unit.plan.root_id) || unit.operation !== 'delete' || unit.plan.scope.length !== 1 ||
      !samePath(path.join(root, cleanupPath(unit.plan.scope[0])), unit.path) ||
      !unit.plan.actions.length || unit.plan.actions.some(action => action.action !== 'delete' ||
        tracked.has(action.path) || samePath(unit.path, path.join(root, action.path)) || !containsPath(unit.path, path.join(root, action.path))) ||
      scopes.some(scope => overlaps(scope, unit.path))) throw new Error('INVALID_BATCH_UNIT_SCOPE');
    scopes.push(unit.path);
  }
  if (batch.units.some(unit => unit.plan.reference_scope.some(ref => scopes.some(scope => overlaps(scope, path.join(root, cleanupPath(ref))))))) {
    throw new Error('OVERLAPPING_BATCH_SCOPES');
  }
}

/** Project one exact user approval into independent engine plans. */
export async function applyWorkspaceBatch({ root, batch, approval, maintenance = null, verify = null } = {}) {
  validateWorkspaceBatch(root, batch, approval);
  if (!samePath(root, await realpath(root))) throw new Error('ROOT_ALIAS');
  const before = await volumeFree(root);
  const items = structuredClone(batch.held);
  const removed_paths = [];
  let logical_bytes_removed = 0, allocation_bytes_removed = 0, metrics_known = true, sharedBoundaryFailed = false;
  for (const unit of batch.units) {
    const entry = { path: unit.path, operation: unit.operation, directory_removed: false, status: 'retained', files: [], errors: [] };
    items.push(entry);
    const { plan } = unit;
    const observe = () => {
      activeProducers(plan.evidence);
      return { task: plan.task, evidence: plan.evidence };
    };
    let dispatched = false;
    try {
      if (sharedBoundaryFailed) throw new Error('SHARED_MUTATION_BOUNDARY_UNCERTAIN');
      const rootHold = await gitRootHold(root);
      if (rootHold) throw new Error(rootHold);
      const live = await scanCleanup({ root, scope: plan.scope, reference_scope: plan.reference_scope, ...observe() });
      if (live.state.fingerprint !== plan.state.fingerprint) throw new Error('STALE_PLAN');
      dispatched = true;
      const receipt = await applyCleanupPlan({ root, plan, maintenance, observe, verify,
        approval: approveCleanupPlan(plan, { source: approval.source, authority: approval.authority,
          decision: approval.decision, atomic_group: plan.plan_id, action_ids: plan.actions.map(action => action.id) }) });
      entry.receipt = receipt;
      entry.errors = receipt.errors;
      for (const action of plan.actions) {
        const result = receipt.actions.find(item => item.id === action.id);
        const file = { path: path.join(root, action.path), status: result?.status ?? 'retained' };
        entry.files.push(file);
        if (result?.status === 'removed') {
          removed_paths.push(file.path);
          file.logical_bytes_removed = result.bytes;
          logical_bytes_removed += result.bytes;
        }
      }
      const removed = entry.files.filter(file => file.status === 'removed').length;
      entry.status = receipt.status === 'applied' || receipt.status === 'verified' ? 'removed' :
        removed ? 'partial' : receipt.metrics_known === false ? 'unknown' : 'retained';
      allocation_bytes_removed += receipt.metrics.reclaimed_bytes;
      if (receipt.metrics_known === false) metrics_known = false;
      if (receipt.metrics_known === false || receipt.errors.some(error => error.code === 'WRITER_LOCK_BOUNDARY_CHANGED')) sharedBoundaryFailed = true;
    } catch (error) {
      entry.errors = [{ code: errorCode(error) }];
      entry.files = plan.actions.map(action => ({ path: path.join(root, action.path), status: dispatched ? 'unknown' : 'retained' }));
      if (dispatched) { entry.status = 'unknown'; metrics_known = false; sharedBoundaryFailed = true; }
    }
  }
  const after = await volumeFree(root);
  const status = items.length && items.every(item => item.status === 'removed') ? 'applied' :
    removed_paths.length || !metrics_known ? 'partial' : 'blocked';
  return { kind: 'workspace-delete-receipt', batch_id: batch.batch_id, root_id: root, status, items, removed_paths,
    logical_bytes_removed, allocation_bytes_removed: metrics_known ? allocation_bytes_removed : null, metrics_known,
    volumes: { before, after, observed_free_delta: before && after && before.root_identity === after.root_identity ? after.free - before.free : null } };
}
