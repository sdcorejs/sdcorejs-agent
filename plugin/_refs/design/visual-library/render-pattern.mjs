import { createHash } from 'node:crypto';
import { escapeText as e, loadTheme, DEFAULT_TOKENS, validatePatternPreview } from './library.mjs';
import { PATTERN_STYLES } from './styles.mjs';
import { PATTERN_SCRIPT } from './interaction.mjs';

const button=(label,attrs='',primary=false)=>`<button type="button" ${primary?'class="pp-primary" ':''}${attrs}>${e(label)}</button>`;
const fonts={sans:'system-ui,sans-serif',serif:'Georgia,serif',mono:'ui-monospace,monospace'};
function metrics(c){return `<div class="pp-metrics">${c.metrics.map(m=>`<div class="pp-card pp-metric"><small>${e(m.label)}</small><strong>${e(m.value)}</strong></div>`).join('')}</div>`;}
function sections(c){return c.sections.map(s=>`<article class="pp-card pp-stack"><h3>${e(s.title)}</h3><p>${e(s.body)}</p></article>`).join('');}
function table(c,l,{select=false}={}){return `<div class="pp-scroll" tabindex="0" role="region" aria-label="${e(c.title)}"><table><thead><tr>${c.columns.map(x=>`<th scope="col">${e(x)}</th>`).join('')}</tr></thead><tbody>${c.rows.map(row=>`<tr data-search-row>${row.map((cell,i)=>`<td>${select&&i===0?button(cell,`data-preview-record="${e(row[1]??cell)}" data-record-cells="${e(JSON.stringify(row))}" aria-label="${e(l.action+': '+cell)}"`):e(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p data-search-empty ${c.rows.length?'hidden':''}>${e(l.state_no_results)}</p>`;}
function search(l){return `<div class="pp-toolbar"><label>${e(l.search)}<input type="search" data-preview-search autocomplete="off"></label></div>`;}
function fields(c,l,indices=c.fields.map((_,i)=>i)){return `<div class="pp-fields">${indices.map(i=>`<label>${e(c.fields[i])}<input value="${e(c.rows[0]?.[i]??l.sample_value)}" autocomplete="off"></label>`).join('')}</div>`;}
function details(c,l,{tabs=false,sectioned=false}={}){
  const definition=`<dl class="pp-dl">${c.fields.map((field,i)=>`<dt>${e(field)}</dt><dd data-record-value="${i}">${e(c.rows[0]?.[i]??l.sample_value)}</dd>`).join('')}</dl>`;
  const group=(items)=>items.map(s=>`<article class="pp-card pp-stack"><h3>${e(s.title)}</h3><p>${e(s.body)}</p></article>`).join('');
  const panels=tabs?`<div class="pp-tabs" role="group" aria-label="${e(l.details)}">${c.tabs.map((tab,i)=>button(tab,`data-preview-tab="${i}" aria-pressed="${i===0}"`)).join('')}</div>${c.tabs.map((tab,i)=>`<section class="pp-stack" data-tab-panel="${i}" ${i?'hidden':''}><h4>${e(tab)}</h4>${i===0?definition:''}${group(c.sections.filter((_,j)=>Math.min(j,c.tabs.length-1)===i))}${i===Math.min(1,c.tabs.length-1)?table(c,l):''}</section>`).join('')}`:definition;
  return `<div class="pp-stack"><h3 data-detail-title>${e(c.rows[0]?.[1]??c.title)}</h3>${panels}${sectioned?group(c.sections)+table(c,l):''}</div>`;
}
function hierarchyChoice(h,node,column){const checked=h.selected.some(s=>s.node_id===node.id&&s.column_id===column.id);return `<label><input type="checkbox" data-node-id="${e(node.id)}" data-column-id="${e(column.id)}" aria-label="${e(node.label+': '+column.label)}"${checked?' checked':''}>${e(column.label)}</label>`;}
function tree(c,l,select){
  const h=c.hierarchy;
  function branch(parent){return h.nodes.filter(n=>n.parent_id===parent).map(node=>{
    const children=h.nodes.some(n=>n.parent_id===node.id);
    return children?`<details open data-tree-node="${e(node.id)}"><summary>${e(node.label)}</summary><div class="pp-tree">${branch(node.id)}</div></details>`:`<div class="pp-card" data-tree-node="${e(node.id)}"><strong>${e(node.label)}</strong>${select?`<div class="pp-tree-choices">${h.columns.map(col=>hierarchyChoice(h,node,col)).join('')}</div>`:''}</div>`;
  }).join('');}
  return `<div class="pp-tree">${branch(null)}</div>`;
}
function matrix(c){const h=c.hierarchy,parents=new Set(h.nodes.map(n=>n.parent_id)),leaves=h.nodes.filter(n=>!parents.has(n.id));const byId=new Map(h.nodes.map(n=>[n.id,n]));
  function lineage(node){const parts=[];for(let current=byId.get(node.parent_id);current;current=byId.get(current.parent_id))parts.unshift(current.label);return parts.join(' / ');}
  return `<div class="pp-scroll" tabindex="0" role="region" aria-label="${e(c.title)}"><table><thead><tr><th scope="col">${e(c.title)}</th>${h.columns.map(col=>`<th scope="col">${e(col.label)}</th>`).join('')}</tr></thead><tbody>${leaves.map(node=>`<tr><th scope="row">${e(node.label)}<br><small>${e(lineage(node))}</small></th>${h.columns.map(col=>`<td>${hierarchyChoice(h,node,col)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function form(c,l,variant){
  const grouped=c.sections.map((section,index)=>{const indices=c.fields.map((_,i)=>i).filter(i=>Math.floor(i*c.sections.length/c.fields.length)===index);return `<section class="pp-card pp-stack"><h3>${e(section.title)}</h3><p>${e(section.body)}</p>${indices.length?fields(c,l,indices):''}</section>`;}).join('');
  return `<section class="pp-form ${variant}">${variant==='sections'?grouped:`<div class="pp-card">${fields(c,l)}</div>`}${variant==='line-items'?`<section class="pp-card pp-stack"><h3>${e(l.section)}</h3>${table(c,l)}</section>`:''}<footer>${button(c.primary_action,'data-preview-action',true)}</footer></section>`;
}
function wizard(c,l,variant){return `<div class="pp-wizard ${variant}"><ol class="pp-steps">${c.steps.map((s,i)=>`<li>${button(`${i+1}. ${s}`,`data-preview-step="${i}" ${i===0?'aria-current="step"':''}`)}</li>`).join('')}</ol><div class="pp-form">${c.steps.map((s,i)=>`<section class="pp-card pp-stack" data-step-panel="${i}" ${i?'hidden':''}><h3>${e(s)}</h3>${i===0?fields(c,l)+sections(c):details(c,l)}</section>`).join('')}<footer>${button(l.back,'data-step-back disabled')}${button(l.next,'data-step-next',true)}${button(c.primary_action,'data-preview-action')}</footer></div></div>`;}
function operational(p){const {content:c,labels:l,variant:v,pattern_id:id}=p;
  if(id==='op-list')return `${v==='summary'?metrics(c):''}${search(l)}<section class="pp-card">${table(c,l)}</section>`;
  if(id==='op-tree')return tree(c,l,false);
  if(id==='op-split')return `${search(l)}<div class="pp-split"><section class="pp-card">${table(c,l,{select:true})}</section><section class="pp-card">${details(c,l)}</section></div>`;
  if(id==='op-detail')return `${metrics(c)}<section class="pp-card">${details(c,l,{tabs:v==='tabs',sectioned:v==='overview'})}</section>`;
  if(id==='op-form')return form(c,l,v);
  if(id==='op-wizard')return wizard(c,l,v);
  if(id==='op-drawer')return `${search(l)}<div class="pp-drawer-wrap"><section class="pp-card">${table(c,l,{select:true})}</section><aside class="pp-card pp-drawer" data-preview-drawer aria-label="${e(l.details)}"><header><h3>${e(l.details)}</h3>${button(l.close,'data-close-drawer')}</header>${details(c,l,{sectioned:v==='sections'})}</aside></div>`;
  if(id==='op-hierarchy')return v==='tree'?tree(c,l,true):matrix(c);
  throw new TypeError('Unsupported operational pattern');
}
function website(p){const {content:c,labels:l,variant:v,pattern_id:id}=p;
  const nav=`<header class="pp-web-nav"><strong class="pp-brand">${e(c.brand)}</strong><span>${c.navigation.map(e).join(' · ')}</span>${button(c.primary_action,'data-preview-action')}</header>`;
  if(id==='web-editorial')return `${nav}<section class="pp-editorial ${v}"><p>${e(c.brand)}</p><h2>${e(c.title)}</h2><p>${e(c.subtitle)}</p><div class="pp-grid">${c.sections.map(s=>`<article class="pp-card pp-stack"><div class="pp-art" aria-hidden="true"></div><h3>${e(s.title)}</h3><p>${e(s.body)}</p>${button(l.choose,'data-preview-action')}</article>`).join('')}</div></section>`;
  if(id==='web-pricing')return `${nav}<section class="pp-pricing"><h2>${e(c.title)}</h2><p>${e(c.subtitle)}</p>${v==='cards'?`<div class="pp-grid">${c.sections.map(s=>`<article class="pp-card"><h3>${e(s.title)}</h3><p>${e(s.body)}</p><strong class="pp-price">${e(l.sample_price)}</strong><small>${e(l.sample_term)}</small>${button(c.primary_action,'data-preview-action',true)}</article>`).join('')}</div>`:table(c,l)}</section>`;
  return `${nav}<section class="pp-hero"><div><small>${e(c.brand)}</small><h2>${e(c.title)}</h2><p>${e(c.subtitle)}</p>${button(c.primary_action,'data-preview-action',true)}</div><div class="pp-hero-visual"><div class="pp-window-bar" aria-hidden="true"><i></i><i></i><i></i><span>${e(c.brand)}</span></div>${id==='web-service'?`<div class="pp-stack">${c.steps.map((s,i)=>`<article class="pp-card"><small>${e(l.sample_step)} ${i+1}</small><h3>${e(s)}</h3></article>`).join('')}</div>`:`${metrics(c)}<div class="pp-card">${table(c,l)}</div>`}</div></section><section class="pp-web-sections"><div class="pp-grid">${sections(c)}</div></section>`;
}

export function renderPattern(preview){
  const errors=validatePatternPreview(preview);if(errors.length)throw new TypeError(errors.join('; '));
  const p=preview,c=p.content,l=p.labels,tokens={...DEFAULT_TOKENS,...loadTheme(p.theme_id).tokens,...p.tokens};
  const style=Object.entries(tokens).map(([k,v])=>`--pp-${k}:${k==='font'?fonts[v]:v}`).join(';');
  const controls=`<div class="pp-controls"><label>${e(l.viewport)}<select data-preview-viewport>${['desktop','tablet','mobile'].map(v=>`<option value="${v}" ${v===p.viewport?'selected':''}>${e(l[v])}</option>`).join('')}</select></label><label>${e(l.state)}<select data-preview-state>${['data','loading','empty','no-results','error','permission-denied'].map(s=>`<option value="${s}" ${s===p.state?'selected':''}>${e(l[s])}</option>`).join('')}</select></label><small>${e(l.sample)}</small></div>`;
  const statePanels=['loading','empty','no-results','error','permission-denied'].map(s=>`<section class="pp-state" data-state-panel="${s}" ${p.state===s?'':'hidden'} role="status"><span class="pp-state-symbol" aria-hidden="true">${s==='loading'?'…':s==='error'?'!':'○'}</span><h3>${e(l[s])}</h3><p>${e(l['state_'+s.replaceAll('-','_')])}</p>${s==='error'?button(l.retry,'data-preview-retry'):''}</section>`).join('');
  const isWeb=p.pattern_id.startsWith('web-');
  const heading=isWeb?'':`<header class="pp-heading"><div><h2>${e(c.title)}</h2><p>${e(c.subtitle)}</p></div>${button(c.primary_action,'data-preview-action',true)}</header>`;
  const content=`<div class="pp-main ${isWeb?'pp-web '+p.variant:''}">${heading}<div data-preview-data ${p.state==='data'?'':'hidden'}>${isWeb?website(p):operational(p)}</div>${statePanels}</div>`;
  const shell=p.shell?`<div class="pp-shell"><nav class="pp-nav" aria-label="${e(c.brand)}"><strong class="pp-brand">${e(c.brand)}</strong><ul>${c.navigation.map(n=>`<li>${e(n)}</li>`).join('')}</ul></nav>${content}</div>`:content;
  return `<section class="pp" lang="${e(p.locale)}" style="${e(style)}" data-pattern-id="${e(p.pattern_id)}" data-variant="${e(p.variant)}" data-viewport="${p.viewport}" data-local-status="${e(l.status)}" aria-label="${e(c.title)}">${controls}<div class="pp-frame">${shell}</div><p class="pp-status" data-preview-status role="status" aria-live="polite"></p></section>`;
}

export function renderPatternDocument(preview){
  const fragment=renderPattern(preview),hash=createHash('sha256').update(PATTERN_SCRIPT).digest('base64');
  return `<!doctype html><html lang="${e(preview.locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'sha256-${hash}'; connect-src 'none'; img-src 'none'; base-uri 'none'; form-action 'none'"><title>${e(preview.content.title)}</title><style>${PATTERN_STYLES}</style></head><body class="pp-standalone"><main>${fragment}</main><script>${PATTERN_SCRIPT}</script></body></html>`;
}
