import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { prepareExecution } from '../../_refs/orchestration/execution-contract.mjs';
import * as communicationPolicy from '../../_refs/harness/communication-economy.mjs';
import { createApprovedArtifact } from '../../_refs/shared/approved-artifact.mjs';
import { classifyArchitectureGate } from '../../_refs/shared/architecture-contract.mjs';
import {
  assertDecisionCoverage,
  assertGoalBackwardPlan,
  canonicalDecisionRecordId,
  validateDecisionCoverage,
  validateGoalBackwardPlan,
} from '../../_refs/shared/decision-coverage.mjs';

function active(id, type) {
  return { id, type };
}

function validCoverage() {
  const records = [
    {
      id: 'R-001',
      type: 'requirement',
      statement: 'A protected operation is denied unless it is authorized.',
      source: 'explicit-user',
      status: 'active',
      owner_repository_id: 'repo-main',
      owner_module_id: null,
      task_refs: ['TASK-001'],
    },
    {
      id: 'AC-001',
      type: 'acceptance-criterion',
      statement: 'An unauthorized request receives a denial.',
      behavior: 'The server evaluates authorization before the operation runs.',
      expected_result: 'An unauthorized request is denied.',
      verification_kind: 'automated',
      blocking: true,
      requirement_refs: ['R-001'],
      task_refs: ['TASK-002'],
    },
    {
      id: 'A-001',
      type: 'assumption',
      statement: 'The identity source remains available.',
      source: 'explicit',
      confidence: 'high',
      status: 'confirmed',
      blocking: false,
      evidence_refs: ['EVIDENCE-002'],
      consequence_if_wrong: 'Authorization decisions cannot be trusted.',
      validation_method: 'Verify identity-provider health before execution.',
      owner: 'security-owner',
      rationale: 'Identity availability is outside this repository boundary.',
      impacted_refs: ['R-001'],
    },
    {
      id: 'D-001',
      type: 'decision',
      statement: 'Authorization is enforced server-side.',
      question: 'Where is authorization enforced?',
      selected_value: 'server-side',
      source: 'approved-spec',
      status: 'approved',
      blocking: true,
      scope: 'repository',
      owner_repository_id: 'repo-main',
      rationale: 'A client-side decision cannot protect the operation.',
      supersedes: null,
      revisit_condition: null,
      convention_impact: { candidate: false, category: null },
      downstream_refs: ['R-001', 'AC-001', 'INV-001'],
      task_refs: ['TASK-001'],
    },
    {
      id: 'INV-001',
      type: 'invariant',
      statement: 'Client state never grants authorization.',
      protected_refs: ['R-001', 'AC-001'],
      task_refs: ['TASK-001', 'TASK-002'],
      evidence_refs: ['EVIDENCE-001'],
    },
  ];
  return {
    schema_version: 1,
    revision: 1,
    records,
    history: [
      {
        revision: 1,
        active: records.map(({ id, type }) => active(id, type)),
        tombstones: [],
      },
    ],
  };
}

function validGoalBackwardReview() {
  const decisionCoverage = validCoverage();
  decisionCoverage.records = decisionCoverage.records.map((record) => {
    if (record.id === 'R-001') return { ...record, task_refs: ['TASK-001', 'TASK-002'] };
    return record;
  });
  decisionCoverage.history[0].active = decisionCoverage.records.map(({ id, type }) =>
    active(id, type),
  );
  return {
    schema_version: 1,
    mode: 'sdcorejs-plan:goal-backward',
    decision_coverage: decisionCoverage,
    goals: [
      {
        id: 'G-001',
        statement: 'Deliver authorization with durable verification.',
        task_refs: ['TASK-001', 'TASK-002'],
      },
    ],
    tasks: [
      {
        id: 'TASK-001',
        owner_repository_id: 'repo-main',
        dependencies: [],
        planned_paths: ['src/authorization.mjs'],
        planned_evidence: [
          {
            id: 'EVIDENCE-002',
            record_refs: ['R-001', 'D-001', 'INV-001'],
          },
        ],
        justification_refs: ['R-001', 'D-001'],
        enforces_invariant_refs: ['INV-001'],
      },
      {
        id: 'TASK-002',
        owner_repository_id: 'repo-main',
        dependencies: ['TASK-001'],
        planned_paths: ['test/authorization.test.mjs', 'docs/authorization.md'],
        planned_evidence: [
          {
            id: 'EVIDENCE-001',
            record_refs: ['AC-001', 'INV-001'],
          },
        ],
        justification_refs: ['R-001'],
        enforces_invariant_refs: ['INV-001'],
      },
    ],
    repository_inventory: {
      repositories: [
        {
          repository_id: 'repo-main',
          existing_paths: ['src/authorization.mjs', 'test/authorization.test.mjs'],
          intended_new_paths: [
            { path: 'docs/authorization.md', owner_task_id: 'TASK-002' },
          ],
        },
      ],
    },
    critique_history: [
      {
        round: 1,
        checker_version: 'sdcorejs-plan:goal-backward:v1',
        blockers: [],
        resolved_blockers: [],
        unresolved_blockers: [],
      },
    ],
  };
}

function approvedMetadata(overrides = {}) {
  return {
    schema_version: 1,
    artifact_id: 'spec-decision-coverage-r1',
    artifact_kind: 'spec',
    contract_id: 'decision-coverage-contract',
    requirement_id: 'R-001',
    change_ref: 'decision-coverage-change',
    track: 'angular',
    stack_profile: 'plain-angular',
    owner_repository_id: 'repo-main',
    owner_repository_role: 'module',
    owner_module_id: 'module-main',
    repository_relative_path: '.sdcorejs/specs/angular/decision-coverage.md',
    source_revision: 'a'.repeat(40),
    parent_repository_id: null,
    parent_references: [],
    supersedes: null,
    approval_source: 'explicit-user-choice',
    approved_at: '2026-08-10T00:00:00.000Z',
    approved_by: null,
    ...overrides,
  };
}

function executionFixture() {
  const approvedSpec = createApprovedArtifact({
    metadata: approvedMetadata(),
    body: '# Approved spec\n',
  });
  const approvedPlan = createApprovedArtifact({
    metadata: approvedMetadata({
      artifact_id: 'plan-decision-coverage-r1',
      artifact_kind: 'plan',
      repository_relative_path: '.sdcorejs/plans/angular/decision-coverage.md',
      source_revision: 'b'.repeat(40),
      allowed_paths: ['src/**', 'test/**', 'docs/**'],
      prohibited_paths: ['.env'],
      parent_references: [
        {
          repository_id: approvedSpec.metadata.owner_repository_id,
          artifact_id: approvedSpec.metadata.artifact_id,
          artifact_kind: approvedSpec.metadata.artifact_kind,
          revision: approvedSpec.metadata.source_revision,
          approval_hash: approvedSpec.metadata.approval_hash,
        },
      ],
    }),
    body: '# Approved plan\n',
  });
  return {
    approved_plan: approvedPlan,
    approved_spec: approvedSpec,
    repository_plan: {
      schema_version: 1,
      integration_owner_repository_id: 'repo-main',
      gitlink_updates_in_scope: false,
      dependency_order: ['module-main'],
      repositories: [
        {
          repository_id: 'repo-main',
          role: 'module',
          module_id: 'module-main',
          available: true,
          writable: true,
        },
      ],
      steps: [
        {
          id: 'module-write',
          action: 'EDIT',
          semantic_scope: 'module',
          owner_repository_id: 'repo-main',
          git_roots: ['repo-main'],
          allowed_paths: ['src/**', 'test/**', 'docs/**'],
          prohibited_paths: ['.env'],
          depends_on: [],
        },
      ],
    },
    owner_revisions: { 'repo-main': approvedPlan.metadata.source_revision },
  };
}

function architectureBypassContext() {
  return {
    architecture_gate: classifyArchitectureGate({
      signals: [],
      bypass: {
        kind: 'test-only',
        rationale: 'The decision-coverage contract test changes no architecture boundary.',
      },
    }),
    architecture_context: null,
  };
}

function mutateRecord(coverage, id, change) {
  coverage.records = coverage.records.map((record) =>
    record.id === id ? { ...record, ...change } : record,
  );
  coverage.history[0].active = coverage.records.map(({ id: recordId, type }) =>
    active(recordId, type),
  );
  return coverage;
}

function errorCodes(result) {
  return result.errors.map(({ code }) => code);
}

function blockerCodes(result) {
  return result.blockers.map(({ code }) => code);
}

test('sdcorejs-plan exposes a goal-backward checker without a new public skill', () => {
  assert.equal(typeof validateGoalBackwardPlan, 'function');
  assert.equal(typeof assertGoalBackwardPlan, 'function');
});

test('goal-backward review traces records and goals through tasks, paths, and evidence', () => {
  const result = validateGoalBackwardPlan(validGoalBackwardReview());

  assert.equal(result.valid, true, result.blocker_messages.join('\n'));
  assert.equal(result.approval_ready, true);
  assert.equal(result.execution_ready, true);
  assert.deepEqual(
    result.coverage.paths.map(({ path, classification, task_id: taskId }) => [
      path,
      classification,
      taskId,
    ]),
    [
      ['src/authorization.mjs', 'existing', 'TASK-001'],
      ['docs/authorization.md', 'intended-new', 'TASK-002'],
      ['test/authorization.test.mjs', 'existing', 'TASK-002'],
    ],
  );
  assert.equal(assertGoalBackwardPlan(validGoalBackwardReview()).valid, true);
});

test('every acceptance criterion appears in at least one planned evidence record', () => {
  const review = validGoalBackwardReview();
  for (const task of review.tasks) {
    for (const evidence of task.planned_evidence) {
      evidence.record_refs = evidence.record_refs.filter((recordId) => recordId !== 'AC-001');
    }
  }

  const result = validateGoalBackwardPlan(review);

  assert.equal(result.valid, false);
  assert.equal(result.approval_ready, false);
  assert.equal(result.execution_ready, false);
  assert.ok(blockerCodes(result).includes('AC_EVIDENCE_COVERAGE_MISSING'));
});

test('acceptance-criterion evidence is owned by one of its mapped tasks', () => {
  const review = validGoalBackwardReview();
  review.tasks[0].planned_evidence[0].record_refs.push('AC-001');
  review.tasks[1].planned_evidence[0].record_refs =
    review.tasks[1].planned_evidence[0].record_refs.filter(
      (recordId) => recordId !== 'AC-001',
    );

  const first = validateGoalBackwardPlan(review);
  const second = validateGoalBackwardPlan(structuredClone(review));

  assert.equal(first.valid, false);
  assert.equal(first.approval_ready, false);
  assert.equal(first.execution_ready, false);
  assert.ok(blockerCodes(first).includes('AC_EVIDENCE_TASK_MISMATCH'));
  assert.deepEqual(first.blockers, second.blockers);
});

test('empty decision and goal-backward graphs cannot become approval or execution ready', () => {
  const emptyCoverage = {
    schema_version: 1,
    revision: 1,
    records: [],
    history: [{ revision: 1, active: [], tombstones: [] }],
  };
  const decisionResult = validateDecisionCoverage(emptyCoverage, { stage: 'plan' });
  assert.equal(decisionResult.valid, false);
  assert.equal(decisionResult.execution_ready, false);
  assert.ok(errorCodes(decisionResult).includes('RECORDS_EMPTY'));

  const cases = [
    {
      name: 'decision coverage records',
      mutate: (review) => {
        review.decision_coverage = structuredClone(emptyCoverage);
      },
      code: 'DECISION_COVERAGE_RECORDS_EMPTY',
    },
    {
      name: 'goals',
      mutate: (review) => { review.goals = []; },
      code: 'GOALS_EMPTY',
    },
    {
      name: 'tasks',
      mutate: (review) => { review.tasks = []; },
      code: 'TASKS_EMPTY',
    },
    {
      name: 'repository inventory',
      mutate: (review) => { review.repository_inventory.repositories = []; },
      code: 'REPOSITORY_INVENTORY_EMPTY',
    },
  ];

  for (const scenario of cases) {
    const review = validGoalBackwardReview();
    scenario.mutate(review);
    const result = validateGoalBackwardPlan(review);
    assert.equal(result.valid, false, scenario.name);
    assert.equal(result.approval_ready, false, scenario.name);
    assert.equal(result.execution_ready, false, scenario.name);
    assert.ok(blockerCodes(result).includes(scenario.code), scenario.name);
  }
});

test('goal-backward validation rejects malformed object-array elements without throwing', () => {
  const cases = [
    {
      name: 'null decision record',
      mutate: (review) => { review.decision_coverage.records[0] = null; },
      code: 'DECISION_COVERAGE_RECORD_INVALID',
    },
    {
      name: 'primitive decision record',
      mutate: (review) => { review.decision_coverage.records[0] = 42; },
      code: 'DECISION_COVERAGE_RECORD_INVALID',
    },
    {
      name: 'null task',
      mutate: (review) => { review.tasks[0] = null; },
      code: 'TASK_INVALID',
    },
    {
      name: 'primitive task',
      mutate: (review) => { review.tasks[0] = 42; },
      code: 'TASK_INVALID',
    },
    {
      name: 'null goal',
      mutate: (review) => { review.goals[0] = null; },
      code: 'GOAL_INVALID',
    },
    {
      name: 'primitive goal',
      mutate: (review) => { review.goals[0] = 42; },
      code: 'GOAL_INVALID',
    },
    {
      name: 'null evidence declaration',
      mutate: (review) => { review.tasks[0].planned_evidence[0] = null; },
      code: 'EVIDENCE_INVALID',
    },
    {
      name: 'primitive evidence declaration',
      mutate: (review) => { review.tasks[0].planned_evidence[0] = 42; },
      code: 'EVIDENCE_INVALID',
    },
    {
      name: 'null repository inventory entry',
      mutate: (review) => { review.repository_inventory.repositories[0] = null; },
      code: 'REPOSITORY_INVENTORY_ENTRY_INVALID',
    },
    {
      name: 'primitive repository inventory entry',
      mutate: (review) => { review.repository_inventory.repositories[0] = 42; },
      code: 'REPOSITORY_INVENTORY_ENTRY_INVALID',
    },
    {
      name: 'null intended-new declaration',
      mutate: (review) => {
        review.repository_inventory.repositories[0].intended_new_paths[0] = null;
      },
      code: 'PATH_INTENDED_NEW_DECLARATION_INVALID',
    },
    {
      name: 'primitive intended-new declaration',
      mutate: (review) => {
        review.repository_inventory.repositories[0].intended_new_paths[0] = 42;
      },
      code: 'PATH_INTENDED_NEW_DECLARATION_INVALID',
    },
  ];

  for (const scenario of cases) {
    const review = validGoalBackwardReview();
    scenario.mutate(review);
    let first;
    assert.doesNotThrow(() => { first = validateGoalBackwardPlan(review); }, scenario.name);
    const second = validateGoalBackwardPlan(structuredClone(review));
    assert.equal(first.valid, false, scenario.name);
    assert.ok(blockerCodes(first).includes(scenario.code), scenario.name);
    assert.deepEqual(first.blockers, second.blockers, scenario.name);
    assert.deepEqual(first.blocker_messages, [...first.blocker_messages].sort(), scenario.name);
  }
});

test('goal-backward validation rejects malformed nested collections without throwing', () => {
  const collectionCases = [
    {
      name: 'task dependencies',
      mutate: (review, value) => { review.tasks[0].dependencies = value; },
      code: 'TASK_DEPENDENCIES_MISSING',
    },
    {
      name: 'task planned paths',
      mutate: (review, value) => { review.tasks[0].planned_paths = value; },
      code: 'TASK_PATHS_MISSING',
    },
    {
      name: 'task planned evidence',
      mutate: (review, value) => { review.tasks[0].planned_evidence = value; },
      code: 'TASK_EVIDENCE_MISSING',
    },
    {
      name: 'task justification refs',
      mutate: (review, value) => { review.tasks[0].justification_refs = value; },
      code: 'TASK_JUSTIFICATION_MISSING',
    },
    {
      name: 'task invariant refs',
      mutate: (review, value) => { review.tasks[0].enforces_invariant_refs = value; },
      code: 'TASK_INVARIANT_REFS_MISSING',
    },
    {
      name: 'goal task refs',
      mutate: (review, value) => { review.goals[0].task_refs = value; },
      code: 'GOAL_TASK_COVERAGE_MISSING',
    },
    {
      name: 'record task refs',
      mutate: (review, value) => { review.decision_coverage.records[0].task_refs = value; },
      code: 'DECISION_COVERAGE_REFERENCE_COLLECTION_INVALID',
    },
    {
      name: 'decision downstream refs',
      mutate: (review, value) => {
        review.decision_coverage.records[3].downstream_refs = value;
      },
      code: 'DECISION_COVERAGE_REFERENCE_COLLECTION_INVALID',
      malformedValues: [{}, 42],
    },
    {
      name: 'invariant evidence refs',
      mutate: (review, value) => { review.decision_coverage.records[4].evidence_refs = value; },
      code: 'DECISION_COVERAGE_REFERENCE_COLLECTION_INVALID',
    },
    {
      name: 'evidence record refs',
      mutate: (review, value) => {
        review.tasks[0].planned_evidence[0].record_refs = value;
      },
      code: 'EVIDENCE_RECORD_REFS_MISSING',
    },
    ...['blockers', 'resolved_blockers', 'unresolved_blockers'].map((field) => ({
      name: `critique ${field}`,
      mutate: (review, value) => { review.critique_history[0][field] = value; },
      code: 'CRITIQUE_ROUND_INVALID',
    })),
    {
      name: 'critique history',
      mutate: (review, value) => { review.critique_history = value; },
      code: 'CRITIQUE_HISTORY_MISSING',
    },
  ];
  const malformedValues = [null, 'not-an-array', { invalid: true }];

  for (const scenario of collectionCases) {
    for (const malformedValue of scenario.malformedValues ?? malformedValues) {
      const review = validGoalBackwardReview();
      scenario.mutate(review, structuredClone(malformedValue));
      const label = `${scenario.name}: ${JSON.stringify(malformedValue)}`;
      let first;
      assert.doesNotThrow(() => { first = validateGoalBackwardPlan(review); }, label);
      const second = validateGoalBackwardPlan(structuredClone(review));
      assert.equal(first.valid, false, label);
      assert.ok(blockerCodes(first).includes(scenario.code), label);
      assert.deepEqual(first.blockers, second.blockers, label);
      assert.deepEqual(first.blocker_messages, [...first.blocker_messages].sort(), label);
    }
  }
});

test('repository inventory entries require explicit existing and intended-new arrays', () => {
  const fields = [
    ['existing_paths', 'REPOSITORY_EXISTING_PATHS_INVALID'],
    ['intended_new_paths', 'REPOSITORY_INTENDED_NEW_PATHS_INVALID'],
  ];
  const malformedValues = [
    { label: 'missing', missing: true },
    { label: 'null', value: null },
    { label: 'object', value: { invalid: true } },
    { label: 'string', value: 'not-an-array' },
  ];

  for (const [field, code] of fields) {
    for (const malformed of malformedValues) {
      const review = validGoalBackwardReview();
      const repository = review.repository_inventory.repositories[0];
      if (malformed.missing) delete repository[field];
      else repository[field] = structuredClone(malformed.value);
      const label = `${field}: ${malformed.label}`;
      let first;
      assert.doesNotThrow(() => { first = validateGoalBackwardPlan(review); }, label);
      const second = validateGoalBackwardPlan(structuredClone(review));
      assert.equal(first.valid, false, label);
      assert.ok(blockerCodes(first).includes(code), label);
      assert.deepEqual(first.blockers, second.blockers, label);
      assert.deepEqual(first.blocker_messages, [...first.blocker_messages].sort(), label);
    }
  }
});

test('discovery and spec stages report future mapping gaps without weakening strict plan validation', () => {
  const coverage = validCoverage();
  coverage.records = coverage.records.map((record) => {
    if (['requirement', 'acceptance-criterion', 'decision'].includes(record.type)) {
      return { ...record, task_refs: [] };
    }
    if (record.type === 'invariant') {
      return { ...record, task_refs: [], evidence_refs: [] };
    }
    return record;
  });

  const specResult = validateDecisionCoverage(coverage, { stage: 'spec' });
  assert.equal(specResult.structurally_valid, true, specResult.error_messages.join('\n'));
  assert.equal(specResult.valid, true, specResult.error_messages.join('\n'));
  assert.equal(specResult.execution_ready, false);
  assert.deepEqual(
    specResult.future_gaps.map(({ code }) => code),
    [
      'AC_PLAN_COVERAGE_MISSING',
      'INVARIANT_EVIDENCE_TRACE_MISSING',
      'INVARIANT_TASK_TRACE_MISSING',
      'REQUIREMENT_PLAN_COVERAGE_MISSING',
    ],
  );

  const planResult = validateDecisionCoverage(coverage, { stage: 'plan' });
  assert.equal(planResult.valid, false);
  assert.ok(errorCodes(planResult).includes('REQUIREMENT_PLAN_COVERAGE_MISSING'));
});

test('path classification derives only from inventory and one explicit intended-new owner', () => {
  const missing = validGoalBackwardReview();
  missing.repository_inventory.repositories[0].existing_paths = [
    'test/authorization.test.mjs',
  ];
  assert.ok(blockerCodes(validateGoalBackwardPlan(missing)).includes('PATH_MISSING'));

  const ownerless = validGoalBackwardReview();
  ownerless.repository_inventory.repositories[0].intended_new_paths[0].owner_task_id = '';
  assert.ok(
    blockerCodes(validateGoalBackwardPlan(ownerless)).includes(
      'PATH_INTENDED_NEW_OWNER_MISSING',
    ),
  );

  const duplicate = validGoalBackwardReview();
  duplicate.tasks[1].planned_paths.push('src/authorization.mjs');
  assert.ok(
    blockerCodes(validateGoalBackwardPlan(duplicate)).includes('PATH_DUPLICATE_OWNERSHIP'),
  );
});

test('task and repository paths must be normalized safe repository-relative paths', () => {
  const unsafePaths = [
    '../escape.ts',
    '/absolute.ts',
    'C:/absolute.ts',
    'src\\authorization.mjs',
    'src//authorization.mjs',
    './src/authorization.mjs',
    'src/../authorization.mjs',
  ];
  const surfaces = [
    {
      name: 'task planned path',
      mutate: (review, path) => { review.tasks[0].planned_paths[0] = path; },
      code: 'TASK_PATH_INVALID',
    },
    {
      name: 'repository existing path',
      mutate: (review, path) => {
        review.repository_inventory.repositories[0].existing_paths[0] = path;
      },
      code: 'PATH_INVENTORY_INVALID',
    },
    {
      name: 'repository intended-new path',
      mutate: (review, path) => {
        review.repository_inventory.repositories[0].intended_new_paths[0].path = path;
      },
      code: 'PATH_INTENDED_NEW_INVALID',
    },
  ];

  for (const surface of surfaces) {
    for (const unsafePath of unsafePaths) {
      const review = validGoalBackwardReview();
      surface.mutate(review, unsafePath);
      const result = validateGoalBackwardPlan(review);
      assert.equal(result.valid, false, `${surface.name}: ${unsafePath}`);
      assert.ok(
        blockerCodes(result).includes(surface.code),
        `${surface.name}: ${unsafePath}`,
      );
    }
  }
});

test('every requirement, AC, decision, invariant, and goal maps to a real task', () => {
  const unmapped = validGoalBackwardReview();
  unmapped.decision_coverage.records = unmapped.decision_coverage.records.map((record) =>
    record.id === 'D-001' ? { ...record, task_refs: [] } : record,
  );
  assert.ok(
    blockerCodes(validateGoalBackwardPlan(unmapped)).includes('RECORD_TASK_COVERAGE_MISSING'),
  );

  const dangling = validGoalBackwardReview();
  dangling.decision_coverage.records = dangling.decision_coverage.records.map((record) =>
    record.id === 'D-001' ? { ...record, task_refs: ['TASK-999'] } : record,
  );
  assert.ok(
    blockerCodes(validateGoalBackwardPlan(dangling)).includes('TASK_REFERENCE_DANGLING'),
  );

  const goal = validGoalBackwardReview();
  goal.goals[0].task_refs = [];
  assert.ok(
    blockerCodes(validateGoalBackwardPlan(goal)).includes('GOAL_TASK_COVERAGE_MISSING'),
  );
});

test('every task has a stable ID, owner, explicit dependencies, paths, and evidence', () => {
  const mutations = [
    ['id', 'task-one', 'TASK_ID_MALFORMED'],
    ['owner_repository_id', '', 'TASK_OWNER_MISSING'],
    ['dependencies', undefined, 'TASK_DEPENDENCIES_MISSING'],
    ['planned_paths', [], 'TASK_PATHS_MISSING'],
    ['planned_evidence', [], 'TASK_EVIDENCE_MISSING'],
  ];

  for (const [field, value, expectedCode] of mutations) {
    const review = validGoalBackwardReview();
    if (value === undefined) delete review.tasks[0][field];
    else review.tasks[0][field] = value;
    assert.ok(
      blockerCodes(validateGoalBackwardPlan(review)).includes(expectedCode),
      `${field} must produce ${expectedCode}`,
    );
  }
});

test('task justification blocks wrong-type, dangling, and scope-creep work', () => {
  const unjustified = validGoalBackwardReview();
  unjustified.tasks[0].justification_refs = [];
  assert.ok(
    blockerCodes(validateGoalBackwardPlan(unjustified)).includes('TASK_JUSTIFICATION_MISSING'),
  );

  const wrongType = validGoalBackwardReview();
  wrongType.tasks[0].justification_refs = ['AC-001'];
  assert.ok(
    blockerCodes(validateGoalBackwardPlan(wrongType)).includes(
      'TASK_JUSTIFICATION_WRONG_TYPE',
    ),
  );

  const dangling = validGoalBackwardReview();
  dangling.tasks[0].justification_refs = ['R-999'];
  assert.ok(
    blockerCodes(validateGoalBackwardPlan(dangling)).includes('RECORD_REFERENCE_DANGLING'),
  );

  const scopeCreep = validGoalBackwardReview();
  scopeCreep.tasks.push({
    id: 'TASK-003',
    owner_repository_id: 'repo-main',
    dependencies: [],
    planned_paths: ['docs/scope-creep.md'],
    planned_evidence: [{ id: 'EVIDENCE-003', record_refs: ['R-001'] }],
    justification_refs: ['R-001'],
    enforces_invariant_refs: [],
  });
  scopeCreep.repository_inventory.repositories[0].intended_new_paths.push({
    path: 'docs/scope-creep.md',
    owner_task_id: 'TASK-003',
  });
  assert.ok(blockerCodes(validateGoalBackwardPlan(scopeCreep)).includes('TASK_SCOPE_CREEP'));
});

test('task dependencies reject dangling references and cycles', () => {
  const dangling = validGoalBackwardReview();
  dangling.tasks[1].dependencies = ['TASK-999'];
  assert.ok(
    blockerCodes(validateGoalBackwardPlan(dangling)).includes('DEPENDENCY_DANGLING'),
  );

  const cyclic = validGoalBackwardReview();
  cyclic.tasks[0].dependencies = ['TASK-002'];
  assert.ok(blockerCodes(validateGoalBackwardPlan(cyclic)).includes('DEPENDENCY_CYCLE'));
});

test('planned evidence and invariant enforcement reject dangling or incomplete traces', () => {
  const danglingEvidence = validGoalBackwardReview();
  danglingEvidence.tasks[0].planned_evidence[0].record_refs = ['R-999'];
  assert.ok(
    blockerCodes(validateGoalBackwardPlan(danglingEvidence)).includes(
      'EVIDENCE_RECORD_REFERENCE_DANGLING',
    ),
  );

  const duplicateEvidence = validGoalBackwardReview();
  duplicateEvidence.tasks[0].planned_evidence[0].id = 'EVIDENCE-001';
  assert.ok(
    blockerCodes(validateGoalBackwardPlan(duplicateEvidence)).includes(
      'EVIDENCE_ID_DUPLICATE',
    ),
  );

  const enforcementGap = validGoalBackwardReview();
  enforcementGap.tasks[1].enforces_invariant_refs = [];
  assert.ok(
    blockerCodes(validateGoalBackwardPlan(enforcementGap)).includes(
      'INVARIANT_ENFORCEMENT_GAP',
    ),
  );

  const evidenceGap = validGoalBackwardReview();
  evidenceGap.tasks[1].planned_evidence[0].record_refs = ['AC-001'];
  assert.ok(
    blockerCodes(validateGoalBackwardPlan(evidenceGap)).includes('INVARIANT_EVIDENCE_GAP'),
  );
});

test('self-critique history is versioned, contiguous, and capped at three rounds', () => {
  const changedChecker = validGoalBackwardReview();
  changedChecker.critique_history[0].checker_version = 'goal-backward:mutated';
  assert.ok(
    blockerCodes(validateGoalBackwardPlan(changedChecker)).includes(
      'CRITIQUE_CHECKER_VERSION_MISMATCH',
    ),
  );

  const gap = validGoalBackwardReview();
  gap.critique_history.push({
    round: 3,
    checker_version: 'sdcorejs-plan:goal-backward:v1',
    blockers: [],
    resolved_blockers: [],
    unresolved_blockers: [],
  });
  assert.ok(blockerCodes(validateGoalBackwardPlan(gap)).includes('CRITIQUE_ROUND_GAP'));

  const fourthRound = validGoalBackwardReview();
  for (const round of [2, 3, 4]) {
    fourthRound.critique_history.push({
      round,
      checker_version: 'sdcorejs-plan:goal-backward:v1',
      blockers: [],
      resolved_blockers: [],
      unresolved_blockers: [],
    });
  }
  assert.ok(
    blockerCodes(validateGoalBackwardPlan(fourthRound)).includes(
      'CRITIQUE_ROUND_CAP_EXCEEDED',
    ),
  );
});

test('unresolved round-three blockers cannot be approved or bypassed by a fourth round', () => {
  const review = validGoalBackwardReview();
  review.critique_history = [1, 2, 3].map((round) => ({
    round,
    checker_version: 'sdcorejs-plan:goal-backward:v1',
    blockers: ['BLOCKER-001'],
    resolved_blockers: [],
    unresolved_blockers: ['BLOCKER-001'],
  }));
  const blocked = validateGoalBackwardPlan(review);
  assert.equal(blocked.approval_ready, false);
  assert.equal(blocked.execution_ready, false);
  assert.ok(blockerCodes(blocked).includes('CRITIQUE_ROUND_CAP_BLOCKED'));

  review.critique_history.push({
    round: 4,
    checker_version: 'sdcorejs-plan:goal-backward:v1',
    blockers: ['BLOCKER-001'],
    resolved_blockers: ['BLOCKER-001'],
    unresolved_blockers: [],
  });
  const bypass = validateGoalBackwardPlan(review);
  assert.ok(blockerCodes(bypass).includes('CRITIQUE_ROUND_CAP_EXCEEDED'));
  assert.ok(blockerCodes(bypass).includes('CRITIQUE_ROUND_CAP_BLOCKED'));
});

test('goal-backward blocker ordering is deterministic across repeated validation', () => {
  const review = validGoalBackwardReview();
  review.tasks[0].owner_repository_id = '';
  review.tasks[0].dependencies = ['TASK-999'];
  review.tasks[0].planned_evidence = [];
  review.repository_inventory.repositories[0].existing_paths = [];
  const first = validateGoalBackwardPlan(review);
  const second = validateGoalBackwardPlan(structuredClone(review));

  assert.deepEqual(first.blockers, second.blockers);
  assert.deepEqual(first.blocker_messages, [...first.blocker_messages].sort());
});

test('prepareExecution validates schema-v2 decision coverage before write authorization', () => {
  const fixture = executionFixture();
  const goalBackwardReview = validGoalBackwardReview();
  const prepared = prepareExecution({
    ...fixture,
    plan_context: {
      schema_version: 2,
      ...architectureBypassContext(),
      decision_coverage: goalBackwardReview.decision_coverage,
      goal_backward_review: goalBackwardReview,
    },
  });
  assert.equal(prepared.decision_coverage_mode, 'strict-v2');
  assert.equal(prepared.goal_backward_review.valid, true);

  const malformed = validGoalBackwardReview();
  malformed.tasks[0].owner_repository_id = '';
  assert.throws(
    () =>
      prepareExecution({
        ...fixture,
        plan_context: {
          schema_version: 2,
          ...architectureBypassContext(),
          decision_coverage: malformed.decision_coverage,
          goal_backward_review: malformed,
        },
        repository_plan: {
          ...fixture.repository_plan,
          steps: fixture.repository_plan.steps.map((step) => ({
            ...step,
            allowed_paths: ['**'],
            prohibited_paths: [],
          })),
        },
      }),
    /TASK_OWNER_MISSING/iu,
  );

  assert.throws(
    () =>
      prepareExecution({
        ...fixture,
        plan_context: {
          schema_version: 2,
          ...architectureBypassContext(),
          decision_coverage: goalBackwardReview.decision_coverage,
        },
      }),
    /goal_backward_review.*required/iu,
  );
});

test('prepareExecution reports malformed decision downstream collections deterministically', () => {
  for (const malformedValue of [{}, 42]) {
    const messages = [];
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const goalBackwardReview = validGoalBackwardReview();
      goalBackwardReview.decision_coverage.records[3].downstream_refs = structuredClone(
        malformedValue,
      );
      try {
        prepareExecution({
          ...executionFixture(),
          plan_context: {
            schema_version: 2,
            ...architectureBypassContext(),
            decision_coverage: goalBackwardReview.decision_coverage,
            goal_backward_review: goalBackwardReview,
          },
        });
        assert.fail('malformed decision downstream_refs must block execution');
      } catch (error) {
        assert.equal(error?.name, 'Error');
        assert.match(error?.message ?? '', /REFERENCE_COLLECTION_INVALID/u);
        messages.push(error.message);
      }
    }
    assert.equal(messages[0], messages[1]);
  }
});

test('prepareExecution compares equivalent decision coverage structurally', () => {
  const fixture = executionFixture();
  const goalBackwardReview = validGoalBackwardReview();
  const decisionCoverage = goalBackwardReview.decision_coverage;
  goalBackwardReview.decision_coverage = {
    history: structuredClone(decisionCoverage.history),
    records: structuredClone(decisionCoverage.records),
    revision: decisionCoverage.revision,
    schema_version: decisionCoverage.schema_version,
  };

  const prepared = prepareExecution({
    ...fixture,
    plan_context: {
      schema_version: 2,
      ...architectureBypassContext(),
      decision_coverage: decisionCoverage,
      goal_backward_review: goalBackwardReview,
    },
  });

  assert.equal(prepared.decision_coverage_mode, 'strict-v2');
  assert.equal(prepared.goal_backward_review.valid, true);
});

test('prepareExecution keeps explicit legacy schema-v1 compatibility', () => {
  const prepared = prepareExecution({
    ...executionFixture(),
    plan_context: { schema_version: 1 },
  });

  assert.equal(prepared.decision_coverage_mode, 'legacy-schema-v1');
  assert.equal(prepared.goal_backward_review, null);
});

test('prepareExecution requires an explicit non-null plan_context', async () => {
  assert.throws(
    () => prepareExecution(executionFixture()),
    /plan_context is required/iu,
  );
  assert.throws(
    () => prepareExecution({ ...executionFixture(), plan_context: null }),
    /plan_context is required/iu,
  );

  const executePlan = await readFile(
    new URL('../../skills/shared/sdlc/04-execute-plan.md', import.meta.url),
    'utf8',
  );
  assert.match(executePlan, /`plan_context` is required/iu);
  assert.match(executePlan, /omitted or null/iu);
});

test('canonical workflow producers preserve decision coverage and goal-backward review', async () => {
  const files = [
    'skills/shared/sdlc/01-brainstorming.md',
    'skills/shared/sdlc/02-spec.md',
    'skills/shared/sdlc/03-plan.md',
    'skills/shared/sdlc/04-execute-plan.md',
    '_refs/shared/test-context.md',
    '_refs/shared/test-scope-and-coverage.md',
    'skills/shared/workflow/review.md',
    'skills/shared/workflow/ship.md',
    '_refs/orchestration/tail/ship-context.md',
    '_refs/orchestration/tail/verify-before-done.md',
  ];

  for (const file of files) {
    const text = await readFile(new URL(`../../${file}`, import.meta.url), 'utf8');
    assert.match(text, /_refs\/shared\/decision-coverage\.md/u, `${file} loads the contract`);
    assert.match(text, /\bdecision_coverage\b/u, `${file} preserves decision_coverage`);
    assert.match(text, /\bgoal_backward_review\b/u, `${file} preserves goal_backward_review`);
  }

  const plan = await readFile(
    new URL('../../skills/shared/sdlc/03-plan.md', import.meta.url),
    'utf8',
  );
  assert.match(plan, /sdcorejs-plan:goal-backward/u);
  assert.match(plan, /repository_inventory/u);
  assert.match(plan, /three rounds|3 rounds/iu);
  assert.doesNotMatch(plan, /\bAC1\b|\bAC2\b|\bAC-[1-9]\b/u);
});

test('portable handoff matrices preserve decision coverage fields for every downstream consumer', () => {
  const contextTypes = [
    'requirement_context',
    'spec_context',
    'plan_context',
    'execution_context',
    'test_context',
    'review_context',
    'ship_context',
  ];
  for (const contextType of contextTypes) {
    assert.equal(
      communicationPolicy.CONSUMER_REQUIRED_FIELD_KINDS[contextType].decision_coverage,
      'object',
    );
    assert.equal(
      communicationPolicy.CONSUMER_REQUIRED_FIELD_KINDS[contextType].goal_backward_review,
      'object',
    );
    for (const [consumer, fields] of Object.entries(
      communicationPolicy.CONSUMER_REQUIRED_FIELDS[contextType],
    )) {
      assert.ok(fields.includes('decision_coverage'), `${contextType} -> ${consumer}`);
      assert.ok(fields.includes('goal_backward_review'), `${contextType} -> ${consumer}`);
    }
  }
});

test('decision coverage accepts canonical typed records and a complete revision snapshot', () => {
  const result = validateDecisionCoverage(validCoverage());

  assert.equal(result.valid, true, result.error_messages.join('\n'));
  assert.equal(result.execution_ready, true, result.blocker_messages.join('\n'));
  assert.deepEqual(
    result.records.map(({ id }) => id),
    ['R-001', 'AC-001', 'A-001', 'D-001', 'INV-001'],
  );
  assert.equal(assertDecisionCoverage(validCoverage()).valid, true);
});

test('record IDs are exact, type-bound, globally unique, and never silently normalized', () => {
  assert.equal(canonicalDecisionRecordId('requirement', 1), 'R-001');
  assert.equal(canonicalDecisionRecordId('acceptance-criterion', 12), 'AC-012');
  assert.throws(() => canonicalDecisionRecordId('requirement', 0), /positive integer/iu);

  const malformed = validCoverage();
  malformed.records.push({
    ...malformed.records[0],
    id: 'r-1',
    statement: 'An attempted normalized duplicate.',
  });
  malformed.history[0].active.push(active('r-1', 'requirement'));
  const malformedResult = validateDecisionCoverage(malformed);
  assert.ok(errorCodes(malformedResult).includes('ID_MALFORMED'));
  assert.ok(errorCodes(malformedResult).includes('ID_NORMALIZATION_COLLISION'));
  assert.equal(malformedResult.records.at(-1).id, 'r-1');

  const mixed = mutateRecord(validCoverage(), 'R-001', {
    id: 'AC-002',
    type: 'requirement',
  });
  assert.ok(errorCodes(validateDecisionCoverage(mixed)).includes('ID_TYPE_MISMATCH'));

  const duplicate = validCoverage();
  duplicate.records.push({ ...duplicate.records[0] });
  duplicate.history[0].active.push(active('R-001', 'requirement'));
  assert.ok(errorCodes(validateDecisionCoverage(duplicate)).includes('ID_DUPLICATE'));
});

test('references reject duplicates, dangling targets, and wrong target types', () => {
  const duplicate = mutateRecord(validCoverage(), 'AC-001', {
    requirement_refs: ['R-001', 'R-001'],
  });
  assert.ok(errorCodes(validateDecisionCoverage(duplicate)).includes('REFERENCE_DUPLICATE'));

  const dangling = mutateRecord(validCoverage(), 'AC-001', {
    requirement_refs: ['R-999'],
  });
  assert.ok(errorCodes(validateDecisionCoverage(dangling)).includes('REFERENCE_DANGLING'));

  const wrongType = mutateRecord(validCoverage(), 'AC-001', {
    requirement_refs: ['D-001'],
  });
  assert.ok(errorCodes(validateDecisionCoverage(wrongType)).includes('REFERENCE_WRONG_TYPE'));
});

test('coverage semantics require AC ownership, planned requirements, downstream decisions, and protected invariants', () => {
  const mutations = [
    ['AC-001', { requirement_refs: [] }, 'AC_REQUIREMENT_COVERAGE_MISSING'],
    ['R-001', { task_refs: [] }, 'REQUIREMENT_PLAN_COVERAGE_MISSING'],
    ['D-001', { downstream_refs: [] }, 'DECISION_DOWNSTREAM_EFFECT_MISSING'],
    ['INV-001', { protected_refs: [] }, 'INVARIANT_PROTECTED_REFS_MISSING'],
    ['INV-001', { task_refs: [] }, 'INVARIANT_TASK_TRACE_MISSING'],
    ['INV-001', { evidence_refs: [] }, 'INVARIANT_EVIDENCE_TRACE_MISSING'],
  ];

  for (const [id, change, expectedCode] of mutations) {
    const result = validateDecisionCoverage(mutateRecord(validCoverage(), id, change));
    assert.ok(errorCodes(result).includes(expectedCode), `${expectedCode}: ${result.error_messages}`);
  }
});

test('canonical records require the complete type-specific contract', () => {
  const requiredFields = [
    ['R-001', 'source', 'REQUIREMENT_SOURCE_INVALID'],
    ['R-001', 'status', 'REQUIREMENT_STATUS_INVALID'],
    ['R-001', 'owner_repository_id', 'REQUIREMENT_OWNER_REPOSITORY_INVALID'],
    ['R-001', 'owner_module_id', 'REQUIREMENT_OWNER_MODULE_INVALID'],
    ['AC-001', 'behavior', 'AC_BEHAVIOR_MISSING'],
    ['AC-001', 'expected_result', 'AC_EXPECTED_RESULT_MISSING'],
    ['AC-001', 'verification_kind', 'AC_VERIFICATION_KIND_INVALID'],
    ['AC-001', 'blocking', 'AC_BLOCKING_INVALID'],
    ['A-001', 'source', 'ASSUMPTION_SOURCE_INVALID'],
    ['A-001', 'confidence', 'ASSUMPTION_CONFIDENCE_INVALID'],
    ['A-001', 'evidence_refs', 'ASSUMPTION_EVIDENCE_INVALID'],
    ['A-001', 'consequence_if_wrong', 'ASSUMPTION_CONSEQUENCE_MISSING'],
    ['A-001', 'validation_method', 'ASSUMPTION_VALIDATION_METHOD_MISSING'],
    ['A-001', 'owner', 'ASSUMPTION_OWNER_MISSING'],
    ['D-001', 'question', 'DECISION_QUESTION_MISSING'],
    ['D-001', 'selected_value', 'DECISION_SELECTED_VALUE_MISSING'],
    ['D-001', 'source', 'DECISION_SOURCE_INVALID'],
    ['D-001', 'status', 'DECISION_STATUS_INVALID'],
    ['D-001', 'blocking', 'DECISION_BLOCKING_INVALID'],
    ['D-001', 'scope', 'DECISION_SCOPE_INVALID'],
    ['D-001', 'owner_repository_id', 'DECISION_OWNER_REPOSITORY_INVALID'],
    ['D-001', 'rationale', 'DECISION_RATIONALE_MISSING'],
    ['D-001', 'supersedes', 'DECISION_SUPERSEDES_INVALID'],
    ['D-001', 'convention_impact', 'DECISION_CONVENTION_IMPACT_INVALID'],
  ];

  for (const [id, field, expectedCode] of requiredFields) {
    const coverage = structuredClone(validCoverage());
    const record = coverage.records.find((item) => item.id === id);
    delete record[field];
    const result = validateDecisionCoverage(coverage, { stage: 'spec' });
    assert.ok(errorCodes(result).includes(expectedCode), `${id}.${field}: ${result.error_messages}`);
    assert.equal(result.execution_ready, false, `${id}.${field}`);
  }

  const invalidEnums = [
    ['R-001', { source: 'chat' }, 'REQUIREMENT_SOURCE_INVALID'],
    ['R-001', { status: 'approved' }, 'REQUIREMENT_STATUS_INVALID'],
    ['AC-001', { verification_kind: 'smoke' }, 'AC_VERIFICATION_KIND_INVALID'],
    ['AC-001', { blocking: false }, 'AC_BLOCKING_INVALID'],
    ['A-001', { source: 'approved-spec' }, 'ASSUMPTION_SOURCE_INVALID'],
    ['A-001', { confidence: 'certain' }, 'ASSUMPTION_CONFIDENCE_INVALID'],
    ['A-001', { status: 'unresolved' }, 'ASSUMPTION_STATUS_INVALID'],
    ['D-001', { source: 'inferred' }, 'DECISION_SOURCE_INVALID'],
    ['D-001', { status: 'active' }, 'DECISION_STATUS_INVALID'],
    ['D-001', { scope: 'workspace' }, 'DECISION_SCOPE_INVALID'],
  ];
  for (const [id, change, expectedCode] of invalidEnums) {
    const result = validateDecisionCoverage(mutateRecord(validCoverage(), id, change), {
      stage: 'spec',
    });
    assert.ok(errorCodes(result).includes(expectedCode), `${id}: ${result.error_messages}`);
  }
});

test('unresolved blocking decisions fail the spec and execution gates', () => {
  const coverage = mutateRecord(validCoverage(), 'D-001', {
    status: 'proposed',
    blocking: true,
  });
  for (const stage of ['spec', 'plan', 'execution']) {
    const result = validateDecisionCoverage(coverage, { stage });
    assert.equal(result.valid, false, stage);
    assert.equal(result.execution_ready, false, stage);
    assert.ok(blockerCodes(result).includes('DECISION_BLOCKING_UNRESOLVED'), stage);
  }
});

test('deferred assumptions retain owner, revisit condition, and impacted refs', () => {
  const validDeferred = mutateRecord(validCoverage(), 'A-001', {
    status: 'deferred',
    blocking: false,
    owner: 'architecture-owner',
    revisit_condition: 'Before TASK-003 starts',
    impacted_refs: ['R-001', 'D-001'],
  });
  assert.equal(validateDecisionCoverage(validDeferred).valid, true);

  for (const missingField of ['owner', 'rationale', 'revisit_condition', 'impacted_refs']) {
    const change = {
      status: 'deferred',
      blocking: false,
      owner: 'architecture-owner',
      rationale: 'Validation is intentionally deferred to the owner.',
      revisit_condition: 'Before TASK-003 starts',
      impacted_refs: ['R-001'],
    };
    change[missingField] = missingField === 'impacted_refs' ? [] : '';
    const result = validateDecisionCoverage(mutateRecord(validCoverage(), 'A-001', change));
    assert.ok(
      errorCodes(result).includes('ASSUMPTION_DEFERRED_INCOMPLETE'),
      `${missingField}: ${result.error_messages}`,
    );
  }
});

test('proposed blocking assumptions deterministically block execution', () => {
  const coverage = mutateRecord(validCoverage(), 'A-001', {
    status: 'proposed',
    blocking: true,
    impacted_refs: ['R-001'],
  });
  const result = validateDecisionCoverage(coverage, { mode: 'execution' });

  assert.equal(result.valid, false);
  assert.equal(result.execution_ready, false);
  assert.deepEqual(result.blockers.map(({ code, record_id: id }) => [code, id]), [
    ['ASSUMPTION_BLOCKING_UNRESOLVED', 'A-001'],
  ]);
  assert.throws(
    () => assertDecisionCoverage(coverage, { mode: 'execution' }),
    /ASSUMPTION_BLOCKING_UNRESOLVED.*A-001/isu,
  );
});

test('revision history is contiguous and removals retain permanent tombstones', () => {
  const coverage = validCoverage();
  const retired = coverage.records.find(({ id }) => id === 'A-001');
  coverage.revision = 2;
  coverage.records = coverage.records.filter(({ id }) => id !== retired.id);
  coverage.history.push({
    revision: 2,
    active: coverage.records.map(({ id, type }) => active(id, type)),
    tombstones: [
      {
        id: retired.id,
        type: retired.type,
        retired_revision: 2,
        reason: 'The identity source is now contractual.',
      },
    ],
  });
  assert.equal(validateDecisionCoverage(coverage).valid, true);

  const missingTombstone = structuredClone(coverage);
  missingTombstone.history[1].tombstones = [];
  assert.ok(
    errorCodes(validateDecisionCoverage(missingTombstone)).includes('HISTORY_TOMBSTONE_MISSING'),
  );

  const missingRevision = structuredClone(coverage);
  missingRevision.revision = 3;
  assert.ok(
    errorCodes(validateDecisionCoverage(missingRevision)).includes('HISTORY_REVISION_GAP'),
  );
});

test('tombstoned IDs cannot be reused, renumbered silently, or change type', () => {
  const coverage = validCoverage();
  coverage.revision = 2;
  coverage.history.push({
    revision: 2,
    active: coverage.history[0].active.filter(({ id }) => id !== 'A-001'),
    tombstones: [
      {
        id: 'A-001',
        type: 'assumption',
        retired_revision: 2,
        reason: 'Retired for the reuse mutation.',
      },
    ],
  });
  const reused = validateDecisionCoverage(coverage);
  assert.ok(errorCodes(reused).includes('HISTORY_TOMBSTONE_REUSED'));

  const typeChanged = structuredClone(coverage);
  typeChanged.history[1].tombstones[0].type = 'decision';
  assert.ok(errorCodes(validateDecisionCoverage(typeChanged)).includes('HISTORY_TYPE_CHANGED'));
});

test('historical identities stay canonical and tombstone facts stay immutable', () => {
  const malformed = validCoverage();
  malformed.history[0].active[0] = active('R-1', 'requirement');
  assert.ok(errorCodes(validateDecisionCoverage(malformed)).includes('HISTORY_ID_MALFORMED'));

  const coverage = validCoverage();
  coverage.revision = 3;
  coverage.records = coverage.records.filter(({ id }) => id !== 'A-001');
  const remaining = coverage.records.map(({ id, type }) => active(id, type));
  const tombstone = {
    id: 'A-001',
    type: 'assumption',
    retired_revision: 2,
    reason: 'The assumption became contractual.',
  };
  coverage.history.push({ revision: 2, active: remaining, tombstones: [tombstone] });
  coverage.history.push({
    revision: 3,
    active: remaining,
    tombstones: [{ ...tombstone, reason: 'A rewritten retirement reason.' }],
  });
  assert.ok(errorCodes(validateDecisionCoverage(coverage)).includes('HISTORY_TOMBSTONE_CHANGED'));
});

test('a first-seen tombstone requires an active identity in the immediately preceding revision', () => {
  const coverage = validCoverage();
  coverage.revision = 2;
  coverage.history.push({
    revision: 2,
    active: coverage.records.map(({ id, type }) => active(id, type)),
    tombstones: [
      {
        id: 'A-002',
        type: 'assumption',
        retired_revision: 2,
        reason: 'This identity was never active.',
      },
    ],
  });

  assert.ok(
    errorCodes(validateDecisionCoverage(coverage)).includes(
      'HISTORY_TOMBSTONE_WITHOUT_ACTIVE_PREDECESSOR',
    ),
  );
});

test('a newly retired identity records the revision where it left the active snapshot', () => {
  const coverage = validCoverage();
  coverage.revision = 2;
  coverage.records = coverage.records.filter(({ id }) => id !== 'A-001');
  coverage.history.push({
    revision: 2,
    active: coverage.records.map(({ id, type }) => active(id, type)),
    tombstones: [
      {
        id: 'A-001',
        type: 'assumption',
        retired_revision: 1,
        reason: 'The identity left the active snapshot in revision 2.',
      },
    ],
  });

  assert.ok(
    errorCodes(validateDecisionCoverage(coverage)).includes(
      'HISTORY_TOMBSTONE_REVISION_MISMATCH',
    ),
  );
});

test('input order and validation failures are deterministic', () => {
  const outOfOrder = validCoverage();
  outOfOrder.records = [...outOfOrder.records].reverse();
  outOfOrder.history[0].active = [...outOfOrder.history[0].active].reverse();
  const first = validateDecisionCoverage(outOfOrder);
  const second = validateDecisionCoverage(structuredClone(outOfOrder));

  assert.ok(errorCodes(first).includes('ORDER_NONDETERMINISTIC'));
  assert.deepEqual(first.errors, second.errors);
  assert.deepEqual(first.blockers, second.blockers);
  assert.deepEqual([...first.error_messages].sort(), first.error_messages);
});

test('the canonical prose defines stable IDs, history continuity, and execution blocking', async () => {
  const prose = await readFile(new URL('../../_refs/shared/decision-coverage.md', import.meta.url), 'utf8');
  const specTemplate = await readFile(new URL('../../skills/shared/sdlc/02-spec.md', import.meta.url), 'utf8');

  for (const phrase of [
    'R-001',
    'AC-001',
    'A-001',
    'D-001',
    'INV-001',
    'tombstone',
    'no silent renumbering',
    'blocking assumption',
    'deterministic',
  ]) {
    assert.match(prose, new RegExp(phrase, 'iu'), phrase);
  }

  for (const heading of [
    '## Requirements',
    '## Decisions',
    '## Assumptions',
    '## Architecture gate classification',
  ]) {
    assert.match(specTemplate, new RegExp(`^${heading}$`, 'imu'), heading);
  }
});

test('the focused npm alias is part of the repository partition', async () => {
  const packageJson = JSON.parse(
    await readFile(new URL('../../package.json', import.meta.url), 'utf8'),
  );

  assert.equal(
    packageJson.scripts['test:e2e:decision-coverage'],
    'node --test test/e2e/decision-coverage-contract.test.mjs',
  );
  assert.match(
    packageJson.scripts['test:e2e:repository'],
    /(?:^|\s)test\/e2e\/decision-coverage-contract\.test\.mjs(?:\s|$)/u,
  );
});
