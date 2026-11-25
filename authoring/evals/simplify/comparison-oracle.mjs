// Executed only by the verifier, with the finished project mounted read-only.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import http from 'node:http';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [id, project] = process.argv.slice(2);
if (id === 'G') {
  for (const ext of ['ndjson','jsonl']) {
    const input = '/tmp/records.' + ext;
    const run = () => spawnSync(process.execPath, [path.join(project, 'import.mjs'), input], { encoding: 'utf8' });
    await writeFile(input, '{"one":1}\n\n{"two":2}\n');
    const valid = run();
    assert.equal(valid.status, 0, valid.stderr);
    assert.deepEqual(JSON.parse(valid.stdout), [{one:1}, {two:2}]);
    await writeFile(input, '{incomplete');
    assert.notEqual(run().status, 0);
  }
  const other = '/tmp/records.txt';
  await writeFile(other, '{"one":1}\n');
  const unknown = spawnSync(process.execPath, [path.join(project, 'import.mjs'), other]);
  assert.ifError(unknown.error);
  assert.notEqual(unknown.status, 0);
} else if (id === 'H') {
  const { formatTicket } = await import(pathToFileURL(path.join(project, 'format.mjs')));
  // Establish the contract independently. A blind reviewer checks the actual
  // examples, including variables, shell invocations and prose transcripts.
  assert.equal(formatTicket(' tk-013 '), 'TK-013');
  for (const invalid of ['', 'bad!', null]) assert.throws(() => formatTicket(invalid), TypeError);
  console.log('Padded lowercase identifiers normalize to TK-NNN; invalid identifiers throw TypeError.');
} else if (id === 'Q') {
  const { refundCents } = await import(pathToFileURL(path.join(project, 'refund/amount.mjs')));
  assert.equal(refundCents(90, 20), 20);
} else if (id === 'I') {
  const { chromium } = await import('/runner/playwright/index.mjs');
  const server = http.createServer(async (req, res) => {
    const filename = path.resolve(project, '.' + new URL(req.url, 'http://localhost').pathname);
    if (filename !== project && !filename.startsWith(project+'/')) { res.writeHead(403).end(); return; }
    try {
      const file = filename === project ? path.join(project, 'index.html') : filename;
      const mime = {'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css'}[path.extname(file)];
      res.writeHead(200, { 'content-type': mime || 'application/octet-stream' }).end(await readFile(file));
    } catch { if (!res.headersSent) res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    const executablePath = existsSync('/usr/lib/chromium/chromium') ? '/usr/lib/chromium/chromium' : '/usr/bin/chromium';
    browser = await chromium.launch({ executablePath, args: ['--no-sandbox','--disable-dev-shm-usage'] });
    const page = await browser.newPage();
    page.setDefaultTimeout(3500);
    await page.goto('http://127.0.0.1:'+server.address().port);
    const name = page.getByLabel(/customer name/i);
    const date = page.getByLabel(/delivery date/i);
    await name.fill('Alex');
    let selected;
    if (await date.getAttribute('type') === 'date') {
      selected = '2027-03-15';
      await date.fill(selected);
    } else {
      await date.click();
      const open = page.getByRole('button', {name:/open calendar|choose (a )?date|show calendar/i}).first();
      if (await open.isVisible()) await open.click();
      const day = page.locator('[role="gridcell"] button:enabled, button[data-date], [role="option"], [role="gridcell"]:not([aria-disabled="true"])')
        .filter({hasText:/\b15\b/}).first();
      await day.click();
      selected = await date.inputValue();
      assert.ok(selected, 'Picking a calendar day populates the existing field');
    }
    await page.getByRole('button',{name:/save/i}).click();
    await page.reload();
    assert.equal(await name.inputValue(),'Alex');
    assert.equal(await date.inputValue(),selected);
    if (await date.isEditable()) await date.fill('');
    else await page.getByRole('button',{name:/clear.*date|remove.*date/i}).click();
    await page.getByRole('button',{name:/save/i}).click();
    await page.reload();
    assert.equal(await name.inputValue(),'Alex');
    assert.equal(await date.inputValue(),'');
  } finally { await browser?.close(); server.close(); }
} else {
  throw new Error('Unknown fixture: ' + id);
}
