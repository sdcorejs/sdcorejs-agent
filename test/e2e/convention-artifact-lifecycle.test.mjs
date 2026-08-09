import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import {
  buildArtifactClosure,
  classifyArtifact,
  isLocalOnlyArtifactPath,
} from '../../_refs/shared/artifact-lifecycle.mjs';
import { resolveExploreWriteAuthority } from '../../_refs/shared/explore-contract.mjs';
import { collectConventionProjection } from '../../_refs/shared/project-context.mjs';
import { DEFAULT_CONVENTION_POLICY } from '../../_refs/shared/convention-contract.mjs';
import { CONVENTION_POLICY_PATH } from '../../_refs/shared/convention-paths.mjs';

const execFileAsync = promisify(execFile);

const CHANGE_REF = 'consistency-review-registry';
const RULE_PATH =
  '.sdcorejs/conventions/repository/api-routing/api-resource-segment-cardinality.yaml';
const MODULE_RULE_PATH =
  '.sdcorejs/conventions/modules/mdm/permissions/permissions-code-format.yaml';

const RULE_BODY = `schema_version: 1
artifact_id: convention-api-resource-cardinality
artifact_kind: convention
document_type: rule
change_ref: shared-project-conventions
source_spec: none
source_plan: none
commit_policy: conditional
owner: sdcorejs-explore
repository:
  repository_id: github.com/acme/product-service
scope:
  kind: repository
  module_id: null
  boundary: public-api
rule:
  id: api.resource-segment.cardinality
  category: api-routing
  concept_id: resource-collection-path
  semantic_role: collection-resource-path
  canonical:
    value: plural
    examples:
      - /products
  status: accepted
  enforcement: required
source:
  kind: authoritative-repository-config
  reference: openapi.yaml
confidence: high
rationale: Public REST resources use plural collection segments.
evidence:
  - path: openapi.yaml
    locator: paths./products
    observed: /products
freshness:
  repository_revision: unknown
  status: current
`;

const POLICY_BODY = `schema_version: 1
artifact_id: convention-policy
artifact_kind: convention
document_type: policy
change_ref: shared-project-conventions
source_spec: none
source_plan: none
commit_policy: conditional
owner: sdcorejs-explore
capture:
  mode: after-review
  persist:
    accepted_rules: true
    observed_candidates: true
    conflicts: true
    stale_updates: true
    deprecated_updates: true
  auto_accept:
    explicit_user_decisions: true
    approved_specs_and_plans: true
    authoritative_repository_config: true
    public_external_contracts: true
    inferred_patterns: false
  inference:
    minimum_independent_evidence: 3
    dominance_ratio: 0.8
  enforcement:
    accepted: required
    observed: advisory
    conflicted: none
    deprecated: compatibility-aware
    stale: none
  ownership:
    shared_writes: integration-owner-only
`;

const CONVENTION_METADATA = {
  artifact_id: 'convention-api-resource-cardinality',
  artifact_kind: 'convention',
  document_type: 'rule',
  change_ref: 'shared-project-conventions',
  commit_policy: 'conditional',
  owner: 'sdcorejs-explore',
};

async function createRepository(files) {
  const root = await mkdtemp(path.join(tmpdir(), 'sdcorejs-conventions-'));
  await execFileAsync('git', ['init', '--initial-branch=main'], { cwd: root });
  await execFileAsync('git', ['config', 'user.email', 'test@example.com'], { cwd: root });
  await execFileAsync('git', ['config', 'user.name', 'Test'], { cwd: root });
  for (const [relative, content] of Object.entries(files)) {
    const absolute = path.join(root, relative);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, content, 'utf8');
  }
  return root;
}

test('convention rules are shared durable artifacts that need a proven owner', () => {
  const unowned = classifyArtifact({
    path: RULE_PATH,
    metadata: CONVENTION_METADATA,
    changeRef: CHANGE_REF,
  });
  assert.equal(unowned.kind, 'convention');
  assert.equal(unowned.lifecycle, 'shared-durable');
  assert.equal(unowned.commit_policy, 'conditional');
  // Without a proven owner it is conditional, never automatically staged.
  assert.equal(unowned.bucket, 'conditional');

  const owned = classifyArtifact({
    path: RULE_PATH,
    metadata: CONVENTION_METADATA,
    changeRef: CHANGE_REF,
    owner: 'sdcorejs-explore',
  });
  assert.equal(owned.bucket, 'shared_owned');

  const explicitlyOwned = classifyArtifact({
    path: MODULE_RULE_PATH,
    metadata: { ...CONVENTION_METADATA, owner: 'integration-owner' },
    changeRef: CHANGE_REF,
    ownedSharedPaths: [MODULE_RULE_PATH],
  });
  assert.equal(explicitlyOwned.bucket, 'shared_owned');

  assert.equal(isLocalOnlyArtifactPath(RULE_PATH), false);
});

test('invalid convention paths and metadata contradictions fail closed', () => {
  const badDepth = classifyArtifact({
    path: '.sdcorejs/conventions/repository/api-resource-segment-cardinality.yaml',
    metadata: CONVENTION_METADATA,
    changeRef: CHANGE_REF,
    owner: 'sdcorejs-explore',
  });
  assert.equal(badDepth.bucket, 'unknown');
  assert.match(badDepth.reason, /INVALID_CONVENTION_PATH_DEPTH/);

  const badExtension = classifyArtifact({
    path: '.sdcorejs/conventions/repository/api-routing/rule.json',
    metadata: CONVENTION_METADATA,
    changeRef: CHANGE_REF,
    owner: 'sdcorejs-explore',
  });
  assert.equal(badExtension.bucket, 'unknown');
  assert.match(badExtension.reason, /UNSUPPORTED_CONVENTION_EXTENSION/);

  // A convention kind claimed outside the root is a metadata/path contradiction.
  const outsideRoot = classifyArtifact({
    path: '.sdcorejs/memories/general/api-naming.md',
    metadata: CONVENTION_METADATA,
    changeRef: CHANGE_REF,
    owner: 'sdcorejs-explore',
  });
  assert.equal(outsideRoot.bucket, 'unknown');
  assert.match(outsideRoot.reason, /OUTSIDE_CONVENTION_ROOT/);

  // A non-convention kind claimed inside the root is the same contradiction.
  const wrongKind = classifyArtifact({
    path: RULE_PATH,
    metadata: { ...CONVENTION_METADATA, artifact_kind: 'memory' },
    changeRef: CHANGE_REF,
    owner: 'sdcorejs-explore',
  });
  assert.equal(wrongKind.bucket, 'unknown');
  assert.match(wrongKind.reason, /non-convention kind/);

  const wrongDocumentType = classifyArtifact({
    path: RULE_PATH,
    metadata: { ...CONVENTION_METADATA, document_type: 'policy' },
    changeRef: CHANGE_REF,
    owner: 'sdcorejs-explore',
  });
  assert.equal(wrongDocumentType.bucket, 'unknown');
  assert.match(wrongDocumentType.reason, /contradicts its canonical path/);
});

test('a runtime context cannot promote a convention it does not own', () => {
  const runtimeClaim = classifyArtifact({
    path: RULE_PATH,
    metadata: CONVENTION_METADATA,
    changeRef: CHANGE_REF,
    runtimeBuckets: {
      required_with_change: [RULE_PATH],
      shared_owned: [],
      conditional: [],
      local_only: [],
      unrelated_observed: [],
      invalid_paths: [],
      entries: new Map(),
    },
  });
  // Shared ownership is not provable from a runtime bucket alone.
  assert.equal(runtimeClaim.bucket, 'conditional');
  assert.match(runtimeClaim.reason, /shared ownership is not proven/);
});

test('authorized convention artifacts participate in closure as shared_owned', async () => {
  const root = await createRepository({
    [RULE_PATH]: RULE_BODY,
    [CONVENTION_POLICY_PATH]: POLICY_BODY,
  });
  const closure = await buildArtifactClosure({
    root,
    changeRef: CHANGE_REF,
    owner: 'sdcorejs-explore',
    ownedSharedPaths: [RULE_PATH, CONVENTION_POLICY_PATH],
    artifactContext: {
      change_ref: CHANGE_REF,
      shared_owned: [
        { path: RULE_PATH, kind: 'convention', owner: 'sdcorejs-explore' },
        { path: CONVENTION_POLICY_PATH, kind: 'convention', owner: 'sdcorejs-explore' },
      ],
    },
  });
  const ledger = closure.sdcorejs_artifacts;
  assert.equal(ledger.closure_result, 'complete');
  assert.deepEqual(ledger.unknown_paths, []);
  assert.deepEqual(ledger.included_paths.sort(), [CONVENTION_POLICY_PATH, RULE_PATH].sort());
  assert.equal(ledger.staging_policy, 'explicit-paths-only');
  // Conventions are shared state, not change-scoped deliverables.
  assert.deepEqual(ledger.required_paths, []);
  assert.deepEqual(ledger.shared_owned_paths.sort(), [CONVENTION_POLICY_PATH, RULE_PATH].sort());
});

test('an unknown convention path blocks closure instead of being staged', async () => {
  const root = await createRepository({
    '.sdcorejs/conventions/repository/api-routing/Bad_Rule.yaml': RULE_BODY,
  });
  const closure = await buildArtifactClosure({
    root,
    changeRef: CHANGE_REF,
    owner: 'sdcorejs-explore',
  });
  const ledger = closure.sdcorejs_artifacts;
  assert.equal(ledger.closure_result, 'ambiguous');
  assert.equal(ledger.unknown_paths.length, 1);
  assert.equal(ledger.included_paths.length, 0);
  assert.ok(ledger.blockers.some((blocker) => blocker.includes('unknown artifact')));
});

test('a convention edit from another thread is not staged with this change', async () => {
  const root = await createRepository({ [RULE_PATH]: RULE_BODY });
  const closure = await buildArtifactClosure({
    root,
    changeRef: CHANGE_REF,
    owner: 'sdcorejs-product',
  });
  const ledger = closure.sdcorejs_artifacts;
  // A different current owner cannot prove ownership of shared state.
  assert.deepEqual(ledger.included_paths, []);
  assert.deepEqual(ledger.conditional_paths, [RULE_PATH]);
});

test('a secret in convention evidence blocks closure without printing it', async () => {
  const leaking = RULE_BODY.replace(
    '    observed: /products',
    '    observed: |\n      -----BEGIN PRIVATE KEY-----\n      MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcw\n',
  );
  const root = await createRepository({ [RULE_PATH]: leaking });
  const closure = await buildArtifactClosure({
    root,
    changeRef: CHANGE_REF,
    owner: 'sdcorejs-explore',
    ownedSharedPaths: [RULE_PATH],
  });
  const ledger = closure.sdcorejs_artifacts;
  assert.notEqual(ledger.closure_result, 'complete');
  assert.ok(ledger.blockers.some((blocker) => blocker.includes('secret or PII screening')));
  assert.equal(ledger.sensitive_paths[0].path, RULE_PATH);
  assert.ok(ledger.sensitive_paths[0].categories.includes('private-key'));
  // The ledger reports the category, never the value.
  assert.equal(JSON.stringify(ledger).includes('MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcw'), false);
});

test('explore write authority honors the capture policy and refuses parallel workers', () => {
  assert.equal(
    resolveExploreWriteAuthority({ action: 'conventions-read', explicit_authority: true })
      .write_allowed,
    false,
  );

  const policyAuthorized = resolveExploreWriteAuthority({
    action: 'conventions-sync-write-approved',
    convention_capture_mode: 'after-review',
  });
  assert.equal(policyAuthorized.write_allowed, true);
  assert.match(policyAuthorized.reason, /capture policy/);

  assert.equal(
    resolveExploreWriteAuthority({
      action: 'conventions-sync-write-approved',
      convention_capture_mode: 'manual',
    }).write_allowed,
    false,
  );
  assert.equal(
    resolveExploreWriteAuthority({
      action: 'conventions-sync-write-approved',
      convention_capture_mode: 'disabled',
    }).write_allowed,
    false,
  );
  assert.equal(
    resolveExploreWriteAuthority({
      action: 'conventions-sync-write-approved',
      explicit_authority: true,
    }).write_allowed,
    true,
  );

  // Standing policy authorization still stops at the worker boundary.
  const worker = resolveExploreWriteAuthority({
    action: 'conventions-sync-write-approved',
    convention_capture_mode: 'after-review',
    worker_role: 'parallel-worker',
  });
  assert.equal(worker.write_allowed, false);
  assert.match(worker.reason, /parallel workers/);

  // The capture mode never leaks into unrelated write actions.
  assert.equal(
    resolveExploreWriteAuthority({
      action: 'summary-refresh',
      convention_capture_mode: 'after-review',
    }).write_allowed,
    false,
  );
});

test('project context loads only relevant categories and marks invalid rules', async () => {
  const root = await createRepository({
    [CONVENTION_POLICY_PATH]: POLICY_BODY,
    [RULE_PATH]: RULE_BODY,
    '.sdcorejs/conventions/repository/naming/naming-property-case.yaml': RULE_BODY.replace(
      'id: api.resource-segment.cardinality',
      'id: naming.property.case',
    )
      .replace('category: api-routing', 'category: naming')
      .replace(
        'artifact_id: convention-api-resource-cardinality',
        'artifact_id: convention-naming-property-case',
      ),
    '.sdcorejs/conventions/repository/api-routing/api-broken-rule.yaml': 'not: [valid',
  });

  const everything = await collectConventionProjection(root);
  assert.equal(everything.policy_status, 'valid');
  assert.equal(everything.policy_path, CONVENTION_POLICY_PATH);
  assert.deepEqual(everything.invalid_paths, [
    '.sdcorejs/conventions/repository/api-routing/api-broken-rule.yaml',
  ]);
  assert.deepEqual(everything.accepted_rule_ids.sort(), [
    'api.resource-segment.cardinality',
    'naming.property.case',
  ]);

  const scoped = await collectConventionProjection(root, { categories: ['naming'] });
  assert.deepEqual(scoped.accepted_rule_ids, ['naming.property.case']);
  assert.deepEqual(scoped.loaded_paths, [
    '.sdcorejs/conventions/repository/naming/naming-property-case.yaml',
  ]);
  // The broken api-routing file is outside the requested category and is not read.
  assert.deepEqual(scoped.invalid_paths, []);

  const missing = await collectConventionProjection(await createRepository({}));
  assert.equal(missing.policy_status, 'missing');
  assert.equal(missing.policy_path, 'none');
  assert.deepEqual(missing.accepted_rule_ids, []);
});

test('an unreadable convention root is reported, not mistaken for an empty one', async () => {
  // A file where the directory should be makes the directory listing fail the
  // same way a permission error would. "No conventions exist" and "the
  // conventions could not be read" must not look identical to a caller: only one
  // of them is safe to review against.
  const root = await createRepository({ '.sdcorejs/conventions': 'not a directory' });
  const projection = await collectConventionProjection(root);
  assert.deepEqual(projection.invalid_paths, ['.sdcorejs/conventions']);
  assert.deepEqual(projection.accepted_rule_ids, []);
});

test('an invalid policy is reported rather than silently replaced by the default', async () => {
  const root = await createRepository({
    [CONVENTION_POLICY_PATH]: POLICY_BODY.replace(
      '    inferred_patterns: false',
      '    inferred_patterns: true',
    ),
  });
  const projection = await collectConventionProjection(root);
  assert.equal(projection.policy_status, 'invalid');
  // The default policy still refuses to auto-accept inferred patterns.
  assert.equal(DEFAULT_CONVENTION_POLICY.capture.auto_accept.inferred_patterns, false);
});
