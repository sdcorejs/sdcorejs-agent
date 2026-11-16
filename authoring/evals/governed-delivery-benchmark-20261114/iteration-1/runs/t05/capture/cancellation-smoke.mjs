import assert from 'node:assert/strict';
import { canCancel } from '../target/src/order.mjs';

const cases = [
  ['operator', 'draft', true],
  ['operator', 'submitted', false],
  ['administrator', 'draft', false],
  ['administrator', 'submitted', false],
  ['viewer', 'draft', false],
  [undefined, 'draft', false],
  ['operator', undefined, false],
  ['operator', 'cancelled', false],
];
for (const [role, state, expected] of cases) {
  const actual = canCancel(role, state);
  assert.equal(actual, expected);
  console.log(JSON.stringify({role: role ?? null, state: state ?? null, expected, actual}));
}
console.log('Passed 8 supplemental predicate checks. These are not persisted application tests or cancellation workflow evidence.');
