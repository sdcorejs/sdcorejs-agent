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

<!-- services, strategy, JWT, controllers, seed appended by subsequent tasks -->
