import test from 'node:test';
import assert from 'node:assert/strict';
import { createPageSource, collectCustomers, loadCustomers, loadConfiguredCustomers, createBoundedDomainSource, visibleCustomerPage, customerCount, customerPreview } from './fixtures/review-behavior/paging.mjs';
import { startProtectionServer } from './fixtures/review-behavior/protection-server.mjs';
import { inheritedDetail, exemptedDetail } from './fixtures/review-behavior/protection-inheritance.mjs';

test('inherited global/controller protection works without method guards; public override bypasses it', () => {
  const customer = { id: 1, tenant: 'a', ownerId: 'alice' };
  for (const identity of [null, { id: 'alice', tenant: 'b' }, { id: 'bob', tenant: 'a' }]) {
    assert.deepEqual(inheritedDetail({ identity, customer }), { status: 403 });
    assert.deepEqual(exemptedDetail({ identity, customer }), { status: 200, body: customer });
  }
  assert.deepEqual(inheritedDetail({ identity: { id: 'alice', tenant: 'a' }, customer }), { status: 200, body: customer });
});

test('complete-data assertions catch the last missing record beyond the literal cap', async () => {
  for (const count of [0, 1, 999, 1000, 1001]) {
    const rows = await collectCustomers(createPageSource(count));
    assert.deepEqual(rows.map(x => x.id), Array.from({ length: count }, (_, i) => i));
    const first = await loadCustomers(createPageSource(count));
    assert.equal(first.length, Math.min(count, 1000));
    if (count === 1001) assert.equal(first.some(x => x.id === 1000), false);
  }
});
test('server clamp, absent/stale total and cursors cannot silently truncate', async () => {
  for (const total of [undefined, 2, 9000]) for (const cursor of [false, true]) {
    assert.equal((await collectCustomers(createPageSource(1001, { clamp: 73, total, cursor }), { cursor })).at(-1).id, 1000);
  }
  assert.equal((await customerPreview(createPageSource(1001))).truncated, true);
});

test('completeness boundaries follow configured and server-enforced caps', async () => {
  for (const [pageSize, clamp] of [[73, Infinity], [2000, Infinity], [2000, 73]]) {
    const bound = Math.min(pageSize, clamp);
    for (const count of [bound - 1, bound, bound + 1]) {
      const first = await loadConfiguredCustomers(createPageSource(count, { clamp }), { pageSize });
      assert.equal(first.length, Math.min(count, bound));
      assert.equal(first.some(row => row.id === count - 1), count <= bound);
      const complete = await collectCustomers(createPageSource(count, { clamp }));
      assert.deepEqual(complete.map(row => row.id), Array.from({ length: count }, (_, id) => id));
    }
  }
});
test('later errors, cancellation, unstable ordering and missing completion fail closed', async () => {
  await assert.rejects(collectCustomers(createPageSource(1001, { failPage: 2 })), /later page/);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(collectCustomers(createPageSource(1), { signal: controller.signal }), { name: 'AbortError' });
  await assert.rejects(collectCustomers(async () => ({ items: [{ id: 1 }], hasMore: true })), /duplicate/);
  await assert.rejects(collectCustomers(async () => ({ items: [{ id: 2 }, { id: 1 }], hasMore: false })), /unstable ordering/);
  await assert.rejects(collectCustomers(async () => ({ items: [] })), /completion/);
  await assert.rejects(collectCustomers(async () => ({ items: [], hasMore: true })), /without progress/);
  await assert.rejects(collectCustomers(createPageSource(1001), { maxPages: 1 }), /budget/);
  let id = 0;
  await assert.rejects(collectCustomers(async () => ({ items: [{ id: id++ }], hasMore: true, nextCursor: 'same' }), { cursor: true }), /cursor progress/);
  const midway = new AbortController();
  await assert.rejects(collectCustomers(async () => { midway.abort(); return { items: [{ id: 0 }], hasMore: false }; }, { signal: midway.signal }), { name: 'AbortError' });
});
test('a named/configured cap still truncates; real domain bounds, pages and aggregates are controls', async () => {
  assert.equal((await loadConfiguredCustomers(createPageSource(1001))).length, 1000);
  assert.equal((await loadConfiguredCustomers(createPageSource(1001), { pageSize: 1000 })).some(x => x.id === 1000), false);
  assert.throws(() => createBoundedDomainSource(1001), /domain cardinality/);
  assert.equal((await loadCustomers(createBoundedDomainSource(1000))).length, 1000);
  const first = await visibleCustomerPage(createPageSource(21), 1);
  assert.equal(first.nextPage, 2);
  assert.equal((await visibleCustomerPage(createPageSource(21), 2)).items[0].id, 20);
  assert.equal(await customerCount(async () => ({ count: 1001 })), 1001);
});
test('real HTTP checks enforce authentication, permission, owner and tenant independently of UI', async () => {
  for (const enforce of [true, false]) {
    const server = await startProtectionServer({ enforce });
    try {
      for (const [identity, method, expected] of [[null, 'GET', 401], ['bob', 'GET', 403], ['eve', 'GET', 403], ['reader', 'DELETE', 403], ['alice', 'DELETE', 200], ['reader', 'GET', 200]]) {
        const response = await fetch(server.url, { method, headers: identity ? { 'x-fixture-identity': identity } : {} });
        assert.equal(response.status, enforce ? expected : 200);
        const body = await response.json();
        if (enforce && expected !== 200) assert.equal(body.id, undefined);
      }
    } finally { await server.close(); }
  }
});
