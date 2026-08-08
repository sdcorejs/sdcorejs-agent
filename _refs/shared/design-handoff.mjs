import { createHash } from 'node:crypto';
import {
  CANONICAL_DESIGN_HANDOFF_PREFIX,
  CANONICAL_DESIGN_PNG_EXPORT_PREFIX,
  CANONICAL_DESIGN_REFERENCE_PREFIX,
  CANONICAL_DESIGN_WIREFRAME_PREFIX,
  DESIGN_ARTIFACT_ROOT,
  DESIGN_LEDGER_ROOT,
  isLegacyDesignArtifactPath,
  DESIGN_ASSET_CATEGORIES,
  DESIGN_DOCUMENT_CATEGORIES,
  DESIGN_LOCAL_ONLY_DIRECTORIES,
  LEGACY_DESIGN_ARTIFACT_ROOT,
  planLegacyArtifactMigration,
  requireFileInventory,
  resolveArtifactReadSource,
  resolveDesignArtifactPaths,
  validateCanonicalArtifactMetadataPath,
} from './artifact-paths.mjs';
import { resolveArtifactOwner } from './repository-contract.mjs';
import { systemRegistry } from './system-registry.mjs';

const GIT_REVISION = /^[a-f0-9]{40}$/u;
const HASH_IDENTITY = /^sha256:v1:[a-f0-9]{64}$/u;
const CONTENT_HASH = /^[a-f0-9]{64}$/u;
const SAFE_FEATURE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const EXPERIENCE_SCOPES = new Set([
  'module',
  'portal-shell',
  'portal-composition',
  'cross-module',
]);

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return typeof value === 'string'
    ? value.replace(/\r\n?/gu, '\n').normalize('NFC')
    : value;
}

function stableJson(value) {
  return JSON.stringify(canonicalize(value));
}

function calculateArtifactHash(handoff) {
  const payload = structuredClone(handoff);
  delete payload.metadata?.artifact_hash;
  return `sha256:v1:${createHash('sha256')
    .update(stableJson(payload), 'utf8')
    .digest('hex')}`;
}

function requiredString(value, field, errors) {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push({ code: 'MISSING_DESIGN_FIELD', field });
    return false;
  }
  return true;
}

function isRelativePath(value) {
  return (
    typeof value === 'string' &&
    value !== '' &&
    !value.startsWith('/') &&
    !value.startsWith('\\') &&
    !/^[A-Za-z]:[\\/]/u.test(value) &&
    !value.split(/[\\/]/u).includes('..')
  );
}

function validateReference(reference, field, errors, {
  artifact = false,
  approval = false,
} = {}) {
  if (!reference || typeof reference !== 'object') {
    errors.push({ code: 'INVALID_DESIGN_REFERENCE', field });
    return;
  }
  requiredString(reference.repository_id, `${field}.repository_id`, errors);
  if (artifact) {
    requiredString(reference.artifact_id, `${field}.artifact_id`, errors);
  } else if (!isRelativePath(reference.path)) {
    errors.push({ code: 'INVALID_DESIGN_REFERENCE_PATH', field: `${field}.path` });
  }
  if (!GIT_REVISION.test(reference.revision ?? '')) {
    errors.push({ code: 'INVALID_DESIGN_REFERENCE_REVISION', field });
  }
  if (approval && !HASH_IDENTITY.test(reference.approval_hash ?? '')) {
    errors.push({ code: 'INVALID_DESIGN_APPROVAL_HASH', field });
  }
}

/**
 * Root-level `design/**` is a read-only compatibility input. New or updated
 * Design metadata must always name a canonical `.sdcorejs/design/**` path.
 */
function rejectLegacyDesignPath(value, field, errors) {
  if (!isLegacyDesignArtifactPath(value)) return false;
  errors.push({ code: 'LEGACY_DESIGN_ARTIFACT_PATH', field, path: value });
  return true;
}

function validateMetadata(metadata, errors) {
  if (!metadata || typeof metadata !== 'object') {
    errors.push({ code: 'MISSING_DESIGN_METADATA' });
    return;
  }
  if (metadata.schema_version !== 1) {
    errors.push({ code: 'UNSUPPORTED_DESIGN_SCHEMA' });
  }
  for (const field of [
    'artifact_id',
    'artifact_kind',
    'contract_id',
    'requirement_id',
    'change_ref',
    'track',
    'stack_profile',
    'experience_scope',
    'owner_repository_id',
    'owner_repository_role',
    'ownership_scope',
    'repository_relative_path',
    'source_revision',
  ]) {
    requiredString(metadata[field], field, errors);
  }
  if (metadata.artifact_kind !== 'design-handoff') {
    errors.push({ code: 'INVALID_DESIGN_ARTIFACT_KIND' });
  }
  const track = systemRegistry.aliases[metadata.track] ?? metadata.track;
  if (!systemRegistry.tracks.some(({ id }) => id === track)) {
    errors.push({ code: 'UNKNOWN_DESIGN_TRACK' });
  } else {
    metadata.track = track;
  }
  if (!systemRegistry.stack_profiles.some(({ id }) => id === metadata.stack_profile)) {
    errors.push({ code: 'UNKNOWN_DESIGN_STACK_PROFILE' });
  }
  if (!systemRegistry.repository_roles.includes(metadata.owner_repository_role)) {
    errors.push({ code: 'UNKNOWN_DESIGN_REPOSITORY_ROLE' });
  }
  if (!systemRegistry.ownership_scopes.includes(metadata.ownership_scope)) {
    errors.push({ code: 'UNKNOWN_DESIGN_OWNERSHIP_SCOPE' });
  }
  if (!EXPERIENCE_SCOPES.has(metadata.experience_scope)) {
    errors.push({ code: 'UNKNOWN_DESIGN_EXPERIENCE_SCOPE' });
  }
  if (
    !isRelativePath(metadata.repository_relative_path) ||
    !metadata.repository_relative_path.startsWith(CANONICAL_DESIGN_HANDOFF_PREFIX) ||
    !metadata.repository_relative_path.endsWith('.md')
  ) {
    errors.push({
      code: 'INVALID_DESIGN_HANDOFF_PATH',
      path: metadata.repository_relative_path,
    });
    rejectLegacyDesignPath(
      metadata.repository_relative_path,
      'repository_relative_path',
      errors,
    );
  }
  if (!GIT_REVISION.test(metadata.source_revision ?? '')) {
    errors.push({ code: 'INVALID_DESIGN_SOURCE_REVISION' });
  }
  if (metadata.experience_scope === 'module') {
    requiredString(metadata.owner_module_id, 'owner_module_id', errors);
    if (
      metadata.owner_repository_role !== 'module' ||
      metadata.ownership_scope !== 'module'
    ) {
      errors.push({ code: 'MODULE_DESIGN_OWNER_MISMATCH' });
    }
  } else {
    if (
      metadata.owner_repository_role !== 'portal' ||
      metadata.owner_module_id !== null
    ) {
      errors.push({ code: 'PORTAL_DESIGN_OWNER_MISMATCH' });
    }
    const expectedScope =
      metadata.experience_scope === 'cross-module'
        ? 'cross-repository-aggregate'
        : 'portal-composition';
    if (metadata.ownership_scope !== expectedScope) {
      errors.push({ code: 'PORTAL_DESIGN_SCOPE_MISMATCH' });
    }
  }
  if (!Array.isArray(metadata.parent_references)) {
    errors.push({ code: 'INVALID_DESIGN_PARENT_REFERENCES' });
  } else {
    const parentKinds = new Set();
    for (const [index, reference] of metadata.parent_references.entries()) {
      validateReference(
        reference,
        `parent_references[${index}]`,
        errors,
        { artifact: true, approval: true },
      );
      if (!systemRegistry.artifact_kinds.includes(reference?.artifact_kind)) {
        errors.push({ code: 'UNKNOWN_DESIGN_PARENT_KIND' });
      }
      parentKinds.add(reference?.artifact_kind);
    }
    if (!parentKinds.has('spec') || !parentKinds.has('plan')) {
      errors.push({ code: 'MISSING_APPROVED_SPEC_OR_PLAN' });
    }
  }
  if (
    metadata.supersedes !== null &&
    (typeof metadata.supersedes !== 'string' || metadata.supersedes.trim() === '')
  ) {
    errors.push({ code: 'INVALID_DESIGN_SUPERSEDES' });
  }
  if (
    metadata.approval_hash !== null &&
    metadata.approval_hash !== undefined &&
    !HASH_IDENTITY.test(metadata.approval_hash)
  ) {
    errors.push({ code: 'INVALID_DESIGN_APPROVAL_HASH' });
  }
}

function validateEditableSource(source, errors) {
  if (!source || typeof source !== 'object') {
    errors.push({ code: 'MISSING_EDITABLE_SOURCE' });
    return;
  }
  if (source.status === 'unavailable') {
    requiredString(source.limitation, 'editable_source.limitation', errors);
    errors.push({ code: 'EDITABLE_SOURCE_UNAVAILABLE' });
    return;
  }
  if (source.status !== 'available') {
    errors.push({ code: 'INVALID_EDITABLE_SOURCE_STATUS' });
    return;
  }
  if (
    !isRelativePath(source.path) ||
    !source.path.startsWith(CANONICAL_DESIGN_WIREFRAME_PREFIX)
  ) {
    errors.push({ code: 'INVALID_EDITABLE_SOURCE_PATH', path: source.path });
    rejectLegacyDesignPath(source.path, 'editable_source.path', errors);
  }
  if (!['html', 'svg', 'figma', 'figjam'].includes(source.format)) {
    errors.push({ code: 'INVALID_EDITABLE_SOURCE_FORMAT' });
  }
  if (!HASH_IDENTITY.test(source.artifact_hash ?? '')) {
    errors.push({ code: 'INVALID_EDITABLE_SOURCE_HASH' });
  }
}

function validateVisuals(handoff, errors) {
  if (!Array.isArray(handoff.static_exports)) {
    errors.push({ code: 'INVALID_STATIC_EXPORTS' });
  } else {
    for (const [index, output] of handoff.static_exports.entries()) {
      if (
        !isRelativePath(output?.path) ||
        !output.path.startsWith(CANONICAL_DESIGN_PNG_EXPORT_PREFIX) ||
        !['generated-mockup', 'illustration'].includes(output.classification) ||
        !CONTENT_HASH.test(output.sha256 ?? '') ||
        !HASH_IDENTITY.test(output.source_editable_artifact_hash ?? '')
      ) {
        errors.push({ code: 'INVALID_STATIC_DESIGN_PROVENANCE', index });
        rejectLegacyDesignPath(output?.path, `static_exports[${index}].path`, errors);
      }
      if (
        handoff.editable_source?.status === 'available' &&
        output?.source_editable_artifact_hash !==
          handoff.editable_source.artifact_hash
      ) {
        errors.push({ code: 'STATIC_EXPORT_EDITABLE_SOURCE_MISMATCH', index });
      }
    }
  }
  if (!Array.isArray(handoff.product_screenshots)) {
    errors.push({ code: 'INVALID_PRODUCT_SCREENSHOTS' });
  } else {
    for (const [index, screenshot] of handoff.product_screenshots.entries()) {
      if (
        !isRelativePath(screenshot?.path) ||
        !screenshot.path.startsWith(CANONICAL_DESIGN_REFERENCE_PREFIX) ||
        screenshot.classification !== 'real-product-screenshot' ||
        typeof screenshot.repository_id !== 'string' ||
        !GIT_REVISION.test(screenshot.source_revision ?? '') ||
        !GIT_REVISION.test(screenshot.app_revision ?? '') ||
        typeof screenshot.evidence_id !== 'string' ||
        Number.isNaN(Date.parse(screenshot.captured_at ?? '')) ||
        !CONTENT_HASH.test(screenshot.sha256 ?? '')
      ) {
        errors.push({ code: 'INVALID_PRODUCT_SCREENSHOT_PROVENANCE', index });
        rejectLegacyDesignPath(
          screenshot?.path,
          `product_screenshots[${index}].path`,
          errors,
        );
      }
    }
  }
}

function validateResponsiveAndComponents(handoff, errors) {
  if (
    handoff.responsive?.desktop !== true ||
    handoff.responsive?.tablet !== true ||
    handoff.responsive?.mobile !== true ||
    typeof handoff.responsive?.notes !== 'string' ||
    handoff.responsive.notes.trim() === ''
  ) {
    errors.push({ code: 'INCOMPLETE_RESPONSIVE_DESIGN' });
  }
  if (!Array.isArray(handoff.component_mapping)) {
    errors.push({ code: 'INVALID_COMPONENT_MAPPING' });
  } else {
    for (const [rowIndex, row] of handoff.component_mapping.entries()) {
      requiredString(row?.need, `component_mapping[${rowIndex}].need`, errors);
      requiredString(
        row?.component,
        `component_mapping[${rowIndex}].component`,
        errors,
      );
      if (!['confirmed', 'candidate', 'unknown', 'new'].includes(row?.status)) {
        errors.push({ code: 'INVALID_COMPONENT_MAPPING_STATUS', row: rowIndex });
      }
      if (!Array.isArray(row?.evidence_refs)) {
        errors.push({ code: 'INVALID_COMPONENT_EVIDENCE', row: rowIndex });
      } else {
        row.evidence_refs.forEach((reference, index) =>
          validateReference(
            reference,
            `component_mapping[${rowIndex}].evidence_refs[${index}]`,
            errors,
          ));
        if (row.status === 'confirmed' && row.evidence_refs.length === 0) {
          errors.push({
            code: 'CONFIRMED_COMPONENT_WITHOUT_EVIDENCE',
            row: rowIndex,
          });
        }
      }
    }
  }
  if (handoff.design_system_reuse?.inspected !== true) {
    errors.push({ code: 'DESIGN_SYSTEM_NOT_INSPECTED' });
  }
  if (!Array.isArray(handoff.design_system_reuse?.evidence_refs)) {
    errors.push({ code: 'INVALID_DESIGN_SYSTEM_EVIDENCE' });
  } else {
    handoff.design_system_reuse.evidence_refs.forEach((reference, index) =>
      validateReference(
        reference,
        `design_system_reuse.evidence_refs[${index}]`,
        errors,
      ));
  }
}

function validateCrossRepositoryReferences(
  handoff,
  repositoryRevisions,
  errors,
) {
  if (!Array.isArray(handoff.cross_repository_references)) {
    errors.push({ code: 'INVALID_CROSS_REPOSITORY_DESIGN_REFERENCES' });
    return;
  }
  const identities = new Set();
  for (const [index, reference] of handoff.cross_repository_references.entries()) {
    validateReference(
      reference,
      `cross_repository_references[${index}]`,
      errors,
      { artifact: true },
    );
    if (
      reference?.artifact_kind !== 'design-handoff' ||
      !isRelativePath(reference.repository_relative_path) ||
      !reference.repository_relative_path.startsWith(CANONICAL_DESIGN_HANDOFF_PREFIX) ||
      !HASH_IDENTITY.test(reference.artifact_hash ?? '') ||
      reference.editable !== false
    ) {
      errors.push({ code: 'INVALID_CROSS_REPOSITORY_DESIGN_REFERENCE', index });
      rejectLegacyDesignPath(
        reference?.repository_relative_path,
        `cross_repository_references[${index}].repository_relative_path`,
        errors,
      );
    }
    const identity = `${reference?.repository_id}\0${reference?.artifact_id}`;
    if (identities.has(identity)) {
      errors.push({ code: 'DUPLICATE_EDITABLE_DESIGN_SOURCE', identity });
    }
    identities.add(identity);
    if (
      repositoryRevisions?.[reference?.repository_id] &&
      repositoryRevisions[reference.repository_id] !== reference.revision
    ) {
      errors.push({
        code: 'STALE_DESIGN_REFERENCE',
        repository_id: reference.repository_id,
        artifact_id: reference.artifact_id,
      });
    }
  }
  if (
    handoff.metadata?.experience_scope === 'cross-module' &&
    handoff.cross_repository_references.length < 2
  ) {
    errors.push({ code: 'CROSS_MODULE_DESIGN_REQUIRES_MULTIPLE_SOURCES' });
  }
  if (
    handoff.metadata?.experience_scope !== 'cross-module' &&
    handoff.cross_repository_references.length > 0
  ) {
    errors.push({ code: 'UNEXPECTED_CROSS_REPOSITORY_DESIGN_REFERENCES' });
  }
}

export function validateDesignHandoff(
  input,
  { repository_revisions: repositoryRevisions = {} } = {},
) {
  const handoff = structuredClone(input ?? {});
  const errors = [];
  validateMetadata(handoff.metadata, errors);
  validateEditableSource(handoff.editable_source, errors);
  validateVisuals(handoff, errors);
  validateResponsiveAndComponents(handoff, errors);
  validateCrossRepositoryReferences(handoff, repositoryRevisions, errors);
  if (
    !Array.isArray(handoff.production_code_paths) ||
    handoff.production_code_paths.length > 0
  ) {
    errors.push({ code: 'PRODUCTION_CODE_AUTHORITY_FORBIDDEN' });
  }
  if (
    handoff.metadata?.artifact_hash &&
    handoff.metadata.artifact_hash !== calculateArtifactHash(handoff)
  ) {
    errors.push({ code: 'DESIGN_ARTIFACT_HASH_MISMATCH' });
  }
  return { ok: errors.length === 0, handoff, errors };
}

export function createDesignHandoff(input) {
  const handoff = structuredClone(input ?? {});
  delete handoff.metadata?.artifact_hash;
  const validation = validateDesignHandoff(handoff);
  if (!validation.ok) {
    const message = validation.errors
      .map(({ code }) => {
        if (code === 'PRODUCTION_CODE_AUTHORITY_FORBIDDEN') {
          return 'production code authority is forbidden';
        }
        if (code === 'MISSING_APPROVED_SPEC_OR_PLAN') {
          return 'design handoff requires approved spec and plan parents';
        }
        return code;
      })
      .join(', ');
    throw new Error(`invalid design handoff: ${message}`);
  }
  handoff.metadata.artifact_hash = calculateArtifactHash(handoff);
  return canonicalize(handoff);
}

export function resolveDesignHandoffTarget({
  experience_scope: experienceScope,
  feature,
  module,
  portal,
  screens = [],
  execution_host_repository_id: executionHostRepositoryId,
} = {}) {
  if (!EXPERIENCE_SCOPES.has(experienceScope)) {
    throw new TypeError(`unsupported design experience scope: ${experienceScope}`);
  }
  if (!SAFE_FEATURE.test(feature ?? '')) {
    throw new TypeError('feature must be a lowercase kebab-case identifier');
  }
  const scope =
    experienceScope === 'module'
      ? 'module'
      : experienceScope === 'cross-module'
        ? 'cross-repository-aggregate'
        : 'portal-composition';
  const owner = resolveArtifactOwner({
    artifact_kind: 'design-handoff',
    scope,
    module,
    portal,
    execution_host_repository_id: executionHostRepositoryId,
  });
  if (
    experienceScope === 'module' &&
    (module?.available !== true || module?.writable !== true)
  ) {
    return {
      status: 'blocked',
      experience_scope: experienceScope,
      ...owner,
      repository_relative_path: null,
      ledger_relative_path: null,
      artifact_root: DESIGN_ARTIFACT_ROOT,
      ledger_root: DESIGN_LEDGER_ROOT,
      flow_path: null,
      decisions_path: null,
      wireframe_directory: null,
      png_export_directory: null,
      reference_directory: null,
      screens: [],
      legacy_read_only_root: `${LEGACY_DESIGN_ARTIFACT_ROOT}/`,
      blockers: [
        module?.available !== true
          ? `module design owner is unavailable; portal fallback is forbidden`
          : `module design owner is not writable; portal fallback is forbidden`,
      ],
    };
  }
  const bundle = resolveDesignArtifactPaths(feature, { screens });
  return {
    status: 'resolved',
    experience_scope: experienceScope,
    ...owner,
    repository_relative_path: bundle.spec_path,
    ledger_relative_path: bundle.ledger_relative_path,
    artifact_root: bundle.artifact_root,
    ledger_root: bundle.ledger_root,
    flow_path: bundle.flow_path,
    decisions_path: bundle.decisions_path,
    wireframe_directory: bundle.wireframe_directory,
    png_export_directory: bundle.png_export_directory,
    reference_directory: bundle.reference_directory,
    screens: bundle.screens,
    legacy_read_only_root: `${LEGACY_DESIGN_ARTIFACT_ROOT}/`,
    blockers: [],
  };
}

/**
 * Resolve Design read sources for one feature, preferring canonical
 * `.sdcorejs/design/**` and falling back to a legacy root-level artifact only
 * when no canonical equivalent exists. Conflicting copies block.
 */
export function resolveDesignArtifactSources({ files, feature, screens = [] } = {}) {
  requireFileInventory(files, 'design artifact source resolution');
  const bundle = resolveDesignArtifactPaths(feature, { screens });
  const candidates = [
    ...bundle.documents.map((document) => ({
      category: document.category,
      canonicalPath: document.path,
      legacyPath: document.legacy_path,
    })),
    ...bundle.screens.flatMap((screen) => [
      {
        category: 'wireframe',
        canonicalPath: screen.wireframe_html_path,
        legacyPath: screen.legacy_wireframe_html_path,
      },
      {
        category: 'wireframe',
        canonicalPath: screen.wireframe_svg_path,
        legacyPath: screen.legacy_wireframe_svg_path,
      },
      {
        category: 'png_export',
        canonicalPath: screen.png_export_path,
        legacyPath: screen.legacy_png_export_path,
      },
      {
        category: 'reference',
        canonicalPath: screen.reference_path,
        legacyPath: screen.legacy_reference_path,
      },
    ]),
  ];
  const sources = candidates.map((candidate) => ({
    category: candidate.category,
    ...resolveArtifactReadSource({
      files,
      canonicalPath: candidate.canonicalPath,
      legacyPath: candidate.legacyPath,
    }),
  }));
  const blockers = sources.flatMap((source) => source.blockers);
  return {
    status: blockers.length > 0 ? 'blocked' : 'resolved',
    feature: bundle.feature,
    spec_path: bundle.spec_path,
    ledger_relative_path: bundle.ledger_relative_path,
    sources,
    legacy_fallback_paths: sources
      .filter((source) => source.status === 'legacy-fallback')
      .map((source) => source.readPath),
    blockers,
  };
}

/**
 * Plan the canonical migration for one Design feature bundle. Only the requested
 * feature moves; unrelated historical artifacts are never rewritten.
 */
export function planDesignArtifactMigration({ files, feature, screens = [] } = {}) {
  return planLegacyArtifactMigration({ files, track: 'design', feature, screens });
}

/**
 * Build the `artifact_context.required_with_change` closure entries for a Design
 * run. Specs, flows, decision logs, editable wireframes, durable exports,
 * approved screenshot references, and the ledger all participate.
 * Generated diagnostics that are not part of an approved handoff stay
 * `local_only`.
 */
export function buildDesignArtifactContext({
  feature,
  change_ref: changeRef,
  source_spec: sourceSpec = 'none',
  source_plan: sourcePlan = 'none',
  documents = ['spec', 'flow', 'decisions'],
  editable_sources: editableSources = [],
  static_exports: staticExports = [],
  product_screenshots: productScreenshots = [],
  diagnostics = [],
  ledger_written: ledgerWritten = true,
} = {}) {
  if (typeof changeRef !== 'string' || changeRef.trim() === '') {
    throw new TypeError('change_ref is required to build a design artifact context');
  }
  // A typo in `documents` used to silently drop an approved handoff document
  // from closure, so an unknown category fails loudly the way the Product side
  // already does.
  const unknownDocuments = [...documents].filter(
    (category) => !Object.hasOwn(DESIGN_DOCUMENT_CATEGORIES, category),
  );
  if (unknownDocuments.length > 0) {
    throw new TypeError(`unknown design document category: ${unknownDocuments.join(', ')}`);
  }
  const bundle = resolveDesignArtifactPaths(feature);
  const required = [];
  for (const document of bundle.documents) {
    if (!documents.includes(document.category)) continue;
    required.push({
      path: document.path,
      kind: 'design-asset',
      reason: `design ${document.category} written for this change`,
    });
  }
  // Validate through the shared path contract rather than a prefix check, so the
  // declared extension and `<feature>/<screen>` depth are gates too.
  const addAll = (paths, category, reason) => {
    for (const candidate of paths) {
      const normalized = String(candidate ?? '').replaceAll('\\', '/');
      const result = validateCanonicalArtifactMetadataPath(normalized, {
        track: 'design',
        category,
      });
      if (!result.ok) {
        throw new TypeError(
          `design ${category} path is not a canonical ${DESIGN_ASSET_CATEGORIES[category].directory} artifact (${result.code}): ${normalized}`,
        );
      }
      required.push({ path: normalized, kind: 'design-asset', reason });
    }
  };
  addAll(editableSources, 'wireframe', 'editable wireframe source for this change');
  addAll(
    staticExports,
    'png_export',
    'durable generated export bound to the editable source hash',
  );
  addAll(
    productScreenshots,
    'reference',
    'approved real product screenshot reference with provenance',
  );
  if (ledgerWritten) {
    required.push({
      path: bundle.ledger_relative_path,
      kind: 'design-handoff',
      reason: 'design traceability ledger written for this change',
    });
  }
  // Diagnostics were unvalidated, which is the inverse hazard: it could mark a
  // durable export never-commit.
  const localOnly = diagnostics.map((candidate) => {
    const normalized = String(candidate ?? '').replaceAll('\\', '/');
    const allowed = DESIGN_LOCAL_ONLY_DIRECTORIES.some((directory) =>
      normalized.startsWith(`${DESIGN_ARTIFACT_ROOT}/${directory}/`),
    );
    if (!allowed) {
      throw new TypeError(
        `design diagnostic must live under ${DESIGN_ARTIFACT_ROOT}/{${DESIGN_LOCAL_ONLY_DIRECTORIES.join(
          ',',
        )}}/: ${normalized}`,
      );
    }
    return {
      path: normalized,
      kind: 'diagnostic',
      reason: 'generated design diagnostic outside an approved durable handoff',
    };
  });
  return {
    schema_version: 1,
    change_ref: changeRef,
    source_spec: sourceSpec,
    source_plan: sourcePlan,
    required_with_change: required,
    shared_owned: [],
    conditional: [],
    local_only: localOnly,
    unrelated_observed: [],
  };
}
