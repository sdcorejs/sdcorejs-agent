import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  discoverRepositoryTopology,
  resolveExploreWriteAuthority,
  validateExploreClassification,
} from '../../_refs/shared/explore-contract.mjs';
import { assembleProjectContext } from '../../_refs/shared/project-context.mjs';
import { systemRegistry } from '../../_refs/shared/system-registry.mjs';

const git = (cwd, ...args) =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

async function write(root, relativePath, content) {
  const target = path.join(root, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, content, 'utf8');
}

function configureRepository(root, remote) {
  git(root, 'init');
  git(root, 'config', 'user.email', 'explore@example.com');
  git(root, 'config', 'user.name', 'Explore Fixture');
  git(root, 'remote', 'add', 'origin', remote);
}

test('explore classification accepts every registry track including ai-agent', () => {
  assert.deepEqual(
    validateExploreClassification({
      tracks: systemRegistry.tracks.map(({ id }) => id),
      stack_profiles: systemRegistry.stack_profiles.map(({ id }) => id),
    }),
    [],
  );
  assert.ok(systemRegistry.tracks.some(({ id }) => id === 'ai-agent'));
  assert.match(
    validateExploreClassification({
      tracks: ['retired-track'],
      stack_profiles: ['retired-profile'],
    }).join('\n'),
    /unknown track.*unknown stack profile/isu,
  );
});

test('explore skill and context expose registry-backed topology without documentation ownership', async () => {
  const [skill, context] = await Promise.all([
    readFile(
      new URL('../../skills/shared/workflow/explore.md', import.meta.url),
      'utf8',
    ),
    readFile(
      new URL('../../_refs/shared/explore-context.md', import.meta.url),
      'utf8',
    ),
  ]);
  const combined = `${skill}\n${context}`;
  assert.match(combined, /_refs\/shared\/system-registry\.json/u);
  assert.match(combined, /_refs\/shared\/explore-contract\.mjs/u);
  assert.match(combined, /\bai-agent\b/u);
  assert.match(combined, /repository_topology/u);
  assert.match(combined, /portal-module-gitlink/u);
  assert.match(combined, /ownership_hypotheses/u);
  assert.match(combined, /absolute checkout paths.*never durable/isu);
  assert.match(combined, /summary.*code map.*owned by.*sdcorejs-explore/isu);
  assert.doesNotMatch(combined, /documentation owns.*(?:summary|code map)/iu);
  assert.match(skill, /Never\s+select.*artifact.*newest/iu);
});

test('explore writes require explicit or assigned authority and default to read-only', () => {
  assert.deepEqual(
    resolveExploreWriteAuthority({ action: 'summary-read' }),
    {
      write_allowed: false,
      reason: 'read-only explore action',
    },
  );
  assert.equal(
    resolveExploreWriteAuthority({ action: 'summary-refresh' }).write_allowed,
    false,
  );
  assert.equal(
    resolveExploreWriteAuthority({
      action: 'summary-refresh',
      explicit_authority: true,
    }).write_allowed,
    true,
  );
  assert.equal(
    resolveExploreWriteAuthority({
      action: 'code-map-write-approved',
      explicit_authority: true,
    }).write_allowed,
    true,
  );
});

test('explore selects artifacts by relationship metadata rather than recency', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-explore-related-'));
  try {
    configureRepository(root, 'https://github.com/sdcorejs/related-fixture.git');
    await write(root, 'package.json', '{"name":"related-fixture"}\n');
    await write(
      root,
      '.sdcorejs/specs/general/related.md',
      [
        '---',
        'artifact_id: related-r1',
        'artifact_kind: spec',
        'change_ref: exact-change',
        'contract_id: exact-contract',
        '---',
        '# Related',
        '',
      ].join('\n'),
    );
    await write(
      root,
      '.sdcorejs/specs/general/unrelated-newest.md',
      [
        '---',
        'artifact_id: unrelated-r9',
        'artifact_kind: spec',
        'change_ref: other-change',
        'contract_id: other-contract',
        '---',
        '# Unrelated',
        '',
      ].join('\n'),
    );
    const context = await assembleProjectContext({
      root,
      requestScope: 'unrelated-newest',
      changeRef: 'exact-change',
    });
    assert.deepEqual(context.project_context.related_artifacts.specs, [
      '.sdcorejs/specs/general/related.md',
    ]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('explore discovers portal-module topology and reports ownership boundary defects read-only', async () => {
  const portal = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-explore-topology-'));
  const moduleA = path.join(portal, 'modules', 'module-a');
  try {
    await mkdir(moduleA, { recursive: true });
    configureRepository(moduleA, 'https://github.com/sdcorejs/module-a.git');
    await write(moduleA, 'src/index.js', 'export const value = 1;\n');
    git(moduleA, 'add', 'src/index.js');
    git(moduleA, 'commit', '-m', 'module base');
    const pinnedRevision = git(moduleA, 'rev-parse', 'HEAD');

    configureRepository(portal, 'https://github.com/sdcorejs/portal.git');
    await write(portal, 'README.md', '# Portal\n');
    await write(
      portal,
      '.gitmodules',
      [
        '[submodule "module-a"]',
        '\tpath = modules/module-a',
        '\turl = https://github.com/sdcorejs/module-a.git',
        '[submodule "missing-module"]',
        '\tpath = modules/missing-module',
        '\turl = https://github.com/sdcorejs/missing-module.git',
        '',
      ].join('\n'),
    );
    git(portal, 'add', 'README.md', '.gitmodules', 'modules/module-a');
    git(portal, 'commit', '-m', 'portal topology');

    const duplicateArtifact = [
      '---',
      'artifact_id: spec-orders-r1',
      'artifact_kind: spec',
      'owner_repository_id: github.com/sdcorejs/module-a',
      'owner_repository_role: module',
      'owner_module_id: module-a',
      'change_ref: orders',
      'commit_policy: with-change',
      '---',
      '# Orders',
      '',
    ].join('\n');
    await write(
      portal,
      '.sdcorejs/specs/angular/orders.md',
      duplicateArtifact,
    );
    await write(
      moduleA,
      '.sdcorejs/specs/angular/orders.md',
      duplicateArtifact,
    );

    await write(moduleA, 'src/index.js', 'export const value = 2;\n');
    git(moduleA, 'add', 'src/index.js');
    git(moduleA, 'commit', '-m', 'module moves ahead');
    const actualRevision = git(moduleA, 'rev-parse', 'HEAD');

    const topology = await discoverRepositoryTopology({ root: portal });
    assert.equal(topology.read_only, true);
    assert.deepEqual(topology.writes, []);
    assert.equal(
      topology.integration_owner_repository_id,
      'github.com/sdcorejs/portal',
    );
    const moduleRecord = topology.repositories.find(
      ({ module_id: moduleId }) => moduleId === 'module-a',
    );
    assert.equal(moduleRecord.repository_id, 'github.com/sdcorejs/module-a');
    assert.equal(moduleRecord.repository_role, 'module');
    assert.equal(moduleRecord.status, 'initialized');
    assert.equal(moduleRecord.portal_pinned_revision, pinnedRevision);
    assert.equal(moduleRecord.source_revision, actualRevision);
    assert.equal(moduleRecord.freshness, 'stale');
    assert.ok(
      topology.relationships.some(
        ({ kind, module_id: moduleId }) =>
          kind === 'portal-module-gitlink' && moduleId === 'module-a',
      ),
    );

    const findingCodes = topology.findings.map(({ code }) => code);
    for (const code of [
      'MISSING_OR_UNINITIALIZED_MODULE',
      'STALE_PORTAL_PINNED_MODULE_REVISION',
      'MISPLACED_MODULE_ARTIFACT',
      'DUPLICATE_EDITABLE_ARTIFACT',
    ]) {
      assert.ok(findingCodes.includes(code), code);
    }
    assert.ok(
      topology.ownership_hypotheses.some(
        ({ owner_repository_id: ownerRepositoryId, confidence }) =>
          ownerRepositoryId === 'github.com/sdcorejs/module-a' &&
          confidence === 'high',
      ),
    );
    for (const repository of topology.repositories) {
      assert.ok(
        repository.repository_id === null ||
          !repository.repository_id.includes(portal),
        'absolute paths never become durable repository identity',
      );
    }
    for (const artifact of topology.artifact_locations) {
      assert.ok(!path.isAbsolute(artifact.repository_relative_path));
    }
  } finally {
    await rm(portal, { recursive: true, force: true });
  }
});

test('explore blocks escaping .gitmodules paths before inspecting another repository', async () => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-explore-boundary-'));
  const portal = path.join(workspace, 'portal');
  const outside = path.join(workspace, 'outside');
  try {
    await mkdir(portal, { recursive: true });
    await mkdir(outside, { recursive: true });
    configureRepository(outside, 'https://github.com/example/outside.git');
    await write(outside, 'README.md', '# Outside\n');
    git(outside, 'add', 'README.md');
    git(outside, 'commit', '-m', 'outside fixture');
    await write(
      portal,
      '.gitmodules',
      [
        '[submodule "escape"]',
        '\tpath = ../outside',
        '\turl = https://github.com/example/outside.git',
        '',
      ].join('\n'),
    );

    const topology = await discoverRepositoryTopology({ root: portal });
    assert.equal(
      topology.repositories.some(({ module_id: moduleId }) => moduleId === 'escape'),
      false,
    );
    assert.ok(
      topology.findings.some(
        ({ code, severity, module_id: moduleId }) =>
          code === 'INVALID_MODULE_PATH' &&
          severity === 'blocking' &&
          moduleId === 'escape',
      ),
    );
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});
