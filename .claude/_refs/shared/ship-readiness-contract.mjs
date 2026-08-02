import { verifyApprovedArtifactGraph } from './approved-artifact.mjs';

const REVISION = /^[a-f0-9]{40}$/u;
const PASS = 'PASSED';
const BLOCKING_SEVERITIES = new Set(['CRITICAL', 'HIGH']);
const REQUIRED_EVIDENCE = Object.freeze({
  'angular-golden': 'golden-build',
  'nextjs-production-build': 'production-build',
  'nestjs-production-auth': 'production-integration',
  'full-e2e': 'full-matrix',
});

function pushUnique(target, value) {
  if (!target.includes(value)) target.push(value);
}

function findEvidence(contract, evidenceType, moduleId = null) {
  const evidence = Array.isArray(contract?.evidence) ? contract.evidence : [];
  return evidence.find(
    (entry) =>
      entry.evidence_type === evidenceType &&
      (moduleId === null || entry.module_id === moduleId),
  );
}

function canonicalRevisionMap(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '{}';
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(value).sort(([left], [right]) =>
        left < right ? -1 : left > right ? 1 : 0,
      ),
    ),
  );
}

function validateEvidenceIdentity(entry, sourceIdentity, blockers, label) {
  if (!entry) {
    pushUnique(blockers, `${label} evidence is missing`);
    return false;
  }
  let valid = true;
  if (entry.result !== PASS) {
    pushUnique(
      blockers,
      `${label} evidence is ${entry.result ?? 'NOT RUN'}, not PASSED`,
    );
    valid = false;
  }
  if (
    entry.source_revision !== sourceIdentity.source_revision ||
    entry.source_fingerprint !== sourceIdentity.source_fingerprint
  ) {
    pushUnique(blockers, `${label} evidence belongs to stale source`);
    valid = false;
  }
  if (entry.portal_revision !== sourceIdentity.portal_revision) {
    pushUnique(blockers, `${label} evidence has a stale portal revision`);
    valid = false;
  }
  if (
    !Array.isArray(entry.actual_command) ||
    entry.actual_command.length === 0 ||
    !entry.environment_fingerprint ||
    Number.isNaN(Date.parse(entry.finished_at ?? ''))
  ) {
    pushUnique(blockers, `${label} evidence lacks command/environment/time traceability`);
    valid = false;
  }
  const expectedMap = Object.fromEntries(
    (Array.isArray(sourceIdentity?.modules) ? sourceIdentity.modules : []).map(
      ({ module_id: moduleId, revision }) => [moduleId, revision],
    ),
  );
  if (
    canonicalRevisionMap(entry.module_revision_map) !==
    canonicalRevisionMap(expectedMap)
  ) {
    pushUnique(blockers, `${label} evidence has a portal/module revision map mismatch`);
    valid = false;
  }
  return valid;
}

function validateSourceIdentity(sourceIdentity, blockers) {
  if (
    !REVISION.test(sourceIdentity?.source_revision ?? '') ||
    !REVISION.test(sourceIdentity?.portal_revision ?? '') ||
    typeof sourceIdentity?.source_fingerprint !== 'string' ||
    sourceIdentity.source_fingerprint.length < 16
  ) {
    blockers.push(
      'source identity requires current source_revision, source_fingerprint, and portal_revision',
    );
  }
  if (!Array.isArray(sourceIdentity?.modules)) {
    blockers.push('source identity modules must be an array');
    return;
  }
  const moduleIds = new Set();
  for (const module of sourceIdentity.modules) {
    if (
      !module.module_id ||
      !module.repository_id ||
      !REVISION.test(module.revision ?? '') ||
      !REVISION.test(module.pinned_revision ?? '')
    ) {
      blockers.push('module identity requires module/repository/revision/pinned revision');
      continue;
    }
    if (moduleIds.has(module.module_id)) {
      blockers.push(`duplicate module identity: ${module.module_id}`);
    }
    moduleIds.add(module.module_id);
    if (module.revision !== module.pinned_revision) {
      blockers.push(`portal/module revision mismatch: ${module.module_id}`);
    }
  }
}

function validateApprovedArtifacts(contract, blockers) {
  if (!Array.isArray(contract.approved_artifacts) || contract.approved_artifacts.length === 0) {
    blockers.push('verified approved artifacts are required');
    return;
  }
  const sourceIdentity = contract.source_identity ?? {};
  const modules = Array.isArray(sourceIdentity.modules) ? sourceIdentity.modules : [];
  const repositoryRevisions = new Map([
    [
      sourceIdentity.portal_repository_id,
      sourceIdentity.portal_revision,
    ],
    ...modules.map((module) => [
      module.repository_id,
      module.revision,
    ]),
  ]);
  for (const record of contract.approved_artifacts) {
    try {
      const verified = verifyApprovedArtifactGraph(
        record.artifact,
        record.parent_artifacts ?? [],
      );
      const expectedRevision = repositoryRevisions.get(
        verified.metadata.owner_repository_id,
      );
      if (!expectedRevision) {
        blockers.push(
          `approved artifact owner is absent from source identity: ${verified.metadata.artifact_id}`,
        );
      } else if (verified.metadata.source_revision !== expectedRevision) {
        blockers.push(
          `approved artifact is stale: ${verified.metadata.artifact_id}`,
        );
      }
    } catch (error) {
      blockers.push(
        `approved artifact verification failed: ${error?.message ?? String(error)}`,
      );
    }
  }
}

function validateRequiredEvidence(contract, blockers) {
  const sourceIdentity = contract.source_identity ?? {};
  for (const [evidenceType, evidenceClass] of Object.entries(REQUIRED_EVIDENCE)) {
    const entry = findEvidence(contract, evidenceType);
    const label = evidenceType;
    const identityValid = validateEvidenceIdentity(
      entry,
      sourceIdentity,
      blockers,
      label,
    );
    if (entry && entry.evidence_class !== evidenceClass) {
      blockers.push(
        `${label} requires ${evidenceClass} evidence; ${entry.evidence_class ?? 'unknown'} cannot substitute`,
      );
    }
    if (
      evidenceType === 'nestjs-production-auth' &&
      identityValid &&
      (entry.provider_kind !== 'oidc-jwks' ||
        entry.production_provider_exercised !== true)
    ) {
      blockers.push('NestJS production authentication provider was not exercised');
    }
  }

  const modules = Array.isArray(sourceIdentity.modules) ? sourceIdentity.modules : [];
  for (const module of modules) {
    if (module.required_for_release !== true) continue;
    const entry = findEvidence(contract, 'module-e2e', module.module_id);
    validateEvidenceIdentity(
      entry,
      sourceIdentity,
      blockers,
      `module ${module.module_id} E2E`,
    );
    if (entry && entry.evidence_class !== 'module-matrix') {
      blockers.push(
        `module ${module.module_id} E2E requires module-matrix evidence`,
      );
    }
  }

  if (contract.claims?.full_live_agent_coverage === true) {
    const entry = findEvidence(contract, 'live-agent-matrix');
    validateEvidenceIdentity(
      entry,
      sourceIdentity,
      blockers,
      'live-agent matrix',
    );
    if (
      !entry ||
      entry.evidence_class !== 'live-matrix' ||
      entry.coverage?.passed !== entry.coverage?.required ||
      !(entry.coverage?.required > 0)
    ) {
      blockers.push('full live-agent coverage is not proven by a complete live matrix');
    }
  }
}

function stage(status, blockers = []) {
  return { status, blockers: [...blockers] };
}

export function evaluateShipReadiness(contract) {
  if (contract?.schema_version !== 1) {
    throw new TypeError('ship readiness schema_version must be 1');
  }
  const sourceIdentity =
    contract.source_identity && typeof contract.source_identity === 'object'
      ? contract.source_identity
      : {};
  const productionBlockers = [];
  validateSourceIdentity(sourceIdentity, productionBlockers);
  validateApprovedArtifacts(contract, productionBlockers);
  validateRequiredEvidence(contract, productionBlockers);

  const findings = Array.isArray(contract.findings) ? contract.findings : [];
  for (const finding of findings) {
    if (
      BLOCKING_SEVERITIES.has(String(finding.severity).toUpperCase()) &&
      !['RESOLVED', 'CLOSED', 'VERIFIED'].includes(
        String(finding.status).toUpperCase(),
      )
    ) {
      productionBlockers.push(
        `unresolved ${String(finding.severity).toUpperCase()} finding: ${finding.id}`,
      );
    }
  }

  const readyToShip = productionBlockers.length === 0;
  const branchBlockers = [];
  if (!readyToShip) branchBlockers.push('ship verification is blocked');
  if (contract.delivery?.branch_ready_result !== 'READY') {
    branchBlockers.push('branch-ready evidence is not READY');
  }
  if (
    contract.delivery?.branch_ready_source_fingerprint !==
    sourceIdentity.source_fingerprint
  ) {
    branchBlockers.push('branch-ready evidence is stale');
  }
  if (contract.delivery?.artifact_closure !== 'complete') {
    branchBlockers.push('artifact closure is incomplete');
  }
  if (contract.delivery?.protected_branch === true) {
    branchBlockers.push('protected branch blocks direct commit/push/PR');
  }
  const commitReady = branchBlockers.length === 0;

  const pushBlockers = [...branchBlockers];
  if (contract.delivery?.commit_created !== true) {
    pushBlockers.push('no verified commit exists');
  }
  if (contract.delivery?.clean_tree !== true) {
    pushBlockers.push('working tree is not clean');
  }
  const pushReady = pushBlockers.length === 0;

  const prBlockers = [...pushBlockers];
  if (contract.delivery?.remote_branch_exists !== true) {
    prBlockers.push('verified remote branch does not exist');
  }
  const prReady = prBlockers.length === 0;

  const releaseBlockers = [...productionBlockers];
  if (contract.release?.version_synchronized !== true) {
    releaseBlockers.push('release version metadata is not synchronized');
  }
  if (contract.release?.changelog_current !== true) {
    releaseBlockers.push('changelog is not current');
  }
  const releaseReady = releaseBlockers.length === 0;

  const publishedBlockers = [];
  if (contract.release?.immutable_tag_exists !== true) {
    publishedBlockers.push('immutable tag does not exist');
  }
  if (contract.release?.github_release_exists !== true) {
    publishedBlockers.push('GitHub Release does not exist');
  }
  if (contract.release?.published === true && publishedBlockers.length > 0) {
    publishedBlockers.push('published claim conflicts with release artifacts');
  }
  const actuallyPublished =
    contract.release?.published === true && publishedBlockers.length === 0;

  return {
    schema_version: 1,
    source_identity:
      Object.keys(sourceIdentity).length > 0 ? structuredClone(sourceIdentity) : null,
    stages: {
      ready_to_ship: stage(
        readyToShip ? 'READY' : 'BLOCKED',
        productionBlockers,
      ),
      commit_ready: stage(
        commitReady ? 'READY' : 'BLOCKED',
        branchBlockers,
      ),
      push_ready: stage(pushReady ? 'READY' : 'BLOCKED', pushBlockers),
      pr_ready: stage(prReady ? 'READY' : 'BLOCKED', prBlockers),
      release_ready: stage(
        releaseReady ? 'READY' : 'BLOCKED',
        releaseBlockers,
      ),
      actually_published: stage(
        actuallyPublished ? 'PUBLISHED' : 'NOT_PUBLISHED',
        publishedBlockers,
      ),
    },
    evidence_trace: (Array.isArray(contract.evidence) ? contract.evidence : []).map(
      (entry) => ({
        evidence_type: entry.evidence_type,
        evidence_class: entry.evidence_class,
        result: entry.result,
        actual_command: structuredClone(entry.actual_command ?? []),
        source_revision: entry.source_revision,
        source_fingerprint: entry.source_fingerprint,
        portal_revision: entry.portal_revision,
        module_revision_map: structuredClone(entry.module_revision_map ?? {}),
        environment_fingerprint: entry.environment_fingerprint,
        finished_at: entry.finished_at,
      }),
    ),
    automatic_actions: [],
    prohibited_automatic_actions: [
      'commit',
      'push',
      'create-pr',
      'merge',
      'tag',
      'publish',
      'create-release',
    ],
  };
}
