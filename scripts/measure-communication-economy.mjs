#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CONSUMER_REQUIRED_FIELD_KINDS,
  CONSUMER_REQUIRED_FIELDS,
  auditRenderedProjection,
  measureRepeatedBlockBytes,
  measureText,
  projectRuntimeContext,
  renderUserProjection,
  resolveCommunicationProfile,
  validateRequiredHandoffFields,
} from '../_refs/harness/communication-economy.mjs';

const modulePath = fileURLToPath(import.meta.url);
const defaultRoot = path.resolve(path.dirname(modulePath), '..');

export async function buildCommunicationEconomyReport({ root = defaultRoot } = {}) {
  const baseline = await readJson(
    path.join(root, 'test/e2e/fixtures/communication-economy-baseline.json')
  );
  const fixture = await readJson(
    path.join(root, 'test/e2e/fixtures/communication-economy-scenarios.json')
  );
  const baselineSnapshot = loadBaselineVisibleOutputSnapshot(
    baseline,
    Object.keys(fixture.scenarios)
  );
  const currentBootstrap = await measurePaths(root, baseline.bootstrap.paths);
  const scenarios = {};

  for (const [name, definition] of Object.entries(fixture.scenarios)) {
    const resolved = resolveCommunicationProfile({
      explicit_profile: definition.explicit_profile,
      message_kind: definition.message_kind,
    });
    const contracts = definition.context_contracts.map((contract) => {
      const context = syntheticContext(contract.context_type, contract.consumer);
      return { ...contract, context };
    });
    const validationErrors = contracts.flatMap(({ context_type, consumer, context }) =>
      validateRequiredHandoffFields({
        contextType: context_type,
        consumer,
        context,
      })
    );
    const required = contracts.reduce(
      (total, contract) =>
        total + CONSUMER_REQUIRED_FIELDS[contract.context_type][contract.consumer].length,
      0
    );
    const projections = contracts.map(({ context_type, consumer, context }) =>
      projectRuntimeContext({
        contextType: context_type,
        context,
        consumer,
        capabilityStatus: definition.capability_status,
        projection: definition.projection,
        profile: resolved.profile,
        nextAction: consumer,
        currentHeadOrDiff: 'ec6afdb4e2494416d985be610837e728a9278a2f',
        artifactRefs: ['artifact:communication-economy#sha256:artifact'],
        evidenceRefs: ['test:e2e:communication-economy#exit:0'],
        redactionApplied: false,
      })
    );
    const currentFinal = renderUserProjection(definition.projection, {
      profile: resolved.profile,
    });
    const baselineScenario = loadBaselineScenarioSnapshot(baselineSnapshot, name);
    const currentMessages = name === 'pure-qa'
      ? [currentFinal]
      : [`Progress changed for scenario \`${name}\`.`, currentFinal];
    const currentVisible = currentMessages.join('\n\n');
    const currentJit = await measurePaths(root, definition.current_jit_paths);
    const baselineJit = baseline.jit_scenarios[name];
    const portableBytes = projections
      .filter((projection) => projection.portable_handoff)
      .reduce(
        (total, projection) =>
          total + Buffer.byteLength(JSON.stringify(projection.portable_handoff), 'utf8'),
        0
      );
    const runtimeContextChannelBytes = projections
      .filter((projection) => projection.handoff_mode === 'runtime-context-channel')
      .reduce(
        (total, projection) =>
          total + Buffer.byteLength(JSON.stringify(projection.authoritative_context), 'utf8'),
        0
      );
    const renderedSemanticCoverage = auditRenderedProjection({
      projection: definition.projection,
      rendered: currentFinal,
      profile: resolved.profile,
    });
    const profileAudits = Object.fromEntries(
      ['compact', 'standard', 'detailed'].map((candidateProfile) => {
        const rendered = renderUserProjection(definition.projection, { profile: candidateProfile });
        return [
          candidateProfile,
          auditRenderedProjection({
            projection: definition.projection,
            rendered,
            profile: candidateProfile,
            commonOnly: true,
          }),
        ];
      })
    );
    const profileSemanticParity = Object.values(profileAudits)
      .every((audit) => audit.parity);

    scenarios[name] = {
      profile: resolved.profile,
      profile_reason: resolved.reason,
      handoff_mode: projections[0]?.handoff_mode ?? 'none',
      jit_context: {
        baseline: baselineJit,
        current: currentJit,
        selected_paths: definition.current_jit_paths,
      },
      visible_output: {
        baseline: baselineScenario.measurement,
        current: measureText(currentVisible),
        baseline_source_paths: baselineScenario.source_paths,
        baseline_source_blobs: baselineScenario.source_blobs,
        observed_live: false,
      },
      repeated_block_bytes: {
        baseline: baselineScenario.repeated_block_bytes,
        current: measureRepeatedBlockBytes(currentMessages),
      },
      portable_handoff_utf8_bytes: portableBytes,
      runtime_context_channel_utf8_bytes: runtimeContextChannelBytes,
      authoritative_field_coverage: {
        required,
        preserved: validationErrors.length === 0 ? required : required - validationErrors.length,
        missing: validationErrors,
      },
      rendered_semantic_coverage: renderedSemanticCoverage,
      profile_semantic_parity: profileSemanticParity,
      profile_semantic_audits: profileAudits,
      semantic_parity: renderedSemanticCoverage.parity && profileSemanticParity,
    };
  }

  const aggregate = aggregateScenarios(scenarios);
  aggregate.baseline_total_communication_utf8_bytes =
    baseline.bootstrap.utf8_bytes +
    aggregate.baseline_jit_utf8_bytes +
    aggregate.baseline_visible_utf8_bytes;
  aggregate.current_total_communication_utf8_bytes =
    currentBootstrap.utf8_bytes +
    aggregate.current_jit_utf8_bytes +
    aggregate.current_visible_utf8_bytes +
    aggregate.current_portable_handoff_utf8_bytes +
    aggregate.current_runtime_context_channel_utf8_bytes;

  return {
    schema_version: 1,
    measurement_kind: 'deterministic-source-bound-contract-projection',
    source: {
      current_HEAD: git(root, ['rev-parse', 'HEAD']),
      working_tree_dirty: git(root, ['status', '--short']).length > 0,
    },
    baseline: {
      source_commit: baseline.source_commit,
      fixture: 'test/e2e/fixtures/communication-economy-baseline.json',
      visible_output: {
        ...baseline.visible_output_basis,
        duplicate_progress_rule: baselineSnapshot.duplicate_progress_rule,
      },
    },
    tokenizer: {
      status: 'unavailable',
      reason: 'The repository has no tokenizer dependency; the report records UTF-8 bytes, semantic bytes, lines, and words without inventing token counts.',
    },
    bootstrap: {
      baseline: baseline.bootstrap,
      current: currentBootstrap,
    },
    scenarios,
    aggregate,
    duplication_pairs: buildDuplicationPairs(),
    duplication_pair_basis: {
      observed_live: false,
      method: 'Sanitized deterministic contract-pair fixtures; use live A/B transcripts for provider token claims.',
    },
    broad_read_audit: {
      replaced: baseline.confirmed_broad_reads,
      retained_for_correctness: [
        'Every file inside an explicitly selected review scope.',
        'Explicit release range, latest tag, and changelog ordering for release artifacts.',
        'Version-aware Core UI documentation fallback.',
        'Recently changed executable source as an explicit simplify scope.',
      ],
    },
    live_ab_eval: {
      status: 'skipped',
      reason: 'The deterministic suite does not invoke a credentialed live agent CLI or claim usage telemetry without a trusted isolated run and actual usage reporting.',
    },
  };
}

function buildDuplicationPairs() {
  const specBody = [
    'Approved specification body',
    'Contract: communication-economy',
    'AC-001: Preserve approval, security, verification, and artifact closure.',
    'Non-goal: Do not create a runtime server or a new workflow gate.',
  ].join('\n');
  const planBody = [
    'Approved plan body',
    'Edit `_refs/harness/runtime-policy.mjs`.',
    'Run `npm run test:e2e:communication-economy`.',
    'Preserve `approved_spec_hash: sha256:spec`.',
  ].join('\n');
  const identityBlock = [
    'contract_id: communication-economy',
    'approved_spec_hash: sha256:spec',
    'approved_plan_hash: sha256:plan',
    'current_HEAD_or_diff: sha256:diff',
  ].join('\n');
  const finalBlock = [
    'The change is verified.',
    'npm run test:e2e:communication-economy',
    'exit_code: 0',
    'status: pass',
  ].join('\n');

  return {
    'spec-plan': measureDuplicationPair(
      [
        `Specification\n\n${specBody}`,
        `Plan repeats specification\n\n${specBody}\n\nImplementation order: phase 1.`,
      ],
      [
        'Specification artifact: `.sdcorejs/specs/workflow/communication-economy.md#sha256:spec`.',
        'Plan delta: edit the harness policy, then run the declared verification.',
      ]
    ),
    'plan-execution': measureDuplicationPair(
      [
        `Plan\n\n${planBody}`,
        `Execution handoff repeats plan\n\n${planBody}\n\nStatus: ready.`,
      ],
      [
        'Plan reference: `.sdcorejs/plans/workflow/communication-economy.md#sha256:plan`.',
        'Execution delta: task `phase-1` completed; next consumer `sdcorejs-test`.',
      ]
    ),
    'execution-test-review-ship': measureDuplicationPair(
      [
        `Execution context\n\n${identityBlock}`,
        `Test context\n\n${identityBlock}`,
        `Review context\n\n${identityBlock}`,
        `Ship context\n\n${identityBlock}`,
      ],
      [
        'Execution reference: `context:execution#sha256:diff`.',
        'Test evidence reference: `test:e2e:communication-economy#exit:0`.',
        'Review finding reference: `review:R1#resolved`.',
        'Ship closure reference: `artifact:communication-economy#closed`.',
      ]
    ),
    'progress-final': measureDuplicationPair(
      [finalBlock, finalBlock],
      ['Verification phase completed.', finalBlock]
    ),
  };
}

function measureDuplicationPair(baselineMessages, currentMessages) {
  const baselineText = baselineMessages.join('\n\n');
  const currentText = currentMessages.join('\n\n');
  const baselineRepeated = measureRepeatedBlockBytes(baselineMessages);
  const currentRepeated = measureRepeatedBlockBytes(currentMessages);
  const baselineBytes = measureText(baselineText).utf8_bytes;
  const currentBytes = measureText(currentText).utf8_bytes;
  return {
    baseline: {
      total_utf8_bytes: baselineBytes,
      repeated_block_bytes: baselineRepeated,
      repeated_ratio: baselineBytes === 0 ? 0 : baselineRepeated / baselineBytes,
    },
    current: {
      total_utf8_bytes: currentBytes,
      repeated_block_bytes: currentRepeated,
      repeated_ratio: currentBytes === 0 ? 0 : currentRepeated / currentBytes,
    },
  };
}

function aggregateScenarios(scenarios) {
  const values = Object.values(scenarios);
  return {
    baseline_jit_utf8_bytes: sum(values, (item) => item.jit_context.baseline.utf8_bytes),
    current_jit_utf8_bytes: sum(values, (item) => item.jit_context.current.utf8_bytes),
    baseline_visible_utf8_bytes: sum(values, (item) => item.visible_output.baseline.utf8_bytes),
    current_visible_utf8_bytes: sum(values, (item) => item.visible_output.current.utf8_bytes),
    baseline_visible_words: sum(values, (item) => item.visible_output.baseline.words),
    current_visible_words: sum(values, (item) => item.visible_output.current.words),
    baseline_repeated_block_bytes: sum(values, (item) => item.repeated_block_bytes.baseline),
    current_repeated_block_bytes: sum(values, (item) => item.repeated_block_bytes.current),
    current_portable_handoff_utf8_bytes: sum(
      values,
      (item) => item.portable_handoff_utf8_bytes
    ),
    current_runtime_context_channel_utf8_bytes: sum(
      values,
      (item) => item.runtime_context_channel_utf8_bytes
    ),
    required_fields: sum(values, (item) => item.authoritative_field_coverage.required),
    preserved_fields: sum(values, (item) => item.authoritative_field_coverage.preserved),
  };
}

async function measurePaths(root, relativePaths) {
  const result = {
    files: relativePaths.length,
    utf8_bytes: 0,
    semantic_bytes: 0,
    lines: 0,
    words: 0,
  };
  for (const relativePath of relativePaths) {
    const text = await readFile(path.join(root, ...relativePath.split('/')), 'utf8');
    const measured = measureText(text);
    result.utf8_bytes += measured.utf8_bytes;
    result.semantic_bytes += measured.semantic_bytes;
    result.lines += measured.lines;
    result.words += measured.words;
  }
  return result;
}

function syntheticContext(contextType, consumer) {
  const context = {};
  for (const field of CONSUMER_REQUIRED_FIELDS[contextType][consumer]) {
    setPath(context, field, syntheticValue(contextType, field));
  }
  return context;
}

function loadBaselineVisibleOutputSnapshot(baseline, expectedScenarioNames) {
  const errorPrefix = 'Baseline visible-output snapshot';
  const snapshot = baseline.visible_output_snapshot;
  if (!isRecord(snapshot) || snapshot.source_commit !== baseline.source_commit) {
    throw new Error(`${errorPrefix} must match source_commit`);
  }
  if (!/^[0-9a-f]{40}$/.test(snapshot.source_commit)) {
    throw new Error(`${errorPrefix} has an invalid source_commit`);
  }
  if (!isRecord(snapshot.duplicate_progress_rule) || !isRecord(snapshot.scenarios)) {
    throw new Error(`${errorPrefix} is incomplete`);
  }

  validateSourceReference(
    snapshot.duplicate_progress_rule.path,
    snapshot.duplicate_progress_rule.blob_oid,
    `${errorPrefix} duplicate progress rule`
  );
  if (
    typeof snapshot.duplicate_progress_rule.rule !== 'string' ||
    snapshot.duplicate_progress_rule.rule.trim().length === 0
  ) {
    throw new Error(`${errorPrefix} duplicate progress rule is empty`);
  }

  const actualScenarioNames = Object.keys(snapshot.scenarios).sort();
  const expectedNames = [...expectedScenarioNames].sort();
  if (
    actualScenarioNames.length !== expectedNames.length ||
    actualScenarioNames.some((name, index) => name !== expectedNames[index])
  ) {
    throw new Error(`${errorPrefix} scenario coverage does not match the scenario fixture`);
  }

  for (const name of expectedNames) {
    validateBaselineScenarioSnapshot(snapshot.scenarios[name], name);
  }
  return snapshot;
}

function loadBaselineScenarioSnapshot(snapshot, name) {
  const scenario = snapshot.scenarios[name];
  if (!isRecord(scenario)) {
    throw new Error(`Baseline visible-output snapshot has no scenario ${name}`);
  }
  return scenario;
}

function validateBaselineScenarioSnapshot(scenario, name) {
  const errorPrefix = `Baseline visible-output snapshot is invalid for scenario ${name}`;
  if (
    !isRecord(scenario) ||
    !isRecord(scenario.measurement) ||
    !Array.isArray(scenario.source_paths) ||
    !Array.isArray(scenario.source_blobs) ||
    scenario.source_paths.length !== scenario.source_blobs.length
  ) {
    throw new Error(errorPrefix);
  }

  const measurementFields = ['lines', 'semantic_bytes', 'utf8_bytes', 'words'];
  const actualMeasurementFields = Object.keys(scenario.measurement).sort();
  if (
    actualMeasurementFields.length !== measurementFields.length ||
    actualMeasurementFields.some(
      (field, index) => field !== measurementFields[index]
    )
  ) {
    throw new Error(`${errorPrefix}: measurement fields do not match the schema`);
  }
  for (const field of measurementFields) {
    validateNonNegativeInteger(scenario.measurement[field], `${errorPrefix}: ${field}`);
  }
  if (scenario.measurement.semantic_bytes > scenario.measurement.utf8_bytes) {
    throw new Error(`${errorPrefix}: semantic_bytes exceeds utf8_bytes`);
  }

  validateNonNegativeInteger(
    scenario.repeated_block_bytes,
    `${errorPrefix}: repeated_block_bytes`
  );
  if (scenario.repeated_block_bytes > scenario.measurement.utf8_bytes) {
    throw new Error(`${errorPrefix}: repeated_block_bytes exceeds utf8_bytes`);
  }

  for (let index = 0; index < scenario.source_paths.length; index += 1) {
    validateSourceReference(
      scenario.source_paths[index],
      scenario.source_blobs[index],
      `${errorPrefix}: source ${index}`
    );
  }
}

function validateSourceReference(sourcePath, blobOid, label) {
  if (
    typeof sourcePath !== 'string' ||
    sourcePath.length === 0 ||
    sourcePath.includes('\\') ||
    sourcePath.startsWith('/') ||
    /^[A-Za-z]:\//.test(sourcePath) ||
    path.posix.normalize(sourcePath) !== sourcePath ||
    sourcePath.split('/').some((segment) => segment === '.' || segment === '..')
  ) {
    throw new Error(`${label} has an unsafe source path`);
  }
  if (typeof blobOid !== 'string' || !/^[0-9a-f]{40}$/.test(blobOid)) {
    throw new Error(`${label} has an invalid blob OID`);
  }
}

function validateNonNegativeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer`);
  }
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function syntheticValue(contextType, field) {
  const name = field.split('.').at(-1);
  const kind = CONSUMER_REQUIRED_FIELD_KINDS[contextType]?.[field] ?? 'scalar';
  if (name === 'schema_version') return 2;
  if (field === 'approval') {
    return {
      approved: true,
      approved_at: '2026-07-28T00:00:00.000Z',
      approval_source: 'explicit-user-choice',
    };
  }
  if (contextType === 'test_status' || (contextType === 'test_evidence' && field.startsWith('status.'))) {
    const statuses = {
      planning: 'approved',
      authoring: 'existing',
      executability: 'ready',
      execution: 'executed',
      result: 'pass',
      evidence: 'current',
      documentation: 'verified',
      blockers: [],
    };
    return statuses[name];
  }
  if (contextType === 'test_evidence') {
    if (field === 'runs') {
      return [{
        run_id: 'run-fixture',
        command: 'npm run test:e2e:communication-economy',
        cwd: 'C:/repo',
        exit_code: 0,
        output_digest: 'sha256:test-output',
        redactions_applied: true,
        stale: false,
        interrupted: false,
      }];
    }
    if (['cases', 'captures', 'commands_skipped', 'blockers', 'residual_risks'].includes(field)) {
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
          exact_scope: 'Run deterministic communication-economy coverage.',
          approved_plan_slice: 'Task 6.1',
          out_of_scope: [],
        },
        verification: {
          command: 'npm run test:e2e:communication-economy',
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
          changed_paths: ['test/e2e/communication-economy.test.mjs'],
          exit_code: 0,
          output_digest: 'sha256:unit-output',
          blockers: [],
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
  if (kind === 'array') return [`<${field}>`];
  if (kind === 'object') return { fixture_value: `<${field}>` };
  if (kind === 'number') return 1;
  if (kind === 'boolean') return true;
  if (/hash|fingerprint/i.test(name)) return 'sha256:0123456789abcdef';
  if (/HEAD/.test(name)) return 'ec6afdb4e2494416d985be610837e728a9278a2f';
  if (/path|root/i.test(name)) return '_refs/harness/communication-economy.md';
  if (/approved|required|dirty|redaction/i.test(name)) return false;
  if (/commands|files|paths|refs|findings|risks|assumptions|criteria|scope|tasks|artifacts|changes|evidence|probes|profiles|surfaces|passes/i.test(name)) {
    return [`<${field}>`];
  }
  if (name === 'verification') {
    return {
      commands_run: [{
        command: 'npm run test:e2e:communication-economy',
        exit_code: 0,
        status: 'pass',
      }],
      commands_skipped: [],
      result: 'PASS',
    };
  }
  return `<${field}>`;
}

function setPath(target, dottedPath, value) {
  const parts = dottedPath.split('.');
  let cursor = target;
  for (const part of parts.slice(0, -1)) {
    cursor[part] ??= {};
    cursor = cursor[part];
  }
  cursor[parts.at(-1)] = value;
}

function sum(values, selector) {
  return values.reduce((total, value) => total + selector(value), 0);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function git(root, args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    windowsHide: true,
  }).trim();
}

if (process.argv[1] && path.resolve(process.argv[1]) === modulePath) {
  const report = await buildCommunicationEconomyReport();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
