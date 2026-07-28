import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const EXPECTED_RELEASE_VERSION = '0.6.0';
const EXPECTED_SKILL_COUNT = 21;
const CONTRACT_PATH = 'test/e2e/npm-publication-contract.test.mjs';

const HISTORICAL_DOCUMENTATION_FILES = new Set([
  'docs/skill-consolidation-plan.md',
]);

const HISTORICAL_DOCUMENTATION_PREFIXES = [
  'docs/handoff-',
  'docs/superpowers/',
];

const NON_ROOT_PUBLICATION_SURFACE_PREFIXES = [
  '.claude/',
  '.sdcorejs/',
  '_refs/',
  'codex/',
  'docs/',
  'plugin/',
  'site/',
  'skills/',
  'test/',
];

const REQUIRED_DEVELOPMENT_SCRIPTS = [
  'test',
  'test:e2e',
  'test:e2e:repository',
  'check:text-hygiene',
  'check:skills',
  'check:nestjs-pack',
  'sync:skills',
  'check:audit',
  'check:site:audit',
  'build:site',
  'prepare',
];

const REGISTRY_MUTATION_PATTERN =
  /(?:\bnpm\s+(?:(?:--?[\w-]+(?:=\S+)?)\s+)*(?:publish|unpublish|deprecate|pack|owner|access|token|dist-tag)\b|['"]npm['"]\s*,\s*\[\s*['"](?:publish|unpublish|deprecate|pack|owner|access|token|dist-tag)['"])/i;
const ROOT_DEPENDENCY_INSTALL_PATTERN =
  /\bnpm\s+(?:install|i|add)\b[^\r\n]*?\bsdcorejs-agent(?:@[\w.-]+)?\b/i;
const PUBLICATION_AUTH_PATTERN =
  /\b(?:NPM_TOKEN|NODE_AUTH_TOKEN|NPM_CONFIG_PROVENANCE)\b|registry-url|\/\/registry\.npmjs\.org\/:_authToken|--provenance\b|\bprovenance\s*:|\bnpm\s+attest\b|\bnpm\b[^\r\n]*?\bconfig\s+(?:set|delete)\s+registry\b|actions\/attest(?:-build)?-provenance/i;

test('npm publication: detection patterns cover common publication bypass spellings', () => {
  const dependencyInstallCommands = [
    'npm install sdcorejs-agent',
    'npm install -D sdcorejs-agent',
    'npm i -g sdcorejs-agent@0.6.0',
    'npm add --save-dev sdcorejs-agent',
  ];
  const registryMutationCommands = [
    'npm publish',
    'npm --provenance publish',
  ];
  const publicationConfiguration = [
    'npm config set registry https://registry.npmjs.org',
    'NPM_CONFIG_PROVENANCE=true npm publish',
    'provenance: true',
  ];

  for (const command of dependencyInstallCommands) {
    assert.match(command, ROOT_DEPENDENCY_INSTALL_PATTERN);
  }
  for (const command of registryMutationCommands) {
    assert.match(command, REGISTRY_MUTATION_PATTERN);
  }
  for (const configuration of publicationConfiguration) {
    assert.match(configuration, PUBLICATION_AUTH_PATTERN);
  }
});

test('npm publication: active documentation discovery includes supported docs and excludes history', async () => {
  const documentation = (await activeDocumentationFiles())
    .map(file => relative(ROOT, file).replaceAll('\\', '/'));

  for (const file of [
    '.github/copilot-instructions.md',
    'AGENTS.md',
    'CLAUDE.md',
    'MIRROR_POLICY.md',
    'README.md',
    'docs/ADOPTION.md',
    'docs/po-ba-prototype-examples.md',
    'docs/REAL_AGENT_VALIDATION.md',
    'docs/RELEASE_PROCESS.md',
    'docs/TROUBLESHOOTING.md',
    'docs/WORKED_EXAMPLE.md',
  ]) {
    assert.ok(documentation.includes(file), `${file} is an active documentation surface`);
  }

  for (const file of [
    'docs/HANDOFF-2026-06-09-write-user-guide-skill.md',
    'docs/skill-consolidation-plan.md',
    'docs/superpowers/plans/2026-05-20-orchestration-enhancements.md',
  ]) {
    assert.ok(!documentation.includes(file), `${file} remains historical evidence`);
  }
});

test('npm publication: delegated executable and configuration surfaces stay in scan scope', () => {
  const activeSurfaces = [
    '.github/actions/release/action.yml',
    'bin/release.js',
    'package.json',
    'release/publish-root.ts',
    'scripts/release.mjs',
    'tools/release.ps1',
  ];
  const excludedSurfaces = [
    CONTRACT_PATH,
    '_refs/release.mjs',
    'docs/RELEASE_PROCESS.md',
    'package-lock.json',
    'site/scripts/release.mjs',
    'skills/release.md',
    'test/e2e/release.test.mjs',
  ];

  for (const file of activeSurfaces) {
    assert.equal(isActiveRootPublicationSurface(file), true, `${file} is scanned`);
  }
  for (const file of excludedSurfaces) {
    assert.equal(isActiveRootPublicationSurface(file), false, `${file} is excluded`);
  }

  assert.match("execFileSync('npm', ['publish'])", REGISTRY_MUTATION_PATTERN);
  assert.match('run: npm --provenance publish', REGISTRY_MUTATION_PATTERN);
});

test('npm publication: repository residue scan excludes its own contract source', () => {
  assert.equal(isRepositoryResidueScanTarget(CONTRACT_PATH), false);
  assert.equal(isRepositoryResidueScanTarget('scripts/release.mjs'), true);
});

test('npm publication: root manifest is private tooling without publication metadata', async () => {
  const packageJson = await readJson('package.json');

  assert.equal(packageJson.name, 'sdcorejs-agent');
  assert.equal(packageJson.version, EXPECTED_RELEASE_VERSION);
  assert.equal(packageJson.private, true);
  assert.equal(packageJson.type, 'module');
  assert.equal(packageJson.packageManager, 'npm@10.9.2');
  assert.equal(packageJson.prepare, undefined);
  assert.equal(packageJson.files, undefined);
  assert.equal(packageJson.keywords, undefined);
  assert.equal(packageJson.publishConfig, undefined);
  assert.equal(packageJson.provenance, undefined);
  assert.equal(packageJson.attestations, undefined);
  assert.equal(packageJson.main, undefined);
  assert.equal(packageJson.module, undefined);
  assert.equal(packageJson.exports, undefined);
  assert.equal(packageJson.types, undefined);
  assert.equal(packageJson.bin, undefined);
  assert.deepEqual(packageJson.dependencies ?? {}, {});
  assert.deepEqual(Object.keys(packageJson.devDependencies).sort(), ['lefthook', 'typescript']);
});

test('npm publication: scripts retain development behavior without publish commands or lifecycle hooks', async () => {
  const packageJson = await readJson('package.json');
  const scripts = packageJson.scripts ?? {};

  for (const script of REQUIRED_DEVELOPMENT_SCRIPTS) {
    assert.equal(typeof scripts[script], 'string', `${script} remains available`);
    assert.ok(scripts[script].length > 0, `${script} remains non-empty`);
  }

  assert.equal(scripts.prepare, 'lefthook install');
  assert.match(scripts['test:e2e:repository'], new RegExp(escapeRegExp(CONTRACT_PATH)));

  for (const [name, command] of Object.entries(scripts)) {
    assert.doesNotMatch(name, /publish/i);
    assert.doesNotMatch(name, /^(?:pre|post)?pack$/i);
    assert.doesNotMatch(command, REGISTRY_MUTATION_PATTERN, `${name} is development-only`);
    assert.doesNotMatch(command, PUBLICATION_AUTH_PATTERN, `${name} has no publication auth`);
  }
});

test('npm publication: workflows and repository configuration cannot publish to npm', async () => {
  const workflowFiles = await listFiles('.github/workflows', file => /\.ya?ml$/i.test(file));
  assert.ok(workflowFiles.length > 0, 'repository workflows are present');

  for (const file of workflowFiles) {
    const source = await readFile(file, 'utf8');
    const label = relative(ROOT, file);
    assert.doesNotMatch(source, REGISTRY_MUTATION_PATTERN, label);
    assert.doesNotMatch(source, PUBLICATION_AUTH_PATTERN, label);
  }

  const repositoryFiles = await listFiles('.', () => true, {
    skipDirectories: new Set([
      '.git',
      '.tmp',
      '.cache',
      '.astro',
      'node_modules',
      'dist',
      'coverage',
    ]),
  });
  const npmConfigs = repositoryFiles.filter(file => basename(file).toLowerCase() === '.npmrc');
  assert.deepEqual(npmConfigs.map(file => relative(ROOT, file)), []);

  for (const file of repositoryFiles) {
    const name = relative(ROOT, file).replaceAll('\\', '/');
    if (!isRepositoryResidueScanTarget(name)) {
      continue;
    }
    if (!/\.(?:json|ya?ml|mdx?|mjs|cjs|js|mts|cts|ts|toml|ps1|psm1|sh|cmd|bat)$/i.test(name)) {
      continue;
    }
    const source = await readFile(file, 'utf8');
    assert.doesNotMatch(source, /\/\/registry\.npmjs\.org\/:_authToken/i, name);
    if (isActiveRootPublicationSurface(name)) {
      assert.doesNotMatch(source, REGISTRY_MUTATION_PATTERN, name);
      assert.doesNotMatch(source, PUBLICATION_AUTH_PATTERN, name);
    }
  }
});

test('npm publication: active documentation uses repository release and installation surfaces', async () => {
  const repositoryDocumentation = await activeDocumentationFiles();
  const siteDocumentation = await listFiles(
    'site',
    file => /\.(?:astro|md|mdx)$/i.test(file),
    { skipDirectories: new Set(['node_modules', 'dist', '.astro']) },
  );
  const documentation = [
    ...repositoryDocumentation,
    ...siteDocumentation,
  ];

  for (const file of documentation) {
    const source = await readFile(file, 'utf8');
    const label = relative(ROOT, file);
    assert.doesNotMatch(source, ROOT_DEPENDENCY_INSTALL_PATTERN, label);
    assert.doesNotMatch(source, REGISTRY_MUTATION_PATTERN, label);
    assert.doesNotMatch(source, /\broot npm package\b/i, label);
  }

  const readme = await readText('README.md');
  const release = await readText('docs/RELEASE_PROCESS.md');
  const changelog = await readText('CHANGELOG.md');

  assert.match(readme, /root repository tooling manifest/i);
  assert.match(readme, /not distributed through npm/i);
  assert.match(release, /synchronized\s+repository\/plugin release metadata/i);
  assert.match(release, /Git tags and\s+GitHub releases are the distribution anchors/i);
  assert.doesNotMatch(release, /source package version/i);
  assert.match(changelog, /^## Unreleased$/m);
  assert.match(changelog, /npm publication[\s\S]*remain retired/i);
  assert.match(changelog, /root Node workspace[\s\S]*private/i);
  assert.match(changelog, /provider-neutral semantic actions/i);
});

test('npm publication: lockfile, versions, dependencies, and skill inventories stay synchronized', async () => {
  const packageJson = await readJson('package.json');
  const packageLock = await readJson('package-lock.json');
  const sitePackage = await readJson('site/package.json');
  const siteLock = await readJson('site/package-lock.json');
  const marketplace = await readJson('.claude-plugin/marketplace.json');
  const plugin = await readJson('plugin/.claude-plugin/plugin.json');

  assert.equal(packageLock.name, packageJson.name);
  assert.equal(packageLock.version, EXPECTED_RELEASE_VERSION);
  assert.equal(packageLock.packages[''].name, packageJson.name);
  assert.equal(packageLock.packages[''].version, EXPECTED_RELEASE_VERSION);
  assert.deepEqual(packageLock.packages[''].devDependencies, packageJson.devDependencies);
  assert.equal(packageLock.packages[''].dependencies, undefined);

  const versions = [
    packageJson.version,
    packageLock.version,
    packageLock.packages[''].version,
    sitePackage.version,
    siteLock.version,
    siteLock.packages[''].version,
    marketplace.plugins[0].version,
    plugin.version,
  ];
  assert.deepEqual(new Set(versions), new Set([EXPECTED_RELEASE_VERSION]));

  const sourceNames = await sourceSkillNames();
  const claudeNames = await mirrorSkillNames('.claude/skills');
  const pluginNames = await mirrorSkillNames('plugin/skills');
  const codexNames = await mirrorSkillNames('codex/skills');

  assert.equal(sourceNames.length, EXPECTED_SKILL_COUNT);
  assert.deepEqual(claudeNames, sourceNames);
  assert.deepEqual(pluginNames, sourceNames);
  assert.deepEqual(codexNames, sourceNames);
});

async function readJson(path) {
  return JSON.parse(await readText(path));
}

async function readText(path) {
  return readFile(join(ROOT, path), 'utf8');
}

async function sourceSkillNames() {
  const files = await listFiles('skills', file => file.endsWith('.md'));
  const names = await Promise.all(files.map(async file => {
    const source = await readFile(file, 'utf8');
    return source.match(/^name:\s*(\S+)\s*$/m)?.[1];
  }));
  return names.filter(Boolean).sort();
}

async function mirrorSkillNames(root) {
  const files = await listFiles(root, file => basename(file) === 'SKILL.md');
  return files.map(file => basename(join(file, '..'))).sort();
}

async function activeDocumentationFiles() {
  const rootEntries = await readdir(ROOT, { withFileTypes: true });
  const rootFiles = rootEntries
    .filter(entry => entry.isFile() && /\.(?:md|mdx)$/i.test(entry.name))
    .map(entry => join(ROOT, entry.name));
  const githubFiles = await listFiles('.github', file => /\.(?:md|mdx)$/i.test(file));
  const docsFiles = await listFiles('docs', file => /\.(?:md|mdx)$/i.test(file));
  const files = [...rootFiles, ...githubFiles, ...docsFiles];
  return files.filter(file => {
    const name = relative(ROOT, file).replaceAll('\\', '/').toLowerCase();
    return !HISTORICAL_DOCUMENTATION_FILES.has(name)
      && !HISTORICAL_DOCUMENTATION_PREFIXES.some(prefix => name.startsWith(prefix));
  }).sort();
}

function isActiveRootPublicationSurface(path) {
  const name = path.replaceAll('\\', '/').toLowerCase();
  if (!isRepositoryResidueScanTarget(name)) {
    return false;
  }
  if (name === 'package-lock.json' || name.endsWith('/package-lock.json')) {
    return false;
  }
  if (NON_ROOT_PUBLICATION_SURFACE_PREFIXES.some(prefix => name.startsWith(prefix))) {
    return false;
  }
  return /\.(?:json|ya?ml|toml|mjs|cjs|js|mts|cts|ts|ps1|psm1|sh|cmd|bat)$/i.test(name)
    || ['dockerfile', 'makefile'].includes(basename(name));
}

function isRepositoryResidueScanTarget(path) {
  return path.replaceAll('\\', '/').toLowerCase() !== CONTRACT_PATH.toLowerCase();
}

async function listFiles(path, predicate, options = {}) {
  const root = join(ROOT, path);
  const files = [];
  const skipDirectories = options.skipDirectories ?? new Set();

  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && skipDirectories.has(entry.name)) {
        continue;
      }
      const entryPath = join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(entryPath);
      } else if (entry.isFile() && predicate(entryPath)) {
        files.push(entryPath);
      }
    }
  }

  await visit(root);
  return files.sort();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
