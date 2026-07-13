import assert from 'node:assert/strict';
import test from 'node:test';
import { exists, readRepoFile } from './support/nestjs-pack-validator.mjs';

test('generated controller contract requires explicit route auth and fail-closed metadata', async () => {
  const entityPack = await readRepoFile('_refs/nestjs/write-code/init-entity.md');
  assert.match(entityPack, /explicit(?:ly)? enumerate every route/iu);
  assert.match(entityPack, /missing permission metadata.{0,80}fail(?:s)? closed/isu);
  assert.doesNotMatch(entityPack, /extends\s+BaseController/u);
});

test('generated auth boundary verifies bearer tokens before policy evaluation', async () => {
  const authentication = await readRepoFile('_refs/nestjs/generator/templates/common/src/auth/authentication.ts.tpl');
  const actor = await readRepoFile('_refs/nestjs/generator/templates/common/src/auth/request-actor.ts.tpl');
  const policy = await readRepoFile('_refs/nestjs/generator/templates/common/src/auth/policy.ts.tpl');
  assert.match(authentication, /TOKEN_VERIFIER/u);
  assert.match(authentication, /authorization/iu);
  assert.match(actor, /verified:\s*true/u);
  assert.match(actor, /permissions\.every/u);
  assert.match(policy, /UseGuards\(AuthenticationGuard, PolicyGuard\)/u);
});

test('route audit derives real controller metadata', async () => {
  const audit = await readRepoFile('_refs/nestjs/generator/templates/enterprise/src/items/item-route-audit.ts.tpl');
  const auditTest = await readRepoFile('_refs/nestjs/generator/templates/common/test/integration/item-route-audit.spec.ts.tpl');
  assert.match(audit, /Reflect\.getMetadata/u);
  assert.match(audit, /ItemController\.prototype/u);
  assert.match(auditTest, /auditItemControllerRoutes/u);
});

test('enterprise contract denies cross-tenant access before actor or ownership checks', async () => {
  const architecture = await readRepoFile('_refs/nestjs/architecture-principles.md');
  const actions = await readRepoFile('_refs/nestjs/write-code/actions.md');
  assert.match(`${architecture}\n${actions}`, /cross-tenant denial.{0,120}before.{0,120}(?:ownership|role|actor)/isu);
  assert.match(`${architecture}\n${actions}`, /search.{0,80}detail.{0,80}mutation.{0,80}export.{0,80}report/isu);
});

test('mutation policy uses authenticated actor and ignores DTO capability flags', async () => {
  const actions = await readRepoFile('_refs/nestjs/write-code/actions.md');
  assert.match(actions, /authenticated actor/iu);
  assert.match(actions, /capability flags.{0,120}(?:presentation|not authoritative)/isu);
  assert.doesNotMatch(actions, /assigneeId\s*===\s*createdBy/u);
});

test('enterprise executable action templates preserve actor and scope invariants', async () => {
  const root = '_refs/nestjs/generator/templates/enterprise/src/items';
  for (const file of ['item-policy.ts.tpl', 'item-workflow.ts.tpl', 'item-import.ts.tpl', 'item-export.ts.tpl']) {
    assert.equal(await exists(`${root}/${file}`), true, `missing ${file}`);
  }
  const policy = await readRepoFile(`${root}/item-policy.ts.tpl`);
  const workflow = await readRepoFile(`${root}/item-workflow.ts.tpl`);
  const controller = await readRepoFile(`${root}/item.controller.ts.tpl`);
  const bulkImport = await readRepoFile(`${root}/item-import.ts.tpl`);
  const importStore = await readRepoFile(`${root}/item-import-store.ts.tpl`);
  const exportSource = await readRepoFile(`${root}/item-export.ts.tpl`);
  assert.match(policy, /tenantCode.{0,100}(?:forbidden|deny)/isu);
  assert.match(policy, /actor\.id/iu);
  assert.match(policy, /departmentCode/iu);
  assert.match(workflow, /expectedVersion/iu);
  assert.match(workflow, /compareAndSwap/iu);
  assert.match(workflow, /Scope/iu);
  assert.match(controller, /@Put\(':id\/approve'\)/u);
  assert.match(controller, /@Post\('import'\)/u);
  assert.match(controller, /@Get\('export'\)/u);
  assert.match(bulkImport, /maxRows/iu);
  assert.match(bulkImport, /maxBytes/iu);
  assert.match(bulkImport, /sanitize/iu);
  assert.match(bulkImport, /idempotencyKey/iu);
  assert.match(bulkImport, /tenantCode/iu);
  assert.match(bulkImport, /requestDigest/iu);
  assert.match(importStore, /FileImportOperationStore/u);
  assert.match(importStore, /open\(lockPath, 'wx'/u);
  assert.match(importStore, /idempotency-conflict/u);
  assert.match(exportSource, /AsyncGenerator|async\s+\*/iu);
  assert.match(exportSource, /maxRows/iu);
  const tenantTest = await readRepoFile('_refs/nestjs/generator/templates/enterprise/test/tenant-isolation.spec.ts.tpl');
  assert.match(tenantTest, /update[\s\S]*transitionItem[\s\S]*streamItems[\s\S]*existsByName[\s\S]*claimBackground/iu);
});
