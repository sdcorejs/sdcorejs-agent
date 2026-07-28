#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);

const SUMMARY_SECTIONS = [
  'Purpose',
  'Read First',
  'Stack and Workspace',
  'Application and Module Map',
  'Entrypoints and Main Runtime Flows',
  'Source-of-Truth and Generated Boundaries',
  'Commands',
  'Conventions and Invariants',
  'Task-to-Path Navigation',
  'Known Unknowns',
  'Refresh Triggers',
];

const SKIPPED_DIRS = new Set([
  '.git',
  '.angular',
  '.cache',
  '.next',
  '.turbo',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'playwright-report',
  'test-results',
]);
const ARTIFACT_SKIPPED_DIRS = new Set([
  'cache',
  'caches',
  'codegraph-cache',
  'storage',
  'temp',
  'tmp',
  'trace',
  'traces',
]);

const WORKSPACE_CONFIG_PATTERN =
  /(?:^|\/)(?:angular\.json|lerna\.json|nest-cli\.json|nx\.json|pnpm-workspace\.ya?ml|turbo\.json|workspace\.json|next\.config\.[^/]+)$/i;
const LOCKFILE_PATTERN =
  /(?:^|\/)(?:bun\.lockb?|npm-shrinkwrap\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/i;
const PACKAGE_MANIFEST_PATTERN = /(?:^|\/)package\.json$/i;
const ENTRYPOINT_PATTERN =
  /(?:^|\/)(?:main|index|server|bootstrap)\.[cm]?[jt]sx?$|(?:^|\/)(?:app|pages)\/.*\/(?:page|layout|route)\.[cm]?[jt]sx?$/i;
const ADAPTER_ENTRYPOINT_PATTERN =
  /^(?:AGENTS\.md|CLAUDE\.md|skills\/orchestration\/using-skills\.md|scripts\/sync-skills\.mjs|\.claude-plugin\/plugin\.json|plugin\/hooks\/(?:hooks\.json|session-start(?:\.mjs)?)|\.github\/copilot-instructions\.md|\.github\/chatmodes\/[^/]+\.md|\.cursor\/rules\/[^/]+\.mdc)$/i;

export async function assembleProjectContext({
  root,
  requestScope = '',
  tracks = [],
  stackProfiles = [],
  explicitFiles = [],
  taskShape = 'small',
  graphProvider,
  changeRef,
  writesAllowed = false,
} = {}) {
  const targetRoot = path.resolve(root ?? process.cwd());
  const files = await listRepositoryFiles(targetRoot);
  const targetRootKind = await classifyTargetRoot(targetRoot, files);
  const summaryPath = path.join(targetRoot, '.sdcorejs', 'summary.md');
  const summaryText = await readFile(summaryPath, 'utf8').catch(() => null);
  const declaredEntrypoints = extractDeclaredEntrypoints(summaryText);
  const fingerprintResult = await computeProjectFingerprints(targetRoot, files, {
    declaredEntrypoints,
  });
  const summaryResult = assessSummaryFreshness(summaryText, fingerprintResult.fingerprints);
  const provider = graphProvider ?? detectExistingGraphProvider(targetRoot, files, fingerprintResult.packageJsonRecords);
  const codeContext = chooseCodeContextStrategy({
    taskShape,
    explicitFiles,
    summaryStatus: summaryResult.status,
    graphProvider: provider,
    requestScope,
  });
  const relatedArtifacts = await findRelatedArtifacts(targetRoot, {
    requestScope,
    changeRef,
  });
  const gitEvidence = await readGitEvidence(targetRoot);

  return {
    project_context: {
      target_root: targetRoot,
      target_root_kind: targetRootKind,
      request_scope: requestScope,
      tracks,
      stack_profiles: stackProfiles,
      summary: {
        status: summaryResult.status,
        schema: summaryResult.schema,
        path: summaryResult.exists ? '.sdcorejs/summary.md' : 'none',
        usable_sections: summaryResult.usableSections,
        invalidated_sections: summaryResult.invalidatedSections,
      },
      related_artifacts: relatedArtifacts,
      code_context: codeContext,
      current_evidence: {
        files: explicitFiles.map(normalizeRelativePath),
        diffs: gitEvidence.paths,
        commands: gitEvidence.commands,
      },
      writes_allowed: Boolean(writesAllowed),
      redaction_applied: true,
      legacy_notice: await exists(path.join(targetRoot, '.sdcorejs', 'tasks', 'current-session.md'))
        ? 'legacy session checkpoint ignored; it was not read'
        : 'none',
    },
    fingerprints: fingerprintResult.fingerprints,
    fingerprint_evidence: fingerprintResult.evidence,
    graph_provider: provider ?? null,
  };
}

export async function computeProjectFingerprints(root, knownFiles, { declaredEntrypoints = [] } = {}) {
  const targetRoot = path.resolve(root);
  const files = knownFiles ?? await listRepositoryFiles(targetRoot);
  const fileSet = new Set(files);
  const workspaceRecords = [];
  const dependencyRecords = [];
  const entrypointRecords = [];
  const keyEntrypoints = new Set();
  const packageJsonRecords = [];

  for (const relativePath of files) {
    if (
      !WORKSPACE_CONFIG_PATTERN.test(relativePath) &&
      !LOCKFILE_PATTERN.test(relativePath) &&
      !PACKAGE_MANIFEST_PATTERN.test(relativePath)
    ) {
      continue;
    }

    const absolutePath = path.join(targetRoot, relativePath);
    const content = await readFile(absolutePath, 'utf8').catch(() => null);
    if (content === null) continue;

    if (WORKSPACE_CONFIG_PATTERN.test(relativePath)) {
      workspaceRecords.push(`${relativePath}\0${content}`);
    }
    if (LOCKFILE_PATTERN.test(relativePath) || PACKAGE_MANIFEST_PATTERN.test(relativePath)) {
      if (LOCKFILE_PATTERN.test(relativePath)) {
        dependencyRecords.push(`${relativePath}\0${content}`);
      }
    }
    if (PACKAGE_MANIFEST_PATTERN.test(relativePath)) {
      const parsed = safeJsonParse(content);
      packageJsonRecords.push({ path: relativePath, content, parsed });
      if (parsed) {
        const workspaceShape = {
          name: parsed.name ?? null,
          private: parsed.private ?? null,
          type: parsed.type ?? null,
          workspaces: parsed.workspaces ?? null,
        };
        workspaceRecords.push(`${relativePath}#workspace\0${stableStringify(workspaceShape)}`);
        const dependencyShape = {
          packageManager: parsed.packageManager ?? null,
          engines: parsed.engines ?? null,
          scripts: parsed.scripts ?? null,
          dependencies: parsed.dependencies ?? null,
          devDependencies: parsed.devDependencies ?? null,
          optionalDependencies: parsed.optionalDependencies ?? null,
          peerDependencies: parsed.peerDependencies ?? null,
          peerDependenciesMeta: parsed.peerDependenciesMeta ?? null,
          overrides: parsed.overrides ?? null,
          resolutions: parsed.resolutions ?? null,
        };
        dependencyRecords.push(`${relativePath}#dependencies\0${stableStringify(dependencyShape)}`);

        const packageEntrypoints = collectPackageEntrypoints(relativePath, parsed);
        entrypointRecords.push(
          `${relativePath}#entrypoint-fields\0${stableStringify(packageEntrypoints.fields)}`
        );
        for (const entrypoint of packageEntrypoints.paths) {
          keyEntrypoints.add(entrypoint);
          entrypointRecords.push(
            `package-entrypoint:${entrypoint}\0exists=${fileSet.has(entrypoint)}`
          );
        }
      }
    }
  }

  const sourceRoots = detectSourceRoots(files);
  const discoveredEntrypoints = files
    .filter((item) => ENTRYPOINT_PATTERN.test(item) || ADAPTER_ENTRYPOINT_PATTERN.test(item))
    .sort();
  for (const entrypoint of discoveredEntrypoints) {
    keyEntrypoints.add(entrypoint);
    entrypointRecords.push(`discovered-entrypoint:${entrypoint}\0exists=true`);
  }
  for (const declared of declaredEntrypoints.map(normalizeRelativePath).filter(Boolean)) {
    keyEntrypoints.add(declared);
    entrypointRecords.push(`declared-entrypoint:${declared}\0exists=${fileSet.has(declared)}`);
  }
  const sourceRootRecords = sourceRoots.map((item) => `root:${item}`);

  return {
    fingerprints: {
      workspace_structure: hashRecords(workspaceRecords),
      dependency_manifests: hashRecords(dependencyRecords),
      source_roots: hashRecords(sourceRootRecords),
      entrypoint_contract: hashRecords(entrypointRecords),
    },
    evidence: {
      workspace_configs: files.filter((item) => WORKSPACE_CONFIG_PATTERN.test(item)),
      package_manifests: files.filter((item) => PACKAGE_MANIFEST_PATTERN.test(item)),
      lockfiles: files.filter((item) => LOCKFILE_PATTERN.test(item)),
      source_roots: sourceRoots,
      key_entrypoints: [...keyEntrypoints].sort(),
    },
    packageJsonRecords,
  };
}

export function assessSummaryFreshness(summaryText, currentFingerprints) {
  if (summaryText === null || summaryText === undefined) {
    return {
      exists: false,
      schema: 'missing',
      status: 'missing',
      usableSections: [],
      invalidatedSections: [],
      validationErrors: [],
    };
  }

  const metadata = parseSummaryMetadata(summaryText);
  const usableSections = SUMMARY_SECTIONS.filter((section) =>
    new RegExp(`^## ${escapeRegExp(section)}\\s*$`, 'm').test(summaryText)
  );
  if (Number(metadata.schema_version) !== 2 || metadata.kind !== 'project-summary') {
    return {
      exists: true,
      schema: 'legacy-schema',
      status: 'unknown',
      usableSections,
      invalidatedSections: [],
      validationErrors: [],
    };
  }

  const validationErrors = validateSummaryV2(summaryText);
  if (validationErrors.length > 0) {
    return {
      exists: true,
      schema: 'v2-invalid',
      status: 'stale',
      usableSections: [],
      invalidatedSections: SUMMARY_SECTIONS,
      validationErrors,
    };
  }

  const invalidated = new Set();
  const mismatches = [];
  const unknowns = [];
  const mapping = {
    workspace_structure: [
      'Stack and Workspace',
      'Application and Module Map',
      'Entrypoints and Main Runtime Flows',
      'Task-to-Path Navigation',
    ],
    dependency_manifests: [
      'Stack and Workspace',
      'Commands',
      'Conventions and Invariants',
    ],
    source_roots: [
      'Application and Module Map',
      'Entrypoints and Main Runtime Flows',
      'Task-to-Path Navigation',
    ],
    entrypoint_contract: [
      'Application and Module Map',
      'Entrypoints and Main Runtime Flows',
      'Task-to-Path Navigation',
    ],
  };

  for (const [key, sections] of Object.entries(mapping)) {
    const stored = metadata.fingerprints?.[key] ?? 'unknown';
    const current = currentFingerprints?.[key] ?? 'unknown';
    if (stored === 'unknown' || current === 'unknown' || !stored || !current) {
      unknowns.push(key);
      continue;
    }
    if (stored !== current) {
      mismatches.push(key);
      sections.forEach((section) => invalidated.add(section));
    }
  }

  const independentMismatches = mismatches.filter(
    (key) => key !== 'entrypoint_contract' || !mismatches.includes('source_roots')
  );
  let status = 'fresh';
  if (
    independentMismatches.length >= 2 ||
    (mismatches.includes('workspace_structure') && mismatches.includes('source_roots'))
  ) {
    status = 'stale';
  } else if (independentMismatches.length === 1) {
    status = 'partially-stale';
  } else if (unknowns.length > 0) {
    status = 'unknown';
  }

  return {
    exists: true,
    schema: 'v2',
    status,
    usableSections: usableSections.filter((section) => !invalidated.has(section)),
    invalidatedSections: [...invalidated],
    validationErrors,
    mismatches,
    unknowns,
  };
}

export function validateSummaryV2(summaryText) {
  const metadata = parseSummaryMetadata(summaryText);
  const errors = [];
  const forbiddenKeys = [
    'branch',
    'current_branch',
    'current_head',
    'current_plan',
    'current_spec',
    'current_task',
    'git_head',
    'session_status',
    'verification_status',
    'working_tree_status',
  ];
  for (const key of forbiddenKeys) {
    if (Object.hasOwn(metadata, key)) errors.push(`forbidden volatile frontmatter key: ${key}`);
  }

  const forbiddenBodyPatterns = [
    /^##\s+Current (?:Branch|Task|Plan|Spec|Session|Status)\b/im,
    /^##\s+Open Context\b/im,
    /^##\s+Resume From Here\b/im,
    /^\s*(?:Current branch|Current HEAD|Current task|Current approved (?:spec|plan)|Working-tree status|Session status|Verification status)\s*:/im,
    /\bResume from here\b/i,
  ];
  for (const pattern of forbiddenBodyPatterns) {
    if (pattern.test(summaryText)) errors.push(`forbidden volatile summary content: ${pattern}`);
  }

  if (Number(metadata.schema_version) !== 2) errors.push('schema_version must be 2');
  if (metadata.kind !== 'project-summary') errors.push('kind must be project-summary');
  if (/\b[A-Za-z]:\\|\/(?:Users|home)\//.test(summaryText)) {
    errors.push('committed summary must use repository-relative paths');
  }
  return errors;
}

export function chooseCodeContextStrategy({
  taskShape = 'small',
  explicitFiles = [],
  summaryStatus = 'missing',
  graphProvider,
  requestScope = '',
} = {}) {
  const normalizedFiles = explicitFiles.map(normalizeRelativePath);
  const multiModule = ['cross-layer', 'multi-module', 'architecture', 'impact-analysis'].includes(taskShape);

  if (multiModule && graphProvider) {
    return {
      strategy: 'existing-codegraph',
      scope: requestScope,
      entrypoints: normalizedFiles,
      evidence_paths: graphProvider.evidence ?? [],
      unresolved_relationships: [],
      provider: {
        name: graphProvider.name ?? 'existing-provider',
        command: graphProvider.command ?? 'documented read-only query',
        read_only: true,
        cache_policy: 'local-only',
      },
    };
  }
  if (multiModule) {
    return {
      strategy: 'scoped-code-map',
      scope: requestScope,
      entrypoints: normalizedFiles,
      evidence_paths: normalizedFiles,
      unresolved_relationships: [],
    };
  }
  if (normalizedFiles.length > 0 || summaryStatus !== 'fresh') {
    return {
      strategy: 'targeted-read',
      scope: requestScope,
      entrypoints: normalizedFiles,
      evidence_paths: normalizedFiles,
      unresolved_relationships: [],
    };
  }
  return {
    strategy: 'summary-only',
    scope: requestScope,
    entrypoints: [],
    evidence_paths: ['.sdcorejs/summary.md'],
    unresolved_relationships: [],
  };
}

export function detectExistingGraphProvider(root, files = [], packageJsonRecords = []) {
  if (files.includes('nx.json')) {
    return {
      name: 'nx',
      command: 'use the repository-documented read-only graph query',
      evidence: ['nx.json'],
      read_only: true,
      cache_policy: 'local-only',
    };
  }
  for (const record of packageJsonRecords) {
    const scripts = record.parsed?.scripts ?? {};
    for (const [name, command] of Object.entries(scripts)) {
      if (!/(?:code|dep(?:endency)?)[-:]?graph|graph:query|query:graph/i.test(`${name} ${command}`)) continue;
      return {
        name,
        command,
        evidence: [record.path],
        read_only: true,
        cache_policy: 'local-only',
      };
    }
  }
  return null;
}

async function listRepositoryFiles(root) {
  try {
    const { stdout } = await execFileAsync(
      'git',
      ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
      { cwd: root, encoding: 'buffer', maxBuffer: 20 * 1024 * 1024 }
    );
    const candidates = stdout
      .toString('utf8')
      .split('\0')
      .filter(Boolean)
      .map(normalizeRelativePath)
      .filter((item) => !isSkippedPath(item));
    const present = await Promise.all(
      candidates.map(async (item) => await exists(path.join(root, item)) ? item : null)
    );
    return present.filter(Boolean).sort();
  } catch {
    const result = [];
    await walk(root, root, result);
    return result.sort();
  }
}

async function walk(root, current, result) {
  if (result.length >= 20_000) return;
  const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (entry.isDirectory() && SKIPPED_DIRS.has(entry.name)) continue;
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) {
      await walk(root, absolute, result);
    } else if (entry.isFile()) {
      const relative = normalizeRelativePath(path.relative(root, absolute));
      if (!isSkippedPath(relative)) result.push(relative);
    }
  }
}

function detectSourceRoots(files) {
  const roots = new Set();
  const rootNames = new Set([
    '_refs',
    'app',
    'apps',
    'backend',
    'design',
    'frontend',
    'lib',
    'libs',
    'packages',
    'plugin',
    'product',
    'projects',
    'scripts',
    'site',
    'skills',
    'src',
    'test',
    'tests',
  ]);
  for (const relativePath of files) {
    const parts = relativePath.split('/');
    if (rootNames.has(parts[0])) {
      if (['apps', 'libs', 'packages', 'projects'].includes(parts[0]) && parts.length > 1) {
        roots.add(`${parts[0]}/${parts[1]}`);
      } else {
        roots.add(parts[0]);
      }
    }
  }
  return [...roots].sort();
}

async function classifyTargetRoot(root, files) {
  const rootPackage = await readFile(path.join(root, 'package.json'), 'utf8').catch(() => null);
  const packageName = safeJsonParse(rootPackage)?.name;
  if (
    packageName === 'sdcorejs-agent' &&
    files.includes('AGENTS.md') &&
    files.includes('skills/shared/workflow/explore.md') &&
    files.includes('scripts/sync-skills.mjs')
  ) {
    return 'sdcorejs-agent-authoring-repo';
  }
  if (files.some((item) => item.startsWith('skills/')) && files.some((item) => item.startsWith('_refs/'))) {
    return 'skill-pack-authoring-repo';
  }
  if (files.length > 0) return 'target-project';
  return 'unknown';
}

async function findRelatedArtifacts(root, { requestScope, changeRef }) {
  const buckets = {
    specs: [],
    plans: [],
    docs: [],
    handoffs: [],
    tasks: [],
  };
  const base = path.join(root, '.sdcorejs');
  if (!(await exists(base))) return buckets;

  const candidates = [];
  await walkArtifactFiles(base, base, candidates);
  const tokens = `${requestScope} ${changeRef ?? ''}`
    .toLowerCase()
    .split(/[^a-z0-9_-]+/)
    .filter((item) => item.length >= 3);

  for (const relative of candidates) {
    if (relative === 'tasks/current-session.md' || relative.startsWith('tasks/sessions/')) continue;
    const absolute = path.join(base, relative);
    const head = (await readFile(absolute, 'utf8').catch(() => '')).slice(0, 4000).toLowerCase();
    const relevant =
      tokens.length === 0 ||
      tokens.some((token) => relative.toLowerCase().includes(token) || head.includes(`change_ref: ${token}`));
    if (!relevant) continue;
    const repoPath = `.sdcorejs/${normalizeRelativePath(relative)}`;
    if (relative.startsWith('specs/')) buckets.specs.push(repoPath);
    else if (relative.startsWith('plans/')) buckets.plans.push(repoPath);
    else if (relative.startsWith('docs/')) buckets.docs.push(repoPath);
    else if (relative.startsWith('handoffs/')) buckets.handoffs.push(repoPath);
    else if (relative.startsWith('tasks/')) buckets.tasks.push(repoPath);
  }
  return buckets;
}

async function walkArtifactFiles(base, current, result) {
  const entries = await readdir(current, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory() && ARTIFACT_SKIPPED_DIRS.has(entry.name)) continue;
    if (entry.isDirectory()) await walkArtifactFiles(base, absolute, result);
    else if (entry.isFile() && /\.(?:md|json|ya?ml)$/i.test(entry.name)) {
      result.push(normalizeRelativePath(path.relative(base, absolute)));
    }
  }
}

async function readGitEvidence(root) {
  try {
    const { stdout } = await execFileAsync('git', ['status', '--short'], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 5 * 1024 * 1024,
    });
    return {
      paths: stdout
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => normalizeRelativePath(line.slice(3).trim())),
      commands: ['git status --short'],
    };
  } catch {
    return { paths: [], commands: [] };
  }
}

function parseSummaryMetadata(text) {
  const block = extractFrontmatter(text);
  const result = { fingerprints: {} };
  let section = null;
  for (const line of block.split(/\r?\n/)) {
    const top = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*?)\s*$/);
    if (top) {
      const [, key, raw] = top;
      section = raw ? null : key;
      if (key === 'fingerprints' && !raw) {
        result.fingerprints ??= {};
      } else {
        result[key] = parseScalar(raw);
      }
      continue;
    }
    const nested = line.match(/^\s{2}([A-Za-z][A-Za-z0-9_-]*):\s*(.*?)\s*$/);
    if (nested && section === 'fingerprints') {
      result.fingerprints[nested[1]] = parseScalar(nested[2]);
    }
  }
  return result;
}

function extractDeclaredEntrypoints(text) {
  if (!text) return [];
  const frontmatter = extractFrontmatter(text);
  const inline = frontmatter.match(/^\s*key_entrypoints:\s*\[(.*?)\]\s*$/m);
  if (inline) {
    return inline[1]
      .split(',')
      .map((item) => parseScalar(item))
      .filter(isNonEmptyString);
  }
  const block = frontmatter.match(
    /^\s*key_entrypoints:\s*\r?\n((?:\s+-\s+.*(?:\r?\n|$))+)/m
  );
  if (!block) return [];
  return block[1]
    .split(/\r?\n/)
    .map((line) => line.match(/^\s+-\s+(.*?)\s*$/)?.[1])
    .filter(Boolean)
    .map(parseScalar)
    .filter(isNonEmptyString);
}

function collectPackageEntrypoints(manifestPath, manifest) {
  const fields = {
    main: manifest.main ?? null,
    bin: manifest.bin ?? null,
    exports: manifest.exports ?? null,
    module: manifest.module ?? null,
    browser: manifest.browser ?? null,
    types: manifest.types ?? null,
  };
  const base = path.posix.dirname(manifestPath);
  const values = [];
  collectStringLeaves(fields, values);
  const paths = values
    .filter(looksLikeEntrypointPath)
    .map((value) => normalizeRelativePath(path.posix.join(base === '.' ? '' : base, value)))
    .sort();
  return { fields, paths: [...new Set(paths)] };
}

function collectStringLeaves(value, output) {
  if (typeof value === 'string') {
    output.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStringLeaves(item, output));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectStringLeaves(item, output));
  }
}

function looksLikeEntrypointPath(value) {
  return (
    value.startsWith('./') ||
    value.startsWith('../') ||
    /[\\/]/.test(value) ||
    /\.[cm]?[jt]sx?$/.test(value)
  );
}

function extractFrontmatter(text) {
  const normalized = text.replace(/^\uFEFF/, '');
  if (!normalized.startsWith('---')) return '';
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  return match?.[1] ?? '';
}

function parseScalar(value) {
  const trimmed = value.trim();
  if (/^(?:null|none)$/i.test(trimmed)) return null;
  if (/^(?:true|false)$/i.test(trimmed)) return trimmed === 'true';
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  return trimmed.replace(/^(['"])([\s\S]*)\1$/, '$2');
}

function hashRecords(records) {
  if (records.length === 0) return 'unknown';
  const hash = createHash('sha256');
  for (const record of [...records].sort()) hash.update(record).update('\0');
  return `sha256:${hash.digest('hex')}`;
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function safeJsonParse(value) {
  try {
    return typeof value === 'string' ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeRelativePath(value) {
  return String(value ?? '').replaceAll('\\', '/').replace(/^\.\//, '');
}

function isSkippedPath(relativePath) {
  const parts = normalizeRelativePath(relativePath).split('/');
  return parts.some((part) => SKIPPED_DIRS.has(part));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const result = await assembleProjectContext({
    root: args.root,
    requestScope: args.request,
    explicitFiles: args['explicit-file'] ?? [],
    taskShape: args['task-shape'] ?? 'small',
    changeRef: args['change-ref'],
    writesAllowed: false,
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith('--')) throw new Error(`Unknown argument: ${key}`);
    const name = key.slice(2);
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) throw new Error(`Missing value for --${name}`);
    index += 1;
    if (name === 'explicit-file') {
      result[name] ??= [];
      result[name].push(value);
    } else {
      result[name] = value;
    }
  }
  return result;
}

const isDirectRun =
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === pathToFileURL(fileURLToPath(import.meta.url)).href;

if (isDirectRun) {
  main().catch((error) => {
    process.stderr.write(`${error?.stack ?? error}\n`);
    process.exitCode = 1;
  });
}
