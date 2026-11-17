import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { renderStaticVisualScreen, validateVisualScreen, formatCopiedResponse } from '../../_refs/sdlc/static-visual-composer.mjs';

import * as library from '../../_refs/design/visual-library/library.mjs';
import * as selection from '../../_refs/design/visual-library/select-patterns.mjs';
import * as renderer from '../../_refs/design/visual-library/render-pattern.mjs';
import * as choices from '../../_refs/design/visual-library/selection.mjs';
import { validateDesignHandoff } from '../../_refs/shared/design-handoff.mjs';
import { createExampleScreen, EXAMPLES } from '../../_refs/design/visual-library/compose-preview.mjs';
import { createHash } from 'node:crypto';

const expandedJobs = {
  'op-dashboard':'monitor-overview', 'op-board':'track-work', 'op-settings':'configure-preferences',
  'op-files':'browse-files', 'op-messages':'read-conversation', 'op-review':'review-content',
  'web-docs':'read-documentation', 'web-catalog':'browse-catalog', 'web-contact':'contact-team', 'web-faq':'find-answers',
};
test('expanded tasks select their own family without crossing the business/website boundary', () => {
  for(const [id,job] of Object.entries(expandedJobs)) {
    const surface=id.startsWith('op-')?'enterprise-portal':'public-website';
    assert.equal(selection.selectPatterns({surface,job}).patterns[0]?.id,id);
    assert.equal(selection.selectPatterns({surface:id.startsWith('op-')?'public-website':'enterprise-portal',job}).status,'no-match');
    const p=makePreview(id);
    assert.match(renderer.renderPatternDocument(p),new RegExp('data-pattern-id="'+id+'"'));
  }
});

test('board uses explicit bounded groups rather than inferring business status from row order', () => {
  const groups=[{title:'Waiting',items:[{title:'CASE_ALPHA',body:'BODY_ALPHA'}]},{title:'Complete',items:[]}];
  const html=renderer.renderPatternDocument(makePreview('op-board',{content:{groups}}));
  assert.match(html,/Waiting[\s\S]*CASE_ALPHA[\s\S]*BODY_ALPHA[\s\S]*Complete/);
  assert.doesNotMatch(html,/REQ-104|draggable="true"/);
  for(const groups of [[{title:'Missing items'}],Array(7).fill({title:'Too many',items:[]}),[{title:'Bad',items:[{title:'Task',body:'Body',script:'bad'}]}]])
    assert.throws(()=>makePreview('op-board',{content:{groups}}),/groups/i);
  const hostile=renderer.renderPatternDocument(makePreview('op-board',{content:{groups:[{title:'<script>bad</script>',items:[]}]}}));
  assert.match(hostile,/&lt;script&gt;bad/);
});

test('paired expansion examples preserve all sections and records across spatial variants', () => {
  const ids=['dashboard-direction','settings-layout','file-presentation','review-layout','docs-structure','catalog-presentation'];
  for(const id of ids){
    const s=createExampleScreen(id);
    assert.deepEqual(s.options[0].preview.content,s.options[1].preview.content);
    for(const {preview:p} of s.options){
      const html=renderer.renderPatternDocument(p);
      const values=id==='file-presentation'?p.content.rows.flat():p.content.sections.flatMap(s=>[s.title,s.body]);
      for(const value of values)assert.ok(html.includes(library.escapeText(value)),id+': missing '+value);
    }
  }
});

test('Astryx sources stay pinned with experimental readiness and no inherited runtime dependencies', async () => {
  const sources=JSON.parse(await readFile(new URL('../../_refs/design/visual-library/sources.json',import.meta.url)));
  const astryx=sources.sources.filter(s=>s.repository==='meta/astryx');
  assert.ok(astryx.length>=8);
  for(const source of astryx)assert.match(source.sha256,/^[a-f0-9]{64}$/);
  for(const id of ['astryx-review-workspace','astryx-messaging-shell'])assert.equal(astryx.find(s=>s.id===id)?.upstream_ready,false);
  for(const id of Object.keys(expandedJobs)){
    assert.equal(library.loadPattern(id).component_mapping.core_version_evidence,null);
    assert.doesNotMatch(renderer.renderPatternDocument(makePreview(id)),/<script[^>]+src=|@astryxdesign|react-dom/);
  }
});

test('settings require explicit complete field membership and preserve it across variants', () => {
  const content={fields:['Workspace field','Appearance field','Notification field'],rows:[['Team','Readable','Weekly']],columns:['Workspace','Appearance','Notifications'],sections:[{title:'Workspace group',body:'Workspace description'},{title:'Appearance group',body:'Appearance description'},{title:'Notification group',body:'Notification description'}],field_groups:[[0],[1],[2]]};
  for(const variant of ['sidebar','stacked']){
    const html=renderer.renderPatternDocument(makePreview('op-settings',{variant,content}));
    const panels=html.match(/<section class="pp-card pp-stack"[^>]*>[\s\S]*?<\/section>/g);
    assert.equal(panels.length,3);
    for(let i=0;i<3;i++)for(let j=0;j<3;j++)assert.equal(panels[i].includes(content.fields[j]),i===j);
  }
  for(const field_groups of [[[0],[0],[2]],[[0],[1],[]],[[0],[1],[3]],[[0],[1]],[[0],[1],[2.5]]])
    assert.throws(()=>makePreview('op-settings',{content:{...content,field_groups}}),/field.groups/i);
  const {field_groups,...unmapped}=content;
  assert.throws(()=>makePreview('op-settings',{content:unmapped}),/field.groups/i);
});
const makePreview = (id, extra = {}) => library.createPatternPreview({ pattern_id: id, ...extra });
const screen = () => ({ schema_version: 2, screen_id: 'support-layout', type: 'comparison', question: 'Choose a support workspace', criteria: ['Keep the queue visible'], recommendation: 'split', fallback_prompt: 'Reply split or drawer.', options: [
  { id: 'split', label: 'Side by side', summary: 'Process consecutive records.', best_when: 'Frequent review', tradeoff: 'Uses width', preview_asset: 'Editable queue', preview: makePreview('op-split') },
  { id: 'drawer', label: 'Drawer', summary: 'Inspect a record occasionally.', best_when: 'Occasional inspection', tradeoff: 'Covers the list', preview_asset: 'Editable drawer', preview: makePreview('op-drawer') },
] });

test('task lookup returns a work queue, excludes marketing and abstains on an unknown task', () => {
  assert.equal(typeof selection.selectPatterns, 'function', 'task-indexed visual library is required');
  const result = selection.selectPatterns({ surface: 'enterprise-portal', job: 'process-queue' });
  assert.equal(result.status, 'matched');
  assert.equal(result.patterns[0].id, 'op-split');
  assert.ok(result.patterns.every(p => !p.id.startsWith('web-')));
  assert.equal(selection.selectPatterns({ surface: 'enterprise-portal', job: 'quantum-console' }).status, 'no-match');
  assert.equal(selection.selectPatterns({ surface: 'landing-page', job: 'process-queue' }).status, 'no-match');
});

test('existing tokens stay authoritative and unsupported installed Core versions stay unverified', () => {
  const result = selection.selectPatterns({ surface: 'enterprise-portal', job: 'browse-records', core_version: '22.99.0', existing_design: true });
  assert.equal(result.theme_policy, 'reuse-project-tokens');
  assert.ok(result.patterns.every(p => p.component_compatibility === 'unverified'));
  assert.ok(result.patterns.every(p => Array.isArray(p.source_refs) && p.source_refs.length));
});

test('editing alone cannot introduce dependent steps or a permission matrix', () => {
  for(const shape of [undefined,'flat']){
    const result=selection.selectPatterns({surface:'enterprise-portal',job:'edit-record',data_shape:shape});
    assert.ok(result.patterns.every(p=>!['op-wizard','op-hierarchy'].includes(p.id)));
  }
  assert.ok(selection.selectPatterns({surface:'enterprise-portal',job:'complete-steps',data_shape:'dependent-steps'}).patterns.some(p=>p.id==='op-wizard'));
});

test('source provenance and licenses resolve for every shipped pattern and theme', async () => {
  assert.deepEqual(library.validateLibrary(), []);
  for (const p of library.catalog.patterns) {
    const record = library.loadPattern(p.id);
    assert.ok(record.applicability && record.avoid_when && record.source_refs.length);
    const html = renderer.renderPatternDocument(makePreview(p.id));
    assert.ok(html.startsWith('<!doctype html>'));
    assert.ok(html.includes('data-pattern-id="' + p.id + '"'));
    assert.doesNotMatch(html, /<sd-|\[routerLink\]|\(click\)=/);
  }
  for (const theme of library.catalog.themes) {
    const html = renderer.renderPatternDocument(makePreview('web-product', { theme_id: theme.id }));
    assert.ok(html.includes('--pp-bg:'));
  }
  const sources = JSON.parse(await readFile(new URL('../../_refs/design/visual-library/sources.json', import.meta.url)));
  assert.ok(sources.sources.some(s => s.repository === 'sdcorejs/portal-template'));
  assert.ok(sources.sources.some(s => s.repository === 'sdcorejs/sdcorejs-angular'));
});

test('screen v2 renders real examples and keeps selection separate from preview controls', () => {
  const s = screen();
  assert.deepEqual(validateVisualScreen(s), []);
  const html = renderStaticVisualScreen(s);
  assert.match(html, /<table/);
  assert.match(html, /data-preview-state/);
  assert.match(html, /data-preview-viewport/);
  assert.match(html, /data-screen-digest="sha256:/);
  assert.ok(html.indexOf('</button>') < html.indexOf('data-pattern-id='), 'interactive preview is outside the choice button');
  assert.doesNotMatch(html, /<iframe|https:\/\/fonts|<script\s+src=/);
});

test('untrusted content is escaped, unsafe token values and extra preview properties fail closed', () => {
  const preview = makePreview('op-list', { content: { title: '<img src=x onerror="fetch(1)">' } });
  const html = renderer.renderPatternDocument(preview);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img/);
  assert.throws(() => makePreview('../outside'), /pattern/i);
  assert.throws(() => makePreview('op-list', { tokens: { accent: 'red; background:url(https://bad.test)' } }), /token/i);
  const s = screen(); s.options[0].preview.html = '<script>1</script>';
  assert.ok(validateVisualScreen(s).length);
  s.options[0].preview = makePreview('op-split'); s.schema_version = 1;
  assert.ok(validateVisualScreen(s).length, 'v1 does not silently accept a new preview contract');
});

test('unknown pattern, variant, theme, state and stale library revision are rejected before rendering', () => {
  for (const changes of [{ pattern_id: 'missing' }, { variant: 'missing' }, { theme_id: 'missing' }, { state: 'executed' }, { library_revision: 'sha256:' + '0'.repeat(64) }]) {
    const s = screen(); Object.assign(s.options[0].preview, changes);
    assert.ok(validateVisualScreen(s).length, JSON.stringify(changes));
    assert.throws(() => renderStaticVisualScreen(s));
  }
});

test('screen digest binds content, rejects old selections and cannot grant approval', () => {
  const s = screen(); const digest = choices.visualScreenDigest(s);
  const response = formatCopiedResponse({ screen: s, screen_digest: digest, selected_option_ids: ['split'], feedback: 'Use this direction.' });
  const choice = choices.createVisualSelection({ screen: s, response });
  assert.equal(choice.authority, 'design-feedback-only');
  assert.equal(choice.options[0].pattern_id, 'op-split');
  assert.equal(choice.screen_digest, digest);
  assert.equal(choice.approval, undefined);
  assert.throws(() => formatCopiedResponse({ screen: s, selected_option_ids: ['split'], feedback: '' }), /digest/i);
  const changed = structuredClone(s); changed.options[0].preview.content.title = 'Changed subject';
  assert.throws(() => choices.createVisualSelection({ screen: changed, response }), /digest|stale/i);
  assert.throws(() => choices.createVisualSelection({ screen: s, response: { ...response, selected_option_ids: ['outside'] } }), /option/i);
});

test('single selected layout has a standalone editable preview without fabricated alternatives', () => {
  const html = renderer.renderPatternDocument(makePreview('op-form'));
  assert.match(html, /<input/);
  assert.doesNotMatch(html, /data-option-id/);
  assert.match(html, /form-action 'none'/);
});

test('handoff checks the carried screen and choice instead of trusting a claimed selection', () => {
  const s = screen();
  const response = formatCopiedResponse({ screen:s, screen_digest:choices.visualScreenDigest(s), selected_option_ids:['split'], feedback:'' });
  const result = choices.createVisualSelection({screen:s,response});
  const valid = validateDesignHandoff({visual_selection:{screen:s,response,result}});
  assert.ok(!valid.errors.some(e=>e.code==='INVALID_VISUAL_SELECTION'));
  result.authority='execution-approved';
  const invalid = validateDesignHandoff({visual_selection:{screen:s,response,result}});
  assert.ok(invalid.errors.some(e=>e.code==='INVALID_VISUAL_SELECTION'));
});

test('non-English preview requires complete localized content, including states and controls', () => {
  assert.throws(()=>makePreview('op-list',{locale:'vi',labels:{...library.PREVIEW_LABELS},content:{title:'Localized title'}}), /localized content/i);
});

test('paired examples use the same content and every shipped variant renders', () => {
  for(const id of EXAMPLES){
    const s=createExampleScreen(id);
    assert.deepEqual(s.options[0].preview.content,s.options[1].preview.content);
    assert.equal(s.options[0].preview.viewport,s.options[1].preview.viewport);
    assert.notEqual(s.options[0].preview.pattern_id+'/'+s.options[0].preview.variant,s.options[1].preview.pattern_id+'/'+s.options[1].preview.variant);
    assert.deepEqual(validateVisualScreen(s),[]);
  }
  for(const entry of library.catalog.patterns)for(const variant of library.loadPattern(entry.id).variants){
    assert.match(renderer.renderPatternDocument(makePreview(entry.id,{variant:variant.id})),/data-pattern-id=/);
  }
});

test('shipped theme text and CTA pairs meet AA contrast; borders remain distinguishable', () => {
  const luminance=hex=>{const a=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return a[0]*.2126+a[1]*.7152+a[2]*.0722;};
  const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
  for(const theme of [{id:'project',tokens:library.DEFAULT_TOKENS},...library.catalog.themes.map(t=>library.loadTheme(t.id))]){
    for(const bg of ['bg','surface','soft'])for(const fg of ['text','muted'])assert.ok(contrast(theme.tokens[bg],theme.tokens[fg])>=4.5,theme.id+': '+fg+'/'+bg);
    assert.ok(contrast(theme.tokens.accent,theme.tokens.accent_text)>=4.5,theme.id+': CTA');
    assert.ok(contrast(theme.tokens.border,theme.tokens.surface)>=3,theme.id+': control border');
  }
});

const hierarchy = {nodes:[{id:'root',label:'All records',parent_id:null},{id:'group-a',label:'Group A',parent_id:'root'},{id:'leaf-a',label:'Child A',parent_id:'group-a'},{id:'leaf-b',label:'Child B',parent_id:'root'}],columns:[{id:'select',label:'Select'},{id:'review',label:'Review'}],selected:[{node_id:'leaf-a',column_id:'select'}]};
test('hierarchy preserves three-level parent links and the same leaf identities in tree and matrix', () => {
  const tree=renderer.renderPatternDocument(makePreview('op-hierarchy',{variant:'tree',content:{hierarchy}}));
  const matrix=renderer.renderPatternDocument(makePreview('op-hierarchy',{variant:'matrix',content:{hierarchy}}));
  for(const html of [tree,matrix]){
    assert.equal((html.match(/data-node-id="leaf-a"/g)||[]).length,2);
    assert.equal((html.match(/data-node-id="leaf-b"/g)||[]).length,2);
    assert.equal((html.match(/type="checkbox"/g)||[]).length,4);
    assert.equal((html.match(/ checked/g)||[]).length,1);
  }
  assert.match(tree,/data-tree-node="group-a"[\s\S]*data-tree-node="leaf-a"/);
  const cycle=structuredClone(hierarchy);cycle.nodes[0].parent_id='leaf-a';
  assert.throws(()=>makePreview('op-tree',{content:{hierarchy:cycle}}),/hierarchy/i);
  const dangling=structuredClone(hierarchy);dangling.nodes[2].parent_id='outside';
  assert.throws(()=>makePreview('op-tree',{content:{hierarchy:dangling}}),/hierarchy/i);
});

test('record groups and form-flow comparisons retain every approved section and field', () => {
  const content={sections:[{title:'Group one',body:'OVERVIEW_ONLY_CONTENT'},{title:'Group two',body:'RELATED_ONLY_CONTENT'},{title:'Group three',body:'HISTORY_ONLY_CONTENT'}]};
  for(const id of ['record-groups','form-flow'])for(const option of createExampleScreen(id,{content}).options){
    const html=renderer.renderPatternDocument(option.preview);
    for(const section of content.sections)assert.ok(html.includes(section.body),`${id}/${option.id}: ${section.body}`);
    if(id==='form-flow')assert.equal((html.match(/<input /g)||[]).length,option.preview.content.fields.length,'No invented form fields');
  }
});

test('selection and handoff bind the exact chosen editable HTML bytes', () => {
  const s=screen(),response=formatCopiedResponse({screen:s,screen_digest:choices.visualScreenDigest(s),selected_option_ids:['split'],feedback:''});
  const result=choices.createVisualSelection({screen:s,response});
  const hash=html=>createHash('sha256').update(html).digest('hex');
  const selected=hash(renderer.renderPatternDocument(s.options[0].preview));
  assert.equal(result.options[0].editable_preview_sha256,selected);
  const valid=validateDesignHandoff({visual_selection:{screen:s,response,result},editable_source:{status:'available',format:'html',artifact_hash:'sha256:v1:'+selected}});
  assert.ok(!valid.errors.some(e=>e.code==='VISUAL_SELECTION_SOURCE_MISMATCH'));
  const bad=validateDesignHandoff({visual_selection:{screen:s,response,result},editable_source:{status:'available',format:'html',artifact_hash:'sha256:v1:'+hash(renderer.renderPatternDocument(s.options[1].preview))}});
  assert.ok(bad.errors.some(e=>e.code==='VISUAL_SELECTION_SOURCE_MISMATCH'));
  assert.throws(()=>choices.createVisualSelection({screen:s,response:{...response,approval:true}}),/response/i);
});
