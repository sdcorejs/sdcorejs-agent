import { isDeepStrictEqual } from 'node:util';
import { evaluateRepositoryEvidence, safeSimplifyPath, simplifyLimits, simplifyPreservedSurfaces } from './repository-evidence.mjs';

const APPLY_ACTIONS = new Set(['apply-current-diff', 'apply-explicit-scope']);
const ANALYZE_ACTIONS = new Set(['analyze-current-diff', 'analyze-explicit-scope']);
const GENERATED_MIRROR =
  /^(?:\.claude\/skills|\.claude\/_refs|plugin\/skills|plugin\/_refs|codex\/skills|\.cursor\/rules)\//u;

export const protectedSimplifySurfaces = Object.freeze([
  'security-validation',
  'authentication-authorization',
  'approval-checks',
  'artifact-hashing',
  'repository-ownership',
  'evidence-collection',
  'required-error-handling',
  'generated-source-boundary',
  'tenant-isolation',
  'secret-pii-redaction',
  'concurrency-protection',
  'tests-fixtures-snapshots',
  'public-contracts',
  'dependency-environment-migration-boundaries',
]);

function evaluateLegacyContract(contract) {
  const blockers = [];
  const action = contract?.action;
  const apply = APPLY_ACTIONS.has(action);
  const analyze = ANALYZE_ACTIONS.has(action);
  if (!apply && !analyze && action !== 'planning-handoff') {
    blockers.push(`unsupported simplify action: ${action}`);
  }
  if (contract?.schema_version !== 1) blockers.push('simplify schema_version must be 1');
  if (
    !contract?.artifact_identity?.owner_repository_id ||
    !contract?.artifact_identity?.execution_host_repository_id
  ) {
    blockers.push('simplify artifact owner and execution host are required');
  }
  if (
    contract?.current_repository_id !==
    contract?.artifact_identity?.owner_repository_id
  ) {
    blockers.push('simplify cannot write outside the semantic owner repository');
  }
  if (!/^[a-f0-9]{40}$/u.test(contract?.source_revision ?? '')) {
    blockers.push('simplify source revision is required');
  }
  if (
    contract?.invocation === 'approved-plan' &&
    (!contract.approved_plan_step ||
      contract.approved_plan_step.owner_repository_id !==
        contract.artifact_identity.owner_repository_id)
  ) {
    blockers.push('approved-plan simplify requires a matching owner plan step');
  }
  if ((contract?.simplify_repair_recursion_depth ?? 0) > 1) {
    blockers.push('simplify/repair recursion is forbidden');
  }
  if (contract?.goal === 'line-count-only') {
    blockers.push('line count cannot be the sole simplify objective');
  }

  const files = contract?.scope?.files ?? [];
  for (const file of files) {
    const normalized = String(file.path ?? '').replaceAll('\\', '/');
    if (GENERATED_MIRROR.test(normalized) || file.generated === true) {
      blockers.push(`generated mirror/source boundary is protected: ${normalized}`);
    }
    for (const surface of file.surfaces ?? []) {
      if (protectedSimplifySurfaces.includes(surface)) {
        blockers.push(`protected simplify surface: ${surface}`);
      }
    }
  }

  const passes = contract?.passes ?? [];
  if (passes.length > 2) blockers.push('simplify pass cap exceeded');
  if (analyze && passes.some(({ changed_paths: changedPaths }) => changedPaths?.length)) {
    blockers.push('analyze mode must remain read-only');
  }
  if (apply) {
    if (contract?.baseline?.result !== 'PASSED') {
      blockers.push('apply mode requires a green baseline');
    }
    for (const pass of passes) {
      if (
        pass.verification_result === 'FAILED' &&
        pass.reverted !== true
      ) {
        blockers.push(`failed simplify pass ${pass.pass} was not rolled back`);
      }
    }
    const before = contract?.behavior_evidence?.before;
    const after = contract?.behavior_evidence?.after;
    if (
      !before ||
      !after ||
      before.command !== after.command ||
      before.result !== 'PASSED' ||
      after.result !== 'PASSED' ||
      after.source_revision !== contract.source_revision
    ) {
      blockers.push('behavior-equivalence evidence is missing or not current');
    }
  }
  if (contract?.public_behavior_change === true) {
    blockers.push('public behavior change requires spec/plan revision');
  }

  return {
    schema_version: 1,
    status:
      blockers.length > 0
        ? contract?.public_behavior_change
          ? 'planning-handoff'
          : 'blocked'
        : analyze
          ? 'analyzed'
          : apply
            ? 'verified'
            : 'planning-handoff',
    write_authorized: apply && blockers.length === 0,
    owner_repository_id:
      contract?.artifact_identity?.owner_repository_id ?? null,
    source_revision: contract?.source_revision ?? null,
    passes_used: passes.length,
    blockers,
  };
}

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = value => typeof value === 'string' && value.trim() !== '';
const isRef = value => isObject(value) && safeSimplifyPath(value.artifact_ref) && /^sha256:v1:[a-f0-9]{64}$/u.test(value.approval_hash ?? '');
const hunk = value => isObject(value) && safeSimplifyPath(value.path) && Number.isInteger(value.start_line) && value.start_line >= 1 && Number.isInteger(value.end_line) && value.end_line >= value.start_line;

export function validateSimplifyContext(context, { phase = context?.phase } = {}) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(message); };
  if (!isObject(context)) return { valid: false, blockers: ['simplify_context must be an object'] };
  const fields = ['schema_version', 'source', 'phase', 'session_id', 'action', 'invocation', 'artifact_identity', 'source_revision', 'approved_plan_step', 'target_root', 'target_root_kind', 'baseline', 'preflight_ref', 'scope', 'preserved_surfaces', 'limits', 'passes', 'result', 'verification', 'artifact_context'];
  require(Object.keys(context).every(key => fields.includes(key)), 'unknown simplify_context field; use the canonical v2 schema');
  require(context.schema_version === 2, 'simplify schema_version must be 2');
  require(context.source === 'sdcorejs-simplify', 'simplify source is required');
  require(['preflight', 'postflight'].includes(context.phase), 'simplify phase must be preflight or postflight');
  require(phase === 'consumer' || context.phase === phase, 'simplify phase mismatch');
  require(APPLY_ACTIONS.has(context.action) || ANALYZE_ACTIONS.has(context.action) || context.action === 'planning-handoff', 'unsupported simplify action');
  require(['direct', 'finish-gate', 'approved-plan'].includes(context.invocation), 'unsupported simplify invocation');
  require(isText(context.session_id), 'host session_id is required');
  require(isText(context.target_root), 'target_root is required');
  require(['target-project', 'sdcorejs-agent-authoring-repo', 'skill-pack-authoring-repo', 'unknown'].includes(context.target_root_kind), 'target_root_kind is invalid');
  require(isText(context.artifact_identity?.owner_repository_id) && isText(context.artifact_identity?.execution_host_repository_id), 'simplify owner and execution host are required');
  require(context.artifact_identity?.owner_module_id === null || isText(context.artifact_identity?.owner_module_id), 'owner_module_id must be explicit');
  require(/^[a-f0-9]{40}$/u.test(context.source_revision ?? ''), 'source_revision is required');
  require(context.approved_plan_step === null || (isRef(context.approved_plan_step) && isText(context.approved_plan_step.step_id)), 'approved_plan_step must be null or an approved artifact/step reference');
  require(isRef(context.baseline?.snapshot), 'baseline snapshot reference is required');
  require(context.preflight_ref === null || isRef(context.preflight_ref), 'preflight_ref is invalid');
  require(context.phase !== 'postflight' || isRef(context.preflight_ref), 'postflight needs an actual preflight reference');
  require(isDeepStrictEqual(context.limits, simplifyLimits), 'simplify caps must remain 2/5/8/20');
  for (const key of ['requested', 'eligible_files']) {
    const paths = context.scope?.[key];
    require(Array.isArray(paths) && paths.every(safeSimplifyPath) && new Set(paths).size === paths.length, `scope.${key} must be unique safe repository paths`);
  }
  require(Array.isArray(context.scope?.eligible_hunks) && context.scope.eligible_hunks.every(hunk), 'scope.eligible_hunks must use baseline start_line/end_line coordinates');
  if (Array.isArray(context.scope?.eligible_hunks) && Array.isArray(context.scope?.eligible_files)) {
    require(context.scope.eligible_hunks.every(h => h && context.scope.eligible_files.includes(h.path)), 'hunks must belong to eligible_files');
  }
  require(Array.isArray(context.scope?.excluded) && Array.isArray(context.scope?.expansions), 'scope exclusions and expansions must be explicit arrays');
  require(isObject(context.preserved_surfaces) && isDeepStrictEqual(Object.keys(context.preserved_surfaces).sort(), [...simplifyPreservedSurfaces].sort()), 'all preservation surfaces must be explicit');
  for (const surface of simplifyPreservedSurfaces) {
    const values = ['strings_and_prompts', 'dependencies_and_config'].includes(surface) ? ['pending', 'verified', 'blocked'] : ['pending', 'verified', 'blocked', 'not-applicable'];
    require(values.includes(context.preserved_surfaces?.[surface]), `invalid preservation enum: ${surface}`);
  }
  require(Array.isArray(context.passes) && context.passes.length <= 2, 'simplify pass cap exceeded or ledger missing');
  if (Array.isArray(context.passes)) for (const [index, pass] of context.passes.entries()) {
    require(isObject(pass) && pass.pass === index + 1, 'pass IDs must be contiguous and cannot exceed cap');
    require(isRef(pass?.preflight_ref) && isRef(pass?.before_snapshot) && (pass?.after_snapshot === null || isRef(pass?.after_snapshot)), 'pass snapshot/preflight references are required');
    require(Array.isArray(pass?.changed_paths) && pass.changed_paths.every(safeSimplifyPath) && pass.changed_paths.length <= 5, 'pass changed_paths must be bounded safe paths');
    require(Array.isArray(pass?.hunks) && pass.hunks.every(h => h && safeSimplifyPath(h.path) && ['old_start', 'old_count', 'new_start', 'new_count'].every(k => Number.isInteger(h[k]) && h[k] >= 0)), 'pass hunks must be actual diff coordinates');
    require(['passed', 'failed', 'not-run'].includes(pass?.verification_result) && typeof pass?.reverted === 'boolean', 'pass result/reverted enum is invalid');
    require(pass?.rollback_snapshot === null || isRef(pass?.rollback_snapshot), 'rollback snapshot reference must be explicit');
    require(Array.isArray(pass?.rollback_receipts) && pass.rollback_receipts.every(isRef), 'rollback receipt references must be explicit');
  }
  for (const side of ['before', 'after']) require(Array.isArray(context.verification?.[side]) && context.verification[side].every(isRef), `verification.${side} must contain command receipt references`);
  require(context.verification?.preservation === null || isRef(context.verification?.preservation), 'preservation receipt is invalid');
  require(['covered-by-current-tests', 'not-verified'].includes(context.verification?.behavior_verification), 'v2 does not authorize limited verification');
  require(['passed', 'failed', 'not-run'].includes(context.verification?.git_diff_check), 'git_diff_check enum is invalid');
  require(Array.isArray(context.verification?.blockers) && Array.isArray(context.verification?.risks), 'verification blockers and risks are required');
  require(['pending', 'analyzed', 'simplified', 'unchanged', 'blocked', 'reverted'].includes(context.result?.status), 'result status is invalid');
  require(Array.isArray(context.result?.files_changed) && context.result.files_changed.every(safeSimplifyPath), 'result files_changed must be safe paths');
  require(context.result?.receipt === null || isRef(context.result?.receipt), 'result receipt is invalid');
  require(isObject(context.artifact_context) && context.artifact_context.schema_version === 1 && isText(context.artifact_context.change_ref), 'artifact_context change identity is required');
  require(isText(context.artifact_context?.source_spec) && isText(context.artifact_context?.source_plan), 'artifact_context source_spec/source_plan must be explicit paths or none');
  if (context.approved_plan_step) require(context.artifact_context?.source_plan === context.approved_plan_step.artifact_ref, 'artifact_context source_plan must match the approved plan reference');
  for (const field of ['required_with_change', 'shared_owned', 'conditional', 'local_only', 'unrelated_observed']) require(Array.isArray(context.artifact_context?.[field]), `artifact_context.${field} must be an array`);
  return { valid: errors.length === 0, blockers: errors };
}

export function adaptLegacySimplifyContext(context) {
  if (context?.schema_version !== 1) return { status: 'blocked', write_authorized: false, evidence_current: false, blockers: ['unsupported legacy simplify schema'] };
  const shape = Array.isArray(context?.scope?.files) ? 'helper-v1' : Array.isArray(context?.scope?.eligible_files) ? 'document-v1' : 'unknown-v1';
  let diagnostics = { blockers: [] };
  try { if (shape === 'helper-v1') diagnostics = evaluateLegacyContract(context); }
  catch { diagnostics.blockers.push('malformed legacy simplify payload'); }
  return {
    ...diagnostics, schema_version: 1, compatibility: shape,
    status: context.public_behavior_change ? 'planning-handoff' : 'legacy-read-only',
    write_authorized: false, evidence_current: false,
    behavior_verification: context.verification?.behavior_verification === 'limited' ? 'limited' : 'not-verified',
    original_context: structuredClone(context),
    blockers: [...diagnostics.blockers, 'legacy simplify evidence is read-only; capture a new v2 baseline in a trusted host session'],
  };
}

function evaluate(context, runtime, phase) {
  if (context?.schema_version === 1) return adaptLegacySimplifyContext(context);
  const validation = validateSimplifyContext(context, { phase });
  if (!validation.valid) return { status: 'blocked', write_authorized: false, evidence_current: false, blockers: validation.blockers };
  if (context.action === 'planning-handoff') return { status: 'planning-handoff', write_authorized: false, evidence_current: false, blockers: ['semantic changes require spec/plan revision'] };
  return { schema_version: 2, blockers: [], ...evaluateRepositoryEvidence(context, runtime, phase) };
}

export function evaluateSimplifyPreflight(context, runtime = {}) { return evaluate(context, runtime, 'preflight'); }
export function evaluateSimplifyPostflight(context, runtime = {}) { return evaluate(context, runtime, 'postflight'); }
export function evaluateSimplifyConsumer(context, runtime = {}) { return evaluate(context, runtime, 'consumer'); }
export function evaluateSimplifyContract(context, runtime = {}) {
  return evaluate(context, runtime, context?.phase);
}
