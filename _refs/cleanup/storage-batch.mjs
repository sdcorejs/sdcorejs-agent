import { lstat, realpath, statfs } from 'node:fs/promises';
import path from 'node:path';
import { scanCleanup, freezeCleanupPlan, applyCleanupPlan } from './cleanup-engine.mjs';
import { approveCleanupPlan, cleanupFingerprint, validateCleanupPlan } from './cleanup-contract.mjs';

const buckets = new Set(['0-10', '11-20', 'over-20', 'unknown']);
const mutating = new Set(['delete', 'quarantine']);
const protectedPath = /(?:^|\/)(?:\.git|\.codex|\.agents|\.aws|node_modules|recovery|quarantine|backups?|evidence|cleanup-runtime|\.sdcorejs\/(?:sessions|specs|architecture|plans|product|design|conventions|approvals))(?:\/|$)/iu;
const protectedScope = value => protectedPath.test(value.split(path.sep).join('/'));
const database = /(?:^|\/)(?:PG_VERSION|pg_control)$|\.(?:db|sqlite3?|mdf|vhdx?)$/iu;

function within(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
}

function samePath(left, right) {
  return path.relative(left, right) === '';
}

async function canonicalDirectory(value) {
  if (typeof value !== 'string' || !path.isAbsolute(value)) throw new Error('ABSOLUTE_DIRECTORY_REQUIRED');
  const resolved = path.resolve(value);
  if (!(await lstat(resolved)).isDirectory() || !samePath(resolved, await realpath(resolved))) {
    throw new Error('UNSAFE_DIRECTORY_BOUNDARY');
  }
  return resolved;
}

function dirty(git) {
  return git.records.length > 0;
}

function reviewRow(row) {
  const { name, path, age_bucket, coverage, contents, logical_bytes, recent_activity, keep_signals } = row;
  return { name, path, age_bucket, coverage, contents, logical_bytes, recent_activity, keep_signals };
}

/** A storage report only narrows review. Each proposed operation still uses the exact-file engine. */
export async function freezeStorageBatch({ report, age_bucket, selections = [] } = {}) {
  if (report?.kind !== 'storage-audit' || report.mutation_authorized !== false
    || !Array.isArray(report.projects) || !Array.isArray(report.records) || !buckets.has(age_bucket)
    || !Array.isArray(selections)) throw new Error('STORAGE_AUDIT_AND_AGE_FILTER_REQUIRED');
  const auditRoot = await canonicalDirectory(report.root);
  const rows = report.projects.filter(row => row.age_bucket === age_bucket);
  const candidates = rows.map(reviewRow);
  const targets = selections.map(selection => {
    const target = selection.path;
    if (typeof target !== 'string' || !path.isAbsolute(target) || !within(auditRoot, target)
      || !rows.some(row => !row.direct_files_only && within(row.path, target))) throw new Error('SELECTION_OUTSIDE_AGE_FILTER');
    if (!mutating.has(selection.action)) throw new Error('EXPLICIT_DELETE_OR_QUARANTINE_REQUIRED');
    return path.resolve(target);
  });
  if (targets.some((target, index) => targets.slice(0, index).some(other => within(other, target) || within(target, other)))) {
    throw new Error('OVERLAPPING_STORAGE_SELECTIONS');
  }
  const items = [];
  for (const [index, selection] of selections.entries()) {
    const target = targets[index];
    const observed = report.records.find(row => samePath(row.path, target));
    const item = { id: `storage-${index + 1}`, path: target, action: selection.action,
      contents: observed?.contents ?? 'unmeasured scope', keep_signals: observed?.keep_signals ?? [],
      logical_bytes: observed?.logical_bytes ?? null, recovery_basis: selection.recovery_basis ?? null,
      estimated_reclaim_bytes: null,
      estimate_basis: null, reasons: [], plan: null };
    items.push(item);
    try {
      if (protectedScope(target)) throw new Error('PROTECTED_STORAGE_PATH');
      if (!observed || observed.coverage !== 'complete') throw new Error('COMPLETE_INVENTORY_REQUIRED');
      if (Object.keys(observed.categories ?? {}).some(kind =>
        ['Git metadata', 'installed dependencies', 'evidence or recovery', 'databases', 'sensitive paths'].includes(kind))) {
        throw new Error('PROTECTED_STORAGE_CONTENT');
      }
      const root = await canonicalDirectory(selection.root ?? auditRoot);
      if (!within(auditRoot, root) || !within(root, target) || samePath(root, target)) {
        throw new Error('SELECT_A_CHILD_SCOPE_WITHIN_THE_ENGINE_ROOT');
      }
      if (!samePath(root, auditRoot)) {
        const marker = await lstat(path.join(root, '.git')).catch(error => {
          if (error.code === 'ENOENT') return null;
          throw error;
        });
        if (!marker || marker.isSymbolicLink() || !(marker.isFile() || marker.isDirectory())) {
          throw new Error('SEPARATE_ENGINE_ROOT_REQUIRES_REPOSITORY');
        }
      }
      await canonicalDirectory(target);
      const scope = path.relative(root, target).split(path.sep).join('/');
      const analysis = await scanCleanup({ root, scope: [scope], reference_scope: selection.reference_scope ?? [],
        evidence: selection.evidence ?? {}, task: selection.task ?? null });
      if (dirty(analysis.state.git)) throw new Error('DIRTY_REPOSITORY');
      if (analysis.blocked.length) throw new Error(analysis.blocked.map(({ code, path }) => `${code}: ${path}`).join('; '));
      if (typeof item.recovery_basis !== 'string' || !item.recovery_basis.trim()) throw new Error('REVIEWED_RECOVERY_BASIS_REQUIRED');
      if (!analysis.findings.length) throw new Error('NO_REGULAR_FILES_IN_SCOPE');
      const holds = analysis.findings.filter(finding => finding.protected || finding.risk === 'BLOCKED'
        || finding.unknowns.length || protectedScope(path.join(root, finding.path)) || database.test(finding.path)
        || (selection.action === 'delete' && !finding.reproducible));
      if (holds.length) {
        item.reasons = holds.map(finding => ({
          path: finding.path, reasons: [...finding.reasons, ...finding.unknowns,
            ...(protectedScope(path.join(root, finding.path)) || database.test(finding.path) ? ['protected storage path'] : []),
            ...(!finding.reproducible && selection.action === 'delete' ? ['reliable regeneration required'] : [])],
        }));
        continue;
      }
      const bytes = analysis.findings.reduce((total, file) => total + file.bytes, 0);
      if (analysis.findings.length !== observed.files || bytes !== observed.logical_bytes) throw new Error('INVENTORY_CHANGED_BEFORE_FREEZE');
      item.plan = freezeCleanupPlan(analysis, {
        actions: analysis.findings.map(finding => ({ path: finding.path, action: selection.action })),
        posix_boundary: selection.posix_boundary ?? null,
      });
      item.estimated_reclaim_bytes = selection.action === 'delete' ? observed.single_link_allocated_bytes : 0;
      item.estimate_basis = selection.action === 'delete' ? 'single-link allocation observed at audit, before native accounting'
        : 'same-volume quarantine';
    } catch (error) {
      item.reasons.push(error.code ?? error.message);
    }
  }
  const payload = { schema_version: 1, kind: 'storage-cleanup-batch', root: auditRoot,
    age_as_of: report.age_as_of, timezone: report.timezone, age_bucket, candidates, items };
  return { ...payload, batch_id: cleanupFingerprint(payload) };
}

function validateBatch(batch) {
  const { batch_id, ...payload } = batch ?? {};
  if (payload.kind !== 'storage-cleanup-batch' || batch_id !== cleanupFingerprint(payload)) {
    throw new Error('BATCH_IDENTITY_CHANGED');
  }
  for (const item of batch.items) if (item.plan) validateCleanupPlan(item.plan);
}

/** Call only in the trusted conversation harness after showing the frozen batch and exact scope. */
export function approveStorageBatch(batch, { source, decision, item_ids = [] } = {}) {
  validateBatch(batch);
  if (source !== 'conversation' || decision !== 'approve' || !Array.isArray(item_ids) || !item_ids.length
    || new Set(item_ids).size !== item_ids.length) throw new Error('BATCH_APPROVAL_REQUIRED');
  const approvals = item_ids.map(id => {
    const item = batch.items.find(row => row.id === id);
    if (!item?.plan) throw new Error('BATCH_APPROVAL_SCOPE_MISMATCH');
    return { id, approval: approveCleanupPlan(item.plan, {
      source, decision, authority: 'mutation', action_ids: item.plan.actions.map(action => action.id),
      atomic_group: item.plan.plan_id,
    }) };
  });
  return { batch_id: batch.batch_id, source, approvals };
}

async function freeSpace(root) {
  try {
    const stat = await statfs(root, { bigint: true });
    return { observed_at: new Date().toISOString(), available_bytes: (stat.bavail * stat.bsize).toString() };
  } catch {
    return null;
  }
}

export async function applyStorageBatch({ batch, approval, maintenance = {}, observe = null } = {}) {
  validateBatch(batch);
  if (approval?.batch_id !== batch.batch_id || approval.source !== 'conversation') throw new Error('BATCH_APPROVAL_REQUIRED');
  const expected = approveStorageBatch(batch, { source: 'conversation', decision: 'approve',
    item_ids: approval.approvals?.map(row => row.id) ?? [] });
  if (cleanupFingerprint(expected) !== cleanupFingerprint(approval)) throw new Error('BATCH_APPROVAL_SCOPE_MISMATCH');
  const auditRoot = await canonicalDirectory(batch.root);
  const volume = { measurement_path: auditRoot, before: await freeSpace(auditRoot), after: null };
  const items = [];
  let logicalBytes = 0;
  let reclaimedBytes = 0;
  let applied = 0;
  let uncertain = false;
  for (const item of batch.items) {
    const authorized = approval.approvals.find(row => row.id === item.id);
    if (!authorized) {
      items.push({ id: item.id, path: item.path, status: 'retained',
        reasons: item.reasons.length ? item.reasons : ['not included in approval'] });
      continue;
    }
    const { plan } = item;
    try {
      const root = await canonicalDirectory(plan.root_id);
      const live = async () => {
        const { task, evidence } = observe ? await observe(item) : plan;
        return { task, evidence };
      };
      const current = await scanCleanup({ root, scope: plan.scope, reference_scope: plan.reference_scope, ...await live() });
      if (current.state.fingerprint !== plan.state.fingerprint) throw new Error('STALE_PLAN');
      const receipt = await applyCleanupPlan({ root, plan, approval: authorized.approval,
        maintenance: maintenance[item.id], observe: live });
      logicalBytes += receipt.actions.filter(action => action.status === 'removed').reduce((sum, action) => sum + action.bytes, 0);
      reclaimedBytes += receipt.metrics.reclaimed_bytes;
      const recoveryCreated = receipt.actions.some(action => action.recovery_copy);
      const itemStatus = receipt.status === 'blocked' && recoveryCreated ? 'partial' : receipt.status;
      if (['applied', 'verified'].includes(itemStatus)) applied++;
      uncertain ||= receipt.metrics_known === false || itemStatus === 'partial';
      items.push({ id: item.id, path: item.path, status: itemStatus,
        reasons: receipt.errors.map(error => error.code), receipt });
    } catch (error) {
      items.push({ id: item.id, path: item.path, status: 'retained', reasons: [error.code ?? error.message] });
    }
  }
  volume.after = await freeSpace(auditRoot);
  volume.available_delta_bytes = volume.before && volume.after
    ? (BigInt(volume.after.available_bytes) - BigInt(volume.before.available_bytes)).toString() : null;
  return { batch_id: batch.batch_id, status: applied === items.length ? 'applied' : applied || uncertain || logicalBytes ? 'partial' : 'blocked',
    items, deleted_logical_bytes: logicalBytes, reclaimed_allocation_bytes_observed: reclaimedBytes,
    allocation_total_complete: !uncertain, volumes: [volume] };
}
