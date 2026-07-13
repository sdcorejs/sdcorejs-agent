import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const generatorRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const refsRoot = path.resolve(generatorRoot, '..');

export async function loadContract() {
  const [manifest, profiles] = await Promise.all([
    readFile(path.join(refsRoot, 'pack-manifest.json'), 'utf8').then(JSON.parse),
    readFile(path.join(refsRoot, 'profile-contract.json'), 'utf8').then(JSON.parse),
  ]);
  if (manifest.schemaVersion !== 1 || profiles.schemaVersion !== 1) {
    throw new Error('Unsupported NestJS pack contract version.');
  }
  const manifestProfiles = Object.keys(manifest.profiles).sort();
  const contractProfiles = Object.keys(profiles.profiles).sort();
  if (JSON.stringify(manifestProfiles) !== JSON.stringify(contractProfiles)) {
    throw new Error('Manifest and profile contract disagree.');
  }
  return { manifest, profiles };
}
export function resolveProfile(contract, requestedProfile) {
  const profile = requestedProfile || contract.profiles.defaultProfile;
  if (!Object.hasOwn(contract.profiles.profiles, profile)) {
    throw new Error(`Unknown profile: ${profile}`);
  }
  return Object.freeze({
    name: profile,
    shared: structuredClone(contract.profiles.shared),
    rules: structuredClone(contract.profiles.profiles[profile]),
  });
}
