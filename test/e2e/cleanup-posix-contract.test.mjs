import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdir, mkdtemp, realpath, lstat, rm, writeFile, truncate } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { validateCleanupPosixBoundary, validateCleanupMaintenance, cleanupFingerprint, validateCleanupPlan,
  approveCleanupPlan, approveCleanupPolicy, cleanupActionAuthorized, approveCleanupRestore } from '../../_refs/cleanup/cleanup-contract.mjs';
import { inspectCleanupPosixCapabilities } from '../../_refs/cleanup/posix-file-operation.mjs';

export function maintenance(root = '/home/fixture/repository') {
  return { root_id: root, task_id: 'fixture-task', generation: 'fixture-epoch-1', source: 'conversation', owner: 'fixture-owner',
    attestation: 'The fixture producer is finished; its children and all writable descriptors are closed. No other writer is admitted.',
    participants: [{ id: 'fixture-producer', state: 'quiescent', evidence: 'Fixture setup completed and its descriptors were closed.', writable_descriptors_closed: true, children_quiescent: true }],
    fence_path: '.sdcorejs/tmp/cleanup-runtime/posix-maintenance.lock' };
}
export function boundary() {
  const root = '/home/fixture/repository';
  return { version: 'posix-maintenance-v1', root_id: root, maintenance: maintenance(root),
    python: { executable: '/usr/bin/python3.11', version: '3.11.9', sha256: 'a'.repeat(64) }, helper_sha256: 'b'.repeat(64),
    profile: { platform: 'linux', architecture: 'x64', filesystem: 'ext4', primitive: 'renameat2', os_release: 'fixture-kernel' } };
}

test('POSIX admission requires scoped owner, participant and descriptor evidence rather than a producer boolean', () => {
  assert.equal(validateCleanupMaintenance(maintenance(), maintenance()), true);
  for (const change of [
    value => { value.attestation = ''; }, value => { value.owner = ''; }, value => { value.source = 'discovery'; },
    value => { value.participants = []; }, value => { value.participants[0].state = 'active'; },
    value => { value.participants[0].evidence = ''; }, value => { value.participants[0].writable_descriptors_closed = false; },
    value => { value.participants[0].children_quiescent = false; }, value => { value.fence_path = 'other.lock'; },
  ]) { const altered = maintenance(); change(altered); assert.throws(() => validateCleanupMaintenance(altered, altered), /MAINTENANCE/u); }
  const changed = maintenance(); changed.generation = 'new-epoch';
  assert.throws(() => validateCleanupMaintenance(maintenance(), changed), /MAINTENANCE_CHANGED/u);
});

test('POSIX boundary pins native runtime, helper, profile and maintenance identity without old approval fallback', () => {
  assert.equal(validateCleanupPosixBoundary(boundary(), boundary().root_id), true);
  for (const change of [
    value => { value.python.executable = 'python3'; }, value => { value.python.version = '3.10.9'; },
    value => { value.python.sha256 = 'caller-asserted'; }, value => { value.helper_sha256 = ''; },
    value => { value.profile.filesystem = 'nfs'; }, value => { value.profile.platform = 'darwin'; },
    value => { value.maintenance.root_id = '/other'; },
  ]) { const altered = boundary(); change(altered); assert.throws(() => validateCleanupPosixBoundary(altered, altered.root_id), /POSIX|MAINTENANCE/u); }
  assert.notEqual(cleanupFingerprint(boundary()), cleanupFingerprint({ ...boundary(), helper_sha256: 'c'.repeat(64) }));
});

test('unsupported hosts disclose missing native POSIX capability without running an interpreter', async () => {
  if (process.platform !== 'win32') return;
  const result = await inspectCleanupPosixCapabilities({ root: 'C:\\fixture', python: 'C:\\nonexistent\\python.exe' });
  assert.equal(result.supported, false);
  assert.equal(result.errors[0].code, 'POSIX_PLATFORM_UNSUPPORTED');
  assert.deepEqual(result.actual_command, []);
});

test('canonical helper has current hashable bytes and does not expose command-line test barriers', async () => {
  const source = await readFile(new URL('../../_refs/cleanup/safe-file-operation.py', import.meta.url));
  assert.match(createHash('sha256').update(source).digest('hex'), /^[a-f0-9]{64}$/u);
  assert.doesNotMatch(source.toString(), /--test-barriers|SKIP_SECURITY_CHECK/u);
});

function contractPlan() {
  const posix_boundary = boundary();
  const prefix = `.sdcorejs/tmp/cleanup-runtime/transactions/${'c'.repeat(64)}/cleanup-1/`;
  const action = { id: 'cleanup-1', path: '.sdcorejs/tmp/task/output.html', action: 'delete', destination: null, risk: 'LOW',
    protected: false, unknowns: [], owner: 'fixture-owner', fingerprint: `sha256:${'d'.repeat(64)}`,
    state_fingerprint: `sha256:v1:${'e'.repeat(64)}`, restore_strategy: 'reproduce exact synthetic fixture',
    verification: ['check exact fixture path'], reasons: ['positive fixture ownership'], evidence: ['producer finished'],
    task_owned: true, reproducible: true, producer_finished: true, needed_for_evidence: false,
    posix_transaction: { capture: `${prefix}captured`, journal: `${prefix}journal.ndjson`, recovery: `${prefix}recovery` } };
  const payload = { schema_version: 1, root_id: posix_boundary.root_id, posix_boundary,
    task: { id: posix_boundary.maintenance.task_id, status: 'completed', durable_finalized: true },
    state: { fingerprint: `sha256:v1:${'f'.repeat(64)}` }, actions: [action] };
  return { ...payload, plan_id: cleanupFingerprint(payload) };
}

test('pure POSIX authority contract excludes old policies and stale boundary approvals', () => {
  const plan = contractPlan(), action = plan.actions[0];
  assert.equal(validateCleanupPlan(plan), true);
  const argumentsForPolicy = { root_id: plan.root_id, task_id: plan.task.id, paths: [action.path], source: 'conversation', decision: 'approve' };
  assert.equal(cleanupActionAuthorized({ plan, action, policy: approveCleanupPolicy(argumentsForPolicy) }), false);
  const policy = approveCleanupPolicy({ ...argumentsForPolicy, posix_boundary: plan.posix_boundary });
  assert.equal(cleanupActionAuthorized({ plan, action, policy }), true);
  const approval = approveCleanupPlan(plan, { source: 'conversation', decision: 'approve', authority: 'mutation', action_ids: [action.id] });
  assert.equal(cleanupActionAuthorized({ plan, action, approval }), true);
  const changed = structuredClone(plan);
  changed.posix_boundary.maintenance.generation = 'new-window';
  const { plan_id, ...payload } = changed; changed.plan_id = cleanupFingerprint(payload);
  assert.equal(cleanupActionAuthorized({ plan: changed, action: changed.actions[0], approval }), false);
  assert.equal(cleanupActionAuthorized({ plan: changed, action: changed.actions[0], policy }), false);
  changed.actions[0].posix_transaction.capture = '../unexpected';
  const { plan_id: alteredId, ...altered } = changed; changed.plan_id = cleanupFingerprint(altered);
  assert.throws(() => validateCleanupPlan(changed), /INVALID_POSIX_TRANSACTION/u);
});

test('pure restore authority binds a fresh maintenance window to the exact recovery receipt', () => {
  const receipt = { root_id: boundary().root_id, receipt_id: `sha256:v1:${'d'.repeat(64)}`, posix_boundary: boundary() };
  const current = boundary(); current.maintenance.generation = 'separate-restore-window';
  const approval = approveCleanupRestore(receipt, { source: 'conversation', decision: 'approve', authority: 'restore', posix_boundary: current });
  assert.equal(approval.receipt_id, receipt.receipt_id);
  assert.equal(approval.posix_boundary_fingerprint, cleanupFingerprint(current));
  current.maintenance.generation = 'later-window';
  assert.notEqual(approval.posix_boundary_fingerprint, cleanupFingerprint(current));
  assert.equal(approval.posix_boundary.maintenance.generation, 'separate-restore-window');
});

// These isolated children force real BigIntStats on every host. They exercise the
// public read-only APIs and numeric boundary, not Linux/macOS native operations.
const bigintInventoryProgram = String.raw`
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { syncBuiltinESMExports } from 'node:module';
import { createHash } from 'node:crypto';
import path from 'node:path';
const [root, engineURL, scenario] = process.argv.slice(1);
const originalLstat = fs.lstat;
let syntheticSize = null;
let numberStats = false;
fs.lstat = async (target, options) => {
  const observed = await originalLstat(target, { ...options, bigint: !numberStats });
  if (syntheticSize !== null && path.basename(String(target)) === 'ordinary.html') observed.size = syntheticSize;
  return observed;
};
syncBuiltinESMExports();
const { scanCleanup, captureCleanupState } = await import(engineURL);
const input = { root, scope: ['.sdcorejs/tmp/task'], reference_scope: ['src'] };
if (scenario === 'ordinary') {
  const observed = await originalLstat(path.join(root, '.sdcorejs/tmp/task/ordinary.html'), { bigint: true });
  const bytes = await fs.readFile(path.join(root, '.sdcorejs/tmp/task/ordinary.html'));
  const fingerprint = 'sha256:' + createHash('sha256').update(bytes).digest('hex');
  const captured = await captureCleanupState(input);
  const record = captured.inventory.find(file => file.path.endsWith('/ordinary.html'));
  assert.equal(record.fingerprint, fingerprint);
  assert.equal(record.state.size, bytes.length);
  assert.equal(typeof record.state.size, 'number');
  for (const field of ['ino', 'dev', 'mtime_ns', 'ctime_ns']) {
    const originalField = field === 'mtime_ns' ? 'mtimeNs' : field === 'ctime_ns' ? 'ctimeNs' : field;
    assert.equal(record.state[field], observed[originalField].toString());
    assert.equal(typeof record.state[field], 'string');
  }
  assert.equal(captured.references.length, 1);
  assert.match(captured.references[0].fingerprint, /^sha256:[a-f0-9]{64}$/);
  const analysis = await scanCleanup(input);
  assert.equal(analysis.state.inventory[0].fingerprint, fingerprint);
  assert.doesNotThrow(() => JSON.stringify(captured));
  assert.doesNotThrow(() => JSON.stringify(analysis));
} else if (scenario === 'budget') {
  const captured = await captureCleanupState(input);
  const first = captured.inventory.find(file => file.path.endsWith('/a.bin'));
  const aggregateLimited = captured.inventory.find(file => file.path.endsWith('/b.bin'));
  const individuallyLimited = captured.inventory.find(file => file.path.endsWith('/c.bin'));
  assert.match(first.fingerprint, /^sha256:[a-f0-9]{64}$/);
  assert.equal(first.state.size, 16 * 1024 * 1024);
  for (const record of [aggregateLimited, individuallyLimited]) {
    assert.equal(record.fingerprint, null);
    assert.deepEqual(record.unknowns, ['file or aggregate exceeds bounded hashing limit']);
  }
  assert.equal(captured.references.length, 1);
  const analysis = await scanCleanup(input);
  assert.equal(analysis.state.inventory.find(file => file.path.endsWith('/b.bin')).fingerprint, null);
} else if (scenario === 'unrepresentable') {
  // Synthetic external stat sizes exercise unreachable-on-small-fixture bounds.
  // No oversized real file or native filesystem behavior is claimed here.
  for (const size of [BigInt(Number.MAX_SAFE_INTEGER) + 1n, -1n]) {
    numberStats = false; syntheticSize = size;
    await assert.rejects(captureCleanupState(input), /UNREPRESENTABLE_FILE_SIZE/);
    await assert.rejects(scanCleanup(input), /UNREPRESENTABLE_FILE_SIZE/);
  }
  for (const size of [Number.MAX_SAFE_INTEGER + 1, -1, 0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    numberStats = true; syntheticSize = size;
    await assert.rejects(captureCleanupState(input), /UNREPRESENTABLE_FILE_SIZE/);
    await assert.rejects(scanCleanup(input), /UNREPRESENTABLE_FILE_SIZE/);
  }
} else {
  throw new Error('UNKNOWN_REGRESSION_SCENARIO');
}
process.stdout.write(JSON.stringify({ scenario, result: 'PASS', native_os_proof: false }) + '\n');
`;

async function inventoryRegression(t, scenario) {
  const parent = await realpath(tmpdir());
  const root = await realpath(await mkdtemp(path.join(parent, 'sdcorejs-bigint-inventory-')));
  t.after(async () => {
    assert.equal(path.dirname(root), parent);
    assert.match(path.basename(root), /^sdcorejs-bigint-inventory-/u);
    assert.equal((await lstat(root)).isSymbolicLink(), false);
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(path.join(root, '.sdcorejs/tmp/task'), { recursive: true });
  await mkdir(path.join(root, 'src'));
  await writeFile(path.join(root, '.sdcorejs/tmp/task/ordinary.html'), 'ordinary synthetic fixture');
  await writeFile(path.join(root, 'src/current.js'), 'export const current = true;');
  if (scenario === 'budget') {
    for (const [name, size] of [['a.bin', 16 * 1024 * 1024], ['b.bin', 16 * 1024 * 1024 + 1], ['c.bin', 32 * 1024 * 1024 + 1]]) {
      const file = path.join(root, '.sdcorejs/tmp/task', name);
      await writeFile(file, '');
      await truncate(file, size);
    }
  }
  const engineURL = new URL('../../_refs/cleanup/cleanup-engine.mjs', import.meta.url).href;
  const { stdout, stderr } = await promisify(execFile)(process.execPath,
    ['--input-type=module', '--eval', bigintInventoryProgram, root, engineURL, scenario],
    { windowsHide: true, timeout: 30_000, maxBuffer: 1024 * 1024 });
  assert.equal(stderr, '');
  assert.deepEqual(JSON.parse(stdout), { scenario, result: 'PASS', native_os_proof: false });
}

test('read-only inventory handles real BigIntStats while preserving lossless identity', t => inventoryRegression(t, 'ordinary'));
test('read-only BigInt inventory enforces per-file and aggregate hashing budgets', t => inventoryRegression(t, 'budget'));
test('read-only inventory refuses unrepresentable sizes before numeric accounting', t => inventoryRegression(t, 'unrepresentable'));
