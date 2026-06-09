import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadEntrypointProfiles, runEntrypointPromptSmoke } from './support/entrypoint-smoke.mjs';
import { loadSkillPack } from './support/skill-pack-runner.mjs';

test('phase 3: Codex, Claude Code, Copilot, and Cursor entrypoints advertise runtime-localized skills', async () => {
  const profiles = await loadEntrypointProfiles(new URL('../..', import.meta.url));

  assert.deepEqual(Object.keys(profiles).sort(), ['claude-code', 'codex', 'copilot', 'cursor']);
  for (const [name, profile] of Object.entries(profiles)) {
    assert.ok(profile.entrypoints.length > 0, `${name} has entrypoints`);
    assert.match(profile.text, /Runtime-localized|runtime-localized/i);
    assert.doesNotMatch(profile.text, /Bilingual|VI\/EN|Vietnamese/);
  }
});

test('phase 3: compatibility smoke uses the same prompt eval set for every entrypoint profile', async () => {
  const root = new URL('../..', import.meta.url);
  const pack = await loadSkillPack(root);
  const profiles = await loadEntrypointProfiles(root);
  const promptEvals = await loadPromptEvals();
  const results = runEntrypointPromptSmoke(pack, profiles, promptEvals.filter((item) => item.phase === 3));

  for (const result of results) {
    assert.equal(result.pass, true, `${result.profile}:${result.id} -> ${result.actualSkill}`);
  }
});

async function loadPromptEvals() {
  const file = new URL('./fixtures/prompt-evals.json', import.meta.url);
  return JSON.parse(await readFile(file, 'utf8'));
}
