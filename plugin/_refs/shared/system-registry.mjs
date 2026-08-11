import { readFileSync } from 'node:fs';

export const SYSTEM_REGISTRY_PATH = '_refs/shared/system-registry.json';
export const systemRegistry = Object.freeze(
  JSON.parse(readFileSync(new URL('./system-registry.json', import.meta.url), 'utf8')),
);

const REQUIRED_TRACK_FIELDS = [
  'id',
  'executor',
  'review_profile',
  'repair_supported',
  'ship_supported',
];

function findDuplicates(values) {
  const seen = new Set();
  return [...new Set(values.filter((value) => seen.size === seen.add(value).size))];
}

export function validateSystemRegistry(registry = systemRegistry) {
  const errors = [];
  if (registry?.schema_version !== 1) {
    errors.push('system registry schema_version must be 1');
  }
  if (!/^\d+\.\d+\.\d+$/u.test(registry?.registry_version ?? '')) {
    errors.push('system registry registry_version must be semantic version text');
  }
  if (!Array.isArray(registry?.tracks) || registry.tracks.length === 0) {
    errors.push('system registry tracks must be a non-empty array');
    return errors;
  }
  for (const [index, track] of registry.tracks.entries()) {
    for (const field of REQUIRED_TRACK_FIELDS) {
      if (!(field in track)) errors.push(`tracks[${index}] is missing ${field}`);
    }
    if (typeof track.repair_supported !== 'boolean') {
      errors.push(`tracks[${index}].repair_supported must be boolean`);
    }
    if (typeof track.ship_supported !== 'boolean') {
      errors.push(`tracks[${index}].ship_supported must be boolean`);
    }
  }
  for (const duplicate of findDuplicates(registry.tracks.map(({ id }) => id))) {
    errors.push(`duplicate track id: ${duplicate}`);
  }
  const trackIds = new Set(registry.tracks.map(({ id }) => id));
  for (const [alias, target] of Object.entries(registry.aliases ?? {})) {
    if (trackIds.has(alias)) errors.push(`track alias conflicts with canonical track: ${alias}`);
    if (!trackIds.has(target)) errors.push(`track alias ${alias} targets unknown track: ${target}`);
  }
  const fallback = registry.generic_harness_fallback;
  if (!trackIds.has(fallback?.track)) errors.push('generic harness fallback track is unknown');
  if (typeof fallback?.executor !== 'string') errors.push('generic harness fallback executor is missing');
  for (const field of [
    'stack_profiles',
    'artifact_kinds',
    'review_dimensions',
    'consistency_finding_kinds',
    'convention_rule_statuses',
    'convention_enforcement_levels',
    'convention_source_kinds',
    'convention_capture_modes',
    'convention_scope_kinds',
    'repository_roles',
    'ownership_scopes',
    'evidence_classes',
    'evidence_results',
    'executable_reference_classes',
  ]) {
    if (!Array.isArray(registry[field]) || registry[field].length === 0) {
      errors.push(`${field} must be a non-empty array`);
    }
  }
  errors.push(...validateArtifactRoots(registry));
  errors.push(...validateReviewDimensions(registry));
  errors.push(...validateConventionVocabulary(registry));
  return errors;
}

const CONSISTENCY_SCOPES = new Set([
  'complete',
  'applicable',
  'structural',
  'dimension-affecting-only',
]);

/**
 * `review_dimensions` is the single authoritative dimension enum. Skills and
 * contracts read it instead of restating a local list, so `consistency` cannot
 * drift between the review skill, the review contract, and the mirrors.
 */
function validateReviewDimensions(registry) {
  const errors = [];
  const dimensions = registry?.review_dimensions;
  if (!Array.isArray(dimensions) || dimensions.length === 0) return errors;
  for (const [index, dimension] of dimensions.entries()) {
    if (typeof dimension?.id !== 'string' || dimension.id === '') {
      errors.push(`review_dimensions[${index}].id must be text`);
    }
    if (!CONSISTENCY_SCOPES.has(dimension?.consistency_scope)) {
      errors.push(
        `review_dimensions[${index}].consistency_scope must be one of ${[...CONSISTENCY_SCOPES].join(', ')}`,
      );
    }
  }
  for (const duplicate of findDuplicates(dimensions.map(({ id }) => id))) {
    errors.push(`duplicate review dimension id: ${duplicate}`);
  }
  for (const required of ['code', 'architecture', 'consistency', 'ALL']) {
    if (!dimensions.some(({ id }) => id === required)) {
      errors.push(`review_dimensions must declare ${required}`);
    }
  }
  return errors;
}

/**
 * Convention vocabularies live beside the tracks they govern so the convention
 * contract never grows a second copy of the registry.
 */
function validateConventionVocabulary(registry) {
  const errors = [];
  if (!registry?.artifact_kinds?.includes('architecture')) {
    errors.push('artifact_kinds must declare the architecture artifact kind');
  }
  if (!registry?.artifact_kinds?.includes('convention')) {
    errors.push('artifact_kinds must declare the convention artifact kind');
  }
  const scopeKinds = registry?.convention_scope_kinds ?? [];
  const ownershipScopes = new Set(registry?.ownership_scopes ?? []);
  for (const scope of scopeKinds) {
    if (!ownershipScopes.has(scope)) {
      errors.push(`convention_scope_kinds.${scope} must also be a declared ownership scope`);
    }
  }
  return errors;
}

const REQUIRED_ARTIFACT_ROOTS = [
  'product_documents',
  'product_ledger',
  'design_artifacts',
  'design_ledger',
  'documentation',
  'architecture',
  'conventions',
];
const REQUIRED_LEGACY_ARTIFACT_ROOTS = ['product_documents', 'design_artifacts'];

function validateArtifactRoots(registry) {
  const errors = [];
  const roots = registry?.artifact_roots;
  const legacyRoots = registry?.legacy_artifact_roots;
  if (!roots || typeof roots !== 'object' || Array.isArray(roots)) {
    errors.push('artifact_roots must be an object of canonical repository-relative roots');
  } else {
    for (const key of REQUIRED_ARTIFACT_ROOTS) {
      const value = roots[key];
      if (typeof value !== 'string' || !value.startsWith('.sdcorejs/')) {
        errors.push(`artifact_roots.${key} must be a repository-relative path under .sdcorejs/`);
      } else if (value.endsWith('/')) {
        errors.push(`artifact_roots.${key} must not end with a path separator`);
      }
    }
  }
  if (!legacyRoots || typeof legacyRoots !== 'object' || Array.isArray(legacyRoots)) {
    errors.push('legacy_artifact_roots must be an object of read-only compatibility roots');
    return errors;
  }
  for (const key of REQUIRED_LEGACY_ARTIFACT_ROOTS) {
    const value = legacyRoots[key];
    if (typeof value !== 'string' || value === '' || value.includes('/')) {
      errors.push(
        `legacy_artifact_roots.${key} must be a single repository-relative directory name`,
      );
      continue;
    }
    if (value.startsWith('.sdcorejs')) {
      errors.push(`legacy_artifact_roots.${key} must not be a canonical .sdcorejs root`);
    }
  }
  return errors;
}

export function resolveTrack(input, registry = systemRegistry) {
  const errors = validateSystemRegistry(registry);
  if (errors.length > 0) {
    throw new Error(`invalid system registry:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  }
  const requested = String(input ?? '').trim().toLowerCase();
  const canonicalId = registry.aliases[requested] ?? requested;
  const track = registry.tracks.find(({ id }) => id === canonicalId);
  if (track) {
    return {
      ...structuredClone(track),
      requested_track: requested,
      resolved_by: requested === canonicalId ? 'canonical' : 'alias',
    };
  }
  return {
    ...structuredClone(registry.generic_harness_fallback),
    id: registry.generic_harness_fallback.track,
    requested_track: requested,
    resolved_by: 'generic-harness-fallback',
  };
}
