# NestJS Backend — Architecture Principles

Source of truth for **WHY** SDCoreJS NestJS backends look the way they do. Loaded on demand by `sdcorejs-brainstorm`, `sdcorejs-write-spec`, `sdcorejs-clarify-requirements`, `nestjs-write-code`, and `sdcorejs-review-code`.

**Status**: NestJS track is **scaffold** — the code-writing sub-skills (`10-init-project`, `11-init-module`, `12-init-entity`) are planned but not yet implemented. Until they ship, the principles below govern manual generation via `nestjs-write-code` plan-walker.

These principles are distilled from the `be-masterdata` baseline project (the reference repo SDCoreJS NestJS conventions come from).

---

## 1. Module = bounded context (same as Angular)

```
src/
├── modules/
│   ├── catalog/                  ← bounded context
│   │   ├── entities/             ← TypeORM entities
│   │   ├── repositories/         ← extends BaseRepository
│   │   ├── services/             ← business logic
│   │   ├── controllers/          ← thin HTTP layer
│   │   ├── dto/                  ← response shapes
│   │   ├── schemas/              ← Zod validation schemas
│   │   ├── mappers/              ← entity ↔ DTO
│   │   └── catalog.module.ts
│   └── sales/
└── migrations/<timestamp>-<topic>.ts
```

**Rule**: a module owns its entities, business logic, HTTP surface, and validation. Cross-module communication via events / shared services at app root — NEVER direct entity import from another module's `entities/`.

**Why**: same as Angular — bounded contexts make refactor / delete / scale-out tractable.

---

## 2. `BaseEntity` / `BaseRepository` / `BaseService` are mandatory

```ts
// entities/product.entity.ts
@Entity({ name: 'products' })
export class ProductEntity extends BaseEntity {
  @Column() code: string;
  @Column() name: string;
  // BaseEntity provides: id, createdAt, updatedAt, createdBy, updatedBy, deletedAt
}

// repositories/product.repository.ts
@Injectable()
export class ProductRepository extends BaseRepository<ProductEntity> {
  // custom queries here; CRUD inherited
}

// services/product.service.ts
@Injectable()
export class ProductService extends BaseService<ProductEntity> {
  // business logic; CRUD inherited
}
```

**Why**:
- Audit columns are everywhere (no entity ever forgets `createdBy`)
- Soft-delete (`deletedAt IS NULL` filter) is automatic
- Pagination + sorting + filtering helpers come for free from `BaseRepository`
- Testing fixtures (test-container PG + seed) work uniformly

**Anti-pattern**: entity that extends `Object` instead of `BaseEntity` because "this one is special". It's not. Audit fields are a baseline cost.

---

## 3. Guard order: `AuthGuard` → `ZodValidationGuard` → `@HasPermission()`

```ts
@Controller('product')
@UseGuards(AuthGuard, ZodValidationGuard)
export class ProductController {
  @Post()
  @HasPermission('CRM_PRODUCT_CREATE')
  create(@Body() body: ProductSaveReq) { … }

  @Get()
  @HasPermission('CRM_PRODUCT_LIST')
  list(@Query() query: ProductListQuery) { … }
}
```

Order matters:
1. **`AuthGuard`** first — unauthenticated request rejected (cheap)
2. **`ZodValidationGuard`** second — invalid payload rejected (avoid running auth-failed validations against malformed payload)
3. **`@HasPermission()`** per endpoint — write endpoints + sensitive reads always; public GETs may skip

**Anti-pattern**: `@UseGuards(ZodValidationGuard, AuthGuard)` — wrong order, you validate before knowing if the user is logged in. Tiny cost difference but the principle matters: **auth is a precondition for everything else**.

**Reviewer**: `sdcorejs-review-code` flags wrong guard order as **Critical**.

---

## 4. Zod schemas live in the shared package, used twice

```
libs/shared/schemas/product.schema.ts
```

```ts
// libs/shared/schemas/product.schema.ts
import { z } from 'zod';

export const productSaveReqSchema = z.object({
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  price: z.number().min(0),
  // …
});
export type ProductSaveReq = z.infer<typeof productSaveReqSchema>;
```

Used by:
1. **`ZodValidationGuard`** at controller boundary — invalid requests get `400` with `{ vi, en }` message
2. **OpenAPI generator** — schema descriptions feed Swagger UI / contract tests

**Anti-patterns**:
- Using `class-validator` decorators on a DTO class — fragmented validation logic, runtime + compile-time disagree, OpenAPI schema diverges from validation rules
- Defining the schema inside the module (`src/modules/<x>/schemas/`) — can't share across modules
- Defining the schema inside the controller file — can't reuse for integration tests

**Why**: ONE source of truth for "what's a valid Product payload". Validation, OpenAPI doc, integration tests, frontend type generation all read the same Zod object.

---

## 5. Controller is thin; business logic lives in service

```ts
// ❌ wrong: controller doing real work
@Post(':id/approve')
async approve(@Param('id') id: string) {
  const product = await this.repo.findOne(id);
  if (product.status !== 'PENDING') throw new BadRequestException();
  product.status = 'APPROVED';
  product.approvedAt = new Date();
  await this.repo.save(product);
  await this.emailService.notify(product.ownerId, 'approved');
}

// ✅ right: controller dispatches
@Post(':id/approve')
@HasPermission('CRM_PRODUCT_APPROVE')
approve(@Param('id') id: string) {
  return this.service.approve(id);
}
```

Service owns: state transitions, validation beyond schema, side-effects (email, queue, audit log).
Controller owns: HTTP plumbing (status codes, response shape, query parsing).

**Why**: services are testable without HTTP. Controllers are a glue layer that swaps when the protocol changes (REST → gRPC → GraphQL).

---

## 6. Transactions: explicit `QueryRunner`, not `@Transactional()`

```ts
async createWithItems(req: PurchaseOrderSaveReq) {
  const qr = this.dataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();
  try {
    const po = await qr.manager.save(this.poRepo.create(req));
    for (const item of req.items) {
      await qr.manager.save(this.itemRepo.create({ ...item, poId: po.id }));
    }
    await qr.commitTransaction();
    return po;
  } catch (err) {
    await qr.rollbackTransaction();
    throw err;
  } finally {
    await qr.release();
  }
}
```

**Why explicit QueryRunner over `@Transactional()` decorator**:
- Visible — reviewer sees the transaction boundary immediately
- Composable — you can pass `qr.manager` to helper methods explicitly
- Debuggable — when a transaction fails, you know which scope (`@Transactional` hides this)
- Works with savepoints / nested transactions when needed (advanced cases)

**When to open a transaction**: ≥2 tables written atomically, OR a single-table write that's part of a multi-step workflow (audit log + entity update).

**Anti-pattern**: wrapping every service method in `@Transactional()` "just in case". Most reads don't need transactions; over-wrapping costs (lock contention + latency).

---

## 7. Bilingual error messages: `{ vi, en }`

```ts
throw new BadRequestException({
  code: 'PRODUCT_CODE_DUPLICATE',
  vi: 'Mã sản phẩm đã tồn tại',
  en: 'Product code already exists',
});
```

Validation guard, exception filter, and global error handler all serialize errors in this shape. Frontend picks the appropriate language at render time.

**Why bilingual**:
- VI users see VI; debugging engineers see EN
- Logs (which are in EN) and user-facing alerts (which are in VI) don't diverge
- API consumers (mobile, partner systems) can pick

**Never**: single-language error messages. Even temporarily. Future bilingual rollout cost is 10× the upfront cost.

---

## 8. Migrations match every entity change

Every entity change (new field, new index, new constraint, new entity) gets a migration:

```
src/migrations/2026-05-20-1430-add-product-category.ts
```

```ts
export class AddProductCategory1716195000000 implements MigrationInterface {
  async up(qr: QueryRunner) {
    await qr.query(`ALTER TABLE products ADD COLUMN category VARCHAR(100)`);
    await qr.query(`CREATE INDEX idx_products_category ON products(category)`);
  }
  async down(qr: QueryRunner) {
    await qr.query(`DROP INDEX idx_products_category`);
    await qr.query(`ALTER TABLE products DROP COLUMN category`);
  }
}
```

Both `up()` AND `down()` must be implemented. `down()` actually tested (rollback in CI for migration changes).

**Anti-patterns**:
- `synchronize: true` in production config — auto-modifies schema, eats data, untestable
- `down()` left as `// TODO` — rollbacks fail in production, ops can't recover

**Reviewer**: orphan entity (entity field exists but no migration creates the column) = **Critical**.

---

## 9. Soft-delete by default; filter at repository

`BaseEntity.deletedAt` makes soft-delete free. `BaseRepository` adds `WHERE deletedAt IS NULL` to every `find*()` automatically.

Hard delete (`DELETE FROM`) ONLY when there's a compliance requirement (GDPR right-to-erasure, PCI mandate). Then it's an explicit `repo.hardDelete(id)` method, documented.

**Why soft-delete first**:
- "Who deleted this and when" is answerable
- Restore is one-line
- Foreign keys don't cascade-orphan
- Audit trail intact

---

## 10. Test layers: unit + integration + e2e

| Layer | Tooling | What it covers | Speed |
|---|---|---|---|
| Unit | `@nestjs/testing` + mocked deps | Pure service methods, validators, mappers | <100ms each |
| Integration | `Test.createTestingModule` + real DI + pg-mem | Service → repository → DB round-trip; module wiring | <500ms each |
| E2E | `supertest` + real PG via testcontainers | Full HTTP request → response cycle, AuthGuard + ZodValidationGuard real | 1-5s each |

Per `_refs/shared/testing-philosophy.md`: pyramid ratio is roughly 70 unit / 20 integration / 10 e2e.

Mock at the layer being tested:
- Unit service test → mock repository
- Integration service test → real repository + pg-mem
- E2E controller test → real DB + real HTTP server

**Anti-pattern**: e2e tests that mock the DB. Defeats the purpose. If the DB layer is too slow, the architecture is wrong, not the tests.

---

## 11. Permission codes: Module → Entity → Action, UPPERCASE

```ts
@HasPermission('CRM_PRODUCT_LIST')       // module: CRM, entity: PRODUCT, action: LIST
@HasPermission('SALES_ORDER_APPROVE')    // module: SALES, entity: ORDER, action: APPROVE
```

Acceptable variants (pick ONE per project, stay consistent):
- `<MODULE>_<ENTITY>_<ACTION>` — scaffold default
- `<MODULE>_C_<ENTITY>_<ACTION>` — common variant from existing portals
- `<MODULE>_<ENTITY>:<ACTION>` — colon-separator variant

**Detection**: when applying to an existing project, grep existing permission codes; follow the established convention. Never mix two variants in the same project.

---

## 12. Pagination: cursor when scale, offset for admin

```ts
// admin tables (≤10k rows expected): offset
GET /products?page=1&pageSize=20

// user-facing feeds, time-ordered (>10k rows likely): cursor
GET /products/feed?after=<base64-encoded-row-id>&limit=20
```

The shared `Pagination<T>` response shape:
```ts
{
  items: T[];
  pageInfo: { hasNext: boolean; nextCursor?: string; total?: number };
}
```

`total` provided only for offset pagination (cursor pagination doesn't compute total — it's expensive).

**Why both**: offset is intuitive ("page 5 of 23") and fine for small admin tables. Cursor is the only viable pagination for tables that grow unboundedly (sales transactions, audit logs).

---

## 13. Standard response envelope

```ts
// Success
{ data: <payload>, error: null }

// Error
{ data: null, error: { code: 'PRODUCT_NOT_FOUND', vi: '…', en: '…' } }
```

Global response interceptor wraps every successful response in `{ data, error: null }`. Exception filter wraps every thrown error in `{ data: null, error: ... }`.

**Why**: frontend has ONE shape to parse. `try { res.data } catch { res.error }` is uniform across all endpoints.

**Anti-pattern**: returning the raw entity directly (`return product`) — frontend writes per-endpoint parsing logic; refactor cost explodes when error handling needs to be added later.

---

## 14. Backend is not the agent

This skill set generates NestJS backends. The principles above govern the **generated code**, not this `sdcorejs-agent` repo. When a developer asks "why does the generated service do X", the answer comes from this file.

When a principle changes, propagate to:
- The skill that generates it (`nestjs-write-code` today; future `12-init-entity` etc.)
- The reviewer (`sdcorejs-review-code`)
- The migration / test templates

---

## Open questions (still pending — see `_refs/sdlc/nestjs.md`)

- Exact path for shared package (`libs/shared/schemas/` vs `libs/shared/zod/`) — confirm from be-masterdata
- Cursor pagination shape (single field vs composite) — confirm from existing modules
- Permission code separator convention per existing portals
- `nestjs-write-code` orchestrator sub-skill layout (10/11/12/20/21/22 vs flatter)

These get resolved when NestJS track moves from scaffold to complete.

---

## Anti-principles (NOT to do)

- ❌ "Skip `BaseEntity` for this one" — audit columns are a baseline cost
- ❌ "Validate with `class-validator` because we're used to it" — Zod is the SDCoreJS standard; one source of truth
- ❌ "Wrap every method in transactions for safety" — lock contention + latency cost; transactions for genuinely multi-table writes only
- ❌ "Single-language error messages, translate later" — never happens, ends up with `{ message: 'Mã đã tồn tại' }` in EN-only logs forever
- ❌ "`synchronize: true` in production" — eats data
- ❌ "Hard delete by default" — soft-delete first; hard-delete is a compliance method, not a default
- ❌ "Mock the DB in e2e" — defeats the purpose; if e2e is slow, fix architecture not tests
- ❌ "Permission code mixed conventions in one project" — pick one shape, stay consistent

---

## Related references

- `_refs/sdlc/nestjs.md` — design-phase patterns + persistence options
- `skills/tracks/nestjs/00-onboarding.md` — entry point
- `skills/tracks/nestjs/07-write-code.md` — current plan-walker orchestrator
- `skills/tracks/nestjs/_README.md` — track status
- `sdcorejs-review-code` — convention enforcement (the reviewer)
- `skills/testing/{unit,integration,e2e}/nestjs.md` — testing patterns per layer
