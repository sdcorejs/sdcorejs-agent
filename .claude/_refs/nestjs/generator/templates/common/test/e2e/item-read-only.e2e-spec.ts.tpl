import assert from 'node:assert/strict';
import test from 'node:test';
import { ITEM_ROUTES } from '../../src/items/item-route-audit';

test('route audit exposes only operations rendered for this project', () => {
{{#READ_ONLY}}  assert.equal(ITEM_ROUTES.some((route) => route.mutation), false);
{{/READ_ONLY}}{{#MUTATIONS}}  assert.equal(ITEM_ROUTES.some((route) => route.mutation), true);
{{/MUTATIONS}}  assert.equal(ITEM_ROUTES.every((route) => route.permission.length > 0), true);
});
