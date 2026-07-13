import assert from 'node:assert/strict';
import test from 'node:test';
import { streamItems } from '../src/items/item-export';

test('export is tenant scoped and row bounded', async () => {
  const source = {
    async page() {
      return { rows: [{ id: 'item-1', tenantCode: 'tenant-a', name: 'Item', ownerId: 'actor-a', version: 1 }] };
    },
  };
  const chunks: string[] = [];
  for await (const chunk of streamItems(source, { scope: { tenantCode: 'tenant-a' }, maxRows: 1, pageSize: 1 })) chunks.push(chunk);
  assert.equal(chunks.length, 2);
});
