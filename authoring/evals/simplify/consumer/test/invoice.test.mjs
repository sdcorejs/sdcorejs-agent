import assert from 'node:assert/strict';
import test from 'node:test';
import { billOrder } from '../src/billing/entry.mjs';
import { readInvoice } from '../src/imports/invoice.mjs';

test('imports an invoice without an order', () => {
  assert.deepEqual(readInvoice({ invoice: 'I-1' }), { invoice: 'I-1' });
});

test('billing reads a sales order', () => {
  assert.deepEqual(billOrder(' so-101 '), { orderCode: 'SO-101' });
});
