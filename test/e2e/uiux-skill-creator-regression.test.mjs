import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import test from 'node:test';
import { detectInstalledPackage, exactVersionCandidates } from '../../_refs/angular/core-docs-fetch.mjs';
import { selectUiuxReferences } from '../../_refs/design/uiux/select-references.mjs';

const aliases = ['@sdcorejs/angular', '@sd-angular/core'];
async function fixture(run) {
  const root = await mkdtemp(path.join(tmpdir(), 'uiux-skill-creator-'));
  const put = async (relative, data) => {
    const file = path.join(root, relative);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(data));
  };
  try { await run(root, put); } finally {
    const resolved = await realpath(root);
    assert.equal(path.dirname(resolved), await realpath(tmpdir()));
    assert.ok(path.basename(resolved).startsWith('uiux-skill-creator-'));
    await rm(resolved, { recursive: true, force: true });
  }
}

test('R1: exact docs resolve a hoisted dependency from the application workspace', async () => {
  await fixture(async (root, put) => {
    await put('package.json', { name: 'workspace', workspaces: ['apps/portal'] });
    for (const name of aliases) {
      await put('apps/portal/package.json', { name: 'portal', dependencies: { [name]: '^19.0.0' } });
      await put(`node_modules/${name}/package.json`, { name, version: '19.2.4', exports: { '.': './index.js' } });
      await put(`node_modules/${name}/index.js`, {});
      const cwd = path.join(root, 'apps/portal');
      assert.equal(createRequire(path.join(cwd, 'probe.cjs')).resolve(name), path.join(root, 'node_modules', name, 'index.js'));
      assert.deepEqual(detectInstalledPackage(cwd, { exact: true }), { name, version: '19.2.4' });
      assert.deepEqual(exactVersionCandidates({ installedPackage: detectInstalledPackage(cwd, { exact: true }) }), ['19.2.4']);
      await put('apps/plain/package.json', { dependencies: { '@angular/core': '^19.0.0' } });
      for (const exact of [false, true]) {
        assert.equal(detectInstalledPackage(path.join(root, 'apps/plain'), { exact }), null,
          'a sibling plain Angular app must not inherit another workspace package\'s Core UI identity');
      }
      await rm(path.join(root, 'node_modules', name), { recursive: true });
    }
  });
});

test('R1: an application-local installation shadows the hoisted package', async () => {
  await fixture(async (root, put) => {
    const name = '@sd-angular/core';
    await put('apps/portal/package.json', { dependencies: { [name]: '^19.0.0' } });
    await put(`node_modules/${name}/package.json`, { name, version: '19.2.4' });
    await put(`apps/portal/node_modules/${name}/package.json`, { name, version: '19.3.0' });
    await mkdir(path.join(root, 'apps/portal/src'), { recursive: true });
    assert.deepEqual(detectInstalledPackage(path.join(root, 'apps/portal/src'), { exact: true }), { name, version: '19.3.0' });
  });
});

test('R2: the application declaration selects its alias when both are installed', async () => {
  await fixture(async (root, put) => {
    const versions = ['21.0.7', '19.2.4'];
    for (const [i, name] of aliases.entries()) await put(`node_modules/${name}/package.json`, { name, version: versions[i] });
    for (const [i, name] of aliases.entries()) {
      await put('package.json', { dependencies: { [name]: `^${versions[i]}` } });
      for (const exact of [false, true]) assert.deepEqual(detectInstalledPackage(root, { exact }), { name, version: versions[i] });
      assert.deepEqual(exactVersionCandidates({ installedPackage: detectInstalledPackage(root, { exact: true }), version: versions[i] }), [versions[i]]);
    }
  });
});

test('R2: lockfile fallback also respects the declared alias', async () => {
  await fixture(async (root, put) => {
    await put('package-lock.json', { packages: {
      'node_modules/@sdcorejs/angular': { version: '21.0.7' },
      'node_modules/@sd-angular/core': { version: '19.2.4' },
    } });
    await put('package.json', { dependencies: { '@sd-angular/core': '^19.0.0' } });
    assert.deepEqual(detectInstalledPackage(root, { exact: true }), { name: '@sd-angular/core', version: '19.2.4' });
  });
});

test('R2: missing or ambiguous package identity cannot certify the other alias', async () => {
  await fixture(async (root, put) => {
    await put('package.json', { dependencies: { '@sd-angular/core': '^19.0.0' } });
    await put('node_modules/@sdcorejs/angular/package.json', { name: '@sdcorejs/angular', version: '21.0.7' });
    assert.equal(detectInstalledPackage(root, { exact: true }), null);
    await put('package.json', { dependencies: { '@sd-angular/core': '^19.0.0', '@sdcorejs/angular': '^21.0.0' } });
    assert.throws(() => detectInstalledPackage(root, { exact: true }), /ambiguous|multiple.*Core UI/i);
  });
});

test('R3: native navigation selects existing mobile rules without web-only references', () => {
  const result = selectUiuxReferences({ surface: 'mobile-native', task: 'review', topics: ['navigation'] });
  assert.equal(result.status, 'matched');
  assert.deepEqual(result.references.map(({ id }) => id), ['mobile']);
  assert.ok(result.references[0].rule_ids.includes('UX-MOBILE-NAV'));
  assert.deepEqual(result.unmatched_topics, []);
  assert.deepEqual(selectUiuxReferences({ surface: 'enterprise-portal', task: 'improve', topics: ['navigation'] }).references.map(({ id }) => id), ['navigation']);
  assert.equal(selectUiuxReferences({ surface: 'mobile-native', task: 'review', topics: ['unlisted-topic'] }).status, 'no-match');
});
