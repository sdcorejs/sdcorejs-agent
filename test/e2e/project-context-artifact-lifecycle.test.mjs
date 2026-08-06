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
import { deflateSync } from 'node:zlib';
import {
  assembleProjectContext,
  assessSummaryFreshness,
  chooseCodeContextStrategy,
  computeProjectFingerprints,
  validateSummaryV2,
} from '../../_refs/shared/project-context.mjs';
import {
  buildArtifactClosure,
  classifyArtifact,
  isBinaryArtifactPath,
  scanSensitiveArtifactContent,
  scanSensitiveArtifactPath,
} from '../../_refs/shared/artifact-lifecycle.mjs';
import * as artifactLifecycle from '../../_refs/shared/artifact-lifecycle.mjs';

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

test('artifact closure classifies Product and Design artifact roots deterministically', async () => {
  const root = await createGitRepo();
  await write(root, 'README.md', '# Fixture\n');
  await commitAll(root, 'initial');

  const productLedger = '.sdcorejs/docs/product/orders.md';
  const designLedger = '.sdcorejs/docs/design/orders.md';
  const productDocs = [
    '.sdcorejs/product/prds/orders.md',
    '.sdcorejs/product/user-stories/orders.md',
    '.sdcorejs/product/acceptance-criteria/orders.md',
    '.sdcorejs/product/uat-checklists/orders.md',
    '.sdcorejs/product/decisions/orders.md',
  ];
  const designDocs = [
    '.sdcorejs/design/flows/orders.md',
    '.sdcorejs/design/specs/orders.md',
    '.sdcorejs/design/decisions/orders.md',
  ];
  const designSources = [
    '.sdcorejs/design/wireframes/orders/list.html',
    '.sdcorejs/design/wireframes/orders/list.svg',
  ];

  await write(root, productLedger, artifact('product-ledger', 'orders-change', 'sdcorejs-product', {
    feature: 'orders',
  }));
  await write(root, designLedger, artifact('design-handoff', 'orders-change', 'sdcorejs-design', {
    feature: 'orders',
  }));
  for (const documentPath of productDocs) {
    await write(root, documentPath, artifact('product-doc', 'orders-change', 'sdcorejs-product'));
  }
  for (const documentPath of designDocs) {
    await write(root, documentPath, artifact('design-asset', 'orders-change', 'sdcorejs-design'));
  }
  for (const sourcePath of designSources) {
    await write(root, sourcePath, '<main data-story="US1"></main>\n');
  }
  await write(
    root,
    '.sdcorejs/product/prds/invoices.md',
    artifact('product-doc', 'invoices-change', 'sdcorejs-product'),
  );

  const closure = await buildArtifactClosure({
    root,
    changeRef: 'orders-change',
    artifactContext: {
      schema_version: 1,
      change_ref: 'orders-change',
      required_with_change: designSources.map((item) => ({ path: item })),
    },
    owner: 'sdcorejs-design',
  });

  for (const required of [...productDocs, ...designDocs, ...designSources, productLedger, designLedger]) {
    assert.ok(
      closure.sdcorejs_artifacts.required_paths.includes(required),
      `${required} must be required with the change`,
    );
  }
  assert.ok(
    closure.sdcorejs_artifacts.excluded_unrelated_paths.includes(
      '.sdcorejs/product/prds/invoices.md',
    ),
    'another change stays unrelated',
  );
  assert.deepEqual(closure.sdcorejs_artifacts.unknown_paths, []);
  assert.equal(closure.sdcorejs_artifacts.closure_result, 'complete');
  assert.equal(closure.sdcorejs_artifacts.staging_policy, 'explicit-paths-only');

  const byPath = new Map(closure.classifications.map((item) => [item.path, item]));
  assert.equal(byPath.get(productDocs[0]).kind, 'product-doc');
  assert.equal(byPath.get(designDocs[0]).kind, 'design-asset');
  assert.equal(byPath.get(productLedger).kind, 'product-ledger');
  assert.equal(byPath.get(designLedger).kind, 'design-handoff');
  assert.equal(byPath.get(designSources[0]).kind, 'design-asset');
  assert.equal(byPath.get(designSources[0]).lifecycle, 'change-scoped-durable');

  const missing = await buildArtifactClosure({
    root,
    changeRef: 'orders-change',
    artifactContext: {
      required_with_change: [{ path: '.sdcorejs/product/prds/missing-feature.md' }],
    },
  });
  assert.equal(missing.sdcorejs_artifacts.closure_result, 'incomplete');
  assert.deepEqual(missing.sdcorejs_artifacts.missing_required_paths, [
    '.sdcorejs/product/prds/missing-feature.md',
  ]);
});

test('artifact closure includes an approved durable Design PNG without decoding it as text', async () => {
  const root = await createGitRepo();
  await write(root, 'README.md', '# Fixture\n');
  await commitAll(root, 'initial');

  const exportPath = '.sdcorejs/design/exports/png/orders/list.png';
  const referencePath = '.sdcorejs/design/references/orders/list.png';
  const diagnosticPath = '.sdcorejs/design/diagnostics/orders/list-failure.png';
  const png = minimalPngBytes();
  assert.ok(png.includes(0), 'the fixture must contain binary NUL bytes');
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');

  await write(
    root,
    '.sdcorejs/docs/design/orders.md',
    artifact('design-handoff', 'orders-change', 'sdcorejs-design', { feature: 'orders' }),
  );
  await write(
    root,
    '.sdcorejs/design/wireframes/orders/list.html',
    '<main data-story="US1"></main>\n',
  );
  await writeBytes(root, exportPath, png);
  await writeBytes(root, referencePath, png);
  await writeBytes(root, diagnosticPath, png);

  const closure = await buildArtifactClosure({
    root,
    changeRef: 'orders-change',
    artifactContext: {
      schema_version: 1,
      change_ref: 'orders-change',
      required_with_change: [
        { path: '.sdcorejs/design/wireframes/orders/list.html' },
        {
          path: exportPath,
          kind: 'design-asset',
          reason: 'generated mockup bound to the editable source hash',
        },
        {
          path: referencePath,
          kind: 'design-asset',
          reason: 'approved real product screenshot reference',
        },
      ],
      local_only: [{ path: diagnosticPath }],
    },
    owner: 'sdcorejs-design',
  });

  const serialized = JSON.stringify(closure);
  assert.ok(closure.sdcorejs_artifacts.required_paths.includes(exportPath));
  assert.ok(closure.sdcorejs_artifacts.required_paths.includes(referencePath));
  assert.ok(closure.sdcorejs_artifacts.local_only_paths.includes(diagnosticPath));
  assert.deepEqual(closure.sdcorejs_artifacts.unknown_paths, []);
  assert.deepEqual(closure.sdcorejs_artifacts.sensitive_paths, []);
  assert.equal(closure.sdcorejs_artifacts.closure_result, 'complete');

  const byPath = new Map(closure.classifications.map((item) => [item.path, item]));
  for (const binaryPath of [exportPath, referencePath]) {
    const entry = byPath.get(binaryPath);
    assert.equal(entry.binary, true, `${binaryPath} must be treated as binary`);
    assert.equal(entry.kind, 'design-asset');
    assert.equal(entry.byte_size, png.byteLength);
    assert.match(entry.content_hash, /^sha256:[a-f0-9]{64}$/);
    assert.deepEqual(entry.metadata, {}, 'binary bytes are never parsed as frontmatter');
  }
  for (const marker of [
    String.fromCharCode(0),
    'IHDR',
    'IEND',
    png.toString('base64'),
    png.toString('latin1'),
  ]) {
    assert.ok(
      !serialized.includes(marker),
      'binary content must never be echoed into the closure report',
    );
  }

  const withoutRuntimeContext = await buildArtifactClosure({
    root,
    changeRef: 'orders-change',
    owner: 'sdcorejs-design',
  });
  assert.ok(
    withoutRuntimeContext.sdcorejs_artifacts.required_paths.includes(exportPath),
    'the Design ledger relationship alone must classify a durable PNG',
  );
  const inferred = withoutRuntimeContext.classifications.find(
    (item) => item.path === exportPath,
  );
  assert.match(inferred.reason, /design ledger relationship for feature orders/);

  const otherChange = await buildArtifactClosure({
    root,
    changeRef: 'invoices-change',
    owner: 'sdcorejs-design',
  });
  assert.ok(
    otherChange.sdcorejs_artifacts.excluded_unrelated_paths.includes(exportPath),
    'a durable PNG from another change stays unrelated',
  );

  assert.equal(isBinaryArtifactPath(exportPath), true);
  assert.equal(isBinaryArtifactPath('.sdcorejs/design/specs/orders.md'), false);
  assert.deepEqual(
    scanSensitiveArtifactPath('.sdcorejs/design/references/orders/service-account.png'),
    ['credential-file-name'],
  );
  assert.deepEqual(scanSensitiveArtifactContent(exportPath, png), []);
});

test('documentation promotion is scoped to the documentation root without becoming an escape hatch', async () => {
  const root = await createGitRepo();
  await write(root, 'README.md', '# Fixture\n');
  await commitAll(root, 'initial');

  const productDoc = '.sdcorejs/product/prds/orders.md';
  const masquerade = '.sdcorejs/specs/masquerade.md';
  const guideImage = '.sdcorejs/documentation/user-guides/orders/images/list.png';
  await write(root, productDoc, artifact('product-doc', 'orders-change', 'sdcorejs-product'));
  await write(
    root,
    masquerade,
    artifact('documentation-asset', 'orders-change', 'sdcorejs-product'),
  );
  await writeBytes(root, guideImage, minimalPngBytes());

  const closure = await buildArtifactClosure({
    root,
    changeRef: 'orders-change',
    artifactContext: {
      required_with_change: [
        { path: productDoc },
        { path: masquerade },
        { path: guideImage },
      ],
    },
    owner: 'sdcorejs-product',
  });

  assert.ok(
    closure.sdcorejs_artifacts.required_paths.includes(productDoc),
    'a Product path is classified by the Product root, not documentation-layout promotion',
  );
  assert.equal(
    closure.classifications.find((item) => item.path === productDoc).kind,
    'product-doc',
  );
  assert.ok(
    closure.sdcorejs_artifacts.unknown_paths.includes(masquerade),
    'scoping the promotion gate must not let a documentation-asset kind claimed outside the documentation root through',
  );
  assert.match(
    closure.classifications.find((item) => item.path === masquerade).reason,
    /documentation-asset declared outside the documentation root/,
  );
  assert.ok(
    closure.sdcorejs_artifacts.unknown_paths.includes(guideImage),
    'an unverified documentation image inside the documentation root stays rejected',
  );
  assert.match(
    closure.classifications.find((item) => item.path === guideImage).reason,
    /documentation promotion rejected/,
  );
  assert.equal(closure.sdcorejs_artifacts.closure_result, 'ambiguous');

  assert.equal(
    classifyArtifact({
      path: productDoc,
      metadata: { artifact_kind: 'product-doc', change_ref: 'orders-change' },
      changeRef: 'orders-change',
    }).bucket,
    'required_with_change',
  );
});

test('secret screening survives the binary-safe read for every file shape', async () => {
  const root = await createGitRepo();
  await write(root, 'README.md', '# Fixture\n');
  await commitAll(root, 'initial');

  const nulBearingText = '.sdcorejs/design/wireframes/orders/list.html';
  const textInBinaryExtension = '.sdcorejs/design/exports/png/orders/notes.pdf';
  const opaqueImage = '.sdcorejs/design/exports/png/orders/list.png';
  await write(
    root,
    '.sdcorejs/docs/design/orders.md',
    artifact('design-handoff', 'orders-change', 'sdcorejs-design', { feature: 'orders' }),
  );
  // A text artifact carrying a stray NUL must not be downgraded to path-only
  // screening, or a private key rides along inside an approved wireframe.
  await writeBytes(
    root,
    nulBearingText,
    Buffer.concat([
      Buffer.from('<main>'),
      Buffer.from([0]),
      Buffer.from('</main>\n-----BEGIN PRIVATE KEY-----\nredacted\n'),
    ]),
  );
  // A binary extension holding decodable text is still text.
  await write(root, textInBinaryExtension, 'api_key = "REDACTED-LOOKALIKE"\n');
  await writeBytes(root, opaqueImage, minimalPngBytes());

  const closure = await buildArtifactClosure({
    root,
    changeRef: 'orders-change',
    owner: 'sdcorejs-design',
  });
  const at = (candidate) =>
    closure.classifications.find((item) => item.path === candidate);

  assert.deepEqual(at(nulBearingText).sensitive_categories, ['private-key']);
  assert.deepEqual(at(textInBinaryExtension).sensitive_categories, [
    'secret-like-assignment',
  ]);
  assert.deepEqual(
    at(opaqueImage).sensitive_categories,
    [],
    'genuinely opaque bytes are never text-scanned',
  );
  assert.deepEqual(at(opaqueImage).metadata, {});
  assert.match(
    closure.sdcorejs_artifacts.blockers.join('\n'),
    /secret or PII screening requires remediation/,
  );
  assert.notEqual(closure.sdcorejs_artifacts.closure_result, 'complete');
});

test('a ledger cannot claim another feature identity or silently win a collision', async () => {
  const root = await createGitRepo();
  await write(root, 'README.md', '# Fixture\n');
  await commitAll(root, 'initial');

  const exportPath = '.sdcorejs/design/exports/png/orders/list.png';
  await write(
    root,
    '.sdcorejs/docs/design/orders.md',
    artifact('design-handoff', 'orders-change', 'sdcorejs-design', { feature: 'orders' }),
  );
  await writeBytes(root, exportPath, minimalPngBytes());

  const clean = await buildArtifactClosure({
    root,
    changeRef: 'orders-change',
    owner: 'sdcorejs-design',
  });
  assert.deepEqual(clean.sdcorejs_artifacts.feature_ledger_conflicts, []);
  assert.ok(clean.sdcorejs_artifacts.required_paths.includes(exportPath));

  await write(
    root,
    '.sdcorejs/docs/design/payments.md',
    artifact('design-handoff', 'payments-change', 'sdcorejs-design', { feature: 'orders' }),
  );
  const impostor = await buildArtifactClosure({
    root,
    changeRef: 'orders-change',
    owner: 'sdcorejs-design',
  });
  assert.deepEqual(impostor.sdcorejs_artifacts.feature_ledger_conflicts, [
    {
      code: 'LEDGER_FEATURE_IDENTITY_MISMATCH',
      path: '.sdcorejs/docs/design/payments.md',
      declared_feature: 'orders',
      expected_feature: 'payments',
    },
  ]);
  assert.match(
    impostor.sdcorejs_artifacts.blockers.join('\n'),
    /ledger feature identity conflict/,
  );
  assert.ok(
    impostor.sdcorejs_artifacts.required_paths.includes(exportPath),
    'the impostor ledger must not overwrite the real feature mapping',
  );
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

test('artifact closure validates nested documentation units and canonical legacy duplicates', async () => {
  const root = await createGitRepo();
  await write(root, 'README.md', '# Fixture\n');
  await commitAll(root, 'initial');

  const guidePath =
    '.sdcorejs/documentation/user-guides/orders/orders.md';
  const legacyGuidePath =
    '.sdcorejs/documentation/user-guides/orders.md';
  const imagePath =
    '.sdcorejs/documentation/user-guides/orders/images/list.png';
  const unverifiedImagePath =
    '.sdcorejs/documentation/user-guides/orders/images/unverified.png';
  const attachmentPath =
    '.sdcorejs/documentation/user-guides/orders/attachments/raw.md';
  const sharedPath =
    '.sdcorejs/documentation/_shared/images/system-flow.png';
  const guide = artifact(
    'documentation-asset',
    'documentation-layout-v2',
    'sdcorejs-documentation',
  );
  await write(root, guidePath, guide);
  await write(root, legacyGuidePath, guide);
  await write(root, imagePath, Uint8Array.from([137, 80, 78, 71]));
  await write(root, unverifiedImagePath, Uint8Array.from([137, 80, 78, 72]));
  await write(root, attachmentPath, '# Unrelated attachment\n');
  await write(root, sharedPath, Uint8Array.from([137, 80, 78, 71, 2]));
  await write(
    root,
    '.sdcorejs/documentation/user-guides/orders/images/failure.trace',
    'diagnostic\n',
  );

  const closure = await buildArtifactClosure({
    root,
    changeRef: 'documentation-layout-v2',
    artifactContext: {
      required_with_change: [
        { path: guidePath },
        { path: legacyGuidePath },
        {
          path: imagePath.replaceAll('/', '\\'),
          guide_path: guidePath.replaceAll('/', '\\'),
          related_entry_path: guidePath,
          relationship_verified: true,
        },
        {
          path: unverifiedImagePath,
          guide_path: guidePath,
          related_entry_path: guidePath,
        },
        { path: sharedPath },
        { path: '../outside.md' },
      ],
    },
    owner: 'sdcorejs-documentation',
  });

  assert.ok(
    closure.sdcorejs_artifacts.required_paths.includes(guidePath),
    JSON.stringify({
      artifacts: closure.sdcorejs_artifacts,
      classifications: closure.classifications,
    }),
  );
  assert.ok(closure.sdcorejs_artifacts.required_paths.includes(imagePath));
  assert.ok(
    closure.sdcorejs_artifacts.unknown_paths.includes(unverifiedImagePath),
  );
  assert.ok(!closure.sdcorejs_artifacts.included_paths.includes(legacyGuidePath));
  assert.ok(
    closure.sdcorejs_artifacts.excluded_unrelated_paths.includes(
      legacyGuidePath,
    ),
  );
  assert.ok(closure.sdcorejs_artifacts.unknown_paths.includes(attachmentPath));
  assert.ok(closure.sdcorejs_artifacts.unknown_paths.includes(sharedPath));
  assert.ok(
    closure.sdcorejs_artifacts.local_only_paths.includes(
      '.sdcorejs/documentation/user-guides/orders/images/failure.trace',
    ),
  );
  assert.ok(closure.sdcorejs_artifacts.invalid_context_paths.includes('../outside.md'));
  assert.equal(closure.sdcorejs_artifacts.documentation_layout_conflicts.length, 0);

  await write(root, legacyGuidePath, `${guide}\nConflicting legacy body.\n`);
  const conflicting = await buildArtifactClosure({
    root,
    changeRef: 'documentation-layout-v2',
    artifactContext: {
      required_with_change: [{ path: guidePath }, { path: legacyGuidePath }],
    },
  });
  assert.equal(conflicting.sdcorejs_artifacts.documentation_layout_conflicts.length, 1);
  assert.match(
    conflicting.sdcorejs_artifacts.blockers.join('\n'),
    /canonical\/legacy conflict/,
  );
  assert.ok(conflicting.sdcorejs_artifacts.unknown_paths.includes(guidePath));
  assert.ok(conflicting.sdcorejs_artifacts.unknown_paths.includes(legacyGuidePath));
});

test('artifact closure compares changed documentation entries with projected counterparts', async () => {
  const conflictRoot = await createGitRepo();
  const canonicalPath =
    '.sdcorejs/documentation/user-guides/orders/orders.md';
  const legacyPath = '.sdcorejs/documentation/user-guides/orders.md';
  const canonicalGuide = artifact(
    'documentation-asset',
    'documentation-layout-v2',
    'sdcorejs-documentation',
  );
  await write(conflictRoot, canonicalPath, canonicalGuide);
  await commitAll(conflictRoot, 'canonical guide');
  await write(conflictRoot, legacyPath, `${canonicalGuide}\nConflicting flat copy.\n`);

  const conflict = await buildArtifactClosure({
    root: conflictRoot,
    changeRef: 'documentation-layout-v2',
    artifactContext: {
      required_with_change: [{ path: legacyPath }],
    },
  });
  assert.equal(
    conflict.sdcorejs_artifacts.documentation_layout_conflicts.length,
    1,
    'an unchanged canonical counterpart must still participate in conflict detection',
  );
  assert.match(
    conflict.sdcorejs_artifacts.blockers.join('\n'),
    /canonical\/legacy conflict/,
  );

  const migrationRoot = await createGitRepo();
  await write(migrationRoot, legacyPath, canonicalGuide);
  await commitAll(migrationRoot, 'legacy guide');
  await rm(join(migrationRoot, legacyPath));
  await write(migrationRoot, canonicalPath, canonicalGuide);

  const migrated = await buildArtifactClosure({
    root: migrationRoot,
    changeRef: 'documentation-layout-v2',
    artifactContext: {
      required_with_change: [{ path: legacyPath }, { path: canonicalPath }],
    },
  });
  assert.deepEqual(
    migrated.sdcorejs_artifacts.documentation_layout_conflicts,
    [],
    'a deleted legacy source must not be compared as an empty live copy',
  );
  assert.equal(migrated.sdcorejs_artifacts.closure_result, 'complete');
  assert.ok(migrated.sdcorejs_artifacts.required_paths.includes(legacyPath));
  assert.ok(migrated.sdcorejs_artifacts.required_paths.includes(canonicalPath));
});

test('artifact closure analysis blocks case-insensitive documentation entry collisions', () => {
  assert.equal(
    typeof artifactLifecycle.analyzeDocumentationDuplicates,
    'function',
    'the lifecycle duplicate analyzer must be directly regression-testable',
  );
  const upperPath =
    '.sdcorejs/documentation/requirements/ABC/ABC.md';
  const lowerPath =
    '.sdcorejs/documentation/requirements/abc/abc.md';
  const analysis = artifactLifecycle.analyzeDocumentationDuplicates({
    [upperPath]: '# Upper\n',
    [lowerPath]: '# Lower\n',
  });

  assert.ok(
    analysis.conflicts.some(
      (conflict) =>
        conflict.code === 'CASE_INSENSITIVE_COLLISION' &&
        conflict.category === 'requirements',
    ),
  );
  assert.equal(analysis.byPath.get(upperPath)?.state, 'conflict');
  assert.equal(analysis.byPath.get(lowerPath)?.state, 'conflict');
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
    'product-ledger',
    'design-handoff',
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

async function writeBytes(root, relativePath, bytes) {
  const absolutePath = join(root, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, bytes);
}

/** Deterministic 1x1 grayscale PNG built from real chunks, not a decoded blob. */
function minimalPngBytes() {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const header = Buffer.alloc(13);
  header.writeUInt32BE(1, 0);
  header.writeUInt32BE(1, 4);
  header[8] = 8;
  header[9] = 0;
  return Buffer.concat([
    signature,
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(Buffer.from([0x00, 0x00]), { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.byteLength, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, checksum]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
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
