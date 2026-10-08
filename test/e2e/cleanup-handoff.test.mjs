import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPortableHandoff, projectRuntimeContext, validateRequiredHandoffFields } from '../../_refs/harness/runtime-policy.mjs';
import { coordinateCleanupOffer, createCleanupOfferState, resolveCleanupOffer } from '../../_refs/cleanup/offer-policy.mjs';

function context(extra = {}) {
  return { schema_version: 1, change_ref: 'fixture-change', source_spec: 'fixture-spec',
    source_plan: 'fixture-plan', required_with_change: [], shared_owned: [], conditional: [],
    local_only: [], unrelated_observed: [], ...extra };
}

function signal(source = 'sdcorejs-explore') {
  return { source, significant: true, scope: { repository_id: 'fixture-repo', paths: ['test-results'] },
    category: 'diagnostics', observed_state: { fingerprint: 'fixture-observation' }, unknowns: [],
    reason_to_offer: 'Substantial finished task diagnostics remain.',
    evidence: [{ kind: 'producer-finished', confirmed: true, paths: ['test-results/trace.zip'], detail: 'Fixture producer finished.' }],
  };
}

function offered() {
  return coordinateCleanupOffer({ state: createCleanupOfferState({ scope_id: 'same-runtime-session' }),
    signals: [signal()], boundary: { phase: 'after-primary-result' } });
}

test('portable handoff preserves optional exact cleanup state, signals and proof across existing consumers', () => {
  const shared = { cleanup_offer_state: { ...createCleanupOfferState({ scope_id: 'same-runtime-session' }), disabled: true },
    cleanup_signals: [signal()], cleanup: { receipts: [], current_snapshot: { fingerprint: 'fixture-state' }, evidence_refs: [] } };
  for (const consumer of ['sdcorejs-cleanup', 'sdcorejs-ship', 'sdcorejs-git']) {
    for (const capabilityStatus of ['supported', 'unsupported', 'unknown']) {
      const input = context(shared);
      const projected = projectRuntimeContext({ contextType: 'artifact_context', consumer,
        context: input, capabilityStatus, projection: { outcome: 'Fixture result.' } });
      const transported = projected.portable_handoff?.authoritative ?? projected.authoritative_context;
      for (const field of ['cleanup_offer_state', 'cleanup_signals', 'cleanup']) assert.deepEqual(transported[field], input[field]);
      assert.deepEqual(projected.user_projection, { outcome: 'Fixture result.' });
      transported.cleanup_offer_state.disabled = false;
      assert.equal(input.cleanup_offer_state.disabled, true);
    }
  }
});

test('cleanup consumes the existing artifact context contract without demanding absent cleanup fields', () => {
  const input = context();
  assert.deepEqual(validateRequiredHandoffFields({ contextType: 'artifact_context', consumer: 'sdcorejs-cleanup', context: input }), []);
  const handoff = buildPortableHandoff({ contextType: 'artifact_context', consumer: 'sdcorejs-cleanup', context: input });
  assert.deepEqual(handoff.authoritative, input);
  for (const field of ['cleanup_offer_state', 'cleanup_signals', 'cleanup']) assert.equal(Object.hasOwn(handoff.authoritative, field), false);
  const missing = context();
  delete missing.local_only;
  assert.throws(() => buildPortableHandoff({ contextType: 'artifact_context', consumer: 'sdcorejs-cleanup', context: missing }),
    (error) => error.code === 'ERR_INCOMPLETE_PORTABLE_HANDOFF');
});

test('session disable survives portable handoff and suppresses every workflow source', () => {
  const offer = offered();
  const disabled = resolveCleanupOffer({ state: offer.state, offer_id: offer.offer.offer_id, response: '3' });
  const handoff = projectRuntimeContext({ contextType: 'artifact_context', consumer: 'sdcorejs-cleanup',
    context: context({ cleanup_offer_state: disabled.state, cleanup_signals: [signal()] }), capabilityStatus: 'unknown' });
  const restored = JSON.parse(JSON.stringify(handoff.portable_handoff)).authoritative;
  for (const source of ['sdcorejs-explore', 'sdcorejs-test', 'sdcorejs-review', 'sdcorejs-design', 'sdcorejs-documentation']) {
    assert.equal(coordinateCleanupOffer({ state: restored.cleanup_offer_state,
      signals: [signal(source)], boundary: { phase: 'after-primary-result' } }).status, 'suppressed');
  }
});

test('shared cleanup runtime fields survive independent test-status handoffs to all existing consumers', () => {
  const shared = { cleanup_offer_state: { ...createCleanupOfferState({ scope_id: 'same-runtime-session' }), disabled: true },
    cleanup_signals: [signal('sdcorejs-test')], cleanup: { receipts: [] } };
  const status = { planning: 'planned', authoring: 'not-written', executability: 'ready', execution: 'not-run',
    result: 'unknown', evidence: 'absent', documentation: 'not-requested', blockers: [], ...shared };
  for (const consumer of ['sdcorejs-debug', 'sdcorejs-review', 'sdcorejs-simplify', 'sdcorejs-ship',
    'sdcorejs-documentation', 'sdcorejs-repair-loop', 'sdcorejs-git']) {
    const handoff = buildPortableHandoff({ contextType: 'test_status', context: status, consumer });
    for (const field of ['cleanup_offer_state', 'cleanup_signals', 'cleanup']) {
      assert.deepEqual(handoff.authoritative[field], status[field]);
    }
  }
});

test('declined findings and one unresolved offer retain their identities across portable handoffs', () => {
  const offer = offered();
  const pending = buildPortableHandoff({ contextType: 'artifact_context', consumer: 'sdcorejs-cleanup',
    context: context({ cleanup_offer_state: offer.state, cleanup_signals: [signal()] }) });
  assert.equal(coordinateCleanupOffer({ state: pending.authoritative.cleanup_offer_state,
    signals: [signal('sdcorejs-review')], boundary: { phase: 'after-primary-result' } }).status, 'pending');
  const declined = resolveCleanupOffer({ state: offer.state, offer_id: offer.offer.offer_id, response: '2' });
  const handoff = buildPortableHandoff({ contextType: 'artifact_context', consumer: 'sdcorejs-ship',
    context: context({ cleanup_offer_state: declined.state, cleanup_signals: [signal('sdcorejs-review')] }) });
  assert.equal(coordinateCleanupOffer({ state: handoff.authoritative.cleanup_offer_state,
    signals: handoff.authoritative.cleanup_signals, boundary: { phase: 'after-primary-result' } }).status, 'suppressed');
});

test('optional cleanup fields remain conditional, exact and bounded to their names', () => {
  const input = context({ cleanup: null, cleanup_signals: [], unrelated_private_context: { body: 'not a consumer field' } });
  const handoff = buildPortableHandoff({ contextType: 'artifact_context', consumer: 'sdcorejs-ship', context: input });
  assert.equal(handoff.authoritative.cleanup, null);
  assert.deepEqual(handoff.authoritative.cleanup_signals, []);
  assert.equal(Object.hasOwn(handoff.authoritative, 'unrelated_private_context'), false);
  for (const invalid of [{ cleanup_offer_state: false }, { cleanup_signals: {} }, { cleanup: [] }]) {
    assert.throws(() => projectRuntimeContext({ contextType: 'artifact_context', consumer: 'sdcorejs-ship',
      context: context(invalid), capabilityStatus: 'unknown' }), (error) => error.code === 'ERR_INCOMPLETE_RUNTIME_CONTEXT');
  }
});

test('portable cleanup metadata cannot bypass the embedded artifact body guard', () => {
  assert.throws(() => buildPortableHandoff({ contextType: 'artifact_context', consumer: 'sdcorejs-cleanup',
    context: context({ cleanup: { full_spec: 'Fixture full artifact body.' } }) }),
    (error) => error.code === 'ERR_EMBEDDED_ARTIFACT_BODY');
});
