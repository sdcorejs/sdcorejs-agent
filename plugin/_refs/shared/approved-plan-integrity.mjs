import { createHash } from 'node:crypto';
import path from 'node:path';

const HASH_PATTERN = /^[a-f0-9]{64}$/i;
const SPEC_APPROVAL_SOURCES = new Set(['explicit-user-choice']);
const PLAN_APPROVAL_SOURCES = new Set(['explicit-user-choice']);
const PLAN_CONTEXT_FIELDS = new Set([
  'source', 'contract_id', 'feature_id', 'requirement_id',
  'requirement_revision', 'requirement_ids',
  'approved_spec_path', 'approved_spec_hash', 'approved_spec_integrity_hash',
  'approved_plan_path', 'approved_plan_hash', 'approved_plan_integrity_hash',
  'frozen_contract_path', 'frozen_contract_hash', 'ownership_manifest_digest',
  'parallel_contract_revision', 'parallel_contract_supersedes', 'supersedes',
  'target_root', 'target_root_kind', 'track', 'stack_profile', 'product_action',
  'product_action_authority',
  'task_count', 'phase_count', 'allowed_paths', 'prohibited_paths',
  'generated_artifacts', 'docs_artifacts', 'dependency_changes', 'env_changes',
  'migration_changes', 'frontend_architecture', 'verification_strategy',
  'parallel_candidates', 'finish_tail', 'approval', 'change_control'
]);
const EXECUTION_TRACKS = new Set([
  'angular', 'nestjs', 'nextjs', 'react', 'node', 'product', 'design', 'test',
  'workflow', 'generic', 'general', 'multi'
]);
const TARGET_ROOT_KINDS = new Set([
  'target-project', 'sdcorejs-agent-authoring-repo', 'skill-pack-authoring-repo', 'unknown'
]);
const STACK_PROFILES = new Set([
  'core-ui-angular', 'legacy-core-ui-angular', 'plain-angular',
  'sdcorejs-nestjs', 'plain-nestjs', 'nextjs-build-website', 'plain-nextjs',
  'react-vite', 'react-cra', 'react-next-generic', 'node-general', 'general',
  'migration-request', 'unknown'
]);
const REAL_PRODUCT_ACTIONS = new Set([
  'seed-from-approved-spec', 'requirements-update', 'traceability-sync',
  'audit-readonly', 'audit-and-sync', 'record-uat', 'supersede-feature'
]);
const PRE_SCHEMA_PRODUCT_ACTIONS = new Set([...REAL_PRODUCT_ACTIONS, 'not-applicable']);
const PRODUCT_ACTION_AUTHORITY_FIELDS = [
  'schema_version', 'mode', 'purpose', 'sequence_id', 'steps', 'terminal_step_id'
];
const PRODUCT_ACTION_STEP_FIELDS = [
  'step_id', 'ordinal', 'action', 'write_policy', 'allowed_paths',
  'predecessor_step_id', 'required_checkpoint'
];
const PRODUCT_ACTION_AUTHORITY_MODES = new Set(['none', 'single', 'ordered']);
const PRODUCT_ACTION_AUTHORITY_PURPOSES = new Set(['none', 'standalone', 'final-tail']);
const PRODUCT_ACTION_WRITE_POLICIES = new Set(['allow', 'deny']);
const PRE_SCHEMA_PRODUCT_ACTION_IDENTITIES = Object.freeze([
  Object.freeze({
    plan_path: '.sdcorejs/plans/workflow/2026-07-15-00-16-product-contract-refactor-plan-r3.md',
    approved_plan_hash: '1a901183d60cfede6d926d46f9f6c83d80d86b8f21338146a25b699b7e88909b',
    approved_plan_integrity_hash: '8665ec8bf905ec38f621506ea6fc60101911f273f8195de15bc8ccf4fd92fc39',
    product_action: 'not-applicable',
    execution_policy: 'read-only'
  }),
  Object.freeze({
    plan_path: '.sdcorejs/plans/workflow/2026-07-15-21-35-product-contract-isolated-write-authority-bootstrap-plan-r4.md',
    approved_plan_hash: '01a868ce6d2274ff1634f2c2d6a2fbaab20a6624604c17ca3eb63d9c7ec13554',
    approved_plan_integrity_hash: '287c5bcc935f0b80a9dbd962c86311b8f1f9f8bd383f702573cfedbc265116f5',
    product_action: 'not-applicable',
    execution_policy: 'bootstrap-none'
  })
]);
const REVOKED_EXECUTION_PLAN_IDENTITIES = Object.freeze([
  Object.freeze({
    revision: 4,
    plan_path: '.sdcorejs/plans/workflow/2026-07-15-21-35-product-contract-isolated-write-authority-bootstrap-plan-r4.md',
    approved_plan_hash: '01a868ce6d2274ff1634f2c2d6a2fbaab20a6624604c17ca3eb63d9c7ec13554',
    approved_plan_integrity_hash: '287c5bcc935f0b80a9dbd962c86311b8f1f9f8bd383f702573cfedbc265116f5',
    superseded_by: '.sdcorejs/plans/workflow/2026-07-16-00-08-product-contract-authority-bootstrap-recovery-plan-r5.md'
  }),
  Object.freeze({
    revision: 5,
    plan_path: '.sdcorejs/plans/workflow/2026-07-16-00-08-product-contract-authority-bootstrap-recovery-plan-r5.md',
    approved_plan_hash: '3cd5bf1980152c2e52ea493c3f1d83b42cdccc44da2d3046435d194c44b904e3',
    approved_plan_integrity_hash: 'edb342ec2101d51ab8a4bc8d276252a08435a47a441c8dda666593ec0f8a23f2',
    superseded_by: '.sdcorejs/plans/workflow/2026-07-16-07-00-product-contract-authority-bootstrap-controller-recovery-plan-r6.md'
  }),
  Object.freeze({
    revision: 6,
    plan_path: '.sdcorejs/plans/workflow/2026-07-16-07-00-product-contract-authority-bootstrap-controller-recovery-plan-r6.md',
    approved_plan_hash: 'a6c46dd13deb3e83610b783e6a16d80b592ff6458623abd4c3eeb743517cf84c',
    approved_plan_integrity_hash: 'fb8aa29bb30434eb72598fd90f13e554e8271a5175e33ef8ce5076e9f81dc539',
    superseded_by: '.sdcorejs/plans/workflow/2026-07-16-21-18-product-contract-authority-bootstrap-controller-recovery-plan-r7.md'
  }),
  Object.freeze({
    revision: 7,
    plan_path: '.sdcorejs/plans/workflow/2026-07-16-21-18-product-contract-authority-bootstrap-controller-recovery-plan-r7.md',
    approved_plan_hash: '38f6d2321f271dd048580a823e4f24f7253b36a99ec88413a50cfb3bc673f290',
    approved_plan_integrity_hash: '31f724091ea1026384875fca92be26c5b9eee9ff9f0b8c9c899f096d21f837fd',
    superseded_by: '.sdcorejs/plans/workflow/2026-07-17-06-44-product-contract-authority-bootstrap-controller-recovery-plan-r8.md'
  }),
  Object.freeze({
    revision: 8,
    plan_path: '.sdcorejs/plans/workflow/2026-07-17-06-44-product-contract-authority-bootstrap-controller-recovery-plan-r8.md',
    approved_plan_hash: '379164a0145f9a2c0bbf2b25e82a7f684ac5b704bd6c9a679349329302a77125',
    approved_plan_integrity_hash: 'a28c4d7e44d944fbf775169d78ea32b867e589ba8ca0b79bdb3bb83654c92ae1',
    superseded_by: '.sdcorejs/plans/workflow/2026-07-18-22-04-product-contract-authority-bootstrap-controller-cleanup-recovery-plan-r9.md'
  }),
  Object.freeze({
    revision: 9,
    plan_path: '.sdcorejs/plans/workflow/2026-07-18-22-04-product-contract-authority-bootstrap-controller-cleanup-recovery-plan-r9.md',
    approved_plan_hash: 'e97faafabf7465856f85cb852d6006e6e806635feb34e3ff87a8da37c60831f9',
    approved_plan_integrity_hash: 'ea6902534bbca4097372618984def11204e9ca4ec9e02b1f3d30775f81f0d553',
    superseded_by: '.sdcorejs/plans/workflow/2026-07-18-23-35-product-contract-authority-bootstrap-controller-wrapper-preflight-recovery-plan-r10.md'
  }),
  Object.freeze({
    revision: 10,
    plan_path: '.sdcorejs/plans/workflow/2026-07-18-23-35-product-contract-authority-bootstrap-controller-wrapper-preflight-recovery-plan-r10.md',
    approved_plan_hash: 'fe08810304bdbce6c8ef77dc0d9401bdfc72c5c8873d923a9166a46e864ae1e1',
    approved_plan_integrity_hash: 'e1736f393f3de6e5d490082675dd152eed1f34d7b4d04ae4645a5d7dc23778c7',
    superseded_by: '.sdcorejs/plans/workflow/2026-07-19-04-22-product-contract-authority-bootstrap-controller-native-ads-preflight-recovery-plan-r11.md'
  })
]);
const PACKAGE_MANAGERS = new Set(['npm', 'pnpm', 'yarn', 'bun', 'unknown']);
const INVALID_VALUE = Symbol('invalid-approved-plan-value');
const INTEGRITY_FIELDS = new Set([
  'approved_spec_integrity_hash',
  'approved_plan_integrity_hash'
]);

export function canonicalApprovedSnapshotBody(snapshotText, hashField) {
  if (typeof snapshotText !== 'string') throw new TypeError('snapshot text must be a string');
  if (!['approved_spec_hash', 'approved_plan_hash'].includes(hashField)) {
    throw new TypeError('hash field must be approved_spec_hash or approved_plan_hash');
  }

  const normalized = snapshotText.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!normalized.startsWith('---\n')) throw new Error('snapshot must start with YAML frontmatter');
  const frontmatterEnd = normalized.indexOf('\n---\n', 4);
  if (frontmatterEnd === -1) throw new Error('snapshot must contain a closing YAML frontmatter delimiter');

  const body = normalized.slice(frontmatterEnd + '\n---\n'.length);
  const hashLine = new RegExp(`^[ \\t]*${hashField}[ \\t]*:.*(?:\\n|$)`, 'gm');
  const selfReferences = [...body.matchAll(hashLine)];
  if (selfReferences.length > 1) {
    throw new Error(`approved snapshot body must contain at most one designated ${hashField} self-reference`);
  }
  return selfReferences.length === 1 ? body.replace(hashLine, '') : body;
}

export function hashApprovedSnapshot(snapshotText, hashField) {
  return createHash('sha256')
    .update(canonicalApprovedSnapshotBody(snapshotText, hashField), 'utf8')
    .digest('hex');
}

export function canonicalApprovedSnapshotIntegrity(snapshotText, integrityField) {
  if (typeof snapshotText !== 'string') throw new TypeError('snapshot text must be a string');
  if (!INTEGRITY_FIELDS.has(integrityField)) {
    throw new TypeError('integrity field must be approved_spec_integrity_hash or approved_plan_integrity_hash');
  }

  const normalized = snapshotText.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!normalized.startsWith('---\n')) throw new Error('snapshot must start with YAML frontmatter');
  const frontmatterEnd = normalized.indexOf('\n---\n', 4);
  if (frontmatterEnd === -1) throw new Error('snapshot must contain a closing YAML frontmatter delimiter');

  const frontmatterLines = normalized.slice(4, frontmatterEnd).split('\n');
  const integrityLine = new RegExp(`^${integrityField}[ \\t]*:`);
  const matchingIndexes = frontmatterLines
    .map((line, index) => integrityLine.test(line) ? index : -1)
    .filter((index) => index !== -1);
  if (matchingIndexes.length !== 1) {
    throw new Error(`snapshot frontmatter must contain exactly one ${integrityField} self-reference`);
  }

  const body = normalized.slice(frontmatterEnd + '\n---\n'.length);
  if (new RegExp(`^[ \\t]*${integrityField}[ \\t]*:`, 'm').test(body)) {
    throw new Error(`snapshot body must not contain ${integrityField}`);
  }
  frontmatterLines.splice(matchingIndexes[0], 1);
  return `---\n${frontmatterLines.join('\n')}\n---\n${body}`;
}

export function hashApprovedSnapshotIntegrity(snapshotText, integrityField) {
  return createHash('sha256')
    .update(canonicalApprovedSnapshotIntegrity(snapshotText, integrityField), 'utf8')
    .digest('hex');
}

export function parseApprovedPlanContext(planText, options = {}) {
  const errors = [];
  const plan = parseSnapshot(planText, 'approved plan', errors);
  const planContext = plan
    ? parseEmbeddedContext(plan.body, 'plan_context', 'approved plan body', errors)
    : null;
  let normalizedProductActionAuthority = null;
  if (planContext !== null) {
    const hasScalar = Object.hasOwn(planContext, 'product_action');
    const hasObject = Object.hasOwn(planContext, 'product_action_authority');
    if (hasScalar && hasObject) {
      errors.push('product_action and product_action_authority are mutually exclusive; exactly one representation is allowed');
    } else if (hasObject) {
      const authority = canonicalProductActionAuthority(
        planContext.product_action_authority,
        'approved plan body plan_context product_action_authority',
        errors,
        {
          planAllowedPaths: planContext.allowed_paths,
          planProhibitedPaths: planContext.prohibited_paths
        }
      );
      if (authority !== INVALID_VALUE) normalizedProductActionAuthority = authority;
    } else if (hasScalar && isPlainObject(options) && typeof options.planPath === 'string') {
      const planPath = canonicalArtifactPath(options.planPath, 'approved plan path', errors);
      const planHash = safeHash(planText, 'approved_plan_hash', 'approved plan', errors);
      const planIntegrityHash = safeIntegrityHash(
        planText,
        'approved_plan_integrity_hash',
        'approved plan',
        errors
      );
      const identity = lookupPreSchemaProductActionIdentity({
        planPath,
        planHash,
        planIntegrityHash,
        productAction: planContext.product_action
      });
      if (identity !== null) {
        normalizedProductActionAuthority = normalizeLegacyProductAction(
          identity,
          planContext.allowed_paths
        );
      }
    }
  }
  const uniqueErrors = [...new Set(errors)];
  return Object.freeze({
    verified: uniqueErrors.length === 0 && planContext !== null,
    errors: Object.freeze(uniqueErrors),
    plan_context: planContext === null ? null : structuredClone(planContext),
    normalized_product_action_authority: normalizedProductActionAuthority === null
      ? null
      : structuredClone(normalizedProductActionAuthority)
  });
}

export function validateApprovedPlanWriteScope(input = {}) {
  if (!isPlainObject(input)) {
    return Object.freeze({
      verified: false,
      errors: Object.freeze(['approved plan write-scope input must be an object']),
      allowed_paths: Object.freeze([]),
      prohibited_paths: Object.freeze([]),
      case_insensitive: process.platform === 'win32',
      target_root: null
    });
  }

  const errors = [];
  const caseInsensitive = process.platform === 'win32' || input.caseInsensitive === true;
  if (input.caseInsensitive !== undefined && typeof input.caseInsensitive !== 'boolean') {
    errors.push('approved plan write-scope caseInsensitive must be a boolean when supplied');
  }
  const repositoryRoot = canonicalAbsoluteScopeRoot(input.repositoryRoot, 'repositoryRoot', errors);
  const planTargetRoot = canonicalApprovedPlanScopeTargetRoot(
    input.planTargetRoot,
    repositoryRoot,
    'approved plan target_root',
    errors
  );
  const contextTargetRoot = canonicalApprovedPlanScopeTargetRoot(
    input.contextTargetRoot,
    repositoryRoot,
    'product_context target_root',
    errors
  );
  if (repositoryRoot !== null && planTargetRoot !== null
    && !approvedPlanAbsolutePathsEqual(repositoryRoot, planTargetRoot, caseInsensitive)) {
    errors.push('approved plan target_root does not match repositoryRoot for write-scope authorization');
  }
  if (repositoryRoot !== null && contextTargetRoot !== null
    && !approvedPlanAbsolutePathsEqual(repositoryRoot, contextTargetRoot, caseInsensitive)) {
    errors.push('product_context target_root does not match repositoryRoot for approved plan write-scope authorization');
  }
  if (planTargetRoot !== null && contextTargetRoot !== null
    && !approvedPlanAbsolutePathsEqual(planTargetRoot, contextTargetRoot, caseInsensitive)) {
    errors.push('product_context target_root does not match the approved plan target_root');
  }

  const planAllowedPaths = canonicalApprovedPlanScopeList(
    input.planAllowedPaths,
    'approved plan allowed_paths',
    errors,
    { allowEmpty: false }
  );
  const planProhibitedPaths = canonicalApprovedPlanScopeList(
    input.planProhibitedPaths,
    'approved plan prohibited_paths',
    errors,
    { allowEmpty: true }
  );
  const contextAllowedPaths = canonicalApprovedPlanScopeList(
    input.contextAllowedPaths,
    'product_context allowed_paths',
    errors,
    { allowEmpty: true }
  );
  const contextProhibitedPaths = canonicalApprovedPlanScopeList(
    input.contextProhibitedPaths,
    'product_context prohibited_paths',
    errors,
    { allowEmpty: true }
  );

  for (const contextPattern of contextAllowedPaths) {
    if (!planAllowedPaths.some((planPattern) => approvedPlanScopePatternIsContainedBy(
      contextPattern,
      planPattern,
      caseInsensitive
    ))) {
      errors.push(`product_context allowed_paths pattern widens outside approved plan allowed_paths: ${contextPattern}`);
    }
    if (planProhibitedPaths.some((planPattern) => approvedPlanScopePatternsMayIntersect(
      contextPattern,
      planPattern,
      caseInsensitive
    ))) {
      errors.push(`product_context allowed_paths pattern intersects approved plan prohibited_paths: ${contextPattern}`);
    }
  }

  const persistedFields = [
    ['planned_writes', input.plannedWrites],
    ['actual_writes', input.actualWrites],
    ['deleted_paths', input.deletedPaths]
  ];
  for (const [field, value] of persistedFields) {
    const persistedPaths = canonicalApprovedPlanPersistedPaths(value, `product_context ${field}`, errors);
    for (const persistedPath of persistedPaths) {
      if (!planAllowedPaths.some((pattern) => approvedPlanScopePathMatches(
        persistedPath,
        pattern,
        caseInsensitive
      ))) {
        errors.push(`product_context ${field} path is outside approved plan allowed_paths: ${persistedPath}`);
      }
      if (planProhibitedPaths.some((pattern) => approvedPlanScopePathMatches(
        persistedPath,
        pattern,
        caseInsensitive
      ))) {
        errors.push(`product_context ${field} path matches approved plan prohibited_paths: ${persistedPath}`);
      }
      if (contextAllowedPaths.length > 0 && !contextAllowedPaths.some((pattern) => approvedPlanScopePathMatches(
        persistedPath,
        pattern,
        caseInsensitive
      ))) {
        errors.push(`product_context ${field} path is outside product_context allowed_paths: ${persistedPath}`);
      }
      if (contextProhibitedPaths.some((pattern) => approvedPlanScopePathMatches(
        persistedPath,
        pattern,
        caseInsensitive
      ))) {
        errors.push(`product_context ${field} path matches product_context prohibited_paths: ${persistedPath}`);
      }
    }
  }

  const uniqueErrors = [...new Set(errors)].sort();
  return Object.freeze({
    verified: uniqueErrors.length === 0,
    errors: Object.freeze(uniqueErrors),
    allowed_paths: Object.freeze([...planAllowedPaths]),
    prohibited_paths: Object.freeze([...planProhibitedPaths]),
    case_insensitive: caseInsensitive,
    target_root: planTargetRoot
  });
}

export function validateApprovedPlanIntegrity(input = {}) {
  if (!isPlainObject(input)) return ['approved plan integrity input must be an object'];
  const errors = [];
  const plan = parseSnapshot(input.planText, 'approved plan', errors);
  const spec = parseSnapshot(input.specText, 'approved spec', errors);
  const context = isPlainObject(input.planContext) ? input.planContext : null;
  if (!context) errors.push('plan_context must be an object');
  if (!plan || !spec || !context) return errors;
  const planBodyContext = parseEmbeddedContext(plan.body, 'plan_context', 'approved plan body', errors);
  const specBodyContext = parseEmbeddedContext(spec.body, 'spec_context', 'approved spec body', errors);
  if (!planBodyContext || !specBodyContext) return errors;

  rejectUnsupportedFields(planBodyContext, 'approved plan body plan_context', PLAN_CONTEXT_FIELDS, errors);
  rejectUnsupportedFields(context, 'plan_context', PLAN_CONTEXT_FIELDS, errors);

  validateApprovalMetadata(spec.frontmatter, 'approved spec frontmatter', SPEC_APPROVAL_SOURCES, errors);
  validateApprovalMetadata(plan.frontmatter, 'approved plan frontmatter', PLAN_APPROVAL_SOURCES, errors);

  const recomputedPlanHash = safeHash(input.planText, 'approved_plan_hash', 'approved plan', errors);
  const recomputedSpecHash = safeHash(input.specText, 'approved_spec_hash', 'approved spec', errors);
  const recomputedPlanIntegrityHash = safeIntegrityHash(input.planText, 'approved_plan_integrity_hash', 'approved plan', errors);
  const recomputedSpecIntegrityHash = safeIntegrityHash(input.specText, 'approved_spec_integrity_hash', 'approved spec', errors);

  const planIntegrityHash = requireHash(plan.frontmatter.approved_plan_integrity_hash, 'approved plan frontmatter approved_plan_integrity_hash', errors);
  const contextPlanIntegrityHash = requireHash(context.approved_plan_integrity_hash, 'plan_context approved_plan_integrity_hash', errors);
  for (const [label, value] of [
    ['approved plan frontmatter approved_plan_integrity_hash', planIntegrityHash],
    ['plan_context approved_plan_integrity_hash', contextPlanIntegrityHash]
  ]) {
    if (recomputedPlanIntegrityHash && value && recomputedPlanIntegrityHash !== value) {
      errors.push(`recomputed approved plan integrity hash does not match ${label}`);
    }
  }

  const specIntegrityHash = requireHash(spec.frontmatter.approved_spec_integrity_hash, 'approved spec frontmatter approved_spec_integrity_hash', errors);
  const planSpecIntegrityHash = requireHash(plan.frontmatter.approved_spec_integrity_hash, 'approved plan frontmatter approved_spec_integrity_hash', errors);
  const bodySpecIntegrityHash = requireHash(planBodyContext.approved_spec_integrity_hash, 'approved plan body plan_context approved_spec_integrity_hash', errors);
  const contextSpecIntegrityHash = requireHash(context.approved_spec_integrity_hash, 'plan_context approved_spec_integrity_hash', errors);
  for (const [label, value] of [
    ['approved spec frontmatter approved_spec_integrity_hash', specIntegrityHash],
    ['approved plan frontmatter approved_spec_integrity_hash', planSpecIntegrityHash],
    ['approved plan body plan_context approved_spec_integrity_hash', bodySpecIntegrityHash],
    ['plan_context approved_spec_integrity_hash', contextSpecIntegrityHash]
  ]) {
    if (recomputedSpecIntegrityHash && value && recomputedSpecIntegrityHash !== value) {
      errors.push(`recomputed approved spec integrity hash does not match ${label}`);
    }
  }

  const planHash = requireHash(plan.frontmatter.approved_plan_hash, 'approved plan frontmatter approved_plan_hash', errors);
  const planBodyHash = requireHash(planBodyContext.approved_plan_hash, 'approved plan body plan_context approved_plan_hash', errors);
  const planContextHash = requireHash(context.approved_plan_hash, 'plan_context approved_plan_hash', errors);
  if (recomputedPlanHash && planHash && recomputedPlanHash !== planHash) {
    errors.push('recomputed approved plan hash does not match approved plan frontmatter approved_plan_hash');
  }
  if (recomputedPlanHash && planContextHash && recomputedPlanHash !== planContextHash) {
    errors.push('recomputed approved plan hash does not match plan_context approved_plan_hash');
  }
  if (recomputedPlanHash && planBodyHash && recomputedPlanHash !== planBodyHash) {
    errors.push('recomputed approved plan hash does not match approved plan body plan_context approved_plan_hash');
  }

  const specHash = requireHash(spec.frontmatter.approved_spec_hash, 'approved spec frontmatter approved_spec_hash', errors);
  const specBodyHash = optionalHash(specBodyContext.approved_spec_hash, 'approved spec body spec_context approved_spec_hash', errors);
  const planSpecHash = requireHash(plan.frontmatter.approved_spec_hash, 'approved plan frontmatter approved_spec_hash', errors);
  const planBodySpecHash = requireHash(planBodyContext.approved_spec_hash, 'approved plan body plan_context approved_spec_hash', errors);
  const contextSpecHash = requireHash(context.approved_spec_hash, 'plan_context approved_spec_hash', errors);
  for (const [label, value] of [
    ['approved spec frontmatter approved_spec_hash', specHash],
    ['approved spec body spec_context approved_spec_hash', specBodyHash],
    ['approved plan frontmatter approved_spec_hash', planSpecHash],
    ['approved plan body plan_context approved_spec_hash', planBodySpecHash],
    ['plan_context approved_spec_hash', contextSpecHash],
  ]) {
    if (recomputedSpecHash && value && recomputedSpecHash !== value) {
      errors.push(`recomputed approved spec hash does not match ${label}`);
    }
  }

  const actualPlanPath = canonicalArtifactPath(input.planPath, 'approved plan path', errors);
  requireApprovedArtifactRoot(actualPlanPath, '.sdcorejs/plans/', 'approved plan path', errors);
  const revokedExecutionIdentity = lookupRevokedExecutionPlanIdentity({
    planPath: actualPlanPath,
    planHash: recomputedPlanHash,
    planIntegrityHash: recomputedPlanIntegrityHash
  });
  if (revokedExecutionIdentity !== null) {
    errors.push(
      `approved plan execution authority is revoked: exact R${revokedExecutionIdentity.revision} identity is historical-only and superseded by ${revokedExecutionIdentity.superseded_by}`
    );
  }
  const bodyPlanPath = canonicalArtifactPath(planBodyContext.approved_plan_path, 'approved plan body plan_context approved_plan_path', errors);
  const contextPlanPath = canonicalArtifactPath(context.approved_plan_path, 'plan_context approved_plan_path', errors);
  for (const [label, value] of [
    ['approved plan body plan_context approved_plan_path', bodyPlanPath],
    ['plan_context approved_plan_path', contextPlanPath],
  ]) {
    if (actualPlanPath && value && actualPlanPath !== value) {
      errors.push(`${label} does not match the loaded approved plan path`);
    }
  }

  const actualSpecPath = canonicalArtifactPath(input.specPath, 'approved spec path', errors);
  requireApprovedArtifactRoot(actualSpecPath, '.sdcorejs/specs/', 'approved spec path', errors);
  const specBodyPath = optionalArtifactPath(specBodyContext.approved_spec_path, 'approved spec body spec_context approved_spec_path', errors);
  const planSpecPath = canonicalArtifactPath(plan.frontmatter.sourceSpecPath, 'approved plan sourceSpecPath', errors);
  const planBodySpecPath = canonicalArtifactPath(planBodyContext.approved_spec_path, 'approved plan body plan_context approved_spec_path', errors);
  const contextSpecPath = canonicalArtifactPath(context.approved_spec_path, 'plan_context approved_spec_path', errors);
  for (const [label, value] of [
    ['approved spec body spec_context approved_spec_path', specBodyPath],
    ['approved plan sourceSpecPath', planSpecPath],
    ['approved plan body plan_context approved_spec_path', planBodySpecPath],
    ['plan_context approved_spec_path', contextSpecPath],
  ]) {
    if (actualSpecPath && value && actualSpecPath !== value) {
      errors.push(`${label} does not match the loaded approved spec path`);
    }
  }

  compareRequiredScalar('contract_id', [
    ['approved spec frontmatter', spec.frontmatter.contract_id],
    ['approved spec body spec_context', specBodyContext.contract_id],
    ['approved plan frontmatter', plan.frontmatter.contract_id],
    ['approved plan body plan_context', planBodyContext.contract_id],
    ['plan_context', context.contract_id],
  ], errors);
  compareOptionalRequiredScalar('requirement_id', [
    ['approved spec frontmatter', spec.frontmatter.requirement_id],
    ['approved spec body spec_context', specBodyContext.requirement_id],
    ['approved plan frontmatter', plan.frontmatter.requirement_id],
    ['approved plan body plan_context', planBodyContext.requirement_id],
    ['plan_context', context.requirement_id],
  ], errors);
  const featureIdentityEntries = [
    ['approved spec frontmatter', spec.frontmatter.feature_id],
    ['approved spec body spec_context', specBodyContext.feature_id],
    ['approved plan frontmatter', plan.frontmatter.feature_id],
    ['approved plan body plan_context', planBodyContext.feature_id],
    ['plan_context', context.feature_id],
  ];
  const productIdentityRequired = featureIdentityEntries.some(([, value]) => value !== undefined && value !== null && value !== '')
    || [spec.frontmatter.track, plan.frontmatter.track, context.track].includes('product')
    || [planBodyContext.product_action, context.product_action].some((action) => action && action !== 'not-applicable')
    || [planBodyContext.product_action_authority, context.product_action_authority].some(
      (authority) => isPlainObject(authority) && authority.mode !== 'none'
    );
  if (productIdentityRequired) compareRequiredScalar('feature_id', featureIdentityEntries, errors);
  comparePositiveInteger('requirement_revision', [
    ['approved spec frontmatter', spec.frontmatter.requirement_revision],
    ['approved spec body spec_context', specBodyContext.requirement_revision],
    ['approved plan frontmatter', plan.frontmatter.requirement_revision],
    ['approved plan body plan_context', planBodyContext.requirement_revision],
    ['plan_context', context.requirement_revision],
  ], errors);
  compareRequirementIds([
    ['approved spec frontmatter', spec.frontmatter.requirement_ids],
    ['approved spec body spec_context', specBodyContext.requirement_ids],
    ['approved plan frontmatter', plan.frontmatter.requirement_ids],
    ['approved plan body plan_context', planBodyContext.requirement_ids],
    ['plan_context', context.requirement_ids],
  ], errors);
  comparePathLists('allowed_paths', [
    ['approved plan frontmatter', plan.frontmatter.allowed_paths],
    ['approved plan body plan_context', planBodyContext.allowed_paths],
    ['plan_context', context.allowed_paths],
  ], false, errors);
  comparePathLists('prohibited_paths', [
    ['approved plan frontmatter', plan.frontmatter.prohibited_paths],
    ['approved plan body plan_context', planBodyContext.prohibited_paths],
    ['plan_context', context.prohibited_paths],
  ], true, errors);
  compareClosedEnum('track', [
    ['approved plan frontmatter', plan.frontmatter.track],
    ['approved plan body plan_context', planBodyContext.track],
    ['plan_context', context.track],
  ], EXECUTION_TRACKS, errors);
  compareClosedEnum('target_root_kind', [
    ['approved plan frontmatter', plan.frontmatter.target_root_kind],
    ['approved plan body plan_context', planBodyContext.target_root_kind],
    ['plan_context', context.target_root_kind],
  ], TARGET_ROOT_KINDS, errors);
  compareClosedEnum('stack_profile', [
    ['approved plan frontmatter', plan.frontmatter.stack_profile],
    ['approved plan body plan_context', planBodyContext.stack_profile],
    ['plan_context', context.stack_profile],
  ], STACK_PROFILES, errors);
  compareProductActionAuthority({
    bodyContext: planBodyContext,
    handoffContext: context,
    planPath: actualPlanPath,
    planHash: recomputedPlanHash,
    planIntegrityHash: recomputedPlanIntegrityHash
  }, errors);
  compareExactScalar('source', [
    ['approved plan body plan_context', planBodyContext.source],
    ['plan_context', context.source],
  ], (value, label) => value === 'sdcorejs-plan'
    ? value
    : invalid(`${label} source must be sdcorejs-plan`, errors), errors);
  compareExactScalar('target_root', [
    ['approved plan body plan_context', planBodyContext.target_root],
    ['plan_context', context.target_root],
  ], (value, label) => canonicalTargetRoot(value, `${label} target_root`, errors), errors);
  comparePositiveInteger('task_count', [
    ['approved plan frontmatter', plan.frontmatter.taskCount],
    ['approved plan body plan_context', planBodyContext.task_count],
    ['plan_context', context.task_count],
  ], errors);
  comparePositiveInteger('phase_count', [
    ['approved plan frontmatter', plan.frontmatter.phaseCount],
    ['approved plan body plan_context', planBodyContext.phase_count],
    ['plan_context', context.phase_count],
  ], errors);
  comparePathLists('generated_artifacts', [
    ['approved plan body plan_context', planBodyContext.generated_artifacts],
    ['plan_context', context.generated_artifacts],
  ], true, errors);
  comparePathLists('docs_artifacts', [
    ['approved plan body plan_context', planBodyContext.docs_artifacts],
    ['plan_context', context.docs_artifacts],
  ], true, errors);
  compareOptionalExactScalar('supersedes', [
    ['approved plan frontmatter', plan.frontmatter.supersedes],
    ['approved plan body plan_context', planBodyContext.supersedes],
    ['plan_context', context.supersedes],
  ], (value, label) => value === null
    ? null
    : canonicalArtifactPath(value, `${label} supersedes`, errors), errors);
  compareChangeBoundary('dependency_changes', plan.frontmatter.dependency_changes,
    planBodyContext.dependency_changes, context.dependency_changes, canonicalDependencyChanges, errors);
  compareChangeBoundary('env_changes', plan.frontmatter.env_changes,
    planBodyContext.env_changes, context.env_changes, canonicalEnvChanges, errors);
  compareChangeBoundary('migration_changes', plan.frontmatter.migration_changes,
    planBodyContext.migration_changes, context.migration_changes, canonicalMigrationChanges, errors);
  compareStructuredField('verification_strategy', planBodyContext.verification_strategy,
    context.verification_strategy, canonicalVerificationStrategy, errors);
  compareStructuredField('frontend_architecture', planBodyContext.frontend_architecture,
    context.frontend_architecture, canonicalFrontendArchitecture, errors);
  compareStructuredField('finish_tail', planBodyContext.finish_tail,
    context.finish_tail, canonicalFinishTail, errors);
  compareOptionalStructuredField('parallel_candidates', planBodyContext.parallel_candidates,
    context.parallel_candidates, canonicalParallelCandidates, errors);
  compareOptionalStructuredField('approval', planBodyContext.approval,
    context.approval, canonicalPlanApproval, errors);
  compareOptionalStructuredField('change_control', planBodyContext.change_control,
    context.change_control, canonicalChangeControl, errors);
  compareParallelContractIdentity(plan.frontmatter, planBodyContext, context, errors);

  return [...new Set(errors)];
}

function safeHash(text, hashField, label, errors) {
  try {
    return hashApprovedSnapshot(text, hashField);
  } catch (error) {
    errors.push(`${label} canonical hash failed: ${error.message}`);
    return null;
  }
}

function safeIntegrityHash(text, integrityField, label, errors) {
  try {
    return hashApprovedSnapshotIntegrity(text, integrityField);
  } catch (error) {
    errors.push(`${label} canonical integrity hash failed: ${error.message}`);
    return null;
  }
}

function parseSnapshot(text, label, errors) {
  if (typeof text !== 'string') {
    errors.push(`${label} text must be a string`);
    return null;
  }
  const normalized = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  if (!normalized.startsWith('---\n')) {
    errors.push(`${label} must start with YAML frontmatter`);
    return null;
  }
  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) {
    errors.push(`${label} must contain a closing YAML frontmatter delimiter`);
    return null;
  }
  const frontmatter = parseTopLevelFrontmatter(normalized.slice(4, end), label, errors);
  return { frontmatter, body: normalized.slice(end + '\n---\n'.length) };
}

function parseEmbeddedContext(body, rootKey, label, errors) {
  const fences = body.matchAll(/^```(?:yaml|yml)\s*\n([\s\S]*?)^```\s*$/gm);
  const matches = [];
  for (const fence of fences) {
    if (!new RegExp(`^${rootKey}:\\s*$`, 'm').test(fence[1])) continue;
    const document = parseStrictYaml(fence[1], `${label} YAML`, errors);
    if (isPlainObject(document) && Object.hasOwn(document, rootKey)) matches.push(document[rootKey]);
  }
  if (matches.length !== 1) {
    errors.push(`${label} must contain exactly one YAML ${rootKey} block`);
    return null;
  }
  if (!isPlainObject(matches[0])) {
    errors.push(`${label} ${rootKey} must be an object`);
    return null;
  }
  return matches[0];
}

function parseTopLevelFrontmatter(block, label, errors) {
  const result = parseStrictYaml(block, `${label} frontmatter`, errors);
  if (!isPlainObject(result)) {
    errors.push(`${label} frontmatter must be an object`);
    return {};
  }
  return result;
}

function parseStrictYaml(block, label, errors) {
  const lines = block.split('\n');
  const state = { lines, label, errors };
  const first = nextYamlContent(lines, 0);
  if (first === -1) return {};
  if (yamlIndent(lines[first], label, first, errors) !== 0) {
    errors.push(`${label} line ${first + 1} must start at indentation zero`);
    return {};
  }
  const parsed = parseYamlNode(state, first, 0);
  const trailing = nextYamlContent(lines, parsed.next);
  if (trailing !== -1) errors.push(`${label} line ${trailing + 1} was not parsed`);
  return parsed.value;
}

function parseYamlNode(state, index, indent) {
  const line = state.lines[index];
  return line.slice(indent).startsWith('-')
    ? parseYamlSequence(state, index, indent)
    : parseYamlMapping(state, index, indent);
}

function parseYamlMapping(state, index, indent, seed = {}) {
  const result = seed;
  let cursor = index;
  while ((cursor = nextYamlContent(state.lines, cursor)) !== -1) {
    const currentIndent = yamlIndent(state.lines[cursor], state.label, cursor, state.errors);
    if (currentIndent < indent) break;
    if (currentIndent !== indent) {
      state.errors.push(`${state.label} line ${cursor + 1} has unexpected indentation`);
      cursor += 1;
      continue;
    }
    const content = state.lines[cursor].slice(indent);
    if (content.startsWith('-')) break;
    const field = content.match(/^([A-Za-z_][A-Za-z0-9_-]*):(?:[ \t]*(.*))?$/);
    if (!field) {
      state.errors.push(`${state.label} line ${cursor + 1} must be a key/value entry`);
      cursor += 1;
      continue;
    }
    const [, key, rawValue = ''] = field;
    if (Object.hasOwn(result, key)) state.errors.push(`${state.label} duplicates ${key}`);
    if (rawValue !== '') {
      result[key] = parseYamlScalar(rawValue, state.label, cursor, state.errors);
      cursor += 1;
      continue;
    }
    const nestedIndex = nextYamlContent(state.lines, cursor + 1);
    if (nestedIndex === -1 || yamlIndent(state.lines[nestedIndex], state.label, nestedIndex, state.errors) <= indent) {
      result[key] = null;
      cursor += 1;
      continue;
    }
    const nestedIndent = yamlIndent(state.lines[nestedIndex], state.label, nestedIndex, state.errors);
    if (nestedIndent !== indent + 2) {
      state.errors.push(`${state.label} line ${nestedIndex + 1} must indent nested ${key} by two spaces`);
    }
    const parsed = parseYamlNode(state, nestedIndex, nestedIndent);
    result[key] = parsed.value;
    cursor = parsed.next;
  }
  return { value: result, next: cursor === -1 ? state.lines.length : cursor };
}

function parseYamlSequence(state, index, indent) {
  const result = [];
  let cursor = index;
  while ((cursor = nextYamlContent(state.lines, cursor)) !== -1) {
    const currentIndent = yamlIndent(state.lines[cursor], state.label, cursor, state.errors);
    if (currentIndent < indent) break;
    if (currentIndent !== indent) {
      state.errors.push(`${state.label} line ${cursor + 1} has unexpected sequence indentation`);
      cursor += 1;
      continue;
    }
    const item = state.lines[cursor].slice(indent).match(/^-\s*(.*)$/);
    if (!item) break;
    const rawItem = item[1];
    if (!rawItem) {
      const nestedIndex = nextYamlContent(state.lines, cursor + 1);
      if (nestedIndex === -1 || yamlIndent(state.lines[nestedIndex], state.label, nestedIndex, state.errors) <= indent) {
        state.errors.push(`${state.label} line ${cursor + 1} has an empty sequence item`);
        cursor += 1;
        continue;
      }
      const parsed = parseYamlNode(state, nestedIndex, yamlIndent(state.lines[nestedIndex], state.label, nestedIndex, state.errors));
      result.push(parsed.value);
      cursor = parsed.next;
      continue;
    }
    const inlineField = rawItem.match(/^([A-Za-z_][A-Za-z0-9_-]*):(?:[ \t]*(.*))?$/);
    if (!inlineField) {
      result.push(parseYamlScalar(rawItem, state.label, cursor, state.errors));
      cursor += 1;
      continue;
    }
    const object = {};
    const [, key, rawValue = ''] = inlineField;
    if (rawValue === '') {
      const nestedIndex = nextYamlContent(state.lines, cursor + 1);
      if (nestedIndex === -1 || yamlIndent(state.lines[nestedIndex], state.label, nestedIndex, state.errors) <= indent + 2) {
        object[key] = null;
        cursor += 1;
      } else {
        const parsed = parseYamlNode(state, nestedIndex, yamlIndent(state.lines[nestedIndex], state.label, nestedIndex, state.errors));
        object[key] = parsed.value;
        cursor = parsed.next;
      }
    } else {
      object[key] = parseYamlScalar(rawValue, state.label, cursor, state.errors);
      cursor += 1;
    }
    const continuation = nextYamlContent(state.lines, cursor);
    if (continuation !== -1 && yamlIndent(state.lines[continuation], state.label, continuation, state.errors) === indent + 2
      && !state.lines[continuation].slice(indent + 2).startsWith('-')) {
      const parsed = parseYamlMapping(state, continuation, indent + 2, object);
      cursor = parsed.next;
    }
    result.push(object);
  }
  return { value: result, next: cursor === -1 ? state.lines.length : cursor };
}

function nextYamlContent(lines, index) {
  for (let cursor = index; cursor < lines.length; cursor += 1) {
    if (lines[cursor].trim() && !/^\s*#/.test(lines[cursor])) return cursor;
  }
  return -1;
}

function yamlIndent(line, label, index, errors) {
  const prefix = line.match(/^\s*/)?.[0] ?? '';
  if (prefix.includes('\t')) errors.push(`${label} line ${index + 1} must not use tab indentation`);
  return prefix.length;
}

function parseYamlScalar(rawValue, label, index, errors) {
  const value = rawValue.trim();
  if (/^\[.*\]$/.test(value)) {
    const inner = value.slice(1, -1).trim();
    return inner ? inner.split(',').map((item) => parseYamlScalar(item, label, index, errors)) : [];
  }
  if (value === 'null' || value === '~') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+$/.test(value)) return Number(value);
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value);
    } catch {
      errors.push(`${label} line ${index + 1} contains an invalid quoted scalar`);
      return value.slice(1, -1);
    }
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (/^(?:[&*!]|[|>])(?:\s|$)/.test(value) || /[\u0000-\u001f\u2028\u2029]/.test(value)) {
    errors.push(`${label} line ${index + 1} contains an unsafe YAML scalar`);
  }
  return value;
}

function requireHash(value, label, errors) {
  if (typeof value !== 'string' || !HASH_PATTERN.test(value)) {
    errors.push(`${label} must be a SHA-256 hex digest`);
    return null;
  }
  return value.toLowerCase();
}

function optionalHash(value, label, errors) {
  if (value === undefined || value === null || value === '' || /^<.*>$/.test(String(value))) return null;
  return requireHash(value, label, errors);
}

function canonicalArtifactPath(value, label, errors) {
  if (typeof value !== 'string' || !value.trim()) {
    errors.push(`${label} must be a non-empty relative path`);
    return null;
  }
  const normalizedInput = value.trim().replace(/\\/g, '/');
  if (/^[A-Za-z]:/.test(normalizedInput) || normalizedInput.startsWith('/')) {
    errors.push(`${label} must be repository-relative`);
    return null;
  }
  const normalized = path.posix.normalize(normalizedInput).replace(/^\.\//, '');
  if (normalized === '..' || normalized.startsWith('../')) {
    errors.push(`${label} must not escape the repository root`);
    return null;
  }
  return normalized;
}

function optionalArtifactPath(value, label, errors) {
  if (value === undefined || value === null || value === '' || /^<.*>$/.test(String(value))) return null;
  return canonicalArtifactPath(value, label, errors);
}

function requireApprovedArtifactRoot(value, requiredRoot, label, errors) {
  if (value === null) return;
  if (!value.startsWith(requiredRoot) || !value.endsWith('.md')) {
    errors.push(`${label} must identify an immutable Markdown snapshot under ${requiredRoot}`);
  }
}

function compareRequiredScalar(field, entries, errors) {
  const valid = [];
  for (const [label, value] of entries) {
    if (typeof value !== 'string' || !value.trim()) errors.push(`${label} ${field} must be a non-empty string`);
    else valid.push([label, value.trim()]);
  }
  if (valid.length === entries.length && new Set(valid.map(([, value]) => value)).size !== 1) {
    errors.push(`${field} must match across approved spec frontmatter, approved plan frontmatter, and plan_context`);
  }
}

function compareOptionalRequiredScalar(field, entries, errors) {
  if (entries.every(([, value]) => value === undefined)) return;
  compareRequiredScalar(field, entries, errors);
}

function compareOptionalExactScalar(field, entries, canonicalize, errors) {
  if (entries.every(([, value]) => value === undefined)) return;
  const canonical = entries.map(([label, value]) => {
    if (value === undefined) {
      errors.push(`${label} ${field} is required when another approved plan representation contains it`);
      return [label, INVALID_VALUE];
    }
    return [label, canonicalize(value, label)];
  });
  if (canonical.some(([, value]) => value === INVALID_VALUE || value === undefined)) return;
  if (new Set(canonical.map(([, value]) => JSON.stringify(value))).size !== 1) {
    errors.push(`${field} must match across ${entries.map(([label]) => label).join(', ')}`);
  }
}

function comparePositiveInteger(field, entries, errors) {
  const valid = [];
  for (const [label, value] of entries) {
    if (!Number.isInteger(value) || value < 1) errors.push(`${label} ${field} must be a positive integer`);
    else valid.push([label, value]);
  }
  if (valid.length === entries.length && new Set(valid.map(([, value]) => value)).size !== 1) {
    errors.push(`${field} must match across ${entries.map(([label]) => label).join(', ')}`);
  }
}

function compareRequirementIds(entries, errors) {
  const valid = [];
  for (const [label, value] of entries) {
    if (!Array.isArray(value) || value.length === 0 || value.some((item) => typeof item !== 'string' || !item.trim())) {
      errors.push(`${label} requirement_ids must be a non-empty string array`);
      continue;
    }
    const normalized = value.map((item) => item.trim()).sort();
    if (new Set(normalized).size !== normalized.length) {
      errors.push(`${label} requirement_ids must not contain duplicates`);
      continue;
    }
    valid.push([label, JSON.stringify(normalized)]);
  }
  if (valid.length === entries.length && new Set(valid.map(([, value]) => value)).size !== 1) {
    errors.push('requirement_ids must match across approved spec frontmatter, approved plan frontmatter, and plan_context');
  }
}

function comparePathLists(field, entries, allowEmpty, errors) {
  const valid = [];
  for (const [label, value] of entries) {
    if (!Array.isArray(value) || (!allowEmpty && value.length === 0)
      || value.some((item) => typeof item !== 'string' || !item.trim())) {
      errors.push(`${label} ${field} must be ${allowEmpty ? 'a' : 'a non-empty'} string array`);
      continue;
    }
    const normalized = [];
    let invalid = false;
    for (const item of value) {
      const canonical = canonicalScopePattern(item, `${label} ${field}`, errors);
      if (canonical === null) invalid = true;
      else if (field === 'allowed_paths' && isProtectedApprovedPath(canonical)) {
        errors.push(`${label} ${field} must not allow protected approved snapshot or Git paths: ${item}`);
        invalid = true;
      } else normalized.push(canonical);
    }
    if (invalid) continue;
    normalized.sort();
    if (new Set(normalized).size !== normalized.length) {
      errors.push(`${label} ${field} must not contain duplicates`);
      continue;
    }
    valid.push([label, JSON.stringify(normalized)]);
  }
  if (valid.length === entries.length && new Set(valid.map(([, value]) => value)).size !== 1) {
    errors.push(`${field} must match across ${entries.map(([label]) => label).join(', ')}`);
  }
}

function compareClosedEnum(field, entries, allowed, errors) {
  compareExactScalar(field, entries, (value, label) => {
    if (typeof value !== 'string' || !allowed.has(value.trim())) {
      return invalid(`${label} ${field} must be one of: ${[...allowed].join(', ')}`, errors);
    }
    return value.trim();
  }, errors);
}

function compareExactScalar(field, entries, canonicalize, errors) {
  const canonical = entries.map(([label, value]) => [label, canonicalize(value, label)]);
  if (canonical.some(([, value]) => value === INVALID_VALUE || value === null || value === undefined)) return;
  if (new Set(canonical.map(([, value]) => JSON.stringify(value))).size !== 1) {
    errors.push(`${field} must match across ${entries.map(([label]) => label).join(', ')}`);
  }
}

function canonicalTargetRoot(value, label, errors) {
  const normalized = canonicalSingleLineString(value, label, errors);
  if (normalized === INVALID_VALUE) return INVALID_VALUE;
  if (/^[A-Za-z]:$/.test(normalized)) return `${normalized}/`;
  if (normalized === '/' || normalized === '.') return normalized;
  return normalized.replace(/\\/g, '/').replace(/\/+$/, '');
}

function compareChangeBoundary(field, frontmatterValue, bodyValue, handoffValue, canonicalize, errors) {
  const frontmatter = canonicalize(frontmatterValue, `approved plan frontmatter ${field}`, errors, true);
  const body = canonicalize(bodyValue, `approved plan body plan_context ${field}`, errors, false);
  const handoff = canonicalize(handoffValue, `plan_context ${field}`, errors, false);
  if ([frontmatter, body, handoff].some((value) => value === INVALID_VALUE)) return;
  if (JSON.stringify(body) !== JSON.stringify(handoff)) {
    errors.push(`${field} must match across approved plan body plan_context and plan_context`);
  }
  const bodySummary = { required: body.required, approval_required: body.approval_required };
  if (JSON.stringify(frontmatter) !== JSON.stringify(bodySummary)) {
    errors.push(`${field} required and approval_required must match approved plan frontmatter`);
  }
}

function canonicalDependencyChanges(value, label, errors, summary) {
  const keys = summary ? ['required', 'approval_required'] : ['required', 'packages', 'approval_required'];
  const object = closedObject(value, label, keys, errors);
  if (object === INVALID_VALUE) return INVALID_VALUE;
  const required = canonicalBoolean(object.required, `${label} required`, errors);
  const approvalRequired = canonicalBoolean(object.approval_required, `${label} approval_required`, errors);
  if (summary) return invalidIfNeeded({ required, approval_required: approvalRequired });
  const packages = canonicalStringArray(object.packages, `${label} packages`, errors, {
    allowEmpty: true,
    sort: true,
    item: canonicalPackageName,
  });
  return invalidIfNeeded({ required, packages, approval_required: approvalRequired });
}

function canonicalEnvChanges(value, label, errors, summary) {
  const keys = summary ? ['required', 'approval_required'] : ['required', 'files', 'approval_required'];
  const object = closedObject(value, label, keys, errors);
  if (object === INVALID_VALUE) return INVALID_VALUE;
  const required = canonicalBoolean(object.required, `${label} required`, errors);
  const approvalRequired = canonicalBoolean(object.approval_required, `${label} approval_required`, errors);
  if (summary) return invalidIfNeeded({ required, approval_required: approvalRequired });
  const files = canonicalStringArray(object.files, `${label} files`, errors, {
    allowEmpty: true,
    sort: true,
    item: (item, itemLabel, itemErrors) => canonicalScopePattern(item, itemLabel, itemErrors) ?? INVALID_VALUE,
  });
  return invalidIfNeeded({ required, files, approval_required: approvalRequired });
}

function canonicalMigrationChanges(value, label, errors, summary) {
  const keys = summary ? ['required', 'approval_required'] : ['required', 'description', 'approval_required'];
  const object = closedObject(value, label, keys, errors);
  if (object === INVALID_VALUE) return INVALID_VALUE;
  const required = canonicalBoolean(object.required, `${label} required`, errors);
  const approvalRequired = canonicalBoolean(object.approval_required, `${label} approval_required`, errors);
  if (summary) return invalidIfNeeded({ required, approval_required: approvalRequired });
  const description = object.description === null
    ? null
    : canonicalSingleLineString(object.description, `${label} description`, errors);
  return invalidIfNeeded({ required, description, approval_required: approvalRequired });
}

function canonicalVerificationStrategy(value, label, errors) {
  const object = closedObject(value, label, [
    'package_manager', 'scripts_detected', 'commands_planned', 'commands_skipped',
    'focused_checks', 'broad_checks'
  ], errors);
  if (object === INVALID_VALUE) return INVALID_VALUE;
  const packageManager = typeof object.package_manager === 'string' && PACKAGE_MANAGERS.has(object.package_manager.trim())
    ? object.package_manager.trim()
    : invalid(`${label} package_manager must be one of: ${[...PACKAGE_MANAGERS].join(', ')}`, errors);
  const scriptsDetected = canonicalObjectArray(object.scripts_detected, `${label} scripts_detected`, ['name'], errors,
    (entry, entryLabel) => {
      const name = canonicalSingleLineString(entry.name, `${entryLabel} name`, errors);
      if (name !== INVALID_VALUE && !/^[A-Za-z0-9][A-Za-z0-9:._-]*$/.test(name)) {
        return invalid(`${entryLabel} name must be a safe package script name`, errors);
      }
      return invalidIfNeeded({ name });
    });
  const commandsPlanned = canonicalObjectArray(object.commands_planned, `${label} commands_planned`,
    ['command_or_script', 'reason'], errors, (entry, entryLabel) => invalidIfNeeded({
      command_or_script: canonicalSingleLineString(entry.command_or_script, `${entryLabel} command_or_script`, errors),
      reason: canonicalSingleLineString(entry.reason, `${entryLabel} reason`, errors),
    }));
  const commandsSkipped = canonicalObjectArray(object.commands_skipped, `${label} commands_skipped`,
    ['command_or_probe', 'reason'], errors, (entry, entryLabel) => invalidIfNeeded({
      command_or_probe: canonicalSingleLineString(entry.command_or_probe, `${entryLabel} command_or_probe`, errors),
      reason: canonicalSingleLineString(entry.reason, `${entryLabel} reason`, errors),
    }));
  const focusedChecks = canonicalStringArray(object.focused_checks, `${label} focused_checks`, errors,
    { allowEmpty: true, sort: false, item: canonicalSingleLineString });
  const broadChecks = canonicalStringArray(object.broad_checks, `${label} broad_checks`, errors,
    { allowEmpty: true, sort: false, item: canonicalSingleLineString });
  return invalidIfNeeded({
    package_manager: packageManager,
    scripts_detected: scriptsDetected,
    commands_planned: commandsPlanned,
    commands_skipped: commandsSkipped,
    focused_checks: focusedChecks,
    broad_checks: broadChecks,
  });
}

function canonicalFinishTail(value, label, errors) {
  const keys = [
    'docs_before_final_branch_ready', 'verify_before_done',
    'branch_ready_final_gate', 'no_writes_after_branch_ready'
  ];
  const object = closedObject(value, label, keys, errors);
  if (object === INVALID_VALUE) return INVALID_VALUE;
  const result = {};
  for (const key of keys) result[key] = canonicalBoolean(object[key], `${label} ${key}`, errors);
  return invalidIfNeeded(result);
}

function lookupPreSchemaProductActionIdentity({
  planPath,
  planHash,
  planIntegrityHash,
  productAction
}) {
  if (![planPath, planHash, planIntegrityHash, productAction].every((value) => typeof value === 'string')) {
    return null;
  }
  return PRE_SCHEMA_PRODUCT_ACTION_IDENTITIES.find((identity) => (
    identity.plan_path === planPath
    && identity.approved_plan_hash === planHash
    && identity.approved_plan_integrity_hash === planIntegrityHash
    && identity.product_action === productAction
  )) ?? null;
}

function lookupRevokedExecutionPlanIdentity({ planPath, planHash, planIntegrityHash }) {
  if (![planPath, planHash, planIntegrityHash].every((value) => typeof value === 'string')) {
    return null;
  }
  return REVOKED_EXECUTION_PLAN_IDENTITIES.find((identity) => (
    identity.plan_path === planPath
    && identity.approved_plan_hash === planHash
    && identity.approved_plan_integrity_hash === planIntegrityHash
  )) ?? null;
}

function normalizeLegacyProductAction(identity, planAllowedPaths) {
  if (identity.product_action === 'not-applicable') {
    return {
      schema_version: 1,
      mode: 'none',
      purpose: 'none',
      sequence_id: null,
      steps: [],
      terminal_step_id: null
    };
  }
  const action = identity.product_action;
  const readonly = action === 'audit-readonly';
  const stepId = 'pre-schema-' + action;
  return {
    schema_version: 1,
    mode: 'single',
    purpose: 'standalone',
    sequence_id: 'pre-schema-sequence-' + identity.approved_plan_hash.slice(0, 16),
    steps: [{
      step_id: stepId,
      ordinal: 1,
      action,
      write_policy: readonly ? 'deny' : 'allow',
      allowed_paths: readonly
        ? []
        : Array.isArray(planAllowedPaths)
          ? [...planAllowedPaths].sort()
          : [],
      predecessor_step_id: null,
      required_checkpoint: 'pre-schema-plan-validated'
    }],
    terminal_step_id: stepId
  };
}

function canonicalProductActionEnum(value, label, allowed, errors) {
  if (typeof value !== 'string' || !allowed.has(value.trim())) {
    return invalid(label + ' must be one of: ' + [...allowed].join(', '), errors);
  }
  return value.trim();
}

function canonicalProductActionScopeList(
  value,
  label,
  errors,
  { allowEmpty, allowProtected = false }
) {
  return canonicalStringArray(value, label, errors, {
    allowEmpty,
    sort: true,
    item: (entry, entryLabel, itemErrors) => {
      const normalized = canonicalScopePattern(entry, entryLabel, itemErrors);
      if (normalized === null) return INVALID_VALUE;
      const globError = validateApprovedPlanScopeGlobPattern(normalized);
      if (globError !== null) return invalid(entryLabel + ' ' + globError, itemErrors);
      if (!allowProtected && isProtectedApprovedPath(normalized)) {
        return invalid(entryLabel + ' must not target protected approved snapshot or Git paths', itemErrors);
      }
      return normalized;
    }
  });
}

function canonicalProductActionStep(
  value,
  label,
  errors,
  { planAllowedPaths, planProhibitedPaths }
) {
  const object = closedObject(value, label, PRODUCT_ACTION_STEP_FIELDS, errors);
  if (object === INVALID_VALUE) return INVALID_VALUE;
  const stepId = canonicalSingleLineString(object.step_id, label + ' step_id', errors);
  const ordinal = Number.isInteger(object.ordinal) && object.ordinal > 0
    ? object.ordinal
    : invalid(label + ' ordinal must be a positive integer', errors);
  const action = typeof object.action === 'string' && REAL_PRODUCT_ACTIONS.has(object.action.trim())
    ? object.action.trim()
    : invalid(
      label + ' action must be a real product action; expected one of: '
        + [...REAL_PRODUCT_ACTIONS].join(', '),
      errors
    );
  const writePolicy = canonicalProductActionEnum(
    object.write_policy,
    label + ' write_policy',
    PRODUCT_ACTION_WRITE_POLICIES,
    errors
  );
  const allowedPaths = canonicalProductActionScopeList(
    object.allowed_paths,
    label + ' allowed_paths',
    errors,
    { allowEmpty: true }
  );
  const predecessorStepId = canonicalNullableSingleLineString(
    object.predecessor_step_id,
    label + ' predecessor_step_id',
    errors
  );
  const requiredCheckpoint = canonicalSingleLineString(
    object.required_checkpoint,
    label + ' required_checkpoint',
    errors
  );

  if (action !== INVALID_VALUE && writePolicy !== INVALID_VALUE && allowedPaths !== INVALID_VALUE) {
    if (action === 'audit-readonly') {
      if (writePolicy !== 'deny') errors.push(label + ' audit-readonly write_policy must be deny');
      if (allowedPaths.length !== 0) errors.push(label + ' audit-readonly allowed_paths must be empty');
    } else {
      if (writePolicy !== 'allow') errors.push(label + ' write-capable action write_policy must be allow');
      if (allowedPaths.length === 0) errors.push(label + ' write-capable action allowed_paths must be non-empty');
    }
    const approvedAllowed = planAllowedPaths === INVALID_VALUE ? [] : planAllowedPaths;
    const approvedProhibited = planProhibitedPaths === INVALID_VALUE ? [] : planProhibitedPaths;
    const caseInsensitive = process.platform === 'win32';
    for (const allowedPath of allowedPaths) {
      if (!approvedAllowed.some((pattern) => approvedPlanScopePatternIsContainedBy(
        allowedPath,
        pattern,
        caseInsensitive
      ))) {
        errors.push(label + ' allowed_paths widens outside approved plan allowed_paths: ' + allowedPath);
      }
      if (approvedProhibited.some((pattern) => approvedPlanScopePatternsMayIntersect(
        allowedPath,
        pattern,
        caseInsensitive
      ))) {
        errors.push(label + ' allowed_paths intersects approved plan prohibited_paths: ' + allowedPath);
      }
    }
  }

  return invalidIfNeeded({
    step_id: stepId,
    ordinal,
    action,
    write_policy: writePolicy,
    allowed_paths: allowedPaths,
    predecessor_step_id: predecessorStepId,
    required_checkpoint: requiredCheckpoint
  });
}

function canonicalProductActionAuthority(
  value,
  label,
  errors,
  { planAllowedPaths, planProhibitedPaths } = {}
) {
  const object = closedObject(value, label, PRODUCT_ACTION_AUTHORITY_FIELDS, errors);
  if (object === INVALID_VALUE) return INVALID_VALUE;
  const approvedAllowed = canonicalProductActionScopeList(
    planAllowedPaths,
    label + ' approved plan allowed_paths',
    errors,
    { allowEmpty: false }
  );
  const approvedProhibited = canonicalProductActionScopeList(
    planProhibitedPaths,
    label + ' approved plan prohibited_paths',
    errors,
    { allowEmpty: true, allowProtected: true }
  );
  const schemaVersion = object.schema_version === 1
    ? 1
    : invalid(label + ' schema_version must be integer 1', errors);
  const mode = canonicalProductActionEnum(
    object.mode,
    label + ' mode',
    PRODUCT_ACTION_AUTHORITY_MODES,
    errors
  );
  const purpose = canonicalProductActionEnum(
    object.purpose,
    label + ' purpose',
    PRODUCT_ACTION_AUTHORITY_PURPOSES,
    errors
  );
  const sequenceId = canonicalNullableSingleLineString(
    object.sequence_id,
    label + ' sequence_id',
    errors
  );
  const steps = Array.isArray(object.steps)
    ? object.steps.map((step, index) => canonicalProductActionStep(
      step,
      label + ' steps[' + index + ']',
      errors,
      {
        planAllowedPaths: approvedAllowed,
        planProhibitedPaths: approvedProhibited
      }
    ))
    : invalid(label + ' steps must be an array', errors);
  const terminalStepId = canonicalNullableSingleLineString(
    object.terminal_step_id,
    label + ' terminal_step_id',
    errors
  );
  const result = invalidIfNeeded({
    schema_version: schemaVersion,
    mode,
    purpose,
    sequence_id: sequenceId,
    steps,
    terminal_step_id: terminalStepId
  });
  if (result === INVALID_VALUE) return INVALID_VALUE;

  if (mode === 'none') {
    if (purpose !== 'none') errors.push(label + ' mode none requires purpose none');
    if (sequenceId !== null) errors.push(label + ' mode none requires a null sequence_id');
    if (steps.length !== 0) errors.push(label + ' mode none requires empty steps');
    if (terminalStepId !== null) errors.push(label + ' mode none requires a null terminal_step_id');
  } else {
    if (sequenceId === null) errors.push(label + ' ' + mode + ' mode requires a non-empty sequence_id');
    if (steps.length === 0) errors.push(label + ' ' + mode + ' mode requires at least one step');
    const stepIds = steps.map((step) => step.step_id);
    if (new Set(stepIds).size !== stepIds.length) errors.push(label + ' step_id values must be unique');
    for (const [index, step] of steps.entries()) {
      if (step.ordinal !== index + 1) errors.push(label + ' step ordinals must be contiguous and match array order');
      const expectedPredecessor = index === 0 ? null : steps[index - 1].step_id;
      if (step.predecessor_step_id !== expectedPredecessor) {
        errors.push(label + ' predecessor_step_id must reference the immediately prior step');
      }
    }
    if (steps.length > 0 && terminalStepId !== steps.at(-1).step_id) {
      errors.push(label + ' terminal_step_id must equal the final step_id');
    }
  }

  if (mode === 'single') {
    if (purpose !== 'standalone') errors.push(label + ' single mode requires purpose standalone');
    if (steps.length !== 1) errors.push(label + ' single mode requires exactly one step');
  }
  if (mode === 'ordered') {
    if (purpose !== 'final-tail') errors.push(label + ' ordered mode requires purpose final-tail');
    if (steps.length !== 2) {
      errors.push(label + ' final-tail requires exactly two ordered steps');
    } else {
      const [syncStep, auditStep] = steps;
      if (syncStep.action !== 'traceability-sync'
        || syncStep.write_policy !== 'allow'
        || syncStep.allowed_paths.length === 0
        || syncStep.required_checkpoint !== 'write-tail-complete') {
        errors.push(label + ' final-tail first step must be write-allowed traceability-sync after write-tail-complete');
      }
      if (auditStep.action !== 'audit-readonly'
        || auditStep.write_policy !== 'deny'
        || auditStep.allowed_paths.length !== 0
        || auditStep.required_checkpoint !== 'post-sync-deny-write-verified') {
        errors.push(label + ' final-tail second step must be write-denied audit-readonly after post-sync-deny-write-verified');
      }
    }
  }
  return result;
}

function compareProductActionAuthority({
  bodyContext,
  handoffContext,
  planPath,
  planHash,
  planIntegrityHash
}, errors) {
  const bodyHasScalar = Object.hasOwn(bodyContext, 'product_action');
  const bodyHasObject = Object.hasOwn(bodyContext, 'product_action_authority');
  const handoffHasScalar = Object.hasOwn(handoffContext, 'product_action');
  const handoffHasObject = Object.hasOwn(handoffContext, 'product_action_authority');
  if ((bodyHasScalar && bodyHasObject) || (handoffHasScalar && handoffHasObject)) {
    errors.push('product_action and product_action_authority are mutually exclusive; exactly one representation is required');
    return;
  }
  if (bodyHasScalar !== handoffHasScalar || bodyHasObject !== handoffHasObject) {
    errors.push('product_action authority representation must match across approved plan body plan_context and plan_context');
    return;
  }
  if (bodyHasObject) {
    const scope = {
      planAllowedPaths: bodyContext.allowed_paths,
      planProhibitedPaths: bodyContext.prohibited_paths
    };
    const bodyAuthority = canonicalProductActionAuthority(
      bodyContext.product_action_authority,
      'approved plan body plan_context product_action_authority',
      errors,
      scope
    );
    const handoffAuthority = canonicalProductActionAuthority(
      handoffContext.product_action_authority,
      'plan_context product_action_authority',
      errors,
      scope
    );
    if (bodyAuthority !== INVALID_VALUE && handoffAuthority !== INVALID_VALUE
      && JSON.stringify(bodyAuthority) !== JSON.stringify(handoffAuthority)) {
      errors.push('product_action_authority must match across approved plan body plan_context and plan_context');
    }
    return;
  }
  if (!bodyHasScalar) {
    errors.push('exactly one of product_action or product_action_authority is required');
    return;
  }
  const bodyAction = canonicalProductActionEnum(
    bodyContext.product_action,
    'approved plan body plan_context product_action',
    PRE_SCHEMA_PRODUCT_ACTIONS,
    errors
  );
  const handoffAction = canonicalProductActionEnum(
    handoffContext.product_action,
    'plan_context product_action',
    PRE_SCHEMA_PRODUCT_ACTIONS,
    errors
  );
  if (bodyAction === INVALID_VALUE || handoffAction === INVALID_VALUE) return;
  if (bodyAction !== handoffAction) {
    errors.push('product_action must match across approved plan body plan_context and plan_context');
    return;
  }
  const identity = lookupPreSchemaProductActionIdentity({
    planPath,
    planHash,
    planIntegrityHash,
    productAction: bodyAction
  });
  if (identity === null) {
    errors.push('product_action scalar is rejected unless its exact path, body hash, and integrity hash match the pre-schema content-addressed identity manifest; newly authored plans require product_action_authority');
    return;
  }
  if (identity.execution_policy !== 'bootstrap-none') {
    errors.push('pre-schema manifest-bound product_action is read-only and does not authorize execution');
  }
}

function compareStructuredField(field, bodyValue, handoffValue, canonicalize, errors) {
  const body = canonicalize(bodyValue, `approved plan body plan_context ${field}`, errors);
  const handoff = canonicalize(handoffValue, `plan_context ${field}`, errors);
  if (body === INVALID_VALUE || handoff === INVALID_VALUE) return;
  if (JSON.stringify(body) !== JSON.stringify(handoff)) {
    errors.push(`${field} must match across approved plan body plan_context and plan_context`);
  }
}

function compareOptionalStructuredField(field, bodyValue, handoffValue, canonicalize, errors) {
  const bodyMissing = bodyValue === undefined || bodyValue === null;
  const handoffMissing = handoffValue === undefined || handoffValue === null;
  if (bodyMissing && handoffMissing) return;
  if (bodyMissing !== handoffMissing) {
    errors.push(`${field} must be present in both approved plan body plan_context and plan_context`);
    return;
  }
  compareStructuredField(field, bodyValue, handoffValue, canonicalize, errors);
}

function canonicalFrontendArchitecture(value, label, errors) {
  const keys = [
    'required', 'not_applicable_reason', 'project_conventions', 'component_tree',
    'reuse_decisions', 'file_decisions', 'responsibilities', 'state_owners',
    'service_boundaries', 'data_flow', 'declarations_and_registration',
    'public_exports', 'tests', 'decomposition_rationale'
  ];
  const object = allowedObject(value, label, keys, ['required', 'not_applicable_reason'], errors);
  if (object === INVALID_VALUE) return INVALID_VALUE;
  const result = {
    required: canonicalBoolean(object.required, `${label} required`, errors),
    not_applicable_reason: canonicalNullableSingleLineString(
      object.not_applicable_reason,
      `${label} not_applicable_reason`,
      errors,
    ),
  };

  if (result.required === true) {
    for (const key of keys.slice(2)) {
      if (!Object.hasOwn(object, key)) errors.push(`${label} is missing ${key} when required is true`);
    }
  } else if (result.required === false && result.not_applicable_reason === null) {
    errors.push(`${label} not_applicable_reason must explain why frontend architecture is not required`);
  }

  if (Object.hasOwn(object, 'project_conventions')) {
    result.project_conventions = canonicalProjectConventions(
      object.project_conventions,
      `${label} project_conventions`,
      errors,
    );
  }
  for (const key of ['component_tree', 'data_flow', 'tests', 'decomposition_rationale']) {
    if (Object.hasOwn(object, key)) {
      result[key] = canonicalStringArray(object[key], `${label} ${key}`, errors, {
        allowEmpty: false,
        sort: false,
        item: canonicalSingleLineString,
      });
    }
  }
  const objectArrays = {
    reuse_decisions: ['need', 'candidate', 'decision', 'reason'],
    file_decisions: ['path', 'decision', 'symbols', 'reason'],
    responsibilities: ['symbol', 'responsibility', 'inputs', 'outputs'],
    state_owners: ['owner', 'state'],
    service_boundaries: ['symbol', 'responsibility', 'scope', 'reason'],
    declarations_and_registration: ['symbol', 'mechanism'],
    public_exports: ['symbol', 'reason'],
  };
  for (const [key, entryKeys] of Object.entries(objectArrays)) {
    if (!Object.hasOwn(object, key)) continue;
    result[key] = canonicalClosedPlainObjectArray(
      object[key],
      `${label} ${key}`,
      entryKeys,
      errors,
    );
  }
  return invalidIfNeeded(result);
}

function canonicalProjectConventions(value, label, errors) {
  const keys = [
    'component_style', 'folder_convention', 'state_convention',
    'service_data_access_convention', 'registration_provider_convention',
    'public_api_barrel_convention', 'test_convention', 'evidence_inspected'
  ];
  const object = closedObject(value, label, keys, errors);
  if (object === INVALID_VALUE) return INVALID_VALUE;
  const result = {};
  for (const key of keys.slice(0, -1)) {
    result[key] = canonicalSingleLineString(object[key], `${label} ${key}`, errors);
  }
  result.evidence_inspected = canonicalStringArray(
    object.evidence_inspected,
    `${label} evidence_inspected`,
    errors,
    { allowEmpty: false, sort: false, item: canonicalSingleLineString },
  );
  return invalidIfNeeded(result);
}

function canonicalParallelCandidates(value, label, errors) {
  const keys = ['allowed', 'frozen_contract', 'units', 'shared_files', 'conflict_risks'];
  const object = closedObject(value, label, keys, errors);
  if (object === INVALID_VALUE) return INVALID_VALUE;
  const frozenContract = canonicalFrozenParallelContract(
    object.frozen_contract,
    `${label} frozen_contract`,
    errors,
  );
  const units = canonicalClosedPlainObjectArray(object.units, `${label} units`, [
    'id', 'title', 'role', 'depends_on', 'produces', 'consumes', 'allowed_paths',
    'prohibited_paths', 'exclusive_resources', 'shared_readonly_resources',
    'result_type', 'verification_command'
  ], errors);
  const sharedFiles = canonicalClosedPlainObjectArray(object.shared_files, `${label} shared_files`, [
    'path', 'owner', 'coordination_strategy'
  ], errors);
  const conflictRisks = canonicalStringArray(object.conflict_risks, `${label} conflict_risks`, errors, {
    allowEmpty: true,
    sort: false,
    item: canonicalSingleLineString,
  });
  return invalidIfNeeded({
    allowed: canonicalBoolean(object.allowed, `${label} allowed`, errors),
    frozen_contract: frozenContract,
    units,
    shared_files: sharedFiles,
    conflict_risks: conflictRisks,
  });
}

function canonicalFrozenParallelContract(value, label, errors) {
  const keys = ['path', 'hash', 'revision', 'derived_from_approved_plan_hash', 'supersedes'];
  const object = closedObject(value, label, keys, errors);
  if (object === INVALID_VALUE) return INVALID_VALUE;
  const result = {};
  for (const key of ['path', 'hash', 'derived_from_approved_plan_hash', 'supersedes']) {
    result[key] = canonicalNullableSingleLineString(object[key], `${label} ${key}`, errors);
  }
  result.revision = object.revision === null
    ? null
    : Number.isInteger(object.revision) && object.revision > 0
      ? object.revision
      : invalid(`${label} revision must be null or a positive integer`, errors);
  return invalidIfNeeded(result);
}

function canonicalPlanApproval(value, label, errors) {
  const object = closedObject(value, label, ['approved', 'approved_at'], errors);
  if (object === INVALID_VALUE) return INVALID_VALUE;
  const approved = canonicalBoolean(object.approved, `${label} approved`, errors);
  let approvedAt = null;
  if (object.approved_at !== null) {
    approvedAt = isIso8601Instant(object.approved_at)
      ? object.approved_at
      : invalid(`${label} approved_at must be null or a valid ISO-8601 instant with timezone`, errors);
  }
  if (approved === true && approvedAt === null) errors.push(`${label} approved_at is required when approved is true`);
  if (approved === false && approvedAt !== null) errors.push(`${label} approved_at must be null when approved is false`);
  return invalidIfNeeded({ approved, approved_at: approvedAt });
}

function canonicalChangeControl(value, label, errors) {
  const object = closedObject(value, label, ['revision', 'supersedes', 'change_reason'], errors);
  if (object === INVALID_VALUE) return INVALID_VALUE;
  const revision = Number.isInteger(object.revision) && object.revision > 0
    ? object.revision
    : invalid(`${label} revision must be a positive integer`, errors);
  return invalidIfNeeded({
    revision,
    supersedes: canonicalNullableSingleLineString(object.supersedes, `${label} supersedes`, errors),
    change_reason: canonicalNullableSingleLineString(object.change_reason, `${label} change_reason`, errors),
  });
}

function canonicalClosedPlainObjectArray(value, label, keys, errors) {
  return canonicalObjectArray(value, label, keys, errors, (entry, entryLabel) => {
    const result = {};
    for (const key of keys) result[key] = canonicalPlainData(entry[key], `${entryLabel} ${key}`, errors);
    return invalidIfNeeded(result);
  });
}

function canonicalPlainData(value, label, errors) {
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'string') return canonicalSingleLineString(value, label, errors);
  if (typeof value === 'number') {
    if (Number.isFinite(value)) return value;
    return invalid(`${label} must contain only finite numbers`, errors);
  }
  if (Array.isArray(value)) {
    const result = value.map((item, index) => canonicalPlainData(item, `${label}[${index}]`, errors));
    return invalidIfNeeded(result);
  }
  if (!isPlainObject(value)) return invalid(`${label} must contain only plain data`, errors);
  const result = {};
  for (const key of Object.keys(value).sort()) {
    if (['__proto__', 'prototype', 'constructor'].includes(key)) {
      return invalid(`${label} contains a prohibited key`, errors);
    }
    result[key] = canonicalPlainData(value[key], `${label}.${key}`, errors);
  }
  return invalidIfNeeded(result);
}

function closedObject(value, label, keys, errors) {
  return allowedObject(value, label, keys, keys, errors);
}

function allowedObject(value, label, keys, requiredKeys, errors) {
  if (!isPlainObject(value)) return invalid(`${label} must be an object`, errors);
  const allowed = new Set(keys);
  let valid = true;
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      errors.push(`${label} contains unsupported field ${key}`);
      valid = false;
    }
  }
  for (const key of requiredKeys) {
    if (!Object.hasOwn(value, key)) {
      errors.push(`${label} is missing ${key}`);
      valid = false;
    }
  }
  return valid ? value : INVALID_VALUE;
}

function rejectUnsupportedFields(value, label, allowed, errors) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) errors.push(`${label} contains unsupported field ${key}`);
  }
}

function canonicalObjectArray(value, label, keys, errors, canonicalize) {
  if (!Array.isArray(value)) return invalid(`${label} must be an array`, errors);
  const result = [];
  for (const [index, entry] of value.entries()) {
    const object = closedObject(entry, `${label}[${index}]`, keys, errors);
    result.push(object === INVALID_VALUE ? INVALID_VALUE : canonicalize(object, `${label}[${index}]`));
  }
  return invalidIfNeeded(result);
}

function canonicalStringArray(value, label, errors, { allowEmpty, sort, item }) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    return invalid(`${label} must be ${allowEmpty ? 'an' : 'a non-empty'} array`, errors);
  }
  const result = value.map((entry, index) => item(entry, `${label}[${index}]`, errors));
  if (result.some((entry) => entry === INVALID_VALUE)) return INVALID_VALUE;
  if (new Set(result).size !== result.length) return invalid(`${label} must not contain duplicates`, errors);
  return sort ? result.sort() : result;
}

function canonicalPackageName(value, label, errors) {
  const result = canonicalSingleLineString(value, label, errors);
  if (result === INVALID_VALUE) return result;
  if (!/^(?:@[A-Za-z0-9._-]+\/)?[A-Za-z0-9][A-Za-z0-9._-]*$/.test(result)) {
    return invalid(`${label} must be a safe package name without a version or shell syntax`, errors);
  }
  return result;
}

function canonicalSingleLineString(value, label, errors) {
  if (typeof value !== 'string' || !value.trim() || /[\u0000-\u001f\u2028\u2029]/.test(value)) {
    return invalid(`${label} must be a non-empty single-line string`, errors);
  }
  return value.trim();
}

function canonicalNullableSingleLineString(value, label, errors) {
  return value === null ? null : canonicalSingleLineString(value, label, errors);
}

function canonicalBoolean(value, label, errors) {
  return typeof value === 'boolean' ? value : invalid(`${label} must be a boolean`, errors);
}

function invalid(message, errors) {
  errors.push(message);
  return INVALID_VALUE;
}

function invalidIfNeeded(value) {
  if (value === INVALID_VALUE) return INVALID_VALUE;
  if (Array.isArray(value)) return value.some((item) => item === INVALID_VALUE) ? INVALID_VALUE : value;
  if (isPlainObject(value)) return Object.values(value).some((item) => item === INVALID_VALUE) ? INVALID_VALUE : value;
  return value;
}

function compareParallelContractIdentity(frontmatter, bodyContext, handoffContext, errors) {
  const sources = [
    ['approved plan frontmatter', frontmatter],
    ['approved plan body plan_context', bodyContext],
    ['plan_context', handoffContext]
  ];
  const fields = [
    'frozen_contract_path', 'frozen_contract_hash', 'ownership_manifest_digest',
    'parallel_contract_revision', 'parallel_contract_supersedes'
  ];
  const isActive = (value) => value !== undefined && value !== null && value !== '' && value !== 'not-applicable';
  if (!sources.some(([, source]) => fields.some((field) => isActive(source[field])))) return;

  const paths = sources.map(([label, source]) => [label, canonicalArtifactPath(source.frozen_contract_path, `${label} frozen_contract_path`, errors)]);
  for (const [label, value] of paths) {
    if (value !== null && (!value.startsWith('.sdcorejs/plans/') || !value.endsWith('.parallel.json'))) {
      errors.push(`${label} frozen_contract_path must identify an immutable .parallel.json artifact under .sdcorejs/plans/`);
    }
  }
  if (paths.every(([, value]) => value !== null) && new Set(paths.map(([, value]) => value)).size !== 1) {
    errors.push('frozen_contract_path must match across approved plan frontmatter, approved plan body plan_context, and plan_context');
  }
  for (const field of ['frozen_contract_hash', 'ownership_manifest_digest']) {
    const hashes = sources.map(([label, source]) => [label, requireHash(source[field], `${label} ${field}`, errors)]);
    if (hashes.every(([, value]) => value !== null) && new Set(hashes.map(([, value]) => value)).size !== 1) {
      errors.push(`${field} must match across approved plan frontmatter, approved plan body plan_context, and plan_context`);
    }
  }

  const revisions = sources.map(([label, source]) => [label, source.parallel_contract_revision]);
  for (const [label, value] of revisions) {
    if (!Number.isInteger(value) || value < 1) errors.push(`${label} parallel_contract_revision must be a positive integer`);
  }
  if (revisions.every(([, value]) => Number.isInteger(value) && value > 0)
    && new Set(revisions.map(([, value]) => value)).size !== 1) {
    errors.push('parallel_contract_revision must match across approved plan frontmatter, approved plan body plan_context, and plan_context');
  }

  const supersedes = sources.map(([label, source]) => [
    label,
    canonicalParallelSupersedes(source.parallel_contract_supersedes, `${label} parallel_contract_supersedes`, errors)
  ]);
  if (supersedes.every(([, value]) => value !== undefined)
    && new Set(supersedes.map(([, value]) => value)).size !== 1) {
    errors.push('parallel_contract_supersedes must match across approved plan frontmatter, approved plan body plan_context, and plan_context');
  }
  const revision = revisions[0][1];
  if (Number.isInteger(revision) && revision === 1 && supersedes.some(([, value]) => value !== null && value !== undefined)) {
    errors.push('parallel contract revision 1 must not supersede another frozen contract');
  }
  if (Number.isInteger(revision) && revision > 1 && supersedes.some(([, value]) => value === null || value === undefined)) {
    errors.push('parallel contract revisions after 1 require parallel_contract_supersedes');
  }
}

function canonicalParallelSupersedes(value, label, errors) {
  if (value === null) return null;
  if (value === undefined || value === '' || value === 'not-applicable') {
    errors.push(`${label} must be null or an immutable prior parallel contract path`);
    return undefined;
  }
  const normalized = canonicalArtifactPath(value, label, errors);
  if (normalized !== null && (!normalized.startsWith('.sdcorejs/plans/') || !normalized.endsWith('.parallel.json'))) {
    errors.push(`${label} must identify an immutable .parallel.json artifact under .sdcorejs/plans/`);
    return undefined;
  }
  return normalized ?? undefined;
}

function isProtectedApprovedPath(value) {
  return value === '.git' || value.startsWith('.git/')
    || value === '.sdcorejs/specs' || value.startsWith('.sdcorejs/specs/')
    || value === '.sdcorejs/plans' || value.startsWith('.sdcorejs/plans/');
}

function validateApprovalMetadata(frontmatter, label, allowedSources, errors) {
  if (!isIso8601Instant(frontmatter.approvedAt)) {
    errors.push(`${label} approvedAt must be a valid ISO-8601 instant with timezone`);
  }
  if (typeof frontmatter.approvedBy !== 'string' || !frontmatter.approvedBy.trim()) {
    errors.push(`${label} approvedBy must be a non-empty string`);
  }
  if (typeof frontmatter.approval_source !== 'string' || !allowedSources.has(frontmatter.approval_source.trim())) {
    errors.push(`${label} approval_source must be ${[...allowedSources].join(' or ')}`);
  }
}

function isIso8601Instant(value) {
  return typeof value === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

function canonicalScopePattern(value, label, errors) {
  if (typeof value !== 'string' || !value.trim()) {
    errors.push(`${label} contains an empty path pattern`);
    return null;
  }
  const candidate = value.trim().replace(/\\/g, '/');
  if (/^[A-Za-z]:/.test(candidate) || candidate.startsWith('/') || candidate.startsWith('//')) {
    errors.push(`${label} path pattern must be repository-relative: ${value}`);
    return null;
  }
  if (/[\u0000-\u001f:]/.test(candidate) || candidate.startsWith('!')) {
    errors.push(`${label} contains an invalid repository path pattern: ${value}`);
    return null;
  }
  const normalized = path.posix.normalize(candidate).replace(/^\.\//, '');
  if (!normalized || normalized === '.' || normalized === '..' || normalized.startsWith('../')) {
    errors.push(`${label} path pattern must not escape the repository root: ${value}`);
    return null;
  }
  const root = normalized.split('/')[0];
  if (!root || /[*?\[\]{}]/.test(root)) {
    errors.push(`${label} path pattern requires a concrete repository root: ${value}`);
    return null;
  }
  return normalized;
}

function canonicalAbsoluteScopeRoot(value, label, errors) {
  if (typeof value !== 'string' || !path.isAbsolute(value)) {
    errors.push(`approved plan write-scope ${label} must be an absolute path`);
    return null;
  }
  return path.resolve(value);
}

function canonicalApprovedPlanScopeTargetRoot(value, repositoryRoot, label, errors) {
  if (value === '.') {
    if (repositoryRoot === null) {
      errors.push(`${label} cannot resolve dot without an absolute repositoryRoot`);
      return null;
    }
    return repositoryRoot;
  }
  if (typeof value !== 'string' || !path.isAbsolute(value)) {
    errors.push(`${label} must be absolute or repository-relative dot`);
    return null;
  }
  return path.resolve(value);
}

function canonicalApprovedPlanScopeList(value, label, errors, { allowEmpty }) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    errors.push(`${label} must be ${allowEmpty ? 'an' : 'a non-empty'} array`);
    return [];
  }
  const normalized = [];
  for (const item of value) {
    const canonical = canonicalScopePattern(item, label, errors);
    if (canonical === null) continue;
    const globError = validateApprovedPlanScopeGlobPattern(canonical);
    if (globError !== null) {
      errors.push(`${label} ${globError}: ${item}`);
      continue;
    }
    normalized.push(canonical);
  }
  normalized.sort();
  if (new Set(normalized).size !== normalized.length) errors.push(`${label} must not contain duplicate canonical patterns`);
  return [...new Set(normalized)];
}

function canonicalApprovedPlanPersistedPaths(value, label, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array`);
    return [];
  }
  const normalized = [];
  for (const item of value) {
    const canonical = canonicalScopePattern(item, label, errors);
    if (canonical === null) continue;
    if (/[*?\[\]{}]/.test(canonical)) {
      errors.push(`${label} entries must be concrete repository-relative paths: ${item}`);
      continue;
    }
    normalized.push(canonical);
  }
  normalized.sort();
  if (new Set(normalized).size !== normalized.length) errors.push(`${label} must not contain duplicate canonical paths`);
  return [...new Set(normalized)];
}

function validateApprovedPlanScopeGlobPattern(value) {
  if (/[^\x20-\x7e]/.test(value)) return 'contains unsupported control or non-ASCII glob syntax';
  if (/[\[\]{}()|!+@]/.test(value)) return 'uses unsupported glob syntax';
  if (/\*{3,}/.test(value)) return 'uses an invalid wildcard sequence';
  if (value.split('/').some((segment) => segment.includes('**') && segment !== '**')) {
    return 'requires ** to occupy a complete path segment';
  }
  return null;
}

function approvedPlanScopePathMatches(relativePath, pattern, caseInsensitive) {
  try {
    const candidate = caseInsensitive ? relativePath.toLowerCase() : relativePath;
    return approvedPlanScopeGlobRegex(pattern, caseInsensitive).test(candidate);
  } catch {
    return false;
  }
}

function approvedPlanScopeGlobRegex(pattern, caseInsensitive) {
  let source = pattern;
  if (validateApprovedPlanScopeGlobPattern(source) !== null) throw new Error('invalid approved plan scope glob');
  if (caseInsensitive) source = source.toLowerCase();
  source = source
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replaceAll('**', '\u0000')
    .replaceAll('*', '[^/]*')
    .replaceAll('?', '[^/]')
    .replaceAll('\u0000', '.*');
  return new RegExp(`^${source}$`);
}

function approvedPlanScopePatternIsContainedBy(contextPattern, planPattern, caseInsensitive) {
  const normalizeCase = (value) => caseInsensitive ? value.toLowerCase() : value;
  const contextValue = normalizeCase(contextPattern);
  const planValue = normalizeCase(planPattern);
  if (contextValue === planValue) return true;
  if (!/[*?]/.test(contextValue) && approvedPlanScopePathMatches(contextValue, planValue, false)) return true;
  const planSegments = planValue.split('/');
  if (planSegments.at(-1) !== '**' || planSegments.slice(0, -1).some((segment) => /[*?]/.test(segment))) return false;
  const planRoot = planSegments.slice(0, -1).join('/');
  if (!planRoot) return true;
  return contextValue.startsWith(`${planRoot}/`);
}

function approvedPlanScopePatternDescriptor(pattern, caseInsensitive) {
  const normalized = caseInsensitive ? pattern.toLowerCase() : pattern;
  const wildcardIndex = normalized.search(/[*?]/);
  if (wildcardIndex === -1) {
    return { root: normalized.replace(/\/$/, ''), prefix: normalized, partial_segment: false };
  }
  const prefix = normalized.slice(0, wildcardIndex);
  return {
    root: prefix.replace(/\/$/, ''),
    prefix,
    partial_segment: prefix.length > 0 && !prefix.endsWith('/')
  };
}

function approvedPlanScopePatternsMayIntersect(left, right, caseInsensitive) {
  const first = approvedPlanScopePatternDescriptor(left, caseInsensitive);
  const second = approvedPlanScopePatternDescriptor(right, caseInsensitive);
  if (!first.root || !second.root) return true;
  if (approvedPlanScopeRepositoryPathsOverlap(first.root, second.root)) return true;
  if (first.partial_segment && second.prefix.startsWith(first.prefix)) return true;
  if (second.partial_segment && first.prefix.startsWith(second.prefix)) return true;
  return false;
}

function approvedPlanScopeRepositoryPathsOverlap(left, right) {
  const first = left.replace(/\/$/, '');
  const second = right.replace(/\/$/, '');
  return first === second || first.startsWith(`${second}/`) || second.startsWith(`${first}/`);
}

function approvedPlanAbsolutePathsEqual(left, right, caseInsensitive) {
  const first = path.resolve(left);
  const second = path.resolve(right);
  return caseInsensitive ? first.toLowerCase() === second.toLowerCase() : first === second;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
