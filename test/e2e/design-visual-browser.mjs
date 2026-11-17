/** Explicit browser verification; requires an already installed Playwright and Chromium. */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { catalog, createPatternPreview, loadPattern, libraryRevision } from '../../_refs/design/visual-library/library.mjs';
import { renderPatternDocument } from '../../_refs/design/visual-library/render-pattern.mjs';
import { EXAMPLES, createExampleScreen } from '../../_refs/design/visual-library/compose-preview.mjs';
import { renderStaticVisualScreen } from '../../_refs/sdlc/static-visual-composer.mjs';
import { renderLiveDocument } from '../../_refs/sdlc/visual-companion/live-document.mjs';

const output=resolve(process.argv[2]??'');
if(!process.argv[2]||!process.env.SDCOREJS_PLAYWRIGHT_MODULE||!process.env.SDCOREJS_CHROMIUM_PATH)throw new Error('Provide output directory, SDCOREJS_PLAYWRIGHT_MODULE and SDCOREJS_CHROMIUM_PATH; missing browser is not a pass.');
await mkdir(output,{recursive:true});
const {chromium}=await import(pathToFileURL(process.env.SDCOREJS_PLAYWRIGHT_MODULE).href);
const browser=await chromium.launch({executablePath:process.env.SDCOREJS_CHROMIUM_PATH,headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const requests=[],errors=[];page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});page.on('pageerror',error=>errors.push(error.message));
let assertions=0;
async function check(condition,message){assert.ok(condition,message);assertions++;}
async function open(name,html){const path=join(output,name+'.html');await writeFile(path,html);await page.goto('about:blank');await page.setContent(html);}
try{
  for(const entry of catalog.patterns){
    const pattern=loadPattern(entry.id);
    for(const variant of pattern.variants){
      await open(entry.id+'-'+variant.id,renderPatternDocument(createPatternPreview({pattern_id:entry.id,variant:variant.id})));
      await check(await page.locator('[data-pattern-id]').count()===1,'Rendered pattern');
      for(const viewport of ['desktop','tablet','mobile']){
        await page.selectOption('[data-preview-viewport]',viewport);
        await check(await page.locator('[data-pattern-id]').getAttribute('data-viewport')===viewport,'Viewport changes');
        await check(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'No document overflow');
      }
      for(const state of pattern.states){
        await page.selectOption('[data-preview-state]',state);
        await check(await page.locator(state==='data'?'[data-preview-data]':`[data-state-panel="${state}"]`).isVisible(),entry.id+' state '+state);
      }
    }
  }
  for(const id of EXAMPLES){await open(id,renderStaticVisualScreen(createExampleScreen(id)));await check(await page.locator('[data-pattern-id]').count()===2,'Two real previews');}
  await open('queue-context',renderStaticVisualScreen(createExampleScreen('queue-context')));
  await check(!await page.locator('[data-copy-output]').isVisible(),'Response stays hidden until Copy');
  const first=page.locator('[data-pattern-id]').first();
  await first.locator('[data-close-drawer]').click();
  await check(!await first.locator('[data-preview-drawer]').isVisible(),'Drawer closes');
  await first.locator('[data-preview-record]').nth(1).click();
  await check(await first.locator('[data-detail-title]').textContent()==='Document review','Drawer updates selected record');
  await page.keyboard.press('Escape');
  await first.locator('[data-preview-search]').fill('REQ-105');
  await check(await first.locator('[data-search-row]:visible').count()===1,'Search filters rows');
  await page.keyboard.type('1');
  await check(await page.locator('[data-option-id][aria-checked=true]').count()===0,'Typing cannot select a design');
  await page.locator('[data-option-id]').nth(1).click();await page.locator('[data-copy]').click();
  await check(await page.locator('[data-copy-output]').isVisible(),'Copied response is available to select');
  const copied=JSON.parse(await page.locator('[data-copy-output]').inputValue());
  await check(copied.selected_option_ids[0]==='direction-2'&&copied.screen_digest.startsWith('sha256:'),'Copied choice includes digest');
  await open('queue-context',renderStaticVisualScreen(createExampleScreen('queue-context')));
  await page.screenshot({path:join(output,'queue-context.png'),fullPage:true});
  await open('form-flow',renderStaticVisualScreen(createExampleScreen('form-flow')));
  const wizard=page.locator('[data-pattern-id="op-wizard"]');await wizard.locator('[data-step-next]').click();
  await check(await wizard.locator('[data-step-panel="1"]').isVisible(),'Wizard advances');
  await open('record-groups',renderStaticVisualScreen(createExampleScreen('record-groups')));
  const tabbed=page.locator('[data-variant="tabs"]');await tabbed.locator('[data-preview-tab="1"]').click();
  await check(await tabbed.locator('[data-tab-panel="1"]').isVisible(),'Tabs switch');
  await open('settings-sidebar',renderPatternDocument(createPatternPreview({pattern_id:'op-settings',variant:'sidebar'})));
  await page.locator('[data-preview-tab="2"]').click();
  await check(await page.locator('[data-tab-panel="2"]').isVisible(),'Preference section switches');
  await page.locator('[data-tab-panel="2"] input').fill('Local preference');
  await page.locator('[data-preview-tab="0"]').click();
  await page.locator('[data-preview-tab="2"]').click();
  await check(await page.locator('[data-tab-panel="2"] input').inputValue()==='Local preference','Switching sections preserves the local edit');
  await open('file-grid-search',renderPatternDocument(createPatternPreview({pattern_id:'op-files',variant:'grid'})));
  await page.locator('[data-preview-search]').fill('Decision log');
  await check(await page.locator('[data-search-row]:visible').count()===1,'File cards filter by visible content');
  await page.locator('[data-preview-search]').fill('no matching sample');
  await check(await page.locator('[data-search-empty]').isVisible(),'File search shows its empty result');
  await open('faq-keyboard',renderPatternDocument(createPatternPreview({pattern_id:'web-faq'})));
  await page.locator('.pp-faq-list summary').first().focus();
  await page.keyboard.press('Enter');
  await check(await page.locator('.pp-faq-list details').first().getAttribute('open')!==null,'FAQ expands with the keyboard');
  await page.keyboard.press('Enter');
  await check(await page.locator('.pp-faq-list details').first().getAttribute('open')===null,'FAQ collapses with the keyboard');
  for(const id of ['op-dashboard','op-board','op-settings','op-files','op-messages','op-review','web-docs','web-catalog','web-contact','web-faq']){
    await open(id+'-inspection',renderPatternDocument(createPatternPreview({pattern_id:id})));
    await page.screenshot({path:join(output,id+'.png'),fullPage:true});
  }
  await open('live-fragment',renderLiveDocument(createExampleScreen('queue-context'),{sessionId:'browser-probe',screenRevision:1}));
  // No live session is started here. The fixed pattern helper still runs on the waiting socket.
  await page.locator('[data-preview-viewport]').first().selectOption('mobile');
  await check(await page.locator('[data-pattern-id]').first().getAttribute('data-viewport')==='mobile','Live document shares preview interactions');
  for(const theme of [{id:'project'},...catalog.themes]){
    await open(theme.id,renderPatternDocument(createPatternPreview({pattern_id:'web-product',theme_id:theme.id})));
    await check(await page.locator('.pp-hero').isVisible(),'Theme renders');
    await page.locator('.pp-primary').first().hover();
    const contrast=await page.locator('.pp-primary').first().evaluate(button=>{
      const style=getComputedStyle(button);
      const lum=color=>{const a=color.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;};
      const x=lum(style.color),y=lum(style.backgroundColor);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
    });
    await check(contrast>=4.5,theme.id+': actual primary hover contrast');
  }
  await page.screenshot({path:join(output,'product-midnight.png'),fullPage:true});
  for(const width of [375,768,1440])for(const entry of catalog.patterns){
    await page.setViewportSize({width,height:1000});
    await open(entry.id+'-'+width,renderPatternDocument(createPatternPreview({pattern_id:entry.id})));
    const clipped=await page.evaluate(()=>{
      const outer=document.querySelector('.pp').getBoundingClientRect();
      return [...document.querySelectorAll('.pp-main,.pp-hero-visual,.pp-metrics,.pp-card')].filter(el=>{
        if(el.closest('.pp-scroll'))return false;
        const r=el.getBoundingClientRect();return r.width>0&&(r.right>outer.right+1||r.left<outer.left-1);
      }).map(el=>el.className);
    });
    await check(clipped.length===0,entry.id+' at '+width+': internally clipped '+clipped.join(','));
    const scrolls=await page.locator('.pp-scroll').evaluateAll(nodes=>nodes.map(el=>({scroll:el.scrollWidth,client:el.clientWidth,mode:getComputedStyle(el).overflowX})));
    await check(scrolls.every(s=>s.scroll<=s.client||['auto','scroll'].includes(s.mode)),'Wide content remains reachable by scrolling');
  }
  await page.setViewportSize({width:390,height:844});
  await open('mobile-queue',renderPatternDocument(createPatternPreview({pattern_id:'op-split',viewport:'mobile'})));
  await check(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Mobile page has no overflow');
  await page.screenshot({path:join(output,'mobile-queue.png'),fullPage:true});
  for(const width of [390,768,1440])for(const entry of catalog.patterns){
    await page.setViewportSize({width,height:1000});
    await open(entry.id+'-text-size-'+width,renderPatternDocument(createPatternPreview({pattern_id:entry.id})));
    const textSizes=()=>page.locator('.pp h2,.pp td,.pp label').evaluateAll(nodes=>nodes.map(el=>parseFloat(getComputedStyle(el).fontSize)));
    const normal=await textSizes();
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    const enlarged=await textSizes();
    await check(normal.length>0&&normal.every((size,i)=>enlarged[i]>=size*1.9),entry.id+': text follows 200% font preference');
    await check(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),entry.id+': 200% font preference has no page overflow');
    const unreachable=await page.locator('.pp-scroll').evaluateAll(nodes=>nodes.some(el=>el.scrollWidth>el.clientWidth&&!['auto','scroll'].includes(getComputedStyle(el).overflowX)));
    await check(!unreachable,entry.id+': enlarged table content remains scrollable');
    const overlap=await page.evaluate(()=>{
      const nav=document.querySelector('.pp-nav');
      if(nav&&nav.clientWidth&&nav.scrollWidth>nav.clientWidth+1)return 'sidebar';
      for(const label of document.querySelectorAll('.pp-dl dt')){
        if(!label.getBoundingClientRect().width)continue;
        const range=document.createRange();range.selectNodeContents(label);
        if(range.getBoundingClientRect().right>label.nextElementSibling.getBoundingClientRect().left-1)return 'record label';
      }
      return null;
    });
    await check(!overlap,entry.id+' at '+width+': enlarged '+overlap+' must not overlap adjacent content');
    if(entry.id==='op-split'){
      const readable=await page.locator('.pp-split').evaluate(layout=>[...layout.children].every(card=>card.getBoundingClientRect().width>=Math.min(360,layout.clientWidth)-1));
      await check(readable,'Enlarged list/detail retain readable widths or stack at '+width);
    }
  }
  for(const id of ['op-dashboard','op-board','op-settings','op-files','op-messages','op-review'])for(const variant of loadPattern(id).variants){
    await page.setViewportSize({width:375,height:1000});
    await open(id+'-'+variant.id+'-enlarged-action',renderPatternDocument(createPatternPreview({pattern_id:id,variant:variant.id,content:{primary_action:'Review the supplied content'}})));
    await page.evaluate(()=>document.documentElement.style.fontSize='200%');
    const visible=await page.locator('.pp-heading>button').evaluate(button=>{
      const action=button.getBoundingClientRect(),heading=button.parentElement.getBoundingClientRect();
      return action.left>=heading.left-1&&action.right<=heading.right+1;
    });
    await check(visible,id+'/'+variant.id+': enlarged action stays inside the heading, not clipped by the frame');
  }
  await check(requests.length===0,'No remote requests');await check(errors.length===0,'No page script errors: '+errors.join('; '));
  const receipt={status:'passed',assertions,library_revision:libraryRevision(),browser:await browser.version(),remote_requests:requests,script_errors:errors,limitations:['Live socket authentication/reconnect is covered by the separate runtime suite; this probe checks the rendered live document.','No claim of full assistive-technology certification.']};
  await writeFile(join(output,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
}finally{await browser.close();}
