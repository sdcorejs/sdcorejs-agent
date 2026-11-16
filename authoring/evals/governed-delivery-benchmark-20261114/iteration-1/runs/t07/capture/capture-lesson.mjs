import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir, mkdir, lstat } from 'node:fs/promises';
import path from 'node:path';
import { lessonIdentity, validateLesson, evaluateLessonFreshness, selectRelevantLessons, planLessonCapture } from '/workspace/work/sdcorejs-benchmark-20261114/experiment/packs/p42/_refs/shared/learning-loop.mjs';
import { resolveExploreWriteAuthority } from '/workspace/work/sdcorejs-benchmark-20261114/experiment/packs/p42/_refs/shared/explore-contract.mjs';
import { classifyArtifact, scanSensitiveArtifactContent, parseArtifactFrontmatter } from '/workspace/work/sdcorejs-benchmark-20261114/experiment/packs/p42/_refs/shared/artifact-lifecycle.mjs';

const root = '/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t07/target';
const cap = '/workspace/work/sdcorejs-benchmark-20261114/experiment/trials/t07/capture';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
const hashFile = async relative => sha(await readFile(path.join(root, relative)));
const run = JSON.parse(await readFile(path.join(cap, 'regression-result.json')));
assert.equal(run.exit_code, 0);
assert.equal(run.post_run_source_unchanged, true);
assert.equal(run.screening.sensitive_patterns_found, false);
const raw = await readFile(path.join(cap, 'regression-output.txt'), 'utf8');
assert.equal(sha(raw), run.output_sha256);
assert.match(raw, /pass 3/);
assert.match(raw, /fail 0/);
assert.match(raw, /skipped 0/);
assert.deepEqual(scanSensitiveArtifactContent('regression-output.txt', raw), []);
for (const [relative, hash] of Object.entries(run.source_fingerprints)) assert.equal(await hashFile(relative), hash);

const inventory = [];
async function discover(relative) {
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    const filename = relative + '/' + entry.name;
    assert.equal(entry.isSymbolicLink(), false);
    if (entry.isDirectory()) await discover(filename);
    else if (entry.name.endsWith('.json')) {
      const document = JSON.parse(await readFile(path.join(root, filename), 'utf8'));
      inventory.push({ path: filename, metadata: {
        owner_repository_id: document.owner_repository_id, track: document.track,
        concept_id: document.concept_id, lesson_id: document.lesson_id, applicability: document.applicability,
      }, document });
    } else if (entry.name.endsWith('.md')) {
      // Inspect frontmatter only. An unrelated legacy body is never used as authority.
      const file = await readFile(path.join(root, filename));
      const end = file.indexOf(Buffer.from('\n---'), 4);
      const starts = file.subarray(0, 4).toString() === '---\n';
      const metadata = starts && end >= 4 ? parseArtifactFrontmatter(file.subarray(0, end + 4).toString()) : {};
      inventory.push({ path: filename, metadata, body_loaded: false, status: 'legacy-unverified', reason: 'No verified-lesson schema, repository/applicability or proof fingerprints; unrelated payment scope.' });
    }
  }
}
await discover('.sdcorejs/memories');
assert.equal(inventory.filter(i => i.path.endsWith('old-payment-advice.md')).length, 1);
const proofPath = '.sdcorejs/docs/general/2026-11-14-normalize-category-verification.md';
const proofMetadata = {
  artifact_id: 'verification-normalize-category-null-input-2026-11-14',
  artifact_kind: 'execution-doc',
  change_ref: 'normalize-category-null-input',
  source_spec: 'none', source_plan: 'none',
  commit_policy: 'with-change', owner: 'sdcorejs-explore',
  owner_repository_id: run.owner_repository_id, owner_role: 'sequential-owner',
};
const sourcePaths = ['src/category.mjs', 'test/category.test.mjs', 'package.json', 'inputs/fix.diff'];
const proof = '---\n' + Object.entries(proofMetadata).map(([key, value]) => key + ': ' + value).join('\n') + '\n---\n\n'
  + '# Category normalization regression evidence\n\n'
  + 'Command: `node --test test/category.test.mjs`; repository-relative cwd: `.`.\n'
  + 'Result: PASSED, exit 0; 3 tests passed, 0 failed, 0 skipped.\n'
  + 'Cases: `null is empty`, `undefined is empty`, `trim and lowercase`.\n'
  + 'Source revision: `' + run.source_revision + '`; Node: `' + run.node_version + '`.\n'
  + 'Observed at: ' + run.finished_at + '.\n'
  + 'SHA-256 of screened command output: `' + run.output_sha256 + '`.\n\n'
  + 'The supplied diff removes unconditional trim and introduces a nullish guard. Current source matches its fixed line. '
  + 'The two nullish cases return an empty string; the string case preserves trimming and lowercasing. '
  + 'This is focused pure-function regression evidence, not full application, API or browser evidence.\n\n'
  + '| File | SHA-256 at execution |\n|---|---|\n'
  + sourcePaths.map(p => '| `' + p + '` | `' + run.source_fingerprints[p] + '` |').join('\n') + '\n\n'
  + 'The default package test script runs only test/unit.test.mjs, so the category regression must be selected explicitly with the command above. '
  + 'No source, tests or package scripts were changed. The original output contains only synthetic test names and Node runner statistics; no secrets or personal data were found. '
  + 'Raw output remains outside the repository in the authorized capture folder. This document is the durable, sanitized proof summary.\n';
assert.deepEqual(scanSensitiveArtifactContent(proofPath, proof), []);
const proofClassification = classifyArtifact({ path: proofPath, metadata: proofMetadata, changeRef: proofMetadata.change_ref, owner: 'sdcorejs-explore' });
assert.equal(proofClassification.bucket, 'required_with_change');

const candidate = {
  schema_version: 1, artifact_kind: 'memory', owner: 'sdcorejs-explore',
  owner_repository_id: run.owner_repository_id, owner_role: 'sequential-owner',
  track: 'node', stack_profile: 'node-general', source_skill: 'sdcorejs-explore',
  concept_id: 'normalization.nullish-category',
  change_ref: 'normalize-category-null-input', source_spec: 'none', source_plan: 'none',
  commit_policy: 'conditional', confidence: 'high',
  created_at: run.finished_at,
  problem: 'normalizeCategory previously threw when its input was null or undefined instead of returning an empty category.',
  root_cause: 'The previous implementation in inputs/fix.diff called value.trim() before checking for nullish input. Null and undefined cannot provide that method.',
  resolution: 'At this category boundary, check value == null before trimming and lowercasing. Return an empty string for null or undefined, and preserve existing string normalization. This evidence supports this function and its nullish contract only; it does not establish a policy for all normalizers, non-string objects or numbers, other falsy values, or payment logic.',
  regression_protection: {
    description: 'Run the existing category regression explicitly: node --test test/category.test.mjs. It checks null, undefined, and trimming/lowercasing of a string. package.json scripts.test selects only test/unit.test.mjs and does not include these cases.',
    paths: ['test/category.test.mjs'],
  },
  applicability: {
    tracks: ['node'], modules: [], boundaries: ['category-normalization'],
    paths: ['src/category.mjs', 'test/category.test.mjs'],
    keywords: ['normalizeCategory', 'normalization', 'null-input', 'undefined'],
  },
  source_revision: run.source_revision,
  source_fingerprints: sourcePaths.map(p => ({ path: p, sha256: run.source_fingerprints[p] })),
  verification: {
    result: 'PASSED', command: run.command, cwd: '.',
    source_revision: run.source_revision, proof: { path: proofPath, sha256: sha(proof) },
  },
  proposed_convention: null, redaction_applied: true,
};
candidate.lesson_id = lessonIdentity(candidate);
candidate.artifact_id = 'memory-' + candidate.lesson_id;
assert.deepEqual(validateLesson(candidate), { ok: true, errors: [] });
const authorityOptions = { action: 'memories-write-approved', explicit_authority: true, worker_role: 'sequential-owner', owner_repository_id: run.owner_repository_id };
const authority = resolveExploreWriteAuthority(authorityOptions);
assert.equal(authority.write_allowed, true);
const sourceHashes = Object.fromEntries(await Promise.all(sourcePaths.map(async p => [p, await hashFile(p)])));
sourceHashes[proofPath] = sha(proof);
const existing = inventory.filter(i => i.document).map(i => i.document);
const plan = planLessonCapture({ ...authorityOptions, candidate, existing, source_hashes: sourceHashes });
assert.equal(plan.status, 'ready');
assert.equal(plan.write.expected_existing, 'absent');
assert.deepEqual(scanSensitiveArtifactContent(plan.write.path, json(candidate)), []);
const lessonClassification = classifyArtifact({ path: plan.write.path, metadata: candidate, changeRef: candidate.change_ref, owner: 'sdcorejs-explore', ownedSharedPaths: [plan.write.path] });
assert.equal(lessonClassification.bucket, 'shared_owned');

async function persistAbsent(relative, bytes) {
  const target = path.join(root, relative);
  assert.ok(target.startsWith(root + '/.sdcorejs/'));
  const parent = path.dirname(target);
  await mkdir(parent, { recursive: true });
  let cursor = root;
  for (const segment of relative.split('/').slice(0, -1)) {
    cursor = path.join(cursor, segment);
    assert.equal((await lstat(cursor)).isSymbolicLink(), false);
  }
  await writeFile(target, bytes, { flag: 'wx' });
  assert.equal(sha(await readFile(target)), sha(bytes));
}
// Recheck all original bytes immediately before the authorized absent-target writes.
for (const [relative, hash] of Object.entries(run.source_fingerprints)) assert.equal(await hashFile(relative), hash);
await persistAbsent(proofPath, proof);
sourceHashes[proofPath] = await hashFile(proofPath);
const currentPlan = planLessonCapture({ ...authorityOptions, candidate, existing, source_hashes: sourceHashes });
assert.equal(currentPlan.status, 'ready');
await persistAbsent(currentPlan.write.path, json(currentPlan.write.document));
const persisted = JSON.parse(await readFile(path.join(root, currentPlan.write.path)));
assert.deepEqual(validateLesson(persisted), { ok: true, errors: [] });
const reloadedHashes = Object.fromEntries(await Promise.all([...sourcePaths, proofPath].map(async p => [p, await hashFile(p)])));
assert.equal(evaluateLessonFreshness(persisted, { source_hashes: reloadedHashes }).status, 'fresh');
const noChange = planLessonCapture({ ...authorityOptions, candidate: persisted, existing: [persisted], source_hashes: reloadedHashes });
assert.equal(noChange.status, 'unchanged');

const scope = { tracks: ['node'], boundaries: ['category-normalization'], paths: ['src/category.mjs'], keywords: ['normalization'] };
const options = { owner_repository_id: run.owner_repository_id, scope, source_hashes: reloadedHashes };
const compact = result => ({ ...result, selected: result.selected.map(doc => ({ lesson_id: doc.lesson_id, concept_id: doc.concept_id })) });
const positive = selectRelevantLessons([persisted], options);
assert.equal(positive.selected.length, 1);

// Drift controls use actual alternative bytes from the provided pre-fix diff and
// isolated capture copies. Target application/proof files remain unchanged.
const originalLine = (await readFile(path.join(root, 'inputs/fix.diff'), 'utf8')).split('\n').find(line => line.startsWith('-')).slice(1) + '\n';
await writeFile(path.join(cap, 'pre-fix-category-control.mjs'), originalLine, { flag: 'wx' });
const alteredTest = Buffer.concat([await readFile(path.join(root, 'test/category.test.mjs')), Buffer.from('\n// hypothetical test-file drift control\n')]);
await writeFile(path.join(cap, 'changed-test-control.txt'), alteredTest, { flag: 'wx' });
const alteredProof = Buffer.concat([await readFile(path.join(root, proofPath)), Buffer.from('\nHypothetical proof drift control.\n')]);
await writeFile(path.join(cap, 'changed-proof-control.txt'), alteredProof, { flag: 'wx' });
const staleSource = selectRelevantLessons([persisted], { ...options, source_hashes: { ...reloadedHashes, 'src/category.mjs': sha(originalLine) } });
const staleTest = selectRelevantLessons([persisted], { ...options, source_hashes: { ...reloadedHashes, 'test/category.test.mjs': sha(alteredTest) } });
const staleProof = selectRelevantLessons([persisted], { ...options, source_hashes: { ...reloadedHashes, [proofPath]: sha(alteredProof) } });
for (const result of [staleSource, staleTest, staleProof]) { assert.equal(result.selected.length, 0); assert.equal(result.excluded[0].reason, 'stale'); }
const missingHashes = { ...reloadedHashes };
delete missingHashes[proofPath];
const missingProof = selectRelevantLessons([persisted], { ...options, source_hashes: missingHashes });
assert.equal(missingProof.excluded[0].reason, 'unknown');
const conflicting = selectRelevantLessons([persisted], { ...options, conflicting_paths: ['src/category.mjs'] });
assert.equal(conflicting.excluded[0].reason, 'conflicting');
const unrelatedTask = selectRelevantLessons([persisted], { ...options, scope: { boundaries: ['payment'], paths: ['src/payment.mjs'] } });
assert.equal(unrelatedTask.excluded[0].reason, 'unrelated');
const emptyScope = selectRelevantLessons([persisted], { ...options, scope: {} });
assert.equal(emptyScope.selected.length, 0);
const wrongRepository = selectRelevantLessons([persisted], { ...options, owner_repository_id: 'github.com/benchmark-sdcorejs/unrelated-project' });
assert.equal(wrongRepository.excluded[0].reason, 'unrelated');
const legacy = inventory.find(i => i.path.endsWith('old-payment-advice.md'));
const legacyProbe = selectRelevantLessons([legacy.metadata], options);
assert.equal(legacyProbe.excluded[0].reason, 'invalid');
assert.equal(await hashFile(legacy.path), run.source_fingerprints[legacy.path]);
assert.equal(await hashFile('AGENTS.md'), run.source_fingerprints['AGENTS.md']);
const report = {
  source_hashes: reloadedHashes, scope,
  positive: compact(positive),
  controls: {
    source_drift: { alternate_bytes: 'pre-fix-category-control.mjs', alternate_sha256: sha(originalLine), result: compact(staleSource) },
    test_drift: { alternate_bytes: 'changed-test-control.txt', alternate_sha256: sha(alteredTest), result: compact(staleTest) },
    proof_drift: { alternate_bytes: 'changed-proof-control.txt', alternate_sha256: sha(alteredProof), result: compact(staleProof) },
    missing_proof: compact(missingProof), semantic_conflict: compact(conflicting),
    unrelated_task: compact(unrelatedTask), empty_scope: compact(emptyScope),
    wrong_repository: compact(wrongRepository),
    legacy_memory: { path: legacy.path, body_loaded: false, bytes_unchanged: true, reason: legacy.reason, result: compact(legacyProbe) },
  },
  idempotency: noChange, validation: validateLesson(persisted),
  freshness: evaluateLessonFreshness(persisted, { source_hashes: reloadedHashes }),
  no_application_edits: true, no_conventions_promoted: true,
  pointer_decision: 'AGENTS.md unchanged: canonical lesson JSON is discoverable by Explore metadata selection; no new policy or pointer was required.',
};
const artifactContext = {
  schema_version: 1, change_ref: candidate.change_ref, source_spec: 'none', source_plan: 'none',
  required_with_change: [{ path: proofPath, kind: 'execution-doc', reason: 'Sanitized immutable proof for the scoped lesson' }],
  shared_owned: [{ path: currentPlan.write.path, kind: 'memory', reason: 'Explicit user authorization; sole sequential Explore owner' }],
  conditional: [],
  local_only: [{ path: 'capture/', kind: 'diagnostic', reason: 'Authorized external capture folder; raw outputs and selection controls, never repository instructions' }],
  unrelated_observed: [{ path: legacy.path, reason: 'Legacy unrelated payment advice; unchanged and unpromoted' }],
};
await writeFile(path.join(cap, 'lesson-selection.json'), json(report));
await writeFile(path.join(cap, 'artifact-context.json'), json(artifactContext));
await writeFile(path.join(cap, 'capture-result.json'), json({
  authority, approval_source: 'Explicit supplied user task authorizes scoped memory capture',
  owner_repository_id: run.owner_repository_id,
  inventory: inventory.map(({ document, ...item }) => item),
  lesson_path: currentPlan.write.path, proof_path: proofPath,
  planner_status: currentPlan.status, semantic_content_hash: currentPlan.write.content_hash,
  lesson_byte_sha256: await hashFile(currentPlan.write.path),
  proof_byte_sha256: await hashFile(proofPath),
  lesson_classification: lessonClassification.bucket,
  proof_classification: proofClassification.bucket,
  readback_valid: true, idempotency: noChange.status,
}));
console.log(json({ result: 'PASSED', lesson_path: currentPlan.write.path, proof_path: proofPath, selection: report, artifact_context: artifactContext }));

