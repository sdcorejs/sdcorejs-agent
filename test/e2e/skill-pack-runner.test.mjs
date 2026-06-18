import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadSkillPack, runPromptEval } from './support/skill-pack-runner.mjs';

test('phase 1: deterministic runner loads source skills, mirrors, and refs without LLM/tool calls', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));

  assert.equal(pack.sourceSkills.length, 24);
  assert.equal(pack.claudeMirrorSkills.length, 24);
  assert.equal(pack.pluginMirrorSkills.length, 24);
  assert.equal(pack.codexMirrorSkills.length, 24);
  // Core UI per-component docs are fetched on-demand (not committed), so this count
  // dropped from ~150 to ~69. Floor still catches accidental mass-deletion of refs.
  assert.ok(pack.referenceDocs.length >= 60, `referenceDocs=${pack.referenceDocs.length}`);
  assert.equal(pack.codexReferenceDocs.length, pack.referenceDocs.length);
  assert.equal(pack.diagnostics.length, 0);
});

test('phase 1: mandatory workflow invariants are encoded in source skills and refs', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const sourceByName = new Map(pack.sourceSkills.map((skill) => [skill.name, skill.text]));

  for (const name of ['sdcorejs-angular', 'sdcorejs-nestjs', 'sdcorejs-nextjs']) {
    const text = sourceByName.get(name);
    assert.ok(text, `${name} exists`);
    assert.match(text, /_refs\/shared\/finish-gate\.md/, `${name} presents the finish gate`);
    assert.match(text, /sdcorejs-ship \(verify-before-done mode\)/, `${name} runs acceptance verification`);
    assert.match(text, /sdcorejs-ship \(branch-ready mode\)/, `${name} runs branch-ready`);
    assert.match(text, /_refs\/orchestration\/tail\/auto-docs\.md/, `${name} writes auto-docs`);
    assert.match(text, /_refs\/orchestration\/tail\/auto-task-tracker\.md/, `${name} updates task tracker`);
    assert.match(text, /memories mode/, `${name} hands off durable memories when needed`);
  }

  const testSkill = sourceByName.get('sdcorejs-test');
  assert.match(testSkill, /## Direct invocation tail/);
  assert.match(testSkill, /TRACK=test/);
  assert.match(testSkill, /_refs\/orchestration\/tail\/auto-docs\.md/);
  assert.match(testSkill, /_refs\/orchestration\/tail\/auto-task-tracker\.md/);

  const reviewSkill = sourceByName.get('sdcorejs-review');
  assert.match(reviewSkill, /## Post-review tail/);
  assert.match(reviewSkill, /status `reviewed`/);
  assert.match(reviewSkill, /_refs\/orchestration\/tail\/auto-docs\.md/);
  assert.match(reviewSkill, /_refs\/orchestration\/tail\/auto-task-tracker\.md/);

  for (const name of [
    'sdcorejs-execute-plan',
    'sdcorejs-angular',
    'sdcorejs-nestjs',
    'sdcorejs-nextjs',
    'sdcorejs-product',
    'sdcorejs-design',
    'sdcorejs-test',
    'sdcorejs-review',
    'sdcorejs-parallel-dispatch'
  ]) {
    const text = sourceByName.get(name);
    assert.ok(text, `${name} exists`);
    assert.match(text, /project-context\.md/, `${name} loads project-context before execution`);
    assert.match(text, /sdcorejs-explore\s+\(summary\s+mode\)/, `${name} runs summary-mode context preflight`);
  }

  const coreVersion = await readFile(new URL('../../_refs/angular/core-version.md', import.meta.url), 'utf8');
  assert.doesNotMatch(coreVersion, /10-init-portal/);
  assert.match(coreVersion, /_refs\/angular\/write-code\/init-portal\.md/);

  const dockerize = await readFile(new URL('../../skills/infra/dockerize.md', import.meta.url), 'utf8');
  assert.match(dockerize, /frontend\/[^\n]*\r?\n\s+frontend-nginx\.conf/);
  assert.doesNotMatch(dockerize, /test\/\?[^\n]*\r?\n\s+frontend-nginx\.conf/);
});

test('phase 1: long references expose a top-of-file contents map', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));

  for (const file of pack.referenceDocs) {
    const text = await readFile(file, 'utf8');
    const lineCount = text.split(/\r?\n/).length;
    if (lineCount < 500) continue;

    assert.match(
      text.slice(0, 2000),
      /contents|table of contents/i,
      `${file} has ${lineCount} lines and needs a top-of-file contents map`
    );
  }
});

test('phase 1: skill metadata stays concise and production scope stays explicit', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const maxDescriptionChars = 520;

  for (const skill of pack.sourceSkills) {
    assert.ok(
      skill.description.length <= maxDescriptionChars,
      `${skill.name} description has ${skill.description.length} chars`
    );
  }

  const agents = await readFile(new URL('../../AGENTS.md', import.meta.url), 'utf8');
  assert.match(agents, /## Production SDLC Scope Decision/);
  assert.match(agents, /Do \*\*not\*\* add new production-SDLC skills or refs/);

  const solutionBuilder = await readFile(new URL('../../skills/orchestration/solution-builder.md', import.meta.url), 'utf8');
  assert.match(solutionBuilder, /## Production SDLC boundary/);
  assert.match(solutionBuilder, /does \*\*not\*\* create production-SDLC surfaces/);
});

test('phase 1: deterministic prompt eval dispatches expected skills', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const promptEvals = await loadPromptEvals();
  const results = runPromptEval(pack, promptEvals.filter((item) => item.phase === 1));

  assert.deepEqual(
    results.map((result) => [result.id, result.actualSkill, result.pass]),
    [
      ['nestjs-init', 'sdcorejs-nestjs', true],
      ['angular-action-localized', 'sdcorejs-angular', true],
      ['open-ended-localized', 'sdcorejs-brainstorming', true],
      ['product-traceability-localized', 'sdcorejs-product', true],
      ['solution-builder-classroom-localized', 'sdcorejs-solution-builder', true],
      ['design-from-user-stories-localized', 'sdcorejs-design', true]
    ]
  );
});

async function loadPromptEvals() {
  const file = new URL('./fixtures/prompt-evals.json', import.meta.url);
  return JSON.parse(await readFile(file, 'utf8'));
}
