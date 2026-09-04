import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { isMap, isScalar, isSeq, parseDocument } from 'yaml';
import * as runtimePolicy from '../../_refs/harness/runtime-policy.mjs';

const root = path.resolve(new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const baselineUrl = new URL('./fixtures/communication-economy-baseline.json', import.meta.url);
const scenarioFixtureUrl = new URL(
  './fixtures/communication-economy-scenarios.json',
  import.meta.url
);
const liveEvidenceUrl = new URL(
  './fixtures/communication-economy-live-ab.json',
  import.meta.url
);
const capabilityUrl = new URL('../../_refs/harness/capability-contract.json', import.meta.url);
const policyUrl = new URL('../../_refs/harness/communication-economy.md', import.meta.url);
const reportModuleUrl = new URL('../../scripts/measure-communication-economy.mjs', import.meta.url);
const repairLoopUrl = new URL('../../_refs/orchestration/tail/repair-loop.md', import.meta.url);
const systemRegistryUrl = new URL('../../_refs/shared/system-registry.json', import.meta.url);
const BASELINE_CONTEXT_SCHEMA_PATHS = {
  requirement_context: 'skills/shared/sdlc/01-brainstorming.md',
  spec_context: 'skills/shared/sdlc/02-spec.md',
  plan_context: 'skills/shared/sdlc/03-plan.md',
  execution_context: 'skills/shared/sdlc/04-execute-plan.md',
  test_context: '_refs/shared/test-context.md',
  test_status: '_refs/shared/test-context.md',
  test_evidence: '_refs/shared/test-context.md',
  review_context: 'skills/shared/workflow/review.md',
  debug_context: '_refs/shared/debug-context.md',
  simplify_context: '_refs/simplify/verification.md',
  ship_context: '_refs/orchestration/tail/ship-context.md',
  artifact_context: '_refs/shared/artifact-lifecycle.md',
  ui_capture_context: '_refs/shared/test-ui-evidence.md',
  explore_context: '_refs/shared/explore-context.md',
  ai_agent_context: 'skills/tracks/ai-agent/sdcorejs-ai-agent.md',
  parallel_context: '_refs/orchestration/parallel-protocol.md',
};

const REQUIRED_EXPORTS = [
  'CONSUMER_REQUIRED_FIELD_KINDS',
  'CONSUMER_REQUIRED_FIELDS',
  'auditRenderedProjection',
  'buildPortableHandoff',
  'measureRepeatedBlockBytes',
  'measureText',
  'projectRuntimeContext',
  'renderUserProjection',
  'resolveCommunicationProfile',
  'selectRelatedArtifacts',
  'shouldEmitProgress',
  'validateRequiredHandoffFields',
];

function requireFunction(name) {
  assert.equal(typeof runtimePolicy[name], 'function', `${name} is a deterministic runtime policy function`);
  return runtimePolicy[name];
}

function requireObject(name) {
  assert.ok(runtimePolicy[name] && typeof runtimePolicy[name] === 'object', `${name} is exported`);
  return runtimePolicy[name];
}

function setPath(target, dottedPath, value = `<${dottedPath}>`) {
  const parts = dottedPath.split('.');
  let cursor = target;
  for (const part of parts.slice(0, -1)) {
    cursor[part] ??= {};
    cursor = cursor[part];
  }
  cursor[parts.at(-1)] = value;
  return target;
}

function deletePath(target, dottedPath) {
  const parts = dottedPath.split('.');
  let cursor = target;
  for (const part of parts.slice(0, -1)) {
    if (!cursor || typeof cursor !== 'object') return;
    cursor = cursor[part];
  }
  if (cursor && typeof cursor === 'object') delete cursor[parts.at(-1)];
}

function getPath(target, dottedPath) {
  let cursor = target;
  for (const part of dottedPath.split('.')) {
    if (!cursor || typeof cursor !== 'object' || !Object.hasOwn(cursor, part)) return undefined;
    cursor = cursor[part];
  }
  return cursor;
}

function canonicalContextContract(sourceText, contextType, sourcePath) {
  const schema = extractHistoricalContextSchema(sourceText, contextType, sourcePath);
  const document = parseDocument(schema, { strict: true, uniqueKeys: true });
  assert.deepEqual(
    document.errors.map(({ message }) => message),
    [],
    `${sourcePath} ${contextType} must be valid YAML with unique keys`,
  );
  const rootNode = document.get(contextType, true);
  assert.ok(isMap(rootNode), `${sourcePath} ${contextType} must be a YAML object`);
  return {
    fieldKinds: collectSchemaFieldKinds(rootNode),
    schema,
  };
}

function collectSchemaFieldKinds(rootNode) {
  const fields = {};
  const visit = (node, dottedPath) => {
    if (dottedPath) fields[dottedPath] = schemaNodeKind(node);
    if (!isMap(node)) return;
    for (const pair of node.items) {
      const key = String(pair.key?.value ?? '');
      visit(pair.value, dottedPath ? `${dottedPath}.${key}` : key);
    }
  };
  visit(rootNode, '');
  return fields;
}

function schemaNodeKind(node) {
  if (isMap(node)) return 'object';
  if (isSeq(node)) return 'array';
  if (!isScalar(node)) return 'unknown';
  if (node.value === null) return 'nullable-scalar';
  if (typeof node.value === 'number') return 'number';
  if (typeof node.value === 'boolean') return 'boolean';
  const value = String(node.value).trim();
  if (/^<number>$/iu.test(value)) return 'number';
  if (/^(?:true\s*\|\s*false|false\s*\|\s*true)$/iu.test(value)) return 'boolean';
  return 'scalar';
}

function fieldKindsAreCompatible(expected, actual) {
  if (expected === 'scalar') {
    return ['scalar', 'number', 'boolean', 'nullable-scalar'].includes(actual);
  }
  if (expected === 'nullable-scalar') {
    return ['nullable-scalar', 'scalar', 'number', 'boolean'].includes(actual);
  }
  if (expected === 'reference-or-object') {
    return actual === 'scalar' || actual === 'object';
  }
  if (expected === 'nullable-object') {
    return actual === 'nullable-scalar' || actual === 'object';
  }
  return expected === actual;
}

function consumerProducerParityErrors(contextType, fieldKinds) {
  const consumers = runtimePolicy.CONSUMER_REQUIRED_FIELDS[contextType] ?? {};
  const kindMatrix = runtimePolicy.CONSUMER_REQUIRED_FIELD_KINDS;
  const demandedFields = new Set(Object.values(consumers).flat());
  const errors = [];

  for (const [consumer, fields] of Object.entries(consumers)) {
    for (const field of fields) {
      const actualKind = fieldKinds[field];
      if (!actualKind) {
        errors.push(`${contextType} -> ${consumer} demands absent producer field ${field}`);
        continue;
      }
      const expectedKind = kindMatrix[contextType]?.[field] ?? 'scalar';
      if (!fieldKindsAreCompatible(expectedKind, actualKind)) {
        errors.push(
          `${contextType}.${field} is ${actualKind} in its producer but ${consumer} demands ${expectedKind}`,
        );
      }
    }
  }

  for (const field of Object.keys(kindMatrix[contextType] ?? {})) {
    if (!demandedFields.has(field)) {
      errors.push(`${contextType}.${field} has a stale kind without a current consumer`);
    }
    if (!Object.hasOwn(fieldKinds, field)) {
      errors.push(`${contextType}.${field} kind has no canonical producer field`);
    }
  }
  return errors;
}

function repairSourceDimensions(sourceText) {
  const value = sourceText.match(/^\s*dimension:\s*(.+)$/mu)?.[1];
  assert.ok(value, 'repair_source declares its review dimension enum');
  return value.split('|').map((item) => item.trim());
}

function assertRepairSourceDimensionParity(sourceText, expected) {
  assert.deepEqual(repairSourceDimensions(sourceText), expected);
}

function contextFor(contextType, consumer) {
  const matrix = requireObject('CONSUMER_REQUIRED_FIELDS');
  const context = {};
  for (const field of matrix[contextType][consumer]) {
    setPath(context, field, requiredFieldValue(contextType, field));
  }
  return context;
}

function requiredFieldValue(contextType, field) {
  const kind = runtimePolicy.CONSUMER_REQUIRED_FIELD_KINDS[contextType]?.[field] ?? 'scalar';
  if (field === 'schema_version') return 2;
  if (field === 'approval') {
    return {
      approved: true,
      approved_at: '2026-07-28T00:00:00.000Z',
      approval_source: 'explicit-user-choice',
    };
  }
  if (contextType === 'test_status') {
    const values = {
      planning: 'approved',
      authoring: 'existing',
      executability: 'ready',
      execution: 'executed',
      result: 'pass',
      evidence: 'current',
      documentation: 'verified',
      blockers: [],
    };
    return values[field];
  }
  if (contextType === 'test_evidence') {
    if (field.startsWith('status.')) {
      return requiredFieldValue('test_status', field.split('.').at(-1));
    }
    if (field === 'runs') {
      return [{
        run_id: 'run-fixture',
        command: 'node --test',
        cwd: 'C:/repo',
        exit_code: 0,
        output_digest: 'sha256:test-output',
        redactions_applied: true,
        stale: false,
        interrupted: false,
      }];
    }
    if (['cases', 'acknowledgements', 'captures', 'commands_skipped', 'blockers', 'residual_risks'].includes(field)) {
      return [];
    }
    if (field === 'data_lifecycle') {
      return {
        setup_status: 'not-applicable',
        cleanup_status: 'not-applicable',
        residual_data_risk: 'none',
      };
    }
    if (field === 'redactions_applied') return true;
  }
  if (contextType === 'parallel_context') {
    const values = {
      source: 'sdcorejs-parallel-dispatch',
      contract: {
        source: 'approved-plan',
        contract_id: 'contract-fixture',
        approved_plan_path: '.sdcorejs/plans/workflow/contract-fixture.md',
        approved_plan_hash: 'sha256:plan-fixture',
        frozen_contract_path: '.sdcorejs/plans/workflow/contract-fixture.md',
        frozen_contract_hash: 'sha256:contract-fixture',
        revision: 1,
        supersedes: null,
      },
      target: {
        repo_root: 'C:/repo',
        target_root: 'C:/repo',
        target_root_kind: 'repository',
        track: 'shared',
        stack_profile: 'node',
      },
      working_tree: {
        repo_root: 'C:/repo',
        current_branch: 'main',
        current_head: 'ec6afdb4e2494416d985be610837e728a9278a2f',
        expected_branch: 'main',
        expected_head: 'ec6afdb4e2494416d985be610837e728a9278a2f',
        status_snapshot_hash: 'sha256:status-fixture',
        dirty_diff_hash: 'sha256:diff-fixture',
        staged_paths: [],
        unstaged_paths: [],
        untracked_paths: [],
        unrelated_dirty_paths: [],
        intended_output_paths: ['test/**'],
        user_dirty_tree_decision: null,
      },
      runtime_capabilities: {
        runtime: 'portable-fixture',
        supports_subagents: true,
        supports_parallel_dispatch: true,
        supports_agent_cwd: true,
        supports_native_worktree: true,
        supports_result_ref: true,
        supports_timeout: true,
        supports_cancellation: true,
        effective_max_concurrency: 2,
      },
      topology: {
        kind: 'INDEPENDENT_WRITE_UNITS',
        verdict: 'PARALLEL-CANDIDATE',
      },
      integration: {
        workspace_path: 'C:/repo',
        branch: 'main',
        base_head: 'ec6afdb4e2494416d985be610837e728a9278a2f',
        merge_strategy: 'cherry-pick',
        merge_order: ['unit-fixture'],
        atomicity: 'all-or-nothing',
        rollback_strategy: 'remove run-owned commits from the integration branch',
      },
      units: [{
        id: 'unit-fixture',
        role: 'test-worker',
        wave: 1,
        depends_on: [],
        produces: ['test-result'],
        consumes: ['approved-plan'],
        contract_hash: 'sha256:contract-fixture',
        dispatch_envelope: {
          schema_version: 1,
          source: 'approved-plan',
          contract_id: 'contract-fixture',
          plan_artifact_id: 'plan-fixture-r1',
          plan_approval_hash: 'sha256:plan-fixture',
          repository_id: 'github.com/sdcorejs/fixture',
          repository_role: 'module',
          module_id: 'fixture',
          git_root: 'C:/repo-unit-fixture',
          source_revision: 'ec6afdb4e2494416d985be610837e728a9278a2f',
          allowed_paths: ['test/**'],
          prohibited_paths: ['package-lock.json'],
          authority: 'read-write',
          git_mutations: 'deny',
          approved_artifact_mutation: 'deny',
          required_validations: [
            'path-boundary',
            'stage-a',
            'stage-b',
            'unit-verification',
          ],
          output_evidence_contract: {
            result_type: 'commit',
            required_fields: [
              'repository_id',
              'repository_role',
              'module_id',
              'source_revision',
              'associated_head_or_diff',
              'output_digest',
            ],
          },
        },
        workspace: {
          strategy: 'worktree',
          path: 'C:/repo-unit-fixture',
          branch: 'agent/unit-fixture',
          base_head: 'ec6afdb4e2494416d985be610837e728a9278a2f',
          created_by_current_run: true,
          mechanically_disjoint: false,
        },
        ownership: {
          allowed_paths: ['test/**'],
          prohibited_paths: ['package-lock.json'],
          shared_files: [],
          exclusive_resources: [],
          shared_readonly_resources: [],
          allocated_ports: [],
          database_namespace: null,
          temp_root: 'C:/temp/unit-fixture',
          cache_root: 'C:/temp/unit-fixture/cache',
          coverage_root: 'C:/temp/unit-fixture/coverage',
        },
        task: {
          exact_scope: 'Add deterministic communication tests.',
          approved_plan_slice: 'Task 6.1',
          out_of_scope: [],
        },
        verification: {
          command: 'node --test test/e2e/communication-economy.test.mjs',
          cwd: 'C:/repo-unit-fixture',
          timeout_seconds: 120,
          expected_artifacts: [],
        },
        result: {
          type: 'commit',
          ref: 'commit:unit-fixture',
          base_head: 'ec6afdb4e2494416d985be610837e728a9278a2f',
          descends_from_base: true,
          associated_head_or_diff: 'sha256:unit-fixture',
          changed_paths: ['test/communication-economy.test.mjs'],
          exit_code: 0,
          output_digest: 'sha256:unit-output',
          blockers: [],
          repository_id: 'github.com/sdcorejs/fixture',
          repository_role: 'module',
          module_id: 'fixture',
          source_revision: 'ec6afdb4e2494416d985be610837e728a9278a2f',
        },
        status: 'PASSED',
        attempts: 1,
      }],
      failure_policy: {
        mode: 'fail-fast',
        max_attempts: 1,
        timeout_seconds: 120,
        cancel_pending_on_blocker: true,
        merge_successful_units_on_partial_failure: false,
        retry_transient_failures: false,
        rollback_on_global_failure: true,
        checkpoint_path: null,
      },
      redaction: {
        excluded_paths: ['.env'],
        excluded_patterns: ['token'],
        secret_scan: true,
        pii_redacted: true,
        logs_sanitized: true,
        notes: 'Fixture contains no secrets.',
      },
      global_verification: {
        commands_planned: ['npm run test:e2e:communication-economy'],
        commands_skipped: [],
        associated_head_or_diff: 'sha256:integrated-fixture',
        output_digest: 'sha256:global-output',
      },
      final_tail: {
        verify_before_done: true,
        branch_ready_final_gate: true,
        no_writes_after_branch_ready: true,
      },
    };
    if (Object.hasOwn(values, field)) return structuredClone(values[field]);
  }
  if (kind === 'nullable-object') return null;
  if (kind === 'array') return [`<${field}>`];
  if (kind === 'object') return { fixture_value: `<${field}>` };
  if (kind === 'number') return 1;
  if (kind === 'boolean') return true;
  return `<${field}>`;
}

test('Communication Economy Policy is a JIT public contract with deterministic helpers', async () => {
  for (const name of REQUIRED_EXPORTS) {
    if (name === 'CONSUMER_REQUIRED_FIELDS' || name === 'CONSUMER_REQUIRED_FIELD_KINDS') {
      requireObject(name);
    }
    else requireFunction(name);
  }

  const prose = await readFile(policyUrl, 'utf8').catch(() => '');
  assert.match(prose, /^# Communication Economy Policy/m);
  assert.match(prose, /minimal sufficient communication/i);
  assert.match(prose, /compact[\s\S]*standard[\s\S]*detailed/i);
  assert.match(prose, /authoritative runtime context/i);
  assert.match(prose, /user projection/i);
  assert.match(prose, /portable handoff/i);
  assert.match(prose, /^## Contents$/m);
  for (const section of [
    'Invariants',
    'Response Profiles',
    'Artifact Boundary',
    'Runtime Envelope',
    'Progress Events',
    'Related Artifact Selection',
    'Final Projection',
    'Deterministic Contract',
  ]) {
    assert.match(prose, new RegExp(`\\[${section}\\]\\(#[^)]+\\)`));
  }
  assert.doesNotMatch(prose, /\bsdcorejs-caveman\b|\bCaveman (?:Policy|contract|skill)\b/i);
});

test('profile resolution honors explicit requests and mandatory clarity escalation', () => {
  const resolve = requireFunction('resolveCommunicationProfile');

  assert.equal(resolve({}).profile, 'compact');
  assert.equal(resolve({ message_kind: 'routine-progress' }).profile, 'compact');
  assert.equal(resolve({ message_kind: 'review-findings' }).profile, 'standard');
  assert.equal(resolve({ explicit_profile: 'standard', message_kind: 'routine-progress' }).profile, 'standard');
  assert.equal(resolve({ explicit_profile: 'detailed', message_kind: 'routine-progress' }).profile, 'detailed');

  for (const message_kind of [
    'spec-approval',
    'plan-approval',
    'security-warning',
    'destructive-action',
    'ambiguous-high-impact-decision',
    'order-sensitive-instruction',
    'migration-decision',
    'public-contract-decision',
    'verification-failure',
    'conflicting-evidence',
    'unresolved-blocker',
  ]) {
    assert.equal(resolve({ explicit_profile: 'compact', message_kind }).profile, 'detailed', message_kind);
  }

  const full = resolve({ explicit_profile: 'full-context', message_kind: 'direct-answer' });
  assert.equal(full.profile, 'detailed');
  assert.equal(full.full_context, true);
});

test('progress is event-driven and does not duplicate a final response', () => {
  const shouldEmit = requireFunction('shouldEmitProgress');
  for (const event of [
    'work-started',
    'meaningful-outcome',
    'scope-changed',
    'blocker',
    'verification-completed',
    'verification-failed',
    'decision-required',
    'status-requested',
  ]) {
    assert.equal(shouldEmit({ event, state_changed: true }).emit, true, event);
  }

  for (const event of ['file-read', 'ordinary-tool-call', 'command-transition', 'pre-final-summary']) {
    assert.equal(shouldEmit({ event, state_changed: false }).emit, false, event);
  }

  const trackerClose = shouldEmit({
    event: 'tracker-close',
    state_changed: true,
    final_response_imminent: true,
  });
  assert.equal(trackerClose.emit, true);
  assert.equal(trackerClose.user_visible, false);

  const finalVerification = shouldEmit({
    event: 'verification-completed',
    state_changed: true,
    final_response_imminent: true,
  });
  assert.equal(finalVerification.emit, true);
  assert.equal(finalVerification.user_visible, false);

  const failed = shouldEmit({ event: 'verification-failed', state_changed: true });
  assert.equal(failed.profile, 'detailed');

  const heartbeat = shouldEmit({
    event: 'heartbeat',
    host_heartbeat_required: true,
    long_running: true,
  });
  assert.equal(heartbeat.emit, true);
  assert.equal(heartbeat.profile, 'compact');
});

test('canonical context producers stay structurally aligned with portable consumer contracts', async () => {
  const matrix = requireObject('CONSUMER_REQUIRED_FIELDS');
  requireObject('CONSUMER_REQUIRED_FIELD_KINDS');
  assert.deepEqual(
    Object.keys(BASELINE_CONTEXT_SCHEMA_PATHS).sort(),
    Object.keys(matrix).sort(),
    'every portable context has exactly one canonical producer schema source',
  );

  const parityErrors = [];
  for (const [contextType, consumers] of Object.entries(matrix)) {
    const sourcePath = BASELINE_CONTEXT_SCHEMA_PATHS[contextType];
    const sourceText = await readFile(path.join(root, sourcePath), 'utf8');
    const { fieldKinds } = canonicalContextContract(sourceText, contextType, sourcePath);
    parityErrors.push(...consumerProducerParityErrors(contextType, fieldKinds));
  }

  const requirementFields = matrix.requirement_context['sdcorejs-spec'];
  if (requirementFields.includes('out_of_scope')) {
    parityErrors.push('requirement_context current consumer demands legacy alias out_of_scope');
  }
  if (!requirementFields.includes('non_goals')) {
    parityErrors.push('requirement_context current consumer does not demand canonical non_goals');
  }

  assert.deepEqual(parityErrors, []);
});

test('canonical context schema parity guards fail under structural mutations', async () => {
  const requirementPath = BASELINE_CONTEXT_SCHEMA_PATHS.requirement_context;
  const requirementText = await readFile(path.join(root, requirementPath), 'utf8');
  const duplicateKeyMutation = requirementText.replace(
    /^  non_goals:$/mu,
    '  in_scope: []\n  non_goals:',
  );
  assert.throws(
    () => canonicalContextContract(
      duplicateKeyMutation,
      'requirement_context',
      requirementPath,
    ),
    /unique keys|Map keys must be unique/iu,
  );

  const canonical = canonicalContextContract(
    requirementText,
    'requirement_context',
    requirementPath,
  );
  const missingFieldKinds = { ...canonical.fieldKinds };
  delete missingFieldKinds.non_goals;
  assert.match(
    consumerProducerParityErrors('requirement_context', missingFieldKinds).join('\n'),
    /absent producer field non_goals/iu,
  );

  const planPath = BASELINE_CONTEXT_SCHEMA_PATHS.plan_context;
  const planText = await readFile(path.join(root, planPath), 'utf8');
  const mutatedPlan = canonicalContextContract(planText, 'plan_context', planPath);
  mutatedPlan.fieldKinds.parallel_candidates = 'array';
  assert.equal(mutatedPlan.fieldKinds.parallel_candidates, 'array');
  assert.match(
    consumerProducerParityErrors('plan_context', mutatedPlan.fieldKinds).join('\n'),
    /parallel_candidates.*array.*demands object/iu,
  );
});

test('repair source dimensions stay in exact parity with the central review registry', async () => {
  const [registry, repairSource] = await Promise.all([
    readFile(systemRegistryUrl, 'utf8').then(JSON.parse),
    readFile(repairLoopUrl, 'utf8'),
  ]);
  const expected = registry.review_dimensions.map(({ id }) => id);
  assertRepairSourceDimensionParity(repairSource, expected);

  const mutated = repairSource.replace(' | consistency', '');
  assert.throws(
    () => assertRepairSourceDimensionParity(mutated, expected),
    /strictly deep-equal/iu,
  );
});

test('consumer field matrix fails closed for every typed runtime context', () => {
  const matrix = requireObject('CONSUMER_REQUIRED_FIELDS');
  const validate = requireFunction('validateRequiredHandoffFields');
  assert.deepEqual(Object.keys(matrix).sort(), [
    'ai_agent_context',
    'artifact_context',
    'debug_context',
    'execution_context',
    'explore_context',
    'parallel_context',
    'plan_context',
    'requirement_context',
    'review_context',
    'ship_context',
    'simplify_context',
    'spec_context',
    'test_context',
    'test_evidence',
    'test_status',
    'ui_capture_context',
  ]);

  assert.ok(matrix.test_status['sdcorejs-documentation']);
  assert.ok(matrix.test_evidence['sdcorejs-documentation']);
  assert.ok(matrix.parallel_context['sdcorejs-ship']);

  for (const [contextType, consumers] of Object.entries(matrix)) {
    for (const [consumer, fields] of Object.entries(consumers)) {
      assert.ok(fields.length > 0, `${contextType} -> ${consumer} declares required fields`);
      const complete = contextFor(contextType, consumer);
      assert.deepEqual(validate({ contextType, consumer, context: complete }), []);

      const incomplete = structuredClone(complete);
      deletePath(incomplete, fields[0]);
      assert.match(
        validate({ contextType, consumer, context: incomplete }).join('\n'),
        new RegExp(fields[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
        `${contextType} -> ${consumer} rejects missing ${fields[0]}`
      );
    }
  }

  const invalidPlan = contextFor('plan_context', 'sdcorejs-execute-plan');
  invalidPlan.approved_plan_path = '';
  invalidPlan.approved_plan_hash = [];
  invalidPlan.allowed_paths = [];
  invalidPlan.approval = { approved: false, approved_at: null };
  const invalidPlanErrors = validate({
    contextType: 'plan_context',
    consumer: 'sdcorejs-execute-plan',
    context: invalidPlan,
  }).join('\n');
  assert.match(invalidPlanErrors, /approved_plan_path/);
  assert.match(invalidPlanErrors, /approved_plan_hash/);
  assert.match(invalidPlanErrors, /allowed_paths/);
  assert.match(invalidPlanErrors, /approval/);

  const verifiedCapture = contextFor('ui_capture_context', 'sdcorejs-documentation');
  verifiedCapture.blocker = null;
  assert.deepEqual(validate({
    contextType: 'ui_capture_context',
    consumer: 'sdcorejs-documentation',
    context: verifiedCapture,
  }), []);

  for (const [contextType, consumer, missingField] of [
    ['test_status', 'sdcorejs-ship', 'blockers'],
    ['test_evidence', 'sdcorejs-ship', 'runs'],
    ['test_evidence', 'sdcorejs-ship', 'blockers'],
  ]) {
    const incomplete = contextFor(contextType, consumer);
    deletePath(incomplete, missingField);
    assert.doesNotThrow(
      () => validate({ contextType, consumer, context: incomplete }),
      `${contextType} validation must return contract errors instead of a raw TypeError`
    );
    assert.match(
      validate({ contextType, consumer, context: incomplete }).join('\n'),
      new RegExp(missingField)
    );
    assert.throws(
      () => requireFunction('buildPortableHandoff')({
        contextType,
        consumer,
        context: incomplete,
      }),
      (error) => error?.code === 'ERR_INCOMPLETE_PORTABLE_HANDOFF'
    );
  }

  const malformedEvidence = contextFor('test_evidence', 'sdcorejs-ship');
  malformedEvidence.runs = [{}];
  malformedEvidence.data_lifecycle = { x: true };
  const malformedEvidenceErrors = validate({
    contextType: 'test_evidence',
    consumer: 'sdcorejs-ship',
    context: malformedEvidence,
  }).join('\n');
  assert.match(malformedEvidenceErrors, /runs\[0\]\.command/);
  assert.match(malformedEvidenceErrors, /data_lifecycle\.setup_status/);
  assert.throws(
    () => requireFunction('buildPortableHandoff')({
      contextType: 'test_evidence',
      consumer: 'sdcorejs-ship',
      context: malformedEvidence,
    }),
    (error) => error?.code === 'ERR_INCOMPLETE_PORTABLE_HANDOFF'
  );

  const stalePassingEvidence = contextFor('test_evidence', 'sdcorejs-ship');
  stalePassingEvidence.runs[0].stale = true;
  stalePassingEvidence.runs[0].exit_code = 1;
  assert.match(
    validate({
      contextType: 'test_evidence',
      consumer: 'sdcorejs-ship',
      context: stalePassingEvidence,
    }).join('\n'),
    /runs\[0\][\s\S]*(?:exit_code|stale)/
  );

  const malformedParallel = contextFor('parallel_context', 'sdcorejs-ship');
  for (const field of [
    'contract',
    'working_tree',
    'runtime_capabilities',
    'global_verification',
    'final_tail',
  ]) {
    malformedParallel[field] = { x: true };
  }
  malformedParallel.units = [{}];
  const malformedParallelErrors = validate({
    contextType: 'parallel_context',
    consumer: 'sdcorejs-ship',
    context: malformedParallel,
  }).join('\n');
  assert.match(malformedParallelErrors, /contract\.source/);
  assert.match(malformedParallelErrors, /working_tree\.current_head/);
  assert.match(malformedParallelErrors, /units\[0\]\.id/);
  assert.match(malformedParallelErrors, /global_verification\.associated_head_or_diff/);
  assert.match(malformedParallelErrors, /final_tail\.verify_before_done/);
  assert.throws(
    () => requireFunction('buildPortableHandoff')({
      contextType: 'parallel_context',
      consumer: 'sdcorejs-ship',
      context: malformedParallel,
    }),
    (error) => error?.code === 'ERR_INCOMPLETE_PORTABLE_HANDOFF'
  );
});

test('portable handoff preserves every required field for every supported context', () => {
  const matrix = requireObject('CONSUMER_REQUIRED_FIELDS');
  const build = requireFunction('buildPortableHandoff');

  for (const [contextType, consumers] of Object.entries(matrix)) {
    for (const [consumer, fields] of Object.entries(consumers)) {
      const context = contextFor(contextType, consumer);
      const handoff = build({ contextType, consumer, context });
      for (const field of fields) {
        assert.deepEqual(
          getPath(handoff.authoritative, field),
          getPath(context, field),
          `${contextType} -> ${consumer} preserves ${field}`,
        );

        const mutation = structuredClone(context);
        deletePath(mutation, field);
        assert.throws(
          () => build({ contextType, consumer, context: mutation }),
          (error) => error?.code === 'ERR_INCOMPLETE_PORTABLE_HANDOFF',
          `${contextType} -> ${consumer} rejects loss of ${field}`,
        );
      }
    }
  }
});

test('portable test evidence preserves manual acknowledgements for every consumer', () => {
  const matrix = requireObject('CONSUMER_REQUIRED_FIELDS');
  const build = requireFunction('buildPortableHandoff');
  const acknowledgements = [{
    case_id: 'case-manual-uat',
    acknowledged_by: 'product-owner',
    associated_HEAD_or_diff: 'sha256:current-diff',
  }];

  for (const consumer of Object.keys(matrix.test_evidence)) {
    const context = contextFor('test_evidence', consumer);
    context.acknowledgements = acknowledgements;
    const handoff = build({ contextType: 'test_evidence', consumer, context });
    assert.deepEqual(
      handoff.authoritative.acknowledgements,
      acknowledgements,
      `test_evidence -> ${consumer} preserves acknowledgements`,
    );
  }
});

test('requirement context accepts the legacy scope alias only at input and emits non_goals', () => {
  const fields = requireObject('CONSUMER_REQUIRED_FIELDS')
    .requirement_context['sdcorejs-spec'];
  assert.ok(fields.includes('non_goals'));
  assert.ok(!fields.includes('out_of_scope'));

  const canonical = contextFor('requirement_context', 'sdcorejs-spec');
  canonical.non_goals = ['No release automation.'];
  assert.deepEqual(runtimePolicy.validateRequiredHandoffFields({
    contextType: 'requirement_context',
    consumer: 'sdcorejs-spec',
    context: canonical,
  }), []);

  const legacyInput = structuredClone(canonical);
  legacyInput.out_of_scope = legacyInput.non_goals;
  delete legacyInput.non_goals;
  const handoff = runtimePolicy.buildPortableHandoff({
    contextType: 'requirement_context',
    consumer: 'sdcorejs-spec',
    context: legacyInput,
  });
  assert.deepEqual(handoff.authoritative.non_goals, ['No release automation.']);
  assert.equal(Object.hasOwn(handoff.authoritative, 'out_of_scope'), false);

  assert.throws(
    () => runtimePolicy.buildPortableHandoff({
      contextType: 'requirement_context',
      consumer: 'sdcorejs-spec',
      context: {
        ...canonical,
        out_of_scope: ['A conflicting legacy value.'],
      },
    }),
    /conflicting legacy alias/iu,
  );
});

test('portable compatibility preserves test lifecycle, test evidence, and parallel fan-in state', () => {
  const build = requireFunction('buildPortableHandoff');

  const testStatus = contextFor('test_status', 'sdcorejs-documentation');
  testStatus.execution = 'executed';
  testStatus.result = 'pass';
  testStatus.evidence = 'current';
  testStatus.documentation = 'pending';
  testStatus.blockers = [];
  const statusHandoff = build({
    contextType: 'test_status',
    context: testStatus,
    consumer: 'sdcorejs-documentation',
  });
  assert.deepEqual(statusHandoff.authoritative, testStatus);

  const testEvidence = contextFor('test_evidence', 'sdcorejs-documentation');
  testEvidence.schema_version = 2;
  testEvidence.associated_HEAD_or_diff = 'sha256:current-diff';
  testEvidence.status = {
    ...testEvidence.status,
    execution: 'executed',
    result: 'pass',
    evidence: 'current',
    documentation: 'pending',
  };
  testEvidence.captures = [{
    capture_id: 'capture-17',
    file_hash: 'sha256:capture',
    pii_screening: 'pass',
  }];
  testEvidence.blockers = [];
  testEvidence.redactions_applied = true;
  const evidenceHandoff = build({
    contextType: 'test_evidence',
    context: testEvidence,
    consumer: 'sdcorejs-documentation',
  });
  assert.deepEqual(evidenceHandoff.authoritative, testEvidence);

  const parallel = contextFor('parallel_context', 'sdcorejs-ship');
  parallel.schema_version = 2;
  parallel.contract = {
    ...parallel.contract,
    source: 'approved-plan',
    contract_id: 'contract-17',
    approved_plan_path: '.sdcorejs/plans/workflow/contract-17.md',
    approved_plan_hash: 'sha256:plan',
  };
  parallel.working_tree = {
    ...parallel.working_tree,
    current_head: 'ec6afdb4e2494416d985be610837e728a9278a2f',
    dirty_diff_hash: 'sha256:diff',
  };
  parallel.integration = {
    ...parallel.integration,
    merge_order: ['unit-test'],
    atomicity: 'all-or-nothing',
    rollback_strategy: 'restore run-owned result refs only',
  };
  parallel.units = [{
    ...parallel.units[0],
    id: 'unit-test',
    dispatch_envelope: {
      ...parallel.units[0].dispatch_envelope,
      contract_id: 'contract-17',
      plan_approval_hash: 'sha256:plan',
      allowed_paths: ['test/**'],
      prohibited_paths: ['package-lock.json'],
    },
    ownership: {
      ...parallel.units[0].ownership,
      allowed_paths: ['test/**'],
      prohibited_paths: ['package-lock.json'],
    },
    result: {
      ...parallel.units[0].result,
      ref: 'commit:unit-test',
      associated_head_or_diff: 'sha256:unit-result',
      changed_paths: ['test/orders.spec.ts'],
      exit_code: 0,
    },
    status: 'PASSED',
  }];
  parallel.global_verification = {
    ...parallel.global_verification,
    associated_head_or_diff: 'sha256:integrated',
    output_digest: 'sha256:output',
  };
  const parallelHandoff = build({
    contextType: 'parallel_context',
    context: parallel,
    consumer: 'sdcorejs-ship',
  });
  assert.deepEqual(parallelHandoff.authoritative, parallel);
});

test('runtime channel keeps authoritative context internal while unknown uses a portable handoff', () => {
  const project = requireFunction('projectRuntimeContext');
  const context = contextFor('execution_context', 'sdcorejs-test');
  context.full_plan = 'FULL PLAN BODY MUST NOT BE COPIED';
  context.full_diff = 'diff --git a/secret b/secret';
  context.raw_log = 'RAW LOG MUST NOT BE COPIED';

  const projection = {
    outcome: 'Execution completed for AC-017.',
    changed_paths: ['skills/orchestration/using-skills.md'],
    verification: [{ command: 'npm run test:e2e:communication-economy', exit_code: 0, status: 'pass' }],
    blockers: [],
    skipped_checks: [],
    next_action: 'sdcorejs-test',
  };

  const native = project({
    contextType: 'execution_context',
    context,
    consumer: 'sdcorejs-test',
    capabilityStatus: 'supported',
    projection,
  });
  assert.equal(native.handoff_mode, 'runtime-context-channel');
  assert.deepEqual(native.authoritative_context, context);
  assert.equal(native.portable_handoff, null);
  assert.equal(Object.hasOwn(native.user_projection, 'blockers'), false);
  assert.equal(Object.hasOwn(native.user_projection, 'skipped_checks'), false);

  for (const capabilityStatus of ['unsupported', 'unknown']) {
    const fallback = project({
      contextType: 'execution_context',
      context,
      consumer: 'sdcorejs-test',
      capabilityStatus,
      projection,
      nextAction: 'sdcorejs-test',
      currentHeadOrDiff: 'ec6afdb4e2494416d985be610837e728a9278a2f',
    });
    assert.equal(fallback.handoff_mode, 'portable-handoff');
    assert.equal(fallback.portable_handoff.next_consumer, 'sdcorejs-test');
    assert.equal(fallback.portable_handoff.next_action, 'sdcorejs-test');
    const serialized = JSON.stringify(fallback.portable_handoff);
    assert.doesNotMatch(serialized, /FULL PLAN BODY|RAW LOG MUST NOT BE COPIED|diff --git/);
  }
});

test('portable handoff preserves required identity, freshness, evidence, and artifact closure fields', () => {
  const build = requireFunction('buildPortableHandoff');
  const validate = requireFunction('validateRequiredHandoffFields');
  const context = contextFor('ship_context', 'sdcorejs-git');
  const handoff = build({
    contextType: 'ship_context',
    context,
    consumer: 'sdcorejs-git',
    nextAction: 'prepare-commit-scope',
    currentHeadOrDiff: 'sha256:diff-fingerprint',
    artifactRefs: ['.sdcorejs/specs/workflow/communication-economy.md#sha256:spec'],
    evidenceRefs: ['test/e2e/communication-economy.test.mjs#run-7'],
  });

  assert.deepEqual(validate({
    contextType: 'ship_context',
    consumer: 'sdcorejs-git',
    context: handoff.authoritative,
  }), []);
  assert.equal(handoff.current_HEAD_or_diff, 'sha256:diff-fingerprint');
  assert.deepEqual(handoff.artifact_refs, ['.sdcorejs/specs/workflow/communication-economy.md#sha256:spec']);
  assert.deepEqual(handoff.evidence_refs, ['test/e2e/communication-economy.test.mjs#run-7']);
  assert.equal(handoff.next_consumer, 'sdcorejs-git');
  assert.equal(handoff.next_action, 'prepare-commit-scope');

  const review = contextFor('review_context', 'sdcorejs-repair-loop');
  review.findings = [{
    id: 'R3',
    severity: 'High',
    location: 'src/auth.guard.ts:42',
    evidence: 'Missing `orders.write` check.',
    risk: 'Unauthorized mutation.',
    suggested_action: 'Add the resource permission guard.',
    repair_tier: 'confirm',
  }];
  const reviewHandoff = build({
    contextType: 'review_context',
    context: review,
    consumer: 'sdcorejs-repair-loop',
    currentHeadOrDiff: 'sha256:review-diff',
  });
  assert.deepEqual(reviewHandoff.authoritative.findings, review.findings);

  const execution = contextFor('execution_context', 'sdcorejs-test');
  execution.working_tree_preflight.current_HEAD = 'ec6afdb4e2494416d985be610837e728a9278a2f';
  execution.redaction_applied = false;
  const inferred = build({
    contextType: 'execution_context',
    context: execution,
    consumer: 'sdcorejs-test',
  });
  assert.equal(inferred.current_HEAD_or_diff, execution.working_tree_preflight.current_HEAD);
  assert.equal(inferred.redaction_applied, false);

  assert.throws(
    () => build({
      contextType: 'execution_context',
      context: execution,
      consumer: 'sdcorejs-test',
      stateDelta: { nested: { full_diff: 'diff --git a/a b/a' } },
    }),
    /embedded artifact body|full_diff/i
  );

  const nestedBody = contextFor('execution_context', 'sdcorejs-test');
  nestedBody.artifact_context = {
    required_with_change: [],
    raw_log: 'EMBEDDED LOG BODY',
  };
  assert.throws(
    () => build({
      contextType: 'execution_context',
      context: nestedBody,
      consumer: 'sdcorejs-test',
    }),
    /embedded artifact body|artifact_context\.raw_log/i
  );

  const smuggledBodyCases = [
    {
      artifactRefs: [
        'artifact:spec#sha256:spec\n# Specification\n\nAcceptance criteria\n\n- AC-017',
      ],
    },
    {
      evidenceRefs: [
        'test:run-7\nBEGIN LOG\n2026-07-28T12:00:00Z ERROR verification failed\nEND LOG',
      ],
    },
    {
      stateDelta: {
        note: 'diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts',
      },
    },
    {
      stateDelta: {
        note: [
          '---',
          'contract_id: communication-economy',
          'approval:',
          '  approved: true',
          '---',
          'Goals and acceptance criteria follow.',
        ].join('\n'),
      },
    },
    {
      nextAction: 'sdcorejs-test\ndiff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts',
    },
    {
      currentHeadOrDiff: 'sha256:diff\ndiff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts',
    },
  ];
  for (const smuggledBody of smuggledBodyCases) {
    assert.throws(
      () => build({
        contextType: 'execution_context',
        context: execution,
        consumer: 'sdcorejs-test',
        ...smuggledBody,
      }),
      (error) => error?.code === 'ERR_EMBEDDED_ARTIFACT_BODY'
    );
  }

  const largeEmbeddedDiff = [
    'diff --git a/src/a.ts b/src/a.ts',
    '--- a/src/a.ts',
    '+++ b/src/a.ts',
    `+${'payload'.repeat(5_000)}`,
  ].join('\n');
  assert.ok(Buffer.byteLength(largeEmbeddedDiff, 'utf8') > 33_495);
  for (const largeSmugglingAttempt of [
    { artifactRefs: [largeEmbeddedDiff] },
    { evidenceRefs: [largeEmbeddedDiff] },
    { stateDelta: { note: largeEmbeddedDiff } },
    { nextAction: largeEmbeddedDiff },
    { currentHeadOrDiff: largeEmbeddedDiff },
  ]) {
    assert.throws(
      () => build({
        contextType: 'execution_context',
        context: execution,
        consumer: 'sdcorejs-test',
        ...largeSmugglingAttempt,
      }),
      (error) => error?.code === 'ERR_EMBEDDED_ARTIFACT_BODY'
    );
  }

  const exactBoundedValues = build({
    contextType: 'execution_context',
    context: execution,
    consumer: 'sdcorejs-test',
    artifactRefs: ['_refs/harness/runtime-policy.mjs#sha256:artifact'],
    evidenceRefs: ['test:e2e:communication-economy#exit:17'],
    stateDelta: {
      command: 'npm run test:e2e:communication-economy',
      path: '_refs/harness/runtime-policy.mjs',
      error: 'Error: required field approved_plan_hash is missing',
      exit_code: 17,
    },
    nextAction: 'sdcorejs-test',
    currentHeadOrDiff: 'ec6afdb4e2494416d985be610837e728a9278a2f',
  });
  assert.equal(
    exactBoundedValues.state_delta.error,
    'Error: required field approved_plan_hash is missing'
  );
  assert.equal(exactBoundedValues.state_delta.exit_code, 17);

  for (const invalidEnvelope of [
    { artifactRefs: 'artifact:path#sha256:not-an-array' },
    { artifactRefs: [null, { x: true }, 17] },
    { evidenceRefs: { ref: 'test:run-7' } },
    { evidenceRefs: [null, { x: true }, 17] },
    { stateDelta: ['changed'] },
    { currentHeadOrDiff: { raw_log: 'SECRET' } },
    { nextAction: { raw_log: 'SECRET' } },
    { redactionApplied: { raw_log: 'SECRET' } },
  ]) {
    assert.throws(
      () => build({
        contextType: 'execution_context',
        context: execution,
        consumer: 'sdcorejs-test',
        ...invalidEnvelope,
      }),
      (error) => error?.code === 'ERR_INVALID_PORTABLE_HANDOFF_ENVELOPE'
    );
  }

  const unknownRedaction = build({
    contextType: 'execution_context',
    context: execution,
    consumer: 'sdcorejs-test',
    redactionApplied: 'unknown',
  });
  assert.equal(unknownRedaction.redaction_applied, 'unknown');
});

test('projection preserves exact content, review findings, and approval or security clarity', () => {
  const project = requireFunction('projectRuntimeContext');
  const render = requireFunction('renderUserProjection');
  const exact = {
    code: 'const result = verify("AC-017");',
    command: 'npm run test:e2e:communication-economy',
    path: '_refs/harness/runtime-policy.mjs',
    identifier: 'runtime_context_channel',
    url: 'https://github.com/sdcorejs/sdcorejs-agent',
    hash: 'ec6afdb4e2494416d985be610837e728a9278a2f',
    error: 'Error: required field approved_plan_hash is missing',
    number_and_unit: '20 ms',
    permission: 'orders.write',
    acceptance_id: 'AC-017',
    finding_id: 'R3',
    exit_code: 17,
  };
  const reviewContext = contextFor('review_context', 'sdcorejs-repair-loop');
  const finding = {
    id: exact.finding_id,
    severity: 'High',
    location: 'skills/shared/workflow/review.md:282',
    evidence: exact.error,
    suggested_action: 'Keep the authoritative context internal.',
  };
  const projection = {
    outcome: 'Review found one blocking issue.',
    status: 'blocked',
    findings: [finding],
    evidence: Object.values(exact),
    consequences: ['A destructive delete cannot be recovered without the backup.'],
    recovery: ['Restore from backup `backup-2026-07-28`.'],
    next_decision: 'Approve deletion of `artifact-17`.',
    blockers: ['R3'],
    risks: [],
    skipped_checks: [],
  };

  const projected = project({
    contextType: 'review_context',
    context: reviewContext,
    consumer: 'sdcorejs-repair-loop',
    capabilityStatus: 'supported',
    projection,
    profile: 'detailed',
  });
  assert.deepEqual(projected.user_projection.findings, [finding]);
  assert.equal(Object.hasOwn(projected.user_projection, 'risks'), false);
  assert.equal(Object.hasOwn(projected.user_projection, 'skipped_checks'), false);

  const rendered = render(projected.user_projection, { profile: 'detailed' });
  for (const value of Object.values(exact)) assert.match(rendered, new RegExp(String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(rendered, /cannot be recovered/);
  assert.match(rendered, /Restore from backup/);
  assert.doesNotMatch(rendered, /^## Risks\s*$/m);
  assert.ok(
    rendered.indexOf('Blockers') < rendered.indexOf('Evidence'),
    'blocking state precedes secondary evidence'
  );

  const embeddedProjectionBody = [
    'diff --git a/src/a.ts b/src/a.ts',
    '--- a/src/a.ts',
    '+++ b/src/a.ts',
    '@@ -1 +1 @@',
    `+${'projected-log-or-diff-body'.repeat(240)}`,
  ].join('\n');
  assert.ok(Buffer.byteLength(embeddedProjectionBody, 'utf8') > 5_766);
  const embeddedProjection = {
    outcome: 'The bounded result should remain visible.',
    details: [embeddedProjectionBody],
  };
  assert.throws(
    () => project({
      contextType: 'review_context',
      context: reviewContext,
      consumer: 'sdcorejs-repair-loop',
      capabilityStatus: 'supported',
      projection: embeddedProjection,
      profile: 'standard',
    }),
    (error) => error?.code === 'ERR_EMBEDDED_ARTIFACT_BODY'
  );
  assert.throws(
    () => render(embeddedProjection, { profile: 'standard' }),
    (error) => error?.code === 'ERR_EMBEDDED_ARTIFACT_BODY'
  );
  assert.throws(
    () => render({
      outcome: 'Verification failed.',
      details: [[
        '2026-07-28T12:00:00Z INFO starting verification',
        '2026-07-28T12:00:01Z ERROR command failed with exit code 17',
      ].join('\n')],
    }, { profile: 'standard' }),
    (error) => error?.code === 'ERR_EMBEDDED_ARTIFACT_BODY'
  );

  const approval = render({
    outcome: 'The specification is ready for approval.',
    blockers: [],
    approval_scope: ['Contract `communication-economy` revision 2.'],
    acceptance_criteria: ['AC-017 preserves exact exit codes.'],
    non_goals: ['No runtime server.'],
    risks: ['Unknown runtime channels require a portable handoff.'],
    options: ['Approve', 'Change', 'Cancel'],
    next_decision: 'Approve revision 2.',
  }, { profile: 'detailed' });
  assert.match(approval, /AC-017 preserves exact exit codes\./);
  assert.match(approval, /No runtime server\./);
  assert.match(approval, /^1\. Approve$/m);
  assert.match(approval, /^2\. Change$/m);
  assert.match(approval, /^3\. Cancel$/m);
  assert.doesNotMatch(approval, /^- (?:Approve|Change|Cancel)$/m);

  const full = project({
    contextType: 'review_context',
    context: reviewContext,
    consumer: 'sdcorejs-repair-loop',
    capabilityStatus: 'supported',
    projection,
    profile: 'detailed',
    fullContextRequested: true,
  });
  assert.deepEqual(full.full_context, reviewContext);
  assert.equal(full.profile, 'detailed');
  assert.match(render(full.user_projection, {
    profile: 'detailed',
    fullContext: full.full_context,
  }), /review_context|track_profile/);
});

test('related artifact selection prefers relationships and never loads unrelated newest bodies for style', () => {
  const select = requireFunction('selectRelatedArtifacts');
  const artifacts = [
    {
      path: '.sdcorejs/specs/workflow/unrelated-newest.md',
      contract_id: 'other-contract',
      change_ref: 'other-change',
      requirement_id: 'REQ-999',
      module: 'other',
      approved_at: '2026-07-28T23:59:59Z',
      headings: ['Unrelated'],
    },
    {
      path: '.sdcorejs/specs/workflow/direct-contract.md',
      contract_id: 'communication-economy',
      change_ref: 'older-change',
      requirement_id: 'REQ-017',
      module: 'harness',
      approved_at: '2026-07-01T00:00:00Z',
      headings: ['Problem', 'Acceptance criteria'],
    },
    {
      path: '.sdcorejs/specs/workflow/same-module.md',
      contract_id: 'another-contract',
      change_ref: 'another-change',
      requirement_id: 'REQ-018',
      module: 'harness',
      approved_at: '2026-07-27T00:00:00Z',
      headings: ['Architecture'],
    },
    {
      path: 'skills/shared/sdlc/spec-template.md',
      artifact_kind: 'canonical-template',
      headings: ['Problem', 'Goals', 'Acceptance criteria'],
    },
  ];

  const dependency = select({
    artifacts,
    query: {
      contract_id: 'communication-economy',
      change_ref: 'communication-economy',
      requirement_id: 'REQ-017',
      module: 'harness',
    },
    purpose: 'dependency',
  });
  assert.equal(dependency[0].path, '.sdcorejs/specs/workflow/direct-contract.md');
  assert.equal(dependency[0].load, 'body');
  assert.ok(!dependency.some((item) => item.path.endsWith('unrelated-newest.md')));

  const style = select({
    artifacts,
    query: { module: 'harness' },
    purpose: 'style',
  });
  assert.equal(style[0].path, '.sdcorejs/specs/workflow/same-module.md');
  assert.equal(style[0].load, 'frontmatter-and-headings');
  assert.ok(!style.some((item) => item.path.endsWith('unrelated-newest.md')));

  const template = select({
    artifacts,
    query: { module: 'missing-module' },
    purpose: 'style',
  });
  assert.deepEqual(template.map((item) => item.path), ['skills/shared/sdlc/spec-template.md']);
  assert.equal(template[0].load, 'canonical-template');
});

test('compact, standard, and detailed projections keep semantic outcome and evidence parity', () => {
  const audit = requireFunction('auditRenderedProjection');
  const render = requireFunction('renderUserProjection');
  const measure = requireFunction('measureText');
  const projection = {
    outcome: 'Verification completed.',
    status: 'pass',
    changed_paths: ['_refs/harness/runtime-policy.mjs'],
    verification: [{
      command: 'node --test test/e2e/communication-economy.test.mjs',
      exit_code: 0,
      status: 'pass',
    }],
    findings: [{
      id: 'R17',
      severity: 'Low',
      location: '_refs/harness/runtime-policy.mjs:17',
      evidence: 'The rendered result must retain evidence.',
      suggested_action: 'Keep the semantic audit tied to rendered text.',
    }],
    evidence: ['sha256:evidence-17'],
    details: ['The runtime channel kept the authoritative context internal.'],
    rationale: ['The portable fallback is used for unknown capability state.'],
    consequences: ['Approval changes the public contract.'],
    recovery: ['Select Change before approval to revise the contract.'],
    approval_scope: ['Contract `communication-economy` revision 2.'],
    acceptance_criteria: ['AC-017 preserves rendered evidence.'],
    risks: ['Unknown native context support uses the portable path.'],
    blockers: ['R17'],
    skipped_checks: ['Live provider telemetry was not run.'],
    options: ['Approve', 'Change', 'Cancel'],
    next_decision: 'Approve contract revision 2.',
  };

  const outputs = Object.fromEntries(
    ['compact', 'standard', 'detailed'].map((profile) => [profile, render(projection, { profile })])
  );
  for (const output of Object.values(outputs)) {
    assert.match(output, /Verification completed\./);
    assert.match(output, /exit_code[^0-9]*0|Exit code: 0/i);
    assert.match(output, /status[^a-z]*pass|pass/i);
    assert.match(output, /R17/);
    assert.match(output, /sha256:evidence-17/);
    assert.match(output, /Unknown native context support/);
    assert.match(output, /Live provider telemetry was not run\./);
    assert.equal(audit({
      projection,
      rendered: output,
      profile: 'compact',
      commonOnly: true,
    }).parity, true);
  }
  assert.ok(measure(outputs.compact).utf8_bytes < measure(outputs.standard).utf8_bytes);
  assert.ok(measure(outputs.standard).utf8_bytes <= measure(outputs.detailed).utf8_bytes);
  assert.doesNotMatch(outputs.compact, /^## (?:Risks|Blockers|Skipped checks)\s*$/m);

  const detailedAudit = audit({
    projection,
    rendered: outputs.detailed,
    profile: 'detailed',
  });
  assert.equal(detailedAudit.parity, true);
  assert.deepEqual(detailedAudit.missing, []);

  const truncated = outputs.detailed
    .replace('sha256:evidence-17', '')
    .replace('Contract `communication-economy` revision 2.', '');
  const truncatedAudit = audit({
    projection,
    rendered: truncated,
    profile: 'detailed',
  });
  assert.equal(truncatedAudit.parity, false);
  assert.match(truncatedAudit.missing.join('\n'), /evidence|approval_scope/);
});

test('context-budget report records smaller visible projection and removes repeated final-summary blocks', async () => {
  const baseline = JSON.parse(await readFile(baselineUrl, 'utf8'));
  const measure = requireFunction('measureText');
  const repeated = requireFunction('measureRepeatedBlockBytes');
  const render = requireFunction('renderUserProjection');

  const currentBootstrap = await measurePaths(baseline.bootstrap.paths);
  assert.ok(
    currentBootstrap.semantic_bytes <= baseline.bootstrap.semantic_bytes,
    `bootstrap semantic bytes ${currentBootstrap.semantic_bytes} must not exceed baseline ${baseline.bootstrap.semantic_bytes}`
  );

  const fullContext = {
    execution_context: contextFor('execution_context', 'sdcorejs-test'),
    review_context: contextFor('review_context', 'sdcorejs-repair-loop'),
    ship_context: contextFor('ship_context', 'sdcorejs-git'),
  };
  const baselineVisible = JSON.stringify(fullContext, null, 2);
  const compactVisible = render({
    outcome: 'The change is verified.',
    status: 'pass',
    changed_paths: ['_refs/harness/runtime-policy.mjs'],
    verification: [{ command: 'npm run test:e2e:communication-economy', exit_code: 0, status: 'pass' }],
  }, { profile: 'compact' });
  assert.ok(measure(compactVisible).utf8_bytes < measure(baselineVisible).utf8_bytes);
  assert.ok(measure(compactVisible).words < measure(baselineVisible).words);

  const repeatedSummary = [
    'Outcome\n\nThe change is verified.\n\nVerified\n\nnpm run test:e2e:communication-economy - exit 0',
    'Outcome\n\nThe change is verified.\n\nVerified\n\nnpm run test:e2e:communication-economy - exit 0',
  ];
  const repeatedThreeTimes = ['Same block', 'Same block', 'Same block'];
  const eventThenFinal = [
    'Verification phase completed.',
    'Outcome\n\nThe change is verified.\n\nVerified\n\nnpm run test:e2e:communication-economy - exit 0',
  ];
  assert.ok(repeated(repeatedSummary) > 0);
  assert.equal(repeated(repeatedThreeTimes), Buffer.byteLength('Same block', 'utf8') * 2);
  assert.equal(repeated(eventThenFinal), 0);
});

test('context capability is provider-neutral, tri-state, mapped, and portable by default', async () => {
  const contract = JSON.parse(await readFile(capabilityUrl, 'utf8'));
  assert.ok(contract.required_actions.includes('context.pass'));
  assert.ok(contract.required_capabilities.includes('runtime_context_channel'));
  for (const [adapterName, adapter] of Object.entries(contract.adapters)) {
    assert.ok(Object.hasOwn(adapter.actions, 'context.pass'), `${adapterName} maps context.pass`);
    assert.ok(Object.hasOwn(adapter.capabilities, 'runtime_context_channel'), `${adapterName} declares runtime_context_channel`);
    assert.notEqual(
      adapter.capabilities.runtime_context_channel,
      'supported',
      `${adapterName} must not claim support without structured handoff evidence`
    );
    assert.match(adapter.actions['context.pass'].fallback, /portable handoff/i);
  }

  const fallback = runtimePolicy.resolveAction({
    contract,
    adapter: 'codex',
    action: 'context.pass',
    runtimeCapabilities: { runtime_context_channel: 'unknown' },
  });
  assert.equal(fallback.mode, 'fallback');
});

test('canonical workflows integrate compact projection, event progress, and relationship-scoped loading', async () => {
  const [
    agents,
    usingSkills,
    runtimeProtocols,
    tasklist,
    brainstorming,
    spec,
    plan,
    review,
    reviewSecurity,
    reviewPerformance,
    writeUserGuide,
    packageJson,
  ] = await Promise.all([
    readFile(path.join(root, 'AGENTS.md'), 'utf8'),
    readFile(path.join(root, 'skills/orchestration/using-skills.md'), 'utf8'),
    readFile(path.join(root, '_refs/shared/runtime-protocols.md'), 'utf8'),
    readFile(path.join(root, '_refs/shared/tasklist.md'), 'utf8'),
    readFile(path.join(root, 'skills/shared/sdlc/01-brainstorming.md'), 'utf8'),
    readFile(path.join(root, 'skills/shared/sdlc/02-spec.md'), 'utf8'),
    readFile(path.join(root, 'skills/shared/sdlc/03-plan.md'), 'utf8'),
    readFile(path.join(root, 'skills/shared/workflow/review.md'), 'utf8'),
    readFile(path.join(root, '_refs/shared/review-security.md'), 'utf8'),
    readFile(path.join(root, '_refs/shared/review-performance.md'), 'utf8'),
    readFile(path.join(root, '_refs/documentation/write-user-guide.md'), 'utf8'),
    readFile(path.join(root, 'package.json'), 'utf8'),
  ]);

  for (const text of [agents, usingSkills, runtimeProtocols]) {
    assert.match(text, /communication-economy\.md/);
  }
  assert.doesNotMatch(agents, /This private repository is an engineering skill pack/i);
  assert.match(agents, /root Node workspace is private|private Node workspace/i);
  assert.match(agents + usingSkills, /compact[\s\S]{0,180}complete professional\s+sentences|complete professional\s+sentences[\s\S]{0,180}compact/i);
  assert.match(agents + usingSkills, /approval[\s\S]{0,220}security[\s\S]{0,220}detailed|detailed[\s\S]{0,220}approval[\s\S]{0,220}security/i);

  assert.match(tasklist, /meaningful outcome|outcome completes/i);
  assert.match(tasklist, /scope changes/i);
  assert.match(tasklist, /verification phase completes or fails/i);
  assert.match(tasklist, /user asks for status/i);
  assert.match(tasklist, /another file (?:was|is) read/i);
  assert.match(tasklist, /final response may be the final user projection/i);
  assert.doesNotMatch(tasklist, /Before the final response, make one final runtime progress update/i);

  assert.doesNotMatch(spec, /latest\s+1(?:\s*(?:\u2013|-)\s*3|\s+to\s+3)\s+approved specs/i);
  assert.match(spec, /same `contract_id`[\s\S]*same `change_ref`[\s\S]*`supersedes`[\s\S]*same requirement[\s\S]*exact module/i);
  assert.match(spec, /frontmatter and headings|frontmatter\/headings/i);
  assert.doesNotMatch(brainstorming, /latest approved[\s\S]{0,80}frontmatter/i);
  assert.doesNotMatch(writeUserGuide, /most recent (?:track )?spec/i);
  assert.doesNotMatch(reviewSecurity + reviewPerformance, /git log -20/);
  assert.match(reviewSecurity + reviewPerformance, /explicit(?:ly)? bounded (?:Git )?(?:range|review range)|current diff/i);

  assert.match(plan, /contract_id[\s\S]{0,140}approved_spec_path[\s\S]{0,140}approved_spec_hash/i);
  assert.match(plan, /must not copy the full spec body/i);
  assert.match(review, /findings[\s\S]{0,220}user\s+projection|user\s+projection[\s\S]{0,220}findings/i);
  assert.match(review, /do not (?:render|echo|include)[\s\S]{0,120}full\s+`review_context`/i);

  const skillFiles = (await listRelativeFiles(path.join(root, 'skills')))
    .filter((relativePath) => relativePath.endsWith('.md'));
  assert.equal(skillFiles.length, 23);
  for (const relativePath of skillFiles) {
    const text = await readFile(path.join(root, 'skills', relativePath), 'utf8');
    const actions = text.match(/^required-actions:\s*(.+)$/m)?.[1]
      .split(',')
      .map((item) => item.trim());
    assert.ok(actions?.includes('context.pass'), `${relativePath} declares context.pass`);
  }

  const parsedPackage = JSON.parse(packageJson);
  assert.equal(
    parsedPackage.scripts['test:e2e:communication-economy'],
    'node --test test/e2e/communication-economy.test.mjs'
  );
  assert.equal(
    parsedPackage.scripts['report:communication-economy'],
    'node scripts/measure-communication-economy.mjs'
  );
});

test('public documentation and site describe the communication contract without marketing token claims', async () => {
  const documentationPaths = [
    'README.md',
    'docs/ADOPTION.md',
    'docs/TROUBLESHOOTING.md',
    'docs/WORKED_EXAMPLE.md',
    'docs/REAL_AGENT_VALIDATION.md',
    'docs/RELEASE_PROCESS.md',
    'VALIDATION.md',
    'TESTING.md',
    'CHANGELOG.md',
  ];
  const documents = Object.fromEntries(await Promise.all(
    documentationPaths.map(async (relativePath) => [
      relativePath,
      await readFile(path.join(root, relativePath), 'utf8'),
    ])
  ));
  const combined = Object.values(documents).join('\n');
  const site = await readFile(path.join(root, 'site/src/pages/index.astro'), 'utf8');

  for (const relativePath of [
    'README.md',
    'docs/ADOPTION.md',
    'docs/TROUBLESHOOTING.md',
    'docs/WORKED_EXAMPLE.md',
    'docs/REAL_AGENT_VALIDATION.md',
    'VALIDATION.md',
    'TESTING.md',
    'CHANGELOG.md',
  ]) {
    assert.match(
      documents[relativePath],
      /Communication Economy Policy/,
      `${relativePath} names the public contract`
    );
  }

  assert.match(combined, /visible-output and portable-handoff/i);
  assert.match(combined, /does not establish|do not prove broad token or cost reduction/i);
  assert.match(combined, /complete professional sentences|complete grammatical sentences/i);
  assert.match(combined, /authoritative runtime context/i);
  assert.match(combined, /user projection/i);
  assert.match(combined, /portable handoff/i);
  assert.match(combined, /compact[\s\S]*standard[\s\S]*detailed/i);
  assert.match(combined, /full context/i);
  assert.match(combined, /approval[\s\S]{0,300}security[\s\S]{0,300}destructive/i);
  assert.match(combined, /metrics? (?:are|is) evidence|evidence, not (?:a )?marketing claim/i);
  assert.match(combined, /input token[\s\S]{0,260}cached input token[\s\S]{0,260}output token[\s\S]{0,260}total token/i);
  assert.match(combined, /not run|skipped/i);
  assert.match(documents['TESTING.md'], /test:e2e:communication-economy/);
  assert.match(documents['VALIDATION.md'], /report:communication-economy/);

  assert.match(site, /Communication Economy Policy/);
  assert.match(site, /compact/i);
  assert.match(site, /standard/i);
  assert.match(site, /detailed/i);
  assert.match(site, /portable handoff/i);
  assert.match(site, /runtime context/i);
  assert.match(site, /user projection/i);

  assert.doesNotMatch(
    combined + site,
    /(?:guarantee|target|promise)[^\n]{0,80}(?:65%|token reduction)|reduce(?:s|d)? tokens? by 65%/i
  );
});

test('deterministic report compares ten scenarios without invented token counts', async () => {
  const reportModule = await import(reportModuleUrl).catch(() => ({}));
  assert.equal(typeof reportModule.buildCommunicationEconomyReport, 'function');
  const report = await reportModule.buildCommunicationEconomyReport({ root });

  assert.equal(report.schema_version, 1);
  assert.equal(report.measurement_kind, 'deterministic-source-bound-contract-projection');
  assert.equal(report.baseline.source_commit, 'ec6afdb4e2494416d985be610837e728a9278a2f');
  assert.equal(report.baseline.visible_output.observed_live, false);
  assert.equal(report.baseline.visible_output.source, 'source-bound-fixture');
  assert.match(report.baseline.visible_output.method, /audited source_commit/i);
  assert.equal(
    report.baseline.visible_output.duplicate_progress_rule.rule,
    'Before the final response, make one final runtime progress update.'
  );
  assert.equal(report.duplication_pair_basis.observed_live, false);
  assert.equal(report.tokenizer.status, 'unavailable');
  assert.match(report.tokenizer.reason, /no tokenizer dependency/i);
  assert.equal(Object.keys(report.scenarios).length, 10);
  assert.ok(report.bootstrap.current.utf8_bytes < report.bootstrap.baseline.utf8_bytes);
  assert.ok(report.aggregate.current_jit_utf8_bytes > 0);
  const portableHandoffBytes = Object.values(report.scenarios)
    .reduce((total, scenario) => total + scenario.portable_handoff_utf8_bytes, 0);
  const runtimeContextChannelBytes = Object.values(report.scenarios)
    .reduce((total, scenario) => total + scenario.runtime_context_channel_utf8_bytes, 0);
  assert.equal(report.aggregate.current_portable_handoff_utf8_bytes, portableHandoffBytes);
  assert.equal(
    report.aggregate.current_runtime_context_channel_utf8_bytes,
    runtimeContextChannelBytes
  );
  assert.equal(
    report.aggregate.current_total_communication_utf8_bytes,
    report.bootstrap.current.utf8_bytes +
      report.aggregate.current_jit_utf8_bytes +
      report.aggregate.current_visible_utf8_bytes +
      portableHandoffBytes +
      runtimeContextChannelBytes
  );
  assert.ok(report.aggregate.current_total_communication_utf8_bytes > 0);
  assert.ok(report.aggregate.baseline_total_communication_utf8_bytes > 0);
  assert.equal(
    report.measurement_kind,
    'deterministic-source-bound-contract-projection',
  );

  for (const [name, scenario] of Object.entries(report.scenarios)) {
    assert.equal(scenario.authoritative_field_coverage.missing.length, 0, name);
    assert.equal(
      scenario.authoritative_field_coverage.preserved,
      scenario.authoritative_field_coverage.required,
      name
    );
    assert.equal(scenario.rendered_semantic_coverage.parity, true, name);
    assert.equal(scenario.profile_semantic_parity, true, name);
    assert.equal(scenario.repeated_block_bytes.current, 0, name);
    assert.ok(Array.isArray(scenario.visible_output.baseline_source_paths), name);
    if (scenario.handoff_mode === 'runtime-context-channel') {
      assert.ok(scenario.runtime_context_channel_utf8_bytes > 0, name);
      assert.equal(scenario.portable_handoff_utf8_bytes, 0, name);
    }
    else {
      assert.equal(scenario.runtime_context_channel_utf8_bytes, 0, name);
    }
  }

  for (const name of [
    'approved-plan-execution',
    'direct-review',
    'review-repair-ship',
    'no-runtime-context-channel',
  ]) {
    assert.ok(
      report.scenarios[name].visible_output.current.utf8_bytes <
        report.scenarios[name].visible_output.baseline.utf8_bytes,
      name
    );
  }
  assert.equal(report.scenarios['spec-approval'].profile, 'detailed');
  assert.equal(report.scenarios['security-destructive'].profile, 'detailed');
  assert.equal(report.scenarios['no-runtime-context-channel'].handoff_mode, 'portable-handoff');
  assert.ok(
    !report.scenarios['pure-qa'].jit_context.selected_paths.includes(
      '_refs/shared/documentation-layout.md'
    )
  );
  assert.ok(
    report.scenarios['delegated-test-docs'].jit_context.selected_paths.includes(
      '_refs/shared/documentation-layout.md'
    )
  );
  assert.ok(
    !report.scenarios['delegated-test-docs'].jit_context.selected_paths.includes(
      '_refs/harness/capability-contract.json'
    ),
    'runtime capability resolution must not require loading the full adapter manifest into model context'
  );
  assert.deepEqual(Object.keys(report.duplication_pairs).sort(), [
    'execution-test-review-ship',
    'plan-execution',
    'progress-final',
    'spec-plan',
  ]);
  for (const [name, pair] of Object.entries(report.duplication_pairs)) {
    assert.ok(pair.current.repeated_block_bytes < pair.baseline.repeated_block_bytes, name);
    assert.ok(pair.current.repeated_ratio < pair.baseline.repeated_ratio, name);
  }
  const formatInteger = new Intl.NumberFormat('en-US').format;
  const validationDocument = await readFile(path.join(root, 'VALIDATION.md'), 'utf8');
  for (const expectedRow of [
    `| Always-loaded bootstrap UTF-8 bytes | ${formatInteger(report.bootstrap.baseline.utf8_bytes)} | ${formatInteger(report.bootstrap.current.utf8_bytes)} |`,
    `| Always-loaded bootstrap words | ${formatInteger(report.bootstrap.baseline.words)} | ${formatInteger(report.bootstrap.current.words)} |`,
    `| Aggregate just-in-time scenario bytes | ${formatInteger(report.aggregate.baseline_jit_utf8_bytes)} | ${formatInteger(report.aggregate.current_jit_utf8_bytes)} |`,
    `| Aggregate visible output bytes | ${formatInteger(report.aggregate.baseline_visible_utf8_bytes)} | ${formatInteger(report.aggregate.current_visible_utf8_bytes)} |`,
    `| Aggregate visible output words | ${formatInteger(report.aggregate.baseline_visible_words)} | ${formatInteger(report.aggregate.current_visible_words)} |`,
    `| Portable fallback handoff bytes | 0 | ${formatInteger(report.aggregate.current_portable_handoff_utf8_bytes)} |`,
    `| Supported runtime context channel bytes | 0 | ${formatInteger(report.aggregate.current_runtime_context_channel_utf8_bytes)} |`,
    `| Repeated-block bytes | ${formatInteger(report.aggregate.baseline_repeated_block_bytes)} | ${formatInteger(report.aggregate.current_repeated_block_bytes)} |`,
    `| Total measured communication bytes | ${formatInteger(report.aggregate.baseline_total_communication_utf8_bytes)} | ${formatInteger(report.aggregate.current_total_communication_utf8_bytes)} |`,
    `| Consumer-required authoritative fields | ${formatInteger(report.aggregate.required_fields)} | ${formatInteger(report.aggregate.preserved_fields)} preserved |`,
  ]) {
    assert.ok(
      validationDocument.includes(expectedRow),
      `VALIDATION.md is stale for report row: ${expectedRow}`
    );
  }
  assert.equal(report.live_ab_eval.status, 'skipped');
  assert.ok(!Object.hasOwn(report, 'generated_at'));
});

test('optional live report validates sanitized A/B evidence without changing the deterministic default', async (t) => {
  const reportModule = await import(reportModuleUrl);
  const defaultReport = await reportModule.buildCommunicationEconomyReport({ root });
  assert.equal(defaultReport.live_ab_eval.status, 'skipped');

  const liveReport = await reportModule.buildCommunicationEconomyReport({
    root,
    liveEvidencePath: path.resolve(root, 'test/e2e/fixtures/communication-economy-live-ab.json'),
  });
  assert.equal(liveReport.measurement_kind, 'deterministic-source-bound-contract-projection');
  assert.equal(liveReport.live_ab_eval.status, 'observed');
  assert.equal(liveReport.live_ab_eval.observed_live, true);
  assert.equal(
    liveReport.live_ab_eval.fixture,
    'test/e2e/fixtures/communication-economy-live-ab.json'
  );
  assert.equal(
    liveReport.live_ab_eval.scenario_id,
    'pure-qa-repo-purpose-skill-count-mirror-command'
  );
  assert.equal(liveReport.live_ab_eval.evaluations.length, 4);
  assert.deepEqual(
    liveReport.live_ab_eval.evaluations.map(({ provider, reasoning_effort }) =>
      `${provider}:${reasoning_effort}`
    ),
    ['codex:medium', 'claude:medium', 'codex:high', 'claude:high']
  );
  for (const evaluation of liveReport.live_ab_eval.evaluations) {
    assert.equal(evaluation.outcome_parity, true);
    assert.equal(evaluation.semantic_parity, true);
    assert.equal(evaluation.baseline.exit_code, 0);
    assert.equal(evaluation.current.exit_code, 0);
    assert.ok(evaluation.baseline.usage.derived_total_tokens > 0);
    assert.ok(evaluation.current.usage.derived_total_tokens > 0);
  }

  const fixture = JSON.parse(await readFile(liveEvidenceUrl, 'utf8'));
  assert.equal(fixture.evidence_policy.sanitized_metrics_only, true);
  assert.equal(fixture.evidence_policy.raw_transcripts_committed, false);
  assert.equal(fixture.evidence_policy.contains_secrets_or_user_data, false);
  assert.doesNotMatch(JSON.stringify(fixture), /C:\\Users\\|BEGIN (?:RSA |OPENSSH )?PRIVATE KEY/);

  const invalidRoot = await mkdtemp(path.join(tmpdir(), 'communication-economy-live-invalid-'));
  t.after(() => rm(invalidRoot, { recursive: true, force: true }));
  const invalidPath = path.join(invalidRoot, 'invalid-live-ab.json');
  const invalidFixture = structuredClone(fixture);
  invalidFixture.evaluations[0].semantic_parity = false;
  await writeFile(invalidPath, JSON.stringify(invalidFixture, null, 2), 'utf8');
  await assert.rejects(
    reportModule.buildCommunicationEconomyReport({ root, liveEvidencePath: invalidPath }),
    /semantic parity/i
  );

  const invalidTotalPath = path.join(invalidRoot, 'invalid-live-total.json');
  const invalidTotalFixture = structuredClone(fixture);
  invalidTotalFixture.evaluations[0].current.usage.derived_total_tokens += 1;
  await writeFile(invalidTotalPath, JSON.stringify(invalidTotalFixture, null, 2), 'utf8');
  await assert.rejects(
    reportModule.buildCommunicationEconomyReport({
      root,
      liveEvidencePath: invalidTotalPath,
    }),
    /derived_total_tokens.*does not match/i
  );

  const unsanitizedPath = path.join(invalidRoot, 'unsanitized-live-ab.json');
  const unsanitizedFixture = structuredClone(fixture);
  unsanitizedFixture.raw_transcript = 'C:\\Users\\Example\\private-response.txt';
  await writeFile(unsanitizedPath, JSON.stringify(unsanitizedFixture, null, 2), 'utf8');
  await assert.rejects(
    reportModule.buildCommunicationEconomyReport({
      root,
      liveEvidencePath: unsanitizedPath,
    }),
    /forbidden raw evidence field/i
  );

  const secretPath = path.join(invalidRoot, 'secret-live-ab.json');
  const secretFixture = structuredClone(fixture);
  secretFixture.api_key = 'not-a-real-secret';
  await writeFile(secretPath, JSON.stringify(secretFixture, null, 2), 'utf8');
  await assert.rejects(
    reportModule.buildCommunicationEconomyReport({
      root,
      liveEvidencePath: secretPath,
    }),
    /forbidden sensitive evidence field/i
  );

  const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  assert.equal(
    packageJson.scripts['report:communication-economy:live'],
    'node scripts/measure-communication-economy.mjs --live-evidence test/e2e/fixtures/communication-economy-live-ab.json'
  );
});

test('baseline snapshot matches the audited commit when history is available', async (t) => {
  const baseline = JSON.parse(await readFile(baselineUrl, 'utf8'));
  const sourceCommit = baseline.source_commit;
  try {
    execFileSync('git', ['cat-file', '-e', `${sourceCommit}^{commit}`], {
      cwd: root,
      stdio: 'ignore',
      windowsHide: true,
    });
  }
  catch {
    t.skip(`audited commit ${sourceCommit} is unavailable in this checkout`);
    return;
  }

  const scenarioFixture = JSON.parse(await readFile(scenarioFixtureUrl, 'utf8'));
  const snapshot = baseline.visible_output_snapshot;
  const progressRule = snapshot.duplicate_progress_rule;
  assert.equal(
    gitFromRoot(['rev-parse', `${sourceCommit}:${progressRule.path}`]),
    progressRule.blob_oid
  );
  assert.match(
    gitFromRoot(['show', `${sourceCommit}:${progressRule.path}`]),
    new RegExp(escapeRegExp(progressRule.rule))
  );

  for (const [name, definition] of Object.entries(scenarioFixture.scenarios)) {
    const contextTypes = [
      ...new Set(definition.context_contracts.map(({ context_type }) => context_type)),
    ];
    const sources = contextTypes.map((contextType) => {
      const sourcePath = BASELINE_CONTEXT_SCHEMA_PATHS[contextType];
      assert.ok(sourcePath, `${name}: source path for ${contextType}`);
      const content = gitFromRoot(['show', `${sourceCommit}:${sourcePath}`]);
      return {
        context_type: contextType,
        path: sourcePath,
        blob_oid: gitFromRoot(['rev-parse', `${sourceCommit}:${sourcePath}`]),
        schema: extractHistoricalContextSchema(content, contextType, sourcePath),
      };
    });
    const summary = renderHistoricalScenarioProjection(definition.projection);
    const context = sources
      .map(({ context_type, schema }) => `${context_type}\n\n\`\`\`yaml\n${schema}\n\`\`\``)
      .join('\n\n');
    const final = context.length > 0
      ? `${summary}\n\nFull runtime context\n\n${context}`
      : summary;
    const messages = definition.baseline_duplicate_summary
      ? [summary, final]
      : [final];
    const regenerated = {
      measurement: runtimePolicy.measureText(messages.join('\n\n')),
      repeated_block_bytes: runtimePolicy.measureRepeatedBlockBytes(messages),
      source_paths: sources.map(({ path: sourcePath }) => sourcePath),
      source_blobs: sources.map(({ blob_oid }) => blob_oid),
    };

    assert.deepEqual(snapshot.scenarios[name], regenerated, name);
  }
});

test('deterministic report does not require audited commit history', async () => {
  const checkout = await createShallowReportCheckout();

  try {
    assert.equal(
      execFileSync('git', ['-C', checkout.root, 'rev-parse', '--is-shallow-repository'], {
        encoding: 'utf8',
        windowsHide: true,
      }).trim(),
      'true'
    );
    assert.throws(() =>
      execFileSync(
        'git',
        [
          '-C',
          checkout.root,
          'cat-file',
          '-e',
          'ec6afdb4e2494416d985be610837e728a9278a2f^{commit}',
        ],
        { stdio: 'ignore', windowsHide: true }
      )
    );
    const shallowReportModule = await import(
      `${pathToFileURL(path.join(checkout.root, 'scripts/measure-communication-economy.mjs')).href}?shallow`
    );
    const report = await shallowReportModule.buildCommunicationEconomyReport({
      root: checkout.root,
    });

    assert.equal(report.baseline.source_commit, 'ec6afdb4e2494416d985be610837e728a9278a2f');
    assert.equal(report.baseline.visible_output.source, 'source-bound-fixture');
  }
  finally {
    await checkout.cleanup();
  }
});

test('deterministic report rejects corrupt baseline snapshots', async () => {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'sdcorejs-invalid-baseline-'));

  try {
    const fixtureDirectory = path.join(temporaryRoot, 'test/e2e/fixtures');
    await mkdir(fixtureDirectory, { recursive: true });
    const fixturePath = path.join(
      temporaryRoot,
      'test/e2e/fixtures/communication-economy-baseline.json'
    );
    await copyFile(
      scenarioFixtureUrl,
      path.join(fixtureDirectory, 'communication-economy-scenarios.json')
    );
    const original = JSON.parse(await readFile(baselineUrl, 'utf8'));
    const invalidSnapshots = [
      {
        name: 'negative measurement',
        mutate: (fixture) => {
          fixture.visible_output_snapshot.scenarios['direct-review']
            .measurement.utf8_bytes = -1;
        },
      },
      {
        name: 'repeated bytes exceed measured output',
        mutate: (fixture) => {
          const scenario = fixture.visible_output_snapshot.scenarios['direct-review'];
          scenario.repeated_block_bytes = scenario.measurement.utf8_bytes + 1;
        },
      },
      {
        name: 'unsafe source path',
        mutate: (fixture) => {
          fixture.visible_output_snapshot.scenarios['direct-review']
            .source_paths[0] = '../review.md';
        },
      },
      {
        name: 'malformed blob OID',
        mutate: (fixture) => {
          fixture.visible_output_snapshot.scenarios['direct-review']
            .source_blobs[0] = 'not-a-git-oid';
        },
      },
      {
        name: 'unexpected scenario',
        mutate: (fixture) => {
          fixture.visible_output_snapshot.scenarios['unrelated-newest'] =
            structuredClone(fixture.visible_output_snapshot.scenarios['pure-qa']);
        },
      },
      {
        name: 'incomplete progress-rule provenance',
        mutate: (fixture) => {
          delete fixture.visible_output_snapshot.duplicate_progress_rule.blob_oid;
        },
      },
    ];
    const reportModule = await import(reportModuleUrl);

    for (const invalid of invalidSnapshots) {
      const fixture = structuredClone(original);
      invalid.mutate(fixture);
      await writeFile(fixturePath, `${JSON.stringify(fixture, null, 2)}\n`, 'utf8');
      await assert.rejects(
        reportModule.buildCommunicationEconomyReport({ root: temporaryRoot }),
        /baseline visible-output snapshot/i,
        invalid.name
      );
    }
  }
  finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test('runtime policy functions are side-effect free and create no mutable .sdcorejs state', async () => {
  const resolve = requireFunction('resolveCommunicationProfile');
  const shouldEmit = requireFunction('shouldEmitProgress');
  const select = requireFunction('selectRelatedArtifacts');
  const before = await listRelativeFiles(path.join(root, '.sdcorejs'));

  resolve({ message_kind: 'direct-answer' });
  shouldEmit({ event: 'meaningful-outcome', state_changed: true });
  select({ artifacts: [], query: {}, purpose: 'style' });

  const after = await listRelativeFiles(path.join(root, '.sdcorejs'));
  const added = after.filter((item) => !before.includes(item));
  assert.deepEqual(after, before);
  assert.ok(!added.some((item) => /current-session|runtime-context|checkpoint/i.test(item)));
});

function gitFromRoot(args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  }).trim();
}

function extractHistoricalContextSchema(content, contextType, sourcePath) {
  const lines = String(content).split(/\r?\n/);
  const markerIndex = lines.findIndex((line) => line.trim() === `${contextType}:`);
  assert.ok(markerIndex >= 0, `${sourcePath} has a ${contextType} schema marker`);

  let fence = null;
  for (let index = markerIndex - 1; index >= 0; index -= 1) {
    const match = lines[index].trim().match(/^(`{3,})(?:yaml)?$/i);
    if (match) {
      fence = match[1];
      break;
    }
  }
  assert.ok(fence, `${sourcePath} has a fenced ${contextType} schema`);

  const closingIndex = lines.findIndex(
    (line, index) => index > markerIndex && line.trim() === fence
  );
  assert.ok(closingIndex > markerIndex, `${sourcePath} terminates the ${contextType} schema`);
  return lines.slice(markerIndex, closingIndex).join('\n').trim();
}

function renderHistoricalScenarioProjection(projection) {
  return [
    'Scenario result',
    JSON.stringify(projection, null, 2),
  ].join('\n\n');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function createShallowReportCheckout() {
  const temporaryRoot = await mkdtemp(path.join(tmpdir(), 'sdcorejs-communication-economy-'));
  const shallowRoot = path.join(temporaryRoot, 'checkout');
  const gitOptions = { encoding: 'utf8', windowsHide: true };

  try {
    execFileSync('git', ['init', '--quiet', shallowRoot], gitOptions);
    execFileSync(
      'git',
      ['-C', shallowRoot, 'remote', 'add', 'origin', pathToFileURL(root).href],
      gitOptions
    );
    execFileSync(
      'git',
      ['-C', shallowRoot, 'fetch', '--quiet', '--depth', '1', '--no-tags', 'origin', 'HEAD'],
      gitOptions
    );
    execFileSync(
      'git',
      ['-C', shallowRoot, 'checkout', '--quiet', '--detach', 'FETCH_HEAD'],
      gitOptions
    );
    for (const relativePath of [
      'scripts/measure-communication-economy.mjs',
      'test/e2e/fixtures/communication-economy-baseline.json',
    ]) {
      await copyFile(path.join(root, relativePath), path.join(shallowRoot, relativePath));
    }
  }
  catch (error) {
    await rm(temporaryRoot, { recursive: true, force: true });
    throw error;
  }

  return {
    root: shallowRoot,
    cleanup: () => rm(temporaryRoot, { recursive: true, force: true }),
  };
}

async function measurePaths(paths) {
  let utf8Bytes = 0;
  let semanticBytes = 0;
  let lines = 0;
  let words = 0;
  for (const relativePath of paths) {
    const text = await readFile(path.join(root, relativePath), 'utf8');
    utf8Bytes += Buffer.byteLength(text, 'utf8');
    semanticBytes += Buffer.byteLength(text.replace(/\s+/g, ' ').trim(), 'utf8');
    lines += text.length === 0 ? 0 : text.split(/\r?\n/).length;
    words += text.match(/\S+/g)?.length ?? 0;
  }
  return {
    files: paths.length,
    utf8_bytes: utf8Bytes,
    semantic_bytes: semanticBytes,
    lines,
    words,
  };
}

async function listRelativeFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      for (const child of await listRelativeFiles(absolute)) output.push(path.join(entry.name, child));
    } else if (entry.isFile()) {
      output.push(entry.name);
    }
  }
  return output.sort();
}
