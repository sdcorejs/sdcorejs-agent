import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { evaluateUiHandoffEvidence } from '../../../_refs/shared/validation-map.mjs';

const { SDCOREJS_PLAYWRIGHT_MODULE: modulePath, SDCOREJS_CHROMIUM_PATH: executablePath } = process.env;
assert.ok(process.argv[2] && modulePath && executablePath, 'Supply an output directory and existing Playwright and Chromium paths');
const output = resolve(process.argv[2]);
await mkdir(output);
const { chromium } = await import(pathToFileURL(resolve(modulePath)).href);
const viewport = { width: 1200, height: 800 };
const origin = 'https://fixture.test';
const fixture = (route, drift) => `<!doctype html><meta charset="utf-8">
<style>
body{margin:0}.shell{display:flex}.sidebar{width:240px;flex:none}main{min-width:0;flex:1}
.row{display:${drift ? 'block' : 'flex'};align-items:center;gap:8px}
.row p,.row button{box-sizing:border-box;height:30px;margin:0}
.chat{display:block;width:${drift ? '60%' : '100%'};border:0;height:44px;background:transparent;text-align:left}
.chat:hover,.chat[aria-pressed="true"]{background:rgb(220,230,245);border-radius:${drift ? 0 : 8}px}
</style><div class="shell"><aside class="sidebar">Projects</aside><main>
${route === '/test-cases' ? `<div class="row"><p>Access check</p>
<button aria-expanded="false">Expand</button></div><p id="details" hidden>Expected access check details</p>
<script>document.querySelector('button').onclick=event=>{
document.querySelector('#details').hidden=false;event.target.setAttribute('aria-expanded','true');};</script>`
 : `<button class="chat" aria-pressed="false">Session A</button><p id="details" hidden>Session A open</p>
<script>document.querySelector('button').onclick=event=>{
document.querySelector('#details').hidden=false;event.target.setAttribute('aria-pressed','true');};</script>`}
</main></div>`;

const browser = await chromium.launch({ executablePath: resolve(executablePath), headless: true, args: ['--no-sandbox'], timeout: 15000 });
try {
  const context = await browser.newContext({ viewport });
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin || !['/test-cases', '/sessions'].includes(url.pathname)) return route.abort();
    return route.fulfill({ contentType: 'text/html', body: fixture(url.pathname, url.searchParams.get('layout') === 'drift') });
  });
  const page = await context.newPage();
  const records = [];
  const layout = async () => page.evaluate(() => {
    const main = document.querySelector('main').getBoundingClientRect();
    const button = document.querySelector('button');
    const rect = button.getBoundingClientRect();
    const title = document.querySelector('.row p')?.getBoundingClientRect();
    const css = getComputedStyle(button);
    return { width: main.width, inline: title ? Math.abs(title.top - rect.top) < 1 : null,
      full_row_background: css.backgroundColor === 'rgb(220, 230, 245)' && Math.abs(main.width - rect.width) < 1,
      corner_radius_px: Number.parseFloat(css.borderRadius), details_visible: !document.querySelector('#details').hidden };
  });
  const fingerprint = bytes => 'sha256:v1:' + createHash('sha256').update(bytes).digest('hex');
  for (const [route, screen] of [['/test-cases', 'Test cases'], ['/sessions', 'Chat sessions']]) {
    const source_ref = `fixture://approved${route}`;
    const source_hash = fingerprint(fixture(route, false));
    const current = { associated_HEAD_or_diff: 'diff:browser-fixture', config_fingerprint: fingerprint(JSON.stringify(viewport)),
      environment_fingerprint: fingerprint(browser.version()), ui_handoff_sources: { [source_ref]: source_hash } };
    const { ui_handoff_sources, ...freshness } = current;
    for (const drift of [false, true]) {
      await page.goto(origin + route + (drift ? '?layout=drift' : ''));
      const button = page.getByRole('button');
      const states = [];
      if (route === '/sessions') {
        await button.hover();
        states.push(['hover', await layout()]);
      }
      await button.click();
      assert.equal(await page.locator('#details').isVisible(), true, 'Click E2E must pass in both browser variants');
      if (route === '/sessions') await page.mouse.move(5, 5);
      states.push([route === '/sessions' ? 'selected' : 'expanded', await layout()]);
      for (const [state, actual] of states) {
        const expected = route === '/sessions'
          ? { full_row_background: true, corner_radius_px: 8 }
          : { inline: true, details_visible: true };
        assert.equal(actual.width, 960);
        const sample = { screen, route, device: 'desktop', state: `sidebar open and ${state}`, content_width_css_px: actual.width };
        const target_id = `${route.slice(1)}-${state}`;
        const checkpoints = Object.entries(expected).map(([id, value]) => ({ id, expected: value }));
        const evidence_ref = `${target_id}-${drift ? 'drift' : 'approved'}.json`;
        const result = evaluateUiHandoffEvidence({
          handoff: { source_ref, source_hash, targets: [{ id: target_id, ...sample, checkpoints }] },
          current, comparisons: [{ ...freshness, ...sample, target_id, source_hash, kind: 'running-app', redactions_applied: true, evidence_ref,
            observations: checkpoints.map(({ id }) => ({ id, observed: actual[id] })) }],
        });
        assert.equal(result.ready, !drift, target_id);
        if (drift) assert.ok(result.blockers.some(issue => issue.code === 'UI_HANDOFF_CHECKPOINT_MISMATCH'));
        const record = { ...sample, variant: drift ? 'drift' : 'approved', click_passed: true, actual, result };
        await writeFile(join(output, evidence_ref), JSON.stringify(record, null, 2) + '\n');
        records.push(record);
      }
      await page.screenshot({ path: join(output, `${route.slice(1)}-${drift ? 'drift' : 'approved'}.png`) });
    }
  }
  console.log(JSON.stringify({ scope: 'local Chromium with routed synthetic fixture pages', browser: browser.version(),
    viewport, matched: records.filter(record => record.result.ready).length,
    blocked: records.filter(record => !record.result.ready).length,
    clicks_passed: 4, records: records.map(record => ({ route: record.route, state: record.state, variant: record.variant })) }, null, 2));
} finally {
  await browser.close();
}
