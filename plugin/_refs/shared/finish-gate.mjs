import { decisionFingerprint, resolveDecision } from '../harness/runtime-policy.mjs';
import { realpathSync } from 'node:fs';
import { observeRepositoryRuntime, verifyRepositoryPhase, readRepositoryReview } from './repository-observation.mjs';
import { evaluateSimplifyConsumer } from '../simplify/simplify-contract.mjs';
import { findSimplifySession } from '../simplify/repository-evidence.mjs';

// Canonical phase owners; hooks use the owner declared in the approved policy.
const owners = Object.freeze({ baseline: 'sdcorejs-test', simplify: 'sdcorejs-simplify', reverify: 'sdcorejs-test',
  review: 'sdcorejs-review', 'unit-review-a': 'sdcorejs-review', 'unit-review-b': 'sdcorejs-review',
  repair: 'sdcorejs-repair-loop', verify: 'sdcorejs-ship', 'branch-ready': 'sdcorejs-ship' });
const result = (status, extra = {}) => ({ status, branch_ready: status === 'tail-complete', next_actions: [], blockers: [], ...extra });
const blocked = (...blockers) => result('blocked', { blockers });
const SIMPLIFY_OUTCOMES = new Set(['simplified', 'unchanged', 'reverted', 'analyzed']);

function matchesSimplifyOwner(context, observed) {
  try {
    return context?.artifact_identity?.owner_repository_id === observed.repository_id &&
      context.artifact_context?.change_ref === observed.change_ref && context.source_revision === observed.revision &&
      realpathSync.native(context.target_root) === observed.root && Array.isArray(context.scope?.requested) &&
      context.scope.requested.every(file => observed.scope.includes(file)) &&
      Array.isArray(context.scope?.eligible_files) && context.scope.eligible_files.every(file => observed.scope.includes(file));
  } catch { return false; }
}

function scopedChoice(context, key, observed) {
  const input = context.choices?.[key], decision = input?.decision;
  if (!decision || decision.owner_repository_id !== observed.repository_id || decision.change_ref !== observed.change_ref || decision.scope_fingerprint !== observed.scope_fingerprint || decision.gate !== `finish:${key}` || decision.approval !== false) return { status: 'pending', reason: `unresolved ${key} decision` };
  try { decisionFingerprint(decision); } catch (error) { return { status: 'blocked', reason: error.message }; }
  const resolved = resolveDecision(input, observed.decision_runtime);
  if (resolved.status === 'resolved') return resolved;
  if (resolved.status !== 'pending') return resolved;
  // This is an actual verified plan body, not a payload preference or label.
  const selected = observed.policy.decisions?.[key];
  if (selected && selected !== 'apply' && decision.options.some(option => option.value === selected)) return { status: 'resolved', value: selected, source: 'verified-plan' };
  return resolved;
}

// The host, not the payload, knows whether a simplify pass is still open: an
// in-process session with an unfinished grant or a runner dispatch without a
// verified receipt blocks even when the payload omits simplify_context. A completed
// session pass (verified or rolled back) is host state just like a verified dispatch.
function hostSimplifyState(observed) {
  const session = findSimplifySession(observed.root, observed.change_ref);
  const dispatches = observed.simplify_dispatches ?? [];
  const blockers = [];
  if (session?.pending) blockers.push('an authorized simplify pass is not verified or rolled back; complete or roll it back before finish');
  if (dispatches.some(dispatch => dispatch.status === 'open')) blockers.push('a simplify runner dispatch is open; record its receipt before finish');
  if (dispatches.some(dispatch => dispatch.status === 'failed')) blockers.push('a simplify runner dispatch has no verified receipt; its writes stay unverified');
  const completedPasses = (session?.ledger ?? []).filter(pass => pass.verification_result === 'passed' || pass.reverted === true).length;
  return { active: Boolean(session) || dispatches.length > 0, session: Boolean(session),
    verified: completedPasses > 0 || dispatches.some(dispatch => dispatch.status === 'verified'), blockers };
}

/** One completion owner; no source writes, tool dispatch, or persistence here. */
export function resolveFinish(context, runtime = {}) {
  let observed;
  try { observed = observeRepositoryRuntime(runtime.observation); } catch (error) { return blocked(error.message); }
  if (context?.schema_version !== 1 || context.identity?.owner_repository_id !== observed.repository_id || context.identity?.change_ref !== observed.change_ref || context.identity?.scope_fingerprint !== observed.scope_fingerprint) return blocked('finish identity/scope does not match the observed owner');
  if (!['integration','worker'].includes(context.actor?.role) || context.actor.repository_id !== observed.repository_id) return blocked('finish actor ownership is invalid');
  const proofs = context.phase_receipts ?? {};
  const verified = new Map();
  const proof = phase => {
    if (!verified.has(phase)) verified.set(phase, proofs[phase] ? verifyRepositoryPhase(runtime.observation, proofs[phase], phase, observed) : null);
    return verified.get(phase);
  };
  const invalid = Object.keys(proofs).map(phase => proof(phase)).find(value => !value.valid);
  if (invalid) return blocked(...invalid.blockers);
  // `phase` is the only receipt key: the host records the next receipt at
  // phase_receipts[phase]. `intent` says whether that receipt is new or a refresh.
  const next = (phase, extra = {}) => {
    const owner = extra.owner ?? owners[phase];
    if (typeof owner !== 'string' || !owner) return blocked(`finish phase ${phase} has no owner; declare it in the approved policy`);
    return result('pending-action', { next_actions: [{ ...extra, phase, owner, intent: proofs[phase] ? 'refresh' : 'produce' }] });
  };
  const reviewChoice = scopedChoice(context, 'review', observed);
  if (reviewChoice.value === 'defer') return result('deferred', { reason: 'explicit defer stops the remaining tail; no done claim' });
  if (observed.policy.test_strategy === 'tdd') {
    const red = proof('red'), implementation = proof('implementation');
    if (!red?.valid || !implementation?.valid || red.body.event_sequence >= implementation.body.event_sequence || red.body.source_fingerprint !== implementation.body.before_fingerprint) return blocked('TDD requires observed RED before the corresponding implementation write');
  }
  const baseline = proof('baseline');
  if (!baseline) return next('baseline');
  if (context.actor.role === 'worker') {
    if (!baseline.current) return next('baseline');
    for (const phase of ['unit-review-a', 'unit-review-b']) {
      if (!proof(phase)?.current) return next(phase, { unit_only: true });
    }
    return result('unit-complete', { reason: 'return unit evidence to the integration owner; no shared finish prompts or docs' });
  }
  if (context.identity.integration_owner_repository_id !== observed.repository_id) return blocked('only the integration owner may run final finish');
  const host = hostSimplifyState(observed);
  if (host.blockers.length) return blocked(...host.blockers);
  // Default skip applies only when nothing is eligible, no choice resolved and the host holds no simplify activity.
  let simplifyChoice;
  if (observed.eligible_paths.length || !observed.eligibility_known || host.active) simplifyChoice = scopedChoice(context, 'simplify', observed);
  else {
    const recorded = context.choices?.simplify ? scopedChoice(context, 'simplify', observed) : null;
    simplifyChoice = recorded?.status === 'resolved' ? recorded : { status: 'resolved', value: 'skip', source: 'not-eligible', reason: 'observed scope has no eligible changed executable source' };
  }
  if (simplifyChoice.status !== 'resolved') return result(simplifyChoice.status === 'blocked' ? 'blocked' : 'pending-choice', { decision: 'simplify', blockers: simplifyChoice.status === 'blocked' ? [simplifyChoice.reason] : [] });
  if (!['skip','analyze','apply'].includes(simplifyChoice.value)) return blocked('unknown simplify decision');
  // A skip cannot hide a pass the host already completed.
  if (simplifyChoice.value === 'skip' && host.verified) return blocked('the host holds a completed simplify pass; a skip cannot hide it, record its proof under the selected mode');
  const simplifySource = simplifyChoice.source === 'not-eligible' ? 'not-eligible' : simplifyChoice.resolution?.source === 'explicit-user' ? 'explicit' : 'verified-plan';
  let simplifyOutcome = 'skipped';
  // A resumed repair never opens a second simplify invocation, even with an old Apply resolution.
  const repaired = proof('repair');
  const simplifyProof = proof('simplify');
  // A verified runner dispatch or a completed session pass is host state: dropping its
  // proof or its session context cannot reopen Apply, and a repair receipt cannot skip it.
  if (host.verified && !simplifyProof) return blocked('the host holds a verified simplify dispatch or completed session pass; record its proof in phase_receipts.simplify');
  if (simplifyChoice.value !== 'skip' && !simplifyProof && !repaired) {
    if (simplifyChoice.value === 'apply') {
      if (!baseline.current) return next('baseline');
      if (!observed.eligibility_known || !observed.eligible_paths.length) return blocked('Apply eligibility is unproven');
      // Without an in-process session, Apply runs in the canonical host runner; the
      // host records the dispatch through beginSimplify/recordSimplify. A session held
      // by the host for this root/change is never bypassed by dropping its context.
      if (context.simplify_context == null && host.session) return blocked('the host holds a simplify session for this change; supply its simplify_context');
      if (context.simplify_context == null && observed.simplify_runner_available) return next('simplify', { mode: 'apply', runner: 'host-runner', source_write_allowed: false });
      if (!matchesSimplifyOwner(context.simplify_context, observed)) return blocked('simplify context differs from the finish owner/root/change/scope');
      if (context.simplify_context.scope.eligible_files.some(file => !observed.eligible_paths.includes(file))) return blocked('simplify scope is not eligible in the observed finish scope');
      return next('simplify', { mode: 'apply', source_write_allowed: false, preflight_required: true });
    }
    return next('simplify', { mode: simplifyChoice.value, source_write_allowed: false });
  }
  if (simplifyProof) {
    // Analyze needs current analysis; Apply needs current verification.
    const currentFor = evidence => simplifyChoice.value === 'analyze' ? evidence.analysis_current : simplifyChoice.value === 'apply' ? evidence.verification_current : evidence.evidence_current;
    if (simplifyProof.body.kind === 'simplify') {
      // Runner dispatch: read the host-verified receipt, never the serialized context.
      const read = evaluateSimplifyConsumer(context.simplify_context, { observation: runtime.observation, proof: proofs.simplify, consumer: 'sdcorejs-test' });
      if (read.status === 'blocked' || (!repaired && !currentFor(read))) return blocked(...(read.blockers?.length ? read.blockers : ['simplify dispatch evidence is not current']));
      simplifyOutcome = read.outcome;
    } else {
      if (!matchesSimplifyOwner(context.simplify_context, observed)) return blocked('simplify postflight differs from the finish owner/root/change/scope');
      const simplified = evaluateSimplifyConsumer(context.simplify_context, { ...runtime.simplify_runtime, consumer: 'sdcorejs-test' });
      if (simplified.blockers?.length || (!repaired && !currentFor(simplified))) return blocked(...(simplified.blockers?.length ? simplified.blockers : ['simplify postflight is unverified']));
      // The outcome comes from the host-held completion, not the payload.
      simplifyOutcome = simplified.outcome;
    }
    if (!SIMPLIFY_OUTCOMES.has(simplifyOutcome)) return blocked('simplify evidence does not record a completed pass');
    if (simplifyChoice.value === 'apply' && !proof('reverify')?.current) return next('reverify');
  }
  if (reviewChoice.status !== 'resolved') return result(reviewChoice.status === 'blocked' ? 'blocked' : 'pending-choice', { decision: 'review', blockers: reviewChoice.status === 'blocked' ? [reviewChoice.reason] : [] });
  if (!['skip','review-only','review-and-repair'].includes(reviewChoice.value)) return blocked('unknown review choice');
  if (repaired && reviewChoice.value !== 'review-and-repair') return blocked('repair evidence cannot broaden the selected read-only/skip mode');
  if (reviewChoice.value === 'skip' && observed.policy.required_phases.includes('review')) return blocked('required review cannot be removed by skip');
  // The latest test evidence (reverify after a simplify pass, otherwise baseline) is refreshed before review.
  const testPhase = proof('reverify') ? 'reverify' : 'baseline';
  const readOnly = { mode: 'read-only', repair_authorized: false };
  if (reviewChoice.value !== 'skip') {
    if (!proof(testPhase).current) return next(testPhase, { reason: 'refresh verification of changed inputs before review' });
    if (!proof('review')) return next('review', readOnly);
    if (!proof('review').current) return next('review', { ...readOnly, reason: 'review inputs changed; refresh the assessment before considering repairs' });
    const review = readRepositoryReview(runtime.observation, proof('review'));
    if (!review) return next('review', { ...readOnly, reason: 'assessment changed or its host loader is unavailable' });
    if (review.owner_repository_id !== observed.repository_id || review.change_ref !== observed.change_ref || !Array.isArray(review.blocking_findings)) return blocked('review assessment identity is invalid');
    if (review.blocking_findings.length && !repaired) {
      if (reviewChoice.value === 'review-only') return blocked('read-only review has blocking findings; no repair authority');
      return next('repair', { authority: 'existing finding/tier/scope owner preflight required', finding_refs: review.blocking_findings });
    }
    if (repaired && review.blocking_findings.length) return blocked('repair did not resolve the current blocking findings');
  }
  for (const hook of observed.policy.hooks.filter(item => item.id !== 'implementation')) {
    if (!hook.id || !hook.owner || !Array.isArray(hook.paths) || hook.paths.some(file => !observed.scope.includes(file))) return blocked('write-producing hook lacks exact owner/path authority');
    if (!proof(hook.id)) return next(hook.id, { owner: hook.owner, allowed_paths: hook.paths });
  }
  // Complete phase records retain progress, but stale inputs are refreshed under their own phase after writes.
  const evidencePhases = [testPhase, ...(proof('review') ? ['review'] : []), ...(repaired ? ['repair'] : [])];
  for (const phase of evidencePhases) if (!proof(phase)?.current) return next(phase, { ...(phase === 'review' ? readOnly : {}), reason: 'affected content changed after verification' });
  for (const hook of observed.policy.hooks.filter(item => item.id !== 'implementation')) if (!proof(hook.id)?.current) return next(hook.id, { owner: hook.owner, allowed_paths: hook.paths, reason: 'hook inputs changed; revalidate through its owner' });
  for (const phase of ['verify', 'branch-ready']) if (!proof(phase)?.current) return next(phase);
  const lastWork = Math.max(...Object.entries(proofs).filter(([phase]) => !['verify','branch-ready','red','implementation'].includes(phase)).map(([phase]) => proof(phase).body.event_sequence));
  if (proof('verify').body.event_sequence <= lastWork) return next('verify');
  if (proof('branch-ready').body.event_sequence <= proof('verify').body.event_sequence) return next('branch-ready');
  return result('tail-complete', { source_fingerprint: observed.source_fingerprint, simplify: simplifyChoice.value, simplify_source: simplifySource, simplify_outcome: simplifyOutcome,
    reason: 'current focused verification and final read-only gate; no Git authority or semantic equivalence claim' });
}

export function evaluateFinishConsumer(context, runtime, { consumer, phase = 'handoff' } = {}) {
  if (context === undefined && runtime === undefined) return { applicable: false, verified: true, status: 'NOT APPLICABLE', blockers: [] };
  const outcome = resolveFinish(context, runtime);
  const expected = phase === 'verify' ? 'verify' : phase === 'branch-ready' ? 'branch-ready' : null;
  const permitted = outcome.status === 'tail-complete' || expected && outcome.status === 'pending-action' && outcome.next_actions[0]?.phase === expected;
  return { applicable: true, verified: Boolean(permitted), status: permitted ? 'PASS' : 'BLOCKED', outcome,
    blockers: permitted ? [] : outcome.blockers.length ? outcome.blockers : [`${consumer ?? 'consumer'} cannot claim completion from ${outcome.status}`] };
}

export function evaluateFinishInvocation(context, runtime, actionName) {
  if (context === undefined && runtime === undefined) return { applicable: false, verified: true, blockers: [] };
  try {
    const observed = observeRepositoryRuntime(runtime?.observation);
    if (context?.schema_version !== 1 || context.identity?.owner_repository_id !== observed.repository_id || context.identity?.change_ref !== observed.change_ref || context.identity?.scope_fingerprint !== observed.scope_fingerprint) throw new Error('finish invocation identity is missing or stale');
    if (context.actor?.role !== 'integration' || context.actor.repository_id !== observed.repository_id || context.identity.integration_owner_repository_id !== observed.repository_id) throw new Error('shared finish invocation requires the integration owner');
    const choice = scopedChoice(context, 'review', observed);
    const allowed = actionName === 'repair' ? choice.value === 'review-and-repair' : ['review-only','review-and-repair'].includes(choice.value);
    if (!allowed) throw new Error(`${actionName} is not authorized by the scoped finish choice`);
    return { applicable: true, verified: true, blockers: [] };
  } catch (error) { return { applicable: true, verified: false, blockers: [error.message] }; }
}
