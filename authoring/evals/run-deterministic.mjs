import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { evaluateExternalReviewFeedback } from '../../_refs/orchestration/repair-contract.mjs';
import { evaluateConventionContext, validateConsistencyFinding } from '../../_refs/shared/convention-contract.mjs';
import { evaluateConvergence } from '../../_refs/shared/convergence-contract.mjs';
import {
  approveDecisionCoverage,
  validateDecisionCoverage,
} from '../../_refs/shared/decision-coverage.mjs';
import { resolveE2EAuthoringOwner } from '../../_refs/shared/module-e2e-contract.mjs';
import { createApprovedArtifact } from '../../_refs/shared/approved-artifact.mjs';
import {
  evaluateValidationEvidence,
  projectCoverageMatrix,
  validateValidationMap,
} from '../../_refs/shared/validation-map.mjs';
import { dispatchPrompt, loadSkillPack } from '../../test/e2e/support/skill-pack-runner.mjs';
import {
  hashAuthoringContract,
  hashAuthoringFiles,
} from './skill-authoring-contract.mjs';

export const REQUIRED_SCENARIO_IDS = Object.freeze([
  'architecture-cross-repo-public-contract',
  'architecture-simple-four-field-drawer-bypass',
  'blocking-assumption-pressure',
  'plan-missing-ac-mapping',
  'unrelated-pass-does-not-satisfy-ac',
  'convergence-blocks-out-of-intent-code',
  'incorrect-review-feedback-no-write',
  'observed-convention-nonblocking',
  'missing-module-owner-no-portal-fallback',
  'toolchain-engine-drift',
]);

const REVISION_A = 'a'.repeat(40);
const REVISION_B = 'b'.repeat(40);
const CONFIG_FINGERPRINT = `sha256:v1:${'c'.repeat(64)}`;
const ENVIRONMENT_FINGERPRINT = `sha256:v1:${'d'.repeat(64)}`;

function active(id, type) {
  return { id, type };
}

function decisionCoverage({ unresolvedAssumption = false } = {}) {
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
      id: 'A-001',
      type: 'assumption',
      statement: 'The identity provider remains available.',
      source: 'explicit',
      confidence: 'high',
      status: unresolvedAssumption ? 'proposed' : 'confirmed',
      blocking: unresolvedAssumption,
      evidence_refs: [],
      consequence_if_wrong: 'Authorization cannot establish caller identity.',
      validation_method: 'Probe the identity provider health contract.',
      owner: 'repository-under-test',
      rationale: 'The authorization boundary depends on caller identity.',
      impacted_refs: ['R-001'],
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
      active: records.map(({ id, type }) => active(id, type)),
      tombstones: [],
    }],
  });
}

function validationFixture() {
  const row = {
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
  };
  const current = {
    associated_HEAD_or_diff: 'diff:orders-v1',
    config_fingerprint: CONFIG_FINGERPRINT,
    environment_fingerprint: ENVIRONMENT_FINGERPRINT,
  };
  const evidence = {
    schema_version: 2,
    source: 'sdcorejs-test',
    change_ref: 'change-orders-auth',
    associated_HEAD_or_diff: 'diff:orders-v1',
    status: {
      planning: 'approved',
      authoring: 'existing',
      executability: 'ready',
      execution: 'executed',
      result: 'pass',
      evidence: 'current',
      documentation: 'not-requested',
    },
    runs: [{
      run_id: 'run-api-1',
      command: row.planned_command,
      command_source: row.command_source,
      cwd: row.cwd,
      runner: 'node:test',
      package_manager: 'npm',
      environment_id: 'local-node',
      environment_class: 'local',
      evidence_class: row.evidence_class,
      associated_HEAD_or_diff: current.associated_HEAD_or_diff,
      config_fingerprint: current.config_fingerprint,
      environment_fingerprint: current.environment_fingerprint,
      repository_id: 'repo-orders',
      source_fingerprint: 'e'.repeat(64),
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
      output_digest: `sha256:v1:${'f'.repeat(64)}`,
      artifacts_created: [],
      redactions_applied: true,
      stale: false,
    }],
    cases: [{
      case_id: row.case_ids[0],
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
  };
  return { row, current, evidence, coverage: decisionCoverage() };
}

export function convergenceFixture() {
  return {
    schema_version: 1,
    mode: 'feature',
    change_ref: 'orders-create',
    thread: { thread_id: 'thread-orders', owner_thread_id: 'thread-orders' },
    source: {
      repository_id: 'repo-orders',
      revision: REVISION_A,
      fingerprint: CONFIG_FINGERPRINT,
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
      paths: ['src/orders.mjs'],
      symbols: ['src/orders.mjs#createOrder'],
    },
    requirements: [{
      id: 'R-001',
      acceptance_criterion_refs: ['AC-001'],
      task_refs: ['TASK-001'],
      evidence_refs: ['EVIDENCE-001'],
    }],
    acceptance_criteria: [{
      id: 'AC-001',
      requirement_refs: ['R-001'],
      task_refs: ['TASK-001'],
      evidence_refs: ['EVIDENCE-001'],
    }],
    invariants: [{ id: 'INV-001' }],
    risks: [{ id: 'RISK-001' }],
    tasks: [{
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
    }],
    changes: [{
      path: 'src/orders.mjs',
      symbols: ['src/orders.mjs#createOrder'],
      task_refs: ['TASK-001'],
      requirement_refs: ['R-001'],
      acceptance_criterion_refs: ['AC-001'],
      invariant_refs: ['INV-001'],
    }],
    validation_map: [{
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
    }],
    evidence: [{
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
      source_fingerprint: CONFIG_FINGERPRINT,
      portal_revision: REVISION_A,
      module_revision_map: { orders: REVISION_B },
    }],
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
      observed_findings: [{ id: 'candidate-001', blocking: false, repair_authorized: false }],
    },
    public_contract: { changed: true, migration_decision_status: 'approved' },
    generated_mirrors: { required: true, status: 'current' },
    summary: { required: true, status: 'current', dependency_fingerprint_status: 'current' },
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
    docs_hygiene: { status: 'not-applicable', changed_scope_status: 'not-applicable', evidence_refs: [] },
    dependency_regression: {
      status: 'not-applicable',
      changed_scope_status: 'not-applicable',
      manifest_paths: [],
      evidence_refs: [],
    },
  };
}

function repairEvidenceArtifact({ artifactPath, artifactId, contractId, approvalSource, approvedBy = approvalSource, body }) {
  const artifact = createApprovedArtifact({
    metadata: {
      schema_version: 1,
      artifact_id: artifactId,
      artifact_kind: 'release-evidence',
      contract_id: contractId,
      requirement_id: 'EXT-001',
      change_ref: 'EXT-001',
      track: 'workflow',
      stack_profile: 'general',
      owner_repository_id: 'github.com/acme/agent-module',
      owner_repository_role: 'module',
      owner_module_id: 'agent-module',
      parent_repository_id: null,
      parent_references: [],
      approval_source: approvalSource,
      approved_by: approvedBy,
      approved_at: '2026-08-09T00:00:00.000Z',
      repository_relative_path: artifactPath,
      source_revision: REVISION_B,
      supersedes: null,
    },
    body: `${JSON.stringify(body)}\n`,
  });
  return {
    artifact,
    reference: {
      artifact_ref: artifactPath,
      approval_hash: artifact.metadata.approval_hash,
    },
  };
}

function externalFeedback(claimSupported) {
  const evidenceRef = 'test/approval.test.ts#L88';
  const snapshot = repairEvidenceArtifact({
    artifactPath: '.sdcorejs/evidence/deterministic-repair-snapshot.json',
    artifactId: 'deterministic-repair-snapshot',
    contractId: 'repair-repository-snapshot:v1',
    approvalSource: 'trusted-repository-snapshot',
    body: {
      schema_version: 1,
      kind: 'repository-snapshot',
      repository_id: 'github.com/acme/agent-module',
      snapshot_revision: REVISION_B,
      revisions: [{
        revision: REVISION_B,
        files: [{
          path: 'test/approval.test.ts',
          sha256: `sha256:${'e'.repeat(64)}`,
          locators: ['FILE', 'L88'],
        }],
      }],
    },
  });
  const assessment = repairEvidenceArtifact({
    artifactPath: `.sdcorejs/evidence/deterministic-review-${claimSupported ? 'supported' : 'incorrect'}.json`,
    artifactId: `deterministic-review-${claimSupported ? 'supported' : 'incorrect'}`,
    contractId: 'repair-review-assessment:v1',
    approvalSource: 'independent-review-verifier',
    approvedBy: 'deterministic-review-verifier',
    body: {
      schema_version: 1,
      kind: 'review-assessment',
      finding_id: 'EXT-001',
      repository_id: 'github.com/acme/agent-module',
      revision: REVISION_B,
      verifier: 'deterministic-review-verifier',
      evidence_refs: [evidenceRef],
      current_context_read: true,
      current_locator_matches: true,
      scope_applies: true,
      technical_claim_supported: claimSupported,
      existing_mechanism_satisfies: false,
      reverify_command: 'npm run test:approval',
      conflicts: [],
      proposed_change: {
        kind: 'mechanical',
        migration_decision_identity: null,
      },
    },
  });
  return {
    repair_source: {
      kind: 'external-review-feedback',
      review_id: 'review-pr-417-r1',
      reviewer: 'pr-reviewer',
      base_revision: REVISION_A,
      file_scope: ['src/agent'],
      original_feedback: {
        kind: 'text',
        value: 'The resource-version denial is missing.',
        sanitized: true,
      },
    },
    current_revision: REVISION_B,
    owner_repository_id: 'github.com/acme/agent-module',
    approval_artifacts: [],
    evidence_artifacts: [snapshot.artifact, assessment.artifact],
    repository_snapshot: snapshot.reference,
    finding: {
      id: 'EXT-001',
      current_path: 'src/agent/approval.ts',
      current_line: 42,
      repair_scope_paths: ['src/agent'],
    },
    verification: {
      current_context_read: true,
      current_locator_matches: true,
      scope_applies: true,
      technical_claim_supported: claimSupported,
      existing_mechanism_satisfies: false,
      evidence: [{
        kind: 'test',
        reference: evidenceRef,
        repository_id: 'github.com/acme/agent-module',
        revision: REVISION_B,
        path: 'test/approval.test.ts',
        locator: 'L88',
        sha256: `sha256:${'e'.repeat(64)}`,
        summary: claimSupported
          ? 'The regression exposes the missing denial.'
          : 'The current regression proves the denial.',
      }],
      conflicts: [],
      reverify_command: 'npm run test:approval',
      assessment_receipt: assessment.reference,
    },
    proposed_change: { kind: 'mechanical', migration_decision: null },
  };
}

function conventionContext() {
  const repository = 'repo-product-service';
  return {
    schema_version: 1,
    mode: 'read-only',
    write_actions: [],
    scope: { repositories: [repository], modules: [], boundaries: ['public-api'], files: [], change_ref: null },
    policy: {
      status: 'valid',
      path: '.sdcorejs/conventions/policy.yaml',
      capture_mode: 'after-review',
      write_authority: 'project-policy',
    },
    loaded_rules: { accepted: [], observed: [], conflicted: [], deprecated: [], stale: [], invalid: [] },
    findings: {
      direct_violations: [],
      semantic_alias_drift: [],
      term_collisions: [],
      cross_layer_drift: [],
      mapping_gaps: [],
      public_contract_drift: [],
    },
    candidates: [{ rule: { id: 'naming.property.case' } }],
    conflicts: [],
    stale_rules: [],
    exceptions: [],
    ownership: {
      execution_host_repository_id: repository,
      integration_owner_repository_id: repository,
      target_owner_repository_ids: [repository],
      unresolved_owners: [],
    },
    persistence: {
      requested: false,
      authorized: false,
      performed: false,
      sync_required: false,
      target_paths: [],
      blocked_reasons: [],
    },
    redaction: { applied: true, notes: null },
  };
}

function observedConventionFinding(overrides = {}) {
  return {
    id: 'OBS-001',
    severity: 'Info',
    confidence: 'high',
    dimension: 'consistency',
    finding_kind: 'CONVENTION_CANDIDATE',
    category: 'api-routing',
    rule_id: 'api.resource-segment.cardinality',
    concept_id: 'resource-collection-path',
    semantic_role: 'collection-resource-path',
    source_boundary: 'public-api',
    repository_id: 'repo-product-service',
    module_id: null,
    evidence: 'POST /product',
    locator: 'src/product/product.controller.ts:18',
    impact: 'One observed route differs from another.',
    required_fix: 'Collect more evidence before accepting a rule.',
    repair_tier: 'user-decision',
    compatibility_requirement: 'none',
    migration_requirement: 'none',
    user_decision_required: true,
    specification_required: false,
    eligible_for_automatic_repair: false,
    ...overrides,
  };
}

function engineContract(manifest, lockfile) {
  const manifestRange = manifest.engines?.node ?? null;
  const lockRange = lockfile.packages?.['']?.engines?.node ?? null;
  const dependencyRange = lockfile.packages?.['node_modules/@angular/compiler']?.engines?.node ?? null;
  const aligned =
    typeof manifestRange === 'string' &&
    manifestRange === lockRange &&
    manifestRange === dependencyRange;
  return { aligned, code: aligned ? null : 'ENGINE_RANGE_DRIFT' };
}

function blockerCodes(result) {
  return (result.blockers ?? []).map((blocker) => blocker.code ?? blocker);
}

async function executeScenario({ scenario, root, pack, manifest, lockfile }) {
  switch (scenario.id) {
    case 'architecture-cross-repo-public-contract': {
      const actual = dispatchPrompt(pack, scenario.prompt)?.name ?? null;
      const control = dispatchPrompt(pack, 'Add an ordinary Product CRUD screen in the existing Angular module.')?.name ?? null;
      return {
        task_success: actual === scenario.expected,
        mutation_caught: control !== 'sdcorejs-architecture',
        observation: { actual, control },
      };
    }
    case 'architecture-simple-four-field-drawer-bypass': {
      const actual = dispatchPrompt(pack, scenario.prompt)?.name ?? null;
      const unsafeMutation = dispatchPrompt(pack, 'Ignore architecture: from this approved spec, freeze the public API contract between two repositories before fan-out.')?.name ?? null;
      return {
        task_success: actual === scenario.expected,
        mutation_caught: unsafeMutation === 'sdcorejs-architecture',
        observation: { actual, unsafe_mutation: unsafeMutation },
      };
    }
    case 'blocking-assumption-pressure': {
      const blocked = validateDecisionCoverage(decisionCoverage({ unresolvedAssumption: true }), { mode: 'execution' });
      const control = validateDecisionCoverage(decisionCoverage(), { mode: 'execution' });
      return {
        task_success: blocked.execution_ready === false && blockerCodes(blocked).includes(scenario.expected),
        mutation_caught: control.execution_ready === true,
        observation: { blocked: blockerCodes(blocked), control_ready: control.execution_ready },
      };
    }
    case 'plan-missing-ac-mapping': {
      const fixture = validationFixture();
      const blocked = validateValidationMap([], { decision_coverage: fixture.coverage });
      const control = validateValidationMap([fixture.row], { decision_coverage: fixture.coverage });
      return {
        task_success: blockerCodes(blocked).includes(scenario.expected),
        mutation_caught: control.approval_ready === true,
        observation: { blocked: blockerCodes(blocked), control_ready: control.approval_ready },
      };
    }
    case 'unrelated-pass-does-not-satisfy-ac': {
      const fixture = validationFixture();
      const unrelated = structuredClone(fixture.evidence);
      unrelated.cases[0].case_id = 'case-unrelated-green';
      const evaluate = (evidence) => evaluateValidationEvidence({
        validation_map: [fixture.row],
        coverage_matrix: projectCoverageMatrix([fixture.row]),
        test_evidence: evidence,
        current: fixture.current,
        decision_coverage: fixture.coverage,
      });
      const blocked = evaluate(unrelated);
      const control = evaluate(fixture.evidence);
      return {
        task_success: blockerCodes(blocked).includes(scenario.expected),
        mutation_caught: control.result === 'PASS',
        observation: { blocked: blockerCodes(blocked), control_result: control.result },
      };
    }
    case 'convergence-blocks-out-of-intent-code': {
      const controlInput = convergenceFixture();
      const mutation = structuredClone(controlInput);
      mutation.changes.push({
        path: 'src/unapproved.mjs',
        symbols: ['src/unapproved.mjs#surprise'],
        task_refs: ['TASK-001'],
        requirement_refs: ['R-001'],
        acceptance_criterion_refs: ['AC-001'],
        invariant_refs: ['INV-001'],
      });
      mutation.tasks[0].changed_path_refs.push('src/unapproved.mjs');
      mutation.tasks[0].changed_symbol_refs.push('src/unapproved.mjs#surprise');
      const blocked = evaluateConvergence(mutation);
      const control = evaluateConvergence(controlInput);
      return {
        task_success: blockerCodes(blocked).includes(scenario.expected),
        mutation_caught: control.status === 'CONVERGED',
        observation: { blocked: blockerCodes(blocked), control_status: control.status },
      };
    }
    case 'incorrect-review-feedback-no-write': {
      const incorrect = evaluateExternalReviewFeedback(externalFeedback(false));
      const control = evaluateExternalReviewFeedback(externalFeedback(true));
      return {
        task_success: incorrect.feedback_verdict === scenario.expected && incorrect.write_eligible === false,
        mutation_caught: control.feedback_verdict === 'correct' && control.write_eligible === true,
        observation: {
          verdict: incorrect.feedback_verdict,
          write_eligible: incorrect.write_eligible,
          control_verdict: control.feedback_verdict,
        },
      };
    }
    case 'observed-convention-nonblocking': {
      const observed = evaluateConventionContext(conventionContext());
      const unsafeMutation = validateConsistencyFinding(observedConventionFinding({
        severity: 'High',
        eligible_for_automatic_repair: true,
      }));
      return {
        task_success: observed.status === scenario.expected && observed.read_only_proven === true,
        mutation_caught: unsafeMutation.ok === false,
        observation: { status: observed.status, read_only: observed.read_only_proven, mutation_errors: unsafeMutation.errors },
      };
    }
    case 'missing-module-owner-no-portal-fallback': {
      const base = {
        behavior_scope: 'module',
        requested_module: 'orders',
        execution_host_repository_id: 'repo-portal',
        portal: { repository_id: 'repo-portal' },
      };
      const missing = resolveE2EAuthoringOwner({ ...base, topology: { modules: [] } });
      const control = resolveE2EAuthoringOwner({
        ...base,
        topology: {
          modules: [{
            module_id: 'orders',
            repository_id: 'repo-orders',
            available: true,
            writable: true,
          }],
        },
      });
      return {
        task_success:
          missing.status === scenario.expected &&
          missing.write_target === null &&
          missing.copy_tests_to_portal === false,
        mutation_caught: control.status === 'resolved' && control.write_target === 'repo-orders',
        observation: { status: missing.status, write_target: missing.write_target, control_status: control.status },
      };
    }
    case 'toolchain-engine-drift': {
      const mutation = structuredClone(lockfile);
      mutation.packages[''].engines.node = '>=18';
      const blocked = engineContract(manifest, mutation);
      const control = engineContract(manifest, lockfile);
      return {
        task_success: blocked.code === scenario.expected,
        mutation_caught: control.aligned === true,
        observation: { blocked: blocked.code, control_aligned: control.aligned },
      };
    }
    default:
      throw new Error(`unsupported authoring scenario: ${scenario.id}`);
  }
}

export async function runDeterministicAuthoringMatrix({ root } = {}) {
  if (typeof root !== 'string' || root.trim() === '') throw new TypeError('root is required');
  const fixture = JSON.parse(await readFile(path.join(root, 'authoring/evals/scenarios.json'), 'utf8'));
  const scenarioIds = fixture.scenarios?.map(({ id }) => id) ?? [];
  if (fixture.schema_version !== 1 || JSON.stringify(scenarioIds) !== JSON.stringify(REQUIRED_SCENARIO_IDS)) {
    throw new Error('authoring scenario matrix is incomplete or out of order');
  }
  const [pack, manifest, lockfile, sourceHash, contractHash] = await Promise.all([
    loadSkillPack(root),
    readFile(path.join(root, 'package.json'), 'utf8').then(JSON.parse),
    readFile(path.join(root, 'package-lock.json'), 'utf8').then(JSON.parse),
        hashAuthoringFiles(root, [
          '_refs/orchestration/repair-contract.mjs',
          '_refs/shared/approved-artifact.mjs',
      '_refs/shared/convention-contract.mjs',
      '_refs/shared/convergence-contract.mjs',
      '_refs/shared/decision-coverage.mjs',
      '_refs/shared/module-e2e-contract.mjs',
      '_refs/shared/validation-map.mjs',
      'package-lock.json',
      'package.json',
      'test/e2e/support/skill-pack-runner.mjs',
    ]),
    hashAuthoringContract(root),
  ]);
  const scenarios = [];
  for (const scenario of fixture.scenarios) {
    const outcome = await executeScenario({ scenario, root, pack, manifest, lockfile });
    const visible = JSON.stringify(outcome.observation);
    scenarios.push({
      id: scenario.id,
      kind: scenario.kind,
      task_success: outcome.task_success,
      mutation_caught: outcome.mutation_caught,
      turns: 1,
      visible_output_bytes: Buffer.byteLength(visible, 'utf8'),
      model: 'not-applicable',
      effort: 'not-applicable',
      cli_runtime_version: process.version,
      token_usage: null,
      approval_complete: true,
      ownership_complete: true,
      verification_complete: outcome.task_success && outcome.mutation_caught,
      sanitized_transcript_ref: `authoring/evals/scenarios.json#${scenario.id}`,
      result: outcome.task_success && outcome.mutation_caught ? 'PASS' : 'FAIL',
      exact_limitation: 'Deterministic contract and mutation evidence only; no credentialed provider or fresh target-project agent was run.',
      observation: outcome.observation,
    });
  }
  const passed = scenarios.every(({ result }) => result === 'PASS');
  return {
    schema_version: 1,
    source: 'sdcorejs-skill-authoring',
    source_hash: sourceHash,
    contract_hash: contractHash,
    provider_calls: 0,
    ambient_credentials_read: false,
    result: passed ? 'PASS' : 'FAIL',
    exact_limitation: 'This report covers deterministic routing/contracts/mutations, not full E2E or live-agent behavior.',
    scenarios,
  };
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  const report = await runDeterministicAuthoringMatrix({ root });
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (report.result !== 'PASS') process.exitCode = 1;
}
