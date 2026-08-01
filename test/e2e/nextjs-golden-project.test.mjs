import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  generateNextjsGoldenProject,
} from '../../_refs/nextjs/generator/generate-golden-project.mjs';
import { runNextjsGoldenProject } from './support/nextjs-golden-project.mjs';

test('golden generator requires a strict child output and never overwrites existing files', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-nextjs-generator-boundary-'));
  try {
    await assert.rejects(
      generateNextjsGoldenProject({ output: root, outputRoot: root, profile: 'basic' }),
      /strict child|inside outputRoot/iu,
    );

    const output = path.join(root, 'existing-project');
    const packagePath = path.join(output, 'package.json');
    await mkdir(output, { recursive: true });
    await writeFile(packagePath, 'keep-me\n', 'utf8');
    await assert.rejects(
      generateNextjsGoldenProject({ output, outputRoot: root, profile: 'basic' }),
      /already exists|overwrite/iu,
    );
    assert.equal(await readFile(packagePath, 'utf8'), 'keep-me\n');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test(
  'generated basic, i18n, and contact Next.js projects typecheck, test, build, and route to module owner',
  { timeout: 900_000 },
  async () => {
    for (const profile of ['basic', 'i18n', 'contact']) {
      const evidence = await runNextjsGoldenProject(profile);
      assert.equal(evidence.generation.fixture_kind, 'generated-real-nextjs');
      assert.equal(evidence.generation.next_version, '16.2.12');
      assert.equal(evidence.generation.profile, profile);
      assert.equal(
        evidence.commands.length,
        4,
        `${profile}: golden harness stopped before every required command`,
      );
      for (const result of evidence.commands) {
        assert.equal(
          result.exitCode,
          0,
          `${profile}: ${result.command}\n${result.stdout}\n${result.stderr}`,
        );
      }
      assert.equal(evidence.ownerRouting.status, 'resolved');
      assert.equal(
        evidence.ownerRouting.owner_repository_id,
        'github.com/sdcorejs/catalog',
      );
      assert.notEqual(
        evidence.ownerRouting.owner_repository_id,
        evidence.ownerRouting.execution_host_repository_id,
      );
    }
  },
);
