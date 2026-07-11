import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { createTestApp } from '../support/test-app';

test('body and route parameters validate before item execution', async () => {
  const app = await createTestApp({
    verified: true,
    id: 'actor-1',
    permissions: ['items:read', 'items:write', 'items:approve', 'items:import', 'items:export'],
{{#ENTERPRISE}}    tenantCode: 'tenant-a',
{{/ENTERPRISE}}  });
  try {
    const api = request(app.getHttpServer());
    const invalidBody = await api.post('/items').set('Authorization', 'Bearer test-token').send({ name: 'Item', tenantCode: 'forged' });
    assert.equal(invalidBody.status, 400);
    const invalidId = await api.get('/items/not-a-uuid').set('Authorization', 'Bearer test-token');
    assert.equal(invalidId.status, 400);
    const missing = await api.get('/items/00000000-0000-4000-8000-000000000000').set('Authorization', 'Bearer test-token');
    assert.equal(missing.status, 404);
    assert.equal(missing.body.code, 'item.not-found');
    assert.equal('stack' in missing.body, false);
{{#ENTERPRISE}}    const created = await api.post('/items').set('Authorization', 'Bearer test-token').send({ name: 'Action item' });
    assert.equal(created.status, 201);
    const approved = await api.put(`/items/${created.body.id}/approve`).set('Authorization', 'Bearer test-token').send({ expectedVersion: 1 });
    assert.equal(approved.status, 200);
    assert.equal(approved.body.version, 2);
    const imported = await api.post('/items/import').set('Authorization', 'Bearer test-token').send({ idempotencyKey: 'import-key-1', rows: [{ name: '=Formula' }] });
    assert.equal(imported.status, 201);
    assert.equal(imported.body[0].name, "'=Formula");
    const exported = await api.get('/items/export').set('Authorization', 'Bearer test-token');
    assert.equal(exported.status, 200);
    assert.match(exported.text, /Approved/u);
{{/ENTERPRISE}}
  } finally {
    await app.close();
  }
});
