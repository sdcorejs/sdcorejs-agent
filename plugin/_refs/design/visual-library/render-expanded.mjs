import { escapeText as e } from './library.mjs';

// Shared helpers escape labels; only fixed attributes/classes are supplied here.
// These compositions intentionally omit delivery, file access and workflow mutation.
function panels(c, l, variant, {button, fields}, editable=false) {
  const side=variant==='sidebar';
  const navigation=side?`<div class="pp-section-nav" role="group" aria-label="${e(l.section)}">${c.sections.map((s,i)=>button(s.title,`data-preview-tab="${i}" aria-pressed="${i===0}"`)).join('')}</div>`:'';
  const content=c.sections.map((s,i)=>{
    const indices=editable?c.field_groups[i]:[];
    return `<section class="pp-card pp-stack" ${side?`data-tab-panel="${i}" ${i?'hidden':''}`:''}><small>${e(l.section)} ${i+1}</small><h3>${e(s.title)}</h3><p>${e(s.body)}</p>${editable&&indices.length?fields(c,l,indices):''}</section>`;
  }).join('');
  return `<div class="pp-section-layout ${side?'with-sidebar':''}">${navigation}<div class="pp-stack">${content}${editable?button(c.primary_action,'data-preview-action',true):''}</div></div>`;
}

export function renderExpandedOperational(p,h) {
  const {content:c,labels:l,variant:v,pattern_id:id}=p;
  const {button,metrics,sections,table,search}=h;
  if(id==='op-dashboard')return `${metrics(c)}<div class="pp-dashboard ${v}"><section class="pp-card">${table(c,l)}</section><aside class="pp-stack">${sections(c)}</aside></div>`;
  if(id==='op-board')return `<div class="pp-board">${c.groups.map(g=>`<section class="pp-board-lane"><header><h3>${e(g.title)}</h3><span class="pp-count">${g.items.length}</span></header><div class="pp-stack">${g.items.map(item=>`<article class="pp-card pp-stack"><h4>${e(item.title)}</h4><p>${e(item.body)}</p></article>`).join('')}${g.items.length?'':`<p>${e(l.state_empty)}</p>`}</div></section>`).join('')}</div>`;
  if(id==='op-settings')return panels(c,l,v,h,true);
  if(id==='op-files')return `${search(l)}${v==='list'?`<section class="pp-card">${table(c,l)}</section>`:`<div class="pp-file-grid">${c.rows.map(row=>`<article class="pp-card pp-stack" data-search-row><div class="pp-file-mark" aria-hidden="true"></div><h3>${e(row[0])}</h3><dl class="pp-dl">${row.slice(1).map((value,i)=>`<dt>${e(c.columns[i+1])}</dt><dd>${e(value)}</dd>`).join('')}</dl></article>`).join('')}</div><p data-search-empty ${c.rows.length?'hidden':''}>${e(l.state_no_results)}</p>`}`;
  if(id==='op-messages')return `<div class="pp-conversation ${v}"><aside class="pp-card">${table(c,l)}</aside><section class="pp-message-stream">${c.sections.map((s,i)=>`<article class="pp-message"><span class="pp-avatar" aria-hidden="true">${i+1}</span><div><h3>${e(s.title)}</h3><p>${e(s.body)}</p></div></article>`).join('')}</section></div>`;
  if(id==='op-review')return `<div class="pp-review ${v}"><article class="pp-paper">${c.sections.map((s,i)=>`<section><small>${e(l.section)} ${i+1}</small><h3>${e(s.title)}</h3><p>${e(s.body)}</p></section>`).join('')}</article><aside class="pp-card pp-stack"><h3>${e(l.details)}</h3>${table(c,l)}<p>${e(l.sample)}</p>${button(c.primary_action,'data-preview-action')}</aside></div>`;
  return null;
}

export function renderExpandedWebsite(p,h) {
  const {content:c,labels:l,variant:v,pattern_id:id}=p;
  if(!['web-docs','web-catalog','web-contact','web-faq'].includes(id))return null;
  const {button,sections,fields}=h;
  const heading=`<header class="pp-content-heading"><small>${e(c.brand)}</small><h2>${e(c.title)}</h2><p>${e(c.subtitle)}</p></header>`;
  if(id==='web-docs')return `<div class="pp-content-page">${heading}${panels(c,l,v,h)}</div>`;
  if(id==='web-catalog')return `<div class="pp-content-page">${heading}<div class="pp-catalog ${v}">${c.sections.map((s,i)=>`<article class="pp-card pp-stack"><div class="pp-catalog-art" aria-hidden="true"><span>${String(i+1).padStart(2,'0')}</span></div><div class="pp-stack"><h3>${e(s.title)}</h3><p>${e(s.body)}</p>${button(l.choose,'data-preview-action')}</div></article>`).join('')}</div></div>`;
  if(id==='web-contact')return `<div class="pp-content-page">${heading}<div class="pp-contact ${v}"><aside class="pp-stack">${sections(c)}</aside><section class="pp-card pp-stack">${fields(c,l)}${button(c.primary_action,'data-preview-action',true)}<small>${e(l.sample)}</small></section></div></div>`;
  return `<div class="pp-content-page"><div class="pp-faq ${v}">${heading}<section class="pp-faq-list">${c.sections.map(s=>`<details><summary>${e(s.title)}</summary><p>${e(s.body)}</p></details>`).join('')}${button(c.primary_action,'data-preview-action')}</section></div></div>`;
}
