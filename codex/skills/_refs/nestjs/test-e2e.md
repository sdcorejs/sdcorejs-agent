# Test Knowledge — E2E (NestJS)

> Track+level patterns loaded on demand by `sdcorejs-test` when the project is a
> NestJS backend (`nest-cli.json` + `@nestjs/*`) and the detected level is e2e,
> AFTER the cross-track principles in `_refs/shared/testing-philosophy.md`. Not a
> dispatchable skill — no frontmatter. Orchestrator owns dispatch + run/report.

## Purpose
NestJS e2e tests boot the full application + a real PostgreSQL instance and exercise endpoints end-to-end via `supertest`. Catches wiring bugs that unit + integration tests miss: middleware order, global pipes, transaction rollback, real SQL behaviour, real Zod validation.

Read `_refs/shared/testing-philosophy.md` first.

## What ships

| File | Purpose |
|---|---|
| `test/setup-e2e.ts` | Bootstrap a `testcontainers` PG instance OR `pg-mem` for the suite |
| `test/jest-e2e.config.js` | Separate config (slower, real DB) — distinct from unit config |
| `test/<entity>.e2e-spec.ts` | One file per entity / feature |
| `test/auth-fixture.ts` | Reusable token issuer for tests |

## Workflow

### Step 1 — DB strategy

**Recommended**: `testcontainers` + real Postgres in a container. Slower start (~5s) but production-grade behaviour, real SQL, real transactions, real index usage.

**Faster alternative**: `pg-mem` (in-memory PG-compatible engine). Almost instant, ~95% SQL compat. Use for early-stage projects; switch to testcontainers when CI is set up.

```bash
npm install -D @testcontainers/postgresql supertest @types/supertest
# OR
npm install -D pg-mem
```

`test/setup-e2e.ts` (testcontainers):
```typescript
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DataSource } from 'typeorm';
import { runSeed } from '../src/seed/run-seed';

let container: StartedPostgreSqlContainer;
let dataSource: DataSource;

export async function setupTestDb(): Promise<{ dataSource: DataSource; url: string }> {
  container = await new PostgreSqlContainer('postgres:16-alpine').start();
  const url = container.getConnectionUri();

  dataSource = new DataSource({
    type: 'postgres',
    url,
    entities: ['src/**/*.entity.ts'],
    synchronize: true, // OK for tests; never in prod
    logging: false,
  });
  await dataSource.initialize();
  await runSeed(dataSource); // seed reference data the tests assume

  return { dataSource, url };
}

export async function tearDownTestDb() {
  await dataSource?.destroy();
  await container?.stop();
}
```

### Step 2 — App boot + supertest

```typescript
// test/product.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupTestDb, tearDownTestDb } from './setup-e2e';
import { issueTestToken } from './auth-fixture';

describe('Product (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    await setupTestDb();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Override DB config to point at the testcontainers URL
      .overrideProvider('DATABASE_URL')
      .useValue(process.env.TEST_DATABASE_URL)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    token = issueTestToken({ userId: 'u1', permissions: ['PRODUCT_CREATE', 'PRODUCT_LIST'] });
  });

  afterAll(async () => {
    await app.close();
    await tearDownTestDb();
  });

  describe('POST /api/product', () => {
    it('creates product when valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/product')
        .set('Authorization', `Bearer ${token}`)
        .send({
          code: 'P001',
          name: 'Sản phẩm A',
          unitPrice: 100000,
        })
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        code: 'P001',
        name: 'Sản phẩm A',
      });
    });

    it('returns 422 with bilingual error when missing required field', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/product')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: 'P002' })  // missing name
        .expect(422);

      expect(res.body).toMatchObject({
        statusCode: 422,
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: ['name'],
            message: expect.objectContaining({
              vi: expect.stringContaining('bắt buộc'),
              en: expect.stringContaining('required'),
            }),
          }),
        ]),
      });
    });

    it('returns 403 when user lacks PRODUCT_CREATE', async () => {
      const limitedToken = issueTestToken({ userId: 'u2', permissions: ['PRODUCT_LIST'] });
      await request(app.getHttpServer())
        .post('/api/product')
        .set('Authorization', `Bearer ${limitedToken}`)
        .send({ code: 'P003', name: 'X', unitPrice: 1 })
        .expect(403);
    });

    it('returns 409 on duplicate code', async () => {
      const body = { code: 'P099', name: 'X', unitPrice: 1 };
      await request(app.getHttpServer())
        .post('/api/product')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/product')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
        .expect(409);
    });
  });

  describe('Transaction rollback', () => {
    it('rolls back when a step fails', async () => {
      // Setup: trigger an endpoint that does 2 writes + 1 failing call
      const before = await request(app.getHttpServer())
        .get('/api/product/search')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      const initialCount = before.body.total;

      await request(app.getHttpServer())
        .post('/api/product/bulk-create-with-error')
        .set('Authorization', `Bearer ${token}`)
        .send([{ code: 'X1', name: 'X', unitPrice: 1 }, { code: 'X1', name: 'Y', unitPrice: 1 }]) // duplicate forces fail
        .expect(409);

      const after = await request(app.getHttpServer())
        .get('/api/product/search')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(after.body.total).toBe(initialCount); // ROLLED BACK
    });
  });
});
```

### Step 3 — Auth fixture

```typescript
// test/auth-fixture.ts
import * as jwt from 'jsonwebtoken';

export function issueTestToken(payload: { userId: string; permissions: string[] }): string {
  return jwt.sign(
    { sub: payload.userId, permissions: payload.permissions },
    process.env.TEST_JWT_SECRET ?? 'test-secret',
    { expiresIn: '1h' },
  );
}
```

The test JWT secret matches the test app's secret (overridden in module config).

### Step 4 — Run

```bash
# package.json scripts:
# "test:e2e": "jest --config test/jest-e2e.config.js --runInBand"

npm run test:e2e
```

`--runInBand` because testcontainers + shared DB state don't parallelize well. Trade speed for reliability.

Target: full e2e suite < 5 min for a medium-sized NestJS API (50-100 endpoints).

## Rules

### MUST DO
- Inherit principles from `_refs/shared/testing-philosophy.md`
- Test 401 / 403 / 422 / 409 paths for every POST/PUT/DELETE endpoint
- Use a real DB (testcontainers preferred, pg-mem acceptable) — NOT mocked repos
- Test the bilingual error message shape (`{ vi, en }` per the convention from `base/shared/`)
- Test transaction rollback for any endpoint that writes 2+ tables
- `--runInBand` to avoid DB state collisions; OR ship a per-test cleanup

### MUST NOT
- Skip the auth header — every endpoint test should pass through `AuthGuard`
- Use the dev / staging DB — only test containers + seed
- Hardcode user IDs / DB IDs — let the test create what it needs, derive IDs from the response
- Mock the DB in e2e — that's integration tests
- Leak between tests (one test inserts, another reads + asserts count) — use unique data per test OR truncate between

## Anti-patterns

- **`afterEach` truncating all tables** — slow + masks foreign key issues; instead use unique data per test (e.g. timestamps in `code`)
- **No teardown of testcontainers** — container leaks → CI runner OOM
- **`Promise.all` over multiple `request(...)` calls** — race conditions; sequence them
- **One mega-test covering 12 scenarios** — split per scenario; one fail tells you exactly what broke
- **Skipping 422 path tests** because "Zod validates it" — Zod might not be wired correctly; the e2e proves it is

## Cross-references
- Principles: `_refs/shared/testing-philosophy.md`
- Integration: `_refs/nestjs/test-integration.md` (lighter weight)
- Unit: `_refs/nestjs/test-unit.md`
- Convention referenced: bilingual error messages from `base/shared/` (TBD when nestjs track is built)
- Verification: `sdcorejs-ship (verify-before-done mode)`
