> **Reference for the `nestjs-write-code` orchestrator.** Loaded on demand and ALWAYS run
> right after `init-project`, BEFORE any domain `init-module`/`init-entity`. Not a standalone
> skill. Generates the `admin` module — the project's authn/authz authority.

# Init Admin — Authn/Authz Module (`@sdcorejs/nestjs`)

## Purpose / when to use
Generate the always-on `admin` module: app-DB authorization (role + permission, flat
`<module>_<entity>:<action>` codes) + Keycloak Admin API proxy for account lifecycle. Owns the
project `IPermissionStrategy` and the user-lookup `JwtStrategy`. Run order:
`init-project → init-admin → init-module → init-entity → actions`.

## Source of truth — core package
Read [`_refs/nestjs/core-catalog.md`](../core-catalog.md) BEFORE generating. Every import MUST match a
documented sub-path. Building blocks: `BaseEntity`/`WithAudit` (via `src/common/base-entity`),
`BaseRepository`/`BaseService`/`BaseController` (`/orm`), `IPermissionStrategy` (`/permission`),
`KeycloakJwtStrategy` (`/jwt`), `ContextService` (`/context`).

## Profile (read FIRST)
Read `profile` from the caller (default `simple`). **simple** = `permission` / `role` / `user`
entities, single realm, no tenancy. **enterprise** = + `tenant` / `department` + 2-level `@Scoped`
(see the "Enterprise extension" section — added later). Emit only the chosen profile's surface.

---

## Generation steps

### Step 1 — Entities

Generate three entities in `src/modules/admin/entities/`. All extend `BaseEntity` from
`src/common/base-entity` (the app-local base, which wraps the lib `WithAudit(BaseEntity)` in the
simple profile). All live in the `admin` Postgres schema. No tenancy columns in the simple profile.

#### `permission.entity.ts` — READ-ONLY init data (seeded; no create/update UI)

```ts
import { BaseEntity } from 'src/common/base-entity';
import { Column, Entity } from 'typeorm';

/**
 * Permission — a flat authorization code of the form `<module>_<entity>:<action>`.
 * Records are seeded by AdminSeedService (or a migration); there is no create/update UI.
 * The `model` column groups permissions by entity for the admin role-editor.
 */
@Entity({ schema: 'admin', name: 'permission' })
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', length: 128, unique: true }) code: string;   // '<module>_<entity>:<action>'
  @Column({ type: 'varchar', length: 256 }) label: string;
  @Column({ type: 'varchar', length: 96 }) model: string;                 // '<module>_<entity>'
  @Column({ type: 'varchar', length: 48 }) action: string;               // 'create' | 'view' | ...
}
```

> `code` is the **full flat authorization code** (`admin_user:create`). `model` is the entity
> segment only (`admin_user`) — used by the role editor to group checkboxes. `action` mirrors the
> suffix after `:`. Keep `code = model + ':' + action` invariant; the seeder enforces it.

#### `role.entity.ts`

```ts
import { BaseEntity } from 'src/common/base-entity';
import { Column, Entity, Unique } from 'typeorm';

/**
 * Role — a named collection of permission codes stored as a flat `text[]` array.
 * `permissions` holds full flat codes (e.g. `['crm_task:create', 'crm_task:view']`).
 * The permission strategy queries roles by `roleCodes` from the JWT then unions the
 * `permissions` arrays to build the caller's effective permission set.
 */
@Entity({ schema: 'admin', name: 'role' })
@Unique(['code'])
export class Role extends BaseEntity {
  @Column({ type: 'varchar', length: 64 }) code: string;
  @Column({ type: 'varchar', length: 256 }) name: string;
  @Column({ type: 'varchar', array: true, default: '{}' }) permissions: string[];  // permission codes
  @Column({ default: true }) isActive: boolean;
}
```

> `permissions` is a `text[]` Postgres column — TypeORM `type: 'varchar', array: true` maps to
> `character varying[]`. Store full flat codes, not model/action pairs. On read, the permission
> strategy unions the arrays for all roles assigned to the caller.

#### `user.entity.ts` — NO password column (Keycloak owns credentials)

```ts
import { BaseEntity } from 'src/common/base-entity';
import { Column, Entity, Unique } from 'typeorm';

/**
 * User — the app-DB mirror of a Keycloak account. Keycloak is the identity authority
 * (passwords, MFA, sessions). This table stores only the authorization attributes:
 * which app roles the user holds (`roleCodes`) and their active status.
 *
 * `keycloakUserId` is the Keycloak sub (UUID). The JWT strategy resolves it on every
 * request and upserts the row if missing. `username` and `email` are cached for display.
 */
@Entity({ schema: 'admin', name: 'user' })
@Unique(['keycloakUserId'])
export class User extends BaseEntity {
  @Column({ type: 'uuid', nullable: true }) keycloakUserId: string;
  @Column({ type: 'varchar', length: 128 }) username: string;
  @Column({ type: 'varchar', length: 256, nullable: true }) email: string;
  @Column({ type: 'varchar', length: 256, nullable: true }) fullName: string;
  @Column({ type: 'varchar', array: true, default: '{}' }) roleCodes: string[];
  @Column({ default: true }) isActive: boolean;
}
```

> No `password` column — Keycloak owns all credentials. `roleCodes` mirrors the user's assigned
> `Role.code` values; the permission strategy joins `User.roleCodes → Role.permissions` to build
> the effective permission set. `keycloakUserId` is the stable join key between Keycloak and
> this table (the JWT `sub` claim).

#### `entities/index.ts` barrel

```ts
// src/modules/admin/entities/index.ts
export * from './permission.entity';
export * from './role.entity';
export * from './user.entity';
```

---

### Step 2 — Repositories

Generate three repository files in `src/modules/admin/repositories/`. Each follows the Symbol
I-token DI pattern documented in `init-entity` Step 2 and in `init-module`'s provider-binding
section: an `interface`, a same-named `Symbol` const (declaration merging), and the concrete
class extending `BaseRepository`. `{ logHistory: true }` records write history (catalog
`BaseRepository` options).

The full example below uses `User`; `Permission` and `Role` follow identically — substitute the
class name and entity reference.

#### `user.repository.ts` (full example)

```ts
import { BaseRepository, IBaseRepository } from '@sdcorejs/nestjs/orm';
import { InjectDataSource } from '@nestjs/typeorm';
import { User } from 'src/modules/admin/entities';
import { DataSource } from 'typeorm';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IUserRepository extends IBaseRepository<User> {}
export const IUserRepository = Symbol('IUserRepository');

export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor(@InjectDataSource() datasource: DataSource) {
    super(User, datasource, { logHistory: true });
  }
}
```

> The interface, the `const Symbol`, and the class **share one identifier** — TypeScript lets a
> `const` + an `interface` co-exist under the same name, and the class is a separate value.
> Consumers `@Inject(IUserRepository)` the token; `admin.module.ts` binds
> `{ provide: IUserRepository, useClass: UserRepository }`. The empty-interface eslint-disable is
> required (the interface intentionally adds no members beyond `IBaseRepository`; add
> entity-specific repo methods here when a feature needs them — e.g. `findByKeycloakUserId`).

#### `permission.repository.ts` and `role.repository.ts`

Follow the same pattern as `user.repository.ts` above. Substitute:

- `User` → `Permission` / `Role`
- `IUserRepository` → `IPermissionRepository` / `IRoleRepository`
- `UserRepository` → `PermissionRepository` / `RoleRepository`

```ts
// permission.repository.ts — paste the user template, replace User with Permission throughout
// role.repository.ts     — paste the user template, replace User with Role throughout
```

#### `repositories/index.ts` barrel

```ts
// src/modules/admin/repositories/index.ts
export * from './permission.repository';
export * from './role.repository';
export * from './user.repository';
```

---

### Step 3 — User-lookup JwtStrategy

Generate `src/common/jwt.strategy.ts`. This strategy **cannot** be wired via
`SdCoreModule.forRoot({ jwt: ... })` because it injects `IUserService` from the `AdminModule`
— doing so would create a circular dependency at bootstrap. Instead, the lib `JwtModule.forRoot`
is registered separately in `app.module.ts` (see Step 7), and the `SdCoreModule` `jwt` key is
**dropped** entirely. This matches the "JWT & Keycloak" section of `core-catalog.md` and the
note in `init-project` Step 7 about replacing the default JWT strategy.

```ts
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { type JwtPayload, KeycloakJwtStrategy } from '@sdcorejs/nestjs/jwt';
import { IUserService } from 'src/modules/admin/services';

@Injectable()
export class JwtStrategy extends KeycloakJwtStrategy {
  constructor(@Inject(IUserService) private readonly users: IUserService) { super(); }
  async validate(payload: JwtPayload) {
    const user = await this.users.internalDetail(payload.sub);   // lookup by keycloakUserId (fallback-sync)
    if (!user || !user.isActive) throw new UnauthorizedException();
    return user;   // carries roleCodes + resolved `permissions` (set by internalDetail)
  }
}
```

> `KeycloakJwtStrategy` (from `@sdcorejs/nestjs/jwt`) handles JWKS verification and expiry. The
> only thing the app-level subclass adds is the user-lookup: `internalDetail` finds the DB row by
> `keycloakUserId` (the JWT `sub` claim) and resolves the flat permission list. The resolved user
> object is stored in the request context and later read by `AppPermissionStrategy` (Step 4).
> If the DB row does not yet exist (first login), `internalDetail` performs a fallback-sync (see
> Step 5 and the Keycloak-proxy task). If the user exists but `isActive` is `false`, a 401 is
> thrown immediately.

---

### Step 4 — AppPermissionStrategy (app-DB)

Generate `src/common/app-permission.strategy.ts`. This class is the project's
`IPermissionStrategy` — it replaces the lib default (Keycloak realm-role mapping) with an
app-DB permission list resolved during `JwtStrategy.validate`.

```ts
import { Injectable } from '@nestjs/common';
import type { IPermissionStrategy } from '@sdcorejs/nestjs/permission';
import { ContextService } from '@sdcorejs/nestjs/context';

/** Permissions were resolved onto the user at JwtStrategy.validate (internalDetail →
 *  roleService.loadPermissions). This strategy returns that flat code list. */
@Injectable()
export class AppPermissionStrategy implements IPermissionStrategy {
  constructor(private readonly ctx: ContextService) {}
  async load(): Promise<string[]> {
    const user = this.ctx.get('user') as { permissions?: string[] } | undefined;
    return user?.permissions ?? [];
  }
}
```

> `ContextService` (from `@sdcorejs/nestjs/context`) stores the resolved user set by
> `JwtStrategy.validate` onto the request context. `AppPermissionStrategy.load()` reads it back —
> no DB round-trip needed on every permission check because `internalDetail` already resolved the
> flat code list. Register this strategy via `SdCoreModule.forRoot({ permission: { strategy:
> AppPermissionStrategy } })` in `app.module.ts` (Step 7).

---

### Step 5 — DTOs + Services

#### DTOs (`src/modules/admin/dto/`)

Generate three DTO files. Each extends `Dto` from `src/common/dto` (emitted by `init-project`
Step 6 for the simple profile). No `@shared` alias needed (simple profile).

```ts
// permission.dto.ts
import { Dto } from 'src/common/dto';
export interface PermissionDTO extends Dto {
  code: string;      // full flat code: '<module>_<entity>:<action>'
  label: string;
  model: string;     // '<module>_<entity>' — groups permissions in the role editor
  action: string;    // 'create' | 'view' | 'update' | 'delete' | ...
}
```

```ts
// role.dto.ts
import { Dto } from 'src/common/dto';
export interface RoleDTO extends Dto {
  code: string;
  name: string;
  permissions: string[];   // flat permission codes stored in this role
  isActive: boolean;
}
```

```ts
// user.dto.ts
import { Dto } from 'src/common/dto';
export interface UserDTO extends Dto {
  keycloakUserId: string;
  username: string;
  email: string;
  fullName: string;
  roleCodes: string[];          // which roles are assigned
  permissions?: string[];       // resolved by internalDetail (not persisted; in-memory only)
  isActive: boolean;
}
```

> `permissions` on `UserDTO` is **not** a DB column — it is populated at runtime by
> `UserService.internalDetail` after calling `RoleService.loadPermissions(roleCodes)`. The field
> is intentionally `optional` so standard CRUD responses (paging / detail) from `mapDTO` can omit
> it; `JwtStrategy.validate` is the only consumer that requires it to be present.

#### Barrel `src/modules/admin/dto/index.ts`

```ts
export * from './permission.dto';
export * from './role.dto';
export * from './user.dto';
```

---

#### Services (`src/modules/admin/services/`)

Follow `init-entity` Step 4 (simple profile): each service exports an I-token Symbol + a
concrete class extending `BaseService`. The `mapDTO` and any novel methods are shown in full;
boilerplate (`I<X>Service` Symbol declaration, constructor `@Inject`, standard `mapDTO` for
`Permission` and `Role`) follows the same shape as the `init-entity` template.

**`permission.service.ts`** — read-only surface; `mapDTO` returns `PermissionDTO`. No novel
methods (all management is via seed). Token: `IPermissionService`.

**`role.service.ts`** — full CRUD + one novel method:

```ts
// role.service.ts — resolve roleCodes → flat permission codes (deduped)
import { In } from 'typeorm';

loadPermissions = async (roleCodes: string[]): Promise<string[]> => {
  if (!roleCodes?.length) return [];
  const roles = await this.repository.repository.find({ where: { code: In(roleCodes), isActive: true } });
  return Array.from(new Set(roles.flatMap((r) => r.permissions ?? [])));
};
```

> `this.repository.repository` is the raw TypeORM `Repository<Role>` exposed by `BaseRepository`
> — use it when `BaseRepository`'s built-in methods do not cover the query. `In(roleCodes)` loads
> only the requested roles; `isActive: true` skips disabled roles; `Set` deduplicates codes that
> appear in multiple roles. Add `loadPermissions` to the `IRoleService` interface.

**`user.service.ts`** — full CRUD + one novel method. Injects `IRoleService` to resolve permissions:

```ts
// user.service.ts — login lookup + fallback-sync; sets dto.permissions
internalDetail = async (keycloakUserId: string): Promise<UserDTO | undefined> => {
  let row = await this.repository.repository.findOne({ where: { keycloakUserId } });
  // if not found, fallback: fetch from Keycloak (keycloakAdmin.findUser) + insert a row — see Step 6/seed task
  if (!row) return undefined;
  const dto = this.mapDTO(row)!;
  dto.permissions = await this.roleService.loadPermissions(dto.roleCodes);
  return dto;
};
```

> `internalDetail` is called exclusively by `JwtStrategy.validate` — never exposed via HTTP.
> When `row` is `undefined` the strategy throws `UnauthorizedException`; the fallback-sync path
> (fetch from Keycloak Admin API + insert) is implemented in the Keycloak-proxy + seed task (next
> task). `this.roleService` is injected as `@Inject(IRoleService) private readonly roleService:
> IRoleService` in the constructor.

The account-mutating methods (`createDTO` / `updateDTO` / `resetPassword` / `setEnabled` /
`remove`) **delegate to `keycloak-admin.service` THEN sync the DB row** — implemented in the
Keycloak-proxy + seed task.

**`IUserService` interface** must declare:
- `internalDetail(keycloakUserId: string): Promise<UserDTO | undefined>`
- `createDTO(req: Partial<UserDTO>): Promise<UserDTO>`
- `updateDTO(id: string, req: Partial<UserDTO>): Promise<UserDTO>`
- `resetPassword(id: string, password: string): Promise<void>`
- `setEnabled(id: string, enabled: boolean): Promise<void>`
- `remove(id: string): Promise<void>`

**`IRoleService` interface** must declare:
- `loadPermissions(roleCodes: string[]): Promise<string[]>`

#### Barrel `src/modules/admin/services/index.ts`

```ts
export * from './permission.service';
export * from './role.service';
export * from './user.service';
```

---

### Step 6 — Controllers + permission codes + Zod schemas

#### Permission codes — full admin set

| Code | Enforced on |
|---|---|
| `admin_permission:view` | `PermissionController` — all read routes |
| `admin_role:view` | `RoleController` — paging / detail / all |
| `admin_role:create` | `RoleController POST /` |
| `admin_role:update` | `RoleController PUT /:id` |
| `admin_role:delete` | `RoleController DELETE /:id` |
| `admin_user:view` | `UserController` — paging / detail / all |
| `admin_user:create` | `UserController POST /` |
| `admin_user:update` | `UserController PUT /:id` + `setEnabled` |
| `admin_user:delete` | `UserController DELETE /:id` |
| `admin_user:reset_password` | `UserController POST /:id/reset-password` |
| `admin_user:assign_roles` | `UserController POST /:id/roles` |

Seed all 11 codes via `AdminSeedService` (next task). Model segment = `admin_permission`,
`admin_role`, `admin_user`; action = the suffix after `:`.

#### Zod schemas (`src/modules/admin/schemas/admin.schema.ts`)

Follow `init-entity` Step 5 (`reqStr` helper, create + `.partial()` update pairs):

```ts
import { z } from 'zod';
const reqStr = (code: string) => z.string({ required_error: code }).trim().min(1, code);

// ----- role -----
export const RoleCreateSchema = z.object({
  code: reqStr('admin.role.code.required'),
  name: reqStr('admin.role.name.required'),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});
export const RoleUpdateSchema = RoleCreateSchema.partial();

// ----- user -----
export const UserCreateSchema = z.object({
  username: reqStr('admin.user.username.required'),
  email: z.string().email('admin.user.email.invalid').optional(),
  fullName: z.string().trim().optional(),
  roleCodes: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});
export const UserUpdateSchema = UserCreateSchema.partial();
```

> `Permission` records are seeded — no create/update schema needed. `email` uses
> `z.string().email(...)` for format validation. All error values follow the
> `<module>.<entity>.<field>.<rule>` i18n namespace.

#### Controllers

**`PermissionController`** (`src/modules/admin/controllers/permission.controller.ts`) — READ
ONLY. Inherits paging / detail / all from `BaseController`; NO create / update / delete routes.
Gate all inherited routes with `@HasPermission('admin_permission:view')` by overriding them.
Use `@UseGuards(AuthGuard)` at class level.

```ts
import { BaseController, ApiResponse } from '@sdcorejs/nestjs/orm';
import { AuthGuard, HasPermission } from '@sdcorejs/nestjs/permission';
import { Controller, Inject, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { PermissionDTO } from 'src/modules/admin/dto';
import { Permission } from 'src/modules/admin/entities';
import { IPermissionService } from 'src/modules/admin/services';

@Controller('permission')
@UseGuards(AuthGuard)
export class PermissionController extends BaseController<Permission, PermissionDTO> {
  constructor(@Inject(IPermissionService) service: IPermissionService) {
    super(service);
  }

  // Gate the inherited read routes; omit create/update/delete entirely.
  @Post('paging')
  @HasPermission('admin_permission:view')
  override async paging(@Body() req: unknown) { return super.paging(req as any); }

  @Get(':id')
  @HasPermission('admin_permission:view')
  override async detail(@Param('id') id: string) { return super.detail(id); }

  @Get()
  @HasPermission('admin_permission:view')
  override async all() { return super.all(); }
}
```

**`RoleController`** (`src/modules/admin/controllers/role.controller.ts`) — full CRUD.

```ts
import { BaseController, ApiResponse } from '@sdcorejs/nestjs/orm';
import { AuthGuard, HasPermission } from '@sdcorejs/nestjs/permission';
import { ZodValidationGuard } from '@sdcorejs/nestjs/validation';
import { Body, Controller, Delete, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { RoleDTO } from 'src/modules/admin/dto';
import { Role } from 'src/modules/admin/entities';
import { RoleCreateSchema, RoleUpdateSchema } from 'src/modules/admin/schemas/admin.schema';
import { IRoleService } from 'src/modules/admin/services';

@Controller('role')
@UseGuards(AuthGuard)
export class RoleController extends BaseController<Role, RoleDTO> {
  constructor(@Inject(IRoleService) private readonly service: IRoleService) {
    super(service);
  }

  @Post()
  @HasPermission('admin_role:create')
  @UseGuards(ZodValidationGuard(RoleCreateSchema))
  async create(@Body() req: RoleDTO) {
    return ApiResponse.ok(await this.service.create(req));
  }

  @Put(':id')
  @HasPermission('admin_role:update')
  @UseGuards(ZodValidationGuard(RoleUpdateSchema))
  async update(@Param('id') id: string, @Body() req: RoleDTO) {
    return ApiResponse.ok(await this.service.update(id, req));
  }

  @Delete(':id')
  @HasPermission('admin_role:delete')
  override async delete(@Param('id') id: string) { return super.delete(id); }
}
```

**`UserController`** (`src/modules/admin/controllers/user.controller.ts`) — CRUD + custom routes.

```ts
import { BaseController, ApiResponse } from '@sdcorejs/nestjs/orm';
import { AuthGuard, HasPermission } from '@sdcorejs/nestjs/permission';
import { ZodValidationGuard } from '@sdcorejs/nestjs/validation';
import { Body, Controller, Delete, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UserDTO } from 'src/modules/admin/dto';
import { User } from 'src/modules/admin/entities';
import { UserCreateSchema, UserUpdateSchema } from 'src/modules/admin/schemas/admin.schema';
import { IUserService } from 'src/modules/admin/services';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController extends BaseController<User, UserDTO> {
  constructor(@Inject(IUserService) private readonly service: IUserService) {
    super(service);
  }

  @Post()
  @HasPermission('admin_user:create')
  @UseGuards(ZodValidationGuard(UserCreateSchema))
  async create(@Body() req: UserDTO) {
    return ApiResponse.ok(await this.service.createDTO(req));
  }

  @Put(':id')
  @HasPermission('admin_user:update')
  @UseGuards(ZodValidationGuard(UserUpdateSchema))
  async update(@Param('id') id: string, @Body() req: UserDTO) {
    return ApiResponse.ok(await this.service.updateDTO(id, req));
  }

  @Delete(':id')
  @HasPermission('admin_user:delete')
  override async delete(@Param('id') id: string) { return super.delete(id); }

  /** Reset Keycloak password (delegates to keycloak-admin.service — implemented in next task). */
  @Post(':id/reset-password')
  @HasPermission('admin_user:reset_password')
  async resetPassword(@Param('id') id: string, @Body() req: { password: string }) {
    await this.service.resetPassword(id, req.password);
    return ApiResponse.ok(null);
  }

  /** Enable / disable the Keycloak account + DB mirror. */
  @Put(':id/enabled')
  @HasPermission('admin_user:update')
  async setEnabled(@Param('id') id: string, @Body() req: { enabled: boolean }) {
    await this.service.setEnabled(id, req.enabled);
    return ApiResponse.ok(null);
  }

  /** Assign roles — replaces the user's `roleCodes` array. */
  @Post(':id/roles')
  @HasPermission('admin_user:assign_roles')
  async assignRoles(@Param('id') id: string, @Body() req: { roleCodes: string[] }) {
    return ApiResponse.ok(await this.service.updateDTO(id, { roleCodes: req.roleCodes }));
  }
}
```

#### Barrel `src/modules/admin/controllers/index.ts`

```ts
export * from './permission.controller';
export * from './role.controller';
export * from './user.controller';
```

---

### Step 7 — Module wiring + app.module reconciliation

#### `src/modules/admin/admin.module.ts`

Follow `init-module` Step 2 + `init-entity` Step 7. Register all three entities in
`TypeOrmModule.forFeature`, bind all repo + service tokens, export the three service tokens
so other modules can `@Inject` them as DI ports.

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission, Role, User } from './entities';
import { PermissionController, RoleController, UserController } from './controllers';
import { IPermissionRepository, PermissionRepository } from './repositories';
import { IRoleRepository, RoleRepository } from './repositories';
import { IUserRepository, UserRepository } from './repositories';
import { IPermissionService, PermissionService } from './services';
import { IRoleService, RoleService } from './services';
import { IUserService, UserService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, Role, User]),
  ],
  controllers: [PermissionController, RoleController, UserController],
  providers: [
    { provide: IPermissionRepository, useClass: PermissionRepository },
    { provide: IRoleRepository,       useClass: RoleRepository },
    { provide: IUserRepository,       useClass: UserRepository },
    { provide: IPermissionService,    useClass: PermissionService },
    { provide: IRoleService,          useClass: RoleService },
    { provide: IUserService,          useClass: UserService },
  ],
  exports: [IPermissionService, IRoleService, IUserService],
})
export class AdminModule {}
```

> Only service I-tokens are exported — never the repository tokens or concrete classes. The
> `JwtStrategy` imports `AdminModule` via `JwtModule.forRoot` (see below) to resolve `IUserService`.

#### `src/app.module.ts` — reconciliation

`init-admin` performs three targeted edits to the `app.module.ts` emitted by `init-project`:

1. **Register `AppPermissionStrategy`** — update `SdCoreModule.forRoot`:
   ```ts
   SdCoreModule.forRoot({
     permission: { strategy: AppPermissionStrategy },
     // jwt key is REMOVED — JwtModule.forRoot handles JWT separately (see below)
   }),
   ```

2. **DROP the `SdCoreModule` `jwt` key; add `JwtModule.forRoot` separately** — place after
   `SdCoreModule.forRoot` in the `imports` array:
   ```ts
   JwtModule.forRoot(
     { jwks: { allowedIssuers: [CONFIGURATION().keycloak.issuer] } },
     { strategy: JwtStrategy, imports: [AdminModule] },
   ),
   ```
   Import `JwtModule` from `@sdcorejs/nestjs/jwt`. `CONFIGURATION()` is the typed config factory
   from `init-project` Step 3. The second argument's `imports: [AdminModule]` tells `JwtModule`
   to pull `AdminModule` into its DI scope so `IUserService` resolves inside `JwtStrategy`.

3. **Add `AdminModule` + `RouterModule` prefix** to `imports`:
   ```ts
   AdminModule,
   RouterModule.register([{ path: 'admin', module: AdminModule }]),
   ```
   All admin controllers are now reachable under `/admin/permission`, `/admin/role`, `/admin/user`.

> **Why `JwtModule.forRoot` is separate from `SdCoreModule`.** `SdCoreModule.forRoot({ jwt })` is
> a convenience that wires a stateless `KeycloakJwtStrategy` with no extra DI deps. The moment the
> strategy needs to inject a service from another module (`IUserService` from `AdminModule`), the
> convenience path creates a circular reference at bootstrap. Registering `JwtModule.forRoot`
> directly — with its own `imports` array — avoids the circular dependency and gives precise
> control over which modules the JWT strategy can consume.

---

<!-- Keycloak Admin proxy + seed appended by the next task -->
