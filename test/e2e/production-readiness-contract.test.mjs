import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(repoRoot, relativePath), 'utf8'));
}

async function importRepoModule(relativePath) {
  return import(pathToFileURL(path.join(repoRoot, relativePath)).href);
}

function baseArtifact(overrides = {}) {
  return {
    schema_version: 1,
    artifact_id: 'plan-contract-a-r1',
    artifact_kind: 'plan',
    contract_id: 'contract-a',
    requirement_id: 'requirement-a',
    change_ref: 'change-a',
    track: 'ai-agent',
    stack_profile: 'ai-agent',
    owner_repository_id: 'github.com/sdcorejs/module-a',
    owner_repository_role: 'module',
    owner_module_id: 'module-a',
    repository_relative_path: '.sdcorejs/plans/ai-agent/contract-a.md',
    source_revision: 'a'.repeat(40),
    parent_repository_id: 'github.com/sdcorejs/portal',
    parent_references: [
      {
        repository_id: 'github.com/sdcorejs/portal',
        artifact_id: 'spec-contract-a-r1',
        artifact_kind: 'spec',
        revision: 'b'.repeat(40),
        approval_hash: `sha256:v1:${'c'.repeat(64)}`,
      },
    ],
    supersedes: null,
    approval_source: 'explicit-user-choice',
    approved_at: '2026-07-31T12:00:00.000Z',
    approved_by: null,
    ...overrides,
  };
}

test('central registry is the versioned source of truth for tracks, profiles, repositories, and evidence', async () => {
  const registry = await readJson('_refs/shared/system-registry.json');
  assert.equal(registry.schema_version, 1);
  assert.deepEqual(
    registry.tracks.map(({ id }) => id).sort(),
    [
      'ai-agent',
      'angular',
      'design',
      'documentation',
      'fullstack',
      'general',
      'nestjs',
      'nextjs',
      'node',
      'product',
      'react',
      'test',
      'workflow',
    ],
  );
  assert.equal(registry.aliases.generic, 'general');
  assert.ok(registry.stack_profiles.some(({ id }) => id === 'technical-prototype'));
  for (const profile of ['node-esm', 'markdown-skill-pack', 'astro-site']) {
    assert.ok(
      registry.stack_profiles.some(({ id }) => id === profile),
      `central registry contains the repository profile ${profile}`,
    );
  }
  assert.ok(registry.artifact_kinds.includes('spec'));
  assert.ok(registry.artifact_kinds.includes('plan'));
  assert.ok(registry.repository_roles.includes('portal'));
  assert.ok(registry.repository_roles.includes('module'));
  assert.deepEqual(
    registry.evidence_classes,
    ['UNIT', 'GOLDEN', 'CONTAINER', 'FULL_E2E', 'LIVE_AGENT', 'SUPPLEMENTAL_SMOKE'],
  );
  for (const track of registry.tracks) {
    assert.equal(typeof track.executor, 'string');
    assert.equal(typeof track.review_profile, 'string');
    assert.equal(typeof track.repair_supported, 'boolean');
    assert.equal(typeof track.ship_supported, 'boolean');
  }
});

test('entrypoint routing and adapter manifests consume the central registry without stale enums', async () => {
  const registry = await readJson('_refs/shared/system-registry.json');
  const { resolveTrack, validateSystemRegistry } = await importRepoModule(
    '_refs/shared/system-registry.mjs',
  );
  assert.deepEqual(validateSystemRegistry(registry), []);
  assert.equal(resolveTrack('generic').id, 'general');
  assert.equal(resolveTrack('unknown-stack').executor, 'sdcorejs-execute-plan');

  const usingSkills = await readFile(
    path.join(repoRoot, 'skills/orchestration/using-skills.md'),
    'utf8',
  );
  assert.match(usingSkills, /_refs\/shared\/system-registry\.json/u);
  assert.match(usingSkills, /artifact owner/iu);
  assert.match(usingSkills, /execution host/iu);
  assert.match(usingSkills, /Never infer artifact ownership from the current working directory/iu);

  const sourceSkills = [];
  for (const relativePath of [
    'skills/orchestration/using-skills.md',
    'skills/shared/sdlc/01-brainstorming.md',
    'skills/shared/sdlc/02-spec.md',
    'skills/shared/sdlc/03-plan.md',
    'skills/shared/sdlc/04-execute-plan.md',
    'skills/orchestration/parallel-dispatch.md',
    'skills/shared/workflow/explore.md',
    'skills/orchestration/documentation.md',
    'skills/tracks/product/sdcorejs-product.md',
    'skills/tracks/design/sdcorejs-design.md',
    'skills/tracks/ai-agent/sdcorejs-ai-agent.md',
    'skills/tracks/angular/sdcorejs-angular.md',
    'skills/tracks/nestjs/sdcorejs-nestjs.md',
    'skills/tracks/nextjs/sdcorejs-nextjs.md',
    'skills/tracks/test/sdcorejs-test.md',
    'skills/shared/workflow/debug.md',
    'skills/orchestration/repair-loop.md',
    'skills/shared/workflow/review.md',
    'skills/shared/workflow/simplify.md',
    'skills/shared/workflow/git.md',
    'skills/shared/workflow/ship.md',
  ]) {
    const text = await readFile(path.join(repoRoot, relativePath), 'utf8');
    const name = text.match(/^name:\s*(\S+)/mu)?.[1];
    assert.ok(name, `${relativePath} has a skill name`);
    sourceSkills.push(name);
  }
  assert.equal(new Set(sourceSkills).size, 21);

  const expectedRegistryHash = `sha256:${registry.registry_hash_input ?? ''}`;
  for (const relativePath of [
    '.claude/sdcorejs-harness.json',
    'plugin/sdcorejs-harness.json',
    'codex/sdcorejs-harness.json',
    '.cursor/sdcorejs-harness.json',
    '.github/sdcorejs-harness.json',
  ]) {
    const manifest = await readJson(relativePath);
    assert.equal(manifest.system_registry.source_path, '_refs/shared/system-registry.json');
    assert.match(manifest.system_registry.source_hash, /^sha256:[a-f0-9]{64}$/u);
    assert.notEqual(manifest.system_registry.source_hash, expectedRegistryHash);
    assert.deepEqual(manifest.system_registry.tracks, registry.tracks.map(({ id }) => id));
    assert.deepEqual(manifest.system_registry.aliases, registry.aliases);
  }
});

test('approved artifacts create and verify deterministic protected hashes', async () => {
  const {
    APPROVAL_ALGORITHM,
    createApprovedArtifact,
    verifyApprovedArtifact,
  } = await importRepoModule('_refs/shared/approved-artifact.mjs');
  const first = createApprovedArtifact({
    metadata: baseArtifact(),
    body: '# Approved plan\r\n\r\nExecute module A.\r\n',
  });
  const second = createApprovedArtifact({
    metadata: Object.fromEntries(Object.entries(baseArtifact()).reverse()),
    body: '# Approved plan\n\nExecute module A.\n',
  });
  assert.equal(APPROVAL_ALGORITHM, 'sha256:v1');
  assert.equal(first.metadata.approval_hash, second.metadata.approval_hash);
  assert.equal(verifyApprovedArtifact(first).valid, true);
});

test('approved artifact verification rejects every protected identity mutation', async () => {
  const { createApprovedArtifact, verifyApprovedArtifact } = await importRepoModule(
    '_refs/shared/approved-artifact.mjs',
  );
  const artifact = createApprovedArtifact({ metadata: baseArtifact(), body: 'Approved body.\n' });
  const mutations = [
    ['body', 'Mutated body.\n'],
    ['artifact_id', 'plan-contract-a-r2'],
    ['contract_id', 'contract-b'],
    ['requirement_id', 'requirement-b'],
    ['track', 'nestjs'],
    ['owner_repository_id', 'github.com/sdcorejs/module-b'],
    ['repository_relative_path', '.sdcorejs/plans/ai-agent/other.md'],
    ['source_revision', 'e'.repeat(40)],
    ['supersedes', 'plan-contract-a-r0'],
    ['approved_at', '2026-07-31T12:01:00.000Z'],
    ['approved_by', 'different-approver'],
    [
      'parent_references',
      artifact.metadata.parent_references.map((reference) => ({
        ...reference,
        revision: 'd'.repeat(40),
      })),
    ],
  ];
  for (const [field, value] of mutations) {
    const candidate = structuredClone(artifact);
    if (field === 'body') candidate.body = value;
    else candidate.metadata[field] = value;
    assert.throws(
      () => verifyApprovedArtifact(candidate),
      /approval hash mismatch/iu,
      `${field} mutation should fail`,
    );
  }
});

test('approved artifact CLI creates and verifies specs and fails non-zero after mutation', async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'sdcorejs-approved-artifact-'));
  const inputPath = path.join(tempRoot, 'input.json');
  const artifactPath = path.join(tempRoot, 'approved.json');
  const input = {
    metadata: baseArtifact({
      artifact_id: 'spec-contract-a-r1',
      artifact_kind: 'spec',
      repository_relative_path: '.sdcorejs/specs/ai-agent/contract-a.md',
    }),
    body: '# Approved spec\n\nObservable behavior.\n',
  };
  await writeFile(inputPath, `${JSON.stringify(input)}\n`, 'utf8');
  const helperPath = path.join(repoRoot, '_refs/shared/approved-artifact.mjs');
  const created = spawnSync(
    process.execPath,
    [helperPath, 'create', '--input', inputPath, '--output', artifactPath],
    { encoding: 'utf8' },
  );
  assert.equal(created.status, 0, created.stderr);
  const verified = spawnSync(
    process.execPath,
    [helperPath, 'verify', '--input', artifactPath],
    { encoding: 'utf8' },
  );
  assert.equal(verified.status, 0, verified.stderr);
  assert.match(verified.stdout, /"valid":true/u);

  const artifact = JSON.parse(await readFile(artifactPath, 'utf8'));
  artifact.body = `${artifact.body}\nmutated`;
  await writeFile(artifactPath, `${JSON.stringify(artifact)}\n`, 'utf8');
  const rejected = spawnSync(
    process.execPath,
    [helperPath, 'verify', '--input', artifactPath],
    { encoding: 'utf8' },
  );
  assert.notEqual(rejected.status, 0);
  assert.match(rejected.stderr, /approval hash mismatch/iu);
});

test('spec gate uses the executable approval helper and semantic owner repository', async () => {
  const [registry, spec] = await Promise.all([
    readJson('_refs/shared/system-registry.json'),
    readFile(path.join(repoRoot, 'skills/shared/sdlc/02-spec.md'), 'utf8'),
  ]);
  const { createApprovedArtifact, verifyApprovedArtifact } = await importRepoModule(
    '_refs/shared/approved-artifact.mjs',
  );
  for (const { id: track } of registry.tracks) {
    const artifact = createApprovedArtifact({
      metadata: baseArtifact({
        artifact_id: `spec-${track}-r1`,
        artifact_kind: 'spec',
        track,
        stack_profile: 'general',
        repository_relative_path: `.sdcorejs/specs/${track}/contract-a.md`,
      }),
      body: `# ${track} approved spec\n`,
    });
    assert.equal(verifyApprovedArtifact(artifact).valid, true, `${track} spec verifies`);
  }
  for (const field of [
    'artifact_id',
    'artifact_kind',
    'schema_version',
    'contract_id',
    'requirement_id',
    'change_ref',
    'track',
    'stack_profile',
    'owner_repository_id',
    'owner_repository_role',
    'owner_module_id',
    'repository_relative_path',
    'source_revision',
    'supersedes',
    'approval_source',
    'approved_at',
    'approved_by',
    'approval_hash',
  ]) {
    assert.match(spec, new RegExp(`\\b${field}\\b`, 'u'), `approved spec carries ${field}`);
  }
  assert.match(spec, /_refs\/shared\/approved-artifact\.mjs/u);
  assert.match(spec, /semantic owner repository/iu);
  assert.match(spec, /authoring repo.*explicit/isu);
  assert.match(spec, /Silence is not approval/iu);
  assert.match(spec, /supersedes/iu);
  assert.match(spec, /portal index.*durable\s+reference/isu);
  assert.match(spec, /Do not\s+write.*module spec.*portal|Copy a full module spec.*portal/isu);
  assert.doesNotMatch(spec, /never in the `sdcorejs-agent` repo/iu);
});

test('approved plans verify their exact approved-spec parent and every registry track', async () => {
  const registry = await readJson('_refs/shared/system-registry.json');
  const {
    createApprovedArtifact,
    verifyApprovedArtifactGraph,
  } = await importRepoModule('_refs/shared/approved-artifact.mjs');
  const spec = createApprovedArtifact({
    metadata: baseArtifact({
      artifact_id: 'spec-contract-a-r1',
      artifact_kind: 'spec',
      repository_relative_path: '.sdcorejs/specs/general/contract-a.md',
      source_revision: 'b'.repeat(40),
      parent_repository_id: null,
      parent_references: [],
    }),
    body: '# Approved spec\n',
  });
  for (const { id: track } of registry.tracks) {
    const plan = createApprovedArtifact({
      metadata: baseArtifact({
        artifact_id: `plan-${track}-r1`,
        artifact_kind: 'plan',
        track,
        stack_profile: 'general',
        repository_relative_path: `.sdcorejs/plans/${track}/contract-a.md`,
        parent_references: [
          {
            repository_id: spec.metadata.owner_repository_id,
            artifact_id: spec.metadata.artifact_id,
            artifact_kind: spec.metadata.artifact_kind,
            revision: spec.metadata.source_revision,
            approval_hash: spec.metadata.approval_hash,
          },
        ],
      }),
      body: `# ${track} approved plan\n`,
    });
    assert.equal(
      verifyApprovedArtifactGraph(plan, [spec]).valid,
      true,
      `${track} plan verifies against its spec`,
    );
  }
  const planWithStaleSpecHash = createApprovedArtifact({
    metadata: baseArtifact({
      parent_references: [
        {
          repository_id: spec.metadata.owner_repository_id,
          artifact_id: spec.metadata.artifact_id,
          artifact_kind: spec.metadata.artifact_kind,
          revision: spec.metadata.source_revision,
          approval_hash: `sha256:v1:${'f'.repeat(64)}`,
        },
      ],
    }),
    body: '# Plan with stale spec hash\n',
  });
  assert.throws(
    () => verifyApprovedArtifactGraph(planWithStaleSpecHash, [spec]),
    /parent reference.*hash/iu,
  );
});

test('multi-repository plan splitting rejects steps spanning Git roots', async () => {
  const {
    splitRepositoryPlan,
    validateRepositoryPlan,
  } = await importRepoModule('_refs/shared/repository-contract.mjs');
  const plan = {
    schema_version: 1,
    integration_owner_repository_id: 'github.com/sdcorejs/portal',
    gitlink_updates_in_scope: false,
    dependency_order: ['module-a', 'portal'],
    repositories: [
      {
        repository_id: 'github.com/sdcorejs/module-a',
        role: 'module',
        module_id: 'module-a',
      },
      {
        repository_id: 'github.com/sdcorejs/portal',
        role: 'portal',
        module_id: null,
      },
    ],
    steps: [
      {
        id: 'module-a-implementation',
        action: 'EDIT',
        semantic_scope: 'module',
        owner_repository_id: 'github.com/sdcorejs/module-a',
        git_roots: ['github.com/sdcorejs/module-a'],
        allowed_paths: ['src/orders/**'],
        prohibited_paths: ['.env'],
        depends_on: [],
      },
      {
        id: 'portal-composition',
        action: 'EDIT',
        semantic_scope: 'portal-composition',
        owner_repository_id: 'github.com/sdcorejs/portal',
        git_roots: ['github.com/sdcorejs/portal'],
        allowed_paths: ['src/app.routes.ts'],
        prohibited_paths: ['modules/module-a/src/**'],
        depends_on: ['module-a-implementation'],
      },
    ],
  };
  assert.deepEqual(validateRepositoryPlan(plan), []);
  const split = splitRepositoryPlan(plan);
  assert.deepEqual(
    split.repository_plans.map(({ repository_id }) => repository_id),
    ['github.com/sdcorejs/module-a', 'github.com/sdcorejs/portal'],
  );
  assert.equal(split.repository_plans[0].steps[0].id, 'module-a-implementation');
  assert.equal(split.parent_integration_plan.repository_id, 'github.com/sdcorejs/portal');

  const invalid = structuredClone(plan);
  invalid.steps[0].git_roots.push('github.com/sdcorejs/portal');
  assert.ok(validateRepositoryPlan(invalid).some((error) => /one Git root/iu.test(error)));
  assert.throws(() => splitRepositoryPlan(invalid), /one Git root/iu);
});

test('plan skill preserves shared artifact identity and repository-local boundaries', async () => {
  const [plan, approvalRef] = await Promise.all([
    readFile(path.join(repoRoot, 'skills/shared/sdlc/03-plan.md'), 'utf8'),
    readFile(path.join(repoRoot, '_refs/sdlc/plan-approval-artifact.md'), 'utf8'),
  ]);
  const combined = `${plan}\n${approvalRef}`;
  for (const field of [
    'contract_id',
    'requirement_id',
    'approved_spec_reference',
    'approved_spec_hash',
    'approved_plan_hash',
    'owner_repository_id',
    'repository_relative_path',
    'allowed_paths',
    'prohibited_paths',
    'dependency_changes',
    'env_changes',
    'migration_changes',
    'verification_strategy',
    'execution_host_repository_id',
    'integration_owner_repository_id',
    'dependency_order',
    'gitlink_updates_in_scope',
  ]) {
    assert.match(combined, new RegExp(`\\b${field}\\b`, 'u'), `plan contract carries ${field}`);
  }
  assert.match(combined, /_refs\/shared\/approved-artifact\.mjs/u);
  assert.match(combined, /_refs\/shared\/system-registry\.json/u);
  assert.match(combined, /one Git root/iu);
  assert.match(combined, /test.*before.*production code/isu);
  assert.match(combined, /module-owned plan.*portal/isu);
  assert.doesNotMatch(
    approvalRef,
    /track:\s*<angular\|nestjs\|nextjs\|test\|product\|generic>/u,
  );
});

test('execute-plan verifies artifacts, source freshness, owner root, and path scope before writes', async () => {
  const {
    authorizePlanWrite,
    evaluateWorkingTree,
    prepareExecution,
    resolveExecutionTarget,
  } = await importRepoModule('_refs/orchestration/execution-contract.mjs');
  const { createApprovedArtifact } = await importRepoModule(
    '_refs/shared/approved-artifact.mjs',
  );
  const spec = createApprovedArtifact({
    metadata: baseArtifact({
      artifact_id: 'spec-contract-a-r1',
      artifact_kind: 'spec',
      repository_relative_path: '.sdcorejs/specs/angular/contract-a.md',
      source_revision: 'b'.repeat(40),
      parent_repository_id: null,
      parent_references: [],
    }),
    body: '# Approved spec\n',
  });
  const planArtifact = createApprovedArtifact({
    metadata: baseArtifact({
      artifact_id: 'plan-contract-a-r1',
      artifact_kind: 'plan',
      track: 'angular',
      stack_profile: 'plain-angular',
      repository_relative_path: '.sdcorejs/plans/angular/contract-a.md',
      source_revision: 'c'.repeat(40),
      allowed_paths: ['src/orders/**'],
      prohibited_paths: ['src/orders/generated/**', '.env'],
      parent_references: [
        {
          repository_id: spec.metadata.owner_repository_id,
          artifact_id: spec.metadata.artifact_id,
          artifact_kind: spec.metadata.artifact_kind,
          revision: spec.metadata.source_revision,
          approval_hash: spec.metadata.approval_hash,
        },
      ],
    }),
    body: '# Approved plan\n',
  });
  const repositoryPlan = {
    schema_version: 1,
    integration_owner_repository_id: 'github.com/sdcorejs/portal',
    gitlink_updates_in_scope: false,
    dependency_order: ['module-a'],
    repositories: [
      {
        repository_id: 'github.com/sdcorejs/module-a',
        role: 'module',
        module_id: 'module-a',
        available: true,
        writable: true,
      },
      {
        repository_id: 'github.com/sdcorejs/portal',
        role: 'portal',
        module_id: null,
      },
    ],
    steps: [
      {
        id: 'module-write',
        action: 'EDIT',
        semantic_scope: 'module',
        owner_repository_id: 'github.com/sdcorejs/module-a',
        git_roots: ['github.com/sdcorejs/module-a'],
        allowed_paths: ['src/orders/**'],
        prohibited_paths: ['src/orders/generated/**', '.env'],
        depends_on: [],
      },
    ],
  };
  const prepared = prepareExecution({
    approved_plan: planArtifact,
    approved_spec: spec,
    repository_plan: repositoryPlan,
    owner_revisions: {
      [planArtifact.metadata.owner_repository_id]: planArtifact.metadata.source_revision,
    },
  });
  assert.equal(prepared.valid, true);
  assert.equal(prepared.track.id, 'angular');
  assert.deepEqual(
    resolveExecutionTarget({
      step: repositoryPlan.steps[0],
      repositories: repositoryPlan.repositories,
    }),
    {
      owner_repository_id: 'github.com/sdcorejs/module-a',
      owner_repository_role: 'module',
      owner_module_id: 'module-a',
      execute_in_repository_id: 'github.com/sdcorejs/module-a',
    },
  );
  assert.throws(
    () =>
      resolveExecutionTarget({
        step: repositoryPlan.steps[0],
        repositories: repositoryPlan.repositories.map((repository) => {
          if (repository.repository_id !== 'github.com/sdcorejs/module-a') return repository;
          const withoutAvailabilityProof = { ...repository };
          delete withoutAvailabilityProof.available;
          delete withoutAvailabilityProof.writable;
          return withoutAvailabilityProof;
        }),
      }),
    /unavailable or not writable/iu,
  );
  assert.throws(
    () =>
      resolveExecutionTarget({
        step: {
          ...repositoryPlan.steps[0],
          owner_repository_id: 'github.com/sdcorejs/missing-module',
        },
        repositories: repositoryPlan.repositories,
      }),
    /missing owner repository.*portal fallback/iu,
  );
  assert.equal(
    evaluateWorkingTree({
      unrelated_dirty_paths: ['docs/unrelated.md'],
      intended_output_paths: ['src/orders/order.service.ts'],
    }).status,
    'decision-required',
  );

  assert.equal(
    authorizePlanWrite({
      step: repositoryPlan.steps[0],
      current_repository_id: 'github.com/sdcorejs/module-a',
      repository_relative_path: 'src/orders/order.service.ts',
      final_branch_ready: false,
    }).authorized,
    true,
  );
  assert.throws(
    () =>
      authorizePlanWrite({
        step: repositoryPlan.steps[0],
        current_repository_id: 'github.com/sdcorejs/portal',
        repository_relative_path: 'src/orders/order.service.ts',
        final_branch_ready: false,
      }),
    /wrong Git root/iu,
  );
  assert.throws(
    () =>
      authorizePlanWrite({
        step: repositoryPlan.steps[0],
        current_repository_id: 'github.com/sdcorejs/module-a',
        repository_relative_path: 'src/orders/generated/client.ts',
        final_branch_ready: false,
      }),
    /prohibited_paths/iu,
  );
  assert.throws(
    () =>
      authorizePlanWrite({
        step: repositoryPlan.steps[0],
        current_repository_id: 'github.com/sdcorejs/module-a',
        repository_relative_path: 'src/billing/billing.service.ts',
        final_branch_ready: false,
      }),
    /allowed_paths/iu,
  );
  assert.throws(
    () =>
      authorizePlanWrite({
        step: repositoryPlan.steps[0],
        current_repository_id: 'github.com/sdcorejs/module-a',
        repository_relative_path: 'src/orders/order.service.ts',
        final_branch_ready: true,
      }),
    /final branch-ready/iu,
  );
  assert.throws(
    () =>
      authorizePlanWrite({
        step: repositoryPlan.steps[0],
        current_repository_id: 'github.com/sdcorejs/module-a',
        repository_relative_path: 'src/orders/order.service.ts',
        final_branch_ready: false,
        review_finding_selected: false,
      }),
    /unselected review finding/iu,
  );
  assert.throws(
    () =>
      prepareExecution({
        approved_plan: planArtifact,
        approved_spec: spec,
        repository_plan: {
          ...repositoryPlan,
          steps: [
            {
              ...repositoryPlan.steps[0],
              allowed_paths: ['**'],
              prohibited_paths: [],
            },
          ],
        },
        owner_revisions: {
          [planArtifact.metadata.owner_repository_id]: planArtifact.metadata.source_revision,
        },
      }),
    /approved plan.*scope|scope.*approved plan/iu,
  );
  assert.throws(
    () =>
      prepareExecution({
        approved_plan: planArtifact,
        approved_spec: spec,
        repository_plan: repositoryPlan,
        owner_revisions: {
          [planArtifact.metadata.owner_repository_id]: 'd'.repeat(40),
        },
      }),
    /stale source/iu,
  );
});

test('execute-plan mode selection is deterministic and capability-aware', async () => {
  const { selectExecutionMode } = await importRepoModule(
    '_refs/orchestration/execution-contract.mjs',
  );
  assert.equal(
    selectExecutionMode({
      units: [{ id: 'one', depends_on: [] }],
      parallel_capability: 'supported',
      isolation_safe: true,
      ownership_disjoint: true,
    }).mode,
    'sequential',
  );
  assert.equal(
    selectExecutionMode({
      units: [{ id: 'a' }, { id: 'b' }],
      parallel_capability: 'unknown',
      isolation_safe: true,
      ownership_disjoint: true,
    }).mode,
    'sequential',
  );
  assert.equal(
    selectExecutionMode({
      units: [{ id: 'a' }, { id: 'b' }],
      parallel_capability: 'supported',
      isolation_safe: false,
      ownership_disjoint: true,
    }).mode,
    'sequential',
  );
  assert.equal(
    selectExecutionMode({
      units: [{ id: 'a' }, { id: 'b' }],
      parallel_capability: 'supported',
      isolation_safe: true,
      ownership_disjoint: true,
    }).mode,
    'choice-required',
  );
});

test('execute-plan skill consumes registry identity and per-repository evidence', async () => {
  const text = await readFile(
    path.join(repoRoot, 'skills/shared/sdlc/04-execute-plan.md'),
    'utf8',
  );
  assert.match(text, /_refs\/shared\/approved-artifact\.mjs/u);
  assert.match(text, /_refs\/shared\/system-registry\.json/u);
  assert.match(text, /_refs\/orchestration\/execution-contract\.mjs/u);
  assert.match(text, /current Git root/iu);
  assert.match(text, /owner_repository_id/u);
  assert.match(text, /execution_host_repository_id/u);
  assert.match(text, /integration_owner_repository_id/u);
  assert.match(text, /repository_revision_map/u);
  assert.match(text, /portal.*module repository/isu);
  assert.match(text, /review finding.*authorized write/isu);
  assert.match(text, /Do not mutate approved/iu);
  assert.match(text, /Finish gate/iu);
  assert.match(text, /current-session\.md/u);
});

test('approved artifact validation is checkout-path independent and rejects stale schemas or tracks', async () => {
  const { createApprovedArtifact } = await importRepoModule('_refs/shared/approved-artifact.mjs');
  const left = createApprovedArtifact({
    metadata: baseArtifact(),
    body: 'Approved body.\n',
    checkout_root: 'C:\\work\\portal',
  });
  const right = createApprovedArtifact({
    metadata: baseArtifact(),
    body: 'Approved body.\n',
    checkout_root: '/mnt/work/portal',
  });
  assert.equal(left.metadata.approval_hash, right.metadata.approval_hash);
  assert.throws(
    () => createApprovedArtifact({ metadata: baseArtifact({ schema_version: 99 }), body: 'x' }),
    /schema version/iu,
  );
  assert.throws(
    () => createApprovedArtifact({ metadata: baseArtifact({ track: 'unknown-track' }), body: 'x' }),
    /unknown track/iu,
  );
});

test('repository identity, ownership, and write guards never depend on cwd or absolute checkout paths', async () => {
  const {
    assertOwnerWriteTarget,
    resolveArtifactOwner,
    stableRepositoryId,
  } = await importRepoModule('_refs/shared/repository-contract.mjs');
  assert.equal(
    stableRepositoryId({ remote_url: 'git@github.com:sdcorejs/module-a.git' }),
    'github.com/sdcorejs/module-a',
  );
  assert.equal(
    stableRepositoryId({ remote_url: 'https://github.com/sdcorejs/module-a.git' }),
    'github.com/sdcorejs/module-a',
  );
  const owner = resolveArtifactOwner({
    artifact_kind: 'e2e-test',
    scope: 'module',
    module: { id: 'module-a', repository_id: 'github.com/sdcorejs/module-a' },
    portal: { repository_id: 'github.com/sdcorejs/portal' },
    execution_host_repository_id: 'github.com/sdcorejs/portal',
  });
  assert.equal(owner.owner_repository_id, 'github.com/sdcorejs/module-a');
  assert.equal(owner.execution_host_repository_id, 'github.com/sdcorejs/portal');
  assert.doesNotThrow(() =>
    assertOwnerWriteTarget({
      owner_repository_id: owner.owner_repository_id,
      current_repository_id: 'github.com/sdcorejs/module-a',
      repository_relative_path: '.sdcorejs/tests/e2e/orders.spec.ts',
    }),
  );
  assert.throws(
    () =>
      assertOwnerWriteTarget({
        owner_repository_id: owner.owner_repository_id,
        current_repository_id: 'github.com/sdcorejs/portal',
        repository_relative_path: '.sdcorejs/tests/e2e/orders.spec.ts',
      }),
    /wrong repository root/iu,
  );
});

test('brainstorming resolves module requirement ownership without portal fallback', async () => {
  const { resolveRequirementOwnership } = await importRepoModule(
    '_refs/shared/repository-contract.mjs',
  );
  const topology = {
    portal: {
      repository_id: 'github.com/sdcorejs/portal',
      role: 'portal',
      available: true,
      writable: true,
    },
    modules: [
      {
        module_id: 'module-a',
        aliases: ['orders', 'shared'],
        repository_id: 'github.com/sdcorejs/module-a',
        role: 'module',
        available: true,
        writable: true,
      },
      {
        module_id: 'module-b',
        aliases: ['billing', 'shared'],
        repository_id: 'github.com/sdcorejs/module-b',
        role: 'module',
        available: true,
        writable: true,
      },
      {
        module_id: 'module-c',
        aliases: ['catalog'],
        repository_id: 'github.com/sdcorejs/module-c',
        role: 'module',
        available: false,
        writable: false,
      },
    ],
  };
  const resolved = resolveRequirementOwnership({
    topology,
    requested_module: 'orders',
    execution_host_repository_id: 'github.com/sdcorejs/portal',
  });
  assert.equal(resolved.status, 'resolved');
  assert.equal(resolved.owner_repository_id, 'github.com/sdcorejs/module-a');
  assert.equal(resolved.owner_module_id, 'module-a');
  assert.equal(resolved.execution_host_repository_id, 'github.com/sdcorejs/portal');

  const ambiguous = resolveRequirementOwnership({
    topology,
    requested_module: 'shared',
    execution_host_repository_id: 'github.com/sdcorejs/portal',
  });
  assert.equal(ambiguous.status, 'blocked');
  assert.equal(ambiguous.write_target, null);
  assert.match(ambiguous.blockers[0], /ambiguous/iu);

  const missing = resolveRequirementOwnership({
    topology,
    requested_module: 'unknown-module',
    execution_host_repository_id: 'github.com/sdcorejs/portal',
  });
  assert.equal(missing.status, 'blocked');
  assert.equal(missing.write_target, null);
  assert.notEqual(missing.owner_repository_id, topology.portal.repository_id);

  const unavailable = resolveRequirementOwnership({
    topology,
    requested_module: 'catalog',
    execution_host_repository_id: 'github.com/sdcorejs/portal',
  });
  assert.equal(unavailable.status, 'blocked');
  assert.equal(unavailable.write_target, null);
  assert.equal(unavailable.owner_repository_id, 'github.com/sdcorejs/module-c');
});

test('brainstorming requirement_context consumes registry identity and remains read-only', async () => {
  const text = await readFile(
    path.join(repoRoot, 'skills/shared/sdlc/01-brainstorming.md'),
    'utf8',
  );
  for (const field of [
    'contract_id',
    'requirement_id',
    'track',
    'stack_profile',
    'profile_confidence',
    'profile_evidence',
    'target_root',
    'target_root_kind',
    'owner_repository_id',
    'owner_repository_role',
    'owner_module_id',
    'execution_host_repository_id',
    'assumptions',
    'non_goals',
    'risks',
    'acceptance_criteria_seed',
    'unresolved_blockers',
  ]) {
    assert.match(text, new RegExp(`\\b${field}\\b`, 'u'), `requirement_context carries ${field}`);
  }
  assert.match(text, /_refs\/shared\/system-registry\.json/u);
  assert.match(text, /missing.*module.*portal|portal.*fallback/isu);
  assert.match(text, /technical-prototype.*explicit/isu);
  assert.match(text, /admin\/auth\/account\/role\/permission.*approved/isu);
  assert.match(text, /Output dialogue only.*Do not write specs, plans, or code/isu);
});

test('module E2E discovery keeps module provenance and exact result classes', async () => {
  const {
    aggregateModuleE2E,
    validateModuleE2EManifest,
  } = await importRepoModule('_refs/shared/repository-contract.mjs');
  const moduleA = validateModuleE2EManifest({
    schema_version: 1,
    module_id: 'module-a',
    repository_id: 'github.com/sdcorejs/module-a',
    e2e: {
      availability: 'available',
      runner: 'playwright',
      command: ['npm', 'run', 'test:e2e'],
      working_directory: '.',
      config_path: 'playwright.config.ts',
      capabilities: ['portal-composed'],
      required_portal_capabilities: ['auth-bootstrap'],
      persona_refs: ['qc'],
      evidence_path: 'test-results/evidence.json',
    },
  });
  const aggregate = aggregateModuleE2E({
    portal_revision: 'a'.repeat(40),
    module_runs: [
      {
        manifest: moduleA,
        module_revision: 'b'.repeat(40),
        portal_pinned_module_revision: 'b'.repeat(40),
        result: 'PASSED',
        actual_command: ['npm', 'run', 'test:e2e'],
      },
      {
        module_id: 'module-b',
        repository_id: 'github.com/sdcorejs/module-b',
        e2e_availability: 'not-applicable',
        result: 'NOT APPLICABLE',
      },
      {
        module_id: 'module-c',
        repository_id: 'github.com/sdcorejs/module-c',
        e2e_availability: 'uninitialized',
        result: 'NOT RUN',
      },
    ],
  });
  assert.deepEqual(
    aggregate.modules.map(({ module_id, result }) => [module_id, result]),
    [
      ['module-a', 'PASSED'],
      ['module-b', 'NOT APPLICABLE'],
      ['module-c', 'NOT RUN'],
    ],
  );
  assert.equal(aggregate.full_e2e_satisfied, false);
  assert.equal(aggregate.modules[0].portal_revision, 'a'.repeat(40));
  assert.equal(aggregate.modules[0].module_revision, 'b'.repeat(40));
  assert.equal(aggregate.modules[0].portal_pinned_module_revision, 'b'.repeat(40));

  assert.throws(
    () =>
      aggregateModuleE2E({
        portal_revision: 'a'.repeat(40),
        module_runs: [
          {
            module_id: 'module-invalid',
            repository_id: 'github.com/sdcorejs/module-invalid',
            e2e_availability: 'uninitialized',
            result: 'NOT APPLICABLE',
          },
        ],
      }),
    /uninitialized.*NOT RUN|NOT APPLICABLE.*uninitialized/iu,
  );
});

test('repository summary and template line endings remain valid on the current source', async () => {
  const { assembleProjectContext } = await importRepoModule(
    '_refs/shared/project-context.mjs',
  );
  const context = await assembleProjectContext({
    root: repoRoot,
    requestScope: 'release readiness',
    tracks: ['workflow'],
    stackProfiles: ['node-esm', 'markdown-skill-pack', 'astro-site'],
  });
  assert.equal(context.project_context.summary.schema, 'v2');
  assert.equal(context.project_context.summary.status, 'fresh');

  const attributes = await readFile(path.join(repoRoot, '.gitattributes'), 'utf8');
  assert.match(attributes, /^\*\.tpl\s+text\s+eol=lf$/mu);
});

test('stale module evidence and unsafe manifests fail closed', async () => {
  const {
    validateEvidenceFreshness,
    validateModuleE2EManifest,
  } = await importRepoModule('_refs/shared/repository-contract.mjs');
  assert.equal(
    validateEvidenceFreshness({
      module_revision: 'a'.repeat(40),
      portal_pinned_module_revision: 'b'.repeat(40),
    }).status,
    'stale',
  );
  assert.throws(
    () =>
      validateModuleE2EManifest({
        schema_version: 1,
        module_id: 'module-a',
        repository_id: 'github.com/sdcorejs/module-a',
        e2e: {
          availability: 'available',
          runner: 'playwright',
          command: ['npm', 'run', 'test:e2e'],
          working_directory: 'C:\\absolute\\module-a',
          config_path: 'playwright.config.ts',
          capabilities: [],
          required_portal_capabilities: [],
          persona_refs: [],
          evidence_path: 'test-results/evidence.json',
        },
      }),
    /repository-relative/iu,
  );
});

test('generated NestJS production auth uses OIDC/JWKS instead of a deny-all production binding', async () => {
  const [authModule, authentication, env, packageTemplate, authTest] = await Promise.all([
    readFile(
      path.join(repoRoot, '_refs/nestjs/generator/templates/common/src/auth/auth.module.ts.tpl'),
      'utf8',
    ),
    readFile(
      path.join(repoRoot, '_refs/nestjs/generator/templates/common/src/auth/authentication.ts.tpl'),
      'utf8',
    ),
    readFile(
      path.join(repoRoot, '_refs/nestjs/generator/templates/common/src/config/env.ts.tpl'),
      'utf8',
    ),
    readFile(
      path.join(repoRoot, '_refs/nestjs/generator/templates/common/package.json.tpl'),
      'utf8',
    ),
    readFile(
      path.join(repoRoot, '_refs/nestjs/generator/templates/common/test/e2e/item-auth.e2e-spec.ts.tpl'),
      'utf8',
    ),
  ]);
  assert.doesNotMatch(authModule, /useClass:\s*DenyAllTokenVerifier/u);
  assert.match(authModule, /useClass:\s*OidcTokenVerifier/u);
  assert.match(authentication, /jwtVerify/u);
  assert.match(authentication, /createRemoteJWKSet/u);
  assert.match(env, /OIDC_ISSUER/u);
  assert.match(env, /OIDC_AUDIENCE/u);
  assert.match(env, /OIDC_JWKS_URI/u);
  assert.match(env, /OIDC_ALLOWED_ALGORITHMS/u);
  assert.match(packageTemplate, /"jose"/u);
  assert.match(authTest, /wrong signature/iu);
  assert.match(authTest, /wrong issuer/iu);
  assert.match(authTest, /wrong audience/iu);
  assert.match(authTest, /expired token/iu);
  assert.match(authTest, /not-yet-valid token/iu);
  assert.match(authTest, /unsupported algorithm/iu);
  assert.match(authTest, /unknown kid/iu);
  assert.match(authTest, /key rotation/iu);
  assert.doesNotMatch(authTest, /overrideProvider\(TOKEN_VERIFIER\)/u);
});

test('executable-reference validator covers marked fences and localization context', async () => {
  const {
    validateCanonicalExecutableReferences,
    validateLocalizationPlaceholderContext,
  } = await importRepoModule('scripts/check-executable-references.mjs');
  assert.deepEqual(await validateCanonicalExecutableReferences(), []);
  assert.deepEqual(
    validateLocalizationPlaceholderContext(
      "const title = condition ? '<localized text>' : 'Fallback';",
      'valid.ts',
    ),
    [],
  );
  assert.ok(
    validateLocalizationPlaceholderContext(
      "const title = condition<localized text>'Broken' : 'Fallback';",
      'invalid.ts',
    ).length > 0,
  );
});
