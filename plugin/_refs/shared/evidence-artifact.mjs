import { verifyApprovedArtifact } from './approved-artifact.mjs';

const APPROVAL_HASH = /^sha256:v1:[a-f0-9]{64}$/u;
function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function safeRelativePath(value) {
  if (typeof value !== 'string' || value.trim() !== value || value === '' || /[\r\n\0\\]/u.test(value) || value.startsWith('/') || /^[A-Za-z]:\//u.test(value)) return false;
  return !value.split('/').some(segment => segment === '' || segment === '.' || segment === '..');
}

export function resolveEvidenceArtifact(reference, artifacts, contractId, blockers, label) {
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
