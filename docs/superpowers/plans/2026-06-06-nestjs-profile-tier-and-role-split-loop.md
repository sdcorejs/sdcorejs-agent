# NestJS Profile Tier + Role-Split Feature Loop — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generalize the NestJS write-code packs behind a `simple|enterprise` profile (killing the `@enterprise-platform` over-fit), repair two doc-drift refs, and add a role-split (BE‖FE‖QC) feature loop as Mode B of `subagent-driven-dev`.

**Architecture:** This is **meta-work on the `sdcorejs-agent` repo's own skills + `_refs`** — there is no application runtime to unit-test. The source of truth is `skills/<area>/*.md` + `_refs/**`; `.claude/skills`, `plugin/skills`, `.claude/_refs`, `plugin/_refs` are **generated mirrors** (NEVER hand-edit). Every change to `skills/**` or `_refs/**` is followed by `bash .claude/sync-skills.sh` and staging the regenerated mirrors; `lefthook` re-syncs + checks on commit. "Verification" = `bash .claude/sync-skills.sh --check`, `npx lefthook run check`, and targeted `rg` assertions proving the edit's intent.

**Tech Stack:** Markdown skills with YAML frontmatter; `bash` sync script; `lefthook` git hooks; `rg` (ripgrep) for verification probes.

**Design doc:** `docs/superpowers/specs/2026-06-06-nestjs-generalization-and-role-split-loop-design.md`

---

## Conventions for every task in this plan

- **Edit source only:** `skills/**` and `_refs/**`. Never touch `.claude/skills`, `plugin/skills`, `.claude/_refs`, `plugin/_refs`.
- **Sync before commit:** every commit step runs `bash .claude/sync-skills.sh` first, then `git add` the source file(s) **and** the regenerated mirror dirs.
- **`_refs/**` files carry NO frontmatter** (reference data); `skills/**` files MUST keep their `name`/`description`/`allowed-tools` frontmatter.
- **`sync-skills.sh` takes ~30–90s.** The benign `WARN: no 'name:' frontmatter in skills/tracks/nestjs/_README.md` is expected — not a failure.
- **`enterprise` profile = no behavior change.** Where a task "wraps existing content under an `enterprise` branch", the existing template text is moved verbatim — do not reword it. Verification asserts the enterprise markers still exist.

---

## File Structure (decomposition)

| File | Responsibility | Phase |
|---|---|---|
| `_refs/nestjs/review-code.md` | Reconcile reviewer probes to `@sdcorejs/nestjs` (off `be-masterdata`) | 1 |
| `_refs/nestjs/architecture-principles.md` | Fix §2/§4/§13 drift | 1 |
| `_refs/sdlc/nestjs.md` | Add `profile` to the clarify minimum-required + summary template | 2 |
| `skills/shared/sdlc/02-clarify-requirements.md` | Surface `profile` as a blocking nestjs question | 2 |
| `_refs/nestjs/write-code/init-project.md` | Profile branch: base-entity, app.module, permission, jwt, base/shared, internal-secret | 2 |
| `_refs/nestjs/write-code/init-module.md` | Profile branch: DTO/contract location, cross-module note | 2 |
| `_refs/nestjs/write-code/init-entity.md` | Profile branch: entity columns, DTO location, mapDTO gating | 2 |
| `_refs/nestjs/write-code/actions.md` | Profile branch: `SdContext` fields, permission codes | 2 |
| `_refs/nestjs/core-catalog.md` | Note neutral-core vs profile-template boundary | 2 |
| `skills/tracks/nestjs/write-code.md` | Read profile from summary; pass to each pack | 2 |
| `skills/orchestration/solution-builder.md` | Non-tech default `simple`; invoke Mode B for cross-track features | 2 + 3 |
| `skills/orchestration/subagent-driven-dev.md` | Mode selector + Mode B (role-split feature loop) body | 3 |
| `skills/orchestration/parallel-dispatch.md` | `ROLE-SPLIT` verdict branch | 3 |

---

# PHASE 1 — Doc-drift fixes (items 9–10)

Independent, no behavior change, ship first.

## Task 1: Reconcile `review-code.md` off the `be-masterdata` baseline

**Files:**
- Modify: `_refs/nestjs/review-code.md`

- [ ] **Step 1: Verify the stale references exist (baseline)**

Run: `rg -n "be-masterdata|core-be|bilingualMsg" _refs/nestjs/review-code.md`
Expected: matches on the "What this covers" line, §6 (`base/core-be/`), §7 (`bilingualMsg`), and the Cross-references footer.

- [ ] **Step 2: Replace the "What this covers" paragraph**

Replace:
```
Per-file code review for a NestJS backend following the `be-masterdata` baseline.
Different from `review/architecture` (structural), `sdcorejs-review`
(auth/injection), `sdcorejs-review` (queries). This file checks
adherence to NestJS + be-masterdata conventions.
```
with:
```
Per-file code review for a NestJS backend on the `@sdcorejs/nestjs` core.
Different from `sdcorejs-review-architecture` (structural). This file checks
adherence to the conventions the `nestjs-write-code` packs actually generate
(`_refs/nestjs/write-code/*`) at whichever **profile** the project uses
(`simple` | `enterprise`; see `init-project.md`). Probes that only apply to one
profile are marked `[enterprise]`.
```

- [ ] **Step 3: Fix §2 (Zod schema location) to match the packs**

Replace the §2 body so it checks for `src/modules/<module>/schemas/<module>.schema.ts` (what the packs emit) and notes that the shared `@shared` location is **`[enterprise]`-only**. New §2 probe:
```bash
# Inline Zod schemas in service / controller files = drift (schemas belong in schemas/<module>.schema.ts)
rg -n "z\.object\(\{" src/modules --glob '!**/schemas/**' 2>/dev/null | head
# Expected: 0 — all create/update schemas live in src/modules/<module>/schemas/
```
Severity stays 🟡.

- [ ] **Step 4: Fix §6 (base classes) — drop `base/core-be/`**

Replace the §6 heading + intro `` `BaseEntity` / `BaseRepository` / `BaseService` from `base/core-be/` `` with `from `@sdcorejs/nestjs/orm``, and note the entity base is `WithAudit(BaseEntity)` (simple) or the local `src/common/base-entity.ts` (`[enterprise]`). Keep the two probes but change the `extends BaseEntity` probe to also accept `extends WithAudit` / `extends BaseEntity` (local re-export).

- [ ] **Step 5: Fix §7 (bilingual errors) — drop `bilingualMsg`**

Replace the `bilingualMsg(vi, en)` mechanism with the actual one: errors go through `badRequest(code, data?)` (from `src/common/errors`) wrapping `apiError(code, message, data?)`, localized by the i18n catalog. New probe:
```bash
# Throws that bypass the i18n envelope (raw string message, not a code)
rg -n "throw new (BadRequestException|NotFoundException|ConflictException)\(['\"]" src/ | head
# Expected: 0 — domain errors use badRequest('<module>.<entity>.<rule>', data?)
```

- [ ] **Step 6: Fix the Cross-references footer**

Replace `Conventions referenced: be-masterdata baseline + `base/core-be/` + `base/shared/`` with `Conventions referenced: `@sdcorejs/nestjs` core (`_refs/nestjs/core-catalog.md`) + the write-code packs + `architecture-principles.md``.

- [ ] **Step 7: Verify the baseline is gone**

Run: `rg -n "be-masterdata|core-be|bilingualMsg" _refs/nestjs/review-code.md`
Expected: **no matches** (exit 1).

- [ ] **Step 8: Sync mirrors + commit**

```bash
bash .claude/sync-skills.sh
git add _refs/nestjs/review-code.md .claude/_refs plugin/_refs
git commit -m "fix(refs): reconcile nestjs review-code probes to @sdcorejs/nestjs (off be-masterdata)"
```

## Task 2: Fix `architecture-principles.md` §2 / §4 / §13 drift

**Files:**
- Modify: `_refs/nestjs/architecture-principles.md`

- [ ] **Step 1: Fix §2 audit-column name (`updatedBy` → `modifiedBy`)**

In §2, change the `BaseEntity` comment `// BaseEntity provides: id, createdAt, updatedAt, createdBy, updatedBy, deletedAt` to `// WithAudit(BaseEntity) provides: id, createdAt, updatedAt, deletedAt, createdBy, modifiedBy, creator, modifier`. Update the §2 prose that says "no entity ever forgets `createdBy`" to also name `modifiedBy`.

- [ ] **Step 2: Fix §4 schema location**

§4 currently says Zod lives in `libs/shared/schemas/product.schema.ts`. Replace the path + the "Defining the schema inside the module … can't share across modules" anti-pattern with the actual convention: schemas live in `src/modules/<module>/schemas/<module>.schema.ts`; the cross-FE-share via `@shared` is an **`[enterprise]`-profile** option, not the default. Keep the "no class-validator" rule (still correct).

- [ ] **Step 3: Fix §13 response envelope**

§13 shows `{ data, error: null }`. Replace with the core's `ApiResponse` envelope: `ApiResponse.ok(data)` / `ApiResponse.error(code, message, data?)` (from `@sdcorejs/nestjs`), and note the success payload shape the lib emits. Keep the "one shape to parse" rationale.

- [ ] **Step 4: Verify**

Run: `rg -n "updatedBy|libs/shared/schemas|data: null" _refs/nestjs/architecture-principles.md`
Expected: no matches for `updatedBy` or `libs/shared/schemas`; `data: null` only inside a clearly-labelled historical/anti-pattern note if retained (prefer removing it).

- [ ] **Step 5: Sync mirrors + commit**

```bash
bash .claude/sync-skills.sh
git add _refs/nestjs/architecture-principles.md .claude/_refs plugin/_refs
git commit -m "fix(refs): align nestjs architecture-principles §2/§4/§13 with actual pack output"
```

- [ ] **Step 6: Phase 1 gate**

Run: `npx lefthook run check`
Expected: frontmatter / sync / core-version checks green. Phase 1 is independently shippable here.

---

# PHASE 2 — Profile tier (`simple` | `enterprise`)

Resolves over-fit items 1–8. `enterprise` preserves today's output; `simple` is the new non-tech default.

## Task 3: Add `profile` as a blocking clarify input

**Files:**
- Modify: `_refs/sdlc/nestjs.md`
- Modify: `skills/shared/sdlc/02-clarify-requirements.md`

- [ ] **Step 1: Add `profile` to the nestjs minimum-required block**

In `_refs/sdlc/nestjs.md` → `## Clarify` → `### Minimum-required (blocking)`, add as item 9:
```
9. **Profile** — `simple` (default) | `enterprise`.
   - `simple`: single-tenant, flat Keycloak-role permissions, DTOs in `src/modules/<module>/dto/`, lib `WithAudit(BaseEntity)`, core `AuthGuard`. The non-tech default.
   - `enterprise`: multi-tenant (`tenantCode` + `departmentCode` scoping), page-permission matrix, `@shared` monorepo kernel, `AdminAuthGuard`, internal-secret module, `MASTER`/`TENANT_ADMIN` scopes. Pick when the app is genuinely multi-tenant / multi-service.
```

- [ ] **Step 2: Add `profile` to the summary template**

In the same file's `### Summary template`, add a row:
```
| **Profile** | <simple | enterprise> |
```

- [ ] **Step 3: Add the routing note in the clarify skill**

In `skills/shared/sdlc/02-clarify-requirements.md`, in the nestjs blocking-inputs section, add: "Ask **profile** (`simple` default | `enterprise`). For a `non-tech` persona, do NOT ask — default `simple` silently (persona rule 7: never expose architecture); still confirm the derived data model in plain terms."

- [ ] **Step 4: Verify**

Run: `rg -n "Profile|profile" _refs/sdlc/nestjs.md skills/shared/sdlc/02-clarify-requirements.md | rg -i profile`
Expected: matches in both files.

- [ ] **Step 5: Sync + commit**

```bash
bash .claude/sync-skills.sh
git add _refs/sdlc/nestjs.md skills/shared/sdlc/02-clarify-requirements.md .claude/skills plugin/skills .claude/_refs plugin/_refs
git commit -m "feat(sdlc): add nestjs profile (simple|enterprise) as a blocking clarify input"
```

## Task 4: `init-project.md` — profile branch

This is the largest change. Each profile-divergent section gets a `**Profile: simple**` / `**Profile: enterprise**` split. The **enterprise** sub-blocks hold the file's CURRENT templates verbatim; the **simple** sub-blocks hold the new minimal templates below.

**Files:**
- Modify: `_refs/nestjs/write-code/init-project.md`

- [ ] **Step 1: Add a profile preamble after "Input resolution"**

Insert:
```
## Profile (read FIRST)

Read `profile` from `<target>/.sdcorejs/summary.md` (set at clarify; default `simple`).
Templates below split into **Profile: simple** (single-tenant, flat permissions, no
`base/shared`, no internal-secret, lib `WithAudit`) and **Profile: enterprise** (the
full multi-tenant + department-scoped + page-permission-matrix + `@shared` monorepo +
internal-secret shape). Emit ONLY the chosen profile's templates. `enterprise` output is
unchanged from prior versions of this pack.
```
Add `Profile` to the *Input resolution* list as required input #0.

- [ ] **Step 2: Split Step 1 (`package.json`) — drop `@shared` jest mapping for `simple`**

Under **Profile: simple**, the `jest.moduleNameMapper` is `{ "^src/(.*)$": "<rootDir>/$1" }` (no `@shared`/`@app` aliases); under **Profile: enterprise**, keep the current `@shared`/`@app` mapping. Everything else in `package.json` is identical (shared above the split).

- [ ] **Step 3: Split Step 2 (`tsconfig.json`) — no `@shared` path for `simple`**

**Profile: simple** `paths`:
```json
"paths": { "src/*": ["./src/*"] }
```
**Profile: enterprise**: keep current (`@shared` → `./base/shared`, `@app/*` → `./src/*`).

- [ ] **Step 4: Split Step 5 (`app.module.ts`) — minimal `SdCoreModule` for `simple`**

Write the **Profile: simple** `app.module.ts` (no tenancy/audit-custom/internal-secret; core `AuthGuard`; permission strategy returns roles):
```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RouterModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SdCoreModule } from '@sdcorejs/nestjs';

import { CONFIGURATION, AppConfiguration } from './app.configuration';
import { RolePermissionStrategy } from './common/role-permission.strategy';
import { JwtStrategy } from './common/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [CONFIGURATION], cache: true, isGlobal: true }),
    SdCoreModule.forRoot({
      context: { headers: { userId: 'x-user-id', lang: ['accept-language', 'x-language'] } },
      permission: { strategy: RolePermissionStrategy },
      jwt: { jwks: { allowedIssuers: [CONFIGURATION().keycloak.issuer] }, strategy: JwtStrategy },
      i18n: { fallbackLanguage: 'vi' },
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => {
        const database = config.get<AppConfiguration['database']>('database')!;
        return {
          type: 'postgres', host: database.host, port: database.port,
          database: database.database, username: database.username, password: database.password,
          schema: 'core', autoLoadEntities: true, synchronize: database.synchronize,
        };
      },
      inject: [ConfigService],
    }),
    RouterModule.register([]),
  ],
})
export class AppModule {}
```
**Profile: enterprise**: keep the current `app.module.ts` (with `InternalSecretModule`, `AppTenancyStrategy`, `AppAuditStrategy`, `AppPermissionStrategy`, `AdminAuthGuard`, `SD_CONTEXT_BINDING`).

- [ ] **Step 5: Split Step 6 (`src/common/`) — minimal set for `simple`**

**Profile: simple** emits only:
- `src/common/base-entity.ts`:
```ts
import { BaseEntity as CoreBaseEntity, WithAudit } from '@sdcorejs/nestjs/orm';
/** App base entity: lib audit/timestamps + uuid id. Domain entities extend this. */
export abstract class BaseEntity extends WithAudit(CoreBaseEntity) {}
```
- `src/common/errors.ts`: same `badRequest(code, data?)` helper as today (keep verbatim — profile-independent).
- `src/common/dto.ts` — the simple-profile DTO base (replaces the enterprise `@shared/entity` `Dto`):
```ts
/** Base DTO every entity DTO extends (simple profile). Matches the BaseService DTO contract. */
export interface Dto {
  id: string;
  editable?: boolean;
  deletable?: boolean;
  restorable?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```
- `src/common/role-permission.strategy.ts`:
```ts
import { Injectable } from '@nestjs/common';
import type { IPermissionStrategy } from '@sdcorejs/nestjs/permission';
import { ContextService } from '@sdcorejs/nestjs/context';

/**
 * Simple profile: permission codes ARE the Keycloak realm roles mapped on the JWT
 * (JwtStrategy.validate → req.user.roles). Flat `string[]`; no page-permission matrix.
 */
@Injectable()
export class RolePermissionStrategy implements IPermissionStrategy {
  constructor(private readonly ctx: ContextService) {}
  async load(): Promise<string[]> {
    const user = this.ctx.get('user') as { roles?: string[] } | undefined;
    return user?.roles ?? [];
  }
}
```
- `src/common/jwt.strategy.ts`:
```ts
import { Injectable } from '@nestjs/common';
import { type JwtPayload, KeycloakJwtStrategy } from '@sdcorejs/nestjs/jwt';

/** Simple profile: map only sub + realm roles. No tenant/department claims. */
@Injectable()
export class JwtStrategy extends KeycloakJwtStrategy {
  async validate(payload: JwtPayload) {
    return { id: payload.sub, email: (payload as any).email, roles: (payload as any).realm_access?.roles ?? [] };
  }
}
```
No `sd-context.ts` facade, no `tenancy/`, no `app-audit.strategy.ts`, no `admin-*`, no `internal-secret/` under `simple`. **Profile: enterprise**: keep ALL current Step 6 files verbatim.

- [ ] **Step 6: Split Step 7 (`base/shared/`) — omit for `simple`**

**Profile: simple**: skip `base/shared/` entirely; DTOs live in `src/modules/<module>/dto/` (see Task 6). The JWT strategy moved to `src/common/jwt.strategy.ts` (Step 5 above). **Profile: enterprise**: keep current Step 7 (`base/shared/` kernel + `src/core/modules/jwt/`).

- [ ] **Step 7: Split Steps 5/9 context headers**

Remove `x-tenant-code` / `x-department-code` / `customHeaders` from the **simple** `.env.example` + context config (already absent in the Step 4 simple `app.module.ts`). **enterprise**: unchanged.

- [ ] **Step 8: Update "Expected scaffold structure" + "Verification checklist"**

Add a **simple** tree (no `base/`, no `common/tenancy`, no `internal-secret`, no `core/modules/jwt`) beside the existing **enterprise** tree. Add a verification line: "simple: `rg` finds no `tenantCode`/`departmentCode`/`InternalGuard`/`base/shared` in the emitted output."

- [ ] **Step 9: Verify the simple branch omits the over-fit constructs**

Run: `rg -n "Profile: simple|Profile: enterprise|RolePermissionStrategy" _refs/nestjs/write-code/init-project.md`
Expected: both profile headers present; `RolePermissionStrategy` defined.
Run: `rg -n "InternalSecretModule|AppTenancyStrategy|AdminAuthGuard" _refs/nestjs/write-code/init-project.md`
Expected: still present (under the enterprise branch — byte-preservation of enterprise).

- [ ] **Step 10: Sync + commit**

```bash
bash .claude/sync-skills.sh
git add _refs/nestjs/write-code/init-project.md .claude/_refs plugin/_refs
git commit -m "feat(refs): add simple|enterprise profile branch to nestjs init-project pack"
```

## Task 5: `init-module.md` — profile branch

**Files:**
- Modify: `_refs/nestjs/write-code/init-module.md`

- [ ] **Step 1: Add the profile preamble** (same wording as Task 4 Step 1, scoped to module concerns).

- [ ] **Step 2: Split the contract/DTO location note**

In Step 5 conventions, add: **simple** → DTOs in `src/modules/<module>/dto/<entity>.dto.ts` (no `@shared`); **enterprise** → `base/shared/<module>/` (`@shared`). Schema-per-module Postgres, route prefix, barrel discipline, permission namespace are **profile-independent** (keep as-is).

- [ ] **Step 3: Soften the cross-module example**

The `AdminModule`/`MasterdataModule` cross-module example is enterprise-shaped. Add a one-line note: "`simple` modules are usually leaf (no cross-module imports); the cross-module DI-port pattern below applies to both profiles when a dependency genuinely exists."

- [ ] **Step 4: Verify + sync + commit**

```bash
rg -n "Profile: simple|src/modules/<module>/dto" _refs/nestjs/write-code/init-module.md   # expect matches
bash .claude/sync-skills.sh
git add _refs/nestjs/write-code/init-module.md .claude/_refs plugin/_refs
git commit -m "feat(refs): profile-aware DTO location in nestjs init-module pack"
```

## Task 6: `init-entity.md` — profile branch

**Files:**
- Modify: `_refs/nestjs/write-code/init-entity.md`

- [ ] **Step 1: Add the profile preamble.**

- [ ] **Step 2: Split Step 1 (Entity) — no tenancy columns for `simple`**

**Profile: simple** entity template (no `@Scoped` tenancy columns, no department index/unique, extends the lib-backed local base):
```ts
import { SearchableFields } from '@sdcorejs/nestjs/orm';
import { BaseEntity } from 'src/common/base-entity';
import { Column, Entity } from 'typeorm';

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
  // business columns from Input #3 here; relations (same-module FK) as in enterprise template
}
```
**Profile: enterprise**: keep the current entity template (with `tenantCode`/`departmentCode` `@Scoped`, `@Index`, `@Unique`). Resolve item 5 here: the "extend LOCAL base, NOT lib base" rationale becomes **enterprise-only**; for **simple**, `src/common/base-entity.ts` IS the lib `WithAudit` re-export, so audit columns are `createdAt`/`updatedAt`/`modifiedBy` (consistent, no contradiction).

- [ ] **Step 3: Split Step 3 (DTO) location + shape**

**Profile: simple**: DTO at `src/modules/<module>/dto/<entity>.dto.ts` importing the `Dto` base from `src/common/dto.ts` (emitted by `init-project` Task 4 Step 5) — `extends Dto` with the entity's own fields, NO `tenantCode`/`departmentCode`. Example:
```ts
import { Dto } from 'src/common/dto';
export interface <Entity>DTO extends Dto { code: string; name: string; description?: string; isActive: boolean; }
```
**Profile: enterprise**: keep `base/shared/<module>/<entity>.model.ts` (`@shared`, `extends Dto<<Entity>DTO>`) with `tenantCode`/`departmentCode`/`modifiedAt` etc.

- [ ] **Step 4: Split Step 4 (Service `mapDTO`) — permission gating**

**Profile: simple** `mapDTO` drops `tenantCode`/`departmentCode`; gates `editable`/`deletable` via `SdContext`-free check — use the lib `ContextService.hasPermission('<module>_<entity>:<action>')` (inject `ContextService`) since there's no `SdContext` facade in simple. Show the minimal `mapDTO`. **enterprise**: keep current (`SdContext.hasPermission`).

- [ ] **Step 5: Update Expected files + checklist** with the simple paths (`src/modules/<module>/dto/`, no `base/shared`).

- [ ] **Step 6: Verify + sync + commit**

```bash
rg -n "Profile: simple|extends BaseEntity" _refs/nestjs/write-code/init-entity.md   # simple entity present
rg -n "tenantCode" _refs/nestjs/write-code/init-entity.md                            # only under enterprise branch
bash .claude/sync-skills.sh
git add _refs/nestjs/write-code/init-entity.md .claude/_refs plugin/_refs
git commit -m "feat(refs): profile-aware entity/DTO/mapDTO in nestjs init-entity pack"
```

## Task 7: `actions.md` — profile branch

**Files:**
- Modify: `_refs/nestjs/write-code/actions.md`

- [ ] **Step 1: Add the profile preamble.**

- [ ] **Step 2: Generalize the context facade reference**

Where the pack reads `SdContext` (caller scope, `fullName`, `userId`), add: **simple** uses the lib `ContextService` directly (`@Inject(ContextService)`; `ctx.userId`, `ctx.get('user')`); **enterprise** uses the `SdContext` static facade. The `mine`/`team` caller-scoping, transitions, bulk, Excel export, QueryRunner patterns are otherwise **profile-independent** (the `team`/department-scoped variants are `[enterprise]`).

- [ ] **Step 3: Mark department-scoped examples `[enterprise]`** (e.g. `team` listing scoped by `departmentCode`).

- [ ] **Step 4: Verify + sync + commit**

```bash
rg -n "Profile: simple|ContextService|\[enterprise\]" _refs/nestjs/write-code/actions.md   # expect matches
bash .claude/sync-skills.sh
git add _refs/nestjs/write-code/actions.md .claude/_refs plugin/_refs
git commit -m "feat(refs): profile-aware context access in nestjs actions pack"
```

## Task 8: `core-catalog.md` — document the boundary

**Files:**
- Modify: `_refs/nestjs/core-catalog.md`

- [ ] **Step 1: Add a short "Neutral core vs profile templates" note** near the top:
```
> **Neutral core vs app templates.** Everything in this catalog is the NEUTRAL
> `@sdcorejs/nestjs` API — profile-independent. App-level shapes (tenancy strategy,
> page-permission matrix, base/shared kernel, internal-secret) are NOT core; the
> write-code packs emit them only under the `enterprise` profile. The `simple` profile
> uses the core directly (`WithAudit`, core `AuthGuard`, `string[]` permission strategy).
```

- [ ] **Step 2: Verify + sync + commit**

```bash
rg -n "Neutral core vs" _refs/nestjs/core-catalog.md   # expect 1 match
bash .claude/sync-skills.sh
git add _refs/nestjs/core-catalog.md .claude/_refs plugin/_refs
git commit -m "docs(refs): note neutral-core vs profile-template boundary in nestjs core-catalog"
```

## Task 9: orchestrator + solution-builder read/pass the profile

**Files:**
- Modify: `skills/tracks/nestjs/write-code.md`
- Modify: `skills/orchestration/solution-builder.md`

- [ ] **Step 1: `nestjs-write-code` reads the profile**

In `skills/tracks/nestjs/write-code.md` Step 0.1 (pre-flight), add: "Read `profile` from `<target>/.sdcorejs/summary.md` (default `simple`). Pass the resolved profile into every dispatched pack — each pack emits only that profile's templates." Add a MUST-DO bullet: "Emit a single profile consistently across all packs in one project (never mix)."

- [ ] **Step 2: `solution-builder` non-tech default**

In `skills/orchestration/solution-builder.md` step 1 ("Understand what you want") + the forced-infra-defaults list, add: "**Profile** is forced to `simple` for the non-tech door (single-tenant, role-based login) — never surfaced as a choice. A developer using the granular flow picks `enterprise` at clarify if needed."

- [ ] **Step 3: Verify + sync + commit**

```bash
rg -n "profile" skills/tracks/nestjs/write-code.md skills/orchestration/solution-builder.md | rg -i profile   # expect matches
bash .claude/sync-skills.sh
git add skills/tracks/nestjs/write-code.md skills/orchestration/solution-builder.md .claude/skills plugin/skills
git commit -m "feat(skills): nestjs-write-code reads profile; solution-builder defaults non-tech to simple"
```

- [ ] **Step 4: Phase 2 gate (enterprise non-regression)**

Run: `npx lefthook run check`
Expected: green.
Run: `rg -c "Profile: enterprise" _refs/nestjs/write-code/*.md`
Expected: every pack that branched (init-project, init-entity) reports ≥1 — proving the enterprise templates are preserved under their branch, not deleted.

---

# PHASE 3 — Role-split feature loop (`subagent-driven-dev` Mode B)

Depends on Phase 2 (the contract-freeze emits a profile-shaped contract).

## Task 10: Add the mode selector + Mode B to `subagent-driven-dev.md`

**Files:**
- Modify: `skills/orchestration/subagent-driven-dev.md`

- [ ] **Step 1: Add the mode selector after "## Purpose"**

Insert:
```
## Mode selector (read FIRST)

| You have… | Mode |
|---|---|
| N independent units of the SAME kind (entities, screens, doc batches), no shared state | **Mode A — Independent units** (the existing workflow below) |
| ONE feature that spans backend + frontend (and needs QC) | **Mode B — Role-split feature loop** (see its own section) |

`parallel-dispatch` routes here: `PARALLEL-CANDIDATE` → Mode A; `ROLE-SPLIT` → Mode B.
The two modes use OPPOSITE coupling models — do not mix them. Mode A units are independent
by construction; Mode B roles are deliberately coupled through a frozen contract.
```
Retitle the existing "## Workflow" → "## Mode A — Independent units (workflow)".

- [ ] **Step 2: Append the full Mode B section**

Add a new top-level section `## Mode B — Role-split feature loop` containing the 4 phases + loop control. Write it verbatim:
````
### B.0 When to use
One feature crossing backend + frontend, after `06-review-plan` approved the plan.
Not for single-track work (use the track's write-code directly) and not for N same-kind
units (Mode A).

### B.1 Phase 0 — Contract freeze (sequential barrier)
Derive + write the shared contract from the approved plan + spec, SHAPED BY THE PROFILE
(`simple|enterprise`, from `.sdcorejs/summary.md`):
- DTO / types, endpoint list (verb + path + req/res), permission codes `<module>_<entity>:<action>`.
- Location by topology (asked at clarify): two-repo → a shared types package the FE consumes;
  mono-repo → `base/shared/<module>/*.model.ts` (enterprise) or `src/modules/<module>/dto` mirrored
  to the FE (simple).
Freeze it: role agents must NOT mutate the contract mid-iteration. Embed it VERBATIM in all
three briefs.

### B.2 Phase 1 — Parallel role fan-out (ONE message, 3 Agent calls)
Three self-contained briefs (use the parallel-dispatch briefing template), file-disjoint:
- BE  → `nestjs-write-code` packs at the chosen profile; writes `src/modules/<module>/**`; owns BE unit tests.
- FE  → `angular-write-code` packs; writes `src/libs/<module>/**`; consumes the contract; owns FE component tests.
- QC  → from the frozen contract + spec acceptance criteria: writes the acceptance checklist +
        RED contract/E2E tests + the verification harness; touches ONLY `*.e2e-spec.ts` / `*.spec.ts` / harness.
Isolation: two-repo → separate trees, no worktree. mono-repo → worktrees per role OR strict disjoint
paths; `base/shared` touched in Phase 0 only.

### B.3 Phase 2 — Fan-in + per-role review
As each role returns, verify from the ACTUAL diff (never the "done" word). Reuse Mode A's
Stage A (spec-compliance) → Stage B (sdcorejs-review → repair-loop) PER ROLE. Conflict scan:
no role touched another's files; nobody mutated the frozen contract.

### B.4 Phase 3 — Integration verify = the loop gate
Invoke `verify-before-done` against the spec Acceptance Criteria, running QC's harness +
build/lint/test + smoke (BE /health + endpoint, FE route, e2e across both). Verdict:
- all ✅ (or user-deferred) → DONE → exit to the tail chain.
- Critical/Important remain → route each to its OWNING role (contract mismatch → BE/contract;
  screen bug → FE; missing assertion → QC) → re-dispatch ONLY that role with the finding list
  (no hand-fix → avoids context pollution) → next iteration.
- Contract drift (BE had to change a shape) → reconcile the frozen contract HERE, then re-brief
  FE + QC with the updated slice.

### B.5 Loop control (reuse repair-loop discipline)
Hard cap 3 iterations. No-progress (zero new criteria resolved) for 2 consecutive rounds →
ESCALATE to the user with the convergence-failure framing. Each iteration re-runs only the
failed slices, never all three.

### B.6 Tail chain
On DONE: comment-code (ASK) → branch-ready → auto-docs → auto-task-tracker → memories.
(`verify-before-done` already ran as the gate.)

### B.7 Dry-run walkthrough (contract-drift example)
Feature "approve invoice" (simple profile, two-repo):
1. Phase 0 freezes: `InvoiceDto`, `PUT /billing/invoice/:id/approve`, code `billing_invoice:approve`.
2. Phase 1: BE writes the endpoint+service; FE writes the approve button+call; QC writes a RED
   supertest hitting the endpoint + an e2e clicking the button.
3. Phase 3 iter 1: verify-before-done fails — BE returned `{ approvedAt }` but the contract said
   `{ approvedDate }`. Routed to "contract": reconcile contract → `approvedDate`; re-brief FE+QC
   with the corrected field. BE already matched, FE adjusts its model, QC's assertion updates.
4. Phase 3 iter 2: all criteria ✅ → DONE.
````

- [ ] **Step 3: Update the skill `description` frontmatter**

Add to the `description`: "Two modes: **A** = independent same-kind units (existing); **B** = role-split feature loop (backend‖frontend‖QC on one feature, contract-freeze barrier + acceptance loop). `parallel-dispatch` routes between them." Keep it within a sane length.

- [ ] **Step 4: Verify + sync + commit**

```bash
rg -n "Mode B — Role-split|Phase 0 — Contract freeze|ROLE-SPLIT" skills/orchestration/subagent-driven-dev.md   # expect matches
bash .claude/sync-skills.sh
git add skills/orchestration/subagent-driven-dev.md .claude/skills plugin/skills
git commit -m "feat(skills): add Mode B role-split feature loop to subagent-driven-dev"
```

## Task 11: `parallel-dispatch.md` — `ROLE-SPLIT` verdict

**Files:**
- Modify: `skills/orchestration/parallel-dispatch.md`

- [ ] **Step 1: Add the ROLE-SPLIT branch to the decision tree**

After the existing "Is review tractable?" branch, add:
```
Is it ONE feature spanning backend + frontend (not N same-kind units)?
  ├─ Yes → ROLE-SPLIT → hand to subagent-driven-dev Mode B (contract-freeze + BE‖FE‖QC loop)
  └─ No  → the same-kind-units path above → PARALLEL-CANDIDATE → Mode A
```

- [ ] **Step 2: Add a "When role-split is correct" note** distinguishing it from same-kind fan-out (FE depends on BE's contract → the contract-freeze barrier makes them file-disjoint for the rest of the loop).

- [ ] **Step 3: Update the cross-references** to point `ROLE-SPLIT` → `subagent-driven-dev.md` Mode B.

- [ ] **Step 4: Update the `description` frontmatter** to mention it emits `SEQUENTIAL` / `PARALLEL-CANDIDATE` / `ROLE-SPLIT`.

- [ ] **Step 5: Verify + sync + commit**

```bash
rg -n "ROLE-SPLIT" skills/orchestration/parallel-dispatch.md   # expect matches
bash .claude/sync-skills.sh
git add skills/orchestration/parallel-dispatch.md .claude/skills plugin/skills
git commit -m "feat(skills): add ROLE-SPLIT verdict routing to subagent-driven-dev Mode B"
```

## Task 12: `solution-builder.md` — use Mode B for cross-track features

**Files:**
- Modify: `skills/orchestration/solution-builder.md`

- [ ] **Step 1: Replace the sequential BE→FE narration**

In "## The chain", merge steps 4 (backend) + 5 (frontend) into one step: "**Build the engine room + screens together** *(`subagent-driven-dev` Mode B)* — freeze the contract, then build backend + screens + checks in parallel and loop until it matches what you approved." Keep the plain-language framing. Add a maintainer note: "The prior sequential `nestjs-write-code` → `angular-write-code` path remains valid as a fallback for single-track features or when Mode B escalates."

- [ ] **Step 2: Verify + sync + commit**

```bash
rg -n "Mode B|in parallel and loop" skills/orchestration/solution-builder.md   # expect matches
bash .claude/sync-skills.sh
git add skills/orchestration/solution-builder.md .claude/skills plugin/skills
git commit -m "feat(skills): solution-builder builds cross-track features via Mode B loop"
```

## Task 13: Final gate + design-doc status + CLAUDE.md touch-ups

**Files:**
- Modify: `docs/superpowers/specs/2026-06-06-nestjs-generalization-and-role-split-loop-design.md`
- Modify: `CLAUDE.md` (skill-table + write-code dispatch note, if the new mode/profile warrant a line)

- [ ] **Step 1: Flip the design doc status** from "Approved (brainstorm)" to "Delivered — Phases 1–3 shipped".

- [ ] **Step 2: Add a CLAUDE.md line** under the orchestration table for `subagent-driven-dev` noting Modes A/B, and a one-line note in the NestJS track row that codegen is profile-aware (`simple` default | `enterprise`). Keep edits minimal.

- [ ] **Step 3: Full repo gate**

```bash
bash .claude/sync-skills.sh --check    # all skills in sync
npx lefthook run check                 # frontmatter / sync / core-version green
git status --short                     # only intended files
```
Expected: sync clean, checks green.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/specs/2026-06-06-nestjs-generalization-and-role-split-loop-design.md CLAUDE.md .claude/skills plugin/skills
git commit -m "docs: mark profile-tier + role-split-loop delivered; note in CLAUDE.md"
```

---

## Acceptance criteria → task map (self-review)

| Spec acceptance criterion | Task(s) |
|---|---|
| simple init-project: no tenancy/MASTER/internal-secret/base/shared; WithAudit; `string[]` perms | Task 4 (Steps 4–9) |
| enterprise byte-equivalent (no regression) | Task 4 Step 9, Task 6 Step 6, Task 9 Step 4 |
| profile is a blocking clarify question; solution-builder defaults simple | Task 3, Task 9 |
| review-code.md off be-masterdata; probes match generated code | Task 1 |
| architecture-principles §2/§4/§13 match output | Task 2 |
| sync-skills --check passes; lefthook green | Task 2 Step 6, Task 9 Step 4, Task 13 Step 3 |
| subagent-driven-dev has selector; Mode A unchanged; Mode B = 4 phases + loop control | Task 10 |
| parallel-dispatch routes BE+FE → ROLE-SPLIT/Mode B | Task 11 |
| Mode B Phase 0 freezes a profile-shaped contract; disjoint briefs; verify-before-done gate; cap 3 + no-progress×2 | Task 10 Step 2 |
| solution-builder uses Mode B for cross-track; sequential fallback documented | Task 12 |
| dry-run walkthrough showing contract-drift reconciliation | Task 10 Step 2 (B.7) |

All spec acceptance criteria map to at least one task. No gaps.
