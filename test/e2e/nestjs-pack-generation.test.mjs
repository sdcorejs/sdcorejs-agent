import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { exists, readJson, readRepoFile, repoRoot } from './support/nestjs-pack-validator.mjs';

const execFileAsync = promisify(execFile);

test('canonical generator and both profile contracts exist', async () => {
  assert.equal(await exists('_refs/nestjs/generator/generate-project.mjs'), true, 'missing canonical generator');
  assert.equal(await exists('_refs/nestjs/pack-manifest.json'), true, 'missing pack manifest');
  assert.equal(await exists('_refs/nestjs/profile-contract.json'), true, 'missing profile contract');
});

test('manifest declares simple and enterprise generation with non-mutating verification', async () => {
  const manifest = await readJson('_refs/nestjs/pack-manifest.json');
  assert.deepEqual(Object.keys(manifest.profiles).sort(), ['enterprise', 'simple']);
  assert.equal(manifest.verification.every((entry) => entry.mutates === false), true);
});

test('orchestrator resolves one profile and propagates it to every pack', async () => {
  const orchestrator = await readRepoFile('skills/tracks/nestjs/sdcorejs-nestjs.md');
  assert.match(orchestrator, /pack-manifest\.json/u);
  assert.match(orchestrator, /profile-contract\.json/u);
  assert.match(orchestrator, /resolved profile/iu);
});

test('generator renders deterministic simple and enterprise projects', async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-nestjs-generation-'));
  try {
    for (const profile of ['simple', 'enterprise']) {
      const output = path.join(tempRoot, profile);
      await execFileAsync(process.execPath, [
        path.join(repoRoot, '_refs/nestjs/generator/generate-project.mjs'),
        '--profile', profile,
        '--output', output,
      ], { cwd: repoRoot });
      const packageJson = JSON.parse(await readFile(path.join(output, 'package.json'), 'utf8'));
      const scope = await readFile(path.join(output, 'src/scope/scope-contract.ts'), 'utf8');
      assert.equal(packageJson.engines.node, '>=18.18');
      assert.equal(packageJson.dependencies['@nestjs/core'].startsWith('^11.'), true);
      assert.match(scope, new RegExp(`profile = '${profile}'`, 'u'));
      if (profile === 'simple') assert.doesNotMatch(scope, /tenantCode/u);
      else assert.match(scope, /tenantCode/u);
    }
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test('generator rejects an output path that escapes the declared output root', async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-nestjs-boundary-'));
  try {
    await assert.rejects(execFileAsync(process.execPath, [
      path.join(repoRoot, '_refs/nestjs/generator/generate-project.mjs'),
      '--profile', 'simple',
      '--output-root', tempRoot,
      '--output', path.join(tempRoot, '..', 'escaped'),
    ], { cwd: repoRoot }), /outside output root|escapes/iu);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test('read-only generation emits no mutation controller or route audit record', async () => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-nestjs-readonly-'));
  try {
    const output = path.join(tempRoot, 'read-only');
    await execFileAsync(process.execPath, [
      path.join(repoRoot, '_refs/nestjs/generator/generate-project.mjs'),
      '--profile', 'enterprise',
      '--read-only',
      '--output', output,
    ], { cwd: repoRoot });
    const controller = await readFile(path.join(output, 'src/items/item.controller.ts'), 'utf8');
    const audit = await readFile(path.join(output, 'src/items/item-route-audit.ts'), 'utf8');
    assert.doesNotMatch(controller, /@(Post|Put|Patch|Delete)\b/u);
    assert.doesNotMatch(audit, /mutation:\s*true/u);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});

test('force generation rejects symlink or junction ancestors before deleting outside data', async (t) => {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-nestjs-symlink-root-'));
  const outside = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-nestjs-symlink-outside-'));
  const victim = path.join(outside, 'victim');
  const marker = path.join(victim, 'marker.txt');
  await mkdir(victim, { recursive: true });
  await writeFile(marker, 'must-survive', 'utf8');
  try {
    try {
      await symlink(outside, path.join(tempRoot, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
    } catch (error) {
      t.skip(`symlink/junction unavailable: ${error.code}`);
      return;
    }
    await assert.rejects(execFileAsync(process.execPath, [
      path.join(repoRoot, '_refs/nestjs/generator/generate-project.mjs'),
      '--profile', 'simple',
      '--output-root', tempRoot,
      '--output', path.join(tempRoot, 'linked', 'victim'),
      '--force',
    ], { cwd: repoRoot }), /symlink|junction|outside|escape/iu);
    await access(marker);
    assert.equal(await readFile(marker, 'utf8'), 'must-survive');
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});

test('force generation rejects a case-different sibling outside output root on Linux', async (t) => {
  if (process.platform !== 'linux') {
    t.skip('Linux-only regression for case-sensitive path comparison.');
    return;
  }
  const tempParent = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-nestjs-case-boundary-'));
  const outputRoot = path.join(tempParent, 'Safe');
  const sibling = path.join(tempParent, 'safe');
  const victim = path.join(sibling, 'victim');
  const marker = path.join(victim, 'marker.txt');
  await mkdir(outputRoot, { recursive: true });
  await mkdir(victim, { recursive: true });
  await writeFile(marker, 'must-survive', 'utf8');
  try {
    await assert.rejects(execFileAsync(process.execPath, [
      path.join(repoRoot, '_refs/nestjs/generator/generate-project.mjs'),
      '--profile', 'simple',
      '--output-root', outputRoot,
      '--output', victim,
      '--force',
    ], { cwd: repoRoot }), /outside output root|escapes/iu);
    await access(marker);
    assert.equal(await readFile(marker, 'utf8'), 'must-survive');
  } finally {
    await rm(tempParent, { recursive: true, force: true });
  }
});
