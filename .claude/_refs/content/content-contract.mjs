import {readFileSync} from 'node:fs';
const catalog=JSON.parse(readFileSync(new URL('./catalog.json',import.meta.url),'utf8'));
const actions=new Set(Object.keys(catalog.actions));
// Selection is mechanical. Editorial judgment and claim/source verification are
// performed by the caller from real evidence; this helper never verifies a URL.
export function selectContentReferences({action='draft',channels=[],formats=[],domains=[],voice=false,claims=false}={}) {
  if(!actions.has(action)) throw new TypeError('unknown editorial action');
  for(const list of [channels,formats,domains]) if(!Array.isArray(list)||list.some(x=>typeof x!=='string'||!x.trim())) throw new TypeError('reference dimensions must be string arrays');
  const selected=new Set(catalog.actions[action]);
  const no_match=[];
  for(const channel of channels) {
    selected.add(Object.hasOwn(catalog.channels,channel)?catalog.channels[channel]:catalog.channel_fallback);
    if(!Object.hasOwn(catalog.channels,channel)) no_match.push(`channel:${channel}`);
  }
  for(const [dimension,list] of [['formats',formats],['domains',domains]]) for(const item of list){
    if(Object.hasOwn(catalog[dimension],item)) selected.add(catalog[dimension][item]);
    else no_match.push(`${dimension}:${item}`);
  }
  if(voice)selected.add('core/voice.md');
  if(claims)selected.add('core/research-and-claims.md');
  selected.add('core/editorial-review.md');
  return {references:[...selected].map(p=>`_refs/content/${p}`),no_match,engineering_artifacts_required:false};
}
export function assessContentClaim(claim={}) {
  if(claim.kind==='opinion')return {decision:'retain-as-opinion',reason:'Do not turn opinion into measured fact'};
  if(claim.kind==='personal-experience')return claim.author_supplied===true
    ? {decision:'retain-with-scope',reason:'Use only the supplied experience; do not embellish'}
    : {decision:'rewrite-without-first-person',reason:'No author experience supplied'};
  const evidence=claim.evidence;
  const reviewed=evidence?.review_status==='verified' && typeof evidence.source==='string' && evidence.source.trim() &&
    typeof evidence.supporting_excerpt==='string' && evidence.supporting_excerpt.trim() &&
    typeof evidence.checked_on==='string' && !Number.isNaN(Date.parse(evidence.checked_on)) &&
    evidence.scope_matches===true && evidence.stale!==true;
  if(!reviewed)return {decision:'rewrite-or-omit',reason:'Missing current, reviewed support for this exact claim'};
  if(claim.kind==='benchmark' && !['method','baseline','conditions'].every(field=>typeof evidence[field]==='string' && evidence[field].trim()))return {decision:'rewrite-or-omit',reason:'Comparison lacks method, baseline or conditions'};
  if(claim.kind==='testimonial' && evidence.use_authorized!==true)return {decision:'rewrite-or-omit',reason:'Quote use is not authorized'};
  if(claim.kind==='causal-performance')return {decision:'hypothesis-only',reason:'Observed performance alone does not establish causality'};
  if(!['fact','benchmark','testimonial','platform-limit','account-observation'].includes(claim.kind))return {decision:'rewrite-or-omit',reason:'Unknown claim type needs editorial classification'};
  return {decision:'retain-with-scope',reason:'Preserve reviewed supporting conditions and attribution'};
}
