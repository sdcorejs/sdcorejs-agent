import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const root = new URL('./', import.meta.url);
const json = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
export const catalog = json('catalog.json');
const provenance = json('sources.json');
const object = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const text = (v) => typeof v === 'string' && v.trim().length > 0 && v.length <= 1000;
const only = (v, keys) => Object.keys(v).every(k => keys.includes(k));
export const escapeText = (v) => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const DEFAULT_TOKENS = Object.freeze({ bg:'#f3f5f8', surface:'#ffffff', text:'#17283b', muted:'#506176', border:'#7c8b9d', accent:'#2457a7', accent_text:'#ffffff', soft:'#e8eff9', font:'sans' });
export const PREVIEW_LABELS = Object.freeze({ viewport:'Viewport', desktop:'Desktop', tablet:'Tablet', mobile:'Mobile', state:'State', data:'Content', loading:'Loading', empty:'Empty', 'no-results':'No results', error:'Error', 'permission-denied':'Unavailable', sample:'Illustrative preview · local actions only', search:'Search records', action:'View record', back:'Back', next:'Next', close:'Close preview', retry:'Try again', status:'Local preview updated. No data was saved.', details:'Record details', summary:'Overview', activity:'Activity', choose:'Select', section:'Section', sample_value:'Sample value', sample_price:'Price to confirm', sample_plan:'Plan', sample_term:'Terms to confirm', sample_step:'Step', sample_body:'Replace this sample content with the approved brief.', state_loading:'Loading the requested information.', state_empty:'No records yet. Add approved content to continue.', state_no_results:'No matching records. Adjust your search.', state_error:'The information could not be loaded. Try again.', state_permission_denied:'This information is unavailable for this role.' });
export const DEFAULT_HIERARCHY = Object.freeze({nodes:[{id:'requests',label:'Requests',parent_id:null},{id:'account',label:'Account',parent_id:'requests'},{id:'access',label:'Account access',parent_id:'account'},{id:'documents',label:'Document review',parent_id:'requests'},{id:'workspace',label:'Workspace setup',parent_id:'requests'}],columns:[{id:'select',label:'Select'}],selected:[]});
export const DEFAULT_CONTENT = Object.freeze({hierarchy:DEFAULT_HIERARCHY, brand:'Casework', title:'Service requests', subtitle:'Review incoming work and keep the next action clear.', primary_action:'New request', navigation:['Requests','Overview','Reports'], columns:['Reference','Subject','Team','Status'], rows:[['REQ-104','Account access','Operations','Open'],['REQ-105','Document review','Support','In review'],['REQ-106','Workspace setup','Operations','Pending'],['REQ-107','Equipment request','People','Open'],['REQ-108','Vendor onboarding','Finance','In review'],['REQ-109','Policy clarification','People','Open']], fields:['Reference','Subject','Team','Status'], tabs:['Overview','Related records','Activity'], steps:['Information','Review','Confirm'], sections:[{title:'Request overview',body:'Keep the request, its owner and the next action together.'},{title:'Related information',body:'Supporting records stay with the work they belong to.'},{title:'Recent activity',body:'Review the context before handing the request to the next team.'}], metrics:[{label:'Open requests',value:'24'},{label:'In review',value:'8'},{label:'Resolved',value:'62'}] });
// Teaching copy for a fictional product, replaced by the consuming brief.
// Website previews should not inherit an operational screen's page title or CTA.
export const DEFAULT_WEBSITE_CONTENT = Object.freeze({
  title:'Good work starts with a clear workspace.',
  subtitle:'Bring requests, context and next steps into one considered workspace. Less chasing updates. More moving forward.',
  primary_action:'Explore the workspace',
  navigation:['Product','How it works','Plans'],
  sections:[
    {title:'Find the work that matters.',body:'A focused queue gives each request a place and each team a clear next step.'},
    {title:'Keep the whole story close.',body:'Move from an overview to the details without losing the thread of your work.'},
    {title:'Make the next handoff clearer.',body:'Keep ownership and supporting information together as work moves between teams.'},
  ],
});

export function loadPattern(id) {
  const entry = catalog.patterns.find(p => p.id === id);
  if (!entry || entry.path !== `patterns/${id}.json` || !/^(op|web)-[a-z-]+$/.test(id)) throw new TypeError('Unknown pattern');
  return json(entry.path);
}

export function loadTheme(id) {
  if (id === 'project') return {id, tokens:{...DEFAULT_TOKENS}, source_refs:[]};
  const entry = catalog.themes.find(t => t.id === id);
  if (!entry || entry.path !== `themes/${id}.json` || !/^[a-z-]+$/.test(id)) throw new TypeError('Unknown theme');
  return json(entry.path);
}

export function libraryRevision() {
  const hash = createHash('sha256');
  function visit(url, prefix='') {
    for (const name of readdirSync(url).sort()) {
      const file = new URL(name, url); const relative = prefix + name;
      if (statSync(file).isDirectory()) visit(new URL(name+'/', url), relative+'/');
      else if (/\.(?:json|mjs|css|txt)$/.test(name)) hash.update(relative+'\0').update(readFileSync(file)).update('\0');
    }
  }
  visit(root); return 'sha256:'+hash.digest('hex');
}

export function validateTokens(tokens) {
  if (!object(tokens) || !only(tokens,Object.keys(DEFAULT_TOKENS))) return ['Unknown token role'];
  return Object.entries(tokens).flatMap(([key,value]) => key === 'font'
    ? ['sans','serif','mono'].includes(value) ? [] : ['Invalid font token']
    : typeof value === 'string' && /^#[a-fA-F0-9]{6}$/.test(value) ? [] : [`Invalid token ${key}`]);
}

export function validateHierarchy(hierarchy) {
  if (!object(hierarchy) || !only(hierarchy,['nodes','columns','selected'])) return ['Invalid hierarchy shape'];
  const {nodes,columns,selected}=hierarchy;
  const id=value=>typeof value==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value);
  if(!Array.isArray(nodes)||!nodes.length||nodes.length>64||nodes.some(n=>!object(n)||!only(n,['id','label','parent_id'])||!id(n.id)||!text(n.label)||(n.parent_id!==null&&!id(n.parent_id))))return ['Invalid hierarchy nodes'];
  if(!Array.isArray(columns)||!columns.length||columns.length>8||columns.some(c=>!object(c)||!only(c,['id','label'])||!id(c.id)||!text(c.label)))return ['Invalid hierarchy columns'];
  const byId=new Map(nodes.map(n=>[n.id,n])),columnIds=new Set(columns.map(c=>c.id)),parents=new Set(nodes.map(n=>n.parent_id).filter(Boolean));
  if(byId.size!==nodes.length||columnIds.size!==columns.length)return ['Duplicate hierarchy identity'];
  for(const node of nodes){
    const seen=new Set();let current=node;
    while(current){
      if(seen.has(current.id)||seen.size>=6)return ['Hierarchy cycle or depth exceeds six levels'];
      seen.add(current.id);
      if(current.parent_id!==null&&!byId.has(current.parent_id))return ['Dangling hierarchy parent'];
      current=current.parent_id===null?null:byId.get(current.parent_id);
    }
  }
  if(!Array.isArray(selected)||selected.length>512||selected.some(s=>!object(s)||!only(s,['node_id','column_id'])||!byId.has(s.node_id)||parents.has(s.node_id)||!columnIds.has(s.column_id)))return ['Invalid hierarchy leaf selection'];
  if(new Set(selected.map(s=>JSON.stringify([s.node_id,s.column_id]))).size!==selected.length)return ['Duplicate hierarchy selection'];
  return [];
}

export function validatePatternPreview(preview) {
  const errors=[];
  if (!object(preview) || !only(preview,['kind','pattern_id','variant','theme_id','tokens','token_refs','content','state','viewport','shell','locale','labels','library_revision','caption'])) return ['Unknown pattern preview properties'];
  if (preview.kind !== 'pattern') errors.push('Invalid pattern kind');
  let pattern; try { pattern=loadPattern(preview.pattern_id); } catch { errors.push('Unknown pattern'); }
  if (pattern && !pattern.variants.some(v=>v.id===preview.variant)) errors.push('Unknown pattern variant');
  try { loadTheme(preview.theme_id); } catch { errors.push('Unknown theme'); }
  if (preview.library_revision !== libraryRevision()) errors.push('Stale library revision');
  errors.push(...validateTokens(preview.tokens));
  if (!Array.isArray(preview.token_refs) || preview.token_refs.length>16 || !preview.token_refs.every(text)) errors.push('Invalid token references');
  if (pattern && !pattern.states.includes(preview.state)) errors.push('Invalid preview state');
  if (!['desktop','tablet','mobile'].includes(preview.viewport)) errors.push('Invalid preview viewport');
  if (typeof preview.shell !== 'boolean') errors.push('Invalid shell');
  if (!/^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/.test(preview.locale??'')) errors.push('Invalid locale');
  if (!object(preview.labels) || !only(preview.labels,Object.keys(PREVIEW_LABELS)) || Object.keys(PREVIEW_LABELS).some(k=>!text(preview.labels[k]))) errors.push('Complete preview labels required');
  const c=preview.content;
  if (!object(c) || !only(c,Object.keys(DEFAULT_CONTENT))) return [...errors,'Invalid preview content'];
  errors.push(...validateHierarchy(c.hierarchy));
  for (const key of ['brand','title','subtitle','primary_action']) if (!text(c[key])) errors.push(`Invalid content ${key}`);
  for (const key of ['navigation','columns','fields','tabs','steps']) if (!Array.isArray(c[key]) || c[key].length<1 || c[key].length>8 || !c[key].every(text)) errors.push(`Invalid content ${key}`);
  if (!Array.isArray(c.rows) || c.rows.length>24 || c.rows.some(row=>!Array.isArray(row)||row.length!==c.columns?.length||!row.every(text))) errors.push('Invalid content rows');
  for (const [key,fields] of [['sections',['title','body']],['metrics',['label','value']]]) {
    if (!Array.isArray(c[key])||c[key].length<1||c[key].length>6||c[key].some(row=>!object(row)||!only(row,fields)||fields.some(k=>!text(row[k])))) errors.push(`Invalid content ${key}`);
  }
  if (preview.caption!==undefined && !text(preview.caption)) errors.push('Invalid caption');
  if (JSON.stringify(preview).length>48000) errors.push('Preview content exceeds bounds');
  return errors;
}

export function createPatternPreview(input) {
  if (!object(input) || !only(input,['pattern_id','variant','theme_id','tokens','token_refs','content','state','viewport','shell','locale','labels','caption'])) throw new TypeError('Invalid pattern input');
  const pattern=loadPattern(input.pattern_id); const locale=input.locale??'en';
  if (!/^en(?:-|$)/i.test(locale) && (!input.labels || !object(input.content) || Object.keys(DEFAULT_CONTENT).some(key=>!(key in input.content)))) throw new TypeError('Localized preview requires a complete labels bundle and localized content');
  const defaults={...structuredClone(DEFAULT_CONTENT),...(pattern.id.startsWith('web-')?structuredClone(DEFAULT_WEBSITE_CONTENT):{})};
  const preview={kind:'pattern',pattern_id:pattern.id,variant:input.variant??pattern.variants[0].id,theme_id:input.theme_id??'project',tokens:input.tokens??{},token_refs:input.token_refs??[],content:{...defaults,...input.content},state:input.state??'data',viewport:input.viewport??'desktop',shell:input.shell??pattern.id.startsWith('op-'),locale,labels:input.labels??{...PREVIEW_LABELS},library_revision:libraryRevision(),...(input.caption===undefined?{}:{caption:input.caption})};
  const errors=validatePatternPreview(preview); if(errors.length)throw new TypeError(errors.join('; '));
  return preview;
}

export function validateLibrary() {
  const errors=[]; const sources=new Map(provenance.sources.map(s=>[s.id,s]));
  if (sources.size!==provenance.sources.length) errors.push('Duplicate source id');
  for (const source of sources.values()) {
    if (!/^[a-f0-9]{40}$/.test(source.revision)||!/^[a-f0-9]{64}$/.test(source.sha256)) errors.push(`Invalid source hash: ${source.id}`);
    if (source.url!==`https://github.com/${source.repository}/blob/${source.revision}/${source.path}`) errors.push(`Source URL mismatch: ${source.id}`);
    if (!/^licenses\/[a-z]+\.txt$/.test(source.license_path)) errors.push(`Invalid license path: ${source.id}`);
    else try { if(readFileSync(new URL(source.license_path,root),'utf8').length<500)errors.push(`License incomplete: ${source.id}`); }catch{errors.push(`Missing license: ${source.id}`);}
  }
  const seen=new Set();
  for (const entry of [...catalog.patterns,...catalog.themes]) {
    if(seen.has(entry.id))errors.push(`Duplicate catalog id: ${entry.id}`);seen.add(entry.id);
    try {
      const record=entry.path.startsWith('patterns/')?loadPattern(entry.id):loadTheme(entry.id);
      if (!record.source_refs?.length||record.source_refs.some(id=>!sources.has(id))) errors.push(`Unresolved source: ${entry.id}`);
      if (record.variants && (!text(record.applicability)||!text(record.avoid_when)||!record.variants.length||new Set(record.variants.map(v=>v.id)).size!==record.variants.length)) errors.push(`Invalid pattern: ${entry.id}`);
      if (record.tokens) errors.push(...validateTokens(record.tokens));
    }catch(e){errors.push(e.message);}
  }
  return errors;
}
