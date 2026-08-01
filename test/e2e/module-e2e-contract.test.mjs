import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  orchestratePortalModuleE2E,
  resolveE2EAuthoringOwner,
  validateModuleE2EDiscoveryManifest,
} from '../../_refs/shared/module-e2e-contract.mjs';
import {
  validateExecutableReferenceSource,
  validateLocalizationPlaceholderContext,
} from '../../scripts/check-executable-references.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const sha = (character) => character.repeat(40);
const digest = (character) => character.repeat(64);

function availableManifest(moduleId, repositoryId, evidencePath = 'test-results/e2e.json') {
  return {
    schema_version: 1,
    module_id: moduleId,
    repository_id: repositoryId,
    e2e: {
      availability: 'available',
      runner: 'playwright',
      command: ['npm', 'run', 'e2e'],
      working_directory: '.',
      config_path: 'playwright.config.ts',
      evidence_path: evidencePath,
      test_paths: ['e2e'],
      capabilities: ['catalog.read'],
      required_portal_capabilities: [],
      persona_refs: ['catalog.viewer'],
      data_contract: {
        owner_repository_id: repositoryId,
        setup_owner_repository_id: repositoryId,
        cleanup_owner_repository_id: repositoryId,
      },
    },
  };
}

function fullEvidence(repositoryId, portalRevision, moduleRevision) {
  return {
    evidence_class: 'full-e2e',
    repository_id: repositoryId,
    source_fingerprint: digest('a'),
    portal_revision: portalRevision,
    module_revision: moduleRevision,
    portal_pinned_module_revision: moduleRevision,
    artifact_hashes: { 'test-results/e2e.json': digest('b') },
    actual_command: ['npm', 'run', 'e2e'],
  };
}

test('malformed Angular/Next executable regressions fail while localization strings remain valid', async () => {
  for (const fixture of ['angular-malformed.md', 'nextjs-malformed.md']) {
    const source = await readFile(
      path.join(repoRoot, 'test/e2e/fixtures/executable-references', fixture),
      'utf8',
    );
    const errors = await validateExecutableReferenceSource(source, fixture, {
      angularTemplates: fixture.startsWith('angular'),
    });
    assert.ok(errors.some((error) => /TypeScript\/TSX syntax/iu.test(error)), fixture);
  }

  const valid = await readFile(
    path.join(
      repoRoot,
      'test/e2e/fixtures/executable-references/localization-valid.md',
    ),
    'utf8',
  );
  assert.deepEqual(validateLocalizationPlaceholderContext(valid, 'valid.md'), []);

  const invalid = await readFile(
    path.join(
      repoRoot,
      'test/e2e/fixtures/executable-references/localization-invalid.md',
    ),
    'utf8',
  );
  const invalidErrors = validateLocalizationPlaceholderContext(invalid, 'invalid.md');
  assert.ok(invalidErrors.some((error) => error.includes('invalid.md:3')));
  assert.ok(invalidErrors.some((error) => error.includes('invalid.md:6')));
});

test('portal invocation authors Module A E2E in Module A and never copies to portal', () => {
  const request = {
    behavior_scope: 'module',
    requested_module: 'module-a',
    execution_host_repository_id: 'github.com/acme/portal',
    portal: { repository_id: 'github.com/acme/portal' },
    topology: {
      modules: [
        {
          module_id: 'module-a',
          repository_id: 'github.com/acme/module-a',
          available: true,
          writable: true,
        },
      ],
    },
  };
  const result = resolveE2EAuthoringOwner(request);
  assert.equal(result.status, 'resolved');
  assert.equal(result.test_owner_repository_id, 'github.com/acme/module-a');
  assert.equal(result.fixture_owner_repository_id, 'github.com/acme/module-a');
  assert.equal(result.selector_owner_repository_id, 'github.com/acme/module-a');
  assert.equal(result.data_contract_owner_repository_id, 'github.com/acme/module-a');
  assert.equal(result.copy_tests_to_portal, false);

  const nonWritable = resolveE2EAuthoringOwner({
    ...request,
    topology: {
      modules: [{ ...request.topology.modules[0], writable: false }],
    },
  });
  assert.equal(nonWritable.status, 'blocked');
  assert.equal(nonWritable.owner_repository_id, 'github.com/acme/module-a');
  assert.notEqual(nonWritable.write_target, 'github.com/acme/portal');
});

test('portal-shell and cross-module suites require their semantic or explicit owner', () => {
  const portalShell = resolveE2EAuthoringOwner({
    behavior_scope: 'portal-shell',
    execution_host_repository_id: 'github.com/acme/tooling',
    portal: { repository_id: 'github.com/acme/portal' },
  });
  assert.equal(portalShell.test_owner_repository_id, 'github.com/acme/portal');

  const base = {
    behavior_scope: 'cross-module',
    execution_host_repository_id: 'github.com/acme/portal',
    portal: { repository_id: 'github.com/acme/portal' },
    topology: {
      modules: [
        {
          module_id: 'integration',
          repository_id: 'github.com/acme/integration',
        },
      ],
    },
  };
  assert.equal(resolveE2EAuthoringOwner(base).status, 'blocked');
  const explicit = resolveE2EAuthoringOwner({
    ...base,
    integration_owner_repository_id: 'github.com/acme/integration',
  });
  assert.equal(explicit.test_owner_repository_id, 'github.com/acme/integration');
});

test('module discovery preserves NOT APPLICABLE, NOT RUN, provenance, and filename isolation', () => {
  const portalRevision = sha('1');
  const moduleRevision = sha('2');
  const modules = [
    {
      module_id: 'module-a',
      repository_id: 'github.com/acme/module-a',
      checkout_path: 'C:/work/module-a',
      available: true,
      revision: moduleRevision,
      pinned_revision: moduleRevision,
      manifest: availableManifest(
        'module-a',
        'github.com/acme/module-a',
        'test-results/result.json',
      ),
    },
    {
      module_id: 'module-b',
      repository_id: 'github.com/acme/module-b',
      checkout_path: 'C:/work/module-b',
      available: true,
      revision: sha('3'),
      pinned_revision: sha('3'),
      manifest: {
        schema_version: 1,
        module_id: 'module-b',
        repository_id: 'github.com/acme/module-b',
        e2e: { availability: 'not-applicable', reason: 'no browser behavior' },
      },
    },
    {
      module_id: 'module-c',
      repository_id: 'github.com/acme/module-c',
      checkout_path: 'C:/work/module-c',
      available: true,
      revision: sha('4'),
      pinned_revision: sha('4'),
      manifest: null,
    },
    {
      module_id: 'module-d',
      repository_id: 'github.com/acme/module-d',
      checkout_path: 'C:/work/module-d',
      available: true,
      revision: moduleRevision,
      pinned_revision: moduleRevision,
      manifest: availableManifest(
        'module-d',
        'github.com/acme/module-d',
        'test-results/result.json',
      ),
    },
    {
      module_id: 'module-e',
      repository_id: 'github.com/acme/module-e',
      checkout_path: null,
      available: false,
      revision: null,
      pinned_revision: sha('5'),
      manifest: null,
    },
  ];
  const aggregate = orchestratePortalModuleE2E({
    portal_repository_id: 'github.com/acme/portal',
    portal_revision: portalRevision,
    modules,
    run_results: {
      'module-a': {
        result: 'PASSED',
        evidence: fullEvidence(
          'github.com/acme/module-a',
          portalRevision,
          moduleRevision,
        ),
      },
      'module-d': {
        result: 'SKIPPED',
        evidence: fullEvidence(
          'github.com/acme/module-d',
          portalRevision,
          moduleRevision,
        ),
      },
    },
  });
  assert.deepEqual(
    aggregate.modules.map(({ result }) => result),
    ['PASSED', 'NOT APPLICABLE', 'NOT RUN', 'SKIPPED', 'NOT RUN'],
  );
  assert.equal(aggregate.modules[0].evidence_status, 'current');
  assert.match(aggregate.modules[2].blocker, /manifest error/iu);
  assert.match(aggregate.modules[4].blocker, /missing or uninitialized/iu);
  assert.notEqual(aggregate.modules[0].evidence_id, aggregate.modules[3].evidence_id);
  assert.ok(aggregate.modules.every(({ copy_tests_to_portal: copied }) => !copied));
  assert.equal(aggregate.full_e2e_satisfied, false);
});

test('source/pinned revision mismatch and supplemental smoke cannot satisfy full E2E', () => {
  const portalRevision = sha('6');
  const moduleRevision = sha('7');
  const module = {
    module_id: 'module-a',
    repository_id: 'github.com/acme/module-a',
    checkout_path: '/work/module-a',
    available: true,
    revision: moduleRevision,
    pinned_revision: sha('8'),
    manifest: availableManifest('module-a', 'github.com/acme/module-a'),
  };
  const mismatch = orchestratePortalModuleE2E({
    portal_repository_id: 'github.com/acme/portal',
    portal_revision: portalRevision,
    modules: [module],
    run_results: {
      'module-a': {
        result: 'PASSED',
        evidence: {
          ...fullEvidence(
            'github.com/acme/module-a',
            portalRevision,
            moduleRevision,
          ),
          portal_pinned_module_revision: sha('8'),
        },
      },
    },
  });
  assert.equal(mismatch.modules[0].evidence_status, 'mismatched');
  assert.equal(mismatch.full_e2e_satisfied, false);

  const smoke = orchestratePortalModuleE2E({
    portal_repository_id: 'github.com/acme/portal',
    portal_revision: portalRevision,
    modules: [{ ...module, pinned_revision: moduleRevision }],
    run_results: {
      'module-a': {
        result: 'PASSED',
        evidence: {
          ...fullEvidence(
            'github.com/acme/module-a',
            portalRevision,
            moduleRevision,
          ),
          evidence_class: 'supplemental-smoke',
        },
      },
    },
  });
  assert.equal(smoke.modules[0].evidence_status, 'invalid');
  assert.match(smoke.modules[0].blocker, /cannot satisfy module full E2E/iu);
});

test('module manifests reject credential material and non-module data ownership', () => {
  const manifest = availableManifest('module-a', 'github.com/acme/module-a');
  assert.throws(
    () =>
      validateModuleE2EDiscoveryManifest({
        ...manifest,
        e2e: { ...manifest.e2e, token: 'secret-value' },
      }),
    /credential material/iu,
  );
  assert.throws(
    () =>
      validateModuleE2EDiscoveryManifest({
        ...manifest,
        e2e: {
          ...manifest.e2e,
          data_contract: {
            ...manifest.e2e.data_contract,
            cleanup_owner_repository_id: 'github.com/acme/portal',
          },
        },
      }),
    /cleanup_owner_repository_id/iu,
  );
});
