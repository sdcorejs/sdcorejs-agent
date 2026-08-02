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

export function evaluateSimplifyContract(contract) {
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
