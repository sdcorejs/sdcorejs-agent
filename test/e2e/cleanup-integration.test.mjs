import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, lstat, mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import test from 'node:test';
import { createApprovedArtifact } from '../../_refs/shared/approved-artifact.mjs';
import { approveCleanupPlan, approveCleanupPolicy, approveCleanupRestore, cleanupFingerprint } from '../../_refs/cleanup/cleanup-contract.mjs';
import { applyCleanupPlan, captureCleanupState, freezeCleanupPlan, restoreCleanup, scanCleanup } from '../../_refs/cleanup/cleanup-engine.mjs';
import { coordinateCleanupOffer, createCleanupOfferState, evaluateCleanupLifecycle, resolveCleanupOffer, selectTaskTailCleanup } from '../../_refs/cleanup/offer-policy.mjs';
import { createConvergenceReceiptArtifact, evaluateConvergence, evaluateConvergenceHandoff } from '../../_refs/shared/convergence-contract.mjs';
import { evaluateShipReadiness } from '../../_refs/shared/ship-readiness-contract.mjs';
import { projectRuntimeContext } from '../../_refs/harness/runtime-policy.mjs';
import { convergenceFixture } from '../../authoring/evals/run-deterministic.mjs';
import { inspectCleanupPosixCapabilities } from '../../_refs/cleanup/posix-file-operation.mjs';

const exec = promisify(execFile);
const seal = (receipt) => {
  const { receipt_id, ...payload } = receipt;
  return { ...payload, receipt_id: cleanupFingerprint(payload) };
};

async function fixture(t) {
  const base = process.platform === 'win32' ? os.tmpdir() : process.env.SDCOREJS_CLEANUP_POSIX_FIXTURE_ROOT;
  assert.ok(base && path.isAbsolute(base), 'Select a trusted local ext4/APFS integration fixture parent.');
  const parent = await realpath(base);
  const root = await realpath(await mkdtemp(path.join(parent, 'sdcorejs-cleanup-integration-')));
  t.after(async () => {
    assert.equal(path.dirname(root), parent);
    assert.match(path.basename(root), /^sdcorejs-cleanup-integration-/u);
    assert.equal((await lstat(root)).isSymbolicLink(), false);
    await rm(root, { recursive: true, force: true });
  });
  const artifact = '.sdcorejs/tmp/task-1/render.txt';
  await mkdir(path.join(root, path.dirname(artifact)), { recursive: true });
  await mkdir(path.join(root, 'src'));
  await writeFile(path.join(root, artifact), 'Fixture intermediate render output.');
  await writeFile(path.join(root, 'src', 'check.mjs'), [
    "import assert from 'node:assert/strict';",
    "import { existsSync } from 'node:fs';",
    "import path from 'node:path';",
    "assert.equal(existsSync(path.join(process.argv[2], process.argv[3])), process.argv[4] === 'present');",
    "console.log('affected fixture verification passed');",
  ].join('\n'));
  const task = { id: 'task-1', change_ref: 'task-1-change', status: 'completed', durable_finalized: true };
  const evidence = { [artifact]: { task_id: task.id, owner: 'fixture-owner', reproducible: true,
    producer_status: 'finished', needed_for_evidence: false, evidence: ['Completed fixture render is reproducible.'] } };
  const scope = ['.sdcorejs/tmp/task-1'];
  const reference_scope = ['src'];
  let admission = {};
  if (process.platform !== 'win32') {
    const python = process.env.SDCOREJS_CLEANUP_PYTHON;
    assert.ok(python && path.isAbsolute(python), 'Select an existing absolute CPython for integration fixtures.');
    const capabilities = await inspectCleanupPosixCapabilities({ root, python });
    assert.equal(capabilities.supported, true, JSON.stringify(capabilities));
    const maintenance = { root_id: root, task_id: task.id, generation: 'integration-fixture-epoch', source: 'conversation',
      owner: 'isolated-fixture-owner', attestation: 'Fixture setup completed; writable descriptors and producer children are closed. No external writer is admitted.',
      participants: [{ id: 'integration-fixture-setup', state: 'quiescent', evidence: 'Awaited fixture writes; subsequent verifier processes only read and are awaited.',
        writable_descriptors_closed: true, children_quiescent: true }], fence_path: '.sdcorejs/tmp/cleanup-runtime/posix-maintenance.lock' };
    admission = { maintenance, posix_boundary: { version: 'posix-maintenance-v1', root_id: root,
      python: capabilities.python, helper_sha256: capabilities.helper_sha256, profile: capabilities.profile, maintenance } };
  }
  const analysis = await scanCleanup({ root, scope, reference_scope, task, evidence });
  assert.equal(analysis.findings[0].risk, 'LOW');
  const plan = freezeCleanupPlan(analysis, { actions: [{ path: artifact, action: 'delete' }], ...admission });
  const policy = approveCleanupPolicy({ root_id: analysis.root_id, task_id: task.id, paths: [artifact], source: 'conversation', decision: 'approve', ...admission });
  const actualCommand = [process.execPath, path.join(root, 'src', 'check.mjs'), root, artifact];
  const verify = async () => {
    const { stdout } = await exec(actualCommand[0], actualCommand.slice(1), { windowsHide: true });
    assert.match(stdout, /affected fixture verification passed/u);
    return { result: 'PASSED', checks: [{ id: 'fixture-affected-check', result: 'PASSED', actual_command: actualCommand, evidence: stdout.trim() }] };
  };
  return { root, artifact, task, evidence, scope, reference_scope, plan, policy, verify, actualCommand, ...admission };
}

function evidenceFor(receipt, input, command) {
  const row = structuredClone(input.evidence[0]);
  return { ...row, actual_command: command, cleanup_receipt_ids: [receipt.receipt_id], path_refs: [...new Set([
    ...row.path_refs, ...receipt.actions.filter(({ status }) => status !== 'retained').map(({ path: file }) => file),
  ])] };
}

async function completed(t) {
  const data = await fixture(t);
  const receipt = await applyCleanupPlan({ ...data, verify: data.verify });
  assert.equal(receipt.status, 'verified', JSON.stringify(receipt.errors));
  const current_snapshot = await captureCleanupState(data);
  const input = convergenceFixture();
  input.evidence[0] = evidenceFor(receipt, input, data.actualCommand);
  const cleanup = { receipts: [receipt], current_snapshot, evidence_refs: [input.evidence[0].id] };
  input.cleanup = cleanup;
  return { ...data, receipt, cleanup, input };
}

test('integration fixtures preserve platform authority and reject a changed POSIX maintenance window', async (t) => {
  const data = await fixture(t);
  if (process.platform === 'win32') {
    assert.equal(data.posix_boundary, undefined);
    assert.equal(data.maintenance, undefined);
    assert.equal(data.plan.posix_boundary, undefined);
    assert.equal(data.policy.posix_boundary_fingerprint, undefined);
  } else {
    assert.equal(data.plan.posix_boundary.root_id, data.root);
    assert.deepEqual(data.plan.posix_boundary.maintenance, data.maintenance);
    assert.equal(data.policy.posix_boundary_fingerprint, cleanupFingerprint(data.posix_boundary));
    const maintenance = structuredClone(data.maintenance);
    maintenance.generation = 'changed-integration-window';
    const denied = await applyCleanupPlan({ ...data, maintenance });
    assert.equal(denied.status, 'blocked');
    assert.ok(denied.errors.some(({ code }) => code === 'MAINTENANCE_CHANGED'));
    const legacyPlan = freezeCleanupPlan(await scanCleanup(data), { actions: [{ path: data.artifact, action: 'delete' }] });
    const legacy = await applyCleanupPlan({ ...data, plan: legacyPlan });
    assert.equal(legacy.status, 'blocked');
    assert.ok(legacy.errors.some(({ code }) => code === 'INVALID_POSIX_BOUNDARY'));
  }
  await access(path.join(data.root, data.artifact));
});

test('task-tail policy performs real isolated LOW cleanup and feeds current affected evidence to convergence', async (t) => {
  const { root, artifact, receipt, cleanup, input } = await completed(t);
  await assert.rejects(access(path.join(root, artifact)), { code: 'ENOENT' });
  assert.equal(receipt.verification.affected_checks, 'PASSED');
  const lifecycle = evaluateCleanupLifecycle({ ...cleanup, evidence: input.evidence,
    current_source: { source_revision: input.source.revision, source_fingerprint: input.source.fingerprint } });
  assert.equal(lifecycle.status, 'ACCEPTED', JSON.stringify(lifecycle.blockers));
  const result = evaluateConvergence(input);
  assert.equal(result.status, 'CONVERGED', JSON.stringify(result.blockers));
  assert.deepEqual(result.cleanup_receipt_ids, [receipt.receipt_id]);
});

test('filesystem success without affected verification blocks readiness', async (t) => {
  const data = await fixture(t);
  const receipt = await applyCleanupPlan({ ...data, verify: null });
  assert.equal(receipt.status, 'applied');
  assert.equal(receipt.verification.result, 'PASSED');
  assert.equal(receipt.verification.affected_checks, 'NOT RUN');
  const result = evaluateCleanupLifecycle({ receipts: [receipt], current_snapshot: receipt.source_after,
    evidence_refs: ['EVIDENCE-001'], evidence: [{ id: 'EVIDENCE-001', result: 'PASSED', freshness: 'current', actual_command: ['fixture-check'], path_refs: [data.artifact] }] });
  assert.equal(result.status, 'BLOCKED');
  assert.ok(result.blockers.some(({ code }) => code === 'CLEANUP_UNVERIFIED'));
});

test('task tail selects only known policy-approved artifacts from the current finalized task', async (t) => {
  const data = await fixture(t);
  const context = { schema_version: 1, change_ref: data.task.change_ref,
    local_only: [{ path: data.artifact }, { path: '.sdcorejs/tmp/unrelated/render.txt' },
      { path: '.sdcorejs/tmp/task-1/diagnostic.txt' }], required_with_change: [], shared_owned: [], conditional: [] };
  const policy = approveCleanupPolicy({ root_id: data.root, task_id: data.task.id,
    paths: context.local_only.map(({ path: file }) => file), source: 'conversation', decision: 'approve', posix_boundary: data.posix_boundary });
  const evidence = { ...data.evidence,
    '.sdcorejs/tmp/unrelated/render.txt': { ...data.evidence[data.artifact], task_id: 'unrelated-task' },
    '.sdcorejs/tmp/task-1/diagnostic.txt': { ...data.evidence[data.artifact], needed_for_evidence: true },
  };
  const selected = selectTaskTailCleanup({ task: data.task, artifact_context: context, evidence, policy });
  assert.deepEqual(selected.scope, [data.artifact]);
  assert.equal(selected.analysis_required, true);
  for (const status of ['failed', 'cancelled', 'interrupted', 'running']) {
    assert.deepEqual(selectTaskTailCleanup({ task: { ...data.task, status }, artifact_context: context, evidence, policy }).scope, []);
  }
  assert.deepEqual(selectTaskTailCleanup({ task: { ...data.task, durable_finalized: false }, artifact_context: context, evidence, policy }).scope, []);
  assert.deepEqual(selectTaskTailCleanup({ task: data.task, artifact_context: context, evidence, policy: null }).scope, []);
  const durableContext = { ...context, required_with_change: [{ path: data.artifact }] };
  assert.deepEqual(selectTaskTailCleanup({ task: data.task, artifact_context: durableContext, evidence, policy }).scope, []);
});

test('accepted proactive analysis cannot authorize the cleanup engine', async (t) => {
  const data = await fixture(t);
  const offered = coordinateCleanupOffer({
    state: createCleanupOfferState({ scope_id: 'fixture-runtime' }), boundary: { phase: 'after-primary-result' },
    signals: [{ source: 'sdcorejs-explore', significant: true,
      scope: { repository_id: 'fixture-repo', paths: data.scope }, category: 'temp',
      observed_state: { fingerprint: data.plan.state.fingerprint }, unknowns: [], reason_to_offer: 'Completed reproducible task outputs remain.',
      evidence: [{ kind: 'producer-finished', confirmed: true, paths: [data.artifact], detail: 'Fixture producer finished.' }] }],
  });
  const accepted = resolveCleanupOffer({ state: offered.state, offer_id: offered.offer.offer_id, response: '1' });
  const receipt = await applyCleanupPlan({ ...data, policy: null, approval: accepted.analysis_authority });
  assert.equal(receipt.status, 'blocked');
  assert.equal(receipt.errors[0].code, 'MUTATION_AUTHORITY_REQUIRED');
  await access(path.join(data.root, data.artifact));
  assert.throws(() => approveCleanupPlan(data.plan, accepted.analysis_authority), /MUTATION_AUTHORITY_REQUIRED/u);
});

test('current snapshot and mapped verification independently invalidate stale or fabricated receipts', async (t) => {
  const { receipt, cleanup, input } = await completed(t);
  for (const mutated of [
    { ...cleanup, current_snapshot: { fingerprint: `sha256:v1:${'f'.repeat(64)}` } },
    { ...cleanup, receipts: [{ ...receipt, status: 'partial' }] },
    { ...cleanup, receipts: [seal({ ...receipt, status: 'partial', errors: [{ code: 'STALE_ACTION', path: 'fixture', message: 'state changed' }] })] },
    { ...cleanup, evidence_refs: ['EVIDENCE-999'] },
  ]) assert.equal(evaluateCleanupLifecycle({ ...mutated, evidence: input.evidence }).valid, false);
  const missingPathEvidence = input.evidence.map((row) => ({ ...row, path_refs: ['src/orders.mjs'] }));
  assert.equal(evaluateCleanupLifecycle({ ...cleanup, evidence: missingPathEvidence }).valid, false);
  const staleSourceEvidence = input.evidence.map((row) => ({ ...row, source_fingerprint: 'stale' }));
  assert.equal(evaluateCleanupLifecycle({ ...cleanup, evidence: staleSourceEvidence,
    current_source: { source_revision: input.source.revision, source_fingerprint: input.source.fingerprint } }).valid, false);
});

test('cleanup invalidates prior convergence even when the Git source fingerprint is unchanged', async (t) => {
  const { input, receipt } = await completed(t);
  const prior = structuredClone(input);
  delete prior.cleanup;
  const priorResult = evaluateConvergence(prior);
  const current = { ...priorResult.source_identity, change_ref: input.change_ref, mode: input.mode,
    cleanup_receipt_ids: [receipt.receipt_id] };
  const stale = evaluateConvergenceHandoff({ result: priorResult,
    receipt: createConvergenceReceiptArtifact(prior), current });
  assert.equal(stale.valid, false);
  assert.ok(stale.blockers.some(({ path: field }) => field === 'convergence_result.cleanup_receipt_ids'));
  const fresh = evaluateConvergenceHandoff({ result: evaluateConvergence(input),
    receipt: createConvergenceReceiptArtifact(input), current });
  assert.equal(fresh.valid, true, JSON.stringify(fresh.blockers));
});

test('cleanup after branch-ready requires the final gate to consume the current receipt', async (t) => {
  const { cleanup, input, receipt } = await completed(t);
  assert.equal(evaluateCleanupLifecycle({ ...cleanup, evidence: input.evidence,
    branch_ready: { cleanup_receipt_ids: [] } }).valid, false);
  assert.equal(evaluateCleanupLifecycle({ ...cleanup, evidence: input.evidence,
    branch_ready: { cleanup_receipt_ids: [receipt.receipt_id] } }).valid, true);
});

async function quarantined(t) {
  const data = await fixture(t);
  const analysis = await scanCleanup(data);
  const plan = freezeCleanupPlan(analysis, { actions: [{ path: data.artifact, action: 'quarantine' }], posix_boundary: data.posix_boundary });
  const approval = approveCleanupPlan(plan, { source: 'conversation', decision: 'approve',
    authority: 'mutation', action_ids: plan.actions.map(({ id }) => id) });
  const receipt = await applyCleanupPlan({ ...data, plan, policy: null, approval, verify: data.verify });
  assert.equal(receipt.status, 'verified', JSON.stringify(receipt.errors));
  return { ...data, plan, receipt };
}

test('verified restore is a new cleanup event consumed by convergence and final branch readiness', async (t) => {
  const data = await quarantined(t);
  const priorInput = convergenceFixture();
  priorInput.evidence[0] = evidenceFor(data.receipt, priorInput, data.actualCommand);
  priorInput.cleanup = { receipts: [data.receipt], current_snapshot: await captureCleanupState(data),
    evidence_refs: [priorInput.evidence[0].id] };
  const priorResult = evaluateConvergence(priorInput);
  assert.equal(priorResult.status, 'CONVERGED', JSON.stringify(priorResult.blockers));
  const priorConvergenceReceipt = createConvergenceReceiptArtifact(priorInput);
  const restoreCommand = [...data.actualCommand, 'present'];
  const verify = async () => {
    const { stdout } = await exec(restoreCommand[0], restoreCommand.slice(1), { windowsHide: true });
    assert.match(stdout, /affected fixture verification passed/u);
    return { result: 'PASSED', checks: [{ id: 'fixture-restore-affected-check', result: 'PASSED',
      actual_command: restoreCommand, evidence: stdout.trim() }] };
  };
  const restored = await restoreCleanup({ ...data, approval: approveCleanupRestore(data.receipt, {
    source: 'conversation', decision: 'approve', authority: 'restore', posix_boundary: data.posix_boundary,
  }), verify });
  assert.equal(restored.status, 'verified', JSON.stringify(restored.errors));
  assert.equal(restored.operation, 'restore');
  assert.equal(restored.restore_of_receipt_id, data.receipt.receipt_id);
  assert.notEqual(restored.receipt_id, data.receipt.receipt_id);
  assert.ok(restored.metrics.restored_bytes > 0);
  assert.equal(restored.metrics.removed_active_bytes, 0);
  assert.equal(restored.metrics.reclaimed_bytes, 0);
  await access(path.join(data.root, data.artifact));
  await assert.rejects(exec(data.actualCommand[0], data.actualCommand.slice(1), { windowsHide: true }));
  const input = convergenceFixture();
  input.evidence[0] = evidenceFor(restored, input, restoreCommand);
  const cleanup = { receipts: [data.receipt, restored], current_snapshot: await captureCleanupState(data),
    evidence_refs: [input.evidence[0].id] };
  input.cleanup = cleanup;
  const lifecycle = evaluateCleanupLifecycle({ ...cleanup, evidence: input.evidence });
  assert.equal(lifecycle.valid, true, JSON.stringify(lifecycle.blockers));
  const missingParent = evaluateCleanupLifecycle({ ...cleanup, receipts: [restored], evidence: input.evidence });
  assert.equal(missingParent.valid, false);
  assert.ok(missingParent.blockers.some(({ code }) => code === 'CLEANUP_INPUT_INVALID'));
  const staleApplyProof = priorInput.evidence.map((entry) => ({ ...entry, cleanup_receipt_ids: [restored.receipt_id] }));
  assert.equal(evaluateCleanupLifecycle({ ...cleanup, evidence: staleApplyProof }).valid, false);
  const staleEventBinding = input.evidence.map((entry) => ({ ...entry, cleanup_receipt_ids: [data.receipt.receipt_id] }));
  assert.equal(evaluateCleanupLifecycle({ ...cleanup, evidence: staleEventBinding }).valid, false);
  const foreignEventBinding = input.evidence.map((entry) => ({ ...entry,
    cleanup_receipt_ids: [restored.receipt_id, `sha256:v1:${'a'.repeat(64)}`] }));
  assert.equal(evaluateCleanupLifecycle({ ...cleanup, evidence: foreignEventBinding }).valid, false);
  const result = evaluateConvergence(input);
  assert.equal(result.status, 'CONVERGED', JSON.stringify(result.blockers));
  assert.deepEqual(result.cleanup_receipt_ids, [data.receipt.receipt_id, restored.receipt_id]);
  const current = { ...result.source_identity, change_ref: input.change_ref, mode: input.mode,
    cleanup_receipt_ids: result.cleanup_receipt_ids };
  assert.equal(evaluateConvergenceHandoff({ result: priorResult, receipt: priorConvergenceReceipt, current }).valid, false);
  assert.equal(evaluateConvergenceHandoff({ result, receipt: createConvergenceReceiptArtifact(input), current }).valid, true);
  assert.equal(evaluateCleanupLifecycle({ ...cleanup, evidence: input.evidence,
    branch_ready: { cleanup_receipt_ids: [data.receipt.receipt_id] } }).valid, false);
  const contract = shipFixture(input, cleanup);
  const handoff = projectRuntimeContext({ contextType: 'artifact_context', consumer: 'sdcorejs-ship',
    capabilityStatus: 'unknown', context: { schema_version: 1, change_ref: input.change_ref,
      source_spec: 'fixture-spec', source_plan: 'fixture-plan', required_with_change: [], shared_owned: [],
      conditional: [], local_only: [], unrelated_observed: [], cleanup } });
  assert.deepEqual(handoff.portable_handoff.authoritative.cleanup, cleanup);
  assert.equal(evaluateCleanupLifecycle({ ...handoff.portable_handoff.authoritative.cleanup, evidence: input.evidence }).valid, true);
  assert.equal(evaluateShipReadiness(contract).stages.commit_ready.status, 'READY');
  assert.equal(evaluateShipReadiness({ ...contract, delivery: { ...contract.delivery,
    branch_ready_cleanup_receipt_ids: [data.receipt.receipt_id] } }).stages.commit_ready.status, 'BLOCKED');
  for (const invalid of [
    seal({ ...restored, restore_of_receipt_id: 'missing-parent' }),
    seal({ ...restored, restore_of_receipt_id: `sha256:v1:${'d'.repeat(64)}` }),
    seal({ ...restored, metrics: { ...restored.metrics, reclaimed_bytes: restored.metrics.restored_bytes } }),
    seal({ ...restored, restored: [] }),
    seal({ ...restored, actions: restored.actions.map((action) => ({ ...action, fingerprint: `sha256:${'f'.repeat(64)}` })) }),
  ]) assert.equal(evaluateCleanupLifecycle({ ...cleanup, receipts: [data.receipt, invalid], evidence: input.evidence }).valid, false);
});

test('restore without affected command verification keeps readiness blocked', async (t) => {
  const data = await quarantined(t);
  const restored = await restoreCleanup({ ...data, approval: approveCleanupRestore(data.receipt, {
    source: 'conversation', decision: 'approve', authority: 'restore', posix_boundary: data.posix_boundary,
  }), verify: null });
  assert.equal(restored.status, 'restored');
  assert.equal(restored.verification.affected_checks, 'NOT RUN');
  const input = convergenceFixture();
  input.evidence[0] = evidenceFor(restored, input, data.actualCommand);
  const lifecycle = evaluateCleanupLifecycle({ receipts: [data.receipt, restored],
    current_snapshot: await captureCleanupState(data), evidence_refs: [input.evidence[0].id], evidence: input.evidence });
  assert.equal(lifecycle.valid, false);
  assert.ok(lifecycle.blockers.some(({ code }) => code === 'CLEANUP_UNVERIFIED'));
});

test('review F-02: verified restore cannot omit an apply with failed affected verification', async (t) => {
  const data = await fixture(t);
  const plan = freezeCleanupPlan(await scanCleanup(data), { actions: [{ path: data.artifact, action: 'quarantine' }], posix_boundary: data.posix_boundary });
  const approval = approveCleanupPlan(plan, { source: 'conversation', decision: 'approve', authority: 'mutation',
    action_ids: plan.actions.map(({ id }) => id) });
  const failingCommand = [process.execPath, '-e', 'process.exit(1)'];
  const verifyFailure = async () => {
    await assert.rejects(exec(failingCommand[0], failingCommand.slice(1), { windowsHide: true }), ({ code }) => code === 1);
    return { result: 'FAILED', checks: [{ result: 'FAILED', actual_command: failingCommand, evidence: { exit_code: 1 } }] };
  };
  const applied = await applyCleanupPlan({ ...data, plan, policy: null, approval, verify: verifyFailure });
  assert.equal(applied.status, 'partial');
  assert.equal(applied.verification.affected_checks, 'FAILED');
  const restoreCommand = [...data.actualCommand, 'present'];
  const restored = await restoreCleanup({ ...data, receipt: applied,
    approval: approveCleanupRestore(applied, { source: 'conversation', decision: 'approve', authority: 'restore', posix_boundary: data.posix_boundary }),
    verify: async () => {
      const { stdout } = await exec(restoreCommand[0], restoreCommand.slice(1), { windowsHide: true });
      return { result: 'PASSED', checks: [{ result: 'PASSED', actual_command: restoreCommand, evidence: stdout }] };
    } });
  assert.equal(restored.status, 'verified');
  const input = convergenceFixture();
  input.evidence[0] = evidenceFor(restored, input, restoreCommand);
  const args = { current_snapshot: await captureCleanupState(data), evidence_refs: [input.evidence[0].id], evidence: input.evidence };
  for (const receipts of [[restored], [applied, restored], [restored, applied]]) {
    const outcome = evaluateCleanupLifecycle({ ...args, receipts });
    assert.equal(outcome.valid, false, 'omission/reordering cannot hide failed apply evidence');
    assert.equal(outcome.status, 'BLOCKED');
  }
  await access(path.join(data.root, data.artifact));
});

test('partial apply, inconsistent receipt chains and malformed cleanup input fail closed', async (t) => {
  const { cleanup, input, receipt } = await completed(t);
  const second = seal({ ...receipt, plan_id: `sha256:v1:${'b'.repeat(64)}`,
    source_before: { ...receipt.source_before, fingerprint: 'broken-chain' } });
  const chain = evaluateCleanupLifecycle({ ...cleanup, receipts: [receipt, second], evidence: input.evidence });
  assert.equal(chain.valid, false);
  assert.ok(chain.blockers.some(({ code }) => code === 'CLEANUP_SOURCE_MISMATCH'));
  for (const receipts of [null, [null], [{}], [seal({ ...receipt, actions: [null] })]]) {
    assert.doesNotThrow(() => evaluateCleanupLifecycle({ ...cleanup, receipts, evidence: input.evidence }));
    assert.equal(evaluateCleanupLifecycle({ ...cleanup, receipts, evidence: input.evidence }).valid, false);
  }
  const malformed = { ...input, cleanup: { receipts: [], evidence_refs: 12 } };
  assert.doesNotThrow(() => evaluateConvergence(malformed));
  assert.equal(evaluateConvergence(malformed).status, 'BLOCKED');
});

function shipFixture(input, cleanup) {
  const source = input.source;
  const artifact = createApprovedArtifact({ metadata: {
    schema_version: 1, artifact_id: 'cleanup-fixture-plan', artifact_kind: 'plan', contract_id: 'cleanup-fixture',
    requirement_id: 'cleanup-fixture', change_ref: input.change_ref, track: 'workflow', stack_profile: 'general',
    owner_repository_id: source.repository_id, owner_repository_role: 'standalone', owner_module_id: null,
    parent_repository_id: null, parent_references: [], approval_source: 'explicit-fixture-approval',
    approved_at: '2026-10-01T00:00:00.000Z', approved_by: 'fixture-owner',
    repository_relative_path: '.sdcorejs/plans/cleanup-fixture.md', source_revision: source.revision,
    convergence_mode: input.mode, supersedes: null,
  }, body: '# Approved isolated fixture plan\n' });
  const releaseEvidence = [
    ['angular-golden', 'golden-build'], ['nextjs-production-build', 'production-build'],
    ['nestjs-production-auth', 'production-integration'], ['full-e2e', 'full-matrix'],
  ].map(([evidence_type, evidence_class]) => ({ evidence_type, evidence_class, result: 'PASSED',
    actual_command: ['fixture-release-command'], source_revision: source.revision, source_fingerprint: source.fingerprint,
    portal_revision: source.portal_revision, module_revision_map: source.module_revision_map,
    environment_fingerprint: 'synthetic-contract-fixture', finished_at: '2026-10-01T00:00:01.000Z',
    ...(evidence_type === 'nestjs-production-auth' ? { provider_kind: 'oidc-jwks', production_provider_exercised: true } : {}),
  }));
  return { schema_version: 1,
    source_identity: { source_revision: source.revision, source_fingerprint: source.fingerprint,
      portal_repository_id: source.repository_id, portal_revision: source.portal_revision,
      owner_thread_id: input.thread.owner_thread_id,
      modules: Object.entries(source.module_revision_map).map(([module_id, revision]) => ({
        module_id, revision, pinned_revision: revision, repository_id: `fixture/${module_id}`, required_for_release: false,
      })),
    }, approved_artifacts: [{ artifact, parent_artifacts: [] }],
    convergence_result: evaluateConvergence(input), convergence_receipt: createConvergenceReceiptArtifact(input),
    evidence: [...releaseEvidence, ...input.evidence], findings: [], cleanup,
    delivery: { branch_ready_result: 'READY', branch_ready_source_fingerprint: source.fingerprint,
      branch_ready_cleanup_receipt_ids: cleanup.receipts.map(({ receipt_id }) => receipt_id),
      artifact_closure: 'complete', protected_branch: false },
  };
}

test('ship consumes cleanup receipts and keeps affected verification and final branch readiness distinct', async (t) => {
  const { input, cleanup, receipt } = await completed(t);
  const contract = shipFixture(input, cleanup);
  const current = evaluateShipReadiness(contract);
  assert.equal(current.stages.ready_to_ship.status, 'READY', JSON.stringify(current.stages.ready_to_ship.blockers));
  assert.equal(current.stages.commit_ready.status, 'READY', JSON.stringify(current.stages.commit_ready.blockers));
  const stale = evaluateShipReadiness({ ...contract, delivery: { ...contract.delivery, branch_ready_cleanup_receipt_ids: [] } });
  assert.equal(stale.stages.ready_to_ship.status, 'READY');
  assert.equal(stale.stages.commit_ready.status, 'BLOCKED');
  const incomplete = evaluateShipReadiness({ ...contract, cleanup: { ...cleanup,
    receipts: [seal({ ...receipt, status: 'applied', verification: { ...receipt.verification, affected_checks: 'NOT RUN' } })] } });
  assert.equal(incomplete.stages.ready_to_ship.status, 'BLOCKED');
});
