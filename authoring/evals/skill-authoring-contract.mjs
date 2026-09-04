import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyApprovedArtifact } from '../../_refs/shared/approved-artifact.mjs';

export const AUTHORING_SCHEMA_VERSION = 1;
export const PUBLIC_SKILL_CEILING = 23;
export const AUTHORING_FALLBACKS = Object.freeze([
  'existing-skill-mode',
  'shared-reference',
  'executable-helper',
  'test-fixture',
  'documentation-only',
]);

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FALLBACKS = new Set(AUTHORING_FALLBACKS);
const SKILL_NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const REVISION = /^[a-f0-9]{40}$/u;
const SHA256 = /^sha256:[a-f0-9]{64}$/u;
const APPROVAL_HASH = /^sha256:v1:[a-f0-9]{64}$/u;
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;
const TOKEN_SOURCES = new Set(['provider-dashboard', 'provider-response']);
const AUTHORING_CONTRACT_PATHS = Object.freeze([
  'authoring/evals/scenarios.json',
  'authoring/evals/skill-authoring-contract.mjs',
  'authoring/skills/sdcorejs-skill-authoring/SKILL.md',
]);
const AUTHORING_BASELINE_CANDIDATE_PATHS = Object.freeze(
  [...AUTHORING_CONTRACT_PATHS].sort(),
);
const AUTHORING_APPROVAL_CONTRACT = 'skill-authoring-approval:v1';
const LIVE_APPROVAL_CONTRACT = 'skill-authoring-live-approval:v1';
const LIVE_RUN_CONTRACT = 'skill-authoring-live-run:v1';
const PUBLIC_DISTRIBUTION_ROOTS = Object.freeze([
  'skills',
  '.claude',
  'plugin',
  'codex',
  '.cursor',
  '.github',
  'site',
  'docs',
]);
const TEXT_DISTRIBUTION_FILE = /\.(?:astro|html?|json|md|mdc|mjs|js|jsx|ts|tsx|txt|ya?ml)$/iu;
const PUBLIC_SCAN_IGNORED_DIRECTORIES = new Set(['.astro', '.git', 'coverage', 'dist', 'node_modules']);

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isText(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function safeRelativePath(value) {
  if (!isText(value) || value.includes('\\') || value.includes('\0')) return false;
  if (value.startsWith('/') || value.startsWith('./') || /^[A-Za-z]:\//u.test(value)) return false;
  return value.split('/').every((segment) => segment !== '' && segment !== '.' && segment !== '..');
}

function uniqueTextArray(value, { nonempty = false } = {}) {
  return Array.isArray(value) && (!nonempty || value.length > 0) && value.every(isText) && new Set(value).size === value.length;
}

function exactArray(left, right) {
  return Array.isArray(left) && Array.isArray(right) && left.length === right.length && left.every((value, index) => value === right[index]);
}

function finalize(errors) {
  return [...new Set(errors)].sort();
}

function result(errors, extra = {}) {
  const normalized = finalize(errors);
  return { valid: normalized.length === 0, ...extra, errors: normalized };
}

function digestEntries(entries) {
  const digest = createHash('sha256');
  for (const [name, bytes] of entries) {
    digest.update(name);
    digest.update('\0');
    digest.update(bytes);
    digest.update('\0');
  }
  return `sha256:${digest.digest('hex')}`;
}

function rawDigest(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function normalizedText(value) {
  return value.normalize('NFKC').replace(/\s+/gu, ' ').trim();
}

function normalizedSkillBody(value) {
  const parts = value.split(/^---\s*$/mu);
  return normalizedText(parts.length >= 3 ? parts.slice(2).join('---') : value);
}

function textShingles(value, width = 10) {
  const words = normalizedText(value).toLowerCase().split(' ').filter(Boolean);
  const shingles = new Set();
  for (let index = 0; index <= words.length - width; index += 1) {
    shingles.add(words.slice(index, index + width).join(' '));
  }
  return shingles;
}

function walkFiles(directory, prefix = '', ignoredDirectories = new Set()) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relative = prefix === '' ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory() && !ignoredDirectories.has(entry.name)) {
      files.push(...walkFiles(path.join(directory, entry.name), relative, ignoredDirectories));
    }
    else if (entry.isFile()) files.push(relative);
  }
  return files.sort();
}

function fileHash(relative, { normalizeTextEol = false } = {}) {
  if (!safeRelativePath(relative)) return null;
  try {
    const bytes = readFileSync(path.join(REPOSITORY_ROOT, relative));
    const canonicalBytes = normalizeTextEol
      ? Buffer.from(bytes.toString('utf8').replace(/\r\n?/gu, '\n'), 'utf8')
      : bytes;
    return digestEntries([[relative, canonicalBytes]]);
  } catch {
    return null;
  }
}

function hashFilesSync(root, files) {
  const entries = [...files]
    .sort()
    .map((relative) => [relative, readFileSync(path.join(root, relative))]);
  return digestEntries(entries);
}

function repositoryRevisionExists(revision) {
  if (!REVISION.test(revision ?? '')) return false;
  try {
    execFileSync('git', ['cat-file', '-e', `${revision}^{commit}`], {
      cwd: REPOSITORY_ROOT,
      stdio: 'ignore',
      windowsHide: true,
    });
    return true;
  } catch {
    return false;
  }
}

function gitFileAtRevision(revision, relative) {
  if (!REVISION.test(revision ?? '') || !safeRelativePath(relative)) return null;
  try {
    return execFileSync('git', ['show', `${revision}:${relative}`], {
      cwd: REPOSITORY_ROOT,
      encoding: 'buffer',
      windowsHide: true,
    });
  } catch {
    return null;
  }
}

function gitPathExistsAtRevision(revision, relative) {
  if (!REVISION.test(revision ?? '') || !safeRelativePath(relative)) return false;
  try {
    execFileSync('git', ['cat-file', '-e', `${revision}:${relative}`], {
      cwd: REPOSITORY_ROOT,
      stdio: 'ignore',
      windowsHide: true,
    });
    return true;
  } catch {
    return false;
  }
}

export function deriveAuthoringRepositoryStateAtRevision(revision) {
  if (!repositoryRevisionExists(revision)) {
    throw new Error('revision must resolve to a repository commit');
  }
  const listing = execFileSync(
    'git',
    ['ls-tree', '-r', '--name-only', '-z', revision, '--', 'skills'],
    { cwd: REPOSITORY_ROOT, encoding: 'buffer', windowsHide: true },
  ).toString('utf8');
  const files = listing.split('\0').filter(Boolean).sort();
  if (files.length === 0) throw new Error('revision contains no public skill sources');
  const entries = [];
  const names = [];
  for (const relative of files) {
    const bytes = gitFileAtRevision(revision, relative);
    if (bytes === null) throw new Error(`revision source is unavailable: ${relative}`);
    const match = bytes.toString('utf8').match(/^name:\s*([^\r\n]+)$/mu);
    if (!match || !SKILL_NAME.test(match[1].trim())) {
      throw new Error(`revision public skill has no normalized name: ${relative}`);
    }
    entries.push([relative, bytes]);
    names.push(match[1].trim());
  }
  names.sort();
  if (new Set(names).size !== names.length) {
    throw new Error('revision public skill inventory contains duplicate names');
  }
  return Object.freeze({
    public_count: names.length,
    public_names: Object.freeze(names),
    public_inventory_hash: digestEntries(entries),
  });
}

function currentRepositoryRevision() {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: REPOSITORY_ROOT,
      encoding: 'utf8',
      windowsHide: true,
    }).trim();
  } catch {
    return null;
  }
}

function currentRepositoryId() {
  try {
    const remote = execFileSync('git', ['config', '--get', 'remote.origin.url'], {
      cwd: REPOSITORY_ROOT,
      encoding: 'utf8',
      windowsHide: true,
    }).trim();
    const scp = remote.match(/^git@([^:]+):(.+)$/u);
    if (scp) return `${scp[1].toLowerCase()}/${scp[2].replace(/\.git\/?$/u, '').toLowerCase()}`;
    const parsed = new URL(remote.replace(/^git\+/u, ''));
    return `${parsed.hostname.toLowerCase()}/${parsed.pathname.replace(/^\/+|\/+$/gu, '').toLowerCase()}`;
  } catch {
    return null;
  }
}

function validateBoundManifest(manifest, expectedHash, errors, label, expectedPaths = null) {
  if (!Array.isArray(manifest) || manifest.length === 0) {
    errors.push(`${label} must be a non-empty repository file manifest`);
    return null;
  }
  const paths = [];
  const entries = [];
  for (const [index, binding] of manifest.entries()) {
    if (!isObject(binding) || !safeRelativePath(binding.path) || !SHA256.test(binding.sha256 ?? '')) {
      errors.push(`${label}[${index}] must bind a safe path and sha256`);
      continue;
    }
    paths.push(binding.path);
    const actual = fileHash(binding.path);
    if (actual === null || actual !== binding.sha256) {
      errors.push(`${label}[${index}] source is missing or stale`);
      continue;
    }
    entries.push([binding.path, readFileSync(path.join(REPOSITORY_ROOT, binding.path))]);
  }
  if (new Set(paths).size !== paths.length) errors.push(`${label} paths must be unique`);
  const sortedPaths = [...paths].sort();
  if (expectedPaths && !exactArray(sortedPaths, [...expectedPaths].sort())) {
    errors.push(`${label} does not match the current authoring contract sources`);
  }
  if (entries.length !== manifest.length) return null;
  entries.sort(([left], [right]) => left.localeCompare(right, 'en'));
  const actualHash = digestEntries(entries);
  if (actualHash !== expectedHash) errors.push(`${label} aggregate hash does not match its record`);
  return actualHash;
}

function readSingleSnapshot(manifest, record, errors, label, role) {
  if (!Array.isArray(manifest) || manifest.length !== 1) {
    errors.push(`${label} must contain exactly one typed snapshot`);
    return null;
  }
  const relative = manifest[0]?.path;
  if (!safeRelativePath(relative) || !relative.startsWith('authoring/evals/snapshots/')) {
    errors.push(`${label} must resolve under authoring/evals/snapshots`);
    return null;
  }
  let snapshot;
  try {
    snapshot = JSON.parse(readFileSync(path.join(REPOSITORY_ROOT, relative), 'utf8'));
  } catch {
    errors.push(`${label} must resolve to valid JSON`);
    return null;
  }
  if (!isObject(snapshot) || snapshot.schema_version !== AUTHORING_SCHEMA_VERSION || snapshot.artifact_role !== role) {
    errors.push(`${label} must resolve to a typed ${role}`);
    return null;
  }
  if (snapshot.scenario_id !== record.scenario_id || snapshot.base_revision !== record.source_revision) {
    errors.push(`${label} snapshot does not match the scenario and base revision`);
  }
  return snapshot;
}

function validateLifecycleManifestRoles(record, errors) {
  const state = readSingleSnapshot(
    record.source_state_manifest,
    record,
    errors,
    'source_state_manifest',
    'source-state-snapshot',
  );
  if (state && (state.phase !== record.phase || state.state !== record.source_state)) {
    errors.push('source_state_manifest snapshot does not match the phase and recorded source state');
  }
  if (
    state &&
    record.phase === 'RED' &&
    (
      JSON.stringify(state.baseline_source) !== JSON.stringify(record.baseline_source) ||
      JSON.stringify(state.baseline_execution) !== JSON.stringify(record.baseline_execution)
    )
  ) {
    errors.push('source_state_manifest snapshot does not bind the RED baseline source and execution');
  }

  if (record.phase !== 'REFACTOR') {
    const contract = readSingleSnapshot(
      record.contract_manifest,
      record,
      errors,
      'contract_manifest',
      'contract-snapshot',
    );
    if (contract && (
      contract.phase !== record.phase ||
      contract.expected_result !== record.result ||
      contract.structured_gate_available !== record.structured_gate_available
    )) {
      errors.push('contract_manifest snapshot does not match the phase and expected behavior');
    }
  }

  const behavior = readSingleSnapshot(
    record.behavior_manifest,
    record,
    errors,
    'behavior_manifest',
    'behavior-contract',
  );
  if (behavior) {
    if (!Array.isArray(behavior.phases) || !behavior.phases.includes(record.phase) || behavior.expected_result !== record.result) {
      errors.push('behavior_manifest snapshot does not apply to the record phase and result');
    }
    for (const field of [
      'task_success',
      'approval_complete',
      'ownership_complete',
      'verification_complete',
      'fresh_target_project_validation',
      'structured_gate_available',
    ]) {
      if (Object.hasOwn(behavior, field) && behavior[field] !== record[field]) {
        errors.push(`behavior_manifest snapshot contradicts ${field}`);
      }
    }
  }
}

function validateTranscriptBinding(record, errors) {
  if (!safeRelativePath(record.sanitized_transcript_ref) || !SHA256.test(record.sanitized_transcript_sha256 ?? '')) {
    errors.push('sanitized transcript must bind a repository-relative path and sha256');
    return;
  }
  const actualHash = fileHash(record.sanitized_transcript_ref, {
    normalizeTextEol: true,
  });
  if (actualHash === null || actualHash !== record.sanitized_transcript_sha256) {
    errors.push('sanitized transcript is missing or stale');
    return;
  }
  const transcript = readFileSync(
    path.join(REPOSITORY_ROOT, record.sanitized_transcript_ref),
    'utf8',
  ).replace(/\r\n?/gu, '\n').replace(/\n$/u, '');
  if (transcript !== record.sanitized_output) {
    errors.push('sanitized transcript content does not match sanitized_output');
  }
}

function validateBaselineEvidence(record, errors) {
  if (record.source_state !== 'clean repository revision baseline') {
    errors.push('RED source_state must identify a clean repository revision baseline');
  }
  const source = record.baseline_source;
  if (!isObject(source)) {
    errors.push('RED evidence requires baseline_source');
    return;
  }
  if (source.repository_id !== currentRepositoryId()) {
    errors.push('baseline_source belongs to a different repository');
  }
  if (source.revision !== record.source_revision) {
    errors.push('baseline_source revision must match source_revision');
  }
  if (!Number.isInteger(source.public_count) || source.public_count < 1) {
    errors.push('baseline_source public_count must be a positive integer');
  }
  if (!uniqueTextArray(source.public_names, { nonempty: true })) {
    errors.push('baseline_source public_names must be a non-empty unique array');
  }
  if (!SHA256.test(source.public_inventory_hash ?? '')) {
    errors.push('baseline_source public_inventory_hash must be a sha256 binding');
  }
  if (!exactArray(source.candidate_paths_absent, AUTHORING_BASELINE_CANDIDATE_PATHS)) {
    errors.push('baseline_source must prove the complete candidate contract was absent');
  }

  let derived = null;
  try {
    derived = deriveAuthoringRepositoryStateAtRevision(record.source_revision);
  } catch (error) {
    errors.push(`baseline_source cannot be derived: ${error?.message ?? String(error)}`);
  }
  if (derived) {
    if (source.public_count !== derived.public_count) {
      errors.push('baseline_source public_count contradicts the source revision');
    }
    if (!exactArray(source.public_names, derived.public_names)) {
      errors.push('baseline_source public_names contradict the source revision');
    }
    if (source.public_inventory_hash !== derived.public_inventory_hash) {
      errors.push('baseline_source public_inventory_hash contradicts the source revision');
    }
  }
  for (const relative of AUTHORING_BASELINE_CANDIDATE_PATHS) {
    if (gitPathExistsAtRevision(record.source_revision, relative)) {
      errors.push(`baseline candidate path already exists at source revision: ${relative}`);
    }
  }

  const execution = record.baseline_execution;
  if (!isObject(execution)) {
    errors.push('RED evidence requires baseline_execution');
    return;
  }
  if (execution.kind !== 'isolated-agent' || !SAFE_ID.test(execution.run_id ?? '')) {
    errors.push('baseline_execution requires an isolated-agent run identity');
  }
  if (!isText(execution.executed_at) || Number.isNaN(Date.parse(execution.executed_at))) {
    errors.push('baseline_execution executed_at must be an ISO-8601 timestamp');
  }
  if (execution.prompt_sha256 !== rawDigest(Buffer.from(record.prompt ?? '', 'utf8'))) {
    errors.push('baseline_execution prompt hash does not match the recorded prompt');
  }
  if (
    execution.transcript_ref !== record.sanitized_transcript_ref ||
    execution.transcript_sha256 !== record.sanitized_transcript_sha256
  ) {
    errors.push('baseline_execution transcript binding does not match the RED record');
  }
  if (execution.result !== record.result) {
    errors.push('baseline_execution result does not match the RED record');
  }
  if (execution.observed_public_count !== source.public_count) {
    errors.push('baseline_execution observed_public_count contradicts baseline_source');
  }
  if (!Number.isInteger(execution.proposed_public_skill_count) || execution.proposed_public_skill_count < 1) {
    errors.push('baseline_execution proposed_public_skill_count must be positive');
  }
  if (
    execution.post_change_count !==
    execution.observed_public_count + execution.proposed_public_skill_count
  ) {
    errors.push('baseline_execution post_change_count must derive from observed plus proposed skills');
  }
  if (execution.ceiling !== PUBLIC_SKILL_CEILING) {
    errors.push('baseline_execution ceiling must match the repository ceiling');
  }
}

function validateFileBinding(relative, expectedHash, errors, label) {
  if (!safeRelativePath(relative) || !SHA256.test(expectedHash ?? '')) {
    errors.push(`${label} must bind a repository-relative path and sha256`);
    return false;
  }
  const actualHash = fileHash(relative);
  if (actualHash === null || actualHash !== expectedHash) {
    errors.push(`${label} is missing or stale`);
    return false;
  }
  return true;
}

export function findInternalSkillLeaks({ root = REPOSITORY_ROOT } = {}) {
  const targetRoot = path.resolve(root);
  const internalPath = path.join(
    targetRoot,
    'authoring/skills/sdcorejs-skill-authoring/SKILL.md',
  );
  if (!existsSync(internalPath)) return ['authoring/skills/sdcorejs-skill-authoring/SKILL.md'];
  const internalBytes = readFileSync(internalPath);
  const internalHash = rawDigest(internalBytes);
  const internalBody = normalizedSkillBody(internalBytes.toString('utf8'));
  const internalShingles = textShingles(internalBody);
  const leaks = [];
  const candidates = [];
  for (const distributionRoot of PUBLIC_DISTRIBUTION_ROOTS) {
    const absoluteRoot = path.join(targetRoot, distributionRoot);
    if (!existsSync(absoluteRoot)) continue;
    for (const relative of walkFiles(absoluteRoot, '', PUBLIC_SCAN_IGNORED_DIRECTORIES)) {
      if (!TEXT_DISTRIBUTION_FILE.test(relative)) continue;
      candidates.push([`${distributionRoot}/${relative}`.replaceAll('\\', '/'), path.join(absoluteRoot, relative)]);
    }
  }
  for (const entry of readdirSync(targetRoot, { withFileTypes: true })) {
    if (entry.isFile() && TEXT_DISTRIBUTION_FILE.test(entry.name)) candidates.push([entry.name, path.join(targetRoot, entry.name)]);
  }
  for (const [relative, absolute] of candidates) {
    const bytes = readFileSync(absolute);
    const text = bytes.toString('utf8');
    const normalizedCandidate = normalizedText(text);
    const candidateShingles = textShingles(normalizedCandidate);
    const matchingShingles = [...internalShingles].filter((shingle) => candidateShingles.has(shingle)).length;
    const bodySimilarity = internalShingles.size > 0 && matchingShingles / internalShingles.size >= 0.8;
    if (
      rawDigest(bytes) === internalHash ||
      /^name:\s*sdcorejs-skill-authoring\s*$/mu.test(text) ||
      (internalBody.length > 0 && normalizedCandidate.includes(internalBody)) ||
      bodySimilarity
    ) {
      leaks.push(relative);
    }
  }
  return leaks.sort();
}

export function deriveAuthoringRepositoryState() {
  const publicFiles = walkFiles(path.join(REPOSITORY_ROOT, 'skills'));
  const entries = publicFiles.map((relative) => {
    const repositoryRelative = `skills/${relative}`;
    return [repositoryRelative, readFileSync(path.join(REPOSITORY_ROOT, repositoryRelative))];
  });
  const names = entries.map(([relative, bytes]) => {
    const match = bytes.toString('utf8').match(/^name:\s*([^\r\n]+)$/mu);
    if (!match || !SKILL_NAME.test(match[1].trim())) throw new Error(`public skill has no normalized name: ${relative}`);
    return match[1].trim();
  }).sort();
  if (new Set(names).size !== names.length) throw new Error('public skill inventory contains duplicate names');
  const routingPath = 'authoring/evals/scenarios.json';
  const routingBytes = readFileSync(path.join(REPOSITORY_ROOT, routingPath));
  const routing = JSON.parse(routingBytes.toString('utf8'));
  return Object.freeze({
    public_count: names.length,
    public_names: Object.freeze(names),
    public_inventory_hash: digestEntries(entries),
    routing_matrix_hash: digestEntries([[routingPath, routingBytes]]),
    routing_scenarios: Object.freeze((routing.scenarios ?? []).map(({ id, kind }) => Object.freeze({ id, kind }))),
  });
}

function validateFallback(fallback, errors) {
  if (!isObject(fallback)) {
    errors.push('fallback is required when a new public skill is not justified');
    return;
  }
  if (!FALLBACKS.has(fallback.kind)) errors.push('fallback.kind is unsupported');
  if (!isText(fallback.owner)) errors.push('fallback.owner is required');
  if (!isText(fallback.rationale)) errors.push('fallback.rationale is required');
}

function validateRoutingEvidence(value, expectedPolarity, repositoryState, errors, label) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array of repository-bound routing scenarios`);
    return;
  }
  const identities = [];
  for (const [index, item] of value.entries()) {
    if (!isObject(item) || item.kind !== 'routing-scenario') {
      errors.push(`${label}[${index}] must be typed routing-scenario evidence`);
      continue;
    }
    identities.push(item.scenario_id);
    if (item.artifact_ref !== 'authoring/evals/scenarios.json' || item.artifact_sha256 !== repositoryState.routing_matrix_hash) {
      errors.push(`${label}[${index}] must bind the current routing matrix hash`);
    }
    const scenario = repositoryState.routing_scenarios.find(({ id }) => id === item.scenario_id);
    if (!scenario || scenario.kind !== expectedPolarity || item.polarity !== expectedPolarity) {
      errors.push(`${label}[${index}] does not resolve to the required routing polarity`);
    }
  }
  if (new Set(identities).size !== identities.length) errors.push(`${label} must not repeat routing scenario identities`);
}

function resolveAuthoringArtifact(reference, artifacts, contractId, errors, label) {
  if (!isObject(reference) || !safeRelativePath(reference.artifact_ref) || !APPROVAL_HASH.test(reference.approval_hash ?? '')) {
    errors.push(`${label} must be a canonical artifact reference and approval hash`);
    return null;
  }
  if (!Array.isArray(artifacts)) {
    errors.push(`${label} requires a trusted loaded artifact collection`);
    return null;
  }
  const matches = artifacts.filter((artifact) =>
    artifact?.metadata?.repository_relative_path === reference.artifact_ref);
  if (matches.length !== 1) {
    errors.push(`${label} artifact is missing or ambiguous: ${reference.artifact_ref}`);
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
    errors.push(`${label} artifact is invalid or stale: ${error?.message ?? String(error)}`);
    return null;
  }
}

function validateApprovalArtifact(reference, expectedKind, input, repositoryState, errors, label) {
  if (reference === null) return false;
  if (!isObject(reference)) {
    errors.push(`${label} approval cannot be a caller-supplied boolean`);
    return false;
  }
  const resolved = resolveAuthoringArtifact(
    reference,
    input.approval_artifacts,
    AUTHORING_APPROVAL_CONTRACT,
    errors,
    `${label} approval`,
  );
  if (!resolved) return false;
  const { body: artifact, metadata } = resolved;
  const currentRevision = currentRepositoryRevision();
  if (artifact.schema_version !== 1 || artifact.kind !== expectedKind || artifact.status !== 'approved') errors.push(`${label} artifact is not an approved ${expectedKind}`);
  if (!SAFE_ID.test(artifact.approval_id ?? '') || !isText(artifact.actor)) errors.push(`${label} artifact requires an approval identity and actor`);
  if (artifact.capability_id !== input.capability_id || !exactArray(artifact.proposed_public_skills, input.proposed_public_skills)) errors.push(`${label} artifact scope does not match the proposal`);
  if (artifact.public_inventory_hash !== repositoryState.public_inventory_hash) errors.push(`${label} artifact is stale against the public inventory`);
  if (artifact.source_revision !== currentRevision || metadata.source_revision !== currentRevision) errors.push(`${label} artifact is stale against the current repository revision`);
  if (metadata.owner_repository_id !== currentRepositoryId()) errors.push(`${label} artifact belongs to a different repository`);
  if (metadata.change_ref !== input.capability_id || metadata.approved_by !== artifact.actor) errors.push(`${label} artifact metadata does not bind the proposal and actor`);
  const expectedSource = expectedKind === 'approved-ceiling-change'
    ? 'user-approved-skill-ceiling'
    : 'user-approved-skill-trigger';
  if (metadata.approval_source !== expectedSource) errors.push(`${label} artifact approval source is not trusted`);
  if (artifact.evaluation_only === true && (input.evaluation_mode !== true || !reference.artifact_ref.startsWith('test/e2e/fixtures/'))) {
    errors.push(`${label} evaluation-only approval cannot authorize a production decision`);
  }
  return errors.length === 0;
}

export function evaluateNewSkillDecision(input = {}) {
  const errors = [];
  const repositoryState = deriveAuthoringRepositoryState();
  const base = {
    create_public_skill: false,
    current_public_count: repositoryState.public_count,
    ceiling: PUBLIC_SKILL_CEILING,
    public_inventory_hash: repositoryState.public_inventory_hash,
  };
  if (!isObject(input)) return result(['proposal must be an object'], { decision: 'invalid', ...base, post_change_count: null, approvals_required: [] });
  if (input.schema_version !== AUTHORING_SCHEMA_VERSION) errors.push('schema_version must be 1');
  if (!Array.isArray(input.approval_artifacts)) errors.push('approval_artifacts must be a trusted loaded artifact array');
  if (!isText(input.capability_id)) errors.push('capability_id is required');
  for (const field of ['distinct_user_intent', 'distinct_lifecycle', 'distinct_artifact_or_execution_boundary', 'expressible_by_existing_surface', 'acceptable_surface_cost']) {
    if (typeof input[field] !== 'boolean') errors.push(`${field} must be boolean`);
  }
  validateRoutingEvidence(input.positive_routing_evidence, 'positive-routing', repositoryState, errors, 'positive_routing_evidence');
  validateRoutingEvidence(input.negative_routing_evidence, 'negative-routing', repositoryState, errors, 'negative_routing_evidence');
  if (input.current_public_count !== repositoryState.public_count) errors.push('current_public_count does not match the repository-derived inventory');
  if (input.inventory_hash !== repositoryState.public_inventory_hash) errors.push('inventory_hash does not match the repository-derived inventory');
  if (!Array.isArray(input.proposed_public_skills) || input.proposed_public_skills.length === 0 || input.proposed_public_skills.some((name) => !SKILL_NAME.test(name)) || new Set(input.proposed_public_skills).size !== input.proposed_public_skills.length) {
    errors.push('proposed_public_skills must contain at least one unique normalized name');
  } else if (input.proposed_public_skills.some((name) => repositoryState.public_names.includes(name))) {
    errors.push('proposed_public_skills must not duplicate the repository-derived inventory');
  }
  if (input.ceiling !== PUBLIC_SKILL_CEILING) errors.push('ceiling must remain 23');
  if (!isObject(input.approvals) || !Object.hasOwn(input.approvals, 'new_trigger') || !Object.hasOwn(input.approvals, 'ceiling_change')) {
    errors.push('approvals must explicitly declare new_trigger and ceiling_change artifact references');
  }

  const proposedCount = Array.isArray(input.proposed_public_skills) ? input.proposed_public_skills.length : 0;
  const postChangeCount = repositoryState.public_count + proposedCount;
  const approvalsRequired = proposedCount > 0 ? ['new-trigger'] : [];
  if (postChangeCount > PUBLIC_SKILL_CEILING) approvalsRequired.push('ceiling-change');
  approvalsRequired.sort();
  let newTriggerApproved = false;
  let ceilingChangeApproved = false;
  if (isObject(input.approvals)) {
    newTriggerApproved = validateApprovalArtifact(input.approvals.new_trigger, 'approved-new-trigger', input, repositoryState, errors, 'new-trigger');
    ceilingChangeApproved = validateApprovalArtifact(input.approvals.ceiling_change, 'approved-ceiling-change', input, repositoryState, errors, 'ceiling-change');
  }
  if (errors.length > 0) return result(errors, { decision: 'invalid', ...base, post_change_count: postChangeCount, approvals_required: approvalsRequired });

  const gatePasses = input.distinct_user_intent && input.distinct_lifecycle && input.distinct_artifact_or_execution_boundary &&
    !input.expressible_by_existing_surface && input.positive_routing_evidence.length > 0 && input.negative_routing_evidence.length > 0 && input.acceptable_surface_cost;
  if (!gatePasses) {
    validateFallback(input.fallback, errors);
    return result(errors, {
      decision: errors.length === 0 ? 'use-existing-surface' : 'invalid',
      ...base,
      fallback: errors.length === 0 ? structuredClone(input.fallback) : null,
      post_change_count: postChangeCount,
      approvals_required: approvalsRequired,
    });
  }

  const ceilingBlocked = postChangeCount > PUBLIC_SKILL_CEILING;
  if ((ceilingBlocked && !ceilingChangeApproved) || !newTriggerApproved) {
    return result([], {
      decision: 'blocked-approval',
      ...base,
      post_change_count: postChangeCount,
      approvals_required: approvalsRequired.filter((approval) =>
        approval === 'ceiling-change' ? ceilingBlocked && !ceilingChangeApproved : !newTriggerApproved),
    });
  }
  return result([], { decision: 'create-public-skill', ...base, create_public_skill: true, post_change_count: postChangeCount, approvals_required: [] });
}

export function validateAuthoringEvidence(record = {}) {
  const errors = [];
  if (!isObject(record)) return result(['authoring evidence must be an object']);
  if (record.schema_version !== AUTHORING_SCHEMA_VERSION) errors.push('schema_version must be 1');
  for (const field of ['record_id', 'phase', 'scenario_id', 'source_state', 'prompt', 'sanitized_output', 'result', 'exact_limitation']) {
    if (!isText(record[field])) errors.push(`${field} is required`);
  }
  if (!['RED', 'GREEN', 'REFACTOR'].includes(record.phase)) errors.push('phase is unsupported');
  if (!REVISION.test(record.source_revision ?? '')) errors.push('source_revision must be a 40-character revision');
  else if (!repositoryRevisionExists(record.source_revision)) errors.push('source_revision must resolve to a repository commit');
  for (const field of ['source_state_hash', 'contract_hash', 'behavior_contract_hash']) {
    if (!SHA256.test(record[field] ?? '')) errors.push(`${field} must be a sha256 binding`);
  }
  validateBoundManifest(record.source_state_manifest, record.source_state_hash, errors, 'source_state_manifest');
  validateBoundManifest(record.contract_manifest, record.contract_hash, errors, 'contract_manifest');
  validateBoundManifest(record.behavior_manifest, record.behavior_contract_hash, errors, 'behavior_manifest');
  validateLifecycleManifestRoles(record, errors);
  if (record.previous_record_id !== null && !SAFE_ID.test(record.previous_record_id ?? '')) errors.push('previous_record_id must be null or a stable identity');
  if (!SAFE_ID.test(record.baseline_record_id ?? '')) errors.push('baseline_record_id must be a stable identity');
  if (!Number.isInteger(record.turns) || record.turns < 1) errors.push('turns must be a positive integer');
  if (!Number.isInteger(record.visible_output_bytes) || record.visible_output_bytes < 0) errors.push('visible_output_bytes must be a non-negative integer');
  else if (isText(record.sanitized_output) && record.visible_output_bytes !== Buffer.byteLength(record.sanitized_output, 'utf8')) errors.push('visible_output_bytes does not match sanitized_output');
  for (const field of ['task_success', 'approval_complete', 'ownership_complete', 'verification_complete', 'fresh_target_project_validation', 'structured_gate_available']) {
    if (typeof record[field] !== 'boolean') errors.push(`${field} must be boolean`);
  }
  validateTranscriptBinding(record, errors);
  if (record.phase === 'RED') validateBaselineEvidence(record, errors);
  if (record.token_usage !== null) {
    if (!Number.isInteger(record.token_usage) || record.token_usage < 0) errors.push('token_usage must be null or a non-negative integer');
    if (!TOKEN_SOURCES.has(record.token_usage_source)) errors.push('token_usage_source must be provider-response or provider-dashboard');
  } else if (record.token_usage_source !== null) {
    errors.push('token_usage_source must be null when token_usage is unavailable');
  }
  if (record.runtime_metadata_available === true) {
    for (const field of ['model', 'effort', 'cli_runtime_version']) if (!isText(record[field])) errors.push(`${field} is required when runtime metadata is available`);
  } else if (record.runtime_metadata_available === false) {
    for (const field of ['model', 'effort', 'cli_runtime_version']) if (record[field] !== null) errors.push(`${field} must be null when runtime metadata is unavailable`);
  } else {
    errors.push('runtime_metadata_available must be boolean');
  }
  if (record.phase === 'RED' && (record.result !== 'EXPECTED_FAIL' || record.task_success !== false || record.verification_complete !== false || record.structured_gate_available !== false)) {
    errors.push('RED evidence must record the expected failure before the structured gate exists');
  }
  if (['GREEN', 'REFACTOR'].includes(record.phase) && (record.result !== 'PASS' || record.task_success !== true || record.approval_complete !== true || record.ownership_complete !== true || record.verification_complete !== true || record.structured_gate_available !== true)) {
    errors.push(`${record.phase} evidence must record a fully verified passing structured gate`);
  }
  if (record.fresh_target_project_validation === false && !/not (?:a )?fresh|no .*fresh|not fresh-target/iu.test(record.exact_limitation ?? '')) {
    errors.push('exact_limitation must disclose the absence of fresh target-project validation');
  }
  return result(errors);
}

export function validateAuthoringLifecycle(records = []) {
  const errors = [];
  if (!Array.isArray(records) || records.length !== 3) return result(['authoring lifecycle must contain exactly RED, GREEN, and REFACTOR records']);
  const phases = records.map((record) => record?.phase);
  if (!exactArray(phases, ['RED', 'GREEN', 'REFACTOR'])) errors.push('authoring lifecycle phase order must be RED, GREEN, REFACTOR');
  for (const [index, record] of records.entries()) {
    const validated = validateAuthoringEvidence(record);
    errors.push(...validated.errors.map((error) => `records[${index}]: ${error}`));
  }
  const [red, green, refactor] = records;
  if (!records.every((record) => record?.scenario_id === red?.scenario_id && record?.prompt === red?.prompt)) errors.push('authoring lifecycle records must evaluate the same scenario and prompt');
  if (new Set(records.map((record) => record?.record_id)).size !== 3) errors.push('authoring lifecycle record identities must be unique');
  if (red?.previous_record_id !== null || green?.previous_record_id !== red?.record_id || refactor?.previous_record_id !== green?.record_id) errors.push('authoring lifecycle records must form an exact predecessor chain');
  if (!records.every((record) => record?.baseline_record_id === red?.record_id)) errors.push('authoring lifecycle records must bind the RED baseline identity');
  if (!records.every((record) => record?.source_revision === red?.source_revision)) errors.push('authoring lifecycle records must bind the same repository revision');
  if (red?.contract_hash === green?.contract_hash || red?.behavior_contract_hash === green?.behavior_contract_hash) errors.push('GREEN must replace the failing RED contract');
  if (green?.behavior_contract_hash !== refactor?.behavior_contract_hash) errors.push('REFACTOR must preserve the GREEN behavior contract hash');
  if (new Set(records.map((record) => record?.source_state_hash)).size !== 3) errors.push('RED, GREEN, and REFACTOR must have distinct source-state hashes');
  const currentContractHash = hashFilesSync(REPOSITORY_ROOT, AUTHORING_CONTRACT_PATHS);
  if (refactor?.contract_hash !== currentContractHash) errors.push('terminal REFACTOR contract_hash must match the current authoring contract');
  validateBoundManifest(
    refactor?.contract_manifest,
    refactor?.contract_hash,
    errors,
    'terminal contract_manifest',
    AUTHORING_CONTRACT_PATHS,
  );
  return result(errors);
}

function validateScenarioSet(scenarios, errors) {
  const required = deriveAuthoringRepositoryState().routing_scenarios.map(({ id }) => id);
  if (!Array.isArray(scenarios) || !exactArray(scenarios.map((scenario) => scenario?.id), required)) {
    errors.push('live scenarios must exactly match the complete deterministic scenario set in order');
    return false;
  }
  return true;
}

function validateLiveRunReceipt(reference, artifacts, matrix, scenario, index, errors) {
  const resolved = resolveAuthoringArtifact(
    reference,
    artifacts,
    LIVE_RUN_CONTRACT,
    errors,
    `scenarios[${index}] run receipt`,
  );
  if (!resolved) return null;
  const { body, metadata } = resolved;
  if (
    body.schema_version !== AUTHORING_SCHEMA_VERSION ||
    body.kind !== 'live-agent-scenario-run' ||
    body.scenario_id !== scenario.id ||
    body.target_repository_id !== matrix.target_repository_id ||
    body.target_revision !== matrix.target_revision ||
    metadata.requirement_id !== scenario.id ||
    metadata.change_ref !== matrix.matrix_id ||
    metadata.owner_repository_id !== matrix.target_repository_id ||
    metadata.source_revision !== matrix.target_revision ||
    metadata.approval_source !== 'provider-execution-receipt' ||
    metadata.approved_by !== matrix.provider
  ) {
    errors.push(`scenarios[${index}] run receipt does not bind the scenario, target, revision, and provider`);
    return null;
  }
  const projectedFields = [
    'result',
    'task_success',
    'verification_complete',
    'provider',
    'model',
    'effort',
    'cli_runtime_version',
    'token_usage',
    'token_usage_source',
    'transcript_ref',
    'transcript_sha256',
    'exact_reason',
  ];
  for (const field of projectedFields) {
    if (body[field] !== scenario[field]) errors.push(`scenarios[${index}] projection contradicts its run receipt: ${field}`);
  }
  if (!validateFileBinding(body.transcript_ref, body.transcript_sha256, errors, `scenarios[${index}] transcript`)) return null;
  let transcript;
  try {
    transcript = JSON.parse(readFileSync(path.join(REPOSITORY_ROOT, body.transcript_ref), 'utf8'));
  } catch {
    errors.push(`scenarios[${index}] transcript must be structured JSON`);
    return null;
  }
  if (
    !isObject(transcript) ||
    transcript.schema_version !== AUTHORING_SCHEMA_VERSION ||
    transcript.kind !== 'sanitized-live-scenario-transcript' ||
    transcript.sanitized !== true ||
    transcript.scenario_id !== body.scenario_id ||
    transcript.result !== body.result ||
    transcript.target_repository_id !== body.target_repository_id ||
    transcript.target_revision !== body.target_revision ||
    transcript.provider !== body.provider ||
    transcript.model !== body.model
  ) {
    errors.push(`scenarios[${index}] transcript does not bind the receipt scenario, result, target, and runtime`);
    return null;
  }
  return body;
}

export function validateLiveAgentMatrix(matrix = {}) {
  const errors = [];
  if (!isObject(matrix)) return result(['live matrix must be an object']);
  if (matrix.schema_version !== AUTHORING_SCHEMA_VERSION) errors.push('schema_version must be 1');
  if (!isText(matrix.matrix_id)) errors.push('matrix_id is required');
  if (typeof matrix.explicit_authorization !== 'boolean') errors.push('explicit_authorization must be boolean');
  if (typeof matrix.full_live_agent_coverage !== 'boolean') errors.push('full_live_agent_coverage must be boolean');
  if (typeof matrix.fresh_target_project_validation !== 'boolean') errors.push('fresh_target_project_validation must be boolean');
  const complete = validateScenarioSet(matrix.scenarios, errors);
  if (matrix.explicit_authorization === false) {
    for (const field of ['provider', 'model', 'effort', 'cli_runtime_version', 'token_usage', 'token_usage_source', 'transcript_ref', 'transcript_sha256', 'authorization', 'target_repository_id', 'target_revision']) {
      if (matrix[field] !== null) errors.push(`${field} must remain null when live evaluation was not authorized`);
    }
    if (!Array.isArray(matrix.approval_artifacts) || matrix.approval_artifacts.length !== 0) errors.push('unauthorized approval_artifacts must be an empty array');
    if (!Array.isArray(matrix.run_receipts) || matrix.run_receipts.length !== 0) errors.push('unauthorized run_receipts must be an empty array');
    if (matrix.result !== 'NOT RUN') errors.push('an unauthorized live matrix must be NOT RUN');
    if (!isText(matrix.exact_reason) || !/explicit authorization was not provided/iu.test(matrix.exact_reason)) errors.push('exact_reason must state that explicit authorization was not provided');
    if (matrix.full_live_agent_coverage !== false) errors.push('full_live_agent_coverage cannot be claimed');
    if (matrix.fresh_target_project_validation !== false) errors.push('the authoring session is not fresh target-project validation');
    if (complete) {
      for (const [index, scenario] of matrix.scenarios.entries()) {
        if (!isObject(scenario) || scenario.result !== 'NOT RUN' || scenario.token_usage !== null || scenario.token_usage_source !== null || scenario.transcript_ref !== null || scenario.transcript_sha256 !== null || scenario.receipt_ref !== null || !isText(scenario.exact_reason)) {
          errors.push(`scenarios[${index}] must preserve complete structured NOT RUN evidence`);
        }
      }
    }
  } else if (matrix.explicit_authorization === true) {
    const approvalArtifacts = Array.isArray(matrix.approval_artifacts) ? matrix.approval_artifacts : [];
    const runReceipts = Array.isArray(matrix.run_receipts) ? matrix.run_receipts : [];
    if (!Array.isArray(matrix.approval_artifacts)) errors.push('authorized approval_artifacts must be a trusted loaded artifact array');
    if (!Array.isArray(matrix.run_receipts)) errors.push('authorized run_receipts must be a trusted loaded artifact array');
    if (complete && runReceipts.length !== matrix.scenarios.length) errors.push('run_receipts must exactly account for the complete scenario set');
    if (complete) {
      const receiptPaths = matrix.scenarios.map((scenario) => scenario?.receipt_ref?.artifact_ref);
      if (receiptPaths.some((value) => !safeRelativePath(value)) || new Set(receiptPaths).size !== receiptPaths.length) {
        errors.push('scenario run receipt references must be safe and unique');
      }
    }
    const authorizationResolved = resolveAuthoringArtifact(
      matrix.authorization,
      approvalArtifacts,
      LIVE_APPROVAL_CONTRACT,
      errors,
      'live evaluation approval',
    );
    const authorization = authorizationResolved?.body ?? null;
    const authorizationMetadata = authorizationResolved?.metadata ?? null;
    if (!authorization || authorization.schema_version !== AUTHORING_SCHEMA_VERSION || authorization.kind !== 'credentialed-provider-evaluation' || authorization.status !== 'approved' || !SAFE_ID.test(authorization.approval_id ?? '') || !isText(authorization.actor) || !isText(authorization.scope)) {
      errors.push('authorized live evaluation requires a resolved actor- and scope-bound approval artifact');
    }
    for (const field of ['provider', 'model', 'effort', 'cli_runtime_version']) if (!isText(matrix[field])) errors.push(`${field} is required for an authorized live evaluation`);
    if (!isText(matrix.target_repository_id) || !REVISION.test(matrix.target_revision ?? '')) errors.push('authorized live evaluation requires a target repository and revision');
    if (!['PASS', 'FAIL'].includes(matrix.result)) errors.push('authorized live result must be PASS or FAIL');
    if (!Number.isInteger(matrix.token_usage) || matrix.token_usage < 0 || !TOKEN_SOURCES.has(matrix.token_usage_source)) errors.push('authorized live token usage requires provider provenance');
    validateFileBinding(matrix.transcript_ref, matrix.transcript_sha256, errors, 'authorized live transcript');
    if (authorization) {
      const currentRevision = currentRepositoryRevision();
      const currentRepository = currentRepositoryId();
      if (
        authorization.provider !== matrix.provider ||
        authorization.model !== matrix.model ||
        authorization.effort !== matrix.effort ||
        authorization.cli_runtime_version !== matrix.cli_runtime_version ||
        authorization.matrix_id !== matrix.matrix_id ||
        authorization.target_repository_id !== matrix.target_repository_id ||
        authorization.target_revision !== matrix.target_revision ||
        authorization.matrix_transcript_ref !== matrix.transcript_ref ||
        authorization.matrix_transcript_sha256 !== matrix.transcript_sha256 ||
        !exactArray(authorization.scenario_ids, matrix.scenarios.map(({ id }) => id)) ||
        !/complete ten-scenario authoring live matrix/iu.test(authorization.scope)
      ) {
        errors.push('live approval artifact scope does not match the runtime, target, transcript, and complete matrix');
      }
      if (
        authorization.source_revision !== currentRevision ||
        authorizationMetadata?.source_revision !== currentRevision ||
        authorizationMetadata?.owner_repository_id !== currentRepository ||
        authorizationMetadata?.change_ref !== matrix.matrix_id ||
        authorizationMetadata?.approved_by !== authorization.actor ||
        authorizationMetadata?.approval_source !== 'user-approved-live-agent-evaluation'
      ) {
        errors.push('live approval artifact is stale or does not come from the trusted authoring approval source');
      }
      if (authorization.evaluation_only === true && (matrix.evaluation_mode !== true || !matrix.authorization.artifact_ref.startsWith('test/e2e/fixtures/'))) {
        errors.push('evaluation-only live approval cannot authorize a production matrix');
      }
    }
    let executedComplete = complete;
    let tokenTotal = 0;
    const scenarioResults = [];
    if (complete) {
      for (const [index, scenario] of matrix.scenarios.entries()) {
        if (!isObject(scenario) || !['PASS', 'FAIL'].includes(scenario.result) || typeof scenario.task_success !== 'boolean' || typeof scenario.verification_complete !== 'boolean' ||
            !Number.isInteger(scenario.token_usage) || scenario.token_usage < 0 || !TOKEN_SOURCES.has(scenario.token_usage_source) || !isText(scenario.provider) || !isText(scenario.model) || !isText(scenario.effort) || !isText(scenario.cli_runtime_version) || !isText(scenario.exact_reason)) {
          errors.push(`scenarios[${index}] must contain complete provider-bound live evidence`);
          executedComplete = false;
          continue;
        }
        const receipt = validateLiveRunReceipt(
          scenario.receipt_ref,
          runReceipts,
          matrix,
          scenario,
          index,
          errors,
        );
        if (!receipt) executedComplete = false;
        if (scenario.provider !== matrix.provider || scenario.model !== matrix.model || scenario.effort !== matrix.effort || scenario.cli_runtime_version !== matrix.cli_runtime_version) {
          errors.push(`scenarios[${index}] runtime metadata contradicts the matrix`);
        }
        if (scenario.token_usage_source !== matrix.token_usage_source) errors.push(`scenarios[${index}] token provenance contradicts the matrix`);
        if (scenario.result === 'PASS' && (scenario.task_success !== true || scenario.verification_complete !== true)) errors.push(`scenarios[${index}] PASS contradicts incomplete task or verification state`);
        if (scenario.result === 'FAIL' && scenario.task_success === true && scenario.verification_complete === true) errors.push(`scenarios[${index}] FAIL contradicts complete task and verification state`);
        tokenTotal += scenario.token_usage;
        scenarioResults.push(scenario.result);
      }
    }
    if (complete && tokenTotal !== matrix.token_usage) errors.push('matrix token_usage must equal the sum of scenario token usage');
    if (complete && scenarioResults.length === matrix.scenarios.length) {
      const derivedResult = scenarioResults.every((scenarioResult) => scenarioResult === 'PASS') ? 'PASS' : 'FAIL';
      if (matrix.result !== derivedResult) errors.push('matrix result contradicts the derived scenario aggregate');
    }
    if (matrix.full_live_agent_coverage !== executedComplete) errors.push('full_live_agent_coverage must reflect the complete executed scenario set');
    const freshTargetDerived = executedComplete &&
      isText(matrix.target_repository_id) &&
      REVISION.test(matrix.target_revision ?? '') &&
      matrix.target_repository_id !== currentRepositoryId();
    if (matrix.fresh_target_project_validation !== freshTargetDerived) errors.push('fresh_target_project_validation must derive from complete target- and revision-bound run receipts');
    if (matrix.result === 'PASS' && !freshTargetDerived) errors.push('a passing live matrix requires fresh target-project validation');
    if (!isText(matrix.exact_reason)) errors.push('authorized live matrix requires an exact_reason');
  }
  return result(errors);
}

async function hashFiles(root, files) {
  const entries = [];
  for (const relative of [...files].sort()) entries.push([relative, await readFile(path.join(root, relative))]);
  return digestEntries(entries);
}

export function hashAuthoringContract(root) {
  return hashFiles(root, [
    'authoring/evals/scenarios.json',
    'authoring/evals/skill-authoring-contract.mjs',
    'authoring/skills/sdcorejs-skill-authoring/SKILL.md',
  ]);
}

export { hashFiles as hashAuthoringFiles };
