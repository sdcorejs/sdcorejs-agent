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
