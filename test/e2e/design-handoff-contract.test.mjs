import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  buildDesignArtifactContext,
  createDesignHandoff,
  resolveDesignHandoffTarget,
  validateDesignHandoff,
} from '../../_refs/shared/design-handoff.mjs';

const root = path.resolve('.');
const SHA_A = 'a'.repeat(40);
const SHA_B = 'b'.repeat(40);
const HASH_A = `sha256:v1:${'a'.repeat(64)}`;
const HASH_B = `sha256:v1:${'b'.repeat(64)}`;

function reference(artifactKind, artifactId, overrides = {}) {
  return {
    repository_id: 'github.com/sdcorejs/orders',
    artifact_id: artifactId,
    artifact_kind: artifactKind,
    revision: SHA_A,
    approval_hash: HASH_A,
    ...overrides,
  };
}

function handoff(overrides = {}) {
  return {
    metadata: {
      schema_version: 1,
      artifact_id: 'design-handoff:orders',
      artifact_kind: 'design-handoff',
      contract_id: 'contract:orders',
      requirement_id: 'requirement:orders',
      change_ref: 'orders-change',
      track: 'design',
      stack_profile: 'design',
      experience_scope: 'module',
      owner_repository_id: 'github.com/sdcorejs/orders',
      owner_repository_role: 'module',
      owner_module_id: 'orders',
      ownership_scope: 'module',
      repository_relative_path: '.sdcorejs/design/specs/orders.md',
      source_revision: SHA_A,
      parent_references: [
        reference('spec', 'spec:orders'),
        reference('plan', 'plan:orders'),
      ],
      supersedes: null,
      approval_hash: null,
    },
    editable_source: {
      status: 'available',
      path: '.sdcorejs/design/wireframes/orders/list.html',
      format: 'html',
      artifact_hash: HASH_A,
      limitation: null,
    },
    static_exports: [
      {
        path: '.sdcorejs/design/exports/png/orders/list.png',
        classification: 'generated-mockup',
        sha256: 'a'.repeat(64),
        source_editable_artifact_hash: HASH_A,
      },
    ],
    product_screenshots: [
      {
        path: '.sdcorejs/design/references/orders/list-real.png',
        classification: 'real-product-screenshot',
        repository_id: 'github.com/sdcorejs/orders',
        source_revision: SHA_A,
        app_revision: SHA_A,
        evidence_id: 'capture:orders-list',
        captured_at: '2026-07-31T00:00:00.000Z',
        sha256: 'b'.repeat(64),
      },
    ],
    responsive: {
      desktop: true,
      tablet: true,
      mobile: true,
      notes: 'Touch targets, keyboard, safe areas, zoom, and reduced motion.',
    },
    component_mapping: [
      {
        need: 'orders table',
        component: 'SdTable',
        status: 'confirmed',
        evidence_refs: [
          {
            repository_id: 'github.com/sdcorejs/orders',
            path: 'src/orders/list.component.ts',
            revision: SHA_A,
          },
        ],
      },
    ],
    design_system_reuse: {
      inspected: true,
      evidence_refs: [
        {
          repository_id: 'github.com/sdcorejs/orders',
          path: 'src/styles/tokens.css',
          revision: SHA_A,
        },
      ],
      deviations: [],
    },
    cross_repository_references: [],
    production_code_paths: [],
    status: 'ready-for-implementation',
    ...overrides,
  };
}

test('module design handoff routes to its module repository', () => {
  const result = resolveDesignHandoffTarget({
    experience_scope: 'module',
    feature: 'orders',
    screens: ['list'],
    module: {
      id: 'orders',
      repository_id: 'github.com/sdcorejs/orders',
      available: true,
      writable: true,
    },
    portal: { repository_id: 'github.com/sdcorejs/portal' },
    execution_host_repository_id: 'github.com/sdcorejs/portal',
  });
  assert.equal(result.status, 'resolved');
  assert.equal(result.owner_repository_id, 'github.com/sdcorejs/orders');
  assert.equal(result.repository_relative_path, '.sdcorejs/design/specs/orders.md');
  assert.equal(result.ledger_relative_path, '.sdcorejs/docs/design/orders.md');
  assert.equal(result.artifact_root, '.sdcorejs/design');
  assert.equal(result.ledger_root, '.sdcorejs/docs/design');
  assert.equal(result.flow_path, '.sdcorejs/design/flows/orders.md');
  assert.equal(result.decisions_path, '.sdcorejs/design/decisions/orders.md');
  assert.equal(result.wireframe_directory, '.sdcorejs/design/wireframes/orders');
  assert.equal(result.png_export_directory, '.sdcorejs/design/exports/png/orders');
  assert.equal(result.reference_directory, '.sdcorejs/design/references/orders');
  assert.deepEqual(result.screens[0], {
    screen: 'list',
    wireframe_html_path: '.sdcorejs/design/wireframes/orders/list.html',
    wireframe_svg_path: '.sdcorejs/design/wireframes/orders/list.svg',
    png_export_path: '.sdcorejs/design/exports/png/orders/list.png',
    reference_path: '.sdcorejs/design/references/orders/list.png',
    legacy_wireframe_html_path: 'design/wireframes/orders/list.html',
    legacy_wireframe_svg_path: 'design/wireframes/orders/list.svg',
    legacy_png_export_path: 'design/exports/png/orders/list.png',
    legacy_reference_path: 'design/references/orders/list.png',
  });
});

test('design handoff validation rejects every root-level legacy write path', () => {
  const cases = [
    {
      label: 'handoff spec',
      input: handoff({
        metadata: {
          ...handoff().metadata,
          repository_relative_path: 'design/specs/orders.md',
        },
      }),
      code: 'INVALID_DESIGN_HANDOFF_PATH',
      field: 'repository_relative_path',
    },
    {
      label: 'editable source',
      input: handoff({
        editable_source: {
          ...handoff().editable_source,
          path: 'design/wireframes/orders/list.html',
        },
      }),
      code: 'INVALID_EDITABLE_SOURCE_PATH',
      field: 'editable_source.path',
    },
    {
      label: 'static export',
      input: handoff({
        static_exports: [
          {
            ...handoff().static_exports[0],
            path: 'design/exports/png/orders/list.png',
          },
        ],
      }),
      code: 'INVALID_STATIC_DESIGN_PROVENANCE',
      field: 'static_exports[0].path',
    },
    {
      label: 'product screenshot',
      input: handoff({
        product_screenshots: [
          {
            ...handoff().product_screenshots[0],
            path: 'design/references/orders/list-real.png',
          },
        ],
      }),
      code: 'INVALID_PRODUCT_SCREENSHOT_PROVENANCE',
      field: 'product_screenshots[0].path',
    },
  ];
  for (const { label, input, code, field } of cases) {
    const result = validateDesignHandoff(input);
    assert.equal(result.ok, false, `${label} must fail closed`);
    assert.ok(
      result.errors.some((error) => error.code === code),
      `${label} must report ${code}`,
    );
    assert.ok(
      result.errors.some(
        (error) => error.code === 'LEGACY_DESIGN_ARTIFACT_PATH' && error.field === field,
      ),
      `${label} must report LEGACY_DESIGN_ARTIFACT_PATH for ${field}`,
    );
  }

  const outsideReferenceRoot = validateDesignHandoff(
    handoff({
      product_screenshots: [
        {
          ...handoff().product_screenshots[0],
          path: '.sdcorejs/design/exports/png/orders/list-real.png',
        },
      ],
    }),
  );
  assert.equal(outsideReferenceRoot.ok, false);
  assert.ok(
    outsideReferenceRoot.errors.some(
      ({ code }) => code === 'INVALID_PRODUCT_SCREENSHOT_PROVENANCE',
    ),
    'a real screenshot must live under the approved references root',
  );
});

test('design artifact context covers the whole bundle and keeps diagnostics local', () => {
  const context = buildDesignArtifactContext({
    feature: 'orders',
    change_ref: 'orders-change',
    source_spec: '.sdcorejs/specs/design/orders.md',
    source_plan: '.sdcorejs/plans/design/orders.md',
    editable_sources: ['.sdcorejs/design/wireframes/orders/list.html'],
    static_exports: ['.sdcorejs/design/exports/png/orders/list.png'],
    product_screenshots: ['.sdcorejs/design/references/orders/list.png'],
    diagnostics: ['.sdcorejs/design/diagnostics/orders/list-failure.png'],
  });
  assert.deepEqual(context.required_with_change.map(({ path: item }) => item), [
    '.sdcorejs/design/flows/orders.md',
    '.sdcorejs/design/specs/orders.md',
    '.sdcorejs/design/decisions/orders.md',
    '.sdcorejs/design/wireframes/orders/list.html',
    '.sdcorejs/design/exports/png/orders/list.png',
    '.sdcorejs/design/references/orders/list.png',
    '.sdcorejs/docs/design/orders.md',
  ]);
  assert.deepEqual(context.local_only.map(({ path: item }) => item), [
    '.sdcorejs/design/diagnostics/orders/list-failure.png',
  ]);
  assert.throws(
    () =>
      buildDesignArtifactContext({
        feature: 'orders',
        change_ref: 'orders-change',
        static_exports: ['design/exports/png/orders/list.png'],
      }),
    /LEGACY_DESIGN_ARTIFACT_PATH/,
  );
  // The declared extension and the <feature>/<screen> depth are gates too, so a
  // stray archive dropped into an export directory cannot ride along.
  assert.throws(
    () =>
      buildDesignArtifactContext({
        feature: 'orders',
        change_ref: 'orders-change',
        static_exports: ['.sdcorejs/design/exports/png/orders/payload.zip'],
      }),
    /INVALID_DESIGN_ARTIFACT_PATH/,
  );
  assert.throws(
    () =>
      buildDesignArtifactContext({
        feature: 'orders',
        change_ref: 'orders-change',
        documents: ['specs', 'flow'],
      }),
    /unknown design document category: specs/,
  );
  assert.throws(
    () =>
      buildDesignArtifactContext({
        feature: 'orders',
        change_ref: 'orders-change',
        diagnostics: ['.sdcorejs/design/exports/png/orders/list.png'],
      }),
    /design diagnostic must live under/,
  );
  assert.throws(
    () => buildDesignArtifactContext({ feature: 'orders' }),
    /change_ref is required/,
  );
});

test('portal shell and composition handoffs remain portal-owned', () => {
  for (const experienceScope of ['portal-shell', 'portal-composition']) {
    const result = resolveDesignHandoffTarget({
      experience_scope: experienceScope,
      feature: `${experienceScope}-design`,
      portal: { repository_id: 'github.com/sdcorejs/portal' },
      execution_host_repository_id: 'github.com/sdcorejs/orders',
    });
    assert.equal(result.owner_repository_id, 'github.com/sdcorejs/portal');
    assert.equal(result.owner_repository_role, 'portal');
  }
});

test('cross-module design has an explicit integration owner and verified durable references', () => {
  const input = handoff({
    metadata: {
      ...handoff().metadata,
      artifact_id: 'design-handoff:portal-orders-users',
      contract_id: 'contract:portal-orders-users',
      requirement_id: 'requirement:portal-orders-users',
      experience_scope: 'cross-module',
      owner_repository_id: 'github.com/sdcorejs/portal',
      owner_repository_role: 'portal',
      owner_module_id: null,
      ownership_scope: 'cross-repository-aggregate',
      repository_relative_path: '.sdcorejs/design/specs/portal-orders-users.md',
      source_revision: SHA_B,
      parent_references: [
        reference('spec', 'spec:portal-orders-users', {
          repository_id: 'github.com/sdcorejs/portal',
          revision: SHA_B,
        }),
        reference('plan', 'plan:portal-orders-users', {
          repository_id: 'github.com/sdcorejs/portal',
          revision: SHA_B,
        }),
      ],
    },
    editable_source: {
      status: 'available',
      path: '.sdcorejs/design/wireframes/portal-orders-users/composition.html',
      format: 'html',
      artifact_hash: HASH_B,
      limitation: null,
    },
    static_exports: [
      {
        path: '.sdcorejs/design/exports/png/portal-orders-users/composition.png',
        classification: 'generated-mockup',
        sha256: 'c'.repeat(64),
        source_editable_artifact_hash: HASH_B,
      },
    ],
    cross_repository_references: [
      {
        repository_id: 'github.com/sdcorejs/orders',
        module_id: 'orders',
        artifact_id: 'design-handoff:orders',
        artifact_kind: 'design-handoff',
        repository_relative_path: '.sdcorejs/design/specs/orders.md',
        revision: SHA_A,
        artifact_hash: HASH_A,
        editable: false,
      },
      {
        repository_id: 'github.com/sdcorejs/users',
        module_id: 'users',
        artifact_id: 'design-handoff:users',
        artifact_kind: 'design-handoff',
        repository_relative_path: '.sdcorejs/design/specs/users.md',
        revision: SHA_B,
        artifact_hash: HASH_B,
        editable: false,
      },
    ],
  });
  const created = createDesignHandoff(input);
  assert.equal(created.metadata.owner_repository_id, 'github.com/sdcorejs/portal');
  assert.match(created.metadata.artifact_hash, /^sha256:v1:[a-f0-9]{64}$/);
  assert.equal(created.cross_repository_references.length, 2);

  const stale = validateDesignHandoff(created, {
    repository_revisions: {
      'github.com/sdcorejs/orders': SHA_B,
      'github.com/sdcorejs/users': SHA_B,
    },
  });
  assert.equal(stale.ok, false);
  assert.ok(stale.errors.some(({ code }) => code === 'STALE_DESIGN_REFERENCE'));
});

test('design handoff rejects production code authority and missing approved parents', () => {
  assert.throws(
    () =>
      createDesignHandoff(
        handoff({ production_code_paths: ['src/orders.component.ts'] }),
      ),
    /production code/i,
  );
  assert.throws(
    () =>
      createDesignHandoff(
        handoff({
          metadata: {
            ...handoff().metadata,
            parent_references: [reference('spec', 'spec:orders')],
          },
        }),
      ),
    /approved spec and plan/i,
  );
});

test('editable-source and image provenance gates fail closed', () => {
  const unavailable = validateDesignHandoff(
    handoff({
      editable_source: {
        status: 'unavailable',
        path: null,
        format: null,
        artifact_hash: null,
        limitation: 'No editable design surface is connected.',
      },
    }),
  );
  assert.equal(unavailable.ok, false);
  assert.ok(
    unavailable.errors.some(
      ({ code }) => code === 'EDITABLE_SOURCE_UNAVAILABLE',
    ),
  );

  const fakeScreenshot = validateDesignHandoff(
    handoff({
      product_screenshots: [
        {
          ...handoff().product_screenshots[0],
          classification: 'generated-mockup',
        },
      ],
    }),
  );
  assert.equal(fakeScreenshot.ok, false);
  assert.ok(
    fakeScreenshot.errors.some(
      ({ code }) => code === 'INVALID_PRODUCT_SCREENSHOT_PROVENANCE',
    ),
  );

  const noEvidenceComponent = validateDesignHandoff(
    handoff({
      component_mapping: [
        {
          need: 'orders table',
          component: 'SdTable',
          status: 'confirmed',
          evidence_refs: [],
        },
      ],
    }),
  );
  assert.equal(noEvidenceComponent.ok, false);
  assert.ok(
    noEvidenceComponent.errors.some(
      ({ code }) => code === 'CONFIRMED_COMPONENT_WITHOUT_EVIDENCE',
    ),
  );
});

test('design prose preserves handoff discipline without expanding implementation authority', async () => {
  const [skill, contract] = await Promise.all([
    readFile(path.join(root, 'skills/tracks/design/sdcorejs-design.md'), 'utf8'),
    readFile(path.join(root, '_refs/shared/design-handoff.md'), 'utf8'),
  ]);
  assert.match(skill, /system-registry\.json/);
  assert.match(skill, /approved-artifact\.mjs/);
  assert.match(skill + contract, /portal fallback is forbidden/i);
  assert.match(skill + contract, /editable source before PNG/i);
  assert.match(skill + contract, /generated-mockup/);
  assert.match(skill + contract, /real-product-screenshot/);
  assert.match(skill + contract, /responsive/i);
  assert.match(skill + contract, /existing design system/i);
  assert.match(skill + contract, /does not write production code/i);
  assert.match(skill + contract, /must not mutate approved/i);
  assert.match(skill, /\.sdcorejs\/design\/flows\//);
  assert.match(skill, /\.sdcorejs\/design\/specs\//);
  assert.match(skill, /\.sdcorejs\/design\/decisions\//);
  assert.match(skill, /\.sdcorejs\/design\/wireframes\//);
  assert.match(skill, /\.sdcorejs\/design\/exports\/png\//);
  assert.match(skill, /\.sdcorejs\/design\/references\//);
  assert.match(skill, /\.sdcorejs\/docs\/design\//);
  assert.match(skill, /\.sdcorejs\/product\/user-stories\//);
  assert.match(skill + contract, /read-only compatibility/i);
  assert.match(skill + contract, /artifact-paths\.mjs/);
  assert.match(contract, /LEGACY_DESIGN_ARTIFACT_PATH/);
  assert.match(skill + contract, /local_only/);
  for (const legacyWrite of [
    /Write [^\n]*`design\/specs\//i,
    /repository_relative_path: design\//,
    /Screenshot\/export to `design\/exports\/png\//,
  ]) {
    assert.doesNotMatch(skill, legacyWrite);
    assert.doesNotMatch(contract, legacyWrite);
  }
});
