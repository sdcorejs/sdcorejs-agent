import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const json = file => JSON.parse(readFileSync(file, 'utf8'));
const run = (command, args, cwd, options = {}) => execFileSync(command, args, {
  cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], ...options,
}).trim();
const git = (root, ...args) => run('git', args, root);
const save = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
const digest = file => createHash('sha256').update(readFileSync(file)).digest('hex');

export function runNpm(args, cwd, options) {
  if (process.env.npm_execpath) return run(process.execPath, [process.env.npm_execpath, ...args], cwd, options);
  if (process.platform !== 'win32') return run('npm', args, cwd, options);
  const npmCommand = run('where.exe', ['npm.cmd'], cwd).split(/\r?\n/)[0];
  const cli = path.join(path.dirname(npmCommand), 'node_modules/npm/bin/npm-cli.js');
  return run(process.execPath, [cli, ...args], cwd, options);
}

export function parseTag(tag) {
  // No v alias or build metadata: one immutable Git tag per registry version.
  const number = '(?:0|[1-9][0-9]*)';
  const identifier = `(?:${number}|[0-9]*[A-Za-z-][0-9A-Za-z-]*)`;
  const pattern = new RegExp(`^${number}\\.${number}\\.${number}(?:-${identifier}(?:\\.${identifier})*)?$`);
  if (typeof tag !== 'string' || tag.length > 128 || !pattern.test(tag) || /\s/.test(tag)) {
    throw new Error('Release tag must be bare SemVer, for example 1.0.0 or 1.1.0-rc.1 (no v prefix or build metadata).');
  }
  const prerelease = tag.includes('-');
  return { version: tag, distTag: prerelease ? 'next' : 'latest', prerelease };
}

export function verifyRelease(root, tag) {
  const version = parseTag(tag);
  const sourceCommit = git(root, 'rev-parse', 'HEAD');
  const taggedCommit = git(root, 'rev-parse', '--verify', `refs/tags/${tag}^{commit}`);
  if (sourceCommit !== taggedCommit) throw new Error('Release tag must resolve to the checked-out HEAD.');
  if (git(root, 'status', '--porcelain', '--untracked-files=all')) throw new Error('Release requires a clean working tree.');
  try {
    git(root, 'merge-base', '--is-ancestor', sourceCommit, 'refs/remotes/origin/main');
  } catch {
    throw new Error('Release commit must already belong to origin/main; fetch main before verification.');
  }
  return { ...version, sourceCommit };
}

function trackedFiles(root, prefix) {
  const files = git(root, 'ls-files', '-z', '--', prefix).split('\0').filter(Boolean).sort();
  if (!files.length) throw new Error(`Missing tracked release input: ${prefix}`);
  for (const file of files) {
    if (!file.startsWith(`${prefix}/`) && file !== prefix) throw new Error(`Unexpected input: ${file}`);
    // Check every component: a tracked file beneath a replaced symlink is unsafe too.
    let current = root;
    for (const component of file.split('/')) {
      current = path.join(current, component);
      if (lstatSync(current).isSymbolicLink()) throw new Error(`Symlink release input: ${file}`);
    }
    if (!lstatSync(current).isFile()) throw new Error(`Non-file release input: ${file}`);
  }
  return files;
}

function copyInputs(root, files, from, dest, modes) {
  for (const file of files) {
    const target = path.join(dest, path.posix.relative(from, file));
    mkdirSync(path.dirname(target), { recursive: true });
    copyFileSync(path.join(root, file), target);
    // Git records executable intent even on hosts that do not preserve POSIX modes.
    chmodSync(target, modes[file] === '100755' ? 0o755 : 0o644);
  }
}

function zip(source, destination, executablePaths = []) {
  // Fixed timestamps, modes and order make identical inputs reproducible.
  run('python3', ['-c', `import json,pathlib,sys,zipfile
root=pathlib.Path(sys.argv[1])
executables=set(json.loads(sys.argv[3]))
with zipfile.ZipFile(sys.argv[2], 'x', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
 for file in sorted(root.rglob('*')):
  if file.is_file():
   entry=zipfile.ZipInfo(file.relative_to(root).as_posix(), (1980,1,1,0,0,0))
   entry.create_system=3
   entry.external_attr=(0o100755 if entry.filename in executables else 0o100644)<<16
   entry.compress_type=zipfile.ZIP_DEFLATED
   archive.writestr(entry, file.read_bytes(), compresslevel=9)
`, source, destination, JSON.stringify(executablePaths)], source);
}

export function buildRelease({ root = ROOT, tag, out, preview = false }) {
  root = realpathSync(root);
  const identity = preview
    ? { ...parseTag(tag), sourceCommit: git(root, 'rev-parse', 'HEAD') }
    : verifyRelease(root, tag);
  if (!out) throw new Error('An output directory outside the repository is required.');
  out = path.resolve(out);
  // Require an existing real parent and a fresh child; never overwrite outputs.
  const parent = realpathSync(path.dirname(out));
  out = path.join(parent, path.basename(out));
  const relative = path.relative(root, out);
  if (!relative || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) {
    throw new Error('Release output must be outside the repository.');
  }
  if (existsSync(out)) throw new Error('Release output already exists. Choose a fresh directory.');

  const skills = trackedFiles(root, 'codex/skills');
  const claudeFiles = trackedFiles(root, 'plugin');
  const extra = ['LICENSE', 'images/plugin-icon.png'].flatMap(file => trackedFiles(root, file));
  const skillNames = skills.filter(file => /^codex\/skills\/[^/]+\/SKILL\.md$/.test(file));
  if (skillNames.length !== 25) throw new Error(`Expected 25 public skills, found ${skillNames.length}.`);
  const inputs = [...skills, ...claudeFiles, ...extra, 'scripts/release.mjs',
    'scripts/release-package-readme.md', 'scripts/release-claude-readme.md',
    'scripts/install-skills.mjs', 'package.json'].sort();
  const sourceFiles = Object.fromEntries(inputs.map(file => [file, digest(path.join(root, file))]));
  const indexModes = Object.fromEntries(git(root, 'ls-files', '--stage', '-z').split('\0').filter(Boolean).map(record => {
    const tab = record.indexOf('\t');
    return [record.slice(tab + 1), record.slice(0, 6)];
  }));
  const sourceModes = Object.fromEntries(inputs.map(file => [file, indexModes[file] ?? '100644']));
  sourceModes['scripts/install-skills.mjs'] = '100755';
  const sourceHash = createHash('sha256').update(JSON.stringify({ sourceFiles, sourceModes })).digest('hex');
  const { version, sourceCommit, distTag, prerelease } = identity;
  const source = json(path.join(root, 'plugin/.claude-plugin/plugin.json'));
  mkdirSync(out);
  const portable = path.join(out, 'openai');
  const claude = path.join(out, 'claude');
  mkdirSync(portable); mkdirSync(claude);
  copyInputs(root, skills, 'codex', portable, sourceModes);
  copyInputs(root, claudeFiles, 'plugin', claude, sourceModes);
  // The source .cmd checkout uses CRLF, but this polyglot wrapper also executes
  // as a POSIX shell script. LF works for both shell and cmd.exe consumers.
  const wrapper = path.join(claude, 'hooks/run-hook.cmd');
  writeFileSync(wrapper, readFileSync(wrapper, 'utf8').replaceAll('\r\n', '\n'));
  for (const directory of [portable, claude]) {
    copyFileSync(path.join(root, 'LICENSE'), path.join(directory, 'LICENSE'));
  }
  mkdirSync(path.join(portable, 'assets'));
  copyFileSync(path.join(root, 'images/plugin-icon.png'), path.join(portable, 'assets/logo.png'));
  copyFileSync(path.join(root, 'scripts/release-package-readme.md'), path.join(portable, 'README.md'));
  save(path.join(portable, 'plugin.json'), {
    $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
    ...source, version,
    extensions: { 'com.openai': { interface: {
      displayName: 'SDCoreJS Agent',
      shortDescription: 'Plan, design, implement and review with reusable engineering skills.',
      developerName: 'SDCoreJS', category: 'Productivity',
      websiteURL: source.homepage, supportURL: `${source.homepage}/issues`,
      composerIcon: './assets/logo.png', logo: './assets/logo.png',
      defaultPrompt: ['Use sdcorejs-explore to summarize this repository and its verification commands. Stay read-only.'],
    } } },
  });
  copyFileSync(path.join(root, 'images/plugin-icon.png'), path.join(claude, '.claude-plugin/icon.png'));
  copyFileSync(path.join(root, 'scripts/release-claude-readme.md'), path.join(claude, 'README.md'));
  // Only staged metadata changes. The source checkout stays untouched.
  writeFileSync(path.join(claude, '.claude-plugin/plugin.json'), `${JSON.stringify({ ...source, version }, null, 2)}\n`);
  const binding = { version, sourceCommit, sourceHash, preview, skillCount: skillNames.length };
  save(path.join(portable, 'release-source.json'), binding);
  save(path.join(claude, 'release-source.json'), binding);
  const openaiZip = `sdcorejs-agent-openai-${version}.zip`;
  const claudeZip = `sdcorejs-agent-claude-${version}.zip`;
  zip(portable, path.join(out, openaiZip), skills.filter(file => sourceModes[file] === '100755').map(file => file.slice('codex/'.length)));
  zip(claude, path.join(out, claudeZip), claudeFiles.filter(file => sourceModes[file] === '100755').map(file => file.slice('plugin/'.length)));
  mkdirSync(path.join(portable, 'bin'));
  copyFileSync(path.join(root, 'scripts/install-skills.mjs'), path.join(portable, 'bin/skills.mjs'));
  chmodSync(path.join(portable, 'bin/skills.mjs'), 0o755);
  save(path.join(portable, 'package.json'), {
    name: 'sdcorejs-agent', version, description: source.description, license: source.license,
    publishConfig: { access: 'public' },
    type: 'module', repository: { type: 'git', url: 'git+https://github.com/sdcorejs/sdcorejs-agent.git' },
    homepage: source.homepage, bugs: { url: `${source.homepage}/issues` },
    bin: { 'sdcorejs-agent': './bin/skills.mjs' },
    keywords: source.keywords,
    files: ['bin/', 'skills/', 'assets/', 'plugin.json', 'release-source.json', 'README.md', 'LICENSE'],
    engines: { node: '^22.22.3 || ^24.15.0 || >=26.0.0' },
  });
  const [packed] = JSON.parse(runNpm(['pack', '--ignore-scripts', '--json', '--pack-destination', out], portable));
  if (packed.name !== 'sdcorejs-agent' || packed.version !== version || packed.filename !== `sdcorejs-agent-${version}.tgz`) {
    throw new Error('Unexpected npm archive identity.');
  }
  const artifacts = Object.fromEntries([packed.filename, openaiZip, claudeZip].map(file => [file, digest(path.join(out, file))]));
  const toolchain = { node: process.version, npm: runNpm(['--version'], portable), python: run('python3', ['--version'], portable) };
  const manifest = { ...binding, distTag, prerelease, artifacts, npmIntegrity: packed.integrity, sourceFiles, sourceModes, toolchain };
  save(path.join(out, 'release-manifest.json'), manifest);
  const ciRun = process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : 'not run by this local build';
  writeFileSync(path.join(out, 'release-notes.md'), `SDCoreJS Agent ${version}\n\nSource commit: ${sourceCommit}\n\n25 skills, an explicit npm installer for Codex and Claude Code, and separate OpenAI and Claude Code plugins. All archives use version ${version}.\n\nCI: ${ciRun}\n\nChecksums and source file hashes are in the attached manifests. OpenAI review/publication and live-host activation are separate; they have not been performed by this workflow. Full E2E/live-agent evidence is not implied by CI; see docs/RELEASE_PROCESS.md and CHANGELOG.md at this tag.\n`, { flag: 'wx' });
  const checksums = {
    ...artifacts,
    'release-manifest.json': digest(path.join(out, 'release-manifest.json')),
    'release-notes.md': digest(path.join(out, 'release-notes.md')),
  };
  writeFileSync(path.join(out, 'SHA256SUMS'), Object.entries(checksums).map(([file, hash]) => `${hash}  ${file}\n`).join(''), { flag: 'wx' });
  return manifest;
}

function main(args) {
  const [command, ...rest] = args;
  let tag; let out; let preview = false;
  while (rest.length) {
    const flag = rest.shift();
    if (flag === '--tag') tag = rest.shift();
    else if (flag === '--out') out = rest.shift();
    else if (flag === '--preview' && command === 'build') preview = true;
    else throw new Error(`Unknown option: ${flag}`);
  }
  if (command === 'verify') return verifyRelease(ROOT, tag);
  if (command === 'build') return buildRelease({ tag, out, preview });
  throw new Error('Usage: node scripts/release.mjs verify --tag VERSION | build --tag VERSION --out NEW_DIRECTORY [--preview]');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(main(process.argv.slice(2)), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
