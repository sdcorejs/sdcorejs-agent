import { createHash } from 'node:crypto';

import { createApprovedArtifact, verifyApprovedArtifact } from './approved-artifact.mjs';

/**
 * Deterministic delivery-convergence evaluator.
 *
 * The evaluator consumes compact, already-produced contract projections. It
 * does not read the repository, create approvals, run tests, update ledgers,
 * or grant Git authority. Missing or malformed input is blocking.
 */

export const CONVERGENCE_SCHEMA_VERSION = 1;
const CONVERGENCE_EVALUATOR_ID = 'sdcorejs-convergence:v1';
const RECEIPT_HASH = /^sha256:v1:[a-f0-9]{64}$/u;
const CONVERGENCE_RECEIPT_CONTRACT = 'convergence-result:v1';

function canonicalizeReceipt(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalizeReceipt).sort((left, right) =>
      JSON.stringify(left).localeCompare(JSON.stringify(right), 'en'));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalizeReceipt(value[key])]));
  }
  return value;
}

function receiptHash(value) {
  return `sha256:v1:${createHash('sha256').update(JSON.stringify(canonicalizeReceipt(value)), 'utf8').digest('hex')}`;
}

function receiptBody(input, result) {
  return `${JSON.stringify(canonicalizeReceipt({ input, result }))}\n`;
}

export function createConvergenceReceiptArtifact(input, {
  approved_at: approvedAt = '2026-08-09T00:00:00.000Z',
  repository_relative_path: repositoryRelativePath = '.sdcorejs/evidence/convergence-result.json',
} = {}) {
  const result = evaluateConvergence(input);
  if (result.status !== 'CONVERGED' || result.fresh !== true) {
    throw new TypeError('canonical convergence input must evaluate to a fresh CONVERGED result');
  }
  return createApprovedArtifact({
    metadata: {
      schema_version: 1,
      artifact_id: `convergence-${result.change_ref}`,
      artifact_kind: 'release-evidence',
      contract_id: CONVERGENCE_RECEIPT_CONTRACT,
      requirement_id: 'delivery-convergence',
      change_ref: result.change_ref,
      track: 'workflow',
      stack_profile: 'markdown-skill-pack',
      owner_repository_id: result.source_identity.repository_id,
      owner_repository_role: 'standalone',
      owner_module_id: null,
      parent_repository_id: null,
      parent_references: [],
      approval_source: 'canonical-convergence-evaluator',
      approved_by: null,
      approved_at: approvedAt,
      repository_relative_path: repositoryRelativePath,
      source_revision: result.source_identity.revision,
      convergence_mode: result.mode,
      convergence_input_hash: result.provenance.input_hash,
      convergence_projection_hash: result.provenance.projection_hash,
      allowed_paths: ['**'],
      prohibited_paths: [],
      supersedes: null,
    },
    body: receiptBody(input, result),
  });
}

function verifyConvergenceReceipt(receipt, result, blockers) {
  const B = CONVERGENCE_BLOCKER_CODES;
  try {
    const verified = verifyApprovedArtifact(receipt);
    const metadata = verified.metadata;
    const payload = JSON.parse(receipt.body);
    if (!isObject(payload) || !isObject(payload.input) || !isObject(payload.result)) {
      throw new Error('receipt body must contain canonical evaluator input and result');
    }
    const evaluated = evaluateConvergence(payload.input);
    if (
      evaluated.status !== 'CONVERGED' ||
      evaluated.fresh !== true ||
      JSON.stringify(canonicalizeReceipt(evaluated)) !==
        JSON.stringify(canonicalizeReceipt(payload.result)) ||
      JSON.stringify(canonicalizeReceipt(evaluated)) !==
        JSON.stringify(canonicalizeReceipt(result))
    ) {
      throw new Error('receipt input does not reproduce the supplied convergence result');
    }
    if (
      metadata.artifact_kind !== 'release-evidence' ||
      metadata.contract_id !== CONVERGENCE_RECEIPT_CONTRACT ||
      metadata.approval_source !== 'canonical-convergence-evaluator' ||
      metadata.change_ref !== result?.change_ref ||
      metadata.convergence_mode !== result?.mode ||
      metadata.owner_repository_id !== result?.source_identity?.repository_id ||
      metadata.source_revision !== result?.source_identity?.revision ||
      metadata.convergence_input_hash !== result?.provenance?.input_hash ||
      metadata.convergence_projection_hash !== result?.provenance?.projection_hash ||
      receipt.body !== receiptBody(payload.input, evaluated)
    ) {
      throw new Error('receipt metadata or body does not bind the supplied convergence result');
    }
  } catch (error) {
    blockers.push(issue(B.CONVERGENCE_RESULT_INVALID, 'convergence_receipt', `must be a verified canonical evaluator receipt: ${error?.message ?? String(error)}`));
  }
}

export const CONVERGENCE_MODES = Object.freeze([
  'feature',
  'bugfix',
  'docs-only',
  'dependency-regression',
]);

export const CONVERGENCE_DRIFT_CODES = Object.freeze({
  REQUIREMENT_WITHOUT_IMPLEMENTATION_OR_EVIDENCE:
    'REQUIREMENT_WITHOUT_IMPLEMENTATION_OR_EVIDENCE',
  AC_WITHOUT_PROVING_TEST: 'AC_WITHOUT_PROVING_TEST',
  UNRELATED_PASSING_TEST: 'UNRELATED_PASSING_TEST',
  UNTRACED_TASK: 'UNTRACED_TASK',
  CHANGE_OUTSIDE_APPROVED_INTENT: 'CHANGE_OUTSIDE_APPROVED_INTENT',
  PLANNED_OR_CHANGED_PATH_DRIFT: 'PLANNED_OR_CHANGED_PATH_DRIFT',
  REQUIRED_ARCHITECTURE_MISSING: 'REQUIRED_ARCHITECTURE_MISSING',
  ARCHITECTURE_INVARIANT_VIOLATION: 'ARCHITECTURE_INVARIANT_VIOLATION',
  ACCEPTED_CONVENTION_VIOLATION: 'ACCEPTED_CONVENTION_VIOLATION',
  OBSERVED_CONVENTION_USED_AS_BLOCKER: 'OBSERVED_CONVENTION_USED_AS_BLOCKER',
  CONFORMANCE_EVIDENCE_STALE_OR_CONFLICTED:
    'CONFORMANCE_EVIDENCE_STALE_OR_CONFLICTED',
  PUBLIC_CONTRACT_MIGRATION_DECISION_MISSING:
    'PUBLIC_CONTRACT_MIGRATION_DECISION_MISSING',
  APPROVED_ARTIFACT_GRAPH_OR_HASH_STALE:
    'APPROVED_ARTIFACT_GRAPH_OR_HASH_STALE',
  MODULE_PORTAL_REVISION_MAP_MISMATCH: 'MODULE_PORTAL_REVISION_MAP_MISMATCH',
  GENERATED_MIRROR_STALE: 'GENERATED_MIRROR_STALE',
  SUMMARY_OR_DEPENDENCY_TOOLCHAIN_FINGERPRINT_STALE:
    'SUMMARY_OR_DEPENDENCY_TOOLCHAIN_FINGERPRINT_STALE',
  MANIFEST_LOCKFILE_RUNTIME_ENGINE_DRIFT:
    'MANIFEST_LOCKFILE_RUNTIME_ENGINE_DRIFT',
  REQUIRED_LEDGER_MISSING: 'REQUIRED_LEDGER_MISSING',
  POST_VERIFICATION_WRITE: 'POST_VERIFICATION_WRITE',
  ARTIFACT_CLOSURE_OR_THREAD_OWNERSHIP_INVALID:
    'ARTIFACT_CLOSURE_OR_THREAD_OWNERSHIP_INVALID',
});

export const CONVERGENCE_BLOCKER_CODES = Object.freeze({
  ...CONVERGENCE_DRIFT_CODES,
  INPUT_INVALID: 'INPUT_INVALID',
  FEATURE_CHAIN_INCOMPLETE: 'FEATURE_CHAIN_INCOMPLETE',
  BUGFIX_DEBUG_REPRO_REQUIRED: 'BUGFIX_DEBUG_REPRO_REQUIRED',
  DOCS_HYGIENE_REQUIRED: 'DOCS_HYGIENE_REQUIRED',
  DEPENDENCY_REGRESSION_REQUIRED: 'DEPENDENCY_REGRESSION_REQUIRED',
  MANUAL_OR_DEFERRED_EVIDENCE: 'MANUAL_OR_DEFERRED_EVIDENCE',
  REQUIRED_ARTIFACT_MISSING: 'REQUIRED_ARTIFACT_MISSING',
  CONVERGENCE_RESULT_MISSING: 'CONVERGENCE_RESULT_MISSING',
  CONVERGENCE_RESULT_INVALID: 'CONVERGENCE_RESULT_INVALID',
  CONVERGENCE_RESULT_NOT_CONVERGED: 'CONVERGENCE_RESULT_NOT_CONVERGED',
  CONVERGENCE_RESULT_STALE: 'CONVERGENCE_RESULT_STALE',
  CONVERGENCE_SOURCE_MISMATCH: 'CONVERGENCE_SOURCE_MISMATCH',
});

const REVISION = /^[a-f0-9]{40}$/u;
const FINGERPRINT = /^sha256(?::v1)?:[a-f0-9]{64}$/u;
const ID_PATTERNS = Object.freeze({
  requirements: /^R-\d{3,}$/u,
  acceptance_criteria: /^AC-\d{3,}$/u,
  invariants: /^INV-\d{3,}$/u,
  risks: /^RISK-\d{3,}$/u,
  tasks: /^TASK-\d{3,}$/u,
  evidence: /^EVIDENCE-\d{3,}$/u,
});
const COLLECTION_LABELS = Object.freeze({
  requirements: 'requirement',
  acceptance_criteria: 'acceptance criterion',
  invariants: 'invariant',
  risks: 'risk',
  tasks: 'task',
  evidence: 'evidence',
});
const AUTOMATION_STATES = new Set([
  'automated',
  'manual',
  'deferred',
  'not-applicable',
]);
const VALIDATION_STATES = new Set([
  'covered',
  'partial',
  'deferred',
  'missing',
  'not-applicable',
]);
const EVIDENCE_RESULTS = new Set(['PASSED', 'FAILED', 'NOT RUN', 'STALE']);
const TASK_STATES = new Set([
  'executed',
  'pending',
  'blocked',
  'deferred',
  'not-applicable',
]);
const STATUS_DOMAINS = Object.freeze({
  intent: new Set(['approved', 'not-applicable']),
  set: new Set(['current', 'not-applicable', 'stale', 'missing', 'conflicted']),
  approved_artifact: new Set(['verified', 'not-applicable', 'missing', 'stale', 'mutated']),
  artifact_identity: new Set(['verified', 'not-applicable', 'missing', 'stale', 'mutated', 'invalid']),
  architecture_conformance: new Set(['conformant', 'verified', 'not-applicable', 'violated', 'conflicted', 'stale']),
  evidence_freshness: new Set(['current', 'not-applicable', 'stale', 'missing']),
  migration: new Set([
    'approved',
    'compatible',
    'compatible-deprecation',
    'deprecation-approved',
    'migration-approved',
    'not-applicable',
    'missing',
  ]),
  freshness: new Set(['current', 'not-applicable', 'stale', 'missing']),
  runtime_engine: new Set(['compatible', 'incompatible', 'missing']),
  debug: new Set(['ready', 'not-applicable', 'blocked', 'missing']),
  reproduction: new Set(['reproduced', 'not-applicable', 'missing', 'stale']),
  check: new Set(['passed', 'not-applicable', 'failed', 'not-run']),
  docs_scope: new Set(['documentation-only', 'not-applicable', 'mixed', 'unknown']),
  dependency_scope: new Set(['dependency-only', 'not-applicable', 'mixed', 'unknown']),
  closure: new Set(['complete', 'incomplete']),
});
const MIGRATION_DECISIONS = new Set([
  'approved',
  'compatible',
  'compatible-deprecation',
  'deprecation-approved',
  'migration-approved',
]);
const FRESHNESS_BLOCKERS = new Set([
  CONVERGENCE_DRIFT_CODES.CONFORMANCE_EVIDENCE_STALE_OR_CONFLICTED,
  CONVERGENCE_DRIFT_CODES.REQUIRED_ARCHITECTURE_MISSING,
  CONVERGENCE_DRIFT_CODES.APPROVED_ARTIFACT_GRAPH_OR_HASH_STALE,
  CONVERGENCE_DRIFT_CODES.MODULE_PORTAL_REVISION_MAP_MISMATCH,
  CONVERGENCE_DRIFT_CODES.GENERATED_MIRROR_STALE,
  CONVERGENCE_DRIFT_CODES.SUMMARY_OR_DEPENDENCY_TOOLCHAIN_FINGERPRINT_STALE,
  CONVERGENCE_DRIFT_CODES.MANIFEST_LOCKFILE_RUNTIME_ENGINE_DRIFT,
  CONVERGENCE_DRIFT_CODES.REQUIRED_LEDGER_MISSING,
  CONVERGENCE_DRIFT_CODES.POST_VERIFICATION_WRITE,
  CONVERGENCE_DRIFT_CODES.ARTIFACT_CLOSURE_OR_THREAD_OWNERSHIP_INVALID,
  CONVERGENCE_BLOCKER_CODES.REQUIRED_ARTIFACT_MISSING,
]);

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isText(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isSafePath(value) {
  if (!isText(value) || value.includes('\0') || value.includes('\\')) return false;
  if (value.startsWith('/') || /^[A-Za-z]:\//u.test(value)) return false;
  const segments = value.replace(/^\.\//u, '').split('/');
  return !segments.includes('..') && segments.every((segment) => segment !== '');
}

function isSafeSymbol(value) {
  if (!isText(value)) return false;
  const separator = value.indexOf('#');
  if (separator <= 0 || separator === value.length - 1) return false;
  return isSafePath(value.slice(0, separator)) && !/[\s#]/u.test(value.slice(separator + 1));
}

function issue(code, path, message) {
  return { code, path, message };
}

function issueKey(value) {
  return `${value.code}\u0000${value.path}\u0000${value.message}`;
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sortIssues(values) {
  const unique = new Map();
  for (const value of values) unique.set(issueKey(value), value);
  return [...unique.values()].sort((left, right) =>
    compareText(issueKey(left), issueKey(right)),
  );
}

function sortedUnique(values) {
  return [...new Set(values)].sort(compareText);
}

function orderedMap(value) {
  if (!isObject(value)) return null;
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => compareText(left, right)),
  );
}

function canonicalMap(value) {
  const ordered = orderedMap(value);
  return ordered === null ? null : JSON.stringify(ordered);
}

function requireObject(value, path, errors) {
  if (!isObject(value)) {
    errors.push(issue('OBJECT_REQUIRED', path, 'must be an object'));
    return false;
  }
  return true;
}

function requireText(value, path, errors) {
  if (!isText(value)) {
    errors.push(issue('TEXT_REQUIRED', path, 'must be non-empty text'));
    return false;
  }
  return true;
}

function validateEnum(value, path, domain, errors) {
  if (!domain.has(value)) {
    errors.push(
      issue(
        'STATUS_INVALID',
        path,
        `must be one of ${[...domain].sort(compareText).join(', ')}`,
      ),
    );
  }
}

function validatePathArray(value, path, errors, { symbols = false } = {}) {
  if (!Array.isArray(value)) {
    errors.push(issue('ARRAY_REQUIRED', path, 'must be an explicit array'));
    return [];
  }
  const seen = new Set();
  const result = [];
  for (const [index, candidate] of value.entries()) {
    const valid = symbols ? isSafeSymbol(candidate) : isSafePath(candidate);
    if (!valid) {
      errors.push(
        issue(
          symbols ? 'SYMBOL_REF_INVALID' : 'PATH_INVALID',
          `${path}[${index}]`,
          symbols
            ? 'must be a safe repository-relative path#symbol reference'
            : 'must be a safe repository-relative path',
        ),
      );
      continue;
    }
    if (seen.has(candidate)) {
      errors.push(issue('DUPLICATE_VALUE', path, `duplicates ${candidate}`));
      continue;
    }
    seen.add(candidate);
    result.push(candidate);
  }
  return result;
}

function validateRevisionMap(value, path, errors) {
  if (!requireObject(value, path, errors)) return;
  for (const [key, revision] of Object.entries(value)) {
    if (!isText(key) || !REVISION.test(revision ?? '')) {
      errors.push(
        issue(
          'REVISION_MAP_INVALID',
          `${path}.${key || '<empty>'}`,
          'must map a stable module id to a lowercase 40-character revision',
        ),
      );
    }
  }
}

function collectIds(input, collection, errors) {
  const path = `convergence.${collection}`;
  const rows = input?.[collection];
  if (!Array.isArray(rows)) {
    errors.push(issue('ARRAY_REQUIRED', path, 'must be an explicit array'));
    return new Set();
  }
  const ids = new Set();
  for (const [index, row] of rows.entries()) {
    if (!isObject(row)) {
      errors.push(issue('ENTRY_INVALID', `${path}[${index}]`, 'must be an object'));
      continue;
    }
    if (!ID_PATTERNS[collection].test(row.id ?? '')) {
      errors.push(
        issue(
          'ID_INVALID',
          `${path}[${index}].id`,
          `must be a canonical ${COLLECTION_LABELS[collection]} id`,
        ),
      );
      continue;
    }
    if (ids.has(row.id)) {
      errors.push(issue('ID_DUPLICATE', path, `duplicates ${row.id}`));
    }
    ids.add(row.id);
  }
  return ids;
}

function validateRefs(value, path, targetIds, errors, { textOnly = false } = {}) {
  if (!Array.isArray(value)) {
    errors.push(issue('REF_ARRAY_REQUIRED', path, 'must be an explicit reference array'));
    return [];
  }
  const seen = new Set();
  const refs = [];
  for (const [index, reference] of value.entries()) {
    if (!isText(reference)) {
      errors.push(issue('REF_INVALID', `${path}[${index}]`, 'must be a non-empty reference'));
      continue;
    }
    if (seen.has(reference)) {
      errors.push(issue('REF_DUPLICATE', path, `duplicates ${reference}`));
      continue;
    }
    seen.add(reference);
    refs.push(reference);
    if (!textOnly && !targetIds.has(reference)) {
      errors.push(issue('REF_DANGLING', `${path}[${index}]`, `references unknown ${reference}`));
    }
  }
  return refs;
}

function validateTraceability(input, ids, errors) {
  for (const [index, requirement] of input.requirements.entries()) {
    const path = `convergence.requirements[${index}]`;
    validateRefs(
      requirement.acceptance_criterion_refs,
      `${path}.acceptance_criterion_refs`,
      ids.acceptance_criteria,
      errors,
    );
    validateRefs(requirement.task_refs, `${path}.task_refs`, ids.tasks, errors);
    validateRefs(requirement.evidence_refs, `${path}.evidence_refs`, ids.evidence, errors);
  }

  for (const [index, criterion] of input.acceptance_criteria.entries()) {
    const path = `convergence.acceptance_criteria[${index}]`;
    validateRefs(criterion.requirement_refs, `${path}.requirement_refs`, ids.requirements, errors);
    validateRefs(criterion.task_refs, `${path}.task_refs`, ids.tasks, errors);
    validateRefs(criterion.evidence_refs, `${path}.evidence_refs`, ids.evidence, errors);
  }

  for (const [index, task] of input.tasks.entries()) {
    const path = `convergence.tasks[${index}]`;
    requireText(task.status, `${path}.status`, errors);
    if (!TASK_STATES.has(task.status)) {
      errors.push(
        issue(
          'TASK_STATUS_INVALID',
          `${path}.status`,
          'uses an unsupported execution state',
        ),
      );
    }
    validateRefs(task.requirement_refs, `${path}.requirement_refs`, ids.requirements, errors);
    validateRefs(
      task.acceptance_criterion_refs,
      `${path}.acceptance_criterion_refs`,
      ids.acceptance_criteria,
      errors,
    );
    validateRefs(task.invariant_refs, `${path}.invariant_refs`, ids.invariants, errors);
    validateRefs(task.risk_refs, `${path}.risk_refs`, ids.risks, errors);
    validatePathArray(task.planned_paths, `${path}.planned_paths`, errors);
    validatePathArray(task.changed_path_refs, `${path}.changed_path_refs`, errors);
    validatePathArray(task.changed_symbol_refs, `${path}.changed_symbol_refs`, errors, {
      symbols: true,
    });
    validateRefs(task.evidence_refs, `${path}.evidence_refs`, ids.evidence, errors);
  }

  if (!Array.isArray(input.changes)) return;
  for (const [index, change] of input.changes.entries()) {
    const path = `convergence.changes[${index}]`;
    if (!isObject(change)) {
      errors.push(issue('ENTRY_INVALID', path, 'must be an object'));
      continue;
    }
    if (!isSafePath(change.path)) {
      errors.push(issue('PATH_INVALID', `${path}.path`, 'must be a safe repository-relative path'));
    }
    validatePathArray(change.symbols, `${path}.symbols`, errors, { symbols: true });
    validateRefs(change.task_refs, `${path}.task_refs`, ids.tasks, errors);
    validateRefs(change.requirement_refs, `${path}.requirement_refs`, ids.requirements, errors);
    validateRefs(
      change.acceptance_criterion_refs,
      `${path}.acceptance_criterion_refs`,
      ids.acceptance_criteria,
      errors,
    );
    validateRefs(change.invariant_refs, `${path}.invariant_refs`, ids.invariants, errors);
  }

  if (!Array.isArray(input.validation_map)) return;
  for (const [index, row] of input.validation_map.entries()) {
    const path = `convergence.validation_map[${index}]`;
    if (!isObject(row)) {
      errors.push(issue('ENTRY_INVALID', path, 'must be an object'));
      continue;
    }
    if (!ids.requirements.has(row.requirement_id)) {
      errors.push(issue('REF_DANGLING', `${path}.requirement_id`, `references unknown ${row.requirement_id}`));
    }
    if (!ids.acceptance_criteria.has(row.acceptance_criterion_id)) {
      errors.push(
        issue(
          'REF_DANGLING',
          `${path}.acceptance_criterion_id`,
          `references unknown ${row.acceptance_criterion_id}`,
        ),
      );
    }
    validateRefs(row.invariant_refs, `${path}.invariant_refs`, ids.invariants, errors);
    if (!ids.risks.has(row.risk)) {
      errors.push(issue('REF_DANGLING', `${path}.risk`, `references unknown ${row.risk}`));
    }
    validateRefs(row.case_ids, `${path}.case_ids`, new Set(), errors, { textOnly: true });
    validateRefs(row.evidence_refs, `${path}.evidence_refs`, ids.evidence, errors);
    if (!AUTOMATION_STATES.has(row.automation)) {
      errors.push(issue('AUTOMATION_INVALID', `${path}.automation`, 'uses an unsupported automation state'));
    }
    if (!VALIDATION_STATES.has(row.status)) {
      errors.push(issue('VALIDATION_STATUS_INVALID', `${path}.status`, 'uses an unsupported coverage state'));
    }
    if (['manual', 'deferred'].includes(row.automation) || row.status === 'deferred') {
      requireText(row.rationale, `${path}.rationale`, errors);
      requireText(row.owner, `${path}.owner`, errors);
      if (row.acknowledgement_required !== true) {
        errors.push(
          issue(
            'ACKNOWLEDGEMENT_REQUIRED',
            `${path}.acknowledgement_required`,
            'manual or deferred validation requires explicit acknowledgement',
          ),
        );
      }
    }
  }

  for (const [index, evidence] of input.evidence.entries()) {
    const path = `convergence.evidence[${index}]`;
    if (!EVIDENCE_RESULTS.has(evidence.result)) {
      errors.push(issue('EVIDENCE_RESULT_INVALID', `${path}.result`, 'uses an unsupported evidence result'));
    }
    if (!['current', 'stale'].includes(evidence.freshness)) {
      errors.push(issue('EVIDENCE_FRESHNESS_INVALID', `${path}.freshness`, 'must be current or stale'));
    }
    validateRefs(evidence.requirement_refs, `${path}.requirement_refs`, ids.requirements, errors);
    validateRefs(
      evidence.acceptance_criterion_refs,
      `${path}.acceptance_criterion_refs`,
      ids.acceptance_criteria,
      errors,
    );
    validateRefs(evidence.task_refs, `${path}.task_refs`, ids.tasks, errors);
    validateRefs(evidence.invariant_refs, `${path}.invariant_refs`, ids.invariants, errors);
    validatePathArray(evidence.path_refs, `${path}.path_refs`, errors);
    validatePathArray(evidence.symbol_refs, `${path}.symbol_refs`, errors, { symbols: true });
    validateRefs(evidence.case_ids, `${path}.case_ids`, new Set(), errors, { textOnly: true });
    if (!REVISION.test(evidence.source_revision ?? '')) {
      errors.push(issue('REVISION_INVALID', `${path}.source_revision`, 'must be a lowercase 40-character revision'));
    }
    if (!FINGERPRINT.test(evidence.source_fingerprint ?? '')) {
      errors.push(issue('FINGERPRINT_INVALID', `${path}.source_fingerprint`, 'must be a sha256 fingerprint'));
    }
    if (!REVISION.test(evidence.portal_revision ?? '')) {
      errors.push(issue('REVISION_INVALID', `${path}.portal_revision`, 'must be a lowercase 40-character revision'));
    }
    validateRevisionMap(evidence.module_revision_map, `${path}.module_revision_map`, errors);
  }
}

/** Validate the portable convergence input without reading external state. */
export function validateConvergenceInput(input) {
  const errors = [];
  if (!isObject(input)) {
    return {
      valid: false,
      errors: [issue('OBJECT_REQUIRED', 'convergence', 'must be an object')],
    };
  }
  if (input.schema_version !== CONVERGENCE_SCHEMA_VERSION) {
    errors.push(
      issue(
        'SCHEMA_VERSION_UNSUPPORTED',
        'convergence.schema_version',
        `must be ${CONVERGENCE_SCHEMA_VERSION}`,
      ),
    );
  }
  if (!CONVERGENCE_MODES.includes(input.mode)) {
    errors.push(
      issue(
        'MODE_INVALID',
        'convergence.mode',
        `must be one of ${CONVERGENCE_MODES.join(', ')}`,
      ),
    );
  }
  requireText(input.change_ref, 'convergence.change_ref', errors);

  if (requireObject(input.thread, 'convergence.thread', errors)) {
    requireText(input.thread.thread_id, 'convergence.thread.thread_id', errors);
    requireText(input.thread.owner_thread_id, 'convergence.thread.owner_thread_id', errors);
  }
  if (requireObject(input.source, 'convergence.source', errors)) {
    requireText(input.source.repository_id, 'convergence.source.repository_id', errors);
    if (!REVISION.test(input.source.revision ?? '')) {
      errors.push(issue('REVISION_INVALID', 'convergence.source.revision', 'must be a lowercase 40-character revision'));
    }
    if (!FINGERPRINT.test(input.source.fingerprint ?? '')) {
      errors.push(issue('FINGERPRINT_INVALID', 'convergence.source.fingerprint', 'must be a sha256 fingerprint'));
    }
    if (!REVISION.test(input.source.portal_revision ?? '')) {
      errors.push(issue('REVISION_INVALID', 'convergence.source.portal_revision', 'must be a lowercase 40-character revision'));
    }
    validateRevisionMap(input.source.module_revision_map, 'convergence.source.module_revision_map', errors);
    validateRevisionMap(
      input.source.pinned_module_revision_map,
      'convergence.source.pinned_module_revision_map',
      errors,
    );
  }

  for (const field of [
    'artifacts',
    'approved_scope',
    'architecture',
    'conventions',
    'public_contract',
    'generated_mirrors',
    'summary',
    'toolchain',
    'ledgers',
    'lifecycle',
    'debug',
    'docs_hygiene',
    'dependency_regression',
  ]) {
    requireObject(input[field], `convergence.${field}`, errors);
  }
  for (const field of ['changes', 'validation_map']) {
    if (!Array.isArray(input[field])) {
      errors.push(issue('ARRAY_REQUIRED', `convergence.${field}`, 'must be an explicit array'));
    }
  }
  if (isObject(input.approved_scope)) {
    validatePathArray(input.approved_scope.paths, 'convergence.approved_scope.paths', errors);
    validatePathArray(input.approved_scope.symbols, 'convergence.approved_scope.symbols', errors, {
      symbols: true,
    });
  }

  const ids = Object.fromEntries(
    Object.keys(ID_PATTERNS).map((collection) => [
      collection,
      collectIds(input, collection, errors),
    ]),
  );
  if (
    ['requirements', 'acceptance_criteria', 'invariants', 'risks', 'tasks', 'evidence'].every(
      (collection) =>
        Array.isArray(input[collection]) && input[collection].every(isObject),
    ) &&
    Array.isArray(input.changes) && input.changes.every(isObject) &&
    Array.isArray(input.validation_map) && input.validation_map.every(isObject)
  ) {
    validateTraceability(input, ids, errors);
  }

  if (isObject(input.artifacts)) {
    for (const field of ['intent_status', 'requirement_set_status', 'decision_set_status', 'assumption_set_status', 'graph_status', 'hash_status']) {
      requireText(input.artifacts[field], `convergence.artifacts.${field}`, errors);
    }
    for (const field of ['spec', 'architecture', 'plan']) {
      const state = input.artifacts[field];
      if (requireObject(state, `convergence.artifacts.${field}`, errors)) {
        if (typeof state.required !== 'boolean') {
          errors.push(issue('BOOLEAN_REQUIRED', `convergence.artifacts.${field}.required`, 'must be boolean'));
        }
        requireText(state.status, `convergence.artifacts.${field}.status`, errors);
        validateEnum(
          state.status,
          `convergence.artifacts.${field}.status`,
          STATUS_DOMAINS.approved_artifact,
          errors,
        );
      }
    }
    validateEnum(input.artifacts.intent_status, 'convergence.artifacts.intent_status', STATUS_DOMAINS.intent, errors);
    for (const field of ['requirement_set_status', 'decision_set_status', 'assumption_set_status']) {
      validateEnum(input.artifacts[field], `convergence.artifacts.${field}`, STATUS_DOMAINS.set, errors);
    }
    for (const field of ['graph_status', 'hash_status']) {
      validateEnum(input.artifacts[field], `convergence.artifacts.${field}`, STATUS_DOMAINS.artifact_identity, errors);
    }
  }

  if (isObject(input.architecture)) {
    if (typeof input.architecture.required !== 'boolean') {
      errors.push(issue('BOOLEAN_REQUIRED', 'convergence.architecture.required', 'must be boolean'));
    }
    for (const field of ['snapshot_status', 'conformance_status', 'evidence_status']) {
      requireText(input.architecture[field], `convergence.architecture.${field}`, errors);
    }
    validateEnum(input.architecture.snapshot_status, 'convergence.architecture.snapshot_status', STATUS_DOMAINS.approved_artifact, errors);
    validateEnum(input.architecture.conformance_status, 'convergence.architecture.conformance_status', STATUS_DOMAINS.architecture_conformance, errors);
    validateEnum(input.architecture.evidence_status, 'convergence.architecture.evidence_status', STATUS_DOMAINS.evidence_freshness, errors);
    if (typeof input.architecture.conflicted !== 'boolean') {
      errors.push(issue('BOOLEAN_REQUIRED', 'convergence.architecture.conflicted', 'must be boolean'));
    }
    validateRefs(
      input.architecture.violated_invariant_refs,
      'convergence.architecture.violated_invariant_refs',
      ids.invariants,
      errors,
    );
  }

  if (isObject(input.conventions)) {
    requireText(input.conventions.evidence_status, 'convergence.conventions.evidence_status', errors);
    validateEnum(input.conventions.evidence_status, 'convergence.conventions.evidence_status', STATUS_DOMAINS.evidence_freshness, errors);
    if (typeof input.conventions.conflicted !== 'boolean') {
      errors.push(issue('BOOLEAN_REQUIRED', 'convergence.conventions.conflicted', 'must be boolean'));
    }
    validateRefs(
      input.conventions.accepted_violations,
      'convergence.conventions.accepted_violations',
      new Set(),
      errors,
      { textOnly: true },
    );
    if (!Array.isArray(input.conventions.observed_findings)) {
      errors.push(issue('ARRAY_REQUIRED', 'convergence.conventions.observed_findings', 'must be an explicit array'));
    } else {
      for (const [index, finding] of input.conventions.observed_findings.entries()) {
        const path = `convergence.conventions.observed_findings[${index}]`;
        if (!isObject(finding)) {
          errors.push(issue('ENTRY_INVALID', path, 'must be an object'));
          continue;
        }
        requireText(finding.id, `${path}.id`, errors);
        if (typeof finding.blocking !== 'boolean') {
          errors.push(issue('BOOLEAN_REQUIRED', `${path}.blocking`, 'must be boolean'));
        }
        if (typeof finding.repair_authorized !== 'boolean') {
          errors.push(issue('BOOLEAN_REQUIRED', `${path}.repair_authorized`, 'must be boolean'));
        }
      }
    }
  }

  if (isObject(input.public_contract)) {
    if (typeof input.public_contract.changed !== 'boolean') {
      errors.push(issue('BOOLEAN_REQUIRED', 'convergence.public_contract.changed', 'must be boolean'));
    }
    requireText(
      input.public_contract.migration_decision_status,
      'convergence.public_contract.migration_decision_status',
      errors,
    );
    validateEnum(input.public_contract.migration_decision_status, 'convergence.public_contract.migration_decision_status', STATUS_DOMAINS.migration, errors);
  }

  if (isObject(input.generated_mirrors)) {
    if (typeof input.generated_mirrors.required !== 'boolean') {
      errors.push(issue('BOOLEAN_REQUIRED', 'convergence.generated_mirrors.required', 'must be boolean'));
    }
    requireText(input.generated_mirrors.status, 'convergence.generated_mirrors.status', errors);
    validateEnum(input.generated_mirrors.status, 'convergence.generated_mirrors.status', STATUS_DOMAINS.freshness, errors);
  }

  if (isObject(input.summary)) {
    if (typeof input.summary.required !== 'boolean') {
      errors.push(issue('BOOLEAN_REQUIRED', 'convergence.summary.required', 'must be boolean'));
    }
    requireText(input.summary.status, 'convergence.summary.status', errors);
    validateEnum(input.summary.status, 'convergence.summary.status', STATUS_DOMAINS.freshness, errors);
    requireText(
      input.summary.dependency_fingerprint_status,
      'convergence.summary.dependency_fingerprint_status',
      errors,
    );
    validateEnum(input.summary.dependency_fingerprint_status, 'convergence.summary.dependency_fingerprint_status', STATUS_DOMAINS.freshness, errors);
  }

  if (isObject(input.toolchain)) {
    for (const field of ['dependency_fingerprint_status', 'manifest_status', 'lockfile_status', 'runtime_engine_status']) {
      requireText(input.toolchain[field], `convergence.toolchain.${field}`, errors);
    }
    for (const field of ['dependency_fingerprint_status', 'manifest_status', 'lockfile_status']) {
      validateEnum(input.toolchain[field], `convergence.toolchain.${field}`, STATUS_DOMAINS.freshness, errors);
    }
    validateEnum(input.toolchain.runtime_engine_status, 'convergence.toolchain.runtime_engine_status', STATUS_DOMAINS.runtime_engine, errors);
  }

  if (isObject(input.ledgers)) {
    for (const field of ['product', 'design', 'documentation']) {
      const state = input.ledgers[field];
      if (requireObject(state, `convergence.ledgers.${field}`, errors)) {
        if (typeof state.required !== 'boolean') {
          errors.push(issue('BOOLEAN_REQUIRED', `convergence.ledgers.${field}.required`, 'must be boolean'));
        }
        requireText(state.status, `convergence.ledgers.${field}.status`, errors);
        validateEnum(state.status, `convergence.ledgers.${field}.status`, STATUS_DOMAINS.freshness, errors);
      }
    }
  }

  for (const [field, state] of [
    ['debug', input.debug],
    ['docs_hygiene', input.docs_hygiene],
    ['dependency_regression', input.dependency_regression],
  ]) {
    if (!isObject(state)) continue;
    requireText(state.status, `convergence.${field}.status`, errors);
    validateRefs(
      state.evidence_refs,
      `convergence.${field}.evidence_refs`,
      ids.evidence,
      errors,
    );
  }
  if (isObject(input.debug)) {
    requireText(input.debug.reproduction_status, 'convergence.debug.reproduction_status', errors);
    validateEnum(input.debug.status, 'convergence.debug.status', STATUS_DOMAINS.debug, errors);
    validateEnum(input.debug.reproduction_status, 'convergence.debug.reproduction_status', STATUS_DOMAINS.reproduction, errors);
  }
  if (isObject(input.docs_hygiene)) {
    validateEnum(input.docs_hygiene.status, 'convergence.docs_hygiene.status', STATUS_DOMAINS.check, errors);
    requireText(input.docs_hygiene.changed_scope_status, 'convergence.docs_hygiene.changed_scope_status', errors);
    validateEnum(input.docs_hygiene.changed_scope_status, 'convergence.docs_hygiene.changed_scope_status', STATUS_DOMAINS.docs_scope, errors);
  }
  if (isObject(input.dependency_regression)) {
    validateEnum(input.dependency_regression.status, 'convergence.dependency_regression.status', STATUS_DOMAINS.check, errors);
    requireText(input.dependency_regression.changed_scope_status, 'convergence.dependency_regression.changed_scope_status', errors);
    validateEnum(input.dependency_regression.changed_scope_status, 'convergence.dependency_regression.changed_scope_status', STATUS_DOMAINS.dependency_scope, errors);
    validatePathArray(input.dependency_regression.manifest_paths, 'convergence.dependency_regression.manifest_paths', errors);
  }

  if (isObject(input.lifecycle)) {
    if (!REVISION.test(input.lifecycle.verification_revision ?? '')) {
      errors.push(issue('REVISION_INVALID', 'convergence.lifecycle.verification_revision', 'must be a lowercase 40-character revision'));
    }
    if (
      input.lifecycle.branch_ready_revision !== null &&
      !REVISION.test(input.lifecycle.branch_ready_revision ?? '')
    ) {
      errors.push(issue('REVISION_INVALID', 'convergence.lifecycle.branch_ready_revision', 'must be null or a lowercase 40-character revision'));
    }
    validatePathArray(
      input.lifecycle.writes_after_verification,
      'convergence.lifecycle.writes_after_verification',
      errors,
    );
    validatePathArray(
      input.lifecycle.writes_after_branch_ready,
      'convergence.lifecycle.writes_after_branch_ready',
      errors,
    );
    validateEnum(input.lifecycle.artifact_closure_status, 'convergence.lifecycle.artifact_closure_status', STATUS_DOMAINS.closure, errors);
    requireText(input.lifecycle.artifact_thread_id, 'convergence.lifecycle.artifact_thread_id', errors);
  }

  const result = sortIssues(errors);
  return { valid: result.length === 0, errors: result };
}

function compactResult(input, blockers, { validationErrors = false } = {}) {
  const sortedBlockers = sortIssues(blockers);
  const blockerCodes = sortedUnique(sortedBlockers.map(({ code }) => code));
  const manualOnly =
    blockerCodes.length === 1 &&
    blockerCodes[0] === CONVERGENCE_BLOCKER_CODES.MANUAL_OR_DEFERRED_EVIDENCE;
  const staleEvidence = (Array.isArray(input?.evidence) ? input.evidence : []).some(
    (evidence) => isObject(evidence) && evidence.freshness !== 'current',
  );
  const freshnessBlocked =
    validationErrors ||
    staleEvidence ||
    blockerCodes.some((code) => FRESHNESS_BLOCKERS.has(code));
  const sourceIdentityIsSafe =
    isObject(input?.source) &&
    isObject(input?.thread) &&
    isText(input.source.repository_id) &&
    REVISION.test(input.source.revision ?? '') &&
    FINGERPRINT.test(input.source.fingerprint ?? '') &&
    REVISION.test(input.source.portal_revision ?? '') &&
    isObject(input.source.module_revision_map) &&
    isObject(input.source.pinned_module_revision_map) &&
    isText(input.thread.owner_thread_id);
  const projection = {
    schema_version: CONVERGENCE_SCHEMA_VERSION,
    change_ref: isText(input?.change_ref) ? input.change_ref : null,
    mode: CONVERGENCE_MODES.includes(input?.mode) ? input.mode : null,
    status:
      sortedBlockers.length === 0 ? 'CONVERGED' : manualOnly ? 'DEFERRED' : 'BLOCKED',
    fresh: !freshnessBlocked,
    source_identity: sourceIdentityIsSafe
      ? {
            repository_id: input.source.repository_id,
            revision: input.source.revision,
            fingerprint: input.source.fingerprint,
            portal_revision: input.source.portal_revision,
            module_revision_map: orderedMap(input.source.module_revision_map),
            pinned_module_revision_map: orderedMap(input.source.pinned_module_revision_map),
            owner_thread_id: input.thread.owner_thread_id,
        }
      : null,
    blocker_codes: blockerCodes,
    blockers: sortedBlockers,
    evidence_refs: sortedUnique(
      (Array.isArray(input?.evidence) ? input.evidence : [])
        .filter(isObject)
        .map(({ id }) => id)
        .filter(isText),
    ),
    summary: {
      requirements: Array.isArray(input?.requirements) ? input.requirements.length : 0,
      acceptance_criteria: Array.isArray(input?.acceptance_criteria)
        ? input.acceptance_criteria.length
        : 0,
      tasks: Array.isArray(input?.tasks) ? input.tasks.length : 0,
      changed_paths: Array.isArray(input?.changes) ? input.changes.length : 0,
      evidence: Array.isArray(input?.evidence) ? input.evidence.length : 0,
    },
  };
  return {
    ...projection,
    provenance: {
      evaluator: CONVERGENCE_EVALUATOR_ID,
      input_hash: receiptHash(input),
      projection_hash: receiptHash(projection),
    },
  };
}

function add(blockers, code, path, message) {
  blockers.push(issue(code, path, message));
}

function evidenceIsCurrentAndPassed(evidence) {
  return evidence?.result === 'PASSED' && evidence?.freshness === 'current';
}

function coversAll(actual, expected) {
  const actualValues = new Set(actual ?? []);
  return (expected ?? []).every((value) => actualValues.has(value));
}

function sameStringSet(left, right) {
  return coversAll(left, right) && coversAll(right, left);
}

function referencedCurrentEvidence(input, references) {
  const byId = new Map(input.evidence.map((entry) => [entry.id, entry]));
  if (!Array.isArray(references) || references.length === 0) return [];
  const resolved = references.map((reference) => byId.get(reference));
  return resolved.every(evidenceIsCurrentAndPassed) ? resolved : [];
}

function hasExecutionScope(input) {
  return input.tasks.length > 0 && input.changes.length > 0 && input.evidence.length > 0;
}

function activeModeEvidenceRefs(input) {
  return {
    feature: [],
    bugfix: input.debug.evidence_refs,
    'docs-only': input.docs_hygiene.evidence_refs,
    'dependency-regression': input.dependency_regression.evidence_refs,
  }[input.mode];
}

function modeEvidenceCoversExecution(input, evidence) {
  const paths = new Set(evidence.flatMap(({ path_refs: pathRefs }) => pathRefs));
  const symbols = new Set(evidence.flatMap(({ symbol_refs: symbolRefs }) => symbolRefs));
  const tasks = new Set(evidence.flatMap(({ task_refs: taskRefs }) => taskRefs));
  return (
    input.changes.every(
      (change) =>
        paths.has(change.path) && change.symbols.every((symbol) => symbols.has(symbol)),
    ) && input.tasks.every((task) => tasks.has(task.id))
  );
}

function evaluateMode(input, blockers) {
  const B = CONVERGENCE_BLOCKER_CODES;
  const artifacts = input.artifacts;
  if (input.mode === 'feature') {
    const incomplete =
      artifacts.intent_status !== 'approved' ||
      artifacts.requirement_set_status !== 'current' ||
      artifacts.decision_set_status !== 'current' ||
      artifacts.assumption_set_status !== 'current' ||
      artifacts.spec?.required !== true ||
      artifacts.spec?.status !== 'verified' ||
      artifacts.plan?.required !== true ||
      artifacts.plan?.status !== 'verified' ||
      ![
        input.requirements,
        input.acceptance_criteria,
        input.invariants,
        input.risks,
        input.tasks,
        input.changes,
        input.validation_map,
        input.evidence,
      ].every((collection) => collection.length > 0);
    if (incomplete) {
      add(
        blockers,
        B.FEATURE_CHAIN_INCOMPLETE,
        'convergence.artifacts',
        'feature mode requires approved intent, current requirement/decision/assumption sets, an approved spec, and an approved plan',
      );
    }
    return;
  }
  if (input.mode === 'bugfix') {
    const modeEvidence = referencedCurrentEvidence(input, input.debug.evidence_refs);
    if (
      input.debug.status !== 'ready' ||
      input.debug.reproduction_status !== 'reproduced' ||
      modeEvidence.length === 0 ||
      !modeEvidenceCoversExecution(input, modeEvidence) ||
      !hasExecutionScope(input)
    ) {
      add(
        blockers,
        B.BUGFIX_DEBUG_REPRO_REQUIRED,
        'convergence.debug',
        'bugfix mode requires a ready debug contract and reproduced current evidence; an approved spec is not fabricated',
      );
    }
    return;
  }
  if (input.mode === 'docs-only') {
    const modeEvidence = referencedCurrentEvidence(input, input.docs_hygiene.evidence_refs);
    if (
      input.docs_hygiene.status !== 'passed' ||
      input.docs_hygiene.changed_scope_status !== 'documentation-only' ||
      modeEvidence.length === 0 ||
      !modeEvidenceCoversExecution(input, modeEvidence) ||
      !hasExecutionScope(input)
    ) {
      add(
        blockers,
        B.DOCS_HYGIENE_REQUIRED,
        'convergence.docs_hygiene',
        'docs-only mode requires a passed hygiene contract and a documentation-only changed scope',
      );
    }
    return;
  }
  const modeEvidence = referencedCurrentEvidence(
    input,
    input.dependency_regression.evidence_refs,
  );
  const manifestPaths = new Set(input.dependency_regression.manifest_paths);
  const changedPaths = input.changes.map(({ path }) => path);
  if (
    input.dependency_regression.status !== 'passed' ||
    input.dependency_regression.changed_scope_status !== 'dependency-only' ||
    manifestPaths.size === 0 ||
    changedPaths.length === 0 ||
    changedPaths.some((path) => !manifestPaths.has(path)) ||
    !modeEvidenceCoversExecution(input, modeEvidence) ||
    modeEvidence.length === 0 ||
    !hasExecutionScope(input)
  ) {
    add(
      blockers,
      B.DEPENDENCY_REGRESSION_REQUIRED,
      'convergence.dependency_regression',
      'dependency-regression mode requires current passed dependency-regression evidence',
    );
  }
}

function evaluateTraceability(input, blockers) {
  const D = CONVERGENCE_DRIFT_CODES;
  const requirementsById = new Map(input.requirements.map((row) => [row.id, row]));
  const criteriaById = new Map(input.acceptance_criteria.map((row) => [row.id, row]));
  const tasksById = new Map(input.tasks.map((row) => [row.id, row]));
  const evidenceById = new Map(input.evidence.map((row) => [row.id, row]));
  const validationRowsByAc = new Map();
  for (const row of input.validation_map) {
    const rows = validationRowsByAc.get(row.acceptance_criterion_id) ?? [];
    rows.push(row);
    validationRowsByAc.set(row.acceptance_criterion_id, rows);
  }

  if (input.mode === 'feature') {
    for (const requirement of input.requirements) {
      const criteriaLinked =
        requirement.acceptance_criterion_refs.length > 0 &&
        requirement.acceptance_criterion_refs.every((reference) =>
          criteriaById.get(reference)?.requirement_refs.includes(requirement.id),
        );
      const tasksLinked =
        requirement.task_refs.length > 0 &&
        requirement.task_refs.every((reference) => {
          const task = tasksById.get(reference);
          return (
            task?.status === 'executed' &&
            task.requirement_refs.includes(requirement.id) &&
            task.changed_path_refs.length > 0
          );
        });
      const evidenceLinked =
        requirement.evidence_refs.length > 0 &&
        requirement.evidence_refs.every((reference) => {
          const evidence = evidenceById.get(reference);
          return (
            evidenceIsCurrentAndPassed(evidence) &&
            evidence.requirement_refs.includes(requirement.id)
          );
        });
      if (!criteriaLinked || !tasksLinked || !evidenceLinked) {
        add(
          blockers,
          D.REQUIREMENT_WITHOUT_IMPLEMENTATION_OR_EVIDENCE,
          `convergence.requirements.${requirement.id}`,
          `${requirement.id} lacks reciprocal acceptance, executed implementation, or current proving evidence links`,
        );
      }
    }

    for (const criterion of input.acceptance_criteria) {
      const validationRows = validationRowsByAc.get(criterion.id) ?? [];
      const validationRequirementRefs = sortedUnique(
        validationRows.map(({ requirement_id: requirementId }) => requirementId),
      );
      const validationEvidenceRefs = sortedUnique(
        validationRows.flatMap(({ evidence_refs: evidenceRefs }) => evidenceRefs),
      );
      const coverageIncomplete =
        validationRows.length === 0 ||
        validationRows.some((row) => {
          const deferred =
            row.status === 'deferred' ||
            row.automation === 'manual' ||
            row.automation === 'deferred';
          if (deferred) return false;
          return (
            row.automation !== 'automated' ||
            row.status !== 'covered' ||
            row.case_ids.length === 0
          );
        });
      const boundEvidence = validationEvidenceRefs
        .map((reference) => evidenceById.get(reference))
        .filter(Boolean);
      const evidenceIncomplete =
        validationEvidenceRefs.length === 0 ||
        boundEvidence.length !== validationEvidenceRefs.length ||
        boundEvidence.some((evidence) => !evidenceIsCurrentAndPassed(evidence));
      if (coverageIncomplete || evidenceIncomplete) {
        add(
          blockers,
          D.AC_WITHOUT_PROVING_TEST,
          `convergence.acceptance_criteria.${criterion.id}`,
          `${criterion.id} requires complete covered validation rows bound to current PASSED evidence`,
        );
      }

      const criterionGraphIsReciprocal =
        criterion.requirement_refs.length > 0 &&
        criterion.task_refs.length > 0 &&
        sameStringSet(criterion.requirement_refs, validationRequirementRefs) &&
        sameStringSet(criterion.evidence_refs, validationEvidenceRefs) &&
        criterion.requirement_refs.every((reference) =>
          requirementsById.get(reference)?.acceptance_criterion_refs.includes(criterion.id),
        ) &&
        criterion.task_refs.every((reference) =>
          tasksById.get(reference)?.acceptance_criterion_refs.includes(criterion.id),
        ) &&
        criterion.evidence_refs.every((reference) =>
          evidenceById.get(reference)?.acceptance_criterion_refs.includes(criterion.id),
        );
      const mappedRowTaskIds = new Set();
      let everyRowIsProved = validationRows.length > 0;

      for (const row of validationRows) {
        const requirement = requirementsById.get(row.requirement_id);
        const rowTasks = criterion.task_refs
          .map((reference) => tasksById.get(reference))
          .filter(
            (task) =>
              task?.requirement_refs.includes(row.requirement_id) &&
              task.acceptance_criterion_refs.includes(criterion.id),
          );
        for (const task of rowTasks) mappedRowTaskIds.add(task.id);
        const rowEvidence = row.evidence_refs
          .map((reference) => evidenceById.get(reference))
          .filter(Boolean);
        const rowPaths = sortedUnique(
          rowTasks.flatMap(({ changed_path_refs: pathRefs }) => pathRefs),
        );
        const rowSymbols = sortedUnique(
          rowTasks.flatMap(({ changed_symbol_refs: symbolRefs }) => symbolRefs),
        );
        const projection = {
          requirement_refs: sortedUnique(
            rowEvidence.flatMap(({ requirement_refs: refs }) => refs),
          ),
          acceptance_criterion_refs: sortedUnique(
            rowEvidence.flatMap(({ acceptance_criterion_refs: refs }) => refs),
          ),
          task_refs: sortedUnique(rowEvidence.flatMap(({ task_refs: refs }) => refs)),
          invariant_refs: sortedUnique(
            rowEvidence.flatMap(({ invariant_refs: refs }) => refs),
          ),
          path_refs: sortedUnique(rowEvidence.flatMap(({ path_refs: refs }) => refs)),
          symbol_refs: sortedUnique(rowEvidence.flatMap(({ symbol_refs: refs }) => refs)),
          case_ids: sortedUnique(rowEvidence.flatMap(({ case_ids: refs }) => refs)),
        };
        const rowIsProved =
          rowTasks.length > 0 &&
          row.invariant_refs.length > 0 &&
          row.case_ids.length > 0 &&
          rowEvidence.length === row.evidence_refs.length &&
          rowEvidence.length > 0 &&
          rowEvidence.every(evidenceIsCurrentAndPassed) &&
          requirement?.acceptance_criterion_refs.includes(criterion.id) === true &&
          coversAll(requirement?.task_refs, rowTasks.map(({ id }) => id)) &&
          coversAll(requirement?.evidence_refs, row.evidence_refs) &&
          rowTasks.every(
            (task) =>
              coversAll(task.invariant_refs, row.invariant_refs) &&
              task.risk_refs.includes(row.risk) &&
              coversAll(task.evidence_refs, row.evidence_refs),
          ) &&
          coversAll(projection.requirement_refs, [row.requirement_id]) &&
          coversAll(projection.acceptance_criterion_refs, [criterion.id]) &&
          coversAll(projection.task_refs, rowTasks.map(({ id }) => id)) &&
          coversAll(projection.invariant_refs, row.invariant_refs) &&
          coversAll(projection.path_refs, rowPaths) &&
          coversAll(projection.symbol_refs, rowSymbols) &&
          coversAll(projection.case_ids, row.case_ids);
        everyRowIsProved &&= rowIsProved;
      }

      if (
        !criterionGraphIsReciprocal ||
        !sameStringSet(criterion.task_refs, [...mappedRowTaskIds]) ||
        !everyRowIsProved
      ) {
        add(
          blockers,
          D.UNRELATED_PASSING_TEST,
          `convergence.acceptance_criteria.${criterion.id}`,
          `PASSED evidence referenced by ${criterion.id} does not independently prove each reciprocal requirement, task, invariant, path, symbol, and case mapping`,
        );
      }
    }
  }

  const modeEvidenceRefs = activeModeEvidenceRefs(input);
  const allowedPassingEvidence = new Set([
    ...input.validation_map.flatMap(({ evidence_refs: refs }) => refs),
    ...modeEvidenceRefs,
  ]);
  for (const evidence of input.evidence) {
    const taskLinksAreReciprocal = evidence.task_refs.every((reference) =>
      tasksById.get(reference)?.evidence_refs.includes(evidence.id),
    );
    const featureLinksAreReciprocal =
      input.mode !== 'feature' ||
      (evidence.requirement_refs.every((reference) =>
        requirementsById.get(reference)?.evidence_refs.includes(evidence.id),
      ) &&
        evidence.acceptance_criterion_refs.every((reference) =>
          criteriaById.get(reference)?.evidence_refs.includes(evidence.id),
        ));
    if (
      evidenceIsCurrentAndPassed(evidence) &&
      (!allowedPassingEvidence.has(evidence.id) ||
        !taskLinksAreReciprocal ||
        !featureLinksAreReciprocal)
    ) {
      add(
        blockers,
        D.UNRELATED_PASSING_TEST,
        `convergence.evidence.${evidence.id}`,
        `${evidence.id} is current PASSED evidence but is not reciprocally bound to validation, tasks, or the active mode contract`,
      );
    }
  }

  for (const task of input.tasks) {
    const executionMapped =
      task.status === 'executed' &&
      task.planned_paths.length > 0 &&
      task.changed_path_refs.length > 0 &&
      task.evidence_refs.length > 0;
    const taskChanges = input.changes.filter((change) => change.task_refs.includes(task.id));
    const referencedPaths = sortedUnique(taskChanges.map(({ path }) => path));
    const referencedSymbols = sortedUnique(
      taskChanges.flatMap(({ symbols }) => symbols),
    );
    const exactChangeMap =
      sameStringSet(task.changed_path_refs, referencedPaths) &&
      sameStringSet(task.changed_symbol_refs, referencedSymbols);
    const evidenceLinksAreReciprocal = task.evidence_refs.every((reference) =>
      evidenceById.get(reference)?.task_refs.includes(task.id),
    );
    let featureMapIsReciprocal = true;
    if (input.mode === 'feature') {
      const associatedRows = input.validation_map.filter(
        (row) =>
          task.requirement_refs.includes(row.requirement_id) &&
          task.acceptance_criterion_refs.includes(row.acceptance_criterion_id),
      );
      const validationInvariantRefs = sortedUnique(
        associatedRows.flatMap(({ invariant_refs: refs }) => refs),
      );
      const validationRiskRefs = sortedUnique(associatedRows.map(({ risk }) => risk));
      const validationEvidenceRefs = sortedUnique(
        associatedRows.flatMap(({ evidence_refs: refs }) => refs),
      );
      featureMapIsReciprocal =
        task.requirement_refs.length > 0 &&
        task.acceptance_criterion_refs.length > 0 &&
        task.invariant_refs.length > 0 &&
        task.risk_refs.length > 0 &&
        task.requirement_refs.every((reference) =>
          requirementsById.get(reference)?.task_refs.includes(task.id),
        ) &&
        task.acceptance_criterion_refs.every((reference) =>
          criteriaById.get(reference)?.task_refs.includes(task.id),
        ) &&
        sameStringSet(task.invariant_refs, validationInvariantRefs) &&
        sameStringSet(task.risk_refs, validationRiskRefs) &&
        sameStringSet(task.evidence_refs, validationEvidenceRefs) &&
        taskChanges.every(
          (change) =>
            coversAll(change.requirement_refs, task.requirement_refs) &&
            coversAll(change.acceptance_criterion_refs, task.acceptance_criterion_refs) &&
            coversAll(change.invariant_refs, task.invariant_refs),
        );
    }
    if (
      !executionMapped ||
      taskChanges.length === 0 ||
      !exactChangeMap ||
      !evidenceLinksAreReciprocal ||
      !featureMapIsReciprocal
    ) {
      add(
        blockers,
        D.UNTRACED_TASK,
        `convergence.tasks.${task.id}`,
        `${task.id} must reciprocally link its mode-required intent, exact changed paths/symbols, validation, and evidence`,
      );
    }
  }

  const approvedPaths = new Set(input.approved_scope.paths);
  const approvedSymbols = new Set(input.approved_scope.symbols);
  for (const change of input.changes) {
    const linkedTasks = change.task_refs
      .map((reference) => tasksById.get(reference))
      .filter(Boolean);
    const expectedRequirementRefs = sortedUnique(
      linkedTasks.flatMap(({ requirement_refs: refs }) => refs),
    );
    const expectedCriterionRefs = sortedUnique(
      linkedTasks.flatMap(({ acceptance_criterion_refs: refs }) => refs),
    );
    const expectedInvariantRefs = sortedUnique(
      linkedTasks.flatMap(({ invariant_refs: refs }) => refs),
    );
    const reciprocalTaskMap =
      linkedTasks.length === change.task_refs.length &&
      linkedTasks.length > 0 &&
      linkedTasks.every(
        (task) =>
          task.changed_path_refs.includes(change.path) &&
          coversAll(task.changed_symbol_refs, change.symbols),
      ) &&
      sameStringSet(change.requirement_refs, expectedRequirementRefs) &&
      sameStringSet(change.acceptance_criterion_refs, expectedCriterionRefs) &&
      sameStringSet(change.invariant_refs, expectedInvariantRefs);
    const symbolsBelongToPath = change.symbols.every((symbol) =>
      symbol.startsWith(`${change.path}#`),
    );
    const scopeAllowed =
      approvedPaths.has(change.path) &&
      change.symbols.every((symbol) => approvedSymbols.has(symbol));
    if (!reciprocalTaskMap || !symbolsBelongToPath || !scopeAllowed) {
      add(
        blockers,
        D.CHANGE_OUTSIDE_APPROVED_INTENT,
        `convergence.changes.${change.path}`,
        `${change.path} is outside approved path/symbol intent, has a foreign symbol, or lacks reciprocal task linkage`,
      );
    }
  }

  const plannedPaths = new Set(input.tasks.flatMap(({ planned_paths: paths }) => paths));
  const changedPaths = new Set(input.changes.map(({ path }) => path));
  const missingPlanned = [...plannedPaths].filter((path) => !changedPaths.has(path));
  const unplannedChanged = [...changedPaths].filter((path) => !plannedPaths.has(path));
  const taskPathMismatch = input.tasks.some(
    (task) =>
      !sameStringSet(task.planned_paths, task.changed_path_refs) ||
      task.changed_path_refs.some((path) => !changedPaths.has(path)),
  );
  if (missingPlanned.length > 0 || unplannedChanged.length > 0 || taskPathMismatch) {
    add(
      blockers,
      D.PLANNED_OR_CHANGED_PATH_DRIFT,
      'convergence.tasks',
      `planned/changed paths diverge (missing: ${sortedUnique(missingPlanned).join(', ') || 'none'}; unplanned: ${sortedUnique(unplannedChanged).join(', ') || 'none'})`,
    );
  }
}

function evaluateArchitectureAndConventions(input, blockers) {
  const D = CONVERGENCE_DRIFT_CODES;
  const architectureRequired =
    input.artifacts.architecture?.required === true || input.architecture.required === true;
  if (
    architectureRequired &&
    (input.artifacts.architecture?.status !== 'verified' ||
      input.architecture.snapshot_status !== 'verified')
  ) {
    add(
      blockers,
      D.REQUIRED_ARCHITECTURE_MISSING,
      'convergence.architecture.snapshot_status',
      'an architecture-required change needs a verified approved architecture snapshot',
    );
  }
  if (
    input.architecture.violated_invariant_refs.length > 0 ||
    input.architecture.conformance_status === 'violated'
  ) {
    add(
      blockers,
      D.ARCHITECTURE_INVARIANT_VIOLATION,
      'convergence.architecture.violated_invariant_refs',
      `implementation violates ${sortedUnique(input.architecture.violated_invariant_refs).join(', ') || 'an architecture invariant'}`,
    );
  }
  if (input.conventions.accepted_violations.length > 0) {
    add(
      blockers,
      D.ACCEPTED_CONVENTION_VIOLATION,
      'convergence.conventions.accepted_violations',
      `accepted convention violations remain: ${sortedUnique(input.conventions.accepted_violations).join(', ')}`,
    );
  }
  const misusedObserved = input.conventions.observed_findings.filter(
    ({ blocking, repair_authorized: repairAuthorized }) =>
      blocking === true || repairAuthorized === true,
  );
  if (misusedObserved.length > 0) {
    add(
      blockers,
      D.OBSERVED_CONVENTION_USED_AS_BLOCKER,
      'convergence.conventions.observed_findings',
      `observed convention findings are advisory and cannot block or authorize repair: ${sortedUnique(misusedObserved.map(({ id }) => id)).join(', ')}`,
    );
  }
  const staleOrConflicted =
    (architectureRequired &&
      (input.architecture.evidence_status !== 'current' ||
        input.architecture.conflicted === true ||
        !['conformant', 'verified'].includes(input.architecture.conformance_status))) ||
    input.conventions.evidence_status !== 'current' ||
    input.conventions.conflicted === true;
  if (staleOrConflicted) {
    add(
      blockers,
      D.CONFORMANCE_EVIDENCE_STALE_OR_CONFLICTED,
      'convergence.architecture',
      'architecture or convention conformance evidence is stale, conflicted, or non-conformant',
    );
  }
}

function evaluateArtifactsAndFreshness(input, blockers) {
  const D = CONVERGENCE_DRIFT_CODES;
  const B = CONVERGENCE_BLOCKER_CODES;
  const artifacts = input.artifacts;
  const missingRequiredArtifacts = ['spec', 'architecture', 'plan'].filter(
    (artifact) =>
      artifacts[artifact].required === true && artifacts[artifact].status !== 'verified',
  );
  if (missingRequiredArtifacts.length > 0) {
    add(
      blockers,
      B.REQUIRED_ARTIFACT_MISSING,
      'convergence.artifacts',
      `declared required artifacts are missing, stale, or unverified: ${missingRequiredArtifacts.join(', ')}`,
    );
  }
  const artifactIdentityExpected = input.mode === 'feature';
  const allowedIdentityStatuses = artifactIdentityExpected
    ? new Set(['verified'])
    : new Set(['verified', 'not-applicable']);
  if (
    !allowedIdentityStatuses.has(artifacts.graph_status) ||
    !allowedIdentityStatuses.has(artifacts.hash_status)
  ) {
    add(
      blockers,
      D.APPROVED_ARTIFACT_GRAPH_OR_HASH_STALE,
      'convergence.artifacts',
      'approved artifact hash or parent graph is missing, stale, or mutated',
    );
  }

  const expectedModuleMap = canonicalMap(input.source.module_revision_map);
  const pinnedModuleMap = canonicalMap(input.source.pinned_module_revision_map);
  const evidenceMismatch = input.evidence.some(
    (evidence) =>
      evidence.source_revision !== input.source.revision ||
      evidence.source_fingerprint !== input.source.fingerprint ||
      evidence.portal_revision !== input.source.portal_revision ||
      canonicalMap(evidence.module_revision_map) !== expectedModuleMap,
  );
  if (expectedModuleMap !== pinnedModuleMap || evidenceMismatch) {
    add(
      blockers,
      D.MODULE_PORTAL_REVISION_MAP_MISMATCH,
      'convergence.source.module_revision_map',
      'portal/module/pinned or evidence revision provenance does not match current source',
    );
  }

  if (
    input.generated_mirrors.required === true &&
    input.generated_mirrors.status !== 'current'
  ) {
    add(
      blockers,
      D.GENERATED_MIRROR_STALE,
      'convergence.generated_mirrors.status',
      'required generated mirrors are stale or missing',
    );
  }

  if (
    (input.summary.required === true && input.summary.status !== 'current') ||
    input.summary.dependency_fingerprint_status !== 'current' ||
    input.toolchain.dependency_fingerprint_status !== 'current'
  ) {
    add(
      blockers,
      D.SUMMARY_OR_DEPENDENCY_TOOLCHAIN_FINGERPRINT_STALE,
      'convergence.summary',
      'summary or dependency/toolchain fingerprint is stale',
    );
  }

  if (
    input.toolchain.manifest_status !== 'current' ||
    input.toolchain.lockfile_status !== 'current' ||
    input.toolchain.runtime_engine_status !== 'compatible'
  ) {
    add(
      blockers,
      D.MANIFEST_LOCKFILE_RUNTIME_ENGINE_DRIFT,
      'convergence.toolchain',
      'manifest, lockfile, or runtime-engine contract has drifted',
    );
  }
}

function evaluateDelivery(input, blockers) {
  const D = CONVERGENCE_DRIFT_CODES;
  if (
    input.public_contract.changed === true &&
    !MIGRATION_DECISIONS.has(input.public_contract.migration_decision_status)
  ) {
    add(
      blockers,
      D.PUBLIC_CONTRACT_MIGRATION_DECISION_MISSING,
      'convergence.public_contract.migration_decision_status',
      'a public contract change requires an approved migration, deprecation, or compatibility decision',
    );
  }

  for (const [ledger, state] of Object.entries(input.ledgers)) {
    if (state?.required === true && state.status !== 'current') {
      add(
        blockers,
        D.REQUIRED_LEDGER_MISSING,
        `convergence.ledgers.${ledger}`,
        `required ${ledger} ledger is missing or stale`,
      );
    }
  }

  const lifecycle = input.lifecycle;
  if (
    lifecycle.verification_revision !== input.source.revision ||
    (lifecycle.branch_ready_revision !== null &&
      lifecycle.branch_ready_revision !== input.source.revision) ||
    lifecycle.writes_after_verification.length > 0 ||
    lifecycle.writes_after_branch_ready.length > 0
  ) {
    add(
      blockers,
      D.POST_VERIFICATION_WRITE,
      'convergence.lifecycle',
      'verification or branch-ready evidence is stale, or a write occurred after verification',
    );
  }

  if (
    lifecycle.artifact_closure_status !== 'complete' ||
    lifecycle.artifact_thread_id !== input.thread.owner_thread_id ||
    input.thread.thread_id !== input.thread.owner_thread_id
  ) {
    add(
      blockers,
      D.ARTIFACT_CLOSURE_OR_THREAD_OWNERSHIP_INVALID,
      'convergence.lifecycle.artifact_closure_status',
      'artifact closure is incomplete or includes artifacts owned by another thread',
    );
  }
}

function evaluateManualOrDeferred(input, blockers) {
  const rows = input.validation_map.filter(
    ({ automation, status }) =>
      ['manual', 'deferred'].includes(automation) || status === 'deferred',
  );
  if (rows.length > 0) {
    add(
      blockers,
      CONVERGENCE_BLOCKER_CODES.MANUAL_OR_DEFERRED_EVIDENCE,
      'convergence.validation_map',
      `manual or deferred validation remains pending acknowledgement for ${sortedUnique(rows.map(({ acceptance_criterion_id: id }) => id)).join(', ')}`,
    );
  }
}

/**
 * Evaluate the full mode-specific chain. The returned projection is compact:
 * it contains identities, status, freshness, blockers, evidence ids, and
 * counts, but never echoes artifacts, file contents, or raw evidence.
 */
export function evaluateConvergence(input) {
  const validation = validateConvergenceInput(input);
  if (!validation.valid) {
    const blockers = validation.errors.map(({ path, message }) =>
      issue(CONVERGENCE_BLOCKER_CODES.INPUT_INVALID, path, message),
    );
    return compactResult(input, blockers, { validationErrors: true });
  }

  const blockers = [];
  evaluateMode(input, blockers);
  evaluateTraceability(input, blockers);
  evaluateArchitectureAndConventions(input, blockers);
  evaluateArtifactsAndFreshness(input, blockers);
  evaluateDelivery(input, blockers);
  evaluateManualOrDeferred(input, blockers);
  return compactResult(input, blockers);
}

/**
 * Validate a compact convergence result at a later workflow boundary.
 * Consumers supply current source/thread identity; the prior result never
 * decides its own freshness.
 */
export function evaluateConvergenceHandoff(input = {}) {
  const normalized = isObject(input) ? input : {};
  const { result, current, receipt } = normalized;
  const blockers = [];
  const B = CONVERGENCE_BLOCKER_CODES;
  if (!isObject(result)) {
    blockers.push(issue(B.CONVERGENCE_RESULT_MISSING, 'convergence_result', 'a compact convergence result is required'));
  } else {
    if (
      result.schema_version !== CONVERGENCE_SCHEMA_VERSION ||
      !isText(result.change_ref) ||
      !CONVERGENCE_MODES.includes(result.mode) ||
      !Array.isArray(result.blocker_codes) ||
      !Array.isArray(result.blockers) ||
      !Array.isArray(result.evidence_refs) ||
      !isObject(result.summary) ||
      !isObject(result.provenance)
    ) {
      blockers.push(issue(B.CONVERGENCE_RESULT_INVALID, 'convergence_result', 'must be a complete compact schema-v1 evaluator result'));
    }
    if (result.status !== 'CONVERGED') {
      blockers.push(issue(B.CONVERGENCE_RESULT_NOT_CONVERGED, 'convergence_result.status', `is ${String(result.status ?? 'missing')}, not CONVERGED`));
    }
    if (result.fresh !== true) {
      blockers.push(issue(B.CONVERGENCE_RESULT_STALE, 'convergence_result.fresh', 'must be explicitly true'));
    }
    if (
      (Array.isArray(result.blocker_codes) && result.blocker_codes.length > 0) ||
      (Array.isArray(result.blockers) && result.blockers.length > 0)
    ) {
      blockers.push(issue(B.CONVERGENCE_RESULT_INVALID, 'convergence_result.blockers', 'a CONVERGED result cannot preserve blocker codes or blocker records'));
    }
    const counts = ['requirements', 'acceptance_criteria', 'tasks', 'changed_paths', 'evidence'];
    if (isObject(result.summary) && counts.some((field) => !Number.isInteger(result.summary[field]) || result.summary[field] < 0)) {
      blockers.push(issue(B.CONVERGENCE_RESULT_INVALID, 'convergence_result.summary', 'must preserve non-negative evaluator counts'));
    }
    if (Array.isArray(result.evidence_refs) && result.evidence_refs.some((id) => !ID_PATTERNS.evidence.test(id))) {
      blockers.push(issue(B.CONVERGENCE_RESULT_INVALID, 'convergence_result.evidence_refs', 'must preserve canonical EVIDENCE identities'));
    }
    const projection = isObject(result) ? structuredClone(result) : null;
    if (projection) delete projection.provenance;
    if (
      result.provenance?.evaluator !== CONVERGENCE_EVALUATOR_ID ||
      !RECEIPT_HASH.test(result.provenance?.input_hash ?? '') ||
      !RECEIPT_HASH.test(result.provenance?.projection_hash ?? '') ||
      result.provenance?.projection_hash !== receiptHash(projection)
    ) {
      blockers.push(issue(B.CONVERGENCE_RESULT_INVALID, 'convergence_result.provenance', 'must be a hash-verified canonical evaluator receipt'));
    }
    const requiredNonemptyCounts = result.mode === 'feature'
      ? counts
      : ['tasks', 'changed_paths', 'evidence'];
    if (
      isObject(result.summary) &&
      requiredNonemptyCounts.some((field) => result.summary[field] < 1)
    ) {
      blockers.push(issue(
        B.CONVERGENCE_RESULT_INVALID,
        'convergence_result.summary',
        result.mode === 'feature'
          ? 'feature convergence requires non-empty requirements, acceptance criteria, tasks, changes, and evidence'
          : `${result.mode} convergence requires non-empty tasks, changes, and evidence`,
      ));
    }
    if (
      Array.isArray(result.evidence_refs) &&
      (new Set(result.evidence_refs).size !== result.evidence_refs.length || result.evidence_refs.length !== result.summary?.evidence)
    ) {
      blockers.push(issue(B.CONVERGENCE_RESULT_INVALID, 'convergence_result.evidence_refs', 'must exactly account for the compact evidence count'));
    }
  }
  verifyConvergenceReceipt(receipt, result, blockers);

  const source = result?.source_identity;
  const identities = [
    ['repository_id', isText],
    ['revision', (value) => REVISION.test(value ?? '')],
    ['fingerprint', (value) => FINGERPRINT.test(value ?? '')],
    ['portal_revision', (value) => REVISION.test(value ?? '')],
    ['module_revision_map', isObject],
    ['pinned_module_revision_map', isObject],
    ['owner_thread_id', isText],
  ];
  if (!isObject(source) || !isObject(current)) {
    blockers.push(issue(B.CONVERGENCE_RESULT_INVALID, 'convergence_result.source_identity', 'result and current source identities are required'));
  } else {
    const malformed = identities.some(([field, validate]) =>
      !validate(source[field]) || !validate(current[field]));
    const invalidMaps = [
      source.module_revision_map,
      source.pinned_module_revision_map,
      current.module_revision_map,
      current.pinned_module_revision_map,
    ].some((map) => !isObject(map) || Object.entries(map).some(([id, revision]) => !isText(id) || !REVISION.test(revision ?? '')));
    if (malformed || invalidMaps) {
      blockers.push(issue(B.CONVERGENCE_RESULT_INVALID, 'convergence_result.source_identity', 'must preserve complete repository, revision, fingerprint, module-map, and owner-thread identity'));
    } else if (
      source.repository_id !== current.repository_id ||
      source.revision !== current.revision ||
      source.fingerprint !== current.fingerprint ||
      source.portal_revision !== current.portal_revision ||
      source.owner_thread_id !== current.owner_thread_id ||
      canonicalMap(source.module_revision_map) !== canonicalMap(current.module_revision_map) ||
      canonicalMap(source.pinned_module_revision_map) !== canonicalMap(current.pinned_module_revision_map)
    ) {
      blockers.push(issue(B.CONVERGENCE_SOURCE_MISMATCH, 'convergence_result.source_identity', 'does not match current source, module, pin, or owner-thread identity'));
    }
  }
  if (!isObject(current) || !isText(current.change_ref) || !CONVERGENCE_MODES.includes(current.mode)) {
    blockers.push(issue(B.CONVERGENCE_RESULT_INVALID, 'convergence_current', 'must bind the approved change_ref and convergence mode'));
  } else if (result?.change_ref !== current.change_ref || result?.mode !== current.mode) {
    blockers.push(issue(B.CONVERGENCE_SOURCE_MISMATCH, 'convergence_result.change_ref', 'does not match the approved current change or mode'));
  }
  const resolved = sortIssues(blockers);
  return {
    valid: resolved.length === 0,
    status: resolved.length === 0 ? 'ACCEPTED' : 'BLOCKED',
    blocker_codes: sortedUnique(resolved.map(({ code }) => code)),
    blockers: resolved,
  };
}

/** Return a fresh converged projection or throw with deterministic blockers. */
export function assertConvergence(input) {
  const result = evaluateConvergence(input);
  if (result.status !== 'CONVERGED' || result.fresh !== true) {
    const details = result.blockers
      .map(({ code, path, message }) => `${code} ${path}: ${message}`)
      .join('\n');
    throw new Error(`convergence is ${result.status}${result.fresh ? '' : ' and stale'}:\n${details}`);
  }
  return result;
}
