import assert from 'node:assert/strict';
import test from 'node:test';
import { reconcilePermissions } from '../src/admin/permission-manifest';
import { roleUniqueKey } from '../src/admin/role-scope';

test('permission reconciliation detects stale codes', () => {
  const result = reconcilePermissions(['items:read', 'legacy:permission']);
  assert.deepEqual(result.stale, ['legacy:permission']);
});
test('role uniqueness distinguishes global tenant and department scope', () => {
  assert.notEqual(roleUniqueKey('admin', { kind: 'global' }), roleUniqueKey('admin', { kind: 'tenant', tenantCode: 'a' }));
  assert.notEqual(
    roleUniqueKey('admin', { kind: 'tenant', tenantCode: 'a' }),
    roleUniqueKey('admin', { kind: 'department', tenantCode: 'a', departmentCode: 'd' }),
  );
});
