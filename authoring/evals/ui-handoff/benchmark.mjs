import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { evaluateUiHandoffEvidence } from '../../../_refs/shared/validation-map.mjs';

const hash = value => 'sha256:v1:' + value.repeat(64);
const source = 'fixture://approved-design';
const current = { associated_HEAD_or_diff: 'diff:synthetic', config_fingerprint: hash('a'),
  environment_fingerprint: hash('b'), ui_handoff_sources: { [source]: hash('c') } };
const { ui_handoff_sources, ...freshness } = current;
const target = { id: 'case-row-expanded', screen: 'Test cases', route: '/test-cases', device: 'desktop',
  state: 'sidebar open and first row expanded', content_width_css_px: 960,
  checkpoints: [{ id: 'expand-icon', expected: 'inline' }, { id: 'details-visible', expected: true }] };
const { id, checkpoints, ...sample } = target;
const handoff = { source_ref: source, source_hash: hash('c'), targets: [target] };
const capture = { ...freshness, ...sample, target_id: id, source_hash: handoff.source_hash, kind: 'running-app',
  redactions_applied: true, evidence_ref: 'fixture://rendered/screen',
  observations: checkpoints.map(({ id, expected }) => ({ id, observed: expected })) };
const alternate = (patch) => ({ ...capture, ...patch });
const scenarios = [
  ['matches', [capture], null],
  ['historical-width', [alternate({ content_width_css_px: 720 }), capture], null],
  ['historical-config', [alternate({ config_fingerprint: hash('d') }), capture], null],
  ['icon-below-row', [alternate({ observations: [{ id: 'expand-icon', observed: 'below' }, capture.observations[1]] })], 'UI_HANDOFF_CHECKPOINT_MISMATCH'],
  ['collapsed', [alternate({ state: 'row collapsed' })], 'UI_HANDOFF_SAMPLE_MISMATCH'],
  ['wrong-width', [alternate({ content_width_css_px: 1200 })], 'UI_HANDOFF_SAMPLE_MISMATCH'],
  ['wrong-route', [alternate({ route: '/wrong' })], 'UI_HANDOFF_SAMPLE_MISMATCH'],
  ['wrong-device', [alternate({ device: 'mobile' })], 'UI_HANDOFF_SAMPLE_MISMATCH'],
  ['mockup-mislabeled-as-proof', [alternate({ kind: 'generated-mockup' })], 'UI_HANDOFF_SAMPLE_MISMATCH'],
  ['no-comparison', [], 'UI_HANDOFF_NOT_VERIFIED'],
  ['ambiguous-current-captures', [capture, capture], 'UI_HANDOFF_NOT_VERIFIED'],
  ['missing-checkpoint', [alternate({ observations: [capture.observations[0]] })], 'UI_HANDOFF_NOT_VERIFIED'],
  ['missing-evidence-ref', [alternate({ evidence_ref: '' })], 'UI_HANDOFF_NOT_VERIFIED'],
  ['redaction-unknown', [alternate({ redactions_applied: false })], 'UI_HANDOFF_NOT_VERIFIED'],
  ['stale-code', [alternate({ associated_HEAD_or_diff: 'diff:old' })], 'UI_HANDOFF_STALE'],
  ['stale-config', [alternate({ config_fingerprint: hash('d') })], 'UI_HANDOFF_STALE'],
  ['stale-environment', [alternate({ environment_fingerprint: hash('d') })], 'UI_HANDOFF_STALE'],
  ['stale-handoff', [alternate({ source_hash: hash('d') })], 'UI_HANDOFF_STALE'],
];
const assess = (comparisons) => evaluateUiHandoffEvidence({ handoff, comparisons, current });
const outcomes = scenarios.map(([id, records, blocker]) => {
  const result = assess(records);
  assert.equal(result.ready, blocker === null, id);
  assert.equal(result.blockers[0]?.code ?? null, blocker, id);
  return { id, click_passed: true, expected_ready: blocker === null, actual_ready: result.ready, blocker };
});

const repeat = 500;
for (let i = 0; i < 100; i++) for (const [, records] of scenarios) assess(records);
const batches = [];
let accepted = 0;
for (let i = 0; i < repeat; i++) {
  const started = performance.now();
  for (const [, records] of scenarios) accepted += Number(assess(records).ready);
  batches.push(performance.now() - started);
}
batches.sort((a, b) => a - b);
const positives = outcomes.filter(row => row.expected_ready).length;
assert.equal(accepted, positives * repeat);
console.log(JSON.stringify({
  scope: 'offline deterministic contract and synthetic comparisons',
  scenarios: outcomes,
  click_only_control: { correct: positives, false_ready: scenarios.length - positives },
  visual_gate: { correct: scenarios.length, false_ready: 0 },
  timing: { node: process.version, batches: repeat, cases_per_batch: scenarios.length,
    median_batch_ms: batches[Math.floor(repeat * 0.5)], p95_batch_ms: batches[Math.floor(repeat * 0.95)] },
}, null, 2));
