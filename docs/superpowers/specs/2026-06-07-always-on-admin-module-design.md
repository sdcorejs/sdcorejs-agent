# Design — Always-on Admin Module (authn/authz authority for generated apps)

**Date:** 2026-06-07
**Status:** Delivered — admin module shipped on `feat/non-tech-solution-builder` (init-admin BE pack + admin-screens FE pack, simple+enterprise; auth/realm reconciled; orchestrators always-run; init-project simple-profile revised). Live `docker compose up` validation remains a deferred target-project E2E.
**Branch:** builds on `feat/non-tech-solution-builder` (continues the profile-tier + role-split-loop work).
**Author:** brainstorming session (Opus 4.8), grounded on the `enterprise-platform` reference (`src/modules/admin/*`) + sibling `enterprise-portal` admin screens.

## TL;DR

Every solution-builder-generated app gets an **always-on admin module** that owns authn/authz for the whole project, so end users never open the Keycloak admin console. Functions (kept minimal): **account management** (create/edit/delete/reset-password/enable-disable), **role management** (CRUD + assign permission codes + assign roles to users), **permission list** (read-only, init data), and — enterprise profile only — **tenant** + **department** management. Identity stays in Keycloak (proxied via its Admin API); authorization moves to an app-DB role/permission store. This **revises the just-shipped simple profile** (its flat `realm-roles = codes` model + `auth` Step 1.5 are replaced).

## Problem & motivation

The just-shipped simple profile manages permissions as flat Keycloak realm roles and ships **no in-app account management** — users/roles are administered in the Keycloak admin console (`:8080`). A non-technical owner should never have to do that. The requirement: a built-in admin area where a privileged app user self-serves accounts, roles, and permissions; the admin module is the **single authn/authz authority** for the project.

## Decisions (brainstorm)

| # | Decision | Choice |
|---|---|---|
| D1 | Authz model | **Hybrid** — Keycloak = identity source (accounts/passwords/login, proxied via Admin API); app-DB = authz source (role/permission tables). Applies to BOTH profiles. Matches `enterprise-platform`. |
| D2 | Screen scope per profile | **simple** = Account + Role + Permission(read-only). **enterprise** = + Tenant + Department (2-level scope). |
| D3 | Permission representation | **Flat codes** `<module>_<entity>:<action>` (seeded from generated `@HasPermission`); roles hold `permissions: string[]`. Role-edit UI renders a model×action grid but stores flat codes. NO GROUP/COMPONENT matrix. |
| D4 | Packaging | **2 new on-demand packs**, always auto-run: BE `_refs/nestjs/write-code/init-admin.md`, FE `_refs/angular/write-code/admin-screens.md`. Revise the just-shipped simple-profile auth pieces. |
| D5 | Branch | Build on `feat/non-tech-solution-builder`; defer merge until the cluster is done. |

## Reference grounding (`enterprise-platform`)

- `src/modules/admin/` entities: `user, role, permission, tenant, department, domain`. Services include `keycloak-admin.service.ts` (`@keycloak/keycloak-admin-client`, per-tenant `client_credentials`).
- Hybrid store: account CRUD is Keycloak-first then DB sync (`user.keycloakUserId`); `role.permissions: string[]`, `user.roleCodes: string[]`; permission codes seeded as init data.
- Login: `JwtStrategy.validate(payload.sub)` → `userService.internalDetail(sub)` → `roleService.loadPermissions(roleCodes)` → flat codes.
- FE admin screens in sibling `enterprise-portal/src/modules/admin/features/` (user/role/permission/department/tenant) on Core UI (`SdTable`, `SdPermissionDirective`, `PopupConfirmComponent`).

This design **simplifies** that reference: flat codes (drop the GROUP/COMPONENT matrix + `PagePermissionService` matrix object), no `domain`/`realm`/`client` master screens, no MASTER/TENANT_ADMIN scope flags in simple.

---

## §1 — Authz core (BE)

**Module** `admin` (Postgres schema `admin`), generated FIRST (before any domain module) because it owns the project's `IPermissionStrategy`.

**Entities:**
- `permission` — read-only init data. `{ id, code: '<module>_<entity>:<action>', label, model, action }`. `code` unique. Seeded from every generated `@HasPermission(...)` (domain modules + the admin module's own).
- `role` — `{ id, code, name, permissions: string[] /* codes */, isActive }`. enterprise adds `@Scoped tenantCode`, `@Scoped departmentCode`.
- `user` — `{ id, keycloakUserId (uuid, unique), username, email, fullName, roleCodes: string[], isActive }`. **No password column** (Keycloak owns credentials). enterprise adds `tenantCode`, `departmentCode`.
- enterprise only: `tenant { id, code, name, realm, clientId, clientSecret (encrypted), isActive }`, `department { id, code, name, parentCode, tenantCode }`.

**Permission resolution (replaces simple's `RolePermissionStrategy`):**
- `JwtStrategy.validate(payload.sub)` → `IUserService.internalDetail(sub)` (lookup by `keycloakUserId`; fallback-sync a DB row from Keycloak if absent) → attach the user to `req.user`.
- `AppPermissionStrategy implements IPermissionStrategy`: `load()` returns `roleService.loadPermissions(user.roleCodes)` = the deduped union of `role.permissions` for the user's roles → flat `string[]`.
- `@HasPermission('<code>')` checks membership; `ContextService.hasPermission(code)` same. (No matrix object.)
- `roleService.loadPermissions` cached per `(role set)`; invalidated on role edit.

**Admin module's own permission codes** (part of the seeded registry, gate the admin screens): `admin_user:{view,create,update,delete,reset_password,assign_roles}`, `admin_role:{view,create,update,delete}`, `admin_permission:{view}`, and enterprise `admin_tenant:{view,create,update,delete}`, `admin_department:{view,create,update,delete}`.

## §2 — Account management = Keycloak Admin API proxy

`keycloak-admin.service.ts` wraps `@keycloak/keycloak-admin-client`:
- Auth: `client_credentials` against a privileged service-account client. simple → realm `app`, one admin client. enterprise → per-tenant realm + the tenant row's `clientId`/`clientSecret`.
- Ops: `createUser`, `updateUser`, `disableUser`/`enableUser`, `deleteUser`, `resetPassword` → **Keycloak first**, then sync the app-DB `user` row (`keycloakUserId`). Reads come from the DB; `detail` fallback-syncs from Keycloak when a row is missing.
- **Infra (added by `init-admin` + reconciled in `sdcorejs-auth`/`dockerize`):** the realm import seeds a confidential service-account client with least-privilege realm-management roles — simple: `manage-users` + `view-users`; enterprise: + `manage-realm` (to create per-tenant realms/clients). New env: `KEYCLOAK_ADMIN_CLIENT_ID`, `KEYCLOAK_ADMIN_CLIENT_SECRET`. New dep: `@keycloak/keycloak-admin-client`.

## §3 — Screens (FE Angular, Core UI)

Module `admin` under the portal. Each screen uses `SdTable` (server-side paging) + a create/edit drawer + `SdPermissionDirective` to hide actions the user can't perform.

**simple (always):**
- **Tài khoản** — list (username/email/fullName/roles/active); create/edit drawer; row actions: reset password, enable/disable, delete (all proxy Keycloak via BE). Gated `admin_user:*`.
- **Vai trò** — list; create/edit; **permission-assign grid** (rows grouped by `model` = `<module>_<entity>`, columns = actions; checking a cell adds the flat code to `role.permissions[]`); assign roles to users from the account screen. Gated `admin_role:*`.
- **Quyền** — read-only table of the permission registry, grouped by model. Gated `admin_permission:view`.

**enterprise (adds):**
- **Tenant** — list/detail (code/name/realm/clientId; secret write-only). Gated `admin_tenant:*`.
- **Department** — tree (parent/level). Gated `admin_department:*`. User + role forms gain tenant + department selectors.

## §4 — Seeding & bootstrap (works on first boot)

`init-admin` emits a seed step (idempotent, runs on boot after `ensureSchemas`):
1. Upsert the `permission` registry from ALL generated `@HasPermission` codes (grep the generated controllers + the admin module's own codes).
2. Upsert a default **`admin` role** holding every code.
3. Ensure an app `user` row for the seeded Keycloak **`demo`** user (`keycloakUserId` resolved via the admin API), `roleCodes=['admin']`.

Result: `demo/demo` logs in with full admin and manages everything in-app — no Keycloak console. **Replaces** `sdcorejs-auth` Step 1.5 (codes-as-realm-roles), which is removed.

## §5 — Packaging, threading & revisions

**New packs (auto-run, profile-branched):**
- `_refs/nestjs/write-code/init-admin.md` — the admin module (entities/repos/services/controllers/zod), the app-DB `AppPermissionStrategy`, the user-lookup `JwtStrategy`, `keycloak-admin.service`, and the seed step. Runs as the FIRST backend unit.
- `_refs/angular/write-code/admin-screens.md` — the admin feature screens.

**Orchestrator wiring:**
- `nestjs-write-code`: ALWAYS dispatch `init-admin` right after `init-project`, before domain `init-module`/`init-entity` (it owns `IPermissionStrategy`). MUST-DO: admin module present in every generated backend.
- `angular-write-code`: ALWAYS dispatch `admin-screens` after `init-portal`.
- `solution-builder` (Mode B): the admin module is the FIRST unit; its contract (user/role/permission DTOs + endpoints + codes) is part of the Phase-0 contract freeze.

**Revisions to the just-shipped simple profile (init-project):**
- `RolePermissionStrategy` (realm-roles → codes) → REPLACED by `AppPermissionStrategy` (app-DB roles). 
- minimal `jwt.strategy` (sub + realm roles) → REPLACED by the user-lookup strategy (`sub` → app user → permissions).
- `sdcorejs-auth` Step 1.5 (seed codes-as-realm-roles) → REMOVED (permissions are app-DB now); `auth-keycloak.md` §7 updated to say permissions come from the admin module in both profiles.
- The flat `<module>_<entity>:<action>` permission-code convention STAYS unchanged.
- `core-catalog.md` note: the generated admin module owns `IPermissionStrategy`; the lib still only ships the neutral interface.

## §6 — Over-fit reconciliation

The admin module reintroduces app-DB role/permission + the Keycloak-admin proxy — **deliberately**, per the requirement — but kept minimal vs `enterprise-platform`:
- flat codes, NOT the GROUP/COMPONENT permission hierarchy + matrix object;
- no MASTER/TENANT_ADMIN scope flags in simple;
- tenant/department/per-tenant-realm only in enterprise;
- no `domain`/`realm`/`client` master screens.

So the profile tier still earns its keep (tenancy is the only simple↔enterprise difference), and the page-permission *matrix* complexity flagged in the over-fit review is NOT brought back.

## Acceptance criteria

- [ ] A `simple` build emits an `admin` module with `user`/`role`/`permission` entities, `AppPermissionStrategy` (app-DB), and a user-lookup `JwtStrategy`; NO `tenant`/`department`, NO MASTER/TENANT_ADMIN.
- [ ] An `enterprise` build additionally emits `tenant` + `department` entities/screens with 2-level `@Scoped`.
- [ ] Account ops (create/update/delete/reset-password/enable-disable) call the Keycloak Admin API (Keycloak-first) then sync the app-DB `user` row.
- [ ] `permission` is read-only and seeded from the generated `@HasPermission` codes (incl. the admin module's own); the FE Permission screen has no create/edit.
- [ ] `role` CRUD writes `permissions: string[]`; the role-edit grid is display-only sugar over flat codes.
- [ ] Login resolves: token `sub` → app user → role permissions → flat codes; `@HasPermission` matches.
- [ ] On first boot, `demo/demo` has the seeded `admin` role and can use every admin screen with NO Keycloak console step.
- [ ] `nestjs-write-code` runs `init-admin` before domain modules; `angular-write-code` runs `admin-screens`; `solution-builder` builds admin first.
- [ ] Simple-profile revisions applied: `RolePermissionStrategy`/minimal `jwt.strategy`/auth Step 1.5 replaced/removed; flat code convention intact.
- [ ] `bash .claude/sync-skills.sh --check` + `npx lefthook run check` green; both new packs are `_refs/**` (no frontmatter).

## Risks & mitigations

- **Privileged Keycloak client in env** — a powerful credential. Mitigation: least-privilege roles (simple: manage/view-users only), confidential client, secret only in BE env, documented.
- **Two-store sync drift** (KC user vs app `user` row) — Mitigation: Keycloak-first writes + read-time fallback-sync (the enterprise-platform pattern).
- **Reintroducing complexity** — Mitigation: §6 minimalism; flat codes; tenancy gated to enterprise.
- **Boot-time seed depends on Keycloak readiness** — the demo-user grant resolves `keycloakUserId` via the admin API, but on `docker compose up` Keycloak + backend start together. Mitigation: the seed retries-with-backoff until Keycloak is reachable (and the admin client exists), and is idempotent so a restart re-converges; permission/role seeding (DB-only) runs first and never blocks on Keycloak.
- **Large subsystem** — Mitigation: phased plan, each phase independently testable (see below).
- **Live `docker compose up` E2E** — still a deferred target-project validation (the agent repo can't run it).

## Out of scope

- `domain`/`realm`/`client` Keycloak master screens (enterprise-platform has them; not needed here).
- The GROUP/COMPONENT permission hierarchy + matrix object.
- Self-service signup / password-reset-by-email flows (admin-driven only).
- nextjs track (admin module is angular+nestjs).
- Migrating already-generated apps to the admin module (forward-only).

## Suggested phasing (for the plan)

1. **BE admin core** — `init-admin.md`: entities + repos/services/controllers + `AppPermissionStrategy` + user-lookup `JwtStrategy` (simple scope).
2. **Seed & bootstrap** — permission-registry seeding from `@HasPermission`, default `admin` role, demo-user grant; Keycloak admin service-account client + env + dep; `sdcorejs-auth` Step 1.5 removal.
3. **FE admin screens** — `admin-screens.md`: account/role/permission screens (simple).
4. **Enterprise extension** — tenant + department entities/screens + 2-level scope + per-tenant realm in the proxy.
5. **Orchestrator threading** — `nestjs-write-code`/`angular-write-code` always-run wiring + `solution-builder` admin-first + the simple-profile revisions to `init-project`.

Each phase is independently committable + mirror-synced; Phase 1–3 deliver a working single-tenant admin module before the enterprise extension.
