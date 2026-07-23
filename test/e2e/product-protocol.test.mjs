import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import * as productProtocol from '../../_refs/product/product-protocol.mjs';
import {
  hashApprovedSnapshot,
  hashApprovedSnapshotIntegrity,
  validateApprovedPlanIntegrity
} from '../../_refs/shared/approved-plan-integrity.mjs';

import {
  computeRelevantPathsHash,
  deriveFeatureVerdict,
  deriveRequirementReadiness,
  deriveTraceability,
  evaluateEvidenceFreshness,
  redactProductEvidence,
  resolveProductLayout,
  validateActionSideEffects,
  validateIdentityTransition,
  validateProductAction,
  validateProductContext,
  validateProductOrchestration
} from '../../_refs/product/product-protocol.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const sha256 = (value) => createHash('sha256').update(String(value)).digest('hex');
const pathManifest = (paths, label) => {
  const relevant_path_hashes = Object.fromEntries(paths.map((relativePath) => [relativePath, sha256(`${label}:${relativePath}`)]));
  return {
    relevant_paths: [...paths],
    relevant_path_hashes,
    relevant_paths_hash: computeRelevantPathsHash(paths, relevant_path_hashes)
  };
};
const readyRelevantPaths = [
  '.sdcorejs/specs/product/contract-001.md',
  'src/ready.ts',
  'test/ready.test.mjs'
];
const readyManifest = pathManifest(readyRelevantPaths, 'ready-source-v1');
const readyPlanIdentity = Object.freeze({
  approved_plan_path: '.sdcorejs/plans/product/contract-001.md',
  approved_plan_hash: 'b'.repeat(64),
  approved_plan_integrity_hash: 'c'.repeat(64)
});

const approvedRequirement = Object.freeze({
  id: 'AC-017',
  text: 'Bulk deletion is denied.',
  priority: 'required',
  approval: 'approved',
  scope: 'bulk-delete'
});

const normativeProjection = (overrides = {}) => ({
  contract_id: 'CONTRACT-001',
  requirement_revision: 1,
  approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
  approved_spec_hash: 'spec-v1',
  requirements: [{ ...approvedRequirement, id: 'AC-001' }],
  requirement_source_hashes: { 'AC-001': sha256('AC-001:Bulk deletion is denied.') },
  retired_requirement_ids: [],
  ...overrides
});

const productLedgerLayout = () => ({
  ledger_root: '.sdcorejs/docs/product/contract-001',
  current_path: '.sdcorejs/docs/product/contract-001/current.md',
  history_root: '.sdcorejs/docs/product/contract-001/history',
  uat_root: '.sdcorejs/docs/product/contract-001/uat'
});

const actionContext = (action, overrides = {}) => ({
  persistence_requested: action === 'audit-and-sync',
  write_policy: action === 'audit-readonly' ? 'deny' : 'allow',
  side_effects_allowed: action !== 'audit-readonly',
  write_authorized: false,
  requirements_changed: ['seed-from-approved-spec', 'requirements-update', 'supersede-feature'].includes(action),
  ...overrides
});

const approvedAuthority = (overrides = {}) => ({
  approved: true,
  approved_by: 'product-owner',
  approved_at: '2026-07-13T14:00:00.000Z',
  approval_source: 'approval-message',
  ...overrides
});

const approvedException = (overrides = {}) => ({
  ...approvedAuthority(),
  reason: 'Approved product exception.',
  ...overrides
});

const approvedNotApplicableDecision = (dimension, overrides = {}) => ({
  decision_id: `DEC-${dimension.toUpperCase()}-NA-001`,
  requirement_id: 'AC-001',
  dimension,
  status: 'not_applicable',
  ...approvedAuthority(),
  reason: `The ${dimension} dimension does not apply to AC-001.`,
  ...overrides
});

const approvedUatDecision = (overrides = {}) => ({
  decision_id: 'DEC-UAT-001',
  status: 'waived',
  reason: 'Business owner accepted the bounded UAT exception.',
  scope: {
    scenario_ids: ['UAT-001'],
    requirement_ids: ['AC-001']
  },
  ...approvedAuthority(),
  expires_at: '2026-08-13T14:00:00.000Z',
  review_at: '2026-07-20T14:00:00.000Z',
  ...overrides
});

const standaloneProductActionAuthority = (action, allowedPaths = []) => {
  const writePolicy = action === 'audit-readonly' ? 'deny' : 'allow';
  const stepId = `standalone-${action}`;
  return {
    schema_version: 1,
    mode: 'single',
    purpose: 'standalone',
    sequence_id: `sequence-${action}`,
    steps: [{
      step_id: stepId,
      ordinal: 1,
      action,
      write_policy: writePolicy,
      allowed_paths: writePolicy === 'allow' ? [...allowedPaths] : [],
      predecessor_step_id: null,
      required_checkpoint: 'standalone-approved'
    }],
    terminal_step_id: stepId
  };
};

const productActionLifecycle = (authority) => {
  const step = authority.steps[0];
  return {
    sequence_id: authority.sequence_id,
    step_id: step.step_id,
    step_ordinal: step.ordinal,
    predecessor_context_digest: null,
    required_checkpoint: step.required_checkpoint
  };
};

const renderProductActionAuthority = (authority, indent = '  ') => {
  const step = authority.steps[0];
  const allowedPaths = step.allowed_paths.length === 0
    ? `${indent}      allowed_paths: []`
    : [
        `${indent}      allowed_paths:`,
        ...step.allowed_paths.map((scopePath) => `${indent}        - ${scopePath}`)
      ].join('\n');
  return [
    `${indent}product_action_authority:`,
    `${indent}  schema_version: ${authority.schema_version}`,
    `${indent}  mode: ${authority.mode}`,
    `${indent}  purpose: ${authority.purpose}`,
    `${indent}  sequence_id: ${authority.sequence_id}`,
    `${indent}  steps:`,
    `${indent}    - step_id: ${step.step_id}`,
    `${indent}      ordinal: ${step.ordinal}`,
    `${indent}      action: ${step.action}`,
    `${indent}      write_policy: ${step.write_policy}`,
    allowedPaths,
    `${indent}      predecessor_step_id: null`,
    `${indent}      required_checkpoint: ${step.required_checkpoint}`,
    `${indent}  terminal_step_id: ${authority.terminal_step_id}`
  ].join('\n');
};

const readyRow = (overrides = {}) => ({
  requirement_id: 'AC-001',
  required: true,
  source_ref: '.sdcorejs/specs/product/contract-001.md#ac-001',
  source_hash: sha256('requirement-v1'),
  requirement_status: 'approved',
  implementation_status: 'implemented',
  implementation_refs: ['src/ready.ts'],
  implementation_approval: null,
  verification_status: 'passed',
  verification_evidence_ids: ['EVID-READY-001'],
  verification_approval: null,
  uat_status: 'passed',
  uat_required: true,
  uat_record_ids: ['UAT-001-EXEC-001'],
  uat_approval: null,
  evidence_freshness: 'current',
  gaps: [],
  verdict: 'READY',
  ...overrides
});

const currentEvidence = (overrides = {}) => ({
  evidence_id: 'EVID-READY-001',
  kind: 'unit',
  requirement_ids: ['AC-001'],
  control_requirement_ids: [],
  command: 'node --test test/ready.test.mjs',
  cwd: '.',
  started_at: '2026-07-13T14:59:59.000Z',
  finished_at: '2026-07-13T15:00:00.000Z',
  observed_at: '2026-07-13T15:00:00.000Z',
  observed_by: 'sdcorejs-test',
  observation_source: 'command',
  exit_code: 0,
  outcome: 'passed',
  observed_result: '1 test passed',
  expected_result_ref: '.sdcorejs/specs/product/contract-001.md#ac-001',
  environment: {
    environment_name: 'test',
    runtime_versions: { node: '22' },
    platform: 'win32',
    locale: 'en',
    timezone: 'UTC',
    environment_fingerprint: sha256('environment-ready')
  },
  verified_head: 'head-ready',
  associated_diff: {
    base_head: 'head-base',
    head: 'head-ready',
    diff_hash: sha256('diff-ready'),
    changed_paths: ['src/ready.ts']
  },
  contract_id: 'CONTRACT-001',
  feature_id: 'FEATURE-001',
  requirement_revision: 1,
  approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
  approved_spec_hash: 'spec-v1',
  approved_spec_integrity_hash: 'a'.repeat(64),
  ...readyPlanIdentity,
  ...structuredClone(readyManifest),
  output_digest: sha256('output-ready'),
  artifacts: ['test/ready.test.mjs'],
  redaction: {
    redaction_applied: false,
    redacted_fields: [],
    excluded_paths: [],
    secret_scan: 'passed',
    pii_redacted: true,
    logs_sanitized: true
  },
  freshness: {
    value: 'current',
    reasons: [],
    evaluated_at: '2026-07-13T15:00:00.000Z',
    head_changed: false
  },
  ...overrides
});

const currentUatRecord = (overrides = {}) => ({
  uat_record_id: 'UAT-001-EXEC-001',
  scenario_id: 'UAT-001',
  contract_id: 'CONTRACT-001',
  requirement_revision: 1,
  requirement_ids: ['AC-001'],
  scenario_source_ref: 'product/uat-checklists/contract-001.md#uat-001',
  scenario_source_hash: sha256('uat-v1'),
  preconditions: [],
  actor_role: 'business-approver',
  test_data_ref: 'test/fixtures/invoice.json',
  environment: {
    environment_name: 'test',
    build_or_revision: 'head-ready',
    environment_fingerprint: sha256('environment-ready')
  },
  steps_ref: 'product/uat-checklists/contract-001.md#uat-001-steps',
  expected_result: 'The approved invoice is visible.',
  expected_result_ref: 'product/uat-checklists/contract-001.md#uat-001-expected',
  actual_result: 'The approved invoice was visible.',
  status: 'passed',
  evidence_refs: ['EVID-READY-001'],
  execution_kind: 'manual',
  executed_by: 'authorized-business-tester',
  executed_at: '2026-07-13T15:00:00.000Z',
  recorded_by: 'sdcorejs-product',
  recorded_at: '2026-07-13T15:01:00.000Z',
  decision: null,
  redaction: {
    redaction_applied: false,
    redacted_fields: [],
    pii_redacted: true,
    logs_sanitized: true
  },
  ...overrides
});

const automatedExecutionObservation = (record) => ({
  evidence_id: record.evidence_id,
  command: record.command,
  exit_code: record.exit_code,
  outcome: record.outcome,
  observed_result: record.observed_result,
  output_digest: record.output_digest,
  verified_head: record.verified_head,
  relevant_paths: [...record.relevant_paths],
  relevant_path_hashes: { ...record.relevant_path_hashes },
  relevant_paths_hash: record.relevant_paths_hash
});

const manualUatExecutionObservation = (record) => ({
  uat_record_id: record.uat_record_id,
  scenario_id: record.scenario_id,
  contract_id: record.contract_id,
  requirement_revision: record.requirement_revision,
  requirement_ids: [...record.requirement_ids],
  scenario_source_ref: record.scenario_source_ref,
  scenario_source_hash: record.scenario_source_hash,
  preconditions: structuredClone(record.preconditions),
  actor_role: record.actor_role,
  test_data_ref: record.test_data_ref,
  environment_fingerprint: record.environment.environment_fingerprint,
  steps_ref: record.steps_ref,
  expected_result: record.expected_result,
  expected_result_ref: record.expected_result_ref,
  evidence_refs: [...record.evidence_refs],
  execution_kind: record.execution_kind,
  executed_by: record.executed_by,
  executed_at: record.executed_at,
  recorded_by: record.recorded_by,
  recorded_at: record.recorded_at,
  status: record.status,
  actual_result: record.actual_result,
  decision: structuredClone(record.decision),
  redaction: structuredClone(record.redaction),
  build_or_revision: record.environment.build_or_revision
});

const currentState = (overrides = {}) => ({
  verified_head: 'head-ready',
  contract_id: 'CONTRACT-001',
  feature_id: 'FEATURE-001',
  requirement_revision: 1,
  approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
  approved_spec_hash: 'spec-v1',
  approved_spec_integrity_hash: 'a'.repeat(64),
  ...readyPlanIdentity,
  ...structuredClone(readyManifest),
  changed_paths: [],
  uat_build_or_revision: 'head-ready',
  uat_scenario_hashes: {
    'product/uat-checklists/contract-001.md#uat-001': sha256('uat-v1')
  },
  ...overrides
});

const completeProductContext = (overrides = {}) => {
  const evidence = currentEvidence();
  const uat = currentUatRecord();
  const currentPath = '.sdcorejs/docs/product/contract-001/current.md';
  return {
    schema_version: 1,
    source: 'sdcorejs-product',
    emitted_at: '2026-07-13T15:02:00.000Z',
    source_context_digest: null,
    target: {
      repo_root: 'C:/repo',
      target_root: 'C:/repo',
      target_root_kind: 'target-project',
      track: 'product',
      stack_profile: 'general',
      current_branch: 'feature/product',
      current_head: 'head-ready'
    },
    product_action: 'audit-readonly',
    product_action_lifecycle: productActionLifecycle(standaloneProductActionAuthority('audit-readonly')),
    persistence_requested: false,
    write_policy: 'deny',
    side_effects_allowed: false,
    write_authorized: false,
    requirements_changed: false,
    contract_id: 'CONTRACT-001',
    feature_id: 'FEATURE-001',
    feature_slug: 'invoice',
    requirement_revision: 1,
    requirement_ids: ['AC-001'],
    retired_requirement_ids: [],
    supersedes: null,
    replacement_contract_id: null,
    change_reason: null,
    feature_lifecycle: 'active',
    approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
    approved_spec_anchor: null,
    approved_spec_hash: 'spec-v1',
    approved_spec_integrity_hash: 'a'.repeat(64),
    ...readyPlanIdentity,
    source_requirement_path: null,
    source_requirement_hash: null,
    approval: {
      approved: true,
      approved_by: 'product-owner',
      approved_at: '2026-07-13T14:00:00.000Z',
      approval_source: 'approval-message'
    },
    layout: {
      doc_layout: 'existing',
      contract_key: 'contract-001',
      product_docs: {
        root: 'product',
        prd_path: 'product/prds/contract-001.md',
        stories_path: 'product/user-stories/contract-001.md',
        acceptance_path: 'product/acceptance-criteria/contract-001.md',
        uat_path: 'product/uat-checklists/contract-001.md',
        decisions_path: 'product/decisions/contract-001.md',
        compact_path: null
      },
      ledger_root: '.sdcorejs/docs/product/contract-001',
      current_path: currentPath,
      history_root: '.sdcorejs/docs/product/contract-001/history',
      uat_root: '.sdcorejs/docs/product/contract-001/uat',
      active_candidates: [currentPath],
      history_paths: [],
      legacy_sources: [],
      operations: []
    },
    active_ledger_path: currentPath,
    conflicting_contract_paths: [],
    allowed_paths: [],
    prohibited_paths: [],
    planned_writes: [],
    actual_writes: [],
    deleted_paths: [],
    dirty_paths: [],
    legacy_paths: [],
    unrelated_dirty_paths: [],
    requires_user_choice: false,
    summary_refresh: false,
    checkpoint_write: false,
    before_status_digest: sha256('status-ready'),
    after_status_digest: sha256('status-ready'),
    normative_before: normativeProjection(),
    normative_after: normativeProjection(),
    changes: {
      normative_change_ids: [],
      retired_requirement_ids: [],
      descriptive_change_paths: [],
      uat_record_ids: [],
      ledger_history_created: [],
      ignored_unrelated_paths: []
    },
    status: {
      feature_lifecycle: 'active',
      requirement_counts: { approved: 1 },
      implementation_counts: { implemented: 1 },
      verification_counts: { passed: 1 },
      uat_counts: { passed: 1 },
      evidence_freshness_counts: { current: 1 }
    },
    rows: [readyRow()],
    readiness_policy: { uat_required: true },
    evidence: [evidence],
    evidence_current: evidence,
    evidence_freshness: 'current',
    uat_result: null,
    uat_records: [uat],
    gaps: [],
    verdict: 'READY',
    blockers: [],
    warnings: [],
    redaction: {
      redaction_applied: false,
      redacted_fields: [],
      excluded_paths: [],
      secret_scan: 'passed',
      pii_redacted: true,
      logs_sanitized: true
    },
    validation: {
      action_errors: [],
      identity_errors: [],
      side_effect_errors: [],
      context_errors: [],
      validator_module: '_refs/product/product-protocol.mjs'
    },
    ...overrides
  };
};

const approvedSpecFixture = ({
  specPath = '.sdcorejs/specs/product/contract-001.md',
  body = '# Approved contract\n\n1. AC-001 - Bulk deletion is denied.\n',
  approvalSource = 'explicit-user-choice',
  contractId = 'CONTRACT-001',
  featureId = 'FEATURE-001',
  requirementRevision = 1,
  requirementIds = ['AC-001'],
  approvedAt = '2026-07-13T14:00:00.000Z',
  approvedBy = 'product-owner'
} = {}) => {
  const approvedSpecHash = sha256(body);
  const contentTemplate = [
      '---',
      'name: contract-001',
      'description: Approved product contract fixture.',
      `contract_id: ${contractId}`,
      `feature_id: ${featureId}`,
      `requirement_revision: ${requirementRevision}`,
      'requirement_ids:',
      ...requirementIds.map((requirementId) => `  - ${requirementId}`),
      `approvedAt: ${approvedAt}`,
      `approvedBy: ${approvedBy}`,
      `approval_source: ${approvalSource}`,
      'track: product',
      'target_root_kind: target-project',
      'stack_profile: general',
      `approved_spec_hash: ${approvedSpecHash}`,
      'approved_spec_integrity_hash: <pending-integrity>',
      `acceptance_criteria_count: ${requirementIds.length}`,
      `manual_criteria_count: ${requirementIds.length}`,
      'redaction_applied: false',
      'supersedes: null',
      'change_control:',
      `  revision: ${requirementRevision}`,
      '  supersedes: null',
      '  change_reason: null',
      '---',
      body
    ].join('\n');
  const approvedSpecIntegrityHash = hashApprovedSnapshotIntegrity(contentTemplate, 'approved_spec_integrity_hash');
  return {
    specPath,
    approvedSpecHash,
    approvedSpecIntegrityHash,
    content: contentTemplate.replace('<pending-integrity>', approvedSpecIntegrityHash)
  };
};

const approvedProductPlanFixture = (repositoryRoot, {
  productAction = 'audit-readonly',
  allowedPaths = ['product/**', '.sdcorejs/docs/product/**'],
  prohibitedPaths = ['.git/**'],
  productActionAllowedPaths = allowedPaths
} = {}) => {
  const specPath = '.sdcorejs/specs/product/contract-001.md';
  const planPath = '.sdcorejs/plans/product/contract-001.md';
  const targetRoot = repositoryRoot.replaceAll('\\', '/');
  const productActionAuthority = standaloneProductActionAuthority(productAction, productActionAllowedPaths);
  const specTextTemplate = `---
name: contract-001
description: Approved product contract fixture.
contract_id: CONTRACT-001
feature_id: FEATURE-001
requirement_revision: 1
requirement_ids:
  - AC-001
approvedAt: 2026-07-13T14:00:00.000Z
approvedBy: product-owner
approval_source: explicit-user-choice
track: product
target_root_kind: target-project
stack_profile: general
approved_spec_hash: <pending-spec-hash>
approved_spec_integrity_hash: <pending-spec-integrity>
change_control:
  revision: 1
  supersedes: null
  change_reason: null
---
# Approved contract

\`\`\`yaml
spec_context:
  contract_id: CONTRACT-001
  feature_id: FEATURE-001
  requirement_revision: 1
  requirement_ids:
    - AC-001
  approved_spec_path: ${specPath}
  approved_spec_hash: <pending-spec-hash>
\`\`\`

## Approved behavior

- AC-001 - Bulk deletion is denied.
`;
  const approvedSpecHash = hashApprovedSnapshot(specTextTemplate, 'approved_spec_hash');
  const specWithHash = specTextTemplate.replaceAll('<pending-spec-hash>', approvedSpecHash);
  const approvedSpecIntegrityHash = hashApprovedSnapshotIntegrity(specWithHash, 'approved_spec_integrity_hash');
  const specText = specWithHash.replace('<pending-spec-integrity>', approvedSpecIntegrityHash);

  const planTextTemplate = `---
name: contract-001-plan
description: Approved product execution plan fixture.
contract_id: CONTRACT-001
feature_id: FEATURE-001
track: product
target_root_kind: target-project
stack_profile: general
taskCount: 1
phaseCount: 1
requirement_revision: 1
requirement_ids:
  - AC-001
sourceSpecPath: ${specPath}
approved_spec_hash: ${approvedSpecHash}
approved_spec_integrity_hash: ${approvedSpecIntegrityHash}
approvedAt: 2026-07-13T14:05:00.000Z
approvedBy: product-owner
approval_source: explicit-user-choice
allowed_paths:
${allowedPaths.map((scopePath) => `  - ${scopePath}`).join('\n')}
prohibited_paths:
${prohibitedPaths.map((scopePath) => `  - ${scopePath}`).join('\n')}
dependency_changes:
  required: false
  approval_required: false
env_changes:
  required: false
  approval_required: false
migration_changes:
  required: false
  approval_required: false
approved_plan_hash: <pending-plan-hash>
approved_plan_integrity_hash: <pending-plan-integrity>
---
# Approved Plan

\`\`\`yaml
plan_context:
  contract_id: CONTRACT-001
  feature_id: FEATURE-001
  requirement_revision: 1
  requirement_ids:
    - AC-001
  approved_spec_path: ${specPath}
  approved_spec_hash: ${approvedSpecHash}
  approved_spec_integrity_hash: ${approvedSpecIntegrityHash}
  approved_plan_path: ${planPath}
  approved_plan_hash: <pending-plan-hash>
  source: sdcorejs-plan
  target_root: ${targetRoot}
  target_root_kind: target-project
  track: product
  stack_profile: general
${renderProductActionAuthority(productActionAuthority, '  ')}
  task_count: 1
  phase_count: 1
  allowed_paths:
${allowedPaths.map((scopePath) => `    - ${scopePath}`).join('\n')}
  prohibited_paths:
${prohibitedPaths.map((scopePath) => `    - ${scopePath}`).join('\n')}
  generated_artifacts: []
  docs_artifacts: []
  dependency_changes:
    required: false
    packages: []
    approval_required: false
  env_changes:
    required: false
    files: []
    approval_required: false
  migration_changes:
    required: false
    description: null
    approval_required: false
  frontend_architecture:
    required: false
    not_applicable_reason: product protocol fixture
  verification_strategy:
    package_manager: npm
    scripts_detected: []
    commands_planned:
      - command_or_script: node --test test/e2e/product-protocol.test.mjs
        reason: validate product final authorization
    commands_skipped: []
    focused_checks:
      - product final authorization
    broad_checks:
      - canonical product suite
  finish_tail:
    docs_before_final_branch_ready: true
    verify_before_done: true
    branch_ready_final_gate: true
    no_writes_after_branch_ready: true
\`\`\`
`;
  const approvedPlanHash = hashApprovedSnapshot(planTextTemplate, 'approved_plan_hash');
  const planWithHash = planTextTemplate.replaceAll('<pending-plan-hash>', approvedPlanHash);
  const approvedPlanIntegrityHash = hashApprovedSnapshotIntegrity(planWithHash, 'approved_plan_integrity_hash');
  const planText = planWithHash.replace('<pending-plan-integrity>', approvedPlanIntegrityHash);
  const planContext = {
    contract_id: 'CONTRACT-001',
    feature_id: 'FEATURE-001',
    requirement_revision: 1,
    requirement_ids: ['AC-001'],
    approved_spec_path: specPath,
    approved_spec_hash: approvedSpecHash,
    approved_spec_integrity_hash: approvedSpecIntegrityHash,
    approved_plan_path: planPath,
    approved_plan_hash: approvedPlanHash,
    approved_plan_integrity_hash: approvedPlanIntegrityHash,
    source: 'sdcorejs-plan',
    target_root: targetRoot,
    target_root_kind: 'target-project',
    track: 'product',
    stack_profile: 'general',
    product_action_authority: structuredClone(productActionAuthority),
    task_count: 1,
    phase_count: 1,
    allowed_paths: [...allowedPaths],
    prohibited_paths: [...prohibitedPaths],
    generated_artifacts: [],
    docs_artifacts: [],
    dependency_changes: { required: false, packages: [], approval_required: false },
    env_changes: { required: false, files: [], approval_required: false },
    migration_changes: { required: false, description: null, approval_required: false },
    frontend_architecture: { required: false, not_applicable_reason: 'product protocol fixture' },
    verification_strategy: {
      package_manager: 'npm',
      scripts_detected: [],
      commands_planned: [{
        command_or_script: 'node --test test/e2e/product-protocol.test.mjs',
        reason: 'validate product final authorization'
      }],
      commands_skipped: [],
      focused_checks: ['product final authorization'],
      broad_checks: ['canonical product suite']
    },
    finish_tail: {
      docs_before_final_branch_ready: true,
      verify_before_done: true,
      branch_ready_final_gate: true,
      no_writes_after_branch_ready: true
    }
  };
  assert.deepEqual(validateApprovedPlanIntegrity({
    planText,
    specText,
    planPath,
    specPath,
    planContext
  }), []);
  return {
    specPath,
    planPath,
    approvedSpecHash,
    approvedSpecIntegrityHash,
    approvedPlanHash,
    approvedPlanIntegrityHash,
    content: specText,
    planContent: planText,
    planContext
  };
};

const authorityBoundContext = (repositoryRoot, fixture, overrides = {}) => {
  const base = completeProductContext();
  const actionAuthority = fixture.planContext?.product_action_authority
    ?? standaloneProductActionAuthority('audit-readonly');
  const evidence = currentEvidence({
    approved_spec_path: fixture.specPath,
    approved_spec_hash: fixture.approvedSpecHash,
    approved_spec_integrity_hash: fixture.approvedSpecIntegrityHash,
    expected_result_ref: `${fixture.specPath}#ac-001`
  });
  const normative = normativeProjection({
    approved_spec_path: fixture.specPath,
    approved_spec_hash: fixture.approvedSpecHash
  });
  return completeProductContext({
    target: {
      ...base.target,
      repo_root: repositoryRoot,
      target_root: repositoryRoot
    },
    approved_spec_path: fixture.specPath,
    approved_spec_hash: fixture.approvedSpecHash,
    approved_spec_integrity_hash: fixture.approvedSpecIntegrityHash,
    product_action: actionAuthority.steps[0].action,
    product_action_lifecycle: productActionLifecycle(actionAuthority),
    approval: {
      ...base.approval,
      approval_source: 'explicit-user-choice'
    },
    normative_before: structuredClone(normative),
    normative_after: structuredClone(normative),
    rows: [readyRow({ source_ref: `${fixture.specPath}#ac-001` })],
    evidence: [evidence],
    evidence_current: evidence,
    ...overrides
  });
};

const authorityBoundState = (fixture, overrides = {}) => currentState({
  approved_spec_path: fixture.specPath,
  approved_spec_hash: fixture.approvedSpecHash,
  approved_spec_integrity_hash: fixture.approvedSpecIntegrityHash,
  ...overrides
});

async function writeApprovedSpecFixture(repositoryRoot, fixture) {
  const absolutePath = path.join(repositoryRoot, ...fixture.specPath.split('/'));
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, fixture.content, 'utf8');
  return absolutePath;
}

async function writeApprovedPlanFixture(repositoryRoot, fixture) {
  const absolutePath = path.join(repositoryRoot, ...fixture.planPath.split('/'));
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, fixture.planContent, 'utf8');
  return absolutePath;
}

async function createTrustedReadyFixture(t) {
  const repositoryRoot = await mkdtemp(path.join(tmpdir(), 'sdcorejs-product-ready-'));
  t.after(() => rm(repositoryRoot, { recursive: true, force: true }));
  const fixture = approvedProductPlanFixture(repositoryRoot);
  await writeApprovedSpecFixture(repositoryRoot, fixture);
  const approvedPlanPath = await writeApprovedPlanFixture(repositoryRoot, fixture);
  const planIdentity = {
    approved_plan_path: fixture.planPath,
    approved_plan_hash: fixture.approvedPlanHash,
    approved_plan_integrity_hash: fixture.approvedPlanIntegrityHash
  };
  const readyPath = path.join(repositoryRoot, 'src', 'ready.ts');
  await mkdir(path.dirname(readyPath), { recursive: true });
  await writeFile(readyPath, 'export const ready = true;\n', 'utf8');
  const testPath = path.join(repositoryRoot, 'test', 'ready.test.mjs');
  await mkdir(path.dirname(testPath), { recursive: true });
  await writeFile(testPath, "import '../src/ready.ts';\n", 'utf8');
  const activeLedgerPath = path.join(repositoryRoot, '.sdcorejs', 'docs', 'product', 'contract-001', 'current.md');
  await mkdir(path.dirname(activeLedgerPath), { recursive: true });
  await writeFile(activeLedgerPath, [
    '---',
    'contract_id: CONTRACT-001',
    'feature_id: FEATURE-001',
    '---',
    '',
    '# Current product ledger',
    ''
  ].join('\n'), 'utf8');
  const uatScenarioRef = 'product/uat-checklists/contract-001.md#uat-001';
  const uatScenarioPath = path.join(repositoryRoot, 'product', 'uat-checklists', 'contract-001.md');
  const uatScenarioContent = '# UAT-001\n\nVerify the approved invoice is visible.\n';
  await mkdir(path.dirname(uatScenarioPath), { recursive: true });
  await writeFile(uatScenarioPath, uatScenarioContent, 'utf8');
  const uatScenarioHash = sha256(uatScenarioContent);
  const observedBuildIdentity = 'head-ready';
  const observeBuildIdentity = async () => observedBuildIdentity;
  const observeAuditStatus = async () => sha256('status-ready');
  const uat = currentUatRecord({
    scenario_source_ref: uatScenarioRef,
    scenario_source_hash: uatScenarioHash
  });

  const trustedCurrentState = await productProtocol.observeRelevantPathState({
    repositoryRoot,
    relevantPaths: readyRelevantPaths,
    uatScenarioRefs: [uatScenarioRef],
    observeBuildIdentity
  });
  assert.equal(trustedCurrentState.verified, true, trustedCurrentState.errors?.join('; '));
  const manifest = {
    relevant_paths: [...trustedCurrentState.relevant_paths],
    relevant_path_hashes: { ...trustedCurrentState.relevant_path_hashes },
    relevant_paths_hash: trustedCurrentState.relevant_paths_hash
  };
  const evidence = currentEvidence({
    approved_spec_path: fixture.specPath,
    approved_spec_hash: fixture.approvedSpecHash,
    approved_spec_integrity_hash: fixture.approvedSpecIntegrityHash,
    ...planIdentity,
    expected_result_ref: `${fixture.specPath}#ac-001`,
    ...manifest
  });
  const context = authorityBoundContext(repositoryRoot, fixture, {
    ...planIdentity,
    evidence: [evidence],
    evidence_current: evidence,
    uat_records: [uat]
  });
  const evidenceById = new Map(context.evidence.map((record) => [record.evidence_id, record]));
  const uatById = new Map(context.uat_records.map((record) => [record.uat_record_id, record]));
  const observeAutomatedEvidence = async ({ evidence_id }) => automatedExecutionObservation(evidenceById.get(evidence_id));
  const observeManualUat = async ({ uat_record_id }) => manualUatExecutionObservation(uatById.get(uat_record_id));
  const current = authorityBoundState(fixture, {
    ...planIdentity,
    ...manifest,
    uat_build_or_revision: observedBuildIdentity,
    uat_scenario_hashes: { [uatScenarioRef]: uatScenarioHash }
  });
  const trustedAuthority = await productProtocol.verifyApprovedSpecAuthority({ repositoryRoot, context });
  assert.equal(trustedAuthority.verified, true, trustedAuthority.errors?.join('; '));
  for (const snapshot of [context.normative_before, context.normative_after]) {
    snapshot.requirements = structuredClone(trustedAuthority.requirements);
    snapshot.requirement_field_hashes = { ...trustedAuthority.requirement_field_hashes };
    snapshot.requirement_source_hashes = { ...trustedAuthority.requirement_source_hashes };
  }
  const authorityRequirements = new Map(trustedAuthority.requirements.map((requirement) => [requirement.id, requirement]));
  for (const row of context.rows) {
    const requirement = authorityRequirements.get(row.requirement_id);
    if (!requirement) continue;
    for (const field of ['required', 'source_ref', 'source_hash', 'requirement_status', 'uat_required']) {
      row[field] = requirement[field];
    }
  }
  const executeAudit = async ({ request_digest }) => ({ completed: true, request_digest });
  const authorization = await productProtocol.authorizeProductContext({
    repositoryRoot,
    context,
    currentState: current,
    observeBuildIdentity,
    observeAutomatedEvidence,
    observeManualUat,
    observeAuditStatus,
    executeAudit
  });
  assert.equal(authorization.authorized, true, authorization.errors?.join('; '));
  return {
    repositoryRoot,
    fixture,
    approvedPlanPath,
    readyPath,
    uatScenarioPath,
    uatScenarioRef,
    uatScenarioHash,
    observeBuildIdentity,
    observeAutomatedEvidence,
    observeManualUat,
    observeAuditStatus,
    executeAudit,
    context,
    currentState: current,
    authorization,
    options: {
      trusted_authority: trustedAuthority,
      trusted_current_state: trustedCurrentState,
      trusted_layout: authorization.layout_observation
    }
};
}

async function createScopedWriteFixture(t, {
  planAllowedPaths,
  planProhibitedPaths = ['.git/**'],
  productActionAllowedPaths = planAllowedPaths,
  contextAllowedPaths,
  plannedWrites = [],
  actualWrites = [],
  deletedPaths = []
}) {
  const trusted = await createTrustedReadyFixture(t);
  const fixture = approvedProductPlanFixture(trusted.repositoryRoot, {
    productAction: 'traceability-sync',
    allowedPaths: planAllowedPaths,
    prohibitedPaths: planProhibitedPaths,
    productActionAllowedPaths
  });
  await writeApprovedPlanFixture(trusted.repositoryRoot, fixture);
  const planIdentity = {
    approved_plan_path: fixture.planPath,
    approved_plan_hash: fixture.approvedPlanHash,
    approved_plan_integrity_hash: fixture.approvedPlanIntegrityHash
  };
  const evidence = trusted.context.evidence.map((record) => ({ ...record, ...planIdentity }));
  const context = {
    ...trusted.context,
    ...planIdentity,
    evidence,
    evidence_current: evidence[0],
    product_action: 'traceability-sync',
    product_action_lifecycle: productActionLifecycle(fixture.planContext.product_action_authority),
    persistence_requested: false,
    write_policy: 'allow',
    side_effects_allowed: true,
    write_authorized: true,
    allowed_paths: [...contextAllowedPaths],
    prohibited_paths: [],
    planned_writes: [...plannedWrites],
    actual_writes: [...actualWrites],
    deleted_paths: [...deletedPaths],
    after_status_digest: 'status-after-write',
    gaps: [{ type: 'implementation_drift', blocking: true }],
    blockers: ['implementation drift'],
    verdict: 'BLOCKED'
  };
  const currentState = { ...trusted.currentState, ...planIdentity };
  const authorize = (executeWrite = async () => ({ completed: true })) => productProtocol.authorizeProductContext({
    repositoryRoot: trusted.repositoryRoot,
    context,
    currentState,
    observeBuildIdentity: trusted.observeBuildIdentity,
    observeAutomatedEvidence: trusted.observeAutomatedEvidence,
    observeManualUat: trusted.observeManualUat,
    executeWrite
  });
  return { ...trusted, fixture, context, currentState, authorize };
}

const validProductFlow = () => ({
  contract_id: 'CONTRACT-001',
  frozen_contract_hash: 'frozen-v1',
  post_sync_state: 'diff-after-sync',
  final_evidence_state: 'diff-after-sync',
  stages: [
    { id: 'seed', action: 'seed-from-approved-spec', depends_on: [], owner: 'product', contract_hash: 'frozen-v1', write_policy: 'allow' },
    { id: 'backend', action: 'implementation', depends_on: ['seed'], owner: 'backend', contract_hash: 'frozen-v1', write_policy: 'allow' },
    { id: 'frontend', action: 'implementation', depends_on: ['seed'], owner: 'frontend', contract_hash: 'frozen-v1', write_policy: 'allow' },
    { id: 'test', action: 'test-evidence', depends_on: ['backend', 'frontend'], owner: 'test', contract_hash: 'frozen-v1', write_policy: 'allow' },
    { id: 'fan-in', action: 'integration-fan-in', depends_on: ['backend', 'frontend', 'test'], owner: 'parent', contract_hash: 'frozen-v1', write_policy: 'allow' },
    { id: 'write-tail', action: 'write-tail-complete', depends_on: ['fan-in'], owner: 'parent', contract_hash: 'frozen-v1', write_policy: 'allow' },
    {
      id: 'sync',
      action: 'traceability-sync',
      depends_on: ['write-tail'],
      owner: 'integration',
      contract_hash: 'frozen-v1',
      consumes_integrated_paths: true,
      consumes_test_evidence: true,
      write_policy: 'allow',
      allowed_paths: ['.sdcorejs/docs/product/contract-001/**']
    },
    {
      id: 'global-verification',
      action: 'global-verification',
      depends_on: ['sync'],
      owner: 'parent',
      contract_hash: 'frozen-v1',
      write_policy: 'deny',
      status: 'PASS',
      associated_head_or_diff: 'diff-after-sync',
      output_digest: 'global-output-v1'
    },
    {
      id: 'audit',
      action: 'audit-readonly',
      depends_on: ['global-verification'],
      owner: 'parent',
      contract_hash: 'frozen-v1',
      write_policy: 'deny',
      before_status_digest: 'status-v1',
      after_status_digest: 'status-v1',
      actual_writes: []
    },
    {
      id: 'ship',
      action: 'ship',
      depends_on: ['audit'],
      owner: 'parent',
      contract_hash: 'frozen-v1',
      consumes_product_action: 'audit-readonly',
      write_policy: 'deny'
    }
  ]
});

function clone(value) {
  return structuredClone(value);
}

function assertHasError(errors, pattern) {
  assert.ok(errors.some((error) => pattern.test(error)), `Expected ${pattern} in:\n${errors.join('\n')}`);
}

test('exported product validators fail closed on malformed object inputs', () => {
  const validators = [
    ['validateProductAction', (value) => validateProductAction('audit-readonly', value), (result) => result],
    ['validateActionSideEffects', (value) => validateActionSideEffects(value), (result) => result.errors],
    ['validateIdentityTransition', (value) => validateIdentityTransition(value), (result) => result],
    ['validateProductOrchestration', (value) => validateProductOrchestration(value), (result) => result],
    ['validateProductContext', (value) => validateProductContext(value), (result) => result]
  ];

  for (const malformed of [null, [], 'invalid']) {
    for (const [name, invoke, errorsFrom] of validators) {
      let result;
      assert.doesNotThrow(() => { result = invoke(malformed); }, `${name} must not throw`);
      assertHasError(errorsFrom(result), /object/i);
    }
  }

  assert.doesNotThrow(() => validateProductOrchestration({ stages: [null, 'invalid'] }));
  assertHasError(validateProductOrchestration({ stages: [null, 'invalid'] }), /stage.*object|malformed.*stage/i);
});

test('exported product authority wrappers fail closed on malformed object inputs', async () => {
  const wrappers = [
    ['verifyApprovedSpecAuthority', productProtocol.verifyApprovedSpecAuthority, 'verified'],
    ['observeRelevantPathState', productProtocol.observeRelevantPathState, 'verified'],
    ['authorizeProductContext', productProtocol.authorizeProductContext, 'authorized']
  ];

  for (const malformed of [null, [], 'invalid']) {
    for (const [name, invoke, resultField] of wrappers) {
      let result;
      await assert.doesNotReject(async () => { result = await invoke(malformed); }, `${name} must not reject`);
      assert.equal(result[resultField], false, `${name} must fail closed`);
      assertHasError(result.errors, /input.*object|object.*input/i);
    }
  }

  const malformedContext = await productProtocol.verifyApprovedSpecAuthority({
    repositoryRoot: repoRoot,
    context: null
  });
  assert.equal(malformedContext.verified, false);
  assertHasError(malformedContext.errors, /context.*object|object.*context/i);
});

test('deep malformed product arrays and nested records fail closed without throwing', async (t) => {
  const identity = {
    contract_id: 'CONTRACT-001',
    feature_id: 'FEATURE-001',
    requirement_revision: 1,
    requirement_ids: ['AC-001'],
    retired_requirement_ids: [],
    approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
    approved_spec_hash: 'spec-v1'
  };
  const malformedFlowWrites = validProductFlow();
  malformedFlowWrites.stages[0].planned_writes = { invalid: true };
  const malformedFlowDependencies = validProductFlow();
  malformedFlowDependencies.stages[0].depends_on = { invalid: true };
  const malformedContexts = [
    completeProductContext({ planned_writes: { invalid: true } }),
    completeProductContext({ rows: [{ ...readyRow(), verification_evidence_ids: { invalid: true } }] }),
    completeProductContext({ uat_records: [{ ...currentUatRecord(), requirement_ids: { invalid: true } }] })
  ];
  const cases = [
    ['identity requirement_ids', () => validateIdentityTransition({ ...identity, requirement_ids: { invalid: true } }, identity)],
    ['identity retired_requirement_ids', () => validateIdentityTransition(identity, { ...identity, retired_requirement_ids: { invalid: true } })],
    ['orchestration planned_writes', () => validateProductOrchestration(malformedFlowWrites)],
    ['orchestration depends_on', () => validateProductOrchestration(malformedFlowDependencies)],
    ...malformedContexts.map((context, index) => [`product context ${index + 1}`, () => validateProductContext(context)])
  ];

  for (const [name, invoke] of cases) {
    let errors;
    assert.doesNotThrow(() => { errors = invoke(); }, `${name} must not throw`);
    assertHasError(errors, /array|object|record/i);
  }

  const trusted = await createTrustedReadyFixture(t);
  const malformedAuthorizationContext = { ...trusted.context, planned_writes: { invalid: true } };
  let authorization;
  await assert.doesNotReject(async () => {
    authorization = await productProtocol.authorizeProductContext({
      repositoryRoot: trusted.repositoryRoot,
      context: malformedAuthorizationContext,
      currentState: trusted.currentState,
      observeBuildIdentity: trusted.observeBuildIdentity,
      observeAutomatedEvidence: trusted.observeAutomatedEvidence,
      observeManualUat: trusted.observeManualUat
    });
  });
  assert.equal(authorization.authorized, false);
  assertHasError(authorization.errors, /planned_writes.*array|array.*planned_writes/i);
});

test('exported product derivation boundaries fail closed on null and deep malformed values', () => {
  const cases = [
    ['evidence freshness nulls', () => evaluateEvidenceFreshness(null, null), (result) => result.freshness === 'unknown' && result.reasons.some((reason) => /object/i.test(reason))],
    ['UAT freshness nulls', () => productProtocol.evaluateUatFreshness(null, null), (result) => result.freshness === 'unknown' && result.reasons.some((reason) => /object/i.test(reason))],
    ['requirement readiness nulls', () => deriveRequirementReadiness(null, null), (result) => result.verdict === 'BLOCKED' && result.blockers.some((reason) => /object/i.test(reason))],
    ['feature rows with a null entry', () => deriveFeatureVerdict([null], null), (result) => result.verdict === 'BLOCKED' && result.blockers.some((reason) => /object/i.test(reason))],
    ['traceability null input', () => deriveTraceability(null), (result) => result.verdict === 'BLOCKED' && result.gaps.some((gap) => gap.blocking === true)],
    ['traceability non-array requirements', () => deriveTraceability({ requirements: {}, implementation_artifacts: [], test_artifacts: [] }), (result) => result.verdict === 'BLOCKED'],
    ['traceability null nested artifact', () => deriveTraceability({ requirements: [], implementation_artifacts: [null], test_artifacts: [] }), (result) => result.verdict === 'BLOCKED'],
    ['traceability malformed artifact IDs', () => deriveTraceability({
      requirements: [{ id: 'AC-001' }],
      implementation_artifacts: [{ path: 'src/a.ts', requirement_ids: { invalid: true } }],
      test_artifacts: []
    }), (result) => result.verdict === 'BLOCKED'],
    ['layout null input', () => resolveProductLayout(null), (result) => result.doc_layout === 'blocked' && result.operations.length === 0 && result.validation_errors.some((reason) => /object/i.test(reason))],
    ['layout malformed legacy entry', () => resolveProductLayout({ contract_id: 'CONTRACT-001', legacy_ledgers: [null] }), (result) => result.doc_layout === 'blocked' && result.operations.length === 0],
    ['layout malformed established layout', () => resolveProductLayout({ contract_id: 'CONTRACT-001', existing_layout: [] }), (result) => result.doc_layout === 'blocked' && result.operations.length === 0]
  ];

  for (const [name, invoke, isFailClosed] of cases) {
    let result;
    assert.doesNotThrow(() => { result = invoke(); }, `${name} must not throw`);
    assert.equal(isFailClosed(result), true, `${name} must return a fail-closed result`);
  }
});

test('traceability rows accept only the canonical flat status representation', () => {
  const nestedReadyOverride = readyRow({
    implementation_status: 'missing',
    verification_status: 'failed',
    uat_status: 'failed',
    evidence_freshness: 'stale',
    statuses: {
      requirement: 'approved',
      implementation: 'implemented',
      verification: 'passed',
      uat: 'passed',
      evidence_freshness: 'current'
    }
  });
  const matchingDuplicate = readyRow({
    statuses: {
      requirement: 'approved',
      implementation: 'implemented',
      verification: 'passed',
      uat: 'passed',
      evidence_freshness: 'current'
    }
  });

  for (const row of [nestedReadyOverride, matchingDuplicate]) {
    const requirement = deriveRequirementReadiness(row);
    assert.equal(requirement.verdict, 'BLOCKED');
    assertHasError(requirement.blockers, /canonical flat|nested statuses|statuses.*not allowed/i);
    const feature = deriveFeatureVerdict([row]);
    assert.equal(feature.verdict, 'BLOCKED');
    assertHasError(feature.blockers, /canonical flat|nested statuses|statuses.*not allowed/i);
  }

  const errors = validateProductContext(completeProductContext({
    rows: [nestedReadyOverride]
  }), currentState());
  assertHasError(errors, /row.*(?:unknown field statuses|statuses.*unknown|canonical flat)|nested statuses/i);
  assertHasError(errors, /verdict READY.*BLOCKED|contradicts derived verdict BLOCKED/i);

  const rowVerdictErrors = validateProductContext(completeProductContext({
    rows: [readyRow({ verification_status: 'failed' })],
    verdict: 'BLOCKED',
    blockers: ['required verification failed']
  }), currentState());
  assertHasError(rowVerdictErrors, /row AC-001 verdict READY.*derived verdict BLOCKED|row.*verdict.*contradict/i);
});

test('canonical traceability rows require complete identity, source, approval, and verdict fields', () => {
  for (const field of [
    'requirement_id',
    'required',
    'source_ref',
    'source_hash',
    'implementation_approval',
    'verification_approval',
    'uat_approval',
    'verdict'
  ]) {
    const incomplete = readyRow();
    delete incomplete[field];
    const result = deriveFeatureVerdict([incomplete]);
    assert.equal(result.verdict, 'BLOCKED', `missing ${field}`);
    assertHasError(result.blockers, new RegExp(field, 'i'));
  }

  for (const row of [
    readyRow({ source_ref: 'not-a-canonical-source-ref' }),
    readyRow({ source_hash: 'not-a-sha256' })
  ]) {
    const result = deriveFeatureVerdict([row]);
    assert.equal(result.verdict, 'BLOCKED');
    assertHasError(result.blockers, /source_ref|source_hash|source.*ref|SHA-256/i);
  }

  const contradictoryVerdict = deriveFeatureVerdict([readyRow({ verdict: 'BLOCKED' })]);
  assert.equal(contradictoryVerdict.verdict, 'BLOCKED');
  assertHasError(contradictoryVerdict.blockers, /row.*verdict.*contradict|verdict.*derived/i);

  const traced = deriveTraceability({
    requirements: [{
      id: 'AC-001',
      required: true,
      source_ref: '.sdcorejs/specs/product/contract-001.md#ac-001',
      source_hash: sha256('requirement-v1'),
      requirement_status: 'approved',
      uat_required: false
    }],
    implementation_artifacts: [],
    test_artifacts: []
  });
  assert.equal(Object.hasOwn(traced.rows[0], 'verdict'), true);
  assert.equal(traced.rows[0].verdict, deriveRequirementReadiness(traced.rows[0]).verdict);
});

test('raw not_applicable implementation and verification decisions remain descriptive without trusted authority', () => {
  for (const dimension of ['implementation', 'verification']) {
    const statusField = `${dimension}_status`;
    const approvalField = `${dimension}_approval`;
    const validRow = readyRow({
      [statusField]: 'not_applicable',
      [approvalField]: approvedNotApplicableDecision(dimension),
      uat_required: false,
      uat_status: 'not_run',
      uat_record_ids: []
    });
    const rawDecision = deriveRequirementReadiness(validRow);
    assert.equal(rawDecision.verdict, 'BLOCKED', `${dimension} raw decision must not authorize readiness`);
    assertHasError(rawDecision.blockers, /trusted.*decision|decision.*authority|one-shot/i);

    const invalidDecisions = [
      approvedException(),
      approvedNotApplicableDecision(dimension, { requirement_id: 'AC-OTHER' }),
      approvedNotApplicableDecision(dimension, { dimension: dimension === 'implementation' ? 'verification' : 'implementation' }),
      approvedNotApplicableDecision(dimension, { status: 'waived' }),
      approvedNotApplicableDecision(dimension, { approved_at: 'not-an-instant' }),
      approvedNotApplicableDecision(dimension, { unknown_field: true })
    ];
    const missingIdentity = approvedNotApplicableDecision(dimension);
    delete missingIdentity.decision_id;
    invalidDecisions.push(missingIdentity);

    for (const decision of invalidDecisions) {
      const result = deriveRequirementReadiness({ ...validRow, [approvalField]: decision });
      assert.equal(result.verdict, 'BLOCKED', `${dimension}: ${JSON.stringify(decision)}`);
      assertHasError(result.blockers, new RegExp(`${dimension}.*decision|decision.*${dimension}`, 'i'));
    }

    const optionalWithGenericDecision = deriveRequirementReadiness({
      ...validRow,
      required: false,
      [approvalField]: approvedException()
    });
    assert.equal(optionalWithGenericDecision.verdict, 'BLOCKED', `${dimension}: optional rows still require a row-bound decision`);
  }
});

test('approved plan identity is required by product evidence freshness and consumer validation', () => {
  const planIdentity = {
    approved_plan_path: '.sdcorejs/plans/product/contract-001.md',
    approved_plan_hash: 'b'.repeat(64),
    approved_plan_integrity_hash: 'c'.repeat(64)
  };
  const evidence = currentEvidence(planIdentity);
  const current = currentState(planIdentity);
  assert.equal(evaluateEvidenceFreshness(evidence, current).freshness, 'current');

  for (const field of Object.keys(planIdentity)) {
    const missingEvidence = structuredClone(evidence);
    delete missingEvidence[field];
    const missingEvidenceResult = evaluateEvidenceFreshness(missingEvidence, current);
    assert.equal(missingEvidenceResult.freshness, 'unknown', `${field} missing from evidence must be unknown`);
    assertHasError(missingEvidenceResult.reasons, new RegExp(field));

    const missingCurrent = structuredClone(current);
    delete missingCurrent[field];
    const missingCurrentResult = evaluateEvidenceFreshness(evidence, missingCurrent);
    assert.equal(missingCurrentResult.freshness, 'unknown', `${field} missing from current state must be unknown`);
    assertHasError(missingCurrentResult.reasons, new RegExp(field));
  }

  const changedCurrent = currentState({
    ...planIdentity,
    approved_plan_hash: 'd'.repeat(64)
  });
  const stale = evaluateEvidenceFreshness(evidence, changedCurrent);
  assert.equal(stale.freshness, 'stale');
  assertHasError(stale.reasons, /approved plan hash changed/i);

  const context = completeProductContext({
    ...planIdentity,
    evidence: [evidence],
    evidence_current: evidence
  });
  const contextErrors = validateProductContext(context, current);
  assert.ok(!contextErrors.some((error) => /unknown field approved_plan_/i.test(error)), contextErrors.join('\n'));

  const staleContextErrors = validateProductContext(context, changedCurrent);
  assertHasError(staleContextErrors, /approved plan hash changed|approved_plan_hash.*mismatch/i);
});

test('audit-readonly enforces a strict zero-write action', async () => {
  const validActions = {
    'seed-from-approved-spec': actionContext('seed-from-approved-spec', {
      contract_id: 'CONTRACT-001',
      requirement_revision: 1,
      requirement_ids: ['AC-001'],
      approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
      approved_spec_hash: 'spec-v1',
      approval: approvedAuthority()
    }),
    'requirements-update': actionContext('requirements-update', {
      contract_id: 'CONTRACT-001',
      requirement_revision: 2,
      supersedes: 1,
      change_reason: 'Approved scope revision.',
      approved_spec_path: '.sdcorejs/specs/product/contract-001-r2.md',
      approved_spec_hash: 'spec-v2',
      approval: approvedAuthority()
    }),
    'traceability-sync': actionContext('traceability-sync', {
      contract_id: 'CONTRACT-001',
      requirement_revision: 1,
      approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
      approved_spec_hash: 'spec-v1',
      evidence: [],
      normative_before: normativeProjection(),
      normative_after: normativeProjection()
    }),
    'audit-readonly': actionContext('audit-readonly', {
      contract_id: 'CONTRACT-001',
      requirement_revision: 1,
      approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
      approved_spec_hash: 'spec-v1',
      evidence: [],
      normative_before: normativeProjection(),
      normative_after: normativeProjection()
    }),
    'audit-and-sync': actionContext('audit-and-sync', {
      contract_id: 'CONTRACT-001',
      requirement_revision: 1,
      approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
      approved_spec_hash: 'spec-v1',
      evidence: [],
      normative_before: normativeProjection(),
      normative_after: normativeProjection()
    }),
    'record-uat': actionContext('record-uat', {
      contract_id: 'CONTRACT-001',
      requirement_revision: 1,
      requirement_ids: ['AC-001'],
      approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
      approved_spec_hash: 'spec-v1',
      normative_before: normativeProjection(),
      normative_after: normativeProjection(),
      layout: completeProductContext().layout,
      evidence: [currentEvidence()],
      uat_result: currentUatRecord()
    }),
    'supersede-feature': actionContext('supersede-feature', {
      contract_id: 'CONTRACT-001',
      requirement_revision: 2,
      supersedes: 1,
      change_reason: 'Approved replacement.',
      approved_spec_path: '.sdcorejs/specs/product/contract-001-r2.md',
      approved_spec_hash: 'spec-v2',
      approval: approvedAuthority(),
      replacement_contract_id: 'CONTRACT-002'
    })
  };
  for (const [action, context] of Object.entries(validActions)) {
    assert.deepEqual(validateProductAction(action, context), [], action);
  }
  for (const action of Object.keys(validActions)) {
    assert.ok(validateProductAction(action, { side_effects_allowed: action !== 'audit-readonly' }).length > 0, `${action} must reject missing prerequisites`);
  }
  assertHasError(validateProductAction('requirements-update', {
    ...validActions['requirements-update'],
    approval: {
      approved: true,
      approved_by: null,
      approved_at: null,
      approval_source: null
    }
  }), /complete.*approval|approval.*metadata|approved_by|approved_at|approval_source/i);

  const observation = {
    action: 'audit-readonly',
    side_effects_allowed: false,
    allowed_paths: [],
    planned_paths: [],
    actual_paths: [],
    dirty_paths: [],
    summary_refresh: false,
    checkpoint_write: false,
    requirements_changed: false,
    before_status_digest: sha256('status-v1'),
    after_status_digest: sha256('status-v1'),
    normative_before: normativeProjection(),
    normative_after: normativeProjection()
  };
  const auditProof = await productProtocol.observeAuditReadonlyState({
    repositoryRoot: repoRoot,
    request: observation,
    observeStatus: async () => sha256('status-v1'),
    executeAudit: async ({ request_digest }) => ({ completed: true, request_digest })
  });
  assert.deepEqual(validateActionSideEffects(observation, { trusted_audit_proof: auditProof }).errors, []);

  for (const mutation of [
    { actual_paths: ['.sdcorejs/docs/product/contract-001/current.md'] },
    { deleted_paths: ['.sdcorejs/docs/product/contract-001/current.md'] },
    { planned_paths: ['.sdcorejs/tasks/current-session.md'] },
    { allowed_paths: ['.sdcorejs/docs/product/**'] },
    { summary_refresh: true },
    { checkpoint_write: true },
    { after_status_digest: sha256('status-v2') }
  ]) {
    assertHasError(validateActionSideEffects({ ...observation, ...mutation }).errors, /audit-readonly|zero-write/i);
  }

  const deletionOnly = validateActionSideEffects({
    action: 'traceability-sync',
    allowed_paths: [],
    planned_paths: [],
    actual_paths: [],
    deleted_paths: ['.sdcorejs/docs/product/contract-001/current.md'],
    dirty_paths: ['.sdcorejs/docs/product/contract-001/current.md'],
    normative_before: normativeProjection(),
    normative_after: normativeProjection()
  });
  assertHasError(deletionOnly.errors, /allowed|boundary|scope/i);
  assertHasError(deletionOnly.errors, /dirty.*overlap/i);
  assert.equal(deletionOnly.requires_user_choice, true);

  const allowedDeletion = validateActionSideEffects({
    action: 'traceability-sync',
    write_authorized: true,
    layout: productLedgerLayout(),
    allowed_paths: ['.sdcorejs/docs/product/contract-001/**'],
    planned_paths: [],
    actual_paths: [],
    deleted_paths: ['.sdcorejs/docs/product/contract-001/obsolete-index.md'],
    dirty_paths: [],
    requirements_changed: false,
    normative_before: normativeProjection(),
    normative_after: normativeProjection()
  });
  assert.deepEqual(allowedDeletion.errors, []);
  assert.deepEqual(allowedDeletion.changed_paths, ['.sdcorejs/docs/product/contract-001/obsolete-index.md']);
});

test('traceability-sync preserves every normative requirement field', () => {
  const base = {
    action: 'traceability-sync',
    write_authorized: true,
    layout: productLedgerLayout(),
    allowed_paths: ['.sdcorejs/docs/product/contract-001/**'],
    planned_paths: ['.sdcorejs/docs/product/contract-001/current.md'],
    actual_paths: ['.sdcorejs/docs/product/contract-001/current.md'],
    requirements_changed: false,
    normative_before: normativeProjection(),
    normative_after: normativeProjection()
  };
  assert.deepEqual(validateActionSideEffects(base).errors, []);

  const mutations = [
    (value) => { value.requirements[0].text = 'Bulk deletion is allowed.'; },
    (value) => { value.requirements[0].id = 'AC-018'; },
    (value) => { value.requirements[0].priority = 'optional'; },
    (value) => { value.requirements[0].approval = 'draft'; },
    (value) => { value.requirements[0].scope = 'different-scope'; },
    (value) => { value.approved_spec_hash = 'different-spec'; }
  ];
  for (const mutate of mutations) {
    const after = normativeProjection();
    mutate(after);
    assertHasError(validateActionSideEffects({ ...base, normative_after: after }).errors, /normative|requirement/i);
  }
  assertHasError(validateActionSideEffects({ ...base, requirements_changed: true }).errors, /requirements_changed/i);
  assertHasError(validateActionSideEffects({ ...base, normative_after: undefined }).errors, /normative.*snapshot|snapshot.*normative/i);
});

test('approved requirement removal preserves stable identity and history', () => {
  const previous = {
    contract_id: 'CONTRACT-001',
    feature_id: 'FEATURE-001',
    requirement_revision: 1,
    requirement_ids: ['AC-001', 'AC-002', 'AC-003'],
    retired_requirement_ids: [],
    approved_spec_path: '.sdcorejs/specs/product/contract-001-r1.md',
    approved_spec_hash: 'spec-v1'
  };
  const next = {
    contract_id: 'CONTRACT-001',
    feature_id: 'FEATURE-001',
    requirement_revision: 2,
    requirement_ids: ['AC-001', 'AC-003'],
    retired_requirement_ids: ['AC-002'],
    supersedes: 1,
    change_reason: 'AC-002 is no longer in scope.',
    approval: { approved: true },
    approved_spec_path: '.sdcorejs/specs/product/contract-001-r2.md',
    approved_spec_hash: 'spec-v2'
  };
  assert.deepEqual(validateIdentityTransition(previous, next, { action: 'requirements-update' }), []);

  assertHasError(validateIdentityTransition(previous, { ...next, requirement_ids: ['AC-001', 'AC-002'] }, { action: 'requirements-update' }), /renumber|stable|removed/i);
  assertHasError(validateIdentityTransition(
    { ...previous, retired_requirement_ids: ['AC-004'] },
    { ...next, requirement_ids: ['AC-001', 'AC-003', 'AC-004'], retired_requirement_ids: ['AC-002'] },
    { action: 'requirements-update' }
  ), /reuse|retired/i);
  assertHasError(validateIdentityTransition(previous, {
    ...previous,
    requirement_ids: ['AC-001', 'AC-003'],
    retired_requirement_ids: ['AC-002']
  }, { action: 'traceability-sync' }), /cannot remove|identity|revision/i);

  assertHasError(validateIdentityTransition(
    { ...previous, requirement_ids: ['AC-001', 'AC-001', 'AC-002'] },
    next,
    { action: 'requirements-update' }
  ), /duplicate/i);
  assertHasError(validateIdentityTransition(previous, {
    ...next,
    retired_requirement_ids: ['AC-002', 'AC-INVENTED']
  }, { action: 'requirements-update' }), /invented|provenance|previous/i);
  assertHasError(validateIdentityTransition(
    previous,
    { ...next, retired_requirement_ids: ['AC-002', 'AC-002'] },
    { action: 'requirements-update' }
  ), /duplicate/i);
  assertHasError(validateIdentityTransition(previous, {
    ...next,
    approved_spec_path: previous.approved_spec_path,
    approved_spec_hash: previous.approved_spec_hash
  }, { action: 'requirements-update' }), /approved spec|immutable.*snapshot|spec.*path|spec.*hash/i);
});

test('active requirements cannot collapse to NOT_APPLICABLE through missing rows', () => {
  const activeDerivation = deriveFeatureVerdict([], {
    active_requirement_ids: ['AC-001'],
    feature_lifecycle: 'active'
  });
  assert.equal(activeDerivation.verdict, 'BLOCKED');
  assertHasError(activeDerivation.blockers, /missing.*row|row.*coverage|active requirement/i);

  const missingRows = completeProductContext({ rows: [], verdict: 'NOT_APPLICABLE' });
  assertHasError(validateProductContext(missingRows, currentState()), /row.*coverage|active requirement|missing.*row|verdict/i);

  const supersededDerivation = deriveFeatureVerdict([], {
    active_requirement_ids: ['AC-001'],
    feature_lifecycle: 'superseded'
  });
  assert.equal(supersededDerivation.verdict, 'NOT_APPLICABLE');
  assert.equal(deriveFeatureVerdict([], { active_requirement_ids: [], feature_lifecycle: 'retired' }).verdict, 'NOT_APPLICABLE');
});

test('stale automated evidence cannot support READY', () => {
  const pathV1 = pathManifest(['src/bulk-delete.service.ts'], 'bulk-delete-v1');
  const pathV2 = pathManifest(['src/bulk-delete.service.ts'], 'bulk-delete-v2');
  const evidence = {
    contract_id: 'CONTRACT-001',
    feature_id: 'FEATURE-001',
    requirement_revision: 1,
    approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
    approved_spec_hash: 'spec-v1',
    approved_spec_integrity_hash: 'a'.repeat(64),
    ...readyPlanIdentity,
    ...pathV1,
    verified_head: 'head-old'
  };
  const current = { ...evidence, approved_spec_hash: 'spec-v2', verified_head: 'head-new' };
  const staleContract = evaluateEvidenceFreshness(evidence, current);
  assert.equal(staleContract.freshness, 'stale');
  assertHasError(staleContract.reasons, /spec/i);

  const staleFeature = evaluateEvidenceFreshness(evidence, { ...evidence, feature_id: 'FEATURE-002' });
  assert.equal(staleFeature.freshness, 'stale');
  assertHasError(staleFeature.reasons, /feature_id/i);

  const staleAuthority = evaluateEvidenceFreshness(evidence, {
    ...evidence,
    approved_spec_integrity_hash: 'b'.repeat(64)
  });
  assert.equal(staleAuthority.freshness, 'stale');
  assertHasError(staleAuthority.reasons, /integrity/i);

  const stalePaths = evaluateEvidenceFreshness(evidence, { ...evidence, ...pathV2 });
  assert.equal(stalePaths.freshness, 'stale');
  assert.notEqual(deriveFeatureVerdict([readyRow({ evidence_freshness: 'stale' })]).verdict, 'READY');
});

test('unrelated documentation HEAD movement does not stale scoped evidence', () => {
  const pathV1 = pathManifest(['src/bulk-delete.service.ts'], 'bulk-delete-v1');
  const pathV2 = pathManifest(['src/bulk-delete.service.ts'], 'bulk-delete-v2');
  const evidence = {
    contract_id: 'CONTRACT-001',
    feature_id: 'FEATURE-001',
    requirement_revision: 1,
    approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
    approved_spec_hash: 'spec-v1',
    approved_spec_integrity_hash: 'a'.repeat(64),
    ...readyPlanIdentity,
    ...pathV1,
    verified_head: 'head-old'
  };
  const current = {
    ...evidence,
    verified_head: 'head-new',
    changed_paths: ['docs/notes.md'],
    relevant_paths: ['src/bulk-delete.service.ts']
  };
  const result = evaluateEvidenceFreshness(evidence, current);
  assert.equal(result.freshness, 'current');
  assert.equal(result.head_changed, true);

  assert.equal(evaluateEvidenceFreshness(evidence, { ...current, ...pathV2 }).freshness, 'stale');
  assert.equal(evaluateEvidenceFreshness(evidence, { ...evidence, verified_head: 'head-new' }).freshness, 'current');
  assert.equal(evaluateEvidenceFreshness(evidence, {
    ...evidence,
    verified_head: 'head-new',
    changed_paths: ['src/bulk-delete.service.ts'],
    relevant_paths: ['src/bulk-delete.service.ts']
  }).freshness, 'stale');
  const noHeadEvidence = { ...evidence };
  delete noHeadEvidence.verified_head;
  assert.equal(evaluateEvidenceFreshness(noHeadEvidence, { ...current, verified_head: 'head-new' }).freshness, 'unknown');
});

test('automated E2E verification never promotes UAT', () => {
  const row = readyRow({ uat_status: 'not_run', verification_status: 'passed', uat_required: true });
  const readiness = deriveRequirementReadiness(row);
  assert.equal(readiness.statuses.verification, 'passed');
  assert.equal(readiness.statuses.uat, 'not_run');
  assert.notEqual(readiness.verdict, 'READY');
  assert.notEqual(deriveFeatureVerdict([row]).verdict, 'READY');

  const invalidNotApplicable = deriveRequirementReadiness(readyRow({ uat_status: 'not_applicable', uat_required: true }));
  assert.notEqual(invalidNotApplicable.verdict, 'READY');
  assertHasError(invalidNotApplicable.blockers, /UAT|not_applicable/i);
  assert.equal(deriveRequirementReadiness(readyRow({
    uat_status: 'not_applicable',
    uat_required: true,
    uat_approval: approvedUatDecision({ status: 'not_applicable' })
  })).verdict, 'READY_WITH_WARNINGS');

  const genericPartialDecision = deriveRequirementReadiness(readyRow({
    uat_status: 'waived',
    uat_approval: approvedException({ status: 'waived' })
  }));
  assert.equal(genericPartialDecision.verdict, 'BLOCKED');
  assertHasError(genericPartialDecision.blockers, /complete.*decision|decision.*identity|scope|expiry|review/i);

  const mismatchedDecisionStatus = deriveRequirementReadiness(readyRow({
    uat_status: 'waived',
    uat_approval: approvedUatDecision({ status: 'deferred' })
  }));
  assert.equal(mismatchedDecisionStatus.verdict, 'BLOCKED');
  assertHasError(mismatchedDecisionStatus.blockers, /status|matching.*decision|decision.*waived/i);

  const incompleteWaiver = deriveRequirementReadiness(readyRow({
    uat_status: 'waived',
    uat_approval: { approved: true }
  }));
  assert.equal(incompleteWaiver.verdict, 'BLOCKED');
  assertHasError(incompleteWaiver.blockers, /waiver|decision|approval|reason/i);

  for (const [dimension, overrides] of [
    ['implementation', { implementation_status: 'not_applicable' }],
    ['verification', { verification_status: 'not_applicable' }]
  ]) {
    const result = deriveRequirementReadiness(readyRow(overrides));
    assert.equal(result.verdict, 'BLOCKED', dimension);
    assertHasError(result.blockers, new RegExp(`${dimension}.*approval|approval.*${dimension}`, 'i'));
  }

  const unapprovedWaiver = deriveRequirementReadiness(readyRow({
    uat_status: 'waived',
    evidence_freshness: 'unknown',
    uat_approval: { approved: false }
  }));
  assert.equal(unapprovedWaiver.verdict, 'BLOCKED');
  assertHasError(unapprovedWaiver.blockers, /waiver|approval/i);

  for (const requirementStatus of ['draft', 'proposed', 'agreed', 'rejected']) {
    assert.notEqual(deriveRequirementReadiness(readyRow({
      required: false,
      requirement_status: requirementStatus,
      uat_required: false,
      uat_status: 'not_applicable'
    })).verdict, 'READY', requirementStatus);
  }
});

test('product traceability runs only after deterministic implementation and test fan-in', () => {
  const flow = validProductFlow();
  assert.deepEqual(validateProductOrchestration(flow), []);

  const preflight = clone(flow);
  delete preflight.post_sync_state;
  delete preflight.final_evidence_state;
  const preflightGlobal = preflight.stages.find((stage) => stage.action === 'global-verification');
  delete preflightGlobal.status;
  delete preflightGlobal.associated_head_or_diff;
  delete preflightGlobal.output_digest;
  const preflightAudit = preflight.stages.find((stage) => stage.action === 'audit-readonly');
  delete preflightAudit.before_status_digest;
  delete preflightAudit.after_status_digest;
  assert.deepEqual(validateProductOrchestration(preflight, { validationPhase: 'preflight' }), []);
  assertHasError(validateProductOrchestration(preflight), /PASS|output digest|post-sync|status digest|evidence state/i);

  const absoluteWriteBoundary = validProductFlow();
  absoluteWriteBoundary.stages.find((stage) => stage.action === 'traceability-sync').allowed_paths = ['C:/outside/**'];
  assert.doesNotThrow(() => validateProductOrchestration(absoluteWriteBoundary));
  assertHasError(validateProductOrchestration(absoluteWriteBoundary), /repository-relative|product.*path|allowed path/i);

  const premature = clone(flow);
  premature.stages.find((stage) => stage.id === 'sync').depends_on = ['seed'];
  assertHasError(validateProductOrchestration(premature), /fan-in|sync/i);

  const bypass = clone(flow);
  bypass.stages.find((stage) => stage.id === 'ship').depends_on = ['sync'];
  bypass.stages.find((stage) => stage.id === 'ship').consumes_product_action = 'traceability-sync';
  assertHasError(validateProductOrchestration(bypass), /audit|ship/i);

  const writableAudit = clone(flow);
  writableAudit.stages.find((stage) => stage.id === 'audit').planned_writes = [];
  writableAudit.stages.find((stage) => stage.id === 'audit').allowed_paths = ['.sdcorejs/docs/product/contract-001/**'];
  assertHasError(validateProductOrchestration(writableAudit), /audit.*write/i);

  const writableAuditAliases = clone(flow);
  writableAuditAliases.stages.find((stage) => stage.id === 'audit').planned_paths = ['.sdcorejs/tasks/current-session.md'];
  writableAuditAliases.stages.find((stage) => stage.id === 'audit').actual_paths = ['.sdcorejs/tasks/current-session.md'];
  assertHasError(validateProductOrchestration(writableAuditAliases), /audit.*write/i);

  const incomplete = {
    contract_id: 'CONTRACT-001',
    frozen_contract_hash: 'frozen-v1',
    stages: [
      { id: 'seed', action: 'seed-from-approved-spec', depends_on: [], contract_hash: 'frozen-v1' },
      { id: 'fan-in', action: 'integration-fan-in', depends_on: [], contract_hash: 'frozen-v1' },
      { id: 'sync', action: 'traceability-sync', depends_on: ['fan-in'], owner: 'integration', contract_hash: 'frozen-v1', consumes_integrated_paths: true, consumes_test_evidence: true, allowed_paths: [] },
      { id: 'audit', action: 'audit-readonly', depends_on: ['sync'], contract_hash: 'frozen-v1', write_policy: 'deny', planned_writes: [], actual_writes: [] },
      { id: 'ship', action: 'ship', depends_on: ['audit'], contract_hash: 'frozen-v1', consumes_product_action: 'audit-readonly' }
    ]
  };
  assertHasError(validateProductOrchestration(incomplete), /implementation|test-evidence|write boundary|post-sync/i);

  const missingFrozenIdentity = clone(flow);
  delete missingFrozenIdentity.frozen_contract_hash;
  for (const stage of missingFrozenIdentity.stages) delete stage.contract_hash;
  assertHasError(validateProductOrchestration(missingFrozenIdentity), /frozen.*hash|contract.*hash/i);

  const duplicateSync = clone(flow);
  duplicateSync.stages.splice(1, 0, {
    id: 'premature-sync',
    action: 'traceability-sync',
    depends_on: ['seed'],
    owner: 'integration',
    contract_hash: 'frozen-v1',
    consumes_integrated_paths: true,
    consumes_test_evidence: true,
    allowed_paths: ['.sdcorejs/docs/product/contract-001/**']
  });
  assertHasError(validateProductOrchestration(duplicateSync), /exactly one|traceability-sync|fan-in/i);

  const deletingAudit = clone(flow);
  deletingAudit.stages.find((stage) => stage.id === 'audit').deleted_paths = ['.sdcorejs/docs/product/contract-001/current.md'];
  assertHasError(validateProductOrchestration(deletingAudit), /audit.*write|audit.*delete/i);

  const missingWriteTail = clone(flow);
  missingWriteTail.stages = missingWriteTail.stages.filter((stage) => stage.id !== 'write-tail');
  missingWriteTail.stages.find((stage) => stage.id === 'sync').depends_on = ['fan-in'];
  assertHasError(validateProductOrchestration(missingWriteTail), /write-tail|write.*tail/i);

  const missingGlobalVerification = clone(flow);
  missingGlobalVerification.stages = missingGlobalVerification.stages.filter((stage) => stage.id !== 'global-verification');
  missingGlobalVerification.stages.find((stage) => stage.id === 'audit').depends_on = ['sync'];
  assertHasError(validateProductOrchestration(missingGlobalVerification), /global.*verification/i);

  const staleGlobalVerification = clone(flow);
  staleGlobalVerification.stages.find((stage) => stage.id === 'global-verification').associated_head_or_diff = 'pre-sync-state';
  assertHasError(validateProductOrchestration(staleGlobalVerification), /post-sync|associated.*state|global.*verification/i);

  const lateWrite = clone(flow);
  lateWrite.stages.push({
    id: 'auto-docs',
    action: 'auto-docs',
    depends_on: ['audit'],
    owner: 'parent',
    contract_hash: 'frozen-v1',
    write_policy: 'allow',
    actual_writes: ['docs/user-guide.md']
  });
  assertHasError(validateProductOrchestration(lateWrite), /late write|after audit|final write|traceability-sync/i);
});

test('supporting refactors are not mislabeled as unapproved scope', () => {
  const supporting = deriveTraceability({
    requirements: [{ id: 'AC-001', behavior_key: 'invoice-view', expected: 'allowed' }],
    implementation_artifacts: [{ path: 'src/invoice.mapper.ts', observable_behavior: false, supports: ['AC-001'] }],
    test_artifacts: []
  });
  assert.equal(supporting.artifacts[0].role, 'supporting_implementation');
  assert.ok(!supporting.gaps.some((gap) => gap.type === 'unapproved_scope'));
  assert.notEqual(supporting.rows[0].implementation_status, 'implemented');

  const observableSupportClaim = deriveTraceability({
    requirements: [{ id: 'AC-001', behavior_key: 'invoice-view', expected: 'allowed' }],
    implementation_artifacts: [{ path: 'src/new-public-route.ts', observable_behavior: true, supports: ['AC-001'] }],
    test_artifacts: []
  });
  assert.ok(observableSupportClaim.gaps.some((gap) => gap.type === 'unapproved_scope' && gap.blocking));

  const publicBehavior = deriveTraceability({
    requirements: [],
    implementation_artifacts: [{ path: 'src/public-route.ts', observable_behavior: true, behavior_key: 'new-public-route' }],
    test_artifacts: []
  });
  assert.ok(publicBehavior.gaps.some((gap) => gap.type === 'unapproved_scope' && gap.blocking));
});

test('security and regression controls may own tests without user-story mappings', () => {
  const mapped = deriveTraceability({
    requirements: [],
    implementation_artifacts: [],
    test_artifacts: [{ path: 'test/security/authz.test.ts', control_requirement_ids: ['SEC-001'], assertions: ['deny cross-tenant access'] }]
  });
  assert.equal(mapped.artifacts[0].role, 'control_verification');
  assert.ok(!mapped.gaps.some((gap) => gap.type === 'orphan_behavior_assertion'));

  const unexecuted = deriveTraceability({
    requirements: [{ id: 'AC-001', behavior_key: 'invoice-view', expected: 'allowed' }],
    implementation_artifacts: [{ path: 'src/invoice.ts', behavior_key: 'invoice-view', observable_behavior: true }],
    test_artifacts: [{
      path: 'test/invoice.test.ts',
      requirement_ids: ['AC-001'],
      verification_status: 'passed',
      evidence_freshness: 'current'
    }]
  });
  assert.equal(unexecuted.rows[0].verification_status, 'unverified');
  assert.equal(unexecuted.rows[0].evidence_freshness, 'unknown');
  assert.notEqual(unexecuted.verdict, 'READY');

  const missingApproval = deriveTraceability({
    requirements: [{ id: 'AC-001', behavior_key: 'invoice-view', expected: 'allowed', uat_status: 'passed' }],
    implementation_artifacts: [{ path: 'src/invoice.ts', behavior_key: 'invoice-view', observable_behavior: true }],
    test_artifacts: [{ path: 'test/invoice.test.ts', requirement_ids: ['AC-001'], verification_status: 'passed', evidence_ids: ['EVID-001'] }],
    evidence_records: [currentEvidence({
      evidence_id: 'EVID-001',
      command: 'node --test test/invoice.test.ts',
      verified_head: 'head-1',
      ...pathManifest(['src/ready.ts'], 'invoice-v1'),
      output_digest: sha256('output-v1')
    })],
    current_state: currentState({ verified_head: 'head-1', ...pathManifest(['src/ready.ts'], 'invoice-v1') })
  });
  assert.notEqual(missingApproval.verdict, 'READY');

  const orphan = deriveTraceability({
    requirements: [],
    implementation_artifacts: [],
    test_artifacts: [{ path: 'test/unknown.test.ts', assertions: ['a product behavior'], observable_behavior: true }]
  });
  assert.ok(orphan.gaps.some((gap) => gap.type === 'orphan_behavior_assertion'));

  const warning = deriveTraceability({
    requirements: [{
      id: 'AC-001',
      behavior_key: 'invoice-view',
      expected: 'allowed',
      source_ref: '.sdcorejs/specs/product/contract-001.md#ac-001',
      source_hash: sha256('requirement-v1'),
      requirement_status: 'approved',
      uat_status: 'passed'
    }],
    implementation_artifacts: [{ path: 'src/invoice.ts', behavior_key: 'invoice-view', observable_behavior: true }],
    test_artifacts: [
      { path: 'test/invoice.test.ts', requirement_ids: ['AC-001'], verification_status: 'passed', evidence_ids: ['EVID-001'] },
      { path: 'test/unmapped-regression.test.ts', assertions: ['unmapped behavior'], observable_behavior: true }
    ],
    evidence_records: [currentEvidence({
      evidence_id: 'EVID-001',
      command: 'node --test test/invoice.test.ts',
      verified_head: 'head-1',
      ...pathManifest(['src/ready.ts'], 'invoice-v1'),
      output_digest: sha256('output-v1')
    })],
    current_state: currentState({ verified_head: 'head-1', ...pathManifest(['src/ready.ts'], 'invoice-v1') })
  });
  assert.equal(warning.verdict, 'READY_WITH_WARNINGS');
});

test('genuine unapproved observable behavior remains blocking', () => {
  for (const artifact of [
    { path: 'src/routes/export.ts', kind: 'route', observable_behavior: true },
    { path: 'src/permissions/delete.ts', kind: 'permission', observable_behavior: true },
    { path: 'src/workflows/approve.ts', kind: 'workflow', observable_behavior: true }
  ]) {
    const result = deriveTraceability({ requirements: [], implementation_artifacts: [artifact], test_artifacts: [] });
    const gap = result.gaps.find((item) => item.type === 'unapproved_scope');
    assert.equal(gap?.blocking, true);
    assert.equal(gap?.required_action, 'requirements-update');
  }

  const fakeSupport = deriveTraceability({
    requirements: [{ id: 'AC-001', behavior_key: 'existing', expected: 'allowed' }],
    implementation_artifacts: [{ path: 'src/routes/new.ts', kind: 'route', observable_behavior: true, supports: ['UNKNOWN'] }],
    test_artifacts: []
  });
  assert.ok(fakeSupport.gaps.some((gap) => gap.type === 'unapproved_scope' && gap.blocking));
});

test('an established target-product layout wins over fallback scaffolding', () => {
  const layout = resolveProductLayout({
    feature_id: 'feature-invoice',
    contract_id: 'CONTRACT-001',
    slug: 'invoice',
    existing_layout: {
      root: 'docs/product/invoice',
      prd_path: 'docs/product/invoice/requirements.md',
      uat_path: 'docs/product/invoice/business-tests.md'
    }
  });
  assert.equal(layout.doc_layout, 'existing');
  assert.equal(layout.product_docs.prd_path, 'docs/product/invoice/requirements.md');
  assert.ok(!Object.values(layout.product_docs).some((value) => String(value).includes('product/prds')));
});

test('secret and PII redaction is mandatory for persisted evidence', () => {
  const raw = {
    authorization: 'Bearer synthetic-token-value',
    cookie: 'session=synthetic-cookie-value',
    email: 'person@example.test',
    phone: '+84 900 000 111',
    customer_id: 'CUST-123456',
    client_secret: 'synthetic-client-secret',
    id_token: 'synthetic-id-token',
    full_name: 'Synthetic Person',
    address: '123 Synthetic Street',
    private_key: 'synthetic-private-key',
    session_token: 'synthetic-session-token',
    date_of_birth: '2000-01-02',
    national_id: 'NATIONAL-123',
    output: 'contact person@example.test using token synthetic-token-value',
    embedded_cookie: 'Cookie: sessionid=synthetic-cookie-header; Path=/',
    embedded_connection: 'postgresql://synthetic-user:synthetic-db-password@db.example.test/app',
    embedded_private_key: '-----BEGIN PRIVATE KEY-----\nsynthetic-private-material\n-----END PRIVATE KEY-----',
    punctuated_secret: 'password=p@ssw0rd!',
    quoted_secret: 'api_key="abc%2F123!"',
    basic_auth_header: 'Authorization: Basic YWxhZGRpbjpvcGVuc2VzYW1l'
  };
  const redacted = redactProductEvidence(raw);
  assert.equal(redacted.redaction_applied, true);
  const serialized = JSON.stringify(redacted.value);
  for (const secret of ['synthetic-token-value', 'synthetic-cookie-value', 'person@example.test', '+84 900 000 111', 'CUST-123456', 'synthetic-client-secret', 'synthetic-id-token', 'Synthetic Person', '123 Synthetic Street', 'synthetic-private-key', 'synthetic-session-token', '2000-01-02', 'NATIONAL-123', 'synthetic-cookie-header', 'synthetic-db-password', 'synthetic-private-material', 'p@ssw0rd!', 'abc%2F123!', 'YWxhZGRpbjpvcGVuc2VzYW1l']) {
    assert.ok(!serialized.includes(secret), `raw sensitive value leaked: ${secret}`);
  }

  assertHasError(validateProductContext({
    product_action: 'audit-readonly',
    side_effects_allowed: false,
    contract_id: 'CONTRACT-001',
    requirement_revision: 1,
    verdict: 'BLOCKED',
    actual_writes: [],
    evidence: [raw]
  }), /redact|secret|pii/i);
});

test('same slug with different contracts resolves to different ledger addresses', () => {
  const first = resolveProductLayout({ feature_id: 'feature-invoice', contract_id: 'CONTRACT-A', slug: 'invoice' });
  const second = resolveProductLayout({ feature_id: 'feature-invoice', contract_id: 'CONTRACT-B', slug: 'invoice' });
  assert.notEqual(first.current_path, second.current_path);
  assert.notEqual(first.product_docs.prd_path, second.product_docs.prd_path);

  assertHasError(validateProductContext({
    product_action: 'seed-from-approved-spec',
    side_effects_allowed: true,
    contract_id: 'CONTRACT-B',
    requirement_revision: 1,
    approved_spec_path: '.sdcorejs/specs/product/invoice.md',
    approved_spec_hash: 'spec-b',
    active_ledger_path: first.current_path,
    conflicting_contract_paths: [{ contract_id: 'CONTRACT-A', path: first.current_path }],
    actual_writes: []
  }), /collision|contract/i);
});

test('code and tests that contradict an approved requirement produce implementation drift', () => {
  const requirement = { id: 'AC-017', behavior_key: 'bulk-delete', expected: 'denied', text: 'Bulk deletion is denied.' };
  const result = deriveTraceability({
    requirements: [requirement],
    implementation_artifacts: [{ path: 'src/bulk-delete.ts', behavior_key: 'bulk-delete', observed: 'allowed', observable_behavior: true }],
    test_artifacts: [{ path: 'test/bulk-delete.e2e.ts', behavior_key: 'bulk-delete', observed: 'allowed', requirement_ids: ['AC-017'] }]
  });
  assert.equal(result.requirements[0].text, requirement.text);
  assert.ok(result.gaps.some((gap) => gap.type === 'implementation_drift' && gap.blocking));
  assert.notEqual(result.verdict, 'READY');

  const idMapped = deriveTraceability({
    requirements: [{ ...requirement, requirement_status: 'approved', uat_status: 'passed' }],
    implementation_artifacts: [{ path: 'src/bulk-delete-by-id.ts', requirement_ids: ['AC-017'], observed: 'allowed', observable_behavior: true }],
    test_artifacts: [{ path: 'test/bulk-delete-by-id.e2e.ts', requirement_ids: ['AC-017'], observed: 'allowed' }]
  });
  assert.ok(idMapped.gaps.some((gap) => gap.type === 'implementation_drift' && gap.blocking));
  assert.notEqual(idMapped.verdict, 'READY');
});

test('dirty product-path overlap fails before a write and requires a user choice', () => {
  const result = validateActionSideEffects({
    action: 'traceability-sync',
    allowed_paths: ['.sdcorejs/docs/product/contract-001/**'],
    planned_paths: ['.sdcorejs/docs/product/contract-001/current.md'],
    actual_paths: [],
    dirty_paths: ['.sdcorejs/docs/product/contract-001/current.md', 'src/unrelated.ts'],
    normative_before: normativeProjection(),
    normative_after: normativeProjection()
  });
  assertHasError(result.errors, /dirty.*overlap/i);
  assert.equal(result.requires_user_choice, true);
  assert.ok(!result.changed_paths.includes('src/unrelated.ts'));

  const actualOnly = validateActionSideEffects({
    action: 'traceability-sync',
    allowed_paths: ['.sdcorejs/docs/product/contract-001/**'],
    planned_paths: [],
    actual_paths: ['.sdcorejs/docs/product/contract-001/current.md'],
    dirty_paths: ['.sdcorejs/docs/product/contract-001/current.md'],
    normative_before: normativeProjection(),
    normative_after: normativeProjection()
  });
  assertHasError(actualOnly.errors, /dirty.*overlap/i);
  assert.equal(actualOnly.requires_user_choice, true);
});

test('legacy timestamped ledgers migrate by linking history without overwrite or delete', () => {
  const legacyPath = '.sdcorejs/docs/product/2026-01-02-03-04-invoice.md';
  const layout = resolveProductLayout({
    feature_id: 'feature-invoice',
    contract_id: 'CONTRACT-001',
    slug: 'invoice',
    legacy_ledgers: [{ path: legacyPath, contract_id: 'CONTRACT-001' }]
  });
  assert.notEqual(layout.current_path, legacyPath);
  assert.ok(layout.legacy_sources.some((source) => source.path === legacyPath));
  assert.ok(!layout.operations.some((operation) => ['delete', 'overwrite', 'rename'].includes(operation.type) && operation.path === legacyPath));

  const identityFreePath = '.sdcorejs/docs/product/2025-01-02-03-04-unknown.md';
  const ambiguous = resolveProductLayout({
    feature_id: 'feature-invoice',
    contract_id: 'CONTRACT-001',
    legacy_ledgers: [{ path: identityFreePath }]
  });
  assert.ok(!ambiguous.legacy_sources.some((source) => source.path === identityFreePath));
  assert.ok(ambiguous.legacy_ambiguities.some((source) => source.path === identityFreePath));

  const attributed = resolveProductLayout({
    feature_id: 'feature-invoice',
    contract_id: 'CONTRACT-001',
    legacy_ledgers: [{
      path: identityFreePath,
      attribution: { unique: true, contract_id: 'CONTRACT-001' }
    }]
  });
  assert.ok(attributed.legacy_sources.some((source) => source.path === identityFreePath));

  assertHasError(validateActionSideEffects({
    action: 'traceability-sync',
    allowed_paths: ['.sdcorejs/docs/product/**'],
    planned_paths: [legacyPath],
    actual_paths: [legacyPath],
    deleted_paths: [legacyPath],
    legacy_paths: [legacyPath],
    normative_before: normativeProjection(),
    normative_after: normativeProjection()
  }).errors, /legacy|delete|overwrite/i);

  assertHasError(validateActionSideEffects({
    action: 'traceability-sync',
    allowed_paths: ['.sdcorejs/docs/product/**'],
    planned_paths: [],
    actual_paths: [legacyPath],
    legacy_paths: [legacyPath],
    normative_before: normativeProjection(),
    normative_after: normativeProjection()
  }).errors, /legacy|overwrite/i);

  assertHasError(validateActionSideEffects({
    action: 'traceability-sync',
    allowed_paths: ['.sdcorejs/docs/product/**'],
    planned_paths: [legacyPath],
    actual_paths: [],
    legacy_paths: [legacyPath],
    normative_before: normativeProjection(),
    normative_after: normativeProjection()
  }).errors, /legacy|overwrite/i);
});

test('derived verdict and identity mutations reject every false-ready state', async (t) => {
  for (const row of [
    readyRow({ verification_status: 'failed' }),
    readyRow({ evidence_freshness: 'stale' }),
    readyRow({ uat_status: 'failed' })
  ]) {
    const derived = deriveFeatureVerdict([row]);
    assert.notEqual(derived.verdict, 'READY');
    assertHasError(validateProductContext({
      product_action: 'audit-readonly',
      side_effects_allowed: false,
      contract_id: 'CONTRACT-001',
      requirement_revision: 1,
      rows: [row],
      verdict: 'READY',
      actual_writes: [],
      evidence: []
    }), /verdict|READY/i);
  }

  assertHasError(validateProductContext({
    product_action: 'traceability-sync',
    side_effects_allowed: true,
    contract_id: 'CONTRACT-001',
    requirement_revision: 1,
    approved_spec_hash: 'spec-v1',
    requirements_changed: true,
    actual_writes: []
  }), /requirements_changed/i);

  assertHasError(validateProductContext({
    product_action: 'audit-readonly',
    side_effects_allowed: false,
    contract_id: 'CONTRACT-001',
    requirement_revision: 1,
    verdict: 'BLOCKED',
    actual_writes: ['.sdcorejs/docs/product/current.md'],
    evidence: []
  }), /audit-readonly|write/i);

  const previous = { contract_id: 'CONTRACT-001', feature_id: 'FEATURE-001', requirement_revision: 1, requirement_ids: ['AC-001'], retired_requirement_ids: ['AC-009'] };
  assertHasError(validateIdentityTransition(previous, {
    contract_id: 'CONTRACT-001',
    feature_id: 'FEATURE-001',
    requirement_revision: 2,
    requirement_ids: ['AC-001'],
    retired_requirement_ids: ['AC-009'],
    change_reason: 'revision without predecessor',
    approval: { approved: true }
  }, { action: 'requirements-update' }), /supersedes/i);
  assertHasError(validateIdentityTransition(previous, {
    contract_id: 'CONTRACT-001',
    feature_id: 'FEATURE-001',
    requirement_revision: 2,
    requirement_ids: ['AC-001', 'AC-009'],
    retired_requirement_ids: [],
    supersedes: 1,
    change_reason: 'illegal reuse',
    approval: { approved: true }
  }, { action: 'requirements-update' }), /reuse|retired/i);

  assertHasError(validateProductContext({
    product_action: 'audit-readonly',
    side_effects_allowed: false,
    contract_id: 'CONTRACT-001',
    requirement_revision: 1,
    verdict: 'READY',
    actual_writes: [],
    evidence: []
  }), /READY.*rows|rows.*READY/i);

  assertHasError(validateProductContext({
    product_action: 'audit-readonly',
    side_effects_allowed: false,
    contract_id: 'CONTRACT-001',
    requirement_revision: 1,
    rows: [{ verdict: 'READY', statuses: { requirement: 'approved', implementation: 'implemented', verification: 'failed', uat: 'passed', evidence_freshness: 'current' }, blockers: [], warnings: [], gaps: [] }],
    verdict: 'READY',
    actual_writes: [],
    evidence: []
  }), /verdict|READY/i);

  assertHasError(validateProductContext(completeProductContext({
    evidence_freshness: 'stale'
  }), currentState()), /stale.*READY|READY.*stale|freshness.*contradict/i);

  assert.notEqual(deriveFeatureVerdict([readyRow({ verification_status: 'unknown-state', uat_status: 'unknown-state' })]).verdict, 'READY');

  const mixedDeferred = deriveFeatureVerdict([
    readyRow({ uat_required: false, uat_status: 'not_applicable' }),
    readyRow({
      requirement_id: 'AC-002',
      requirement_status: 'deferred',
      required: true,
      implementation_status: 'unknown',
      verification_status: 'unverified',
      evidence_freshness: 'unknown',
      uat_required: false,
      uat_status: 'not_applicable',
      verdict: 'DEFERRED'
    })
  ]);
  assert.equal(mixedDeferred.verdict, 'READY');

  const staleEvidence = currentEvidence({
    ...pathManifest(['src/ready.ts'], 'ready-source-v1'),
    verified_head: 'head-1'
  });
  assertHasError(validateProductContext(completeProductContext({
    evidence: [staleEvidence],
    evidence_current: staleEvidence,
    evidence_freshness: 'stale'
  }), currentState({ ...pathManifest(['src/ready.ts'], 'ready-source-v2'), verified_head: 'head-2' })), /stale.*READY|READY.*stale/i);

  assertHasError(validateProductContext({
    product_action: 'audit-readonly',
    side_effects_allowed: false,
    contract_id: 'CONTRACT-001',
    requirement_revision: 1,
    approved_spec_hash: 'spec-v1',
    normative_before: normativeProjection(),
    normative_after: normativeProjection(),
    rows: [readyRow()],
    verdict: 'READY',
    actual_writes: [],
    evidence: [],
    evidence_current: staleEvidence
  }, {}), /freshness|current state|evidence/i);

  assertHasError(validateProductContext({
    product_action: 'audit-readonly',
    side_effects_allowed: false,
    contract_id: 'CONTRACT-001',
    requirement_revision: 1,
    approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
    approved_spec_hash: 'spec-v1',
    normative_before: normativeProjection(),
    normative_after: normativeProjection(),
    requirements_changed: false,
    rows: [readyRow()],
    verdict: 'READY',
    allowed_paths: [],
    planned_writes: [],
    actual_writes: [],
    deleted_paths: [],
    checkpoint_write: false,
    summary_refresh: false,
    evidence: []
  }), /READY.*evidence|evidence.*READY/i);

  assertHasError(validateProductContext({
    product_action: 'audit-readonly',
    side_effects_allowed: false,
    contract_id: 'CONTRACT-001',
    requirement_revision: 1,
    approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
    approved_spec_hash: 'spec-v1',
    normative_before: normativeProjection(),
    normative_after: normativeProjection(),
    requirements_changed: false,
    verdict: 'BLOCKED',
    allowed_paths: [],
    planned_writes: [],
    actual_writes: [],
    planned_paths: ['.sdcorejs/tasks/current-session.md'],
    actual_paths: ['.sdcorejs/tasks/current-session.md'],
    deleted_paths: [],
    checkpoint_write: false,
    summary_refresh: false,
    evidence: []
  }), /audit-readonly|zero-write/i);

  const trustedReady = await createTrustedReadyFixture(t);
  const readyContext = trustedReady.context;
  const warningAuthorization = await productProtocol.authorizeProductContext({
    repositoryRoot: trustedReady.repositoryRoot,
    context: {
    ...readyContext,
    verdict: 'READY_WITH_WARNINGS',
    gaps: [{ type: 'orphan_behavior_assertion', blocking: false }]
    },
    currentState: trustedReady.currentState,
    observeBuildIdentity: trustedReady.observeBuildIdentity,
    observeAutomatedEvidence: trustedReady.observeAutomatedEvidence,
    observeManualUat: trustedReady.observeManualUat,
    observeAuditStatus: trustedReady.observeAuditStatus,
    executeAudit: trustedReady.executeAudit
  });
  assert.equal(warningAuthorization.authorized, true, warningAuthorization.errors.join('; '));
  assertHasError(validateProductContext({
    ...readyContext,
    verdict: 'READY',
    gaps: [{ type: 'unapproved_scope', blocking: true }]
  }, trustedReady.currentState, trustedReady.options), /BLOCKED|gap|verdict/i);
  assertHasError(validateProductContext({
    ...readyContext,
    verdict: 'READY_WITH_WARNINGS',
    rows: [],
    evidence_current: null,
    gaps: [{ type: 'orphan_behavior_assertion', blocking: false }]
  }, trustedReady.currentState, trustedReady.options), /rows|evidence/i);
});

test('READY requires accepted row evidence and a bound manual UAT execution', async (t) => {
  const trustedReady = await createTrustedReadyFixture(t);
  const valid = trustedReady.context;
  assert.equal(trustedReady.authorization.authorized, true, trustedReady.authorization.errors.join('; '));

  const twoRequirementProjection = normativeProjection({
    requirements: [
      { ...approvedRequirement, id: 'AC-001' },
      { ...approvedRequirement, id: 'AC-002' }
    ]
  });
  assertHasError(validateProductContext(completeProductContext({
    requirement_ids: ['AC-001', 'AC-002'],
    normative_before: twoRequirementProjection,
    normative_after: twoRequirementProjection,
    rows: [readyRow()]
  }), currentState()), /row.*coverage|rows.*requirement|requirement.*rows|AC-002/i);

  const unbound = completeProductContext({
    evidence: [],
    uat_records: []
  });
  assertHasError(validateProductContext(unbound, currentState()), /evidence.*row|row.*evidence/i);
  assertHasError(validateProductContext(unbound, currentState()), /UAT.*record|record.*UAT/i);

  const staleEvidence = currentEvidence({
    evidence_id: 'EVID-STALE-001',
    ...pathManifest(['src/ready.ts'], 'ready-source-stale')
  });
  const staleBoundRow = completeProductContext({
    evidence: [currentEvidence(), staleEvidence],
    rows: [readyRow({ verification_evidence_ids: ['EVID-STALE-001'] })]
  });
  assertHasError(validateProductContext(staleBoundRow, currentState()), /row-bound.*current|current.*row-bound|stale.*row/i);

  const laterFailedUat = currentUatRecord({
    uat_record_id: 'UAT-001-EXEC-002',
    status: 'failed',
    actual_result: 'The approved invoice was not visible.',
    executed_at: '2026-07-13T16:00:00.000Z',
    recorded_at: '2026-07-13T16:01:00.000Z'
  });
  const staleUatRow = completeProductContext({
    uat_records: [currentUatRecord(), laterFailedUat]
  });
  assertHasError(validateProductContext(staleUatRow, currentState()), /latest.*UAT|UAT.*latest|failed.*UAT/i);

  const lexicallyLaterButChronologicallyOlderPass = currentUatRecord({
    executed_at: '2026-07-13T23:30:00.000+02:00',
    recorded_at: '2026-07-13T23:31:00.000+02:00'
  });
  const chronologicallyLaterFailure = currentUatRecord({
    uat_record_id: 'UAT-001-EXEC-002',
    status: 'failed',
    actual_result: 'The approved invoice was not visible.',
    executed_at: '2026-07-13T22:00:00.000Z',
    recorded_at: '2026-07-13T22:01:00.000Z'
  });
  assertHasError(validateProductContext(completeProductContext({
    uat_records: [lexicallyLaterButChronologicallyOlderPass, chronologicallyLaterFailure]
  }), currentState()), /latest.*UAT|UAT.*latest|chronolog|failed.*UAT/i);

  const malformedTimeUat = currentUatRecord({
    executed_at: 'not-an-instant'
  });
  assertHasError(validateProductContext(completeProductContext({
    uat_records: [malformedTimeUat]
  }), currentState()), /UAT.*executed_at|ISO-8601|timestamp|instant/i);

  const obsoleteScenarioUat = currentUatRecord({
    scenario_source_hash: sha256('obsolete-scenario'),
    environment: {
      ...currentUatRecord().environment,
      build_or_revision: 'obsolete-build'
    }
  });
  assertHasError(validateProductContext(completeProductContext({
    uat_records: [obsoleteScenarioUat]
  }), currentState()), /UAT.*stale|scenario.*hash|build.*revision|current.*UAT/i);

  const traced = deriveTraceability({
    requirements: [{
      id: 'AC-001',
      behavior_key: 'invoice-view',
      expected: 'allowed',
      requirement_status: 'approved',
      uat_required: true,
      uat_status: 'passed'
    }],
    implementation_artifacts: [{
      path: 'src/ready.ts',
      behavior_key: 'invoice-view',
      observed: 'allowed',
      observable_behavior: true,
      requirement_ids: ['AC-001']
    }],
    test_artifacts: [{
      path: 'test/ready.test.mjs',
      behavior_key: 'invoice-view',
      requirement_ids: ['AC-001'],
      verification_status: 'passed',
      evidence_ids: ['EVID-READY-001']
    }],
    evidence_records: [currentEvidence()],
    uat_records: [],
    current_state: currentState()
  });
  assert.equal(traced.rows[0].uat_status, 'not_run');
  assert.deepEqual(traced.rows[0].uat_record_ids, []);
  assert.notEqual(traced.verdict, 'READY');
});

test('optional failed verification cannot collapse to READY', () => {
  const result = deriveRequirementReadiness(readyRow({
    required: false,
    verification_status: 'failed',
    uat_required: false,
    uat_status: 'not_applicable',
    uat_record_ids: []
  }));
  assert.equal(result.verdict, 'READY_WITH_WARNINGS');
  assertHasError(result.warnings, /optional.*verification|verification.*failed/i);
});

test('write-capable actions enforce owned path classes, authorization, and legacy ancestry', () => {
  const snapshots = {
    requirements_changed: false,
    normative_before: normativeProjection(),
    normative_after: normativeProjection()
  };
  assertHasError(validateActionSideEffects({
    action: 'traceability-sync',
    side_effects_allowed: true,
    write_authorized: true,
    allowed_paths: ['src/**'],
    actual_paths: ['src/app.ts'],
    ...snapshots
  }).errors, /owned|product.*path|application.*source|scope/i);

  assertHasError(validateActionSideEffects({
    action: 'traceability-sync',
    side_effects_allowed: true,
    write_authorized: true,
    layout: {
      ledger_root: 'src',
      current_path: 'src/current.md',
      history_root: 'src/history',
      uat_root: 'src/uat'
    },
    allowed_paths: ['src/**'],
    actual_paths: ['src/app.ts'],
    ...snapshots
  }).errors, /owned|ledger|product.*path|application.*source|scope/i);

  assertHasError(validateActionSideEffects({
    action: 'seed-from-approved-spec',
    side_effects_allowed: true,
    write_authorized: true,
    requirements_changed: true,
    layout: {
      ...productLedgerLayout(),
      product_docs: {
        root: 'src',
        prd_path: 'src/requirements.md'
      }
    },
    allowed_paths: ['src/requirements.md'],
    actual_paths: ['src/requirements.md'],
    normative_before: normativeProjection(),
    normative_after: normativeProjection()
  }).errors, /owned|product.*doc|application.*source|scope/i);

  assertHasError(validateActionSideEffects({
    action: 'traceability-sync',
    side_effects_allowed: true,
    write_authorized: true,
    layout: productLedgerLayout(),
    allowed_paths: ['.sdcorejs/docs/product/other-contract/**'],
    actual_paths: ['.sdcorejs/docs/product/other-contract/current.md'],
    ...snapshots
  }).errors, /owned|contract|scope/i);

  assertHasError(validateActionSideEffects({
    action: 'traceability-sync',
    side_effects_allowed: true,
    write_authorized: false,
    allowed_paths: ['.sdcorejs/docs/product/contract-001/**'],
    actual_paths: ['.sdcorejs/docs/product/contract-001/current.md'],
    ...snapshots
  }).errors, /write_authorized|authorized/i);

  assertHasError(validateActionSideEffects({
    action: 'traceability-sync',
    side_effects_allowed: true,
    write_authorized: true,
    allowed_paths: ['.sdcorejs/docs/product/**'],
    deleted_paths: ['.sdcorejs/docs/product'],
    legacy_paths: ['.sdcorejs/docs/product/legacy/old.md'],
    ...snapshots
  }).errors, /legacy|delete|overwrite/i);

  assertHasError(validateActionSideEffects({
    action: 'requirements-update',
    side_effects_allowed: true,
    write_authorized: true,
    requirements_changed: true,
    layout: {
      ...productLedgerLayout(),
      product_docs: {
        root: '.',
        prd_path: 'package.json'
      }
    },
    allowed_paths: ['package.json'],
    prohibited_paths: ['package.json'],
    planned_paths: ['package.json'],
    actual_paths: ['package.json'],
    normative_before: normativeProjection(),
    normative_after: normativeProjection()
  }).errors, /prohibited|manifest|package\.json|owned|product.*doc/i);

  assertHasError(validateActionSideEffects({
    action: 'requirements-update',
    side_effects_allowed: true,
    write_authorized: true,
    requirements_changed: true,
    layout: {
      ...productLedgerLayout(),
      product_docs: { root: 'docs', prd_path: 'docs/unrelated.md' }
    },
    allowed_paths: ['docs/unrelated.md'],
    actual_paths: ['docs/unrelated.md'],
    normative_before: normativeProjection(),
    normative_after: normativeProjection()
  }).errors, /owned|product.*document|scope/i);

  assertHasError(validateActionSideEffects({
    action: 'requirements-update',
    side_effects_allowed: true,
    write_authorized: true,
    requirements_changed: true,
    layout: {
      ...productLedgerLayout(),
      product_docs: {
        root: 'C:../outside/product',
        prd_path: 'C:../outside/product/prd.md'
      }
    },
    allowed_paths: ['C:../outside/product/prd.md'],
    actual_paths: ['C:../outside/product/prd.md'],
    normative_before: normativeProjection(),
    normative_after: normativeProjection()
  }).errors, /drive-relative|repository-relative|owned|outside.*scope|invalid.*path/i);

  assertHasError(validateActionSideEffects({
    action: 'traceability-sync',
    side_effects_allowed: true,
    write_authorized: true,
    layout: productLedgerLayout(),
    allowed_paths: ['.sdcorejs/docs/product/contract-001/**'],
    prohibited_paths: ['.sdcorejs/docs/product/contract-001/private/**'],
    actual_paths: ['.sdcorejs/docs/product/contract-001/private/secret.md'],
    ...snapshots
  }).errors, /explicitly prohibited|prohibited product write/i);
});

test('READY and persisted writes reject raw or forged approved-spec authority', () => {
  assertHasError(validateProductContext(null), /product_context|object|context/i);
  assertHasError(
    validateProductContext(completeProductContext(), currentState(), null),
    /trusted.*approved[- ]spec|approved[- ]spec.*trusted|file-backed authority/i
  );
  assertHasError(
    validateProductContext(completeProductContext(), currentState()),
    /trusted.*approved[- ]spec|approved[- ]spec.*trusted|file-backed authority/i
  );
  assertHasError(
    validateProductContext(completeProductContext(), currentState(), {
      trusted_authority: {
        verified: true,
        contract_id: 'CONTRACT-001',
        requirement_revision: 1,
        requirement_ids: ['AC-001'],
        approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
        approved_spec_hash: 'spec-v1'
      }
    }),
    /trusted.*approved[- ]spec|approved[- ]spec.*trusted|file-backed authority/i
  );
  assertHasError(
    validateProductContext(completeProductContext(), currentState(), {
      trusted_authority: { verified: true },
      trusted_current_state: {
        verified: true,
        repository_root: 'C:/repo',
        relevant_paths: ['src/ready.ts'],
        relevant_path_hashes: { 'src/ready.ts': readyManifest.relevant_path_hashes['src/ready.ts'] },
        relevant_paths_hash: readyManifest.relevant_paths_hash
      }
    }),
    /trusted.*relevant-path|file-backed relevant-path/i
  );
});

test('trusted approved-spec authority is issued only from a matching immutable snapshot', async (t) => {
  assert.equal(typeof productProtocol.verifyApprovedSpecAuthority, 'function');
  const trustedReady = await createTrustedReadyFixture(t);
  const { context } = trustedReady;
  assert.equal(trustedReady.authorization.authorized, true, trustedReady.authorization.errors.join('; '));
  assert.equal(trustedReady.options.trusted_authority.feature_id, context.feature_id);

  const rebound = {
    ...context,
    contract_id: 'CONTRACT-OTHER'
  };
  assertHasError(
    validateProductContext(rebound, trustedReady.currentState, trustedReady.options),
    /trusted.*contract|authority.*binding|contract.*authority/i
  );

  assertHasError(
    validateProductContext({ ...context, feature_id: 'FEATURE-OTHER' }, trustedReady.currentState, trustedReady.options),
    /trusted.*feature|feature.*authority|feature.*binding/i
  );
});

test('approved-spec authority uses the shared canonical snapshot hash contract', async (t) => {
  const repositoryRoot = await mkdtemp(path.join(tmpdir(), 'sdcorejs-product-authority-canonical-'));
  t.after(() => rm(repositoryRoot, { recursive: true, force: true }));
  const bodyTemplate = [
    '# Approved contract',
    '',
    '```yaml',
    'spec_context:',
    '  approved_spec_hash: <pending>',
    '```',
    '',
    '1. AC-001 - Approved behavior is required.',
    ''
  ].join('\r\n');
  const canonicalBody = bodyTemplate
    .replace(/\r\n?/g, '\n')
    .replace(/^[ \t]*approved_spec_hash[ \t]*:.*(?:\n|$)/gm, '');
  const approvedSpecHash = sha256(canonicalBody);
  const body = bodyTemplate.replace('<pending>', approvedSpecHash);
  const rawFixture = approvedSpecFixture({ body });
  const integrityTemplate = rawFixture.content
    .replace(rawFixture.approvedSpecHash, approvedSpecHash)
    .replace(/^approved_spec_integrity_hash:.*$/m, 'approved_spec_integrity_hash: <pending-integrity>');
  const approvedSpecIntegrityHash = hashApprovedSnapshotIntegrity(integrityTemplate, 'approved_spec_integrity_hash');
  const fixture = {
    ...rawFixture,
    approvedSpecHash,
    approvedSpecIntegrityHash,
    content: integrityTemplate.replace('<pending-integrity>', approvedSpecIntegrityHash)
  };
  await writeApprovedSpecFixture(repositoryRoot, fixture);
  const context = authorityBoundContext(repositoryRoot, fixture);

  const authority = await productProtocol.verifyApprovedSpecAuthority({ repositoryRoot, context });
  assert.equal(authority.verified, true, authority.errors.join('; '));
  assert.equal(authority.approved_spec_hash, approvedSpecHash);
});

test('approved-spec authority rejects nonexistent, mutated, and incomplete snapshots', async (t) => {
  assert.equal(typeof productProtocol.verifyApprovedSpecAuthority, 'function');
  const repositoryRoot = await mkdtemp(path.join(tmpdir(), 'sdcorejs-product-authority-invalid-'));
  t.after(() => rm(repositoryRoot, { recursive: true, force: true }));

  const missingFixture = approvedSpecFixture({ specPath: '.sdcorejs/specs/product/missing.md' });
  const missing = await productProtocol.verifyApprovedSpecAuthority({
    repositoryRoot,
    context: authorityBoundContext(repositoryRoot, missingFixture)
  });
  assert.equal(missing.verified, false);
  assert.match(missing.errors.join('\n'), /missing|not found|ENOENT/i);

  const mutatedFixture = approvedSpecFixture({ specPath: '.sdcorejs/specs/product/mutated.md' });
  const mutatedPath = await writeApprovedSpecFixture(repositoryRoot, mutatedFixture);
  await writeFile(mutatedPath, `${mutatedFixture.content}\nUnapproved mutation.\n`, 'utf8');
  const mutated = await productProtocol.verifyApprovedSpecAuthority({
    repositoryRoot,
    context: authorityBoundContext(repositoryRoot, mutatedFixture)
  });
  assert.equal(mutated.verified, false);
  assert.match(mutated.errors.join('\n'), /hash|digest/i);

  const mismatchedIdsFixture = approvedSpecFixture({ specPath: '.sdcorejs/specs/product/mismatched-ids.md' });
  mismatchedIdsFixture.content = mismatchedIdsFixture.content.replace('  - AC-001\n', '  - AC-002\n');
  await writeApprovedSpecFixture(repositoryRoot, mismatchedIdsFixture);
  const mismatchedIds = await productProtocol.verifyApprovedSpecAuthority({
    repositoryRoot,
    context: authorityBoundContext(repositoryRoot, mismatchedIdsFixture)
  });
  assert.equal(mismatchedIds.verified, false);
  assert.match(mismatchedIds.errors.join('\n'), /requirement_ids|requirement ID/i);

  const mismatchedFeatureFixture = approvedSpecFixture({ specPath: '.sdcorejs/specs/product/mismatched-feature.md' });
  mismatchedFeatureFixture.content = mismatchedFeatureFixture.content.replace('feature_id: FEATURE-001', 'feature_id: FEATURE-OTHER');
  await writeApprovedSpecFixture(repositoryRoot, mismatchedFeatureFixture);
  const mismatchedFeature = await productProtocol.verifyApprovedSpecAuthority({
    repositoryRoot,
    context: authorityBoundContext(repositoryRoot, mismatchedFeatureFixture)
  });
  assert.equal(mismatchedFeature.verified, false);
  assert.match(mismatchedFeature.errors.join('\n'), /feature_id|feature identity/i);

  const incompleteFixture = approvedSpecFixture({ specPath: '.sdcorejs/specs/product/incomplete.md' });
  incompleteFixture.content = incompleteFixture.content.replace('approvedBy: product-owner\n', '');
  await writeApprovedSpecFixture(repositoryRoot, incompleteFixture);
  const incomplete = await productProtocol.verifyApprovedSpecAuthority({
    repositoryRoot,
    context: authorityBoundContext(repositoryRoot, incompleteFixture)
  });
  assert.equal(incomplete.verified, false);
  assert.match(incomplete.errors.join('\n'), /approvedBy|approval metadata|approver/i);

  const changedApprovalFixture = approvedSpecFixture({ specPath: '.sdcorejs/specs/product/changed-approval.md' });
  changedApprovalFixture.content = changedApprovalFixture.content.replace('approvedBy: product-owner', 'approvedBy: other-owner');
  await writeApprovedSpecFixture(repositoryRoot, changedApprovalFixture);
  const changedApproval = await productProtocol.verifyApprovedSpecAuthority({
    repositoryRoot,
    context: authorityBoundContext(repositoryRoot, changedApprovalFixture)
  });
  assert.equal(changedApproval.verified, false);
  assert.match(changedApproval.errors.join('\n'), /integrity|authority hash/i);

  for (const approvalSource of ['equivalent-complete-input', 'imported-approved-spec']) {
    const inferredFixture = approvedSpecFixture({
      specPath: `.sdcorejs/specs/product/${approvalSource}.md`,
      approvalSource
    });
    await writeApprovedSpecFixture(repositoryRoot, inferredFixture);
    const inferredContext = authorityBoundContext(repositoryRoot, inferredFixture);
    inferredContext.approval = { ...inferredContext.approval, approval_source: approvalSource };
    const inferred = await productProtocol.verifyApprovedSpecAuthority({
      repositoryRoot,
      context: inferredContext
    });
    assert.equal(inferred.verified, false, `${approvalSource} must require explicit reapproval`);
    assert.match(inferred.errors.join('\n'), /approval_source|explicit.*approval|independent approval/i);
  }

  const legacyFixture = approvedSpecFixture({ specPath: '.sdcorejs/specs/product/legacy-without-integrity.md' });
  legacyFixture.content = legacyFixture.content.replace(/^approved_spec_integrity_hash:.*\n/m, '');
  await writeApprovedSpecFixture(repositoryRoot, legacyFixture);
  const legacy = await productProtocol.verifyApprovedSpecAuthority({
    repositoryRoot,
    context: authorityBoundContext(repositoryRoot, legacyFixture)
  });
  assert.equal(legacy.verified, false);
  assert.match(legacy.errors.join('\n'), /approved_spec_integrity_hash|integrity/i);
});

test('approved-spec authority and relevant-path observation reject linked ancestors inside the repository', async (t) => {
  const repositoryRoot = await mkdtemp(path.join(tmpdir(), 'sdcorejs-product-linked-ancestor-'));
  t.after(() => rm(repositoryRoot, { recursive: true, force: true }));

  const fixture = approvedSpecFixture();
  const realSpecDirectory = path.join(repositoryRoot, '.approved-spec-target');
  await mkdir(realSpecDirectory, { recursive: true });
  await writeFile(path.join(realSpecDirectory, 'contract-001.md'), fixture.content, 'utf8');
  const specParent = path.join(repositoryRoot, '.sdcorejs', 'specs');
  await mkdir(specParent, { recursive: true });
  try {
    await symlink(realSpecDirectory, path.join(specParent, 'product'), process.platform === 'win32' ? 'junction' : 'dir');
  } catch (error) {
    if (['EPERM', 'EACCES', 'ENOTSUP'].includes(error?.code)) {
      t.skip(`directory links are unavailable: ${error.code}`);
      return;
    }
    throw error;
  }

  const authority = await productProtocol.verifyApprovedSpecAuthority({
    repositoryRoot,
    context: authorityBoundContext(repositoryRoot, fixture)
  });
  assert.equal(authority.verified, false);
  assert.match(authority.errors.join('\n'), /symbolic link|junction|linked ancestor|symlink/i);

  const realSourceDirectory = path.join(repositoryRoot, '.source-target');
  await mkdir(realSourceDirectory, { recursive: true });
  await writeFile(path.join(realSourceDirectory, 'ready.ts'), 'export const ready = true;\n', 'utf8');
  await symlink(realSourceDirectory, path.join(repositoryRoot, 'src'), process.platform === 'win32' ? 'junction' : 'dir');
  const observation = await productProtocol.observeRelevantPathState({
    repositoryRoot,
    relevantPaths: ['src/ready.ts']
  });
  assert.equal(observation.verified, false);
  assert.match(observation.errors.join('\n'), /symbolic link|junction|linked ancestor|symlink/i);
});

test('final product authorization re-reads approved authority and relevant paths after earlier tokens', async (t) => {
  assert.equal(typeof productProtocol.authorizeProductContext, 'function');

  const specMutation = await createTrustedReadyFixture(t);
  assertHasError(
    validateProductContext(specMutation.context, specMutation.currentState, specMutation.options),
    /one-shot async final|final file-backed authorization/i
  );
  const approvedSpecPath = path.join(specMutation.repositoryRoot, ...specMutation.fixture.specPath.split('/'));
  await writeFile(approvedSpecPath, `${specMutation.fixture.content}\nMutated after the earlier token.\n`, 'utf8');
  const staleAuthority = await productProtocol.authorizeProductContext({
    repositoryRoot: specMutation.repositoryRoot,
    context: specMutation.context,
    currentState: specMutation.currentState,
    observeBuildIdentity: specMutation.observeBuildIdentity,
    observeAutomatedEvidence: specMutation.observeAutomatedEvidence,
    observeManualUat: specMutation.observeManualUat
  });
  assert.equal(staleAuthority.authorized, false);
  assert.match(staleAuthority.errors.join('\n'), /approved spec.*hash|authority|integrity/i);

  const pathMutation = await createTrustedReadyFixture(t);
  await writeFile(pathMutation.readyPath, 'export const ready = false;\n', 'utf8');
  const staleCurrentState = await productProtocol.authorizeProductContext({
    repositoryRoot: pathMutation.repositoryRoot,
    context: pathMutation.context,
    currentState: pathMutation.currentState,
    observeBuildIdentity: pathMutation.observeBuildIdentity,
    observeAutomatedEvidence: pathMutation.observeAutomatedEvidence,
    observeManualUat: pathMutation.observeManualUat
  });
  assert.equal(staleCurrentState.authorized, false);
  assert.match(staleCurrentState.errors.join('\n'), /relevant-path|current state|hash|freshness/i);
});

test('final product authorization rejects a missing approved plan', async (t) => {
  const missingPlan = await createTrustedReadyFixture(t);
  await rm(missingPlan.approvedPlanPath);
  const missingAuthorization = await productProtocol.authorizeProductContext({
    repositoryRoot: missingPlan.repositoryRoot,
    context: missingPlan.context,
    currentState: missingPlan.currentState,
    observeBuildIdentity: missingPlan.observeBuildIdentity,
    observeAutomatedEvidence: missingPlan.observeAutomatedEvidence,
    observeManualUat: missingPlan.observeManualUat
  });
  assert.equal(missingAuthorization.authorized, false);
  assert.match(missingAuthorization.errors.join('\n'), /approved[- ]plan.*missing|approved[- ]plan.*not found|could not read.*plan/i);
});

test('final product authorization re-reads the approved plan after execution-observer waits', async (t) => {
  const mutationDuringObserver = await createTrustedReadyFixture(t);
  const observeAutomatedEvidence = async (request) => {
    await writeFile(
      mutationDuringObserver.approvedPlanPath,
      `${mutationDuringObserver.fixture.planContent}\nMutated while the execution observer was pending.\n`,
      'utf8'
    );
    return mutationDuringObserver.observeAutomatedEvidence(request);
  };
  const mutatedAuthorization = await productProtocol.authorizeProductContext({
    repositoryRoot: mutationDuringObserver.repositoryRoot,
    context: mutationDuringObserver.context,
    currentState: mutationDuringObserver.currentState,
    observeBuildIdentity: mutationDuringObserver.observeBuildIdentity,
    observeAutomatedEvidence,
    observeManualUat: mutationDuringObserver.observeManualUat
  });
  assert.equal(mutatedAuthorization.authorized, false);
  assert.match(mutatedAuthorization.errors.join('\n'), /approved plan.*hash|approved plan.*integrity|plan.*mutat/i);
});

test('final product authorization rejects a self-consistent plan with the wrong approved-spec chain', async (t) => {
  const trusted = await createTrustedReadyFixture(t);
  const wrongSpecIntegrityHash = 'f'.repeat(64);
  let wrongPlanText = trusted.fixture.planContent.replaceAll(
    trusted.fixture.approvedSpecIntegrityHash,
    wrongSpecIntegrityHash
  );
  const approvedPlanHash = hashApprovedSnapshot(wrongPlanText, 'approved_plan_hash');
  wrongPlanText = wrongPlanText.replaceAll(trusted.fixture.approvedPlanHash, approvedPlanHash);
  const approvedPlanIntegrityHash = hashApprovedSnapshotIntegrity(wrongPlanText, 'approved_plan_integrity_hash');
  wrongPlanText = wrongPlanText.replace(
    trusted.fixture.approvedPlanIntegrityHash,
    approvedPlanIntegrityHash
  );
  await writeFile(trusted.approvedPlanPath, wrongPlanText, 'utf8');

  const planIdentity = {
    approved_plan_path: trusted.fixture.planPath,
    approved_plan_hash: approvedPlanHash,
    approved_plan_integrity_hash: approvedPlanIntegrityHash
  };
  const evidence = trusted.context.evidence.map((record) => ({ ...record, ...planIdentity }));
  const context = {
    ...trusted.context,
    ...planIdentity,
    evidence,
    evidence_current: evidence[0]
  };
  const currentState = { ...trusted.currentState, ...planIdentity };
  const authorization = await productProtocol.authorizeProductContext({
    repositoryRoot: trusted.repositoryRoot,
    context,
    currentState,
    observeBuildIdentity: trusted.observeBuildIdentity,
    observeAutomatedEvidence: trusted.observeAutomatedEvidence,
    observeManualUat: trusted.observeManualUat
  });
  assert.equal(authorization.authorized, false);
  assert.match(authorization.errors.join('\n'), /approved plan.*spec|spec.*chain|spec.*integrity/i);
});

test('final product authorization rejects planned, actual, and deleted paths outside approved plan scope', async (t) => {
  const contractScope = '.sdcorejs/docs/product/contract-001/**';
  const planScope = '.sdcorejs/docs/product/contract-001/history/**';
  const outsidePlanPath = '.sdcorejs/docs/product/contract-001/current.md';
  for (const field of ['plannedWrites', 'actualWrites', 'deletedPaths']) {
    const scoped = await createScopedWriteFixture(t, {
      planAllowedPaths: [planScope],
      contextAllowedPaths: [contractScope],
      [field]: [outsidePlanPath]
    });
    const authorization = await scoped.authorize();
    assert.equal(authorization.authorized, false, `${field} must remain inside approved plan scope`);
    assert.match(
      authorization.errors.join('\n'),
      /approved plan.*allowed_paths|outside approved plan|plan scope/i,
      `${field} denial must identify the approved plan boundary`
    );
  }
});

test('final product authorization applies file-observed approved plan prohibitions', async (t) => {
  const prohibitedPath = '.sdcorejs/docs/product/contract-001/private/secret.md';
  const scoped = await createScopedWriteFixture(t, {
    planAllowedPaths: ['.sdcorejs/docs/product/contract-001/**'],
    planProhibitedPaths: ['.git/**', '.sdcorejs/docs/product/contract-001/private/**'],
    productActionAllowedPaths: ['.sdcorejs/docs/product/contract-001/current.md'],
    contextAllowedPaths: ['.sdcorejs/docs/product/contract-001/**'],
    actualWrites: [prohibitedPath]
  });
  const authorization = await scoped.authorize();
  assert.equal(authorization.authorized, false);
  assert.match(authorization.errors.join('\n'), /approved plan.*prohibited_paths|prohibited.*plan|plan.*prohibit/i);
});

test('final product authorization rejects a context allowlist broader than approved plan scope', async (t) => {
  const historyPath = '.sdcorejs/docs/product/contract-001/history/2026-07-14.md';
  const scoped = await createScopedWriteFixture(t, {
    planAllowedPaths: ['.sdcorejs/docs/product/contract-001/history/**'],
    contextAllowedPaths: ['.sdcorejs/docs/product/contract-001/**'],
    plannedWrites: [historyPath],
    actualWrites: [historyPath]
  });
  const authorization = await scoped.authorize();
  assert.equal(authorization.authorized, false);
  assert.match(authorization.errors.join('\n'), /context.*allowed_paths|allowlist.*broader|widens.*approved plan/i);

  const bareRoot = await createScopedWriteFixture(t, {
    planAllowedPaths: ['.sdcorejs/docs/product/contract-001/**'],
    contextAllowedPaths: ['.sdcorejs/docs/product/contract-001']
  });
  const bareRootAuthorization = await bareRoot.authorize();
  assert.equal(bareRootAuthorization.authorized, false);
  assert.match(bareRootAuthorization.errors.join('\n'), /context.*allowed_paths|widens.*approved plan/i);
});

test('final product authorization accepts a context scope narrower than the approved product plan', async (t) => {
  const currentPath = '.sdcorejs/docs/product/contract-001/current.md';
  const scoped = await createScopedWriteFixture(t, {
    planAllowedPaths: ['product/**', '.sdcorejs/docs/product/**'],
    contextAllowedPaths: ['.sdcorejs/docs/product/contract-001/**'],
    plannedWrites: [currentPath],
    actualWrites: [currentPath]
  });
  const authorization = await scoped.authorize();
  assert.equal(authorization.authorized, true, authorization.errors.join('; '));
  assert.equal(authorization.plan_authority.write_scope.verified, true);
  assert.deepEqual(
    new Set(authorization.plan_authority.approved_plan_allowed_paths),
    new Set(['product/**', '.sdcorejs/docs/product/**'])
  );
});

test('final product authorization requires a parent-observed UAT build identity', async (t) => {
  const trusted = await createTrustedReadyFixture(t);
  const authorization = await productProtocol.authorizeProductContext({
    repositoryRoot: trusted.repositoryRoot,
    context: trusted.context,
    currentState: trusted.currentState
  });
  assert.equal(authorization.authorized, false);
  assert.match(authorization.errors.join('\n'), /build.*observer|observed.*build|UAT.*build/i);
});

test('final product authorization rejects a UAT scenario source changed after current-state capture', async (t) => {
  const trusted = await createTrustedReadyFixture(t);
  await writeFile(trusted.uatScenarioPath, '# UAT-001\n\nChanged after current-state capture.\n', 'utf8');
  const authorization = await productProtocol.authorizeProductContext({
    repositoryRoot: trusted.repositoryRoot,
    context: trusted.context,
    currentState: trusted.currentState,
    observeBuildIdentity: trusted.observeBuildIdentity,
    observeAutomatedEvidence: trusted.observeAutomatedEvidence,
    observeManualUat: trusted.observeManualUat
  });
  assert.equal(authorization.authorized, false);
  assert.match(authorization.errors.join('\n'), /UAT.*scenario|scenario.*hash|current state/i);
});

test('raw matching UAT scenario and build claims cannot forge trusted current state', async (t) => {
  const trusted = await createTrustedReadyFixture(t);
  const forgedScenarioHash = sha256('caller-authored scenario hash');
  const forgedBuild = 'caller-authored-build';
  const forgedContext = clone(trusted.context);
  forgedContext.uat_records = forgedContext.uat_records.map((record) => ({
    ...record,
    scenario_source_hash: forgedScenarioHash,
    environment: { ...record.environment, build_or_revision: forgedBuild }
  }));
  const forgedCurrentState = {
    ...trusted.currentState,
    uat_scenario_hashes: { [trusted.uatScenarioRef]: forgedScenarioHash },
    uat_build_or_revision: forgedBuild
  };
  const authorization = await productProtocol.authorizeProductContext({
    repositoryRoot: trusted.repositoryRoot,
    context: forgedContext,
    currentState: forgedCurrentState,
    observeBuildIdentity: trusted.observeBuildIdentity,
    observeAutomatedEvidence: trusted.observeAutomatedEvidence,
    observeManualUat: trusted.observeManualUat
  });
  assert.equal(authorization.authorized, false);
  assert.match(authorization.errors.join('\n'), /UAT.*scenario|scenario.*hash|build.*identity|observed.*build/i);
});

test('unrelated-file evidence manifests cannot support row implementation, test, and spec refs', async (t) => {
  const trusted = await createTrustedReadyFixture(t);
  const unrelatedPath = path.join(trusted.repositoryRoot, 'docs', 'unrelated.md');
  await mkdir(path.dirname(unrelatedPath), { recursive: true });
  await writeFile(unrelatedPath, '# Unrelated\n', 'utf8');
  const unrelatedObservation = await productProtocol.observeRelevantPathState({
    repositoryRoot: trusted.repositoryRoot,
    relevantPaths: ['docs/unrelated.md'],
    uatScenarioRefs: [trusted.uatScenarioRef],
    observeBuildIdentity: trusted.observeBuildIdentity
  });
  assert.equal(unrelatedObservation.verified, true, unrelatedObservation.errors.join('; '));
  const unrelatedManifest = {
    relevant_paths: [...unrelatedObservation.relevant_paths],
    relevant_path_hashes: { ...unrelatedObservation.relevant_path_hashes },
    relevant_paths_hash: unrelatedObservation.relevant_paths_hash
  };
  const unrelatedEvidence = {
    ...trusted.context.evidence[0],
    ...unrelatedManifest
  };
  const unrelatedContext = {
    ...trusted.context,
    evidence: [unrelatedEvidence],
    evidence_current: unrelatedEvidence
  };
  const unrelatedCurrentState = { ...trusted.currentState, ...unrelatedManifest };
  const authorization = await productProtocol.authorizeProductContext({
    repositoryRoot: trusted.repositoryRoot,
    context: unrelatedContext,
    currentState: unrelatedCurrentState,
    observeBuildIdentity: trusted.observeBuildIdentity,
    observeAutomatedEvidence: async () => automatedExecutionObservation(unrelatedEvidence),
    observeManualUat: trusted.observeManualUat
  });
  assert.equal(authorization.authorized, false);
  assert.match(authorization.errors.join('\n'), /row.*relevant|implementation.*manifest|test.*artifact|spec.*manifest|expected.*result.*ref/i);
});

test('READY rejects raw automated evidence without a parent execution attestation', async (t) => {
  const trusted = await createTrustedReadyFixture(t);
  const authorization = await productProtocol.authorizeProductContext({
    repositoryRoot: trusted.repositoryRoot,
    context: trusted.context,
    currentState: trusted.currentState,
    observeBuildIdentity: trusted.observeBuildIdentity,
    observeManualUat: trusted.observeManualUat,
    observeAuditStatus: trusted.observeAuditStatus,
    executeAudit: trusted.executeAudit
  });
  assert.equal(authorization.authorized, false);
  assert.match(authorization.errors.join('\n'), /automated.*attestation|evidence.*observer|execution.*observer/i);
});

test('READY rejects raw manual UAT without a parent execution attestation', async (t) => {
  const trusted = await createTrustedReadyFixture(t);
  const authorization = await productProtocol.authorizeProductContext({
    repositoryRoot: trusted.repositoryRoot,
    context: trusted.context,
    currentState: trusted.currentState,
    observeBuildIdentity: trusted.observeBuildIdentity,
    observeAutomatedEvidence: trusted.observeAutomatedEvidence,
    observeAuditStatus: trusted.observeAuditStatus,
    executeAudit: trusted.executeAudit
  });
  assert.equal(authorization.authorized, false);
  assert.match(authorization.errors.join('\n'), /manual.*attestation|UAT.*observer|execution.*observer/i);
});

test('READY rejects automated evidence that differs from the parent-observed execution', async (t) => {
  const trusted = await createTrustedReadyFixture(t);
  const forgedEvidence = {
    ...trusted.context.evidence[0],
    observed_result: 'caller-authored passing output',
    output_digest: sha256('caller-authored-output-digest')
  };
  const forgedContext = {
    ...trusted.context,
    evidence: [forgedEvidence],
    evidence_current: forgedEvidence
  };
  const authorization = await productProtocol.authorizeProductContext({
    repositoryRoot: trusted.repositoryRoot,
    context: forgedContext,
    currentState: trusted.currentState,
    observeBuildIdentity: trusted.observeBuildIdentity,
    observeAutomatedEvidence: trusted.observeAutomatedEvidence,
    observeManualUat: trusted.observeManualUat
  });
  assert.equal(authorization.authorized, false);
  assert.match(authorization.errors.join('\n'), /automated.*attestation|output.*digest|observed.*result|execution.*mismatch/i);
});

test('READY rejects manual UAT that differs from the parent-observed execution', async (t) => {
  const trusted = await createTrustedReadyFixture(t);
  const forgedUat = {
    ...trusted.context.uat_records[0],
    executed_by: 'caller-authored-executor',
    actual_result: 'caller-authored manual result'
  };
  const forgedContext = { ...trusted.context, uat_records: [forgedUat] };
  const authorization = await productProtocol.authorizeProductContext({
    repositoryRoot: trusted.repositoryRoot,
    context: forgedContext,
    currentState: trusted.currentState,
    observeBuildIdentity: trusted.observeBuildIdentity,
    observeAutomatedEvidence: trusted.observeAutomatedEvidence,
    observeManualUat: trusted.observeManualUat
  });
  assert.equal(authorization.authorized, false);
  assert.match(authorization.errors.join('\n'), /manual.*attestation|executor|actual.*result|UAT.*execution.*mismatch/i);
});

test('final product authorization re-reads file state after execution-observer waits', async (t) => {
  const trusted = await createTrustedReadyFixture(t);
  const observeAutomatedEvidence = async (request) => {
    await writeFile(trusted.readyPath, 'export const ready = false;\n', 'utf8');
    return trusted.observeAutomatedEvidence(request);
  };
  const authorization = await productProtocol.authorizeProductContext({
    repositoryRoot: trusted.repositoryRoot,
    context: trusted.context,
    currentState: trusted.currentState,
    observeBuildIdentity: trusted.observeBuildIdentity,
    observeAutomatedEvidence,
    observeManualUat: trusted.observeManualUat
  });
  assert.equal(authorization.authorized, false);
  assert.match(authorization.errors.join('\n'), /relevant.*path|current.state|file-backed|hash/i);
});

test('final product authorization re-reads relevant paths for a non-ready authorized write', async (t) => {
  const writeFixture = await createTrustedReadyFixture(t);
  const approvedWritePlan = approvedProductPlanFixture(writeFixture.repositoryRoot, {
    productAction: 'traceability-sync'
  });
  await writeApprovedPlanFixture(writeFixture.repositoryRoot, approvedWritePlan);
  const planIdentity = {
    approved_plan_path: approvedWritePlan.planPath,
    approved_plan_hash: approvedWritePlan.approvedPlanHash,
    approved_plan_integrity_hash: approvedWritePlan.approvedPlanIntegrityHash
  };
  const evidence = writeFixture.context.evidence.map((record) => ({ ...record, ...planIdentity }));
  const currentState = { ...writeFixture.currentState, ...planIdentity };
  const ledgerPath = writeFixture.context.layout.current_path;
  const blockedWriteContext = {
    ...writeFixture.context,
    ...planIdentity,
    evidence,
    evidence_current: evidence[0],
    product_action: 'traceability-sync',
    product_action_lifecycle: productActionLifecycle(
      approvedWritePlan.planContext.product_action_authority
    ),
    persistence_requested: false,
    write_policy: 'allow',
    side_effects_allowed: true,
    write_authorized: true,
    allowed_paths: ['.sdcorejs/docs/product/contract-001/**'],
    planned_writes: [ledgerPath],
    actual_writes: [ledgerPath],
    after_status_digest: 'status-after-write',
    gaps: [{ type: 'implementation_drift', blocking: true }],
    blockers: ['implementation drift'],
    verdict: 'BLOCKED'
  };

  const beforeMutation = await productProtocol.authorizeProductContext({
    repositoryRoot: writeFixture.repositoryRoot,
    context: blockedWriteContext,
    currentState,
    observeBuildIdentity: writeFixture.observeBuildIdentity,
    observeAutomatedEvidence: writeFixture.observeAutomatedEvidence,
    observeManualUat: writeFixture.observeManualUat
  });
  assert.equal(beforeMutation.authorized, true, beforeMutation.errors.join('; '));

  await writeFile(writeFixture.readyPath, 'export const ready = false;\n', 'utf8');
  const afterMutation = await productProtocol.authorizeProductContext({
    repositoryRoot: writeFixture.repositoryRoot,
    context: blockedWriteContext,
    currentState,
    observeBuildIdentity: writeFixture.observeBuildIdentity,
    observeAutomatedEvidence: writeFixture.observeAutomatedEvidence,
    observeManualUat: writeFixture.observeManualUat
  });
  assert.equal(afterMutation.authorized, false);
  assert.match(afterMutation.errors.join('\n'), /relevant-path|current state|hash|freshness/i);
});

test('action and context validation fail closed on incomplete UAT, policy, identity, and redaction', () => {
  assertHasError(validateProductAction('record-uat', {
    side_effects_allowed: true,
    persistence_requested: false,
    write_policy: 'allow',
    write_authorized: false,
    requirements_changed: false,
    contract_id: 'CONTRACT-001',
    requirement_revision: 1,
    approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
    approved_spec_hash: 'spec-v1',
    normative_before: normativeProjection(),
    normative_after: normativeProjection(),
    uat_result: {
      uat_record_id: 'UAT-SHALLOW',
      scenario_id: 'UAT-001',
      scenario_source_ref: 'product/uat-checklists/contract-001.md#uat-001',
      scenario_source_hash: 'uat-v1',
      executed_by: 'CI bot',
      executed_at: '2026-07-13T15:00:00.000Z',
      actual_result: 'pass',
      environment: {},
      redaction: {}
    }
  }), /preconditions|actor_role|expected_result|evidence_refs|manual/i);

  assertHasError(validateProductAction('traceability-sync', {
    side_effects_allowed: true,
    persistence_requested: false,
    write_policy: 'allow',
    write_authorized: false,
    requirements_changed: false,
    contract_id: 'CONTRACT-001',
    requirement_revision: 1,
    approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
    approved_spec_hash: 'spec-v1',
    evidence: [],
    normative_before: null,
    normative_after: null
  }), /complete normative|snapshot/i);

  const incomplete = {
    product_action: 'audit-readonly',
    side_effects_allowed: false,
    contract_id: 'CONTRACT-001',
    requirement_revision: 1,
    approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
    approved_spec_hash: 'spec-v1',
    evidence: [],
    normative_before: normativeProjection(),
    normative_after: normativeProjection(),
    requirements_changed: false,
    allowed_paths: [],
    planned_paths: [],
    actual_paths: [],
    deleted_paths: [],
    before_status_digest: 'same',
    after_status_digest: 'same'
  };
  assertHasError(validateProductContext(incomplete), /schema_version|source|feature_id|layout/i);

  const failedRedaction = completeProductContext({
    redaction: {
      redaction_applied: false,
      redacted_fields: [],
      excluded_paths: [],
      secret_scan: 'failed',
      pii_redacted: false,
      logs_sanitized: false
    }
  });
  assertHasError(validateProductContext(failedRedaction, currentState()), /redaction|secret_scan|sanitized/i);

  const divergentSensitiveCurrentEvidence = currentEvidence({
    unexpected_current_field: 'Authorization: Basic YWxhZGRpbjpvcGVuc2VzYW1l'
  });
  assertHasError(validateProductContext(completeProductContext({
    evidence_current: divergentSensitiveCurrentEvidence
  }), currentState()), /evidence_current|unknown.*unexpected_current_field|redact|authorization|sensitive/i);

  const evidenceWithUnknownField = currentEvidence({ unexpected_evidence_field: true });
  assertHasError(validateProductContext(completeProductContext({
    evidence: [evidenceWithUnknownField],
    evidence_current: evidenceWithUnknownField
  }), currentState()), /evidence.*unknown.*unexpected_evidence_field|closed schema/i);

  const uatWithUnknownField = currentUatRecord({ unexpected_uat_field: true });
  assertHasError(validateProductContext(completeProductContext({
    uat_records: [uatWithUnknownField]
  }), currentState()), /UAT.*unknown.*unexpected_uat_field|closed schema/i);

  assertHasError(validateProductContext(completeProductContext({ feature_id: '' }), currentState()), /feature_id|feature identity/i);

  const notApplicableScan = currentEvidence({
    redaction: {
      ...currentEvidence().redaction,
      secret_scan: 'not_applicable'
    }
  });
  assertHasError(validateProductContext(completeProductContext({
    evidence: [notApplicableScan],
    evidence_current: notApplicableScan
  }), currentState()), /secret_scan|redaction/i);

  assertHasError(validateIdentityTransition({
    contract_id: 'CONTRACT-001',
    feature_id: 'FEATURE-001',
    requirement_revision: 1,
    requirement_ids: ['AC-001'],
    retired_requirement_ids: []
  }, {
    contract_id: 'CONTRACT-001',
    feature_id: 'FEATURE-CHANGED',
    requirement_revision: 2,
    requirement_ids: ['AC-001'],
    retired_requirement_ids: [],
    supersedes: 1,
    change_reason: 'Approved wording change.',
    approval: { approved: true }
  }, { action: 'requirements-update' }), /feature_id|feature identity/i);

  const ambiguous = completeProductContext({
    layout: {
      ...completeProductContext().layout,
      active_candidates: [
        '.sdcorejs/docs/product/contract-001/current.md',
        '.sdcorejs/docs/product/contract-001/alternate-current.md'
      ]
    }
  });
  assertHasError(validateProductContext(ambiguous, currentState()), /active.*candidate|ledger.*ambiguous/i);

  assertHasError(validateProductContext(completeProductContext({
    approval: {
      approved: false,
      approved_by: null,
      approved_at: null,
      approval_source: null
    }
  }), currentState()), /approval|approved authority/i);

  for (const field of ['action_errors', 'identity_errors', 'side_effect_errors', 'context_errors']) {
    assertHasError(validateProductContext(completeProductContext({
      validation: {
        ...completeProductContext().validation,
        [field]: [`blocked ${field}`]
      }
    }), currentState()), new RegExp(`validation\\.${field}|validator.*error|blocked ${field}`, 'i'));
  }

  assertHasError(validateProductContext(completeProductContext({
    unexpected_top_level_field: true
  }), currentState()), /unknown.*unexpected_top_level_field|closed schema/i);
  assertHasError(validateProductContext(completeProductContext({
    target: {
      ...completeProductContext().target,
      unexpected_nested_field: true
    }
  }), currentState()), /unknown.*unexpected_nested_field|closed schema/i);

  assertHasError(validateProductContext(completeProductContext({
    normative_after: {
      ...normativeProjection(),
      requirement_ids: ['AC-OTHER']
    }
  }), currentState()), /complete normative|active requirement|requirement IDs/i);

  const mismatchedNormative = {
    contract_id: 'OTHER-CONTRACT',
    requirement_revision: 9,
    approved_spec_hash: 'other-spec',
    requirements: [{ ...approvedRequirement, id: 'AC-X' }]
  };
  assertHasError(validateProductContext(completeProductContext({
    normative_before: mismatchedNormative,
    normative_after: mismatchedNormative
  }), currentState()), /normative.*contract|normative.*revision|normative.*spec|normative.*requirement/i);

  const waivedWithoutRecord = readyRow({
    uat_status: 'waived',
    uat_approval: { approved: true },
    uat_record_ids: []
  });
  assertHasError(validateProductContext(completeProductContext({
    rows: [waivedWithoutRecord],
    uat_records: [],
    verdict: 'READY_WITH_WARNINGS',
    warnings: ['UAT is waived.']
  }), currentState()), /waiver|UAT.*decision|UAT.*record|approval.*reason/i);

  const revisionBefore = normativeProjection({
    approved_spec_path: '.sdcorejs/specs/product/contract-001-r1.md',
    requirements: [
      { ...approvedRequirement, id: 'AC-001' },
      { ...approvedRequirement, id: 'AC-002' }
    ]
  });
  const revisionAfter = normativeProjection({
    requirement_revision: 2,
    approved_spec_path: '.sdcorejs/specs/product/contract-001-r2.md',
    approved_spec_hash: 'spec-v2',
    requirements: [{ ...approvedRequirement, id: 'AC-001' }],
    retired_requirement_ids: ['AC-002']
  });
  const validRevisionContext = completeProductContext({
    product_action: 'requirements-update',
    persistence_requested: false,
    write_policy: 'allow',
    side_effects_allowed: true,
    write_authorized: false,
    requirements_changed: true,
    requirement_revision: 2,
    requirement_ids: ['AC-001'],
    retired_requirement_ids: ['AC-002'],
    supersedes: 1,
    change_reason: 'Approved removal of AC-002.',
    approved_spec_path: '.sdcorejs/specs/product/contract-001-r2.md',
    approved_spec_hash: 'spec-v2',
    normative_before: revisionBefore,
    normative_after: revisionAfter,
    rows: [readyRow({
      implementation_status: 'unknown',
      implementation_refs: [],
      verification_status: 'unverified',
      verification_evidence_ids: [],
      uat_status: 'not_run',
      uat_record_ids: [],
      evidence_freshness: 'unknown',
      verdict: 'PARTIAL'
    })],
    evidence: [],
    evidence_current: null,
    evidence_freshness: 'unknown',
    uat_records: [],
    verdict: 'BLOCKED',
    blockers: ['Awaiting implementation.']
  });
  assert.deepEqual(validateProductContext(validRevisionContext, currentState()), []);
  assertHasError(validateProductContext({
    ...validRevisionContext,
    requirement_ids: ['AC-001', 'AC-002'],
    retired_requirement_ids: []
  }, currentState()), /retired|reuse|identity|normative.*requirement/i);
  assertHasError(validateProductContext({
    ...validRevisionContext,
    approved_spec_path: revisionBefore.approved_spec_path,
    approved_spec_hash: revisionBefore.approved_spec_hash,
    normative_after: {
      ...revisionAfter,
      approved_spec_path: revisionBefore.approved_spec_path,
      approved_spec_hash: revisionBefore.approved_spec_hash
    }
  }, currentState()), /approved spec|immutable.*snapshot|spec.*path|spec.*hash/i);
});

test('UAT waiver and deferral decisions bind exact scope, current validity, and full identity', () => {
  const decision = approvedUatDecision();
  const waivedRecord = currentUatRecord({
    status: 'waived',
    actual_result: 'Execution was waived by an approved bounded decision.',
    decision
  });
  const waivedRow = readyRow({
    uat_status: 'waived',
    uat_approval: decision,
    verdict: 'READY_WITH_WARNINGS'
  });
  const base = completeProductContext({
    rows: [waivedRow],
    uat_records: [waivedRecord],
    verdict: 'READY_WITH_WARNINGS',
    warnings: ['UAT is waived by an approved decision.']
  });

  const wrongScopeDecision = approvedUatDecision({
    scope: { scenario_ids: ['UAT-999'], requirement_ids: ['AC-999'] }
  });
  assertHasError(validateProductContext({
    ...base,
    rows: [{ ...waivedRow, uat_approval: wrongScopeDecision }],
    uat_records: [{ ...waivedRecord, decision: wrongScopeDecision }]
  }, currentState()), /decision.*scope|scope.*scenario|scope.*requirement/i);

  const expiredDecision = approvedUatDecision({ expires_at: '2026-07-12T14:00:00.000Z' });
  assertHasError(validateProductContext({
    ...base,
    rows: [{ ...waivedRow, uat_approval: expiredDecision }],
    uat_records: [{ ...waivedRecord, decision: expiredDecision }]
  }, currentState()), /expired|expires_at/i);

  assertHasError(validateProductContext({
    ...base,
    rows: [{ ...waivedRow, uat_approval: approvedUatDecision({ decision_id: 'DEC-UAT-DIFFERENT' }) }]
  }, currentState()), /decision.*match|approval.*match|identity/i);
});

test('evidence freshness requires a nonempty canonical SHA-256 path manifest', () => {
  const emptyManifest = currentEvidence({
    relevant_paths: [],
    relevant_path_hashes: {},
    relevant_paths_hash: sha256('forged-empty-manifest')
  });
  assertHasError(validateProductContext(completeProductContext({
    evidence: [emptyManifest],
    evidence_current: emptyManifest
  }), currentState({
    relevant_paths: [],
    relevant_path_hashes: {},
    relevant_paths_hash: emptyManifest.relevant_paths_hash
  })), /relevant.*path.*non-empty|path manifest/i);

  const mismatchedKeys = currentEvidence({
    relevant_path_hashes: { 'src/other.ts': sha256('other') },
    relevant_paths_hash: sha256('forged-key-set')
  });
  assertHasError(validateProductContext(completeProductContext({
    evidence: [mismatchedKeys],
    evidence_current: mismatchedKeys
  }), currentState()), /relevant.*path.*key|key.*relevant.*path|manifest/i);

  const forgedAggregate = currentEvidence({
    relevant_path_hashes: { 'src/ready.ts': sha256('ready source') },
    relevant_paths_hash: sha256('not-the-canonical-aggregate')
  });
  assertHasError(validateProductContext(completeProductContext({
    evidence: [forgedAggregate],
    evidence_current: forgedAggregate
  }), currentState()), /aggregate|relevant_paths_hash|manifest/i);
});

test('layout resolution preserves established ledgers and emits collision-safe canonical fallbacks', () => {
  const established = resolveProductLayout({
    feature_id: 'feature-invoice',
    contract_id: 'CONTRACT-001',
    existing_layout: {
      root: 'product',
      prd_path: 'product/prds/invoice.md',
      current_path: '.sdcorejs/docs/product/invoice/current.md',
      history_root: '.sdcorejs/docs/product/invoice/history',
      uat_root: '.sdcorejs/docs/product/invoice/uat'
    }
  });
  assert.equal(established.layout.current_path, '.sdcorejs/docs/product/invoice/current.md');
  assert.equal(established.layout.history_root, '.sdcorejs/docs/product/invoice/history');
  assert.equal(established.layout.uat_root, '.sdcorejs/docs/product/invoice/uat');

  const first = resolveProductLayout({ feature_id: 'feature-invoice', contract_id: 'CONTRACT-A' });
  const second = resolveProductLayout({ feature_id: 'feature-invoice', contract_id: 'CONTRACT-B' });
  assert.match(first.layout.product_docs.prd_path, /^product\/prds\//);
  assert.match(first.layout.product_docs.uat_path, /^product\/uat-checklists\//);
  assert.match(first.layout.product_docs.decisions_path, /^product\/decisions\//);
  assert.notEqual(first.layout.product_docs.decisions_path, second.layout.product_docs.decisions_path);
});

test('product templates never manufacture passed, current, or ready state', async () => {
  const template = await readFile(path.join(repoRoot, '_refs', 'product', 'templates.md'), 'utf8');
  assert.match(template, /requirement_field_hashes:/);
  assert.match(template, /requirement_source_hashes:/);
  const traceabilityRow = template.split(/\r?\n/).find((line) => line.startsWith('| AC-001 ') && line.split('|').length >= 13) ?? '';
  assert.match(traceabilityRow, /\{verification status\}/);
  assert.match(traceabilityRow, /\{UAT status\}/);
  assert.match(traceabilityRow, /\{evidence freshness\}/);
  assert.match(traceabilityRow, /\{derived verdict\}/);

  const evidenceRow = template.split(/\r?\n/).find((line) => line.startsWith('| EVID-001 ')) ?? '';
  const uatRow = template.split(/\r?\n/).find((line) => line.startsWith('| UAT-001-EXEC-001 ')) ?? '';
  assert.match(evidenceRow, /\{evidence freshness\}/);
  assert.match(uatRow, /\{UAT status\}/);
});

test('sdcorejs-test emits product-consumable canonical evidence', async () => {
  const sources = await Promise.all([
    readFile(path.join(repoRoot, '_refs', 'shared', 'test-context.md'), 'utf8'),
    readFile(path.join(repoRoot, 'skills', 'tracks', 'test', 'sdcorejs-test.md'), 'utf8')
  ]);
  for (const source of sources) {
    const contextBlock = source.match(/test_context:[\s\S]{0,1500}/)?.[0] ?? '';
    const block = source.match(/test_evidence:[\s\S]{0,3000}/)?.[0] ?? '';
    for (const field of ['approved_plan_path', 'approved_plan_hash', 'approved_plan_integrity_hash']) {
      assert.match(contextBlock, new RegExp(`${field}:`));
      assert.match(block, new RegExp(`${field}:`));
    }
    assert.match(block, /approved_spec_path:/);
    assert.match(block, /redaction:\s*\r?\n\s+redaction_applied:/);
    for (const field of ['redacted_fields', 'excluded_paths', 'secret_scan', 'pii_redacted', 'logs_sanitized']) {
      assert.match(block, new RegExp(`${field}:`));
    }
  }

  const result = deriveTraceability({
    requirements: [{
      id: 'AC-001', behavior_key: 'invoice-view', expected: 'allowed',
      requirement_status: 'approved', uat_required: false
    }],
    implementation_artifacts: [{
      path: 'src/ready.ts', behavior_key: 'invoice-view', observed: 'allowed',
      observable_behavior: true, requirement_ids: ['AC-001']
    }],
    test_artifacts: [{
      path: 'test/ready.test.mjs', behavior_key: 'invoice-view',
      requirement_ids: ['AC-001'], verification_status: 'passed',
      evidence_ids: ['EVID-READY-001']
    }],
    evidence_records: [currentEvidence()],
    current_state: currentState()
  });
  assert.equal(result.rows[0].verification_status, 'passed');
  assert.equal(result.rows[0].evidence_freshness, 'current');

  const incompleteEvidence = currentEvidence();
  delete incompleteEvidence.approved_spec_path;
  const incomplete = deriveTraceability({
    requirements: [{
      id: 'AC-001', behavior_key: 'invoice-view', expected: 'allowed',
      requirement_status: 'approved', uat_required: false
    }],
    implementation_artifacts: [{
      path: 'src/ready.ts', behavior_key: 'invoice-view', observed: 'allowed',
      observable_behavior: true, requirement_ids: ['AC-001']
    }],
    test_artifacts: [{
      path: 'test/ready.test.mjs', behavior_key: 'invoice-view',
      requirement_ids: ['AC-001'], verification_status: 'passed',
      evidence_ids: ['EVID-READY-001']
    }],
    evidence_records: [incompleteEvidence],
    current_state: currentState()
  });
  assert.equal(incomplete.rows[0].verification_status, 'unverified');
});

test('canonical product handoff docs preserve approved plan identity', async () => {
  const sources = await Promise.all([
    readFile(path.join(repoRoot, '_refs', 'product', 'evidence-and-uat.md'), 'utf8'),
    readFile(path.join(repoRoot, '_refs', 'product', 'product-context.md'), 'utf8'),
    readFile(path.join(repoRoot, 'skills', 'tracks', 'product', 'sdcorejs-product.md'), 'utf8')
  ]);
  for (const source of sources) {
    for (const field of ['approved_plan_path', 'approved_plan_hash', 'approved_plan_integrity_hash']) {
      assert.match(source, new RegExp(`${field}:`));
    }
  }
});

test('product executor runs one bounded write inside authorization and reauthorizes the post-write state', async () => {
  const source = await readFile(path.join(repoRoot, 'skills', 'tracks', 'product', 'sdcorejs-product.md'), 'utf8');
  const deriveRedactedState = source.indexOf('**Derive and redact the intended state without mutation.**');
  const preWriteAuthorization = source.indexOf('**Authorize and execute one bounded write.**');
  const observeCompletedWrite = source.indexOf('**Observe only the completed bounded write.**');
  const rereadRedactedState = source.indexOf('**Re-read and redact the observed state.**');
  const postWriteAuthorization = source.indexOf('**Issue post-write final authorization.**');
  assert.ok(deriveRedactedState >= 0, 'proposed state must be redacted before authorization');
  assert.ok(preWriteAuthorization > deriveRedactedState, 'pre-write authorization must consume the redacted proposed state');
  assert.ok(preWriteAuthorization >= 0, 'missing explicit pre-write authorization step');
  assert.ok(observeCompletedWrite > preWriteAuthorization, 'the bounded in-gate write must complete before observation');
  assert.ok(rereadRedactedState > observeCompletedWrite, 'observed state must be re-read and redacted after mutation');
  assert.ok(postWriteAuthorization > rereadRedactedState, 'post-write authorization must consume the redacted observed state');
  assert.match(source, /executeWrite/);
  assert.match(source, /write_executed:\s*true/);
  assert.match(source, /observeStatus\(before\) -> executeAudit -> observeStatus\(after\)/);
  assert.match(source, /post-write final authorization[\s\S]{0,1400}before persisting final context or\s+evidence, reporting, or a `READY`/i);
});

test('canonical UAT documentation includes the manual execution discriminator required by validation', async () => {
  const sources = await Promise.all([
    readFile(path.join(repoRoot, '_refs', 'product', 'evidence-and-uat.md'), 'utf8'),
    readFile(path.join(repoRoot, '_refs', 'product', 'product-context.md'), 'utf8')
  ]);
  for (const source of sources) assert.match(source, /execution_kind:\s*manual/);
});

test('R3 repair: audit-readonly requires an opaque request-bound parent-observed zero-write proof', async () => {
  const statusDigest = sha256('unchanged repository status');
  const observation = {
    action: 'audit-readonly',
    side_effects_allowed: false,
    write_authorized: false,
    allowed_paths: [],
    planned_paths: [],
    actual_paths: [],
    deleted_paths: [],
    summary_refresh: false,
    checkpoint_write: false,
    before_status_digest: statusDigest,
    after_status_digest: statusDigest,
    requirements_changed: false,
    normative_before: normativeProjection(),
    normative_after: normativeProjection()
  };

  assertHasError(validateActionSideEffects(observation).errors, /opaque|parent-observed|zero-write proof/i);
  assert.equal(typeof productProtocol.observeAuditReadonlyState, 'function');
  const proof = await productProtocol.observeAuditReadonlyState({
    repositoryRoot: repoRoot,
    request: observation,
    observeStatus: async () => statusDigest,
    executeAudit: async ({ request_digest }) => ({ completed: true, request_digest })
  });
  assert.equal(proof.verified, true, proof.errors?.join('; '));
  assert.deepEqual(validateActionSideEffects(observation, { trusted_audit_proof: proof }).errors, []);
  assertHasError(
    validateActionSideEffects(observation, { trusted_audit_proof: proof }).errors,
    /one-shot|opaque|zero-write proof/i
  );

  const changed = await productProtocol.observeAuditReadonlyState({
    repositoryRoot: repoRoot,
    request: observation,
    observeStatus: async ({ phase }) => phase === 'before' ? statusDigest : sha256('changed repository status'),
    executeAudit: async ({ request_digest }) => ({ completed: true, request_digest })
  });
  assert.equal(changed.verified, false);
  assertHasError(changed.errors, /changed|before.*after|zero-write/i);
});

test('R3 repair round 2: audit zero-write observation brackets the exact audit execution', async () => {
  const statusDigest = sha256('audit-bracket-state');
  const request = {
    action: 'audit-readonly',
    before_status_digest: statusDigest,
    after_status_digest: statusDigest
  };
  const missingExecution = await productProtocol.observeAuditReadonlyState({
    repositoryRoot: repoRoot,
    request,
    observeStatus: async () => statusDigest
  });
  assert.equal(missingExecution.verified, false);
  assertHasError(missingExecution.errors, /audit.*executor|execute.*audit|bracket/i);

  const order = [];
  const bracketed = await productProtocol.observeAuditReadonlyState({
    repositoryRoot: repoRoot,
    request,
    observeStatus: async ({ phase }) => {
      order.push(phase);
      return statusDigest;
    },
    executeAudit: async ({ request_digest }) => {
      order.push('audit');
      return { completed: true, request_digest };
    }
  });
  assert.equal(bracketed.verified, true, bracketed.errors?.join('; '));
  assert.deepEqual(order, ['before', 'audit', 'after']);
});

test('R3 repair: active-ledger authority is discovered from files and rejects omitted candidates', async (t) => {
  const repositoryRoot = await mkdtemp(path.join(tmpdir(), 'sdcorejs-product-layout-'));
  t.after(() => rm(repositoryRoot, { recursive: true, force: true }));
  for (const directory of ['primary', 'duplicate']) {
    const ledgerPath = path.join(repositoryRoot, '.sdcorejs', 'docs', 'product', directory, 'current.md');
    await mkdir(path.dirname(ledgerPath), { recursive: true });
    await writeFile(ledgerPath, [
      '---',
      'contract_id: CONTRACT-001',
      'feature_id: FEATURE-001',
      '---',
      '',
      '# Current product ledger',
      ''
    ].join('\n'), 'utf8');
  }

  assert.equal(typeof productProtocol.observeProductLayoutState, 'function');
  const observed = await productProtocol.observeProductLayoutState({
    repositoryRoot,
    contractId: 'CONTRACT-001',
    featureId: 'FEATURE-001'
  });
  assert.equal(observed.verified, true, observed.errors?.join('; '));
  assert.equal(observed.active_candidates.length, 2);
  const claimed = completeProductContext({
    target: { ...completeProductContext().target, repo_root: repositoryRoot, target_root: repositoryRoot },
    layout: {
      ...completeProductContext().layout,
      current_path: observed.active_candidates[0],
      active_candidates: [observed.active_candidates[0]]
    },
    active_ledger_path: observed.active_candidates[0]
  });
  assertHasError(
    validateProductContext(claimed, currentState(), { trusted_layout: observed }),
    /active.*candidate|ledger.*ambiguous|file-backed layout/i
  );
});

test('R3 repair: untrusted normative expectations cannot erase implementation drift', async (t) => {
  const trusted = await createTrustedReadyFixture(t);
  const forgedInput = {
    requirements: [{
      id: 'AC-001',
      text: 'Bulk deletion is denied.',
      behavior_key: 'bulk-delete',
      expected: 'allowed',
      source_ref: `${trusted.fixture.specPath}#ac-001`,
      source_hash: trusted.authorization.authority.requirement_source_hashes?.['AC-001']
    }],
    implementation_artifacts: [{
      path: 'src/bulk-delete.ts',
      behavior_key: 'bulk-delete',
      observed: 'allowed',
      observable_behavior: true,
      requirement_ids: ['AC-001']
    }],
    test_artifacts: []
  };
  const untrusted = deriveTraceability(forgedInput);
  assert.ok(untrusted.gaps.some((gap) => gap.type === 'untrusted_normative_input' && gap.blocking));

  const trustedResult = deriveTraceability(forgedInput, {
    trusted_authority: trusted.authorization.authority
  });
  assert.ok(trustedResult.gaps.some((gap) => gap.type === 'implementation_drift' && gap.blocking));
  assert.notEqual(trustedResult.verdict, 'READY');
});

test('R3 repair: row readiness rejects passed states without bound evidence and UAT IDs', () => {
  const unboundEvidence = deriveRequirementReadiness(readyRow({ verification_evidence_ids: [] }));
  assert.equal(unboundEvidence.verdict, 'BLOCKED');
  assertHasError(unboundEvidence.blockers, /bound.*verification evidence|evidence.*ID/i);

  const unboundUat = deriveRequirementReadiness(readyRow({ uat_record_ids: [] }));
  assert.equal(unboundUat.verdict, 'BLOCKED');
  assertHasError(unboundUat.blockers, /bound.*UAT|UAT.*record/i);
});

test('R3 repair round 2: optional passed verification still requires bound evidence', () => {
  const optional = deriveRequirementReadiness(readyRow({
    required: false,
    verification_evidence_ids: [],
    uat_required: false,
    uat_status: 'not_run',
    uat_record_ids: []
  }), { uat_required: false });
  assert.notEqual(optional.verdict, 'READY');
  assertHasError(optional.blockers, /bound.*verification evidence|evidence.*ID/i);
});

test('R3 repair: malformed evidence cannot participate in READY derivation', () => {
  const malformed = currentEvidence({
    started_at: 'not-an-instant',
    finished_at: 'also-not-an-instant',
    observed_at: 'not-an-instant',
    output_digest: 'not-a-sha256',
    environment: {
      ...currentEvidence().environment,
      environment_fingerprint: 'not-a-sha256'
    },
    associated_diff: {
      ...currentEvidence().associated_diff,
      diff_hash: 'not-a-sha256',
      changed_paths: ['../escape']
    }
  });
  const result = deriveTraceability({
    requirements: [{
      id: 'AC-001', behavior_key: 'invoice-view', expected: 'allowed',
      source_ref: '.sdcorejs/specs/product/contract-001.md#ac-001',
      source_hash: sha256('requirement-v1'), requirement_status: 'approved', uat_required: false
    }],
    implementation_artifacts: [{
      path: 'src/ready.ts', behavior_key: 'invoice-view', observed: 'allowed',
      observable_behavior: true, requirement_ids: ['AC-001']
    }],
    test_artifacts: [{
      path: 'test/ready.test.mjs', behavior_key: 'invoice-view', requirement_ids: ['AC-001'],
      verification_status: 'passed', evidence_ids: ['EVID-READY-001']
    }],
    evidence_records: [malformed],
    current_state: currentState()
  });
  assert.notEqual(result.rows[0].verification_status, 'passed');
  assert.notEqual(result.verdict, 'READY');
  assertHasError(
    validateProductContext(completeProductContext({ evidence: [malformed], evidence_current: malformed }), currentState()),
    /timestamp|ISO-8601|SHA-256|changed_paths|repository.*path/i
  );
});

test('R3 repair: omitted artifact observability fails closed as an unknown mapping', () => {
  const omitted = deriveTraceability({
    requirements: [{ id: 'AC-001', behavior_key: 'invoice-view', expected: 'allowed' }],
    implementation_artifacts: [{ path: 'src/invoice.mapper.ts', supports: ['AC-001'] }],
    test_artifacts: []
  });
  assert.equal(omitted.artifacts[0].role, 'mapping_unknown');
  assert.ok(omitted.gaps.some((gap) => gap.type === 'mapping_unknown' && gap.blocking));

  const invalid = deriveTraceability({
    requirements: [{ id: 'AC-001' }],
    implementation_artifacts: [{ path: 'src/invoice.mapper.ts', supports: ['AC-001'], observable_behavior: 'unknown' }],
    test_artifacts: []
  });
  assert.equal(invalid.verdict, 'BLOCKED');
  assertHasError(invalid.validation_errors, /observable_behavior.*boolean/i);
});

test('R3 repair: UAT action validation binds active requirements, scenario refs, hashes, steps, and evidence', () => {
  const malformed = currentUatRecord({
    scenario_id: 'UAT-999',
    requirement_ids: ['AC-999'],
    scenario_source_hash: 'not-a-sha256',
    steps_ref: 'product/uat-checklists/unrelated.md#other-steps',
    expected_result_ref: 'product/uat-checklists/unrelated.md#other-result',
    evidence_refs: ['EVID-MISSING'],
    environment: {
      ...currentUatRecord().environment,
      environment_fingerprint: 'not-a-sha256'
    }
  });
  const errors = validateProductAction('record-uat', actionContext('record-uat', {
    contract_id: 'CONTRACT-001',
    requirement_revision: 1,
    requirement_ids: ['AC-001'],
    approved_spec_path: '.sdcorejs/specs/product/contract-001.md',
    approved_spec_hash: 'spec-v1',
    normative_before: normativeProjection(),
    normative_after: normativeProjection(),
    layout: completeProductContext().layout,
    evidence: [currentEvidence()],
    uat_result: malformed
  }));
  for (const expected of [/active requirement/i, /scenario.*source|scenario.*anchor/i, /SHA-256/i, /steps.*scenario/i, /expected.*result.*ref/i, /evidence.*resolve|evidence.*reference/i]) {
    assertHasError(errors, expected);
  }
});

test('R3 repair: product context recursively closes normative and gap payloads and scans all reportable fields', () => {
  const sensitive = completeProductContext({
    warnings: ['Authorization: Basic YWxhZGRpbjpvcGVuc2VzYW1l'],
    gaps: [{ type: 'implementation_drift', blocking: false, token: 'secret-token-value' }],
    normative_before: { ...normativeProjection(), password: 'p@ssw0rd!' },
    normative_after: { ...normativeProjection(), password: 'p@ssw0rd!' }
  });
  const errors = validateProductContext(sensitive, currentState());
  assertHasError(errors, /unredacted secret|PII|sensitive/i);
  assertHasError(errors, /normative.*unknown.*password|closed schema/i);
  assertHasError(errors, /gap.*unknown.*token|closed schema/i);
});

test('R3 repair round 2: authority binds exact definitions, normative hashes, and row fields', async (t) => {
  const trusted = await createTrustedReadyFixture(t);
  const authorize = (context) => productProtocol.authorizeProductContext({
    repositoryRoot: trusted.repositoryRoot,
    context,
    currentState: trusted.currentState,
    observeBuildIdentity: trusted.observeBuildIdentity,
    observeAutomatedEvidence: trusted.observeAutomatedEvidence,
    observeManualUat: trusted.observeManualUat,
    observeAuditStatus: trusted.observeAuditStatus,
    executeAudit: trusted.executeAudit
  });

  for (const hashField of ['requirement_field_hashes', 'requirement_source_hashes']) {
    const forged = structuredClone(trusted.context);
    const forgedHashes = { 'AC-001': sha256(`caller-redefined ${hashField}`) };
    forged.normative_before[hashField] = forgedHashes;
    forged.normative_after[hashField] = forgedHashes;
    const authorization = await authorize(forged);
    assert.equal(authorization.authorized, false);
    assertHasError(authorization.errors, new RegExp(`${hashField}|normative.*(?:field|source) hashes`, 'i'));
  }

  const rowMutations = {
    required: false,
    source_ref: '.sdcorejs/specs/product/contract-001.md#caller-redefined',
    source_hash: sha256('caller-redefined row source'),
    requirement_status: 'draft',
    uat_required: true
  };
  for (const [field, value] of Object.entries(rowMutations)) {
    const forged = structuredClone(trusted.context);
    forged.rows[0][field] = value;
    const authorization = await authorize(forged);
    assert.equal(authorization.authorized, false, `${field} must remain authority-bound`);
    assertHasError(authorization.errors, new RegExp(`row AC-001.*${field}.*approved`, 'i'));
  }

  const requirementIds = Array.from({ length: 37 }, (_, index) => `AC-${String(index + 1).padStart(3, '0')}`);
  const requirementDefinitions = requirementIds.map((requirementId) => {
    if (requirementId === 'AC-001') {
      return 'Generic Seed/Update/Audit is replaced by the seven explicit product actions.';
    }
    if (requirementId === 'AC-037') {
      return 'Text hygiene, skill validation, product protocol, parallel, repository, and applicable E2E checks pass or retain exact current failure evidence.';
    }
    return `Approved product authority behavior ${requirementId} remains required.`;
  });
  const exactRepositoryRoot = await mkdtemp(path.join(tmpdir(), 'sdcorejs-product-exact-authority-'));
  t.after(() => rm(exactRepositoryRoot, { recursive: true, force: true }));
  const exactFixture = approvedSpecFixture({
    specPath: '.sdcorejs/specs/product/exact-authority.md',
    contractId: 'contract-product-traceability-20260713',
    featureId: 'feature-product-contract-refactor',
    requirementRevision: 2,
    requirementIds,
    approvedAt: '2026-07-14T23:18:18+07:00',
    approvedBy: 'ghost.of.dark.peter@gmail.com',
    body: [
      '# Approved contract',
      '',
      ...requirementIds.map((requirementId, index) =>
        `${index + 1}. ${requirementId} - ${requirementDefinitions[index]}`),
      ''
    ].join('\n')
  });
  await writeApprovedSpecFixture(exactRepositoryRoot, exactFixture);
  const exactAuthority = await productProtocol.verifyApprovedSpecAuthority({
    repositoryRoot: exactRepositoryRoot,
    context: {
      target: { repo_root: exactRepositoryRoot },
      contract_id: 'contract-product-traceability-20260713',
      feature_id: 'feature-product-contract-refactor',
      requirement_revision: 2,
      requirement_ids: requirementIds,
      approved_spec_path: exactFixture.specPath,
      approved_spec_hash: exactFixture.approvedSpecHash,
      approved_spec_integrity_hash: exactFixture.approvedSpecIntegrityHash,
      approval: {
        approved: true,
        approved_by: 'ghost.of.dark.peter@gmail.com',
        approved_at: '2026-07-14T23:18:18+07:00',
        approval_source: 'explicit-user-choice'
      }
    }
  });
  assert.equal(exactAuthority.verified, true, exactAuthority.errors?.join('; '));
  const exactById = new Map(exactAuthority.requirements.map((requirement) => [requirement.id, requirement]));
  assert.equal(exactById.get('AC-001')?.text, 'Generic Seed/Update/Audit is replaced by the seven explicit product actions.');
  assert.equal(exactById.get('AC-037')?.text, 'Text hygiene, skill validation, product protocol, parallel, repository, and applicable E2E checks pass or retain exact current failure evidence.');
});

test('R3 repair round 2: redaction covers environment secrets and account or government identifiers', () => {
  const redacted = redactProductEvidence({
    DATABASE_PASSWORD: 'synthetic-environment-secret',
    AWS_SECRET_ACCESS_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    AZURE_STORAGE_ACCOUNT_KEY: 'synthetic-cloud-account-key',
    GOOGLE_APPLICATION_CREDENTIALS: 'C:/private/service-account.json',
    account_id: 'ACC-928374',
    ssn: '123-45-6789',
    note: 'Account identifier ACC-928374',
    log: 'AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
  });
  assert.equal(redacted.redaction_applied, true);
  assert.doesNotMatch(JSON.stringify(redacted.value), /synthetic-environment-secret|EXAMPLEKEY|synthetic-cloud-account-key|service-account\.json|ACC-928374|123-45-6789/);
  for (const field of ['DATABASE_PASSWORD', 'AWS_SECRET_ACCESS_KEY', 'AZURE_STORAGE_ACCOUNT_KEY', 'GOOGLE_APPLICATION_CREDENTIALS', 'account_id', 'ssn']) {
    assert.ok(redacted.redacted_fields.includes(field));
  }
});

test('R3 repair round 2: pre-write authorization executes one bounded write inside the gate', async (t) => {
  const plannedPath = '.sdcorejs/docs/product/contract-001/current.md';
  const scoped = await createScopedWriteFixture(t, {
    planAllowedPaths: ['.sdcorejs/docs/product/**'],
    contextAllowedPaths: ['.sdcorejs/docs/product/contract-001/**'],
    plannedWrites: [plannedPath]
  });
  const absolutePlannedPath = path.join(scoped.repositoryRoot, ...plannedPath.split('/'));
  const afterStatusDigest = sha256('bounded-write-after-state');

  const missingExecutor = await productProtocol.authorizeProductContext({
    repositoryRoot: scoped.repositoryRoot,
    context: scoped.context,
    currentState: scoped.currentState,
    observeBuildIdentity: scoped.observeBuildIdentity,
    observeAutomatedEvidence: scoped.observeAutomatedEvidence,
    observeManualUat: scoped.observeManualUat
  });
  assert.equal(missingExecutor.authorized, false);
  assertHasError(missingExecutor.errors, /write executor|write result observer|execute.*inside.*authorization|bounded write/i);

  const missingObserver = await productProtocol.authorizeProductContext({
    repositoryRoot: scoped.repositoryRoot,
    context: scoped.context,
    currentState: scoped.currentState,
    observeBuildIdentity: scoped.observeBuildIdentity,
    observeAutomatedEvidence: scoped.observeAutomatedEvidence,
    observeManualUat: scoped.observeManualUat,
    executeWrite: async () => ({ completed: true })
  });
  assert.equal(missingObserver.authorized, false);
  assertHasError(missingObserver.errors, /write result observer|post-write observation/i);

  const noOp = await productProtocol.authorizeProductContext({
    repositoryRoot: scoped.repositoryRoot,
    context: scoped.context,
    currentState: scoped.currentState,
    observeBuildIdentity: scoped.observeBuildIdentity,
    observeAutomatedEvidence: scoped.observeAutomatedEvidence,
    observeManualUat: scoped.observeManualUat,
    executeWrite: async (request) => ({
      completed: true,
      request_digest: request.request_digest,
      context_digest: request.context_digest,
      actual_writes: [],
      deleted_paths: [],
      after_status_digest: afterStatusDigest
    }),
    observeWriteResult: async ({ request_digest, execution_receipt_digest }) => ({
      request_digest,
      execution_receipt_digest,
      actual_writes: [],
      deleted_paths: [],
      after_status_digest: afterStatusDigest
    })
  });
  assert.equal(noOp.authorized, false);
  assertHasError(noOp.errors, /no-op|at least one.*observed|actual.*deleted/i);

  const mismatchedReceipt = await productProtocol.authorizeProductContext({
    repositoryRoot: scoped.repositoryRoot,
    context: scoped.context,
    currentState: scoped.currentState,
    observeBuildIdentity: scoped.observeBuildIdentity,
    observeAutomatedEvidence: scoped.observeAutomatedEvidence,
    observeManualUat: scoped.observeManualUat,
    executeWrite: async (request) => ({
      completed: true,
      request_digest: sha256(`wrong:${request.request_digest}`),
      context_digest: request.context_digest,
      actual_writes: [plannedPath],
      deleted_paths: [],
      after_status_digest: afterStatusDigest
    }),
    observeWriteResult: async () => ({})
  });
  assert.equal(mismatchedReceipt.authorized, false);
  assertHasError(mismatchedReceipt.errors, /request.*binding|request_digest.*match/i);

  const outsidePath = '.sdcorejs/docs/product/outside.md';
  const outsideAbsolutePath = path.join(scoped.repositoryRoot, ...outsidePath.split('/'));
  const outOfScope = await productProtocol.authorizeProductContext({
    repositoryRoot: scoped.repositoryRoot,
    context: scoped.context,
    currentState: scoped.currentState,
    observeBuildIdentity: scoped.observeBuildIdentity,
    observeAutomatedEvidence: scoped.observeAutomatedEvidence,
    observeManualUat: scoped.observeManualUat,
    executeWrite: async (request) => {
      await writeFile(outsideAbsolutePath, '# out of scope\n', 'utf8');
      return {
        completed: true,
        request_digest: request.request_digest,
        context_digest: request.context_digest,
        actual_writes: [outsidePath],
        deleted_paths: [],
        after_status_digest: afterStatusDigest
      };
    },
    observeWriteResult: async ({ request_digest, execution_receipt_digest }) => ({
      request_digest,
      execution_receipt_digest,
      actual_writes: [outsidePath],
      deleted_paths: [],
      after_status_digest: afterStatusDigest
    })
  });
  assert.equal(outOfScope.authorized, false);
  assertHasError(outOfScope.errors, /outside.*planned|not.*planned|bounded write.*path/i);

  let executions = 0;
  let observedRequest = null;
  const executed = await productProtocol.authorizeProductContext({
    repositoryRoot: scoped.repositoryRoot,
    context: scoped.context,
    currentState: scoped.currentState,
    observeBuildIdentity: scoped.observeBuildIdentity,
    observeAutomatedEvidence: scoped.observeAutomatedEvidence,
    observeManualUat: scoped.observeManualUat,
    executeWrite: async (request) => {
      executions += 1;
      observedRequest = request;
      assert.deepEqual(Object.keys(request).sort(), [
        'context_digest', 'current_state_digest', 'planned_writes', 'repository_root', 'request_digest'
      ]);
      assert.deepEqual([...request.planned_writes], [plannedPath]);
      await writeFile(absolutePlannedPath, '# bounded write completed\n', 'utf8');
      return {
        completed: true,
        request_digest: request.request_digest,
        context_digest: request.context_digest,
        actual_writes: [plannedPath],
        deleted_paths: [],
        after_status_digest: afterStatusDigest
      };
    },
    observeWriteResult: async ({ request_digest, execution_receipt_digest }) => {
      assert.equal(await readFile(absolutePlannedPath, 'utf8'), '# bounded write completed\n');
      return {
        request_digest,
        execution_receipt_digest,
        actual_writes: [plannedPath],
        deleted_paths: [],
        after_status_digest: afterStatusDigest
      };
    }
  });
  assert.equal(executed.authorized, true, executed.errors?.join('; '));
  assert.equal(executed.write_executed, true);
  assert.equal(executions, 1);
  assert.equal(observedRequest.request_digest, sha256(JSON.stringify({
    context_digest: observedRequest.context_digest,
    current_state_digest: observedRequest.current_state_digest,
    planned_writes: [plannedPath],
    repository_root: observedRequest.repository_root
  })));
  assert.deepEqual(executed.write_observation.actual_writes, [plannedPath]);
});

test('trusted decision capability rejects forged replayed stale and caller-authored readiness decisions', async () => {
  assert.equal(typeof productProtocol.observeProductDecisionAuthority, 'function');

  const actionAuthority = standaloneProductActionAuthority('audit-readonly');
  const decisionRow = readyRow({
    implementation_status: 'not_applicable',
    implementation_refs: [],
    implementation_approval: approvedNotApplicableDecision('implementation'),
    verification_status: 'not_applicable',
    verification_evidence_ids: [],
    verification_approval: approvedNotApplicableDecision('verification'),
    uat_status: 'not_run',
    uat_required: false,
    uat_record_ids: [],
    evidence_freshness: 'current',
    verdict: 'NOT_APPLICABLE'
  });
  const base = completeProductContext();
  const context = completeProductContext({
    target: { ...base.target, repo_root: repoRoot, target_root: repoRoot },
    product_action_lifecycle: productActionLifecycle(actionAuthority),
    rows: [decisionRow],
    readiness_policy: { uat_required: false },
    verdict: 'NOT_APPLICABLE',
    evidence: [],
    evidence_current: null,
    uat_records: []
  });
  const state = currentState({
    post_integration_state_digest: sha256('post-integration-state')
  });
  let observations = 0;
  const issue = (candidateContext = context, candidateState = state) => productProtocol.observeProductDecisionAuthority({
    repositoryRoot: repoRoot,
    context: candidateContext,
    currentState: candidateState,
    observeDecisionSet: async (request) => {
      observations += 1;
      assert.equal(Object.isFrozen(request), true);
      assert.deepEqual(Object.keys(request).sort(), [
        'allowed_write_set_digest', 'approved_plan_hash', 'approved_plan_integrity_hash',
        'approved_plan_path', 'approved_spec_hash', 'approved_spec_integrity_hash',
        'approved_spec_path', 'contract_id', 'decision_set_digest', 'decisions',
        'feature_id', 'final_context_digest', 'lifecycle',
        'post_integration_state_digest', 'product_action', 'readiness_claim_digest',
        'repository_root', 'request_digest', 'requirement_revision'
      ].sort());
      return {
        request_digest: request.request_digest,
        decision_set_digest: request.decision_set_digest,
        final_context_digest: request.final_context_digest,
        post_integration_state_digest: request.post_integration_state_digest,
        observed_decisions: structuredClone(request.decisions)
      };
    }
  });
  const options = (trustedDecisionAuthority, candidateContext = context, candidateState = state) => ({
    trusted_decision_authority: trustedDecisionAuthority,
    context: candidateContext,
    current_state: candidateState
  });

  const callerAuthored = deriveRequirementReadiness(decisionRow, { uat_required: false });
  assert.equal(callerAuthored.verdict, 'BLOCKED');
  assertHasError(callerAuthored.blockers, /trusted.*decision|decision.*authority|one-shot/i);

  const trusted = await issue();
  assert.equal(trusted.verified, true, trusted.errors?.join('; '));
  assert.equal(Object.hasOwn(trusted, 'decisions'), false, 'the capability must remain opaque');
  const accepted = deriveRequirementReadiness(decisionRow, { uat_required: false }, options(trusted));
  assert.equal(accepted.verdict, 'NOT_APPLICABLE', accepted.blockers?.join('; '));

  const replay = deriveRequirementReadiness(decisionRow, { uat_required: false }, options(trusted));
  assert.equal(replay.verdict, 'BLOCKED');
  assertHasError(replay.blockers, /replay|consumed|one-shot|trusted.*decision/i);

  const fresh = await issue();
  const forged = { ...fresh };
  const forgedResult = deriveRequirementReadiness(decisionRow, { uat_required: false }, options(forged));
  assert.equal(forgedResult.verdict, 'BLOCKED');
  assertHasError(forgedResult.blockers, /forged|trusted.*decision|one-shot/i);

  const stale = await issue();
  const mutatedContext = {
    ...context,
    rows: [{
      ...decisionRow,
      implementation_approval: approvedNotApplicableDecision('implementation', {
        reason: 'The final persisted decision changed after observation.'
      })
    }]
  };
  const staleResult = deriveRequirementReadiness(
    mutatedContext.rows[0],
    { uat_required: false },
    options(stale, mutatedContext)
  );
  assert.equal(staleResult.verdict, 'BLOCKED');
  assertHasError(staleResult.blockers, /stale|context.*binding|decision.*digest|trusted.*decision/i);

  const secondDecisionRow = {
    ...structuredClone(decisionRow),
    requirement_id: 'AC-002',
    implementation_approval: approvedNotApplicableDecision('implementation', {
      decision_id: 'DEC-IMPLEMENTATION-NA-002',
      requirement_id: 'AC-002',
      reason: 'The implementation dimension does not apply to AC-002.'
    }),
    verification_approval: approvedNotApplicableDecision('verification', {
      decision_id: 'DEC-VERIFICATION-NA-002',
      requirement_id: 'AC-002',
      reason: 'The verification dimension does not apply to AC-002.'
    })
  };
  const multiContext = {
    ...context,
    requirement_ids: ['AC-001', 'AC-002'],
    rows: [decisionRow, secondDecisionRow]
  };
  const multiAuthority = await issue(multiContext);
  const multiFeature = deriveFeatureVerdict(
    multiContext.rows,
    {
      uat_required: false,
      active_requirement_ids: multiContext.requirement_ids,
      feature_lifecycle: 'active'
    },
    options(multiAuthority, multiContext)
  );
  assert.equal(multiFeature.verdict, 'NOT_APPLICABLE', multiFeature.blockers?.join('; '));
  assert.deepEqual(multiFeature.requirements.map((requirement) => requirement.verdict), [
    'NOT_APPLICABLE',
    'NOT_APPLICABLE'
  ]);
  const multiReplay = deriveFeatureVerdict(
    multiContext.rows,
    {
      uat_required: false,
      active_requirement_ids: multiContext.requirement_ids,
      feature_lifecycle: 'active'
    },
    options(multiAuthority, multiContext)
  );
  assert.equal(multiReplay.verdict, 'BLOCKED');
  assertHasError(multiReplay.blockers, /replay|consumed|one-shot|trusted.*decision/i);
  assert.equal(observations, 4);
});

test('final authorization observes and consumes not_applicable decisions inside the gate', async (t) => {
  const trusted = await createTrustedReadyFixture(t);
  const context = structuredClone(trusted.context);
  context.rows[0] = {
    ...context.rows[0],
    implementation_status: 'not_applicable',
    implementation_refs: [],
    implementation_approval: approvedNotApplicableDecision('implementation'),
    verification_status: 'not_applicable',
    verification_evidence_ids: [],
    verification_approval: approvedNotApplicableDecision('verification'),
    verdict: 'READY'
  };
  const currentState = {
    ...trusted.currentState,
    post_integration_state_digest: sha256('post-integration-state')
  };
  let observations = 0;
  const observeDecisionSet = async (request) => {
    observations += 1;
    return {
      request_digest: request.request_digest,
      decision_set_digest: request.decision_set_digest,
      final_context_digest: request.final_context_digest,
      post_integration_state_digest: request.post_integration_state_digest,
      observed_decisions: structuredClone(request.decisions)
    };
  };
  const authorization = await productProtocol.authorizeProductContext({
    repositoryRoot: trusted.repositoryRoot,
    context,
    currentState,
    observeBuildIdentity: trusted.observeBuildIdentity,
    observeAutomatedEvidence: trusted.observeAutomatedEvidence,
    observeManualUat: trusted.observeManualUat,
    observeAuditStatus: trusted.observeAuditStatus,
    executeAudit: trusted.executeAudit,
    observeDecisionSet
  });
  assert.equal(authorization.authorized, true, authorization.errors?.join('; '));
  assert.equal(authorization.decision_authority?.verified, true);
  assert.equal(observations, 1);

  const missingObserver = await productProtocol.authorizeProductContext({
    repositoryRoot: trusted.repositoryRoot,
    context,
    currentState,
    observeBuildIdentity: trusted.observeBuildIdentity,
    observeAutomatedEvidence: trusted.observeAutomatedEvidence,
    observeManualUat: trusted.observeManualUat,
    observeAuditStatus: trusted.observeAuditStatus,
    executeAudit: trusted.executeAudit
  });
  assert.equal(missingObserver.authorized, false);
  assertHasError(missingObserver.errors, /decision.*observer|decision.*authority/i);
});

test('trusted approved-spec authority is mandatory and preserves active-only rows plus template identity', async (t) => {
  const repositoryRoot = await mkdtemp(path.join(tmpdir(), 'sdcorejs-product-normative-authority-'));
  t.after(() => rm(repositoryRoot, { recursive: true, force: true }));
  const fixture = approvedSpecFixture();
  await writeApprovedSpecFixture(repositoryRoot, fixture);
  const base = completeProductContext();
  const authorityContext = completeProductContext({
    target: { ...base.target, repo_root: repositoryRoot, target_root: repositoryRoot },
    approved_spec_path: fixture.specPath,
    approved_spec_hash: fixture.approvedSpecHash,
    approved_spec_integrity_hash: fixture.approvedSpecIntegrityHash,
    approval: { ...base.approval, approval_source: 'explicit-user-choice' }
  });
  const authority = await productProtocol.verifyApprovedSpecAuthority({
    repositoryRoot,
    context: authorityContext
  });
  assert.equal(authority.verified, true, authority.errors?.join('; '));

  const input = {
    requirements: [{
      id: 'AC-RETIRED',
      text: 'Caller-authored historical requirement.',
      required: true,
      requirement_status: 'approved',
      uat_required: false
    }],
    implementation_artifacts: [],
    test_artifacts: [],
    evidence_records: [],
    uat_records: [],
    current_state: { feature_lifecycle: 'active' }
  };
  for (const candidate of [undefined, { ...authority }]) {
    const result = deriveTraceability(input, candidate === undefined ? {} : { trusted_authority: candidate });
    assert.equal(result.verdict, 'BLOCKED');
    assert.ok(result.gaps.some((gap) => gap.type === 'UNTRUSTED_NORMATIVE_INPUT' && gap.blocking === true));
    assert.deepEqual(result.rows, []);
  }

  const trusted = deriveTraceability(input, { trusted_authority: authority });
  assert.deepEqual(trusted.requirements.map((requirement) => requirement.id), ['AC-001']);
  assert.deepEqual(trusted.rows.map((row) => row.requirement_id), ['AC-001']);
  assert.equal(trusted.rows.some((row) => row.requirement_id === 'AC-RETIRED'), false);

  const template = await readFile(path.join(repoRoot, '_refs', 'product', 'templates.md'), 'utf8');
  for (const field of [
    'approved_spec_integrity_hash', 'requirement_ids', 'retired_requirement_ids',
    'approved_plan_path', 'approved_plan_hash', 'approved_plan_integrity_hash',
    'product_action_lifecycle', 'sequence_id', 'step_id', 'step_ordinal',
    'predecessor_context_digest', 'required_checkpoint', 'product_context_digest'
  ]) {
    assert.match(template, new RegExp(`(?:^|\\n)\\s*${field}:`, 'm'), `template field ${field}`);
  }
});

test('closed product layout returns exact nested schemas for success ambiguity and invalid input', () => {
  const resultKeys = ['gaps', 'layout', 'validation_errors'];
  const layoutKeys = [
    'active_candidates', 'contract_key', 'current_path', 'doc_layout',
    'history_paths', 'history_root', 'ledger_root', 'legacy_sources',
    'operations', 'product_docs', 'uat_root'
  ];
  const productDocKeys = [
    'acceptance_path', 'compact_path', 'decisions_path', 'prd_path',
    'root', 'stories_path', 'uat_path'
  ];
  const established = resolveProductLayout({
    feature_id: 'feature-invoice',
    contract_id: 'CONTRACT-001',
    existing_layout: {
      root: 'product',
      prd_path: 'product/prds/invoice.md',
      current_path: '.sdcorejs/docs/product/invoice/current.md',
      history_root: '.sdcorejs/docs/product/invoice/history',
      uat_root: '.sdcorejs/docs/product/invoice/uat'
    }
  });
  assert.deepEqual(Object.keys(established).sort(), resultKeys);
  assert.deepEqual(Object.keys(established.layout).sort(), layoutKeys);
  assert.deepEqual(Object.keys(established.layout.product_docs).sort(), productDocKeys);
  assert.equal(established.layout.doc_layout, 'existing');
  assert.deepEqual(established.gaps, []);
  assert.deepEqual(established.validation_errors, []);
  for (const operation of established.layout.operations) {
    assert.deepEqual(Object.keys(operation).sort(), ['path', 'target', 'type']);
  }

  const invalid = resolveProductLayout(null);
  assert.deepEqual(Object.keys(invalid).sort(), resultKeys);
  assert.deepEqual(Object.keys(invalid.layout).sort(), layoutKeys);
  assert.deepEqual(Object.keys(invalid.layout.product_docs).sort(), productDocKeys);
  assert.equal(invalid.layout.doc_layout, 'blocked');
  for (const field of ['contract_key', 'ledger_root', 'current_path', 'history_root', 'uat_root']) {
    assert.equal(invalid.layout[field], null, field);
  }
  assert.ok(Object.values(invalid.layout.product_docs).every((value) => value === null));
  for (const field of ['active_candidates', 'history_paths', 'legacy_sources', 'operations']) {
    assert.deepEqual(invalid.layout[field], [], field);
  }
  assert.deepEqual(invalid.gaps, []);
  assertHasError(invalid.validation_errors, /input.*object|object.*input/i);

  const ambiguous = resolveProductLayout({
    feature_id: 'feature-invoice',
    contract_id: 'CONTRACT-001',
    legacy_ledgers: [{ path: '.sdcorejs/docs/product/legacy-unknown.md' }]
  });
  assert.equal(ambiguous.layout.doc_layout, 'blocked');
  assert.ok(ambiguous.gaps.some((gap) => gap.type === 'legacy_ambiguity' && gap.blocking === true));
  assert.equal(Object.hasOwn(ambiguous.layout, 'legacy_ambiguities'), false);
});

test('causal evidence timestamps distinguish command and non-command execution forms', () => {
  assert.equal(typeof productProtocol.validateProductEvidence, 'function');

  const commandEvidence = currentEvidence();
  assert.deepEqual(productProtocol.validateProductEvidence(commandEvidence), []);
  for (const mutation of [
    { started_at: null },
    { finished_at: null },
    { exit_code: null },
    { finished_at: '2026-07-13T14:59:58.000Z' },
    { observed_at: '2026-07-13T14:59:58.000Z' }
  ]) {
    assertHasError(
      productProtocol.validateProductEvidence({ ...commandEvidence, ...mutation }),
      /command.*(?:started_at|finished_at|exit_code)|causal|precede|timestamp/i
    );
  }

  const observation = currentEvidence({
    kind: 'observation',
    command: null,
    started_at: null,
    finished_at: null,
    observed_at: '2026-07-13T15:00:00.000Z',
    observation_source: 'manual-observation',
    exit_code: null,
    outcome: 'observed',
    redaction: {
      ...currentEvidence().redaction,
      secret_scan: 'not_applicable'
    }
  });
  assert.deepEqual(productProtocol.validateProductEvidence(observation), []);
  assertHasError(
    productProtocol.validateProductEvidence({ ...observation, started_at: '2026-07-13T14:59:59.000Z' }),
    /start.*finish|both.*null|paired.*timestamp|non-command/i
  );
  assertHasError(
    productProtocol.validateProductEvidence({ ...observation, exit_code: 0 }),
    /non-command.*exit_code|exit_code.*null/i
  );
  assertHasError(
    productProtocol.validateProductEvidence({
      ...observation,
      started_at: '2026-07-13T15:00:01.000Z',
      finished_at: '2026-07-13T15:00:02.000Z',
      observed_at: '2026-07-13T15:00:00.000Z'
    }),
    /observed_at.*precede|causal/i
  );
});

test('generated executable product protocol mirrors match canonical when generated', async (t) => {
  if (process.env.SDCOREJS_SKIP_MIRROR_PARITY === '1') {
    t.skip('generated mirror parity is intentionally deferred until the parent sync step');
    return;
  }
  const canonical = path.join(repoRoot, '_refs', 'product', 'product-protocol.mjs');
  const mirrors = [
    path.join(repoRoot, '.claude', '_refs', 'product', 'product-protocol.mjs'),
    path.join(repoRoot, 'plugin', '_refs', 'product', 'product-protocol.mjs'),
    path.join(repoRoot, 'codex', 'skills', '_refs', 'product', 'product-protocol.mjs')
  ];
  const presence = await Promise.all(mirrors.map(async (file) => access(file).then(() => true, () => false)));
  if (presence.every((exists) => !exists)) {
    t.skip('generated product protocol mirrors do not exist before the first sync');
    return;
  }
  assert.ok(presence.every(Boolean), 'all executable product protocol mirrors must exist together');
  const expected = await readFile(canonical);
  for (const mirror of mirrors) assert.deepEqual(await readFile(mirror), expected, mirror);
});
