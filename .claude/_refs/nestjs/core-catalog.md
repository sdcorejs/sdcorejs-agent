# SDCoreJS NestJS Core Catalog Snapshot

Internal knowledge snapshot of the `@sdcorejs/nestjs` core package, consumed by the NestJS write-code packs. Skimmable inventory — import sub-path + a minimal snippet per building block. Single source of truth: when the core package changes, update this file.

Source policy:
- Knowledge is copied into `sdcorejs-agent` and consumed from this repository only.
- Do not require runtime references to external repositories.

> **Neutral core vs app templates.** Everything in this catalog is the NEUTRAL
> `@sdcorejs/nestjs` API — profile-independent. App-level shapes (tenancy strategy,
> page-permission matrix, `base/shared` kernel, internal-secret module) are NOT core; the
> write-code packs emit them only under the `enterprise` profile. The `simple` profile uses
> the core directly (`WithAudit`, core `AuthGuard`, a `string[]`-returning permission strategy).
> See `_refs/nestjs/write-code/init-project.md` "Profile (read FIRST)". The generated **admin
> module** (`init-admin`) owns `IPermissionStrategy` (app-DB role→codes) + the user-lookup
> `JwtStrategy`; the lib ships only the neutral `IPermissionStrategy` interface +
> the `KeycloakJwtStrategy` base.

## Package & imports

- **Package:** `@sdcorejs/nestjs` v0.1.6 (preview, npm). Node ≥18.18. Single package (not a monorepo).
- **Peer deps (required):** `@nestjs/{common,core,passport} ^11`, `typeorm ^0.3.20`, `reflect-metadata ^0.2`, `rxjs ^7.8`, `@sdcorejs/utils ^1.1` (provides `Filter`, `PagingReq`, `Order`).
- **Optional peers:** `zod ^4` (validation), `jwks-rsa ^3` + `jsonwebtoken ^9` (Keycloak JWKS), `ioredis ^5` (cache), `@nestjs/typeorm ^11`, `@nestjs/bullmq ^11` + `bullmq ^5` (queue), `aws-sdk ^2` (file-storage).
- **Sub-path exports:** root `@sdcorejs/nestjs` (re-exports + `SdCoreModule`), `/orm`, `/permission`, `/validation`, `/jwt`, `/context`, `/tenancy`, `/audit`, `/cache`, `/http`, `/i18n`, `/queue`, `/action-history`, `/file-storage`, `/job-scheduler`.
- Root re-exports the common surface (`ContextService`, `ApiResponse`, `apiError`, `HasPermission`, `InternalGuard`, `ZodValidationGuard`, DI tokens, strategy interfaces) for ergonomic single-import; sub-paths remain canonical for the full surface.

```ts
import { SdCoreModule, ApiResponse, HasPermission } from '@sdcorejs/nestjs';
import { BaseEntity, BaseRepository, BaseService, BaseController } from '@sdcorejs/nestjs/orm';
```

## ORM building blocks — `@sdcorejs/nestjs/orm`

**`BaseEntity`** — abstract; provides only a uuid `id`.

```ts
import { BaseEntity, WithTimestamps, WithAudit } from '@sdcorejs/nestjs/orm';
import { Entity, Column } from 'typeorm';

@Entity('product')
export class Product extends WithAudit(BaseEntity) {
  @Column() name!: string;
}
```

**Mixins** (compose onto `BaseEntity`):
- `WithTimestamps(BaseEntity)` → adds `createdAt` (`update:false`), `updatedAt`, `deletedAt`.
- `WithAudit(BaseEntity)` → extends timestamps + `createdBy` / `modifiedBy` + `creator` / `modifier` (`UserSnapshot`).

**`BaseRepository<T>`** — `constructor(target, dataSource, options?)`. Reads auto-apply `WHERE deletedAt IS NULL`.

```ts
import { BaseRepository } from '@sdcorejs/nestjs/orm';

export class ProductRepository extends BaseRepository<Product> {
  constructor(dataSource: DataSource) {
    super(Product, dataSource, { logHistory: true }); // { logHistory?, tenancyStrategy?, auditStrategy?, contextService?, historyRecorder? }
  }
}
```
- Read: `paging(req)`, `pagingDeleted(req)`, `all(filters?)`, `search(keyword, filters?)`, `detail(id)`.
- Write: `create(entity, qr?)`, `update(entity, qr?)`, `import(entities, qr?)`, `delete(ids)`, `softDelete(ids)`, `restore(ids)`.
- Accessors: `queryRunner`, `repository`, `getRepository(qr?)`.
- Interface: `IBaseRepository<T>`.

**`BaseService<T, TDto>`** — `constructor(repository)`, abstract `mapDTO(entity): TDto`. Mirrors repo read/write, maps results via `mapDTO`. DTO shape: `{ id, deletable?, restorable? }`. Interface: `IBaseService<T, TDto>`.

```ts
import { BaseService } from '@sdcorejs/nestjs/orm';

export class ProductService extends BaseService<Product, ProductDto> {
  constructor(repo: ProductRepository) { super(repo); }
  mapDTO(e: Product): ProductDto { return { id: e.id, name: e.name }; }
}
```

**`BaseController<T, TDto>`** — `constructor(baseService)`; auto-mounts `POST /search`, `POST /paging`, `GET /all`, `GET /:id`, `DELETE /:id`; wraps results in `ApiResponse`.

```ts
import { BaseController } from '@sdcorejs/nestjs/orm';
import { Controller } from '@nestjs/common';

@Controller('products')
export class ProductController extends BaseController<Product, ProductDto> {
  constructor(service: ProductService) { super(service); }
}
```

## Decorators — `@sdcorejs/nestjs/orm`

- `@TenantScoped()` / `@Scoped()` (alias) — mark the tenancy column on an entity.
- `@SearchableFields({ exact: [], contain: [], activeColumn? })` — declare which columns `search()` matches.
- `@Schema({ name, description })` / `@SchemaProp({ label, required, unique })` — describe entity / property metadata.

```ts
import { Scoped, SearchableFields, Schema, SchemaProp } from '@sdcorejs/nestjs/orm';

@Schema({ name: 'Product', description: 'Catalog item' })
@SearchableFields({ exact: ['code'], contain: ['name'], activeColumn: 'isActive' })
export class Product extends WithAudit(BaseEntity) {
  @Scoped() @Column() tenantId!: string;
  @SchemaProp({ label: 'Name', required: true, unique: true }) @Column() name!: string;
}
```

## Auth & permission — `@sdcorejs/nestjs/permission`

- `AuthGuard` — extends passport JWT; validates the JWT, loads codes via `IPermissionStrategy.load(ctx)`, then enforces `@HasPermission`.
- `@HasPermission(code)` / `@HasAnyPermission(...codes)` — per-route permission requirements.
- `InternalGuard` — service-to-service auth via `x-internal-secret` header + `INTERNAL_SECRET_PROVIDER`.
- `IPermissionStrategy { load(ctx): Promise<string[]>; check?(codes, required): boolean }`.

```ts
import { AuthGuard, HasPermission } from '@sdcorejs/nestjs/permission';
import { ZodValidationGuard } from '@sdcorejs/nestjs/validation';
import { UseGuards, Post, Body } from '@nestjs/common';

@UseGuards(AuthGuard, ZodValidationGuard(productSchema))
@HasPermission('product:create')
@Post()
create(@Body() dto: ProductDto) { /* ... */ }
```
- **Guard order:** `@UseGuards(AuthGuard, ZodValidationGuard(schema))` + `@HasPermission` per route.

## Validation — `@sdcorejs/nestjs/validation`

- `ZodValidationGuard(schema | { body?, query?, params? }, source? = 'body')` — coerces + replaces input; throws 400 `{ code: 'core.validation.failed', message, data: { issues } }`. Zod v4 only.
- Presets:
  - `zPaging` — `{ pageNumber: coerce int ≥0 default 0, pageSize: coerce int 1..1000 default 10 }`.
  - `zUuid(msg?)` — uuid string.
  - `zBool` — coerced boolean.

```ts
import { ZodValidationGuard, zPaging, zUuid } from '@sdcorejs/nestjs/validation';
import { z } from 'zod';

const findSchema = { query: zPaging, params: z.object({ id: zUuid() }) };

@UseGuards(ZodValidationGuard(findSchema))
@Get(':id') find() { /* validated query + params */ }
```

## JWT & Keycloak — `@sdcorejs/nestjs/jwt`

- `JwtModule.forRoot(config, options?)`:
  - `config = { secret }` → symmetric `JwtStrategy`.
  - `config = { jwks: { allowedIssuers: string[] } }` → `KeycloakJwtStrategy` (JWKS at `${iss}/protocol/openid-connect/certs`).
  - `options.strategy` → a custom strategy subclass.
- Custom strategy maps claims → app user.
- Tokens / types: `JWT_CONFIG`, `JwtConfig`, `JwtPayload`.

```ts
import { JwtModule, KeycloakJwtStrategy } from '@sdcorejs/nestjs/jwt';

class AppJwtStrategy extends KeycloakJwtStrategy {
  validate(payload: JwtPayload) { return { id: payload.sub, roles: payload.realm_access?.roles }; }
}

JwtModule.forRoot({ jwks: { allowedIssuers: ['https://kc/realms/app'] } }, { strategy: AppJwtStrategy });
```

## Context — `@sdcorejs/nestjs/context`

- `ContextService` (AsyncLocalStorage) — `get/set(key)`; getters `userId` / `tenant` / `lang` / `user` / `permissions`; `hasPermission(code)`.
- `RequestContext` interface — extend via TS declaration-merging.
- `ContextMiddleware` — auto-wired by `ContextModule.forRoot({ headers: { tenant, userId, lang, customHeaders } })`.

```ts
import { ContextModule, ContextService } from '@sdcorejs/nestjs/context';

ContextModule.forRoot({ headers: { tenant: 'x-tenant-id', userId: 'x-user-id', lang: 'x-lang' } });

// inside a service:
constructor(private ctx: ContextService) {}
get tenant() { return this.ctx.tenant; }
```

## Tenancy & audit strategies — `@sdcorejs/nestjs/tenancy` + `@sdcorejs/nestjs/audit`

- `ITenancyStrategy { getCurrentScope(ctx): Record<string, unknown>; shouldBypass(ctx): boolean }`.
- `IAuditStrategy { onCreate/onUpdate/onSoftDelete(entity, ctx) }`.
- `BaseRepository` injects scope filters on reads + auto-fills `@Scoped` columns on writes (unless `shouldBypass`); calls audit hooks on write.

```ts
import { ITenancyStrategy } from '@sdcorejs/nestjs/tenancy';
import { IAuditStrategy } from '@sdcorejs/nestjs/audit';

class TenancyStrategy implements ITenancyStrategy {
  getCurrentScope(ctx) { return { tenantId: ctx.tenant }; }
  shouldBypass(ctx) { return ctx.user?.isSuperAdmin === true; }
}
class AuditStrategy implements IAuditStrategy {
  onCreate(entity, ctx) { entity.createdBy = ctx.userId; }
  onUpdate(entity, ctx) { entity.modifiedBy = ctx.userId; }
  onSoftDelete(entity, ctx) { /* ... */ }
}
```

## Bootstrap (SdCoreModule) — root `@sdcorejs/nestjs`

`SdCoreModule.forRoot({ context?, tenancy?, audit?, permission?, cache?, http?, jwt?, i18n?, providers? })` — omitted keys = no-op / default.

```ts
import { SdCoreModule } from '@sdcorejs/nestjs';

@Module({
  imports: [
    SdCoreModule.forRoot({
      context: { headers: { tenant: 'x-tenant-id', userId: 'x-user-id', lang: 'x-lang' } },
      tenancy: { strategy: TenancyStrategy },
      audit: { strategy: AuditStrategy },
      permission: { strategy: PermissionStrategy },
      jwt: { jwks: { allowedIssuers: ['https://kc/realms/app'] } },
      i18n: { fallbackLanguage: 'vi', catalogs },
    }),
  ],
})
export class AppModule {}
```

**DI tokens:** `CONTEXT_HEADERS_CONFIG`, `TENANCY_STRATEGY`, `AUDIT_STRATEGY`, `PERMISSION_STRATEGY`, `INTERNAL_SECRET_PROVIDER`, `INTERNAL_CONTEXT_ENRICHER`.

**i18n:** `{ fallbackLanguage: 'vi', catalogs }` → bilingual error envelope `{ code, message }`.

## Response & errors — `@sdcorejs/nestjs/orm` (re-exported at root)

- `ApiResponse.ok(data)` — success envelope.
- `ApiResponse.noContent()` — empty success.
- `ApiResponse.error(code, message, data?)` — error envelope.
- `apiError(code, message, data?)` → `{ code, message, data? }`.

```ts
import { ApiResponse, apiError } from '@sdcorejs/nestjs';

return ApiResponse.ok(dto);
return ApiResponse.noContent();
throw new BadRequestException(apiError('product.duplicate', 'Name already exists'));
```

## Defaults when a strategy is omitted

- **No `tenancy.strategy`** → reads/writes apply NO scope filter (single-tenant behavior); `@Scoped` columns are not auto-filled.
- **No `audit.strategy`** → audit hooks are no-ops; `WithAudit` columns must be set manually.
- **No `permission.strategy`** → `AuthGuard` validates the JWT only; `@HasPermission` has no codes to check against (treat as deny / configure a strategy).
- **No `context`** → `ContextService` getters resolve from no middleware-populated store (must be wired for tenancy/audit/i18n to read request data).
- **No `jwt`** → no JWT strategy registered; `AuthGuard` cannot validate tokens.
- **No `i18n`** → error envelope uses the raw `code` / `message` with no catalog translation.
- Soft-delete (`deletedAt IS NULL`) on reads is always on — independent of any strategy.

## Version pin

Version pin: `@sdcorejs/nestjs@^0.1.x` — update this catalog when core changes (single source of truth for the write-code packs).
