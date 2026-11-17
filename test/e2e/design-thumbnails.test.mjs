import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { crc32 } from 'node:zlib';
import { catalog, loadPattern, createPatternPreview, libraryRevision } from '../../_refs/design/visual-library/library.mjs';
import { renderPatternDocument } from '../../_refs/design/visual-library/render-pattern.mjs';
import { createExampleScreen } from '../../_refs/design/visual-library/compose-preview.mjs';
import { renderStaticVisualScreen } from '../../_refs/sdlc/static-visual-composer.mjs';
import { resolveThumbnail } from '../../_refs/design/visual-library/thumbnails.mjs';

const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=','base64');
function fixture(previews){
  const directory=mkdtempSync(join(tmpdir(),'sdcorejs-thumbnails-'));
  const entries=previews.map((p,i)=>{const file=`fixture-${i}.png`;writeFileSync(join(directory,file),png);return {pattern_id:p.pattern_id,variant:p.variant,html_sha256:hash(renderPatternDocument(p)),file,png_sha256:hash(png),width:1,height:1,bytes:png.length};});
  const manifest={schema_version:1,kind:'rendered-html-thumbnails',library_revision:libraryRevision(),capture:{browser:'test fixture',viewport_width:1360,device_scale_factor:0.5,region:'.pp-frame'},entries};
  writeFileSync(join(directory,'index.json'),JSON.stringify(manifest));
  return {directory,manifest,save(){writeFileSync(join(directory,'index.json'),JSON.stringify(manifest));},close(){rmSync(directory,{recursive:true,force:true});}};
}

test('thumbnail resolves exact preview bytes and rejects stale/custom content',()=>{
  const p=createPatternPreview({pattern_id:'op-split'}),f=fixture([p]);
  try{
    const result=resolveThumbnail(p,{directory:f.directory});
    assert.equal(result.status,'available');assert.match(result.data_url,/^data:image\/png;base64,/);
    assert.equal(result.html_sha256,hash(renderPatternDocument(p)));
    assert.equal(resolveThumbnail(createPatternPreview({pattern_id:'op-split',content:{title:'Different project'}}),{directory:f.directory}).status,'unavailable');
    f.manifest.library_revision='sha256:'+'0'.repeat(64);f.save();
    assert.equal(resolveThumbnail(p,{directory:f.directory}).status,'stale');
  }finally{f.close();}
});

test('corrupted images, traversal and missing files cannot be embedded',()=>{
  const p=createPatternPreview({pattern_id:'op-split'}),f=fixture([p]);
  try{
    f.manifest.entries[0].file='../outside.png';f.save();assert.equal(resolveThumbnail(p,{directory:f.directory}).status,'invalid');
    f.manifest.entries[0].file='fixture-0.png';f.save();writeFileSync(join(f.directory,'fixture-0.png'),'<svg onload="bad()"></svg>');
    assert.equal(resolveThumbnail(p,{directory:f.directory}).status,'invalid');
    rmSync(join(f.directory,'fixture-0.png'));assert.equal(resolveThumbnail(p,{directory:f.directory}).status,'invalid');
  }finally{f.close();}
});

test('self-consistent manifests cannot make invalid PNG headers, checksums or pixels available',()=>{
  const p=createPatternPreview({pattern_id:'op-split'}),f=fixture([p]);
  const mutations=[
    bytes=>{bytes[24]=255;bytes[25]=255;bytes.writeUInt32BE(crc32(bytes.subarray(12,29)),29);},
    bytes=>{bytes[12]|=128;bytes.writeUInt32BE(crc32(bytes.subarray(12,29)),29);},
    bytes=>{bytes[29]^=1;},
    bytes=>{bytes.fill(0,41,52);bytes.writeUInt32BE(crc32(bytes.subarray(37,52)),52);},
  ];
  try{
    for(const mutate of mutations){
      const invalid=Buffer.from(png);mutate(invalid);
      writeFileSync(join(f.directory,'fixture-0.png'),invalid);
      f.manifest.entries[0].png_sha256=hash(invalid);f.save();
      assert.equal(resolveThumbnail(p,{directory:f.directory}).status,'invalid');
    }
  }finally{f.close();}
});

test('thumbnail intake requires the fixed browser capture contract',()=>{
  const p=createPatternPreview({pattern_id:'op-split'}),f=fixture([p]),capture=structuredClone(f.manifest.capture);
  try{
    for(const invalid of [undefined,{}, {...capture,viewport_width:1},{...capture,device_scale_factor:-4},{...capture,region:'body'}]){
      f.manifest.capture=invalid;f.save();
      assert.equal(resolveThumbnail(p,{directory:f.directory}).status,'invalid');
    }
    f.manifest.capture=capture;f.save();assert.equal(resolveThumbnail(p,{directory:f.directory}).status,'available');
  }finally{f.close();}
});

test('compact choices carry real images, separate disclosure from selection and fall back as a whole',()=>{
  const s=createExampleScreen('queue-context'),f=fixture(s.options.map(o=>o.preview));
  try{
    const html=renderStaticVisualScreen(s,{pattern_view:'thumbnails',thumbnail_directory:f.directory});
    assert.equal((html.match(/class="vc-thumbnail"/g)||[]).length,2);
    assert.equal((html.match(/data-thumbnail-detail/g)||[]).length,2);
    assert.match(html,/img-src data:/);assert.match(html,/data-screen-digest="sha256:/);
    assert.ok(html.indexOf('</button>')<html.indexOf('data-thumbnail-detail'));
    s.options[0].preview=createPatternPreview({pattern_id:'op-drawer',content:{title:'Custom'}});
    const fallback=renderStaticVisualScreen(s,{pattern_view:'thumbnails',thumbnail_directory:f.directory});
    assert.doesNotMatch(fallback,/class="vc-thumbnail"/);assert.match(fallback,/data-pattern-id="op-drawer"/);
  }finally{f.close();}
});

test('full-preview mode remains available and invalid presentation is rejected',()=>{
  assert.doesNotMatch(renderStaticVisualScreen(createExampleScreen('queue-context'),{pattern_view:'full'}),/data-thumbnail-detail/);
  assert.throws(()=>renderStaticVisualScreen(createExampleScreen('queue-context'),{pattern_view:'remote'}),/pattern_view/);
});

test('every shipped default variant has a current verified PNG; theme changes cannot reuse it',()=>{
  for(const entry of catalog.patterns)for(const variant of loadPattern(entry.id).variants){
    const p=createPatternPreview({pattern_id:entry.id,variant:variant.id});
    assert.equal(resolveThumbnail(p).status,'available',entry.id+'/'+variant.id);
    assert.equal(resolveThumbnail(createPatternPreview({pattern_id:entry.id,variant:variant.id,theme_id:'ocean-depths'})).status,'unavailable');
  }
});

test('chat asset lookup rejects malformed screen identities before returning images',()=>{
  const directory=mkdtempSync(join(tmpdir(),'sdcorejs-thumbnail-cli-'));
  const cli=fileURLToPath(new URL('../../_refs/design/visual-library/compose-preview.mjs',import.meta.url));
  const mutations=[
    screen=>{screen.options=[];},
    screen=>{screen.options[1].id=screen.options[0].id;},
    screen=>{delete screen.options[0].id;},
    screen=>{delete screen.screen_id;},
    screen=>{screen.unknown=true;},
  ];
  try{
    for(const mutate of mutations){
      const screen=createExampleScreen('queue-context');mutate(screen);
      const input=join(directory,'screen.json');writeFileSync(input,JSON.stringify(screen));
      const result=spawnSync(process.execPath,[cli,'--input',input,'--thumbnail-assets'],{encoding:'utf8'});
      assert.equal(result.status,1,result.stdout);assert.equal(result.stdout,'');
      assert.match(result.stderr,/screen|option|key/i);
    }
  }finally{rmSync(directory,{recursive:true,force:true});}
});

test('standalone rendering imports with the Node 18 zlib export subset',()=>{
  const directory=mkdtempSync(join(tmpdir(),'sdcorejs-thumbnail-compat-'));
  try{
    const loader=join(directory,'zlib-exports.mjs');
    writeFileSync(loader,`export async function load(url,context,nextLoad){
      if(url==='node:zlib')return {format:'module',shortCircuit:true,source:
        "import {createRequire} from 'node:module'; const {inflateSync}=createRequire('file:///sdcorejs-compat.cjs')('node:zlib'); export {inflateSync};"};
      return nextLoad(url,context);
    }`);
    const composer=new URL('../../_refs/sdlc/static-visual-composer.mjs',import.meta.url).href;
    const examples=new URL('../../_refs/design/visual-library/compose-preview.mjs',import.meta.url).href;
    const script=`import {renderStaticVisualScreen} from ${JSON.stringify(composer)};
      import {createExampleScreen} from ${JSON.stringify(examples)};
      if(!renderStaticVisualScreen(createExampleScreen('queue-context')).includes('data-pattern-id'))throw new Error('Preview missing');`;
    const result=spawnSync(process.execPath,['--experimental-loader',loader,'--input-type=module','--eval',script],{encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
  }finally{rmSync(directory,{recursive:true,force:true});}
});
