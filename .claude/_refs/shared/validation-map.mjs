import { isDeepStrictEqual } from 'node:util';

import {
  validateDecisionCoverage,
  verifyDecisionCoverageApproval,
} from './decision-coverage.mjs';
import { orchestratePortalModuleE2E } from './module-e2e-contract.mjs';

export const VALIDATION_MAP_SCHEMA_VERSION = 1;
export const VALIDATION_AUTOMATION = Object.freeze([
  'automated',
  'deferred',
  'manual',
  'not-applicable',
]);
export const VALIDATION_STATUSES = Object.freeze([
  'covered',
  'deferred',
  'missing',
  'not-applicable',
  'partial',
]);
export const VALIDATION_LEVELS = Object.freeze([
  'unit',
  'component',
  'integration',
  'api-e2e',
  'browser-e2e',
  'uat',
  'ui-evidence-capture',
]);
export const VALIDATION_EVIDENCE_CLASSES = Object.freeze([
  'UNIT',
  'GOLDEN',
  'CONTAINER',
  'FULL_E2E',
  'LIVE_AGENT',
  'SUPPLEMENTAL_SMOKE',
]);

const AUTOMATION = new Set(VALIDATION_AUTOMATION);
const STATUSES = new Set(VALIDATION_STATUSES);
const LEVELS = new Set(VALIDATION_LEVELS);
const EVIDENCE_CLASSES = new Set(VALIDATION_EVIDENCE_CLASSES);
const COMMAND_SOURCES = new Set(['package.json', 'ci', 'project-doc', 'manual']);
const REQUIREMENT_ID = /^R-(?!000)\d{3}$/u;
const AC_ID = /^AC-(?!000)\d{3}$/u;
const INVARIANT_ID = /^INV-(?!000)\d{3}$/u;
const CASE_ID = /^case-[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const EVIDENCE_ID = /^EVIDENCE-(?!000)\d{3}$/u;
const REVISION = /^[a-f0-9]{40}$/u;
const FINGERPRINT = /^sha256:v1:[a-f0-9]{64}$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const BOUNDARY_KINDS = new Set(['authorization', 'none']);
const ROW_KEYS = new Set([
  'requirement_id',
  'acceptance_criterion_id',
  'invariant_refs',
  'risk',
  'boundary',
  'authorization_boundary',
  'levels',
  'case_ids',
  'planned_command',
  'command_source',
  'cwd',
  'evidence_class',
  'automation',
  'expected_proof',
  'status',
  'evidence_refs',
  'rationale',
  'owner',
  'acknowledgement_required',
  'module_e2e',
  'module_id',
  'owner_repository_id',
]);
const TEST_STATUS_DOMAINS = Object.freeze({
  planning: new Set(['missing', 'planned', 'approved', 'not-applicable']),
  authoring: new Set(['not-requested', 'not-written', 'written', 'updated', 'existing']),
  executability: new Set(['ready', 'blocked', 'unknown', 'not-applicable']),
  execution: new Set(['not-run', 'executed', 'partial', 'interrupted']),
  result: new Set(['pass', 'fail', 'blocked', 'unknown', 'not-applicable']),
  evidence: new Set(['absent', 'current', 'stale', 'partial']),
  documentation: new Set(['not-requested', 'pending', 'generated', 'verified', 'blocked']),
});

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isText(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sameTextSet(left, right) {
  return Array.isArray(left) &&
    Array.isArray(right) &&
    left.length === right.length &&
    left.every((value) => right.includes(value));
}

function clone(value) {
  try {
    return structuredClone(value);
  } catch {
    return null;
  }
}

function issue(code, path, message) {
  return { code, path, message };
}

function issueText(value) {
  return `[${value.code}] ${value.path}: ${value.message}`;
}

function finalize(values) {
  const unique = new Map(values.map((value) => [issueText(value), value]));
  return [...unique.entries()]
    .sort(([left], [right]) => compareText(left, right))
    .map(([, value]) => value);
}

function resultFrom(blockerValues, extra = {}) {
  const blockers = finalize(blockerValues);
  return {
    valid: blockers.length === 0,
    ...extra,
    blockers,
    blocker_messages: blockers.map(issueText),
  };
}

function safeRepositoryPath(value) {
  if (!isText(value) || value.includes('\\') || value.includes('\0')) return false;
  if (value === '.') return true;
  if (value.startsWith('/') || value.startsWith('./') || /^[A-Za-z]:\//u.test(value)) return false;
  const segments = value.split('/');
  return !segments.some((segment) => segment === '' || segment === '.' || segment === '..');
}

function validateStringArray({ value, path, code, blockers, allowed = null, pattern = null, nonEmpty = false }) {
  if (!Array.isArray(value)) {
    blockers.push(issue(code, path, 'must be an explicit array'));
    return [];
  }
  const result = [];
  const seen = new Set();
  for (const [index, candidate] of value.entries()) {
    if (!isText(candidate)) {
      blockers.push(issue(code, `${path}[${index}]`, 'must be a non-empty string'));
      continue;
    }
    if (seen.has(candidate)) {
      blockers.push(issue(`${code}_DUPLICATE`, path, `duplicates ${candidate}`));
      continue;
    }
    seen.add(candidate);
    result.push(candidate);
    if (allowed && !allowed.has(candidate)) {
      blockers.push(issue(code, `${path}[${index}]`, `unsupported value ${candidate}`));
    }
    if (pattern && !pattern.test(candidate)) {
      blockers.push(issue(code, `${path}[${index}]`, `invalid value ${candidate}`));
    }
  }
  if (nonEmpty && result.length === 0) blockers.push(issue(code, path, 'must not be empty'));
  return result;
}

function findThresholdFields(value, path, blockers, seen = new WeakSet()) {
  if (!isObject(value) && !Array.isArray(value)) return;
  if (seen.has(value)) return;
  seen.add(value);
  for (const [key, child] of Object.entries(value)) {
    const childPath = Array.isArray(value) ? `${path}[${key}]` : `${path}.${key}`;
    if (/threshold/iu.test(key) && child !== null && child !== undefined) {
      blockers.push(issue('NUMERIC_THRESHOLD_FORBIDDEN', childPath, 'do not invent a numeric coverage threshold'));
    }
    findThresholdFields(child, childPath, blockers, seen);
  }
}

function validateBoundaryMetadata(row, path, recordsById, blockers) {
  const boundary = row.boundary;
  if (
    !isObject(boundary) ||
    !BOUNDARY_KINDS.has(boundary.kind) ||
    !isText(boundary.approval_ref)
  ) {
    blockers.push(issue('BOUNDARY_METADATA_INVALID', `${path}.boundary`, 'must preserve an approved structured authorization or none boundary'));
    return null;
  }
  const sourceRefs = validateStringArray({
    value: boundary.source_refs,
    path: `${path}.boundary.source_refs`,
    code: 'BOUNDARY_METADATA_INVALID',
    blockers,
    nonEmpty: true,
  });
  for (const reference of sourceRefs) {
    if (!recordsById.has(reference)) {
      blockers.push(issue('BOUNDARY_SOURCE_DANGLING', `${path}.boundary.source_refs`, `references unavailable approved identity ${reference}`));
    }
  }
  const approval = recordsById.get(boundary.approval_ref);
  if (!approval || approval.type !== 'decision') {
    blockers.push(issue('BOUNDARY_APPROVAL_DANGLING', `${path}.boundary.approval_ref`, 'must resolve to a current approved D-### decision record'));
    return null;
  }
  const approvedBoundary = approval.validation_boundary;
  if (
    !isObject(approvedBoundary) ||
    !BOUNDARY_KINDS.has(approvedBoundary.kind) ||
    !Array.isArray(approvedBoundary.source_refs)
  ) {
    blockers.push(issue('BOUNDARY_APPROVAL_INVALID', `decision_coverage.records.${approval.id}.validation_boundary`, 'must declare the approved boundary kind and typed source refs'));
    return null;
  }
  const approvedSourceRefs = validateStringArray({
    value: approvedBoundary.source_refs,
    path: `decision_coverage.records.${approval.id}.validation_boundary.source_refs`,
    code: 'BOUNDARY_APPROVAL_INVALID',
    blockers,
    nonEmpty: true,
  });
  if (approvedSourceRefs.some((reference) => !recordsById.has(reference))) {
    blockers.push(issue('BOUNDARY_APPROVAL_SOURCE_DANGLING', `decision_coverage.records.${approval.id}.validation_boundary.source_refs`, 'must resolve every approved source identity'));
  }
  if (approvedSourceRefs.some((reference) => !approval.downstream_refs?.includes(reference))) {
    blockers.push(issue('BOUNDARY_APPROVAL_SOURCE_UNBOUND', `decision_coverage.records.${approval.id}.validation_boundary.source_refs`, 'must be downstream of the approving decision'));
  }
  if (boundary.kind !== approvedBoundary.kind) {
    blockers.push(issue('BOUNDARY_KIND_MISMATCH', `${path}.boundary.kind`, `must match ${approval.id} approved kind ${approvedBoundary.kind}`));
  }
  if (!sameTextSet(sourceRefs, approvedSourceRefs)) {
    blockers.push(issue('BOUNDARY_SOURCE_MISMATCH', `${path}.boundary.source_refs`, `must exactly project ${approval.id} approved source refs`));
  }
  for (const required of [row.requirement_id, row.acceptance_criterion_id]) {
    if (isText(required) && !sourceRefs.includes(required)) {
      blockers.push(issue('BOUNDARY_SOURCE_MISSING', `${path}.boundary.source_refs`, `must bind ${required}`));
    }
  }
  for (const invariant of Array.isArray(row.invariant_refs) ? row.invariant_refs : []) {
    if (!sourceRefs.includes(invariant)) {
      blockers.push(issue('BOUNDARY_SOURCE_MISSING', `${path}.boundary.source_refs`, `must bind ${invariant}`));
    }
  }
  return approvedBoundary.kind;
}

function validateEvidenceEnvelope(testEvidence, blockers, { claimMode = 'automated' } = {}) {
  const basePath = 'validation_evidence.test_evidence';
  if (!isObject(testEvidence)) {
    blockers.push(issue('TEST_EVIDENCE_INVALID', basePath, 'must be an object'));
    return false;
  }
  if (testEvidence.schema_version !== 2 || testEvidence.source !== 'sdcorejs-test' || !isText(testEvidence.associated_HEAD_or_diff)) {
    blockers.push(issue('TEST_EVIDENCE_INVALID', basePath, 'must be current sdcorejs-test schema v2'));
  }
  if (!isObject(testEvidence.status)) {
    blockers.push(issue('TEST_STATUS_INVALID', `${basePath}.status`, 'must be the complete v2 status object'));
  } else {
    for (const [field, domain] of Object.entries(TEST_STATUS_DOMAINS)) {
      if (!domain.has(testEvidence.status[field])) {
        blockers.push(issue('TEST_STATUS_INVALID', `${basePath}.status.${field}`, `unsupported value ${String(testEvidence.status[field])}`));
      }
    }
    const commonReady =
      ['planned', 'approved'].includes(testEvidence.status.planning) &&
      testEvidence.status.evidence === 'current' &&
      testEvidence.status.documentation !== 'blocked';
    const readyStatus = claimMode === 'manual'
      ? commonReady &&
        ['not-requested', 'written', 'updated', 'existing'].includes(testEvidence.status.authoring) &&
        testEvidence.status.executability === 'not-applicable' &&
        testEvidence.status.execution === 'not-run' &&
        testEvidence.status.result === 'not-applicable'
      : commonReady &&
        ['written', 'updated', 'existing'].includes(testEvidence.status.authoring) &&
        testEvidence.status.executability === 'ready' &&
        testEvidence.status.execution === 'executed' &&
        testEvidence.status.result === 'pass';
    if (!readyStatus) {
      blockers.push(issue('TEST_STATUS_NOT_READY', `${basePath}.status`, 'status cannot support a current passing claim'));
    }
  }
  for (const field of ['runs', 'cases', 'acknowledgements', 'convergence_evidence_refs', 'captures', 'commands_skipped', 'blockers', 'residual_risks']) {
    if (!Array.isArray(testEvidence[field])) {
      blockers.push(issue('TEST_EVIDENCE_INVALID', `${basePath}.${field}`, 'must be an explicit array'));
    }
  }
  if (Array.isArray(testEvidence.blockers) && testEvidence.blockers.length > 0) {
    blockers.push(issue('TEST_EVIDENCE_BLOCKED', `${basePath}.blockers`, 'passing evidence cannot retain blockers'));
  }
  if (Array.isArray(testEvidence.commands_skipped) && testEvidence.commands_skipped.length > 0) {
    blockers.push(issue('COMMANDS_SKIPPED', `${basePath}.commands_skipped`, 'skipped commands cannot support PASS'));
  }
  if (testEvidence.redactions_applied !== true) {
    blockers.push(issue('REDACTION_REQUIRED', `${basePath}.redactions_applied`, 'must be explicitly true'));
  }
  const lifecycle = testEvidence.data_lifecycle;
  const terminalLifecycle = new Set(['completed', 'complete', 'not-applicable']);
  if (
    !isObject(lifecycle) ||
    !terminalLifecycle.has(lifecycle.setup_status) ||
    !terminalLifecycle.has(lifecycle.cleanup_status) ||
    lifecycle.residual_data_risk !== 'none'
  ) {
    blockers.push(issue('DATA_LIFECYCLE_INCOMPLETE', `${basePath}.data_lifecycle`, 'setup and cleanup must be terminal with no residual data risk'));
  }
  return blockers.every(({ code }) => code !== 'TEST_EVIDENCE_INVALID');
}

function decisionRecords(decisionCoverage, blockers) {
  try {
    const approval = verifyDecisionCoverageApproval(decisionCoverage);
    if (!approval.valid) {
      blockers.push(issue(
        'DECISION_COVERAGE_APPROVAL_INVALID',
        'validation_map.decision_coverage.approved_artifact',
        approval.errors.join('; ') || 'must match a verified approved artifact',
      ));
    }
    const result = validateDecisionCoverage(decisionCoverage, { stage: 'plan' });
    if (!result.structurally_valid) {
      blockers.push(issue('DECISION_COVERAGE_INVALID', 'validation_map.decision_coverage', result.error_messages.join('; ') || 'must be structurally valid'));
    }
    return Array.isArray(result.records) ? result.records.filter(isObject) : [];
  } catch (error) {
    blockers.push(issue('DECISION_COVERAGE_INVALID', 'validation_map.decision_coverage', error?.message ?? String(error)));
    return [];
  }
}

export function validateValidationMap(input, { decision_coverage: decisionCoverage } = {}) {
  const blockerValues = [];
  const readinessValues = [];
  if (!Array.isArray(input)) {
    return resultFrom(
      [issue('VALIDATION_MAP_INVALID', 'validation_map', 'must be an explicit array')],
      { approval_ready: false, readiness_blockers: [], rows: null },
    );
  }
  const clonedRows = clone(input);
  if (clonedRows === null) {
    blockerValues.push(issue('VALIDATION_MAP_NOT_CLONEABLE', 'validation_map', 'must contain only portable structured data'));
  }
  const records = decisionRecords(decisionCoverage, blockerValues);
  const recordsById = new Map(records.map((record) => [record.id, record]));
  const knownEvidenceIds = new Set(records.flatMap((record) =>
    Array.isArray(record.evidence_refs) ? record.evidence_refs : []));
  const acceptanceCriteria = records.filter((record) => record.type === 'acceptance-criterion');
  const mappedCriteria = new Set();
  const globalCaseIds = new Set();

  for (const [index, row] of input.entries()) {
    const path = `validation_map[${index}]`;
    if (!isObject(row)) {
      blockerValues.push(issue('ROW_INVALID', path, 'must be an object'));
      continue;
    }
    findThresholdFields(row, path, blockerValues);
    for (const key of Object.keys(row)) {
      if (!ROW_KEYS.has(key)) {
        blockerValues.push(issue('ROW_FIELD_UNKNOWN', `${path}.${key}`, 'is outside the closed validation row schema'));
      }
    }
    if (!REQUIREMENT_ID.test(row.requirement_id ?? '')) {
      blockerValues.push(issue('REQUIREMENT_ID_INVALID', `${path}.requirement_id`, 'must use R-###'));
    } else if (recordsById.get(row.requirement_id)?.type !== 'requirement') {
      blockerValues.push(issue('REQUIREMENT_REFERENCE_DANGLING', `${path}.requirement_id`, `references unavailable requirement ${row.requirement_id}`));
    }
    if (!AC_ID.test(row.acceptance_criterion_id ?? '')) {
      blockerValues.push(issue('AC_ID_INVALID', `${path}.acceptance_criterion_id`, 'must use AC-###'));
    } else {
      const criterion = recordsById.get(row.acceptance_criterion_id);
      if (criterion?.type !== 'acceptance-criterion') {
        blockerValues.push(issue('AC_REFERENCE_DANGLING', `${path}.acceptance_criterion_id`, `references unavailable acceptance criterion ${row.acceptance_criterion_id}`));
      } else {
        mappedCriteria.add(row.acceptance_criterion_id);
        if (!criterion.requirement_refs?.includes(row.requirement_id)) {
          blockerValues.push(issue('AC_REQUIREMENT_MISMATCH', path, `${row.acceptance_criterion_id} does not belong to ${row.requirement_id}`));
        }
      }
    }
    const invariantRefs = validateStringArray({
      value: row.invariant_refs,
      path: `${path}.invariant_refs`,
      code: 'INVARIANT_REFS_INVALID',
      blockers: blockerValues,
      pattern: INVARIANT_ID,
    });
    for (const reference of invariantRefs) {
      if (recordsById.get(reference)?.type !== 'invariant') {
        blockerValues.push(issue('INVARIANT_REFERENCE_DANGLING', `${path}.invariant_refs`, `references unavailable invariant ${reference}`));
      }
    }
    const levels = validateStringArray({
      value: row.levels,
      path: `${path}.levels`,
      code: 'LEVEL_INVALID',
      blockers: blockerValues,
      allowed: LEVELS,
      nonEmpty: row.status !== 'not-applicable',
    });
    const caseIds = validateStringArray({
      value: row.case_ids,
      path: `${path}.case_ids`,
      code: 'CASE_ID_INVALID',
      blockers: blockerValues,
      pattern: CASE_ID,
      nonEmpty: row.status !== 'not-applicable',
    });
    for (const caseId of caseIds) {
      if (globalCaseIds.has(caseId)) {
        blockerValues.push(issue('CASE_ID_DUPLICATE', 'validation_map', `duplicates ${caseId}`));
      }
      globalCaseIds.add(caseId);
    }
    const evidenceRefs = validateStringArray({
      value: row.evidence_refs,
      path: `${path}.evidence_refs`,
      code: 'EVIDENCE_REFS_INVALID',
      blockers: blockerValues,
      pattern: EVIDENCE_ID,
    });
    for (const reference of evidenceRefs) {
      if (!knownEvidenceIds.has(reference)) {
        blockerValues.push(issue('EVIDENCE_REFERENCE_DANGLING', `${path}.evidence_refs`, `references unavailable evidence identity ${reference}`));
      }
    }
    if (!isText(row.risk)) blockerValues.push(issue('RISK_REQUIRED', `${path}.risk`, 'must be non-empty'));
    if (!isText(row.expected_proof)) blockerValues.push(issue('EXPECTED_PROOF_REQUIRED', `${path}.expected_proof`, 'must be non-empty'));
    if (!COMMAND_SOURCES.has(row.command_source)) blockerValues.push(issue('COMMAND_SOURCE_INVALID', `${path}.command_source`, `unsupported source ${String(row.command_source)}`));
    if (row.planned_command !== null && (!isText(row.planned_command) || row.planned_command.trim() !== row.planned_command || /[\r\n\0]/u.test(row.planned_command))) {
      blockerValues.push(issue('PLANNED_COMMAND_INVALID', `${path}.planned_command`, 'must be null or one exact single-line command'));
    }
    if (row.automation === 'automated' && !isText(row.planned_command)) {
      blockerValues.push(issue('PLANNED_COMMAND_REQUIRED', `${path}.planned_command`, 'automated validation requires an exact discovered command'));
    }
    if (row.automation === 'automated' && row.command_source === 'manual') {
      blockerValues.push(issue('COMMAND_SOURCE_INVALID', `${path}.command_source`, 'automated validation cannot use manual as its command source'));
    }
    if (!safeRepositoryPath(row.cwd)) blockerValues.push(issue('CWD_INVALID', `${path}.cwd`, 'must be a safe repository-relative workspace path'));
    if (!EVIDENCE_CLASSES.has(row.evidence_class)) blockerValues.push(issue('EVIDENCE_CLASS_INVALID', `${path}.evidence_class`, `unsupported evidence class ${String(row.evidence_class)}`));
    if (!AUTOMATION.has(row.automation)) blockerValues.push(issue('AUTOMATION_INVALID', `${path}.automation`, `unsupported automation ${String(row.automation)}`));
    if (!STATUSES.has(row.status)) blockerValues.push(issue('STATUS_INVALID', `${path}.status`, `unsupported status ${String(row.status)}`));
    if (row.automation === 'deferred' && row.status !== 'deferred') blockerValues.push(issue('AUTOMATION_STATUS_MISMATCH', path, 'deferred automation requires deferred status'));
    if ((row.automation === 'not-applicable') !== (row.status === 'not-applicable')) blockerValues.push(issue('AUTOMATION_STATUS_MISMATCH', path, 'not-applicable automation and status must agree'));
    if (row.rationale !== null && !isText(row.rationale)) blockerValues.push(issue('RATIONALE_INVALID', `${path}.rationale`, 'must be null or non-empty'));
    if (row.owner !== null && !isText(row.owner)) blockerValues.push(issue('OWNER_INVALID', `${path}.owner`, 'must be null or non-empty'));
    if (row.acknowledgement_required !== undefined && typeof row.acknowledgement_required !== 'boolean') blockerValues.push(issue('ACKNOWLEDGEMENT_POLICY_INVALID', `${path}.acknowledgement_required`, 'must be boolean when present'));
    if (typeof row.authorization_boundary !== 'boolean') {
      blockerValues.push(issue('AUTHORIZATION_BOUNDARY_INVALID', `${path}.authorization_boundary`, 'must explicitly declare whether an authorization boundary exists'));
    }
    const boundaryKind = validateBoundaryMetadata(row, path, recordsById, blockerValues);
    if (boundaryKind !== null && row.authorization_boundary !== (boundaryKind === 'authorization')) {
      blockerValues.push(issue('AUTHORIZATION_BOUNDARY_MISMATCH', `${path}.authorization_boundary`, 'must match the approved structured boundary metadata'));
    }
    if (typeof row.module_e2e !== 'boolean') blockerValues.push(issue('MODULE_E2E_INVALID', `${path}.module_e2e`, 'must be an explicit boolean'));
    if (row.module_e2e === true && row.evidence_class !== 'FULL_E2E') blockerValues.push(issue('MODULE_E2E_CLASS_INVALID', `${path}.evidence_class`, 'module E2E requires FULL_E2E evidence'));
    if (row.module_e2e === true && (!isText(row.module_id) || !isText(row.owner_repository_id))) {
      blockerValues.push(issue('MODULE_E2E_IDENTITY_INVALID', path, 'module E2E requires module_id and owner_repository_id'));
    }
    if (row.module_e2e === false && (row.module_id !== null || row.owner_repository_id !== null)) {
      blockerValues.push(issue('MODULE_E2E_IDENTITY_INVALID', path, 'non-module evidence requires null module identity fields'));
    }
    if (boundaryKind === 'authorization' && !levels.includes('api-e2e')) {
      blockerValues.push(issue('AUTHORIZATION_API_DENIAL_MISSING', `${path}.levels`, 'authorization requires server/API denial evidence'));
    }
    if (row.automation === 'manual' && (row.planned_command !== null || row.command_source !== 'manual')) {
      blockerValues.push(issue('MANUAL_COMMAND_INVALID', path, 'manual validation requires a null command and manual command source'));
    }
    if (['manual', 'deferred'].includes(row.automation) || row.status === 'deferred') {
      if (!isText(row.rationale)) blockerValues.push(issue('RATIONALE_REQUIRED', `${path}.rationale`, 'manual or deferred validation requires a rationale'));
      if (!isText(row.owner)) blockerValues.push(issue('OWNER_REQUIRED', `${path}.owner`, 'manual or deferred validation requires an owner'));
      if (row.acknowledgement_required !== true) blockerValues.push(issue('ACKNOWLEDGEMENT_REQUIRED', `${path}.acknowledgement_required`, 'manual or deferred validation requires explicit acknowledgement'));
    }
    if (['deferred', 'not-applicable'].includes(row.status) && !isText(row.rationale)) {
      blockerValues.push(issue('RATIONALE_REQUIRED', `${path}.rationale`, `${row.status} status requires a rationale`));
    }
    if (['missing', 'partial'].includes(row.status)) {
      readinessValues.push(issue('VALIDATION_STATUS_BLOCKING', `${path}.status`, `${row.status} validation is not approval-ready`));
    }

    const protectedInvariants = records.filter((record) =>
      record.type === 'invariant' &&
      Array.isArray(record.protected_refs) &&
      record.protected_refs.some((reference) =>
        reference === row.requirement_id || reference === row.acceptance_criterion_id));
    for (const invariant of protectedInvariants) {
      if (!invariantRefs.includes(invariant.id)) {
        blockerValues.push(issue('PROTECTED_INVARIANT_MISSING', `${path}.invariant_refs`, `must preserve ${invariant.id}`));
      }
      for (const evidenceReference of invariant.evidence_refs ?? []) {
        if (!evidenceRefs.includes(evidenceReference)) {
          blockerValues.push(issue('PROTECTED_EVIDENCE_MISSING', `${path}.evidence_refs`, `must preserve ${evidenceReference} from ${invariant.id}`));
        }
      }
    }
  }

  for (const criterion of acceptanceCriteria) {
    if (!mappedCriteria.has(criterion.id)) {
      blockerValues.push(issue('AC_VALIDATION_MISSING', 'validation_map', `missing validation row for ${criterion.id}`));
    }
  }
  const structural = resultFrom(blockerValues);
  const readinessBlockers = finalize(readinessValues);
  return {
    ...structural,
    approval_ready: structural.valid && readinessBlockers.length === 0,
    readiness_blockers: readinessBlockers,
    rows: structural.valid ? clonedRows : null,
  };
}

export function assertValidationMap(input, options = {}) {
  const result = validateValidationMap(input, options);
  if (!result.valid || !result.approval_ready) {
    const messages = [
      ...result.blocker_messages,
      ...result.readiness_blockers.map(issueText),
    ];
    throw new Error(`validation map blocked:\n${messages.join('\n')}`);
  }
  return result;
}

export function projectCoverageMatrix(validationMap) {
  if (!Array.isArray(validationMap)) throw new TypeError('validation_map must be an array');
  const projection = clone(validationMap);
  if (projection === null) throw new TypeError('validation_map must contain portable structured data');
  return projection;
}

function lifecycle(caseId, state) {
  return { case_id: caseId, state };
}

function validateRunFreshness({ row, run, evidence, current, path, blockers }) {
  if (evidence.associated_HEAD_or_diff !== current.associated_HEAD_or_diff || run.associated_HEAD_or_diff !== current.associated_HEAD_or_diff) {
    blockers.push(issue('HEAD_DIFF_MISMATCH', path, 'evidence must match the current exact HEAD or diff fingerprint'));
  }
  if (run.command !== row.planned_command) blockers.push(issue('COMMAND_MISMATCH', `${path}.command`, 'must match the exact planned command'));
  if (run.command_source !== row.command_source) blockers.push(issue('COMMAND_SOURCE_MISMATCH', `${path}.command_source`, 'must match the planned command source'));
  if (run.cwd !== row.cwd) blockers.push(issue('CWD_MISMATCH', `${path}.cwd`, 'must match the planned working directory'));
  if (run.evidence_class !== row.evidence_class) blockers.push(issue('EVIDENCE_CLASS_MISMATCH', `${path}.evidence_class`, 'must match the planned evidence class'));
  if (run.config_fingerprint !== current.config_fingerprint) blockers.push(issue('CONFIG_FINGERPRINT_MISMATCH', `${path}.config_fingerprint`, 'must match current runner configuration'));
  if (run.environment_fingerprint !== current.environment_fingerprint) blockers.push(issue('ENVIRONMENT_FINGERPRINT_MISMATCH', `${path}.environment_fingerprint`, 'must match the current environment'));
  if (run.stale !== false) blockers.push(issue('EVIDENCE_STALE', `${path}.stale`, 'must be explicitly current'));
}

function validateModuleProvenance({ row, run, current, path, blockers }) {
  const scope = current?.module_e2e;
  if (
    !isObject(scope) ||
    !isText(scope.portal_repository_id) ||
    !REVISION.test(scope.portal_revision ?? '') ||
    !Array.isArray(scope.modules)
  ) {
    blockers.push(issue('MODULE_E2E_SCOPE_INVALID', 'validation_evidence.current.module_e2e', 'must provide canonical portal/module discovery scope'));
    return;
  }
  const module = scope.modules.find((candidate) =>
    isObject(candidate) && candidate.module_id === row.module_id);
  if (!module || module.repository_id !== row.owner_repository_id) {
    blockers.push(issue('MODULE_E2E_SCOPE_INVALID', 'validation_evidence.current.module_e2e', 'must resolve the planned module and owner repository exactly'));
    return;
  }
  let result;
  try {
    result = orchestratePortalModuleE2E({
      portal_repository_id: scope.portal_repository_id,
      portal_revision: scope.portal_revision,
      modules: [module],
      run_results: {
        [row.module_id]: {
          result:
            run.exit_code === 0 && run.interrupted === false && run.failed === 0
              ? 'PASSED'
              : 'FAILED',
          evidence: {
            evidence_class: typeof run.evidence_class === 'string'
              ? run.evidence_class.toLowerCase().replaceAll('_', '-')
              : run.evidence_class,
            repository_id: run.repository_id,
            source_fingerprint: run.source_fingerprint,
            portal_revision: run.portal_revision,
            module_revision: run.module_revision,
            portal_pinned_module_revision: run.portal_pinned_module_revision,
            actual_command: run.actual_command,
            artifact_hashes: run.artifact_hashes,
          },
        },
      },
    });
  } catch (error) {
    blockers.push(issue('MODULE_E2E_SCOPE_INVALID', 'validation_evidence.current.module_e2e', error?.message ?? String(error)));
    return;
  }
  const record = result.modules.find(({ module_id: moduleId }) => moduleId === row.module_id);
  if (!record || record.result !== 'PASSED' || record.evidence_status !== 'current') {
    blockers.push(issue('MODULE_E2E_PROVENANCE_INVALID', path, record?.blocker ?? 'canonical module E2E evidence is not current'));
  }
}

export function evaluateValidationEvidence({
  validation_map: validationMap,
  coverage_matrix: coverageMatrix,
  test_evidence: testEvidence,
  current,
  decision_coverage: decisionCoverage,
} = {}) {
  const mapResult = validateValidationMap(validationMap, { decision_coverage: decisionCoverage });
  const blockerValues = [...mapResult.blockers, ...mapResult.readiness_blockers];
  const lifecycleValues = [];
  if (!Array.isArray(validationMap) || !mapResult.valid || !mapResult.approval_ready) {
    return resultFrom(blockerValues, { ready: false, result: 'FAIL', lifecycle: lifecycleValues });
  }
  let projectedCoverage = null;
  try {
    projectedCoverage = projectCoverageMatrix(validationMap);
  } catch {
    projectedCoverage = null;
  }
  if (projectedCoverage !== null && !isDeepStrictEqual(coverageMatrix, projectedCoverage)) {
    blockerValues.push(issue('COVERAGE_MATRIX_DRIFT', 'validation_evidence.coverage_matrix', 'must be the exact runtime projection of plan_context.validation_map'));
  }
  const executableRows = validationMap.filter((row) =>
    isObject(row) && !['not-applicable', 'deferred'].includes(row.automation));
  const claimMode = executableRows.length > 0 && executableRows.every((row) => row.automation === 'manual')
    ? 'manual'
    : 'automated';
  if (!validateEvidenceEnvelope(testEvidence, blockerValues, { claimMode })) {
    return resultFrom(blockerValues, { ready: false, result: 'FAIL', lifecycle: lifecycleValues });
  }
  if (!isObject(current) || !isText(current.associated_HEAD_or_diff) || !FINGERPRINT.test(current.config_fingerprint ?? '') || !FINGERPRINT.test(current.environment_fingerprint ?? '')) {
    blockerValues.push(issue('CURRENT_STATE_INVALID', 'validation_evidence.current', 'must bind HEAD/diff plus sha256:v1 config and environment fingerprints'));
  }
  if (testEvidence.associated_HEAD_or_diff !== current?.associated_HEAD_or_diff) {
    blockerValues.push(issue('HEAD_DIFF_MISMATCH', 'validation_evidence.test_evidence.associated_HEAD_or_diff', 'evidence must match the current exact HEAD or diff fingerprint'));
  }
  const evidenceRecordsById = new Map(
    decisionRecords(decisionCoverage, blockerValues).map((record) => [record.id, record]),
  );
  const knownEvidenceIds = new Set([...evidenceRecordsById.values()].flatMap((record) =>
    Array.isArray(record.evidence_refs) ? record.evidence_refs : []));
  const currentEvidenceRefs = validateStringArray({
    value: testEvidence.convergence_evidence_refs,
    path: 'validation_evidence.test_evidence.convergence_evidence_refs',
    code: 'CURRENT_EVIDENCE_REF_INVALID',
    blockers: blockerValues,
    pattern: EVIDENCE_ID,
  });
  for (const reference of currentEvidenceRefs) {
    if (!knownEvidenceIds.has(reference)) {
      blockerValues.push(issue('CURRENT_EVIDENCE_REF_DANGLING', 'validation_evidence.test_evidence.convergence_evidence_refs', `references unavailable evidence identity ${reference}`));
    }
  }
  const runs = new Map();
  for (const [index, run] of testEvidence.runs.entries()) {
    const runPath = `validation_evidence.test_evidence.runs[${index}]`;
    if (!isObject(run) || !isText(run.run_id)) {
      blockerValues.push(issue('RUN_INVALID', runPath, 'must have a stable run_id'));
      continue;
    }
    for (const field of ['command', 'command_source', 'cwd', 'runner', 'package_manager', 'environment_id', 'environment_class', 'associated_HEAD_or_diff', 'repository_id', 'source_fingerprint', 'started_at', 'finished_at', 'duration', 'output_digest']) {
      if (!isText(run[field])) blockerValues.push(issue('RUN_INVALID', `${runPath}.${field}`, 'must be a non-empty string'));
    }
    if (!FINGERPRINT.test(run.config_fingerprint ?? '') || !FINGERPRINT.test(run.environment_fingerprint ?? '')) {
      blockerValues.push(issue('RUN_INVALID', runPath, 'must preserve config and environment sha256:v1 fingerprints'));
    }
    if (!SHA256.test(run.source_fingerprint ?? '')) {
      blockerValues.push(issue('RUN_INVALID', `${runPath}.source_fingerprint`, 'must be a SHA-256 digest'));
    }
    for (const field of ['persona_ids', 'failed_specs', 'artifacts_created']) {
      if (!Array.isArray(run[field])) blockerValues.push(issue('RUN_INVALID', `${runPath}.${field}`, 'must be an explicit array'));
    }
    if (!isObject(run.artifact_hashes)) blockerValues.push(issue('RUN_INVALID', `${runPath}.artifact_hashes`, 'must be an object'));
    if (!Number.isInteger(run.exit_code) || !Number.isInteger(run.failed) || run.failed < 0 || !Number.isInteger(run.skipped) || run.skipped < 0 || (run.passed !== null && (!Number.isInteger(run.passed) || run.passed < 0))) {
      blockerValues.push(issue('RUN_INVALID', runPath, 'must preserve real exit and case counts'));
    }
    if (typeof run.interrupted !== 'boolean' || typeof run.stale !== 'boolean' || run.redactions_applied !== true) {
      blockerValues.push(issue('RUN_INVALID', runPath, 'must preserve interruption, staleness, and redaction state'));
    }
    if (runs.has(run.run_id)) blockerValues.push(issue('RUN_ID_DUPLICATE', 'validation_evidence.test_evidence.runs', `duplicates ${run.run_id}`));
    runs.set(run.run_id, run);
  }
  const cases = new Map();
  for (const [index, evidenceCase] of testEvidence.cases.entries()) {
    const casePath = `validation_evidence.test_evidence.cases[${index}]`;
    if (!isObject(evidenceCase) || !isText(evidenceCase.case_id)) {
      blockerValues.push(issue('CASE_EVIDENCE_INVALID', casePath, 'must have a stable case_id'));
      continue;
    }
    const requirementRefs = validateStringArray({
      value: evidenceCase.requirement_refs,
      path: `${casePath}.requirement_refs`,
      code: 'CASE_REQUIREMENT_TRACE_INVALID',
      blockers: blockerValues,
    });
    const invariantRefs = validateStringArray({
      value: evidenceCase.invariant_refs,
      path: `${casePath}.invariant_refs`,
      code: 'CASE_INVARIANT_TRACE_INVALID',
      blockers: blockerValues,
    });
    if (requirementRefs.some((reference) => {
      const record = evidenceRecordsById.get(reference);
      return !record || !['requirement', 'acceptance-criterion'].includes(record.type);
    })) {
      blockerValues.push(issue('CASE_REQUIREMENT_TRACE_INVALID', `${casePath}.requirement_refs`, 'may contain only current R-* and AC-* identities'));
    }
    if (invariantRefs.some((reference) => !INVARIANT_ID.test(reference))) {
      blockerValues.push(issue('CASE_INVARIANT_TRACE_INVALID', `${casePath}.invariant_refs`, 'may contain only INV-* identities'));
    }
    if (invariantRefs.some((reference) => evidenceRecordsById.get(reference)?.type !== 'invariant')) {
      blockerValues.push(issue('CASE_INVARIANT_TRACE_DANGLING', `${casePath}.invariant_refs`, 'must resolve every INV-* identity against current decision coverage'));
    }
    if (!['pass', 'fail', 'blocked', 'skipped', 'not-run'].includes(evidenceCase.result)) {
      blockerValues.push(issue('CASE_EVIDENCE_INVALID', `${casePath}.result`, 'has an unsupported result'));
    }
    if (cases.has(evidenceCase.case_id)) blockerValues.push(issue('CASE_EVIDENCE_DUPLICATE', 'validation_evidence.test_evidence.cases', `duplicates ${evidenceCase.case_id}`));
    cases.set(evidenceCase.case_id, evidenceCase);
  }
  const acknowledgements = Array.isArray(testEvidence.acknowledgements)
    ? testEvidence.acknowledgements
    : [];
  let hasDeferred = false;
  let hasManual = false;
  for (const [rowIndex, row] of validationMap.entries()) {
    if (!isObject(row)) continue;
    if (row.automation === 'not-applicable' || row.status === 'not-applicable') continue;
    if (row.automation === 'deferred' || row.status === 'deferred') {
      hasDeferred = true;
      blockerValues.push(issue('DEFERRED_EVIDENCE_OUTSTANDING', `validation_evidence.validation_map[${rowIndex}]`, 'deferred evidence cannot become PASS'));
      for (const caseId of row.case_ids ?? []) lifecycleValues.push(lifecycle(caseId, 'planned'));
      continue;
    }
    for (const reference of row.evidence_refs ?? []) {
      if (!currentEvidenceRefs.includes(reference)) {
        blockerValues.push(issue('CURRENT_EVIDENCE_REF_MISSING', `validation_evidence.validation_map[${rowIndex}].evidence_refs`, `current test evidence must emit ${reference}`));
      }
    }
    if (row.automation === 'manual') {
      hasManual = true;
      for (const caseId of row.case_ids ?? []) {
        const acknowledgement = acknowledgements.find((candidate) =>
          isObject(candidate) && candidate.case_id === caseId);
        if (!acknowledgement || !isText(acknowledgement.acknowledged_by)) {
          blockerValues.push(issue('MANUAL_ACKNOWLEDGEMENT_REQUIRED', `validation_evidence.${caseId}`, 'manual evidence requires current explicit acknowledgement'));
        } else {
          if (acknowledgement.acknowledged_by !== row.owner) {
            blockerValues.push(issue('MANUAL_ACKNOWLEDGEMENT_OWNER_MISMATCH', `validation_evidence.${caseId}.acknowledged_by`, 'must match the approved validation owner'));
          }
          if (
            acknowledgement.associated_HEAD_or_diff !== current?.associated_HEAD_or_diff ||
            acknowledgement.associated_HEAD_or_diff !== testEvidence.associated_HEAD_or_diff
          ) {
            blockerValues.push(issue('HEAD_DIFF_MISMATCH', `validation_evidence.${caseId}.associated_HEAD_or_diff`, 'manual acknowledgement must match evidence and current state'));
          }
        }
        const acknowledgementValid =
          acknowledgement?.acknowledged_by === row.owner &&
          acknowledgement?.associated_HEAD_or_diff === current?.associated_HEAD_or_diff &&
          testEvidence.associated_HEAD_or_diff === current?.associated_HEAD_or_diff;
        lifecycleValues.push(lifecycle(caseId, acknowledgementValid ? 'passed' : 'planned'));
      }
      continue;
    }
    for (const caseId of row.case_ids ?? []) {
      const caseBlockerCount = blockerValues.length;
      const evidenceCase = cases.get(caseId);
      if (!evidenceCase) {
        blockerValues.push(issue('AC_EVIDENCE_MISSING', `validation_evidence.${caseId}`, `${row.acceptance_criterion_id} has no current mapped case evidence`));
        lifecycleValues.push(lifecycle(caseId, 'planned'));
        continue;
      }
      const requirementRefs = Array.isArray(evidenceCase.requirement_refs)
        ? evidenceCase.requirement_refs
        : [];
      const invariantRefs = Array.isArray(evidenceCase.invariant_refs)
        ? evidenceCase.invariant_refs
        : [];
      if (
        !requirementRefs.includes(row.requirement_id) ||
        !requirementRefs.includes(row.acceptance_criterion_id)
      ) {
        blockerValues.push(issue('CASE_REQUIREMENT_TRACE_MISMATCH', `validation_evidence.${caseId}.requirement_refs`, 'must contain the mapped requirement and AC'));
      }
      if (requirementRefs.some((reference) => {
        const record = evidenceRecordsById.get(reference);
        return !record || !['requirement', 'acceptance-criterion'].includes(record.type);
      })) {
        blockerValues.push(issue('CASE_REQUIREMENT_TRACE_INVALID', `validation_evidence.${caseId}.requirement_refs`, 'may contain only current R-* and AC-* identities'));
      }
      if (invariantRefs.some((reference) => !INVARIANT_ID.test(reference))) {
        blockerValues.push(issue('CASE_INVARIANT_TRACE_INVALID', `validation_evidence.${caseId}.invariant_refs`, 'may contain only INV-* identities'));
      }
      if (invariantRefs.some((reference) => evidenceRecordsById.get(reference)?.type !== 'invariant')) {
        blockerValues.push(issue('CASE_INVARIANT_TRACE_DANGLING', `validation_evidence.${caseId}.invariant_refs`, 'must resolve every INV-* identity against current decision coverage'));
      }
      if ((row.invariant_refs ?? []).some((reference) => !invariantRefs.includes(reference))) {
        blockerValues.push(issue('CASE_INVARIANT_TRACE_MISMATCH', `validation_evidence.${caseId}.invariant_refs`, 'must contain every mapped invariant'));
      }
      if (!isText(evidenceCase.test_ref)) {
        blockerValues.push(issue('TEST_REFERENCE_MISSING', `validation_evidence.${caseId}.test_ref`, 'authored evidence requires an exact test reference'));
        lifecycleValues.push(lifecycle(caseId, 'planned'));
        continue;
      }
      const run = isText(evidenceCase.evidence_run_id)
        ? runs.get(evidenceCase.evidence_run_id)
        : null;
      if (!run) {
        blockerValues.push(issue('EVIDENCE_RUN_MISSING', `validation_evidence.${caseId}.evidence_run_id`, 'authored is not executed without a real run'));
        lifecycleValues.push(lifecycle(caseId, 'authored'));
        continue;
      }
      const runPath = `validation_evidence.test_evidence.runs.${run.run_id}`;
      validateRunFreshness({ row, run, evidence: testEvidence, current: current ?? {}, path: runPath, blockers: blockerValues });
      if (row.module_e2e === true) {
        validateModuleProvenance({ row, run, current, path: runPath, blockers: blockerValues });
      }
      if (run.exit_code !== 0 || run.interrupted !== false || run.failed !== 0 || evidenceCase.result !== 'pass') {
        blockerValues.push(issue('EXECUTION_NOT_PASSED', `validation_evidence.${caseId}`, 'executed evidence did not pass'));
        lifecycleValues.push(lifecycle(caseId, 'executed'));
      } else if (blockerValues.length > caseBlockerCount) {
        lifecycleValues.push(lifecycle(caseId, 'executed'));
      } else {
        lifecycleValues.push(lifecycle(caseId, 'passed'));
      }
    }
  }
  const blockers = finalize(blockerValues);
  const ready = blockers.length === 0;
  return {
    valid: ready,
    ready,
    result: ready ? (hasManual ? 'MANUAL' : 'PASS') : hasDeferred ? 'DEFERRED' : 'FAIL',
    lifecycle: lifecycleValues,
    blockers,
    blocker_messages: blockers.map(issueText),
  };
}
