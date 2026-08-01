import { createHash } from 'node:crypto';
import { resolveArtifactOwner } from './repository-contract.mjs';
import { systemRegistry } from './system-registry.mjs';

const GIT_REVISION = /^[a-f0-9]{40}$/u;
const SHA256_IDENTITY = /^sha256:v1:[a-f0-9]{64}$/u;
const SAFE_FEATURE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const DELIVERY_STATUSES = new Set([
  'draft',
  'planned',
  'implemented',
  'verified',
  'partial',
  'stale',
  'blocked',
  'deferred',
  'referenced',
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

function artifactHash(ledger) {
  const payload = structuredClone(ledger);
  delete payload.metadata?.artifact_hash;
  return `sha256:v1:${createHash('sha256')
    .update(stableJson(payload), 'utf8')
    .digest('hex')}`;
}

function requiredString(value, field, errors) {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push({ code: 'MISSING_LIFECYCLE_FIELD', field });
    return false;
  }
  return true;
}

function validRelativePath(value) {
  return (
    typeof value === 'string' &&
    value !== '' &&
    !value.startsWith('/') &&
    !value.startsWith('\\') &&
    !/^[A-Za-z]:[\\/]/u.test(value) &&
    !value.split(/[\\/]/u).includes('..')
  );
}

function validateArtifactReference(reference, field, errors, {
  approvalHash = false,
  repositoryPath = false,
} = {}) {
  if (!reference || typeof reference !== 'object') {
    errors.push({ code: 'INVALID_ARTIFACT_REFERENCE', field });
    return;
  }
  for (const key of ['repository_id']) {
    requiredString(reference[key], `${field}.${key}`, errors);
  }
  if (repositoryPath) {
    if (!validRelativePath(reference.path)) {
      errors.push({ code: 'INVALID_REPOSITORY_PATH', field: `${field}.path` });
    }
  } else {
    requiredString(reference.artifact_id, `${field}.artifact_id`, errors);
  }
  if (!GIT_REVISION.test(reference.revision ?? '')) {
    errors.push({ code: 'INVALID_SOURCE_REVISION', field: `${field}.revision` });
  }
  if (approvalHash && !SHA256_IDENTITY.test(reference.approval_hash ?? '')) {
    errors.push({ code: 'INVALID_APPROVAL_HASH', field: `${field}.approval_hash` });
  }
}

function validateMetadata(metadata, errors) {
  if (!metadata || typeof metadata !== 'object') {
    errors.push({ code: 'MISSING_LEDGER_METADATA' });
    return;
  }
  if (metadata.schema_version !== 1) {
    errors.push({ code: 'UNSUPPORTED_LEDGER_SCHEMA' });
  }
  for (const field of [
    'artifact_id',
    'artifact_kind',
    'contract_id',
    'requirement_id',
    'change_ref',
    'track',
    'stack_profile',
    'owner_repository_id',
    'owner_repository_role',
    'ownership_scope',
    'repository_relative_path',
    'source_revision',
  ]) {
    requiredString(metadata[field], field, errors);
  }
  if (metadata.artifact_kind !== 'product-ledger') {
    errors.push({ code: 'INVALID_PRODUCT_ARTIFACT_KIND' });
  }
  const track = systemRegistry.aliases[metadata.track] ?? metadata.track;
  if (!systemRegistry.tracks.some(({ id }) => id === track)) {
    errors.push({ code: 'UNKNOWN_PRODUCT_TRACK', track: metadata.track });
  } else {
    metadata.track = track;
  }
  if (!systemRegistry.stack_profiles.some(({ id }) => id === metadata.stack_profile)) {
    errors.push({
      code: 'UNKNOWN_PRODUCT_STACK_PROFILE',
      stack_profile: metadata.stack_profile,
    });
  }
  if (!systemRegistry.repository_roles.includes(metadata.owner_repository_role)) {
    errors.push({
      code: 'UNKNOWN_PRODUCT_REPOSITORY_ROLE',
      repository_role: metadata.owner_repository_role,
    });
  }
  if (!systemRegistry.ownership_scopes.includes(metadata.ownership_scope)) {
    errors.push({
      code: 'UNKNOWN_PRODUCT_OWNERSHIP_SCOPE',
      ownership_scope: metadata.ownership_scope,
    });
  }
  if (
    !validRelativePath(metadata.repository_relative_path) ||
    !metadata.repository_relative_path.startsWith('.sdcorejs/docs/product/') ||
    !metadata.repository_relative_path.endsWith('.md')
  ) {
    errors.push({
      code: 'INVALID_PRODUCT_LEDGER_PATH',
      path: metadata.repository_relative_path,
    });
  }
  if (!GIT_REVISION.test(metadata.source_revision ?? '')) {
    errors.push({ code: 'INVALID_SOURCE_REVISION', field: 'source_revision' });
  }
  if (metadata.ownership_scope === 'module') {
    requiredString(metadata.owner_module_id, 'owner_module_id', errors);
    if (metadata.owner_repository_role !== 'module') {
      errors.push({ code: 'MODULE_LEDGER_OWNER_ROLE_MISMATCH' });
    }
  } else if (
    metadata.owner_module_id !== null &&
    metadata.owner_module_id !== undefined
  ) {
    errors.push({ code: 'NON_MODULE_LEDGER_HAS_MODULE_OWNER' });
  }
  if (!Array.isArray(metadata.parent_references)) {
    errors.push({ code: 'INVALID_PARENT_REFERENCES' });
  } else {
    const identities = new Set();
    for (const [index, reference] of metadata.parent_references.entries()) {
      validateArtifactReference(
        reference,
        `parent_references[${index}]`,
        errors,
        { approvalHash: true },
      );
      if (
        reference?.artifact_kind &&
        !systemRegistry.artifact_kinds.includes(reference.artifact_kind)
      ) {
        errors.push({
          code: 'UNKNOWN_PARENT_ARTIFACT_KIND',
          artifact_kind: reference.artifact_kind,
        });
      }
      const identity = `${reference?.repository_id}\0${reference?.artifact_id}`;
      if (identities.has(identity)) {
        errors.push({ code: 'DUPLICATE_PARENT_REFERENCE', identity });
      }
      identities.add(identity);
    }
  }
  if (
    metadata.supersedes !== null &&
    (typeof metadata.supersedes !== 'string' || metadata.supersedes.trim() === '')
  ) {
    errors.push({ code: 'INVALID_SUPERSEDES_REFERENCE' });
  }
  if (
    metadata.approval_hash !== null &&
    metadata.approval_hash !== undefined &&
    !SHA256_IDENTITY.test(metadata.approval_hash)
  ) {
    errors.push({ code: 'INVALID_APPROVAL_HASH', field: 'approval_hash' });
  }
}

function validateSourceArtifacts(sourceArtifacts, errors) {
  if (!Array.isArray(sourceArtifacts)) {
    errors.push({ code: 'INVALID_PRODUCT_SOURCES' });
    return;
  }
  const identities = new Set();
  for (const [index, source] of sourceArtifacts.entries()) {
    validateArtifactReference(source, `source_artifacts[${index}]`, errors);
    if (source?.artifact_kind !== 'product-ledger') {
      errors.push({
        code: 'INVALID_PRODUCT_SOURCE_KIND',
        index,
      });
    }
    if (!validRelativePath(source?.repository_relative_path)) {
      errors.push({
        code: 'INVALID_REPOSITORY_PATH',
        field: `source_artifacts[${index}].repository_relative_path`,
      });
    }
    if (!SHA256_IDENTITY.test(source?.artifact_hash ?? '')) {
      errors.push({ code: 'INVALID_ARTIFACT_HASH', index });
    }
    const identity = `${source?.repository_id}\0${source?.artifact_id}`;
    if (identities.has(identity)) {
      errors.push({ code: 'DUPLICATE_PRODUCT_SOURCE', identity });
    }
    identities.add(identity);
  }
}

function normalizeTraceability(rows, repositoryRevisions, errors) {
  if (!Array.isArray(rows) || rows.length === 0) {
    errors.push({ code: 'MISSING_TRACEABILITY_ROWS' });
    return [];
  }
  const criteria = new Set();
  return rows.map((input, rowIndex) => {
    const row = structuredClone(input);
    for (const field of ['requirement_id', 'acceptance_criterion_id', 'delivery_status']) {
      requiredString(row[field], `traceability[${rowIndex}].${field}`, errors);
    }
    if (criteria.has(row.acceptance_criterion_id)) {
      errors.push({
        code: 'DUPLICATE_ACCEPTANCE_CRITERION_SOURCE',
        acceptance_criterion_id: row.acceptance_criterion_id,
      });
    }
    criteria.add(row.acceptance_criterion_id);
    validateArtifactReference(
      row.requirement_ref,
      `traceability[${rowIndex}].requirement_ref`,
      errors,
    );
    for (const field of [
      'design_refs',
      'plan_refs',
      'implementation_refs',
      'test_refs',
      'evidence_refs',
    ]) {
      if (!Array.isArray(row[field])) {
        errors.push({ code: 'INVALID_TRACEABILITY_REFERENCE_LIST', field, row: rowIndex });
        row[field] = [];
      }
    }
    for (const field of ['design_refs', 'plan_refs']) {
      row[field].forEach((reference, index) =>
        validateArtifactReference(
          reference,
          `traceability[${rowIndex}].${field}[${index}]`,
          errors,
        ));
    }
    for (const field of ['implementation_refs', 'test_refs']) {
      row[field].forEach((reference, index) =>
        validateArtifactReference(
          reference,
          `traceability[${rowIndex}].${field}[${index}]`,
          errors,
          { repositoryPath: true },
        ));
    }
    let stale = false;
    for (const [index, evidence] of row.evidence_refs.entries()) {
      validateArtifactReference(
        evidence,
        `traceability[${rowIndex}].evidence_refs[${index}]`,
        errors,
        { repositoryPath: true },
      );
      requiredString(
        evidence.evidence_id,
        `traceability[${rowIndex}].evidence_refs[${index}].evidence_id`,
        errors,
      );
      if (!systemRegistry.evidence_classes.includes(evidence.evidence_class)) {
        errors.push({
          code: 'UNKNOWN_EVIDENCE_CLASS',
          evidence_class: evidence.evidence_class,
        });
      }
      if (!systemRegistry.evidence_results.includes(evidence.result)) {
        errors.push({ code: 'UNKNOWN_EVIDENCE_RESULT', result: evidence.result });
      }
      const currentRevision = repositoryRevisions?.[evidence.repository_id];
      if (currentRevision && currentRevision !== evidence.revision) {
        evidence.result = 'STALE';
        stale = true;
      }
    }
    if (stale) {
      row.delivery_status = 'stale';
      errors.push({
        code: 'STALE_EVIDENCE',
        acceptance_criterion_id: row.acceptance_criterion_id,
      });
    }
    if (!DELIVERY_STATUSES.has(row.delivery_status)) {
      errors.push({
        code: 'UNKNOWN_DELIVERY_STATUS',
        delivery_status: row.delivery_status,
      });
    }
    if (
      row.delivery_status === 'verified' &&
      (
        row.test_refs.length === 0 ||
        row.evidence_refs.length === 0 ||
        row.evidence_refs.some(({ result }) => result !== 'PASSED')
      )
    ) {
      errors.push({
        code: 'VERIFIED_WITHOUT_TEST_EVIDENCE',
        acceptance_criterion_id: row.acceptance_criterion_id,
      });
    }
    return row;
  });
}

export function validateProductLedger(
  input,
  { repository_revisions: repositoryRevisions = {} } = {},
) {
  const ledger = structuredClone(input ?? {});
  const errors = [];
  validateMetadata(ledger.metadata, errors);
  validateSourceArtifacts(ledger.source_artifacts, errors);
  ledger.traceability = normalizeTraceability(
    ledger.traceability,
    repositoryRevisions,
    errors,
  );
  if (
    ledger.view_kind === 'cross-module-view' &&
    ledger.editable_requirements !== false
  ) {
    errors.push({ code: 'CROSS_MODULE_EDITABLE_REQUIREMENTS_FORBIDDEN' });
  }
  if (
    ledger.metadata?.artifact_hash &&
    ledger.metadata.artifact_hash !== artifactHash(ledger)
  ) {
    errors.push({ code: 'ARTIFACT_HASH_MISMATCH' });
  }
  return {
    ok: errors.length === 0,
    metadata: ledger.metadata,
    traceability: ledger.traceability,
    source_artifacts: ledger.source_artifacts,
    errors,
    ledger,
  };
}

export function createProductLedger(input) {
  const candidate = structuredClone(input ?? {});
  candidate.view_kind ??= 'module-ledger';
  candidate.editable_requirements ??= candidate.view_kind === 'module-ledger';
  delete candidate.metadata?.artifact_hash;
  const validation = validateProductLedger(candidate);
  if (!validation.ok) {
    throw new Error(
      `invalid product ledger:\n${validation.errors
        .map(({ code, field }) => `- ${code}${field ? ` (${field})` : ''}`)
        .join('\n')}`,
    );
  }
  candidate.metadata.artifact_hash = artifactHash(candidate);
  return canonicalize(candidate);
}

export function resolveProductLedgerTarget({
  scope,
  feature,
  module,
  portal,
  execution_host_repository_id: executionHostRepositoryId,
} = {}) {
  if (!SAFE_FEATURE.test(feature ?? '')) {
    throw new TypeError('feature must be a lowercase kebab-case identifier');
  }
  const owner = resolveArtifactOwner({
    artifact_kind: 'product-ledger',
    scope,
    module,
    portal,
    execution_host_repository_id: executionHostRepositoryId,
  });
  if (
    scope === 'module' &&
    (module?.available !== true || module?.writable !== true)
  ) {
    return {
      status: 'blocked',
      ...owner,
      repository_relative_path: null,
      blockers: [
        module?.available !== true
          ? `owner repository is unavailable for ${module?.id ?? feature}; portal fallback is forbidden`
          : `owner repository is not writable for ${module?.id ?? feature}; portal fallback is forbidden`,
      ],
    };
  }
  return {
    status: 'resolved',
    ...owner,
    repository_relative_path: `.sdcorejs/docs/product/${feature}.md`,
    blockers: [],
  };
}

export function buildCrossRepositoryProductView({ metadata, module_ledgers: moduleLedgers } = {}) {
  if (!Array.isArray(moduleLedgers) || moduleLedgers.length === 0) {
    throw new TypeError('module_ledgers must contain at least one module ledger reference');
  }
  const seen = new Set();
  for (const source of moduleLedgers) {
    if (source?.editable !== false) {
      throw new Error('editable module requirement source is forbidden in a cross-module view');
    }
    const identity = `${source.repository_id}\0${source.artifact_id}`;
    if (seen.has(identity)) {
      throw new Error(`duplicate product source: ${source.repository_id}:${source.artifact_id}`);
    }
    seen.add(identity);
  }
  if (
    metadata?.ownership_scope !== 'cross-repository-aggregate' ||
    metadata?.owner_repository_role !== 'portal' ||
    metadata?.owner_module_id !== null
  ) {
    throw new Error('cross-module product view must be owned by the portal integration owner');
  }
  const sourceArtifacts = moduleLedgers.map((source) => structuredClone(source));
  const traceability = sourceArtifacts.map((source) => ({
    requirement_id: `requirement:${source.module_id}`,
    acceptance_criterion_id: `reference:${source.module_id}`,
    requirement_ref: {
      repository_id: source.repository_id,
      artifact_id: source.artifact_id,
      revision: source.revision,
    },
    design_refs: [],
    plan_refs: [],
    implementation_refs: [],
    test_refs: [],
    evidence_refs: [],
    delivery_status: 'referenced',
  }));
  const ledger = createProductLedger({
    metadata,
    traceability,
    source_artifacts: sourceArtifacts,
    view_kind: 'cross-module-view',
    editable_requirements: false,
  });
  return { ok: true, ledger };
}
