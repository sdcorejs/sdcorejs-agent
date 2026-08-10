import { isDeepStrictEqual } from 'node:util';

import {
  verifyApprovedArtifact,
  verifyApprovedArtifactGraph,
} from './approved-artifact.mjs';
import { validateDecisionCoverage } from './decision-coverage.mjs';

export const ARCHITECTURE_SCHEMA_VERSION = 1;

export const ARCHITECTURE_REQUIRED_SIGNALS = Object.freeze([
  'architectural-paradigm',
  'conflicting-independent-unit-decisions',
  'cross-module-boundary',
  'cross-repository-boundary',
  'event-contract',
  'integration-owner-dependency-direction',
  'major-dependency',
  'persisted-data-model-contract',
  'public-api-contract',
  'queue-topic-contract',
  'security-trust-boundary',
  'state-data-ownership',
]);

export const ARCHITECTURE_BYPASS_KINDS = Object.freeze([
  'bounded-bug-fix',
  'current-architecture-review',
  'dependency-patch-no-architecture-change',
  'docs-only',
  'invariant-crud',
  'read-only-architecture-mapping',
  'simple-four-field-drawer',
  'static-copy-or-style',
  'test-only',
]);

const SIGNALS = new Set(ARCHITECTURE_REQUIRED_SIGNALS);
const BYPASS_KINDS = new Set(ARCHITECTURE_BYPASS_KINDS);
const APPROVAL_HASH = /^sha256:v1:[a-f0-9]{64}$/u;
const REVISION = /^[a-f0-9]{40}$/u;
const RECORD_ID = /^(R|AC|A|D|INV)-(?!000)\d{3}$/u;
const SAFE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/u;
const COLLECTION_FIELDS = Object.freeze([
  'boundaries',
  'dependency_directions',
  'data_state_owners',
  'public_contracts',
  'security_trust_boundaries',
  'cross_repository_integration',
  'adopted_decision_refs',
  'deferred_decision_refs',
  'assumption_refs',
  'validation_obligations',
]);
const SIGNAL_EVIDENCE_FIELDS = Object.freeze({
  'architectural-paradigm': ['adopted_decision_refs'],
  'conflicting-independent-unit-decisions': ['adopted_decision_refs'],
  'cross-module-boundary': ['boundaries'],
  'cross-repository-boundary': ['boundaries', 'cross_repository_integration'],
  'event-contract': ['public_contracts'],
  'integration-owner-dependency-direction': ['dependency_directions'],
  'major-dependency': ['dependency_directions'],
  'persisted-data-model-contract': ['public_contracts'],
  'public-api-contract': ['public_contracts'],
  'queue-topic-contract': ['public_contracts'],
  'security-trust-boundary': ['security_trust_boundaries'],
  'state-data-ownership': ['data_state_owners'],
});
const FRONTEND_TRACKS = new Set(['angular', 'nextjs', 'react']);
const FRONTEND_STACK_PROFILES = new Set([
  'core-ui-angular',
  'legacy-core-ui-angular',
  'nextjs-build-website',
  'plain-angular',
  'plain-nextjs',
  'react-cra',
  'react-next-generic',
  'react-vite',
]);
const PUBLIC_CONTRACT_KINDS = new Set([
  'api',
  'event',
  'queue',
  'topic',
  'queue-topic',
  'data-model',
  'persisted-data-model',
]);
const SIGNAL_PUBLIC_CONTRACT_KINDS = Object.freeze({
  'event-contract': new Set(['event']),
  'persisted-data-model-contract': new Set(['data-model', 'persisted-data-model']),
  'public-api-contract': new Set(['api']),
  'queue-topic-contract': new Set(['queue', 'topic', 'queue-topic']),
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

function isSafeRepositoryPath(value, requiredRoot = null) {
  if (!isText(value) || value.includes('\\') || value.includes('\0')) return false;
  if (
    value.startsWith('/') ||
    value.startsWith('./') ||
    /^[A-Za-z]:\//u.test(value) ||
    value.includes('//')
  ) return false;
  const segments = value.split('/');
  if (segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
    return false;
  }
  return requiredRoot === null || value.startsWith(`${requiredRoot}/`);
}

function validateStringArray({ value, path, code, blockers, nonEmpty = false }) {
  if (!Array.isArray(value)) {
    blockers.push(issue(code, path, 'must be an explicit array'));
    return [];
  }
  const strings = [];
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
    strings.push(candidate);
  }
  if (nonEmpty && strings.length === 0) {
    blockers.push(issue(code, path, 'must contain at least one value'));
  }
  return strings;
}

function validateInvariantRefs(value, path, invariantIds, blockers, { nonEmpty = true } = {}) {
  const refs = validateStringArray({
    value,
    path,
    code: 'INVARIANT_REFS_INVALID',
    blockers,
    nonEmpty,
  });
  for (const reference of refs) {
    if (!invariantIds.has(reference)) {
      blockers.push(
        issue('INVARIANT_REFERENCE_DANGLING', path, `references unavailable invariant ${reference}`),
      );
    }
  }
  return refs;
}

function validateReferenceObject(reference, path, blockers, expectedKind = null) {
  if (!isObject(reference)) {
    blockers.push(issue('ARTIFACT_REFERENCE_INVALID', path, 'must be an artifact reference object'));
    return;
  }
  for (const field of ['repository_id', 'artifact_id', 'artifact_kind']) {
    if (!isText(reference[field])) {
      blockers.push(issue('ARTIFACT_REFERENCE_INVALID', `${path}.${field}`, 'must be non-empty'));
    }
  }
  if (expectedKind && reference.artifact_kind !== expectedKind) {
    blockers.push(
      issue('ARTIFACT_REFERENCE_KIND_INVALID', `${path}.artifact_kind`, `must be ${expectedKind}`),
    );
  }
  if (!REVISION.test(reference.revision ?? '')) {
    blockers.push(issue('ARTIFACT_REFERENCE_REVISION_INVALID', `${path}.revision`, 'must be a 40-character lowercase revision'));
  }
  if (!APPROVAL_HASH.test(reference.approval_hash ?? '')) {
    blockers.push(issue('ARTIFACT_REFERENCE_HASH_INVALID', `${path}.approval_hash`, 'must be a sha256:v1 approval hash'));
  }
}

export function classifyArchitectureGate(input) {
  const blockerValues = [];
  if (!isObject(input)) {
    return resultFrom(
      [issue('GATE_INPUT_INVALID', 'architecture_gate', 'must be an object')],
      { required: null, status: 'blocked', signals: [], bypass: null, rationale: null },
    );
  }
  const rawSignals = Array.isArray(input.signals) ? input.signals : [];
  if (!Array.isArray(input.signals)) {
    blockerValues.push(issue('SIGNALS_INVALID', 'architecture_gate.signals', 'must be an explicit array'));
  }
  const signals = [];
  const seen = new Set();
  for (const [index, signal] of rawSignals.entries()) {
    if (!SIGNALS.has(signal)) {
      blockerValues.push(
        issue('SIGNAL_UNKNOWN', `architecture_gate.signals[${index}]`, `unknown architecture signal ${String(signal)}`),
      );
      continue;
    }
    if (seen.has(signal)) {
      blockerValues.push(issue('SIGNAL_DUPLICATE', 'architecture_gate.signals', `duplicates ${signal}`));
      continue;
    }
    seen.add(signal);
    signals.push(signal);
  }
  signals.sort(compareText);
  const bypass = input.bypass;
  if (signals.length > 0 && bypass !== undefined && bypass !== null) {
    blockerValues.push(
      issue('GATE_CONFLICT', 'architecture_gate', 'a required signal cannot be bypassed'),
    );
  }
  if (!isText(input.rationale) && signals.length > 0) {
    blockerValues.push(
      issue('RATIONALE_MISSING', 'architecture_gate.rationale', 'required architecture needs a rationale'),
    );
  }
  if (signals.length === 0) {
    if (!isObject(bypass)) {
      blockerValues.push(
        issue('GATE_AMBIGUOUS', 'architecture_gate', 'record a required signal or a concrete not-applicable bypass'),
      );
    } else {
      if (!BYPASS_KINDS.has(bypass.kind)) {
        blockerValues.push(
          issue('BYPASS_KIND_INVALID', 'architecture_gate.bypass.kind', `unknown bypass ${String(bypass.kind)}`),
        );
      }
      if (!isText(bypass.rationale)) {
        blockerValues.push(
          issue('BYPASS_RATIONALE_MISSING', 'architecture_gate.bypass.rationale', 'must be concrete and non-empty'),
        );
      }
      if (clone(bypass) === null) {
        blockerValues.push(
          issue(
            'GATE_NOT_CLONEABLE',
            'architecture_gate.bypass',
            'must contain only portable structured data',
          ),
        );
      }
    }
  }
  const blockers = finalize(blockerValues);
  const valid = blockers.length === 0;
  const required = valid ? signals.length > 0 : null;
  return {
    valid,
    required,
    status: valid ? (required ? 'required' : 'not-applicable') : 'blocked',
    signals,
    bypass: valid && !required ? clone(bypass) : null,
    rationale: required ? input.rationale.trim() : valid ? bypass.rationale.trim() : null,
    blockers,
    blocker_messages: blockers.map(issueText),
  };
}

export function assertArchitectureGate(input) {
  const result = classifyArchitectureGate(input);
  if (!result.valid) {
    throw new Error(`architecture gate blocked:\n${result.blocker_messages.join('\n')}`);
  }
  return result;
}

function validateNamedInvariantCollection({ value, field, invariantIds, blockers }) {
  if (!Array.isArray(value)) return;
  for (const [index, row] of value.entries()) {
    const path = `architecture_context.${field}[${index}]`;
    if (!isObject(row)) {
      blockers.push(issue(`${field.toUpperCase()}_ENTRY_INVALID`, path, 'must be an object'));
      continue;
    }
    const requiredFields = field === 'dependency_directions'
      ? ['from', 'to', 'rationale']
      : field === 'data_state_owners'
        ? ['subject', 'owner_repository_id']
        : field === 'cross_repository_integration'
          ? ['owner_repository_id']
          : ['id', field === 'public_contracts' ? 'kind' : 'statement'];
    for (const requiredField of requiredFields) {
      if (!isText(row[requiredField])) {
        blockers.push(
          issue(`${field.toUpperCase()}_ENTRY_INVALID`, `${path}.${requiredField}`, 'must be non-empty'),
        );
      }
    }
    validateInvariantRefs(row.invariant_refs, `${path}.invariant_refs`, invariantIds, blockers);
    if (field === 'public_contracts') {
      if (isText(row.kind) && !PUBLIC_CONTRACT_KINDS.has(row.kind)) {
        blockers.push(issue('PUBLIC_CONTRACT_KIND_INVALID', `${path}.kind`, `unknown public contract kind ${row.kind}`));
      }
      for (const requiredField of ['owner', 'compatibility', 'migration']) {
        if (!isText(row[requiredField])) {
          blockers.push(issue('PUBLIC_CONTRACTS_ENTRY_INVALID', `${path}.${requiredField}`, 'must be non-empty'));
        }
      }
    }
    if (field === 'cross_repository_integration') {
      if (!Array.isArray(row.child_references) || row.child_references.length === 0) {
        blockers.push(issue('CROSS_REPOSITORY_CHILD_REFS_INVALID', `${path}.child_references`, 'must contain immutable child references'));
      } else {
        for (const [childIndex, child] of row.child_references.entries()) {
          const childPath = `${path}.child_references[${childIndex}]`;
          if (!isObject(child)) {
            blockers.push(issue('CROSS_REPOSITORY_CHILD_REF_INVALID', childPath, 'must be an object'));
            continue;
          }
          if (!isText(child.repository_id)) blockers.push(issue('CROSS_REPOSITORY_CHILD_REF_INVALID', `${childPath}.repository_id`, 'must be non-empty'));
          if (!isSafeRepositoryPath(child.repository_relative_path)) blockers.push(issue('CROSS_REPOSITORY_CHILD_PATH_INVALID', `${childPath}.repository_relative_path`, 'must be repository-relative'));
          if (!REVISION.test(child.revision ?? '')) blockers.push(issue('CROSS_REPOSITORY_CHILD_REVISION_INVALID', `${childPath}.revision`, 'must be a 40-character lowercase revision'));
        }
      }
    }
  }
}

export function validateArchitectureContext(input, { decision_coverage: decisionCoverage } = {}) {
  const blockerValues = [];
  if (!isObject(input)) {
    return resultFrom(
      [issue('CONTEXT_INVALID', 'architecture_context', 'must be an object')],
      { approval_ready: false, context: null },
    );
  }
  const clonedContext = clone(input);
  if (clonedContext === null) {
    blockerValues.push(
      issue(
        'CONTEXT_NOT_CLONEABLE',
        'architecture_context',
        'must contain only portable structured data',
      ),
    );
  }
  if (input.schema_version !== ARCHITECTURE_SCHEMA_VERSION) {
    blockerValues.push(issue('SCHEMA_VERSION_UNSUPPORTED', 'architecture_context.schema_version', `must be ${ARCHITECTURE_SCHEMA_VERSION}`));
  }
  if (input.source !== 'sdcorejs-architecture') {
    blockerValues.push(issue('SOURCE_INVALID', 'architecture_context.source', 'must be sdcorejs-architecture'));
  }
  for (const field of [
    'contract_id',
    'requirement_id',
    'owner_repository_id',
    'execution_host_repository_id',
    'integration_owner_repository_id',
  ]) {
    if (!isText(input[field])) blockerValues.push(issue('FIELD_REQUIRED', `architecture_context.${field}`, 'must be non-empty'));
  }
  if (input.owner_module_id !== null && !isText(input.owner_module_id)) {
    blockerValues.push(issue('OWNER_MODULE_INVALID', 'architecture_context.owner_module_id', 'must be null or non-empty'));
  }
  validateReferenceObject(input.approved_spec_reference, 'architecture_context.approved_spec_reference', blockerValues, 'spec');
  if (!isSafeRepositoryPath(input.approved_architecture_path, '.sdcorejs/architecture')) {
    blockerValues.push(issue('ARCHITECTURE_PATH_INVALID', 'architecture_context.approved_architecture_path', 'must be a canonical repository-relative architecture path'));
  }
  if (!APPROVAL_HASH.test(input.approved_architecture_hash ?? '')) {
    blockerValues.push(issue('ARCHITECTURE_HASH_INVALID', 'architecture_context.approved_architecture_hash', 'must be a sha256:v1 approval hash'));
  }

  const trigger = classifyArchitectureGate({
    signals: input.trigger?.signals,
    rationale: input.trigger?.rationale,
  });
  if (!isObject(input.trigger) || input.trigger.required !== true || !trigger.valid || trigger.required !== true) {
    blockerValues.push(issue('TRIGGER_INVALID', 'architecture_context.trigger', 'an approved architecture requires a valid required gate'));
  }

  for (const field of COLLECTION_FIELDS) {
    if (!Array.isArray(input[field])) {
      blockerValues.push(issue(`${field.toUpperCase()}_INVALID`, `architecture_context.${field}`, 'must be an explicit array'));
    }
  }
  const rawInvariants = Array.isArray(input.invariants) ? input.invariants : [];
  if (!Array.isArray(input.invariants)) {
    blockerValues.push(issue('INVARIANTS_INVALID', 'architecture_context.invariants', 'must be an explicit array'));
  }
  if (rawInvariants.length === 0) {
    blockerValues.push(issue('INVARIANTS_EMPTY', 'architecture_context.invariants', 'required architecture must declare a testable invariant'));
  }

  let coverageRecords = [];
  try {
    const coverage = validateDecisionCoverage(decisionCoverage, { stage: 'spec' });
    if (!coverage.structurally_valid) {
      blockerValues.push(issue('DECISION_COVERAGE_INVALID', 'architecture_context.decision_coverage', coverage.error_messages.join('; ') || 'must be structurally valid'));
    }
    coverageRecords = Array.isArray(coverage.records) ? coverage.records : [];
  } catch (error) {
    blockerValues.push(issue('DECISION_COVERAGE_INVALID', 'architecture_context.decision_coverage', error?.message ?? String(error)));
  }
  const objectRecords = coverageRecords.filter(isObject);
  const recordById = new Map(objectRecords.map((record) => [record.id, record]));
  const idsForType = (type) => new Set(
    objectRecords.filter((record) => record.type === type).map((record) => record.id),
  );
  const requirementIds = idsForType('requirement');
  const decisionIds = idsForType('decision');
  const assumptionIds = idsForType('assumption');
  const acceptanceCriterionIds = idsForType('acceptance-criterion');
  if (!requirementIds.has(input.requirement_id)) {
    blockerValues.push(issue('REQUIREMENT_REFERENCE_DANGLING', 'architecture_context.requirement_id', `references unavailable requirement ${String(input.requirement_id)}`));
  }

  const invariantIds = new Set();
  for (const [index, invariant] of rawInvariants.entries()) {
    const path = `architecture_context.invariants[${index}]`;
    if (!isObject(invariant)) {
      blockerValues.push(issue('INVARIANT_INVALID', path, 'must be an object'));
      continue;
    }
    if (!/^INV-(?!000)\d{3}$/u.test(invariant.id ?? '')) {
      blockerValues.push(issue('INVARIANT_ID_INVALID', `${path}.id`, 'must use an exact ID such as INV-001'));
    } else if (invariantIds.has(invariant.id)) {
      blockerValues.push(issue('INVARIANT_ID_DUPLICATE', `${path}.id`, `duplicates ${invariant.id}`));
    } else {
      invariantIds.add(invariant.id);
      if (recordById.get(invariant.id)?.type !== 'invariant') {
        blockerValues.push(issue('INVARIANT_REFERENCE_DANGLING', `${path}.id`, `references unavailable invariant ${invariant.id}`));
      }
    }
    for (const field of ['statement', 'scope', 'owner', 'rationale', 'verification_method']) {
      if (!isText(invariant[field])) blockerValues.push(issue('INVARIANT_FIELD_REQUIRED', `${path}.${field}`, 'must be non-empty'));
    }
    const requirementRefs = validateStringArray({ value: invariant.requirement_refs, path: `${path}.requirement_refs`, code: 'REQUIREMENT_REFS_INVALID', blockers: blockerValues, nonEmpty: true });
    for (const reference of requirementRefs) if (!requirementIds.has(reference)) blockerValues.push(issue('REQUIREMENT_REFERENCE_DANGLING', `${path}.requirement_refs`, `references unavailable requirement ${reference}`));
    const decisionRefs = validateStringArray({ value: invariant.decision_refs, path: `${path}.decision_refs`, code: 'DECISION_REFS_INVALID', blockers: blockerValues, nonEmpty: true });
    for (const reference of decisionRefs) if (!decisionIds.has(reference)) blockerValues.push(issue('DECISION_REFERENCE_DANGLING', `${path}.decision_refs`, `references unavailable decision ${reference}`));
  }

  for (const field of [
    'boundaries',
    'dependency_directions',
    'data_state_owners',
    'public_contracts',
    'security_trust_boundaries',
    'cross_repository_integration',
  ]) {
    validateNamedInvariantCollection({ value: input[field], field, invariantIds, blockers: blockerValues });
  }

  if (trigger.valid && trigger.required) {
    for (const signal of trigger.signals) {
      for (const field of SIGNAL_EVIDENCE_FIELDS[signal] ?? []) {
        if (!Array.isArray(input[field]) || input[field].length === 0) {
          blockerValues.push(
            issue(
              'SIGNAL_EVIDENCE_MISSING',
              `architecture_context.${field}`,
              `${signal} requires relevant ${field} evidence`,
            ),
          );
        }
      }
      const expectedKinds = SIGNAL_PUBLIC_CONTRACT_KINDS[signal];
      if (
        expectedKinds &&
        !input.public_contracts?.some(
          (row) => isObject(row) && expectedKinds.has(row.kind),
        )
      ) {
        blockerValues.push(
          issue(
            'SIGNAL_EVIDENCE_MISMATCH',
            'architecture_context.public_contracts',
            `${signal} requires a matching canonical public-contract kind`,
          ),
        );
      }
    }
  }

  for (const [field, available, wrongTypeCode] of [
    ['adopted_decision_refs', decisionIds, 'DECISION_REFERENCE_DANGLING'],
    ['deferred_decision_refs', decisionIds, 'DECISION_REFERENCE_DANGLING'],
    ['assumption_refs', assumptionIds, 'ASSUMPTION_REFERENCE_DANGLING'],
  ]) {
    const refs = validateStringArray({ value: input[field], path: `architecture_context.${field}`, code: `${field.toUpperCase()}_INVALID`, blockers: blockerValues });
    for (const reference of refs) {
      if (!available.has(reference)) blockerValues.push(issue(wrongTypeCode, `architecture_context.${field}`, `references unavailable record ${reference}`));
    }
  }

  const obligations = Array.isArray(input.validation_obligations) ? input.validation_obligations : [];
  if (obligations.length === 0) {
    blockerValues.push(issue('VALIDATION_OBLIGATIONS_EMPTY', 'architecture_context.validation_obligations', 'required architecture must define expected proof'));
  }
  for (const [index, obligation] of obligations.entries()) {
    const path = `architecture_context.validation_obligations[${index}]`;
    if (!isObject(obligation)) {
      blockerValues.push(issue('VALIDATION_OBLIGATION_INVALID', path, 'must be an object'));
      continue;
    }
    if (!/^VAL-(?!000)\d{3}$/u.test(obligation.id ?? '')) blockerValues.push(issue('VALIDATION_OBLIGATION_ID_INVALID', `${path}.id`, 'must use an exact ID such as VAL-001'));
    for (const field of ['expected_proof', 'owner']) if (!isText(obligation[field])) blockerValues.push(issue('VALIDATION_OBLIGATION_FIELD_REQUIRED', `${path}.${field}`, 'must be non-empty'));
    validateInvariantRefs(obligation.invariant_refs, `${path}.invariant_refs`, invariantIds, blockerValues);
    const criterionRefs = validateStringArray({ value: obligation.acceptance_criterion_refs, path: `${path}.acceptance_criterion_refs`, code: 'AC_REFS_INVALID', blockers: blockerValues, nonEmpty: true });
    for (const reference of criterionRefs) if (!acceptanceCriterionIds.has(reference)) blockerValues.push(issue('AC_REFERENCE_DANGLING', `${path}.acceptance_criterion_refs`, `references unavailable acceptance criterion ${reference}`));
  }

  if (!isObject(input.profile_sections)) {
    blockerValues.push(issue('PROFILE_SECTIONS_INVALID', 'architecture_context.profile_sections', 'must be an object'));
  } else {
    for (const field of ['frontend_architecture_ref', 'agent_architecture_ref']) {
      const profile = input.profile_sections[field];
      const path = `architecture_context.profile_sections.${field}`;
      if (profile === null) continue;
      if (!isObject(profile) || !isText(profile.reference)) {
        blockerValues.push(issue('PROFILE_REFERENCE_INVALID', path, 'must be null or contain a reference'));
        continue;
      }
      const refs = validateInvariantRefs(profile.conformance_invariant_refs, `${path}.conformance_invariant_refs`, invariantIds, blockerValues);
      if (refs.length === 0) blockerValues.push(issue('PROFILE_INVARIANT_CONFORMANCE_MISSING', `${path}.conformance_invariant_refs`, 'profile architecture must prove relevant INV conformance'));
    }
  }

  if (!isObject(input.change_control) || !Number.isInteger(input.change_control.revision) || input.change_control.revision < 1) {
    blockerValues.push(issue('REVISION_INVALID', 'architecture_context.change_control.revision', 'must be a positive integer'));
  } else if (input.change_control.revision === 1 && input.change_control.supersedes !== null) {
    blockerValues.push(issue('SUPERSEDES_INVALID', 'architecture_context.change_control.supersedes', 'the first revision must use null'));
  } else if (input.change_control.revision > 1 && !isText(input.change_control.supersedes)) {
    blockerValues.push(issue('SUPERSEDES_REQUIRED', 'architecture_context.change_control.supersedes', 'a later revision must identify the artifact it supersedes'));
  }

  const blockers = finalize(blockerValues);
  const valid = blockers.length === 0;
  return {
    valid,
    approval_ready: valid,
    context: valid ? clonedContext : null,
    blockers,
    blocker_messages: blockers.map(issueText),
  };
}

export function assertArchitectureContext(input, options) {
  const result = validateArchitectureContext(input, options);
  if (!result.valid) {
    throw new Error(`architecture context blocked:\n${result.blocker_messages.join('\n')}`);
  }
  return result;
}

function safeSegment(value, field) {
  if (!SAFE_SEGMENT.test(value ?? '')) throw new TypeError(`${field} must be a safe path segment`);
  return value;
}

export function buildArchitectureDraftPath({ timestamp, topic }) {
  return `.sdcorejs/docs/architecture/${safeSegment(timestamp, 'timestamp')}-${safeSegment(topic, 'topic')}-architecture.md`;
}

export function buildArchitectureApprovedPath({ track, timestamp, topic }) {
  return `.sdcorejs/architecture/${safeSegment(track, 'track')}/${safeSegment(timestamp, 'timestamp')}-${safeSegment(topic, 'topic')}.md`;
}

export function resolveArchitectureOwner({
  scope,
  module_id: moduleId = null,
  integration_owner_repository_id: integrationOwnerRepositoryId = null,
  repositories,
}) {
  if (!Array.isArray(repositories)) throw new TypeError('repositories must be an array');
  let owner;
  if (scope === 'module-internal') {
    owner = repositories.find(({ role, module_id: candidateModuleId }) => role === 'module' && candidateModuleId === moduleId);
    if (!owner) throw new Error(`module owner ${moduleId ?? '<missing>'} is unavailable; portal fallback is forbidden`);
  } else if (scope === 'portal-composition' || scope === 'cross-repository') {
    owner = repositories.find(({ repository_id: repositoryId }) => repositoryId === integrationOwnerRepositoryId);
    if (!owner) throw new Error(`integration owner ${integrationOwnerRepositoryId ?? '<missing>'} is unavailable; portal fallback is forbidden`);
    if (scope === 'portal-composition' && owner.role !== 'portal') throw new Error('portal composition architecture must be owned by the portal repository');
  } else {
    throw new TypeError('scope must be module-internal, portal-composition, or cross-repository');
  }
  if (owner.available !== true || owner.writable !== true) {
    throw new Error(`architecture owner ${owner.repository_id} is unavailable or not writable`);
  }
  return {
    owner_repository_id: owner.repository_id,
    owner_repository_role: owner.role,
    owner_module_id: owner.module_id ?? null,
    integration_owner_repository_id: integrationOwnerRepositoryId ?? owner.repository_id,
  };
}

function exactParent(metadata, artifact) {
  return isObject(metadata) && isObject(artifact?.metadata) &&
    metadata.parent_references?.length === 1 && isDeepStrictEqual(metadata.parent_references[0], {
    repository_id: artifact.metadata.owner_repository_id,
    artifact_id: artifact.metadata.artifact_id,
    artifact_kind: artifact.metadata.artifact_kind,
    revision: artifact.metadata.source_revision,
    approval_hash: artifact.metadata.approval_hash,
  });
}

function addCaught(blockers, code, path, action) {
  try {
    return action();
  } catch (error) {
    blockers.push(issue(code, path, error?.message ?? String(error)));
    return null;
  }
}

function normalizedGateResult(gate, blockers) {
  if (!isObject(gate)) {
    blockers.push(issue('GATE_INVALID', 'architecture_handoff.gate', 'must be an architecture gate result'));
    return null;
  }
  const normalized = classifyArchitectureGate({
    signals: gate.signals,
    bypass: gate.bypass,
    rationale: gate.rationale,
  });
  if (!normalized.valid) {
    blockers.push(issue('GATE_INVALID', 'architecture_handoff.gate', normalized.blocker_messages.join('; ')));
    return null;
  }
  const suppliedIdentity = {
    valid: gate.valid,
    required: gate.required,
    status: gate.status,
    signals: gate.signals,
    bypass: gate.bypass,
    rationale: gate.rationale,
  };
  const normalizedIdentity = {
    valid: normalized.valid,
    required: normalized.required,
    status: normalized.status,
    signals: normalized.signals,
    bypass: normalized.bypass,
    rationale: normalized.rationale,
  };
  if (!isDeepStrictEqual(suppliedIdentity, normalizedIdentity)) {
    blockers.push(
      issue(
        'GATE_IDENTITY_INVALID',
        'architecture_handoff.gate',
        'must equal the deterministic classifier result for its signals, bypass, and rationale',
      ),
    );
  }
  return normalized;
}

function validateIntegrationOwnership({ context, metadata, topology, blockers }) {
  if (!isObject(topology) || !Array.isArray(topology.repositories)) {
    blockers.push(issue('REPOSITORY_TOPOLOGY_INVALID', 'architecture_handoff.repository_topology', 'must contain an explicit repositories array'));
    return;
  }
  const integrationOwner = context.integration_owner_repository_id;
  if (topology.integration_owner_repository_id !== integrationOwner) {
    blockers.push(issue('INTEGRATION_OWNER_MISMATCH', 'architecture_handoff.repository_topology.integration_owner_repository_id', 'must match the approved architecture integration owner'));
  }
  const matches = topology.repositories.filter(
    (repository) => isObject(repository) && repository.repository_id === integrationOwner,
  );
  if (matches.length > 1) {
    blockers.push(issue('INTEGRATION_OWNER_AMBIGUOUS', 'architecture_handoff.repository_topology.repositories', `contains multiple records for ${integrationOwner}`));
  } else if (matches.length === 0 || matches[0].available !== true || matches[0].writable !== true) {
    blockers.push(issue('INTEGRATION_OWNER_UNAVAILABLE', 'architecture_handoff.repository_topology.repositories', `${integrationOwner} must resolve exactly once as available and writable`));
  }
  if (metadata.integration_owner_repository_id !== integrationOwner) {
    blockers.push(issue('ARCHITECTURE_METADATA_MISMATCH', 'architecture_handoff.architecture_context.integration_owner_repository_id', 'must match architecture metadata integration_owner_repository_id'));
  }
  if (
    context.trigger.signals.includes('cross-repository-boundary') &&
    context.owner_repository_id !== integrationOwner
  ) {
    blockers.push(issue('CROSS_REPOSITORY_OWNER_MISMATCH', 'architecture_handoff.architecture_context.owner_repository_id', 'cross-repository architecture must be owned by the resolved integration owner'));
  }
  for (const [index, integration] of context.cross_repository_integration.entries()) {
    if (isObject(integration) && integration.owner_repository_id !== integrationOwner) {
      blockers.push(issue('CROSS_REPOSITORY_OWNER_MISMATCH', `architecture_handoff.architecture_context.cross_repository_integration[${index}].owner_repository_id`, 'must match the resolved integration owner'));
    }
  }
}

function validateProfileBinding({ context, planContext, planMetadata, blockers }) {
  const frontendMetadataApplicable = FRONTEND_TRACKS.has(planMetadata.track) ||
    FRONTEND_STACK_PROFILES.has(planMetadata.stack_profile);
  const agentMetadataApplicable = planMetadata.track === 'ai-agent' || planMetadata.stack_profile === 'ai-agent';
  for (const profile of [
    {
      metadataApplicable: frontendMetadataApplicable,
      field: 'frontend_architecture_ref',
      block: 'frontend_architecture',
      requiredForMetadata: false,
    },
    {
      metadataApplicable: agentMetadataApplicable,
      field: 'agent_architecture_ref',
      block: 'agent_architecture',
      requiredForMetadata: true,
    },
  ]) {
    const reference = context.profile_sections?.[profile.field];
    const path = `architecture_handoff.architecture_context.profile_sections.${profile.field}`;
    const planBlock = isObject(planContext) ? planContext[profile.block] : null;
    if (!isObject(planBlock)) {
      if (profile.metadataApplicable || isObject(reference)) {
        blockers.push(issue('PROFILE_PLAN_BLOCK_REQUIRED', `architecture_handoff.plan_context.${profile.block}`, 'metadata or an architecture reference requires an explicit profile block'));
      }
      continue;
    }
    if (typeof planBlock.required !== 'boolean') {
      blockers.push(issue('PROFILE_APPLICABILITY_INVALID', `architecture_handoff.plan_context.${profile.block}.required`, 'must be an explicit boolean'));
      continue;
    }
    if (profile.requiredForMetadata && profile.metadataApplicable && planBlock.required !== true) {
      blockers.push(issue('PROFILE_APPLICABILITY_MISMATCH', `architecture_handoff.plan_context.${profile.block}.required`, `${planMetadata.track} requires this profile`));
    }
    if (planBlock.required === false) {
      if (!isText(planBlock.not_applicable_reason)) {
        blockers.push(issue('PROFILE_NOT_APPLICABLE_REASON_REQUIRED', `architecture_handoff.plan_context.${profile.block}.not_applicable_reason`, 'a non-applicable profile requires a concrete reason'));
      }
      if (isObject(reference)) {
        blockers.push(issue('PROFILE_REFERENCE_UNEXPECTED', path, 'must be null when the plan profile is not applicable'));
      }
      continue;
    }
    if (!isObject(reference)) {
      blockers.push(issue('PROFILE_REFERENCE_REQUIRED', path, `required ${profile.block} needs an exact architecture reference`));
      continue;
    }
    if (reference.reference !== `plan_context.${profile.block}`) {
      blockers.push(issue('PROFILE_REFERENCE_TARGET_INVALID', `${path}.reference`, `must target plan_context.${profile.block}`));
    }
    if (!isDeepStrictEqual(
      reference.conformance_invariant_refs,
      planBlock.conformance_invariant_refs,
    )) {
      blockers.push(issue('PROFILE_CONFORMANCE_MISMATCH', `architecture_handoff.plan_context.${profile.block}.conformance_invariant_refs`, 'must exactly match the approved architecture profile invariant references'));
    }
  }
}

export function validateArchitecturePrePlanHandoff({
  gate,
  architecture_context: architectureContext,
  approved_spec: approvedSpec,
  approved_architecture: approvedArchitecture,
  decision_coverage: decisionCoverage,
  repository_topology: repositoryTopology,
} = {}) {
  const blockerValues = [];
  const normalizedGate = normalizedGateResult(gate, blockerValues);
  if (!normalizedGate) {
    return resultFrom(blockerValues, { architecture_required: null });
  }
  const specVerification = addCaught(blockerValues, 'SPEC_INVALID', 'architecture_handoff.approved_spec', () => verifyApprovedArtifactGraph(approvedSpec));
  if (specVerification && approvedSpec.metadata.artifact_kind !== 'spec') blockerValues.push(issue('SPEC_KIND_INVALID', 'architecture_handoff.approved_spec', 'must be an approved spec'));
  if (normalizedGate.required) {
    const contextResult = validateArchitectureContext(architectureContext, { decision_coverage: decisionCoverage });
    blockerValues.push(...contextResult.blockers);
    if (contextResult.valid) {
      const contextGate = classifyArchitectureGate({
        signals: architectureContext.trigger.signals,
        rationale: architectureContext.trigger.rationale,
      });
      if (
        !isDeepStrictEqual(normalizedGate.signals, contextGate.signals) ||
        normalizedGate.rationale !== contextGate.rationale
      ) {
        blockerValues.push(
          issue(
            'TRIGGER_IDENTITY_MISMATCH',
            'architecture_handoff.architecture_context.trigger',
            'must preserve the exact required gate signals and rationale',
          ),
        );
      }
    }
    const architectureVerification = addCaught(blockerValues, 'ARCHITECTURE_ARTIFACT_INVALID', 'architecture_handoff.approved_architecture', () => verifyApprovedArtifactGraph(approvedArchitecture, approvedSpec ? [approvedSpec] : []));
    if (architectureVerification && approvedArchitecture.metadata.artifact_kind !== 'architecture') blockerValues.push(issue('ARCHITECTURE_KIND_INVALID', 'architecture_handoff.approved_architecture', 'must be an approved architecture artifact'));
    if (architectureVerification && !exactParent(approvedArchitecture.metadata, approvedSpec)) blockerValues.push(issue('ARCHITECTURE_PARENT_INVALID', 'architecture_handoff.approved_architecture.parent_references', 'must contain exactly the approved spec'));
    if (architectureVerification && specVerification) {
      for (const field of ['track', 'stack_profile']) {
        if (approvedArchitecture.metadata[field] !== approvedSpec.metadata[field]) {
          blockerValues.push(issue('ARCHITECTURE_METADATA_MISMATCH', `architecture_handoff.approved_architecture.metadata.${field}`, `must match verified approved spec ${field}`));
        }
      }
    }
    if (contextResult.valid && architectureVerification) {
      if (architectureContext.approved_architecture_path !== approvedArchitecture.metadata.repository_relative_path) blockerValues.push(issue('ARCHITECTURE_PATH_MISMATCH', 'architecture_handoff.architecture_context.approved_architecture_path', 'must match the verified architecture artifact path'));
      if (architectureContext.approved_architecture_hash !== approvedArchitecture.metadata.approval_hash) blockerValues.push(issue('ARCHITECTURE_HASH_MISMATCH', 'architecture_handoff.architecture_context.approved_architecture_hash', 'must match the verified architecture artifact hash'));
      if (!isDeepStrictEqual(architectureContext.approved_spec_reference, {
        repository_id: approvedSpec.metadata.owner_repository_id,
        artifact_id: approvedSpec.metadata.artifact_id,
        artifact_kind: approvedSpec.metadata.artifact_kind,
        revision: approvedSpec.metadata.source_revision,
        approval_hash: approvedSpec.metadata.approval_hash,
      })) blockerValues.push(issue('SPEC_REFERENCE_MISMATCH', 'architecture_handoff.architecture_context.approved_spec_reference', 'must match the verified approved spec'));
      for (const field of ['contract_id', 'requirement_id', 'owner_repository_id', 'owner_module_id', 'execution_host_repository_id', 'integration_owner_repository_id']) {
        if (architectureContext[field] !== approvedArchitecture.metadata[field]) blockerValues.push(issue('ARCHITECTURE_METADATA_MISMATCH', `architecture_handoff.architecture_context.${field}`, `must match architecture metadata ${field}`));
      }
      validateIntegrationOwnership({ context: architectureContext, metadata: approvedArchitecture.metadata, topology: repositoryTopology, blockers: blockerValues });
    }
  } else {
    if (architectureContext !== null && architectureContext !== undefined) blockerValues.push(issue('ARCHITECTURE_CONTEXT_UNEXPECTED', 'architecture_handoff.architecture_context', 'must be absent when the gate is not applicable'));
    if (approvedArchitecture !== null && approvedArchitecture !== undefined) blockerValues.push(issue('ARCHITECTURE_ARTIFACT_UNEXPECTED', 'architecture_handoff.approved_architecture', 'must be absent when the gate is not applicable'));
  }
  return resultFrom(blockerValues, { architecture_required: normalizedGate.required });
}

export function validateArchitectureDraftPlanHandoff({
  gate,
  architecture_context: architectureContext,
  approved_spec: approvedSpec,
  approved_architecture: approvedArchitecture,
  decision_coverage: decisionCoverage,
  plan_context: planContext,
  plan_metadata: planMetadata,
  repository_topology: repositoryTopology,
} = {}) {
  const prePlanResult = validateArchitecturePrePlanHandoff({
    gate,
    architecture_context: architectureContext,
    approved_spec: approvedSpec,
    approved_architecture: approvedArchitecture,
    decision_coverage: decisionCoverage,
    repository_topology: repositoryTopology,
  });
  const blockerValues = [...prePlanResult.blockers];
  if (!isObject(planMetadata) || !isText(planMetadata.track) || !isText(planMetadata.stack_profile)) {
    blockerValues.push(issue('PLAN_METADATA_INVALID', 'architecture_handoff.plan_metadata', 'draft validation requires canonical track and stack_profile'));
  } else {
    const trustedMetadata = isObject(approvedSpec?.metadata) &&
      isText(approvedSpec.metadata.track) && isText(approvedSpec.metadata.stack_profile)
      ? approvedSpec.metadata
      : null;
    if (trustedMetadata) {
      for (const field of ['track', 'stack_profile']) {
        if (planMetadata[field] !== trustedMetadata[field]) {
          blockerValues.push(issue('PLAN_METADATA_MISMATCH', `architecture_handoff.plan_metadata.${field}`, `must match verified approved spec ${field}`));
        }
      }
    }
    if (prePlanResult.architecture_required && trustedMetadata && isObject(architectureContext)) {
      validateProfileBinding({
        context: architectureContext,
        planContext,
        planMetadata: trustedMetadata,
        blockers: blockerValues,
      });
    }
  }
  return resultFrom(blockerValues, {
    architecture_required: prePlanResult.architecture_required,
  });
}

export function validateArchitecturePlanHandoff({
  gate,
  architecture_context: architectureContext,
  approved_spec: approvedSpec,
  approved_architecture: approvedArchitecture,
  approved_plan: approvedPlan,
  decision_coverage: decisionCoverage,
  plan_context: planContext,
  repository_topology: repositoryTopology,
} = {}) {
  const draftResult = validateArchitectureDraftPlanHandoff({
    gate,
    architecture_context: architectureContext,
    approved_spec: approvedSpec,
    approved_architecture: approvedArchitecture,
    decision_coverage: decisionCoverage,
    plan_context: planContext,
    plan_metadata: approvedPlan?.metadata,
    repository_topology: repositoryTopology,
  });
  const blockerValues = [...draftResult.blockers];
  if (draftResult.architecture_required === null) {
    return resultFrom(blockerValues, { architecture_required: null });
  }
  const expectedParent = draftResult.architecture_required
    ? approvedArchitecture
    : approvedSpec;
  const planVerification = addCaught(
    blockerValues,
    'PLAN_INVALID',
    'architecture_handoff.approved_plan',
    () => verifyApprovedArtifactGraph(approvedPlan, expectedParent ? [expectedParent] : []),
  );
  if (planVerification && approvedPlan.metadata.artifact_kind !== 'plan') {
    blockerValues.push(issue('PLAN_KIND_INVALID', 'architecture_handoff.approved_plan', 'must be an approved plan'));
  }
  if (planVerification && !exactParent(approvedPlan.metadata, expectedParent)) {
    blockerValues.push(
      issue(
        'PLAN_PARENT_INVALID',
        'architecture_handoff.approved_plan.parent_references',
        draftResult.architecture_required
          ? 'must contain exactly the approved architecture'
          : 'must contain exactly the approved spec for a not-applicable gate',
      ),
    );
  }
  return resultFrom(blockerValues, {
    architecture_required: draftResult.architecture_required,
  });
}

export function validateArchitectureRevision({
  previous_context: previousContext,
  previous_artifact: previousArtifact,
  current_context: currentContext,
  current_artifact: currentArtifact,
  decision_coverage: decisionCoverage,
} = {}) {
  const blockerValues = [];
  const previousResult = validateArchitectureContext(previousContext, { decision_coverage: decisionCoverage });
  const currentResult = validateArchitectureContext(currentContext, { decision_coverage: decisionCoverage });
  blockerValues.push(...previousResult.blockers, ...currentResult.blockers);
  const previousVerified = addCaught(blockerValues, 'PREVIOUS_ARCHITECTURE_INVALID', 'architecture_revision.previous_artifact', () => verifyApprovedArtifact(previousArtifact));
  const currentVerified = addCaught(blockerValues, 'CURRENT_ARCHITECTURE_INVALID', 'architecture_revision.current_artifact', () => verifyApprovedArtifact(currentArtifact));
  if (previousVerified && previousArtifact.metadata.artifact_kind !== 'architecture') blockerValues.push(issue('PREVIOUS_ARCHITECTURE_KIND_INVALID', 'architecture_revision.previous_artifact', 'must be architecture'));
  if (currentVerified && currentArtifact.metadata.artifact_kind !== 'architecture') blockerValues.push(issue('CURRENT_ARCHITECTURE_KIND_INVALID', 'architecture_revision.current_artifact', 'must be architecture'));
  if (previousResult.valid && previousVerified) {
    if (previousContext.approved_architecture_path !== previousArtifact.metadata.repository_relative_path || previousContext.approved_architecture_hash !== previousArtifact.metadata.approval_hash) blockerValues.push(issue('PREVIOUS_ARCHITECTURE_IDENTITY_MISMATCH', 'architecture_revision.previous_context', 'must retain the immutable previous path and hash'));
  }
  if (currentResult.valid && currentVerified) {
    if (currentContext.approved_architecture_path !== currentArtifact.metadata.repository_relative_path || currentContext.approved_architecture_hash !== currentArtifact.metadata.approval_hash) blockerValues.push(issue('CURRENT_ARCHITECTURE_IDENTITY_MISMATCH', 'architecture_revision.current_context', 'must match the new artifact path and hash'));
  }
  if (previousResult.valid && currentResult.valid) {
    if (currentContext.change_control.revision !== previousContext.change_control.revision + 1) blockerValues.push(issue('REVISION_CONTINUITY_INVALID', 'architecture_revision.current_context.change_control.revision', 'must increment the previous revision by one'));
    if (currentContext.change_control.supersedes !== previousArtifact?.metadata?.artifact_id) blockerValues.push(issue('SUPERSEDES_MISMATCH', 'architecture_revision.current_context.change_control.supersedes', 'must identify the previous architecture artifact'));
    if (currentArtifact?.metadata?.supersedes !== previousArtifact?.metadata?.artifact_id) blockerValues.push(issue('ARTIFACT_SUPERSEDES_MISMATCH', 'architecture_revision.current_artifact.metadata.supersedes', 'must identify the previous architecture artifact'));
  }
  return resultFrom(blockerValues);
}

export function validateArchitectureWriteScope(paths) {
  const blockerValues = [];
  if (!Array.isArray(paths) || paths.length === 0) {
    blockerValues.push(issue('WRITE_PATHS_INVALID', 'architecture_write_scope.paths', 'must be a non-empty array'));
    return resultFrom(blockerValues);
  }
  for (const [index, candidate] of paths.entries()) {
    const path = `architecture_write_scope.paths[${index}]`;
    if (!isSafeRepositoryPath(candidate)) {
      blockerValues.push(issue('WRITE_PATH_INVALID', path, 'must be repository-relative'));
    } else if (candidate === '.sdcorejs/conventions' || candidate.startsWith('.sdcorejs/conventions/')) {
      blockerValues.push(issue('CONVENTION_WRITE_FORBIDDEN', path, 'only conventions-sync-write-approved may persist convention rules'));
    } else if (
      !candidate.startsWith('.sdcorejs/docs/architecture/') &&
      !candidate.startsWith('.sdcorejs/architecture/')
    ) {
      blockerValues.push(
        issue(
          'ARCHITECTURE_WRITE_SCOPE_INVALID',
          path,
          'architecture may write only draft and approved architecture artifacts',
        ),
      );
    }
  }
  return resultFrom(blockerValues);
}
