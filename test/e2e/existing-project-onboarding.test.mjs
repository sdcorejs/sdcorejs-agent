import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { assembleProjectContext } from '../../_refs/shared/project-context.mjs';
import { collectProjectInstructions } from '../../_refs/shared/project-instructions.mjs';

async function fixture(t, files) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-onboarding-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), content);
  }
  return root;
}

test('existing-project context discovers scoped instructions without modifying human rules', async t => {
  const files = {
    'AGENTS.md': 'Human root rules: use pnpm.\n',
    'README.md': 'Run the documented workspace script.\n',
    'apps/web/AGENTS.md': 'Web rules: components use PascalCase.\n',
    'apps/api/AGENTS.md': 'API-only rules.\n',
    '.github/copilot-instructions.md': 'Shared instructions.\n',
    '.github/instructions/web.instructions.md': '---\napplyTo: "apps/web/**"\n---\nWeb policy.\n',
    '.cursor/rules/manual.mdc': '---\nalwaysApply: false\n---\nManual policy.\n',
    'apps/web/src/page.ts': 'export const page = 1;\n',
    'package.json': '{"name":"legacy-workspace"}',
  };
  const root = await fixture(t, files);
  const { project_context: context } = await assembleProjectContext({ root, explicitFiles: ['apps/web/src/page.ts'] });
  assert.ok(context.instructions, 'project context must expose instruction discovery');
  const byPath = Object.fromEntries(context.instructions.sources.map(item => [item.path, item]));
  assert.equal(byPath['AGENTS.md'].applicability, 'applicable');
  assert.equal(byPath['apps/web/AGENTS.md'].applicability, 'applicable');
  assert.equal(byPath['apps/api/AGENTS.md'], undefined);
  assert.equal(byPath['.github/instructions/web.instructions.md'].applicability, 'scope-review-required');
  assert.equal(byPath['.cursor/rules/manual.mdc'].applicability, 'scope-review-required');
  assert.equal(context.instructions.resolution, 'requires-content-review');
  assert.equal(context.instructions.writes_allowed, false);
  for (const [name, content] of Object.entries(files)) assert.equal(await readFile(path.join(root, name), 'utf8'), content);
});

test('Windows relative targets discover the same scoped instructions as slash-separated targets', async t => {
  const files = {
    'AGENTS.md': 'Root rules.\n',
    'apps/web/AGENTS.md': 'Web-only rules.\n',
    'apps/api/AGENTS.md': 'Unrelated sibling rules.\n',
    'apps/web/src/page.ts': 'export const page = 1;\n',
  };
  const root = await fixture(t, files);
  const windows = (await assembleProjectContext({ root, explicitFiles: [String.raw`apps\web\src\page.ts`] })).project_context;
  const posix = (await assembleProjectContext({ root, explicitFiles: ['apps/web/src/page.ts'] })).project_context;
  assert.equal(windows.instructions.status, 'discovered');
  assert.deepEqual(windows.instructions.sources.map(item => item.path), ['AGENTS.md', 'apps/web/AGENTS.md']);
  assert.deepEqual(windows.instructions, posix.instructions);
  assert.deepEqual(windows.current_evidence.files, ['apps/web/src/page.ts']);
  for (const [name, content] of Object.entries(files)) assert.equal(await readFile(path.join(root, name), 'utf8'), content);
});

test('native instruction target normalization preserves unsafe-path rejection', async t => {
  const root = await fixture(t, { 'AGENTS.md': 'Root rules.', 'apps/web/AGENTS.md': 'Scoped rules.' });
  for (const target of [String.raw`..\outside.ts`, String.raw`apps\..\web\src\page.ts`,
    String.raw`C:\apps\web\src\page.ts`, String.raw`\\server\share\page.ts`, '/apps/web/src/page.ts', 42, null]) {
    const result = (await assembleProjectContext({ root, explicitFiles: [target] })).project_context.instructions;
    assert.equal(result.status, 'incomplete');
    assert.ok(result.findings.some(item => item.code === 'INSTRUCTION_TARGET_INVALID'));
    assert.deepEqual(result.sources.map(item => item.path), ['AGENTS.md']);
  }
});

test('instruction discovery changes fingerprints and never reads sibling or symlinked secrets', async t => {
  const root = await fixture(t, { 'AGENTS.md': 'Initial rule.', 'src/a.ts': '', '.env': 'SECRET=fixture-only-do-not-read' });
  await symlink(path.join(root, '.env'), path.join(root, 'CLAUDE.md'));
  const before = (await assembleProjectContext({ root, explicitFiles: ['src/a.ts'] })).project_context.instructions;
  assert.ok(before, 'instruction discovery is required');
  assert.ok(before.findings.some(item => item.code === 'INSTRUCTION_SYMLINK_SKIPPED'));
  assert.ok(!JSON.stringify(before).includes('fixture-only-do-not-read'));
  await writeFile(path.join(root, 'AGENTS.md'), 'Changed rule.');
  const after = (await assembleProjectContext({ root, explicitFiles: ['src/a.ts'] })).project_context.instructions;
  assert.notEqual(before.sources[0].sha256, after.sources[0].sha256);
});

test('missing instructions and unknown target scope remain explicit without bootstrapping', async t => {
  const root = await fixture(t, { 'package.json': '{"name":"legacy"}', 'apps/web/AGENTS.md': 'Scoped.' });
  const result = (await assembleProjectContext({ root })).project_context.instructions;
  assert.ok(result);
  assert.equal(result.status, 'missing');
  assert.equal(result.target_scope, 'root-only');
  assert.equal(result.writes_allowed, false);
});

test('nested host rules are scoped to target ancestors and linked directories are reported', async t => {
  const root = await fixture(t, {
    'AGENTS.md': 'Root rules.',
    'apps/web/.claude/CLAUDE.md': 'Web instructions.',
    'apps/web/.claude/rules/ui.md': '---\npaths: ["src/**"]\n---\nUI rules.',
    'apps/web/.cursor/rules/ui.mdc': '---\nglobs: "src/**"\n---\nUI rules.',
    'apps/api/.claude/rules/api.md': 'Unrelated rules.',
    '.claude/rules/base.md': 'Base rule.',
    'linked-rule-target/secret.md': 'Never read this through a symlink.',
  });
  await symlink(path.join(root, 'linked-rule-target'), path.join(root, '.claude/rules/linked'), 'dir');
  const result = await collectProjectInstructions(root, { targetPaths: ['apps/web/src/new.ts'] });
  const paths = result.sources.map(item => item.path);
  assert.ok(paths.includes('apps/web/.claude/CLAUDE.md'));
  assert.ok(paths.includes('apps/web/.claude/rules/ui.md'));
  assert.ok(paths.includes('apps/web/.cursor/rules/ui.mdc'));
  assert.ok(!paths.includes('apps/api/.claude/rules/api.md'));
  assert.ok(result.findings.some(item => item.code === 'INSTRUCTION_SYMLINK_SKIPPED' && item.path === '.claude/rules/linked'));
  assert.ok(!paths.some(item => item.includes('secret.md')));
});

test('missing roots and invalid target paths report incomplete discovery rather than throwing', async t => {
  const root = await fixture(t, { 'AGENTS.md': 'Root rules.' });
  const missing = await collectProjectInstructions(path.join(root, 'absent'));
  assert.equal(missing.status, 'incomplete');
  assert.ok(missing.findings.some(item => item.code === 'INSTRUCTION_ROOT_UNAVAILABLE'));
  const fileRoot = await collectProjectInstructions(path.join(root, 'AGENTS.md'));
  assert.equal(fileRoot.status, 'incomplete');
  const invalid = await collectProjectInstructions(root, { targetPaths: ['../outside.ts'] });
  assert.equal(invalid.status, 'incomplete');
});

test('Claude consolidation candidates retain their own scope and input hashes without migrating files', async t => {
  const files = {
    'AGENTS.md': 'Shared human rules: use pnpm.\n',
    'CLAUDE.md': 'Common project rules plus Claude-specific settings.\n',
    'apps/web/.claude/CLAUDE.md': 'Web-only instructions.\n',
    'apps/api/CLAUDE.md': 'Unrelated API instructions.\n',
    'apps/web/src/page.ts': 'export const page = 1;\n',
  };
  const root = await fixture(t, files);
  const result = (await assembleProjectContext({ root, explicitFiles: ['apps/web/src/page.ts'] })).project_context.instructions;
  assert.ok(Array.isArray(result.consolidation_candidates), 'onboarding must expose reviewable consolidation candidates');
  assert.deepEqual(result.consolidation_candidates.map(candidate => [candidate.source, candidate.target, candidate.base_scope]), [
    ['CLAUDE.md', 'AGENTS.md', '.'],
    ['apps/web/.claude/CLAUDE.md', 'apps/web/AGENTS.md', 'apps/web'],
  ]);
  for (const candidate of result.consolidation_candidates) {
    assert.equal(candidate.status, 'proposal');
    assert.equal(candidate.review_required, true);
    assert.equal(candidate.writes_allowed, false);
    assert.equal(candidate.source_sha256, createHash('sha256').update(files[candidate.source]).digest('hex'));
    assert.equal(candidate.target_sha256, files[candidate.target] === undefined ? null : createHash('sha256').update(files[candidate.target]).digest('hex'));
  }
  for (const [name, content] of Object.entries(files)) assert.equal(await readFile(path.join(root, name), 'utf8'), content);
  await assert.rejects(readFile(path.join(root, 'apps/web/AGENTS.md')), { code: 'ENOENT' });
});

test('Claude-only onboarding proposes AGENTS without treating discovery as migration approval', async t => {
  const root = await fixture(t, { 'CLAUDE.md': 'Human Claude rules.\n' });
  const result = await collectProjectInstructions(root);
  assert.equal(result.consolidation_candidates?.length, 1);
  assert.equal(result.consolidation_candidates[0].target, 'AGENTS.md');
  assert.equal(result.consolidation_candidates[0].target_sha256, null);
  assert.equal(result.writes_allowed, false);
  assert.equal(await readFile(path.join(root, 'CLAUDE.md'), 'utf8'), 'Human Claude rules.\n');
  await assert.rejects(readFile(path.join(root, 'AGENTS.md')), { code: 'ENOENT' });
});

test('onboarding does not propose Claude consolidation for other providers or symlinked instructions', async t => {
  const root = await fixture(t, { 'AGENTS.md': 'Human rules.\n', 'GEMINI.md': 'Other host.\n', '.env': 'SECRET=fixture-only' });
  await symlink(path.join(root, '.env'), path.join(root, 'CLAUDE.md'));
  const result = await collectProjectInstructions(root);
  assert.deepEqual(result.consolidation_candidates, []);
  assert.ok(result.findings.some(item => item.code === 'INSTRUCTION_SYMLINK_SKIPPED'));
  assert.ok(!JSON.stringify(result).includes('fixture-only'));
});

async function runtimeDecision(input) {
  const { decideProjectRuntime } = await import('../../_refs/shared/project-runtime.mjs');
  return decideProjectRuntime(input);
}

const authorizedStart = {
  action: 'runtime-start-authorized',
  local_target: true,
  authority: { source: 'user-request:run-local-project', local_process: true, scope_matches: true },
  command_verified: true,
  prerequisites: 'ready',
  startup_timeout_ms: 15000,
  observation: { state: 'not-running', fresh: true, coverage: 'complete' },
};

test('runtime startup executes only for a verified local command with current scoped authority', async () => {
  assert.equal((await runtimeDecision(authorizedStart)).next_action, 'start');
  for (const change of [
    { authority: {} }, { authority: { ...authorizedStart.authority, scope_matches: false } },
    { command_verified: false }, { prerequisites: 'missing' }, { local_target: false },
    { action: 'summary-read' }, { action: 'runtime-check-readonly' },
    { observation: { state: 'not-running', fresh: false } },
    { observation: { state: 'not-running', fresh: true, coverage: 'partial' } },
    { observation: { state: 'not-running', fresh: true } },
    { startup_timeout_ms: undefined }, { startup_timeout_ms: 0 },
    { startup_timeout_ms: Infinity },
  ]) {
    assert.notEqual((await runtimeDecision({ ...authorizedStart, ...change })).next_action, 'start');
  }
});

test('runtime checks distinguish unknown, conflicting, unhealthy, and reusable listeners', async () => {
  const check = observation => runtimeDecision({ ...authorizedStart, observation });
  assert.equal((await check({ state: 'unknown', fresh: true })).next_action, 'inspect');
  assert.equal((await check({ state: 'running', fresh: true, identity: 'unknown', readiness: 'passed' })).next_action, 'inspect');
  assert.equal((await check({ state: 'running', fresh: true, identity: 'mismatch', readiness: 'passed' })).status, 'blocked');
  assert.equal((await check({ state: 'running', fresh: true, identity: 'match', readiness: 'failed' })).next_action, 'diagnose');
  assert.equal((await check({ state: 'running', fresh: true, identity: 'match', readiness: 'passed' })).next_action, 'reuse');
});

test('runtime decision drives a real local HTTP readiness flow without launching a duplicate', async t => {
  const first = await runtimeDecision(authorizedStart);
  assert.equal(first.next_action, 'start');
  let starts = 0;
  const server = createServer((req, res) => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ application: 'onboarding-fixture', ready: req.url === '/ready' }));
  });
  t.after(() => new Promise(resolve => server.close(resolve)));
  if (first.next_action === 'start') {
    starts++;
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  }
  const response = await fetch(`http://127.0.0.1:${server.address().port}/ready`);
  const body = await response.json();
  const second = await runtimeDecision({ ...authorizedStart, observation: {
    state: 'running', fresh: true,
    identity: body.application === 'onboarding-fixture' ? 'match' : 'mismatch',
    readiness: response.ok && body.ready ? 'passed' : 'failed',
  } });
  if (second.next_action === 'start') starts++;
  assert.equal(second.status, 'ready');
  assert.equal(second.next_action, 'reuse');
  assert.equal(starts, 1);
});
