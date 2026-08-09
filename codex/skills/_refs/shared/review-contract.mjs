import {
  CONSISTENCY_FINDING_KINDS,
  validateConsistencyFinding,
} from './convention-contract.mjs';
import { systemRegistry } from './system-registry.mjs';

const SEVERITIES = new Set(['Critical', 'High', 'Important', 'Medium', 'Minor', 'Low', 'Info']);

const REVIEW_DIMENSIONS = new Map(
  systemRegistry.review_dimensions.map((dimension) => [dimension.id, dimension]),
);

/**
 * How much of the consistency dimension a requested review actually runs.
 *
 * The distinction matters because a consistency audit is expensive and
 * opinionated. Someone who asked for a security review wants authorization and
 * injection findings, not a naming inventory, so a security-only request may
 * only surface a consistency issue when it changes the security answer - for
 * example a permission code that two layers spell differently.
 */
export function resolveConsistencyScope(dimensions = []) {
  const requested = dimensions.filter((dimension) => REVIEW_DIMENSIONS.has(dimension));
  const scopes = new Set(
    requested.map((dimension) => REVIEW_DIMENSIONS.get(dimension).consistency_scope),
  );
  if (scopes.has('complete')) {
    return { scope: 'complete', reason: 'consistency or ALL was requested directly' };
  }
  if (scopes.has('applicable')) {
    return { scope: 'applicable', reason: 'code review includes applicable consistency checks' };
  }
  if (scopes.has('structural')) {
    return {
      scope: 'structural',
      reason: 'architecture review includes structural and cross-layer consistency checks',
    };
  }
  if (requested.length === 0) {
    return { scope: 'none', reason: 'no recognized review dimension was requested' };
  }
  return {
    scope: 'dimension-affecting-only',
    reason: 'narrow dimension reports consistency only where it affects that dimension',
  };
}

function finding(id, severity, kind, observation, requiredFix) {
  return {
    id,
    severity,
    kind,
    evidence: observation.evidence ?? observation.path ?? observation.logical_id,
    locator: observation.locator ?? observation.path ?? observation.logical_id,
    repository_id: observation.repository_id ?? null,
    module_id: observation.module_id ?? null,
    impact: observation.impact,
    required_fix: requiredFix,
  };
}

export function evaluateReviewContract(context) {
  const blockers = [];
  const track = systemRegistry.tracks.find(({ id }) => id === context?.subject_track);
  if (context?.schema_version !== 1) blockers.push('review schema_version must be 1');
  if (!track) {
    blockers.push(`unsupported review track: ${context?.subject_track}`);
  } else if (context.review_profile !== track.review_profile) {
    blockers.push(
      `review profile ${context.review_profile} does not match registry profile ${track.review_profile}`,
    );
  }
  if (context?.mode !== 'read-only') blockers.push('review mode must be read-only');
  if ((context?.write_actions ?? []).length > 0) {
    blockers.push('read-only review cannot contain write actions');
  }

  const requestedDimensions = context?.dimensions ?? [];
  for (const dimension of requestedDimensions) {
    if (!REVIEW_DIMENSIONS.has(dimension)) {
      blockers.push(`unsupported review dimension: ${dimension}`);
    }
  }
  const consistency = resolveConsistencyScope(requestedDimensions);
  // The dimensions the user asked for survive verbatim. A consistency issue is
  // reported as `consistency`, never relabelled into generic code style, and a
  // narrow request is never widened into a full audit behind the user's back.
  const consistencyReportingAllowed = consistency.scope !== 'none';

  const findings = [];
  let sequence = 1;
  for (const item of context?.reported_findings ?? []) {
    if (
      !SEVERITIES.has(item.severity) ||
      !item.evidence ||
      !item.locator ||
      !item.repository_id ||
      !item.impact ||
      !item.required_fix
    ) {
      blockers.push(`finding ${item.id ?? sequence} does not satisfy the durable schema`);
      continue;
    }
    // Match on a declared consistency kind, not on the mere presence of a
    // `finding_kind` field. A truthy check would drag any finding that happens
    // to carry that field - including a security finding from another producer -
    // into the consistency gate and reject it as an audit that was never asked
    // for.
    const reportsConsistency =
      item.dimension === 'consistency' || CONSISTENCY_FINDING_KINDS.includes(item.finding_kind);
    if (reportsConsistency) {
      if (!consistencyReportingAllowed) {
        blockers.push(
          `finding ${item.id ?? sequence} reports consistency but no requested dimension covers it`,
        );
        continue;
      }
      if (consistency.scope === 'dimension-affecting-only' && item.affects_requested_dimension !== true) {
        blockers.push(
          `finding ${item.id ?? sequence} expands a narrow review into a consistency audit`,
        );
        continue;
      }
      const consistencyValidation = validateConsistencyFinding(item);
      if (!consistencyValidation.ok) {
        blockers.push(
          `finding ${item.id ?? sequence} is not a valid consistency finding: ${consistencyValidation.errors.join('; ')}`,
        );
        continue;
      }
    }
    findings.push({ ...item });
    sequence += 1;
  }

  const conventionContext = context?.convention_context ?? null;
  if (conventionContext) {
    if (conventionContext.mode !== 'read-only') {
      blockers.push('convention_context carried by review must stay read-only');
    }
    if ((conventionContext.write_actions ?? []).length > 0) {
      blockers.push('convention_context carried by review cannot contain write actions');
    }
    if (conventionContext.persistence?.performed === true) {
      blockers.push('review must not perform convention persistence');
    }
  }

  const artifacts = context?.artifacts ?? [];
  for (const artifact of artifacts) {
    if (artifact.repository_id !== artifact.owner_repository_id) {
      findings.push(
        finding(
          `R${sequence++}`,
          'High',
          'misplaced-owner-artifact',
          {
            ...artifact,
            impact: 'Module-owned editable artifact is stored in the wrong repository.',
          },
          'Move authoring to the semantic owner and remove the misplaced editable copy.',
        ),
      );
    }
    if (
      artifact.approved_hash &&
      artifact.current_hash &&
      artifact.approved_hash !== artifact.current_hash
    ) {
      findings.push(
        finding(
          `R${sequence++}`,
          'High',
          'mutated-approved-artifact',
          {
            ...artifact,
            impact: 'Approved artifact hash no longer matches its approval.',
          },
          'Restore the approved bytes or return through approval before implementation.',
        ),
      );
    }
  }
  const editableByLogicalId = new Map();
  for (const artifact of artifacts.filter(({ editable }) => editable === true)) {
    const group = editableByLogicalId.get(artifact.logical_id) ?? [];
    group.push(artifact);
    editableByLogicalId.set(artifact.logical_id, group);
  }
  for (const [logicalId, group] of editableByLogicalId) {
    if (new Set(group.map(({ repository_id: repositoryId }) => repositoryId)).size > 1) {
      findings.push(
        finding(
          `R${sequence++}`,
          'High',
          'duplicate-editable-source',
          {
            logical_id: logicalId,
            repository_id: group[0].repository_id,
            module_id: group[0].module_id,
            evidence: group.map(({ repository_id: repositoryId, path }) => `${repositoryId}:${path}`).join(', '),
            impact: 'Portal and module contain competing editable sources.',
          },
          'Keep one editable source in the semantic owner and generate/aggregate elsewhere.',
        ),
      );
    }
  }

  for (const evidence of context?.test_evidence ?? []) {
    const currentRevision = context.current_revision_map?.[evidence.repository_id];
    const pinnedRevision =
      evidence.module_id == null
        ? evidence.source_revision
        : context.portal_pinned_module_revision_map?.[evidence.module_id];
    if (
      evidence.status !== 'current' ||
      evidence.source_revision !== currentRevision ||
      evidence.source_revision !== pinnedRevision
    ) {
      findings.push(
        finding(
          `R${sequence++}`,
          'High',
          'stale-evidence',
          {
            ...evidence,
            locator: evidence.evidence_ref,
            impact: 'Evidence does not prove the reviewed current/pinned source.',
          },
          'Re-run the exact command on the current owner revision and matching portal pin.',
        ),
      );
    }
  }

  for (const provider of context?.provider_evidence ?? []) {
    if (provider.production_required === true && provider.provider_kind === 'fake') {
      findings.push(
        finding(
          `R${sequence++}`,
          'Critical',
          'fake-production-provider',
          {
            ...provider,
            locator: provider.contract_path,
            evidence: provider.evidence_ref,
            impact: 'A fake provider hides an unresolved production boundary.',
          },
          'Validate the real production provider directly; keep doubles test-only.',
        ),
      );
    }
  }

  return {
    schema_version: 1,
    registry_version: systemRegistry.registry_version,
    status: blockers.length === 0 ? 'reviewed' : 'blocked',
    read_only_proven: context?.mode === 'read-only' && (context?.write_actions ?? []).length === 0,
    subject_track: context?.subject_track ?? null,
    review_profile: context?.review_profile ?? null,
    owner_repository_id: context?.owner_repository_id ?? null,
    execution_host_repository_id: context?.execution_host_repository_id ?? null,
    requested_dimensions: [...requestedDimensions],
    consistency_scope: consistency.scope,
    consistency_scope_reason: consistency.reason,
    convention_context_read_only:
      conventionContext == null
        ? null
        : conventionContext.mode === 'read-only' &&
          (conventionContext.write_actions ?? []).length === 0,
    findings,
    blockers,
  };
}

export const firstClassReviewProfiles = Object.freeze(
  Object.fromEntries(
    systemRegistry.tracks.map(({ id, review_profile: reviewProfile }) => [
      id,
      reviewProfile,
    ]),
  ),
);

export const reviewDimensions = Object.freeze(
  systemRegistry.review_dimensions.map(({ id }) => id),
);
