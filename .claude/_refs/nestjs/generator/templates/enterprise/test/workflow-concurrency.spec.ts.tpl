import assert from 'node:assert/strict';
import test from 'node:test';
import { Item } from '../src/items/item.entity';
import { transitionItem } from '../src/items/item-workflow';
import { Scope } from '../src/scope/scope-contract';

test('only one conflicting transition commits', async () => {
  let row: Item = { id: 'item-1', tenantCode: 'tenant-a', name: 'Initial', ownerId: 'actor-a', version: 1 };
  const store = {
    async detail() { return { ...row }; },
    async compareAndSwap(_id: string, _scope: Scope, expectedVersion: number, patch: Partial<Item>) {
      await new Promise((resolve) => setTimeout(resolve, 1));
      if (row.version !== expectedVersion) return false;
      row = { ...row, ...patch };
      return true;
    },
  };
  const actor = { verified: true as const, id: 'actor-a', tenantCode: 'tenant-a', permissions: ['items:write'] };
  const results = await Promise.allSettled([
    transitionItem(store, actor, row.id, 1, 'First'),
    transitionItem(store, actor, row.id, 1, 'Second'),
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(results.filter((result) => result.status === 'rejected').length, 1);
  const rejected = results.find((result) => result.status === 'rejected');
  assert.equal(rejected?.status === 'rejected' && rejected.reason?.code, 'item.version-conflict');
});
