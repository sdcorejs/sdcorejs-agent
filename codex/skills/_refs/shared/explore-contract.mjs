import { execFile } from 'node:child_process';
import { access, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { classifyConventionPath } from './convention-paths.mjs';
import { stableRepositoryId } from './repository-contract.mjs';
import { systemRegistry } from './system-registry.mjs';

const execFileAsync = promisify(execFile);
const READ_ONLY_ACTIONS = new Set([
  'summary-read',
  'code-map-readonly',
  'trace-flow-readonly',
  'env-setup-readonly',
  'recovery-readonly',
  'persona-read',
  'memories-read',
  'documentation-harvest-readonly',
  'conventions-read',
]);
const AUTHORIZED_WRITE_ACTIONS = new Set([
  'summary-refresh',
  'code-map-write-approved',
  'env-setup-write-approved',
  'persona-write-approved',
  'memories-write-approved',
  'conventions-sync-write-approved',
]);
const SHARED_WRITE_ROLES = new Set([
  'sequential-owner',
  'integration-owner',
  'fan-in-owner',
]);
const ARTIFACT_EXTENSIONS = /\.(?:md|json|ya?ml)$/iu;
const SKIPPED_ARTIFACT_DIRECTORIES = new Set([
  'cache',
  'caches',
  'storage',
  'temp',
  'tmp',
  'traces',
]);

export function validateExploreClassification({
  tracks = [],
  stack_profiles: stackProfiles = [],
} = {}) {
  const errors = [];
  const trackIds = new Set(systemRegistry.tracks.map(({ id }) => id));
  const profileIds = new Set(systemRegistry.stack_profiles.map(({ id }) => id));
  for (const track of tracks) {
    const canonical = systemRegistry.aliases[track] ?? track;
    if (!trackIds.has(canonical)) errors.push(`unknown track: ${track}`);
  }
  for (const profile of stackProfiles) {
    if (!profileIds.has(profile)) errors.push(`unknown stack profile: ${profile}`);
  }
  return errors;
}

export function resolveExploreWriteAuthority({
  action,
  explicit_authority: explicitAuthority = false,
  approved_initialization: approvedInitialization = false,
  integration_owner_assigned: integrationOwnerAssigned = false,
  convention_capture_mode: conventionCaptureMode = 'disabled',
  worker_role: workerRole = 'sequential-owner',
} = {}) {
  if (READ_ONLY_ACTIONS.has(action)) {
    return {
      write_allowed: false,
      reason: 'read-only explore action',
    };
  }
  if (!AUTHORIZED_WRITE_ACTIONS.has(action)) {
    return {
      write_allowed: false,
      reason: 'unknown explore action defaults to read-only',
    };
  }
  // A committed `after-review` capture policy is standing project-level
  // authorization, so routine reviews do not re-ask on every run. It is still
  // only an authorization to run the separate sync action, and it never applies
  // to a parallel worker: shared convention state is merged once by the
  // sequential or fan-in integration owner.
  const policyAuthorized =
    action === 'conventions-sync-write-approved' && conventionCaptureMode === 'after-review';
  const assigned =
    explicitAuthority === true ||
    approvedInitialization === true ||
    integrationOwnerAssigned === true ||
    policyAuthorized;
  // Allowlist, not a denylist: an unrecognized or misspelled role must not fall
  // through into write authority just because it is not the one role we named.
  if (assigned && !SHARED_WRITE_ROLES.has(workerRole)) {
    return {
      write_allowed: false,
      reason:
        workerRole === 'parallel-worker'
          ? 'parallel workers emit runtime candidates and never write shared state'
          : `role ${workerRole} may not write shared state; expected one of ${[...SHARED_WRITE_ROLES].join(', ')}`,
    };
  }
  return {
    write_allowed: assigned,
    reason: assigned
      ? policyAuthorized && explicitAuthority !== true && approvedInitialization !== true
        ? 'approved project convention capture policy'
        : 'explicit or approved explore ownership'
      : 'write authority is missing',
  };
}

export async function discoverRepositoryTopology({ root } = {}) {
  const requestedRoot = path.resolve(root ?? process.cwd());
  const portalRoot = await realpath(requestedRoot).catch(() => requestedRoot);
  const portal = await inspectRepository(portalRoot, {
    repositoryRole: 'portal',
    moduleId: null,
    repositoryRelativePath: '.',
  });
  const modules = parseGitmodules(
    await readFile(path.join(portalRoot, '.gitmodules'), 'utf8').catch(() => ''),
  );
  const repositories = [portal];
  const relationships = [];
  const findings = [];

  for (const module of modules) {
    const expectedRepositoryId = repositoryIdFromRemote(module.url);
    let modulePath;
    try {
      modulePath = normalizeRelative(module.path);
      if (modulePath === '.') throw new TypeError('module path must be a strict child');
    } catch (error) {
      findings.push({
        code: 'INVALID_MODULE_PATH',
        severity: 'blocking',
        repository_id: expectedRepositoryId,
        module_id: module.name,
        evidence: String(module.path),
        reason: error?.message ?? String(error),
      });
      continue;
    }
    const moduleRoot = path.resolve(portalRoot, modulePath);
    if (!isStrictDescendant(portalRoot, moduleRoot)) {
      findings.push({
        code: 'INVALID_MODULE_PATH',
        severity: 'blocking',
        repository_id: expectedRepositoryId,
        module_id: module.name,
        evidence: modulePath,
        reason: 'module path escapes the portal repository',
      });
      continue;
    }
    if (await exists(moduleRoot)) {
      const physicalModuleRoot = await realpath(moduleRoot).catch(() => null);
      if (!physicalModuleRoot || !isStrictDescendant(portalRoot, physicalModuleRoot)) {
        findings.push({
          code: 'INVALID_MODULE_PATH',
          severity: 'blocking',
          repository_id: expectedRepositoryId,
          module_id: module.name,
          evidence: modulePath,
          reason: 'module path resolves outside the portal repository',
        });
        continue;
      }
    }
    const initialized = await isGitRepository(moduleRoot);
    const pinnedRevision = await readPinnedRevision(portalRoot, modulePath);
    const inspected = initialized
      ? await inspectRepository(moduleRoot, {
          repositoryRole: 'module',
          moduleId: module.name,
          repositoryRelativePath: modulePath,
        })
      : {
          repository_id: expectedRepositoryId,
          repository_role: 'module',
          module_id: module.name,
          repository_relative_path: modulePath,
          source_revision: null,
          remote_url: module.url,
          status: 'uninitialized',
        };
    if (!inspected.repository_id) inspected.repository_id = expectedRepositoryId;
    inspected.portal_pinned_revision = pinnedRevision;
    inspected.freshness =
      !initialized || !pinnedRevision || !inspected.source_revision
        ? 'unknown'
        : pinnedRevision === inspected.source_revision
          ? 'fresh'
          : 'stale';
    repositories.push(inspected);
    relationships.push({
      kind: 'portal-module-gitlink',
      portal_repository_id: portal.repository_id,
      module_repository_id: inspected.repository_id,
      module_id: module.name,
      repository_relative_path: modulePath,
      portal_pinned_revision: pinnedRevision,
      module_source_revision: inspected.source_revision,
      status: inspected.status,
      freshness: inspected.freshness,
    });
    if (!initialized) {
      findings.push({
        code: 'MISSING_OR_UNINITIALIZED_MODULE',
        severity: 'blocking',
        repository_id: inspected.repository_id,
        module_id: module.name,
        evidence: modulePath,
      });
    } else if (inspected.freshness === 'stale') {
      findings.push({
        code: 'STALE_PORTAL_PINNED_MODULE_REVISION',
        severity: 'warning',
        repository_id: inspected.repository_id,
        module_id: module.name,
        portal_pinned_revision: pinnedRevision,
        module_source_revision: inspected.source_revision,
        evidence: modulePath,
      });
    }
    if (
      initialized &&
      expectedRepositoryId &&
      inspected.repository_id &&
      expectedRepositoryId !== inspected.repository_id
    ) {
      findings.push({
        code: 'MODULE_REMOTE_IDENTITY_MISMATCH',
        severity: 'blocking',
        repository_id: inspected.repository_id,
        expected_repository_id: expectedRepositoryId,
        module_id: module.name,
        evidence: '.gitmodules',
      });
    }
  }

  const artifactLocations = [];
  const ownershipHypotheses = [];
  for (const repository of repositories.filter(({ status }) => status === 'initialized')) {
    const repositoryRoot =
      repository.repository_role === 'portal'
        ? portalRoot
        : path.join(portalRoot, repository.repository_relative_path);
    const artifacts = await discoverArtifacts(repositoryRoot, repository);
    artifactLocations.push(...artifacts);
    for (const artifact of artifacts) {
      if (artifact.owner_repository_id) {
        ownershipHypotheses.push({
          artifact_id: artifact.artifact_id,
          artifact_kind: artifact.artifact_kind,
          artifact_repository_id: artifact.repository_id,
          owner_repository_id: artifact.owner_repository_id,
          owner_module_id: artifact.owner_module_id,
          confidence: 'high',
          evidence: `${artifact.repository_id}:${artifact.repository_relative_path}`,
        });
      }
      if (
        repository.repository_role === 'portal' &&
        (artifact.owner_repository_role === 'module' || artifact.owner_module_id)
      ) {
        findings.push({
          code: 'MISPLACED_MODULE_ARTIFACT',
          severity: 'blocking',
          artifact_id: artifact.artifact_id,
          artifact_kind: artifact.artifact_kind,
          repository_id: repository.repository_id,
          expected_owner_repository_id: artifact.owner_repository_id,
          expected_owner_module_id: artifact.owner_module_id,
          evidence: artifact.repository_relative_path,
        });
      }
    }
  }

  const editableById = new Map();
  for (const artifact of artifactLocations.filter(
    ({ artifact_id: artifactId, editable }) => artifactId && editable,
  )) {
    const group = editableById.get(artifact.artifact_id) ?? [];
    group.push(artifact);
    editableById.set(artifact.artifact_id, group);
  }
  for (const [artifactId, locations] of editableById) {
    if (locations.length < 2) continue;
    findings.push({
      code: 'DUPLICATE_EDITABLE_ARTIFACT',
      severity: 'blocking',
      artifact_id: artifactId,
      locations: locations.map(
        ({ repository_id: repositoryId, repository_relative_path: relativePath }) => ({
          repository_id: repositoryId,
          repository_relative_path: relativePath,
        }),
      ),
    });
  }

  return {
    schema_version: 1,
    read_only: true,
    writes: [],
    execution_host_repository_id: portal.repository_id,
    integration_owner_repository_id: portal.repository_id,
    repositories,
    relationships,
    artifact_locations: artifactLocations,
    ownership_hypotheses: ownershipHypotheses,
    findings,
  };
}

async function inspectRepository(
  root,
  { repositoryRole, moduleId, repositoryRelativePath },
) {
  const remoteUrl = await git(root, ['remote', 'get-url', 'origin']);
  const sourceRevision = await git(root, ['rev-parse', 'HEAD']);
  return {
    repository_id: repositoryIdFromRemote(remoteUrl),
    repository_role: repositoryRole,
    module_id: moduleId,
    repository_relative_path: repositoryRelativePath,
    source_revision: /^[a-f0-9]{40}$/u.test(sourceRevision ?? '')
      ? sourceRevision
      : null,
    remote_url: remoteUrl,
    status: 'initialized',
  };
}

function repositoryIdFromRemote(remoteUrl) {
  if (!remoteUrl) return null;
  try {
    return stableRepositoryId({ remote_url: remoteUrl });
  } catch {
    return null;
  }
}

function parseGitmodules(text) {
  const modules = [];
  let current = null;
  for (const rawLine of text.split(/\r?\n/u)) {
    const section = rawLine.match(/^\s*\[submodule\s+"([^"]+)"\]\s*$/u);
    if (section) {
      current = { name: section[1], path: null, url: null };
      modules.push(current);
      continue;
    }
    const field = rawLine.match(/^\s*(path|url)\s*=\s*(.*?)\s*$/u);
    if (current && field) current[field[1]] = field[2];
  }
  return modules.filter(({ path: modulePath, url }) => modulePath && url);
}

async function readPinnedRevision(root, modulePath) {
  const output = await git(root, ['ls-tree', 'HEAD', '--', modulePath]);
  const match = output?.match(/^160000\s+commit\s+([a-f0-9]{40})\t/u);
  return match?.[1] ?? null;
}

async function isGitRepository(root) {
  if (!(await exists(root))) return false;
  const result = await git(root, ['rev-parse', '--is-inside-work-tree']);
  return result === 'true';
}

async function git(cwd, args) {
  try {
    const { stdout } = await execFileAsync('git', args, {
      cwd,
      encoding: 'utf8',
      maxBuffer: 2 * 1024 * 1024,
      windowsHide: true,
    });
    return stdout.trim();
  } catch {
    return null;
  }
}

async function discoverArtifacts(root, repository) {
  const artifactRoot = path.join(root, '.sdcorejs');
  if (!(await exists(artifactRoot))) return [];
  const files = [];
  await walkArtifacts(artifactRoot, artifactRoot, files);
  const artifacts = [];
  for (const relativePath of files) {
    if (
      relativePath === 'tasks/current-session.md' ||
      relativePath.startsWith('tasks/sessions/')
    ) {
      continue;
    }
    const content = await readFile(path.join(artifactRoot, relativePath), 'utf8').catch(
      () => '',
    );
    const metadata = parseArtifactMetadata(content, relativePath);
    const repositoryRelativePath = `.sdcorejs/${normalizeRelative(relativePath)}`;
    const conventionOwner = conventionOwnership(repositoryRelativePath);
    artifacts.push({
      artifact_id: metadata.artifact_id ?? null,
      artifact_kind: metadata.artifact_kind ?? inferArtifactKind(relativePath),
      repository_id: repository.repository_id,
      repository_role: repository.repository_role,
      module_id: repository.module_id,
      repository_relative_path: repositoryRelativePath,
      owner_repository_id: metadata.owner_repository_id ?? null,
      owner_repository_role:
        metadata.owner_repository_role ?? conventionOwner?.owner_repository_role ?? null,
      owner_module_id:
        normalizeNullable(metadata.owner_module_id) ?? conventionOwner?.owner_module_id ?? null,
      change_ref: metadata.change_ref ?? null,
      contract_id: metadata.contract_id ?? null,
      requirement_id: metadata.requirement_id ?? null,
      editable:
        metadata.generated !== true &&
        metadata.commit_policy !== 'generated' &&
        !relativePath.includes('/generated/'),
    });
  }
  return artifacts;
}

function parseArtifactMetadata(content, relativePath) {
  if (relativePath.toLowerCase().endsWith('.json')) {
    try {
      return JSON.parse(content).metadata ?? JSON.parse(content);
    } catch {
      return {};
    }
  }
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u);
  if (!match) return {};
  const metadata = {};
  for (const line of match[1].split(/\r?\n/u)) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*?)\s*$/u);
    if (!field) continue;
    const [, key, rawValue] = field;
    if (rawValue === 'true') metadata[key] = true;
    else if (rawValue === 'false') metadata[key] = false;
    else if (rawValue === 'null' || rawValue === 'none') metadata[key] = null;
    else metadata[key] = rawValue.replace(/^['"]|['"]$/gu, '');
  }
  return metadata;
}

function inferArtifactKind(relativePath) {
  const [bucket] = normalizeRelative(relativePath).split('/');
  return {
    specs: 'spec',
    plans: 'plan',
    conventions: 'convention',
    documentation: 'documentation',
    docs: 'documentation',
    summaries: 'summary',
  }[bucket] ?? 'unknown';
}

/**
 * A convention rule declares its module in its path, not only its frontmatter.
 * Deriving ownership from the path is what lets topology discovery report a
 * module rule that was written into a portal, which is the exact drift the
 * one-editable-source rule exists to prevent.
 */
function conventionOwnership(repositoryRelativePath) {
  const classification = classifyConventionPath(repositoryRelativePath);
  if (!classification.ok || classification.scope_kind !== 'module') return null;
  return {
    owner_module_id: classification.module_id,
    owner_repository_role: 'module',
  };
}

function normalizeNullable(value) {
  return value === undefined || value === null || value === '' || value === 'none'
    ? null
    : value;
}

async function walkArtifacts(base, current, result) {
  const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory() && SKIPPED_ARTIFACT_DIRECTORIES.has(entry.name)) continue;
    if (entry.isDirectory()) await walkArtifacts(base, absolute, result);
    else if (entry.isFile() && ARTIFACT_EXTENSIONS.test(entry.name)) {
      result.push(normalizeRelative(path.relative(base, absolute)));
    }
  }
}

function normalizeRelative(value) {
  const raw = String(value ?? '').replaceAll('\\', '/');
  if (!raw || path.posix.isAbsolute(raw) || /^[A-Za-z]:\//u.test(raw)) {
    throw new TypeError(`path must be repository-relative: ${value}`);
  }
  const normalized = path.posix.normalize(raw).replace(/^\.\//u, '');
  if (normalized === '..' || normalized.startsWith('../')) {
    throw new TypeError(`path escapes repository: ${value}`);
  }
  return normalized;
}

function isStrictDescendant(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative !== '' &&
    relative !== '..' &&
    !relative.startsWith(`..${path.sep}`) &&
    !path.isAbsolute(relative)
  );
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}
