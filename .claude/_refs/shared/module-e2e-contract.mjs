import {
  resolveRequirementOwnership,
  validateModuleE2EManifest,
} from './repository-contract.mjs';
import { systemRegistry } from './system-registry.mjs';

const REVISION = /^[a-f0-9]{40}$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const LOGICAL_ID = /^[a-z][a-z0-9._-]*$/u;
const RUN_RESULTS = new Set(['PASSED', 'FAILED', 'SKIPPED', 'NOT RUN']);
const EVIDENCE_CLASSES = new Set([
  'unit',
  'golden',
  'container',
  'full-e2e',
  'live-agent',
  'supplemental-smoke',
]);

function repositoryRelative(value, field) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.startsWith('/') ||
    value.startsWith('\\') ||
    /^[A-Za-z]:[\\/]/u.test(value) ||
    value.split(/[\\/]/u).includes('..')
  ) {
    throw new TypeError(`${field} must be repository-relative`);
  }
}

function credentialShapeErrors(value, prefix = 'manifest') {
  if (!value || typeof value !== 'object') return [];
  const errors = [];
  for (const [key, child] of Object.entries(value)) {
    const field = `${prefix}.${key}`;
    if (
      /^(?:credential|credentials|password|token|cookie|authorization|storage_state)$/iu.test(
        key,
      )
    ) {
      errors.push(`${field} must not contain durable credential material`);
    }
    errors.push(...credentialShapeErrors(child, field));
  }
  return errors;
}

export function validateModuleE2EDiscoveryManifest(manifest) {
  const validated = validateModuleE2EManifest(manifest);
  const credentialErrors = credentialShapeErrors(validated);
  if (credentialErrors.length > 0) throw new TypeError(credentialErrors.join('; '));
  const { e2e } = validated;
  if (e2e.availability === 'available') {
    if (!Array.isArray(e2e.test_paths) || e2e.test_paths.length === 0) {
      throw new TypeError('e2e.test_paths must be a non-empty array');
    }
    for (const [index, testPath] of e2e.test_paths.entries()) {
      repositoryRelative(testPath, `e2e.test_paths[${index}]`);
    }
    for (const personaId of e2e.persona_refs) {
      if (!LOGICAL_ID.test(personaId) || personaId.includes('@')) {
        throw new TypeError(`persona_refs must contain logical IDs: ${personaId}`);
      }
    }
    if (e2e.data_contract?.owner_repository_id !== validated.repository_id) {
      throw new TypeError('module repository must own its E2E data contract');
    }
    for (const ownerField of [
      'setup_owner_repository_id',
      'cleanup_owner_repository_id',
    ]) {
      if (e2e.data_contract?.[ownerField] !== validated.repository_id) {
        throw new TypeError(`${ownerField} must be the module repository`);
      }
    }
  } else if (typeof e2e.reason !== 'string' || e2e.reason.trim() === '') {
    throw new TypeError(`${e2e.availability} manifest requires e2e.reason`);
  }
  return validated;
}

export function resolveE2EAuthoringOwner(request) {
  const executionHost = request?.execution_host_repository_id;
  if (request?.behavior_scope === 'module') {
    const owner = resolveRequirementOwnership({
      topology: request.topology,
      requested_module: request.requested_module,
      execution_host_repository_id: executionHost,
    });
    if (owner.status !== 'resolved') {
      return {
        ...owner,
        registry_version: systemRegistry.registry_version,
        copy_tests_to_portal: false,
      };
    }
    return {
      status: 'resolved',
      registry_version: systemRegistry.registry_version,
      behavior_scope: 'module',
      ...owner,
      test_owner_repository_id: owner.owner_repository_id,
      fixture_owner_repository_id: owner.owner_repository_id,
      selector_owner_repository_id: owner.owner_repository_id,
      data_contract_owner_repository_id: owner.owner_repository_id,
      copy_tests_to_portal: false,
      blockers: [],
    };
  }
  if (request?.behavior_scope === 'portal-shell') {
    if (!request.portal?.repository_id) {
      return {
        status: 'blocked',
        registry_version: systemRegistry.registry_version,
        blockers: ['portal.repository_id is required for portal-shell behavior'],
        copy_tests_to_portal: false,
      };
    }
    return {
      status: 'resolved',
      registry_version: systemRegistry.registry_version,
      behavior_scope: 'portal-shell',
      owner_repository_id: request.portal.repository_id,
      owner_repository_role: 'portal',
      owner_module_id: null,
      execution_host_repository_id: executionHost,
      write_target: request.portal.repository_id,
      test_owner_repository_id: request.portal.repository_id,
      fixture_owner_repository_id: request.portal.repository_id,
      selector_owner_repository_id: request.portal.repository_id,
      data_contract_owner_repository_id: request.portal.repository_id,
      copy_tests_to_portal: false,
      blockers: [],
    };
  }
  if (request?.behavior_scope === 'cross-module') {
    const integrationOwner = request.integration_owner_repository_id;
    const declared = [
      request.portal,
      ...(request.topology?.modules ?? []),
    ].some((entry) => entry?.repository_id === integrationOwner);
    if (!integrationOwner || !declared) {
      return {
        status: 'blocked',
        registry_version: systemRegistry.registry_version,
        blockers: ['cross-module behavior requires an explicit declared integration owner'],
        copy_tests_to_portal: false,
      };
    }
    return {
      status: 'resolved',
      registry_version: systemRegistry.registry_version,
      behavior_scope: 'cross-module',
      owner_repository_id: integrationOwner,
      execution_host_repository_id: executionHost,
      write_target: integrationOwner,
      test_owner_repository_id: integrationOwner,
      fixture_owner_repository_id: integrationOwner,
      selector_owner_repository_id: integrationOwner,
      data_contract_owner_repository_id: integrationOwner,
      copy_tests_to_portal: false,
      blockers: [],
    };
  }
  return {
    status: 'blocked',
    registry_version: systemRegistry.registry_version,
    blockers: [`unsupported E2E behavior scope: ${request?.behavior_scope}`],
    copy_tests_to_portal: false,
  };
}

function evidenceErrors(evidence, manifest, module, portalRevision) {
  const errors = [];
  if (!evidence || typeof evidence !== 'object') return ['run evidence is missing'];
  if (!EVIDENCE_CLASSES.has(evidence.evidence_class)) {
    errors.push(`unsupported evidence class: ${evidence.evidence_class}`);
  } else if (evidence.evidence_class !== 'full-e2e') {
    errors.push(`${evidence.evidence_class} cannot satisfy module full E2E`);
  }
  if (evidence.repository_id !== module.repository_id) {
    errors.push('evidence repository provenance does not match module owner');
  }
  if (!SHA256.test(evidence.source_fingerprint ?? '')) {
    errors.push('source_fingerprint must be a SHA-256 digest');
  }
  if (evidence.portal_revision !== portalRevision) {
    errors.push('evidence portal revision does not match aggregate portal revision');
  }
  if (evidence.module_revision !== module.revision) {
    errors.push('evidence module revision does not match checkout revision');
  }
  if (evidence.portal_pinned_module_revision !== module.pinned_revision) {
    errors.push('evidence pinned module revision does not match portal pin');
  }
  if (
    JSON.stringify(evidence.actual_command) !== JSON.stringify(manifest.e2e.command)
  ) {
    errors.push('actual command does not match discovery manifest');
  }
  const hashes = evidence.artifact_hashes;
  if (
    !hashes ||
    typeof hashes !== 'object' ||
    Object.keys(hashes).length === 0 ||
    Object.values(hashes).some((hash) => !SHA256.test(hash))
  ) {
    errors.push('artifact_hashes must contain SHA-256 digests');
  }
  return errors;
}

export function orchestratePortalModuleE2E({
  portal_repository_id: portalRepositoryId,
  portal_revision: portalRevision,
  modules,
  run_results: runResults = {},
}) {
  if (!portalRepositoryId || !REVISION.test(portalRevision ?? '')) {
    throw new TypeError('portal repository and 40-character revision are required');
  }
  if (!Array.isArray(modules) || modules.length === 0) {
    throw new TypeError('modules must be a non-empty array');
  }
  const records = modules.map((module) => {
    const base = {
      module_id: module.module_id,
      repository_id: module.repository_id,
      portal_repository_id: portalRepositoryId,
      portal_revision: portalRevision,
      module_revision: module.revision ?? null,
      portal_pinned_module_revision: module.pinned_revision ?? null,
      execution_cwd: module.checkout_path ?? null,
      copy_tests_to_portal: false,
    };
    if (module.available !== true || !module.checkout_path) {
      return {
        ...base,
        result: 'NOT RUN',
        evidence_status: 'absent',
        evidence_id: null,
        blocker: 'module checkout is missing or uninitialized',
      };
    }
    let manifest;
    try {
      manifest = validateModuleE2EDiscoveryManifest(module.manifest);
    } catch (error) {
      return {
        ...base,
        result: 'NOT RUN',
        evidence_status: 'invalid',
        evidence_id: null,
        blocker: `manifest error: ${error.message}`,
      };
    }
    if (manifest.module_id !== module.module_id || manifest.repository_id !== module.repository_id) {
      return {
        ...base,
        result: 'NOT RUN',
        evidence_status: 'invalid',
        evidence_id: null,
        blocker: 'manifest identity does not match discovered module',
      };
    }
    const evidenceId = `${module.module_id}:${manifest.e2e.evidence_path ?? 'not-applicable'}`;
    if (manifest.e2e.availability === 'not-applicable') {
      return {
        ...base,
        result: 'NOT APPLICABLE',
        evidence_status: 'not-applicable',
        evidence_id: evidenceId,
        blocker: null,
      };
    }
    if (manifest.e2e.availability === 'uninitialized') {
      return {
        ...base,
        result: 'NOT RUN',
        evidence_status: 'absent',
        evidence_id: evidenceId,
        blocker: manifest.e2e.reason,
      };
    }
    const run = runResults[module.module_id];
    if (!run) {
      return {
        ...base,
        result: 'NOT RUN',
        evidence_status: 'absent',
        evidence_id: evidenceId,
        blocker: 'no current run result',
      };
    }
    if (!RUN_RESULTS.has(run.result)) {
      return {
        ...base,
        result: 'NOT RUN',
        evidence_status: 'invalid',
        evidence_id: evidenceId,
        blocker: `unsupported run result: ${run.result}`,
      };
    }
    const errors = evidenceErrors(run.evidence, manifest, module, portalRevision);
    const revisionMismatch =
      module.revision !== module.pinned_revision ||
      run.evidence?.module_revision !== run.evidence?.portal_pinned_module_revision;
    return {
      ...base,
      result: run.result,
      evidence_class: run.evidence?.evidence_class ?? null,
      evidence_status:
        errors.length > 0 ? 'invalid' : revisionMismatch ? 'mismatched' : 'current',
      evidence_id: evidenceId,
      actual_command: run.evidence?.actual_command ?? null,
      source_fingerprint: run.evidence?.source_fingerprint ?? null,
      artifact_hashes: run.evidence?.artifact_hashes ?? {},
      blocker:
        errors.length > 0
          ? errors.join('; ')
          : revisionMismatch
            ? 'module revision differs from portal-pinned revision'
            : null,
    };
  });
  return {
    schema_version: 1,
    registry_version: systemRegistry.registry_version,
    portal_repository_id: portalRepositoryId,
    portal_revision: portalRevision,
    modules: records,
    full_e2e_satisfied: records.every(
      ({ result, evidence_status: evidenceStatus }) =>
        result === 'NOT APPLICABLE' ||
        (result === 'PASSED' && evidenceStatus === 'current'),
    ),
  };
}

export const moduleE2EEvidenceClasses = Object.freeze([...EVIDENCE_CLASSES].sort());
