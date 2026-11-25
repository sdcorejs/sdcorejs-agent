// Run outside a disposable consumer. Keep these assertions hidden during the trial.
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const root = process.argv[2];
if (!root) throw new Error('Pass the path to the decisions trial project');
const load = path => import(pathToFileURL(resolve(root, path)));

test('B: ledger and display preserve their distinct tie contracts', async () => {
  const { displayedCents } = await load('prices/display.mjs');
  const { postedCents } = await load('prices/ledger.mjs');
  assert.deepEqual([3, 5, 7].map(displayedCents), [2, 3, 4]);
  assert.deepEqual([3, 5, 7].map(postedCents), [2, 2, 4]);
});

test('C: only reconciliation normalizes the user filter', async () => {
  const { includeRow } = await load('features/reconciliation/filter.mjs');
  const { matchesStatus } = await load('shared/status.mjs');
  const row = { status: 'paid' };
  assert.equal(includeRow(row, '  PAid  '), true);
  assert.equal(includeRow(row, ' pending '), false);
  assert.equal(includeRow({status: 'OPEN'}, 'OPEN'), true);
  assert.equal(matchesStatus(row, 'paid'), true);
  assert.equal(matchesStatus(row, 'PAID'), false);
  assert.equal(matchesStatus(row, ' paid '), false);
  assert.equal(matchesStatus(row, ' PAID '), false);
});

test('D: the JSON adapter inherits the established lifecycle on success and error', async () => {
  const { Reader } = await load('adapters/reader.mjs');
  const { JsonReader } = await load('adapters/json.mjs');
  assert.equal(JsonReader.prototype.read, Reader.prototype.read);
  assert.ok(new JsonReader() instanceof Reader);
  for (const payload of ['{"paid":false}', '{']) {
    const events = [];
    const port = { async open() {
      events.push('open');
      return {
        async text() { events.push('text'); return payload; },
        close() { events.push('close'); },
      };
    }};
    const result = new JsonReader().read(port);
    if (payload === '{') await assert.rejects(result, SyntaxError);
    else assert.deepEqual(await result, {paid: false});
    assert.deepEqual(events, ['open', 'text', 'close']);
  }
});

test('E: a read-only store and transaction-owned posting retain independent contracts', async () => {
  const { readHistory } = await load('handlers/history.mjs');
  const { postEntry } = await load('handlers/post.mjs');
  assert.equal(readHistory({read: id => 'read-' + id}, 7), 'read-7');
  const events = [];
  const store = { transaction(run) {
    events.push('transaction');
    return run({ post(id) { events.push(id); return 'posted'; } });
  }};
  assert.equal(postEntry(store, 7), 'posted');
  assert.deepEqual(events, ['transaction', 7]);
});

test('F: refund behavior survives both boundaries', async () => {
  const { refundCents } = await load('refund/amount.mjs');
  for (const [paid, request, expected] of [[11, -1, 0], [11, 0, 0], [11, 3, 3], [11, 11, 11], [11, 12, 11], [0, 5, 0]]) {
    assert.equal(refundCents(paid, request), expected);
  }
});
