import { isDeepStrictEqual } from 'node:util';

import {
  validateApprovedWriteScope,
  verifyApprovedArtifactGraph,
} from '../shared/approved-artifact.mjs';
import {
  assertDecisionCoverage,
  assertGoalBackwardPlan,
} from '../shared/decision-coverage.mjs';
import { validateArchitecturePlanHandoff } from '../shared/architecture-contract.mjs';
import { validateRepositoryPlan } from '../shared/repository-contract.mjs';
import { resolveTrack } from '../shared/system-registry.mjs';

const MUTABLE_ACTIONS = new Set(['CREATE', 'EDIT', 'VERIFY-THEN-EDIT']);
const PARALLEL_CAPABILITIES = new Set(['supported']);

function requiredString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${field} must be a non-empty string`);
  }
}

function normalizeRepositoryPath(value) {
  requiredString(value, 'repository_relative_path');
  const normalized = value.replaceAll('\\', '/').replace(/^\.\/+/u, '');
  if (
    normalized.startsWith('/') ||
    /^[A-Za-z]:\//u.test(normalized) ||
    normalized.split('/').includes('..')
  ) {
    throw new TypeError('repository_relative_path must remain inside the repository');
  }
  return normalized;
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/gu, '\\$&');
}

function globToRegex(glob) {
  const normalized = normalizeRepositoryPath(glob);
  let expression = '';
  for (let index = 0; index < normalized.length; index += 1) {
    const character = normalized[index];
    if (character !== '*') {
      expression += escapeRegex(character);
      continue;
    }
    if (normalized[index + 1] === '*') {
      expression += '.*';
      index += 1;
    } else {
      expression += '[^/]*';
    }
  }
  return new RegExp(`^${expression}$`, 'u');
}

function pathMatches(path, patterns) {
  return patterns.some((pattern) => globToRegex(pattern).test(path));
}

function assertArtifactKind(artifact, expectedKind) {
  if (artifact.metadata.artifact_kind !== expectedKind) {
    throw new Error(
      `expected approved ${expectedKind}, received ${artifact.metadata.artifact_kind}`,
    );
  }
}

export function prepareExecution({
  approved_plan: approvedPlan,
  approved_spec: approvedSpec,
  approved_architecture: approvedArchitecture = null,
  repository_plan: repositoryPlan,
  owner_revisions: ownerRevisions,
  plan_context: planContext,
}) {
  if (planContext === undefined || planContext === null) {
    throw new TypeError('plan_context is required and cannot be omitted or null');
  }
  const specVerification = verifyApprovedArtifactGraph(approvedSpec);
  assertArtifactKind(approvedSpec, 'spec');

  let decisionCoverageMode = 'legacy-schema-v1';
  let decisionCoverageResult = null;
  let goalBackwardResult = null;
  let architectureMode = 'legacy-schema-v1';
  let architectureResult = null;
  let planVerification;
  if (typeof planContext !== 'object' || Array.isArray(planContext)) {
    throw new TypeError('plan_context must be an object');
  }
  const hasDecisionCoverage = Object.hasOwn(planContext, 'decision_coverage');
  const hasGoalBackwardReview = Object.hasOwn(planContext, 'goal_backward_review');
  const hasArchitectureGate = Object.hasOwn(planContext, 'architecture_gate');
  const hasArchitectureContext = Object.hasOwn(planContext, 'architecture_context');
  if (
    planContext.schema_version === 1 &&
    !hasDecisionCoverage &&
    !hasGoalBackwardReview &&
    !hasArchitectureGate &&
    !hasArchitectureContext
  ) {
    planVerification = verifyApprovedArtifactGraph(approvedPlan, [approvedSpec]);
  } else if (planContext.schema_version === 2) {
    if (!hasDecisionCoverage) {
      throw new Error('schema-v2 plan_context decision_coverage is required');
    }
    if (!hasGoalBackwardReview) {
      throw new Error('schema-v2 plan_context goal_backward_review is required');
    }
    if (!hasArchitectureGate) {
      throw new Error('schema-v2 plan_context architecture_gate is required');
    }
    if (!hasArchitectureContext) {
      throw new Error(
        'schema-v2 plan_context architecture_context is required; use null when not applicable',
      );
    }
    if (!isDeepStrictEqual(
      planContext.decision_coverage,
      planContext.goal_backward_review?.decision_coverage,
    )) {
      throw new Error(
        'schema-v2 plan_context decision_coverage must match goal_backward_review decision_coverage',
      );
    }
    decisionCoverageResult = assertDecisionCoverage(planContext.decision_coverage, {
      stage: 'execution',
    });
    goalBackwardResult = assertGoalBackwardPlan(planContext.goal_backward_review);
    decisionCoverageMode = 'strict-v2';
    architectureResult = validateArchitecturePlanHandoff({
      gate: planContext.architecture_gate,
      architecture_context: planContext.architecture_context,
      approved_spec: approvedSpec,
      approved_architecture: approvedArchitecture,
      approved_plan: approvedPlan,
      decision_coverage: planContext.decision_coverage,
      plan_context: planContext,
      repository_topology: repositoryPlan,
    });
    if (!architectureResult.valid) {
      throw new Error(
        `architecture handoff blocked:\n${architectureResult.blocker_messages.join('\n')}`,
      );
    }
    architectureMode = architectureResult.architecture_required
      ? 'required-approved'
      : 'not-applicable';
    planVerification = verifyApprovedArtifactGraph(
      approvedPlan,
      architectureResult.architecture_required ? [approvedArchitecture] : [approvedSpec],
    );
  } else if (
    hasDecisionCoverage ||
    hasGoalBackwardReview ||
    hasArchitectureGate ||
    hasArchitectureContext
  ) {
    throw new Error(
      'decision coverage, goal-backward review, and architecture fields require plan_context schema_version 2',
    );
  } else {
    throw new TypeError(`unsupported plan_context schema version: ${planContext.schema_version}`);
  }
  assertArtifactKind(approvedPlan, 'plan');

  const planOwner = planVerification.metadata.owner_repository_id;
  if (!ownerRevisions || typeof ownerRevisions !== 'object') {
    throw new TypeError('owner_revisions must map repository identities to current revisions');
  }
  if (ownerRevisions[planOwner] !== planVerification.metadata.source_revision) {
    throw new Error(
      `stale source for ${planOwner}: approved ${planVerification.metadata.source_revision}, current ${ownerRevisions[planOwner] ?? '<missing>'}`,
    );
  }

  const repositoryErrors = validateRepositoryPlan(repositoryPlan);
  if (repositoryErrors.length > 0) {
    throw new Error(
      `invalid repository plan:\n${repositoryErrors.map((error) => `- ${error}`).join('\n')}`,
    );
  }
  if (
    !repositoryPlan.repositories.some(
      ({ repository_id: repositoryId }) => repositoryId === planOwner,
    )
  ) {
    throw new Error(`owner mismatch: approved plan owner ${planOwner} is not in repository plan`);
  }
  for (const step of repositoryPlan.steps.filter(({ action }) => MUTABLE_ACTIONS.has(action))) {
    validateApprovedWriteScope(planVerification.metadata, step);
  }

  return {
    valid: true,
    track: resolveTrack(planVerification.metadata.track),
    stack_profile: planVerification.metadata.stack_profile,
    owner_repository_id: planOwner,
    integration_owner_repository_id: repositoryPlan.integration_owner_repository_id,
    approved_spec_hash: specVerification.approval_hash,
    approved_plan_hash: planVerification.approval_hash,
    decision_coverage_mode: decisionCoverageMode,
    decision_coverage: decisionCoverageResult,
    goal_backward_review: goalBackwardResult,
    architecture_mode: architectureMode,
    architecture_handoff: architectureResult,
    approved_architecture_hash:
      architectureMode === 'required-approved' ? approvedArchitecture.metadata.approval_hash : null,
    repository_plan: structuredClone(repositoryPlan),
  };
}

export function resolveExecutionTarget({ step, repositories }) {
  if (!step || typeof step !== 'object') throw new TypeError('step must be an object');
  if (!Array.isArray(repositories)) throw new TypeError('repositories must be an array');
  const owner = repositories.find(
    ({ repository_id: repositoryId }) => repositoryId === step.owner_repository_id,
  );
  if (!owner) {
    throw new Error(
      `missing owner repository ${step.owner_repository_id}; portal fallback is forbidden`,
    );
  }
  if (owner.available !== true || owner.writable !== true) {
    throw new Error(`owner repository ${owner.repository_id} is unavailable or not writable`);
  }
  return {
    owner_repository_id: owner.repository_id,
    owner_repository_role: owner.role,
    owner_module_id: owner.module_id ?? null,
    execute_in_repository_id: owner.repository_id,
  };
}

export function authorizePlanWrite({
  step,
  current_repository_id: currentRepositoryId,
  repository_relative_path: repositoryRelativePath,
  final_branch_ready: finalBranchReady,
  review_finding_selected: reviewFindingSelected = true,
}) {
  if (!step || typeof step !== 'object') throw new TypeError('step must be an object');
  if (!MUTABLE_ACTIONS.has(step.action)) {
    throw new Error(`plan step ${step.id ?? '<unknown>'} does not authorize a write`);
  }
  if (finalBranchReady === true) {
    throw new Error('writes are forbidden after final branch-ready until the finish gate is rerun');
  }
  if (reviewFindingSelected !== true) {
    throw new Error('an unselected review finding is not an authorized write');
  }
  requiredString(currentRepositoryId, 'current_repository_id');
  if (
    !Array.isArray(step.git_roots) ||
    step.git_roots.length !== 1 ||
    step.git_roots[0] !== step.owner_repository_id ||
    currentRepositoryId !== step.owner_repository_id
  ) {
    throw new Error(
      `wrong Git root for ${step.id ?? '<unknown>'}: expected ${step.owner_repository_id}, received ${currentRepositoryId}`,
    );
  }
  if (!Array.isArray(step.allowed_paths) || step.allowed_paths.length === 0) {
    throw new Error(`step ${step.id ?? '<unknown>'} has no allowed_paths`);
  }
  if (!Array.isArray(step.prohibited_paths)) {
    throw new Error(`step ${step.id ?? '<unknown>'} has no prohibited_paths`);
  }
  const normalizedPath = normalizeRepositoryPath(repositoryRelativePath);
  if (pathMatches(normalizedPath, step.prohibited_paths)) {
    throw new Error(`${normalizedPath} matches prohibited_paths`);
  }
  if (!pathMatches(normalizedPath, step.allowed_paths)) {
    throw new Error(`${normalizedPath} is outside allowed_paths`);
  }
  return {
    authorized: true,
    step_id: step.id,
    owner_repository_id: step.owner_repository_id,
    repository_relative_path: normalizedPath,
  };
}

export function evaluateWorkingTree({
  unrelated_dirty_paths: unrelatedDirtyPaths = [],
  intended_output_paths: intendedOutputPaths = [],
}) {
  if (!Array.isArray(unrelatedDirtyPaths) || !Array.isArray(intendedOutputPaths)) {
    throw new TypeError('working-tree path collections must be arrays');
  }
  const dirty = unrelatedDirtyPaths.map(normalizeRepositoryPath);
  const intended = intendedOutputPaths.map(normalizeRepositoryPath);
  const overlaps = intended.filter((path) => dirty.includes(path));
  return {
    status: dirty.length === 0 ? 'clear' : 'decision-required',
    unrelated_dirty_paths: dirty,
    intended_dirty_overlaps: overlaps,
    write_authorized: dirty.length === 0,
  };
}

export function selectExecutionMode({
  units,
  parallel_capability: parallelCapability,
  isolation_safe: isolationSafe,
  ownership_disjoint: ownershipDisjoint,
}) {
  if (!Array.isArray(units) || units.length === 0) {
    throw new TypeError('units must be a non-empty array');
  }
  if (units.length === 1) {
    return { mode: 'sequential', reason: 'single executable unit' };
  }
  if (!PARALLEL_CAPABILITIES.has(parallelCapability)) {
    return {
      mode: 'sequential',
      reason: `parallel capability is ${parallelCapability ?? 'unknown'}`,
    };
  }
  if (
    isolationSafe !== true ||
    ownershipDisjoint !== true ||
    units.some(({ depends_on: dependsOn }) => (dependsOn ?? []).length > 0)
  ) {
    return {
      mode: 'sequential',
      reason: 'parallel isolation, ownership, or dependency safety is not satisfied',
    };
  }
  return {
    mode: 'choice-required',
    reason: 'sequential and parallel execution are both feasible',
  };
}
