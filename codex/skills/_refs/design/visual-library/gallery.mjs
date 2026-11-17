import { createHash } from 'node:crypto';
import { catalog, loadPattern, createPatternPreview, escapeText as e } from './library.mjs';
import { resolveThumbnail } from './thumbnails.mjs';
import { renderPattern } from './render-pattern.mjs';
import { PATTERN_STYLES } from './styles.mjs';
import { PATTERN_SCRIPT } from './interaction.mjs';

const SCRIPT=PATTERN_SCRIPT+`document.querySelector('[data-gallery-search]').addEventListener('input',function(){var count=0;document.querySelectorAll('[data-gallery-card]').forEach(function(card){card.hidden=!card.dataset.search.includes(this.value.toLowerCase());if(!card.hidden)count++;},this);document.querySelector('[data-gallery-empty]').hidden=count>0;});`;
const STYLE=`body{margin:0;background:#f3f5f8;color:#17283b;font:16px/1.65 system-ui;padding:36px 24px}body>main{max-width:1320px;margin:auto}h1{font-size:2.5rem;line-height:1.15;letter-spacing:-.05em;margin:0 0 16px}p{color:#506176}label{display:grid;gap:8px;max-width:32rem;margin:24px 0}input{font:inherit;padding:12px;border:1px solid #7c8b9d;border-radius:8px}[data-gallery-search]{box-sizing:border-box;min-width:0;width:100%;max-width:100%}input:focus-visible,summary:focus-visible{outline:3px solid #2457a7;outline-offset:3px}.vg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,18rem),1fr));gap:24px}.vg-card{min-width:0;background:white;border:1px solid #c4ccd8;border-radius:12px;overflow:hidden}.vg-card[hidden]{display:none}.vg-card summary{cursor:pointer;list-style:none;padding:16px}.vg-card summary::-webkit-details-marker{display:none}.vg-thumb{display:block;width:100%;height:190px;object-fit:contain;background:#f3f5f8;border:1px solid #e0e5ed;border-radius:6px;margin-bottom:16px}.vg-title{display:block;font-size:1.0625rem;font-weight:650}.vg-caption{display:block;font-size:.8125rem;color:#506176;margin:8px 0}.vg-open{display:block;font-size:.8125rem;color:#2457a7;text-decoration:underline}.vg-card:has(>details[open]){grid-column:1/-1}.vg-card details[open]>summary{max-width:24rem}.vg-card .pp{margin:0 16px 16px}.vg-meta{font-size:.75rem;overflow-wrap:anywhere}body>main>p{max-width:75ch}@media(max-width:600px){body{padding:24px 12px}h1{font-size:2rem}}`;

/** Library browsing uses English illustrative content; it does not record approval. */
export function renderThumbnailGallery({thumbnail_directory}={}){
  const cards=catalog.patterns.flatMap(entry=>{
    const pattern=loadPattern(entry.id);
    return pattern.variants.map(variant=>{
      const preview=createPatternPreview({pattern_id:entry.id,variant:variant.id}),image=resolveThumbnail(preview,{directory:thumbnail_directory});
      const title=pattern.name+' / '+variant.id;
      const thumb=image.status==='available'?`<img class="vg-thumb" src="${image.data_url}" alt="${e('Illustrative layout: '+title)}" width="${image.width}" height="${image.height}" loading="lazy">`:'<p class="vg-thumb">Thumbnail unavailable. Open the full HTML preview.</p>';
      return `<article class="vg-card" data-gallery-card data-search="${e([entry.id,title,...pattern.jobs].join(' ').toLowerCase())}"><details><summary>${thumb}<span class="vg-title">${e(title)}</span><span class="vg-caption">${e(pattern.applicability)}</span><span class="vg-meta">${e(entry.id+'/'+variant.id)}</span><span class="vg-open">Open full preview</span></summary>${renderPattern(preview)}</details></article>`;
    });
  });
  const scriptHash=createHash('sha256').update(SCRIPT).digest('base64');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'sha256-${scriptHash}'; img-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'"><title>SDCoreJS layout gallery</title><style>${PATTERN_STYLES}${STYLE}</style></head><body><main><h1>Find a layout worth exploring.</h1><p>${catalog.patterns.length} families · ${cards.length} variants. These are illustrative layouts, not final project designs. Open a preview to inspect it; share its pattern and variant with your agent.</p><label>Find a layout<input type="search" data-gallery-search placeholder="Dashboard, settings, catalog..." autocomplete="off"></label><p data-gallery-empty hidden>No matching layouts. Try another task or pattern name.</p><section class="vg-grid" aria-label="Layout thumbnails">${cards.join('')}</section></main><script>${SCRIPT}</script></body></html>`;
}
