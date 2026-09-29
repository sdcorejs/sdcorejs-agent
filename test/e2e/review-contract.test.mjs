import { simplifyFixture, sourcePath, originalSource } from './support/simplify-contract-fixture.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
import { finishFixture } from './support/interaction-finish-fixture.mjs';

test('case-interaction-finish-review-consumer: defer blocks invocation and worker cannot run shared review', async t => {
  const f = await finishFixture(t, { review: 'defer' });
  const input = context({ finish_context: f.context });
  assert.match(evaluateReviewContract(input, { finish_runtime: f.runtime }).blockers.join(' '), /not authorized/u);
  f.choose('review', 'review-only');
  assert.doesNotMatch(evaluateReviewContract(input, { finish_runtime: f.runtime }).blockers.join(' '), /not authorized/u);
  f.context.actor.role = 'worker';
  assert.match(evaluateReviewContract(input, { finish_runtime: f.runtime }).blockers.join(' '), /integration owner/u);
});
import { uiReviewFixture } from './support/ui-review-fixture.mjs';
import { evaluateUiReviewConsumer, validateUiReviewContext, recordUiEvidence, createUiReviewRuntime,
  beginUiReviewObservation, readUiReviewRequirements } from '../../_refs/shared/ui-review-contract.mjs';

import {
  evaluateReviewContract,
  firstClassReviewProfiles,
} from '../../_refs/shared/review-contract.mjs';
import { systemRegistry } from '../../_refs/shared/system-registry.mjs';

function context(overrides = {}) {
  return {
    schema_version: 1,
    subject_track: 'general',
    review_profile: 'general',
    mode: 'read-only',
    write_actions: [],
    owner_repository_id: 'github.com/acme/module-a',
    execution_host_repository_id: 'github.com/acme/portal',
    current_revision_map: {
      'github.com/acme/module-a': 'a'.repeat(40),
    },
    portal_pinned_module_revision_map: { 'module-a': 'a'.repeat(40) },
    artifacts: [],
    test_evidence: [],
    provider_evidence: [],
    reported_findings: [],
    ...overrides,
  };
}

function uiResult(f) { return evaluateReviewContract(f.context, { ui_review_runtime: f.uiRuntime }); }

test('case-ui-review-independence: self-critique cannot satisfy independent review', t => {
  const f = uiReviewFixture(t, { independent: true, reviewer: { kind: 'self-critique', separate_context: false, separate_context_supported: false } });
  f.context.ui_review.assessment_context.kind = 'self-critique'; f.start();
  const r = uiResult(f); assert.equal(r.ui_review.independence, 'self-critique');
  assert.equal(r.ui_review.verified, false); assert.match(r.blockers.join(' '), /independent/);
});

test('case-ui-review-purposes: candidate Design assessment does not need its own approval', t => {
  const f = uiReviewFixture(t, { purpose: 'design-artifact' });
  f.put(f.handoff.metadata.repository_relative_path, 'Candidate, not approved'); f.start();
  const r = uiResult(f); assert.equal(r.ui_review.assessment_completed, true, r.blockers.join('; '));
  assert.equal(r.ui_review.conformance, 'UNAVAILABLE');
});

test('case-ui-review-source-limits: source inspection cannot pass rendered or interaction checks', t => {
  const f = uiReviewFixture(t, { required: ['source', 'rendered', 'interaction'] }); f.start();
  const r = uiResult(f); assert.equal(r.ui_review.coverage[0].source, 'PASS');
  assert.equal(r.ui_review.coverage[0].rendered, 'GAP'); assert.equal(r.ui_review.coverage[0].interaction, 'GAP');
  assert.equal(r.ui_review.verified, false);
});

test('case-ui-review-mockup-denial: generated image cannot become product evidence', t => {
  const f = uiReviewFixture(t);
  f.reset({ run_command: args => ({ ...f.host.run_command(args), provenance: 'generated-mockup' }) });
  assert.throws(() => f.capture('rendered'), /mockup|provenance/);
});

test('case-ui-review-target-provenance: command, source closure and viewport are bound', t => {
  const f = uiReviewFixture(t, { required: ['rendered'] });
  assert.throws(() => f.capture('rendered', { command: '' }), /command/);
  f.capture('rendered'); f.start(); f.context.ui_review.targets[0].viewport.width = 700;
  assert.equal(uiResult(f).ui_review.verified, false);
});

test('case-ui-review-content-staleness: actual same-HEAD edit invalidates proof', t => {
  const f = uiReviewFixture(t, { required: ['rendered'] });
  f.capture('rendered'); f.start();
  assert.equal(uiResult(f).ui_review.verified, true);
  f.put('src/page.css', 'main{overflow:hidden;}');
  assert.equal(f.git('rev-parse', 'HEAD'), f.revision);
  const stale = uiResult(f); assert.equal(stale.ui_review.verified, false);
  assert.match(stale.blockers.join(' '), /stale/);
  f.context.ui_review.evidence_refs = []; f.context.ui_review.assessment_id += '-rerun';
  f.reset(); f.capture('rendered'); f.start();
  assert.equal(uiResult(f).ui_review.verified, true);
});

test('case-ui-review-missing-baseline: no fabricated design or mandatory new design', t => {
  const f = uiReviewFixture(t); f.start();
  const r = uiResult(f); assert.equal(r.ui_review.verified, true, r.blockers.join('; '));
  assert.equal(r.ui_review.conformance, 'UNAVAILABLE');
});

test('implemented UI consumes an actual approved Design baseline and detects mutation', t => {
  const f = uiReviewFixture(t, { baseline: true });
  f.context.ui_review.baseline = { kind: 'design-artifact', artifact_ref: f.designRef, reason: null };
  f.start();
  const result = evaluateUiReviewConsumer(f.context, { runtime: f.uiRuntime });
  assert.equal(result.verified, true, result.blockers.join('; '));
  assert.equal(result.conformance, 'PASS');
  f.put(f.designRef.repository_relative_path, 'Changed approved Design');
  assert.equal(evaluateUiReviewConsumer(f.context, { runtime: f.uiRuntime }).verified, false);
});

test('explicit scoped source review works without inventing spec/plan/Design approvals', t => {
  const f = uiReviewFixture(t);
  f.reset({ source_runtime: undefined, design_runtime: undefined, authority: {
    ...f.host.authority, origin: 'explicit-user-request', request_id: 'observed-user-request',
    change_ref: f.context.change_ref, owner_repository_role: 'standalone',
  } });
  f.start();
  const result = uiResult(f);
  assert.equal(result.ui_review.verified, true, result.blockers.join('; '));
  assert.equal(result.ui_review.conformance, 'UNAVAILABLE');
});

function preference(f) {
  return { id: 'preference', kind: 'uiux', severity: 'Minor', dimension: 'code', gate: 'ADVISORY',
    evidence: 'src/page.css', locator: 'src/page.css:1', repository_id: f.repo, impact: 'Optional spacing preference',
    required_fix: 'Consider only if desired', repair_tier: 'confirm',
    uiux: { classification: 'aesthetic', evidence_kind: 'source', rule_id: 'spacing', verification: 'Source inspected', limitation: 'No rendering observed' } };
}
test('case-ui-review-aesthetic-advisory: preference is never blocking or auto-repair', t => {
  const f = uiReviewFixture(t); f.context.reported_findings = [preference(f)]; f.start();
  assert.equal(uiResult(f).status, 'reviewed');
  f.context.reported_findings[0].repair_tier = 'auto';
  assert.equal(uiResult(f).status, 'blocked');
});

test('case-ui-review-conformance-classification: requirement violations cannot hide as taste', t => {
  const f = uiReviewFixture(t, { baseline: true }); f.context.reported_findings = [preference(f)];
  f.context.reported_findings[0].uiux.requirement_refs = ['R-001']; f.start();
  assert.match(uiResult(f).blockers.join(' '), /conformance.*aesthetic/);
  Object.assign(f.context.reported_findings[0], { severity: 'High', gate: 'REQUIRED' });
  f.context.reported_findings[0].uiux.classification = 'functional';
  assert.equal(uiResult(f).ui_review.conformance, 'FAIL');
});

test('case-ui-review-observed-read-only: undeclared writes and persistence are observed', async t => {
  for (const file of ['src/page.css', 'unrequested-report.md', '.ignored-output']) await t.test(file, t => {
    const f = uiReviewFixture(t); f.start(); f.put(file, 'Unauthorized write');
    const r = uiResult(f); assert.equal(r.read_only_proven, false);
    assert.match(r.blockers.join(' '), /observation changed/);
  });
});

test('case-ui-review-narrow-scope: requested dimensions and files do not expand', t => {
  const f = uiReviewFixture(t, { authority: { dimensions: ['accessibility'] } });
  f.context.dimensions = ['accessibility']; f.start(); assert.equal(uiResult(f).status, 'reviewed');
  f.context.dimensions = ['ALL']; assert.equal(uiResult(f).status, 'blocked');
});

test('case-ui-review-real-consumers: omitted required Design review blocks frontend entrypoints', async t => {
  const f = uiReviewFixture(t, { purpose: 'design-artifact', independent: true });
  const { resolveAngularExecution } = await import('../../_refs/angular/execution-contract.mjs');
  const { resolveNextjsExecution } = await import('../../_refs/nextjs/execution-contract.mjs');
  const angular = { project_profile: 'core-ui-angular', execution_profile: 'developer', scope: 'application', application: { repository_id: f.repo }, execution_host_repository_id: f.repo, design_handoff: f.handoff };
  const next = { project_profile: 'nextjs-build-website', execution_profile: 'developer', website_profile: 'basic', explicit_profile_approval: true, scope: 'site', site: { repository_id: f.repo }, execution_host_repository_id: f.repo, design_handoff: f.handoff };
  const runtime = { design_runtime: f.designRuntime, ui_review_runtime: f.uiRuntime };
  assert.equal(resolveAngularExecution(angular, runtime).status, 'blocked');
  assert.equal(resolveNextjsExecution(next, runtime).status, 'blocked');
  f.start();
  assert.equal(resolveAngularExecution({ ...angular, review_context: f.context }, runtime).production_eligible, true);
  assert.equal(resolveNextjsExecution({ ...next, review_context: f.context }, runtime).production_eligible, true);
  const { prepareExecution } = await import('../../_refs/orchestration/execution-contract.mjs');
  const { designExecutionFixture } = await import('./support/design-handoff-fixture.mjs');
  const execution = { ...await designExecutionFixture(f), design_runtime: f.designRuntime, ui_review_runtime: f.uiRuntime };
  assert.throws(() => prepareExecution(execution), /UI review blocked/);
  assert.equal(prepareExecution({ ...execution, review_context: f.context }).ui_review_verification.verified, true);
});

test('UI Test, validation and ship callers preserve required evidence gaps', async t => {
  const f = uiReviewFixture(t, { required: ['rendered'], baseline: true });
  const { projectTestFixture } = await import('./support/test-track-forward-harness.mjs');
  const produced = await projectTestFixture(f.root, { action: 'ui-evidence-capture',
    ui_review_evidence: { kind: 'rendered', target_id: f.target.id, command: 'fixture-ui-capture' } }, { ui_review_runtime: f.uiRuntime });
  f.context.ui_review.evidence_refs = [produced.ui_review_evidence]; f.start();
  const { evaluateShipReadiness } = await import('../../_refs/shared/ship-readiness-contract.mjs');
  const { evaluateValidationEvidence } = await import('../../_refs/shared/validation-map.mjs');
  const ship = payload => evaluateShipReadiness({ schema_version: 1, review_context: payload,
    validation_map: [{ ui_review: f.policy.obligations[0] }] }, { ui_review_runtime: f.uiRuntime });
  assert.equal(ship(f.context).ui_review_verification.verified, true);
  assert.equal(ship(undefined).ui_review_verification.verified, false);
  const validation = payload => evaluateValidationEvidence({ validation_map: [{ ui_review: f.policy.obligations[0] }],
    review_context: payload, ui_review_runtime: f.uiRuntime });
  // The deliberately incomplete ordinary validation fixture remains blocked;
  // its UI layer must independently distinguish present and omitted proof.
  assert.equal(validation(f.context).blockers.some(b => b.code === 'UI_REVIEW_EVIDENCE_GAP'), false);
  assert.equal(validation(undefined).blockers.some(b => b.code === 'UI_REVIEW_EVIDENCE_GAP'), true);
  f.put('src/page.html', '<main>Changed after capture and review</main>');
  assert.equal(ship(f.context).ui_review_verification.verified, false);
});

test('post-implementation obligations do not require future evidence in preflight', async t => {
  const f = uiReviewFixture(t, { required: ['rendered', 'interaction'], independent: true, baseline: true });
  const { resolveAngularExecution } = await import('../../_refs/angular/execution-contract.mjs');
  const request = { project_profile: 'core-ui-angular', execution_profile: 'developer', scope: 'application',
    application: { repository_id: f.repo }, execution_host_repository_id: f.repo, design_handoff: f.handoff };
  const result = resolveAngularExecution(request, { design_runtime: f.designRuntime, ui_review_runtime: f.uiRuntime });
  assert.equal(result.production_eligible, true);
  assert.equal(result.ui_review_verification.pending_postflight, true);
  assert.equal(evaluateUiReviewConsumer(undefined, { runtime: f.uiRuntime, consumer: 'sdcorejs-ship' }).verified, false);
});

test('actual missing or mutated approved sources and unsupported runtime cannot verify UI', async t => {
  for (const mutation of ['parent', 'viewport', 'path', 'command', 'output']) await t.test(mutation, t => {
    const f = uiReviewFixture(t, { required: ['rendered'] });
    if (mutation === 'command') {
      // Audit repair UR-2 (D-002): a completed failing run is recorded as FAIL evidence; it still cannot verify UI.
      f.reset({ run_command: args => ({ ...f.host.run_command(args), exit_code: 1 }) });
      f.capture('rendered'); f.start();
      const failing = uiResult(f);
      assert.equal(failing.ui_review.coverage[0].rendered, 'FAIL');
      assert.equal(failing.ui_review.verified, false); return;
    }
    f.capture('rendered'); f.start();
    if (mutation === 'parent') f.put(f.specRef.repository_relative_path, 'mutated parent');
    if (mutation === 'viewport') f.context.ui_review.targets[0].viewport.width++;
    if (mutation === 'path') f.context.ui_review.targets[0].source_paths = ['../escape'];
    if (mutation === 'output') f.put('capture.png', 'not a capture');
    assert.equal(uiResult(f).ui_review.verified, false);
  });
});

test('case-ui-review-owner-repair: stale review cannot grant repair or restart simplify', async t => {
  const f = uiReviewFixture(t); f.start(); f.put('src/page.css', 'Repair changed content');
  const { evaluateRepairContract } = await import('../../_refs/orchestration/repair-contract.mjs');
  const r = evaluateRepairContract({ schema_version: 1, review_context: f.context, finding: preference(f) }, { ui_review_runtime: f.uiRuntime });
  assert.equal(r.repair_authorized, false);
  assert.equal(r.simplify_again_allowed, false);
  assert.ok(r.blockers.some(b => b.includes('UI')));
});

test('current conformance failure remains repairable only through existing owner authority', async t => {
  const f = uiReviewFixture(t, { baseline: true });
  const finding = preference(f);
  Object.assign(finding, { severity: 'High', gate: 'REQUIRED' });
  finding.uiux.classification = 'functional';
  f.context.reported_findings = [finding]; f.start();
  const { evaluateRepairContract } = await import('../../_refs/orchestration/repair-contract.mjs');
  // Repair consumes the assessment that the review recorded in this host runtime.
  uiResult(f);
  const result = evaluateRepairContract({ review_context: f.context, finding }, { ui_review_runtime: f.uiRuntime });
  assert.equal(result.ui_review_verification.verified, true, result.ui_review_verification.blockers.join('; '));
  assert.equal(result.ui_review_verification.conformance, 'FAIL');
  assert.equal(result.repair_authorized, false, 'review never supplies missing write authority');
  assert.equal(evaluateUiReviewConsumer(f.context, { runtime: f.uiRuntime, consumer: 'sdcorejs-ship' }).verified, false);
});

test('both purposes require current observed assessments, never a portable PASS', t => {
  const f = uiReviewFixture(t, { baseline: true });
  const designContext = structuredClone(f.context);
  designContext.purpose = 'design-artifact'; designContext.ui_review.assessment_id += '-design';
  const authority = { ...f.host.authority, purposes: ['design-artifact', 'implemented-ui-conformance'] };
  const prior = createUiReviewRuntime({ ...f.host, authority });
  beginUiReviewObservation(prior);
  const runtime = f.reset({ authority, prior_reviews: [{ context: designContext, runtime: prior }] }); f.start();
  const rows = [f.policy.obligations[0], { ...f.policy.obligations[0], purpose: 'design-artifact' }].map(ui_review => ({ ui_review }));
  const result = evaluateUiReviewConsumer(f.context, { runtime, validation_map: rows });
  assert.equal(result.verified, true, result.blockers.join('; '));
  f.put('src/page.css', 'Changed after both assessments');
  assert.equal(evaluateUiReviewConsumer(f.context, { runtime, validation_map: rows }).verified, false);
  f.context.ui_review.assessment_id += '-fabricated-new-assessment';
  assert.equal(evaluateUiReviewConsumer(f.context, { runtime }).read_only_proven, false);
});

test('malformed extension and drifted approved applicability fail closed', t => {
  const f = uiReviewFixture(t);
  for (const mutate of [v => { v.ui_review.targets = [null]; }, v => { v.ui_review.evidence_refs = [null]; },
    v => { v.dimensions = null; }, v => { v.reported_findings = null; }]) {
    const candidate = structuredClone(f.context); mutate(candidate);
    assert.equal(validateUiReviewContext(candidate).valid, false);
  }
  const body = { ui_review_requirements: f.policy, plan_context: { validation_map: [{ ui_review: f.policy.obligations[0] }] } };
  assert.deepEqual(readUiReviewRequirements({ body: JSON.stringify(body) }), f.policy);
  body.plan_context.validation_map[0].ui_review = { ...f.policy.obligations[0], evidence_kinds: ['interaction'] };
  assert.throws(() => readUiReviewRequirements({ body: JSON.stringify(body) }), /projection drift/);
});

test('direct UI consumers enforce the ordinary review boundary and finding contract', t => {
  const f = uiReviewFixture(t); f.start();
  for (const mutate of [v => { v.schema_version = 999; }, v => { v.mode = 'write'; },
    v => { v.write_actions = [{ action: 'persist', path: 'report.md' }]; },
    v => { v.subject_track = 'invented'; },
    v => { v.reported_findings = [{ ...preference(f), gate: 'REQUIRED' }]; },
    v => { v.reported_findings = [{ ...preference(f), repair_tier: 'auto' }]; },
    v => { v.reported_findings = [{ ...preference(f), locator: '' }]; }]) {
    const candidate = structuredClone(f.context); mutate(candidate);
    assert.equal(evaluateUiReviewConsumer(candidate, { runtime: f.uiRuntime }).verified, false);
  }
});

test('case-ui-review-smoke-fixtures: popover, mobile table and standalone responsive page', async t => {
  for (const scenario of ['action-popover', 'mobile-table-selection', 'standalone-responsive-page']) await t.test(scenario, t => {
    const f = uiReviewFixture(t, { scenario, required: ['rendered', 'interaction'], independent: true, baseline: true });
    f.capture('rendered'); f.capture('interaction'); f.start();
    const r = evaluateUiReviewConsumer(f.context, { runtime: f.uiRuntime, consumer: 'sdcorejs-ship' });
    assert.equal(r.verified, true, r.blockers.join('; ')); assert.equal(r.conformance, 'PASS');
    assert.equal(r.coverage[0].interaction, 'PASS');
    f.context.ui_review.evidence_refs.pop();
    assert.equal(evaluateUiReviewConsumer(f.context, { runtime: f.uiRuntime }).verified, false);
  });
});

test('case-ui-review-legacy-history: structural validity and legacy completion are not proof', t => {
  const f = uiReviewFixture(t);
  assert.equal(validateUiReviewContext(f.context).valid, true);
  assert.equal(evaluateReviewContract(f.context).ui_review.verified, false);
  assert.equal(evaluateReviewContract(context()).status, 'reviewed');
  assert.equal(evaluateReviewContract(context()).read_only_proven, false);
  f.context.ui_review.schema_version = 999;
  assert.equal(validateUiReviewContext(f.context).valid, false);
});

test('case-ui-review-scope-and-checks: no runner/capture/persistence during review', t => {
  const f = uiReviewFixture(t);
  let invoked = 0; f.reset({ run_command: () => { invoked++; throw Error('unexpected runner'); } }); f.start();
  const result = uiResult(f);
  assert.equal(result.ui_review.verified, true, result.blockers.join('; ')); assert.equal(invoked, 0);
  assert.throws(() => recordUiEvidence(f.uiRuntime, { kind: 'rendered' }), /not authorized/);
});

test('every first-class track has a durable central-registry review profile', () => {
  assert.deepEqual(
    Object.keys(firstClassReviewProfiles).sort(),
    systemRegistry.tracks.map(({ id }) => id).sort(),
  );
  for (const track of systemRegistry.tracks) {
    const result = evaluateReviewContract(
      context({ subject_track: track.id, review_profile: track.review_profile }),
    );
    assert.equal(result.status, 'reviewed', track.id);
  }
});

test('review is provably read-only and rejects write actions', () => {
  assert.equal(evaluateReviewContract(context()).read_only_proven, false);
  const result = evaluateReviewContract(
    context({ write_actions: [{ action: 'edit', path: 'src/a.ts' }] }),
  );
  assert.equal(result.read_only_proven, false);
  assert.match(result.blockers.join(' '), /cannot contain write actions/iu);
});

// Audit repair UR-5: these three guards use the documented, structurally valid UI payload,
// so each result is blocked only by the guard it names.
test('UI review cannot promote unobserved rendered or interaction evidence', t => {
  for (const evidence_kind of ['rendered', 'interaction']) {
    const f = uiReviewFixture(t);
    f.context.reported_findings = [{ id: 'unobserved-ui', kind: 'uiux', severity: 'High',
      dimension: 'code', gate: 'REQUIRED', evidence: 'src/page.html:1', locator: 'src/page.html:1',
      repository_id: f.repo, impact: 'Unknown runtime behavior', required_fix: 'Verify the actual target first',
      uiux: { classification: 'functional', evidence_kind, evidence_ref: 'capture.png', rule_id: 'popover', verification: 'Run the popover interaction.' } }];
    assert.equal(validateUiReviewContext(f.context).valid, true, evidence_kind);
    f.start();
    const result = uiResult(f);
    assert.equal(result.status, 'blocked', evidence_kind);
    assert.match(result.blockers.join(' '), /lacks verified target runtime evidence/u, evidence_kind);
  }
});

test('UI review cannot ignore current-content drift at the same HEAD', t => {
  const f = uiReviewFixture(t, { required: ['rendered'] });
  // Edit after capture but before the review observation starts, so only the
  // receipt content guard (not the read-only observation guard) can block.
  f.capture('rendered'); f.put('src/page.html', '<main>Edited after capture</main>'); f.start();
  assert.equal(validateUiReviewContext(f.context).valid, true);
  const result = uiResult(f);
  assert.equal(result.status, 'blocked');
  assert.equal(result.read_only_proven, true, 'the edit precedes the observed review window');
  assert.match(result.blockers.join(' '), /stale UI source\/build content/u);
});

test('UI review does not prove no writes from an empty declaration', t => {
  const f = uiReviewFixture(t, { purpose: 'design-artifact' });
  assert.equal(validateUiReviewContext(f.context).valid, true);
  f.start(); f.put('report.md', 'Persisted without authority');
  const result = uiResult(f);
  assert.equal(result.read_only_proven, false);
  assert.equal(result.status, 'blocked');
  assert.match(result.blockers.join(' '), /observation changed/u);
});

test('review detects module artifacts misplaced in portal and duplicate editable sources', () => {
  const artifacts = [
    {
      logical_id: 'module-a:spec',
      path: '.sdcorejs/specs/module-a.md',
      repository_id: 'github.com/acme/portal',
      owner_repository_id: 'github.com/acme/module-a',
      module_id: 'module-a',
      editable: true,
    },
    {
      logical_id: 'module-a:spec',
      path: '.sdcorejs/specs/module-a.md',
      repository_id: 'github.com/acme/module-a',
      owner_repository_id: 'github.com/acme/module-a',
      module_id: 'module-a',
      editable: true,
    },
  ];
  const result = evaluateReviewContract(context({ artifacts }));
  assert.ok(result.findings.some(({ kind }) => kind === 'misplaced-owner-artifact'));
  assert.ok(result.findings.some(({ kind }) => kind === 'duplicate-editable-source'));
});

test('stale source/pinned evidence is a High finding', () => {
  const result = evaluateReviewContract(
    context({
      test_evidence: [
        {
          evidence_ref: 'evidence/module-a.json',
          repository_id: 'github.com/acme/module-a',
          module_id: 'module-a',
          source_revision: 'b'.repeat(40),
          status: 'current',
        },
      ],
    }),
  );
  const stale = result.findings.find(({ kind }) => kind === 'stale-evidence');
  assert.equal(stale.severity, 'High');
  assert.equal(stale.repository_id, 'github.com/acme/module-a');
});

test('fake provider remains Critical even when CI is green', () => {
  const existing = {
    id: 'R-existing',
    severity: 'Critical',
    kind: 'authorization-bypass',
    evidence: 'src/auth.ts:10',
    locator: 'src/auth.ts:10',
    repository_id: 'github.com/acme/module-a',
    module_id: 'module-a',
    impact: 'Unauthorized access',
    required_fix: 'Restore server-side denial.',
  };
  const result = evaluateReviewContract(
    context({
      ci_status: 'green',
      reported_findings: [existing],
      provider_evidence: [
        {
          provider_kind: 'fake',
          production_required: true,
          contract_path: 'src/provider.ts',
          evidence_ref: 'test/fake-provider.spec.ts',
          repository_id: 'github.com/acme/module-a',
          module_id: 'module-a',
        },
      ],
    }),
  );
  assert.equal(
    result.findings.find(({ id }) => id === 'R-existing').severity,
    'Critical',
  );
  assert.equal(
    result.findings.find(({ kind }) => kind === 'fake-production-provider').severity,
    'Critical',
  );
});

test('mutated approval hash and unsupported review profiles fail closed', () => {
  const mutated = evaluateReviewContract(
    context({
      artifacts: [
        {
          logical_id: 'plan',
          path: '.sdcorejs/plans/a.md',
          repository_id: 'github.com/acme/module-a',
          owner_repository_id: 'github.com/acme/module-a',
          editable: false,
          approved_hash: 'a'.repeat(64),
          current_hash: 'b'.repeat(64),
        },
      ],
    }),
  );
  assert.ok(mutated.findings.some(({ kind }) => kind === 'mutated-approved-artifact'));

  const unsupported = evaluateReviewContract(
    context({ subject_track: 'ai-agent', review_profile: 'general' }),
  );
  assert.equal(unsupported.status, 'blocked');
  assert.match(unsupported.blockers.join(' '), /does not match registry profile/iu);
});


test('case-simplify-hardening-ac-010 review checks actual simplify freshness', async t => {
  const f = await simplifyFixture(t); const result = f.finish(f.preflight());
  const c = context({ owner_repository_id: result.context.artifact_identity.owner_repository_id, simplify_context: result.context });
  const reviewed = evaluateReviewContract(c, f.runtime);
  assert.equal(reviewed.status, 'reviewed', JSON.stringify({ postflight: result.blockers, review: reviewed.blockers }));
  assert.equal(evaluateReviewContract(c).status, 'blocked');
  f.write(sourcePath, originalSource);
  assert.match(evaluateReviewContract(c, f.runtime).blockers.join(' '), /stale/u);
});

// ---------------------------------------------------------------------------
// Audit repair (audit-findings-repair-20260928): UI applicability, failing
// receipts, the closed source-only claim rule (D-009) and canonical gates.
// ---------------------------------------------------------------------------
import { mkdirSync as repairMkdir, writeFileSync as repairWrite } from 'node:fs';
import repairPath from 'node:path';

const repairOrdinary = () => ({ schema_version: 1, source: 'sdcorejs-review', subject_track: 'workflow', review_profile: 'workflow',
  mode: 'read-only', dimensions: ['security'], write_actions: [], reported_findings: [] });

test('case-repair-ordinary-review: an ordinary review_context is not a UI review unless an obligation exists', t => {
  for (const consumer of ['sdcorejs-ship', 'sdcorejs-repair-loop', 'sdcorejs-angular', 'validation-map', 'sdcorejs-nextjs']) {
    const result = evaluateUiReviewConsumer(repairOrdinary(), { consumer, validation_map: [], approved_artifacts: [] });
    assert.equal(result.status, 'NOT APPLICABLE', `${consumer}: ${JSON.stringify(result.blockers)}`);
    assert.equal(result.verified, true, consumer);
  }
  const f = uiReviewFixture(t, { required: ['rendered'] });
  const obligated = evaluateUiReviewConsumer(repairOrdinary(), { consumer: 'sdcorejs-ship', validation_map: [{ ui_review: f.policy.obligations[0] }] });
  assert.equal(obligated.status, 'BLOCKED', 'an ordinary context cannot mask an approved UI obligation');
  assert.equal(evaluateUiReviewConsumer(repairOrdinary(), { runtime: f.uiRuntime, consumer: 'sdcorejs-ship' }).status, 'BLOCKED', 'runtime obligations are never masked');
  f.capture('rendered'); f.start();
  assert.equal(evaluateUiReviewConsumer(f.context, { runtime: f.uiRuntime, consumer: 'sdcorejs-ship' }).verified, true, 'valid UI payloads keep their behavior');
});

test('case-repair-failing-receipt: a completed failing run is FAIL evidence; incomplete or stale runs stay gaps', t => {
  const f = uiReviewFixture(t, { required: ['interaction'] });
  f.reset({ run_command: args => ({ ...f.host.run_command(args), exit_code: 1, assertions: [{ id: 'fixture-keyboard', result: 'FAIL' }] }) });
  const ref = f.capture('interaction');
  f.context.reported_findings = [{ id: 'keyboard-trap', kind: 'uiux', severity: 'High', dimension: 'code', gate: 'REQUIRED',
    evidence: 'src/page.html:1: the menu has no Escape handler', locator: 'src/page.html:1', repository_id: f.repo,
    impact: 'Keyboard users cannot leave the menu', required_fix: 'Restore Escape handling', repair_tier: 'confirm',
    uiux: { classification: 'functional', evidence_kind: 'interaction', evidence_ref: ref.artifact_ref, rule_id: 'popover', verification: 'Run the keyboard interaction.' } }];
  f.start();
  const review = uiResult(f);
  assert.equal(review.ui_review.coverage[0].interaction, 'FAIL', JSON.stringify(review.ui_review.coverage));
  assert.ok(review.ui_review.failures.length > 0, 'failures are separate from gaps');
  assert.doesNotMatch(review.blockers.join(' '), /lacks verified target runtime evidence/u, 'a finding may cite its current FAIL receipt');
  const ship = evaluateUiReviewConsumer(f.context, { runtime: f.uiRuntime, consumer: 'sdcorejs-ship' });
  assert.equal(ship.verified, false);
  assert.match(ship.blockers.join(' '), /FAIL/u, 'ship blocks a failing run as a defect');
  const repair = evaluateUiReviewConsumer(f.context, { runtime: f.uiRuntime, consumer: 'sdcorejs-repair-loop', phase: 'repair', repair_finding: f.context.reported_findings[0] });
  assert.equal(repair.verified, true, `repair accepts the failing evidence as its input: ${repair.blockers?.join('; ')}`);
  for (const [name, result] of [['interrupted', { interrupted: true }], ['timeout', { timed_out: true }], ['missing flags', { interrupted: undefined }]]) {
    const g = uiReviewFixture(t, { required: ['interaction'] });
    g.reset({ run_command: args => ({ ...g.host.run_command(args), exit_code: 1, ...result }) });
    assert.throws(() => g.capture('interaction'), /execute successfully|incomplete/u, name);
  }
  const stale = uiReviewFixture(t, { required: ['rendered'] });
  stale.capture('rendered');
  stale.reset({ run_command: ({ command, target, kind }) => ({ command, cwd: '.', exit_code: 1, interrupted: false, timed_out: false, target, kind,
    artifact_path: 'capture.png', provenance: 'real-product', build_id: 'synthetic-fixture-build', image_width: 1, image_height: 1, assertions: [] }) });
  assert.throws(() => stale.capture('rendered'), /output/u, 'an old output left behind is not evidence of this run');
});

test('case-repair-ui-claims-gates-tests: source-only runtime claims fail by structure and gates are canonical', t => {
  const f = uiReviewFixture(t); f.start();
  const finding = (overrides = {}) => ({ id: 'source-finding', kind: 'uiux', severity: 'Medium', dimension: 'code', gate: 'REQUIRED',
    evidence: 'src/page.html:1: the close control is a <div> with no keydown handler', locator: 'src/page.html:1', repository_id: f.repo,
    impact: 'Keyboard users may be unable to close the menu', required_fix: 'Use a button with a keyboard handler', repair_tier: 'confirm',
    ...overrides,
    uiux: { classification: 'functional', evidence_kind: 'source', rule_id: 'popover', verification: 'Render and inspect the accessible name of each control.',
      limitation: 'Keyboard behavior not run.', ...overrides.uiux } });
  // Each verdict is its own assessment, so the existing stale-assessment guard
  // cannot stand in for the rule under test.
  let round = 0;
  const verdict = item => { f.context.reported_findings = [item]; f.context.ui_review.assessment_id = `source-claims-${round += 1}`; return uiResult(f); };
  const rejected = (result, pattern, label) => { assert.equal(result.status, 'blocked', label); assert.match(result.blockers.join(' '), pattern, label); };
  assert.notEqual(verdict(finding()).status, 'blocked', 'an imperative method, a located source fact and a marked limitation are valid');
  for (const verification of ['Keyboard focus moves correctly.', 'Verified focus order.', 'Rendered fine.', 'Inspect: rendered output is correct.']) {
    rejected(verdict(finding({ uiux: { verification } })), /source-only/u, verification);
  }
  for (const evidence of ['Focus works correctly in src/page.html:1', 'The popover renders above the table.']) {
    rejected(verdict(finding({ evidence })), /source-only/u, evidence);
  }
  rejected(verdict(finding({ uiux: { limitation: 'Keyboard behavior checked.' } })), /source-only/u, 'a limitation needs the canonical marker');
  for (const gate of ['blocker', 'Required', 'MAYBE']) rejected(verdict(finding({ gate })), /non-canonical gate/u, gate);
  assert.notEqual(verdict(finding({ gate: 'ADVISORY' })).status, 'blocked');
});

test('case-repair-volatile-paths: a UI command window may rewrite only the plan-declared cache', t => {
  const writer = f => args => {
    const out = f.host.run_command(args);
    repairMkdir(repairPath.join(f.root, '.cache'), { recursive: true });
    repairWrite(repairPath.join(f.root, '.cache/ui.json'), String(process.hrtime.bigint()));
    return out;
  };
  const f = uiReviewFixture(t, { required: ['rendered'], planExtras: { finish_policy: { volatile_paths: ['.cache/**'] } } });
  f.put('.gitignore', '.cache/\n'); f.reset({ run_command: writer(f) });
  assert.ok(f.capture('rendered').artifact_ref, 'the declared cache may change inside the command window');
  const g = uiReviewFixture(t, { required: ['rendered'] });
  g.put('.gitignore', '.cache/\n'); g.reset({ run_command: writer(g) });
  assert.throws(() => g.capture('rendered'), /outside authorized outputs/u, 'undeclared ignored writes stay detected');
});

// Second review follow-up (repair selected by the user) ---------------------------
test('case-repair-claim-lexicon-negations: only a negated completion is a disclaimer; other negations are claims', t => {
  const f = uiReviewFixture(t); f.start();
  let round = 0;
  const verdict = item => { f.context.reported_findings = [item]; f.context.ui_review.assessment_id = `claim-negations-${round += 1}`; return uiResult(f); };
  const finding = (uiux, overrides = {}) => ({ id: 'negation-finding', kind: 'uiux', severity: 'Medium', dimension: 'code', gate: 'REQUIRED',
    evidence: 'src/page.html:1: the close control is a <div> with no keydown handler', locator: 'src/page.html:1', repository_id: f.repo,
    impact: 'Keyboard users may be unable to close the menu', required_fix: 'Use a button with a keyboard handler', repair_tier: 'confirm', ...overrides,
    uiux: { classification: 'functional', evidence_kind: 'source', rule_id: 'popover', verification: 'Render and inspect the accessible name of each control.', limitation: 'Keyboard behavior not yet run.', ...uiux } });
  for (const limitation of ['Keyboard behavior not yet run.', 'Keyboard behavior was never run.', 'Focus order has not been verified.',
    // Third review follow-up: manner adverbs that carry no outcome may separate the negation too.
    'Keyboard behavior was not manually tested.', 'Contrast was not visually verified.', 'Focus order has not yet been independently verified.']) {
    assert.notEqual(verdict(finding({ limitation })).status, 'blocked', `a negated completion with only auxiliaries or manner adverbs is a valid limitation: ${limitation}`);
  }
  // Inline code is code, not prose: a CSS value such as `none` is not a negation.
  assert.notEqual(verdict(finding({}, { evidence: 'src/page.css:3: `outline: none` found on button:focus' })).status, 'blocked', 'inline code is not a negated finding');
  assert.equal(verdict(finding({ limitation: 'Contrast not correctly rendered.' })).status, 'blocked', 'an outcome adverb is not a manner adverb');
  // Fourth review follow-up: inline code hides no outcome word and bridges no disclaimer.
  assert.notEqual(verdict(finding({ limitation: 'Keyboard check: `NOT RUN`.' })).status, 'blocked', 'a disclaimer in inline code is still a disclaimer');
  for (const [label, item] of [
    ['outcome word in inline code (verification)', finding({ verification: 'Check focus order: `passes`.' })],
    ['outcome words in inline code (evidence)', finding({}, { evidence: 'src/menu.html:3: keyboard focus `works correctly`' })],
    ['inline code bridging a disclaimer', finding({ limitation: 'Focus order was not `broken and it was` verified.' })],
  ]) {
    const result = verdict(item);
    assert.equal(result.status, 'blocked', label);
    assert.match(result.blockers.join(' '), /source-only/u, label);
  }
  for (const [label, item] of [
    // A negation separated from the completion by other words negates a result, not the run.
    ...['Keyboard navigation never works when tested.', 'Contrast not correct once rendered.', 'Focus handling never fails when tested.',
      'Keyboard checks: none found.', 'Focus: nothing observed failing.', 'Zero focus issues found.'].map(limitation => [limitation, finding({ limitation })]),
    // none/nothing/zero/never with a finding verb report a run result in any field.
    ['none in evidence', finding({}, { evidence: 'src/page.html:1: keyboard checks - none found' })],
    ['nothing in impact', finding({}, { impact: 'Focus: nothing observed failing.' })],
    ['zero in impact', finding({}, { impact: 'Zero focus issues found.' })],
    ['never in impact', finding({}, { impact: 'Keyboard traps were never seen.' })],
    ['never in verification', finding({ verification: 'Focus handling never fails when tested.' })],
  ]) {
    const result = verdict(item);
    assert.equal(result.status, 'blocked', label);
    assert.match(result.blockers.join(' '), /source-only/u, label);
  }
});

test('case-repair-window-release: a failed observation inside a UI command window still closes the window', async t => {
  const { captureRepository, registerVolatileLedger } = await import('../../_refs/shared/repository-observation.mjs');
  const { realpathSync, unlinkSync, symlinkSync } = await import('node:fs');
  const f = uiReviewFixture(t, { required: ['rendered'], planExtras: { finish_policy: { volatile_paths: ['.cache/**'] } } });
  f.put('.gitignore', '.cache/\n');
  f.reset({ run_command: args => {
    const out = f.host.run_command(args);
    // The runner leaves a link at the guarded output path, so the post-command capture throws.
    unlinkSync(repairPath.join(f.root, 'capture.png'));
    symlinkSync(repairPath.join(f.root, 'src'), repairPath.join(f.root, 'capture.png'), process.platform === 'win32' ? 'junction' : 'dir');
    return out;
  } });
  assert.throws(() => f.capture('rendered'), /symlink/u);
  const root = realpathSync.native(f.root);
  const ledger = registerVolatileLedger({ root, change_ref: f.context.change_ref, volatile_paths: ['.cache/**'],
    snapshot: captureRepository({ root, owner: f.repo, volatile: ['.cache/**'], guarded: [] }) });
  assert.equal(ledger.open, 0, 'the command window was closed although the capture failed');
});

test('case-repair-simplify-owner: review takes the simplify owner from host evidence, not the payload', async t => {
  const g = await finishFixture(t, { simplify: 'apply', review: 'skip',
    runtime: { simplify_verifier: () => ({ verified: true, outcome: 'simplified', pass_paths: ['src/value.mjs'], blockers: [] }) } });
  g.run('baseline');
  const dispatch = g.observation.beginSimplify();
  g.write('src/value.mjs', 'export const value = 1; // simplified\n');
  const recorded = g.observation.recordSimplify(dispatch.token, { schema_version: 1, kind: 'simplify-host-receipt:v1', status: 'verified', pass_paths: ['src/value.mjs'] });
  assert.equal(recorded.valid, true, JSON.stringify(recorded));
  const result = evaluateReviewContract(context({ owner_repository_id: g.context.identity.owner_repository_id, simplify_context: null }), { observation: g.observation, proof: recorded.proof });
  assert.equal(result.blockers.some(message => /owner mismatch/u.test(message)), false, JSON.stringify(result.blockers));
});

// Review follow-up (repair selected by the user): "no <outcome> observed" is a claim.
test('case-repair-claim-lexicon: negated success claims are outcome claims; only a negated runtime activity is a disclaimer', t => {
  const f = uiReviewFixture(t); f.start();
  let round = 0;
  const verdict = item => { f.context.reported_findings = [item]; f.context.ui_review.assessment_id = `claim-lexicon-${round += 1}`; return uiResult(f); };
  const finding = (overrides = {}) => ({ id: 'lexicon-finding', kind: 'uiux', severity: 'Medium', dimension: 'code', gate: 'REQUIRED',
    evidence: 'src/page.html:1: the close control is a <div> with no keydown handler', locator: 'src/page.html:1', repository_id: f.repo,
    impact: 'Keyboard users may be unable to close the menu', required_fix: 'Use a button with a keyboard handler', repair_tier: 'confirm', ...overrides,
    uiux: { classification: 'functional', evidence_kind: 'source', rule_id: 'popover', verification: 'Render and inspect the accessible name of each control.',
      limitation: 'No rendering observed.', ...overrides.uiux } });
  assert.notEqual(verdict(finding()).status, 'blocked', 'a negated runtime activity is a valid limitation');
  for (const [label, item] of [
    ['verification claim', finding({ uiux: { verification: 'Focus: no failures observed.' } })],
    ['evidence claim', finding({ evidence: 'src/m.html:4: keyboard trap - no issues observed' })],
    ['topic-led claim', finding({ evidence: 'src/page.html:1: no keyboard traps observed' })],
    ['limitation claim', finding({ uiux: { limitation: 'Keyboard navigation: no regressions confirmed.' } })],
  ]) {
    const result = verdict(item);
    assert.equal(result.status, 'blocked', label);
    assert.match(result.blockers.join(' '), /source-only/u, label);
  }
});
