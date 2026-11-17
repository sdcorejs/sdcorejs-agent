/** Spatial variants share project tokens and remain readable when text is enlarged. */
export const EXPANDED_STYLES = `
.pp-dashboard{display:grid;gap:24px;align-items:start}
.pp-dashboard.activity-rail{grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)}
.pp-dashboard.overview>aside{grid-template-columns:repeat(3,minmax(0,1fr))}
.pp-dashboard aside p{font-size:.8125rem}
.pp-board{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:18px;align-items:start}
.pp-board-lane{min-width:0;padding:16px;background:var(--pp-wash);border:1px solid var(--pp-line);border-radius:12px}
.pp-board-lane>header{display:flex;align-items:start;justify-content:space-between;gap:12px;padding:0 0 20px}
.pp-board-lane h3{font-size:.875rem}
.pp-board-lane h4{font-size:.9375rem}
.pp-board-lane p{font-size:.8125rem}
.pp-count{background:var(--pp-soft);color:var(--pp-accent);border-radius:5px;min-width:26px;text-align:center;font-variant-numeric:tabular-nums}
.pp-section-layout{display:grid;gap:24px;align-items:start}
.pp-section-layout.with-sidebar{grid-template-columns:minmax(0,12rem) minmax(0,1fr)}
.pp-section-nav{display:grid;gap:6px;align-content:start}
.pp-section-nav button{text-align:left;border-color:transparent;background:transparent}
.pp-section-nav button[aria-pressed=true]{color:var(--pp-accent);background:var(--pp-soft);border-color:var(--pp-border)}
.pp-section-layout>.pp-stack>.pp-primary{justify-self:start}
.pp-file-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px}
.pp-file-grid h3{font-size:1rem}
.pp-file-grid .pp-dl{grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);margin:0;font-size:.6875rem}
.pp-file-mark{width:38px;height:46px;border:1px solid var(--pp-border);border-radius:3px 11px 3px 3px;background:var(--pp-soft);position:relative}
.pp-file-mark:after{content:'';position:absolute;left:8px;right:8px;top:20px;height:1px;background:var(--pp-accent);box-shadow:0 6px 0 var(--pp-accent)}
.pp-conversation,.pp-review{display:grid;gap:24px;align-items:start}
.pp-conversation.split{grid-template-columns:minmax(0,1fr) minmax(0,2fr)}
.pp-message-stream{background:var(--pp-surface);border-block:1px solid var(--pp-line)}
.pp-message{display:flex;gap:16px;padding:24px 20px;border-bottom:1px solid var(--pp-line)}
.pp-message:last-child{border-bottom:0}
.pp-message>div{min-width:0}.pp-message h3{font-size:.875rem;margin-bottom:8px}.pp-message p{font-size:.875rem;line-height:1.8}
.pp-avatar{display:grid;place-items:center;flex:none;align-self:start;width:32px;height:32px;border-radius:8px;background:var(--pp-soft);color:var(--pp-accent);font-size:.75rem;font-weight:650}
.pp-review.side-by-side{grid-template-columns:minmax(0,1.7fr) minmax(0,1fr)}
.pp-paper{background:var(--pp-surface);padding:36px;border:1px solid var(--pp-line);border-radius:3px;box-shadow:0 8px 24px #17283b06;min-width:0}
.pp-paper>section+section{margin-top:32px;padding-top:24px;border-top:1px solid var(--pp-line)}
.pp-paper h3{font-size:1.375rem;margin:8px 0 16px}.pp-paper p{line-height:1.9;font-size:.875rem}
.pp-review aside{min-width:0}.pp-review aside>p{font-size:.75rem}
.pp-content-page{padding:48px}
.pp-content-heading{max-width:48rem;margin-bottom:40px}
.pp-content-heading>small{display:block;color:var(--pp-accent);font-weight:650;letter-spacing:.1em;text-transform:uppercase;margin-bottom:16px}
.pp-content-heading h2{font-size:3.25rem;line-height:1.1;font-weight:550;letter-spacing:-.05em;text-wrap:balance}
.pp-content-heading p{margin-top:20px;max-width:60ch;font-size:1rem;line-height:1.8}
.pp-content-page .pp-section-layout p{line-height:1.9;font-size:.9375rem;max-width:70ch}
.pp-catalog{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.pp-catalog .pp-card{padding:0;overflow:hidden;align-content:start}
.pp-catalog .pp-card>.pp-stack{padding:0 24px 24px}.pp-catalog h3{font-size:1.25rem}.pp-catalog p{font-size:.875rem;line-height:1.8}
.pp-catalog button{justify-self:start}
.pp-catalog-art{display:grid;place-items:center;background:var(--pp-soft);min-height:160px;color:var(--pp-accent);border-bottom:1px solid var(--pp-line)}
.pp-catalog-art span{font-family:Georgia,serif;font-size:4.5rem;font-style:italic;opacity:.8}
.pp-catalog.featured{grid-template-columns:repeat(2,minmax(0,1fr))}
.pp-catalog.featured>.pp-card:first-child{grid-column:1/-1;grid-template-columns:1fr 1fr;align-items:center}
.pp-catalog.featured>.pp-card:first-child>.pp-stack{padding:24px}
.pp-catalog.featured>.pp-card:first-child .pp-catalog-art{height:100%;min-height:240px;border:0}
.pp-contact{display:grid;gap:32px;align-items:start}
.pp-contact.split{grid-template-columns:minmax(0,1fr) minmax(0,1.2fr)}
.pp-contact.centered{max-width:46rem;margin:auto}
.pp-contact .pp-fields{grid-template-columns:1fr}
.pp-contact aside .pp-card{border:0;border-radius:0;border-top:1px solid var(--pp-line);padding:24px 0}
.pp-contact aside p{line-height:1.8}
.pp-faq.split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:48px;align-items:start}
.pp-faq-list{min-width:0}
.pp-faq-list details{border-top:1px solid var(--pp-line);padding:20px 0}
.pp-faq-list summary{cursor:pointer;font-size:1rem;font-weight:600;padding:8px 0;min-height:44px}
.pp-faq-list details p{padding:16px 0 8px;line-height:1.9;font-size:.9375rem}
.pp-faq-list>button{margin-top:24px}
@container pattern (max-width:56.25rem){
  .pp-dashboard.activity-rail,.pp-dashboard.overview>aside,.pp-file-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pp-dashboard.activity-rail{grid-template-columns:1fr}
  .pp-content-page{padding:32px}
  .pp-conversation.split,.pp-review.side-by-side{grid-template-columns:1fr}
}
@container pattern (max-width:43.75rem){
  .pp-dashboard.overview>aside,.pp-file-grid,.pp-section-layout.with-sidebar,.pp-catalog,.pp-catalog.featured,.pp-contact.split,.pp-faq.split{grid-template-columns:1fr}
  .pp-catalog.featured>.pp-card:first-child{grid-template-columns:1fr}
  .pp-section-nav{grid-template-columns:repeat(auto-fit,minmax(min(100%,9rem),1fr))}
  .pp-content-page{padding:28px 24px}.pp-faq.split{gap:0}.pp-paper{padding:24px}
}
@container pattern (max-width:700px){.pp-content-heading h2{font-size:2.125rem}}
`;

export const THUMBNAIL_STYLES = `
.vc-options:has(.vc-thumbnail-option){grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
.vc-thumbnail-option>.vc-option{grid-template-columns:1fr;padding:20px;gap:10px}
.vc-thumbnail-option>.vc-option>:is(.vc-number,.vc-label,.vc-summary,.vc-detail){grid-column:1;grid-row:auto}
.vc-thumbnail-option .vc-thumbnail{grid-column:1;display:block;width:100%;height:220px;object-fit:contain;background:#f3f5f8;border:1px solid #c4ccd8;border-radius:8px}
.vc-thumbnail-option details{margin-top:12px;border:1px solid #c4ccd8;border-radius:8px;background:white;padding:12px;color:#17283b;min-width:0}
.vc-thumbnail-option summary{cursor:pointer;font-size:.875rem;font-weight:600;overflow-wrap:anywhere}
.vc-thumbnail-option summary:focus-visible{outline:3px solid #2457a7;outline-offset:3px}
.vc-thumbnail-option:has(>details[open]){grid-column:1/-1}
.vc-thumbnail-option:has(>details[open])>.vc-option{max-width:36rem}
.vc-thumbnail-option details>.vc-preview{margin-top:16px}
@media(max-width:700px){.vc-options:has(.vc-thumbnail-option){grid-template-columns:1fr}.vc-thumbnail-option .vc-thumbnail{height:180px}}
`;
