/**
 * Standalone static visual screen.
 *
 * This surface renders one validated screen into a single self-contained HTML
 * file with no server, no socket, and no network destination. It is what a
 * runtime without a live companion falls back to.
 *
 * The screen model, the safe-content rules, the option markup, and the
 * localized message bundle all come from `_refs/sdlc/visual-companion/`. This
 * module owns only what is genuinely static: the document shell, the
 * copy-to-clipboard interaction, and the copied-response contract. Keeping a
 * second copy of the schema here is what previously let the static and live
 * surfaces drift into two incompatible option models.
 */

import { createHash } from 'node:crypto';

import {
  assertValidScreen,
  validateVisualScreen as validateScreenModel,
} from './visual-companion/screen.mjs';
import {
  MESSAGE_KEYS,
  escapeHtml,
  formatMessage,
  renderMarkdownFallback as renderScreenMarkdown,
  renderOption,
  resolveRuntime,
} from './visual-companion/renderer.mjs';

export { MESSAGE_KEYS };

/**
 * Validate a screen for the static surface.
 *
 * The second parameter exists so callers may pass the published JSON Schema
 * alongside the screen; the executable model is authoritative either way.
 */
export function validateVisualScreen(screen, _schema) {
  return validateScreenModel(screen);
}

const STYLES =
  'body{font:16px/1.5 system-ui,sans-serif;margin:2rem;max-width:52rem;color:#111;background:#fff}' +
  'ul.vc-options{list-style:none;display:grid;gap:1rem;padding:0;margin:0;grid-template-columns:repeat(auto-fit,minmax(17rem,1fr))}' +
  '.vc-option{display:grid;gap:.35rem;text-align:left;width:100%;height:100%;margin:0;padding:1rem;background:#fff;border:1px solid #667;border-radius:.4rem;color:#111;cursor:pointer}' +
  '.vc-option:focus-visible{outline:3px solid #175cd3;outline-offset:2px}' +
  '.vc-option[aria-checked=true]{border-color:#175cd3;background:#eff6ff}' +
  '.vc-option[data-recommended=true] .vc-label::after{content:" *"}' +
  '.vc-number,.vc-label{font-weight:700}.vc-summary,.vc-detail{font-size:.9rem}' +
  '.vc-asset,.vc-caption{font-size:.82rem;color:#555}.vc-preview{margin:.4rem 0;padding:0}' +
  '.vc-wireframe{display:grid;grid-template-columns:repeat(12,1fr);gap:3px;background:#8a8f98;border:1px solid #8a8f98;border-radius:.3rem;overflow:hidden}' +
  '.vc-region{background:#fff;padding:.5rem .4rem;font-size:.75rem;display:grid;gap:.15rem;min-height:2.4rem}' +
  '.vc-region-note{color:#555}' +
  '.vc-nodes,.vc-edges{list-style:none;padding:0;margin:.25rem 0;font-size:.8rem;display:flex;flex-wrap:wrap;gap:.35rem}' +
  '.vc-node{border:1px solid #8a8f98;border-radius:.25rem;padding:.15rem .4rem}' +
  '.vc-edges{flex-direction:column;gap:.15rem;color:#555}' +
  '.vc-table{border-collapse:collapse;font-size:.8rem;width:100%}' +
  '.vc-table th,.vc-table td{border:1px solid #8a8f98;padding:.25rem .4rem;text-align:left}' +
  '.vc-svg svg{max-width:100%;height:auto;display:block}' +
  '.vc-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}' +
  'textarea{display:block;width:100%;min-height:5rem;margin-top:.5rem}button{cursor:pointer}';

const INTERACTION_SOURCE = '(function(){"use strict";var root=document.querySelector("[data-static-visual]"),options=[].slice.call(root.querySelectorAll("[data-option-id]")),multi=root.dataset.mode==="multi_select",status=root.querySelector("[data-status]"),feedback=root.querySelector("[data-feedback]"),output=root.querySelector("[data-copy-output]"),copy=root.querySelector("[data-copy]");function selected(){return options.filter(function(button){return button.getAttribute("aria-checked")==="true";}).map(function(button){return button.dataset.optionId;});}function set(button){if(!multi)options.forEach(function(item){item.setAttribute("aria-checked","false");});button.setAttribute("aria-checked",button.getAttribute("aria-checked")!=="true"?"true":"false");if(!multi&&button.getAttribute("aria-checked")==="false")button.setAttribute("aria-checked","true");status.textContent=root.dataset.messageSelectionUpdated;}function move(current,delta){var next=(options.indexOf(current)+delta+options.length)%options.length;options[next].focus();}options.forEach(function(button,index){button.addEventListener("click",function(){set(button);});button.addEventListener("keydown",function(event){if(event.key==="ArrowRight"||event.key==="ArrowDown"){event.preventDefault();move(button,1);}else if(event.key==="ArrowLeft"||event.key==="ArrowUp"){event.preventDefault();move(button,-1);}else if(event.key===" "||event.key==="Enter"){event.preventDefault();set(button);}else if(event.key===String(index+1)){event.preventDefault();set(button);}});});document.addEventListener("keydown",function(event){if(event.target===feedback)return;var index=Number(event.key)-1;if(index>=0&&index<options.length){event.preventDefault();set(options[index]);options[index].focus();}});copy.addEventListener("click",function(){var response={screen_id:root.dataset.screenId,selected_option_ids:selected(),feedback:feedback.value},text=JSON.stringify(response);output.value=text;output.hidden=false;output.select();function failed(){status.textContent=root.dataset.messageCopyUnavailable;}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){status.textContent=root.dataset.messageResponseCopied;},failed);}else{failed();}});}());';
const INTERACTION_HASH = createHash('sha256').update(INTERACTION_SOURCE).digest('base64');
const INTERACTION_SCRIPT = '<script>' + INTERACTION_SOURCE + '</script>';

export function renderMarkdownFallback(screen, runtime = {}) {
  return renderScreenMarkdown(screen, runtime);
}

export function renderStaticVisualScreen(screen, runtime = {}) {
  assertValidScreen(screen);
  if (runtime.runtime_server === true || runtime.event_bridge === true) {
    throw new TypeError(
      'The static surface is a standalone file. A live session belongs to the Visual Companion runtime.'
    );
  }
  const { locale, messages } = resolveRuntime(runtime);
  const multiple = screen.type === 'multi_select';
  const criteria = screen.criteria.length
    ? '<p><strong>' + escapeHtml(messages.criteria) + ':</strong> ' + screen.criteria.map(escapeHtml).join('; ') + '</p>'
    : '';
  // `assetUrl` is null: a standalone file has no asset route, so an image
  // preview degrades to its accessible description instead of a dead link.
  const options = screen.options
    .map((option, index) => renderOption(option, index, screen, { assetUrl: null, messages }))
    .join('');
  const markdown = renderScreenMarkdown(screen, runtime);
  const selectionHelp = formatMessage(messages.selection_help, { count: screen.options.length });
  return '<!doctype html><html lang="' + escapeHtml(locale) + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; script-src \'sha256-' + INTERACTION_HASH + '\'; base-uri \'none\'; form-action \'none\'; frame-ancestors \'none\'; connect-src \'none\'; img-src \'none\'"><title>' + escapeHtml(screen.question) + '</title><style>' + STYLES + '</style></head><body><main data-static-visual data-mode="' + escapeHtml(screen.type) + '" data-screen-id="' + escapeHtml(screen.screen_id) + '" data-message-selection-updated="' + escapeHtml(messages.selection_updated) + '" data-message-copy-unavailable="' + escapeHtml(messages.copy_unavailable) + '" data-message-response-copied="' + escapeHtml(messages.response_copied) + '"><h1>' + escapeHtml(screen.question) + '</h1>' + criteria + '<p>' + escapeHtml(messages.recommendation) + ': <strong>' + escapeHtml(screen.recommendation) + '</strong></p><p id="selection-help">' + escapeHtml(selectionHelp) + '</p><p class="vc-note">' + escapeHtml(messages.supporting_feedback_note) + '</p><ul class="vc-options" role="' + (multiple ? 'group' : 'radiogroup') + '" aria-label="' + escapeHtml(messages.visual_decision_options) + '" aria-describedby="selection-help">' + options + '</ul><label for="feedback">' + escapeHtml(messages.feedback_optional) + '</label><textarea id="feedback" data-feedback aria-label="' + escapeHtml(messages.feedback_aria) + '"></textarea><button type="button" data-copy aria-label="' + escapeHtml(messages.copy_response_aria) + '">' + escapeHtml(messages.copy_response) + '</button><p data-status role="status" aria-live="polite"></p><textarea data-copy-output aria-label="' + escapeHtml(messages.selectable_response_aria) + '" readonly hidden></textarea><section aria-label="' + escapeHtml(messages.markdown_fallback) + '"><h2>' + escapeHtml(messages.markdown_fallback) + '</h2><pre>' + escapeHtml(markdown) + '</pre></section></main>' + INTERACTION_SCRIPT + '</body></html>';
}

/**
 * Normalize a copied browser response.
 *
 * A copied selection is design feedback. It carries no authority field on
 * purpose: nothing downstream may treat it as an approval.
 */
export function formatCopiedResponse({ screen, selected_option_ids, feedback }) {
  assertValidScreen(screen);
  const selected = Array.isArray(selected_option_ids) ? selected_option_ids : [];
  const allowed = new Set(screen.options.map((option) => option.id));
  const unique = [...new Set(selected)];
  if (!unique.every((id) => typeof id === 'string' && allowed.has(id))) {
    throw new TypeError('Selected option ids must belong to the screen');
  }
  if (screen.type !== 'multi_select' && unique.length > 1) {
    throw new TypeError('Only one option may be selected for this screen');
  }
  if (typeof feedback !== 'string') throw new TypeError('feedback must be text');
  return { screen_id: screen.screen_id, selected_option_ids: unique, feedback };
}
