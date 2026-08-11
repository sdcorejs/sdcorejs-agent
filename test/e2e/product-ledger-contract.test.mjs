import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  buildCrossRepositoryProductView,
  buildProductArtifactContext,
  createProductLedger,
  resolveProductLedgerTarget,
  validateProductLedger,
} from '../../_refs/shared/product-ledger.mjs';
import { systemRegistry } from '../../_refs/shared/system-registry.mjs';

const root = path.resolve('.');
const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);
const APPROVAL_A = `sha256:v1:${'a'.repeat(64)}`;

function fixtureArtifactHash(ledger) {
  const canonicalize = (value) => {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((key) => [key, canonicalize(value[key])]),
      );
    }
    return typeof value === 'string'
      ? value.replace(/\r\n?/gu, '\n').normalize('NFC')
      : value;
  };
  const payload = structuredClone(ledger);
  delete payload.metadata?.artifact_hash;
  return `sha256:v1:${createHash('sha256')
    .update(JSON.stringify(canonicalize(payload)), 'utf8')
    .digest('hex')}`;
}

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
    prd_path: '.sdcorejs/product/prds/orders.md',
    user_stories_path: '.sdcorejs/product/user-stories/orders.md',
    acceptance_criteria_path: '.sdcorejs/product/acceptance-criteria/orders.md',
    uat_checklist_path: '.sdcorejs/product/uat-checklists/orders.md',
    decisions_path: '.sdcorejs/product/decisions/orders.md',
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
    assert.equal(
      ledger.traceability[0].acceptance_criterion_id,
      'AC-001',
      'legacy AC-1 input is normalized at the product-ledger boundary',
    );
    assert.match(ledger.metadata.artifact_hash, /^sha256:v1:[a-f0-9]{64}$/);
  }
});

test('product ledger emits canonical acceptance IDs and rejects invalid or duplicate normalized IDs', () => {
  const legacy = validateProductLedger({
    metadata: ledgerMetadata(),
    traceability: traceability({ acceptance_criterion_id: 'AC-1' }),
    source_artifacts: [],
  });
  assert.equal(legacy.ok, true);
  assert.equal(legacy.traceability[0].acceptance_criterion_id, 'AC-001');

  const duplicate = validateProductLedger({
    metadata: ledgerMetadata(),
    traceability: [
      ...traceability({ acceptance_criterion_id: 'AC-1' }),
      ...traceability({ acceptance_criterion_id: 'AC-001' }),
    ],
    source_artifacts: [],
  });
  assert.equal(duplicate.ok, false);
  assert.ok(
    duplicate.errors.some(({ code }) => code === 'DUPLICATE_ACCEPTANCE_CRITERION_SOURCE'),
  );

  const invalid = validateProductLedger({
    metadata: ledgerMetadata(),
    traceability: traceability({ acceptance_criterion_id: 'criterion-one' }),
    source_artifacts: [],
  });
  assert.equal(invalid.ok, false);
  assert.ok(invalid.errors.some(({ code }) => code === 'INVALID_ACCEPTANCE_CRITERION_ID'));
});

test('legacy acceptance IDs verify their input hash before canonical hash emission', () => {
  const legacyPayload = {
    metadata: ledgerMetadata(),
    traceability: traceability({ acceptance_criterion_id: 'AC-1' }),
    source_artifacts: [],
  };
  const legacyHash = fixtureArtifactHash(legacyPayload);
  legacyPayload.metadata.artifact_hash = legacyHash;

  const validated = validateProductLedger(legacyPayload);
  assert.equal(validated.ok, true);
  assert.equal(validated.ledger.traceability[0].acceptance_criterion_id, 'AC-001');
  assert.notEqual(validated.ledger.metadata.artifact_hash, legacyHash);
  assert.equal(
    validated.ledger.metadata.artifact_hash,
    fixtureArtifactHash(validated.ledger),
    'canonical output carries a hash over the normalized payload',
  );

  const tampered = structuredClone(legacyPayload);
  tampered.metadata.artifact_hash = `sha256:v1:${'0'.repeat(64)}`;
  const rejected = validateProductLedger(tampered);
  assert.equal(rejected.ok, false);
  assert.ok(rejected.errors.some(({ code }) => code === 'ARTIFACT_HASH_MISMATCH'));
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
  assert.equal(target.ledger_relative_path, '.sdcorejs/docs/product/orders.md');
  assert.equal(target.document_root, '.sdcorejs/product');
  assert.equal(target.ledger_root, '.sdcorejs/docs/product');
  assert.deepEqual(target.document_paths, [
    '.sdcorejs/product/prds/orders.md',
    '.sdcorejs/product/user-stories/orders.md',
    '.sdcorejs/product/acceptance-criteria/orders.md',
    '.sdcorejs/product/uat-checklists/orders.md',
    '.sdcorejs/product/decisions/orders.md',
  ]);
  assert.deepEqual(target.metadata_paths, {
    prd_path: '.sdcorejs/product/prds/orders.md',
    user_stories_path: '.sdcorejs/product/user-stories/orders.md',
    acceptance_criteria_path: '.sdcorejs/product/acceptance-criteria/orders.md',
    uat_checklist_path: '.sdcorejs/product/uat-checklists/orders.md',
    decisions_path: '.sdcorejs/product/decisions/orders.md',
  });

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
    acceptance_criterion_id: 'AC-010',
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
        acceptance_criterion_id: 'AC-020',
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
  assert.deepEqual(
    result.ledger.traceability.map(({ acceptance_criterion_id: id }) => id),
    ['AC-010', 'AC-020'],
  );

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

test('cross-repository acceptance identities survive reorder and insertion and fail closed', () => {
  const metadata = ledgerMetadata({
    artifact_id: 'product-ledger:portal-view',
    contract_id: 'contract:portal-view',
    requirement_id: 'requirement:portal-view',
    owner_repository_id: 'github.com/sdcorejs/portal',
    owner_repository_role: 'portal',
    owner_module_id: null,
    ownership_scope: 'cross-repository-aggregate',
    repository_relative_path: '.sdcorejs/docs/product/portal-view.md',
    source_revision: SHA_B,
    parent_references: [],
  });
  const source = (moduleId, acceptanceCriterionId, revision = SHA_A) => ({
    repository_id: `github.com/sdcorejs/${moduleId}`,
    module_id: moduleId,
    acceptance_criterion_id: acceptanceCriterionId,
    artifact_id: `product-ledger:${moduleId}`,
    artifact_kind: 'product-ledger',
    repository_relative_path: `.sdcorejs/docs/product/${moduleId}.md`,
    revision,
    artifact_hash: `sha256:v1:${(moduleId === 'orders' ? 'b' : 'c').repeat(64)}`,
    editable: false,
  });
  const orders = source('orders', 'AC-010');
  const users = source('users', 'AC-020', SHA_B);
  const billing = source('billing', 'AC-015');
  const identityMap = (moduleLedgers) =>
    Object.fromEntries(
      buildCrossRepositoryProductView({ metadata, module_ledgers: moduleLedgers })
        .ledger.traceability.map((row) => [
          row.requirement_ref.artifact_id,
          row.acceptance_criterion_id,
        ]),
    );

  const original = identityMap([orders, users]);
  assert.deepEqual(identityMap([users, orders]), original);
  const inserted = identityMap([orders, billing, users]);
  assert.equal(inserted['product-ledger:orders'], original['product-ledger:orders']);
  assert.equal(inserted['product-ledger:users'], original['product-ledger:users']);
  assert.equal(inserted['product-ledger:billing'], 'AC-015');

  assert.throws(
    () => identityMap([{ ...orders, acceptance_criterion_id: undefined }]),
    /canonical acceptance_criterion_id/i,
  );
  assert.throws(
    () => identityMap([{ ...orders, acceptance_criterion_id: 'AC-1' }]),
    /canonical acceptance_criterion_id/i,
  );
  assert.throws(
    () => identityMap([{ ...orders, acceptance_criterion_id: 'criterion-one' }]),
    /canonical acceptance_criterion_id/i,
  );
  assert.throws(
    () => identityMap([orders, { ...users, acceptance_criterion_id: 'AC-010' }]),
    /duplicate acceptance_criterion_id/i,
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

test('product ledger metadata accepts only canonical document paths', () => {
  const canonical = validateProductLedger({
    metadata: ledgerMetadata(),
    traceability: traceability(),
    source_artifacts: [],
  });
  assert.deepEqual(canonical.errors, []);

  for (const [field, legacyPath] of [
    ['prd_path', 'product/prds/orders.md'],
    ['user_stories_path', 'product/user-stories/orders.md'],
    ['acceptance_criteria_path', 'product/acceptance-criteria/orders.md'],
    ['uat_checklist_path', 'product/uat-checklists/orders.md'],
    ['decisions_path', 'product/decisions/orders.md'],
  ]) {
    const rejected = validateProductLedger({
      metadata: ledgerMetadata({ [field]: legacyPath }),
      traceability: traceability(),
      source_artifacts: [],
    });
    assert.equal(rejected.ok, false, `${field} must reject ${legacyPath}`);
    assert.ok(
      rejected.errors.some(
        (error) => error.code === 'LEGACY_PRODUCT_DOCUMENT_PATH' && error.field === field,
      ),
      `${field} must report LEGACY_PRODUCT_DOCUMENT_PATH`,
    );
  }

  const wrongCategory = validateProductLedger({
    metadata: ledgerMetadata({ prd_path: '.sdcorejs/product/user-stories/orders.md' }),
    traceability: traceability(),
    source_artifacts: [],
  });
  assert.ok(
    wrongCategory.errors.some(
      ({ code }) => code === 'PRODUCT_DOCUMENT_CATEGORY_MISMATCH',
    ),
  );

  const legacyLedgerRoot = validateProductLedger({
    metadata: ledgerMetadata({ repository_relative_path: 'product/ledgers/orders.md' }),
    traceability: traceability(),
    source_artifacts: [],
  });
  assert.ok(
    legacyLedgerRoot.errors.some(({ code }) => code === 'INVALID_PRODUCT_LEDGER_PATH'),
  );
});

test('product artifact context covers every written document plus the ledger', () => {
  const full = buildProductArtifactContext({
    feature: 'orders',
    change_ref: 'orders-change',
    source_spec: '.sdcorejs/specs/product/orders.md',
    source_plan: '.sdcorejs/plans/product/orders.md',
  });
  assert.equal(full.change_ref, 'orders-change');
  assert.deepEqual(full.required_with_change.map(({ path: item }) => item), [
    '.sdcorejs/product/prds/orders.md',
    '.sdcorejs/product/user-stories/orders.md',
    '.sdcorejs/product/acceptance-criteria/orders.md',
    '.sdcorejs/product/uat-checklists/orders.md',
    '.sdcorejs/product/decisions/orders.md',
    '.sdcorejs/docs/product/orders.md',
  ]);
  assert.deepEqual(
    [...new Set(full.required_with_change.map(({ kind }) => kind))].sort(),
    ['product-doc', 'product-ledger'],
  );

  const partial = buildProductArtifactContext({
    feature: 'orders',
    change_ref: 'orders-change',
    written_documents: ['prd', 'acceptance_criteria'],
  });
  assert.deepEqual(partial.required_with_change.map(({ path: item }) => item), [
    '.sdcorejs/product/prds/orders.md',
    '.sdcorejs/product/acceptance-criteria/orders.md',
    '.sdcorejs/docs/product/orders.md',
  ]);
  assert.throws(
    () => buildProductArtifactContext({ feature: 'orders' }),
    /change_ref is required/,
  );
  assert.throws(
    () =>
      buildProductArtifactContext({
        feature: 'orders',
        change_ref: 'orders-change',
        written_documents: ['roadmap'],
      }),
    /unknown product document category/,
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
  assert.match(skill, /\.sdcorejs\/product\/prds\/</);
  assert.match(skill, /\.sdcorejs\/product\/user-stories\/</);
  assert.match(skill, /\.sdcorejs\/product\/acceptance-criteria\/</);
  assert.match(skill, /\.sdcorejs\/product\/uat-checklists\/</);
  assert.match(skill, /\.sdcorejs\/product\/decisions\/</);
  assert.match(skill, /\.sdcorejs\/docs\/product\/</);
  assert.match(skill + contract, /read-only compatibility/i);
  assert.match(skill + contract, /artifact-paths\.mjs/);
  assert.match(contract, /LEGACY_PRODUCT_DOCUMENT_PATH/);
  for (const legacyWrite of [
    /Write[^\n]*`product\/prds\//i,
    /prd_path: product\//,
    /user_stories_path: product\//,
    /acceptance_criteria_path: product\//,
    /uat_checklist_path: product\//,
  ]) {
    assert.doesNotMatch(skill, legacyWrite);
    assert.doesNotMatch(contract, legacyWrite);
  }
});

test('cross-repository prose matches the runtime acceptance identity contract', async () => {
  const [contract, skill, runtime] = await Promise.all([
    readFile(path.join(root, '_refs/shared/product-ledger.md'), 'utf8'),
    readFile(path.join(root, 'skills/tracks/product/sdcorejs-product.md'), 'utf8'),
    readFile(path.join(root, '_refs/shared/product-ledger.mjs'), 'utf8'),
  ]);
  assert.match(runtime, /acceptance_criterion_id: source\.acceptance_criterion_id/u);
  assert.match(runtime, /duplicate acceptance_criterion_id/u);

  const proseContracts = [
    [
      '_refs/shared/product-ledger.md',
      contract.match(/## Cross-Repository View[\s\S]*?(?=\n## |$)/u)?.[0] ?? '',
    ],
    [
      'skills/tracks/product/sdcorejs-product.md',
      skill.match(/A cross-module Product view[\s\S]*?(?=\n## |$)/u)?.[0] ?? '',
    ],
  ];
  for (const [file, section] of proseContracts) {
    assert.match(section, /acceptance_criterion_id:\s*AC-001/u, file);
    assert.match(section, /source-(?:owned|provided)/iu, file);
    assert.match(section, /reorder/iu, file);
    assert.match(section, /insert/iu, file);
    assert.match(section, /duplicate[^.\n]*acceptance_criterion_id/iu, file);
    assert.match(section, /(?:fail closed|block generation)/iu, file);
  }
});
