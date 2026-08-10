import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const registry = JSON.parse(
  readFileSync(new URL('./system-registry.json', import.meta.url), 'utf8'),
);

export const APPROVAL_ALGORITHM = 'sha256:v1';
const APPROVAL_SCHEMA_VERSION = 1;
const HEX_40 = /^[a-f0-9]{40}$/u;
const APPROVAL_HASH = /^sha256:v1:[a-f0-9]{64}$/u;

function normalizeText(value) {
  return value.replace(/\r\n?/gu, '\n').normalize('NFC');
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return typeof value === 'string' ? normalizeText(value) : value;
}

function stableJson(value) {
  return JSON.stringify(canonicalize(value));
}

function requiredString(metadata, field) {
  if (typeof metadata[field] !== 'string' || metadata[field].trim() === '') {
    throw new TypeError(`${field} must be a non-empty string`);
  }
}

function validateRelativePath(value, field) {
  requiredString({ [field]: value }, field);
  if (
    value.startsWith('/') ||
    value.startsWith('\\') ||
    /^[A-Za-z]:[\\/]/u.test(value) ||
    value.split(/[\\/]/u).includes('..')
  ) {
    throw new TypeError(`${field} must be repository-relative`);
  }
}

function normalizeScopePattern(value, field) {
  requiredString({ [field]: value }, field);
  const raw = value.trim().replaceAll('\\', '/').replace(/^\.\/+/u, '');
  if (
    raw.includes('\0') ||
    path.posix.isAbsolute(raw) ||
    /^[A-Za-z]:\//u.test(raw) ||
    raw.split('/').includes('..')
  ) {
    throw new TypeError(`${field} must remain repository-relative`);
  }
  return path.posix.normalize(raw);
}

function scopePatternCovers(container, candidate) {
  if (container === candidate || container === '**') return true;
  if (container.endsWith('/**')) {
    const prefix = container.slice(0, -3).replace(/\/+$/u, '');
    return candidate.startsWith(`${prefix}/`);
  }
  return false;
}

export function validateApprovedWriteScope(
  approvedMetadata,
  {
    allowed_paths: requestedAllowedPaths,
    prohibited_paths: requestedProhibitedPaths,
  } = {},
) {
  if (approvedMetadata?.artifact_kind !== 'plan') {
    throw new TypeError('approved write scope requires plan metadata');
  }
  if (
    !Array.isArray(approvedMetadata.allowed_paths) ||
    approvedMetadata.allowed_paths.length === 0 ||
    !Array.isArray(approvedMetadata.prohibited_paths)
  ) {
    throw new TypeError('approved plan metadata requires allowed_paths and prohibited_paths');
  }
  if (
    !Array.isArray(requestedAllowedPaths) ||
    requestedAllowedPaths.length === 0 ||
    !Array.isArray(requestedProhibitedPaths)
  ) {
    throw new TypeError('requested write scope requires allowed_paths and prohibited_paths');
  }

  const approvedAllowed = approvedMetadata.allowed_paths.map((value, index) =>
    normalizeScopePattern(value, `approved allowed_paths[${index}]`),
  );
  const approvedProhibited = approvedMetadata.prohibited_paths.map((value, index) =>
    normalizeScopePattern(value, `approved prohibited_paths[${index}]`),
  );
  const requestedAllowed = requestedAllowedPaths.map((value, index) =>
    normalizeScopePattern(value, `requested allowed_paths[${index}]`),
  );
  const requestedProhibited = requestedProhibitedPaths.map((value, index) =>
    normalizeScopePattern(value, `requested prohibited_paths[${index}]`),
  );

  for (const requested of requestedAllowed) {
    if (!approvedAllowed.some((approved) => scopePatternCovers(approved, requested))) {
      throw new Error(
        `requested allowed path broadens approved plan write scope: ${requested}`,
      );
    }
  }
  for (const approved of approvedProhibited) {
    if (!requestedProhibited.some((requested) => scopePatternCovers(requested, approved))) {
      throw new Error(
        `requested prohibited paths omit approved plan write scope restriction: ${approved}`,
      );
    }
  }

  return {
    allowed_paths: requestedAllowed,
    prohibited_paths: requestedProhibited,
  };
}

function validateMetadata(input) {
  const metadata = structuredClone(input);
  if (metadata.schema_version !== APPROVAL_SCHEMA_VERSION) {
    throw new TypeError(`unsupported approval artifact schema version: ${metadata.schema_version}`);
  }
  for (const field of [
    'artifact_id',
    'artifact_kind',
    'contract_id',
    'requirement_id',
    'change_ref',
    'track',
    'stack_profile',
    'owner_repository_id',
    'owner_repository_role',
    'approval_source',
    'approved_at',
  ]) {
    requiredString(metadata, field);
  }
  if (!registry.artifact_kinds.includes(metadata.artifact_kind)) {
    throw new TypeError(`unknown artifact kind: ${metadata.artifact_kind}`);
  }
  const track = registry.aliases[metadata.track] ?? metadata.track;
  if (!registry.tracks.some(({ id }) => id === track)) {
    throw new TypeError(`unknown track: ${metadata.track}`);
  }
  metadata.track = track;
  if (!registry.stack_profiles.some(({ id }) => id === metadata.stack_profile)) {
    throw new TypeError(`unknown stack profile: ${metadata.stack_profile}`);
  }
  if (!registry.repository_roles.includes(metadata.owner_repository_role)) {
    throw new TypeError(`unknown repository role: ${metadata.owner_repository_role}`);
  }
  if (
    metadata.owner_module_id !== null &&
    (typeof metadata.owner_module_id !== 'string' || metadata.owner_module_id.trim() === '')
  ) {
    throw new TypeError('owner_module_id must be null or a non-empty string');
  }
  if (metadata.owner_repository_role === 'module' && metadata.owner_module_id === null) {
    throw new TypeError('a module-owned artifact requires owner_module_id');
  }
  if (
    Number.isNaN(Date.parse(metadata.approved_at)) ||
    new Date(metadata.approved_at).toISOString() !== metadata.approved_at
  ) {
    throw new TypeError('approved_at must be an ISO-8601 UTC timestamp');
  }
  if (
    metadata.approved_by !== null &&
    (typeof metadata.approved_by !== 'string' || metadata.approved_by.trim() === '')
  ) {
    throw new TypeError('approved_by must be null or a non-empty safe identity');
  }
  validateRelativePath(metadata.repository_relative_path, 'repository_relative_path');
  if (!HEX_40.test(metadata.source_revision)) {
    throw new TypeError('source_revision must be a lowercase 40-character Git revision');
  }
  if (metadata.parent_repository_id !== null) {
    requiredString(metadata, 'parent_repository_id');
  }
  if (!Array.isArray(metadata.parent_references)) {
    throw new TypeError('parent_references must be an array');
  }
  for (const reference of metadata.parent_references) {
    for (const field of ['repository_id', 'artifact_id', 'artifact_kind']) {
      requiredString(reference, field);
    }
    if (!registry.artifact_kinds.includes(reference.artifact_kind)) {
      throw new TypeError(`unknown parent artifact kind: ${reference.artifact_kind}`);
    }
    if (!HEX_40.test(reference.revision)) {
      throw new TypeError('parent reference revision must be a lowercase 40-character Git revision');
    }
    if (!APPROVAL_HASH.test(reference.approval_hash)) {
      throw new TypeError('parent reference approval_hash is invalid');
    }
  }
  if (metadata.supersedes !== null && typeof metadata.supersedes !== 'string') {
    throw new TypeError('supersedes must be null or an artifact id');
  }
  delete metadata.approval_hash;
  return canonicalize(metadata);
}

function calculateApprovalHash(metadata, body) {
  const payload = stableJson({
    body: normalizeText(body),
    metadata,
  });
  return `${APPROVAL_ALGORITHM}:${createHash('sha256').update(payload, 'utf8').digest('hex')}`;
}

export function createApprovedArtifact({ metadata, body }) {
  if (!metadata || typeof metadata !== 'object') {
    throw new TypeError('metadata must be an object');
  }
  if (typeof body !== 'string') {
    throw new TypeError('body must be a string');
  }
  const protectedMetadata = validateMetadata(metadata);
  return {
    metadata: {
      ...protectedMetadata,
      approval_hash: calculateApprovalHash(protectedMetadata, body),
    },
    body: normalizeText(body),
  };
}

export function verifyApprovedArtifact(artifact) {
  if (!artifact || typeof artifact !== 'object' || typeof artifact.body !== 'string') {
    throw new TypeError('artifact must contain metadata and body');
  }
  const suppliedHash = artifact.metadata?.approval_hash;
  if (!APPROVAL_HASH.test(suppliedHash ?? '')) {
    throw new TypeError('approval hash is missing or malformed');
  }
  const protectedMetadata = validateMetadata(artifact.metadata);
  const expectedHash = calculateApprovalHash(protectedMetadata, artifact.body);
  if (suppliedHash !== expectedHash) {
    throw new Error(`approval hash mismatch: expected ${expectedHash}, received ${suppliedHash}`);
  }
  return {
    valid: true,
    approval_hash: expectedHash,
    metadata: protectedMetadata,
  };
}

export function verifyApprovedArtifactGraph(artifact, parentArtifacts = []) {
  const result = verifyApprovedArtifact(artifact);
  if (!Array.isArray(parentArtifacts)) {
    throw new TypeError('parentArtifacts must be an array');
  }
  const parents = new Map();
  for (const parent of parentArtifacts) {
    verifyApprovedArtifact(parent);
    parents.set(
      `${parent.metadata.owner_repository_id}:${parent.metadata.artifact_id}`,
      parent,
    );
  }
  for (const reference of result.metadata.parent_references) {
    const parent = parents.get(`${reference.repository_id}:${reference.artifact_id}`);
    if (!parent) {
      throw new Error(
        `parent reference is unavailable: ${reference.repository_id}:${reference.artifact_id}`,
      );
    }
    if (parent.metadata.artifact_kind !== reference.artifact_kind) {
      throw new Error(`parent reference artifact kind mismatch: ${reference.artifact_id}`);
    }
    if (parent.metadata.source_revision !== reference.revision) {
      throw new Error(`parent reference revision mismatch: ${reference.artifact_id}`);
    }
    if (parent.metadata.approval_hash !== reference.approval_hash) {
      throw new Error(`parent reference approval hash mismatch: ${reference.artifact_id}`);
    }
  }
  return {
    ...result,
    parent_references_verified: result.metadata.parent_references.length,
  };
}

function parseCliArguments(argumentsList) {
  const [mode, ...rest] = argumentsList;
  if (!['create', 'verify'].includes(mode)) {
    throw new TypeError('usage: approved-artifact.mjs <create|verify> --input <path> [--output <path>]');
  }
  const options = { mode };
  for (let index = 0; index < rest.length; index += 2) {
    const flag = rest[index];
    const value = rest[index + 1];
    if (!['--input', '--output'].includes(flag) || !value) {
      throw new TypeError(`invalid CLI argument: ${flag ?? '<missing>'}`);
    }
    options[flag.slice(2)] = value;
  }
  if (!options.input) throw new TypeError('--input is required');
  if (mode === 'create' && !options.output) throw new TypeError('--output is required for create');
  return options;
}

async function runCli() {
  const options = parseCliArguments(process.argv.slice(2));
  const input = JSON.parse(await readFile(options.input, 'utf8'));
  if (options.mode === 'create') {
    const artifact = createApprovedArtifact(input);
    await writeFile(options.output, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');
    process.stdout.write(
      `${JSON.stringify({ valid: true, approval_hash: artifact.metadata.approval_hash })}\n`,
    );
    return;
  }
  const result = verifyApprovedArtifact(input);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

const isCli =
  typeof process.argv[1] === 'string' &&
  pathToFileURL(process.argv[1]).href === import.meta.url;
if (isCli) {
  runCli().catch((error) => {
    process.stderr.write(`${error?.message ?? String(error)}\n`);
    process.exitCode = 1;
  });
}
