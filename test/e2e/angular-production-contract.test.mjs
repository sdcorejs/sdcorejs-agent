import assert from 'node:assert/strict';
import test from 'node:test';
import { designFixture } from './support/design-handoff-fixture.mjs';

test('case-design-real-consumer-enforcement: Angular requires current verified Design authority', async t => {
  const { resolveAngularExecution } = await import('../../_refs/angular/execution-contract.mjs');
  const f = designFixture(t), runtime = await f.runtime();
  const request = { project_profile: 'core-ui-angular', execution_profile: 'developer', scope: 'application', application: { repository_id: f.repo }, execution_host_repository_id: f.repo, design_handoff: f.handoff };
  assert.equal(resolveAngularExecution(request).production_eligible, false);
  assert.equal(resolveAngularExecution(request, { design_runtime: runtime }).production_eligible, true);
  assert.equal(resolveAngularExecution({ ...request, design_handoff: undefined }, { design_runtime: runtime }).status, 'blocked');
  f.put(f.handoff.editable_source.path, '<main>Unverified change</main>');
  const result = resolveAngularExecution(request, { design_runtime: runtime });
  assert.equal(result.status, 'blocked'); assert.equal(result.write_target, null);
});
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

async function importRepoModule(relativePath) {
  return import(pathToFileURL(path.join(repoRoot, relativePath)).href);
}

test('Angular execution contract resolves application and module owners without portal fallback', async () => {
  const { resolveAngularExecution } = await importRepoModule(
    '_refs/angular/execution-contract.mjs',
  );
  const topology = {
    modules: [
      {
        module_id: 'orders',
        repository_id: 'github.com/acme/orders',
        role: 'module',
        available: true,
        writable: true,
      },
    ],
  };
  const moduleResult = resolveAngularExecution({
    project_profile: 'core-ui-angular',
    execution_profile: 'developer',
    scope: 'module',
    requested_module: 'orders',
    topology,
    execution_host_repository_id: 'github.com/acme/portal',
    application: { repository_id: 'github.com/acme/app' },
    portal: { repository_id: 'github.com/acme/portal' },
  });
  assert.equal(moduleResult.status, 'resolved');
  assert.equal(moduleResult.owner_repository_id, 'github.com/acme/orders');

  const missing = resolveAngularExecution({
    project_profile: 'core-ui-angular',
    execution_profile: 'developer',
    scope: 'module',
    requested_module: 'billing',
    topology,
    execution_host_repository_id: 'github.com/acme/portal',
    application: { repository_id: 'github.com/acme/app' },
    portal: { repository_id: 'github.com/acme/portal' },
  });
  assert.equal(missing.status, 'blocked');
  assert.equal(missing.owner_repository_id, null);
  assert.match(missing.blockers.join(' '), /portal fallback is forbidden/iu);

  const application = resolveAngularExecution({
    project_profile: 'core-ui-angular',
    execution_profile: 'developer',
    scope: 'application',
    execution_host_repository_id: 'github.com/acme/tooling',
    application: { repository_id: 'github.com/acme/app' },
  });
  assert.equal(application.owner_repository_id, 'github.com/acme/app');
  assert.equal(application.owner_repository_role, 'standalone');
});

test('technical prototype and optional Angular packs require explicit approved scope', async () => {
  const { resolveAngularExecution } = await importRepoModule(
    '_refs/angular/execution-contract.mjs',
  );
  const base = {
    project_profile: 'core-ui-angular',
    execution_profile: 'technical-prototype',
    scope: 'application',
    execution_host_repository_id: 'github.com/acme/app',
    application: { repository_id: 'github.com/acme/app' },
  };
  assert.equal(resolveAngularExecution(base).status, 'blocked');
  assert.equal(
    resolveAngularExecution({ ...base, explicit_profile_approval: true }).status,
    'blocked',
  );
  const approved = resolveAngularExecution({
    ...base,
    explicit_profile_approval: true,
    prototype_assumptions: ['mock service is demo-only'],
    requested_optional_features: ['seed-data'],
    approved_optional_features: ['seed-data'],
  });
  assert.equal(approved.status, 'resolved');
  assert.equal(approved.production_eligible, false);

  assert.equal(
    resolveAngularExecution({
      ...base,
      execution_profile: 'developer',
      requested_optional_features: ['admin'],
    }).status,
    'blocked',
  );
  assert.equal(
    resolveAngularExecution({
      ...base,
      execution_profile: 'developer',
      requested_optional_features: ['admin'],
      approved_optional_features: ['admin'],
    }).status,
    'resolved',
  );
});

test('Angular policy makes TDD authoring mandatory and admin/prototype conditional', async () => {
  const [skill, prototypeReference, adminReference] = await Promise.all([
    readFile(path.join(repoRoot, 'skills/tracks/angular/sdcorejs-angular.md'), 'utf8'),
    readFile(path.join(repoRoot, '_refs/angular/write-code/po-ba-prototype.md'), 'utf8'),
    readFile(path.join(repoRoot, '_refs/angular/write-code/admin-screens.md'), 'utf8'),
  ]);
  assert.match(skill, /technical-prototype.*explicit/isu);
  assert.match(skill, /test authoring.*mandatory/isu);
  assert.match(skill, /finish gate.*integration.*E2E/isu);
  assert.doesNotMatch(skill, /admin-screens.*ALWAYS runs/isu);
  assert.doesNotMatch(skill, /Every generated portal includes the admin screens/isu);
  assert.match(prototypeReference, /not production/iu);
  assert.match(prototypeReference, /explicit opt-in/iu);
  assert.match(adminReference, /approved requirement|approved.*profile/iu);
  assert.doesNotMatch(adminReference.slice(0, 300), /\bALWAYS\b/u);
});

// Audit repair (UR-1): Angular preflight does not treat an ordinary review_context as UI review.
test('case-repair-ordinary-review: Angular execution accepts an ordinary review_context', async t => {
  const { uiReviewFixture } = await import('./support/ui-review-fixture.mjs');
  const { resolveAngularExecution } = await import('../../_refs/angular/execution-contract.mjs');
  const f = uiReviewFixture(t);
  const request = { project_profile: 'core-ui-angular', execution_profile: 'developer', scope: 'application', application: { repository_id: f.repo },
    execution_host_repository_id: f.repo, design_handoff: f.handoff, review_context: { schema_version: 1, source: 'sdcorejs-review', subject_track: 'workflow',
      review_profile: 'workflow', mode: 'read-only', dimensions: ['security'], write_actions: [], reported_findings: [] } };
  const result = resolveAngularExecution(request, { design_runtime: f.designRuntime, ui_review_runtime: f.uiRuntime });
  assert.equal(result.production_eligible, true, JSON.stringify(result.blockers));
});
