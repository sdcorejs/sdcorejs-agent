import assert from 'node:assert/strict';
import test from 'node:test';
{{#SIMPLE}}import { RolePermissionAdapter } from '../../src/auth/role-permission-adapter';{{/SIMPLE}}
{{#ENTERPRISE}}import { assertCanMutate } from '../../src/items/item-policy';{{/ENTERPRISE}}

{{#SIMPLE}}
test('simple role adapter uses authenticated actor permissions', () => {
  const adapter = new RolePermissionAdapter();
  assert.equal(adapter.has({ verified: true, id: 'actor-1', permissions: ['items:read'] }, 'items:read'), true);
  assert.equal(adapter.has({ verified: true, id: 'actor-1', permissions: [] }, 'items:read'), false);
});
{{/SIMPLE}}
{{#ENTERPRISE}}
test('enterprise mutation policy denies another tenant before actor ownership', () => {
  assert.throws(() => assertCanMutate(
    { verified: true, id: 'owner-1', tenantCode: 'tenant-b', permissions: ['items:admin'] },
    { id: 'item-1', tenantCode: 'tenant-a', name: 'Item', ownerId: 'owner-1', version: 1 },
  ), /tenant/u);
});

test('enterprise mutation policy denies another required department', () => {
  assert.throws(() => assertCanMutate(
    { verified: true, id: 'owner-1', tenantCode: 'tenant-a', departmentCode: 'department-b', permissions: ['items:admin'] },
    { id: 'item-1', tenantCode: 'tenant-a', departmentCode: 'department-a', name: 'Item', ownerId: 'owner-1', version: 1 },
  ), /department/u);
});
{{/ENTERPRISE}}
