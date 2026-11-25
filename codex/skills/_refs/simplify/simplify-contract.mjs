import { normalizeRepositoryPath, pathMatches } from '../orchestration/execution-contract.mjs';
import { validHunk, containsHunk } from './scope-evidence.mjs';

const REVISION = /^[a-f0-9]{40}$/u;
const DIGEST = /^[a-f0-9]{64}$/u;
const APPLY_ACTIONS = new Set(['apply-current-diff', 'apply-explicit-scope']);
const ANALYZE_ACTIONS = new Set(['analyze-current-diff', 'analyze-explicit-scope']);
const INVOCATIONS = new Set(['direct', 'finish-gate', 'approved-plan']);
const STATIC_SCRIPT = /^(?:npm|pnpm|yarn|bun) (?:run )?(?:lint|typecheck|type-check|build|format:check)(?: |$)/u;
const STATIC_TOOL = /^(?:(?:npx |pnpm exec )?(?:eslint|tsc|prettier)|node --check)(?: |$)/u;
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

function observedAssertion(run) {
  const probe = run.caller_probe;
  if (probe !== undefined) {
    return run.executed_tests === undefined && run.passed_assertions === undefined &&
      probe?.assertion === run.assertion && typeof probe.expected === 'string' &&
      probe.observed === probe.expected;
  }
  const passed = run.passed_assertions;
  return Number.isSafeInteger(run.executed_tests) && run.executed_tests > 0 &&
    Array.isArray(passed) && passed.length <= run.executed_tests &&
    passed.includes(run.assertion);
}

function coversBehavior(run, paths) {
  if (run?.kind !== 'behavior' || !Array.isArray(run.covered_paths) || !paths.size) return false;
  if (typeof run.command !== 'string' || !run.command.trim() || run.exit_code !== 0) return false;
  const commands = run.command.split(/[;&|\n]+/u)
    .map(part => part.trim().replace(/\s+/gu, ' ')).filter(Boolean);
  if (commands.every(command => STATIC_SCRIPT.test(command) || STATIC_TOOL.test(command))) return false;
  if (typeof run.assertion !== 'string' || !run.assertion.trim() || !observedAssertion(run)) return false;
  try {
    const covered = new Set(run.covered_paths.map(normalizeRepositoryPath));
    return [...paths].every(path => covered.has(path));
  } catch {
    return false;
  }
}

function checkSnapshot(run, phase, revision, digest, blockers) {
  if (typeof revision !== 'string' || !REVISION.test(revision) || run?.source_revision !== revision) {
    blockers.push(`${phase} revision mismatch; rerun the scoped test`);
  }
  if (typeof digest !== 'string' || !DIGEST.test(digest) || run?.diff_scope_hash !== digest) {
    blockers.push(`${phase} scope snapshot missing or stale; rerun the scoped test`);
  }
}

export function evaluateSimplifyContract(contract) {
  const blockers = [];
  const action = contract?.action;
  const apply = APPLY_ACTIONS.has(action);
  const analyze = ANALYZE_ACTIONS.has(action);
  if (!apply && !analyze && action !== 'planning-handoff') {
    blockers.push(`unsupported simplify action: ${action}`);
  }
  if (!INVOCATIONS.has(contract?.invocation)) blockers.push('unsupported simplify invocation');
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
  if (typeof contract?.source_revision !== 'string' || !REVISION.test(contract.source_revision)) {
    blockers.push('simplify source revision is required');
  }
  if (
    contract?.invocation === 'approved-plan' &&
    (typeof contract.approved_plan_step?.step_id !== 'string' ||
      !contract.approved_plan_step.step_id.trim() ||
      contract.approved_plan_step.owner_repository_id !==
        contract.artifact_identity?.owner_repository_id)
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
  const selected = new Map();
  const step = apply && contract.invocation === 'approved-plan' ? contract.approved_plan_step : null;
  function checkedPath(value) {
    try {
      return normalizeRepositoryPath(value);
    } catch {
      blockers.push('simplify needs a repository-relative source path');
      return null;
    }
  }
  for (const file of files) {
    const normalized = checkedPath(file.path);
    if (!normalized) continue;
    if (selected.has(normalized)) blockers.push(`duplicate selected file: ${normalized}`);
    selected.set(normalized, file);
    if (step) {
      try {
        if (!pathMatches(normalized, step.allowed_paths) || pathMatches(normalized, step.prohibited_paths ?? [])) {
          blockers.push(`selected file outside approved step: ${normalized}`);
        }
      } catch {
        blockers.push('simplify needs valid approved path patterns');
      }
    }
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
  if (analyze && passes.some(pass => pass?.changed_paths?.length || pass?.hunks?.length)) {
    blockers.push('analyze mode must remain read-only');
  }
  let applyResult = 'unchanged';
  if (apply) {
    if (contract?.baseline?.result !== 'PASSED') {
      blockers.push('apply mode requires a green baseline');
    }
    const written = new Set();
    const retained = new Set();
    const touchedHunks = new Set();
    for (const pass of passes) {
      if (!Array.isArray(pass?.changed_paths)) {
        blockers.push('each simplify pass must report changed_paths');
        continue;
      }
      const passPaths = new Set();
      for (const path of pass.changed_paths) {
        const normalized = checkedPath(path);
        if (!normalized) continue;
        passPaths.add(normalized);
        written.add(normalized);
        if (!pass.reverted) retained.add(normalized);
        if (!selected.has(normalized)) blockers.push(`write outside selected files: ${normalized}`);
      }
      if (passPaths.size > 5) blockers.push('pass file limit exceeded; split the pass');
      const observedPaths = new Set();
      if (pass.hunks !== undefined && !Array.isArray(pass.hunks)) blockers.push('invalid pass hunk evidence');
      for (const hunk of Array.isArray(pass.hunks) ? pass.hunks : []) {
        const path = checkedPath(hunk?.path);
        if (!passPaths.has(path) || !validHunk(hunk)) {
          blockers.push('invalid hunk or hunk outside pass files');
          continue;
        }
        observedPaths.add(path);
        touchedHunks.add(JSON.stringify([path, hunk.start, hunk.count]));
        const allowed = selected.get(path)?.allowed_hunks;
        if (Array.isArray(allowed) && !allowed.some(range => containsHunk(range, hunk))) {
          blockers.push(`hunk outside selected ranges: ${path}`);
        }
      }
      for (const path of passPaths) {
        if (!observedPaths.has(path)) blockers.push(`missing observed hunks: ${path}`);
      }
      const result = String(pass.verification_result ?? '').toUpperCase();
      if (result === 'FAILED' && pass.reverted !== true) {
        blockers.push(`failed simplify pass ${pass.pass} was not rolled back`);
      } else if (result !== 'FAILED' && result !== 'PASSED') {
        blockers.push(`missing successful verification for simplify pass ${pass.pass}`);
      }
    }
    if (written.size > 8) blockers.push('total file limit exceeded; select a narrower scope');
    if (touchedHunks.size > 20) blockers.push('hunk limit exceeded; select a narrower scope');
    for (const path of written) {
      const ranges = selected.get(path)?.allowed_hunks;
      if (action !== 'apply-current-diff' && ranges === undefined) continue;
      if (!Array.isArray(ranges) || !ranges.length || !ranges.every(validHunk)) {
        blockers.push(`selected hunk ranges missing or invalid: ${path}`);
      }
    }
    const before = contract?.behavior_evidence?.before;
    const after = contract?.behavior_evidence?.after;
    if (written.size) {
      checkSnapshot(before, 'before', contract.baseline?.HEAD, contract.baseline?.diff_scope_hash, blockers);
      checkSnapshot(after, 'after', contract.source_revision, contract.final_diff_scope_hash, blockers);
      const restored = contract.baseline?.diff_scope_hash === contract.final_diff_scope_hash;
      if (!retained.size && !restored) blockers.push('rollback did not restore the baseline snapshot');
      if (!retained.size) applyResult = 'reverted';
      else if (!restored) applyResult = 'verified';
    }
    if (written.size && (
      !coversBehavior(before, written) ||
      !coversBehavior(after, written) ||
      before.assertion !== after.assertion ||
      before.caller_probe?.expected !== after.caller_probe?.expected ||
      before.command !== after.command ||
      before.result !== 'PASSED' ||
      after.result !== 'PASSED'
    )) {
      blockers.push('rerun the same behavior assertion and record its passing test ID or matching caller probe');
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
            ? applyResult
            : 'planning-handoff',
    write_authorized: apply && applyResult === 'verified' && blockers.length === 0,
    owner_repository_id:
      contract?.artifact_identity?.owner_repository_id ?? null,
    source_revision: contract?.source_revision ?? null,
    passes_used: passes.length,
    blockers,
  };
}
