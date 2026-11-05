import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DEFAULT_CONVENTION_POLICY } from '../../_refs/shared/convention-contract.mjs';
import { applyProjectBootstrap, planProjectBootstrap, bootstrapHash } from '../../_refs/shared/project-bootstrap.mjs';
const policy = () => ({ ...structuredClone(DEFAULT_CONVENTION_POLICY), repository: { repository_id: 'repo' }, project_bootstrap: { schema_version: 1, mode: 'manual', target: 'AGENTS.md', template_version: 1, managed_block_id: 'sdcorejs-project-baseline' } });
const options = () => ({ policy: policy(), repository_id: 'repo', approved_target: 'AGENTS.md', explicit_authority: true, action: 'conventions-sync-write-approved', worker_role: 'sequential-owner', instruction_conflicts: [], writer_contract: { kind: 'cooperative', all_writers_cooperate: true, external_editors_excluded: true } });
async function sandbox(t) { const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'sdcore-bootstrap-'))); await fs.mkdir(path.join(root, '.git')); t.after(() => fs.rm(root, { recursive: true, force: true })); return root; }
test('managed update preserves BOM, CRLF and bytes outside block; repeated sync is identical', async t => {
  const root = await sandbox(t), target = path.join(root, 'AGENTS.md');
  const original = Buffer.from('\uFEFF# Human instructions\r\nKeep this text.\r\n'); await fs.writeFile(target, original);
  const first = await applyProjectBootstrap({ ...options(), root, expected_hash: bootstrapHash(original) });
  assert.equal(first.status, 'written', JSON.stringify(first)); const bytes = await fs.readFile(target);
  assert.deepEqual(bytes.subarray(0, original.length), original);
  assert.equal(bytes.toString().includes('\n') && /(?<!\r)\n/u.test(bytes.toString()), false);
  const second = await applyProjectBootstrap({ ...options(), root, expected_hash: bootstrapHash(bytes) });
  assert.equal(second.status, 'unchanged'); assert.deepEqual(await fs.readFile(target), bytes);
});

test('a leading BOM directly before a managed block remains syncable', async t => {
  const root = await sandbox(t), target = path.join(root, 'AGENTS.md');
  const generated = planProjectBootstrap({ ...options(), content: Buffer.alloc(0) });
  const original = Buffer.concat([Buffer.from('\uFEFF'), generated.content]);
  await fs.writeFile(target, original);
  const result = await applyProjectBootstrap({ ...options(), root, expected_hash: bootstrapHash(original) });
  assert.equal(result.status, 'unchanged');
  assert.deepEqual(await fs.readFile(target), original);
});
test('disabled, unauthorized, review, worker, owner mismatch and missing lease only propose', async t => {
  const root = await sandbox(t), original = Buffer.from('# Human\n'), target = path.join(root, 'AGENTS.md'); await fs.writeFile(target, original);
  for (const change of [{ policy: { ...policy(), project_bootstrap: undefined } }, { explicit_authority: false }, { action: 'review' }, { worker_role: 'parallel-worker' }, { repository_id: 'other' }, { writer_contract: undefined }, { instruction_conflicts: ['nested policy conflict'] }]) {
    const result = await applyProjectBootstrap({ ...options(), ...change, root, expected_hash: bootstrapHash(original) });
    assert.notEqual(result.status, 'written'); assert.deepEqual(await fs.readFile(target), original);
  }
});
test('stale hash and malformed markers refuse without losing human edits', async t => {
  const root = await sandbox(t), target = path.join(root, 'AGENTS.md');
  for (const text of ['# newer edit\n', '<!-- sdcorejs-project-baseline:start -->\nno end']) {
    await fs.writeFile(target, text); const result = await applyProjectBootstrap({ ...options(), root, expected_hash: text.startsWith('#') ? bootstrapHash('old') : bootstrapHash(text) });
    assert.equal(result.status, 'proposal'); assert.equal(await fs.readFile(target, 'utf8'), text);
  }
});
test('nested repository, junction and outside paths cannot become write targets', async t => {
  const root = await sandbox(t); await fs.mkdir(path.join(root, 'child', '.git'), { recursive: true });
  const outside = await sandbox(t); await fs.symlink(outside, path.join(root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  for (const target of ['child/AGENTS.md', 'linked/AGENTS.md', '../AGENTS.md']) {
    const opts = options(); opts.policy.project_bootstrap.target = target; opts.approved_target = target;
    assert.equal((await applyProjectBootstrap({ ...opts, root, expected_hash: bootstrapHash('') })).status, 'proposal');
  }
  await assert.rejects(fs.access(path.join(outside, 'AGENTS.md')));
});
test('trusted after-sync policy is distinct from source text and explicit manual authority', () => {
  const opts = options(); opts.policy.project_bootstrap.mode = 'after-convention-sync'; opts.policy.capture.mode = 'after-review'; opts.explicit_authority = false;
  assert.equal(planProjectBootstrap({ ...opts, content: Buffer.from('') }).status, 'proposal');
  assert.equal(planProjectBootstrap({ ...opts, policy_authorized: true, convention_sync_completed: true, content: Buffer.from('') }).status, 'ready');
});

test('cooperative lock and overlapping writers cannot overwrite a newer managed version', async t => {
  const root = await sandbox(t), target = path.join(root, 'AGENTS.md');
  await fs.writeFile(target, '# Human\n');
  const expected_hash = bootstrapHash(await fs.readFile(target));
  await fs.writeFile(target + '.sdcorejs.lock', 'another owner');
  const locked = await applyProjectBootstrap({ ...options(), root, expected_hash });
  assert.match(locked.reasons.join(' '), /another cooperative writer/);
  assert.equal(await fs.readFile(target + '.sdcorejs.lock', 'utf8'), 'another owner');
  await fs.unlink(target + '.sdcorejs.lock');
  const results = await Promise.all([1, 2].map(() => applyProjectBootstrap({ ...options(), root, expected_hash })));
  assert.equal(results.filter(x => x.status === 'written').length, 1);
  assert.equal(results.filter(x => x.status === 'proposal').length, 1);
  assert.deepEqual((await fs.readdir(root)).filter(x => x.includes('.sdcorejs')), []);
});

test('managed replacement preserves a trailing human section and rejects future template versions', async t => {
  const root = await sandbox(t), target = path.join(root, 'AGENTS.md');
  const planned = planProjectBootstrap({ ...options(), content: Buffer.from('# Before\n') });
  const original = Buffer.concat([planned.content, Buffer.from('\n# After\nKeep my instruction.\n')]);
  await fs.writeFile(target, original);
  const result = await applyProjectBootstrap({ ...options(), root, expected_hash: bootstrapHash(original) });
  assert.equal(result.status, 'unchanged'); assert.deepEqual(await fs.readFile(target), original);
  const future = Buffer.from(original.toString().replace('template version 1.', 'template version 2.'));
  await fs.writeFile(target, future);
  assert.equal((await applyProjectBootstrap({ ...options(), root, expected_hash: bootstrapHash(future) })).status, 'proposal');
  assert.deepEqual(await fs.readFile(target), future);
});

test('a noncooperating edit after rename is disclosed and never rolled back over the editor', async t => {
  const root = await sandbox(t), target = path.join(root, 'AGENTS.md');
  const rename = fs.rename;
  // Fault injection at the filesystem boundary, after a real successful rename.
  fs.rename = async (...args) => { await rename(...args); await fs.writeFile(target, '# External editor\n'); };
  try {
    const result = await applyProjectBootstrap({ ...options(), root, expected_hash: bootstrapHash('') });
    assert.equal(result.status, 'verification-failed');
    assert.equal(result.write_performed, true);
    assert.equal(await fs.readFile(target, 'utf8'), '# External editor\n');
  } finally { fs.rename = rename; }
});
