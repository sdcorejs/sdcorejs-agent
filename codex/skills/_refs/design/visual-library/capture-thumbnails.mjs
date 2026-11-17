import { createHash } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { isAbsolute, resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { catalog, loadPattern, createPatternPreview, validatePatternPreview, libraryRevision } from './library.mjs';
import { renderPatternDocument } from './render-pattern.mjs';
import { inspectThumbnailPng } from './thumbnails.mjs';
import { assertValidScreen } from '../../sdlc/visual-companion/screen.mjs';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export function captureInputs(input){
  if(input?.options){assertValidScreen(input);if(input.options.some(o=>o.preview?.kind!=='pattern'))throw new TypeError('Capture needs pattern previews');return input.options.map(o=>o.preview);}
  const preview=input?.kind==='pattern'?input:createPatternPreview(input);
  const errors=validatePatternPreview(preview);if(errors.length)throw new TypeError(errors.join('; '));
  return [preview];
}

/** Optional existing-browser capability. Writes only into a newly created directory. */
export async function captureThumbnails({previews,output,playwright_module=process.env.SDCOREJS_PLAYWRIGHT_MODULE,chromium_path=process.env.SDCOREJS_CHROMIUM_PATH}){
  if(!Array.isArray(previews)||!previews.length||previews.length>64)throw new TypeError('Provide 1 to 64 previews');
  if(typeof output!=='string'||!output.trim())throw new TypeError('Provide an output directory');
  for(const value of [playwright_module,chromium_path])if(typeof value!=='string'||!isAbsolute(value))throw new TypeError('Capture requires existing absolute Playwright module and Chromium paths; use HTML if unavailable');
  const documents=[...new Map(previews.map(preview=>{const html=renderPatternDocument(preview);return [hash(html),{preview,html,html_sha256:hash(html)}];})).values()];
  const revision=libraryRevision();
  const {chromium}=await import(pathToFileURL(playwright_module).href);
  const browser=await chromium.launch({executablePath:chromium_path,headless:true,args:['--no-sandbox']});
  const directory=resolve(output);
  try{
    // No recursive mkdir, overwrite flag or cleanup of user-selected paths.
    await mkdir(directory);
    const page=await browser.newPage({viewport:{width:1360,height:1000},deviceScaleFactor:0.5,reducedMotion:'reduce'});
    const requests=[],errors=[];
    await page.route('**/*',route=>{requests.push(route.request().url());return route.abort();});
    page.on('pageerror',error=>errors.push(error.message));
    const entries=[];
    for(const {preview,html,html_sha256} of documents){
      await page.goto('about:blank');await page.setContent(html);await page.evaluate(()=>document.fonts.ready);
      await page.mouse.move(0,0);
      const frame=page.locator('.pp-frame'),bounds=await frame.boundingBox();
      if(!bounds||bounds.height>4096)throw new TypeError('Preview exceeds thumbnail capture bounds');
      const png=await frame.screenshot({type:'png',animations:'disabled',scale:'device'}),size=inspectThumbnailPng(png);
      const file=`${preview.pattern_id}-${preview.variant}-${html_sha256.slice(0,16)}.png`;
      await writeFile(join(directory,file),png,{flag:'wx'});
      entries.push({pattern_id:preview.pattern_id,variant:preview.variant,html_sha256,file,png_sha256:hash(png),...size,bytes:png.length});
    }
    if(requests.length||errors.length)throw new Error('Capture observed a blocked request or browser script error');
    if(libraryRevision()!==revision)throw new Error('Library changed during capture');
    const manifest={schema_version:1,kind:'rendered-html-thumbnails',library_revision:revision,capture:{browser:await browser.version(),viewport_width:1360,device_scale_factor:0.5,region:'.pp-frame'},entries};
    // Index is the completion marker. Partial captures remain diagnostics only.
    await writeFile(join(directory,'index.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
    return {status:'complete',directory,images:entries.length,bytes:entries.reduce((n,e)=>n+e.bytes,0),library_revision:revision};
  }finally{await browser.close();}
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    const args=process.argv.slice(2);let input,output,all=false;
    for(let i=0;i<args.length;i++){
      if(args[i]==='--catalog'&&!all)all=true;
      else if(args[i]==='--input'&&args[i+1]&&!input)input=args[++i];
      else if(args[i]==='--out'&&args[i+1]&&!output)output=args[++i];
      else throw new TypeError('Usage: capture-thumbnails.mjs (--catalog | --input <json>) --out <new-directory>');
    }
    if(all===Boolean(input)||!output)throw new TypeError('Choose exactly one input mode and a new output directory');
    const previews=all?catalog.patterns.flatMap(p=>loadPattern(p.id).variants.map(v=>createPatternPreview({pattern_id:p.id,variant:v.id}))):captureInputs(JSON.parse(await readFile(input,'utf8')));
    console.log(JSON.stringify(await captureThumbnails({previews,output}),null,2));
  }catch(error){console.error(error.message);process.exitCode=1;}
}
