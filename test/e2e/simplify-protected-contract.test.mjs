import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateSimplifyContract,
  protectedSimplifySurfaces,
} from '../../_refs/simplify/simplify-contract.mjs';

function contract(overrides = {}) {
  const revision = 'a'.repeat(40);
  return {
    schema_version: 1,
    action: 'apply-explicit-scope',
    invocation: 'approved-plan',
    artifact_identity: {
      owner_repository_id: 'github.com/acme/module-a',
      owner_module_id: 'module-a',
      execution_host_repository_id: 'github.com/acme/portal',
    },
    current_repository_id: 'github.com/acme/module-a',
    source_revision: revision,
    approved_plan_step: {
      step_id: 'simplify-module-a',
      owner_repository_id: 'github.com/acme/module-a',
      allowed_paths: ['src/module-a'],
    },
    baseline: { result: 'PASSED' },
    scope: {
      files: [{ path: 'src/module-a/format.ts', surfaces: [] }],
    },
    passes: [
      {
        pass: 1,
        changed_paths: ['src/module-a/format.ts'],
        verification_result: 'PASSED',
        reverted: false,
      },
    ],
    behavior_evidence: {
      before: { command: 'npm test -- format', result: 'PASSED' },
      after: {
        command: 'npm test -- format',
        result: 'PASSED',
        source_revision: revision,
      },
    },
    simplify_repair_recursion_depth: 1,
    ...overrides,
  };
}

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
