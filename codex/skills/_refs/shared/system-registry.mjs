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
