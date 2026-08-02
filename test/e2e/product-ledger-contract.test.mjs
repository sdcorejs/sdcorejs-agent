import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  buildCrossRepositoryProductView,
  createProductLedger,
  resolveProductLedgerTarget,
  validateProductLedger,
} from '../../_refs/shared/product-ledger.mjs';
import { systemRegistry } from '../../_refs/shared/system-registry.mjs';

const root = path.resolve('.');
const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);
const APPROVAL_A = `sha256:v1:${'a'.repeat(64)}`;

function ledgerMetadata(overrides = {}) {
  return {
    schema_version: 1,
    artifact_id: 'product-ledger:orders',
    artifact_kind: 'product-ledger',
    contract_id: 'contract:orders',
    requirement_id: 'requirement:orders',
    change_ref: 'orders-change',
    track: 'product',
    stack_profile: 'product',
    owner_repository_id: 'github.com/sdcorejs/orders',
    owner_repository_role: 'module',
    owner_module_id: 'orders',
    ownership_scope: 'module',
    repository_relative_path:
      '.sdcorejs/docs/product/orders.md',
    source_revision: SHA_A,
    parent_references: [
      {
        repository_id: 'github.com/sdcorejs/orders',
        artifact_id: 'spec:orders',
        artifact_kind: 'spec',
        revision: SHA_A,
        approval_hash: APPROVAL_A,
      },
    ],
    supersedes: null,
    approval_hash: null,
    ...overrides,
  };
}

function traceability(overrides = {}) {
  return [
    {
      requirement_id: 'requirement:orders',
      acceptance_criterion_id: 'AC-1',
      requirement_ref: {
        repository_id: 'github.com/sdcorejs/orders',
        artifact_id: 'spec:orders',
        revision: SHA_A,
      },
      design_refs: [],
      plan_refs: [
        {
          repository_id: 'github.com/sdcorejs/orders',
          artifact_id: 'plan:orders',
          revision: SHA_A,
        },
      ],
      implementation_refs: [
        {
          repository_id: 'github.com/sdcorejs/orders',
          path: 'src/orders.ts',
          revision: SHA_A,
        },
      ],
      test_refs: [
        {
          repository_id: 'github.com/sdcorejs/orders',
          path: 'test/orders.test.ts',
          revision: SHA_A,
        },
      ],
      evidence_refs: [
        {
          evidence_id: 'evidence:orders-unit',
          repository_id: 'github.com/sdcorejs/orders',
          path: '.sdcorejs/evidence/orders-unit.json',
          revision: SHA_A,
          evidence_class: 'UNIT',
          result: 'PASSED',
        },
      ],
      delivery_status: 'verified',
      ...overrides,
    },
  ];
}

test('every central registry track is representable in a product ledger', () => {
  for (const { id: track } of systemRegistry.tracks) {
    const ledger = createProductLedger({
      metadata: ledgerMetadata({
        artifact_id: `product-ledger:${track}`,
        contract_id: `contract:${track}`,
        requirement_id: `requirement:${track}`,
        track,
        stack_profile: 'general',
      }),
      traceability: traceability({
        requirement_id: `requirement:${track}`,
      }),
      source_artifacts: [],
    });
    assert.equal(ledger.metadata.track, track);
    assert.match(ledger.metadata.artifact_hash, /^sha256:v1:[a-f0-9]{64}$/);
  }
});

test('AI-agent, design, documentation, workflow, and general fixtures preserve lifecycle identity', () => {
  for (const [track, stackProfile] of [
    ['ai-agent', 'ai-agent'],
    ['design', 'design'],
    ['documentation', 'documentation'],
    ['workflow', 'general'],
    ['general', 'general'],
  ]) {
    const ledger = createProductLedger({
      metadata: ledgerMetadata({
        artifact_id: `product-ledger:${track}`,
        contract_id: `contract:${track}`,
        requirement_id: `requirement:${track}`,
        track,
        stack_profile: stackProfile,
      }),
      traceability: traceability({
        requirement_id: `requirement:${track}`,
      }),
      source_artifacts: [],
    });
    for (const field of [
      'schema_version',
      'artifact_id',
      'artifact_kind',
      'contract_id',
      'requirement_id',
      'track',
      'stack_profile',
      'owner_repository_id',
      'owner_repository_role',
      'owner_module_id',
      'repository_relative_path',
      'source_revision',
      'parent_references',
      'supersedes',
      'artifact_hash',
    ]) {
      assert.ok(field in ledger.metadata, `${track} fixture has ${field}`);
    }
  }
});

test('module-owned ledgers route to the module and never fall back to the portal', () => {
  const portal = { repository_id: 'github.com/sdcorejs/portal' };
  const module = {
    id: 'orders',
    repository_id: 'github.com/sdcorejs/orders',
    available: true,
    writable: true,
  };
  const target = resolveProductLedgerTarget({
    scope: 'module',
    feature: 'orders',
    module,
    portal,
    execution_host_repository_id: portal.repository_id,
  });
  assert.equal(target.status, 'resolved');
  assert.equal(target.owner_repository_id, module.repository_id);
  assert.equal(
    target.repository_relative_path,
    '.sdcorejs/docs/product/orders.md',
  );

  const blocked = resolveProductLedgerTarget({
    scope: 'module',
    feature: 'orders',
    module: { ...module, writable: false },
    portal,
    execution_host_repository_id: portal.repository_id,
  });
  assert.equal(blocked.status, 'blocked');
  assert.equal(blocked.repository_relative_path, null);
  assert.match(blocked.blockers.join(' '), /not writable/i);
});

test('cross-repository product view keeps provenance and rejects editable or duplicate module sources', () => {
  const source = {
    repository_id: 'github.com/sdcorejs/orders',
    module_id: 'orders',
    artifact_id: 'product-ledger:orders',
    artifact_kind: 'product-ledger',
    repository_relative_path: '.sdcorejs/docs/product/orders.md',
    revision: SHA_A,
    artifact_hash: `sha256:v1:${'b'.repeat(64)}`,
    editable: false,
  };
  const result = buildCrossRepositoryProductView({
    metadata: ledgerMetadata({
      artifact_id: 'product-ledger:portal-view',
      contract_id: 'contract:portal-view',
      requirement_id: 'requirement:portal-view',
      owner_repository_id: 'github.com/sdcorejs/portal',
      owner_repository_role: 'portal',
      owner_module_id: null,
      ownership_scope: 'cross-repository-aggregate',
      repository_relative_path:
        '.sdcorejs/docs/product/portal-view.md',
      source_revision: SHA_B,
      parent_references: [],
    }),
    module_ledgers: [
      source,
      {
        ...source,
        repository_id: 'github.com/sdcorejs/users',
        module_id: 'users',
        artifact_id: 'product-ledger:users',
        repository_relative_path: '.sdcorejs/docs/product/users.md',
        revision: SHA_B,
        artifact_hash: `sha256:v1:${'c'.repeat(64)}`,
      },
    ],
  });
  assert.equal(result.ok, true);
  assert.equal(result.ledger.view_kind, 'cross-module-view');
  assert.equal(result.ledger.editable_requirements, false);
  assert.equal(result.ledger.source_artifacts.length, 2);

  assert.throws(
    () =>
      buildCrossRepositoryProductView({
        metadata: result.ledger.metadata,
        module_ledgers: [{ ...source, editable: true }],
      }),
    /editable module requirement source/i,
  );
  assert.throws(
    () =>
      buildCrossRepositoryProductView({
        metadata: result.ledger.metadata,
        module_ledgers: [source, source],
      }),
    /duplicate product source/i,
  );
});

test('stale or missing test evidence cannot produce a verified delivery status', () => {
  const stale = validateProductLedger(
    {
      metadata: ledgerMetadata(),
      traceability: traceability(),
      source_artifacts: [],
    },
    {
      repository_revisions: {
        'github.com/sdcorejs/orders': SHA_B,
      },
    },
  );
  assert.equal(stale.ok, false);
  assert.equal(stale.traceability[0].delivery_status, 'stale');
  assert.equal(stale.traceability[0].evidence_refs[0].result, 'STALE');
  assert.ok(stale.errors.some(({ code }) => code === 'STALE_EVIDENCE'));

  const missing = validateProductLedger({
    metadata: ledgerMetadata(),
    traceability: traceability({
      test_refs: [],
      evidence_refs: [],
      delivery_status: 'verified',
    }),
    source_artifacts: [],
  });
  assert.equal(missing.ok, false);
  assert.ok(
    missing.errors.some(
      ({ code }) => code === 'VERIFIED_WITHOUT_TEST_EVIDENCE',
    ),
  );
});

test('product prose consumes the registry and does not compete with spec, plan, test, or code owners', async () => {
  const [skill, contract] = await Promise.all([
    readFile(path.join(root, 'skills/tracks/product/sdcorejs-product.md'), 'utf8'),
    readFile(path.join(root, '_refs/shared/product-ledger.md'), 'utf8'),
  ]);
  assert.match(skill, /system-registry\.json/);
  assert.doesNotMatch(skill, /tracks:\s*\[angular, nestjs, nextjs, test, generic\]/);
  assert.match(skill + contract, /AI-agent/i);
  assert.match(skill + contract, /documentation/i);
  assert.match(skill + contract, /workflow/i);
  assert.match(skill + contract, /portal fallback is forbidden/i);
  assert.match(skill + contract, /reference module artifacts/i);
  assert.match(skill + contract, /does not write application code/i);
  assert.match(skill + contract, /not a competing spec or plan/i);
  assert.match(skill + contract, /missing[\s\S]*evidence[\s\S]*not[\s\S]*pass/i);
});
