import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  evaluateVisualOffer, recordVisualResponse, recordVisualConsent,
  shouldOfferVisual, selectInteraction, resolveVisualCompanionPlan,
  projectRuntimeContext, CONSUMER_REQUIRED_FIELDS, CONSUMER_REQUIRED_FIELD_KINDS,
} from '../../_refs/harness/runtime-policy.mjs';
import { attestRuntimeCapabilities, validateRuntimeAttestation } from '../../_refs/harness/runtime-attestation.mjs';

const caps = { native_structured_choice: 'supported', visual_surface: 'supported',
  static_html_artifact: 'supported', live_visual_companion: 'supported',
  persistent_local_process: 'supported', visual_event_bridge: 'supported', browser_auto_open: 'unknown' };
const decision = (overrides = {}) => ({ session_id: 's1', visual_thread_id: 'navigation',
  decision_id: 'D-001', purpose_id: 'layout-comparison', open: true,
  requires_user_choice: true, options: ['Nested sidebar', 'Section navigation'],
  material_tradeoff: true, visual_benefit: true,
  reason: 'Compare hierarchy and the space needed for three navigation levels.', ...overrides });

test('case-visual-offer-ac-001-policy: a grounded open comparison offers once and keeps identity', () => {
  const first = evaluateVisualOffer({ decision: decision(), capabilities: caps });
  assert.equal(first.action, 'offer');
  assert.equal(first.context.decisions[0].status, 'pending');
  assert.equal(first.context.decisions[0].decision_id, 'D-001');
  assert.equal(evaluateVisualOffer({ decision: decision(), capabilities: caps, context: first.context }).action, 'wait');
  assert.equal(shouldOfferVisual({ visual_spatial: true }), false, 'a supplied flag is not recognition evidence');
});

test('case-visual-offer-ac-002-policy: mobile selection and actions use the same semantic assessment', () => {
  const d = decision({ options: ['Selection in header', 'Selection next to action'], reason: 'Placement changes reach and accidental activation on mobile cards.' });
  assert.equal(shouldOfferVisual({ decision: d, capabilities: caps }), true);
});

test('case-visual-offer-ac-004-policy: direct requests and accepted or pending responses never re-offer', () => {
  const direct = evaluateVisualOffer({ decision: decision({ explicit_visual_request: true }), capabilities: caps });
  assert.equal(direct.action, 'present');
  assert.equal(direct.surface.mode, 'native');
  assert.equal(direct.surface.local_runtime_writes, false);
  const accepted = recordVisualResponse({ decision: decision(), response: 'accepted' });
  assert.equal(evaluateVisualOffer({ decision: decision(), context: accepted, capabilities: caps }).action, 'present');
  const pending = evaluateVisualOffer({ decision: decision(), capabilities: caps }).context;
  assert.equal(evaluateVisualOffer({ decision: decision({ decision_id: 'D-002' }), context: pending, capabilities: caps }).action, 'wait');
});

test('case-visual-offer-ac-005-policy: fixed, delegated, nonvisual and fake choices do not offer', () => {
  for (const change of [{ open: false }, { approved: true }, { delegated: true },
    { requires_user_choice: false }, { options: ['Only choice'] }, { options: ['A', 'A'] },
    { material_tradeoff: false }, { visual_benefit: false }, { reason: '' }, { decision_id: '' }]) {
    const result = evaluateVisualOffer({ decision: decision(change), capabilities: caps });
    assert.equal(result.action, 'continue-text', JSON.stringify(change));
    assert.ok(result.reason);
  }
  const result = evaluateVisualOffer({ decision: decision({ open: false }), capabilities: caps });
  assert.equal(result.context.decisions[0].status, 'not-applicable');
  assert.equal(evaluateVisualOffer({ capabilities: caps }).status, 'not-evaluated');
});

test('case-visual-offer-ac-006-policy: approval stays text and an approved layout is not reopened', () => {
  assert.equal(evaluateVisualOffer({ decision: decision({ approved: true }), capabilities: caps }).action, 'continue-text');
  assert.equal(selectInteraction({ capabilities: caps, options: ['Approve', 'Change'], visual_spatial: true, approval: true }).kind, 'native-structured-choice');
});

test('case-visual-offer-ac-007-policy: assessment can become eligible after factual blockers resolve', () => {
  const earlier = evaluateVisualOffer({ decision: decision({ material_tradeoff: false }), capabilities: caps });
  const later = evaluateVisualOffer({ decision: decision(), capabilities: caps, context: earlier.context });
  assert.equal(earlier.action, 'continue-text');
  assert.equal(later.action, 'offer');
});

test('case-visual-offer-ac-008-policy: scoped decline survives new decisions, skills and phases', () => {
  const declined = recordVisualResponse({ decision: decision(), response: 'declined' });
  const copied = JSON.parse(JSON.stringify(declined));
  assert.equal(evaluateVisualOffer({ decision: decision({ decision_id: 'D-002', skill: 'sdcorejs-design', new_visual_decision: true }), capabilities: caps, context: copied }).action, 'continue-text');
  assert.equal(evaluateVisualOffer({ decision: decision({ visual_thread_id: 'different' }), capabilities: caps, context: copied }).action, 'offer');
  const session = recordVisualResponse({ decision: decision(), response: 'declined', scope: 'session' });
  assert.equal(evaluateVisualOffer({ decision: decision({ visual_thread_id: 'different' }), capabilities: caps, context: session }).action, 'continue-text');
});

test('case-visual-offer-ac-009-policy: explicit narrow re-enable leaves the wider decline intact', () => {
  const session = recordVisualResponse({ decision: decision(), response: 'declined', scope: 'session' });
  const reopened = recordVisualResponse({ context: session, decision: decision(), response: 'accepted', scope: 'decision' });
  assert.equal(evaluateVisualOffer({ decision: decision(), capabilities: caps, context: reopened }).action, 'present');
  assert.equal(evaluateVisualOffer({ decision: decision({ decision_id: 'D-002' }), capabilities: caps, context: reopened }).action, 'continue-text');
  const direct = evaluateVisualOffer({ decision: decision({ explicit_visual_request: true }), capabilities: caps, context: session });
  assert.equal(direct.action, 'present');
  assert.equal(direct.surface.auto_open, false);
});

test('a replayed preview request preserves a later decline across handoffs', () => {
  const request = decision({ explicit_visual_request: true });
  for (const scope of ['decision', 'visual-thread', 'session']) {
    for (const localRuntime of [false, true]) {
      let context = evaluateVisualOffer({ decision: request, capabilities: caps }).context;
      context = recordVisualConsent({ context, decision: request, kind: 'local_runtime_writes', granted: localRuntime });
      context = recordVisualResponse({ context, decision: request, response: 'declined', scope });
      const restored = JSON.parse(JSON.stringify(context));
      const replay = evaluateVisualOffer({ decision: request, context: restored, capabilities: caps });
      assert.equal(replay.action, 'continue-text', `${scope}, local runtime ${localRuntime}`);
      assert.equal(replay.status, 'declined');
      assert.equal(replay.surface, null, 'a declined preview must not select a live runtime');
      assert.deepEqual(replay.context.responses, restored.responses, 'assessment must not invent another user response');
      assert.deepEqual(replay.context.consents, restored.consents);
      const nextHandoff = evaluateVisualOffer({ decision: request, context: JSON.parse(JSON.stringify(replay.context)), capabilities: caps });
      assert.equal(nextHandoff.action, 'continue-text');

      const enabled = recordVisualResponse({ context: nextHandoff.context, decision: request, response: 'accepted', scope: 'decision' });
      const preview = evaluateVisualOffer({ decision: request, context: enabled, capabilities: caps });
      assert.equal(preview.action, 'present', 'a new explicit conversation request can re-enable the same decision');
      assert.equal(preview.surface.mode, localRuntime ? 'live' : 'native');
      if (scope !== 'decision') {
        assert.equal(evaluateVisualOffer({ decision: decision({ decision_id: 'D-002' }), context: preview.context, capabilities: caps }).status, 'declined');
      }
    }
  }
});

test('a fresh conversation request can accept a pending invitation without replaying the seed flag', () => {
  const pending = evaluateVisualOffer({ decision: decision(), capabilities: caps });
  const request = decision({ explicit_visual_request: true });
  const replay = evaluateVisualOffer({ decision: request, context: pending.context, capabilities: caps });
  assert.equal(replay.action, 'wait', 'an assessed decision needs an explicit response event');
  const accepted = recordVisualResponse({ context: pending.context, decision: request, response: 'accepted', scope: 'decision' });
  const result = evaluateVisualOffer({ decision: request, context: accepted, capabilities: caps });
  assert.equal(result.action, 'present');
  assert.deepEqual(result.context.responses, accepted.responses);
});

test('case-visual-offer-ac-010-policy: surface selection shares one consent-aware visual ladder', () => {
  assert.equal(selectInteraction({ capabilities: caps, options: ['A', 'B'], visual_spatial: true }).kind, 'typed-visual-screen');
  assert.equal(resolveVisualCompanionPlan({ capabilities: caps }).mode, 'native');
  const context = recordVisualConsent({ decision: decision(), kind: 'local_runtime_writes', granted: true });
  const result = evaluateVisualOffer({ decision: decision({ explicit_visual_request: true }), context, capabilities: caps });
  assert.equal(result.surface.mode, 'live');
  assert.equal(result.surface.auto_open, false);
  assert.equal(result.surface.supporting_feedback_only, true);
  assert.equal(evaluateVisualOffer({ decision: decision({ purpose_id: 'another-purpose', explicit_visual_request: true }), context, capabilities: caps }).surface.mode, 'native');
});

test('case-visual-offer-ac-011-policy: failures degrade in order without losing options or treating unknown as support', () => {
  const input = { capabilities: caps, options: ['A', 'B'], visual_spatial: true, consent: { local_runtime_writes: true } };
  const kinds = ['live-visual-companion', 'typed-visual-screen', 'static-visual-composer', 'markdown-numbered-choice'];
  for (let i = 0; i < kinds.length; i++) {
    const result = selectInteraction({ ...input, failed_surfaces: kinds.slice(0, i) });
    assert.equal(result.kind, kinds[i]);
    assert.equal(result.fallback_markdown, '1. A\n2. B');
  }
  assert.equal(evaluateVisualOffer({ decision: decision(), capabilities: { native_structured_choice: 'supported' } }).action, 'continue-text');
  assert.equal(resolveVisualCompanionPlan({ capabilities: { ...caps, visual_surface: 'unknown', static_html_artifact: 'unknown' } }).consent_required[0], 'local_runtime_writes');
});

test('case-visual-offer-ac-012-policy: browser feedback cannot grant preference or permission', () => {
  assert.throws(() => recordVisualResponse({ decision: decision(), response: 'accepted', source: 'supporting-feedback' }), /conversation/);
  assert.throws(() => recordVisualConsent({ decision: decision(), kind: 'browser_open', granted: true, source: 'supporting-feedback' }), /conversation/);
  let context = recordVisualConsent({ decision: decision(), kind: 'local_runtime_writes', granted: true });
  context = recordVisualConsent({ context, decision: decision(), kind: 'browser_open', granted: true });
  const result = evaluateVisualOffer({ decision: decision({ explicit_visual_request: true }), context, capabilities: { ...caps, browser_auto_open: 'supported' } });
  assert.equal(result.surface.auto_open, true);
  assert.equal(result.context.approved, undefined);
});

test('case-visual-offer-ac-013-policy: serialization preserves scoped state and rejects malformed records', () => {
  const context = recordVisualResponse({ decision: decision(), response: 'accepted' });
  assert.deepEqual(evaluateVisualOffer({ decision: decision(), context, capabilities: caps }), evaluateVisualOffer({ decision: decision(), context: JSON.parse(JSON.stringify(context)), capabilities: caps }));
  assert.equal(evaluateVisualOffer({ decision: decision(), context: { offered: true, selected: true }, capabilities: caps }).action, 'wait', 'legacy offered state cannot cause a repeat invitation');
  assert.throws(() => recordVisualResponse({ decision: decision(), response: 'approved' }), /response/);
  assert.throws(() => recordVisualConsent({ decision: decision({ purpose_id: '' }), kind: 'browser_open', granted: true }), /purpose/);
});

test('visual attestation is optional, evidence-backed, and cannot change delegation capability', () => {
  const base = attestRuntimeCapabilities({ adapter: 'codex' });
  assert.equal(base.visual, undefined);
  const observed = attestRuntimeCapabilities({ adapter: 'codex', visual_observations: {
    visual_surface: { status: 'supported', evidence: { source: 'runtime tool inventory', detail: 'A native visual tool is callable.' } },
  } });
  assert.equal(observed.visual.capabilities.visual_surface, 'supported');
  assert.equal(observed.visual.capabilities.browser_auto_open, 'unknown');
  assert.deepEqual(validateRuntimeAttestation(observed), []);
  const forged = structuredClone(observed); forged.visual.observations = [];
  assert.ok(validateRuntimeAttestation(forged).length);
  assert.throws(() => attestRuntimeCapabilities({ adapter: 'codex', visual_observations: { visual_surface: { status: 'supported' } } }), /evidence/);
});

test('scoped consent and fallback survive serialization without leaking between sessions', () => {
  let context = recordVisualConsent({ decision: decision(), kind: 'local_runtime_writes', granted: true });
  context = recordVisualResponse({ context, decision: decision(), response: 'accepted' });
  const fallback = evaluateVisualOffer({ decision: decision(), context, capabilities: caps, failed_surfaces: ['live-visual-companion'] });
  assert.equal(fallback.surface.mode, 'native');
  assert.equal(evaluateVisualOffer({ decision: decision(), context: JSON.parse(JSON.stringify(fallback.context)), capabilities: caps }).surface.mode, 'native');
  assert.equal(evaluateVisualOffer({ decision: decision({ session_id: 's2' }), context, capabilities: caps }).action, 'offer');
  const denied = recordVisualConsent({ context, decision: decision(), kind: 'local_runtime_writes', granted: false });
  const onlyLive = { live_visual_companion: 'supported', persistent_local_process: 'supported' };
  const result = evaluateVisualOffer({ decision: decision(), context: denied, capabilities: onlyLive });
  assert.equal(result.action, 'continue-text');
  assert.deepEqual(result.surface.consent_required, []);
  assert.equal(result.surface.local_runtime_writes, false);
  assert.throws(() => evaluateVisualOffer({ decision: decision(), context: { decisions: [{}] } }), /identity/);
});

test('an accepted preview with only live support requests just the missing runtime consent', () => {
  const onlyLive = { live_visual_companion: 'supported', persistent_local_process: 'supported' };
  const request = decision({ explicit_visual_request: true });
  const result = evaluateVisualOffer({ decision: request, capabilities: onlyLive });
  assert.equal(result.action, 'request-consent');
  assert.equal(result.status, 'accepted');
  assert.deepEqual(result.surface.consent_required, ['local_runtime_writes']);
  assert.equal(result.surface.auto_open, false);
  const granted = recordVisualConsent({ context: result.context, decision: request, kind: 'local_runtime_writes', granted: true });
  assert.equal(evaluateVisualOffer({ decision: decision(), context: granted, capabilities: onlyLive }).action, 'present');
  const denied = recordVisualConsent({ context: result.context, decision: request, kind: 'local_runtime_writes', granted: false });
  assert.equal(evaluateVisualOffer({ decision: decision(), context: denied, capabilities: onlyLive }).action, 'continue-text');
});

test('portable context.pass preserves decline through the existing state_delta envelope', () => {
  const requirement = {};
  for (const field of CONSUMER_REQUIRED_FIELDS.requirement_context['sdcorejs-spec']) {
    const parts = field.split('.');
    let target = requirement;
    for (const part of parts.slice(0, -1)) target = target[part] ??= {};
    const kind = CONSUMER_REQUIRED_FIELD_KINDS.requirement_context[field];
    target[parts.at(-1)] = kind === 'array' ? [] : kind === 'object' ? { fixture: true } : kind === 'boolean' ? false : 'fixture';
  }
  const declined = recordVisualResponse({ decision: decision(), response: 'declined' });
  requirement.in_scope = ['Compare sidebar navigation'];
  requirement.visual_companion = declined;
  const passed = projectRuntimeContext({ contextType: 'requirement_context', context: requirement,
    consumer: 'sdcorejs-spec', capabilityStatus: 'unknown', stateDelta: { visual_companion: declined } });
  assert.equal(passed.portable_handoff.authoritative.visual_companion, undefined, 'optional fields are not in the required projection');
  const restored = JSON.parse(JSON.stringify(passed.portable_handoff)).state_delta.visual_companion;
  assert.deepEqual(restored, declined);
  assert.equal(evaluateVisualOffer({ decision: decision({ decision_id: 'D-002' }), context: restored, capabilities: caps }).action, 'continue-text');
  assert.deepEqual(passed.authoritative_context.visual_companion, declined);
});

test('case-visual-offer-ac-003-policy: direct Design and other consumers load the one offer policy', async () => {
  const sources = ['skills/shared/sdlc/01-brainstorming.md', 'skills/tracks/design/sdcorejs-design.md',
    'skills/orchestration/using-skills.md', '_refs/shared/user-choice-prompt.md', '_refs/shared/runtime-protocols.md'];
  for (const file of sources) assert.match(await readFile(file, 'utf8'), /visual-offer-policy\.md/, file);
  for (const file of ['skills/tracks/angular/sdcorejs-angular.md', 'skills/tracks/nextjs/sdcorejs-nextjs.md', 'skills/shared/sdlc/04-execute-plan.md']) {
    const source = await readFile(file, 'utf8'); assert.match(source, /visual_companion/); assert.match(source, /unresolved visual/i);
  }
  for (const file of ['skills/shared/sdlc/02-spec.md', 'skills/shared/sdlc/03-plan.md']) assert.match(await readFile(file, 'utf8'), /visual_companion/);
});

test('case-visual-offer-ac-015-policy: shared guide removes conflicting invitations and keeps runtime JIT', async () => {
  const offer = await readFile('_refs/sdlc/visual-offer-policy.md', 'utf8');
  assert.ok(offer.split('\n').length <= 160, 'the offer policy must remain small');
  for (const file of ['_refs/shared/user-choice-prompt.md', '_refs/sdlc/visual-companion.md', 'skills/shared/sdlc/01-brainstorming.md']) {
    const source = await readFile(file, 'utf8');
    assert.doesNotMatch(source, /unless a (?:genuinely )?new (?:and materially|visual)|text \+ TDD/);
  }
});
