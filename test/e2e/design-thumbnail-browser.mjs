import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { renderThumbnailGallery } from '../../_refs/design/visual-library/gallery.mjs';
import { createExampleScreen } from '../../_refs/design/visual-library/compose-preview.mjs';
import { captureThumbnails } from '../../_refs/design/visual-library/capture-thumbnails.mjs';
import { resolveThumbnail } from '../../_refs/design/visual-library/thumbnails.mjs';
import { createPatternPreview, libraryRevision } from '../../_refs/design/visual-library/library.mjs';
import { renderStaticVisualScreen } from '../../_refs/sdlc/static-visual-composer.mjs';
import { renderLiveDocument } from '../../_refs/sdlc/visual-companion/live-document.mjs';
import { visualScreenDigest } from '../../_refs/design/visual-library/selection.mjs';
import { DEFAULT_MESSAGES } from '../../_refs/sdlc/visual-companion/renderer.mjs';

if(!process.argv[2]||!process.env.SDCOREJS_PLAYWRIGHT_MODULE||!process.env.SDCOREJS_CHROMIUM_PATH)throw new Error('Provide output, existing Playwright module and Chromium paths');
const output=resolve(process.argv[2]);await mkdir(output,{recursive:true});
const {chromium}=await import(pathToFileURL(process.env.SDCOREJS_PLAYWRIGHT_MODULE).href);
const browser=await chromium.launch({executablePath:process.env.SDCOREJS_CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
let assertions=0;const check=(v,m)=>{assert.ok(v,m);assertions++;};
const page=await browser.newPage({viewport:{width:1440,height:1000}}),requests=[],errors=[];
page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
async function open(name,html){await writeFile(join(output,name+'.html'),html);await page.goto('about:blank');await page.setContent(html);}
try{
  await open('gallery',renderThumbnailGallery());
  check(await page.locator('img.vg-thumb').count()===42,'42 actual images in gallery');
  // Eager loading is a test action; the delivered gallery keeps lazy image loading.
  await page.locator('img.vg-thumb').evaluateAll(images=>images.forEach(img=>img.loading='eager'));
  await page.waitForFunction(()=>[...document.querySelectorAll('img')].every(i=>i.complete&&i.naturalWidth>0));
  await page.locator('img.vg-thumb').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  check(true,'All gallery PNGs decode successfully');
  await page.screenshot({path:join(output,'gallery.png')});
  await page.locator('[data-gallery-search]').fill('op-board');
  check(await page.locator('[data-gallery-card]:visible').count()===1,'Gallery task filter narrows cards');
  await page.locator('[data-gallery-card]:visible summary').focus();await page.keyboard.press('Enter');
  check(await page.locator('[data-pattern-id="op-board"]').isVisible(),'Keyboard opens real full preview');
  await page.locator('[data-gallery-search]').fill('not-a-layout');check(await page.locator('[data-gallery-empty]').isVisible(),'Search empty state');
  for(const width of [320,375,768,1440]){
    await page.setViewportSize({width,height:1000});
    await open('gallery-'+width,renderThumbnailGallery());
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    check(await page.evaluate(()=>{
      const search=document.querySelector('[data-gallery-search]').getBoundingClientRect();
      return document.documentElement.scrollWidth<=window.innerWidth&&search.left>=0&&search.right<=window.innerWidth;
    }),'Gallery search fits at enlarged text '+width);
  }
  await page.setViewportSize({width:1440,height:1000});
  const screen=createExampleScreen('queue-context');
  await open('comparison',renderStaticVisualScreen(screen,{pattern_view:'thumbnails'}));
  await page.waitForFunction(()=>[...document.querySelectorAll('.vc-thumbnail')].every(i=>i.complete&&i.naturalWidth>0));
  check(await page.locator('.vc-thumbnail').count()===2,'Comparison images loaded');
  check(await page.locator('[data-pattern-id]:visible').count()===0,'Full previews start closed');
  await page.screenshot({path:join(output,'comparison.png'),fullPage:true});
  await page.locator('[data-thumbnail-detail] summary').first().focus();await page.keyboard.press('Enter');
  check(await page.locator('[data-pattern-id]').first().isVisible(),'Disclosure opens the preview');
  check(await page.locator('[data-option-id][aria-checked=true]').count()===0,'Opening preview does not select');
  await page.locator('[data-preview-search]').first().fill('REQ-105');
  check(await page.locator('[data-pattern-id]').first().locator('[data-search-row]:visible').count()===1,'Expanded preview remains interactive');
  await page.locator('[data-option-id]').nth(1).click();await page.locator('[data-copy]').click();
  const response=JSON.parse(await page.locator('[data-copy-output]').inputValue());
  check(response.selected_option_ids[0]==='direction-2'&&response.screen_digest===visualScreenDigest(screen),'Choice carries exact existing digest');
  for(const width of [375,768,1440]){
    await page.setViewportSize({width,height:1000});
    await open('comparison-'+width,renderStaticVisualScreen(screen,{pattern_view:'thumbnails'}));
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'No overflow at enlarged text '+width);
  }
  const localized=Object.fromEntries(Object.entries(DEFAULT_MESSAGES).map(([k,v])=>[k,'Localized '+v]));
  await open('localized-controls',renderStaticVisualScreen(screen,{pattern_view:'thumbnails',locale:'vi',messages:localized}));
  check((await page.locator('[data-thumbnail-detail] summary').first().textContent()).startsWith('Localized Preview'),'Disclosure uses localized messages');
  await open('live-renderer',renderLiveDocument(screen,{pattern_view:'thumbnails',sessionId:'thumbnail-test',screenRevision:1}));
  check(await page.locator('.vc-thumbnail').count()===2,'Live renderer shares compact cards');
  const custom=createPatternPreview({pattern_id:'op-split',content:{title:'A project-specific queue'}}),directory=join(output,'custom-capture');
  check(resolveThumbnail(custom).status==='unavailable','Custom content cannot reuse shipped image');
  const capture=await captureThumbnails({previews:[custom],output:directory});
  check(capture.images===1&&resolveThumbnail(custom,{directory}).status==='available','Exact custom PNG capture works');
  const before=await readFile(join(directory,'index.json'),'utf8');
  await assert.rejects(()=>captureThumbnails({previews:[custom],output:directory}),/EEXIST/);assertions++;
  check(await readFile(join(directory,'index.json'),'utf8')===before,'Existing capture is not overwritten');
  await assert.rejects(()=>captureThumbnails({previews:[custom],output:join(output,'no-browser'),playwright_module:'missing',chromium_path:'missing'}),/existing absolute/);assertions++;
  check(requests.length===0,'No remote HTTP requests');check(errors.length===0,'No page errors');
  const receipt={status:'passed',assertions,library_revision:libraryRevision(),browser:await browser.version(),remote_requests:requests,page_errors:errors,limits:['Native in-chat rendering is host-dependent; verified PNG paths are provided, not a claim about every host.','Live socket/auth tests are separate; this probes the shared live renderer.']};
  await writeFile(join(output,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
}finally{await browser.close();}
