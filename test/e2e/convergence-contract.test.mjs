import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import {
  CONVERGENCE_BLOCKER_CODES,
  CONVERGENCE_DRIFT_CODES,
  CONVERGENCE_MODES,
  CONVERGENCE_SCHEMA_VERSION,
  assertConvergence,
  createConvergenceReceiptArtifact,
  evaluateConvergence,
  evaluateConvergenceHandoff,
  validateConvergenceInput,
} from '../../_refs/shared/convergence-contract.mjs';

const REVISION_A = 'a'.repeat(40);
const REVISION_B = 'b'.repeat(40);
const SOURCE_FINGERPRINT = `sha256:v1:${'c'.repeat(64)}`;

function featureFixture() {
  return {
    schema_version: 1,
    mode: 'feature',
    change_ref: 'orders-create',
    thread: {
      thread_id: 'thread-orders',
      owner_thread_id: 'thread-orders',
    },
    source: {
      repository_id: 'repo-orders',
      revision: REVISION_A,
      fingerprint: SOURCE_FINGERPRINT,
      portal_revision: REVISION_A,
      module_revision_map: { orders: REVISION_B },
      pinned_module_revision_map: { orders: REVISION_B },
    },
    artifacts: {
      intent_status: 'approved',
      requirement_set_status: 'current',
      decision_set_status: 'current',
      assumption_set_status: 'current',
      spec: { required: true, status: 'verified' },
      architecture: { required: true, status: 'verified' },
      plan: { required: true, status: 'verified' },
      graph_status: 'verified',
      hash_status: 'verified',
    },
    approved_scope: {
      paths: ['src/orders.mjs', 'src/order-audit.mjs'],
      symbols: ['src/orders.mjs#createOrder', 'src/order-audit.mjs#recordOrder'],
    },
    requirements: [
      {
        id: 'R-001',
        acceptance_criterion_refs: ['AC-001'],
        task_refs: ['TASK-001'],
        evidence_refs: ['EVIDENCE-001'],
      },
    ],
    acceptance_criteria: [
      {
        id: 'AC-001',
        requirement_refs: ['R-001'],
        task_refs: ['TASK-001'],
        evidence_refs: ['EVIDENCE-001'],
      },
    ],
    invariants: [{ id: 'INV-001' }],
    risks: [{ id: 'RISK-001' }],
    tasks: [
      {
        id: 'TASK-001',
        status: 'executed',
        requirement_refs: ['R-001'],
        acceptance_criterion_refs: ['AC-001'],
        invariant_refs: ['INV-001'],
        risk_refs: ['RISK-001'],
        planned_paths: ['src/orders.mjs'],
        changed_path_refs: ['src/orders.mjs'],
        changed_symbol_refs: ['src/orders.mjs#createOrder'],
        evidence_refs: ['EVIDENCE-001'],
      },
    ],
    changes: [
      {
        path: 'src/orders.mjs',
        symbols: ['src/orders.mjs#createOrder'],
        task_refs: ['TASK-001'],
        requirement_refs: ['R-001'],
        acceptance_criterion_refs: ['AC-001'],
        invariant_refs: ['INV-001'],
      },
    ],
    validation_map: [
      {
        requirement_id: 'R-001',
        acceptance_criterion_id: 'AC-001',
        invariant_refs: ['INV-001'],
        risk: 'RISK-001',
        case_ids: ['case-create-order'],
        automation: 'automated',
        status: 'covered',
        evidence_refs: ['EVIDENCE-001'],
        rationale: null,
        owner: null,
        acknowledgement_required: false,
      },
    ],
    evidence: [
      {
        id: 'EVIDENCE-001',
        result: 'PASSED',
        freshness: 'current',
        requirement_refs: ['R-001'],
        acceptance_criterion_refs: ['AC-001'],
        task_refs: ['TASK-001'],
        invariant_refs: ['INV-001'],
        path_refs: ['src/orders.mjs'],
        symbol_refs: ['src/orders.mjs#createOrder'],
        case_ids: ['case-create-order'],
        source_revision: REVISION_A,
        source_fingerprint: SOURCE_FINGERPRINT,
        portal_revision: REVISION_A,
        module_revision_map: { orders: REVISION_B },
      },
    ],
    architecture: {
      required: true,
      snapshot_status: 'verified',
      conformance_status: 'conformant',
      evidence_status: 'current',
      conflicted: false,
      violated_invariant_refs: [],
    },
    conventions: {
      evidence_status: 'current',
      conflicted: false,
      accepted_violations: [],
      observed_findings: [
        { id: 'CONVENTION-CANDIDATE-001', blocking: false, repair_authorized: false },
      ],
    },
    public_contract: {
      changed: true,
      migration_decision_status: 'approved',
    },
    generated_mirrors: { required: true, status: 'current' },
    summary: {
      required: true,
      status: 'current',
      dependency_fingerprint_status: 'current',
    },
    toolchain: {
      dependency_fingerprint_status: 'current',
      manifest_status: 'current',
      lockfile_status: 'current',
      runtime_engine_status: 'compatible',
    },
    ledgers: {
      product: { required: true, status: 'current' },
      design: { required: false, status: 'not-applicable' },
      documentation: { required: false, status: 'not-applicable' },
    },
    lifecycle: {
      verification_revision: REVISION_A,
      branch_ready_revision: null,
      writes_after_verification: [],
      writes_after_branch_ready: [],
      artifact_closure_status: 'complete',
      artifact_thread_id: 'thread-orders',
    },
    debug: { status: 'not-applicable', reproduction_status: 'not-applicable', evidence_refs: [] },
    docs_hygiene: {
      status: 'not-applicable',
      changed_scope_status: 'not-applicable',
      evidence_refs: [],
    },
    dependency_regression: {
      status: 'not-applicable',
      changed_scope_status: 'not-applicable',
      manifest_paths: [],
      evidence_refs: [],
    },
  };
}

function modeFixture(mode) {
  if (mode === 'feature') return featureFixture();

  const changedPath = {
    bugfix: 'src/order-fix.mjs',
    'docs-only': 'docs/orders.md',
    'dependency-regression': 'package.json',
  }[mode];
  const changedSymbols =
    mode === 'bugfix' ? ['src/order-fix.mjs#repairOrder'] : [];
  const input = {
    schema_version: 1,
    mode,
    change_ref: `orders-${mode}`,
    thread: { thread_id: 'thread-orders', owner_thread_id: 'thread-orders' },
    source: {
      repository_id: 'repo-orders',
      revision: REVISION_A,
      fingerprint: SOURCE_FINGERPRINT,
      portal_revision: REVISION_A,
      module_revision_map: { orders: REVISION_B },
      pinned_module_revision_map: { orders: REVISION_B },
    },
    artifacts: {
      intent_status: 'not-applicable',
      requirement_set_status: 'not-applicable',
      decision_set_status: 'not-applicable',
      assumption_set_status: 'not-applicable',
      spec: { required: false, status: 'not-applicable' },
      architecture: { required: false, status: 'not-applicable' },
      plan: { required: false, status: 'not-applicable' },
      graph_status: 'not-applicable',
      hash_status: 'not-applicable',
    },
    approved_scope: { paths: [changedPath], symbols: changedSymbols },
    requirements: [],
    acceptance_criteria: [],
    invariants: [],
    risks: [],
    tasks: [
      {
        id: 'TASK-001',
        status: 'executed',
        requirement_refs: [],
        acceptance_criterion_refs: [],
        invariant_refs: [],
        risk_refs: [],
        planned_paths: [changedPath],
        changed_path_refs: [changedPath],
        changed_symbol_refs: changedSymbols,
        evidence_refs: ['EVIDENCE-001'],
      },
    ],
    changes: [
      {
        path: changedPath,
        symbols: changedSymbols,
        task_refs: ['TASK-001'],
        requirement_refs: [],
        acceptance_criterion_refs: [],
        invariant_refs: [],
      },
    ],
    validation_map: [],
    evidence: [
      {
        id: 'EVIDENCE-001',
        result: 'PASSED',
        freshness: 'current',
        requirement_refs: [],
        acceptance_criterion_refs: [],
        task_refs: ['TASK-001'],
        invariant_refs: [],
        path_refs: [changedPath],
        symbol_refs: changedSymbols,
        case_ids: [],
        source_revision: REVISION_A,
        source_fingerprint: SOURCE_FINGERPRINT,
        portal_revision: REVISION_A,
        module_revision_map: { orders: REVISION_B },
      },
    ],
    architecture: {
      required: false,
      snapshot_status: 'not-applicable',
      conformance_status: 'not-applicable',
      evidence_status: 'not-applicable',
      conflicted: false,
      violated_invariant_refs: [],
    },
    conventions: {
      evidence_status: 'current',
      conflicted: false,
      accepted_violations: [],
      observed_findings: [],
    },
    public_contract: { changed: false, migration_decision_status: 'not-applicable' },
    generated_mirrors: { required: false, status: 'not-applicable' },
    summary: {
      required: false,
      status: 'not-applicable',
      dependency_fingerprint_status: 'current',
    },
    toolchain: {
      dependency_fingerprint_status: 'current',
      manifest_status: 'current',
      lockfile_status: 'current',
      runtime_engine_status: 'compatible',
    },
    ledgers: {
      product: { required: false, status: 'not-applicable' },
      design: { required: false, status: 'not-applicable' },
      documentation: { required: false, status: 'not-applicable' },
    },
    lifecycle: {
      verification_revision: REVISION_A,
      branch_ready_revision: null,
      writes_after_verification: [],
      writes_after_branch_ready: [],
      artifact_closure_status: 'complete',
      artifact_thread_id: 'thread-orders',
    },
    debug: { status: 'not-applicable', reproduction_status: 'not-applicable', evidence_refs: [] },
    docs_hygiene: {
      status: 'not-applicable',
      changed_scope_status: 'not-applicable',
      evidence_refs: [],
    },
    dependency_regression: {
      status: 'not-applicable',
      changed_scope_status: 'not-applicable',
      manifest_paths: [],
      evidence_refs: [],
    },
  };

  if (mode === 'bugfix') {
    input.debug = {
      status: 'ready',
      reproduction_status: 'reproduced',
      evidence_refs: ['EVIDENCE-001'],
    };
  } else if (mode === 'docs-only') {
    input.docs_hygiene = {
      status: 'passed',
      changed_scope_status: 'documentation-only',
      evidence_refs: ['EVIDENCE-001'],
    };
    input.ledgers.documentation = { required: true, status: 'current' };
  } else if (mode === 'dependency-regression') {
    input.dependency_regression = {
      status: 'passed',
      changed_scope_status: 'dependency-only',
      manifest_paths: ['package.json'],
      evidence_refs: ['EVIDENCE-001'],
    };
  }
  return input;
}

function clone(value) {
  return structuredClone(value);
}

test('convergence contract exposes a stable v1 vocabulary with exactly twenty drift guards', () => {
  assert.equal(CONVERGENCE_SCHEMA_VERSION, 1);
  assert.deepEqual(CONVERGENCE_MODES, [
    'feature',
    'bugfix',
    'docs-only',
    'dependency-regression',
  ]);
  assert.equal(Object.values(CONVERGENCE_DRIFT_CODES).length, 20);
  assert.equal(new Set(Object.values(CONVERGENCE_DRIFT_CODES)).size, 20);
  assert.equal(typeof validateConvergenceInput, 'function');
  assert.equal(typeof evaluateConvergence, 'function');
  assert.equal(typeof assertConvergence, 'function');
});

test('a current full feature chain converges with a compact deterministic result', () => {
  const input = featureFixture();
  assert.deepEqual(validateConvergenceInput(input), { valid: true, errors: [] });

  const first = evaluateConvergence(input);
  const second = evaluateConvergence(clone(input));
  assert.deepEqual(second, first);
  assert.equal(first.status, 'CONVERGED');
  assert.equal(first.fresh, true);
  assert.deepEqual(first.blockers, []);
  assert.deepEqual(first.blocker_codes, []);
  assert.deepEqual(first.evidence_refs, ['EVIDENCE-001']);
  assert.deepEqual(first.source_identity, {
    repository_id: 'repo-orders',
    revision: REVISION_A,
    fingerprint: SOURCE_FINGERPRINT,
    portal_revision: REVISION_A,
    module_revision_map: { orders: REVISION_B },
    pinned_module_revision_map: { orders: REVISION_B },
    owner_thread_id: 'thread-orders',
  });
  assert.deepEqual(Object.keys(first).sort(), [
    'blocker_codes',
    'blockers',
    'change_ref',
    'evidence_refs',
    'fresh',
    'mode',
    'provenance',
    'schema_version',
    'source_identity',
    'status',
    'summary',
  ]);
  assert.equal('input' in first, false);
});

test('semantically equivalent revision-map order produces byte-identical results', () => {
  const first = featureFixture();
  first.source.module_revision_map = { billing: REVISION_A, orders: REVISION_B };
  first.source.pinned_module_revision_map = { billing: REVISION_A, orders: REVISION_B };
  first.evidence[0].module_revision_map = { billing: REVISION_A, orders: REVISION_B };

  const reordered = clone(first);
  reordered.source.module_revision_map = { orders: REVISION_B, billing: REVISION_A };
  reordered.source.pinned_module_revision_map = { orders: REVISION_B, billing: REVISION_A };
  reordered.evidence[0].module_revision_map = { orders: REVISION_B, billing: REVISION_A };

  assert.equal(
    JSON.stringify(evaluateConvergence(reordered)),
    JSON.stringify(evaluateConvergence(first)),
  );

  const blocked = featureFixture();
  blocked.invariants.push({ id: 'INV-002' });
  blocked.architecture.violated_invariant_refs = ['INV-002', 'INV-001'];
  blocked.conventions.accepted_violations = ['CONV-002', 'CONV-001'];
  blocked.conventions.observed_findings = [
    { id: 'CONVENTION-CANDIDATE-002', blocking: true, repair_authorized: false },
    { id: 'CONVENTION-CANDIDATE-001', blocking: true, repair_authorized: false },
  ];
  const blockedReordered = clone(blocked);
  blockedReordered.architecture.violated_invariant_refs.reverse();
  blockedReordered.conventions.accepted_violations.reverse();
  blockedReordered.conventions.observed_findings.reverse();
  assert.equal(
    JSON.stringify(evaluateConvergence(blockedReordered)),
    JSON.stringify(evaluateConvergence(blocked)),
  );
});

test('feature, bugfix, docs-only, and dependency-regression modes require their own evidence chain', () => {
  for (const mode of CONVERGENCE_MODES) {
    const result = evaluateConvergence(modeFixture(mode));
    assert.equal(result.status, 'CONVERGED', `${mode}: ${JSON.stringify(result.blockers)}`);
  }

  const bugfix = modeFixture('bugfix');
  bugfix.debug.reproduction_status = 'missing';
  assert.deepEqual(evaluateConvergence(bugfix).blocker_codes, [
    CONVERGENCE_BLOCKER_CODES.BUGFIX_DEBUG_REPRO_REQUIRED,
  ]);

  const docsOnly = modeFixture('docs-only');
  docsOnly.docs_hygiene.status = 'failed';
  assert.deepEqual(evaluateConvergence(docsOnly).blocker_codes, [
    CONVERGENCE_BLOCKER_CODES.DOCS_HYGIENE_REQUIRED,
  ]);

  const dependency = modeFixture('dependency-regression');
  dependency.dependency_regression.status = 'not-run';
  assert.deepEqual(evaluateConvergence(dependency).blocker_codes, [
    CONVERGENCE_BLOCKER_CODES.DEPENDENCY_REGRESSION_REQUIRED,
  ]);
});

test('every mode rejects vacuous evidence and scope instead of passing empty collections', () => {
  const feature = featureFixture();
  for (const field of [
    'requirements',
    'acceptance_criteria',
    'invariants',
    'risks',
    'tasks',
    'changes',
    'validation_map',
    'evidence',
  ]) {
    feature[field] = [];
  }
  assert.ok(
    evaluateConvergence(feature).blocker_codes.includes(
      CONVERGENCE_BLOCKER_CODES.FEATURE_CHAIN_INCOMPLETE,
    ),
  );

  for (const mode of ['bugfix', 'docs-only', 'dependency-regression']) {
    const input = modeFixture(mode);
    for (const field of [
      'requirements',
      'acceptance_criteria',
      'invariants',
      'risks',
      'tasks',
      'changes',
      'validation_map',
      'evidence',
    ]) {
      input[field] = [];
    }
    input.debug.evidence_refs = [];
    input.docs_hygiene.evidence_refs = [];
    input.dependency_regression.evidence_refs = [];
    const result = evaluateConvergence(input);
    const expected = {
      bugfix: CONVERGENCE_BLOCKER_CODES.BUGFIX_DEBUG_REPRO_REQUIRED,
      'docs-only': CONVERGENCE_BLOCKER_CODES.DOCS_HYGIENE_REQUIRED,
      'dependency-regression': CONVERGENCE_BLOCKER_CODES.DEPENDENCY_REGRESSION_REQUIRED,
    }[mode];
    assert.ok(result.blocker_codes.includes(expected), `${mode}: ${JSON.stringify(result.blockers)}`);
  }
});

test('docs and dependency modes consume explicit scope classifications', () => {
  const rootDoc = modeFixture('docs-only');
  rootDoc.approved_scope.paths = ['CONTRIBUTING.md'];
  rootDoc.tasks[0].planned_paths = ['CONTRIBUTING.md'];
  rootDoc.tasks[0].changed_path_refs = ['CONTRIBUTING.md'];
  rootDoc.changes[0].path = 'CONTRIBUTING.md';
  rootDoc.evidence[0].path_refs = ['CONTRIBUTING.md'];
  assert.equal(evaluateConvergence(rootDoc).status, 'CONVERGED');

  const executableDocsPath = modeFixture('docs-only');
  executableDocsPath.docs_hygiene.changed_scope_status = 'mixed';
  executableDocsPath.approved_scope.paths = ['docs/tool.js'];
  executableDocsPath.tasks[0].planned_paths = ['docs/tool.js'];
  executableDocsPath.tasks[0].changed_path_refs = ['docs/tool.js'];
  executableDocsPath.changes[0].path = 'docs/tool.js';
  executableDocsPath.evidence[0].path_refs = ['docs/tool.js'];
  assert.ok(
    evaluateConvergence(executableDocsPath).blocker_codes.includes(
      CONVERGENCE_BLOCKER_CODES.DOCS_HYGIENE_REQUIRED,
    ),
  );

  const sourceChange = modeFixture('dependency-regression');
  sourceChange.dependency_regression.changed_scope_status = 'mixed';
  sourceChange.approved_scope.paths = ['src/orders.mjs'];
  sourceChange.tasks[0].planned_paths = ['src/orders.mjs'];
  sourceChange.tasks[0].changed_path_refs = ['src/orders.mjs'];
  sourceChange.changes[0].path = 'src/orders.mjs';
  sourceChange.evidence[0].path_refs = ['src/orders.mjs'];
  assert.ok(
    evaluateConvergence(sourceChange).blocker_codes.includes(
      CONVERGENCE_BLOCKER_CODES.DEPENDENCY_REGRESSION_REQUIRED,
    ),
  );
});

test('manual and deferred validation remain deferred even when supplied evidence says PASSED', () => {
  for (const automation of ['manual', 'deferred']) {
    const input = featureFixture();
    input.validation_map[0].automation = automation;
    input.validation_map[0].status = 'deferred';
    input.validation_map[0].rationale = 'A human owner must verify the external behavior.';
    input.validation_map[0].owner = 'release-owner';
    input.validation_map[0].acknowledgement_required = true;
    const result = evaluateConvergence(input);
    assert.equal(result.status, 'DEFERRED');
    assert.deepEqual(result.blocker_codes, [
      CONVERGENCE_BLOCKER_CODES.MANUAL_OR_DEFERRED_EVIDENCE,
    ]);
    assert.throws(() => assertConvergence(input), /MANUAL_OR_DEFERRED_EVIDENCE/u);
  }

  const automatedButDeferred = featureFixture();
  automatedButDeferred.validation_map[0].status = 'deferred';
  const validation = validateConvergenceInput(automatedButDeferred);
  assert.equal(validation.valid, false);
  assert.deepEqual(
    validation.errors.map(({ code }) => code),
    ['ACKNOWLEDGEMENT_REQUIRED', 'TEXT_REQUIRED', 'TEXT_REQUIRED'],
  );
  automatedButDeferred.validation_map[0].rationale = 'The automated environment is unavailable.';
  automatedButDeferred.validation_map[0].owner = 'release-owner';
  automatedButDeferred.validation_map[0].acknowledgement_required = true;
  const deferred = evaluateConvergence(automatedButDeferred);
  assert.equal(deferred.status, 'DEFERRED');
  assert.deepEqual(deferred.blocker_codes, [
    CONVERGENCE_BLOCKER_CODES.MANUAL_OR_DEFERRED_EVIDENCE,
  ]);
});

test('automated partial or missing validation coverage cannot converge on a passing command', () => {
  for (const status of ['partial', 'missing']) {
    const input = featureFixture();
    input.validation_map[0].status = status;
    const result = evaluateConvergence(input);
    assert.equal(result.status, 'BLOCKED');
    assert.ok(
      result.blocker_codes.includes(CONVERGENCE_DRIFT_CODES.AC_WITHOUT_PROVING_TEST),
      `${status}: ${JSON.stringify(result.blockers)}`,
    );
  }

  const emptyCases = featureFixture();
  emptyCases.validation_map[0].case_ids = [];
  emptyCases.evidence[0].case_ids = [];
  const emptyCaseResult = evaluateConvergence(emptyCases);
  assert.equal(emptyCaseResult.status, 'BLOCKED');
  assert.ok(
    emptyCaseResult.blocker_codes.includes(
      CONVERGENCE_DRIFT_CODES.AC_WITHOUT_PROVING_TEST,
    ),
    JSON.stringify(emptyCaseResult.blockers),
  );
});

test('proving evidence must link the complete AC task path symbol and invariant chain', () => {
  const mutations = [
    (input) => {
      input.evidence[0].requirement_refs = [];
    },
    (input) => {
      input.evidence[0].invariant_refs = [];
    },
    (input) => {
      input.evidence[0].path_refs = [];
    },
    (input) => {
      input.evidence[0].symbol_refs = [];
    },
    (input) => {
      input.tasks[0].changed_symbol_refs = ['src/order-audit.mjs#recordOrder'];
    },
  ];
  for (const mutate of mutations) {
    const input = featureFixture();
    mutate(input);
    const result = evaluateConvergence(input);
    assert.notEqual(result.status, 'CONVERGED');
    assert.ok(
      result.blocker_codes.some((code) =>
        [
          CONVERGENCE_DRIFT_CODES.UNRELATED_PASSING_TEST,
          CONVERGENCE_DRIFT_CODES.UNTRACED_TASK,
        ].includes(code),
      ),
      JSON.stringify(result.blockers),
    );
  }

  const freeFloating = featureFixture();
  freeFloating.evidence.push({
    ...clone(freeFloating.evidence[0]),
    id: 'EVIDENCE-002',
    acceptance_criterion_refs: [],
    case_ids: ['case-unrelated'],
  });
  const result = evaluateConvergence(freeFloating);
  assert.ok(result.blocker_codes.includes(CONVERGENCE_DRIFT_CODES.UNRELATED_PASSING_TEST));
});

test('feature graph edges are reciprocal and changed symbols belong to their changed path', () => {
  const crossedRequirement = featureFixture();
  crossedRequirement.requirements.push({
    id: 'R-002',
    acceptance_criterion_refs: ['AC-001'],
    task_refs: ['TASK-001'],
    evidence_refs: ['EVIDENCE-001'],
  });
  crossedRequirement.tasks[0].requirement_refs = ['R-002'];
  crossedRequirement.evidence[0].requirement_refs = ['R-001', 'R-002'];
  const crossedResult = evaluateConvergence(crossedRequirement);
  assert.notEqual(crossedResult.status, 'CONVERGED');
  assert.ok(
    crossedResult.blocker_codes.some((code) =>
      [
        CONVERGENCE_DRIFT_CODES.REQUIREMENT_WITHOUT_IMPLEMENTATION_OR_EVIDENCE,
        CONVERGENCE_DRIFT_CODES.UNTRACED_TASK,
      ].includes(code),
    ),
    JSON.stringify(crossedResult.blockers),
  );

  const wrongSymbolOwner = featureFixture();
  wrongSymbolOwner.changes[0].symbols = ['src/order-audit.mjs#recordOrder'];
  wrongSymbolOwner.tasks[0].changed_symbol_refs = ['src/order-audit.mjs#recordOrder'];
  wrongSymbolOwner.evidence[0].symbol_refs = ['src/order-audit.mjs#recordOrder'];
  const symbolResult = evaluateConvergence(wrongSymbolOwner);
  assert.notEqual(symbolResult.status, 'CONVERGED');
  assert.ok(
    symbolResult.blocker_codes.includes(
      CONVERGENCE_DRIFT_CODES.CHANGE_OUTSIDE_APPROVED_INTENT,
    ),
    JSON.stringify(symbolResult.blockers),
  );
});

test('each validation row must be proved by its own evidence instead of pooled evidence', () => {
  const input = featureFixture();
  input.requirements[0].evidence_refs.push('EVIDENCE-002');
  input.acceptance_criteria[0].evidence_refs.push('EVIDENCE-002');
  input.tasks[0].evidence_refs.push('EVIDENCE-002');
  input.validation_map[0].case_ids = ['case-primary'];
  input.validation_map.push({
    ...clone(input.validation_map[0]),
    case_ids: ['case-secondary'],
    evidence_refs: ['EVIDENCE-002'],
  });
  input.evidence[0].case_ids = ['case-secondary'];
  input.evidence.push({
    ...clone(input.evidence[0]),
    id: 'EVIDENCE-002',
    case_ids: ['case-primary'],
  });

  const result = evaluateConvergence(input);
  assert.notEqual(result.status, 'CONVERGED');
  assert.ok(
    result.blocker_codes.includes(CONVERGENCE_DRIFT_CODES.UNRELATED_PASSING_TEST),
    JSON.stringify(result.blockers),
  );
});

test('mode evidence references must resolve to current PASSED evidence', () => {
  for (const mode of ['bugfix', 'docs-only', 'dependency-regression']) {
    for (const mutation of [
      (input) => {
        input.evidence[0].result = 'FAILED';
      },
      (input) => {
        input.evidence[0].freshness = 'stale';
      },
    ]) {
      const input = modeFixture(mode);
      mutation(input);
      const result = evaluateConvergence(input);
      const expected = {
        bugfix: CONVERGENCE_BLOCKER_CODES.BUGFIX_DEBUG_REPRO_REQUIRED,
        'docs-only': CONVERGENCE_BLOCKER_CODES.DOCS_HYGIENE_REQUIRED,
        'dependency-regression': CONVERGENCE_BLOCKER_CODES.DEPENDENCY_REGRESSION_REQUIRED,
      }[mode];
      assert.ok(result.blocker_codes.includes(expected), `${mode}: ${JSON.stringify(result.blockers)}`);
    }
  }
});

test('every mode enforces artifacts that are explicitly declared required', () => {
  for (const mode of ['bugfix', 'docs-only', 'dependency-regression']) {
    for (const artifact of ['spec', 'plan']) {
      const input = modeFixture(mode);
      input.artifacts[artifact] = { required: true, status: 'missing' };
      const result = evaluateConvergence(input);
      assert.equal(result.status, 'BLOCKED');
      assert.ok(
        result.blocker_codes.includes(
          CONVERGENCE_BLOCKER_CODES.REQUIRED_ARTIFACT_MISSING,
        ),
        `${mode}/${artifact}: ${JSON.stringify(result.blockers)}`,
      );
    }
  }
});

test('all twenty documented drift mutations are load-bearing and fail closed', () => {
  const D = CONVERGENCE_DRIFT_CODES;
  const cases = [
    [D.REQUIREMENT_WITHOUT_IMPLEMENTATION_OR_EVIDENCE, (input) => {
      input.requirements[0].task_refs = [];
      input.requirements[0].evidence_refs = [];
    }],
    [D.AC_WITHOUT_PROVING_TEST, (input) => {
      input.evidence[0].result = 'FAILED';
    }],
    [D.UNRELATED_PASSING_TEST, (input) => {
      input.evidence[0].acceptance_criterion_refs = [];
      input.evidence[0].case_ids = ['case-unrelated'];
    }],
    [D.UNTRACED_TASK, (input) => {
      input.tasks[0].requirement_refs = [];
      input.tasks[0].acceptance_criterion_refs = [];
      input.tasks[0].invariant_refs = [];
      input.tasks[0].risk_refs = [];
    }],
    [D.CHANGE_OUTSIDE_APPROVED_INTENT, (input) => {
      input.changes[0].requirement_refs = [];
      input.changes[0].acceptance_criterion_refs = [];
      input.changes[0].invariant_refs = [];
    }],
    [D.PLANNED_OR_CHANGED_PATH_DRIFT, (input) => {
      input.changes[0].path = 'src/order-audit.mjs';
      input.changes[0].symbols = ['src/order-audit.mjs#recordOrder'];
      input.evidence[0].path_refs = ['src/order-audit.mjs'];
      input.evidence[0].symbol_refs = ['src/order-audit.mjs#recordOrder'];
    }],
    [D.REQUIRED_ARCHITECTURE_MISSING, (input) => {
      input.artifacts.architecture.status = 'missing';
      input.architecture.snapshot_status = 'missing';
    }],
    [D.ARCHITECTURE_INVARIANT_VIOLATION, (input) => {
      input.architecture.violated_invariant_refs = ['INV-001'];
    }],
    [D.ACCEPTED_CONVENTION_VIOLATION, (input) => {
      input.conventions.accepted_violations = ['CONV-001'];
    }],
    [D.OBSERVED_CONVENTION_USED_AS_BLOCKER, (input) => {
      input.conventions.observed_findings[0].blocking = true;
    }],
    [D.CONFORMANCE_EVIDENCE_STALE_OR_CONFLICTED, (input) => {
      input.architecture.evidence_status = 'stale';
      input.conventions.conflicted = true;
    }],
    [D.PUBLIC_CONTRACT_MIGRATION_DECISION_MISSING, (input) => {
      input.public_contract.migration_decision_status = 'missing';
    }],
    [D.APPROVED_ARTIFACT_GRAPH_OR_HASH_STALE, (input) => {
      input.artifacts.hash_status = 'mutated';
    }],
    [D.MODULE_PORTAL_REVISION_MAP_MISMATCH, (input) => {
      input.evidence[0].module_revision_map.orders = REVISION_A;
    }],
    [D.GENERATED_MIRROR_STALE, (input) => {
      input.generated_mirrors.status = 'stale';
    }],
    [D.SUMMARY_OR_DEPENDENCY_TOOLCHAIN_FINGERPRINT_STALE, (input) => {
      input.summary.dependency_fingerprint_status = 'stale';
    }],
    [D.MANIFEST_LOCKFILE_RUNTIME_ENGINE_DRIFT, (input) => {
      input.toolchain.runtime_engine_status = 'incompatible';
    }],
    [D.REQUIRED_LEDGER_MISSING, (input) => {
      input.ledgers.product.status = 'missing';
    }],
    [D.POST_VERIFICATION_WRITE, (input) => {
      input.lifecycle.writes_after_verification = ['src/late-write.mjs'];
    }],
    [D.ARTIFACT_CLOSURE_OR_THREAD_OWNERSHIP_INVALID, (input) => {
      input.lifecycle.artifact_closure_status = 'incomplete';
      input.lifecycle.artifact_thread_id = 'thread-other';
    }],
  ];

  assert.equal(cases.length, 20);
  for (const [expectedCode, mutate] of cases) {
    const input = featureFixture();
    mutate(input);
    const result = evaluateConvergence(input);
    assert.notEqual(result.status, 'CONVERGED', expectedCode);
    assert.ok(
      result.blocker_codes.includes(expectedCode),
      `${expectedCode}: ${JSON.stringify(result.blockers)}`,
    );
    assert.deepEqual(
      result.blockers,
      [...result.blockers].sort((left, right) =>
        `${left.code}\u0000${left.path}\u0000${left.message}`.localeCompare(
          `${right.code}\u0000${right.path}\u0000${right.message}`,
        ),
      ),
      `${expectedCode} blockers are deterministic`,
    );
  }
});

test('observed convention findings stay advisory and never gain repair authority', () => {
  const input = featureFixture();
  input.conventions.observed_findings.push({
    id: 'CONVENTION-CANDIDATE-002',
    blocking: false,
    repair_authorized: false,
  });
  const result = evaluateConvergence(input);
  assert.equal(result.status, 'CONVERGED');
  assert.deepEqual(result.blockers, []);
});

test('schema validation rejects malformed and dangling traceability instead of evaluating vacuous input', () => {
  const missing = featureFixture();
  delete missing.source;
  const missingResult = validateConvergenceInput(missing);
  assert.equal(missingResult.valid, false);
  assert.ok(missingResult.errors.some(({ path }) => path === 'convergence.source'));

  const dangling = featureFixture();
  dangling.tasks[0].requirement_refs = ['R-999'];
  dangling.changes[0].symbols = ['../unsafe#symbol'];
  const danglingResult = evaluateConvergence(dangling);
  assert.equal(danglingResult.status, 'BLOCKED');
  assert.deepEqual(danglingResult.blocker_codes, [CONVERGENCE_BLOCKER_CODES.INPUT_INVALID]);
  assert.ok(danglingResult.blockers.some(({ message }) => /R-999/u.test(message)));
  assert.ok(danglingResult.blockers.some(({ path }) => path.includes('symbols')));
});

test('malformed nested projections block as INPUT_INVALID instead of throwing', () => {
  const mutations = [
    (input) => delete input.thread,
    (input) => {
      input.evidence = [null];
    },
    (input) => delete input.architecture.violated_invariant_refs,
    (input) => delete input.conventions.accepted_violations,
    (input) => delete input.conventions.observed_findings,
    (input) => delete input.lifecycle.writes_after_verification,
    (input) => {
      input.conventions.observed_findings = [null];
    },
    (input) => {
      input.toolchain.runtime_engine_status = 'banana';
    },
    (input) => {
      input.artifacts.hash_status = 'trust-me';
    },
    (input) => {
      input.tasks[0].status = 'teleported';
    },
  ];
  for (const mutate of mutations) {
    const input = featureFixture();
    mutate(input);
    let result;
    assert.doesNotThrow(() => {
      result = evaluateConvergence(input);
    });
    assert.equal(result.status, 'BLOCKED');
    assert.deepEqual(result.blocker_codes, [CONVERGENCE_BLOCKER_CODES.INPUT_INVALID]);
  }
});

test('assertConvergence returns the compact result only for a fresh converged chain', () => {
  assert.equal(assertConvergence(featureFixture()).status, 'CONVERGED');
  const staleEvidence = featureFixture();
  staleEvidence.evidence[0].freshness = 'stale';
  assert.equal(evaluateConvergence(staleEvidence).fresh, false);
  const stale = featureFixture();
  stale.lifecycle.verification_revision = REVISION_B;
  assert.throws(() => assertConvergence(stale), /POST_VERIFICATION_WRITE|stale/u);
});

test('receipt creation atomically evaluates canonical input and rejects synthetic projections', () => {
  const input = featureFixture();
  const result = evaluateConvergence(input);
  assert.doesNotThrow(() => createConvergenceReceiptArtifact(input));
  assert.throws(
    () => createConvergenceReceiptArtifact(result),
    /canonical convergence input|CONVERGED/iu,
  );

  const fabricated = {
    ...result,
    change_ref: 'fabricated-change',
    summary: {
      requirements: 9,
      acceptance_criteria: 9,
      tasks: 9,
      changed_paths: 9,
      evidence: 1,
    },
  };
  assert.throws(
    () => createConvergenceReceiptArtifact(fabricated),
    /canonical convergence input|CONVERGED/iu,
  );
});

test('handoff non-vacuity matches the evaluator for every convergence mode', () => {
  for (const mode of CONVERGENCE_MODES) {
    const input = modeFixture(mode);
    const result = evaluateConvergence(input);
    const receipt = createConvergenceReceiptArtifact(input);
    const current = {
      ...result.source_identity,
      change_ref: input.change_ref,
      mode,
    };
    assert.equal(
      evaluateConvergenceHandoff({ result, current, receipt }).valid,
      true,
      mode,
    );
  }
});

test('compact convergence handoff rejects missing, blocked, deferred, stale, or source-mismatched results', () => {
  const input = featureFixture();
  const result = evaluateConvergence(input);
  const receipt = createConvergenceReceiptArtifact(input);
  const current = {
    repository_id: input.source.repository_id,
    revision: input.source.revision,
    fingerprint: input.source.fingerprint,
    portal_revision: input.source.portal_revision,
    module_revision_map: input.source.module_revision_map,
    pinned_module_revision_map: input.source.pinned_module_revision_map,
    owner_thread_id: input.thread.owner_thread_id,
    change_ref: input.change_ref,
    mode: input.mode,
  };
  assert.equal(evaluateConvergenceHandoff({ result, current, receipt }).valid, true);
  assert.doesNotThrow(() => evaluateConvergenceHandoff(null));
  assert.equal(evaluateConvergenceHandoff(null).valid, false);

  const mutations = [
    ['missing', null, 'CONVERGENCE_RESULT_MISSING'],
    ['blocked', { ...result, status: 'BLOCKED' }, 'CONVERGENCE_RESULT_NOT_CONVERGED'],
    ['deferred', { ...result, status: 'DEFERRED' }, 'CONVERGENCE_RESULT_NOT_CONVERGED'],
    ['stale', { ...result, fresh: false }, 'CONVERGENCE_RESULT_STALE'],
    ['contradictory blockers', { ...result, blocker_codes: ['UNTRACED_TASK'] }, 'CONVERGENCE_RESULT_INVALID'],
    ['synthetic empty feature', {
      ...result,
      evidence_refs: [],
      summary: { requirements: 0, acceptance_criteria: 0, tasks: 0, changed_paths: 0, evidence: 0 },
    }, 'CONVERGENCE_RESULT_INVALID'],
  ];
  for (const [name, candidate, code] of mutations) {
    const evaluated = evaluateConvergenceHandoff({ result: candidate, current, receipt });
    assert.equal(evaluated.valid, false, name);
    assert.ok(evaluated.blocker_codes.includes(code), name);
  }

  for (const mutate of [
    (value) => { value.revision = REVISION_B; },
    (value) => { value.module_revision_map.orders = REVISION_A; },
    (value) => { value.owner_thread_id = 'thread-other'; },
  ]) {
    const changedCurrent = clone(current);
    mutate(changedCurrent);
    const evaluated = evaluateConvergenceHandoff({ result, current: changedCurrent, receipt });
    assert.equal(evaluated.valid, false);
    assert.ok(evaluated.blocker_codes.includes('CONVERGENCE_SOURCE_MISMATCH'));
  }
});

test('execute, test, review, verify, branch-ready, ship, and Git preserve convergence handoffs', async () => {
  const files = Object.fromEntries(await Promise.all([
    'skills/shared/sdlc/04-execute-plan.md',
    'skills/tracks/test/sdcorejs-test.md',
    'skills/shared/workflow/review.md',
    '_refs/orchestration/tail/verify-before-done.md',
    '_refs/orchestration/tail/branch-ready.md',
    '_refs/orchestration/tail/ship-context.md',
    'skills/shared/workflow/ship.md',
    'skills/shared/workflow/git.md',
  ].map(async (file) => [file, await readFile(path.resolve(file), 'utf8')])));
  assert.match(files['skills/shared/sdlc/04-execute-plan.md'], /convergence_trace:[\s\S]*task_id:[\s\S]*changed_path_refs:[\s\S]*changed_symbol_refs:[\s\S]*acceptance_criterion_refs:[\s\S]*invariant_refs:[\s\S]*evidence_refs:/u);
  assert.match(files['skills/tracks/test/sdcorejs-test.md'], /convergence_evidence_refs/iu);
  assert.match(files['skills/shared/workflow/review.md'], /convergence_findings:[\s\S]*architecture[\s\S]*convention/iu);
  assert.match(files['_refs/orchestration/tail/verify-before-done.md'], /evaluateConvergence/iu);
  assert.match(files['_refs/orchestration/tail/branch-ready.md'], /evaluateConvergenceHandoff/iu);
  assert.match(files['_refs/orchestration/tail/ship-context.md'], /convergence_result:/u);
  assert.match(files['skills/shared/workflow/ship.md'], /convergence-contract\.mjs/iu);
  assert.match(files['skills/shared/workflow/git.md'], /missing, blocked, deferred, or stale convergence/iu);
});

test('canonical prose documents the full chain, mode boundaries, and all executable drift guards', async () => {
  const prose = await readFile(
    path.resolve('_refs/shared/convergence-contract.md'),
    'utf8',
  );
  for (const phrase of [
    'approved intent',
    'approved spec',
    'approved architecture',
    'approved plan',
    'changed files and symbols',
    'validation map',
    'artifact closure',
    'feature',
    'bugfix',
    'docs-only',
    'dependency-regression',
    'manual',
    'deferred',
  ]) {
    assert.match(prose, new RegExp(phrase, 'iu'), phrase);
  }
  for (const code of Object.values(CONVERGENCE_DRIFT_CODES)) {
    assert.match(prose, new RegExp(`\\b${code}\\b`, 'u'), code);
  }
  assert.match(prose, /does not grant Git authority/iu);
  assert.match(prose, /does not create a new skill/iu);
});
