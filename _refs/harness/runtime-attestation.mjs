const STATUSES = new Set(['supported', 'unsupported', 'unknown']);
const OBSERVABLE_CAPABILITIES = Object.freeze([
  'subagents',
  'concurrent_dispatch',
  'agent_cwd_binding',
  'native_worktree',
  'manual_git_worktree',
  'cancellation',
  'result_ref',
  'workspace_isolation',
]);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeStatus(value) {
  return STATUSES.has(value) ? value : 'unknown';
}

function evidenceIsValid(value) {
  return isRecord(value) &&
    typeof value.source === 'string' && value.source.trim() !== '' &&
    typeof value.detail === 'string' && value.detail.trim() !== '';
}

function statusBoolean(value) {
  if (value === 'supported') return true;
  if (value === 'unsupported') return false;
  return undefined;
}

function derivedWorkspaceStatus(capabilities) {
  if (capabilities.native_worktree === 'supported') return 'supported';
  if (
    capabilities.manual_git_worktree === 'supported' &&
    capabilities.agent_cwd_binding === 'supported'
  ) return 'supported';
  if (
    capabilities.native_worktree === 'unsupported' &&
    (
      capabilities.manual_git_worktree === 'unsupported' ||
      capabilities.agent_cwd_binding === 'unsupported'
    )
  ) return 'unsupported';
  return normalizeStatus(capabilities.workspace_isolation);
}

export function validateRuntimeAttestation(attestation = {}) {
  const errors = [];
  const observedCapabilities = new Set();
  if (!isRecord(attestation)) return ['runtime attestation must be an object'];
  if (attestation.schema_version !== 1) errors.push('schema_version must be 1');
  if (typeof attestation.adapter !== 'string' || attestation.adapter.trim() === '') {
    errors.push('adapter must be a non-empty string');
  }
  if (!isRecord(attestation.capabilities)) {
    errors.push('capabilities must be an object');
    return errors;
  }
  for (const capability of OBSERVABLE_CAPABILITIES) {
    if (!STATUSES.has(attestation.capabilities[capability])) {
      errors.push(`${capability} must be supported, unsupported, or unknown`);
    }
  }
  if (!Array.isArray(attestation.observations)) {
    errors.push('observations must be an array');
  } else {
    for (const [index, observation] of attestation.observations.entries()) {
      if (!isRecord(observation) || !OBSERVABLE_CAPABILITIES.includes(observation.capability)) {
        errors.push(`observations[${index}] has an unknown capability`);
        continue;
      }
      if (observedCapabilities.has(observation.capability)) {
        errors.push(`duplicate observation for ${observation.capability}`);
      }
      observedCapabilities.add(observation.capability);
      if (!STATUSES.has(observation.status)) {
        errors.push(`observations[${index}] has an invalid status`);
      }
      if (!evidenceIsValid(observation.evidence)) {
        errors.push(`observations[${index}] requires evidence`);
      }
      if (attestation.capabilities[observation.capability] !== observation.status) {
        errors.push(`observation projection differs for ${observation.capability}`);
      }
    }
  }
  for (const capability of OBSERVABLE_CAPABILITIES) {
    if (
      capability !== 'workspace_isolation' &&
      attestation.capabilities[capability] === 'supported' &&
      !observedCapabilities.has(capability)
    ) errors.push(`${capability} support requires current-session runtime evidence`);
  }
  if (
    attestation.capabilities.workspace_isolation === 'supported' &&
    !observedCapabilities.has('workspace_isolation')
  ) {
    const nativeEvidence =
      attestation.capabilities.native_worktree === 'supported' &&
      observedCapabilities.has('native_worktree');
    const manualEvidence =
      attestation.capabilities.manual_git_worktree === 'supported' &&
      observedCapabilities.has('manual_git_worktree') &&
      attestation.capabilities.agent_cwd_binding === 'supported' &&
      observedCapabilities.has('agent_cwd_binding');
    if (!nativeEvidence && !manualEvidence) {
      errors.push('workspace_isolation support requires current-session runtime evidence');
    }
  }
  if (
    !Number.isInteger(attestation.effective_max_concurrency) ||
    attestation.effective_max_concurrency < 1
  ) errors.push('effective_max_concurrency must be a positive integer');
  if (
    attestation.capabilities.concurrent_dispatch === 'supported' &&
    attestation.capabilities.subagents !== 'supported'
  ) errors.push('concurrent_dispatch requires supported subagents');
  if (
    attestation.capabilities.concurrent_dispatch === 'supported' &&
    attestation.effective_max_concurrency < 2
  ) errors.push('supported concurrent_dispatch requires max_concurrency of at least 2');
  if (
    attestation.capabilities.concurrent_dispatch !== 'supported' &&
    attestation.effective_max_concurrency !== 1
  ) errors.push('non-concurrent execution must have effective_max_concurrency 1');
  if (
    attestation.capabilities.workspace_isolation !==
    derivedWorkspaceStatus(attestation.capabilities)
  ) errors.push('workspace_isolation does not match worktree and worker-CWD evidence');
  return [...new Set(errors)].sort();
}

export function attestRuntimeCapabilities({
  adapter,
  defaults = {},
  observations = {},
  max_concurrency: maxConcurrency = null,
} = {}) {
  if (typeof adapter !== 'string' || adapter.trim() === '') {
    throw new TypeError('adapter must be a non-empty string');
  }
  if (!isRecord(defaults)) throw new TypeError('defaults must be an object');
  if (!isRecord(observations)) throw new TypeError('observations must be an object');
  for (const capability of Object.keys(observations)) {
    if (!OBSERVABLE_CAPABILITIES.includes(capability)) {
      throw new TypeError(`unknown runtime capability observation: ${capability}`);
    }
  }
  if (maxConcurrency !== null && (!Number.isInteger(maxConcurrency) || maxConcurrency < 1)) {
    throw new TypeError('max_concurrency must be a positive integer or null');
  }

  const capabilities = Object.fromEntries(
    OBSERVABLE_CAPABILITIES.map((capability) => [
      capability,
      normalizeStatus(defaults[capability]),
    ]),
  );
  const evidence = [];
  for (const [capability, observation] of Object.entries(observations)) {
    if (!isRecord(observation) || !STATUSES.has(observation.status)) {
      throw new TypeError(`${capability} observation requires a tri-state status`);
    }
    if (!evidenceIsValid(observation.evidence)) {
      throw new TypeError(`${capability} observation requires evidence`);
    }
    capabilities[capability] = observation.status;
    evidence.push({
      capability,
      status: observation.status,
      evidence: {
        source: observation.evidence.source.trim(),
        detail: observation.evidence.detail.trim(),
      },
    });
  }

  if (!Object.hasOwn(observations, 'workspace_isolation')) {
    capabilities.workspace_isolation = derivedWorkspaceStatus(capabilities);
  }
  const effectiveMaxConcurrency = capabilities.concurrent_dispatch === 'supported'
    ? (maxConcurrency ?? 1)
    : 1;
  const attestation = {
    schema_version: 1,
    adapter: adapter.trim(),
    capabilities,
    effective_max_concurrency: effectiveMaxConcurrency,
    observations: evidence.sort((left, right) =>
      left.capability.localeCompare(right.capability, 'en')),
  };
  const errors = validateRuntimeAttestation(attestation);
  if (errors.length > 0) {
    throw new Error(`invalid runtime attestation: ${errors.join('; ')}`);
  }
  return attestation;
}

export function toParallelRuntimeCapabilities(attestation = {}) {
  const errors = validateRuntimeAttestation(attestation);
  if (errors.length > 0) {
    throw new Error(`invalid runtime attestation: ${errors.join('; ')}`);
  }
  const capabilities = attestation.capabilities;
  return {
    runtime: attestation.adapter,
    supports_subagents: statusBoolean(capabilities.subagents),
    supports_parallel_dispatch: statusBoolean(capabilities.concurrent_dispatch),
    supports_agent_cwd: statusBoolean(capabilities.agent_cwd_binding),
    supports_native_worktree: statusBoolean(capabilities.native_worktree),
    supports_manual_worktree: statusBoolean(capabilities.manual_git_worktree),
    supports_result_ref: statusBoolean(capabilities.result_ref),
    supports_cancellation: statusBoolean(capabilities.cancellation),
    effective_max_concurrency: attestation.effective_max_concurrency,
  };
}
