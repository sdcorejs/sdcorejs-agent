import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
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
