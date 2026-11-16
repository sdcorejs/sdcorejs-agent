import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createPatternPreview } from './library.mjs';
import { renderPatternDocument } from './render-pattern.mjs';
import { renderStaticVisualScreen } from '../../sdlc/static-visual-composer.mjs';

export const EXAMPLES = Object.freeze(['record-context','queue-context','form-flow','record-groups','hierarchy-presentation','product-direction']);

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
    const [flag,value]=process.argv.slice(2);
    if(flag==='--example')process.stdout.write(renderStaticVisualScreen(createExampleScreen(value)));
    else if(flag==='--input'){
      const input=JSON.parse(readFileSync(value,'utf8'));
      process.stdout.write(input.options?renderStaticVisualScreen(input):renderPatternDocument(createPatternPreview(input)));
    }else throw new TypeError('Usage: compose-preview.mjs --example <id> | --input <screen-or-pattern.json>');
  }catch(error){process.stderr.write(error.message+'\n');process.exitCode=1;}
}
