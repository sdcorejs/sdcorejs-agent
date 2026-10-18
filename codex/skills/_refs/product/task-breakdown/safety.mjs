// Pure safety helpers for the sdcorejs-product task-breakdown mode.
// No I/O to the target repository, the network or a tracker: callers pass data in
// and act on the result. Approval identity reuses the shared approved-artifact helper.
import { createApprovedArtifact, verifyApprovedArtifact } from '../../shared/approved-artifact.mjs';
import { isSafeProjectSegment } from '../../shared/artifact-paths.mjs';

export const REDACTED = '[REDACTED]';
export const WRITE_OPERATIONS = Object.freeze(['create', 'update']);
export const WRITE_FORMATS = Object.freeze(['text', 'rich-json']);
export const FORBIDDEN_WRITE_FIELDS = Object.freeze([
  'status',
  'state',
  'workflow_state',
  'transition',
  'transitions',
  'resolution',
  'delete',
]);

const HEX_40 = /^[a-f0-9]{40}$/u;
const FINGERPRINT = /^sha256:[a-f0-9]{64}$/u;
const TASK_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[A-Z0-9]+(?:-[A-Z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*\/\d{2}$/u;

// Order matters: multi-line and wrapping patterns run before the tokens they contain.
const SECRET_PATTERNS = Object.freeze([
  { kind: 'private-key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gu },
  { kind: 'bearer-token', pattern: /\bBearer\s+[A-Za-z0-9._~+/-]{16,}=*/giu },
  { kind: 'jwt', pattern: /\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/gu },
  { kind: 'url-credentials', pattern: /(\b[a-z][a-z0-9+.-]*:\/\/)[^\s:/@]+:[^\s@/]+(?=@)/giu, keep: 1 },
  { kind: 'cloud-access-key', pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/gu },
  { kind: 'provider-token', pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{10,}|(?:sk|pk)-(?:live|test)-[A-Za-z0-9]{12,})\b/gu },
  {
    kind: 'credential-assignment',
    pattern: /(\b(?:api[_-]?key|secret|token|password|passwd|client[_-]?secret|access[_-]?key)\b\s*[:=]\s*["']?)([^\s"']{8,})/giu,
    keep: 1,
  },
]);

function lineOf(text, index) {
  let line = 1;
  for (let position = 0; position < index; position += 1) if (text[position] === '\n') line += 1;
  return line;
}

/**
 * Report secret-shaped values by location and kind and return redacted text.
 * Findings never contain the matched value.
 */
export function scanSecrets(text, { source = 'unknown', field } = {}) {
  let redacted = String(text ?? '');
  const findings = [];
  for (const { kind, pattern, keep } of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    redacted = redacted.replace(pattern, (...args) => {
      const offset = args.at(-2);
      findings.push({ source, ...(field === undefined ? {} : { field }), kind, line: lineOf(redacted, offset) });
      return keep ? `${args[keep]}${REDACTED}` : REDACTED;
    });
  }
  return { findings, redacted };
}

/** Recursively redact strings inside plain data (config frontmatter, payloads, subagent output). */
export function redactValue(value, { source = 'unknown' } = {}) {
  const findings = [];
  const walk = (current, field) => {
    if (typeof current === 'string') {
      const result = scanSecrets(current, { source, field: field || '(root)' });
      findings.push(...result.findings);
      return result.redacted;
    }
    if (Array.isArray(current)) return current.map((item, index) => walk(item, `${field}[${index}]`));
    if (current && typeof current === 'object') {
      return Object.fromEntries(Object.entries(current).map(([key, item]) => [key, walk(item, field ? `${field}.${key}` : key)]));
    }
    return current;
  };
  return { value: walk(value, ''), findings };
}

/** Deterministic JSON with sorted object keys; array order is preserved. */
export function stableJson(value) {
  const canonical = (current) => {
    if (Array.isArray(current)) return current.map(canonical);
    if (current && typeof current === 'object') {
      return Object.fromEntries(Object.keys(current).sort().map((key) => [key, canonical(current[key])]));
    }
    return current;
  };
  return JSON.stringify(canonical(value));
}

function assertWriteFields(fields, path) {
  if (fields === undefined) return;
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) throw new TypeError(`${path}.fields must be an object`);
  for (const key of Object.keys(fields)) {
    if (FORBIDDEN_WRITE_FIELDS.includes(key.toLowerCase())) {
      throw new TypeError(`${path}.fields.${key} is forbidden: the task-breakdown mode never changes ticket ${key}`);
    }
  }
}

/**
 * Normalize and validate the write plan the user approves. Only create and update
 * operations exist; status, transition and delete fields are rejected.
 */
export function buildWritePlan({ project_slug: projectSlug, scope, run_id: runId, ops } = {}) {
  if (!isSafeProjectSegment(projectSlug)) throw new TypeError('project_slug must be a safe project segment');
  if (!isSafeProjectSegment(scope)) throw new TypeError('scope must be a safe project segment');
  if (typeof runId !== 'string' || runId.trim() === '') throw new TypeError('run_id must be a non-empty string');
  if (!Array.isArray(ops) || ops.length === 0) throw new TypeError('ops must be a non-empty array');
  const normalized = ops.map((operation, index) => {
    const path = `ops[${index}]`;
    if (!WRITE_OPERATIONS.includes(operation?.op)) throw new TypeError(`${path}.op must be one of ${WRITE_OPERATIONS.join(', ')}`);
    if (!TASK_ID.test(operation.task_id ?? '')) throw new TypeError(`${path}.task_id is not a stable task id`);
    if (operation.op === 'update' && !(typeof operation.ticket_key === 'string' && operation.ticket_key.trim())) {
      throw new TypeError(`${path}.ticket_key is required for update`);
    }
    if (operation.format !== undefined || operation.op === 'update') {
      if (!WRITE_FORMATS.includes(operation.format)) throw new TypeError(`${path}.format must be one of ${WRITE_FORMATS.join(', ')}`);
    }
    if (operation.op === 'update') {
      const prints = operation.fingerprints;
      const inside = prints?.inside;
      if (!prints || typeof prints !== 'object' || !FINGERPRINT.test(prints.outside ?? '') || !(inside === null || FINGERPRINT.test(inside ?? ''))) {
        throw new TypeError(`${path}.fingerprints must hold the inside (or null) and outside fingerprints taken at approval`);
      }
    }
    if (operation.op === 'create' && !(typeof operation.title === 'string' && operation.title.trim())) {
      throw new TypeError(`${path}.title is required for create`);
    }
    assertWriteFields(operation.fields, path);
    return structuredClone(operation);
  });
  normalized.sort((left, right) => left.task_id.localeCompare(right.task_id) || left.op.localeCompare(right.op));
  const redaction = redactValue(normalized, { source: 'write-plan' });
  return {
    schema_version: 1,
    project_slug: projectSlug,
    scope,
    run_id: runId,
    ops: redaction.value,
    secret_findings: redaction.findings,
  };
}

function runSegment(runId) {
  return runId.toLowerCase().replace(/[^a-z0-9]+/gu, '-').replace(/^-|-$/gu, '') || 'run';
}

/**
 * Bind the approved operations to this run with the shared approval identity.
 * A target repository without a Git revision cannot carry an approval, so the
 * tracker write falls back to copy-paste drafts.
 */
export function approveWritePlan({
  plan,
  owner_repository_id: ownerRepositoryId,
  owner_repository_role: ownerRepositoryRole = 'standalone',
  owner_module_id: ownerModuleId = null,
  source_revision: sourceRevision,
  repository_relative_path: repositoryRelativePath,
  approved_by: approvedBy,
  approved_at: approvedAt,
} = {}) {
  if (!plan || !Array.isArray(plan.ops)) throw new TypeError('plan must come from buildWritePlan');
  if (!HEX_40.test(sourceRevision ?? '')) {
    return {
      status: 'fallback',
      fallback: 'copy-paste',
      reason: 'the target repository has no Git revision, so the write plan cannot be approved; render drafts for copy-paste instead',
    };
  }
  const artifact = createApprovedArtifact({
    metadata: {
      schema_version: 1,
      artifact_id: `write-plan-${plan.project_slug}-${plan.scope}-${runSegment(plan.run_id)}`,
      artifact_kind: 'task-breakdown',
      contract_id: `task-breakdown:${plan.project_slug}:${plan.scope}`,
      requirement_id: plan.scope,
      change_ref: `task-breakdown-${plan.project_slug}-${plan.scope}`,
      track: 'product',
      stack_profile: 'product',
      owner_repository_id: ownerRepositoryId,
      owner_repository_role: ownerRepositoryRole,
      owner_module_id: ownerModuleId,
      approval_source: 'explicit-user-choice',
      approved_at: approvedAt,
      approved_by: approvedBy,
      repository_relative_path: repositoryRelativePath,
      source_revision: sourceRevision,
      parent_repository_id: null,
      parent_references: [],
      supersedes: null,
      run_id: plan.run_id,
    },
    body: stableJson(plan.ops),
  });
  return { status: 'approved', artifact };
}

/** Verify the approval right before writing: same run, same operations, untampered identity. */
export function verifyWritePlan({ approval, plan, run_id: runId } = {}) {
  if (approval?.status !== 'approved') return { valid: false, reason: 'write plan is not approved' };
  try {
    verifyApprovedArtifact(approval.artifact);
  } catch (error) {
    return { valid: false, reason: `approval identity is invalid: ${error.message}` };
  }
  const metadata = approval.artifact.metadata;
  if (metadata.run_id !== runId || plan?.run_id !== runId) return { valid: false, reason: 'approval belongs to a different run' };
  if (metadata.contract_id !== `task-breakdown:${plan.project_slug}:${plan.scope}`) {
    return { valid: false, reason: 'approval belongs to a different project or scope' };
  }
  if (approval.artifact.body !== stableJson(plan.ops)) return { valid: false, reason: 'operations changed after approval' };
  return { valid: true, reason: null };
}
