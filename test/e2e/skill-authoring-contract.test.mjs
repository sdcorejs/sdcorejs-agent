import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  AUTHORING_SCHEMA_VERSION,
  PUBLIC_SKILL_CEILING,
  deriveAuthoringRepositoryState,
  evaluateNewSkillDecision,
  findInternalSkillLeaks,
  hashAuthoringContract,
  hashAuthoringFiles,
  validateAuthoringEvidence,
  validateAuthoringLifecycle,
  validateLiveAgentMatrix,
} from '../../authoring/evals/skill-authoring-contract.mjs';
import {
  REQUIRED_SCENARIO_IDS,
  runDeterministicAuthoringMatrix,
} from '../../authoring/evals/run-deterministic.mjs';
import { createApprovedArtifact } from '../../_refs/shared/approved-artifact.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const repositoryState = deriveAuthoringRepositoryState();
const currentRevision = execFileSync('git', ['rev-parse', 'HEAD'], {
  cwd: root,
  encoding: 'utf8',
  windowsHide: true,
}).trim();
const currentRepositoryId = 'github.com/sdcorejs/sdcorejs-agent';
const freshTargetRepositoryId = 'github.com/example/fresh-target';
const freshTargetRevision = 'd'.repeat(40);

function authoringArtifact({
  artifactPath,
  artifactId,
  contractId,
  approvalSource,
  approvedBy,
  ownerRepositoryId = currentRepositoryId,
  sourceRevision = currentRevision,
  requirementId,
  changeRef,
  body,
}) {
  const artifact = createApprovedArtifact({
    metadata: {
      schema_version: 1,
      artifact_id: artifactId,
      artifact_kind: 'release-evidence',
      contract_id: contractId,
      requirement_id: requirementId,
      change_ref: changeRef,
      track: 'workflow',
      stack_profile: 'general',
      owner_repository_id: ownerRepositoryId,
      owner_repository_role: ownerRepositoryId === currentRepositoryId ? 'portal' : 'module',
      owner_module_id: ownerRepositoryId === currentRepositoryId ? null : 'fresh-target',
      parent_repository_id: null,
      parent_references: [],
      approval_source: approvalSource,
      approved_by: approvedBy,
      approved_at: '2026-08-09T00:00:00.000Z',
      repository_relative_path: artifactPath,
      source_revision: sourceRevision,
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

function newTriggerApproval(proposal) {
  return authoringArtifact({
    artifactPath: '.sdcorejs/approvals/cross-repo-contract-design-new-trigger.json',
    artifactId: 'cross-repo-contract-design-new-trigger',
    contractId: 'skill-authoring-approval:v1',
    approvalSource: 'user-approved-skill-trigger',
    approvedBy: 'skill-pack-owner',
    requirementId: proposal.capability_id,
    changeRef: proposal.capability_id,
    body: {
      schema_version: 1,
      kind: 'approved-new-trigger',
      status: 'approved',
      approval_id: 'approval:cross-repo-contract-design:new-trigger',
      actor: 'skill-pack-owner',
      capability_id: proposal.capability_id,
      proposed_public_skills: proposal.proposed_public_skills,
      public_inventory_hash: repositoryState.public_inventory_hash,
      source_revision: currentRevision,
      evaluation_only: false,
    },
  });
}

function ceilingChangeApproval(proposal) {
  return authoringArtifact({
    artifactPath: '.sdcorejs/approvals/cross-repo-contract-design-ceiling-change.json',
    artifactId: 'cross-repo-contract-design-ceiling-change',
    contractId: 'skill-authoring-approval:v1',
    approvalSource: 'user-approved-skill-ceiling',
    approvedBy: 'skill-pack-owner',
    requirementId: proposal.capability_id,
    changeRef: proposal.capability_id,
    body: {
      schema_version: 1,
      kind: 'approved-ceiling-change',
      status: 'approved',
      approval_id: 'approval:cross-repo-contract-design:ceiling-change',
      actor: 'skill-pack-owner',
      capability_id: proposal.capability_id,
      proposed_public_skills: proposal.proposed_public_skills,
      public_inventory_hash: repositoryState.public_inventory_hash,
      source_revision: currentRevision,
      evaluation_only: false,
    },
  });
}

async function exists(candidate) {
  try {
    await access(candidate);
    return true;
  } catch {
    return false;
  }
}

async function markdownFiles(directory) {
  return (await readdir(directory, { recursive: true }))
    .map(String)
    .filter((file) => file.endsWith('.md'));
}

function distinctProposal(overrides = {}) {
  return {
    schema_version: 1,
    capability_id: 'cross-repo-contract-design',
    distinct_user_intent: true,
    distinct_lifecycle: true,
    distinct_artifact_or_execution_boundary: true,
    expressible_by_existing_surface: false,
    positive_routing_evidence: [{
      kind: 'routing-scenario',
      scenario_id: 'architecture-cross-repo-public-contract',
      polarity: 'positive-routing',
      artifact_ref: 'authoring/evals/scenarios.json',
      artifact_sha256: repositoryState.routing_matrix_hash,
    }],
    negative_routing_evidence: [{
      kind: 'routing-scenario',
      scenario_id: 'architecture-simple-four-field-drawer-bypass',
      polarity: 'negative-routing',
      artifact_ref: 'authoring/evals/scenarios.json',
      artifact_sha256: repositoryState.routing_matrix_hash,
    }],
    acceptable_surface_cost: true,
    current_public_count: 23,
    proposed_public_skills: ['sdcorejs-example'],
    ceiling: 23,
    inventory_hash: repositoryState.public_inventory_hash,
    approvals: { new_trigger: null, ceiling_change: null },
    approval_artifacts: [],
    fallback: null,
    ...overrides,
  };
}

test('new-skill decision gate defaults to reuse and enforces inventory approvals', () => {
  assert.equal(AUTHORING_SCHEMA_VERSION, 1);
  assert.equal(PUBLIC_SKILL_CEILING, 23);

  const overlap = evaluateNewSkillDecision(distinctProposal({
    capability_id: 'tdd',
    distinct_user_intent: false,
    distinct_lifecycle: false,
    distinct_artifact_or_execution_boundary: false,
    expressible_by_existing_surface: true,
    proposed_public_skills: ['sdcorejs-tdd', 'sdcorejs-receiving-review'],
    fallback: {
      kind: 'existing-skill-mode',
      owner: 'sdcorejs-test',
      rationale: 'TDD and feedback handling already have public owners.',
    },
  }));
  assert.equal(overlap.decision, 'use-existing-surface');
  assert.equal(overlap.current_public_count, 23);
  assert.equal(overlap.post_change_count, 25);
  assert.equal(overlap.ceiling, 23);
  assert.equal(overlap.create_public_skill, false);
  assert.deepEqual(overlap.approvals_required.sort(), ['ceiling-change', 'new-trigger']);

  const approvalMissing = evaluateNewSkillDecision(distinctProposal());
  assert.equal(approvalMissing.decision, 'blocked-approval');
  assert.deepEqual(approvalMissing.approvals_required.sort(), ['ceiling-change', 'new-trigger']);

  const approvedProposal = distinctProposal();
  const approvedTrigger = newTriggerApproval(approvedProposal);
  const approvedCeiling = ceilingChangeApproval(approvedProposal);
  approvedProposal.approvals = {
    new_trigger: approvedTrigger.reference,
    ceiling_change: approvedCeiling.reference,
  };
  approvedProposal.approval_artifacts = [approvedTrigger.artifact, approvedCeiling.artifact];
  const approvedDecision = evaluateNewSkillDecision(approvedProposal);
  assert.equal(approvedDecision.valid, true, approvedDecision.errors.join('\n'));
  assert.equal(approvedDecision.decision, 'create-public-skill');
  assert.equal(approvedDecision.post_change_count, 24);

  const overCeilingProposal = distinctProposal({
    proposed_public_skills: ['sdcorejs-example', 'sdcorejs-example-two'],
  });
  const overCeilingTrigger = newTriggerApproval(overCeilingProposal);
  const approvedCeilingChange = ceilingChangeApproval(overCeilingProposal);
  overCeilingProposal.approvals = {
    new_trigger: overCeilingTrigger.reference,
    ceiling_change: approvedCeilingChange.reference,
  };
  overCeilingProposal.approval_artifacts = [
    overCeilingTrigger.artifact,
    approvedCeilingChange.artifact,
  ];
  const overCeilingDecision = evaluateNewSkillDecision(overCeilingProposal);
  assert.equal(overCeilingDecision.valid, true, overCeilingDecision.errors.join('\n'));
  assert.equal(overCeilingDecision.decision, 'create-public-skill');
  assert.equal(overCeilingDecision.create_public_skill, true);
  assert.equal(overCeilingDecision.post_change_count, 25);
  assert.deepEqual(overCeilingDecision.approvals_required, []);

  const staleApproval = structuredClone(approvedProposal);
  staleApproval.approval_artifacts[0].body = staleApproval.approval_artifacts[0].body.replace(
    'skill-pack-owner',
    'mutated-owner',
  );
  assert.equal(evaluateNewSkillDecision(staleApproval).valid, false);

  assert.equal(repositoryState.public_count, 23);
  assert.equal(repositoryState.public_names.length, 23);

  const missingEvidence = distinctProposal({
    positive_routing_evidence: [],
    fallback: {
      kind: 'shared-reference',
      owner: '_refs/shared/example.md',
      rationale: 'No distinct trigger is proven.',
    },
  });
  assert.equal(evaluateNewSkillDecision(missingEvidence).decision, 'use-existing-surface');

  for (const field of [
    'distinct_user_intent',
    'distinct_lifecycle',
    'distinct_artifact_or_execution_boundary',
    'expressible_by_existing_surface',
    'acceptable_surface_cost',
  ]) {
    const malformed = distinctProposal();
    delete malformed[field];
    const result = evaluateNewSkillDecision(malformed);
    assert.equal(result.valid, false, field);
    assert.equal(result.create_public_skill, false, field);
  }

  const forgedInventory = evaluateNewSkillDecision(distinctProposal({
    current_public_count: 0,
    inventory_hash: `sha256:${'0'.repeat(64)}`,
    proposed_public_skills: ['sdcorejs-example', 'sdcorejs-example-two'],
  }));
  assert.equal(forgedInventory.valid, false);
  assert.equal(forgedInventory.current_public_count, 23);
  assert.equal(forgedInventory.create_public_skill, false);

  const emptyProposal = evaluateNewSkillDecision(distinctProposal({ proposed_public_skills: [] }));
  assert.equal(emptyProposal.valid, false);
  assert.equal(emptyProposal.create_public_skill, false);

  for (const mutate of [
    (candidate) => { candidate.positive_routing_evidence[0].scenario_id = 'invented'; },
    (candidate) => { candidate.negative_routing_evidence[0].artifact_sha256 = `sha256:${'f'.repeat(64)}`; },
    (candidate) => { candidate.approvals.new_trigger = true; },
    (candidate) => {
      candidate.approvals.new_trigger = {
        artifact_ref: 'not-an-approved-artifact.json',
        artifact_sha256: `sha256:${'a'.repeat(64)}`,
      };
    },
  ]) {
    const mutation = distinctProposal();
    mutate(mutation);
    const decision = evaluateNewSkillDecision(mutation);
    assert.equal(decision.valid, false);
    assert.equal(decision.create_public_skill, false);
  }
});

test('behavioral evidence rejects fabricated telemetry and incomplete lifecycle proof', async () => {
  const recordRoot = path.join(root, 'authoring/evals/records');
  const records = await Promise.all([
    'new-skill-pressure-baseline.json',
    'new-skill-pressure-green.json',
    'new-skill-pressure-refactor.json',
  ].map(async (file) => JSON.parse(await readFile(path.join(recordRoot, file), 'utf8'))));
  const [baseline, green] = records;
  const result = validateAuthoringEvidence(baseline);
  assert.equal(result.valid, true, result.errors.join('\n'));
  assert.equal(validateAuthoringLifecycle(records).valid, true, validateAuthoringLifecycle(records).errors.join('\n'));
  assert.equal(baseline.result, 'EXPECTED_FAIL');
  assert.equal(green.result, 'PASS');
  assert.equal(baseline.fresh_target_project_validation, false);
  assert.equal(baseline.token_usage, null);
  assert.equal(baseline.structured_gate_available, false);
  assert.equal(baseline.source_state, 'clean repository revision baseline');
  assert.equal(baseline.baseline_source.repository_id, currentRepositoryId);
  assert.equal(baseline.baseline_source.revision, baseline.source_revision);
  assert.equal(baseline.baseline_source.public_count, 21);
  assert.equal(baseline.baseline_source.public_names.length, 21);
  assert.match(baseline.baseline_source.public_inventory_hash, /^sha256:[a-f0-9]{64}$/u);
  assert.deepEqual(baseline.baseline_source.candidate_paths_absent, [
    'authoring/evals/scenarios.json',
    'authoring/evals/skill-authoring-contract.mjs',
    'authoring/skills/sdcorejs-skill-authoring/SKILL.md',
  ]);
  assert.equal(baseline.baseline_execution.kind, 'isolated-agent');
  assert.equal(baseline.baseline_execution.result, 'EXPECTED_FAIL');
  assert.equal(baseline.baseline_execution.observed_public_count, 21);
  assert.equal(baseline.baseline_execution.proposed_public_skill_count, 3);
  assert.equal(baseline.baseline_execution.post_change_count, 24);
  assert.equal(baseline.baseline_execution.ceiling, 23);
  assert.equal(
    baseline.visible_output_bytes,
    Buffer.byteLength(baseline.sanitized_output, 'utf8'),
  );

  for (const mutate of [
    (record) => { record.baseline_source.public_count = 22; },
    (record) => { record.baseline_source.public_inventory_hash = `sha256:${'f'.repeat(64)}`; },
    (record) => { record.baseline_source.public_names = record.baseline_source.public_names.slice(1); },
    (record) => { record.baseline_source.candidate_paths_absent = []; },
    (record) => { record.baseline_execution.observed_public_count = 22; },
    (record) => { record.baseline_execution.post_change_count = 23; },
    (record) => { record.baseline_execution.transcript_sha256 = `sha256:${'f'.repeat(64)}`; },
  ]) {
    const mutation = structuredClone(baseline);
    mutate(mutation);
    assert.equal(validateAuthoringEvidence(mutation).valid, false);
  }

  for (const mutate of [
    (record) => { record.source_revision = null; },
    (record) => { record.approval_complete = null; },
    (record) => { record.ownership_complete = null; },
    (record) => { record.verification_complete = null; },
    (record) => { record.sanitized_transcript_ref = null; },
    (record) => { record.visible_output_bytes += 1; },
    (record) => { record.token_usage = 1234; record.token_usage_source = null; },
    (record) => { record.token_usage = 1234; record.token_usage_source = 'self-reported'; },
    (record) => { record.phase = 'GREEN'; record.result = 'PASS'; record.task_success = false; record.verification_complete = false; },
  ]) {
    const mutation = structuredClone(baseline);
    mutate(mutation);
    assert.equal(validateAuthoringEvidence(mutation).valid, false);
  }

  const brokenSequence = structuredClone(records);
  brokenSequence[2].behavior_contract_hash = `sha256:${'f'.repeat(64)}`;
  assert.equal(validateAuthoringLifecycle(brokenSequence).valid, false);

  const fabricatedRevision = structuredClone(records);
  fabricatedRevision[1].source_revision = 'f'.repeat(40);
  assert.equal(validateAuthoringLifecycle(fabricatedRevision).valid, false);

  const fabricatedState = structuredClone(records);
  fabricatedState[1].source_state_hash = `sha256:${'f'.repeat(64)}`;
  assert.equal(validateAuthoringLifecycle(fabricatedState).valid, false);

  const missingTranscript = structuredClone(records);
  missingTranscript[1].sanitized_transcript_ref = 'does/not/exist.json';
  assert.equal(validateAuthoringLifecycle(missingTranscript).valid, false);

  assert.doesNotThrow(() => validateAuthoringLifecycle([null, null, null]));
  assert.equal(validateAuthoringLifecycle([null, null, null]).valid, false);

  const unrelatedPath = 'authoring/README.md';
  const unrelatedHash = await hashAuthoringFiles(root, [unrelatedPath]);
  for (const [manifestField, hashField] of [
    ['source_state_manifest', 'source_state_hash'],
    ['contract_manifest', 'contract_hash'],
    ['behavior_manifest', 'behavior_contract_hash'],
  ]) {
    const unrelatedSubstitution = structuredClone(records);
    unrelatedSubstitution[0][manifestField] = [{ path: unrelatedPath, sha256: unrelatedHash }];
    unrelatedSubstitution[0][hashField] = unrelatedHash;
    assert.equal(validateAuthoringLifecycle(unrelatedSubstitution).valid, false, manifestField);
  }

  assert.equal(records[2].contract_hash, await hashAuthoringContract(root));
});

test('deterministic matrix runs all required safety scenarios without a provider', async () => {
  assert.deepEqual(REQUIRED_SCENARIO_IDS, [
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
  const report = await runDeterministicAuthoringMatrix({ root });
  assert.equal(report.schema_version, 1);
  assert.equal(report.provider_calls, 0);
  assert.equal(report.ambient_credentials_read, false);
  assert.equal(report.result, 'PASS', JSON.stringify(report.scenarios, null, 2));
  assert.equal(report.scenarios.length, REQUIRED_SCENARIO_IDS.length);
  assert.deepEqual(report.scenarios.map(({ id }) => id), REQUIRED_SCENARIO_IDS);
  assert.ok(report.scenarios.every(({ task_success: success }) => success === true));
  assert.ok(report.scenarios.every(({ mutation_caught: caught }) => caught === true));
  assert.ok(report.scenarios.every(({ model }) => model === 'not-applicable'));
  assert.ok(report.scenarios.every(({ token_usage: tokenUsage }) => tokenUsage === null));
  assert.match(report.source_hash, /^sha256:[a-f0-9]{64}$/u);
  assert.match(report.contract_hash, /^sha256:[a-f0-9]{64}$/u);
  assert.equal(report.contract_hash, await hashAuthoringContract(root));
});

test('live-agent matrix is structured NOT RUN evidence without fabricated coverage', async () => {
  const matrix = JSON.parse(await readFile(
    path.join(root, 'authoring/evals/live-agent-matrix.json'),
    'utf8',
  ));
  const result = validateLiveAgentMatrix(matrix);
  assert.equal(result.valid, true, result.errors.join('\n'));
  assert.equal(matrix.result, 'NOT RUN');
  assert.equal(matrix.explicit_authorization, false);
  assert.equal(matrix.token_usage, null);
  assert.equal(matrix.transcript_ref, null);
  assert.equal(matrix.fresh_target_project_validation, false);
  assert.match(matrix.exact_reason, /explicit authorization was not provided/iu);

  for (const mutate of [
    (candidate) => { candidate.result = 'PASS'; },
    (candidate) => { candidate.token_usage = 10; },
    (candidate) => { candidate.transcript_ref = 'fabricated.json'; },
    (candidate) => { candidate.exact_reason = ''; },
    (candidate) => { candidate.full_live_agent_coverage = true; },
    (candidate) => { candidate.scenarios = candidate.scenarios.slice(0, 1); },
    (candidate) => { candidate.scenarios[0] = null; },
  ]) {
    const mutation = structuredClone(matrix);
    mutate(mutation);
    assert.equal(validateLiveAgentMatrix(mutation).valid, false);
  }


  const malformedAuthorized = structuredClone(matrix);
  malformedAuthorized.explicit_authorization = true;
  malformedAuthorized.result = 'PASS';
  malformedAuthorized.scenarios = [null];
  assert.equal(validateLiveAgentMatrix(malformedAuthorized).valid, false);

  const transcriptRef = 'test/e2e/fixtures/skill-authoring-live-transcript.json';
  const authorizationRef = 'test/e2e/fixtures/skill-authoring-live-authorization.json';
  const transcriptHash = await hashAuthoringFiles(root, [transcriptRef]);
  const scenarioArtifacts = [];
  const authorizedScenarios = [];
  for (const id of REQUIRED_SCENARIO_IDS) {
    const scenarioTranscriptRef = `test/e2e/fixtures/skill-authoring-live/${id}.json`;
    const scenarioTranscriptHash = await hashAuthoringFiles(root, [scenarioTranscriptRef]);
    const scenarioBody = {
      schema_version: 1,
      kind: 'live-agent-scenario-run',
      scenario_id: id,
      target_repository_id: freshTargetRepositoryId,
      target_revision: freshTargetRevision,
      result: 'PASS',
      task_success: true,
      verification_complete: true,
      provider: 'fixture-provider',
      model: 'fixture-model',
      effort: 'fixture-effort',
      cli_runtime_version: 'fixture-cli-1.0.0',
      token_usage: 1,
      token_usage_source: 'provider-response',
      transcript_ref: scenarioTranscriptRef,
      transcript_sha256: scenarioTranscriptHash,
      exact_reason: 'Fixture scenario completed from a target-bound run receipt.',
    };
    const receipt = authoringArtifact({
      artifactPath: `test/e2e/fixtures/skill-authoring-live/${id}-receipt.json`,
      artifactId: `skill-authoring-live-${id}`,
      contractId: 'skill-authoring-live-run:v1',
      approvalSource: 'provider-execution-receipt',
      approvedBy: 'fixture-provider',
      ownerRepositoryId: freshTargetRepositoryId,
      sourceRevision: freshTargetRevision,
      requirementId: id,
      changeRef: matrix.matrix_id,
      body: scenarioBody,
    });
    scenarioArtifacts.push(receipt.artifact);
    authorizedScenarios.push({
      id,
      ...Object.fromEntries([
        'result',
        'task_success',
        'verification_complete',
        'provider',
        'model',
        'effort',
        'cli_runtime_version',
        'token_usage',
        'token_usage_source',
        'transcript_ref',
        'transcript_sha256',
        'exact_reason',
      ].map((field) => [field, scenarioBody[field]])),
      receipt_ref: receipt.reference,
    });
  }
  const authorization = authoringArtifact({
    artifactPath: authorizationRef,
    artifactId: 'fixture-live-authoring-approval',
    contractId: 'skill-authoring-live-approval:v1',
    approvalSource: 'user-approved-live-agent-evaluation',
    approvedBy: 'test-fixture-owner',
    requirementId: matrix.matrix_id,
    changeRef: matrix.matrix_id,
    body: {
      schema_version: 1,
      kind: 'credentialed-provider-evaluation',
      status: 'approved',
      approval_id: 'fixture-live-authoring-approval',
      actor: 'test-fixture-owner',
      scope: 'complete ten-scenario authoring live matrix',
      source_revision: currentRevision,
      provider: 'fixture-provider',
      model: 'fixture-model',
      effort: 'fixture-effort',
      cli_runtime_version: 'fixture-cli-1.0.0',
      matrix_id: matrix.matrix_id,
      target_repository_id: freshTargetRepositoryId,
      target_revision: freshTargetRevision,
      matrix_transcript_ref: transcriptRef,
      matrix_transcript_sha256: transcriptHash,
      scenario_ids: REQUIRED_SCENARIO_IDS,
      evaluation_only: true,
    },
  });
  const authorized = {
    ...structuredClone(matrix),
    evaluation_mode: true,
    explicit_authorization: true,
    provider: 'fixture-provider',
    model: 'fixture-model',
    effort: 'fixture-effort',
    cli_runtime_version: 'fixture-cli-1.0.0',
    result: 'PASS',
    exact_reason: 'All authorized fixture scenarios passed with source-bound evidence.',
    token_usage: REQUIRED_SCENARIO_IDS.length,
    token_usage_source: 'provider-response',
    transcript_ref: transcriptRef,
    transcript_sha256: transcriptHash,
    authorization: authorization.reference,
    approval_artifacts: [authorization.artifact],
    run_receipts: scenarioArtifacts,
    target_repository_id: freshTargetRepositoryId,
    target_revision: freshTargetRevision,
    full_live_agent_coverage: true,
    fresh_target_project_validation: true,
    scenarios: authorizedScenarios,
  };
  assert.equal(validateLiveAgentMatrix(authorized).valid, true, validateLiveAgentMatrix(authorized).errors.join('\n'));

  const contradictoryAggregate = structuredClone(authorized);
  contradictoryAggregate.scenarios[0].result = 'FAIL';
  contradictoryAggregate.scenarios[0].task_success = false;
  contradictoryAggregate.scenarios[0].verification_complete = false;
  assert.equal(validateLiveAgentMatrix(contradictoryAggregate).valid, false);

  const providerMismatch = structuredClone(authorized);
  providerMismatch.scenarios[0].provider = 'other-provider';
  assert.equal(validateLiveAgentMatrix(providerMismatch).valid, false);

  const tokenMismatch = structuredClone(authorized);
  tokenMismatch.token_usage += 1;
  assert.equal(validateLiveAgentMatrix(tokenMismatch).valid, false);

  const missingTranscript = structuredClone(authorized);
  missingTranscript.scenarios[0].transcript_ref = 'does/not/exist.json';
  assert.equal(validateLiveAgentMatrix(missingTranscript).valid, false);

  const reusedReceipt = structuredClone(authorized);
  reusedReceipt.scenarios[1].receipt_ref = reusedReceipt.scenarios[0].receipt_ref;
  assert.equal(validateLiveAgentMatrix(reusedReceipt).valid, false);

  const unsupportedFreshness = structuredClone(authorized);
  unsupportedFreshness.fresh_target_project_validation = false;
  assert.equal(validateLiveAgentMatrix(unsupportedFreshness).valid, false);

  const staleReceipt = structuredClone(authorized);
  staleReceipt.run_receipts[0].body = staleReceipt.run_receipts[0].body.replace(
    'fixture-provider',
    'mutated-provider',
  );
  assert.equal(validateLiveAgentMatrix(staleReceipt).valid, false);

  const extraReceipt = structuredClone(authorized);
  extraReceipt.run_receipts.push(structuredClone(extraReceipt.run_receipts[0]));
  assert.equal(validateLiveAgentMatrix(extraReceipt).valid, false);
});

test('internal authoring capability is initialized but excluded from every public distribution surface', async () => {
  const skillPath = path.join(root, 'authoring/skills/sdcorejs-skill-authoring/SKILL.md');
  const metadataPath = path.join(root, 'authoring/skills/sdcorejs-skill-authoring/agents/openai.yaml');
  const [skill, metadata, readme, packageSource] = await Promise.all([
    readFile(skillPath, 'utf8'),
    readFile(metadataPath, 'utf8'),
    readFile(path.join(root, 'authoring/README.md'), 'utf8'),
    readFile(path.join(root, 'package.json'), 'utf8'),
  ]);
  assert.match(skill, /^name:\s*sdcorejs-skill-authoring$/mu);
  assert.match(skill, /^description:\s*Use when\b/mu);
  assert.match(skill, /RED[\s\S]*GREEN[\s\S]*REFACTOR/u);
  assert.match(skill, /public count[\s\S]*ceiling 23/iu);
  assert.match(skill, /positive[\s\S]*negative[\s\S]*(?:pressure|mutation)/iu);
  assert.match(metadata, /allow_implicit_invocation:\s*false/u);
  assert.match(readme, /internal-only/iu);
  assert.match(readme, /must not be installed/iu);

  const publicFiles = await markdownFiles(path.join(root, 'skills'));
  assert.equal(publicFiles.length, 23);
  assert.equal(publicFiles.some((file) => file.includes('skill-authoring')), false);
  for (const mirror of ['skills', '.claude', 'plugin', 'codex', '.cursor', '.github', 'site']) {
    if (!await exists(path.join(root, mirror))) continue;
    const entries = await readdir(path.join(root, mirror), { recursive: true });
    assert.equal(entries.map(String).some((entry) => /sdcorejs-skill-authoring/iu.test(entry)), false, mirror);
  }

  for (const relative of [
    '.github/sdcorejs-harness.json',
    '.claude/sdcorejs-harness.json',
    'plugin/sdcorejs-harness.json',
    'codex/sdcorejs-harness.json',
    'site/src/components/SkillCatalog.astro',
  ]) {
    if (!await exists(path.join(root, relative))) continue;
    assert.doesNotMatch(await readFile(path.join(root, relative), 'utf8'), /sdcorejs-skill-authoring/u, relative);
  }

  const packageJson = JSON.parse(packageSource);
  assert.equal(
    packageJson.scripts['test:e2e:skill-authoring'],
    'node --test test/e2e/skill-authoring-contract.test.mjs',
  );
  assert.match(packageJson.scripts['test:e2e:repository'], /skill-authoring-contract\.test\.mjs/u);

  assert.deepEqual(findInternalSkillLeaks({ root }), []);
  const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'sdcorejs-authoring-leak-'));
  try {
    const internalPath = path.join(
      fixtureRoot,
      'authoring/skills/sdcorejs-skill-authoring/SKILL.md',
    );
    const leakedPath = path.join(
      fixtureRoot,
      '.claude/skills/internal-authoring/SKILL.md',
    );
    await mkdir(path.dirname(internalPath), { recursive: true });
    await mkdir(path.dirname(leakedPath), { recursive: true });
    await writeFile(internalPath, skill, 'utf8');
    const renamedSkill = skill.replace(
      /^name:\s*sdcorejs-skill-authoring$/mu,
      'name: renamed-internal-authoring',
    );
    await writeFile(leakedPath, renamedSkill, 'utf8');
    const wrappedPath = path.join(fixtureRoot, 'docs/internal-authoring.astro');
    const rootTextPath = path.join(fixtureRoot, 'internal-authoring.txt');
    await mkdir(path.dirname(wrappedPath), { recursive: true });
    const internalBody = skill.split(/^---\s*$/mu).slice(2).join('---').replace(/\s+/gu, ' ').trim();
    await writeFile(wrappedPath, `<article>${internalBody}</article>\n`, 'utf8');
    await writeFile(
      rootTextPath,
      renamedSkill.replace('behavioral evidence', 'behavior proofs'),
      'utf8',
    );
    assert.deepEqual(
      findInternalSkillLeaks({ root: fixtureRoot }),
      [
        '.claude/skills/internal-authoring/SKILL.md',
        'docs/internal-authoring.astro',
        'internal-authoring.txt',
      ],
    );
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

test('deterministic authoring sources cannot access ambient credentials or providers', async () => {
  const files = [
    'authoring/evals/skill-authoring-contract.mjs',
    'authoring/evals/run-deterministic.mjs',
  ];
  const source = (await Promise.all(files.map((file) =>
    readFile(path.join(root, file), 'utf8')))).join('\n');
  assert.doesNotMatch(source, /process\.env|OPENAI_API_KEY|ANTHROPIC_API_KEY|fetch\s*\(|https?:\/\//u);
  assert.doesNotMatch(source, /(?:from|import\s*\()\s*['"](?:openai|@anthropic-ai|axios)/u);

  const manifests = await Promise.all([
    'package.json',
    'package-lock.json',
    'site/package.json',
    'site/package-lock.json',
  ].map(async (file) => [file, JSON.parse(await readFile(path.join(root, file), 'utf8'))]));
  const providerDependency = /^(?:openai|@anthropic-ai\/|@google\/genai$|@google\/generative-ai$|cohere-ai$|mistralai$|groq-sdk$)/u;
  for (const [file, manifest] of manifests) {
    const dependencyNames = new Set([
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.devDependencies ?? {}),
      ...Object.keys(manifest.optionalDependencies ?? {}),
      ...Object.keys(manifest.packages ?? {}).map((entry) => entry.replace(/^node_modules\//u, '')),
    ]);
    assert.equal([...dependencyNames].some((name) => providerDependency.test(name)), false, file);
  }
});
