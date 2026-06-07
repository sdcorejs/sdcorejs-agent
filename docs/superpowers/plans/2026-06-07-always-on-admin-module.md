# Always-on Admin Module — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an always-on admin module to solution-builder-generated apps that owns authn/authz (account/role/permission, + tenant/department in enterprise), so end users never open the Keycloak console.

**Architecture:** Meta-work on the `sdcorejs-agent` repo's own skills + `_refs`. Two NEW on-demand reference packs (BE `init-admin.md`, FE `admin-screens.md`) the orchestrators always run, plus revisions to the just-shipped simple-profile auth. Hybrid authz: Keycloak = identity (Admin API proxy for accounts); app-DB = authz (role/permission tables, flat `<module>_<entity>:<action>` codes). "Tests" = `bash .claude/sync-skills.sh --check`, `npx lefthook run check`, and `rg` assertions per task.

**Tech Stack:** Markdown packs (no frontmatter for `_refs/**`); the generated code targets `@sdcorejs/nestjs` (NestJS) + `@sdcorejs/angular` (Angular) + `@keycloak/keycloak-admin-client`.

**Design doc:** `docs/superpowers/specs/2026-06-07-always-on-admin-module-design.md`

---

## Conventions (every task)

- Edit/create source under `_refs/**` and `skills/**` ONLY. NEVER hand-edit mirrors (`.claude/skills`, `plugin/skills`, `.claude/_refs`, `plugin/_refs`).
- Every commit step: run `bash .claude/sync-skills.sh` first, then `git add` source **and** the regenerated mirror dirs.
- `_refs/**` files have NO YAML frontmatter. `skills/**` keep their frontmatter.
- Benign sync warning about `skills/tracks/nestjs/_README.md` is expected.
- Boilerplate reference is allowed: where a step says "follow `init-entity.md` Step N", the engineer renders that documented pattern for the named entity — that is a real instruction in this established pack set, not a placeholder. Novel content (strategy/jwt/kc-admin/seed/screens/entity shapes) is shown in full.

## File map

| File | Phase | Responsibility |
|---|---|---|
| `_refs/nestjs/write-code/init-admin.md` | P1,P2,P4 | NEW BE pack — admin module + authz strategy + KC-admin proxy + seed |
| `_refs/angular/write-code/admin-screens.md` | P3,P4 | NEW FE pack — account/role/permission (+tenant/department) screens |
| `skills/infra/auth.md` | P2 | remove Step 1.5; add admin service-account client wiring |
| `_refs/infra/auth-keycloak.md` | P2 | §1/§7 — admin client + permissions-from-admin-module |
| `_refs/infra/keycloak/realm-export.json` | P2 | seed the confidential admin service-account client |
| `_refs/nestjs/write-code/init-project.md` | P5 | simple-profile: `RolePermissionStrategy`→`AppPermissionStrategy`, jwt user-lookup, `.env` admin-client vars |
| `skills/tracks/nestjs/write-code.md` | P5 | always dispatch `init-admin` first |
| `skills/tracks/angular/write-code.md` | P5 | always dispatch `admin-screens` |
| `skills/orchestration/solution-builder.md` | P5 | admin built first / in the Mode B contract-freeze |
| `_refs/nestjs/core-catalog.md` | P5 | note: generated admin module owns `IPermissionStrategy` |

---

# PHASE 1 — BE admin core (`init-admin.md`)

## Task 1: Create the `init-admin.md` pack — module + entities + repos

**Files:**
- Create: `_refs/nestjs/write-code/init-admin.md`

- [ ] **Step 1: Pack header + when-to-use + profile note**

Create the file starting with (no frontmatter):
```
> **Reference for the `nestjs-write-code` orchestrator.** Loaded on demand and ALWAYS run
> right after `init-project`, BEFORE any domain `init-module`/`init-entity`. Not a standalone
> skill. Generates the `admin` module — the project's authn/authz authority.

# Init Admin — Authn/Authz Module (`@sdcorejs/nestjs`)

## Purpose / when to use
Generate the always-on `admin` module: app-DB authorization (role + permission, flat
`<module>_<entity>:<action>` codes) + Keycloak Admin API proxy for account lifecycle. Owns the
project `IPermissionStrategy` and the user-lookup `JwtStrategy`. Run order:
`init-project → init-admin → init-module → init-entity → actions`.

## Profile (read FIRST)
Read `profile` from the caller (default `simple`). **simple** = `permission`/`role`/`user`
entities, single realm, no tenancy. **enterprise** = + `tenant`/`department` + 2-level `@Scoped`
(see the Enterprise extension section). Emit only the chosen profile's surface.
```

- [ ] **Step 2: Entities (simple) — `permission`, `role`, `user`**

Document `src/modules/admin/entities/*.entity.ts`, each extending `src/common/base-entity` (lib `WithAudit`), schema `admin`:
```ts
// permission.entity.ts — READ-ONLY init data (seeded; no create/update UI)
@Entity({ schema: 'admin', name: 'permission' })
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', length: 128, unique: true }) code: string;   // '<module>_<entity>:<action>'
  @Column({ type: 'varchar', length: 256 }) label: string;
  @Column({ type: 'varchar', length: 96 }) model: string;                 // '<module>_<entity>'
  @Column({ type: 'varchar', length: 48 }) action: string;               // 'create' | 'view' | ...
}

// role.entity.ts
@Entity({ schema: 'admin', name: 'role' })
@Unique(['code'])
export class Role extends BaseEntity {
  @Column({ type: 'varchar', length: 64 }) code: string;
  @Column({ type: 'varchar', length: 256 }) name: string;
  @Column({ type: 'varchar', array: true, default: '{}' }) permissions: string[];  // permission codes
  @Column({ default: true }) isActive: boolean;
}

// user.entity.ts — NO password column (Keycloak owns credentials)
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
Add the `entities/index.ts` barrel exporting all three.

- [ ] **Step 3: Repositories** — document `repositories/{permission,role,user}.repository.ts` following `init-entity.md` Step 2 exactly (Symbol I-token + class extends `BaseRepository<T>`), one per entity, plus the `repositories/index.ts` barrel.

- [ ] **Step 4: Verify the pack scaffolds the three entities**

Run: `rg -n "name: 'permission'|name: 'role'|name: 'user'|keycloakUserId|roleCodes" _refs/nestjs/write-code/init-admin.md`
Expected: all three entities + `keycloakUserId` + `roleCodes` present.

- [ ] **Step 5: Sync + commit**

```bash
cd "c:\Users\Admin\Documents\sdcorejs\sdcorejs-agent"
bash .claude/sync-skills.sh
git add _refs/nestjs/write-code/init-admin.md .claude/_refs plugin/_refs
git commit -m "feat(refs): add nestjs init-admin pack — admin module entities + repos (P1.1)"
```

## Task 2: `init-admin.md` — authz strategy, user-lookup JwtStrategy, services, controllers, wiring

**Files:**
- Modify: `_refs/nestjs/write-code/init-admin.md`

- [ ] **Step 1: User-lookup `JwtStrategy` (replaces the minimal one)**

Document `src/common/jwt.strategy.ts`. Because it injects `IUserService`, it CANNOT be wired via `SdCoreModule.forRoot({ jwt })` — document that init-admin wires the lib `JwtModule.forRoot({ jwks: { allowedIssuers } }, { strategy: JwtStrategy, imports: [AdminModule] })` separately (per core-catalog "JWT & Keycloak" + init-project Step 7 note), and the `SdCoreModule` `jwt` key is dropped:
```ts
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { type JwtPayload, KeycloakJwtStrategy } from '@sdcorejs/nestjs/jwt';
import { IUserService } from 'src/modules/admin/services';

@Injectable()
export class JwtStrategy extends KeycloakJwtStrategy {
  constructor(@Inject(IUserService) private readonly users: IUserService) { super(); }
  async validate(payload: JwtPayload) {
    const user = await this.users.internalDetail(payload.sub);   // lookup by keycloakUserId, fallback-sync
    if (!user || !user.isActive) throw new UnauthorizedException();
    return user;   // carries roleCodes + resolved `permissions` (set by internalDetail)
  }
}
```

- [ ] **Step 2: `AppPermissionStrategy` (app-DB; replaces `RolePermissionStrategy`)**

Document `src/common/app-permission.strategy.ts`:
```ts
import { Injectable } from '@nestjs/common';
import type { IPermissionStrategy } from '@sdcorejs/nestjs/permission';
import { ContextService } from '@sdcorejs/nestjs/context';

/** Permissions were resolved onto the user at JwtStrategy.validate (internalDetail →
 *  roleService.loadPermissions). This strategy just returns that flat code list. */
@Injectable()
export class AppPermissionStrategy implements IPermissionStrategy {
  constructor(private readonly ctx: ContextService) {}
  async load(): Promise<string[]> {
    const user = this.ctx.get('user') as { permissions?: string[] } | undefined;
    return user?.permissions ?? [];
  }
}
```

- [ ] **Step 3: Services — `permission`, `role` (with `loadPermissions`), `user` (with `internalDetail` + KC proxy calls)**

Document the three services (extend `BaseService`, follow `init-entity.md` Step 4 for `mapDTO`). Show the NOVEL methods in full:
```ts
// role.service.ts — resolve a user's roleCodes → flat permission codes
loadPermissions = async (roleCodes: string[]): Promise<string[]> => {
  if (!roleCodes?.length) return [];
  const roles = await this.repository.repository.find({ where: { code: In(roleCodes), isActive: true } });
  return Array.from(new Set(roles.flatMap((r) => r.permissions ?? [])));
};

// user.service.ts — login lookup + fallback-sync; sets dto.permissions
internalDetail = async (keycloakUserId: string): Promise<UserDTO | undefined> => {
  let row = await this.repository.repository.findOne({ where: { keycloakUserId } });
  if (!row) { /* fallback: fetch from Keycloak via keycloakAdmin.findUser(sub), insert a row */ }
  if (!row) return undefined;
  const dto = this.mapDTO(row)!;
  dto.permissions = await this.roleService.loadPermissions(dto.roleCodes);
  return dto;
};
```
`UserDTO` (in `src/modules/admin/dto/user.dto.ts`, extends `Dto`) carries `permissions?: string[]` + `roleCodes: string[]`. Account-mutating service methods (`createDTO`/`updateDTO`/`resetPassword`/`setEnabled`/`remove`) delegate to the `keycloak-admin.service` (Task 3 of P2) THEN sync the row — mark those as implemented in P2.

- [ ] **Step 4: Controllers + zod + module wiring** — document `controllers/{permission,role,user}.controller.ts` (follow `init-entity.md` Step 6: `BaseController` + `@HasPermission`), the admin permission codes (`admin_user:{view,create,update,delete,reset_password,assign_roles}`, `admin_role:{view,create,update,delete}`, `admin_permission:view`), the `schemas/admin.schema.ts` zod pairs, and `admin.module.ts` wiring (follow `init-module.md` Step 2 + `init-entity.md` Step 7). Permission controller exposes READ routes only (no create/update).

- [ ] **Step 5: `app.module.ts` reconciliation note** — document that init-admin updates the app module: register `AppPermissionStrategy` as the `permission.strategy`, drop the `SdCoreModule` `jwt` key, add the separately-wired `JwtModule.forRoot(..., { strategy: JwtStrategy, imports: [AdminModule] })`, and add `AdminModule` to imports + a `RouterModule` `{ path: 'admin', module: AdminModule }` entry.

- [ ] **Step 6: Verify**

Run: `rg -n "AppPermissionStrategy|internalDetail|loadPermissions|JwtModule.forRoot|admin_user:create" _refs/nestjs/write-code/init-admin.md`
Expected: all present.

- [ ] **Step 7: Sync + commit**

```bash
bash .claude/sync-skills.sh
git add _refs/nestjs/write-code/init-admin.md .claude/_refs plugin/_refs
git commit -m "feat(refs): init-admin authz strategy + user-lookup JWT + services/controllers (P1.2)"
```

---

# PHASE 2 — Seed & bootstrap + Keycloak admin client

## Task 3: `init-admin.md` — Keycloak Admin proxy + seed step

**Files:**
- Modify: `_refs/nestjs/write-code/init-admin.md`

- [ ] **Step 1: `keycloak-admin.service.ts`**

Document `src/modules/admin/services/keycloak-admin.service.ts` using `@keycloak/keycloak-admin-client` (declare it an APP dep — `npm i @keycloak/keycloak-admin-client`, not part of the core):
```ts
import { Injectable } from '@nestjs/common';
import KcAdminClient from '@keycloak/keycloak-admin-client';

@Injectable()
export class KeycloakAdminService {
  // simple profile: single realm from env. (enterprise overrides per-tenant — see Enterprise extension.)
  #client = async () => {
    const kc = new KcAdminClient({ baseUrl: process.env.KEYCLOAK_URL, realmName: process.env.KEYCLOAK_REALM });
    await kc.auth({ grantType: 'client_credentials', clientId: process.env.KEYCLOAK_ADMIN_CLIENT_ID!, clientSecret: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET! });
    return kc;
  };
  createUser = async (u: { username: string; email?: string; fullName?: string; password: string }) => {
    const kc = await this.#client();
    const { id } = await kc.users.create({ username: u.username, email: u.email, enabled: true, firstName: u.fullName });
    await kc.users.resetPassword({ id, credential: { type: 'password', value: u.password, temporary: false } });
    return id;   // keycloakUserId
  };
  resetPassword = async (keycloakUserId: string, password: string) => {
    const kc = await this.#client();
    await kc.users.resetPassword({ id: keycloakUserId, credential: { type: 'password', value: password, temporary: false } });
  };
  setEnabled = async (keycloakUserId: string, enabled: boolean) => { const kc = await this.#client(); await kc.users.update({ id: keycloakUserId }, { enabled }); };
  deleteUser = async (keycloakUserId: string) => { const kc = await this.#client(); await kc.users.del({ id: keycloakUserId }); };
  findUser = async (keycloakUserId: string) => { const kc = await this.#client(); return kc.users.findOne({ id: keycloakUserId }); };
}
```
Document that `user.service` account mutations call this Keycloak-first, then sync the DB row.

- [ ] **Step 2: Seed step (idempotent, on boot)**

Document `src/modules/admin/admin.seed.ts` run from `main.ts` after `ensureSchemas()`:
1. Collect permission codes — at generation time the pack writes a `PERMISSION_REGISTRY` constant assembled from every `@HasPermission` the build emits (domain + admin). Upsert each into `permission` (code/label/model/action; idempotent on `code`).
2. Upsert the `admin` role with `permissions = all codes`.
3. Resolve the Keycloak `demo` user id (`keycloak-admin.service.findUser`/list by username) **with retry-backoff until Keycloak is reachable**; upsert an app `user` row `{ keycloakUserId, username:'demo', roleCodes:['admin'] }`.
Document the retry/idempotency explicitly (boot races Keycloak; steps 1–2 are DB-only and never block; step 3 retries).

- [ ] **Step 3: `.env` additions** — document that init-admin adds `KEYCLOAK_ADMIN_CLIENT_ID` + `KEYCLOAK_ADMIN_CLIENT_SECRET` to `.env.example`, and `@keycloak/keycloak-admin-client` to `package.json` deps.

- [ ] **Step 4: Verify**

Run: `rg -n "keycloak-admin-client|KEYCLOAK_ADMIN_CLIENT_SECRET|PERMISSION_REGISTRY|retry|admin.seed" _refs/nestjs/write-code/init-admin.md`
Expected: all present.

- [ ] **Step 5: Sync + commit**

```bash
bash .claude/sync-skills.sh
git add _refs/nestjs/write-code/init-admin.md .claude/_refs plugin/_refs
git commit -m "feat(refs): init-admin Keycloak Admin proxy + idempotent boot seed (P2.1)"
```

## Task 4: `sdcorejs-auth` + realm — admin service-account client; remove Step 1.5

**Files:**
- Modify: `skills/infra/auth.md`
- Modify: `_refs/infra/auth-keycloak.md`
- Modify: `_refs/infra/keycloak/realm-export.json`

- [ ] **Step 1: Realm — seed a confidential admin client**

In `_refs/infra/keycloak/realm-export.json`, add a confidential client `app-admin` (service accounts enabled) granted realm-management `manage-users` + `view-users` (least-privilege for simple). Add its secret as a placeholder the deploy `.env` overrides. Keep `app-spa` + `demo`/`demo` + `user`/`admin` roles as-is.

- [ ] **Step 2: `auth.md` — replace Step 1.5**

Step 1.5 currently seeds codes-as-realm-roles for the simple profile. REPLACE its body: permissions now come from the **admin module** (app-DB role/permission), NOT realm roles, in BOTH profiles. The auth step's job re: permissions becomes: confirm the `app-admin` service-account client exists + set `KEYCLOAK_ADMIN_CLIENT_ID`/`KEYCLOAK_ADMIN_CLIENT_SECRET` in BE env (so the admin module can proxy the Admin API). Keep the demo `demo/demo` login. Remove the codes-as-realm-roles seeding instruction entirely.

- [ ] **Step 3: `auth-keycloak.md` — §1 + §7 update**

§1: the realm seeds `app-spa` (public, FE) + `app-admin` (confidential, BE service account for the Admin API). §7 (Permission model by profile): rewrite — in BOTH profiles permissions come from the generated admin module (app-DB role→permission codes resolved at login via `JwtStrategy`→`internalDetail`→`loadPermissions`); realm roles are NOT the permission source anymore. Remove the "simple = realm roles ARE codes" framing.

- [ ] **Step 4: Verify**

```bash
rg -n "app-admin|KEYCLOAK_ADMIN_CLIENT" skills/infra/auth.md _refs/infra/auth-keycloak.md _refs/infra/keycloak/realm-export.json
rg -n "realm roles ARE the permission codes|codes-as-realm-roles" skills/infra/auth.md _refs/infra/auth-keycloak.md
```
Expected: `app-admin` + admin-client env present in all three; the old "realm roles ARE the permission codes" framing GONE (exit 1 on the second grep).

- [ ] **Step 5: Sync + commit**

```bash
bash .claude/sync-skills.sh
git add skills/infra/auth.md _refs/infra/auth-keycloak.md _refs/infra/keycloak/realm-export.json .claude/skills plugin/skills .claude/_refs plugin/_refs
git commit -m "feat(infra): admin service-account client; permissions from admin module not realm roles (P2.2)"
```

---

# PHASE 3 — FE admin screens (`admin-screens.md`)

## Task 5: Create the `admin-screens.md` pack (simple: account/role/permission)

**Files:**
- Create: `_refs/angular/write-code/admin-screens.md`

- [ ] **Step 1: Header + profile note + module structure**

Create (no frontmatter): a pack that generates `src/libs/admin/` with three features (account, role, permission), routed under `/admin`, each on the canonical list/detail layout. Profile note: simple = account/role/permission; enterprise = + tenant/department (Enterprise extension section). Reference the angular `screen-list.md` + `screen-detail.md` packs for the list/drawer scaffolding (don't re-derive Core UI boilerplate).

- [ ] **Step 2: Account screen**

Document `src/libs/admin/features/account/` — `SdTable<UserDTO>` columns (username/email/fullName/roles/active); a create/edit drawer (reactive form: username/email/fullName + multi-select roleCodes); row actions reset-password (prompt + call `POST /api/admin/user/:id/reset-password`), enable/disable (`PUT .../enabled`), delete. Each action + column gated by `*sdPermission="'admin_user:<action>'"` (`SdPermissionDirective`). Calls hit the BE which proxies Keycloak.

- [ ] **Step 3: Role screen**

Document `src/libs/admin/features/role/` — list + create/edit drawer. The permission-assign control: a **grid grouped by `model`** (rows) × `action` (columns) of checkboxes; checking writes the flat code into the form's `permissions: string[]`; the grid options come from `GET /api/admin/permission` (the registry). Gated `admin_role:*`.

- [ ] **Step 4: Permission screen (read-only)**

Document `src/libs/admin/features/permission/` — read-only `SdTable` of the registry grouped by model; NO create/edit/delete. Gated `admin_permission:view`.

- [ ] **Step 5: Route + menu registration** — document adding the `/admin` routes + a sidebar "Quản trị" group (Tài khoản / Vai trò / Quyền), each menu item gated by the matching `:view` code.

- [ ] **Step 6: Verify**

Run: `rg -n "features/account|features/role|features/permission|sdPermission|admin_user:|reset-password" _refs/angular/write-code/admin-screens.md`
Expected: all three features + permission-gating + reset-password action present.

- [ ] **Step 7: Sync + commit**

```bash
bash .claude/sync-skills.sh
git add _refs/angular/write-code/admin-screens.md .claude/_refs plugin/_refs
git commit -m "feat(refs): add angular admin-screens pack — account/role/permission (P3)"
```

---

# PHASE 4 — Enterprise extension (tenant + department)

## Task 6: Enterprise branch in both packs

**Files:**
- Modify: `_refs/nestjs/write-code/init-admin.md`
- Modify: `_refs/angular/write-code/admin-screens.md`

- [ ] **Step 1: BE — tenant + department entities (enterprise only)**

In `init-admin.md`, add an `## Enterprise extension` section: `tenant { code, name, realm, clientId, clientSecret (encrypted), isActive }` + `department { code, name, parentCode, tenantCode }`; add `@Scoped tenantCode` + `@Scoped departmentCode` to `role` + `user`; `keycloak-admin.service` `#client()` resolves realm/clientId/secret from the tenant row (per-tenant) instead of env; `app-admin` needs `+manage-realm`. Permission codes `admin_tenant:*`, `admin_department:*` added to the registry. Mark all of this `[enterprise]`.

- [ ] **Step 2: FE — tenant + department screens (enterprise only)**

In `admin-screens.md`, add an `## Enterprise extension` section: `features/tenant/` (list/detail: code/name/realm/clientId; secret write-only) + `features/department/` (tree on parent/level); account + role forms gain tenant + department selectors. Gated `admin_tenant:*` / `admin_department:*`. Mark `[enterprise]`.

- [ ] **Step 3: Verify**

```bash
rg -n "Enterprise extension|admin_tenant:|department|per-tenant|manage-realm" _refs/nestjs/write-code/init-admin.md
rg -n "Enterprise extension|features/tenant|features/department" _refs/angular/write-code/admin-screens.md
```
Expected: enterprise sections + tenant/department in both packs.

- [ ] **Step 4: Sync + commit**

```bash
bash .claude/sync-skills.sh
git add _refs/nestjs/write-code/init-admin.md _refs/angular/write-code/admin-screens.md .claude/_refs plugin/_refs
git commit -m "feat(refs): admin module enterprise extension — tenant + department (P4)"
```

---

# PHASE 5 — Orchestrator threading + simple-profile revision

## Task 7: `nestjs-write-code` + `angular-write-code` always run the admin packs

**Files:**
- Modify: `skills/tracks/nestjs/write-code.md`
- Modify: `skills/tracks/angular/write-code.md`

- [ ] **Step 1: nestjs orchestrator** — in `skills/tracks/nestjs/write-code.md`, add `init-admin` to the dispatch table + the execution order so it ALWAYS runs right after `init-project` and BEFORE any `init-module`/`init-entity` (it owns `IPermissionStrategy`). Add a MUST-DO: "Every generated backend includes the `admin` module (authn/authz authority) — run `init-admin` before domain modules."

- [ ] **Step 2: angular orchestrator** — in `skills/tracks/angular/write-code.md`, add `admin-screens` to the dispatch table + always run it after `init-portal`. MUST-DO: "Every generated portal includes the admin screens."

- [ ] **Step 3: Verify**

```bash
rg -n "init-admin|admin module|authn/authz" skills/tracks/nestjs/write-code.md
rg -n "admin-screens|admin screens" skills/tracks/angular/write-code.md
```
Expected: matches in both.

- [ ] **Step 4: Sync + commit**

```bash
bash .claude/sync-skills.sh
git add skills/tracks/nestjs/write-code.md skills/tracks/angular/write-code.md .claude/skills plugin/skills
git commit -m "feat(skills): orchestrators always generate the admin module + screens (P5.1)"
```

## Task 8: Revise the simple-profile auth in `init-project.md` + core-catalog note

**Files:**
- Modify: `_refs/nestjs/write-code/init-project.md`
- Modify: `_refs/nestjs/core-catalog.md`

- [ ] **Step 1: init-project simple `common/` set** — in the `**Profile: simple**` Step 6 set, REMOVE `role-permission.strategy.ts` (the realm-roles strategy) and the minimal `jwt.strategy.ts`; replace with a one-line pointer: "the `admin` module (`init-admin`) emits `AppPermissionStrategy` + the user-lookup `JwtStrategy` — `init-project` no longer emits a permission/JWT strategy; it leaves the `SdCoreModule` `permission`/`jwt` wiring to `init-admin`." Keep `base-entity.ts`, `errors.ts`, `dto.ts`.

- [ ] **Step 2: init-project simple `app.module.ts`** — note that the `SdCoreModule.forRoot` simple variant drops the `permission`/`jwt` keys (init-admin wires them); `RolePermissionStrategy`/`JwtStrategy` imports removed from the simple app.module template.

- [ ] **Step 3: core-catalog note** — in `_refs/nestjs/core-catalog.md`, extend the "Neutral core vs app templates" note: "The generated **admin module** (`init-admin`) owns `IPermissionStrategy` (app-DB roles→codes) + the user-lookup `JwtStrategy`; the lib ships only the neutral `IPermissionStrategy` interface + `KeycloakJwtStrategy` base."

- [ ] **Step 4: Verify (enterprise still preserved; simple no longer ships realm strategy)**

```bash
rg -n "RolePermissionStrategy" _refs/nestjs/write-code/init-project.md   # should now appear only in removal/pointer note context, NOT as an emitted simple file
rg -n "AppPermissionStrategy|init-admin" _refs/nestjs/write-code/init-project.md _refs/nestjs/core-catalog.md
```
Expected: simple no longer emits `RolePermissionStrategy`; init-admin/AppPermissionStrategy referenced.

- [ ] **Step 5: Sync + commit**

```bash
bash .claude/sync-skills.sh
git add _refs/nestjs/write-code/init-project.md _refs/nestjs/core-catalog.md .claude/_refs plugin/_refs
git commit -m "refactor(refs): init-project defers permission/JWT strategy to the admin module (P5.2)"
```

## Task 9: `solution-builder` builds admin first + final gate + design status

**Files:**
- Modify: `skills/orchestration/solution-builder.md`
- Modify: `docs/superpowers/specs/2026-06-07-always-on-admin-module-design.md`

- [ ] **Step 1: solution-builder** — in chain step 4 (Mode B), add a maintainer note: "The `admin` module is the FIRST unit built (its user/role/permission contract is part of the Phase-0 contract freeze); domain features follow. End users administer accounts/roles in-app — never the Keycloak console." Add to the user-facing plain text: "bạn sẽ có sẵn trang quản trị để tạo tài khoản và phân quyền."

- [ ] **Step 2: design status** — flip the design doc Status to "Delivered — admin module shipped on `feat/non-tech-solution-builder`".

- [ ] **Step 3: Full repo gate**

```bash
bash .claude/sync-skills.sh --check     # all 4 mirrors in sync
npx lefthook run check                  # green
git status --short                      # only intended files
```

- [ ] **Step 4: Commit**

```bash
git add skills/orchestration/solution-builder.md docs/superpowers/specs/2026-06-07-always-on-admin-module-design.md .claude/skills plugin/skills
git commit -m "feat(skills): solution-builder builds admin module first; mark admin design delivered (P5.3)"
```

---

## Acceptance criteria → task map (self-review)

| Spec criterion | Task(s) |
|---|---|
| simple admin module (user/role/permission, app-DB strategy, user-lookup JWT, no tenancy) | T1, T2 |
| enterprise + tenant/department + 2-level @Scoped + per-tenant realm | T6 |
| account ops proxy Keycloak Admin API (KC-first, sync DB) | T3 (service), T2 (user.service delegation) |
| permission read-only, seeded from generated @HasPermission | T2 (read-only controller), T3 (seed/registry) |
| role CRUD writes permissions: string[]; grid is display sugar | T2 (role.service), T5 (role screen) |
| login: sub → app user → role permissions → flat codes | T2 (JwtStrategy + internalDetail + loadPermissions) |
| first boot: demo has admin role, no Keycloak console | T3 (seed + retry), T4 (demo login kept) |
| nestjs runs init-admin first; angular runs admin-screens; solution-builder admin-first | T7, T9 |
| simple-profile revisions (RolePermissionStrategy/jwt/Step 1.5 replaced); flat code convention intact | T4 (Step 1.5), T8 (init-project) |
| sync --check + lefthook green; new packs are _refs/** no-frontmatter | every commit; T9 final gate |

All spec acceptance criteria map to ≥1 task. No gaps.
