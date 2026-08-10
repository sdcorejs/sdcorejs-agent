import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';

import {
  createApprovedArtifact,
} from '../../_refs/shared/approved-artifact.mjs';
import {
  createConvergenceReceiptArtifact,
  evaluateConvergence,
} from '../../_refs/shared/convergence-contract.mjs';
import {
  planRepositoryLocalClosures,
} from '../../_refs/shared/git-closure-contract.mjs';
import { convergenceFixture } from '../../authoring/evals/run-deterministic.mjs';

const REVISION = 'a'.repeat(40);
const FINGERPRINT = `sha256:v1:${'b'.repeat(64)}`;
const PORTAL = 'github.com/acme/portal';
const MODULE = 'github.com/acme/module-a';

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
      input_hash: hash({ fixture: 'git-closure', change_ref: value.change_ref }),
      projection_hash: hash(value),
    },
  };
}

function convergenceCurrent() {
  return {
    repository_id: PORTAL,
    revision: REVISION,
    fingerprint: FINGERPRINT,
    portal_revision: REVISION,
    module_revision_map: { 'module-a': REVISION },
    pinned_module_revision_map: { 'module-a': REVISION },
    owner_thread_id: 'thread-1',
  };
}

function convergenceInput({
  moduleRevisionMap = { 'module-a': REVISION },
  pinnedModuleRevisionMap = moduleRevisionMap,
} = {}) {
  const input = convergenceFixture();
  input.change_ref = 'change-42';
  input.thread = { thread_id: 'thread-1', owner_thread_id: 'thread-1' };
  input.source = {
    ...convergenceCurrent(),
    module_revision_map: moduleRevisionMap,
    pinned_module_revision_map: pinnedModuleRevisionMap,
  };
  for (const item of input.evidence) {
    item.source_revision = REVISION;
    item.source_fingerprint = FINGERPRINT;
    item.portal_revision = REVISION;
    item.module_revision_map = moduleRevisionMap;
  }
  input.lifecycle.verification_revision = REVISION;
  input.lifecycle.artifact_thread_id = 'thread-1';
  return input;
}

function convergenceResult(overrides = {}) {
  const evaluated = evaluateConvergence(convergenceInput());
  return Object.keys(overrides).length === 0
    ? evaluated
    : sealConvergence({ ...evaluated, ...overrides });
}

function approvedPlan(repositoryId, path, artifactId) {
  return createApprovedArtifact({
    metadata: {
      schema_version: 1,
      artifact_id: artifactId,
      artifact_kind: 'plan',
      contract_id: 'contract-42',
      requirement_id: 'REQ-42',
      change_ref: 'change-42',
      track: 'workflow',
      stack_profile: 'general',
      owner_repository_id: repositoryId,
      owner_repository_role: repositoryId === PORTAL ? 'portal' : 'module',
      owner_module_id: repositoryId === PORTAL ? 'portal' : 'module-a',
      approval_source: 'explicit-user-approval',
      approved_at: '2026-07-31T00:00:00.000Z',
      approved_by: 'repository-owner',
      repository_relative_path: path,
      source_revision: REVISION,
      convergence_mode: 'feature',
      parent_repository_id: repositoryId === PORTAL ? null : PORTAL,
      parent_references: [],
      supersedes: null,
    },
    body: `# Approved plan for ${repositoryId}\n`,
  });
}

function repository({
  repositoryId = MODULE,
  role = 'module',
  path = 'src/module-a.ts',
  planPath = '.sdcorejs/plans/module-a.md',
  planId = 'plan-module-a',
  entries,
  ...overrides
} = {}) {
  const plan = approvedPlan(repositoryId, planPath, planId);
  return {
    repository_id: repositoryId,
    role,
    git_root: `C:/work/${role}`,
    thread_id: 'thread-1',
    worktree_id: 'worktree-1',
    source_revision: REVISION,
    portal_pinned_revision: role === 'module' ? REVISION : null,
    active_contract_id: 'contract-42',
    active_plan_id: planId,
    plan_exact_paths: [path],
    evidence: { source_revision: REVISION, source_fingerprint: FINGERPRINT, result: 'PASSED' },
    approved_artifacts: [plan],
    changed_entries: entries ?? [
      {
        path,
        kind: 'source',
        classification: 'source',
        owner_repository_id: repositoryId,
        thread_id: 'thread-1',
        worktree_id: 'worktree-1',
        evidence_source_revision: REVISION,
      },
      {
        path: planPath,
        kind: 'artifact',
        classification: 'required_with_change',
        owner_repository_id: repositoryId,
        thread_id: 'thread-1',
        worktree_id: 'worktree-1',
        evidence_source_revision: REVISION,
        artifact_id: plan.metadata.artifact_id,
        approval_hash: plan.metadata.approval_hash,
      },
    ],
    ...overrides,
  };
}

function contract(repositories, overrides = {}) {
  const modules = repositories.filter(({ role }) => role === 'module');
  const moduleRevisionMap = Object.fromEntries(modules.map((repository) => [
    repository.approved_artifacts[0].metadata.owner_module_id,
    repository.source_revision,
  ]));
  const pinnedModuleRevisionMap = Object.fromEntries(modules.map((repository) => [
    repository.approved_artifacts[0].metadata.owner_module_id,
    repository.portal_pinned_revision,
  ]));
  const convergenceInputValue = convergenceInput({
    moduleRevisionMap,
    pinnedModuleRevisionMap,
  });
  const convergence = evaluateConvergence(convergenceInputValue);
  return {
    schema_version: 1,
    active_thread_id: 'thread-1',
    active_worktree_id: 'worktree-1',
    source_fingerprint: FINGERPRINT,
    convergence_current: convergenceCurrent(),
    convergence_result: convergence,
    convergence_receipt: createConvergenceReceiptArtifact(convergenceInputValue),
    repositories,
    ...overrides,
  };
}

test('module and portal produce independent complete closures and commit units', () => {
  const moduleRepository = repository();
  const portalRepository = repository({
    repositoryId: PORTAL,
    role: 'portal',
    path: 'src/shell.ts',
    planPath: '.sdcorejs/plans/portal.md',
    planId: 'plan-portal',
  });
  const result = planRepositoryLocalClosures(
    contract([moduleRepository, portalRepository]),
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.closures.length, 2);
  assert.deepEqual(
    result.commit_units.map(({ repository_id: id }) => id),
    [MODULE, PORTAL],
  );
  assert.ok(
    result.closures.every(({ staging_commands: commands }) =>
      commands.every((command) =>
        command[0] === 'git' &&
        command[1] === 'add' &&
        command[2] === '--' &&
        !['.', '-A'].includes(command[3]),
      ),
    ),
  );
});

test('Git closure refuses missing, blocked, deferred, stale, or source-mismatched convergence', () => {
  const mutations = [
    ['missing', undefined],
    ['blocked', convergenceResult({ status: 'BLOCKED' })],
    ['deferred', convergenceResult({ status: 'DEFERRED' })],
    ['stale', convergenceResult({ fresh: false })],
    ['source mismatch', convergenceResult({
      source_identity: { ...convergenceCurrent(), revision: 'c'.repeat(40) },
    })],
  ];
  for (const [name, convergence_result] of mutations) {
    const result = planRepositoryLocalClosures(
      contract([repository()], { convergence_result }),
    );
    assert.equal(result.status, 'blocked', name);
    assert.match(result.convergence.blockers.join(' '), /convergence/iu, name);
    assert.deepEqual(result.closures[0].staging_commands, [], name);
  }
});

test('Git derives convergence identity and change from repositories and approved plans', () => {
  const input = contract([repository()]);
  const foreignIdentity = {
    repository_id: 'github.com/other/portal',
    revision: 'c'.repeat(40),
    fingerprint: FINGERPRINT,
    portal_revision: 'c'.repeat(40),
    module_revision_map: { other: 'c'.repeat(40) },
    pinned_module_revision_map: { other: 'c'.repeat(40) },
    owner_thread_id: 'thread-1',
  };
  input.convergence_current = { ...foreignIdentity, change_ref: 'foreign-change', mode: 'feature' };
  input.convergence_result = sealConvergence({
    ...input.convergence_result,
    change_ref: 'foreign-change',
    source_identity: foreignIdentity,
  });

  const result = planRepositoryLocalClosures(input);
  assert.equal(result.status, 'blocked');
  assert.match(result.convergence.blockers.join(' '), /convergence.*(?:source|change|mode)/iu);
  assert.deepEqual(result.commit_units, []);
});

test('parent closure never stages nested module content', () => {
  const portal = repository({
    repositoryId: PORTAL,
    role: 'portal',
    path: 'src/shell.ts',
    planPath: '.sdcorejs/plans/portal.md',
    planId: 'plan-portal',
  });
  portal.changed_entries.push({
    path: 'modules/module-a/src/module-a.ts',
    kind: 'source',
    nested_repository_id: MODULE,
    classification: 'source',
    owner_repository_id: PORTAL,
    thread_id: 'thread-1',
    worktree_id: 'worktree-1',
    evidence_source_revision: REVISION,
  });
  const [closure] = planRepositoryLocalClosures(contract([portal])).closures;
  assert.equal(closure.status, 'complete');
  assert.ok(!closure.included_paths.includes('modules/module-a/src/module-a.ts'));
  assert.match(
    closure.decisions.find(({ path }) => path.includes('modules/module-a')).reasons.join(' '),
    /nested repository/iu,
  );
});

test('thread, worktree, unrelated, and repository ownership isolate paths', () => {
  const moduleRepository = repository();
  moduleRepository.changed_entries.push(
    {
      path: 'notes/other-thread.md',
      kind: 'source',
      classification: 'source',
      owner_repository_id: MODULE,
      thread_id: 'thread-2',
      worktree_id: 'worktree-1',
      evidence_source_revision: REVISION,
    },
    {
      path: 'notes/other-worktree.md',
      kind: 'source',
      classification: 'source',
      owner_repository_id: MODULE,
      thread_id: 'thread-1',
      worktree_id: 'worktree-2',
      evidence_source_revision: REVISION,
    },
    {
      path: 'notes/unrelated.md',
      kind: 'source',
      classification: 'unrelated',
      owner_repository_id: MODULE,
      thread_id: 'thread-1',
      worktree_id: 'worktree-1',
      evidence_source_revision: REVISION,
    },
    {
      path: 'portal-owned.md',
      kind: 'source',
      classification: 'source',
      owner_repository_id: PORTAL,
      thread_id: 'thread-1',
      worktree_id: 'worktree-1',
      evidence_source_revision: REVISION,
    },
  );
  const [closure] = planRepositoryLocalClosures(
    contract([moduleRepository]),
  ).closures;
  assert.equal(closure.status, 'complete');
  assert.deepEqual(
    closure.included_paths.filter((path) => path.startsWith('notes/')),
    [],
  );
});

test('secret, mutated approval hash, and stale evidence block staging', () => {
  const secretRepository = repository();
  secretRepository.changed_entries.push({
    path: '.env',
    kind: 'source',
    classification: 'source',
    secret: true,
    owner_repository_id: MODULE,
    thread_id: 'thread-1',
    worktree_id: 'worktree-1',
    evidence_source_revision: REVISION,
  });
  const secret = planRepositoryLocalClosures(contract([secretRepository]));
  assert.equal(secret.status, 'blocked');
  assert.match(secret.closures[0].blockers.join(' '), /secret/iu);

  const mutatedRepository = repository();
  mutatedRepository.approved_artifacts[0].body += 'mutated\n';
  const mutated = planRepositoryLocalClosures(contract([mutatedRepository]));
  assert.match(
    mutated.closures[0].blockers.join(' '),
    /approval hash mismatch/iu,
  );

  const stale = planRepositoryLocalClosures(
    contract([
      repository({
        evidence: { source_revision: 'b'.repeat(40), result: 'PASSED' },
      }),
    ]),
  );
  assert.match(stale.closures[0].blockers.join(' '), /stale/iu);
});

test('portal gitlink update is included only with explicit active-plan approval', () => {
  const portal = repository({
    repositoryId: PORTAL,
    role: 'portal',
    path: 'src/shell.ts',
    planPath: '.sdcorejs/plans/portal.md',
    planId: 'plan-portal',
  });
  const gitlink = {
    path: 'modules/module-a',
    kind: 'gitlink',
    nested_repository_id: MODULE,
    classification: 'conditional',
    owner_repository_id: PORTAL,
    thread_id: 'thread-1',
    worktree_id: 'worktree-1',
    evidence_source_revision: REVISION,
    approved_plan_id: 'plan-portal',
    gitlink_update_approved: false,
  };
  portal.changed_entries.push(gitlink);
  let [closure] = planRepositoryLocalClosures(contract([portal])).closures;
  assert.ok(!closure.included_paths.includes('modules/module-a'));

  gitlink.gitlink_update_approved = true;
  [closure] = planRepositoryLocalClosures(contract([portal])).closures;
  assert.ok(closure.included_paths.includes('modules/module-a'));
});

test('legacy singleton session artifacts and missing plan paths are rejected', () => {
  const singletonRepository = repository();
  singletonRepository.changed_entries.push({
    path: '.sdcorejs/current-session.md',
    kind: 'artifact',
    classification: 'required_with_change',
    owner_repository_id: MODULE,
    thread_id: 'thread-1',
    worktree_id: 'worktree-1',
    evidence_source_revision: REVISION,
  });
  const singleton = planRepositoryLocalClosures(contract([singletonRepository]));
  assert.match(
    singleton.closures[0].blockers.join(' '),
    /singleton session/iu,
  );

  const missing = repository({ plan_exact_paths: ['src/missing.ts'] });
  const missingResult = planRepositoryLocalClosures(contract([missing]));
  assert.match(
    missingResult.closures[0].blockers.join(' '),
    /active plan path is missing/iu,
  );
});
