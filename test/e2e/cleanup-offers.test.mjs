import assert from 'node:assert/strict';
import test from 'node:test';
import {
  coordinateCleanupOffer, createCleanupOfferState, normalizeCleanupSignal, resolveCleanupOffer,
} from '../../_refs/cleanup/offer-policy.mjs';
import { buildExploreCleanupSignals } from '../../_refs/shared/explore-contract.mjs';

const fingerprint = `sha256:v1:${'a'.repeat(64)}`;
function signal(overrides = {}) {
  return {
    source: 'sdcorejs-explore', significant: true,
    scope: { repository_id: 'github.com/acme/app', paths: ['test-results'] },
    category: 'diagnostics',
    evidence: [{ kind: 'producer-finished', confirmed: true, paths: ['test-results/trace.zip'], detail: 'Finished passing task produced reproducible diagnostics; review no longer needs them.' }],
    observed_state: { fingerprint }, unknowns: ['Ownership needs cleanup analysis.'],
    reason_to_offer: 'Substantial completed diagnostic output remains after the task.',
    ...overrides,
  };
}
const state = () => createCleanupOfferState({ scope_id: 'active-runtime-thread' });
const coordinate = (overrides = {}) => coordinateCleanupOffer({
  signals: [signal()], state: state(), boundary: { phase: 'after-primary-result' }, ...overrides,
});

test('explore emits bounded significant signals without deletion authority or writes', () => {
  const input = signal({ safe_to_delete: true, source: 'sdcorejs-review' });
  const [result] = buildExploreCleanupSignals([input]);
  assert.equal(result.source, 'sdcorejs-explore');
  assert.equal(Object.hasOwn(result, 'safe_to_delete'), false);
  assert.equal(Object.hasOwn(result, 'writes'), false);
  assert.deepEqual(result.scope.paths, ['test-results']);
  assert.equal(input.safe_to_delete, true);
});

test('old names, mtime, no grep match, and weak observations never trigger an offer', () => {
  for (const kind of ['old', 'mtime', 'tmp-name', 'no-grep-match', 'gitignored']) {
    const weak = signal({ evidence: [{ kind, confirmed: true, paths: ['test-results'], detail: kind }] });
    assert.equal(normalizeCleanupSignal(weak), null);
    assert.equal(coordinate({ signals: [weak] }).status, 'suppressed');
  }
  assert.equal(coordinate({ signals: [signal({ significant: false })] }).status, 'suppressed');
});

test('unknown producers, malformed scope and out-of-scope evidence fail closed', () => {
  for (const malformed of [
    signal({ source: 'untrusted-worker' }),
    signal({ scope: { repository_id: 'repo', paths: ['../outside'] } }),
    signal({ scope: { repository_id: 'repo', paths: ['test-results/*'] } }),
    signal({ evidence: [{ kind: 'producer-finished', confirmed: false, paths: ['test-results'], detail: 'unknown' }] }),
    signal({ evidence: [{ kind: 'producer-finished', confirmed: true, paths: ['src/private'], detail: 'outside scope' }] }),
  ]) assert.equal(coordinate({ signals: [malformed] }).status, 'suppressed');
});

test('native text picker is preferred and unknown support preserves numbered fallback', () => {
  const native = coordinate({ capabilities: { native_structured_choice: 'supported' } });
  assert.equal(native.offer.interaction.kind, 'native-structured-choice');
  assert.match(native.offer.interaction.fallback_markdown, /1\..*2\..*3\./su);
  const fallback = coordinate({ capabilities: { native_structured_choice: 'unknown' } });
  assert.equal(fallback.offer.interaction.kind, 'markdown-numbered-choice');
});

test('parallel findings are deduplicated once by the fan-in owner', () => {
  const signals = [signal(), signal({ source: 'sdcorejs-review' }), signal({ source: 'sdcorejs-test' })];
  assert.equal(coordinate({ signals, worker_role: 'parallel-worker' }).status, 'findings-only');
  assert.equal(coordinate({ signals, worker_role: 'unknown-owner' }).status, 'findings-only');
  const fanIn = coordinate({ signals, worker_role: 'fan-in-owner' });
  assert.equal(fanIn.offer.findings.length, 1);
  assert.equal(fanIn.offer.finding_ids.length, 1);
  assert.deepEqual(fanIn.offer.source_skills, ['sdcorejs-explore', 'sdcorejs-review', 'sdcorejs-test']);
  assert.equal(coordinate({ state: fanIn.state, signals: [signal({ category: 'preview' })] }).status, 'pending');
});

test('related findings are grouped without expanding into another repository', () => {
  const related = signal({ scope: { repository_id: 'github.com/acme/app', paths: ['previews'] },
    evidence: [{ kind: 'reproducible-output', confirmed: true, paths: ['previews/render.html'], detail: 'Intermediate export from completed task.' }] });
  const other = signal({ scope: { repository_id: 'github.com/other/repo', paths: ['test-results'] } });
  const result = coordinate({ signals: [related, signal(), other] });
  assert.deepEqual(result.offer.scope.paths, ['previews', 'test-results']);
  assert.equal(result.offer.findings.length, 2);
});

test('accepting analysis cannot approve mutation and does not modify caller state', () => {
  const offered = coordinate();
  const pending = structuredClone(offered.state);
  const accepted = resolveCleanupOffer({ state: offered.state, offer_id: offered.offer.offer_id, response: '1' });
  assert.equal(accepted.status, 'accepted');
  assert.equal(accepted.analysis_authority.action, 'analyze');
  assert.equal(accepted.analysis_authority.read_only, true);
  assert.equal(accepted.analysis_authority.mutation_allowed, false);
  assert.equal(accepted.mutation_allowed, false);
  assert.equal(accepted.state.pending, null);
  assert.deepEqual(offered.state, pending);
  assert.equal(coordinate({ state: accepted.state }).status, 'suppressed');
});

test('decline survives runtime handoff across sources and changed observations', () => {
  const offered = coordinate();
  const declined = resolveCleanupOffer({ state: offered.state, offer_id: offered.offer.offer_id, response: '2' });
  const handedOff = JSON.parse(JSON.stringify(declined.state));
  const changed = signal({ source: 'sdcorejs-documentation', observed_state: { fingerprint: 'new-observation' } });
  assert.equal(coordinate({ state: handedOff, signals: [changed] }).status, 'suppressed');
  assert.equal(declined.analysis_authority, null);
});

test('session disable applies to every workflow source', () => {
  const offered = coordinate();
  const disabled = resolveCleanupOffer({ state: offered.state, offer_id: offered.offer.offer_id, response: '3' });
  assert.equal(disabled.status, 'disabled');
  for (const source of ['sdcorejs-explore', 'sdcorejs-test', 'sdcorejs-review', 'sdcorejs-design', 'sdcorejs-documentation']) {
    assert.equal(coordinate({ state: disabled.state, signals: [signal({ source, category: source })] }).status, 'suppressed');
  }
});

test('stale and ambiguous choices keep the pending offer and never authorize analysis', () => {
  const offered = coordinate();
  for (const [offerId, response, status] of [
    ['different-offer', '1', 'stale'],
    [offered.offer.offer_id, '1 or 3', 'ambiguous'],
    [offered.offer.offer_id, 'sure, clean it', 'ambiguous'],
  ]) {
    const result = resolveCleanupOffer({ state: offered.state, offer_id: offerId, response });
    assert.equal(result.status, status);
    assert.equal(result.analysis_authority, null);
    assert.deepEqual(result.state.pending, offered.state.pending);
  }
});

test('cleanup does not interrupt root-cause work or unrelated implementation', () => {
  for (const boundary of [
    { phase: 'debug-root-cause' },
    { phase: 'during-primary-work' },
    { phase: 'before-final-readiness', task_related: false },
    { phase: 'debug-root-cause', disk_pressure_blocker: true },
  ]) assert.equal(coordinate({ boundary }).status, 'deferred');
  assert.equal(coordinate({ boundary: { phase: 'before-final-readiness', task_related: true } }).status, 'offered');
});

test('a concrete disk-pressure blocker can offer bounded analysis without implicit deletion', () => {
  const pressure = signal({ evidence: [{ kind: 'disk-pressure', confirmed: true,
    paths: ['test-results'], detail: 'Render needs 100 bytes and only 10 are available.', bytes_required: 100, bytes_available: 10 }] });
  const result = coordinate({ signals: [pressure], boundary: { phase: 'debug-root-cause', disk_pressure_blocker: true } });
  assert.equal(result.status, 'offered');
  assert.equal(result.offer.mutation_allowed, false);
});

test('runtime suppression cannot be silently reset by a malformed handoff', () => {
  assert.throws(() => coordinate({ state: { schema_version: 1, disabled: false } }), /runtime handoff/u);
  assert.throws(() => createCleanupOfferState(), /scope_id/u);
});
