import { createHash } from 'node:crypto';
import { normalizeRepositoryPath } from '../shared/documentation-layout.mjs';
import { normalizeChoiceResponse, selectInteraction } from '../harness/runtime-policy.mjs';
import { cleanupFingerprint } from './cleanup-contract.mjs';
import { classifyArtifact } from '../shared/artifact-lifecycle.mjs';

const SOURCES = new Set([
  'sdcorejs-explore', 'sdcorejs-test', 'sdcorejs-review',
  'sdcorejs-design', 'sdcorejs-documentation',
]);
const OWNERS = new Set(['sequential-owner', 'integration-owner', 'fan-in-owner']);
const POSITIVE_EVIDENCE = new Set([
  'producer-finished', 'reproducible-output', 'content-match',
  'superseded-by', 'artifact-relationship', 'reference-coverage', 'disk-pressure',
]);
const HASH = /^sha256(?::v1)?:[a-f0-9]{64}$/u;
const REVISION = /^[a-f0-9]{40}$/u;
const TEXT = (value) => typeof value === 'string' && value.trim().length > 0;
const OBJECT = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const unique = (values) => [...new Set(values)].sort();
const identity = (value) => `sha256:v1:${createHash('sha256').update(JSON.stringify(value)).digest('hex')}`;

function paths(values) {
  if (!Array.isArray(values) || values.length === 0) return null;
  const normalized = values.map((value) => normalizeRepositoryPath(value));
  return normalized.every(({ ok }) => ok)
    ? unique(normalized.map(({ path }) => path)) : null;
}

/** A signal is evidence to offer analysis, never deletion authority. */
export function normalizeCleanupSignal(signal) {
  if (!OBJECT(signal) || !SOURCES.has(signal.source) || signal.significant !== true) return null;
  const scopePaths = paths(signal.scope?.paths);
  if (!TEXT(signal.scope?.repository_id) || !scopePaths || !TEXT(signal.category) ||
      !TEXT(signal.reason_to_offer) || !OBJECT(signal.observed_state) ||
      !TEXT(signal.observed_state.fingerprint) || !Array.isArray(signal.unknowns) ||
      signal.unknowns.some((unknown) => !TEXT(unknown)) || !Array.isArray(signal.evidence)) return null;
  const evidence = signal.evidence.filter((entry) => OBJECT(entry) &&
    POSITIVE_EVIDENCE.has(entry.kind) && entry.confirmed === true && TEXT(entry.detail) &&
    paths(entry.paths)?.every((evidencePath) => scopePaths.some((scopePath) =>
      evidencePath === scopePath || evidencePath.startsWith(`${scopePath}/`))));
  if (evidence.length === 0) return null;
  const normalized = {
    source: signal.source,
    scope: { repository_id: signal.scope.repository_id, paths: scopePaths },
    category: signal.category,
    evidence: evidence.map((entry) => ({ ...structuredClone(entry), paths: paths(entry.paths) })),
    observed_state: structuredClone(signal.observed_state),
    unknowns: unique(signal.unknowns),
    reason_to_offer: signal.reason_to_offer,
    significant: true,
  };
  // Source and changing observation are deliberately excluded: a declined
  // finding remains declined across workers and workflows in this session.
  normalized.finding_id = identity([normalized.scope.repository_id, scopePaths, normalized.category]);
  return normalized;
}

/** Runtime handoff only. Never persist this object as project/session state. */
export function createCleanupOfferState({ scope_id: scopeId } = {}) {
  if (!TEXT(scopeId)) throw new TypeError('cleanup offer state requires a runtime scope_id');
  return { schema_version: 1, scope_id: scopeId, disabled: false, resolved_ids: [], pending: null };
}

function stateCopy(state) {
  if (!OBJECT(state) || state.schema_version !== 1 || !TEXT(state.scope_id) ||
      typeof state.disabled !== 'boolean' || !Array.isArray(state.resolved_ids) ||
      state.resolved_ids.some((id) => !HASH.test(id)) ||
      (state.pending !== null && (!OBJECT(state.pending) || !HASH.test(state.pending.offer_id) ||
        !Array.isArray(state.pending.finding_ids) || state.pending.finding_ids.some((id) => !HASH.test(id)) ||
        !TEXT(state.pending.scope?.repository_id) || !paths(state.pending.scope?.paths) ||
        !Array.isArray(state.pending.options) || state.pending.options.length !== 3))) {
    throw new TypeError('invalid cleanup runtime handoff; do not silently reset suppression');
  }
  return structuredClone(state);
}

function safeBoundary(boundary, signals) {
  if (boundary?.phase === 'after-primary-result') return true;
  if (boundary?.phase === 'before-final-readiness' && boundary.task_related === true) return true;
  return boundary?.phase === 'debug-root-cause' && boundary.disk_pressure_blocker === true &&
    signals.some((signal) => signal.evidence.some((entry) => entry.kind === 'disk-pressure' &&
      Number.isFinite(entry.bytes_available) && Number.isFinite(entry.bytes_required) &&
      entry.bytes_available >= 0 && entry.bytes_required > entry.bytes_available));
}

/** Deduplicate worker findings at fan-in and present at most one unresolved offer. */
export function coordinateCleanupOffer({
  signals = [], state, boundary = {}, worker_role: workerRole = 'sequential-owner',
  capabilities = {}, failed_surfaces: failedSurfaces = [],
} = {}) {
  const next = stateCopy(state);
  const observations = signals.map(normalizeCleanupSignal).filter(Boolean);
  const result = (status, reason, offer = null) => ({ status, reason, state: next, offer });
  if (!OWNERS.has(workerRole)) return result('findings-only', 'only the sequential or fan-in owner presents offers');
  if (next.disabled) return result('suppressed', 'cleanup offers disabled for this runtime scope');
  if (next.pending) return result('pending', 'one cleanup offer is already unresolved');
  if (!safeBoundary(boundary, observations)) return result('deferred', 'wait for the primary result or a concrete disk-pressure blocker');
  const eligible = observations.filter(({ finding_id: id }) => !next.resolved_ids.includes(id));
  if (eligible.length === 0) return result('suppressed', 'no new significant positive evidence');
  const repository = unique(eligible.map(({ scope }) => scope.repository_id))[0];
  const group = eligible.filter(({ scope }) => scope.repository_id === repository);
  const findingIds = unique(group.map(({ finding_id: id }) => id));
  const scopePaths = unique(group.flatMap(({ scope }) => scope.paths));
  const options = [
    `Analyze ${scopePaths.join(', ')} read-only (Recommended)`,
    'Skip this cleanup offer',
    'Disable cleanup offers for this session',
  ];
  const pending = {
    offer_id: identity([next.scope_id, repository, findingIds]),
    finding_ids: findingIds,
    scope: { repository_id: repository, paths: scopePaths },
    options,
  };
  next.pending = pending;
  const offer = {
    ...structuredClone(pending),
    source_skills: unique(group.map(({ source }) => source)),
    findings: [...new Map(group.map((signal) => [signal.finding_id, signal])).values()],
    analysis_only: true,
    mutation_allowed: false,
    interaction: selectInteraction({ capabilities, options, approval: false, failed_surfaces: failedSurfaces }),
  };
  return result('offered', 'significant scoped evidence warrants bounded analysis', offer);
}

/** Conversation choices accept analysis only; they cannot approve a frozen mutation plan. */
export function resolveCleanupOffer({ state, offer_id: offerId, response } = {}) {
  const next = stateCopy(state);
  if (!next.pending || next.pending.offer_id !== offerId) {
    return { status: 'stale', state: next, analysis_authority: null, mutation_allowed: false };
  }
  const choice = normalizeChoiceResponse(response, next.pending.options);
  if (choice.status !== 'selected') {
    return { status: 'ambiguous', state: next, analysis_authority: null, mutation_allowed: false };
  }
  const selection = next.pending.options.indexOf(choice.selected);
  const scope = structuredClone(next.pending.scope);
  next.resolved_ids = unique([...next.resolved_ids, ...next.pending.finding_ids]);
  next.pending = null;
  if (selection === 2) next.disabled = true;
  return {
    status: selection === 0 ? 'accepted' : selection === 1 ? 'declined' : 'disabled',
    state: next,
    analysis_authority: selection === 0 ? {
      action: 'analyze', read_only: true, mutation_allowed: false, scope,
      approval_source: 'explicit-cleanup-analysis-choice', offer_id: offerId,
    } : null,
    mutation_allowed: false,
  };
}

/** Select only already-known current-task artifacts; never initiate a repo scan. */
export function selectTaskTailCleanup({ task, artifact_context: context, evidence = {}, policy } = {}) {
  const skip = (reason) => ({ status: 'preserve', reason, scope: [], analysis_required: false });
  if (task?.status !== 'completed' || task.durable_finalized !== true) {
    return skip('unfinished, failed, cancelled, or interrupted work retains diagnostic and recovery evidence');
  }
  if (!TEXT(task.id) || !TEXT(task.change_ref) || context?.change_ref !== task.change_ref ||
      !Array.isArray(context.local_only) || !OBJECT(evidence) || !OBJECT(policy) ||
      policy.authority !== 'task-tail-low' || policy.source !== 'conversation' ||
      policy.task_id !== task.id || !paths(policy.paths)) return skip('current-task ownership or approved LOW policy is missing');
  const { policy_id: policyId, ...payload } = policy;
  if (policyId !== cleanupFingerprint(payload)) return skip('task-tail policy identity is stale');
  const durablePaths = new Set(['required_with_change', 'shared_owned', 'conditional']
    .flatMap((bucket) => Array.isArray(context[bucket]) ? context[bucket].map((entry) => entry?.path) : []));
  const scope = unique(context.local_only.map((entry) => entry?.path).filter((file) => {
    if (!paths([file]) || !policy.paths.includes(file) || durablePaths.has(file)) return false;
    const info = evidence[file];
    return classifyArtifact({ path: file }).bucket === 'local_only' &&
      info?.task_id === task.id && TEXT(info.owner) && info.reproducible === true &&
      info.producer_status === 'finished' && info.needed_for_evidence === false && !info.active &&
      !info.approved && !info.immutable && !info.historical && !info.intentional;
  }));
  if (scope.length === 0) return skip('no qualifying policy-approved current-task artifacts');
  return { status: 'analyze', reason: 'bounded current-task artifacts may qualify after engine revalidation',
    scope, analysis_required: true };
}

/** Read-only readiness policy over engine receipts and current mapped evidence. */
export function evaluateCleanupLifecycle({ receipts = [], current_snapshot: currentSnapshot,
  evidence_refs: evidenceRefs = [], evidence = [], current_source: currentSource,
  branch_ready: branchReady } = {}) {
  const blockers = [];
  const add = (code, message) => blockers.push({ code, message });
  if (!Array.isArray(receipts) || !Array.isArray(evidenceRefs) || !Array.isArray(evidence)) {
    return { valid: false, applicable: true, status: 'BLOCKED', receipt_ids: [], blockers: [{ code: 'CLEANUP_INPUT_INVALID', message: 'receipts and mapped evidence must be arrays' }] };
  }
  if (receipts.length === 0) return { valid: true, applicable: false, status: 'NOT_APPLICABLE', receipt_ids: [], blockers: [] };
  const ids = receipts.map((receipt) => receipt?.receipt_id);
  if (ids.some((id) => typeof id !== 'string' || !HASH.test(id)) || unique(ids).length !== ids.length) add('CLEANUP_INPUT_INVALID', 'cleanup receipt identities must be unique content hashes');
  const changedPaths = [];
  const verificationCommands = [];
  for (const [index, receipt] of receipts.entries()) {
    if (receipt?.schema_version !== 1 || !HASH.test(receipt.plan_id ?? '') ||
        !TEXT(receipt.root_id) || !(receipt.task_id === null || TEXT(receipt.task_id)) ||
        !Array.isArray(receipt.actions) || !Array.isArray(receipt.errors)) {
      add('CLEANUP_INPUT_INVALID', `cleanup receipt ${index} is incomplete`);
      continue;
    }
    const { receipt_id: receiptId, ...payload } = receipt;
    if (receiptId !== cleanupFingerprint(payload)) {
      add('CLEANUP_INPUT_INVALID', `cleanup receipt ${index} content does not match its identity`);
    }
    const restoring = receipt.operation === 'restore';
    if ((receipt.operation !== undefined && !['apply', 'restore'].includes(receipt.operation)) ||
        (restoring && (!HASH.test(receipt.restore_of_receipt_id ?? '') || receipt.restore_of_receipt_id === receiptId)) ||
        (!restoring && receipt.restore_of_receipt_id !== undefined)) {
      add('CLEANUP_INPUT_INVALID', `cleanup receipt ${index} operation or restore relationship is invalid`);
    }
    const statusActions = restoring ? { restored: 'restore' }
      : { removed: 'delete', quarantined: 'quarantine', archived: 'archive' };
    const successful = receipt.actions.filter((action) => Object.hasOwn(statusActions, action?.status));
    const sums = {
      removed_active_bytes: successful.filter(({ status }) => status !== 'restored').reduce((total, action) => total + (action.bytes ?? 0), 0),
      quarantine_bytes: successful.filter(({ status }) => status === 'quarantined').reduce((total, action) => total + (action.bytes ?? 0), 0),
      reclaimed_bytes: successful.filter(({ status }) => status === 'removed').reduce((total, action) => total + (action.reclaimed_bytes ?? 0), 0),
      archived_bytes: successful.filter(({ status }) => status === 'archived').reduce((total, action) => total + (action.bytes ?? 0), 0),
      ...(restoring ? { restored_bytes: successful.reduce((total, action) => total + (action.bytes ?? 0), 0) } : {}),
    };
    if (!OBJECT(receipt.metrics) || Object.entries(sums).some(([key, expected]) =>
      !Number.isSafeInteger(receipt.metrics[key]) || receipt.metrics[key] < 0 || receipt.metrics[key] !== expected) ||
      receipt.actions.some((action) => !TEXT(action?.id) || !paths([action?.path])) ||
      unique(receipt.actions.map((action) => action?.id)).length !== receipt.actions.length ||
      unique(receipt.actions.map((action) => action?.path)).length !== receipt.actions.length ||
      successful.some((action) => statusActions[action.status] !== action.action ||
        !HASH.test(action.fingerprint ?? '') || !Number.isSafeInteger(action.bytes) || action.bytes < 0 ||
        (action.status === 'removed' && (!Number.isSafeInteger(action.reclaimed_bytes) || action.reclaimed_bytes < 0)) ||
        (action.status !== 'removed' && !paths([action.destination])))) {
      add('CLEANUP_INPUT_INVALID', `cleanup receipt ${index} action or byte accounting is invalid`);
    }
    if (restoring) {
      const restoredPaths = successful.map(({ path: file }) => file);
      if (!Array.isArray(receipt.restored) || receipt.restored.some((file) => !paths([file])) ||
          unique(receipt.restored).length !== receipt.restored.length ||
          JSON.stringify(unique(receipt.restored)) !== JSON.stringify(unique(restoredPaths))) {
        add('CLEANUP_INPUT_INVALID', `cleanup receipt ${index} restored paths do not match its actions`);
      }
      const prior = receipts.slice(0, index).find((candidate) => candidate?.receipt_id === receipt.restore_of_receipt_id);
      if (!prior) {
        add('CLEANUP_INPUT_INVALID', `cleanup receipt ${index} references an absent recovery event in its supplied chain`);
      }
      if (prior && (prior.operation === 'restore' || prior.root_id !== receipt.root_id ||
          prior.task_id !== receipt.task_id || prior.plan_id !== receipt.plan_id ||
          !Array.isArray(prior.actions) || successful.some((action) => !prior.actions.some((original) =>
            ['quarantined', 'archived'].includes(original?.status) && original.id === action.id &&
            original.path === action.path && original.destination === action.destination &&
            original.fingerprint === action.fingerprint && original.bytes === action.bytes)))) {
        add('CLEANUP_INPUT_INVALID', `cleanup receipt ${index} does not restore its referenced recovery actions`);
      }
    }
    if (receipt.status !== 'verified' || receipt.errors.length > 0 ||
        receipt.actions.some((action) => !['retained', ...Object.keys(statusActions)].includes(action?.status)) ||
        receipt.verification?.result !== 'PASSED' || receipt.verification?.affected_checks !== 'PASSED' ||
        !Array.isArray(receipt.verification?.checks) || receipt.verification.checks.length === 0 ||
        receipt.verification.checks.some((check) => check?.result !== 'PASSED' || !check.evidence)) {
      add('CLEANUP_UNVERIFIED', `cleanup receipt ${receipt.receipt_id} has unresolved ${restoring ? 'restore' : 'apply'} or verification work`);
    }
    if (!HASH.test(receipt.source_after?.fingerprint ?? '') ||
        !HASH.test(receipt.source_before?.fingerprint ?? '') ||
        !HASH.test(receipt.source_after?.git_state_fingerprint ?? '') ||
        !HASH.test(receipt.source_before?.git_state_fingerprint ?? '') ||
        ![receipt.source_before?.revision, receipt.source_after?.revision].every((revision) => revision === null || REVISION.test(revision ?? '')) ||
        (index > 0 && receipt.source_before?.fingerprint !== receipts[index - 1]?.source_after?.fingerprint)) {
      add('CLEANUP_SOURCE_MISMATCH', 'cleanup receipts must retain a coherent source snapshot chain');
    }
    if (index === receipts.length - 1) {
      verificationCommands.push(...(Array.isArray(receipt.verification?.checks) ? receipt.verification.checks : [])
        .map((check) => check?.actual_command).filter((command) => Array.isArray(command) && command.length > 0 && command.every(TEXT)));
    }
    for (const action of successful) {
      const normalized = paths([action.path]);
      if (!normalized) add('CLEANUP_INPUT_INVALID', 'cleanup action path must be repository-relative');
      else changedPaths.push(...normalized);
    }
  }
  if (currentSnapshot?.fingerprint !== receipts.at(-1)?.source_after?.fingerprint) {
    add('CLEANUP_SOURCE_MISMATCH', 'cleanup receipt does not describe the current independently captured snapshot');
  }
  const mapped = evidenceRefs.map((id) => evidence.find((entry) => entry?.id === id));
  if (evidenceRefs.length === 0 || unique(evidenceRefs).length !== evidenceRefs.length || mapped.some((entry) =>
    !entry || entry.result !== 'PASSED' || entry.freshness !== 'current' ||
    !Array.isArray(entry.actual_command) || entry.actual_command.length === 0 ||
    entry.actual_command.some((part) => !TEXT(part)) ||
    !Array.isArray(entry.cleanup_receipt_ids) || !entry.cleanup_receipt_ids.includes(ids.at(-1)) ||
    entry.cleanup_receipt_ids.some((id) => typeof id !== 'string' || !HASH.test(id) || !ids.includes(id)) ||
    unique(entry.cleanup_receipt_ids).length !== entry.cleanup_receipt_ids.length ||
    (currentSource !== undefined && (entry.source_revision !== currentSource?.source_revision ||
      entry.source_fingerprint !== currentSource?.source_fingerprint)))) {
    add('CLEANUP_UNVERIFIED', 'cleanup requires current mapped affected-check command evidence');
  }
  const coveredPaths = mapped.flatMap((entry) => entry?.path_refs ?? []);
  if (verificationCommands.length === 0 || mapped.some((entry) => !verificationCommands.some((command) =>
      JSON.stringify(command) === JSON.stringify(entry?.actual_command)))) {
    add('CLEANUP_UNVERIFIED', 'mapped commands must come from the latest cleanup affected-check verifier');
  }
  if (unique(changedPaths).some((changedPath) => !coveredPaths.includes(changedPath))) {
    add('CLEANUP_UNVERIFIED', 'mapped cleanup verification must account for every mutated active path');
  }
  if (branchReady !== undefined && (!Array.isArray(branchReady?.cleanup_receipt_ids) ||
      JSON.stringify(unique(branchReady.cleanup_receipt_ids)) !== JSON.stringify(unique(ids)))) {
    add('CLEANUP_AFTER_BRANCH_READY', 'cleanup changed after branch-ready; rerun the final read-only gate');
  }
  return { valid: blockers.length === 0, applicable: true, status: blockers.length === 0 ? 'ACCEPTED' : 'BLOCKED', receipt_ids: ids, blockers };
}
