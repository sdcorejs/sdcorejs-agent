import { decisionFingerprint, resolveDecision } from '../harness/runtime-policy.mjs';
import { realpathSync } from 'node:fs';
import { observeRepositoryRuntime, verifyRepositoryPhase, readRepositoryReview } from './repository-observation.mjs';
import { evaluateSimplifyConsumer } from '../simplify/simplify-contract.mjs';

const owners = Object.freeze({ baseline: 'sdcorejs-test', simplify: 'sdcorejs-simplify', reverify: 'sdcorejs-test',
  review: 'sdcorejs-review', repair: 'sdcorejs-repair-loop', verify: 'sdcorejs-ship', 'branch-ready': 'sdcorejs-ship' });
const result = (status, extra = {}) => ({ status, branch_ready: status === 'tail-complete', next_actions: [], blockers: [], ...extra });
const action = (phase, extra = {}) => result('pending-action', { next_actions: [{ phase, owner: owners[phase] ?? 'sdcorejs-documentation', ...extra }] });

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

/** One completion owner; no source writes, tool dispatch, or persistence here. */
export function resolveFinish(context, runtime = {}) {
  let observed;
  try { observed = observeRepositoryRuntime(runtime.observation); } catch (error) { return result('blocked', { blockers: [error.message] }); }
  if (context?.schema_version !== 1 || context.identity?.owner_repository_id !== observed.repository_id || context.identity?.change_ref !== observed.change_ref || context.identity?.scope_fingerprint !== observed.scope_fingerprint) return result('blocked', { blockers: ['finish identity/scope does not match the observed owner'] });
  if (!['integration','worker'].includes(context.actor?.role) || context.actor.repository_id !== observed.repository_id) return result('blocked', { blockers: ['finish actor ownership is invalid'] });
  const proofs = context.phase_receipts ?? {};
  const verified = new Map();
  const proof = phase => {
    if (!verified.has(phase)) verified.set(phase, proofs[phase] ? verifyRepositoryPhase(runtime.observation, proofs[phase], phase, observed) : null);
    return verified.get(phase);
  };
  const invalid = Object.keys(proofs).map(phase => proof(phase)).find(value => !value.valid);
  if (invalid) return result('blocked', { blockers: invalid.blockers });
  const reviewChoice = scopedChoice(context, 'review', observed);
  if (reviewChoice.value === 'defer') return result('deferred', { reason: 'explicit defer stops the remaining tail; no done claim' });
  if (observed.policy.test_strategy === 'tdd') {
    const red = proof('red'), implementation = proof('implementation');
    if (!red?.valid || !implementation?.valid || red.body.event_sequence >= implementation.body.event_sequence || red.body.source_fingerprint !== implementation.body.before_fingerprint) return result('blocked', { blockers: ['TDD requires observed RED before the corresponding implementation write'] });
  }
  const baseline = proof('baseline');
  if (!baseline) return action('baseline');
  if (context.actor.role === 'worker') {
    if (!baseline.current) return action('baseline');
    for (const phase of ['unit-review-a', 'unit-review-b']) {
      if (!proof(phase)?.current) return action('review', { evidence_phase: phase, unit_only: true });
    }
    return result('unit-complete', { reason: 'return unit evidence to the integration owner; no shared finish prompts or docs' });
  }
  if (context.identity.integration_owner_repository_id !== observed.repository_id) return result('blocked', { blockers: ['only the integration owner may run final finish'] });
  let simplifyChoice = { status: 'resolved', value: 'skip', reason: 'observed scope has no eligible changed executable source' };
  if (observed.eligible_paths.length || !observed.eligibility_known) simplifyChoice = scopedChoice(context, 'simplify', observed);
  if (simplifyChoice.status !== 'resolved') return result(simplifyChoice.status === 'blocked' ? 'blocked' : 'pending-choice', { decision: 'simplify', blockers: simplifyChoice.status === 'blocked' ? [simplifyChoice.reason] : [] });
  if (!['skip','analyze','apply'].includes(simplifyChoice.value)) return result('blocked', { blockers: ['unknown simplify decision'] });
  // A resumed repair never opens a second simplify invocation, even with an old Apply resolution.
  const repaired = proof('repair');
  if (simplifyChoice.value !== 'skip' && !proof('simplify') && !repaired) {
    if (simplifyChoice.value === 'apply') {
      if (!baseline.current) return action('baseline');
      if (!observed.eligibility_known || !observed.eligible_paths.length) return result('blocked', { blockers: ['Apply eligibility is unproven'] });
      if (!matchesSimplifyOwner(context.simplify_context, observed)) return result('blocked', { blockers: ['simplify context differs from the finish owner/root/change/scope'] });
      if (context.simplify_context.scope.eligible_files.some(file => !observed.eligible_paths.includes(file))) return result('blocked', { blockers: ['simplify scope is not eligible in the observed finish scope'] });
      return action('simplify', { mode: 'apply', source_write_allowed: false, preflight_required: true });
    }
    return action('simplify', { mode: simplifyChoice.value, source_write_allowed: simplifyChoice.value === 'apply' });
  }
  if (proof('simplify')) {
    if (!matchesSimplifyOwner(context.simplify_context, observed)) return result('blocked', { blockers: ['simplify postflight differs from the finish owner/root/change/scope'] });
    const simplified = evaluateSimplifyConsumer(context.simplify_context, { ...runtime.simplify_runtime, consumer: 'sdcorejs-test' });
    if (simplified.blockers?.length || !repaired && !simplified.evidence_current) return result('blocked', { blockers: simplified.blockers?.length ? simplified.blockers : ['simplify postflight is unverified'] });
    if (simplifyChoice.value === 'apply' && !proof('reverify')?.current) return action('reverify');
  }
  if (reviewChoice.status !== 'resolved') return result(reviewChoice.status === 'blocked' ? 'blocked' : 'pending-choice', { decision: 'review', blockers: reviewChoice.status === 'blocked' ? [reviewChoice.reason] : [] });
  if (!['skip','review-only','review-and-repair'].includes(reviewChoice.value)) return result('blocked', { blockers: ['unknown review choice'] });
  if (repaired && reviewChoice.value !== 'review-and-repair') return result('blocked', { blockers: ['repair evidence cannot broaden the selected read-only/skip mode'] });
  if (reviewChoice.value === 'skip' && observed.policy.required_phases.includes('review')) return result('blocked', { blockers: ['required review cannot be removed by skip'] });
  if (reviewChoice.value !== 'skip' && !proof('review') && !baseline.current && !proof('reverify')?.current) return action('reverify', { evidence_phase: 'baseline', reason: 'reverify changed inputs before review' });
  if (reviewChoice.value !== 'skip' && !proof('review')) return action('review', { mode: 'read-only', repair_authorized: false });
  if (reviewChoice.value !== 'skip') {
    if (!proof('review').current) return action('reverify', { evidence_phase: 'review', owner: 'sdcorejs-review', mode: 'read-only', reason: 'review inputs changed; refresh assessment before considering repairs' });
    const review = readRepositoryReview(runtime.observation, proof('review'));
    if (!review) return action('review', { mode: 'read-only', reason: 'assessment changed or its host loader is unavailable' });
    if (!review || review.owner_repository_id !== observed.repository_id || review.change_ref !== observed.change_ref || !Array.isArray(review.blocking_findings)) return result('blocked', { blockers: ['review assessment identity is invalid'] });
    if (review.blocking_findings.length && !repaired) {
      if (reviewChoice.value === 'review-only') return result('blocked', { blockers: ['read-only review has blocking findings; no repair authority'] });
      return action('repair', { authority: 'existing finding/tier/scope owner preflight required', finding_refs: review.blocking_findings });
    }
    if (repaired && review.blocking_findings.length) return result('blocked', { blockers: ['repair did not resolve the current blocking findings'] });
  }
  for (const hook of observed.policy.hooks.filter(item => item.id !== 'implementation')) {
    if (!hook.id || !hook.owner || !Array.isArray(hook.paths) || hook.paths.some(file => !observed.scope.includes(file))) return result('blocked', { blockers: ['write-producing hook lacks exact owner/path authority'] });
    if (!proof(hook.id)) return action(hook.id, { owner: hook.owner, allowed_paths: hook.paths });
  }
  // Complete phase records retain progress, but stale inputs are rechecked after writes.
  const evidencePhases = ['baseline', ...(proof('reverify') ? ['reverify'] : []), ...(proof('review') ? ['review'] : []), ...(repaired ? ['repair'] : [])];
  for (const phase of evidencePhases) if (!proof(phase)?.current) return action('reverify', { evidence_phase: phase, reason: 'affected content changed after verification' });
  for (const hook of observed.policy.hooks.filter(item => item.id !== 'implementation')) if (!proof(hook.id)?.current) return action(hook.id, { owner: hook.owner, allowed_paths: hook.paths, reason: 'hook inputs changed; revalidate through its owner' });
  for (const phase of ['verify', 'branch-ready']) if (!proof(phase)?.current) return action(phase);
  const lastWork = Math.max(...Object.entries(proofs).filter(([phase]) => !['verify','branch-ready','red','implementation'].includes(phase)).map(([phase]) => proof(phase).body.event_sequence));
  if (proof('verify').body.event_sequence <= lastWork) return action('verify');
  if (proof('branch-ready').body.event_sequence <= proof('verify').body.event_sequence) return action('branch-ready');
  return result('tail-complete', { source_fingerprint: observed.source_fingerprint, simplify: simplifyChoice.value,
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
