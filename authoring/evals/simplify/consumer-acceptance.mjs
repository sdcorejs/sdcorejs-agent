// Run directly, with an optional copy of the synthetic consumer as the argument.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const entry = process.argv[2]
  ? pathToFileURL(resolve(process.argv[2], 'src/imports/invoice.mjs'))
  : new URL('./consumer/src/imports/invoice.mjs', import.meta.url);
const { readInvoice } = await import(entry);

test('omitting the field preserves the previous result shape', () => {
  assert.deepEqual(readInvoice({ invoice: 'I-1' }), { invoice: 'I-1' });
});

test('a valid value follows billing normalization', () => {
  assert.deepEqual(readInvoice({ invoice: 'I-1', orderCode: ' so-007 ' }), {
    invoice: 'I-1',
    orderCode: 'SO-007',
  });
});

test('a present but invalid value preserves the domain error contract', () => {
  for (const orderCode of ['', 'SO-7', null, undefined]) {
    assert.throws(() => readInvoice({ invoice: 'I-1', orderCode }), {
      name: 'TypeError',
      message: 'Invalid sales order',
    });
  }
});
