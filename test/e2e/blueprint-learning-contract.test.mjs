import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { BLUEPRINT_AREAS, validateProjectBlueprint, selectBehavioralE2E, evaluateBlueprintTesting } from '../../_refs/shared/project-blueprint.mjs';
import { lessonIdentity, validateLesson, evaluateLessonFreshness, selectRelevantLessons, planLessonCapture } from '../../_refs/shared/learning-loop.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const sourceHash = hash('export const parse = input => input;\n');
const proofHash = hash('all parser tests passed\n');
const regressionHash = hash('parser empty input regression fixture\n');
const repository = 'github.com/example/parser';
const source = { path: 'src/parser.mjs', sha256: sourceHash };
const authority = { kind: 'authoritative-repository-config', path: 'package.json', sha256: hash('{}') };
function blueprint() {
  return {
    schema_version: 1, artifact_kind: 'project-blueprint', artifact_id: 'blueprint-parser',
    owner: 'sdcorejs-explore', owner_repository_id: repository, source_revision: 'rev-1',
    project_state: 'existing', migration_policy: 'no-automatic-migration', redaction_applied: true,
    areas: Object.fromEntries(BLUEPRINT_AREAS.map(id => [id, {
      status: 'confirmed', decision: `Follow the recorded ${id} project decision.`, evidence: [authority],
    }])),
  };
}
function lesson() {
  const value = {
    schema_version: 1, artifact_kind: 'memory', owner: 'sdcorejs-explore',
    owner_repository_id: repository, track: 'general', source_revision: 'rev-1', redaction_applied: true,
    concept_id: 'parser.empty-input', problem: 'Empty input caused a crash.',
    root_cause: 'The parser read the first token before checking length.',
    resolution: 'Validate length before accessing the first token.',
    regression_protection: { description: 'Exercise empty and valid inputs.', paths: ['test/parser.test.mjs'] },
    applicability: { tracks: ['general'], modules: [], boundaries: ['parser'], paths: ['src'], keywords: ['empty-input'] },
    source_fingerprints: [{ ...source }, { path: 'test/parser.test.mjs', sha256: regressionHash }],
    verification: { result: 'PASSED', command: 'node --test test/parser.test.mjs', cwd: '.', source_revision: 'rev-1', proof: { path: 'evidence/parser.txt', sha256: proofHash } },
    proposed_convention: null,
  };
  value.lesson_id = lessonIdentity(value);
  value.artifact_id = `memory-${value.lesson_id}`;
  return value;
}
const freshness = { source_hashes: { 'src/parser.mjs': sourceHash, 'test/parser.test.mjs': regressionHash, 'evidence/parser.txt': proofHash } };
function captureOptions(candidate = lesson()) {
  return { candidate, existing: [], ...freshness, action: 'memories-write-approved', explicit_authority: true,
    worker_role: 'integration-owner', owner_repository_id: repository };
}

test('blueprint inventories every area and distinguishes a documented gap from a missing decision', () => {
  const value = blueprint();
  assert.equal(validateProjectBlueprint(value, { path: '.sdcorejs/blueprints/parser.json' }).status, 'complete');
  value.areas.permissions = { status: 'gap', reason: 'Permission owner is unresolved.', next_action: 'Confirm the role matrix with the product owner.' };
  const gap = validateProjectBlueprint(value);
  assert.equal(gap.ok, true);
  assert.equal(gap.status, 'incomplete');
  assert.deepEqual(gap.gaps, ['permissions']);
  delete value.areas.permissions;
  assert.equal(validateProjectBlueprint(value).ok, false);
});

test('existing code observations never become accepted project rules or automatic migrations', () => {
  const value = blueprint();
  value.areas.coding = { status: 'observed', decision: 'Current parser files use named exports.', evidence: [{ kind: 'existing-code-observation', ...source }], next_action: 'Keep the baseline advisory until an explicit decision accepts it.' };
  assert.equal(validateProjectBlueprint(value).status, 'incomplete');
  value.areas.coding.status = 'confirmed';
  assert.equal(validateProjectBlueprint(value).ok, false);
  value.areas.coding = blueprint().areas.coding;
  value.migration_policy = 'rewrite-existing-project';
  assert.equal(validateProjectBlueprint(value).ok, false);
});

test('blueprint references canonical rule authority and rejects missing evidence, escaping paths and unsupported exemptions', () => {
  const value = blueprint();
  value.areas.architecture.evidence = [{ kind: 'approved-architecture', path: '.sdcorejs/architecture/general/parser.md', sha256: hash('architecture') }];
  value.areas.coding.evidence = [{ kind: 'accepted-convention', path: '.sdcorejs/conventions/repository/coding/coding-exports.yaml', sha256: hash('rule'), rule_id: 'coding.exports' }];
  value.areas.ui = { status: 'not-applicable', reason: 'This package exposes only a parser function.', evidence: [authority] };
  assert.equal(validateProjectBlueprint(value).ok, true);
  assert.equal(validateProjectBlueprint(value, { path: '../blueprint.json' }).ok, false);
  value.areas.coding.evidence[0].path = 'docs/copied-rule.yaml';
  assert.equal(validateProjectBlueprint(value).ok, false);
  value.areas.coding = blueprint().areas.coding;
  value.areas.ui.reason = '';
  assert.equal(validateProjectBlueprint(value).ok, false);
  value.areas.ui = blueprint().areas.ui;
  value.areas.stack.evidence = [];
  assert.equal(validateProjectBlueprint(value).ok, false);
});

test('E2E follows UI and public API behavior while pure logic and documentation need a reason', () => {
  const selection = selectBehavioralE2E([
    { id: 'checkout', kind: 'ui-journey' }, { id: 'create-order', kind: 'public-api' },
    { id: 'parse', kind: 'pure-logic', exception_reason: 'No browser or public API boundary; unit cases exercise the parser.' },
    { id: 'guide', kind: 'documentation', exception_reason: 'Only the prose changes; validate links and examples.' },
  ]);
  assert.equal(selection.ok, true);
  assert.deepEqual(selection.required, [{ behavior_id: 'checkout', layer: 'browser-e2e' }, { behavior_id: 'create-order', layer: 'api-e2e' }]);
  assert.equal(selection.exemptions.length, 2);
  for (const behavior of [{ id: 'parse', kind: 'pure-logic' }, { id: 'other', kind: 'unknown' }, { id: 'checkout', kind: 'ui-journey', exception_reason: 'Tests take too long.' }]) {
    assert.equal(selectBehavioralE2E([behavior]).ok, false);
  }
});

test('a test policy cannot pass missing commands, failed runs, absent proof or stale source revisions', () => {
  const behaviors = [{ id: 'create-order', kind: 'public-api' }];
  const evidence = [{ behavior_id: 'create-order', layer: 'api-e2e', result: 'PASSED', command: 'npm run test:api', cwd: 'service', source_revision: 'rev-1', proof: { path: 'evidence/api.txt', sha256: proofHash } }];
  const options = { behaviors, evidence, current_source_revision: 'rev-1' };
  assert.equal(evaluateBlueprintTesting(options).ok, true);
  for (const patch of [{ command: '' }, { cwd: '/tmp/service' }, { proof: null }, { result: 'FAILED' }, { source_revision: 'old' }]) {
    assert.equal(evaluateBlueprintTesting({ ...options, evidence: [{ ...evidence[0], ...patch }] }).ok, false);
  }
  assert.equal(evaluateBlueprintTesting({ ...options, evidence: [] }).ok, false);
  assert.equal(evaluateBlueprintTesting({ ...options, evidence: [...evidence, ...evidence] }).ok, false);
});

test('CLI and job behavior require full E2E evidence at the existing integration level', () => {
  const behaviors = [{ id: 'import-orders', kind: 'cli-flow' }, { id: 'reconcile-orders', kind: 'job-flow' }];
  const selection = selectBehavioralE2E(behaviors);
  assert.equal(selection.ok, true);
  assert.deepEqual(selection.required, [
    { behavior_id: 'import-orders', layer: 'integration', evidence_class: 'FULL_E2E' },
    { behavior_id: 'reconcile-orders', layer: 'integration', evidence_class: 'FULL_E2E' },
  ]);
  assert.deepEqual(selection.exemptions, []);
  for (const behavior of behaviors) {
    assert.equal(selectBehavioralE2E([{ ...behavior, exception_reason: 'Only the handler function is small.' }]).ok, false);
  }
});

test('CLI and job proof must cover the real entrypoint, owned boundaries and observable outcome', () => {
  for (const kind of ['cli-flow', 'job-flow']) {
    const record = {
      behavior_id: 'orders', layer: 'integration', evidence_class: 'FULL_E2E',
      result: 'PASSED', command: 'node --test test/orders-flow.test.mjs', cwd: '.', source_revision: 'rev-1',
      proof: { path: 'evidence/orders-flow.txt', sha256: proofHash },
      flow_proof: {
        kind, entrypoint: kind === 'cli-flow' ? 'bin/orders.mjs' : 'src/jobs/orders.mjs',
        invocation: kind === 'cli-flow' ? 'process' : 'job-trigger',
        observed_outcome: 'The trigger processed the fixture and the stored order became available through the public reader.',
        owned_boundaries: ['argument-or-message-validation', 'order-service', 'order-storage'], mocked_owned_boundaries: [],
      },
    };
    const options = { behaviors: [{ id: 'orders', kind }], evidence: [record], current_source_revision: 'rev-1' };
    const result = evaluateBlueprintTesting(options);
    assert.equal(result.ok, true, result.errors?.join('\n'));
    assert.equal(result.validation_map_required, true);
    for (const patch of [{ evidence_class: 'UNIT' }, { evidence_class: 'GOLDEN' }, { evidence_class: undefined }, { flow_proof: undefined }, { proof: null }, { command: '' }, { source_revision: 'rev-0' }]) {
      assert.equal(evaluateBlueprintTesting({ ...options, evidence: [{ ...record, ...patch }] }).ok, false);
    }
    for (const patch of [{ kind: 'pure-logic' }, { invocation: 'function-call' }, { entrypoint: '../external.mjs' }, { observed_outcome: '' }, { owned_boundaries: [] }, { owned_boundaries: [''] }, { mocked_owned_boundaries: ['order-storage'] }, { mocked_owned_boundaries: undefined }]) {
      assert.equal(evaluateBlueprintTesting({ ...options, evidence: [{ ...record, flow_proof: { ...record.flow_proof, ...patch } }] }).ok, false);
    }
  }
});

test('the initialization example supplies every actionable area and retains unresolved decisions as gaps', async () => {
  const reference = await readFile(new URL('../../_refs/shared/project-blueprint.md', import.meta.url), 'utf8');
  const example = reference.match(/<!-- project-blueprint-example:start -->\s*```json\n([\s\S]*?)\n```/u);
  assert.ok(example, 'the reference must include a complete JSON initialization example');
  const document = JSON.parse(example[1]);
  for (const area of Object.values(document.areas)) {
    for (const source of area.evidence ?? []) source.sha256 = hash(source.path);
  }
  const result = validateProjectBlueprint(document, { path: '.sdcorejs/blueprints/order-intake.json' });
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(result.status, 'incomplete');
  assert.deepEqual(result.gaps, ['permissions']);
  assert.equal(document.project_state, 'new');
  assert.equal(document.migration_policy, 'no-automatic-migration');
});

test('lessons require verified causal knowledge and executable regression protection', () => {
  assert.equal(validateLesson(lesson()).ok, true);
  for (const patch of [{ root_cause: '' }, { source_fingerprints: [] }, { applicability: {} }, { regression_protection: { description: 'Be careful.', paths: [] } }, { verification: { ...lesson().verification, result: 'NOT RUN' } }, { redaction_applied: false }]) {
    assert.equal(validateLesson({ ...lesson(), ...patch }).ok, false);
  }
  const proposal = lesson();
  proposal.proposed_convention = { rule_id: 'parser.validate-input', status: 'proposed', rationale: 'Guard before indexing.' };
  assert.equal(validateLesson(proposal).ok, true);
  proposal.proposed_convention.status = 'accepted';
  assert.equal(validateLesson(proposal).ok, false);
});

test('source and proof fingerprints distinguish fresh, stale and unknown lessons', () => {
  assert.equal(evaluateLessonFreshness(lesson(), freshness).status, 'fresh');
  assert.equal(evaluateLessonFreshness(lesson(), { source_hashes: { ...freshness.source_hashes, 'src/parser.mjs': hash('new') } }).status, 'stale');
  assert.equal(evaluateLessonFreshness(lesson(), { source_hashes: { 'src/parser.mjs': sourceHash } }).status, 'unknown');
  assert.equal(evaluateLessonFreshness(lesson(), { ...freshness, conflicting_paths: ['src/parser.mjs'] }).status, 'conflicting');
});

test('selective retrieval excludes unrelated repositories, scopes and stale knowledge without persisting anything', () => {
  const current = lesson();
  const stale = lesson();
  stale.source_fingerprints[0].sha256 = hash('old');
  const result = selectRelevantLessons([current, stale], { owner_repository_id: repository, scope: { boundaries: ['parser'] }, ...freshness });
  assert.equal(result.selected.length, 1);
  assert.equal(result.excluded.some(entry => entry.reason === 'stale'), true);
  for (const scope of [{}, { boundaries: ['billing'] }, { paths: ['src-other/parser.mjs'] }, { modules: ['other-module'] }]) {
    assert.equal(selectRelevantLessons([current], { owner_repository_id: repository, scope, ...freshness }).selected.length, 0);
  }
  assert.equal(selectRelevantLessons([current], { owner_repository_id: 'github.com/example/other', scope: { boundaries: ['parser'] }, ...freshness }).selected.length, 0);
});

test('lesson identity is stable across set order and evidence refresh; conflicting knowledge never overwrites a duplicate', () => {
  const original = lesson();
  original.applicability.keywords.push('parsing');
  const reordered = structuredClone(original);
  reordered.applicability.keywords.reverse();
  assert.equal(lessonIdentity(original), lessonIdentity(reordered));
  assert.equal(lessonIdentity(lesson()), lessonIdentity({ ...lesson(), source_revision: 'rev-2' }));
  const options = captureOptions();
  assert.equal(planLessonCapture(options).status, 'ready');
  assert.equal(planLessonCapture({ ...options, existing: [lesson()] }).status, 'unchanged');
  const changed = { ...lesson(), resolution: 'Discard all tokens.' };
  assert.equal(planLessonCapture({ ...captureOptions(changed), existing: [lesson()] }).status, 'conflict');
  assert.equal(planLessonCapture({ ...options, existing: [lesson(), lesson()] }).status, 'conflict');
});

test('only the exact authorized Explore owner may plan persistence of a fresh lesson', () => {
  for (const patch of [{ action: 'conventions-sync-write-approved' }, { action: 'memories-read' }, { explicit_authority: false }, { worker_role: 'parallel-worker' }, { worker_role: 'owner' }, { owner_repository_id: 'github.com/example/portal' }, { source_hashes: {} }]) {
    const result = planLessonCapture({ ...captureOptions(), ...patch });
    assert.equal(result.status, 'blocked');
    assert.equal(result.write, undefined);
  }
  const result = planLessonCapture(captureOptions());
  assert.match(result.write.path, /^\.sdcorejs\/memories\/general\/lesson-[a-f0-9]{64}\.json$/u);
  assert.equal(result.write.document.proposed_convention, null);
});

test('malformed blueprint references are rejected without throwing or accepting source observations as authority', () => {
  for (const evidence of [[{ kind: 'accepted-convention', path: 42, sha256: sourceHash }], { some: 1 }, [null]]) {
    const value = blueprint();
    value.areas.coding.evidence = evidence;
    assert.equal(validateProjectBlueprint(value).ok, false);
  }
  for (const patch of [{ path: '.sdcorejs/conventions/not-a-rule.json' }, { rule_id: 'coding.other' }]) {
    const value = blueprint();
    value.areas.coding.evidence = [{ kind: 'accepted-convention', path: '.sdcorejs/conventions/repository/coding/coding-exports.yaml', rule_id: 'coding.exports', sha256: sourceHash, ...patch }];
    assert.equal(validateProjectBlueprint(value).ok, false);
  }
});

test('prototype property names cannot masquerade as supported E2E behavior kinds', () => {
  for (const kind of ['constructor', '__proto__', 'toString']) {
    assert.equal(selectBehavioralE2E([{ id: 'behavior', kind }]).ok, false);
  }
});

test('regression test changes invalidate a lesson and unknown fields cannot broaden applicability', () => {
  const value = lesson();
  value.source_fingerprints = [source];
  assert.equal(validateLesson(value).ok, false);
  const current = lesson();
  assert.equal(evaluateLessonFreshness(current, { source_hashes: { ...freshness.source_hashes, 'test/parser.test.mjs': hash('changed assertion') } }).status, 'stale');
  current.applicability.missing_dimension = ['global'];
  assert.equal(validateLesson(current).ok, false);
});

test('fresh conflicting lessons are withheld and equivalent reordered records are deduplicated', () => {
  const first = lesson();
  const second = { ...lesson(), resolution: 'Return a diagnostic instead.' };
  const options = { owner_repository_id: repository, scope: { boundaries: ['parser'] }, ...freshness };
  assert.deepEqual(selectRelevantLessons([first, second], options).selected, []);
  const reordered = lesson();
  reordered.source_fingerprints.reverse();
  const result = selectRelevantLessons([first, reordered], options);
  assert.equal(result.selected.length, 1);
  assert.equal(result.excluded[0].reason, 'duplicate');
  assert.equal(planLessonCapture({ ...captureOptions(first), existing: [reordered] }).status, 'unchanged');
});

test('temporary target journey persists one validated blueprint and lesson and rejects source drift on retrieval', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'blueprint-learning-'));
  try {
    const value = blueprint();
    assert.equal(validateProjectBlueprint(value, { path: '.sdcorejs/blueprints/parser.json' }).ok, true);
    const plan = planLessonCapture(captureOptions());
    assert.equal(plan.status, 'ready');
    for (const [relative, content] of [['.sdcorejs/blueprints/parser.json', JSON.stringify(value)], [plan.write.path, JSON.stringify(plan.write.document)], ['src/parser.mjs', 'export const parse = input => input;\n'], ['test/parser.test.mjs', 'parser empty input regression fixture\n'], ['evidence/parser.txt', 'all parser tests passed\n']]) {
      await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
      await writeFile(path.join(root, relative), content);
    }
    const stored = JSON.parse(await readFile(path.join(root, plan.write.path), 'utf8'));
    const sourceHashes = Object.fromEntries(await Promise.all(Object.keys(freshness.source_hashes).map(async relative => [relative, hash(await readFile(path.join(root, relative)))])));
    assert.equal(selectRelevantLessons([stored], { owner_repository_id: repository, scope: { paths: ['src/parser.mjs'] }, source_hashes: sourceHashes }).selected.length, 1);
    await writeFile(path.join(root, 'src/parser.mjs'), 'export const parse = () => null;\n');
    sourceHashes['src/parser.mjs'] = hash(await readFile(path.join(root, 'src/parser.mjs')));
    const result = selectRelevantLessons([stored], { owner_repository_id: repository, scope: { paths: ['src/parser.mjs'] }, source_hashes: sourceHashes });
    assert.equal(result.selected.length, 0);
    assert.equal(result.excluded[0].reason, 'stale');
    assert.equal((await readFile(path.join(root, plan.write.path), 'utf8')), JSON.stringify(plan.write.document));
  } finally { await rm(root, { recursive: true, force: true }); }
});
