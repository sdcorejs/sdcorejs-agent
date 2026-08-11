import { createApprovedArtifact, verifyApprovedArtifact } from './approved-artifact.mjs';

export const DECISION_COVERAGE_SCHEMA_VERSION = 1;
export const GOAL_BACKWARD_SCHEMA_VERSION = 1;
export const GOAL_BACKWARD_CHECKER_VERSION = 'sdcorejs-plan:goal-backward:v1';

export const DECISION_RECORD_TYPES = Object.freeze({
  requirement: Object.freeze({ prefix: 'R', order: 0 }),
  'acceptance-criterion': Object.freeze({ prefix: 'AC', order: 1 }),
  assumption: Object.freeze({ prefix: 'A', order: 2 }),
  decision: Object.freeze({ prefix: 'D', order: 3 }),
  invariant: Object.freeze({ prefix: 'INV', order: 4 }),
});

const TYPE_BY_PREFIX = new Map(
  Object.entries(DECISION_RECORD_TYPES).map(([type, { prefix }]) => [prefix, type]),
);
const REQUIREMENT_SOURCES = new Set([
  'explicit-user',
  'approved-artifact',
  'authoritative-contract',
]);
const REQUIREMENT_STATUSES = new Set(['active', 'superseded', 'deferred']);
const ACCEPTANCE_VERIFICATION_KINDS = new Set(['automated', 'manual', 'deferred']);
const ASSUMPTION_SOURCES = new Set(['inferred', 'defaulted', 'explicit']);
const ASSUMPTION_CONFIDENCES = new Set(['high', 'medium', 'low', 'unknown']);
const ASSUMPTION_STATUSES = new Set([
  'proposed',
  'confirmed',
  'validated',
  'invalidated',
  'deferred',
]);
const DECISION_SOURCES = new Set([
  'explicit-user',
  'approved-spec',
  'approved-architecture',
  'approved-plan',
  'authoritative-config',
]);
const DECISION_STATUSES = new Set(['proposed', 'approved', 'superseded', 'deferred']);
const DECISION_SCOPES = new Set([
  'repository',
  'module',
  'portal-composition',
  'public-contract',
]);
const MODES = new Set(['planning', 'execution']);
const VALIDATION_STAGES = new Set(['discovery', 'spec', 'plan', 'execution']);
const UPSTREAM_STAGES = new Set(['discovery', 'spec']);
const TYPED_REFERENCE_FIELDS = Object.freeze({
  requirement_refs: 'requirement',
  acceptance_criterion_refs: 'acceptance-criterion',
  assumption_refs: 'assumption',
  decision_refs: 'decision',
  invariant_refs: 'invariant',
});
const RECORD_REFERENCE_FIELDS = new Set([
  ...Object.keys(TYPED_REFERENCE_FIELDS),
  'downstream_refs',
  'impacted_refs',
  'protected_refs',
]);
const EXTERNAL_REFERENCE_FIELDS = new Set(['task_refs', 'evidence_refs']);
const DECISION_COVERAGE_APPROVAL_CONTRACT = 'decision-coverage:v1';

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return typeof value === 'string' ? value.replace(/\r\n?/gu, '\n').normalize('NFC') : value;
}

function decisionCoverageApprovalBody(input) {
  return `${JSON.stringify(canonicalize({
    schema_version: input?.schema_version,
    revision: input?.revision,
    records: input?.records,
    history: input?.history,
  }))}\n`;
}

export function approveDecisionCoverage(coverage, {
  approved_by: approvedBy = 'decision-coverage-owner',
  source_revision: sourceRevision = 'a'.repeat(40),
  owner_repository_id: ownerRepositoryId = 'repository-under-test',
  repository_relative_path: repositoryRelativePath = '.sdcorejs/plans/decision-coverage.md',
  change_ref: changeRef = 'decision-coverage-change',
} = {}) {
  const approvedArtifact = createApprovedArtifact({
    metadata: {
      schema_version: 1,
      artifact_id: `decision-coverage-r${String(coverage?.revision ?? 'unknown')}`,
      artifact_kind: 'plan',
      contract_id: DECISION_COVERAGE_APPROVAL_CONTRACT,
      requirement_id: 'decision-coverage',
      change_ref: changeRef,
      track: 'workflow',
      stack_profile: 'markdown-skill-pack',
      owner_repository_id: ownerRepositoryId,
      owner_repository_role: 'standalone',
      owner_module_id: null,
      parent_repository_id: null,
      parent_references: [],
      approval_source: 'user-approved-decision-coverage',
      approved_by: approvedBy,
      approved_at: '2026-08-09T00:00:00.000Z',
      repository_relative_path: repositoryRelativePath,
      source_revision: sourceRevision,
      allowed_paths: ['**'],
      prohibited_paths: [],
      supersedes: null,
    },
    body: decisionCoverageApprovalBody(coverage),
  });
  return { ...structuredClone(coverage), approved_artifact: approvedArtifact };
}

export function verifyDecisionCoverageApproval(input) {
  try {
    const verified = verifyApprovedArtifact(input?.approved_artifact);
    const metadata = verified.metadata;
    if (
      metadata.artifact_kind !== 'plan' ||
      metadata.contract_id !== DECISION_COVERAGE_APPROVAL_CONTRACT ||
      metadata.approval_source !== 'user-approved-decision-coverage' ||
      !isNonEmptyString(metadata.approved_by) ||
      input.approved_artifact.body !== decisionCoverageApprovalBody(input)
    ) {
      throw new Error('decision coverage does not match its approved artifact body and approval metadata');
    }
    return { valid: true, approval_hash: metadata.approval_hash, metadata, errors: [] };
  } catch (error) {
    return { valid: false, approval_hash: null, metadata: null, errors: [error?.message ?? String(error)] };
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isExplicitNullableString(record, field) {
  return Object.hasOwn(record, field) &&
    (record[field] === null || isNonEmptyString(record[field]));
}

function sanitizedStringArray(value) {
  return Array.isArray(value) ? value.filter(isNonEmptyString) : [];
}

function normalizeRepositoryRelativePath(value) {
  if (!isNonEmptyString(value) || value !== value.trim()) return null;
  if (
    value.includes('\\') ||
    value.includes('\0') ||
    value.startsWith('/') ||
    /^[A-Za-z]:/u.test(value)
  ) {
    return null;
  }
  const segments = value.split('/');
  if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
    return null;
  }
  return segments.join('/');
}

function sanitizedRepositoryPathArray(value) {
  return Array.isArray(value)
    ? value.map(normalizeRepositoryRelativePath).filter((path) => path !== null)
    : [];
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function recordTypeForId(id) {
  if (typeof id !== 'string') return null;
  const match = /^(R|AC|A|D|INV)-(\d{3})$/u.exec(id);
  if (!match || Number(match[2]) === 0) return null;
  return TYPE_BY_PREFIX.get(match[1]) ?? null;
}

function normalizationCandidate(id) {
  if (typeof id !== 'string') return null;
  const match = /^(R|AC|A|D|INV)-?0*(\d+)$/iu.exec(id.trim());
  if (!match) return null;
  const number = Number(match[2]);
  if (!Number.isSafeInteger(number) || number < 1 || number > 999) return null;
  return `${match[1].toUpperCase()}-${String(number).padStart(3, '0')}`;
}

function recordSortKey(record) {
  const typeOrder = DECISION_RECORD_TYPES[record?.type]?.order ?? 99;
  const candidate = normalizationCandidate(record?.id);
  const number = candidate ? Number(candidate.split('-').at(-1)) : 9999;
  return [typeOrder, number, String(record?.id ?? '')];
}

function compareRecordIdentity(left, right) {
  const leftKey = recordSortKey(left);
  const rightKey = recordSortKey(right);
  for (let index = 0; index < leftKey.length; index += 1) {
    const compared =
      typeof leftKey[index] === 'number'
        ? leftKey[index] - rightKey[index]
        : compareText(leftKey[index], rightKey[index]);
    if (compared !== 0) return compared;
  }
  return 0;
}

function isDeterministicallyOrdered(items) {
  return items.every(
    (item, index) => index === 0 || compareRecordIdentity(items[index - 1], item) <= 0,
  );
}

function issue(code, path, message, recordId) {
  return {
    code,
    path,
    ...(recordId ? { record_id: recordId } : {}),
    message,
  };
}

function issueText(value) {
  return `[${value.code}] ${value.path}: ${value.message}`;
}

function finalizeIssues(values) {
  const unique = new Map();
  for (const value of values) unique.set(issueText(value), value);
  return [...unique.entries()]
    .sort(([left], [right]) => compareText(left, right))
    .map(([, value]) => value);
}

function validateReferenceArray({
  record,
  field,
  expectedType,
  recordById,
  errors,
}) {
  const value = record[field];
  if (value === undefined) return;
  const path = `records.${record.id}.${field}`;
  if (!Array.isArray(value)) {
    errors.push(issue('REFERENCE_COLLECTION_INVALID', path, 'must be an array', record.id));
    return;
  }
  const seen = new Set();
  for (const reference of value) {
    if (!isNonEmptyString(reference)) {
      errors.push(
        issue('REFERENCE_INVALID', path, 'contains an empty or non-string reference', record.id),
      );
      continue;
    }
    if (seen.has(reference)) {
      errors.push(
        issue('REFERENCE_DUPLICATE', path, `duplicates reference ${reference}`, record.id),
      );
      continue;
    }
    seen.add(reference);
    if (EXTERNAL_REFERENCE_FIELDS.has(field)) continue;
    const target = recordById.get(reference);
    if (!target) {
      errors.push(
        issue('REFERENCE_DANGLING', path, `references unavailable record ${reference}`, record.id),
      );
      continue;
    }
    if (expectedType && target.type !== expectedType) {
      errors.push(
        issue(
          'REFERENCE_WRONG_TYPE',
          path,
          `expects ${expectedType} but ${reference} is ${target.type}`,
          record.id,
        ),
      );
    }
  }
}

function validateRecordSemantics(record, errors, blockers, futureGaps, validationStage) {
  const path = `records.${record.id}`;
  const requireNonEmptyArray = (field, code, message, futureAtUpstream = false) => {
    if (!Array.isArray(record[field]) || record[field].length === 0) {
      const target = futureAtUpstream && UPSTREAM_STAGES.has(validationStage)
        ? futureGaps
        : errors;
      target.push(issue(code, `${path}.${field}`, message, record.id));
    }
  };

  if (record.type === 'requirement') {
    if (!REQUIREMENT_SOURCES.has(record.source)) {
      errors.push(issue('REQUIREMENT_SOURCE_INVALID', `${path}.source`, 'must be explicit-user, approved-artifact, or authoritative-contract', record.id));
    }
    if (!REQUIREMENT_STATUSES.has(record.status)) {
      errors.push(issue('REQUIREMENT_STATUS_INVALID', `${path}.status`, 'must be active, superseded, or deferred', record.id));
    }
    if (!isNonEmptyString(record.owner_repository_id)) {
      errors.push(issue('REQUIREMENT_OWNER_REPOSITORY_INVALID', `${path}.owner_repository_id`, 'must be a non-empty repository identity', record.id));
    }
    if (!isExplicitNullableString(record, 'owner_module_id')) {
      errors.push(issue('REQUIREMENT_OWNER_MODULE_INVALID', `${path}.owner_module_id`, 'must be explicitly null or a non-empty module identity', record.id));
    }
    requireNonEmptyArray(
      'task_refs',
      'REQUIREMENT_PLAN_COVERAGE_MISSING',
      'a requirement must map to at least one planned task',
      true,
    );
  }
  if (record.type === 'acceptance-criterion') {
    if (!isNonEmptyString(record.behavior)) {
      errors.push(issue('AC_BEHAVIOR_MISSING', `${path}.behavior`, 'must describe observable behavior', record.id));
    }
    if (!isNonEmptyString(record.expected_result)) {
      errors.push(issue('AC_EXPECTED_RESULT_MISSING', `${path}.expected_result`, 'must describe a testable result', record.id));
    }
    if (!ACCEPTANCE_VERIFICATION_KINDS.has(record.verification_kind)) {
      errors.push(issue('AC_VERIFICATION_KIND_INVALID', `${path}.verification_kind`, 'must be automated, manual, or deferred', record.id));
    }
    if (record.blocking !== true) {
      errors.push(issue('AC_BLOCKING_INVALID', `${path}.blocking`, 'must be explicitly true', record.id));
    }
    requireNonEmptyArray(
      'requirement_refs',
      'AC_REQUIREMENT_COVERAGE_MISSING',
      'an acceptance criterion must reference at least one requirement',
    );
    requireNonEmptyArray(
      'task_refs',
      'AC_PLAN_COVERAGE_MISSING',
      'an acceptance criterion must map to at least one planned task',
      true,
    );
  }
  if (record.type === 'decision') {
    if (!isNonEmptyString(record.question)) {
      errors.push(issue('DECISION_QUESTION_MISSING', `${path}.question`, 'must state the decision question', record.id));
    }
    if (!isNonEmptyString(record.selected_value)) {
      errors.push(issue('DECISION_SELECTED_VALUE_MISSING', `${path}.selected_value`, 'must state the selected value', record.id));
    }
    if (!DECISION_SOURCES.has(record.source)) {
      errors.push(issue('DECISION_SOURCE_INVALID', `${path}.source`, 'must be an approved canonical decision source', record.id));
    }
    if (!DECISION_STATUSES.has(record.status)) {
      errors.push(issue('DECISION_STATUS_INVALID', `${path}.status`, 'must be proposed, approved, superseded, or deferred', record.id));
    }
    if (typeof record.blocking !== 'boolean') {
      errors.push(issue('DECISION_BLOCKING_INVALID', `${path}.blocking`, 'must be a boolean', record.id));
    }
    if (!DECISION_SCOPES.has(record.scope)) {
      errors.push(issue('DECISION_SCOPE_INVALID', `${path}.scope`, 'must be repository, module, portal-composition, or public-contract', record.id));
    }
    if (!isNonEmptyString(record.owner_repository_id)) {
      errors.push(issue('DECISION_OWNER_REPOSITORY_INVALID', `${path}.owner_repository_id`, 'must be a non-empty repository identity', record.id));
    }
    if (!isNonEmptyString(record.rationale)) {
      errors.push(issue('DECISION_RATIONALE_MISSING', `${path}.rationale`, 'must explain the selected value', record.id));
    }
    if (
      !Object.hasOwn(record, 'supersedes') ||
      (record.supersedes !== null && recordTypeForId(record.supersedes) !== 'decision')
    ) {
      errors.push(issue('DECISION_SUPERSEDES_INVALID', `${path}.supersedes`, 'must be explicitly null or a canonical D-* identity', record.id));
    }
    const impact = record.convention_impact;
    if (
      !isObject(impact) ||
      typeof impact.candidate !== 'boolean' ||
      !Object.hasOwn(impact, 'category') ||
      (impact.category !== null && !isNonEmptyString(impact.category)) ||
      (impact.candidate === true && !isNonEmptyString(impact.category)) ||
      (impact.candidate === false && impact.category !== null)
    ) {
      errors.push(issue('DECISION_CONVENTION_IMPACT_INVALID', `${path}.convention_impact`, 'must bind candidate to a non-empty category, or false to null', record.id));
    }
    if (record.blocking === true && record.status !== 'approved') {
      blockers.push(issue('DECISION_BLOCKING_UNRESOLVED', path, 'a blocking decision must be approved before the gate can pass', record.id));
    }
    if (
      record.status === 'deferred' &&
      record.blocking === false &&
      !isNonEmptyString(record.revisit_condition)
    ) {
      errors.push(issue('DECISION_DEFERRED_INCOMPLETE', path, 'a deferred non-blocking decision requires a revisit_condition', record.id));
    }
    requireNonEmptyArray(
      'downstream_refs',
      'DECISION_DOWNSTREAM_EFFECT_MISSING',
      'a decision must identify at least one downstream record',
    );
    if (
      Array.isArray(record.downstream_refs) &&
      record.downstream_refs.includes(record.id)
    ) {
      errors.push(
        issue(
          'DECISION_DOWNSTREAM_SELF_REFERENCE',
          `${path}.downstream_refs`,
          'a decision cannot count itself as a downstream effect',
          record.id,
        ),
      );
    }
  }
  if (record.type === 'invariant') {
    requireNonEmptyArray(
      'protected_refs',
      'INVARIANT_PROTECTED_REFS_MISSING',
      'an invariant must identify the records it protects',
    );
    requireNonEmptyArray(
      'task_refs',
      'INVARIANT_TASK_TRACE_MISSING',
      'an invariant must trace to at least one enforcing task',
      true,
    );
    requireNonEmptyArray(
      'evidence_refs',
      'INVARIANT_EVIDENCE_TRACE_MISSING',
      'an invariant must trace to at least one evidence reference',
      true,
    );
  }
  if (record.type === 'assumption') {
    if (!ASSUMPTION_SOURCES.has(record.source)) {
      errors.push(issue('ASSUMPTION_SOURCE_INVALID', `${path}.source`, 'must be inferred, defaulted, or explicit', record.id));
    }
    if (!ASSUMPTION_CONFIDENCES.has(record.confidence)) {
      errors.push(issue('ASSUMPTION_CONFIDENCE_INVALID', `${path}.confidence`, 'must be high, medium, low, or unknown', record.id));
    }
    if (!ASSUMPTION_STATUSES.has(record.status)) {
      errors.push(
        issue(
          'ASSUMPTION_STATUS_INVALID',
          `${path}.status`,
          'must be proposed, confirmed, validated, invalidated, or deferred',
          record.id,
        ),
      );
    }
    if (typeof record.blocking !== 'boolean') {
      errors.push(
        issue(
          'ASSUMPTION_BLOCKING_INVALID',
          `${path}.blocking`,
          'must be a boolean',
          record.id,
        ),
      );
    }
    if (!Array.isArray(record.evidence_refs)) {
      errors.push(issue('ASSUMPTION_EVIDENCE_INVALID', `${path}.evidence_refs`, 'must be an explicit array', record.id));
    }
    if (!isNonEmptyString(record.consequence_if_wrong)) {
      errors.push(issue('ASSUMPTION_CONSEQUENCE_MISSING', `${path}.consequence_if_wrong`, 'must describe the impact if false', record.id));
    }
    if (!isNonEmptyString(record.validation_method)) {
      errors.push(issue('ASSUMPTION_VALIDATION_METHOD_MISSING', `${path}.validation_method`, 'must describe how the assumption is validated', record.id));
    }
    if (!isNonEmptyString(record.owner)) {
      errors.push(issue('ASSUMPTION_OWNER_MISSING', `${path}.owner`, 'must identify the validation owner', record.id));
    }
    if (
      record.status === 'deferred' &&
      (!isNonEmptyString(record.owner) ||
        !isNonEmptyString(record.rationale) ||
        !isNonEmptyString(record.revisit_condition) ||
        !Array.isArray(record.impacted_refs) ||
        record.impacted_refs.length === 0)
    ) {
      errors.push(
        issue(
          'ASSUMPTION_DEFERRED_INCOMPLETE',
          path,
          'a deferred assumption requires owner, rationale, revisit_condition, and impacted_refs',
          record.id,
        ),
      );
    }
    if (record.blocking === true && !['confirmed', 'validated'].includes(record.status)) {
      blockers.push(
        issue(
          'ASSUMPTION_BLOCKING_UNRESOLVED',
          path,
          'execution cannot proceed on an unresolved blocking assumption',
          record.id,
        ),
      );
    }
  }
}

function validateHistory(coverage, currentRecords, errors) {
  const history = coverage.history;
  if (!Array.isArray(history) || history.length === 0) {
    errors.push(issue('HISTORY_MISSING', 'history', 'must contain revision snapshots'));
    return;
  }
  if (!Number.isInteger(coverage.revision) || coverage.revision < 1) {
    errors.push(issue('REVISION_INVALID', 'revision', 'must be a positive integer'));
  }
  if (coverage.revision !== history.length) {
    errors.push(
      issue(
        'HISTORY_REVISION_GAP',
        'history',
        `expected ${coverage.revision} contiguous snapshots but received ${history.length}`,
      ),
    );
  }

  const knownTypes = new Map();
  let previousActive = new Map();
  let previousTombstones = new Map();
  let latestActive = new Map();
  let latestTombstones = new Map();

  history.forEach((snapshot, snapshotIndex) => {
    const path = `history.revision-${snapshotIndex + 1}`;
    const expectedRevision = snapshotIndex + 1;
    if (!isObject(snapshot) || snapshot.revision !== expectedRevision) {
      errors.push(
        issue(
          'HISTORY_REVISION_GAP',
          path,
          `snapshot revision must be ${expectedRevision}`,
        ),
      );
    }
    const activeRecords = Array.isArray(snapshot?.active) ? snapshot.active : [];
    const tombstones = Array.isArray(snapshot?.tombstones) ? snapshot.tombstones : [];
    if (!Array.isArray(snapshot?.active)) {
      errors.push(issue('HISTORY_ACTIVE_INVALID', `${path}.active`, 'must be an array'));
    }
    if (!Array.isArray(snapshot?.tombstones)) {
      errors.push(issue('HISTORY_TOMBSTONES_INVALID', `${path}.tombstones`, 'must be an array'));
    }
    if (!isDeterministicallyOrdered(activeRecords)) {
      errors.push(
        issue('ORDER_NONDETERMINISTIC', `${path}.active`, 'must use canonical record order'),
      );
    }

    const active = new Map();
    for (const identity of activeRecords) {
      if (!isObject(identity) || !isNonEmptyString(identity.id)) {
        errors.push(issue('HISTORY_IDENTITY_INVALID', `${path}.active`, 'contains an invalid identity'));
        continue;
      }
      if (active.has(identity.id)) {
        errors.push(
          issue('HISTORY_ID_DUPLICATE', `${path}.active`, `duplicates ${identity.id}`, identity.id),
        );
      }
      active.set(identity.id, identity);
      const identityType = recordTypeForId(identity.id);
      if (!identityType) {
        errors.push(
          issue(
            'HISTORY_ID_MALFORMED',
            `${path}.active.${identity.id}`,
            'must retain an exact canonical record ID',
            identity.id,
          ),
        );
      } else if (identityType !== identity.type) {
        errors.push(
          issue(
            'HISTORY_ID_TYPE_MISMATCH',
            `${path}.active.${identity.id}`,
            `${identity.id} belongs to ${identityType}, not ${identity.type}`,
            identity.id,
          ),
        );
      }
      const priorType = knownTypes.get(identity.id);
      if (priorType && priorType !== identity.type) {
        errors.push(
          issue(
            'HISTORY_TYPE_CHANGED',
            `${path}.active`,
            `${identity.id} changed from ${priorType} to ${identity.type}`,
            identity.id,
          ),
        );
      }
      knownTypes.set(identity.id, priorType ?? identity.type);
    }

    const retired = new Map();
    for (const tombstone of tombstones) {
      if (!isObject(tombstone) || !isNonEmptyString(tombstone.id)) {
        errors.push(
          issue('HISTORY_TOMBSTONE_INVALID', `${path}.tombstones`, 'contains an invalid tombstone'),
        );
        continue;
      }
      if (retired.has(tombstone.id)) {
        errors.push(
          issue(
            'HISTORY_ID_DUPLICATE',
            `${path}.tombstones`,
            `duplicates ${tombstone.id}`,
            tombstone.id,
          ),
        );
      }
      retired.set(tombstone.id, tombstone);
      const tombstoneType = recordTypeForId(tombstone.id);
      if (!tombstoneType) {
        errors.push(
          issue(
            'HISTORY_ID_MALFORMED',
            `${path}.tombstones.${tombstone.id}`,
            'must retain an exact canonical record ID',
            tombstone.id,
          ),
        );
      } else if (tombstoneType !== tombstone.type) {
        errors.push(
          issue(
            'HISTORY_ID_TYPE_MISMATCH',
            `${path}.tombstones.${tombstone.id}`,
            `${tombstone.id} belongs to ${tombstoneType}, not ${tombstone.type}`,
            tombstone.id,
          ),
        );
      }
      if (
        !Number.isInteger(tombstone.retired_revision) ||
        tombstone.retired_revision < 1 ||
        tombstone.retired_revision > expectedRevision ||
        !isNonEmptyString(tombstone.reason)
      ) {
        errors.push(
          issue(
            'HISTORY_TOMBSTONE_INVALID',
            `${path}.tombstones.${tombstone.id}`,
            'requires a retained type, retired_revision, and reason',
            tombstone.id,
          ),
        );
      }
      const priorType = knownTypes.get(tombstone.id);
      if (priorType && priorType !== tombstone.type) {
        errors.push(
          issue(
            'HISTORY_TYPE_CHANGED',
            `${path}.tombstones.${tombstone.id}`,
            `${tombstone.id} changed from ${priorType} to ${tombstone.type}`,
            tombstone.id,
          ),
        );
      }
      knownTypes.set(tombstone.id, priorType ?? tombstone.type);
      if (active.has(tombstone.id)) {
        errors.push(
          issue(
            'HISTORY_TOMBSTONE_REUSED',
            path,
            `${tombstone.id} is both active and tombstoned`,
            tombstone.id,
          ),
        );
      }
    }

    if (snapshotIndex > 0) {
      for (const [id, identity] of previousActive) {
        if (!active.has(id) && !retired.has(id)) {
          errors.push(
            issue(
              'HISTORY_TOMBSTONE_MISSING',
              path,
              `${id} was removed without a tombstone`,
              id,
            ),
          );
        }
        if (retired.has(id) && retired.get(id).type !== identity.type) {
          errors.push(
            issue(
              'HISTORY_TYPE_CHANGED',
              `${path}.tombstones.${id}`,
              `${id} changed type when retired`,
              id,
            ),
          );
        }
      }
    }
    for (const [id, tombstone] of retired) {
      if (previousTombstones.has(id)) continue;
      if (!previousActive.has(id)) {
        errors.push(
          issue(
            'HISTORY_TOMBSTONE_WITHOUT_ACTIVE_PREDECESSOR',
            `${path}.tombstones.${id}`,
            `${id} was not active in the immediately preceding revision`,
            id,
          ),
        );
      }
      if (tombstone.retired_revision !== expectedRevision) {
        errors.push(
          issue(
            'HISTORY_TOMBSTONE_REVISION_MISMATCH',
            `${path}.tombstones.${id}`,
            `${id} first appears retired in revision ${expectedRevision}`,
            id,
          ),
        );
      }
    }
    if (snapshotIndex > 0) {
      for (const [id, priorTombstone] of previousTombstones) {
        if (active.has(id)) {
          errors.push(
            issue(
              'HISTORY_TOMBSTONE_REUSED',
              path,
              `${id} was reused after retirement`,
              id,
            ),
          );
        } else if (!retired.has(id)) {
          errors.push(
            issue(
              'HISTORY_TOMBSTONE_CONTINUITY_MISSING',
              path,
              `${id} tombstone was not retained`,
              id,
            ),
          );
        } else if (
          retired.get(id).type !== priorTombstone.type ||
          retired.get(id).retired_revision !== priorTombstone.retired_revision ||
          retired.get(id).reason !== priorTombstone.reason
        ) {
          errors.push(
            issue(
              'HISTORY_TOMBSTONE_CHANGED',
              `${path}.tombstones.${id}`,
              `${id} tombstone facts changed`,
              id,
            ),
          );
        }
      }
    }

    previousActive = active;
    previousTombstones = retired;
    latestActive = active;
    latestTombstones = retired;
  });

  const currentById = new Map(currentRecords.map((record) => [record.id, record]));
  for (const [id, record] of currentById) {
    if (latestTombstones.has(id)) {
      errors.push(
        issue(
          'HISTORY_TOMBSTONE_REUSED',
          'history.latest',
          `${id} is active after retirement`,
          id,
        ),
      );
    } else if (!latestActive.has(id)) {
      errors.push(
        issue(
          'HISTORY_ACTIVE_MISMATCH',
          'history.latest',
          `${id} is absent from the latest active snapshot`,
          id,
        ),
      );
    } else if (latestActive.get(id).type !== record.type) {
      errors.push(
        issue(
          'HISTORY_TYPE_CHANGED',
          'history.latest',
          `${id} current type differs from its history type`,
          id,
        ),
      );
    }
  }
  for (const id of latestActive.keys()) {
    if (!currentById.has(id)) {
      errors.push(
        issue(
          'HISTORY_ACTIVE_MISMATCH',
          'history.latest',
          `${id} is active in history but absent from current records`,
          id,
        ),
      );
    }
  }
}

export function canonicalDecisionRecordId(type, sequence) {
  const definition = DECISION_RECORD_TYPES[type];
  if (!definition) throw new TypeError(`unknown decision record type: ${type}`);
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > 999) {
    throw new TypeError('decision record sequence must be a positive integer from 1 to 999');
  }
  return `${definition.prefix}-${String(sequence).padStart(3, '0')}`;
}

export function validateDecisionCoverage(input, { mode, stage } = {}) {
  const errors = [];
  const blockers = [];
  const futureGaps = [];
  const validationStage =
    stage ?? (mode === 'execution' ? 'execution' : mode === 'planning' ? 'plan' : 'plan');
  if (mode !== undefined && !MODES.has(mode)) {
    errors.push(issue('MODE_INVALID', 'mode', 'must be planning or execution'));
  }
  if (!VALIDATION_STAGES.has(validationStage)) {
    errors.push(
      issue(
        'VALIDATION_STAGE_INVALID',
        'validation_stage',
        'must be discovery, spec, plan, or execution',
      ),
    );
  }
  if (!isObject(input)) {
    errors.push(issue('CONTRACT_INVALID', 'decision_coverage', 'must be an object'));
    const resolvedErrors = finalizeIssues(errors);
    return {
      valid: false,
      structurally_valid: false,
      execution_ready: false,
      mode: mode ?? validationStage,
      validation_stage: validationStage,
      records: [],
      errors: resolvedErrors,
      blockers: [],
      future_gaps: [],
      error_messages: resolvedErrors.map(issueText),
      blocker_messages: [],
      future_gap_messages: [],
    };
  }
  if (input.schema_version !== DECISION_COVERAGE_SCHEMA_VERSION) {
    errors.push(
      issue(
        'SCHEMA_VERSION_UNSUPPORTED',
        'schema_version',
        `must be ${DECISION_COVERAGE_SCHEMA_VERSION}`,
      ),
    );
  }

  const records = Array.isArray(input.records) ? structuredClone(input.records) : [];
  if (!Array.isArray(input.records)) {
    errors.push(issue('RECORDS_INVALID', 'records', 'must be an array'));
  } else if (records.length === 0) {
    errors.push(issue('RECORDS_EMPTY', 'records', 'must contain at least one decision record'));
  }
  if (!isDeterministicallyOrdered(records)) {
    errors.push(issue('ORDER_NONDETERMINISTIC', 'records', 'must use canonical record order'));
  }

  const recordById = new Map();
  const exactCounts = new Map();
  const candidates = new Map();
  for (const record of records) {
    const id = record?.id;
    const path = `records.${String(id ?? '<missing>')}`;
    if (!isObject(record)) {
      errors.push(issue('RECORD_INVALID', path, 'must be an object'));
      continue;
    }
    if (!Object.hasOwn(DECISION_RECORD_TYPES, record.type)) {
      errors.push(issue('TYPE_INVALID', `${path}.type`, 'is not a canonical record type', id));
    }
    if (!isNonEmptyString(record.statement)) {
      errors.push(issue('STATEMENT_MISSING', `${path}.statement`, 'must be non-empty', id));
    }
    if (!isNonEmptyString(id)) {
      errors.push(issue('ID_MALFORMED', `${path}.id`, 'must be a canonical record ID'));
      continue;
    }
    exactCounts.set(id, (exactCounts.get(id) ?? 0) + 1);
    recordById.set(id, recordById.get(id) ?? record);
    const candidate = normalizationCandidate(id);
    if (candidate) {
      const values = candidates.get(candidate) ?? [];
      values.push(id);
      candidates.set(candidate, values);
    }
    const idType = recordTypeForId(id);
    if (!idType) {
      errors.push(
        issue('ID_MALFORMED', `${path}.id`, 'must use an exact canonical ID such as R-001', id),
      );
    } else if (idType !== record.type) {
      errors.push(
        issue(
          'ID_TYPE_MISMATCH',
          `${path}.id`,
          `${id} belongs to ${idType}, not ${record.type}`,
          id,
        ),
      );
    }
  }
  for (const [id, count] of exactCounts) {
    if (count > 1) {
      errors.push(issue('ID_DUPLICATE', `records.${id}`, `appears ${count} times`, id));
    }
  }
  for (const [candidate, ids] of candidates) {
    if (ids.length > 1 && ids.some((id) => id !== candidate)) {
      errors.push(
        issue(
          'ID_NORMALIZATION_COLLISION',
          `records.${candidate}`,
          `normalization would collide: ${[...ids].sort(compareText).join(', ')}`,
          candidate,
        ),
      );
    }
  }

  for (const record of records.filter(isObject)) {
    for (const [field, expectedType] of Object.entries(TYPED_REFERENCE_FIELDS)) {
      validateReferenceArray({ record, field, expectedType, recordById, errors });
    }
    for (const field of RECORD_REFERENCE_FIELDS) {
      if (Object.hasOwn(TYPED_REFERENCE_FIELDS, field)) continue;
      validateReferenceArray({ record, field, recordById, errors });
    }
    for (const field of EXTERNAL_REFERENCE_FIELDS) {
      validateReferenceArray({ record, field, recordById, errors });
    }
    validateRecordSemantics(record, errors, blockers, futureGaps, validationStage);
  }

  validateHistory(input, records.filter(isObject), errors);
  const resolvedErrors = finalizeIssues(errors);
  const resolvedBlockers = finalizeIssues(blockers);
  const resolvedFutureGaps = finalizeIssues(futureGaps);
  const structurallyValid = resolvedErrors.length === 0;
  const valid = structurallyValid && resolvedBlockers.length === 0;
  const executionReady =
    structurallyValid && resolvedFutureGaps.length === 0 && resolvedBlockers.length === 0;
  return {
    valid,
    structurally_valid: structurallyValid,
    execution_ready: executionReady,
    mode: mode ?? validationStage,
    validation_stage: validationStage,
    revision: input.revision,
    records,
    errors: resolvedErrors,
    blockers: resolvedBlockers,
    future_gaps: resolvedFutureGaps,
    error_messages: resolvedErrors.map(issueText),
    blocker_messages: resolvedBlockers.map(issueText),
    future_gap_messages: resolvedFutureGaps.map(issueText),
  };
}

export function assertDecisionCoverage(input, options) {
  const result = validateDecisionCoverage(input, options);
  if (!result.valid) {
    throw new Error(
      `decision coverage blocked:\n${[
        ...result.error_messages,
        ...result.blocker_messages,
      ].join('\n')}`,
    );
  }
  return result;
}

export function validateGoalBackwardPlan(input) {
  const blockerValues = [];
  if (!isObject(input)) {
    blockerValues.push(
      issue('GOAL_BACKWARD_CONTRACT_INVALID', 'goal_backward_review', 'must be an object'),
    );
  }
  if (input?.schema_version !== GOAL_BACKWARD_SCHEMA_VERSION) {
    blockerValues.push(
      issue(
        'GOAL_BACKWARD_SCHEMA_UNSUPPORTED',
        'goal_backward_review.schema_version',
        `must be ${GOAL_BACKWARD_SCHEMA_VERSION}`,
      ),
    );
  }
  if (input?.mode !== 'sdcorejs-plan:goal-backward') {
    blockerValues.push(
      issue(
        'GOAL_BACKWARD_MODE_INVALID',
        'goal_backward_review.mode',
        'must be sdcorejs-plan:goal-backward',
      ),
    );
  }

  const decisionCoverage = validateDecisionCoverage(input?.decision_coverage, {
    stage: 'plan',
  });
  for (const error of decisionCoverage.errors) {
    blockerValues.push(
      issue(
        `DECISION_COVERAGE_${error.code}`,
        `goal_backward_review.decision_coverage.${error.path}`,
        error.message,
        error.record_id,
      ),
    );
  }
  for (const blocker of decisionCoverage.blockers) {
    blockerValues.push(
      issue(
        `DECISION_COVERAGE_${blocker.code}`,
        `goal_backward_review.decision_coverage.${blocker.path}`,
        blocker.message,
        blocker.record_id,
      ),
    );
  }

  const rawRecords = Array.isArray(decisionCoverage.records) ? decisionCoverage.records : [];
  const rawGoals = Array.isArray(input?.goals) ? input.goals : [];
  const rawTasks = Array.isArray(input?.tasks) ? input.tasks : [];
  const rawRepositories = Array.isArray(input?.repository_inventory?.repositories)
    ? input.repository_inventory.repositories
    : [];
  if (!Array.isArray(input?.goals)) {
    blockerValues.push(
      issue('GOALS_MISSING', 'goal_backward_review.goals', 'must be an explicit array'),
    );
  } else if (rawGoals.length === 0) {
    blockerValues.push(
      issue('GOALS_EMPTY', 'goal_backward_review.goals', 'must contain at least one goal'),
    );
  }
  if (!Array.isArray(input?.tasks)) {
    blockerValues.push(
      issue('TASKS_MISSING', 'goal_backward_review.tasks', 'must be an explicit array'),
    );
  } else if (rawTasks.length === 0) {
    blockerValues.push(
      issue('TASKS_EMPTY', 'goal_backward_review.tasks', 'must contain at least one task'),
    );
  }
  if (!Array.isArray(input?.repository_inventory?.repositories)) {
    blockerValues.push(
      issue(
        'REPOSITORY_INVENTORY_MISSING',
        'goal_backward_review.repository_inventory.repositories',
        'must be an explicit array',
      ),
    );
  } else if (rawRepositories.length === 0) {
    blockerValues.push(
      issue(
        'REPOSITORY_INVENTORY_EMPTY',
        'goal_backward_review.repository_inventory.repositories',
        'must contain at least one repository',
      ),
    );
  }

  const records = rawRecords.filter(isObject).map((record) => ({
    ...record,
    task_refs: sanitizedStringArray(record.task_refs),
    evidence_refs: sanitizedStringArray(record.evidence_refs),
  }));

  const goals = [];
  for (const [goalIndex, rawGoal] of rawGoals.entries()) {
    if (!isObject(rawGoal)) {
      blockerValues.push(
        issue(
          'GOAL_INVALID',
          `goal_backward_review.goals.${goalIndex}`,
          'each goal must be an object',
        ),
      );
      continue;
    }
    const goalTaskRefs = sanitizedStringArray(rawGoal.task_refs);
    if (
      Array.isArray(rawGoal.task_refs) &&
      goalTaskRefs.length !== rawGoal.task_refs.length
    ) {
      blockerValues.push(
        issue(
          'GOAL_TASK_REFERENCE_INVALID',
          `goal_backward_review.goals.${String(rawGoal.id ?? '<missing>')}.task_refs`,
          'must contain only non-empty task identities',
          rawGoal.id,
        ),
      );
    }
    goals.push({
      ...rawGoal,
      id: typeof rawGoal.id === 'string' ? rawGoal.id : '',
      task_refs: goalTaskRefs,
    });
  }

  const tasks = [];
  const taskById = new Map();
  for (const [taskIndex, rawTask] of rawTasks.entries()) {
    if (!isObject(rawTask)) {
      blockerValues.push(
        issue(
          'TASK_INVALID',
          `goal_backward_review.tasks.${taskIndex}`,
          'each task must be an object',
        ),
      );
      continue;
    }
    const taskId = typeof rawTask.id === 'string' ? rawTask.id : '';
    const taskPath = `goal_backward_review.tasks.${String(taskId || '<missing>')}`;
    const dependencies = sanitizedStringArray(rawTask.dependencies);
    const plannedPaths = sanitizedRepositoryPathArray(rawTask.planned_paths);
    const justificationRefs = sanitizedStringArray(rawTask.justification_refs);
    const invariantRefs = sanitizedStringArray(rawTask.enforces_invariant_refs);
    const plannedEvidence = [];
    const rawPlannedEvidence = Array.isArray(rawTask.planned_evidence)
      ? rawTask.planned_evidence
      : [];
    for (const [evidenceIndex, rawEvidence] of rawPlannedEvidence.entries()) {
      if (!isObject(rawEvidence)) {
        blockerValues.push(
          issue(
            'EVIDENCE_INVALID',
            `${taskPath}.planned_evidence.${evidenceIndex}`,
            'each planned evidence declaration must be an object',
            taskId,
          ),
        );
        continue;
      }
      const evidenceRecordRefs = sanitizedStringArray(rawEvidence.record_refs);
      if (
        Array.isArray(rawEvidence.record_refs) &&
        evidenceRecordRefs.length !== rawEvidence.record_refs.length
      ) {
        blockerValues.push(
          issue(
            'EVIDENCE_RECORD_REFERENCE_INVALID',
            `${taskPath}.planned_evidence.${String(rawEvidence.id ?? '<missing>')}.record_refs`,
            'must contain only non-empty decision record identities',
            taskId,
          ),
        );
      }
      plannedEvidence.push({
        ...rawEvidence,
        id: typeof rawEvidence.id === 'string' ? rawEvidence.id : '',
        record_refs: evidenceRecordRefs,
      });
    }

    if (!Array.isArray(rawTask.dependencies)) {
      blockerValues.push(
        issue(
          'TASK_DEPENDENCIES_MISSING',
          `${taskPath}.dependencies`,
          'must be an explicit array, including when empty',
          taskId,
        ),
      );
    } else if (dependencies.length !== rawTask.dependencies.length) {
      blockerValues.push(
        issue(
          'TASK_DEPENDENCY_INVALID',
          `${taskPath}.dependencies`,
          'must contain only non-empty task identities',
          taskId,
        ),
      );
    }
    if (!Array.isArray(rawTask.planned_paths) || rawTask.planned_paths.length === 0) {
      blockerValues.push(
        issue(
          'TASK_PATHS_MISSING',
          `${taskPath}.planned_paths`,
          'must contain at least one planned path',
          taskId,
        ),
      );
    } else if (plannedPaths.length !== rawTask.planned_paths.length) {
      blockerValues.push(
        issue(
          'TASK_PATH_INVALID',
          `${taskPath}.planned_paths`,
          'must contain only safe normalized repository-relative paths',
          taskId,
        ),
      );
    }
    if (!Array.isArray(rawTask.planned_evidence) || plannedEvidence.length === 0) {
      blockerValues.push(
        issue(
          'TASK_EVIDENCE_MISSING',
          `${taskPath}.planned_evidence`,
          'must contain at least one planned evidence record',
          taskId,
        ),
      );
    }
    if (!Array.isArray(rawTask.justification_refs) || justificationRefs.length === 0) {
      blockerValues.push(
        issue(
          'TASK_JUSTIFICATION_MISSING',
          `${taskPath}.justification_refs`,
          'must cite at least one requirement or decision',
          taskId,
        ),
      );
    } else if (justificationRefs.length !== rawTask.justification_refs.length) {
      blockerValues.push(
        issue(
          'TASK_JUSTIFICATION_REFERENCE_INVALID',
          `${taskPath}.justification_refs`,
          'must contain only non-empty decision record identities',
          taskId,
        ),
      );
    }
    if (!Array.isArray(rawTask.enforces_invariant_refs)) {
      blockerValues.push(
        issue(
          'TASK_INVARIANT_REFS_MISSING',
          `${taskPath}.enforces_invariant_refs`,
          'must be an explicit array, including when empty',
          taskId,
        ),
      );
    } else if (invariantRefs.length !== rawTask.enforces_invariant_refs.length) {
      blockerValues.push(
        issue(
          'TASK_INVARIANT_REFERENCE_INVALID',
          `${taskPath}.enforces_invariant_refs`,
          'must contain only non-empty invariant identities',
          taskId,
        ),
      );
    }

    const task = {
      ...rawTask,
      id: taskId,
      dependencies,
      planned_paths: plannedPaths,
      planned_evidence: plannedEvidence,
      justification_refs: justificationRefs,
      enforces_invariant_refs: invariantRefs,
    };
    tasks.push(task);
    if (!/^TASK-(?!000)\d{3}$/u.test(task.id)) {
      blockerValues.push(
        issue('TASK_ID_MALFORMED', `${taskPath}.id`, 'must use an exact ID such as TASK-001'),
      );
    }
    if (taskById.has(task.id)) {
      blockerValues.push(
        issue('TASK_ID_DUPLICATE', taskPath, `task ID ${task.id} is duplicated`, task.id),
      );
    }
    taskById.set(task.id, task);
    if (!isNonEmptyString(task.owner_repository_id)) {
      blockerValues.push(
        issue('TASK_OWNER_MISSING', `${taskPath}.owner_repository_id`, 'must be explicit', task.id),
      );
    }
  }

  const repositories = [];
  for (const [repositoryIndex, rawRepository] of rawRepositories.entries()) {
    if (!isObject(rawRepository)) {
      blockerValues.push(
        issue(
          'REPOSITORY_INVENTORY_ENTRY_INVALID',
          `goal_backward_review.repository_inventory.repositories.${repositoryIndex}`,
          'each repository inventory entry must be an object',
        ),
      );
      continue;
    }
    repositories.push(rawRepository);
  }

  const recordById = new Map(records.map((record) => [record.id, record]));
  const taskCoverage = new Map(tasks.map((task) => [task.id, new Set()]));
  for (const record of records.filter(({ type }) =>
    ['requirement', 'acceptance-criterion', 'decision', 'invariant'].includes(type),
  )) {
    const recordPath = `goal_backward_review.decision_coverage.records.${record.id}.task_refs`;
    if (!Array.isArray(record.task_refs) || record.task_refs.length === 0) {
      blockerValues.push(
        issue(
          'RECORD_TASK_COVERAGE_MISSING',
          recordPath,
          `${record.id} must map to at least one real plan task`,
          record.id,
        ),
      );
    }
    for (const taskId of record.task_refs ?? []) {
      if (!taskById.has(taskId)) {
        blockerValues.push(
          issue(
            'TASK_REFERENCE_DANGLING',
            recordPath,
            `${record.id} references unavailable task ${taskId}`,
            record.id,
          ),
        );
      } else {
        taskCoverage.get(taskId)?.add(record.id);
      }
    }
  }

  const dependencyGraph = new Map(tasks.map((task) => [task.id, new Set()]));
  for (const task of tasks) {
    const taskPath = `goal_backward_review.tasks.${String(task?.id ?? '<missing>')}.dependencies`;
    for (const dependencyId of task.dependencies ?? []) {
      if (!taskById.has(dependencyId)) {
        blockerValues.push(
          issue(
            'DEPENDENCY_DANGLING',
            taskPath,
            `${task.id} depends on unavailable task ${dependencyId}`,
            task.id,
          ),
        );
        continue;
      }
      dependencyGraph.get(task.id)?.add(dependencyId);
    }
  }
  const remainingDependencies = new Map(
    [...dependencyGraph].map(([taskId, dependencies]) => [taskId, new Set(dependencies)]),
  );
  const readyTasks = [...remainingDependencies]
    .filter(([, dependencies]) => dependencies.size === 0)
    .map(([taskId]) => taskId)
    .sort(compareText);
  const visitedTasks = new Set();
  while (readyTasks.length > 0) {
    const taskId = readyTasks.shift();
    if (visitedTasks.has(taskId)) continue;
    visitedTasks.add(taskId);
    for (const [candidateId, dependencies] of remainingDependencies) {
      if (!dependencies.delete(taskId) || dependencies.size !== 0) continue;
      readyTasks.push(candidateId);
      readyTasks.sort(compareText);
    }
  }
  const cycleTaskIds = [...remainingDependencies.keys()]
    .filter((taskId) => !visitedTasks.has(taskId))
    .sort(compareText);
  if (cycleTaskIds.length > 0) {
    blockerValues.push(
      issue(
        'DEPENDENCY_CYCLE',
        'goal_backward_review.tasks.dependencies',
        `dependency cycle includes ${cycleTaskIds.join(', ')}`,
      ),
    );
  }

  const evidenceById = new Map();
  const evidenceIdsByRecord = new Map(records.map((record) => [record.id, new Set()]));
  for (const task of tasks) {
    const taskPath = `goal_backward_review.tasks.${String(task?.id ?? '<missing>')}`;
    if (!Array.isArray(task?.enforces_invariant_refs)) {
      blockerValues.push(
        issue(
          'TASK_INVARIANT_REFS_MISSING',
          `${taskPath}.enforces_invariant_refs`,
          'must be an explicit array, including when empty',
          task?.id,
        ),
      );
    }
    for (const invariantId of task?.enforces_invariant_refs ?? []) {
      const invariant = recordById.get(invariantId);
      if (!invariant) {
        blockerValues.push(
          issue(
            'RECORD_REFERENCE_DANGLING',
            `${taskPath}.enforces_invariant_refs`,
            `references unavailable invariant ${invariantId}`,
            task.id,
          ),
        );
      } else if (invariant.type !== 'invariant') {
        blockerValues.push(
          issue(
            'INVARIANT_REFERENCE_WRONG_TYPE',
            `${taskPath}.enforces_invariant_refs`,
            `${invariantId} is ${invariant.type}`,
            task.id,
          ),
        );
      }
    }
    for (const evidence of task?.planned_evidence ?? []) {
      const evidencePath = `${taskPath}.planned_evidence.${String(evidence?.id ?? '<missing>')}`;
      if (typeof evidence?.id !== 'string' || !/^EVIDENCE-(?!000)\d{3}$/u.test(evidence.id)) {
        blockerValues.push(
          issue(
            'EVIDENCE_ID_MALFORMED',
            `${evidencePath}.id`,
            'must use an exact ID such as EVIDENCE-001',
            task.id,
          ),
        );
      }
      if (evidenceById.has(evidence?.id)) {
        blockerValues.push(
          issue(
            'EVIDENCE_ID_DUPLICATE',
            evidencePath,
            `evidence ID ${evidence.id} is duplicated`,
            task.id,
          ),
        );
      } else {
        evidenceById.set(evidence?.id, { ...evidence, task_id: task.id });
      }
      if (!Array.isArray(evidence?.record_refs) || evidence.record_refs.length === 0) {
        blockerValues.push(
          issue(
            'EVIDENCE_RECORD_REFS_MISSING',
            `${evidencePath}.record_refs`,
            'planned evidence must trace to at least one decision record',
            task.id,
          ),
        );
      }
      for (const recordId of evidence?.record_refs ?? []) {
        if (!recordById.has(recordId)) {
          blockerValues.push(
            issue(
              'EVIDENCE_RECORD_REFERENCE_DANGLING',
              `${evidencePath}.record_refs`,
              `references unavailable record ${recordId}`,
              task.id,
            ),
          );
        } else {
          evidenceIdsByRecord.get(recordId)?.add(evidence.id);
        }
      }
    }
  }

  for (const acceptanceCriterion of records.filter(
    ({ type }) => type === 'acceptance-criterion',
  )) {
    const evidenceIds = evidenceIdsByRecord.get(acceptanceCriterion.id) ?? new Set();
    if (evidenceIds.size === 0) {
      blockerValues.push(
        issue(
          'AC_EVIDENCE_COVERAGE_MISSING',
          `goal_backward_review.decision_coverage.records.${acceptanceCriterion.id}.evidence_refs`,
          `${acceptanceCriterion.id} must appear in at least one planned evidence record`,
          acceptanceCriterion.id,
        ),
      );
    } else if (
      ![...evidenceIds].some((evidenceId) =>
        acceptanceCriterion.task_refs?.includes(evidenceById.get(evidenceId)?.task_id),
      )
    ) {
      blockerValues.push(
        issue(
          'AC_EVIDENCE_TASK_MISMATCH',
          `goal_backward_review.decision_coverage.records.${acceptanceCriterion.id}.evidence_refs`,
          `${acceptanceCriterion.id} evidence must be planned by at least one mapped task`,
          acceptanceCriterion.id,
        ),
      );
    }
  }

  for (const invariant of records.filter(({ type }) => type === 'invariant')) {
    for (const taskId of invariant.task_refs ?? []) {
      const task = taskById.get(taskId);
      if (task && !task.enforces_invariant_refs?.includes(invariant.id)) {
        blockerValues.push(
          issue(
            'INVARIANT_ENFORCEMENT_GAP',
            `goal_backward_review.invariants.${invariant.id}.tasks.${taskId}`,
            `${taskId} is traced from ${invariant.id} but does not enforce it`,
            invariant.id,
          ),
        );
      }
    }
    for (const evidenceId of invariant.evidence_refs ?? []) {
      const evidence = evidenceById.get(evidenceId);
      if (
        !evidence ||
        !evidence.record_refs?.includes(invariant.id) ||
        !invariant.task_refs?.includes(evidence.task_id)
      ) {
        blockerValues.push(
          issue(
            'INVARIANT_EVIDENCE_GAP',
            `goal_backward_review.invariants.${invariant.id}.evidence.${evidenceId}`,
            `${evidenceId} is not planned by an enforcing invariant task`,
            invariant.id,
          ),
        );
      }
    }
  }

  for (const goal of goals) {
    const goalPath = `goal_backward_review.goals.${String(goal?.id ?? '<missing>')}`;
    if (typeof goal?.id !== 'string' || !/^G-(?!000)\d{3}$/u.test(goal.id)) {
      blockerValues.push(
        issue('GOAL_ID_MALFORMED', `${goalPath}.id`, 'must use an exact ID such as G-001'),
      );
    }
    if (!isNonEmptyString(goal?.statement)) {
      blockerValues.push(
        issue('GOAL_STATEMENT_MISSING', `${goalPath}.statement`, 'must be non-empty'),
      );
    }
    if (!Array.isArray(goal?.task_refs) || goal.task_refs.length === 0) {
      blockerValues.push(
        issue(
          'GOAL_TASK_COVERAGE_MISSING',
          `${goalPath}.task_refs`,
          'a goal must map to at least one real plan task',
          goal?.id,
        ),
      );
    }
    for (const taskId of goal?.task_refs ?? []) {
      if (!taskById.has(taskId)) {
        blockerValues.push(
          issue(
            'TASK_REFERENCE_DANGLING',
            `${goalPath}.task_refs`,
            `${goal.id} references unavailable task ${taskId}`,
            goal.id,
          ),
        );
      } else {
        taskCoverage.get(taskId)?.add(goal.id);
      }
    }
  }

  for (const task of tasks) {
    const taskPath = `goal_backward_review.tasks.${String(task?.id ?? '<missing>')}`;
    if ((taskCoverage.get(task.id)?.size ?? 0) === 0) {
      blockerValues.push(
        issue(
          'TASK_SCOPE_CREEP',
          taskPath,
          'task is not mapped from any requirement, AC, decision, invariant, or goal',
          task.id,
        ),
      );
    }
    for (const reference of task.justification_refs ?? []) {
      const record = recordById.get(reference);
      if (!record) {
        blockerValues.push(
          issue(
            'RECORD_REFERENCE_DANGLING',
            `${taskPath}.justification_refs`,
            `references unavailable record ${reference}`,
            task.id,
          ),
        );
      } else if (!['requirement', 'decision'].includes(record.type)) {
        blockerValues.push(
          issue(
            'TASK_JUSTIFICATION_WRONG_TYPE',
            `${taskPath}.justification_refs`,
            `${reference} is ${record.type}; only requirements and decisions justify tasks`,
            task.id,
          ),
        );
      } else if (!record.task_refs?.includes(task.id)) {
        blockerValues.push(
          issue(
            'TASK_JUSTIFICATION_UNMAPPED',
            `${taskPath}.justification_refs`,
            `${reference} does not map back to ${task.id}`,
            task.id,
          ),
        );
      }
    }
  }
  const repositoryById = new Map();
  const intendedOwnersByRepository = new Map();
  for (const [repositoryIndex, repository] of repositories.entries()) {
    const repositoryId = isNonEmptyString(repository.repository_id)
      ? repository.repository_id
      : '';
    const repositoryPath = `goal_backward_review.repository_inventory.repositories.${
      repositoryId || repositoryIndex
    }`;
    if (!repositoryId) {
      blockerValues.push(
        issue(
          'REPOSITORY_INVENTORY_ID_MISSING',
          repositoryPath,
          'each repository requires repository_id',
        ),
      );
    }
    if (repositoryId && repositoryById.has(repositoryId)) {
      blockerValues.push(
        issue(
          'REPOSITORY_INVENTORY_DUPLICATE',
          repositoryPath,
          'repository inventory identity is duplicated',
        ),
      );
    }
    const existingPaths = sanitizedRepositoryPathArray(repository.existing_paths);
    if (!Array.isArray(repository.existing_paths)) {
      blockerValues.push(
        issue(
          'REPOSITORY_EXISTING_PATHS_INVALID',
          `${repositoryPath}.existing_paths`,
          'must be an explicit array, including when empty',
        ),
      );
    } else if (existingPaths.length !== repository.existing_paths.length) {
      blockerValues.push(
        issue(
          'PATH_INVENTORY_INVALID',
          `${repositoryPath}.existing_paths`,
          'must contain only safe normalized repository-relative paths',
        ),
      );
    }
    if (new Set(existingPaths).size !== existingPaths.length) {
      blockerValues.push(
        issue(
          'PATH_INVENTORY_DUPLICATE',
          `${repositoryPath}.existing_paths`,
          'existing path inventory contains duplicates',
        ),
      );
    }
    const rawIntendedNewPaths = Array.isArray(repository.intended_new_paths)
      ? repository.intended_new_paths
      : [];
    if (!Array.isArray(repository.intended_new_paths)) {
      blockerValues.push(
        issue(
          'REPOSITORY_INTENDED_NEW_PATHS_INVALID',
          `${repositoryPath}.intended_new_paths`,
          'must be an explicit array, including when empty',
        ),
      );
    }
    const intendedOwners = new Map();
    const intendedNewPaths = [];
    for (const [declarationIndex, declaration] of rawIntendedNewPaths.entries()) {
      if (!isObject(declaration)) {
        blockerValues.push(
          issue(
            'PATH_INTENDED_NEW_DECLARATION_INVALID',
            `${repositoryPath}.intended_new_paths.${declarationIndex}`,
            'each intended-new declaration must be an object',
          ),
        );
        continue;
      }
      const declarationPath = normalizeRepositoryRelativePath(declaration.path) ?? '';
      const declarationOwner = isNonEmptyString(declaration.owner_task_id)
        ? declaration.owner_task_id
        : '';
      if (!isNonEmptyString(declarationPath)) {
        blockerValues.push(
          issue(
            'PATH_INTENDED_NEW_INVALID',
            `${repositoryPath}.intended_new_paths`,
            'an intended-new declaration requires a safe normalized repository-relative path',
          ),
        );
        continue;
      }
      intendedNewPaths.push({
        ...declaration,
        path: declarationPath,
        owner_task_id: declarationOwner,
      });
      const owners = intendedOwners.get(declarationPath) ?? [];
      owners.push(declarationOwner);
      intendedOwners.set(declarationPath, owners);
      if (!isNonEmptyString(declarationOwner)) {
        blockerValues.push(
          issue(
            'PATH_INTENDED_NEW_OWNER_MISSING',
            `${repositoryPath}.${declarationPath}`,
            'an intended-new path requires exactly one owner task',
          ),
        );
      }
      if (existingPaths.includes(declarationPath)) {
        blockerValues.push(
          issue(
            'PATH_CLASSIFICATION_CONFLICT',
            `${repositoryPath}.${declarationPath}`,
            'a path cannot be both existing and intended-new',
          ),
        );
      }
    }
    for (const [declaredPath, owners] of intendedOwners) {
      if (owners.length !== 1) {
        blockerValues.push(
          issue(
            'PATH_INTENDED_NEW_OWNER_AMBIGUOUS',
            `${repositoryPath}.${declaredPath}`,
            'an intended-new path must have exactly one owner declaration',
          ),
        );
      }
    }
    if (repositoryId) {
      repositoryById.set(repositoryId, {
        ...repository,
        repository_id: repositoryId,
        existing_paths: existingPaths,
        intended_new_paths: intendedNewPaths,
      });
      intendedOwnersByRepository.set(repositoryId, intendedOwners);
    }
  }

  const pathCoverage = [];
  const plannedPathOwners = new Map();
  for (const task of [...tasks].sort((left, right) => compareText(left.id, right.id))) {
    const repository = repositoryById.get(task.owner_repository_id);
    const existingPaths = new Set(repository?.existing_paths ?? []);
    const intendedNewOwners = intendedOwnersByRepository.get(task.owner_repository_id) ?? new Map();
    for (const plannedPath of [...(task.planned_paths ?? [])].sort(compareText)) {
      const pathKey = `${task.owner_repository_id}:${plannedPath}`;
      const pathOwners = plannedPathOwners.get(pathKey) ?? [];
      pathOwners.push(task.id);
      plannedPathOwners.set(pathKey, pathOwners);
      const intendedOwners = intendedNewOwners.get(plannedPath) ?? [];
      const classification = existingPaths.has(plannedPath)
        ? 'existing'
        : intendedOwners.length === 1 && intendedOwners[0] === task.id
          ? 'intended-new'
          : 'missing';
      if (classification === 'missing') {
        blockerValues.push(
          issue(
            'PATH_MISSING',
            `goal_backward_review.tasks.${task.id}.planned_paths.${plannedPath}`,
            'path is neither present in inventory nor declared intended-new for this task',
            task.id,
          ),
        );
      }
      pathCoverage.push({
        repository_id: task.owner_repository_id,
        path: plannedPath,
        task_id: task.id,
        classification,
      });
    }
  }
  for (const [pathKey, owners] of plannedPathOwners) {
    if (owners.length > 1) {
      blockerValues.push(
        issue(
          'PATH_DUPLICATE_OWNERSHIP',
          `goal_backward_review.paths.${pathKey}`,
          `planned path has multiple task owners: ${[...owners].sort(compareText).join(', ')}`,
        ),
      );
    }
  }
  for (const [repositoryId, intendedOwners] of intendedOwnersByRepository) {
    for (const [declaredPath, owners] of intendedOwners) {
      if (owners.length !== 1 || !isNonEmptyString(owners[0])) continue;
      const ownerTask = taskById.get(owners[0]);
      if (!ownerTask) {
        blockerValues.push(
          issue(
            'PATH_INTENDED_NEW_OWNER_DANGLING',
            `goal_backward_review.repository_inventory.${repositoryId}.${declaredPath}`,
            `owner task ${owners[0]} does not exist`,
          ),
        );
      } else if (
        ownerTask.owner_repository_id !== repositoryId ||
        !ownerTask.planned_paths?.includes(declaredPath)
      ) {
        blockerValues.push(
          issue(
            'PATH_INTENDED_NEW_OWNER_MISMATCH',
            `goal_backward_review.repository_inventory.${repositoryId}.${declaredPath}`,
            `owner task ${owners[0]} does not own this repository path`,
            owners[0],
          ),
        );
      }
    }
  }

  const rawCritiqueHistory = Array.isArray(input?.critique_history)
    ? input.critique_history
    : [];
  if (!Array.isArray(input?.critique_history) || rawCritiqueHistory.length === 0) {
    blockerValues.push(
      issue(
        'CRITIQUE_HISTORY_MISSING',
        'goal_backward_review.critique_history',
        'must contain at least one auditable self-critique round',
      ),
    );
  }
  if (rawCritiqueHistory.length > 3) {
    blockerValues.push(
      issue(
        'CRITIQUE_ROUND_CAP_EXCEEDED',
        'goal_backward_review.critique_history',
        'self-critique is capped at three rounds; a fourth round is forbidden',
      ),
    );
  }
  const critiqueHistory = rawCritiqueHistory.map((rawRound, index) => {
    const roundPath = `goal_backward_review.critique_history.round-${index + 1}`;
    const round = isObject(rawRound) ? rawRound : {};
    if (!isObject(rawRound)) {
      blockerValues.push(
        issue('CRITIQUE_ROUND_ENTRY_INVALID', roundPath, 'each critique round must be an object'),
      );
    }
    const normalized = { ...round };
    for (const field of ['blockers', 'resolved_blockers', 'unresolved_blockers']) {
      const rawValues = Array.isArray(round[field]) ? round[field] : [];
      const values = sanitizedStringArray(rawValues);
      if (!Array.isArray(round[field])) {
        blockerValues.push(
          issue(
            'CRITIQUE_ROUND_INVALID',
            `${roundPath}.${field}`,
            'must be an explicit array',
          ),
        );
      }
      if (values.length !== rawValues.length || new Set(values).size !== values.length) {
        blockerValues.push(
          issue(
            'CRITIQUE_BLOCKER_SET_INVALID',
            `${roundPath}.${field}`,
            'must contain unique non-empty blocker identities',
          ),
        );
      }
      if (values.some((value, valueIndex) => valueIndex > 0 && values[valueIndex - 1] > value)) {
        blockerValues.push(
          issue(
            'CRITIQUE_BLOCKER_ORDER_INVALID',
            `${roundPath}.${field}`,
            'must use deterministic lexical order',
          ),
        );
      }
      normalized[field] = values;
    }
    return normalized;
  });
  const latestCritique = critiqueHistory.at(-1);
  let previousUnresolved = [];
  for (const [index, round] of critiqueHistory.entries()) {
    const expectedRound = index + 1;
    const roundPath = `goal_backward_review.critique_history.round-${expectedRound}`;
    if (round?.round !== expectedRound) {
      blockerValues.push(
        issue(
          'CRITIQUE_ROUND_GAP',
          roundPath,
          `round must be contiguous and equal ${expectedRound}`,
        ),
      );
    }
    if (round?.checker_version !== GOAL_BACKWARD_CHECKER_VERSION) {
      blockerValues.push(
        issue(
          'CRITIQUE_CHECKER_VERSION_MISMATCH',
          `${roundPath}.checker_version`,
          `must remain ${GOAL_BACKWARD_CHECKER_VERSION}`,
        ),
      );
    }
    const identified = round.blockers;
    const resolved = round.resolved_blockers;
    const unresolved = round.unresolved_blockers;
    for (const blockerId of identified) {
      const dispositionCount =
        Number(resolved.includes(blockerId)) + Number(unresolved.includes(blockerId));
      if (dispositionCount !== 1) {
        blockerValues.push(
          issue(
            'CRITIQUE_BLOCKER_DISPOSITION_INVALID',
            roundPath,
            `${blockerId} must be exactly resolved or unresolved`,
          ),
        );
      }
    }
    for (const blockerId of [...resolved, ...unresolved]) {
      if (!identified.includes(blockerId)) {
        blockerValues.push(
          issue(
            'CRITIQUE_BLOCKER_DANGLING',
            roundPath,
            `${blockerId} has no identified blocker in this round`,
          ),
        );
      }
    }
    for (const blockerId of previousUnresolved) {
      if (!identified.includes(blockerId)) {
        blockerValues.push(
          issue(
            'CRITIQUE_BLOCKER_CONTINUITY_MISSING',
            roundPath,
            `${blockerId} disappeared without an audited disposition`,
          ),
        );
      }
    }
    if (expectedRound === 3 && unresolved.length > 0) {
      blockerValues.push(
        issue(
          'CRITIQUE_ROUND_CAP_BLOCKED',
          `${roundPath}.unresolved_blockers`,
          `round three retains unresolved blockers: ${unresolved.join(', ')}`,
        ),
      );
    }
    previousUnresolved = unresolved;
  }
  if (
    critiqueHistory.length > 0 &&
    critiqueHistory.length < 3 &&
    (latestCritique?.unresolved_blockers?.length ?? 0) > 0
  ) {
    blockerValues.push(
      issue(
        'CRITIQUE_UNRESOLVED',
        `goal_backward_review.critique_history.round-${critiqueHistory.length}.unresolved_blockers`,
        'approval requires another critique round or resolution',
      ),
    );
  }
  const blockers = finalizeIssues(blockerValues);
  const valid = blockers.length === 0;
  return {
    valid,
    approval_ready: valid,
    execution_ready: valid,
    checker: {
      mode: 'sdcorejs-plan:goal-backward',
      schema_version: GOAL_BACKWARD_SCHEMA_VERSION,
      version: GOAL_BACKWARD_CHECKER_VERSION,
    },
    decision_coverage: decisionCoverage,
    coverage: {
      records: records
        .filter(({ type }) =>
          ['requirement', 'acceptance-criterion', 'decision', 'invariant'].includes(type),
        )
        .map((record) => ({
          record_id: record.id,
          type: record.type,
          task_ids: [...(record.task_refs ?? [])],
          evidence_ids: [...(evidenceIdsByRecord.get(record.id) ?? [])].sort(compareText),
          covered:
            (record.task_refs ?? []).every((taskId) => taskById.has(taskId)) &&
            (record.type !== 'acceptance-criterion' ||
              [...(evidenceIdsByRecord.get(record.id) ?? [])].some((evidenceId) =>
                record.task_refs?.includes(evidenceById.get(evidenceId)?.task_id),
              )),
        })),
      goals: goals.map((goal) => ({
        goal_id: goal.id,
        task_ids: [...(goal.task_refs ?? [])],
        covered: (goal.task_refs ?? []).every((taskId) => taskById.has(taskId)),
      })),
      tasks: tasks.map((task) => ({
        task_id: task.id,
        owner_repository_id: task.owner_repository_id,
        dependencies: [...(task.dependencies ?? [])],
        justification_refs: [...(task.justification_refs ?? [])],
      })),
      paths: pathCoverage,
      evidence: tasks.flatMap((task) =>
        (task.planned_evidence ?? []).map((evidence) => ({
          evidence_id: evidence.id,
          task_id: task.id,
          record_refs: [...(evidence.record_refs ?? [])],
        })),
      ),
      invariants: records
        .filter(({ type }) => type === 'invariant')
        .map((record) => ({
          invariant_id: record.id,
          task_ids: [...(record.task_refs ?? [])],
          evidence_ids: [...(record.evidence_refs ?? [])],
        })),
    },
    critique: {
      rounds_completed: critiqueHistory.length,
      rounds_remaining: Math.max(0, 3 - critiqueHistory.length),
      unresolved_blockers: [...(latestCritique?.unresolved_blockers ?? [])],
      status: valid ? 'clear' : 'blocked',
    },
    blockers,
    blocker_messages: blockers.map(issueText),
  };
}

export function assertGoalBackwardPlan(input, options) {
  const result = validateGoalBackwardPlan(input, options);
  if (!result.valid) {
    throw new Error(`goal-backward review blocked:\n${result.blocker_messages.join('\n')}`);
  }
  return result;
}
