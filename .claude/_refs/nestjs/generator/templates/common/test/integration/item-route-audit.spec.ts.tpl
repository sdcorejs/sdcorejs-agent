import assert from 'node:assert/strict';
import test from 'node:test';
import { auditItemControllerRoutes, ITEM_ROUTES } from '../../src/items/item-route-audit';

test('route audit has unique explicit protected routes with permission metadata', () => {
  const identities = ITEM_ROUTES.map((route) => `${route.method} ${route.path}`);
  assert.equal(new Set(identities).size, identities.length);
  assert.equal(ITEM_ROUTES.every((route) => route.protected && route.permission.length > 0), true);
  const actual = auditItemControllerRoutes();
  assert.deepEqual(
    actual.map((route) => `${route.method} ${route.path}`).sort(),
    identities.sort(),
  );
  for (const expected of ITEM_ROUTES) {
    const route = actual.find((candidate) => candidate.method === expected.method && candidate.path === expected.path);
    assert.equal(route?.protected, true, `${expected.method} ${expected.path} missing authentication/policy guards`);
    assert.equal(route?.permission, expected.permission);
    if (expected.validators.length > 0) assert.ok((route?.validators.length ?? 0) > 0, `${expected.method} ${expected.path} missing validation pipe`);
  }
});
