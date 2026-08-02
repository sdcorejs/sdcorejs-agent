import { resolveRequirementOwnership } from '../shared/repository-contract.mjs';
import { systemRegistry } from '../shared/system-registry.mjs';

const ANGULAR_PROJECT_PROFILES = new Set([
  'core-ui-angular',
  'legacy-core-ui-angular',
  'migration-request',
]);
const EXECUTION_PROFILES = new Set(['developer', 'technical-prototype']);
const OPTIONAL_FEATURES = new Set([
  'admin',
  'auth',
  'account',
  'role',
  'permission',
  'tenant',
  'department',
  'seed-data',
  'extra-screens',
]);

function nonEmpty(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function blocked(blockers, identity = {}) {
  return {
    status: 'blocked',
    production_eligible: false,
    owner_repository_id: identity.owner_repository_id ?? null,
    owner_repository_role: identity.owner_repository_role ?? null,
    owner_module_id: identity.owner_module_id ?? null,
    execution_host_repository_id: identity.execution_host_repository_id ?? null,
    write_target: null,
    approved_optional_features: [],
    blockers,
  };
}

function validateProfile(profile, field) {
  if (!systemRegistry.stack_profiles.some(({ id }) => id === profile)) {
    return `${field} is not declared in _refs/shared/system-registry.json: ${profile}`;
  }
  return null;
}

export function resolveAngularExecution(request) {
  const projectProfile = request?.project_profile;
  const executionProfile = request?.execution_profile;
  const executionHostRepositoryId = request?.execution_host_repository_id;
  const profileErrors = [
    validateProfile(projectProfile, 'project_profile'),
    validateProfile(executionProfile, 'execution_profile'),
  ].filter(Boolean);
  if (profileErrors.length > 0) return blocked(profileErrors);
  if (!ANGULAR_PROJECT_PROFILES.has(projectProfile)) {
    return blocked([
      `${projectProfile} is not eligible for the SDCoreJS Angular executor`,
    ]);
  }
  if (!EXECUTION_PROFILES.has(executionProfile)) {
    return blocked([
      `${executionProfile} is not an Angular implementation execution profile`,
    ]);
  }
  if (!nonEmpty(executionHostRepositoryId)) {
    return blocked(['execution_host_repository_id is required']);
  }

  if (
    executionProfile === 'technical-prototype' &&
    request.explicit_profile_approval !== true
  ) {
    return blocked([
      'technical-prototype requires explicit profile approval and is never inferred from a role or vague request',
    ]);
  }
  if (
    executionProfile === 'technical-prototype' &&
    (!Array.isArray(request.prototype_assumptions) ||
      request.prototype_assumptions.length === 0)
  ) {
    return blocked([
      'technical-prototype requires at least one recorded prototype assumption',
    ]);
  }

  const requestedOptional = new Set(request.requested_optional_features ?? []);
  const approvedOptional = new Set(request.approved_optional_features ?? []);
  const unknown = [...requestedOptional].filter((feature) => !OPTIONAL_FEATURES.has(feature));
  if (unknown.length > 0) {
    return blocked([`unknown optional Angular features: ${unknown.join(', ')}`]);
  }
  const unapproved = [...requestedOptional].filter((feature) => !approvedOptional.has(feature));
  if (unapproved.length > 0) {
    return blocked([
      `optional Angular features require approved requirement/profile scope: ${unapproved.join(', ')}`,
    ]);
  }
  if (requestedOptional.has('seed-data') && executionProfile !== 'technical-prototype') {
    return blocked(['seed-data is available only to an explicitly approved technical-prototype']);
  }

  let identity;
  if (request.scope === 'module') {
    identity = resolveRequirementOwnership({
      topology: request.topology,
      requested_module: request.requested_module,
      execution_host_repository_id: executionHostRepositoryId,
    });
    if (identity.status !== 'resolved') return blocked(identity.blockers, identity);
  } else if (request.scope === 'application') {
    if (!nonEmpty(request.application?.repository_id)) {
      return blocked([
        'application.repository_id is required; portal fallback is forbidden',
      ]);
    }
    identity = {
      owner_repository_id: request.application.repository_id,
      owner_repository_role: request.application.role ?? 'standalone',
      owner_module_id: null,
      execution_host_repository_id: executionHostRepositoryId,
      write_target: request.application.repository_id,
    };
  } else if (request.scope === 'portal-composition') {
    if (!nonEmpty(request.portal?.repository_id)) {
      return blocked(['portal.repository_id is required for portal-composition']);
    }
    identity = {
      owner_repository_id: request.portal.repository_id,
      owner_repository_role: 'portal',
      owner_module_id: null,
      execution_host_repository_id: executionHostRepositoryId,
      write_target: request.portal.repository_id,
    };
  } else {
    return blocked([`unsupported Angular ownership scope: ${request.scope}`]);
  }

  return {
    status: 'resolved',
    production_eligible: executionProfile === 'developer',
    project_profile: projectProfile,
    execution_profile: executionProfile,
    ...identity,
    approved_optional_features: [...requestedOptional].sort(),
    blockers: [],
  };
}

export const angularOptionalFeatures = Object.freeze([...OPTIONAL_FEATURES].sort());
