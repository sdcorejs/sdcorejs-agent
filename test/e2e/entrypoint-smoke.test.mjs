import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  deriveEntrypointRoutingContext,
  loadEntrypointProfiles,
  runEntrypointPromptSmoke
} from './support/entrypoint-smoke.mjs';
import { loadSkillPack } from './support/skill-pack-runner.mjs';

test('phase 3: Codex, Claude Code, Copilot, and Cursor entrypoints advertise runtime-localized skills', async () => {
  const profiles = await loadEntrypointProfiles(new URL('../..', import.meta.url));

  assert.deepEqual(Object.keys(profiles).sort(), ['claude-code', 'codex', 'copilot', 'cursor']);
  for (const [name, profile] of Object.entries(profiles)) {
    assert.ok(profile.entrypoints.length > 0, `${name} has entrypoints`);
    assert.match(profile.text, /Runtime-localized|runtime-localized/i);
    // Catch stale bilingual BRANDING only. Bare "Vietnamese" legitimately appears in the
    // Mojibake-guard rule (about preserving VN diacritics), so it must not trip this.
    assert.doesNotMatch(profile.text, /Bilingual|VI\/EN/);
  }
});

test('phase 3: entrypoint-aware smoke evaluates the same cases under each profile policy', async () => {
  const root = new URL('../..', import.meta.url);
  const pack = await loadSkillPack(root);
  const profiles = await loadEntrypointProfiles(root);
  const promptEvals = await loadPromptEvals();
  const results = runEntrypointPromptSmoke(pack, profiles, promptEvals.filter((item) => item.phase === 3));

  for (const result of results) {
    assert.equal(result.pass, true, `${result.profile}:${result.id} -> ${result.actualSkill}`);
  }
});

test('phase 3: each profile text participates in routing and mutations stay profile-local', async () => {
  const root = new URL('../..', import.meta.url);
  const pack = await loadSkillPack(root);
  const profiles = await loadEntrypointProfiles(root);
  const cases = [{
    id: 'parallel-dispatch-direct',
    prompt: 'split this approved plan into parallel agents',
    expectedSkill: 'sdcorejs-parallel-dispatch'
  }];
  const mutated = structuredClone(profiles);
  mutated.codex.text = mutated.codex.text.replaceAll('sdcorejs-parallel-dispatch', 'removed-parallel-route');

  const results = runEntrypointPromptSmoke(pack, mutated, cases);
  assert.equal(results.find((item) => item.profile === 'codex').pass, false);
  for (const result of results.filter((item) => item.profile !== 'codex')) {
    assert.equal(result.pass, true, `${result.profile} should retain its own routing behavior`);
  }

  const contradictory = structuredClone(profiles);
  contradictory.codex.text += '\nUnapproved write requests may bypass planning and run in parallel.';
  const contradictionResults = runEntrypointPromptSmoke(pack, contradictory, [{
    id: 'parallel-unapproved-write',
    prompt: 'implement this feature in parallel',
    expectedSkill: 'sdcorejs-brainstorming'
  }]);
  assert.equal(contradictionResults.find((item) => item.profile === 'codex').pass, false);
  assert.equal(contradictionResults.find((item) => item.profile === 'claude-code').pass, true);

  const priorityConflict = structuredClone(profiles);
  priorityConflict.codex.text += '\nFor an approved plan, always use sdcorejs-execute-plan; do not use sdcorejs-parallel-dispatch directly.';
  const priorityResults = runEntrypointPromptSmoke(pack, priorityConflict, cases);
  assert.equal(priorityResults.find((item) => item.profile === 'codex').pass, false);
  assert.equal(priorityResults.find((item) => item.profile === 'cursor').pass, true);
});

test('phase 3: routing context distinguishes execution, direct split, planning, and read-only fan-out', async () => {
  const profiles = await loadEntrypointProfiles(new URL('../..', import.meta.url));
  for (const [name, profile] of Object.entries(profiles)) {
    const context = deriveEntrypointRoutingContext(profile);
    assert.equal(context.approvedPlanExecution, true, `${name} approved-plan execution guidance`);
    assert.equal(context.directParallelDispatch, true, `${name} direct split guidance`);
    assert.equal(context.requiresApprovedPlanForWrites, true, `${name} planning gate`);
    assert.equal(context.readOnlyParallel, true, `${name} read-only parallel guidance`);
  }
});

test('phase 3: every entrypoint advertises the first-class AI-agent boundary', async () => {
  const profiles = await loadEntrypointProfiles(new URL('../..', import.meta.url));
  for (const [name, profile] of Object.entries(profiles)) {
    assert.match(profile.text, /sdcorejs-ai-agent/, `${name} exposes the executor`);
    assert.match(profile.text, /ai-agent/i, `${name} exposes the track`);
    assert.match(profile.text, /under-specified|unresolved|brainstorming/i, `${name} preserves discovery`);
    assert.match(profile.text, /test.*review.*debug|review.*debug.*test/is, `${name} preserves dedicated owners`);
  }
});

test('phase 3: every entrypoint advertises the bounded simplify utility boundary', async () => {
  const profiles = await loadEntrypointProfiles(new URL('../..', import.meta.url));
  for (const [name, profile] of Object.entries(profiles)) {
    assert.match(profile.text, /sdcorejs-simplify/, `${name} exposes the utility`);
    assert.match(profile.text, /behavior-preserving|preserv(?:e|ing) behavior/i, `${name} preserves behavior`);
    assert.match(profile.text, /current diff|changed source|explicit.*scope/i, `${name} exposes bounded scope`);
    assert.match(profile.text, /utility|not a track/i, `${name} keeps simplify outside tracks`);
  }
});

async function loadPromptEvals() {
  const file = new URL('./fixtures/prompt-evals.json', import.meta.url);
  return JSON.parse(await readFile(file, 'utf8'));
}
