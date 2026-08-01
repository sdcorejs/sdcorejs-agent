import path from 'node:path';
import { systemRegistry } from './system-registry.mjs';

const REVISION = /^[a-f0-9]{40}$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const INTENTS = new Set(['diagnose-only', 'fix']);
const HYPOTHESIS_STATES = new Set([
  'confirmed',
  'falsified',
  'inconclusive',
  'root',
]);

function nonEmpty(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function normalizeRepositoryRelative(candidate) {
  if (typeof candidate !== 'string' || candidate.trim() === '') return null;
  const raw = candidate.trim().replaceAll('\\', '/').replace(/^\.\/+/u, '');
  if (
    raw.includes('\0') ||
    path.posix.isAbsolute(raw) ||
    /^[A-Za-z]:\//u.test(raw) ||
    raw.split('/').includes('..')
  ) {
    return null;
  }
  const normalized = path.posix.normalize(raw);
  return normalized === '.' ? null : normalized;
}

function pathOwned(candidate, allowedPaths) {
  const normalizedCandidate = normalizeRepositoryRelative(candidate);
  if (!normalizedCandidate) return false;
  return allowedPaths.some(
    (allowed) => {
      const normalizedAllowed = normalizeRepositoryRelative(allowed);
      return (
        normalizedAllowed !== null &&
        (normalizedCandidate === normalizedAllowed ||
          normalizedCandidate.startsWith(`${normalizedAllowed.replace(/\/+$/u, '')}/`))
      );
    },
  );
}

export function redactDebugText(value) {
  return String(value)
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/giu, 'Bearer [REDACTED]')
    .replace(
      /\b(api[_-]?key|authorization|cookie|password|refresh[_-]?token|token)\s*[:=]\s*([^\s,;]+)/giu,
      '$1=[REDACTED]',
    )
    .replace(
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu,
      '[PII_REDACTED]',
    );
}

export function evaluateDebugArtifact(artifact) {
  const blockers = [];
  const trackIds = new Set(systemRegistry.tracks.map(({ id }) => id));
  if (artifact?.schema_version !== 1) blockers.push('debug artifact schema_version must be 1');
  if (!trackIds.has(artifact?.subject_track)) {
    blockers.push(`subject_track is not in the central registry: ${artifact?.subject_track}`);
  }
  if (!INTENTS.has(artifact?.intent)) blockers.push(`unsupported debug intent: ${artifact?.intent}`);
  if (!nonEmpty(artifact?.owner_repository_id)) blockers.push('owner_repository_id is required');
  if (!nonEmpty(artifact?.execution_host_repository_id)) {
    blockers.push('execution_host_repository_id is required');
  }
  const implementation = artifact?.failing_implementation;
  if (!implementation || !nonEmpty(implementation.repository_id)) {
    blockers.push('failing implementation repository identity is required');
  } else if (implementation.repository_id !== artifact.owner_repository_id) {
    blockers.push('failing implementation does not match the defect owner repository');
  }
  if (!nonEmpty(implementation?.path)) blockers.push('failing implementation path is required');
  if (!REVISION.test(implementation?.source_revision ?? '')) {
    blockers.push('failing implementation source revision is invalid');
  }
  const revisionMap = artifact?.source_revision_map;
  if (!revisionMap || typeof revisionMap !== 'object') {
    blockers.push('source_revision_map is required');
  } else if (
    revisionMap[artifact.owner_repository_id] !== implementation?.source_revision
  ) {
    blockers.push('source revision map does not match the failing implementation');
  }
  if (!SHA256.test(artifact?.environment_fingerprint ?? '')) {
    blockers.push('environment_fingerprint must be a SHA-256 digest');
  }

  const evidence = artifact?.test_evidence;
  let staleEvidence = false;
  if (!evidence || !nonEmpty(evidence.repository_id)) {
    blockers.push('test evidence with repository provenance is required');
  } else {
    if (evidence.repository_id !== artifact.owner_repository_id) {
      blockers.push('test evidence belongs to the wrong repository');
    }
    staleEvidence =
      evidence.status !== 'current' ||
      evidence.source_revision !== implementation?.source_revision ||
      evidence.source_fingerprint !== artifact?.source_fingerprint;
    if (staleEvidence) blockers.push('test evidence is stale for the current source');
  }
  if (!SHA256.test(artifact?.source_fingerprint ?? '')) {
    blockers.push('source_fingerprint must be a SHA-256 digest');
  }

  const hypotheses = artifact?.hypotheses;
  if (!Array.isArray(hypotheses) || hypotheses.length === 0) {
    blockers.push('hypothesis ledger is required');
  } else {
    if (
      hypotheses.length > 3 &&
      hypotheses.filter(({ status }) => status === 'inconclusive').length > 3
    ) {
      blockers.push('hypothesis ledger has more than three live inconclusive hypotheses');
    }
    for (const hypothesis of hypotheses) {
      if (!nonEmpty(hypothesis.id) || !HYPOTHESIS_STATES.has(hypothesis.status)) {
        blockers.push('hypothesis ledger contains an invalid entry');
        break;
      }
    }
  }

  let writeAuthorized = false;
  if (artifact?.intent === 'fix') {
    const root = hypotheses?.find(
      ({ status, verified }) => status === 'root' && verified === true,
    );
    if (!root) blockers.push('fix intent requires a verified root hypothesis');
    const planStep = artifact.approved_plan_step;
    if (!planStep || !SHA256.test(planStep.approval_hash ?? '')) {
      blockers.push('fix intent requires a verified approved plan step');
    } else {
      if (planStep.owner_repository_id !== artifact.owner_repository_id) {
        blockers.push('approved plan step belongs to the wrong repository');
      }
      if (
        !Array.isArray(planStep.allowed_paths) ||
        !pathOwned(implementation?.path ?? '', planStep.allowed_paths)
      ) {
        blockers.push('failing implementation is outside approved write scope');
      }
    }
    if (
      artifact.debug_mode === 'flaky' &&
      (artifact.retry_evidence?.consecutive_post_fix_passes ?? 0) < 3
    ) {
      blockers.push('one flaky retry pass is not proof of a fix');
    }
    writeAuthorized = blockers.length === 0;
  }

  return {
    schema_version: 1,
    registry_version: systemRegistry.registry_version,
    status: blockers.length === 0 ? 'ready' : 'blocked',
    intent: artifact?.intent ?? null,
    write_authorized: artifact?.intent === 'diagnose-only' ? false : writeAuthorized,
    stale_evidence: staleEvidence,
    owner_repository_id: artifact?.owner_repository_id ?? null,
    owner_module_id: artifact?.owner_module_id ?? null,
    execution_host_repository_id: artifact?.execution_host_repository_id ?? null,
    source_revision_map: revisionMap ?? {},
    blockers,
  };
}
