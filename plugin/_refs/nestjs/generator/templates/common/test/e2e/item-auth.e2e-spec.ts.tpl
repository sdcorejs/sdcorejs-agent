import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { createTestApp } from '../support/test-app';

test('protected route rejects a missing authenticated actor', async () => {
  const context = await createTestApp();
  try {
    const response = await request(context.app.getHttpServer()).get('/items');
    assert.equal(response.status, 401);
    assert.equal(response.body.code, 'access.unauthorized');
    assert.equal(typeof response.body.message, 'string');
    assert.equal('stack' in response.body, false);
  } finally {
    await context.close();
  }
});

test('production OIDC verifier accepts a signed actor with explicit permission', async () => {
  const context = await createTestApp({
    verified: true,
    id: 'actor-1',
    permissions: ['items:read'],
{{#ENTERPRISE}}    tenantCode: 'tenant-a',
{{/ENTERPRISE}}  });
  try {
    const response = await request(context.app.getHttpServer())
      .get('/items')
      .set('Authorization', `Bearer ${context.token}`);
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, []);
  } finally {
    await context.close();
  }
});

test('production verifier rejects wrong signature, issuer, audience, expiry, nbf, algorithm, and kid', async () => {
  const context = await createTestApp();
  try {
    const now = Math.floor(Date.now() / 1000);
    const invalidTokens = [
      ['wrong signature', await context.oidc.issueWrongSignature(context.actor)],
      ['wrong issuer', await context.oidc.issue(context.actor, { issuer: 'https://issuer.invalid' })],
      ['wrong audience', await context.oidc.issue(context.actor, { audience: 'other-api' })],
      ['expired token', await context.oidc.issue(context.actor, { issuedAt: now - 600, expiresAt: now - 1 })],
      ['not-yet-valid token', await context.oidc.issue(context.actor, { notBefore: now + 60 })],
      ['unsupported algorithm', await context.oidc.issueUnsupportedAlgorithm(context.actor)],
      ['unknown kid', await context.oidc.issueUnknownKid(context.actor)],
    ] as const;
    for (const [scenario, token] of invalidTokens) {
      const response = await request(context.app.getHttpServer())
        .get('/items')
        .set('Authorization', `Bearer ${token}`);
      assert.equal(response.status, 401, scenario);
      assert.equal(response.body.code, 'access.unauthorized', scenario);
    }
  } finally {
    await context.close();
  }
});

test('remote JWKS verifier accepts key rotation after a verified request', async () => {
  const context = await createTestApp();
  try {
    const before = await request(context.app.getHttpServer())
      .get('/items')
      .set('Authorization', `Bearer ${context.token}`);
    assert.equal(before.status, 200);

    await context.oidc.rotate();
    const rotatedToken = await context.oidc.issue(context.actor);
    const after = await request(context.app.getHttpServer())
      .get('/items')
      .set('Authorization', `Bearer ${rotatedToken}`);
    assert.equal(after.status, 200, 'key rotation');
  } finally {
    await context.close();
  }
});
