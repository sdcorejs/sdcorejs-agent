import { createHash } from 'node:crypto';
import { normalizeRepositoryPath } from '../shared/documentation-layout.mjs';

export const CLEANUP_SCHEMA_VERSION = 1;
export const CLEANUP_ACTIONS = Object.freeze(['keep', 'review', 'quarantine', 'archive', 'delete']);
export const CLEANUP_RUNTIME_ROOT = '.sdcorejs/tmp/cleanup-runtime';
export const CLEANUP_RISKS = Object.freeze(['LOW', 'MEDIUM', 'HIGH', 'BLOCKED']);
export const CLEANUP_POSIX_FENCE = `${CLEANUP_RUNTIME_ROOT}/posix-maintenance.lock`;

function plainData(value) {
  if (value === null || typeof value !== 'object') return ['string', 'boolean', 'number'].includes(typeof value) || value === null;
  if (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return false;
  return Reflect.ownKeys(value).every(key => typeof key === 'string' && Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value')
    && plainData(Object.getOwnPropertyDescriptor(value, key).value));
}

/** Admission is a current scoped operating contract supplied by the trusted harness. */
export function validateCleanupMaintenance(expected, current = expected) {
  for (const value of [expected, current]) {
    if (!plainData(value) || !value || value.source !== 'conversation' || value.fence_path !== CLEANUP_POSIX_FENCE
      || ['root_id', 'task_id', 'generation', 'owner', 'attestation'].some(key => typeof value[key] !== 'string' || !value[key].trim())
      || !Array.isArray(value.participants) || !value.participants.length) throw new Error('MAINTENANCE_EVIDENCE_REQUIRED');
    const ids = new Set();
    for (const participant of value.participants) {
      if (!participant || typeof participant.id !== 'string' || !participant.id.trim() || ids.has(participant.id)
        || participant.state !== 'quiescent' || typeof participant.evidence !== 'string' || !participant.evidence.trim()
        || participant.writable_descriptors_closed !== true || participant.children_quiescent !== true) throw new Error('MAINTENANCE_WRITER_NOT_QUIESCENT');
      ids.add(participant.id);
    }
  }
  if (cleanupFingerprint(expected) !== cleanupFingerprint(current)) throw new Error('MAINTENANCE_CHANGED');
  return true;
}

/** Availability and native behavior still require actual target capability/acceptance evidence. */
export function validateCleanupPosixBoundary(value, root) {
  if (!plainData(value) || value?.version !== 'posix-maintenance-v1' || value.root_id !== root
    || typeof root !== 'string' || !root.startsWith('/') || root.includes('\0')
    || typeof value.python?.executable !== 'string' || !value.python.executable.startsWith('/') || value.python.executable.includes('\0')
    || !/^3\.(?:11|12|13|14)\.\d+$/u.test(value.python.version ?? '')
    || !/^[a-f0-9]{64}$/u.test(value.python.sha256 ?? '') || !/^[a-f0-9]{64}$/u.test(value.helper_sha256 ?? '')
    || !['x64', 'arm64'].includes(value.profile?.architecture) || typeof value.profile?.os_release !== 'string' || !value.profile.os_release.trim()
    || !(value.profile?.platform === 'linux' && value.profile.filesystem === 'ext4' && value.profile.primitive === 'renameat2'
      || value.profile?.platform === 'darwin' && value.profile.filesystem === 'apfs' && value.profile.primitive === 'renameatx_np')) throw new Error('INVALID_POSIX_BOUNDARY');
  validateCleanupMaintenance(value.maintenance);
  if (value.maintenance.root_id !== root) throw new Error('MAINTENANCE_ROOT_CHANGED');
  return true;
}

/** Consumer evidence is explicit JSON data; only own literal-true flags establish completeness. */
export function hasCompleteCleanupConsumerCoverage(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  return ['complete', 'dynamic', 'globs', 'exports', 'external'].every((flag) =>
    Object.getOwnPropertyDescriptor(value, flag)?.value === true);
}

/** Stable identity for exact plans, state snapshots and runtime approvals. */
export function cleanupFingerprint(value) {
  const stable = (item) => Array.isArray(item) ? item.map(stable)
    : item && typeof item === 'object' ? Object.fromEntries(Object.keys(item).sort().map((key) => [key, stable(item[key])])) : item;
  return `sha256:v1:${createHash('sha256').update(JSON.stringify(stable(value))).digest('hex')}`;
}

/** Paths are exact repository-relative identities; discovery globs cannot authorize writes. */
export function cleanupPath(value) {
  if (typeof value !== 'string' || !value || value.includes('\\') || /[\0:*?<>|]/u.test(value)
    || value.split('/').some((part) => !part || part === '.' || part === '..' || /[. ]$/u.test(part)
      || /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/iu.test(part))) throw new Error('UNSAFE_PATH');
  const normalized = normalizeRepositoryPath(value);
  if (!normalized.ok || normalized.path !== value) throw new Error('UNSAFE_PATH');
  return value;
}

export function isCleanupRuntimePath(value) {
  const normalized = value.toLowerCase();
  return normalized === CLEANUP_RUNTIME_ROOT || normalized.startsWith(`${CLEANUP_RUNTIME_ROOT}/`);
}

/** Approval must be supplied by the trusted conversation harness, never inferred from discovery. */
export function approveCleanupPlan(plan, { source, decision, authority, action_ids = [], atomic_group = null } = {}) {
  if (source !== 'conversation' || decision !== 'approve' || authority !== 'mutation'
    || !Array.isArray(action_ids) || new Set(action_ids).size !== action_ids.length) throw new Error('MUTATION_AUTHORITY_REQUIRED');
  const ids = plan.actions.filter((action) => !['keep', 'review'].includes(action.action)).map((action) => action.id);
  if (action_ids.some((id) => !ids.includes(id))) throw new Error('APPROVAL_SCOPE_MISMATCH');
  return { schema_version: 1, plan_id: plan.plan_id, root_id: plan.root_id,
    authority: 'mutation', source, action_ids: [...action_ids].sort(), atomic_group,
    actions_fingerprint: cleanupFingerprint(plan.actions), state_fingerprint: plan.state.fingerprint,
    ...(plan.posix_boundary ? { posix_boundary_fingerprint: cleanupFingerprint(plan.posix_boundary) } : {}) };
}

/** Standing authority is narrowly bound to one task and exact reproducible paths. */
export function approveCleanupPolicy({ root_id, task_id, paths, actions = ['delete'], source, decision, posix_boundary = null } = {}) {
  if (source !== 'conversation' || decision !== 'approve' || !root_id || !task_id || !Array.isArray(paths)
    || paths.length === 0 || !actions.length || actions.some((action) => !['delete', 'quarantine'].includes(action))) throw new Error('TASK_POLICY_AUTHORITY_REQUIRED');
  if (posix_boundary) validateCleanupPosixBoundary(posix_boundary, root_id);
  const policy = { schema_version: 1, root_id, task_id, paths: [...new Set(paths.map(cleanupPath))].sort(), actions: [...new Set(actions)].sort(), source, authority: 'task-tail-low',
    ...(posix_boundary ? { posix_boundary_fingerprint: cleanupFingerprint(posix_boundary) } : {}) };
  return { ...policy, policy_id: cleanupFingerprint(policy) };
}

export function validateCleanupPlan(plan) {
  if (plan?.schema_version !== 1 || !plan.root_id || !Array.isArray(plan.actions) || !plan.state?.fingerprint) throw new Error('INVALID_PLAN');
  const { plan_id, ...payload } = plan;
  if (plan_id !== cleanupFingerprint(payload)) throw new Error('PLAN_IDENTITY_CHANGED');
  if (plan.posix_boundary) {
    validateCleanupPosixBoundary(plan.posix_boundary, plan.root_id);
    if (plan.posix_boundary.maintenance.task_id !== plan.task?.id) throw new Error('MAINTENANCE_TASK_CHANGED');
  }
  const ids = new Set(), paths = new Set();
  for (const action of plan.actions) {
    cleanupPath(action.path);
    if (action.destination) cleanupPath(action.destination);
    if (!CLEANUP_ACTIONS.includes(action.action) || typeof action.id !== 'string' || !action.id.trim() || ids.has(action.id) || paths.has(action.path)) throw new Error('INVALID_ACTION');
    if (action.action === 'archive' ? !action.destination : action.destination != null) throw new Error('INVALID_DESTINATION');
    if (!CLEANUP_RISKS.includes(action.risk)) throw new Error('INVALID_ACTION');
    if (plan.posix_boundary && !['keep', 'review'].includes(action.action)) {
      const transaction = action.posix_transaction;
      if (!transaction || !new RegExp(`^${CLEANUP_RUNTIME_ROOT.replaceAll('.', '\\.')}\/transactions\/[a-f0-9]{64}\/cleanup-[1-9][0-9]*\/captured$`, 'u').test(transaction.capture ?? '')
        || transaction.journal !== transaction.capture.slice(0, -'captured'.length) + 'journal.ndjson'
        || transaction.recovery !== transaction.capture.slice(0, -'captured'.length) + 'recovery') throw new Error('INVALID_POSIX_TRANSACTION');
      for (const key of ['capture', 'journal', 'recovery']) cleanupPath(transaction[key]);
    }
    if (!['keep', 'review'].includes(action.action) && (!/^sha256:[a-f0-9]{64}$/u.test(action.fingerprint ?? '')
      || !/^sha256:v1:[a-f0-9]{64}$/u.test(action.state_fingerprint ?? '') || typeof action.owner !== 'string' || !action.owner.trim()
      || typeof action.restore_strategy !== 'string' || !action.restore_strategy.trim()
      || !Array.isArray(action.verification) || !action.verification.length
      || !Array.isArray(action.reasons) || !Array.isArray(action.evidence) || !Array.isArray(action.unknowns))) throw new Error('INVALID_FROZEN_ACTION');
    ids.add(action.id); paths.add(action.path);
  }
  return true;
}

export function cleanupActionAuthorized({ plan, action, approval, policy }) {
  if (!action || !CLEANUP_ACTIONS.includes(action.action) || !CLEANUP_RISKS.includes(action.risk)) return false;
  if (!Array.isArray(plan?.actions) || !plan.actions.some((frozen) => cleanupFingerprint(frozen) === cleanupFingerprint(action))) return false;
  if (['keep', 'review'].includes(action.action)) return true;
  if (action.risk === 'BLOCKED' || action.protected || action.unknowns.length) return false;
  if (approval?.authority === 'mutation' && approval.source === 'conversation' && approval.plan_id === plan.plan_id
    && approval.root_id === plan.root_id && approval.state_fingerprint === plan.state.fingerprint
    && approval.actions_fingerprint === cleanupFingerprint(plan.actions) && approval.action_ids?.includes(action.id)
    && (!plan.posix_boundary || approval.posix_boundary_fingerprint === cleanupFingerprint(plan.posix_boundary))) {
    return action.risk !== 'HIGH' || approval.action_ids.length === 1 || approval.atomic_group === plan.plan_id;
  }
  if (!policy || action.risk !== 'LOW' || plan.task?.status !== 'completed' || !plan.task?.durable_finalized) return false;
  if (plan.posix_boundary && policy.posix_boundary_fingerprint !== cleanupFingerprint(plan.posix_boundary)) return false;
  const { policy_id, ...payload } = policy;
  return policy_id === cleanupFingerprint(payload) && policy.authority === 'task-tail-low' && policy.source === 'conversation'
    && policy.root_id === plan.root_id && policy.task_id === plan.task.id && policy.paths.includes(action.path)
    && policy.actions.includes(action.action) && action.task_owned && action.reproducible && action.producer_finished && !action.needed_for_evidence;
}

export function approveCleanupRestore(receipt, { source, decision, authority, posix_boundary = receipt?.posix_boundary ?? null } = {}) {
  if (source !== 'conversation' || decision !== 'approve' || authority !== 'restore') throw new Error('RESTORE_AUTHORITY_REQUIRED');
  if (posix_boundary) validateCleanupPosixBoundary(posix_boundary, receipt.root_id);
  return { authority, source, receipt_id: receipt.receipt_id, root_id: receipt.root_id,
    ...(posix_boundary ? { posix_boundary: structuredClone(posix_boundary), posix_boundary_fingerprint: cleanupFingerprint(posix_boundary) } : {}) };
}
