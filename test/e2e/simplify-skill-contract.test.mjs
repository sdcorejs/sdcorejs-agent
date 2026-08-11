import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  dispatchPrompt,
  loadSkillPack,
} from './support/skill-pack-runner.mjs';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const SKILL_PATH = join(ROOT, 'skills', 'shared', 'workflow', 'simplify.md');
const REF_ROOT = join(ROOT, '_refs', 'simplify');

const ACTIONS = [
  'analyze-current-diff',
  'apply-current-diff',
  'analyze-explicit-scope',
  'apply-explicit-scope',
  'planning-handoff',
];

const PRESERVED_SURFACE_FIELDS = [
  'return_values',
  'output_shape',
  'public_exports',
  'public_types',
  'public_API_and_signatures',
  'routes_status_errors_validation_order',
  'side_effects_and_order',
  'async_concurrency_transaction',
  'retry_timeout_cache',
  'auth_permissions_tenant_approval',
  'persistence_and_query',
  'rendering_DOM_accessibility',
  'telemetry_and_audit',
  'strings_and_prompts',
  'framework_metadata',
  'dependencies_and_config',
];

const ARTIFACT_IDENTITY_FIELDS = [
  'change_ref',
  'source_spec',
  'source_plan',
];

const MIRROR_PATHS = [
  '.claude/skills/sdcorejs-simplify/SKILL.md',
  'plugin/skills/sdcorejs-simplify/SKILL.md',
  'codex/skills/sdcorejs-simplify/SKILL.md',
];

test('simplify: canonical utility exists exactly once and source count is 22', async () => {
  const skillFiles = await listFiles(join(ROOT, 'skills'), file => file.endsWith('.md'));
  const namedSkills = await Promise.all(skillFiles.map(async file => ({
    file,
    name: (await readFile(file, 'utf8')).match(/^name:\s*(\S+)\s*$/m)?.[1],
  })));
  const simplifySkills = namedSkills.filter(item => item.name === 'sdcorejs-simplify');

  assert.equal(namedSkills.length, 22);
  assert.equal(simplifySkills.length, 1);
  assert.equal(simplifySkills[0].file, SKILL_PATH);

  const source = await readFile(SKILL_PATH, 'utf8');
  assert.match(source, /^name:\s*sdcorejs-simplify$/m);
  assert.match(source, /^description:\s*>-/m);
  assert.ok(source.split(/\r?\n/).length < 300, 'executor stays below 300 lines');
  assertSkillContract(source);
});

test('simplify: canonical references resolve and progressive disclosure stays bounded', async () => {
  const skill = await readFile(SKILL_PATH, 'utf8');
  const refs = [
    'scope-and-invariants.md',
    'stack-guardrails.md',
    'verification.md',
  ];

  for (const ref of refs) {
    assert.match(skill, new RegExp(`_refs/simplify/${escapeRegExp(ref)}`));
    const source = await readFile(join(REF_ROOT, ref), 'utf8');
    if (source.split(/\r?\n/).length > 100) {
      assert.match(source.slice(0, 2500), /^## Contents$/m, `${ref} includes Contents`);
    }
  }
});

test('simplify: actions, bounded scope, protected surfaces, and clarity rules fail closed', async () => {
  const scope = await readFile(join(REF_ROOT, 'scope-and-invariants.md'), 'utf8');

  assertScopeContract(scope);
  for (const action of ACTIONS) {
    assert.match(scope, new RegExp(`\\b${escapeRegExp(action)}\\b`), action);
  }
});

test('simplify: stack and AI-agent contracts cannot be simplified', async () => {
  const stack = await readFile(join(REF_ROOT, 'stack-guardrails.md'), 'utf8');
  assertStackGuardrails(stack);
});

test('simplify: baseline, post-change, pass-revert, Git, and context evidence are mandatory', async () => {
  const verification = await readFile(join(REF_ROOT, 'verification.md'), 'utf8');
  assertVerificationContract(verification);
});

test('simplify: execute-plan does not gain a simplify implementation track', async () => {
  const execute = await readFile(join(ROOT, 'skills', 'shared', 'sdlc', '04-execute-plan.md'), 'utf8');
  assert.doesNotMatch(execute, /\|\s*simplify\s*\|/i);
  assert.doesNotMatch(execute, /track(?:s)?(?:\s+values?)?[^.\n]*\bsimplify\b/i);
  assert.match(execute, /angular[\s\S]*nestjs[\s\S]*nextjs[\s\S]*ai-agent/i);
});

test('simplify: finish gate is a visible four-step opt-in with fresh post-write evidence', async () => {
  const finish = await readFile(join(ROOT, '_refs', 'shared', 'finish-gate.md'), 'utf8');
  assertFinishGateContract(finish);
});

test('simplify: downstream owners consume or preserve simplify_context', async () => {
  const files = new Map(await Promise.all([
    ['test', 'skills/tracks/test/sdcorejs-test.md'],
    ['review', 'skills/shared/workflow/review.md'],
    ['repair', 'skills/orchestration/repair-loop.md'],
    ['debug', 'skills/shared/workflow/debug.md'],
    ['ship', 'skills/shared/workflow/ship.md'],
    ['git', 'skills/shared/workflow/git.md'],
  ].map(async ([id, file]) => [id, await readFile(join(ROOT, file), 'utf8')])));

  for (const [id, source] of files) {
    assert.match(source, /simplify_context/, `${id} handles simplify_context`);
  }
  assert.match(files.get('test'), /pre-simplification[\s\S]*post-simplification/i);
  assert.match(files.get('review'), /protected (?:file|content)|scope expansion/i);
  assert.match(files.get('repair'), /preserve.*simplify_context/is);
  assert.match(files.get('debug'), /pre-existing[\s\S]*regression/i);
  assertShipContract(files.get('ship'));
  assert.match(files.get('git'), /must not stage|do not stage/i);
  assert.match(files.get('git'), /runtime-only `?simplify_context`?/i);
});

test('simplify: compound routing selects the utility and preserves dedicated owners', async () => {
  const pack = await loadSkillPack(ROOT);
  const cases = [
    ['use sdcorejs-simplify on the current diff', 'sdcorejs-simplify'],
    ['simplify the recently changed TypeScript code without changing behavior', 'sdcorejs-simplify'],
    ['clean up this modified function for clarity while preserving its exact output', 'sdcorejs-simplify'],
    ['analyze simplification opportunities in the current changed source files', 'sdcorejs-simplify'],
    ['dùng sdcorejs-simplify trên current diff', 'sdcorejs-simplify'],
    ['đơn giản hóa code vừa sửa nhưng giữ nguyên hành vi', 'sdcorejs-simplify'],
    ['phân tích cơ hội đơn giản hóa trong file vừa sửa', 'sdcorejs-simplify'],
    ['hiện đại hóa file vừa sửa nhưng giữ nguyên hành vi', 'sdcorejs-brainstorming'],
    ['refactor the whole repository', 'sdcorejs-brainstorming'],
    ['simplify the architecture of this system', 'sdcorejs-brainstorming'],
    ['change the public API to make it simpler', 'sdcorejs-brainstorming'],
    ['execute the approved refactor plan', 'sdcorejs-execute-plan'],
    ['simplify this README', 'sdcorejs-documentation'],
    ['rewrite this LLM prompt to be shorter', 'sdcorejs-documentation'],
    ['simplify these test cases', 'sdcorejs-test'],
    ['fix this bug by simplifying the logic', 'sdcorejs-debug'],
    ['apply the complexity findings from review', 'sdcorejs-repair-loop'],
    ['review this code for complexity', 'sdcorejs-review'],
    ['remove unused dependencies', 'sdcorejs-ship'],
  ];

  for (const [prompt, expected] of cases) {
    assert.equal(dispatchPrompt(pack, prompt)?.name ?? null, expected, prompt);
  }

  for (const prompt of [
    'optimize this endpoint performance',
    'tối ưu hóa file vừa sửa nhưng giữ nguyên hành vi',
    'change the AI agent tool schema',
    'format this file',
    'refactor',
    'simplify',
    'fix typo',
  ]) {
    assert.notEqual(dispatchPrompt(pack, prompt)?.name ?? null, 'sdcorejs-simplify', prompt);
  }
});

test('simplify: routing detector is narrow rather than a broad keyword match', async () => {
  const runner = await readFile(join(ROOT, 'test', 'e2e', 'support', 'skill-pack-runner.mjs'), 'utf8');
  assertRoutingContract(runner);
});

test('simplify: mutation guards detect removed safety and routing invariants', async () => {
  const scope = await readFile(join(REF_ROOT, 'scope-and-invariants.md'), 'utf8');
  const stack = await readFile(join(REF_ROOT, 'stack-guardrails.md'), 'utf8');
  const verification = await readFile(join(REF_ROOT, 'verification.md'), 'utf8');
  const finish = await readFile(join(ROOT, '_refs', 'shared', 'finish-gate.md'), 'utf8');
  const runner = await readFile(join(ROOT, 'test', 'e2e', 'support', 'skill-pack-runner.mjs'), 'utf8');
  const ship = await readFile(join(ROOT, 'skills', 'shared', 'workflow', 'ship.md'), 'utf8');

  assertMutationFails(scope, /current-diff boundary/i, assertScopeContract, /current-diff boundary/);
  assertMutationFails(scope, /documentation, prompts, and configuration/i, assertScopeContract, /protected docs/);
  assertMutationFails(scope, /string literals/i, assertScopeContract, /string literals/);
  assertMutationFails(scope, /tests, fixtures, and snapshots/i, assertScopeContract, /test oracle/);
  assertMutationFails(scope, /public API/i, assertScopeContract, /public contract/);
  assertMutationFails(scope, /max_passes:\s*2/, assertScopeContract, /pass limit/);
  assertMutationFails(scope, /dependency and configuration changes are forbidden/i, assertScopeContract, /dependency prohibition/);
  assertMutationFails(scope, /allowed_simplify_actions:/, assertScopeContract, /allowed action list/);
  assertMutationFails(scope, /  return_values:/, assertScopeContract, /preserved surface schema/);

  assertMutationFails(verification, /green baseline/i, assertVerificationContract, /baseline verification/);
  assertMutationFails(verification, /post-change verification/i, assertVerificationContract, /post-change verification/);
  assertMutationFails(verification, /`git add`/, assertVerificationContract, /Git add prohibition/);
  assertMutationFails(verification, /    return_values:/, assertVerificationContract, /preserved surface schema/);
  assertMutationFails(verification, /    change_ref:/, assertVerificationContract, /artifact identity field/);

  assertMutationFails(finish, /never auto-run simplification/i, assertFinishGateContract, /opt-in simplification/);
  assertMutationFails(
    finish,
    /Finish step 3\/4/i,
    assertFinishGateContract,
    /four finish decisions|simplification choice/,
  );

  assertMutationFails(runner, /hasBehaviorPreservationIntent/, assertRoutingContract, /behavior-preservation detector/);
  assertMutationFails(runner, /hasBoundedSimplifyScope/, assertRoutingContract, /bounded-scope detector/);
  assertMutationFails(runner, /function hasLocalizedSimplifyIntent/, assertRoutingContract, /localized simplify phrase detector/);
  assertMutationFails(runner, /function hasLocalizedAnalyzeSimplifyIntent/, assertRoutingContract, /localized analyze phrase detector/);
  assertMutationFails(runner, /function hasLocalizedCompetingSimplifyIntent/, assertRoutingContract, /localized competing-owner detector/);

  assertMutationFails(stack, /tool schemas/i, assertStackGuardrails, /AI tool schema/);
  assertMutationFails(
    stack,
    /prompts and instructions/i,
    assertStackGuardrails,
    /AI prompts remain protected|AI prompt protection/,
  );

  assertMutationFails(ship, /stale post-simplification evidence/i, assertShipContract, /stale evidence/);
});

test('simplify: package, mirrors, refs, catalog, and dependency boundary agree on 22 skills', async () => {
  const pkg = JSON.parse(await readFile(join(ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.version, '0.8.0');
  assert.equal(pkg.packageManager, 'npm@10.9.2');
  assert.match(pkg.scripts['test:e2e:repository'], /test\/e2e\/simplify-skill-contract\.test\.mjs/);

  for (const path of MIRROR_PATHS) {
    const source = await readFile(join(ROOT, path), 'utf8');
    assert.match(source, /^name:\s*sdcorejs-simplify$/m, path);
    if (path.startsWith('codex/')) {
      const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
      assert.doesNotMatch(frontmatter, /^allowed-tools:/m);
    }
  }

  for (const ref of ['scope-and-invariants.md', 'stack-guardrails.md', 'verification.md']) {
    await readFile(join(ROOT, '.claude', '_refs', 'simplify', ref), 'utf8');
    await readFile(join(ROOT, 'plugin', '_refs', 'simplify', ref), 'utf8');
    await readFile(join(ROOT, 'codex', 'skills', '_refs', 'simplify', ref), 'utf8');
  }

  const publicSources = await Promise.all([
    'README.md',
    'VALIDATION.md',
    'site/src/components/SkillCatalog.astro',
    'site/src/pages/index.astro',
    'site/README.md',
  ].map(file => readFile(join(ROOT, file), 'utf8')));
  assert.ok(publicSources.every(source => /\b22\b/.test(source)), 'public inventories show 22');

  const lock = JSON.parse(await readFile(join(ROOT, 'package-lock.json'), 'utf8'));
  assert.equal(lock.packages[''].version, '0.8.0');

  const versionedMetadata = await Promise.all([
    'site/package.json',
    'site/package-lock.json',
    '.claude-plugin/marketplace.json',
    'plugin/.claude-plugin/plugin.json',
  ].map(async file => [file, JSON.parse(await readFile(join(ROOT, file), 'utf8'))]));
  for (const [file, metadata] of versionedMetadata) {
    if (file === '.claude-plugin/marketplace.json') {
      assert.equal(metadata.plugins[0].version, '0.8.0', file);
    } else if (file.endsWith('package-lock.json')) {
      assert.equal(metadata.packages[''].version, '0.8.0', file);
    } else {
      assert.equal(metadata.version, '0.8.0', file);
    }
  }
});

function assertSkillContract(source) {
  assert.match(source, /workflow utility/i, 'skill is a utility');
  assert.match(source, /current changed executable source/i, 'current source is default');
  assert.match(source, /explicit (?:file|function|path|source) scope/i, 'explicit scope exists');
  assert.match(source, /planning-handoff/, 'broad changes return to planning');
  assert.match(source, /baseline verification/i, 'write mode needs a baseline');
  assert.match(source, /post-change verification/i, 'write mode reruns verification');
  assert.match(source, /simplify_context/, 'skill emits runtime evidence');
  assert.match(source, /must not (?:stage|invoke Git)|never (?:stage|invoke Git)/i, 'skill has no Git writes');
}

function assertScopeContract(source) {
  assert.match(
    source,
    /^simplify_action:\s*<exactly one allowed value>$/m,
    'simplify_action is one scalar selection',
  );
  const actionList = source.match(
    /^allowed_simplify_actions:\r?\n((?:  - [^\r\n]+\r?\n?)+)/m,
  );
  assert.ok(actionList, 'allowed action list exists');
  assert.deepEqual(
    [...actionList[1].matchAll(/^  - ([^\r\n]+)$/gm)].map((match) => match[1]),
    ACTIONS,
    'allowed action list matches the public contract',
  );
  assert.doesNotMatch(
    source,
    /^simplify_action:\r?\n\s{2}analyze-current-diff$/m,
    'simplify_action must not parse as a folded scalar',
  );
  const preservedSurfaces = source.match(
    /^preserved_surfaces:\r?\n((?:  [A-Za-z_]+:[^\r\n]*\r?\n?)+)/m,
  );
  assert.ok(preservedSurfaces, 'preserved surface schema exists');
  assert.deepEqual(
    [...preservedSurfaces[1].matchAll(/^  ([A-Za-z_]+):/gm)].map((match) => match[1]),
    PRESERVED_SURFACE_FIELDS,
    'preserved surface schema matches the canonical contract',
  );
  assert.match(source, /current-diff boundary/i, 'current-diff boundary exists');
  assert.match(source, /explicit (?:file|function|path|source) scope/i, 'explicit scope exists');
  assert.match(source, /documentation, prompts, and configuration/i, 'protected docs exist');
  assert.match(source, /string literals/i, 'string literals are protected');
  assert.match(source, /tests, fixtures, and snapshots/i, 'test oracle is protected');
  assert.match(source, /public API/i, 'public contract is protected');
  assert.match(source, /framework metadata/i, 'framework metadata is protected');
  assert.match(source, /dependency and configuration changes are forbidden/i, 'dependency prohibition exists');
  assert.match(source, /clarity over (?:brevity|line count)/i, 'clarity wins');
  assert.match(source, /dense one-liners/i, 'over-simplification is forbidden');
  assert.match(source, /max_passes:\s*2/, 'pass limit exists');
  assert.match(source, /max_files_per_pass:\s*5/);
  assert.match(source, /max_total_files_without_reconfirmation:\s*8/);
  assert.match(source, /max_hunks_without_reconfirmation:\s*20/);
}

function assertStackGuardrails(source) {
  assert.match(source, /Angular/);
  assert.match(source, /NestJS/);
  assert.match(source, /Next\.js|Next\.js \/ React/);
  assert.match(source, /AI-agent/i);
  assert.match(source, /tool schemas/i, 'AI tool schema remains protected');
  assert.match(source, /prompts and instructions/i, 'AI prompts remain protected');
  assert.match(source, /tenant|permission/i);
  assert.match(source, /server\/client/i);
  assert.match(source, /decorators and reflection metadata/i);
  assert.match(source, /autoId/);
}

function assertVerificationContract(source) {
  assert.match(source, /green baseline/i, 'baseline verification exists');
  assert.match(source, /post-change verification/i, 'post-change verification exists');
  assert.match(source, /exact scoped edits/i, 'failed pass uses exact edits');
  assert.match(source, /behavior_verification/);
  assert.match(source, /covered-by-current-tests\s*\|\s*limited\s*\|\s*not-verified/);
  assert.match(source, /simplify_context:/);
  assert.match(source, /artifact_context:/);
  const preservedSurfaces = source.match(
    /^  preserved_surfaces:\r?\n((?:    [A-Za-z_]+:[^\r\n]*\r?\n?)+)/m,
  );
  assert.ok(preservedSurfaces, 'preserved surface schema exists');
  assert.deepEqual(
    [...preservedSurfaces[1].matchAll(/^    ([A-Za-z_]+):/gm)].map((match) => match[1]),
    PRESERVED_SURFACE_FIELDS,
    'preserved surface schema matches the canonical contract',
  );
  const artifactContext = source.match(
    /^  artifact_context:\r?\n([\s\S]*?)^```$/m,
  );
  assert.ok(artifactContext, 'artifact context schema exists');
  for (const field of ARTIFACT_IDENTITY_FIELDS) {
    assert.match(
      artifactContext[1],
      new RegExp(`^    ${field}:`, 'm'),
      `artifact identity field ${field} exists`,
    );
  }
  assert.match(source, /`git add`/, 'Git add prohibition exists');
  assert.match(source, /`git commit`/);
  assert.match(source, /`git push`/);
  assert.match(source, /Git writes are forbidden/i);
}

function assertFinishGateContract(source) {
  const steps = [...source.matchAll(/Finish step ([1-4])\/4/gi)].map(match => Number(match[1]));
  assert.deepEqual([...new Set(steps)], [1, 2, 3, 4], 'four finish decisions exist');
  assert.match(source, /behavior-preserving code simplification/i, 'simplification choice exists');
  assert.match(source, /never auto-run simplification/i, 'opt-in simplification is explicit');
  assert.match(source, /Skip simplification for this run/i);
  assert.match(source, /Analyze eligible changed code/i);
  assert.match(source, /Simplify eligible changed source code after a green baseline/i);
  assert.match(source, /tests?[\s\S]*simplif[\s\S]*post-simplification[\s\S]*review/i);
}

function assertRoutingContract(source) {
  assert.match(source, /hasBehaviorPreservationIntent/, 'behavior-preservation detector exists');
  assert.match(source, /hasBoundedSimplifyScope/, 'bounded-scope detector exists');
  assert.match(source, /hasCompetingSimplifyOwnerIntent/, 'owner exclusions exist');
  assert.match(source, /hasSimplifyIntent/, 'simplify intent detector exists');
  assert.match(
    source,
    /function hasLocalizedSimplifyIntent/,
    'localized simplify phrase detector exists',
  );
  assert.match(
    source,
    /function hasLocalizedAnalyzeSimplifyIntent/,
    'localized analyze phrase detector exists',
  );
  assert.match(
    source,
    /function hasLocalizedCompetingSimplifyIntent/,
    'localized competing-owner detector exists',
  );
  for (const token of ['gian', 'hoa', 'giu', 'hanh', 'vi']) {
    assert.doesNotMatch(
      source,
      new RegExp(`\\['${token}',\\s*\\[`),
      `localized fragment ${token} must not be a standalone routing alias`,
    );
  }
  assert.match(source, /sdcorejs-simplify/);
  assert.doesNotMatch(
    source,
    /skill:\s*'sdcorejs-simplify'[\s\S]{0,180}when:[^{]*\(\{[^}]*tokens[^}]*\}\)\s*=>\s*tokens\.has\(['"](?:simplify|refactor|clean)['"]\)/,
    'routing is not a one-keyword detector',
  );
}

function assertShipContract(source) {
  assert.match(source, /stale post-simplification evidence/i, 'stale evidence blocks ship');
  assert.match(source, /behavior_verification[^.\n]*not-verified/i);
  assert.match(source, /protected strings|strings\/prompts\/contracts/i);
  assert.match(source, /failed pass/i);
}

function assertMutationFails(source, pattern, assertion, expectedError) {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  const mutated = source.replace(new RegExp(pattern.source, flags), 'removed_invariant');
  assert.notEqual(mutated, source, `mutation applies: ${pattern}`);
  assert.throws(() => assertion(mutated), expectedError);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function listFiles(root, predicate) {
  const entries = await readdir(root, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return listFiles(path, predicate);
    return entry.isFile() && predicate(path) ? [path] : [];
  }));
  return nested.flat().sort((a, b) => relative(ROOT, a).localeCompare(relative(ROOT, b)));
}
