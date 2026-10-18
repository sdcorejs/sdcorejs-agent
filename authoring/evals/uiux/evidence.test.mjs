import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import test from 'node:test';
import { parseApprovedFrontmatter, verifyApprovedArtifact, verifyApprovedArtifactGraph } from '../../../_refs/shared/approved-artifact.mjs';

const root = new URL('../../../', import.meta.url);
const read = async (path) => (await readFile(new URL(path, root), 'utf8')).replace(/\r\n?/g, '\n');
const hash = (text) => `sha256:${createHash('sha256').update(text).digest('hex')}`;
const deliveryRevision = '03563d26837751d67a354d38589c6ed0fe67ed24';
const historicalRead = (path) => execFileSync('git', ['show', `${deliveryRevision}:${path}`], { encoding: 'utf8', windowsHide: true }).replace(/\r\n?/g, '\n');
// The cleanup storage continuation is history once main moved past it (1fca9c3);
// the task-breakdown port continuation below owns proof for the current tree.
const portSourceRevision = '1fca9c3fa90cd259056234b27cf978a606fd927b';
const atRevision = (revision, path) => execFileSync('git', ['show', `${revision}:${path}`], { encoding: 'utf8', windowsHide: true }).replace(/\r\n?/g, '\n');

test('UI/UX authoring evidence binds real baseline, transcripts and current sources', async () => {
  const record = JSON.parse(await read('authoring/evals/uiux/records.json'));
  assert.equal(hash(await read('authoring/evals/uiux/records.json')), hash(historicalRead('authoring/evals/uiux/records.json')), 'historical evidence remains immutable');
  assert.equal(execFileSync('git', ['rev-parse', `${record.base_revision}^{commit}`], { encoding: 'utf8', windowsHide: true }).trim(), record.base_revision);
  const absent = spawnSync('git', ['cat-file', '-e', `${record.base_revision}:_refs/design/uiux/select-references.mjs`], { windowsHide: true });
  assert.notEqual(absent.status, 0);
  assert.deepEqual(record.phases.map(({ phase }) => phase), ['RED', 'GREEN', 'REFACTOR']);
  const snapshotText = await read(record.green_snapshot.path);
  assert.equal(hash(snapshotText), record.green_snapshot.sha256);
  const snapshot = JSON.parse(snapshotText);
  for (const entry of snapshot.sources) assert.equal(hash(entry.content), entry.sha256, entry.path);
  assert.equal(hash(historicalRead(record.behavior_contract.path)), record.behavior_contract.sha256);
  for (const phase of record.phases) {
    const transcript = await read(phase.transcript.path);
    assert.equal(hash(transcript), phase.transcript.sha256);
    assert.equal(phase.live_target_project, false);
    assert.equal(phase.tokens, null);
    if (phase.phase === 'RED') assert.match(transcript, /ERR_MODULE_NOT_FOUND/);
    else {
      assert.match(transcript, /tests 16/);
      assert.match(transcript, /pass 16/);
      assert.match(transcript, /fail 0/);
    }
  }
  assert.ok(record.refactor_sources.some((entry) => snapshot.sources.find(({ path }) => path === entry.path)?.sha256 !== entry.sha256));
  for (const entry of record.final_sources) assert.equal(hash(historicalRead(entry.path)), entry.sha256, entry.path);
  if (record.visual_offer_integration) {
    const integration = record.visual_offer_integration;
    assert.equal(integration.change_ref, 'visual-companion-offer');
    assert.equal(execFileSync('git', ['rev-parse', `${integration.source_revision}^{commit}`], { encoding: 'utf8', windowsHide: true }).trim(), integration.source_revision);
    for (const entry of integration.previous_final_sources) {
      const historical = execFileSync('git', ['show', `${integration.source_revision}:${entry.path}`], { encoding: 'utf8', windowsHide: true });
      assert.equal(hash(historical.replace(/\r\n?/g, '\n')), entry.sha256, entry.path);
    }
    assert.deepEqual(integration.changed_paths, record.final_sources.filter(entry =>
      integration.previous_final_sources.find(old => old.path === entry.path)?.sha256 !== entry.sha256).map(entry => entry.path));
    const verification = integration.verification;
    assert.equal(verification.exit_code, 0);
    assert.equal(hash(verification.transcript), verification.output_sha256);
    assert.match(verification.transcript, /# tests 25\b/);
    assert.match(verification.transcript, /# pass 25\b/);
    assert.match(verification.transcript, /# fail 0\b/);
    for (const entry of verification.contract_manifest) assert.equal(hash(historicalRead(entry.path)), entry.sha256, entry.path);
  }
  assert.equal(hash(await read(record.post_review.contract.path)), record.post_review.contract.sha256);
  for (const phase of record.post_review.phases) {
    const transcript = await read(phase.transcript.path);
    assert.equal(hash(transcript), phase.transcript.sha256);
    assert.match(transcript, new RegExp(`tests ${phase.tests}`));
    assert.match(transcript, new RegExp(`fail ${phase.failures}`));
  }
  assert.deepEqual(record.skill_creator_repair.finding_ids, ['R1', 'R2', 'R3']);
  assert.equal(hash(await read(record.skill_creator_repair.contract.path)), record.skill_creator_repair.contract.sha256);
  for (const phase of record.skill_creator_repair.phases) {
    const transcript = await read(phase.transcript.path);
    assert.equal(hash(transcript), phase.transcript.sha256);
    assert.match(transcript, new RegExp(`tests ${phase.tests}`));
    assert.match(transcript, new RegExp(`fail ${phase.failures}`));
  }
  assert.equal(record.live_agent.result, 'NOT RUN');
  assert.equal(record.visual.result, 'NOT RUN');
  const context = await loadContinuationContext(record);
  validateCleanupContinuation(context.continuation, context);
  validateReviewRepairContinuation(context.repair, context);
  validateStorageContinuation(context.storage, context);
});

test('UI/UX cleanup continuation rejects source drift, missing scope and unsupported evidence claims', async () => {
  const record = JSON.parse(await read('authoring/evals/uiux/records.json'));
  const context = await loadContinuationContext(record);
  for (const mutate of [
    item => { item.current_sources[0].sha256 = `sha256:${'0'.repeat(64)}`; },
    item => { item.current_sources.pop(); },
    item => { item.changed_paths.push('_refs/design/uiux/forms.md'); },
    item => { item.public_inventory_delta.added_paths.push('skills/tracks/design/sdcorejs-uiux.md'); },
    item => { item.public_inventory_delta.ceiling_approval.approval_hash = `sha256:v1:${'0'.repeat(64)}`; },
    item => { item.verification.transcript.sha256 = `sha256:${'0'.repeat(64)}`; },
    item => { item.live_agent.result = 'PASS'; },
    item => { item.tokens = 42; },
  ]) {
    const candidate = structuredClone(context.continuation);
    mutate(candidate);
    assert.throws(() => validateCleanupContinuation(candidate, context));
  }
});

test('UI/UX review repair continuation rejects parent drift, missing current scope and unsupported claims', async () => {
  const context = await loadContinuationContext(JSON.parse(await read('authoring/evals/uiux/records.json')));
  validateReviewRepairContinuation(context.repair, context);
  for (const mutate of [
    item => { item.previous_continuation.sha256 = `sha256:${'0'.repeat(64)}`; },
    item => { item.previous_sources[0].sha256 = `sha256:${'0'.repeat(64)}`; },
    item => { item.current_sources[0].sha256 = `sha256:${'0'.repeat(64)}`; },
    item => { item.current_sources.pop(); },
    item => { item.changed_paths.push('_refs/design/uiux/forms.md'); },
    item => { item.verification.transcript.sha256 = `sha256:${'0'.repeat(64)}`; },
    item => { item.live_agent.result = 'PASS'; },
    item => { item.tokens = 42; },
  ]) {
    const candidate = structuredClone(context.repair);
    mutate(candidate);
    assert.throws(() => validateReviewRepairContinuation(candidate, context));
  }
});

async function loadContinuationContext(record) {
  const continuationText = await read('authoring/evals/uiux/cleanup-continuation.json');
  const continuation = JSON.parse(continuationText);
  const repairText = await read('authoring/evals/uiux/cleanup-review-repair.json');
  const repair = JSON.parse(repairText);
  const storage = JSON.parse(await read('authoring/evals/records/cleanup-storage-audit.json'));
  const atStorageBase = path => execFileSync('git', ['show', `${storage.base_revision}:${path}`], { encoding: 'utf8', windowsHide: true }).replace(/\r\n?/g, '\n');
  assert.equal(hash(repairText), hash(atStorageBase('authoring/evals/uiux/cleanup-review-repair.json')), 'preserve the historical review-repair record');
  const historicalEntries = new Map([...record.final_sources, ...record.visual_offer_integration.verification.contract_manifest].map(entry => [entry.path, entry]));
  const currentSources = new Map([...historicalEntries.keys()].map(path => [path, hash(atRevision(portSourceRevision, path))]));
  return {
    continuation,
    repair,
    storage,
    repairSources: new Map([...historicalEntries.keys()].map(path => [path, hash(atStorageBase(path))])),
    continuationHash: hash(continuationText),
    record,
    historicalEntries,
    currentSources,
    transcript: await read(continuation.verification.transcript.path),
    repairTranscript: await read(repair.verification.transcript.path),
    historicalRecordHash: hash(await read('authoring/evals/uiux/records.json')),
    approval: JSON.parse(await read('.sdcorejs/approvals/sdcorejs-cleanup-ceiling-change.json')),
  };
}

function validateCleanupContinuation(continuation, context) {
  assert.equal(continuation.schema_version, 1);
  assert.equal(continuation.kind, 'uiux-cleanup-deterministic-continuation');
  assert.equal(continuation.change_ref, 'sdcorejs-cleanup');
  assert.equal(continuation.source_revision, deliveryRevision);
  assert.equal(continuation.historical_delivery_revision, deliveryRevision);
  assert.equal(continuation.historical_record.path, 'authoring/evals/uiux/records.json');
  assert.equal(continuation.historical_record.sha256, context.historicalRecordHash);
  assert.equal(continuation.historical_phases_preserved, true);
  assert.deepEqual(continuation.current_sources.map(entry => entry.path).sort(), [...context.historicalEntries.keys()].sort());
  const repairPreviousSources = new Map(context.repair.previous_sources.map(entry => [entry.path, entry.sha256]));
  for (const entry of continuation.current_sources) assert.equal(entry.sha256, repairPreviousSources.get(entry.path), entry.path);
  assert.deepEqual(continuation.changed_paths, continuation.current_sources.filter(entry => context.historicalEntries.get(entry.path).sha256 !== entry.sha256).map(entry => entry.path));
  assert.deepEqual(continuation.changed_paths, ['skills/orchestration/using-skills.md', 'test/e2e/support/skill-pack-runner.mjs', 'test/e2e/uiux-knowledge.test.mjs']);
  const delta = continuation.public_inventory_delta;
  assert.equal(delta.baseline_revision, context.record.base_revision);
  assert.equal(delta.baseline_public_count, 23);
  assert.equal(delta.current_public_count, 24);
  assert.deepEqual(delta.added_paths, ['skills/shared/workflow/cleanup.md']);
  assert.equal(delta.ceiling_approval.path, '.sdcorejs/approvals/sdcorejs-cleanup-ceiling-change.json');
  assert.equal(delta.ceiling_approval.approval_hash, verifyApprovedArtifact(context.approval).approval_hash);
  const authorization = JSON.parse(context.approval.body);
  assert.equal(authorization.status, 'approved');
  assert.equal(authorization.capability_id, 'sdcorejs-cleanup');
  assert.deepEqual(authorization.proposed_public_skills, ['sdcorejs-cleanup']);
  assert.equal(authorization.from_ceiling, delta.baseline_public_count);
  assert.equal(authorization.to_ceiling, delta.current_public_count);
  const verification = continuation.verification;
  assert.equal(verification.command, 'node --test test/e2e/uiux-knowledge.test.mjs test/e2e/uiux-review-regression.test.mjs test/e2e/uiux-skill-creator-regression.test.mjs');
  assert.equal(verification.exit_code, 0);
  assert.equal(verification.tests, 25);
  assert.equal(verification.pass, 25);
  assert.equal(verification.fail, 0);
  assert.equal(verification.node, 'v22.22.3');
  assert.equal(verification.transcript.path, 'authoring/evals/uiux/cleanup-continuation.txt');
  assert.equal(hash(context.transcript), verification.transcript.sha256);
  assert.match(context.transcript, /# tests 25\b/);
  assert.match(context.transcript, /# pass 25\b/);
  assert.match(context.transcript, /# fail 0\b/);
  assert.equal(continuation.live_agent.result, 'NOT RUN');
  assert.equal(continuation.visual.result, 'NOT RUN');
  assert.equal(continuation.tokens, null);
}

function validateReviewRepairContinuation(repair, context) {
  assert.equal(repair.schema_version, 1);
  assert.equal(repair.kind, 'uiux-cleanup-review-repair-continuation');
  assert.equal(repair.change_ref, 'sdcorejs-cleanup');
  assert.equal(repair.source_revision, deliveryRevision);
  assert.equal(repair.previous_continuation.path, 'authoring/evals/uiux/cleanup-continuation.json');
  assert.equal(repair.previous_continuation.sha256, context.continuationHash);
  assert.deepEqual(repair.finding_ids, ['F-03']);
  assert.deepEqual(repair.previous_sources, context.continuation.current_sources);
  assert.deepEqual(repair.current_sources.map(entry => entry.path).sort(), [...context.currentSources.keys()].sort());
  for (const entry of repair.current_sources) assert.equal(entry.sha256, context.repairSources.get(entry.path), entry.path);
  const previous = new Map(repair.previous_sources.map(entry => [entry.path, entry.sha256]));
  assert.deepEqual(repair.changed_paths, repair.current_sources.filter(entry => previous.get(entry.path) !== entry.sha256).map(entry => entry.path));
  assert.deepEqual(repair.changed_paths, ['test/e2e/support/skill-pack-runner.mjs']);
  const verification = repair.verification;
  assert.equal(verification.command, context.continuation.verification.command);
  assert.equal(verification.exit_code, 0);
  assert.equal(verification.tests, 25);
  assert.equal(verification.pass, 25);
  assert.equal(verification.fail, 0);
  assert.equal(verification.node, 'v22.22.3');
  assert.equal(verification.transcript.path, 'authoring/evals/uiux/cleanup-review-repair.txt');
  assert.equal(verification.transcript.sha256, hash(context.repairTranscript));
  assert.match(context.repairTranscript, /# tests 25\b/);
  assert.match(context.repairTranscript, /# pass 25\b/);
  assert.match(context.repairTranscript, /# fail 0\b/);
  assert.equal(repair.live_agent.result, 'NOT RUN');
  assert.equal(repair.visual.result, 'NOT RUN');
  assert.equal(repair.tokens, null);
}

function validateStorageContinuation(storage, context) {
  // Historical UI/UX evidence stays pinned to the pre-storage Git snapshot;
  // the storage record binds the shared routing source to its current bytes.
  const bindings = new Map(storage.current_source_bindings.map(entry => [entry.path, `sha256:${entry.sha256}`]));
  const changed = [...context.currentSources].filter(([path, digest]) => context.repairSources.get(path) !== digest);
  assert.deepEqual(changed.map(([path]) => path), ['test/e2e/support/skill-pack-runner.mjs']);
  for (const [path, digest] of changed) assert.equal(bindings.get(path), digest, path);
}

test('storage continuation preserves historical UI/UX evidence and rejects unbound current routing drift', async () => {
  const context = await loadContinuationContext(JSON.parse(await read('authoring/evals/uiux/records.json')));
  validateStorageContinuation(context.storage, context);
  const candidate = structuredClone(context.storage);
  candidate.current_source_bindings.find(entry => entry.path === 'test/e2e/support/skill-pack-runner.mjs').sha256 = '0'.repeat(64);
  assert.throws(() => validateStorageContinuation(candidate, context));
  const missing = structuredClone(context.storage);
  missing.current_source_bindings = missing.current_source_bindings.filter(entry => entry.path !== 'test/e2e/support/skill-pack-runner.mjs');
  assert.throws(() => validateStorageContinuation(missing, context));
  context.currentSources.set('_refs/design/uiux/forms.md', `sha256:${'0'.repeat(64)}`);
  assert.throws(() => validateStorageContinuation(context.storage, context));
});

// Task-breakdown port continuation: binds the current tree to the approved port plan,
// the cleanup storage continuation as history, and an actual focused run.
const portPath = 'authoring/evals/uiux/task-breakdown-port-continuation.json';
const portTranscriptPath = 'authoring/evals/uiux/task-breakdown-port-continuation.txt';
const portPreviousPath = 'authoring/evals/records/cleanup-storage-audit.json';
const portPlanPath = '.sdcorejs/plans/workflow/2026-10-18-07-15-task-breakdown-main-port-r2.md';
const portPlanHash = 'sha256:v1:6948139cc2cac271a75c2d0f1c77fb368b34d7fad466fcb88b90ffbd6f8e0e49';
const portTests = ['product-task-breakdown-contract', 'product-task-breakdown-cli', 'product-task-breakdown-flow-contract', 'mirror-refs-resolution',
  'harness-behavioral-sentinel', 'artifact-path-convention', 'skill-pack-runner'].map(name => `test/e2e/${name}.test.mjs`);
const portCommand = `node --test --test-concurrency=1 --test-reporter=tap ${portTests.join(' ')}`;
const portCases = ['case-task-breakdown-rubric', 'case-task-breakdown-cli-write-gate', 'case-task-breakdown-cli-sources-kinds', 'case-task-breakdown-cli-help',
  'case-task-breakdown-flow-gates', 'case-task-breakdown-flow-source-guidance', 'case-task-breakdown-capability-contract',
  'case-mirror-refs-rewritten', 'case-mirror-refs-bootstrap-absolute', 'case-mirror-refs-unchanged'];
const portSourcePaths = ['CHANGELOG.md', 'SECURITY.md', 'VALIDATION.md', '_refs/harness/README.md', '_refs/harness/capability-contract.json',
  '_refs/harness/runtime-attestation.mjs', '_refs/harness/runtime-policy.mjs', '_refs/product/project-workspace.md', '_refs/product/sizing-rubric.md',
  '_refs/product/source-connectors.md', '_refs/product/task-breakdown.md', '_refs/product/task-breakdown/check.mjs', '_refs/product/task-breakdown/identity.mjs',
  '_refs/product/task-breakdown/safety.mjs', '_refs/product/task-breakdown/sizing.mjs', '_refs/product/task-breakdown/sources.mjs',
  '_refs/product/task-breakdown/task-format.mjs', '_refs/product/task-breakdown/workspace.mjs', '_refs/product/task-format.md',
  '_refs/shared/approved-artifact.mjs', '_refs/shared/artifact-lifecycle.md', '_refs/shared/artifact-lifecycle.mjs', '_refs/shared/artifact-paths.mjs',
  '_refs/shared/system-registry.json', '_refs/shared/system-registry.mjs', 'authoring/evals/uiux/evidence.test.mjs', 'package.json',
  'plugin/hooks/session-start.mjs', 'scripts/sync-skills.mjs', 'skills/orchestration/documentation.md', 'skills/tracks/product/sdcorejs-product.md',
  'test/e2e/artifact-path-convention.test.mjs', 'test/e2e/fixtures/prompt-evals.json', 'test/e2e/harness-behavioral-sentinel.test.mjs',
  'test/e2e/mirror-refs-resolution.test.mjs', 'test/e2e/product-task-breakdown-cli.test.mjs', 'test/e2e/product-task-breakdown-contract.test.mjs',
  'test/e2e/product-task-breakdown-flow-contract.test.mjs', 'test/e2e/skill-pack-runner.test.mjs', 'test/e2e/support/skill-pack-runner.mjs'];

// Approved artifacts are parsed with the shared frontmatter parser and verified by the shared hash helper.
function approvedFromText(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/u);
  assert.ok(match, 'approved artifact frontmatter is missing');
  const artifact = { metadata: parseApprovedFrontmatter(match[1]), body: match[2] };
  assert.equal(verifyApprovedArtifact(artifact).valid, true);
  return artifact;
}

async function loadPortContext(readSource = read) {
  const port = JSON.parse(await readSource(portPath));
  const previousText = await readSource(portPreviousPath);
  const record = JSON.parse(await readSource('authoring/evals/uiux/records.json'));
  const boundPaths = [...new Set([...record.final_sources, ...record.visual_offer_integration.verification.contract_manifest].map(entry => entry.path))];
  const current = new Map(await Promise.all([...new Set([...boundPaths, ...portSourcePaths])].map(async path => [path, hash(await readSource(path))])));
  const previousSources = boundPaths.map(path => ({ path, sha256: hash(atRevision(portSourceRevision, path)) }));
  return { port, previousHash: hash(previousText), previousSources, boundPaths, current, transcript: await readSource(portTranscriptPath), readSource };
}

async function validatePortContinuation(port, context) {
  assert.equal(port.schema_version, 1);
  assert.equal(port.kind, 'task-breakdown-main-port-continuation');
  assert.equal(port.change_ref, 'task-breakdown-main-port-v1');
  assert.equal(port.scope_plan.path, portPlanPath);
  const plan = approvedFromText(await context.readSource(portPlanPath));
  assert.equal(plan.metadata.approval_hash, portPlanHash, 'only the actual approved port plan is authority');
  assert.equal(port.scope_plan.approval_hash, portPlanHash);
  const architecture = approvedFromText(await context.readSource(plan.metadata.source_architecture));
  const spec = approvedFromText(await context.readSource(plan.metadata.source_spec));
  verifyApprovedArtifactGraph(architecture, [spec]);
  verifyApprovedArtifactGraph(plan, [architecture]);
  assert.equal(port.source_revision, plan.metadata.source_revision);
  assert.equal(port.source_revision, portSourceRevision);
  assert.equal(execFileSync('git', ['rev-parse', `${port.source_revision}^{commit}`], { encoding: 'utf8', windowsHide: true }).trim(), port.source_revision);
  assert.equal(port.previous_continuation.path, portPreviousPath);
  assert.equal(port.previous_continuation.sha256, context.previousHash, 'history must remain immutable');
  assert.equal(hash(atRevision(portSourceRevision, portPreviousPath)), context.previousHash);
  assert.deepEqual(port.previous_sources, context.previousSources);
  assert.deepEqual(port.current_sources.map(entry => entry.path).sort(), [...context.boundPaths].sort());
  for (const entry of port.current_sources) assert.equal(entry.sha256, context.current.get(entry.path), `current continuation is stale: ${entry.path}`);
  const previous = new Map(port.previous_sources.map(entry => [entry.path, entry.sha256]));
  assert.deepEqual(port.changed_paths, port.current_sources.filter(entry => previous.get(entry.path) !== entry.sha256).map(entry => entry.path));
  assert.deepEqual(port.changed_paths, ['test/e2e/support/skill-pack-runner.mjs']);
  assert.deepEqual(port.port_sources.map(entry => entry.path), portSourcePaths);
  for (const entry of port.port_sources) assert.equal(entry.sha256, context.current.get(entry.path), `current continuation is stale: ${entry.path}`);
  const verification = port.verification;
  assert.equal(verification.command, portCommand);
  assert.equal(verification.exit_code, 0);
  assert.ok(Number.isInteger(verification.tests) && verification.tests >= 100);
  assert.equal(verification.pass, verification.tests);
  assert.equal(verification.fail, 0);
  assert.equal(verification.node, 'v22.22.3');
  assert.equal(verification.transcript.path, portTranscriptPath);
  assert.equal(hash(context.transcript), verification.transcript.sha256);
  const lines = context.transcript.split('\n');
  for (const line of [`# tests ${verification.tests}`, `# pass ${verification.tests}`, '# fail 0']) assert.ok(lines.includes(line), `missing summary: ${line}`);
  for (const id of portCases) assert.ok(lines.some(line => /^ok \d+ - /u.test(line) && line.includes(id)), `missing passing case: ${id}`);
  assert.ok(!lines.some(line => /^not ok /u.test(line)), 'the focused run has a failing case');
  assert.equal(port.live_agent.result, 'NOT RUN');
  assert.equal(port.visual.result, 'NOT RUN');
  assert.equal(port.tokens, null);
}

test('case-port-evidence-continuation: current content is bound to the approved port plan and an actual run', async () => {
  const context = await loadPortContext();
  await validatePortContinuation(context.port, context);
});

test('case-port-evidence-continuation: omitted, stale, mutated and fabricated evidence is rejected', async () => {
  const context = await loadPortContext();
  await validatePortContinuation(context.port, context);
  for (const mutate of [
    item => { item.previous_continuation.sha256 = `sha256:${'0'.repeat(64)}`; },
    item => { item.previous_sources[0].sha256 = `sha256:${'0'.repeat(64)}`; },
    item => { item.current_sources[0].sha256 = `sha256:${'0'.repeat(64)}`; },
    item => { item.current_sources.pop(); },
    item => { item.changed_paths.push('_refs/design/uiux/forms.md'); },
    item => { item.port_sources.pop(); },
    item => { item.port_sources[0].sha256 = `sha256:${'0'.repeat(64)}`; },
    item => { item.scope_plan.approval_hash = `sha256:v1:${'0'.repeat(64)}`; },
    item => { item.source_revision = 'f'.repeat(40); },
    item => { item.verification.command = ''; },
    item => { item.verification.exit_code = 1; },
    item => { item.verification.fail = 1; },
    item => { item.verification.transcript.sha256 = `sha256:${'0'.repeat(64)}`; },
    item => { item.live_agent.result = 'PASS'; },
    item => { item.tokens = 42; },
  ]) {
    const candidate = structuredClone(context.port);
    mutate(candidate);
    await assert.rejects(validatePortContinuation(candidate, context));
  }
  const rejectsWith = (readSource) => assert.rejects(async () => {
    const mutated = await loadPortContext(readSource);
    await validatePortContinuation(mutated.port, mutated);
  });
  for (const changed of ['_refs/product/task-breakdown/check.mjs', '_refs/harness/runtime-policy.mjs', portPlanPath, portPreviousPath]) {
    await rejectsWith(async path => (path === changed ? `${await read(path)}\nmutated at the same HEAD\n` : read(path)));
  }
  await rejectsWith(async path => (path === portTranscriptPath ? (await read(path)).replace('case-mirror-refs-rewritten', 'case-mirror-refs-fabricated') : read(path)));
});
