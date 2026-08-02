import { resolveRequirementOwnership } from '../shared/repository-contract.mjs';
import { systemRegistry } from '../shared/system-registry.mjs';

const FEATURES = new Set([
  'init-site',
  'theme',
  'pages',
  'responsive',
  'seo-basic',
  'seo-advanced',
  'og-preview',
  'i18n',
  'caching',
  'contact-form',
  'analytics',
  'cms-integration',
  'content-quality',
]);

const WEBSITE_PROFILES = Object.freeze({
  basic: Object.freeze(['init-site', 'theme', 'pages', 'responsive']),
  standard: Object.freeze([
    'init-site',
    'theme',
    'pages',
    'responsive',
    'seo-basic',
    'og-preview',
    'caching',
  ]),
  full: Object.freeze([
    'init-site',
    'theme',
    'pages',
    'responsive',
    'seo-basic',
    'seo-advanced',
    'og-preview',
    'i18n',
    'caching',
    'contact-form',
    'content-quality',
  ]),
});

function nonEmpty(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function blocked(blockers, identity = {}) {
  return {
    status: 'blocked',
    production_eligible: false,
    registry_version: systemRegistry.registry_version,
    owner_repository_id: identity.owner_repository_id ?? null,
    owner_repository_role: identity.owner_repository_role ?? null,
    owner_module_id: identity.owner_module_id ?? null,
    execution_host_repository_id: identity.execution_host_repository_id ?? null,
    write_target: null,
    approved_features: [],
    blockers,
  };
}

function knownRegistryProfile(profile, field) {
  return systemRegistry.stack_profiles.some(({ id }) => id === profile)
    ? null
    : `${field} is not declared in _refs/shared/system-registry.json: ${profile}`;
}

export function resolveNextjsExecution(request) {
  const profileErrors = [
    knownRegistryProfile(request?.project_profile, 'project_profile'),
    knownRegistryProfile(request?.execution_profile, 'execution_profile'),
  ].filter(Boolean);
  if (profileErrors.length > 0) return blocked(profileErrors);
  if (request.project_profile !== 'nextjs-build-website') {
    return blocked([
      `${request.project_profile} is not eligible for build-website assumptions`,
    ]);
  }
  if (!['developer', 'technical-prototype'].includes(request.execution_profile)) {
    return blocked([
      `${request.execution_profile} is not a Next.js implementation execution profile`,
    ]);
  }
  if (request.explicit_profile_approval !== true) {
    return blocked(['website_profile requires explicit profile approval']);
  }
  const profileFeatures = WEBSITE_PROFILES[request.website_profile];
  if (!profileFeatures) {
    return blocked([`unknown website_profile: ${request.website_profile}`]);
  }
  if (!nonEmpty(request.execution_host_repository_id)) {
    return blocked(['execution_host_repository_id is required']);
  }

  const requested = new Set(request.requested_features ?? []);
  const requirementApproved = new Set(request.approved_requirement_features ?? []);
  const unknown = [...requested].filter((feature) => !FEATURES.has(feature));
  if (unknown.length > 0) {
    return blocked([`unknown Next.js features: ${unknown.join(', ')}`]);
  }
  const profileApproved = new Set(profileFeatures);
  const unapproved = [...requested].filter(
    (feature) => !profileApproved.has(feature) && !requirementApproved.has(feature),
  );
  if (unapproved.length > 0) {
    return blocked([
      `Next.js features are outside approved scope: ${unapproved.join(', ')}`,
    ]);
  }

  let identity;
  if (request.scope === 'module') {
    identity = resolveRequirementOwnership({
      topology: request.topology,
      requested_module: request.requested_module,
      execution_host_repository_id: request.execution_host_repository_id,
    });
    if (identity.status !== 'resolved') return blocked(identity.blockers, identity);
  } else if (request.scope === 'site') {
    if (!nonEmpty(request.site?.repository_id)) {
      return blocked(['site.repository_id is required; portal fallback is forbidden']);
    }
    identity = {
      owner_repository_id: request.site.repository_id,
      owner_repository_role: request.site.role ?? 'standalone',
      owner_module_id: null,
      execution_host_repository_id: request.execution_host_repository_id,
      write_target: request.site.repository_id,
    };
  } else if (request.scope === 'portal-composition') {
    if (!nonEmpty(request.portal?.repository_id)) {
      return blocked([
        'portal.repository_id is required when portal-composition is the explicit owner',
      ]);
    }
    identity = {
      owner_repository_id: request.portal.repository_id,
      owner_repository_role: 'portal',
      owner_module_id: null,
      execution_host_repository_id: request.execution_host_repository_id,
      write_target: request.portal.repository_id,
    };
  } else {
    return blocked([`unsupported Next.js ownership scope: ${request.scope}`]);
  }

  return {
    status: 'resolved',
    production_eligible: request.execution_profile === 'developer',
    registry_version: systemRegistry.registry_version,
    artifact_identity: {
      track: 'nextjs',
      stack_profile: request.project_profile,
      execution_profile: request.execution_profile,
      owner_repository_id: identity.owner_repository_id,
      owner_module_id: identity.owner_module_id,
    },
    project_profile: request.project_profile,
    execution_profile: request.execution_profile,
    website_profile: request.website_profile,
    ...identity,
    approved_features: [...requested].sort(),
    blockers: [],
  };
}

export const nextjsWebsiteProfiles = WEBSITE_PROFILES;
export const nextjsFeatures = Object.freeze([...FEATURES].sort());
