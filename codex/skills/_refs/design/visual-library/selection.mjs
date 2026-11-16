import { createHash } from 'node:crypto';
import { assertValidScreen } from '../../sdlc/visual-companion/screen.mjs';
import { renderPatternDocument } from './render-pattern.mjs';

function canonical(value){return Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;}
export function visualScreenDigest(screen){return 'sha256:'+createHash('sha256').update(JSON.stringify(canonical(screen))).digest('hex');}

/** Choice feedback is bound to the current screen; it cannot approve execution. */
export function createVisualSelection({screen,response}){
  assertValidScreen(screen);
  if(!response||typeof response!=='object'||Array.isArray(response)||Object.keys(response).some(key=>!['screen_id','screen_digest','selected_option_ids','feedback'].includes(key)))throw new TypeError('Invalid response properties');
  if(screen.schema_version!==2)throw new TypeError('Pattern selection requires screen v2');
  if(!response||response.screen_id!==screen.screen_id||response.screen_digest!==visualScreenDigest(screen))throw new TypeError('Stale or missing screen digest');
  const ids=response.selected_option_ids;
  if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length||ids.length>(screen.type==='multi_select'?4:1)||ids.some(id=>!screen.options.some(o=>o.id===id)))throw new TypeError('Invalid selected option');
  if(typeof response.feedback!=='string'||response.feedback.length>4000)throw new TypeError('Invalid feedback');
  return {schema_version:1,authority:'design-feedback-only',screen_id:screen.screen_id,screen_digest:response.screen_digest,feedback:response.feedback,options:ids.map(id=>{
    const p=screen.options.find(o=>o.id===id).preview;
    if(p?.kind!=='pattern')throw new TypeError('Selected option requires a pattern preview');
    const editable_preview_sha256=createHash('sha256').update(renderPatternDocument(p)).digest('hex');
    return {option_id:id,pattern_id:p.pattern_id,variant:p.variant,theme_id:p.theme_id,token_refs:p.token_refs,library_revision:p.library_revision,editable_preview_sha256};
  })};
}
