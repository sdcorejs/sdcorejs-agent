import { createHash } from 'node:crypto';
import { access, lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import {
  validateApprovedWriteScope,
  verifyApprovedArtifact,
} from '../shared/approved-artifact.mjs';
import { systemRegistry } from '../shared/system-registry.mjs';

const WRITE_RESULT_TYPES = new Set(['commit', 'patch', 'working-tree-diff']);
const AUTHORITIES = new Set(['read-only', 'read-write']);
const HEX_40 = /^[a-f0-9]{40}$/u;
const MAX_ATTEMPTS = 3;

export function validateDispatchEnvelope(envelope = {}) {
  const errors = [];
  if (envelope.schema_version !== 1) errors.push('dispatch envelope schema_version must be 1');
  for (const field of ['repository_id', 'repository_role', 'git_root', 'source_revision']) {
    if (typeof envelope[field] !== 'string' || envelope[field].trim() === '') {
      errors.push(`dispatch envelope requires ${field}`);
    }
  }
  if (envelope.source === 'approved-plan') {
    for (const field of ['contract_id', 'plan_artifact_id', 'plan_approval_hash']) {
      if (typeof envelope[field] !== 'string' || envelope[field].trim() === '') {
        errors.push(`approved-plan dispatch envelope requires ${field}`);
      }
    }
    for (const forbidden of ['request_hash', 'scope_hash']) {
      if (Object.hasOwn(envelope, forbidden)) {
        errors.push(`approved-plan dispatch envelope must not define ${forbidden}`);
      }
    }
  } else if (envelope.source === 'read-only-request') {
    for (const field of ['request_hash', 'scope_hash']) {
      if (typeof envelope[field] !== 'string' || envelope[field].trim() === '') {
        errors.push(`read-only dispatch envelope requires ${field}`);
      }
    }
    for (const forbidden of ['contract_id', 'plan_artifact_id', 'plan_approval_hash']) {
      if (Object.hasOwn(envelope, forbidden)) {
        errors.push(`read-only dispatch envelope must not define ${forbidden}`);
      }
    }
    if (envelope.authority !== 'read-only') {
      errors.push('read-only dispatch envelope authority must be read-only');
    }
  } else {
    errors.push('dispatch envelope source must be approved-plan or read-only-request');
  }
  if (!systemRegistry.repository_roles.includes(envelope.repository_role)) {
    errors.push(`dispatch envelope repository_role is unknown: ${envelope.repository_role}`);
  }
  if (envelope.repository_role === 'module' && !envelope.module_id) {
    errors.push('dispatch envelope module role requires module_id');
  }
  if (!HEX_40.test(envelope.source_revision ?? '')) {
    errors.push('dispatch envelope source_revision must be a lowercase 40-character Git revision');
  }
  if (!Array.isArray(envelope.allowed_paths) || !Array.isArray(envelope.prohibited_paths)) {
    errors.push('dispatch envelope requires allowed_paths and prohibited_paths arrays');
  }
  if (!AUTHORITIES.has(envelope.authority)) {
    errors.push('dispatch envelope authority must be read-only or read-write');
  }
  if (envelope.git_mutations !== 'deny') {
    errors.push('dispatch envelope must deny worker Git mutations');
  }
  if (envelope.approved_artifact_mutation !== 'deny') {
    errors.push('dispatch envelope must deny approved artifact mutation');
  }
  if (
    !Array.isArray(envelope.required_validations) ||
    envelope.required_validations.length === 0
  ) {
    errors.push('dispatch envelope requires required_validations');
  }
  if (
    !envelope.output_evidence_contract ||
    typeof envelope.output_evidence_contract !== 'object' ||
    typeof envelope.output_evidence_contract.result_type !== 'string' ||
    !Array.isArray(envelope.output_evidence_contract.required_fields) ||
    envelope.output_evidence_contract.required_fields.length === 0
  ) {
    errors.push('dispatch envelope requires an output_evidence_contract');
  }
  if (envelope.authority === 'read-only' && (envelope.allowed_paths ?? []).length > 0) {
    errors.push('read-only dispatch envelope allowed_paths must be empty');
  }
  return errors;
}

export function buildDispatchEnvelope({
  approved_plan: approvedPlan,
  repository,
  allowed_paths: allowedPaths,
  prohibited_paths: prohibitedPaths,
  authority,
  required_validations: requiredValidations,
  output_evidence_contract: outputEvidenceContract,
}) {
  const verified = verifyApprovedArtifact(approvedPlan);
  if (verified.metadata.artifact_kind !== 'plan') {
    throw new Error(`dispatch requires an approved plan, received ${verified.metadata.artifact_kind}`);
  }
  if (verified.metadata.owner_repository_id !== repository?.repository_id) {
    throw new Error(
      `dispatch owner mismatch: plan belongs to ${verified.metadata.owner_repository_id}, not ${repository?.repository_id ?? '<missing>'}`,
    );
  }
  if (verified.metadata.source_revision !== repository?.source_revision) {
    throw new Error('dispatch source revision is stale');
  }
  const authorizedScope = validateApprovedWriteScope(verified.metadata, {
    allowed_paths: allowedPaths,
    prohibited_paths: prohibitedPaths,
  });
  const envelope = {
    schema_version: 1,
    source: 'approved-plan',
    contract_id: verified.metadata.contract_id,
    plan_artifact_id: verified.metadata.artifact_id,
    plan_approval_hash: verified.approval_hash,
    repository_id: repository.repository_id,
    repository_role: repository.repository_role,
    module_id: repository.module_id ?? null,
    git_root: repository.git_root,
    source_revision: repository.source_revision,
    allowed_paths: structuredClone(authorizedScope.allowed_paths),
    prohibited_paths: structuredClone(authorizedScope.prohibited_paths),
    authority,
    git_mutations: 'deny',
    approved_artifact_mutation: 'deny',
    required_validations: structuredClone(requiredValidations ?? []),
    output_evidence_contract: structuredClone(outputEvidenceContract ?? {}),
  };
  const errors = validateDispatchEnvelope(envelope);
  if (errors.length > 0) {
    throw new Error(`invalid dispatch envelope:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  }
  return envelope;
}

export function validateWorkerAuthority(
  unit = {},
  {
    operation,
    current_repository_id: currentRepositoryId,
    current_git_root: currentGitRoot,
    repository_relative_path: repositoryRelativePath,
  } = {},
) {
  const envelope = unit.dispatch_envelope ?? {};
  const errors = validateDispatchEnvelope(envelope);
  if (
    currentRepositoryId !== envelope.repository_id ||
    path.resolve(currentGitRoot ?? '.') !== path.resolve(envelope.git_root ?? '.')
  ) {
    errors.push('cross-root worker operation is denied');
  }
  if (['git-stage', 'git-commit', 'git-push'].includes(operation)) {
    errors.push('worker Git mutation is denied; only the integration owner may stage or commit');
  }
  if (operation === 'mutate-approved-artifact') {
    errors.push('worker approved artifact mutation is denied');
  }
  if (operation === 'write') {
    if (envelope.authority !== 'read-write') errors.push('read-only worker write is denied');
    let normalized;
    try {
      normalized = normalizeRelative(repositoryRelativePath);
    } catch (error) {
      errors.push(error.message);
    }
    if (normalized) {
      if (!matchesAny(normalized, envelope.allowed_paths ?? [], process.platform === 'win32')) {
        errors.push(`worker path is outside allowed_paths: ${normalized}`);
      }
      if (matchesAny(normalized, envelope.prohibited_paths ?? [], process.platform === 'win32')) {
        errors.push(`worker path matches prohibited_paths: ${normalized}`);
      }
    }
  }
  return [...new Set(errors)];
}

export function validateContract(contract = {}, { writeCapable = false } = {}) {
  const errors = [];
  if (!['approved-plan', 'read-only-request'].includes(contract.source)) {
    return ['contract.source must be approved-plan or read-only-request'];
  }
  if (contract.source === 'approved-plan') {
    for (const field of ['contract_id', 'approved_plan_path', 'approved_plan_hash', 'frozen_contract_path', 'frozen_contract_hash']) {
      if (!contract[field]) errors.push(`approved-plan contract requires ${field}`);
    }
    if (!Number.isInteger(contract.revision) || contract.revision < 1) errors.push('approved-plan contract requires a positive integer revision');
    if (!Object.hasOwn(contract, 'supersedes')) errors.push('approved-plan contract requires supersedes, using null for the first revision');
    for (const forbidden of ['request_hash', 'scope_hash', 'write_policy']) {
      if (Object.hasOwn(contract, forbidden)) errors.push(`approved-plan contract must not define ${forbidden}`);
    }
  } else {
    for (const field of ['request_hash', 'scope_hash']) {
      if (!contract[field]) errors.push(`read-only-request contract requires ${field}`);
    }
    if (contract.write_policy !== 'deny') errors.push('read-only-request write_policy must be deny');
    if (writeCapable) errors.push('write-capable execution requires an approved plan');
    for (const forbidden of ['contract_id', 'approved_plan_path', 'approved_plan_hash', 'frozen_contract_path', 'frozen_contract_hash', 'revision', 'supersedes']) {
      if (Object.hasOwn(contract, forbidden)) errors.push(`read-only-request must not define ${forbidden}`);
    }
  }
  return errors;
}

export function invalidateForContractRevision(units, { oldHash, newHash, revision }) {
  return units.map((unit) => {
    if (unit.contract_hash !== oldHash) return unit;
    return {
      ...unit,
      status: 'STALE',
      stale_reason: `contract revision ${revision}: ${oldHash} -> ${newHash}`,
      evidence: unit.evidence ? { ...unit.evidence, valid: false, stale_reason: 'contract revision' } : unit.evidence
    };
  });
}

export function validateDispatchContext(context = {}) {
  const errors = [];
  const writeCapable = context.contract?.source === 'approved-plan';
  errors.push(...validateContract(context.contract, { writeCapable }));
  if (context.schema_version !== 2) errors.push('schema_version must be 2');
  if (writeCapable) {
    if (!context.working_tree) errors.push('write dispatch requires working_tree preflight');
    else {
      for (const field of ['repo_root', 'current_branch', 'current_head', 'status_snapshot_hash', 'dirty_diff_hash']) {
        if (!context.working_tree[field]) errors.push(`working_tree requires ${field}`);
      }
      errors.push(...validateWorkingTree(context.working_tree));
    }
  }
  const runtime = validateRuntimeCapabilities(context.runtime_capabilities, writeCapable);
  if (writeCapable && ['BLOCKED', 'SEQUENTIAL', 'SEQUENTIAL_WAVES'].includes(runtime.mode)) errors.push(`runtime cannot safely parallelize write work: ${runtime.reason}`);
  if (writeCapable) {
    for (const field of ['workspace_path', 'branch', 'base_head', 'merge_strategy', 'merge_order', 'atomicity']) {
      if (context.integration?.[field] === undefined || context.integration?.[field] === null) errors.push(`integration requires ${field}`);
    }
    if (context.integration?.atomicity === 'all-or-nothing' && !context.integration.rollback_strategy) errors.push('integration requires rollback_strategy for all-or-nothing');
    if (context.integration && !['cherry-pick', 'patch', 'disjoint-same-tree'].includes(context.integration.merge_strategy)) errors.push('integration merge_strategy is invalid');
    if (context.integration && !['all-or-nothing', 'independent-successes', 'user-decision'].includes(context.integration.atomicity)) errors.push('integration atomicity is invalid');
    const unitIds = (context.units ?? []).map((unit) => unit.id);
    const mergeOrder = context.integration?.merge_order ?? [];
    if (mergeOrder.length !== unitIds.length || new Set(mergeOrder).size !== mergeOrder.length || mergeOrder.some((id) => !unitIds.includes(id))) errors.push('integration merge_order must name every unit exactly once');
  }
  for (const unit of context.units ?? []) {
    const prefix = `unit ${unit.id ?? '<unknown>'}`;
    const envelopeErrors = validateDispatchEnvelope(unit.dispatch_envelope);
    errors.push(...envelopeErrors.map((error) => `${prefix}: ${error}`));
    const envelope = unit.dispatch_envelope ?? {};
    if (envelope.contract_id !== context.contract?.contract_id && writeCapable) {
      errors.push(`${prefix} dispatch contract_id mismatch`);
    }
    if (envelope.plan_approval_hash !== context.contract?.approved_plan_hash && writeCapable) {
      errors.push(`${prefix} dispatch plan approval hash mismatch`);
    }
    if (writeCapable && envelope.source !== 'approved-plan') {
      errors.push(`${prefix} write dispatch requires approved-plan envelope identity`);
    }
    if (!writeCapable) {
      if (envelope.source !== 'read-only-request') {
        errors.push(`${prefix} read-only dispatch requires read-only-request envelope identity`);
      }
      if (envelope.request_hash !== context.contract?.request_hash) {
        errors.push(`${prefix} dispatch request_hash mismatch`);
      }
      if (envelope.scope_hash !== context.contract?.scope_hash) {
        errors.push(`${prefix} dispatch scope_hash mismatch`);
      }
    }
    if (
      unit.workspace?.path &&
      envelope.git_root &&
      path.resolve(unit.workspace.path) !== path.resolve(envelope.git_root)
    ) {
      errors.push(`${prefix} dispatch Git root does not match workspace`);
    }
    if (
      JSON.stringify(envelope.allowed_paths ?? []) !==
        JSON.stringify(unit.ownership?.allowed_paths ?? []) ||
      JSON.stringify(envelope.prohibited_paths ?? []) !==
        JSON.stringify(unit.ownership?.prohibited_paths ?? [])
    ) {
      errors.push(`${prefix} dispatch path authority differs from ownership`);
    }
    if (
      envelope.output_evidence_contract?.result_type &&
      envelope.output_evidence_contract.result_type !== unit.result?.type
    ) {
      errors.push(`${prefix} result type differs from output evidence contract`);
    }
    for (const sharedFile of unit.ownership?.shared_files ?? []) {
      if (sharedFile.owner !== 'integration-unit') {
        errors.push(`${prefix} shared/coordinated file must be owned by integration-unit`);
      }
    }
    if (writeCapable) {
      if (envelope.authority !== 'read-write') {
        errors.push(`${prefix} write dispatch requires read-write authority`);
      }
      if (!['disjoint-same-tree', 'worktree'].includes(unit.workspace?.strategy)) errors.push(`${prefix} has invalid workspace strategy`);
      for (const field of ['strategy', 'path', 'base_head']) {
        if (!unit.workspace?.[field]) errors.push(`${prefix} workspace requires ${field}`);
      }
      if (!unit.ownership?.allowed_paths?.length) errors.push(`${prefix} requires allowed_paths`);
      if (!unit.verification?.command || !unit.verification?.cwd) errors.push(`${prefix} requires verification command and cwd`);
      if (!WRITE_RESULT_TYPES.has(unit.result?.type)) errors.push(`${prefix} requires immutable or exact-diff result protocol`);
      const compatibleResult = { 'cherry-pick': 'commit', patch: 'patch', 'disjoint-same-tree': 'working-tree-diff' }[context.integration?.merge_strategy];
      if (compatibleResult && unit.result?.type !== compatibleResult) errors.push(`${prefix} result type is incompatible with integration merge_strategy`);
      errors.push(...validateWorkspaceAssignment({ unit, integration: context.integration ?? {}, existingWorktrees: context.existing_worktrees ?? [] }).map((error) => `${prefix}: ${error}`));
      if (unit.workspace?.strategy === 'disjoint-same-tree' && !isDisjointSameTreeSafe(unit)) errors.push(`${prefix} disjoint-same-tree command or resources are unsafe`);
    } else {
      if (envelope.authority !== 'read-only') {
        errors.push(`${prefix} read-only dispatch requires read-only authority`);
      }
      if (unit.workspace?.strategy !== 'shared-readonly') errors.push(`${prefix} read-only workspace must be shared-readonly`);
      if ((unit.ownership?.allowed_paths ?? []).length > 0) errors.push(`${prefix} read-only allowed_paths must be empty`);
      if (unit.result?.type !== 'report') errors.push(`${prefix} read-only result must be report`);
    }
  }
  if (writeCapable) {
    if (context.final_tail?.verify_before_done !== true) errors.push('verify_before_done must be true');
    if (context.final_tail?.branch_ready_final_gate !== true) errors.push('branch_ready_final_gate must be true');
    if (context.final_tail?.no_writes_after_branch_ready !== true) errors.push('no_writes_after_branch_ready must be true');
  }
  return errors;
}

export function validateWorkingTree(tree = {}, { caseInsensitive = process.platform === 'win32' } = {}) {
  const errors = [];
  if (tree.expected_branch && tree.current_branch !== tree.expected_branch) errors.push('branch mismatch');
  if (tree.expected_head && tree.current_head !== tree.expected_head) errors.push('HEAD mismatch');
  if ((tree.unrelated_dirty_paths ?? []).length > 0 && !tree.user_dirty_tree_decision) errors.push('unrelated dirty paths require a user decision');
  const occupied = [
    ...(tree.staged_paths ?? []),
    ...(tree.unstaged_paths ?? []),
    ...(tree.untracked_paths ?? []),
    ...(tree.existing_paths ?? [])
  ].map(normalizeRelative);
  for (const output of tree.intended_output_paths ?? []) {
    const normalized = normalizeRelative(output);
    if (occupied.some((candidate) => repositoryPathsOverlap(candidate, normalized, caseInsensitive))) {
      errors.push(`existing output overlaps intended output: ${output}`);
    }
  }
  return errors;
}

export function validateRuntimeCapabilities(capabilities = {}, writeHeavy = false) {
  const required = ['supports_subagents', 'supports_parallel_dispatch', 'supports_agent_cwd'];
  if (required.some((key) => typeof capabilities[key] !== 'boolean')) return { mode: 'SEQUENTIAL', reason: 'capability unknown' };
  if (!capabilities.supports_subagents) return { mode: 'SEQUENTIAL', reason: 'subagents unavailable' };
  if (!capabilities.supports_parallel_dispatch) return { mode: 'SEQUENTIAL_WAVES', reason: 'calls serialize' };
  if (writeHeavy && !capabilities.supports_agent_cwd) return { mode: 'DISJOINT_SAME_TREE_ONLY', reason: 'agent cwd unavailable' };
  return {
    mode: 'PARALLEL',
    cancellation: capabilities.supports_cancellation ? 'supported' : 'best-effort',
    resultIdentity: capabilities.supports_result_ref ? 'immutable-ref' : 'exact-diff-snapshot'
  };
}

export function validateWorkspaceAssignment({ unit = {}, integration = {}, existingWorktrees = [] }) {
  const errors = [];
  const workspacePath = path.resolve(unit.workspace?.path ?? '.');
  if (unit.verification?.cwd && path.resolve(unit.verification.cwd) !== workspacePath) errors.push('verification cwd does not match unit workspace');
  for (const worktree of existingWorktrees) {
    const existing = path.resolve(worktree.path);
    if (workspacePath !== existing && (isWithin(existing, workspacePath) || isWithin(workspacePath, existing))) {
      errors.push('nested worktree assignment is forbidden');
    }
  }
  if (integration.dirty) errors.push('dirty integration workspace');
  if (unit.workspace?.strategy === 'worktree' && integration.workspace_path && path.resolve(integration.workspace_path) === workspacePath) errors.push('unit worktree must be separate from integration workspace');
  if (integration.base_head && unit.workspace?.base_head && unit.workspace.base_head !== integration.base_head) errors.push('workspace base differs from integration base');
  if (integration.base_head && unit.result?.base_head && unit.result.base_head !== integration.base_head) errors.push('stale result base');
  if (unit.result?.descends_from_base === false) errors.push('result does not descend from expected base');
  return errors;
}

export function validateResultIdentity(unit = {}, { baseHead, readOnly = false } = {}) {
  const errors = [];
  if (!unit.result?.ref) return ['missing result reference'];
  if (unit.status === 'PASSED' && unit.result.exit_code !== 0) errors.push('claimed success has non-zero exit code');
  if (baseHead && unit.result.base_head !== baseHead) errors.push('result uses stale base');
  if (unit.result.descends_from_base === false) errors.push('result does not descend from base');
  if (!unit.result.associated_head_or_diff) errors.push('result is missing associated state');
  if (!unit.result.output_digest) errors.push('result is missing output digest');
  if (readOnly && (unit.result.changed_paths ?? []).length > 0) errors.push('read-only unit changed files');
  const envelope = unit.dispatch_envelope;
  if (envelope) {
    for (const field of envelope.output_evidence_contract?.required_fields ?? []) {
      if (unit.result?.[field] === undefined || unit.result?.[field] === null) {
        errors.push(`result is missing required repository evidence field: ${field}`);
      }
    }
    for (const field of ['repository_id', 'repository_role', 'module_id', 'source_revision']) {
      if (
        Object.hasOwn(unit.result ?? {}, field) &&
        unit.result[field] !== envelope[field]
      ) {
        errors.push(`result repository identity mismatch: ${field}`);
      }
    }
  }
  return errors;
}

export async function runUnitWithPolicy(run, policy = {}) {
  const maxAttempts = Math.min(MAX_ATTEMPTS, Math.max(1, policy.max_attempts ?? 1));
  let attempts = 0;
  while (attempts < maxAttempts) {
    attempts += 1;
    try {
      const timeoutMs = Math.max(1, Number(policy.timeout_seconds ?? 0) * 1000);
      const value = policy.timeout_seconds ? await withTimeout(run(), timeoutMs) : await run();
      if (!value) return { status: 'FAILED', failure_kind: 'missing-result', attempts };
      if (value.exit_code !== undefined && value.exit_code !== 0) return { status: 'FAILED', failure_kind: 'non-zero-exit', attempts, result: value };
      return { status: 'PASSED', attempts, result: value };
    } catch (error) {
      const deterministic = ['path-violation', 'contract-violation', 'stale-base'].includes(error.kind);
      const transient = error.transient === true || error.kind === 'timeout';
      if (!deterministic && transient && policy.retry_transient_failures && attempts < maxAttempts) continue;
      return { status: 'FAILED', failure_kind: error.kind ?? 'crash', reason: error.message, attempts };
    }
  }
  return { status: 'FAILED', failure_kind: 'attempts-exhausted', attempts };
}

export async function runUnitsWithPolicy(units, policy = {}) {
  const results = [];
  for (let index = 0; index < units.length; index += 1) {
    const unit = units[index];
    const result = { id: unit.id, ...await runUnitWithPolicy(unit.run, policy) };
    results.push(result);
    if (result.status !== 'PASSED' && policy.mode === 'fail-fast') {
      for (const pending of units.slice(index + 1)) {
        results.push({ id: pending.id, status: policy.supports_cancellation ? 'CANCELLED' : 'PENDING', cancellation: policy.supports_cancellation ? 'supported' : 'best-effort' });
      }
      break;
    }
  }
  return { mode: policy.mode ?? 'best-effort', results };
}

export function classifyTopology({ contract, units = [], runtimeCapabilities = {} }) {
  const readOnly = contract?.source === 'read-only-request';
  const runtime = validateRuntimeCapabilities(runtimeCapabilities, !readOnly);
  if (readOnly) return { kind: 'READ_ONLY_FANOUT', verdict: runtime.mode === 'PARALLEL' ? 'PARALLEL-CANDIDATE' : 'SEQUENTIAL', runtime };
  if (['BLOCKED', 'SEQUENTIAL', 'SEQUENTIAL_WAVES'].includes(runtime.mode)) return { kind: 'SEQUENTIAL_DAG', verdict: 'SEQUENTIAL', runtime };
  if (runtime.mode === 'DISJOINT_SAME_TREE_ONLY' && units.some((unit) => unit.workspace?.strategy !== 'disjoint-same-tree' || !isDisjointSameTreeSafe(unit))) {
    return { kind: 'SEQUENTIAL_DAG', verdict: 'SEQUENTIAL', runtime, reason: 'runtime lacks safe per-agent cwd' };
  }
  const dependencies = units.some((unit) => (unit.depends_on ?? []).length > 0);
  const pathConflict = ownershipOverlaps(units);
  const resourceConflict = resourcesOverlap(units);
  if (resourceConflict || pathConflict) return { kind: 'SEQUENTIAL_DAG', verdict: 'SEQUENTIAL', reason: resourceConflict ? 'resource overlap' : 'path overlap' };
  if (dependencies) return { kind: 'SEQUENTIAL_DAG', verdict: 'PARALLEL-CANDIDATE', waves: planWaves(units) };
  if (units.some((unit) => unit.role || unit.contract_bound)) return { kind: 'CONTRACT_BOUND_ROLES', verdict: 'ROLE-SPLIT' };
  return { kind: 'INDEPENDENT_WRITE_UNITS', verdict: units.length >= 2 ? 'PARALLEL-CANDIDATE' : 'SEQUENTIAL' };
}

export function planWaves(units) {
  const remaining = new Map(units.map((unit) => [unit.id, new Set(unit.depends_on ?? [])]));
  const done = new Set();
  const waves = [];
  while (remaining.size > 0) {
    const wave = [...remaining].filter(([, deps]) => [...deps].every((id) => done.has(id))).map(([id]) => id).sort();
    if (wave.length === 0) throw new Error('dependency cycle or missing dependency');
    waves.push(wave);
    for (const id of wave) { remaining.delete(id); done.add(id); }
  }
  return waves;
}

export async function validatePathBoundary({ repoRoot, unit, actualChanges = [], selfReportedPaths, caseInsensitive = process.platform === 'win32' }) {
  const errors = [];
  const expanded = actualChanges.flatMap((change) => change.status === 'R'
    ? [{ status: 'D', path: change.from }, { status: 'A', path: change.path }]
    : [change]);
  const normalized = [];
  for (const change of expanded) {
    let rel;
    try { rel = normalizeRelative(change.path); } catch (error) { errors.push(error.message); continue; }
    normalized.push(rel);
    if (!matchesAny(rel, unit.ownership?.allowed_paths ?? [], caseInsensitive)) errors.push(`out-of-scope path: ${rel}`);
    if (matchesAny(rel, unit.ownership?.prohibited_paths ?? [], caseInsensitive)) errors.push(`prohibited path: ${rel}`);
    if (isLockfile(rel) && !matchesAny(rel, unit.ownership?.allowed_lockfiles ?? [], caseInsensitive)) errors.push(`unauthorized lockfile: ${rel}`);
    errors.push(...await inspectFilesystemBoundary(repoRoot, rel, unit.ownership ?? {}, caseInsensitive));
  }
  const actual = [...new Set(normalized.map((item) => caseInsensitive ? item.toLowerCase() : item))].sort();
  if (selfReportedPaths) {
    const reported = [...new Set(selfReportedPaths.map(normalizeRelative).map((item) => caseInsensitive ? item.toLowerCase() : item))].sort();
    if (JSON.stringify(actual) !== JSON.stringify(reported)) errors.push('unit self-report differs from actual changed paths');
  }
  return { errors: [...new Set(errors)], changed_paths: [...new Set(normalized)].sort() };
}

export async function integrateResults({ units = [], integration = {}, failurePolicy = {}, validate, review, apply = async () => {}, probe = async () => {}, rollback, globalVerify }) {
  const byId = new Map(units.map((unit) => [unit.id, unit]));
  const order = integration.merge_order ?? [];
  if (order.length !== units.length || new Set(order).size !== order.length) return { status: 'INTEGRATION_BLOCKED', reason: 'merge order must name each unit exactly once' };
  if (integration.atomicity === 'user-decision' && !integration.user_decision) return { status: 'USER_DECISION_REQUIRED', reason: 'atomicity policy requires user decision before fan-in' };
  if (units.some((unit) => unit.status !== 'PASSED')) return { status: 'INTEGRATION_BLOCKED', reason: 'only PASSED units may fan in' };
  if (typeof validate !== 'function' || typeof review !== 'function') return { status: 'INTEGRATION_BLOCKED', reason: 'parent path/Stage A validator and Stage B reviewer are required' };
  if (integration.atomicity === 'all-or-nothing' && typeof rollback !== 'function') return { status: 'INTEGRATION_BLOCKED', reason: 'all-or-nothing requires an executable rollback' };
  if (typeof globalVerify !== 'function') return { status: 'INTEGRATION_BLOCKED', reason: 'global verification callback is required' };
  const seenPaths = new Set();
  const integrated = [];
  for (const id of order) {
    const unit = byId.get(id);
    const identityErrors = validateResultIdentity(unit, { baseHead: integration.base_head });
    if (identityErrors.length > 0) return failIntegration(identityErrors.join('; '), integrated, integration, rollback);
    for (const changed of unit.result.changed_paths ?? []) {
      const normalized = normalizeRelative(changed);
      if (seenPaths.has(normalized)) return failIntegration(`duplicate shared artifact: ${normalized}`, integrated, integration, rollback);
      seenPaths.add(normalized);
    }
    let validationResult;
    try {
      validationResult = await validate(unit);
    } catch (error) {
      return failIntegration(`unit validation failed: ${id}: ${error.message}`, integrated, integration, rollback);
    }
    if (!isParentValidationPass(validationResult, unit, 'path')) return failIntegration(`unit validation failed: ${id}`, integrated, integration, rollback);
    let reviewResult;
    try { reviewResult = await review(unit); }
    catch (error) { return failIntegration(`unit review failed: ${id}: ${error.message}`, integrated, integration, rollback); }
    if (!isParentValidationPass(reviewResult, unit, 'review')) return failIntegration(`unit review failed: ${id}`, integrated, integration, rollback);
    let attempt = 0;
    const maxAttempts = Math.min(
      MAX_ATTEMPTS,
      Math.max(1, failurePolicy.max_attempts ?? 1),
    );
    while (true) {
      attempt += 1;
      try { await apply(unit); break; }
      catch (error) {
        const retry = error.transient === true && failurePolicy.retry_transient_failures === true && attempt < maxAttempts;
        if (retry) continue;
        return failIntegration(error.message, integrated, integration, rollback, 'INTEGRATION_BLOCKED', true);
      }
    }
    integrated.push(id);
    try { await probe(unit); }
    catch (error) { return failIntegration(`integration probe failed: ${error.message}`, integrated, integration, rollback); }
  }
  let verified;
  try { verified = await globalVerify(); }
  catch (error) { return failIntegration(`global verification failed: ${error.message}`, integrated, integration, rollback, 'GLOBAL_VERIFICATION_FAILED'); }
  if (verified?.status !== 'PASS' || !verified.associated_head_or_diff || !verified.output_digest) return failIntegration('global verification failed', integrated, integration, rollback, 'GLOBAL_VERIFICATION_FAILED');
  return { status: 'GLOBAL_VERIFIED', integrated, rollbackRequired: false };
}

export function assignRepair({ finding, unit, ownershipTransfer }) {
  const paths = finding.paths ?? [];
  if (paths.some((item) => /(^|\/)\.sdcorejs\/(plans|specs)\//.test(normalizeRelative(item)))) throw new Error('repair cannot modify an approved contract artifact');
  const outside = paths.filter((item) => !matchesAny(normalizeRelative(item), unit.ownership?.allowed_paths ?? [], process.platform === 'win32'));
  if (outside.length > 0 && !ownershipTransfer?.approved) throw new Error('repair needs explicit ownership transfer');
  if (outside.length > 0 && paths.some((item) => !matchesAny(normalizeRelative(item), ownershipTransfer.allowed_paths ?? [], process.platform === 'win32'))) throw new Error('repair path is outside transferred scope');
  return {
    finding_id: finding.id,
    original_unit_id: unit.id,
    repair_owner: outside.length > 0 ? 'integration-owner' : 'original-unit',
    workspace_path: outside.length > 0 ? ownershipTransfer.workspace_path : unit.workspace.path,
    base_result_ref: unit.result.ref,
    contract_hash: unit.contract_hash,
    allowed_paths: outside.length > 0 ? ownershipTransfer.allowed_paths : unit.ownership.allowed_paths,
    ownership_transfer_approved: outside.length > 0,
    evidence_valid: false,
    status: finding.blocking && finding.deferred ? 'BLOCKED' : 'PENDING'
  };
}

export function createEvidence({
  command,
  cwd,
  started_at = new Date().toISOString(),
  finished_at = new Date().toISOString(),
  exit_code,
  associated_head_or_diff,
  output,
  environment_fingerprint,
  repository_id,
  repository_role,
  module_id,
  source_revision,
}) {
  return {
    command,
    cwd,
    started_at,
    finished_at,
    exit_code,
    associated_head_or_diff,
    output_digest: digest(output),
    environment_fingerprint,
    repository_id,
    repository_role,
    module_id,
    source_revision,
    valid: true,
  };
}

export function validateEvidence(evidence = {}, expected = {}) {
  const errors = [];
  if (evidence.valid !== true) errors.push('evidence is stale or invalid');
  if (evidence.exit_code !== 0) errors.push('evidence exit code is non-zero');
  if (expected.cwd && evidence.cwd !== expected.cwd) errors.push('evidence cwd mismatch');
  if (expected.associated_head_or_diff && evidence.associated_head_or_diff !== expected.associated_head_or_diff) errors.push('evidence state mismatch');
  if (expected.output !== undefined && evidence.output_digest !== digest(expected.output)) errors.push('evidence output digest mismatch');
  for (const field of [
    'repository_id',
    'repository_role',
    'module_id',
    'source_revision',
  ]) {
    if (Object.hasOwn(expected, field) && evidence[field] !== expected[field]) {
      errors.push(`evidence repository identity mismatch: ${field}`);
    }
  }
  if (!evidence.command || !evidence.started_at || !evidence.finished_at || !evidence.environment_fingerprint) errors.push('evidence is incomplete');
  return errors;
}

export function applyStateEvent(state, event) {
  const exceptional = {
    'CONTRACT_CHANGED': 'PLAN_REVISION_REQUIRED',
    'PATH_VIOLATION': 'UNIT_FAILED',
    'BLOCKING_FINDING': 'UNIT_BLOCKED',
    'MERGE_CONFLICT': 'INTEGRATION_BLOCKED'
  };
  if (event === 'WRITE' && state === 'GLOBAL_VERIFIED') return { state: 'GLOBAL_VERIFICATION_STALE' };
  if (event === 'WRITE' && state === 'BRANCH_READY') return { state: 'BRANCH_READY_STALE' };
  if (event === 'WRITE' && state === 'UNIT_VERIFIED') return { state: 'UNIT_VERIFICATION_STALE' };
  if (event === 'INTEGRATION_WRITE' && state === 'UNIT_VERIFIED') return { state: 'INTEGRATION_VERIFICATION_REQUIRED' };
  if (event === 'UNIT_REPAIRED') return { state: 'UNIT_REVIEWED' };
  return { state: exceptional[event] ?? state };
}

function ownershipOverlaps(units) {
  const claims = units.map(ownershipPathClaims);
  for (let i = 0; i < claims.length; i += 1) for (let j = i + 1; j < claims.length; j += 1) {
    const leftEnvelope = units[i].dispatch_envelope ?? {};
    const rightEnvelope = units[j].dispatch_envelope ?? {};
    if (
      leftEnvelope.repository_id &&
      rightEnvelope.repository_id &&
      leftEnvelope.repository_id !== rightEnvelope.repository_id &&
      leftEnvelope.git_root &&
      rightEnvelope.git_root &&
      path.resolve(leftEnvelope.git_root) === path.resolve(rightEnvelope.git_root)
    ) {
      return true;
    }
    if (claims[i].some((left) => claims[j].some((right) => {
      if (left.repository_id !== right.repository_id) return false;
      const a = left.root;
      const b = right.root;
      return !a || !b || a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
    }))) return true;
  }
  return false;
}

function ownershipPathClaims(unit) {
  const ownership = unit.ownership ?? {};
  const defaultRepositoryId =
    unit.dispatch_envelope?.repository_id ?? '__legacy-current-repository__';
  const claims = [
    ...(ownership.allowed_paths ?? []).map((value) => ({
      repository_id: defaultRepositoryId,
      path: value,
    })),
    ...(ownership.generated_outputs ?? []).map((value) => ({
      repository_id: defaultRepositoryId,
      path: value,
    })),
    ...(ownership.shared_config_paths ?? []).map((value) => ({
      repository_id: defaultRepositoryId,
      path: value,
    })),
    ...(ownership.shared_files ?? []).map((value) => ({
      repository_id: value.repository_id ?? defaultRepositoryId,
      path: value.path,
    })),
    ...(ownership.module_gitlinks ?? []).map((value) =>
      typeof value === 'string'
        ? { repository_id: defaultRepositoryId, path: value }
        : {
            repository_id: value.repository_id ?? defaultRepositoryId,
            path: value.path,
          },
    ),
  ];
  return claims.map(({ repository_id: repositoryId, path: claimPath }) => ({
    repository_id: String(repositoryId).toLowerCase(),
    root: patternRoot(claimPath),
  }));
}

function resourcesOverlap(units) {
  const claimed = [];
  for (const unit of units) for (const resource of exclusiveResourceKeys(unit)) {
    if (claimed.some((item) => resourceClaimsOverlap(item, resource))) return true;
    claimed.push(resource);
  }
  return false;
}

function patternRoot(pattern) {
  return normalizeRelative(pattern).split(/[!*?+@{([]/, 1)[0].replace(/\/$/, '').toLowerCase();
}

function matchesAny(rel, patterns, caseInsensitive) {
  return patterns.some((pattern) => globRegex(pattern, caseInsensitive).test(caseInsensitive ? rel.toLowerCase() : rel));
}

function globRegex(pattern, caseInsensitive) {
  let source = normalizeRelative(pattern);
  if (caseInsensitive) source = source.toLowerCase();
  source = source.replace(/[.+^${}()|\\]/g, '\\$&').replaceAll('**', '\u0000').replaceAll('*', '[^/]*').replaceAll('?', '[^/]').replaceAll('\u0000', '.*');
  return new RegExp(`^${source}$`);
}

function normalizeRelative(value) {
  const raw = String(value ?? '').replaceAll('\\', '/');
  if (!raw || path.posix.isAbsolute(raw) || /^[A-Za-z]:\//.test(raw)) throw new Error(`invalid repository-relative path: ${value}`);
  const normalized = path.posix.normalize(raw).replace(/^\.\//, '');
  if (normalized === '..' || normalized.startsWith('../')) throw new Error(`path escapes repository: ${value}`);
  return normalized;
}

function repositoryPathsOverlap(left, right, caseInsensitive) {
  const normalizeCase = (value) => caseInsensitive ? value.toLowerCase() : value;
  const a = normalizeCase(left).replace(/\/$/, '');
  const b = normalizeCase(right).replace(/\/$/, '');
  return a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
}

function isLockfile(rel) {
  return /(^|\/)(package-lock\.json|npm-shrinkwrap\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?)$/.test(rel);
}

async function inspectFilesystemBoundary(repoRoot, rel, ownership, caseInsensitive) {
  const errors = [];
  const rootReal = await realpath(repoRoot);
  const parts = rel.split('/');
  let cursor = repoRoot;
  for (let index = 0; index < parts.length; index += 1) {
    cursor = path.join(cursor, parts[index]);
    const stat = await lstat(cursor).catch(() => null);
    if (stat?.isSymbolicLink()) {
      const target = await realpath(cursor).catch(() => null);
      if (!target || !isWithin(rootReal, target)) errors.push(`symlink escape: ${rel}`);
      else {
        const projected = path.join(target, ...parts.slice(index + 1));
        const projectedRel = normalizeRelative(path.relative(rootReal, projected));
        if (!matchesAny(projectedRel, ownership.allowed_paths ?? [], caseInsensitive) || matchesAny(projectedRel, ownership.prohibited_paths ?? [], caseInsensitive)) {
          errors.push(`symlink ownership escape: ${rel} -> ${projectedRel}`);
        }
      }
    }
    if (index < parts.length - 1 && cursor !== repoRoot && await exists(path.join(cursor, '.git'))) errors.push(`nested repository boundary: ${rel}`);
  }
  return errors;
}

function isWithin(root, target) {
  const relative = path.relative(root, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

async function exists(file) {
  try { await access(file); return true; } catch { return false; }
}

function digest(value) {
  return createHash('sha256').update(String(value ?? '')).digest('hex');
}

function withTimeout(promise, timeoutMs) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error('unit timeout');
      error.kind = 'timeout';
      reject(error);
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function failIntegration(reason, integrated, integration, rollback, status = 'INTEGRATION_BLOCKED', mutationStarted = false) {
  const rollbackRequired = integration.atomicity === 'all-or-nothing' && (integrated.length > 0 || mutationStarted);
  if (rollbackRequired) {
    try { await rollback([...integrated]); }
    catch (error) { return { status: 'ROLLBACK_FAILED', reason: `${reason}; rollback failed: ${error.message}`, integrated, rollbackRequired: true }; }
  }
  return { status, reason, integrated, rollbackRequired };
}

function exclusiveResourceKeys(unit) {
  const ownership = unit.ownership ?? {};
  const values = [
    ...(ownership.exclusive_resources ?? []).map(normalizeExclusiveResource),
    ...(ownership.allocated_ports ?? []).map((item) => ({ type: 'port', value: String(item).toLowerCase(), hierarchical: false })),
    ownership.database_namespace && { type: 'db', value: String(ownership.database_namespace).toLowerCase(), hierarchical: false },
    ownership.temp_root && pathResource('temp', ownership.temp_root),
    ownership.cache_root && pathResource('cache', ownership.cache_root),
    ownership.coverage_root && pathResource('coverage', ownership.coverage_root)
  ];
  return values.filter(Boolean);
}

function isDisjointSameTreeSafe(unit) {
  if (unit.workspace?.mechanically_disjoint !== true) return false;
  const command = String(unit.verification?.command ?? '').toLowerCase();
  if (/\b(install|format|prettier|eslint\s+--fix|git\s+(add|commit|checkout)|generate|codegen)\b/.test(command)) return false;
  return true;
}

function isParentValidationPass(verdict, unit, kind) {
  if (verdict?.status !== 'PASS') return false;
  if (verdict.associated_head_or_diff !== unit.result.associated_head_or_diff) return false;
  if (kind === 'path') {
    const actual = [...new Set(verdict.changed_paths ?? [])].sort();
    const result = [...new Set(unit.result.changed_paths ?? [])].sort();
    return JSON.stringify(actual) === JSON.stringify(result);
  }
  return Array.isArray(verdict.blockers) && verdict.blockers.length === 0;
}

function normalizeExclusiveResource(value) {
  const raw = String(value).trim();
  const match = raw.match(/^(port|db|temp|cache|coverage):(.*)$/i);
  if (!match) return { type: 'exclusive', value: raw.toLowerCase(), hierarchical: false };
  const type = match[1].toLowerCase();
  return ['temp', 'cache', 'coverage'].includes(type)
    ? pathResource(type, match[2])
    : { type, value: match[2].toLowerCase(), hierarchical: false };
}

function pathResource(type, value) {
  const raw = String(value).replaceAll('\\', '/');
  const normalized = path.posix.normalize(raw).replace(/^\.\//, '').replace(/\/$/, '').toLowerCase();
  const invalid = path.posix.isAbsolute(raw) || normalized === '..' || normalized.startsWith('../');
  return { type, value: normalized, hierarchical: true, invalid };
}

function resourceClaimsOverlap(left, right) {
  if (left.invalid || right.invalid) return true;
  if (left.type !== right.type) return false;
  if (!left.hierarchical || !right.hierarchical) return left.value === right.value;
  return left.value === right.value || left.value.startsWith(`${right.value}/`) || right.value.startsWith(`${left.value}/`);
}
