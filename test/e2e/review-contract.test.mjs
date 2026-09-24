import { simplifyFixture, sourcePath, originalSource } from './support/simplify-contract-fixture.mjs';
import assert from 'node:assert/strict';
import test from 'node:test';
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
      f.reset({ run_command: args => ({ ...f.host.run_command(args), exit_code: 1 }) });
      assert.throws(() => f.capture('rendered'), /execute successfully/); return;
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

test('UI review cannot promote unobserved rendered or interaction evidence', () => {
  for (const evidence_kind of ['rendered', 'interaction']) {
    const result = evaluateReviewContract(context({
      purpose: 'implemented-ui-conformance',
      ui_review: { schema_version: 1, claimed_result: 'PASS' },
      dimensions: ['code'],
      reported_findings: [{ id: 'unobserved-ui', kind: 'uiux', severity: 'High',
        dimension: 'code', gate: 'REQUIRED', evidence: 'caller assertion', locator: 'src/page.ts:1',
        repository_id: 'github.com/acme/module-a', impact: 'Unknown runtime behavior',
        required_fix: 'Verify the actual target first', uiux: { classification: 'functional',
          evidence_kind, rule_id: 'popover', verification: 'PASS' } }],
    }));
    assert.equal(result.status, 'blocked', evidence_kind);
  }
});

test('UI review cannot ignore current-content drift at the same HEAD', () => {
  const result = evaluateReviewContract(context({
    purpose: 'implemented-ui-conformance',
    ui_review: { schema_version: 1, claimed_result: 'PASS' },
    test_evidence: [{ repository_id: 'github.com/acme/module-a', source_revision: 'a'.repeat(40),
      status: 'current', source_fingerprint: 'old-content', evidence_ref: 'capture' }],
    current_source_fingerprints: { 'github.com/acme/module-a': 'edited-content' },
  }));
  assert.equal(result.status, 'blocked');
});

test('UI review does not prove no writes from an empty declaration', () => {
  const result = evaluateReviewContract(context({
    purpose: 'design-artifact', ui_review: { schema_version: 1 },
    persistence: { performed: true, path: 'report.md' },
  }));
  assert.equal(result.read_only_proven, false);
  assert.equal(result.status, 'blocked');
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
  assert.equal(evaluateReviewContract(c, f.runtime).status, 'reviewed');
  assert.equal(evaluateReviewContract(c).status, 'blocked');
  f.write(sourcePath, originalSource);
  assert.match(evaluateReviewContract(c, f.runtime).blockers.join(' '), /stale/u);
});
