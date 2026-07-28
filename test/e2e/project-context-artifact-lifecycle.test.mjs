import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path, { join } from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import {
  assembleProjectContext,
  assessSummaryFreshness,
  chooseCodeContextStrategy,
  computeProjectFingerprints,
  validateSummaryV2,
} from '../../_refs/shared/project-context.mjs';
import {
  buildArtifactClosure,
} from '../../_refs/shared/artifact-lifecycle.mjs';

const execFileAsync = promisify(execFile);

test('project-context v2 is side-effect free, concurrent-safe, and missing-summary tolerant', async () => {
  const root = await createGitRepo();
  await write(root, 'package.json', JSON.stringify({
    name: 'small-app',
    private: true,
    scripts: { test: 'node --test' },
  }, null, 2));
  await write(root, 'src/main.js', 'export const ready = true;\n');
  await write(root, '.sdcorejs/cache/graph.json', '{"nodes":["local-only"]}\n');
  await commitAll(root, 'initial');
  const before = await listFiles(root);

  const [first, second] = await Promise.all([
    assembleProjectContext({
      root,
      requestScope: 'update the named service',
      explicitFiles: ['src/main.js'],
      taskShape: 'small',
    }),
    assembleProjectContext({
      root,
      requestScope: 'review the named entrypoint',
      explicitFiles: ['src/main.js'],
      taskShape: 'small',
    }),
  ]);

  for (const result of [first, second]) {
    assert.equal(result.project_context.summary.status, 'missing');
    assert.equal(result.project_context.code_context.strategy, 'targeted-read');
    assert.equal(result.project_context.writes_allowed, false);
    assert.deepEqual(result.project_context.related_artifacts.docs, []);
  }
  assert.deepEqual(await listFiles(root), before);
  await assert.rejects(access(join(root, '.sdcorejs', 'tasks', 'current-session.md')));
  await assert.rejects(access(join(root, '.sdcorejs', 'tasks', 'sessions')));
});

test('summary v2 freshness is section-aware and ignores unrelated source-content commits', async () => {
  const root = await createGitRepo();
  const packageJson = {
    name: 'freshness-app',
    private: true,
    scripts: { test: 'node --test' },
    dependencies: { alpha: '1.0.0' },
  };
  await write(root, 'package.json', `${JSON.stringify(packageJson, null, 2)}\n`);
  await write(root, 'src/main.js', 'export const main = true;\n');
  await write(root, 'src/feature.js', 'export const feature = 1;\n');
  await commitAll(root, 'initial');

  const declaredEntrypoints = ['src/main.js'];
  const baseline = await computeProjectFingerprints(root, undefined, { declaredEntrypoints });
  const summary = summaryV2(baseline.fingerprints, declaredEntrypoints);
  assert.deepEqual(validateSummaryV2(summary), []);
  assert.equal(assessSummaryFreshness(summary, baseline.fingerprints).status, 'fresh');

  await write(root, 'src/feature.js', 'export const feature = 2;\n');
  const unrelated = await computeProjectFingerprints(root, undefined, { declaredEntrypoints });
  assert.deepEqual(unrelated.fingerprints, baseline.fingerprints);
  assert.equal(assessSummaryFreshness(summary, unrelated.fingerprints).status, 'fresh');

  packageJson.dependencies.beta = '2.0.0';
  await write(root, 'package.json', `${JSON.stringify(packageJson, null, 2)}\n`);
  const dependencyChange = await computeProjectFingerprints(root, undefined, { declaredEntrypoints });
  const dependencyFreshness = assessSummaryFreshness(summary, dependencyChange.fingerprints);
  assert.equal(dependencyFreshness.status, 'partially-stale');
  assert.deepEqual(
    dependencyFreshness.invalidatedSections.sort(),
    ['Commands', 'Conventions and Invariants', 'Stack and Workspace'].sort()
  );

  delete packageJson.dependencies.beta;
  await write(root, 'package.json', `${JSON.stringify(packageJson, null, 2)}\n`);
  await write(root, 'backend/src/main.ts', 'export const backend = true;\n');
  const sourceRootChange = await computeProjectFingerprints(root, undefined, { declaredEntrypoints });
  const sourceFreshness = assessSummaryFreshness(summary, sourceRootChange.fingerprints);
  assert.equal(sourceFreshness.status, 'partially-stale');
  assert.deepEqual(
    sourceFreshness.invalidatedSections.sort(),
    [
      'Application and Module Map',
      'Entrypoints and Main Runtime Flows',
      'Task-to-Path Navigation',
    ].sort()
  );

  await rm(join(root, 'backend'), { recursive: true, force: true });
  await write(root, 'nx.json', '{"extends":"nx/presets/npm.json"}\n');
  const workspaceChange = await computeProjectFingerprints(root, undefined, { declaredEntrypoints });
  const workspaceFreshness = assessSummaryFreshness(summary, workspaceChange.fingerprints);
  assert.equal(workspaceFreshness.status, 'partially-stale');
  assert.ok(workspaceFreshness.invalidatedSections.includes('Stack and Workspace'));
  assert.ok(workspaceFreshness.invalidatedSections.includes('Application and Module Map'));

  const legacy = '---\ngenerated_at: 2025-01-01\ngit_head: abc\n---\n# Old summary\n';
  const legacyResult = assessSummaryFreshness(legacy, baseline.fingerprints);
  assert.equal(legacyResult.schema, 'legacy-schema');
  assert.equal(legacyResult.status, 'unknown');

  const volatile = summary.replace(
    'kind: project-summary',
    'kind: project-summary\nbranch: feature/volatile'
  );
  assert.match(validateSummaryV2(volatile).join('\n'), /forbidden volatile frontmatter key: branch/);
});

test('summary v2 mutation fixture invalidates exactly entrypoint-dependent sections', async () => {
  const root = await createGitRepo();
  const declaredEntrypoints = ['src/launcher.custom.js'];
  await write(root, 'package.json', JSON.stringify({ name: 'entrypoint-fixture', private: true, main: 'src/package-entry.custom.js' }, null, 2));
  await write(root, 'src/package-entry.custom.js', 'export const packageEntry = true;\n');
  await write(root, 'src/launcher.custom.js', 'export const launch = true;\n');
  await write(root, 'src/feature.js', 'export const feature = 1;\n');
  await commitAll(root, 'initial entrypoint fixture');

  const baseline = await computeProjectFingerprints(root, undefined, { declaredEntrypoints });
  const summary = summaryV2(baseline.fingerprints, declaredEntrypoints);
  await write(root, '.sdcorejs/summary.md', summary);
  const expected = [
    'Application and Module Map',
    'Entrypoints and Main Runtime Flows',
    'Task-to-Path Navigation',
  ].sort();
  const initialRoundTrip = await assembleProjectContext({ root, requestScope: 'entrypoint round trip' });
  assert.equal(initialRoundTrip.project_context.summary.status, 'fresh');
  assert.deepEqual(initialRoundTrip.project_context.summary.usable_sections.sort(), summarySections().sort());

  await write(root, 'src/feature.js', 'export const feature = 2;\n');
  const unrelatedEdit = await computeProjectFingerprints(root, undefined, { declaredEntrypoints });
  assert.deepEqual(assessSummaryFreshness(summary, unrelatedEdit.fingerprints).usableSections.sort(), summarySections().sort());

  await rm(join(root, 'src/launcher.custom.js'));
  const deletedEntrypoint = await computeProjectFingerprints(root, undefined, { declaredEntrypoints });
  const deletionFreshness = assessSummaryFreshness(summary, deletedEntrypoint.fingerprints);
  assert.deepEqual(deletionFreshness.invalidatedSections.sort(), expected);
  assert.deepEqual(deletionFreshness.usableSections.sort(), summarySections().filter((section) => !expected.includes(section)).sort());

  await write(root, 'src/launcher.custom.js', 'export const launch = true;\n');
  await rm(join(root, 'src/launcher.custom.js'));
  await write(root, 'src/renamed.custom.js', 'export const renamed = true;\n');
  const renamedEntrypoint = await computeProjectFingerprints(root, undefined, { declaredEntrypoints });
  const renameFreshness = assessSummaryFreshness(summary, renamedEntrypoint.fingerprints);
  assert.deepEqual(renameFreshness.invalidatedSections.sort(), expected);
  assert.deepEqual(renameFreshness.usableSections.sort(), summarySections().filter((section) => !expected.includes(section)).sort());

  await write(root, 'src/launcher.custom.js', 'export const launch = true;\n');
  await write(root, 'src/renamed-package-entry.custom.js', 'export const renamedPackageEntry = true;\n');
  await write(root, 'package.json', JSON.stringify({ name: 'entrypoint-fixture', private: true, main: 'src/renamed-package-entry.custom.js' }, null, 2));
  const packageFieldRename = await computeProjectFingerprints(root, undefined, { declaredEntrypoints });
  const packageFreshness = assessSummaryFreshness(summary, packageFieldRename.fingerprints);
  assert.deepEqual(packageFreshness.invalidatedSections.sort(), expected);
  assert.deepEqual(packageFreshness.usableSections.sort(), summarySections().filter((section) => !expected.includes(section)).sort());
});

test('code-context escalation stays scoped and existing graph providers are read-only', () => {
  const small = chooseCodeContextStrategy({
    taskShape: 'small',
    explicitFiles: ['src/feature.ts'],
    summaryStatus: 'missing',
    requestScope: 'feature',
  });
  assert.equal(small.strategy, 'targeted-read');
  assert.equal(Object.hasOwn(small, 'nodes'), false);

  const multiModule = chooseCodeContextStrategy({
    taskShape: 'multi-module',
    explicitFiles: ['apps/portal/src/app.ts'],
    summaryStatus: 'fresh',
    requestScope: 'portal to API flow',
  });
  assert.equal(multiModule.strategy, 'scoped-code-map');

  const existingProvider = chooseCodeContextStrategy({
    taskShape: 'architecture',
    explicitFiles: ['apps/portal/src/app.ts'],
    summaryStatus: 'fresh',
    requestScope: 'module impact',
    graphProvider: {
      name: 'repo-graph',
      command: 'repo-graph query --scope portal',
      evidence: ['package.json'],
    },
  });
  assert.equal(existingProvider.strategy, 'existing-codegraph');
  assert.equal(existingProvider.provider.read_only, true);
  assert.equal(existingProvider.provider.cache_policy, 'local-only');
});

test('artifact closure includes only the current change and blocks ambiguous or incomplete delivery', async () => {
  const root = await createGitRepo();
  await write(root, 'README.md', '# Fixture\n');
  await commitAll(root, 'initial');

  const samePaths = [
    '.sdcorejs/specs/workflow/context-v2.md',
    '.sdcorejs/plans/workflow/context-v2.md',
    '.sdcorejs/docs/workflow/context-v2.md',
  ];
  await write(root, samePaths[0], artifact('spec', 'context-v2', 'sdcorejs-spec'));
  await write(root, samePaths[1], artifact('plan', 'context-v2', 'sdcorejs-plan', {
    source_spec: samePaths[0],
  }));
  await write(root, samePaths[2], artifact('execution-doc', 'context-v2', 'integration-owner', {
    source_spec: samePaths[0],
    source_plan: samePaths[1],
  }));
  await write(
    root,
    '.sdcorejs/specs/workflow/other-change.md',
    artifact('spec', 'other-change', 'sdcorejs-spec')
  );
  await write(
    root,
    '.sdcorejs/summary.md',
    artifact('summary', 'shared-project-index', 'integration-owner', {
      commit_policy: 'conditional',
    })
  );
  await write(root, '.sdcorejs/cache/codegraph/slice.json', '{"nodes":[]}\n');
  await write(root, '.sdcorejs/tasks/current-session.md', '# Legacy state\n');

  const runtimeContext = {
    schema_version: 1,
    change_ref: 'context-v2',
    source_spec: samePaths[0],
    source_plan: samePaths[1],
    required_with_change: [
      ...samePaths.map((pathValue) => ({ path: pathValue })),
      { path: '.sdcorejs/tasks/current-session.md' },
    ],
    shared_owned: [],
    conditional: [{ path: '.sdcorejs/summary.md' }],
    local_only: [{ path: '.sdcorejs/cache/codegraph/slice.json' }],
    unrelated_observed: [{ path: '.sdcorejs/specs/workflow/other-change.md' }],
  };
  const closure = await buildArtifactClosure({
    root,
    changeRef: 'context-v2',
    artifactContext: runtimeContext,
    owner: 'integration-owner',
  });

  assert.equal(closure.sdcorejs_artifacts.closure_result, 'complete');
  for (const required of samePaths) {
    assert.ok(closure.sdcorejs_artifacts.included_paths.includes(required));
  }
  assert.ok(closure.sdcorejs_artifacts.included_paths.includes('.sdcorejs/summary.md'));
  assert.ok(
    closure.sdcorejs_artifacts.excluded_unrelated_paths.includes(
      '.sdcorejs/specs/workflow/other-change.md'
    )
  );
  assert.ok(
    closure.sdcorejs_artifacts.local_only_paths.includes(
      '.sdcorejs/cache/codegraph/slice.json'
    )
  );
  assert.ok(
    closure.sdcorejs_artifacts.local_only_paths.includes(
      '.sdcorejs/tasks/current-session.md'
    )
  );
  assert.ok(
    !closure.sdcorejs_artifacts.required_paths.includes(
      '.sdcorejs/tasks/current-session.md'
    ),
    'local-only policy must override a conflicting runtime bucket'
  );
  assert.equal((await git(root, ['diff', '--cached', '--name-only'])).trim(), '');

  const reconstructed = await buildArtifactClosure({
    root,
    changeRef: 'context-v2',
    owner: 'integration-owner',
  });
  for (const required of samePaths) {
    assert.ok(reconstructed.sdcorejs_artifacts.required_paths.includes(required));
  }
  assert.ok(reconstructed.sdcorejs_artifacts.included_paths.includes('.sdcorejs/summary.md'));

  const withoutSharedOwner = await buildArtifactClosure({
    root,
    changeRef: 'context-v2',
  });
  assert.ok(withoutSharedOwner.sdcorejs_artifacts.conditional_paths.includes('.sdcorejs/summary.md'));
  assert.ok(!withoutSharedOwner.sdcorejs_artifacts.included_paths.includes('.sdcorejs/summary.md'));

  const runtimeRequiredWithoutSharedOwner = await buildArtifactClosure({
    root,
    changeRef: 'context-v2',
    artifactContext: {
      required_with_change: [{ path: '.sdcorejs/summary.md' }],
    },
  });
  assert.ok(
    runtimeRequiredWithoutSharedOwner.sdcorejs_artifacts.conditional_paths.includes(
      '.sdcorejs/summary.md'
    )
  );
  assert.ok(
    !runtimeRequiredWithoutSharedOwner.sdcorejs_artifacts.required_paths.includes(
      '.sdcorejs/summary.md'
    ),
    'runtime required bucket must not bypass shared ownership'
  );
  assert.ok(
    !runtimeRequiredWithoutSharedOwner.sdcorejs_artifacts.included_paths.includes(
      '.sdcorejs/summary.md'
    )
  );

  const runtimeRequiredWithSharedOwner = await buildArtifactClosure({
    root,
    changeRef: 'context-v2',
    artifactContext: {
      required_with_change: [{ path: '.sdcorejs/summary.md' }],
    },
    owner: 'integration-owner',
  });
  assert.ok(
    runtimeRequiredWithSharedOwner.sdcorejs_artifacts.shared_owned_paths.includes(
      '.sdcorejs/summary.md'
    )
  );
  assert.ok(
    !runtimeRequiredWithSharedOwner.sdcorejs_artifacts.required_paths.includes(
      '.sdcorejs/summary.md'
    )
  );

  await write(root, '.sdcorejs/misc/maybe-related.md', '# No metadata\n');
  const ambiguous = await buildArtifactClosure({
    root,
    changeRef: 'context-v2',
    owner: 'integration-owner',
  });
  assert.equal(ambiguous.sdcorejs_artifacts.closure_result, 'ambiguous');
  assert.ok(ambiguous.sdcorejs_artifacts.unknown_paths.includes('.sdcorejs/misc/maybe-related.md'));

  await rm(join(root, '.sdcorejs', 'misc', 'maybe-related.md'));
  const push = await buildArtifactClosure({
    root,
    changeRef: 'context-v2',
    artifactContext: runtimeContext,
    owner: 'integration-owner',
    mode: 'push',
  });
  assert.equal(push.sdcorejs_artifacts.closure_result, 'incomplete');
  assert.equal(push.sdcorejs_artifacts.push_allowed, false);
  assert.ok(push.sdcorejs_artifacts.uncommitted_included_paths.includes('.sdcorejs/summary.md'));
  assert.match(push.sdcorejs_artifacts.blockers.join('\n'), /required artifacts remain uncommitted/);

  const missing = await buildArtifactClosure({
    root,
    changeRef: 'context-v2',
    artifactContext: {
      required_with_change: [{ path: '.sdcorejs/specs/workflow/missing.md' }],
    },
  });
  assert.equal(missing.sdcorejs_artifacts.closure_result, 'incomplete');
  assert.deepEqual(missing.sdcorejs_artifacts.missing_required_paths, [
    '.sdcorejs/specs/workflow/missing.md',
  ]);

  const invalidContext = await buildArtifactClosure({
    root,
    changeRef: 'context-v2',
    artifactContext: {
      required_with_change: [{ path: '../outside-root.md' }],
    },
  });
  assert.equal(invalidContext.sdcorejs_artifacts.closure_result, 'incomplete');
  assert.deepEqual(invalidContext.sdcorejs_artifacts.invalid_context_paths, [
    '../outside-root.md',
  ]);
  assert.match(invalidContext.sdcorejs_artifacts.blockers.join('\n'), /out-of-root path/);
});

test('artifact closure fails closed when Git discovery cannot complete', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'sdcorejs-artifact-discovery-'));
  t.after(() => rm(root, { recursive: true, force: true }));

  const closure = await buildArtifactClosure({ root });

  assert.equal(closure.discovery.complete, false);
  assert.equal(closure.discovery.errors.length, 3);
  assert.equal(closure.sdcorejs_artifacts.discovery_complete, false);
  assert.equal(closure.sdcorejs_artifacts.discovery_errors.length, 3);
  assert.equal(closure.sdcorejs_artifacts.closure_result, 'incomplete');
  assert.equal(closure.sdcorejs_artifacts.push_allowed, null);
  assert.match(closure.sdcorejs_artifacts.blockers.join('\n'), /artifact discovery failed/);
});

test('session-start hook injects bootstrap for monorepos and non-SD repos without writes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sdcorejs-session-start-'));
  await write(root, 'apps/portal/next.config.mjs', 'export default {};\n');
  const helper = path.resolve('plugin/hooks/session-start.mjs');
  const result = await execFileResult(process.execPath, [helper], {
    cwd: root,
    env: {
      ...process.env,
      CLAUDE_PROJECT_DIR: root,
    },
  });

  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /sdcorejs-using-skills/);
  assert.doesNotMatch(result.stdout, /Before substantive code-writing work/);
  assert.doesNotMatch(result.stdout, /summary-refresh/);
  await assert.rejects(access(join(root, '.sdcorejs')));

  const unrelatedRoot = await mkdtemp(join(tmpdir(), 'sdcorejs-session-start-general-'));
  await write(unrelatedRoot, 'README.md', '# General repository\n');
  const unrelatedResult = await execFileResult(process.execPath, [helper], {
    cwd: unrelatedRoot,
    env: {
      ...process.env,
      CLAUDE_PROJECT_DIR: unrelatedRoot,
    },
  });
  assert.equal(unrelatedResult.code, 0, unrelatedResult.stderr);
  assert.match(unrelatedResult.stdout, /sdcorejs-using-skills/);
  await assert.rejects(access(join(unrelatedRoot, '.sdcorejs')));
});

test('active source encodes runtime-only progress and explicit-path Git staging', async () => {
  const root = path.resolve('.');
  const tasklist = await readFile(join(root, '_refs/shared/tasklist.md'), 'utf8');
  const context = await readFile(join(root, '_refs/shared/project-context.md'), 'utf8');
  const lifecycle = await readFile(join(root, '_refs/shared/artifact-lifecycle.md'), 'utf8');
  const gitSkill = await readFile(join(root, 'skills/shared/workflow/git.md'), 'utf8');
  const hook = await readFile(join(root, 'plugin/hooks/session-start'), 'utf8');

  assert.match(tasklist, /thread, agent harness, or client runtime/);
  assert.doesNotMatch(tasklist, /## Persistent Checkpoint/);
  assert.doesNotMatch(tasklist, /Write or update this file when/);
  assert.match(context, /Missing or stale summary is a context signal, never write permission/);
  assert.match(context, /strategy: summary-only \| targeted-read \| scoped-code-map \| existing-codegraph/);
  assert.match(lifecycle, /artifact_context:/);
  assert.match(lifecycle, /required_with_change/);
  assert.match(gitSkill, /SDCoreJS Artifact Closure/);
  assert.match(gitSkill, /Stage only the explicit `included_paths`/);
  assert.doesNotMatch(gitSkill, /git add \./);
  assert.doesNotMatch(gitSkill, /git add -A/);
  assert.doesNotMatch(hook, /project summary gate/i);
  assert.doesNotMatch(hook, /summary-refresh/);

  const activeText = [
    tasklist,
    context,
    lifecycle,
    gitSkill,
    await readFile(join(root, 'AGENTS.md'), 'utf8'),
  ].join('\n');
  for (const forbidden of [
    '.sdcorejs/current-change.yaml',
    '.sdcorejs/active-task.md',
    '.sdcorejs/session-index.json',
  ]) {
    assert.doesNotMatch(activeText, new RegExp(forbidden.replaceAll('.', '\\.')));
  }
});

test('every durable artifact producer participates in lifecycle propagation', async () => {
  const root = path.resolve('.');
  const producerPaths = [
    'skills/shared/sdlc/02-spec.md',
    'skills/shared/sdlc/03-plan.md',
    'skills/shared/sdlc/04-execute-plan.md',
    'skills/orchestration/documentation.md',
    'skills/tracks/product/sdcorejs-product.md',
    'skills/tracks/test/sdcorejs-test.md',
    'skills/shared/workflow/explore.md',
    '_refs/orchestration/tail/auto-docs.md',
  ];

  for (const producerPath of producerPaths) {
    const text = await readFile(join(root, producerPath), 'utf8');
    assert.match(text, /artifact-lifecycle\.md/, `${producerPath} loads the lifecycle contract`);
    assert.match(text, /artifact_context/, `${producerPath} emits or propagates artifact context`);
  }

  const lifecycle = await readFile(join(root, '_refs/shared/artifact-lifecycle.md'), 'utf8');
  for (const field of [
    'artifact_id',
    'artifact_kind',
    'change_ref',
    'source_spec',
    'source_plan',
    'commit_policy',
    'owner',
  ]) {
    assert.match(lifecycle, new RegExp(`\\b${field}\\b`), `lifecycle defines ${field}`);
  }
  for (const kind of [
    'spec',
    'plan',
    'execution-doc',
    'feature-ledger',
    'handoff',
    'summary',
    'task',
    'memory',
    'persona',
    'documentation-asset',
  ]) {
    assert.match(lifecycle, new RegExp(`\\b${kind}\\b`), `lifecycle covers ${kind}`);
  }
});

function summaryV2(fingerprints, keyEntrypoints = ['src/main.js']) {
  return `---
schema_version: 2
kind: project-summary
generated_at: 2026-07-24T00:00:00Z
generator: sdcorejs-explore
target_root_kind: target-project
tracks: [node]
stack_profiles: [node-general]
summary_scope: repository
source_roots: [src]
evidence:
  workspace_configs: []
  package_manifests: [package.json]
  key_entrypoints: [${keyEntrypoints.join(', ')}]
fingerprints:
  workspace_structure: ${fingerprints.workspace_structure}
  dependency_manifests: ${fingerprints.dependency_manifests}
  source_roots: ${fingerprints.source_roots}
  entrypoint_contract: ${fingerprints.entrypoint_contract}
redaction_applied: true
artifact_id: project-summary
artifact_kind: summary
change_ref: shared-project-index
source_spec: none
source_plan: none
commit_policy: conditional
owner: sdcorejs-explore
---

# Project Summary

## Purpose
Fixture.

## Read First
Read \`src/main.js\`.

## Stack and Workspace
Node.

## Application and Module Map
| Area | Path | Responsibility | Entry point | Depends on |
|---|---|---|---|---|
| App | \`src\` | Fixture | \`src/main.js\` | none |

## Entrypoints and Main Runtime Flows
\`src/main.js\`.

## Source-of-Truth and Generated Boundaries
\`src\` is source.

## Commands
\`node --test\`.

## Conventions and Invariants
Keep paths relative.

## Task-to-Path Navigation
Read \`src\`.

## Known Unknowns
None.

## Refresh Triggers
Refresh for workspace, dependency, or source-root changes.
`;
}

function summarySections() {
  return [
    'Purpose',
    'Read First',
    'Stack and Workspace',
    'Application and Module Map',
    'Entrypoints and Main Runtime Flows',
    'Source-of-Truth and Generated Boundaries',
    'Commands',
    'Conventions and Invariants',
    'Task-to-Path Navigation',
    'Known Unknowns',
    'Refresh Triggers',
  ];
}

function artifact(kind, changeRef, owner, overrides = {}) {
  const metadata = {
    artifact_id: `${kind}-${changeRef}`,
    artifact_kind: kind,
    change_ref: changeRef,
    source_spec: 'none',
    source_plan: 'none',
    commit_policy: kind === 'summary' ? 'conditional' : 'with-change',
    owner,
    ...overrides,
  };
  return `---
${Object.entries(metadata).map(([key, value]) => `${key}: ${value}`).join('\n')}
---

# Fixture
`;
}

async function createGitRepo() {
  const root = await mkdtemp(join(tmpdir(), 'sdcorejs-context-v2-'));
  await git(root, ['init']);
  await git(root, ['config', 'user.name', 'SDCoreJS Test']);
  await git(root, ['config', 'user.email', 'test@example.invalid']);
  return root;
}

async function commitAll(root, message) {
  await git(root, ['add', '--all']);
  await git(root, ['commit', '-m', message]);
}

async function git(root, args) {
  const { stdout } = await execFileAsync('git', args, {
    cwd: root,
    encoding: 'utf8',
  });
  return stdout;
}

async function write(root, relativePath, content) {
  const absolutePath = join(root, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content, 'utf8');
}

async function listFiles(root, current = root) {
  const result = [];
  for (const entry of await readdir(current, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const absolutePath = join(current, entry.name);
    if (entry.isDirectory()) result.push(...await listFiles(root, absolutePath));
    else if (entry.isFile()) result.push(path.relative(root, absolutePath).replaceAll('\\', '/'));
  }
  return result.sort();
}

function execFileResult(file, args, options = {}) {
  return new Promise((resolve) => {
    execFile(file, args, { encoding: 'utf8', ...options }, (error, stdout, stderr) => {
      resolve({
        code: error?.code ?? 0,
        stdout,
        stderr,
      });
    });
  });
}
