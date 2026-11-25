import { createHash } from 'node:crypto';

export const baselineHead = 'a'.repeat(40);
export const otherHead = 'b'.repeat(40);

export function contract(overrides = {}, batches = [['src/module-a/format.ts']]) {
  const owner = 'github.com/acme/module-a';
  const paths = [...new Set(batches.flat())];
  const sampleHash = phase => createHash('sha256').update(JSON.stringify([paths, phase])).digest('hex');
  const before = sampleHash('before');
  const after = sampleHash('after');
  const receipt = {
    kind: 'behavior', command: 'npm test -- format', assertion: 'formats missing input',
    executed_tests: 1, passed_assertions: ['formats missing input'],
    result: 'PASSED', exit_code: 0, covered_paths: paths, source_revision: baselineHead,
  };
  return {
    schema_version: 1, action: 'apply-explicit-scope', invocation: 'approved-plan',
    current_repository_id: owner, source_revision: baselineHead,
    artifact_identity: {owner_repository_id: owner, owner_module_id: 'module-a', execution_host_repository_id: 'github.com/acme/portal'},
    approved_plan_step: {step_id: 'simplify-module-a', owner_repository_id: owner, allowed_paths: ['src/module-a/**']},
    baseline: {HEAD: baselineHead, result: 'PASSED', diff_scope_hash: before},
    final_diff_scope_hash: after,
    scope: { files: paths.map(path => ({ path, surfaces: [] })) },
    passes: batches.map((changed_paths, index) => ({
      pass: index + 1, changed_paths, verification_result: 'PASSED', reverted: false,
      hunks: changed_paths.map(path => ({path, start: 1, count: 1})),
    })),
    behavior_evidence: {
      before: {...receipt, diff_scope_hash: before},
      after: {...receipt, diff_scope_hash: after},
    },
    simplify_repair_recursion_depth: 1,
    ...overrides,
  };
}
