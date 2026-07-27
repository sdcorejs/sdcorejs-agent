import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  applyStateEvent,
  assignRepair,
  classifyTopology,
  createEvidence,
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

const baseCapabilities = {
  runtime: 'test', supports_subagents: true, supports_parallel_dispatch: true,
  supports_agent_cwd: true, supports_native_worktree: true, supports_result_ref: true,
  supports_timeout: true, supports_cancellation: true, effective_max_concurrency: 4
};

const approvedContract = {
  source: 'approved-plan', contract_id: 'C1', approved_plan_path: '.sdcorejs/plans/p.md',
  approved_plan_hash: 'plan-hash', frozen_contract_path: '.sdcorejs/plans/p.parallel.yml',
  frozen_contract_hash: 'contract-hash', revision: 1, supersedes: null
};

const parentPathPass = (unit) => ({ status: 'PASS', associated_head_or_diff: unit.result.associated_head_or_diff, changed_paths: unit.result.changed_paths });
const parentReviewPass = (unit) => ({ status: 'PASS', associated_head_or_diff: unit.result.associated_head_or_diff, blockers: [] });
const globalPass = async () => ({ status: 'PASS', associated_head_or_diff: 'integrated-head', output_digest: 'global-digest' });

test('skill invokes a distributed deterministic protocol validator', async () => {
  const skill = await readFile(new URL('../../skills/orchestration/parallel-dispatch.md', import.meta.url), 'utf8');

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

test('write dispatch requires working-tree, workspace, base, result, verification, and final-tail identity', () => {
  const context = {
    schema_version: 2,
    contract: approvedContract,
    working_tree: { repo_root: '/repo', current_branch: 'feature', current_head: 'abc', status_snapshot_hash: 's', dirty_diff_hash: 'd', staged_paths: [], unstaged_paths: [], untracked_paths: [], unrelated_dirty_paths: [], user_dirty_tree_decision: 'clean' },
    runtime_capabilities: baseCapabilities,
    integration: { workspace_path: '/wt/integration', branch: 'integration', base_head: 'abc', merge_strategy: 'cherry-pick', merge_order: ['u1'], atomicity: 'all-or-nothing', rollback_strategy: 'restore-base' },
    units: [{ id: 'u1', workspace: { strategy: 'worktree', path: '/wt/u1', branch: 'unit/u1', base_head: 'abc' }, ownership: { allowed_paths: ['src/a/**'], prohibited_paths: [] }, verification: { command: 'npm test', cwd: '/wt/u1' }, result: { type: 'commit', ref: null, associated_head_or_diff: null, changed_paths: [] } }],
    final_tail: { verify_before_done: true, branch_ready_final_gate: true, no_writes_after_branch_ready: true }
  };
  assert.deepEqual(validateDispatchContext(context), []);
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
  sharedIntegrationPath.integration.workspace_path = '/wt/u1';
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

test('deterministic fan-in honors order, probes, blockers, conflicts, atomicity, and global failure', async () => {
  const calls = [];
  const units = [
    { id: 'b', status: 'PASSED', result: { type: 'commit', ref: 'b', base_head: 'base', associated_head_or_diff: 'b', output_digest: 'db', exit_code: 0, changed_paths: ['b.ts'], validation: { path_boundary: true, stage_a: true, stage_b: true } } },
    { id: 'a', status: 'PASSED', result: { type: 'commit', ref: 'a', base_head: 'base', associated_head_or_diff: 'a', output_digest: 'da', exit_code: 0, changed_paths: ['a.ts'], validation: { path_boundary: true, stage_a: true, stage_b: true } } }
  ];
  const ok = await integrateResults({ units, integration: { base_head: 'base', merge_order: ['a', 'b'], atomicity: 'all-or-nothing' }, validate: parentPathPass, review: parentReviewPass, apply: async (u) => calls.push(`apply:${u.id}`), probe: async (u) => calls.push(`probe:${u.id}`), rollback: async () => {}, globalVerify: globalPass });
  assert.deepEqual(calls, ['apply:a', 'probe:a', 'apply:b', 'probe:b']);
  assert.equal(ok.status, 'GLOBAL_VERIFIED');
  const blocked = await integrateResults({ units: [{ ...units[0], status: 'BLOCKED' }], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'all-or-nothing' } });
  assert.equal(blocked.status, 'INTEGRATION_BLOCKED');
  const rolledBack = [];
  const failed = await integrateResults({ units, integration: { base_head: 'base', merge_order: ['a', 'b'], atomicity: 'all-or-nothing' }, validate: parentPathPass, review: parentReviewPass, apply: async (u) => { if (u.id === 'b') throw new Error('conflict'); }, rollback: async (ids) => rolledBack.push(...ids), globalVerify: async () => ({ status: 'FAIL' }) });
  assert.equal(failed.rollbackRequired, true);
  assert.deepEqual(rolledBack, ['a']);
  const partial = await integrateResults({ units, integration: { base_head: 'base', merge_order: ['a', 'b'], atomicity: 'independent-successes' }, validate: parentPathPass, review: parentReviewPass, apply: async (u) => { if (u.id === 'b') throw new Error('conflict'); }, globalVerify: globalPass });
  assert.deepEqual(partial.integrated, ['a']);
  assert.equal(partial.rollbackRequired, false);

  const pending = await integrateResults({ units: [{ ...units[0], status: 'PENDING' }], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'all-or-nothing' } });
  assert.equal(pending.status, 'INTEGRATION_BLOCKED');
  const staleAncestry = await integrateResults({ units: [{ ...units[0], result: { ...units[0].result, descends_from_base: false } }], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'all-or-nothing' } });
  assert.equal(staleAncestry.status, 'INTEGRATION_BLOCKED');
  const callbacks = [];
  await integrateResults({ units: [units[0]], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'all-or-nothing' }, validate: (unit) => { callbacks.push('validate'); return parentPathPass(unit); }, review: (unit) => { callbacks.push('review'); return parentReviewPass(unit); }, apply: async () => callbacks.push('apply'), rollback: async () => {}, globalVerify: globalPass });
  assert.deepEqual(callbacks, ['validate', 'review', 'apply']);
  const decision = await integrateResults({ units: [units[0]], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'user-decision' } });
  assert.equal(decision.status, 'USER_DECISION_REQUIRED');
  const noParentValidation = await integrateResults({ units: [units[0]], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'all-or-nothing' } });
  assert.equal(noParentValidation.status, 'INTEGRATION_BLOCKED');
  const undefinedVerdict = await integrateResults({ units: [units[0]], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'all-or-nothing' }, validate: async () => undefined, review: parentReviewPass, rollback: async () => {}, globalVerify: globalPass });
  assert.equal(undefinedVerdict.status, 'INTEGRATION_BLOCKED');

  let partialMutation = false; let firstRollback = false;
  const firstApplyFailure = await integrateResults({ units: [units[0]], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'all-or-nothing' }, validate: parentPathPass, review: parentReviewPass, apply: async () => { partialMutation = true; throw new Error('partial apply'); }, rollback: async () => { partialMutation = false; firstRollback = true; }, globalVerify: globalPass });
  assert.equal(firstApplyFailure.status, 'INTEGRATION_BLOCKED');
  assert.equal(partialMutation, false);
  assert.equal(firstRollback, true);

  let verifyRollback = false;
  const verifyThrow = await integrateResults({ units: [units[0]], integration: { base_head: 'base', merge_order: ['b'], atomicity: 'all-or-nothing' }, validate: parentPathPass, review: parentReviewPass, apply: async () => {}, rollback: async () => { verifyRollback = true; }, globalVerify: async () => { throw new Error('verify crash'); } });
  assert.equal(verifyThrow.status, 'GLOBAL_VERIFICATION_FAILED');
  assert.equal(verifyRollback, true);
});

test('failure policy retries transient failures but not deterministic violations', async () => {
  let attempts = 0;
  const result = await integrateResults({ units: [{ id: 'u', status: 'PASSED', result: { type: 'patch', ref: 'p', base_head: 'base', associated_head_or_diff: 'p', output_digest: 'd', exit_code: 0, changed_paths: ['a'], validation: { path_boundary: true, stage_a: true, stage_b: true } } }], integration: { base_head: 'base', merge_order: ['u'], atomicity: 'independent-successes' }, failurePolicy: { max_attempts: 2, retry_transient_failures: true }, validate: parentPathPass, review: parentReviewPass, apply: async () => { attempts += 1; if (attempts === 1) { const error = new Error('busy'); error.transient = true; throw error; } }, globalVerify: globalPass });
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
  const transferred = assignRepair({ finding: { id: 'F4', paths: ['src/b/x.ts'] }, unit, ownershipTransfer: { approved: true, workspace_path: '/integration', allowed_paths: ['src/b/**'] } });
  assert.equal(transferred.repair_owner, 'integration-owner');
  assert.throws(() => assignRepair({ finding: { id: 'F4b', paths: ['src/b/x.ts'] }, unit, ownershipTransfer: { approved: true, workspace_path: '/integration', allowed_paths: ['src/c/**'] } }), /transferred scope/);
  const deferred = assignRepair({ finding: { id: 'F5', paths: ['src/a/x.ts'], blocking: true, deferred: true }, unit });
  assert.equal(deferred.status, 'BLOCKED');
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

test('temporary Git fan-in exposes deterministic cherry-pick conflicts', async () => {
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
      result: { type: 'commit', ref, base_head: base, associated_head_or_diff: ref, output_digest: ref, exit_code: 0, changed_paths: [`unit-${index}.txt`], validation: { path_boundary: true, stage_a: true, stage_b: true } }
    }));
    const result = await integrateResults({
      units,
      integration: { base_head: base, merge_order: ['a', 'b'], atomicity: 'all-or-nothing' },
      validate: parentPathPass,
      review: parentReviewPass,
      apply: async (unit) => git(root, 'cherry-pick', unit.result.ref),
      rollback: async () => {
        try { git(root, 'cherry-pick', '--abort'); } catch {}
        git(root, 'reset', '--hard', base);
      },
      globalVerify: globalPass
    });
    assert.equal(result.status, 'INTEGRATION_BLOCKED');
    assert.equal(git(root, 'rev-parse', 'HEAD'), base);
    assert.equal((await readFile(path.join(root, 'shared.txt'), 'utf8')).trim(), 'base');
  } finally {
    for (const p of [wtA, wtB, root]) await rm(p, { recursive: true, force: true });
  }
});
