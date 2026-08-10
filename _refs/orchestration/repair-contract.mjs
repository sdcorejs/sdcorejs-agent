import { systemRegistry } from '../shared/system-registry.mjs';
import { verifyApprovedArtifact } from '../shared/approved-artifact.mjs';

const MAX_ATTEMPTS = 3;
const PROTECTED_ARTIFACT = /(^|\/)\.sdcorejs\/(?:architecture|plans|specs)\//u;
const REVISION = /^[a-f0-9]{40}$/u;
const SHA256 = /^sha256:[a-f0-9]{64}$/u;
const APPROVAL_HASH = /^sha256:v1:[a-f0-9]{64}$/u;
const REPAIR_APPROVAL_CONTRACT = 'repair-approval:v1';
const REPOSITORY_SNAPSHOT_CONTRACT = 'repair-repository-snapshot:v1';
const REVIEW_ASSESSMENT_CONTRACT = 'repair-review-assessment:v1';
const COMMAND_RECEIPT_CONTRACT = 'repair-command-receipt:v1';
const STABLE_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;
const SAFE_REVIEWER = /^[A-Za-z0-9][A-Za-z0-9._:/ -]{0,127}$/u;
const EVIDENCE_KINDS = new Set(['architecture', 'config', 'contract', 'convention', 'file', 'test']);
const CHANGE_KINDS = new Set(['architecture', 'mechanical', 'migration', 'public-contract-rename', 'security-policy', 'semantic']);

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isText(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function singleLine(value) {
  return isText(value) && value.trim() === value && !/[\r\n\0]/u.test(value);
}

function safeRelativePath(value) {
  if (!singleLine(value) || value.includes('\\') || value.startsWith('/') || /^[A-Za-z]:\//u.test(value)) return false;
  const segments = value.split('/');
  return !segments.some((segment) => segment === '' || segment === '.' || segment === '..');
}

function uniqueSafePaths(value) {
  return Array.isArray(value) && value.length > 0 && value.every(safeRelativePath) && new Set(value).size === value.length;
}

function within(candidate, allowedPaths) {
  if (!safeRelativePath(candidate) || !Array.isArray(allowedPaths)) return false;
  return allowedPaths.some((allowed) =>
    safeRelativePath(allowed) && (candidate === allowed || candidate.startsWith(`${allowed}/`)));
}

function exactSet(left, right) {
  return Array.isArray(left) && Array.isArray(right) &&
    left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (!isObject(value)) return value;
  return Object.fromEntries(
    Object.keys(value).sort().map((key) => [key, canonicalValue(value[key])]),
  );
}

function sameProjection(left, right) {
  return JSON.stringify(canonicalValue(left)) === JSON.stringify(canonicalValue(right));
}

function normalizedConflicts(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((conflict) => (isObject(conflict)
      ? {
        kind: conflict.kind ?? null,
        reference: conflict.reference ?? null,
        owner: conflict.owner ?? null,
      }
      : null))
    .sort((left, right) => JSON.stringify(canonicalValue(left)).localeCompare(JSON.stringify(canonicalValue(right))));
}

function migrationDecisionIdentity(proposedChange) {
  const reference = proposedChange?.migration_decision;
  if (reference === null) return null;
  return {
    artifact_ref: reference?.artifact_ref ?? null,
    approval_hash: reference?.approval_hash ?? null,
    decision_id: reference?.decision_id ?? null,
  };
}

function resolveEvidenceArtifact(reference, artifacts, contractId, blockers, label) {
  if (
    !isObject(reference) ||
    !safeRelativePath(reference.artifact_ref) ||
    !APPROVAL_HASH.test(reference.approval_hash ?? '')
  ) {
    blockers.push(`${label} must be a canonical artifact reference and approval hash`);
    return null;
  }
  if (!Array.isArray(artifacts)) {
    blockers.push(`${label} requires a trusted loaded evidence artifact collection`);
    return null;
  }
  const matches = artifacts.filter((artifact) =>
    artifact?.metadata?.repository_relative_path === reference.artifact_ref);
  if (matches.length !== 1) {
    blockers.push(`${label} artifact is missing or ambiguous: ${reference.artifact_ref}`);
    return null;
  }
  try {
    const artifact = matches[0];
    const verified = verifyApprovedArtifact(artifact);
    if (artifact.metadata.approval_hash !== reference.approval_hash) throw new Error('artifact hash mismatch');
    if (verified.metadata.artifact_kind !== 'release-evidence' || verified.metadata.contract_id !== contractId) {
      throw new Error(`expected ${contractId}`);
    }
    const body = JSON.parse(artifact.body);
    if (!isObject(body)) throw new Error('artifact body must be a JSON object');
    return { body, metadata: verified.metadata };
  } catch (error) {
    blockers.push(`${label} artifact is invalid or stale: ${error?.message ?? String(error)}`);
    return null;
  }
}

function resolveRepositorySnapshot(reference, artifacts, repositoryId, blockers) {
  const resolved = resolveEvidenceArtifact(
    reference,
    artifacts,
    REPOSITORY_SNAPSHOT_CONTRACT,
    blockers,
    'repository snapshot',
  );
  if (!resolved) return null;
  const validationStart = blockers.length;
  const { body, metadata } = resolved;
  if (
    body.schema_version !== 1 ||
    body.kind !== 'repository-snapshot' ||
    body.repository_id !== repositoryId ||
    metadata.owner_repository_id !== repositoryId ||
    metadata.approval_source !== 'trusted-repository-snapshot' ||
    metadata.approved_by !== 'trusted-repository-snapshot' ||
    metadata.source_revision !== body.snapshot_revision
  ) {
    blockers.push('repository snapshot identity, revision, or trusted source is invalid');
    return null;
  }
  if (!Array.isArray(body.revisions) || body.revisions.length === 0) {
    blockers.push('repository snapshot must contain revision-bound files');
    return null;
  }
  const revisionIds = [];
  for (const [revisionIndex, revision] of body.revisions.entries()) {
    if (!isObject(revision) || !REVISION.test(revision.revision ?? '') || !Array.isArray(revision.files) || revision.files.length === 0) {
      blockers.push(`repository snapshot revisions[${revisionIndex}] is malformed`);
      continue;
    }
    revisionIds.push(revision.revision);
    const paths = [];
    for (const [fileIndex, file] of revision.files.entries()) {
      if (!isObject(file) || !safeRelativePath(file.path) || !SHA256.test(file.sha256 ?? '') || !Array.isArray(file.locators) || file.locators.length === 0 || file.locators.some((locator) => !singleLine(locator))) {
        blockers.push(`repository snapshot revisions[${revisionIndex}].files[${fileIndex}] is malformed`);
        continue;
      }
      paths.push(file.path);
    }
    if (new Set(paths).size !== paths.length) blockers.push(`repository snapshot revision ${revision.revision} repeats a file path`);
  }
  if (new Set(revisionIds).size !== revisionIds.length) blockers.push('repository snapshot revisions must be unique');
  return blockers.length === validationStart ? body : null;
}

function resolveSnapshotFile(snapshot, { revision, path: filePath, locator, sha256 }, blockers, label) {
  if (!snapshot) return false;
  const revisionEntry = snapshot.revisions?.find((candidate) => candidate?.revision === revision);
  const file = revisionEntry?.files?.find((candidate) => candidate?.path === filePath);
  if (!file || file.sha256 !== sha256 || !Array.isArray(file.locators) || !file.locators.includes(locator)) {
    blockers.push(`${label} does not resolve in the trusted repository snapshot`);
    return false;
  }
  return true;
}

function validateBoundEvidence(item, { currentRevision, repositoryId, snapshot }, blockers, label) {
  if (!isObject(item) || !EVIDENCE_KINDS.has(item.kind)) {
    blockers.push(`${label} must use a supported typed evidence kind`);
    return false;
  }
  if (!safeRelativePath(item.path) || !singleLine(item.locator)) blockers.push(`${label} requires a safe path and exact locator`);
  if (item.reference !== `${item.path}#${item.locator}`) blockers.push(`${label} reference must be derived from its path and locator`);
  if (item.repository_id !== repositoryId) blockers.push(`${label} repository does not match the repair owner`);
  if (item.revision !== currentRevision) blockers.push(`${label} revision does not match the reviewed revision`);
  if (!SHA256.test(item.sha256 ?? '')) blockers.push(`${label} requires a sha256 content binding`);
  if (!isText(item.summary)) blockers.push(`${label} requires a summary`);
  return resolveSnapshotFile(snapshot, {
    revision: item.revision,
    path: item.path,
    locator: item.locator,
    sha256: item.sha256,
  }, blockers, label);
}

function resolveApprovalArtifact(reference, artifacts, blockers, label) {
  if (
    !isObject(reference) ||
    !safeRelativePath(reference.artifact_ref) ||
    !APPROVAL_HASH.test(reference.approval_hash ?? '')
  ) {
    blockers.push(`${label} must be a repository-relative approved artifact reference and approval hash`);
    return null;
  }
  if (!Array.isArray(artifacts)) {
    blockers.push(`${label} requires a trusted loaded approval artifact collection`);
    return null;
  }
  const matches = artifacts.filter((artifact) =>
    artifact?.metadata?.repository_relative_path === reference.artifact_ref);
  if (matches.length !== 1) {
    blockers.push(`${label} artifact is missing or ambiguous: ${reference.artifact_ref}`);
    return null;
  }
  try {
    const artifact = matches[0];
    const verified = verifyApprovedArtifact(artifact);
    if (artifact.metadata.approval_hash !== reference.approval_hash) {
      throw new Error('approval hash does not match the resolved artifact');
    }
    if (
      verified.metadata.artifact_kind !== 'release-evidence' ||
      verified.metadata.contract_id !== REPAIR_APPROVAL_CONTRACT
    ) {
      throw new Error('resolved artifact is not a repair approval contract');
    }
    const body = JSON.parse(artifact.body);
    if (!isObject(body)) throw new Error('approval body must be a JSON object');
    return { body, metadata: verified.metadata };
  } catch (error) {
    blockers.push(`${label} artifact is invalid or stale: ${error?.message ?? String(error)}`);
    return null;
  }
}

function validateResolvedApproval(
  resolved,
  { kind, findingId, revision, ownerRepositoryId, paths, changeKind, migrationRef },
  blockers,
  label,
) {
  if (!resolved) return null;
  const { body, metadata } = resolved;
  if (body.schema_version !== 1 || body.kind !== kind || body.status !== 'approved') blockers.push(`${label} approval must be typed and approved`);
  if (!STABLE_ID.test(body.approval_id ?? '') || !singleLine(body.actor)) blockers.push(`${label} approval requires a safe identity and actor`);
  if (body.finding_id !== findingId || metadata.change_ref !== findingId) blockers.push(`${label} approval must bind the finding identity`);
  if (body.base_revision !== revision || metadata.source_revision !== revision) blockers.push(`${label} approval must bind the current revision`);
  if (metadata.owner_repository_id !== ownerRepositoryId) blockers.push(`${label} approval belongs to a different repository owner`);
  if (metadata.approved_by !== body.actor) blockers.push(`${label} approval actor does not match approved artifact metadata`);
  const expectedApprovalSource = kind === 'approved-migration-decision'
    ? 'user-approved-migration-decision'
    : 'user-approved-repair-authority';
  if (metadata.approval_source !== expectedApprovalSource) blockers.push(`${label} approval source is not trusted for ${kind}`);
  if (!uniqueSafePaths(body.scope_paths) || !paths.every((candidate) => within(candidate, body.scope_paths))) {
    blockers.push(`${label} approval must cover the exact write scope`);
  }
  if (changeKind !== undefined && body.change_kind !== changeKind) blockers.push(`${label} approval must bind the change kind`);
  if (migrationRef !== undefined && body.decision_ref !== migrationRef) blockers.push(`${label} approval must bind the approved migration decision`);
  return body;
}

function validateApproval(reference, options, artifacts, blockers, label) {
  return validateResolvedApproval(
    resolveApprovalArtifact(reference, artifacts, blockers, label),
    options,
    blockers,
    label,
  );
}

function validateMigrationDecision(reference, {
  findingId,
  revision,
  ownerRepositoryId,
  proposedPathScopes,
  approvalArtifacts,
}, blockers) {
  const resolved = resolveApprovalArtifact(reference, approvalArtifacts, blockers, 'migration decision');
  const body = validateResolvedApproval(resolved, {
    kind: 'approved-migration-decision',
    findingId,
    revision,
    ownerRepositoryId,
    paths: proposedPathScopes,
  }, blockers, 'migration decision');
  if (!body) return null;
  if (!/^D-\d{3,}$/u.test(reference?.decision_id ?? '') || body.decision_id !== reference.decision_id) {
    blockers.push('migration decision must bind an exact D-* decision identity');
    return null;
  }
  return `${reference.artifact_ref}#${reference.decision_id}`;
}

function feedbackPushback(verdict, evidenceRefs) {
  const summaries = {
    conflicting: 'The requested edit conflicts with an approved contract or needs an explicit migration or compatibility decision.',
    incorrect: 'Current file, config, test, or contract evidence does not support the technical claim.',
    'not-applicable': 'Current ownership or scope evidence shows that the cited rule does not apply here.',
    stale: 'The cited locator no longer matches the current revision and must be re-reviewed.',
    unclear: 'Current evidence is insufficient to verify the technical claim; no edit is authorized.',
  };
  return {
    required: verdict !== 'correct',
    summary: verdict === 'correct' ? null : summaries[verdict],
    evidence_refs: evidenceRefs,
  };
}

function validateReviewAssessment(reference, artifacts, {
  findingId,
  repositoryId,
  currentRevision,
  evidenceRefs,
  verification,
  proposedChange,
}, blockers) {
  const resolved = resolveEvidenceArtifact(
    reference,
    artifacts,
    REVIEW_ASSESSMENT_CONTRACT,
    blockers,
    'review assessment',
  );
  if (!resolved) return false;
  const { body, metadata } = resolved;
  if (
    body.schema_version !== 1 ||
    body.kind !== 'review-assessment' ||
    body.finding_id !== findingId ||
    body.repository_id !== repositoryId ||
    body.revision !== currentRevision ||
    metadata.owner_repository_id !== repositoryId ||
    metadata.source_revision !== currentRevision ||
    metadata.change_ref !== findingId ||
    metadata.approval_source !== 'independent-review-verifier' ||
    metadata.approved_by !== body.verifier ||
    !singleLine(body.verifier)
  ) {
    blockers.push('review assessment identity, revision, or trusted verifier is invalid');
    return false;
  }
  if (!exactSet(body.evidence_refs, evidenceRefs)) blockers.push('review assessment does not bind the exact current evidence set');
  const expectedConflicts = normalizedConflicts(verification?.conflicts);
  if (!sameProjection(body.conflicts, expectedConflicts)) blockers.push('review assessment does not bind the normalized conflict set');
  if (!isObject(body.proposed_change) || body.proposed_change.kind !== proposedChange?.kind) {
    blockers.push('review assessment does not bind the proposed change kind');
  }
  if (!sameProjection(
    body.proposed_change?.migration_decision_identity,
    migrationDecisionIdentity(proposedChange),
  )) {
    blockers.push('review assessment does not bind the migration decision identity');
  }
  for (const field of [
    'current_context_read',
    'current_locator_matches',
    'scope_applies',
    'technical_claim_supported',
    'existing_mechanism_satisfies',
    'reverify_command',
  ]) {
    if (body[field] !== verification?.[field]) blockers.push(`review assessment contradicts ${field}`);
  }
  return true;
}

export function evaluateExternalReviewFeedback(input = {}) {
  input = isObject(input) ? input : {};
  const blockers = [];
  const source = input.repair_source;
  if (!isObject(source) || source.kind !== 'external-review-feedback') blockers.push('repair_source.kind must be external-review-feedback');
  if (!STABLE_ID.test(source?.review_id ?? '')) blockers.push('external review_id must be a stable safe identity');
  if (!SAFE_REVIEWER.test(source?.reviewer ?? '')) blockers.push('external reviewer must be a safe identity or source');
  if (!REVISION.test(source?.base_revision ?? '')) blockers.push('external review base_revision must be a 40-character revision');
  const fileScope = Array.isArray(source?.file_scope) ? source.file_scope : [];
  if (!uniqueSafePaths(fileScope)) blockers.push('external review file_scope must contain unique safe repository-relative paths');
  const original = source?.original_feedback;
  if (!isObject(original) || !['reference', 'text'].includes(original.kind) || !isText(original.value) || original.sanitized !== true || /\0/u.test(original.value)) {
    blockers.push('external original_feedback must be a sanitized text or reference');
  }
  if (!REVISION.test(input.current_revision ?? '')) blockers.push('external review current_revision must be a 40-character revision');
  if (!singleLine(input.owner_repository_id)) blockers.push('external review owner_repository_id is required');
  const evidenceArtifacts = Array.isArray(input.evidence_artifacts) ? input.evidence_artifacts : [];
  if (!Array.isArray(input.evidence_artifacts)) blockers.push('external feedback evidence_artifacts must be a trusted loaded artifact array');
  const snapshot = resolveRepositorySnapshot(
    input.repository_snapshot,
    evidenceArtifacts,
    input.owner_repository_id,
    blockers,
  );
  const finding = input.finding;
  if (!isObject(finding) || !STABLE_ID.test(finding.id ?? '')) blockers.push('external finding requires a stable id');
  if (!safeRelativePath(finding?.current_path)) blockers.push('external finding current_path must be repository-relative');
  if (!Number.isInteger(finding?.current_line) || finding.current_line < 1) blockers.push('external finding current_line must be a positive integer');
  if (!uniqueSafePaths(finding?.repair_scope_paths)) blockers.push('external finding requires unique safe repair_scope_paths');
  if (safeRelativePath(finding?.current_path) && !within(finding.current_path, fileScope)) blockers.push('external finding is outside repair_source.file_scope');
  if (safeRelativePath(finding?.current_path) && !within(finding.current_path, finding?.repair_scope_paths ?? [])) blockers.push('external finding is outside its repair scope');

  const verification = input.verification;
  if (!isObject(verification) || verification.current_context_read !== true) blockers.push('external feedback requires re-reading current code and cited context');
  if (typeof verification?.current_locator_matches !== 'boolean') blockers.push('external feedback must record whether the current locator matches');
  if (typeof verification?.scope_applies !== 'boolean') blockers.push('external feedback must record whether the cited scope applies');
  if (![true, false, null].includes(verification?.technical_claim_supported)) blockers.push('external feedback technical claim must be true, false, or null');
  if (typeof verification?.existing_mechanism_satisfies !== 'boolean') blockers.push('external feedback must record whether an existing mechanism satisfies the claim');
  const evidence = Array.isArray(verification?.evidence) ? verification.evidence : [];
  if (evidence.length === 0) blockers.push('external feedback requires current file, config, test, or contract evidence');
  for (const [index, item] of evidence.entries()) {
    validateBoundEvidence(item, {
      currentRevision: input.current_revision,
      repositoryId: input.owner_repository_id,
      snapshot,
    }, blockers, `external feedback evidence[${index}]`);
  }
  if (!Array.isArray(verification?.conflicts)) blockers.push('external feedback conflicts must be an array');
  const conflicts = normalizedConflicts(verification?.conflicts);
  for (const conflict of conflicts) {
    if (!isObject(conflict) || !['accepted-convention', 'approved-architecture', 'approved-spec', 'public-contract'].includes(conflict.kind) || !singleLine(conflict.reference) || !singleLine(conflict.owner)) {
      blockers.push('external feedback conflicts must identify an approved contract reference and owner');
    }
  }
  if (new Set(conflicts.map((conflict) => JSON.stringify(canonicalValue(conflict)))).size !== conflicts.length) {
    blockers.push('external feedback conflicts must be unique after normalization');
  }
  if (verification?.reverify_command !== null && !singleLine(verification?.reverify_command)) blockers.push('external feedback reverify_command must be one exact command or null');
  const evidenceRefs = [...new Set(evidence.filter(isObject).map(({ reference }) => reference).filter(singleLine))].sort();
  const proposedChange = input.proposed_change;
  validateReviewAssessment(
    verification?.assessment_receipt,
    evidenceArtifacts,
    {
      findingId: finding?.id,
      repositoryId: input.owner_repository_id,
      currentRevision: input.current_revision,
      evidenceRefs,
      verification,
      proposedChange,
    },
    blockers,
  );

  if (!isObject(proposedChange) || !CHANGE_KINDS.has(proposedChange.kind)) blockers.push('external feedback proposed_change.kind is unsupported');
  const migrationDecisionBlockers = [];
  const migrationDecision = proposedChange?.migration_decision;
  const migrationDecisionRef = migrationDecision !== null ? validateMigrationDecision(migrationDecision, {
    findingId: finding?.id,
    revision: input.current_revision,
    ownerRepositoryId: input.owner_repository_id,
    proposedPathScopes: Array.isArray(finding?.repair_scope_paths)
      ? finding.repair_scope_paths
      : [],
    approvalArtifacts: input.approval_artifacts,
  }, migrationDecisionBlockers) : null;
  const migrationDecisionValid = migrationDecisionRef !== null;
  if (migrationDecision !== null && !migrationDecisionValid) blockers.push(...migrationDecisionBlockers);

  let feedbackVerdict = 'unclear';
  let repairStatus = 'UNCLEAR';
  let decisionOwner = null;
  if (conflicts.length > 0 || (proposedChange?.kind === 'public-contract-rename' && !migrationDecisionValid)) {
    feedbackVerdict = 'conflicting';
    repairStatus = 'CONFLICTING';
    decisionOwner = conflicts[0]?.owner ?? 'public-contract-owner';
  } else if (verification?.current_locator_matches === false) {
    feedbackVerdict = 'stale';
    repairStatus = 'STALE';
  } else if (verification?.scope_applies === false) {
    feedbackVerdict = 'not-applicable';
    repairStatus = 'MIS-SCOPED';
  } else if (verification?.existing_mechanism_satisfies === true) {
    feedbackVerdict = 'not-applicable';
    repairStatus = 'REDUNDANT';
  } else if (verification?.technical_claim_supported === false) {
    feedbackVerdict = 'incorrect';
    repairStatus = 'REDUNDANT';
  } else if (verification?.technical_claim_supported === true) {
    feedbackVerdict = 'correct';
    repairStatus = 'VALID';
  }

  let writeTier = null;
  if (feedbackVerdict === 'conflicting') {
    writeTier = 'user-decision';
  } else if (feedbackVerdict === 'correct') {
    writeTier = proposedChange?.kind === 'mechanical'
      ? 'auto'
      : proposedChange?.kind === 'semantic'
        ? 'confirm'
        : 'user-decision';
  }
  if (feedbackVerdict === 'correct' && !singleLine(verification?.reverify_command)) blockers.push('correct external feedback requires an exact source-specific reverify command');
  return {
    valid: blockers.length === 0,
    feedback_verdict: feedbackVerdict,
    repair_status: repairStatus,
    write_tier: writeTier,
    write_eligible: blockers.length === 0 && feedbackVerdict === 'correct',
    decision_owner: decisionOwner,
    migration_decision_ref: migrationDecisionRef,
    reverify_command: singleLine(verification?.reverify_command) ? verification.reverify_command : null,
    pushback: feedbackPushback(feedbackVerdict, evidenceRefs),
    blockers,
  };
}

function validateCommandReceipt(reference, artifacts, attempt, { finding, identity, currentRevision }, blockers) {
  const resolved = resolveEvidenceArtifact(
    reference,
    artifacts,
    COMMAND_RECEIPT_CONTRACT,
    blockers,
    'repair command receipt',
  );
  if (!resolved) return null;
  const { body, metadata } = resolved;
  if (
    body.schema_version !== 1 ||
    body.kind !== 'repair-command-receipt' ||
    body.finding_id !== finding?.id ||
    body.repository_id !== identity?.owner_repository_id ||
    body.current_revision !== currentRevision ||
    body.result_revision !== attempt.result_revision ||
    body.attempt !== attempt.attempt ||
    metadata.owner_repository_id !== identity?.owner_repository_id ||
    metadata.source_revision !== attempt.result_revision ||
    metadata.change_ref !== finding?.id ||
    metadata.approval_source !== 'trusted-command-runner' ||
    metadata.approved_by !== 'trusted-command-runner'
  ) {
    blockers.push('repair command receipt identity, revisions, or trusted runner is invalid');
    return null;
  }
  if (!Number.isInteger(body.exit_code) || !['PASSED', 'FAILED'].includes(body.result)) {
    blockers.push('repair command receipt must contain a derived process result');
    return null;
  }
  const derived = body.exit_code === 0 ? 'PASSED' : 'FAILED';
  if (body.result !== derived) blockers.push('repair command receipt result contradicts its exit code');
  if (body.command !== attempt.verification_command) blockers.push('repair command receipt does not bind the exact verification command');
  if (!exactSet(body.changed_paths, attempt.changed_paths)) blockers.push('repair command receipt does not bind the exact changed paths');
  if (!sameProjection(body.change_manifest, attempt.change_manifest)) blockers.push('repair command receipt does not bind the exact change manifest');
  if (!sameProjection(body.repaired_evidence, attempt.repaired_evidence)) blockers.push('repair command receipt does not bind repaired evidence');
  if (!sameProjection(body.test_integrity, attempt.test_integrity)) blockers.push('repair command receipt does not bind test integrity evidence');
  if (attempt.validation_result !== derived) blockers.push('repair validation_result contradicts the trusted command receipt');
  return derived;
}

function validateAttemptIntegrity(attempt, {
  finding,
  identity,
  currentRevision,
  scopes,
  externalFeedback,
  snapshot,
  evidenceArtifacts,
}, blockers, index) {
  if (!isObject(attempt)) {
    blockers.push(`repair attempt ${index + 1} must be an object`);
    return null;
  }
  if (attempt.attempt !== index + 1) blockers.push('repair attempts must be sequential');
  if (!REVISION.test(attempt.result_revision ?? '') || attempt.result_revision === currentRevision) blockers.push('repair attempt requires a distinct result_revision');
  const changedPaths = Array.isArray(attempt.changed_paths) ? attempt.changed_paths : [];
  const changeManifest = Array.isArray(attempt.change_manifest) ? attempt.change_manifest : [];
  if (!Array.isArray(attempt.changed_paths) || attempt.changed_paths.length === 0) blockers.push('repair attempt requires a non-empty change set');
  if (!Array.isArray(attempt.change_manifest) || attempt.change_manifest.length === 0) blockers.push('repair attempt requires a non-empty hash-bound change manifest');
  const manifestPaths = [];
  for (const [manifestIndex, entry] of changeManifest.entries()) {
    if (!isObject(entry) || !safeRelativePath(entry.path) || !SHA256.test(entry.before_sha256 ?? '') || !SHA256.test(entry.after_sha256 ?? '') || entry.before_sha256 === entry.after_sha256) {
      blockers.push(`repair change_manifest[${manifestIndex}] must bind a safe changed path to distinct pre/post hashes`);
      continue;
    }
    manifestPaths.push(entry.path);
    resolveSnapshotFile(snapshot, {
      revision: currentRevision,
      path: entry.path,
      locator: 'FILE',
      sha256: entry.before_sha256,
    }, blockers, `repair change_manifest[${manifestIndex}] before state`);
    resolveSnapshotFile(snapshot, {
      revision: attempt.result_revision,
      path: entry.path,
      locator: 'FILE',
      sha256: entry.after_sha256,
    }, blockers, `repair change_manifest[${manifestIndex}] after state`);
  }
  if (!exactSet(changedPaths, manifestPaths)) blockers.push('repair changed_paths must exactly match the hash-bound change manifest');
  for (const changedPath of changedPaths) {
    if (!safeRelativePath(changedPath)) {
      blockers.push(`repair path must be canonical safe repository-relative: ${String(changedPath)}`);
      continue;
    }
    if (PROTECTED_ARTIFACT.test(changedPath)) blockers.push(`repair cannot change approved artifact: ${changedPath}`);
    if (!within(changedPath, scopes.owner)) blockers.push(`repair path is outside authorized owner scope: ${changedPath}`);
    if (!within(changedPath, scopes.finding)) blockers.push(`repair path is outside finding scope: ${changedPath}`);
    if (scopes.feedback && !within(changedPath, scopes.feedback)) blockers.push(`repair path is outside feedback scope: ${changedPath}`);
  }

  const repaired = attempt.repaired_evidence;
  if (!isObject(repaired)) {
    blockers.push('repair attempt requires repaired-condition evidence');
  } else {
    if (repaired.original_evidence_ref !== finding?.original_evidence_ref) blockers.push('repaired evidence does not link to the original finding evidence');
    if (repaired.repository_id !== identity?.owner_repository_id) blockers.push('repaired evidence belongs to a different repository');
    if (!singleLine(repaired.evidence_ref) || repaired.revision !== attempt.result_revision || !safeRelativePath(repaired.path) || !singleLine(repaired.locator) || !SHA256.test(repaired.sha256 ?? '')) {
      blockers.push('repaired evidence must bind an exact result revision, path, locator, and hash');
    }
    if (repaired.evidence_ref !== `${repaired.path}#${repaired.locator}`) blockers.push('repaired evidence_ref must derive from its path and locator');
    resolveSnapshotFile(snapshot, {
      revision: repaired.revision,
      path: repaired.path,
      locator: repaired.locator,
      sha256: repaired.sha256,
    }, blockers, 'repaired evidence');
  }

  const integrity = attempt.test_integrity;
  const changedTestPaths = changedPaths.filter((candidate) =>
    typeof candidate === 'string' &&
    /(^|\/)(?:test|tests|__tests__)(\/|$)|\.(?:spec|test)\.[cm]?[jt]sx?$/u.test(candidate));
  if (!isObject(integrity) || integrity.verifier !== 'contract-hash-v1') {
    blockers.push('repair attempt requires independent contract-hash test integrity evidence');
  } else {
    if (integrity.tests_changed !== (changedTestPaths.length > 0)) blockers.push('test integrity tests_changed does not match the changed path manifest');
    if (!exactSet(integrity.test_paths, changedTestPaths)) blockers.push('test integrity paths must exactly match changed tests');
    if (!SHA256.test(integrity.before_contract_hash ?? '') || !SHA256.test(integrity.after_contract_hash ?? '')) blockers.push('test integrity requires pre/post contract hashes');
    const beforeIds = integrity.assertion_ids_before;
    const afterIds = integrity.assertion_ids_after;
    if (!Array.isArray(beforeIds) || beforeIds.length === 0 || beforeIds.some((id) => !STABLE_ID.test(id)) || new Set(beforeIds).size !== beforeIds.length ||
        !Array.isArray(afterIds) || afterIds.some((id) => !STABLE_ID.test(id)) || new Set(afterIds).size !== afterIds.length) {
      blockers.push('test integrity requires unique stable pre/post assertion identities');
    } else if (beforeIds.some((id) => !afterIds.includes(id))) {
      blockers.push('test integrity detected a removed assertion and possible test weakening');
    }
    if (integrity.tests_changed === false && integrity.before_contract_hash !== integrity.after_contract_hash) blockers.push('unchanged tests must preserve the contract hash');
    if (integrity.tests_changed === true && integrity.before_contract_hash === integrity.after_contract_hash) blockers.push('changed tests must produce a new contract hash');
  }
  if (externalFeedback && attempt.verification_command !== externalFeedback.reverify_command) blockers.push('external feedback repair must re-run the exact source-specific command');
  return validateCommandReceipt(
    attempt.verification_receipt,
    evidenceArtifacts,
    attempt,
    { finding, identity, currentRevision },
    blockers,
  );
}

export function evaluateRepairContract(contract = {}) {
  contract = isObject(contract) ? contract : {};
  const blockers = [];
  const identity = isObject(contract?.artifact_identity) ? contract.artifact_identity : {};
  const finding = isObject(contract?.finding) ? contract.finding : {};
  const authority = isObject(contract?.write_authority) ? contract.write_authority : {};
  const approvalArtifacts = Array.isArray(contract?.approval_artifacts)
    ? contract.approval_artifacts
    : [];
  const evidenceArtifacts = Array.isArray(contract?.evidence_artifacts)
    ? contract.evidence_artifacts
    : [];
  const authorityPaths = Array.isArray(authority.allowed_paths) ? authority.allowed_paths : [];
  const findingPaths = Array.isArray(finding.repair_scope_paths) ? finding.repair_scope_paths : [];
  if (!Array.isArray(contract?.approval_artifacts)) blockers.push('repair approval_artifacts must be a trusted loaded artifact array');
  if (!Array.isArray(contract?.evidence_artifacts)) blockers.push('repair evidence_artifacts must be a trusted loaded artifact array');
  const currentRevision = contract?.source === 'external-review-feedback'
    ? contract?.feedback_review?.current_revision
    : contract?.current_revision;
  const externalFeedback = contract?.source === 'external-review-feedback'
    ? evaluateExternalReviewFeedback({
      repair_source: contract?.repair_source,
      current_revision: currentRevision,
      owner_repository_id: identity.owner_repository_id,
      approval_artifacts: approvalArtifacts,
      evidence_artifacts: evidenceArtifacts,
      repository_snapshot: contract?.repository_snapshot,
      finding,
      verification: contract?.feedback_review?.verification,
      proposed_change: contract?.feedback_review?.proposed_change,
    })
    : null;
  if (externalFeedback) blockers.push(...externalFeedback.blockers.map((blocker) => `external feedback: ${blocker}`));
  const snapshot = resolveRepositorySnapshot(
    contract?.repository_snapshot,
    evidenceArtifacts,
    identity.owner_repository_id,
    blockers,
  );
  const track = systemRegistry.tracks.find(({ id }) => id === contract?.subject_track);
  if (contract?.schema_version !== 1) blockers.push('repair schema_version must be 1');
  if (!REVISION.test(currentRevision ?? '')) blockers.push('repair current_revision must be a 40-character revision');
  if (!track || track.repair_supported !== true) blockers.push(`track is not repair-supported by the central registry: ${contract?.subject_track}`);
  if (!STABLE_ID.test(finding.id ?? '') || finding.status !== 'VALID') blockers.push('repair requires one validated finding identity');
  if (!uniqueSafePaths(finding.repair_scope_paths)) blockers.push('repair finding requires unique safe repair_scope_paths');
  if (!identity.owner_repository_id || !identity.execution_host_repository_id) blockers.push('repair artifact owner and execution host are required');
  if (finding.owner_repository_id !== identity.owner_repository_id) blockers.push('finding evidence belongs to a different repository owner');
  if (['external-review-feedback', 'review-code'].includes(contract?.source) && finding.selected_for_repair !== true) blockers.push('review finding was not selected for repair');
  if (externalFeedback) {
    if (finding.status !== externalFeedback.repair_status || finding.feedback_verdict !== externalFeedback.feedback_verdict) blockers.push('external feedback classification does not match current verified evidence');
    if (finding.write_tier !== externalFeedback.write_tier) blockers.push('external feedback write tier must be selected after classification');
    if (!externalFeedback.write_eligible) blockers.push(`external feedback verdict cannot authorize repair: ${externalFeedback.feedback_verdict}`);
  }
  if (authority.approved !== true || authority.owner_repository_id !== identity.owner_repository_id) blockers.push('write authority does not match the repair owner repository');
  if (!uniqueSafePaths(authority.allowed_paths)) blockers.push('repair write authority requires unique safe allowed_paths');
  validateApproval(authority.approval, {
    kind: 'owner-write-authority',
    findingId: finding.id,
    revision: currentRevision,
    ownerRepositoryId: identity.owner_repository_id,
    paths: authorityPaths,
  }, approvalArtifacts, blockers, 'owner write');
  if (externalFeedback?.write_tier === 'confirm') {
    validateApproval(authority.tier_approval, {
      kind: 'explicit-confirmation',
      findingId: finding.id,
      revision: currentRevision,
      ownerRepositoryId: identity.owner_repository_id,
      paths: authorityPaths,
      changeKind: contract?.feedback_review?.proposed_change?.kind,
    }, approvalArtifacts, blockers, 'confirm tier');
  }
  if (externalFeedback?.write_tier === 'user-decision' && externalFeedback.write_eligible) {
    validateApproval(authority.tier_approval, {
      kind: 'owner-decision',
      findingId: finding.id,
      revision: currentRevision,
      ownerRepositoryId: identity.owner_repository_id,
      paths: authorityPaths,
      changeKind: contract?.feedback_review?.proposed_change?.kind,
      migrationRef: externalFeedback.migration_decision_ref,
    }, approvalArtifacts, blockers, 'user-decision tier');
  }
  if (contract?.approved_artifact_mutation === true) blockers.push('repair cannot mutate an approved artifact');
  if ((contract?.repair_recursion_depth ?? 0) > 1) blockers.push('repair recursion depth exceeded');

  const attempts = contract?.attempts;
  const attemptResults = [];
  if (!Array.isArray(attempts)) {
    blockers.push('repair attempts ledger must be an array');
  } else {
    if (attempts.length > MAX_ATTEMPTS) blockers.push('repair attempt cap exceeded');
    for (const [index, attempt] of attempts.entries()) {
      attemptResults.push(validateAttemptIntegrity(attempt, {
        finding,
        identity,
        currentRevision,
        scopes: {
          owner: authorityPaths,
          finding: findingPaths,
          feedback: externalFeedback && Array.isArray(contract?.repair_source?.file_scope)
            ? contract.repair_source.file_scope
            : externalFeedback
              ? []
              : null,
        },
        externalFeedback,
        snapshot,
        evidenceArtifacts,
      }, blockers, index));
    }
  }

  const latestResult = attemptResults.at(-1) ?? null;
  const unresolved = latestResult !== 'PASSED';
  return {
    schema_version: 1,
    registry_version: systemRegistry.registry_version,
    subject_track: contract?.subject_track ?? null,
    status: blockers.length > 0 ? 'blocked' : unresolved ? 'repairing' : 'resolved',
    repair_authorized: blockers.length === 0,
    owner_repository_id: identity.owner_repository_id ?? null,
    execution_host_repository_id: identity.execution_host_repository_id ?? null,
    attempts_used: Array.isArray(attempts) ? attempts.length : 0,
    attempts_remaining: Math.max(0, MAX_ATTEMPTS - (Array.isArray(attempts) ? attempts.length : 0)),
    escalation_required: blockers.some((blocker) => blocker.includes('cap exceeded')) ||
      (Array.isArray(attempts) && attempts.length === MAX_ATTEMPTS && unresolved),
    feedback_verdict: externalFeedback?.feedback_verdict ?? null,
    feedback_write_tier: externalFeedback?.write_tier ?? null,
    technical_pushback: externalFeedback?.pushback ?? null,
    blockers: [...new Set(blockers)],
  };
}

export const repairAttemptCap = MAX_ATTEMPTS;
