import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  verifyApprovedArtifact,
  verifyApprovedArtifactGraph,
} from '../shared/approved-artifact.mjs';
import { resolveArtifactOwner } from '../shared/repository-contract.mjs';
import { systemRegistry } from '../shared/system-registry.mjs';
import { validateAgentContract } from './validate-agent-contract.mjs';

const manifest = JSON.parse(
  readFileSync(new URL('./manifest.json', import.meta.url), 'utf8'),
);
const GIT_REVISION = /^[a-f0-9]{40}$/u;
const HASH_IDENTITY = /^sha256:v1:[a-f0-9]{64}$/u;
const GENERIC_RAW_TOOLS = new Set([
  'runsql',
  'httprequest',
  'updaterecord',
  'executecode',
  'shell',
  'filesystem',
  'browsercontrol',
]);
const TRUST_FIELDS = new Set([
  'tenantId',
  'actorId',
  'principalId',
  'roles',
  'permissions',
  'locale',
  'correlationId',
  'accessScope',
  'approvalAuthority',
  'providerSelection',
  'credentialSelection',
]);
const DOWNSTREAM_KINDS = Object.freeze({
  test: 'test-plan',
  review: 'review-report',
  repair: 'repair-report',
  ship: 'release-evidence',
});

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return typeof value === 'string'
    ? value.replace(/\r\n?/gu, '\n').normalize('NFC')
    : value;
}

function stableJson(value) {
  return JSON.stringify(canonicalize(value));
}

function hashIdentity(value) {
  return `sha256:v1:${createHash('sha256')
    .update(stableJson(value), 'utf8')
    .digest('hex')}`;
}

function isRelativePath(value) {
  return (
    typeof value === 'string' &&
    value !== '' &&
    !value.startsWith('/') &&
    !value.startsWith('\\') &&
    !/^[A-Za-z]:[\\/]/u.test(value) &&
    !value.split(/[\\/]/u).includes('..')
  );
}

function runtimeError(errors, code, field, message) {
  errors.push({ code, field, message });
}

export function resolveAiAgentProfiles({
  engine_profile: engineProfile,
  capability_profile: capabilityProfile,
} = {}) {
  const engine = manifest.engines.find(({ id }) => id === engineProfile);
  const capability = manifest.capability_profiles.find(
    ({ id }) => id === capabilityProfile,
  );
  if (!engine) {
    throw new TypeError(`unknown AI-agent engine profile: ${engineProfile}`);
  }
  if (!capability) {
    throw new TypeError(
      `unknown AI-agent capability profile: ${capabilityProfile}`,
    );
  }
  return {
    engine_profile: engine.id,
    engine_profile_path: engine.path,
    capability_profile: capability.id,
    capability_profile_path: capability.path,
  };
}

export function approvalFingerprint({ trusted_context: trustedContext, tool_call: toolCall } = {}) {
  return hashIdentity({
    tenantId: trustedContext?.tenantId,
    actorId: trustedContext?.actorId,
    permissions: [...(trustedContext?.permissions ?? [])].sort(),
    tool: toolCall?.name,
    tool_version: toolCall?.version,
    input: toolCall?.input,
    resource_version: toolCall?.resource_version,
  });
}

export function validateAiAgentRuntimeRequest({
  contract,
  trusted_context: trustedContext,
  model_claims: modelClaims = {},
  session,
  tool_call: toolCall,
  approval,
  now = new Date().toISOString(),
} = {}) {
  const errors = [];
  const contractValidation = validateAgentContract(contract);
  for (const error of contractValidation.errors) {
    runtimeError(
      errors,
      `CONTRACT_${error.code}`,
      error.path,
      error.message,
    );
  }
  if (
    !trustedContext ||
    trustedContext.server_attested !== true ||
    !['authenticated-server', 'authenticated-job', 'internal-service'].includes(
      trustedContext.source,
    )
  ) {
    runtimeError(
      errors,
      'TRUSTED_SERVER_CONTEXT_REQUIRED',
      'trusted_context',
      'Trusted identity must come from an authenticated server/application source.',
    );
  }
  for (const field of [
    'tenantId',
    'actorId',
    'roles',
    'permissions',
    'locale',
    'correlationId',
    'accessScope',
  ]) {
    const value = trustedContext?.[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim() === '') ||
      (Array.isArray(value) && value.length === 0)
    ) {
      runtimeError(
        errors,
        'TRUSTED_CONTEXT_FIELD_REQUIRED',
        `trusted_context.${field}`,
        `Trusted context field is required: ${field}.`,
      );
    }
  }
  for (const field of Object.keys(modelClaims ?? {})) {
    if (TRUST_FIELDS.has(field)) {
      runtimeError(
        errors,
        'MODEL_TRUST_CLAIM_FORBIDDEN',
        `model_claims.${field}`,
        'Model/user input cannot define trusted identity or authority.',
      );
    }
  }
  if (
    session?.tenantId !== trustedContext?.tenantId ||
    session?.actorId !== trustedContext?.actorId
  ) {
    runtimeError(
      errors,
      'CROSS_TENANT_SESSION',
      'session',
      'Session tenant/actor binding does not match current trusted context.',
    );
  }

  const normalizedToolName = String(toolCall?.name ?? '')
    .replace(/[^a-z0-9]/giu, '')
    .toLowerCase();
  if (GENERIC_RAW_TOOLS.has(normalizedToolName)) {
    runtimeError(
      errors,
      'GENERIC_TOOL_FORBIDDEN',
      'tool_call.name',
      'Generic raw tools lack a domain authorization boundary.',
    );
  }
  const toolContract = contract?.tools?.find(
    ({ name, version }) =>
      name === toolCall?.name && version === toolCall?.version,
  );
  if (!toolContract) {
    runtimeError(
      errors,
      'TOOL_NOT_DECLARED',
      'tool_call',
      'The exact tool name/version is not declared by the approved contract.',
    );
  } else {
    if (
      toolContract.business_shaped !== true ||
      toolContract.server_authorization !== true ||
      toolContract.tenant_scope_binding !== 'trusted-context'
    ) {
      runtimeError(
        errors,
        'DOMAIN_AUTHORIZATION_BOUNDARY_REQUIRED',
        'tool_call',
        'Tools must be domain-shaped and independently authorized server-side.',
      );
    }
    const permissionSet = new Set(trustedContext?.permissions ?? []);
    if (
      !toolContract.required_permissions.every((permission) =>
        permissionSet.has(permission))
    ) {
      runtimeError(
        errors,
        'PERMISSION_DENIED',
        'trusted_context.permissions',
        'Trusted permission set does not authorize the tool.',
      );
    }
    if (['write', 'external'].includes(toolContract.side_effect)) {
      if (!approval || approval.approved !== true) {
        runtimeError(
          errors,
          'APPROVAL_REQUIRED',
          'approval',
          'A current exact-input approval is required.',
        );
      } else {
        if (
          approval.tenantId !== trustedContext?.tenantId ||
          approval.actorId !== trustedContext?.actorId ||
          stableJson([...(approval.permissions ?? [])].sort()) !==
            stableJson([...(trustedContext?.permissions ?? [])].sort())
        ) {
          runtimeError(
            errors,
            'APPROVAL_AUTHORITY_MISMATCH',
            'approval',
            'Approval tenant, actor, or permission scope changed.',
          );
        }
        if (
          approval.resource_version !== toolCall?.resource_version ||
          approval.exact_input_hash !==
            approvalFingerprint({
              trusted_context: trustedContext,
              tool_call: toolCall,
            })
        ) {
          runtimeError(
            errors,
            'APPROVAL_INPUT_MISMATCH',
            'approval.exact_input_hash',
            'Approved input or resource version no longer matches.',
          );
        }
        if (
          Number.isNaN(Date.parse(approval.expires_at ?? '')) ||
          Date.parse(approval.expires_at) <= Date.parse(now)
        ) {
          runtimeError(
            errors,
            'APPROVAL_EXPIRED',
            'approval.expires_at',
            'Approval is missing a current expiry.',
          );
        }
      }
    }
  }
  return { allowed: errors.length === 0, errors };
}

export function resolveAiAgentArtifactOwner({
  scope,
  module,
  portal,
  execution_host_repository_id: executionHostRepositoryId,
  target_paths: targetPaths,
} = {}) {
  if (
    !Array.isArray(targetPaths) ||
    targetPaths.length === 0 ||
    targetPaths.some((targetPath) => !isRelativePath(targetPath))
  ) {
    throw new TypeError('AI-agent target_paths must be non-empty repository-relative paths');
  }
  const owner = resolveArtifactOwner({
    artifact_kind: 'plan',
    scope,
    module,
    portal,
    execution_host_repository_id: executionHostRepositoryId,
  });
  if (
    scope === 'module' &&
    (module?.available !== true || module?.writable !== true)
  ) {
    return {
      status: 'blocked',
      ...owner,
      target_paths: [],
      blockers: [
        module?.available !== true
          ? 'module AI-agent owner is unavailable; portal fallback is forbidden'
          : 'module AI-agent owner is not writable; portal fallback is forbidden',
      ],
    };
  }
  return {
    status: 'resolved',
    ...owner,
    target_paths: [...targetPaths],
    blockers: [],
  };
}

function validateDownstreamArtifacts(artifacts, metadata) {
  if (!artifacts || typeof artifacts !== 'object') {
    throw new TypeError('downstream_artifacts are required');
  }
  for (const [stage, expectedKind] of Object.entries(DOWNSTREAM_KINDS)) {
    const artifact = artifacts[stage];
    if (
      !artifact ||
      artifact.artifact_kind !== expectedKind ||
      !systemRegistry.artifact_kinds.includes(artifact.artifact_kind) ||
      typeof artifact.artifact_id !== 'string' ||
      artifact.repository_id !== metadata.owner_repository_id ||
      artifact.module_id !== metadata.owner_module_id ||
      !isRelativePath(artifact.repository_relative_path) ||
      !GIT_REVISION.test(artifact.revision ?? '') ||
      !HASH_IDENTITY.test(artifact.artifact_hash ?? '')
    ) {
      throw new Error(`invalid ${stage} downstream artifact identity`);
    }
  }
}

function validateVerificationEvidence(offline, live) {
  if (
    offline?.evidence_class !== 'GOLDEN' ||
    !['PASSED', 'FAILED', 'NOT RUN'].includes(offline?.result) ||
    !Array.isArray(offline?.evidence_refs)
  ) {
    throw new Error('offline deterministic verification evidence is invalid');
  }
  if (live?.evidence_class !== 'LIVE_AGENT') {
    throw new Error('live provider verification must use LIVE_AGENT evidence class');
  }
  if (live.credentials_available === false) {
    if (live.result !== 'NOT RUN' || live.evidence !== null) {
      throw new Error(
        'live provider validation without credentials must be NOT RUN with no evidence',
      );
    }
    return;
  }
  if (!['PASSED', 'FAILED', 'NOT RUN'].includes(live.result)) {
    throw new Error('live provider verification result is invalid');
  }
  if (
    live.result === 'PASSED' &&
    (
      !live.evidence ||
      !HASH_IDENTITY.test(live.evidence.artifact_hash ?? '') ||
      !GIT_REVISION.test(live.evidence.revision ?? '')
    )
  ) {
    throw new Error('live provider pass requires current durable evidence');
  }
}

export function createAiAgentExecutionContext(input = {}) {
  const source = structuredClone(input);
  delete source.context_hash;
  const metadata = source.metadata;
  if (
    metadata?.schema_version !== 1 ||
    metadata.track !== 'ai-agent' ||
    metadata.stack_profile !== 'ai-agent' ||
    metadata.ownership_scope !== 'module' ||
    metadata.owner_repository_role !== 'module' ||
    typeof metadata.owner_module_id !== 'string' ||
    !GIT_REVISION.test(metadata.source_revision ?? '') ||
    !Array.isArray(metadata.target_paths) ||
    metadata.target_paths.some((targetPath) => !isRelativePath(targetPath))
  ) {
    throw new Error('invalid AI-agent execution metadata');
  }
  const profiles = resolveAiAgentProfiles({
    engine_profile: source.engine_profile,
    capability_profile: source.capability_profile,
  });
  const spec = verifyApprovedArtifact(source.approved_spec);
  const plan = verifyApprovedArtifactGraph(source.approved_plan, [
    source.approved_spec,
  ]);
  for (const artifact of [spec.metadata, plan.metadata]) {
    if (
      artifact.track !== 'ai-agent' ||
      artifact.contract_id !== metadata.contract_id ||
      artifact.requirement_id !== metadata.requirement_id ||
      artifact.owner_repository_id !== metadata.owner_repository_id ||
      artifact.owner_module_id !== metadata.owner_module_id
    ) {
      throw new Error('approved AI-agent artifact identity does not match execution metadata');
    }
  }
  validateDownstreamArtifacts(source.downstream_artifacts, metadata);
  validateVerificationEvidence(
    source.offline_verification,
    source.live_provider_verification,
  );
  const context = {
    schema_version: 1,
    metadata,
    ...profiles,
    approved_spec: {
      repository_id: spec.metadata.owner_repository_id,
      artifact_id: spec.metadata.artifact_id,
      artifact_kind: spec.metadata.artifact_kind,
      repository_relative_path: spec.metadata.repository_relative_path,
      revision: spec.metadata.source_revision,
      approval_hash: source.approved_spec.metadata.approval_hash,
    },
    approved_plan: {
      repository_id: plan.metadata.owner_repository_id,
      artifact_id: plan.metadata.artifact_id,
      artifact_kind: plan.metadata.artifact_kind,
      repository_relative_path: plan.metadata.repository_relative_path,
      revision: plan.metadata.source_revision,
      approval_hash: source.approved_plan.metadata.approval_hash,
    },
    downstream_artifacts: source.downstream_artifacts,
    offline_verification: source.offline_verification,
    live_provider_verification: source.live_provider_verification,
  };
  return {
    ...canonicalize(context),
    context_hash: hashIdentity(context),
  };
}
