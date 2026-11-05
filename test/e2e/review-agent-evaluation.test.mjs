import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { evidenceHash, validateFreshRun, validateScenarioDataset } from '../../authoring/evals/review-behavior/evidence-contract.mjs';
import { buildReviewScenarioInput } from './support/skill-pack-runner.mjs';
const root = new URL('../../', import.meta.url);
const dataset = JSON.parse(await readFile(new URL('authoring/evals/review-behavior/scenarios.json', root), 'utf8'));

test('scenario input projection keeps oracle out and rejects fixture traversal', async () => {
  assert.equal(validateScenarioDataset(dataset).valid, true);
  for (const scenario of dataset.scenarios) {
    const input = await buildReviewScenarioInput(root, { ...scenario, expected_findings: 'DO NOT LEAK' });
    assert.deepEqual(Object.keys(input).sort(), ['prompt', 'scenario_id', 'source', 'target_symbol']);
    assert.equal(JSON.stringify(input).includes('DO NOT LEAK'), false);
    assert.equal(input.source.content.length > 0, true);
  }
  await assert.rejects(buildReviewScenarioInput(root, { source: '../scenarios.json' }), /invalid/);
  const duplicate = structuredClone(dataset); duplicate.scenarios.push(duplicate.scenarios[0]);
  assert.equal(validateScenarioDataset(duplicate).valid, false);
});
test('NOT RUN templates and self-asserted capture cannot become semantic evidence', async () => {
  const template = JSON.parse(await readFile(new URL('authoring/evals/review-behavior/fresh-run-template.json', root), 'utf8'));
  assert.equal(validateFreshRun(template).status, 'NOT RUN');
  assert.equal(validateFreshRun({ ...template, status: 'COMPLETED', host_captured: true }).valid, false);
});
test('trusted capture binding rejects stale inputs and transcript tampering; accuracy stays separate', () => {
  // Synthetic contract-test record only. This test never creates a live run receipt.
  const record = { schema_version: 1, evidence_layer: 'fresh-reviewer', status: 'COMPLETED', scenario_id: 'RB-001', runtime: 'test-host', model: 'test-model', captured_at: '2026-01-01T00:00:00Z', original_prompt: 'fixture prompt', transcript: 'fixture output', transcript_ref: 'test-only', pack_manifest_hash: 'a'.repeat(64), fixture_manifest_hash: 'b'.repeat(64), input_manifest_hash: 'c'.repeat(64), transcript_hash: evidenceHash('fixture output'), oracle_exposed: false, synthetic: false };
  const expected = structuredClone(record), trustedFixtureVerifier = value => value.transcript_hash === evidenceHash('fixture output');
  assert.equal(validateFreshRun(record, { expected }).valid, false);
  const result = validateFreshRun(record, { expected, verify_capture: trustedFixtureVerifier });
  assert.equal(result.valid, true); assert.equal(result.semantic_acceptance, false);
  for (const change of [{ transcript: 'forged output' }, { pack_manifest_hash: 'd'.repeat(64) }, { oracle_exposed: true }, { synthetic: true }, { model: null }, { input_manifest_hash: null }]) {
    assert.equal(validateFreshRun({ ...record, ...change }, { expected, verify_capture: trustedFixtureVerifier }).valid, false);
  }
});
