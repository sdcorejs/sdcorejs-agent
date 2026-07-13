import assert from 'node:assert/strict';
import test from 'node:test';
import { loadEnv } from '../src/config/env';

test('production configuration rejects wildcard credentialed CORS and missing database', () => {
  assert.throws(() => loadEnv({
    NODE_ENV: 'production',
    CORS_CREDENTIALS: 'true',
    CORS_ORIGINS: '*',
  }), /CORS_ORIGINS|DATABASE_URL/u);
  assert.throws(() => loadEnv({ NODE_ENV: 'production', DATABASE_URL: 'postgresql://example' }), /CORS_ORIGINS/u);
  assert.throws(() => loadEnv({ GLOBAL_BODY_LIMIT: '999999mb' }), /GLOBAL_BODY_LIMIT/u);
});
