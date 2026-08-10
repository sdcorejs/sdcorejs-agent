import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  DOCUMENTATION_CATEGORY_REGISTRY,
  DOCUMENTATION_LAYOUT_VERSION,
  DOCUMENTATION_ROOT,
  DOCUMENTATION_SINGLETONS,
  applyMigrationPlanToSnapshot,
  buildAggregateUserGuide,
  buildCanonicalEntryPath,
  buildDocumentationMigrationPlan,
  buildLegacyEntryPath,
  buildMultiRepositoryDocumentationAggregate,
  buildPandocExportPlan,
  buildSharedAssetPath,
  buildUnitAssetPath,
  classifyDocumentationPath,
  discoverDocumentationEntries,
  normalizeRepositoryPath,
  resolveDocumentationEntryState,
  resolveDocumentationWriteTarget,
  resolveDocumentationTailPlan,
  summarizeExportCapabilities,
  validateDocumentationVisualEvidence,
  validateDocumentKey,
  validateGuideImageRelationship,
} from '../../_refs/shared/documentation-layout.mjs';

const root = path.resolve('.');
const ONE_PIXEL_PNG = Uint8Array.from(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64',
  ),
);
const CORRUPTED_ONE_PIXEL_PNG = Uint8Array.from(ONE_PIXEL_PNG);
const corruptedIdatOffset =
  Buffer.from(CORRUPTED_ONE_PIXEL_PNG).indexOf(Buffer.from('IDAT')) + 4;
CORRUPTED_ONE_PIXEL_PNG[corruptedIdatOffset] ^= 0xff;

test('Documentation Layout v2 resolves canonical entries and unit-local assets', () => {
  assert.equal(DOCUMENTATION_LAYOUT_VERSION, 2);
  assert.equal(DOCUMENTATION_ROOT, '.sdcorejs/documentation');
  assert.equal(DOCUMENTATION_CATEGORY_REGISTRY['user-guides'].active, true);
  assert.equal(DOCUMENTATION_CATEGORY_REGISTRY.requirements.active, true);
  assert.equal(DOCUMENTATION_CATEGORY_REGISTRY['technical-docs'].active, true);
  assert.equal(
    DOCUMENTATION_CATEGORY_REGISTRY.presentations.active,
    false,
    'presentations remain compatibility-recognized until an active producer exists',
  );

  assert.equal(
    buildCanonicalEntryPath('user-guides', 'code-generator'),
    '.sdcorejs/documentation/user-guides/code-generator/code-generator.md',
  );
  assert.equal(
    buildCanonicalEntryPath('requirements', 'NSP-3149'),
    '.sdcorejs/documentation/requirements/NSP-3149/NSP-3149.md',
  );
  assert.equal(
    buildCanonicalEntryPath('technical-docs', 'api-generator-config'),
    '.sdcorejs/documentation/technical-docs/api-generator-config/api-generator-config.md',
  );
  assert.equal(
    buildCanonicalEntryPath('presentations', 'example', { allowInactive: true }),
    '.sdcorejs/documentation/presentations/example/example.html',
  );
  assert.equal(
    buildUnitAssetPath('user-guides', 'code-generator', 'images', 'list.png'),
    '.sdcorejs/documentation/user-guides/code-generator/images/list.png',
  );
  assert.equal(
    buildUnitAssetPath('technical-docs', 'api-orders', 'schemas', 'order.json'),
    '.sdcorejs/documentation/technical-docs/api-orders/schemas/order.json',
  );
  assert.equal(
    buildUnitAssetPath('requirements', 'NSP-3149', 'attachments', 'approval.pdf'),
    '.sdcorejs/documentation/requirements/NSP-3149/attachments/approval.pdf',
  );
  assert.throws(
    () => buildUnitAssetPath('user-guides', 'orders', 'images', 'bad:name.png'),
    /cross-platform safe/i,
  );

  assert.deepEqual(DOCUMENTATION_SINGLETONS, [
    '.sdcorejs/documentation/preferences.md',
    '.sdcorejs/documentation/sdcorejs-user-guide.md',
    '.sdcorejs/documentation/sdcorejs-user-guide.docx',
    '.sdcorejs/documentation/sdcorejs-user-guide.pdf',
  ]);
});

test('documentation writes resolve to the semantic owner repository without portal fallback', () => {
  const portal = { repository_id: 'github.com/sdcorejs/portal' };
  const module = {
    id: 'orders',
    repository_id: 'github.com/sdcorejs/orders',
    available: true,
    writable: true,
  };
  const moduleTarget = resolveDocumentationWriteTarget({
    document_role: 'module-source',
    category: 'user-guides',
    key: 'orders',
    scope: 'module',
    module,
    portal,
    execution_host_repository_id: portal.repository_id,
  });
  assert.deepEqual(moduleTarget, {
    status: 'resolved',
    artifact_kind: 'documentation-asset',
    document_role: 'module-source',
    owner_repository_id: module.repository_id,
    owner_repository_role: 'module',
    owner_module_id: 'orders',
    execution_host_repository_id: portal.repository_id,
    repository_relative_path:
      '.sdcorejs/documentation/user-guides/orders/orders.md',
    blockers: [],
  });

  const unavailable = resolveDocumentationWriteTarget({
    document_role: 'module-source',
    category: 'requirements',
    key: 'NSP-3149',
    scope: 'module',
    module: { ...module, available: false },
    portal,
    execution_host_repository_id: portal.repository_id,
  });
  assert.equal(unavailable.status, 'blocked');
  assert.equal(unavailable.repository_relative_path, null);
  assert.match(unavailable.blockers.join(' '), /unavailable/i);

  assert.throws(
    () =>
      resolveDocumentationWriteTarget({
        document_role: 'module-source',
        category: 'technical-docs',
        key: 'orders-api',
        scope: 'portal-composition',
        module,
        portal,
        execution_host_repository_id: portal.repository_id,
      }),
    /portal fallback is forbidden/i,
  );

  const aggregate = resolveDocumentationWriteTarget({
    document_role: 'aggregate',
    scope: 'cross-repository-aggregate',
    portal,
    execution_host_repository_id: module.repository_id,
  });
  assert.equal(aggregate.owner_repository_id, portal.repository_id);
  assert.equal(
    aggregate.repository_relative_path,
    '.sdcorejs/documentation/sdcorejs-user-guide.md',
  );
});

test('multi-repository aggregate is a provenance-bound projection, not a second editable module source', () => {
  const ordersRevision = 'a'.repeat(40);
  const usersRevision = 'b'.repeat(40);
  const ordersGuide =
    '# Orders\n\n## Tasks\n\n![List](images/list.png)\n';
  const result = buildMultiRepositoryDocumentationAggregate({
    projectTitle: 'Portal',
    generatedAt: '2026-07-31T00:00:00Z',
    portalRevision: 'c'.repeat(40),
    changeRef: 'docs-multi-repo',
    sources: [
      {
        module_id: 'orders',
        repository_id: 'github.com/sdcorejs/orders',
        source_revision: ordersRevision,
        source_mode: 'versioned-export',
        export_version: 'orders-docs@1',
        source_path:
          '.sdcorejs/documentation/user-guides/orders/orders.md',
        content_sha256: createHash('sha256').update(ordersGuide).digest('hex'),
        files: {
          '.sdcorejs/documentation/user-guides/orders/orders.md': ordersGuide,
          '.sdcorejs/documentation/user-guides/orders/images/list.png':
            ONE_PIXEL_PNG,
        },
        verified_image_evidence: [
          verifiedCapture(
            '.sdcorejs/documentation/user-guides/orders/orders.md',
            '.sdcorejs/documentation/user-guides/orders/images/list.png',
            ordersRevision,
            'capture-orders-multi-repo',
            ONE_PIXEL_PNG,
            'docs-multi-repo',
          ),
        ],
      },
      {
        module_id: 'users',
        repository_id: 'github.com/sdcorejs/users',
        source_revision: usersRevision,
        source_mode: 'repository-link',
        source_path:
          '.sdcorejs/documentation/user-guides/users/users.md',
        source_url:
          'https://github.com/sdcorejs/users/blob/bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb/.sdcorejs/documentation/user-guides/users/users.md',
        title: 'Users',
      },
    ],
  });

  assert.equal(result.ok, true);
  assert.equal(result.generated_projection, true);
  assert.equal(result.editable_source, false);
  assert.deepEqual(
    result.provenance.map(({ module_id, source_mode }) => ({
      module_id,
      source_mode,
    })),
    [
      { module_id: 'orders', source_mode: 'versioned-export' },
      { module_id: 'users', source_mode: 'repository-link' },
    ],
  );
  assert.match(result.output, /generated_projection: true/);
  assert.match(result.output, /editable_source: false/);
  assert.match(result.output, /github\.com\/sdcorejs\/orders/);
  assert.match(result.output, new RegExp(ordersRevision));
  assert.match(
    result.output,
    /!\[List\]\(user-guides\/orders\/images\/list\.png\)/,
  );
  assert.match(result.output, /users\/blob\/b{40}/);
  assert.deepEqual(result.projected_assets, [
    '.sdcorejs/documentation/user-guides/orders/images/list.png',
  ]);

  const missingSource = buildMultiRepositoryDocumentationAggregate({
    projectTitle: 'Portal',
    generatedAt: '2026-07-31T00:00:00Z',
    portalRevision: 'c'.repeat(40),
    changeRef: 'docs-multi-repo',
    sources: [
      {
        module_id: 'orders',
        repository_id: 'github.com/sdcorejs/orders',
        source_revision: ordersRevision,
        source_mode: 'versioned-export',
        export_version: 'orders-docs@1',
        source_path:
          '.sdcorejs/documentation/user-guides/orders/orders.md',
        content_sha256: '0'.repeat(64),
        files: {},
      },
    ],
  });
  assert.equal(missingSource.ok, false);
  assert.ok(
    missingSource.errors.some(
      ({ code }) => code === 'MISSING_VERSIONED_SOURCE',
    ),
  );

  const duplicate = buildMultiRepositoryDocumentationAggregate({
    projectTitle: 'Portal',
    portalRevision: 'c'.repeat(40),
    sources: [
      {
        module_id: 'orders',
        repository_id: 'github.com/sdcorejs/orders',
        source_revision: ordersRevision,
        source_mode: 'repository-link',
        source_path:
          '.sdcorejs/documentation/user-guides/orders/orders.md',
        source_url: 'https://example.test/orders',
      },
      {
        module_id: 'orders',
        repository_id: 'github.com/sdcorejs/orders-copy',
        source_revision: ordersRevision,
        source_mode: 'repository-link',
        source_path:
          '.sdcorejs/documentation/user-guides/orders/orders.md',
        source_url: 'https://example.test/orders-copy',
      },
    ],
  });
  assert.equal(duplicate.ok, false);
  assert.ok(
    duplicate.errors.some(
      ({ code }) => code === 'DUPLICATE_MODULE_SOURCE',
    ),
  );
});

test('documentation visual evidence distinguishes real UI from generated visuals and binds revisions', () => {
  const revision = 'a'.repeat(40);
  const guidePath =
    '.sdcorejs/documentation/user-guides/orders/orders.md';
  const imagePath =
    '.sdcorejs/documentation/user-guides/orders/images/list.png';
  const files = new Map([
    [guidePath, '# Orders\n'],
    [imagePath, ONE_PIXEL_PNG],
  ]);
  const realUi = verifiedCapture(
    guidePath,
    imagePath,
    revision,
    'capture-visual-contract',
    ONE_PIXEL_PNG,
  );
  assert.deepEqual(
    validateDocumentationVisualEvidence({ record: realUi, sourceFiles: files }),
    {
      ok: true,
      code: null,
      evidence_origin: 'real-ui',
      usable_as_real_ui_screenshot: true,
      guide_path: guidePath,
      image_path: imagePath,
    },
  );

  const mockup = {
    ...realUi,
    evidence_origin: 'generated-mockup',
    generator: 'imagegen',
  };
  assert.deepEqual(
    validateDocumentationVisualEvidence({ record: mockup, sourceFiles: files }),
    {
      ok: true,
      code: null,
      evidence_origin: 'generated-mockup',
      usable_as_real_ui_screenshot: false,
      guide_path: guidePath,
      image_path: imagePath,
    },
  );
  const missingRevision = { ...realUi };
  delete missingRevision.app_revision;
  assert.equal(
    validateDocumentationVisualEvidence({
      record: missingRevision,
      sourceFiles: files,
    }).code,
    'INVALID_VISUAL_REVISION',
  );
});

test('key validation and repository paths fail closed across Windows and POSIX inputs', () => {
  assert.deepEqual(validateDocumentKey('user-guides', 'orders'), {
    ok: true,
    key: 'orders',
  });
  assert.deepEqual(validateDocumentKey('requirements', 'NSP_3149'), {
    ok: true,
    key: 'NSP_3149',
  });
  assert.equal(normalizeRepositoryPath('.sdcorejs\\documentation\\user-guides\\orders\\orders.md').path,
    '.sdcorejs/documentation/user-guides/orders/orders.md');

  for (const key of [
    '',
    '.',
    '..',
    '...',
    'Orders',
    'orders/',
    'orders\\detail',
    '/orders',
    'C:\\orders',
    'orders.',
    'orders ',
    '-orders',
    'orders-',
    'orders--history',
    'CON',
    'com1',
    'Lpt9',
  ]) {
    assert.equal(
      validateDocumentKey('user-guides', key).ok,
      false,
      `user-guide key ${JSON.stringify(key)} must be rejected`,
    );
  }

  for (const key of ['', '.', '..', '...', 'NSP/3149', 'NSP\\3149', 'C:\\NSP-3149', 'NUL']) {
    assert.equal(
      validateDocumentKey('requirements', key).ok,
      false,
      `requirement key ${JSON.stringify(key)} must be rejected`,
    );
  }
  assert.equal(validateDocumentKey('requirements', 'NSP.3149').ok, false);
  assert.equal(
    validateDocumentKey('user-guides', 'orders', { existingKeys: ['Orders'] }).code,
    'CASE_INSENSITIVE_COLLISION',
  );

  for (const unsafe of [
    '../outside.md',
    '.sdcorejs/documentation/../../outside.md',
    '/absolute/path.md',
    'C:\\absolute\\path.md',
    'C:drive-relative.md',
    '\\\\server\\share\\path.md',
    ' .sdcorejs/documentation/user-guides/orders/orders.md',
    '.sdcorejs/documentation/user-guides/orders/orders.md ',
    '.sdcorejs/documentation/user-guides/orders/images/NUL.png',
    '.sdcorejs/documentation/user-guides/orders/images/CON.tar.gz',
    '.sdcorejs/documentation/user-guides/orders/images/COM1.backup.png',
  ]) {
    assert.equal(normalizeRepositoryPath(unsafe).ok, false, `${unsafe} must fail closed`);
  }
  assert.equal(
    classifyDocumentationPath(
      '.sdcorejs/documentation/user-guides/CON/images/list.png',
    ).ok,
    false,
  );
});

test('documentation gate blocks case-insensitive existing-path collisions', () => {
  const result = resolveDocumentationEntryState({
    category: 'requirements',
    key: 'NSP-1',
    files: {
      '.sdcorejs/documentation/requirements/nsp-1/nsp-1.md':
        '# Existing lower-case requirement\n',
    },
  });

  assert.equal(result.state, 'case-insensitive-conflict');
  assert.equal(result.selectedPath, null);
  assert.equal(result.conflict, 'CASE_INSENSITIVE_COLLISION');
  assert.deepEqual(result.conflictingPaths, [
    '.sdcorejs/documentation/requirements/nsp-1/nsp-1.md',
  ]);
});

test('documentation gate and aggregate block slash-normalized path collisions', () => {
  const files = {
    '.sdcorejs/documentation/user-guides/orders/orders.md': '# Orders\n',
    '.sdcorejs\\documentation\\user-guides\\orders\\orders.md': '# Different orders\n',
  };
  const state = resolveDocumentationEntryState({
    files,
    category: 'user-guides',
    key: 'orders',
  });
  assert.equal(state.state, 'path-inventory-conflict');
  assert.equal(state.selectedPath, null);

  const aggregate = buildAggregateUserGuide({
    files,
    projectTitle: 'Fixture',
    generatedAt: '2026-07-29T00:00:00Z',
    gitHead: 'a'.repeat(40),
    changeRef: 'docs-v2',
  });
  assert.equal(aggregate.ok, false);
  assert.ok(aggregate.errors.some((error) => error.code === 'NORMALIZED_PATH_COLLISION'));
});

test('documentation gate blocks filesystem aliases with trailing or repeated separators', () => {
  for (const unsafePath of [
    '.sdcorejs/documentation/user-guides/orders/orders.md ',
    '.sdcorejs/documentation/user-guides/orders/orders.md.',
    '.sdcorejs/documentation/user-guides//orders/orders.md',
  ]) {
    const state = resolveDocumentationEntryState({
      files: { [unsafePath]: '# Unsafe alias\n' },
      category: 'user-guides',
      key: 'orders',
    });
    assert.equal(state.state, 'path-inventory-conflict', unsafePath);
    assert.equal(state.selectedPath, null);
  }
});

test('migration preflight rejects unsafe and normalized-colliding input paths', () => {
  const legacyPath = '.sdcorejs/documentation/user-guides/orders.md';
  const plan = buildDocumentationMigrationPlan({
    files: [
      [legacyPath, '# Orders\n'],
      [legacyPath.replaceAll('/', '\\'), '# Conflicting alias\n'],
      ['../outside.md', '# Outside\n'],
    ],
    documentScope: ['user-guides:orders'],
    authorizedDocuments: ['user-guides:orders'],
  });

  assert.equal(plan.ok, false);
  assert.equal(plan.preflight.complete, false);
  assert.ok(
    plan.conflicts.some(
      (conflict) => conflict.code === 'NORMALIZED_PATH_COLLISION',
    ),
  );
  assert.ok(
    plan.conflicts.some((conflict) => conflict.code === 'PATH_TRAVERSAL'),
  );
});

test('canonical-first discovery accepts exact entry shapes and excludes nested Markdown assets', () => {
  const files = {
    '.sdcorejs/documentation/user-guides/orders/orders.md': '# Orders\n',
    '.sdcorejs/documentation/user-guides/orders/examples/request.md': '# Example\n',
    '.sdcorejs/documentation/user-guides/orders/attachments/readme.md': '# Attachment\n',
    '.sdcorejs/documentation/user-guides/orders/diagrams/flow.md': '# Diagram source\n',
    '.sdcorejs/documentation/user-guides/users.md': '# Users\n',
    '.sdcorejs/documentation/user-guides/_shared/ignored.md': '# Ignored\n',
  };

  const result = discoverDocumentationEntries(files, { category: 'user-guides' });
  assert.deepEqual(result.canonical.map((entry) => entry.key), ['orders']);
  assert.deepEqual(result.legacy.map((entry) => entry.key), ['users']);
  assert.deepEqual(result.excluded.sort(), [
    '.sdcorejs/documentation/user-guides/_shared/ignored.md',
    '.sdcorejs/documentation/user-guides/orders/attachments/readme.md',
    '.sdcorejs/documentation/user-guides/orders/diagrams/flow.md',
    '.sdcorejs/documentation/user-guides/orders/examples/request.md',
  ]);
});

test('documentation gate distinguishes canonical, legacy, equivalent, conflict, missing, and explicit paths', () => {
  const canonicalPath = buildCanonicalEntryPath('user-guides', 'orders');
  const legacyPath = buildLegacyEntryPath('user-guides', 'orders');
  const files = {
    [canonicalPath]: '\uFEFF---\r\nmodule: orders\r\n---\r\n# Orders\r\n',
    [legacyPath]: '---\nmodule: orders\n---\n# Orders\n',
    [buildLegacyEntryPath('user-guides', 'users')]: '# Users\n',
    '.sdcorejs/documentation/custom/approved.md': '# Explicit\n',
  };

  assert.equal(
    resolveDocumentationEntryState({ files, category: 'user-guides', key: 'orders' }).state,
    'both-equivalent',
  );
  assert.equal(
    resolveDocumentationEntryState({ files, category: 'user-guides', key: 'users' }).state,
    'legacy-existing',
  );
  assert.equal(
    resolveDocumentationEntryState({ files, category: 'technical-docs', key: 'orders' }).state,
    'missing',
  );
  const explicit = resolveDocumentationEntryState({
    files,
    category: 'technical-docs',
    key: 'orders',
    explicitPath: '.sdcorejs/documentation/custom/approved.md',
  });
  assert.equal(explicit.state, 'explicit-existing');
  assert.equal(explicit.selectedPath, '.sdcorejs/documentation/custom/approved.md');

  files[legacyPath] = '# Different legacy content\n';
  assert.equal(
    resolveDocumentationEntryState({ files, category: 'user-guides', key: 'orders' }).state,
    'both-conflicting',
  );
});

test('migration plan maps flat entries and owned assets without mutating source input', () => {
  const imageBytes = Uint8Array.from([0, 1, 2, 3, 254, 255]);
  const files = {
    '.sdcorejs/documentation/user-guides/code-generator.md': `---
artifact_id: guide-code-generator
artifact_kind: documentation-asset
change_ref: code-generator-v2
source_spec: .sdcorejs/specs/angular/code-generator.md
source_plan: .sdcorejs/plans/angular/code-generator.md
commit_policy: with-change
owner: sdcorejs-documentation
module: code-generator
---

# Code Generator

![List](images/code-generator-list.png)
`,
    '.sdcorejs/documentation/user-guides/images/code-generator-list.png': imageBytes,
    '.sdcorejs/documentation/user-guides/images/capture.png': imageBytes,
    '.sdcorejs/documentation/requirements/NSP-3149.md': '# Requirement\n',
    '.sdcorejs/documentation/technical-docs/api-generator-config.md': '# API generator config\n',
    '.sdcorejs/docs/workflow/trace.md': `guide_path: .sdcorejs/documentation/user-guides/code-generator.md
image:
  file: .sdcorejs/documentation/user-guides/images/code-generator-list.png
artifact_context:
  required_with_change:
    - path: .sdcorejs/documentation/user-guides/code-generator.md
`,
    '.sdcorejs/docs/workflow/references.md': `guide_path: .sdcorejs/documentation/user-guides/code-generator.md
image_path: .sdcorejs/documentation/user-guides/images/code-generator-list.png # current image
related_entry_path: ".sdcorejs/documentation/user-guides/code-generator.md" # current guide
guidePath: ".sdcorejs\\\\documentation\\\\user-guides\\\\code-generator.md"
artifact_path: >-
  .sdcorejs/documentation/user-guides/code-generator.md
source_plan: >-2
  .sdcorejs/documentation/user-guides/code-generator.md
entry_path: >2-
  .sdcorejs/documentation/user-guides/code-generator.md
{"guide_path":".sdcorejs\\\\documentation\\\\user-guides\\\\code-generator.md"}
[Guide](.sdcorejs/documentation/user-guides/code-generator.md)
Historical prose: .sdcorejs/documentation/user-guides/code-generator.md
backup: .sdcorejs/documentation/user-guides/code-generator.md.bak
\`.sdcorejs/documentation/user-guides/code-generator.md\`
\`\`[Inline guide](.sdcorejs/documentation/user-guides/code-generator.md)\`\`

\`\`\`\`text
.sdcorejs/documentation/user-guides/code-generator.md
\`\`\`
[Fence guide](.sdcorejs/documentation/user-guides/code-generator.md)
\`\`\`\`
`,
  };
  const before = snapshotDigest(files);
  const plan = buildDocumentationMigrationPlan({
    files,
    documentScope: [
      'user-guides:code-generator',
      'requirements:NSP-3149',
      'technical-docs:api-generator-config',
    ],
    authorizedDocuments: [
      'user-guides:code-generator',
      'requirements:NSP-3149',
      'technical-docs:api-generator-config',
    ],
    uiCaptureContexts: [
      {
        guide_path:
          '.sdcorejs\\documentation\\user-guides\\code-generator.md',
        image: {
          file: '.sdcorejs\\documentation\\user-guides\\images\\capture.png',
        },
      },
    ],
  });

  assert.equal(snapshotDigest(files), before, 'planning must remain read-only');
  assert.equal(plan.ok, true);
  assert.deepEqual(plan.conflicts, []);
  assert.ok(plan.operations.some((operation) =>
    operation.source === '.sdcorejs/documentation/user-guides/code-generator.md' &&
    operation.destination === '.sdcorejs/documentation/user-guides/code-generator/code-generator.md'));
  assert.ok(plan.operations.some((operation) =>
    operation.source === '.sdcorejs/documentation/user-guides/images/code-generator-list.png' &&
    operation.destination === '.sdcorejs/documentation/user-guides/code-generator/images/list.png'));
  assert.ok(plan.operations.some((operation) =>
    operation.source === '.sdcorejs/documentation/user-guides/images/capture.png' &&
    operation.destination === '.sdcorejs/documentation/user-guides/code-generator/images/capture.png'));
  assert.ok(plan.operations.some((operation) =>
    operation.destination === '.sdcorejs/documentation/requirements/NSP-3149/NSP-3149.md'));
  assert.ok(plan.operations.some((operation) =>
    operation.destination === '.sdcorejs/documentation/technical-docs/api-generator-config/api-generator-config.md'));

  const first = applyMigrationPlanToSnapshot(files, plan);
  assert.equal(first.ok, true);
  assert.equal(first.changed, true);
  assert.ok(first.files['.sdcorejs/documentation/user-guides/code-generator/code-generator.md']);
  assert.ok(!first.files['.sdcorejs/documentation/user-guides/code-generator.md']);
  assert.deepEqual(
    first.files['.sdcorejs/documentation/user-guides/code-generator/images/list.png'],
    imageBytes,
    'binary bytes must remain unchanged',
  );
  assert.match(
    first.files['.sdcorejs/documentation/user-guides/code-generator/code-generator.md'],
    /!\[List\]\(images\/list\.png\)/,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/trace.md'],
    /guide_path: \.sdcorejs\/documentation\/user-guides\/code-generator\/code-generator\.md/,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/trace.md'],
    /file: \.sdcorejs\/documentation\/user-guides\/code-generator\/images\/list\.png/,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/trace.md'],
    /artifact_context:[\s\S]*path: \.sdcorejs\/documentation\/user-guides\/code-generator\/code-generator\.md/,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/references.md'],
    /^guide_path: \.sdcorejs\/documentation\/user-guides\/code-generator\/code-generator\.md/m,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/references.md'],
    /^image_path: \.sdcorejs\/documentation\/user-guides\/code-generator\/images\/list\.png # current image/m,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/references.md'],
    /^related_entry_path: "\.sdcorejs\/documentation\/user-guides\/code-generator\/code-generator\.md" # current guide/m,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/references.md'],
    /^guidePath: "\.sdcorejs\/documentation\/user-guides\/code-generator\/code-generator\.md"/m,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/references.md'],
    /^artifact_path: >-\n  \.sdcorejs\/documentation\/user-guides\/code-generator\/code-generator\.md/m,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/references.md'],
    /^source_plan: >-2\n  \.sdcorejs\/documentation\/user-guides\/code-generator\/code-generator\.md/m,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/references.md'],
    /^entry_path: >2-\n  \.sdcorejs\/documentation\/user-guides\/code-generator\/code-generator\.md/m,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/references.md'],
    /\{"guide_path":"\.sdcorejs\/documentation\/user-guides\/code-generator\/code-generator\.md"\}/,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/references.md'],
    /\[Guide\]\(\.sdcorejs\/documentation\/user-guides\/code-generator\/code-generator\.md\)/,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/references.md'],
    /Historical prose: \.sdcorejs\/documentation\/user-guides\/code-generator\.md/,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/references.md'],
    /backup: \.sdcorejs\/documentation\/user-guides\/code-generator\.md\.bak/,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/references.md'],
    /`\.sdcorejs\/documentation\/user-guides\/code-generator\.md`/,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/references.md'],
    /``\[Inline guide\]\(\.sdcorejs\/documentation\/user-guides\/code-generator\.md\)``/,
  );
  assert.match(
    first.files['.sdcorejs/docs/workflow/references.md'],
    /````text\n\.sdcorejs\/documentation\/user-guides\/code-generator\.md\n```\n\[Fence guide\]\(\.sdcorejs\/documentation\/user-guides\/code-generator\.md\)\n````/,
  );
  assert.match(first.files['.sdcorejs/documentation/user-guides/code-generator/code-generator.md'],
    /artifact_id: guide-code-generator/);
  assert.match(first.files['.sdcorejs/documentation/user-guides/code-generator/code-generator.md'],
    /change_ref: code-generator-v2/);

  const second = applyMigrationPlanToSnapshot(first.files, plan);
  assert.equal(second.ok, true);
  assert.equal(second.changed, false, 'a second migration application must be idempotent');
  assert.equal(snapshotDigest(second.files), snapshotDigest(first.files));
});

test('migration rewrites aggregate root-relative links before removing legacy assets', () => {
  const legacyGuide =
    '.sdcorejs/documentation/user-guides/code-generator.md';
  const legacyImage =
    '.sdcorejs/documentation/user-guides/images/code-generator-list.png';
  const canonicalImage =
    '.sdcorejs/documentation/user-guides/code-generator/images/list.png';
  const aggregatePath =
    '.sdcorejs/documentation/sdcorejs-user-guide.md';
  const files = {
    [legacyGuide]:
      '# Code Generator\n\n![List](images/code-generator-list.png)\n',
    [legacyImage]: Uint8Array.from([1, 2, 3]),
    [aggregatePath]:
      '# Aggregate\n\n![List](user-guides/images/code-generator-list.png)\n',
  };
  const plan = buildDocumentationMigrationPlan({
    files,
    documentScope: ['user-guides:code-generator'],
    authorizedDocuments: ['user-guides:code-generator'],
  });

  assert.equal(plan.ok, true);
  const applied = applyMigrationPlanToSnapshot(files, plan);
  assert.equal(applied.ok, true);
  assert.equal(applied.changed, true);
  assert.ok(!Object.hasOwn(applied.files, legacyImage));
  assert.deepEqual(applied.files[canonicalImage], Uint8Array.from([1, 2, 3]));
  assert.match(
    applied.files[aggregatePath],
    /!\[List\]\(user-guides\/code-generator\/images\/list\.png\)/,
  );
  assert.doesNotMatch(
    applied.files[aggregatePath],
    /user-guides\/images\/code-generator-list\.png/,
  );
});

test('migration preflight blocks collisions and conflicting canonical copies without partial mutation', () => {
  const conflicting = {
    '.sdcorejs/documentation/user-guides/orders.md': '# Legacy orders\n',
    '.sdcorejs/documentation/user-guides/orders/orders.md': '# Canonical orders changed\n',
    '.sdcorejs/documentation/user-guides/images/orders-list.png': Uint8Array.from([1]),
    '.sdcorejs/documentation/user-guides/images/orders-List.png': Uint8Array.from([2]),
  };
  const before = snapshotDigest(conflicting);
  const plan = buildDocumentationMigrationPlan({
    files: conflicting,
    documentScope: ['user-guides:orders'],
    authorizedDocuments: ['user-guides:orders'],
  });
  assert.equal(plan.ok, false);
  assert.ok(plan.conflicts.some((conflict) => conflict.code === 'CANONICAL_LEGACY_CONFLICT'));
  assert.ok(plan.conflicts.some((conflict) => conflict.code === 'CASE_INSENSITIVE_PATH_COLLISION'));

  const applied = applyMigrationPlanToSnapshot(conflicting, plan);
  assert.equal(applied.ok, false);
  assert.equal(applied.changed, false);
  assert.equal(snapshotDigest(applied.files), before);

  const brokenLinks = {
    '.sdcorejs/documentation/user-guides/inventory.md':
      '# Inventory\n\n![Missing](images/missing.png)\n',
  };
  const brokenBefore = snapshotDigest(brokenLinks);
  const brokenPlan = buildDocumentationMigrationPlan({
    files: brokenLinks,
    documentScope: ['user-guides:inventory'],
    authorizedDocuments: ['user-guides:inventory'],
  });
  assert.equal(brokenPlan.ok, false);
  assert.ok(
    brokenPlan.conflicts.some(
      (conflict) => conflict.code === 'BROKEN_MIGRATED_LINK',
    ),
  );
  assert.equal(brokenPlan.preflight.localLinkValidationChecked, true);
  const brokenApplied = applyMigrationPlanToSnapshot(brokenLinks, brokenPlan);
  assert.equal(brokenApplied.changed, false);
  assert.equal(snapshotDigest(brokenApplied.files), brokenBefore);
});

test('migration apply fails closed when the preflight snapshot changes or gains invalid paths', () => {
  const files = {
    '.sdcorejs/documentation/user-guides/orders.md': '# Orders\n',
    'notes/readme.md': '# Notes\n',
  };
  const plan = buildDocumentationMigrationPlan({
    files,
    documentScope: ['user-guides:orders'],
    authorizedDocuments: ['user-guides:orders'],
  });
  assert.equal(plan.ok, true);

  const changedAfterPreflight = {
    ...files,
    'notes/new.md': '# New after preflight\n',
  };
  const staleApply = applyMigrationPlanToSnapshot(changedAfterPreflight, plan);
  assert.equal(staleApply.ok, false);
  assert.ok(
    staleApply.blockers.some(
      (blocker) => blocker.code === 'SNAPSHOT_CHANGED_SINCE_PREFLIGHT',
    ),
  );
  assert.equal(snapshotDigest(staleApply.files), snapshotDigest(changedAfterPreflight));

  const invalidAfterPreflight = {
    ...files,
    'notes\\readme.md': '# Alias\n',
    '../outside.md': '# Outside\n',
  };
  const invalidApply = applyMigrationPlanToSnapshot(invalidAfterPreflight, plan);
  assert.equal(invalidApply.ok, false);
  assert.ok(
    invalidApply.blockers.some(
      (blocker) =>
        blocker.code === 'NORMALIZED_PATH_COLLISION' ||
        blocker.code === 'PATH_TRAVERSAL',
    ),
  );
  assert.equal(snapshotDigest(invalidApply.files), snapshotDigest(invalidAfterPreflight));
});

test('migration blocks a case-variant destination even when bytes are equal', () => {
  const bytes = Uint8Array.from([1, 2, 3]);
  const plan = buildDocumentationMigrationPlan({
    files: {
      '.sdcorejs/documentation/user-guides/orders.md':
        '# Orders\n\n![List](images/orders-list.png)\n',
      '.sdcorejs/documentation/user-guides/images/orders-list.png': bytes,
      '.sdcorejs/documentation/user-guides/orders/images/List.png': bytes,
    },
    documentScope: ['user-guides:orders'],
    authorizedDocuments: ['user-guides:orders'],
  });
  assert.equal(plan.ok, false);
  assert.ok(
    plan.conflicts.some(
      (conflict) => conflict.code === 'CASE_INSENSITIVE_DESTINATION_COLLISION',
    ),
  );
});

test('migration authorization is document-scoped and rewrites assets used by canonical entries', () => {
  const files = {
    '.sdcorejs/documentation/user-guides/orders/orders.md':
      '# Orders\n\n![List](../images/capture.png?raw=1#preview)\n',
    '.sdcorejs/documentation/user-guides/images/capture.png':
      Uint8Array.from([1, 2, 3]),
    '.sdcorejs/documentation/technical-docs/unrelated.md':
      '# Unrelated technical document\n',
  };
  const plan = buildDocumentationMigrationPlan({
    files,
    documentScope: ['user-guides:orders'],
    authorizedDocuments: ['user-guides:orders'],
  });

  assert.equal(plan.ok, true);
  assert.equal(plan.authorized, true);
  assert.ok(
    !plan.operations.some(
      (operation) =>
        operation.source ===
        '.sdcorejs/documentation/technical-docs/unrelated.md',
    ),
  );
  const result = applyMigrationPlanToSnapshot(files, plan);
  assert.equal(result.ok, true);
  assert.match(
    result.files[
      '.sdcorejs/documentation/user-guides/orders/orders.md'
    ],
    /!\[List\]\(images\/capture\.png\?raw=1#preview\)/,
  );
  assert.deepEqual(
    result.files[
      '.sdcorejs/documentation/user-guides/orders/images/capture.png'
    ],
    Uint8Array.from([1, 2, 3]),
  );

  const unauthorized = buildDocumentationMigrationPlan({
    files,
    documentScope: ['user-guides:orders'],
    authorizedDocuments: [],
  });
  assert.equal(unauthorized.ok, true);
  assert.equal(unauthorized.authorized, false);
  const blocked = applyMigrationPlanToSnapshot(files, unauthorized);
  assert.equal(blocked.ok, false);
  assert.ok(
    blocked.blockers.some(
      (blocker) => blocker.code === 'MIGRATION_NOT_AUTHORIZED',
    ),
  );

  const unscoped = buildDocumentationMigrationPlan({
    files,
    authorized: true,
  });
  assert.equal(unscoped.ok, false);
  assert.ok(
    unscoped.conflicts.some(
      (conflict) => conflict.code === 'MIGRATION_SCOPE_REQUIRED',
    ),
  );
});

test('migration classifies proven shared assets and preserves unresolved orphan assets', () => {
  const sharedBytes = Uint8Array.from([8, 9, 10]);
  const orphanBytes = Uint8Array.from([11, 12]);
  const files = {
    '.sdcorejs/documentation/user-guides/orders.md': '# Orders\n\n![Flow](images/system-flow.png)\n',
    '.sdcorejs/documentation/user-guides/users.md': '# Users\n\n![Flow](images/system-flow.png)\n',
    '.sdcorejs/documentation/user-guides/images/system-flow.png': sharedBytes,
    '.sdcorejs/documentation/user-guides/images/orphan.png': orphanBytes,
  };
  const plan = buildDocumentationMigrationPlan({
    files,
    documentScope: ['user-guides:orders', 'user-guides:users'],
    authorizedDocuments: ['user-guides:orders', 'user-guides:users'],
  });

  assert.equal(plan.ok, true);
  assert.ok(plan.operations.some((operation) =>
    operation.source === '.sdcorejs/documentation/user-guides/images/system-flow.png' &&
    operation.destination === '.sdcorejs/documentation/_shared/images/system-flow.png'));
  assert.deepEqual(plan.orphanAssets, [
    '.sdcorejs/documentation/user-guides/images/orphan.png',
  ]);
  assert.ok(!plan.operations.some((operation) =>
    operation.source === '.sdcorejs/documentation/user-guides/images/orphan.png'));

  const result = applyMigrationPlanToSnapshot(files, plan);
  assert.deepEqual(result.files['.sdcorejs/documentation/_shared/images/system-flow.png'], sharedBytes);
  assert.deepEqual(
    result.files['.sdcorejs/documentation/user-guides/images/orphan.png'],
    orphanBytes,
  );
  assert.match(
    result.files['.sdcorejs/documentation/user-guides/orders/orders.md'],
    /!\[Flow\]\(\.\.\/\.\.\/_shared\/images\/system-flow\.png\)/,
  );
});

test('migration ownership uses one structured relationship record at a time', () => {
  const plan = buildDocumentationMigrationPlan({
    files: {
      '.sdcorejs/documentation/user-guides/orders.md': '# Orders\n',
      '.sdcorejs/documentation/user-guides/users.md': '# Users\n',
      '.sdcorejs/documentation/user-guides/images/capture.png': Uint8Array.from([7]),
    },
    documentScope: ['user-guides:orders', 'user-guides:users'],
    authorizedDocuments: ['user-guides:orders', 'user-guides:users'],
    artifactContexts: [
      {
        required_with_change: [
          {
            path: '.sdcorejs/documentation/user-guides/images/capture.png',
            related_entry_path: '.sdcorejs/documentation/user-guides/orders.md',
          },
          {
            path: '.sdcorejs/documentation/user-guides/users.md',
          },
        ],
      },
    ],
  });
  assert.equal(plan.ok, true);
  assert.ok(
    plan.operations.some(
      (operation) =>
        operation.source ===
          '.sdcorejs/documentation/user-guides/images/capture.png' &&
        operation.destination ===
          '.sdcorejs/documentation/user-guides/orders/images/capture.png',
    ),
  );
  assert.ok(
    !plan.operations.some(
      (operation) =>
        operation.destination ===
        '.sdcorejs/documentation/_shared/images/capture.png',
    ),
  );
});

test('shared asset paths require proven ownership by at least two units', () => {
  assert.throws(
    () =>
      buildSharedAssetPath('images', 'system-flow.png', {
        ownerUnits: ['user-guides:orders'],
      }),
    /shared ownership/i,
  );
  assert.equal(
    buildSharedAssetPath('images', 'system-flow.png', {
      ownerUnits: ['user-guides:orders', 'user-guides:users'],
    }),
    '.sdcorejs/documentation/_shared/images/system-flow.png',
  );
  assert.throws(
    () =>
      buildSharedAssetPath('images', 'system-flow.png', {
        ownerUnits: ['user-guides:orders', 'user-guides:orders '],
      }),
    /documentation-unit identities/i,
  );
});

test('aggregate frontmatter serializes untrusted scalar values safely', () => {
  const result = buildAggregateUserGuide({
    files: {
      '.sdcorejs/documentation/user-guides/orders/orders.md':
        '---\ncoverage: { total: 0, met: 0, partial: 0, missing: 0 }\n---\n# Orders\n',
    },
    projectTitle: 'Project\nowner: attacker',
    generatedAt: '2026-07-29\ncommit_policy: never',
    gitHead: 'abc\nsource_plan: injected',
    changeRef: 'change\nowner: attacker',
    sourceSpec: 'spec\nowner: attacker',
    sourcePlan: 'plan\nowner: attacker',
  });

  assert.equal(result.ok, true);
  const frontmatter = result.output.split('---')[1];
  assert.ok(!frontmatter.includes('\nowner: attacker\n'));
  assert.ok(!frontmatter.includes('\ncommit_policy: never\n'));
  assert.ok(!frontmatter.includes('\nsource_plan: injected\n'));
  assert.match(frontmatter, /change_ref: "change\\nowner: attacker"/);
  assert.match(frontmatter, /title: "Project\\nowner: attacker - User Guide"/);
});

test('aggregate build discovers exact entries, rewrites local assets, and preserves code literals', () => {
  const files = {
    '.sdcorejs/documentation/user-guides/orders/orders.md': `\uFEFF---
artifact_id: guide-orders
artifact_kind: documentation-asset
change_ref: docs-v2
source_spec: none
source_plan: none
commit_policy: with-change
owner: sdcorejs-documentation
module: orders
title: Orders
coverage: { total: 3, met: 2, partial: 1, missing: 0 }
---

# Orders - User Guide

## Screens And Tasks

![List](images/list.png)
![Detail][detail-image]
[detail-image]: images/detail.png
[Example](examples/request.md)
[Schema](schemas/order.json)
[Attachment](attachments/order.pdf)
![Shared](../../_shared/diagrams/system-flow.png)
[Root note](notes.md)
<img src="images/list.png" alt="List">
<img src=images/detail.png alt="Detail">
<a href="attachments/order.pdf">Download</a>

External: https://example.com/image.png
Mail: mailto:support@example.com
Anchor: #screens

\`![Inline](images/inline.png)\`
\`\`![Double inline](images/double-inline.png)\`\`

\`\`\`markdown
![Fence](images/fence.png)
\`\`\`
`,
    '.sdcorejs/documentation/user-guides/orders/images/list.png': ONE_PIXEL_PNG,
    '.sdcorejs/documentation/user-guides/orders/images/detail.png': ONE_PIXEL_PNG,
    '.sdcorejs/documentation/user-guides/orders/examples/request.md': '# Request\n',
    '.sdcorejs/documentation/user-guides/orders/schemas/order.json': '{}',
    '.sdcorejs/documentation/user-guides/orders/attachments/order.pdf': Uint8Array.from([2]),
    '.sdcorejs/documentation/_shared/diagrams/system-flow.png': Uint8Array.from([3]),
    '.sdcorejs/documentation/notes.md': '# Aggregate note\n',
    '.sdcorejs/documentation/user-guides/users.md': `---
module: users
title: Users
coverage: { total: 1, met: 1, partial: 0, missing: 0 }
---

# Users

## Tasks
Legacy transitional entry.
`,
    '.sdcorejs/documentation/user-guides/orders/examples/ignored.md': '# Not a module\n',
  };

  const result = buildAggregateUserGuide({
    files,
    projectTitle: 'Fixture Project',
    generatedAt: '2026-07-29T00:00:00Z',
    gitHead: 'a'.repeat(40),
    changeRef: 'docs-v2',
    verifiedImageEvidence: [
      verifiedCapture(
        '.sdcorejs/documentation/user-guides/orders/orders.md',
        '.sdcorejs/documentation/user-guides/orders/images/list.png',
        'a'.repeat(40),
        'capture-orders-list',
        ONE_PIXEL_PNG,
      ),
      verifiedCapture(
        '.sdcorejs/documentation/user-guides/orders/orders.md',
        '.sdcorejs/documentation/user-guides/orders/images/detail.png',
        'a'.repeat(40),
        'capture-orders-detail',
        ONE_PIXEL_PNG,
      ),
    ],
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.modules.map((module) => module.key), ['orders', 'users']);
  assert.deepEqual(result.coverage, { total: 4, met: 3, partial: 1, missing: 0 });
  assert.match(result.output, /!\[List\]\(user-guides\/orders\/images\/list\.png\)/);
  assert.match(result.output, /!\[Detail\]\[detail-image\]/);
  assert.match(
    result.output,
    /\[detail-image\]: user-guides\/orders\/images\/detail\.png/,
  );
  assert.match(result.output, /\[Example\]\(user-guides\/orders\/examples\/request\.md\)/);
  assert.match(result.output, /\[Schema\]\(user-guides\/orders\/schemas\/order\.json\)/);
  assert.match(result.output, /\[Attachment\]\(user-guides\/orders\/attachments\/order\.pdf\)/);
  assert.match(result.output, /!\[Shared\]\(_shared\/diagrams\/system-flow\.png\)/);
  assert.match(result.output, /\[Root note\]\(notes\.md\)/);
  assert.match(result.output, /src="user-guides\/orders\/images\/list\.png"/);
  assert.match(result.output, /src=user-guides\/orders\/images\/detail\.png/);
  assert.match(result.output, /href="user-guides\/orders\/attachments\/order\.pdf"/);
  assert.match(result.output, /https:\/\/example\.com\/image\.png/);
  assert.match(result.output, /mailto:support@example\.com/);
  assert.match(result.output, /Anchor: #screens/);
  assert.match(result.output, /`!\[Inline\]\(images\/inline\.png\)`/);
  assert.match(result.output, /``!\[Double inline\]\(images\/double-inline\.png\)``/);
  assert.match(result.output, /!\[Fence\]\(images\/fence\.png\)/);
  assert.match(result.output, /## Orders[\s\S]*### Screens And Tasks/);
  assert.ok(!result.output.includes('ignored.md'));

  const missingEvidence = buildAggregateUserGuide({
    files,
    projectTitle: 'Fixture Project',
    generatedAt: '2026-07-29T00:00:00Z',
    gitHead: 'a'.repeat(40),
    changeRef: 'docs-v2',
  });
  assert.equal(missingEvidence.ok, false);
  assert.ok(
    missingEvidence.errors.some(
      (error) => error.code === 'UNVERIFIED_GUIDE_IMAGE',
    ),
  );

  const staleEvidence = buildAggregateUserGuide({
    files,
    projectTitle: 'Fixture Project',
    generatedAt: '2026-07-29T00:00:00Z',
    gitHead: 'a'.repeat(40),
    changeRef: 'docs-v2',
    verifiedImagePaths: [
      '.sdcorejs/documentation/user-guides/orders/images/list.png',
      '.sdcorejs/documentation/user-guides/orders/images/detail.png',
    ],
    verifiedImageEvidence: [
      verifiedCapture(
        '.sdcorejs/documentation/user-guides/orders/orders.md',
        '.sdcorejs/documentation/user-guides/orders/images/list.png',
        'b'.repeat(40),
        'capture-orders-list-stale',
        ONE_PIXEL_PNG,
      ),
    ],
  });
  assert.equal(staleEvidence.ok, false);
  assert.ok(staleEvidence.errors.some((error) => error.code === 'UNVERIFIED_GUIDE_IMAGE'));

  const diagnosticEvidence = buildAggregateUserGuide({
    files,
    projectTitle: 'Fixture Project',
    generatedAt: '2026-07-29T00:00:00Z',
    gitHead: 'a'.repeat(40),
    changeRef: 'docs-v2',
    verifiedImageEvidence: [
      {
        ...verifiedCapture(
          '.sdcorejs/documentation/user-guides/orders/orders.md',
          '.sdcorejs/documentation/user-guides/orders/images/list.png',
          'a'.repeat(40),
          'capture-orders-diagnostic',
          ONE_PIXEL_PNG,
        ),
        classification: 'diagnostic',
      },
    ],
  });
  assert.equal(diagnosticEvidence.ok, false);

  const emptyImage = buildAggregateUserGuide({
    files: {
      '.sdcorejs/documentation/user-guides/empty/empty.md':
        '# Empty\n\n![Empty](images/empty.png)\n',
      '.sdcorejs/documentation/user-guides/empty/images/empty.png':
        new Uint8Array(),
    },
    projectTitle: 'Fixture Project',
    generatedAt: '2026-07-29T00:00:00Z',
    gitHead: 'a'.repeat(40),
    changeRef: 'docs-v2',
    verifiedImageEvidence: [
      verifiedCapture(
        '.sdcorejs/documentation/user-guides/empty/empty.md',
        '.sdcorejs/documentation/user-guides/empty/images/empty.png',
        'a'.repeat(40),
        'capture-empty',
        new Uint8Array(),
      ),
    ],
  });
  assert.equal(emptyImage.ok, false);
  assert.ok(emptyImage.errors.some((error) => error.code === 'UNVERIFIED_GUIDE_IMAGE'));

  const corruptedImage = buildAggregateUserGuide({
    files: {
      '.sdcorejs/documentation/user-guides/corrupt/corrupt.md':
        '# Corrupt\n\n![Corrupt](images/corrupt.png)\n',
      '.sdcorejs/documentation/user-guides/corrupt/images/corrupt.png':
        CORRUPTED_ONE_PIXEL_PNG,
    },
    projectTitle: 'Fixture Project',
    generatedAt: '2026-07-29T00:00:00Z',
    gitHead: 'a'.repeat(40),
    changeRef: 'docs-v2',
    verifiedImageEvidence: [
      verifiedCapture(
        '.sdcorejs/documentation/user-guides/corrupt/corrupt.md',
        '.sdcorejs/documentation/user-guides/corrupt/images/corrupt.png',
        'a'.repeat(40),
        'capture-corrupt',
        CORRUPTED_ONE_PIXEL_PNG,
      ),
    ],
  });
  assert.equal(corruptedImage.ok, false);
  assert.ok(
    corruptedImage.errors.some(
      (error) => error.code === 'UNVERIFIED_GUIDE_IMAGE',
    ),
  );

  for (const [extension, fakeImage] of [
    [
      'gif',
      Uint8Array.from([
        ...Buffer.from('GIF89a'),
        1, 0, 1, 0, 0, 0, 0, 0x3b,
      ]),
    ],
    [
      'jpg',
      Uint8Array.from([
        0xff, 0xd8, 0xff, 0xc0, 0x00, 0x07, 0x08, 0x00, 0x01, 0x00, 0x01,
      ]),
    ],
  ]) {
    const guidePath =
      `.sdcorejs/documentation/user-guides/fake-${extension}/fake-${extension}.md`;
    const imagePath =
      `.sdcorejs/documentation/user-guides/fake-${extension}/images/fake.${extension}`;
    const fakeEvidence = buildAggregateUserGuide({
      files: {
        [guidePath]: `# Fake ${extension}\n\n![Fake](images/fake.${extension})\n`,
        [imagePath]: fakeImage,
      },
      projectTitle: 'Fixture Project',
      generatedAt: '2026-07-29T00:00:00Z',
      gitHead: 'a'.repeat(40),
      changeRef: 'docs-v2',
      verifiedImageEvidence: [
        verifiedCapture(
          guidePath,
          imagePath,
          'a'.repeat(40),
          `capture-fake-${extension}`,
          fakeImage,
        ),
      ],
    });
    assert.equal(fakeEvidence.ok, false, `${extension} header is not decodable evidence`);
    assert.ok(
      fakeEvidence.errors.some(
        (error) => error.code === 'UNVERIFIED_GUIDE_IMAGE',
      ),
    );
  }

  const repeated = buildAggregateUserGuide({
    files,
    projectTitle: 'Fixture Project',
    generatedAt: '2026-07-29T00:00:00Z',
    gitHead: 'a'.repeat(40),
    changeRef: 'docs-v2',
    verifiedImageEvidence: [
      verifiedCapture(
        '.sdcorejs/documentation/user-guides/orders/orders.md',
        '.sdcorejs/documentation/user-guides/orders/images/list.png',
        'a'.repeat(40),
        'capture-orders-list',
        ONE_PIXEL_PNG,
      ),
      verifiedCapture(
        '.sdcorejs/documentation/user-guides/orders/orders.md',
        '.sdcorejs/documentation/user-guides/orders/images/detail.png',
        'a'.repeat(40),
        'capture-orders-detail',
        ONE_PIXEL_PNG,
      ),
    ],
  });
  assert.equal(repeated.output, result.output);
});

test('aggregate heading normalization ignores headings inside fenced code', () => {
  const result = buildAggregateUserGuide({
    files: {
      '.sdcorejs/documentation/user-guides/orders/orders.md': `---
title: Orders
coverage: { total: 0, met: 0, partial: 0, missing: 0 }
---
\`\`\`\`markdown
# Example heading
\`\`\`
## Still code
\`\`\`\`

# Orders - User Guide

## Tasks
`,
    },
    projectTitle: 'Fixture',
    generatedAt: '2026-07-29T00:00:00Z',
    gitHead: 'a'.repeat(40),
    changeRef: 'docs-v2',
  });

  assert.equal(result.ok, true);
  assert.match(result.output, /````markdown\n# Example heading\n```\n## Still code\n````/);
  assert.doesNotMatch(result.output, /\n# Orders - User Guide\n/);
  assert.match(result.output, /## Orders[\s\S]*### Tasks/);
});

test('aggregate build reports malformed metadata, conflicts, empty input, and broken local links deterministically', () => {
  const malformed = buildAggregateUserGuide({
    files: {
      '.sdcorejs/documentation/user-guides/orders/orders.md':
        '# Orders\r\n\r\n![Missing](images/missing.png)\r\n[Missing root](missing-root.md)\r\n[Escape](../README.md)\r\n',
    },
    projectTitle: 'Fixture',
    generatedAt: '2026-07-29T00:00:00Z',
    gitHead: 'b'.repeat(40),
    changeRef: 'docs-v2',
  });
  assert.equal(malformed.ok, false);
  assert.ok(malformed.warnings.some((warning) => warning.code === 'MISSING_FRONTMATTER'));
  assert.ok(malformed.errors.some((error) => error.code === 'BROKEN_LOCAL_LINK'));
  assert.ok(malformed.errors.some((error) => error.code === 'PATH_TRAVERSAL'));
  assert.deepEqual(malformed.modules.map((module) => module.key), ['orders']);

  const conflict = buildAggregateUserGuide({
    files: {
      '.sdcorejs/documentation/user-guides/orders/orders.md': '# Canonical\n',
      '.sdcorejs/documentation/user-guides/orders.md': '# Legacy differs\n',
    },
    projectTitle: 'Fixture',
    generatedAt: '2026-07-29T00:00:00Z',
    gitHead: 'b'.repeat(40),
    changeRef: 'docs-v2',
  });
  assert.equal(conflict.ok, false);
  assert.ok(conflict.errors.some((error) => error.code === 'CANONICAL_LEGACY_CONFLICT'));

  const empty = buildAggregateUserGuide({
    files: {},
    projectTitle: 'Fixture',
    generatedAt: '2026-07-29T00:00:00Z',
    gitHead: 'b'.repeat(40),
    changeRef: 'docs-v2',
  });
  assert.equal(empty.ok, false);
  assert.deepEqual(empty.errors.map((error) => error.code), ['NO_MODULE_GUIDES']);
});

test('guide/image containment accepts same-unit evidence and fails closed otherwise', () => {
  const valid = validateGuideImageRelationship({
    guidePath: '.sdcorejs/documentation/user-guides/orders/orders.md',
    imagePath: '.sdcorejs/documentation/user-guides/orders/images/list.png',
  });
  assert.equal(valid.ok, true);
  assert.equal(valid.relationship, 'same-unit');
  const legacy = validateGuideImageRelationship({
    guidePath: '.sdcorejs/documentation/user-guides/orders.md',
    imagePath: '.sdcorejs/documentation/user-guides/images/orders-list.png',
    allowLegacyGuide: true,
  });
  assert.equal(legacy.ok, true);
  assert.equal(legacy.relationship, 'legacy-owned-flat');

  const shared = validateGuideImageRelationship({
    guidePath: '.sdcorejs/documentation/user-guides/orders/orders.md',
    imagePath: '.sdcorejs/documentation/_shared/images/system-flow.png',
    sharedOwnership: {
      proven: true,
      ownerUnits: ['user-guides:orders', 'user-guides:users'],
    },
  });
  assert.equal(shared.ok, true);
  assert.equal(shared.relationship, 'proven-shared');

  const invalidCases = [
    {
      guidePath: '.sdcorejs/documentation/user-guides/orders/orders.md',
      imagePath: '.sdcorejs/documentation/user-guides/users/images/list.png',
    },
    {
      guidePath: '.sdcorejs/documentation/user-guides/orders/orders.md',
      imagePath: '../outside.png',
    },
    {
      guidePath: 'C:\\outside\\orders.md',
      imagePath: 'C:\\outside\\list.png',
    },
    {
      guidePath: '.sdcorejs/documentation/user-guides/orders/orders.md',
      imagePath: '.sdcorejs/documentation/_shared/images/system-flow.png',
      sharedOwnership: {
        proven: false,
        ownerUnits: ['user-guides:orders'],
      },
    },
    {
      guidePath: '.sdcorejs/documentation/user-guides/orders/orders.md',
      imagePath: '.sdcorejs/documentation/_shared/images/system-flow.png',
      sharedOwnership: {
        proven: true,
        ownerUnits: ['user-guides:orders', 'user-guides:orders '],
      },
    },
    {
      guidePath: '.sdcorejs/documentation/requirements/REQ-1/REQ-1.md',
      imagePath: '.sdcorejs/documentation/requirements/REQ-1/images/list.png',
    },
    {
      guidePath: '.sdcorejs/documentation/user-guides/orders/orders.md',
      imagePath: '.sdcorejs/documentation/user-guides/orders/images/NUL.png',
    },
    {
      guidePath: '.sdcorejs/documentation/user-guides/orders/not-the-entry.md',
      imagePath: '.sdcorejs/documentation/user-guides/orders/images/list.png',
    },
    {
      guidePath: '.sdcorejs/documentation/custom/approved.md',
      imagePath: '.sdcorejs/documentation/other/images/list.png',
      explicitApprovedGuidePath: true,
    },
  ];
  for (const candidate of invalidCases) {
    assert.equal(validateGuideImageRelationship(candidate).ok, false);
  }

  const explicit = validateGuideImageRelationship({
    guidePath: '.sdcorejs/documentation/custom/approved.md',
    imagePath: '.sdcorejs/documentation/custom/images/list.png',
    explicitApprovedGuidePath: true,
  });
  assert.equal(explicit.ok, true);
  assert.equal(explicit.relationship, 'explicit-same-unit');
});

test('Pandoc export uses argument arrays, documentation root resources, and separate capabilities', () => {
  const targetRoot = 'C:\\Work Areas\\Dự án mẫu';
  const aggregateMarkdown =
    '![List](user-guides/orders/images/list.png)\n' +
    '![Detail](user-guides/orders/images/detail.png)\n';
  const aggregateSha256 = createHash('sha256')
    .update(aggregateMarkdown)
    .digest('hex');
  const embeddedImagePaths = [
    'user-guides/orders/images/list.png',
    'user-guides/orders/images/detail.png',
  ];
  const docx = buildPandocExportPlan({ targetRoot, format: 'docx' });
  assert.equal(docx.executable, 'pandoc');
  assert.equal(docx.args.at(-1), path.win32.join(targetRoot, '.sdcorejs', 'documentation'));
  assert.ok(docx.args.includes('-o'));
  assert.match(docx.posixDisplay, /'C:\\Work Areas\\Dự án mẫu/);
  assert.match(docx.powerShellDisplay, /& 'pandoc'/);
  assert.match(docx.powerShellDisplay, /'C:\\Work Areas\\Dự án mẫu/);
  assert.ok(!docx.powerShellDisplay.includes('`\\\n'));

  const report = summarizeExportCapabilities({
    pandocAvailable: true,
    pdfEngineAvailable: false,
    aggregateMarkdown,
    docxVerification: {
      exitCode: 0,
      outputExists: true,
      outputBytes: 2048,
      parseable: true,
      expectedEmbeddedImages: 2,
      embeddedImages: 2,
      embeddedImagePaths,
      sourceAggregateSha256: aggregateSha256,
    },
  });
  assert.equal(report.docx.result, 'pass');
  assert.equal(report.pdf.result, 'skipped');
  assert.match(report.pdf.reason, /PDF engine/i);

  const missingEmbed = summarizeExportCapabilities({
    pandocAvailable: true,
    pdfEngineAvailable: true,
    aggregateMarkdown,
    docxVerification: {
      exitCode: 0,
      outputExists: true,
      outputBytes: 2048,
      parseable: true,
      expectedEmbeddedImages: 2,
      embeddedImages: 1,
      embeddedImagePaths: [embeddedImagePaths[0]],
      sourceAggregateSha256: aggregateSha256,
    },
  });
  assert.equal(missingEmbed.docx.result, 'fail');

  const extraEmbed = summarizeExportCapabilities({
    pandocAvailable: true,
    aggregateMarkdown,
    docxVerification: {
      exitCode: 0,
      outputExists: true,
      outputBytes: 2048,
      parseable: true,
      expectedEmbeddedImages: 2,
      embeddedImages: 3,
      embeddedImagePaths: [
        ...embeddedImagePaths,
        'user-guides/orders/images/extra.png',
      ],
      sourceAggregateSha256: aggregateSha256,
    },
  });
  assert.equal(extraEmbed.docx.result, 'fail');
  assert.equal(
    extraEmbed.docx.verification.imageManifestEvidenceSupplied,
    true,
  );

  const missingImageVerification = summarizeExportCapabilities({
    pandocAvailable: true,
    pdfEngineAvailable: true,
    aggregateMarkdown,
    docxVerification: {
      exitCode: 0,
      outputExists: true,
      outputBytes: 1024,
      parseable: true,
    },
  });
  assert.equal(missingImageVerification.docx.result, 'fail');
  assert.equal(
    missingImageVerification.docx.verification.imageCountEvidenceSupplied,
    false,
  );

  const fabricatedZeroCount = summarizeExportCapabilities({
    pandocAvailable: true,
    aggregateMarkdown,
    docxVerification: {
      exitCode: 0,
      outputExists: true,
      outputBytes: 1024,
      parseable: true,
      expectedEmbeddedImages: 0,
      embeddedImages: 0,
      embeddedImagePaths: [],
      sourceAggregateSha256: aggregateSha256,
    },
  });
  assert.equal(fabricatedZeroCount.docx.result, 'fail');

  const aggregateWithDownloadLinks =
    '![List](user-guides/orders/images/list.png)\n' +
    '[Download original](user-guides/orders/images/detail.png)\n' +
    '<a href="user-guides/orders/images/archive.png">Archive</a>\n';
  const downloadLinkReport = summarizeExportCapabilities({
    pandocAvailable: true,
    aggregateMarkdown: aggregateWithDownloadLinks,
    docxVerification: {
      exitCode: 0,
      outputExists: true,
      outputBytes: 2048,
      parseable: true,
      expectedEmbeddedImages: 1,
      embeddedImages: 1,
      embeddedImagePaths: ['user-guides/orders/images/list.png'],
      sourceAggregateSha256: createHash('sha256')
        .update(aggregateWithDownloadLinks)
        .digest('hex'),
    },
  });
  assert.equal(downloadLinkReport.docx.result, 'pass');
  assert.deepEqual(
    downloadLinkReport.docx.verification.expectedImagePaths,
    ['user-guides/orders/images/list.png'],
  );
});

test('balanced parentheses in Markdown image destinations survive aggregate and export validation', () => {
  const guidePath =
    '.sdcorejs/documentation/user-guides/plots/plots.md';
  const imagePath =
    '.sdcorejs/documentation/user-guides/plots/images/plot(1).png';
  const aggregate = buildAggregateUserGuide({
    files: {
      [guidePath]:
        '# Plots\n\n![Plot](images/plot(1).png)\n' +
        '![Escaped plot](images/plot\\(1\\).png)\n',
      [imagePath]: ONE_PIXEL_PNG,
    },
    projectTitle: 'Fixture Project',
    generatedAt: '2026-07-29T00:00:00Z',
    gitHead: 'a'.repeat(40),
    changeRef: 'docs-v2',
    verifiedImageEvidence: [
      verifiedCapture(
        guidePath,
        imagePath,
        'a'.repeat(40),
        'capture-plot-parentheses',
        ONE_PIXEL_PNG,
      ),
    ],
  });
  assert.equal(aggregate.ok, true);
  assert.match(
    aggregate.output,
    /!\[Plot\]\(user-guides\/plots\/images\/plot\(1\)\.png\)/,
  );
  assert.match(
    aggregate.output,
    /!\[Escaped plot\]\(user-guides\/plots\/images\/plot\(1\)\.png\)/,
  );

  const report = summarizeExportCapabilities({
    pandocAvailable: true,
    aggregateMarkdown: aggregate.output,
    docxVerification: {
      exitCode: 0,
      outputExists: true,
      outputBytes: 2048,
      parseable: true,
      expectedEmbeddedImages: 1,
      embeddedImages: 1,
      embeddedImagePaths: ['user-guides/plots/images/plot(1).png'],
      sourceAggregateSha256: createHash('sha256')
        .update(aggregate.output)
        .digest('hex'),
    },
  });
  assert.equal(report.docx.result, 'pass');
});

test('finish-tail resolver rebuilds aggregate once only for an applicable event', () => {
  assert.deepEqual(
    resolveDocumentationTailPlan({
      changedPaths: [
        '.sdcorejs/documentation/user-guides/orders/orders.md',
        '.sdcorejs/documentation/user-guides/users/users.md',
      ],
    }),
    {
      moduleGuideChanged: true,
      rebuildAggregate: true,
      rebuildCount: 1,
      reason: 'module-guide-changed',
      exports: [],
      branchReadyStale: false,
      requiresBranchReadyRerun: false,
    },
  );
  assert.equal(
    resolveDocumentationTailPlan({ changedPaths: ['src/orders.ts'] }).rebuildCount,
    0,
  );
  assert.equal(
    resolveDocumentationTailPlan({
      changedPaths: ['src/orders.ts'],
      explicitAggregateRequest: true,
    }).rebuildCount,
    1,
  );
  assert.equal(
    resolveDocumentationTailPlan({
      changedPaths: ['src/orders.ts'],
      aggregateStale: true,
    }).rebuildCount,
    1,
  );
  const exportPlan = resolveDocumentationTailPlan({
    changedPaths: ['src/orders.ts'],
    exportRequested: ['docx', 'pdf'],
  });
  assert.deepEqual(exportPlan.exports, ['docx', 'pdf']);
  assert.equal(exportPlan.rebuildCount, 1);
  assert.equal(exportPlan.reason, 'export-request');

  const postBranchReadyWrite = resolveDocumentationTailPlan({
    changedPaths: [
      '.sdcorejs/documentation/user-guides/orders/orders.md',
    ],
    branchReadyAssociatedHeadOrDiff: 'diff:before-docs',
    currentHeadOrDiff: 'diff:after-docs',
  });
  assert.equal(postBranchReadyWrite.branchReadyStale, true);
  assert.equal(postBranchReadyWrite.requiresBranchReadyRerun, true);
});

test('active canonical prose uses Layout v2 JIT without changing provider actions or pure-Q&A bootstrap', async () => {
  const [
    agents,
    runtimeProtocols,
    documentationSkill,
    layoutContract,
    guide,
    requirement,
    technical,
    gate,
    template,
    finishGate,
    ship,
    git,
  ] = await Promise.all([
    readFile(path.join(root, 'AGENTS.md'), 'utf8'),
    readFile(path.join(root, '_refs/shared/runtime-protocols.md'), 'utf8'),
    readFile(path.join(root, 'skills/orchestration/documentation.md'), 'utf8'),
    readFile(path.join(root, '_refs/shared/documentation-layout.md'), 'utf8'),
    readFile(path.join(root, '_refs/documentation/write-user-guide.md'), 'utf8'),
    readFile(path.join(root, '_refs/documentation/write-requirement.md'), 'utf8'),
    readFile(path.join(root, '_refs/documentation/write-technical-doc.md'), 'utf8'),
    readFile(path.join(root, '_refs/documentation/gate.md'), 'utf8'),
    readFile(path.join(root, '_refs/shared/user-guide-template.md'), 'utf8'),
    readFile(path.join(root, '_refs/shared/finish-gate.md'), 'utf8'),
    readFile(path.join(root, 'skills/shared/workflow/ship.md'), 'utf8'),
    readFile(path.join(root, 'skills/shared/workflow/git.md'), 'utf8'),
  ]);

  assert.doesNotMatch(agents, /documentation-layout\.md/);
  assert.match(runtimeProtocols, /documentation-layout\.md/);
  assert.match(runtimeProtocols, /below `\.sdcorejs\/documentation\/\*\*`/);
  assert.doesNotMatch(runtimeProtocols, /- Documentation operations:/);
  assert.match(documentationSkill, /documentation-layout\.md/);
  assert.match(layoutContract, /layout_version:\s*2/);
  assert.match(layoutContract.slice(0, 2500), /## Contents/);
  assert.match(layoutContract.slice(0, 4000), /## Executable API/);
  assert.match(layoutContract, /verifiedImageEvidence/);
  assert.match(layoutContract, /authorization is recorded[\s\S]*per scoped unit/i);
  assert.match(layoutContract, /singleton/i);
  assert.match(layoutContract, /canonical-first/i);
  assert.match(layoutContract, /legacy/i);
  assert.match(layoutContract, /conflict/i);
  assert.match(layoutContract, /Windows/i);
  assert.match(layoutContract, /POSIX/i);

  assert.match(guide, /user-guides\/<module>\/<module>\.md/);
  assert.match(guide, /images\/<screen>\.png/);
  assert.match(requirement, /requirements\/<TASKID>\/<TASKID>\.md/);
  assert.match(technical, /technical-docs\/<doc-key>\/<doc-key>\.md/);
  assert.match(gate, /canonical exact entry/i);
  assert.match(gate, /legacy flat entry/i);
  assert.match(template, /--resource-path[\s\S]*documentation root/i);
  assert.match(finishGate + ship, /exactly once|once after/i);
  assert.match(git, /explicit[\s-]path/i);

  for (const skillPath of [
    'skills/orchestration/documentation.md',
    'skills/tracks/test/sdcorejs-test.md',
    'skills/shared/workflow/ship.md',
    'skills/shared/workflow/git.md',
    'skills/shared/workflow/review.md',
    'skills/shared/workflow/debug.md',
    'skills/orchestration/repair-loop.md',
  ]) {
    const text = await readFile(path.join(root, skillPath), 'utf8');
    assert.match(text, /^required-actions:.*\bcontext\.pass\b/m, `${skillPath} preserves context.pass`);
  }
});

test('canonical documentation prose carries repository ownership, visual provenance, and Node prerequisites', async () => {
  const [
    skill,
    layout,
    userGuide,
    requirement,
    technical,
    readme,
    adoption,
    rootPackageText,
    sitePackageText,
  ] = await Promise.all([
    readFile(path.join(root, 'skills/orchestration/documentation.md'), 'utf8'),
    readFile(path.join(root, '_refs/shared/documentation-layout.md'), 'utf8'),
    readFile(path.join(root, '_refs/documentation/write-user-guide.md'), 'utf8'),
    readFile(path.join(root, '_refs/documentation/write-requirement.md'), 'utf8'),
    readFile(path.join(root, '_refs/documentation/write-technical-doc.md'), 'utf8'),
    readFile(path.join(root, 'README.md'), 'utf8'),
    readFile(path.join(root, 'docs/ADOPTION.md'), 'utf8'),
    readFile(path.join(root, 'package.json'), 'utf8'),
    readFile(path.join(root, 'site/package.json'), 'utf8'),
  ]);
  const ownerProse = skill + layout + userGuide + requirement + technical;
  assert.match(ownerProse, /semantic owner repository/i);
  assert.match(ownerProse, /portal fallback is forbidden/i);
  assert.match(ownerProse, /repository_id/);
  assert.match(layout + userGuide, /buildMultiRepositoryDocumentationAggregate/);
  assert.match(layout + userGuide, /generated_projection/);
  assert.match(layout + userGuide, /editable_source/);
  assert.match(layout + userGuide, /versioned export/i);
  assert.match(layout + userGuide, /source_revision/);
  assert.match(layout + userGuide, /app_revision/);
  assert.match(layout + userGuide, /generated-mockup/);
  assert.match(layout + userGuide, /illustration/);
  assert.match(adoption, /summaries[\s\S]*sdcorejs-explore/i);

  const rootPackage = JSON.parse(rootPackageText);
  const sitePackage = JSON.parse(sitePackageText);
  const rootNodeRange = '^22.22.3 || ^24.15.0 || >=26.0.0';
  assert.equal(rootPackage.engines.node, rootNodeRange);
  assert.equal(sitePackage.engines.node, '>=22.12.0');
  assert.ok((readme + adoption).includes(`Node.js \`${rootNodeRange}\``));
  assert.match(readme + adoption, /Node\.js `>=22\.12\.0`/);
  assert.match(readme + adoption, /Node\.js `18\.20\.8` compatibility exception/);
  assert.match(readme + adoption, /standalone Visual Companion built-ins-only tests/);
  assert.match(readme + adoption, /does not extend the supported root toolchain/);
});

function snapshotDigest(files) {
  const hash = createHash('sha256');
  for (const [filePath, content] of Object.entries(files).sort(([left], [right]) =>
    left.localeCompare(right))) {
    hash.update(filePath);
    hash.update('\0');
    hash.update(toBytes(content));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function toBytes(value) {
  if (typeof value === 'string') return Buffer.from(value);
  if (value instanceof Uint8Array) return Buffer.from(value);
  throw new TypeError(`Unsupported fixture content: ${typeof value}`);
}

function verifiedCapture(
  guidePath,
  imagePath,
  head,
  captureId,
  imageContent,
  changeRef = 'docs-v2',
) {
  return {
    schema_version: 1,
    capture_id: captureId,
    change_ref: changeRef,
    guide_path: guidePath,
    associated_HEAD_or_diff: head,
    source_revision: head,
    app_revision: head,
    evidence_origin: 'real-ui',
    environment: {
      environment_id: 'local',
      class: 'local',
      base_url_source: 'E2E_BASE_URL',
    },
    persona: {
      persona_id: 'supervisor',
      auth_provenance: 'real-ui',
    },
    runner: 'playwright',
    target: {
      route_or_state: '/orders',
    },
    assertions: {
      login_redirect_absent: true,
      access_denied_absent: true,
      target_state_visible: true,
      loading_complete: true,
      pii_screening: 'pass',
    },
    result: 'verified',
    blocker: null,
    classification: 'documentation',
    redactions_applied: true,
    image: {
      file: imagePath,
      sha256: createHash('sha256').update(toBytes(imageContent)).digest('hex'),
      width: 1,
      height: 1,
      exists: true,
      non_empty: true,
      decodable: true,
      kind: 'documentation',
    },
  };
}
