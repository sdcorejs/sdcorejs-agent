import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateReviewContract,
  firstClassReviewProfiles,
} from '../../_refs/shared/review-contract.mjs';
import { systemRegistry } from '../../_refs/shared/system-registry.mjs';

function context(overrides = {}) {
  return {
    schema_version: 1,
    subject_track: 'general',
    review_profile: 'general',
    mode: 'read-only',
    write_actions: [],
    owner_repository_id: 'github.com/acme/module-a',
    execution_host_repository_id: 'github.com/acme/portal',
    current_revision_map: {
      'github.com/acme/module-a': 'a'.repeat(40),
    },
    portal_pinned_module_revision_map: { 'module-a': 'a'.repeat(40) },
    artifacts: [],
    test_evidence: [],
    provider_evidence: [],
    reported_findings: [],
    ...overrides,
  };
}

test('every first-class track has a durable central-registry review profile', () => {
  assert.deepEqual(
    Object.keys(firstClassReviewProfiles).sort(),
    systemRegistry.tracks.map(({ id }) => id).sort(),
  );
  for (const track of systemRegistry.tracks) {
    const result = evaluateReviewContract(
      context({ subject_track: track.id, review_profile: track.review_profile }),
    );
    assert.equal(result.status, 'reviewed', track.id);
  }
});

test('review is provably read-only and rejects write actions', () => {
  assert.equal(evaluateReviewContract(context()).read_only_proven, true);
  const result = evaluateReviewContract(
    context({ write_actions: [{ action: 'edit', path: 'src/a.ts' }] }),
  );
  assert.equal(result.read_only_proven, false);
  assert.match(result.blockers.join(' '), /cannot contain write actions/iu);
});

test('review detects module artifacts misplaced in portal and duplicate editable sources', () => {
  const artifacts = [
    {
      logical_id: 'module-a:spec',
      path: '.sdcorejs/specs/module-a.md',
      repository_id: 'github.com/acme/portal',
      owner_repository_id: 'github.com/acme/module-a',
      module_id: 'module-a',
      editable: true,
    },
    {
      logical_id: 'module-a:spec',
      path: '.sdcorejs/specs/module-a.md',
      repository_id: 'github.com/acme/module-a',
      owner_repository_id: 'github.com/acme/module-a',
      module_id: 'module-a',
      editable: true,
    },
  ];
  const result = evaluateReviewContract(context({ artifacts }));
  assert.ok(result.findings.some(({ kind }) => kind === 'misplaced-owner-artifact'));
  assert.ok(result.findings.some(({ kind }) => kind === 'duplicate-editable-source'));
});

test('stale source/pinned evidence is a High finding', () => {
  const result = evaluateReviewContract(
    context({
      test_evidence: [
        {
          evidence_ref: 'evidence/module-a.json',
          repository_id: 'github.com/acme/module-a',
          module_id: 'module-a',
          source_revision: 'b'.repeat(40),
          status: 'current',
        },
      ],
    }),
  );
  const stale = result.findings.find(({ kind }) => kind === 'stale-evidence');
  assert.equal(stale.severity, 'High');
  assert.equal(stale.repository_id, 'github.com/acme/module-a');
});

test('fake provider remains Critical even when CI is green', () => {
  const existing = {
    id: 'R-existing',
    severity: 'Critical',
    kind: 'authorization-bypass',
    evidence: 'src/auth.ts:10',
    locator: 'src/auth.ts:10',
    repository_id: 'github.com/acme/module-a',
    module_id: 'module-a',
    impact: 'Unauthorized access',
    required_fix: 'Restore server-side denial.',
  };
  const result = evaluateReviewContract(
    context({
      ci_status: 'green',
      reported_findings: [existing],
      provider_evidence: [
        {
          provider_kind: 'fake',
          production_required: true,
          contract_path: 'src/provider.ts',
          evidence_ref: 'test/fake-provider.spec.ts',
          repository_id: 'github.com/acme/module-a',
          module_id: 'module-a',
        },
      ],
    }),
  );
  assert.equal(
    result.findings.find(({ id }) => id === 'R-existing').severity,
    'Critical',
  );
  assert.equal(
    result.findings.find(({ kind }) => kind === 'fake-production-provider').severity,
    'Critical',
  );
});

test('mutated approval hash and unsupported review profiles fail closed', () => {
  const mutated = evaluateReviewContract(
    context({
      artifacts: [
        {
          logical_id: 'plan',
          path: '.sdcorejs/plans/a.md',
          repository_id: 'github.com/acme/module-a',
          owner_repository_id: 'github.com/acme/module-a',
          editable: false,
          approved_hash: 'a'.repeat(64),
          current_hash: 'b'.repeat(64),
        },
      ],
    }),
  );
  assert.ok(mutated.findings.some(({ kind }) => kind === 'mutated-approved-artifact'));

  const unsupported = evaluateReviewContract(
    context({ subject_track: 'ai-agent', review_profile: 'general' }),
  );
  assert.equal(unsupported.status, 'blocked');
  assert.match(unsupported.blockers.join(' '), /does not match registry profile/iu);
});
