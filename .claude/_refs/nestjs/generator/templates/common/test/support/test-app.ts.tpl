import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { TOKEN_VERIFIER } from '../../src/auth/authentication';
import { RequestActor } from '../../src/auth/request-actor';

export async function createTestApp(actor?: RequestActor): Promise<INestApplication> {
  const builder = Test.createTestingModule({ imports: [AppModule] });
  if (actor) {
    builder.overrideProvider(TOKEN_VERIFIER).useValue({
      async verify(token: string) {
        if (token !== 'test-token') throw new Error('invalid token');
        return actor;
      },
    });
  }
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}
