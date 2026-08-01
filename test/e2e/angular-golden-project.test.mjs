import assert from 'node:assert/strict';
import test from 'node:test';

import { runAngularGoldenProject } from './support/angular-golden-project.mjs';

test(
  'generated Angular project typechecks, validates templates, builds, tests, lints, and routes to module owner',
  { timeout: 420_000 },
  async () => {
    const evidence = await runAngularGoldenProject();
    assert.equal(evidence.generation.fixture_kind, 'generated-real-angular');
    assert.equal(evidence.generation.angular_version, '20.3.27');
    assert.ok(evidence.generation.files.includes('src/app/app.spec.ts'));
    assert.equal(evidence.commands.length, 6, 'golden harness stopped before every required command');
    for (const result of evidence.commands) {
      assert.equal(
        result.exitCode,
        0,
        `${result.command}\n${result.stdout}\n${result.stderr}`,
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
  },
);
