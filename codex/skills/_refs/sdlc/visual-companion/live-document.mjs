/**
 * Live Visual Companion documents.
 *
 * The client helper is inlined rather than linked. A CSP hash-source only
 * authorizes an *external* script when it also carries subresource integrity,
 * so inlining is what actually lets `script-src 'sha256-...'` be the single
 * gate on executable behaviour.
 */

import { CLIENT_SCRIPT, CLIENT_SCRIPT_HASH } from './client-script.mjs';
import { LIMITS, contentSecurityPolicy } from './protocol.mjs';
import { isMultiSelect } from './screen.mjs';
import {
  escapeHtml,
  formatMessage,
  renderMarkdownFallback,
  renderOption,
  resolveRuntime,
} from './renderer.mjs';

const STYLES = `
:root{color-scheme:light dark;--vc-fg:#111;--vc-bg:#fff;--vc-muted:#555;--vc-line:#8a8f98;--vc-accent:#175cd3;--vc-accent-bg:#eff6ff;--vc-ok:#1a7f37;--vc-warn:#9a6700;--vc-err:#b42318}
@media (prefers-color-scheme:dark){:root{--vc-fg:#f5f5f7;--vc-bg:#141416;--vc-muted:#b6b8bd;--vc-line:#4a4f57;--vc-accent:#7aa7ff;--vc-accent-bg:#1b2740;--vc-ok:#5cc97a;--vc-warn:#e0b341;--vc-err:#ff8a80}}
*{box-sizing:border-box}
body{margin:0;padding:1.5rem;font:16px/1.5 system-ui,sans-serif;color:var(--vc-fg);background:var(--vc-bg)}
main{max-width:64rem;margin:0 auto}
h1{font-size:1.5rem;margin:0 0 .5rem}
.vc-bar{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:1rem;font-size:.85rem;color:var(--vc-muted)}
.vc-live[data-state=StatusConnected]{color:var(--vc-ok)}
.vc-live[data-state=StatusReconnecting]{color:var(--vc-warn)}
.vc-live[data-state=StatusPaused]{color:var(--vc-err)}
.vc-note{font-size:.85rem;color:var(--vc-muted);margin:.25rem 0 1rem}
ul.vc-options{list-style:none;display:grid;gap:1rem;padding:0;margin:0;grid-template-columns:repeat(auto-fit,minmax(17rem,1fr))}
.vc-option{display:grid;gap:.4rem;text-align:left;width:100%;height:100%;padding:1rem;background:var(--vc-bg);color:var(--vc-fg);border:1px solid var(--vc-line);border-radius:.5rem;cursor:pointer}
.vc-option:focus-visible{outline:3px solid var(--vc-accent);outline-offset:2px}
.vc-option[aria-checked=true]{border-color:var(--vc-accent);background:var(--vc-accent-bg)}
.vc-option[data-recommended=true] .vc-label::after{content:" *"}
.vc-number,.vc-label{font-weight:700}
.vc-summary,.vc-detail{font-size:.9rem}
.vc-asset,.vc-caption{font-size:.82rem;color:var(--vc-muted)}
.vc-preview{margin:.4rem 0;padding:0}
.vc-wireframe{display:grid;grid-template-columns:repeat(12,1fr);gap:3px;background:var(--vc-line);border:1px solid var(--vc-line);border-radius:.3rem;overflow:hidden}
.vc-region{background:var(--vc-bg);padding:.5rem .4rem;font-size:.75rem;display:grid;gap:.15rem;min-height:2.4rem}
.vc-area-header,.vc-area-footer{background:var(--vc-accent-bg)}
.vc-region-note{color:var(--vc-muted)}
.vc-nodes,.vc-edges{list-style:none;padding:0;margin:.25rem 0;font-size:.8rem;display:flex;flex-wrap:wrap;gap:.35rem}
.vc-node{border:1px solid var(--vc-line);border-radius:.25rem;padding:.15rem .4rem}
.vc-edges{flex-direction:column;gap:.15rem;color:var(--vc-muted)}
.vc-table{border-collapse:collapse;font-size:.8rem;width:100%}
.vc-table th,.vc-table td{border:1px solid var(--vc-line);padding:.25rem .4rem;text-align:left}
.vc-svg svg,.vc-image{max-width:100%;height:auto;display:block}
.vc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
textarea{display:block;width:100%;min-height:5rem;margin-top:.4rem;font:inherit;color:inherit;background:var(--vc-bg);border:1px solid var(--vc-line);border-radius:.3rem;padding:.5rem}
button.vc-submit{margin-top:.75rem;padding:.55rem 1rem;font:inherit;cursor:pointer;border-radius:.35rem;border:1px solid var(--vc-accent);background:var(--vc-accent);color:#fff}
.vc-paused{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:2rem;text-align:center;background:rgba(10,10,12,.92);color:#f5f5f7}
.vc-paused-box{max-width:30rem}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

function messageAttributes(messages) {
  const map = {
    'status-connecting': messages.status_connecting,
    'status-connected': messages.status_connected,
    'status-reconnecting': messages.status_reconnecting,
    'status-paused': messages.status_paused,
    'paused-title': messages.paused_title,
    'paused-body': messages.paused_body,
    'selection-updated': messages.selection_updated,
    'selection-submitted': messages.selection_submitted,
    'select-before-submit': messages.select_before_submit,
  };
  return Object.entries(map)
    .map(([key, value]) => ` data-message-${key}="${escapeHtml(value)}"`)
    .join('');
}

function documentShell({ locale, title, body }) {
  return (
    `<!doctype html><html lang="${escapeHtml(locale)}"><head><meta charset="utf-8">` +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    `<meta http-equiv="Content-Security-Policy" content="${escapeHtml(contentSecurityPolicy(CLIENT_SCRIPT_HASH))}">` +
    `<title>${escapeHtml(title)}</title><style>${STYLES}</style></head><body>${body}` +
    `<script>${CLIENT_SCRIPT}</script></body></html>`
  );
}

/** Render the live decision surface for a published screen. */
export function renderLiveDocument(screen, { locale, messages, sessionId, screenRevision } = {}) {
  const runtime = resolveRuntime({ locale, messages });
  const text = runtime.messages;
  const multiple = isMultiSelect(screen);
  const assetUrl = (name) => `/assets/${encodeURIComponent(name)}`;
  const criteria = screen.criteria.length
    ? `<p><strong>${escapeHtml(text.criteria)}:</strong> ${screen.criteria.map(escapeHtml).join('; ')}</p>`
    : '';
  const options = screen.options
    .map((option, index) => renderOption(option, index, screen, { assetUrl, messages: text }))
    .join('');

  const body =
    `<main data-visual-companion data-mode="${escapeHtml(screen.type)}" ` +
    `data-session-id="${escapeHtml(sessionId)}" data-screen-id="${escapeHtml(screen.screen_id)}" ` +
    `data-screen-revision="${Number(screenRevision)}" ` +
    `data-min-reconnect-ms="${LIMITS.min_reconnect_ms}" data-max-reconnect-ms="${LIMITS.max_reconnect_ms}" ` +
    `data-paused-after-ms="${LIMITS.paused_after_ms}" data-max-queue="${LIMITS.max_queued_client_events}"` +
    `${messageAttributes(text)}>` +
    `<div class="vc-bar"><span>SDCoreJS Visual Companion</span>` +
    `<span class="vc-live" data-live-status data-state="StatusConnecting">${escapeHtml(text.status_connecting)}</span></div>` +
    `<h1>${escapeHtml(screen.question)}</h1>${criteria}` +
    `<p class="vc-note">${escapeHtml(text.supporting_feedback_note)}</p>` +
    `<p id="vc-help" class="vc-note">${escapeHtml(formatMessage(text.selection_help, { count: screen.options.length }))}</p>` +
    `<ul class="vc-options" role="${multiple ? 'group' : 'radiogroup'}" ` +
    `aria-label="${escapeHtml(text.visual_decision_options)}" aria-describedby="vc-help">${options}</ul>` +
    `<label for="vc-feedback">${escapeHtml(text.feedback_optional)}</label>` +
    `<textarea id="vc-feedback" data-feedback aria-label="${escapeHtml(text.feedback_aria)}" maxlength="${LIMITS.max_feedback_characters}"></textarea>` +
    `<button type="button" class="vc-submit" data-submit aria-label="${escapeHtml(text.submit_selection_aria)}">${escapeHtml(text.submit_selection)}</button>` +
    '<p data-status role="status" aria-live="polite"></p>' +
    `<section aria-label="${escapeHtml(text.markdown_fallback)}"><h2>${escapeHtml(text.markdown_fallback)}</h2>` +
    `<pre>${escapeHtml(renderMarkdownFallback(screen, { locale, messages }))}</pre></section></main>`;

  return documentShell({ locale: runtime.locale, title: screen.question, body });
}

/**
 * Waiting surface. Publishing this is how the companion avoids leaving a stale
 * decision on screen once the conversation moves back to text.
 */
export function renderWaitingDocument({ locale, messages } = {}) {
  const runtime = resolveRuntime({ locale, messages });
  const text = runtime.messages;
  const body =
    `<main data-visual-companion data-mode="waiting" data-session-id="" data-screen-revision="0"` +
    `${messageAttributes(text)}>` +
    `<div class="vc-bar"><span>SDCoreJS Visual Companion</span>` +
    `<span class="vc-live" data-live-status data-state="StatusConnecting">${escapeHtml(text.status_connecting)}</span></div>` +
    `<h1>${escapeHtml(text.waiting_title)}</h1><p>${escapeHtml(text.waiting_body)}</p>` +
    '<p data-status role="status" aria-live="polite"></p></main>';
  return documentShell({ locale: runtime.locale, title: text.waiting_title, body });
}

/** Tombstone surface for a session whose server is gone. */
export function renderPausedDocument({ locale, messages } = {}) {
  const runtime = resolveRuntime({ locale, messages });
  const text = runtime.messages;
  const body =
    `<main data-visual-companion data-mode="paused" data-session-id="" data-screen-revision="0"` +
    `${messageAttributes(text)}>` +
    `<div class="vc-bar"><span>SDCoreJS Visual Companion</span>` +
    `<span class="vc-live" data-live-status data-state="StatusPaused">${escapeHtml(text.status_paused)}</span></div>` +
    `<h1>${escapeHtml(text.paused_title)}</h1><p>${escapeHtml(text.paused_body)}</p></main>`;
  return documentShell({ locale: runtime.locale, title: text.paused_title, body });
}
