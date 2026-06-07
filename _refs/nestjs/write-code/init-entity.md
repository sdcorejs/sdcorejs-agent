> **Reference for the `nestjs-write-code` orchestrator.** Loaded on demand when the
> confirmed plan adds a full CRUD stack for a new entity inside an existing module.
> Not a standalone skill — the orchestrator reads this file when its dispatch table routes
> a step here. This is the workhorse pack: the complete entity → repository → service →
> controller → schema → DTO stack for one entity inside a module built by `init-module`.

# Init Entity — Full CRUD Stack for One Entity (`@sdcorejs/nestjs`)

## Purpose / when to use

Generate the **complete CRUD stack for one entity** inside a module that already exists (scaffolded by [`init-module`](./init-module.md)): the TypeORM **entity**, its **repository** (Symbol I-token + concrete class), its **DTO** (in the `@shared` kernel), its **service** (permission-gated `mapDTO`), its **Zod schemas** (create + update), its **controller** (`@HasPermission` + `ZodValidationGuard`), and the **module wiring** that registers all four building blocks. Paging / detail / soft-delete / restore routes are **inherited** from `BaseController` — this pack only writes the entity-specific surface plus the two write routes (`create` / `update`).

Run order: **`init-project` → `init-module` → `init-entity`**. Run `init-entity` once per entity; re-run it to add a second entity into the same module (each run appends to the same barrels + `<module>.module.ts` arrays). Use when the plan asks to:

- "Thêm entity X" / "tạo CRUD cho X" / "add a record type to the `crm` module"
- "Scaffold the `task` / `customer` / `invoice` entity with full CRUD"
- "Add an entity + its repository, service, controller, validation"

**Output:** an entity wired end-to-end. After this step `npm run build` typechecks the new entity and its stack, and (with a running Postgres + `synchronize`) the routes `POST /<module>/<entity>/paging`, `GET /<module>/<entity>/:id`, `POST /<module>/<entity>`, `PUT /<module>/<entity>/:id`, `DELETE /<module>/<entity>/:id` resolve.

### Critical write-target rule

**All generated files are written to the TARGET backend project** (the one `init-project` / `init-module` created), NEVER into this agent repo (`sdcorejs-agent`). The templates below are the source of truth; render them into the target project's `src/modules/<module>/` and `base/shared/<module>/`.

### Persona Step 0 (non-tech mode)

If the persona is **non-technical**, open with plain language before generating, e.g.:

> "I'll add a new record type — `<entity>` — to your `<module>` area: where it's stored, the rules for filling it in, and the endpoints to list, view, create, edit, and delete it. After this, the screen builder can show it in the portal."

Then confirm only the blocking inputs (entity name + its fields). For a technical persona, skip the narration.

---

## Profile (read FIRST)

Read `profile` from `<target>/.sdcorejs/summary.md` (default `simple`). The entity (Step 1),
DTO (Step 3), and service `mapDTO` (Step 4) differ by profile; the repository (Step 2),
module wiring (Step 7), and permission codes (Step 8) are profile-independent. The
controller (Step 6) shares its route shape across profiles but differs in the **auth guard**
(`AdminAuthGuard` enterprise / core `AuthGuard` simple) and the **DTO import path** — see
Step 6. Emit ONLY the chosen profile's templates. `enterprise` output is unchanged from
prior versions.

---

## Source of truth — core package

Read [`_refs/nestjs/core-catalog.md`](../core-catalog.md) for the canonical export inventory + import sub-paths BEFORE generating. Every import in the templates below MUST match a sub-path the catalog documents (`@sdcorejs/nestjs`, `/orm`, `/permission`, `/validation`). Do not invent imports. The building blocks come from the catalog's "ORM building blocks" section:

- `BaseEntity` (extended via the **app's local** `src/common/base-entity.ts`, NOT the lib base — see Step 1), `@Scoped` / `@SearchableFields` decorators (`/orm`).
- `BaseRepository<T>` + `IBaseRepository<T>` (`/orm`).
- `BaseService<T, TDto>` + `IBaseService<T, TDto>` + the abstract `mapDTO` contract (`/orm`).
- `BaseController<T, TDto>` (auto-mounts `POST /search`, `POST /paging`, `GET /all`, `GET /:id`, `DELETE /:id`) + `ApiResponse` (`/orm`, re-exported at root).
- `@HasPermission` + `AuthGuard` (`/permission`); `ZodValidationGuard` (`/validation`).

The Symbol-I-token DI pattern (`export interface I… extends I…` + `export const I… = Symbol('I…')` + `export class … implements I…`) is the same one `init-module`'s provider-binding section documents — `init-entity` is what actually emits one per entity.

---

## Input resolution

Before generating, confirm:

1. **Module** (required) — the existing module this entity belongs to. Placeholder `<module>` (e.g. `crm`); PascalCase `<Module>` (e.g. `Crm`). The module MUST already exist (`init-module`); if not, run `init-module` first.
2. **Entity name** (required) — singular, PascalCase class `<Entity>` (e.g. `Task`), camelCase file/route segment `<entity>` (e.g. `task`), DB table `<table>` (kebab or snake; the ref app uses kebab — e.g. `task`, `deal-record`). Keep all three derived from one name.
3. **Fields** (required) — the column list: name, type (`string` / `enum` / `number` / `boolean` / `jsonb` / `timestamptz` / `uuid`), nullable, required-for-create. Map each to a `@Column` (Step 1), a DTO field (Step 3), and a Zod rule (Step 5).
4. **Relations** (optional) — `@ManyToOne` foreign keys to other entities in the **same** module (no cross-schema FK — cross-module data goes through service I-tokens).
5. **Searchable fields** (optional) — which columns `search()` matches: `exact` (equality) vs `contain` (LIKE), plus an optional `activeColumn`. Defaults: `exact: ['code']`, `contain: ['name']` if those columns exist.

> Naming derivation used throughout: `<Entity>` = `Task`, `<entity>` = `task`, `<table>` = `task`, DTO = `TaskDTO`, repo token/class = `ITaskRepository` / `TaskRepository`, service = `ITaskService` / `TaskService`, controller = `TaskController`, schemas = `TaskCreateSchema` / `TaskUpdateSchema`, permission model = `<module>_<entity>` = `crm_task`. Keep all consistent.

---

## Generation steps

### Step 1 — Entity (`src/modules/<module>/entities/<entity>.entity.ts`)

**Profile: enterprise**

The TypeORM entity. Sets the per-module Postgres schema, declares the tenancy columns with `@Scoped`, the typed business columns, optional relations, and the `@SearchableFields` matcher. *(Ground: ref app `src/modules/crm/entities/task.entity.ts` — `@Entity({ schema: 'crm', name: 'task', orderBy: { createdAt: 'DESC' } })`, `@Index(['departmentCode'])`, `@Unique(['departmentCode', 'code'])`, `@Scoped()` on `tenantCode` / `departmentCode`, the typed `@Column`s, the `@ManyToOne` + `@JoinColumn` relation to `TaskStatus` / `TaskType`.)*

```ts
import { Scoped, SearchableFields } from '@sdcorejs/nestjs/orm';
import { BaseEntity } from 'src/common/base-entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
// import { <Parent> } from './<parent>.entity';   // relation target in the SAME module (optional)
// import { <SomeEnum> } from '@shared/<module>';   // enum shared with the DTO (optional)

/**
 * <Entity> — lives in the `<module>` Postgres schema. Extends the app's LOCAL BaseEntity
 * (src/common/base-entity), NOT the lib `@sdcorejs/nestjs/orm` BaseEntity: the local base
 * declares the exact audit columns the live schema uses (createdAt / modifiedAt / deletedAt +
 * createdBy / modifier / deletor). The lib BaseRepository/BaseService/BaseController are
 * column-name-agnostic, so they operate on this base unchanged.
 */
@Entity({
  schema: '<module>',
  name: '<table>',
  orderBy: { createdAt: 'DESC' },
})
@Index(['departmentCode'])
@Unique(['departmentCode', 'code'])
@SearchableFields({ exact: ['code'], contain: ['name'], activeColumn: 'isActive' })
export class <Entity> extends BaseEntity {
  // ---- Tenancy scope columns (auto-filled on write + filtered on read by the tenancy strategy) ----
  @Column({ type: 'varchar', length: 64, update: false })
  @Scoped()
  tenantCode: string;

  @Column({ type: 'varchar', length: 64, update: false })
  @Scoped()
  departmentCode: string;

  // ---- Business columns (one @Column per field from Input #3) ----
  @Column({ type: 'varchar', length: 64, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 1024 })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  // enum column (the enum itself is declared in the @shared DTO model so FE + BE share it)
  // @Column({ type: 'enum', enum: <SomeEnum>, default: <SomeEnum>.DEFAULT, nullable: true })
  // status: <SomeEnum>;

  // jsonb column (structured value)
  // @Column({ type: 'jsonb', nullable: true })
  // metadata: Record<string, unknown>;

  // timestamptz column (stored as ISO string)
  // @Column({ type: 'timestamptz', nullable: true })
  // dueDate: string;

  @Column({ default: true })
  isActive: boolean;

  // ---- Relation (same-module FK only). The uuid scalar + the @ManyToOne both present:
  //      write/read the scalar `<parent>Id`; eager-join the object via the relation. ----
  // @Column({ type: 'uuid' })
  // <parent>Id: string;
  //
  // @ManyToOne(() => <Parent>)
  // @JoinColumn({ name: '<parent>Id' })
  // <parent>: <Parent>;
}
```

> **Why the LOCAL base, not the lib base (enterprise-only).** `init-project` emits `src/common/base-entity.ts`. In the enterprise profile this local base hand-declares the legacy audit columns the live schema uses (`modifiedAt` not `updatedAt`, plus `deletor` / `creator`). The lib `BaseRepository`/`BaseService`/`BaseController` are column-name-agnostic, so they operate on this base unchanged. This "extend the LOCAL base, NOT the lib base" rationale is **enterprise-only** — it exists because enterprise apps migrate a legacy schema. *(Ground: ref app `src/common/base-entity.ts` header comment + every `crm/entities/*.entity.ts` importing `BaseEntity` from `src/common/base-entity`.)*

> **`@Scoped()` (alias of `@TenantScoped()`)** marks the columns the tenancy strategy auto-fills on write and filters on read (catalog "Decorators" + "Tenancy & audit"). The ref app scopes by `tenantCode` + `departmentCode`. `@SearchableFields` declares which columns `BaseRepository.search(keyword)` matches; drop `activeColumn` if the entity has no active flag.

---

**Profile: simple**

The TypeORM entity for a single-tenant app. No tenancy columns (`tenantCode`/`departmentCode`), no `@Scoped`, no `@Index`/`@Unique(['departmentCode', ...])`. `src/common/base-entity` in the simple profile re-exports the lib `WithAudit(BaseEntity)` — audit columns are `createdAt`/`updatedAt`/`deletedAt`/`createdBy`/`modifiedBy` (no legacy `modifiedAt` contradiction).

```ts
import { SearchableFields } from '@sdcorejs/nestjs/orm';
import { BaseEntity } from 'src/common/base-entity';
import { Column, Entity } from 'typeorm';

/**
 * <Entity> — lives in the `<module>` Postgres schema. Extends the app BaseEntity
 * (src/common/base-entity), which in the simple profile re-exports the lib
 * WithAudit(BaseEntity): createdAt / updatedAt / deletedAt + createdBy / modifiedBy.
 * No tenancy columns (single-tenant).
 */
@Entity({ schema: '<module>', name: '<table>', orderBy: { createdAt: 'DESC' } })
@SearchableFields({ exact: ['code'], contain: ['name'], activeColumn: 'isActive' })
export class <Entity> extends BaseEntity {
  @Column({ type: 'varchar', length: 64, nullable: true })
  code: string;

  @Column({ type: 'varchar', length: 1024 })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;
  // business columns from Input #3 here; same-module @ManyToOne relations as in the enterprise template
}
```

> No `@Scoped` tenancy columns, no `@Index`/`@Unique(['departmentCode', ...])`. Audit columns come from the lib `WithAudit` (so `updatedAt`/`modifiedBy`, NOT the enterprise legacy `modifiedAt`) — no base-class contradiction. The "extend the LOCAL base, NOT the lib base" rationale in the enterprise block is enterprise-only (it exists because enterprise migrates a legacy schema); in the simple profile `src/common/base-entity` simply re-exports the lib base.

---

**Append the barrel line** to `src/modules/<module>/entities/index.ts` (idempotent — skip if present):

```ts
export * from './<entity>.entity';
```

### Step 2 — Repository (`src/modules/<module>/repositories/<entity>.repository.ts`)

The Symbol-I-token DI pattern from the catalog: an interface, a same-named `Symbol` const (declaration merging), and the concrete class extending `BaseRepository`. `{ logHistory: true }` records write history (catalog `BaseRepository` options). *(Ground: ref app `src/modules/crm/repositories/task.repository.ts` lines 1-14.)*

```ts
import { BaseRepository, IBaseRepository } from '@sdcorejs/nestjs/orm';
import { InjectDataSource } from '@nestjs/typeorm';
import { <Entity> } from 'src/modules/<module>/entities';
import { DataSource } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface I<Entity>Repository extends IBaseRepository<<Entity>> {}
export const I<Entity>Repository = Symbol('I<Entity>Repository');

export class <Entity>Repository extends BaseRepository<<Entity>> implements I<Entity>Repository {
  constructor(@InjectDataSource() datasource: DataSource) {
    super(<Entity>, datasource, { logHistory: true });
  }
}
```

> The interface, the `const Symbol`, and the class **share one identifier** — TS lets a `const` + an `interface` co-exist under the same name, and the class is a separate value. Consumers `@Inject(I<Entity>Repository)` the token; the module binds `{ provide: I<Entity>Repository, useClass: <Entity>Repository }` (Step 7). The empty-interface eslint-disable is required (the interface intentionally adds no members beyond `IBaseRepository`; add entity-specific repo methods here when a feature needs them).

**Append the barrel line** to `src/modules/<module>/repositories/index.ts`:

```ts
export * from './<entity>.repository';
```

### Step 3 — DTO

**Profile: enterprise** (`base/shared/<module>/<entity>.model.ts`, aliased `@shared`)

The DTO is the read shape the service returns and the FE consumes. It lives in the shared kernel (`@shared`, `init-project` Step 7) so the Angular portal imports the SAME type. Extends the `Dto` base (`id` + the `editable` / `deletable` / `restorable` capability flags + audit fields). *(Ground: ref app `base/shared/crm/task.model.ts` — `export type TaskDTO = Dto<TaskDTO> & Required<TaskSaveReq> & { … }`; and `base/shared/entity/dto.model.ts` — the `Dto` base with `editable?` / `deletable?` / `restorable?`.)*

```ts
import { Dto } from '@shared/entity';
// import { <SomeEnum> } from './<some>.model';   // enum shared with the entity column (optional)

// Optional: a request/save shape the controller body validates against (mirrors the Zod create schema).
export interface <Entity>SaveReq {
  code?: string;
  name?: string;
  description?: string;
  // status?: <SomeEnum>;
  // <parent>Id?: string;
  isActive?: boolean;
}

/**
 * <Entity> read DTO — returned by <Entity>Service.mapDTO, consumed by the portal. Extends the shared
 * `Dto` base (id + capability flags). `deletable` / `restorable` are permission-gated in mapDTO so the
 * portal can hide actions the current user cannot perform.
 */
export interface <Entity>DTO extends Dto<<Entity>DTO> {
  // id, tenantCode?, departmentCode?, editable?, deletable?, restorable?, createdAt?, modifiedAt? — from Dto
  code: string;
  name: string;
  description: string;
  // status: <SomeEnum>;
  // <parent>Id: string;
  isActive: boolean;
}
```

**Append the barrel line** to `base/shared/<module>/index.ts` (created by the first entity in this module; create the file with the single line if missing):

```ts
export * from './<entity>.model';
```

> If `base/shared/<module>/` does not yet exist (this is the first entity in a freshly-`init-module`-d module), create the folder + an `index.ts` containing only `export * from './<entity>.model';`. Subsequent entities append their line. The `Dto` base + `@shared/entity` come from `init-project` Step 7.

---

**Profile: simple** (`src/modules/<module>/dto/<entity>.dto.ts`)

In the simple profile the DTO lives inside the module itself (no `base/shared/` kernel, no `@shared` alias). It imports the `Dto` base from `src/common/dto.ts` (emitted by `init-project` Step 6 for the simple profile). No `tenantCode`/`departmentCode` fields.

```ts
import { Dto } from 'src/common/dto';

/** <Entity> read DTO — returned by <Entity>Service.mapDTO, consumed by the portal. */
export interface <Entity>DTO extends Dto {
  // id, editable?, deletable?, restorable?, createdAt?, updatedAt? — from Dto
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
}
```

> Simple profile has no `base/shared/<module>/` folder and no `base/shared/<module>/index.ts` barrel. The DTO is imported from `src/modules/<module>/dto` (no `@shared` alias needed). The controller (Step 6) and service (Step 4) import from this path instead of `@shared/<module>`.

### Step 4 — Service (`src/modules/<module>/services/<entity>.service.ts`)

**Profile: enterprise**

The service maps entities → DTOs and exposes the I-token. Extends `BaseService` (which mirrors the repo's read/write and runs each result through the abstract `mapDTO`). The permission gates use the `SdContext` facade (`init-project` Step 6) — `hasPermission('<module>_<entity>', '<action>')` joins to the flat code `<module>_<entity>:<action>` the permission strategy loads. *(Ground: ref app `src/modules/crm/services/task.service.ts` lines 16-38 (interface + Symbol + class + constructor `@Inject(ITaskRepository)`) and lines 506-577 (`mapDTO` with `hasPermission('crm_task', 'delete')` gating `deletable`).)*

```ts
import { Inject, Injectable } from '@nestjs/common';
import { BaseService, IBaseService } from '@sdcorejs/nestjs/orm';
import { SdContext } from 'src/common/context/sd-context';
import { <Entity>DTO } from '@shared/<module>';
import { <Entity> } from 'src/modules/<module>/entities';
import { I<Entity>Repository } from 'src/modules/<module>/repositories';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface I<Entity>Service extends IBaseService<<Entity>, <Entity>DTO> {}
export const I<Entity>Service = Symbol('I<Entity>Service');

@Injectable()
export class <Entity>Service extends BaseService<<Entity>, <Entity>DTO> implements I<Entity>Service {
  // Cross-module deps inject OTHER modules' service I-tokens here (e.g. @Inject(IUserService) user: IUserService).
  constructor(@Inject(I<Entity>Repository) repository: I<Entity>Repository) {
    super(repository);
  }

  /**
   * Entity → DTO. BaseService routes every read result through this. Permission flags let the portal
   * hide actions the user cannot perform — gated via SdContext.hasPermission('<module>_<entity>', action).
   */
  mapDTO = (entity: <Entity> | undefined | null): <Entity>DTO | undefined | null => {
    if (!entity) {
      return undefined;
    }
    const { hasPermission } = SdContext;
    const { id, tenantCode, departmentCode, code, name, description, isActive, createdAt } = entity;
    return {
      id,
      tenantCode,
      departmentCode,
      code,
      name,
      description,
      isActive,
      createdAt,
      editable: hasPermission('<module>_<entity>', 'update'),
      deletable: hasPermission('<module>_<entity>', 'delete'),
      restorable: hasPermission('<module>_<entity>', 'delete'),
    };
  };
}
```

> **`mapDTO` is the single abstract method `BaseService` requires.** Return `undefined` for a null entity (the ref app does — the base maps arrays/pages element-wise). Gate `deletable` / `restorable` (and any `editable`) on `SdContext.hasPermission('<module>_<entity>', '<action>')` so the portal's row actions reflect the caller's permissions. Add entity-specific service methods (e.g. `createDTO` / a domain action) to the interface + class as the feature needs them; the base already provides `create` / `update` / `paging` / `detail` / `delete` / `softDelete` / `restore`.

---

**Profile: simple**

Same `BaseService` extension, but injects the lib `ContextService` directly (no `SdContext` facade — simple apps do not scaffold `src/common/context/sd-context.ts`). DTO is imported from `src/modules/<module>/dto` (no `@shared` alias). No tenancy fields in the returned object.

```ts
import { Inject, Injectable } from '@nestjs/common';
import { BaseService, IBaseService } from '@sdcorejs/nestjs/orm';
import { ContextService } from '@sdcorejs/nestjs/context';
import { <Entity>DTO } from 'src/modules/<module>/dto/<entity>.dto';
import { <Entity> } from 'src/modules/<module>/entities';
import { I<Entity>Repository } from 'src/modules/<module>/repositories';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface I<Entity>Service extends IBaseService<<Entity>, <Entity>DTO> {}
export const I<Entity>Service = Symbol('I<Entity>Service');

@Injectable()
export class <Entity>Service extends BaseService<<Entity>, <Entity>DTO> implements I<Entity>Service {
  constructor(
    @Inject(I<Entity>Repository) repository: I<Entity>Repository,
    private readonly ctx: ContextService,
  ) {
    super(repository);
  }

  mapDTO = (entity: <Entity> | undefined | null): <Entity>DTO | undefined | null => {
    if (!entity) return undefined;
    const { id, code, name, description, isActive, createdAt } = entity;
    return {
      id, code, name, description, isActive, createdAt,
      editable: this.ctx.hasPermission('<module>_<entity>:update'),
      deletable: this.ctx.hasPermission('<module>_<entity>:delete'),
      restorable: this.ctx.hasPermission('<module>_<entity>:delete'),
    };
  };
}
```

> The lib `ContextService` (from `@sdcorejs/nestjs/context`) exposes `hasPermission(code)` taking the full flat code `<module>_<entity>:<action>` — no two-arg split form. There is no `SdContext` facade in the simple profile. `ContextService` must be added to the module's `providers` array (or imported via a shared module) for DI to resolve. The catalog confirms this export path.

---

**Append the barrel line** to `src/modules/<module>/services/index.ts`:

```ts
export * from './<entity>.service';
```

### Step 5 — Zod schemas (append to `src/modules/<module>/schemas/<module>.schema.ts`)

`init-module` created `schemas/<module>.schema.ts` with the `reqStr` helper. Append a Create/Update pair per entity. The create schema enforces required fields; the update schema is `.partial()` (every field optional, but any present field must still satisfy its rule). Error messages are i18n CODES the validation guard surfaces and the app's exception filter localizes. *(Ground: ref app `src/modules/crm/schemas/crm.schema.ts` — `reqStr` helper + `TaskStatusCreateSchema` (with `z.enum(TaskStatusCategory, { error: '…' })`) + `TaskCreateSchema` + `TaskUpdateSchema = TaskCreateSchema.partial()`.)*

```ts
// ----- <entity> ----- (append below the reqStr helper / existing schemas)
export const <Entity>CreateSchema = z.object({
  code: reqStr('<module>.<entity>.code.required'),
  name: reqStr('<module>.<entity>.name.required'),
  description: z.string().trim().optional(),
  // status: z.enum(<SomeEnum>, { error: '<module>.<entity>.status.required' }),  // required enum
  // <parent>Id: reqStr('<module>.<entity>.<parent>Id.required'),                 // required FK
  isActive: z.boolean().optional(),
});
export const <Entity>UpdateSchema = <Entity>CreateSchema.partial();
```

> Required string → `reqStr('<module>.<entity>.<field>.required')` (trimmed, non-empty). Optional string → `z.string().trim().optional()`. Required enum → `z.enum(<SomeEnum>, { error: '<module>.<entity>.<field>.required' })`. Optional enum → append `.optional()`. The codes follow the `<module>.<entity>.<field>.<rule>` namespace; register them in the module's i18n catalog so the localized message resolves (otherwise the raw code is returned).

### Step 6 — Controller (`src/modules/<module>/controllers/<entity>.controller.ts`)

The controller extends `BaseController` (which auto-mounts `POST /search`, `POST /paging`, `GET /all`, `GET /:id`, `DELETE /:id`, all wrapped in `ApiResponse`), and adds only the two write routes with per-route `@HasPermission` + `ZodValidationGuard`. The class-level `@UseGuards(...)` authenticates every route + loads permission codes into context — the guard used differs by profile. *(Ground: ref app `src/modules/crm/controllers/task.controller.ts` — `@Controller('task') @UseGuards(AdminAuthGuard) extends BaseController<Task, TaskDTO>`, `@Post() @HasPermission('crm_task:create') @UseGuards(ZodValidationGuard(TaskCreateSchema))`, `@Put(':id') @UseGuards(ZodValidationGuard(TaskUpdateSchema))`.)*

**Profile: enterprise**

```ts
import { BaseController, ApiResponse } from '@sdcorejs/nestjs/orm';
import { HasPermission } from '@sdcorejs/nestjs/permission';
import { ZodValidationGuard } from '@sdcorejs/nestjs/validation';
import { AdminAuthGuard } from 'src/common/admin-auth.guard';
import { Body, Controller, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { <Entity>DTO } from '@shared/<module>';
import { <Entity> } from 'src/modules/<module>/entities';
import { <Entity>CreateSchema, <Entity>UpdateSchema } from 'src/modules/<module>/schemas/<module>.schema';
import { I<Entity>Service } from 'src/modules/<module>/services';

/**
 * <Entity> CRUD. Inherits POST /search, POST /paging, GET /all, GET /:id, DELETE /:id from
 * BaseController. Class-level AdminAuthGuard authenticates + loads permission codes into context.
 * create/update add per-route @HasPermission + ZodValidationGuard.
 */
@Controller('<entity>')
@UseGuards(AdminAuthGuard)
export class <Entity>Controller extends BaseController<<Entity>, <Entity>DTO> {
  constructor(@Inject(I<Entity>Service) private readonly service: I<Entity>Service) {
    super(service);
  }

  @Post()
  @HasPermission('<module>_<entity>:create')
  @UseGuards(ZodValidationGuard(<Entity>CreateSchema))
  async create(@Body() req: <Entity>DTO) {
    return ApiResponse.ok(await this.service.create(req));
  }

  @Put(':id')
  @HasPermission('<module>_<entity>:update')
  @UseGuards(ZodValidationGuard(<Entity>UpdateSchema))
  async update(@Param('id') id: string, @Body() req: <Entity>DTO) {
    return ApiResponse.ok(await this.service.update(id, req));
  }
}
```

---

**Profile: simple**

Uses the core `AuthGuard` (`@sdcorejs/nestjs/permission`) directly — the simple profile does NOT scaffold `AdminAuthGuard`. The `AuthGuard` loads codes via the `RolePermissionStrategy` (realm roles).

```ts
import { BaseController, ApiResponse } from '@sdcorejs/nestjs/orm';
import { AuthGuard, HasPermission } from '@sdcorejs/nestjs/permission';
import { ZodValidationGuard } from '@sdcorejs/nestjs/validation';
import { Body, Controller, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { <Entity>DTO } from 'src/modules/<module>/dto/<entity>.dto';
import { <Entity> } from 'src/modules/<module>/entities';
import { <Entity>CreateSchema, <Entity>UpdateSchema } from 'src/modules/<module>/schemas/<module>.schema';
import { I<Entity>Service } from 'src/modules/<module>/services';

/**
 * <Entity> CRUD. Inherits POST /search, POST /paging, GET /all, GET /:id, DELETE /:id from
 * BaseController. Class-level core AuthGuard authenticates + loads permission codes (the
 * RolePermissionStrategy maps Keycloak realm roles → codes). create/update add per-route
 * @HasPermission + ZodValidationGuard.
 */
@Controller('<entity>')
@UseGuards(AuthGuard)
export class <Entity>Controller extends BaseController<<Entity>, <Entity>DTO> {
  constructor(@Inject(I<Entity>Service) private readonly service: I<Entity>Service) {
    super(service);
  }

  @Post()
  @HasPermission('<module>_<entity>:create')
  @UseGuards(ZodValidationGuard(<Entity>CreateSchema))
  async create(@Body() req: <Entity>DTO) {
    return ApiResponse.ok(await this.service.create(req));
  }

  @Put(':id')
  @HasPermission('<module>_<entity>:update')
  @UseGuards(ZodValidationGuard(<Entity>UpdateSchema))
  async update(@Param('id') id: string, @Body() req: <Entity>DTO) {
    return ApiResponse.ok(await this.service.update(id, req));
  }
}
```

> **Inherited routes can be permission-gated by overriding.** `BaseController` mounts `paging` / `detail` / `delete` without `@HasPermission`. To gate them, override the method in the subclass with the decorator and delegate to `super`, e.g.:
> ```ts
> @Delete(':id')
> @HasPermission('<module>_<entity>:delete')
> override async delete(@Param('id') id: string) {
>   return super.delete(id);
> }
> ```
> The ref app gates only the write + custom routes (`@HasPermission('crm_task:create')`, `@HasPermission('crm_task:view_mine')`) and leaves paging/detail open under the class guard — choose per feature. `ApiResponse.ok(...)` is the success envelope (catalog "Response & errors").

**Append the barrel line** to `src/modules/<module>/controllers/index.ts`:

```ts
export * from './<entity>.controller';
```

### Step 7 — Module wiring (edit `src/modules/<module>/<module>.module.ts`)

Register the entity's four building blocks in the existing `@Module`. **All four edits MUST be idempotent** — skip any entry already present (re-running `init-entity` for the same `<entity>` makes no duplicate edits). *(Ground: ref app `src/modules/crm/crm.module.ts` — `TypeOrmModule.forFeature([…, Task])`, `controllers: […, TaskController]`, `providers: [{ provide: ITaskRepository, useClass: TaskRepository }, { provide: ITaskService, useClass: TaskService }]`, `exports: […, ITaskService]`.)*

1. **Imports** — add `<Entity>` to `TypeOrmModule.forFeature([...])` (so the repository can resolve the TypeORM repo). Update the `import { … } from './entities';` line.
2. **Controllers** — add `<Entity>Controller` to `controllers: [...]`. Update `import { … } from './controllers';`.
3. **Providers** — add BOTH bindings to `providers: [...]`:
   ```ts
   { provide: I<Entity>Repository, useClass: <Entity>Repository },
   { provide: I<Entity>Service, useClass: <Entity>Service },
   ```
   Update `import { … } from './repositories';` (add `I<Entity>Repository`, `<Entity>Repository`) and `import { … } from './services';` (add `I<Entity>Service`, `<Entity>Service`).
4. **Exports** — add `I<Entity>Service` to `exports: [...]` so other modules can `@Inject` it as a DI port (the repository + concrete class are NEVER exported — only the service token).

After the edits the module reads (entity-relevant lines shown):

```ts
import { /* …existing…, */ <Entity> } from './entities';
import { /* …existing…, */ <Entity>Controller } from './controllers';
import { /* …existing…, */ I<Entity>Repository, <Entity>Repository } from './repositories';
import { /* …existing…, */ I<Entity>Service, <Entity>Service } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([ /* …existing…, */ <Entity> ]),
  ],
  controllers: [ /* …existing…, */ <Entity>Controller ],
  providers: [
    // …existing…
    { provide: I<Entity>Repository, useClass: <Entity>Repository },
    { provide: I<Entity>Service, useClass: <Entity>Service },
  ],
  exports: [ /* …existing…, */ I<Entity>Service ],
})
export class <Module>Module {}
```

> **Idempotency check:** before editing, scan `<module>.module.ts` for each token (`<Entity>` in `forFeature`, `<Entity>Controller` in controllers, `I<Entity>Repository` / `I<Entity>Service` provider bindings, `I<Entity>Service` in exports). Skip any that already appear. The four-line provider/controller/forFeature/export contribution is exactly the pattern `init-module`'s "Provider-binding pattern" section documents `init-entity` would emit.

### Step 8 — Permission codes + verify

**Permission codes emitted by this stack** (register them in your permission matrix / admin module so `AppPermissionStrategy.load()` can grant them):

| Code | Where enforced |
|---|---|
| `<module>_<entity>:create` | `@HasPermission` on `POST /<module>/<entity>` |
| `<module>_<entity>:update` | `@HasPermission` on `PUT /<module>/<entity>/:id` + `mapDTO` `editable` |
| `<module>_<entity>:delete` | `mapDTO` `deletable` / `restorable` (gate the inherited `DELETE` by overriding — Step 6) |
| `<module>_<entity>:list` | optional — gate the inherited `POST /paging` by overriding |
| `<module>_<entity>:view` | optional — gate the inherited `GET /:id` by overriding |

> The model segment is `<module>_<entity>` (underscore-joined); the action is the suffix after `:`. `@HasPermission('<module>_<entity>:create')` (colon form) and `SdContext.hasPermission('<module>_<entity>', 'create')` (split form) refer to the SAME code — the facade joins the two args with `:`. Codes are checked by membership against the flat list `AppPermissionStrategy.load()` returns (`init-project` Step 6). Until the matrix grants them, the routes deny (403) and `mapDTO` flags resolve `false`.

**Verify:**

1. `npm run build` (nest build) — TypeScript typecheck gate. Confirms the entity / repo / service / controller / schema / DTO + the module wiring all compile and the four DI tokens resolve.
2. With a running Postgres + `DB_SYNCHRONIZE=true`, `npm run start:dev` boots: TypeORM creates the `<table>` table in the `<module>` schema (`ensureSchemas()` already created the schema). The routes resolve under `/<module>/<entity>` (the module's `RouterModule.register` prefix from `init-module` Step 4a).
3. **Integration tests** use the core `pg-mem` fixture (in-memory Postgres) — the entity/repo/service can be exercised without a live DB. (`sdcorejs-test` / the testing skills own the test scaffolding; this pack only emits production code.)

---

## Expected files (after init-entity for one `<entity>`)

**Profile: enterprise**

```
src/modules/<module>/
├── entities/<entity>.entity.ts            # @Entity({ schema, name, orderBy }) + @Scoped tenancy cols
├── entities/index.ts                      # + export * from './<entity>.entity'
├── repositories/<entity>.repository.ts    # I<Entity>Repository token + <Entity>Repository class
├── repositories/index.ts                  # + export * from './<entity>.repository'
├── services/<entity>.service.ts           # I<Entity>Service token + <Entity>Service (SdContext mapDTO)
├── services/index.ts                      # + export * from './<entity>.service'
├── controllers/<entity>.controller.ts     # <Entity>Controller extends BaseController + create/update
├── controllers/index.ts                   # + export * from './<entity>.controller'
├── schemas/<module>.schema.ts             # + <Entity>CreateSchema / <Entity>UpdateSchema
└── <module>.module.ts                     # + forFeature/controllers/providers/exports entries

base/shared/<module>/
├── <entity>.model.ts                      # <Entity>DTO (+ optional <Entity>SaveReq), extends Dto
└── index.ts                               # + export * from './<entity>.model'  (created if first entity)
```

**Profile: simple**

```
src/modules/<module>/
├── entities/<entity>.entity.ts            # @Entity({ schema, name, orderBy }) — no @Scoped tenancy cols
├── entities/index.ts                      # + export * from './<entity>.entity'
├── repositories/<entity>.repository.ts    # I<Entity>Repository token + <Entity>Repository class
├── repositories/index.ts                  # + export * from './<entity>.repository'
├── services/<entity>.service.ts           # I<Entity>Service token + <Entity>Service (ContextService mapDTO)
├── services/index.ts                      # + export * from './<entity>.service'
├── dto/<entity>.dto.ts                    # <Entity>DTO extends Dto (from src/common/dto)
├── controllers/<entity>.controller.ts     # <Entity>Controller extends BaseController + create/update
├── controllers/index.ts                   # + export * from './<entity>.controller'
├── schemas/<module>.schema.ts             # + <Entity>CreateSchema / <Entity>UpdateSchema
└── <module>.module.ts                     # + forFeature/controllers/providers/exports entries

# No base/shared/<module>/ folder in simple profile
```

---

## Verification checklist

- `entities/<entity>.entity.ts` exists, `@Entity({ schema: '<module>', name: '<table>' })`, extends `src/common/base-entity`, `@SearchableFields(...)`.
  - **Enterprise only:** `@Scoped()` on `tenantCode` / `departmentCode` columns, `@Index(['departmentCode'])`, `@Unique(['departmentCode', 'code'])`.
  - **Simple only:** no tenancy columns, no `@Scoped`, no `@Index`/`@Unique` on tenancy fields. Audit columns are `updatedAt`/`modifiedBy` (lib `WithAudit`) — no `modifiedAt`.
- `repositories/<entity>.repository.ts` exports `I<Entity>Repository` (interface + Symbol) + `<Entity>Repository extends BaseRepository<<Entity>>`. (profile-independent)
- **Enterprise only:** `base/shared/<module>/<entity>.model.ts` exports `<Entity>DTO extends Dto<...>` with `deletable?` / `restorable?`; barrel at `base/shared/<module>/index.ts`.
- **Simple only:** `src/modules/<module>/dto/<entity>.dto.ts` exports `<Entity>DTO extends Dto` (from `src/common/dto`); no `base/shared/<module>/` folder.
- `services/<entity>.service.ts` exports `I<Entity>Service` (interface + Symbol) + `<Entity>Service extends BaseService<...>` with permission-gated `mapDTO`.
  - **Enterprise:** `mapDTO` uses `SdContext.hasPermission('<module>_<entity>', '<action>')` and includes `tenantCode`/`departmentCode` in the returned DTO.
  - **Simple:** `mapDTO` injects `ContextService` and uses `this.ctx.hasPermission('<module>_<entity>:<action>')`; no tenancy fields in the returned DTO.
- `schemas/<module>.schema.ts` has `<Entity>CreateSchema` + `<Entity>UpdateSchema = <Entity>CreateSchema.partial()` with i18n error codes. (profile-independent)
- `controllers/<entity>.controller.ts` exports `<Entity>Controller extends BaseController<...>` with `@HasPermission` + `ZodValidationGuard` on create/update. **Enterprise:** under `@UseGuards(AdminAuthGuard)`, DTO imported from `@shared/<module>`. **Simple:** under `@UseGuards(AuthGuard)` (core, from `@sdcorejs/nestjs/permission`), DTO imported from `src/modules/<module>/dto/<entity>.dto`.
- All four barrels (`entities` / `repositories` / `services` / `controllers`) re-export the new files. Enterprise also has `base/shared/<module>/index.ts`.
- `<module>.module.ts` registers `<Entity>` (forFeature), `<Entity>Controller` (controllers), both provider bindings, and `I<Entity>Service` (exports) — exactly once each. (profile-independent)
- `npm run build` typechecks the new stack.
- Re-running `init-entity` for the same `<entity>` makes NO duplicate edits (idempotent).

---

## Example input

```text
Thêm entity `task` vào module `crm` (CRUD đầy đủ).
Fields: code (string, optional), name (string, required), description (string, optional),
priority (enum LOW/MEDIUM/HIGH, default MEDIUM), dueDate (timestamptz, optional),
statusId (uuid, FK → TaskStatus cùng module), isActive (boolean, default true).
Search: exact ['code'], contain ['name'], activeColumn 'isActive'.
```
