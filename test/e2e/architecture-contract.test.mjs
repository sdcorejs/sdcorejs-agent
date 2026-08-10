import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import test from 'node:test';

import { prepareExecution } from '../../_refs/orchestration/execution-contract.mjs';
import {
  ARCHITECTURE_BYPASS_KINDS,
  ARCHITECTURE_REQUIRED_SIGNALS,
  ARCHITECTURE_SCHEMA_VERSION,
  assertArchitectureContext,
  buildArchitectureApprovedPath,
  buildArchitectureDraftPath,
  classifyArchitectureGate,
  resolveArchitectureOwner,
  validateArchitectureContext,
  validateArchitectureDraftPlanHandoff,
  validateArchitecturePrePlanHandoff,
  validateArchitecturePlanHandoff,
  validateArchitectureRevision,
  validateArchitectureWriteScope,
} from '../../_refs/shared/architecture-contract.mjs';
import { createApprovedArtifact } from '../../_refs/shared/approved-artifact.mjs';
import {
  CONVENTION_PRECEDENCE,
  precedenceRank,
  resolveCandidateStatus,
} from '../../_refs/shared/convention-contract.mjs';
import { systemRegistry, validateSystemRegistry } from '../../_refs/shared/system-registry.mjs';

const HASH = `sha256:v1:${'a'.repeat(64)}`;

function active(id, type) {
  return { id, type };
}

function decisionCoverage() {
  const records = [
    {
      id: 'R-001',
      type: 'requirement',
      statement: 'The integration preserves authorization semantics.',
      source: 'explicit-user',
      status: 'active',
      owner_repository_id: 'repository-under-test',
      owner_module_id: null,
      task_refs: ['TASK-001'],
    },
    {
      id: 'AC-001',
      type: 'acceptance-criterion',
      statement: 'Unauthorized callers are denied at the API boundary.',
      behavior: 'An unauthorized caller requests a protected API operation.',
      expected_result: 'The API rejects the operation.',
      verification_kind: 'automated',
      blocking: true,
      requirement_refs: ['R-001'],
      task_refs: ['TASK-001'],
    },
    {
      id: 'A-001',
      type: 'assumption',
      statement: 'The identity provider contract remains stable.',
      source: 'explicit',
      confidence: 'high',
      status: 'confirmed',
      blocking: false,
      evidence_refs: [],
      consequence_if_wrong: 'Authorization identity semantics could change.',
      validation_method: 'Verify the provider contract at the integration boundary.',
      owner: 'repository-under-test',
      rationale: 'The integration relies on the provider identity contract.',
      impacted_refs: ['R-001'],
    },
    {
      id: 'D-001',
      type: 'decision',
      statement: 'Authorization remains server-owned.',
      question: 'Where is authorization enforced?',
      selected_value: 'server-owned authorization',
      source: 'approved-architecture',
      status: 'approved',
      blocking: true,
      scope: 'repository',
      owner_repository_id: 'repository-under-test',
      rationale: 'The server is the authoritative authorization boundary.',
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
      task_refs: ['TASK-001'],
      evidence_refs: ['EVIDENCE-001'],
    },
  ];
  return {
    schema_version: 1,
    revision: 1,
    records,
    history: [{ revision: 1, active: records.map(({ id, type }) => active(id, type)), tombstones: [] }],
  };
}

function validContext(overrides = {}) {
  return {
    schema_version: 1,
    source: 'sdcorejs-architecture',
    contract_id: 'orders-authorization',
    requirement_id: 'R-001',
    approved_spec_reference: {
      repository_id: 'repo-module',
      artifact_id: 'spec-orders-r1',
      artifact_kind: 'spec',
      revision: '1'.repeat(40),
      approval_hash: HASH,
    },
    approved_architecture_path: '.sdcorejs/architecture/angular/2026-08-09-orders.md',
    approved_architecture_hash: HASH,
    owner_repository_id: 'repo-module',
    owner_module_id: 'orders',
    execution_host_repository_id: 'repo-portal',
    integration_owner_repository_id: 'repo-module',
    trigger: {
      required: true,
      signals: ['cross-repository-boundary', 'security-trust-boundary'],
      rationale: 'The module and portal share an authorization contract across a trust boundary.',
    },
    invariants: [
      {
        id: 'INV-001',
        statement: 'Client state never grants authorization.',
        scope: 'public-contract',
        owner: 'repo-module',
        rationale: 'Authorization is server-owned.',
        verification_method: 'API denial test and contract review.',
        requirement_refs: ['R-001'],
        decision_refs: ['D-001'],
      },
    ],
    boundaries: [
      {
        id: 'BOUNDARY-001',
        statement: 'The portal consumes the module API without owning module semantics.',
        owner: 'repo-module',
        invariant_refs: ['INV-001'],
      },
    ],
    dependency_directions: [
      {
        from: 'repo-portal',
        to: 'repo-module',
        rationale: 'The shell depends on the module public contract.',
        invariant_refs: ['INV-001'],
      },
    ],
    data_state_owners: [
      {
        subject: 'authorization-policy',
        owner_repository_id: 'repo-module',
        owner_module_id: 'orders',
        invariant_refs: ['INV-001'],
      },
    ],
    public_contracts: [
      {
        id: 'CONTRACT-001',
        kind: 'api',
        owner: 'repo-module',
        compatibility: 'preserve',
        migration: 'not-required',
        invariant_refs: ['INV-001'],
      },
    ],
    security_trust_boundaries: [
      {
        id: 'TRUST-001',
        statement: 'The API validates identity before authorization.',
        owner: 'repo-module',
        invariant_refs: ['INV-001'],
      },
    ],
    cross_repository_integration: [
      {
        owner_repository_id: 'repo-module',
        child_references: [
          {
            repository_id: 'repo-portal',
            repository_relative_path: 'src/app/orders/entry.ts',
            revision: '2'.repeat(40),
          },
        ],
        invariant_refs: ['INV-001'],
      },
    ],
    adopted_decision_refs: ['D-001'],
    deferred_decision_refs: [],
    assumption_refs: ['A-001'],
    validation_obligations: [
      {
        id: 'VAL-001',
        expected_proof: 'An API test proves unauthorized callers are denied.',
        owner: 'repo-module',
        invariant_refs: ['INV-001'],
        acceptance_criterion_refs: ['AC-001'],
      },
    ],
    profile_sections: {
      frontend_architecture_ref: {
        reference: 'plan_context.frontend_architecture',
        conformance_invariant_refs: ['INV-001'],
      },
      agent_architecture_ref: null,
    },
    change_control: { revision: 1, supersedes: null },
    ...overrides,
  };
}

function artifactMetadata(overrides = {}) {
  return {
    schema_version: 1,
    artifact_id: 'spec-orders-r1',
    artifact_kind: 'spec',
    contract_id: 'orders-authorization',
    requirement_id: 'R-001',
    change_ref: 'orders-auth-change',
    track: 'angular',
    stack_profile: 'plain-angular',
    owner_repository_id: 'repo-module',
    owner_repository_role: 'module',
    owner_module_id: 'orders',
    execution_host_repository_id: 'repo-portal',
    integration_owner_repository_id: 'repo-module',
    repository_relative_path: '.sdcorejs/specs/angular/2026-08-09-orders.md',
    source_revision: '1'.repeat(40),
    parent_repository_id: null,
    parent_references: [],
    supersedes: null,
    approval_source: 'explicit-user-choice',
    approved_at: '2026-08-09T00:00:00.000Z',
    approved_by: null,
    ...overrides,
  };
}

function frontendPlanContext(overrides = {}) {
  return {
    frontend_architecture: {
      required: true,
      conformance_invariant_refs: ['INV-001'],
      ...overrides,
    },
  };
}

function repositoryTopology(overrides = {}) {
  return {
    integration_owner_repository_id: 'repo-module',
    repositories: [
      {
        repository_id: 'repo-module',
        role: 'module',
        module_id: 'orders',
        available: true,
        writable: true,
      },
      {
        repository_id: 'repo-portal',
        role: 'portal',
        module_id: null,
        available: true,
        writable: true,
      },
    ],
    ...overrides,
  };
}

function parentReference(artifact) {
  return {
    repository_id: artifact.metadata.owner_repository_id,
    artifact_id: artifact.metadata.artifact_id,
    artifact_kind: artifact.metadata.artifact_kind,
    revision: artifact.metadata.source_revision,
    approval_hash: artifact.metadata.approval_hash,
  };
}

function approvedGraph({ required = true, metadata_overrides: metadataOverrides = {}, context_overrides: contextOverrides = {} } = {}) {
  const spec = createApprovedArtifact({ metadata: artifactMetadata(metadataOverrides), body: '# Approved spec\n' });
  if (!required) {
    const plan = createApprovedArtifact({
      metadata: artifactMetadata({
        ...metadataOverrides,
        artifact_id: 'plan-orders-r1',
        artifact_kind: 'plan',
        repository_relative_path: '.sdcorejs/plans/angular/2026-08-09-orders.md',
        source_revision: '3'.repeat(40),
        allowed_paths: ['src/**'],
        prohibited_paths: ['.env'],
        parent_references: [parentReference(spec)],
      }),
      body: '# Approved plan\n',
    });
    return { spec, plan };
  }
  const architecture = createApprovedArtifact({
    metadata: artifactMetadata({
      ...metadataOverrides,
      artifact_id: 'architecture-orders-r1',
      artifact_kind: 'architecture',
      repository_relative_path: '.sdcorejs/architecture/angular/2026-08-09-orders.md',
      source_revision: '2'.repeat(40),
      parent_references: [parentReference(spec)],
    }),
    body: '# Approved architecture\n\n- INV-001: Client state never grants authorization.\n',
  });
  const plan = createApprovedArtifact({
    metadata: artifactMetadata({
      ...metadataOverrides,
      artifact_id: 'plan-orders-r1',
      artifact_kind: 'plan',
      repository_relative_path: '.sdcorejs/plans/angular/2026-08-09-orders.md',
      source_revision: '3'.repeat(40),
      allowed_paths: ['src/**'],
      prohibited_paths: ['.env'],
      parent_references: [parentReference(architecture)],
    }),
    body: '# Approved plan\n',
  });
  const context = validContext({
    approved_spec_reference: parentReference(spec),
    approved_architecture_path: architecture.metadata.repository_relative_path,
    approved_architecture_hash: architecture.metadata.approval_hash,
    ...contextOverrides,
  });
  return { spec, architecture, plan, context };
}

function goalBackwardReview() {
  const coverage = decisionCoverage();
  return {
    schema_version: 1,
    mode: 'sdcorejs-plan:goal-backward',
    decision_coverage: coverage,
    goals: [{ id: 'G-001', statement: 'Preserve authorization across the integration.', task_refs: ['TASK-001'] }],
    tasks: [
      {
        id: 'TASK-001',
        owner_repository_id: 'repo-module',
        dependencies: [],
        planned_paths: ['src/orders.ts'],
        planned_evidence: [{ id: 'EVIDENCE-001', record_refs: ['R-001', 'AC-001', 'D-001', 'INV-001'] }],
        justification_refs: ['R-001', 'D-001'],
        enforces_invariant_refs: ['INV-001'],
      },
    ],
    repository_inventory: {
      repositories: [{ repository_id: 'repo-module', existing_paths: ['src/orders.ts'], intended_new_paths: [] }],
    },
    critique_history: [{ round: 1, checker_version: 'sdcorejs-plan:goal-backward:v1', blockers: [], resolved_blockers: [], unresolved_blockers: [] }],
  };
}

function executionInput(graph, gate, architectureContext = null) {
  const review = goalBackwardReview();
  return {
    approved_plan: graph.plan,
    approved_spec: graph.spec,
    approved_architecture: graph.architecture ?? null,
    repository_plan: {
      schema_version: 1,
      integration_owner_repository_id: 'repo-module',
      gitlink_updates_in_scope: false,
      dependency_order: ['orders'],
      repositories: [{ repository_id: 'repo-module', role: 'module', module_id: 'orders', available: true, writable: true }],
      steps: [{
        id: 'module-write',
        action: 'EDIT',
        semantic_scope: 'module',
        owner_repository_id: 'repo-module',
        git_roots: ['repo-module'],
        allowed_paths: ['src/**'],
        prohibited_paths: ['.env'],
        depends_on: [],
      }],
    },
    owner_revisions: { 'repo-module': graph.plan.metadata.source_revision },
    plan_context: {
      schema_version: 2,
      decision_coverage: review.decision_coverage,
      goal_backward_review: review,
      architecture_gate: gate,
      architecture_context: architectureContext,
      ...frontendPlanContext(),
    },
  };
}

function blockerCodes(result) {
  return result.blockers.map(({ code }) => code);
}

test('required architecture signals are explicit, canonical, and deterministic', () => {
  assert.ok(ARCHITECTURE_REQUIRED_SIGNALS.length >= 8);
  for (const signal of ARCHITECTURE_REQUIRED_SIGNALS) {
    const result = classifyArchitectureGate({
      signals: [signal],
      rationale: `Signal ${signal} requires a shared boundary decision.`,
    });
    assert.equal(result.valid, true, signal);
    assert.equal(result.required, true, signal);
    assert.deepEqual(result.signals, [signal], signal);
  }
  const repeated = classifyArchitectureGate({
    signals: ['security-trust-boundary', 'cross-repository-boundary'],
    rationale: 'Both signals apply.',
  });
  assert.deepEqual(repeated, classifyArchitectureGate({
    signals: ['cross-repository-boundary', 'security-trust-boundary'],
    rationale: 'Both signals apply.',
  }));
  assert.deepEqual(repeated.signals, ['cross-repository-boundary', 'security-trust-boundary']);
});

test('concrete bypasses stay not-applicable while ambiguity and conflicts block', () => {
  assert.ok(ARCHITECTURE_BYPASS_KINDS.includes('simple-four-field-drawer'));
  for (const kind of ARCHITECTURE_BYPASS_KINDS) {
    const result = classifyArchitectureGate({
      signals: [],
      bypass: { kind, rationale: `The change is bounded as ${kind}.` },
    });
    assert.equal(result.valid, true, kind);
    assert.equal(result.required, false, kind);
  }
  for (const input of [
    { signals: [], rationale: '' },
    { signals: ['unknown-signal'], rationale: 'Unknown.' },
    { signals: ['public-api-contract'], rationale: 'API changes.', bypass: { kind: 'bounded-bug-fix', rationale: 'No architecture.' } },
  ]) {
    const result = classifyArchitectureGate(input);
    assert.equal(result.valid, false);
    assert.equal(result.required, null);
    assert.deepEqual(result.blocker_messages, [...result.blocker_messages].sort());
  }
});

test('lean architecture context validates typed records and returns isolated output', () => {
  const input = validContext();
  const snapshot = structuredClone(input);
  const result = validateArchitectureContext(input, { decision_coverage: decisionCoverage() });
  assert.equal(result.valid, true, result.blocker_messages.join('\n'));
  assert.equal(result.approval_ready, true);
  assert.deepEqual(input, snapshot);
  result.context.invariants[0].statement = 'mutated result';
  assert.deepEqual(input, snapshot);
  assert.equal(assertArchitectureContext(input, { decision_coverage: decisionCoverage() }).valid, true);
});

test('architecture context fails closed for malformed, dangling, unsafe, or vacuous fields', () => {
  const cases = [
    ['wrong source', (value) => { value.source = 'sdcorejs-plan'; }, 'SOURCE_INVALID'],
    ['unsafe path', (value) => { value.approved_architecture_path = '../outside.md'; }, 'ARCHITECTURE_PATH_INVALID'],
    ['bad hash', (value) => { value.approved_architecture_hash = 'sha256:v1:bad'; }, 'ARCHITECTURE_HASH_INVALID'],
    ['empty invariants', (value) => { value.invariants = []; }, 'INVARIANTS_EMPTY'],
    ['bad invariant id', (value) => { value.invariants[0].id = 'INV-1'; }, 'INVARIANT_ID_INVALID'],
    ['dangling requirement', (value) => { value.invariants[0].requirement_refs = ['R-999']; }, 'REQUIREMENT_REFERENCE_DANGLING'],
    ['dangling decision', (value) => { value.adopted_decision_refs = ['D-999']; }, 'DECISION_REFERENCE_DANGLING'],
    ['dangling assumption', (value) => { value.assumption_refs = ['A-999']; }, 'ASSUMPTION_REFERENCE_DANGLING'],
    ['dangling profile invariant', (value) => { value.profile_sections.frontend_architecture_ref.conformance_invariant_refs = ['INV-999']; }, 'INVARIANT_REFERENCE_DANGLING'],
    ['vacuous validation', (value) => { value.validation_obligations = []; }, 'VALIDATION_OBLIGATIONS_EMPTY'],
    ['malformed collection', (value) => { value.public_contracts = {}; }, 'PUBLIC_CONTRACTS_INVALID'],
    ['trigger mismatch', (value) => { value.trigger.signals = []; }, 'TRIGGER_INVALID'],
    ['bad revision', (value) => { value.change_control = { revision: 2, supersedes: null }; }, 'SUPERSEDES_REQUIRED'],
  ];
  for (const [name, mutate, code] of cases) {
    const context = validContext();
    mutate(context);
    let first;
    assert.doesNotThrow(() => { first = validateArchitectureContext(context, { decision_coverage: decisionCoverage() }); }, name);
    const second = validateArchitectureContext(structuredClone(context), { decision_coverage: decisionCoverage() });
    assert.equal(first.valid, false, name);
    assert.ok(blockerCodes(first).includes(code), `${name}: ${first.blocker_messages.join('\n')}`);
    assert.deepEqual(first.blockers, second.blockers, name);
  }
});

test('architecture validation rejects uncloneable input instead of returning a valid null context', () => {
  const context = validContext();
  context.untrusted_extension = () => 'not portable';
  let result;
  assert.doesNotThrow(() => {
    result = validateArchitectureContext(context, { decision_coverage: decisionCoverage() });
  });
  assert.equal(result.valid, false);
  assert.ok(blockerCodes(result).includes('CONTEXT_NOT_CLONEABLE'));
  assert.equal(result.context, null);

  const gate = classifyArchitectureGate({
    signals: [],
    bypass: {
      kind: 'bounded-bug-fix',
      rationale: 'Existing architecture is unchanged.',
      untrusted_extension: () => 'not portable',
    },
  });
  assert.equal(gate.valid, false);
  assert.ok(blockerCodes(gate).includes('GATE_NOT_CLONEABLE'));
});

test('profile-specific architecture remains referenced and proves INV conformance', () => {
  for (const field of ['frontend_architecture_ref', 'agent_architecture_ref']) {
    const context = validContext();
    context.profile_sections[field] = {
      reference: `plan_context.${field.replace('_ref', '')}`,
      conformance_invariant_refs: ['INV-001'],
    };
    assert.equal(validateArchitectureContext(context, { decision_coverage: decisionCoverage() }).valid, true, field);
    context.profile_sections[field].conformance_invariant_refs = [];
    assert.ok(blockerCodes(validateArchitectureContext(context, { decision_coverage: decisionCoverage() })).includes('PROFILE_INVARIANT_CONFORMANCE_MISSING'));
  }
});

test('architecture paths use only the canonical draft and approved roots', () => {
  assert.equal(
    buildArchitectureDraftPath({ timestamp: '2026-08-09', topic: 'orders-auth' }),
    '.sdcorejs/docs/architecture/2026-08-09-orders-auth-architecture.md',
  );
  assert.equal(
    buildArchitectureApprovedPath({ track: 'angular', timestamp: '2026-08-09', topic: 'orders-auth' }),
    '.sdcorejs/architecture/angular/2026-08-09-orders-auth.md',
  );
  for (const topic of ['../escape', '/absolute', 'C:/drive', 'orders\\auth', 'orders auth']) {
    assert.throws(() => buildArchitectureApprovedPath({ track: 'angular', timestamp: '2026-08-09', topic }), /safe path segment/iu);
  }
});

test('semantic ownership blocks missing owners and never falls back from a module to the portal', () => {
  const repositories = [
    { repository_id: 'repo-module', role: 'module', module_id: 'orders', available: true, writable: true },
    { repository_id: 'repo-portal', role: 'portal', module_id: null, available: true, writable: true },
  ];
  assert.equal(resolveArchitectureOwner({ scope: 'module-internal', module_id: 'orders', repositories }).owner_repository_id, 'repo-module');
  assert.equal(resolveArchitectureOwner({ scope: 'portal-composition', integration_owner_repository_id: 'repo-portal', repositories }).owner_repository_id, 'repo-portal');
  assert.equal(resolveArchitectureOwner({ scope: 'cross-repository', integration_owner_repository_id: 'repo-module', repositories }).owner_repository_id, 'repo-module');

  const moduleMissing = repositories.filter(({ role }) => role !== 'module');
  assert.throws(
    () => resolveArchitectureOwner({ scope: 'module-internal', module_id: 'orders', repositories: moduleMissing }),
    /portal fallback is forbidden/iu,
  );
  const unavailable = repositories.map((repository) => repository.role === 'module' ? { ...repository, writable: false } : repository);
  assert.throws(
    () => resolveArchitectureOwner({ scope: 'module-internal', module_id: 'orders', repositories: unavailable }),
    /unavailable or not writable/iu,
  );
});

test('required artifact graph is spec to architecture to plan with exact handoff identity', () => {
  const graph = approvedGraph();
  const gate = classifyArchitectureGate({
    signals: graph.context.trigger.signals,
    rationale: graph.context.trigger.rationale,
  });
  const result = validateArchitecturePlanHandoff({
    gate,
    architecture_context: graph.context,
    approved_spec: graph.spec,
    approved_architecture: graph.architecture,
    approved_plan: graph.plan,
    decision_coverage: decisionCoverage(),
    plan_context: frontendPlanContext(),
    repository_topology: repositoryTopology(),
  });
  assert.equal(result.valid, true, result.blocker_messages.join('\n'));
  assert.equal(result.architecture_required, true);

  const mutations = [
    ['missing architecture', (value) => { value.approved_architecture = null; }],
    ['stale context hash', (value) => { value.architecture_context.approved_architecture_hash = HASH; }],
    ['wrong context path', (value) => { value.architecture_context.approved_architecture_path = '.sdcorejs/architecture/angular/wrong.md'; }],
    ['trigger drift', (value) => { value.architecture_context.trigger.signals = ['cross-repository-boundary']; }],
    ['mutated architecture', (value) => { value.approved_architecture.body += 'mutated\n'; }],
  ];
  for (const [name, mutate] of mutations) {
    const fresh = approvedGraph();
    const input = {
      gate,
      architecture_context: fresh.context,
      approved_spec: fresh.spec,
      approved_architecture: fresh.architecture,
      approved_plan: fresh.plan,
      decision_coverage: decisionCoverage(),
      plan_context: frontendPlanContext(),
      repository_topology: repositoryTopology(),
    };
    mutate(input);
    const invalid = validateArchitecturePlanHandoff(input);
    assert.equal(invalid.valid, false, name);
    assert.deepEqual(invalid.blocker_messages, [...invalid.blocker_messages].sort(), name);
  }
});

test('pre-plan handoff validates architecture readiness without requiring a future plan', () => {
  const graph = approvedGraph();
  const gate = classifyArchitectureGate({
    signals: graph.context.trigger.signals,
    rationale: graph.context.trigger.rationale,
  });
  const required = validateArchitecturePrePlanHandoff({
    gate,
    architecture_context: graph.context,
    approved_spec: graph.spec,
    approved_architecture: graph.architecture,
    decision_coverage: decisionCoverage(),
    repository_topology: repositoryTopology(),
  });
  assert.equal(required.valid, true, required.blocker_messages.join('\n'));
  assert.equal(required.architecture_required, true);

  const missingArchitecture = validateArchitecturePrePlanHandoff({
    gate,
    architecture_context: graph.context,
    approved_spec: graph.spec,
    approved_architecture: null,
    decision_coverage: decisionCoverage(),
    repository_topology: repositoryTopology(),
  });
  assert.equal(missingArchitecture.valid, false);
  assert.ok(blockerCodes(missingArchitecture).includes('ARCHITECTURE_ARTIFACT_INVALID'));

  const bypassGraph = approvedGraph({ required: false });
  const bypass = classifyArchitectureGate({
    signals: [],
    bypass: { kind: 'bounded-bug-fix', rationale: 'The fix preserves all boundaries.' },
  });
  assert.equal(validateArchitecturePrePlanHandoff({
    gate: bypass,
    architecture_context: null,
    approved_spec: bypassGraph.spec,
    approved_architecture: null,
  }).valid, true);

  const draft = validateArchitectureDraftPlanHandoff({
    gate,
    architecture_context: graph.context,
    approved_spec: graph.spec,
    approved_architecture: graph.architecture,
    decision_coverage: decisionCoverage(),
    plan_context: frontendPlanContext(),
    plan_metadata: {
      track: graph.plan.metadata.track,
      stack_profile: graph.plan.metadata.stack_profile,
    },
    repository_topology: repositoryTopology(),
  });
  assert.equal(draft.valid, true, draft.blocker_messages.join('\n'));
  const draftProfileDrift = validateArchitectureDraftPlanHandoff({
    gate,
    architecture_context: graph.context,
    approved_spec: graph.spec,
    approved_architecture: graph.architecture,
    decision_coverage: decisionCoverage(),
    plan_context: { frontend_architecture: { required: true, conformance_invariant_refs: [] } },
    plan_metadata: {
      track: graph.plan.metadata.track,
      stack_profile: graph.plan.metadata.stack_profile,
    },
    repository_topology: repositoryTopology(),
  });
  assert.ok(blockerCodes(draftProfileDrift).includes('PROFILE_CONFORMANCE_MISMATCH'));

  const fullWithoutPlan = validateArchitecturePlanHandoff({
    gate,
    architecture_context: graph.context,
    approved_spec: graph.spec,
    approved_architecture: graph.architecture,
    approved_plan: null,
    decision_coverage: decisionCoverage(),
    plan_context: frontendPlanContext(),
    repository_topology: repositoryTopology(),
  });
  assert.equal(fullWithoutPlan.valid, false);
  assert.ok(blockerCodes(fullWithoutPlan).includes('PLAN_INVALID'));
});

test('architecture handoff fails closed without throwing for malformed nested artifacts', () => {
  const graph = approvedGraph();
  const gate = classifyArchitectureGate({
    signals: graph.context.trigger.signals,
    rationale: graph.context.trigger.rationale,
  });
  const mutations = [
    ['missing spec', (value) => { value.approved_spec = null; }],
    ['malformed architecture metadata', (value) => { value.approved_architecture.metadata = null; }],
    ['malformed plan body', (value) => { value.approved_plan.body = null; }],
    ['malformed context collection', (value) => { value.architecture_context.boundaries = [null]; }],
  ];
  for (const [name, mutate] of mutations) {
    const fresh = approvedGraph();
    const input = {
      gate,
      architecture_context: fresh.context,
      approved_spec: fresh.spec,
      approved_architecture: fresh.architecture,
      approved_plan: fresh.plan,
      decision_coverage: decisionCoverage(),
      plan_context: frontendPlanContext(),
      repository_topology: repositoryTopology(),
    };
    mutate(input);
    let result;
    assert.doesNotThrow(() => { result = validateArchitecturePlanHandoff(input); }, name);
    assert.equal(result.valid, false, name);
    assert.deepEqual(result.blocker_messages, [...result.blocker_messages].sort(), name);
  }
});

test('handoff reclassifies the gate and rejects forged bypass identity', () => {
  const graph = approvedGraph({ required: false });
  const forgedGate = {
    valid: true,
    required: false,
    status: 'not-applicable',
    signals: ['public-api-contract'],
    bypass: null,
    rationale: 'Forged bypass.',
    blockers: [],
    blocker_messages: [],
  };
  const result = validateArchitecturePlanHandoff({
    gate: forgedGate,
    architecture_context: null,
    approved_spec: graph.spec,
    approved_architecture: null,
    approved_plan: graph.plan,
  });
  assert.equal(result.valid, false);
  assert.ok(blockerCodes(result).includes('GATE_IDENTITY_INVALID'));

  const execution = executionInput(graph, forgedGate, null);
  assert.throws(() => prepareExecution(execution), /architecture handoff blocked/iu);
});

test('signal-triggered architecture requires relevant typed evidence', () => {
  const evidenceBySignal = {
    'architectural-paradigm': ['adopted_decision_refs'],
    'conflicting-independent-unit-decisions': ['adopted_decision_refs'],
    'cross-module-boundary': ['boundaries'],
    'cross-repository-boundary': ['boundaries', 'cross_repository_integration'],
    'event-contract': ['public_contracts'],
    'integration-owner-dependency-direction': ['dependency_directions'],
    'major-dependency': ['dependency_directions'],
    'persisted-data-model-contract': ['public_contracts'],
    'public-api-contract': ['public_contracts'],
    'queue-topic-contract': ['public_contracts'],
    'security-trust-boundary': ['security_trust_boundaries'],
    'state-data-ownership': ['data_state_owners'],
  };
  assert.deepEqual(Object.keys(evidenceBySignal).sort(), [...ARCHITECTURE_REQUIRED_SIGNALS]);
  for (const [signal, fields] of Object.entries(evidenceBySignal)) {
    const context = validContext({
      trigger: {
        required: true,
        signals: [signal],
        rationale: `${signal} requires architecture evidence.`,
      },
      ...Object.fromEntries(fields.map((field) => [field, []])),
    });
    const result = validateArchitectureContext(context, { decision_coverage: decisionCoverage() });
    assert.equal(result.valid, false, signal);
    assert.ok(blockerCodes(result).includes('SIGNAL_EVIDENCE_MISSING'), signal);
    assert.match(result.blocker_messages.join('\n'), new RegExp(signal, 'iu'), signal);
  }

  for (const [signal, kind] of [
    ['public-api-contract', 'event'],
    ['event-contract', 'api'],
    ['queue-topic-contract', 'totally-unrelated-kind'],
    ['persisted-data-model-contract', 'api'],
  ]) {
    const context = validContext({
      trigger: { required: true, signals: [signal], rationale: `${signal} applies.` },
      public_contracts: [{
        id: 'CONTRACT-001',
        kind,
        owner: 'repo-module',
        compatibility: 'preserve',
        migration: 'not-required',
        invariant_refs: ['INV-001'],
      }],
    });
    const result = validateArchitectureContext(context, { decision_coverage: decisionCoverage() });
    assert.equal(result.valid, false, `${signal}:${kind}`);
    assert.ok(blockerCodes(result).includes('SIGNAL_EVIDENCE_MISMATCH'), `${signal}:${kind}`);
  }
});

test('handoff binds semantic integration ownership to metadata and resolved topology', () => {
  const graph = approvedGraph();
  const gate = classifyArchitectureGate({
    signals: graph.context.trigger.signals,
    rationale: graph.context.trigger.rationale,
  });
  const base = {
    gate,
    architecture_context: graph.context,
    approved_spec: graph.spec,
    approved_architecture: graph.architecture,
    approved_plan: graph.plan,
    decision_coverage: decisionCoverage(),
    plan_context: frontendPlanContext(),
    repository_topology: repositoryTopology(),
  };
  assert.equal(validateArchitecturePlanHandoff(base).valid, true);

  const mismatched = structuredClone(base);
  mismatched.architecture_context.integration_owner_repository_id = 'repo-other';
  assert.ok(blockerCodes(validateArchitecturePlanHandoff(mismatched)).includes('ARCHITECTURE_METADATA_MISMATCH'));

  const unavailable = structuredClone(base);
  unavailable.repository_topology.repositories[0].writable = false;
  assert.ok(blockerCodes(validateArchitecturePlanHandoff(unavailable)).includes('INTEGRATION_OWNER_UNAVAILABLE'));

  const duplicate = structuredClone(base);
  duplicate.repository_topology.repositories.push(structuredClone(duplicate.repository_topology.repositories[0]));
  assert.ok(blockerCodes(validateArchitecturePlanHandoff(duplicate)).includes('INTEGRATION_OWNER_AMBIGUOUS'));

  const nestedOwner = structuredClone(base);
  nestedOwner.architecture_context.cross_repository_integration[0].owner_repository_id = 'repo-unrelated';
  assert.ok(blockerCodes(validateArchitecturePlanHandoff(nestedOwner)).includes('CROSS_REPOSITORY_OWNER_MISMATCH'));
});

test('frontend and agent profile references bind to the exact applicable plan block', () => {
  const graph = approvedGraph();
  const gate = classifyArchitectureGate({
    signals: graph.context.trigger.signals,
    rationale: graph.context.trigger.rationale,
  });
  const input = {
    gate,
    architecture_context: graph.context,
    approved_spec: graph.spec,
    approved_architecture: graph.architecture,
    approved_plan: graph.plan,
    decision_coverage: decisionCoverage(),
    plan_context: frontendPlanContext(),
    repository_topology: repositoryTopology(),
  };
  assert.equal(validateArchitecturePlanHandoff(input).valid, true);

  const missing = structuredClone(input);
  missing.architecture_context.profile_sections.frontend_architecture_ref = null;
  assert.ok(blockerCodes(validateArchitecturePlanHandoff(missing)).includes('PROFILE_REFERENCE_REQUIRED'));

  const wrongTarget = structuredClone(input);
  wrongTarget.architecture_context.profile_sections.frontend_architecture_ref.reference = 'plan_context.agent_architecture';
  assert.ok(blockerCodes(validateArchitecturePlanHandoff(wrongTarget)).includes('PROFILE_REFERENCE_TARGET_INVALID'));

  const drifted = structuredClone(input);
  drifted.plan_context.frontend_architecture.conformance_invariant_refs = ['INV-999'];
  assert.ok(blockerCodes(validateArchitecturePlanHandoff(drifted)).includes('PROFILE_CONFORMANCE_MISMATCH'));
});

test('AI-agent plans require an exact agent architecture reference and invariant conformance', () => {
  const profileMetadata = { track: 'ai-agent', stack_profile: 'ai-agent' };
  const spec = createApprovedArtifact({
    metadata: artifactMetadata(profileMetadata),
    body: '# Approved AI-agent spec\n',
  });
  const architecture = createApprovedArtifact({
    metadata: artifactMetadata({
      ...profileMetadata,
      artifact_id: 'architecture-agent-r1',
      artifact_kind: 'architecture',
      repository_relative_path: '.sdcorejs/architecture/ai-agent/2026-08-09-agent.md',
      source_revision: '2'.repeat(40),
      parent_references: [parentReference(spec)],
    }),
    body: '# Approved AI-agent architecture\n',
  });
  const plan = createApprovedArtifact({
    metadata: artifactMetadata({
      ...profileMetadata,
      artifact_id: 'plan-agent-r1',
      artifact_kind: 'plan',
      repository_relative_path: '.sdcorejs/plans/ai-agent/2026-08-09-agent.md',
      source_revision: '3'.repeat(40),
      allowed_paths: ['src/**'],
      prohibited_paths: ['.env'],
      parent_references: [parentReference(architecture)],
    }),
    body: '# Approved AI-agent plan\n',
  });
  const context = validContext({
    approved_spec_reference: parentReference(spec),
    approved_architecture_path: architecture.metadata.repository_relative_path,
    approved_architecture_hash: architecture.metadata.approval_hash,
    profile_sections: {
      frontend_architecture_ref: null,
      agent_architecture_ref: {
        reference: 'plan_context.agent_architecture',
        conformance_invariant_refs: ['INV-001'],
      },
    },
  });
  const gate = classifyArchitectureGate({
    signals: context.trigger.signals,
    rationale: context.trigger.rationale,
  });
  const input = {
    gate,
    architecture_context: context,
    approved_spec: spec,
    approved_architecture: architecture,
    approved_plan: plan,
    decision_coverage: decisionCoverage(),
    plan_context: {
      agent_architecture: { required: true, conformance_invariant_refs: ['INV-001'] },
    },
    repository_topology: repositoryTopology(),
  };
  assert.equal(validateArchitecturePlanHandoff(input).valid, true);
  const missing = structuredClone(input);
  missing.architecture_context.profile_sections.agent_architecture_ref = null;
  assert.ok(blockerCodes(validateArchitecturePlanHandoff(missing)).includes('PROFILE_REFERENCE_REQUIRED'));
  const drifted = structuredClone(input);
  drifted.plan_context.agent_architecture.conformance_invariant_refs = [];
  assert.ok(blockerCodes(validateArchitecturePlanHandoff(drifted)).includes('PROFILE_CONFORMANCE_MISMATCH'));
  const metadataBypass = structuredClone(input);
  metadataBypass.plan_context.agent_architecture = {
    required: false,
    not_applicable_reason: 'Attempted metadata bypass.',
    conformance_invariant_refs: [],
  };
  metadataBypass.architecture_context.profile_sections.agent_architecture_ref = null;
  assert.ok(blockerCodes(validateArchitecturePlanHandoff(metadataBypass)).includes('PROFILE_APPLICABILITY_MISMATCH'));

  const downgradedPlanContext = {
    agent_architecture: {
      required: false,
      not_applicable_reason: 'Attempted track downgrade.',
      conformance_invariant_refs: [],
    },
  };
  const downgradedContext = structuredClone(context);
  downgradedContext.profile_sections.agent_architecture_ref = null;
  const downgradedDraft = validateArchitectureDraftPlanHandoff({
    gate,
    architecture_context: downgradedContext,
    approved_spec: spec,
    approved_architecture: architecture,
    decision_coverage: decisionCoverage(),
    plan_context: downgradedPlanContext,
    plan_metadata: { track: 'general', stack_profile: 'general' },
    repository_topology: repositoryTopology(),
  });
  assert.ok(blockerCodes(downgradedDraft).includes('PLAN_METADATA_MISMATCH'));
  assert.ok(blockerCodes(downgradedDraft).includes('PROFILE_APPLICABILITY_MISMATCH'));

  const downgradedPlan = createApprovedArtifact({
    metadata: artifactMetadata({
      track: 'general',
      stack_profile: 'general',
      artifact_id: 'plan-agent-downgraded-r1',
      artifact_kind: 'plan',
      repository_relative_path: '.sdcorejs/plans/general/2026-08-09-agent.md',
      source_revision: '4'.repeat(40),
      allowed_paths: ['src/**'],
      prohibited_paths: ['.env'],
      parent_references: [parentReference(architecture)],
    }),
    body: '# Downgraded plan\n',
  });
  const downgradedFull = validateArchitecturePlanHandoff({
    ...input,
    architecture_context: downgradedContext,
    approved_plan: downgradedPlan,
    plan_context: downgradedPlanContext,
  });
  assert.ok(blockerCodes(downgradedFull).includes('PLAN_METADATA_MISMATCH'));

  const jointlyDowngradedArchitecture = createApprovedArtifact({
    metadata: artifactMetadata({
      track: 'general',
      stack_profile: 'general',
      artifact_id: 'architecture-agent-downgraded-r1',
      artifact_kind: 'architecture',
      repository_relative_path: '.sdcorejs/architecture/general/2026-08-09-agent.md',
      source_revision: '4'.repeat(40),
      parent_references: [parentReference(spec)],
    }),
    body: '# Jointly downgraded architecture\n',
  });
  const jointlyDowngradedContext = validContext({
    approved_spec_reference: parentReference(spec),
    approved_architecture_path: jointlyDowngradedArchitecture.metadata.repository_relative_path,
    approved_architecture_hash: jointlyDowngradedArchitecture.metadata.approval_hash,
    profile_sections: {
      frontend_architecture_ref: null,
      agent_architecture_ref: null,
    },
  });
  const jointlyDowngradedPlanContext = {
    agent_architecture: {
      required: false,
      not_applicable_reason: 'Architecture and plan both attempted to downgrade the spec.',
      conformance_invariant_refs: [],
    },
  };
  const jointlyDowngradedPrePlan = validateArchitecturePrePlanHandoff({
    gate,
    architecture_context: jointlyDowngradedContext,
    approved_spec: spec,
    approved_architecture: jointlyDowngradedArchitecture,
    decision_coverage: decisionCoverage(),
    repository_topology: repositoryTopology(),
  });
  assert.ok(blockerCodes(jointlyDowngradedPrePlan).includes('ARCHITECTURE_METADATA_MISMATCH'));

  const jointlyDowngradedDraft = validateArchitectureDraftPlanHandoff({
    gate,
    architecture_context: jointlyDowngradedContext,
    approved_spec: spec,
    approved_architecture: jointlyDowngradedArchitecture,
    decision_coverage: decisionCoverage(),
    plan_context: jointlyDowngradedPlanContext,
    plan_metadata: { track: 'general', stack_profile: 'general' },
    repository_topology: repositoryTopology(),
  });
  assert.ok(blockerCodes(jointlyDowngradedDraft).includes('ARCHITECTURE_METADATA_MISMATCH'));
  assert.ok(blockerCodes(jointlyDowngradedDraft).includes('PLAN_METADATA_MISMATCH'));
  assert.ok(blockerCodes(jointlyDowngradedDraft).includes('PROFILE_APPLICABILITY_MISMATCH'));

  const jointlyDowngradedPlan = createApprovedArtifact({
    metadata: artifactMetadata({
      track: 'general',
      stack_profile: 'general',
      artifact_id: 'plan-agent-jointly-downgraded-r1',
      artifact_kind: 'plan',
      repository_relative_path: '.sdcorejs/plans/general/2026-08-09-agent.md',
      source_revision: '5'.repeat(40),
      allowed_paths: ['src/**'],
      prohibited_paths: ['.env'],
      parent_references: [parentReference(jointlyDowngradedArchitecture)],
    }),
    body: '# Jointly downgraded plan\n',
  });
  const jointlyDowngradedFull = validateArchitecturePlanHandoff({
    gate,
    architecture_context: jointlyDowngradedContext,
    approved_spec: spec,
    approved_architecture: jointlyDowngradedArchitecture,
    approved_plan: jointlyDowngradedPlan,
    decision_coverage: decisionCoverage(),
    plan_context: jointlyDowngradedPlanContext,
    repository_topology: repositoryTopology(),
  });
  assert.ok(blockerCodes(jointlyDowngradedFull).includes('ARCHITECTURE_METADATA_MISMATCH'));
  assert.ok(blockerCodes(jointlyDowngradedFull).includes('PLAN_METADATA_MISMATCH'));
  assert.ok(blockerCodes(jointlyDowngradedFull).includes('PROFILE_APPLICABILITY_MISMATCH'));
});

test('explicit plan profile applicability governs mixed and server-only handoffs', () => {
  const mixed = approvedGraph({
    metadata_overrides: { track: 'general', stack_profile: 'general' },
  });
  const mixedGate = classifyArchitectureGate({
    signals: mixed.context.trigger.signals,
    rationale: mixed.context.trigger.rationale,
  });
  const mixedInput = {
    gate: mixedGate,
    architecture_context: mixed.context,
    approved_spec: mixed.spec,
    approved_architecture: mixed.architecture,
    approved_plan: mixed.plan,
    decision_coverage: decisionCoverage(),
    plan_context: frontendPlanContext(),
    repository_topology: repositoryTopology(),
  };
  assert.equal(validateArchitecturePlanHandoff(mixedInput).valid, true);
  const missingMixedReference = structuredClone(mixedInput);
  missingMixedReference.architecture_context.profile_sections.frontend_architecture_ref = null;
  assert.ok(blockerCodes(validateArchitecturePlanHandoff(missingMixedReference)).includes('PROFILE_REFERENCE_REQUIRED'));

  const serverOnly = approvedGraph({
    metadata_overrides: { track: 'nextjs', stack_profile: 'plain-nextjs' },
    context_overrides: {
      profile_sections: { frontend_architecture_ref: null, agent_architecture_ref: null },
    },
  });
  const serverInput = {
    gate: classifyArchitectureGate({
      signals: serverOnly.context.trigger.signals,
      rationale: serverOnly.context.trigger.rationale,
    }),
    architecture_context: serverOnly.context,
    approved_spec: serverOnly.spec,
    approved_architecture: serverOnly.architecture,
    approved_plan: serverOnly.plan,
    decision_coverage: decisionCoverage(),
    plan_context: {
      frontend_architecture: {
        required: false,
        not_applicable_reason: 'The change is server-only and has no frontend surface.',
        conformance_invariant_refs: [],
      },
    },
    repository_topology: repositoryTopology(),
  };
  assert.equal(validateArchitecturePlanHandoff(serverInput).valid, true);
  const missingReason = structuredClone(serverInput);
  missingReason.plan_context.frontend_architecture.not_applicable_reason = null;
  assert.ok(blockerCodes(validateArchitecturePlanHandoff(missingReason)).includes('PROFILE_NOT_APPLICABLE_REASON_REQUIRED'));
});

test('standalone and portal artifacts allow a null module owner through approval and handoff', () => {
  for (const ownerRole of ['standalone', 'portal']) {
    const repositoryId = `repo-${ownerRole}`;
    const common = {
      contract_id: `${ownerRole}-contract`,
      change_ref: `${ownerRole}-change`,
      track: 'general',
      stack_profile: 'general',
      owner_repository_id: repositoryId,
      owner_repository_role: ownerRole,
      owner_module_id: null,
      execution_host_repository_id: repositoryId,
      integration_owner_repository_id: repositoryId,
    };
    const spec = createApprovedArtifact({
      metadata: artifactMetadata({
        ...common,
        artifact_id: `spec-${ownerRole}-r1`,
        repository_relative_path: `.sdcorejs/specs/general/2026-08-09-${ownerRole}.md`,
      }),
      body: `# Approved ${ownerRole} spec\n`,
    });
    const architecture = createApprovedArtifact({
      metadata: artifactMetadata({
        ...common,
        artifact_id: `architecture-${ownerRole}-r1`,
        artifact_kind: 'architecture',
        repository_relative_path: `.sdcorejs/architecture/general/2026-08-09-${ownerRole}.md`,
        source_revision: '2'.repeat(40),
        parent_references: [parentReference(spec)],
      }),
      body: `# Approved ${ownerRole} architecture\n`,
    });
    const plan = createApprovedArtifact({
      metadata: artifactMetadata({
        ...common,
        artifact_id: `plan-${ownerRole}-r1`,
        artifact_kind: 'plan',
        repository_relative_path: `.sdcorejs/plans/general/2026-08-09-${ownerRole}.md`,
        source_revision: '3'.repeat(40),
        allowed_paths: ['src/**'],
        prohibited_paths: ['.env'],
        parent_references: [parentReference(architecture)],
      }),
      body: `# Approved ${ownerRole} plan\n`,
    });
    const context = validContext({
      contract_id: common.contract_id,
      approved_spec_reference: parentReference(spec),
      approved_architecture_path: architecture.metadata.repository_relative_path,
      approved_architecture_hash: architecture.metadata.approval_hash,
      owner_repository_id: repositoryId,
      owner_module_id: null,
      execution_host_repository_id: repositoryId,
      integration_owner_repository_id: repositoryId,
      trigger: {
        required: true,
        signals: ['major-dependency'],
        rationale: 'The approved dependency direction must be stable before execution.',
      },
      boundaries: [],
      dependency_directions: [{
        from: repositoryId,
        to: 'approved-dependency',
        rationale: 'The owner consumes the dependency public contract.',
        invariant_refs: ['INV-001'],
      }],
      security_trust_boundaries: [],
      cross_repository_integration: [],
      profile_sections: { frontend_architecture_ref: null, agent_architecture_ref: null },
    });
    const gate = classifyArchitectureGate({
      signals: context.trigger.signals,
      rationale: context.trigger.rationale,
    });
    const result = validateArchitecturePlanHandoff({
      gate,
      architecture_context: context,
      approved_spec: spec,
      approved_architecture: architecture,
      approved_plan: plan,
      decision_coverage: decisionCoverage(),
      plan_context: {},
      repository_topology: {
        integration_owner_repository_id: repositoryId,
        repositories: [{
          repository_id: repositoryId,
          role: ownerRole,
          module_id: null,
          available: true,
          writable: true,
        }],
      },
    });
    assert.equal(result.valid, true, `${ownerRole}: ${result.blocker_messages.join('\n')}`);
  }
});

test('concrete not-applicable gate preserves the direct spec to plan graph', () => {
  const graph = approvedGraph({ required: false });
  const gate = classifyArchitectureGate({
    signals: [],
    bypass: { kind: 'bounded-bug-fix', rationale: 'The fix preserves all existing boundaries.' },
  });
  const result = validateArchitecturePlanHandoff({
    gate,
    architecture_context: null,
    approved_spec: graph.spec,
    approved_architecture: null,
    approved_plan: graph.plan,
  });
  assert.equal(result.valid, true, result.blocker_messages.join('\n'));
  assert.equal(result.architecture_required, false);

  const unexpected = approvedGraph();
  const invalid = validateArchitecturePlanHandoff({
    gate,
    architecture_context: unexpected.context,
    approved_spec: unexpected.spec,
    approved_architecture: unexpected.architecture,
    approved_plan: unexpected.plan,
    decision_coverage: decisionCoverage(),
  });
  assert.equal(invalid.valid, false);
});

test('execution enforces the same conditional architecture graph before write authorization', () => {
  const requiredGraph = approvedGraph();
  const requiredGate = classifyArchitectureGate({
    signals: requiredGraph.context.trigger.signals,
    rationale: requiredGraph.context.trigger.rationale,
  });
  const prepared = prepareExecution(executionInput(requiredGraph, requiredGate, requiredGraph.context));
  assert.equal(prepared.valid, true);
  assert.equal(prepared.architecture_mode, 'required-approved');
  assert.equal(prepared.approved_architecture_hash, requiredGraph.architecture.metadata.approval_hash);

  const missing = executionInput(requiredGraph, requiredGate, requiredGraph.context);
  missing.approved_architecture = null;
  assert.throws(() => prepareExecution(missing), /architecture handoff blocked/iu);

  const bypassGraph = approvedGraph({ required: false });
  const bypassGate = classifyArchitectureGate({
    signals: [],
    bypass: { kind: 'bounded-bug-fix', rationale: 'All accepted boundaries remain unchanged.' },
  });
  const bypassed = prepareExecution(executionInput(bypassGraph, bypassGate, null));
  assert.equal(bypassed.valid, true);
  assert.equal(bypassed.architecture_mode, 'not-applicable');
  assert.equal(bypassed.approved_architecture_hash, null);
});

test('architecture revisions supersede immutable snapshots instead of mutating them', () => {
  const previous = approvedGraph();
  const currentArchitecture = createApprovedArtifact({
    metadata: artifactMetadata({
      artifact_id: 'architecture-orders-r2',
      artifact_kind: 'architecture',
      repository_relative_path: '.sdcorejs/architecture/angular/2026-08-10-orders.md',
      source_revision: '4'.repeat(40),
      parent_references: [parentReference(previous.spec)],
      supersedes: previous.architecture.metadata.artifact_id,
    }),
    body: '# Approved architecture revision 2\n',
  });
  const currentContext = validContext({
    approved_spec_reference: parentReference(previous.spec),
    approved_architecture_path: currentArchitecture.metadata.repository_relative_path,
    approved_architecture_hash: currentArchitecture.metadata.approval_hash,
    change_control: { revision: 2, supersedes: previous.architecture.metadata.artifact_id },
  });
  const result = validateArchitectureRevision({
    previous_context: previous.context,
    previous_artifact: previous.architecture,
    current_context: currentContext,
    current_artifact: currentArchitecture,
    decision_coverage: decisionCoverage(),
  });
  assert.equal(result.valid, true, result.blocker_messages.join('\n'));
  currentContext.change_control.supersedes = 'architecture-other';
  assert.equal(validateArchitectureRevision({
    previous_context: previous.context,
    previous_artifact: previous.architecture,
    current_context: currentContext,
    current_artifact: currentArchitecture,
    decision_coverage: decisionCoverage(),
  }).valid, false);
});

test('registry and convention authority include architecture without granting convention writes', () => {
  assert.equal(systemRegistry.artifact_roots.architecture, '.sdcorejs/architecture');
  assert.ok(systemRegistry.artifact_kinds.includes('architecture'));
  assert.ok(systemRegistry.convention_source_kinds.includes('approved-architecture'));
  assert.equal(resolveCandidateStatus({ source_kind: 'approved-architecture' }).status, 'accepted');
  assert.ok(CONVENTION_PRECEDENCE.indexOf('approved-specification') < CONVENTION_PRECEDENCE.indexOf('approved-architecture'));
  assert.ok(CONVENTION_PRECEDENCE.indexOf('approved-architecture') < CONVENTION_PRECEDENCE.indexOf('approved-plan'));
  const architectureRule = {
    schema_version: 1,
    artifact_id: 'convention-rule',
    artifact_kind: 'convention',
    document_type: 'rule',
    change_ref: 'orders-auth-change',
    source_spec: '.sdcorejs/specs/angular/orders.md',
    source_plan: '.sdcorejs/plans/angular/orders.md',
    commit_policy: 'conditional',
    owner: 'sdcorejs-explore',
    rule: { id: 'RULE-001', status: 'accepted', enforcement: 'required' },
    source: { kind: 'approved-architecture', reference: '.sdcorejs/architecture/angular/orders.md' },
    scope: { kind: 'repository', repository_id: 'repo-module', module_id: null },
  };
  assert.ok(Number.isInteger(precedenceRank(architectureRule)));
  assert.equal(validateArchitectureWriteScope(['.sdcorejs/docs/architecture/draft.md']).valid, true);
  assert.equal(validateArchitectureWriteScope(['.sdcorejs/conventions/repository/rules.yaml']).valid, false);
  assert.equal(validateArchitectureWriteScope(['src/orders/service.ts']).valid, false);

  const withoutArchitectureKind = structuredClone(systemRegistry);
  withoutArchitectureKind.artifact_kinds = withoutArchitectureKind.artifact_kinds.filter(
    (kind) => kind !== 'architecture',
  );
  assert.ok(
    validateSystemRegistry(withoutArchitectureKind).some((error) =>
      error.includes('architecture artifact kind'),
    ),
  );
});

test('canonical architecture reference states lean ownership and lifecycle boundaries', async () => {
  const [source, skill] = await Promise.all([
    readFile(new URL('../../_refs/sdlc/architecture.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/shared/sdlc/architecture.md', import.meta.url), 'utf8'),
  ]);
  for (const pattern of [
    /approved spec.*approved architecture.*approved plan/is,
    /module.*portal fallback/is,
    /frontend_architecture/is,
    /agent_architecture/is,
    /conventions-sync-write-approved/is,
    /does not own.*file.*task sequencing/is,
  ]) assert.match(source, pattern);
  for (const text of [source, skill]) {
    assert.match(text, /validateArchitecturePrePlanHandoff/iu);
    assert.match(text, /self-review uses\s+`validateArchitectureDraftPlanHandoff`/is);
    assert.match(text, /(?:snapshot approval|execution).*`validateArchitecturePlanHandoff`/is);
  }
});

test('canonical SDLC producers and consumers preserve the conditional architecture handoff', async () => {
  const [spec, plan, executePlan, testContext, review, ship, shipContext] = await Promise.all([
    readFile(new URL('../../skills/shared/sdlc/02-spec.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/shared/sdlc/03-plan.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/shared/sdlc/04-execute-plan.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/shared/test-context.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/shared/workflow/review.md', import.meta.url), 'utf8'),
    readFile(new URL('../../skills/shared/workflow/ship.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/orchestration/tail/ship-context.md', import.meta.url), 'utf8'),
  ]);
  assert.match(spec, /classifyArchitectureGate/u);
  assert.match(spec, /required.*sdcorejs-architecture.*not-applicable.*sdcorejs-plan/is);
  assert.match(plan, /validateArchitecturePlanHandoff/u);
  assert.match(plan, /validateArchitecturePrePlanHandoff/u);
  assert.match(plan, /validateArchitectureDraftPlanHandoff/u);
  assert.match(plan, /validateArchitecturePrePlanHandoff.*before drafting/is);
  assert.match(plan, /validateArchitectureDraftPlanHandoff.*self-review/is);
  assert.match(plan, /approved snapshot.*validateArchitecturePlanHandoff/is);
  assert.match(plan, /architecture_gate:/u);
  assert.match(plan, /architecture_context:/u);
  assert.match(plan, /approved spec.*approved architecture.*approved plan/is);
  assert.match(executePlan, /approved_architecture/u);
  assert.match(executePlan, /architecture_gate.*architecture_context/is);
  assert.match(testContext, /architecture_context/u);
  assert.match(review, /architecture_context/u);
  assert.match(ship, /architecture_context/u);
  const exactGate = /architecture_gate:\s*(?:\{[^}\n]*\bvalid:[^}\n]*\brequired:[^}\n]*\bstatus:[^}\n]*\bsignals:[^}\n]*\bbypass:[^}\n]*\brationale:[^}\n]*\}|\n(?:\s{4}[^\n]*\n)*?\s{4}valid:[^\n]*\n\s{4}required:[^\n]*\n\s{4}status:[^\n]*\n\s{4}signals:[^\n]*\n\s{4}bypass:[^\n]*\n\s{4}rationale:[^\n]*)/u;
  for (const [name, source] of [
    ['spec', spec],
    ['plan', plan],
    ['execute-plan', executePlan],
    ['test-context', testContext],
    ['review', review],
    ['ship', ship],
    ['ship-context', shipContext],
  ]) assert.match(source, exactGate, `${name} must preserve the exact six-field gate`);
});

test('architecture is the only new public skill and stays below the skill ceiling', async () => {
  const root = new URL('../../skills/', import.meta.url);
  const files = (await readdir(root, { recursive: true }))
    .map(String)
    .filter((file) => file.endsWith('.md') && !file.split(/[\\/]/u).at(-1).startsWith('_'));
  const sources = await Promise.all(files.map(async (file) => ({
    file,
    text: await readFile(new URL(file.replaceAll('\\', '/'), root), 'utf8'),
  })));
  const architectureSources = sources.filter(({ text }) => /^name:\s*sdcorejs-architecture$/mu.test(text));
  assert.equal(sources.length, 22);
  assert.ok(sources.length <= 23);
  assert.equal(architectureSources.length, 1);
  assert.equal(architectureSources[0].file.replaceAll('\\', '/'), 'shared/sdlc/architecture.md');
});

test('the focused alias is part of the repository partition', async () => {
  const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));
  assert.equal(packageJson.scripts['test:e2e:architecture'], 'node --test test/e2e/architecture-contract.test.mjs');
  assert.match(packageJson.scripts['test:e2e:repository'], /architecture-contract\.test\.mjs/u);
});
