import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';
import { libraryRevision } from './library.mjs';
import { renderPatternDocument } from './render-pattern.mjs';

export const DEFAULT_THUMBNAIL_DIRECTORY=fileURLToPath(new URL('./thumbnails/',import.meta.url));
export const MAX_THUMBNAIL_BYTES=512*1024;
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const digest=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
// PNG CRC-32 without the newer zlib.crc32 API: the standalone companion supports Node 18.
const CRC_TABLE=Uint32Array.from({length:256},(_,value)=>{
  for(let bit=0;bit<8;bit++)value=(value>>>1)^((value&1)?0xedb88320:0);
  return value>>>0;
});
function pngCrc32(bytes){
  let value=0xffffffff;
  for(const byte of bytes)value=CRC_TABLE[(value^byte)&255]^(value>>>8);
  return (value^0xffffffff)>>>0;
}

/** Accept the capture helper's bounded, non-interlaced 8-bit PNG profile. */
export function inspectThumbnailPng(bytes){
  if(!Buffer.isBuffer(bytes)||bytes.length<57||bytes.length>MAX_THUMBNAIL_BYTES||!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw new TypeError('Invalid thumbnail PNG');
  if(bytes.readUInt32BE(8)!==13||bytes.toString('latin1',12,16)!=='IHDR')throw new TypeError('Invalid PNG header');
  const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
  if(width<1||width>1024||height<1||height>4096)throw new TypeError('Thumbnail dimensions exceed bounds');
  const channels={0:1,2:3,4:2,6:4}[bytes[25]];
  if(bytes[24]!==8||!channels||bytes[26]!==0||bytes[27]!==0||bytes[28]!==0)throw new TypeError('Unsupported thumbnail PNG header');
  let offset=8,ended=false;const chunks=[];
  while(offset+12<=bytes.length){
    const size=bytes.readUInt32BE(offset),type=bytes.toString('latin1',offset+4,offset+8);
    if(size>bytes.length-offset-12)throw new TypeError('Truncated PNG');
    if(!['IHDR','IDAT','IEND'].includes(type)||(type==='IHDR'&&offset!==8))throw new TypeError('Unsupported thumbnail PNG chunk');
    if(pngCrc32(bytes.subarray(offset+4,offset+8+size))!==bytes.readUInt32BE(offset+8+size))throw new TypeError('Invalid PNG checksum');
    if(type==='IDAT')chunks.push(bytes.subarray(offset+8,offset+8+size));
    offset+=size+12;
    if(type==='IEND'){if(size!==0||offset!==bytes.length)throw new TypeError('Invalid PNG ending');ended=true;break;}
  }
  if(!chunks.length||!ended)throw new TypeError('Incomplete PNG');
  const rowBytes=width*channels+1,expected=rowBytes*height,compressed=Buffer.concat(chunks);
  // Limit decompression before allocation; even a self-consistent forged manifest
  // cannot turn a small PNG into an unbounded pixel buffer.
  const decoded=inflateSync(compressed,{maxOutputLength:expected,info:true});
  if(decoded.buffer.length!==expected||decoded.engine.bytesWritten!==compressed.length)throw new TypeError('Invalid PNG pixel data');
  for(let row=0;row<height;row++)if(decoded.buffer[row*rowBytes]>4)throw new TypeError('Invalid PNG scanline filter');
  return {width,height};
}

function readBoundedFile(file,limit){
  const stat=lstatSync(file);
  if(!stat.isFile()||stat.isSymbolicLink()||stat.size>limit)throw new TypeError('Unsafe thumbnail file');
  const bytes=readFileSync(file);
  if(bytes.length>limit)throw new TypeError('Thumbnail file exceeds bounds');
  return bytes;
}

/** Integrity binding invalidates stale captures; it is not a signed capture attestation. */
export function resolveThumbnail(preview,{directory=DEFAULT_THUMBNAIL_DIRECTORY}={}){
  const html_sha256=hash(renderPatternDocument(preview));
  let root,index;
  try{
    if(typeof directory!=='string'||!directory||lstatSync(directory).isSymbolicLink())throw new TypeError('Invalid thumbnail directory');
    root=realpathSync(resolve(directory));
    index=JSON.parse(readBoundedFile(join(root,'index.json'),1024*1024));
  }catch(error){return {status:error.code==='ENOENT'?'unavailable':'invalid',reason:'Missing or invalid local thumbnail index'};}
  if(!object(index))return {status:'invalid',reason:'Invalid thumbnail index shape'};
  if(index.library_revision!==libraryRevision())return {status:'stale',reason:'Thumbnail source revision differs from the current library'};
  if(index.schema_version!==1||index.kind!=='rendered-html-thumbnails'||!Array.isArray(index.entries)||!index.entries.length||index.entries.length>64)return {status:'invalid',reason:'Invalid thumbnail index shape'};
  const capture=index.capture;
  if(!object(capture)||typeof capture.browser!=='string'||!capture.browser.trim()||capture.browser.length>128||capture.viewport_width!==1360||capture.device_scale_factor!==0.5||capture.region!=='.pp-frame')return {status:'invalid',reason:'Invalid thumbnail capture contract'};
  const matches=index.entries.filter(entry=>object(entry)&&entry.html_sha256===html_sha256);
  if(!matches.length)return {status:'unavailable',reason:'No capture for this exact preview'};
  if(matches.length!==1)return {status:'invalid',reason:'Ambiguous thumbnail identity'};
  const entry=matches[0];
  try{
    if(entry.pattern_id!==preview.pattern_id||entry.variant!==preview.variant||!digest(entry.png_sha256)||!digest(entry.html_sha256)||
      typeof entry.file!=='string'||!/^[a-z0-9][a-z0-9-]*\.png$/.test(entry.file)||entry.file.length>160)throw new TypeError('Invalid thumbnail identity');
    const asset_path=join(root,entry.file),bytes=readBoundedFile(asset_path,MAX_THUMBNAIL_BYTES),size=inspectThumbnailPng(bytes);
    if(hash(bytes)!==entry.png_sha256||bytes.length!==entry.bytes||size.width!==entry.width||size.height!==entry.height)throw new TypeError('Thumbnail bytes differ from the manifest');
    return {status:'available',asset_path,data_url:'data:image/png;base64,'+bytes.toString('base64'),html_sha256,png_sha256:entry.png_sha256,...size};
  }catch{return {status:'invalid',reason:'Thumbnail asset failed identity, containment or byte verification'};}
}

/** All-or-nothing presentation keeps comparison options at the same fidelity. */
export function resolveScreenThumbnails(screen,runtime={}){
  const mode=runtime.pattern_view??'full';
  if(!['full','thumbnails'].includes(mode))throw new TypeError('pattern_view must be full or thumbnails');
  if(mode==='full')return null;
  const images=screen.options.map(option=>option.preview?.kind==='pattern'?resolveThumbnail(option.preview,{directory:runtime.thumbnail_directory}):{status:'unavailable'});
  return images.every(image=>image.status==='available')?images:null;
}
