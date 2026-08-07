/**
 * Visual Companion renderer.
 *
 * Renders one validated screen into real visual markup. The same preview
 * blocks are used by the live companion and the standalone static artifact, so
 * a decision looks the same whichever surface the user ends up on.
 *
 * Every value that originates from a screen is HTML-escaped. The single
 * exception is a `svg` preview, which is emitted verbatim only after
 * `validateInlineSvg` has cleared it, because escaping it would defeat the
 * purpose of an inline diagram.
 */

import {
  assertValidScreen,
  hasRenderablePreview,
  isMultiSelect,
  validateInlineSvg,
} from './screen.mjs';

export const DEFAULT_MESSAGES = Object.freeze({
  criteria: 'Criteria',
  recommendation: 'Recommendation',
  option: 'Option',
  best_when: 'Best when',
  tradeoff: 'Trade-off',
  preview_metadata: 'Preview metadata',
  selection_help:
    'Use Tab to focus options. Use arrows to move, Space or Enter to select, and number keys 1-{count} as shortcuts.',
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
  submit_selection: 'Submit selection',
  submit_selection_aria: 'Submit the selected visual option',
  selection_submitted: 'Selection sent to the agent.',
  select_before_submit: 'Select an option before submitting.',
  status_connecting: 'Connecting...',
  status_connected: 'Connected',
  status_reconnecting: 'Reconnecting...',
  status_paused: 'Paused',
  paused_title: 'Visual Companion paused',
  paused_body:
    'The companion has stopped responding. Ask the agent to bring it back; this page reconnects on its own.',
  waiting_title: 'Waiting for the next visual decision',
  waiting_body:
    'The conversation has moved back to text. This tab updates automatically when the agent publishes the next visual decision.',
  supporting_feedback_note:
    'Your selection is design feedback. Approvals stay in the conversation.',
  preview_label: 'Preview',
});

export const MESSAGE_KEYS = new Set(Object.keys(DEFAULT_MESSAGES));
const LOCALE = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/u;
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value) => typeof value === 'string' && value.length > 0;

export const escapeHtml = (value) =>
  String(value)
    .replace(/[&<>"']/gu, (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
    .replace(/onerror/giu, 'on&#101;rror');

export const escapeMarkdown = (value) =>
  String(value)
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/([\\`*_{}[\]()|])/gu, '\\$1');

/**
 * Resolve locale + messages. A non-English locale must supply a complete
 * bundle: a half-translated screen is worse than an English one because the
 * user cannot tell which parts are authoritative.
 */
export function resolveRuntime(runtime = {}) {
  if (!isObject(runtime)) throw new TypeError('runtime must be an object');
  const locale = runtime.locale ?? 'en';
  if (!isText(locale) || !LOCALE.test(locale)) {
    throw new TypeError('runtime.locale must be a valid language tag');
  }
  // `null` means "no bundle supplied", the same as omitting the key. Treating
  // it as an empty bundle would reject every default-locale render.
  const supplied = runtime.messages ?? undefined;
  if (supplied !== undefined && (!isObject(supplied) || !Object.keys(supplied).every((key) => MESSAGE_KEYS.has(key)))) {
    throw new TypeError('runtime.messages must use only supported localized message keys');
  }
  if (isObject(supplied)) {
    for (const [key, value] of Object.entries(supplied)) {
      if (!isText(value)) throw new TypeError(`runtime.messages.${key} must be non-empty text`);
    }
  }
  const language = locale.toLowerCase().split('-')[0];
  const missing = [...MESSAGE_KEYS].filter((key) => !isText(supplied?.[key]));
  if (language !== 'en' && missing.length > 0) {
    throw new TypeError(
      `Non-English runtime.locale requires a complete localized message bundle; missing: ${missing.join(', ')}`,
    );
  }
  return { locale, messages: { ...DEFAULT_MESSAGES, ...(supplied ?? {}) } };
}

export function formatMessage(message, values = {}) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    message,
  );
}

function renderWireframePreview(preview) {
  const regions = preview.regions
    .map((region) => {
      const span = region.span ?? 12;
      const note = region.note ? `<span class="vc-region-note">${escapeHtml(region.note)}</span>` : '';
      return (
        `<div class="vc-region vc-area-${escapeHtml(region.area)}" style="grid-column: span ${span}">` +
        `<span class="vc-region-label">${escapeHtml(region.label)}</span>${note}</div>`
      );
    })
    .join('');
  return `<div class="vc-wireframe" role="img" aria-label="${escapeHtml(preview.caption ?? 'Wireframe preview')}">${regions}</div>`;
}

function renderFlowPreview(preview) {
  const labels = new Map(preview.nodes.map((node) => [node.id, node.label]));
  const nodes = preview.nodes
    .map(
      (node) =>
        `<li class="vc-node"><span class="vc-node-label">${escapeHtml(node.label)}</span>` +
        (node.role ? `<span class="vc-node-role">${escapeHtml(node.role)}</span>` : '') +
        '</li>',
    )
    .join('');
  const edges = preview.edges
    .map(
      (edge) =>
        `<li class="vc-edge">${escapeHtml(labels.get(edge.from))} <span aria-hidden="true">&rarr;</span> ` +
        `<span class="vc-sr">to</span> ${escapeHtml(labels.get(edge.to))}` +
        (edge.label ? ` <span class="vc-edge-label">(${escapeHtml(edge.label)})</span>` : '') +
        '</li>',
    )
    .join('');
  return (
    `<div class="vc-flow" role="group" aria-label="${escapeHtml(preview.caption ?? 'Flow preview')}">` +
    `<ul class="vc-nodes">${nodes}</ul><ul class="vc-edges">${edges}</ul></div>`
  );
}

function renderTablePreview(preview) {
  const head = preview.columns.map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join('');
  const body = preview.rows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
    .join('');
  const caption = preview.caption ? `<caption>${escapeHtml(preview.caption)}</caption>` : '';
  return `<table class="vc-table">${caption}<thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

/**
 * Render one option preview.
 *
 * `assetUrl` maps a validated local asset name onto the surface's own asset
 * route. The static surface passes `null`, which downgrades an image preview to
 * its accessible caption rather than emitting a link the file cannot resolve.
 */
export function renderPreview(option, { assetUrl = null, messages = DEFAULT_MESSAGES } = {}) {
  if (!hasRenderablePreview(option)) {
    return (
      `<span class="vc-asset" data-preview-asset="${escapeHtml(option.preview_asset)}">` +
      `${escapeHtml(messages.preview_metadata)}: ${escapeHtml(option.preview_asset)}</span>`
    );
  }
  const preview = option.preview;
  const caption = preview.caption
    ? `<figcaption class="vc-caption">${escapeHtml(preview.caption)}</figcaption>`
    : '';

  let body;
  if (preview.kind === 'wireframe') body = renderWireframePreview(preview);
  else if (preview.kind === 'flow') body = renderFlowPreview(preview);
  else if (preview.kind === 'table') body = renderTablePreview(preview);
  else if (preview.kind === 'svg') {
    // Re-validate at render time. The screen was checked at publication, but a
    // renderer that trusts its input is one refactor away from an XSS sink.
    const errors = validateInlineSvg(preview.svg);
    if (errors.length > 0) throw new TypeError(`Unsafe inline SVG: ${errors.join('; ')}`);
    body = `<div class="vc-svg" role="img" aria-label="${escapeHtml(preview.caption ?? 'Diagram preview')}">${preview.svg}</div>`;
  } else if (assetUrl) {
    body = `<img class="vc-image" src="${escapeHtml(assetUrl(preview.asset))}" alt="${escapeHtml(preview.alt)}" loading="lazy" decoding="async">`;
  } else {
    body = `<p class="vc-image-fallback">${escapeHtml(preview.alt)}</p>`;
  }
  return `<figure class="vc-preview" data-preview-kind="${escapeHtml(preview.kind)}">${body}${caption}</figure>`;
}

export function renderOption(option, index, screen, { assetUrl = null, messages = DEFAULT_MESSAGES } = {}) {
  const multiple = isMultiSelect(screen);
  const role = multiple ? 'checkbox' : 'radio';
  const recommended = screen.recommendation === option.id;
  return (
    '<li role="none"><button type="button" class="vc-option" ' +
    `role="${role}" aria-checked="false" ` +
    `aria-label="${escapeHtml(messages.option)} ${index + 1}: ${escapeHtml(option.label)}" ` +
    `data-option-id="${escapeHtml(option.id)}"${recommended ? ' data-recommended="true"' : ''}>` +
    `<span class="vc-number" aria-hidden="true">${index + 1}</span>` +
    `<span class="vc-label">${escapeHtml(option.label)}</span>` +
    `<span class="vc-summary">${escapeHtml(option.summary)}</span>` +
    renderPreview(option, { assetUrl, messages }) +
    `<span class="vc-detail"><strong>${escapeHtml(messages.best_when)}:</strong> ${escapeHtml(option.best_when)}</span>` +
    `<span class="vc-detail"><strong>${escapeHtml(messages.tradeoff)}:</strong> ${escapeHtml(option.tradeoff)}</span>` +
    '</button></li>'
  );
}

/**
 * Numbered Markdown fallback. Preview content is described, never dropped, so
 * the text surface still conveys the shape of each option.
 */
export function renderMarkdownFallback(screen, runtime = {}) {
  assertValidScreen(screen);
  const { messages } = resolveRuntime(runtime);
  const criteria = screen.criteria.length
    ? `\n\n${escapeMarkdown(messages.criteria)}: ${screen.criteria.map(escapeMarkdown).join('; ')}`
    : '';
  const options = screen.options
    .map((option, index) => {
      const lines = [
        `${index + 1}. ${escapeMarkdown(option.label)} (id: ${escapeMarkdown(option.id)})`,
        `   - ${escapeMarkdown(option.summary)}`,
        `   - ${escapeMarkdown(messages.best_when)}: ${escapeMarkdown(option.best_when)}`,
        `   - ${escapeMarkdown(messages.tradeoff)}: ${escapeMarkdown(option.tradeoff)}`,
      ];
      const description = describePreview(option, messages);
      if (description) {
        lines.push(`   - ${escapeMarkdown(messages.preview_label)}: ${escapeMarkdown(description)}`);
      }
      return lines.join('\n');
    })
    .join('\n');
  return (
    `## ${escapeMarkdown(screen.question)}${criteria}\n\n${options}\n\n` +
    `${escapeMarkdown(messages.recommendation)}: ${escapeMarkdown(screen.recommendation)}\n\n` +
    escapeMarkdown(screen.fallback_prompt)
  );
}

/** Plain-text description of a preview, for the Markdown surface. */
export function describePreview(option, messages = DEFAULT_MESSAGES) {
  if (!hasRenderablePreview(option)) return option.preview_asset;
  const preview = option.preview;
  if (preview.kind === 'wireframe') {
    return `${preview.caption ?? 'wireframe'}: ${preview.regions.map((region) => `${region.area}/${region.label}`).join(', ')}`;
  }
  if (preview.kind === 'flow') {
    const labels = new Map(preview.nodes.map((node) => [node.id, node.label]));
    return `${preview.caption ?? 'flow'}: ${preview.edges.map((edge) => `${labels.get(edge.from)} -> ${labels.get(edge.to)}`).join(', ')}`;
  }
  if (preview.kind === 'table') {
    return `${preview.caption ?? 'table'}: ${preview.columns.join(' | ')}`;
  }
  if (preview.kind === 'image') return preview.caption ?? preview.alt;
  return preview.caption ?? 'diagram';
}

export { DEFAULT_MESSAGES as MESSAGES };
