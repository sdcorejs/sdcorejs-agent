/**
 * Visual Companion screen model.
 *
 * One screen contract feeds three surfaces: the live browser companion, the
 * standalone static artifact, and the numbered Markdown fallback. Keeping a
 * single validated model is what stops the three surfaces from drifting into
 * three incompatible option schemas.
 *
 * Content is structured by default. A screen describes *what* to show
 * (regions, nodes, rows, an inline diagram, a local asset); it never ships
 * behaviour. All interactivity comes from the single fixed client helper, so a
 * screen fragment cannot introduce script, navigation, or a network call.
 */

const isObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = (value) => typeof value === 'string' && value.length > 0;
const onlyKeys = (value, keys) => Object.keys(value).every((key) => keys.has(key));

export const SCREEN_TYPES = Object.freeze(['single_select', 'multi_select', 'comparison', 'wireframe']);
export const PREVIEW_KINDS = Object.freeze(['wireframe', 'svg', 'image', 'flow', 'table']);
export const WIREFRAME_AREAS = Object.freeze(['header', 'nav', 'sidebar', 'main', 'aside', 'footer']);

export const ID = /^[A-Za-z0-9][A-Za-z0-9_-]*$/u;
/** Local asset names only: no directories, no traversal, no dotfiles. */
export const ASSET_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/u;
export const ASSET_EXTENSION = /\.(?:png|jpe?g|gif|webp|svg)$/iu;

export const SCREEN_KEYS = new Set([
  'schema_version',
  'screen_id',
  'type',
  'question',
  'criteria',
  'options',
  'recommendation',
  'fallback_prompt',
]);
export const OPTION_KEYS = new Set([
  'id',
  'label',
  'summary',
  'best_when',
  'tradeoff',
  'preview_asset',
  'preview',
]);

export const MIN_OPTIONS = 2;
export const MAX_OPTIONS = 4;

/**
 * Deterministic unsafe-content patterns. A screen is rejected rather than
 * sanitized: silently stripping a fragment hides an authoring bug and invites
 * a bypass, while rejection surfaces it before publication.
 */
const UNSAFE_PATTERNS = Object.freeze([
  [/<\s*script\b/iu, 'inline script is forbidden'],
  [/<\s*\/?\s*(?:iframe|object|embed|applet|form|base|meta|link|audio|video|portal)\b/iu, 'embedded or navigational element is forbidden'],
  [/<\s*foreignObject\b/iu, 'foreignObject is forbidden'],
  [/\son[a-z]+\s*=/iu, 'inline event handler attribute is forbidden'],
  [/javascript\s*:/iu, 'javascript: URL is forbidden'],
  [/data\s*:\s*text\/html/iu, 'data: HTML URL is forbidden'],
  [/(?:src|href|xlink:href|action|formaction|poster|srcset)\s*=\s*["']?\s*(?:https?:)?\/\//iu, 'remote asset reference is forbidden'],
  [/<!ENTITY\b/iu, 'entity declaration is forbidden'],
  [/<\s*!\s*\[CDATA\[/iu, 'CDATA section is forbidden'],
  [/&#x?0*(?:6a|106|74|116);/iu, 'obfuscated character reference is forbidden'],
  [/\bstyle\s*=\s*["'][^"']*(?:expression|url\s*\(\s*["']?\s*(?:https?:)?\/\/)/iu, 'remote or dynamic style is forbidden'],
  [/@import\b/iu, 'style import is forbidden'],
]);

/**
 * Validate an inline SVG fragment. Returns a list of violations.
 */
export function validateInlineSvg(svg) {
  const errors = [];
  if (!isText(svg)) return ['svg must be non-empty text'];
  if (!/^\s*<svg[\s>]/iu.test(svg)) errors.push('svg must start with an <svg> element');
  if (!/<\/svg\s*>\s*$/iu.test(svg)) errors.push('svg must end with a closing </svg>');
  if (svg.length > 64 * 1024) errors.push('svg exceeds the allowed size');
  for (const [pattern, message] of UNSAFE_PATTERNS) {
    if (pattern.test(svg)) errors.push(`svg: ${message}`);
  }
  // `use` and `image` may only reference in-document fragments.
  for (const match of svg.matchAll(/<\s*(?:use|image)\b[^>]*?(?:xlink:)?href\s*=\s*["']([^"']*)["']/giu)) {
    if (!match[1].startsWith('#')) errors.push('svg: external reference is forbidden');
  }
  return errors;
}

function validateAssetName(value, label, errors) {
  if (!isText(value)) {
    errors.push(`${label} is required`);
    return;
  }
  if (!ASSET_NAME.test(value) || value.includes('/') || value.includes('\\') || value.includes('..')) {
    errors.push(`${label} must be a contained local asset name`);
    return;
  }
  if (!ASSET_EXTENSION.test(value)) errors.push(`${label} must use an allowed image extension`);
}

function validatePreview(preview, label, errors) {
  if (!isObject(preview)) {
    errors.push(`${label} must be an object`);
    return;
  }
  if (!PREVIEW_KINDS.includes(preview.kind)) {
    errors.push(`${label}.kind is invalid`);
    return;
  }
  const allowed = {
    wireframe: new Set(['kind', 'regions', 'caption']),
    svg: new Set(['kind', 'svg', 'caption']),
    image: new Set(['kind', 'asset', 'alt', 'caption']),
    flow: new Set(['kind', 'nodes', 'edges', 'caption']),
    table: new Set(['kind', 'columns', 'rows', 'caption']),
  }[preview.kind];
  if (!onlyKeys(preview, allowed)) errors.push(`${label} has unknown properties`);
  if (preview.caption !== undefined && !isText(preview.caption)) {
    errors.push(`${label}.caption must be non-empty text`);
  }

  if (preview.kind === 'wireframe') {
    if (!Array.isArray(preview.regions) || preview.regions.length === 0 || preview.regions.length > 12) {
      errors.push(`${label}.regions must contain 1 to 12 regions`);
      return;
    }
    preview.regions.forEach((region, index) => {
      if (!isObject(region) || !onlyKeys(region, new Set(['label', 'area', 'span', 'note']))) {
        errors.push(`${label}.regions[${index}] has an invalid shape`);
        return;
      }
      if (!isText(region.label)) errors.push(`${label}.regions[${index}].label is required`);
      if (!WIREFRAME_AREAS.includes(region.area)) errors.push(`${label}.regions[${index}].area is invalid`);
      if (region.span !== undefined && !(Number.isInteger(region.span) && region.span >= 1 && region.span <= 12)) {
        errors.push(`${label}.regions[${index}].span must be 1 to 12`);
      }
      if (region.note !== undefined && !isText(region.note)) {
        errors.push(`${label}.regions[${index}].note must be non-empty text`);
      }
    });
    return;
  }

  if (preview.kind === 'svg') {
    for (const message of validateInlineSvg(preview.svg)) errors.push(`${label}.${message}`);
    return;
  }

  if (preview.kind === 'image') {
    validateAssetName(preview.asset, `${label}.asset`, errors);
    if (!isText(preview.alt)) errors.push(`${label}.alt is required for an image preview`);
    return;
  }

  if (preview.kind === 'flow') {
    if (!Array.isArray(preview.nodes) || preview.nodes.length < 2 || preview.nodes.length > 16) {
      errors.push(`${label}.nodes must contain 2 to 16 nodes`);
      return;
    }
    const ids = new Set();
    preview.nodes.forEach((node, index) => {
      if (!isObject(node) || !onlyKeys(node, new Set(['id', 'label', 'role']))) {
        errors.push(`${label}.nodes[${index}] has an invalid shape`);
        return;
      }
      if (!isText(node.id) || !ID.test(node.id)) errors.push(`${label}.nodes[${index}].id is invalid`);
      else if (ids.has(node.id)) errors.push(`${label}.nodes[${index}].id is duplicated`);
      else ids.add(node.id);
      if (!isText(node.label)) errors.push(`${label}.nodes[${index}].label is required`);
      if (node.role !== undefined && !isText(node.role)) errors.push(`${label}.nodes[${index}].role must be text`);
    });
    if (!Array.isArray(preview.edges) || preview.edges.length === 0 || preview.edges.length > 32) {
      errors.push(`${label}.edges must contain 1 to 32 edges`);
      return;
    }
    preview.edges.forEach((edge, index) => {
      if (!isObject(edge) || !onlyKeys(edge, new Set(['from', 'to', 'label']))) {
        errors.push(`${label}.edges[${index}] has an invalid shape`);
        return;
      }
      if (!ids.has(edge.from)) errors.push(`${label}.edges[${index}].from is not a declared node`);
      if (!ids.has(edge.to)) errors.push(`${label}.edges[${index}].to is not a declared node`);
      if (edge.label !== undefined && !isText(edge.label)) errors.push(`${label}.edges[${index}].label must be text`);
    });
    return;
  }

  if (!Array.isArray(preview.columns) || preview.columns.length === 0 || preview.columns.length > 8) {
    errors.push(`${label}.columns must contain 1 to 8 columns`);
    return;
  }
  if (!preview.columns.every(isText)) errors.push(`${label}.columns must be non-empty text`);
  if (!Array.isArray(preview.rows) || preview.rows.length === 0 || preview.rows.length > 24) {
    errors.push(`${label}.rows must contain 1 to 24 rows`);
    return;
  }
  preview.rows.forEach((row, index) => {
    if (!Array.isArray(row) || row.length !== preview.columns.length) {
      errors.push(`${label}.rows[${index}] must match the column count`);
      return;
    }
    if (!row.every((cell) => typeof cell === 'string')) {
      errors.push(`${label}.rows[${index}] must contain text cells`);
    }
  });
}

/**
 * Validate a complete visual screen. Returns an array of human-readable errors;
 * an empty array means the screen may be published.
 */
export function validateVisualScreen(screen) {
  const errors = [];
  if (!isObject(screen)) return ['screen must be an object'];
  if (!onlyKeys(screen, SCREEN_KEYS)) errors.push('screen has unknown properties');
  for (const key of SCREEN_KEYS) if (!(key in screen)) errors.push(`screen.${key} is required`);
  if (screen.schema_version !== 1) errors.push('screen.schema_version must be 1');
  if (!isText(screen.screen_id) || !ID.test(screen.screen_id)) errors.push('screen.screen_id is invalid');
  if (!SCREEN_TYPES.includes(screen.type)) errors.push('screen.type is invalid');
  if (!isText(screen.question)) errors.push('screen.question is required');
  if (!Array.isArray(screen.criteria) || !screen.criteria.every(isText)) {
    errors.push('screen.criteria must be an array of text');
  }
  if (!isText(screen.recommendation) || !ID.test(screen.recommendation)) {
    errors.push('screen.recommendation is invalid');
  }
  if (!isText(screen.fallback_prompt)) errors.push('screen.fallback_prompt is required');

  if (
    !Array.isArray(screen.options) ||
    screen.options.length < MIN_OPTIONS ||
    screen.options.length > MAX_OPTIONS
  ) {
    errors.push(`screen.options must contain ${MIN_OPTIONS} to ${MAX_OPTIONS} options`);
    return errors;
  }

  const ids = new Set();
  screen.options.forEach((option, index) => {
    const label = `screen.options[${index}]`;
    if (!isObject(option) || !onlyKeys(option, OPTION_KEYS)) {
      errors.push(`${label} has an invalid shape`);
      return;
    }
    for (const key of ['id', 'label', 'summary', 'best_when', 'tradeoff', 'preview_asset']) {
      if (!isText(option[key])) errors.push(`${label}.${key} is required`);
    }
    if (!ID.test(option.id ?? '')) errors.push(`${label}.id is invalid`);
    if (ids.has(option.id)) errors.push(`${label}.id is duplicated`);
    ids.add(option.id);
    if (option.preview !== undefined) validatePreview(option.preview, `${label}.preview`, errors);
  });
  if (!ids.has(screen.recommendation)) errors.push('screen.recommendation must reference an option id');
  return errors;
}

export function assertValidScreen(screen) {
  const errors = validateVisualScreen(screen);
  if (errors.length > 0) throw new TypeError(`Invalid visual screen: ${errors.join('; ')}`);
  return screen;
}

export function isMultiSelect(screen) {
  return screen.type === 'multi_select';
}

export function optionIds(screen) {
  return screen.options.map((option) => option.id);
}

/** Local asset names a screen legitimately references, for the contained route. */
export function referencedAssets(screen) {
  return screen.options
    .map((option) => option.preview)
    .filter((preview) => preview?.kind === 'image')
    .map((preview) => preview.asset);
}

/**
 * A screen may carry a real preview. Callers use this to decide whether to
 * render a visual block or fall back to the `preview_asset` label, so a
 * filename is never presented as if it were the picture.
 */
export function hasRenderablePreview(option) {
  return isObject(option?.preview) && PREVIEW_KINDS.includes(option.preview.kind);
}
