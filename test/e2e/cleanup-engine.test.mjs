import test from 'node:test';
import assert from 'node:assert/strict';
import { access, link, lstat, mkdir, mkdtemp, open, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { watch } from 'node:fs';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  scanCleanup, freezeCleanupPlan as freezePlan, applyCleanupPlan as applyPlan, restoreCleanup as restorePlan, captureCleanupState,
} from '../../_refs/cleanup/cleanup-engine.mjs';
import {
  approveCleanupPlan, approveCleanupPolicy, approveCleanupRestore, CLEANUP_RUNTIME_ROOT, cleanupFingerprint,
} from '../../_refs/cleanup/cleanup-contract.mjs';

const exec = promisify(execFile);
const TASK = Object.freeze({ id: 'fixture-cleanup-task', status: 'completed', durable_finalized: true });
const OUTPUT = Object.freeze({ owner: 'fixture-producer', task_id: TASK.id, producer_status: 'finished', reproducible: true, needed_for_evidence: false,
  evidence: Object.freeze(['The isolated test fixture producer wrote this exact file from the declared fixture contents before cleanup analysis.']) });
const OWNED = '.sdcorejs/tmp/task';
const CLI = fileURLToPath(new URL('../../_refs/cleanup/cli.mjs', import.meta.url));
const posixContexts = new Map();

function freezeCleanupPlan(analysis, options = {}) {
  const context = posixContexts.get(analysis.root_id);
  return freezePlan(analysis, { ...options, ...(context ? { posix_boundary: context.boundary } : {}) });
}
function applyCleanupPlan(input) {
  const context = posixContexts.get(input.root);
  return applyPlan({ ...(context ? { maintenance: context.maintenance } : {}), ...input });
}
function restoreCleanup(input) {
  const context = posixContexts.get(input.root);
  return restorePlan({ ...(context ? { maintenance: context.maintenance } : {}), ...input });
}

async function fixture(t, files = {}) {
  const base = process.platform === 'win32' ? tmpdir() : process.env.SDCOREJS_CLEANUP_POSIX_FIXTURE_ROOT;
  assert.ok(base && path.isAbsolute(base), 'POSIX tests require an explicitly selected trusted ext4/APFS fixture parent.');
  const parent = await realpath(base);
  const root = await realpath(await mkdtemp(path.join(parent, 'sdcorejs-cleanup-test-')));
  t.after(async () => {
    for (const release of posixContexts.get(root)?.releases ?? []) await release();
    const target = path.resolve(root);
    assert.equal(path.dirname(target), parent);
    assert.match(path.basename(target), /^sdcorejs-cleanup-test-/u);
    assert.equal((await lstat(target)).isSymbolicLink(), false);
    await rm(target, { recursive: true, force: true });
    posixContexts.delete(root);
  });
  for (const [relative, contents] of Object.entries(files)) await put(root, relative, contents);
  if (process.platform !== 'win32') {
    const { inspectCleanupPosixCapabilities } = await import('../../_refs/cleanup/posix-file-operation.mjs');
    const python = process.env.SDCOREJS_CLEANUP_PYTHON;
    assert.ok(python && path.isAbsolute(python), 'Select an already installed absolute CPython executable; no installation is performed.');
    const capabilities = await inspectCleanupPosixCapabilities({ root, python });
    assert.equal(capabilities.supported, true, JSON.stringify(capabilities));
    const maintenance = { root_id: root, task_id: TASK.id, generation: 'shared-fixture-epoch', source: 'conversation', owner: 'isolated-fixture-owner',
      attestation: 'All declared fixture setup writes have finished and handles/children are closed; controlled test barriers are separately reported.',
      participants: [{ id: 'fixture-setup', state: 'quiescent', evidence: 'Awaited setup writes before analysis.', writable_descriptors_closed: true, children_quiescent: true }],
      fence_path: '.sdcorejs/tmp/cleanup-runtime/posix-maintenance.lock' };
    posixContexts.set(root, { maintenance, releases: [], boundary: { version: 'posix-maintenance-v1', root_id: root,
      python: capabilities.python, helper_sha256: capabilities.helper_sha256, profile: capabilities.profile, maintenance } });
  }
  return root;
}

async function put(root, relative, contents) {
  await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
  await writeFile(path.join(root, relative), contents);
}

async function present(root, relative) {
  try { await access(path.join(root, relative)); return true; }
  catch (error) { if (error.code === 'ENOENT') return false; throw error; }
}

function evidenceFor(paths, overrides = {}) {
  return Object.fromEntries(paths.map((relative) => [relative, { ...OUTPUT, ...(overrides[relative] ?? {}) }]));
}

async function prepare(root, files, { scope = files, reference_scope = [], evidence = evidenceFor(files), task = TASK, actions } = {}) {
  const analysis = await scanCleanup({ root, scope, reference_scope, evidence, task });
  const plan = freezeCleanupPlan(analysis, { actions: actions ?? files.map((relative) => ({ path: relative, action: 'delete' })) });
  return { root, analysis, plan, evidence, task };
}

function mutation(plan, options = {}) {
  return approveCleanupPlan(plan, { source: 'conversation', decision: 'approve', authority: 'mutation', action_ids: plan.actions.filter((action) => !['keep', 'review'].includes(action.action)).map((action) => action.id), ...options });
}

function policy(analysis, paths, options = {}) {
  const context = posixContexts.get(analysis.root_id);
  return approveCleanupPolicy({ root_id: analysis.root_id, task_id: TASK.id, paths, source: 'conversation', decision: 'approve',
    ...(context ? { posix_boundary: context.boundary } : {}), ...options });
}

async function assertDestructivePlanBlocked(analysis, actions, options = {}) {
  let plan;
  try { plan = freezeCleanupPlan(analysis, { actions }); }
  catch (error) { assert.match(error.message, /^INVALID_FROZEN_ACTION$/u); return; }
  const receipt = await applyCleanupPlan({ root: analysis.root_id, plan, task: analysis.task, evidence: analysis.evidence, approval: mutation(plan, { atomic_group: plan.plan_id }), ...options });
  assert.equal(receipt.status, 'blocked');
}

function actualVerification(expectedAbsent, expectedPresent = []) {
  return async ({ root }) => {
    const script = [
      "const assert = require('node:assert/strict');",
      "const { access } = require('node:fs/promises');",
      "const path = require('node:path');",
      'const [root, absent, present] = process.argv.slice(1).map(JSON.parse);',
      'async function exists(relative) { try { await access(path.join(root, relative)); return true; } catch (error) { if (error.code === "ENOENT") return false; throw error; } }',
      '(async () => {',
      'for (const relative of absent) assert.equal(await exists(relative), false, relative);',
      'for (const relative of present) assert.equal(await exists(relative), true, relative);',
      'process.stdout.write(JSON.stringify({ absent, present, checked: absent.length + present.length }) + "\\n");',
      '})().catch((error) => { process.stderr.write(error.message + "\\n"); process.exitCode = 1; });',
    ].join('\n');
    const argv = ['-e', script, JSON.stringify(root), JSON.stringify(expectedAbsent), JSON.stringify(expectedPresent)];
    const { stdout, stderr } = await exec(process.execPath, argv, { cwd: root, windowsHide: true });
    const observed = JSON.parse(stdout);
    assert.deepEqual(observed, { absent: expectedAbsent, present: expectedPresent, checked: expectedAbsent.length + expectedPresent.length });
    return { result: 'PASSED', checks: [{ result: 'PASSED', actual_command: [process.execPath, ...argv], evidence: { stdout, stderr, exit_code: 0 } }] };
  };
}

function assertPhysicalReclaimMetrics(receipt) {
  const removed = receipt.actions.filter((action) => action.status === 'removed');
  for (const action of removed) {
    assert.equal(typeof action.reclaimed_bytes, 'number');
    assert.ok(Number.isSafeInteger(action.reclaimed_bytes) && action.reclaimed_bytes >= 0);
  }
  assert.equal(receipt.metrics.reclaimed_bytes, removed.reduce((sum, action) => sum + action.reclaimed_bytes, 0));
}

async function cli(args) {
  if (process.platform !== 'win32') {
    const root = args[args.indexOf('--root') + 1];
    const context = posixContexts.get(root);
    const index = args.indexOf('--input');
    if (context && index >= 0) {
      const inputPath = args[index + 1];
      const input = JSON.parse(await readFile(inputPath, 'utf8'));
      await writeFile(inputPath, JSON.stringify({ posix_boundary: context.boundary, maintenance: context.maintenance, ...input }));
    }
  }
  let output;
  try { output = { ...(await exec(process.execPath, [CLI, ...args], { windowsHide: true })), code: 0 }; }
  catch (error) { if (typeof error.code !== 'number') throw error; output = error; }
  return { code: output.code, stderr: output.stderr, result: output.stdout.trim() ? JSON.parse(output.stdout) : null };
}

async function holdFixtureWriter(t, root, contents, plan) {
  const context = posixContexts.get(root);
  if (!context) {
    await put(root, `${CLEANUP_RUNTIME_ROOT}/writer.lock`, contents);
    return `${CLEANUP_RUNTIME_ROOT}/writer.lock`;
  }
  const { acquirePosixCleanupWriter, releasePosixCleanupWriter } = await import('../../_refs/cleanup/posix-file-operation.mjs');
  const action = plan.actions[0];
  const operations = [{ source: action.path, destination: action.action === 'quarantine' ? action.posix_transaction.recovery : action.destination,
    fingerprint: action.fingerprint, state: plan.state.inventory.find(file => file.path === action.path).state,
    remove_source: true, transaction: action.posix_transaction }];
  const writer = await acquirePosixCleanupWriter({ root, root_state: plan.state.root_state, identity: plan.plan_id,
    posix_boundary: context.boundary, maintenance: context.maintenance, operations });
  assert.equal(writer.lock_verified, true, JSON.stringify(writer));
  context.releases.push(async () => assert.equal((await releasePosixCleanupWriter({ writer, maintenance: context.maintenance })).released, true));
  return context.maintenance.fence_path;
}

async function gitFixture(t, files = {}) {
  const root = await fixture(t, files);
  const oldCount = process.env.GIT_CONFIG_COUNT;
  const index = Number(oldCount ?? 0);
  const key = `GIT_CONFIG_KEY_${index}`, value = `GIT_CONFIG_VALUE_${index}`;
  const oldKey = process.env[key], oldValue = process.env[value];
  process.env.GIT_CONFIG_COUNT = String(index + 1);
  process.env[key] = 'safe.directory'; process.env[value] = root;
  t.after(() => {
    for (const [name, previous] of [['GIT_CONFIG_COUNT', oldCount], [key, oldKey], [value, oldValue]]) {
      if (previous === undefined) delete process.env[name]; else process.env[name] = previous;
    }
  });
  const git = async (...args) => exec('git', args, { cwd: root, windowsHide: true });
  await git('init', '--quiet');
  await git('add', '--all');
  await git('-c', 'user.name=Cleanup fixture', '-c', 'user.email=cleanup-fixture@example.invalid', 'commit', '--quiet', '--allow-empty', '-m', 'Isolated fixture baseline');
  return { root, git };
}

test('read-only analysis captures evidence without creating runtime files or changing content', async (t) => {
  const relative = `${OWNED}/preview.html`;
  const root = await fixture(t, { [relative]: '<p>preview</p>' });
  const before = await readdir(path.join(root, '.sdcorejs/tmp'));
  const analysis = await scanCleanup({ root, scope: [OWNED], evidence: evidenceFor([relative]), task: TASK });
  assert.equal(analysis.findings[0].risk, 'LOW');
  assert.deepEqual(analysis.writes, []);
  assert.equal(await readFile(path.join(root, relative), 'utf8'), '<p>preview</p>');
  assert.deepEqual(await readdir(path.join(root, '.sdcorejs/tmp')), before);
  assert.equal(await present(root, CLEANUP_RUNTIME_ROOT), false);
});

test('approved exact task policy removes LOW outputs and reports current affected verification', async (t) => {
  const relative = `${OWNED}/preview.html`;
  const root = await fixture(t, { [relative]: '<p>reproducible</p>' });
  const prepared = await prepare(root, [relative]);
  const receipt = await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [relative]), verify: actualVerification([relative]) });
  assert.equal(receipt.status, 'verified');
  assert.equal(receipt.actions[0].status, 'removed');
  assert.equal(receipt.metrics.removed_active_bytes, Buffer.byteLength('<p>reproducible</p>'));
  assertPhysicalReclaimMetrics(receipt);
  assert.equal(receipt.metrics.quarantine_bytes, 0);
  assert.equal(receipt.verification.affected_checks, 'PASSED');
  assert.equal(await present(root, relative), false);
});

test('filesystem success alone does not claim affected verification or branch readiness', async (t) => {
  const relative = `${OWNED}/preview.html`;
  const root = await fixture(t, { [relative]: 'rebuildable' });
  const prepared = await prepare(root, [relative]);
  const receipt = await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [relative]) });
  assert.equal(receipt.status, 'applied');
  assert.equal(receipt.verification.affected_checks, 'NOT RUN');
});

test('current diagnostics, failed-task evidence and unrelated temporary files never inherit LOW task authority', async (t) => {
  const diagnostics = `${OWNED}/debug.log`, unrelated = `${OWNED}/other.html`;
  const root = await fixture(t, { [diagnostics]: 'retain diagnosis', [unrelated]: 'another task' });
  const evidence = evidenceFor([diagnostics, unrelated], { [diagnostics]: { needed_for_evidence: true }, [unrelated]: { task_id: 'another-task' } });
  const prepared = await prepare(root, [diagnostics, unrelated], { evidence });
  assert.equal(prepared.analysis.findings.find((f) => f.path === diagnostics).protected, true);
  assert.notEqual(prepared.analysis.findings.find((f) => f.path === unrelated).risk, 'LOW');
  const receipt = await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [diagnostics, unrelated]) });
  assert.equal(receipt.status, 'blocked');
  assert.equal(await present(root, diagnostics), true);
  assert.equal(await present(root, unrelated), true);
  const failed = await scanCleanup({ root, scope: [OWNED], evidence, task: { ...TASK, status: 'failed' } });
  assert.ok(failed.findings.every((finding) => finding.protected));
});

test('analysis approval and absent authority cannot apply even a LOW exact plan', async (t) => {
  const relative = `${OWNED}/preview.html`;
  const root = await fixture(t, { [relative]: 'keep until authorized' });
  const prepared = await prepare(root, [relative]);
  for (const approval of [undefined, { source: 'conversation', authority: 'analysis', plan_id: prepared.plan.plan_id }]) {
    const receipt = await applyCleanupPlan({ ...prepared, approval });
    assert.equal(receipt.status, 'blocked');
    assert.ok(receipt.errors.some((error) => error.code === 'MUTATION_AUTHORITY_REQUIRED'));
    assert.equal(await present(root, relative), true);
  }
});

test('task policy is exact in root, task, path and action', async (t) => {
  const a = `${OWNED}/a.html`, b = `${OWNED}/b.html`;
  const root = await fixture(t, { [a]: 'A', [b]: 'B' });
  const prepared = await prepare(root, [a, b]);
  const receipt = await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [a]) });
  assert.equal(receipt.status, 'blocked');
  assert.equal(await present(root, a), true); assert.equal(await present(root, b), true);
  const quarantine = await prepare(root, [a], { actions: [{ path: a, action: 'quarantine' }] });
  const actionMismatch = await applyCleanupPlan({ ...quarantine, policy: policy(quarantine.analysis, [a]) });
  assert.equal(actionMismatch.status, 'blocked');
  const wrongTask = policy(prepared.analysis, [a, b], { task_id: 'different-task' });
  assert.equal((await applyCleanupPlan({ ...prepared, policy: wrongTask })).status, 'blocked');
});

test('file changes after approval invalidate the exact plan before removal', async (t) => {
  const relative = `${OWNED}/preview.html`;
  const root = await fixture(t, { [relative]: 'original' });
  const prepared = await prepare(root, [relative]);
  const approval = mutation(prepared.plan);
  await put(root, relative, 'edited after approval');
  const receipt = await applyCleanupPlan({ ...prepared, approval });
  assert.equal(receipt.status, 'blocked');
  assert.ok(receipt.errors.some((error) => error.code === 'STALE_PLAN'));
  assert.equal(await readFile(path.join(root, relative), 'utf8'), 'edited after approval');
});

test('new references invalidate approval even when candidate content is unchanged', async (t) => {
  const relative = `${OWNED}/preview.html`;
  const root = await fixture(t, { [relative]: 'original', 'src/view.js': 'export const label = "view";' });
  const prepared = await prepare(root, [relative], { reference_scope: ['src'] });
  await put(root, 'src/view.js', `export const preview = "${relative}";`);
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan) });
  assert.equal(receipt.status, 'blocked');
  assert.ok(receipt.errors.some((error) => error.code === 'STALE_PLAN'));
  assert.equal(await present(root, relative), true);
});

test('new directory contents are never included by a previously approved discovery scope', async (t) => {
  const a = `${OWNED}/a.html`, b = `${OWNED}/new.html`;
  const root = await fixture(t, { [a]: 'A' });
  const prepared = await prepare(root, [a], { scope: [OWNED] });
  await put(root, b, 'new outside exact approved list');
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan) });
  assert.equal(receipt.status, 'blocked');
  assert.equal(await present(root, a), true); assert.equal(await present(root, b), true);
  assert.throws(() => freezeCleanupPlan(prepared.analysis, { actions: [{ path: OWNED, action: 'delete' }] }), /ACTION_OUTSIDE_ANALYSIS/u);
});

test('ownership and producer changes invalidate plans instead of weakening risk', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'A' });
  const prepared = await prepare(root, [relative]);
  const changedEvidence = evidenceFor([relative], { [relative]: { producer_status: 'active', active: true } });
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan), observe: async () => ({ task: TASK, evidence: changedEvidence }) });
  assert.equal(receipt.status, 'blocked');
  assert.equal(await present(root, relative), true);
});

test('a different root and tampered scope never reuse exact plan approval', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'A' });
  const other = await fixture(t, { [relative]: 'other' });
  const prepared = await prepare(root, [relative]);
  const approval = mutation(prepared.plan);
  const wrongRoot = await applyCleanupPlan({ ...prepared, root: other, approval });
  assert.equal(wrongRoot.status, 'blocked');
  assert.ok(wrongRoot.errors.some((error) => error.code === 'ROOT_SCOPE_CHANGED'));
  const plan = structuredClone(prepared.plan); plan.scope.push('unapproved');
  const changedScope = await applyCleanupPlan({ ...prepared, plan, approval });
  assert.equal(changedScope.status, 'blocked');
  assert.ok(changedScope.errors.some((error) => error.code === 'PLAN_IDENTITY_CHANGED'));
  assert.equal(await present(root, relative), true); assert.equal(await present(other, relative), true);
});

test('traversal and globs fail closed before reads or writes', async (t) => {
  const root = await fixture(t, { [`${OWNED}/a.html`]: 'A' });
  for (const scope of ['../outside', '/absolute', `${OWNED}/*.html`, `${OWNED}/../a.html`, `${OWNED}\\a.html`]) {
    await assert.rejects(scanCleanup({ root, scope: [scope] }), /UNSAFE_PATH/u);
  }
});

test('outside symlink targets and nested Git boundaries are blocked without mutation', async (t) => {
  const root = await fixture(t, { [`${OWNED}/a.html`]: 'A', 'nested/.git': 'gitdir: ../somewhere', 'nested/output.html': 'nested data' });
  const outside = await fixture(t, { 'outside.html': 'preserve external' });
  await symlink(outside, path.join(root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  const analysis = await scanCleanup({ root, scope: ['linked', 'nested'] });
  assert.ok(analysis.blocked.some((item) => item.code === 'SYMLINK_BOUNDARY'));
  assert.ok(analysis.blocked.some((item) => item.code === 'NESTED_REPOSITORY'));
  assert.equal(analysis.findings.length, 0);
  assert.equal(await readFile(path.join(outside, 'outside.html'), 'utf8'), 'preserve external');
  assert.equal(await present(root, 'nested/output.html'), true);
});

test('submodule boundaries and modified tracked content are retained', async (t) => {
  const { root } = await gitFixture(t, { 'tracked/output.html': 'committed' });
  await put(root, 'tracked/output.html', 'modified');
  await put(root, '.gitmodules', '[submodule "module"]\n path = module\n url = fixture-only\n');
  await put(root, 'module/.git', 'gitdir: ../.git/modules/module');
  await put(root, 'module/output.html', 'module data');
  const analysis = await scanCleanup({ root, scope: ['tracked', 'module'], evidence: evidenceFor(['tracked/output.html']), task: TASK });
  assert.equal(analysis.findings.find((f) => f.path === 'tracked/output.html').risk, 'BLOCKED');
  assert.ok(analysis.blocked.some((item) => item.code === 'NESTED_REPOSITORY'));
  const plan = freezeCleanupPlan(analysis, { actions: [{ path: 'tracked/output.html', action: 'delete' }] });
  assert.equal((await applyCleanupPlan({ root, plan, approval: mutation(plan), task: TASK, evidence: analysis.evidence })).status, 'blocked');
  assert.equal(await readFile(path.join(root, 'tracked/output.html'), 'utf8'), 'modified');
});

test('quarantine preserves recoverable bytes and restore requires separate authority', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'recover this exact content' });
  const prepared = await prepare(root, [relative], { actions: [{ path: relative, action: 'quarantine' }] });
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan), verify: actualVerification([relative]) });
  assert.equal(receipt.status, 'verified');
  assert.equal(receipt.metrics.reclaimed_bytes, 0);
  assert.equal(receipt.metrics.quarantine_bytes, Buffer.byteLength('recover this exact content'));
  assert.equal(await readFile(path.join(root, receipt.actions[0].destination), 'utf8'), 'recover this exact content');
  await assert.rejects(restoreCleanup({ root, receipt, approval: mutation(prepared.plan) }), /RESTORE_AUTHORITY_REQUIRED/u);
  const approval = approveCleanupRestore(receipt, { source: 'conversation', decision: 'approve', authority: 'restore' });
  const restored = await restoreCleanup({ root, receipt, approval });
  assert.equal(restored.status, 'restored');
  assert.deepEqual(restored.restored, [relative]);
  assert.equal(await readFile(path.join(root, relative), 'utf8'), 'recover this exact content');
  assert.equal(await present(root, receipt.actions[0].destination), false);
});

test('restore never overwrites an occupied destination and rejects tampered recovery bytes or receipts', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'original' });
  const prepared = await prepare(root, [relative], { actions: [{ path: relative, action: 'quarantine' }] });
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan) });
  const approval = approveCleanupRestore(receipt, { source: 'conversation', decision: 'approve', authority: 'restore' });
  await put(root, relative, 'new owner data');
  await assert.rejects(restoreCleanup({ root, receipt, approval }), /RESTORE_DESTINATION_OCCUPIED/u);
  assert.equal(await readFile(path.join(root, relative), 'utf8'), 'new owner data');
  await rm(path.join(root, relative));
  await put(root, receipt.actions[0].destination, 'tampered');
  await assert.rejects(restoreCleanup({ root, receipt, approval }), /RECOVERY_FINGERPRINT_CHANGED/u);
  const changed = structuredClone(receipt); changed.actions[0].path = `${OWNED}/other.html`;
  await assert.rejects(restoreCleanup({ root, receipt: changed, approval }), /RESTORE_AUTHORITY_REQUIRED/u);
  assert.equal(await present(root, relative), false);
});

test('partial apply records exact completed and retained state and permits coherent recovery', async (t) => {
  const a = `${OWNED}/a.html`, b = `${OWNED}/b.html`, c = `${OWNED}/c.html`;
  const root = await fixture(t, { [a]: 'A', [b]: 'B', [c]: 'C' });
  const prepared = await prepare(root, [a, b, c], { actions: [a, b, c].map((relative) => ({ path: relative, action: 'quarantine' })) });
  let observations = 0;
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan), observe: async () => {
    observations++;
    if (observations === 3) await put(root, b, 'changed during apply');
    return { task: TASK, evidence: prepared.evidence };
  } });
  assert.equal(receipt.status, 'partial');
  assert.deepEqual(receipt.actions.map((action) => action.status), ['quarantined', 'failed', 'retained']);
  assert.equal(receipt.metrics.quarantine_bytes, 1);
  assert.notEqual(receipt.verification.affected_checks, 'PASSED');
  assert.equal(await present(root, a), false);
  assert.equal(await readFile(path.join(root, b), 'utf8'), 'changed during apply');
  assert.equal(await readFile(path.join(root, c), 'utf8'), 'C');
  const approval = approveCleanupRestore(receipt, { source: 'conversation', decision: 'approve', authority: 'restore' });
  assert.equal((await restoreCleanup({ root, receipt, approval })).status, 'restored');
  assert.equal(await readFile(path.join(root, a), 'utf8'), 'A');
});

test('material Git changes between actions stop the remaining authorized files', async (t) => {
  const a = `${OWNED}/a.html`, b = `${OWNED}/b.html`;
  const { root } = await gitFixture(t, { '.gitignore': '.sdcorejs/tmp/\n', 'src/current.js': 'export const current = 1;' });
  await put(root, a, 'A'); await put(root, b, 'B');
  const prepared = await prepare(root, [a, b]);
  let observations = 0;
  const receipt = await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [a, b]), observe: async () => {
    observations++;
    if (observations === 3) await put(root, 'src/current.js', 'export const current = 2;');
    return { task: TASK, evidence: prepared.evidence };
  } });
  assert.equal(receipt.status, 'partial');
  assert.equal(await present(root, a), false);
  assert.equal(await present(root, b), true);
  assert.ok(receipt.errors.some((error) => /STALE|GIT_STATE/u.test(error.code)));
});

test('dynamic asset references, Angular copy configuration and public consumers stay conservative', async (t) => {
  const dynamic = 'assets/dynamic.png', angular = 'assets/copied.png', publicAsset = 'public/package.png';
  const root = await fixture(t, {
    [dynamic]: 'image A', [angular]: 'image B', [publicAsset]: 'image C',
    'src/lookup.js': 'export const asset = (name) => `assets/${name}.png`;',
    'angular.json': JSON.stringify({ projects: { fixture: { architect: { build: { options: { assets: [{ glob: '**/*', input: 'assets', output: '/assets' }] } } } } } }),
  });
  const evidence = evidenceFor([dynamic, angular, publicAsset]);
  const analysis = await scanCleanup({ root, scope: ['assets', 'public'], reference_scope: ['src', 'angular.json'], evidence, task: TASK });
  for (const relative of [dynamic, angular]) {
    const finding = analysis.findings.find((item) => item.path === relative);
    assert.equal(finding.risk, 'BLOCKED');
    assert.notEqual(finding.classification, 'unused-candidate');
    assert.ok(finding.unknowns.length);
  }
  assert.equal(analysis.findings.find((item) => item.path === publicAsset).protected, true);
  const plan = freezeCleanupPlan(analysis, { actions: [dynamic, angular, publicAsset].map((relative) => ({ path: relative, action: 'delete' })) });
  assert.equal((await applyCleanupPlan({ root, plan, evidence, task: TASK, approval: mutation(plan, { atomic_group: plan.plan_id }) })).status, 'blocked');
  for (const relative of [dynamic, angular, publicAsset]) assert.equal(await present(root, relative), true);
});

test('exact duplicates report byte equality while brand copies, mirrors and fixture copies retain intentional semantics', async (t) => {
  const exact = [`${OWNED}/one.html`, `${OWNED}/two.html`];
  const brands = ['assets/brands/alpha/logo.png', 'assets/brands/beta/logo.png'];
  const fixtures = ['test/fixtures/a.txt', 'test/fixtures/b.txt'];
  const mirrors = ['skills/example/SKILL.md', '.claude/skills/example/SKILL.md'];
  const files = Object.fromEntries([...exact, ...brands, ...fixtures, ...mirrors].map((relative) => [relative, 'same bytes']));
  Object.assign(files, { 'MIRROR_POLICY.md': 'fixture mirror ownership', 'scripts/sync-skills.mjs': '/* fixture generator marker */' });
  const root = await fixture(t, files);
  const analysis = await scanCleanup({ root, scope: [...exact, ...brands, ...fixtures, ...mirrors], evidence: evidenceFor(Object.keys(files)), task: TASK });
  const pair = (paths) => analysis.exact_duplicates.find((group) => group.paths.length === 2 && paths.every((relative) => group.paths.includes(relative)));
  assert.equal(pair(exact).classification, 'exact-review');
  assert.equal(pair(brands).classification, 'intentional');
  assert.equal(pair(fixtures).classification, 'intentional');
  assert.equal(pair(mirrors).classification, 'intentional');
  for (const relative of [...fixtures, mirrors[1]]) assert.equal(analysis.findings.find((finding) => finding.path === relative).protected, true);
  assert.equal(await present(root, exact[0]), true);
});

test('review F-01: consumer coverage blocks AVIF, unknown formats and semantic assets before quarantine', async (t) => {
  const files = ['assets/card.avif', 'assets/card.png', 'assets/card.custom', 'assets/catalog.json',
    'build/opaque.custom', `${OWNED}/consumer.avif`];
  const root = await fixture(t, { ...Object.fromEntries(files.map((file) => [file, 'synthetic generated asset bytes'])),
    'src/gallery.js': 'export const url = name => "/assets/" + name + ".avif";' });
  const incomplete = { complete: false, dynamic: false, globs: false, exports: false, external: false };
  const evidence = evidenceFor(files, Object.fromEntries(files.map((file) => [file, { reference_coverage: incomplete }])));
  const analysis = await scanCleanup({ root, scope: files, reference_scope: ['src'], evidence, task: TASK });
  for (const finding of analysis.findings) {
    assert.equal(finding.risk, 'BLOCKED', finding.path);
    assert.ok(finding.unknowns.some((item) => item.includes('consumer coverage')), finding.path);
  }
  const plan = freezeCleanupPlan(analysis, { actions: files.map((file) => ({ path: file, action: 'quarantine' })) });
  const result = await applyCleanupPlan({ root, plan, evidence, task: TASK, approval: mutation(plan) });
  assert.equal(result.status, 'blocked');
  for (const file of files) assert.equal(await present(root, file), true, file);
});

test('review F-01: complete consumer evidence permits unknown assets but concatenated lookup stays unknown', async (t) => {
  const file = 'assets/card.custom';
  const root = await fixture(t, { [file]: 'synthetic opaque output', 'src/gallery.js': 'export const rendered = false;' });
  const complete = { complete: true, dynamic: true, globs: true, exports: true, external: true };
  const evidence = evidenceFor([file], { [file]: { reference_coverage: complete } });
  const args = { root, scope: [file], reference_scope: ['src'], evidence, task: TASK };
  const covered = await scanCleanup(args);
  assert.equal(covered.findings[0].classification, 'unused-candidate');
  assert.equal(covered.findings[0].risk, 'MEDIUM');
  const plan = freezeCleanupPlan(covered, { actions: [{ path: file, action: 'quarantine' }] });
  const result = await applyCleanupPlan({ root, plan, evidence, task: TASK, approval: mutation(plan) });
  assert.equal(result.status, 'applied', JSON.stringify(result.errors));
  assert.equal(await present(root, file), false);
  await restoreCleanup({ root, receipt: result, approval: approveCleanupRestore(result, {
    source: 'conversation', decision: 'approve', authority: 'restore',
  }) });
  await put(root, 'src/gallery.js', 'export const url = name => "/assets/" + name + ".custom";');
  const dynamic = await scanCleanup(args);
  assert.equal(dynamic.findings[0].risk, 'BLOCKED');
  assert.ok(dynamic.findings[0].unknowns.length);
  assert.equal(await present(root, file), true);
});

test('valid ADRs, approved artifacts and superseded unique docs survive age and newer replacements', async (t) => {
  const adr = 'docs/adr/0001-valid.md', approved = '.sdcorejs/specs/old-spec.md', superseded = 'docs/superseded.md', draft = 'docs/abandoned.md';
  const root = await fixture(t, { [adr]: '# Decision\nStill defines a boundary.', [approved]: '# Approved spec', [superseded]: '# Previous document\nUnique compatibility history.', [draft]: '# Duplicate draft' });
  const evidence = evidenceFor([adr, approved, superseded, draft], {
    [superseded]: { doc_status: 'superseded', unique_information: true, durable_value: true, evidence: ['owner retained compatibility history'] },
    [draft]: { doc_status: 'abandoned-draft', unique_information: false, durable_value: false, evidence: ['owner confirmed replaced duplicate prose'] },
  });
  const analysis = await scanCleanup({ root, scope: [adr, approved, superseded, draft], evidence, task: TASK });
  for (const relative of [adr, approved, superseded]) assert.equal(analysis.findings.find((f) => f.path === relative).protected, true);
  const abandoned = analysis.findings.find((f) => f.path === draft);
  assert.equal(abandoned.classification, 'abandoned-draft');
  assert.equal(abandoned.protected, false);
  assert.notEqual(abandoned.risk, 'LOW');
  const plan = freezeCleanupPlan(analysis, { actions: [{ path: draft, action: 'delete' }] });
  assert.equal((await applyCleanupPlan({ root, plan, evidence, task: TASK, policy: policy(analysis, [draft]) })).status, 'blocked');
  for (const relative of [adr, approved, superseded, draft]) assert.equal(await present(root, relative), true);
});

test('near document duplication is a review finding and does not grant mutation authority', async (t) => {
  const root = await fixture(t, { 'docs/a.md': '# Design\nalpha beta gamma delta epsilon zeta eta theta iota kappa stable.', 'docs/b.md': '# Design\nalpha beta gamma delta epsilon zeta eta theta iota kappa stable update.' });
  const analysis = await scanCleanup({ root, scope: ['docs'], evidence: evidenceFor(['docs/a.md', 'docs/b.md']), task: TASK });
  assert.equal(analysis.near_duplicates.length, 1);
  assert.equal(analysis.near_duplicates[0].classification, 'near-review');
  assert.ok(analysis.findings.every((finding) => finding.protected));
  assert.equal(await present(root, 'docs/a.md'), true); assert.equal(await present(root, 'docs/b.md'), true);
});

test('state capture binds both file content and exact observed ownership', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'A' });
  const evidence = evidenceFor([relative]);
  const initial = await captureCleanupState({ root, scope: [relative], evidence, task: TASK });
  const repeated = await captureCleanupState({ root, scope: [relative], evidence, task: TASK });
  assert.equal(repeated.fingerprint, initial.fingerprint);
  const changed = await captureCleanupState({ root, scope: [relative], evidence: evidenceFor([relative], { [relative]: { owner: 'another-producer' } }), task: TASK });
  assert.notEqual(changed.fingerprint, initial.fingerprint);
});

test('an active cleanup writer blocks apply without removing its lock or user files', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'A' });
  const prepared = await prepare(root, [relative]);
  const lock = await holdFixtureWriter(t, root, 'another approved cleanup operation', prepared.plan);
  const lockedBytes = await readFile(path.join(root, lock));
  const receipt = await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [relative]) });
  assert.equal(receipt.status, 'blocked');
  assert.ok(receipt.errors.some((error) => error.code === (process.platform === 'win32' ? 'CLEANUP_WRITER_ACTIVE' : 'WRITER_ALREADY_ACTIVE')));
  assert.deepEqual(await readFile(path.join(root, lock)), lockedBytes);
  assert.equal(await present(root, relative), true);
});

test('a link replacement after approval blocks cleanup and leaves the outside target intact', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'A' });
  const outside = await fixture(t, { 'a.html': 'outside recovery data' });
  const prepared = await prepare(root, [relative]);
  const taskDirectory = path.resolve(root, OWNED);
  assert.ok(taskDirectory.startsWith(`${root}${path.sep}`));
  assert.equal(await realpath(taskDirectory), taskDirectory);
  await rm(taskDirectory, { recursive: true });
  await symlink(outside, path.join(root, OWNED), process.platform === 'win32' ? 'junction' : 'dir');
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan) });
  assert.equal(receipt.status, 'blocked');
  assert.equal(await readFile(path.join(outside, 'a.html'), 'utf8'), 'outside recovery data');
});

test('a linked quarantine directory never lets a recovery copy escape the root', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'A' });
  const outside = await fixture(t, {});
  const prepared = await prepare(root, [relative], { actions: [{ path: relative, action: 'quarantine' }] });
  await mkdir(path.dirname(path.join(root, CLEANUP_RUNTIME_ROOT)), { recursive: true });
  await symlink(outside, path.join(root, CLEANUP_RUNTIME_ROOT), process.platform === 'win32' ? 'junction' : 'dir');
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan) });
  assert.equal(receipt.status, 'blocked');
  assert.ok(receipt.errors.some((error) => ['SYMLINK_BOUNDARY', 'REPARSE_POINT_BOUNDARY'].includes(error.code)), JSON.stringify(receipt.errors));
  assert.deepEqual(await readdir(outside), []);
  assert.equal(await present(root, relative), true);
});

test('new directory files appearing during apply stop the next action and remain outside the approved list', async (t) => {
  const a = `${OWNED}/a.html`, b = `${OWNED}/b.html`, newFile = `${OWNED}/new.html`;
  const root = await fixture(t, { [a]: 'A', [b]: 'B' });
  const prepared = await prepare(root, [a, b], { scope: [OWNED] });
  let observations = 0;
  const receipt = await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [a, b]), observe: async () => {
    observations++;
    if (observations === 3) await put(root, newFile, 'unexpected independently owned data');
    return { task: TASK, evidence: prepared.evidence };
  } });
  assert.equal(receipt.status, 'partial');
  assert.equal(await present(root, a), false);
  assert.equal(await present(root, b), true); assert.equal(await present(root, newFile), true);
  assert.equal(receipt.actions.some((item) => item.path === newFile), false);
});

for (const relative of ['assets/typed.avif', 'assets/abandoned-typed.md']) {
  test(`review F-06: every coverage flag requires literal true before mutation ${relative}`, async (t) => {
    const contents = 'Fixed synthetic artifact bytes.';
    const root = await fixture(t, { [relative]: contents, 'src/plain.js': 'export const active = false;' });
    const complete = { complete: true, dynamic: true, globs: true, exports: true, external: true };
    const discharged = { doc_status: 'abandoned-draft', unique_information: false, durable_value: false };
    const invalid = ['false', 'true', 1, -1, {}, [], [true], { value: true }, null, false, 0, '', undefined];
    for (const flag of Object.keys(complete)) for (const value of invalid) {
      const coverage = { ...complete, [flag]: value };
      const evidence = evidenceFor([relative], { [relative]: { ...discharged, reference_coverage: coverage } });
      const analysis = await scanCleanup({ root, scope: [relative], reference_scope: ['src'], evidence, task: TASK });
      const plan = freezeCleanupPlan(analysis, { actions: [{ path: relative, action: 'quarantine' }] });
      const receipt = await applyCleanupPlan({ root, plan, approval: mutation(plan) });
      if (!(await present(root, relative))) {
        assert.equal((await restoreCleanup({ root, receipt, approval: approveCleanupRestore(receipt, {
          source: 'conversation', decision: 'approve', authority: 'restore',
        }) })).status, 'restored');
      }
      const detail = JSON.stringify({ relative, flag, value });
      assert.equal(receipt.status, 'blocked', detail);
      assert.equal(analysis.findings[0].risk, 'BLOCKED', detail);
      assert.equal(analysis.findings[0].certainty, 'unknown', detail);
      assert.ok(analysis.findings[0].unknowns.some(item => item.includes('consumer coverage')), detail);
      assert.equal(await readFile(path.join(root, relative), 'utf8'), contents, detail);
    }
  });
}

test('review F-06: coverage containers and non-data flags fail closed at the helper boundary', async (t) => {
  const relative = 'assets/container.avif';
  const root = await fixture(t, { [relative]: 'Fixed synthetic artifact', 'src/plain.js': 'export const active = false;' });
  const complete = { complete: true, dynamic: true, globs: true, exports: true, external: true };
  const accessor = { ...complete };
  Object.defineProperty(accessor, 'external', { enumerable: true, get() { return true; } });
  const inherited = Object.create(complete);
  const exotic = Object.assign(new Date(0), complete);
  for (const coverage of ['true', 1, null, undefined, [], Object.assign([], complete), inherited, exotic, accessor]) {
    const analysis = await scanCleanup({ root, scope: [relative], reference_scope: ['src'], task: TASK,
      evidence: evidenceFor([relative], { [relative]: { reference_coverage: coverage } }) });
    assert.equal(analysis.findings[0].risk, 'BLOCKED');
    assert.equal(analysis.findings[0].certainty, 'unknown');
  }
  assert.equal(await present(root, relative), true);
});

test('review F-06: public CLI JSON analyze plan and apply retain malformed coverage', async (t) => {
  const files = ['assets/cli-typed.avif', 'assets/cli-abandoned.md'];
  const contents = 'Fixed CLI fixture bytes.';
  const root = await fixture(t, { ...Object.fromEntries(files.map(relative => [relative, contents])),
    'src/plain.js': 'export const active = false;' });
  const complete = { complete: true, dynamic: true, globs: true, exports: true, external: true };
  const inputPath = path.join(root, 'input.json');
  for (const flag of Object.keys(complete)) for (const value of ['false', 1, {}, null, undefined]) {
    const evidence = evidenceFor(files, Object.fromEntries(files.map(relative => [relative, {
      doc_status: 'abandoned-draft', unique_information: false, durable_value: false,
      reference_coverage: { ...complete, [flag]: value },
    }])));
    const input = { evidence, task: TASK, actions: files.map(relative => ({ path: relative, action: 'quarantine' })) };
    await writeFile(inputPath, JSON.stringify(input));
    const options = ['--root', root, '--scope', 'assets', '--reference-scope', 'src', '--input', inputPath];
    const analyzed = await cli(['analyze', ...options]);
    assert.equal(analyzed.code, 0);
    for (const finding of analyzed.result.findings) {
      assert.equal(finding.risk, 'BLOCKED', JSON.stringify({ flag, value, path: finding.path }));
      assert.equal(finding.certainty, 'unknown');
    }
    const planned = await cli(['plan', ...options]);
    assert.equal(planned.code, 0);
    for (const action of planned.result.actions) assert.equal(action.risk, 'BLOCKED');
    await writeFile(inputPath, JSON.stringify({ plan: planned.result, approval: mutation(planned.result) }));
    const applied = await cli(['apply', '--root', root, '--input', inputPath]);
    assert.equal(applied.code, 1);
    assert.equal(applied.result.status, 'blocked');
    for (const relative of files) assert.equal(await readFile(path.join(root, relative), 'utf8'), contents);
  }
});

test('review F-06: literal true coverage preserves CLI round trips and adjacent boolean retention', async (t) => {
  const files = ['assets/true.avif', 'assets/true-draft.md'];
  const root = await fixture(t, { ...Object.fromEntries(files.map(relative => [relative, 'Fixed eligible fixture bytes'])),
    'src/plain.js': 'export const active = false;' });
  const complete = { complete: true, dynamic: true, globs: true, exports: true, external: true };
  const evidence = evidenceFor(files, Object.fromEntries(files.map(relative => [relative, {
    doc_status: 'abandoned-draft', unique_information: false, durable_value: false, reference_coverage: complete,
  }])));
  const inputPath = path.join(root, 'input.json');
  await writeFile(inputPath, JSON.stringify({ evidence, task: TASK,
    actions: files.map(relative => ({ path: relative, action: 'quarantine' })) }));
  const options = ['--root', root, '--scope', 'assets', '--reference-scope', 'src', '--input', inputPath];
  const analyzed = await cli(['analyze', ...options]);
  assert.equal(analyzed.code, 0);
  for (const finding of analyzed.result.findings) assert.equal(finding.risk, 'MEDIUM');
  const planned = await cli(['plan', ...options]);
  assert.equal(planned.code, 0);
  await writeFile(inputPath, JSON.stringify({ plan: planned.result, approval: mutation(planned.result) }));
  const applied = await cli(['apply', '--root', root, '--input', inputPath]);
  assert.equal(applied.code, 0);
  assert.equal(applied.result.status, 'applied');
  for (const relative of files) assert.equal(await present(root, relative), false);
  await writeFile(inputPath, JSON.stringify({ receipt: applied.result, approval: approveCleanupRestore(applied.result, {
    source: 'conversation', decision: 'approve', authority: 'restore',
  }) }));
  const restored = await cli(['restore', '--root', root, '--input', inputPath]);
  assert.equal(restored.code, 0);
  assert.equal(restored.result.status, 'restored');
  for (const relative of files) assert.equal(await present(root, relative), true);
  for (const flag of ['unique_information', 'durable_value', 'needed_for_evidence']) {
    const docs = await scanCleanup({ root, scope: [files[1]], reference_scope: ['src'], task: TASK,
      evidence: evidenceFor([files[1]], { [files[1]]: { ...evidence[files[1]], [flag]: 'false' } }) });
    assert.equal(docs.findings[0].protected, true, flag);
  }
  for (const flag of ['active', 'immutable', 'approved', 'historical', 'intentional']) {
    const retained = await scanCleanup({ root, scope: [files[0]], reference_scope: ['src'], task: TASK,
      evidence: evidenceFor([files[0]], { [files[0]]: { ...evidence[files[0]], [flag]: 'false' } }) });
    assert.ok(retained.findings[0].protected || retained.findings[0].risk === 'BLOCKED', flag);
  }
});

for (const relative of ['assets/credits.md', 'docs/superseded.md', `${OWNED}/retained.MD`]) {
  test(`review F-05: consumer evidence cannot discharge retained Markdown ${relative}`, async (t) => {
    const contents = '# Retained document\nUnique attribution and compatibility history.';
    const root = await fixture(t, { [relative]: contents, 'src/plain.js': 'export const active = false;' });
    const complete = { complete: true, dynamic: true, globs: true, exports: true, external: true };
    const states = [
      { doc_status: 'superseded', unique_information: true, durable_value: true },
      { doc_status: 'abandoned-draft', unique_information: true, durable_value: false },
      { doc_status: 'abandoned-draft', unique_information: false, durable_value: true },
      { doc_status: 'abandoned-draft', unique_information: true, durable_value: true },
      { doc_status: 'abandoned-draft', unique_information: false },
      { doc_status: 'abandoned-draft', durable_value: false },
      { doc_status: 'abandoned-draft', unique_information: null, durable_value: false },
      { doc_status: 'superseded', unique_information: false, durable_value: false },
      { unique_information: false, durable_value: false },
    ];
    for (const state of states) {
      for (const coverage of [complete, { ...complete, complete: false }, null]) {
        const evidence = evidenceFor([relative], { [relative]: { ...state, reference_coverage: coverage } });
        const analysis = await scanCleanup({ root, scope: [relative], reference_scope: ['src'], evidence, task: TASK });
        const finding = analysis.findings[0];
        const detail = JSON.stringify({ relative, state, coverage });
        for (const action of ['quarantine', 'delete']) {
          const plan = freezeCleanupPlan(analysis, { actions: [{ path: relative, action }] });
          const receipt = await applyCleanupPlan({ root, plan, evidence, task: TASK, approval: mutation(plan) });
          if (action === 'quarantine' && !(await present(root, relative))) {
            const restored = await restoreCleanup({ root, receipt, approval: approveCleanupRestore(receipt, {
              source: 'conversation', decision: 'approve', authority: 'restore',
            }) });
            assert.equal(restored.status, 'restored', detail);
          }
          assert.equal(receipt.status, 'blocked', detail);
          assert.equal(await readFile(path.join(root, relative), 'utf8'), contents, detail);
        }
        assert.equal(finding.protected, true, detail);
        assert.equal(finding.risk, 'HIGH', detail);
      }
    }
  });
}

test('review F-05: discharged redundant drafts retain document identity and still require consumer coverage', async (t) => {
  const files = ['assets/abandoned-draft.md', 'docs/abandoned-draft.md'];
  const root = await fixture(t, { ...Object.fromEntries(files.map(relative => [relative, '# Owner-confirmed redundant draft'])),
    'src/plain.js': 'export const active = false;' });
  const complete = { complete: true, dynamic: true, globs: true, exports: true, external: true };
  const discharged = { doc_status: 'abandoned-draft', unique_information: false, durable_value: false };
  for (const relative of files) {
    const evidence = evidenceFor([relative], { [relative]: { ...discharged, reference_coverage: complete } });
    const args = { root, scope: [relative], reference_scope: ['src'], evidence, task: TASK };
    const analysis = await scanCleanup(args);
    assert.equal(analysis.findings[0].classification, 'abandoned-draft');
    assert.equal(analysis.findings[0].protected, false);
    assert.equal(analysis.findings[0].risk, 'MEDIUM');
    const plan = freezeCleanupPlan(analysis, { actions: [{ path: relative, action: 'quarantine' }] });
    const receipt = await applyCleanupPlan({ root, plan, evidence, task: TASK, approval: mutation(plan) });
    assert.equal(receipt.status, 'applied', JSON.stringify(receipt.errors));
    assert.equal(await present(root, relative), false);
    const restored = await restoreCleanup({ root, receipt, approval: approveCleanupRestore(receipt, {
      source: 'conversation', decision: 'approve', authority: 'restore',
    }) });
    assert.equal(restored.status, 'restored');
    assert.equal(await present(root, relative), true);
    for (const coverage of [null, { ...complete, complete: false }, { ...complete, external: false }]) {
      const uncovered = await scanCleanup({ ...args, evidence: evidenceFor([relative], {
        [relative]: { ...discharged, reference_coverage: coverage },
      }) });
      assert.equal(uncovered.findings[0].classification, 'abandoned-draft');
      assert.equal(uncovered.findings[0].risk, 'BLOCKED');
      assert.ok(uncovered.findings[0].unknowns.some(item => item.includes('consumer coverage')));
      const deniedPlan = freezeCleanupPlan(uncovered, { actions: [{ path: relative, action: 'quarantine' }] });
      assert.equal((await applyCleanupPlan({ root, plan: deniedPlan, approval: mutation(deniedPlan) })).status, 'blocked');
      assert.equal(await present(root, relative), true);
    }
  }
  await put(root, 'src/plain.js', 'export const url = name => "/assets/" + name + ".md";');
  const dynamic = await scanCleanup({ root, scope: files, reference_scope: ['src'], task: TASK,
    evidence: evidenceFor(files, Object.fromEntries(files.map(relative => [relative, { ...discharged, reference_coverage: complete }]))) });
  for (const finding of dynamic.findings) assert.equal(finding.risk, 'BLOCKED');
  const denied = freezeCleanupPlan(dynamic, { actions: files.map(relative => ({ path: relative, action: 'quarantine' })) });
  assert.equal((await applyCleanupPlan({ root, plan: denied, approval: mutation(denied) })).status, 'blocked');
  for (const relative of files) assert.equal(await present(root, relative), true);
});

test('explicit archive keeps durable bytes at an exact destination and restores without overwrite', async (t) => {
  const relative = 'docs/abandoned-draft.md', destination = 'docs/archive/abandoned-draft.md';
  const root = await fixture(t, { [relative]: '# Owner confirmed duplicate draft' });
  const evidence = evidenceFor([relative], { [relative]: { doc_status: 'abandoned-draft', unique_information: false, durable_value: false, evidence: ['owner confirmed no unique information or historical need'] } });
  const prepared = await prepare(root, [relative], { evidence, actions: [{ path: relative, action: 'archive', destination }] });
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan), verify: actualVerification([relative], [destination]) });
  assert.equal(receipt.status, 'verified');
  assert.equal(receipt.actions[0].status, 'archived');
  assert.equal(receipt.actions[0].destination, destination);
  assert.equal(receipt.metrics.reclaimed_bytes, 0);
  assert.equal(receipt.metrics.quarantine_bytes, 0);
  assert.equal(receipt.metrics.archived_bytes, Buffer.byteLength('# Owner confirmed duplicate draft'));
  const approval = approveCleanupRestore(receipt, { source: 'conversation', decision: 'approve', authority: 'restore' });
  assert.equal((await restoreCleanup({ root, receipt, approval })).status, 'restored');
  assert.equal(await present(root, relative), true); assert.equal(await present(root, destination), false);
});

test('an occupied archive destination fails without removing either source or existing durable content', async (t) => {
  const relative = `${OWNED}/a.html`, destination = 'archive/a.html';
  const root = await fixture(t, { [relative]: 'source', [destination]: 'existing archived content' });
  const prepared = await prepare(root, [relative], { actions: [{ path: relative, action: 'archive', destination }] });
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan) });
  assert.equal(receipt.status, 'blocked');
  assert.equal(await readFile(path.join(root, relative), 'utf8'), 'source');
  assert.equal(await readFile(path.join(root, destination), 'utf8'), 'existing archived content');
});

test('failed affected checks retain recovery evidence and never report verified cleanup', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'recover if affected check fails' });
  const prepared = await prepare(root, [relative], { actions: [{ path: relative, action: 'quarantine' }] });
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan), verify: async () => {
    assert.equal(await present(root, relative), false);
    throw new Error('fixture affected verification failed');
  } });
  assert.equal(receipt.status, 'partial');
  assert.equal(receipt.verification.affected_checks, 'FAILED');
  assert.equal(receipt.actions[0].status, 'quarantined');
  assert.equal(await readFile(path.join(root, receipt.actions[0].destination), 'utf8'), 'recover if affected check fails');
});

test('empty verification evidence cannot claim a verified cleanup', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'A' });
  const prepared = await prepare(root, [relative]);
  const receipt = await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [relative]), verify: async () => {
    assert.equal(await present(root, relative), false);
    return { result: 'PASSED', checks: [] };
  } });
  assert.equal(receipt.status, 'partial');
  assert.equal(receipt.verification.affected_checks, 'FAILED');
  assert.ok(receipt.errors.some((error) => error.code === 'AFFECTED_VERIFICATION_INCOMPLETE'));
});

test('weak age, tmp names and grep absence never establish artifact ownership or delete authority', async (t) => {
  const names = ['old-tmp-preview.html', 'reports/ancient-output.json', 'assets/no-import.png'];
  const root = await fixture(t, Object.fromEntries(names.map((relative) => [relative, 'unique user content'])));
  const analysis = await scanCleanup({ root, scope: names, task: TASK });
  assert.ok(analysis.findings.every((finding) => finding.protected || finding.risk === 'BLOCKED'));
  await assertDestructivePlanBlocked(analysis, names.map((relative) => ({ path: relative, action: 'delete' })));
  for (const relative of names) assert.equal(await present(root, relative), true);
});

test('potentially sensitive artifacts and incomplete reference boundaries remain blocked', async (t) => {
  const asset = 'assets/a.png', secret = `${OWNED}/credentials.json`;
  const root = await fixture(t, { [asset]: 'asset', [secret]: '{"fixture":"redacted sensitive filename"}', 'src/current.js': 'export const current = 1;', 'src/.env': 'FIXTURE_ONLY=not-a-secret' });
  const evidence = evidenceFor([asset, secret], { [asset]: { reference_coverage: { complete: true, dynamic: true, globs: true, exports: true, external: true } } });
  const analysis = await scanCleanup({ root, scope: [asset, secret], reference_scope: ['src'], evidence, task: TASK });
  assert.equal(analysis.findings.find((finding) => finding.path === secret).risk, 'BLOCKED');
  assert.equal(analysis.findings.find((finding) => finding.path === asset).risk, 'BLOCKED');
  assert.notEqual(analysis.findings.find((finding) => finding.path === asset).classification, 'unused-candidate');
});

test('independent hard-linked aliases block mutation even for task-owned reproducible outputs', async (t) => {
  const relative = `${OWNED}/a.html`, alias = 'independent/a.html';
  const root = await fixture(t, { [relative]: 'independently referenced bytes' });
  await mkdir(path.dirname(path.join(root, alias)), { recursive: true });
  await link(path.join(root, relative), path.join(root, alias));
  const prepared = await prepare(root, [relative]);
  assert.equal(prepared.analysis.findings[0].risk, 'BLOCKED');
  assert.ok(prepared.analysis.findings[0].unknowns.some((unknown) => /hard.link/u.test(unknown)));
  assert.equal((await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan) })).status, 'blocked');
  assert.equal(await readFile(path.join(root, alias), 'utf8'), 'independently referenced bytes');
});

test('gitignored paths still require ownership, producer and evidence checks', async (t) => {
  const relative = `${OWNED}/a.html`;
  const { root } = await gitFixture(t, { '.gitignore': '.sdcorejs/tmp/\n' });
  await put(root, relative, 'user content ignored for distribution');
  const analysis = await scanCleanup({ root, scope: [relative], task: TASK });
  assert.notEqual(analysis.findings[0].risk, 'LOW');
  await assertDestructivePlanBlocked(analysis, [{ path: relative, action: 'delete' }], { policy: policy(analysis, [relative]) });
  assert.equal(await readFile(path.join(root, relative), 'utf8'), 'user content ignored for distribution');
});

test('modified tracked content cannot bypass protection by moving into a LOW task-local directory', async (t) => {
  const relative = `${OWNED}/a.html`;
  const { root } = await gitFixture(t, { [relative]: 'original tracked evidence' });
  await put(root, relative, 'modified tracked evidence');
  const prepared = await prepare(root, [relative]);
  assert.equal(prepared.analysis.findings[0].risk, 'BLOCKED');
  const receipt = await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [relative]) });
  assert.equal(receipt.status, 'blocked');
  assert.equal(await readFile(path.join(root, relative), 'utf8'), 'modified tracked evidence');
});

test('unrelated reproducible output needs bounded mutation approval and remains outside automatic task tail', async (t) => {
  const relative = `${OWNED}/other.html`;
  const root = await fixture(t, { [relative]: 'unrelated but owner-confirmed reproducible' });
  const evidence = evidenceFor([relative], { [relative]: { task_id: 'previous-task' } });
  const prepared = await prepare(root, [relative], { evidence });
  assert.equal(prepared.analysis.findings[0].risk, 'MEDIUM');
  const policyResult = await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [relative]) });
  assert.equal(policyResult.status, 'blocked');
  assert.equal(await present(root, relative), true);
  const approved = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan), verify: actualVerification([relative]) });
  assert.equal(approved.status, 'verified');
});

test('HIGH tracked content requires exact file approval or atomic group approval', async (t) => {
  const a = 'reports/a.json', b = 'reports/b.json';
  const { root } = await gitFixture(t, { [a]: '{"report":"A"}', [b]: '{"report":"B"}' });
  const prepared = await prepare(root, [a, b]);
  assert.ok(prepared.analysis.findings.every((finding) => finding.risk === 'HIGH'));
  const batch = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan) });
  assert.equal(batch.status, 'blocked');
  assert.equal(await present(root, a), true); assert.equal(await present(root, b), true);
  const approved = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan, { atomic_group: prepared.plan.plan_id }), verify: actualVerification([a, b]) });
  assert.equal(approved.status, 'verified');
  assertPhysicalReclaimMetrics(approved);
});

test('delete actions cannot silently hold a copy at an archive destination and report reclaimed bytes', async (t) => {
  const relative = `${OWNED}/a.html`, destination = 'archive/undeclared-copy.html';
  const root = await fixture(t, { [relative]: 'A' });
  const analysis = await scanCleanup({ root, scope: [relative], evidence: evidenceFor([relative]), task: TASK });
  assert.throws(() => freezeCleanupPlan(analysis, { actions: [{ path: relative, action: 'delete', destination }] }), /INVALID_(?:ACTION|DESTINATION|FROZEN_ACTION)|DELETE_DESTINATION/u);
  assert.equal(await present(root, relative), true);
  assert.equal(await present(root, destination), false);
});

test('an occupied restore destination prevents the whole recovery batch before any writes', async (t) => {
  const a = `${OWNED}/a.html`, b = `${OWNED}/b.html`;
  const root = await fixture(t, { [a]: 'A', [b]: 'B' });
  const prepared = await prepare(root, [a, b], { actions: [a, b].map((relative) => ({ path: relative, action: 'quarantine' })) });
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan) });
  assert.equal(receipt.status, 'applied');
  await put(root, b, 'new user data');
  const approval = approveCleanupRestore(receipt, { source: 'conversation', decision: 'approve', authority: 'restore' });
  await assert.rejects(restoreCleanup({ root, receipt, approval }), /RESTORE_DESTINATION_OCCUPIED/u);
  assert.equal(await present(root, a), false);
  assert.equal(await readFile(path.join(root, b), 'utf8'), 'new user data');
  for (const item of receipt.actions) assert.equal(await present(root, item.destination), true);
});

test('an unfinished durable-artifact phase blocks automatic LOW task-tail policy', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'A' });
  const prepared = await prepare(root, [relative], { task: { ...TASK, durable_finalized: false } });
  const receipt = await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [relative]) });
  assert.equal(receipt.status, 'blocked');
  assert.equal(await present(root, relative), true);
});

test('failed, cancelled and interrupted task evidence remains protected even when reproducible', async (t) => {
  const relative = `${OWNED}/diagnostic.log`;
  const root = await fixture(t, { [relative]: 'diagnostic needed for recovery' });
  for (const status of ['failed', 'cancelled', 'interrupted']) {
    const prepared = await prepare(root, [relative], { task: { ...TASK, status } });
    assert.equal(prepared.analysis.findings[0].protected, true);
    const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan) });
    assert.equal(receipt.status, 'blocked');
    assert.equal(await present(root, relative), true);
  }
});

test('current-task scope does not inspect or mutate unrelated sibling artifact directories', async (t) => {
  const relative = `${OWNED}/a.html`, unrelated = '.sdcorejs/tmp/another-task/user-work.html';
  const root = await fixture(t, { [relative]: 'A', [unrelated]: 'independent sibling artifact' });
  const prepared = await prepare(root, [relative], { scope: [OWNED] });
  assert.deepEqual(prepared.analysis.findings.map((finding) => finding.path), [relative]);
  const receipt = await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [relative]), verify: actualVerification([relative], [unrelated]) });
  assert.equal(receipt.status, 'verified');
  assert.equal(await readFile(path.join(root, unrelated), 'utf8'), 'independent sibling artifact');
});

test('restore respects the active cleanup writer lock without altering recovery or user files', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'recover exact A' });
  const prepared = await prepare(root, [relative], { actions: [{ path: relative, action: 'quarantine' }] });
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan) });
  const approval = approveCleanupRestore(receipt, { source: 'conversation', decision: 'approve', authority: 'restore' });
  const lock = await holdFixtureWriter(t, root, 'another active cleanup operation', prepared.plan);
  const lockedBytes = await readFile(path.join(root, lock));
  await assert.rejects(restoreCleanup({ root, receipt, approval }), process.platform === 'win32' ? /CLEANUP_WRITER_ACTIVE/u : /WRITER_ALREADY_ACTIVE/u);
  assert.equal(await present(root, relative), false);
  assert.equal(await readFile(path.join(root, receipt.actions[0].destination), 'utf8'), 'recover exact A');
  assert.deepEqual(await readFile(path.join(root, lock)), lockedBytes);
});

test('CLI defaults to read-only analyze when invoked with an exact root and scope', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'A' });
  await put(root, 'harness/analyze.json', JSON.stringify({ task: TASK, evidence: evidenceFor([relative]) }));
  const output = await cli(['--root', root, '--scope', OWNED, '--input', path.join(root, 'harness/analyze.json')]);
  assert.equal(output.code, 0, output.stderr);
  assert.deepEqual(output.result.writes, []);
  assert.deepEqual(output.result.findings.map((finding) => finding.path), [relative]);
  assert.equal(await readFile(path.join(root, relative), 'utf8'), 'A');
  assert.equal(await present(root, CLEANUP_RUNTIME_ROOT), false);
});

test('CLI exact JSON plan, approved apply and separately approved restore work only within fixture paths', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'CLI recoverable output' });
  const input = { task: TASK, evidence: evidenceFor([relative]), actions: [{ path: relative, action: 'quarantine' }] };
  await put(root, 'harness/plan-input.json', JSON.stringify(input));
  const planned = await cli(['plan', '--root', root, '--scope', OWNED, '--input', path.join(root, 'harness/plan-input.json')]);
  assert.equal(planned.code, 0, planned.stderr);
  assert.deepEqual(planned.result.actions.map((action) => ({ path: action.path, action: action.action })), [{ path: relative, action: 'quarantine' }]);
  await put(root, 'harness/apply-input.json', JSON.stringify({ plan: planned.result, approval: mutation(planned.result), task: TASK, evidence: input.evidence }));
  const applied = await cli(['apply', '--root', root, '--input', path.join(root, 'harness/apply-input.json')]);
  assert.equal(applied.code, 0, applied.stderr);
  assert.equal(applied.result.status, 'applied');
  assert.equal(applied.result.verification.affected_checks, 'NOT RUN');
  assert.equal(await present(root, relative), false);
  const restoreApproval = approveCleanupRestore(applied.result, { source: 'conversation', decision: 'approve', authority: 'restore' });
  await put(root, 'harness/restore-input.json', JSON.stringify({ receipt: applied.result, approval: restoreApproval }));
  const restored = await cli(['restore', '--root', root, '--input', path.join(root, 'harness/restore-input.json')]);
  assert.equal(restored.code, 0, restored.stderr);
  assert.equal(restored.result.status, 'restored');
  assert.equal(await readFile(path.join(root, relative), 'utf8'), 'CLI recoverable output');
});

test('CLI rejects missing mutation authority and task-tail policy while retaining fixture files', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'A' });
  const prepared = await prepare(root, [relative]);
  await put(root, 'harness/no-authority.json', JSON.stringify({ plan: prepared.plan, task: TASK, evidence: prepared.evidence }));
  const applied = await cli(['apply', '--root', root, '--input', path.join(root, 'harness/no-authority.json')]);
  assert.equal(applied.code, 1);
  assert.equal(applied.result.status, 'blocked');
  assert.ok(applied.result.errors.some((error) => error.code === 'MUTATION_AUTHORITY_REQUIRED'));
  const taskTail = await cli(['task-tail-cleanup', '--root', root, '--input', path.join(root, 'harness/no-authority.json')]);
  assert.equal(taskTail.code, 1);
  assert.match(taskTail.stderr, /TASK_POLICY_AUTHORITY_REQUIRED/u);
  assert.equal(await present(root, relative), true);
});

test('CLI task-tail removes only the exact current-task files in its approved LOW policy', async (t) => {
  const relative = `${OWNED}/a.html`, sibling = '.sdcorejs/tmp/other-task/keep.html';
  const root = await fixture(t, { [relative]: 'A', [sibling]: 'independent output' });
  const prepared = await prepare(root, [relative], { scope: [OWNED] });
  await put(root, 'harness/task-tail.json', JSON.stringify({ plan: prepared.plan, policy: policy(prepared.analysis, [relative]), task: TASK, evidence: prepared.evidence }));
  const applied = await cli(['task-tail-cleanup', '--root', root, '--input', path.join(root, 'harness/task-tail.json')]);
  assert.equal(applied.code, 0, applied.stderr);
  assert.equal(applied.result.status, 'applied');
  assert.equal(applied.result.verification.affected_checks, 'NOT RUN');
  assert.equal(await present(root, relative), false);
  assert.equal(await readFile(path.join(root, sibling), 'utf8'), 'independent output');
});

test('Git index submodule boundaries are retained even when their working directory has no .git marker', async (t) => {
  const { root, git } = await gitFixture(t, { 'README.md': 'isolated parent repository' });
  const { stdout } = await git('rev-parse', 'HEAD');
  await put(root, 'module/task-output.html', 'submodule-owned output');
  await git('update-index', '--add', '--cacheinfo', '160000', stdout.trim(), 'module');
  const analysis = await scanCleanup({ root, scope: ['module'], evidence: evidenceFor(['module/task-output.html']), task: TASK });
  assert.equal(analysis.findings.length, 0);
  assert.ok(analysis.blocked.some((item) => item.code === 'SUBMODULE_BOUNDARY'));
  assert.equal(await readFile(path.join(root, 'module/task-output.html'), 'utf8'), 'submodule-owned output');
});

test('a live producer process blocks cleanup despite a finished producer declaration', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'active producer output' });
  const evidence = evidenceFor([relative], { [relative]: { producer_pid: process.pid } });
  const prepared = await prepare(root, [relative], { evidence });
  assert.equal(prepared.analysis.findings[0].risk, 'BLOCKED');
  assert.ok(prepared.analysis.findings[0].unknowns.some((unknown) => /producer process/u.test(unknown)));
  assert.equal((await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [relative]) })).status, 'blocked');
  assert.equal(await present(root, relative), true);
});

test('approved artifact metadata keeps durable history protected even when copied under a tmp path', async (t) => {
  const relative = `${OWNED}/approved-plan.md`;
  const root = await fixture(t, { [relative]: '---\nartifact_kind: plan\napproval_hash: sha256:v1:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n---\n# Approved immutable plan\nRetain execution decisions.\n' });
  const prepared = await prepare(root, [relative]);
  assert.equal(prepared.analysis.findings[0].protected, true);
  assert.equal(prepared.analysis.findings[0].classification, 'historical');
  assert.equal((await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [relative]) })).status, 'blocked');
  assert.equal(await present(root, relative), true);
});

test('malformed affected verification commands cannot mark cleanup verified', async (t) => {
  const malformed = ['node pretend-check', 1, { executable: 'node', args: ['check'] }, [], ['node', 1], ['']];
  for (const actual_command of malformed) {
    const relative = `${OWNED}/a.html`;
    const root = await fixture(t, { [relative]: 'A' });
    const prepared = await prepare(root, [relative]);
    const receipt = await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [relative]), verify: async (context) => {
      const verified = await actualVerification([relative])(context);
      return { ...verified, checks: verified.checks.map((check) => ({ ...check, actual_command })) };
    } });
    assert.equal(receipt.status, 'partial', JSON.stringify(actual_command));
    assert.equal(receipt.verification.affected_checks, 'FAILED');
    assert.ok(receipt.errors.some((error) => error.code === 'AFFECTED_VERIFICATION_INCOMPLETE'));
    assert.equal(await present(root, relative), false);
  }
});

test('reserved runtime, session and dependency directories retain files under case aliases', async (t) => {
  const session = '.SDCOREJS/tasks/sessions/task/private.json';
  const runtime = '.SDCOREJS/TMP/cleanup-runtime/held.json';
  const dependency = 'NODE_MODULES/package/output.html';
  const root = await fixture(t, { [session]: 'session fixture must remain', [runtime]: 'runtime fixture must remain', [dependency]: 'dependency fixture must remain' });
  const analysis = await scanCleanup({ root, scope: ['.SDCOREJS/tasks/sessions', '.SDCOREJS/TMP/cleanup-runtime', 'NODE_MODULES'], evidence: evidenceFor([session, runtime, dependency]), task: TASK });
  assert.deepEqual(analysis.findings, []);
  assert.ok(analysis.blocked.some((entry) => entry.code === 'PROTECTED_BOUNDARY'));
  for (const relative of [session, runtime, dependency]) assert.equal(await present(root, relative), true);
  assert.deepEqual(analysis.writes, []);
});

test('two exact archives inside an approved discovery scope complete with coherent held-space metrics', async (t) => {
  const a = 'work/a.html', b = 'work/b.html';
  const archiveA = 'work/archive/a.html', archiveB = 'work/archive/b.html';
  const root = await fixture(t, { [a]: 'archive A', [b]: 'archive B' });
  await mkdir(path.join(root, 'work/archive'));
  const prepared = await prepare(root, [a, b], { scope: ['work'], actions: [{ path: a, action: 'archive', destination: archiveA }, { path: b, action: 'archive', destination: archiveB }] });
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan), verify: actualVerification([a, b], [archiveA, archiveB]) });
  assert.equal(receipt.status, 'verified');
  assert.deepEqual(receipt.actions.map((action) => action.status), ['archived', 'archived']);
  assert.equal(receipt.metrics.removed_active_bytes, Buffer.byteLength('archive Aarchive B'));
  assert.equal(receipt.metrics.archived_bytes, receipt.metrics.removed_active_bytes);
  assert.equal(receipt.metrics.quarantine_bytes, 0);
  assert.equal(receipt.metrics.reclaimed_bytes, 0);
  assert.equal(await readFile(path.join(root, archiveA), 'utf8'), 'archive A');
  assert.equal(await readFile(path.join(root, archiveB), 'utf8'), 'archive B');
  const approval = approveCleanupRestore(receipt, { source: 'conversation', decision: 'approve', authority: 'restore' });
  assert.equal((await restoreCleanup({ root, receipt, approval })).status, 'restored');
  assert.equal(await present(root, archiveA), false); assert.equal(await present(root, archiveB), false);
  assert.equal(await readFile(path.join(root, a), 'utf8'), 'archive A');
  assert.equal(await readFile(path.join(root, b), 'utf8'), 'archive B');
});

test('sensitive filenames and decodable log or binary content stay blocked without exposing text', async (t) => {
  const paths = [`${OWNED}/service-account.pem`, `${OWNED}/credential.bin`, `${OWNED}/diagnostic.log`, `${OWNED}/output.bin`];
  const synthetic = 'fixture-sensitive-marker-no-live-credentials';
  const root = await fixture(t, {
    [paths[0]]: 'service-account-fixture-content-marker',
    [paths[1]]: Buffer.from('credential-fixture-content-marker\0'),
    [paths[2]]: `token = ${synthetic}\n`,
    [paths[3]]: `password = ${synthetic}\n`,
  });
  const analysis = await scanCleanup({ root, scope: paths, evidence: evidenceFor(paths), task: TASK });
  assert.equal(analysis.findings.length, paths.length);
  assert.ok(analysis.findings.every((finding) => finding.risk === 'BLOCKED'));
  assert.ok(analysis.state.inventory.every((file) => file.sensitive === true && !Object.hasOwn(file, 'text')));
  assert.equal(JSON.stringify(analysis).includes(synthetic), false);
  assert.equal(JSON.stringify(analysis).includes('service-account-fixture-content-marker'), false);
  assert.equal(JSON.stringify(analysis).includes('credential-fixture-content-marker'), false);
  await assertDestructivePlanBlocked(analysis, paths.map((relative) => ({ path: relative, action: 'delete' })));
  for (const relative of paths) assert.equal(await present(root, relative), true);
});

test('approval-root JSON records and copied approved JSON metadata preserve immutable history', async (t) => {
  const approval = '.sdcorejs/approvals/fixture-plan-approval.json';
  const copied = `${OWNED}/copied-approved.json`;
  const approvalHash = `sha256:v1:${'a'.repeat(64)}`;
  const files = {
    [approval]: JSON.stringify({ artifact_kind: 'approval', decision: 'approve', approval_hash: approvalHash, requirement_id: 'fixture-cleanup' }),
    [copied]: JSON.stringify({ metadata: { approval_hash: approvalHash, artifact_kind: 'plan' }, content: 'immutable approved fixture content' }),
  };
  const root = await fixture(t, files);
  const analysis = await scanCleanup({ root, scope: [approval, copied], evidence: evidenceFor([approval, copied]), task: TASK });
  assert.equal(analysis.findings.length, 2);
  for (const finding of analysis.findings) {
    assert.equal(finding.protected, true, finding.path);
    assert.equal(finding.classification, 'historical');
    assert.notEqual(finding.risk, 'LOW');
  }
  await assertDestructivePlanBlocked(analysis, [approval, copied].map((relative) => ({ path: relative, action: 'delete' })));
  for (const [relative, original] of Object.entries(files)) assert.equal(await readFile(path.join(root, relative), 'utf8'), original);
});

if (process.platform === 'win32') test('Windows sparse deletion reports zero allocated reclaim while removing the full logical size', async (t) => {
  const relative = `${OWNED}/sparse.bin`, logicalBytes = 4 * 1024 * 1024;
  const root = await fixture(t);
  const target = path.join(root, relative);
  await mkdir(path.dirname(target), { recursive: true });
  const handle = await open(target, 'wx');
  await handle.truncate(logicalBytes); await handle.close();
  await exec('fsutil', ['sparse', 'setflag', target], { windowsHide: true });
  await exec('fsutil', ['sparse', 'setrange', target, '0', String(logicalBytes)], { windowsHide: true });
  const { stdout: ranges } = await exec('fsutil', ['sparse', 'queryrange', target], { windowsHide: true });
  assert.equal(ranges.trim(), '', 'fixture must have no allocated sparse ranges');
  assert.equal((await lstat(target)).size, logicalBytes);
  const prepared = await prepare(root, [relative]);
  const receipt = await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [relative]), verify: actualVerification([relative]) });
  assert.equal(receipt.status, 'verified');
  assert.equal(receipt.metrics.removed_active_bytes, logicalBytes);
  assertPhysicalReclaimMetrics(receipt);
  assert.equal(receipt.actions[0].reclaimed_bytes, 0);
  assert.equal(receipt.metrics.reclaimed_bytes, 0);
  assert.equal(await present(root, relative), false);
});

test('ownership and reproducibility declarations without source evidence remain BLOCKED', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'A' });
  for (const evidence of [undefined, [], [''], [null, 0, {}]]) {
    const prepared = await prepare(root, [relative], { evidence: evidenceFor([relative], { [relative]: { evidence } }) });
    assert.equal(prepared.analysis.findings[0].risk, 'BLOCKED');
    assert.ok(prepared.analysis.findings[0].unknowns.some((unknown) => /producer evidence is missing/u.test(unknown)));
    assert.equal((await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [relative]) })).status, 'blocked');
    assert.equal(await present(root, relative), true);
  }
});

test('unresolved and unread reference evidence blocks reproducible non-asset cleanup', async (t) => {
  const relative = `${OWNED}/a.html`;
  const root = await fixture(t, { [relative]: 'A', 'src/current.js': 'export const value = 1;', 'src/.env': 'FIXTURE_ONLY=not-a-secret' });
  for (const reference_scope of [['missing-references'], ['src']]) {
    const prepared = await prepare(root, [relative], { reference_scope });
    assert.equal(prepared.analysis.findings[0].risk, 'BLOCKED');
    assert.ok(prepared.analysis.findings[0].unknowns.some((unknown) => /unread or unresolved/u.test(unknown)));
    assert.equal((await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan) })).status, 'blocked');
    assert.equal(await present(root, relative), true);
  }
});

test('CLI task-tail policy cannot borrow ordinary mutation approval to bypass finalization or MEDIUM and HIGH scope', async (t) => {
  for (const scenario of ['not-finalized', 'medium', 'high']) {
    const relative = scenario === 'high' ? 'reports/a.json' : `${OWNED}/a.html`;
    const root = scenario === 'high' ? (await gitFixture(t, { [relative]: '{"report":"A"}' })).root : await fixture(t, { [relative]: 'A' });
    const task = scenario === 'not-finalized' ? { ...TASK, durable_finalized: false } : TASK;
    const evidence = evidenceFor([relative], { [relative]: scenario === 'medium' ? { task_id: 'unrelated-task' } : {} });
    const prepared = await prepare(root, [relative], { task, evidence });
    assert.equal(prepared.analysis.findings[0].risk, scenario === 'medium' ? 'MEDIUM' : scenario === 'high' ? 'HIGH' : 'LOW');
    const input = { plan: prepared.plan, policy: policy(prepared.analysis, [relative]), approval: mutation(prepared.plan), task, evidence };
    await put(root, 'harness/task-tail-with-ordinary-approval.json', JSON.stringify(input));
    const applied = await cli(['task-tail-cleanup', '--root', root, '--input', path.join(root, 'harness/task-tail-with-ordinary-approval.json')]);
    assert.equal(applied.code, 1, scenario);
    assert.equal(applied.result.status, 'blocked', scenario);
    assert.ok(applied.result.errors.some((error) => error.code === 'MUTATION_AUTHORITY_REQUIRED'));
    assert.equal(await present(root, relative), true);
  }
});

if (process.platform === 'win32') test('readonly recovery removal failure reports the verified restored copy and retained recovery in a sealed partial receipt', async (t) => {
  const relative = `${OWNED}/readonly-recovery.html`, contents = 'restore these exact fixture bytes';
  const root = await fixture(t, { [relative]: contents });
  const prepared = await prepare(root, [relative], { actions: [{ path: relative, action: 'quarantine' }] });
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan) });
  assert.equal(receipt.status, 'applied');
  const recovery = receipt.actions[0].destination;
  await exec('attrib', ['+R', path.join(root, recovery)], { windowsHide: true });
  try {
    const approval = approveCleanupRestore(receipt, { source: 'conversation', decision: 'approve', authority: 'restore' });
    const restored = await restoreCleanup({ root, receipt, approval });
    assert.equal(restored.status, 'partial');
    assert.deepEqual(restored.restored, [relative]);
    assert.equal(restored.metrics.restored_bytes, Buffer.byteLength(contents));
    assert.ok(restored.errors.length);
    assert.equal(restored.actions[0].status, 'restored');
    assert.equal(restored.actions[0].recovery_retained, true);
    assert.equal(restored.actions[0].active_copy.path, relative);
    assert.equal(restored.actions[0].active_copy.created, true);
    assert.equal(restored.actions[0].active_copy.verified, true);
    assert.equal(restored.actions[0].active_copy.fingerprint, receipt.actions[0].fingerprint);
    assert.equal(await readFile(path.join(root, relative), 'utf8'), contents);
    assert.equal(await readFile(path.join(root, recovery), 'utf8'), contents);
    const { receipt_id, ...payload } = restored;
    assert.equal(receipt_id, cleanupFingerprint(payload));
    assert.notEqual(restored.verification.affected_checks, 'PASSED');
  } finally {
    if (await present(root, recovery)) await exec('attrib', ['-R', path.join(root, recovery)], { windowsHide: true });
    if (await present(root, relative)) await exec('attrib', ['-R', path.join(root, relative)], { windowsHide: true });
  }
});

test('finished current-task local design render diagnostics qualify for exact LOW policy cleanup', async (t) => {
  const relative = '.sdcorejs/design/tmp/render.png';
  const root = await fixture(t, { [relative]: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 3]) });
  const prepared = await prepare(root, [relative]);
  assert.equal(prepared.analysis.findings[0].risk, 'LOW');
  assert.equal(prepared.analysis.findings[0].classification, 'reproducible-output');
  const receipt = await applyCleanupPlan({ ...prepared, policy: policy(prepared.analysis, [relative]), verify: actualVerification([relative]) });
  assert.equal(receipt.status, 'verified');
  assert.equal(receipt.actions[0].status, 'removed');
  assert.equal(receipt.metrics.removed_active_bytes, 8);
  assertPhysicalReclaimMetrics(receipt);
  assert.equal(await present(root, relative), false);
});

test('needed design failure captures, shared PNG exports and approved design metadata never qualify for LOW cleanup', async (t) => {
  const failure = '.sdcorejs/design/failures/current.png';
  const shared = '.sdcorejs/design/exports/png/feature/shared.png';
  const approved = '.sdcorejs/design/tmp/approved-render.png';
  const approvedMetadata = '.sdcorejs/design/tmp/approved-render-metadata.json';
  const paths = [failure, shared, approved, approvedMetadata];
  const image = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 3]);
  const root = await fixture(t, {
    [failure]: image, [shared]: image, [approved]: image,
    [approvedMetadata]: JSON.stringify({ metadata: { approval_hash: `sha256:v1:${'a'.repeat(64)}`, artifact_kind: 'design' }, image: approved }),
  });
  const evidence = evidenceFor(paths, { [failure]: { needed_for_evidence: true }, [approved]: { approved: true } });
  const analysis = await scanCleanup({ root, scope: paths, evidence, task: TASK });
  assert.equal(analysis.findings.length, paths.length);
  for (const finding of analysis.findings) {
    assert.equal(finding.protected, true, finding.path);
    assert.notEqual(finding.risk, 'LOW');
  }
  await assertDestructivePlanBlocked(analysis, paths.map((relative) => ({ path: relative, action: 'delete' })), { policy: policy(analysis, paths) });
  for (const relative of paths) assert.equal(await present(root, relative), true);
});

test('a final restore state-capture failure returns a sealed partial receipt with the completed restored bytes', { timeout: 20000 }, async (t) => {
  const relative = `${OWNED}/capture-failure.html`, contents = 'capture failure fixture bytes';
  const root = await fixture(t, { [relative]: contents });
  const prepared = await prepare(root, [relative], { actions: [{ path: relative, action: 'quarantine' }] });
  const receipt = await applyCleanupPlan({ ...prepared, approval: mutation(prepared.plan) });
  assert.equal(receipt.status, 'applied');
  let watcher;
  const markerWritten = new Promise((resolve, reject) => {
    watcher = watch(path.dirname(path.join(root, relative)), { persistent: false }, (event, filename) => {
      if (event !== 'rename' || String(filename).toLowerCase() !== path.basename(relative).toLowerCase()) return;
      watcher.close();
      put(root, '.git', 'gitdir: fixture-only-missing-git-directory').then(resolve, reject);
    });
    watcher.on('error', reject);
  });
  try {
    const approval = approveCleanupRestore(receipt, { source: 'conversation', decision: 'approve', authority: 'restore' });
    const [restored] = await Promise.all([restoreCleanup({ root, receipt, approval }), markerWritten]);
    assert.equal(restored.status, 'partial');
    assert.ok(restored.errors.some((error) => error.code === 'GIT_STATE_UNAVAILABLE'), JSON.stringify(restored.errors));
    assert.deepEqual(restored.restored, [relative]);
    assert.equal(restored.metrics.restored_bytes, Buffer.byteLength(contents));
    assert.equal(restored.actions[0].active_copy.verified, true);
    assert.equal(await readFile(path.join(root, relative), 'utf8'), contents);
    assert.equal(await present(root, receipt.actions[0].destination), false);
    const { receipt_id, ...payload } = restored;
    assert.equal(receipt_id, cleanupFingerprint(payload));
  } finally { watcher.close(); }
});
