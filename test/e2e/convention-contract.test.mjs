import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONVENTION_POLICY_PATH,
  CONVENTION_PRECEDENCE,
  DEFAULT_CONVENTION_POLICY,
  conventionContentHash,
  enforcementForStatus,
  normalizeEvidence,
  planConventionSync,
  precedenceRank,
  projectConventionContext,
  resolveCandidateStatus,
  resolveConventionOwner,
  resolveConventionWriteAuthority,
  resolveEffectiveRules,
  screenConventionEvidence,
  validateConventionPolicy,
  validateConventionRule,
} from '../../_refs/shared/convention-contract.mjs';
import {
  classifyConventionPath,
  resolveConventionRulePath,
  validateConventionScopeAgreement,
} from '../../_refs/shared/convention-paths.mjs';
import { systemRegistry, validateSystemRegistry } from '../../_refs/shared/system-registry.mjs';

const PORTAL = 'github.com/acme/portal';
const MDM = 'github.com/acme/mdm';

function rule(overrides = {}) {
  const base = {
    schema_version: 1,
    artifact_id: 'convention-api-resource-cardinality',
    artifact_kind: 'convention',
    document_type: 'rule',
    change_ref: 'shared-project-conventions',
    source_spec: 'none',
    source_plan: 'none',
    commit_policy: 'conditional',
    owner: 'sdcorejs-explore',
    repository: { repository_id: PORTAL },
    scope: { kind: 'repository', module_id: null, boundary: 'public-api' },
    rule: {
      id: 'api.resource-segment.cardinality',
      category: 'api-routing',
      concept_id: 'resource-collection-path',
      semantic_role: 'collection-resource-path',
      canonical: { value: 'plural', examples: ['/products'] },
      status: 'accepted',
      enforcement: 'required',
    },
    source: { kind: 'authoritative-repository-config', reference: 'openapi.yaml' },
    confidence: 'high',
    rationale: 'Public REST resources use plural collection segments.',
    evidence: [{ path: 'openapi.yaml', locator: 'paths./products', observed: '/products' }],
    freshness: { repository_revision: 'a'.repeat(40), status: 'current' },
  };
  return {
    ...base,
    ...overrides,
    repository: { ...base.repository, ...(overrides.repository ?? {}) },
    scope: { ...base.scope, ...(overrides.scope ?? {}) },
    rule: { ...base.rule, ...(overrides.rule ?? {}) },
    source: { ...base.source, ...(overrides.source ?? {}) },
  };
}

const TOPOLOGY = {
  repository_id: PORTAL,
  portal_repository_id: PORTAL,
  integration_owner_repository_id: PORTAL,
  modules: [{ module_id: 'mdm', repository_id: MDM, available: true, writable: true }],
};

test('registry declares the convention root, kind, and review dimensions once', () => {
  assert.deepEqual(validateSystemRegistry(), []);
  assert.equal(systemRegistry.artifact_roots.conventions, '.sdcorejs/conventions');
  assert.ok(systemRegistry.artifact_kinds.includes('convention'));
  assert.equal(CONVENTION_POLICY_PATH, '.sdcorejs/conventions/policy.yaml');

  const dimensionIds = systemRegistry.review_dimensions.map(({ id }) => id);
  assert.ok(dimensionIds.includes('consistency'));
  assert.equal(new Set(dimensionIds).size, dimensionIds.length);

  // A second dimension enum is exactly the drift this registry exists to stop.
  const withoutConsistency = structuredClone(systemRegistry);
  withoutConsistency.review_dimensions = withoutConsistency.review_dimensions.filter(
    ({ id }) => id !== 'consistency',
  );
  assert.ok(
    validateSystemRegistry(withoutConsistency).some((error) =>
      error.includes('must declare consistency'),
    ),
  );

  const withoutKind = structuredClone(systemRegistry);
  withoutKind.artifact_kinds = withoutKind.artifact_kinds.filter((kind) => kind !== 'convention');
  assert.ok(
    validateSystemRegistry(withoutKind).some((error) => error.includes('convention artifact kind')),
  );
});

test('convention paths carry scope identity and fail closed on every malformed shape', () => {
  assert.equal(
    resolveConventionRulePath({
      scope_kind: 'repository',
      category: 'api-routing',
      rule_id: 'api.resource-segment.cardinality',
    }),
    '.sdcorejs/conventions/repository/api-routing/api-resource-segment-cardinality.yaml',
  );
  assert.equal(
    resolveConventionRulePath({
      scope_kind: 'module',
      module_id: 'mdm',
      category: 'permissions',
      rule_id: 'permissions.code.format',
    }),
    '.sdcorejs/conventions/modules/mdm/permissions/permissions-code-format.yaml',
  );
  assert.throws(
    () =>
      resolveConventionRulePath({
        scope_kind: 'module',
        category: 'permissions',
        rule_id: 'permissions.code.format',
      }),
    /module id/,
  );
  assert.throws(
    () =>
      resolveConventionRulePath({
        scope_kind: 'repository',
        module_id: 'mdm',
        category: 'permissions',
        rule_id: 'permissions.code.format',
      }),
    /must not declare a module id/,
  );

  const policy = classifyConventionPath(CONVENTION_POLICY_PATH);
  assert.equal(policy.document_type, 'policy');

  const moduleRule = classifyConventionPath(
    '.sdcorejs/conventions/modules/mdm/permissions/permissions-code-format.yaml',
  );
  assert.deepEqual(
    {
      scope: moduleRule.scope_kind,
      module: moduleRule.module_id,
      category: moduleRule.category,
    },
    { scope: 'module', module: 'mdm', category: 'permissions' },
  );

  const failures = {
    '/abs/.sdcorejs/conventions/repository/a/b.yaml': 'INVALID_RELATIVE_PATH',
    '.sdcorejs/conventions/../conventions/repository/a/b.yaml': 'INVALID_RELATIVE_PATH',
    '.sdcorejs/specs/workflow/a.md': 'OUTSIDE_CONVENTION_ROOT',
    '.sdcorejs/conventions/global/a/b.yaml': 'UNKNOWN_CONVENTION_SCOPE',
    '.sdcorejs/conventions/repository/b.yaml': 'INVALID_CONVENTION_PATH_DEPTH',
    '.sdcorejs/conventions/repository/a/b/c.yaml': 'INVALID_CONVENTION_PATH_DEPTH',
    '.sdcorejs/conventions/modules/MDM/permissions/b.yaml': 'INVALID_CONVENTION_MODULE_ID',
    '.sdcorejs/conventions/repository/API_Routing/b.yaml': 'INVALID_CONVENTION_CATEGORY',
    '.sdcorejs/conventions/repository/api-routing/b.json': 'UNSUPPORTED_CONVENTION_EXTENSION',
    '.sdcorejs/conventions/repository/api-routing/B_Rule.yaml': 'INVALID_CONVENTION_RULE_FILE',
  };
  for (const [candidate, code] of Object.entries(failures)) {
    const classification = classifyConventionPath(candidate);
    assert.equal(classification.ok, false, candidate);
    assert.equal(classification.code, code, candidate);
  }
});

test('metadata that contradicts its canonical path fails closed', () => {
  const path = '.sdcorejs/conventions/repository/api-routing/api-resource-segment-cardinality.yaml';
  const agreement = validateConventionScopeAgreement({
    path,
    scope: { kind: 'module', module_id: 'mdm' },
    rule: { category: 'api-routing', id: 'api.resource-segment.cardinality' },
  });
  assert.equal(agreement.ok, false);
  assert.ok(agreement.errors.some((error) => error.includes('contradicts path scope')));
  assert.ok(agreement.errors.some((error) => error.includes('contradicts path module')));

  assert.equal(validateConventionRule(rule(), { path }).ok, true);
  const misfiled = validateConventionRule(rule(), {
    path: '.sdcorejs/conventions/repository/naming/api-resource-segment-cardinality.yaml',
  });
  assert.equal(misfiled.ok, false);
  assert.ok(misfiled.errors.some((error) => error.includes('contradicts path category')));
});

test('rule schema rejects bad versions, statuses, identity, and enforcement mismatches', () => {
  assert.equal(validateConventionRule(rule({ schema_version: 2 })).ok, false);
  assert.equal(validateConventionRule(null).ok, false);
  assert.equal(validateConventionRule(rule({ artifact_kind: 'memory' })).ok, false);

  const badEnforcement = validateConventionRule(
    rule({ rule: { status: 'observed', enforcement: 'required' } }),
  );
  assert.equal(badEnforcement.ok, false);
  assert.ok(badEnforcement.errors.some((error) => error.includes('contradicts status')));

  const conflicted = validateConventionRule(
    rule({ rule: { status: 'conflicted', enforcement: 'none', canonical: null } }),
  );
  assert.equal(conflicted.ok, false);
  assert.ok(conflicted.errors.some((error) => error.includes('at least two alternatives')));

  const deprecated = validateConventionRule(
    rule({ rule: { status: 'deprecated', enforcement: 'compatibility-aware' } }),
  );
  assert.equal(deprecated.ok, false);
  assert.ok(deprecated.errors.some((error) => error.includes('replaced_by')));

  // An absolute checkout path is a fact about one machine, never durable identity.
  const absoluteId = validateConventionRule(
    rule({ repository: { repository_id: 'C:/checkouts/portal' } }),
  );
  assert.equal(absoluteId.ok, false);
  assert.ok(absoluteId.errors.some((error) => error.includes('absolute checkout path')));

  const inferredAccepted = validateConventionRule(
    rule({ source: { kind: 'existing-code-observation', reference: 'src/' } }),
  );
  assert.equal(inferredAccepted.ok, false);
  assert.ok(inferredAccepted.errors.some((error) => error.includes('accepted_by')));
});

test('evidence screening rejects secrets and PII instead of quietly rewriting them', () => {
  assert.deepEqual(screenConventionEvidence({ path: 'src/a.ts', observed: 'products' }), []);
  assert.deepEqual(
    screenConventionEvidence({ locator: 'API_KEY', observed: 'abc123def456' }),
    ['secret-like-assignment'],
  );
  assert.ok(
    screenConventionEvidence({
      path: '.env',
      locator: 'value',
      observed: '-----BEGIN PRIVATE KEY-----',
    }).includes('secret-value'),
  );
  assert.ok(
    screenConventionEvidence({ path: 'fixtures.ts', observed: 'jane.doe@example.com' }).includes(
      'pii',
    ),
  );
  // Reporting the key name with a redaction marker stays acceptable evidence.
  assert.deepEqual(
    screenConventionEvidence({ locator: 'API_KEY', observed: '[REDACTED]' }),
    [],
  );

  // This layer is the gate that runs before a convention is ever written, so it
  // must catch a provider token embedded in an observed value even when the
  // locator looks innocuous - the closure-time content scanner is line-anchored
  // and would not see it nested inside a YAML scalar.
  assert.ok(
    screenConventionEvidence({
      path: 'src/config.ts',
      locator: 'defaultClient',
      observed: 'client = new Client("sk_live_abcdef123456")',
    }).includes('secret-value'),
  );

  // Evidence is a code excerpt, so a credential usually arrives mid-line as an
  // assignment rather than as the whole value. The locator hint cannot see that,
  // and neither can the line-anchored closure scanner, so it has to be caught
  // here or it clears both gates.
  for (const observed of [
    'const password = "hunter2"',
    'apiKey: "abcd1234efgh5678"',
    'client_secret=abc123xyz',
    '{ token: `abc123def456` }',
  ]) {
    assert.deepEqual(
      screenConventionEvidence({ path: 'src/x.ts', locator: 'ctx', observed }),
      ['secret-like-assignment'],
      observed,
    );
  }

  // Correct code and ordinary convention evidence must stay clean. A screener
  // that cries wolf on `process.env` teaches reviewers to ignore it.
  for (const observed of [
    'password: process.env.DB_PASSWORD',
    'apiKey: config.apiKey',
    'token: <redacted>',
    'secret: [REDACTED]',
    'password: null',
    'token: ""',
    'passwordHash',
    'isActive',
    '/products',
    'MDM_C_PRODUCT_LIST',
  ]) {
    assert.deepEqual(
      screenConventionEvidence({ path: 'src/x.ts', locator: 'ctx', observed }),
      [],
      observed,
    );
  }

  const leaking = validateConventionRule(
    rule({
      evidence: [{ path: '.env.local', locator: 'CLIENT_SECRET', observed: 'sk_live_abcd1234efgh' }],
    }),
  );
  assert.equal(leaking.ok, false);
  assert.ok(leaking.errors.some((error) => error.includes('unredacted sensitive material')));
});

test('policy schema keeps inference conservative and shared writes owner-only', () => {
  assert.equal(validateConventionPolicy(DEFAULT_CONVENTION_POLICY, { path: CONVENTION_POLICY_PATH }).ok, true);

  const autoAcceptInferred = structuredClone(DEFAULT_CONVENTION_POLICY);
  autoAcceptInferred.capture.auto_accept.inferred_patterns = true;
  assert.ok(
    validateConventionPolicy(autoAcceptInferred).errors.some((error) =>
      error.includes('inferred_patterns must stay false'),
    ),
  );

  const thinEvidence = structuredClone(DEFAULT_CONVENTION_POLICY);
  thinEvidence.capture.inference.minimum_independent_evidence = 1;
  assert.ok(
    validateConventionPolicy(thinEvidence).errors.some((error) =>
      error.includes('minimum_independent_evidence'),
    ),
  );

  const weakDominance = structuredClone(DEFAULT_CONVENTION_POLICY);
  weakDominance.capture.inference.dominance_ratio = 0.5;
  assert.ok(
    validateConventionPolicy(weakDominance).errors.some((error) =>
      error.includes('dominance_ratio'),
    ),
  );

  const workerWrites = structuredClone(DEFAULT_CONVENTION_POLICY);
  workerWrites.capture.ownership.shared_writes = 'any-worker';
  assert.ok(
    validateConventionPolicy(workerWrites).errors.some((error) =>
      error.includes('integration-owner-only'),
    ),
  );

  assert.ok(
    validateConventionPolicy(DEFAULT_CONVENTION_POLICY, {
      path: '.sdcorejs/conventions/repository/policy.yaml',
    }).errors.some((error) => error.includes(CONVENTION_POLICY_PATH)),
  );

  for (const status of systemRegistry.convention_rule_statuses) {
    assert.equal(
      DEFAULT_CONVENTION_POLICY.capture.enforcement[status],
      enforcementForStatus(status),
    );
  }
});

test('authoritative sources may be accepted while inferred patterns never are', () => {
  for (const kind of [
    'explicit-user-decision',
    'approved-specification',
    'approved-architecture',
    'approved-plan',
    'authoritative-repository-config',
    'public-external-contract',
  ]) {
    assert.equal(resolveCandidateStatus({ source_kind: kind }).status, 'accepted', kind);
  }

  const dominant = resolveCandidateStatus({
    source_kind: 'existing-code-observation',
    independent_evidence: 24,
    dominance_ratio: 0.96,
  });
  assert.equal(dominant.status, 'observed');
  assert.equal(dominant.enforcement, 'advisory');

  // Default threshold is three independent evidence items.
  assert.equal(
    resolveCandidateStatus({
      source_kind: 'existing-code-observation',
      independent_evidence: 2,
      dominance_ratio: 1,
    }).status,
    null,
  );
  assert.equal(
    resolveCandidateStatus({
      source_kind: 'existing-code-observation',
      independent_evidence: 3,
      dominance_ratio: 1,
    }).status,
    'observed',
  );

  // Eight against seven does not elect a convention.
  assert.equal(
    resolveCandidateStatus({
      source_kind: 'existing-code-observation',
      independent_evidence: 15,
      dominance_ratio: 8 / 15,
      competing_values: 2,
    }).status,
    'conflicted',
  );
  // Each guard is isolated so neither can be removed without a test noticing.
  // Weak dominance alone is enough to conflict...
  assert.equal(
    resolveCandidateStatus({
      source_kind: 'existing-code-observation',
      independent_evidence: 10,
      dominance_ratio: 0.7,
    }).status,
    'conflicted',
  );
  // ...and so is more than one competing value, even when one of them dominates.
  // A near-unanimous pattern that still has a live competitor is a disagreement
  // to resolve, not a rule to record.
  assert.equal(
    resolveCandidateStatus({
      source_kind: 'existing-code-observation',
      independent_evidence: 24,
      dominance_ratio: 0.96,
      competing_values: 2,
    }).status,
    'conflicted',
  );
});

test('precedence ranks sources and scopes, and refuses to enforce stale or conflicted rules', () => {
  const userDecision = rule({ source: { kind: 'explicit-user-decision', reference: 'chat' } });
  const spec = rule({ source: { kind: 'approved-specification', reference: '.sdcorejs/specs/a.md' } });
  const architecture = rule({ source: { kind: 'approved-architecture', reference: '.sdcorejs/architecture/a.md' } });
  const plan = rule({ source: { kind: 'approved-plan', reference: '.sdcorejs/plans/a.md' } });
  const observed = rule({
    rule: { status: 'observed', enforcement: 'advisory' },
    source: { kind: 'existing-code-observation', reference: 'src/' },
  });
  assert.ok(precedenceRank(userDecision) < precedenceRank(spec));
  assert.ok(precedenceRank(spec) < precedenceRank(architecture));
  assert.ok(precedenceRank(architecture) < precedenceRank(plan));
  assert.ok(precedenceRank(plan) < precedenceRank(observed));
  assert.ok(precedenceRank(spec) < precedenceRank(observed));
  assert.equal(
    precedenceRank(rule({ rule: { status: 'stale', enforcement: 'none' } })),
    null,
  );
  assert.equal(
    precedenceRank(rule({ rule: { status: 'conflicted', enforcement: 'none' } })),
    null,
  );

  const accepted = resolveEffectiveRules([userDecision, observed]);
  assert.equal(accepted.enforced.length, 1);
  assert.equal(accepted.enforced[0].rule.source.kind, 'explicit-user-decision');
  assert.deepEqual(accepted.unresolved, []);

  const staleOnly = resolveEffectiveRules([rule({ rule: { status: 'stale', enforcement: 'none' } })]);
  assert.deepEqual(staleOnly.enforced, []);
  assert.match(staleOnly.not_enforceable[0].reason, /evidence refresh/);

  assert.deepEqual(CONVENTION_PRECEDENCE[0], 'explicit-user-decision');
});

test('a module rule refines the repository rule only inside its own module', () => {
  const repositoryRule = rule({
    rule: { id: 'permissions.code.format', category: 'permissions', canonical: { value: 'dotted' } },
    scope: { kind: 'repository', module_id: null, boundary: 'permission' },
  });
  const moduleRule = rule({
    repository: { repository_id: MDM },
    rule: {
      id: 'permissions.code.format',
      category: 'permissions',
      canonical: { value: 'screaming-snake' },
    },
    scope: { kind: 'module', module_id: 'mdm', boundary: 'permission' },
  });

  const insideModule = resolveEffectiveRules([repositoryRule, moduleRule], { module_id: 'mdm' });
  assert.equal(insideModule.enforced.length, 1);
  assert.equal(insideModule.enforced[0].rule.scope.kind, 'module');

  const outsideModule = resolveEffectiveRules([repositoryRule, moduleRule], { module_id: 'crm' });
  assert.equal(outsideModule.enforced.length, 1);
  assert.equal(outsideModule.enforced[0].rule.scope.kind, 'repository');
});

test('portal-composition never overrides module-internal semantics', () => {
  const moduleRule = rule({
    repository: { repository_id: MDM },
    rule: { id: 'naming.entity.case', category: 'naming', canonical: { value: 'pascal' } },
    scope: { kind: 'module', module_id: 'mdm', boundary: 'internal' },
  });
  const portalRule = rule({
    rule: { id: 'naming.entity.case', category: 'naming', canonical: { value: 'camel' } },
    scope: { kind: 'portal-composition', module_id: null, boundary: 'internal' },
  });
  const resolved = resolveEffectiveRules([portalRule, moduleRule], { module_id: 'mdm' });
  assert.equal(resolved.enforced.length, 1);
  assert.equal(resolved.enforced[0].rule.scope.kind, 'module');
});

test('duplicate ids and equal-precedence disagreement fail closed', () => {
  const first = { ...rule(), artifact_path: 'a.yaml' };
  const second = { ...rule(), artifact_path: 'b.yaml' };
  const duplicates = resolveEffectiveRules([first, second]);
  assert.equal(duplicates.ok, false);
  assert.equal(duplicates.duplicates.length, 1);

  const singular = rule({
    rule: { id: 'api.resource-segment.singular', canonical: { value: 'singular' } },
  });
  const plural = rule({ rule: { id: 'api.resource-segment.plural', canonical: { value: 'plural' } } });
  const conflict = resolveEffectiveRules([singular, plural]);
  assert.equal(conflict.ok, false);
  assert.equal(conflict.unresolved[0].finding_kind, 'UNRESOLVED_CONVENTION');
  // Neither rule wins by file order or count.
  assert.deepEqual(conflict.enforced, []);
});

test('ownership resolves to the semantic owner and never falls back to the portal', () => {
  const moduleOwner = resolveConventionOwner({
    scope_kind: 'module',
    module_id: 'mdm',
    topology: TOPOLOGY,
  });
  assert.equal(moduleOwner.owner_repository_id, MDM);
  assert.equal(moduleOwner.portal_fallback_used, false);

  const unavailable = resolveConventionOwner({
    scope_kind: 'module',
    module_id: 'mdm',
    topology: {
      ...TOPOLOGY,
      modules: [{ module_id: 'mdm', repository_id: MDM, available: false }],
    },
  });
  assert.equal(unavailable.status, 'blocked');
  assert.equal(unavailable.owner_repository_id, null);
  assert.ok(unavailable.blockers.some((blocker) => blocker.includes('unavailable')));

  const unwritable = resolveConventionOwner({
    scope_kind: 'module',
    module_id: 'mdm',
    topology: {
      ...TOPOLOGY,
      modules: [{ module_id: 'mdm', repository_id: MDM, available: true, writable: false }],
    },
  });
  assert.equal(unwritable.status, 'blocked');
  assert.ok(unwritable.blockers.some((blocker) => blocker.includes('not writable')));

  assert.equal(
    resolveConventionOwner({ scope_kind: 'portal-composition', topology: TOPOLOGY })
      .owner_repository_id,
    PORTAL,
  );
});

test('write authority requires explicit approval or a committed after-review policy', () => {
  const noAuthority = resolveConventionWriteAuthority({
    action: 'conventions-sync-write-approved',
    policy_status: 'missing',
  });
  assert.equal(noAuthority.authorized, false);
  assert.equal(noAuthority.write_authority, 'none');

  const explicit = resolveConventionWriteAuthority({
    action: 'conventions-sync-write-approved',
    explicit_authority: true,
    policy_status: 'missing',
  });
  assert.equal(explicit.write_authority, 'explicit');

  const policyAuthorized = resolveConventionWriteAuthority({
    action: 'conventions-sync-write-approved',
    policy: DEFAULT_CONVENTION_POLICY,
    policy_status: 'valid',
  });
  assert.equal(policyAuthorized.authorized, true);
  assert.equal(policyAuthorized.write_authority, 'project-policy');

  const manual = structuredClone(DEFAULT_CONVENTION_POLICY);
  manual.capture.mode = 'manual';
  const manualMode = resolveConventionWriteAuthority({
    action: 'conventions-sync-write-approved',
    policy: manual,
    policy_status: 'valid',
  });
  assert.equal(manualMode.authorized, false);
  assert.ok(manualMode.blocked_reasons.some((reason) => reason.includes('manual capture mode')));

  const invalidPolicy = resolveConventionWriteAuthority({
    action: 'conventions-sync-write-approved',
    policy: DEFAULT_CONVENTION_POLICY,
    policy_status: 'invalid',
  });
  assert.equal(invalidPolicy.authorized, false);

  // Review is not a write action, whatever the policy says.
  assert.equal(
    resolveConventionWriteAuthority({
      action: 'conventions-read',
      policy: DEFAULT_CONVENTION_POLICY,
      policy_status: 'valid',
    }).authorized,
    false,
  );

  const worker = resolveConventionWriteAuthority({
    action: 'conventions-sync-write-approved',
    explicit_authority: true,
    worker_role: 'parallel-worker',
  });
  assert.equal(worker.authorized, false);
  assert.ok(worker.blocked_reasons.some((reason) => reason.includes('parallel workers')));

  // The role gate is an allowlist. A denylist would fail open: a misspelled or
  // unrecognized role would keep its write authority simply by not matching the
  // one role we thought to name.
  const authorizedFor = (role) =>
    resolveConventionWriteAuthority({
      action: 'conventions-sync-write-approved',
      explicit_authority: true,
      worker_role: role,
    }).authorized;
  for (const role of ['sequential-owner', 'integration-owner', 'fan-in-owner']) {
    assert.equal(authorizedFor(role), true, role);
  }
  for (const role of ['Parallel-Worker', 'paralel-worker', 'worker', 'whatever', '', null]) {
    assert.equal(authorizedFor(role), false, String(role));
  }
  // The default stays the sequential owner, so existing callers are unaffected.
  assert.equal(
    resolveConventionWriteAuthority({
      action: 'conventions-sync-write-approved',
      explicit_authority: true,
    }).authorized,
    true,
  );
});

test('sync writes to the owner, blocks a missing owner, and stays idempotent', () => {
  const moduleCandidate = rule({
    repository: { repository_id: MDM },
    rule: { id: 'permissions.code.format', category: 'permissions', canonical: { value: 'dotted' } },
    scope: { kind: 'module', module_id: 'mdm', boundary: 'permission' },
    evidence: [
      { path: 'src/mdm/permissions.ts', locator: 'PERMISSIONS', observed: 'mdm.product.list' },
    ],
  });

  const first = planConventionSync({
    candidates: [rule(), moduleCandidate],
    topology: TOPOLOGY,
    policy: DEFAULT_CONVENTION_POLICY,
    policy_status: 'valid',
  });
  assert.equal(first.status, 'synced');
  assert.equal(first.write_authority, 'project-policy');
  assert.equal(first.writes.length, 2);
  assert.deepEqual(
    first.writes.map(({ path }) => path).sort(),
    [
      '.sdcorejs/conventions/modules/mdm/permissions/permissions-code-format.yaml',
      '.sdcorejs/conventions/repository/api-routing/api-resource-segment-cardinality.yaml',
    ],
  );
  const moduleWrite = first.writes.find(({ module_id: moduleId }) => moduleId === 'mdm');
  assert.equal(moduleWrite.owner_repository_id, MDM);
  // artifact_context lists every file, not only the policy.
  assert.equal(first.artifact_context.shared_owned.length, 2);
  assert.ok(first.artifact_context.shared_owned.every(({ kind }) => kind === 'convention'));
  assert.deepEqual(first.artifact_context.required_with_change, []);

  const existingRules = first.writes.map((write) => ({
    ...write.document,
    artifact_path: write.path,
  }));
  const second = planConventionSync({
    candidates: [rule(), moduleCandidate],
    existing_rules: existingRules,
    topology: TOPOLOGY,
    policy: DEFAULT_CONVENTION_POLICY,
    policy_status: 'valid',
  });
  assert.deepEqual(second.writes, []);
  assert.equal(second.skipped.length, 2);
  assert.ok(second.skipped.every(({ reason }) => reason.includes('no semantic diff')));

  const blocked = planConventionSync({
    candidates: [moduleCandidate],
    topology: {
      ...TOPOLOGY,
      modules: [{ module_id: 'mdm', repository_id: MDM, available: false }],
    },
    policy: DEFAULT_CONVENTION_POLICY,
    policy_status: 'valid',
  });
  assert.equal(blocked.status, 'partial');
  assert.deepEqual(blocked.writes, []);
  // No portal fallback: the rule is skipped, not relocated.
  assert.equal(blocked.skipped[0].portal_fallback_used, false);
  assert.equal(blocked.artifact_context.shared_owned.length, 0);

  const unauthorized = planConventionSync({
    candidates: [rule()],
    topology: TOPOLOGY,
    policy_status: 'missing',
  });
  assert.equal(unauthorized.status, 'blocked');
  assert.deepEqual(unauthorized.writes, []);
});

test('merging preserves accepted status, exceptions, and deduplicated evidence', () => {
  const path = '.sdcorejs/conventions/repository/api-routing/api-resource-segment-cardinality.yaml';
  const existing = {
    ...rule({
      exceptions: [
        { scope: '/legacy/product', reason: 'External compatibility', migration_status: 'retained' },
      ],
    }),
    artifact_path: path,
  };
  // The observation disagrees with the accepted canonical on purpose: a sweep
  // that happened to see mostly singular routes must not be able to restate the
  // decision simply by running later.
  const laterObservation = rule({
    rule: {
      status: 'observed',
      enforcement: 'advisory',
      canonical: { value: 'singular', examples: ['/product'] },
    },
    source: { kind: 'existing-code-observation', reference: 'src/' },
    confidence: 'low',
    evidence: [
      { path: 'openapi.yaml', locator: 'paths./products', observed: '/products' },
      { path: 'src/order/order.controller.ts', locator: 'OrderController', observed: 'orders' },
    ],
  });

  const plan = planConventionSync({
    candidates: [laterObservation],
    existing_rules: [existing],
    topology: TOPOLOGY,
    policy: DEFAULT_CONVENTION_POLICY,
    policy_status: 'valid',
  });
  assert.equal(plan.writes.length, 1);
  const merged = plan.writes[0].document;
  // A later observation does not demote a decision that was already made, and it
  // does not get to restate what that decision was.
  assert.equal(merged.rule.status, 'accepted');
  assert.equal(merged.rule.enforcement, 'required');
  assert.deepEqual(merged.rule.canonical, { value: 'plural', examples: ['/products'] });
  assert.equal(merged.source.kind, 'authoritative-repository-config');
  assert.equal(merged.confidence, 'high');
  // Exceptions are institutional memory; a sync adds to them and never prunes.
  assert.equal(merged.exceptions.length, 1);
  assert.equal(merged.exceptions[0].scope, '/legacy/product');
  assert.equal(merged.evidence.length, 2);

  assert.deepEqual(
    normalizeEvidence([
      { path: 'b.ts', locator: 'B', observed: 'x' },
      { path: 'a.ts', locator: 'A', observed: 'y' },
      { path: 'a.ts', locator: 'A', observed: 'y' },
    ]).map(({ path: evidencePath }) => evidencePath),
    ['a.ts', 'b.ts'],
  );

  // Key order must not change the semantic identity of a document.
  assert.equal(
    conventionContentHash({ a: 1, b: { c: 2, d: 3 } }),
    conventionContentHash({ b: { d: 3, c: 2 }, a: 1 }),
  );
});

test('project-context projection stays compact and identifier-only', () => {
  const projection = projectConventionContext({
    policy_status: 'valid',
    policy_path: CONVENTION_POLICY_PATH,
    rules: [
      { ...rule(), artifact_path: 'a.yaml' },
      {
        ...rule({
          rule: { id: 'naming.property.case', status: 'observed', enforcement: 'advisory' },
        }),
        artifact_path: 'b.yaml',
      },
      {
        ...rule({ rule: { id: 'api.legacy.shape', status: 'stale', enforcement: 'none' } }),
        artifact_path: 'c.yaml',
      },
    ],
    invalid_paths: ['.sdcorejs/conventions/repository/bad.yaml'],
    unresolved_owner_repositories: [MDM],
  });
  assert.deepEqual(projection.accepted_rule_ids, ['api.resource-segment.cardinality']);
  assert.deepEqual(projection.observed_rule_ids, ['naming.property.case']);
  assert.deepEqual(projection.stale_rule_ids, ['api.legacy.shape']);
  assert.deepEqual(projection.unresolved_owner_repositories, [MDM]);
  // Identifiers and paths only; no rule bodies leak into every context.
  assert.deepEqual(
    Object.keys(projection).sort(),
    [
      'accepted_rule_ids',
      'conflicted_rule_ids',
      'deprecated_rule_ids',
      'invalid_paths',
      'loaded_paths',
      'observed_rule_ids',
      'policy_path',
      'policy_status',
      'stale_rule_ids',
      'unresolved_owner_repositories',
    ],
  );
  assert.equal(JSON.stringify(projection).includes('rationale'), false);

  assert.equal(projectConventionContext({}).policy_path, 'none');
});
