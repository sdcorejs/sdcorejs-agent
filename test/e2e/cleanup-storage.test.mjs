import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, utimes, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { runCleanupCli } from '../../_refs/cleanup/cli.mjs';
import { validateCleanupPlan } from '../../_refs/cleanup/cleanup-contract.mjs';
import { dispatchPrompt, loadSkillPack } from './support/skill-pack-runner.mjs';

const exec = promisify(execFile);
const python = process.env.SDCOREJS_CLEANUP_PYTHON;
const root = fileURLToPath(new URL('../..', import.meta.url));
const native = { skip: !python && 'Select an existing absolute SDCOREJS_CLEANUP_PYTHON; no runtime is installed.' };

async function fixture(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-storage-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

test('storage inspection routes to cleanup while security review and teardown keep their owners', async () => {
  const pack = await loadSkillPack(new URL('../..', import.meta.url));
  for (const [prompt, expected] of [
    ['Inspect disk space across this machine, including AppData and Docker WSL disks.', 'sdcorejs-cleanup'],
    ['Why is node_modules using so much disk space in Documents?', 'sdcorejs-cleanup'],
    ['Rà soát dung lượng cả máy, npm cache và node_modules trong Codex.', 'sdcorejs-cleanup'],
    ['Ổ đĩa gần đầy; kiểm tra cả máy, Documents và Docker.', 'sdcorejs-cleanup'],
    ['Máy sắp hết chỗ, xem thư mục Documents chiếm bao nhiêu.', 'sdcorejs-cleanup'],
    ['My disk is nearly full; inspect this whole computer including Documents and Docker.', 'sdcorejs-cleanup'],
    ['Check Docker space usage without starting Docker.', 'sdcorejs-cleanup'],
    ['Inspect disk space and node_modules in my code workspaces.', 'sdcorejs-cleanup'],
    ['Audit security of the cleanup workflow files.', 'sdcorejs-review'],
    ['Write cleanup and data teardown for these integration tests.', 'sdcorejs-test'],
    ['Simplify this modified function without changing behavior.', 'sdcorejs-simplify'],
    ['Run tests that inspect node_modules size and assert a partial storage-audit report.', 'sdcorejs-test'],
    ['Audit node_modules performance.', 'sdcorejs-review'],
    ['Debug why node_modules resolution throws an error.', 'sdcorejs-debug'],
    ['Low disk space.', 'sdcorejs-cleanup'],
    ['My disk is full.', 'sdcorejs-cleanup'],
  ]) assert.equal(dispatchPrompt(pack, prompt)?.name, expected, prompt);
  for (const prompt of [
    'Why does node_modules produce MODULE_NOT_FOUND?',
    'Why does my application crash when reading AppData?',
  ]) assert.notEqual(dispatchPrompt(pack, prompt)?.name, 'sdcorejs-cleanup', prompt);
});

test('storage CLI requires an explicitly selected absolute Python runtime', async () => {
  await assert.rejects(runCleanupCli(['storage-audit', '--root', root, '--python', 'python']), /ABSOLUTE_PYTHON_REQUIRED/u);
});

test('storage CLI audits dependencies by metadata without changing protected content', native, async (t) => {
  const dir = await fixture(t);
  const modules = path.join(dir, 'app', 'node_modules');
  await mkdir(modules, { recursive: true });
  const file = path.join(modules, 'unique-private-data');
  await writeFile(file, 'unique bytes');
  const report = await runCleanupCli(['storage-audit', '--root', dir, '--python', python]);
  assert.equal(report.logical_bytes, 12);
  assert.equal(report.dependency_roots.length, 1);
  assert.equal(report.dependency_roots[0].coverage, 'complete');
  assert.equal(report.mutation_authorized, false);
  assert.equal(await readFile(file, 'utf8'), 'unique bytes');
  assert.throws(() => validateCleanupPlan(report), /INVALID_PLAN/u);
});

test('storage budget records incomplete candidates instead of reporting an empty cache', native, async (t) => {
  const dir = await fixture(t);
  const cache = path.join(dir, 'npm-cache');
  await mkdir(cache); await writeFile(path.join(cache, 'payload'), 'not empty');
  const report = await runCleanupCli(['storage-audit', '--root', cache, '--python', python, '--max-seconds', '0.0000001']);
  assert.equal(report.status, 'partial');
  assert.equal(report.candidates[0].coverage, 'partial');
  assert.equal(report.mutation_authorized, false);
});

test('storage authority and output flags cannot feed a mutation plan', native, async (t) => {
  const dir = await fixture(t);
  await assert.rejects(runCleanupCli(['storage-audit', '--root', dir, '--python', python, '--input', path.join(dir, 'authority.json')]), /INVALID_ARGUMENTS/u);
  await assert.rejects(runCleanupCli(['storage-audit', '--root', dir, '--python', python, '--out', path.join(dir, 'report.json')]), /REPORT_OUTSIDE_ANALYSIS_ROOT_REQUIRED/u);
  if (process.platform === 'win32') {
    const code = 'import ctypes,sys; f=ctypes.WinDLL("kernel32",use_last_error=True).GetShortPathNameW; f.argtypes=[ctypes.c_wchar_p,ctypes.c_wchar_p,ctypes.c_ulong]; f.restype=ctypes.c_ulong; b=ctypes.create_unicode_buffer(32768); n=f(sys.argv[1],b,len(b)); print(b.value if n else sys.argv[1])';
    const { stdout } = await exec(python, ['-I', '-S', '-B', '-c', code, dir], { windowsHide: true });
    const alias = stdout.trim();
    if (alias.toLowerCase() !== dir.toLowerCase()) {
      await assert.rejects(runCleanupCli(['storage-audit', '--root', alias, '--python', python, '--out', path.join(dir, 'alias-report.json')]), /REPORT_OUTSIDE_ANALYSIS_ROOT_REQUIRED/u);
    }
  }
});

test('bundled metadata and npm-recovery regression fixtures execute with the selected runtime', native, async () => {
  const { stdout, stderr } = await exec(python, ['-I', '-S', '-B', path.join(root, 'test/e2e/fixtures/cleanup-storage-tools.py')], { windowsHide: true });
  assert.match(stdout + stderr, /OK/u);
});

test('project inventory uses calendar age, observed writes and disjoint totals', native, async (t) => {
  const dir = await fixture(t);
  const output = await fixture(t);
  const projects = ['2026-11-09-ten', '2026-11-08-eleven', '2026-10-30-twenty', '2026-10-29-twenty-one'];
  for (const name of projects) {
    const project = path.join(dir, name);
    await mkdir(path.join(project, '.remotion', 'cache'), { recursive: true });
    await mkdir(path.join(project, 'deliverables'));
    await writeFile(path.join(project, '.remotion', 'cache', 'render.js'), '12345');
    await writeFile(path.join(project, 'deliverables', 'clip.mp4'), '1234567');
    await writeFile(path.join(project, 'package.json'), '{}');
    const recent = new Date('2026-11-18T12:00:00Z');
    await Promise.all(['.remotion/cache/render.js', 'deliverables/clip.mp4', 'package.json'].map(file => utimes(path.join(project, file), recent, recent)));
  }
  const csv = path.join(output, 'inventory.csv');
  const report = await runCleanupCli(['storage-audit', '--root', dir, '--python', python,
    '--as-of', '2026-11-19T23:00:00+07:00', '--timezone', '+07:00', '--csv', csv]);
  assert.equal(report.age_as_of_date, '2026-11-19');
  assert.deepEqual(Object.fromEntries(report.projects.map(row => [row.name, row.age_bucket])),
    Object.fromEntries(projects.map((name, i) => [name, ['0-10', '11-20', '11-20', 'over-20'][i]])));
  assert.equal(report.age_groups.reduce((sum, row) => sum + row.logical_bytes, 0), report.logical_bytes);
  const old = report.projects.find(row => row.name === projects[3]);
  assert.equal(old.age_source, 'workspace-date-label');
  assert.equal(old.recent_activity, true);
  assert.equal(old.latest_write_known, true);
  assert.match(old.contents, /build or test cache/u);
  assert.match(old.contents, /deliverables/u);
  assert.ok(old.keep_signals.includes('deliverables require a verified copy'));
  assert.ok(old.top_items.some(item => item.name === 'deliverables' && item.logical_bytes === 7));
  assert.ok(report.records.some(row => row.name === 'cache' && row.project === old.name));
  assert.match(await readFile(csv, 'utf8'), /age_bucket.*keep_signals/u);
  const partial = await runCleanupCli(['storage-audit', '--root', dir, '--python', python,
    '--exclude', path.join(dir, projects[3], 'deliverables')]);
  assert.equal(partial.projects.find(row => row.name === projects[3]).latest_write_known, false);
});

test('a batch filters old workspaces, freezes exact independent items, and retains stale or dirty items', native, async (t) => {
  const dir = await fixture(t);
  const old = '2026-10-29-project';
  const cache = path.join(dir, old, '.remotion', 'cache');
  const repo = path.join(dir, '2026-10-28-repo');
  const repoCache = path.join(repo, '.remotion', 'cache');
  await mkdir(cache, { recursive: true });
  await mkdir(repoCache, { recursive: true });
  await mkdir(path.join(dir, old, 'deliverables'));
  await writeFile(path.join(dir, old, 'deliverables', 'keep.mp4'), 'handoff');
  await writeFile(path.join(cache, 'render.js'), 'generated');
  await writeFile(path.join(repoCache, 'render.js'), 'generated');
  await writeFile(path.join(repo, 'source.js'), 'before');
  await exec('git', ['init', repo]);
  await exec('git', ['-C', repo, 'add', 'source.js']);
  await exec('git', ['-C', repo, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'fixture']);
  await writeFile(path.join(repo, 'source.js'), 'dirty');
  const report = await runCleanupCli(['storage-audit', '--root', dir, '--python', python,
    '--as-of', '2026-11-19T23:00:00+07:00', '--timezone', '+07:00']);
  const { freezeStorageBatch, approveStorageBatch, applyStorageBatch } =
    await import('../../_refs/cleanup/storage-batch.mjs');
  const evidence = file => ({ [file]: { owner: 'fixture', reproducible: true,
    producer_status: 'finished', needed_for_evidence: false, evidence: ['Fixture cache generator and producer exit observed'] } });
  const batch = await freezeStorageBatch({ report, age_bucket: 'over-20', selections: [
    { path: cache, root: dir, action: 'delete', recovery_basis: 'Regenerate with fixture generator', evidence: evidence(old + '/.remotion/cache/render.js') },
    { path: repoCache, root: repo, action: 'delete', evidence: evidence('.remotion/cache/render.js') },
  ] });
  const [eligible, held] = batch.items;
  assert.equal(eligible.plan.actions.length, 1);
  assert.equal(eligible.plan.actions[0].path, old + '/.remotion/cache/render.js');
  assert.match(held.reasons.join(' '), /DIRTY_REPOSITORY/u);
  assert.deepEqual(batch.candidates.map(row => row.name).sort(), ['2026-10-28-repo', old]);
  const approval = approveStorageBatch(batch, { source: 'conversation', decision: 'approve', item_ids: [eligible.id] });
  await writeFile(path.join(cache, 'new.js'), 'appeared after freeze');
  const receipt = await applyStorageBatch({ batch, approval });
  assert.equal(receipt.status, 'blocked');
  assert.match(receipt.items[0].reasons.join(' '), /STALE_PLAN/u);
  assert.equal(await readFile(path.join(cache, 'render.js'), 'utf8'), 'generated');
  assert.equal(await readFile(path.join(cache, 'new.js'), 'utf8'), 'appeared after freeze');
  assert.equal(await readFile(path.join(dir, old, 'deliverables', 'keep.mp4'), 'utf8'), 'handoff');
  assert.ok(receipt.volumes.every(volume => volume.before && volume.after));
});

test('native batch removes only the stable approved fixture and reports partial completion', {
  skip: (!python || (process.platform !== 'win32' && !process.env.SDCOREJS_CLEANUP_POSIX_FIXTURE_ROOT))
    && 'Native batch execution requires a supported local fixture root and explicit Python.',
}, async (t) => {
  const parent = process.env.SDCOREJS_CLEANUP_POSIX_FIXTURE_ROOT ?? os.tmpdir();
  const { realpath } = await import('node:fs/promises');
  const dir = await realpath(await mkdtemp(path.join(parent, 'sdcorejs-storage-native-')));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const task = { id: 'storage-native-fixture', status: 'completed', durable_finalized: true };
  const stale = '2026-10-28-stale';
  const stable = '2026-10-29-stable';
  for (const name of [stale, stable]) {
    await mkdir(path.join(dir, name));
    await writeFile(path.join(dir, name, 'render.js'), 'exact fixture output');
  }
  let boundary = null;
  if (process.platform !== 'win32') {
    const { inspectCleanupPosixCapabilities } = await import('../../_refs/cleanup/posix-file-operation.mjs');
    const capabilities = await inspectCleanupPosixCapabilities({ root: dir, python });
    assert.equal(capabilities.supported, true, JSON.stringify(capabilities));
    boundary = {
      version: 'posix-maintenance-v1', root_id: dir, python: capabilities.python,
      helper_sha256: capabilities.helper_sha256, profile: capabilities.profile,
      maintenance: { root_id: dir, task_id: task.id, generation: 'fixture-only', source: 'conversation',
        owner: 'fixture', attestation: 'All fixture writes completed before execution',
        fence_path: '.sdcorejs/tmp/cleanup-runtime/posix-maintenance.lock',
        participants: [{ id: 'fixture', state: 'quiescent', evidence: 'Awaited all fixture writes',
          writable_descriptors_closed: true, children_quiescent: true }] },
    };
  }
  const { freezeStorageBatch, approveStorageBatch, applyStorageBatch } =
    await import('../../_refs/cleanup/storage-batch.mjs');
  const report = await runCleanupCli(['storage-audit', '--root', dir, '--python', python,
    '--as-of', '2026-11-19T23:00:00+07:00', '--timezone', '+07:00']);
  const batch = await freezeStorageBatch({ report, age_bucket: 'over-20',
    selections: [stale, stable].map(name => ({
      path: path.join(dir, name), action: 'delete', task, posix_boundary: boundary,
      recovery_basis: 'Recreate with fixture setup',
      evidence: { [name + '/render.js']: { owner: 'fixture', task_id: task.id,
        reproducible: true, producer_status: 'finished', needed_for_evidence: false,
        evidence: ['Fixture source and awaited writer exit'] } },
    })) });
  assert.ok(batch.items.every(item => item.plan), JSON.stringify(batch.items));
  const approval = approveStorageBatch(batch, { source: 'conversation', decision: 'approve',
    item_ids: batch.items.map(item => item.id) });
  await writeFile(path.join(dir, stale, 'new.js'), 'retain unapproved file');
  const receipt = await applyStorageBatch({ batch, approval,
    maintenance: Object.fromEntries(batch.items.map(item => [item.id, boundary?.maintenance])) });
  assert.equal(receipt.status, 'partial', JSON.stringify(receipt));
  assert.equal(receipt.items[0].status, 'retained');
  assert.equal(receipt.items[1].receipt.actions[0].status, 'removed');
  assert.equal(receipt.deleted_logical_bytes, Buffer.byteLength('exact fixture output'));
  await assert.rejects(readFile(path.join(dir, stable, 'render.js')), { code: 'ENOENT' });
  assert.equal(await readFile(path.join(dir, stale, 'new.js'), 'utf8'), 'retain unapproved file');
  assert.equal(await readFile(path.join(dir, stale, 'render.js'), 'utf8'), 'exact fixture output');
});

test('storage selections cannot hide a protected ancestor by rebasing the engine root', native, async (t) => {
  const dir = await fixture(t);
  const workspace = path.join(dir, '2026-10-20-old');
  const recovery = path.join(workspace, 'dist', 'recovery');
  const target = path.join(recovery, 'temp');
  await mkdir(target, { recursive: true });
  await writeFile(path.join(target, 'render.js'), 'preserve recovery');
  const report = await runCleanupCli(['storage-audit', '--root', dir, '--python', python,
    '--as-of', '2026-11-19T23:00:00+07:00', '--timezone', '+07:00']);
  const { freezeStorageBatch } = await import('../../_refs/cleanup/storage-batch.mjs');
  const batch = await freezeStorageBatch({ report, age_bucket: 'over-20', selections: [{
    path: target, root: recovery, action: 'delete', recovery_basis: 'Untrusted fixture assertion',
    evidence: { 'temp/render.js': { owner: 'fixture', producer_status: 'finished',
      needed_for_evidence: false, reproducible: true, evidence: ['Untrusted fixture assertion'] } },
  }] });
  assert.equal(batch.items[0].plan, null);
  assert.match(batch.items[0].reasons.join(' '), /PROTECTED_STORAGE_PATH/u);
  const workspaceRow = report.projects.find(row => row.path === workspace);
  assert.match(workspaceRow.contents, /evidence or recovery/u);
});

test('storage planning does not refresh the Git index on disk', native, async (t) => {
  const dir = await fixture(t);
  const repo = path.join(dir, '2026-10-20-repo');
  await mkdir(path.join(repo, 'cache'), { recursive: true });
  const tracked = path.join(repo, 'source.js');
  await writeFile(tracked, 'source');
  await writeFile(path.join(repo, '.gitignore'), '/cache/\n');
  await writeFile(path.join(repo, 'cache', 'render.js'), 'fixture');
  await exec('git', ['init', repo]);
  await exec('git', ['-C', repo, 'add', 'source.js', '.gitignore']);
  await exec('git', ['-C', repo, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'fixture']);
  const index = path.join(repo, '.git', 'index');
  const before = await readFile(index);
  const touched = new Date('2026-11-18T00:00:00Z');
  await utimes(tracked, touched, touched);
  const report = await runCleanupCli(['storage-audit', '--root', dir, '--python', python,
    '--as-of', '2026-11-19T23:00:00+07:00', '--timezone', '+07:00']);
  const { freezeStorageBatch } = await import('../../_refs/cleanup/storage-batch.mjs');
  const batch = await freezeStorageBatch({ report, age_bucket: 'over-20', selections: [{
    path: path.join(repo, 'cache'), root: repo, action: 'delete', recovery_basis: 'Regenerate the fixture file',
    evidence: { 'cache/render.js': { owner: 'fixture', producer_status: 'finished',
      needed_for_evidence: false, reproducible: true, evidence: ['Fixture producer awaited'] } },
  }] });
  assert.ok(batch.items[0].plan, JSON.stringify(batch.items[0]));
  assert.deepEqual(await readFile(index), before);
});
