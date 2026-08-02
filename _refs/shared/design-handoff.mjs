import { createHash } from 'node:crypto';
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
    !metadata.repository_relative_path.startsWith('design/specs/') ||
    !metadata.repository_relative_path.endsWith('.md')
  ) {
    errors.push({ code: 'INVALID_DESIGN_HANDOFF_PATH' });
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
    !source.path.startsWith('design/wireframes/')
  ) {
    errors.push({ code: 'INVALID_EDITABLE_SOURCE_PATH' });
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
        !output.path.startsWith('design/exports/png/') ||
        !['generated-mockup', 'illustration'].includes(output.classification) ||
        !CONTENT_HASH.test(output.sha256 ?? '') ||
        !HASH_IDENTITY.test(output.source_editable_artifact_hash ?? '')
      ) {
        errors.push({ code: 'INVALID_STATIC_DESIGN_PROVENANCE', index });
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
        screenshot.classification !== 'real-product-screenshot' ||
        typeof screenshot.repository_id !== 'string' ||
        !GIT_REVISION.test(screenshot.source_revision ?? '') ||
        !GIT_REVISION.test(screenshot.app_revision ?? '') ||
        typeof screenshot.evidence_id !== 'string' ||
        Number.isNaN(Date.parse(screenshot.captured_at ?? '')) ||
        !CONTENT_HASH.test(screenshot.sha256 ?? '')
      ) {
        errors.push({ code: 'INVALID_PRODUCT_SCREENSHOT_PROVENANCE', index });
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
      !HASH_IDENTITY.test(reference.artifact_hash ?? '') ||
      reference.editable !== false
    ) {
      errors.push({ code: 'INVALID_CROSS_REPOSITORY_DESIGN_REFERENCE', index });
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
      blockers: [
        module?.available !== true
          ? `module design owner is unavailable; portal fallback is forbidden`
          : `module design owner is not writable; portal fallback is forbidden`,
      ],
    };
  }
  return {
    status: 'resolved',
    experience_scope: experienceScope,
    ...owner,
    repository_relative_path: `design/specs/${feature}.md`,
    ledger_relative_path: `.sdcorejs/docs/design/${feature}.md`,
    blockers: [],
  };
}
