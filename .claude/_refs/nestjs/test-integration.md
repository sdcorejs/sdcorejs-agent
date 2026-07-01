# Test Knowledge — Integration (NestJS)

> Track+level patterns loaded on demand by `sdcorejs-test` when the project is a
> NestJS backend (`nest-cli.json` + `@nestjs/*`) and the detected level is
> integration, AFTER the cross-track principles in
> `_refs/shared/testing-philosophy.md`. Not a dispatchable skill — no frontmatter.
> Orchestrator owns dispatch + run/report.

## Purpose
Integration tests cover service + repository + real DB queries WITHOUT the HTTP layer. Faster than e2e, broader than unit. Best for testing transaction semantics, query correctness, and business logic that touches the DB.

Read `_refs/shared/testing-philosophy.md` first.

## What ships

| File | Purpose |
|---|---|
| `src/<module>/<entity>/<entity>.service.spec.ts` | Co-located integration spec |
| `test/setup-integration.ts` | pg-mem bootstrap (lighter than testcontainers) |

## Workflow

### Step 1 — `pg-mem` setup (fast in-memory PG)

```typescript
// test/setup-integration.ts
import { newDb, IMemoryDb } from 'pg-mem';
import { DataSource } from 'typeorm';

export async function createTestDataSource(entities: any[]): Promise<{ ds: DataSource; db: IMemoryDb }> {
  const db = newDb({
    autoCreateForeignKeyIndices: true,
    noErrorOnSelectFromUndefined: false,
  });

  // pg-mem stubs for unsupported types
  db.public.registerFunction({
    implementation: () => 'test',
    name: 'current_database',
  });

  const ds = await db.adapters.createTypeormDataSource({
    type: 'postgres',
    entities,
    synchronize: true,
    logging: false,
  });

  await ds.initialize();
  return { ds, db };
}
```

### Step 2 — Service + repo integration test

```typescript
// src/product/product.service.spec.ts
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { Product } from './product.entity';
import { Category } from '../category/category.entity';
import { createTestDataSource } from '../../test/setup-integration';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('<localized text>', () => {
  let ds: DataSource;
  let service: ProductService;

  beforeEach(async () => {
    ({ ds } = await createTestDataSource([Product, Category]));

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductService,
        ProductRepository,
        { provide: DataSource, useValue: ds },
      ],
    }).compile();

    service = moduleRef.get(ProductService);

    // Seed reference data
    await ds.getRepository(Category).save([
      { id: 'c1', code: 'CEMENT', name: '<localized text>' },
      { id: 'c2', code: 'STEEL', name: '<localized text>' },
    ]);
  });

  afterEach(async () => {
    await ds.destroy();
  });

  describe('create', () => {
    it('persists product with category', async () => {
      const result = await service.create({
        code: 'P001',
        name: '<localized text>',
        categoryId: 'c1',
        unitPrice: 100000,
      });

      expect(result.id).toBeTruthy();

      // Verify it's actually in the DB
      const found = await ds.getRepository(Product).findOne({
        where: { id: result.id },
        relations: ['category'],
      });
      expect(found?.category.code).toBe('CEMENT');
    });

    it('throws ConflictException on duplicate code', async () => {
      await service.create({ code: 'P002', name: 'X', categoryId: 'c1', unitPrice: 1 });
      await expect(
        service.create({ code: 'P002', name: 'Y', categoryId: 'c1', unitPrice: 2 }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws when category not found', async () => {
      await expect(
        service.create({ code: 'P003', name: 'X', categoryId: 'nonexistent', unitPrice: 1 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    beforeEach(async () => {
      await ds.getRepository(Product).save([
        { code: 'P010', name: '<localized text>', categoryId: 'c1', unitPrice: 100000 },
        { code: 'P011', name: '<localized text>', categoryId: 'c1', unitPrice: 110000 },
        { code: 'P020', name: '<localized text>', categoryId: 'c2', unitPrice: 50000 },
      ]);
    });

    it('returns paged results filtered by keyword', async () => {
      const result = await service.search({ keyword: '<localized text>', page: 1, pageSize: 10 });
      expect(result.total).toBe(2);
      expect(result.data.every((p) => p.name.toLowerCase().includes('xi'))).toBe(true);
    });

    it('returns paged results filtered by category', async () => {
      const result = await service.search({ categoryId: 'c2' });
      expect(result.total).toBe(1);
      expect(result.data[0].code).toBe('P020');
    });

    it('honors pagination', async () => {
      const result = await service.search({ page: 1, pageSize: 2 });
      expect(result.data.length).toBe(2);
      expect(result.total).toBe(3);
    });
  });

  describe('transactional bulk-update', () => {
    it('rolls back on mid-stream failure', async () => {
      await ds.getRepository(Product).save([
        { code: 'B1', name: 'X', categoryId: 'c1', unitPrice: 100 },
        { code: 'B2', name: 'Y', categoryId: 'c1', unitPrice: 200 },
      ]);

      await expect(
        service.bulkUpdatePrice([
          { code: 'B1', price: 150 },
          { code: 'NONEXISTENT', price: 999 }, // will throw mid-transaction
        ]),
      ).rejects.toThrow(NotFoundException);

      // Verify B1 was rolled back to 100, not 150
      const b1 = await ds.getRepository(Product).findOneBy({ code: 'B1' });
      expect(b1?.unitPrice).toBe(100);
    });
  });
});
```

### Step 3 — Mock external services

For services that call external APIs (email, payment, third-party data), mock at the integration boundary, not at the HTTP-client level:

```typescript
import { EmailService } from '@/shared/email/email.service';

beforeEach(async () => {
  const moduleRef = await Test.createTestingModule({
    providers: [
      ProductService,
      ProductRepository,
      { provide: DataSource, useValue: ds },
      {
        provide: EmailService,
        useValue: { sendOrderConfirmation: jest.fn().mockResolvedValue(undefined) },
      },
    ],
  }).compile();
});
```

### Step 4 — Test guards / interceptors in isolation

```typescript
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard } from './auth.guard';

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionGuard(reflector);
  });

  function mockContext(user: any, requiredPerms: string[] = []): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
      getHandler: () => null,
      getClass: () => null,
    } as any;
  }

  it('allows when user has permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['PRODUCT_CREATE']);
    expect(guard.canActivate(mockContext({ permissions: ['PRODUCT_CREATE'] }))).toBe(true);
  });

  it('denies when user lacks permission', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['PRODUCT_CREATE']);
    expect(guard.canActivate(mockContext({ permissions: ['PRODUCT_LIST'] }))).toBe(false);
  });
});
```

## Run

```bash
npm run test -- --watch=false --testPathPattern='\.service\.spec\.ts$'
```

Coverage target: ≥ 80% line on `services/` + `repositories/` + `guards/`.

## Rules

### MUST DO
- Inherit principles from `_refs/shared/testing-philosophy.md`
- Use real DB (pg-mem for integration, testcontainers for e2e) — NEVER mock the repository
- Test BOTH happy path AND error paths (Conflict, NotFound, Validation, Permission)
- Test transaction rollback whenever a method does 2+ writes
- Seed minimal reference data per test (categories, lookup tables) in `beforeEach`
- Tear down DB in `afterEach` — no leakage

### MUST NOT
- Mock `ProductRepository` in `ProductService.spec.ts` — that's unit-test territory; integration uses real repo
- Skip transaction rollback tests for multi-step services
- Share DB instance across `describe` blocks without cleanup
- Use `synchronize: false` in tests — synchronize is fine because the schema is rebuilt per test

## Anti-patterns

- **Spy on the SQL** — tests SQL strings, breaks on harmless changes; assert on observable behaviour (rows in DB)
- **Hardcoded UUIDs** — generate them or assert on shape (`expect.any(String)`)
- **One huge `beforeAll` seeding 100 rows** — slow + couples unrelated tests; seed per test what each needs
- **Testing repository methods directly** — repository is a thin wrapper over TypeORM; test the service that uses it
- **`expect(repo.save).toHaveBeenCalled()`** — implementation coupling; assert on DB state instead

## Cross-references
- Principles: `_refs/shared/testing-philosophy.md`
- E2E (with HTTP): `_refs/nestjs/test-e2e.md`
- Unit (mocked repos, no DB): `_refs/nestjs/test-unit.md`
- Verification: `sdcorejs-ship (verify-before-done mode)`
