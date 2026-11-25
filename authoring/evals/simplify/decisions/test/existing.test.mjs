import assert from 'node:assert/strict';
import test from 'node:test';
import { displayedCents } from '../prices/display.mjs';
import { postedCents } from '../prices/ledger.mjs';
import { refundCents } from '../refund/amount.mjs';

test('displays and posts whole cents', () => {
  assert.equal(displayedCents(10), 5);
  assert.equal(postedCents(10), 5);
});

test('refunds an amount below the paid amount', () => {
  assert.equal(refundCents(90, 20), 20);
});
