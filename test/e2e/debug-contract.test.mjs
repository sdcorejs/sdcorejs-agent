import assert from 'node:assert/strict';
import test from 'node:test';

import {
  evaluateDebugArtifact,
  redactDebugText,
} from '../../_refs/shared/debug-contract.mjs';

const revision = 'a'.repeat(40);
const fingerprint = 'b'.repeat(64);
const approvalHash = 'c'.repeat(64);

function artifact(overrides = {}) {
  return {
    schema_version: 1,
    subject_track: 'nestjs',
    intent: 'fix',
    debug_mode: 'failing-test',
    owner_repository_id: 'github.com/acme/orders',
    owner_module_id: 'orders',
    execution_host_repository_id: 'github.com/acme/portal',
    failing_implementation: {
      repository_id: 'github.com/acme/orders',
      path: 'src/orders/order.service.ts',
      source_revision: revision,
    },
    source_fingerprint: fingerprint,
    source_revision_map: { 'github.com/acme/orders': revision },
    environment_fingerprint: 'd'.repeat(64),
    test_evidence: {
      repository_id: 'github.com/acme/orders',
      source_revision: revision,
      source_fingerprint: fingerprint,
      status: 'current',
    },
    approved_plan_step: {
      step_id: 'orders-fix',
      approval_hash: approvalHash,
      owner_repository_id: 'github.com/acme/orders',
      allowed_paths: ['src/orders'],
    },
    hypotheses: [{ id: 'H1', status: 'root', verified: true }],
    ...overrides,
  };
}

test('debug artifact links current evidence, environment, plan, and owner identity', () => {
  const result = evaluateDebugArtifact(artifact());
  assert.equal(result.status, 'ready');
  assert.equal(result.write_authorized, true);
  assert.equal(result.owner_repository_id, 'github.com/acme/orders');
  assert.equal(result.execution_host_repository_id, 'github.com/acme/portal');
});

test('diagnose-only requests remain read-only without a plan step', () => {
  const result = evaluateDebugArtifact(
    artifact({ intent: 'diagnose-only', approved_plan_step: null }),
  );
  assert.equal(result.status, 'ready');
  assert.equal(result.write_authorized, false);
});

test('stale test evidence is detected against source revision and fingerprint', () => {
  const result = evaluateDebugArtifact(
    artifact({
      test_evidence: {
        repository_id: 'github.com/acme/orders',
        source_revision: 'e'.repeat(40),
        source_fingerprint: 'f'.repeat(64),
        status: 'current',
      },
    }),
  );
  assert.equal(result.stale_evidence, true);
  assert.equal(result.write_authorized, false);
  assert.match(result.blockers.join(' '), /stale/iu);
});

test('wrong repository owner and cross-root plan scope block write handoff', () => {
  const wrongOwner = evaluateDebugArtifact(
    artifact({
      failing_implementation: {
        repository_id: 'github.com/acme/portal',
        path: 'src/orders/order.service.ts',
        source_revision: revision,
      },
    }),
  );
  assert.match(wrongOwner.blockers.join(' '), /defect owner repository/iu);

  const wrongScope = evaluateDebugArtifact(
    artifact({
      approved_plan_step: {
        step_id: 'portal-fix',
        approval_hash: approvalHash,
        owner_repository_id: 'github.com/acme/portal',
        allowed_paths: ['src/portal'],
      },
    }),
  );
  assert.match(wrongScope.blockers.join(' '), /wrong repository|outside approved/iu);
});

test('repository-relative traversal cannot inherit approved debug write scope', () => {
  for (const unsafePath of [
    'src/orders/../../outside.mjs',
    '../src/orders/order.service.ts',
    'C:/workspace/src/orders/order.service.ts',
  ]) {
    const result = evaluateDebugArtifact(
      artifact({
        failing_implementation: {
          repository_id: 'github.com/acme/orders',
          path: unsafePath,
          source_revision: revision,
        },
      }),
    );
    assert.equal(result.write_authorized, false, unsafePath);
    assert.match(result.blockers.join(' '), /repository-relative|outside approved/iu);
  }
});

test('unverified hypotheses cannot authorize a fix', () => {
  const result = evaluateDebugArtifact(
    artifact({
      hypotheses: [{ id: 'H1', status: 'inconclusive', verified: false }],
    }),
  );
  assert.equal(result.write_authorized, false);
  assert.match(result.blockers.join(' '), /verified root hypothesis/iu);
});

test('one successful flaky retry is not proof of a fix', () => {
  const result = evaluateDebugArtifact(
    artifact({
      debug_mode: 'flaky',
      retry_evidence: {
        attempts: 4,
        passes: 3,
        failures: 1,
        consecutive_post_fix_passes: 1,
      },
    }),
  );
  assert.equal(result.write_authorized, false);
  assert.match(result.blockers.join(' '), /one flaky retry pass/iu);
});

test('debug redaction removes secrets, bearer tokens, and email PII', () => {
  const redacted = redactDebugText(
    'authorization=secret Bearer abc.def token=raw user@example.com',
  );
  assert.equal(redacted.includes('secret'), false);
  assert.equal(redacted.includes('abc.def'), false);
  assert.equal(redacted.includes('raw'), false);
  assert.equal(redacted.includes('user@example.com'), false);
  assert.match(redacted, /\[REDACTED\]/u);
  assert.match(redacted, /\[PII_REDACTED\]/u);
});
