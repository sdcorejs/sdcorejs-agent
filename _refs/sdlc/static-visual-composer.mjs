import { createHash } from 'node:crypto';

const TYPES = new Set(['single_select', 'multi_select', 'comparison', 'wireframe']);
const ID = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const LOCALE = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/;
const SCREEN_KEYS = new Set(['schema_version', 'screen_id', 'type', 'question', 'criteria', 'options', 'recommendation', 'fallback_prompt']);
const OPTION_KEYS = new Set(['id', 'label', 'summary', 'best_when', 'tradeoff', 'preview_asset']);
const DEFAULT_MESSAGES = Object.freeze({
  criteria: 'Criteria',
  recommendation: 'Recommendation',
  option: 'Option',
  best_when: 'Best when',
  tradeoff: 'Trade-off',
  preview_metadata: 'Preview metadata',
  selection_help: 'Use Tab to focus options. Use arrows to move, Space or Enter to select, and number keys 1-{count} as shortcuts.',
  visual_decision_options: 'Visual decision options',
  feedback_optional: 'Feedback (optional)',
  feedback_aria: 'Feedback for this visual decision',
  copy_response: 'Copy response',
  copy_response_aria: 'Copy structured response',
  selectable_response_aria: 'Selectable structured response',
  markdown_fallback: 'Markdown fallback',
  selection_updated: 'Selection updated.',
  copy_unavailable: 'Copy unavailable. The selectable response is shown below.',
  response_copied: 'Response copied.',
});
const MESSAGE_KEYS = new Set(Object.keys(DEFAULT_MESSAGES));
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value) => typeof value === 'string' && value.length > 0;
const onlyKeys = (value, keys) => Object.keys(value).every((key) => keys.has(key));
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]).replace(/onerror/gi, 'on&#101;rror');
const escapeMarkdown = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([\\`*_{}\[\]()|])/g, '\\$1');

export function validateVisualScreen(screen, _schema) {
  const errors = [];
  if (!isObject(screen)) return ['screen must be an object'];
  if (!onlyKeys(screen, SCREEN_KEYS)) errors.push('screen has unknown properties');
  for (const key of SCREEN_KEYS) if (!(key in screen)) errors.push('screen.' + key + ' is required');
  if (screen.schema_version !== 1) errors.push('screen.schema_version must be 1');
  if (!isText(screen.screen_id) || !ID.test(screen.screen_id)) errors.push('screen.screen_id is invalid');
  if (!TYPES.has(screen.type)) errors.push('screen.type is invalid');
  if (!isText(screen.question)) errors.push('screen.question is required');
  if (!Array.isArray(screen.criteria) || !screen.criteria.every(isText)) errors.push('screen.criteria must be an array of text');
  if (!isText(screen.recommendation) || !ID.test(screen.recommendation)) errors.push('screen.recommendation is invalid');
  if (!isText(screen.fallback_prompt)) errors.push('screen.fallback_prompt is required');
  if (!Array.isArray(screen.options) || screen.options.length < 2 || screen.options.length > 3) errors.push('screen.options must contain 2 or 3 options');
  else {
    const ids = new Set();
    screen.options.forEach((option, index) => {
      if (!isObject(option) || !onlyKeys(option, OPTION_KEYS)) { errors.push('screen.options[' + index + '] has an invalid shape'); return; }
      for (const key of OPTION_KEYS) if (!isText(option[key])) errors.push('screen.options[' + index + '].' + key + ' is required');
      if (!ID.test(option.id ?? '')) errors.push('screen.options[' + index + '].id is invalid');
      if (ids.has(option.id)) errors.push('screen.options[' + index + '].id is duplicated');
      ids.add(option.id);
    });
    if (!ids.has(screen.recommendation)) errors.push('screen.recommendation must reference an option id');
  }
  return errors;
}

function assertValid(screen) {
  const errors = validateVisualScreen(screen);
  if (errors.length) throw new TypeError('Invalid visual screen: ' + errors.join('; '));
}

function resolveRuntime(runtime = {}) {
  if (!isObject(runtime)) throw new TypeError('runtime must be an object');
  const locale = runtime.locale ?? 'en';
  if (!isText(locale) || !LOCALE.test(locale)) throw new TypeError('runtime.locale must be a valid language tag');
  const supplied = runtime.messages;
  if (supplied !== undefined && (!isObject(supplied) || !onlyKeys(supplied, MESSAGE_KEYS))) {
    throw new TypeError('runtime.messages must use only supported localized message keys');
  }
  if (isObject(supplied)) {
    for (const [key, value] of Object.entries(supplied)) {
      if (!isText(value)) throw new TypeError('runtime.messages.' + key + ' must be non-empty text');
    }
  }
  const language = locale.toLowerCase().split('-')[0];
  const missing = [...MESSAGE_KEYS].filter((key) => !isText(supplied?.[key]));
  if (language !== 'en' && missing.length > 0) {
    throw new TypeError('Non-English runtime.locale requires a complete localized message bundle; missing: ' + missing.join(', '));
  }
  return {
    locale,
    messages: { ...DEFAULT_MESSAGES, ...(supplied ?? {}) },
  };
}

function formatMessage(message, values = {}) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll('{' + key + '}', String(value)),
    message
  );
}

function renderMarkdown(screen, messages) {
  assertValid(screen);
  const criteria = screen.criteria.length
    ? '\n\n' + escapeMarkdown(messages.criteria) + ': ' + screen.criteria.map(escapeMarkdown).join('; ')
    : '';
  const options = screen.options.map((option, index) =>
    (index + 1) + '. ' + escapeMarkdown(option.label) + ' (id: ' + escapeMarkdown(option.id) + ')\n' +
    '   - ' + escapeMarkdown(option.summary) + '\n' +
    '   - ' + escapeMarkdown(messages.best_when) + ': ' + escapeMarkdown(option.best_when) + '\n' +
    '   - ' + escapeMarkdown(messages.tradeoff) + ': ' + escapeMarkdown(option.tradeoff)
  ).join('\n');
  return '## ' + escapeMarkdown(screen.question) + criteria + '\n\n' + options + '\n\n' +
    escapeMarkdown(messages.recommendation) + ': ' + escapeMarkdown(screen.recommendation) + '\n\n' +
    escapeMarkdown(screen.fallback_prompt);
}

export function renderMarkdownFallback(screen, runtime = {}) {
  const { messages } = resolveRuntime(runtime);
  return renderMarkdown(screen, messages);
}

function renderOption(option, index, multiple, messages) {
  const role = multiple ? 'checkbox' : 'radio';
  return '<li role="none"><button type="button" class="option" role="' + role + '" aria-checked="false" aria-label="' + escapeHtml(messages.option) + ' ' + (index + 1) + ': ' + escapeHtml(option.label) + '" data-option-id="' + escapeHtml(option.id) + '"><span class="number" aria-hidden="true">' + (index + 1) + '</span><span class="label">' + escapeHtml(option.label) + '</span><span class="summary">' + escapeHtml(option.summary) + '</span><span class="detail"><strong>' + escapeHtml(messages.best_when) + ':</strong> ' + escapeHtml(option.best_when) + '</span><span class="detail"><strong>' + escapeHtml(messages.tradeoff) + ':</strong> ' + escapeHtml(option.tradeoff) + '</span><span class="asset" data-preview-asset="' + escapeHtml(option.preview_asset) + '">' + escapeHtml(messages.preview_metadata) + ': ' + escapeHtml(option.preview_asset) + '</span></button></li>';
}

const INTERACTION_SOURCE = '(function(){"use strict";var root=document.querySelector("[data-static-visual]"),options=[].slice.call(root.querySelectorAll("[data-option-id]")),multi=root.dataset.mode==="multi_select",status=root.querySelector("[data-status]"),feedback=root.querySelector("[data-feedback]"),output=root.querySelector("[data-copy-output]"),copy=root.querySelector("[data-copy]");function selected(){return options.filter(function(button){return button.getAttribute("aria-checked")==="true";}).map(function(button){return button.dataset.optionId;});}function set(button){if(!multi)options.forEach(function(item){item.setAttribute("aria-checked","false");});button.setAttribute("aria-checked",button.getAttribute("aria-checked")!=="true"?"true":"false");if(!multi&&button.getAttribute("aria-checked")==="false")button.setAttribute("aria-checked","true");status.textContent=root.dataset.messageSelectionUpdated;}function move(current,delta){var next=(options.indexOf(current)+delta+options.length)%options.length;options[next].focus();}options.forEach(function(button,index){button.addEventListener("click",function(){set(button);});button.addEventListener("keydown",function(event){if(event.key==="ArrowRight"||event.key==="ArrowDown"){event.preventDefault();move(button,1);}else if(event.key==="ArrowLeft"||event.key==="ArrowUp"){event.preventDefault();move(button,-1);}else if(event.key===" "||event.key==="Enter"){event.preventDefault();set(button);}else if(event.key===String(index+1)){event.preventDefault();set(button);}});});document.addEventListener("keydown",function(event){if(event.target===feedback)return;var index=Number(event.key)-1;if(index>=0&&index<options.length){event.preventDefault();set(options[index]);options[index].focus();}});copy.addEventListener("click",function(){var response={screen_id:root.dataset.screenId,selected_option_ids:selected(),feedback:feedback.value},text=JSON.stringify(response);output.value=text;output.hidden=false;output.select();function failed(){status.textContent=root.dataset.messageCopyUnavailable;}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){status.textContent=root.dataset.messageResponseCopied;},failed);}else{failed();}});}());';
const INTERACTION_HASH = createHash('sha256').update(INTERACTION_SOURCE).digest('base64');
const INTERACTION_SCRIPT = '<script>' + INTERACTION_SOURCE + '</script>';

export function renderStaticVisualScreen(screen, runtime = {}) {
  assertValid(screen);
  if (runtime.runtime_server === true || runtime.event_bridge === true) throw new TypeError('Runtime server and event bridge are outside the static visual contract');
  const { locale, messages } = resolveRuntime(runtime);
  const multiple = screen.type === 'multi_select';
  const criteria = screen.criteria.length ? '<p><strong>' + escapeHtml(messages.criteria) + ':</strong> ' + screen.criteria.map(escapeHtml).join('; ') + '</p>' : '';
  const options = screen.options.map((option, index) => renderOption(option, index, multiple, messages)).join('');
  const markdown = renderMarkdown(screen, messages);
  const selectionHelp = formatMessage(messages.selection_help, { count: screen.options.length });
  return '<!doctype html><html lang="' + escapeHtml(locale) + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; script-src \'sha256-' + INTERACTION_HASH + '\'; base-uri \'none\'; form-action \'none\'; frame-ancestors \'none\'; connect-src \'none\'; img-src \'none\'"><title>' + escapeHtml(screen.question) + '</title><style>body{font:16px system-ui,sans-serif;line-height:1.5;margin:2rem;max-width:52rem}.option{display:grid;gap:.35rem;text-align:left;width:100%;margin:.4rem 0;padding:1rem;background:#fff;border:1px solid #667;border-radius:.4rem;color:#111}.option:focus-visible{outline:3px solid #175cd3;outline-offset:2px}.option[aria-checked=true]{border-color:#175cd3;background:#eff6ff}.number,.label{font-weight:700}.detail,.asset{font-size:.9rem}.asset{color:#555}textarea{display:block;width:100%;min-height:5rem;margin-top:.5rem}button{cursor:pointer}</style></head><body><main data-static-visual data-mode="' + escapeHtml(screen.type) + '" data-screen-id="' + escapeHtml(screen.screen_id) + '" data-message-selection-updated="' + escapeHtml(messages.selection_updated) + '" data-message-copy-unavailable="' + escapeHtml(messages.copy_unavailable) + '" data-message-response-copied="' + escapeHtml(messages.response_copied) + '"><h1>' + escapeHtml(screen.question) + '</h1>' + criteria + '<p>' + escapeHtml(messages.recommendation) + ': <strong>' + escapeHtml(screen.recommendation) + '</strong></p><p id="selection-help">' + escapeHtml(selectionHelp) + '</p><ul role="' + (multiple ? 'group' : 'radiogroup') + '" aria-label="' + escapeHtml(messages.visual_decision_options) + '" aria-describedby="selection-help">' + options + '</ul><label for="feedback">' + escapeHtml(messages.feedback_optional) + '</label><textarea id="feedback" data-feedback aria-label="' + escapeHtml(messages.feedback_aria) + '"></textarea><button type="button" data-copy aria-label="' + escapeHtml(messages.copy_response_aria) + '">' + escapeHtml(messages.copy_response) + '</button><p data-status role="status" aria-live="polite"></p><textarea data-copy-output aria-label="' + escapeHtml(messages.selectable_response_aria) + '" readonly hidden></textarea><section aria-label="' + escapeHtml(messages.markdown_fallback) + '"><h2>' + escapeHtml(messages.markdown_fallback) + '</h2><pre>' + escapeHtml(markdown) + '</pre></section></main>' + INTERACTION_SCRIPT + '</body></html>';
}

export function formatCopiedResponse({ screen, selected_option_ids, feedback }) {
  assertValid(screen);
  const selected = Array.isArray(selected_option_ids) ? selected_option_ids : [];
  const allowed = new Set(screen.options.map((option) => option.id));
  const unique = [...new Set(selected)];
  if (!unique.every((id) => typeof id === 'string' && allowed.has(id))) throw new TypeError('Selected option ids must belong to the screen');
  if (screen.type !== 'multi_select' && unique.length > 1) throw new TypeError('Only one option may be selected for this screen');
  if (typeof feedback !== 'string') throw new TypeError('feedback must be text');
  return { screen_id: screen.screen_id, selected_option_ids: unique, feedback };
}
