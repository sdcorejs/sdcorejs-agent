import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { loadSkillPack, runPromptEval } from './support/skill-pack-runner.mjs';

const repoRoot = new URL('../../', import.meta.url);

async function readRepoFile(relativePath) {
  return readFile(new URL(relativePath, repoRoot), 'utf8').catch(() => '');
}

async function writeFixture(root, files) {
  for (const [relativePath, contents] of Object.entries(files)) {
    const target = join(root, relativePath);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(
      target,
      typeof contents === 'string' ? contents : JSON.stringify(contents, null, 2),
      'utf8',
    );
  }
}

test('test track keeps public actions and profiles while delegating detailed contracts', async () => {
  const skill = await readRepoFile('skills/tracks/test/sdcorejs-test.md');
  const actions = [
    'run-only',
    'write-tests',
    'write-and-run',
    'test-plan-readonly',
    'coverage-audit',
    'uat-cases',
    'tdd-red',
    'tdd-cycle',
    'failing-output-triage',
    'debug-handoff',
  ];
  const profiles = [
    'core-ui-angular',
    'legacy-core-ui-angular',
    'plain-angular',
    'sdcorejs-nestjs',
    'plain-nestjs',
    'nextjs-build-website',
    'plain-nextjs',
    'react-vite',
    'react-cra',
    'react-next-generic',
    'general',
  ];

  for (const action of actions) assert.match(skill, new RegExp(`\\b${action}\\b`), action);
  for (const profile of profiles) assert.match(skill, new RegExp(`\\b${profile}\\b`), profile);

  assert.match(skill, /ui-evidence-capture/);
  assert.match(skill, /direct\/internal|internal evidence action/i);
  assert.match(skill, /Project Context Preflight v2|project-context\.md/);
  assert.match(skill, /artifact-lifecycle\.md/);
  assert.match(skill, /Missing or stale summary.*never blocks|missing\/stale summary.*not.*block/i);
  assert.match(skill, /sdcorejs-debug/);
  assert.match(skill, /sdcorejs-documentation/);
  assert.match(skill, /Do not invoke Git|must not invoke Git|Do not call `sdcorejs-git`/i);
  assert.doesNotMatch(skill, /current-session\.md/);
  assert.doesNotMatch(skill, /summary-refresh/);

  const lineCount = skill.split(/\r?\n/).length;
  assert.ok(lineCount <= 350, `sdcorejs-test has ${lineCount} lines; keep it as a concise orchestrator`);

  for (const reference of [
    '_refs/shared/test-scope-and-coverage.md',
    '_refs/shared/test-auth-personas.md',
    '_refs/shared/test-data-lifecycle.md',
    '_refs/shared/test-playwright.md',
    '_refs/shared/test-ui-evidence.md',
  ]) {
    const text = await readRepoFile(reference);
    assert.ok(text, `${reference} must exist`);
    assert.match(skill, new RegExp(reference.replaceAll('/', '\\/')));
    assert.match(text.slice(0, 2500), /## Contents/, `${reference} exposes compact navigation`);
  }
});

test('test context v2 separates lifecycle status from multi-run evidence', async () => {
  const context = await readRepoFile('_refs/shared/test-context.md');

  assert.match(context, /schema_version:\s*2/);
  assert.match(context, /associated_HEAD_or_diff/);
  assert.match(context, /classification:/);
  assert.match(context, /scope:/);
  assert.match(context, /runner:/);
  assert.match(context, /environment:/);
  assert.match(context, /auth:/);
  assert.match(context, /data:/);
  assert.match(context, /execution:/);
  assert.match(context, /coverage_matrix:/);

  for (const field of [
    'planning',
    'authoring',
    'executability',
    'execution',
    'result',
    'evidence',
    'documentation',
  ]) {
    assert.match(context, new RegExp(`\\b${field}:`), `test_status.${field}`);
  }

  assert.match(context, /runs:/);
  assert.match(context, /cases:/);
  assert.match(context, /captures:/);
  assert.match(context, /legacy v1/i);
  assert.match(context, /written.*does not.*executed|written.*not.*executed/i);
  assert.match(context, /executed.*does not.*pass|executed.*not.*pass/i);
  assert.match(context, /commands_skipped/);
  assert.match(context, /redactions_applied:\s*true/);
  assert.doesNotMatch(context, /raw sensitive logs|persist raw logs/i);
});

test('auth, data, runner, and UI evidence contracts fail closed without leaking credentials', async () => {
  const [
    auth,
    data,
    commands,
    environment,
    playwright,
    captures,
    robot,
  ] = await Promise.all([
    readRepoFile('_refs/shared/test-auth-personas.md'),
    readRepoFile('_refs/shared/test-data-lifecycle.md'),
    readRepoFile('_refs/shared/test-command-discovery.md'),
    readRepoFile('_refs/shared/test-environment-guard.md'),
    readRepoFile('_refs/shared/test-playwright.md'),
    readRepoFile('_refs/shared/test-ui-evidence.md'),
    readRepoFile('_refs/angular/e2e-robot-conventions.md'),
  ]);

  assert.match(auth, /credentialSource/);
  assert.match(auth, /usernameRef/);
  assert.match(auth, /passwordRef/);
  assert.match(auth, /env \| existing-secret-provider \| manual/);
  assert.match(auth, /stable logical ID|logical persona/i);
  assert.match(auth, /missing.*blocked/i);
  assert.match(auth, /MFA/);
  assert.match(auth, /CAPTCHA/);
  assert.match(auth, /SSO/);
  assert.match(auth, /VPN/);
  assert.match(auth, /manual approval/i);
  assert.doesNotMatch(auth, /"password"\s*:\s*"[^<][^"]+"/);

  assert.match(playwright, /UI-login-first|real UI/i);
  assert.match(playwright, /per-persona/i);
  assert.match(playwright, /<environment-id>\/<persona-id>\.json/);
  assert.match(playwright, /local_only/);
  assert.match(playwright, /one visible login.*does not use.*storageState/i);
  assert.match(playwright, /page\.evaluate.*forbidden|Do not.*page\.evaluate/i);
  assert.match(playwright, /localStorage.*forbidden|Do not.*localStorage/i);
  assert.match(playwright, /existing Cypress|Robot|existing runner/i);

  assert.match(data, /records_owned_by_run/);
  assert.match(data, /ownership_filter/);
  assert.match(data, /idempotent/);
  assert.match(data, /cleanup.*fail/i);
  assert.match(data, /production.*read-only/i);
  assert.match(data, /staging.*isolated/i);
  assert.match(data, /email|SMS|payment/);
  assert.match(data, /idempotency|retry/i);

  for (const marker of ['pyproject.toml', 'pom.xml', '*.sln', 'go.mod', 'Cargo.toml']) {
    assert.match(commands, new RegExp(marker.replaceAll('.', '\\.').replace('*', '\\*')));
  }
  assert.match(commands, /Existing project command.*source of truth/i);
  assert.match(commands, /Do not invent/);
  assert.match(commands, /workspace\/cwd|correct workspace|working directory/i);

  assert.match(environment, /unknown.*block/i);
  assert.match(environment, /prod.*block/i);
  assert.match(environment, /write_policy|write policy/i);
  assert.match(environment, /actor|persona/i);
  assert.match(environment, /auth.*source/i);

  assert.match(captures, /ui_capture_context/);
  assert.match(captures, /login_redirect_absent/);
  assert.match(captures, /access_denied_absent/);
  assert.match(captures, /target_state_visible/);
  assert.match(captures, /pii_screening/);
  assert.match(captures, /sha256/);
  assert.match(captures, /documentation \| diagnostic/);
  assert.match(captures, /local-only|local_only/);
  assert.match(captures, /required_with_change/);

  assert.doesNotMatch(robot, /^\$\{username\}/m);
  assert.doesNotMatch(robot, /^\$\{password\}/m);
  assert.match(robot, /environment variable|secret key reference|credentialSource/i);
  assert.doesNotMatch(robot, /URLs \+ creds from `Variables\/ENV_/);
});

test('stack references remain requirement-driven and framework-neutral', async () => {
  const [
    generic,
    angularUnit,
    angularIntegration,
    angularE2e,
    nestUnit,
    nestIntegration,
    nestE2e,
    nextE2e,
  ] = await Promise.all([
    readRepoFile('_refs/shared/test-generic.md'),
    readRepoFile('_refs/angular/test-unit.md'),
    readRepoFile('_refs/angular/test-integration.md'),
    readRepoFile('_refs/angular/test-e2e.md'),
    readRepoFile('_refs/nestjs/test-unit.md'),
    readRepoFile('_refs/nestjs/test-integration.md'),
    readRepoFile('_refs/nestjs/test-e2e.md'),
    readRepoFile('_refs/nextjs/build-website/test-e2e.md'),
  ]);

  for (const marker of ['Node', 'Python', 'Java', '.NET', 'Go', 'Rust']) {
    assert.match(generic, new RegExp(marker.replace('.', '\\.')));
  }
  assert.match(generic, /existing runner/i);
  assert.doesNotMatch(generic, /hardcode.*npm|npm.*universal/i);

  for (const text of [angularUnit, angularIntegration, angularE2e, nestUnit, nestIntegration, nestE2e, nextE2e]) {
    assert.doesNotMatch(text, /(?:≥|>=)\s*(?:70|80)%/);
    assert.doesNotMatch(text, /Coverage target:/i);
  }

  assert.doesNotMatch(angularE2e, /For a CRUD entity, write at minimum/i);
  assert.doesNotMatch(angularE2e, /mock seed data/i);
  assert.doesNotMatch(angularE2e, /waitForLoadState\('networkidle'\).*universal|Wait for network idle after navigation/i);
  assert.doesNotMatch(angularE2e, /mock the auth\/permission layer/i);
  assert.match(angularE2e, /accessible/i);
  assert.match(angularE2e, /server-side|API.*den/i);

  for (const text of [nestUnit, nestIntegration, nestE2e]) {
    assert.match(text, /when applicable|requirement|risk/i);
  }
  assert.doesNotMatch(nestIntegration, /enterprise search.*always/i);

  assert.doesNotMatch(nextE2e, /every test runs against `\/vi/);
  assert.doesNotMatch(nextE2e, /const locales = \['vi', 'en'\]/);
  assert.doesNotMatch(nextE2e, /6th submission within 15 min/);
  assert.doesNotMatch(nextE2e, /Skip the rate-limit test/i);
  assert.match(nextE2e, /only when.*acceptance|when.*requirement/i);
});

test('documentation, ship, git, review, repair, and debug propagate test evidence and artifact closure', async () => {
  const [
    guide,
    documentationGate,
    ship,
    git,
    review,
    repair,
    debug,
    lifecycle,
    autoDocs,
    autoTasks,
  ] = await Promise.all([
    readRepoFile('_refs/documentation/write-user-guide.md'),
    readRepoFile('_refs/documentation/gate.md'),
    readRepoFile('skills/shared/workflow/ship.md'),
    readRepoFile('skills/shared/workflow/git.md'),
    readRepoFile('skills/shared/workflow/review.md'),
    readRepoFile('skills/orchestration/repair-loop.md'),
    readRepoFile('skills/shared/workflow/debug.md'),
    readRepoFile('_refs/shared/artifact-lifecycle.md'),
    readRepoFile('_refs/orchestration/tail/auto-docs.md'),
    readRepoFile('_refs/orchestration/tail/auto-task-tracker.md'),
  ]);

  assert.doesNotMatch(guide, /Always create or update.*capture-screenshots\.playwright\.mjs/i);
  assert.doesNotMatch(guide, /http:\/\/localhost:4200/);
  assert.doesNotMatch(guide, /leave a clear `TODO`/i);
  assert.match(guide, /ui-evidence-capture/);
  assert.match(guide, /reuse.*runner|runner.*reuse/i);
  assert.match(guide, /real-ui|manual-real-ui/);
  assert.match(guide, /verified/i);
  assert.match(guide, /artifact_context/);
  assert.match(documentationGate, /verified.*screenshot|UI evidence/i);

  for (const text of [ship, git, review, repair, debug]) {
    assert.match(text, /test_context|test_evidence/, 'downstream workflow consumes test context/evidence');
  }
  assert.match(ship, /schema_version.*2|v1.*v2|legacy v1/i);
  assert.match(ship, /associated_HEAD_or_diff/);
  assert.match(ship, /written.*not.*verified/i);
  assert.match(ship, /capture.*evidence|ui_capture_context/i);
  assert.match(git, /storageState|auth state/i);
  assert.match(git, /trace|video|raw report/i);
  assert.match(git, /verified.*guide.*screenshot|documentation asset/i);
  assert.match(git, /unknown.*ambiguous/i);
  assert.match(review, /test matrix|test evidence/i);
  assert.match(repair, /Preserve.*test_context|test_evidence/i);
  assert.match(debug, /smallest.*reproduction/i);

  assert.match(lifecycle, /storageState|auth\/storage state/i);
  assert.match(lifecycle, /verified.*guide screenshot|documentation asset/i);
  assert.match(lifecycle, /failure.*screenshot|diagnostic screenshot/i);
  assert.match(autoDocs, /change-scoped/i);
  assert.doesNotMatch(autoDocs, /session summary/i);
  assert.doesNotMatch(autoTasks, /current-session\.md/);
});

test('routing fixtures cover authenticated, tenant, documentation, auth, debug, and localized boundaries', async () => {
  const promptEvals = JSON.parse(await readRepoFile('test/e2e/fixtures/prompt-evals.json'));
  const expected = new Map([
    ['test-authenticated-personas', 'sdcorejs-test'],
    ['test-tenant-isolation-api', 'sdcorejs-test'],
    ['test-run-checkout', 'sdcorejs-test'],
    ['test-failing-output-explain', 'sdcorejs-test'],
    ['debug-failing-login-fix', 'sdcorejs-debug'],
    ['auth-keycloak-configure', 'sdcorejs-brainstorming'],
    ['documentation-verified-screenshots', 'sdcorejs-documentation'],
    ['test-authenticated-personas-vi', 'sdcorejs-test'],
    ['documentation-verified-screenshots-vi', 'sdcorejs-documentation'],
    ['product-requirement-coverage-no-test-work', 'sdcorejs-product'],
  ]);
  const byId = new Map(promptEvals.map((item) => [item.id, item.expectedSkill]));

  for (const [id, expectedSkill] of expected) {
    assert.equal(byId.get(id), expectedSkill, `${id} routes to ${expectedSkill}`);
  }

  const pack = await loadSkillPack(repoRoot);
  const results = runPromptEval(
    pack,
    promptEvals.filter((item) => expected.has(item.id)),
  );
  assert.deepEqual(
    results.filter((item) => !item.pass),
    [],
    `routing failures:\n${JSON.stringify(results.filter((item) => !item.pass), null, 2)}`,
  );
});

test('forward fixtures emit context, ownership, commands, blockers, and artifact classifications', async (t) => {
  const harnessSource = await readRepoFile('test/e2e/support/test-track-forward-harness.mjs');
  assert.ok(harnessSource, 'deterministic test-track forward harness must exist');
  const { projectTestFixture } = await import('./support/test-track-forward-harness.mjs');

  const scenarios = [
    {
      name: 'React Vite component',
      files: {
        'package.json': { scripts: { test: 'vitest run' }, dependencies: { react: '^19' }, devDependencies: { vite: '^7', vitest: '^3' } },
        'package-lock.json': { lockfileVersion: 3 },
        'vite.config.ts': 'export default {};\n',
        'src/button.test.tsx': 'test("renders", () => {});\n',
      },
      request: { action: 'write-and-run', level: 'component' },
      check: (result) => {
        assert.equal(result.test_context.classification.stack_profile, 'react-vite');
        assert.equal(result.test_context.classification.repository_kind, 'single-app');
        assert.equal(result.test_context.runner.runner_name, 'vitest');
        assert.equal(result.test_context.execution.commands_planned[0], 'npm test');
      },
    },
    {
      name: 'pnpm lockfile selects the existing pnpm test script',
      files: {
        'package.json': { scripts: { test: 'vitest run' }, devDependencies: { vitest: '^3' } },
        'pnpm-lock.yaml': 'lockfileVersion: 9\n',
      },
      request: { action: 'run-only', level: 'unit' },
      check: (result) => {
        assert.equal(result.test_context.runner.package_manager, 'pnpm');
        assert.deepEqual(result.test_context.execution.commands_planned, ['pnpm run test']);
      },
    },
    {
      name: 'Playwright dependency without a project command remains unresolved',
      files: {
        'package.json': { devDependencies: { '@playwright/test': '^1' } },
        'package-lock.json': { lockfileVersion: 3 },
        'playwright.config.ts': 'export default {};\n',
      },
      request: { action: 'run-only', level: 'browser-e2e' },
      check: (result) => {
        assert.equal(result.test_context.runner.runner_name, 'playwright');
        assert.deepEqual(result.test_context.execution.commands_planned, []);
        assert.ok(result.test_status.blockers.includes('test-command-unresolved'));
      },
    },
    {
      name: 'plain Angular without Core UI',
      files: {
        'package.json': { scripts: { test: 'ng test' }, dependencies: { '@angular/core': '^20' } },
        'angular.json': '{}',
      },
      request: { action: 'test-plan-readonly', level: 'component' },
      check: (result) => {
        assert.equal(result.test_context.classification.stack_profile, 'plain-angular');
        assert.ok(!result.test_context.runner.refs_loaded.some((ref) => ref.startsWith('_refs/angular/')));
      },
    },
    {
      name: 'Core UI Angular Playwright with two personas',
      files: {
        'package.json': { scripts: { e2e: 'playwright test' }, dependencies: { '@angular/core': '^20', '@sdcorejs/angular': '^20' }, devDependencies: { '@playwright/test': '^1' } },
        'angular.json': '{}',
        'playwright.config.ts': 'export default {};\n',
        'e2e/config/personas.json': {
          environments: { local: { baseUrlEnv: 'E2E_BASE_URL', writePolicy: 'isolated-only' } },
          personas: {
            supervisor: { credentialSource: { type: 'env', usernameRef: 'E2E_SUPERVISOR_USERNAME', passwordRef: 'E2E_SUPERVISOR_PASSWORD' }, storageStateId: 'supervisor' },
            viewer: { credentialSource: { type: 'env', usernameRef: 'E2E_VIEWER_USERNAME', passwordRef: 'E2E_VIEWER_PASSWORD' }, storageStateId: 'viewer' },
          },
        },
      },
      request: { action: 'write-and-run', level: 'browser-e2e', environment: 'local', personas: ['supervisor', 'viewer'], envKeys: ['E2E_BASE_URL', 'E2E_SUPERVISOR_USERNAME', 'E2E_SUPERVISOR_PASSWORD', 'E2E_VIEWER_USERNAME', 'E2E_VIEWER_PASSWORD'] },
      check: (result) => {
        assert.equal(result.test_context.classification.stack_profile, 'core-ui-angular');
        assert.deepEqual(result.test_context.auth.persona_ids, ['supervisor', 'viewer']);
        assert.equal(new Set(result.test_context.auth.storage_states.map((item) => item.path)).size, 2);
      },
    },
    {
      name: 'Angular Robot suite preserves its runner',
      files: {
        'requirements.txt': 'robotframework\nrobotframework-browser\n',
        'Projects/Portal/Tests/login.robot': '*** Test Cases ***\nLogin\n',
        'Variables/ENV_QC.yaml': 'base_url_ref: E2E_BASE_URL\n',
      },
      request: { action: 'write-tests', level: 'browser-e2e', environment: 'dev' },
      check: (result) => {
        assert.equal(result.test_context.runner.runner_name, 'robotframework');
        assert.ok(!result.test_context.runner.refs_loaded.includes('_refs/shared/test-playwright.md'));
      },
    },
    {
      name: 'NestJS API integration reuses project DB helper',
      files: {
        'package.json': { scripts: { 'test:e2e': 'jest --config test/jest-e2e.json' }, dependencies: { '@nestjs/core': '^11' } },
        'nest-cli.json': '{}',
        'test/helpers/test-db.ts': 'export const withTestDb = () => {};\n',
      },
      request: { action: 'write-and-run', level: 'api-e2e' },
      check: (result) => {
        assert.equal(result.test_context.scope.owner, 'backend-service');
        assert.equal(result.test_context.runner.runner_name, 'jest');
        assert.equal(result.test_context.data.strategy, 'test-database');
      },
    },
    {
      name: 'plain NestJS Prisma stays plain',
      files: {
        'package.json': { scripts: { test: 'jest' }, dependencies: { '@nestjs/core': '^11', '@prisma/client': '^6' } },
        'nest-cli.json': '{}',
      },
      request: { action: 'test-plan-readonly', level: 'integration' },
      check: (result) => {
        assert.equal(result.test_context.classification.stack_profile, 'plain-nestjs');
        assert.ok(!result.test_context.runner.assumptions.includes('typeorm'));
      },
    },
    {
      name: 'public unauthenticated Next.js site',
      files: {
        'package.json': { scripts: { test: 'vitest run' }, dependencies: { next: '^16', react: '^19' }, devDependencies: { vitest: '^3' } },
        'next.config.mjs': 'export default {};\n',
      },
      request: { action: 'write-and-run', level: 'component', authRequired: false },
      check: (result) => {
        assert.equal(result.test_context.auth.required, false);
        assert.equal(result.test_context.auth.discovery_status, 'not-applicable');
      },
    },
    {
      name: 'authenticated Next.js app',
      files: {
        'package.json': { scripts: { e2e: 'playwright test' }, dependencies: { next: '^16', react: '^19' }, devDependencies: { '@playwright/test': '^1' } },
        'next.config.mjs': 'export default {};\n',
        'playwright.config.ts': 'export default {};\n',
        'e2e/config/personas.json': {
          environments: { local: { baseUrlEnv: 'E2E_BASE_URL', writePolicy: 'isolated-only' } },
          personas: { member: { credentialSource: { type: 'env', usernameRef: 'E2E_MEMBER_USERNAME', passwordRef: 'E2E_MEMBER_PASSWORD' }, storageStateId: 'member' } },
        },
      },
      request: { action: 'write-and-run', level: 'browser-e2e', environment: 'local', personas: ['member'], envKeys: ['E2E_BASE_URL', 'E2E_MEMBER_USERNAME', 'E2E_MEMBER_PASSWORD'] },
      check: (result) => assert.equal(result.test_context.auth.discovery_status, 'resolved'),
    },
    {
      name: 'monorepo portal owns shared browser setup',
      files: {
        'package.json': { workspaces: ['apps/*', 'packages/*'], scripts: { e2e: 'playwright test' }, devDependencies: { '@playwright/test': '^1' } },
        'apps/portal/playwright.config.ts': 'export default {};\n',
        'apps/orders/src/index.ts': '',
        'apps/payments/src/index.ts': '',
      },
      request: { action: 'write-tests', level: 'browser-e2e', targetModules: ['orders', 'payments'] },
      check: (result) => {
        assert.equal(result.test_context.classification.repository_kind, 'monorepo');
        assert.equal(result.test_context.scope.owner, 'portal');
        assert.equal(result.ownership.shared_config_writers, 1);
      },
    },
    {
      name: 'multi-project layout uses shared test project',
      files: {
        'frontend/package.json': { scripts: { test: 'vitest run' } },
        'backend/package.json': { scripts: { test: 'jest' } },
        'test/e2e/checkout.spec.ts': '',
      },
      request: { action: 'test-plan-readonly', level: 'browser-e2e' },
      check: (result) => {
        assert.equal(result.test_context.classification.repository_kind, 'multi-project');
        assert.equal(result.test_context.scope.owner, 'shared-test-project');
      },
    },
    {
      name: 'SSO MFA requires manual real UI',
      files: {
        'package.json': { scripts: { e2e: 'playwright test' }, devDependencies: { '@playwright/test': '^1' } },
        'playwright.config.ts': 'export default {};\n',
      },
      request: { action: 'write-and-run', level: 'browser-e2e', authRequired: true, authControls: ['sso', 'mfa'] },
      check: (result) => {
        assert.equal(result.test_context.auth.login_mode, 'manual-real-ui');
        assert.equal(result.test_status.executability, 'blocked');
      },
    },
    {
      name: 'missing credential variables block without values',
      files: {
        'package.json': { scripts: { e2e: 'playwright test' }, devDependencies: { '@playwright/test': '^1' } },
        'playwright.config.ts': 'export default {};\n',
        'e2e/config/personas.json': {
          environments: { local: { baseUrlEnv: 'E2E_BASE_URL', writePolicy: 'isolated-only' } },
          personas: { viewer: { credentialSource: { type: 'env', usernameRef: 'E2E_VIEWER_USERNAME', passwordRef: 'E2E_VIEWER_PASSWORD' }, storageStateId: 'viewer' } },
        },
      },
      request: { action: 'run-only', level: 'browser-e2e', environment: 'local', personas: ['viewer'], envKeys: [] },
      check: (result) => {
        assert.equal(result.test_status.executability, 'blocked');
        assert.deepEqual(result.test_context.auth.blockers, ['missing:E2E_BASE_URL', 'missing:E2E_VIEWER_USERNAME', 'missing:E2E_VIEWER_PASSWORD']);
      },
    },
    {
      name: 'environment blockers do not contaminate resolved auth discovery',
      files: {
        'package.json': { scripts: { e2e: 'playwright test' }, devDependencies: { '@playwright/test': '^1' } },
        'package-lock.json': { lockfileVersion: 3 },
        'playwright.config.ts': '',
        'e2e/config/personas.json': {
          environments: { staging: { baseUrlEnv: 'E2E_BASE_URL', writePolicy: 'read-only' } },
          personas: {
            viewer: { credentialSource: { type: 'env', usernameRef: 'E2E_VIEWER_USERNAME', passwordRef: 'E2E_VIEWER_PASSWORD' }, storageStateId: 'viewer' },
          },
        },
      },
      request: {
        action: 'run-only',
        level: 'browser-e2e',
        environment: 'staging',
        stateChanging: true,
        personas: ['viewer'],
        envKeys: ['E2E_BASE_URL', 'E2E_VIEWER_USERNAME', 'E2E_VIEWER_PASSWORD'],
      },
      check: (result) => {
        assert.deepEqual(result.test_context.auth.blockers, []);
        assert.equal(result.test_context.auth.discovery_status, 'resolved');
        assert.ok(result.test_context.environment.blockers.includes('staging-write-not-approved'));
      },
    },
    {
      name: 'staging read-only blocks writes',
      files: { 'package.json': { scripts: { e2e: 'playwright test' }, devDependencies: { '@playwright/test': '^1' } }, 'playwright.config.ts': '' },
      request: { action: 'run-only', level: 'browser-e2e', environment: 'staging', stateChanging: true },
      check: (result) => assert.equal(result.test_status.result, 'blocked'),
    },
    {
      name: 'production smoke stays read-only',
      files: {
        'package.json': { scripts: { e2e: 'playwright test' }, devDependencies: { '@playwright/test': '^1' } },
        'package-lock.json': { lockfileVersion: 3 },
        'playwright.config.ts': '',
      },
      request: { action: 'run-only', level: 'browser-e2e', environment: 'prod', stateChanging: false, explicitProductionSmoke: true },
      check: (result) => {
        assert.equal(result.test_context.environment.write_policy, 'read-only');
        assert.equal(result.test_status.executability, 'ready');
      },
    },
    {
      name: 'verified authenticated guide capture is required with change',
      files: {
        'package.json': { scripts: { e2e: 'playwright test' }, devDependencies: { '@playwright/test': '^1' } },
        'package-lock.json': { lockfileVersion: 3 },
        'playwright.config.ts': '',
        'e2e/config/personas.json': {
          environments: { local: { baseUrlEnv: 'E2E_BASE_URL', writePolicy: 'isolated-only' } },
          personas: {
            supervisor: { credentialSource: { type: 'env', usernameRef: 'E2E_SUPERVISOR_USERNAME', passwordRef: 'E2E_SUPERVISOR_PASSWORD' }, storageStateId: 'supervisor' },
          },
        },
      },
      request: {
        action: 'ui-evidence-capture',
        level: 'ui-evidence-capture',
        environment: 'local',
        authRequired: true,
        authProvenance: 'real-ui',
        personas: ['supervisor'],
        envKeys: ['E2E_BASE_URL', 'E2E_SUPERVISOR_USERNAME', 'E2E_SUPERVISOR_PASSWORD'],
        capture: {
          result: 'verified',
          path: '.sdcorejs/documentation/user-guides/images/orders-list.png',
          guidePath: '.sdcorejs/documentation/user-guides/orders.md',
          referencedByChangedGuide: true,
          targetStateAsserted: true,
          loadingComplete: true,
          pii: false,
          redactionsApplied: true,
          image: {
            exists: true,
            nonEmpty: true,
            decodable: true,
            sha256: 'a'.repeat(64),
            width: 1440,
            height: 1000,
          },
        },
      },
      check: (result) => {
        assert.equal(result.ui_capture_context.result, 'verified');
        const artifact = result.artifact_context.required_with_change.find((item) => item.kind === 'documentation-asset');
        assert.ok(artifact);
        assert.match(artifact.reason, /verified.*changed guide/i);
      },
    },
    {
      name: 'missing authenticated capture provenance cannot be promoted',
      files: {
        'package.json': { scripts: { e2e: 'playwright test' }, devDependencies: { '@playwright/test': '^1' } },
        'package-lock.json': { lockfileVersion: 3 },
        'playwright.config.ts': '',
      },
      request: {
        action: 'ui-evidence-capture',
        level: 'ui-evidence-capture',
        environment: 'local',
        authRequired: true,
        capture: {
          result: 'verified',
          path: '.sdcorejs/documentation/user-guides/images/unproven.png',
          guidePath: '.sdcorejs/documentation/user-guides/orders.md',
          referencedByChangedGuide: true,
          targetStateAsserted: true,
          loadingComplete: true,
          pii: false,
          image: {
            exists: true,
            nonEmpty: true,
            decodable: true,
            sha256: 'fixture-sha256',
            width: 1440,
            height: 1000,
          },
        },
      },
      check: (result) => {
        assert.equal(result.ui_capture_context.persona.auth_provenance, 'unknown');
        assert.equal(result.ui_capture_context.result, 'blocked');
        assert.equal(result.test_status.documentation, 'blocked');
        assert.equal(result.artifact_context.required_with_change.length, 0);
        assert.ok(result.artifact_context.local_only.some((item) => item.kind === 'diagnostic'));
      },
    },
    {
      name: 'capture without a discovered project command cannot be promoted',
      files: {
        'package.json': { devDependencies: { '@playwright/test': '^1' } },
        'package-lock.json': { lockfileVersion: 3 },
        'playwright.config.ts': '',
      },
      request: {
        action: 'ui-evidence-capture',
        level: 'ui-evidence-capture',
        environment: 'local',
        authRequired: false,
        capture: {
          result: 'verified',
          path: '.sdcorejs/documentation/user-guides/images/unrunnable.png',
          guidePath: '.sdcorejs/documentation/user-guides/orders.md',
          referencedByChangedGuide: true,
          targetStateAsserted: true,
          loadingComplete: true,
          pii: false,
          redactionsApplied: true,
          image: {
            exists: true,
            nonEmpty: true,
            decodable: true,
            sha256: 'b'.repeat(64),
            width: 1440,
            height: 1000,
          },
        },
      },
      check: (result) => {
        assert.ok(result.test_status.blockers.includes('test-command-unresolved'));
        assert.equal(result.ui_capture_context.result, 'blocked');
        assert.equal(result.artifact_context.required_with_change.length, 0);
      },
    },
    {
      name: 'access-denied capture cannot be promoted',
      files: {
        'package.json': { scripts: { e2e: 'playwright test' }, devDependencies: { '@playwright/test': '^1' } },
        'package-lock.json': { lockfileVersion: 3 },
        'playwright.config.ts': '',
      },
      request: {
        action: 'ui-evidence-capture',
        level: 'ui-evidence-capture',
        environment: 'local',
        authRequired: true,
        authProvenance: 'real-ui',
        personas: ['viewer'],
        capture: {
          result: 'verified',
          reason: 'access-denied',
          path: 'test-results/access-denied.png',
          guidePath: '.sdcorejs/documentation/user-guides/orders.md',
          referencedByChangedGuide: true,
          targetStateAsserted: true,
          loadingComplete: true,
          pii: false,
          image: {
            exists: true,
            nonEmpty: true,
            decodable: true,
            sha256: 'fixture-sha256',
            width: 1440,
            height: 1000,
          },
        },
      },
      check: (result) => {
        assert.equal(result.ui_capture_context.result, 'blocked');
        assert.equal(result.artifact_context.required_with_change.length, 0);
      },
    },
    {
      name: 'invalid target state and image cannot be promoted',
      files: {
        'package.json': { scripts: { e2e: 'playwright test' }, devDependencies: { '@playwright/test': '^1' } },
        'package-lock.json': { lockfileVersion: 3 },
        'playwright.config.ts': '',
      },
      request: {
        action: 'ui-evidence-capture',
        level: 'ui-evidence-capture',
        environment: 'local',
        authRequired: false,
        capture: {
          result: 'verified',
          path: '.sdcorejs/documentation/user-guides/images/invalid.png',
          guidePath: '.sdcorejs/documentation/user-guides/orders.md',
          referencedByChangedGuide: true,
          targetStateAsserted: false,
          loadingComplete: true,
          pii: false,
          image: {
            exists: true,
            nonEmpty: false,
            decodable: false,
            sha256: null,
            width: null,
            height: null,
          },
        },
      },
      check: (result) => {
        assert.equal(result.ui_capture_context.result, 'blocked');
        assert.equal(result.artifact_context.required_with_change.length, 0);
      },
    },
    {
      name: 'login redirect capture remains diagnostic',
      files: { 'package.json': { scripts: { e2e: 'playwright test' }, devDependencies: { '@playwright/test': '^1' } }, 'playwright.config.ts': '' },
      request: { action: 'ui-evidence-capture', level: 'ui-evidence-capture', environment: 'local', authRequired: true, capture: { result: 'failed', reason: 'login-redirect', path: 'test-results/login.png' } },
      check: (result) => {
        assert.equal(result.test_status.result, 'blocked');
        assert.ok(result.artifact_context.local_only.some((item) => item.kind === 'diagnostic'));
      },
    },
    {
      name: 'PII capture cannot be promoted',
      files: { 'package.json': { scripts: { e2e: 'playwright test' }, devDependencies: { '@playwright/test': '^1' } }, 'playwright.config.ts': '' },
      request: { action: 'ui-evidence-capture', level: 'ui-evidence-capture', environment: 'local', capture: { result: 'verified', path: '.sdcorejs/documentation/user-guides/images/customer.png', pii: true } },
      check: (result) => {
        assert.equal(result.test_status.result, 'blocked');
        assert.equal(result.artifact_context.required_with_change.length, 0);
      },
    },
    {
      name: 'parallel modules cannot edit shared Playwright config',
      files: {
        'package.json': { workspaces: ['apps/*'], scripts: { e2e: 'playwright test' }, devDependencies: { '@playwright/test': '^1' } },
        'playwright.config.ts': '',
        'apps/a/a.spec.ts': '',
        'apps/b/b.spec.ts': '',
      },
      request: { action: 'write-tests', level: 'browser-e2e', parallel: true, targetModules: ['a', 'b'] },
      check: (result) => {
        assert.equal(result.ownership.shared_config_writers, 1);
        assert.ok(result.ownership.worker_prohibited_paths.includes('playwright.config.ts'));
      },
    },
    {
      name: 'legacy v1 evidence is readable but stale',
      files: { 'package.json': { scripts: { test: 'node --test' } } },
      request: { action: 'coverage-audit', level: 'unit', legacyEvidence: { command: 'npm test', exit_code: 0 } },
      check: (result) => {
        assert.equal(result.legacy_evidence.readable, true);
        assert.equal(result.legacy_evidence.fresh, false);
      },
    },
    {
      name: 'missing summary never blocks testing',
      files: { 'go.mod': 'module example.test\n', 'Makefile': 'test:\n\tgo test ./...\n' },
      request: { action: 'run-only', level: 'unit', summaryStatus: 'missing' },
      check: (result) => {
        assert.equal(result.test_context.classification.stack_profile, 'general');
        assert.equal(result.test_context.runner.runner_name, 'go');
        assert.ok(!result.test_context.environment.blockers.includes('missing-summary'));
      },
    },
  ];

  assert.equal(scenarios.length, 27);
  for (const scenario of scenarios) {
    await t.test(scenario.name, async () => {
      const root = await mkdtemp(join(tmpdir(), 'sdcorejs-test-track-'));
      try {
        await writeFixture(root, scenario.files);
        const result = await projectTestFixture(root, scenario.request);
        assert.equal(result.test_context.schema_version, 2);
        assert.equal(result.test_evidence.schema_version, 2);
        assert.ok(result.test_status);
        scenario.check(result);
        assert.equal(result.artifact_context.schema_version, 1);
        assert.equal(result.artifact_context.change_ref, 'fixture-change');
        assert.ok(Array.isArray(result.artifact_context.shared_owned));
        assert.ok(Array.isArray(result.artifact_context.conditional));
        assert.ok(Array.isArray(result.artifact_context.unrelated_observed));
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    });
  }
});
