import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadSkillPack, runPromptEval } from './support/skill-pack-runner.mjs';

test('phase 1: deterministic runner loads source skills, mirrors, and refs without LLM/tool calls', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));

  assert.equal(pack.sourceSkills.length, 42);
  assert.equal(pack.claudeMirrorSkills.length, 42);
  assert.equal(pack.pluginMirrorSkills.length, 42);
  assert.ok(pack.referenceDocs.length >= 140);
  assert.equal(pack.diagnostics.length, 0);
});

test('phase 1: deterministic prompt eval dispatches expected skills', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  const promptEvals = await loadPromptEvals();
  const results = runPromptEval(pack, promptEvals.filter((item) => item.phase === 1));

  assert.deepEqual(
    results.map((result) => [result.id, result.actualSkill, result.pass]),
    [
      ['nestjs-init', 'nestjs-write-code', true],
      ['angular-action-localized', 'angular-write-code', true],
      ['open-ended-localized', 'sdcorejs-brainstorm', true]
    ]
  );
});

async function loadPromptEvals() {
  const file = new URL('./fixtures/prompt-evals.json', import.meta.url);
  return JSON.parse(await readFile(file, 'utf8'));
}
