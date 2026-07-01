# Test Knowledge — Unit (NestJS)

> Track+level patterns loaded on demand by `sdcorejs-test` when the project is a
> NestJS backend (`nest-cli.json` + `@nestjs/*`) and the detected level is unit,
> AFTER the cross-track principles in `_refs/shared/testing-philosophy.md`. Not a
> dispatchable skill — no frontmatter. Orchestrator owns dispatch + run/report.

## Purpose
Unit tests cover the smallest meaningful piece — one service method with all collaborators (repository, other services) mocked. Many, fast, narrow. The foundation of the test pyramid.

Read `_refs/shared/testing-philosophy.md` first.

## Patterns

### Pattern 1 — Pure function / mapper

```typescript
import { mapEntityToDto } from './product.mapper';

describe('mapEntityToDto', () => {
  it('maps all required fields', () => {
    const entity = {
      id: '123',
      code: 'P001',
      name: '<localized text>',
      unitPrice: 100000,
      createdAt: new Date('2026-05-17T10:00:00Z'),
      category: { id: 'c1', name: '<localized text>' },
    } as any;

    expect(mapEntityToDto(entity)).toEqual({
      id: '123',
      code: 'P001',
      name: '<localized text>',
      unitPrice: 100000,
      categoryName: '<localized text>',
      createdAt: '2026-05-17T10:00:00.000Z',
    });
  });

  it('handles missing category', () => {
    expect(mapEntityToDto({ id: '1', code: 'X', name: 'Y', unitPrice: 1, category: null } as any).categoryName).toBe(null);
  });
});
```

### Pattern 2 — Zod schema

```typescript
import { ProductCreateSchema } from '@/shared/masterdata/product/product.schema';

describe('ProductCreateSchema', () => {
  it.each([
    [{ code: 'P001', name: 'A', unitPrice: 100 }, true],
    [{ code: '', name: 'A', unitPrice: 100 }, false], // code required
    [{ code: 'P001', name: '', unitPrice: 100 }, false], // name required
    [{ code: 'P001', name: 'A', unitPrice: -1 }, false], // price >= 0
    [{ code: 'P001', name: 'A', unitPrice: 'abc' }, false], // type mismatch
  ])('<localized text>', (input, expectedOk) => {
    const result = ProductCreateSchema.safeParse(input);
    expect(result.success).toBe(expectedOk);
  });

  it('error message is bilingual', () => {
    const r = ProductCreateSchema.safeParse({ code: '', name: '', unitPrice: 100 });
    expect(r.success).toBe(false);
    if (!r.success) {
      const codeError = r.error.issues.find((i) => i.path[0] === 'code');
      expect(codeError?.message).toMatchObject({
        vi: expect.stringContaining('<localized text>'),
        en: expect.stringContaining('required'),
      });
    }
  });
});
```

### Pattern 3 — Service method with mocked repository

```typescript
import { Test } from '@nestjs/testing';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';
import { DataSource, QueryRunner } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('<localized text>', () => {
  let service: ProductService;
  let repo: jest.Mocked<ProductRepository>;
  let queryRunner: jest.Mocked<QueryRunner>;

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: { getRepository: jest.fn() },
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: {
            findById: jest.fn(),
            findByCode: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: { createQueryRunner: () => queryRunner },
        },
      ],
    }).compile();

    service = moduleRef.get(ProductService);
    repo = moduleRef.get(ProductRepository);
  });

  describe('create', () => {
    it('saves new product when code unique', async () => {
      repo.findByCode.mockResolvedValue(null);
      repo.save.mockResolvedValue({ id: '1', code: 'P001', name: 'A', unitPrice: 100 } as any);

      const result = await service.create({ code: 'P001', name: 'A', unitPrice: 100 });

      expect(result.id).toBe('1');
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ code: 'P001' }));
    });

    it('throws ConflictException when code exists', async () => {
      repo.findByCode.mockResolvedValue({ id: '99', code: 'P001' } as any);

      await expect(service.create({ code: 'P001', name: 'A', unitPrice: 100 }))
        .rejects.toBeInstanceOf(ConflictException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('<localized text>', () => {
    it('commits when all updates succeed', async () => {
      const repoTx = { update: jest.fn(), findOneBy: jest.fn() };
      (queryRunner.manager.getRepository as jest.Mock).mockReturnValue(repoTx);
      repoTx.findOneBy.mockResolvedValue({ id: '1' });

      await service.bulkUpdatePrice([{ code: 'P001', price: 200 }]);

      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });

    it('rolls back when one update fails', async () => {
      const repoTx = { update: jest.fn(), findOneBy: jest.fn() };
      (queryRunner.manager.getRepository as jest.Mock).mockReturnValue(repoTx);
      repoTx.findOneBy.mockResolvedValueOnce({ id: '1' }).mockResolvedValueOnce(null); // 2nd code not found

      await expect(
        service.bulkUpdatePrice([
          { code: 'P001', price: 200 },
          { code: 'NONE', price: 300 },
        ]),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
});
```

### Pattern 4 — Guard / decorator

See `_refs/nestjs/test-integration.md` for guard test — both unit + integration styles overlap; the example there works for unit too.

### Pattern 5 — Controller (light-weight)

Controllers in NestJS are usually thin (delegate to service). Test the wiring only:

```typescript
describe('ProductController', () => {
  let controller: ProductController;
  let service: jest.Mocked<ProductService>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            search: jest.fn().mockResolvedValue({ data: [], total: 0 }),
            create: jest.fn().mockResolvedValue({ id: '1' }),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(ProductController);
    service = moduleRef.get(ProductService);
  });

  it('search delegates to service', async () => {
    await controller.search({ keyword: 'x' });
    expect(service.search).toHaveBeenCalledWith({ keyword: 'x' });
  });

  it('create delegates to service and returns DTO', async () => {
    const result = await controller.create({ code: 'P001', name: 'A', unitPrice: 1 });
    expect(result).toEqual({ id: '1' });
  });
});
```

If a controller is more than 3 lines per method, the logic belongs in the service — move it.

## Run

```bash
# All unit + integration co-located
npm run test -- --watch=false

# Just service files
npm run test -- --watch=false --testPathPattern='\.service\.spec\.ts$'

# Coverage
npm run test -- --watch=false --coverage
```

Coverage target: ≥ 80% line on services + validators + mappers.

## Rules

### MUST DO
- Inherit principles from `_refs/shared/testing-philosophy.md`
- Use `Test.createTestingModule` even for "pure" tests — NestJS DI is part of the contract
- Mock the repository in unit tests; use real repo in integration
- Test transaction rollback (mock queryRunner) — common bug source
- Use `it.each` for table-driven validation tests
- Assert on thrown exception TYPE (`ConflictException`), not error message string

### MUST NOT
- Hit the network or a real DB — that's integration / e2e
- Test private methods directly
- Use `xit` / `it.skip` indefinitely
- Spy on every repo method — that's testing the mock; assert on the service's outcome instead

## Anti-patterns

- **Mocking the function under test** — meaningless
- **Snapshot test on DTO output** — too brittle; assert on key fields
- **Single-`it` test of a 6-step method** — break into one `it` per behaviour
- **`expect(repo.save).toHaveBeenCalledWith(theExactEntityObject)`** — brittle; use `expect.objectContaining`
- **Controller test that touches the DB** — bypass controller; test service directly OR upgrade to integration test
- **Testing zod'<localized text>'s own tests cover that; test YOUR schema's rules

## Cross-references
- Principles: `_refs/shared/testing-philosophy.md`
- Integration (real DB): `_refs/nestjs/test-integration.md`
- E2E (real HTTP + DB): `_refs/nestjs/test-e2e.md`
- Convention referenced: bilingual error messages from `base/shared/`
- Verification: `sdcorejs-ship (verify-before-done mode)`
