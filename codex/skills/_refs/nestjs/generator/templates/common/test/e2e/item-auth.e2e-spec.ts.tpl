import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { createTestApp } from '../support/test-app';

test('protected route rejects a missing authenticated actor', async () => {
  const app = await createTestApp();
  try {
    const response = await request(app.getHttpServer()).get('/items');
    assert.equal(response.status, 401);
    assert.equal(response.body.code, 'access.unauthorized');
    assert.equal(typeof response.body.message, 'string');
    assert.equal('stack' in response.body, false);
  } finally {
    await app.close();
  }
});

test('protected route accepts an actor with explicit permission', async () => {
  const app = await createTestApp({
    verified: true,
    id: 'actor-1',
    permissions: ['items:read'],
{{#ENTERPRISE}}    tenantCode: 'tenant-a',
{{/ENTERPRISE}}  });
  try {
    const response = await request(app.getHttpServer()).get('/items').set('Authorization', 'Bearer test-token');
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, []);
  } finally {
    await app.close();
  }
});

test('invalid bearer token is rejected before authorization', async () => {
  const app = await createTestApp({ verified: true, id: 'actor-1', permissions: ['items:read'] });
  try {
    const response = await request(app.getHttpServer()).get('/items').set('Authorization', 'Bearer forged-token');
    assert.equal(response.status, 401);
    assert.equal(response.body.code, 'access.unauthorized');
  } finally {
    await app.close();
  }
});
