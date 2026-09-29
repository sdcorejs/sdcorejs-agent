import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
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

// Canonical approved-artifact file loader. Runtime code must stay dependency-free,
// so frontmatter uses a restricted YAML subset: exactly what the canonical writer
// emits. Every other construct fails closed instead of being guessed.
const FRONTMATTER_KEY = /^([A-Za-z_][A-Za-z0-9_-]*):(?: (.*))?$/u;
const DOUBLE_QUOTED_ESCAPES = Object.freeze({
  0: '\0', a: '\x07', b: '\b', t: '\t', '\t': '\t', n: '\n', v: '\v', f: '\f', r: '\r', e: '\x1b',
  ' ': ' ', '"': '"', '/': '/', '\\': '\\', N: '\x85', _: '\xa0', L: '\u2028', P: '\u2029',
});
// Step 1 snapshots hashed their body without the blank separator line; step 2-3
// snapshots hashed it. Only snapshots approved before this cutoff may use the
// excluded variant; newer snapshots must verify byte-for-byte.
export const APPROVED_SEPARATOR_CUTOFF = '2026-09-27T00:00:00.000Z';

function resolvePlainScalar(value) {
  if (value === '' || value === '~' || value === 'null' || value === 'Null' || value === 'NULL') return null;
  if (['true', 'True', 'TRUE'].includes(value)) return true;
  if (['false', 'False', 'FALSE'].includes(value)) return false;
  if (/^[-+]?[0-9]+$/u.test(value)) return Number(value);
  if (/^0o[0-7]+$/u.test(value)) return Number.parseInt(value.slice(2), 8);
  if (/^0x[0-9a-fA-F]+$/u.test(value)) return Number.parseInt(value.slice(2), 16);
  if (/^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)(?:[eE][-+]?[0-9]+)?$/u.test(value)) return Number(value);
  if (/^[-+]?\.(?:inf|Inf|INF)$/u.test(value)) return value.startsWith('-') ? -Infinity : Infinity;
  if (/^\.(?:nan|NaN|NAN)$/u.test(value)) return Number.NaN;
  return value;
}

export function parseApprovedFrontmatter(text) {
  if (typeof text !== 'string') throw new TypeError('approved frontmatter must be text');
  if (text.includes('\t')) throw new Error('unsupported approved frontmatter: tab characters');
  const lines = text.replace(/\r\n?/gu, '\n').split('\n');
  while (lines.length > 0 && lines.at(-1) === '') lines.pop();
  let index = 0;
  const indentOf = (line) => line.length - line.trimStart().length;
  const fail = (message) => {
    throw new Error(`unsupported approved frontmatter at line ${index + 1}: ${message}`);
  };

  function parseDoubleQuoted(parts) {
    const raw = parts.join('\n');
    let output = '';
    let position = 1;
    while (position < raw.length) {
      const character = raw[position];
      if (character === '"') {
        if (raw.slice(position + 1).trim() !== '') fail('content after a closing quote');
        return output;
      }
      if (character === '\\') {
        const next = raw[position + 1];
        if (next === '\n') {
          position += 2;
          continue;
        }
        if (next === 'x' || next === 'u' || next === 'U') {
          const width = { x: 2, u: 4, U: 8 }[next];
          const digits = raw.slice(position + 2, position + 2 + width);
          if (!new RegExp(`^[0-9a-fA-F]{${width}}$`, 'u').test(digits)) fail('invalid hexadecimal escape');
          output += String.fromCodePoint(Number.parseInt(digits, 16));
          position += 2 + width;
          continue;
        }
        if (!Object.hasOwn(DOUBLE_QUOTED_ESCAPES, next)) fail('unsupported escape');
        output += DOUBLE_QUOTED_ESCAPES[next];
        position += 2;
        continue;
      }
      if (character === '\n') {
        let breaks = 0;
        while (raw[position] === '\n') {
          breaks += 1;
          position += 1;
        }
        output = output.replace(/[ ]+$/u, '');
        output += breaks === 1 ? ' ' : '\n'.repeat(breaks - 1);
        continue;
      }
      output += character;
      position += 1;
    }
    return fail('unterminated double-quoted scalar');
  }

  function parseScalar(first, parentIndent) {
    const continuation = [];
    while (index < lines.length) {
      const line = lines[index];
      if (line.trim() === '') {
        let look = index;
        while (look < lines.length && lines[look].trim() === '') look += 1;
        if (look < lines.length && indentOf(lines[look]) > parentIndent) {
          for (let blank = index; blank < look; blank += 1) continuation.push('');
          index = look;
          continue;
        }
        break;
      }
      if (indentOf(line) <= parentIndent) break;
      continuation.push(line.trim());
      index += 1;
    }
    if (first.startsWith('"')) return parseDoubleQuoted([first, ...continuation]);
    if (continuation.length === 0 && first === '[]') return [];
    if (continuation.length === 0 && first === '{}') return {};
    const pieces = [first, ...continuation.filter((part) => part !== '')];
    if (/^[&*!|>'%@`[{"]/u.test(first) || pieces.some((part) => /(?:^|\s)#/u.test(part) || /:(?:\s|$)/u.test(part))) {
      fail('unsupported scalar construct');
    }
    if (continuation.length === 0) return resolvePlainScalar(first);
    let output = first;
    let pending = 0;
    for (const part of continuation) {
      if (part === '') {
        pending += 1;
        continue;
      }
      output += pending > 0 ? '\n'.repeat(pending) : ' ';
      output += part;
      pending = 0;
    }
    return output;
  }

  function parseNested(parentIndent) {
    if (index < lines.length && lines[index].trim() !== '' && indentOf(lines[index]) > parentIndent) {
      return parseBlock(indentOf(lines[index]));
    }
    return null;
  }

  function parseSequence(indent) {
    const result = [];
    while (index < lines.length) {
      const line = lines[index];
      if (line.trim() === '') fail('blank line inside a sequence');
      const current = indentOf(line);
      if (current < indent) break;
      if (current > indent) fail('unexpected sequence indentation');
      const rest = line.slice(indent);
      if (rest !== '-' && !rest.startsWith('- ')) break;
      const item = rest === '-' ? '' : rest.slice(2);
      if (item === '') {
        index += 1;
        result.push(parseNested(indent));
      } else if (FRONTMATTER_KEY.test(item)) {
        lines[index] = `${' '.repeat(indent + 2)}${item}`;
        result.push(parseMapping(indent + 2));
      } else if (item === '-' || item.startsWith('- ')) {
        fail('nested inline sequences are not supported');
      } else {
        index += 1;
        result.push(parseScalar(item, indent));
      }
    }
    return result;
  }

  function parseMapping(indent) {
    const result = {};
    while (index < lines.length) {
      const line = lines[index];
      if (line.trim() === '') fail('blank line inside a mapping');
      const current = indentOf(line);
      if (current < indent) break;
      if (current > indent) fail('unexpected mapping indentation');
      const match = line.slice(indent).match(FRONTMATTER_KEY);
      if (!match) fail('expected a plain mapping key');
      const key = match[1];
      if (Object.hasOwn(result, key)) fail(`duplicate key ${key}`);
      index += 1;
      if (match[2] === undefined || match[2] === '') {
        const next = lines[index];
        if (next !== undefined && indentOf(next) === indent && /^- |^-$/u.test(next.slice(indent))) {
          result[key] = parseSequence(indent);
        } else {
          result[key] = parseNested(indent);
        }
      } else {
        result[key] = parseScalar(match[2], indent);
      }
    }
    return result;
  }

  function parseBlock(indent) {
    const rest = lines[index].slice(indent);
    return rest === '-' || rest.startsWith('- ') ? parseSequence(indent) : parseMapping(indent);
  }

  if (lines.length === 0) fail('empty frontmatter');
  if (indentOf(lines[0]) !== 0) fail('frontmatter must start at column zero');
  const value = parseBlock(0);
  if (index < lines.length) fail('unparsed trailing content');
  if (value === null || typeof value !== 'object' || Array.isArray(value)) fail('frontmatter must be a mapping');
  return value;
}

export function parseApprovedArtifactText(text, { expected_path: expectedPath } = {}) {
  if (typeof text !== 'string') throw new TypeError('approved artifact must be text');
  if (text.charCodeAt(0) === 0xfeff) throw new Error('approved artifact must not start with a byte order mark');
  const normalized = text.replace(/\r\n?/gu, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n/u);
  if (!match) throw new Error('approved artifact frontmatter is required');
  const metadata = parseApprovedFrontmatter(match[1]);
  if (expectedPath !== undefined && metadata.repository_relative_path !== expectedPath) {
    throw new Error(`approved artifact path mismatch: ${String(metadata.repository_relative_path)} is not ${expectedPath}`);
  }
  const after = normalized.slice(match[0].length);
  const attempt = (body) => {
    try {
      return { verified: verifyApprovedArtifact({ metadata, body }), body };
    } catch (error) {
      return { error };
    }
  };
  const exact = attempt(after);
  if (!exact.error) {
    return { artifact: { metadata: structuredClone(metadata), body: after }, approval_hash: exact.verified.approval_hash, separator: after.startsWith('\n') ? 'included' : 'none' };
  }
  const legacy = after.startsWith('\n') && !after.startsWith('\n\n') && typeof metadata.approved_at === 'string' &&
    Date.parse(metadata.approved_at) < Date.parse(APPROVED_SEPARATOR_CUTOFF);
  if (legacy) {
    const stripped = attempt(after.slice(1));
    if (!stripped.error) {
      return { artifact: { metadata: structuredClone(metadata), body: stripped.body }, approval_hash: stripped.verified.approval_hash, separator: 'excluded' };
    }
  }
  throw exact.error;
}

export function readApprovedArtifactFile(root, relativePath) {
  validateRelativePath(relativePath, 'repository_relative_path');
  if (relativePath.includes('\\') || relativePath.split('/').some((segment) => segment === '' || segment === '.')) {
    throw new TypeError('repository_relative_path must use normalized forward slashes');
  }
  const realRoot = realpathSync.native(root);
  let cursor = realRoot;
  for (const segment of relativePath.split('/')) {
    cursor = path.join(cursor, segment);
    if (lstatSync(cursor).isSymbolicLink()) throw new Error(`approved artifact path crosses a symbolic link: ${relativePath}`);
  }
  const relative = path.relative(realRoot, realpathSync.native(cursor));
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`approved artifact escapes the repository root: ${relativePath}`);
  return { ...parseApprovedArtifactText(readFileSync(cursor, 'utf8'), { expected_path: relativePath }), path: relativePath };
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
