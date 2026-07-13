import assert from 'node:assert/strict';
import test from 'node:test';
import { ItemRepository } from '../../src/items/item.repository';
import { ItemService } from '../../src/items/item.service';
{{#ENTERPRISE}}import { InMemoryImportOperationStore } from '../../src/items/item-import-store';{{/ENTERPRISE}}

test('service derives scope from actor and computes presentation capability', () => {
  const service = new ItemService(new ItemRepository(){{#ENTERPRISE}}, new InMemoryImportOperationStore(){{/ENTERPRISE}});
  const actor = {
    verified: true as const,
    id: 'actor-1',
    permissions: ['items:read', 'items:write'],
{{#ENTERPRISE}}    tenantCode: 'tenant-a',
{{/ENTERPRISE}}  };
  const created = service.create({ name: 'First item' }, actor);
  assert.equal(created.name, 'First item');
  assert.equal(created.editable, true);
  assert.equal(service.search(actor).length, 1);
});
