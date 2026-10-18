// Stable task identity, owned tracker regions and drift detection for the
// task-breakdown mode. Marker text on a ticket is untrusted: callers use parsed
// regions only to propose candidates that the user confirms.
import { createHash } from 'node:crypto';
import { isSafeProjectSegment } from '../../shared/artifact-paths.mjs';
import { WRITE_FORMATS, stableJson } from './safety.mjs';

const TASK_ID = /^([a-z0-9]+(?:-[a-z0-9]+)*)\/([A-Z0-9]+(?:-[A-Z0-9]+)*)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/(\d{2})$/u;
const MARKER = /(?:<!--\s*|\[)sdcorejs:task-breakdown:(begin|end) id=([^\s\]]+?)(?:\s*-->|\])/gu;

export const MARKER_STYLES = Object.freeze(['html-comment', 'text']);

/** Upper-case source key with only letters, digits and single dashes. */
export function normalizeSourceKey(value) {
  const key = String(value ?? '').trim().toUpperCase().replace(/[^A-Z0-9]+/gu, '-').replace(/^-+|-+$/gu, '');
  if (!key) throw new TypeError('source key must contain letters or digits');
  return key;
}

function normalizeRole(value) {
  const role = String(value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-+|-+$/gu, '');
  if (!isSafeProjectSegment(role)) throw new TypeError('role must normalize to a kebab-case identifier');
  return role;
}

/** <project-slug>/<SOURCE-KEY>/<role>/<NN>, stable across re-runs. */
export function buildTaskId({ project_slug: projectSlug, source_key: sourceKey, role, sequence } = {}) {
  if (!isSafeProjectSegment(projectSlug)) throw new TypeError('project_slug must be a safe project segment');
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 99) throw new TypeError('sequence must be an integer between 1 and 99');
  return `${projectSlug}/${normalizeSourceKey(sourceKey)}/${normalizeRole(role)}/${String(sequence).padStart(2, '0')}`;
}

export function parseTaskId(value) {
  const match = TASK_ID.exec(String(value ?? ''));
  if (!match) return null;
  return { project_slug: match[1], source_key: match[2], role: match[3], sequence: Number(match[4]) };
}

/**
 * Next sequence for a project/source/role. Tombstoned identities still count, so
 * a retired number is never reused.
 */
export function allocateSequence({ existing = [], project_slug: projectSlug, source_key: sourceKey, role } = {}) {
  const key = normalizeSourceKey(sourceKey);
  const normalizedRole = normalizeRole(role);
  let max = 0;
  for (const entry of existing) {
    const parsed = parseTaskId(entry?.task_id);
    if (parsed && parsed.project_slug === projectSlug && parsed.source_key === key && parsed.role === normalizedRole) {
      max = Math.max(max, parsed.sequence);
    }
  }
  if (max >= 99) throw new RangeError('sequence space exhausted for this source and role');
  return max + 1;
}

function markers(taskId, style) {
  if (!MARKER_STYLES.includes(style)) throw new TypeError(`marker style must be one of ${MARKER_STYLES.join(', ')}`);
  return style === 'text'
    ? { begin: `[sdcorejs:task-breakdown:begin id=${taskId}]`, end: `[sdcorejs:task-breakdown:end id=${taskId}]` }
    : { begin: `<!-- sdcorejs:task-breakdown:begin id=${taskId} -->`, end: `<!-- sdcorejs:task-breakdown:end id=${taskId} -->` };
}

/** Owned regions found in ticket text; each has the task id and its inner content. */
export function parseOwnedRegions(text) {
  const source = String(text ?? '');
  const regions = [];
  const open = new Map();
  for (const match of source.matchAll(MARKER)) {
    const [marker, kind, taskId] = match;
    if (kind === 'begin') {
      if (open.has(taskId)) throw new Error(`nested or duplicate begin marker for ${taskId}`);
      open.set(taskId, { start: match.index, inner_start: match.index + marker.length });
    } else if (open.has(taskId)) {
      const begin = open.get(taskId);
      open.delete(taskId);
      regions.push({
        task_id: taskId,
        start: begin.start,
        end: match.index + marker.length,
        inner_start: begin.inner_start,
        inner_end: match.index,
        content: source.slice(begin.inner_start, match.index).replace(/^\n|\n$/gu, ''),
      });
    }
  }
  if (open.size > 0) throw new Error(`unterminated owned region for ${[...open.keys()].join(', ')}`);
  return regions.sort((left, right) => left.start - right.start);
}

function regionsFor(text, taskId) {
  return parseOwnedRegions(text).filter((region) => region.task_id === taskId);
}

/**
 * Replace only the skill-owned region of a ticket, or append a new owned section
 * after the existing content. Foreign content and media outside the region are kept.
 */
export function mergeOwnedRegion(text, { task_id: taskId, content, style = 'html-comment' } = {}) {
  if (!parseTaskId(taskId)) throw new TypeError('task_id must be a stable task id');
  const source = String(text ?? '');
  const found = regionsFor(source, taskId);
  if (found.length > 1) throw new Error(`duplicate owned regions for ${taskId}; stop and ask before writing`);
  if (found.length === 1) {
    const [region] = found;
    return { mode: 'replace', text: `${source.slice(0, region.inner_start)}\n${content}\n${source.slice(region.inner_end)}` };
  }
  const { begin, end } = markers(taskId, style);
  const separator = source === '' ? '' : source.endsWith('\n') ? '\n' : '\n\n';
  return { mode: 'append', text: `${source}${separator}${begin}\n${content}\n${end}` };
}

/** sha256 fingerprint of normalized text. */
export function fingerprint(text) {
  const normalized = String(text ?? '').replace(/\r\n?/gu, '\n').normalize('NFC');
  return `sha256:${createHash('sha256').update(normalized, 'utf8').digest('hex')}`;
}

/** Fingerprints of the owned region and of everything outside it. */
export function regionFingerprints(text, taskId) {
  const source = String(text ?? '');
  const found = regionsFor(source, taskId);
  if (found.length > 1) throw new Error(`duplicate owned regions for ${taskId}`);
  if (found.length === 0) return { inside: null, outside: fingerprint(source) };
  const [region] = found;
  return {
    inside: fingerprint(region.content),
    outside: fingerprint(`${source.slice(0, region.start)}${source.slice(region.end)}`),
  };
}

/** Compare the ticket read right before writing with the fingerprints taken at approval. */
export function detectTicketDrift({ approved, current_text: currentText, current: currentContent, task_id: taskId, format = 'text', ignore_attrs: ignoreAttrs = [] } = {}) {
  const current = ticketFingerprints({ format, current: currentContent ?? currentText, task_id: taskId, ignore_attrs: ignoreAttrs });
  const regions = [];
  if ((approved?.inside ?? null) !== current.inside) regions.push('inside');
  if (approved?.outside !== current.outside) regions.push('outside');
  return { changed: regions.length > 0, regions };
}

// ---------- Rich documents (tree of {type, content, text, attrs} nodes) ----------
// Markers are top-level paragraph nodes whose only text is the text-style marker.

const RICH_MARKER = /^\[sdcorejs:task-breakdown:(begin|end) id=([^\s\]]+)\]$/u;

function assertFormat(format) {
  if (!WRITE_FORMATS.includes(format)) throw new TypeError(`format must be one of ${WRITE_FORMATS.join(', ')}`);
}

function markerNode(kind, taskId) {
  return { type: 'paragraph', content: [{ type: 'text', text: `[sdcorejs:task-breakdown:${kind} id=${taskId}]` }] };
}

function markerOf(node) {
  if (node?.type !== 'paragraph' || !Array.isArray(node.content) || node.content.length !== 1) return null;
  const [only] = node.content;
  if (only?.type !== 'text') return null;
  const match = RICH_MARKER.exec(String(only.text ?? '').trim());
  return match ? { kind: match[1], task_id: match[2] } : null;
}

function assertRichDocument(doc) {
  if (!doc || typeof doc !== 'object' || !Array.isArray(doc.content)) throw new TypeError('rich-json content must be a document with a content array');
}

/** Owned regions among the top-level nodes of a rich document. */
export function parseOwnedRichRegions(doc) {
  assertRichDocument(doc);
  const regions = [];
  const open = new Map();
  doc.content.forEach((node, index) => {
    const marker = markerOf(node);
    if (!marker) return;
    if (marker.kind === 'begin') {
      if (open.has(marker.task_id)) throw new Error(`nested or duplicate begin marker for ${marker.task_id}`);
      open.set(marker.task_id, index);
    } else if (open.has(marker.task_id)) {
      const start = open.get(marker.task_id);
      open.delete(marker.task_id);
      regions.push({ task_id: marker.task_id, start, end: index, nodes: doc.content.slice(start + 1, index) });
    }
  });
  if (open.size > 0) throw new Error(`unterminated owned region for ${[...open.keys()].join(', ')}`);
  return regions.sort((left, right) => left.start - right.start);
}

function richRegionsFor(doc, taskId) {
  return parseOwnedRichRegions(doc).filter((region) => region.task_id === taskId);
}

/** Drop attributes the tracker regenerates by itself (for example local node ids) and sort keys. */
function canonicalNode(value, ignoreAttrs) {
  if (Array.isArray(value)) return value.map((item) => canonicalNode(item, ignoreAttrs));
  if (!value || typeof value !== 'object') return value;
  const output = {};
  for (const key of Object.keys(value).sort()) {
    if (key === 'attrs' && value.attrs && typeof value.attrs === 'object') {
      const attrs = Object.fromEntries(Object.entries(value.attrs).filter(([name]) => !ignoreAttrs.includes(name)));
      if (Object.keys(attrs).length > 0) output.attrs = canonicalNode(attrs, ignoreAttrs);
      continue;
    }
    output[key] = canonicalNode(value[key], ignoreAttrs);
  }
  return output;
}

/** Plain text of rich nodes; block nodes are separated by new lines. */
export function richPlainText(nodes) {
  const blocks = [];
  const inline = (node) => (node?.type === 'text' ? String(node.text ?? '') : (node?.content ?? []).map(inline).join(''));
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (['paragraph', 'heading', 'codeBlock'].includes(node.type)) blocks.push(inline(node));
    else for (const child of node.content ?? []) walk(child);
  };
  for (const node of Array.isArray(nodes) ? nodes : [nodes]) walk(node);
  return blocks.join('\n');
}

/**
 * Merge new owned content into a ticket description in its own format: replace the
 * region between this task's markers, or append a marked section after existing content.
 */
export function mergeTicketContent({ format, current, task_id: taskId, content, style = 'html-comment' } = {}) {
  assertFormat(format);
  if (format === 'text') {
    const merged = mergeOwnedRegion(String(current ?? ''), { task_id: taskId, content, style });
    return { mode: merged.mode, current: merged.text };
  }
  if (!parseTaskId(taskId)) throw new TypeError('task_id must be a stable task id');
  if (!Array.isArray(content)) throw new TypeError('rich-json content must be an array of nodes');
  const doc = structuredClone(current ?? { type: 'doc', version: 1, content: [] });
  assertRichDocument(doc);
  const found = richRegionsFor(doc, taskId);
  if (found.length > 1) throw new Error(`duplicate owned regions for ${taskId}; stop and ask before writing`);
  if (found.length === 1) {
    const [region] = found;
    doc.content.splice(region.start + 1, region.end - region.start - 1, ...structuredClone(content));
    return { mode: 'replace', current: doc };
  }
  doc.content.push(markerNode('begin', taskId), ...structuredClone(content), markerNode('end', taskId));
  return { mode: 'append', current: doc };
}

/** Fingerprints of the owned region and of everything outside it, for either format. */
export function ticketFingerprints({ format, current, task_id: taskId, ignore_attrs: ignoreAttrs = [] } = {}) {
  assertFormat(format);
  if (format === 'text') return regionFingerprints(String(current ?? ''), taskId);
  assertRichDocument(current);
  const found = richRegionsFor(current, taskId);
  if (found.length > 1) throw new Error(`duplicate owned regions for ${taskId}`);
  if (found.length === 0) return { inside: null, outside: fingerprint(stableJson(canonicalNode(current, ignoreAttrs))) };
  const [region] = found;
  const outside = { ...current, content: [...current.content.slice(0, region.start), ...current.content.slice(region.end + 1)] };
  return {
    inside: fingerprint(stableJson(canonicalNode(region.nodes, ignoreAttrs))),
    outside: fingerprint(stableJson(canonicalNode(outside, ignoreAttrs))),
  };
}

/** Trimmed plain text of the task's owned region, or null when the ticket has none. */
export function ownedRegionPlainText({ format, current, task_id: taskId } = {}) {
  assertFormat(format);
  if (format === 'text') {
    const found = regionsFor(String(current ?? ''), taskId);
    return found.length === 0 ? null : found[0].content.trim();
  }
  const found = richRegionsFor(current, taskId);
  return found.length === 0 ? null : richPlainText(found[0].nodes).trim();
}
