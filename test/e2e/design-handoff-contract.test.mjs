import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
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
      repository_relative_path: 'design/specs/orders.md',
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
      path: 'design/wireframes/orders/list.html',
      format: 'html',
      artifact_hash: HASH_A,
      limitation: null,
    },
    static_exports: [
      {
        path: 'design/exports/png/orders/list.png',
        classification: 'generated-mockup',
        sha256: 'a'.repeat(64),
        source_editable_artifact_hash: HASH_A,
      },
    ],
    product_screenshots: [
      {
        path: 'design/references/orders/list-real.png',
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
  assert.equal(result.repository_relative_path, 'design/specs/orders.md');
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
      repository_relative_path: 'design/specs/portal-orders-users.md',
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
      path: 'design/wireframes/portal-orders-users/composition.html',
      format: 'html',
      artifact_hash: HASH_B,
      limitation: null,
    },
    static_exports: [
      {
        path: 'design/exports/png/portal-orders-users/composition.png',
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
        repository_relative_path: 'design/specs/orders.md',
        revision: SHA_A,
        artifact_hash: HASH_A,
        editable: false,
      },
      {
        repository_id: 'github.com/sdcorejs/users',
        module_id: 'users',
        artifact_id: 'design-handoff:users',
        artifact_kind: 'design-handoff',
        repository_relative_path: 'design/specs/users.md',
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
});
