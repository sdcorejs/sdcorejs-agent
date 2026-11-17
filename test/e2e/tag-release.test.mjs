import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, writeFileSync, mkdirSync, symlinkSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { parseTag, verifyRelease, buildRelease, runNpm } from '../../scripts/release.mjs';
import { parse } from 'yaml';

const root = fileURLToPath(new URL('../..', import.meta.url));
const temporary = () => mkdtempSync(path.join(tmpdir(), 'sdcorejs-release-test-'));
const json = file => JSON.parse(readFileSync(file, 'utf8'));
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

test('tag version is exact SemVer; prereleases never use latest', () => {
  assert.deepEqual(parseTag('1.0.0'), { version: '1.0.0', distTag: 'latest', prerelease: false });
  assert.deepEqual(parseTag('1.2.3-rc.1'), { version: '1.2.3-rc.1', distTag: 'next', prerelease: true });
  for (const tag of ['v1.0.0', '01.0.0', '1.0', '1.0.0+build', '1.0.0-01', '1.0.0\n', '1.0.0;echo bad', '--help', '../1.0.0']) {
    assert.throws(() => parseTag(tag), /tag/i, tag);
  }
});

test('release requires the tag at HEAD, clean source, and main ancestry', () => {
  const repo = temporary();
  git(repo, 'init', '-b', 'main');
  git(repo, 'config', 'user.name', 'Release Fixture');
  git(repo, 'config', 'user.email', 'fixture@example.invalid');
  writeFileSync(path.join(repo, 'source'), 'one');
  git(repo, 'add', '.'); git(repo, 'commit', '-m', 'fixture');
  git(repo, 'update-ref', 'refs/remotes/origin/main', 'HEAD');
  git(repo, 'tag', '-a', '1.0.0', '-m', 'fixture');
  assert.equal(verifyRelease(repo, '1.0.0').sourceCommit, git(repo, 'rev-parse', 'HEAD'));
  writeFileSync(path.join(repo, 'source'), 'dirty');
  assert.throws(() => verifyRelease(repo, '1.0.0'), /clean/i);
  git(repo, 'add', '.'); git(repo, 'commit', '-m', 'unmerged');
  assert.throws(() => verifyRelease(repo, '1.0.0'), /HEAD/i);
  git(repo, 'tag', '1.0.1');
  assert.throws(() => verifyRelease(repo, '1.0.1'), /main/i);
});

test('staging refuses a symlink in the tracked skill inputs before creating output', { skip: process.platform === 'win32' && 'File symlink privileges are not assumed on Windows' }, () => {
  const work = temporary();
  const repo = path.join(work, 'repo'); mkdirSync(repo);
  git(repo, 'init', '-b', 'main');
  git(repo, 'config', 'user.name', 'Release Fixture');
  git(repo, 'config', 'user.email', 'fixture@example.invalid');
  mkdirSync(path.join(repo, 'codex/skills'), { recursive: true });
  writeFileSync(path.join(work, 'private.md'), 'do not distribute');
  symlinkSync(path.join(work, 'private.md'), path.join(repo, 'codex/skills/leak.md'));
  git(repo, 'add', '.'); git(repo, 'commit', '-m', 'fixture');
  const out = path.join(work, 'output');
  assert.throws(() => buildRelease({ root: repo, tag: '1.0.0', out, preview: true }), /symlink/i);
  assert.equal(existsSync(out), false);
});

test('real archives carry tag versions, all public skills and refs, without authoring or install hooks', t => {
  const work = temporary();
  t.after(() => rmSync(work, { recursive: true, force: true }));
  const before = readFileSync(path.join(root, 'package.json'));
  const result = buildRelease({ root, tag: '1.0.0', out: path.join(work, 'first'), preview: true });
  const second = buildRelease({ root, tag: '1.0.0', out: path.join(work, 'second'), preview: true });
  assert.equal(result.version, '1.0.0');
  assert.equal(result.preview, true);
  assert.equal(result.skillCount, 25);
  assert.deepEqual(result.artifacts, second.artifacts, 'reproducible bytes');
  const extracted = path.join(work, 'installed'); mkdirSync(extracted);
  execFileSync('tar', ['-xzf', path.join(work, 'first', 'sdcorejs-agent-1.0.0.tgz'), '-C', extracted]);
  const pkgRoot = path.join(extracted, 'package');
  const pkg = json(path.join(pkgRoot, 'package.json'));
  assert.equal(pkg.name, 'sdcorejs-agent');
  assert.equal(pkg.version, '1.0.0');
  assert.deepEqual(pkg.publishConfig, { access: 'public' });
  assert.equal(pkg.private, undefined);
  assert.equal(pkg.scripts, undefined);
  assert.deepEqual(pkg.bin, { 'sdcorejs-agent': './bin/skills.mjs' });
  assert.equal(pkg.dependencies, undefined);
  assert.equal(json(path.join(pkgRoot, 'plugin.json')).version, '1.0.0');
  assert.equal(json(path.join(pkgRoot, 'plugin.json')).name, 'sdcorejs-agent');
  assert.ok(existsSync(path.join(pkgRoot, 'skills/sdcorejs-design/SKILL.md')));
  assert.ok(existsSync(path.join(pkgRoot, 'skills/_refs/design/visual-library/select-patterns.mjs')));
  // Exercise a shipped helper using only the extracted payload.
  execFileSync(process.execPath, [path.join(pkgRoot, 'skills/_refs/design/visual-library/select-patterns.mjs'), 'business-app', 'manage-records']);
  for (const name of ['authoring', 'node_modules', '.git', 'hooks', 'site', 'test', '.sdcorejs']) {
    assert.equal(existsSync(path.join(pkgRoot, name)), false, name);
  }
  const zipped = execFileSync('python3', ['-c', 'import zipfile,sys,json; z=zipfile.ZipFile(sys.argv[1]); print(z.read("plugin.json").decode()); assert len([n for n in z.namelist() if n.endswith("/SKILL.md")]) == 25; assert not any(n.startswith(("hooks/", "authoring/")) for n in z.namelist())', path.join(work, 'first', 'sdcorejs-agent-openai-1.0.0.zip')], { encoding: 'utf8' });
  const openai = JSON.parse(zipped);
  assert.equal(openai.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
  assert.equal(openai.version, '1.0.0');
  assert.equal(openai.name, pkg.name);
  assert.equal(openai.extensions['com.openai'].interface.logo, './assets/logo.png');
  assert.ok(readFileSync(path.join(work, 'first', 'SHA256SUMS'), 'utf8').includes('  release-notes.md\n'));
  const claude = execFileSync('python3', ['-c', 'import zipfile,sys; z=zipfile.ZipFile(sys.argv[1]); assert {"README.md",".claude-plugin/icon.png"} <= set(z.namelist()); print(z.read(".claude-plugin/plugin.json").decode())', path.join(work, 'first', 'sdcorejs-agent-claude-1.0.0.zip')], { encoding: 'utf8' });
  assert.equal(JSON.parse(claude).version, '1.0.0');
  // Claude invokes the polyglot wrapper through the platform shell.
  const claudeRoot = path.join(work, 'claude-installed'); mkdirSync(claudeRoot);
  execFileSync('python3', ['-c', 'import zipfile,sys,os; z=zipfile.ZipFile(sys.argv[1]); z.extractall(sys.argv[2]); [(os.chmod(os.path.join(sys.argv[2],i.filename), i.external_attr >> 16)) for i in z.infolist()]', path.join(work, 'first', 'sdcorejs-agent-claude-1.0.0.zip'), claudeRoot]);
  const hookOptions = { cwd: claudeRoot, encoding: 'utf8', env: { ...process.env, CLAUDE_PLUGIN_ROOT: claudeRoot } };
  const bootstrap = process.platform === 'win32'
    ? execFileSync(process.env.ComSpec || 'cmd.exe', ['/d', '/c', 'hooks\\run-hook.cmd', 'session-start'], hookOptions)
    : execFileSync('sh', ['hooks/run-hook.cmd', 'session-start'], hookOptions);
  assert.match(bootstrap, /sdcorejs-using-skills/);
  testTarballInstallation(work, path.join(work, 'first', 'sdcorejs-agent-1.0.0.tgz'));
  assert.deepEqual(readFileSync(path.join(root, 'package.json')), before);
  assert.equal(execFileSync('tar', ['-tzf', path.join(work, 'first', 'sdcorejs-agent-1.0.0.tgz')], { encoding: 'utf8' }).split(/\r?\n/).filter(file => file.endsWith('/SKILL.md')).length, 25);
  assert.throws(() => buildRelease({ root, tag: '1.0.0', out: path.join(work, 'first'), preview: true }), /exist/i);
  assert.throws(() => buildRelease({ root, tag: '1.0.0', out: path.join(root, 'dist-release'), preview: true }), /outside/i);
});

test('release workflow binds publishing to validated tags and complete CI', () => {
  const workflow = parse(readFileSync(path.join(root, '.github/workflows/release.yml'), 'utf8'));
  assert.deepEqual(Object.keys(workflow.on), ['push']);
  assert.ok(workflow.on.push.tags.length);
  assert.equal(workflow.permissions.contents, 'read');
  assert.match(workflow.concurrency.group, /github\.ref/);
  assert.equal(workflow.concurrency['cancel-in-progress'], false);
  assert.equal(workflow.jobs.ci.uses, './.github/workflows/ci.yml');
  assert.ok(workflow.jobs.publish.needs.includes('ci'));
  assert.ok(workflow.jobs.publish.needs.includes('validate'));
  assert.equal(workflow.jobs.publish.permissions['id-token'], 'write');
  const steps = workflow.jobs.publish.steps;
  const run = steps.filter(s => s.run).map(s => s.run).join('\n');
  assert.match(run, /release\.mjs build --tag "\$RELEASE_TAG"/);
  assert.match(run, /npm publish "\$RELEASE_DIR\/sdcorejs-agent-\$RELEASE_TAG\.tgz"/);
  assert.match(steps.find(s => s.run?.includes('npm publish ')).run, /--access public\b/);
  assert.doesNotMatch(run, /--preview|continue-on-error|\|\| true/);
  assert.match(run, /npm view sdcorejs-agent versions --json/);
  assert.match(run, /published.includes\(process.env.RELEASE_TAG\)/);
  assert.match(run, /--verify-tag/);
  const uploadIndex = steps.findIndex(s => s.uses?.startsWith('actions/upload-artifact@'));
  const publishIndex = steps.findIndex(s => s.run?.includes('npm publish '));
  assert.ok(uploadIndex >= 0 && publishIndex > uploadIndex, 'retain archives before external publication');
  assert.ok(workflow.jobs.ci.needs === 'validate');
  assert.match(workflow.jobs.validate.if, /github\.repository == 'sdcorejs\/sdcorejs-agent'/);
  assert.match(workflow.jobs.validate.if, /github\.ref_type == 'tag'/);
  assert.match(workflow.jobs.validate.steps.filter(s => s.run).map(s => s.run).join('\n'), /release\.mjs verify --tag "\$RELEASE_TAG"/);
  assert.equal(workflow.jobs.publish.environment, 'npm');
  assert.doesNotMatch(JSON.stringify(workflow.jobs.publish.env), /runner\./,
    'runner context is unavailable in job-level env');
  assert.match(run, /RELEASE_DIR="\$RUNNER_TEMP\/sdcorejs-release"/);
  assert.match(run, />> "\$GITHUB_ENV"/);
  assert.match(run, /npm@11\.15\.0/);
  assert.doesNotMatch(readFileSync(path.join(root, 'scripts/release.mjs'), 'utf8'), /['"]publish['"]|\bnpm publish\b/, 'builder cannot publish');
  assert.equal(parse(readFileSync(path.join(root, '.github/workflows/ci.yml'), 'utf8')).on.workflow_call, null);
});

function testTarballInstallation(work, tarball) {
  const consumer = path.join(work, 'clean project');
  const home = path.join(work, 'fake home');
  mkdirSync(consumer);
  mkdirSync(home);
  const env = { ...process.env, HOME: home, USERPROFILE: home };
  writeFileSync(path.join(consumer, 'package.json'), '{"private":true}');
  writeFileSync(path.join(consumer, 'AGENTS.md'), 'user instructions');
  writeFileSync(path.join(consumer, 'CLAUDE.md'), 'user instructions');
  runNpm(['install', '--offline', '--ignore-scripts', '--no-audit', '--no-fund', tarball], consumer, { env });
  const cli = (...args) => {
    const bin = path.join('node_modules', '.bin', 'sdcorejs-agent');
    const options = { cwd: consumer, env, encoding: 'utf8' };
    return process.platform === 'win32'
      ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/c', `${bin}.cmd`, ...args], options)
      : spawnSync(path.join(consumer, bin), args, options);
  };
  function check(expected, ...args) {
    const result = cli(...args);
    assert.equal(result.status, expected, result.stderr || String(result.error || ''));
    return result.stdout;
  }

  const codex = ['--agent', 'codex', '--scope', 'project'];
  const claude = ['--agent', 'claude-code', '--scope', 'user'];
  const target = path.join(consumer, '.agents/skills');
  const claudeTarget = path.join(home, '.claude/skills');
  assert.equal(check(0, 'list').trim().split(/\r?\n/).length, 25);
  assert.equal(existsSync(target), false, 'npm install has no agent side effects');
  check(0, 'install', ...codex, '--dry-run');
  assert.equal(existsSync(target), false);
  symlinkSync(home, path.join(consumer, '.agents'), process.platform === 'win32' ? 'junction' : 'dir');
  check(1, 'install', ...codex);
  assert.equal(existsSync(path.join(home, 'skills')), false);
  rmSync(path.join(consumer, '.agents'));
  mkdirSync(path.join(target, '_refs'), { recursive: true });
  check(1, 'install', ...codex);
  assert.equal(existsSync(path.join(target, 'sdcorejs-design')), false);
  rmSync(path.join(target, '_refs'), { recursive: true });
  mkdirSync(path.join(target, 'unrelated-skill'));
  check(0, 'install', ...codex);
  check(0, 'install', ...claude);
  assert.match(check(0, 'install', ...codex), /already installed/);
  for (const folder of [target, claudeTarget]) {
    const skills = readdirSync(folder).filter(name => name.startsWith('sdcorejs-'));
    assert.equal(skills.length, 25);
    for (const skill of skills) {
      const directory = path.join(folder, skill);
      for (const [, ref] of readFileSync(path.join(directory, 'SKILL.md'), 'utf8').matchAll(/\.\.\/_refs\/([A-Za-z0-9_./<>{}*-]+)/g)) {
        if (/[<>{}*]/.test(ref)) continue;
        assert.ok(existsSync(path.resolve(directory, '../_refs', ref.replace(/[.]+$/, ''))), `${skill}: ${ref}`);
      }
    }
    execFileSync(process.execPath, [path.join(folder, '_refs/design/visual-library/select-patterns.mjs'), 'business-app', 'manage-records']);
  }
  const changed = path.join(target, 'sdcorejs-design/SKILL.md');
  const original = readFileSync(changed);
  writeFileSync(changed, 'local edits');
  check(1, 'uninstall', ...codex);
  assert.equal(readFileSync(changed, 'utf8'), 'local edits');
  writeFileSync(changed, original);
  check(0, 'uninstall', ...codex, '--dry-run');
  assert.ok(existsSync(changed));
  check(0, 'uninstall', ...codex);
  check(0, 'uninstall', ...claude);
  assert.equal(existsSync(changed), false);
  assert.equal(existsSync(path.join(claudeTarget, '_refs')), false);
  assert.ok(existsSync(path.join(target, 'unrelated-skill')));
  for (const file of ['AGENTS.md', 'CLAUDE.md']) {
    assert.equal(readFileSync(path.join(consumer, file), 'utf8'), 'user instructions');
  }
}
