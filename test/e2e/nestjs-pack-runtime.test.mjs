import assert from 'node:assert/strict';
import test from 'node:test';
import { exists, readRepoFile } from './support/nestjs-pack-validator.mjs';

test('production runtime contract is strict and bounded', async () => {
  const projectPack = await readRepoFile('_refs/nestjs/write-code/init-project.md');
  assert.match(projectPack, /credential(?:ed|s).{0,120}(?:wildcard|\*)/isu);
  assert.match(projectPack, /credentials:\s*true.{0,80}reject/isu);
  assert.match(projectPack, /global body.{0,80}(?:limit|bound)/isu);
  assert.match(projectPack, /production.{0,120}(?:must not|no).{0,80}(?:CREATE SCHEMA|schema DDL)/isu);
  assert.match(projectPack, /startup.{0,80}(?:validate|validation).{0,80}environment/isu);
});

test('admin and Keycloak contract has no privileged bootstrap and isolates secrets', async () => {
  const adminPack = await readRepoFile('_refs/nestjs/write-code/init-admin.md');
  assert.match(adminPack, /normal startup.{0,80}no.{0,80}privileged/isu);
  assert.match(adminPack, /internal client UUID/iu);
  assert.match(adminPack, /secret provider/iu);
  assert.match(adminPack, /idempotenc.{0,160}reconciliation/isu);
});

test('workflow, import, and export contracts are concurrency and resource safe', async () => {
  const actions = await readRepoFile('_refs/nestjs/write-code/actions.md');
  const importTemplate = await readRepoFile('_refs/nestjs/generator/templates/enterprise/src/items/item-import.ts.tpl');
  assert.match(actions, /optimistic version|row lock/iu);
  assert.match(actions, /import.{0,100}bounded.{0,100}saniti[sz]ed.{0,100}idempotent/isu);
  assert.match(actions, /export.{0,180}(?:row bound|bounded).{0,180}(?:stream|asynchronous)/isu);
  assert.doesNotMatch(actions, /writeBuffer\(\)/u);
  assert.match(importTemplate, /ImportOperationStore/iu);
  assert.match(importTemplate, /store\.executeOnce/iu);
  assert.match(importTemplate, /requestDigest/iu);
});

test('executable admin templates encode typed permissions and scoped role uniqueness', async () => {
  const permissionPath = '_refs/nestjs/generator/templates/common/src/admin/permission-manifest.ts.tpl';
  const rolePath = '_refs/nestjs/generator/templates/common/src/admin/role-scope.ts.tpl';
  assert.equal(await exists(permissionPath), true, 'missing permission manifest template');
  assert.equal(await exists(rolePath), true, 'missing role scope template');
  const permission = await readRepoFile(permissionPath);
  const role = await readRepoFile(rolePath);
  assert.match(permission, /stale/iu);
  assert.match(permission, /satisfies\s+readonly/iu);
  assert.match(role, /global.{0,120}tenant.{0,120}department/isu);
});

test('executable Keycloak templates resolve UUIDs, isolate secrets, and reconcile outcomes', async () => {
  const root = '_refs/nestjs/generator/templates/common/src/keycloak';
  for (const file of ['admin-client.ts.tpl', 'secret-provider.ts.tpl', 'operation-state.ts.tpl', 'reconciler.ts.tpl']) {
    assert.equal(await exists(`${root}/${file}`), true, `missing ${file}`);
  }
  const admin = await readRepoFile(`${root}/admin-client.ts.tpl`);
  const secret = await readRepoFile(`${root}/secret-provider.ts.tpl`);
  const state = await readRepoFile(`${root}/operation-state.ts.tpl`);
  const reconciler = await readRepoFile(`${root}/reconciler.ts.tpl`);
  assert.match(admin, /internalClientUuid/iu);
  assert.match(admin, /createClient/iu);
  assert.match(admin, /ensureClient/iu);
  assert.match(secret, /SecretProvider/u);
  assert.doesNotMatch(secret, /console\.|publicDto/iu);
  assert.match(state, /PENDING.{0,120}AMBIGUOUS.{0,120}COMPENSATED/isu);
  assert.match(reconciler, /idempotencyKey/iu);
});
