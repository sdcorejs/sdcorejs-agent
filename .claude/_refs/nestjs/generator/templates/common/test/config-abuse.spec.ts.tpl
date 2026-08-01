import assert from 'node:assert/strict';
import test from 'node:test';
import { loadEnv } from '../src/config/env';

const validProductionEnv = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://example',
  CORS_ORIGINS: 'https://portal.example',
  OIDC_ISSUER: 'https://identity.example/realms/app',
  OIDC_AUDIENCE: 'sdcorejs-api',
  OIDC_JWKS_URI: 'https://identity.example/realms/app/protocol/openid-connect/certs',
  OIDC_ALLOWED_ALGORITHMS: 'RS256',
};

test('production configuration rejects unsafe CORS, missing OIDC, and symmetric algorithms', () => {
  assert.throws(() => loadEnv({
    ...validProductionEnv,
    CORS_CREDENTIALS: 'true',
    CORS_ORIGINS: '*',
  }), /CORS_ORIGINS/u);
  assert.throws(() => loadEnv({
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://example',
    CORS_ORIGINS: 'https://portal.example',
  }), /OIDC_ISSUER|OIDC_AUDIENCE|OIDC_JWKS_URI/u);
  assert.throws(() => loadEnv({
    ...validProductionEnv,
    OIDC_ALLOWED_ALGORITHMS: 'HS256',
  }), /OIDC_ALLOWED_ALGORITHMS/u);
  assert.throws(() => loadEnv({
    ...validProductionEnv,
    OIDC_ISSUER: 'http://identity.example',
  }), /OIDC_HTTPS/u);
  assert.throws(() => loadEnv({
    ...validProductionEnv,
    GLOBAL_BODY_LIMIT: '999999mb',
  }), /GLOBAL_BODY_LIMIT/u);
});

test('valid production OIDC configuration is normalized', () => {
  const env = loadEnv(validProductionEnv);
  assert.deepEqual(env.oidcAudience, ['sdcorejs-api']);
  assert.deepEqual(env.oidcAllowedAlgorithms, ['RS256']);
  assert.equal(env.oidcPermissionsClaim, 'permissions');
});
