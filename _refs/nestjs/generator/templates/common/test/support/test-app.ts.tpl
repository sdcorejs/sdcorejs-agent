import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { APP_ENV, AppEnv } from '../../src/config/env';
import { RequestActor } from '../../src/auth/request-actor';
import { createOidcFixture, OidcFixture } from './oidc-fixture';

export interface TestAppContext {
  app: INestApplication;
  actor: RequestActor;
  token: string;
  oidc: OidcFixture;
  close(): Promise<void>;
}

function testEnv(oidc: OidcFixture): AppEnv {
  return {
    nodeEnv: 'test',
    port: 3000,
    corsOrigins: ['http://localhost:4200'],
    corsCredentials: true,
    globalBodyLimit: '1mb',
    oidcIssuer: oidc.issuer,
    oidcAudience: [oidc.audience],
    oidcJwksUri: oidc.jwksUri,
    oidcAllowedAlgorithms: ['RS256'],
    oidcPermissionsClaim: 'permissions',
    oidcTenantClaim: 'tenant_code',
    oidcDepartmentClaim: 'department_code',
    oidcClockToleranceSeconds: 0,
    oidcMaxTokenAge: '15m',
    oidcJwksCooldownMs: 0,
  };
}

export async function createTestApp(
  suppliedActor?: RequestActor,
): Promise<TestAppContext> {
  const actor = suppliedActor ?? {
    verified: true,
    id: 'actor-1',
    permissions: ['items:read'],
{{#ENTERPRISE}}    tenantCode: 'tenant-a',
{{/ENTERPRISE}}
  };
  const oidc = await createOidcFixture();
  const builder = Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(APP_ENV)
    .useValue(testEnv(oidc));
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return {
    app,
    actor,
    token: await oidc.issue(actor),
    oidc,
    async close() {
      await app.close();
      await oidc.close();
    },
  };
}
