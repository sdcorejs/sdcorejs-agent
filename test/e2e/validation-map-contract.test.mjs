import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { buildPortableHandoff } from '../../_refs/harness/communication-economy.mjs';
import { approveDecisionCoverage } from '../../_refs/shared/decision-coverage.mjs';

import {
  VALIDATION_AUTOMATION,
  VALIDATION_EVIDENCE_CLASSES,
  VALIDATION_LEVELS,
  VALIDATION_STATUSES,
  assertValidationMap,
  evaluateValidationEvidence,
  projectCoverageMatrix,
  validateValidationMap,
} from '../../_refs/shared/validation-map.mjs';

const FINGERPRINT = `sha256:v1:${'a'.repeat(64)}`;
const SOURCE_FINGERPRINT = 'c'.repeat(64);

function decisionCoverage() {
  const records = [
    {
      id: 'R-001',
      type: 'requirement',
      statement: 'Unauthorized callers are denied by the server.',
      source: 'explicit-user',
      status: 'active',
      owner_repository_id: 'repository-under-test',
      owner_module_id: null,
      task_refs: ['TASK-001'],
    },
    {
      id: 'AC-001',
      type: 'acceptance-criterion',
      statement: 'A viewer receives a server-side denial.',
      behavior: 'A viewer requests a protected server resource.',
      expected_result: 'The server denies the request.',
      verification_kind: 'automated',
      blocking: true,
      requirement_refs: ['R-001'],
      task_refs: ['TASK-001'],
    },
    {
      id: 'D-001',
      type: 'decision',
      statement: 'Authorization remains server-owned.',
      question: 'Where is authorization enforced?',
      selected_value: 'server-owned authorization',
      source: 'approved-spec',
      status: 'approved',
      blocking: true,
      scope: 'repository',
      owner_repository_id: 'repository-under-test',
      rationale: 'Server ownership prevents client state from granting access.',
      supersedes: null,
      revisit_condition: null,
      convention_impact: { candidate: false, category: null },
      downstream_refs: ['R-001', 'AC-001', 'INV-001'],
      task_refs: ['TASK-001'],
      validation_boundary: {
        kind: 'authorization',
        source_refs: ['R-001', 'AC-001', 'INV-001'],
      },
    },
    {
      id: 'INV-001',
      type: 'invariant',
      statement: 'Client state never grants authorization.',
      protected_refs: ['R-001', 'AC-001'],
      task_refs: ['TASK-001'],
      evidence_refs: ['EVIDENCE-001'],
    },
  ];
  return approveDecisionCoverage({
    schema_version: 1,
    revision: 1,
    records,
    history: [{
      revision: 1,
      active: records.map(({ id, type }) => ({ id, type })),
      tombstones: [],
    }],
  });
}

function nonAuthorizationDecisionCoverage() {
  const coverage = decisionCoverage();
  for (const record of coverage.records) {
    record.statement = record.type === 'invariant'
      ? 'Normalization remains deterministic.'
      : 'Normalize an order value deterministically.';
  }
  coverage.records.find(({ id }) => id === 'D-001').validation_boundary.kind = 'none';
  return approveDecisionCoverage(coverage);
}

function validationRow(overrides = {}) {
  return {
    requirement_id: 'R-001',
    acceptance_criterion_id: 'AC-001',
    invariant_refs: ['INV-001'],
    risk: 'authorization',
    boundary: {
      kind: 'authorization',
      approval_ref: 'D-001',
      source_refs: ['R-001', 'AC-001', 'INV-001'],
    },
    authorization_boundary: true,
    levels: ['api-e2e'],
    case_ids: ['case-orders-viewer-denied'],
    planned_command: 'npm run test:api -- orders-viewer-denied',
    command_source: 'package.json',
    cwd: 'packages/orders',
    evidence_class: 'FULL_E2E',
    automation: 'automated',
    expected_proof: 'The API returns a denial for an unauthorized viewer.',
    status: 'covered',
    evidence_refs: ['EVIDENCE-001'],
    rationale: null,
    owner: null,
    acknowledgement_required: false,
    module_e2e: false,
    module_id: null,
    owner_repository_id: null,
    ...overrides,
  };
}

function currentState(overrides = {}) {
  return {
    associated_HEAD_or_diff: 'diff:orders-v1',
    config_fingerprint: FINGERPRINT,
    environment_fingerprint: `sha256:v1:${'b'.repeat(64)}`,
    ...overrides,
  };
}

function passingEvidence(overrides = {}) {
  return {
    schema_version: 2,
    source: 'sdcorejs-test',
    change_ref: 'change-orders-auth',
    associated_HEAD_or_diff: 'diff:orders-v1',
    status: {
      planning: 'planned',
      authoring: 'existing',
      executability: 'ready',
      execution: 'executed',
      result: 'pass',
      evidence: 'current',
      documentation: 'not-requested',
    },
    runs: [{
      run_id: 'run-api-1',
      command: 'npm run test:api -- orders-viewer-denied',
      command_source: 'package.json',
      cwd: 'packages/orders',
      runner: 'node:test',
      package_manager: 'npm',
      environment_id: 'local-node',
      environment_class: 'local',
      evidence_class: 'FULL_E2E',
      associated_HEAD_or_diff: 'diff:orders-v1',
      config_fingerprint: FINGERPRINT,
      environment_fingerprint: `sha256:v1:${'b'.repeat(64)}`,
      repository_id: 'repo-module',
      source_fingerprint: SOURCE_FINGERPRINT,
      portal_revision: null,
      module_revision: null,
      portal_pinned_module_revision: null,
      actual_command: null,
      artifact_hashes: {},
      persona_ids: [],
      started_at: '2026-08-09T00:00:00.000Z',
      finished_at: '2026-08-09T00:00:01.000Z',
      duration: 'PT1S',
      exit_code: 0,
      passed: 1,
      failed: 0,
      skipped: 0,
      interrupted: false,
      failed_specs: [],
      first_useful_error: null,
      output_digest: `sha256:v1:${'d'.repeat(64)}`,
      artifacts_created: [],
      redactions_applied: true,
      stale: false,
    }],
    cases: [{
      case_id: 'case-orders-viewer-denied',
      requirement_refs: ['R-001', 'AC-001'],
      invariant_refs: ['INV-001'],
      test_ref: 'test/api/orders-auth.test.ts#viewer denied',
      persona_id: null,
      result: 'pass',
      evidence_run_id: 'run-api-1',
      blocker_or_error: null,
    }],
    acknowledgements: [],
    convergence_evidence_refs: ['EVIDENCE-001'],
    data_lifecycle: {
      setup_status: 'not-applicable',
      cleanup_status: 'not-applicable',
      residual_data_risk: 'none',
    },
    captures: [],
    commands_skipped: [],
    blockers: [],
    residual_risks: [],
    redactions_applied: true,
    ...overrides,
  };
}

function codes(result) {
  return result.blockers.map(({ code }) => code);
}

function evaluate({ rows = [validationRow()], evidence = passingEvidence(), coverage, current = currentState() } = {}) {
  return evaluateValidationEvidence({
    validation_map: rows,
    coverage_matrix: coverage ?? projectCoverageMatrix(rows),
    test_evidence: evidence,
    current,
    decision_coverage: decisionCoverage(),
  });
}

test('validation map accepts canonical rows and the smallest proving layer', () => {
  assert.deepEqual(VALIDATION_AUTOMATION, ['automated', 'deferred', 'manual', 'not-applicable']);
  assert.ok(VALIDATION_LEVELS.includes('unit'));
  assert.ok(VALIDATION_LEVELS.includes('api-e2e'));
  assert.deepEqual(VALIDATION_STATUSES, ['covered', 'deferred', 'missing', 'not-applicable', 'partial']);
  assert.ok(VALIDATION_EVIDENCE_CLASSES.includes('FULL_E2E'));

  const rows = [validationRow()];
  const valid = validateValidationMap(rows, { decision_coverage: decisionCoverage() });
  assert.equal(valid.valid, true, valid.blocker_messages.join('\n'));
  assert.equal(valid.approval_ready, true);
  valid.rows[0].case_ids.push('mutation');
  assert.deepEqual(rows[0].case_ids, ['case-orders-viewer-denied']);
  assert.doesNotThrow(() => assertValidationMap(rows, { decision_coverage: decisionCoverage() }));

  const unit = validateValidationMap([
    validationRow({
      risk: 'pure-transformation',
      boundary: {
        kind: 'none',
        approval_ref: 'D-001',
        source_refs: ['R-001', 'AC-001', 'INV-001'],
      },
      authorization_boundary: false,
      levels: ['unit'],
      case_ids: ['case-normalize-order'],
      planned_command: 'npm run test:unit -- normalize-order',
      evidence_class: 'UNIT',
      expected_proof: 'A focused unit case proves the pure transformation.',
    }),
  ], { decision_coverage: nonAuthorizationDecisionCoverage() });
  assert.equal(unit.valid, true, unit.blocker_messages.join('\n'));

  const workspaceRoot = validateValidationMap([
    validationRow({ cwd: '.' }),
  ], { decision_coverage: decisionCoverage() });
  assert.equal(workspaceRoot.valid, true, workspaceRoot.blocker_messages.join('\n'));
});

test('authorization rows require server or API denial evidence', () => {
  const result = validateValidationMap([
    validationRow({ levels: ['browser-e2e'], evidence_class: 'FULL_E2E' }),
  ], { decision_coverage: decisionCoverage() });
  assert.equal(result.valid, false);
  assert.ok(codes(result).includes('AUTHORIZATION_API_DENIAL_MISSING'));

  for (const risk of ['authorization-boundary', 'HTTP contract or authorization', 'permissions', 'RBAC', 'tenant isolation']) {
    const aliased = validateValidationMap([
      validationRow({ risk, authorization_boundary: false, levels: ['browser-e2e'] }),
    ], { decision_coverage: decisionCoverage() });
    assert.equal(aliased.valid, false, risk);
    assert.ok(
      codes(aliased).some((code) => ['AUTHORIZATION_BOUNDARY_MISMATCH', 'AUTHORIZATION_API_DENIAL_MISSING'].includes(code)),
      `${risk}: ${aliased.blocker_messages.join('\n')}`,
    );
  }

  const downgraded = validationRow({
    risk: 'tenant isolation',
    boundary: {
      kind: 'none',
      approval_ref: 'D-001',
      source_refs: ['R-001', 'AC-001', 'INV-001'],
    },
    authorization_boundary: false,
    levels: ['browser-e2e'],
  });
  const downgradeResult = validateValidationMap([downgraded], {
    decision_coverage: decisionCoverage(),
  });
  assert.equal(downgradeResult.valid, false);
  assert.ok(codes(downgradeResult).includes('BOUNDARY_KIND_MISMATCH'));

  const forged = structuredClone(downgraded);
  forged.boundary.approval_ref = 'D-999';
  const forgedResult = validateValidationMap([forged], {
    decision_coverage: decisionCoverage(),
  });
  assert.equal(forgedResult.valid, false);
  assert.ok(codes(forgedResult).includes('BOUNDARY_APPROVAL_DANGLING'));

  const coMutableCoverage = decisionCoverage();
  coMutableCoverage.records.find(({ id }) => id === 'D-001').validation_boundary.kind = 'none';
  const coMutableRow = validationRow({
    boundary: {
      kind: 'none',
      approval_ref: 'D-001',
      source_refs: ['R-001', 'AC-001', 'INV-001'],
    },
    authorization_boundary: false,
    levels: ['browser-e2e'],
  });
  const coMutation = validateValidationMap([coMutableRow], {
    decision_coverage: coMutableCoverage,
  });
  assert.equal(coMutation.valid, false);
  assert.ok(codes(coMutation).includes('DECISION_COVERAGE_APPROVAL_INVALID'));
});

test('row schema fails closed for malformed identities, enums, commands, paths, and thresholds', () => {
  const mutations = [
    ['malformed row', (rows) => { rows[0] = null; }, 'ROW_INVALID'],
    ['requirement ID', (rows) => { rows[0].requirement_id = 'REQ-1'; }, 'REQUIREMENT_ID_INVALID'],
    ['dangling AC', (rows) => { rows[0].acceptance_criterion_id = 'AC-999'; }, 'AC_REFERENCE_DANGLING'],
    ['dangling invariant', (rows) => { rows[0].invariant_refs = ['INV-999']; }, 'INVARIANT_REFERENCE_DANGLING'],
    ['bad level', (rows) => { rows[0].levels = ['everything-e2e']; }, 'LEVEL_INVALID'],
    ['bad class', (rows) => { rows[0].evidence_class = 'full-e2e'; }, 'EVIDENCE_CLASS_INVALID'],
    ['bad automation', (rows) => { rows[0].automation = 'sometimes'; }, 'AUTOMATION_INVALID'],
    ['bad status', (rows) => { rows[0].status = 'passed'; }, 'STATUS_INVALID'],
    ['missing command', (rows) => { rows[0].planned_command = null; }, 'PLANNED_COMMAND_REQUIRED'],
    ['unsafe cwd', (rows) => { rows[0].cwd = '../outside'; }, 'CWD_INVALID'],
    ['numeric threshold', (rows) => { rows[0].coverage_threshold = 80; }, 'NUMERIC_THRESHOLD_FORBIDDEN'],
    ['string threshold', (rows) => { rows[0].coverage_threshold = '80%'; }, 'NUMERIC_THRESHOLD_FORBIDDEN'],
    ['nested threshold', (rows) => { rows[0].coverage = { threshold: 80 }; }, 'NUMERIC_THRESHOLD_FORBIDDEN'],
    ['missing authorization flag', (rows) => { delete rows[0].authorization_boundary; }, 'AUTHORIZATION_BOUNDARY_INVALID'],
    ['missing approved boundary', (rows) => { delete rows[0].boundary; }, 'BOUNDARY_METADATA_INVALID'],
    ['missing module scope flag', (rows) => { delete rows[0].module_e2e; }, 'MODULE_E2E_INVALID'],
    ['deferred policy', (rows) => {
      rows[0].status = 'deferred';
      rows[0].rationale = 'Waiting for the owned environment.';
    }, 'OWNER_REQUIRED'],
    ['not-applicable mismatch', (rows) => { rows[0].automation = 'not-applicable'; }, 'AUTOMATION_STATUS_MISMATCH'],
  ];
  for (const [name, mutate, code] of mutations) {
    const rows = [validationRow()];
    mutate(rows);
    let result;
    assert.doesNotThrow(() => { result = validateValidationMap(rows, { decision_coverage: decisionCoverage() }); }, name);
    assert.equal(result.valid, false, name);
    assert.ok(codes(result).includes(code), `${name}: ${result.blocker_messages.join('\n')}`);
    assert.deepEqual(result.blocker_messages, [...result.blocker_messages].sort(), name);
  }
});

test('protected invariants and evidence references cannot be omitted or moved across typed fields', () => {
  const missingProtection = validationRow({ invariant_refs: [], evidence_refs: [] });
  const planResult = validateValidationMap([missingProtection], {
    decision_coverage: decisionCoverage(),
  });
  assert.equal(planResult.valid, false);
  assert.ok(codes(planResult).includes('PROTECTED_INVARIANT_MISSING'));
  assert.ok(codes(planResult).includes('PROTECTED_EVIDENCE_MISSING'));

  const evidence = passingEvidence();
  evidence.cases[0].requirement_refs = [];
  evidence.cases[0].invariant_refs = ['R-001', 'AC-001', 'INV-001'];
  const swapped = evaluate({ evidence });
  assert.equal(swapped.ready, false);
  assert.ok(codes(swapped).includes('CASE_REQUIREMENT_TRACE_MISMATCH'));
  assert.ok(codes(swapped).includes('CASE_INVARIANT_TRACE_INVALID'));

  const danglingPlanEvidence = validateValidationMap([
    validationRow({ evidence_refs: ['EVIDENCE-001', 'EVIDENCE-999'] }),
  ], { decision_coverage: decisionCoverage() });
  assert.equal(danglingPlanEvidence.valid, false);
  assert.ok(codes(danglingPlanEvidence).includes('EVIDENCE_REFERENCE_DANGLING'));

  const danglingInvariant = passingEvidence();
  danglingInvariant.cases[0].invariant_refs.push('INV-999');
  const danglingCase = evaluate({ evidence: danglingInvariant });
  assert.equal(danglingCase.ready, false);
  assert.ok(codes(danglingCase).includes('CASE_INVARIANT_TRACE_DANGLING'));

  const unconsumedDanglingInvariant = passingEvidence();
  unconsumedDanglingInvariant.cases.push({
    ...structuredClone(unconsumedDanglingInvariant.cases[0]),
    case_id: 'case-unconsumed-dangling-invariant',
    invariant_refs: ['INV-999'],
  });
  const unconsumedDanglingCase = evaluate({ evidence: unconsumedDanglingInvariant });
  assert.equal(unconsumedDanglingCase.ready, false);
  assert.ok(codes(unconsumedDanglingCase).includes('CASE_INVARIANT_TRACE_DANGLING'));

  const missingCurrentEvidenceRef = passingEvidence({ convergence_evidence_refs: [] });
  const missingCurrentRefResult = evaluate({ evidence: missingCurrentEvidenceRef });
  assert.equal(missingCurrentRefResult.ready, false);
  assert.ok(codes(missingCurrentRefResult).includes('CURRENT_EVIDENCE_REF_MISSING'));
});

test('every AC is mapped and case IDs remain globally unique', () => {
  assert.ok(codes(validateValidationMap([], { decision_coverage: decisionCoverage() })).includes('AC_VALIDATION_MISSING'));
  const duplicate = validateValidationMap([
    validationRow(),
    validationRow({ risk: 'regression' }),
  ], { decision_coverage: decisionCoverage() });
  assert.ok(codes(duplicate).includes('CASE_ID_DUPLICATE'));

  const partial = validateValidationMap([
    validationRow({ status: 'partial' }),
  ], { decision_coverage: decisionCoverage() });
  assert.equal(partial.valid, true);
  assert.equal(partial.approval_ready, false);
  assert.ok(partial.readiness_blockers.some(({ code }) => code === 'VALIDATION_STATUS_BLOCKING'));
  assert.throws(
    () => assertValidationMap([validationRow({ status: 'missing' })], { decision_coverage: decisionCoverage() }),
    /validation map blocked/iu,
  );
});

test('manual and deferred rows require rationale, owner, and acknowledgement policy and never auto-pass', () => {
  const manual = validationRow({
    risk: 'policy-acceptance',
    levels: ['api-e2e', 'uat'],
    case_ids: ['case-manual-uat'],
    planned_command: null,
    command_source: 'manual',
    evidence_class: 'SUPPLEMENTAL_SMOKE',
    automation: 'manual',
    expected_proof: 'An authorized product owner confirms the workflow.',
    status: 'covered',
    rationale: 'The workflow requires a human policy decision.',
    owner: 'product-owner',
    acknowledgement_required: true,
  });
  const rows = [validationRow(), manual];
  assert.equal(validateValidationMap(rows, { decision_coverage: decisionCoverage() }).valid, true);
  const result = evaluate({ rows });
  assert.equal(result.ready, false);
  assert.notEqual(result.result, 'PASS');
  assert.ok(codes(result).includes('MANUAL_ACKNOWLEDGEMENT_REQUIRED'));

  const acknowledgedEvidence = passingEvidence({
    acknowledgements: [{
      case_id: 'case-manual-uat',
      acknowledged_by: 'product-owner',
      associated_HEAD_or_diff: 'diff:orders-v1',
    }],
  });
  const acknowledged = evaluate({ rows, evidence: acknowledgedEvidence });
  assert.equal(acknowledged.ready, true, acknowledged.blocker_messages.join('\n'));
  assert.equal(acknowledged.result, 'MANUAL');

  const wrongActor = passingEvidence({
    acknowledgements: [{
      case_id: 'case-manual-uat',
      acknowledged_by: 'unapproved-reviewer',
      associated_HEAD_or_diff: 'diff:orders-v1',
    }],
  });
  const actorResult = evaluate({ rows, evidence: wrongActor });
  assert.equal(actorResult.ready, false);
  assert.ok(codes(actorResult).includes('MANUAL_ACKNOWLEDGEMENT_OWNER_MISMATCH'));

  const staleManualEvidence = passingEvidence({
    associated_HEAD_or_diff: 'diff:stale',
    acknowledgements: [{
      case_id: 'case-manual-uat',
      acknowledged_by: 'product-owner',
      associated_HEAD_or_diff: 'diff:orders-v1',
    }],
  });
  const staleManual = evaluate({ rows, evidence: staleManualEvidence });
  assert.equal(staleManual.ready, false);
  assert.ok(codes(staleManual).includes('HEAD_DIFF_MISMATCH'));

  for (const field of ['rationale', 'owner', 'acknowledgement_required']) {
    const broken = structuredClone(manual);
    broken[field] = field === 'acknowledgement_required' ? false : null;
    assert.equal(validateValidationMap([validationRow(), broken], { decision_coverage: decisionCoverage() }).valid, false, field);
  }
  const commandBearingManual = structuredClone(manual);
  commandBearingManual.planned_command = 'npm run test:uat';
  commandBearingManual.command_source = 'package.json';
  assert.ok(codes(validateValidationMap([
    validationRow(),
    commandBearingManual,
  ], { decision_coverage: decisionCoverage() })).includes('MANUAL_COMMAND_INVALID'));
  const deferred = validateValidationMap([
    validationRow(),
    { ...manual, automation: 'deferred', status: 'deferred' },
  ], { decision_coverage: decisionCoverage() });
  assert.equal(deferred.valid, true, deferred.blocker_messages.join('\n'));
  assert.equal(deferred.approval_ready, true);
});

test('manual-only acknowledgement survives portable handoff and evaluates as MANUAL', () => {
  const manual = validationRow({
    levels: ['api-e2e', 'uat'],
    case_ids: ['case-manual-uat'],
    planned_command: null,
    command_source: 'manual',
    evidence_class: 'SUPPLEMENTAL_SMOKE',
    automation: 'manual',
    expected_proof: 'The approved owner acknowledges the policy outcome.',
    status: 'covered',
    rationale: 'This criterion is an explicit human policy acceptance.',
    owner: 'product-owner',
    acknowledgement_required: true,
  });
  const rows = [manual];
  const evidence = passingEvidence({
    status: {
      planning: 'approved',
      authoring: 'not-requested',
      executability: 'not-applicable',
      execution: 'not-run',
      result: 'not-applicable',
      evidence: 'current',
      documentation: 'not-requested',
    },
    runs: [],
    cases: [],
    acknowledgements: [{
      case_id: 'case-manual-uat',
      acknowledged_by: 'product-owner',
      associated_HEAD_or_diff: 'diff:orders-v1',
    }],
  });
  const handoff = buildPortableHandoff({
    contextType: 'test_evidence',
    consumer: 'sdcorejs-ship',
    context: evidence,
  });
  const result = evaluate({ rows, evidence: handoff.authoritative });
  assert.equal(result.ready, true, result.blocker_messages.join('\n'));
  assert.equal(result.result, 'MANUAL');
  assert.deepEqual(result.lifecycle, [{ case_id: 'case-manual-uat', state: 'passed' }]);
});

test('coverage matrix is an exact runtime projection of planning authority', () => {
  const rows = [validationRow()];
  const projection = projectCoverageMatrix(rows);
  assert.deepEqual(projection, rows);
  projection[0].case_ids.push('mutation');
  assert.deepEqual(rows[0].case_ids, ['case-orders-viewer-denied']);
  const drifted = projectCoverageMatrix(rows);
  drifted[0].levels = ['browser-e2e'];
  const result = evaluate({ rows, coverage: drifted });
  assert.equal(result.ready, false);
  assert.ok(codes(result).includes('COVERAGE_MATRIX_DRIFT'));
});

test('planned, authored, executed, and passed remain distinct lifecycle states', () => {
  const planned = evaluate({ evidence: passingEvidence({ runs: [], cases: [] }) });
  assert.equal(planned.lifecycle[0].state, 'planned');
  assert.equal(planned.ready, false);

  const authored = evaluate({
    evidence: passingEvidence({
      runs: [],
      cases: [{
        ...passingEvidence().cases[0],
        result: 'not-run',
        evidence_run_id: null,
      }],
    }),
  });
  assert.equal(authored.lifecycle[0].state, 'authored');
  assert.equal(authored.ready, false);

  const failedRun = passingEvidence();
  failedRun.runs[0].exit_code = 1;
  failedRun.runs[0].failed = 1;
  failedRun.cases[0].result = 'fail';
  const executed = evaluate({ evidence: failedRun });
  assert.equal(executed.lifecycle[0].state, 'executed');
  assert.equal(executed.ready, false);

  const passed = evaluate();
  assert.equal(passed.lifecycle[0].state, 'passed');
  assert.equal(passed.ready, true, passed.blocker_messages.join('\n'));
  assert.equal(passed.result, 'PASS');
});

test('an unrelated passing run cannot satisfy an absent mapped AC case', () => {
  const evidence = passingEvidence();
  evidence.cases[0].case_id = 'case-unrelated-green-test';
  evidence.cases[0].requirement_refs = ['R-001'];
  const result = evaluate({ evidence });
  assert.equal(result.ready, false);
  assert.ok(codes(result).includes('AC_EVIDENCE_MISSING'));
});

test('freshness binds exact HEAD or diff, command, cwd, config, environment, and evidence class', () => {
  const mutations = [
    ['HEAD_DIFF_MISMATCH', (evidence) => { evidence.associated_HEAD_or_diff = 'diff:stale'; }],
    ['COMMAND_MISMATCH', (evidence) => { evidence.runs[0].command = 'npm test'; }],
    ['CWD_MISMATCH', (evidence) => { evidence.runs[0].cwd = 'workspace'; }],
    ['CONFIG_FINGERPRINT_MISMATCH', (evidence) => { evidence.runs[0].config_fingerprint = `sha256:v1:${'c'.repeat(64)}`; }],
    ['ENVIRONMENT_FINGERPRINT_MISMATCH', (evidence) => { evidence.runs[0].environment_fingerprint = `sha256:v1:${'c'.repeat(64)}`; }],
    ['EVIDENCE_CLASS_MISMATCH', (evidence) => { evidence.runs[0].evidence_class = 'SUPPLEMENTAL_SMOKE'; }],
    ['EVIDENCE_STALE', (evidence) => { evidence.runs[0].stale = true; }],
  ];
  for (const [code, mutate] of mutations) {
    const evidence = passingEvidence();
    mutate(evidence);
    const result = evaluate({ evidence });
    assert.equal(result.ready, false, code);
    assert.ok(codes(result).includes(code), `${code}: ${result.blocker_messages.join('\n')}`);
    assert.notEqual(result.lifecycle[0].state, 'passed', code);
  }
});

test('contradictory top-level v2 evidence cannot return PASS', () => {
  const mutations = [
    ['TEST_STATUS_NOT_READY', (evidence) => { evidence.status.result = 'fail'; }],
    ['TEST_STATUS_NOT_READY', (evidence) => { evidence.status.evidence = 'stale'; }],
    ['TEST_EVIDENCE_BLOCKED', (evidence) => { evidence.blockers = ['environment unresolved']; }],
    ['COMMANDS_SKIPPED', (evidence) => { evidence.commands_skipped = ['npm run test:api']; }],
    ['DATA_LIFECYCLE_INCOMPLETE', (evidence) => { evidence.data_lifecycle.cleanup_status = 'failed'; }],
    ['REDACTION_REQUIRED', (evidence) => { evidence.redactions_applied = false; }],
  ];
  for (const [code, mutate] of mutations) {
    const evidence = passingEvidence();
    mutate(evidence);
    const result = evaluate({ evidence });
    assert.equal(result.ready, false, code);
    assert.ok(codes(result).includes(code), `${code}: ${result.blocker_messages.join('\n')}`);
  }
});

test('malformed or uncloneable map and evidence inputs fail closed without throwing', () => {
  const rows = [validationRow()];
  rows[0].unsafe = () => {};
  let mapResult;
  assert.doesNotThrow(() => {
    mapResult = validateValidationMap(rows, { decision_coverage: decisionCoverage() });
  });
  assert.ok(codes(mapResult).includes('VALIDATION_MAP_NOT_CLONEABLE'));

  let evidenceResult;
  assert.doesNotThrow(() => {
    evidenceResult = evaluateValidationEvidence({
      validation_map: rows,
      coverage_matrix: [],
      test_evidence: passingEvidence(),
      current: currentState(),
      decision_coverage: decisionCoverage(),
    });
  });
  assert.equal(evidenceResult.ready, false);
  assert.ok(codes(evidenceResult).includes('VALIDATION_MAP_NOT_CLONEABLE'));

  const wrongSource = evaluate({ evidence: passingEvidence({ source: 'legacy-runner' }) });
  assert.ok(codes(wrongSource).includes('TEST_EVIDENCE_INVALID'));
  const weakFingerprint = evaluate({ current: currentState({ config_fingerprint: 'config-v1' }) });
  assert.ok(codes(weakFingerprint).includes('CURRENT_STATE_INVALID'));

  for (const [field, value] of [
    ['case_ids', 42],
    ['case_ids', {}],
    ['invariant_refs', 42],
    ['evidence_refs', {}],
  ]) {
    const malformedRows = [validationRow({ [field]: value })];
    let malformedResult;
    assert.doesNotThrow(() => {
      malformedResult = evaluate({ rows: malformedRows });
    }, field);
    assert.equal(malformedResult.ready, false, field);
  }
});

test('module full E2E delegates complete provenance to the canonical module contract', () => {
  const portalRevision = '1'.repeat(40);
  const moduleRevision = '2'.repeat(40);
  const repositoryId = 'github.com/acme/orders';
  const manifest = {
    schema_version: 1,
    module_id: 'orders',
    repository_id: repositoryId,
    e2e: {
      availability: 'available',
      runner: 'playwright',
      command: ['npm', 'run', 'e2e'],
      working_directory: '.',
      config_path: 'playwright.config.ts',
      evidence_path: 'test-results/e2e.json',
      test_paths: ['e2e'],
      capabilities: ['orders.read'],
      required_portal_capabilities: [],
      persona_refs: ['orders.viewer'],
      data_contract: {
        owner_repository_id: repositoryId,
        setup_owner_repository_id: repositoryId,
        cleanup_owner_repository_id: repositoryId,
      },
    },
  };
  const rows = [validationRow({
    module_e2e: true,
    module_id: 'orders',
    owner_repository_id: repositoryId,
    risk: 'critical-user-journey',
    authorization_boundary: true,
    levels: ['api-e2e', 'browser-e2e'],
    planned_command: 'npm run e2e',
    cwd: '.',
  })];
  const evidence = passingEvidence();
  Object.assign(evidence.runs[0], {
    command: 'npm run e2e',
    cwd: '.',
    repository_id: repositoryId,
    portal_revision: portalRevision,
    module_revision: moduleRevision,
    portal_pinned_module_revision: moduleRevision,
    actual_command: ['npm', 'run', 'e2e'],
    artifact_hashes: { 'test-results/e2e.json': 'e'.repeat(64) },
  });
  const current = currentState({
    module_e2e: {
      portal_repository_id: 'github.com/acme/portal',
      portal_revision: portalRevision,
      modules: [{
        module_id: 'orders',
        repository_id: repositoryId,
        revision: moduleRevision,
        pinned_revision: moduleRevision,
        available: true,
        checkout_path: 'modules/orders',
        manifest,
      }],
    },
  });
  assert.equal(evaluate({ rows, evidence, current }).ready, true);

  const mismatch = structuredClone(evidence);
  mismatch.runs[0].portal_pinned_module_revision = '3'.repeat(40);
  assert.ok(codes(evaluate({ rows, evidence: mismatch, current })).includes('MODULE_E2E_PROVENANCE_INVALID'));

  for (const mutate of [
    (candidate) => { candidate.runs[0].repository_id = 'github.com/acme/portal'; },
    (candidate) => { candidate.runs[0].source_fingerprint = null; },
    (candidate) => { candidate.runs[0].artifact_hashes = {}; },
    (candidate) => { candidate.runs[0].actual_command = ['npm', 'test']; },
  ]) {
    const incomplete = structuredClone(evidence);
    mutate(incomplete);
    const result = evaluate({ rows, evidence: incomplete, current });
    assert.equal(result.ready, false, result.blocker_messages.join('\n'));
    assert.ok(codes(result).includes('MODULE_E2E_PROVENANCE_INVALID'));
  }

  const missingScope = evaluate({ rows, evidence, current: currentState() });
  assert.equal(missingScope.ready, false);
  assert.ok(codes(missingScope).includes('MODULE_E2E_SCOPE_INVALID'));
});

test('canonical plan, test, and ship surfaces share one validation map authority', async () => {
  const [reference, scope, plan, testContext, testSkill, ship, verify, packageSource] = await Promise.all([
    readFile(new URL('../../_refs/shared/validation-map.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/shared/test-scope-and-coverage.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/shared/sdlc/03-plan.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/shared/test-context.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/tracks/test/sdcorejs-test.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/shared/workflow/ship.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/orchestration/tail/verify-before-done.md', import.meta.url), 'utf8'),
    readFile(new URL('../../package.json', import.meta.url), 'utf8'),
  ]);
  assert.match(reference, /extends.*test-scope-and-coverage|test-scope-and-coverage.*extends/is);
  assert.match(reference, /smallest proving layer/iu);
  assert.match(reference, /planned.*authored.*executed.*passed/is);
  assert.match(reference, /manual.*deferred.*owner.*acknowledgement/is);
  assert.match(reference, /numeric coverage threshold/iu);
  assert.match(scope, /validation-map\.md/u);
  assert.match(plan, /validation_map:/u);
  assert.match(testContext, /coverage_matrix.*projection/is);
  assert.match(testSkill, /_refs\/shared\/validation-map\.md/u);
  assert.match(ship, /validation map/iu);
  assert.match(verify, /evaluateValidationEvidence/u);
  const packageJson = JSON.parse(packageSource);
  assert.equal(packageJson.scripts['test:e2e:validation-map'], 'node --test test/e2e/validation-map-contract.test.mjs');
  assert.match(packageJson.scripts['test:e2e:repository'], /validation-map-contract\.test\.mjs/u);
});
