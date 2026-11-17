/** Shared preview design: restrained work surfaces, distinct website compositions. */
import { EXPANDED_STYLES, THUMBNAIL_STYLES } from './styles-expanded.mjs';
export const PATTERN_STYLES = `
.pp {
  --pp-bg:#f3f5f8; --pp-surface:#fff; --pp-text:#17283b;
  --pp-muted:#506176; --pp-border:#7c8b9d; --pp-accent:#2457a7;
  --pp-accent_text:#fff; --pp-soft:#e8eff9;
  --pp-line:color-mix(in srgb,var(--pp-border) 26%,var(--pp-surface));
  --pp-wash:color-mix(in srgb,var(--pp-bg) 55%,var(--pp-surface));
  color:var(--pp-text); background:var(--pp-wash);
  font:0.875rem/1.55 var(--pp-font,system-ui); text-align:left;
  border:1px solid var(--pp-line); border-radius:14px; overflow:hidden; min-width:0;
  box-shadow:0 2px 6px #17283b05,0 18px 42px #17283b08;
}
.pp *{box-sizing:border-box}
.pp [hidden]{display:none!important}
.pp :is(button,input,select){font:inherit;color:inherit}
.pp :is(button,select){cursor:pointer}
.pp button {
  border:1px solid var(--pp-border); border-radius:7px;
  background:var(--pp-surface); padding:8px 14px; min-height:40px;
  font-size:0.8125rem; font-weight:600; line-height:1.4;
}
.pp button:hover{background:var(--pp-soft)}
.pp :focus-visible{outline:3px solid var(--pp-accent);outline-offset:3px}
.pp .pp-primary{background:var(--pp-accent);color:var(--pp-accent_text);border-color:var(--pp-accent)}
.pp .pp-primary:hover{background:var(--pp-accent);color:var(--pp-accent_text);text-decoration:underline;text-underline-offset:3px}
.pp button:disabled{cursor:default}
.pp input:not([type=checkbox]),.pp select {
  background:var(--pp-surface);border:1px solid var(--pp-border);border-radius:7px;
  max-width:100%;min-width:0;padding:9px 12px;min-height:40px;
}
.pp input[type=checkbox]{accent-color:var(--pp-accent);width:18px;height:18px;flex:none}
.pp :is(h2,h3,h4,p){margin:0}
.pp h2{font-size:1.75rem;line-height:1.2;font-weight:650;letter-spacing:-.045em}
.pp h3{font-size:1.125rem;line-height:1.35;font-weight:650;letter-spacing:-.025em}
.pp h4{font-size:0.8125rem;font-weight:650}
.pp p{color:var(--pp-muted)}
.pp label{display:grid;gap:6px;font-size:0.75rem;font-weight:500}
.pp small{color:var(--pp-muted);font-size:0.6875rem}
.pp :is(h2,h3,h4,p,button,label,summary,dt,dd){overflow-wrap:anywhere}
.pp-controls {
  display:flex;align-items:center;gap:16px;flex-wrap:wrap;
  background:var(--pp-surface);padding:10px 20px;border-bottom:1px solid var(--pp-line);
}
.pp-controls label{display:flex;align-items:center;gap:8px;font-size:0.625rem;font-weight:500;color:var(--pp-muted)}
.pp-controls select{padding:4px 8px;min-height:30px;font-size:0.6875rem}
.pp-controls small{margin-left:auto;font-size:0.625rem}
.pp-frame{width:100%;margin:auto;max-width:1280px;container-type:inline-size;container-name:pattern}
.pp[data-viewport=tablet] .pp-frame{max-width:768px}
.pp[data-viewport=mobile] .pp-frame{max-width:390px}
.pp-shell{display:grid;grid-template-columns:11rem minmax(0,1fr);min-height:570px}
.pp-nav{padding:30px 14px;background:var(--pp-surface);border-right:1px solid var(--pp-line)}
.pp-brand{display:flex;align-items:center;gap:10px;font-weight:750;letter-spacing:-.055em;font-size:1.25rem;margin:0 8px 36px;min-width:0;overflow-wrap:anywhere}
.pp-brand::before{content:'';width:19px;height:19px;border-radius:5px;background:var(--pp-accent);box-shadow:inset -7px -7px 0 color-mix(in srgb,var(--pp-accent_text) 23%,transparent);flex:none}
.pp-nav ul{list-style:none;padding:0;margin:0;display:grid;gap:4px}
.pp-nav li{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:7px;font-size:0.75rem;color:var(--pp-muted)}
.pp-nav li::before{content:'';width:12px;height:12px;border:1.5px solid currentColor;border-radius:3px;flex:none;opacity:.7}
.pp-nav li:first-child{color:var(--pp-accent);background:var(--pp-soft);font-weight:650}
.pp-main{padding:32px;min-width:0}
.pp-heading{display:flex;justify-content:space-between;align-items:center;gap:24px;margin-bottom:30px}
.pp-heading p{margin-top:8px;max-width:55ch;font-size:0.75rem}
.pp-heading button{flex-shrink:0;max-width:100%;min-width:0}
.pp-card{background:var(--pp-surface);border:1px solid var(--pp-line);border-radius:10px;padding:20px;min-width:0}
.pp-stack{display:grid;gap:16px}
.pp-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.pp-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-bottom:20px}
.pp-metric{padding:20px;overflow-wrap:anywhere}
.pp-metric small{font-size:0.6875rem;font-weight:500}
.pp-metric strong{display:block;margin-top:9px;font-size:1.875rem;font-weight:600;letter-spacing:-.055em;line-height:1.1;font-variant-numeric:tabular-nums}
.pp-toolbar{display:flex;gap:16px;flex-wrap:wrap;align-items:end;margin-bottom:16px}
.pp-toolbar label{color:var(--pp-muted);font-size:0.6875rem}
.pp-toolbar input{width:260px}
.pp .pp-scroll:focus-visible{outline-offset:-3px}
.pp-scroll{overflow:auto;max-width:100%;overscroll-behavior-inline:contain}
.pp table{border-collapse:collapse;width:100%;min-width:420px;font-size:0.75rem;background:var(--pp-surface)}
.pp th{text-align:left;background:var(--pp-wash);font-size:0.625rem;font-weight:600;letter-spacing:.045em;color:var(--pp-muted)}
.pp td,.pp th{border-bottom:1px solid var(--pp-line);padding:15px 16px;vertical-align:middle;overflow-wrap:normal;word-break:normal}
.pp td:first-child{font-weight:650;font-variant-numeric:tabular-nums;white-space:nowrap}
.pp td:last-child{color:var(--pp-muted);font-size:0.6875rem}
.pp tr:last-child td{border-bottom:0}
.pp tbody tr:hover,.pp tr:focus-within{background:var(--pp-soft)}
.pp td button{padding:3px 0;min-height:32px;border:0;background:transparent;color:var(--pp-accent);font-size:0.75rem;font-weight:650;white-space:nowrap}
.pp td button:hover{text-decoration:underline;text-underline-offset:3px;background:transparent}
.pp-card:has(>.pp-scroll){padding:0;overflow:hidden}
.pp-card>[data-search-empty]{padding:20px}
.pp-split{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(250px,1fr);gap:20px;align-items:start}
.pp-split>.pp-card:last-child{padding:24px}
.pp-split h3{font-size:1.4375rem;font-weight:600;letter-spacing:-.045em}
.pp-drawer-wrap{position:relative;min-height:430px}
.pp-drawer{position:absolute;inset:0 0 auto auto;width:52%;height:100%;max-height:100%;overflow:auto;border-radius:10px;box-shadow:-12px 0 48px #17283b1a;z-index:1;padding:24px}
.pp-drawer header{display:flex;justify-content:space-between;gap:16px;align-items:center;padding-bottom:20px;margin-bottom:20px;border-bottom:1px solid var(--pp-line)}
.pp-drawer header h3{font-size:0.6875rem;font-weight:600;color:var(--pp-muted)}
.pp-drawer header button{font-size:0.625rem;min-height:30px;padding:5px 8px;flex-shrink:0}
.pp-dl{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.5fr);gap:0 16px;margin:8px 0;font-size:0.75rem}
.pp-dl dt,.pp-dl dd{padding:12px 0;border-bottom:1px solid var(--pp-line)}
.pp-dl dt{color:var(--pp-muted)}
.pp-dl dd{margin:0;font-weight:550}
.pp-dl dt:nth-last-of-type(1),.pp-dl dd:last-child{border-bottom:0}
.pp-tabs{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0 8px;border-bottom:1px solid var(--pp-line)}
.pp-tabs button{background:transparent;border:0;border-radius:0;padding:10px 14px;font-size:0.75rem;color:var(--pp-muted)}
.pp-tabs button[aria-pressed=true]{color:var(--pp-accent);box-shadow:inset 0 -2px var(--pp-accent)}
.pp-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.pp-form{max-width:760px;display:grid;gap:20px}
.pp-form.compact{max-width:520px}
.pp-form.compact .pp-fields{grid-template-columns:1fr}
.pp-form footer{display:flex;justify-content:end;gap:8px;padding-top:4px;flex-wrap:wrap}
.pp-form .pp-card{padding:24px}
.pp-steps{display:flex;gap:8px;list-style:none;padding:0;margin:0 0 24px;flex-wrap:wrap}
.pp-steps button{border-color:var(--pp-line);font-size:0.75rem}
.pp-steps button[aria-current=step]{background:var(--pp-accent);color:var(--pp-accent_text)}
.pp-wizard.vertical{display:grid;grid-template-columns:160px minmax(0,1fr);gap:24px}
.pp-wizard.vertical .pp-steps{flex-direction:column}
.pp-tree{display:grid;gap:10px}
.pp-tree details{border:1px solid var(--pp-line);border-radius:8px;padding:16px;background:var(--pp-surface)}
.pp-tree summary{cursor:pointer;font-weight:600;font-size:0.75rem;padding-bottom:8px}
.pp-tree .pp-card{padding:12px 16px;border-radius:6px}
.pp-tree label{display:flex;align-items:center;font-size:0.6875rem}
.pp-tree-choices{display:flex;flex-wrap:wrap;gap:12px;margin-top:8px}
.pp-state{padding:60px 24px;text-align:center;border:1px solid var(--pp-line);border-radius:10px;background:var(--pp-surface);display:grid;justify-items:center;gap:12px}
.pp-state-symbol{display:grid;place-items:center;width:48px;height:48px;border-radius:14px;background:var(--pp-soft);font-size:1.5rem;color:var(--pp-accent)}
.pp-state p{max-width:45ch;font-size:0.75rem}
.pp-status{padding:10px 20px;font-size:0.6875rem;border-top:1px solid var(--pp-line);background:var(--pp-surface)}
.pp-status:empty{display:none}

/* Websites get a page composition, not the portal's card density. */
.pp-main.pp-web{padding:0;background:var(--pp-surface)}
.pp-web-nav{display:flex;flex-wrap:wrap;justify-content:space-between;gap:24px;align-items:center;padding:24px 40px;border-bottom:1px solid var(--pp-line)}
.pp-web-nav .pp-brand{margin:0;font-size:1.375rem}
.pp-web-nav>span{font-size:0.6875rem;color:var(--pp-muted);word-spacing:8px}
.pp-web-nav button{font-size:0.6875rem;min-height:36px}
.pp-hero{padding:72px 48px 64px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:40px;align-items:center}
.pp-hero>*{min-width:0}
.pp-hero>div>small{display:block;font-size:0.625rem;letter-spacing:.14em;text-transform:uppercase;font-weight:650;color:var(--pp-accent);margin-bottom:18px}
.pp-hero h2{font-size:4rem;font-weight:550;line-height:1.04;letter-spacing:-.06em;max-width:15ch;text-wrap:balance}
.pp-hero p{margin:22px 0 28px;max-width:42ch;font-size:0.8125rem;line-height:1.8}
.pp-hero .pp-primary{padding:13px 20px;min-height:44px}
.pp-hero-visual{min-width:0;background:var(--pp-wash);border:1px solid var(--pp-line);border-radius:12px;padding:20px;box-shadow:0 4px 10px #17283b05,0 24px 48px #17283b10}
.pp-window-bar{display:flex;align-items:center;gap:5px;border-bottom:1px solid var(--pp-line);margin:-20px -20px 20px;padding:12px 16px;background:var(--pp-surface);border-radius:12px 12px 0 0}
.pp-window-bar i{width:5px;height:5px;border-radius:50%;background:var(--pp-border)}
.pp-window-bar span{margin-left:auto;font-size:0.5625rem;letter-spacing:.03em;color:var(--pp-muted)}
.pp-hero-visual .pp-metrics{gap:10px;margin-bottom:14px}
.pp-hero-visual .pp-metric{padding:14px;border-radius:7px}
.pp-hero-visual .pp-metric strong{font-size:1.6875rem}
.pp-hero-visual .pp-metric small{font-size:0.5625rem}
.pp-hero-visual :is(th,td){padding:12px;font-size:0.625rem}
.pp-web-sections{padding:24px 48px 56px}
.pp-web-sections .pp-grid{gap:28px}
.pp-web-sections article{padding:24px 0 0;border:0;border-top:1px solid var(--pp-line);border-radius:0;gap:10px;background:transparent}
.pp-web-sections h3{font-size:1.0625rem;max-width:24ch;line-height:1.4}
.pp-web-sections p{font-size:0.75rem;line-height:1.8;max-width:34ch}
.pp-web.story-led .pp-hero{grid-template-columns:1fr;text-align:center;gap:44px;padding-top:56px}
.pp-web.story-led .pp-hero h2,.pp-web.story-led .pp-hero p{margin-left:auto;margin-right:auto}
.pp-web.story-led .pp-hero h2{max-width:18ch;font-size:4.5rem}
.pp-web.story-led .pp-hero-visual{width:min(100%,780px);margin:auto;text-align:left}
.pp-web.process-led .pp-grid{grid-template-columns:1fr}
.pp-web.process-led .pp-web-sections article{display:grid;grid-template-columns:1fr 1.5fr;align-items:start;padding:28px 0;max-width:none}
.pp-web.process-led .pp-web-sections p{max-width:none}
.pp-editorial{padding:48px}
.pp-editorial h2{font-size:5.125rem;font-weight:500;line-height:1.03;letter-spacing:-.06em;margin:24px 0;max-width:15ch}
.pp-editorial .pp-grid{margin-top:48px;grid-template-columns:2fr 1fr}
.pp-editorial .pp-card{padding:0;border:0;border-radius:0;background:transparent;gap:12px}
.pp-editorial.gallery .pp-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
.pp-art{height:200px;background:var(--pp-soft);border:1px solid var(--pp-line);border-radius:3px;position:relative;overflow:hidden}
.pp-art::after{content:'';position:absolute;inset:18% 24%;border:18px solid var(--pp-accent);border-radius:50%}
.pp-editorial article:nth-child(2) .pp-art::after{border-radius:0;inset:25%;border-width:1px;background:var(--pp-accent)}
.pp-editorial article:nth-child(3) .pp-art::after{border-radius:50% 50% 0 0;inset:20% 22% 0;border-width:1px;background:var(--pp-accent)}
.pp-price{font-size:1.5625rem;letter-spacing:-.04em;display:block;margin:20px 0 8px}
.pp-pricing{padding:56px 48px}
.pp-pricing>h2{text-align:center;font-size:2.375rem;letter-spacing:-.05em}
.pp-pricing>p{text-align:center;max-width:50ch;margin:16px auto 40px;font-size:0.8125rem}
.pp-pricing article{display:grid;gap:12px;padding:28px}
.pp-pricing article:nth-child(2){border-color:var(--pp-accent);box-shadow:0 8px 24px #17283b0a}
.pp-pricing .pp-primary{margin-top:12px}

/* Keep decision controls distinct and secondary to the actual design. */
body:has([data-static-visual] .pp){margin:0;max-width:none;padding:40px 24px;background:#f6f7f9;color:#17283b;font:0.875rem/1.6 system-ui,sans-serif}
main:has(.pp){max-width:1240px;margin-inline:auto}
main:has(.pp)>h1{font-size:2rem;line-height:1.2;letter-spacing:-.04em;font-weight:650;max-width:26ch;margin:0 0 16px}
main:has(.pp)>p{font-size:0.75rem;color:#506176;max-width:80ch}
main:has(.pp) #selection-help{font-size:0.6875rem}
main:has(.pp) .vc-note{font-size:0.6875rem;margin-bottom:24px}
.vc-options:has(.pp){grid-template-columns:1fr;gap:32px;margin:24px 0 32px}
.vc-pattern-option{min-width:0}
.vc-pattern-option>.vc-option{height:auto;border:1px solid #c4ccd8;border-radius:12px;background:#fff;padding:20px 24px;display:grid;grid-template-columns:32px minmax(0,1fr);column-gap:16px;row-gap:5px;font:inherit;color:#17283b}
.vc-pattern-option .vc-number{grid-row:1 / span 4;grid-column:1;align-self:start;display:grid;place-items:center;width:30px;height:30px;background:#edf1f6;border-radius:50%;font-size:0.75rem;font-weight:650}
.vc-pattern-option .vc-label{grid-column:2;font-size:1.125rem;font-weight:650;letter-spacing:-.025em;display:flex;align-items:center;flex-wrap:wrap;gap:12px}
.vc-pattern-option .vc-summary{grid-column:2;font-size:0.75rem;color:#506176}
.vc-pattern-option .vc-detail{grid-column:2;font-size:0.6875rem;color:#506176}
.vc-pattern-option .vc-detail strong{font-weight:600;color:#17283b}
.vc-pattern-option .vc-recommended{font-size:0.5625rem;letter-spacing:0;font-weight:600;border-radius:4px;background:#edf1f6;padding:3px 7px;color:#365476}
.vc-pattern-option>.vc-option[data-recommended=true] .vc-label::after{content:none}
.vc-pattern-option>.vc-option[aria-checked=true]{border-color:#2457a7;background:#f3f7ff;box-shadow:0 0 0 1px #2457a7}
.vc-pattern-option>.vc-option[aria-checked=true] .vc-number{background:#2457a7;color:#fff}
.vc-pattern-option>.vc-preview{margin:12px 0 0;min-width:0}
.vc-pattern-option .pp{font-weight:400}
main:has(.pp)>label{font-size:0.75rem;font-weight:600;display:block;margin-top:28px}
[data-static-visual]:has(.pp)>[data-copy-output][hidden]{display:none}
main:has(.pp)>textarea{box-sizing:border-box;max-width:100%;width:100%;border:1px solid #7c8b9d;border-radius:8px;padding:12px;background:#fff;color:#17283b;font:0.8125rem/1.6 system-ui}
main:has(.pp)>button{margin-top:12px;border:1px solid #2457a7;border-radius:7px;background:#2457a7;color:#fff;padding:10px 16px;font:600 0.75rem/1.5 system-ui;cursor:pointer}
main:has(.pp) .vc-fallback{border-top:1px solid #c4ccd8;margin-top:28px;padding-top:20px;font-size:0.75rem}
main:has(.pp) .vc-fallback summary{cursor:pointer;font-weight:600;color:#506176}
main:has(.pp) pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:0.6875rem}
.pp-standalone{margin:0;background:#edf0f4;padding:24px;font-family:system-ui}
.pp-standalone>main{max-width:1280px;margin:auto}

/* Collapse by available text space when the user enlarges their font. */
@container pattern (max-width:56.25rem){

  .pp-shell{grid-template-columns:8.75rem minmax(0,1fr)}
  .pp-nav{padding-inline:10px}.pp-nav .pp-brand{gap:7px;margin-inline:4px}
  .pp-main{padding:24px}.pp-split{grid-template-columns:minmax(0,1.15fr) minmax(220px,1fr);gap:16px}
  .pp-hero{padding:48px 32px;gap:28px}.pp-web-nav{padding-inline:32px}
}
@container pattern (max-width:43.75rem){
  .pp-shell{grid-template-columns:1fr;min-height:500px}.pp-nav{display:none}
  .pp-split{grid-template-columns:1fr}.pp-main{padding:24px 20px}
  .pp-heading{flex-wrap:wrap;gap:16px;margin-bottom:24px}
  .pp-grid,.pp-editorial .pp-grid,.pp-editorial.gallery .pp-grid{grid-template-columns:1fr}
  .pp-hero{grid-template-columns:1fr;padding:40px 24px;gap:32px}
  .pp-web-nav{padding:20px 24px;gap:12px}.pp-web-nav>span{display:none}.pp-web-nav .pp-brand{gap:8px}
  .pp-web-nav button{padding:7px 10px;max-width:46%}
  .pp-web-sections,.pp-editorial,.pp-pricing{padding:24px}
  .pp-web-sections article{padding-top:20px}.pp-web.process-led .pp-web-sections article{grid-template-columns:1fr}
  .pp-web.story-led .pp-hero{padding:40px 24px}
  .pp-drawer{width:100%;padding:20px}.pp-metrics{gap:8px}.pp-metric{padding:14px 12px}
.pp-hero-visual{padding:14px}.pp-window-bar{margin:-14px -14px 14px;padding:10px 12px}
  .pp-hero-visual .pp-metrics{gap:6px}.pp-hero-visual .pp-metric{padding:10px 8px}
  .pp-fields{grid-template-columns:1fr}.pp-wizard.vertical{grid-template-columns:1fr}.pp-wizard.vertical .pp-steps{flex-direction:row}
}
/* Type keeps its physical-width scale; layout reflows independently above. */
@container pattern (max-width:900px){
  .pp-hero h2{font-size:3rem}.pp-web.story-led .pp-hero h2{font-size:3.5rem}.pp-editorial h2{font-size:4rem}
  .pp-nav .pp-brand{font-size:1.125rem}
}
@container pattern (max-width:700px){
  .pp-heading h2{font-size:1.625rem}.pp-hero h2{font-size:2.25rem}
  .pp-web-nav .pp-brand{font-size:1.1875rem}.pp-web-nav button{font-size:.625rem}
  .pp-editorial h2{font-size:2.5rem}.pp-web.story-led .pp-hero h2{font-size:2.25rem}
  .pp-metric strong{font-size:1.6875rem}.pp-hero-visual .pp-metric strong{font-size:1.4375rem}
}
@media(max-width:600px){
  body:has([data-static-visual] .pp){padding:24px 12px}main:has(.pp)>h1{font-size:1.75rem}
  .vc-pattern-option>.vc-option{padding:16px;column-gap:12px}.vc-pattern-option .vc-label{font-size:1rem}
  .pp-standalone{padding:12px}.pp-controls{gap:10px;padding:10px 12px}.pp-controls small{width:100%;margin:0}
}
@media(prefers-reduced-motion:reduce){.pp *{animation:none!important;transition:none!important}}
` + EXPANDED_STYLES + THUMBNAIL_STYLES;
