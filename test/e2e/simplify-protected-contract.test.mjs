import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateSimplifyContract,
  protectedSimplifySurfaces,
} from '../../_refs/simplify/simplify-contract.mjs';

import { contract } from './support/simplify-contract.mjs';

test('every critical simplify surface is protected', () => {
  for (const surface of protectedSimplifySurfaces) {
    const result = evaluateSimplifyContract(
      contract({
        scope: {
          files: [{ path: 'src/module-a/security.ts', surfaces: [surface] }],
        },
      }),
    );
    assert.equal(result.write_authorized, false, surface);
    assert.match(result.blockers.join(' '), /protected simplify surface/iu);
  }
});

test('current behavior evidence and matching plan identity authorize a bounded pass', () => {
  const result = evaluateSimplifyContract(contract());
  assert.equal(result.status, 'verified');
  assert.equal(result.write_authorized, true);
  assert.equal(result.owner_repository_id, 'github.com/acme/module-a');
});

test('simplify enforces two passes and rollback of a failed pass', () => {
  const failed = evaluateSimplifyContract(
    contract({
      passes: [
        {
          pass: 1,
          changed_paths: ['src/module-a/format.ts'],
          verification_result: 'FAILED',
          reverted: false,
        },
      ],
    }),
  );
  assert.match(failed.blockers.join(' '), /not rolled back/iu);

  const tooMany = evaluateSimplifyContract(
    contract({
      passes: [1, 2, 3].map((pass) => ({
        pass,
        changed_paths: ['src/module-a/format.ts'],
        verification_result: 'PASSED',
        reverted: false,
      })),
    }),
  );
  assert.match(tooMany.blockers.join(' '), /pass cap exceeded/iu);
});

test('analyze mode is read-only and generated mirrors are excluded', () => {
  const analyze = evaluateSimplifyContract(
    contract({
      action: 'analyze-explicit-scope',
      passes: [
        {
          pass: 1,
          changed_paths: ['src/module-a/format.ts'],
          verification_result: 'PASSED',
        },
      ],
    }),
  );
  assert.match(analyze.blockers.join(' '), /analyze mode must remain read-only/iu);

  const mirror = evaluateSimplifyContract(
    contract({
      scope: {
        files: [{ path: 'codex/skills/sdcorejs-test/SKILL.md', surfaces: [] }],
      },
    }),
  );
  assert.match(mirror.blockers.join(' '), /generated mirror/iu);
});

test('cross-root writes and simplify/repair recursion are denied', () => {
  const crossRoot = evaluateSimplifyContract(
    contract({ current_repository_id: 'github.com/acme/portal' }),
  );
  assert.match(crossRoot.blockers.join(' '), /outside the semantic owner/iu);

  const recursion = evaluateSimplifyContract(
    contract({ simplify_repair_recursion_depth: 2 }),
  );
  assert.match(recursion.blockers.join(' '), /recursion is forbidden/iu);
});

test('public behavior changes return to spec/plan and line count is not a goal', () => {
  const behavior = evaluateSimplifyContract(
    contract({ public_behavior_change: true }),
  );
  assert.equal(behavior.status, 'planning-handoff');
  assert.match(behavior.blockers.join(' '), /spec\/plan revision/iu);

  const lineCount = evaluateSimplifyContract(contract({ goal: 'line-count-only' }));
  assert.match(lineCount.blockers.join(' '), /line count cannot be the sole/iu);
});

test('a static-only run or an oracle for another caller cannot verify behavior', () => {
  for (const run of [
    {command: 'npm run lint', kind: 'static'},
    {command: 'npm run lint'},
    {command: 'npm run lint && npm run build'},
    {exit_code: 1},
    {covered_paths: ['src/catalog/title.ts']},
    {assertion: ''},
  ]) {
    const input = contract();
    for (const phase of ['before', 'after']) Object.assign(input.behavior_evidence[phase], run);
    assert.equal(evaluateSimplifyContract(input).write_authorized, false);
  }
});

test('both phases need observed passing case IDs from the selected run', () => {
  const input = contract();
  const {assertion} = input.behavior_evidence.before;
  for (const phase of ['before', 'after']) {
    for (const observation of [
      {executed_tests: 0, passed_assertions: [assertion]},
      {executed_tests: 1, passed_assertions: []},
      {executed_tests: 1, passed_assertions: ['unrelated case']},
      {executed_tests: 1, passed_assertions: undefined},
      {executed_tests: undefined, passed_assertions: [assertion]},
    ]) {
      const sample = structuredClone(input);
      Object.assign(sample.behavior_evidence[phase], observation);
      assert.equal(evaluateSimplifyContract(sample).status, 'blocked', phase);
    }
  }
});

test('direct probes bind an actual observation to the same assertion and expectation', () => {
  const input = contract();
  const {assertion} = input.behavior_evidence.before;
  for (const run of Object.values(input.behavior_evidence)) {
    delete run.executed_tests;
    delete run.passed_assertions;
    run.command = 'node probe.mjs';
    run.caller_probe = {assertion, expected: 'invoice I-1', observed: 'invoice I-1'};
  }
  assert.equal(evaluateSimplifyContract(input).status, 'verified');
  for (const probe of [
    {assertion, expected: 'invoice I-1'},
    {assertion, expected: 'invoice I-1', observed: 'missing invoice'},
    {assertion: 'unrelated case', expected: 'invoice I-1', observed: 'invoice I-1'},
    {assertion, expected: 'changed expectation', observed: 'changed expectation'},
  ]) {
    const sample = structuredClone(input);
    sample.behavior_evidence.after.caller_probe = probe;
    assert.equal(evaluateSimplifyContract(sample).status, 'blocked');
  }
  input.behavior_evidence.before.executed_tests = 0;
  assert.equal(evaluateSimplifyContract(input).status, 'blocked');
});

test('each reported write belongs to both the selected files and the approved step', () => {
  const other = 'src/catalog/title.ts';
  for (const mode of ['unselected', 'outside-plan', 'prohibited', 'traversal', 'mirror-alias']) {
    const input = contract();
    const path = mode === 'traversal' ? '../src/module-a/format.ts'
      : mode === 'mirror-alias' ? './codex/skills/tools/file.ts' : other;
    input.passes[0].changed_paths = [path];
    if (mode !== 'unselected') input.scope.files.push({path, surfaces: []});
    if (mode !== 'outside-plan') input.approved_plan_step.allowed_paths = ['**'];
    if (mode === 'prohibited') input.approved_plan_step.prohibited_paths = ['src/catalog/**'];
    for (const run of Object.values(input.behavior_evidence)) run.covered_paths = [path];
    assert.equal(evaluateSimplifyContract(input).write_authorized, false, mode);
  }
});

test('no edits finish unchanged and cannot authorize any writes', () => {
  const result = evaluateSimplifyContract(contract({ passes: [], behavior_evidence: null }));
  assert.equal(result.status, 'unchanged');
  assert.equal(result.write_authorized, false);
});

test('only known invocations, identified plan steps and verified passes can authorize writes', () => {
  const baseline = contract();
  for (const input of [
    {invocation: 'auto'},
    {approved_plan_step: {...baseline.approved_plan_step, step_id: ''}},
    ...['failed', 'not-run', undefined].map(verification_result => ({
      passes: [{...baseline.passes[0], verification_result}],
    })),
  ]) assert.equal(evaluateSimplifyContract(contract(input)).write_authorized, false);
});
