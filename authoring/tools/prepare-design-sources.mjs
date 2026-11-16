/** Offline, read-only source intake verifier. Curated source bodies are never executed. */
import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateLibrary, libraryRevision } from '../../_refs/design/visual-library/library.mjs';

export function verifyDesignSources(cacheDirectory){
  const manifest=JSON.parse(readFileSync(new URL('../../_refs/design/visual-library/sources.json',import.meta.url),'utf8'));
  const errors=validateLibrary(), verified=[];
  if(!cacheDirectory)return {status:errors.length?'invalid':'metadata-only',library_revision:libraryRevision(),verified,errors,limitation:'Source bytes were not rechecked. Supply --cache-dir for a complete intake.'};
  const cache=realpathSync(cacheDirectory);
  for(const source of manifest.sources){
    try{
      if(!/^[a-z0-9-]+$/.test(source.id))throw new Error('Unsafe source id');
      const file=realpathSync(resolve(cache,source.id+'.txt')),rel=relative(cache,file);
      if(rel.startsWith('..')||isAbsolute(rel))throw new Error('Source escapes cache');
      const sha256=createHash('sha256').update(readFileSync(file)).digest('hex');
      if(sha256!==source.sha256)throw new Error('Checksum mismatch');
      verified.push({id:source.id,revision:source.revision,sha256});
    }catch(error){errors.push(`${source.id}: ${error.message}`);}
  }
  return {status:errors.length?'invalid':'verified',library_revision:libraryRevision(),verified,errors};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    const [flag,cache,...extra]=process.argv.slice(2);
    if(flag!==undefined&&(flag!=='--cache-dir'||!cache||extra.length))throw new Error('Usage: prepare-design-sources.mjs [--cache-dir <pinned-source-cache>]');
    const result=verifyDesignSources(cache);process.stdout.write(JSON.stringify(result,null,2)+'\n');
    if(result.status!=='verified')process.exitCode=result.status==='invalid'?1:2;
  }catch(error){process.stderr.write(error.message+'\n');process.exitCode=1;}
}
