import { systemRegistry } from '../shared/system-registry.mjs';

const MAX_ATTEMPTS = 3;
const PROTECTED_ARTIFACT = /(^|\/)\.sdcorejs\/(?:specs|plans)\//u;

function normalize(value) {
  return String(value ?? '').replaceAll('\\', '/').replace(/^\.\/+/u, '');
}

function within(candidate, allowedPaths) {
  const value = normalize(candidate);
  return allowedPaths.some((allowedPath) => {
    const allowed = normalize(allowedPath).replace(/\/+$/u, '');
    return value === allowed || value.startsWith(`${allowed}/`);
  });
}

export function evaluateRepairContract(contract) {
  const blockers = [];
  const track = systemRegistry.tracks.find(({ id }) => id === contract?.subject_track);
  if (contract?.schema_version !== 1) blockers.push('repair schema_version must be 1');
  if (!track || track.repair_supported !== true) {
    blockers.push(`track is not repair-supported by the central registry: ${contract?.subject_track}`);
  }
  const finding = contract?.finding;
  const identity = contract?.artifact_identity;
  const authority = contract?.write_authority;
  if (!finding?.id || finding.status !== 'VALID') {
    blockers.push('repair requires one validated finding identity');
  }
  if (!identity?.owner_repository_id || !identity.execution_host_repository_id) {
    blockers.push('repair artifact owner and execution host are required');
  }
  if (finding?.owner_repository_id !== identity?.owner_repository_id) {
    blockers.push('finding evidence belongs to a different repository owner');
  }
  if (contract?.source === 'review-code' && finding?.selected_for_repair !== true) {
    blockers.push('review finding was not selected for repair');
  }
  if (
    authority?.approved !== true ||
    authority.owner_repository_id !== identity?.owner_repository_id
  ) {
    blockers.push('write authority does not match the repair owner repository');
  }
  if (!Array.isArray(authority?.allowed_paths) || authority.allowed_paths.length === 0) {
    blockers.push('repair write authority requires allowed_paths');
  }
  if (contract?.approved_artifact_mutation === true) {
    blockers.push('repair cannot mutate an approved artifact');
  }
  if ((contract?.repair_recursion_depth ?? 0) > 1) {
    blockers.push('repair recursion depth exceeded');
  }

  const attempts = contract?.attempts;
  if (!Array.isArray(attempts)) {
    blockers.push('repair attempts ledger must be an array');
  } else {
    if (attempts.length > MAX_ATTEMPTS) blockers.push('repair attempt cap exceeded');
    for (const [index, attempt] of attempts.entries()) {
      if (attempt.attempt !== index + 1) blockers.push('repair attempts must be sequential');
      for (const changedPath of attempt.changed_paths ?? []) {
        const normalized = normalize(changedPath);
        if (PROTECTED_ARTIFACT.test(normalized)) {
          blockers.push(`repair cannot change approved artifact: ${normalized}`);
        } else if (!within(normalized, authority?.allowed_paths ?? [])) {
          blockers.push(`repair path is outside authorized owner scope: ${normalized}`);
        }
      }
      const evidence = attempt.repaired_evidence;
      if (evidence) {
        if (evidence.original_evidence_ref !== finding?.original_evidence_ref) {
          blockers.push('repaired evidence does not link to the original finding evidence');
        }
        if (evidence.repository_id !== identity?.owner_repository_id) {
          blockers.push('repaired evidence belongs to a different repository');
        }
      }
    }
  }

  const latest = attempts?.at(-1);
  const unresolved = latest?.validation_result !== 'PASSED';
  return {
    schema_version: 1,
    registry_version: systemRegistry.registry_version,
    subject_track: contract?.subject_track ?? null,
    status: blockers.length > 0 ? 'blocked' : unresolved ? 'repairing' : 'resolved',
    repair_authorized: blockers.length === 0,
    owner_repository_id: identity?.owner_repository_id ?? null,
    execution_host_repository_id: identity?.execution_host_repository_id ?? null,
    attempts_used: attempts?.length ?? 0,
    attempts_remaining: Math.max(0, MAX_ATTEMPTS - (attempts?.length ?? 0)),
    escalation_required:
      blockers.some((blocker) => blocker.includes('cap exceeded')) ||
      ((attempts?.length ?? 0) === MAX_ATTEMPTS && unresolved),
    blockers,
  };
}

export const repairAttemptCap = MAX_ATTEMPTS;
