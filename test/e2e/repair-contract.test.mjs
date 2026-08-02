import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateRepairContract,
  repairAttemptCap,
} from '../../_refs/orchestration/repair-contract.mjs';
import { systemRegistry } from '../../_refs/shared/system-registry.mjs';

function contract(overrides = {}) {
  return {
    schema_version: 1,
    subject_track: 'ai-agent',
    source: 'review-code',
    artifact_identity: {
      owner_repository_id: 'github.com/acme/agent-module',
      owner_module_id: 'agent-module',
      execution_host_repository_id: 'github.com/acme/portal',
    },
    finding: {
      id: 'R-1',
      status: 'VALID',
      selected_for_repair: true,
      owner_repository_id: 'github.com/acme/agent-module',
      original_evidence_ref: 'review:R-1:before',
    },
    write_authority: {
      approved: true,
      owner_repository_id: 'github.com/acme/agent-module',
      allowed_paths: ['src/agent'],
    },
    repair_recursion_depth: 1,
    attempts: [
      {
        attempt: 1,
        changed_paths: ['src/agent/approval.ts'],
        validation_result: 'PASSED',
        repaired_evidence: {
          original_evidence_ref: 'review:R-1:before',
          repository_id: 'github.com/acme/agent-module',
          evidence_ref: 'test:R-1:after',
        },
      },
    ],
    ...overrides,
  };
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
    attempt,
    changed_paths: ['src/agent/approval.ts'],
    validation_result: 'FAILED',
    repaired_evidence: {
      original_evidence_ref: 'review:R-1:before',
      repository_id: 'github.com/acme/agent-module',
    },
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
          ...contract().attempts[0],
          changed_paths: ['src/portal/shell.ts'],
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
          ...contract().attempts[0],
          changed_paths: ['.sdcorejs/specs/approved.md'],
        },
      ],
    }),
  );
  assert.match(protectedArtifact.blockers.join(' '), /approved artifact/iu);
});

test('repaired evidence must trace to the original failure and owner', () => {
  const result = evaluateRepairContract(
    contract({
      attempts: [
        {
          ...contract().attempts[0],
          repaired_evidence: {
            original_evidence_ref: 'unrelated',
            repository_id: 'github.com/acme/portal',
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
