import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CONVENTION_POLICY, validateConventionPolicy } from '../../_refs/shared/convention-contract.mjs';
test('legacy policy is valid while malformed bootstrap extension cannot grant instruction writes', () => {
  assert.equal(validateConventionPolicy(structuredClone(DEFAULT_CONVENTION_POLICY)).ok, true);
  for (const extension of [{ schema_version: 999 }, { schema_version: 1, mode: 'automatic-anywhere', target: '../AGENTS.md' }]) {
    const policy = { ...structuredClone(DEFAULT_CONVENTION_POLICY), project_bootstrap: extension };
    assert.equal(validateConventionPolicy(policy).ok, false);
  }
});
