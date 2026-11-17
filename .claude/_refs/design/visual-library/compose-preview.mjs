import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createPatternPreview } from './library.mjs';
import { renderPatternDocument } from './render-pattern.mjs';
import { renderStaticVisualScreen } from '../../sdlc/static-visual-composer.mjs';
import { resolveThumbnail } from './thumbnails.mjs';
import { renderThumbnailGallery } from './gallery.mjs';
import { assertValidScreen } from '../../sdlc/visual-companion/screen.mjs';

export const EXAMPLES = Object.freeze(['record-context','queue-context','form-flow','record-groups','hierarchy-presentation','product-direction','dashboard-direction','settings-layout','file-presentation','review-layout','docs-structure','catalog-presentation']);

/** Examples demonstrate valid spatial comparisons; callers still confirm business fit. */
export function createExampleScreen(id, input={}) {
  if (!EXAMPLES.includes(id)) throw new TypeError('Unknown example');
  if (Object.keys(input).some(key=>!['content','locale','labels','theme_id','tokens','token_refs','viewport'].includes(key))) throw new TypeError('Unknown example input');
  if (input.locale && !/^en(?:-|$)/i.test(input.locale)) throw new TypeError('Localize the complete screen as well as preview content for non-English output');
  const example=JSON.parse(readFileSync(new URL(`./examples/${id}.json`,import.meta.url),'utf8'));
  const options=example.patterns.map((record,index)=>({id:`direction-${index+1}`,label:record.label,summary:record.summary,best_when:record.best_when,tradeoff:record.tradeoff,preview_asset:'Editable illustrative HTML',preview:createPatternPreview({...input,pattern_id:record.pattern_id,variant:record.variant})}));
  return {schema_version:2,screen_id:id,type:'comparison',question:example.question,criteria:example.criteria,recommendation:options[0].id,fallback_prompt:'Reply with the direction number and any changes. This records design feedback only.',options};
}

// No filesystem writes or server startup. The owner chooses an authorized output path.
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href){
  try{
    const args=process.argv.slice(2),flags={};
    for(let i=0;i<args.length;i++){
      const key=args[i];if(Object.hasOwn(flags,key))throw new TypeError('Duplicate argument');
      if(['--gallery','--thumbnails','--thumbnail-assets'].includes(key))flags[key]=true;
      else if(['--example','--input','--thumbnail-dir'].includes(key)&&args[i+1]&&!args[i+1].startsWith('--'))flags[key]=args[++i];
      else throw new TypeError('Unknown or incomplete argument');
    }
    if(['--gallery','--example','--input'].filter(key=>flags[key]).length!==1)throw new TypeError('Choose --gallery, --example <id>, or --input <json>');
    const runtime={pattern_view:flags['--thumbnails']?'thumbnails':'full',thumbnail_directory:flags['--thumbnail-dir']};
    if(flags['--gallery']){
      if(flags['--thumbnail-assets'])throw new TypeError('Asset lookup needs --example or --input');
      process.stdout.write(renderThumbnailGallery(runtime));
    }else{
      const input=flags['--example']?createExampleScreen(flags['--example']):JSON.parse(readFileSync(flags['--input'],'utf8'));
      if(input && Object.hasOwn(input,'options'))assertValidScreen(input);
      if(flags['--thumbnail-assets']){
        const options=input.options??[{id:'preview',preview:input.kind==='pattern'?input:createPatternPreview(input)}];
        const assets=options.map(option=>{
          if(option.preview?.kind!=='pattern')throw new TypeError('Thumbnail assets require pattern previews');
          const {data_url,...image}=resolveThumbnail(option.preview,{directory:runtime.thumbnail_directory});
          return {option_id:option.id,pattern_id:option.preview.pattern_id,variant:option.preview.variant,...image};
        });
        const available=assets.every(asset=>asset.status==='available');
        process.stdout.write(JSON.stringify({status:available?'available':'incomplete',authority:'design-feedback-only',assets},null,2)+'\n');
        if(!available)process.exitCode=2;
      }else process.stdout.write(input.options?renderStaticVisualScreen(input,runtime):renderPatternDocument(input.kind==='pattern'?input:createPatternPreview(input)));
    }
  }catch(error){process.stderr.write(error.message+'\n');process.exitCode=1;}
}
