import path from 'node:path';
import { cleanupFingerprint } from './cleanup-contract.mjs';

const SHA = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;
const DIGEST = /^sha256:v1:[a-f0-9]{64}$/u;
const text = value => typeof value === 'string' && value.trim().length > 0;
const empty = value => Array.isArray(value) && value.length === 0;
const absolute = value => text(value) && !/[\0\r\n]/u.test(value) && path.isAbsolute(value) && path.normalize(value) === value;
const within = (parent, child) => {
  const relative = path.relative(parent, child);
  return relative === '' || relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
};
const ref = value => text(value) && value.startsWith('refs/') && !/[\x00-\x20\x7f~^:?*\[\\]/u.test(value)
  && !value.includes('..') && !value.includes('@{')
  && value.split('/').every(part => part && !part.startsWith('.') && !part.endsWith('.') && !part.endsWith('.lock'));

function globalBlockers({ repository: repo, task, merge } = {}) {
  const blockers = [];
  if (!absolute(repo?.root) || !absolute(repo?.common_dir) || !ref(repo?.target_ref) || !SHA.test(repo?.target_sha ?? '')
    || !Array.isArray(repo?.protected_refs) || !repo.protected_refs.length || !repo.protected_refs.every(ref)) blockers.push('repository-identity-or-protection-unknown');
  if (!text(task?.id) || task?.status !== 'completed' || task?.durable_finalized !== true || !SHA.test(task?.source_sha ?? '')) blockers.push('task-not-finalized');
  const bound = merge?.source_sha === task?.source_sha && merge?.target_sha === repo?.target_sha
    && merge?.target_ref === repo?.target_ref && text(merge?.evidence);
  const receipt = merge?.receipt;
  const merged = merge?.kind === 'ancestry' && merge.source_is_ancestor === true
    || merge?.kind === 'provider' && merge.state === 'merged' && SHA.test(merge.merge_sha ?? '')
      && merge.merge_is_ancestor === true && receipt?.source === 'provider' && text(receipt.reference)
      && receipt.repository === repo?.common_dir && receipt.task_id === task?.id
      && receipt.source_sha === task?.source_sha && receipt.target_ref === repo?.target_ref && receipt.merge_sha === merge.merge_sha;
  if (!bound || !merged) blockers.push('exact-task-result-not-proven-merged');
  return blockers;
}

function protectedRef(repo, value) {
  // Protect the target even when it was resolved through a remote-tracking ref.
  const targetLocal = repo?.target_ref?.replace(/^refs\/remotes\/[^/]+\//u, 'refs/heads/');
  return value === repo?.target_ref || value === targetLocal || repo?.protected_refs?.includes(value);
}

function resourceAction(snapshot, resource, index, global) {
  const { repository: repo, task, docker } = snapshot;
  const { kind, identity, ownership, producer, recovery, unknowns } = resource;
  const knownState = resource.state !== null && typeof resource.state === 'object' && !Array.isArray(resource.state);
  const state = knownState ? resource.state : {};
  const blockers = [...global];
  if (!knownState) blockers.push('resource-state-unknown');
  if (ownership?.task_id !== task?.id || ownership?.created_by_task !== true || !text(ownership?.evidence)) blockers.push('task-creation-ownership-unknown');
  if (producer?.state !== 'quiescent' || !text(producer?.evidence)) blockers.push('producer-or-consumer-active-or-unknown');
  if (!['recreate', 'verified-backup'].includes(recovery?.strategy) || !text(recovery?.evidence)) blockers.push('recovery-not-established');
  if (!empty(unknowns)) blockers.push('unresolved-resource-evidence');
  let command = null;
  if (kind === 'worktree') {
    const overlaps = snapshot.resources.some(other => other !== resource && other.kind === 'worktree'
      && absolute(identity) && absolute(other.identity) && (within(identity, other.identity) || within(other.identity, identity)));
    if (!absolute(identity) || identity !== state.physical_path || identity === repo?.root
      || absolute(identity) && absolute(repo?.root) && within(identity, repo.root) || overlaps
      || state.head_sha !== task?.source_sha || !ref(state.branch_ref) || !state.branch_ref.startsWith('refs/heads/') || protectedRef(repo, state.branch_ref)
      || state.boundary_verified !== true
      || ['is_primary', 'is_current', 'locked', 'dirty', 'untracked', 'submodules', 'nested_repositories', 'contains_needed_evidence'].some(key => state[key] !== false)
      || state.inventory?.coverage !== 'complete' || state.inventory?.disposal_reviewed !== true
      || !DIGEST.test(state.inventory?.fingerprint ?? '')) blockers.push('worktree-not-disposable');
    command = ['git', '-C', repo?.root, 'worktree', 'remove', '--', identity];
  } else if (kind === 'branch') {
    if (!ref(identity) || !identity.startsWith('refs/heads/') || protectedRef(repo, identity)
      || state.is_protected !== false || state.sha !== task?.source_sha || state.symbolic_target !== null || !empty(state.checked_out_paths)
      || snapshot.resources.some(other => other.kind === 'worktree' && other.state?.branch_ref === identity)) blockers.push('branch-protected-moved-or-checked-out');
    // Compare-and-delete the exact approved tip, including squash/rebase cases.
    command = ['git', '-C', repo?.root, 'update-ref', '--no-deref', '-d', identity, state.sha];
  } else if (['docker-container', 'docker-image'].includes(kind)) {
    if (!/^[A-Za-z0-9][A-Za-z0-9_.-]*$/u.test(docker?.context ?? '') || !text(docker?.daemon_id)
      || !DIGEST.test(docker?.endpoint_fingerprint ?? '')) blockers.push('docker-endpoint-unknown');
    if (state.labels?.['io.sdcorejs.task-id'] !== task?.id) blockers.push('docker-task-label-missing');
    if (kind === 'docker-container') {
      if (!/^[a-f0-9]{64}$/u.test(identity ?? '') || !['exited', 'created'].includes(state.status)
        || state.mounts_reviewed !== true || state.writable_layer_disposable !== true || !empty(state.consumers)) blockers.push('container-active-shared-or-unique-data');
      command = ['docker', '--context', docker?.context, 'container', 'rm', identity];
    } else {
      if (!/^sha256:[a-f0-9]{64}$/u.test(identity ?? '') || state.shared !== false
        || state.references_reviewed !== true || !empty(state.containers)) blockers.push('image-active-shared-or-unknown');
      command = ['docker', '--context', docker?.context, 'image', 'rm', identity];
    }
  } else blockers.push('unsupported-resource-use-owning-workflow');
  const context = { repository: repo, task, merge: snapshot.merge,
    ...(['docker-container', 'docker-image'].includes(kind) ? { docker } : {}) };
  return { id: `post-merge-${index + 1}`, kind, identity, status: blockers.length ? 'held' : 'ready', blockers,
    command: blockers.length ? null : command,
    state_fingerprint: cleanupFingerprint({ context, resource }) };
}

/** Pure read-only planner. Observations/attestations come from the trusted harness, not repository JSON. */
export function planPostMergeCleanup(snapshot = {}) {
  if (!Array.isArray(snapshot.resources)) throw new Error('POST_MERGE_RESOURCES_REQUIRED');
  const blockers = globalBlockers(snapshot);
  const identities = new Set();
  for (const resource of snapshot.resources) {
    if (!resource || !text(resource.kind) || !text(resource.identity)) throw new Error('POST_MERGE_RESOURCE_IDENTITY_REQUIRED');
    // A resource cannot be repeated under another kind to bypass ownership or accounting.
    if (identities.has(resource.identity)) throw new Error('POST_MERGE_DUPLICATE_RESOURCE');
    identities.add(resource.identity);
  }
  const actions = snapshot.resources.map((resource, index) => resourceAction(snapshot, resource, index, blockers));
  const payload = { schema_version: 1, mode: 'post-merge-cleanup', root_id: snapshot.repository?.root ?? null,
    task_id: snapshot.task?.id ?? null, mutation_authorized: false, blockers,
    status: blockers.length || actions.length && actions.every(a => a.status === 'held') ? 'blocked'
      : actions.some(a => a.status === 'held') ? 'partial' : 'planned', actions };
  return { ...payload, plan_id: cleanupFingerprint(payload) };
}

function validatePlan(plan) {
  if (!plan || plan.mode !== 'post-merge-cleanup' || !Array.isArray(plan.actions)) throw new Error('POST_MERGE_PLAN_CHANGED');
  const { plan_id, ...payload } = plan;
  if (plan_id !== cleanupFingerprint(payload)) throw new Error('POST_MERGE_PLAN_CHANGED');
}

/** Exact approval is supplied from real conversation authority, separately from task-tail LOW policy. */
export function approvePostMergePlan(plan, { source, decision, authority, action_ids } = {}) {
  validatePlan(plan);
  if (source !== 'conversation' || decision !== 'approve' || authority !== 'post-merge-resources'
    || !Array.isArray(action_ids) || !action_ids.length || new Set(action_ids).size !== action_ids.length) throw new Error('POST_MERGE_AUTHORITY_REQUIRED');
  if (action_ids.some(id => !plan.actions.some(a => a.id === id && a.status === 'ready'))) throw new Error('POST_MERGE_APPROVAL_SCOPE');
  return { source, authority, root_id: plan.root_id, task_id: plan.task_id, plan_id: plan.plan_id, action_ids: [...action_ids] };
}

/** Return argv only after current observations match. This function never executes a command. */
export function revalidatePostMergeAction({ plan, action_id, approval, current } = {}) {
  validatePlan(plan);
  if (approval?.source !== 'conversation' || approval.authority !== 'post-merge-resources'
    || approval.plan_id !== plan.plan_id || approval.root_id !== plan.root_id || approval.task_id !== plan.task_id
    || !approval.action_ids?.includes(action_id)) throw new Error('POST_MERGE_AUTHORITY_REQUIRED');
  const action = plan.actions.find(a => a.id === action_id);
  const fresh = planPostMergeCleanup(current).actions.find(a => a.kind === action?.kind && a.identity === action?.identity);
  if (!action || action.status !== 'ready' || fresh?.status !== 'ready'
    || fresh.state_fingerprint !== action.state_fingerprint || cleanupFingerprint(fresh.command) !== cleanupFingerprint(action.command)) throw new Error('POST_MERGE_STATE_CHANGED');
  return [...action.command];
}
