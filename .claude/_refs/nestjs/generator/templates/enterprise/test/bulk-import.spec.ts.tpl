import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { executeImport, validateImport } from '../src/items/item-import';
import { FileImportOperationStore, InMemoryImportOperationStore } from '../src/items/item-import-store';

const tenantScope = { tenantCode: 'tenant-a' };

test('import is bounded, sanitized, and deduplicated', () => {
  const result = validateImport(
    [{ name: '=FORMULA' }, { name: '=FORMULA' }],
    { maxRows: 2, maxBytes: 1024, payloadBytes: 32, idempotencyKey: 'import-1', scope: tenantScope },
  );
  assert.equal(result[0]?.name, "'=FORMULA");
  assert.equal(result[1]?.code, 'duplicate');
  assert.throws(() => validateImport([{ name: 'a' }, { name: 'b' }], { maxRows: 1, maxBytes: 1024, payloadBytes: 32, idempotencyKey: 'import-2', scope: tenantScope }), /max-rows/u);
  assert.throws(
    () => validateImport([{ name: 'a' }], { maxRows: 1, maxBytes: 4, payloadBytes: 5, idempotencyKey: 'import-3', scope: tenantScope }),
    (error: unknown) => Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'import.max-bytes'),
  );
});

test('repeated import idempotency key replays the stored result across calls', async () => {
  const store = new InMemoryImportOperationStore();
  const options = {
    maxRows: 2,
    maxBytes: 1024,
    payloadBytes: 16,
    idempotencyKey: 'import-replay',
    scope: { tenantCode: 'tenant-a' },
  };
  const first = await executeImport(store, [{ name: 'first' }], options);
  const replay = await executeImport(store, [{ name: 'first' }], options);
  assert.deepEqual(replay, first);
});

test('idempotency is isolated by tenant and rejects key reuse with a different request', async () => {
  const store = new InMemoryImportOperationStore();
  const base = { maxRows: 2, maxBytes: 1024, payloadBytes: 16, idempotencyKey: 'shared-operation-key' };
  const tenantA = await executeImport(store, [{ name: 'tenant-a-row' }], { ...base, scope: { tenantCode: 'tenant-a' } });
  const tenantB = await executeImport(store, [{ name: 'tenant-b-row' }], { ...base, scope: { tenantCode: 'tenant-b' } });
  assert.equal(tenantA[0]?.name, 'tenant-a-row');
  assert.equal(tenantB[0]?.name, 'tenant-b-row');
  await assert.rejects(
    executeImport(store, [{ name: 'changed-row' }], { ...base, scope: { tenantCode: 'tenant-a' } }),
    /idempotency-conflict/u,
  );
});

test('concurrent same-scope retries execute once and replay one result', async () => {
  const store = new InMemoryImportOperationStore();
  const options = {
    maxRows: 2,
    maxBytes: 1024,
    payloadBytes: 16,
    idempotencyKey: 'concurrent-operation',
    scope: { tenantCode: 'tenant-a', departmentCode: 'department-a' },
  };
  const [first, second] = await Promise.all([
    executeImport(store, [{ name: 'same-row' }], options),
    executeImport(store, [{ name: 'same-row' }], options),
  ]);
  assert.deepEqual(second, first);
  assert.equal(store.executions, 1);
});

test('file-backed operation state survives provider restart', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'sdcorejs-import-state-'));
  const options = {
    maxRows: 2,
    maxBytes: 1024,
    payloadBytes: 16,
    idempotencyKey: 'persistent-operation',
    scope: { tenantCode: 'tenant-a' },
  };
  try {
    const first = await executeImport(new FileImportOperationStore(directory), [{ name: 'persisted-row' }], options);
    const replay = await executeImport(new FileImportOperationStore(directory), [{ name: 'persisted-row' }], options);
    assert.deepEqual(replay, first);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
