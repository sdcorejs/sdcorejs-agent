import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const REQUIRED_SECTIONS = [
  'schema_version',
  'contract_id',
  'contract_version',
  'status',
  'engine_profile',
  'capability_profile',
  'objective',
  'model_policy',
  'trusted_context',
  'input',
  'output',
  'data',
  'tools',
  'guardrails',
  'approvals',
  'session',
  'evidence',
  'observability',
  'governance',
  'limits',
  'reliability',
  'evals',
  'change_control',
];

const TRUSTED_SOURCES = new Set([
  'authenticated-server',
  'authenticated-job',
  'internal-service',
]);

const CONTRACT_STATUSES = new Set([
  'draft',
  'approved',
  'active',
  'deprecated',
  'retired',
]);

const GENERIC_TOOL_NAMES = new Set([
  'runsql',
  'httprequest',
  'updaterecord',
  'executecode',
  'shell',
  'filesystem',
  'browsercontrol',
]);

const ENGINE_IDS = new Set([
  ['open', 'ai-responses'].join(''),
  ['open', 'ai-agents-sdk'].join(''),
]);

const CAPABILITY_IDS = new Set([
  'reporting-assistant',
  'analytics-assistant',
  'knowledge-assistant',
  'audit-assistant',
  'crm-assistant',
  'workflow-assistant',
  'support-assistant',
  'document-assistant',
  'data-provisioning-assistant',
  'tenant-operations-assistant',
  'approval-coordinator',
  'multi-agent-supervisor',
]);

export function validateAgentContract(input) {
  const errors = [];
  const contract = input?.agent_contract ?? input;

  if (!isObject(contract)) {
    add(errors, 'CONTRACT_REQUIRED', '$', 'A contract object is required.');
    return { valid: errors.length === 0, errors };
  }

  for (const field of REQUIRED_SECTIONS) {
    if (contract[field] === undefined || contract[field] === null) {
      add(errors, 'REQUIRED_SECTION', field, `Required section is missing: ${field}.`);
    }
  }

  validateIdentity(contract, errors);
  validateObjective(contract.objective, errors);
  validateRegistry(contract, errors);
  validateModelPolicy(contract.model_policy, errors);
  validateTrust(contract.trusted_context, errors);
  validateSchema('input', contract.input, errors);
  validateSchema('output', contract.output, errors);
  validateTools(contract.tools, errors);
  validateGuardrails(contract.guardrails, errors);
  validateApprovals(contract.approvals, errors);
  validateState(contract.data, contract.session, errors);
  validateEvidence(contract.evidence, errors);
  validateObservability(contract.observability, errors);
  validateGovernance(contract.governance, errors);
  validateLimits(contract.limits, errors);
  validateReliability(contract.reliability, errors);
  validateEvals(contract.evals, errors);
  validateChangeControl(contract.change_control, errors);

  return { valid: errors.length === 0, errors };
}

function validateIdentity(contract, errors) {
  if (contract.schema_version !== 1) {
    add(errors, 'CONTRACT_IDENTITY_INVALID', 'schema_version', 'Contract schema_version must be 1.');
  }
  if (!isNonEmptyString(contract.contract_id)) {
    add(errors, 'CONTRACT_IDENTITY_INVALID', 'contract_id', 'Contract ID must be a non-empty string.');
  }
  if (!isNonEmptyString(contract.contract_version)) {
    add(errors, 'CONTRACT_IDENTITY_INVALID', 'contract_version', 'Contract version must be a non-empty string.');
  }
  if (!CONTRACT_STATUSES.has(contract.status)) {
    add(errors, 'CONTRACT_IDENTITY_INVALID', 'status', 'Contract status is not supported.');
  }
}

function validateObjective(objective, errors) {
  if (
    !isObject(objective)
    || !isNonEmptyString(objective.outcome)
    || !isNonEmptyStringArray(objective.non_goals)
  ) {
    add(errors, 'OBJECTIVE_INVALID', 'objective', 'Objective requires a bounded outcome and explicit non-goals.');
  }
}

function validateRegistry(contract, errors) {
  if (!ENGINE_IDS.has(contract.engine_profile)) {
    add(errors, 'ENGINE_PROFILE_INVALID', 'engine_profile', 'Engine profile is not present in the approved registry.');
  }
  if (!CAPABILITY_IDS.has(contract.capability_profile)) {
    add(errors, 'CAPABILITY_PROFILE_INVALID', 'capability_profile', 'Capability profile is not present in the approved registry.');
  }
}

function validateModelPolicy(policy, errors) {
  if (
    !isObject(policy)
    || policy.model_id_source !== 'project-policy'
    || policy.selection_owner !== 'application'
    || policy.silent_fallback_allowed !== false
    || policy.billing_source_owner !== 'application'
  ) {
    add(errors, 'MODEL_POLICY_INVALID', 'model_policy', 'Model, provider, fallback, and billing selection must remain application policy.');
  }
}

function validateTrust(context, errors) {
  if (!isObject(context)) {
    add(errors, 'TRUST_CONTEXT_REQUIRED', 'trusted_context', 'Trusted context is required.');
    return;
  }

  if (!TRUSTED_SOURCES.has(context.source)) {
    add(errors, 'TRUST_MODEL_SOURCE', 'trusted_context.source', 'Identity must come from an authenticated application source.');
  }
  if (context.model_may_define_or_override !== false) {
    add(errors, 'TRUST_MODEL_SOURCE', 'trusted_context.model_may_define_or_override', 'Model authority over trusted context must be disabled.');
  }

  const fields = new Set(context.required_fields ?? []);
  for (const required of [
    'tenantId',
    'actorId',
    'principalId',
    'permissions',
    'locale',
    'correlationId',
    'accessScope',
    'environment',
    'approvalAuthority',
    'billingSource',
    'providerSelection',
    'credentialSelection',
  ]) {
    if (!fields.has(required)) {
      add(errors, 'TRUST_FIELD_REQUIRED', 'trusted_context.required_fields', `Trusted field is missing: ${required}.`);
    }
  }
}

function validateSchema(label, schema, errors) {
  if (
    !isObject(schema)
    || schema.type !== 'object'
    || schema.additionalProperties !== false
    || !isObject(schema.properties)
    || !Number.isInteger(schema.max_bytes)
    || schema.max_bytes <= 0
    || schema.redaction_required !== true
  ) {
    add(errors, 'SCHEMA_CONTRACT_INVALID', label, `${label} must be a closed, bounded, redacted object schema.`);
  }
}

function validateTools(tools, errors) {
  if (!Array.isArray(tools)) {
    add(errors, 'TOOLS_REQUIRED', 'tools', 'Tools must be an array.');
    return;
  }

  tools.forEach((tool, index) => {
    const path = `tools.${index}`;
    if (!isObject(tool)) {
      add(errors, 'TOOL_CONTRACT_INVALID', path, 'Tool must be an object.');
      return;
    }

    const normalizedName = String(tool.name ?? '').replace(/[^a-z]/gi, '').toLowerCase();
    if (GENERIC_TOOL_NAMES.has(normalizedName) || tool.business_shaped !== true) {
      add(errors, 'GENERIC_TOOL_FORBIDDEN', `${path}.name`, 'Only business-shaped tools are permitted.');
    }
    if (
      !isNonEmptyString(tool.name)
      || !isNonEmptyString(tool.version)
      || !isNonEmptyString(tool.purpose)
      || !isObject(tool.input_schema)
      || tool.input_schema.type !== 'object'
      || tool.input_schema.additionalProperties !== false
      || !isObject(tool.output_schema)
      || tool.output_schema.type !== 'object'
      || tool.output_schema.additionalProperties !== false
      || !['none', 'read', 'write', 'external'].includes(tool.side_effect)
      || !['low', 'medium', 'high', 'critical'].includes(tool.risk)
      || !isNonEmptyStringArray(tool.required_permissions)
      || tool.tenant_scope_binding !== 'trusted-context'
      || tool.server_authorization !== true
      || !isObject(tool.evidence)
      || typeof tool.evidence.required !== 'boolean'
      || !Number.isInteger(tool.timeout_ms)
      || tool.timeout_ms <= 0
      || !isObject(tool.retry)
      || !isNonEmptyString(tool.retry.class)
      || !Number.isInteger(tool.retry.max_attempts)
      || tool.retry.max_attempts <= 0
      || !Array.isArray(tool.fixture_ids)
      || tool.fixture_ids.length === 0
      || !tool.fixture_ids.every(isNonEmptyString)
      || !isNonEmptyString(tool.audit_category)
      || tool.redaction !== true
      || tool.deterministic_error !== true
      || !['not-required', 'conditional', 'required'].includes(tool.approval)
      || typeof tool.preview !== 'boolean'
      || typeof tool.idempotency !== 'boolean'
      || typeof tool.resource_version !== 'boolean'
      || typeof tool.optimistic_concurrency !== 'boolean'
    ) {
      add(errors, 'TOOL_CONTRACT_INVALID', path, 'Tool schema, scope, evidence, timeout, retry, audit, redaction, errors, and fixtures are required.');
    }

    const sideEffect = tool.side_effect;
    if (sideEffect === 'write' || sideEffect === 'external') {
      if (!['required', 'conditional'].includes(tool.approval)) {
        add(errors, 'APPROVAL_REQUIRED', `${path}.approval`, 'A side effect requires approval policy.');
      }
      if (tool.preview !== true) {
        add(errors, 'PREVIEW_REQUIRED', `${path}.preview`, 'A side effect requires a deterministic preview.');
      }
      if (tool.idempotency !== true) {
        add(errors, 'IDEMPOTENCY_REQUIRED', `${path}.idempotency`, 'A side effect must be idempotent.');
      }
      if (tool.resource_version !== true || tool.optimistic_concurrency !== true) {
        add(errors, 'RESOURCE_VERSION_REQUIRED', `${path}.resource_version`, 'A side effect requires resource versioning and optimistic concurrency.');
      }
    }
  });
}

function validateGuardrails(guardrails, errors) {
  if (
    !isObject(guardrails)
    || guardrails.input !== true
    || guardrails.tool_input !== true
    || guardrails.tool_output !== true
    || guardrails.final_output !== true
    || guardrails.server_authorization_independent !== true
  ) {
    add(errors, 'GUARDRAIL_CONTRACT_INVALID', 'guardrails', 'All guardrail layers and independent server authorization are required.');
  }
}

function validateApprovals(approvals, errors) {
  if (!isObject(approvals)) {
    add(errors, 'APPROVAL_CONTRACT_REQUIRED', 'approvals', 'Approval policy is required.');
    return;
  }
  if (approvals.exact_input_binding !== true || approvals.preview_hash !== true) {
    add(errors, 'APPROVAL_BINDING_REQUIRED', 'approvals.exact_input_binding', 'Approvals must bind exact input and preview.');
  }
  if (approvals.resource_version !== true || approvals.approval_expiry !== true) {
    add(errors, 'APPROVAL_STALENESS_REQUIRED', 'approvals.resource_version', 'Approvals require version and expiry checks.');
  }
  if (approvals.self_approval_allowed !== false) {
    add(errors, 'SELF_APPROVAL_FORBIDDEN', 'approvals.self_approval_allowed', 'Self approval must be disabled.');
  }
  if (approvals.fingerprint_verified !== true) {
    add(errors, 'APPROVAL_FINGERPRINT', 'approvals.fingerprint_verified', 'Approval fingerprint verification is required.');
  }
  for (const binding of [
    'tool_binding',
    'tenant_binding',
    'actor_binding',
    'permission_scope_binding',
    'resource_ids_binding',
    'authority_binding',
  ]) {
    if (approvals[binding] !== true) {
      add(errors, 'APPROVAL_BINDING_REQUIRED', `approvals.${binding}`, `Approval binding is required: ${binding}.`);
    }
  }
}

function validateState(data, session, errors) {
  if (!isObject(data)) {
    add(errors, 'DATA_POLICY_REQUIRED', 'data', 'Data policy is required.');
  } else {
    if (data.secret_serialization_allowed !== false) {
      add(errors, 'STATE_SECRET_FORBIDDEN', 'data.secret_serialization_allowed', 'Secrets must be forbidden in serialized state.');
    }
    if (data.store_provider_state === true || data.provider_conversation_enabled === true) {
      const storage = data.provider_storage_governance;
      if (
        data.provider_storage_governance_approved !== true
        || !isObject(storage)
        || storage.retention_defined !== true
        || storage.deletion_defined !== true
        || storage.residency_defined !== true
        || storage.sensitive_data_reviewed !== true
        || storage.purpose_defined !== true
        || storage.fallback_defined !== true
      ) {
        add(errors, 'PROVIDER_STORAGE_GOVERNANCE', 'data.provider_storage_governance', 'Retained provider state requires complete governance approval.');
      }
    }
  }

  if (!isObject(session)) {
    add(errors, 'SESSION_POLICY_REQUIRED', 'session', 'Session policy is required.');
  } else {
    if (session.cross_tenant_reuse !== 'forbidden') {
      add(errors, 'CROSS_TENANT_SESSION', 'session.cross_tenant_reuse', 'Cross-tenant session reuse must be forbidden.');
    }
    if (
      session.owner !== 'application'
      || session.tenant_actor_binding !== true
      || session.optimistic_concurrency !== true
      || session.approval_checkpoint_separate !== true
      || typeof session.retention_policy !== 'string'
      || typeof session.deletion_policy !== 'string'
      || typeof session.compaction_policy !== 'string'
      || typeof session.resume_policy !== 'string'
      || typeof session.replay_policy !== 'string'
      || typeof session.concurrent_turn_policy !== 'string'
      || typeof session.cancellation_policy !== 'string'
      || typeof session.outage_policy !== 'string'
      || typeof session.cross_device_policy !== 'string'
    ) {
      add(errors, 'SESSION_POLICY_INVALID', 'session', 'Session ownership, tenant/actor binding, concurrency, and approval separation are required.');
    }
  }
}

function validateEvidence(evidence, errors) {
  if (!isObject(evidence)) {
    add(errors, 'EVIDENCE_POLICY_REQUIRED', 'evidence', 'Evidence policy is required.');
    return;
  }
  if (evidence.invented_evidence_allowed !== false) {
    add(errors, 'EVIDENCE_INVENTED', 'evidence.invented_evidence_allowed', 'Invented evidence must be forbidden.');
  }
  if (
    evidence.data_as_of_required !== true
    || evidence.partial_stale_disclosure_required !== true
    || evidence.authoritative_source_required !== true
    || evidence.source_reference_required !== true
    || evidence.retrieval_time_required !== true
    || evidence.tenant_provenance_required !== true
    || evidence.zero_vs_unavailable_required !== true
    || evidence.material_assumptions_required !== true
  ) {
    add(errors, 'EVIDENCE_METADATA_REQUIRED', 'evidence', 'Freshness and partiality metadata are required.');
  }
}

function validateObservability(observability, errors) {
  if (!isObject(observability)) {
    add(errors, 'OBSERVABILITY_POLICY_REQUIRED', 'observability', 'Observability policy is required.');
    return;
  }
  if (
    observability.metadata_only_logging !== true
    || observability.raw_prompt_logging !== false
    || observability.raw_tool_payload_logging !== false
    || observability.chain_of_thought_logging !== false
    || observability.secret_payload_logging !== false
    || observability.durable_audit_separate !== true
    || observability.usage_finops_separate !== true
    || observability.pricing_policy_source !== 'versioned-external'
    || observability.budget_enforcement !== true
  ) {
    add(errors, 'TRACE_SECRET', 'observability', 'Unsafe trace payload logging is enabled.');
  }
}

function validateGovernance(governance, errors) {
  if (
    !isObject(governance)
    || typeof governance.owner !== 'string'
    || typeof governance.classification !== 'string'
    || typeof governance.retention_policy !== 'string'
    || governance.exception_requires_approval !== true
  ) {
    add(errors, 'GOVERNANCE_POLICY_INVALID', 'governance', 'Governance owner, classification, retention, and exception approval are required.');
  }
}

function validateLimits(limits, errors) {
  if (!isObject(limits)) {
    add(errors, 'LIMIT_REQUIRED', 'limits', 'Limits are required.');
    return;
  }
  for (const field of ['max_turns', 'max_tool_calls', 'max_duration_ms', 'max_output_tokens']) {
    if (!Number.isInteger(limits[field]) || limits[field] <= 0) {
      add(errors, 'LIMIT_REQUIRED', `limits.${field}`, `${field} must be a positive integer.`);
    }
  }
  if (!Number.isInteger(limits.max_handoff_depth) || limits.max_handoff_depth < 0) {
    add(errors, 'LIMIT_REQUIRED', 'limits.max_handoff_depth', 'max_handoff_depth must be a non-negative integer.');
  }
}

function validateReliability(reliability, errors) {
  if (
    !isObject(reliability)
    || !Number.isInteger(reliability.read_retries)
    || reliability.read_retries < 0
    || reliability.ambiguous_write_retry !== false
    || reliability.timeouts_required !== true
    || reliability.cancellation_defined !== true
    || reliability.reconciliation_defined !== true
  ) {
    add(errors, 'RELIABILITY_POLICY_INVALID', 'reliability', 'Retry, timeout, cancellation, and reconciliation policy is required.');
  }
}

function validateEvals(evals, errors) {
  if (
    !isObject(evals)
    || evals.deterministic_gate_required !== true
    || evals.offline_required !== true
    || evals.security_thresholds?.unauthorized_actions !== 0
    || evals.security_thresholds?.cross_tenant_disclosures !== 0
    || evals.security_thresholds?.unapproved_side_effects !== 0
    || evals.security_thresholds?.secret_leakage !== 0
  ) {
    add(errors, 'DETERMINISTIC_GATE_REQUIRED', 'evals.deterministic_gate_required', 'A deterministic eval gate is required.');
  }
}

function validateChangeControl(changeControl, errors) {
  if (
    !isObject(changeControl)
    || typeof changeControl.approved_spec_hash !== 'string'
    || typeof changeControl.approved_plan_hash !== 'string'
    || typeof changeControl.rollback_owner !== 'string'
  ) {
    add(errors, 'CHANGE_CONTROL_INVALID', 'change_control', 'Approved hashes and rollback owner are required.');
  }
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNonEmptyStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString);
}

function add(errors, code, path, message) {
  errors.push({ code, path, message });
}

async function runCli() {
  const file = process.argv[2];
  if (!file) {
    process.stderr.write('Usage: node validate-agent-contract.mjs <contract.json>\n');
    process.exitCode = 2;
    return;
  }

  try {
    const input = JSON.parse(await readFile(resolve(file), 'utf8'));
    const result = validateAgentContract(input);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = result.valid ? 0 : 1;
  } catch (error) {
    process.stdout.write(`${JSON.stringify({
      valid: false,
      errors: [{
        code: 'CONTRACT_READ_FAILED',
        path: '$',
        message: error instanceof Error ? error.message : String(error),
      }],
    }, null, 2)}\n`);
    process.exitCode = 2;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await runCli();
}
