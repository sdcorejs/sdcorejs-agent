import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  CONVENTION_SCHEMA_VERSION,
  evaluateConventionContext,
  validateConsistencyFinding,
} from '../../_refs/shared/convention-contract.mjs';
import {
  evaluateReviewContract,
  resolveConsistencyScope,
  reviewDimensions,
} from '../../_refs/shared/review-contract.mjs';
import { systemRegistry } from '../../_refs/shared/system-registry.mjs';

const REPOSITORY = 'github.com/acme/product-service';

function reviewContext(overrides = {}) {
  return {
    schema_version: 1,
    subject_track: 'nestjs',
    review_profile: 'nestjs',
    mode: 'read-only',
    write_actions: [],
    owner_repository_id: REPOSITORY,
    execution_host_repository_id: REPOSITORY,
    dimensions: ['code'],
    current_revision_map: {},
    portal_pinned_module_revision_map: {},
    artifacts: [],
    test_evidence: [],
    provider_evidence: [],
    reported_findings: [],
    ...overrides,
  };
}

function finding(overrides = {}) {
  return {
    id: 'R1',
    severity: 'Medium',
    confidence: 'high',
    dimension: 'consistency',
    finding_kind: 'CONVENTION_VIOLATION',
    category: 'api-routing',
    rule_id: 'api.resource-segment.cardinality',
    concept_id: 'resource-collection-path',
    semantic_role: 'collection-resource-path',
    source_boundary: 'public-api',
    repository_id: REPOSITORY,
    module_id: null,
    evidence: 'POST /product',
    locator: 'src/product/product.controller.ts:18',
    impact: 'A new public route contradicts the accepted plural collection rule.',
    required_fix: 'Register the route as POST /products before release.',
    repair_tier: 'confirm',
    compatibility_requirement: 'none',
    migration_requirement: 'none',
    user_decision_required: false,
    specification_required: false,
    eligible_for_automatic_repair: true,
    ...overrides,
  };
}

function conventionContext(overrides = {}) {
  return {
    schema_version: CONVENTION_SCHEMA_VERSION,
    mode: 'read-only',
    write_actions: [],
    scope: { repositories: [REPOSITORY], modules: [], boundaries: ['public-api'], files: [], change_ref: null },
    policy: {
      status: 'valid',
      path: '.sdcorejs/conventions/policy.yaml',
      capture_mode: 'after-review',
      write_authority: 'project-policy',
    },
    loaded_rules: {
      accepted: [],
      observed: [],
      conflicted: [],
      deprecated: [],
      stale: [],
      invalid: [],
    },
    findings: {
      direct_violations: [],
      semantic_alias_drift: [],
      term_collisions: [],
      cross_layer_drift: [],
      mapping_gaps: [],
      public_contract_drift: [],
    },
    candidates: [],
    conflicts: [],
    stale_rules: [],
    exceptions: [],
    ownership: {
      execution_host_repository_id: REPOSITORY,
      integration_owner_repository_id: REPOSITORY,
      target_owner_repository_ids: [REPOSITORY],
      unresolved_owners: [],
    },
    persistence: {
      requested: false,
      authorized: false,
      performed: false,
      sync_required: false,
      target_paths: [],
      blocked_reasons: [],
    },
    redaction: { applied: true, notes: null },
    ...overrides,
  };
}

test('consistency is a first-class dimension resolved from the registry', () => {
  assert.ok(reviewDimensions.includes('consistency'));
  assert.deepEqual(
    reviewDimensions,
    systemRegistry.review_dimensions.map(({ id }) => id),
  );

  assert.equal(resolveConsistencyScope(['consistency']).scope, 'complete');
  assert.equal(resolveConsistencyScope(['ALL']).scope, 'complete');
  assert.equal(resolveConsistencyScope(['code']).scope, 'applicable');
  assert.equal(resolveConsistencyScope(['architecture']).scope, 'structural');
  assert.equal(resolveConsistencyScope([]).scope, 'none');

  // A narrow request never silently becomes a naming inventory.
  for (const dimension of ['security', 'performance', 'accessibility', 'site-audit']) {
    assert.equal(resolveConsistencyScope([dimension]).scope, 'dimension-affecting-only', dimension);
  }
  // The broadest requested dimension wins when several are selected.
  assert.equal(resolveConsistencyScope(['security', 'consistency']).scope, 'complete');
  assert.equal(resolveConsistencyScope(['security', 'code']).scope, 'applicable');
});

test('review preserves the requested dimensions and rejects unknown ones', () => {
  const result = evaluateReviewContract(
    reviewContext({ dimensions: ['security', 'consistency'] }),
  );
  assert.deepEqual(result.requested_dimensions, ['security', 'consistency']);
  assert.equal(result.consistency_scope, 'complete');
  assert.equal(result.status, 'reviewed');

  const unknown = evaluateReviewContract(reviewContext({ dimensions: ['naming'] }));
  assert.equal(unknown.status, 'blocked');
  assert.ok(unknown.blockers.some((blocker) => blocker.includes('unsupported review dimension')));
});

test('a narrow dimension may only report a consistency issue that changes its own answer', () => {
  const permissionMismatch = finding({
    id: 'R7',
    severity: 'High',
    dimension: 'consistency',
    finding_kind: 'CROSS_LAYER_DRIFT',
    category: 'permissions',
    source_boundary: 'permission',
    target_boundary: 'frontend-route',
    impact: 'The guard checks a permission code the backend never grants.',
    required_fix: 'Map both boundaries to one permission identity.',
    affects_requested_dimension: true,
  });

  const allowed = evaluateReviewContract(
    reviewContext({ dimensions: ['security'], reported_findings: [permissionMismatch] }),
  );
  assert.equal(allowed.status, 'reviewed');
  assert.equal(allowed.findings.length, 1);

  const namingSweep = evaluateReviewContract(
    reviewContext({
      dimensions: ['security'],
      reported_findings: [finding({ affects_requested_dimension: false })],
    }),
  );
  assert.equal(namingSweep.status, 'blocked');
  assert.ok(namingSweep.blockers.some((blocker) => blocker.includes('expands a narrow review')));

  const sameFindingUnderCode = evaluateReviewContract(
    reviewContext({ dimensions: ['code'], reported_findings: [finding()] }),
  );
  assert.equal(sameFindingUnderCode.status, 'reviewed');

  // The consistency gate keys on a declared consistency kind, not on the mere
  // presence of a `finding_kind` field. Another producer's finding that happens
  // to carry that field must pass through untouched instead of being rejected as
  // an audit nobody requested.
  const foreignKind = evaluateReviewContract(
    reviewContext({
      dimensions: ['security'],
      reported_findings: [
        {
          id: 'R9',
          severity: 'High',
          evidence: 'src/auth.guard.ts:42',
          locator: 'src/auth.guard.ts:42',
          repository_id: REPOSITORY,
          impact: 'Module-owned editable artifact is stored in the wrong repository.',
          required_fix: 'Move authoring to the semantic owner.',
          dimension: 'security',
          finding_kind: 'misplaced-owner-artifact',
        },
      ],
    }),
  );
  assert.equal(foreignKind.status, 'reviewed');
  assert.equal(foreignKind.findings.length, 1);
});

test('consistency findings must carry their full classification contract', () => {
  assert.equal(validateConsistencyFinding(finding()).ok, true);

  for (const field of [
    'concept_id',
    'semantic_role',
    'source_boundary',
    'category',
    'confidence',
    'repair_tier',
  ]) {
    const incomplete = finding();
    delete incomplete[field];
    const result = validateConsistencyFinding(incomplete);
    assert.equal(result.ok, false, field);
    assert.ok(result.errors.some((error) => error.includes(field)), field);
  }

  assert.equal(
    validateConsistencyFinding(finding({ finding_kind: 'NAMING_NIT' })).ok,
    false,
  );
  assert.equal(
    validateConsistencyFinding(finding({ finding_kind: 'CROSS_LAYER_DRIFT' })).ok,
    false,
    'cross-layer findings must declare a target boundary',
  );
  assert.equal(
    validateConsistencyFinding(
      finding({ finding_kind: 'CROSS_LAYER_DRIFT', target_boundary: 'database' }),
    ).ok,
    true,
  );

  assert.deepEqual(
    systemRegistry.consistency_finding_kinds.filter((kind) =>
      ['CONVENTION_VIOLATION', 'SEMANTIC_ALIAS_DRIFT', 'TERM_COLLISION', 'CROSS_LAYER_DRIFT',
        'BOUNDARY_MAPPING_GAP', 'PUBLIC_CONTRACT_DRIFT', 'UNRESOLVED_CONVENTION',
        'STALE_CONVENTION', 'CONVENTION_CANDIDATE'].includes(kind),
    ).length,
    9,
  );
});

test('an observed candidate can never become a blocker or an automatic repair', () => {
  const candidate = finding({
    finding_kind: 'CONVENTION_CANDIDATE',
    severity: 'Info',
    repair_tier: 'user-decision',
    user_decision_required: true,
    eligible_for_automatic_repair: false,
  });
  assert.equal(validateConsistencyFinding(candidate).ok, true);

  assert.equal(
    validateConsistencyFinding({ ...candidate, severity: 'High' }).ok,
    false,
    'a candidate must stay non-blocking',
  );
  assert.equal(
    validateConsistencyFinding({ ...candidate, eligible_for_automatic_repair: true }).ok,
    false,
  );
});

test('compatibility and migration work is never marked auto-repairable', () => {
  const publicDrift = finding({
    finding_kind: 'PUBLIC_CONTRACT_DRIFT',
    severity: 'High',
    repair_tier: 'user-decision',
    user_decision_required: true,
    compatibility_requirement: 'external consumers depend on /product',
    migration_requirement: 'versioned alias plus deprecation window',
    eligible_for_automatic_repair: false,
  });
  assert.equal(validateConsistencyFinding(publicDrift).ok, true);
  assert.equal(
    validateConsistencyFinding({ ...publicDrift, eligible_for_automatic_repair: true }).ok,
    false,
  );
  assert.ok(
    validateConsistencyFinding({
      ...publicDrift,
      compatibility_requirement: 'none',
      migration_requirement: 'none',
    }).errors.some((error) => error.includes('compatibility or migration requirement')),
  );

  // A database column, permission code, or environment variable rename is the
  // same shape of external commitment and is refused the same way.
  for (const category of ['persistence', 'permissions', 'configuration']) {
    const rename = finding({
      category,
      migration_requirement: 'backfill plus dual-read window',
      eligible_for_automatic_repair: true,
    });
    assert.equal(validateConsistencyFinding(rename).ok, false, category);
  }
});

test('convention_context is read-only and blocks any write performed inside review', () => {
  const clean = evaluateConventionContext(conventionContext());
  assert.equal(clean.status, 'reviewed');
  assert.equal(clean.read_only_proven, true);
  assert.deepEqual(clean.blockers, []);

  const wrote = evaluateConventionContext(
    conventionContext({ write_actions: ['.sdcorejs/conventions/repository/a/b.yaml'] }),
  );
  assert.equal(wrote.status, 'blocked');
  assert.equal(wrote.read_only_proven, false);

  const performed = evaluateConventionContext(
    conventionContext({
      persistence: {
        requested: true,
        authorized: true,
        performed: true,
        sync_required: true,
        target_paths: [],
        blocked_reasons: [],
      },
    }),
  );
  assert.equal(performed.status, 'blocked');
  assert.ok(
    performed.blockers.some((blocker) => blocker.includes('must not perform convention persistence')),
  );

  const missingRedaction = evaluateConventionContext(
    conventionContext({ redaction: { applied: false, notes: null } }),
  );
  assert.equal(missingRedaction.status, 'blocked');

  // Scope drives the later sync, so a malformed one is caught here.
  const badScope = evaluateConventionContext(
    conventionContext({
      scope: { repositories: REPOSITORY, modules: [], boundaries: [], files: [], change_ref: null },
    }),
  );
  assert.equal(badScope.status, 'blocked');
  assert.ok(badScope.blockers.some((blocker) => blocker.includes('scope.repositories')));

  const badChangeRef = evaluateConventionContext(
    conventionContext({
      scope: { repositories: [], modules: [], boundaries: [], files: [], change_ref: 42 },
    }),
  );
  assert.equal(badChangeRef.status, 'blocked');
  assert.ok(badChangeRef.blockers.some((blocker) => blocker.includes('scope.change_ref')));

  const badTarget = evaluateConventionContext(
    conventionContext({
      persistence: {
        requested: true,
        authorized: true,
        performed: false,
        sync_required: true,
        target_paths: ['.sdcorejs/memories/general/api.md'],
        blocked_reasons: [],
      },
    }),
  );
  assert.equal(badTarget.status, 'blocked');
  assert.ok(badTarget.blockers.some((blocker) => blocker.includes('not a valid convention path')));
});

test('an after-review policy flags the separate sync without weakening read-only review', () => {
  const withCandidates = evaluateConventionContext(
    conventionContext({ candidates: [{ rule: { id: 'naming.property.case' } }] }),
  );
  assert.equal(withCandidates.status, 'reviewed');
  assert.equal(withCandidates.capture_mode, 'after-review');
  assert.equal(withCandidates.sync_required, true);
  // The review step itself still proves it wrote nothing.
  assert.equal(withCandidates.read_only_proven, true);

  const noPolicy = evaluateConventionContext(
    conventionContext({
      policy: { status: 'missing', path: 'none', capture_mode: 'disabled', write_authority: 'none' },
      candidates: [{ rule: { id: 'naming.property.case' } }],
    }),
  );
  assert.equal(noPolicy.status, 'reviewed');
  assert.equal(noPolicy.sync_required, false);

  const manual = evaluateConventionContext(
    conventionContext({
      policy: {
        status: 'valid',
        path: '.sdcorejs/conventions/policy.yaml',
        capture_mode: 'manual',
        write_authority: 'none',
      },
      candidates: [{ rule: { id: 'naming.property.case' } }],
    }),
  );
  assert.equal(manual.sync_required, false);
});

test('conflicted and stale rules are loaded but never enforced', () => {
  const enforceableInWrongBucket = evaluateConventionContext(
    conventionContext({
      loaded_rules: {
        accepted: [],
        observed: [],
        conflicted: [
          {
            scope: { kind: 'repository' },
            rule: { id: 'api.x', status: 'accepted', concept_id: 'c', semantic_role: 'r' },
            source: { kind: 'explicit-user-decision' },
          },
        ],
        deprecated: [],
        stale: [],
        invalid: [],
      },
    }),
  );
  assert.equal(enforceableInWrongBucket.status, 'blocked');
  assert.ok(
    enforceableInWrongBucket.blockers.some((blocker) => blocker.includes('must not be enforceable')),
  );

  const wrongAcceptedBucket = evaluateConventionContext(
    conventionContext({
      loaded_rules: {
        accepted: [{ scope: { kind: 'repository' }, rule: { id: 'api.x', status: 'observed' } }],
        observed: [],
        conflicted: [],
        deprecated: [],
        stale: [],
        invalid: [],
      },
    }),
  );
  assert.equal(wrongAcceptedBucket.status, 'blocked');
});

test('review carrying a convention_context refuses one that claims a write', () => {
  const clean = evaluateReviewContract(
    reviewContext({ dimensions: ['consistency'], convention_context: conventionContext() }),
  );
  assert.equal(clean.status, 'reviewed');
  assert.equal(clean.convention_context_read_only, true);

  const dirty = evaluateReviewContract(
    reviewContext({
      dimensions: ['consistency'],
      convention_context: conventionContext({ write_actions: ['.sdcorejs/conventions/policy.yaml'] }),
    }),
  );
  assert.equal(dirty.status, 'blocked');
  assert.equal(dirty.convention_context_read_only, false);
  assert.equal(evaluateReviewContract(reviewContext()).convention_context_read_only, null);
});

test('the shared consistency reference stays profile-neutral and documents the guardrails', async () => {
  const text = await readFile(
    new URL('../../_refs/shared/review-consistency.md', import.meta.url),
    'utf8',
  );
  // References at or beyond 500 lines must open with a table of contents.
  if (text.split(/\r?\n/).length >= 500) {
    assert.match(text.slice(0, 2000), /contents|table of contents/i);
  }

  for (const kind of systemRegistry.consistency_finding_kinds) {
    assert.ok(text.includes(kind), `shared reference must define ${kind}`);
  }
  for (const guardrail of [
    'Same string, different meaning',
    'Different strings, same meaning',
    'Boundary transformations',
    'Dominance is not authority',
    'Command versus event',
  ]) {
    assert.ok(text.includes(guardrail), `shared reference must keep the ${guardrail} guardrail`);
  }
  // It must not force one framework's layout onto every profile.
  assert.ok(text.includes('structure on an unrelated profile'));
  assert.ok(text.includes('not a casing linter'));
});
