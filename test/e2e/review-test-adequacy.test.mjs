import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createPageSource, collectCustomers } from './fixtures/review-behavior/paging.mjs';
import { startProtectionServer } from './fixtures/review-behavior/protection-server.mjs';

async function proveComplete(loader) {
  const rows = await loader(createPageSource(1001));
  assert.equal(rows.length, 1001, 'all records must be present');
  assert.equal(rows.at(-1).id, 1000, 'final matching record must be present');
}
test('removing continuation is killed by output assertions, not request-shape checks', async () => {
  await proveComplete(collectCustomers);
  const source = await readFile(new URL('./fixtures/review-behavior/paging.mjs', import.meta.url), 'utf8');
  const mutant = source.replace('if (!result.hasMore) return items;', 'return items;');
  assert.notEqual(mutant, source);
  const loaded = await import('data:text/javascript;base64,' + Buffer.from(mutant).toString('base64'));
  await assert.rejects(proveComplete(loaded.collectCustomers), { code: 'ERR_ASSERTION' });
});
async function proveDenied(enforce) {
  const server = await startProtectionServer({ enforce });
  try {
    for (const identity of ['eve', 'bob', 'reader']) {
      const response = await fetch(server.url, { method: 'DELETE', headers: { 'x-fixture-identity': identity } });
      assert.equal(response.status, 403, 'server must deny unauthorized operation');
    }
  } finally { await server.close(); }
}
test('removing server enforcement is killed by real HTTP denial assertions', async () => {
  await proveDenied(true);
  await assert.rejects(proveDenied(false), { code: 'ERR_ASSERTION' });
});
