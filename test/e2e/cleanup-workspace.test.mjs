import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, realpath, rm, symlink, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { runCleanupCli } from '../../_refs/cleanup/cli.mjs';
import { CLEANUP_POSIX_FENCE, cleanupFingerprint } from '../../_refs/cleanup/cleanup-contract.mjs';
import { inspectCleanupPosixCapabilities } from '../../_refs/cleanup/posix-file-operation.mjs';

const python = process.env.SDCOREJS_CLEANUP_PYTHON;
const options = { skip: !python && 'Select SDCOREJS_CLEANUP_PYTHON to run the storage fixtures.' };
const exec = promisify(execFile);
const cutoff = '2026-11-19';
const old = new Date('2026-10-29T10:00:00Z');
const cutoffArgs = ['--as-of', cutoff, '--time-zone', 'Asia/Ho_Chi_Minh'];
const first = '2026-10-29-a/cache';
const second = '2026-10-28-b/cache';

async function fixture(t, parent = tmpdir()) {
  const home = await realpath(await mkdtemp(path.join(parent, 'cleanup-workspace-')));
  t.after(() => rm(home, { recursive: true, force: true }));
  const root = path.join(home, 'collection');
  await mkdir(root);
  const put = async (relative, contents = 'fixture', mtime = old) => {
    const absolute = path.join(root, relative);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, contents);
    await utimes(absolute, mtime, mtime);
  };
  const invoke = async (mode, input) => {
    const file = path.join(home, mode + '.json');
    await writeFile(file, JSON.stringify({ python, ...input }));
    return runCleanupCli([mode, '--root', root, '--input', file]);
  };
  const audit = (...args) => runCleanupCli(['storage-audit', '--root', root, '--python', python, ...cutoffArgs, ...args]);
  return { home, root, put, invoke, audit };
}

const proof = { owner: 'fixture producer', producer_status: 'finished', needed_for_evidence: false,
  reproducible: true, evidence: ['Fixture generator and inputs retained. Closed scoped producer.'] };

test('age cutoffs use calendar dates, report mixed content, and sum only disjoint rows', options, async t => {
  const f = await fixture(t);
  for (const day of ['11-09', '11-08', '10-30', '10-29']) {
    await f.put(`2026-${day}-workspace/cache/output.txt`, '12345');
  }
  await f.put('2026-10-29-workspace/delivery/cut.mp4', '123456789', new Date('2026-11-09T18:00:00Z'));
  await f.put('loose.txt', 'root');
  const csv = path.join(f.home, 'inventory.csv');
  const report = await f.audit('--csv', csv);
  const view = report.workspace_inventory;
  assert.equal(view.as_of, cutoff);
  assert.equal(view.time_zone, 'Asia/Ho_Chi_Minh');
  assert.deepEqual(view.age_groups.map(row => row.files), [1, 2, 2, 1]);
  assert.equal(report.logical_bytes, 33);
  assert.equal(view.age_groups.reduce((sum, row) => sum + row.logical_bytes, 0), 33);
  const ws = view.workspaces.find(row => row.name === '2026-10-29-workspace');
  assert.equal(ws.age_days, 21);
  assert.equal(ws.age_basis, 'workspace-date-label');
  assert.equal(ws.recent_activity, true);
  assert.equal(ws.latest_write_known, true);
  assert.equal(ws.reclaimable_bytes, null);
  assert.ok(ws.contents.some(item => item.kind === 'handoff-output' && item.logical_bytes === 9));
  assert.ok(ws.contents.some(item => item.kind === 'build-test-cache' && item.logical_bytes === 5));
  assert.deepEqual(ws.largest_subdirectories.map(({ name, logical_bytes }) => [name, logical_bytes]), [['delivery', 9], ['cache', 5]]);
  assert.equal(view.details.find(row => row.path === path.join(ws.path, 'cache')).logical_bytes, 5);
  assert.match(await readFile(csv, 'utf8'), /keep_signals.*description/u);
});

test('an ordinary workspace reports measured log content', options, async t => {
  const f = await fixture(t);
  await f.put('2026-10-29-experiment/runner.log', 'test output');
  const [workspace] = (await f.audit()).workspace_inventory.workspaces;
  assert.ok(workspace.contents.some(item => item.kind === 'logs' && item.logical_bytes === 11));
});

test('partial scan retains the observed latest write without claiming the subtree maximum', options, async t => {
  const f = await fixture(t);
  await f.put(first + '/output.txt');
  await f.put(first + '/seen.txt');
  const report = await f.audit('--exclude', path.join(f.root, first, 'output.txt'));
  const row = report.workspace_inventory.workspaces[0];
  assert.equal(row.coverage, 'partial');
  assert.equal(row.latest_write_known, false);
  assert.equal(row.latest_write_observed, old.toISOString());
  const plan = await f.invoke('workspace-plan', { inventory: report, age_group: 'over-20', selections: [{ path: first, evidence: { [first + '/output.txt']: proof } }] });
  assert.equal(plan.units.length, 0);
  assert.match(JSON.stringify(plan.held), /partial/u);
});

test('git local changes and mixed delivery data hold a wide selection but allow a separately evidenced cache', options, async t => {
  const f = await fixture(t);
  await f.put(first + '/log.txt');
  await f.put('2026-10-29-a/delivery/cut.mp4', 'video');
  await f.put('2026-10-27-repo/code.txt');
  const repo = path.join(f.root, '2026-10-27-repo');
  for (const args of [['init'], ['add', '.'], ['-c', 'user.name=Fixture', '-c', 'user.email=test@example.invalid', 'commit', '-m', 'fixture']]) {
    await exec('git', args, { cwd: repo });
  }
  await f.put('2026-10-27-repo/code.txt', 'local uncommitted changes');
  const inventory = await f.audit();
  const view = inventory.workspace_inventory;
  assert.ok(view.workspaces.find(row => row.path === repo).keep_signals.includes('dirty-or-untracked'));
  const review = await f.invoke('workspace-plan', { inventory, age_group: 'over-20' });
  assert.equal(review.candidates.length, 2);
  assert.deepEqual(review.units, []);
  await assert.rejects(f.invoke('workspace-plan', { inventory, age_group: 'over-20', selections: [
    { path: '2026-10-29-a', evidence: {} }, { path: first, evidence: {} },
  ] }), /OVERLAPPING_BATCH_SCOPES/u);
  const plan = await f.invoke('workspace-plan', { inventory, age_group: 'over-20', selections: [
    { path: '2026-10-29-a', evidence: { [first + '/log.txt']: proof } },
    { path: '2026-10-27-repo', evidence: {} },
  ] });
  assert.equal(plan.units.length, 0);
  assert.match(JSON.stringify(plan.held), /handoff-output/u);
  assert.match(JSON.stringify(plan.held), /dirty-or-untracked/u);
  const cache = await f.invoke('workspace-plan', { inventory, age_group: 'over-20', selections: [
    { path: first, evidence: { [first + '/log.txt']: proof } },
  ] });
  assert.deepEqual(cache.units[0].plan.actions.map(action => action.path), [first + '/log.txt']);
  assert.equal(cache.mutation_authorized, false);
});

test('inventory cannot account for redirected data and plan keeps that unit', options, async t => {
  const f = await fixture(t);
  const outside = path.join(f.home, 'outside');
  await mkdir(outside);
  await writeFile(path.join(outside, 'external.txt'), 'outside scope');
  await f.put(first + '/output.txt');
  await symlink(outside, path.join(f.root, first, 'outside'), process.platform === 'win32' ? 'junction' : 'dir');
  const inventory = await f.audit();
  assert.equal(inventory.logical_bytes, 7);
  const plan = await f.invoke('workspace-plan', { inventory, age_group: 'over-20',
    selections: [{ path: first, evidence: { [first + '/output.txt']: proof } }] });
  assert.match(JSON.stringify(plan.held), /redirect-not-followed/u);
  assert.deepEqual(plan.units, []);
});

test('a nested cache keeps its recorded content role when re-audited as a delete scope', options, async t => {
  const f = await fixture(t);
  const scope = first + '/webpack';
  const file = scope + '/bundle.js';
  await f.put(file);
  const plan = await f.invoke('workspace-plan', { inventory: await f.audit(), age_group: 'over-20',
    selections: [{ path: scope, evidence: { [file]: proof } }] });
  assert.deepEqual(plan.units[0]?.plan.actions.map(action => action.path), [file], JSON.stringify(plan.held));
});

test('a clean repository can plan ignored cache after engine journals while tracked files stay held', options, async t => {
  const f = await fixture(t);
  const untracked = first + '/generated.txt', tracked = second + '/tracked.txt';
  await f.put('.gitignore', untracked + '\n');
  await f.put(tracked);
  for (const args of [['init'], ['add', '.'], ['-c', 'user.name=Fixture', '-c', 'user.email=test@example.invalid', 'commit', '-m', 'fixture']]) {
    await exec('git', args, { cwd: f.root });
  }
  await f.put(untracked);
  await f.put('.sdcorejs/tmp/cleanup-runtime/transactions/internal/journal.ndjson');
  const plan = await f.invoke('workspace-plan', { inventory: await f.audit(), age_group: 'over-20', selections: [
    { path: first, evidence: { [untracked]: proof } }, { path: second, evidence: { [tracked]: proof } },
  ] });
  assert.deepEqual(plan.units.map(unit => unit.path), [path.join(f.root, first)], JSON.stringify(plan.held));
  assert.match(JSON.stringify(plan.held), /tracked-file/u);
});

test('batch gates exact approval, stale units, producer activity and independent receipts', options, async t => {
  const f = await fixture(t);
  const third = '2026-10-27-c/cache';
  for (const unit of [first, second, third]) await f.put(unit + '/log.txt');
  const inventory = await f.audit();
  const selection = unit => ({ path: unit, evidence: { [unit + '/log.txt']: proof } });
  const result = await f.invoke('workspace-plan', { inventory, age_group: 'over-20', selections: [selection(first), selection(second),
    { path: third, evidence: { [third + '/log.txt']: { ...proof, producer_pid: process.pid } } }] });
  assert.equal(result.units.length, 2);
  assert.match(JSON.stringify(result.held), /active/u);
  await assert.rejects(f.invoke('workspace-apply', { batch: result }), /BATCH_AUTHORITY_REQUIRED/u);
  const approval = { source: 'conversation', decision: 'approve', authority: 'mutation', batch_id: result.batch_id };
  const tampered = structuredClone(result);
  tampered.units[0].path = f.root;
  await assert.rejects(f.invoke('workspace-apply', { batch: tampered, approval }), /BATCH_IDENTITY_CHANGED/u);
  await f.put(first + '/new.txt', 'not approved');
  const receipt = await f.invoke('workspace-apply', { batch: result, approval });
  assert.equal(receipt.items.find(item => item.path === path.join(f.root, first)).status, 'retained');
  assert.match(JSON.stringify(receipt.items), /STALE_PLAN/u);
  assert.ok(receipt.items.some(item => item.path === path.join(f.root, second) && item.receipt));
  assert.ok(receipt.volumes.before?.free > 0);
  assert.ok(receipt.volumes.after?.free > 0);
  await access(path.join(f.root, first, 'new.txt'));
  await access(path.join(f.root, first, 'log.txt'));
  await access(path.join(f.root, third, 'log.txt'));
});

async function partialDeleteFixture(t, { adapter = false } = {}) {
  const f = await fixture(t, process.env.SDCOREJS_CLEANUP_POSIX_FIXTURE_ROOT || tmpdir());
  const task = { id: 'workspace-fixture', status: 'completed', durable_finalized: true };
  let posix_boundary, maintenance;
  if (process.platform !== 'win32') {
    const caps = adapter ? { supported: true,
      python: { executable: python, version: '3.13.0', sha256: 'a'.repeat(64) }, helper_sha256: 'b'.repeat(64),
      profile: { platform: 'linux', filesystem: 'ext4', primitive: 'renameat2', architecture: 'x64', os_release: 'fixture adapter' },
    } : await inspectCleanupPosixCapabilities({ root: f.root, python });
    if (!caps.supported) return t.skip(`Native sample deletion unavailable: ${caps.errors.map(error => error.code).join(', ')}`);
    maintenance = { root_id: f.root, task_id: task.id, generation: 'fixture-1', source: 'conversation',
      owner: 'fixture-owner', attestation: 'Only this test writes the fixture.',
      participants: [{ id: 'fixture', state: 'quiescent', evidence: 'Awaited writes.', children_quiescent: true, writable_descriptors_closed: true }],
      fence_path: CLEANUP_POSIX_FENCE };
    posix_boundary = { version: 'posix-maintenance-v1', root_id: f.root, python: caps.python, profile: caps.profile, helper_sha256: caps.helper_sha256, maintenance };
  }
  for (const unit of [first, second]) await f.put(unit + '/log.txt');
  const batch = await f.invoke('workspace-plan', { inventory: await f.audit(), age_group: 'over-20', task, posix_boundary,
    selections: [first, second].map(unit => ({ path: unit, evidence: { [unit + '/log.txt']: proof } })) });
  assert.equal(batch.units.length, 2);
  await f.put(first + '/late.txt', 'hold the entire changed unit');
  const input = { batch, maintenance,
    approval: { source: 'conversation', decision: 'approve', authority: 'mutation', batch_id: batch.batch_id } };
  let receipt;
  if (adapter) {
    const request = path.join(f.home, 'workspace-apply-fixture.json');
    await writeFile(request, JSON.stringify(input));
    const script = fileURLToPath(new URL('./fixtures/cleanup-workspace-native-adapter.mjs', import.meta.url));
    const { stdout } = await exec(process.execPath, ['--experimental-test-module-mocks', script, f.root, request]);
    receipt = JSON.parse(stdout);
  } else {
    receipt = await f.invoke('workspace-apply', input);
  }
  assert.equal(receipt.status, 'partial');
  assert.equal(receipt.logical_bytes_removed, 7);
  assert.deepEqual(receipt.removed_paths, [path.join(f.root, second, 'log.txt')]);
  await assert.rejects(access(path.join(f.root, second, 'log.txt')), { code: 'ENOENT' });
  await access(path.join(f.root, first, 'late.txt'));
  await access(path.join(f.root, first, 'log.txt'));
  assert.equal(cleanupFingerprint(Object.fromEntries(Object.entries(batch).filter(([key]) => key !== 'batch_id'))), batch.batch_id);
}

test('native sample batch deletes only unchanged approved files and reports partial success', options, partialDeleteFixture);
test('fixture adapter removes the unchanged file through the batch and engine, accounting for the stale unit', options,
  t => partialDeleteFixture(t, { adapter: true }));
