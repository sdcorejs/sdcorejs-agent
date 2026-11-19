import { cleanupFingerprint } from './cleanup-contract.mjs';
import { coordinateCleanupOffer } from './offer-policy.mjs';
import { planPostMergeCleanup, revalidatePostMergeAction } from './post-merge.mjs';

const text = value => typeof value === 'string' && value.trim().length > 0;
const sha = value => /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u.test(value ?? '');
const owners = new Set(['sequential-owner', 'integration-owner', 'fan-in-owner']);
const events = new Set(['task-finished', 'merge-observed', 'project-adoption', 'session-resume']);

/** Derive completion from current trusted workflow evidence, never a final-message string. */
export function evaluateTaskCompletion(evidence = {}) {
  if (evidence === null || typeof evidence !== 'object' || Array.isArray(evidence)) evidence = {};
  const blockers = [];
  if (!text(evidence.task_id) || !text(evidence.repository_id) || !sha(evidence.source_sha)) blockers.push('task-identity-unknown');
  if (evidence.disposition !== 'completed') blockers.push('task-not-completed');
  for (const key of ['verification', 'review', 'durable']) {
    const entry = evidence[key];
    if (entry?.source_sha !== evidence.source_sha || entry?.task_id !== evidence.task_id ||
      entry?.repository_id !== evidence.repository_id || !text(entry?.evidence) ||
      (key === 'durable' ? entry.finalized !== true : entry.result !== 'PASSED')) blockers.push(`${key}-missing-or-stale`);
  }
  if (!Array.isArray(evidence.unresolved) || evidence.unresolved.length) blockers.push('unresolved-work');
  return { status: blockers.length ? 'incomplete' : 'completed', task_id: evidence.task_id ?? null,
    source_sha: evidence.source_sha ?? null, blockers };
}

/** One runtime owner coordinates lifecycle and legacy proposals; no native effects or durable queue. */
export function coordinateResourceCleanup({ event, completion, snapshot, audit, approval, state,
  worker_role: workerRole = 'sequential-owner', capabilities = {}, failed_surfaces: failedSurfaces = [] } = {}) {
  const taskCompletion = completion == null && ['project-adoption', 'session-resume'].includes(event)
    ? { status: 'not-applicable', task_id: null, source_sha: null, blockers: [] } : evaluateTaskCompletion(completion);
  const snapshotMismatch = snapshot && (taskCompletion.task_id !== snapshot.task?.id ||
    taskCompletion.source_sha !== snapshot.task?.source_sha || completion?.repository_id !== snapshot.repository?.common_dir);
  const auditMismatch = audit && completion != null && completion.repository_id !== audit.repository?.common_dir;
  if (snapshotMismatch || auditMismatch) {
    taskCompletion.status = 'incomplete'; taskCompletion.blockers.push('task-result-binding-mismatch');
  }
  const base = { event, completion: taskCompletion, plan: null, resource_report: null, authorized_action_ids: [], mutation_authorized: false };
  const result = (status, reason, extra = {}) => ({ ...base, status, reason, state, ...extra });
  if (!owners.has(workerRole)) return result('findings-only', 'Workers report observations; only the owner offers or retires resources.');
  if (['commit-created', 'push-completed', 'pr-created'].includes(event)) return result('pending-merge', 'Git artifact creation does not prove merge.');
  if (!events.has(event)) return result('deferred', 'Wait for a declared safe lifecycle boundary.');
  let observations, repository, category, observationId;
  if (audit) {
    if (audit.kind !== 'resource-audit' || audit.schema_version !== 1 || audit.mutation_authorized !== false ||
      !text(audit.repository?.root) || !text(audit.repository?.common_dir) || !text(audit.observation_id) || !Array.isArray(audit.findings)) {
      return result('incomplete', 'A current read-only resource observation is required.');
    }
    observations = audit.findings.filter(finding => finding?.status === 'review');
    base.resource_report = structuredClone(audit);
    repository = audit.repository.common_dir; category = 'legacy-resources'; observationId = audit.observation_id;
  } else if (event === 'project-adoption' || event === 'session-resume' && !completion) {
    return result('observation-needed', 'Collect bounded repository/worktree metadata before proposing a detailed legacy audit.');
  } else {
    const finished = taskCompletion;
    if (finished.status !== 'completed' || finished.task_id !== snapshot?.task?.id || finished.source_sha !== snapshot?.task?.source_sha ||
      completion.repository_id !== snapshot?.repository?.common_dir) {
      return result('incomplete', 'Completion evidence must match this exact task result.', { completion: finished });
    }
    try { base.plan = planPostMergeCleanup(snapshot); }
    catch { return result('incomplete', 'Trusted current task-resource observations are incomplete.'); }
    if (base.plan.blockers.length) return result('pending-merge', 'Exact finalized task result is not proven merged.');
    observations = base.plan.actions.filter(action => action.status === 'ready');
    if (approval) {
      for (const action of observations) {
        try {
          revalidatePostMergeAction({ plan: base.plan, action_id: action.id, approval, current: snapshot });
          base.authorized_action_ids.push(action.id);
        } catch { /* An uncovered or stale grant never widens scope. */ }
      }
      observations = observations.filter(action => !base.authorized_action_ids.includes(action.id));
      if (!observations.length && base.authorized_action_ids.length) return result('authorized', 'Reuse the exact grant; reobserve immediately before each native operation.');
    }
    repository = snapshot.repository.common_dir; category = 'post-merge-resources'; observationId = base.plan.plan_id;
  }
  const resourceSignals = observations.map(({ kind, identity }) => ({ source: 'sdcorejs-cleanup', significant: true,
    category, scope: { repository_id: repository, resources: [{ kind, identity }] },
    observed_state: { fingerprint: observationId }, unknowns: category === 'legacy-resources' ? ['original-ownership-and-current-use-require-review'] : [],
    evidence: [{ kind: 'resource-observation', confirmed: true, detail: 'Current bounded resource metadata warrants analysis; no disposal authority is inferred.' }],
    reason_to_offer: category === 'legacy-resources' ? 'Review associated legacy resources and measured storage.' : 'Finalized and merged task has eligible local resources.' }));
  const offer = coordinateCleanupOffer({ resource_signals: resourceSignals, state, boundary: { phase: 'after-primary-result' },
    worker_role: workerRole, capabilities, failed_surfaces: failedSurfaces });
  return { ...base, ...offer, ...(offer.offer && base.resource_report
    ? { offer: { ...offer.offer, resource_report: base.resource_report } } : {}) };
}
