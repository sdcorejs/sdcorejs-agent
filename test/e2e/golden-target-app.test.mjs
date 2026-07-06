import assert from 'node:assert/strict';
import { access, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import path from 'node:path';
import {
  buildGoldenExecOptions,
  buildGoldenTargetAppPlan,
  formatGoldenStepFailure,
  runGoldenTargetAppE2E
} from './support/golden-target-app.mjs';

test('phase 4: full target-app golden test is explicit and opt-in', async () => {
  const result = await runGoldenTargetAppE2E();

  assert.deepEqual(result.requiredTools, ['docker', 'playwright', 'supertest']);
  if (process.env.SDCOREJS_E2E_FULL === '1') {
    assert.equal(result.status, 'passed', result.error?.message);
  } else {
    assert.equal(result.status, 'skipped');
    assert.match(result.reason, /SDCOREJS_E2E_FULL=1/);
  }
});

test('phase 4: golden plan covers generation, Docker, Playwright, and supertest gates in order', () => {
  const plan = buildGoldenTargetAppPlan({ targetName: 'golden-crm' });

  assert.deepEqual(
    plan.steps.map((step) => step.id),
    [
      'generate-target-app',
      'install-target-deps',
      'install-playwright-browser',
      'docker-compose-up',
      'api-supertest',
      'ui-playwright',
      'docker-compose-down'
    ]
  );
  assert.match(plan.steps[3].command, /docker compose up/);
  assert.match(plan.steps[4].command, /supertest/);
  assert.match(plan.steps[5].command, /playwright/);
});

test('phase 4: Windows command shims run through a shell', () => {
  const plan = buildGoldenTargetAppPlan({ targetName: 'golden-crm' });
  const npmStep = plan.steps.find((step) => step.id === 'install-target-deps');
  const options = buildGoldenExecOptions({ ...npmStep, file: 'npm.cmd' });

  assert.equal(options.windowsHide, true);
  if (process.platform === 'win32') {
    assert.equal(options.shell, true);
  } else {
    assert.equal(options.shell, undefined);
  }
});

test('phase 4: failed golden steps include command output for diagnosis', () => {
  const plan = buildGoldenTargetAppPlan({ targetName: 'golden-crm' });
  const step = plan.steps.find((item) => item.id === 'ui-playwright');
  const cause = new Error('Command failed');
  cause.stdout = 'playwright stdout details';
  cause.stderr = 'playwright stderr details';

  const error = formatGoldenStepFailure(step, cause);

  assert.match(error.message, /ui-playwright/);
  assert.match(error.message, /npx playwright test/);
  assert.match(error.message, /playwright stdout details/);
  assert.match(error.message, /playwright stderr details/);
  assert.equal(error.cause, cause);
});

test('phase 4: golden plan rejects unsafe target names', () => {
  assert.throws(
    () => buildGoldenTargetAppPlan({ targetName: '../outside' }),
    /Invalid targetName/
  );
});

test('phase 4: golden generator rejects unsafe target names', () => {
  const result = spawnSync(
    process.execPath,
    ['test/e2e/golden/generate-target-app.mjs', '--target', '../outside'],
    { encoding: 'utf8' }
  );

  assert.equal(result.status, 2);
  assert.match(result.stderr, /Invalid --target/);
});

test('phase 4: golden generator rejects drive/root output directories', () => {
  const driveRoot = path.parse(process.cwd()).root;
  const result = spawnSync(
    process.execPath,
    ['test/e2e/golden/generate-target-app.mjs', '--root', driveRoot, '--target', 'unsafe-root'],
    { encoding: 'utf8' }
  );

  assert.equal(result.status, 2);
  assert.match(result.stderr, /drive\/root directory/);
});

test('phase 4: golden generator creates a runnable target-app fixture', async () => {
  const targetName = `golden-generator-${Date.now()}`;
  const root = path.join('.tmp', targetName);

  try {
    const result = spawnSync(
      process.execPath,
      ['test/e2e/golden/generate-target-app.mjs', '--target', targetName],
      { encoding: 'utf8' }
    );

    assert.equal(result.status, 0, result.stderr || result.stdout);
    await access(path.join(root, 'docker-compose.yml'));
    await access(path.join(root, 'server.mjs'));
    await access(path.join(root, 'package.json'));
    await access(path.join(root, 'e2e', 'api.supertest.mjs'));
    await access(path.join(root, 'e2e', 'ui.playwright.spec.mjs'));
    await access(path.join(root, 'playwright.config.mjs'));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
