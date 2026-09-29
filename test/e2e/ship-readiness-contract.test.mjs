import { simplifyFixture, sourcePath, originalSource } from './support/simplify-contract-fixture.mjs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { finishFixture } from './support/interaction-finish-fixture.mjs';

test('case-interaction-finish-ship-consumer: future proof is unnecessary at preflight, defer never ships', async t => {
  const f = await finishFixture(t, { review: 'skip' }); f.run('baseline');
  const input = validContract({ finish_context: f.context });
  const preflight = evaluateShipReadiness(input, { finish_runtime: f.runtime, finish_phase: 'verify' });
  assert.doesNotMatch(JSON.stringify(preflight), /cannot claim completion from pending-action/u);
  const handoff = evaluateShipReadiness(input, { finish_runtime: f.runtime });
  assert.match(JSON.stringify(handoff), /cannot claim completion from pending-action/u);
  f.choose('review', 'defer');
  assert.match(JSON.stringify(evaluateShipReadiness(input, { finish_runtime: f.runtime })), /cannot claim completion from deferred/u);
});

import {
  createApprovedArtifact,
} from '../../_refs/shared/approved-artifact.mjs';
import {
  createConvergenceReceiptArtifact,
  evaluateConvergence,
} from '../../_refs/shared/convergence-contract.mjs';
import {
  evaluateShipReadiness,
} from '../../_refs/shared/ship-readiness-contract.mjs';
import { convergenceFixture } from '../../authoring/evals/run-deterministic.mjs';

const SHA = 'a'.repeat(40);
const FINGERPRINT = `sha256:${'b'.repeat(64)}`;
const PORTAL = 'github.com/acme/portal';
const MODULE = 'github.com/acme/module-a';
const MODULE_MAP = { 'module-a': SHA };

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right), 'en'));
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  return value;
}

function hash(value) {
  return `sha256:v1:${createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex')}`;
}

function sealConvergence(projection) {
  const value = structuredClone(projection);
  delete value.provenance;
  return {
    ...value,
    provenance: {
      evaluator: 'sdcorejs-convergence:v1',
      input_hash: hash({ fixture: 'ship-readiness', change_ref: value.change_ref }),
      projection_hash: hash(value),
    },
  };
}

function convergenceInput(moduleRevisionMap = MODULE_MAP) {
  const input = convergenceFixture();
  input.change_ref = 'release-change';
  input.thread = { thread_id: 'thread-release', owner_thread_id: 'thread-release' };
  input.source = {
    repository_id: PORTAL,
    revision: SHA,
    fingerprint: FINGERPRINT,
    portal_revision: SHA,
    module_revision_map: moduleRevisionMap,
    pinned_module_revision_map: moduleRevisionMap,
  };
  for (const item of input.evidence) {
    item.source_revision = SHA;
    item.source_fingerprint = FINGERPRINT;
    item.portal_revision = SHA;
    item.module_revision_map = moduleRevisionMap;
  }
  input.lifecycle.verification_revision = SHA;
  input.lifecycle.artifact_thread_id = 'thread-release';
  return input;
}

function convergenceResult(overrides = {}) {
  const evaluated = evaluateConvergence(convergenceInput());
  return Object.keys(overrides).length === 0
    ? evaluated
    : sealConvergence({ ...evaluated, ...overrides });
}

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
      approved_by: 'release-owner',
      repository_relative_path: '.sdcorejs/plans/release.md',
      source_revision: SHA,
      convergence_mode: 'feature',
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
  const convergenceInputValue = convergenceInput();
  const convergence = evaluateConvergence(convergenceInputValue);
  return {
    schema_version: 1,
    source_identity: {
      source_revision: SHA,
      source_fingerprint: FINGERPRINT,
      portal_repository_id: PORTAL,
      portal_revision: SHA,
      owner_thread_id: 'thread-release',
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
    convergence_result: convergence,
    convergence_receipt: createConvergenceReceiptArtifact(convergenceInputValue),
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

test('missing, blocked, deferred, stale, or source-mismatched convergence blocks ship and branch readiness', () => {
  const mutations = [
    ['missing', undefined],
    ['blocked', convergenceResult({ status: 'BLOCKED' })],
    ['deferred', convergenceResult({ status: 'DEFERRED' })],
    ['stale', convergenceResult({ fresh: false })],
    ['synthetic empty feature', convergenceResult({
      evidence_refs: [],
      summary: { requirements: 0, acceptance_criteria: 0, tasks: 0, changed_paths: 0, evidence: 0 },
    })],
    ['source mismatch', convergenceResult({
      source_identity: {
        ...convergenceResult().source_identity,
        revision: 'd'.repeat(40),
      },
    })],
  ];
  for (const [name, convergence_result] of mutations) {
    const result = evaluateShipReadiness(validContract({ convergence_result }));
    assert.equal(result.stages.ready_to_ship.status, 'BLOCKED', name);
    assert.equal(result.stages.commit_ready.status, 'BLOCKED', name);
    assert.match(result.stages.ready_to_ship.blockers.join(' '), /convergence/iu, name);
  }
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
  const convergenceInputValue = convergenceInput(reorderedMap);
  contract.convergence_result = evaluateConvergence(convergenceInputValue);
  contract.convergence_receipt = createConvergenceReceiptArtifact(convergenceInputValue);
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


test('case-simplify-hardening-ac-010 ship cannot turn stale or limited simplify into readiness', async t => {
  const f = await simplifyFixture(t); const result = f.finish(f.preflight());
  const c = validContract({ simplify_context: result.context });
  const checked = evaluateShipReadiness(c, f.runtime).simplify;
  assert.equal(checked.evidence_current, true);
  assert.equal(evaluateShipReadiness(c, f.runtime).stages.ready_to_ship.status, 'BLOCKED', 'older ship source is stale even after fresh simplify verification');
  c.source_identity.modules.push({ module_id: 'simplified-owner', repository_id: checked.owner_repository_id, revision: checked.source_revision, pinned_revision: checked.source_revision, source_fingerprint: checked.source_fingerprint, required_for_release: false });
  const revisionMap = { ...MODULE_MAP, 'simplified-owner': checked.source_revision };
  for (const entry of c.evidence) entry.module_revision_map = revisionMap;
  const convergence = convergenceInput(revisionMap);
  c.convergence_result = evaluateConvergence(convergence);
  c.convergence_receipt = createConvergenceReceiptArtifact(convergence);
  assert.equal(evaluateShipReadiness(c, f.runtime).stages.ready_to_ship.status, 'READY', JSON.stringify(evaluateShipReadiness(c, f.runtime).stages.ready_to_ship));
  f.write(sourcePath, originalSource);
  assert.equal(evaluateShipReadiness(c, f.runtime).stages.ready_to_ship.status, 'BLOCKED');
  assert.match(evaluateShipReadiness(c, f.runtime).stages.ready_to_ship.blockers.join(' '), /simplify/u);
  const limited = structuredClone(result.context); limited.verification.behavior_verification = 'limited';
  assert.equal(evaluateShipReadiness(validContract({ simplify_context: limited }), f.runtime).stages.ready_to_ship.status, 'BLOCKED');
});

// Audit repair (UR-1, UR-2): ship consumes UI applicability through its real caller.
const repairOrdinaryReview = () => ({ schema_version: 1, source: 'sdcorejs-review', subject_track: 'workflow', review_profile: 'workflow',
  mode: 'read-only', dimensions: ['security'], write_actions: [], reported_findings: [] });

test('case-repair-ordinary-review: ship treats an ordinary review_context as NOT APPLICABLE for UI', async () => {
  const { evaluateShipReadiness } = await import('../../_refs/shared/ship-readiness-contract.mjs');
  const result = evaluateShipReadiness({ schema_version: 1, review_context: repairOrdinaryReview(), validation_map: [] }, {});
  assert.equal(result.ui_review_verification.status, 'NOT APPLICABLE', JSON.stringify(result.ui_review_verification));
  const blockers = result.stages.ready_to_ship.blockers;
  assert.equal(blockers.some(message => message.startsWith('UI review:')), false, JSON.stringify(blockers));
});

test('case-repair-failing-receipt: ship blocks a current FAIL receipt as a defect', async t => {
  const { uiReviewFixture } = await import('./support/ui-review-fixture.mjs');
  const { evaluateShipReadiness } = await import('../../_refs/shared/ship-readiness-contract.mjs');
  const f = uiReviewFixture(t, { required: ['interaction'] });
  f.reset({ run_command: args => ({ ...f.host.run_command(args), exit_code: 1, assertions: [{ id: 'fixture-keyboard', result: 'FAIL' }] }) });
  f.capture('interaction'); f.start();
  const result = evaluateShipReadiness({ schema_version: 1, review_context: f.context, validation_map: [{ ui_review: f.policy.obligations[0] }] }, { ui_review_runtime: f.uiRuntime });
  assert.equal(result.ui_review_verification.verified, false);
  const blockers = result.stages.ready_to_ship.blockers;
  assert.ok(blockers.some(message => message.startsWith('UI review:') && /FAIL/u.test(message)), JSON.stringify(blockers));
});

// Review follow-up (repair selected by the user): host-verified runner evidence never
// depends on the serialized simplify_context.
test('case-repair-observed-consumers: ship reads host-verified simplify evidence without trusting a serialized context', async t => {
  const { finishFixture } = await import('./support/interaction-finish-fixture.mjs');
  const { evaluateShipReadiness } = await import('../../_refs/shared/ship-readiness-contract.mjs');
  const f = await finishFixture(t, { simplify: 'apply', review: 'skip',
    runtime: { simplify_verifier: () => ({ verified: true, outcome: 'simplified', pass_paths: ['src/value.mjs'], blockers: [] }) } });
  f.run('baseline');
  const dispatch = f.observation.beginSimplify();
  f.write('src/value.mjs', 'export const value = 1; // simplified\n');
  const recorded = f.observation.recordSimplify(dispatch.token, { schema_version: 1, kind: 'simplify-host-receipt:v1', status: 'verified', pass_paths: ['src/value.mjs'] });
  assert.equal(recorded.valid, true, JSON.stringify(recorded));
  for (const simplifyContext of [null, { action: 'analyze-current-diff' }]) {
    let result;
    assert.doesNotThrow(() => { result = evaluateShipReadiness({ schema_version: 1, simplify_context: simplifyContext }, { observation: f.observation, proof: recorded.proof }); }, JSON.stringify(simplifyContext));
    const blockers = result.stages.ready_to_ship.blockers;
    assert.ok(blockers.some(message => /simplify: ship\/test\/review source identity is stale/u.test(message)), `${JSON.stringify(simplifyContext)}: ${JSON.stringify(blockers)}`);
  }
});
