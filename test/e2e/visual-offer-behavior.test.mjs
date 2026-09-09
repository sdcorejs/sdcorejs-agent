import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { digest, validateScenarios, buildPrompt, runScenario, parseCliTurn, validateRecord, summarizeRecord } from './support/visual-offer-eval-runner.mjs';
const fixture = JSON.parse(await readFile(new URL('./fixtures/visual-offer-scenarios.json', import.meta.url), 'utf8'));

test('case-visual-offer-eval-runner-integrity: natural-language scenarios cover the requested behavior and negative controls', () => {
  assert.deepEqual(validateScenarios(fixture), []);
  for (const id of ['sidebar','mobile-cards','direct-design','requested-mockups','fixed-rename','fixed-spacing','approved-layout','mixed-business','decline-handoff','reenable','native-and-visual','runtime-failure','click-not-approval','delegated-choice','keyword-only','text-only-runtime']) assert.ok(fixture.scenarios.some(s => s.id === id));
  const bad = structuredClone(fixture); bad.scenarios[0].turns[0].assistant = 'fabricated';
  assert.ok(validateScenarios(bad).length);
});

test('the agent prompt excludes expected labels and semantic flags while preserving actual history', async () => {
  const scenario = { ...fixture.scenarios[0], expected: 'EVALUATOR_SECRET', visual_spatial: true };
  const history = [{ role: 'user', content: 'Earlier real user turn' }, { role: 'assistant', content: 'Earlier captured answer' }];
  const prompt = await buildPrompt({ sourceRoot: process.cwd(), fixture, scenario, history, user: scenario.turns[0].user });
  assert.doesNotMatch(prompt, /EVALUATOR_SECRET|"expected"\s*:|"visual_spatial"\s*:/);
  assert.match(prompt, /Earlier captured answer/);
  assert.ok(prompt.endsWith(scenario.turns[0].user));
});

test('the multi-turn driver consumes actual output and leaves offer recognition to semantic review', async () => {
  // These are explicitly synthetic adapter fixtures, never stored as live transcripts.
  const seen = [];
  const invoke = async args => {
    seen.push(args.prompt);
    return { exit_code: 0, interrupted: null, duration_ms: 1, stdout: [
      { type: 'thread.started', thread_id: 'synthetic-adapter-fixture' },
      { type: 'item.completed', item: { type: 'agent_message', text: seen.length === 1 ? 'Would you like two mockups?' : 'Continuing in text.' } },
      { type: 'turn.completed', usage: { input_tokens: 1, output_tokens: 1 } },
    ].map(JSON.stringify).join('\n') };
  };
  const scenario = fixture.scenarios.find(s => s.id === 'decline-handoff');
  const result = await runScenario({ sourceRoot: process.cwd(), fixture, scenario, invoke });
  assert.equal(result.status, 'REVIEW REQUIRED');
  assert.match(seen[1], /Would you like two mockups/);
  assert.equal(result.turns[0].adjudication, null);
  const incomplete = await runScenario({ sourceRoot: process.cwd(), fixture, scenario, invoke: async () => ({ exit_code: 1, stdout: '', interrupted: 'timeout', duration_ms: 1 }) });
  assert.equal(incomplete.status, 'NOT RUN');
  assert.equal(incomplete.turns[0].assistant, null);
  const continued = await runScenario({ sourceRoot: process.cwd(), fixture, scenario, invoke, prior_turns: [result.turns[0]] });
  assert.deepEqual(continued.turns[0], result.turns[0]);
  assert.equal(continued.turns.length, 2);
  assert.equal(continued.turns[1].requires_prior_offer, true);
  assert.match(seen.at(-1), /Would you like two mockups/);
  await assert.rejects(runScenario({ sourceRoot: process.cwd(), fixture, scenario, invoke, prior_turns: [incomplete.turns[0]] }), /completed actual/);
});

test('summary keeps unrun opportunities in denominators and refuses fabricated completion', () => {
  const record = { schema_version: 1, fixture_hash: digest(fixture), source_manifest: { entries: [], sha256: digest([]) }, scenarios: fixture.scenarios.map(s => ({ scenario_id: s.id, status: 'NOT RUN', reason: 'Synthetic test: provider intentionally unavailable.', turns: [] })) };
  const result = summarizeRecord(record, fixture);
  assert.equal(result.complete_live_coverage, false);
  assert.ok(result.metrics.correct_offer.denominator > 0);
  assert.equal(result.metrics.correct_offer.reviewed, 0);
  assert.equal(result.metrics.correct_offer.rate, null);
  const fake = structuredClone(record); fake.scenarios[0].status = 'REVIEW REQUIRED';
  assert.ok(validateRecord(fake, fixture).length);
  const missing = structuredClone(record); missing.scenarios.pop();
  assert.ok(validateRecord(missing, fixture).length);
});

test('exit zero and text alone cannot masquerade as a completed provider turn', () => {
  assert.equal(parseCliTurn({ exit_code: 0, stdout: 'a plausible answer' }).completed, false);
  assert.equal(parseCliTurn({ exit_code: 0, stdout: JSON.stringify({ type: 'item.completed', item: { type: 'agent_message', text: 'yes' } }) }).completed, false);
});

test('semantic review rejects contradictory scores and incomplete preview evidence', () => {
  const record = { schema_version: 1, fixture_hash: digest(fixture), source_manifest: { entries: [], sha256: digest([]) },
    scenarios: fixture.scenarios.map(s => ({ scenario_id: s.id, status: 'NOT RUN', reason: 'Synthetic validator fixture.', turns: [] })) };
  const turn = { turn_index: 0, user: fixture.scenarios[0].turns[0].user, assistant: 'Synthetic test response.',
    completed: true, exit_code: 0, interrupted: null, duration_ms: 1, session_id: 'synthetic-test', prompt_hash: digest('synthetic-test'),
    adjudication: { reviewer: 'synthetic-test', rationale: 'Validator control only.', correct_offer: true, missed_offer: true } };
  record.scenarios[0] = { scenario_id: 'sidebar', status: 'REVIEW REQUIRED', reason: 'Synthetic validator fixture.', turns: [turn] };
  assert.match(validateRecord(record, fixture).join(';'), /complementary/);
  turn.adjudication.missed_offer = false;
  assert.deepEqual(validateRecord(record, fixture), []);
  const result = summarizeRecord(record, fixture);
  assert.equal(result.metrics.correct_offer.reviewed, 1);
  assert.equal(result.metrics.correct_offer.rate, 1);
  assert.equal(result.metrics.preview_missing.rate, null);
  assert.equal(result.complete_live_coverage, false);
});
