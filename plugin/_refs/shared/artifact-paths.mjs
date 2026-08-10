import { createHash } from 'node:crypto';
import { systemRegistry } from './system-registry.mjs';

const SAFE_FEATURE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const SAFE_SCREEN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

export const PRODUCT_DOCUMENT_ROOT = systemRegistry.artifact_roots.product_documents;
export const PRODUCT_LEDGER_ROOT = systemRegistry.artifact_roots.product_ledger;
export const DESIGN_ARTIFACT_ROOT = systemRegistry.artifact_roots.design_artifacts;
export const DESIGN_LEDGER_ROOT = systemRegistry.artifact_roots.design_ledger;
export const ARCHITECTURE_ARTIFACT_ROOT = systemRegistry.artifact_roots.architecture;
export const LEGACY_PRODUCT_DOCUMENT_ROOT =
  systemRegistry.legacy_artifact_roots.product_documents;
export const LEGACY_DESIGN_ARTIFACT_ROOT =
  systemRegistry.legacy_artifact_roots.design_artifacts;

export const PRODUCT_DOCUMENT_CATEGORIES = Object.freeze({
  prd: { directory: 'prds', metadata_field: 'prd_path', extension: '.md' },
  user_stories: {
    directory: 'user-stories',
    metadata_field: 'user_stories_path',
    extension: '.md',
  },
  acceptance_criteria: {
    directory: 'acceptance-criteria',
    metadata_field: 'acceptance_criteria_path',
    extension: '.md',
  },
  uat_checklist: {
    directory: 'uat-checklists',
    metadata_field: 'uat_checklist_path',
    extension: '.md',
  },
  decisions: {
    directory: 'decisions',
    metadata_field: 'decisions_path',
    extension: '.md',
  },
});

export const DESIGN_DOCUMENT_CATEGORIES = Object.freeze({
  flow: { directory: 'flows', extension: '.md' },
  spec: { directory: 'specs', extension: '.md' },
  decisions: { directory: 'decisions', extension: '.md' },
});

export const DESIGN_ASSET_CATEGORIES = Object.freeze({
  wireframe: { directory: 'wireframes', extensions: ['.html', '.svg'] },
  png_export: { directory: 'exports/png', extensions: ['.png'] },
  reference: { directory: 'references', extensions: ['.png'] },
});

/** Design output that is never a durable handoff artifact. */
export const DESIGN_LOCAL_ONLY_DIRECTORIES = Object.freeze([
  'diagnostics',
  'failures',
  'tmp',
]);

export const CANONICAL_DESIGN_HANDOFF_PREFIX = `${DESIGN_ARTIFACT_ROOT}/${DESIGN_DOCUMENT_CATEGORIES.spec.directory}/`;
export const CANONICAL_DESIGN_WIREFRAME_PREFIX = `${DESIGN_ARTIFACT_ROOT}/${DESIGN_ASSET_CATEGORIES.wireframe.directory}/`;
export const CANONICAL_DESIGN_PNG_EXPORT_PREFIX = `${DESIGN_ARTIFACT_ROOT}/${DESIGN_ASSET_CATEGORIES.png_export.directory}/`;
export const CANONICAL_DESIGN_REFERENCE_PREFIX = `${DESIGN_ARTIFACT_ROOT}/${DESIGN_ASSET_CATEGORIES.reference.directory}/`;
export const CANONICAL_PRODUCT_LEDGER_PREFIX = `${PRODUCT_LEDGER_ROOT}/`;
export const CANONICAL_DESIGN_LEDGER_PREFIX = `${DESIGN_LEDGER_ROOT}/`;

export function normalizeArtifactPath(value) {
  return String(value ?? '')
    .replaceAll('\\', '/')
    .replace(/^\.\//u, '');
}

export function isRelativeArtifactPath(value) {
  const normalized = normalizeArtifactPath(value);
  return (
    normalized !== '' &&
    !normalized.startsWith('/') &&
    !/^[A-Za-z]:\//u.test(normalized) &&
    !normalized.split('/').includes('..')
  );
}

export function isSafeFeature(value) {
  return SAFE_FEATURE.test(value ?? '');
}

export function assertSafeFeature(feature) {
  if (!isSafeFeature(feature)) {
    throw new TypeError('feature must be a lowercase kebab-case identifier');
  }
  return feature;
}

function assertSafeScreen(screen) {
  if (!SAFE_SCREEN.test(screen ?? '')) {
    throw new TypeError('screen must be a lowercase kebab-case identifier');
  }
  return screen;
}

/**
 * Canonical Product document bundle plus its read-only legacy counterparts.
 */
export function resolveProductArtifactPaths(feature) {
  assertSafeFeature(feature);
  const documents = Object.entries(PRODUCT_DOCUMENT_CATEGORIES).map(
    ([category, contract]) => ({
      category,
      metadata_field: contract.metadata_field,
      path: `${PRODUCT_DOCUMENT_ROOT}/${contract.directory}/${feature}${contract.extension}`,
      legacy_path: `${LEGACY_PRODUCT_DOCUMENT_ROOT}/${contract.directory}/${feature}${contract.extension}`,
    }),
  );
  const byField = Object.fromEntries(
    documents.map((item) => [item.metadata_field, item.path]),
  );
  const legacyByField = Object.fromEntries(
    documents.map((item) => [item.metadata_field, item.legacy_path]),
  );
  return {
    feature,
    document_root: PRODUCT_DOCUMENT_ROOT,
    ledger_root: PRODUCT_LEDGER_ROOT,
    ledger_relative_path: `${PRODUCT_LEDGER_ROOT}/${feature}.md`,
    documents,
    document_paths: documents.map((item) => item.path),
    metadata_paths: byField,
    legacy: {
      document_root: LEGACY_PRODUCT_DOCUMENT_ROOT,
      document_paths: documents.map((item) => item.legacy_path),
      metadata_paths: legacyByField,
    },
  };
}

/**
 * Canonical Design artifact bundle plus its read-only legacy counterparts.
 */
export function resolveDesignArtifactPaths(feature, { screens = [] } = {}) {
  assertSafeFeature(feature);
  // A bare string would spread to individual characters, each of which passes
  // SAFE_SCREEN, producing silent bogus screens.
  if (!Array.isArray(screens)) {
    throw new TypeError('screens must be an array of lowercase kebab-case identifiers');
  }
  const documents = Object.entries(DESIGN_DOCUMENT_CATEGORIES).map(
    ([category, contract]) => ({
      category,
      path: `${DESIGN_ARTIFACT_ROOT}/${contract.directory}/${feature}${contract.extension}`,
      legacy_path: `${LEGACY_DESIGN_ARTIFACT_ROOT}/${contract.directory}/${feature}${contract.extension}`,
    }),
  );
  const screenBundles = [...new Set(screens)].map((screen) => {
    assertSafeScreen(screen);
    return {
      screen,
      wireframe_html_path: `${CANONICAL_DESIGN_WIREFRAME_PREFIX}${feature}/${screen}.html`,
      wireframe_svg_path: `${CANONICAL_DESIGN_WIREFRAME_PREFIX}${feature}/${screen}.svg`,
      png_export_path: `${CANONICAL_DESIGN_PNG_EXPORT_PREFIX}${feature}/${screen}.png`,
      reference_path: `${CANONICAL_DESIGN_REFERENCE_PREFIX}${feature}/${screen}.png`,
      legacy_wireframe_html_path: `${LEGACY_DESIGN_ARTIFACT_ROOT}/wireframes/${feature}/${screen}.html`,
      legacy_wireframe_svg_path: `${LEGACY_DESIGN_ARTIFACT_ROOT}/wireframes/${feature}/${screen}.svg`,
      legacy_png_export_path: `${LEGACY_DESIGN_ARTIFACT_ROOT}/exports/png/${feature}/${screen}.png`,
      legacy_reference_path: `${LEGACY_DESIGN_ARTIFACT_ROOT}/references/${feature}/${screen}.png`,
    };
  });
  const byCategory = Object.fromEntries(
    documents.map((item) => [item.category, item.path]),
  );
  return {
    feature,
    artifact_root: DESIGN_ARTIFACT_ROOT,
    ledger_root: DESIGN_LEDGER_ROOT,
    ledger_relative_path: `${DESIGN_LEDGER_ROOT}/${feature}.md`,
    flow_path: byCategory.flow,
    spec_path: byCategory.spec,
    decisions_path: byCategory.decisions,
    documents,
    document_paths: documents.map((item) => item.path),
    wireframe_directory: `${CANONICAL_DESIGN_WIREFRAME_PREFIX}${feature}`,
    png_export_directory: `${CANONICAL_DESIGN_PNG_EXPORT_PREFIX}${feature}`,
    reference_directory: `${CANONICAL_DESIGN_REFERENCE_PREFIX}${feature}`,
    screens: screenBundles,
    legacy: {
      artifact_root: LEGACY_DESIGN_ARTIFACT_ROOT,
      document_paths: documents.map((item) => item.legacy_path),
      flow_path: `${LEGACY_DESIGN_ARTIFACT_ROOT}/flows/${feature}.md`,
      spec_path: `${LEGACY_DESIGN_ARTIFACT_ROOT}/specs/${feature}.md`,
      decisions_path: `${LEGACY_DESIGN_ARTIFACT_ROOT}/decisions/${feature}.md`,
      wireframe_directory: `${LEGACY_DESIGN_ARTIFACT_ROOT}/wireframes/${feature}`,
      png_export_directory: `${LEGACY_DESIGN_ARTIFACT_ROOT}/exports/png/${feature}`,
      reference_directory: `${LEGACY_DESIGN_ARTIFACT_ROOT}/references/${feature}`,
    },
  };
}

/**
 * Design categories that address a screen inside a feature directory. A flat
 * file directly under one of these directories has no screen identity, so it is
 * not a member of the category rather than a member with a guessed feature.
 */
const NESTED_DESIGN_CATEGORIES = new Set(['wireframe', 'png_export', 'reference']);

function categoryExtensions(contract) {
  return contract.extensions ?? [contract.extension];
}

function matchCategory(rest, categories) {
  for (const [category, contract] of Object.entries(categories)) {
    if (rest === contract.directory || rest.startsWith(`${contract.directory}/`)) {
      return {
        category,
        directory: contract.directory,
        extensions: categoryExtensions(contract),
      };
    }
  }
  return null;
}

/**
 * Resolve the member identity for a matched category.
 *
 * Matching the directory prefix alone is not enough: a `payload.zip` under
 * `exports/png/<feature>/` would otherwise classify as a durable design asset
 * and inherit the feature's change relationship. The declared extension
 * allowlist and the required path depth are both gates, so anything else fails
 * closed to `unknown` instead of being auto-included in a commit.
 */
function resolveCategoryMember(rest, matched, { nested }) {
  if (rest === matched.directory) {
    return { ok: false, code: 'MISSING_ARTIFACT_FILE' };
  }
  const segments = rest.slice(matched.directory.length + 1).split('/');
  if (segments.some((segment) => segment === '')) {
    return { ok: false, code: 'MISSING_ARTIFACT_FILE' };
  }
  if (segments.length !== (nested ? 2 : 1)) {
    return {
      ok: false,
      code: nested ? 'INVALID_NESTED_ARTIFACT_PATH' : 'INVALID_FLAT_ARTIFACT_PATH',
    };
  }
  const file = segments.at(-1);
  const dot = file.lastIndexOf('.');
  const extension = dot === -1 ? '' : file.slice(dot).toLowerCase();
  if (!matched.extensions.includes(extension)) {
    return { ok: false, code: 'UNSUPPORTED_ARTIFACT_EXTENSION', extension };
  }
  const stem = file.slice(0, file.length - extension.length);
  const feature = nested ? segments[0] : stem;
  if (!SAFE_FEATURE.test(feature)) {
    return { ok: false, code: 'INVALID_ARTIFACT_FEATURE' };
  }
  if (!nested) return { ok: true, feature, screen: null };
  if (!SAFE_SCREEN.test(stem)) {
    return { ok: false, code: 'INVALID_ARTIFACT_SCREEN' };
  }
  return { ok: true, feature, screen: stem };
}

/**
 * Classify a Product document path as canonical, legacy, or unrelated.
 * The Product ledger root is reported separately so callers never confuse an
 * agent traceability ledger with a human-readable Product document.
 */
export function classifyProductArtifactPath(value) {
  const path = normalizeArtifactPath(value);
  if (!isRelativeArtifactPath(path)) {
    return { ok: false, code: 'INVALID_RELATIVE_PATH', path };
  }
  if (path === PRODUCT_LEDGER_ROOT || path.startsWith(CANONICAL_PRODUCT_LEDGER_PREFIX)) {
    return { ok: true, track: 'product', location: 'canonical', kind: 'product-ledger', path };
  }
  for (const [location, root] of [
    ['canonical', PRODUCT_DOCUMENT_ROOT],
    ['legacy', LEGACY_PRODUCT_DOCUMENT_ROOT],
  ]) {
    if (path !== root && !path.startsWith(`${root}/`)) continue;
    const rest = path.slice(root.length + 1);
    const matched = matchCategory(rest, PRODUCT_DOCUMENT_CATEGORIES);
    if (!matched) {
      return {
        ok: false,
        code: 'UNKNOWN_PRODUCT_DOCUMENT_CATEGORY',
        track: 'product',
        location,
        path,
      };
    }
    const member = resolveCategoryMember(rest, matched, { nested: false });
    if (!member.ok) {
      return {
        ok: false,
        code: member.code,
        track: 'product',
        location,
        category: matched.category,
        path,
      };
    }
    return {
      ok: true,
      track: 'product',
      location,
      kind: 'product-doc',
      category: matched.category,
      durable: true,
      feature: member.feature,
      path,
    };
  }
  return { ok: false, code: 'OUTSIDE_PRODUCT_ROOTS', path };
}

/**
 * Classify a Design artifact path as canonical, legacy, or unrelated.
 */
export function classifyDesignArtifactPath(value) {
  const path = normalizeArtifactPath(value);
  if (!isRelativeArtifactPath(path)) {
    return { ok: false, code: 'INVALID_RELATIVE_PATH', path };
  }
  if (path === DESIGN_LEDGER_ROOT || path.startsWith(CANONICAL_DESIGN_LEDGER_PREFIX)) {
    return { ok: true, track: 'design', location: 'canonical', kind: 'design-handoff', path };
  }
  for (const [location, root] of [
    ['canonical', DESIGN_ARTIFACT_ROOT],
    ['legacy', LEGACY_DESIGN_ARTIFACT_ROOT],
  ]) {
    if (path !== root && !path.startsWith(`${root}/`)) continue;
    const rest = path.slice(root.length + 1);
    const localOnly = DESIGN_LOCAL_ONLY_DIRECTORIES.find(
      (directory) => rest === directory || rest.startsWith(`${directory}/`),
    );
    if (localOnly) {
      return {
        ok: true,
        track: 'design',
        location,
        kind: 'diagnostic',
        category: localOnly,
        durable: false,
        path,
      };
    }
    const matched =
      matchCategory(rest, DESIGN_DOCUMENT_CATEGORIES) ??
      matchCategory(rest, DESIGN_ASSET_CATEGORIES);
    if (!matched) {
      return {
        ok: false,
        code: 'UNKNOWN_DESIGN_ARTIFACT_CATEGORY',
        track: 'design',
        location,
        path,
      };
    }
    const nested = NESTED_DESIGN_CATEGORIES.has(matched.category);
    const member = resolveCategoryMember(rest, matched, { nested });
    if (!member.ok) {
      return {
        ok: false,
        code: member.code,
        track: 'design',
        location,
        category: matched.category,
        path,
      };
    }
    return {
      ok: true,
      track: 'design',
      location,
      kind: 'design-asset',
      category: matched.category,
      durable: true,
      feature: member.feature,
      screen: member.screen,
      path,
    };
  }
  return { ok: false, code: 'OUTSIDE_DESIGN_ROOTS', path };
}

export function isLegacyProductDocumentPath(value) {
  const classification = classifyProductArtifactPath(value);
  return classification.track === 'product' && classification.location === 'legacy';
}

export function isLegacyDesignArtifactPath(value) {
  const classification = classifyDesignArtifactPath(value);
  return classification.track === 'design' && classification.location === 'legacy';
}

/** True for any root-level Product or Design path. Never a valid write target. */
export function isLegacyArtifactPath(value) {
  return isLegacyProductDocumentPath(value) || isLegacyDesignArtifactPath(value);
}

/** Translate a legacy root-level path into its canonical `.sdcorejs` path. */
export function toCanonicalArtifactPath(value) {
  const path = normalizeArtifactPath(value);
  if (path === LEGACY_PRODUCT_DOCUMENT_ROOT || path.startsWith(`${LEGACY_PRODUCT_DOCUMENT_ROOT}/`)) {
    return `${PRODUCT_DOCUMENT_ROOT}${path.slice(LEGACY_PRODUCT_DOCUMENT_ROOT.length)}`;
  }
  if (path === LEGACY_DESIGN_ARTIFACT_ROOT || path.startsWith(`${LEGACY_DESIGN_ARTIFACT_ROOT}/`)) {
    return `${DESIGN_ARTIFACT_ROOT}${path.slice(LEGACY_DESIGN_ARTIFACT_ROOT.length)}`;
  }
  return path;
}

/** Translate a canonical `.sdcorejs` path into its legacy read-only counterpart. */
export function toLegacyArtifactPath(value) {
  const path = normalizeArtifactPath(value);
  if (path === PRODUCT_DOCUMENT_ROOT || path.startsWith(`${PRODUCT_DOCUMENT_ROOT}/`)) {
    return `${LEGACY_PRODUCT_DOCUMENT_ROOT}${path.slice(PRODUCT_DOCUMENT_ROOT.length)}`;
  }
  if (path === DESIGN_ARTIFACT_ROOT || path.startsWith(`${DESIGN_ARTIFACT_ROOT}/`)) {
    return `${LEGACY_DESIGN_ARTIFACT_ROOT}${path.slice(DESIGN_ARTIFACT_ROOT.length)}`;
  }
  return path;
}

/**
 * Accept the same inventory shapes as `_refs/shared/documentation-layout.mjs`.
 * An array silently became index keys before, so every lookup missed and a
 * migration gate reported `not-required` for a repository that needed one.
 */
function fileInventory(files) {
  const inventory = new Map();
  if (files === null || files === undefined) return inventory;
  if (files instanceof Map) {
    for (const [key, value] of files) inventory.set(normalizeArtifactPath(key), value);
    return inventory;
  }
  if (Array.isArray(files)) {
    for (const entry of files) {
      if (Array.isArray(entry)) {
        inventory.set(normalizeArtifactPath(entry[0]), entry[1]);
        continue;
      }
      if (entry && typeof entry === 'object' && 'path' in entry) {
        inventory.set(normalizeArtifactPath(entry.path), entry.content);
        continue;
      }
      throw new TypeError(
        'file inventory entries must be [path, content] pairs or { path, content } records',
      );
    }
    return inventory;
  }
  if (typeof files === 'object') {
    for (const [key, value] of Object.entries(files)) {
      inventory.set(normalizeArtifactPath(key), value);
    }
    return inventory;
  }
  throw new TypeError('files must be a Map, a plain object, or an array of entries');
}

/**
 * Gates that decide migration or read fallback must not treat a forgotten
 * inventory as an empty repository - that silently reports success.
 */
export function requireFileInventory(files, operation) {
  if (files === null || files === undefined) {
    throw new TypeError(`${operation} requires an explicit files inventory`);
  }
  return fileInventory(files);
}

function contentHash(value) {
  const buffer =
    value instanceof Uint8Array ? Buffer.from(value) : Buffer.from(String(value ?? ''), 'utf8');
  return createHash('sha256').update(buffer).digest('hex');
}

function looksBinary(value) {
  if (typeof value === 'string') return false;
  if (!(value instanceof Uint8Array)) return false;
  return Buffer.from(value.subarray(0, 8000)).includes(0);
}

function normalizeSemanticText(value) {
  return String(value ?? '')
    .replace(/^\uFEFF/u, '')
    .replace(/\r\n?/gu, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/gu, ''))
    .join('\n')
    .trim();
}

function decodeArtifactText(value) {
  if (typeof value === 'string') return value;
  if (value instanceof Uint8Array) return Buffer.from(value).toString('utf8');
  return null;
}

/**
 * Compare two copies of one logical artifact.
 *
 * Text is compared semantically so a pure line-ending difference is not a
 * conflict. That has to hold for byte inputs too: a caller that reads both
 * copies with `readFile(path)` gets Buffers, and on a Windows checkout with
 * `core.autocrlf` a CRLF/LF difference would otherwise block the prescribed
 * migration for no real reason.
 */
function equivalentArtifactContent(left, right) {
  if (looksBinary(left) || looksBinary(right)) {
    return contentHash(left) === contentHash(right);
  }
  const leftText = decodeArtifactText(left);
  const rightText = decodeArtifactText(right);
  if (leftText === null || rightText === null) {
    return contentHash(left) === contentHash(right);
  }
  return normalizeSemanticText(leftText) === normalizeSemanticText(rightText);
}

/**
 * Compare the canonical location with its legacy counterpart for one logical
 * artifact identity.
 *
 * States: `missing`, `canonical-existing`, `legacy-existing`, `both-equivalent`,
 * `both-conflicting`. Canonical is always the selected write target; legacy is
 * only ever a read-only compatibility input.
 */
export function resolveArtifactLocationState({ files, canonicalPath, legacyPath } = {}) {
  const canonical = normalizeArtifactPath(canonicalPath);
  const legacy = normalizeArtifactPath(legacyPath ?? toLegacyArtifactPath(canonical));
  if (!isRelativeArtifactPath(canonical) || !isRelativeArtifactPath(legacy)) {
    return {
      state: 'invalid-path',
      canonicalPath: canonical,
      legacyPath: legacy,
      readPath: null,
      writePath: null,
      conflict: 'INVALID_RELATIVE_PATH',
      migration: null,
    };
  }
  const inventory = fileInventory(files);
  const hasCanonical = inventory.has(canonical);
  const hasLegacy = inventory.has(legacy);
  const base = {
    canonicalPath: canonical,
    legacyPath: legacy,
    writePath: canonical,
    conflict: null,
    migration: null,
  };
  if (hasCanonical && hasLegacy) {
    const equivalent = equivalentArtifactContent(
      inventory.get(canonical),
      inventory.get(legacy),
    );
    return {
      ...base,
      state: equivalent ? 'both-equivalent' : 'both-conflicting',
      readPath: equivalent ? canonical : null,
      conflict: equivalent ? null : 'CANONICAL_LEGACY_CONFLICT',
      migration: equivalent
        ? { operation: 'retire-legacy-copy', from: legacy, to: canonical }
        : null,
    };
  }
  if (hasCanonical) {
    return { ...base, state: 'canonical-existing', readPath: canonical };
  }
  if (hasLegacy) {
    return {
      ...base,
      state: 'legacy-existing',
      readPath: legacy,
      migration: { operation: 'migrate-to-canonical', from: legacy, to: canonical },
    };
  }
  return { ...base, state: 'missing', readPath: null };
}

/**
 * Resolve the read source for one logical artifact identity. Canonical always
 * wins; a legacy path is a fallback only when no canonical equivalent exists.
 */
export function resolveArtifactReadSource(input) {
  const state = resolveArtifactLocationState(input);
  if (state.state === 'both-conflicting') {
    return {
      status: 'blocked',
      ...state,
      blockers: [
        `canonical ${state.canonicalPath} and legacy ${state.legacyPath} disagree; resolve the conflicting source before reading either`,
      ],
    };
  }
  if (state.state === 'invalid-path') {
    return { status: 'blocked', ...state, blockers: ['artifact path is not repository-relative'] };
  }
  if (state.state === 'legacy-existing') {
    return { status: 'legacy-fallback', ...state, blockers: [] };
  }
  if (state.state === 'missing') {
    return { status: 'missing', ...state, blockers: [] };
  }
  return { status: 'canonical', ...state, blockers: [] };
}

function bundlePaths(track, feature, options) {
  if (track === 'product') {
    const bundle = resolveProductArtifactPaths(feature);
    return [
      ...bundle.documents.map((item) => ({
        category: item.category,
        canonicalPath: item.path,
        legacyPath: item.legacy_path,
      })),
    ];
  }
  if (track === 'design') {
    const bundle = resolveDesignArtifactPaths(feature, options);
    return [
      ...bundle.documents.map((item) => ({
        category: item.category,
        canonicalPath: item.path,
        legacyPath: item.legacy_path,
      })),
      ...bundle.screens.flatMap((item) => [
        {
          category: 'wireframe',
          canonicalPath: item.wireframe_html_path,
          legacyPath: item.legacy_wireframe_html_path,
        },
        {
          category: 'wireframe',
          canonicalPath: item.wireframe_svg_path,
          legacyPath: item.legacy_wireframe_svg_path,
        },
        {
          category: 'png_export',
          canonicalPath: item.png_export_path,
          legacyPath: item.legacy_png_export_path,
        },
        {
          category: 'reference',
          canonicalPath: item.reference_path,
          legacyPath: item.legacy_reference_path,
        },
      ]),
    ];
  }
  throw new TypeError(`unsupported artifact track: ${track}`);
}

/**
 * Plan the migration of one Product or Design artifact bundle from the legacy
 * root-level layout to the canonical `.sdcorejs` layout.
 *
 * Only the requested feature bundle is planned. Unrelated historical artifacts
 * are never bulk-migrated. Conflicting canonical/legacy copies block.
 */
export function planLegacyArtifactMigration({
  files,
  track,
  feature,
  screens = [],
} = {}) {
  assertSafeFeature(feature);
  requireFileInventory(files, 'legacy artifact migration planning');
  const entries = bundlePaths(track, feature, { screens });
  const states = [];
  const migrations = [];
  const conflicts = [];
  const retirements = [];
  for (const entry of entries) {
    const state = resolveArtifactLocationState({
      files,
      canonicalPath: entry.canonicalPath,
      legacyPath: entry.legacyPath,
    });
    states.push({ ...entry, ...state });
    if (state.state === 'legacy-existing') {
      migrations.push({ from: state.legacyPath, to: state.canonicalPath });
    } else if (state.state === 'both-conflicting') {
      conflicts.push({
        code: 'CANONICAL_LEGACY_CONFLICT',
        canonical_path: state.canonicalPath,
        legacy_path: state.legacyPath,
      });
    } else if (state.state === 'both-equivalent') {
      retirements.push({ from: state.legacyPath, to: state.canonicalPath });
    }
  }
  const blockers = conflicts.map(
    ({ canonical_path: canonicalPath, legacy_path: legacyPath }) =>
      `${track} artifact conflict: ${canonicalPath} and ${legacyPath} are not equivalent; never silently merge competing sources`,
  );
  let status = 'not-required';
  if (blockers.length > 0) status = 'blocked';
  else if (migrations.length > 0 || retirements.length > 0) status = 'migration-required';
  return {
    status,
    track,
    feature,
    states,
    migrations,
    retirements,
    conflicts,
    blockers,
    write_root: track === 'product' ? PRODUCT_DOCUMENT_ROOT : DESIGN_ARTIFACT_ROOT,
    legacy_root:
      track === 'product' ? LEGACY_PRODUCT_DOCUMENT_ROOT : LEGACY_DESIGN_ARTIFACT_ROOT,
  };
}

/**
 * Validate a durable metadata path field. New or updated metadata must always
 * name a canonical `.sdcorejs` path; a legacy root-level path is rejected.
 */
export function validateCanonicalArtifactMetadataPath(value, { track, category } = {}) {
  if (track !== 'product' && track !== 'design') {
    return { ok: false, code: 'UNKNOWN_ARTIFACT_TRACK', track: track ?? null };
  }
  const path = normalizeArtifactPath(value);
  if (!isRelativeArtifactPath(path)) {
    return { ok: false, code: 'INVALID_RELATIVE_PATH', path };
  }
  const classification =
    track === 'product' ? classifyProductArtifactPath(path) : classifyDesignArtifactPath(path);
  if (classification.location === 'legacy') {
    return {
      ok: false,
      code: track === 'product' ? 'LEGACY_PRODUCT_DOCUMENT_PATH' : 'LEGACY_DESIGN_ARTIFACT_PATH',
      path,
    };
  }
  // This validates a durable document path, so a ledger path, a local-only
  // diagnostic, and a bare category directory all have to be rejected even
  // though they sit inside the canonical roots.
  const expectedKind = track === 'product' ? 'product-doc' : 'design-asset';
  if (
    !classification.ok ||
    classification.location !== 'canonical' ||
    classification.kind !== expectedKind ||
    classification.durable !== true ||
    !classification.feature
  ) {
    return {
      ok: false,
      code:
        track === 'product' ? 'INVALID_PRODUCT_DOCUMENT_PATH' : 'INVALID_DESIGN_ARTIFACT_PATH',
      path,
    };
  }
  if (category && classification.category !== category) {
    return {
      ok: false,
      code:
        track === 'product'
          ? 'PRODUCT_DOCUMENT_CATEGORY_MISMATCH'
          : 'DESIGN_ARTIFACT_CATEGORY_MISMATCH',
      path,
      expected_category: category,
      actual_category: classification.category ?? null,
    };
  }
  return {
    ok: true,
    path,
    category: classification.category,
    feature: classification.feature,
  };
}
