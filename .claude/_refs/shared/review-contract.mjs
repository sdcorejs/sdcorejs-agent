import { systemRegistry } from './system-registry.mjs';

const SEVERITIES = new Set(['Critical', 'High', 'Important', 'Medium', 'Minor', 'Low']);

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
    findings.push({ ...item });
    sequence += 1;
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
