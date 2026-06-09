# SDCoreJS NestJS Core Catalog Snapshot

Internal knowledge snapshot of `@sdcorejs/nestjs`, consumed by the NestJS write-code packs. Keep this file aligned with the published package, not with old generated app templates.

Source policy:
- Knowledge is copied into `sdcorejs-agent` and consumed from this repository only.
- Do not require runtime references to external repositories.

> **Neutral core vs app templates.** Everything in this catalog is the neutral `@sdcorejs/nestjs` API. App-level shapes such as page-permission matrices, `SdContext` facades, legacy base entities, and custom auth guards belong to target apps and the write-code packs, not to the core package.

## Package & Imports

- **Package:** `@sdcorejs/nestjs` v1.0.0 (stable, npm). Node >=18.18.
- **Peer deps:** `@nestjs/common ^11`, `@nestjs/core ^11`.
- **Bundled deps:** `@nestjs/passport`, `@nestjs/typeorm`, `@nestjs/bullmq`, `@nestjs/schedule`, `@nestjs/platform-express`, `typeorm`, `reflect-metadata`, `rxjs`, `@sdcorejs/utils`, `axios`, `bullmq`, `passport`, `passport-jwt`.
- **Optional deps:** `zod ^4`, `jwks-rsa`, `jsonwebtoken`, `ioredis`, `aws-sdk`.
- **Sub-path exports:** root `@sdcorejs/nestjs`, `/core`, `/auth`, `/services`, `/validation`, `/queue`, `/i18n`, `/features`.
- **Do not use old preview sub-paths:** `/orm`, `/permission`, `/jwt`, `/context`, `/tenancy`, `/audit`, `/cache`, `/http`, `/file-storage`, `/action-history`, `/job-scheduler`.

```ts
import { SdCoreModule } from '@sdcorejs/nestjs';
import { BaseRepository, BaseService, BaseController, ApiResponse } from '@sdcorejs/nestjs/core';
import { AuthGuard, HasPermission, JwtModule, KeycloakJwtStrategy } from '@sdcorejs/nestjs/auth';
import { ZodValidationGuard, parseZod } from '@sdcorejs/nestjs/validation';
```

Root re-exports the common surface for ergonomic imports, but the packs should prefer the canonical sub-paths above.

## Core Building Blocks - `@sdcorejs/nestjs/core`

**`BaseEntity`** is minimal: uuid `id` only. Use `WithTimestamps(BaseEntity)` for `createdAt`, `updatedAt`, `deletedAt`; use `WithAudit(BaseEntity)` for timestamps plus `createdBy`, `modifiedBy`, `creator`, `modifier`.

```ts
import { BaseEntity, WithAudit } from '@sdcorejs/nestjs/core';
import { Entity, Column } from 'typeorm';

@Entity('product')
export class Product extends WithAudit(BaseEntity) {
  @Column()
  name!: string;
}
```

Enterprise migrations may keep a local `src/common/base-entity.ts` when the live schema uses legacy column names such as `modifiedAt`. That is an app-template decision; `BaseRepository`, `BaseService`, and `BaseController` are column-name agnostic enough to operate on that local base.

**`BaseRepository<T>`** is constructed with `constructor(target, dataSource, options?)`.

```ts
import { BaseRepository } from '@sdcorejs/nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class ProductRepository extends BaseRepository<Product> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(Product, dataSource, { logHistory: true });
  }
}
```

- Read: `paging(req, args?)`, `pagingDeleted(req, args?)`, `all(filters?, args?)`, `search(keyword, filters?)`, `detail(id, args?)`.
- Write: `create(entity, qr?)`, `update(entity, qr?)`, `import(entities, qr?)`, `delete(idOrIds, qr?)`, `softDelete(idOrIds, qr?)`, `restore(idOrIds, qr?)`.
- Accessors: `queryRunner`, `repository`, `target`, `getRepository(qr?)`.
- Types: `IBaseRepository<T>`, `BaseRepositoryArgs<T>`.

**`BaseService<T, TDto>`** mirrors repository reads/writes and maps results through `mapDTO(entity)`.

```ts
import { BaseService, type IBaseService } from '@sdcorejs/nestjs/core';

export interface IProductService extends IBaseService<Product, ProductDto> {}
export const IProductService = Symbol('IProductService');

export class ProductService extends BaseService<Product, ProductDto> implements IProductService {
  constructor(repo: ProductRepository) {
    super(repo);
  }

  mapDTO(entity: Product | undefined | null): ProductDto | undefined | null {
    return entity ? { id: entity.id, name: entity.name } : entity;
  }
}
```

DTOs must satisfy `{ id: string; deletable?: boolean; restorable?: boolean }`. `BaseService.create` and `BaseService.update` accept an optional `QueryRunner`; `BaseService.import` does not expose a `QueryRunner`, so use `BaseRepository.import(..., qr)` directly for transactional imports.

**`BaseController<T, TDto>`** exposes the generic read/delete surface:

- `POST /search`
- `POST /paging`
- `GET /:id`
- `DELETE /:id`

`GET /all`, soft-delete, restore, and paging-deleted are available on `BaseService`, but are not exposed by the generic controller. Add explicit subclass routes when an entity really needs them.

```ts
import { BaseController } from '@sdcorejs/nestjs/core';
import { Controller } from '@nestjs/common';

@Controller('products')
export class ProductController extends BaseController<Product, ProductDto> {
  constructor(service: ProductService) {
    super(service);
  }
}
```

## Decorators - `@sdcorejs/nestjs/core`

- `@Scoped()` marks the property names that tenancy filters and write auto-fill use.
- `@SearchableFields({ exact, contain, activeColumn })` declares columns used by `search(keyword)`.
- `@Schema()` and `@SchemaProp()` provide schema metadata returned by `BaseService.schema()`.

```ts
import { Scoped, SearchableFields, Schema, SchemaProp } from '@sdcorejs/nestjs/core';

@Schema({ name: 'Product' })
@SearchableFields({ exact: ['code'], contain: ['name'], activeColumn: 'isActive' })
export class Product extends WithAudit(BaseEntity) {
  @Scoped()
  @Column()
  tenantCode!: string;

  @SchemaProp({ label: 'Name', required: true })
  @Column()
  name!: string;
}
```

## Auth, Permission, JWT - `@sdcorejs/nestjs/auth`

- `AuthGuard` extends `PassportAuthGuard('jwt')`, validates the token, loads permission codes via `IPermissionStrategy.load()`, and enforces `@HasPermission` / `@HasAnyPermission`.
- `InternalGuard` validates service-to-service calls through the configured internal secret provider.
- `JwtModule.forRoot(config, options?)` registers `JwtStrategy`, `KeycloakJwtStrategy`, or a custom strategy.
- `KeycloakJwtStrategy` verifies RS256 tokens through issuer JWKS and should be subclassed when the app needs to enrich `req.user`.
- JWKS config must declare an issuer policy: `allowedIssuers`, `allowedIssuerHosts`, or `issuerValidator`.

```ts
import { AuthGuard, HasPermission, JwtModule, KeycloakJwtStrategy } from '@sdcorejs/nestjs/auth';

JwtModule.forRoot(
  { jwks: { allowedIssuerHosts: ['https://keycloak.example'] } },
  { strategy: AppJwtStrategy, imports: [AdminModule] },
);

@UseGuards(AuthGuard)
@HasPermission('crm_task:create')
@Post()
create(@Body() dto: TaskCreateReq) {
  // ...
}
```

Permission codes are flat strings such as `<module>_<entity>:<action>`.

## Validation - `@sdcorejs/nestjs/validation`

- `ZodValidationGuard(schema | { body?, query?, params? }, source = 'body')` validates and replaces the selected request input.
- `parseZod(schema, value)` is useful for custom controller bodies when a guard is not ergonomic.
- Presets: `zPaging`, `zUuid(message?)`, `zBool`, `zPageNumber`, `zPageSize`.

```ts
import { ZodValidationGuard, zPaging, zUuid } from '@sdcorejs/nestjs/validation';
import { z } from 'zod';

const findSchema = {
  query: zPaging,
  params: z.object({ id: zUuid() }),
};

@UseGuards(ZodValidationGuard(findSchema))
@Get(':id')
find() {
  // validated query + params
}
```

## Context, Tenancy, Audit - `@sdcorejs/nestjs/core`

- `ContextService` uses AsyncLocalStorage and exposes `get/set`, `userId`, `tenant`, `lang`, `user`, `permissions`, and `hasPermission(code)`.
- `ContextMiddleware` is wired by `SdCoreModule.forRoot({ context })`.
- `ITenancyStrategy` can be supplied as a class, or tenancy can use inline callbacks `{ resolve, bypass }`.
- `IAuditStrategy` fills audit fields for entities produced by `WithAudit`.

```ts
import { ContextService, type ITenancyStrategy, type RequestContext } from '@sdcorejs/nestjs/core';

export class AppTenancyStrategy implements ITenancyStrategy {
  getCurrentScope(ctx: RequestContext) {
    return { tenantCode: ctx.custom?.tenantCode };
  }

  shouldBypass(ctx: RequestContext) {
    return ctx.custom?.isInternalCall === true;
  }
}
```

## Bootstrap - Root `@sdcorejs/nestjs`

`SdCoreModule.forRoot` composes the cross-cutting modules. Omitted keys use defaults or are disabled. Opt-in keys include `jwt`, `i18n`, `uploadedFile`, `actionHistory`, `jobScheduler`, and `queue`.

```ts
import { SdCoreModule } from '@sdcorejs/nestjs';

@Module({
  imports: [
    SdCoreModule.forRoot({
      context: {
        headers: {
          userId: 'x-user-id',
          lang: ['accept-language', 'x-language'],
          customHeaders: {
            tenantCode: 'x-tenant-code',
            departmentCode: 'x-department-code',
          },
        },
      },
      cache: {},
      i18n: { fallbackLanguage: 'vi', supportedLanguages: ['vi', 'en'], catalogs },
      permission: { strategy: AppPermissionStrategy },
      internalSecret: { envVar: 'INTERNAL_SECRET_KEY' },
      tenancy: {
        bypass: (ctx) => ctx.custom?.isMaster === true,
        resolve: (ctx) => ({ tenantCode: ctx.custom?.tenantCode }),
      },
      uploadedFile: { folder: 'enterprise' },
      actionHistory: { resolveActor: (ctx) => ({ userId: ctx.userId }) },
      jobScheduler: {},
    }),
  ],
})
export class AppModule {}
```

When a custom JWT strategy needs providers from `AdminModule`, do not use the `jwt` convenience key. Register `JwtModule.forRoot(..., { strategy, imports: [AdminModule] })` from `@sdcorejs/nestjs/auth` as a separate import, matching the enterprise reference app.

## Services - `@sdcorejs/nestjs/services`

- `CacheService`, `CacheModule`, `CacheInterceptor`, `@Cached`, `RequestCacheMiddleware`.
- `HttpService`, `HttpClientModule`.

```ts
import { Cached, CacheService } from '@sdcorejs/nestjs/services';
```

## Features - `@sdcorejs/nestjs/features`

- Uploaded files: `UploadedFile`, `UploadedFileService`, `UploadedFileController`, `IUploadedFileStorage`, `UploadedFileModule`, `LocalUploadedFileStorage`, `AwsUploadedFileStorage`.
- Action history: `ActionHistory`, `ActionHistoryService`, `ActionHistoryController`.
- Job scheduler: `JobScheduler`, `JobSchedulerService`, `JobSchedulerType`, `JobSchedulerStatus`.

The drop-in controllers are not auto-registered; add them to an app module's `controllers` array so they inherit that module's route prefix.

## Response & Errors - `@sdcorejs/nestjs/core`

- `ApiResponse.ok(data)` creates a success envelope.
- `ApiResponse.noContent()` creates an empty success envelope.
- `ApiResponse.error(code, message, data?)` creates an error envelope.
- `apiError(code, message, data?)` creates the error body used inside Nest exceptions.

```ts
import { ApiResponse, apiError } from '@sdcorejs/nestjs/core';

return ApiResponse.ok(dto);
return ApiResponse.noContent();
throw new BadRequestException(apiError('product.duplicate', 'Name already exists'));
```

## Defaults

- No tenancy strategy or callbacks: no scope filter and no scoped-column auto-fill.
- No audit strategy: audit hooks are no-ops.
- No permission strategy: routes with `@HasPermission` deny by default.
- No context config: request context is not populated from headers.
- No JWT config or separate `JwtModule`: `AuthGuard` cannot validate tokens.
- No i18n config: error envelopes keep raw `code` / `message`.

## Version Pin

Version pin: `@sdcorejs/nestjs@^1.0.0`. Update this catalog whenever a new public API version changes exports, constructor signatures, or default behavior.
