import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  evaluateExternalReviewFeedback,
  evaluateRepairContract,
  repairAttemptCap,
} from '../../_refs/orchestration/repair-contract.mjs';
import { createApprovedArtifact } from '../../_refs/shared/approved-artifact.mjs';
import { systemRegistry } from '../../_refs/shared/system-registry.mjs';

const BASE_REVISION = 'b'.repeat(40);
const RESULT_REVISION = 'c'.repeat(40);
const HASH_A = `sha256:${'a'.repeat(64)}`;
const HASH_B = `sha256:${'b'.repeat(64)}`;
const HASH_C = `sha256:${'c'.repeat(64)}`;
const OWNER_REPOSITORY_ID = 'github.com/acme/agent-module';

function releaseEvidenceArtifact({
  artifactPath,
  artifactId,
  contractId,
  approvalSource,
  sourceRevision,
  changeRef,
  body,
}) {
  const artifact = createApprovedArtifact({
    metadata: {
      schema_version: 1,
      artifact_id: artifactId,
      artifact_kind: 'release-evidence',
      contract_id: contractId,
      requirement_id: changeRef,
      change_ref: changeRef,
      track: 'workflow',
      stack_profile: 'general',
      owner_repository_id: OWNER_REPOSITORY_ID,
      owner_repository_role: 'module',
      owner_module_id: 'agent-module',
      parent_repository_id: null,
      parent_references: [],
      approval_source: approvalSource,
      approved_by: approvalSource,
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

function repositorySnapshot() {
  return releaseEvidenceArtifact({
    artifactPath: '.sdcorejs/evidence/repair-repository-snapshot.json',
    artifactId: 'repair-repository-snapshot',
    contractId: 'repair-repository-snapshot:v1',
    approvalSource: 'trusted-repository-snapshot',
    sourceRevision: RESULT_REVISION,
    changeRef: 'repair-snapshot',
    body: {
      schema_version: 1,
      kind: 'repository-snapshot',
      repository_id: OWNER_REPOSITORY_ID,
      snapshot_revision: RESULT_REVISION,
      revisions: [
        {
          revision: BASE_REVISION,
          files: [
            { path: 'src/agent/approval.ts', sha256: HASH_A, locators: ['FILE', 'L42'] },
            { path: 'test/approval.test.ts', sha256: HASH_A, locators: ['FILE', 'L88'] },
            { path: '.sdcorejs/conventions/module/naming/rule.md', sha256: HASH_A, locators: ['FILE', 'rule-naming'] },
          ],
        },
        {
          revision: RESULT_REVISION,
          files: [
            { path: 'src/agent/approval.ts', sha256: HASH_B, locators: ['FILE', 'L42'] },
            { path: 'test/approval.test.ts', sha256: HASH_B, locators: ['FILE', 'L88'] },
          ],
        },
      ],
    },
  });
}

function reviewAssessment({
  evidenceRefs = ['src/agent/approval.ts#L42'],
  verification = {},
  proposedChange = { kind: 'mechanical', migration_decision: null },
} = {}) {
  const conflicts = [...(verification.conflicts ?? [])]
    .map(({ kind, reference, owner }) => ({ kind, reference, owner }))
    .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
  const migrationDecision = proposedChange.migration_decision === null
    ? null
    : {
      artifact_ref: proposedChange.migration_decision?.artifact_ref ?? null,
      approval_hash: proposedChange.migration_decision?.approval_hash ?? null,
      decision_id: proposedChange.migration_decision?.decision_id ?? null,
    };
  return releaseEvidenceArtifact({
    artifactPath: '.sdcorejs/evidence/ext-001-review-assessment.json',
    artifactId: 'ext-001-review-assessment',
    contractId: 'repair-review-assessment:v1',
    approvalSource: 'independent-review-verifier',
    sourceRevision: BASE_REVISION,
    changeRef: 'EXT-001',
    body: {
      schema_version: 1,
      kind: 'review-assessment',
      finding_id: 'EXT-001',
      repository_id: OWNER_REPOSITORY_ID,
      revision: BASE_REVISION,
      verifier: 'independent-review-verifier',
      evidence_refs: evidenceRefs,
      current_context_read: verification.current_context_read ?? true,
      current_locator_matches: verification.current_locator_matches ?? true,
      scope_applies: verification.scope_applies ?? true,
      technical_claim_supported: verification.technical_claim_supported ?? true,
      existing_mechanism_satisfies: verification.existing_mechanism_satisfies ?? false,
      reverify_command: verification.reverify_command ?? 'npm run test:approval',
      conflicts,
      proposed_change: {
        kind: proposedChange.kind,
        migration_decision_identity: migrationDecision,
      },
    },
  });
}

function evidence({
  kind = 'file',
  path = 'src/agent/approval.ts',
  locator = 'L42',
  revision = BASE_REVISION,
  sha256 = HASH_A,
  summary = 'The mutation path does not compare the resource version.',
} = {}) {
  return {
    kind,
    reference: `${path}#${locator}`,
    repository_id: 'github.com/acme/agent-module',
    revision,
    path,
    locator,
    sha256,
    summary,
  };
}

function repairApproval({
  findingId = 'R-1',
  kind = 'owner-write-authority',
  actor = 'agent-module-owner',
  scopePaths = ['src/agent'],
  changeKind,
  decisionRef,
  decisionId,
  artifactPath = `.sdcorejs/approvals/${findingId.toLowerCase()}-${kind}.json`,
} = {}) {
  const body = {
    schema_version: 1,
    kind,
    status: 'approved',
    approval_id: `approval:${findingId}:${kind}`,
    actor,
    finding_id: findingId,
    base_revision: BASE_REVISION,
    scope_paths: scopePaths,
    ...(changeKind === undefined ? {} : { change_kind: changeKind }),
    ...(decisionRef === undefined ? {} : { decision_ref: decisionRef }),
    ...(decisionId === undefined ? {} : { decision_id: decisionId }),
  };
  const artifact = createApprovedArtifact({
    metadata: {
      schema_version: 1,
      artifact_id: `repair-${findingId}-${kind}`,
      artifact_kind: 'release-evidence',
      contract_id: 'repair-approval:v1',
      requirement_id: findingId,
      change_ref: findingId,
      track: 'workflow',
      stack_profile: 'general',
      owner_repository_id: 'github.com/acme/agent-module',
      owner_repository_role: 'module',
      owner_module_id: 'agent-module',
      parent_repository_id: null,
      parent_references: [],
      approval_source: kind === 'approved-migration-decision'
        ? 'user-approved-migration-decision'
        : 'user-approved-repair-authority',
      approved_by: actor,
      approved_at: '2026-08-09T00:00:00.000Z',
      repository_relative_path: artifactPath,
      source_revision: BASE_REVISION,
      supersedes: null,
    },
    body: `${JSON.stringify(body)}\n`,
  });
  return {
    artifact,
    reference: {
      artifact_ref: artifactPath,
      approval_hash: artifact.metadata.approval_hash,
      ...(decisionId === undefined ? {} : { decision_id: decisionId }),
    },
  };
}

function baseRepairAttempt({
  attempt = 1,
  validationResult = 'PASSED',
  verificationCommand = 'npm test',
} = {}) {
  return {
    attempt,
    changed_paths: ['src/agent/approval.ts'],
    result_revision: RESULT_REVISION,
    change_manifest: [{
      path: 'src/agent/approval.ts',
      before_sha256: HASH_A,
      after_sha256: HASH_B,
    }],
    validation_result: validationResult,
    repaired_evidence: {
      original_evidence_ref: 'review:R-1:before',
      repository_id: 'github.com/acme/agent-module',
      evidence_ref: 'src/agent/approval.ts#L42',
      revision: RESULT_REVISION,
      path: 'src/agent/approval.ts',
      locator: 'L42',
      sha256: HASH_B,
    },
    test_integrity: {
      verifier: 'contract-hash-v1',
      tests_changed: false,
      test_paths: [],
      before_contract_hash: HASH_C,
      after_contract_hash: HASH_C,
      assertion_ids_before: ['R-1-resource-version-denial'],
      assertion_ids_after: ['R-1-resource-version-denial'],
    },
    verification_command: verificationCommand,
  };
}

function commandReceipt({ findingId, attempt, validationResult, verificationCommand }) {
  const projection = baseRepairAttempt({ attempt, validationResult, verificationCommand });
  const commandId = verificationCommand.replace(/[^A-Za-z0-9]+/gu, '-').replace(/^-|-$/gu, '').toLowerCase();
  return releaseEvidenceArtifact({
    artifactPath: `.sdcorejs/evidence/${findingId.toLowerCase()}-${attempt}-${commandId}-${validationResult.toLowerCase()}.json`,
    artifactId: `repair-command-${findingId}-${attempt}-${commandId}-${validationResult}`,
    contractId: 'repair-command-receipt:v1',
    approvalSource: 'trusted-command-runner',
    sourceRevision: RESULT_REVISION,
    changeRef: findingId,
    body: {
      schema_version: 1,
      kind: 'repair-command-receipt',
      finding_id: findingId,
      repository_id: OWNER_REPOSITORY_ID,
      current_revision: BASE_REVISION,
      result_revision: RESULT_REVISION,
      attempt,
      command: verificationCommand,
      exit_code: validationResult === 'PASSED' ? 0 : 1,
      result: validationResult,
      changed_paths: projection.changed_paths,
      change_manifest: projection.change_manifest,
      repaired_evidence: projection.repaired_evidence,
      test_integrity: projection.test_integrity,
    },
  });
}

function repairAttempt(overrides = {}) {
  const candidate = {
    ...baseRepairAttempt(),
    ...overrides,
  };
  return candidate;
}

function contract(overrides = {}) {
  const ownerApproval = repairApproval();
  const candidate = {
    schema_version: 1,
    current_revision: BASE_REVISION,
    subject_track: 'ai-agent',
    source: 'review-code',
    artifact_identity: {
      owner_repository_id: OWNER_REPOSITORY_ID,
      owner_module_id: 'agent-module',
      execution_host_repository_id: 'github.com/acme/portal',
    },
    finding: {
      id: 'R-1',
      status: 'VALID',
      selected_for_repair: true,
      owner_repository_id: OWNER_REPOSITORY_ID,
      original_evidence_ref: 'review:R-1:before',
      repair_scope_paths: ['src/agent'],
    },
    write_authority: {
      approved: true,
      owner_repository_id: OWNER_REPOSITORY_ID,
      allowed_paths: ['src/agent'],
      approval: ownerApproval.reference,
    },
    approval_artifacts: [ownerApproval.artifact],
    repair_recursion_depth: 1,
    attempts: [repairAttempt()],
    ...overrides,
  };
  const snapshot = repositorySnapshot();
  const assessment = reviewAssessment();
  const receipts = (Array.isArray(candidate.attempts) ? candidate.attempts : [])
    .map((attempt) => (
      attempt && typeof attempt === 'object'
        ? commandReceipt({
          findingId: candidate.finding?.id ?? 'R-1',
          attempt: attempt.attempt,
          validationResult: attempt.validation_result,
          verificationCommand: attempt.verification_command,
        })
        : null
    ));
  candidate.attempts = Array.isArray(candidate.attempts)
    ? candidate.attempts.map((attempt, index) => (
      attempt && typeof attempt === 'object'
        ? { ...attempt, verification_receipt: receipts[index].reference }
        : attempt
    ))
    : candidate.attempts;
  candidate.repository_snapshot = overrides.repository_snapshot ?? snapshot.reference;
  candidate.evidence_artifacts = [
    ...(overrides.evidence_artifacts ?? [snapshot.artifact, assessment.artifact]),
    ...receipts.filter(Boolean).map(({ artifact }) => artifact),
  ];
  return candidate;
}

function externalFeedback(overrides = {}) {
  const snapshot = repositorySnapshot();
  const proposedChange = overrides.proposed_change ?? {
    kind: 'mechanical',
    migration_decision: null,
  };
  const verification = {
    current_context_read: true,
    current_locator_matches: true,
    scope_applies: true,
    technical_claim_supported: true,
    existing_mechanism_satisfies: false,
    evidence: [evidence()],
    conflicts: [],
    reverify_command: 'npm run test:approval',
    ...(overrides.verification ?? {}),
  };
  const evidenceRefs = [...new Set(verification.evidence
    .map(({ reference }) => reference))].sort();
  const assessment = reviewAssessment({ evidenceRefs, verification, proposedChange });
  const candidate = {
    repair_source: {
      kind: 'external-review-feedback',
      review_id: 'review-pr-417-r1',
      reviewer: 'github-pr-reviewer',
      base_revision: 'a'.repeat(40),
      file_scope: ['src/agent'],
      original_feedback: {
        kind: 'text',
        value: 'The approval branch fails to verify the resource version.',
        sanitized: true,
      },
    },
    current_revision: BASE_REVISION,
    owner_repository_id: OWNER_REPOSITORY_ID,
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
      ...verification,
      assessment_receipt: assessment.reference,
    },
    proposed_change: proposedChange,
    ...overrides,
  };
  candidate.verification = {
    ...verification,
    assessment_receipt: assessment.reference,
  };
  candidate.proposed_change = proposedChange;
  candidate.repository_snapshot = overrides.repository_snapshot ?? snapshot.reference;
  candidate.evidence_artifacts = overrides.evidence_artifacts ?? [snapshot.artifact, assessment.artifact];
  return candidate;
}

test('repair metadata and body derive every supported track from the central registry', () => {
  for (const track of systemRegistry.tracks) {
    if (!track.repair_supported) continue;
    const result = evaluateRepairContract(contract({ subject_track: track.id }));
    assert.equal(result.status, 'resolved', track.id);
  }
});

test('AI-agent repair from portal stays in module owner and links evidence', () => {
  const result = evaluateRepairContract(contract());
  assert.equal(result.repair_authorized, true);
  assert.equal(result.owner_repository_id, 'github.com/acme/agent-module');
  assert.equal(result.execution_host_repository_id, 'github.com/acme/portal');
  assert.equal(result.attempts_used, 1);
});

test('review findings require explicit selection and write authority', () => {
  const unselected = evaluateRepairContract(
    contract({
      finding: { ...contract().finding, selected_for_repair: false },
    }),
  );
  assert.match(unselected.blockers.join(' '), /not selected for repair/iu);

  const unauthorized = evaluateRepairContract(
    contract({
      write_authority: { ...contract().write_authority, approved: false },
    }),
  );
  assert.match(unauthorized.blockers.join(' '), /write authority/iu);
});

test('repair loop enforces the three-attempt cap and escalation', () => {
  assert.equal(repairAttemptCap, 3);
  const attempts = [1, 2, 3].map((attempt) => ({
    ...repairAttempt({ validation_result: 'FAILED' }),
    attempt,
  }));
  const capped = evaluateRepairContract(contract({ attempts }));
  assert.equal(capped.attempts_remaining, 0);
  assert.equal(capped.escalation_required, true);

  const exceeded = evaluateRepairContract(
    contract({
      attempts: [...attempts, { ...attempts[0], attempt: 4 }],
    }),
  );
  assert.match(exceeded.blockers.join(' '), /attempt cap exceeded/iu);
});

test('repair denies cross-root paths and approved artifact mutation', () => {
  const crossRoot = evaluateRepairContract(
    contract({
      attempts: [
        {
          ...repairAttempt(),
          changed_paths: ['src/portal/shell.ts'],
          change_manifest: [{
            path: 'src/portal/shell.ts',
            before_sha256: HASH_A,
            after_sha256: HASH_B,
          }],
        },
      ],
    }),
  );
  assert.match(crossRoot.blockers.join(' '), /outside authorized owner scope/iu);

  const protectedArtifact = evaluateRepairContract(
    contract({
      write_authority: {
        ...contract().write_authority,
        allowed_paths: ['.sdcorejs/specs'],
      },
      attempts: [
        {
          ...repairAttempt(),
          changed_paths: ['.sdcorejs/specs/approved.md'],
          change_manifest: [{
            path: '.sdcorejs/specs/approved.md',
            before_sha256: HASH_A,
            after_sha256: HASH_B,
          }],
        },
      ],
    }),
  );
  assert.match(protectedArtifact.blockers.join(' '), /approved artifact/iu);

  const approvedArchitecture = evaluateRepairContract(
    contract({
      write_authority: {
        ...contract().write_authority,
        allowed_paths: ['.sdcorejs/architecture'],
      },
      attempts: [{
        ...repairAttempt(),
        changed_paths: ['.sdcorejs/architecture/ai-agent/approved.md'],
        change_manifest: [{
          path: '.sdcorejs/architecture/ai-agent/approved.md',
          before_sha256: HASH_A,
          after_sha256: HASH_B,
        }],
      }],
    }),
  );
  assert.match(approvedArchitecture.blockers.join(' '), /approved artifact/iu);
});

test('repaired evidence must trace to the original failure and owner', () => {
  const result = evaluateRepairContract(
    contract({
      attempts: [
        {
          ...repairAttempt(),
          repaired_evidence: {
            original_evidence_ref: 'unrelated',
            repository_id: 'github.com/acme/portal',
            evidence_ref: 'test:R-1:after',
            revision: RESULT_REVISION,
            path: 'src/agent/approval.ts',
            locator: 'L42',
            sha256: HASH_B,
          },
        },
      ],
    }),
  );
  assert.match(result.blockers.join(' '), /does not link|different repository/iu);
});

test('repair and simplify recursion is bounded', () => {
  const result = evaluateRepairContract(contract({ repair_recursion_depth: 2 }));
  assert.match(result.blockers.join(' '), /recursion depth exceeded/iu);
});

test('correct external feedback is verified before tier selection and exact re-verification', () => {
  const feedback = externalFeedback();
  const ownerApproval = repairApproval({ findingId: 'EXT-001' });
  const classified = evaluateExternalReviewFeedback(feedback);
  assert.equal(classified.valid, true, classified.blockers.join('\n'));
  assert.equal(classified.feedback_verdict, 'correct');
  assert.equal(classified.repair_status, 'VALID');
  assert.equal(classified.write_tier, 'auto');
  assert.equal(classified.write_eligible, true);
  assert.equal(classified.reverify_command, 'npm run test:approval');

  const integrated = evaluateRepairContract(contract({
    source: 'external-review-feedback',
    repair_source: feedback.repair_source,
    repository_snapshot: feedback.repository_snapshot,
    evidence_artifacts: feedback.evidence_artifacts,
    feedback_review: {
      current_revision: feedback.current_revision,
      verification: feedback.verification,
      proposed_change: feedback.proposed_change,
    },
    finding: {
      ...contract().finding,
      id: 'EXT-001',
      status: 'VALID',
      feedback_verdict: 'correct',
      write_tier: 'auto',
      current_path: 'src/agent/approval.ts',
      current_line: 42,
      repair_scope_paths: ['src/agent'],
    },
    write_authority: {
      ...contract().write_authority,
      approval: ownerApproval.reference,
    },
    approval_artifacts: [ownerApproval.artifact],
    attempts: [{
      ...repairAttempt(),
      verification_command: 'npm run test:approval',
    }],
  }));
  assert.equal(integrated.repair_authorized, true, integrated.blockers.join('\n'));
});

test('signed review assessment binds conflicts, change kind, and migration decision identity', () => {
  const conflictMutation = structuredClone(externalFeedback());
  conflictMutation.verification.conflicts = [{
    kind: 'approved-architecture',
    reference: '.sdcorejs/architecture/ai-agent/agent.md#INV-001',
    owner: 'architecture-owner',
  }];
  const conflicted = evaluateExternalReviewFeedback(conflictMutation);
  assert.equal(conflicted.valid, false);
  assert.equal(conflicted.write_eligible, false);
  assert.match(conflicted.blockers.join(' '), /assessment.*conflict/iu);

  const kindMutation = structuredClone(externalFeedback());
  kindMutation.proposed_change.kind = 'semantic';
  const relabeled = evaluateExternalReviewFeedback(kindMutation);
  assert.equal(relabeled.valid, false);
  assert.equal(relabeled.write_eligible, false);
  assert.match(relabeled.blockers.join(' '), /assessment.*change kind/iu);

  const migrationA = repairApproval({
    findingId: 'EXT-001',
    kind: 'approved-migration-decision',
    actor: 'api-owner',
    decisionId: 'D-001',
    artifactPath: '.sdcorejs/approvals/ext-001-migration-a.json',
  });
  const migrationB = repairApproval({
    findingId: 'EXT-001',
    kind: 'approved-migration-decision',
    actor: 'api-owner',
    decisionId: 'D-002',
    artifactPath: '.sdcorejs/approvals/ext-001-migration-b.json',
  });
  const migrated = externalFeedback({
    approval_artifacts: [migrationA.artifact, migrationB.artifact],
    proposed_change: {
      kind: 'public-contract-rename',
      migration_decision: migrationA.reference,
    },
  });
  const accepted = evaluateExternalReviewFeedback(migrated);
  assert.equal(accepted.valid, true, accepted.blockers.join('\n'));
  assert.equal(accepted.write_eligible, true);

  const decisionMutation = structuredClone(migrated);
  decisionMutation.proposed_change.migration_decision = migrationB.reference;
  const substituted = evaluateExternalReviewFeedback(decisionMutation);
  assert.equal(substituted.valid, false);
  assert.equal(substituted.write_eligible, false);
  assert.match(substituted.blockers.join(' '), /assessment.*migration decision identity/iu);
});

test('stale external line references do not create writes', () => {
  const input = externalFeedback({
    verification: {
      ...externalFeedback().verification,
      current_locator_matches: false,
      technical_claim_supported: null,
    },
  });
  const result = evaluateExternalReviewFeedback(input);
  assert.equal(result.feedback_verdict, 'stale');
  assert.equal(result.repair_status, 'STALE');
  assert.equal(result.write_eligible, false);
});

test('a convention applied outside its owner scope is not applicable', () => {
  const input = externalFeedback({
    verification: {
      ...externalFeedback().verification,
      scope_applies: false,
      evidence: [evidence({
        kind: 'convention',
        path: '.sdcorejs/conventions/module/naming/rule.md',
        locator: 'rule-naming',
        summary: 'The cited module convention belongs to another repository.',
      })],
    },
  });
  const result = evaluateExternalReviewFeedback(input);
  assert.equal(result.feedback_verdict, 'not-applicable');
  assert.equal(result.repair_status, 'MIS-SCOPED');
  assert.equal(result.write_eligible, false);
});

test('feedback conflicting with approved architecture requires the owning decision', () => {
  const input = externalFeedback({
    verification: {
      ...externalFeedback().verification,
      conflicts: [{
        kind: 'approved-architecture',
        reference: '.sdcorejs/architecture/ai-agent/agent.md#INV-001',
        owner: 'architecture-owner',
      }],
    },
  });
  const result = evaluateExternalReviewFeedback(input);
  assert.equal(result.feedback_verdict, 'conflicting');
  assert.equal(result.repair_status, 'CONFLICTING');
  assert.equal(result.write_tier, 'user-decision');
  assert.equal(result.decision_owner, 'architecture-owner');
  assert.equal(result.write_eligible, false);
});

test('public API rename feedback without migration or compatibility decision is conflicting', () => {
  const input = externalFeedback({
    proposed_change: {
      kind: 'public-contract-rename',
      migration_decision: null,
    },
  });
  const result = evaluateExternalReviewFeedback(input);
  assert.equal(result.feedback_verdict, 'conflicting');
  assert.equal(result.repair_status, 'CONFLICTING');
  assert.equal(result.write_eligible, false);
  assert.match(result.pushback.summary, /migration|compatibility/iu);
});

test('incorrect feedback returns evidence-backed technical pushback without edits', () => {
  const input = externalFeedback({
    verification: {
      ...externalFeedback().verification,
      technical_claim_supported: false,
      evidence: [evidence({
        kind: 'test',
        path: 'test/approval.test.ts',
        locator: 'L88',
        summary: 'The current regression test proves the resource-version denial.',
      })],
    },
  });
  const result = evaluateExternalReviewFeedback(input);
  assert.equal(result.feedback_verdict, 'incorrect');
  assert.equal(result.repair_status, 'REDUNDANT');
  assert.equal(result.write_eligible, false);
  assert.equal(result.pushback.required, true);
  assert.deepEqual(result.pushback.evidence_refs, ['test/approval.test.ts#L88']);
});

test('external feedback rejects fabricated repository evidence and malformed top-level input', () => {
  assert.doesNotThrow(() => evaluateExternalReviewFeedback(null));
  assert.equal(evaluateExternalReviewFeedback(null).valid, false);

  const fabricated = externalFeedback({
    verification: {
      ...externalFeedback().verification,
      evidence: [evidence({
        path: 'definitely/not-present/file.ts',
        locator: 'L1',
        sha256: `sha256:${'f'.repeat(64)}`,
      })],
    },
  });
  const result = evaluateExternalReviewFeedback(fabricated);
  assert.equal(result.valid, false);
  assert.equal(result.write_eligible, false);
  assert.match(result.blockers.join(' '), /snapshot|evidence|missing|resolve/iu);
});

test('unclear external feedback remains read-only', () => {
  const input = externalFeedback({
    verification: {
      ...externalFeedback().verification,
      technical_claim_supported: null,
    },
  });
  const result = evaluateExternalReviewFeedback(input);
  assert.equal(result.feedback_verdict, 'unclear');
  assert.equal(result.repair_status, 'UNCLEAR');
  assert.equal(result.write_eligible, false);
});

test('external feedback cannot grant authority, weaken tests, or change re-verification', () => {
  const feedback = externalFeedback();
  const base = {
    source: 'external-review-feedback',
    repair_source: feedback.repair_source,
    repository_snapshot: feedback.repository_snapshot,
    evidence_artifacts: feedback.evidence_artifacts,
    feedback_review: {
      current_revision: feedback.current_revision,
      verification: feedback.verification,
      proposed_change: feedback.proposed_change,
    },
    finding: {
      ...contract().finding,
      id: 'EXT-001',
      status: 'VALID',
      feedback_verdict: 'correct',
      write_tier: 'auto',
      current_path: 'src/agent/approval.ts',
      current_line: 42,
      repair_scope_paths: ['src/agent'],
    },
  };
  const noAuthority = evaluateRepairContract(contract({
    ...base,
    write_authority: { ...contract().write_authority, approved: false },
  }));
  assert.match(noAuthority.blockers.join(' '), /write authority/iu);

  const weakened = evaluateRepairContract(contract({
    ...base,
    attempts: [{
      ...repairAttempt(),
      verification_command: 'npm test',
    }],
  }));
  assert.match(weakened.blockers.join(' '), /source-specific|weaken/iu);
});

test('repair paths are canonical and remain inside feedback, finding, and owner scopes', () => {
  const traversal = evaluateRepairContract(contract({
    attempts: [repairAttempt({
      changed_paths: ['src/agent/../outside.ts'],
      change_manifest: [{
        path: 'src/agent/../outside.ts',
        before_sha256: HASH_A,
        after_sha256: HASH_B,
      }],
    })],
  }));
  assert.match(traversal.blockers.join(' '), /safe repository-relative|canonical/iu);

  const feedback = externalFeedback();
  const scopedApproval = repairApproval({
    findingId: 'EXT-001',
    scopePaths: ['test'],
  });
  const escapedFeedback = evaluateRepairContract(contract({
    source: 'external-review-feedback',
    repair_source: feedback.repair_source,
    repository_snapshot: feedback.repository_snapshot,
    evidence_artifacts: feedback.evidence_artifacts,
    feedback_review: {
      current_revision: feedback.current_revision,
      verification: feedback.verification,
      proposed_change: feedback.proposed_change,
    },
    finding: {
      ...contract().finding,
      id: 'EXT-001',
      feedback_verdict: 'correct',
      write_tier: 'auto',
      current_path: 'src/agent/approval.ts',
      current_line: 42,
      repair_scope_paths: ['src/agent'],
    },
    write_authority: {
      ...contract().write_authority,
      allowed_paths: ['test'],
      approval: scopedApproval.reference,
    },
    approval_artifacts: [scopedApproval.artifact],
    attempts: [repairAttempt({
      changed_paths: ['test/approval.test.ts'],
      change_manifest: [{
        path: 'test/approval.test.ts',
        before_sha256: HASH_A,
        after_sha256: HASH_B,
      }],
      repaired_evidence: {
        ...repairAttempt().repaired_evidence,
        original_evidence_ref: 'review:R-1:before',
        path: 'test/approval.test.ts',
      },
      verification_command: 'npm run test:approval',
      test_integrity: {
        ...repairAttempt().test_integrity,
        tests_changed: true,
        test_paths: ['test/approval.test.ts'],
        after_contract_hash: HASH_B,
      },
    })],
  }));
  assert.match(escapedFeedback.blockers.join(' '), /feedback scope|finding scope/iu);
});

test('confirm and user-decision repair tiers require typed, scoped approvals', () => {
  const feedback = externalFeedback({
    proposed_change: { kind: 'semantic', migration_decision: null },
  });
  const ownerApproval = repairApproval({ findingId: 'EXT-001' });
  const base = {
    source: 'external-review-feedback',
    repair_source: feedback.repair_source,
    repository_snapshot: feedback.repository_snapshot,
    evidence_artifacts: feedback.evidence_artifacts,
    feedback_review: {
      current_revision: feedback.current_revision,
      verification: feedback.verification,
      proposed_change: feedback.proposed_change,
    },
    finding: {
      ...contract().finding,
      id: 'EXT-001',
      feedback_verdict: 'correct',
      write_tier: 'confirm',
      current_path: 'src/agent/approval.ts',
      current_line: 42,
      repair_scope_paths: ['src/agent'],
    },
    write_authority: {
      ...contract().write_authority,
      approval: ownerApproval.reference,
    },
    approval_artifacts: [ownerApproval.artifact],
    attempts: [repairAttempt({ verification_command: 'npm run test:approval' })],
  };
  const missingConfirmation = evaluateRepairContract(contract(base));
  assert.match(missingConfirmation.blockers.join(' '), /confirm.*approval/iu);

  const confirmation = repairApproval({
    findingId: 'EXT-001',
    kind: 'explicit-confirmation',
    changeKind: 'semantic',
  });
  const confirmed = evaluateRepairContract(contract({
    ...base,
    write_authority: {
      ...base.write_authority,
      tier_approval: confirmation.reference,
    },
    approval_artifacts: [ownerApproval.artifact, confirmation.artifact],
  }));
  assert.equal(confirmed.status, 'resolved', confirmed.blockers.join('\n'));

  const unverifiedMigration = evaluateExternalReviewFeedback(externalFeedback({
    proposed_change: {
      kind: 'public-contract-rename',
      migration_decision: {
        kind: 'approved-migration-decision',
        status: 'approved',
        ref: 'not-an-approved-artifact',
        actor: 'api-owner',
        base_revision: BASE_REVISION,
        scope_paths: ['src/agent'],
      },
    },
  }));
  assert.equal(unverifiedMigration.valid, false);
  assert.equal(unverifiedMigration.write_eligible, false);
});

test('migration and write authority resolve verified artifacts instead of inline claims', () => {
  const missingReference = {
    artifact_ref: '.sdcorejs/approvals/ext-001-migration.json',
    approval_hash: `sha256:v1:${'a'.repeat(64)}`,
    decision_id: 'D-001',
  };
  const missing = evaluateExternalReviewFeedback(externalFeedback({
    proposed_change: {
      kind: 'public-contract-rename',
      migration_decision: missingReference,
    },
  }));
  assert.equal(missing.valid, false);
  assert.equal(missing.write_eligible, false);
  assert.match(missing.blockers.join(' '), /missing|artifact/iu);

  const inlineAuthority = evaluateRepairContract(contract({
    write_authority: {
      ...contract().write_authority,
      approval: {
        kind: 'owner-write-authority',
        status: 'approved',
        actor: 'agent-module-owner',
        finding_id: 'R-1',
        base_revision: BASE_REVISION,
        scope_paths: ['src/agent'],
      },
    },
  }));
  assert.equal(inlineAuthority.repair_authorized, false);
  assert.match(inlineAuthority.blockers.join(' '), /artifact reference|approval hash/iu);

  const migration = repairApproval({
    findingId: 'EXT-001',
    kind: 'approved-migration-decision',
    actor: 'api-owner',
    decisionId: 'D-001',
  });
  const staleArtifact = structuredClone(migration.artifact);
  staleArtifact.body = staleArtifact.body.replace('D-001', 'D-999');
  const stale = evaluateExternalReviewFeedback(externalFeedback({
    approval_artifacts: [staleArtifact],
    proposed_change: {
      kind: 'public-contract-rename',
      migration_decision: migration.reference,
    },
  }));
  assert.equal(stale.valid, false);
  assert.equal(stale.write_eligible, false);
  assert.match(stale.blockers.join(' '), /invalid|stale|hash/iu);

  const migrationRef = `${migration.reference.artifact_ref}#D-001`;
  const ownerApproval = repairApproval({ findingId: 'EXT-001' });
  const decisionApproval = repairApproval({
    findingId: 'EXT-001',
    kind: 'owner-decision',
    changeKind: 'public-contract-rename',
    decisionRef: migrationRef,
  });
  const feedback = externalFeedback({
    approval_artifacts: [migration.artifact],
    proposed_change: {
      kind: 'public-contract-rename',
      migration_decision: migration.reference,
    },
  });
  const resolved = evaluateRepairContract(contract({
    source: 'external-review-feedback',
    repair_source: feedback.repair_source,
    repository_snapshot: feedback.repository_snapshot,
    evidence_artifacts: feedback.evidence_artifacts,
    feedback_review: {
      current_revision: feedback.current_revision,
      verification: feedback.verification,
      proposed_change: feedback.proposed_change,
    },
    finding: {
      ...contract().finding,
      id: 'EXT-001',
      status: 'VALID',
      feedback_verdict: 'correct',
      write_tier: 'user-decision',
      current_path: 'src/agent/approval.ts',
      current_line: 42,
      repair_scope_paths: ['src/agent'],
    },
    write_authority: {
      ...contract().write_authority,
      approval: ownerApproval.reference,
      tier_approval: decisionApproval.reference,
    },
    approval_artifacts: [
      migration.artifact,
      ownerApproval.artifact,
      decisionApproval.artifact,
    ],
    attempts: [repairAttempt({ verification_command: 'npm run test:approval' })],
  }));
  assert.equal(resolved.status, 'resolved', resolved.blockers.join('\n'));
});

test('repair evidence is revision-bound, changes are nonempty, and test integrity is independently compared', () => {
  const feedback = externalFeedback({
    verification: {
      ...externalFeedback().verification,
      technical_claim_supported: false,
      evidence: [{
        kind: 'test',
        reference: 'trust-me',
        summary: 'Unbound claim.',
      }],
    },
  });
  assert.equal(evaluateExternalReviewFeedback(feedback).valid, false);

  const empty = evaluateRepairContract(contract({
    attempts: [repairAttempt({ changed_paths: [], change_manifest: [] })],
  }));
  assert.match(empty.blockers.join(' '), /non-empty change/iu);

  const testApproval = repairApproval({ scopePaths: ['test'] });
  const weakened = evaluateRepairContract(contract({
    write_authority: {
      ...contract().write_authority,
      allowed_paths: ['test'],
      approval: testApproval.reference,
    },
    approval_artifacts: [testApproval.artifact],
    finding: { ...contract().finding, repair_scope_paths: ['test'] },
    attempts: [repairAttempt({
      changed_paths: ['test/approval.test.ts'],
      change_manifest: [{
        path: 'test/approval.test.ts',
        before_sha256: HASH_A,
        after_sha256: HASH_B,
      }],
      repaired_evidence: { ...repairAttempt().repaired_evidence, path: 'test/approval.test.ts' },
      test_integrity: {
        ...repairAttempt().test_integrity,
        tests_changed: true,
        test_paths: ['test/approval.test.ts'],
        after_contract_hash: HASH_B,
        assertion_ids_after: [],
      },
    })],
  }));
  assert.match(weakened.blockers.join(' '), /assertion.*removed|weaken/iu);
});

test('repository snapshots and command receipts defeat co-mutated repair projections', () => {
  const statusMutation = contract();
  statusMutation.attempts[0].validation_result = 'FAILED';
  const statusResult = evaluateRepairContract(statusMutation);
  assert.equal(statusResult.status, 'blocked');
  assert.match(statusResult.blockers.join(' '), /command receipt|validation_result/iu);

  const hashMutation = contract();
  hashMutation.attempts[0].change_manifest[0].before_sha256 = `sha256:${'f'.repeat(64)}`;
  hashMutation.attempts[0].change_manifest[0].after_sha256 = `sha256:${'e'.repeat(64)}`;
  hashMutation.attempts[0].repaired_evidence.sha256 = `sha256:${'e'.repeat(64)}`;
  const hashResult = evaluateRepairContract(hashMutation);
  assert.equal(hashResult.status, 'blocked');
  assert.match(hashResult.blockers.join(' '), /snapshot|command receipt/iu);

  const revisionMutation = contract();
  revisionMutation.attempts[0].result_revision = 'f'.repeat(40);
  revisionMutation.attempts[0].repaired_evidence.revision = 'f'.repeat(40);
  const revisionResult = evaluateRepairContract(revisionMutation);
  assert.equal(revisionResult.status, 'blocked');
  assert.match(revisionResult.blockers.join(' '), /snapshot|receipt|revision/iu);

  const staleReceipt = contract();
  const receipt = staleReceipt.evidence_artifacts.find(
    (artifact) => artifact.metadata.contract_id === 'repair-command-receipt:v1',
  );
  receipt.body = receipt.body.replace('"exit_code":0', '"exit_code":1');
  const receiptResult = evaluateRepairContract(staleReceipt);
  assert.equal(receiptResult.status, 'blocked');
  assert.match(receiptResult.blockers.join(' '), /invalid|stale|hash/iu);
});

test('malformed nested repair collections fail closed instead of throwing', () => {
  assert.doesNotThrow(() => evaluateRepairContract(contract({ attempts: [null] })));
  const result = evaluateRepairContract(contract({ attempts: [null] }));
  assert.equal(result.status, 'blocked');
  assert.match(result.blockers.join(' '), /attempt.*object/iu);

  const mutations = [
    () => contract({ attempts: [repairAttempt({ change_manifest: {} })] }),
    () => contract({ attempts: [repairAttempt({ changed_paths: 'src/agent/approval.ts' })] }),
    () => contract({
      write_authority: {
        ...contract().write_authority,
        allowed_paths: 'src/agent',
      },
    }),
    () => contract({
      finding: {
        ...contract().finding,
        repair_scope_paths: { path: 'src/agent' },
      },
    }),
    () => contract({
      attempts: [repairAttempt({
        test_integrity: {
          ...repairAttempt().test_integrity,
          test_paths: 'test/approval.test.ts',
        },
      })],
    }),
  ];
  for (const build of mutations) {
    let evaluated;
    assert.doesNotThrow(() => { evaluated = evaluateRepairContract(build()); });
    assert.equal(evaluated.status, 'blocked');
  }
});

test('canonical repair workflow exposes external feedback mode without a new public skill', async () => {
  const [skill, reference] = await Promise.all([
    readFile(new URL('../../skills/orchestration/repair-loop.md', import.meta.url), 'utf8'),
    readFile(new URL('../../_refs/orchestration/tail/repair-loop.md', import.meta.url), 'utf8'),
  ]);
  assert.match(skill, /external-review-feedback/u);
  assert.match(skill, /evaluateExternalReviewFeedback/u);
  assert.match(reference, /human, PR, copied, or\s+external-agent/is);
  assert.match(reference, /understand.*re-read.*verify.*classify.*write tier.*re-run.*pushback/is);
  assert.match(reference, /correct.*VALID.*stale.*STALE.*not-applicable.*MIS-SCOPED.*unclear.*UNCLEAR.*conflicting.*CONFLICTING/is);
  assert.match(reference, /public API rename.*migration.*compatibility/is);
});
