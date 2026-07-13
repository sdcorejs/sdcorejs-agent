import assert from 'node:assert/strict';
import test from 'node:test';
import { KeycloakAdminClient } from '../src/keycloak/admin-client';
import { KeycloakReconciler } from '../src/keycloak/reconciler';
import { OperationState } from '../src/keycloak/operation-state';

test('Keycloak admin calls use the resolved internal UUID', async () => {
  let rotated: string | undefined;
  const client = new KeycloakAdminClient({
    async findClients() { return [{ id: 'internal-uuid', clientId: 'portal' }]; },
    async createClient(clientId) { return { id: 'created-uuid', clientId }; },
    async rotateSecret(id) { rotated = id; },
  });
  await client.rotateClientSecret('portal');
  assert.equal(rotated, 'internal-uuid');
});

test('missing Keycloak client is provisioned once and returns its internal UUID', async () => {
  let creates = 0;
  const client = new KeycloakAdminClient({
    async findClients() { return []; },
    async createClient(clientId) { creates += 1; return { id: 'created-uuid', clientId }; },
    async rotateSecret() {},
  });
  assert.equal(await client.ensureClient('portal'), 'created-uuid');
  assert.equal(creates, 1);
});

test('ambiguous operation is persisted for reconciliation', async () => {
  let state: OperationState = {
    idempotencyKey: 'key-1',
    status: 'AMBIGUOUS',
    step: 'keycloak-user',
    updatedAt: new Date(0).toISOString(),
  };
  const reconciler = new KeycloakReconciler(
    { async find() { return state; }, async save(next) { state = next; } },
    { async inspect() { return 'confirmed'; } },
  );
  const result = await reconciler.reconcile('key-1');
  assert.equal(result.status, 'CONFIRMED');
});
