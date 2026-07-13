import assert from 'node:assert/strict';
import test from 'node:test';
import { ItemRepository } from '../src/items/item.repository';
import { streamItems } from '../src/items/item-export';
import { transitionItem } from '../src/items/item-workflow';

test('tenant A cannot search, detail, mutate, transition, export, report, infer, or claim tenant B data', async () => {
  const repository = new ItemRepository();
  const item = repository.create({ name: 'Tenant A' }, 'actor-a', { tenantCode: 'tenant-a' });
  const tenantB = { tenantCode: 'tenant-b' };
  assert.equal(repository.search(tenantB).length, 0);
  assert.equal(repository.detail(item.id, tenantB), undefined);
  assert.equal(repository.update(item.id, { name: 'forged', expectedVersion: 1 }, tenantB), undefined);
  await assert.rejects(
    transitionItem(repository, { verified: true, id: 'actor-a', tenantCode: 'tenant-b', permissions: ['items:admin'] }, item.id, 1, 'forged'),
    (error: unknown) => Boolean(error && typeof error === 'object' && 'code' in error && error.code === 'item.not-found'),
  );
  const chunks: string[] = [];
  for await (const chunk of streamItems(repository, { scope: tenantB, maxRows: 10, pageSize: 2 })) chunks.push(chunk);
  assert.deepEqual(chunks, ['id,name\n']);
  assert.deepEqual(repository.page(tenantB, undefined, 10).rows, []);
  assert.equal(repository.existsByName('Tenant A', tenantB), false);
  assert.equal(repository.claimBackground(item.id, tenantB), undefined);
});
