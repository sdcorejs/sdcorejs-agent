import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

async function importRepoModule(relativePath) {
  return import(pathToFileURL(path.join(repoRoot, relativePath)).href);
}

test('basic Next.js profile does not infer i18n, contact, analytics, CMS, or advanced SEO', async () => {
  const { resolveNextjsExecution } = await importRepoModule(
    '_refs/nextjs/execution-contract.mjs',
  );
  const result = resolveNextjsExecution({
    project_profile: 'nextjs-build-website',
    execution_profile: 'developer',
    website_profile: 'basic',
    explicit_profile_approval: true,
    scope: 'site',
    site: { repository_id: 'github.com/acme/site' },
    execution_host_repository_id: 'github.com/acme/tooling',
    requested_features: ['init-site', 'theme', 'pages', 'responsive'],
  });
  assert.equal(result.status, 'resolved');
  assert.equal(result.production_eligible, true);
  for (const feature of [
    'i18n',
    'contact-form',
    'seo-advanced',
    'analytics',
    'cms-integration',
  ]) {
    assert.equal(result.approved_features.includes(feature), false);
  }
});

test('feature packs require approved requirements or an explicit approved profile', async () => {
  const { resolveNextjsExecution } = await importRepoModule(
    '_refs/nextjs/execution-contract.mjs',
  );
  const base = {
    project_profile: 'nextjs-build-website',
    execution_profile: 'developer',
    website_profile: 'basic',
    explicit_profile_approval: true,
    scope: 'site',
    site: { repository_id: 'github.com/acme/site' },
    execution_host_repository_id: 'github.com/acme/site',
  };
  const blocked = resolveNextjsExecution({
    ...base,
    requested_features: ['contact-form'],
  });
  assert.equal(blocked.status, 'blocked');
  assert.match(blocked.blockers.join(' '), /approved scope/iu);

  const approved = resolveNextjsExecution({
    ...base,
    requested_features: ['contact-form'],
    approved_requirement_features: ['contact-form'],
  });
  assert.equal(approved.status, 'resolved');
  assert.deepEqual(approved.approved_features, ['contact-form']);
});

test('Next.js module artifacts route to module owner and never default to portal', async () => {
  const { resolveNextjsExecution } = await importRepoModule(
    '_refs/nextjs/execution-contract.mjs',
  );
  const base = {
    project_profile: 'nextjs-build-website',
    execution_profile: 'developer',
    website_profile: 'basic',
    explicit_profile_approval: true,
    scope: 'module',
    execution_host_repository_id: 'github.com/acme/portal',
    portal: { repository_id: 'github.com/acme/portal' },
    topology: {
      modules: [
        {
          module_id: 'catalog-site',
          repository_id: 'github.com/acme/catalog-site',
          role: 'module',
          available: true,
          writable: true,
        },
      ],
    },
  };
  const resolved = resolveNextjsExecution({
    ...base,
    requested_module: 'catalog-site',
    requested_features: ['pages'],
  });
  assert.equal(resolved.owner_repository_id, 'github.com/acme/catalog-site');
  assert.notEqual(resolved.owner_repository_id, resolved.execution_host_repository_id);

  const missing = resolveNextjsExecution({
    ...base,
    requested_module: 'missing',
    requested_features: ['pages'],
  });
  assert.equal(missing.status, 'blocked');
  assert.equal(missing.owner_repository_id, null);
  assert.match(missing.blockers.join(' '), /portal fallback is forbidden/iu);
});

test('Next.js skill dispatches only approved features and executable references validate', async () => {
  const skill = await readFile(
    path.join(repoRoot, 'skills/tracks/nextjs/sdcorejs-nextjs.md'),
    'utf8',
  );
  assert.match(skill, /approved feature set|approved_features/iu);
  assert.match(skill, /basic.*(?:does not|never).*(?:i18n|contact)/isu);
  assert.doesNotMatch(skill, /Skip `i18n\.md` even for single-language sites/iu);
  assert.doesNotMatch(skill, /Treating `contact-form\.md` as optional/iu);
  const { validateNextjsExecutableReferences } = await importRepoModule(
    'scripts/check-executable-references.mjs',
  );
  assert.deepEqual(await validateNextjsExecutableReferences(), []);
});
