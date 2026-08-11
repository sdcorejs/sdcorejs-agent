import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  ARCHITECTURE_ARTIFACT_ROOT,
  DESIGN_ARTIFACT_ROOT,
  DESIGN_LEDGER_ROOT,
  DESIGN_LOCAL_ONLY_DIRECTORIES,
  LEGACY_DESIGN_ARTIFACT_ROOT,
  LEGACY_PRODUCT_DOCUMENT_ROOT,
  PRODUCT_DOCUMENT_ROOT,
  PRODUCT_LEDGER_ROOT,
  classifyDesignArtifactPath,
  classifyProductArtifactPath,
  isLegacyArtifactPath,
  planLegacyArtifactMigration,
  resolveArtifactLocationState,
  resolveArtifactReadSource,
  resolveDesignArtifactPaths,
  resolveProductArtifactPaths,
  toCanonicalArtifactPath,
  toLegacyArtifactPath,
  validateCanonicalArtifactMetadataPath,
} from '../../_refs/shared/artifact-paths.mjs';
import {
  planProductArtifactMigration,
  resolveProductDocumentSources,
} from '../../_refs/shared/product-ledger.mjs';
import {
  planDesignArtifactMigration,
  resolveDesignArtifactSources,
} from '../../_refs/shared/design-handoff.mjs';
import { systemRegistry, validateSystemRegistry } from '../../_refs/shared/system-registry.mjs';

const root = path.resolve('.');

/**
 * Root-level Product and Design path shapes that must never appear in an active
 * write instruction, resolver, validator, metadata template, or report.
 */
const LEGACY_PATH_PATTERN = new RegExp(
  String.raw`(?<![.\w/-])(?:product/(?:prds|user-stories|acceptance-criteria|uat-checklists|decisions)` +
    String.raw`|design/(?:flows|specs|decisions|wireframes|exports|references))/`,
  'g',
);

/**
 * Occurrences that remain valid: explicit legacy read-only compatibility,
 * migration logic, negative tests, and rejection rules.
 */
const LEGACY_CONTEXT_MARKERS = [
  'legacy',
  'compatibility',
  'migrat',
  'read-only',
  'never a write target',
  'reject',
  'forbidden',
  'conflict',
  'must not',
  'not valid',
];

const SCANNED_DIRECTORIES = ['skills', '_refs', 'scripts', 'docs'];
const SCANNED_ROOT_FILES = [
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'MIRROR_POLICY.md',
  'TESTING.md',
  'VALIDATION.md',
];
const SCANNED_EXTENSIONS = new Set(['.md', '.mjs', '.js', '.json', '.mdc', '.astro']);
const MIRROR_DIRECTORIES = ['.claude', 'plugin', 'codex', '.cursor'];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true }).catch(() => []);
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      files.push(...(await walk(absolute)));
      continue;
    }
    if (entry.isFile() && SCANNED_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolute);
    }
  }
  return files;
}

async function canonicalSourceFiles() {
  const nested = await Promise.all(
    SCANNED_DIRECTORIES.map((directory) => walk(path.join(root, directory))),
  );
  return [
    ...nested.flat(),
    ...SCANNED_ROOT_FILES.map((file) => path.join(root, file)),
    path.join(root, 'site', 'src', 'components', 'Tracks.astro'),
  ];
}

export function findActiveLegacyPathUsages(source, file = '<source>') {
  const findings = [];
  for (const [index, line] of source.split(/\r?\n/u).entries()) {
    LEGACY_PATH_PATTERN.lastIndex = 0;
    if (!LEGACY_PATH_PATTERN.test(line)) continue;
    const lower = line.toLowerCase();
    if (LEGACY_CONTEXT_MARKERS.some((marker) => lower.includes(marker))) continue;
    findings.push(`${file}:${index + 1} ${line.trim()}`);
  }
  return findings;
}

test('canonical artifact roots live once in the system registry', () => {
  assert.deepEqual(validateSystemRegistry(), []);
  assert.deepEqual(systemRegistry.artifact_roots, {
    product_documents: '.sdcorejs/product',
    product_ledger: '.sdcorejs/docs/product',
    design_artifacts: '.sdcorejs/design',
    design_ledger: '.sdcorejs/docs/design',
    documentation: '.sdcorejs/documentation',
    architecture: '.sdcorejs/architecture',
    conventions: '.sdcorejs/conventions',
  });
  assert.deepEqual(systemRegistry.legacy_artifact_roots, {
    product_documents: 'product',
    design_artifacts: 'design',
  });
  assert.equal(PRODUCT_DOCUMENT_ROOT, '.sdcorejs/product');
  assert.equal(PRODUCT_LEDGER_ROOT, '.sdcorejs/docs/product');
  assert.equal(DESIGN_ARTIFACT_ROOT, '.sdcorejs/design');
  assert.equal(DESIGN_LEDGER_ROOT, '.sdcorejs/docs/design');
  assert.equal(ARCHITECTURE_ARTIFACT_ROOT, '.sdcorejs/architecture');
  assert.equal(LEGACY_PRODUCT_DOCUMENT_ROOT, 'product');
  assert.equal(LEGACY_DESIGN_ARTIFACT_ROOT, 'design');
  for (const field of Object.keys(systemRegistry.artifact_roots)) {
    const registry = structuredClone(systemRegistry);
    registry.artifact_roots[field] = 'product';
    assert.ok(
      validateSystemRegistry(registry).some((error) => error.includes(`artifact_roots.${field}`)),
      `${field} must be rejected outside .sdcorejs/`,
    );
  }
});

test('product resolver returns canonical documents and keeps the ledger root', () => {
  const bundle = resolveProductArtifactPaths('orders');
  assert.equal(bundle.ledger_relative_path, '.sdcorejs/docs/product/orders.md');
  assert.deepEqual(bundle.metadata_paths, {
    prd_path: '.sdcorejs/product/prds/orders.md',
    user_stories_path: '.sdcorejs/product/user-stories/orders.md',
    acceptance_criteria_path: '.sdcorejs/product/acceptance-criteria/orders.md',
    uat_checklist_path: '.sdcorejs/product/uat-checklists/orders.md',
    decisions_path: '.sdcorejs/product/decisions/orders.md',
  });
  for (const documentPath of bundle.document_paths) {
    assert.ok(documentPath.startsWith('.sdcorejs/product/'));
    assert.equal(isLegacyArtifactPath(documentPath), false);
  }
  assert.deepEqual(bundle.legacy.document_paths, [
    'product/prds/orders.md',
    'product/user-stories/orders.md',
    'product/acceptance-criteria/orders.md',
    'product/uat-checklists/orders.md',
    'product/decisions/orders.md',
  ]);
  assert.throws(() => resolveProductArtifactPaths('Orders Feature'), /kebab-case/);
});

test('design resolver returns canonical artifacts and keeps the ledger root', () => {
  const bundle = resolveDesignArtifactPaths('orders', { screens: ['list', 'detail'] });
  assert.equal(bundle.flow_path, '.sdcorejs/design/flows/orders.md');
  assert.equal(bundle.spec_path, '.sdcorejs/design/specs/orders.md');
  assert.equal(bundle.decisions_path, '.sdcorejs/design/decisions/orders.md');
  assert.equal(bundle.ledger_relative_path, '.sdcorejs/docs/design/orders.md');
  assert.deepEqual(bundle.screens.map((screen) => screen.wireframe_html_path), [
    '.sdcorejs/design/wireframes/orders/list.html',
    '.sdcorejs/design/wireframes/orders/detail.html',
  ]);
  assert.deepEqual(bundle.screens.map((screen) => screen.png_export_path), [
    '.sdcorejs/design/exports/png/orders/list.png',
    '.sdcorejs/design/exports/png/orders/detail.png',
  ]);
  assert.deepEqual(bundle.screens.map((screen) => screen.reference_path), [
    '.sdcorejs/design/references/orders/list.png',
    '.sdcorejs/design/references/orders/detail.png',
  ]);
  assert.equal(bundle.legacy.spec_path, 'design/specs/orders.md');
});

test('path classification separates canonical, legacy, ledger, and diagnostic locations', () => {
  assert.deepEqual(
    { ...classifyProductArtifactPath('.sdcorejs/product/prds/orders.md') },
    {
      ok: true,
      track: 'product',
      location: 'canonical',
      kind: 'product-doc',
      category: 'prd',
      durable: true,
      feature: 'orders',
      path: '.sdcorejs/product/prds/orders.md',
    },
  );
  assert.equal(
    classifyProductArtifactPath('product/prds/orders.md').location,
    'legacy',
  );
  assert.equal(
    classifyProductArtifactPath('.sdcorejs/docs/product/orders.md').kind,
    'product-ledger',
  );
  assert.equal(classifyProductArtifactPath('src/orders.ts').ok, false);

  assert.equal(
    classifyDesignArtifactPath('.sdcorejs/design/exports/png/orders/list.png').category,
    'png_export',
  );
  assert.equal(
    classifyDesignArtifactPath('.sdcorejs/design/references/orders/list.png').category,
    'reference',
  );
  assert.equal(
    classifyDesignArtifactPath('.sdcorejs/docs/design/orders.md').kind,
    'design-handoff',
  );
  const diagnostic = classifyDesignArtifactPath(
    '.sdcorejs/design/diagnostics/orders/list-failure.png',
  );
  assert.equal(diagnostic.kind, 'diagnostic');
  assert.equal(diagnostic.durable, false);
  assert.equal(classifyDesignArtifactPath('design/specs/orders.md').location, 'legacy');

  assert.equal(
    toCanonicalArtifactPath('design/wireframes/orders/list.html'),
    '.sdcorejs/design/wireframes/orders/list.html',
  );
  assert.equal(
    toLegacyArtifactPath('.sdcorejs/product/prds/orders.md'),
    'product/prds/orders.md',
  );

  for (const neighbour of [
    '.sdcorejs/designer/orders.md',
    '.sdcorejs/products/orders.md',
    'designer/specs/orders.md',
    'productivity/prds/orders.md',
  ]) {
    assert.equal(classifyProductArtifactPath(neighbour).ok, false, neighbour);
    assert.equal(classifyDesignArtifactPath(neighbour).ok, false, neighbour);
    assert.equal(isLegacyArtifactPath(neighbour), false, neighbour);
    assert.equal(
      toCanonicalArtifactPath(neighbour),
      neighbour,
      'a neighbouring directory name must never be rewritten',
    );
  }
});

test('category membership gates extension and path depth, not just the directory prefix', () => {
  for (const rejected of [
    '.sdcorejs/design/exports/png/orders/payload.zip',
    '.sdcorejs/design/exports/png/orders/notes.txt',
    '.sdcorejs/design/references/orders/list.svg',
    '.sdcorejs/design/wireframes/orders/list.png',
    '.sdcorejs/product/prds/orders.txt',
  ]) {
    const classification = classifyDesignArtifactPath(rejected).ok
      ? classifyDesignArtifactPath(rejected)
      : classifyProductArtifactPath(rejected);
    assert.equal(
      classification.ok,
      false,
      `${rejected} must fail closed on the declared extension allowlist`,
    );
  }

  // Nested categories address <feature>/<screen>. A flat file there has no
  // screen identity, so it must not inherit a guessed feature.
  for (const flat of [
    '.sdcorejs/design/references/login.png',
    '.sdcorejs/design/exports/png/login.png',
    '.sdcorejs/design/wireframes/login.html',
  ]) {
    const classification = classifyDesignArtifactPath(flat);
    assert.equal(classification.ok, false, flat);
    assert.equal(classification.code, 'INVALID_NESTED_ARTIFACT_PATH');
  }
  // Flat categories reject the inverse shape.
  assert.equal(
    classifyDesignArtifactPath('.sdcorejs/design/specs/orders/list.md').code,
    'INVALID_FLAT_ARTIFACT_PATH',
  );
  assert.equal(
    classifyDesignArtifactPath('.sdcorejs/design/exports/png/orders/list.png').screen,
    'list',
  );
});

test('durable metadata path validation rejects ledgers, diagnostics, and bare directories', () => {
  for (const [candidate, track] of [
    ['.sdcorejs/design/diagnostics/orders/list.png', 'design'],
    ['.sdcorejs/docs/design/orders.md', 'design'],
    ['.sdcorejs/docs/product/orders.md', 'product'],
    ['.sdcorejs/design/exports/png', 'design'],
    ['.sdcorejs/product/prds', 'product'],
  ]) {
    const result = validateCanonicalArtifactMetadataPath(candidate, { track });
    assert.equal(result.ok, false, `${candidate} is not a durable document path`);
  }
  assert.equal(
    validateCanonicalArtifactMetadataPath('.sdcorejs/product/prds/orders.md', {}).code,
    'UNKNOWN_ARTIFACT_TRACK',
    'an unrecognized track must not silently fall back to design classification',
  );
});

test('artifact inventories accept the documented shapes and never pass silently when omitted', () => {
  const canonical = '.sdcorejs/product/prds/orders.md';
  const expected = { state: 'canonical-existing', readPath: canonical };
  for (const files of [
    { [canonical]: '# PRD\n' },
    new Map([[canonical, '# PRD\n']]),
    [[canonical, '# PRD\n']],
    [{ path: canonical, content: '# PRD\n' }],
  ]) {
    const state = resolveArtifactLocationState({ files, canonicalPath: canonical });
    assert.equal(state.state, expected.state, JSON.stringify(files));
    assert.equal(state.readPath, expected.readPath);
  }
  assert.throws(
    () => planProductArtifactMigration({ feature: 'orders' }),
    /requires an explicit files inventory/,
  );
  assert.throws(
    () => resolveProductDocumentSources({ feature: 'orders' }),
    /requires an explicit files inventory/,
  );
  assert.throws(
    () => resolveDesignArtifactSources({ feature: 'orders' }),
    /requires an explicit files inventory/,
  );
  assert.throws(
    () => resolveDesignArtifactPaths('orders', { screens: 'list' }),
    /screens must be an array/,
  );
});

test('canonical and legacy copies differing only by line endings stay equivalent as bytes', () => {
  const canonical = '.sdcorejs/product/prds/orders.md';
  const legacy = 'product/prds/orders.md';
  // A caller that reads both copies without an encoding gets Buffers. On a
  // Windows checkout a CRLF/LF difference must not block the prescribed
  // migration.
  const state = resolveArtifactLocationState({
    files: new Map([
      [canonical, Buffer.from('# PRD\n\nSame body.\n')],
      [legacy, Buffer.from('# PRD\r\n\r\nSame body.\r\n')],
    ]),
    canonicalPath: canonical,
  });
  assert.equal(state.state, 'both-equivalent');
  assert.equal(state.readPath, canonical);

  const conflicting = resolveArtifactLocationState({
    files: new Map([
      [canonical, Buffer.from('# PRD\n\nCanonical body.\n')],
      [legacy, Buffer.from('# PRD\n\nCompeting body.\n')],
    ]),
    canonicalPath: canonical,
  });
  assert.equal(conflicting.state, 'both-conflicting');
});

test('new metadata rejects root-level Product and Design paths', () => {
  for (const legacyPath of [
    'product/prds/orders.md',
    'product/user-stories/orders.md',
    'product/acceptance-criteria/orders.md',
    'product/uat-checklists/orders.md',
    'product/decisions/orders.md',
  ]) {
    const result = validateCanonicalArtifactMetadataPath(legacyPath, { track: 'product' });
    assert.equal(result.ok, false);
    assert.equal(result.code, 'LEGACY_PRODUCT_DOCUMENT_PATH');
  }
  for (const legacyPath of [
    'design/specs/orders.md',
    'design/wireframes/orders/list.html',
    'design/exports/png/orders/list.png',
    'design/references/orders/list.png',
  ]) {
    const result = validateCanonicalArtifactMetadataPath(legacyPath, { track: 'design' });
    assert.equal(result.ok, false);
    assert.equal(result.code, 'LEGACY_DESIGN_ARTIFACT_PATH');
  }
  assert.equal(
    validateCanonicalArtifactMetadataPath('.sdcorejs/product/prds/orders.md', {
      track: 'product',
      category: 'prd',
    }).ok,
    true,
  );
  assert.equal(
    validateCanonicalArtifactMetadataPath('.sdcorejs/product/prds/orders.md', {
      track: 'product',
      category: 'user_stories',
    }).code,
    'PRODUCT_DOCUMENT_CATEGORY_MISMATCH',
  );
  assert.equal(
    validateCanonicalArtifactMetadataPath('../outside/prds/orders.md', { track: 'product' }).code,
    'INVALID_RELATIVE_PATH',
  );
});

test('canonical-only artifact reads and writes canonical without a legacy copy', () => {
  const files = { '.sdcorejs/product/prds/orders.md': '# PRD\n' };
  const state = resolveArtifactLocationState({
    files,
    canonicalPath: '.sdcorejs/product/prds/orders.md',
  });
  assert.equal(state.state, 'canonical-existing');
  assert.equal(state.readPath, '.sdcorejs/product/prds/orders.md');
  assert.equal(state.writePath, '.sdcorejs/product/prds/orders.md');
  assert.equal(state.migration, null);
  assert.equal(
    planProductArtifactMigration({ files, feature: 'orders' }).status,
    'not-required',
  );
});

test('legacy-only artifact is a read-only fallback and a migration target', () => {
  const files = { 'product/prds/orders.md': '# PRD\n' };
  const read = resolveArtifactReadSource({
    files,
    canonicalPath: '.sdcorejs/product/prds/orders.md',
  });
  assert.equal(read.status, 'legacy-fallback');
  assert.equal(read.readPath, 'product/prds/orders.md');
  assert.equal(read.writePath, '.sdcorejs/product/prds/orders.md');

  const sources = resolveProductDocumentSources({ files, feature: 'orders' });
  assert.equal(sources.status, 'resolved');
  assert.deepEqual(sources.legacy_fallback_paths, ['product/prds/orders.md']);

  const plan = planProductArtifactMigration({ files, feature: 'orders' });
  assert.equal(plan.status, 'migration-required');
  assert.deepEqual(plan.migrations, [
    { from: 'product/prds/orders.md', to: '.sdcorejs/product/prds/orders.md' },
  ]);
  assert.deepEqual(plan.conflicts, []);
});

test('legacy Design bundle migration is scoped to the requested feature', () => {
  const files = {
    'design/specs/orders.md': '# Orders spec\n',
    'design/wireframes/orders/list.html': '<main></main>\n',
    'design/specs/invoices.md': '# Unrelated historical spec\n',
  };
  const plan = planDesignArtifactMigration({
    files,
    feature: 'orders',
    screens: ['list'],
  });
  assert.equal(plan.status, 'migration-required');
  assert.deepEqual(plan.migrations, [
    { from: 'design/specs/orders.md', to: '.sdcorejs/design/specs/orders.md' },
    {
      from: 'design/wireframes/orders/list.html',
      to: '.sdcorejs/design/wireframes/orders/list.html',
    },
  ]);
  assert.ok(
    !JSON.stringify(plan.migrations).includes('invoices'),
    'unrelated historical artifacts must not be bulk-migrated',
  );

  const sources = resolveDesignArtifactSources({ files, feature: 'orders', screens: ['list'] });
  assert.deepEqual(sources.legacy_fallback_paths.sort(), [
    'design/specs/orders.md',
    'design/wireframes/orders/list.html',
  ]);
});

test('an equivalent legacy copy is retired instead of staying editable', () => {
  const files = {
    '.sdcorejs/product/prds/orders.md': '# PRD\n\nSame body.\n',
    'product/prds/orders.md': '# PRD\r\n\r\nSame body.   \n',
  };
  const state = resolveArtifactLocationState({
    files,
    canonicalPath: '.sdcorejs/product/prds/orders.md',
  });
  assert.equal(state.state, 'both-equivalent');
  assert.equal(state.readPath, '.sdcorejs/product/prds/orders.md');
  assert.deepEqual(state.migration, {
    operation: 'retire-legacy-copy',
    from: 'product/prds/orders.md',
    to: '.sdcorejs/product/prds/orders.md',
  });

  const plan = planProductArtifactMigration({ files, feature: 'orders' });
  assert.equal(plan.status, 'migration-required');
  assert.deepEqual(plan.retirements, [
    { from: 'product/prds/orders.md', to: '.sdcorejs/product/prds/orders.md' },
  ]);
  assert.deepEqual(plan.migrations, []);
  assert.equal(
    resolveProductDocumentSources({ files, feature: 'orders' }).legacy_fallback_paths.length,
    0,
    'an equivalent legacy copy must not remain a read source',
  );
});

test('a conflicting legacy copy blocks instead of merging competing sources', () => {
  const files = {
    '.sdcorejs/design/specs/orders.md': '# Orders spec\n\nCanonical behavior.\n',
    'design/specs/orders.md': '# Orders spec\n\nCompeting legacy behavior.\n',
  };
  const state = resolveArtifactLocationState({
    files,
    canonicalPath: '.sdcorejs/design/specs/orders.md',
  });
  assert.equal(state.state, 'both-conflicting');
  assert.equal(state.readPath, null);
  assert.equal(state.conflict, 'CANONICAL_LEGACY_CONFLICT');

  const read = resolveArtifactReadSource({
    files,
    canonicalPath: '.sdcorejs/design/specs/orders.md',
  });
  assert.equal(read.status, 'blocked');
  assert.match(read.blockers.join(' '), /resolve the conflicting source/);

  const plan = planDesignArtifactMigration({ files, feature: 'orders' });
  assert.equal(plan.status, 'blocked');
  assert.deepEqual(plan.conflicts, [
    {
      code: 'CANONICAL_LEGACY_CONFLICT',
      canonical_path: '.sdcorejs/design/specs/orders.md',
      legacy_path: 'design/specs/orders.md',
    },
  ]);
  assert.match(plan.blockers.join(' '), /never silently merge competing sources/);

  const sources = resolveDesignArtifactSources({ files, feature: 'orders' });
  assert.equal(sources.status, 'blocked');
});

test('migration never produces a duplicate editable artifact', () => {
  const files = { 'product/prds/orders.md': '# PRD\n' };
  const plan = planLegacyArtifactMigration({ files, track: 'product', feature: 'orders' });
  const destinations = plan.migrations.map((move) => move.to);
  assert.equal(new Set(destinations).size, destinations.length);
  for (const move of plan.migrations) {
    assert.ok(move.to.startsWith('.sdcorejs/product/'));
    assert.notEqual(move.from, move.to);
  }
  assert.deepEqual(plan.retirements, []);
});

test('local-only classification is directory-driven and never overrides a designed failure state', async () => {
  const { isLocalOnlyArtifactPath } = await import(
    '../../_refs/shared/artifact-lifecycle.mjs'
  );
  // `isLocalOnlyArtifactPath` is consulted before the runtime `artifact_context`
  // bucket, so a filename heuristic here would silently drop an approved
  // artifact from closure. Only declared directories and diagnostic extensions
  // may classify local-only.
  for (const durable of [
    '.sdcorejs/design/exports/png/orders/failure-state.png',
    '.sdcorejs/design/references/orders/failed-payment.png',
    '.sdcorejs/design/wireframes/orders/failure-state.svg',
    '.sdcorejs/design/wireframes/orders/checkout-failed.svg',
    '.sdcorejs/design/exports/png/orders/list.png',
    '.sdcorejs/documentation/user-guides/checkout/images/failed-payment.png',
  ]) {
    assert.equal(
      isLocalOnlyArtifactPath(durable),
      false,
      `${durable} is a designed state, not a renderer failure capture`,
    );
  }
  for (const directory of DESIGN_LOCAL_ONLY_DIRECTORIES) {
    assert.equal(
      isLocalOnlyArtifactPath(`${DESIGN_ARTIFACT_ROOT}/${directory}/orders/list.png`),
      true,
      `${directory} is a declared local-only Design directory`,
    );
  }
  for (const local of [
    '.sdcorejs/cache/orders/graph.json',
    '.sdcorejs/traces/orders/run.json',
    '.sdcorejs/evidence/orders/run.webm',
    '.sdcorejs/evidence/orders/trace.har',
    '.sdcorejs/evidence/orders/storage-state.json',
  ]) {
    assert.equal(isLocalOnlyArtifactPath(local), true, `${local} must stay local-only`);
  }
});

test('gitignore keeps every declared local-only Design directory untracked', async () => {
  const ignore = await readFile(path.join(root, '.gitignore'), 'utf8');
  for (const directory of DESIGN_LOCAL_ONLY_DIRECTORIES) {
    assert.ok(
      ignore.includes(`${DESIGN_ARTIFACT_ROOT}/${directory}/`),
      `.gitignore must ignore ${DESIGN_ARTIFACT_ROOT}/${directory}/ so renderer diagnostics are never tracked`,
    );
  }
});

test('canonical sources never carry an active root-level Product or Design write path', async () => {
  const files = await canonicalSourceFiles();
  const findings = [];
  for (const file of files) {
    const source = await readFile(file, 'utf8').catch(() => null);
    if (source === null) continue;
    findings.push(
      ...findActiveLegacyPathUsages(source, path.relative(root, file).replaceAll('\\', '/')),
    );
  }
  assert.deepEqual(findings, [], `active root-level Product/Design paths:\n${findings.join('\n')}`);
});

test('the path-convention sentinel fails on active instructions and allows legacy context', () => {
  const activeViolations = [
    'Write the PRD to `product/prds/orders.md`.',
    'Write the handoff to `design/specs/orders.md`.',
    "  if (!path.startsWith('design/specs/')) return false;",
    'prd_path: product/prds/orders.md',
    'Search `design/wireframes/` before generating UI.',
  ];
  for (const line of activeViolations) {
    assert.equal(
      findActiveLegacyPathUsages(line, 'fixture').length,
      1,
      `sentinel must reject: ${line}`,
    );
  }

  const allowedOccurrences = [
    'Legacy `product/prds/<feature>.md` is a read-only compatibility input.',
    'A migration moves `design/specs/orders.md` to the canonical location.',
    'Reject `design/wireframes/orders/list.html` in new metadata.',
    'Portal fallback is forbidden even for `design/exports/png/` artifacts.',
    'A canonical/legacy conflict for `product/decisions/orders.md` blocks closure.',
  ];
  for (const line of allowedOccurrences) {
    assert.deepEqual(
      findActiveLegacyPathUsages(line, 'fixture'),
      [],
      `sentinel must allow: ${line}`,
    );
  }

  assert.deepEqual(
    findActiveLegacyPathUsages('Write to `.sdcorejs/product/prds/orders.md`.', 'fixture'),
    [],
  );
  assert.deepEqual(
    findActiveLegacyPathUsages('libs/sample/features/product/pages/list.ts', 'fixture'),
    [],
  );
});

test('generated mirrors stay free of active root-level Product or Design write paths', async () => {
  const nested = await Promise.all(
    MIRROR_DIRECTORIES.map((directory) => walk(path.join(root, directory))),
  );
  const findings = [];
  for (const file of nested.flat()) {
    const source = await readFile(file, 'utf8').catch(() => null);
    if (source === null) continue;
    findings.push(
      ...findActiveLegacyPathUsages(source, path.relative(root, file).replaceAll('\\', '/')),
    );
  }
  assert.deepEqual(
    findings,
    [],
    `stale mirrors: run npm run sync:skills\n${findings.join('\n')}`,
  );
});

test('downstream frontend and orchestration references consume canonical Design paths', async () => {
  const [angular, executePlan, documentationLayout, claude, readme] = await Promise.all([
    readFile(path.join(root, 'skills/tracks/angular/sdcorejs-angular.md'), 'utf8'),
    readFile(path.join(root, 'skills/shared/sdlc/04-execute-plan.md'), 'utf8'),
    readFile(path.join(root, '_refs/shared/documentation-layout.md'), 'utf8'),
    readFile(path.join(root, 'CLAUDE.md'), 'utf8'),
    readFile(path.join(root, 'README.md'), 'utf8'),
  ]);
  assert.match(angular, /\.sdcorejs\/design\/specs\//);
  assert.match(angular, /\.sdcorejs\/design\/wireframes\//);
  assert.match(executePlan, /\.sdcorejs\/product\//);
  assert.match(executePlan, /\.sdcorejs\/design\//);
  assert.match(documentationLayout, /\.sdcorejs\/product\/\*\*/);
  assert.match(documentationLayout, /only[\s\S]{0,40}\.sdcorejs\/documentation\/\*\*/);
  assert.match(claude, /\.sdcorejs\/product\//);
  assert.match(claude, /\.sdcorejs\/design\//);
  assert.match(readme, /\.sdcorejs\/design\/exports\/png\//);
  assert.match(readme, /\.sdcorejs\/design\/references\//);
});
