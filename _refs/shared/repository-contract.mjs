const ABSOLUTE_WINDOWS_PATH = /^[A-Za-z]:[\\/]/u;
const GIT_REVISION = /^[a-f0-9]{40}$/u;
const RESULTS = new Set([
  'PASSED',
  'FAILED',
  'SKIPPED',
  'NOT APPLICABLE',
  'NOT RUN',
]);
const E2E_AVAILABILITY = new Set(['available', 'not-applicable', 'uninitialized']);

function requiredString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${field} must be a non-empty string`);
  }
}

function assertRepositoryRelative(value, field) {
  requiredString(value, field);
  if (
    value.startsWith('/') ||
    value.startsWith('\\') ||
    ABSOLUTE_WINDOWS_PATH.test(value) ||
    value.split(/[\\/]/u).includes('..')
  ) {
    throw new TypeError(`${field} must be repository-relative`);
  }
}

function normalizeRemoteUrl(remoteUrl) {
  return remoteUrl
    .trim()
    .replace(/^git@([^:]+):/u, 'https://$1/')
    .replace(/^ssh:\/\/git@/u, 'https://')
    .replace(/^git\+/u, '')
    .replace(/\.git\/?$/u, '')
    .replace(/\/+$/u, '');
}

export function stableRepositoryId({ remote_url: remoteUrl }) {
  requiredString(remoteUrl, 'remote_url');
  let parsed;
  try {
    parsed = new URL(normalizeRemoteUrl(remoteUrl));
  } catch {
    throw new TypeError(`unsupported repository remote URL: ${remoteUrl}`);
  }
  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.replace(/^\/+/u, '').toLowerCase();
  if (!hostname || pathname.split('/').length < 2) {
    throw new TypeError(`repository remote URL lacks owner/name identity: ${remoteUrl}`);
  }
  return `${hostname}/${pathname}`;
}

export function resolveArtifactOwner({
  artifact_kind: artifactKind,
  scope,
  module,
  portal,
  execution_host_repository_id: executionHostRepositoryId,
}) {
  requiredString(artifactKind, 'artifact_kind');
  requiredString(scope, 'scope');
  requiredString(executionHostRepositoryId, 'execution_host_repository_id');
  if (scope === 'module') {
    requiredString(module?.id, 'module.id');
    requiredString(module?.repository_id, 'module.repository_id');
    return {
      artifact_kind: artifactKind,
      owner_repository_id: module.repository_id,
      owner_repository_role: 'module',
      owner_module_id: module.id,
      execution_host_repository_id: executionHostRepositoryId,
    };
  }
  if (scope === 'portal-composition' || scope === 'cross-repository-aggregate') {
    requiredString(portal?.repository_id, 'portal.repository_id');
    return {
      artifact_kind: artifactKind,
      owner_repository_id: portal.repository_id,
      owner_repository_role: 'portal',
      owner_module_id: null,
      execution_host_repository_id: executionHostRepositoryId,
    };
  }
  throw new TypeError(`unsupported ownership scope: ${scope}`);
}

export function resolveRequirementOwnership({
  topology,
  requested_module: requestedModule,
  execution_host_repository_id: executionHostRepositoryId,
}) {
  requiredString(requestedModule, 'requested_module');
  requiredString(executionHostRepositoryId, 'execution_host_repository_id');
  if (!topology || !Array.isArray(topology.modules)) {
    throw new TypeError('topology.modules must be an array');
  }
  const normalizedRequest = requestedModule.trim().toLowerCase();
  const matches = topology.modules.filter((module) => {
    const identities = [module.module_id, ...(module.aliases ?? [])]
      .filter((value) => typeof value === 'string')
      .map((value) => value.toLowerCase());
    return identities.includes(normalizedRequest);
  });
  if (matches.length !== 1) {
    return {
      status: 'blocked',
      owner_repository_id: null,
      owner_repository_role: 'module',
      owner_module_id: null,
      execution_host_repository_id: executionHostRepositoryId,
      write_target: null,
      blockers: [
        matches.length === 0
          ? `module mapping is missing for ${requestedModule}; portal fallback is forbidden`
          : `module mapping is ambiguous for ${requestedModule}: ${matches
              .map(({ module_id: moduleId }) => moduleId)
              .join(', ')}`,
      ],
    };
  }
  const [owner] = matches;
  const base = {
    owner_repository_id: owner.repository_id,
    owner_repository_role: owner.role ?? 'module',
    owner_module_id: owner.module_id,
    execution_host_repository_id: executionHostRepositoryId,
  };
  if (owner.available !== true || owner.writable !== true) {
    return {
      status: 'blocked',
      ...base,
      write_target: null,
      blockers: [
        owner.available !== true
          ? `owner repository is unavailable for ${owner.module_id}`
          : `owner repository is not writable for ${owner.module_id}`,
      ],
    };
  }
  return {
    status: 'resolved',
    ...base,
    write_target: owner.repository_id,
    blockers: [],
  };
}

export function assertOwnerWriteTarget({
  owner_repository_id: ownerRepositoryId,
  current_repository_id: currentRepositoryId,
  repository_relative_path: repositoryRelativePath,
}) {
  requiredString(ownerRepositoryId, 'owner_repository_id');
  requiredString(currentRepositoryId, 'current_repository_id');
  assertRepositoryRelative(repositoryRelativePath, 'repository_relative_path');
  if (ownerRepositoryId !== currentRepositoryId) {
    throw new Error(
      `wrong repository root: ${repositoryRelativePath} belongs to ${ownerRepositoryId}, not ${currentRepositoryId}`,
    );
  }
  return true;
}

export function validateModuleE2EManifest(manifest) {
  if (manifest?.schema_version !== 1) {
    throw new TypeError(`unsupported module E2E manifest schema version: ${manifest?.schema_version}`);
  }
  requiredString(manifest.module_id, 'module_id');
  requiredString(manifest.repository_id, 'repository_id');
  if (!manifest.e2e || typeof manifest.e2e !== 'object') {
    throw new TypeError('e2e must be an object');
  }
  const availability = manifest.e2e.availability;
  if (!['available', 'not-applicable', 'uninitialized'].includes(availability)) {
    throw new TypeError(`unsupported e2e availability: ${availability}`);
  }
  if (availability === 'available') {
    requiredString(manifest.e2e.runner, 'e2e.runner');
    if (
      !Array.isArray(manifest.e2e.command) ||
      manifest.e2e.command.length === 0 ||
      manifest.e2e.command.some((part) => typeof part !== 'string' || part === '')
    ) {
      throw new TypeError('e2e.command must be a non-empty argument array');
    }
    for (const field of ['working_directory', 'config_path', 'evidence_path']) {
      assertRepositoryRelative(manifest.e2e[field], `e2e.${field}`);
    }
    for (const field of ['capabilities', 'required_portal_capabilities', 'persona_refs']) {
      if (!Array.isArray(manifest.e2e[field])) {
        throw new TypeError(`e2e.${field} must be an array`);
      }
    }
  }
  return structuredClone(manifest);
}

export function validateEvidenceFreshness({
  module_revision: moduleRevision,
  portal_pinned_module_revision: portalPinnedModuleRevision,
}) {
  if (!GIT_REVISION.test(moduleRevision) || !GIT_REVISION.test(portalPinnedModuleRevision)) {
    throw new TypeError('evidence revisions must be lowercase 40-character Git revisions');
  }
  return {
    status: moduleRevision === portalPinnedModuleRevision ? 'fresh' : 'stale',
    module_revision: moduleRevision,
    portal_pinned_module_revision: portalPinnedModuleRevision,
  };
}

export function aggregateModuleE2E({ portal_revision: portalRevision, module_runs: moduleRuns }) {
  if (!GIT_REVISION.test(portalRevision)) {
    throw new TypeError('portal_revision must be a lowercase 40-character Git revision');
  }
  if (!Array.isArray(moduleRuns) || moduleRuns.length === 0) {
    throw new TypeError('module_runs must be a non-empty array');
  }
  const modules = moduleRuns.map((run) => {
    const manifest = run.manifest ? validateModuleE2EManifest(run.manifest) : null;
    const moduleId = manifest?.module_id ?? run.module_id;
    const repositoryId = manifest?.repository_id ?? run.repository_id;
    requiredString(moduleId, 'module_id');
    requiredString(repositoryId, 'repository_id');
    if (!RESULTS.has(run.result)) {
      throw new TypeError(`unsupported module E2E result: ${run.result}`);
    }
    const availability = manifest?.e2e.availability ?? run.e2e_availability;
    if (!E2E_AVAILABILITY.has(availability)) {
      throw new TypeError(`unsupported module E2E availability: ${availability}`);
    }
    if (availability === 'available' && run.result === 'NOT APPLICABLE') {
      throw new Error(`${moduleId} is available and cannot be NOT APPLICABLE`);
    }
    if (availability === 'not-applicable' && run.result !== 'NOT APPLICABLE') {
      throw new Error(`${moduleId} must report NOT APPLICABLE`);
    }
    if (availability === 'uninitialized' && run.result !== 'NOT RUN') {
      throw new Error(`${moduleId} is uninitialized and must report NOT RUN`);
    }
    const record = {
      module_id: moduleId,
      repository_id: repositoryId,
      e2e_availability: availability,
      result: run.result,
      portal_revision: portalRevision,
      module_revision: run.module_revision ?? null,
      portal_pinned_module_revision: run.portal_pinned_module_revision ?? null,
      actual_command: run.actual_command ?? null,
    };
    if (run.result === 'PASSED') {
      if (!manifest || availability !== 'available') {
        throw new Error(`${moduleId} cannot pass without an available validated manifest`);
      }
      if (
        JSON.stringify(run.actual_command) !== JSON.stringify(manifest.e2e.command)
      ) {
        throw new Error(`${moduleId} actual command does not match its manifest`);
      }
      const freshness = validateEvidenceFreshness(record);
      if (freshness.status !== 'fresh') {
        throw new Error(`${moduleId} evidence is stale`);
      }
    }
    return record;
  });
  return {
    schema_version: 1,
    portal_revision: portalRevision,
    modules,
    full_e2e_satisfied: modules.every(
      ({ e2e_availability: availability, result }) =>
        (availability === 'available' && result === 'PASSED') ||
        (availability === 'not-applicable' && result === 'NOT APPLICABLE'),
    ),
  };
}

const MUTABLE_PLAN_ACTIONS = new Set(['CREATE', 'EDIT', 'VERIFY-THEN-EDIT']);

export function validateRepositoryPlan(plan) {
  const errors = [];
  if (plan?.schema_version !== 1) errors.push('repository plan schema_version must be 1');
  if (!Array.isArray(plan?.repositories) || plan.repositories.length === 0) {
    return [...errors, 'repository plan repositories must be a non-empty array'];
  }
  const repositories = new Map();
  for (const repository of plan.repositories) {
    if (repositories.has(repository.repository_id)) {
      errors.push(`duplicate repository plan identity: ${repository.repository_id}`);
    }
    repositories.set(repository.repository_id, repository);
  }
  if (!repositories.has(plan.integration_owner_repository_id)) {
    errors.push('integration owner repository is not declared');
  }
  if (!Array.isArray(plan.dependency_order)) {
    errors.push('dependency_order must be an array');
  }
  if (typeof plan.gitlink_updates_in_scope !== 'boolean') {
    errors.push('gitlink_updates_in_scope must be boolean');
  }
  if (!Array.isArray(plan.steps) || plan.steps.length === 0) {
    return [...errors, 'repository plan steps must be a non-empty array'];
  }
  const stepIds = new Set(plan.steps.map(({ id }) => id));
  if (stepIds.size !== plan.steps.length) errors.push('repository plan step ids must be unique');
  for (const step of plan.steps) {
    const repository = repositories.get(step.owner_repository_id);
    if (!repository) {
      errors.push(`${step.id} owner repository is not declared`);
      continue;
    }
    if (MUTABLE_PLAN_ACTIONS.has(step.action)) {
      if (
        !Array.isArray(step.git_roots) ||
        step.git_roots.length !== 1 ||
        step.git_roots[0] !== step.owner_repository_id
      ) {
        errors.push(`${step.id} mutable step must have exactly one Git root matching its owner`);
      }
      if (!Array.isArray(step.allowed_paths) || !Array.isArray(step.prohibited_paths)) {
        errors.push(`${step.id} mutable step must declare allowed_paths and prohibited_paths`);
      }
    }
    if (step.semantic_scope === 'module' && repository.role !== 'module') {
      errors.push(`${step.id} module-owned plan step cannot be written to ${repository.role}`);
    }
    for (const dependency of step.depends_on ?? []) {
      if (!stepIds.has(dependency)) errors.push(`${step.id} depends on unknown step ${dependency}`);
    }
  }
  return errors;
}

export function splitRepositoryPlan(plan) {
  const errors = validateRepositoryPlan(plan);
  if (errors.length > 0) {
    throw new Error(`invalid repository plan:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  }
  const repositoryPlans = plan.repositories
    .map((repository) => ({
      schema_version: 1,
      repository_id: repository.repository_id,
      repository_role: repository.role,
      module_id: repository.module_id ?? null,
      integration_owner_repository_id: plan.integration_owner_repository_id,
      gitlink_updates_in_scope: plan.gitlink_updates_in_scope,
      dependency_order: [...plan.dependency_order],
      steps: plan.steps
        .filter(({ owner_repository_id: ownerRepositoryId }) =>
          ownerRepositoryId === repository.repository_id,
        )
        .map((step) => structuredClone(step)),
    }))
    .filter(({ steps }) => steps.length > 0);
  const integrationPlan = repositoryPlans.find(
    ({ repository_id: repositoryId }) =>
      repositoryId === plan.integration_owner_repository_id,
  );
  return {
    schema_version: 1,
    repository_plans: repositoryPlans,
    parent_integration_plan: integrationPlan
      ? {
          repository_id: integrationPlan.repository_id,
          repository_role: integrationPlan.repository_role,
          step_ids: integrationPlan.steps.map(({ id }) => id),
          child_repository_ids: repositoryPlans
            .map(({ repository_id: repositoryId }) => repositoryId)
            .filter((repositoryId) => repositoryId !== integrationPlan.repository_id),
        }
      : null,
  };
}
