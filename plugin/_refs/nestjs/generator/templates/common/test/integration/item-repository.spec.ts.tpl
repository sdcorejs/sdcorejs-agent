import assert from 'node:assert/strict';
import test from 'node:test';
import { ItemRepository } from '../../src/items/item.repository';

test('repository search and detail honor the resolved profile scope', () => {
  const repository = new ItemRepository();
{{#SIMPLE}}  const scope = {};
{{/SIMPLE}}{{#ENTERPRISE}}  const scope = { tenantCode: 'tenant-a' };
{{/ENTERPRISE}}  const created = repository.create({ name: 'Scoped item' }, 'actor-1', scope);
  assert.equal(repository.search(scope).length, 1);
  assert.equal(repository.detail(created.id, scope)?.id, created.id);
});
