> **Reference for the `sdcorejs-nestjs` orchestrator.** Loaded on demand and ALWAYS run
> right after `init-project`, BEFORE any domain `init-module`/`init-entity`. Not a standalone
> skill. Generates the `admin` module — the project's authn/authz authority.

# Init Admin — Authn/Authz Module (`@sdcorejs/nestjs`)

## Contents

- Purpose / when to use
- Source of truth - core package
- Profile (read FIRST)
- Generation steps
- Permission, role, and user entities
- Service and controller surface
- Module wiring and seeding
- Enterprise extension
- Verification and handoff

## Purpose / when to use
Generate the always-on `admin` module: app-DB authorization (role + permission, flat
`<module>_<entity>:<action>` codes) + Keycloak Admin API proxy for account lifecycle. Owns the
project `IPermissionStrategy` and the user-lookup `JwtStrategy`. Run order:
`init-project → init-admin → init-module → init-entity → actions`.

## Source of truth — core package
Read [`_refs/nestjs/core-catalog.md`](../core-catalog.md) BEFORE generating. Every import MUST match a
documented sub-path. Building blocks: `BaseEntity`/`WithAudit` (via `src/common/base-entity`),
`BaseRepository`/`BaseService`/`BaseController` (`/core`), `IPermissionStrategy` (`/auth`),
`KeycloakJwtStrategy` (`/auth`), `ContextService` (`/core`).

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
import { BaseRepository, IBaseRepository } from '@sdcorejs/nestjs/core';
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

Generate `src/common/auth.strategy.ts`. This strategy **cannot** be wired via
`SdCoreModule.forRoot({ jwt: ... })` because it injects `IUserService` from the `AdminModule`
— doing so would create a circular dependency at bootstrap. Instead, the lib `JwtModule.forRoot`
is registered separately in `app.module.ts` (see Step 7), and the `SdCoreModule` `jwt` key is
**dropped** entirely. This matches the "JWT & Keycloak" section of `core-catalog.md` and the
note in `init-project` Step 7 about replacing the default JWT strategy.

```ts
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JWT_CONFIG, type JwtConfig, type JwtPayload, KeycloakJwtStrategy } from '@sdcorejs/nestjs/auth';
import { IUserService } from 'src/modules/admin/services';

@Injectable()
export class JwtStrategy extends KeycloakJwtStrategy {
  constructor(
    @Inject(JWT_CONFIG) cfg: JwtConfig,
    @Inject(IUserService) private readonly users: IUserService,
  ) {
    super(cfg);
  }

  async validate(payload: JwtPayload) {
    const user = await this.users.internalDetail(payload.sub);   // lookup by keycloakUserId (fallback-sync)
    if (!user || !user.isActive) throw new UnauthorizedException();
    return user;   // carries roleCodes + resolved `permissions` (set by internalDetail)
  }
}
```

> `KeycloakJwtStrategy` (from `@sdcorejs/nestjs/auth`) handles JWKS verification and expiry. The
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
import type { IPermissionStrategy } from '@sdcorejs/nestjs/auth';
import { ContextService } from '@sdcorejs/nestjs/core';

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

> `ContextService` (from `@sdcorejs/nestjs/core`) stores the resolved user set by
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
export * from './auth.dto';
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
| `admin_role:view` | `RoleController` — paging / detail (+ explicit all route if exposed) |
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

// ----- user reset-password -----
export const UserResetPasswordSchema = z.object({
  password: reqStr('admin.user.password.required').min(8, 'admin.user.password.minLength'),
});
```

> `Permission` records are seeded — no create/update schema needed. `email` uses
> `z.string().email(...)` for format validation. All error values follow the
> `<module>.<entity>.<field>.<rule>` i18n namespace. `UserResetPasswordSchema` enforces a minimum
> length of 8; adjust the `min` value to match the project's password policy.

#### Controllers

**`PermissionController`** (`src/modules/admin/controllers/permission.controller.ts`) — READ
ONLY. Inherits paging / detail / delete from `BaseController`; expose `all` only if the role editor needs an unpaged permission list. Do not add create / update routes.
Gate inherited read routes with `@HasPermission('admin_permission:view')` by overriding them. If delete must be unavailable, override it to throw `NotFoundException` or omit `BaseController` and write only the read routes.
Use `@UseGuards(AuthGuard)` at class level.

```ts
import { BaseController, ApiResponse } from '@sdcorejs/nestjs/core';
import { AuthGuard, HasPermission } from '@sdcorejs/nestjs/auth';
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
import { BaseController, ApiResponse } from '@sdcorejs/nestjs/core';
import { AuthGuard, HasPermission } from '@sdcorejs/nestjs/auth';
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
import { BaseController, ApiResponse } from '@sdcorejs/nestjs/core';
import { AuthGuard, HasPermission } from '@sdcorejs/nestjs/auth';
import { ZodValidationGuard } from '@sdcorejs/nestjs/validation';
import { Body, Controller, Delete, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UserDTO } from 'src/modules/admin/dto';
import { User } from 'src/modules/admin/entities';
import { UserCreateSchema, UserUpdateSchema, UserResetPasswordSchema } from 'src/modules/admin/schemas/admin.schema';
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

  /** Reset Keycloak password — body `{ password: string }` validated by UserResetPasswordSchema. */
  @Post(':id/reset-password')
  @HasPermission('admin_user:reset_password')
  @UseGuards(ZodValidationGuard(UserResetPasswordSchema))
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
   const acceptsKeycloakRealmIssuer = (iss: string): boolean => {
     const base = (process.env.KEYCLOAK_URL || '').replace(/\/+$/, '');
     return !!base && iss.startsWith(`${base}/realms/`);
   };

   JwtModule.forRoot(
     { jwks: { issuerValidator: acceptsKeycloakRealmIssuer } },
     { strategy: JwtStrategy, imports: [AdminModule] },
   ),
   ```
   Import `JwtModule` from `@sdcorejs/nestjs/auth`. The helper mirrors the ref app's dynamic
   multi-realm Keycloak policy: any `${KEYCLOAK_URL}/realms/<realm>` issuer is accepted, while
   JWKS is pinned to the configured host. The second argument's `imports: [AdminModule]` tells `JwtModule`
   to pull `AdminModule` into its DI scope so `IUserService` resolves inside `JwtStrategy`.

3. **Add `AdminModule` + `RouterModule` prefix** to `imports`:
   ```ts
   AdminModule,
   RouterModule.register([{ path: 'admin', module: AdminModule }]),
   ```
   All admin controllers are now reachable under `/admin/auth`, `/admin/role`, `/admin/user`.

> **Why `JwtModule.forRoot` is separate from `SdCoreModule`.** `SdCoreModule.forRoot({ jwt })` is
> a convenience that wires a stateless `KeycloakJwtStrategy` with no extra DI deps. The moment the
> strategy needs to inject a service from another module (`IUserService` from `AdminModule`), the
> convenience path creates a circular reference at bootstrap. Registering `JwtModule.forRoot`
> directly — with its own `imports` array — avoids the circular dependency and gives precise
> control over which modules the JWT strategy can consume.

---

---

### Step 8 — Keycloak Admin proxy

Generate `src/modules/admin/services/keycloak-admin.service.ts`. This service is an **app
dependency** — install the package explicitly:

```bash
npm i @keycloak/keycloak-admin-client
```

`KeycloakAdminService` is NOT part of `@sdcorejs/nestjs`. It proxies the Keycloak Admin REST API
so all account lifecycle operations happen in-app; end users never open the Keycloak console.
Simple profile: one realm, resolved from env. (Enterprise override: per-tenant realm resolution
replaces `#client`.)

```ts
import { Injectable } from '@nestjs/common';
import KcAdminClient from '@keycloak/keycloak-admin-client';

/** Proxies the Keycloak Admin REST API so account lifecycle happens in-app (end users never open
 *  the Keycloak console). simple profile: one realm from env. enterprise overrides per-tenant. */
@Injectable()
export class KeycloakAdminService {
  #client = async () => {
    const kc = new KcAdminClient({ baseUrl: process.env.KEYCLOAK_URL, realmName: process.env.KEYCLOAK_REALM });
    await kc.auth({
      grantType: 'client_credentials',
      clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET!,
    });
    return kc;
  };

  createUser = async (u: { username: string; email?: string; fullName?: string; password: string }) => {
    const kc = await this.#client();
    const created = await kc.users.create({ username: u.username, email: u.email, firstName: u.fullName, enabled: true });
    await kc.users.resetPassword({ id: created.id, credential: { type: 'password', value: u.password, temporary: false } });
    return created.id;   // keycloakUserId
  };
  resetPassword = async (keycloakUserId: string, password: string) => {
    const kc = await this.#client();
    await kc.users.resetPassword({ id: keycloakUserId, credential: { type: 'password', value: password, temporary: false } });
  };
  setEnabled = async (keycloakUserId: string, enabled: boolean) => {
    const kc = await this.#client();
    await kc.users.update({ id: keycloakUserId }, { enabled });
  };
  deleteUser = async (keycloakUserId: string) => {
    const kc = await this.#client();
    await kc.users.del({ id: keycloakUserId });
  };
  findUser = async (keycloakUserId: string) => {
    const kc = await this.#client();
    return kc.users.findOne({ id: keycloakUserId });
  };
  findByUsername = async (username: string) => {
    const kc = await this.#client();
    const found = await kc.users.find({ username, exact: true });
    return found?.[0];
  };
}
```

#### How `user.service` uses `KeycloakAdminService`

- **`createDTO`** — call `keycloakAdmin.createUser(...)` first (gets `keycloakUserId`), then
  insert the DB row. Keycloak is the source of truth for credentials; the DB row carries only
  authorization attributes.
- **`updateDTO`** — update the DB row first; if `email` or `fullName` changed also call
  `kc.users.update(keycloakUserId, { email, firstName })` to keep the Keycloak profile in sync.
- **`resetPassword`** — call `keycloakAdmin.resetPassword(user.keycloakUserId, password)`; no DB
  write needed (credentials live in Keycloak only).
- **`setEnabled`** — call `keycloakAdmin.setEnabled(user.keycloakUserId, enabled)` first, then
  update `user.isActive` in the DB so the JWT strategy's `isActive` check stays consistent.
- **`remove`** — call `keycloakAdmin.deleteUser(user.keycloakUserId)` first, then soft-delete
  (or hard-delete) the DB row.
- **`internalDetail` fallback** — when `findOne({ keycloakUserId })` returns `undefined` (first
  login, no DB row yet), call `keycloakAdmin.findUser(sub)`. If Keycloak returns a profile,
  insert a DB row `{ keycloakUserId: sub, username, email, roleCodes: [], isActive: true }` so
  the user self-heals on first login. Then resolve permissions as usual and return the DTO. This
  eliminates the need for a manual "pre-provision" step for users created directly in Keycloak.

#### Module wiring for `KeycloakAdminService`

Add `KeycloakAdminService` to `admin.module.ts` `providers` AND `exports` so `UserService` can
inject it:

```ts
// admin.module.ts — add to providers + exports
import { KeycloakAdminService } from './services/keycloak-admin.service';

providers: [
  // ... existing repo + service bindings ...
  KeycloakAdminService,
],
exports: [IPermissionService, IRoleService, IUserService, KeycloakAdminService],
```

`UserService` injects it as a concrete class (not via I-token) because `KeycloakAdminService` is
an infrastructure adapter with no test-double requirement at the unit level:

```ts
// user.service.ts constructor
constructor(
  @Inject(IUserRepository) repository: IUserRepository,
  @Inject(IRoleService) private readonly roleService: IRoleService,
  private readonly keycloakAdmin: KeycloakAdminService,
) { super(repository); }
```

Also update the `services/index.ts` barrel to re-export `KeycloakAdminService`:

```ts
// src/modules/admin/services/index.ts
export * from './keycloak-admin.service';
export * from './permission.service';
export * from './role.service';
export * from './user.service';
```

---

### Step 9 — Seed (idempotent, on boot)

Generate `src/modules/admin/admin.seed.ts`. The seed runs from `src/main.ts` right after
`ensureSchemas()` and before `app.listen()` — making it the first thing that runs on every
restart, which guarantees the permission registry, the default role, and the demo account are
always in a consistent state.

```ts
// src/main.ts (after ensureSchemas(), before app.listen)
await seedAdmin(app);   // idempotent; steps 1-2 DB-only, step 3 retries until Keycloak is up
```

#### Three idempotent seed steps

**Step 1 — Permission registry (DB-only)**

At generation time the `sdcorejs-nestjs` orchestrator collects every `@HasPermission('<code>')`
emitted across ALL domain modules AND the admin module itself, then writes a `PERMISSION_REGISTRY`
constant. Collection command (run after all modules are generated):

```bash
rg -o "@HasPermission\('([^']+)'\)" -r '$1' src --no-filename | sort -u
```

The orchestrator writes the result as:

```ts
// src/modules/admin/permission-registry.ts  (generated — do NOT hand-edit)
export const PERMISSION_REGISTRY = [
  { code: 'admin_permission:view',      label: 'View permissions',     model: 'admin_permission', action: 'view' },
  { code: 'admin_role:create',          label: 'Create roles',         model: 'admin_role',       action: 'create' },
  // ... all codes from every domain module + admin module ...
] as const;
```

The seed upserts each entry into the `permission` table keyed on `code` (insert if absent, skip
if present — no duplicates). Re-running on restart is a no-op for existing codes. The registry
MUST include the 11 admin-module codes listed in Step 6 in addition to every domain-module code.

**Step 2 — Default `admin` role (DB-only)**

Upsert a role row `{ code: 'admin', name: 'Administrator', permissions: <all codes>,
isActive: true }`. This role is the superuser role; it receives every permission code in the
registry. Idempotent: if the role already exists, update its `permissions` array so new codes
added by future modules are automatically included.

**Step 3 — Demo grant (needs Keycloak; retried until reachable)**

Resolve the Keycloak `demo` user id via `keycloakAdmin.findByUsername('demo')`. Then upsert an
app `user` row `{ keycloakUserId, username: 'demo', roleCodes: ['admin'], isActive: true }`.

On `docker compose up` the backend races Keycloak startup. Wrap this step in a **retry-with-backoff**
loop (up to ~10 tries, 3 s apart) so the backend does not crash-exit when Keycloak is not yet
reachable. Every other attempt logs a warning. Idempotent: re-running on restart calls
find-or-update by username, not insert-always.

#### `admin.seed.ts` sketch

```ts
// src/modules/admin/admin.seed.ts
import { INestApplication } from '@nestjs/common';
import { PERMISSION_REGISTRY } from './permission-registry';
import { IPermissionService } from './services/permission.service';
import { IRoleService } from './services/role.service';
import { IUserService } from './services/user.service';

async function retry<T>(fn: () => Promise<T>, opts: { tries: number; delayMs: number }): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < opts.tries; i++) {
    try { return await fn(); } catch (e) {
      lastErr = e;
      console.warn(`[seed] step 3 attempt ${i + 1}/${opts.tries} failed — retrying in ${opts.delayMs}ms`);
      await new Promise((r) => setTimeout(r, opts.delayMs));
    }
  }
  throw lastErr;
}

export async function seedAdmin(app: INestApplication) {
  const perms = app.get(IPermissionService);
  const roles = app.get(IRoleService);
  const users = app.get(IUserService);

  await perms.upsertRegistry(PERMISSION_REGISTRY);                          // step 1 (DB-only)
  await roles.upsertAdminRole(PERMISSION_REGISTRY.map((p) => p.code));      // step 2 (DB-only)
  await retry(() => users.grantDemoAdmin(), { tries: 10, delayMs: 3000 });  // step 3 (needs Keycloak)
}
```

> `upsertRegistry`, `upsertAdminRole`, and `grantDemoAdmin` are seed-specific methods added to
> the corresponding service interfaces. They use TypeORM `upsert` (or `findOne`+`save`) keyed on
> `code`/`username` so repeated calls are safe. `grantDemoAdmin` internally calls
> `keycloakAdmin.findByUsername('demo')` and then upserts the `user` row.

#### Seed method templates

Add these methods to the respective service classes and declare them on the matching `I*Service`
interfaces (alongside the existing methods listed in Step 5).

```ts
// permission.service.ts — idempotent registry upsert (DB-only)
upsertRegistry = async (entries: { code: string; label: string; model: string; action: string }[]) => {
  for (const e of entries) {
    const existing = await this.repository.repository.findOne({ where: { code: e.code } });
    if (existing) await this.repository.repository.update({ code: e.code }, { label: e.label, model: e.model, action: e.action });
    else await this.repository.repository.insert(e);
  }
};
```

```ts
// role.service.ts — ensure the 'admin' role holds every code (DB-only)
upsertAdminRole = async (allCodes: string[]) => {
  const existing = await this.repository.repository.findOne({ where: { code: 'admin' } });
  if (existing) await this.repository.repository.update({ code: 'admin' }, { permissions: allCodes });
  else await this.repository.repository.insert({ code: 'admin', name: 'Administrator', permissions: allCodes, isActive: true });
};
```

```ts
// user.service.ts — grant the Keycloak `demo` user the admin role (needs Keycloak; called under retry)
grantDemoAdmin = async () => {
  const kcUser = await this.keycloakAdmin.findByUsername('demo');   // throws/empty until Keycloak is up → retry wrapper handles it
  if (!kcUser?.id) throw new Error('Keycloak demo user not found yet');
  const existing = await this.repository.repository.findOne({ where: { keycloakUserId: kcUser.id } });
  if (existing) await this.repository.repository.update({ id: existing.id }, { roleCodes: ['admin'], isActive: true });
  else await this.repository.repository.insert({ keycloakUserId: kcUser.id, username: 'demo', roleCodes: ['admin'], isActive: true });
};
```

Add to `IPermissionService`: `upsertRegistry(entries: { code: string; label: string; model: string; action: string }[]): Promise<void>`

Add to `IRoleService`: `upsertAdminRole(allCodes: string[]): Promise<void>`

Add to `IUserService`: `grantDemoAdmin(): Promise<void>`

---

### Step 10 — `package.json` + `.env` additions

#### `package.json`

Add the Keycloak Admin Client to project dependencies:

```json
{
  "dependencies": {
    "@keycloak/keycloak-admin-client": "^24.0.0"
  }
}
```

Pin to the `^24.x` range (the latest stable at time of writing). Run `npm install` after the
package is added.

#### `.env.example` additions

```dotenv
# Keycloak Admin service-account client (confidential client seeded by sdcorejs-auth).
# Grant this client the "realm-management" → "manage-users" role in the Keycloak console.
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
KEYCLOAK_ADMIN_CLIENT_SECRET=change-me
```

> `KEYCLOAK_ADMIN_CLIENT_ID` / `KEYCLOAK_ADMIN_CLIENT_SECRET` are the credentials of a
> **confidential service-account client** in Keycloak. `sdcorejs-auth` provisions this client
> automatically (realm import). Never use the master `admin` credentials here — use a
> least-privilege service account scoped to the project realm.

---

### Step 11 — Verification checklist + Expected files

#### Expected admin-module files

```
src/
  common/
    jwt.strategy.ts                         # Step 3
    app-permission.strategy.ts              # Step 4
  modules/admin/
    entities/
      permission.entity.ts                  # Step 1
      role.entity.ts                        # Step 1
      user.entity.ts                        # Step 1
      index.ts
    repositories/
      permission.repository.ts              # Step 2
      role.repository.ts                    # Step 2
      user.repository.ts                    # Step 2
      index.ts
    dto/
      permission.dto.ts                     # Step 5
      role.dto.ts                           # Step 5
      user.dto.ts                           # Step 5
      index.ts
    schemas/
      admin.schema.ts                       # Step 6
    services/
      keycloak-admin.service.ts             # Step 8
      permission.service.ts                 # Step 5
      role.service.ts                       # Step 5
      user.service.ts                       # Step 5
      index.ts
    controllers/
      permission.controller.ts              # Step 6
      role.controller.ts                    # Step 6
      user.controller.ts                    # Step 6
      index.ts
    permission-registry.ts                  # Step 9 (generated by orchestrator)
    admin.seed.ts                           # Step 9
    admin.module.ts                         # Step 7 + Step 8 update
```

#### Verification checklist

| Check | Command / assertion |
|---|---|
| TypeScript build clean | `npm run build` — zero type errors |
| Seed is idempotent | Run `npm run start` twice; second start must not throw or duplicate rows |
| Permission table is read-only via HTTP | `POST /admin/permission` → 404 (no route); `DELETE /admin/permission/:id` → 404 or 405 |
| Demo user gets `admin` role | After seed, call `GET /admin/user?username=demo` — `roleCodes` includes `'admin'` |
| Keycloak race handled | Start backend before Keycloak; step 3 retries appear in logs; seed completes when Keycloak becomes ready |

---

## Enterprise extension (profile: enterprise)

> **[enterprise]** — Everything in this section applies ONLY when `profile = enterprise`. The simple
> profile is untouched. Enterprise adds multi-tenancy: each `Tenant` maps to its own Keycloak realm;
> `Role` and `User` records are scoped to a `tenantCode` + `departmentCode` pair.

---

### E1 — Additional entities (schema `admin`)

#### `tenant.entity.ts`

```ts
import { BaseEntity } from 'src/common/base-entity';
import { Column, Entity, Unique } from 'typeorm';

/**
 * [enterprise] Tenant — one row per customer organisation.
 * `realm` + `clientId` + `clientSecret` are the coordinates of the
 * per-tenant Keycloak realm that `KeycloakAdminService` uses when
 * proxying account operations for that tenant.
 * `clientSecret` MUST be encrypted at rest (AES-256-GCM via the
 * project's EncryptionService) — never store plaintext.
 */
@Entity({ schema: 'admin', name: 'tenant' })
@Unique(['code'])
@Unique(['realm'])
export class Tenant extends BaseEntity {
  @Column({ type: 'varchar', length: 64 }) code: string;
  @Column({ type: 'varchar', length: 256 }) name: string;
  @Column({ type: 'varchar', length: 128 }) realm: string;        // per-tenant Keycloak realm name
  @Column({ type: 'varchar', length: 128 }) clientId: string;     // per-tenant admin client id
  @Column({ type: 'varchar' /* encrypted at rest */ }) clientSecret: string;
  @Column({ default: true }) isActive: boolean;
}
```

#### `department.entity.ts`

```ts
import { BaseEntity } from 'src/common/base-entity';
import { Scoped } from '@sdcorejs/nestjs/core';
import { Column, Entity, Unique } from 'typeorm';

/**
 * [enterprise] Department — belongs to a tenant; supports a single level of parent/child
 * hierarchy via `parentCode`. A null `parentCode` = root department.
 * The composite unique key `(tenantCode, code)` allows the same department code
 * to exist across different tenants without collisions.
 */
@Entity({ schema: 'admin', name: 'department' })
@Unique(['tenantCode', 'code'])
export class Department extends BaseEntity {
  @Scoped() @Column({ type: 'varchar', length: 64 }) tenantCode: string;
  @Column({ type: 'varchar', length: 64 }) code: string;
  @Column({ type: 'varchar', length: 256 }) name: string;
  @Column({ type: 'varchar', length: 64, nullable: true }) parentCode: string;
}
```

#### `entities/index.ts` — enterprise additions

```ts
// Append to the existing barrel
export * from './tenant.entity';
export * from './department.entity';
```

---

### E2 — 2-level `@Scoped` on `role` + `user`

**[enterprise]** adds two `@Scoped` columns to `role.entity.ts` and `user.entity.ts`. Import
`Scoped` from `@sdcorejs/nestjs/core`. The **simple profile omits these columns entirely**.

```ts
// role.entity.ts — enterprise additions (append to existing @Column declarations)
import { Scoped } from '@sdcorejs/nestjs/core';

// Inside the Role class body:
@Scoped() @Column({ type: 'varchar', length: 64, nullable: true }) tenantCode: string;
@Scoped() @Column({ type: 'varchar', length: 64, nullable: true }) departmentCode: string;
```

```ts
// user.entity.ts — enterprise additions (append to existing @Column declarations)
import { Scoped } from '@sdcorejs/nestjs/core';

// Inside the User class body:
@Scoped() @Column({ type: 'varchar', length: 64, nullable: true }) tenantCode: string;
@Scoped() @Column({ type: 'varchar', length: 64, nullable: true }) departmentCode: string;
```

> `nullable: true` is required because the seed upserts the global `admin` role and `demo` user
> before any tenant exists. When `tenantCode` is `null`, the record is treated as cross-tenant
> (global). The permission strategy unions all roles whose `tenantCode` matches the caller's
> context OR is `null` (global).

---

### E3 — Per-tenant Keycloak proxy

**[enterprise]** replaces the single-realm `#client()` in `KeycloakAdminService` with a
`#getClientForTenant(tenantCode)` variant that resolves `realm` / `clientId` / `clientSecret`
from the `Tenant` row. Inject `ITenantService` to look up the row.

```ts
// keycloak-admin.service.ts — enterprise override of #client()
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ContextService } from '@sdcorejs/nestjs/core';
import KcAdminClient from '@keycloak/keycloak-admin-client';
import { ITenantService } from 'src/modules/admin/services';

@Injectable()
export class KeycloakAdminService {
  constructor(
    @Inject(ITenantService) private readonly tenants: ITenantService,
    private readonly ctx: ContextService,
  ) {}

  /**
   * [enterprise] Resolve a Keycloak admin client scoped to the given tenant.
   * Falls back to env-realm when `tenantCode` is null/undefined (global/simple path).
   */
  #getClientForTenant = async (tenantCode?: string): Promise<KcAdminClient> => {
    if (!tenantCode) {
      // simple fallback — same as the original #client()
      const kc = new KcAdminClient({ baseUrl: process.env.KEYCLOAK_URL, realmName: process.env.KEYCLOAK_REALM });
      await kc.auth({
        grantType: 'client_credentials',
        clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID!,
        clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET!,
      });
      return kc;
    }
    const tenant = await this.tenants.detail(tenantCode);   // throws NotFoundException if missing
    if (!tenant || !tenant.isActive) throw new NotFoundException(`Tenant not found: ${tenantCode}`);
    const kc = new KcAdminClient({ baseUrl: process.env.KEYCLOAK_URL, realmName: tenant.realm });
    await kc.auth({
      grantType: 'client_credentials',
      clientId: tenant.clientId,
      clientSecret: tenant.clientSecret,   // decrypted by TenantService before returning DTO
    });
    return kc;
  };

  /** [enterprise] Resolve tenantCode from request context (set by JwtStrategy); then delegate. */
  #client = async () => {
    const user = this.ctx.get('user') as { tenantCode?: string } | undefined;
    return this.#getClientForTenant(user?.tenantCode);
  };

  // All existing methods (createUser, resetPassword, setEnabled, deleteUser, findUser, findByUsername)
  // remain unchanged — they call `this.#client()` which now routes per-tenant automatically.

  /**
   * [enterprise] Create a new Keycloak realm for a tenant + configure the admin client.
   * Called by TenantService.createDTO after persisting the Tenant row.
   * Requires the `app-admin` client to hold `manage-realm` on top of `manage-users` / `view-users`.
   */
  createTenantRealm = async (realm: string, clientId: string, clientSecret: string): Promise<void> => {
    // Use the global admin client (no tenantCode) to create the realm
    const kc = await this.#getClientForTenant();
    await kc.realms.create({ realm, enabled: true });
    await kc.clients.create({
      realm,
      clientId,
      secret: clientSecret,
      serviceAccountsEnabled: true,
      directAccessGrantsEnabled: false,
    });
    // Grant manage-users + view-users service-account roles on the new realm
    const sa = await kc.clients.getServiceAccountUser({ realm, id: clientId });
    const realmMgmt = (await kc.clients.find({ realm, clientId: 'realm-management' }))[0];
    const roles = await kc.clients.listRoles({ realm, id: realmMgmt.id! });
    const toGrant = roles.filter(r => ['manage-users', 'view-users'].includes(r.name!));
    await kc.users.addClientRoleMappings({ realm, id: sa.id!, clientUniqueId: realmMgmt.id!, roles: toGrant });
  };
}
```

> **`app-admin` client permissions** — the confidential service-account client (set in
> `KEYCLOAK_ADMIN_CLIENT_ID`) MUST hold `manage-realm` in addition to `manage-users` and
> `view-users` on the master realm so it can call `POST /admin/realms` to create per-tenant
> realms. Grant `manage-realm` in the Keycloak console under
> `master realm → Clients → app-admin → Service Account Roles → realm-management → manage-realm`.

---

### E4 — Repositories + Services + DTOs for Tenant + Department

Follow the same Symbol I-token DI pattern as `user.repository.ts` / `user.service.ts` in Steps 2
and 5. Substitute class names:

| Layer | Tenant | Department |
|---|---|---|
| Repository | `TenantRepository` / `ITenantRepository` | `DepartmentRepository` / `IDepartmentRepository` |
| Service | `TenantService` / `ITenantService` | `DepartmentService` / `IDepartmentService` |
| DTO | `TenantDTO` | `DepartmentDTO` |

```ts
// tenant.dto.ts — [enterprise]
import { Dto } from 'src/common/dto';
export interface TenantDTO extends Dto {
  code: string;
  name: string;
  realm: string;
  clientId: string;
  clientSecret?: string;   // write-only: never returned on GET responses (omit in mapDTO)
  isActive: boolean;
}
```

```ts
// department.dto.ts — [enterprise]
import { Dto } from 'src/common/dto';
export interface DepartmentDTO extends Dto {
  tenantCode: string;
  code: string;
  name: string;
  parentCode: string | null;
}
```

> `TenantService.mapDTO` MUST omit `clientSecret` from GET responses — set the field to
> `undefined` (or exclude it) before returning. The field is accepted on CREATE/UPDATE (written to
> DB encrypted) but never sent back to the client.

---

### E5 — Permission codes (enterprise additions)

Add the following codes to `PERMISSION_REGISTRY` and seed them alongside the 11 existing admin codes:

| Code | Enforced on |
|---|---|
| `admin_tenant:view` | `TenantController` — paging / detail / all |
| `admin_tenant:create` | `TenantController POST /` |
| `admin_tenant:update` | `TenantController PUT /:id` |
| `admin_tenant:delete` | `TenantController DELETE /:id` |
| `admin_department:view` | `DepartmentController` — paging / detail / all |
| `admin_department:create` | `DepartmentController POST /` |
| `admin_department:update` | `DepartmentController PUT /:id` |
| `admin_department:delete` | `DepartmentController DELETE /:id` |

> Total admin codes for enterprise profile: **19** (11 simple + 8 enterprise). The seed step
> collects all `@HasPermission` codes via `rg` (Step 9 — seed) and upserts the full set
> idempotently. No manual registry edit needed beyond adding the `@HasPermission` decorators to
> the two new controllers.

---

### E6 — Controllers (enterprise)

**`TenantController`** (`src/modules/admin/controllers/tenant.controller.ts`) — [enterprise]

Full CRUD. Schema: `TenantCreateSchema` / `TenantUpdateSchema` (follow `admin.schema.ts` pattern).
All routes gated `admin_tenant:{create,update,delete,view}`.

```ts
// Zod schema additions in admin.schema.ts — [enterprise]
export const TenantCreateSchema = z.object({
  code:         reqStr('admin.tenant.code.required'),
  name:         reqStr('admin.tenant.name.required'),
  realm:        reqStr('admin.tenant.realm.required'),
  clientId:     reqStr('admin.tenant.clientId.required'),
  clientSecret: reqStr('admin.tenant.clientSecret.required'),
  isActive:     z.boolean().optional(),
});
export const TenantUpdateSchema = TenantCreateSchema.partial();

export const DepartmentCreateSchema = z.object({
  tenantCode:  reqStr('admin.department.tenantCode.required'),
  code:        reqStr('admin.department.code.required'),
  name:        reqStr('admin.department.name.required'),
  parentCode:  z.string().trim().optional().nullable(),
});
export const DepartmentUpdateSchema = DepartmentCreateSchema.partial();
```

**`DepartmentController`** (`src/modules/admin/controllers/department.controller.ts`) — [enterprise]

Full CRUD. All routes gated `admin_department:{create,update,delete,view}`.

---

### E7 — Module wiring (enterprise additions)

Add to `admin.module.ts` `TypeOrmModule.forFeature`, `providers`, and `exports`:

```ts
// admin.module.ts — [enterprise] additions
import { Tenant, Department } from './entities';
import { ITenantRepository, TenantRepository } from './repositories';
import { IDepartmentRepository, DepartmentRepository } from './repositories';
import { ITenantService, TenantService } from './services';
import { IDepartmentService, DepartmentService } from './services';
import { TenantController, DepartmentController } from './controllers';

// In @Module:
TypeOrmModule.forFeature([Permission, Role, User, Tenant, Department]),
controllers: [..., TenantController, DepartmentController],
providers: [
  ...,
  { provide: ITenantRepository,     useClass: TenantRepository },
  { provide: IDepartmentRepository, useClass: DepartmentRepository },
  { provide: ITenantService,        useClass: TenantService },
  { provide: IDepartmentService,    useClass: DepartmentService },
],
exports: [..., ITenantService, IDepartmentService],
```

Also add to `RouterModule.register` so new controllers are reachable under `/admin/tenant` and
`/admin/department`.

---

### E8 — `app-admin` client role requirements (enterprise)

Update `.env.example` with a note:

```dotenv
# [enterprise] app-admin client needs manage-realm in addition to manage-users + view-users.
# Grant in: master realm → Clients → app-admin → Service Account Roles → realm-management → manage-realm
```

---

### E9 — Expected additional files (enterprise)

```
src/modules/admin/
  entities/
    tenant.entity.ts                     # E1
    department.entity.ts                 # E1
  repositories/
    tenant.repository.ts                 # E4
    department.repository.ts             # E4
  dto/
    tenant.dto.ts                        # E4
    department.dto.ts                    # E4
  services/
    tenant.service.ts                    # E4
    department.service.ts                # E4
  controllers/
    tenant.controller.ts                 # E6
    department.controller.ts             # E6
```
