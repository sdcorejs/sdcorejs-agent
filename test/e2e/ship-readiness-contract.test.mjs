import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createApprovedArtifact,
} from '../../_refs/shared/approved-artifact.mjs';
import {
  evaluateShipReadiness,
} from '../../_refs/shared/ship-readiness-contract.mjs';

const SHA = 'a'.repeat(40);
const FINGERPRINT = `sha256:${'b'.repeat(64)}`;
const PORTAL = 'github.com/acme/portal';
const MODULE = 'github.com/acme/module-a';
const MODULE_MAP = { 'module-a': SHA };

function artifact() {
  return createApprovedArtifact({
    metadata: {
      schema_version: 1,
      artifact_id: 'plan-release',
      artifact_kind: 'plan',
      contract_id: 'contract-release',
      requirement_id: 'REQ-RELEASE',
      change_ref: 'release-change',
      track: 'workflow',
      stack_profile: 'general',
      owner_repository_id: PORTAL,
      owner_repository_role: 'portal',
      owner_module_id: 'portal',
      approval_source: 'explicit-user-approval',
      approved_at: '2026-07-31T00:00:00.000Z',
      approved_by: null,
      repository_relative_path: '.sdcorejs/plans/release.md',
      source_revision: SHA,
      parent_repository_id: null,
      parent_references: [],
      supersedes: null,
    },
    body: '# Approved release plan\n',
  });
}

function evidence(evidenceType, evidenceClass, overrides = {}) {
  return {
    evidence_type: evidenceType,
    evidence_class: evidenceClass,
    result: 'PASSED',
    actual_command: ['npm', 'run', evidenceType],
    source_revision: SHA,
    source_fingerprint: FINGERPRINT,
    portal_revision: SHA,
    module_revision_map: MODULE_MAP,
    environment_fingerprint: 'windows-node-24-docker-available',
    finished_at: '2026-07-31T01:00:00.000Z',
    ...overrides,
  };
}

function validContract(overrides = {}) {
  return {
    schema_version: 1,
    source_identity: {
      source_revision: SHA,
      source_fingerprint: FINGERPRINT,
      portal_repository_id: PORTAL,
      portal_revision: SHA,
      modules: [
        {
          module_id: 'module-a',
          repository_id: MODULE,
          revision: SHA,
          pinned_revision: SHA,
          required_for_release: true,
        },
      ],
    },
    approved_artifacts: [{ artifact: artifact(), parent_artifacts: [] }],
    findings: [],
    evidence: [
      evidence('angular-golden', 'golden-build'),
      evidence('nextjs-production-build', 'production-build'),
      evidence('nestjs-production-auth', 'production-integration', {
        provider_kind: 'oidc-jwks',
        production_provider_exercised: true,
      }),
      evidence('full-e2e', 'full-matrix'),
      evidence('module-e2e', 'module-matrix', { module_id: 'module-a' }),
    ],
    claims: { full_live_agent_coverage: false },
    delivery: {
      branch_ready_result: 'READY',
      branch_ready_source_fingerprint: FINGERPRINT,
      artifact_closure: 'complete',
      protected_branch: false,
      commit_created: true,
      clean_tree: true,
      remote_branch_exists: true,
    },
    release: {
      version_synchronized: true,
      changelog_current: true,
      immutable_tag_exists: false,
      github_release_exists: false,
      published: false,
    },
    ...overrides,
  };
}

test('current full evidence can be release-ready without claiming publication', () => {
  const result = evaluateShipReadiness(validContract());
  assert.equal(result.stages.ready_to_ship.status, 'READY');
  assert.equal(result.stages.commit_ready.status, 'READY');
  assert.equal(result.stages.push_ready.status, 'READY');
  assert.equal(result.stages.pr_ready.status, 'READY');
  assert.equal(result.stages.release_ready.status, 'READY');
  assert.equal(result.stages.actually_published.status, 'NOT_PUBLISHED');
  assert.deepEqual(result.automatic_actions, []);
});

test('malformed readiness input fails closed instead of throwing', () => {
  assert.doesNotThrow(() => evaluateShipReadiness({ schema_version: 1 }));
  const result = evaluateShipReadiness({ schema_version: 1 });
  assert.equal(result.stages.ready_to_ship.status, 'BLOCKED');
  assert.match(
    result.stages.ready_to_ship.blockers.join(' '),
    /source identity|source_revision|source_fingerprint/iu,
  );
});

test('equivalent module revision maps are independent of object insertion order', () => {
  const contract = validContract();
  const moduleBRevision = 'c'.repeat(40);
  contract.source_identity.modules.push({
    module_id: 'module-b',
    repository_id: 'github.com/acme/module-b',
    revision: moduleBRevision,
    pinned_revision: moduleBRevision,
    required_for_release: true,
  });
  const reorderedMap = {
    'module-b': moduleBRevision,
    'module-a': SHA,
  };
  for (const entry of contract.evidence) {
    entry.module_revision_map = reorderedMap;
  }
  contract.evidence.push(
    evidence('module-e2e', 'module-matrix', {
      module_id: 'module-b',
      module_revision_map: reorderedMap,
    }),
  );

  const result = evaluateShipReadiness(contract);
  assert.equal(result.stages.ready_to_ship.status, 'READY');
});

test('stale evidence and portal/module revision mismatches block readiness', () => {
  const staleContract = validContract();
  staleContract.evidence[3].source_fingerprint = `sha256:${'c'.repeat(64)}`;
  let result = evaluateShipReadiness(staleContract);
  assert.match(
    result.stages.ready_to_ship.blockers.join(' '),
    /stale source/iu,
  );

  const mismatch = validContract();
  mismatch.source_identity.modules[0].pinned_revision = 'd'.repeat(40);
  result = evaluateShipReadiness(mismatch);
  assert.match(
    result.stages.ready_to_ship.blockers.join(' '),
    /portal\/module revision mismatch/iu,
  );
});

test('mutated approved artifact and unresolved Critical or High findings block', () => {
  const mutated = validContract();
  mutated.approved_artifacts[0].artifact.body += 'mutation\n';
  let result = evaluateShipReadiness(mutated);
  assert.match(
    result.stages.ready_to_ship.blockers.join(' '),
    /approval hash mismatch/iu,
  );

  result = evaluateShipReadiness(
    validContract({
      findings: [
        { id: 'C1', severity: 'Critical', status: 'OPEN' },
        { id: 'H1', severity: 'High', status: 'ACKNOWLEDGED' },
      ],
    }),
  );
  assert.match(
    result.stages.ready_to_ship.blockers.join(' '),
    /unresolved CRITICAL/iu,
  );
  assert.match(
    result.stages.ready_to_ship.blockers.join(' '),
    /unresolved HIGH/iu,
  );
});

test('required module NOT RUN and fake production auth evidence are rejected', () => {
  const missingModule = validContract();
  missingModule.evidence.find(
    ({ evidence_type: type }) => type === 'module-e2e',
  ).result = 'NOT RUN';
  let result = evaluateShipReadiness(missingModule);
  assert.match(
    result.stages.ready_to_ship.blockers.join(' '),
    /module module-a E2E evidence is NOT RUN/iu,
  );

  const fakeAuth = validContract();
  const auth = fakeAuth.evidence.find(
    ({ evidence_type: type }) => type === 'nestjs-production-auth',
  );
  auth.provider_kind = 'fake';
  auth.production_provider_exercised = false;
  result = evaluateShipReadiness(fakeAuth);
  assert.match(
    result.stages.ready_to_ship.blockers.join(' '),
    /production authentication provider was not exercised/iu,
  );
});

test('supplemental smoke cannot satisfy Full E2E or required evidence class', () => {
  const supplemental = validContract();
  supplemental.evidence.find(
    ({ evidence_type: type }) => type === 'full-e2e',
  ).evidence_class = 'supplemental-smoke';
  const result = evaluateShipReadiness(supplemental);
  assert.match(
    result.stages.ready_to_ship.blockers.join(' '),
    /full-matrix evidence/iu,
  );
});

test('full live-agent claim requires a complete current live matrix', () => {
  const live = validContract();
  live.claims.full_live_agent_coverage = true;
  live.evidence.push(
    evidence('live-agent-matrix', 'live-matrix', {
      coverage: { passed: 0, required: 20 },
      result: 'NOT RUN',
    }),
  );
  let result = evaluateShipReadiness(live);
  assert.match(
    result.stages.ready_to_ship.blockers.join(' '),
    /full live-agent coverage/iu,
  );

  live.evidence.at(-1).coverage.passed = 20;
  live.evidence.at(-1).result = 'PASSED';
  result = evaluateShipReadiness(live);
  assert.equal(result.stages.ready_to_ship.status, 'READY');
});

test('protected or dirty delivery state is distinct from production evidence', () => {
  const result = evaluateShipReadiness(
    validContract({
      delivery: {
        branch_ready_result: 'READY',
        branch_ready_source_fingerprint: FINGERPRINT,
        artifact_closure: 'complete',
        protected_branch: true,
        commit_created: false,
        clean_tree: false,
        remote_branch_exists: false,
      },
    }),
  );
  assert.equal(result.stages.ready_to_ship.status, 'READY');
  assert.equal(result.stages.commit_ready.status, 'BLOCKED');
  assert.equal(result.stages.push_ready.status, 'BLOCKED');
  assert.equal(result.stages.pr_ready.status, 'BLOCKED');
});

test('published is asserted only when immutable tag and release really exist', () => {
  const falseClaim = validContract();
  falseClaim.release.published = true;
  let result = evaluateShipReadiness(falseClaim);
  assert.equal(result.stages.actually_published.status, 'NOT_PUBLISHED');

  const published = validContract();
  published.release = {
    ...published.release,
    immutable_tag_exists: true,
    github_release_exists: true,
    published: true,
  };
  result = evaluateShipReadiness(published);
  assert.equal(result.stages.actually_published.status, 'PUBLISHED');
  assert.ok(result.prohibited_automatic_actions.includes('publish'));
});
