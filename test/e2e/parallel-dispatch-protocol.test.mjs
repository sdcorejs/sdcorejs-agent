import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { access, cp, mkdtemp, mkdir, readFile, rename, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import * as parallelProtocol from '../../_refs/orchestration/parallel-protocol.mjs';
import {
  hashApprovedSnapshot,
  hashApprovedSnapshotIntegrity
} from '../../_refs/shared/approved-plan-integrity.mjs';
import {
  applyStateEvent,
  assignRepair,
  classifyTopology,
  createEvidence,
  createOwnershipManifestDigest,
  integrateResults,
  invalidateForContractRevision,
  planWaves,
  runUnitsWithPolicy,
  runUnitWithPolicy,
  validateContract,
  validateDispatchContext,
  validateEvidence,
  validatePathBoundary,
  validateResultIdentity,
  validateRuntimeCapabilities,
  validateWorkspaceAssignment,
  validateWorkingTree
} from '../../_refs/orchestration/parallel-protocol.mjs';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const approvedSnapshot = (frontmatter, body) => `---\n${frontmatter.trim()}\n---\n${body}`;

const runGit = (cwd, ...args) => execFileSync('git', args, {
  cwd,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe']
}).trim();
const cleanupTree = (target) => rm(target, {
  recursive: true,
  force: true,
  maxRetries: 10,
  retryDelay: 100
});

async function initGitRepository(t, prefix, { cleanup = true } = {}) {
  const repositoryRoot = await mkdtemp(path.join(os.tmpdir(), prefix));
  if (cleanup) t.after(() => cleanupTree(repositoryRoot));
  runGit(repositoryRoot, 'init');
  runGit(repositoryRoot, 'config', 'user.email', 'parallel-protocol@example.com');
  runGit(repositoryRoot, 'config', 'user.name', 'Parallel Protocol Test');
  await writeFile(path.join(repositoryRoot, 'README.md'), '# fixture\n');
  runGit(repositoryRoot, 'add', 'README.md');
  runGit(repositoryRoot, 'commit', '-m', 'fixture baseline');
  return repositoryRoot;
}

async function trustedOwnershipFixture(t, units, {
  expectedVerified = true,
  frozenTransform = (value) => value,
  planAllowedPaths,
  repositoryRoot: providedRepositoryRoot,
  cleanup = true,
  revision = 1,
  supersedes = null
} = {}) {
  assert.equal(
    typeof parallelProtocol.verifyApprovedOwnershipAuthority,
    'function',
    'parallel protocol must expose a file-backed ownership authority verifier'
  );
  const repositoryRoot = providedRepositoryRoot ?? await initGitRepository(t, 'sdcorejs-parallel-authority-', { cleanup });
  const targetRoot = repositoryRoot.replaceAll('\\', '/');
  const artifactId = `contract-r${revision}`;
  const specPath = `.sdcorejs/specs/workflow/${artifactId}.md`;
  const planPath = `.sdcorejs/plans/workflow/${artifactId}.md`;
  const frozenContractPath = `.sdcorejs/plans/workflow/${artifactId}.parallel.json`;
  const ownershipManifestDigest = createOwnershipManifestDigest(units);
  const frozenPayload = frozenTransform({
    schema_version: 2,
    contract_id: 'C1',
    revision,
    supersedes,
    ownership_manifest_digest: ownershipManifestDigest,
    units: units.map((unit) => ({ id: unit.id, ownership: unit.ownership }))
  });
  const frozenText = `${JSON.stringify(frozenPayload, null, 2)}\n`;
  const frozenContractHash = sha256(frozenText);

  const specBodyPending = `# Approved Spec\n\n\`\`\`yaml\nspec_context:\n  contract_id: C1\n  requirement_revision: 1\n  requirement_ids:\n    - AC-001\n  approved_spec_path: ${specPath}\n  approved_spec_hash: <pending-spec-hash>\n\`\`\`\n`;
  const specPending = approvedSnapshot(`
name: parallel-contract
contract_id: C1
requirement_revision: 1
requirement_ids:
  - AC-001
approved_spec_hash: <pending-spec-hash>
approved_spec_integrity_hash: <pending-spec-integrity-hash>
approvedAt: 2026-07-14T00:00:00.000Z
approvedBy: product-owner
approval_source: explicit-user-choice`, specBodyPending);
  const specHash = hashApprovedSnapshot(specPending, 'approved_spec_hash');
  const specWithHash = specPending.replaceAll('<pending-spec-hash>', specHash);
  const specIntegrityHash = hashApprovedSnapshotIntegrity(specWithHash, 'approved_spec_integrity_hash');
  const specText = specWithHash.replaceAll('<pending-spec-integrity-hash>', specIntegrityHash);
  const allowedPaths = [...new Set(planAllowedPaths ?? units.flatMap((unit) => unit.ownership.allowed_paths))].sort();
  const allowedYaml = allowedPaths.map((item) => `    - ${item}`).join('\n');
  const allowedFrontmatter = allowedPaths.map((item) => `  - ${item}`).join('\n');
  const planBodyPending = `# Approved Plan\n\n\`\`\`yaml\nplan_context:\n  contract_id: C1\n  requirement_revision: 1\n  requirement_ids:\n    - AC-001\n  approved_spec_path: ${specPath}\n  approved_spec_hash: ${specHash}\n  approved_spec_integrity_hash: ${specIntegrityHash}\n  approved_plan_path: ${planPath}\n  approved_plan_hash: <pending-plan-hash>\n  source: sdcorejs-plan\n  target_root: ${targetRoot}\n  target_root_kind: target-project\n  track: workflow\n  stack_profile: general\n  product_action_authority:\n    schema_version: 1\n    mode: none\n    purpose: none\n    sequence_id: null\n    steps: []\n    terminal_step_id: null\n  task_count: 1\n  phase_count: 1\n  allowed_paths:\n${allowedYaml}\n  prohibited_paths:\n    - .git/**\n  generated_artifacts: []\n  docs_artifacts: []\n  dependency_changes:\n    required: false\n    packages: []\n    approval_required: false\n  env_changes:\n    required: false\n    files: []\n    approval_required: false\n  migration_changes:\n    required: false\n    description: null\n    approval_required: false\n  frontend_architecture:\n    required: false\n    not_applicable_reason: parallel protocol fixture\n  verification_strategy:\n    package_manager: npm\n    scripts_detected: []\n    commands_planned:\n      - command_or_script: node --test test/e2e/parallel-dispatch-protocol.test.mjs\n        reason: validate the parallel protocol fixture\n    commands_skipped: []\n    focused_checks:\n      - parallel protocol regression\n    broad_checks:\n      - parallel e2e suite\n  finish_tail:\n    docs_before_final_branch_ready: true\n    verify_before_done: true\n    branch_ready_final_gate: true\n    no_writes_after_branch_ready: true\n  frozen_contract_path: ${frozenContractPath}\n  frozen_contract_hash: ${frozenContractHash}\n  ownership_manifest_digest: ${ownershipManifestDigest}\n  parallel_contract_revision: ${revision}\n  parallel_contract_supersedes: ${supersedes ?? 'null'}\n\`\`\`\n`;
  const planPending = approvedSnapshot(`
name: parallel-plan
contract_id: C1
track: workflow
target_root_kind: target-project
stack_profile: general
taskCount: 1
phaseCount: 1
requirement_revision: 1
requirement_ids:
  - AC-001
sourceSpecPath: ${specPath}
approved_spec_hash: ${specHash}
approved_spec_integrity_hash: ${specIntegrityHash}
approvedAt: 2026-07-14T00:05:00.000Z
approvedBy: product-owner
approval_source: explicit-user-choice
allowed_paths:
${allowedFrontmatter}
prohibited_paths:
  - .git/**
dependency_changes:
  required: false
  approval_required: false
env_changes:
  required: false
  approval_required: false
migration_changes:
  required: false
  approval_required: false
frozen_contract_path: ${frozenContractPath}
frozen_contract_hash: ${frozenContractHash}
ownership_manifest_digest: ${ownershipManifestDigest}
parallel_contract_revision: ${revision}
parallel_contract_supersedes: ${supersedes ?? 'null'}
approved_plan_hash: <pending-plan-hash>
approved_plan_integrity_hash: <pending-plan-integrity-hash>`, planBodyPending);
  const approvedPlanHash = hashApprovedSnapshot(planPending, 'approved_plan_hash');
  const planWithHash = planPending.replaceAll('<pending-plan-hash>', approvedPlanHash);
  const approvedPlanIntegrityHash = hashApprovedSnapshotIntegrity(planWithHash, 'approved_plan_integrity_hash');
  const planText = planWithHash.replaceAll('<pending-plan-integrity-hash>', approvedPlanIntegrityHash);
  const planContext = {
    contract_id: 'C1',
    requirement_revision: 1,
    requirement_ids: ['AC-001'],
    approved_spec_path: specPath,
    approved_spec_hash: specHash,
    approved_spec_integrity_hash: specIntegrityHash,
    approved_plan_path: planPath,
    approved_plan_hash: approvedPlanHash,
    approved_plan_integrity_hash: approvedPlanIntegrityHash,
    source: 'sdcorejs-plan',
    target_root: targetRoot,
    target_root_kind: 'target-project',
    track: 'workflow',
    stack_profile: 'general',
    product_action_authority: {
      schema_version: 1,
      mode: 'none',
      purpose: 'none',
      sequence_id: null,
      steps: [],
      terminal_step_id: null
    },
    task_count: 1,
    phase_count: 1,
    allowed_paths: allowedPaths,
    prohibited_paths: ['.git/**'],
    generated_artifacts: [],
    docs_artifacts: [],
    dependency_changes: { required: false, packages: [], approval_required: false },
    env_changes: { required: false, files: [], approval_required: false },
    migration_changes: { required: false, description: null, approval_required: false },
    frontend_architecture: { required: false, not_applicable_reason: 'parallel protocol fixture' },
    verification_strategy: {
      package_manager: 'npm',
      scripts_detected: [],
      commands_planned: [{
        command_or_script: 'node --test test/e2e/parallel-dispatch-protocol.test.mjs',
        reason: 'validate the parallel protocol fixture'
      }],
      commands_skipped: [],
      focused_checks: ['parallel protocol regression'],
      broad_checks: ['parallel e2e suite']
    },
    finish_tail: {
      docs_before_final_branch_ready: true,
      verify_before_done: true,
      branch_ready_final_gate: true,
      no_writes_after_branch_ready: true
    },
    frozen_contract_path: frozenContractPath,
    frozen_contract_hash: frozenContractHash,
    ownership_manifest_digest: ownershipManifestDigest,
    parallel_contract_revision: revision,
    parallel_contract_supersedes: supersedes
  };
  const contract = {
    source: 'approved-plan', contract_id: 'C1', approved_plan_path: planPath,
    approved_plan_hash: approvedPlanHash, frozen_contract_path: frozenContractPath,
    frozen_contract_hash: frozenContractHash, ownership_manifest_digest: ownershipManifestDigest,
    revision, supersedes
  };

  for (const relativePath of [specPath, planPath, frozenContractPath]) {
    await mkdir(path.dirname(path.join(repositoryRoot, relativePath)), { recursive: true });
  }
  await writeFile(path.join(repositoryRoot, specPath), specText);
  await writeFile(path.join(repositoryRoot, planPath), planText);
  await writeFile(path.join(repositoryRoot, frozenContractPath), frozenText);
  const authority = await parallelProtocol.verifyApprovedOwnershipAuthority({
    repositoryRoot,
    contract,
    units,
    approvedSpecPath: specPath,
    planContext
  });
  assert.equal(authority.verified, expectedVerified, authority.errors?.join('\n'));
  return {
    authority,
    contract,
    repositoryRoot,
    approvedSpecPath: specPath,
    frozenContractPath,
    planContext,
    units
  };
}

const baseCapabilities = {
  runtime: 'test', supports_subagents: true, supports_parallel_dispatch: true,
  supports_agent_cwd: true, supports_native_worktree: true, supports_result_ref: true,
  supports_timeout: true, supports_cancellation: true, effective_max_concurrency: 4
};

const approvedContract = {
  source: 'approved-plan', contract_id: 'C1', approved_plan_path: '.sdcorejs/plans/p.md',
  approved_plan_hash: 'plan-hash', frozen_contract_path: '.sdcorejs/plans/p.parallel.yml',
  frozen_contract_hash: 'contract-hash', ownership_manifest_digest: createOwnershipManifestDigest([]),
  revision: 1, supersedes: null
};

const parentPathPass = (unit) => ({ status: 'PASS', associated_head_or_diff: unit.result.associated_head_or_diff, changed_paths: unit.result.changed_paths });
const parentReviewPass = (unit) => ({ status: 'PASS', associated_head_or_diff: unit.result.associated_head_or_diff, blockers: [] });
const globalPass = async ({ repository_state_digest } = {}) => ({
  status: 'PASS',
  associated_head_or_diff: 'integrated-head',
  repository_state_digest,
  output_digest: 'global-digest'
});
const readIntegratedState = async () => 'integrated-head';
const checkpointPass = async () => 'checkpoint';
const rollbackUnitPass = async () => {};
const attestIntegrationDecision = async (decision) => {
  const approved = { ...decision, approved: true };
  return {
    ...approved,
    decision_attestation: parallelProtocol.createIntegrationDecisionAttestation(approved)
  };
};

const validProductUnit = (id, productStageId, allowedPath) => ({
  id,
  product_stage_id: productStageId,
  status: 'PASSED',
  contract_hash: 'contract-hash',
  workspace: {
    strategy: 'worktree', path: `/wt/${id}`, branch: `unit/${id}`, base_head: 'abc'
  },
  ownership: { allowed_paths: [allowedPath], prohibited_paths: [] },
  verification: { command: 'npm test', cwd: `/wt/${id}` },
  result: {
    type: 'commit', ref: `${id}-ref`, base_head: 'abc', associated_head_or_diff: `${id}-head`,
    output_digest: `${id}-result-digest`, changed_paths: [], contract_hash: 'contract-hash'
  },
  evidence: {
    status: 'PASS', parent_validated: true, associated_head_or_diff: `${id}-head`,
    result_output_digest: `${id}-result-digest`, output_digest: `${id}-evidence-digest`,
    contract_hash: 'contract-hash'
  }
});

const validProductFlow = () => ({
  contract_id: 'C1', frozen_contract_hash: 'contract-hash', validation_phase: 'completed', post_sync_state: 'post-sync', final_evidence_state: 'post-sync',
  stages: [
    { id: 'seed', action: 'seed-from-approved-spec', depends_on: [], owner: 'product', contract_hash: 'contract-hash', write_policy: 'allow' },
    { id: 'backend', unit_id: 'backend-unit', action: 'implementation', depends_on: ['seed'], owner: 'backend', contract_hash: 'contract-hash', write_policy: 'allow', status: 'PASS', result_identity: 'backend-unit-head', output_digest: 'backend-unit-result-digest', evidence_digest: 'backend-unit-evidence-digest' },
    { id: 'frontend', unit_id: 'frontend-unit', action: 'implementation', depends_on: ['seed'], owner: 'frontend', contract_hash: 'contract-hash', write_policy: 'allow', status: 'PASS', result_identity: 'frontend-unit-head', output_digest: 'frontend-unit-result-digest', evidence_digest: 'frontend-unit-evidence-digest' },
    { id: 'test', unit_id: 'test-unit', action: 'test-evidence', depends_on: ['backend', 'frontend'], owner: 'test', contract_hash: 'contract-hash', write_policy: 'allow', status: 'PASS', result_identity: 'test-unit-head', output_digest: 'test-unit-result-digest', evidence_digest: 'test-unit-evidence-digest' },
    { id: 'fan-in', action: 'integration-fan-in', depends_on: ['backend', 'frontend', 'test'], owner: 'parent', contract_hash: 'contract-hash', write_policy: 'allow' },
    { id: 'write-tail', action: 'write-tail-complete', depends_on: ['fan-in'], owner: 'parent', contract_hash: 'contract-hash', write_policy: 'allow' },
    { id: 'sync', action: 'traceability-sync', depends_on: ['write-tail'], owner: 'integration', contract_hash: 'contract-hash', write_policy: 'allow', consumes_integrated_paths: true, consumes_test_evidence: true, allowed_paths: ['.sdcorejs/docs/product/c1/**'] },
    { id: 'global-verification', action: 'global-verification', depends_on: ['sync'], owner: 'parent', contract_hash: 'contract-hash', write_policy: 'deny', status: 'PASS', associated_head_or_diff: 'post-sync', output_digest: 'global-digest' },
    { id: 'audit', action: 'audit-readonly', depends_on: ['global-verification'], owner: 'parent', contract_hash: 'contract-hash', write_policy: 'deny', before_status_digest: 'status-v1', after_status_digest: 'status-v1', actual_writes: [] },
    { id: 'ship', action: 'ship', depends_on: ['audit'], owner: 'parent', contract_hash: 'contract-hash', write_policy: 'deny', consumes_product_action: 'audit-readonly' }
  ]
});

const validProductDispatchContext = () => {
  const context = {
    schema_version: 2,
    contract: structuredClone(approvedContract),
  working_tree: {
    repo_root: '/repo', current_branch: 'feature', current_head: 'abc',
    status_snapshot_hash: 'status', dirty_diff_hash: 'diff', staged_paths: [],
    unstaged_paths: [], untracked_paths: [], unrelated_dirty_paths: [],
    user_dirty_tree_decision: 'clean'
  },
  runtime_capabilities: baseCapabilities,
  integration: {
    workspace_path: '/wt/integration', branch: 'integration', base_head: 'abc',
    merge_strategy: 'cherry-pick', merge_order: ['backend-unit', 'frontend-unit', 'test-unit'], atomicity: 'all-or-nothing',
    rollback_strategy: 'restore-base'
  },
  units: [
    validProductUnit('backend-unit', 'backend', 'backend/**'),
    validProductUnit('frontend-unit', 'frontend', 'frontend/**'),
    validProductUnit('test-unit', 'test', 'test/**')
  ],
  final_tail: {
    verify_before_done: true,
    branch_ready_final_gate: true,
    no_writes_after_branch_ready: true
  },
    product_flow: validProductFlow()
  };
  context.contract.ownership_manifest_digest = createOwnershipManifestDigest(context.units);
  return context;
};

function simpleWriteContext(contract, units, repositoryRoot = '/repo') {
  return {
    schema_version: 2,
    contract,
    working_tree: {
      repo_root: repositoryRoot, current_branch: 'feature', current_head: 'abc',
      status_snapshot_hash: 'status', dirty_diff_hash: 'diff', staged_paths: [],
      unstaged_paths: [], untracked_paths: [], unrelated_dirty_paths: [],
      user_dirty_tree_decision: 'clean'
    },
    runtime_capabilities: baseCapabilities,
    integration: {
      workspace_path: '/wt/integration', branch: 'integration', base_head: 'abc',
      merge_strategy: 'cherry-pick', merge_order: units.map((unit) => unit.id),
      atomicity: 'all-or-nothing', rollback_strategy: 'restore-base'
    },
    units,
    final_tail: {
      verify_before_done: true,
      branch_ready_final_gate: true,
      no_writes_after_branch_ready: true
    }
  };
}

function bindApprovedContext(context, fixture) {
  context.contract = fixture.contract;
  if (context.working_tree) context.working_tree.repo_root = fixture.repositoryRoot;
  for (const unit of context.units ?? []) {
    unit.contract_hash = fixture.contract.frozen_contract_hash;
    if (unit.result) unit.result.contract_hash = fixture.contract.frozen_contract_hash;
    if (unit.evidence) unit.evidence.contract_hash = fixture.contract.frozen_contract_hash;
  }
  if (context.product_flow) {
    context.product_flow.frozen_contract_hash = fixture.contract.frozen_contract_hash;
    for (const stage of context.product_flow.stages ?? []) stage.contract_hash = fixture.contract.frozen_contract_hash;
  }
  return context;
}

async function materializeContextWorkspaces(context, repositoryRoot) {
  const workspaceRoot = path.join(repositoryRoot, '.worktrees');
  context.integration.workspace_path = path.join(workspaceRoot, 'integration');
  await mkdir(context.integration.workspace_path, { recursive: true });
  for (const unit of context.units ?? []) {
    unit.workspace.path = path.join(workspaceRoot, unit.id);
    unit.verification.cwd = unit.workspace.path;
    await mkdir(unit.workspace.path, { recursive: true });
  }
}

async function reissueAuthority(fixture, units = fixture.units) {
  return parallelProtocol.verifyApprovedOwnershipAuthority({
    repositoryRoot: fixture.repositoryRoot,
    contract: fixture.contract,
    units,
    approvedSpecPath: fixture.approvedSpecPath,
    planContext: fixture.planContext
  });
}

function inferMergeStrategy(units) {
  const type = units.find((unit) => unit?.result?.type)?.result?.type;
  return { commit: 'cherry-pick', patch: 'patch', 'working-tree-diff': 'disjoint-same-tree' }[type] ?? 'cherry-pick';
}

async function prepareFanIn(t, input) {
  const repositoryRoot = input.repositoryRoot ?? await initGitRepository(t, 'sdcorejs-trusted-fanin-');
  const units = input.units;
  for (const unit of units) {
    if (!unit || typeof unit !== 'object' || Array.isArray(unit)) continue;
    const reportedPaths = Array.isArray(unit.result?.changed_paths)
      ? unit.result.changed_paths.filter((item) => typeof item === 'string' && item.trim())
      : [];
    unit.ownership ??= {
      allowed_paths: reportedPaths.length > 0 ? [...new Set(reportedPaths)] : ['fixture/**'],
      prohibited_paths: ['.git/**']
    };
  }
  const planAllowedPaths = [...new Set(units.flatMap((unit) => unit?.ownership?.allowed_paths ?? []))].sort();
  const fixture = await trustedOwnershipFixture(t, units, { repositoryRoot, planAllowedPaths });
  for (const unit of units) {
    if (!unit || typeof unit !== 'object' || Array.isArray(unit)) continue;
    unit.contract_hash = fixture.contract.frozen_contract_hash;
    if (unit.result && typeof unit.result === 'object' && !Array.isArray(unit.result)) {
      unit.result.contract_hash = fixture.contract.frozen_contract_hash;
    }
  }
  const integration = {
    workspace_path: path.join(repositoryRoot, '.worktrees', 'integration'),
    branch: 'integration',
    merge_strategy: inferMergeStrategy(units),
    ...input.integration
  };
  const fanInAuthority = await parallelProtocol.verifyFanInAuthority({
    repositoryRoot,
    contract: fixture.contract,
    units,
    integration,
    approvedSpecPath: fixture.approvedSpecPath,
    planContext: fixture.planContext
  });
  assert.equal(fanInAuthority.verified, true, fanInAuthority.errors?.join('\n'));
  return { repositoryRoot, units, integration, fixture, fanInAuthority };
}

async function integrateWithAuthority(t, input) {
  const prepared = await prepareFanIn(t, input);
  const result = await integrateResults({
    ...input,
    repositoryRoot: prepared.repositoryRoot,
    contract: prepared.fixture.contract,
    fanInAuthority: prepared.fanInAuthority,
    units: prepared.units,
    integration: prepared.integration
  });
  return { ...prepared, result };
}

test('skill invokes a distributed deterministic protocol validator', async () => {
  const skill = await readFile(new URL('../../skills/orchestration/parallel-dispatch.md', import.meta.url), 'utf8');
  const packageJson = JSON.parse(await readFile(new URL('../../package.json', import.meta.url), 'utf8'));

  assert.ok(packageJson.files.includes('_refs'));
  assert.match(skill, /_refs\/orchestration\/parallel-protocol\.mjs/);
});

test('long protocol reference exposes a top-of-file contents map', async () => {
  const protocol = await readFile(new URL('../../_refs/orchestration/parallel-protocol.md', import.meta.url), 'utf8');
  assert.match(protocol.slice(0, 2000), /contents|table of contents/i);
});

test('protocol v2 validates distinct approved-plan and read-only contracts', () => {
  assert.deepEqual(validateContract(approvedContract, { writeCapable: true }), []);
  assert.match(validateContract({ ...approvedContract, approved_plan_hash: '' }, { writeCapable: true })[0], /approved_plan_hash/);
  assert.match(validateContract({ ...approvedContract, request_hash: 'fake', write_policy: 'deny' }).join('\n'), /must not define request_hash.*write_policy/s);
  assert.deepEqual(validateContract({ source: 'read-only-request', request_hash: 'r', scope_hash: 's', write_policy: 'deny' }), []);
  assert.match(validateContract({ source: 'read-only-request', request_hash: 'r', scope_hash: 's', write_policy: 'allow' })[0], /write_policy/);
  assert.match(validateContract({ source: 'read-only-request', request_hash: 'r', scope_hash: 's', write_policy: 'deny' }, { writeCapable: true })[0], /approved plan/);
  assert.match(validateContract({ source: 'read-only-request', request_hash: 'r', scope_hash: 's', write_policy: 'deny', contract_id: 'fake', frozen_contract_hash: 'fake' }).join('\n'), /must not define contract_id.*frozen_contract_hash/s);
});

test('read-only dispatch proves zero writes with equal before and after state', async (t) => {
  const repositoryRoot = await initGitRepository(t, 'sdcorejs-readonly-equal-');
  const contract = { source: 'read-only-request', request_hash: 'request', scope_hash: 'scope', write_policy: 'deny' };
  const observed = await parallelProtocol.observeReadOnlyExecution({
    repositoryRoot,
    contract,
    unitId: 'audit',
    execute: async () => ({ type: 'report', changed_paths: [] })
  });
  const readOnlyContext = {
    schema_version: 2,
    contract,
    working_tree: { repo_root: repositoryRoot },
    runtime_capabilities: baseCapabilities,
    units: [{
      id: 'audit',
      workspace: { strategy: 'shared-readonly' },
      ownership: { allowed_paths: [], prohibited_paths: [] },
      result: observed.result,
      read_only_proof: observed.proof
    }]
  };
  assert.deepEqual(await parallelProtocol.validateReadOnlyDispatchContext(readOnlyContext), []);

  const mutated = {
    ...readOnlyContext,
    units: [{
      ...readOnlyContext.units[0],
      result: { type: 'report', changed_paths: ['src/changed.ts'] }
    }]
  };
  assert.match(
    validateDispatchContext(mutated).join('\n'),
    /read-only.*changed|result binding|zero writes|changed paths|one-shot|trusted.*proof/i
  );
});

test('approved-plan contracts require complete frozen-contract identity', () => {
  const errors = validateContract({
    source: 'approved-plan',
    contract_id: 'C1',
    approved_plan_path: '.sdcorejs/plans/p.md',
    approved_plan_hash: 'plan-hash'
  }, { writeCapable: true });

  assert.match(errors.join('\n'), /frozen_contract_path/);
  assert.match(errors.join('\n'), /frozen_contract_hash/);
  assert.match(errors.join('\n'), /revision/);
  assert.match(errors.join('\n'), /supersedes/);
});

test('contract revisions and hash mismatches stale affected results and evidence', () => {
  const units = [{ id: 'u1', contract_hash: 'old', status: 'PASSED', evidence: { valid: true } }];
  const revised = invalidateForContractRevision(units, { oldHash: 'old', newHash: 'new', revision: 2 });
  assert.equal(revised[0].status, 'STALE');
  assert.equal(revised[0].evidence.valid, false);
});

test('write dispatch requires working-tree, workspace, base, result, verification, and final-tail identity', async (t) => {
  const context = {
    schema_version: 2,
    contract: structuredClone(approvedContract),
    working_tree: { repo_root: '/repo', current_branch: 'feature', current_head: 'abc', status_snapshot_hash: 's', dirty_diff_hash: 'd', staged_paths: [], unstaged_paths: [], untracked_paths: [], unrelated_dirty_paths: [], user_dirty_tree_decision: 'clean' },
    runtime_capabilities: baseCapabilities,
    integration: { workspace_path: '/wt/integration', branch: 'integration', base_head: 'abc', merge_strategy: 'cherry-pick', merge_order: ['u1'], atomicity: 'all-or-nothing', rollback_strategy: 'restore-base' },
    units: [{ id: 'u1', contract_hash: 'contract-hash', workspace: { strategy: 'worktree', path: '/wt/u1', branch: 'unit/u1', base_head: 'abc' }, ownership: { allowed_paths: ['src/a/**'], prohibited_paths: [] }, verification: { command: 'npm test', cwd: '/wt/u1' }, result: { type: 'commit', ref: null, associated_head_or_diff: null, changed_paths: [], contract_hash: 'contract-hash' } }],
    final_tail: { verify_before_done: true, branch_ready_final_gate: true, no_writes_after_branch_ready: true }
  };
  const fixture = await trustedOwnershipFixture(t, context.units);
  bindApprovedContext(context, fixture);
  await materializeContextWorkspaces(context, fixture.repositoryRoot);
  assert.deepEqual(await parallelProtocol.validateDispatchContextWithAuthority(context, { approvedOwnershipAuthority: fixture.authority }), []);
  const broken = structuredClone(context);
  delete broken.units[0].workspace.base_head;
  broken.final_tail.verify_before_done = false;
  assert.match(validateDispatchContext(broken).join('\n'), /base_head.*verify_before_done/s);

  const unsafe = structuredClone(context);
  unsafe.working_tree.expected_branch = 'other';
  unsafe.working_tree.expected_head = 'def';
  unsafe.working_tree.unrelated_dirty_paths = ['outside.txt'];
  unsafe.working_tree.user_dirty_tree_decision = null;
  unsafe.units[0].workspace.strategy = 'bogus';
  assert.match(validateDispatchContext(unsafe).join('\n'), /branch mismatch.*HEAD mismatch.*unrelated dirty.*workspace strategy/s);

  const missingIntegration = structuredClone(context);
  delete missingIntegration.integration;
  assert.match(validateDispatchContext(missingIntegration).join('\n'), /integration requires/);
  const sharedIntegrationPath = structuredClone(context);
  sharedIntegrationPath.integration.workspace_path = sharedIntegrationPath.units[0].workspace.path;
  assert.match(validateDispatchContext(sharedIntegrationPath).join('\n'), /separate from integration workspace/);
  const invalidIntegration = structuredClone(context);
  invalidIntegration.integration.merge_strategy = 'banana';
  invalidIntegration.integration.atomicity = 'banana';
  invalidIntegration.integration.merge_order = [];
  assert.match(validateDispatchContext(invalidIntegration).join('\n'), /merge_strategy.*atomicity.*merge_order/s);
  const incompatibleStrategy = structuredClone(context);
  incompatibleStrategy.units[0].result.type = 'patch';
  assert.match(validateDispatchContext(incompatibleStrategy).join('\n'), /incompatible/);
});

test('approved-plan write units and their result or evidence bind to the outer frozen contract hash', () => {
  const context = validProductDispatchContext();

  const staleUnit = structuredClone(context);
  staleUnit.units[0].contract_hash = 'stale-hash';
  assert.match(validateDispatchContext(staleUnit).join('\n'), /unit backend-unit contract_hash.*outer frozen_contract_hash/i);

  const staleResult = structuredClone(context);
  staleResult.units[0].result.contract_hash = 'stale-hash';
  assert.match(validateDispatchContext(staleResult).join('\n'), /unit backend-unit result contract_hash.*outer frozen_contract_hash/i);

  const staleEvidence = structuredClone(context);
  staleEvidence.units[0].evidence.contract_hash = 'stale-hash';
  assert.match(validateDispatchContext(staleEvidence).join('\n'), /unit backend-unit evidence contract_hash.*outer frozen_contract_hash/i);
});

test('product lifecycle stages and actual dispatch units require a bidirectional one-to-one binding', () => {
  const context = validProductDispatchContext();

  const missingPhase = structuredClone(context);
  delete missingPhase.product_flow.validation_phase;
  assert.match(validateDispatchContext(missingPhase).join('\n'), /validation_phase.*preflight.*completed/i);

  const unboundUnit = structuredClone(context);
  delete unboundUnit.units[0].product_stage_id;
  assert.match(validateDispatchContext(unboundUnit).join('\n'), /unit backend-unit requires product_stage_id/i);

  const mismatchedStage = structuredClone(context);
  mismatchedStage.product_flow.stages.find((stage) => stage.id === 'backend').unit_id = 'frontend-unit';
  assert.match(validateDispatchContext(mismatchedStage).join('\n'), /backend-unit.*bidirectional|backend.*unit_id.*actual unit/i);

  const syntheticImplementation = structuredClone(context);
  syntheticImplementation.units = syntheticImplementation.units.filter((unit) => unit.id !== 'backend-unit');
  syntheticImplementation.integration.merge_order = syntheticImplementation.integration.merge_order.filter((id) => id !== 'backend-unit');
  assert.match(validateDispatchContext(syntheticImplementation).join('\n'), /implementation stage backend.*actual unit/i);

  const syntheticTest = structuredClone(context);
  delete syntheticTest.product_flow.stages.find((stage) => stage.id === 'test').unit_id;
  assert.match(validateDispatchContext(syntheticTest).join('\n'), /test-evidence stage test.*unit_id.*actual unit/i);
});

test('completed product lifecycle rejects never-run unit placeholders and unbound stage evidence', () => {
  const context = validProductDispatchContext();
  context.product_flow.validation_phase = 'completed';
  const backendUnit = context.units.find((unit) => unit.id === 'backend-unit');
  backendUnit.status = 'PENDING';
  backendUnit.result.ref = null;
  backendUnit.result.associated_head_or_diff = null;
  backendUnit.result.output_digest = null;
  backendUnit.evidence = { contract_hash: 'contract-hash' };
  const backendStage = context.product_flow.stages.find((stage) => stage.id === 'backend');
  delete backendStage.status;
  delete backendStage.result_identity;
  delete backendStage.output_digest;
  delete backendStage.evidence_digest;

  const errors = validateDispatchContext(context);

  assert.match(errors.join('\n'), /completed.*backend-unit.*PASSED|backend-unit.*completed.*PASSED/i);
  assert.match(errors.join('\n'), /backend.*result identity|backend-unit.*result identity/i);
  assert.match(errors.join('\n'), /backend.*parent-validated evidence|backend-unit.*parent-validated evidence/i);

  const preflightBypass = validProductDispatchContext();
  preflightBypass.product_flow.validation_phase = 'preflight';
  assert.match(
    validateDispatchContext(preflightBypass).join('\n'),
    /preflight.*completion|completion.*preflight|preflight.*PASS/i
  );
});

test('product lifecycle accepts a claim-free preflight but keeps completed validation strict', async (t) => {
  const context = validProductDispatchContext();
  const fixture = await trustedOwnershipFixture(t, context.units);
  context.contract = fixture.contract;
  context.working_tree.repo_root = fixture.repositoryRoot;
  context.product_flow.validation_phase = 'preflight';
  context.product_flow.frozen_contract_hash = fixture.contract.frozen_contract_hash;
  for (const unit of context.units) {
    unit.contract_hash = fixture.contract.frozen_contract_hash;
    unit.status = 'PENDING';
    unit.result = {
      ...unit.result,
      ref: null,
      associated_head_or_diff: null,
      output_digest: null,
      contract_hash: fixture.contract.frozen_contract_hash
    };
    delete unit.evidence;
  }
  for (const stage of context.product_flow.stages) {
    stage.contract_hash = fixture.contract.frozen_contract_hash;
    delete stage.status;
    delete stage.result_identity;
    delete stage.associated_head_or_diff;
    delete stage.output_digest;
    delete stage.evidence_digest;
    delete stage.before_status_digest;
    delete stage.after_status_digest;
    delete stage.actual_writes;
  }
  await materializeContextWorkspaces(context, fixture.repositoryRoot);

  assert.deepEqual(
    await parallelProtocol.validateDispatchContextWithAuthority(context, { approvedOwnershipAuthority: fixture.authority }),
    []
  );
});

test('write dispatch binds normalized ownership to the trusted frozen outer contract', async (t) => {
  const context = validProductDispatchContext();
  const fixture = await trustedOwnershipFixture(t, context.units);
  bindApprovedContext(context, fixture);
  await materializeContextWorkspaces(context, fixture.repositoryRoot);
  assert.deepEqual(await parallelProtocol.validateDispatchContextWithAuthority(context, { approvedOwnershipAuthority: fixture.authority }), []);
  context.units[0].ownership.allowed_paths = ['**'];

  assert.match(validateDispatchContext(context, { approvedOwnershipAuthority: fixture.authority }).join('\n'), /ownership manifest digest/i);
});

test('write dispatch requires a file-backed approved ownership authority that callers cannot self-sign', async (t) => {
  const units = [{
    id: 'u1',
    contract_hash: 'pending',
    workspace: { strategy: 'worktree', path: '/wt/u1', branch: 'unit/u1', base_head: 'abc' },
    ownership: { allowed_paths: ['src/approved/**'], prohibited_paths: ['.git/**'] },
    verification: { command: 'npm test', cwd: '/wt/u1' },
    result: {
      type: 'commit', ref: null, associated_head_or_diff: null, changed_paths: [],
      contract_hash: 'pending'
    }
  }];
  const fixture = await trustedOwnershipFixture(t, units);
  units[0].contract_hash = fixture.contract.frozen_contract_hash;
  units[0].result.contract_hash = fixture.contract.frozen_contract_hash;
  const context = simpleWriteContext(fixture.contract, units, fixture.repositoryRoot);
  await materializeContextWorkspaces(context, fixture.repositoryRoot);

  assert.deepEqual(
    await parallelProtocol.validateDispatchContextWithAuthority(context, { approvedOwnershipAuthority: fixture.authority }),
    []
  );
  assert.match(
    validateDispatchContext(context, { approvedOwnershipAuthority: { verified: true } }).join('\n'),
    /trusted.*ownership authority|ownership authority.*trusted/i
  );

  const widenedAuthority = await reissueAuthority(fixture, units);
  const widened = structuredClone(context);
  widened.units[0].ownership.allowed_paths = ['**'];
  widened.contract.ownership_manifest_digest = createOwnershipManifestDigest(widened.units);
  assert.match(
    (await parallelProtocol.validateDispatchContextWithAuthority(widened, { approvedOwnershipAuthority: widenedAuthority })).join('\n'),
    /trusted.*ownership|ownership.*authority|frozen.*scope/i
  );

  const otherRepository = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-authority-replay-'));
  t.after(() => cleanupTree(otherRepository));
  const replayed = structuredClone(context);
  replayed.working_tree.repo_root = otherRepository;
  const replayAuthority = await reissueAuthority(fixture, units);
  assert.match(
    (await parallelProtocol.validateDispatchContextWithAuthority(replayed, { approvedOwnershipAuthority: replayAuthority })).join('\n'),
    /authority.*repository|repository.*authority|token replay/i
  );
});

test('approved ownership authority rejects closed-schema violations, duplicate units, and plan-scope widening', async (t) => {
  const duplicateUnits = ['first', 'second'].map((workspace) => ({
    id: 'duplicate',
    ownership: { allowed_paths: [`src/${workspace}/**`], prohibited_paths: ['.git/**'] }
  }));
  const duplicate = await trustedOwnershipFixture(t, duplicateUnits, { expectedVerified: false });
  assert.match(duplicate.authority.errors.join('\n'), /duplicate.*unit/i);

  const normalUnits = [{ id: 'unit', ownership: { allowed_paths: ['src/**'], prohibited_paths: ['.git/**'] } }];
  const unknownField = await trustedOwnershipFixture(t, normalUnits, {
    expectedVerified: false,
    frozenTransform: (value) => ({ ...value, caller_extension: true })
  });
  assert.match(unknownField.authority.errors.join('\n'), /unknown.*field|closed schema/i);

  const widenedUnits = [{ id: 'unit', ownership: { allowed_paths: ['**'], prohibited_paths: ['.git/**'] } }];
  const widened = await trustedOwnershipFixture(t, widenedUnits, {
    expectedVerified: false,
    planAllowedPaths: ['src/**']
  });
  assert.match(widened.authority.errors.join('\n'), /approved plan.*allowed_paths|outside.*plan scope|ownership.*widen/i);
});

test('ownership containment applies the verified target filesystem case semantics', () => {
  assert.equal(typeof parallelProtocol.ownershipPatternIsContainedBy, 'function');
  assert.equal(parallelProtocol.ownershipPatternIsContainedBy('SRC/**', 'src/**', false), false);
  assert.equal(parallelProtocol.ownershipPatternIsContainedBy('SRC/**', 'src/**', true), true);
  assert.equal(parallelProtocol.ownershipPatternIsContainedBy('src/unit/**', 'src/**', false), true);
});

test('approved ownership authority rejects invalid UTF-8 before hashing frozen contract bytes', async (t) => {
  const units = [{ id: 'unit', ownership: { allowed_paths: ['src/**'], prohibited_paths: ['.git/**'] } }];
  const fixture = await trustedOwnershipFixture(t, units);
  await writeFile(
    path.join(fixture.repositoryRoot, fixture.frozenContractPath),
    Buffer.from([0xff, 0xfe, 0xfd, 0x00])
  );
  const authority = await parallelProtocol.verifyApprovedOwnershipAuthority({
    repositoryRoot: fixture.repositoryRoot,
    contract: fixture.contract,
    units,
    approvedSpecPath: fixture.approvedSpecPath,
    planContext: fixture.planContext
  });
  assert.equal(authority.verified, false);
  assert.match(authority.errors.join('\n'), /UTF-8/i);
});

test('approved ownership authority is re-read at one-shot dispatch consumption', async (t) => {
  assert.equal(typeof parallelProtocol.validateDispatchContextWithAuthority, 'function');
  const units = [{
    id: 'unit', contract_hash: 'pending',
    workspace: { strategy: 'worktree', path: '/pending', branch: 'unit/a', base_head: 'abc' },
    ownership: { allowed_paths: ['src/**'], prohibited_paths: ['.git/**'] },
    verification: { command: 'npm test', cwd: '/pending' },
    result: { type: 'commit', contract_hash: 'pending', changed_paths: [] }
  }];
  const fixture = await trustedOwnershipFixture(t, units);
  const context = simpleWriteContext(fixture.contract, units, fixture.repositoryRoot);
  bindApprovedContext(context, fixture);
  await materializeContextWorkspaces(context, fixture.repositoryRoot);
  await writeFile(
    path.join(fixture.repositoryRoot, fixture.frozenContractPath),
    `${await readFile(path.join(fixture.repositoryRoot, fixture.frozenContractPath), 'utf8')} `
  );

  const errors = await parallelProtocol.validateDispatchContextWithAuthority(context, {
    approvedOwnershipAuthority: fixture.authority
  });
  assert.match(errors.join('\n'), /stale|changed|byte hash|authority/i);
});

test('read-only dispatch requires an opaque parent-observed proof bound to repository, request, and unit', async (t) => {
  assert.equal(typeof parallelProtocol.observeReadOnlyExecution, 'function');
  const repositoryRoot = await initGitRepository(t, 'sdcorejs-readonly-proof-');
  const contract = { source: 'read-only-request', request_hash: 'request', scope_hash: 'scope', write_policy: 'deny' };
  const result = { type: 'report', changed_paths: [] };
  const observed = await parallelProtocol.observeReadOnlyExecution({
    repositoryRoot,
    contract,
    unitId: 'audit',
    execute: async () => result
  });
  assert.equal(observed.proof.verified, true, observed.proof.errors?.join('\n'));
  const context = {
    schema_version: 2,
    contract,
    working_tree: { repo_root: repositoryRoot },
    runtime_capabilities: baseCapabilities,
    units: [{
      id: 'audit', workspace: { strategy: 'shared-readonly' },
      ownership: { allowed_paths: [], prohibited_paths: [] },
      result: observed.result, read_only_proof: observed.proof
    }]
  };
  assert.deepEqual(await parallelProtocol.validateReadOnlyDispatchContext(context), []);

  const forged = structuredClone(context);
  forged.units[0].read_only_proof = {
    verified: true, before_state: 'state-1', after_state: 'state-1',
    changed_paths: [], actual_writes: []
  };
  assert.match(validateDispatchContext(forged).join('\n'), /trusted.*read-only proof|parent-observed|opaque/i);

  const replayed = {
    ...context,
    contract: { ...context.contract, request_hash: 'other-request' },
    units: context.units.map((unit) => ({ ...unit, read_only_proof: observed.proof }))
  };
  assert.match(validateDispatchContext(replayed).join('\n'), /read-only proof.*request|request.*proof|trusted.*proof/i);
});

test('read-only proof is one-shot and rejects repository state changed after observation', async (t) => {
  assert.equal(typeof parallelProtocol.validateReadOnlyDispatchContext, 'function');
  const repositoryRoot = await initGitRepository(t, 'sdcorejs-readonly-stale-');
  const contract = { source: 'read-only-request', request_hash: 'request', scope_hash: 'scope', write_policy: 'deny' };
  const observed = await parallelProtocol.observeReadOnlyExecution({
    repositoryRoot,
    contract,
    unitId: 'audit',
    execute: async () => ({ type: 'report', changed_paths: [] })
  });
  const context = {
    schema_version: 2,
    contract,
    working_tree: { repo_root: repositoryRoot },
    runtime_capabilities: baseCapabilities,
    units: [{
      id: 'audit', workspace: { strategy: 'shared-readonly' },
      ownership: { allowed_paths: [], prohibited_paths: [] },
      result: observed.result, read_only_proof: observed.proof
    }]
  };

  await writeFile(path.join(repositoryRoot, 'late-write.txt'), 'persistent\n');
  const stale = await parallelProtocol.validateReadOnlyDispatchContext(context);
  assert.match(stale.join('\n'), /repository state.*changed|stale.*read-only proof|observation.*state/i);

  await rm(path.join(repositoryRoot, 'late-write.txt'));
  const replay = await parallelProtocol.validateReadOnlyDispatchContext(context);
  assert.match(replay.join('\n'), /one-shot|consumed|reused|trusted.*proof/i);
});

test('dispatch context validation returns errors for malformed product-unit bindings instead of throwing', () => {
  const malformed = validProductDispatchContext();
  malformed.units = [null, { id: 'broken-unit', result: 'not-an-object', evidence: [] }];
  malformed.integration.merge_order = ['broken-unit'];
  malformed.product_flow.stages = [null];
  malformed.runtime_capabilities = null;

  let errors;
  assert.doesNotThrow(() => { errors = validateDispatchContext(malformed); });
  assert.ok(Array.isArray(errors));
  assert.match(errors.join('\n'), /unit.*object|product_flow.*stage.*object/i);
});

test('malformed arrays and globs fail closed without throwing', async () => {
  const malformedContext = validProductDispatchContext();
  malformedContext.existing_worktrees = { path: '/wt/not-an-array' };
  malformedContext.units[0].ownership.allowed_paths = 'src/**';
  malformedContext.units[0].ownership.prohibited_paths = { path: '.git/**' };
  malformedContext.units[0].ownership.allowed_lockfiles = null;

  let contextErrors;
  assert.doesNotThrow(() => { contextErrors = validateDispatchContext(malformedContext); });
  assert.match(contextErrors.join('\n'), /existing_worktrees.*array|allowed_paths.*array|prohibited_paths.*array/i);

  let topology;
  assert.doesNotThrow(() => {
    topology = classifyTopology({ contract: approvedContract, units: { id: 'not-an-array' }, runtimeCapabilities: baseCapabilities });
  });
  assert.equal(topology.verdict, 'SEQUENTIAL');

  await assert.doesNotReject(async () => {
    const result = await validatePathBoundary({
      repoRoot: process.cwd(),
      unit: { ownership: { allowed_paths: 'src/**', prohibited_paths: ['src/[broken'] } },
      actualChanges: { status: 'M', path: 'src/a.ts' },
      selfReportedPaths: 'src/a.ts'
    });
    assert.match(result.errors.join('\n'), /actualChanges.*array|allowed_paths.*array|selfReportedPaths.*array|glob/i);
  });

  for (const malformedTree of [null, 'not-an-object', {
    staged_paths: {}, unstaged_paths: 'src/a.ts', untracked_paths: 1,
    existing_paths: false, intended_output_paths: { path: 'dist' }
  }]) {
    let treeErrors;
    assert.doesNotThrow(() => { treeErrors = validateWorkingTree(malformedTree); });
    assert.match(treeErrors.join('\n'), /working tree.*object|staged_paths.*array|intended_output_paths.*array/i);
  }
});

test('exported validators fail closed for null, array, and string inputs', async () => {
  for (const malformed of [null, [], 'malformed']) {
    for (const [label, invoke] of [
      ['validateContract', () => validateContract(malformed)],
      ['validateEvidence', () => validateEvidence(malformed)],
      ['validateWorkspaceAssignment', () => validateWorkspaceAssignment(malformed)]
    ]) {
      let result;
      assert.doesNotThrow(() => { result = invoke(); }, label);
      assert.ok(Array.isArray(result) && result.length > 0, `${label} must return blocking errors`);
    }

    const runtime = validateRuntimeCapabilities(malformed, true);
    assert.notEqual(runtime.mode, 'PARALLEL');

    await assert.doesNotReject(async () => {
      const pathResult = await validatePathBoundary(malformed);
      assert.ok(Array.isArray(pathResult.errors) && pathResult.errors.length > 0);
    }, 'validatePathBoundary');
    await assert.doesNotReject(async () => {
      const workspaceErrors = await parallelProtocol.validateWorkspaceRealpaths(malformed);
      assert.ok(Array.isArray(workspaceErrors) && workspaceErrors.length > 0);
    }, 'validateWorkspaceRealpaths');
  }
});

test('working-tree preflight fails closed on branch, HEAD, dirty, untracked, and output overlap', () => {
  const errors = validateWorkingTree({
    current_branch: 'wrong', current_head: 'old', expected_branch: 'feature', expected_head: 'new',
    staged_paths: ['shared.ts'], unstaged_paths: ['src/a.ts'], untracked_paths: ['src/new.ts'],
    unrelated_dirty_paths: ['shared.ts'], intended_output_paths: ['src/new.ts', 'src/existing.ts'], existing_paths: ['src/existing.ts']
  });
  assert.match(errors.join('\n'), /branch mismatch.*HEAD mismatch.*unrelated dirty.*existing output/s);
});

test('working-tree preflight rejects parent-child output overlap in both directions', () => {
  const dirtyChild = validateWorkingTree({
    staged_paths: ['dist/user.txt'],
    intended_output_paths: ['dist']
  });
  const existingParent = validateWorkingTree({
    existing_paths: ['generated'],
    intended_output_paths: ['generated/result.json']
  });
  const siblings = validateWorkingTree({
    staged_paths: ['dist-user/file.txt'],
    intended_output_paths: ['dist']
  });

  assert.match(dirtyChild.join('\n'), /overlaps intended output/);
  assert.match(existingParent.join('\n'), /overlaps intended output/);
  assert.deepEqual(siblings, []);
});

test('topology classification supports two expensive units, heterogeneous units, read-only audits, DAGs, and resource conflicts', () => {
  const unit = (id, allowed, extra = {}) => ({ id, ownership: { allowed_paths: [allowed], prohibited_paths: [], exclusive_resources: [], ...extra } });
  assert.equal(classifyTopology({ contract: approvedContract, units: [unit('a', 'a/**'), unit('b', 'b/**')], runtimeCapabilities: baseCapabilities }).kind, 'INDEPENDENT_WRITE_UNITS');
  assert.equal(classifyTopology({ contract: approvedContract, units: [unit('api', 'server/**'), unit('ui', 'web/**'), unit('docs', 'docs/**')], runtimeCapabilities: baseCapabilities }).kind, 'INDEPENDENT_WRITE_UNITS');
  assert.equal(classifyTopology({ contract: { source: 'read-only-request', request_hash: 'r', scope_hash: 's', write_policy: 'deny' }, units: [], runtimeCapabilities: baseCapabilities }).kind, 'READ_ONLY_FANOUT');
  assert.equal(classifyTopology({ contract: { source: 'read-only-request', request_hash: 'r', scope_hash: 's', write_policy: 'deny' }, units: [], runtimeCapabilities: { ...baseCapabilities, supports_subagents: false } }).verdict, 'SEQUENTIAL');
  assert.equal(classifyTopology({ contract: approvedContract, units: [{ ...unit('a', 'a/**'), depends_on: ['b'] }, unit('b', 'b/**')], runtimeCapabilities: baseCapabilities }).kind, 'SEQUENTIAL_DAG');
  const conflict = [unit('a', 'a/**', { exclusive_resources: ['port:3000'] }), unit('b', 'b/**', { exclusive_resources: ['port:3000'] })];
  assert.equal(classifyTopology({ contract: approvedContract, units: conflict, runtimeCapabilities: baseCapabilities }).verdict, 'SEQUENTIAL');
  const portConflict = [unit('a', 'a/**', { allocated_ports: [3000] }), unit('b', 'b/**', { allocated_ports: [3000] })];
  assert.equal(classifyTopology({ contract: approvedContract, units: portConflict, runtimeCapabilities: baseCapabilities }).verdict, 'SEQUENTIAL');
  const crossPortConflict = [unit('a', 'a/**', { exclusive_resources: ['port:3000'] }), unit('b', 'b/**', { allocated_ports: [3000] })];
  assert.equal(classifyTopology({ contract: approvedContract, units: crossPortConflict, runtimeCapabilities: baseCapabilities }).verdict, 'SEQUENTIAL');
  const tempRootConflict = [unit('a', 'a/**', { temp_root: 'tmp/run' }), unit('b', 'b/**', { temp_root: 'tmp/run/sub' })];
  assert.equal(classifyTopology({ contract: approvedContract, units: tempRootConflict, runtimeCapabilities: baseCapabilities }).verdict, 'SEQUENTIAL');
  const normalizedTempConflict = [unit('a', 'a/**', { temp_root: 'tmp/../shared' }), unit('b', 'b/**', { temp_root: 'shared' })];
  assert.equal(classifyTopology({ contract: approvedContract, units: normalizedTempConflict, runtimeCapabilities: baseCapabilities }).verdict, 'SEQUENTIAL');
});

test('classification catches parent/child globs and case-only ownership conflicts', () => {
  const classify = (paths) => classifyTopology({
    contract: approvedContract,
    units: paths.map((allowed, index) => ({ id: `u${index}`, ownership: { allowed_paths: [allowed], prohibited_paths: [], exclusive_resources: [] } })),
    runtimeCapabilities: baseCapabilities
  });
  assert.equal(classify(['src/**', 'src/foo/**']).verdict, 'SEQUENTIAL');
  assert.equal(classify(['SRC/Foo/**', 'src/foo/**']).verdict, 'SEQUENTIAL');
  assert.equal(classify(['**/*.md', 'src/**']).verdict, 'SEQUENTIAL');
  assert.equal(classify(['src/feature*/**', 'src/feature-one/**']).verdict, 'SEQUENTIAL');
  assert.equal(classify(['apps/@(web|api)/**', 'apps/web/**']).verdict, 'SEQUENTIAL');
});

test('DAG waves do not force five roles and defer cross-stack execution until integration', () => {
  const waves = planWaves([
    { id: 'backend', depends_on: [], produces: ['api'] },
    { id: 'frontend', depends_on: [], consumes: ['contract'] },
    { id: 'integration', depends_on: ['backend', 'frontend'] },
    { id: 'qc-execute', depends_on: ['integration'] }
  ]);
  assert.deepEqual(waves, [['backend', 'frontend'], ['integration'], ['qc-execute']]);
});

test('protocol v2 rejects product traceability before fan-in or ship before read-only audit', async (t) => {
  const context = validProductDispatchContext();
  const fixture = await trustedOwnershipFixture(t, context.units);
  bindApprovedContext(context, fixture);
  await materializeContextWorkspaces(context, fixture.repositoryRoot);
  const validate = (value) => validateDispatchContext(value);
  assert.deepEqual(await parallelProtocol.validateDispatchContextWithAuthority(context, { approvedOwnershipAuthority: fixture.authority }), []);

  const readOnlyOuter = {
    schema_version: 2,
    contract: { source: 'read-only-request', request_hash: 'request', scope_hash: 'scope', write_policy: 'deny' },
    runtime_capabilities: baseCapabilities,
    units: [],
    product_flow: validProductFlow()
  };
  assert.match(validate(readOnlyOuter).join('\n'), /product_flow.*approved-plan|approved plan.*product_flow/i);

  const wrongContract = structuredClone(context);
  wrongContract.product_flow.contract_id = 'OTHER-CONTRACT';
  assert.match(validate(wrongContract).join('\n'), /product_flow.*contract_id|contract_id.*product_flow/i);

  const wrongFrozenHash = structuredClone(context);
  wrongFrozenHash.product_flow.frozen_contract_hash = 'other-hash';
  for (const stage of wrongFrozenHash.product_flow.stages) stage.contract_hash = 'other-hash';
  assert.match(validate(wrongFrozenHash).join('\n'), /product_flow.*frozen.*hash|frozen.*hash.*product_flow/i);

  const premature = structuredClone(context);
  premature.product_flow.stages.find((stage) => stage.id === 'sync').depends_on = ['seed'];
  assert.match(validate(premature).join('\n'), /product_flow.*fan-in/);

  const bypass = structuredClone(context);
  bypass.product_flow.stages.find((stage) => stage.id === 'ship').depends_on = ['sync'];
  bypass.product_flow.stages.find((stage) => stage.id === 'ship').consumes_product_action = 'traceability-sync';
  assert.match(validate(bypass).join('\n'), /product_flow.*audit/);

  const lateWrite = structuredClone(context);
  lateWrite.product_flow.stages.push({
    id: 'late-docs', action: 'auto-docs', depends_on: ['audit'], owner: 'parent',
    contract_hash: 'contract-hash', write_policy: 'allow', actual_writes: ['docs/guide.md']
  });
  assert.match(validate(lateWrite).join('\n'), /product_flow.*late write|product_flow.*final write/i);
});

test('runtime capability negotiation demotes or fails closed safely', () => {
  assert.equal(validateRuntimeCapabilities({ ...baseCapabilities, supports_subagents: false }, true).mode, 'SEQUENTIAL');
  assert.equal(validateRuntimeCapabilities({ ...baseCapabilities, supports_parallel_dispatch: false }, false).mode, 'SEQUENTIAL_WAVES');
  assert.equal(validateRuntimeCapabilities({ ...baseCapabilities, supports_agent_cwd: false }, true).mode, 'DISJOINT_SAME_TREE_ONLY');
  assert.equal(validateRuntimeCapabilities({ runtime: 'unknown' }, true).mode, 'BLOCKED');
  assert.equal(validateRuntimeCapabilities({ ...baseCapabilities, supports_cancellation: false }, true).cancellation, 'best-effort');
  const worktreeWithoutCwd = classifyTopology({
    contract: approvedContract,
    units: [{ id: 'u', workspace: { strategy: 'worktree' }, ownership: { allowed_paths: ['src/**'], exclusive_resources: [] } }],
    runtimeCapabilities: { ...baseCapabilities, supports_agent_cwd: false }
  });
  assert.equal(worktreeWithoutCwd.verdict, 'SEQUENTIAL');
});

test('workspace validation rejects wrong cwd, nesting, dirty integration, stale base, and non-descendant result', () => {
  const errors = validateWorkspaceAssignment({
    unit: {
      workspace: { strategy: 'worktree', path: '/repo/wt/a', base_head: 'base' },
      verification: { cwd: '/repo' }, result: { base_head: 'old', descends_from_base: false }
    },
    integration: { workspace_path: '/repo', base_head: 'base', dirty: true },
    existingWorktrees: [{ path: '/repo/wt', created_by_current_run: false }]
  });
  assert.match(errors.join('\n'), /cwd.*nested.*dirty.*stale.*descend/s);
});

test('workspace validation rejects assignments that contain an existing worktree', () => {
  const errors = validateWorkspaceAssignment({
    unit: {
      workspace: { strategy: 'worktree', path: '/repo/wt', base_head: 'base' },
      verification: { cwd: '/repo/wt' }, result: { base_head: 'base', descends_from_base: true }
    },
    integration: { workspace_path: '/repo', base_head: 'base', dirty: false },
    existingWorktrees: [{ path: '/repo/wt/existing', created_by_current_run: false }]
  });

  assert.match(errors.join('\n'), /nested worktree assignment/);
});

test('workspace validation rejects symlink or junction aliases after realpath canonicalization', async (t) => {
  assert.equal(typeof parallelProtocol.validateWorkspaceRealpaths, 'function');
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-workspace-alias-'));
  try {
    const integrationPath = path.join(root, 'integration');
    const aliasPath = path.join(root, 'unit-alias');
    await mkdir(integrationPath, { recursive: true });
    try { await symlink(integrationPath, aliasPath, 'junction'); }
    catch (error) { t.skip(`symlink unavailable: ${error.code}`); return; }
    const errors = await parallelProtocol.validateWorkspaceRealpaths({
      unit: {
        workspace: { strategy: 'worktree', path: aliasPath, base_head: 'base' },
        verification: { cwd: aliasPath }
      },
      integration: { workspace_path: integrationPath, base_head: 'base' },
      existingWorktrees: []
    });
    assert.match(errors.join('\n'), /realpath|alias|symbolic|junction|same.*integration/i);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('workspace realpath validation rejects nesting with integration in both directions', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-integration-nesting-'));
  t.after(() => cleanupTree(root));

  const integrationParent = path.join(root, 'integration-parent');
  const unitInside = path.join(integrationParent, 'unit-a');
  await mkdir(unitInside, { recursive: true });
  let errors = await parallelProtocol.validateWorkspaceRealpaths({
    unit: {
      workspace: { strategy: 'worktree', path: unitInside },
      verification: { cwd: unitInside }
    },
    integration: { workspace_path: integrationParent },
    existingWorktrees: []
  });
  assert.match(errors.join('\n'), /unit.*inside.*integration|nested.*integration|integration.*parent.*unit/i);

  const unitParent = path.join(root, 'unit-parent');
  const integrationInside = path.join(unitParent, 'integration');
  await mkdir(integrationInside, { recursive: true });
  errors = await parallelProtocol.validateDispatchWorkspaceRealpaths({
    units: [{
      id: 'unit-a',
      workspace: { strategy: 'worktree', path: unitParent },
      verification: { cwd: unitParent }
    }],
    integration: { workspace_path: integrationInside },
    existingWorktrees: []
  });
  assert.match(errors.join('\n'), /integration.*inside.*unit|nested.*integration|unit.*parent.*integration/i);

  const alias = path.join(root, 'unit-inside-alias');
  try {
    await symlink(unitInside, alias, 'junction');
    errors = await parallelProtocol.validateWorkspaceRealpaths({
      unit: { workspace: { strategy: 'worktree', path: alias }, verification: { cwd: alias } },
      integration: { workspace_path: integrationParent },
      existingWorktrees: []
    });
    assert.match(errors.join('\n'), /alias|symbolic|junction|nested.*integration/i);
  } catch (error) {
    if (!['EPERM', 'EACCES', 'UNKNOWN'].includes(error.code)) throw error;
  }
});

test('dispatch rejects equal, nested, and aliased realpaths across unit workspaces', async (t) => {
  const units = ['a', 'b'].map((id) => ({
    id, contract_hash: 'pending',
    workspace: { strategy: 'worktree', path: '/pending', branch: `unit/${id}`, base_head: 'abc' },
    ownership: { allowed_paths: [`src/${id}/**`], prohibited_paths: ['.git/**'] },
    verification: { command: 'npm test', cwd: '/pending' },
    result: { type: 'commit', contract_hash: 'pending', changed_paths: [] }
  }));
  const fixture = await trustedOwnershipFixture(t, units);
  const context = simpleWriteContext(fixture.contract, units, fixture.repositoryRoot);
  bindApprovedContext(context, fixture);
  await materializeContextWorkspaces(context, fixture.repositoryRoot);
  const workspaceA = context.units[0].workspace.path;

  context.units[1].workspace.path = workspaceA;
  context.units[1].verification.cwd = workspaceA;
  let errors = await parallelProtocol.validateDispatchContextWithAuthority(context, {
    approvedOwnershipAuthority: fixture.authority
  });
  assert.match(errors.join('\n'), /unit workspaces.*same|pairwise.*equal|workspace.*collision/i);

  const nested = path.join(workspaceA, 'nested-b');
  await mkdir(nested, { recursive: true });
  context.units[1].workspace.path = nested;
  context.units[1].verification.cwd = nested;
  errors = await parallelProtocol.validateDispatchContextWithAuthority(context, {
    approvedOwnershipAuthority: await reissueAuthority(fixture, units)
  });
  assert.match(errors.join('\n'), /unit workspaces.*nested|pairwise.*nest|workspace.*parent.*child/i);

  const alias = path.join(fixture.repositoryRoot, '.worktrees', 'alias-b');
  try { await symlink(workspaceA, alias, 'junction'); }
  catch (error) { t.skip(`symlink unavailable: ${error.code}`); return; }
  context.units[1].workspace.path = alias;
  context.units[1].verification.cwd = alias;
  errors = await parallelProtocol.validateDispatchContextWithAuthority(context, {
    approvedOwnershipAuthority: await reissueAuthority(fixture, units)
  });
  assert.match(errors.join('\n'), /alias|symbolic|junction|same.*realpath|workspace.*collision/i);
});

test('result validation rejects crashes, missing results, non-zero claimed success, stale refs, and read-only writes', () => {
  assert.match(validateResultIdentity({ status: 'PASSED' }, { baseHead: 'base' }).join('\n'), /missing result/);
  assert.match(validateResultIdentity({ status: 'PASSED', result: { ref: 'c', base_head: 'base', exit_code: 1, changed_paths: [] } }, { baseHead: 'base' }).join('\n'), /non-zero/);
  assert.match(validateResultIdentity({ status: 'PASSED', result: { ref: 'c', base_head: 'old', exit_code: 0, changed_paths: [] } }, { baseHead: 'base' }).join('\n'), /stale base/);
  assert.match(validateResultIdentity({ status: 'PASSED', result: { type: 'report', ref: 'r', base_head: 'base', exit_code: 0, changed_paths: ['oops.txt'] } }, { baseHead: 'base', readOnly: true }).join('\n'), /read-only/);
  assert.match(validateResultIdentity({ status: 'PASSED', result: { ref: 'c', base_head: 'base', exit_code: 0, changed_paths: [] } }, { baseHead: 'base' }).join('\n'), /associated state.*output digest/s);
});

test('path validator catches overlap, case-only conflict, rename, untracked files, lockfiles, formatter spill, and fake reports', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-paths-'));
  try {
    await mkdir(path.join(root, 'src', 'foo'), { recursive: true });
    const unit = { ownership: { allowed_paths: ['src/foo/**'], prohibited_paths: ['package-lock.json'] } };
    const result = await validatePathBoundary({ repoRoot: root, unit, actualChanges: [
      { status: 'R', from: 'src/foo/a.ts', path: 'src/out.ts' },
      { status: '??', path: 'tmp.txt' }, { status: 'M', path: 'package-lock.json' },
      { status: 'M', path: 'SRC/FOO/A.ts' }, { status: 'M', path: 'docs/formatted.md' }
    ], selfReportedPaths: ['src/foo/a.ts'], caseInsensitive: true });
    assert.match(result.errors.join('\n'), /out-of-scope.*prohibited.*self-report/s);
    assert.deepEqual(result.changed_paths, [...new Set(result.changed_paths)].sort());
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('path validator expands scored Git renames and rejects a missing source path', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-rename-score-'));
  try {
    await mkdir(path.join(root, 'src'), { recursive: true });
    const unit = { ownership: { allowed_paths: ['src/**'], prohibited_paths: [] } };
    const renamed = await validatePathBoundary({
      repoRoot: root,
      unit,
      actualChanges: [{ status: 'R100', from: 'outside/old.ts', path: 'src/new.ts' }]
    });
    assert.match(renamed.errors.join('\n'), /out-of-scope.*outside\/old\.ts/i);
    assert.deepEqual(renamed.changed_paths, ['outside/old.ts', 'src/new.ts']);

    const missingSource = await validatePathBoundary({
      repoRoot: root,
      unit,
      actualChanges: [{ status: 'R087', path: 'src/new.ts' }]
    });
    assert.match(missingSource.errors.join('\n'), /rename.*from|source path/i);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('path validator rejects invalid rename scores and malformed name-status values', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-invalid-status-'));
  try {
    await mkdir(path.join(root, '.git'), { recursive: true });
    const unit = { ownership: { allowed_paths: ['src/**'], prohibited_paths: [] } };
    for (const status of ['R101', 'R999', 'RENAMED', '', null]) {
      const result = await validatePathBoundary({
        repoRoot: root,
        unit,
        actualChanges: [{ status, from: '.git/config', path: 'src/new.ts' }]
      });
      assert.match(result.errors.join('\n'), /invalid.*Git.*status|invalid.*rename|name-status/i);
    }
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('path validator cannot widen into Git, immutable contracts, or unfrozen sensitive writes', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-protected-paths-'));
  try {
    const unit = { ownership: { allowed_paths: ['**'], prohibited_paths: [] } };
    const result = await validatePathBoundary({ repoRoot: root, unit, actualChanges: [
      { status: 'M', path: '.git/config' },
      { status: 'M', path: '.sdcorejs/specs/workflow/approved.md' },
      { status: 'M', path: '.sdcorejs/plans/workflow/approved.md' },
      { status: 'M', path: '.env.local' },
      { status: 'M', path: 'package.json' },
      { status: 'M', path: 'package-lock.json' },
      { status: 'M', path: 'prisma/migrations/001/init.sql' }
    ] });

    assert.match(result.errors.join('\n'), /protected.*\.git/i);
    assert.match(result.errors.join('\n'), /protected.*\.sdcorejs\/specs/i);
    assert.match(result.errors.join('\n'), /protected.*\.sdcorejs\/plans/i);
    assert.match(result.errors.join('\n'), /parent-approved.*environment-file/i);
    assert.match(result.errors.join('\n'), /parent-approved.*package-manifest/i);
    assert.match(result.errors.join('\n'), /parent-approved.*lockfile/i);
    assert.match(result.errors.join('\n'), /parent-approved.*migration/i);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('sensitive writes require complete parent approval included in frozen ownership', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-sensitive-paths-'));
  try {
    const capabilities = ['environment-file', 'package-manifest', 'lockfile', 'migration'].map((capability) => ({
      capability, approved_by: 'parent', approval_ref: `C1:${capability}`
    }));
    const unit = {
      ownership: {
        allowed_paths: ['**'], prohibited_paths: [], allowed_lockfiles: ['package-lock.json'],
        sensitive_write_capabilities: capabilities
      }
    };
    const result = await validatePathBoundary({ repoRoot: root, unit, actualChanges: [
      { status: 'M', path: '.env.local' }, { status: 'M', path: 'package.json' },
      { status: 'M', path: 'package-lock.json' }, { status: 'M', path: 'prisma/migrations/001/init.sql' }
    ] });
    assert.deepEqual(result.errors, []);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('path validator rejects symlink escape, new files below symlink, and nested repositories', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-boundary-'));
  const outside = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-outside-'));
  try {
    try { await symlink(outside, path.join(root, 'linked'), 'junction'); }
    catch (error) { t.skip(`symlink unavailable: ${error.code}`); return; }
    await mkdir(path.join(root, 'nested', '.git'), { recursive: true });
    const unit = { ownership: { allowed_paths: ['**'], prohibited_paths: [] } };
    const result = await validatePathBoundary({ repoRoot: root, unit, actualChanges: [
      { status: '??', path: 'linked/new.ts' }, { status: 'M', path: 'nested/file.ts' }
    ] });
    assert.match(result.errors.join('\n'), /symlink.*nested repository/s);
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  }
});

test('path validator rejects an in-repository symlink that escapes unit ownership', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-unit-link-'));
  try {
    await mkdir(path.join(root, 'owned'), { recursive: true });
    await mkdir(path.join(root, 'secret'), { recursive: true });
    try { await symlink(path.join(root, 'secret'), path.join(root, 'owned', 'link'), 'junction'); }
    catch (error) { t.skip(`symlink unavailable: ${error.code}`); return; }
    const result = await validatePathBoundary({
      repoRoot: root,
      unit: { ownership: { allowed_paths: ['owned/**'], prohibited_paths: [] } },
      actualChanges: [{ status: '??', path: 'owned/link/new.ts' }]
    });
    assert.match(result.errors.join('\n'), /symlink ownership escape/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('projected symlink targets receive protected, sensitive, and lockfile policy checks', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-projected-policy-'));
  try {
    await mkdir(path.join(root, '.git'), { recursive: true });
    await mkdir(path.join(root, 'config', 'migrations', '001'), { recursive: true });
    await writeFile(path.join(root, '.git', 'config'), '[core]\n');
    await writeFile(path.join(root, 'config', 'package.json'), '{}\n');
    await writeFile(path.join(root, 'config', 'package-lock.json'), '{}\n');
    await writeFile(path.join(root, 'config', '.env.local'), 'SECRET=redacted\n');
    await writeFile(path.join(root, 'config', 'migrations', '001', 'up.sql'), 'select 1;\n');
    try {
      await symlink(path.join(root, '.git'), path.join(root, 'git-link'), 'junction');
      await symlink(path.join(root, 'config'), path.join(root, 'config-link'), 'junction');
    } catch (error) {
      t.skip(`symlink unavailable: ${error.code}`);
      return;
    }
    const result = await validatePathBoundary({
      repoRoot: root,
      unit: { ownership: { allowed_paths: ['**'], prohibited_paths: [], allowed_lockfiles: [] } },
      actualChanges: [
        { status: 'M', path: 'git-link/config' },
        { status: 'M', path: 'config-link/package.json' },
        { status: 'M', path: 'config-link/package-lock.json' },
        { status: 'M', path: 'config-link/.env.local' },
        { status: 'M', path: 'config-link/migrations/001/up.sql' }
      ]
    });
    const errors = result.errors.join('\n');
    assert.match(errors, /protected.*\.git/i);
    assert.match(errors, /package-manifest/i);
    assert.match(errors, /lockfile/i);
    assert.match(errors, /environment-file/i);
    assert.match(errors, /migration/i);
    assert.match(errors, /unauthorized lockfile/i);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('path validator rejects a nested repository at the changed leaf root', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-nested-leaf-'));
  try {
    await mkdir(path.join(root, 'vendor-copy', '.git'), { recursive: true });
    const result = await validatePathBoundary({
      repoRoot: root,
      unit: { ownership: { allowed_paths: ['vendor-copy'], prohibited_paths: [] } },
      actualChanges: [{ status: '??', path: 'vendor-copy' }]
    });
    assert.match(result.errors.join('\n'), /nested repository boundary/i);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('deterministic fan-in honors order, probes, blockers, conflicts, atomicity, and global failure', async (t) => {
  const makeUnits = () => [
    { id: 'b', status: 'PASSED', result: { type: 'commit', ref: 'b', base_head: 'base', associated_head_or_diff: 'b', output_digest: 'db', exit_code: 0, changed_paths: ['b.ts'], validation: { path_boundary: true, stage_a: true, stage_b: true } } },
    { id: 'a', status: 'PASSED', result: { type: 'commit', ref: 'a', base_head: 'base', associated_head_or_diff: 'a', output_digest: 'da', exit_code: 0, changed_paths: ['a.ts'], validation: { path_boundary: true, stage_a: true, stage_b: true } } }
  ];
  const calls = [];
  const ok = (await integrateWithAuthority(t, {
    units: makeUnits(), integration: { base_head: 'base', merge_order: ['a', 'b'], atomicity: 'all-or-nothing', rollback_strategy: 'restore-base' },
    validate: parentPathPass, review: parentReviewPass, checkpoint: checkpointPass,
    apply: async (unit) => calls.push(`apply:${unit.id}`), probe: async (unit) => calls.push(`probe:${unit.id}`),
    rollbackUnit: rollbackUnitPass, rollback: async () => {}, readPostIntegrationState: readIntegratedState, globalVerify: globalPass
  })).result;
  assert.deepEqual(calls, ['apply:a', 'probe:a', 'apply:b', 'probe:b']);
  assert.equal(ok.status, 'GLOBAL_VERIFIED');

  const blockedUnits = makeUnits().slice(0, 1); blockedUnits[0].status = 'BLOCKED';
  const blocked = (await integrateWithAuthority(t, { units: blockedUnits, integration: { base_head: 'base', merge_order: ['b'], atomicity: 'all-or-nothing', rollback_strategy: 'restore-base' } })).result;
  assert.equal(blocked.status, 'INTEGRATION_BLOCKED');

  const rolledBack = [];
  const failed = (await integrateWithAuthority(t, {
    units: makeUnits(), integration: { base_head: 'base', merge_order: ['a', 'b'], atomicity: 'all-or-nothing', rollback_strategy: 'restore-base' },
    validate: parentPathPass, review: parentReviewPass, checkpoint: checkpointPass,
    apply: async (unit) => { if (unit.id === 'b') throw new Error('conflict'); }, probe: async () => {},
    rollbackUnit: rollbackUnitPass, rollback: async (ids) => rolledBack.push(...ids), readPostIntegrationState: readIntegratedState, globalVerify: globalPass
  })).result;
  assert.equal(failed.rollbackRequired, false);
  assert.deepEqual(rolledBack, ['a', 'b']);

  const partial = (await integrateWithAuthority(t, {
    units: makeUnits(), integration: { base_head: 'base', merge_order: ['a', 'b'], atomicity: 'independent-successes' },
    validate: parentPathPass, review: parentReviewPass, checkpoint: checkpointPass,
    apply: async (unit) => { if (unit.id === 'b') throw new Error('conflict'); }, probe: async () => {},
    rollbackUnit: rollbackUnitPass, readPostIntegrationState: readIntegratedState, globalVerify: globalPass
  })).result;
  assert.deepEqual(partial.integrated, ['a']);
  assert.equal(partial.rollbackRequired, false);

  const staleUnit = makeUnits()[0]; staleUnit.result.descends_from_base = false;
  const staleAncestry = (await integrateWithAuthority(t, { units: [staleUnit], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'all-or-nothing', rollback_strategy: 'restore-base' } })).result;
  assert.equal(staleAncestry.status, 'INTEGRATION_BLOCKED');

  const callbacks = [];
  await integrateWithAuthority(t, {
    units: [makeUnits()[0]], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'all-or-nothing', rollback_strategy: 'restore-base' },
    validate: (unit) => { callbacks.push('validate'); return parentPathPass(unit); },
    review: (unit) => { callbacks.push('review'); return parentReviewPass(unit); },
    checkpoint: checkpointPass, apply: async () => callbacks.push('apply'), probe: async () => {}, rollbackUnit: rollbackUnitPass,
    rollback: async () => {}, readPostIntegrationState: readIntegratedState, globalVerify: globalPass
  });
  assert.deepEqual(callbacks, ['validate', 'review', 'apply']);

  const decision = (await integrateWithAuthority(t, { units: [makeUnits()[0]], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'user-decision' } })).result;
  assert.equal(decision.status, 'USER_DECISION_REQUIRED');
  const noParentValidation = (await integrateWithAuthority(t, { units: [makeUnits()[0]], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'all-or-nothing', rollback_strategy: 'restore-base' } })).result;
  assert.equal(noParentValidation.status, 'INTEGRATION_BLOCKED');
  const noStateReader = (await integrateWithAuthority(t, {
    units: [makeUnits()[0]], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'all-or-nothing', rollback_strategy: 'restore-base' },
    validate: parentPathPass, review: parentReviewPass, checkpoint: checkpointPass, apply: async () => {}, probe: async () => {}, rollbackUnit: rollbackUnitPass,
    rollback: async () => {}, globalVerify: globalPass
  })).result;
  assert.match(noStateReader.reason, /post-integration state reader/i);

  let partialMutation = false; let firstRollback = false;
  const firstApplyFailure = (await integrateWithAuthority(t, {
    units: [makeUnits()[0]], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'all-or-nothing', rollback_strategy: 'restore-base' },
    validate: parentPathPass, review: parentReviewPass, checkpoint: checkpointPass,
    apply: async () => { partialMutation = true; throw new Error('partial apply'); }, probe: async () => {},
    rollbackUnit: async () => { partialMutation = false; firstRollback = true; }, rollback: async () => {},
    readPostIntegrationState: readIntegratedState, globalVerify: globalPass
  })).result;
  assert.equal(firstApplyFailure.status, 'INTEGRATION_BLOCKED');
  assert.equal(partialMutation, false);
  assert.equal(firstRollback, true);

  let verifyRollback = false;
  const verifyThrow = (await integrateWithAuthority(t, {
    units: [makeUnits()[0]], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'all-or-nothing', rollback_strategy: 'restore-base' },
    validate: parentPathPass, review: parentReviewPass, checkpoint: checkpointPass, apply: async () => {}, probe: async () => {}, rollbackUnit: rollbackUnitPass,
    rollback: async () => { verifyRollback = true; }, readPostIntegrationState: readIntegratedState, globalVerify: async () => { throw new Error('verify crash'); }
  })).result;
  assert.equal(verifyThrow.status, 'GLOBAL_VERIFICATION_FAILED');
  assert.equal(verifyRollback, true);
});

test('fan-in rejects repository-aware parent-child path overlap and stale global verification identity', async (t) => {
  const units = [
    { id: 'a', status: 'PASSED', result: { type: 'commit', ref: 'a', base_head: 'base', associated_head_or_diff: 'a', output_digest: 'da', exit_code: 0, changed_paths: ['generated'], validation: { path_boundary: true, stage_a: true, stage_b: true } } },
    { id: 'b', status: 'PASSED', result: { type: 'commit', ref: 'b', base_head: 'base', associated_head_or_diff: 'b', output_digest: 'db', exit_code: 0, changed_paths: ['generated/result.json'], validation: { path_boundary: true, stage_a: true, stage_b: true } } }
  ];
  const integration = { base_head: 'base', merge_order: ['a', 'b'], atomicity: 'independent-successes' };
  let overlapApplied = false;
  const overlap = (await integrateWithAuthority(t, {
    units, integration,
    validate: parentPathPass, review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => { overlapApplied = true; },
    probe: async () => {},
    rollbackUnit: rollbackUnitPass,
    readPostIntegrationState: async () => 'integrated-head', globalVerify: globalPass
  })).result;
  assert.equal(overlap.status, 'INTEGRATION_BLOCKED');
  assert.match(overlap.reason, /overlapping shared artifact/i);
  assert.equal(overlapApplied, false);

  const distinct = [{ ...units[0], ownership: undefined, result: { ...units[0].result, changed_paths: ['a.ts'] } }];
  const stale = (await integrateWithAuthority(t, {
    units: distinct,
    integration: { ...integration, merge_order: ['a'] },
    validate: parentPathPass, review: parentReviewPass,
    checkpoint: checkpointPass, apply: async () => {}, probe: async () => {}, rollbackUnit: rollbackUnitPass,
    readPostIntegrationState: async () => 'actual-integrated-head',
    globalVerify: globalPass
  })).result;
  assert.equal(stale.status, 'GLOBAL_VERIFICATION_FAILED');
  assert.match(stale.reason, /post-integration state/i);
});

test('fan-in requires explicit apply and probe callbacks before any mutation', async (t) => {
  const units = [{
    id: 'a', status: 'PASSED',
    result: {
      type: 'commit', ref: 'a', base_head: 'base', associated_head_or_diff: 'a',
      output_digest: 'digest-a', exit_code: 0, changed_paths: ['a.ts']
    }
  }];
  const common = {
    units,
    integration: { base_head: 'base', merge_order: ['a'], atomicity: 'independent-successes' },
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: checkpointPass,
    rollbackUnit: rollbackUnitPass,
    readPostIntegrationState: readIntegratedState,
    globalVerify: globalPass
  };
  const missingApply = (await integrateWithAuthority(t, { ...common, probe: async () => {} })).result;
  assert.equal(missingApply.status, 'INTEGRATION_BLOCKED');
  assert.match(missingApply.reason, /apply callback/i);
  const missingProbe = (await integrateWithAuthority(t, { ...common, apply: async () => {} })).result;
  assert.equal(missingProbe.status, 'INTEGRATION_BLOCKED');
  assert.match(missingProbe.reason, /probe callback/i);
  let appliedWithoutCheckpoint = false;
  const missingCheckpointIdentity = (await integrateWithAuthority(t, {
    ...common,
    checkpoint: async () => null,
    apply: async () => { appliedWithoutCheckpoint = true; },
    probe: async () => {}
  })).result;
  assert.equal(missingCheckpointIdentity.status, 'INTEGRATION_BLOCKED');
  assert.match(missingCheckpointIdentity.reason, /checkpoint.*identity/i);
  assert.equal(appliedWithoutCheckpoint, false);
});

test('fan-in rereads independent state after global verification to close TOCTOU', async (t) => {
  const units = [{
    id: 'a', status: 'PASSED',
    result: {
      type: 'commit', ref: 'a', base_head: 'base', associated_head_or_diff: 'a',
      output_digest: 'digest-a', exit_code: 0, changed_paths: ['a.ts']
    }
  }];
  let reads = 0;
  let rolledBack = false;
  const result = (await integrateWithAuthority(t, {
    units,
    integration: { base_head: 'base', merge_order: ['a'], atomicity: 'all-or-nothing', rollback_strategy: 'restore-base' },
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => {},
    probe: async () => {},
    rollbackUnit: rollbackUnitPass,
    rollback: async () => { rolledBack = true; },
    readPostIntegrationState: async () => (++reads === 1 ? 'integrated-head' : 'changed-after-verify'),
    globalVerify: globalPass
  })).result;
  assert.equal(result.status, 'GLOBAL_VERIFICATION_FAILED');
  assert.match(result.reason, /changed.*verification|TOCTOU|post-verification state/i);
  assert.equal(reads, 2);
  assert.equal(rolledBack, true);
});

test('independent fan-in rolls back the current failed apply or probe and preserves only probed units', async (t) => {
  const units = ['a', 'b'].map((id) => ({
    id, status: 'PASSED',
    result: {
      type: 'commit', ref: id, base_head: 'base', associated_head_or_diff: id,
      output_digest: `digest-${id}`, exit_code: 0, changed_paths: [`${id}.ts`]
    }
  }));
  const integration = { base_head: 'base', merge_order: ['a', 'b'], atomicity: 'independent-successes' };
  const run = async (failureStage) => {
    let state = [];
    const result = (await integrateWithAuthority(t, {
      units,
      integration,
      validate: parentPathPass,
      review: parentReviewPass,
      checkpoint: async () => [...state],
      apply: async (unit) => {
        state.push(unit.id);
        if (unit.id === 'b' && failureStage === 'apply') throw new Error('partial apply');
      },
      probe: async (unit) => {
        if (unit.id === 'b' && failureStage === 'probe') throw new Error('probe failed');
      },
      rollbackUnit: async (_unit, checkpoint) => { state = [...checkpoint]; },
      readPostIntegrationState: readIntegratedState,
      globalVerify: globalPass
    })).result;
    return { result, state };
  };

  for (const stage of ['apply', 'probe']) {
    const { result, state } = await run(stage);
    assert.equal(result.status, 'INTEGRATION_BLOCKED');
    assert.deepEqual(result.integrated, ['a']);
    assert.deepEqual(state, ['a']);
  }
});

test('user-decision atomicity requires a validated effective policy before mutation', async (t) => {
  assert.equal(typeof parallelProtocol.observeIntegrationDecision, 'function');
  const createUnit = () => ({
    id: 'a', status: 'PASSED',
    result: {
      type: 'commit', ref: 'a', base_head: 'base', associated_head_or_diff: 'a',
      output_digest: 'digest-a', exit_code: 0, changed_paths: ['a.ts']
    }
  });
  let applied = false;
  const callbacks = {
    validate: parentPathPass, review: parentReviewPass,
    checkpoint: async () => 'checkpoint',
    apply: async () => { applied = true; }, probe: async () => {},
    rollbackUnit: async () => {}, readPostIntegrationState: readIntegratedState,
    globalVerify: globalPass
  };
  const first = await prepareFanIn(t, {
    units: [createUnit()],
    integration: { base_head: 'base', merge_order: ['a'], atomicity: 'user-decision' }
  });
  const unvalidated = await integrateResults({
    ...callbacks,
    repositoryRoot: first.repositoryRoot,
    contract: first.fixture.contract,
    fanInAuthority: first.fanInAuthority,
    units: first.units,
    integration: { ...first.integration, user_decision: true }
  });
  assert.equal(unvalidated.status, 'USER_DECISION_REQUIRED');
  assert.equal(applied, false);

  const prepared = await prepareFanIn(t, {
    units: [createUnit()],
    integration: { base_head: 'base', merge_order: ['a'], atomicity: 'user-decision' }
  });
  const decisionAuthority = await parallelProtocol.observeIntegrationDecision({
    contract: prepared.fixture.contract,
    units: prepared.units,
    integration: prepared.integration,
    effectiveAtomicity: 'independent-successes',
    decisionRef: 'decision-001',
    observeDecision: attestIntegrationDecision
  });
  assert.equal(decisionAuthority.verified, true, decisionAuthority.errors?.join('\n'));
  const validated = await integrateResults({
    ...callbacks,
    repositoryRoot: prepared.repositoryRoot,
    contract: prepared.fixture.contract,
    fanInAuthority: prepared.fanInAuthority,
    units: prepared.units,
    integration: { ...prepared.integration, user_decision: decisionAuthority }
  });
  assert.equal(validated.status, 'GLOBAL_VERIFIED');

  applied = false;
  const replayFanInAuthority = await parallelProtocol.verifyFanInAuthority({
    repositoryRoot: prepared.repositoryRoot,
    contract: prepared.fixture.contract,
    units: prepared.units,
    integration: prepared.integration,
    approvedSpecPath: prepared.fixture.approvedSpecPath,
    planContext: prepared.fixture.planContext
  });
  const replayed = await integrateResults({
    ...callbacks,
    repositoryRoot: prepared.repositoryRoot,
    contract: prepared.fixture.contract,
    fanInAuthority: replayFanInAuthority,
    units: prepared.units,
    integration: { ...prepared.integration, user_decision: decisionAuthority }
  });
  assert.equal(replayed.status, 'USER_DECISION_REQUIRED');
  assert.equal(applied, false);

  const boundAuthority = await parallelProtocol.observeIntegrationDecision({
    contract: prepared.fixture.contract,
    units: prepared.units,
    integration: prepared.integration,
    effectiveAtomicity: 'independent-successes',
    decisionRef: 'decision-002',
    observeDecision: attestIntegrationDecision
  });
  const reboundFanInAuthority = await parallelProtocol.verifyFanInAuthority({
    repositoryRoot: prepared.repositoryRoot,
    contract: prepared.fixture.contract,
    units: prepared.units,
    integration: prepared.integration,
    approvedSpecPath: prepared.fixture.approvedSpecPath,
    planContext: prepared.fixture.planContext
  });
  const rebound = await integrateResults({
    ...callbacks,
    repositoryRoot: prepared.repositoryRoot,
    contract: prepared.fixture.contract,
    fanInAuthority: reboundFanInAuthority,
    units: prepared.units,
    integration: { ...prepared.integration, base_head: 'other-base', user_decision: boundAuthority }
  });
  assert.equal(rebound.status, 'USER_DECISION_REQUIRED');
  assert.equal(applied, false);
});

test('fan-in rejects malformed unit results and changed-path arrays without throwing', async (t) => {
  const malformedUnits = [
    { id: 'a', status: 'PASSED', result: { ref: 'a', base_head: 'base', associated_head_or_diff: 'a', output_digest: 'd', exit_code: 0, changed_paths: {} } },
    { id: 'a', status: 'PASSED', result: 'not-an-object' },
    { id: 'a', status: 'PASSED', result: { ref: 'a', base_head: 'base', associated_head_or_diff: 'a', output_digest: 'd', exit_code: 0, changed_paths: [{}] } }
  ];
  for (const unit of malformedUnits) {
    await assert.doesNotReject(async () => {
      const result = (await integrateWithAuthority(t, {
        units: [unit],
        integration: { base_head: 'base', merge_order: ['a'], atomicity: 'independent-successes' },
        validate: parentPathPass, review: parentReviewPass,
        checkpoint: async () => 'checkpoint', apply: async () => {}, probe: async () => {}, rollbackUnit: async () => {},
        readPostIntegrationState: readIntegratedState, globalVerify: globalPass
      })).result;
      assert.equal(result.status, 'INTEGRATION_BLOCKED');
      assert.match(result.reason, /result.*object|changed_paths.*array|changed_paths.*non-empty string/i);
    });
  }

  let applied = false;
  const validUnit = {
    id: 'a', status: 'PASSED',
    result: { type: 'commit', ref: 'a', base_head: 'base', associated_head_or_diff: 'a', output_digest: 'd', exit_code: 0, changed_paths: ['a.ts'] }
  };
  const invalidVerdict = (await integrateWithAuthority(t, {
    units: [validUnit],
    integration: { base_head: 'base', merge_order: ['a'], atomicity: 'independent-successes' },
    validate: async () => ({ status: 'PASS', associated_head_or_diff: 'a', changed_paths: [{}] }),
    review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => { applied = true; },
    probe: async () => {}, rollbackUnit: rollbackUnitPass,
    readPostIntegrationState: readIntegratedState, globalVerify: globalPass
  })).result;
  assert.equal(invalidVerdict.status, 'INTEGRATION_BLOCKED');
  assert.match(invalidVerdict.reason, /verdict.*changed_paths.*non-empty string/i);
  assert.equal(applied, false);
});

test('failure policy retries transient failures but not deterministic violations', async (t) => {
  let attempts = 0;
  const result = (await integrateWithAuthority(t, { units: [{ id: 'u', status: 'PASSED', result: { type: 'patch', ref: 'p', base_head: 'base', associated_head_or_diff: 'p', output_digest: 'd', exit_code: 0, changed_paths: ['a'], validation: { path_boundary: true, stage_a: true, stage_b: true } } }], integration: { base_head: 'base', merge_order: ['u'], atomicity: 'independent-successes' }, failurePolicy: { max_attempts: 2, retry_transient_failures: true }, validate: parentPathPass, review: parentReviewPass, checkpoint: checkpointPass, apply: async () => { attempts += 1; if (attempts === 1) { const error = new Error('busy'); error.transient = true; throw error; } }, probe: async () => {}, rollbackUnit: rollbackUnitPass, readPostIntegrationState: readIntegratedState, globalVerify: globalPass })).result;
  assert.equal(result.status, 'GLOBAL_VERIFIED');
  assert.equal(attempts, 2);
  let deterministicAttempts = 0;
  const deterministic = await runUnitWithPolicy(async () => {
    deterministicAttempts += 1;
    const error = new Error('path violation'); error.kind = 'path-violation'; throw error;
  }, { max_attempts: 3, retry_transient_failures: true, timeout_seconds: 1 });
  assert.equal(deterministic.status, 'FAILED');
  assert.equal(deterministicAttempts, 1);
});

test('unit policy handles timeout, crash, fail-fast, and best-effort result states', async () => {
  const timedOut = await runUnitWithPolicy(() => new Promise(() => {}), { max_attempts: 1, timeout_seconds: 0.01 });
  assert.equal(timedOut.status, 'FAILED');
  assert.equal(timedOut.failure_kind, 'timeout');
  const crashed = await runUnitWithPolicy(async () => { throw new Error('crash'); }, { max_attempts: 1, timeout_seconds: 1 });
  assert.equal(crashed.status, 'FAILED');
  assert.equal(crashed.attempts, 1);

  const failFastCalls = [];
  const failFast = await runUnitsWithPolicy([
    { id: 'bad', run: async () => { failFastCalls.push('bad'); throw new Error('boom'); } },
    { id: 'later', run: async () => { failFastCalls.push('later'); return { exit_code: 0 }; } }
  ], { mode: 'fail-fast', max_attempts: 1, timeout_seconds: 1, supports_cancellation: true });
  assert.deepEqual(failFastCalls, ['bad']);
  assert.equal(failFast.results[1].status, 'CANCELLED');

  const bestEffortCalls = [];
  const bestEffort = await runUnitsWithPolicy([
    { id: 'bad', run: async () => { bestEffortCalls.push('bad'); throw new Error('boom'); } },
    { id: 'later', run: async () => { bestEffortCalls.push('later'); return { exit_code: 0 }; } }
  ], { mode: 'best-effort', max_attempts: 1, timeout_seconds: 1 });
  assert.deepEqual(bestEffortCalls, ['bad', 'later']);
  assert.equal(bestEffort.results[1].status, 'PASSED');
});

test('repairs stay with the original owner/workspace and invalidate evidence', () => {
  const unit = { id: 'u1', workspace: { path: '/wt/u1' }, contract_hash: 'h', ownership: { allowed_paths: ['src/a/**'] }, result: { ref: 'c1' }, evidence: { valid: true } };
  const assignment = assignRepair({ finding: { id: 'F1', paths: ['src/a/x.ts'], blocking: true }, unit });
  assert.equal(assignment.repair_owner, 'original-unit');
  assert.equal(assignment.workspace_path, '/wt/u1');
  assert.equal(assignment.evidence_valid, false);
  assert.throws(() => assignRepair({ finding: { id: 'F2', paths: ['src/b/x.ts'] }, unit }), /ownership transfer/);
  assert.throws(() => assignRepair({ finding: { id: 'F3', paths: ['.sdcorejs/plans/p.md'] }, unit }), /contract artifact/);
  assert.throws(() => assignRepair({
    finding: { id: 'F4-old-hash', paths: ['src/b/x.ts'] },
    unit,
    ownershipTransfer: {
      approved: true, workspace_path: '/integration', allowed_paths: ['src/b/**'],
      contract_hash: 'h', supersedes_contract_hash: 'h'
    }
  }), /file-verified revised ownership authority|caller-authored.*forbidden/i);
  assert.throws(
    () => assignRepair({
      finding: { id: 'F4', paths: ['src/b/x.ts'] }, unit,
      ownershipTransfer: {
        approved: true, workspace_path: '/integration', allowed_paths: ['src/b/**'],
        contract_hash: 'h2', supersedes_contract_hash: 'h'
      }
    }),
    /file-verified revised ownership authority|caller-authored.*forbidden/i
  );
  for (const protectedPath of ['.GIT', '.SDCOREJS/PLANS', '.sdcorejs/specs']) {
    assert.throws(
      () => assignRepair({ finding: { id: `protected-${protectedPath}`, paths: [protectedPath] }, unit }),
      /protected|contract artifact/i
    );
  }
  const deferred = assignRepair({ finding: { id: 'F5', paths: ['src/a/x.ts'], blocking: true, deferred: true }, unit });
  assert.equal(deferred.status, 'BLOCKED');
});

test('out-of-scope repairs require a fresh file-verified revised ownership authority', async (t) => {
  assert.equal(typeof parallelProtocol.assignRepairWithAuthority, 'function');
  const supersededContractPath = '.sdcorejs/plans/workflow/contract-r1.parallel.json';
  const revisedUnits = [{
    id: 'u1',
    ownership: { allowed_paths: ['src/b/**'], prohibited_paths: ['.git/**'] }
  }];
  const fixture = await trustedOwnershipFixture(t, revisedUnits, {
    revision: 2,
    supersedes: supersededContractPath
  });
  const unit = {
    id: 'u1', workspace: { path: '/wt/u1' }, contract_hash: 'old-contract-hash',
    frozen_contract_path: supersededContractPath,
    ownership: { allowed_paths: ['src/a/**'], prohibited_paths: ['.git/**'] },
    result: { ref: 'c1' }, evidence: { valid: true }
  };
  const transfer = {
    approvedOwnershipAuthority: fixture.authority,
    workspace_path: '/integration',
    contract_hash: fixture.contract.frozen_contract_hash,
    supersedes_contract_path: supersededContractPath,
    allowed_paths: ['src/b/**']
  };

  const assignment = await parallelProtocol.assignRepairWithAuthority({
    finding: { id: 'F-revised', paths: ['src/b/x.ts'] },
    unit,
    ownershipTransfer: transfer,
    repositoryRoot: fixture.repositoryRoot
  });
  assert.equal(assignment.repair_owner, 'integration-owner');
  assert.equal(assignment.contract_hash, fixture.contract.frozen_contract_hash);

  await assert.rejects(
    parallelProtocol.assignRepairWithAuthority({
      finding: { id: 'F-forged', paths: ['src/b/x.ts'] }, unit,
      ownershipTransfer: { ...transfer, approvedOwnershipAuthority: { verified: true } },
      repositoryRoot: fixture.repositoryRoot
    }),
    /trusted.*authority|file-verified|opaque/i
  );

  const freshAuthority = await reissueAuthority(fixture, revisedUnits);
  await assert.rejects(
    parallelProtocol.assignRepairWithAuthority({
      finding: { id: 'F-widened', paths: ['src/secret.ts'] }, unit,
      ownershipTransfer: {
        ...transfer,
        approvedOwnershipAuthority: freshAuthority,
        allowed_paths: ['**']
      },
      repositoryRoot: fixture.repositoryRoot
    }),
    /trusted.*scope|authority.*ownership|allowed_paths|widen/i
  );
});

test('evidence is bound to command, cwd, result identity, output digest, and exact state', () => {
  const evidence = createEvidence({ command: 'npm test', cwd: '/wt/u1', exit_code: 0, associated_head_or_diff: 'abc', output: 'ok', environment_fingerprint: 'node20' });
  assert.deepEqual(validateEvidence(evidence, { cwd: '/wt/u1', associated_head_or_diff: 'abc', output: 'ok' }), []);
  assert.match(validateEvidence(evidence, { cwd: '/wrong', associated_head_or_diff: 'new', output: 'changed' }).join('\n'), /cwd.*state.*digest/s);
  assert.match(validateEvidence({ ...evidence, valid: false }, { cwd: '/wt/u1', associated_head_or_diff: 'abc', output: 'ok' }).join('\n'), /stale/);
  assert.equal(applyStateEvent('GLOBAL_VERIFIED', 'WRITE').state, 'GLOBAL_VERIFICATION_STALE');
  assert.equal(applyStateEvent('BRANCH_READY', 'WRITE').state, 'BRANCH_READY_STALE');
  assert.equal(applyStateEvent('UNIT_VERIFIED', 'WRITE').state, 'UNIT_VERIFICATION_STALE');
  assert.equal(applyStateEvent('UNIT_VERIFIED', 'INTEGRATION_WRITE').state, 'INTEGRATION_VERIFICATION_REQUIRED');
  assert.equal(applyStateEvent('UNIT_VERIFIED', 'BLOCKING_FINDING').state, 'UNIT_BLOCKED');
});

test('temporary Git worktrees use one base, distinct result commits, ancestry checks, and safe cleanup', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-git-'));
  const wtA = `${root}-a`; const wtB = `${root}-b`; const preexisting = `${root}-keep`;
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
  try {
    git(root, 'init'); git(root, 'config', 'user.email', 'test@example.com'); git(root, 'config', 'user.name', 'Test');
    await writeFile(path.join(root, 'base.txt'), 'base\n'); git(root, 'add', '.'); git(root, 'commit', '-m', 'base');
    const base = git(root, 'rev-parse', 'HEAD');
    git(root, 'worktree', 'add', '-b', 'unit/a', wtA, base);
    git(root, 'worktree', 'add', '-b', 'unit/b', wtB, base);
    git(root, 'worktree', 'add', '-b', 'keep/me', preexisting, base);
    await writeFile(path.join(wtA, 'a.txt'), 'a\n'); git(wtA, 'add', '.'); git(wtA, 'commit', '-m', 'a');
    await writeFile(path.join(wtB, 'b.txt'), 'b\n'); git(wtB, 'add', '.'); git(wtB, 'commit', '-m', 'b');
    const a = git(wtA, 'rev-parse', 'HEAD'); const b = git(wtB, 'rev-parse', 'HEAD');
    assert.notEqual(a, b);
    assert.doesNotThrow(() => git(root, 'merge-base', '--is-ancestor', base, a));
    assert.doesNotThrow(() => git(root, 'merge-base', '--is-ancestor', base, b));
    git(root, 'worktree', 'remove', wtA); git(root, 'worktree', 'remove', wtB);
    assert.match(git(root, 'worktree', 'list'), /keep\/me/);
  } finally {
    for (const p of [wtA, wtB, preexisting, root]) await rm(p, { recursive: true, force: true });
  }
});

test('temporary Git fan-in exposes deterministic cherry-pick conflicts', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-fanin-'));
  const wtA = `${root}-a`; const wtB = `${root}-b`;
  const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  try {
    git(root, 'init'); git(root, 'config', 'user.email', 'test@example.com'); git(root, 'config', 'user.name', 'Test');
    await writeFile(path.join(root, 'shared.txt'), 'base\n'); git(root, 'add', '.'); git(root, 'commit', '-m', 'base');
    const base = git(root, 'rev-parse', 'HEAD');
    git(root, 'worktree', 'add', '-b', 'fanin/a', wtA, base);
    git(root, 'worktree', 'add', '-b', 'fanin/b', wtB, base);
    await writeFile(path.join(wtA, 'shared.txt'), 'from-a\n'); git(wtA, 'add', '.'); git(wtA, 'commit', '-m', 'a');
    await writeFile(path.join(wtB, 'shared.txt'), 'from-b\n'); git(wtB, 'add', '.'); git(wtB, 'commit', '-m', 'b');
    const a = git(wtA, 'rev-parse', 'HEAD');
    const b = git(wtB, 'rev-parse', 'HEAD');
    const units = [a, b].map((ref, index) => ({
      id: index === 0 ? 'a' : 'b', status: 'PASSED',
      ownership: { allowed_paths: [`unit-${index}.txt`], prohibited_paths: ['.git/**'] },
      result: { type: 'commit', ref, base_head: base, associated_head_or_diff: ref, output_digest: ref, exit_code: 0, changed_paths: [`unit-${index}.txt`], validation: { path_boundary: true, stage_a: true, stage_b: true } }
    }));
    const fixture = await trustedOwnershipFixture(t, units, {
      repositoryRoot: root,
      planAllowedPaths: units.flatMap((unit) => unit.ownership.allowed_paths)
    });
    for (const unit of units) {
      unit.contract_hash = fixture.contract.frozen_contract_hash;
      unit.result.contract_hash = fixture.contract.frozen_contract_hash;
    }
    const integration = {
      workspace_path: path.join(root, '.worktrees', 'integration'), branch: 'integration',
      base_head: base, merge_strategy: 'cherry-pick', merge_order: ['a', 'b'],
      atomicity: 'all-or-nothing', rollback_strategy: 'restore-base'
    };
    const fanInAuthority = await parallelProtocol.verifyFanInAuthority({
      repositoryRoot: root,
      contract: fixture.contract,
      units,
      integration,
      approvedSpecPath: fixture.approvedSpecPath,
      planContext: fixture.planContext
    });
    const result = await integrateResults({
      repositoryRoot: root,
      contract: fixture.contract,
      fanInAuthority,
      units,
      integration,
      validate: parentPathPass,
      review: parentReviewPass,
      checkpoint: async () => git(root, 'rev-parse', 'HEAD'),
      apply: async (unit) => git(root, 'cherry-pick', unit.result.ref),
      probe: async () => {},
      rollbackUnit: async (_unit, checkpoint) => {
        try { git(root, 'cherry-pick', '--abort'); } catch {}
        git(root, 'reset', '--hard', checkpoint);
      },
      rollback: async () => {
        try { git(root, 'cherry-pick', '--abort'); } catch {}
        git(root, 'reset', '--hard', base);
      },
      readPostIntegrationState: readIntegratedState,
      globalVerify: globalPass
    });
    assert.equal(result.status, 'ROLLBACK_FAILED');
    assert.equal(result.rollbackRequired, true);
    assert.match(result.reason, /rollback.*repository state|did not restore/i);
    assert.equal(git(root, 'rev-parse', 'HEAD'), base);
    assert.equal((await readFile(path.join(root, 'shared.txt'), 'utf8')).trim(), 'base');
  } finally {
    for (const p of [wtA, wtB, root]) await rm(p, { recursive: true, force: true });
  }
});

test('read-only observation rejects persistent writes even when caller state callbacks lie', async (t) => {
  const repositoryRoot = await initGitRepository(t, 'sdcorejs-readonly-internal-state-');
  const contract = { source: 'read-only-request', request_hash: 'request', scope_hash: 'scope', write_policy: 'deny' };
  const observed = await parallelProtocol.observeReadOnlyExecution({
    repositoryRoot,
    contract,
    unitId: 'audit',
    execute: async () => {
      await writeFile(path.join(repositoryRoot, 'persistent-write.txt'), 'not read only\n');
      return { type: 'report', changed_paths: [] };
    },
    readState: async () => 'caller-constant-state',
    readChangedPaths: async () => []
  });

  assert.equal(observed.proof.verified, false);
  assert.match(observed.proof.errors.join('\n'), /repository.*changed|persistent.*write|read-only/i);
});

test('read-only observation rejects a persistent empty directory', async (t) => {
  const repositoryRoot = await initGitRepository(t, 'sdcorejs-readonly-empty-directory-');
  const contract = { source: 'read-only-request', request_hash: 'request', scope_hash: 'scope', write_policy: 'deny' };
  const persistentDirectory = path.join(repositoryRoot, 'persistent-empty-directory');
  const observed = await parallelProtocol.observeReadOnlyExecution({
    repositoryRoot,
    contract,
    unitId: 'audit',
    execute: async () => {
      await mkdir(persistentDirectory);
      return { type: 'report', changed_paths: [], actual_writes: [] };
    }
  });

  await access(persistentDirectory);
  assert.equal(observed.proof.verified, false);
  assert.match(observed.proof.errors.join('\n'), /persistent repository changes|read-only/i);
});

test('read-only observation rejects a persistent Git object-store write', async (t) => {
  const repositoryRoot = await initGitRepository(t, 'sdcorejs-readonly-object-store-');
  const contract = { source: 'read-only-request', request_hash: 'request', scope_hash: 'scope', write_policy: 'deny' };
  await writeFile(path.join(repositoryRoot, 'payload.bin'), 'object-store-only-write\n');
  const objectId = runGit(repositoryRoot, 'hash-object', 'payload.bin');
  const objectPath = path.join(repositoryRoot, '.git', 'objects', objectId.slice(0, 2), objectId.slice(2));
  await assert.rejects(access(objectPath));
  const observed = await parallelProtocol.observeReadOnlyExecution({
    repositoryRoot,
    contract,
    unitId: 'audit',
    execute: async () => {
      runGit(repositoryRoot, 'hash-object', '-w', 'payload.bin');
      return { type: 'report', changed_paths: [], actual_writes: [] };
    }
  });

  await access(objectPath);
  assert.equal(observed.proof.verified, false);
  assert.match(observed.proof.errors.join('\n'), /persistent repository changes|read-only/i);
});

test('read-only observation includes ignored file contents in its persistent-state check', async (t) => {
  const repositoryRoot = await initGitRepository(t, 'sdcorejs-readonly-ignored-state-');
  await writeFile(path.join(repositoryRoot, '.gitignore'), 'ignored/**\n');
  runGit(repositoryRoot, 'add', '.gitignore');
  runGit(repositoryRoot, 'commit', '-m', 'ignore fixture output');
  const contract = { source: 'read-only-request', request_hash: 'request', scope_hash: 'scope', write_policy: 'deny' };
  const observed = await parallelProtocol.observeReadOnlyExecution({
    repositoryRoot,
    contract,
    unitId: 'audit',
    execute: async () => {
      await mkdir(path.join(repositoryRoot, 'ignored'), { recursive: true });
      await writeFile(path.join(repositoryRoot, 'ignored', 'persistent.txt'), 'ignored but persistent\n');
      return { type: 'report', changed_paths: [] };
    }
  });

  assert.equal(observed.proof.verified, false);
  assert.match(observed.proof.errors.join('\n'), /persistent repository changes|read-only/i);
});

test('read-only observation rejects switching to another branch at the same commit', async (t) => {
  const repositoryRoot = await initGitRepository(t, 'sdcorejs-readonly-branch-state-');
  const originalBranch = runGit(repositoryRoot, 'branch', '--show-current');
  runGit(repositoryRoot, 'branch', 'read-only-bypass');
  const contract = { source: 'read-only-request', request_hash: 'request', scope_hash: 'scope', write_policy: 'deny' };
  const observed = await parallelProtocol.observeReadOnlyExecution({
    repositoryRoot,
    contract,
    unitId: 'audit',
    execute: async () => {
      runGit(repositoryRoot, 'switch', 'read-only-bypass');
      return { type: 'report', changed_paths: [] };
    }
  });

  assert.notEqual(runGit(repositoryRoot, 'branch', '--show-current'), originalBranch);
  assert.equal(observed.proof.verified, false);
  assert.match(observed.proof.errors.join('\n'), /persistent repository changes|branch|HEAD|read-only/i);
});

test('read-only proof freshness ignores a caller-constant state callback', async (t) => {
  const repositoryRoot = await initGitRepository(t, 'sdcorejs-readonly-current-state-');
  const contract = { source: 'read-only-request', request_hash: 'request', scope_hash: 'scope', write_policy: 'deny' };
  const observed = await parallelProtocol.observeReadOnlyExecution({
    repositoryRoot,
    contract,
    unitId: 'audit',
    execute: async () => ({ type: 'report', changed_paths: [] }),
    readState: async () => 'caller-constant-state',
    readChangedPaths: async () => []
  });
  assert.equal(observed.proof.verified, true, observed.proof.errors?.join('\n'));
  await writeFile(path.join(repositoryRoot, 'late-write.txt'), 'persistent\n');

  const errors = await parallelProtocol.validateReadOnlyDispatchContext({
    schema_version: 2,
    contract,
    working_tree: { repo_root: repositoryRoot },
    runtime_capabilities: baseCapabilities,
    units: [{
      id: 'audit',
      workspace: { strategy: 'shared-readonly' },
      ownership: { allowed_paths: [], prohibited_paths: [] },
      result: observed.result,
      read_only_proof: observed.proof
    }]
  }, { readState: async () => 'caller-constant-state' });

  assert.match(errors.join('\n'), /repository state.*changed|stale.*read-only proof|persistent.*write/i);
});

test('approved ownership chain cannot be copied and reissued in another repository', async (t) => {
  const units = [{ id: 'u', ownership: { allowed_paths: ['src/**'], prohibited_paths: ['.git/**'] } }];
  const fixture = await trustedOwnershipFixture(t, units);
  const otherRepository = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-authority-copy-replay-'));
  t.after(() => cleanupTree(otherRepository));
  await cp(path.join(fixture.repositoryRoot, '.sdcorejs'), path.join(otherRepository, '.sdcorejs'), { recursive: true });

  const replayed = await parallelProtocol.verifyApprovedOwnershipAuthority({
    repositoryRoot: otherRepository,
    contract: fixture.contract,
    units,
    approvedSpecPath: fixture.approvedSpecPath,
    planContext: fixture.planContext
  });

  assert.equal(replayed.verified, false);
  assert.match(replayed.errors.join('\n'), /target_root.*repository|repository.*target_root|copied.*repository/i);
});

test('approved ownership chain rejects a target_root symlink or junction redirected to another repository', async (t) => {
  const units = [{ id: 'u', ownership: { allowed_paths: ['src/**'], prohibited_paths: ['.git/**'] } }];
  const fixture = await trustedOwnershipFixture(t, units, { cleanup: false });
  const redirectedRepository = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-authority-redirect-'));
  t.after(async () => {
    await unlink(fixture.repositoryRoot).catch(() => cleanupTree(fixture.repositoryRoot));
    await cleanupTree(redirectedRepository);
  });
  await cp(path.join(fixture.repositoryRoot, '.sdcorejs'), path.join(redirectedRepository, '.sdcorejs'), { recursive: true });
  await cleanupTree(fixture.repositoryRoot);
  await symlink(redirectedRepository, fixture.repositoryRoot, process.platform === 'win32' ? 'junction' : 'dir');

  const replayed = await parallelProtocol.verifyApprovedOwnershipAuthority({
    repositoryRoot: redirectedRepository,
    contract: fixture.contract,
    units,
    approvedSpecPath: fixture.approvedSpecPath,
    planContext: fixture.planContext
  });

  assert.equal(replayed.verified, false);
  assert.match(replayed.errors.join('\n'), /target_root.*alias|symlink|junction|repository.*identity|copied.*repository/i);
});

test('fan-in refuses standalone contractless report and cherry-pick execution', async () => {
  let applied = false;
  const result = await integrateResults({
    units: [{
      id: 'u', status: 'PASSED',
      result: {
        type: 'report', ref: 'report', base_head: 'base', associated_head_or_diff: 'report',
        output_digest: 'digest', exit_code: 0, changed_paths: []
      }
    }],
    integration: {
      workspace_path: '/integration', branch: 'integration', base_head: 'base',
      merge_strategy: 'cherry-pick', merge_order: ['u'], atomicity: 'independent-successes'
    },
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => { applied = true; },
    probe: async () => {},
    rollbackUnit: rollbackUnitPass,
    readPostIntegrationState: readIntegratedState,
    globalVerify: globalPass
  });

  assert.equal(result.status, 'INTEGRATION_BLOCKED');
  assert.match(result.reason, /fan-in.*authority|approved.*contract|result type.*merge/i);
  assert.equal(applied, false);
});

test('fan-in authority re-verifies approved files and rejects trusted-scope escape before apply', async (t) => {
  assert.equal(typeof parallelProtocol.verifyFanInAuthority, 'function');
  const repositoryRoot = await initGitRepository(t, 'sdcorejs-fanin-authority-');
  const units = [{
    id: 'u', status: 'PASSED',
    ownership: { allowed_paths: ['src/**'], prohibited_paths: ['.git/**'] },
    result: {
      type: 'commit', ref: 'u-ref', base_head: 'base', associated_head_or_diff: 'u-head',
      output_digest: 'digest', exit_code: 0, changed_paths: ['outside/file.js']
    }
  }];
  const fixture = await trustedOwnershipFixture(t, units, { repositoryRoot });
  units[0].contract_hash = fixture.contract.frozen_contract_hash;
  units[0].result.contract_hash = fixture.contract.frozen_contract_hash;
  const integration = {
    workspace_path: path.join(repositoryRoot, '.worktrees', 'integration'), branch: 'integration',
    base_head: 'base', merge_strategy: 'cherry-pick', merge_order: ['u'], atomicity: 'independent-successes'
  };
  const fanInAuthority = await parallelProtocol.verifyFanInAuthority({
    repositoryRoot,
    contract: fixture.contract,
    units,
    integration,
    approvedSpecPath: fixture.approvedSpecPath,
    planContext: fixture.planContext
  });
  assert.equal(fanInAuthority.verified, true, fanInAuthority.errors?.join('\n'));

  let applied = false;
  const result = await integrateResults({
    repositoryRoot,
    contract: fixture.contract,
    fanInAuthority,
    units,
    integration,
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => { applied = true; },
    probe: async () => {},
    rollbackUnit: rollbackUnitPass,
    readPostIntegrationState: readIntegratedState,
    globalVerify: globalPass
  });

  assert.equal(result.status, 'INTEGRATION_BLOCKED');
  assert.match(result.reason, /out-of-scope path|trusted ownership/i);
  assert.equal(applied, false);
});

test('fan-in reports ROLLBACK_FAILED when rollback callbacks leave the repository changed', async (t) => {
  assert.equal(typeof parallelProtocol.verifyFanInAuthority, 'function');
  const repositoryRoot = await initGitRepository(t, 'sdcorejs-fanin-rollback-state-');
  await writeFile(path.join(repositoryRoot, 'state.txt'), 'base\n');
  runGit(repositoryRoot, 'add', 'state.txt');
  runGit(repositoryRoot, 'commit', '-m', 'tracked state');
  const units = [{
    id: 'u', status: 'PASSED',
    ownership: { allowed_paths: ['state.txt'], prohibited_paths: ['.git/**'] },
    result: {
      type: 'commit', ref: 'u-ref', base_head: 'base', associated_head_or_diff: 'u-head',
      output_digest: 'digest', exit_code: 0, changed_paths: ['state.txt']
    }
  }];
  const fixture = await trustedOwnershipFixture(t, units, { repositoryRoot });
  units[0].contract_hash = fixture.contract.frozen_contract_hash;
  units[0].result.contract_hash = fixture.contract.frozen_contract_hash;
  const integration = {
    workspace_path: path.join(repositoryRoot, '.worktrees', 'integration'), branch: 'integration',
    base_head: 'base', merge_strategy: 'cherry-pick', merge_order: ['u'], atomicity: 'all-or-nothing',
    rollback_strategy: 'restore-base'
  };
  const fanInAuthority = await parallelProtocol.verifyFanInAuthority({
    repositoryRoot,
    contract: fixture.contract,
    units,
    integration,
    approvedSpecPath: fixture.approvedSpecPath,
    planContext: fixture.planContext
  });
  let globalRollbackCalls = 0;
  const result = await integrateResults({
    repositoryRoot,
    contract: fixture.contract,
    fanInAuthority,
    units,
    integration,
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => {
      await writeFile(path.join(repositoryRoot, 'state.txt'), 'mutated\n');
      throw new Error('partial apply');
    },
    probe: async () => {},
    rollbackUnit: async () => {},
    rollback: async () => { globalRollbackCalls += 1; },
    readPostIntegrationState: readIntegratedState,
    globalVerify: globalPass
  });

  assert.equal(result.status, 'ROLLBACK_FAILED');
  assert.equal(result.rollbackRequired, true);
  assert.equal(globalRollbackCalls, 1);
  assert.match(result.reason, /rollback.*did not restore|state.*mismatch|rollback failed/i);
});

test('fan-in rollback verification detects a persistent Git object-store write', async (t) => {
  const repositoryRoot = await initGitRepository(t, 'sdcorejs-fanin-rollback-object-store-');
  await writeFile(path.join(repositoryRoot, 'payload.bin'), 'rollback-object-store-only-write\n');
  const prepared = await prepareFanIn(t, {
    repositoryRoot,
    units: [{
      id: 'u', status: 'PASSED',
      ownership: { allowed_paths: ['src/u.js'], prohibited_paths: ['.git/**'] },
      result: {
        type: 'commit', ref: 'u-ref', base_head: 'base', associated_head_or_diff: 'u-head',
        output_digest: 'digest', exit_code: 0, changed_paths: ['src/u.js']
      }
    }],
    integration: { base_head: 'base', merge_order: ['u'], atomicity: 'independent-successes' }
  });
  const objectId = runGit(repositoryRoot, 'hash-object', 'payload.bin');
  const objectPath = path.join(repositoryRoot, '.git', 'objects', objectId.slice(0, 2), objectId.slice(2));
  await assert.rejects(access(objectPath));

  const result = await integrateResults({
    repositoryRoot,
    contract: prepared.fixture.contract,
    fanInAuthority: prepared.fanInAuthority,
    units: prepared.units,
    integration: prepared.integration,
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => {
      runGit(repositoryRoot, 'hash-object', '-w', 'payload.bin');
      throw new Error('partial apply');
    },
    probe: async () => {},
    rollbackUnit: async () => {},
    readPostIntegrationState: readIntegratedState,
    globalVerify: globalPass
  });

  await access(objectPath);
  assert.equal(result.status, 'ROLLBACK_FAILED');
  assert.equal(result.rollbackRequired, true);
  assert.match(result.reason, /rollback.*did not restore|repository state/i);
});

test('fan-in rollback verification rejects restoring the same commit on a different branch', async (t) => {
  const repositoryRoot = await initGitRepository(t, 'sdcorejs-fanin-rollback-branch-');
  await writeFile(path.join(repositoryRoot, 'state.txt'), 'base\n');
  runGit(repositoryRoot, 'add', 'state.txt');
  runGit(repositoryRoot, 'commit', '-m', 'tracked state');
  const originalBranch = runGit(repositoryRoot, 'branch', '--show-current');
  runGit(repositoryRoot, 'branch', 'rollback-bypass');
  const prepared = await prepareFanIn(t, {
    repositoryRoot,
    units: [{
      id: 'u', status: 'PASSED',
      ownership: { allowed_paths: ['state.txt'], prohibited_paths: ['.git/**'] },
      result: {
        type: 'commit', ref: 'u-ref', base_head: 'base', associated_head_or_diff: 'u-head',
        output_digest: 'digest', exit_code: 0, changed_paths: ['state.txt']
      }
    }],
    integration: { base_head: 'base', merge_strategy: 'cherry-pick', merge_order: ['u'], atomicity: 'all-or-nothing', rollback_strategy: 'restore-base' }
  });

  const result = await integrateResults({
    repositoryRoot,
    contract: prepared.fixture.contract,
    fanInAuthority: prepared.fanInAuthority,
    units: prepared.units,
    integration: prepared.integration,
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => {
      await writeFile(path.join(repositoryRoot, 'state.txt'), 'mutated\n');
      throw new Error('partial apply');
    },
    probe: async () => {},
    rollbackUnit: async () => {
      await writeFile(path.join(repositoryRoot, 'state.txt'), 'base\n');
      runGit(repositoryRoot, 'switch', 'rollback-bypass');
    },
    rollback: async () => {
      await writeFile(path.join(repositoryRoot, 'state.txt'), 'base\n');
    },
    readPostIntegrationState: readIntegratedState,
    globalVerify: globalPass
  });

  assert.notEqual(runGit(repositoryRoot, 'branch', '--show-current'), originalBranch);
  assert.equal(result.status, 'ROLLBACK_FAILED');
  assert.equal(result.rollbackRequired, true);
  assert.match(result.reason, /rollback.*branch|repository state|did not restore/i);
});

test('user-decision observation rejects a raw echo with an unbound filler attestation', async () => {
  const integration = {
    workspace_path: '/integration', branch: 'integration', base_head: 'base',
    merge_strategy: 'cherry-pick', merge_order: ['u'], atomicity: 'user-decision'
  };
  const units = [{
    id: 'u', status: 'PASSED', contract_hash: 'contract-hash',
    ownership: { allowed_paths: ['src/**'], prohibited_paths: [] },
    result: {
      type: 'commit', ref: 'u', base_head: 'base', associated_head_or_diff: 'u',
      output_digest: 'digest', exit_code: 0, changed_paths: ['src/u.js'], contract_hash: 'contract-hash'
    }
  }];
  const authority = await parallelProtocol.observeIntegrationDecision({
    contract: { ...approvedContract, frozen_contract_hash: 'contract-hash' },
    units,
    integration,
    effectiveAtomicity: 'independent-successes',
    decisionRef: 'decision-echo',
    observeDecision: async (decision) => ({
      ...decision,
      approved: true,
      decision_attestation: '0'.repeat(64)
    })
  });

  assert.equal(authority.verified, false);
  assert.match(authority.errors.join('\n'), /attestation|raw echo|parent.*decision/i);
});

test('fan-in lease is one-shot and binds merge strategy, result set, and compatible result type', async (t) => {
  const createUnit = (type = 'commit') => ({
    id: 'u', status: 'PASSED',
    result: {
      type, ref: 'u-ref', base_head: 'base', associated_head_or_diff: 'u-head',
      output_digest: 'digest', exit_code: 0, changed_paths: type === 'report' ? [] : ['src/u.js']
    }
  });
  const callbacks = {
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => {},
    probe: async () => {},
    rollbackUnit: rollbackUnitPass,
    readPostIntegrationState: readIntegratedState,
    globalVerify: globalPass
  };

  const strategyBound = await prepareFanIn(t, {
    units: [createUnit()],
    integration: { base_head: 'base', merge_strategy: 'cherry-pick', merge_order: ['u'], atomicity: 'independent-successes' }
  });
  const changedStrategy = await integrateResults({
    ...callbacks,
    repositoryRoot: strategyBound.repositoryRoot,
    contract: strategyBound.fixture.contract,
    fanInAuthority: strategyBound.fanInAuthority,
    units: strategyBound.units,
    integration: { ...strategyBound.integration, merge_strategy: 'patch' }
  });
  assert.equal(changedStrategy.status, 'INTEGRATION_BLOCKED');
  assert.match(changedStrategy.reason, /authority binding.*merge strategy|merge strategy.*authority binding/i);

  const resultBound = await prepareFanIn(t, {
    units: [createUnit()],
    integration: { base_head: 'base', merge_order: ['u'], atomicity: 'independent-successes' }
  });
  resultBound.units[0].result.output_digest = 'mutated-after-lease';
  const changedResult = await integrateResults({
    ...callbacks,
    repositoryRoot: resultBound.repositoryRoot,
    contract: resultBound.fixture.contract,
    fanInAuthority: resultBound.fanInAuthority,
    units: resultBound.units,
    integration: resultBound.integration
  });
  assert.equal(changedResult.status, 'INTEGRATION_BLOCKED');
  assert.match(changedResult.reason, /authority binding.*result set|result set.*authority binding/i);

  const oneShot = await prepareFanIn(t, {
    units: [createUnit()],
    integration: { base_head: 'base', merge_order: ['u'], atomicity: 'independent-successes' }
  });
  const oneShotInput = {
    ...callbacks,
    repositoryRoot: oneShot.repositoryRoot,
    contract: oneShot.fixture.contract,
    fanInAuthority: oneShot.fanInAuthority,
    units: oneShot.units,
    integration: oneShot.integration
  };
  assert.equal((await integrateResults(oneShotInput)).status, 'GLOBAL_VERIFIED');
  const replayed = await integrateResults(oneShotInput);
  assert.equal(replayed.status, 'INTEGRATION_BLOCKED');
  assert.match(replayed.reason, /fresh one-shot private authority/i);

  const report = await prepareFanIn(t, {
    units: [createUnit('report')],
    integration: {
      base_head: 'base', merge_strategy: 'cherry-pick', merge_order: ['u'], atomicity: 'independent-successes'
    }
  });
  const incompatible = await integrateResults({
    ...callbacks,
    repositoryRoot: report.repositoryRoot,
    contract: report.fixture.contract,
    fanInAuthority: report.fanInAuthority,
    units: report.units,
    integration: report.integration
  });
  assert.equal(incompatible.status, 'INTEGRATION_BLOCKED');
  assert.match(incompatible.reason, /result type.*merge_strategy/i);
});

test('fan-in authority refuses a plan changed after the approved chain was prepared', async (t) => {
  const repositoryRoot = await initGitRepository(t, 'sdcorejs-fanin-stale-plan-');
  const units = [{
    id: 'u', status: 'PASSED',
    ownership: { allowed_paths: ['src/u.js'], prohibited_paths: ['.git/**'] },
    result: {
      type: 'commit', ref: 'u', base_head: 'base', associated_head_or_diff: 'u',
      output_digest: 'digest', exit_code: 0, changed_paths: ['src/u.js']
    }
  }];
  const fixture = await trustedOwnershipFixture(t, units, { repositoryRoot });
  units[0].contract_hash = fixture.contract.frozen_contract_hash;
  units[0].result.contract_hash = fixture.contract.frozen_contract_hash;
  const integration = {
    workspace_path: path.join(repositoryRoot, '.worktrees', 'integration'), branch: 'integration',
    base_head: 'base', merge_strategy: 'cherry-pick', merge_order: ['u'], atomicity: 'independent-successes'
  };
  const planFile = path.join(repositoryRoot, fixture.contract.approved_plan_path);
  await writeFile(planFile, `${await readFile(planFile, 'utf8')}\nchanged after approval\n`);

  const authority = await parallelProtocol.verifyFanInAuthority({
    repositoryRoot,
    contract: fixture.contract,
    units,
    integration,
    approvedSpecPath: fixture.approvedSpecPath,
    planContext: fixture.planContext
  });
  assert.equal(authority.verified, false);
  assert.match(authority.errors.join('\n'), /fresh re-verification|approved plan hash|integrity hash|stale/i);
});

test('fan-in consumption refuses approval files changed after its lease was issued', async (t) => {
  const prepared = await prepareFanIn(t, {
    units: [{
      id: 'u', status: 'PASSED',
      result: {
        type: 'commit', ref: 'u', base_head: 'base', associated_head_or_diff: 'u',
        output_digest: 'digest', exit_code: 0, changed_paths: ['src/u.js']
      }
    }],
    integration: { base_head: 'base', merge_order: ['u'], atomicity: 'independent-successes' }
  });
  const planFile = path.join(prepared.repositoryRoot, prepared.fixture.contract.approved_plan_path);
  await writeFile(planFile, `${await readFile(planFile, 'utf8')}\nchanged after fan-in lease\n`);
  let applied = false;

  const result = await integrateResults({
    repositoryRoot: prepared.repositoryRoot,
    contract: prepared.fixture.contract,
    fanInAuthority: prepared.fanInAuthority,
    units: prepared.units,
    integration: prepared.integration,
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => { applied = true; },
    probe: async () => {},
    rollbackUnit: rollbackUnitPass,
    readPostIntegrationState: readIntegratedState,
    globalVerify: globalPass
  });

  assert.equal(result.status, 'INTEGRATION_BLOCKED');
  assert.match(result.reason, /approval.*changed|stale|re-verification|approved plan hash|integrity hash/i);
  assert.equal(applied, false);
});

test('fan-in revalidates approval files after parent callbacks and immediately before apply', async (t) => {
  const prepared = await prepareFanIn(t, {
    units: [{
      id: 'u', status: 'PASSED',
      result: {
        type: 'commit', ref: 'u', base_head: 'base', associated_head_or_diff: 'u',
        output_digest: 'digest', exit_code: 0, changed_paths: ['src/u.js']
      }
    }],
    integration: { base_head: 'base', merge_order: ['u'], atomicity: 'independent-successes' }
  });
  const planFile = path.join(prepared.repositoryRoot, prepared.fixture.contract.approved_plan_path);
  let applied = false;

  const result = await integrateResults({
    repositoryRoot: prepared.repositoryRoot,
    contract: prepared.fixture.contract,
    fanInAuthority: prepared.fanInAuthority,
    units: prepared.units,
    integration: prepared.integration,
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: async () => {
      await writeFile(planFile, `${await readFile(planFile, 'utf8')}\nchanged by pre-apply callback\n`);
      return 'checkpoint';
    },
    apply: async () => { applied = true; },
    probe: async () => {},
    rollbackUnit: rollbackUnitPass,
    readPostIntegrationState: readIntegratedState,
    globalVerify: globalPass
  });

  assert.equal(result.status, 'INTEGRATION_BLOCKED');
  assert.match(result.reason, /approval.*changed|stale|re-verification|approved plan hash|integrity hash/i);
  assert.equal(applied, false);
});

test('fan-in rejects an internally observed out-of-scope path written by apply', async (t) => {
  const prepared = await prepareFanIn(t, {
    units: [{
      id: 'u', status: 'PASSED',
      result: {
        type: 'commit', ref: 'u', base_head: 'base', associated_head_or_diff: 'u',
        output_digest: 'digest', exit_code: 0, changed_paths: ['src/u.js']
      }
    }],
    integration: { base_head: 'base', merge_order: ['u'], atomicity: 'independent-successes' }
  });
  const outsidePath = path.join(prepared.repositoryRoot, 'outside.txt');
  const result = await integrateResults({
    repositoryRoot: prepared.repositoryRoot,
    contract: prepared.fixture.contract,
    fanInAuthority: prepared.fanInAuthority,
    units: prepared.units,
    integration: prepared.integration,
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => { await writeFile(outsidePath, 'outside frozen ownership\n'); },
    probe: async () => {},
    rollbackUnit: async () => { await rm(outsidePath, { force: true }); },
    readPostIntegrationState: readIntegratedState,
    globalVerify: globalPass
  });

  assert.equal(result.status, 'INTEGRATION_BLOCKED');
  assert.match(result.reason, /internally observed|out-of-scope|trusted ownership|actual changed path/i);
  await assert.rejects(access(outsidePath));
});

test('fan-in rejects an approved-plan mutation performed by apply', async (t) => {
  const prepared = await prepareFanIn(t, {
    units: [{
      id: 'u', status: 'PASSED',
      result: {
        type: 'commit', ref: 'u', base_head: 'base', associated_head_or_diff: 'u',
        output_digest: 'digest', exit_code: 0, changed_paths: ['src/u.js']
      }
    }],
    integration: { base_head: 'base', merge_order: ['u'], atomicity: 'independent-successes' }
  });
  const planFile = path.join(prepared.repositoryRoot, prepared.fixture.contract.approved_plan_path);
  const originalPlan = await readFile(planFile, 'utf8');
  const result = await integrateResults({
    repositoryRoot: prepared.repositoryRoot,
    contract: prepared.fixture.contract,
    fanInAuthority: prepared.fanInAuthority,
    units: prepared.units,
    integration: prepared.integration,
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => { await writeFile(planFile, `${originalPlan}\nchanged during apply\n`); },
    probe: async () => {},
    rollbackUnit: async () => { await writeFile(planFile, originalPlan); },
    readPostIntegrationState: readIntegratedState,
    globalVerify: globalPass
  });

  assert.equal(result.status, 'INTEGRATION_BLOCKED');
  assert.match(result.reason, /approval.*changed|stale|re-verification|approved plan hash|integrity hash/i);
  assert.equal(await readFile(planFile, 'utf8'), originalPlan);
});

test('fan-in rejects a repository mutation performed by the integration probe', async (t) => {
  const prepared = await prepareFanIn(t, {
    units: [{
      id: 'u', status: 'PASSED',
      result: {
        type: 'commit', ref: 'u', base_head: 'base', associated_head_or_diff: 'u',
        output_digest: 'digest', exit_code: 0, changed_paths: ['src/u.js']
      }
    }],
    integration: { base_head: 'base', merge_order: ['u'], atomicity: 'independent-successes' }
  });
  const probeWrite = path.join(prepared.repositoryRoot, 'probe-write.txt');
  const result = await integrateResults({
    repositoryRoot: prepared.repositoryRoot,
    contract: prepared.fixture.contract,
    fanInAuthority: prepared.fanInAuthority,
    units: prepared.units,
    integration: prepared.integration,
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => {},
    probe: async () => { await writeFile(probeWrite, 'probe must be read only\n'); },
    rollbackUnit: async () => { await rm(probeWrite, { force: true }); },
    readPostIntegrationState: readIntegratedState,
    globalVerify: globalPass
  });

  assert.equal(result.status, 'INTEGRATION_BLOCKED');
  assert.match(result.reason, /probe.*changed repository state|persistent repository change|read-only/i);
  await assert.rejects(access(probeWrite));
});

test('global verification is bound to the internally captured post-apply repository state', async (t) => {
  const prepared = await prepareFanIn(t, {
    units: [{
      id: 'u', status: 'PASSED',
      result: {
        type: 'commit', ref: 'u', base_head: 'base', associated_head_or_diff: 'u',
        output_digest: 'digest', exit_code: 0, changed_paths: ['src/u.js']
      }
    }],
    integration: { base_head: 'base', merge_order: ['u'], atomicity: 'all-or-nothing', rollback_strategy: 'restore-base' }
  });
  const verificationWrite = path.join(prepared.repositoryRoot, 'verification-write.txt');
  const result = await integrateResults({
    repositoryRoot: prepared.repositoryRoot,
    contract: prepared.fixture.contract,
    fanInAuthority: prepared.fanInAuthority,
    units: prepared.units,
    integration: prepared.integration,
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => {},
    probe: async () => {},
    rollbackUnit: rollbackUnitPass,
    rollback: async () => { await rm(verificationWrite, { force: true }); },
    readPostIntegrationState: readIntegratedState,
    globalVerify: async ({ associated_head_or_diff, repository_state_digest }) => {
      await writeFile(verificationWrite, 'global verification must be read only\n');
      return { status: 'PASS', associated_head_or_diff, repository_state_digest, output_digest: 'global-digest' };
    }
  });

  assert.equal(result.status, 'GLOBAL_VERIFICATION_FAILED');
  assert.match(result.reason, /global verification.*repository state|post-apply repository state|persistent repository change/i);
  await assert.rejects(access(verificationWrite));
});

test('fan-in lease rejects a different repository recreated at the same target path', async (t) => {
  const prepared = await prepareFanIn(t, {
    units: [{
      id: 'u', status: 'PASSED',
      result: {
        type: 'commit', ref: 'u', base_head: 'base', associated_head_or_diff: 'u',
        output_digest: 'digest', exit_code: 0, changed_paths: ['src/u.js']
      }
    }],
    integration: { base_head: 'base', merge_order: ['u'], atomicity: 'independent-successes' }
  });
  const displacedRoot = `${prepared.repositoryRoot}-displaced`;
  t.after(() => cleanupTree(displacedRoot));
  await rename(prepared.repositoryRoot, displacedRoot);
  await mkdir(prepared.repositoryRoot, { recursive: true });
  runGit(prepared.repositoryRoot, 'init');
  runGit(prepared.repositoryRoot, 'config', 'user.email', 'replacement@example.com');
  runGit(prepared.repositoryRoot, 'config', 'user.name', 'Replacement Repository');
  await writeFile(path.join(prepared.repositoryRoot, 'README.md'), '# replacement repository\n');
  runGit(prepared.repositoryRoot, 'add', 'README.md');
  runGit(prepared.repositoryRoot, 'commit', '-m', 'replacement baseline');
  await cp(path.join(displacedRoot, '.sdcorejs'), path.join(prepared.repositoryRoot, '.sdcorejs'), { recursive: true });
  let applied = false;

  const result = await integrateResults({
    repositoryRoot: prepared.repositoryRoot,
    contract: prepared.fixture.contract,
    fanInAuthority: prepared.fanInAuthority,
    units: prepared.units,
    integration: prepared.integration,
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => { applied = true; },
    probe: async () => {},
    rollbackUnit: rollbackUnitPass,
    readPostIntegrationState: readIntegratedState,
    globalVerify: globalPass
  });

  assert.equal(result.status, 'INTEGRATION_BLOCKED');
  assert.match(result.reason, /repository.*identity|repository.*state|replay|binding/i);
  assert.equal(applied, false);
});

test('user-decision authority is invalid when the exact result set changes', async (t) => {
  const prepared = await prepareFanIn(t, {
    units: [{
      id: 'u', status: 'PASSED',
      result: {
        type: 'commit', ref: 'u', base_head: 'base', associated_head_or_diff: 'u',
        output_digest: 'digest', exit_code: 0, changed_paths: ['src/u.js']
      }
    }],
    integration: { base_head: 'base', merge_order: ['u'], atomicity: 'user-decision' }
  });
  const decisionAuthority = await parallelProtocol.observeIntegrationDecision({
    contract: prepared.fixture.contract,
    units: prepared.units,
    integration: prepared.integration,
    effectiveAtomicity: 'independent-successes',
    decisionRef: 'decision-result-set',
    observeDecision: attestIntegrationDecision
  });
  assert.equal(decisionAuthority.verified, true, decisionAuthority.errors?.join('\n'));
  prepared.units[0].result.output_digest = 'different-result';
  let applied = false;
  const result = await integrateResults({
    repositoryRoot: prepared.repositoryRoot,
    contract: prepared.fixture.contract,
    fanInAuthority: prepared.fanInAuthority,
    units: prepared.units,
    integration: { ...prepared.integration, user_decision: decisionAuthority },
    validate: parentPathPass,
    review: parentReviewPass,
    checkpoint: checkpointPass,
    apply: async () => { applied = true; },
    probe: async () => {},
    rollbackUnit: rollbackUnitPass,
    readPostIntegrationState: readIntegratedState,
    globalVerify: globalPass
  });
  assert.equal(result.status, 'USER_DECISION_REQUIRED');
  assert.equal(applied, false);
});
