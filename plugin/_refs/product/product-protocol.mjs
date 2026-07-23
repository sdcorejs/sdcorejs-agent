import { createHash } from 'node:crypto';
import { lstat, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import {
  hashApprovedSnapshot,
  hashApprovedSnapshotIntegrity,
  parseApprovedPlanContext,
  validateApprovedPlanIntegrity,
  validateApprovedPlanWriteScope
} from '../shared/approved-plan-integrity.mjs';

export const PRODUCT_ACTIONS = Object.freeze([
  'seed-from-approved-spec',
  'requirements-update',
  'traceability-sync',
  'audit-readonly',
  'audit-and-sync',
  'record-uat',
  'supersede-feature'
]);

const ACTION_WRITE_POLICY = Object.freeze({
  'seed-from-approved-spec': true,
  'requirements-update': true,
  'traceability-sync': true,
  'audit-readonly': false,
  'audit-and-sync': true,
  'record-uat': true,
  'supersede-feature': true
});

const VERDICT_PRIORITY = Object.freeze([
  'BLOCKED',
  'STALE',
  'PARTIAL',
  'READY_WITH_WARNINGS',
  'READY',
  'DEFERRED',
  'NOT_APPLICABLE'
]);

const DERIVED_ACTIONS = new Set(['traceability-sync', 'audit-readonly', 'audit-and-sync', 'record-uat']);
const NORMATIVE_ACTIONS = new Set(['seed-from-approved-spec', 'requirements-update', 'supersede-feature']);
const TRUSTED_APPROVED_SPEC_AUTHORITIES = new WeakSet();
const TRUSTED_RELEVANT_PATH_STATES = new WeakSet();
const TRUSTED_EXECUTION_ATTESTATIONS = new WeakSet();
const TRUSTED_FINAL_PRODUCT_AUTHORIZATIONS = new WeakSet();
const TRUSTED_AUDIT_READONLY_STATES = new WeakSet();
const TRUSTED_PRODUCT_LAYOUT_STATES = new WeakSet();
const TRUSTED_PRODUCT_DECISION_AUTHORITIES = new WeakSet();
const INTERNAL_PRODUCT_DECISION_VALIDATION = Symbol('internal-product-decision-validation');
const APPROVED_SPEC_APPROVAL_SOURCES = new Set(['explicit-user-choice']);
const PRODUCT_LEDGER_ROOT = '.sdcorejs/docs/product';
const PROHIBITED_PRODUCT_TOP_LEVELS = new Set([
  '.git', '.github', '.claude', '.cursor', '_refs', 'app', 'apps', 'backend',
  'build', 'codex', 'coverage', 'dist', 'frontend', 'migrations', 'node_modules',
  'plugin', 'scripts', 'site', 'skills', 'src', 'test', 'tests', 'vendor'
]);
const PROHIBITED_PRODUCT_BASENAMES = new Set([
  'package.json', 'package-lock.json', 'npm-shrinkwrap.json', 'pnpm-lock.yaml',
  'yarn.lock', 'bun.lock', 'bun.lockb'
]);
const SHA256_PATTERN = /^[a-f0-9]{64}$/i;
const AUTOMATED_EXECUTION_ATTESTATION_FIELDS = Object.freeze([
  'evidence_id', 'command', 'exit_code', 'outcome', 'observed_result', 'output_digest',
  'verified_head', 'relevant_paths', 'relevant_path_hashes', 'relevant_paths_hash'
]);
const MANUAL_UAT_EXECUTION_ATTESTATION_FIELDS = Object.freeze([
  'uat_record_id', 'scenario_id', 'contract_id', 'requirement_revision', 'requirement_ids',
  'scenario_source_ref', 'scenario_source_hash', 'preconditions', 'actor_role',
  'test_data_ref', 'environment_fingerprint', 'steps_ref', 'expected_result',
  'expected_result_ref', 'evidence_refs', 'execution_kind', 'executed_by',
  'executed_at', 'recorded_by', 'recorded_at', 'status', 'actual_result',
  'decision', 'redaction', 'build_or_revision'
]);
const APPROVED_PLAN_IDENTITY_FIELDS = Object.freeze([
  'approved_plan_path', 'approved_plan_hash', 'approved_plan_integrity_hash'
]);
const TRACEABILITY_ROW_FIELDS = Object.freeze([
  'requirement_id', 'required', 'source_ref', 'source_hash', 'requirement_status',
  'implementation_status', 'implementation_refs', 'implementation_approval',
  'verification_status', 'verification_evidence_ids', 'verification_approval',
  'uat_status', 'uat_required', 'uat_record_ids', 'uat_approval',
  'evidence_freshness', 'gaps', 'verdict'
]);
const NOT_APPLICABLE_DECISION_FIELDS = Object.freeze([
  'decision_id', 'requirement_id', 'dimension', 'status', 'approved',
  'approved_by', 'approved_at', 'approval_source', 'reason'
]);
const NORMATIVE_SNAPSHOT_FIELDS = Object.freeze([
  'contract_id', 'requirement_revision', 'approved_spec_path', 'approved_spec_hash',
  'requirements', 'requirement_ids', 'requirement_field_hashes',
  'requirement_source_hashes', 'retired_requirement_ids'
]);
const NORMATIVE_REQUIREMENT_FIELDS = Object.freeze([
  'id', 'text', 'title', 'description', 'priority', 'approval', 'scope',
  'behavior_key', 'expected', 'required', 'requirement_status', 'uat_required',
  'source_ref', 'source_hash', 'implementation_approval', 'verification_approval',
  'uat_approval', 'owner', 'tags', 'scenario_ids', 'acceptance_criteria'
]);
const PRODUCT_GAP_FIELDS = Object.freeze([
  'type', 'path', 'blocking', 'required_action', 'requirement_id',
  'observed_paths', 'reason', 'details', 'source_ref', 'evidence_ids'
]);
const PRODUCT_ACTION_LIFECYCLE_FIELDS = Object.freeze([
  'sequence_id', 'step_id', 'step_ordinal', 'predecessor_context_digest',
  'required_checkpoint'
]);

function requiresProductAuthorization(context) {
  if (!isPlainObject(context)) return false;
  const persistedWriteFields = [
    'planned_writes', 'planned_paths', 'actual_writes', 'actual_paths', 'deleted_paths'
  ];
  return context.product_action === 'audit-readonly'
    || ['READY', 'READY_WITH_WARNINGS'].includes(context.verdict)
    || context.write_authorized === true
    || persistedWriteFields.some((field) => Array.isArray(context[field]) && context[field].length > 0);
}

function requiresBoundedWriteExecution(context) {
  if (!isPlainObject(context) || context.write_authorized !== true) return false;
  const list = (value) => Array.isArray(value) ? value : [];
  const planned = [...list(context.planned_writes), ...list(context.planned_paths)];
  const observed = [
    ...list(context.actual_writes), ...list(context.actual_paths),
    ...list(context.deleted_paths)
  ];
  return planned.length > 0 && observed.length === 0;
}

function requiresProductDecisionAuthority(context) {
  return Array.isArray(context?.rows) && context.rows.some((row) => isPlainObject(row) && (
    row.implementation_status === 'not_applicable'
    || row.verification_status === 'not_applicable'
  ));
}

export async function verifyApprovedSpecAuthority(input = {}) {
  const errors = [];
  let repositoryRoot;
  let context = {};
  if (!isPlainObject(input)) {
    errors.push('approved-spec authority input must be an object');
  } else {
    repositoryRoot = input.repositoryRoot;
    context = Object.hasOwn(input, 'context') ? input.context : {};
  }
  if (!isPlainObject(context)) {
    errors.push('approved-spec authority context must be a product_context object');
    context = {};
  }
  let normalizedSpecPath = null;
  let actualSpecHash = null;
  let actualSpecIntegrityHash = null;
  let metadata = {};
  let normativeRequirements = [];
  let requirementFieldHashes = {};
  let requirementSourceHashes = {};
  let resolvedRoot = null;

  if (typeof repositoryRoot !== 'string' || !path.isAbsolute(repositoryRoot)) {
    errors.push('approved-spec authority requires an absolute repositoryRoot');
  } else {
    resolvedRoot = path.resolve(repositoryRoot);
  }

  if (!isRepositoryRelativePath(context.approved_spec_path)) {
    errors.push('approved-spec authority requires a repository-relative approved_spec_path');
  } else {
    normalizedSpecPath = normalizeRelative(context.approved_spec_path);
    if (!normalizedSpecPath.startsWith('.sdcorejs/specs/') || !normalizedSpecPath.endsWith('.md')) {
      errors.push('approved-spec authority path must identify an immutable snapshot under .sdcorejs/specs/');
    }
  }

  if (typeof context.target?.repo_root !== 'string' || !path.isAbsolute(context.target.repo_root)) {
    errors.push('approved-spec authority requires an absolute product_context target.repo_root');
  } else if (resolvedRoot && !absolutePathsEqual(context.target.repo_root, resolvedRoot)) {
    errors.push('approved-spec authority repositoryRoot does not match product_context target.repo_root');
  }

  if (resolvedRoot && normalizedSpecPath && errors.length === 0) {
    const absoluteSpecPath = path.resolve(resolvedRoot, ...normalizedSpecPath.split('/'));
    try {
      await assertNoLinkedPathSegments(resolvedRoot, normalizedSpecPath, 'approved-spec authority snapshot');
      const [realRoot, specStat, realSpecPath] = await Promise.all([
        realpath(resolvedRoot),
        lstat(absoluteSpecPath),
        realpath(absoluteSpecPath)
      ]);
      if (specStat.isSymbolicLink()) errors.push('approved-spec authority snapshot must not be a symbolic link');
      if (!specStat.isFile()) errors.push('approved-spec authority snapshot must be a regular file');
      if (!absolutePathIsWithin(realRoot, realSpecPath)) errors.push('approved-spec authority snapshot escapes repositoryRoot');

      if (errors.length === 0) {
        const bytes = await readFile(realSpecPath);
        const parsed = parseApprovedSpecDocument(bytes);
        errors.push(...parsed.errors);
        metadata = parsed.metadata;
        if (parsed.body !== null) {
          try {
            actualSpecHash = hashApprovedSnapshot(bytes.toString('utf8'), 'approved_spec_hash');
            actualSpecIntegrityHash = hashApprovedSnapshotIntegrity(bytes.toString('utf8'), 'approved_spec_integrity_hash');
            const projection = deriveApprovedRequirementProjection(
              parsed.body,
              Array.isArray(metadata.requirement_ids) ? metadata.requirement_ids : [],
              normalizedSpecPath
            );
            errors.push(...projection.errors);
            normativeRequirements = projection.requirements;
            requirementFieldHashes = projection.requirement_field_hashes;
            requirementSourceHashes = projection.requirement_source_hashes;
          } catch (error) {
            errors.push(`approved spec canonical authority hash failed: ${error.message}`);
          }
        }
      }
    } catch (error) {
      const detail = error?.code === 'ENOENT' ? 'snapshot is missing or not found' : error?.message ?? String(error);
      errors.push(`approved-spec authority could not read snapshot: ${detail}`);
    }
  }

  if (actualSpecHash !== null) {
    validateApprovedSpecMetadata(metadata, context, normalizedSpecPath, actualSpecHash, actualSpecIntegrityHash, errors);
  }

  const result = Object.freeze({
    verified: errors.length === 0,
    errors: Object.freeze(uniqueSorted(errors)),
    repository_root: resolvedRoot,
    contract_id: metadata.contract_id ?? null,
    feature_id: metadata.feature_id ?? null,
    requirement_revision: metadata.requirement_revision ?? null,
    requirement_ids: Object.freeze(Array.isArray(metadata.requirement_ids) ? [...metadata.requirement_ids] : []),
    approved_spec_path: normalizedSpecPath,
    approved_spec_hash: actualSpecHash,
    approved_spec_integrity_hash: actualSpecIntegrityHash,
    requirements: Object.freeze(normativeRequirements.map((requirement) => Object.freeze({ ...requirement }))),
    requirement_field_hashes: Object.freeze({ ...requirementFieldHashes }),
    requirement_source_hashes: Object.freeze({ ...requirementSourceHashes }),
    approval: Object.freeze({
      approved_by: metadata.approvedBy ?? null,
      approved_at: metadata.approvedAt ?? null,
      approval_source: metadata.approval_source ?? null
    })
  });
  if (result.verified) TRUSTED_APPROVED_SPEC_AUTHORITIES.add(result);
  return result;
}

async function verifyApprovedPlanAuthority({ repositoryRoot, context, currentState, specAuthority }) {
  const errors = [];
  const resolvedRoot = typeof repositoryRoot === 'string' && path.isAbsolute(repositoryRoot)
    ? path.resolve(repositoryRoot)
    : null;
  if (resolvedRoot === null) errors.push('approved-plan authority requires an absolute repositoryRoot');

  let normalizedPlanPath = null;
  let normalizedSpecPath = null;
  for (const [field, requiredRoot] of [
    ['approved_plan_path', '.sdcorejs/plans/'],
    ['approved_spec_path', '.sdcorejs/specs/']
  ]) {
    const value = context?.[field];
    if (!isRepositoryRelativePath(value)) {
      errors.push(`approved-plan authority requires a repository-relative ${field}`);
      continue;
    }
    const normalized = normalizeRelative(value);
    if (!normalized.startsWith(requiredRoot) || !normalized.endsWith('.md')) {
      errors.push(`approved-plan authority ${field} must identify an immutable Markdown snapshot under ${requiredRoot}`);
      continue;
    }
    if (field === 'approved_plan_path') normalizedPlanPath = normalized;
    else normalizedSpecPath = normalized;
  }

  if (!isPlainObject(specAuthority) || specAuthority.verified !== true) {
    errors.push('approved-plan authority requires the freshly verified approved-spec authority');
  }
  if (resolvedRoot !== null && !absolutePathsEqual(resolvedRoot, context?.target?.repo_root)) {
    errors.push('approved-plan authority repositoryRoot does not match product_context target.repo_root');
  }

  let planText = null;
  let specText = null;
  let actualPlanHash = null;
  let actualPlanIntegrityHash = null;
  let actualSpecHash = null;
  let actualSpecIntegrityHash = null;
  let planContext = null;
  let productActionAuthority = null;
  let writeScope = null;
  if (resolvedRoot !== null && normalizedPlanPath !== null && normalizedSpecPath !== null && errors.length === 0) {
    try {
      const realRoot = await realpath(resolvedRoot);
      const [planBytes, specBytes] = await Promise.all([
        readApprovedSnapshotFile(resolvedRoot, realRoot, normalizedPlanPath, 'approved plan'),
        readApprovedSnapshotFile(resolvedRoot, realRoot, normalizedSpecPath, 'approved plan source spec')
      ]);
      planText = planBytes.toString('utf8');
      specText = specBytes.toString('utf8');
      actualPlanHash = hashApprovedSnapshot(planText, 'approved_plan_hash');
      actualPlanIntegrityHash = hashApprovedSnapshotIntegrity(planText, 'approved_plan_integrity_hash');
      actualSpecHash = hashApprovedSnapshot(specText, 'approved_spec_hash');
      actualSpecIntegrityHash = hashApprovedSnapshotIntegrity(specText, 'approved_spec_integrity_hash');

      const parsedPlan = parseApprovedPlanContext(planText, { planPath: normalizedPlanPath });
      errors.push(...parsedPlan.errors);
      if (parsedPlan.verified) {
        planContext = {
          ...parsedPlan.plan_context,
          approved_plan_integrity_hash: actualPlanIntegrityHash
        };
        productActionAuthority = parsedPlan.normalized_product_action_authority;
        errors.push(...validateApprovedPlanIntegrity({
          planText,
          specText,
          planPath: normalizedPlanPath,
          specPath: normalizedSpecPath,
          planContext
        }));
      }
    } catch (error) {
      const detail = error?.code === 'ENOENT' ? 'snapshot is missing or not found' : error?.message ?? String(error);
      errors.push(`approved-plan authority could not read or validate snapshot chain: ${detail}`);
    }
  }

  if (actualPlanHash !== null) {
    for (const [label, value] of [
      ['product_context approved_plan_hash', context.approved_plan_hash],
      ['current state approved_plan_hash', currentState.approved_plan_hash]
    ]) {
      if (value !== actualPlanHash) errors.push(`${label} does not match the file-backed approved plan hash`);
    }
    for (const [label, value] of [
      ['product_context approved_plan_integrity_hash', context.approved_plan_integrity_hash],
      ['current state approved_plan_integrity_hash', currentState.approved_plan_integrity_hash]
    ]) {
      if (value !== actualPlanIntegrityHash) errors.push(`${label} does not match the file-backed approved plan integrity hash`);
    }
  }
  if (normalizedPlanPath !== null) {
    for (const [label, value] of [
      ['product_context approved_plan_path', context.approved_plan_path],
      ['current state approved_plan_path', currentState.approved_plan_path]
    ]) {
      let normalized = null;
      try { normalized = normalizeRelative(value); } catch { /* reported below */ }
      if (normalized !== normalizedPlanPath) errors.push(`${label} does not match the loaded approved plan path`);
    }
  }

  if (actualSpecHash !== null) {
    for (const [label, value] of [
      ['fresh approved-spec authority hash', specAuthority.approved_spec_hash],
      ['product_context approved_spec_hash', context.approved_spec_hash],
      ['current state approved_spec_hash', currentState.approved_spec_hash]
    ]) {
      if (value !== actualSpecHash) errors.push(`${label} does not match the approved plan source-spec hash`);
    }
    for (const [label, value] of [
      ['fresh approved-spec authority integrity hash', specAuthority.approved_spec_integrity_hash],
      ['product_context approved_spec_integrity_hash', context.approved_spec_integrity_hash],
      ['current state approved_spec_integrity_hash', currentState.approved_spec_integrity_hash]
    ]) {
      if (value !== actualSpecIntegrityHash) errors.push(`${label} does not match the approved plan source-spec integrity hash`);
    }
  }

  if (planContext !== null) {
    for (const [field, expected] of [
      ['contract_id', context.contract_id],
      ['feature_id', context.feature_id],
      ['requirement_revision', context.requirement_revision],
      ['target_root_kind', context.target?.target_root_kind],
      ['track', context.target?.track],
      ['stack_profile', context.target?.stack_profile]
    ]) {
      if (planContext[field] !== expected) errors.push(`approved plan ${field} does not match product_context`);
    }
    errors.push(...validateProductActionLifecycle(
      context.product_action_lifecycle,
      productActionAuthority,
      context.product_action
    ));
    if (!sameStringSet(planContext.requirement_ids, context.requirement_ids)) {
      errors.push('approved plan requirement_ids do not match product_context');
    }
    writeScope = validateApprovedPlanWriteScope({
      repositoryRoot: resolvedRoot,
      planTargetRoot: planContext.target_root,
      contextTargetRoot: context.target?.target_root,
      planAllowedPaths: planContext.allowed_paths,
      planProhibitedPaths: planContext.prohibited_paths,
      contextAllowedPaths: context.allowed_paths,
      contextProhibitedPaths: context.prohibited_paths,
      plannedWrites: context.planned_writes,
      actualWrites: context.actual_writes,
      deletedPaths: context.deleted_paths
    });
    errors.push(...writeScope.errors);
  }

  const result = Object.freeze({
    verified: errors.length === 0,
    errors: Object.freeze(uniqueSorted(errors)),
    repository_root: resolvedRoot,
    approved_plan_path: normalizedPlanPath,
    approved_plan_hash: actualPlanHash,
    approved_plan_integrity_hash: actualPlanIntegrityHash,
    approved_spec_path: normalizedSpecPath,
    approved_spec_hash: actualSpecHash,
    approved_spec_integrity_hash: actualSpecIntegrityHash,
    product_action_authority: productActionAuthority === null
      ? null
      : Object.freeze(structuredClone(productActionAuthority)),
    approved_plan_allowed_paths: Object.freeze([...(writeScope?.allowed_paths ?? [])]),
    approved_plan_prohibited_paths: Object.freeze([...(writeScope?.prohibited_paths ?? [])]),
    write_scope: writeScope
  });
  return result;
}

async function readApprovedSnapshotFile(repositoryRoot, realRoot, relativePath, label) {
  await assertNoLinkedPathSegments(repositoryRoot, relativePath, `${label} snapshot`);
  const absolutePath = path.resolve(repositoryRoot, ...relativePath.split('/'));
  const [stat, realPath] = await Promise.all([lstat(absolutePath), realpath(absolutePath)]);
  if (stat.isSymbolicLink()) throw new Error(`${label} snapshot must not be a symbolic link`);
  if (!stat.isFile()) throw new Error(`${label} snapshot must be a regular file`);
  if (!absolutePathIsWithin(realRoot, realPath)) throw new Error(`${label} snapshot escapes repositoryRoot`);
  return readFile(realPath);
}

export function computeRelevantPathsHash(relevantPaths, relevantPathHashes) {
  const validation = validateRelevantPathManifest({
    relevant_paths: relevantPaths,
    relevant_path_hashes: relevantPathHashes,
    relevant_paths_hash: null
  }, { requireAggregate: false });
  if (validation.errors.length > 0) throw new Error(validation.errors.join('; '));
  return digest(stableStringify(validation.paths.map((relativePath) => [relativePath, validation.hashes[relativePath]])));
}

export async function observeRelevantPathState(input = {}) {
  const errors = [];
  let repositoryRoot;
  let relevantPaths;
  let uatScenarioRefs = [];
  let observeBuildIdentity;
  if (!isPlainObject(input)) {
    errors.push('relevant-path observation input must be an object');
  } else {
    repositoryRoot = input.repositoryRoot;
    relevantPaths = input.relevantPaths;
    uatScenarioRefs = input.uatScenarioRefs ?? [];
    observeBuildIdentity = input.observeBuildIdentity;
  }
  const normalizedPaths = [];
  const normalizedScenarioRefs = [];
  let resolvedRoot = null;
  if (typeof repositoryRoot !== 'string' || !path.isAbsolute(repositoryRoot)) {
    errors.push('relevant-path observation requires an absolute repositoryRoot');
  } else {
    resolvedRoot = path.resolve(repositoryRoot);
  }
  if (!Array.isArray(relevantPaths) || relevantPaths.length === 0) {
    errors.push('relevant-path observation requires a non-empty relevantPaths array');
  } else {
    for (const candidate of relevantPaths) {
      try { normalizedPaths.push(normalizeRelative(candidate)); }
      catch (error) { errors.push(`relevant-path observation contains an invalid path: ${error.message}`); }
    }
    if (new Set(normalizedPaths).size !== normalizedPaths.length) errors.push('relevant-path observation contains duplicate normalized paths');
  }

  if (!Array.isArray(uatScenarioRefs)) {
    errors.push('UAT scenario observation requires uatScenarioRefs to be an array');
  } else {
    for (const candidate of uatScenarioRefs) {
      try { normalizedScenarioRefs.push(normalizeUatScenarioRef(candidate)); }
      catch (error) { errors.push(`UAT scenario observation contains an invalid source ref: ${error.message}`); }
    }
    if (new Set(normalizedScenarioRefs).size !== normalizedScenarioRefs.length) errors.push('UAT scenario observation contains duplicate canonical source refs');
  }
  if (observeBuildIdentity !== undefined && typeof observeBuildIdentity !== 'function') {
    errors.push('UAT build identity observer must be an async callback function');
  }
  if (normalizedScenarioRefs.length > 0 && typeof observeBuildIdentity !== 'function') {
    errors.push('UAT scenario observation requires a parent-owned build identity observer callback');
  }

  let uatBuildOrRevision = null;
  if (resolvedRoot && errors.length === 0 && normalizedScenarioRefs.length > 0) {
    try {
      const observed = await observeBuildIdentity(Object.freeze({
        repository_root: resolvedRoot,
        uat_scenario_refs: Object.freeze([...normalizedScenarioRefs].sort())
      }));
      if (typeof observed !== 'string' || observed.trim() === '' || /[\r\n]/.test(observed)) {
        throw new Error('parent-owned build identity observer must return a non-empty single-line string');
      }
      uatBuildOrRevision = observed;
    } catch (error) {
      errors.push(`UAT build identity observation failed: ${error?.message ?? String(error)}`);
    }
  }

  // Hash repository state only after the parent callback has completed. No
  // external observer wait is allowed between these hashes and token issuance.
  const hashes = {};
  const uatScenarioHashes = {};
  if (resolvedRoot && errors.length === 0) {
    try {
      const realRoot = await realpath(resolvedRoot);
      for (const relativePath of [...normalizedPaths].sort()) {
        hashes[relativePath] = await hashObservedRepositoryFile(resolvedRoot, realRoot, relativePath, 'relevant-path observation');
      }
    } catch (error) {
      const detail = error?.code === 'ENOENT' ? 'a relevant path is missing or not found' : error?.message ?? String(error);
      errors.push(`relevant-path observation failed: ${detail}`);
    }
  }

  if (resolvedRoot && errors.length === 0 && normalizedScenarioRefs.length > 0) {
    try {
      const realRoot = await realpath(resolvedRoot);
      for (const scenarioRef of [...normalizedScenarioRefs].sort()) {
        const scenarioPath = scenarioRef.slice(0, scenarioRef.indexOf('#'));
        uatScenarioHashes[scenarioRef] = await hashObservedRepositoryFile(resolvedRoot, realRoot, scenarioPath, 'UAT scenario observation');
      }
    } catch (error) {
      const detail = error?.code === 'ENOENT' ? 'a UAT scenario source is missing or not found' : error?.message ?? String(error);
      errors.push(`UAT scenario observation failed: ${detail}`);
    }
  }

  const sortedPaths = [...normalizedPaths].sort();
  const sortedScenarioRefs = [...normalizedScenarioRefs].sort();
  const aggregate = errors.length === 0 ? computeRelevantPathsHash(sortedPaths, hashes) : null;
  const uatStateHash = errors.length === 0
    ? digest(stableStringify({
      uat_scenario_hashes: Object.fromEntries(sortedScenarioRefs.map((ref) => [ref, uatScenarioHashes[ref]])),
      uat_build_or_revision: uatBuildOrRevision
    }))
    : null;
  const result = Object.freeze({
    verified: errors.length === 0,
    errors: Object.freeze(uniqueSorted(errors)),
    repository_root: resolvedRoot,
    relevant_paths: Object.freeze(sortedPaths),
    relevant_path_hashes: Object.freeze({ ...hashes }),
    relevant_paths_hash: aggregate,
    uat_scenario_hashes: Object.freeze(Object.fromEntries(sortedScenarioRefs.map((ref) => [ref, uatScenarioHashes[ref]]))),
    uat_build_or_revision: uatBuildOrRevision,
    uat_state_hash: uatStateHash
  });
  if (result.verified) TRUSTED_RELEVANT_PATH_STATES.add(result);
  return result;
}

export async function observeAuditReadonlyState(input = {}) {
  const errors = [];
  if (!isPlainObject(input)) {
    return Object.freeze({
      verified: false,
      errors: Object.freeze(['audit-readonly zero-write observation input must be an object'])
    });
  }
  const { repositoryRoot, request, observeStatus, executeAudit } = input;
  const resolvedRoot = typeof repositoryRoot === 'string' && path.isAbsolute(repositoryRoot)
    ? path.resolve(repositoryRoot)
    : null;
  if (resolvedRoot === null) errors.push('audit-readonly zero-write observation requires an absolute repositoryRoot');
  if (!isPlainObject(request)) errors.push('audit-readonly zero-write observation requires a request object');
  if (typeof observeStatus !== 'function') errors.push('audit-readonly zero-write observation requires a parent-owned async status observer');
  if (typeof executeAudit !== 'function') errors.push('audit-readonly zero-write observation requires a parent-owned audit executor to bracket the exact audit');
  if (isPlainObject(request) && (request.action ?? request.product_action) !== 'audit-readonly') {
    errors.push('audit-readonly zero-write observation request must target audit-readonly');
  }

  const requestDigest = isPlainObject(request) ? digest(stableStringify(request)) : null;
  const observed = {};
  const observePhase = async (phase) => {
    try {
      const value = await observeStatus({
        phase,
        repository_root: resolvedRoot,
        request_digest: requestDigest
      });
      const statusDigest = typeof value === 'string' ? value : value?.status_digest;
      if (!SHA256_PATTERN.test(String(statusDigest ?? ''))) {
        errors.push(`audit-readonly ${phase} parent-observed status digest must be SHA-256`);
        return;
      }
      if (isPlainObject(value)) {
        rejectUnknownFields(value, ['status_digest', 'repository_root', 'request_digest'], `audit-readonly ${phase} status observation`, errors);
        if (value.repository_root !== undefined && !absolutePathsEqual(value.repository_root, resolvedRoot)) {
          errors.push(`audit-readonly ${phase} status observation repository binding does not match`);
        }
        if (value.request_digest !== undefined && value.request_digest !== requestDigest) {
          errors.push(`audit-readonly ${phase} status observation request binding does not match`);
        }
      }
      observed[phase] = statusDigest;
    } catch (error) {
      errors.push(`audit-readonly ${phase} parent status observer failed: ${error?.message ?? String(error)}`);
    }
  };
  if (errors.length === 0) {
    await observePhase('before');
    if (observed.before) {
      try {
        const execution = await executeAudit(Object.freeze({
          repository_root: resolvedRoot,
          request_digest: requestDigest
        }));
        if (!isPlainObject(execution)) {
          errors.push('audit-readonly parent audit executor must return an object');
        } else {
          rejectUnknownFields(execution, ['completed', 'request_digest'], 'audit-readonly parent audit execution', errors);
          if (execution.completed !== true) errors.push('audit-readonly parent audit executor must confirm completed: true');
          if (execution.request_digest !== requestDigest) errors.push('audit-readonly parent audit executor request binding does not match');
        }
      } catch (error) {
        errors.push(`audit-readonly parent audit executor failed: ${error?.message ?? String(error)}`);
      }
    }
    await observePhase('after');
  }

  if (observed.before && observed.after && observed.before !== observed.after) {
    errors.push('audit-readonly parent-observed repository state changed between before and after observations');
  }
  if (isPlainObject(request)) {
    if (!SHA256_PATTERN.test(String(request.before_status_digest ?? '')) || !SHA256_PATTERN.test(String(request.after_status_digest ?? ''))) {
      errors.push('audit-readonly request before/after status digests must be SHA-256');
    } else {
      if (request.before_status_digest !== observed.before) errors.push('audit-readonly request before status digest does not match the parent observation');
      if (request.after_status_digest !== observed.after) errors.push('audit-readonly request after status digest does not match the parent observation');
    }
  }

  const result = Object.freeze({
    verified: errors.length === 0,
    errors: Object.freeze(uniqueSorted(errors)),
    repository_root: resolvedRoot,
    request_digest: requestDigest,
    before_status_digest: observed.before ?? null,
    after_status_digest: observed.after ?? null
  });
  if (result.verified) TRUSTED_AUDIT_READONLY_STATES.add(result);
  return result;
}

export async function observeProductLayoutState(input = {}) {
  const errors = [];
  if (!isPlainObject(input)) {
    return Object.freeze({
      verified: false,
      errors: Object.freeze(['product layout observation input must be an object']),
      active_candidates: Object.freeze([]),
      content_hashes: Object.freeze({})
    });
  }
  const resolvedRoot = typeof input.repositoryRoot === 'string' && path.isAbsolute(input.repositoryRoot)
    ? path.resolve(input.repositoryRoot)
    : null;
  if (resolvedRoot === null) errors.push('product layout observation requires an absolute repositoryRoot');
  if (isMissing(input.contractId)) errors.push('product layout observation requires contractId');
  if (isMissing(input.featureId)) errors.push('product layout observation requires featureId');

  const candidates = [];
  const contentHashes = {};
  if (resolvedRoot !== null && errors.length === 0) {
    const ledgerRoot = path.join(resolvedRoot, '.sdcorejs', 'docs', 'product');
    let files = [];
    try {
      files = await collectCurrentLedgerFiles(ledgerRoot, errors);
    } catch (error) {
      if (error?.code !== 'ENOENT') errors.push(`product layout observation failed to enumerate ledgers: ${error?.message ?? String(error)}`);
    }
    for (const absoluteFile of files) {
      const relativePath = normalizeRelative(path.relative(resolvedRoot, absoluteFile));
      try {
        await assertNoLinkedPathSegments(resolvedRoot, relativePath, 'product layout current ledger');
        const [fileStat, realRoot, realFile, bytes] = await Promise.all([
          lstat(absoluteFile),
          realpath(resolvedRoot),
          realpath(absoluteFile),
          readFile(absoluteFile)
        ]);
        if (!fileStat.isFile() || fileStat.isSymbolicLink()) {
          errors.push(`product layout current ledger must be a regular non-linked file: ${relativePath}`);
          continue;
        }
        if (!absolutePathIsWithin(realRoot, realFile)) {
          errors.push(`product layout current ledger escapes repositoryRoot: ${relativePath}`);
          continue;
        }
        const identity = parseProductLedgerIdentity(bytes.toString('utf8'));
        if (identity.contract_id === input.contractId && identity.feature_id === input.featureId) {
          candidates.push(relativePath);
          contentHashes[relativePath] = digest(bytes);
        }
      } catch (error) {
        errors.push(`product layout observation could not read ${relativePath}: ${error?.message ?? String(error)}`);
      }
    }
  }

  const activeCandidates = uniqueSorted(candidates);
  const result = Object.freeze({
    verified: errors.length === 0,
    errors: Object.freeze(uniqueSorted(errors)),
    repository_root: resolvedRoot,
    contract_id: input.contractId ?? null,
    feature_id: input.featureId ?? null,
    active_candidates: Object.freeze(activeCandidates),
    content_hashes: Object.freeze(Object.fromEntries(activeCandidates.map((candidate) => [candidate, contentHashes[candidate]])))
  });
  if (result.verified) TRUSTED_PRODUCT_LAYOUT_STATES.add(result);
  return result;
}

async function collectCurrentLedgerFiles(root, errors) {
  const files = [];
  const entries = await readdir(root, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(root, entry.name);
    if (entry.isSymbolicLink()) {
      errors.push(`product layout observation forbids linked ledger entries: ${absolutePath}`);
    } else if (entry.isDirectory()) {
      files.push(...await collectCurrentLedgerFiles(absolutePath, errors));
    } else if (entry.isFile() && entry.name.toLowerCase() === 'current.md') {
      files.push(absolutePath);
    }
  }
  return files;
}

export async function observeProductDecisionAuthority(input = {}) {
  const errors = [];
  if (!isPlainObject(input)) {
    return Object.freeze({
      verified: false,
      errors: Object.freeze(['product decision authority input must be an object'])
    });
  }
  const { repositoryRoot, context, currentState, observeDecisionSet } = input;
  const resolvedRoot = typeof repositoryRoot === 'string' && path.isAbsolute(repositoryRoot)
    ? path.resolve(repositoryRoot)
    : null;
  if (resolvedRoot === null) errors.push('product decision authority requires an absolute repositoryRoot');
  if (!isPlainObject(context)) errors.push('product decision authority requires a product_context object');
  if (!isPlainObject(currentState)) errors.push('product decision authority requires a currentState object');
  if (typeof observeDecisionSet !== 'function') {
    errors.push('product decision authority requires a parent-owned async decision observer');
  }
  if (resolvedRoot !== null && isPlainObject(context)
    && !absolutePathsEqual(resolvedRoot, context.target?.repo_root)) {
    errors.push('product decision authority repositoryRoot does not match product_context target.repo_root');
  }

  const decisions = isPlainObject(context) ? collectProductDecisionSet(context) : [];
  if (decisions.length === 0) errors.push('product decision authority requires at least one canonical decision');
  if (isPlainObject(context)) {
    for (const row of Array.isArray(context.rows) ? context.rows.filter(isPlainObject) : []) {
      if (row.implementation_status === 'not_applicable') {
        errors.push(...validateNotApplicableDecision(row.implementation_approval, {
          requirementId: row.requirement_id,
          dimension: 'implementation'
        }).map((error) => `product decision authority ${error}`));
      }
      if (row.verification_status === 'not_applicable') {
        errors.push(...validateNotApplicableDecision(row.verification_approval, {
          requirementId: row.requirement_id,
          dimension: 'verification'
        }).map((error) => `product decision authority ${error}`));
      }
    }
  }
  if (!SHA256_PATTERN.test(String(currentState?.post_integration_state_digest ?? ''))) {
    errors.push('product decision authority requires currentState.post_integration_state_digest SHA-256');
  }

  const decisionSetDigest = digest(stableStringify(decisions));
  const finalContextDigest = isPlainObject(context) ? digest(stableStringify(context)) : null;
  const readinessClaimDigest = isPlainObject(context)
    ? digest(stableStringify({
        rows: context.rows ?? [],
        readiness_policy: context.readiness_policy ?? {},
        verdict: context.verdict ?? null
      }))
    : null;
  const allowedWriteSetDigest = isPlainObject(context)
    ? digest(stableStringify({
        allowed_paths: context.allowed_paths ?? [],
        prohibited_paths: context.prohibited_paths ?? [],
        planned_writes: context.planned_writes ?? [],
        actual_writes: context.actual_writes ?? [],
        deleted_paths: context.deleted_paths ?? []
      }))
    : null;
  const requestBase = {
    repository_root: resolvedRoot,
    contract_id: context?.contract_id ?? null,
    feature_id: context?.feature_id ?? null,
    requirement_revision: context?.requirement_revision ?? null,
    approved_spec_path: context?.approved_spec_path ?? null,
    approved_spec_hash: context?.approved_spec_hash ?? null,
    approved_spec_integrity_hash: context?.approved_spec_integrity_hash ?? null,
    approved_plan_path: context?.approved_plan_path ?? null,
    approved_plan_hash: context?.approved_plan_hash ?? null,
    approved_plan_integrity_hash: context?.approved_plan_integrity_hash ?? null,
    product_action: context?.product_action ?? null,
    lifecycle: isPlainObject(context?.product_action_lifecycle)
      ? structuredClone(context.product_action_lifecycle)
      : null,
    decisions: structuredClone(decisions),
    decision_set_digest: decisionSetDigest,
    readiness_claim_digest: readinessClaimDigest,
    final_context_digest: finalContextDigest,
    post_integration_state_digest: currentState?.post_integration_state_digest ?? null,
    allowed_write_set_digest: allowedWriteSetDigest
  };
  const request = Object.freeze({
    ...requestBase,
    request_digest: digest(stableStringify(requestBase))
  });

  let observed = null;
  if (errors.length === 0) {
    try {
      observed = await observeDecisionSet(request);
    } catch (error) {
      errors.push(`product decision observation failed: ${error?.message ?? String(error)}`);
    }
  }
  if (observed !== null) {
    if (!isPlainObject(observed)) {
      errors.push('product decision observer must return an object');
    } else {
      rejectUnknownFields(
        observed,
        [
          'request_digest', 'decision_set_digest', 'final_context_digest',
          'post_integration_state_digest', 'observed_decisions'
        ],
        'product decision observation',
        errors
      );
      if (observed.request_digest !== request.request_digest) {
        errors.push('product decision observation request digest does not match');
      }
      if (observed.decision_set_digest !== decisionSetDigest) {
        errors.push('product decision observation decision-set digest does not match');
      }
      if (observed.final_context_digest !== finalContextDigest) {
        errors.push('product decision observation final-context digest does not match');
      }
      if (observed.post_integration_state_digest !== currentState.post_integration_state_digest) {
        errors.push('product decision observation post-integration state digest does not match');
      }
      if (stableStringify(observed.observed_decisions) !== stableStringify(decisions)) {
        errors.push('product decision observation does not match the canonical decision set');
      }
    }
  }

  const result = Object.freeze({
    verified: errors.length === 0,
    errors: Object.freeze(uniqueSorted(errors)),
    repository_root: resolvedRoot,
    request_digest: request.request_digest,
    decision_set_digest: decisionSetDigest,
    readiness_claim_digest: readinessClaimDigest,
    final_context_digest: finalContextDigest,
    post_integration_state_digest: currentState?.post_integration_state_digest ?? null,
    allowed_write_set_digest: allowedWriteSetDigest
  });
  if (result.verified) TRUSTED_PRODUCT_DECISION_AUTHORITIES.add(result);
  return result;
}

function parseProductLedgerIdentity(text) {
  const readScalar = (field) => {
    const match = new RegExp(`^\\s*${field}\\s*:\\s*(.+?)\\s*$`, 'mi').exec(text);
    return match ? decodeFrontmatterScalar(match[1]) : null;
  };
  return {
    contract_id: readScalar('contract_id'),
    feature_id: readScalar('feature_id')
  };
}

export async function authorizeProductContext(input = {}) {
  if (!isPlainObject(input)) {
    return Object.freeze({
      authorized: false,
      errors: Object.freeze(['final product authorization input must be an object']),
      authority: null,
      plan_authority: null,
      current_state_observation: null
    });
  }
  const {
    repositoryRoot,
    context,
    observeBuildIdentity,
    observeAutomatedEvidence,
    observeManualUat,
    observeAuditStatus,
    observeDecisionSet,
    executeAudit,
    executeWrite,
    observeWriteResult
  } = input;
  let { currentState = {} } = input;
  if (!isPlainObject(context)) {
    return Object.freeze({
      authorized: false,
      errors: Object.freeze(['final product authorization requires a product_context object']),
      authority: null,
      plan_authority: null,
      current_state_observation: null
    });
  }
  if (!isPlainObject(currentState)) {
    return Object.freeze({
      authorized: false,
      errors: Object.freeze(['final product authorization currentState must be an object']),
      authority: null,
      plan_authority: null,
      current_state_observation: null
    });
  }

  const authorizationRequired = requiresProductAuthorization(context);
  const readyClaim = ['READY', 'READY_WITH_WARNINGS'].includes(context.verdict);
  const uatScenarioRefs = collectUatScenarioRefs(context);
  const sideEffectObservation = productSideEffectObservation(context);
  let executionAttestation = null;
  if (readyClaim) {
    executionAttestation = await observeReadyExecutionAttestations({
      context,
      observeAutomatedEvidence,
      observeManualUat
    });
  }

  const buildIdentityObservation = await observeBuildIdentityBeforeFinalReads({
    repositoryRoot,
    uatScenarioRefs,
    observeBuildIdentity
  });
  const auditReadonlyObservation = context.product_action === 'audit-readonly'
    ? await observeAuditReadonlyState({
      repositoryRoot,
      request: sideEffectObservation,
      observeStatus: observeAuditStatus,
      executeAudit
    })
    : null;
  const decisionAuthorityRequired = requiresProductDecisionAuthority(context);
  const decisionAuthority = decisionAuthorityRequired
    ? await observeProductDecisionAuthority({
        repositoryRoot,
        context,
        currentState,
        observeDecisionSet
      })
    : null;

  // Parent observers may wait on external execution systems. Complete every
  // such wait before the final relevant-path, approved-spec, and approved-plan
  // reads. The callback below returns only the already captured build identity;
  // it performs no external observation between final reads and token issuance.
  let currentStateObservation = null;
  if (authorizationRequired) {
    currentStateObservation = await observeRelevantPathState({
      repositoryRoot,
      relevantPaths: currentState.relevant_paths,
      uatScenarioRefs,
      observeBuildIdentity: uatScenarioRefs.length > 0 && buildIdentityObservation.verified
        ? () => buildIdentityObservation.build_or_revision
        : undefined
    });
  }
  const layoutObservation = authorizationRequired
    ? await observeProductLayoutState({
      repositoryRoot,
      contractId: context.contract_id,
      featureId: context.feature_id
    })
    : null;
  const authority = await verifyApprovedSpecAuthority({ repositoryRoot, context });
  const planAuthority = await verifyApprovedPlanAuthority({
    repositoryRoot,
    context,
    currentState,
    specAuthority: authority
  });

  const finalAuthorization = Object.freeze({
    verified: authority.verified === true
      && planAuthority.verified === true
      && (!authorizationRequired || currentStateObservation?.verified === true)
      && (!authorizationRequired || layoutObservation?.verified === true)
      && (context.product_action !== 'audit-readonly' || auditReadonlyObservation?.verified === true)
      && (!decisionAuthorityRequired || decisionAuthority?.verified === true)
      && (!readyClaim || executionAttestation?.verified === true),
    repository_root: typeof repositoryRoot === 'string' ? path.resolve(repositoryRoot) : null,
    context_digest: digest(stableStringify(context)),
    current_state_digest: digest(stableStringify(currentState)),
    approved_spec_path: planAuthority.approved_spec_path ?? null,
    approved_spec_hash: planAuthority.approved_spec_hash ?? null,
    approved_spec_integrity_hash: planAuthority.approved_spec_integrity_hash ?? null,
    approved_plan_path: planAuthority.approved_plan_path ?? null,
    approved_plan_hash: planAuthority.approved_plan_hash ?? null,
    approved_plan_integrity_hash: planAuthority.approved_plan_integrity_hash ?? null,
    relevant_paths_hash: currentStateObservation?.relevant_paths_hash ?? null,
    uat_state_hash: currentStateObservation?.uat_state_hash ?? null,
    execution_attestation_hash: executionAttestation?.attestation_hash ?? null
  });
  if (finalAuthorization.verified) TRUSTED_FINAL_PRODUCT_AUTHORIZATIONS.add(finalAuthorization);

  const options = {
    trusted_authority: authority,
    trusted_current_state: currentStateObservation,
    trusted_layout: layoutObservation,
    trusted_audit_proof: auditReadonlyObservation,
    trusted_decision_authority: decisionAuthority,
    trusted_execution_attestations: executionAttestation,
    context,
    current_state: currentState,
    final_authorization: finalAuthorization
  };
  const preWriteExecutionRequired = requiresBoundedWriteExecution(context);
  let errors = uniqueSorted([
    ...(buildIdentityObservation.errors ?? []),
    ...(authority.errors ?? []),
    ...(planAuthority.errors ?? []),
    ...(currentStateObservation?.errors ?? []),
    ...(layoutObservation?.errors ?? []),
    ...(auditReadonlyObservation?.errors ?? []),
    ...(decisionAuthority?.errors ?? []),
    ...(executionAttestation?.errors ?? []),
    ...validateProductContext(context, currentState, options)
  ]);
  if (preWriteExecutionRequired && typeof executeWrite !== 'function') {
    errors = uniqueSorted([
      ...errors,
      'pre-write authorization requires a parent-owned bounded write executor so mutation occurs inside the authorization gate'
    ]);
  }
  if (preWriteExecutionRequired && typeof observeWriteResult !== 'function') {
    errors = uniqueSorted([
      ...errors,
      'pre-write authorization requires a parent-owned post-write result observer for the bounded mutation'
    ]);
  }

  let writeExecuted = false;
  let writeObservation = null;
  if (errors.length === 0 && preWriteExecutionRequired) {
    TRUSTED_FINAL_PRODUCT_AUTHORIZATIONS.delete(finalAuthorization);
    const baseWriteRequest = Object.freeze({
      repository_root: path.resolve(repositoryRoot),
      context_digest: finalAuthorization.context_digest,
      current_state_digest: finalAuthorization.current_state_digest,
      planned_writes: Object.freeze(normalizePaths(sideEffectObservation.planned_paths))
    });
    const writeRequest = Object.freeze({
      ...baseWriteRequest,
      request_digest: digest(stableStringify(baseWriteRequest))
    });
    const boundedWriteErrors = [];
    let execution = null;
    try {
      execution = await executeWrite(writeRequest);
    } catch (error) {
      boundedWriteErrors.push(`bounded write executor failed: ${error?.message ?? String(error)}`);
    }
    const executionValidation = validateBoundedWriteExecutionReceipt(execution, writeRequest);
    boundedWriteErrors.push(...executionValidation.errors);

    if (boundedWriteErrors.length === 0) {
      const executionReceiptDigest = digest(stableStringify(execution));
      const observationRequest = Object.freeze({
        repository_root: writeRequest.repository_root,
        context_digest: writeRequest.context_digest,
        current_state_digest: writeRequest.current_state_digest,
        planned_writes: writeRequest.planned_writes,
        request_digest: writeRequest.request_digest,
        execution_receipt_digest: executionReceiptDigest
      });
      let observed = null;
      try {
        observed = await observeWriteResult(observationRequest);
      } catch (error) {
        boundedWriteErrors.push(`bounded write result observer failed: ${error?.message ?? String(error)}`);
      }
      const observationValidation = validateBoundedWriteObservation({
        observed,
        execution,
        writeRequest,
        executionReceiptDigest
      });
      boundedWriteErrors.push(...observationValidation.errors);
      if (observationValidation.observation) {
        writeObservation = Object.freeze({
          ...observationValidation.observation,
          actual_writes: Object.freeze([...observationValidation.observation.actual_writes]),
          deleted_paths: Object.freeze([...observationValidation.observation.deleted_paths])
        });
      }
    }
    errors = uniqueSorted([...errors, ...boundedWriteErrors]);
    writeExecuted = boundedWriteErrors.length === 0;
  }
  if (executionAttestation) TRUSTED_EXECUTION_ATTESTATIONS.delete(executionAttestation);
  if (auditReadonlyObservation) TRUSTED_AUDIT_READONLY_STATES.delete(auditReadonlyObservation);
  if (decisionAuthority) TRUSTED_PRODUCT_DECISION_AUTHORITIES.delete(decisionAuthority);
  TRUSTED_FINAL_PRODUCT_AUTHORIZATIONS.delete(finalAuthorization);
  return Object.freeze({
    authorized: errors.length === 0,
    write_executed: writeExecuted,
    errors: Object.freeze([...errors]),
    authority,
    plan_authority: planAuthority,
    current_state_observation: currentStateObservation,
    layout_observation: layoutObservation,
    audit_readonly_observation: auditReadonlyObservation,
    decision_authority: decisionAuthority,
    execution_attestation: executionAttestation,
    write_observation: writeObservation
  });
}

function validateBoundedWriteExecutionReceipt(receipt, writeRequest) {
  const errors = [];
  if (!isPlainObject(receipt)) {
    return { errors: ['bounded write executor must return an object'], actual_writes: [], deleted_paths: [] };
  }
  rejectUnknownFields(
    receipt,
    ['completed', 'request_digest', 'context_digest', 'actual_writes', 'deleted_paths', 'after_status_digest'],
    'bounded write execution',
    errors
  );
  if (receipt.completed !== true) errors.push('bounded write executor must confirm completed: true');
  if (receipt.request_digest !== writeRequest.request_digest) errors.push('bounded write executor request_digest binding does not match');
  if (receipt.context_digest !== writeRequest.context_digest) errors.push('bounded write executor context_digest binding does not match');
  if (!SHA256_PATTERN.test(String(receipt.after_status_digest ?? ''))) errors.push('bounded write executor after_status_digest must be SHA-256');
  const actualWrites = validateBoundedWritePathList(receipt.actual_writes, 'bounded write execution actual_writes', errors);
  const deletedPaths = validateBoundedWritePathList(receipt.deleted_paths, 'bounded write execution deleted_paths', errors);
  return { errors: uniqueSorted(errors), actual_writes: actualWrites, deleted_paths: deletedPaths };
}

function validateBoundedWriteObservation({ observed, execution, writeRequest, executionReceiptDigest }) {
  const errors = [];
  if (!isPlainObject(observed)) {
    return { errors: ['bounded write post-write observation must be an object'], observation: null };
  }
  rejectUnknownFields(
    observed,
    ['request_digest', 'execution_receipt_digest', 'actual_writes', 'deleted_paths', 'after_status_digest'],
    'bounded write post-write observation',
    errors
  );
  if (observed.request_digest !== writeRequest.request_digest) errors.push('bounded write post-write observation request_digest binding does not match');
  if (observed.execution_receipt_digest !== executionReceiptDigest) errors.push('bounded write post-write observation execution receipt binding does not match');
  if (!SHA256_PATTERN.test(String(observed.after_status_digest ?? ''))) errors.push('bounded write post-write observation after_status_digest must be SHA-256');
  const actualWrites = validateBoundedWritePathList(observed.actual_writes, 'bounded write post-write observation actual_writes', errors);
  const deletedPaths = validateBoundedWritePathList(observed.deleted_paths, 'bounded write post-write observation deleted_paths', errors);
  const executionActual = validateBoundedWritePathList(execution?.actual_writes, 'bounded write execution actual_writes', errors);
  const executionDeleted = validateBoundedWritePathList(execution?.deleted_paths, 'bounded write execution deleted_paths', errors);
  if (stableStringify(actualWrites) !== stableStringify(executionActual)) errors.push('bounded write observed actual_writes do not match the executor receipt');
  if (stableStringify(deletedPaths) !== stableStringify(executionDeleted)) errors.push('bounded write observed deleted_paths do not match the executor receipt');
  if (observed.after_status_digest !== execution?.after_status_digest) errors.push('bounded write observed after_status_digest does not match the executor receipt');
  if (actualWrites.length + deletedPaths.length === 0) errors.push('bounded write no-op is invalid because at least one actual or deleted path must be observed');
  const plannedWrites = normalizePaths(writeRequest.planned_writes);
  for (const observedPath of [...actualWrites, ...deletedPaths]) {
    if (!plannedWrites.some((plannedPath) => pathsEqual(plannedPath, observedPath, process.platform === 'win32'))) {
      errors.push(`bounded write observed path is outside the planned write set: ${observedPath}`);
    }
  }
  if (actualWrites.some((actualPath) => deletedPaths.some((deletedPath) => pathsEqual(actualPath, deletedPath, process.platform === 'win32')))) {
    errors.push('bounded write path cannot be both actual and deleted');
  }
  return {
    errors: uniqueSorted(errors),
    observation: {
      request_digest: observed.request_digest ?? null,
      execution_receipt_digest: observed.execution_receipt_digest ?? null,
      actual_writes: actualWrites,
      deleted_paths: deletedPaths,
      after_status_digest: observed.after_status_digest ?? null
    }
  };
}

function validateBoundedWritePathList(value, label, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array`);
    return [];
  }
  try {
    const normalized = normalizePaths(value);
    if (normalized.length !== value.length) errors.push(`${label} must not contain duplicate normalized paths`);
    return normalized;
  } catch (error) {
    errors.push(`${label} contains an invalid repository path: ${error.message}`);
    return [];
  }
}

async function observeBuildIdentityBeforeFinalReads({ repositoryRoot, uatScenarioRefs, observeBuildIdentity }) {
  const errors = [];
  const resolvedRoot = typeof repositoryRoot === 'string' && path.isAbsolute(repositoryRoot)
    ? path.resolve(repositoryRoot)
    : null;
  if (!Array.isArray(uatScenarioRefs)) errors.push('final build identity observation requires a UAT scenario ref array');
  const refs = Array.isArray(uatScenarioRefs) ? [...uatScenarioRefs].sort() : [];
  if (refs.length > 0 && typeof observeBuildIdentity !== 'function') {
    errors.push('UAT scenario observation requires a parent-owned build identity observer callback');
  }
  let buildOrRevision = null;
  if (resolvedRoot !== null && refs.length > 0 && typeof observeBuildIdentity === 'function') {
    try {
      const observed = await observeBuildIdentity(Object.freeze({
        repository_root: resolvedRoot,
        uat_scenario_refs: Object.freeze(refs)
      }));
      if (typeof observed !== 'string' || observed.trim() === '' || /[\r\n]/.test(observed)) {
        throw new Error('parent-owned build identity observer must return a non-empty single-line string');
      }
      buildOrRevision = observed;
    } catch (error) {
      errors.push(`UAT build identity observation failed: ${error?.message ?? String(error)}`);
    }
  }
  return Object.freeze({
    verified: errors.length === 0,
    errors: Object.freeze(uniqueSorted(errors)),
    build_or_revision: buildOrRevision
  });
}

async function observeReadyExecutionAttestations({ context, observeAutomatedEvidence, observeManualUat }) {
  const errors = [];
  const claim = readyExecutionClaim(context);
  const observedAutomated = [];
  const observedManualUat = [];

  if (claim.automated_ids.length > 0 && typeof observeAutomatedEvidence !== 'function') {
    errors.push('READY automated evidence requires a parent execution attestation observer');
  }
  if (claim.manual_uat_ids.length > 0 && typeof observeManualUat !== 'function') {
    errors.push('READY manual UAT requires a parent execution attestation observer');
  }

  if (typeof observeAutomatedEvidence === 'function') {
    for (const evidenceId of claim.automated_ids) {
      const expected = claim.automated.find((item) => item?.evidence_id === evidenceId) ?? null;
      if (!expected) {
        errors.push(`automated execution attestation cannot resolve evidence ${evidenceId}`);
        continue;
      }
      try {
        const observed = await observeAutomatedEvidence(Object.freeze({
          evidence_id: evidenceId,
          contract_id: context.contract_id,
          feature_id: context.feature_id,
          requirement_revision: context.requirement_revision,
          approved_spec_integrity_hash: context.approved_spec_integrity_hash,
          approved_plan_path: context.approved_plan_path,
          approved_plan_hash: context.approved_plan_hash,
          approved_plan_integrity_hash: context.approved_plan_integrity_hash
        }));
        const observationErrors = validateAutomatedExecutionObservation(observed);
        errors.push(...observationErrors.map((error) => `automated execution attestation ${evidenceId}: ${error}`));
        if (observationErrors.length === 0) {
          const snapshot = structuredClone(observed);
          observedAutomated.push(snapshot);
          if (stableStringify(snapshot) !== stableStringify(expected)) {
            errors.push(`automated execution attestation ${evidenceId} execution mismatch with the product evidence record`);
          }
        }
      } catch (error) {
        errors.push(`automated execution attestation ${evidenceId} observer failed: ${error?.message ?? String(error)}`);
      }
    }
  }

  if (typeof observeManualUat === 'function') {
    for (const uatRecordId of claim.manual_uat_ids) {
      const expected = claim.manual_uat.find((item) => item?.uat_record_id === uatRecordId) ?? null;
      if (!expected) {
        errors.push(`manual UAT execution attestation cannot resolve record ${uatRecordId}`);
        continue;
      }
      try {
        const observed = await observeManualUat(Object.freeze({
          uat_record_id: uatRecordId,
          contract_id: context.contract_id,
          feature_id: context.feature_id,
          requirement_revision: context.requirement_revision,
          approved_spec_integrity_hash: context.approved_spec_integrity_hash,
          approved_plan_path: context.approved_plan_path,
          approved_plan_hash: context.approved_plan_hash,
          approved_plan_integrity_hash: context.approved_plan_integrity_hash
        }));
        const observationErrors = validateManualUatExecutionObservation(observed);
        errors.push(...observationErrors.map((error) => `manual UAT execution attestation ${uatRecordId}: ${error}`));
        if (observationErrors.length === 0) {
          const snapshot = structuredClone(observed);
          observedManualUat.push(snapshot);
          if (stableStringify(snapshot) !== stableStringify(expected)) {
            errors.push(`manual UAT execution attestation ${uatRecordId} execution mismatch with the UAT record`);
          }
        }
      } catch (error) {
        errors.push(`manual UAT execution attestation ${uatRecordId} observer failed: ${error?.message ?? String(error)}`);
      }
    }
  }

  const verified = errors.length === 0
    && observedAutomated.length === claim.automated_ids.length
    && observedManualUat.length === claim.manual_uat_ids.length;
  if (!verified && errors.length === 0) errors.push('READY execution attestation coverage is incomplete');
  const result = Object.freeze({
    verified: verified && errors.length === 0,
    errors: Object.freeze(uniqueSorted(errors)),
    automated_evidence_ids: Object.freeze([...claim.automated_ids]),
    manual_uat_record_ids: Object.freeze([...claim.manual_uat_ids]),
    attestation_hash: verified && errors.length === 0
      ? digest(stableStringify({ automated: observedAutomated, manual_uat: observedManualUat }))
      : null
  });
  if (result.verified) TRUSTED_EXECUTION_ATTESTATIONS.add(result);
  return result;
}

function readyExecutionClaim(context) {
  const rows = Array.isArray(context?.rows) ? context.rows.filter(isPlainObject) : [];
  const evidenceById = new Map((Array.isArray(context?.evidence) ? context.evidence : [])
    .filter((record) => isPlainObject(record) && typeof record.evidence_id === 'string')
    .map((record) => [record.evidence_id, record]));
  const uatById = new Map((Array.isArray(context?.uat_records) ? context.uat_records : [])
    .filter((record) => isPlainObject(record) && typeof record.uat_record_id === 'string')
    .map((record) => [record.uat_record_id, record]));
  const automatedIds = uniqueSorted(rows
    .filter((row) => row.verification_status === 'passed')
    .flatMap((row) => Array.isArray(row.verification_evidence_ids) ? row.verification_evidence_ids : [])
    .filter((id) => typeof id === 'string' && id.length > 0));
  const manualUatIds = uniqueSorted(rows
    .filter((row) => rowRequiresUat(row, context.readiness_policy) && ['passed', 'waived', 'deferred'].includes(row.uat_status))
    .flatMap((row) => Array.isArray(row.uat_record_ids) ? row.uat_record_ids : [])
    .filter((id) => typeof id === 'string' && id.length > 0));
  return {
    automated_ids: automatedIds,
    manual_uat_ids: manualUatIds,
    automated: automatedIds.map((id) => projectAutomatedExecution(evidenceById.get(id))),
    manual_uat: manualUatIds.map((id) => projectManualUatExecution(uatById.get(id)))
  };
}

function executionClaimHash(context) {
  if (!['READY', 'READY_WITH_WARNINGS'].includes(context?.verdict)) return null;
  const claim = readyExecutionClaim(context);
  return digest(stableStringify({ automated: claim.automated, manual_uat: claim.manual_uat }));
}

function projectAutomatedExecution(record) {
  if (!isPlainObject(record)) return null;
  return {
    evidence_id: record.evidence_id,
    command: record.command,
    exit_code: record.exit_code,
    outcome: record.outcome,
    observed_result: record.observed_result,
    output_digest: record.output_digest,
    verified_head: record.verified_head,
    relevant_paths: Array.isArray(record.relevant_paths) ? [...record.relevant_paths] : record.relevant_paths,
    relevant_path_hashes: isPlainObject(record.relevant_path_hashes) ? { ...record.relevant_path_hashes } : record.relevant_path_hashes,
    relevant_paths_hash: record.relevant_paths_hash
  };
}

function projectManualUatExecution(record) {
  if (!isPlainObject(record)) return null;
  return {
    uat_record_id: record.uat_record_id,
    scenario_id: record.scenario_id,
    contract_id: record.contract_id,
    requirement_revision: record.requirement_revision,
    requirement_ids: Array.isArray(record.requirement_ids) ? [...record.requirement_ids] : record.requirement_ids,
    scenario_source_ref: record.scenario_source_ref,
    scenario_source_hash: record.scenario_source_hash,
    preconditions: Array.isArray(record.preconditions) ? structuredClone(record.preconditions) : record.preconditions,
    actor_role: record.actor_role,
    test_data_ref: record.test_data_ref,
    environment_fingerprint: record.environment?.environment_fingerprint,
    steps_ref: record.steps_ref,
    expected_result: record.expected_result,
    expected_result_ref: record.expected_result_ref,
    evidence_refs: Array.isArray(record.evidence_refs) ? [...record.evidence_refs] : record.evidence_refs,
    execution_kind: record.execution_kind,
    executed_by: record.executed_by,
    executed_at: record.executed_at,
    recorded_by: record.recorded_by,
    recorded_at: record.recorded_at,
    status: record.status,
    actual_result: record.actual_result,
    decision: isPlainObject(record.decision) ? structuredClone(record.decision) : record.decision,
    redaction: isPlainObject(record.redaction) ? structuredClone(record.redaction) : record.redaction,
    build_or_revision: record.environment?.build_or_revision
  };
}

function validateAutomatedExecutionObservation(observation) {
  const errors = [];
  requireOwnFields(observation, AUTOMATED_EXECUTION_ATTESTATION_FIELDS, 'automated execution observation', errors);
  rejectUnknownFields(observation, AUTOMATED_EXECUTION_ATTESTATION_FIELDS, 'automated execution observation', errors);
  if (!isPlainObject(observation)) return uniqueSorted(errors);
  for (const field of ['evidence_id', 'outcome', 'observed_result', 'output_digest', 'verified_head']) {
    if (isMissing(observation[field])) errors.push(`automated execution observation requires non-empty ${field}`);
  }
  if (observation.command !== null && isMissing(observation.command)) errors.push('automated execution observation command must be explicit text or null');
  if (observation.exit_code !== null && !Number.isInteger(observation.exit_code)) errors.push('automated execution observation exit_code must be an integer or null');
  errors.push(...validateRelevantPathManifest(observation, { requireNonEmpty: true }).errors
    .map((error) => `automated execution observation ${error}`));
  return uniqueSorted(errors);
}

function validateManualUatExecutionObservation(observation) {
  const errors = [];
  requireOwnFields(observation, MANUAL_UAT_EXECUTION_ATTESTATION_FIELDS, 'manual UAT execution observation', errors);
  rejectUnknownFields(observation, MANUAL_UAT_EXECUTION_ATTESTATION_FIELDS, 'manual UAT execution observation', errors);
  if (!isPlainObject(observation)) return uniqueSorted(errors);
  for (const field of [
    'uat_record_id', 'scenario_id', 'contract_id', 'scenario_source_ref',
    'scenario_source_hash', 'actor_role', 'test_data_ref', 'environment_fingerprint',
    'steps_ref', 'expected_result', 'expected_result_ref', 'execution_kind',
    'executed_by', 'executed_at', 'recorded_by', 'recorded_at', 'status',
    'actual_result', 'build_or_revision'
  ]) {
    if (isMissing(observation[field])) errors.push(`manual UAT execution observation requires non-empty ${field}`);
  }
  if (observation.execution_kind !== 'manual') errors.push('manual UAT execution observation execution_kind must be manual');
  if (!Number.isInteger(observation.requirement_revision) || observation.requirement_revision < 1) errors.push('manual UAT execution observation requires a positive requirement_revision');
  for (const field of ['requirement_ids', 'preconditions', 'evidence_refs']) {
    if (!Array.isArray(observation[field])) errors.push(`manual UAT execution observation ${field} must be an array`);
  }
  if (!SHA256_PATTERN.test(String(observation.scenario_source_hash ?? ''))) errors.push('manual UAT execution observation scenario_source_hash must be SHA-256');
  if (!SHA256_PATTERN.test(String(observation.environment_fingerprint ?? ''))) errors.push('manual UAT execution observation environment_fingerprint must be SHA-256');
  if (!isIso8601Instant(observation.executed_at) || !isIso8601Instant(observation.recorded_at)) errors.push('manual UAT execution observation requires ISO-8601 execution timestamps');
  try {
    normalizeUatScenarioRef(observation.scenario_source_ref);
  } catch (error) {
    errors.push(`manual UAT execution observation ${error.message}`);
  }
  if (observation.decision !== null && !isPlainObject(observation.decision)) errors.push('manual UAT execution observation decision must be an object or null');
  if (!isPlainObject(observation.redaction)) errors.push('manual UAT execution observation redaction must be an object');
  return uniqueSorted(errors);
}

export function validateProductAction(action, context = {}) {
  if (!isPlainObject(context)) return ['product action context must be an object'];
  const errors = [];
  if (!PRODUCT_ACTIONS.includes(action)) return [`unsupported product_action: ${String(action)}`];

  const expectedWritePolicy = ACTION_WRITE_POLICY[action];
  if (!Object.hasOwn(context, 'side_effects_allowed')) {
    errors.push(`${action} requires side_effects_allowed`);
  } else if (context.side_effects_allowed !== expectedWritePolicy) {
    errors.push(`${action} side_effects_allowed must be ${expectedWritePolicy}`);
  }

  const expectedPolicyName = expectedWritePolicy ? 'allow' : 'deny';
  if (context.write_policy !== expectedPolicyName) errors.push(`${action} write_policy must be ${expectedPolicyName}`);
  if (typeof context.write_authorized !== 'boolean') errors.push(`${action} requires boolean write_authorized`);
  if (action === 'audit-readonly' && context.write_authorized !== false) errors.push('audit-readonly write_authorized must be false');
  const expectedPersistence = action === 'audit-and-sync';
  if (context.persistence_requested !== expectedPersistence) errors.push(`${action} persistence_requested must be ${expectedPersistence}`);
  const expectedRequirementsChanged = NORMATIVE_ACTIONS.has(action);
  if (context.requirements_changed !== expectedRequirementsChanged) errors.push(`${action} requirements_changed must be ${expectedRequirementsChanged}`);

  if (action === 'seed-from-approved-spec') {
    if (!context.contract_id) errors.push('seed-from-approved-spec requires contract_id');
    if (context.requirement_revision !== 1) errors.push('seed-from-approved-spec requires requirement_revision 1');
    if (!Array.isArray(context.requirement_ids) || context.requirement_ids.length === 0) errors.push('seed-from-approved-spec requires stable requirement_ids');
    if (!isRepositoryRelativePath(context.approved_spec_path)) errors.push('seed-from-approved-spec requires a repository-relative approved_spec_path');
    if (!context.approved_spec_hash) errors.push('seed-from-approved-spec requires approved_spec_hash');
    if (!isCompleteAuthorityApproval(context.approval)) errors.push('seed-from-approved-spec requires complete approval metadata and approved immutable-contract authority');
  }

  if (action === 'requirements-update') {
    if (!context.contract_id) errors.push('requirements-update requires contract_id');
    if (!Number.isInteger(context.requirement_revision) || context.requirement_revision < 2) errors.push('requirements-update requires an incremented requirement_revision');
    if (context.supersedes === undefined || context.supersedes === null) errors.push('requirements-update requires supersedes');
    if (!context.change_reason) errors.push('requirements-update requires change_reason');
    if (!isRepositoryRelativePath(context.approved_spec_path)) errors.push('requirements-update requires a repository-relative approved_spec_path');
    if (!context.approved_spec_hash) errors.push('requirements-update requires approved_spec_hash');
    if (!isCompleteAuthorityApproval(context.approval)) errors.push('requirements-update requires complete approval metadata and approved change-control authority');
  }

  if (['traceability-sync', 'audit-readonly', 'audit-and-sync'].includes(action)) {
    if (!context.contract_id) errors.push(`${action} requires contract_id`);
    if (!Number.isInteger(context.requirement_revision) || context.requirement_revision < 1) errors.push(`${action} requires a positive requirement_revision`);
    if (!isRepositoryRelativePath(context.approved_spec_path)) errors.push(`${action} requires a repository-relative approved_spec_path`);
    if (!context.approved_spec_hash) errors.push(`${action} requires approved_spec_hash`);
    if (!Array.isArray(context.evidence)) errors.push(`${action} requires an explicit evidence collection`);
    if (!isCompleteNormativeSnapshot(context.normative_before) || !isCompleteNormativeSnapshot(context.normative_after)) errors.push(`${action} requires complete normative before/after snapshots`);
  }

  if (action === 'audit-and-sync' && context.persistence_requested !== true) errors.push('audit-and-sync requires explicit persistence intent');

  if (action === 'record-uat') {
    if (!context.contract_id) errors.push('record-uat requires contract_id');
    if (!Number.isInteger(context.requirement_revision) || context.requirement_revision < 1) errors.push('record-uat requires a positive requirement_revision');
    if (!isRepositoryRelativePath(context.approved_spec_path)) errors.push('record-uat requires a repository-relative approved_spec_path');
    if (!context.approved_spec_hash) errors.push('record-uat requires approved_spec_hash');
    if (!isCompleteNormativeSnapshot(context.normative_before) || !isCompleteNormativeSnapshot(context.normative_after)) errors.push('record-uat requires complete normative before/after snapshots');
    if (!context.uat_result || typeof context.uat_result !== 'object') {
      errors.push('record-uat requires an explicit uat_result');
    } else {
      errors.push(...validateUatRecord(context.uat_result, { ...context, product_action: 'record-uat' }).map((error) => `record-uat ${error}`));
    }
  }

  if (action === 'supersede-feature') {
    if (!context.contract_id) errors.push('supersede-feature requires contract_id');
    if (!Number.isInteger(context.requirement_revision) || context.requirement_revision < 2) errors.push('supersede-feature requires an incremented requirement_revision');
    if (context.supersedes === undefined || context.supersedes === null) errors.push('supersede-feature requires supersedes');
    if (!context.change_reason) errors.push('supersede-feature requires change_reason');
    if (!isRepositoryRelativePath(context.approved_spec_path)) errors.push('supersede-feature requires a repository-relative approved_spec_path');
    if (!context.approved_spec_hash) errors.push('supersede-feature requires approved_spec_hash');
    if (!isCompleteAuthorityApproval(context.approval)) errors.push('supersede-feature requires complete approval metadata and approved change-control authority');
    if (!context.replacement_contract_id && context.feature_lifecycle !== 'superseded') errors.push('supersede-feature requires replacement_contract_id or a superseded lifecycle');
  }

  return uniqueSorted(errors);
}

export function validateActionSideEffects(observation = {}, options = {}) {
  if (!isPlainObject(observation)) {
    return {
      errors: ['product action side-effect observation must be an object'],
      changed_paths: [],
      requires_user_choice: false
    };
  }
  const errors = [];
  if (!isPlainObject(options)) {
    errors.push('product action side-effect options must be an object');
    options = {};
  }
  const caseInsensitive = options.caseInsensitive ?? process.platform === 'win32';
  const action = observation.action ?? observation.product_action;
  const normalizeObservedPaths = (values, label) => {
    try {
      return normalizePaths(values);
    } catch (error) {
      errors.push(`${label} contains an invalid repository path: ${error.message}`);
      return [];
    }
  };
  const planned = normalizeObservedPaths(observation.planned_paths ?? [], 'planned_paths');
  const actual = normalizeObservedPaths(observation.actual_paths ?? observation.actual_writes ?? [], 'actual_paths');
  const deleted = normalizeObservedPaths(observation.deleted_paths ?? [], 'deleted_paths');
  const allowed = Array.isArray(observation.allowed_paths) ? observation.allowed_paths : [];
  const prohibited = Array.isArray(observation.prohibited_paths) ? observation.prohibited_paths : [];
  if (!Array.isArray(observation.allowed_paths ?? [])) errors.push('allowed_paths must be an array');
  if (!Array.isArray(observation.prohibited_paths ?? [])) errors.push('prohibited_paths must be an array');
  const dirty = normalizeObservedPaths(observation.dirty_paths ?? [], 'dirty_paths');
  let requiresUserChoice = false;

  if (!PRODUCT_ACTIONS.includes(action)) errors.push(`unsupported product_action: ${String(action)}`);

  if (action === 'audit-readonly') {
    if (observation.side_effects_allowed !== false) errors.push('audit-readonly is a zero-write action with side_effects_allowed false');
    if (planned.length > 0 || actual.length > 0 || deleted.length > 0) errors.push('audit-readonly zero-write contract forbids planned, actual, or deleted paths');
    if (allowed.length > 0) errors.push('audit-readonly zero-write contract forbids allowed paths');
    if (observation.summary_refresh === true) errors.push('audit-readonly zero-write contract forbids summary refresh');
    if (observation.checkpoint_write === true) errors.push('audit-readonly zero-write contract forbids checkpoint writes');
    if (!observation.before_status_digest || !observation.after_status_digest) errors.push('audit-readonly zero-write contract requires before/after status digests');
    else if (observation.before_status_digest !== observation.after_status_digest) errors.push('audit-readonly zero-write contract requires identical before/after status digests');
    if (!SHA256_PATTERN.test(String(observation.before_status_digest ?? ''))
      || !SHA256_PATTERN.test(String(observation.after_status_digest ?? ''))) {
      errors.push('audit-readonly zero-write contract requires SHA-256 before/after status digests');
    }
    errors.push(...validateTrustedAuditReadonlyState(observation, options.trusted_audit_proof));
  }

  if (ACTION_WRITE_POLICY[action] === true && allowed.length === 0 && (planned.length > 0 || actual.length > 0 || deleted.length > 0)) {
    errors.push(`${action} requires an explicit allowed path boundary`);
  }

  if (ACTION_WRITE_POLICY[action] === true && (planned.length > 0 || actual.length > 0 || deleted.length > 0) && observation.write_authorized !== true) {
    errors.push(`${action} writes require post-preflight write_authorized: true`);
  }

  for (const pattern of allowed) {
    if (!isValidRepositoryPattern(pattern)) {
      errors.push(`${action} allowed path must be a valid repository-relative pattern: ${pattern}`);
    } else if (isDefaultProhibitedProductPath(patternRoot(pattern))) {
      errors.push(`${action} allowed path is outside its owned product document scope and targets a default-prohibited path: ${pattern}`);
    } else if (!isActionOwnedPattern(action, pattern, observation, caseInsensitive)) {
      errors.push(`${action} allowed path is outside its owned product path classes: ${pattern}`);
    }
  }

  for (const pattern of prohibited) {
    if (!isValidRepositoryPattern(pattern)) errors.push(`prohibited_paths contains an invalid repository-relative pattern: ${pattern}`);
  }

  for (const changed of [...planned, ...actual, ...deleted]) {
    if (isDefaultProhibitedProductPath(changed)) errors.push(`default-prohibited product write: ${changed}`);
    if (prohibited.some((pattern) => isValidRepositoryPattern(pattern) && matchesPathPattern(changed, pattern, caseInsensitive))) {
      errors.push(`explicitly prohibited product write: ${changed}`);
    }
    if (allowed.length > 0 && !allowed.some((pattern) => isValidRepositoryPattern(pattern) && matchesPathPattern(changed, pattern, caseInsensitive))) {
      errors.push(`out-of-scope product write: ${changed}`);
    }
  }

  if (DERIVED_ACTIONS.has(action) && observation.requirements_changed !== false) {
    errors.push(`${action} must report requirements_changed: false`);
  }

  if (DERIVED_ACTIONS.has(action)) {
    if (!isCompleteNormativeSnapshot(observation.normative_before) || !isCompleteNormativeSnapshot(observation.normative_after)) {
      errors.push(`${action} requires complete normative before/after snapshots`);
    } else if (stableStringify(observation.normative_before) !== stableStringify(observation.normative_after)) {
      errors.push(`${action} cannot mutate normative requirement content or identity`);
    }
  }

  for (const intended of uniqueSorted([...planned, ...actual, ...deleted])) {
    if (dirty.some((occupied) => repositoryPathsOverlap(occupied, intended, caseInsensitive))) {
      errors.push(`dirty write overlap requires a user decision: ${intended}`);
      requiresUserChoice = true;
    }
  }

  const legacy = normalizeObservedPaths(observation.legacy_paths ?? [], 'legacy_paths');
  for (const target of [...planned, ...actual, ...deleted]) {
    if (legacy.some((legacyPath) => repositoryPathsOverlap(target, legacyPath, caseInsensitive))) {
      errors.push(`legacy ledger must not be deleted or overwritten: ${target}`);
    }
  }

  return {
    errors: uniqueSorted(errors),
    changed_paths: uniqueSorted([...actual, ...deleted]),
    requires_user_choice: requiresUserChoice
  };
}

export function validateIdentityTransition(previous = {}, next = {}, options = {}) {
  const errors = [];
  if (!isPlainObject(previous)) errors.push('previous product identity must be an object');
  if (!isPlainObject(next)) errors.push('next product identity must be an object');
  if (!isPlainObject(options)) errors.push('product identity validation options must be an object');
  if (errors.length > 0) return uniqueSorted(errors);
  const { action } = options;
  for (const [label, values] of [
    ['previous requirement_ids', previous.requirement_ids ?? []],
    ['next requirement_ids', next.requirement_ids ?? []],
    ['previous retired_requirement_ids', previous.retired_requirement_ids ?? []],
    ['next retired_requirement_ids', next.retired_requirement_ids ?? []]
  ]) {
    if (!Array.isArray(values)) {
      errors.push(`${label} must be an array`);
      continue;
    }
    if (values.some((id) => typeof id !== 'string' || id.trim() === '')) errors.push(`${label} must contain non-empty string IDs`);
    if (new Set(values).size !== values.length) errors.push(`${label} contains duplicate stable IDs`);
  }
  if (errors.length > 0) return uniqueSorted(errors);
  const previousIds = new Set(previous.requirement_ids ?? []);
  const nextIds = new Set(next.requirement_ids ?? []);
  const previousRetired = new Set(previous.retired_requirement_ids ?? []);
  const nextRetired = new Set(next.retired_requirement_ids ?? []);

  if (!previous.contract_id || !next.contract_id || previous.contract_id !== next.contract_id) errors.push('contract_id must remain stable across a requirement revision');
  if (!previous.feature_id || !next.feature_id) errors.push('feature_id is required across a requirement revision');
  else if (previous.feature_id !== next.feature_id) errors.push('feature_id must remain stable across a requirement revision');

  for (const id of nextIds) {
    if (previousRetired.has(id)) errors.push(`retired requirement ID reuse is forbidden: ${id}`);
    if (nextRetired.has(id)) errors.push(`requirement ID cannot be active and retired: ${id}`);
  }

  for (const id of previousIds) {
    if (!nextIds.has(id) && !nextRetired.has(id)) errors.push(`removed requirement must remain in retired history: ${id}`);
  }

  for (const id of previousRetired) {
    if (!nextRetired.has(id) && !nextIds.has(id)) errors.push(`retired requirement history must be preserved: ${id}`);
  }
  for (const id of nextRetired) {
    if (!previousIds.has(id) && !previousRetired.has(id)) errors.push(`retired requirement ID has no previous provenance: ${id}`);
  }

  if (action === 'requirements-update' || action === 'supersede-feature') {
    if (!Number.isInteger(next.requirement_revision) || next.requirement_revision !== Number(previous.requirement_revision) + 1) {
      errors.push('requirement_revision must increment by exactly one');
    }
    if (next.supersedes !== previous.requirement_revision) errors.push('revision change requires supersedes to reference the prior requirement revision');
    if (!next.change_reason) errors.push('revision change requires change_reason');
    if (next.approval?.approved !== true) errors.push('revision change requires approved change control');
    if (!isRepositoryRelativePath(previous.approved_spec_path) || !isRepositoryRelativePath(next.approved_spec_path)) {
      errors.push('revision change requires repository-relative approved spec paths for both immutable snapshots');
    } else if (previous.approved_spec_path === next.approved_spec_path) {
      errors.push('revision change requires a new immutable approved spec path');
    }
    if (isMissing(previous.approved_spec_hash) || isMissing(next.approved_spec_hash)) {
      errors.push('revision change requires approved spec hashes for both immutable snapshots');
    } else if (previous.approved_spec_hash === next.approved_spec_hash) {
      errors.push('revision change requires a new immutable approved spec hash');
    }
  } else {
    if (next.requirement_revision !== previous.requirement_revision) errors.push(`${action ?? 'non-revision action'} cannot change requirement_revision`);
    if (stableStringify([...previousIds].sort()) !== stableStringify([...nextIds].sort()) || stableStringify([...previousRetired].sort()) !== stableStringify([...nextRetired].sort())) {
      errors.push(`${action ?? 'non-revision action'} cannot remove or change requirement identity without a revision`);
    }
  }

  return uniqueSorted(errors);
}

export function evaluateEvidenceFreshness(evidence = {}, current = {}) {
  if (!isPlainObject(evidence) || !isPlainObject(current)) {
    const reasons = [];
    if (!isPlainObject(evidence)) reasons.push('freshness is unknown because evidence must be an object');
    if (!isPlainObject(current)) reasons.push('freshness is unknown because current state must be an object');
    return { freshness: 'unknown', reasons, head_changed: false };
  }
  const reasons = [];
  const requireRelevantPaths = evidence.outcome === 'passed' && Array.isArray(evidence.requirement_ids) && evidence.requirement_ids.length > 0;
  const evidenceManifest = validateRelevantPathManifest(evidence, { requireNonEmpty: requireRelevantPaths });
  const currentManifest = validateRelevantPathManifest(current, { requireNonEmpty: requireRelevantPaths });
  if (evidenceManifest.errors.length > 0 || currentManifest.errors.length > 0) {
    return {
      freshness: 'unknown',
      reasons: [
        ...evidenceManifest.errors.map((error) => `evidence ${error}`),
        ...currentManifest.errors.map((error) => `current state ${error}`)
      ],
      head_changed: evidence.verified_head !== current.verified_head
    };
  }

  const requiredFields = [
    'contract_id', 'feature_id', 'requirement_revision', 'approved_spec_path',
    'approved_spec_hash', 'approved_spec_integrity_hash', ...APPROVED_PLAN_IDENTITY_FIELDS,
    'relevant_paths_hash', 'verified_head'
  ];
  const missing = requiredFields.filter((field) => isMissing(evidence[field]) || isMissing(current[field]));
  if (missing.length > 0) {
    return {
      freshness: 'unknown',
      reasons: missing.map((field) => `freshness is unknown because ${field} is missing`),
      head_changed: evidence.verified_head !== current.verified_head
    };
  }
  const planIdentityErrors = [
    ...validateApprovedPlanIdentity(evidence, 'evidence'),
    ...validateApprovedPlanIdentity(current, 'current state')
  ];
  if (planIdentityErrors.length > 0) {
    return {
      freshness: 'unknown',
      reasons: planIdentityErrors.map((error) => `freshness is unknown because ${error}`),
      head_changed: evidence.verified_head !== current.verified_head
    };
  }

  if (evidence.contract_id !== current.contract_id) reasons.push('contract_id changed');
  if (evidence.feature_id !== current.feature_id) reasons.push('feature_id changed');
  if (evidence.requirement_revision !== current.requirement_revision) reasons.push('requirement_revision changed');
  if (evidence.approved_spec_path !== current.approved_spec_path) reasons.push('approved spec path changed');
  if (evidence.approved_spec_hash !== current.approved_spec_hash) reasons.push('approved spec hash changed');
  if (evidence.approved_spec_integrity_hash !== current.approved_spec_integrity_hash) reasons.push('approved spec integrity hash changed');
  if (evidence.approved_plan_path !== current.approved_plan_path) reasons.push('approved plan path changed');
  if (evidence.approved_plan_hash !== current.approved_plan_hash) reasons.push('approved plan hash changed');
  if (evidence.approved_plan_integrity_hash !== current.approved_plan_integrity_hash) reasons.push('approved plan integrity hash changed');
  if (evidence.relevant_paths_hash !== current.relevant_paths_hash) reasons.push('relevant paths hash changed');

  const headChanged = evidence.verified_head !== current.verified_head;
  if (reasons.length > 0) return { freshness: 'stale', reasons, head_changed: headChanged };

  if (headChanged) {
    const changedPaths = current.changed_paths;
    const relevantPaths = current.relevant_paths ?? evidence.relevant_paths;
    if (Array.isArray(changedPaths) && Array.isArray(relevantPaths)) try {
      const changed = normalizePaths(changedPaths);
      const relevant = normalizePaths(relevantPaths);
      if (changed.some((changedPath) => relevant.some((relevantPath) => repositoryPathsOverlap(changedPath, relevantPath, process.platform === 'win32')))) {
        return {
          freshness: 'stale',
          reasons: ['a relevant path changed after the evidence HEAD'],
          head_changed: true
        };
      }
    } catch {
      return {
        freshness: 'unknown',
        reasons: ['freshness is unknown because changed-path proof contains an invalid path'],
        head_changed: true
      };
    }
  }

  return {
    freshness: 'current',
    reasons: [],
    head_changed: headChanged
  };
}

export function evaluateUatFreshness(record = {}, current = {}) {
  if (!isPlainObject(record) || !isPlainObject(current)) {
    const reasons = [];
    if (!isPlainObject(record)) reasons.push('UAT freshness is unknown because the UAT record must be an object');
    if (!isPlainObject(current)) reasons.push('UAT freshness is unknown because current state must be an object');
    return { freshness: 'unknown', reasons };
  }
  const reasons = [];
  const scenarioRef = record.scenario_source_ref;
  const scenarioHashes = current.uat_scenario_hashes;
  const expectedScenarioHash = isPlainObject(scenarioHashes) && !isMissing(scenarioRef)
    ? scenarioHashes[scenarioRef]
    : undefined;
  const expectedBuild = current.uat_build_or_revision;
  const observedBuild = record.environment?.build_or_revision;

  if (isMissing(scenarioRef) || isMissing(record.scenario_source_hash) || isMissing(expectedScenarioHash)) {
    reasons.push('UAT freshness is unknown because the current scenario source hash is missing');
  } else if (record.scenario_source_hash !== expectedScenarioHash) {
    reasons.push('UAT scenario source hash changed');
  }
  if (isMissing(observedBuild) || isMissing(expectedBuild)) {
    reasons.push('UAT freshness is unknown because the current build or deployed revision is missing');
  } else if (observedBuild !== expectedBuild) {
    reasons.push('UAT build or deployed revision changed');
  }

  if (reasons.some((reason) => /changed$/.test(reason))) return { freshness: 'stale', reasons };
  if (reasons.length > 0) return { freshness: 'unknown', reasons };
  return { freshness: 'current', reasons: [] };
}

function rowRequiresUat(row = {}, policy = {}) {
  return row?.uat_required === true || policy?.uat_required === true;
}

export function deriveRequirementReadiness(row = {}, policy = {}, options = {}) {
  const inputErrors = validateCanonicalTraceabilityRow(row);
  if (!isPlainObject(policy)) inputErrors.push('readiness policy must be an object');
  if (!isPlainObject(options)) inputErrors.push('readiness options must be an object');
  if (inputErrors.length > 0) {
    return readiness('BLOCKED', defaultReadinessStatuses(), inputErrors, [], []);
  }
  const blockers = [];
  const warnings = [];
  const gaps = [...row.gaps];
  const required = row.required !== false;
  const uatRequired = rowRequiresUat(row, policy);

  const statuses = {
    requirement: row.requirement_status ?? 'draft',
    implementation: row.implementation_status ?? 'unknown',
    verification: row.verification_status ?? 'unverified',
    uat: row.uat_status ?? 'not_run',
    evidence_freshness: row.evidence_freshness ?? 'unknown'
  };

  const validStatuses = {
    requirement: new Set(['draft', 'proposed', 'agreed', 'approved', 'superseded', 'deferred', 'rejected']),
    implementation: new Set(['unknown', 'missing', 'partial', 'implemented', 'not_applicable']),
    verification: new Set(['unverified', 'failed', 'passed', 'blocked', 'stale', 'not_applicable']),
    uat: new Set(['not_run', 'in_progress', 'passed', 'failed', 'waived', 'deferred', 'not_applicable']),
    evidence_freshness: new Set(['current', 'stale', 'unknown'])
  };
  for (const [dimension, value] of Object.entries(statuses)) {
    if (!validStatuses[dimension].has(value)) blockers.push(`unknown ${dimension} status: ${value}`);
  }
  if (blockers.length > 0) return readiness('BLOCKED', statuses, blockers, warnings, gaps);

  if (statuses.requirement === 'deferred') return readiness('DEFERRED', statuses, blockers, warnings, gaps);
  if (statuses.requirement === 'superseded') return readiness('NOT_APPLICABLE', statuses, blockers, warnings, gaps);
  if (statuses.requirement !== 'approved') {
    if (required) return readiness('BLOCKED', statuses, ['required requirement is not approved'], warnings, gaps);
    return readiness('PARTIAL', statuses, blockers, [`optional requirement is ${statuses.requirement}, not approved`], gaps);
  }
  if (required && statuses.implementation === 'missing') blockers.push('required implementation is missing');
  if (statuses.implementation === 'not_applicable') {
    const decisionErrors = validateNotApplicableDecision(row.implementation_approval, {
      requirementId: row.requirement_id,
      dimension: 'implementation'
    });
    if (decisionErrors.length > 0) blockers.push(`not_applicable implementation requires a complete matching row-bound approval decision: ${decisionErrors.join('; ')}`);
  }
  if (required && ['failed', 'blocked'].includes(statuses.verification)) blockers.push(`required verification is ${statuses.verification}`);
  if (statuses.verification === 'passed' && row.verification_evidence_ids.length === 0) {
    blockers.push('passed verification requires at least one bound verification evidence ID');
  }
  if (statuses.verification === 'not_applicable') {
    const decisionErrors = validateNotApplicableDecision(row.verification_approval, {
      requirementId: row.requirement_id,
      dimension: 'verification'
    });
    if (decisionErrors.length > 0) blockers.push(`not_applicable verification requires a complete matching row-bound approval decision: ${decisionErrors.join('; ')}`);
  }
  const decisionAuthorityRequired = statuses.implementation === 'not_applicable'
    || statuses.verification === 'not_applicable';
  if (decisionAuthorityRequired && !blockers.some((error) => /not_applicable .* decision/i.test(error))) {
    const internalDecisionValidation = options[INTERNAL_PRODUCT_DECISION_VALIDATION];
    blockers.push(...(
      isPlainObject(internalDecisionValidation)
        ? internalDecisionValidation.errors
        : validateTrustedProductDecisionAuthority(row, options)
    ));
  }
  if (uatRequired && statuses.uat === 'failed') blockers.push('required UAT failed');
  if (uatRequired && ['passed', 'waived', 'deferred'].includes(statuses.uat) && row.uat_record_ids.length === 0) {
    blockers.push(`required UAT ${statuses.uat} requires at least one bound UAT record ID`);
  }
  if (uatRequired && statuses.uat === 'not_applicable'
    && (!isCompleteUatDecision(row.uat_approval) || row.uat_approval.status !== statuses.uat)) {
    blockers.push('not_applicable UAT requires a complete matching canonical decision identity');
  }
  if (uatRequired && ['waived', 'deferred'].includes(statuses.uat)
    && (!isCompleteUatDecision(row.uat_approval) || row.uat_approval.status !== statuses.uat)) {
    blockers.push(`UAT ${statuses.uat} requires a complete matching canonical approval decision identity, scope, expiry, and review fields`);
  }
  for (const gap of gaps) if (gap.blocking === true) blockers.push(gap.type ?? 'blocking gap');
  if (blockers.length > 0) return readiness('BLOCKED', statuses, blockers, warnings, gaps);

  if (statuses.implementation === 'not_applicable' && statuses.verification === 'not_applicable' && (!uatRequired || statuses.uat === 'not_applicable')) {
    return readiness('NOT_APPLICABLE', statuses, blockers, warnings, gaps);
  }

  if (required && (statuses.verification === 'stale' || statuses.evidence_freshness === 'stale')) {
    return readiness('STALE', statuses, blockers, warnings, gaps);
  }

  const partial = required && (
    ['unknown', 'partial'].includes(statuses.implementation)
    || ['unverified'].includes(statuses.verification)
    || statuses.evidence_freshness === 'unknown'
    || (uatRequired && ['not_run', 'in_progress'].includes(statuses.uat))
  );
  if (partial) return readiness('PARTIAL', statuses, blockers, warnings, gaps);

  if (uatRequired && ['waived', 'deferred'].includes(statuses.uat)) {
    warnings.push(`UAT is ${statuses.uat} by approved decision`);
  }
  if (uatRequired && statuses.uat === 'not_applicable') warnings.push('UAT is not_applicable by approved decision');
  if (!required && ['failed', 'blocked'].includes(statuses.verification)) warnings.push(`optional verification is ${statuses.verification}`);
  if (!required && statuses.uat === 'failed') warnings.push('optional UAT is failed');
  if (!required && (['unknown', 'missing', 'partial'].includes(statuses.implementation)
    || ['unverified', 'stale', 'failed', 'blocked'].includes(statuses.verification)
    || statuses.evidence_freshness !== 'current')) warnings.push('optional requirement remains incomplete');
  if (gaps.some((gap) => gap.blocking !== true)) warnings.push('non-blocking product gaps remain');

  return readiness(warnings.length > 0 ? 'READY_WITH_WARNINGS' : 'READY', statuses, blockers, warnings, gaps);
}

export function deriveFeatureVerdict(rows = [], policy = {}, options = {}) {
  if (!Array.isArray(rows)) return { verdict: 'BLOCKED', requirements: [], blockers: ['feature rows must be an array'], warnings: [] };
  if (!isPlainObject(policy)) return { verdict: 'BLOCKED', requirements: [], blockers: ['feature readiness policy must be an object'], warnings: [] };
  if (!isPlainObject(options)) return { verdict: 'BLOCKED', requirements: [], blockers: ['feature readiness options must be an object'], warnings: [] };
  const rowErrors = rows.flatMap((row, index) => validateCanonicalTraceabilityRow(row)
    .map((error) => `feature row ${index + 1}: ${error}`));
  if (rowErrors.length > 0) {
    return { verdict: 'BLOCKED', requirements: [], blockers: uniqueSorted(rowErrors), warnings: [] };
  }
  const hasActiveIdentity = Object.hasOwn(policy, 'active_requirement_ids');
  const activeRequirementIds = Array.isArray(policy.active_requirement_ids) ? policy.active_requirement_ids : [];
  const inactiveLifecycle = ['superseded', 'retired'].includes(policy.feature_lifecycle);
  const rowIds = rows.map((row) => row?.requirement_id).filter((id) => typeof id === 'string' && id.length > 0);
  const coverageBlockers = [];
  if (hasActiveIdentity && !Array.isArray(policy.active_requirement_ids)) coverageBlockers.push('active requirement IDs must be an array');
  if (hasActiveIdentity && new Set(rowIds).size !== rowIds.length) coverageBlockers.push('feature rows contain duplicate requirement IDs');
  if (hasActiveIdentity && !inactiveLifecycle && !sameStringSet(rowIds, activeRequirementIds)) {
    const missing = activeRequirementIds.filter((id) => !rowIds.includes(id));
    const extra = rowIds.filter((id) => !activeRequirementIds.includes(id));
    coverageBlockers.push(`active requirement row coverage is incomplete; missing: ${missing.join(', ') || 'none'}; extra: ${extra.join(', ') || 'none'}`);
  }
  if (coverageBlockers.length > 0) {
    return { verdict: 'BLOCKED', requirements: [], blockers: uniqueSorted(coverageBlockers), warnings: [] };
  }
  if (rows.length === 0) return { verdict: 'NOT_APPLICABLE', requirements: [], blockers: [], warnings: [] };
  const decisionRows = rows.filter((row) => (
    row.implementation_status === 'not_applicable'
    || row.verification_status === 'not_applicable'
  ));
  const decisionValidation = Object.freeze({
    errors: Object.freeze(decisionRows.length > 0
      ? validateTrustedProductDecisionAuthority(decisionRows, options)
      : [])
  });
  const requirements = rows.map((row) => deriveRequirementReadiness(row, policy, {
    ...options,
    [INTERNAL_PRODUCT_DECISION_VALIDATION]: decisionValidation
  }));
  const verdictContradictions = rows.flatMap((row, index) => row.verdict === requirements[index].verdict
    ? []
    : [`feature row ${row.requirement_id} verdict ${row.verdict} contradicts derived verdict ${requirements[index].verdict}`]);
  if (verdictContradictions.length > 0) {
    return {
      verdict: 'BLOCKED',
      requirements,
      blockers: uniqueSorted([
        ...verdictContradictions,
        ...requirements.flatMap((item) => item.blockers)
      ]),
      warnings: requirements.flatMap((item) => item.warnings)
    };
  }
  const verdict = requirements.map((item) => item.verdict).sort((left, right) => VERDICT_PRIORITY.indexOf(left) - VERDICT_PRIORITY.indexOf(right))[0];
  return {
    verdict,
    requirements,
    blockers: requirements.flatMap((item) => item.blockers),
    warnings: requirements.flatMap((item) => item.warnings)
  };
}

export function deriveTraceability(input = {}, options = {}) {
  const explicitAuthorityBoundary = arguments.length >= 2;
  const inputErrors = validateTraceabilityInput(input);
  if (!isPlainObject(options)) inputErrors.push('traceability options must be an object');
  if (inputErrors.length > 0) return blockedTraceability(inputErrors);
  let requirements;
  let implementationArtifacts;
  let testArtifacts;
  let evidenceRecords;
  let uatRecords;
  try {
    requirements = clone(input.requirements ?? []);
    implementationArtifacts = clone(input.implementation_artifacts ?? []);
    testArtifacts = clone(input.test_artifacts ?? []);
    evidenceRecords = clone(input.evidence_records ?? []);
    uatRecords = clone(input.uat_records ?? []);
  } catch (error) {
    return blockedTraceability([`traceability input cannot be cloned safely: ${error?.message ?? String(error)}`]);
  }
  if (explicitAuthorityBoundary) {
    const authority = options.trusted_authority;
    if (!isPlainObject(authority)
      || !TRUSTED_APPROVED_SPEC_AUTHORITIES.has(authority)
      || authority.verified !== true) {
      return {
        requirements: [],
        artifacts: [],
        gaps: [{
          type: 'UNTRUSTED_NORMATIVE_INPUT',
          blocking: true,
          reason: 'traceability authority boundary requires trusted file-backed approved-spec requirements'
        }],
        rows: [],
        verdict: 'BLOCKED'
      };
    }
    requirements = clone(authority.requirements ?? []);
  }
  const normativeAuthorityGaps = [];
  const hasBehaviorObservation = [...implementationArtifacts, ...testArtifacts]
    .some((artifact) => artifact.observed !== undefined);
  if (hasBehaviorObservation) {
    const authority = options.trusted_authority;
    if (!isPlainObject(authority)
      || !TRUSTED_APPROVED_SPEC_AUTHORITIES.has(authority)
      || authority.verified !== true) {
      normativeAuthorityGaps.push({
        type: 'untrusted_normative_input',
        blocking: true,
        reason: 'behavior drift derivation requires trusted file-backed approved-spec requirements'
      });
    } else {
      const approvedById = new Map((authority.requirements ?? []).map((requirement) => [requirement.id, requirement]));
      requirements = requirements.map((requirement) => {
        const approved = approvedById.get(requirement.id);
        if (!approved) {
          normativeAuthorityGaps.push({
            type: 'normative_authority_mismatch',
            requirement_id: requirement.id,
            blocking: true,
            reason: 'requirement is not present in the file-backed approved-spec projection'
          });
          return requirement;
        }
        const redefinedFields = ['text', 'expected', 'source_ref', 'source_hash']
          .filter((field) => requirement[field] !== undefined && requirement[field] !== approved[field]);
        if (redefinedFields.length > 0) {
          normativeAuthorityGaps.push({
            type: 'normative_redefinition',
            requirement_id: requirement.id,
            blocking: true,
            details: redefinedFields,
            reason: 'caller-provided normative fields differ from the file-backed approved-spec projection'
          });
        }
        return {
          ...requirement,
          text: approved.text,
          expected: approved.expected,
          source_ref: approved.source_ref,
          source_hash: approved.source_hash,
          required: approved.required,
          requirement_status: approved.requirement_status,
          uat_required: requirement.uat_required ?? approved.uat_required
        };
      });
    }
  }
  const evidenceById = new Map(evidenceRecords.map((record) => [record.evidence_id, record]));
  const requirementIds = new Set(requirements.map((item) => item.id));
  const requirementsByBehavior = new Map(requirements.filter((item) => item.behavior_key).map((item) => [item.behavior_key, item]));
  const artifacts = [];
  const classifiedImplementation = [];
  const classifiedTests = [];
  const gaps = [...normativeAuthorityGaps];

  for (const artifact of implementationArtifacts) {
    const directIds = artifact.requirement_ids ?? [];
    const supportIds = artifact.supports ?? [];
    const directMapped = directIds.some((id) => requirementIds.has(id)) || requirementsByBehavior.has(artifact.behavior_key);
    const supportMapped = supportIds.some((id) => requirementIds.has(id));
    let role;
    if (typeof artifact.observable_behavior !== 'boolean') role = 'mapping_unknown';
    else if (artifact.observable_behavior === true && directMapped) role = 'requirement_implementation';
    else if (artifact.observable_behavior === true) role = 'unapproved_behavior';
    else if (artifact.observable_behavior === false && (directMapped || supportMapped)) role = 'supporting_implementation';
    else if (directMapped) role = 'requirement_implementation';
    else if (supportMapped) role = 'supporting_implementation';
    else role = 'unmapped_implementation';
    const classified = { ...artifact, role };
    artifacts.push(classified);
    classifiedImplementation.push(classified);
    if (role === 'mapping_unknown') {
      gaps.push({
        type: 'mapping_unknown',
        path: artifact.path,
        blocking: true,
        reason: 'implementation artifact requires an explicit boolean observable_behavior classification'
      });
    } else if (role === 'unapproved_behavior') {
      gaps.push({ type: 'unapproved_scope', path: artifact.path, blocking: true, required_action: 'requirements-update' });
    }
  }

  for (const artifact of testArtifacts) {
    const mappedRequirements = (artifact.requirement_ids ?? []).some((id) => requirementIds.has(id));
    let role;
    if ((artifact.control_requirement_ids?.length ?? 0) > 0) role = 'control_verification';
    else if (mappedRequirements) role = 'requirement_verification';
    else if (artifact.observable_behavior === true || (artifact.assertions?.length ?? 0) > 0) role = 'orphan_behavior_assertion';
    else role = 'supporting_verification';
    const classified = { ...artifact, role };
    artifacts.push(classified);
    classifiedTests.push(classified);
    if (role === 'orphan_behavior_assertion') gaps.push({ type: 'orphan_behavior_assertion', path: artifact.path, blocking: false });
  }

  for (const requirement of requirements) {
    const observations = [...implementationArtifacts, ...testArtifacts].filter((artifact) => artifact.observed !== undefined
      && (artifact.behavior_key === requirement.behavior_key || (artifact.requirement_ids ?? []).includes(requirement.id)));
    if (observations.some((artifact) => normalizeBehavior(artifact.observed) !== normalizeBehavior(requirement.expected))) {
      gaps.push({ type: 'implementation_drift', requirement_id: requirement.id, blocking: true, observed_paths: observations.map((item) => item.path).filter(Boolean) });
    }
  }

  const rowDrafts = requirements.map((requirement) => {
    const implementation = classifiedImplementation.filter((artifact) => artifact.role === 'requirement_implementation'
      && (artifact.behavior_key === requirement.behavior_key || (artifact.requirement_ids ?? []).includes(requirement.id)));
    const verification = classifiedTests.filter((artifact) => artifact.role === 'requirement_verification'
      && (artifact.behavior_key === requirement.behavior_key || (artifact.requirement_ids ?? []).includes(requirement.id)));
    const verificationObservations = verification.map((artifact) => evaluateVerificationArtifact(
      artifact,
      evidenceById,
      input.current_state ?? {},
      requirement.id
    ));
    const verificationStatus = selectStatus(
      verificationObservations.map((observation) => observation.verification_status),
      ['blocked', 'failed', 'stale', 'unverified', 'passed', 'not_applicable'],
      'unverified'
    );
    const evidenceFreshness = selectStatus(
      verificationObservations.map((observation) => observation.evidence_freshness),
      ['stale', 'unknown', 'current'],
      'unknown'
    );
    const verificationEvidenceIds = uniqueSorted(verification.flatMap((artifact) => artifact.evidence_ids ?? [])
      .filter((evidenceId) => isAcceptableVerificationEvidence(evidenceById.get(evidenceId), requirement.id)));
    const applicableUatRecords = uatRecords
      .filter((record) => (record.requirement_ids ?? []).includes(requirement.id))
      .filter((record) => validateUatRecord(record, {
        contract_id: input.current_state?.contract_id ?? record.contract_id,
        requirement_revision: input.current_state?.requirement_revision ?? record.requirement_revision
      }).length === 0)
      .filter((record) => evaluateUatFreshness(record, input.current_state ?? {}).freshness === 'current')
      .sort(compareUatRecordsNewestFirst);
    const currentUat = applicableUatRecords[0];
    return {
      requirement_id: requirement.id,
      required: requirement.required !== false,
      source_ref: requirement.source_ref ?? null,
      source_hash: requirement.source_hash ?? null,
      requirement_status: requirement.requirement_status ?? 'draft',
      implementation_status: implementation.length > 0 ? 'implemented' : 'missing',
      implementation_refs: uniqueSorted(implementation.map((artifact) => artifact.path).filter(Boolean)),
      implementation_approval: requirement.implementation_approval ?? null,
      verification_status: verificationStatus,
      verification_evidence_ids: verificationEvidenceIds,
      verification_approval: requirement.verification_approval ?? null,
      evidence_freshness: evidenceFreshness,
      uat_status: currentUat?.status ?? 'not_run',
      uat_required: requirement.uat_required === true,
      uat_record_ids: currentUat ? [currentUat.uat_record_id] : [],
      uat_approval: requirement.uat_approval ?? currentUat?.decision ?? null,
      gaps: gaps.filter((gap) => gap.requirement_id === requirement.id),
      verdict: 'BLOCKED'
    };
  });
  const rows = rowDrafts.map((row) => ({
    ...row,
    verdict: deriveRequirementReadiness(row).verdict
  }));

  const activeRequirementIds = requirements.map((requirement) => requirement.id);
  const derivedVerdict = gaps.some((gap) => gap.blocking) ? 'BLOCKED' : deriveFeatureVerdict(rows, {
    active_requirement_ids: activeRequirementIds,
    feature_lifecycle: input.current_state?.feature_lifecycle ?? (activeRequirementIds.length > 0 ? 'active' : 'retired')
  }).verdict;
  return {
    requirements,
    artifacts,
    gaps: stableSortObjects(gaps),
    rows,
    verdict: derivedVerdict === 'READY' && gaps.some((gap) => gap.blocking !== true) ? 'READY_WITH_WARNINGS' : derivedVerdict
  };
}

export function resolveProductLayout(input = {}) {
  const inputErrors = validateProductLayoutInput(input);
  if (inputErrors.length > 0) return blockedProductLayout(inputErrors);
  const contractKey = `${slugify(input.feature_id ?? input.slug ?? 'feature')}--${digest(input.contract_id ?? 'unknown-contract').slice(0, 12)}`;
  const fallbackLedgerRoot = `.sdcorejs/docs/product/${contractKey}`;
  const existing = input.existing_layout && Object.keys(input.existing_layout).length > 0;
  const legacyCandidates = input.legacy_ledgers ?? [];
  const legacySources = legacyCandidates
    .filter((item) => item.contract_id === input.contract_id
      || (!item.contract_id && item.attribution?.unique === true && item.attribution?.contract_id === input.contract_id))
    .map((item) => ({ ...item, role: 'legacy_history' }));
  const legacyAmbiguities = legacyCandidates
    .filter((item) => !item.contract_id && !(item.attribution?.unique === true && item.attribution?.contract_id === input.contract_id))
    .map((item) => ({ ...item, role: 'legacy_ambiguity' }));

  let existingLayout;
  try {
    existingLayout = existing ? clone(input.existing_layout) : null;
  } catch (error) {
    return blockedProductLayout([`product layout input cannot be cloned safely: ${error?.message ?? String(error)}`]);
  }
  const existingDocs = existing
    ? clone(existingLayout.product_docs ?? existingLayout)
    : null;
  const productDocs = existing
    ? {
        acceptance_path: existingDocs.acceptance_path ?? null,
        compact_path: existingDocs.compact_path ?? null,
        decisions_path: existingDocs.decisions_path ?? null,
        prd_path: existingDocs.prd_path ?? null,
        root: existingDocs.root ?? null,
        stories_path: existingDocs.stories_path ?? null,
        uat_path: existingDocs.uat_path ?? null
      }
    : {
        acceptance_path: `product/acceptance-criteria/${contractKey}.md`,
        compact_path: `product/${contractKey}.md`,
        decisions_path: `product/decisions/${contractKey}.md`,
        prd_path: `product/prds/${contractKey}.md`,
        root: 'product',
        stories_path: `product/user-stories/${contractKey}.md`,
        uat_path: `product/uat-checklists/${contractKey}.md`
      };

  const currentPath = existingLayout?.current_path ?? `${fallbackLedgerRoot}/current.md`;
  const ledgerRoot = existingLayout?.ledger_root ?? (existingLayout?.current_path ? path.posix.dirname(existingLayout.current_path) : fallbackLedgerRoot);
  const historyRoot = existingLayout?.history_root ?? `${ledgerRoot}/history`;
  const uatRoot = existingLayout?.uat_root ?? `${ledgerRoot}/uat`;
  const operations = [
    { type: 'create-if-missing', path: currentPath, target: null },
    ...legacySources.map((source) => ({ type: 'link-history', path: source.path, target: `${historyRoot}/legacy-index.md` }))
  ];

  const gaps = legacyAmbiguities.map((source) => ({
    type: 'legacy_ambiguity',
    path: source.path,
    blocking: true,
    required_action: 'attribute-legacy-ledger',
    reason: 'legacy product ledger cannot be assigned to the active contract without unique file-backed identity'
  }));
  const layout = {
    active_candidates: existing && currentPath ? [currentPath] : [],
    contract_key: contractKey,
    current_path: currentPath,
    doc_layout: legacyAmbiguities.length > 0 ? 'blocked' : existing ? 'existing' : 'fallback',
    history_paths: legacySources.map((source) => source.path),
    history_root: historyRoot,
    ledger_root: ledgerRoot,
    legacy_sources: legacySources,
    operations: legacyAmbiguities.length > 0 ? [] : operations,
    product_docs: productDocs,
    uat_root: uatRoot
  };
  return productLayoutResult(layout, gaps, [], legacyAmbiguities);
}

export function redactProductEvidence(value) {
  const redactedFields = [];
  const redact = (item, keyPath = '') => {
    if (Array.isArray(item)) return item.map((entry, index) => redact(entry, `${keyPath}[${index}]`));
    if (item && typeof item === 'object') {
      return Object.fromEntries(Object.entries(item).map(([key, entry]) => {
        const nextPath = keyPath ? `${keyPath}.${key}` : key;
        if (isSensitiveKey(key) && entry !== null && entry !== undefined && entry !== '[REDACTED]') {
          redactedFields.push(nextPath);
          return [key, '[REDACTED]'];
        }
        return [key, redact(entry, nextPath)];
      }));
    }
    if (typeof item !== 'string') return item;
    const redacted = redactString(item);
    if (redacted !== item) redactedFields.push(keyPath || '<value>');
    return redacted;
  };

  const result = redact(value);
  return { value: result, redaction_applied: redactedFields.length > 0, redacted_fields: uniqueSorted(redactedFields) };
}

export function validateProductOrchestration(flow = {}, options = {}) {
  if (!isPlainObject(flow)) return ['product lifecycle flow must be an object'];
  if (!isPlainObject(options)) return ['product lifecycle validation options must be an object'];
  const errors = [];
  const validationPhase = options?.validationPhase ?? 'completed';
  if (!['preflight', 'completed'].includes(validationPhase)) errors.push('product lifecycle validationPhase must be preflight or completed');
  const completedValidation = validationPhase !== 'preflight';
  if (!Array.isArray(flow.stages)) return ['product lifecycle stages must be an array'];
  const malformedStageCount = flow.stages.filter((stage) => !isPlainObject(stage)).length;
  if (malformedStageCount > 0) errors.push('product lifecycle stage entries must be objects');
  const stages = flow.stages.filter(isPlainObject);
  const stageArrayFields = [
    'depends_on', 'planned_writes', 'planned_paths', 'actual_writes', 'actual_paths',
    'deleted_paths', 'allowed_paths'
  ];
  for (const stage of stages) {
    for (const field of stageArrayFields) {
      if (stage[field] !== undefined && !Array.isArray(stage[field])) {
        errors.push(`stage ${stage.id ?? '<missing>'} ${field} must be an array`);
      } else if (Array.isArray(stage[field]) && stage[field].some((value) => typeof value !== 'string' || value.trim() === '')) {
        errors.push(`stage ${stage.id ?? '<missing>'} ${field} must contain non-empty strings`);
      }
    }
  }
  if (errors.length > 0) return uniqueSorted(errors);
  const ids = stages.map((stage) => stage.id);
  const byId = new Map(stages.map((stage) => [stage.id, stage]));
  if (!flow.contract_id) errors.push('product lifecycle requires contract_id');
  if (!flow.frozen_contract_hash) errors.push('product lifecycle requires a frozen contract hash');
  if (new Set(ids).size !== ids.length) errors.push('product lifecycle stage IDs must be unique');

  for (const stage of stages) {
    if (!stage.id) errors.push('product lifecycle stage requires id');
    if (!stage.contract_hash) errors.push(`stage ${stage.id} requires a frozen contract hash`);
    if (stage.contract_hash !== flow.frozen_contract_hash) errors.push(`stage ${stage.id} uses a different frozen contract hash`);
    if (!['allow', 'deny'].includes(stage.write_policy)) errors.push(`stage ${stage.id} requires write_policy allow or deny`);
    const stageWrites = [
      ...(stage.planned_writes ?? []), ...(stage.planned_paths ?? []),
      ...(stage.actual_writes ?? []), ...(stage.actual_paths ?? []),
      ...(stage.deleted_paths ?? [])
    ];
    if (stage.write_policy === 'deny' && stageWrites.length > 0) errors.push(`stage ${stage.id} write_policy deny forbids reported writes`);
    for (const dependency of stage.depends_on ?? []) if (!byId.has(dependency)) errors.push(`stage ${stage.id} has missing dependency ${dependency}`);
  }

  if (hasDependencyCycle(stages)) errors.push('product lifecycle dependency cycle');

  const uniqueStage = (action, label = action) => {
    const matches = stages.filter((stage) => stage.action === action);
    if (matches.length !== 1) errors.push(`product lifecycle requires exactly one ${label} stage`);
    return matches[0];
  };
  const seed = uniqueStage('seed-from-approved-spec');
  const fanIn = uniqueStage('integration-fan-in', 'integration fan-in');
  const writeTail = uniqueStage('write-tail-complete', 'write-tail completion');
  const sync = uniqueStage('traceability-sync');
  const globalVerification = uniqueStage('global-verification', 'global verification');
  const audit = uniqueStage('audit-readonly');
  const ship = uniqueStage('ship', 'ship after audit');

  const behaviorStages = stages.filter((stage) => ['implementation', 'test-evidence'].includes(stage.action));
  if (!behaviorStages.some((stage) => stage.action === 'implementation')) errors.push('product lifecycle requires at least one implementation stage');
  if (!behaviorStages.some((stage) => stage.action === 'test-evidence')) errors.push('product lifecycle requires a test-evidence stage');
  if (seed) for (const stage of behaviorStages) if (!dependsTransitively(stage.id, seed.id, byId)) errors.push(`stage ${stage.id} must depend on the seeded product contract`);
  if (fanIn) for (const stage of behaviorStages) if (!dependsTransitively(fanIn.id, stage.id, byId)) errors.push(`fan-in must consume ${stage.id}`);
  if (seed && fanIn && !dependsTransitively(fanIn.id, seed.id, byId)) errors.push('integration fan-in must descend from the seeded product contract');

  if (writeTail && fanIn && !dependsTransitively(writeTail.id, fanIn.id, byId)) errors.push('write-tail completion must run after integration fan-in');

  if (sync && writeTail) {
    if (!dependsTransitively(sync.id, writeTail.id, byId)) errors.push('traceability-sync must run after write-tail completion');
    if (sync.owner !== 'integration') errors.push('traceability-sync must be integration-owned');
    if (sync.consumes_integrated_paths !== true) errors.push('traceability-sync must consume integrated changed paths');
    if (sync.consumes_test_evidence !== true) errors.push('traceability-sync must consume integrated test evidence');
    if ((sync.allowed_paths ?? []).length === 0) errors.push('traceability-sync requires a derived ledger write boundary');
    for (const allowedPath of sync.allowed_paths ?? []) {
      if (!isValidRepositoryPattern(allowedPath)) {
        errors.push(`traceability-sync allowed path must be repository-relative: ${allowedPath}`);
        continue;
      }
      const normalized = patternRoot(allowedPath);
      if (!isCanonicalProductLedgerPath(normalized)) errors.push(`traceability-sync may write only derived product ledger/index paths: ${allowedPath}`);
    }
  }

  if (globalVerification && sync) {
    if (!dependsTransitively(globalVerification.id, sync.id, byId)) errors.push('global verification must run after traceability-sync');
    if (globalVerification.write_policy !== 'deny') errors.push('global verification write_policy must be deny');
    if (completedValidation) {
      if (globalVerification.status !== 'PASS') errors.push('global verification must report PASS');
      if (!globalVerification.output_digest) errors.push('global verification requires an output digest');
      if (!flow.post_sync_state || globalVerification.associated_head_or_diff !== flow.post_sync_state) errors.push('global verification must be associated with the post-sync state');
    }
  }

  if (sync) {
    for (const stage of stages) {
      const writes = [
        ...(stage.planned_writes ?? []), ...(stage.planned_paths ?? []),
        ...(stage.actual_writes ?? []), ...(stage.actual_paths ?? []),
        ...(stage.deleted_paths ?? [])
      ];
      if (stage.id !== sync.id && stage.write_policy === 'allow' && !dependsTransitively(sync.id, stage.id, byId)) {
        errors.push(`traceability-sync must be the final write; stage ${stage.id} is not an ancestor of sync`);
      }
      if (stage.id !== sync.id && dependsTransitively(stage.id, sync.id, byId) && (stage.write_policy === 'allow' || writes.length > 0)) {
        errors.push(`late write after traceability-sync is forbidden: ${stage.id}`);
      }
    }
  }

  if (audit && globalVerification) {
    if (!dependsTransitively(audit.id, globalVerification.id, byId)) errors.push('audit-readonly must run after global verification');
    if (audit.write_policy !== 'deny') errors.push('audit-readonly write_policy must be deny');
    const auditPlanned = [...(audit.planned_writes ?? []), ...(audit.planned_paths ?? [])];
    const auditActual = [...(audit.actual_writes ?? []), ...(audit.actual_paths ?? [])];
    if (auditPlanned.length > 0 || (audit.allowed_paths ?? []).length > 0) errors.push('audit-readonly must have no planned or allowed writes');
    if (auditActual.length > 0 || (audit.deleted_paths ?? []).length > 0) errors.push('audit-readonly must report zero writes or deletions');
    if (audit.summary_refresh === true || audit.checkpoint_write === true) errors.push('audit-readonly must not refresh summaries or checkpoints');
    if (completedValidation) {
      if (!audit.before_status_digest || !audit.after_status_digest) errors.push('audit-readonly requires before/after status digests');
      else if (audit.before_status_digest !== audit.after_status_digest) errors.push('audit-readonly before/after status digests must match');
    }
  }

  if (ship && audit) {
    if (!dependsTransitively(ship.id, audit.id, byId)) errors.push('ship must depend on audit-readonly');
    if (ship.consumes_product_action !== 'audit-readonly') errors.push('ship must consume the audit-readonly product context');
  }

  if (audit) {
    for (const stage of stages.filter((candidate) => candidate.id !== audit.id && dependsTransitively(candidate.id, audit.id, byId))) {
      const writes = [
        ...(stage.planned_writes ?? []), ...(stage.planned_paths ?? []),
        ...(stage.actual_writes ?? []), ...(stage.actual_paths ?? []),
        ...(stage.deleted_paths ?? [])
      ];
      if (stage.write_policy === 'allow' || writes.length > 0) errors.push(`late write after audit-readonly is forbidden: ${stage.id}`);
    }
  }

  if (completedValidation) {
    if (!flow.post_sync_state || !flow.final_evidence_state) errors.push('product lifecycle requires post-sync and final evidence state identities');
    else if (flow.final_evidence_state !== flow.post_sync_state) errors.push('final global evidence must be associated with the post-sync state');
    if (globalVerification?.associated_head_or_diff && flow.final_evidence_state && globalVerification.associated_head_or_diff !== flow.final_evidence_state) {
      errors.push('final evidence state must match the global verification state');
    }
  }
  return uniqueSorted(errors);
}

function productSideEffectObservation(context) {
  const plannedWrites = Array.isArray(context.planned_writes) ? context.planned_writes : [];
  const plannedPaths = Array.isArray(context.planned_paths) ? context.planned_paths : [];
  const actualWrites = Array.isArray(context.actual_writes) ? context.actual_writes : [];
  const actualPaths = Array.isArray(context.actual_paths) ? context.actual_paths : [];
  return {
    ...context,
    action: context.product_action,
    planned_paths: [...plannedWrites, ...plannedPaths],
    actual_paths: [...actualWrites, ...actualPaths],
    allowed_paths: context.allowed_paths ?? [],
    normative_before: context.normative_before,
    normative_after: context.normative_after
  };
}

export function validateProductContext(context = {}, currentState = {}, options = {}) {
  if (!isPlainObject(context)) return ['product_context must be an object'];
  if (!isPlainObject(currentState)) currentState = {};
  const errors = [];
  const action = context.product_action;
  const authorityRequired = requiresProductAuthorization(context);
  errors.push(...validateProductAction(action, context));
  const shapeErrors = validateProductContextShape(context);
  errors.push(...shapeErrors);
  if (hasUnsafeProductContextShape(context)) return uniqueSorted(errors);

  if (!context.contract_id) errors.push('product_context requires contract_id');
  if (!context.feature_id) errors.push('product_context requires a stable feature_id');
  if (!SHA256_PATTERN.test(String(context.approved_spec_integrity_hash ?? ''))) errors.push('product_context requires approved_spec_integrity_hash SHA-256 authority binding');
  if (!isRepositoryRelativePath(context.approved_plan_path) || !String(context.approved_plan_path).startsWith('.sdcorejs/plans/') || !String(context.approved_plan_path).endsWith('.md')) {
    errors.push('product_context requires a repository-relative immutable approved_plan_path under .sdcorejs/plans/');
  }
  if (!SHA256_PATTERN.test(String(context.approved_plan_hash ?? ''))) errors.push('product_context requires approved_plan_hash SHA-256 authority binding');
  if (!SHA256_PATTERN.test(String(context.approved_plan_integrity_hash ?? ''))) errors.push('product_context requires approved_plan_integrity_hash SHA-256 authority binding');
  if (!Number.isInteger(context.requirement_revision) || context.requirement_revision < 1) errors.push('product_context requires a positive requirement_revision');
  const inactiveLifecycle = ['superseded', 'retired'].includes(context.feature_lifecycle);
  if (!Array.isArray(context.requirement_ids) || (context.requirement_ids.length === 0 && !inactiveLifecycle)) errors.push('product_context requires stable active requirement_ids unless the feature is explicitly superseded or retired');
  errors.push(...validateNormativeContextBinding(context));

  const sideEffects = validateActionSideEffects(
    productSideEffectObservation(context),
    { trusted_audit_proof: options?.trusted_audit_proof }
  );
  errors.push(...sideEffects.errors);

  if (context.rows?.length || context.verdict) {
    const readinessPolicy = context.readiness_policy ?? {};
    const derived = deriveFeatureVerdict(context.rows ?? [], {
      ...readinessPolicy,
      active_requirement_ids: context.requirement_ids ?? [],
      feature_lifecycle: context.feature_lifecycle
    }, {
      trusted_decision_authority: options?.trusted_decision_authority,
      context,
      current_state: currentState
    });
    for (const [index, row] of (context.rows ?? []).filter(isPlainObject).entries()) {
      const rowDerived = derived.requirements[index];
      if (!rowDerived) continue;
      if (!isMissing(row.verdict) && row.verdict !== rowDerived.verdict) {
        errors.push(`product_context row ${row.requirement_id ?? '<unknown>'} verdict ${row.verdict} contradicts derived verdict ${rowDerived.verdict}`);
      }
    }
    const hasBlockingGap = (context.gaps ?? []).some((gap) => gap.blocking === true) || (context.blockers ?? []).length > 0;
    const hasWarning = (context.gaps ?? []).some((gap) => gap.blocking !== true) || (context.warnings ?? []).length > 0;
    const expectedVerdict = hasBlockingGap
      ? 'BLOCKED'
      : derived.verdict === 'READY' && hasWarning
        ? 'READY_WITH_WARNINGS'
        : derived.verdict;
    if (context.verdict && context.verdict !== expectedVerdict) errors.push(`product_context verdict ${context.verdict} contradicts derived verdict ${expectedVerdict}`);
  }

  const readyClaim = ['READY', 'READY_WITH_WARNINGS'].includes(context.verdict);
  const rowIds = Array.isArray(context.rows) ? context.rows.map((row) => row?.requirement_id).filter((id) => !isMissing(id)) : [];
  if (new Set(rowIds).size !== rowIds.length) errors.push('product_context rows contain duplicate requirement IDs');
  if (!inactiveLifecycle && Array.isArray(context.requirement_ids) && !sameStringSet(rowIds, context.requirement_ids)) {
    const missingRows = context.requirement_ids.filter((id) => !rowIds.includes(id));
    const extraRows = rowIds.filter((id) => !context.requirement_ids.includes(id));
    errors.push(`active product_context row coverage must match every active requirement; missing: ${missingRows.join(', ') || 'none'}; extra: ${extraRows.join(', ') || 'none'}`);
  }
  if (authorityRequired && !isCompleteAuthorityApproval(context.approval)) {
    errors.push('product_context readiness or writes require complete approved authority');
  }
  if (authorityRequired) errors.push(...validateTrustedApprovedSpecAuthority(context, options?.trusted_authority));
  if (authorityRequired) errors.push(...validateTrustedRelevantPathState(context, currentState, options?.trusted_current_state));
  if (authorityRequired) errors.push(...validateTrustedProductLayoutState(context, options?.trusted_layout));
  if (readyClaim) errors.push(...validateTrustedExecutionAttestations(context, options?.trusted_execution_attestations));
  if (authorityRequired) errors.push(...validateFinalProductAuthorization(context, currentState, options?.final_authorization));
  if (authorityRequired && isPlainObject(context.validation)) {
    for (const field of ['action_errors', 'identity_errors', 'side_effect_errors', 'context_errors']) {
      if (Array.isArray(context.validation[field]) && context.validation[field].length > 0) {
        errors.push(`product_context validation.${field} contains validator errors: ${context.validation[field].join('; ')}`);
      }
    }
  }
  if (readyClaim && !(context.rows?.length)) errors.push(`${context.verdict} product_context requires derived requirement rows`);
  if (readyClaim && !context.evidence_current) errors.push(`${context.verdict} product_context requires current bound evidence`);
  if (readyClaim && ['stale', 'unknown'].includes(context.evidence_freshness)) errors.push(`${context.evidence_freshness} evidence cannot support ${context.verdict}`);

  const evidenceById = new Map((context.evidence ?? []).filter((record) => record?.evidence_id).map((record) => [record.evidence_id, record]));
  const uatById = new Map((context.uat_records ?? []).filter((record) => record?.uat_record_id).map((record) => [record.uat_record_id, record]));
  const evidenceIds = (context.evidence ?? []).map((record) => record?.evidence_id).filter((id) => !isMissing(id));
  const uatIds = (context.uat_records ?? []).map((record) => record?.uat_record_id).filter((id) => !isMissing(id));
  if (new Set(evidenceIds).size !== evidenceIds.length) errors.push('product_context evidence IDs must be unique');
  if (new Set(uatIds).size !== uatIds.length) errors.push('product_context UAT record IDs must be unique');
  for (const evidence of context.evidence ?? []) errors.push(...validateEvidenceRecord(evidence).map((error) => `product_context evidence ${evidence?.evidence_id ?? '<unknown>'}: ${error}`));
  for (const uatRecord of context.uat_records ?? []) errors.push(...validateUatRecord(uatRecord, context).map((error) => `product_context UAT ${uatRecord?.uat_record_id ?? '<unknown>'}: ${error}`));
  if (context.evidence_current !== null && context.evidence_current !== undefined) {
    errors.push(...validateEvidenceRecord(context.evidence_current).map((error) => `product_context evidence_current: ${error}`));
    const storedCurrent = evidenceById.get(context.evidence_current?.evidence_id);
    if (!storedCurrent) {
      errors.push('product_context evidence_current must reference a record in evidence');
    } else if (stableStringify(storedCurrent) !== stableStringify(context.evidence_current)) {
      errors.push('product_context evidence_current must exactly match its selected record in evidence');
    }
  }
  if (readyClaim) {
    for (const row of context.rows ?? []) {
      if (row.verification_status === 'passed') {
        const boundEvidence = (row.verification_evidence_ids ?? []).map((id) => evidenceById.get(id));
        const rowBindingErrors = boundEvidence
          .filter(isPlainObject)
          .flatMap((record) => validateRowEvidencePathBinding(row, record, context));
        errors.push(...rowBindingErrors.map((error) => `READY row ${row.requirement_id}: ${error}`));
        if (boundEvidence.length === 0 || boundEvidence.some((record) =>
          !isAcceptableVerificationEvidence(record, row.requirement_id)
          || record.contract_id !== context.contract_id
          || record.feature_id !== context.feature_id
          || record.requirement_revision !== context.requirement_revision
          || record.approved_spec_path !== context.approved_spec_path
          || record.approved_spec_hash !== context.approved_spec_hash
          || record.approved_spec_integrity_hash !== context.approved_spec_integrity_hash
          || record.approved_plan_path !== context.approved_plan_path
          || record.approved_plan_hash !== context.approved_plan_hash
          || record.approved_plan_integrity_hash !== context.approved_plan_integrity_hash
          || evaluateEvidenceFreshness(record, currentState).freshness !== 'current')
          || rowBindingErrors.length > 0) {
          errors.push(`READY row ${row.requirement_id} requires current accepted row-bound verification evidence`);
        }
      }
      if (rowRequiresUat(row, context.readiness_policy) && ['passed', 'waived', 'deferred'].includes(row.uat_status)) {
        const boundUat = (row.uat_record_ids ?? []).map((id) => uatById.get(id));
        if (boundUat.length === 0 || boundUat.some((record) => !record
          || record.status !== row.uat_status
          || !(record.requirement_ids ?? []).includes(row.requirement_id)
          || validateUatRecord(record, context).length > 0
          || evaluateUatFreshness(record, currentState).freshness !== 'current')) {
          errors.push(`READY row ${row.requirement_id} requires a current bound manual UAT record matching status ${row.uat_status}`);
        }
        const latestUat = (context.uat_records ?? [])
          .filter((record) => (record.requirement_ids ?? []).includes(row.requirement_id) && validateUatRecord(record, context).length === 0)
          .sort(compareUatRecordsNewestFirst)[0];
        if (!latestUat || latestUat.status !== row.uat_status || !(row.uat_record_ids ?? []).includes(latestUat.uat_record_id)) {
          errors.push(`READY row ${row.requirement_id} must bind the latest matching UAT execution`);
        }
        if (['waived', 'deferred'].includes(row.uat_status)) {
          if (!isCompleteUatDecision(row.uat_approval)) errors.push(`READY row ${row.requirement_id} requires a complete UAT ${row.uat_status} approval decision`);
          if (!latestUat || !isCompleteUatDecision(latestUat.decision) || latestUat.decision.status !== row.uat_status) {
            errors.push(`READY row ${row.requirement_id} requires a complete matching UAT decision record`);
          } else if (!approvalDecisionsMatch(row.uat_approval, latestUat.decision)) {
            errors.push(`READY row ${row.requirement_id} UAT approval must match the bound decision record`);
          }
        }
      }
      if (rowRequiresUat(row, context.readiness_policy) && row.uat_status === 'not_applicable'
        && (!isCompleteUatDecision(row.uat_approval) || row.uat_approval.status !== row.uat_status)) {
        errors.push(`READY row ${row.requirement_id} requires a complete UAT not_applicable approval decision`);
      }
    }
  }

  if (containsRawSensitiveValue({
    normative_before: context.normative_before ?? null,
    normative_after: context.normative_after ?? null,
    changes: context.changes ?? null,
    status: context.status ?? null,
    rows: context.rows ?? [],
    evidence: context.evidence ?? [],
    evidence_current: context.evidence_current ?? null,
    uat_result: context.uat_result ?? null,
    uat_records: context.uat_records ?? [],
    gaps: context.gaps ?? [],
    blockers: context.blockers ?? [],
    warnings: context.warnings ?? []
  })) errors.push('product_context reportable state contains an unredacted secret or PII value');

  if (context.redaction) {
    const requiresSecretScan = readyClaim
      || context.write_authorized === true
      || (context.actual_writes ?? []).length > 0
      || (context.evidence ?? []).length > 0
      || (context.uat_records ?? []).length > 0;
    if (requiresSecretScan ? context.redaction.secret_scan !== 'passed' : !['passed', 'not_applicable'].includes(context.redaction.secret_scan)) errors.push('product_context redaction secret_scan must pass before persistence or readiness');
    if (context.redaction.pii_redacted !== true) errors.push('product_context redaction requires pii_redacted: true');
    if (context.redaction.logs_sanitized !== true) errors.push('product_context redaction requires logs_sanitized: true');
  }

  const activeCandidates = context.layout?.active_candidates ?? [];
  if (activeCandidates.length > 1) errors.push('product_context active ledger candidates are ambiguous');
  if (readyClaim && activeCandidates.length !== 1) errors.push(`${context.verdict} product_context requires exactly one active ledger candidate`);
  if (context.layout?.current_path && context.active_ledger_path !== context.layout.current_path) errors.push('product_context active_ledger_path must equal layout.current_path');
  if (context.feature_lifecycle && context.status?.feature_lifecycle && context.feature_lifecycle !== context.status.feature_lifecycle) errors.push('product_context feature_lifecycle contradicts status.feature_lifecycle');

  for (const conflict of context.conflicting_contract_paths ?? []) {
    if (conflict.contract_id !== context.contract_id && pathsEqual(conflict.path, context.active_ledger_path, process.platform === 'win32')) {
      errors.push(`active ledger collision between contracts ${conflict.contract_id} and ${context.contract_id}`);
    }
  }

  if (context.evidence_current) {
    const freshness = evaluateEvidenceFreshness(context.evidence_current, currentState);
    if (context.evidence_freshness && context.evidence_freshness !== freshness.freshness) errors.push('product_context evidence freshness contradicts the deterministic result');
    if (readyClaim && freshness.freshness !== 'current') {
      const detail = freshness.reasons.length > 0 ? `: ${freshness.reasons.join('; ')}` : '';
      errors.push(`${freshness.freshness} deterministic evidence cannot support ${context.verdict}${detail}`);
    }
  }

  return uniqueSorted(errors);
}

function readiness(verdict, statuses, blockers, warnings, gaps) {
  return { verdict, statuses, blockers: uniqueSorted(blockers), warnings: uniqueSorted(warnings), gaps };
}

function defaultReadinessStatuses() {
  return {
    requirement: 'draft',
    implementation: 'unknown',
    verification: 'unverified',
    uat: 'not_run',
    evidence_freshness: 'unknown'
  };
}

function validateCanonicalTraceabilityRow(row) {
  const errors = [];
  requireOwnFields(row, TRACEABILITY_ROW_FIELDS, 'traceability row', errors);
  rejectUnknownFields(row, TRACEABILITY_ROW_FIELDS, 'traceability row', errors);
  if (!isPlainObject(row)) return uniqueSorted(errors);
  if (Object.hasOwn(row, 'statuses')) {
    errors.push('traceability row nested statuses are not allowed; use the canonical flat status fields');
  }
  if (typeof row.requirement_id !== 'string' || row.requirement_id.trim() === '') {
    errors.push('traceability row requirement_id must be a non-empty string');
  }
  if (typeof row.required !== 'boolean') errors.push('traceability row required must be a boolean');
  errors.push(...validateCanonicalAnchoredRepositoryRef(row.source_ref, 'traceability row source_ref'));
  if (!SHA256_PATTERN.test(String(row.source_hash ?? ''))) errors.push('traceability row source_hash must be SHA-256');
  if (typeof row.uat_required !== 'boolean') errors.push('traceability row uat_required must be a boolean');
  if (!VERDICT_PRIORITY.includes(row.verdict)) errors.push('traceability row verdict must be a canonical derived verdict');
  for (const field of ['implementation_refs', 'verification_evidence_ids', 'uat_record_ids', 'gaps']) {
    if (!Array.isArray(row[field])) errors.push(`traceability row ${field} must be an array`);
  }
  if (Array.isArray(row.implementation_refs)) {
    if (row.implementation_refs.some((reference) => !isRepositoryRef(reference))) {
      errors.push('traceability row implementation_refs must contain repository-relative refs');
    }
    if (new Set(row.implementation_refs).size !== row.implementation_refs.length) errors.push('traceability row implementation_refs must be unique');
  }
  for (const field of ['verification_evidence_ids', 'uat_record_ids']) {
    if (Array.isArray(row[field])) {
      if (row[field].some((id) => typeof id !== 'string' || id.trim() === '')) errors.push(`traceability row ${field} must contain non-empty string IDs`);
      if (new Set(row[field]).size !== row[field].length) errors.push(`traceability row ${field} must be unique`);
    }
  }
  if (Array.isArray(row.gaps) && row.gaps.some((gap) => !isPlainObject(gap))) {
    errors.push('traceability row gaps must contain objects');
  }
  for (const [dimension, statusField, approvalField] of [
    ['implementation', 'implementation_status', 'implementation_approval'],
    ['verification', 'verification_status', 'verification_approval']
  ]) {
    const approval = row[approvalField];
    if (approval !== null && !isPlainObject(approval)) errors.push(`traceability row ${approvalField} must be an object or null`);
    if (row[statusField] !== 'not_applicable' && approval !== null) {
      errors.push(`traceability row ${approvalField} must be null unless ${dimension}_status is not_applicable`);
    }
  }
  if (row.uat_approval !== null && !isPlainObject(row.uat_approval)) errors.push('traceability row uat_approval must be an object or null');
  if (!['waived', 'deferred', 'not_applicable'].includes(row.uat_status) && row.uat_approval !== null) {
    errors.push('traceability row uat_approval must be null unless uat_status is waived, deferred, or not_applicable');
  }
  return uniqueSorted(errors);
}

function validateCanonicalAnchoredRepositoryRef(value, label) {
  const errors = [];
  if (typeof value !== 'string') return [`${label} must use canonical <repository-path>#<anchor> form`];
  const separator = value.indexOf('#');
  if (separator <= 0 || separator !== value.lastIndexOf('#') || separator === value.length - 1) {
    return [`${label} must use canonical <repository-path>#<anchor> form`];
  }
  const anchor = value.slice(separator + 1);
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(anchor)) errors.push(`${label} anchor is invalid`);
  repositoryRefPath(value, label, errors);
  return uniqueSorted(errors);
}

function validateTraceabilityInput(input) {
  if (!isPlainObject(input)) return ['traceability input must be an object'];
  const errors = [];
  const collections = [
    ['requirements', input.requirements ?? []],
    ['implementation_artifacts', input.implementation_artifacts ?? []],
    ['test_artifacts', input.test_artifacts ?? []],
    ['evidence_records', input.evidence_records ?? []],
    ['uat_records', input.uat_records ?? []]
  ];
  for (const [field, values] of collections) {
    if (!Array.isArray(values)) {
      errors.push(`traceability ${field} must be an array`);
      continue;
    }
    if (values.some((value) => !isPlainObject(value))) errors.push(`traceability ${field} entries must be objects`);
  }
  if (Object.hasOwn(input, 'current_state') && !isPlainObject(input.current_state)) {
    errors.push('traceability current_state must be an object');
  }
  for (const artifact of Array.isArray(input.implementation_artifacts) ? input.implementation_artifacts.filter(isPlainObject) : []) {
    for (const field of ['requirement_ids', 'supports']) {
      if (artifact[field] !== undefined && !Array.isArray(artifact[field])) errors.push(`traceability implementation artifact ${field} must be an array`);
    }
    if (artifact.observable_behavior !== undefined && typeof artifact.observable_behavior !== 'boolean') {
      errors.push('traceability implementation artifact observable_behavior must be a boolean when supplied');
    }
  }
  for (const artifact of Array.isArray(input.test_artifacts) ? input.test_artifacts.filter(isPlainObject) : []) {
    for (const field of ['requirement_ids', 'control_requirement_ids', 'assertions', 'evidence_ids']) {
      if (artifact[field] !== undefined && !Array.isArray(artifact[field])) errors.push(`traceability test artifact ${field} must be an array`);
    }
  }
  for (const record of Array.isArray(input.uat_records) ? input.uat_records.filter(isPlainObject) : []) {
    if (record.requirement_ids !== undefined && !Array.isArray(record.requirement_ids)) errors.push('traceability UAT record requirement_ids must be an array');
  }
  return uniqueSorted(errors);
}

function blockedTraceability(errors) {
  const validationErrors = uniqueSorted(errors);
  return {
    requirements: [],
    artifacts: [],
    gaps: validationErrors.map((reason) => ({
      type: 'invalid_traceability_input',
      blocking: true,
      reason
    })),
    rows: [],
    verdict: 'BLOCKED',
    validation_errors: validationErrors
  };
}

function validateProductLayoutInput(input) {
  if (!isPlainObject(input)) return ['product layout input must be an object'];
  const errors = [];
  for (const field of ['feature_id', 'slug', 'contract_id']) {
    if (input[field] !== undefined && input[field] !== null && typeof input[field] !== 'string') errors.push(`product layout ${field} must be text`);
  }
  if (Object.hasOwn(input, 'existing_layout') && input.existing_layout !== null && !isPlainObject(input.existing_layout)) {
    errors.push('product layout existing_layout must be an object or null');
  }
  const existingLayout = isPlainObject(input.existing_layout) ? input.existing_layout : null;
  if (existingLayout) {
    for (const field of ['root', 'prd_path', 'stories_path', 'acceptance_path', 'uat_path', 'decisions_path', 'compact_path', 'ledger_root', 'current_path', 'history_root', 'uat_root']) {
      if (existingLayout[field] !== undefined && existingLayout[field] !== null && typeof existingLayout[field] !== 'string') errors.push(`product layout existing_layout.${field} must be text or null`);
    }
    if (existingLayout.product_docs !== undefined && !isPlainObject(existingLayout.product_docs)) {
      errors.push('product layout existing_layout.product_docs must be an object');
    } else if (isPlainObject(existingLayout.product_docs)) {
      for (const [field, value] of Object.entries(existingLayout.product_docs)) {
        if (value !== null && typeof value !== 'string') errors.push(`product layout existing_layout.product_docs.${field} must be text or null`);
      }
    }
  }
  const legacy = input.legacy_ledgers ?? [];
  if (!Array.isArray(legacy)) {
    errors.push('product layout legacy_ledgers must be an array');
  } else {
    for (const item of legacy) {
      if (!isPlainObject(item)) {
        errors.push('product layout legacy_ledgers entries must be objects');
        continue;
      }
      if (typeof item.path !== 'string' || item.path.trim() === '') errors.push('product layout legacy ledger path must be non-empty text');
      if (item.contract_id !== undefined && item.contract_id !== null && typeof item.contract_id !== 'string') errors.push('product layout legacy ledger contract_id must be text or null');
      if (item.attribution !== undefined && item.attribution !== null && !isPlainObject(item.attribution)) errors.push('product layout legacy ledger attribution must be an object or null');
    }
  }
  return uniqueSorted(errors);
}

function blockedProductLayout(errors) {
  return productLayoutResult({
    active_candidates: [],
    contract_key: null,
    current_path: null,
    doc_layout: 'blocked',
    history_paths: [],
    history_root: null,
    ledger_root: null,
    legacy_sources: [],
    operations: [],
    product_docs: emptyProductDocs(),
    uat_root: null
  }, [], uniqueSorted(errors), []);
}

function emptyProductDocs() {
  return {
    acceptance_path: null,
    compact_path: null,
    decisions_path: null,
    prd_path: null,
    root: null,
    stories_path: null,
    uat_path: null
  };
}

function productLayoutResult(layout, gaps = [], validationErrors = [], legacyAmbiguities = []) {
  const result = {
    gaps: structuredClone(gaps),
    layout,
    validation_errors: uniqueSorted(validationErrors)
  };
  const aliases = {};
  for (const field of Object.keys(layout)) {
    aliases[field] = {
      enumerable: false,
      configurable: false,
      get: () => layout[field]
    };
  }
  aliases.legacy_ambiguities = {
    enumerable: false,
    configurable: false,
    value: structuredClone(legacyAmbiguities),
    writable: false
  };
  Object.defineProperties(result, aliases);
  return result;
}

function clone(value) {
  return structuredClone(value);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isMissing(value) {
  return value === undefined || value === null || value === '';
}

function requireOwnFields(value, fields, label, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${label} must be an object`);
    return;
  }
  for (const field of fields) {
    if (!Object.hasOwn(value, field)) errors.push(`${label} requires ${field}`);
  }
}

function rejectUnknownFields(value, fields, label, errors) {
  if (!isPlainObject(value)) return;
  const allowed = new Set(fields);
  for (const field of Object.keys(value)) {
    if (!allowed.has(field)) errors.push(`${label} closed schema has unknown field ${field}`);
  }
}

function isRepositoryRelativePath(value) {
  if (isMissing(value)) return false;
  try {
    normalizeRelative(value);
    return true;
  } catch {
    return false;
  }
}

function validateApprovedPlanIdentity(value, label) {
  const errors = [];
  if (!isPlainObject(value)) return [`${label} approved plan identity must be an object`];
  if (!isRepositoryRelativePath(value.approved_plan_path)
    || !String(value.approved_plan_path).startsWith('.sdcorejs/plans/')
    || !String(value.approved_plan_path).endsWith('.md')) {
    errors.push(`${label} approved_plan_path must identify an immutable snapshot under .sdcorejs/plans/`);
  }
  if (!SHA256_PATTERN.test(String(value.approved_plan_hash ?? ''))) errors.push(`${label} approved_plan_hash must be SHA-256`);
  if (!SHA256_PATTERN.test(String(value.approved_plan_integrity_hash ?? ''))) errors.push(`${label} approved_plan_integrity_hash must be SHA-256`);
  return errors;
}

function isCompleteNormativeSnapshot(value) {
  if (!isPlainObject(value)
    || isMissing(value.contract_id)
    || !Number.isInteger(value.requirement_revision)
    || value.requirement_revision < 1
    || !isRepositoryRelativePath(value.approved_spec_path)
    || isMissing(value.approved_spec_hash)
    || !Array.isArray(value.retired_requirement_ids)) return false;
  if (!Array.isArray(value.requirements) && !Array.isArray(value.requirement_ids) && !isPlainObject(value.requirement_field_hashes)) return false;
  const representations = normativeRequirementIdRepresentations(value);
  const activeIds = representations[0] ?? [];
  if (activeIds.length === 0 || activeIds.some((id) => typeof id !== 'string' || id.trim() === '') || new Set(activeIds).size !== activeIds.length) return false;
  if (representations.some((ids) => ids.length === 0 || ids.some((id) => typeof id !== 'string' || id.trim() === '') || !sameStringSet(ids, activeIds))) return false;
  if (value.retired_requirement_ids.some((id) => typeof id !== 'string' || id.trim() === '') || new Set(value.retired_requirement_ids).size !== value.retired_requirement_ids.length) return false;
  return !activeIds.some((id) => value.retired_requirement_ids.includes(id));
}

function validateNormativeSnapshotShape(value, label) {
  const errors = [];
  if (!isPlainObject(value)) return [`${label} must be an object`];
  rejectUnknownFields(value, NORMATIVE_SNAPSHOT_FIELDS, label, errors);
  if (Array.isArray(value.requirements)) {
    for (const [index, requirement] of value.requirements.entries()) {
      if (!isPlainObject(requirement)) {
        errors.push(`${label}.requirements[${index}] must be an object`);
        continue;
      }
      rejectUnknownFields(requirement, NORMATIVE_REQUIREMENT_FIELDS, `${label}.requirements[${index}]`, errors);
      if (isMissing(requirement.id)) errors.push(`${label}.requirements[${index}] requires id`);
      if (requirement.source_hash !== undefined && !SHA256_PATTERN.test(String(requirement.source_hash ?? ''))) {
        errors.push(`${label}.requirements[${index}].source_hash must be SHA-256`);
      }
    }
  }
  for (const field of ['requirement_field_hashes', 'requirement_source_hashes']) {
    if (value[field] === undefined) continue;
    if (!isPlainObject(value[field])) {
      errors.push(`${label}.${field} must be an object`);
      continue;
    }
    for (const [requirementId, hashValue] of Object.entries(value[field])) {
      if (isPlainObject(hashValue)) {
        for (const [nestedField, nestedHash] of Object.entries(hashValue)) {
          if (!SHA256_PATTERN.test(String(nestedHash ?? ''))) errors.push(`${label}.${field}.${requirementId}.${nestedField} must be SHA-256`);
        }
      } else if (!SHA256_PATTERN.test(String(hashValue ?? ''))) {
        errors.push(`${label}.${field}.${requirementId} must be SHA-256`);
      }
    }
  }
  return uniqueSorted(errors);
}

function validateProductGapShape(gap, label) {
  const errors = [];
  if (!isPlainObject(gap)) return [`${label} must be an object`];
  rejectUnknownFields(gap, PRODUCT_GAP_FIELDS, label, errors);
  if (isMissing(gap.type)) errors.push(`${label} requires type`);
  if (typeof gap.blocking !== 'boolean') errors.push(`${label} requires boolean blocking`);
  for (const field of ['observed_paths', 'details', 'evidence_ids']) {
    if (gap[field] !== undefined && !Array.isArray(gap[field])) errors.push(`${label}.${field} must be an array`);
  }
  return uniqueSorted(errors);
}

function normativeRequirementIds(snapshot = {}) {
  return normativeRequirementIdRepresentations(snapshot)[0] ?? [];
}

function normativeRequirementIdRepresentations(snapshot = {}) {
  const representations = [];
  if (Array.isArray(snapshot.requirement_ids)) representations.push(snapshot.requirement_ids);
  if (Array.isArray(snapshot.requirements)) representations.push(snapshot.requirements.map((requirement) => requirement?.id));
  if (isPlainObject(snapshot.requirement_field_hashes)) representations.push(Object.keys(snapshot.requirement_field_hashes));
  return representations;
}

function validateNormativeContextBinding(context = {}) {
  const before = context.normative_before;
  const after = context.normative_after;
  const errors = [];
  const action = context.product_action;
  if (isPlainObject(after)) validateNormativeSnapshotAgainstContext(after, context, 'normative_after', errors);
  if (DERIVED_ACTIONS.has(action) && isPlainObject(before)) validateNormativeSnapshotAgainstContext(before, context, 'normative_before', errors);
  if (!isCompleteNormativeSnapshot(before) || !isCompleteNormativeSnapshot(after)) return uniqueSorted(errors);

  if (['requirements-update', 'supersede-feature'].includes(action)) {
    if (before.contract_id !== context.contract_id) errors.push('product_context normative_before contract_id does not match the active contract');
    if (before.requirement_revision !== context.supersedes) errors.push('product_context normative_before revision must match supersedes');
    const previous = {
      contract_id: before.contract_id,
      feature_id: context.feature_id,
      requirement_revision: before.requirement_revision,
      requirement_ids: normativeRequirementIds(before),
      retired_requirement_ids: before.retired_requirement_ids,
      approved_spec_path: before.approved_spec_path,
      approved_spec_hash: before.approved_spec_hash
    };
    const next = {
      contract_id: context.contract_id,
      feature_id: context.feature_id,
      requirement_revision: context.requirement_revision,
      requirement_ids: context.requirement_ids,
      retired_requirement_ids: context.retired_requirement_ids,
      supersedes: context.supersedes,
      change_reason: context.change_reason,
      approval: context.approval,
      approved_spec_path: context.approved_spec_path,
      approved_spec_hash: context.approved_spec_hash
    };
    errors.push(...validateIdentityTransition(previous, next, { action }).map((error) => `product_context identity transition: ${error}`));
  }
  return uniqueSorted(errors);
}

function validateNormativeSnapshotAgainstContext(snapshot, context, label, errors) {
  if (snapshot.contract_id !== context.contract_id) errors.push(`product_context ${label} contract_id does not match contract_id`);
  if (snapshot.requirement_revision !== context.requirement_revision) errors.push(`product_context ${label} requirement_revision does not match requirement_revision`);
  if (snapshot.approved_spec_path !== context.approved_spec_path) errors.push(`product_context ${label} approved spec path does not match approved_spec_path`);
  if (snapshot.approved_spec_hash !== context.approved_spec_hash) errors.push(`product_context ${label} approved spec hash does not match approved_spec_hash`);
  if (!sameStringSet(normativeRequirementIds(snapshot), context.requirement_ids)) errors.push(`product_context ${label} active requirement IDs do not match requirement_ids`);
  if (!sameStringSet(snapshot.retired_requirement_ids, context.retired_requirement_ids)) errors.push(`product_context ${label} retired requirement IDs do not match retired_requirement_ids`);
}

function sameStringSet(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right)) return false;
  return stableStringify([...left].sort()) === stableStringify([...right].sort());
}

function isCompleteAuthorityApproval(value) {
  return isPlainObject(value)
    && value.approved === true
    && ['approved_by', 'approved_at', 'approval_source'].every((field) => !isMissing(value[field]));
}

function validateTrustedApprovedSpecAuthority(context, authority) {
  if (!isPlainObject(authority) || !TRUSTED_APPROVED_SPEC_AUTHORITIES.has(authority)) {
    return ['product_context requires trusted file-backed approved-spec authority'];
  }
  const errors = [];
  if (authority.verified !== true || authority.errors.length > 0) errors.push('trusted approved-spec authority is not verified');
  if (authority.contract_id !== context.contract_id) errors.push('trusted approved-spec authority contract binding does not match product_context');
  if (authority.feature_id !== context.feature_id) errors.push('trusted approved-spec authority feature binding does not match product_context');
  if (authority.requirement_revision !== context.requirement_revision) errors.push('trusted approved-spec authority revision binding does not match product_context');
  if (!sameStringSet(authority.requirement_ids, context.requirement_ids)) errors.push('trusted approved-spec authority requirement ID binding does not match product_context');
  let contextSpecPath = null;
  try {
    contextSpecPath = normalizeRelative(context.approved_spec_path);
  } catch {
    errors.push('trusted approved-spec authority cannot bind an invalid product_context approved_spec_path');
  }
  if (contextSpecPath !== null && authority.approved_spec_path !== contextSpecPath) errors.push('trusted approved-spec authority path binding does not match product_context');
  if (authority.approved_spec_hash !== context.approved_spec_hash) errors.push('trusted approved-spec authority hash binding does not match product_context');
  if (authority.approved_spec_integrity_hash !== context.approved_spec_integrity_hash) errors.push('trusted approved-spec authority integrity binding does not match product_context');
  const approvedRequirements = authority.requirements ?? [];
  const approvedRequirementFieldHashes = authority.requirement_field_hashes ?? {};
  const approvedRequirementSourceHashes = authority.requirement_source_hashes ?? {};
  for (const [label, snapshot] of [
    ['normative_after', context.normative_after],
    ...(DERIVED_ACTIONS.has(context.product_action) ? [['normative_before', context.normative_before]] : [])
  ]) {
    if (Array.isArray(snapshot?.requirements)
      && stableStringify(snapshot.requirements) !== stableStringify(approvedRequirements)) {
      errors.push(`trusted approved-spec authority ${label} requirements do not match the approved snapshot projection`);
    }
    if (!isPlainObject(snapshot?.requirement_field_hashes)) {
      errors.push(`trusted approved-spec authority requires ${label}.requirement_field_hashes`);
    } else if (stableStringify(snapshot.requirement_field_hashes) !== stableStringify(approvedRequirementFieldHashes)) {
      errors.push(`trusted approved-spec authority ${label} requirement field hashes do not match the approved snapshot`);
    }
    if (!isPlainObject(snapshot?.requirement_source_hashes)) {
      errors.push(`trusted approved-spec authority requires ${label}.requirement_source_hashes`);
    } else if (stableStringify(snapshot.requirement_source_hashes) !== stableStringify(approvedRequirementSourceHashes)) {
      errors.push(`trusted approved-spec authority ${label} requirement source hashes do not match the approved snapshot`);
    }
  }
  const approvedRequirementsById = new Map(approvedRequirements.map((requirement) => [requirement.id, requirement]));
  for (const row of Array.isArray(context.rows) ? context.rows.filter(isPlainObject) : []) {
    const approvedRequirement = approvedRequirementsById.get(row.requirement_id);
    if (!approvedRequirement) continue;
    for (const field of ['required', 'source_ref', 'source_hash', 'requirement_status', 'uat_required']) {
      if (row[field] !== approvedRequirement[field]) {
        errors.push(`trusted approved-spec authority row ${row.requirement_id} ${field} does not match the approved requirement projection`);
      }
    }
  }
  if (!absolutePathsEqual(authority.repository_root, context.target?.repo_root)) errors.push('trusted approved-spec authority repository binding does not match product_context');
  if (!isCompleteAuthorityApproval(context.approval)) {
    errors.push('trusted approved-spec authority requires complete product_context approval metadata');
  } else {
    for (const [authorityField, contextField] of [
      ['approved_by', 'approved_by'],
      ['approved_at', 'approved_at'],
      ['approval_source', 'approval_source']
    ]) {
      if (authority.approval[authorityField] !== context.approval[contextField]) {
        errors.push(`trusted approved-spec authority ${contextField} binding does not match product_context`);
      }
    }
  }
  return uniqueSorted(errors);
}

function validateTrustedAuditReadonlyState(observation, proof) {
  if (!isPlainObject(proof) || !TRUSTED_AUDIT_READONLY_STATES.has(proof)) {
    return ['audit-readonly requires an opaque one-shot parent-observed zero-write proof'];
  }
  TRUSTED_AUDIT_READONLY_STATES.delete(proof);
  const errors = [];
  if (proof.verified !== true || proof.errors.length > 0) errors.push('audit-readonly zero-write proof is not verified');
  if (proof.request_digest !== digest(stableStringify(observation))) errors.push('audit-readonly zero-write proof request binding does not match');
  if (proof.before_status_digest !== observation.before_status_digest
    || proof.after_status_digest !== observation.after_status_digest) {
    errors.push('audit-readonly zero-write proof status binding does not match');
  }
  if (observation.target?.repo_root !== undefined
    && !absolutePathsEqual(proof.repository_root, observation.target.repo_root)) {
    errors.push('audit-readonly zero-write proof repository binding does not match');
  }
  return uniqueSorted(errors);
}

function validateFinalProductAuthorization(context, currentState, authorization) {
  if (!isPlainObject(authorization) || !TRUSTED_FINAL_PRODUCT_AUTHORIZATIONS.has(authorization)) {
    return ['product_context readiness or writes require one-shot async final file-backed authorization'];
  }
  const errors = [];
  if (authorization.verified !== true) errors.push('final product authorization is not verified');
  if (authorization.context_digest !== digest(stableStringify(context))) errors.push('final product authorization context binding does not match');
  if (authorization.current_state_digest !== digest(stableStringify(currentState))) errors.push('final product authorization current-state binding does not match');
  for (const field of ['approved_spec_path', 'approved_spec_hash', 'approved_spec_integrity_hash']) {
    if (authorization[field] !== context[field] || authorization[field] !== currentState[field]) {
      errors.push(`final product authorization ${field} binding does not match product_context and current state`);
    }
  }
  for (const field of APPROVED_PLAN_IDENTITY_FIELDS) {
    if (authorization[field] !== context[field] || authorization[field] !== currentState[field]) {
      errors.push(`final product authorization ${field} binding does not match product_context and current state`);
    }
  }
  if (authorization.uat_state_hash !== claimedUatStateHash(context, currentState)) errors.push('final product authorization trusted UAT current-state binding does not match');
  if (authorization.execution_attestation_hash !== executionClaimHash(context)) errors.push('final product authorization execution-attestation binding does not match');
  if (!absolutePathsEqual(authorization.repository_root, context.target?.repo_root)) errors.push('final product authorization repository binding does not match');
  return uniqueSorted(errors);
}

function validateTrustedExecutionAttestations(context, attestation) {
  if (!isPlainObject(attestation) || !TRUSTED_EXECUTION_ATTESTATIONS.has(attestation)) {
    return ['READY product_context requires one-shot parent-observed execution attestations'];
  }
  const errors = [];
  const claim = readyExecutionClaim(context);
  if (attestation.verified !== true || attestation.errors.length > 0) errors.push('trusted execution attestations are not verified');
  if (!sameStringSet(attestation.automated_evidence_ids, claim.automated_ids)) errors.push('trusted automated execution attestation coverage does not match READY rows');
  if (!sameStringSet(attestation.manual_uat_record_ids, claim.manual_uat_ids)) errors.push('trusted manual UAT execution attestation coverage does not match READY rows');
  if (attestation.attestation_hash !== executionClaimHash(context)) errors.push('trusted execution attestation hash does not match READY evidence and UAT claims');
  return uniqueSorted(errors);
}

function validateTrustedRelevantPathState(context, currentState, observation) {
  if (!isPlainObject(observation) || !TRUSTED_RELEVANT_PATH_STATES.has(observation)) {
    return ['product_context readiness or writes require a trusted file-backed relevant-path and UAT current-state observation'];
  }
  const errors = [];
  if (observation.verified !== true || observation.errors.length > 0) errors.push('trusted relevant-path current-state observation is not verified');
  if (!absolutePathsEqual(observation.repository_root, context.target?.repo_root)) errors.push('trusted relevant-path observation repository binding does not match product_context');
  const currentManifest = validateRelevantPathManifest(currentState, { requireNonEmpty: true });
  errors.push(...currentManifest.errors.map((error) => `current state ${error}`));
  if (!sameStringSet(observation.relevant_paths, currentState.relevant_paths)) errors.push('trusted relevant-path observation path set does not match current state');
  if (stableStringify(observation.relevant_path_hashes) !== stableStringify(currentState.relevant_path_hashes)) errors.push('trusted relevant-path observation per-file hashes do not match current state');
  if (observation.relevant_paths_hash !== currentState.relevant_paths_hash) errors.push('trusted relevant-path observation aggregate hash does not match current state');
  const expectedScenarioRefs = collectUatScenarioRefs(context);
  const observedScenarioHashes = isPlainObject(observation.uat_scenario_hashes) ? observation.uat_scenario_hashes : {};
  const claimedScenarioHashes = isPlainObject(currentState.uat_scenario_hashes) ? currentState.uat_scenario_hashes : {};
  if (!sameStringSet(Object.keys(observedScenarioHashes), expectedScenarioRefs)) errors.push('trusted UAT scenario observation does not cover the exact product_context source refs');
  if (expectedScenarioRefs.length > 0 && !isPlainObject(currentState.uat_scenario_hashes)) errors.push('current state requires a canonical UAT scenario hash map');
  if (!sameStringSet(Object.keys(claimedScenarioHashes), expectedScenarioRefs)) errors.push('current state UAT scenario hash keys do not match the exact product_context source refs');
  if (stableStringify(observedScenarioHashes) !== stableStringify(claimedScenarioHashes)) errors.push('trusted UAT scenario file hashes do not match current state');
  if (expectedScenarioRefs.length > 0) {
    if (typeof observation.uat_build_or_revision !== 'string' || observation.uat_build_or_revision.length === 0) errors.push('trusted UAT build identity observation is missing');
    if (typeof currentState.uat_build_or_revision !== 'string' || currentState.uat_build_or_revision.length === 0) errors.push('current state UAT build identity is missing');
    if (observation.uat_build_or_revision !== currentState.uat_build_or_revision) errors.push('trusted UAT build identity does not match current state');
  }
  if (observation.uat_state_hash !== claimedUatStateHash(context, currentState)) errors.push('trusted UAT observation aggregate does not match current state');
  return uniqueSorted(errors);
}

function validateTrustedProductLayoutState(context, observation) {
  if (!isPlainObject(observation) || !TRUSTED_PRODUCT_LAYOUT_STATES.has(observation)) {
    return ['product_context readiness or writes require a trusted file-backed layout observation'];
  }
  const errors = [];
  if (observation.verified !== true || observation.errors.length > 0) errors.push('trusted file-backed product layout observation is not verified');
  if (!absolutePathsEqual(observation.repository_root, context.target?.repo_root)) errors.push('trusted product layout repository binding does not match product_context');
  if (observation.contract_id !== context.contract_id) errors.push('trusted product layout contract binding does not match product_context');
  if (observation.feature_id !== context.feature_id) errors.push('trusted product layout feature binding does not match product_context');
  const claimedCandidates = Array.isArray(context.layout?.active_candidates) ? context.layout.active_candidates : [];
  if (!sameStringSet(observation.active_candidates, claimedCandidates)) errors.push('product_context active ledger candidates do not match file-backed layout discovery');
  if (observation.active_candidates.length > 1) errors.push('file-backed product layout discovery found ambiguous active ledger candidates');
  if (['READY', 'READY_WITH_WARNINGS'].includes(context.verdict) && observation.active_candidates.length !== 1) {
    errors.push(`${context.verdict} product_context requires exactly one file-backed active ledger candidate`);
  }
  if (observation.active_candidates.length === 1 && context.active_ledger_path !== observation.active_candidates[0]) {
    errors.push('product_context active_ledger_path does not match the file-backed active ledger candidate');
  }
  return uniqueSorted(errors);
}

function parseApprovedSpecDocument(bytes) {
  const errors = [];
  const text = bytes.toString('utf8');
  if (!Buffer.from(text, 'utf8').equals(bytes)) errors.push('approved spec snapshot must be valid UTF-8');
  const match = /^(?:\uFEFF)?---(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)---(?:(?:\r\n|\n)|$)/.exec(text);
  if (!match) return { errors: [...errors, 'approved spec snapshot requires YAML frontmatter'], metadata: {}, body: null };
  const parsed = parseApprovedSpecFrontmatter(match[1]);
  errors.push(...parsed.errors);
  return {
    errors: uniqueSorted(errors),
    metadata: parsed.metadata,
    body: text.slice(match[0].length)
  };
}

function deriveApprovedRequirementProjection(body, requirementIds, approvedSpecPath) {
  const errors = [];
  const requirements = [];
  const requirementFieldHashes = {};
  const requirementSourceHashes = {};
  const lines = String(body ?? '').split(/\r?\n/);
  for (const requirementId of requirementIds) {
    const escapedId = String(requirementId).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const definitionMatcher = new RegExp(
      `^\\s*(?:(?:#{1,6}|[-*+]|\\d+[.)])\\s+)?(?:\\*\\*)?${escapedId}(?:\\*\\*)?(?:\\s+\\[manual\\])?\\s*[-:–—]\\s*(.+?)\\s*$`,
      'i'
    );
    const sources = lines.flatMap((line) => {
      const match = definitionMatcher.exec(line);
      if (!match) return [];
      const text = match[1].replace(/^\*\*|\*\*$/g, '').trim();
      return text.length > 0 ? [{ canonicalSource: line.trim(), text }] : [];
    });
    if (sources.length !== 1) {
      errors.push(`approved spec body must contain exactly one canonical definition line for requirement ${requirementId}; observed ${sources.length}`);
      continue;
    }
    const source = sources[0];
    const { text } = source;
    const expected = inferApprovedBehavior(text);
    const sourceHash = digest(`${requirementId}:${text}`);
    const requirement = {
      id: requirementId,
      text,
      expected,
      required: true,
      requirement_status: 'approved',
      uat_required: false,
      source_ref: `${approvedSpecPath}#${String(requirementId).toLowerCase()}`,
      source_hash: sourceHash
    };
    requirements.push(requirement);
    requirementFieldHashes[requirementId] = digest(stableStringify(requirement));
    requirementSourceHashes[requirementId] = sourceHash;
  }
  return {
    errors: uniqueSorted(errors),
    requirements,
    requirement_field_hashes: requirementFieldHashes,
    requirement_source_hashes: requirementSourceHashes
  };
}

function inferApprovedBehavior(text) {
  const normalized = String(text ?? '').toLowerCase();
  if (/\b(?:denied|deny|denies|forbidden|disallowed|must not|cannot)\b/.test(normalized)) return 'denied';
  if (/\b(?:allowed|allow|allows|permitted|permit|enabled)\b/.test(normalized)) return 'allowed';
  return normalizeBehavior(text);
}

function parseApprovedSpecFrontmatter(frontmatter) {
  const errors = [];
  const metadata = {};
  const seenTopLevel = new Set();
  const seenNested = new Set();
  let collection = null;

  for (const line of frontmatter.split(/\r?\n/)) {
    if (/^\s*(?:#.*)?$/.test(line)) continue;
    const topLevel = /^([A-Za-z][A-Za-z0-9_-]*):(?:[ \t]*(.*))?$/.exec(line);
    if (topLevel) {
      const [, key, rawValue = ''] = topLevel;
      if (seenTopLevel.has(key)) errors.push(`approved spec frontmatter has duplicate ${key}`);
      seenTopLevel.add(key);
      if (key === 'requirement_ids' && rawValue.trim() === '') {
        metadata.requirement_ids = [];
        collection = 'requirement_ids';
      } else if (key === 'change_control' && rawValue.trim() === '') {
        metadata.change_control = {};
        collection = 'change_control';
      } else {
        metadata[key] = decodeFrontmatterScalar(rawValue);
        collection = null;
      }
      continue;
    }

    if (collection === 'requirement_ids') {
      const item = /^\s+-\s+(.+?)\s*$/.exec(line);
      if (item) {
        metadata.requirement_ids.push(decodeFrontmatterScalar(item[1]));
        continue;
      }
    }
    if (collection === 'change_control') {
      const nested = /^\s+([A-Za-z][A-Za-z0-9_-]*):(?:[ \t]*(.*))?$/.exec(line);
      if (nested) {
        const nestedKey = `change_control.${nested[1]}`;
        if (seenNested.has(nestedKey)) errors.push(`approved spec frontmatter has duplicate ${nestedKey}`);
        seenNested.add(nestedKey);
        metadata.change_control[nested[1]] = decodeFrontmatterScalar(nested[2] ?? '');
        continue;
      }
    }
    errors.push(`approved spec frontmatter contains unsupported or malformed line: ${line.trim()}`);
  }
  return { errors: uniqueSorted(errors), metadata };
}

function decodeFrontmatterScalar(rawValue) {
  const value = String(rawValue).trim();
  if (value === 'null' || value === '~') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  if (value.startsWith('[') && value.endsWith(']')) {
    const items = value.slice(1, -1).trim();
    return items === '' ? [] : items.split(',').map((item) => decodeFrontmatterScalar(item));
  }
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function validateApprovedSpecMetadata(metadata, context, normalizedSpecPath, actualSpecHash, actualSpecIntegrityHash, errors) {
  for (const field of ['contract_id', 'feature_id', 'requirement_revision', 'requirement_ids', 'approvedAt', 'approvedBy', 'approval_source', 'approved_spec_hash', 'approved_spec_integrity_hash']) {
    if (isMissing(metadata[field]) || (Array.isArray(metadata[field]) && metadata[field].length === 0)) {
      errors.push(`approved spec frontmatter requires non-empty ${field}`);
    }
  }
  if (typeof metadata.contract_id !== 'string' || metadata.contract_id.trim() === '') errors.push('approved spec frontmatter contract_id must be a non-empty string');
  if (typeof metadata.feature_id !== 'string' || metadata.feature_id.trim() === '') errors.push('approved spec frontmatter feature_id must be a non-empty string');
  for (const field of ['approvedAt', 'approvedBy', 'approval_source', 'approved_spec_hash', 'approved_spec_integrity_hash']) {
    if (typeof metadata[field] !== 'string' || metadata[field].trim() === '') errors.push(`approved spec frontmatter ${field} must be a non-empty string`);
  }
  if (!Number.isInteger(metadata.requirement_revision) || metadata.requirement_revision < 1) errors.push('approved spec frontmatter requirement_revision must be a positive integer');
  if (!Array.isArray(metadata.requirement_ids)
    || metadata.requirement_ids.some((id) => typeof id !== 'string' || isMissing(id))
    || new Set(metadata.requirement_ids).size !== metadata.requirement_ids.length) {
    errors.push('approved spec frontmatter requires unique stable requirement_ids');
  }
  if (!isIso8601Instant(metadata.approvedAt)) errors.push('approved spec frontmatter approvedAt must be a valid ISO-8601 instant');
  if (!APPROVED_SPEC_APPROVAL_SOURCES.has(metadata.approval_source)) errors.push('approved spec frontmatter approval_source is not an allowed independent approval source');
  if (!SHA256_PATTERN.test(metadata.approved_spec_hash ?? '')) errors.push('approved spec frontmatter approved_spec_hash must be a SHA-256 digest');
  if (!SHA256_PATTERN.test(metadata.approved_spec_integrity_hash ?? '')) errors.push('approved spec frontmatter approved_spec_integrity_hash must be a SHA-256 digest');
  if (metadata.approved_spec_hash !== actualSpecHash) errors.push('approved spec body hash does not match frontmatter approved_spec_hash');
  if (context.approved_spec_hash !== actualSpecHash) errors.push('approved spec body hash does not match product_context approved_spec_hash');
  if (metadata.approved_spec_integrity_hash !== actualSpecIntegrityHash) errors.push('approved spec authority integrity hash does not match frontmatter approved_spec_integrity_hash');
  if (context.approved_spec_integrity_hash !== actualSpecIntegrityHash) errors.push('approved spec authority integrity hash does not match product_context approved_spec_integrity_hash');
  if (metadata.contract_id !== context.contract_id) errors.push('approved spec frontmatter contract_id does not match product_context');
  if (metadata.feature_id !== context.feature_id) errors.push('approved spec frontmatter feature_id does not match product_context');
  if (metadata.requirement_revision !== context.requirement_revision) errors.push('approved spec frontmatter requirement_revision does not match product_context');
  if (!sameStringSet(metadata.requirement_ids, context.requirement_ids)) errors.push('approved spec frontmatter requirement_ids do not match product_context');
  if (normalizeRelative(context.approved_spec_path) !== normalizedSpecPath) errors.push('approved spec path does not match product_context approved_spec_path');
  if (!isPlainObject(metadata.change_control) || metadata.change_control.revision !== metadata.requirement_revision) {
    errors.push('approved spec frontmatter change_control revision must match requirement_revision');
  }
  if (!isCompleteAuthorityApproval(context.approval)) {
    errors.push('approved spec authority requires complete product_context approval metadata');
  } else {
    if (metadata.approvedBy !== context.approval.approved_by) errors.push('approved spec frontmatter approvedBy does not match product_context approval');
    if (metadata.approvedAt !== context.approval.approved_at) errors.push('approved spec frontmatter approvedAt does not match product_context approval');
    if (metadata.approval_source !== context.approval.approval_source) errors.push('approved spec frontmatter approval_source does not match product_context approval');
  }
}

function absolutePathsEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || !path.isAbsolute(left) || !path.isAbsolute(right)) return false;
  const normalize = (value) => process.platform === 'win32' ? path.resolve(value).toLowerCase() : path.resolve(value);
  return normalize(left) === normalize(right);
}

function absolutePathIsWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function normalizeUatScenarioRef(value) {
  if (typeof value !== 'string') throw new Error('UAT scenario source ref must be a string');
  const separator = value.indexOf('#');
  if (separator <= 0 || separator !== value.lastIndexOf('#') || separator === value.length - 1) {
    throw new Error('UAT scenario source ref must use canonical <repository-path>#<anchor> form');
  }
  const sourcePath = normalizeRelative(value.slice(0, separator));
  const anchor = value.slice(separator + 1);
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(anchor)) throw new Error('UAT scenario source anchor is invalid');
  const canonical = `${sourcePath}#${anchor}`;
  if (value !== canonical) throw new Error('UAT scenario source ref must already be canonical');
  return canonical;
}

function collectUatScenarioRefs(context) {
  if (!isPlainObject(context)) return [];
  const records = Array.isArray(context.uat_records) ? context.uat_records.filter(isPlainObject) : [];
  if (isPlainObject(context.uat_result)) records.push(context.uat_result);
  return uniqueSorted(records
    .map((record) => record.scenario_source_ref)
    .filter((value) => typeof value === 'string' && value.length > 0));
}

function claimedUatStateHash(context, currentState) {
  const scenarioRefs = collectUatScenarioRefs(context);
  const claimedHashes = isPlainObject(currentState?.uat_scenario_hashes) ? currentState.uat_scenario_hashes : {};
  return digest(stableStringify({
    uat_scenario_hashes: Object.fromEntries(scenarioRefs.map((ref) => [ref, claimedHashes[ref] ?? null])),
    uat_build_or_revision: scenarioRefs.length > 0 ? currentState?.uat_build_or_revision ?? null : null
  }));
}

async function hashObservedRepositoryFile(repositoryRoot, realRoot, relativePath, label) {
  await assertNoLinkedPathSegments(repositoryRoot, relativePath, label);
  const absolutePath = path.resolve(repositoryRoot, ...relativePath.split('/'));
  const [stat, realFile] = await Promise.all([lstat(absolutePath), realpath(absolutePath)]);
  if (stat.isSymbolicLink()) throw new Error(`${relativePath} must not be a symbolic link`);
  if (!stat.isFile()) throw new Error(`${relativePath} must be a regular file`);
  if (!absolutePathIsWithin(realRoot, realFile)) throw new Error(`${relativePath} escapes repositoryRoot`);
  return createHash('sha256').update(await readFile(realFile)).digest('hex');
}

async function assertNoLinkedPathSegments(repositoryRoot, relativePath, label) {
  const rootStat = await lstat(repositoryRoot);
  if (rootStat.isSymbolicLink()) throw new Error(`${label} repository root must not be a symbolic link or junction`);
  let candidate = repositoryRoot;
  for (const segment of relativePath.split('/')) {
    candidate = path.join(candidate, segment);
    const stat = await lstat(candidate);
    if (stat.isSymbolicLink()) throw new Error(`${label} has a symbolic link or junction ancestor: ${relativePath}`);
  }
}

function validateNotApplicableDecision(value, { requirementId, dimension }) {
  const label = `${dimension} not_applicable decision`;
  const errors = [];
  requireOwnFields(value, NOT_APPLICABLE_DECISION_FIELDS, label, errors);
  rejectUnknownFields(value, NOT_APPLICABLE_DECISION_FIELDS, label, errors);
  if (!isPlainObject(value)) return uniqueSorted(errors);
  for (const field of ['decision_id', 'requirement_id', 'approved_by', 'approval_source', 'reason']) {
    if (typeof value[field] !== 'string' || value[field].trim() === '') errors.push(`${label} requires non-empty ${field}`);
  }
  if (value.requirement_id !== requirementId) errors.push(`${label} requirement_id must match row ${String(requirementId)}`);
  if (value.dimension !== dimension) errors.push(`${label} dimension must be ${dimension}`);
  if (value.status !== 'not_applicable') errors.push(`${label} status must be not_applicable`);
  if (value.approved !== true) errors.push(`${label} approved must be true`);
  if (!isIso8601Instant(value.approved_at)) errors.push(`${label} approved_at must be an ISO-8601 instant`);
  return uniqueSorted(errors);
}

function collectProductDecisionSet(context) {
  if (!isPlainObject(context) || !Array.isArray(context.rows)) return [];
  const decisions = [];
  for (const row of context.rows.filter(isPlainObject)) {
    for (const [dimension, statusField, approvalField] of [
      ['implementation', 'implementation_status', 'implementation_approval'],
      ['verification', 'verification_status', 'verification_approval']
    ]) {
      if (row[statusField] === 'not_applicable' && isPlainObject(row[approvalField])) {
        decisions.push({
          requirement_id: row.requirement_id,
          dimension,
          decision: structuredClone(row[approvalField])
        });
      }
    }
    if (['waived', 'deferred', 'not_applicable'].includes(row.uat_status)
      && isPlainObject(row.uat_approval)) {
      decisions.push({
        requirement_id: row.requirement_id,
        dimension: 'uat',
        decision: structuredClone(row.uat_approval)
      });
    }
  }
  return decisions;
}

function validateTrustedProductDecisionAuthority(rows, options) {
  const authority = options?.trusted_decision_authority;
  if (!isPlainObject(authority) || !TRUSTED_PRODUCT_DECISION_AUTHORITIES.has(authority)) {
    return ['not_applicable readiness requires a trusted one-shot product decision authority; forged, replayed, or consumed authority is rejected'];
  }
  TRUSTED_PRODUCT_DECISION_AUTHORITIES.delete(authority);
  const errors = [];
  const context = options.context;
  const currentState = options.current_state;
  if (authority.verified !== true || authority.errors.length > 0) {
    errors.push('trusted product decision authority is not verified');
  }
  if (!isPlainObject(context) || !isPlainObject(currentState)) {
    errors.push('trusted product decision authority requires bound product_context and current_state objects');
    return uniqueSorted(errors);
  }
  const decisions = collectProductDecisionSet(context);
  const decisionSetDigest = digest(stableStringify(decisions));
  const finalContextDigest = digest(stableStringify(context));
  const readinessClaimDigest = digest(stableStringify({
    rows: context.rows ?? [],
    readiness_policy: context.readiness_policy ?? {},
    verdict: context.verdict ?? null
  }));
  const allowedWriteSetDigest = digest(stableStringify({
    allowed_paths: context.allowed_paths ?? [],
    prohibited_paths: context.prohibited_paths ?? [],
    planned_writes: context.planned_writes ?? [],
    actual_writes: context.actual_writes ?? [],
    deleted_paths: context.deleted_paths ?? []
  }));
  if (authority.decision_set_digest !== decisionSetDigest) {
    errors.push('trusted product decision authority is stale because the decision-set digest changed');
  }
  if (authority.final_context_digest !== finalContextDigest) {
    errors.push('trusted product decision authority product_context binding is stale');
  }
  if (authority.readiness_claim_digest !== readinessClaimDigest) {
    errors.push('trusted product decision authority readiness claim binding is stale');
  }
  if (authority.allowed_write_set_digest !== allowedWriteSetDigest) {
    errors.push('trusted product decision authority allowed-write binding is stale');
  }
  if (authority.post_integration_state_digest !== currentState.post_integration_state_digest) {
    errors.push('trusted product decision authority post-integration state binding is stale');
  }
  if (!absolutePathsEqual(authority.repository_root, context.target?.repo_root)) {
    errors.push('trusted product decision authority repository binding does not match product_context');
  }
  const suppliedRows = Array.isArray(rows) ? rows : [rows];
  for (const row of suppliedRows) {
    const boundRow = (context.rows ?? []).find((candidate) =>
      candidate?.requirement_id === row?.requirement_id
      && stableStringify(candidate) === stableStringify(row));
    if (!boundRow) {
      errors.push(`trusted product decision authority does not bind supplied readiness row ${String(row?.requirement_id ?? '<unknown>')}`);
    }
  }
  return uniqueSorted(errors);
}

function isCompleteUatDecision(value) {
  if (!isPlainObject(value)
    || value.approved !== true
    || !['waived', 'deferred', 'not_applicable'].includes(value.status)
    || ['decision_id', 'reason', 'approved_by', 'approved_at', 'approval_source'].some((field) => isMissing(value[field]))
    || !isIso8601Instant(value.approved_at)
    || !Object.hasOwn(value, 'expires_at')
    || !Object.hasOwn(value, 'review_at')
    || (value.expires_at !== null && !isIso8601Instant(value.expires_at))
    || (value.review_at !== null && !isIso8601Instant(value.review_at))
    || !isPlainObject(value.scope)) return false;
  for (const field of ['scenario_ids', 'requirement_ids']) {
    const ids = value.scope[field];
    if (!Array.isArray(ids) || ids.length === 0
      || ids.some((id) => typeof id !== 'string' || !id.trim())
      || new Set(ids).size !== ids.length) return false;
  }
  return true;
}

function approvalDecisionsMatch(left, right) {
  if (!isCompleteUatDecision(left) || !isCompleteUatDecision(right)) return false;
  const fields = [
    'decision_id', 'status', 'reason', 'scope', 'approved', 'approved_by',
    'approved_at', 'approval_source', 'expires_at', 'review_at'
  ];
  return stableStringify(Object.fromEntries(fields.map((field) => [field, left[field] ?? null])))
    === stableStringify(Object.fromEntries(fields.map((field) => [field, right[field] ?? null])));
}

function validateRelevantPathManifest(record, { requireAggregate = true, requireNonEmpty = false } = {}) {
  const errors = [];
  if (!Array.isArray(record?.relevant_paths)) errors.push('relevant path manifest requires relevant_paths array');
  if (!isPlainObject(record?.relevant_path_hashes)) errors.push('relevant path manifest requires relevant_path_hashes object');
  if (errors.length > 0) return { errors, paths: [], hashes: {} };

  let paths;
  let hashEntries;
  try {
    paths = record.relevant_paths.map(normalizeRelative);
    hashEntries = Object.entries(record.relevant_path_hashes).map(([relativePath, value]) => [normalizeRelative(relativePath), value]);
  } catch (error) {
    return { errors: [`relevant path manifest contains an invalid path: ${error.message}`], paths: [], hashes: {} };
  }

  if (requireNonEmpty && paths.length === 0) errors.push('passed requirement evidence requires a non-empty relevant path manifest');
  if (new Set(paths).size !== paths.length) errors.push('relevant path manifest contains duplicate normalized paths');
  const hashKeys = hashEntries.map(([relativePath]) => relativePath);
  if (new Set(hashKeys).size !== hashKeys.length) errors.push('relevant path manifest contains duplicate normalized hash keys');
  const sortedPaths = [...paths].sort();
  const sortedKeys = [...hashKeys].sort();
  if (stableStringify(sortedPaths) !== stableStringify(sortedKeys)) errors.push('relevant path manifest hash keys must exactly match relevant_paths');

  const hashes = Object.fromEntries(hashEntries);
  for (const [relativePath, value] of hashEntries) {
    if (!SHA256_PATTERN.test(String(value ?? ''))) errors.push(`relevant path ${relativePath} hash must be SHA-256`);
  }

  if (requireAggregate) {
    if (!SHA256_PATTERN.test(String(record.relevant_paths_hash ?? ''))) {
      errors.push('relevant_paths_hash must be SHA-256');
    } else if (errors.length === 0) {
      const expected = digest(stableStringify(sortedPaths.map((relativePath) => [relativePath, hashes[relativePath]])));
      if (record.relevant_paths_hash !== expected) errors.push('relevant_paths_hash does not match the canonical path manifest aggregate');
    }
  }
  return { errors: uniqueSorted(errors), paths: sortedPaths, hashes };
}

function validateRowEvidencePathBinding(row, record, context) {
  const errors = [];
  const manifest = validateRelevantPathManifest(record, { requireNonEmpty: true });
  if (manifest.errors.length > 0) return manifest.errors.map((error) => `evidence relevant-path manifest: ${error}`);
  const references = [];
  const sourcePath = repositoryRefPath(row?.source_ref, 'row source spec ref', errors);
  const approvedSpecPath = repositoryRefPath(context?.approved_spec_path, 'approved spec path', errors);
  const expectedResultPath = repositoryRefPath(record?.expected_result_ref, 'expected result spec ref', errors);
  if (sourcePath !== null) references.push(['row source spec ref', sourcePath]);
  if (expectedResultPath !== null) references.push(['expected result spec ref', expectedResultPath]);
  if (sourcePath !== null && approvedSpecPath !== null && sourcePath !== approvedSpecPath) {
    errors.push('row source spec ref does not bind to the trusted approved spec path');
  }
  if (expectedResultPath !== null && sourcePath !== null && expectedResultPath !== sourcePath) {
    errors.push('expected result spec ref does not bind to the row source spec ref');
  }

  if (!Array.isArray(row?.implementation_refs) || row.implementation_refs.length === 0) {
    errors.push('implemented READY row requires implementation refs for evidence-manifest binding');
  } else {
    for (const reference of row.implementation_refs) {
      const relativePath = repositoryRefPath(reference, 'row implementation ref', errors);
      if (relativePath !== null) references.push(['row implementation ref', relativePath]);
    }
  }
  if (!Array.isArray(record?.artifacts) || record.artifacts.length === 0) {
    errors.push('READY verification evidence requires test artifact refs for evidence-manifest binding');
  } else {
    for (const artifact of record.artifacts) {
      const reference = typeof artifact === 'string' ? artifact : artifact?.path;
      const relativePath = repositoryRefPath(reference, 'test artifact ref', errors);
      if (relativePath !== null) references.push(['test artifact ref', relativePath]);
    }
  }

  const manifestPaths = new Set(manifest.paths);
  for (const [label, relativePath] of references) {
    if (!manifestPaths.has(relativePath)) errors.push(`${label} ${relativePath} is not covered by the evidence relevant-path manifest`);
  }
  return uniqueSorted(errors);
}

function isRepositoryRef(value) {
  const errors = [];
  return repositoryRefPath(value, 'repository ref', errors) !== null;
}

function repositoryRefPath(value, label, errors) {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(`${label} must be a non-empty repository-relative ref`);
    return null;
  }
  const separator = value.indexOf('#');
  const sourcePath = separator === -1 ? value : value.slice(0, separator);
  if (separator === 0 || (separator !== -1 && separator !== value.lastIndexOf('#'))) {
    errors.push(`${label} must contain at most one non-leading anchor separator`);
    return null;
  }
  try {
    return normalizeRelative(sourcePath);
  } catch (error) {
    errors.push(`${label} is invalid: ${error.message}`);
    return null;
  }
}

function parseAnchoredRepositoryRef(value, label, errors) {
  const validationErrors = validateCanonicalAnchoredRepositoryRef(value, label);
  errors.push(...validationErrors);
  if (validationErrors.length > 0) return null;
  const separator = value.indexOf('#');
  return {
    path: normalizeRelative(value.slice(0, separator)),
    anchor: value.slice(separator + 1)
  };
}

export function validateProductEvidence(record = {}) {
  return validateEvidenceRecord(record);
}

function validateEvidenceRecord(record) {
  const errors = [];
  const fields = [
    'evidence_id', 'kind', 'requirement_ids', 'control_requirement_ids', 'command', 'cwd',
    'started_at', 'finished_at', 'observed_at', 'observed_by', 'observation_source',
    'exit_code', 'outcome', 'observed_result', 'expected_result_ref', 'environment',
    'verified_head', 'associated_diff', 'contract_id', 'feature_id', 'requirement_revision',
    'approved_spec_path', 'approved_spec_hash', 'approved_spec_integrity_hash',
    'approved_plan_path', 'approved_plan_hash', 'approved_plan_integrity_hash',
    'relevant_paths', 'relevant_path_hashes',
    'relevant_paths_hash', 'output_digest', 'artifacts', 'redaction', 'freshness'
  ];
  const compatibilityFields = [
    'source', 'evidence_type', 'duration', 'passed', 'failed', 'skipped',
    'failed_specs', 'first_useful_error', 'diff_base', 'associated_head_or_diff',
    'environment_class', 'redaction_applied', 'freshness_value', 'stale', 'stale_reason'
  ];
  requireOwnFields(record, fields, 'evidence record', errors);
  if (!isPlainObject(record)) return errors;
  rejectUnknownFields(record, [...fields, ...compatibilityFields], 'evidence record', errors);

  for (const field of ['evidence_id', 'kind', 'cwd', 'observed_at', 'observed_by', 'observation_source', 'outcome', 'observed_result', 'expected_result_ref', 'verified_head', 'contract_id', 'feature_id', 'approved_spec_hash', 'approved_spec_integrity_hash', 'approved_plan_path', 'approved_plan_hash', 'approved_plan_integrity_hash', 'relevant_paths_hash', 'output_digest']) {
    if (isMissing(record[field])) errors.push(`evidence record requires non-empty ${field}`);
  }
  for (const field of ['requirement_ids', 'control_requirement_ids', 'relevant_paths', 'artifacts']) {
    if (!Array.isArray(record[field])) errors.push(`evidence record ${field} must be an array`);
  }
  if (Array.isArray(record.artifacts)) {
    for (const artifact of record.artifacts) {
      if (typeof artifact === 'string') {
        if (!isRepositoryRef(artifact)) errors.push('evidence record artifacts must contain repository-relative file refs');
        continue;
      }
      const artifactFields = ['artifact_id', 'path', 'anchor', 'content_hash'];
      requireOwnFields(artifact, artifactFields, 'evidence artifact', errors);
      rejectUnknownFields(artifact, artifactFields, 'evidence artifact', errors);
      if (isPlainObject(artifact)) {
        if (isMissing(artifact.artifact_id)) errors.push('evidence artifact requires non-empty artifact_id');
        if (!isRepositoryRef(artifact.path)) errors.push('evidence artifact path must be a repository-relative ref');
        if (artifact.anchor !== null && typeof artifact.anchor !== 'string') errors.push('evidence artifact anchor must be text or null');
        if (artifact.content_hash !== null && !SHA256_PATTERN.test(String(artifact.content_hash ?? ''))) errors.push('evidence artifact content_hash must be SHA-256 or null');
      }
    }
  }
  if (!isRepositoryRef(record.expected_result_ref)) errors.push('evidence record expected_result_ref must be a repository-relative ref');
  errors.push(...validateRelevantPathManifest(record, {
    requireNonEmpty: record.outcome === 'passed' && Array.isArray(record.requirement_ids) && record.requirement_ids.length > 0
  }).errors.map((error) => `evidence record ${error}`));
  if (!Number.isInteger(record.requirement_revision) || record.requirement_revision < 1) errors.push('evidence record requires a positive requirement_revision');
  if (!isRepositoryRelativePath(record.approved_spec_path)) errors.push('evidence record requires a repository-relative approved_spec_path');
  if (!SHA256_PATTERN.test(String(record.approved_spec_integrity_hash ?? ''))) errors.push('evidence record approved_spec_integrity_hash must be SHA-256');
  if (!isRepositoryRelativePath(record.approved_plan_path) || !String(record.approved_plan_path).startsWith('.sdcorejs/plans/') || !String(record.approved_plan_path).endsWith('.md')) errors.push('evidence record requires an immutable repository-relative approved_plan_path under .sdcorejs/plans/');
  if (!SHA256_PATTERN.test(String(record.approved_plan_hash ?? ''))) errors.push('evidence record approved_plan_hash must be SHA-256');
  if (!SHA256_PATTERN.test(String(record.approved_plan_integrity_hash ?? ''))) errors.push('evidence record approved_plan_integrity_hash must be SHA-256');
  if (!['passed', 'failed', 'blocked', 'observed'].includes(record.outcome)) errors.push('evidence record has an unsupported outcome');
  if (record.command !== null && isMissing(record.command)) errors.push('evidence record command must be explicit text or null');
  if (record.exit_code !== null && !Number.isInteger(record.exit_code)) errors.push('evidence record exit_code must be an integer or null');
  if (!isIso8601Instant(record.observed_at)) errors.push('evidence record observed_at must be a valid ISO-8601 instant');
  if (record.command !== null) {
    if (!isIso8601Instant(record.started_at) || !isIso8601Instant(record.finished_at)
      || !Number.isInteger(record.exit_code)) {
      errors.push('command evidence requires valid started_at, finished_at, and integer exit_code');
    }
  } else {
    const hasStartedAt = record.started_at !== null;
    const hasFinishedAt = record.finished_at !== null;
    if (hasStartedAt !== hasFinishedAt) {
      errors.push('non-command evidence started_at and finished_at must both be null or both be valid timestamps');
    } else if (hasStartedAt
      && (!isIso8601Instant(record.started_at) || !isIso8601Instant(record.finished_at))) {
      errors.push('non-command evidence started_at and finished_at must both be valid timestamps');
    }
    if (record.exit_code !== null) errors.push('non-command evidence exit_code must be null');
  }
  if (isIso8601Instant(record.started_at) && isIso8601Instant(record.finished_at)
    && Date.parse(record.finished_at) < Date.parse(record.started_at)) errors.push('evidence record finished_at cannot precede started_at');
  if (isIso8601Instant(record.finished_at) && isIso8601Instant(record.observed_at)
    && Date.parse(record.observed_at) < Date.parse(record.finished_at)) errors.push('evidence record observed_at cannot precede finished_at');
  if (!SHA256_PATTERN.test(String(record.output_digest ?? ''))) errors.push('evidence record output_digest must be SHA-256');
  if (record.outcome === 'passed' && record.command !== null && record.exit_code !== 0) errors.push('passed command evidence requires exit_code 0');

  const environmentFields = ['environment_name', 'runtime_versions', 'platform', 'locale', 'timezone', 'environment_fingerprint'];
  const associatedDiffFields = ['base_head', 'head', 'diff_hash', 'changed_paths'];
  const redactionFields = ['redaction_applied', 'redacted_fields', 'excluded_paths', 'secret_scan', 'pii_redacted', 'logs_sanitized'];
  const freshnessFields = ['value', 'reasons', 'evaluated_at', 'head_changed'];
  requireOwnFields(record.environment, environmentFields, 'evidence environment', errors);
  rejectUnknownFields(record.environment, environmentFields, 'evidence environment', errors);
  if (isPlainObject(record.environment)) {
    if (isMissing(record.environment.environment_name) || isMissing(record.environment.environment_fingerprint)) errors.push('evidence environment requires name and fingerprint');
    if (!isPlainObject(record.environment.runtime_versions)) errors.push('evidence environment runtime_versions must be an object');
    if (!SHA256_PATTERN.test(String(record.environment.environment_fingerprint ?? ''))) errors.push('evidence environment environment_fingerprint must be SHA-256');
  }
  requireOwnFields(record.associated_diff, associatedDiffFields, 'evidence associated_diff', errors);
  rejectUnknownFields(record.associated_diff, associatedDiffFields, 'evidence associated_diff', errors);
  if (isPlainObject(record.associated_diff)) {
    if (!Array.isArray(record.associated_diff.changed_paths)) {
      errors.push('evidence associated_diff changed_paths must be an array');
    } else {
      for (const changedPath of record.associated_diff.changed_paths) {
        if (!isRepositoryRelativePath(changedPath)) errors.push('evidence associated_diff changed_paths must contain repository-relative paths');
      }
    }
    if (!SHA256_PATTERN.test(String(record.associated_diff.diff_hash ?? ''))) errors.push('evidence associated_diff diff_hash must be SHA-256');
  }
  requireOwnFields(record.redaction, redactionFields, 'evidence redaction', errors);
  rejectUnknownFields(record.redaction, redactionFields, 'evidence redaction', errors);
  if (isPlainObject(record.redaction)) {
    if (typeof record.redaction.redaction_applied !== 'boolean') errors.push('evidence redaction requires boolean redaction_applied');
    if (!Array.isArray(record.redaction.redacted_fields) || !Array.isArray(record.redaction.excluded_paths)) errors.push('evidence redaction lists must be arrays');
    const acceptedSecretScans = record.command === null ? ['passed', 'not_applicable'] : ['passed'];
    if (!acceptedSecretScans.includes(record.redaction.secret_scan)) errors.push('evidence redaction secret_scan must pass for command evidence');
    if (record.redaction.pii_redacted !== true || record.redaction.logs_sanitized !== true) errors.push('evidence redaction requires PII-redacted sanitized logs');
  }
  requireOwnFields(record.freshness, freshnessFields, 'evidence freshness', errors);
  rejectUnknownFields(record.freshness, freshnessFields, 'evidence freshness', errors);
  if (isPlainObject(record.freshness)) {
    if (!['current', 'stale', 'unknown'].includes(record.freshness.value)) errors.push('evidence freshness value is invalid');
    if (!Array.isArray(record.freshness.reasons) || typeof record.freshness.head_changed !== 'boolean') errors.push('evidence freshness requires reasons and head_changed');
    if (!isIso8601Instant(record.freshness.evaluated_at)) errors.push('evidence freshness evaluated_at must be a valid ISO-8601 instant');
  }
  if (Object.hasOwn(record, 'source') && record.source !== 'sdcorejs-test') errors.push('evidence compatibility source must be sdcorejs-test');
  if (Object.hasOwn(record, 'evidence_type') && record.evidence_type !== record.kind) errors.push('evidence_type compatibility alias must equal kind');
  if (Object.hasOwn(record, 'diff_base') && record.diff_base !== record.associated_diff?.base_head) errors.push('diff_base compatibility alias must equal associated_diff.base_head');
  if (Object.hasOwn(record, 'associated_head_or_diff')
    && ![record.associated_diff?.head, record.associated_diff?.diff_hash].includes(record.associated_head_or_diff)) {
    errors.push('associated_head_or_diff compatibility alias must match associated_diff head or diff_hash');
  }
  if (Object.hasOwn(record, 'environment_class') && record.environment_class !== record.environment?.environment_name) errors.push('environment_class compatibility alias must equal environment.environment_name');
  if (Object.hasOwn(record, 'redaction_applied') && record.redaction_applied !== record.redaction?.redaction_applied) errors.push('redaction_applied compatibility alias must equal redaction.redaction_applied');
  if (Object.hasOwn(record, 'freshness_value') && record.freshness_value !== record.freshness?.value) errors.push('freshness_value compatibility alias must equal freshness.value');
  if (Object.hasOwn(record, 'stale')) {
    const expectedStale = record.freshness?.value === 'current' ? false : record.freshness?.value === 'stale' ? true : 'unknown';
    if (record.stale !== expectedStale) errors.push('stale compatibility alias must agree with freshness.value');
  }
  return uniqueSorted(errors);
}

function validateUatRecord(record, context = {}) {
  const errors = [];
  const fields = [
    'uat_record_id', 'scenario_id', 'contract_id', 'requirement_revision', 'requirement_ids',
    'scenario_source_ref', 'scenario_source_hash', 'preconditions', 'actor_role', 'test_data_ref',
    'environment', 'steps_ref', 'expected_result', 'expected_result_ref', 'actual_result', 'status', 'evidence_refs',
    'execution_kind', 'executed_by', 'executed_at', 'recorded_by', 'recorded_at', 'decision', 'redaction'
  ];
  requireOwnFields(record, fields, 'UAT record', errors);
  if (!isPlainObject(record)) return errors;
  rejectUnknownFields(record, fields, 'UAT record', errors);

  for (const field of ['uat_record_id', 'scenario_id', 'contract_id', 'scenario_source_ref', 'scenario_source_hash', 'actor_role', 'test_data_ref', 'steps_ref', 'expected_result', 'expected_result_ref', 'actual_result', 'status', 'executed_by', 'executed_at', 'recorded_by', 'recorded_at']) {
    if (isMissing(record[field])) errors.push(`UAT record requires non-empty ${field}`);
  }
  if (!isIso8601Instant(record.executed_at)) errors.push('UAT record executed_at must be a valid ISO-8601 instant');
  if (!isIso8601Instant(record.recorded_at)) errors.push('UAT record recorded_at must be a valid ISO-8601 instant');
  if (isIso8601Instant(record.executed_at) && isIso8601Instant(record.recorded_at)
    && Date.parse(record.recorded_at) < Date.parse(record.executed_at)) errors.push('UAT record recorded_at cannot precede executed_at');
  if (!Number.isInteger(record.requirement_revision) || record.requirement_revision < 1) errors.push('UAT record requires a positive requirement_revision');
  if (!Array.isArray(record.requirement_ids) || record.requirement_ids.length === 0) errors.push('UAT record requires requirement_ids');
  if (!Array.isArray(record.preconditions)) errors.push('UAT record preconditions must be an array');
  if (!Array.isArray(record.evidence_refs)) errors.push('UAT record evidence_refs must be an array');
  if (Array.isArray(record.requirement_ids)) {
    if (new Set(record.requirement_ids).size !== record.requirement_ids.length) errors.push('UAT record requirement_ids must be unique');
    if (Array.isArray(context.requirement_ids)) {
      const foreignIds = record.requirement_ids.filter((requirementId) => !context.requirement_ids.includes(requirementId));
      if (foreignIds.length > 0) errors.push(`UAT record requirement_ids are outside the active requirement set: ${foreignIds.join(', ')}`);
    }
  }
  if (Array.isArray(record.evidence_refs) && record.evidence_refs.length === 0) errors.push('UAT record requires at least one evidence reference');
  if (!['in_progress', 'passed', 'failed', 'waived', 'deferred'].includes(record.status)) errors.push('UAT record has an unsupported status');
  if (record.execution_kind !== 'manual') errors.push('UAT record execution_kind must be manual');
  const scenarioRef = parseAnchoredRepositoryRef(record.scenario_source_ref, 'UAT record scenario_source_ref', errors);
  const stepsRef = parseAnchoredRepositoryRef(record.steps_ref, 'UAT record steps_ref', errors);
  const expectedResultRef = parseAnchoredRepositoryRef(record.expected_result_ref, 'UAT record expected_result_ref', errors);
  const scenarioAnchor = String(record.scenario_id ?? '').toLowerCase();
  if (scenarioRef && scenarioRef.anchor.toLowerCase() !== scenarioAnchor) errors.push('UAT record scenario_id must match the scenario source anchor');
  if (scenarioRef && stepsRef && (scenarioRef.path !== stepsRef.path || stepsRef.anchor.toLowerCase() !== `${scenarioAnchor}-steps`)) {
    errors.push('UAT record steps_ref must bind to the approved scenario steps anchor');
  }
  if (scenarioRef && expectedResultRef
    && (scenarioRef.path !== expectedResultRef.path || expectedResultRef.anchor.toLowerCase() !== `${scenarioAnchor}-expected`)) {
    errors.push('UAT record expected_result_ref must bind to the approved scenario expected-result anchor');
  }
  if (scenarioRef && context.layout?.product_docs?.uat_path
    && normalizeRelative(context.layout.product_docs.uat_path) !== scenarioRef.path) {
    errors.push('UAT record scenario source must bind to the active approved UAT document');
  }
  if (!SHA256_PATTERN.test(String(record.scenario_source_hash ?? ''))) errors.push('UAT record scenario_source_hash must be SHA-256');

  const environmentFields = ['environment_name', 'build_or_revision', 'environment_fingerprint'];
  const redactionFields = ['redaction_applied', 'redacted_fields', 'pii_redacted', 'logs_sanitized'];
  const decisionFields = ['decision_id', 'status', 'reason', 'scope', 'approved', 'approved_by', 'approved_at', 'approval_source', 'expires_at', 'review_at'];
  requireOwnFields(record.environment, environmentFields, 'UAT environment', errors);
  rejectUnknownFields(record.environment, environmentFields, 'UAT environment', errors);
  if (isPlainObject(record.environment) && ['environment_name', 'build_or_revision', 'environment_fingerprint'].some((field) => isMissing(record.environment[field]))) {
    errors.push('UAT environment requires name, build_or_revision, and fingerprint');
  }
  if (isPlainObject(record.environment) && !SHA256_PATTERN.test(String(record.environment.environment_fingerprint ?? ''))) {
    errors.push('UAT environment environment_fingerprint must be SHA-256');
  }
  requireOwnFields(record.redaction, redactionFields, 'UAT redaction', errors);
  rejectUnknownFields(record.redaction, redactionFields, 'UAT redaction', errors);
  if (isPlainObject(record.redaction)) {
    if (typeof record.redaction.redaction_applied !== 'boolean') errors.push('UAT redaction requires boolean redaction_applied');
    if (!Array.isArray(record.redaction.redacted_fields)) errors.push('UAT redaction redacted_fields must be an array');
    if (record.redaction.pii_redacted !== true || record.redaction.logs_sanitized !== true) errors.push('UAT redaction requires PII-redacted sanitized logs');
  }
  if (['waived', 'deferred'].includes(record.status)) {
    requireOwnFields(record.decision, decisionFields, 'UAT decision', errors);
    rejectUnknownFields(record.decision, decisionFields, 'UAT decision', errors);
    if (isPlainObject(record.decision)) {
      if (record.decision.status !== record.status || record.decision.approved !== true) errors.push('UAT waiver or deferral requires a matching approved decision');
      for (const field of ['decision_id', 'reason', 'scope', 'approved_by', 'approved_at', 'approval_source']) if (isMissing(record.decision[field])) errors.push(`UAT decision requires non-empty ${field}`);
      const scopeFields = ['scenario_ids', 'requirement_ids'];
      requireOwnFields(record.decision.scope, scopeFields, 'UAT decision scope', errors);
      rejectUnknownFields(record.decision.scope, scopeFields, 'UAT decision scope', errors);
      if (isPlainObject(record.decision.scope)) {
        if (!Array.isArray(record.decision.scope.scenario_ids) || !Array.isArray(record.decision.scope.requirement_ids)) {
          errors.push('UAT decision scope requires scenario_ids and requirement_ids arrays');
        } else {
          if (!sameStringSet(record.decision.scope.scenario_ids, [record.scenario_id])) errors.push('UAT decision scope must exactly match the UAT scenario_id');
          if (!sameStringSet(record.decision.scope.requirement_ids, record.requirement_ids)) errors.push('UAT decision scope must exactly match the UAT requirement_ids');
        }
      }

      if (!isIso8601Instant(record.decision.approved_at)) errors.push('UAT decision approved_at must be a valid ISO-8601 instant');
      for (const field of ['expires_at', 'review_at']) {
        if (record.decision[field] !== null && !isIso8601Instant(record.decision[field])) errors.push(`UAT decision ${field} must be a valid ISO-8601 instant or null`);
      }
      const referenceTime = isIso8601Instant(context.emitted_at) ? Date.parse(context.emitted_at) : Date.now();
      const approvedAt = isIso8601Instant(record.decision.approved_at) ? Date.parse(record.decision.approved_at) : null;
      const expiresAt = isIso8601Instant(record.decision.expires_at) ? Date.parse(record.decision.expires_at) : null;
      const reviewAt = isIso8601Instant(record.decision.review_at) ? Date.parse(record.decision.review_at) : null;
      if (approvedAt !== null && approvedAt > referenceTime) errors.push('UAT decision approved_at cannot be in the future');
      if (expiresAt !== null && approvedAt !== null && expiresAt <= approvedAt) errors.push('UAT decision expires_at must be after approved_at');
      if (reviewAt !== null && approvedAt !== null && reviewAt <= approvedAt) errors.push('UAT decision review_at must be after approved_at');
      if (expiresAt !== null && expiresAt <= referenceTime) errors.push('UAT decision is expired');
      if (reviewAt !== null && reviewAt <= referenceTime) errors.push('UAT decision review is due');
    }
  } else if (record.decision !== null) {
    errors.push('passed, failed, or in-progress UAT decision must be null');
  }
  if (!isMissing(context.contract_id) && record.contract_id !== context.contract_id) errors.push('UAT record contract_id does not match product context');
  if (!isMissing(context.requirement_revision) && record.requirement_revision !== context.requirement_revision) errors.push('UAT record requirement_revision does not match product context');
  if (context.product_action === 'record-uat' && !Array.isArray(context.evidence)) errors.push('record-uat requires an explicit evidence collection for UAT binding');
  if (Array.isArray(context.evidence) && Array.isArray(record.evidence_refs)) {
    const evidenceById = new Map(context.evidence.filter(isPlainObject).map((evidence) => [evidence.evidence_id, evidence]));
    for (const evidenceRef of record.evidence_refs) {
      const evidence = evidenceById.get(evidenceRef);
      if (!evidence) {
        errors.push(`UAT record evidence reference does not resolve: ${evidenceRef}`);
      } else if (Array.isArray(record.requirement_ids)
        && !record.requirement_ids.some((requirementId) => (evidence.requirement_ids ?? []).includes(requirementId))) {
        errors.push(`UAT record evidence reference is not bound to a UAT requirement: ${evidenceRef}`);
      }
    }
  }
  return uniqueSorted(errors);
}

function hasUnsafeProductContextShape(context) {
  const arrayFields = [
    'requirement_ids', 'retired_requirement_ids', 'conflicting_contract_paths', 'allowed_paths',
    'prohibited_paths', 'planned_writes', 'actual_writes', 'deleted_paths', 'dirty_paths',
    'legacy_paths', 'unrelated_dirty_paths', 'rows', 'evidence', 'uat_records', 'gaps',
    'blockers', 'warnings'
  ];
  if (arrayFields.some((field) => Object.hasOwn(context, field) && !Array.isArray(context[field]))) return true;
  for (const field of ['conflicting_contract_paths', 'rows', 'evidence', 'uat_records', 'gaps']) {
    if (Array.isArray(context[field]) && context[field].some((value) => !isPlainObject(value))) return true;
  }
  if (Array.isArray(context.rows) && context.rows.some((row) => [
    'verification_evidence_ids', 'uat_record_ids', 'implementation_refs', 'gaps'
  ].some((field) => row[field] !== undefined && !Array.isArray(row[field])))) return true;
  if (Array.isArray(context.uat_records) && context.uat_records.some((record) => [
    'requirement_ids', 'preconditions', 'evidence_refs'
  ].some((field) => !Array.isArray(record[field])))) return true;
  return false;
}

function validateProductActionLifecycle(lifecycle, authority, action) {
  const errors = [];
  requireOwnFields(lifecycle, PRODUCT_ACTION_LIFECYCLE_FIELDS, 'product_action_lifecycle', errors);
  rejectUnknownFields(lifecycle, PRODUCT_ACTION_LIFECYCLE_FIELDS, 'product_action_lifecycle', errors);
  if (!isPlainObject(lifecycle)) return uniqueSorted(errors);
  for (const field of ['sequence_id', 'step_id', 'required_checkpoint']) {
    if (typeof lifecycle[field] !== 'string' || lifecycle[field].trim() === '') {
      errors.push(`product_action_lifecycle requires non-empty ${field}`);
    }
  }
  if (!Number.isInteger(lifecycle.step_ordinal) || lifecycle.step_ordinal < 1) {
    errors.push('product_action_lifecycle step_ordinal must be a positive integer');
  }
  if (lifecycle.predecessor_context_digest !== null
    && !SHA256_PATTERN.test(String(lifecycle.predecessor_context_digest ?? ''))) {
    errors.push('product_action_lifecycle predecessor_context_digest must be null or SHA-256');
  }
  if (!isPlainObject(authority) || !Array.isArray(authority.steps)) {
    errors.push('approved plan product_action_authority is required for product_context lifecycle binding');
    return uniqueSorted(errors);
  }
  if (authority.sequence_id !== lifecycle.sequence_id) {
    errors.push('approved plan product_action_authority sequence_id does not match product_context lifecycle');
  }
  const step = authority.steps.find((candidate) => candidate?.step_id === lifecycle.step_id);
  if (!step) {
    errors.push('approved plan product_action_authority does not contain the selected product_context lifecycle step');
    return uniqueSorted(errors);
  }
  if (step.ordinal !== lifecycle.step_ordinal) {
    errors.push('approved plan product_action_authority step ordinal does not match product_context lifecycle');
  }
  if (step.action !== action) {
    errors.push('approved plan product_action_authority step action does not match product_context');
  }
  if (step.required_checkpoint !== lifecycle.required_checkpoint) {
    errors.push('approved plan product_action_authority required checkpoint does not match product_context lifecycle');
  }
  if (step.ordinal === 1 && lifecycle.predecessor_context_digest !== null) {
    errors.push('first product_action_lifecycle step requires a null predecessor_context_digest');
  }
  if (step.ordinal > 1 && lifecycle.predecessor_context_digest === null) {
    errors.push('non-initial product_action_lifecycle step requires predecessor_context_digest');
  }
  return uniqueSorted(errors);
}

function validateProductContextShape(context) {
  const errors = [];
  const fields = [
    'schema_version', 'source', 'emitted_at', 'source_context_digest', 'target',
    'product_action', 'product_action_lifecycle', 'persistence_requested', 'write_policy', 'side_effects_allowed',
    'write_authorized', 'requirements_changed', 'contract_id', 'feature_id', 'feature_slug',
    'requirement_revision', 'requirement_ids', 'retired_requirement_ids', 'supersedes',
    'replacement_contract_id', 'change_reason', 'feature_lifecycle', 'approved_spec_path',
    'approved_spec_anchor', 'approved_spec_hash', 'approved_spec_integrity_hash',
    'approved_plan_path', 'approved_plan_hash', 'approved_plan_integrity_hash', 'source_requirement_path',
    'source_requirement_hash', 'approval', 'layout', 'active_ledger_path',
    'conflicting_contract_paths', 'allowed_paths', 'prohibited_paths', 'planned_writes',
    'actual_writes', 'deleted_paths', 'dirty_paths', 'legacy_paths', 'unrelated_dirty_paths',
    'requires_user_choice', 'summary_refresh', 'checkpoint_write', 'before_status_digest',
    'after_status_digest', 'normative_before', 'normative_after', 'changes', 'status', 'rows',
    'readiness_policy', 'evidence', 'evidence_current', 'evidence_freshness', 'uat_result',
    'uat_records', 'gaps', 'verdict', 'blockers', 'warnings', 'redaction', 'validation'
  ];
  requireOwnFields(context, fields, 'product_context', errors);
  if (!isPlainObject(context)) return errors;
  rejectUnknownFields(context, fields, 'product_context', errors);
  if (context.schema_version !== 1) errors.push('product_context schema_version must be 1');
  if (context.source !== 'sdcorejs-product') errors.push('product_context source must be sdcorejs-product');
  if (isMissing(context.emitted_at)) errors.push('product_context requires emitted_at');
  const targetFields = ['repo_root', 'target_root', 'target_root_kind', 'track', 'stack_profile', 'current_branch', 'current_head'];
  const approvalFields = ['approved', 'approved_by', 'approved_at', 'approval_source'];
  requireOwnFields(context.target, targetFields, 'product_context target', errors);
  rejectUnknownFields(context.target, targetFields, 'product_context target', errors);
  requireOwnFields(context.approval, approvalFields, 'product_context approval', errors);
  rejectUnknownFields(context.approval, approvalFields, 'product_context approval', errors);
  errors.push(...validateProductActionLifecycle(
    context.product_action_lifecycle,
    {
      sequence_id: context.product_action_lifecycle?.sequence_id,
      steps: [{
        step_id: context.product_action_lifecycle?.step_id,
        ordinal: context.product_action_lifecycle?.step_ordinal,
        action: context.product_action,
        required_checkpoint: context.product_action_lifecycle?.required_checkpoint
      }]
    },
    context.product_action
  ));

  const arrays = [
    'requirement_ids', 'retired_requirement_ids', 'conflicting_contract_paths', 'allowed_paths',
    'prohibited_paths', 'planned_writes', 'actual_writes', 'deleted_paths', 'dirty_paths',
    'legacy_paths', 'unrelated_dirty_paths', 'rows', 'evidence', 'uat_records', 'gaps',
    'blockers', 'warnings'
  ];
  for (const field of arrays) if (!Array.isArray(context[field])) errors.push(`product_context ${field} must be an array`);
  for (const field of [
    'requirement_ids', 'retired_requirement_ids', 'allowed_paths', 'prohibited_paths',
    'planned_writes', 'actual_writes', 'deleted_paths', 'dirty_paths', 'legacy_paths',
    'unrelated_dirty_paths', 'blockers', 'warnings'
  ]) {
    if (Array.isArray(context[field]) && context[field].some((value) => typeof value !== 'string' || value.trim() === '')) {
      errors.push(`product_context ${field} must contain non-empty strings`);
    }
  }
  for (const field of ['conflicting_contract_paths', 'rows', 'evidence', 'uat_records', 'gaps']) {
    if (Array.isArray(context[field]) && context[field].some((value) => !isPlainObject(value))) {
      errors.push(`product_context ${field} entries must be objects`);
    }
  }
  if (Array.isArray(context.rows)) {
    for (const row of context.rows.filter(isPlainObject)) {
      rejectUnknownFields(row, TRACEABILITY_ROW_FIELDS, 'product_context row', errors);
      for (const field of ['verification_evidence_ids', 'uat_record_ids', 'implementation_refs', 'gaps']) {
        if (row[field] !== undefined && !Array.isArray(row[field])) errors.push(`product_context row ${field} must be an array`);
      }
      if (Array.isArray(row.gaps)) {
        for (const [index, gap] of row.gaps.entries()) errors.push(...validateProductGapShape(gap, `product_context row gaps[${index}]`));
      }
    }
  }
  if (Array.isArray(context.gaps)) {
    for (const [index, gap] of context.gaps.entries()) errors.push(...validateProductGapShape(gap, `product_context gaps[${index}]`));
  }
  if (Array.isArray(context.uat_records)) {
    for (const record of context.uat_records.filter(isPlainObject)) {
      for (const field of ['requirement_ids', 'preconditions', 'evidence_refs']) {
        if (!Array.isArray(record[field])) errors.push(`product_context UAT record ${field} must be an array`);
      }
    }
  }
  if (context.uat_result !== null && !isPlainObject(context.uat_result)) errors.push('product_context uat_result must be an object or null');

  const layoutFields = ['doc_layout', 'contract_key', 'product_docs', 'ledger_root', 'current_path', 'history_root', 'uat_root', 'active_candidates', 'history_paths', 'legacy_sources', 'operations'];
  const productDocFields = ['root', 'prd_path', 'stories_path', 'acceptance_path', 'uat_path', 'decisions_path', 'compact_path'];
  requireOwnFields(context.layout, layoutFields, 'product_context layout', errors);
  rejectUnknownFields(context.layout, layoutFields, 'product_context layout', errors);
  if (isPlainObject(context.layout)) {
    for (const field of ['active_candidates', 'history_paths', 'legacy_sources', 'operations']) if (!Array.isArray(context.layout[field])) errors.push(`product_context layout.${field} must be an array`);
    for (const field of ['active_candidates', 'history_paths', 'legacy_sources']) {
      if (Array.isArray(context.layout[field]) && context.layout[field].some((value) => typeof value !== 'string' || value.trim() === '')) errors.push(`product_context layout.${field} must contain non-empty strings`);
    }
    if (Array.isArray(context.layout.operations) && context.layout.operations.some((value) => !isPlainObject(value))) errors.push('product_context layout.operations entries must be objects');
    requireOwnFields(context.layout.product_docs, productDocFields, 'product_context layout.product_docs', errors);
    rejectUnknownFields(context.layout.product_docs, productDocFields, 'product_context layout.product_docs', errors);
  }
  errors.push(...validateNormativeSnapshotShape(context.normative_before, 'product_context normative_before'));
  errors.push(...validateNormativeSnapshotShape(context.normative_after, 'product_context normative_after'));
  if (!isCompleteNormativeSnapshot(context.normative_before) || !isCompleteNormativeSnapshot(context.normative_after)) errors.push('product_context requires complete normative before/after snapshots');
  const changeFields = ['normative_change_ids', 'retired_requirement_ids', 'descriptive_change_paths', 'uat_record_ids', 'ledger_history_created', 'ignored_unrelated_paths'];
  requireOwnFields(context.changes, changeFields, 'product_context changes', errors);
  rejectUnknownFields(context.changes, changeFields, 'product_context changes', errors);
  if (isPlainObject(context.changes)) for (const [field, value] of Object.entries(context.changes)) if (!Array.isArray(value)) errors.push(`product_context changes.${field} must be an array`);
  const statusFields = ['feature_lifecycle', 'requirement_counts', 'implementation_counts', 'verification_counts', 'uat_counts', 'evidence_freshness_counts'];
  const readinessPolicyFields = ['uat_required'];
  const redactionFields = ['redaction_applied', 'redacted_fields', 'excluded_paths', 'secret_scan', 'pii_redacted', 'logs_sanitized'];
  requireOwnFields(context.status, statusFields, 'product_context status', errors);
  rejectUnknownFields(context.status, statusFields, 'product_context status', errors);
  if (isPlainObject(context.status)) for (const field of statusFields.slice(1)) if (!isPlainObject(context.status[field])) errors.push(`product_context status.${field} must be an object`);
  requireOwnFields(context.readiness_policy, readinessPolicyFields, 'product_context readiness_policy', errors);
  rejectUnknownFields(context.readiness_policy, readinessPolicyFields, 'product_context readiness_policy', errors);
  requireOwnFields(context.redaction, redactionFields, 'product_context redaction', errors);
  rejectUnknownFields(context.redaction, redactionFields, 'product_context redaction', errors);
  if (isPlainObject(context.redaction)) {
    if (typeof context.redaction.redaction_applied !== 'boolean' || typeof context.redaction.pii_redacted !== 'boolean' || typeof context.redaction.logs_sanitized !== 'boolean') errors.push('product_context redaction flags must be boolean');
    if (!Array.isArray(context.redaction.redacted_fields) || !Array.isArray(context.redaction.excluded_paths)) errors.push('product_context redaction lists must be arrays');
  }
  const validationFields = ['action_errors', 'identity_errors', 'side_effect_errors', 'context_errors', 'validator_module'];
  requireOwnFields(context.validation, validationFields, 'product_context validation', errors);
  rejectUnknownFields(context.validation, validationFields, 'product_context validation', errors);
  if (isPlainObject(context.validation)) for (const field of ['action_errors', 'identity_errors', 'side_effect_errors', 'context_errors']) if (!Array.isArray(context.validation[field])) errors.push(`product_context validation.${field} must be an array`);
  return uniqueSorted(errors);
}

function isActionOwnedPattern(action, pattern, observation, caseInsensitive) {
  if (!ACTION_WRITE_POLICY[action] || !isValidRepositoryPattern(pattern)) return false;
  const prefix = patternRoot(pattern);
  if (!prefix || isDefaultProhibitedProductPath(prefix)) return false;
  const layout = observation.layout ?? {};
  const roots = [];
  for (const candidate of [layout.ledger_root, layout.current_path, layout.history_root, layout.uat_root, observation.active_ledger_path]) {
    if (isCanonicalProductLedgerPath(candidate)) roots.push(normalizeRelative(candidate));
  }
  if (NORMATIVE_ACTIONS.has(action)) {
    const productDocsRoot = layout.product_docs?.root;
    for (const [field, candidate] of Object.entries(layout.product_docs ?? {})) {
      if (field.endsWith('_path') && isSafeProductDocumentPath(candidate, productDocsRoot, caseInsensitive)) roots.push(normalizeRelative(candidate));
    }
  }
  const candidate = normalizeCase(normalizeRelative(prefix), caseInsensitive).replace(/\/$/, '');
  return roots.some((root) => {
    const owned = normalizeCase(normalizeRelative(root), caseInsensitive).replace(/\/$/, '');
    return candidate === owned || candidate.startsWith(`${owned}/`);
  });
}

function isCanonicalProductLedgerPath(value) {
  if (!isRepositoryRelativePath(value)) return false;
  const normalized = normalizeRelative(value).replace(/\/$/, '');
  return normalized === PRODUCT_LEDGER_ROOT || normalized.startsWith(`${PRODUCT_LEDGER_ROOT}/`);
}

function isSafeProductDocumentPath(value, root, caseInsensitive) {
  if (!isRepositoryRelativePath(value) || !isRepositoryRelativePath(root)) return false;
  const normalizedValue = normalizeCase(normalizeRelative(value), caseInsensitive).replace(/\/$/, '');
  const normalizedRoot = normalizeCase(normalizeRelative(root), caseInsensitive).replace(/\/$/, '');
  if (normalizedRoot === '.' || isDefaultProhibitedProductPath(normalizedRoot) || isDefaultProhibitedProductPath(normalizedValue)) return false;
  const rootSegments = normalizedRoot.split('/');
  if (!rootSegments.some((segment) => ['product', 'products', 'product-docs', 'requirements'].includes(segment))) return false;
  return normalizedValue === normalizedRoot || normalizedValue.startsWith(`${normalizedRoot}/`);
}

function pathsEqual(left, right, caseInsensitive) {
  if (!isRepositoryRelativePath(left) || !isRepositoryRelativePath(right)) return false;
  return normalizeCase(normalizeRelative(left), caseInsensitive) === normalizeCase(normalizeRelative(right), caseInsensitive);
}

function normalizePaths(values) {
  return uniqueSorted(values.map(normalizeRelative));
}

function patternRoot(pattern) {
  const raw = String(pattern ?? '').replaceAll('\\', '/').replace(/^\.\//, '');
  const wildcardIndex = raw.search(/[*?[\]{}]/);
  const prefix = (wildcardIndex === -1 ? raw : raw.slice(0, wildcardIndex)).replace(/\/$/, '');
  return prefix ? normalizeRelative(prefix) : '';
}

function isValidRepositoryPattern(pattern) {
  if (typeof pattern !== 'string' || pattern.trim() === '' || pattern.includes('\0')) return false;
  try {
    return patternRoot(pattern) !== '';
  } catch {
    return false;
  }
}

function isDefaultProhibitedProductPath(value) {
  if (!isRepositoryRelativePath(value)) return true;
  const normalized = normalizeRelative(value).replace(/\/$/, '');
  const segments = normalized.split('/');
  const first = segments[0]?.toLowerCase();
  const basename = segments.at(-1)?.toLowerCase();
  if (normalized === '.sdcorejs' || (first === '.sdcorejs' && normalized !== PRODUCT_LEDGER_ROOT && !normalized.startsWith(`${PRODUCT_LEDGER_ROOT}/`))) return true;
  if (PROHIBITED_PRODUCT_TOP_LEVELS.has(first)) return true;
  if (PROHIBITED_PRODUCT_BASENAMES.has(basename)) return true;
  if (basename === '.env' || basename?.startsWith('.env.')) return true;
  return segments.some((segment) => segment === '.git' || segment === 'node_modules');
}

function normalizeRelative(value) {
  const raw = String(value ?? '').replaceAll('\\', '/');
  if (!raw || path.posix.isAbsolute(raw) || /^[A-Za-z]:/.test(raw)) throw new Error(`invalid repository-relative path: ${value}`);
  const normalized = path.posix.normalize(raw).replace(/^\.\//, '');
  if (normalized === '..' || normalized.startsWith('../')) throw new Error(`path escapes repository: ${value}`);
  return normalized;
}

function matchesPathPattern(relativePath, pattern, caseInsensitive) {
  const candidate = normalizeCase(relativePath, caseInsensitive);
  let normalizedPattern = String(pattern ?? '').replaceAll('\\', '/').replace(/^\.\//, '');
  normalizedPattern = normalizeCase(normalizedPattern, caseInsensitive);
  if (normalizedPattern.endsWith('/**')) {
    const root = normalizedPattern.slice(0, -3).replace(/\/$/, '');
    return candidate === root || candidate.startsWith(`${root}/`);
  }
  if (normalizedPattern.includes('*')) {
    const expression = normalizedPattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replaceAll('**', '.*').replaceAll('*', '[^/]*');
    return new RegExp(`^${expression}$`).test(candidate);
  }
  return candidate === normalizedPattern;
}

function repositoryPathsOverlap(left, right, caseInsensitive) {
  const first = normalizeCase(left, caseInsensitive).replace(/\/$/, '');
  const second = normalizeCase(right, caseInsensitive).replace(/\/$/, '');
  return first === second || first.startsWith(`${second}/`) || second.startsWith(`${first}/`);
}

function normalizeCase(value, caseInsensitive) {
  return caseInsensitive ? String(value).toLowerCase() : String(value);
}

function stableStringify(value) {
  return JSON.stringify(stableValue(value));
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
  }
  return value;
}

function stableSortObjects(values) {
  return [...values].sort((left, right) => stableStringify(left).localeCompare(stableStringify(right)));
}

function evaluateVerificationArtifact(artifact, evidenceById, currentState, requirementId) {
  const declared = artifact.verification_status ?? 'unverified';
  if (['blocked', 'failed'].includes(declared)) {
    return { verification_status: declared, evidence_freshness: artifact.evidence_freshness ?? 'unknown' };
  }
  if (declared === 'stale') return { verification_status: 'stale', evidence_freshness: 'stale' };
  if (declared === 'not_applicable') return { verification_status: 'not_applicable', evidence_freshness: 'current' };
  if (declared !== 'passed') return { verification_status: 'unverified', evidence_freshness: 'unknown' };

  const records = (artifact.evidence_ids ?? [])
    .map((evidenceId) => evidenceById.get(evidenceId))
    .filter((record) => isAcceptableVerificationEvidence(record, requirementId));
  if (records.length === 0) return { verification_status: 'unverified', evidence_freshness: 'unknown' };

  const freshness = records.map((record) => evaluateEvidenceFreshness(record, currentState).freshness);
  return {
    verification_status: 'passed',
    evidence_freshness: freshness.includes('current') ? 'current' : freshness.includes('stale') ? 'stale' : 'unknown'
  };
}

function isAcceptableVerificationEvidence(record, requirementId) {
  if (!record || record.outcome !== 'passed' || validateEvidenceRecord(record).length > 0) return false;
  if (record.command === null ? record.exit_code !== null : record.exit_code !== 0) return false;
  if (!(record.requirement_ids ?? []).includes(requirementId)) return false;
  for (const field of ['evidence_id', 'cwd', 'observed_at', 'verified_head', 'contract_id', 'feature_id', 'requirement_revision', 'approved_spec_path', 'approved_spec_hash', 'approved_spec_integrity_hash', ...APPROVED_PLAN_IDENTITY_FIELDS, 'relevant_paths_hash', 'output_digest']) {
    if (record[field] === undefined || record[field] === null || record[field] === '') return false;
  }
  return ['passed', 'not_applicable'].includes(record.redaction?.secret_scan)
    && record.redaction?.logs_sanitized === true;
}

function selectStatus(values, priority, fallback) {
  const observed = values.filter((value) => priority.includes(value));
  if (observed.length === 0) return fallback;
  return [...observed].sort((left, right) => priority.indexOf(left) - priority.indexOf(right))[0];
}

function compareUatRecordsNewestFirst(left, right) {
  const leftTime = isIso8601Instant(left?.executed_at) ? Date.parse(left.executed_at) : Number.NEGATIVE_INFINITY;
  const rightTime = isIso8601Instant(right?.executed_at) ? Date.parse(right.executed_at) : Number.NEGATIVE_INFINITY;
  return rightTime - leftTime || String(right?.uat_record_id ?? '').localeCompare(String(left?.uat_record_id ?? ''));
}

function isIso8601Instant(value) {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && Number.isFinite(Date.parse(value));
}

function uniqueSorted(values) {
  return [...new Set(values)].sort();
}

function normalizeBehavior(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  const equivalents = new Map([
    ['deny', 'denied'],
    ['denies', 'denied'],
    ['forbidden', 'denied'],
    ['allow', 'allowed'],
    ['allows', 'allowed'],
    ['permit', 'allowed'],
    ['permitted', 'allowed']
  ]);
  return equivalents.get(normalized) ?? normalized;
}

function digest(value) {
  return createHash('sha256').update(String(value ?? '')).digest('hex');
}

function slugify(value) {
  return String(value ?? 'feature').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'feature';
}

function isSensitiveKey(key) {
  const normalized = String(key);
  return /^(authorization|cookie|set-cookie|token|access[_-]?token|refresh[_-]?token|session[_-]?(?:token|id)|id[_-]?token|password|passwd|pwd|secret|client[_-]?secret|private[_-]?key|api[_-]?key|connection[_-]?string|email|phone|full[_-]?name|first[_-]?name|last[_-]?name|date[_-]?of[_-]?birth|national[_-]?id|government[_-]?id|social[_-]?security[_-]?(?:number|id)|ssn|passport[_-]?(?:number|id)|driver[_-]?(?:license|licence)(?:[_-]?(?:number|id))?|address|customer[_-]?id|account[_-]?(?:id|identifier))$/i.test(normalized)
    || /(?:^|[_-])(?:password|passwd|pwd|secret|token|api[_-]?key|private[_-]?key|connection[_-]?string|secret[_-]?access[_-]?key|account[_-]?key|credentials?)$/i.test(normalized);
}

function redactString(value) {
  return String(value)
    .replace(/-----BEGIN [^-\r\n]*PRIVATE KEY-----[\s\S]*?-----END [^-\r\n]*PRIVATE KEY-----/gi, '[REDACTED_PRIVATE_KEY]')
    .replace(/\b(cookie|set-cookie)\s*[:=]\s*[^\r\n]+/gi, '$1: [REDACTED]')
    .replace(/\b(postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?|redis|amqps?|mssql):\/\/[^\s'"`]+/gi, '$1://[REDACTED]')
    .replace(/\b(?:server|data source|host)\s*=\s*[^;\r\n]+;(?:[^;\r\n]+;)*\s*(?:password|pwd)\s*=\s*[^;\r\n]+;?/gi, 'connection_string=[REDACTED]')
    .replace(/\b(?:proxy-)?authorization\s*[:=]\s*(?:Basic|Digest|Negotiate|ApiKey)\s+[^\s,;}\]\r\n]+/gi, 'Authorization: [REDACTED]')
    .replace(/\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi, 'Bearer [REDACTED]')
    .replace(/\b((?:[A-Z0-9]+[_-])*(?:secret[_-]?access[_-]?key|account[_-]?key|credentials?))\b\s*[:=]\s*(?:"[^"\r\n]*"|'[^'\r\n]*'|`[^`\r\n]*`|[^\s,;}\]\r\n]+)/gi, '$1=[REDACTED]')
    .replace(/\b(token|secret|password|api[_-]?key)\b\s*[:=]\s*(?:"[^"\r\n]*"|'[^'\r\n]*'|`[^`\r\n]*`|[^\s,;}\]\r\n]+)/gi, '$1=[REDACTED]')
    .replace(/\b(token|secret|password|api[_-]?key)\b\s+(?:"[^"\r\n]*"|'[^'\r\n]*'|`[^`\r\n]*`|[^\s,;}\]\r\n]+)/gi, '$1 [REDACTED]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_GOVERNMENT_ID]')
    .replace(/\+\d(?:[\s().-]*\d){7,14}\b/g, '[REDACTED_PHONE]')
    .replace(/\b\d(?:[\s().-]*\d){9,14}\b/g, '[REDACTED_PHONE]')
    .replace(/\bCUST-[A-Z0-9-]+\b/gi, '[REDACTED_CUSTOMER_ID]')
    .replace(/\b(?:ACC|ACCOUNT)[-_][A-Z0-9-]{4,}\b/gi, '[REDACTED_ACCOUNT_ID]');
}

function containsRawSensitiveValue(value, key = '') {
  if (Array.isArray(value)) return value.some((item) => containsRawSensitiveValue(item, key));
  if (value && typeof value === 'object') return Object.entries(value).some(([childKey, child]) => containsRawSensitiveValue(child, childKey));
  if (typeof value !== 'string' || value === '[REDACTED]') return false;
  if (isSensitiveKey(key)) return true;
  return redactString(value) !== value;
}

function dependsTransitively(stageId, dependencyId, byId, seen = new Set()) {
  if (stageId === dependencyId) return true;
  if (seen.has(stageId)) return false;
  seen.add(stageId);
  const stage = byId.get(stageId);
  return (stage?.depends_on ?? []).some((id) => id === dependencyId || dependsTransitively(id, dependencyId, byId, seen));
}

function hasDependencyCycle(stages) {
  const byId = new Map(stages.map((stage) => [stage.id, stage]));
  const visiting = new Set();
  const visited = new Set();
  const visit = (id) => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const dependency of byId.get(id)?.depends_on ?? []) if (byId.has(dependency) && visit(dependency)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return stages.some((stage) => visit(stage.id));
}
