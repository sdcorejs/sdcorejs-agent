# NestJS write-code packs — Implementation Plan (Plan 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build out the NestJS track from a scaffold plan-walker into a real pack-dispatching code generator — mirroring `angular-write-code` — so `nestjs-write-code` can scaffold a modular-monolith backend that consumes the `@sdcorejs/nestjs` core and follows the `enterprise-platform` reference architecture. This is design-doc Phase 3 (`docs/superpowers/specs/2026-06-06-non-tech-solution-builder-design.md`).

**Architecture:** Add on-demand reference packs under `_refs/nestjs/write-code/` (no frontmatter, not dispatchable — same shape as `_refs/angular/write-code/`) loaded by the single `nestjs-write-code` skill. Packs encode the real, grounded shapes from `@sdcorejs/nestjs` (v0.1.6) + the `enterprise-platform` modular monolith.

**Tech stack the packs target (grounded facts):**
- Core: `@sdcorejs/nestjs` (v0.1.6) — sub-path exports `/orm` (`BaseEntity`, `WithAudit`/`WithTimestamps` mixins, `BaseRepository`, `BaseService`, `BaseController`, `@TenantScoped`/`@Scoped`, `@SearchableFields`, `ApiResponse`/`apiError`), `/permission` (`AuthGuard`, `@HasPermission`/`@HasAnyPermission`, `InternalGuard`, `IPermissionStrategy`), `/validation` (`ZodValidationGuard`, `zPaging`/`zUuid`/`zBool` presets), `/jwt` (`JwtModule.forRoot` symmetric or Keycloak JWKS), `/context` (`ContextService`, `RequestContext`, `ContextMiddleware`), `/tenancy` + `/audit` strategy interfaces. Root `SdCoreModule.forRoot({ context, tenancy, audit, permission, jwt, i18n, providers })`. Peer deps: `@nestjs/* ^11`, `typeorm ^0.3.20`, `zod ^4`, `jwks-rsa`/`jsonwebtoken` for Keycloak.
- Reference app: NestJS modular monolith, **npm**, scripts `build` (`nest build`) / `start:dev` (`nest start --watch`) / `start:prod` (`node dist/main`) / `lint` / `test`; port 3000; `src/modules/<m>/{entities,repositories,services,controllers,schemas}` + barrels; `src/common/` (local `base-entity`, tenancy/permission strategies, `SdContext` static facade, `AdminAuthGuard`, internal-secret); `src/core/modules/{jwt,page-permission}`; `base/shared/` DTO lib aliased `@shared`; `app.module.ts` wires `SdCoreModule.forRoot` + `ContextModule.forRoot` + `TypeOrmModule.forRootAsync` (schema-per-module, `autoLoadEntities`, `synchronize` env-gated) + `RouterModule.register`; `main.ts` pre-creates Postgres schemas before boot. Permission codes flat `model:action` (e.g. `crm_task:create`). Zod v4 schemas in `schemas/<module>.schema.ts` (`*CreateSchema`, `*UpdateSchema = .partial()`, `reqStr` helper, i18n error codes).

**NEW CONVENTION (record this — Task 1): skills go global → English source.** All skill `name` / `description` / body / notes / inline comments are authored in **English** (skills are published globally). At **runtime**, detect the user's language from their message and BOTH trigger-match and respond in that language (full diacritics for Vietnamese; permission codes + route paths stay English). This replaces the old practice of embedding Vietnamese trigger phrases in descriptions. All Plan 3 content is authored in English. (Retrofitting the ~40 existing VI-laden skill descriptions is a separate sweep — see "Deferred".)

**Repo conventions (read once):**
- Skill source `skills/<area>/*.md`; mirrors generated — never hand-edit `.claude/skills/`, `plugin/skills/`, `.claude/_refs`, `plugin/_refs`.
- `_refs/**` = no frontmatter, copied wholesale.
- After any change under `skills/**` or `_refs/**`: `bash .claude/sync-skills.sh` then `bash .claude/sync-skills.sh --check`.
- Generated code lands in the **target project**, never this agent repo. The packs are reference content the skill emits.

**Pack breakdown (DECISION — deviates from the design's illustrative list).** The design §4 said "e.g. `init-project, init-module, init-entity, controller, service, repository`". But in the reference app, repository + service + controller + schema are always generated together for one entity (the canonical CRUD stack). Splitting them into separate packs is artificial. This plan uses the angular-mirroring breakdown instead:
- `init-project` — scaffold the modular-monolith app skeleton.
- `init-module` — add a bounded-context module.
- `init-entity` — full CRUD stack for one entity (entity + repository + service + controller + Zod schema + DTO + wiring).
- `actions` — custom / non-CRUD endpoints (domain methods, cross-module calls, workflow transitions, bulk, Excel export).
(If you prefer the literal controller/service/repository split, say so at plan review.)

---

## File Structure (created/changed in THIS agent repo)

| File | Action | Responsibility |
|---|---|---|
| `_refs/nestjs/write-code/init-project.md` | Create | Scaffold app skeleton (package.json, tsconfig+`@shared`, main.ts, app.module, app.configuration, `common/`, `core/modules/`, `base/shared/`, `.env.example`). |
| `_refs/nestjs/write-code/init-module.md` | Create | Bounded-context module folder + barrels + `module.ts` + `RouterModule` + app.module import. |
| `_refs/nestjs/write-code/init-entity.md` | Create | Full CRUD stack for one entity (entity/repo/service/controller/schema/DTO + registration). |
| `_refs/nestjs/write-code/actions.md` | Create | Custom endpoints (domain methods, cross-module, workflow, bulk, export). |
| `_refs/nestjs/core-catalog.md` | Create | Concise inventory of `@sdcorejs/nestjs` exports + import sub-paths + minimal snippets (the nestjs analogue of `_refs/angular/sdcorejs-angular-catalog.md`). |
| `skills/tracks/nestjs/write-code.md` | Modify | Scaffold plan-walker → pack-dispatching orchestrator (mirror `angular-write-code`); English description; drop stale "10-init-project…" sub-skill note; per-pack trigger catalog; tail chain. |
| `_refs/sdlc/nestjs.md`, `_refs/nestjs/architecture-principles.md` | Modify | Reconcile with the real core: package name `@sdcorejs/nestjs`, sub-path imports, `model:action` codes, schema-per-module, **synchronize-in-dev vs migrations** note (+ reconcile the Plan 2 `backend.Dockerfile` migration CMD). |
| `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md` | Modify | (a) Amend the Bilingual rule → "skills-go-global / English source" convention; (b) flip the NestJS track status scaffold → complete + reference the packs. |
| `TESTING.md` | Modify | Smoke tests for nestjs init-project / init-module / init-entity. |
| `docs/superpowers/specs/2026-06-06-non-tech-solution-builder-design.md` | Modify | Mark Phase 3 shipped. |
| mirrors (`.claude/**`, `plugin/**`) | Generated | `sync-skills.sh` only. |

---

## Task 1: Record the "skills go global / English source" convention

**Files:** Modify `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `_refs/shared/persona.md`

- [ ] **Step 1: CLAUDE.md — amend the Bilingual mandatory rule (rule 5).** Read CLAUDE.md. Find rule 5 (starts `5. **Bilingual.**`). Replace its body with:
```
5. **Skills go global — English source, runtime-localized I/O.** Author every skill's `name`, `description`, body, notes, and inline comments in **English** (skills are published for a global audience). At runtime, detect the user's language from their message and BOTH match triggers and respond in that language — Vietnamese request → Vietnamese reply (full diacritics for labels/messages); English → English. Permission codes and route paths stay English in both. (Generated artifacts — code/docs in a target project — follow the user's language for prose, English for identifiers.)
```

- [ ] **Step 2: AGENTS.md + copilot-instructions.md — mirror it.** Read each, find its bilingual rule (rule 5), replace with the same English-source convention text (adapt numbering to each file).

- [ ] **Step 3: `_refs/shared/persona.md` — add a line** under "How a skill applies this" (near the existing bilingual sentence): "Skill SOURCE is English (global publication); runtime trigger-matching + responses follow the user's language — this is orthogonal to the tech/non-tech persona."

- [ ] **Step 4: Verify + commit.** `grep -n "English source\|go global" CLAUDE.md AGENTS.md .github/copilot-instructions.md` → ≥1 each.
```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && git add CLAUDE.md AGENTS.md .github/copilot-instructions.md _refs/shared/persona.md .claude/_refs plugin/_refs && bash .claude/sync-skills.sh >/dev/null && git add .claude/_refs plugin/_refs && git commit -F - <<'MSG'
docs(convention): skills go global — English source, runtime-localized I/O

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
MSG
```

---

## Task 2: `_refs/nestjs/core-catalog.md` (core exports inventory)

**Files:** Create `_refs/nestjs/core-catalog.md` (no frontmatter)

- [ ] **Step 1: Author the catalog.** A concise, skimmable inventory the packs reference (the nestjs analogue of the angular Core UI catalog). English. Sections:
  - **Package & imports:** `@sdcorejs/nestjs` v0.1.x; sub-path export map (`/orm`, `/permission`, `/validation`, `/jwt`, `/context`, `/tenancy`, `/audit`, `/cache`, `/http`, `/i18n`, …); peer deps (`@nestjs/* ^11`, `typeorm ^0.3.20`, `zod ^4`, `jwks-rsa`+`jsonwebtoken` for Keycloak, `@sdcorejs/utils ^1.1`). Node ≥18.18, npm.
  - **ORM building blocks:** `BaseEntity` (uuid `id` only) + `WithTimestamps`/`WithAudit` mixins (audit columns); `BaseRepository<T>` (paging/all/search/detail/create/update/import/softDelete/restore/delete; auto soft-delete filter; `{ logHistory?, tenancyStrategy?, auditStrategy? }` options; `queryRunner`/`getRepository(qr?)`); `BaseService<T,TDto>` (+ abstract `mapDTO`); `BaseController<T,TDto>` (mounts search/paging/all/detail/delete, wraps `ApiResponse`). One minimal snippet each (from the core fact sheet).
  - **Decorators:** `@TenantScoped()`/`@Scoped()`, `@SearchableFields({exact,contain,activeColumn})`, `@Schema`/`@SchemaProp`.
  - **Auth/permission:** `AuthGuard` (JWT then `@HasPermission`), `@HasPermission(code)`, `@HasAnyPermission(...)`, `InternalGuard`; `IPermissionStrategy.load/check`. Guard order `AuthGuard → ZodValidationGuard → @HasPermission`.
  - **Validation:** `ZodValidationGuard(schema | { body, query, params }, source?)`, presets `zPaging`/`zUuid`/`zBool`; failure envelope shape.
  - **JWT/Keycloak:** `JwtModule.forRoot({ jwks: { allowedIssuers } } | { secret }, { strategy })`; custom `KeycloakJwtStrategy.validate` to map claims → app user.
  - **Bootstrap:** `SdCoreModule.forRoot({...})` option keys + DI tokens (`CONTEXT_HEADERS_CONFIG`, `TENANCY_STRATEGY`, `AUDIT_STRATEGY`, `PERMISSION_STRATEGY`, `INTERNAL_SECRET_PROVIDER`, …). `ContextService` + `RequestContext` (declaration-merging to extend).
  - **Response/errors:** `ApiResponse.ok/noContent/error`, `apiError(code,message,data?)`, i18n exception filter, bilingual `{ code, message }`.
  - **Defaults when a strategy is omitted** (no tenancy/audit/permission/i18n = no-op).
  - A "version pin" note: bump here when core changes (single source of truth for the packs).

- [ ] **Step 2: Sync + commit.**
```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && bash .claude/sync-skills.sh >/dev/null && git add _refs/nestjs .claude/_refs plugin/_refs && git commit -F - <<'MSG'
docs(nestjs): core-catalog — @sdcorejs/nestjs export inventory for write-code packs

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
MSG
```

---

## Task 3: `init-project` pack

**Files:** Create `_refs/nestjs/write-code/init-project.md` (no frontmatter)

- [ ] **Step 1: Author the pack** — codegen instructions to scaffold a modular-monolith NestJS app consuming `@sdcorejs/nestjs`, mirroring `enterprise-platform`. English. Include real, compile-oriented templates (grounded in the fact sheets) for:
  - `package.json` — name, scripts (`build`/`start:dev`/`start:prod`/`lint`/`test`), deps: `@nestjs/{common,core,config,typeorm,platform-express,passport} ^11`, `typeorm ^0.3.20`, `pg`, `zod ^4`, `jwks-rsa`, `passport-jwt`, `@sdcorejs/nestjs` (note: pin to npm `^0.1.x`; the reference app vendors a tgz — for a fresh app use the npm dep, with a fallback note for the vendored tgz), `@sdcorejs/utils ^1.1`. npm.
  - `tsconfig.json` — `paths`: `@shared` → `./base/shared`, `@app/*` → `./src/*`; `experimentalDecorators`, `emitDecoratorMetadata`, target/module per NestJS 11.
  - `src/main.ts` — `ensureSchemas()` (pre-create Postgres `MODULE_SCHEMAS` via a one-off `pg` Client, idempotent) then `bootstrap()` (CORS, body limits, `app.listen(PORT||3000)`).
  - `src/app.configuration.ts` — env-backed config factory (`port`, `environment`, `database{host,port,database,username,password,synchronize}`, `keycloak{url,issuer,realm}`).
  - `src/app.module.ts` — `ConfigModule.forRoot({load:[CONFIGURATION],isGlobal:true})`; `SdCoreModule.forRoot({ context:{headers:{tenant,userId,...}}, tenancy:{strategy:AppTenancyStrategy}, audit:{strategy:AppAuditStrategy}, permission:{strategy:AppPermissionStrategy}, jwt:{ jwks:{ allowedIssuers:[issuer] } }, i18n:{fallbackLanguage:'vi'} })`; `TypeOrmModule.forRootAsync` (postgres, `schema:'core'`, `autoLoadEntities:true`, `synchronize: cfg.database.synchronize`); `RouterModule.register([])` (empty initially — modules append here). Keycloak `allowedIssuers` from env (the BE in-container `KEYCLOAK_URL`/realm).
  - `src/common/base-entity.ts` — local app base entity (extends core `WithAudit(BaseEntity)` + app extras like `usedIds`, `formGeneric`/`formGenericData` if used; otherwise re-export core's). Document the choice (the ref app keeps a LOCAL base-entity).
  - `src/common/tenancy/app-tenancy.strategy.ts` — `implements ITenancyStrategy` (`getCurrentScope` from `SdContext` tenant/department; `shouldBypass` for master/internal-secret).
  - `src/common/admin-permission.strategy.ts` — `implements IPermissionStrategy` (`load()` flattens a permission matrix → `model:action` codes).
  - `src/common/context/sd-context.ts` — static facade over `ContextService` (`userId`, `tenantCode`, `departmentCode`, `isMaster`, `hasPermission(model,action)`).
  - `src/common/admin-auth.guard.ts` — app guard (extends/wraps core `AuthGuard`).
  - `src/common/internal-secret/` — `IInternalSecretProvider` from env.
  - `src/core/modules/jwt/jwt.strategy.ts` + `jwt.module.ts` — `KeycloakJwtStrategy` subclass mapping claims → app user; `JwtModule.forRoot({ jwks:{} }, { strategy: JwtStrategy })`.
  - `base/shared/` skeleton — `core/` (ApiResponse, paging, filter re-exports), `entity/` (DTO base), an `index` per domain (empty to start).
  - `.env.example` — `PORT`, `DB_*`, `DB_SYNCHRONIZE`, `KEYCLOAK_URL`/`KEYCLOAK_ISSUER`/`KEYCLOAK_REALM`, `INTERNAL_SECRET_KEY`, context header names.
  - **Migrations note:** the reference app uses `DB_SYNCHRONIZE=true` in dev (no migrations). For prod, document a TypeORM datasource (`src/data-source.ts`) + `npm run migration:run` script. **Reconcile with Plan 2:** the `backend.Dockerfile` CMD runs `npm run typeorm migration:run && npm run start:prod` — init-project MUST therefore add a `migration:run` script (no-op safe when synchronize handles schema) OR the pack instructs adjusting the Dockerfile CMD to honor `DB_SYNCHRONIZE`. State the resolution explicitly.
  - **Schema-per-module Postgres** explanation (one DB, N schemas; `main.ts` pre-creates them).
  - Run `sdcorejs-auto-summary` (WRITE) after init, per the angular init-portal pattern.

- [ ] **Step 2: Sanity-lint the embedded snippets** — TS fenced blocks parse as TS-ish (no obvious syntax breakage); imports use the real sub-paths from the catalog. (No compiler in the agent repo — this is a content-correctness review against `_refs/nestjs/core-catalog.md`.)

- [ ] **Step 3: Sync + commit.**
```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && bash .claude/sync-skills.sh >/dev/null && git add _refs/nestjs .claude/_refs plugin/_refs && git commit -F - <<'MSG'
feat(nestjs): init-project pack — scaffold modular-monolith app on @sdcorejs/nestjs

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
MSG
```

---

## Task 4: `init-module` pack

**Files:** Create `_refs/nestjs/write-code/init-module.md`

- [ ] **Step 1: Author the pack** — add a bounded-context module to an existing app. English. Include templates for:
  - Folder `src/modules/<module>/{entities,repositories,services,controllers,schemas}` + a barrel `index.ts` in each of entities/repositories/services/controllers.
  - `src/modules/<module>/<module>.module.ts` — `@Module({ imports:[TypeOrmModule.forFeature([...entities]), ...crossModuleDeps], controllers:[...], providers:[ {provide:I<E>Repository,useClass:<E>Repository}, {provide:I<E>Service,useClass:<E>Service}, ... ], exports:[ I<E>Service, ... ] })`.
  - `schemas/<module>.schema.ts` — empty starter with the `reqStr` helper + import `z` from `zod`.
  - **Registration:** append the module to `app.module.ts` `imports` + `RouterModule.register([{ path: '<module>', module: <Module> }])`. Show the exact edit pattern (idempotent — don't duplicate).
  - Postgres schema name `<module>` (entities use `@Entity({ schema: '<module>' })`); add `<module>` to `main.ts` `MODULE_SCHEMAS`.
  - Permission-code namespace note: codes are `<module>_<entity>:<action>`.

- [ ] **Step 2: Sync + commit** (message: `feat(nestjs): init-module pack — bounded-context module + registration`).

---

## Task 5: `init-entity` pack (full CRUD stack)

**Files:** Create `_refs/nestjs/write-code/init-entity.md`

- [ ] **Step 1: Author the pack** — generate the full CRUD stack for one entity inside a module, exactly mirroring the reference module anatomy. English. Templates (each grounded in the fact sheets):
  - **Entity** `entities/<entity>.entity.ts` — `@Entity({ schema:'<module>', name:'<table>', orderBy:{createdAt:'DESC'} })`, `@Index`/`@Unique` as needed, `extends BaseEntity` (the app's local `common/base-entity`), tenancy columns `@Column() @Scoped() tenantCode/departmentCode`, typed `@Column`s, `@ManyToOne`+`@JoinColumn` relations, `@SearchableFields({exact,contain,activeColumn})`. Add to `entities/index.ts`.
  - **Repository** `repositories/<entity>.repository.ts` — `export interface I<E>Repository extends IBaseRepository<E> {}` + `export const I<E>Repository = Symbol('I<E>Repository')` + `class <E>Repository extends BaseRepository<E> implements I<E>Repository { constructor(@InjectDataSource() ds: DataSource){ super(<E>, ds, { logHistory:true }); } }`. Barrel.
  - **DTO** in `@shared/<module>/<entity>.model.ts` — `interface <E>DTO { id; ...; deletable?; restorable?; }`.
  - **Service** `services/<entity>.service.ts` — `I<E>Service` interface (extends `IBaseService<E,<E>DTO>`) + `Symbol` token + `class <E>Service extends BaseService<E,<E>DTO> implements I<E>Service { constructor(@Inject(I<E>Repository) repo){ super(repo); } mapDTO(e){ ... permission-gated deletable/editable via SdContext.hasPermission ... } }`. Barrel.
  - **Zod schemas** in `schemas/<module>.schema.ts` — `<E>CreateSchema = z.object({...reqStr i18n codes...})`, `<E>UpdateSchema = <E>CreateSchema.partial()`.
  - **Controller** `controllers/<entity>.controller.ts` — `@Controller('<entity>') @UseGuards(AdminAuthGuard) class <E>Controller extends BaseController<E,<E>DTO> { constructor(@Inject(I<E>Service) svc){ super(svc); } @Post() @HasPermission('<module>_<entity>:create') @UseGuards(ZodValidationGuard(<E>CreateSchema)) create(@Body() req){ return ApiResponse.ok(this.svc.create(req)); } @Put(':id') @HasPermission('<module>_<entity>:update') @UseGuards(ZodValidationGuard(<E>UpdateSchema)) update(...) {...} }` (paging/detail/delete inherited from `BaseController`, gated by `@HasPermission` if needed). Barrel.
  - **Module wiring** — add entity to `forFeature`, repo+service provider bindings, service export. Show the exact `module.ts` edits.
  - **Permission codes** emitted: `<module>_<entity>:{create,update,delete,list,view,...}` (flat `model:action`).
  - **Smoke** the generated entity: `npm run build` (typecheck) + a note that integration tests use the core's `pg-mem` fixture.

- [ ] **Step 2: Sync + commit** (message: `feat(nestjs): init-entity pack — full CRUD stack (entity/repo/service/controller/schema)`).

---

## Task 6: `actions` pack (custom / non-CRUD endpoints)

**Files:** Create `_refs/nestjs/write-code/actions.md`

- [ ] **Step 1: Author the pack** — add custom endpoints + behaviors beyond CRUD, mirroring the reference `TaskService` (mine/team/transition/exportReportSummary). English. Cover:
  - **Domain service methods** — add to the `I<E>Service` interface + impl; inject cross-module services via their `Symbol` token + `@Inject` (import the providing module in `module.ts`).
  - **Custom controller routes** — `@Post('mine')`/`@Put(':id/transition')` etc. with `@HasPermission('<model>:<action>')` (custom actions like `view_mine`, `export_report_summary`) + `ZodValidationGuard` where a body is validated.
  - **Cross-module access** — example: CRM Task injecting `IUserService`/`ITeamService` from admin/masterdata modules; the `module.ts` `imports` addition.
  - **Bulk + Excel export** — `exceljs` buffer pattern returning `{ buffer, fileName }` + `Content-Disposition`.
  - **Workflow transition** — status-category state machine on the entity (the reference `transition` pattern), updating `statusId`/`statusCategory`.
  - **Permission-gated DTO fields** — `mapDTO` computing `editable`/`transitionable`/`deletable` via `SdContext.hasPermission`.
  - **Transactions** — explicit `QueryRunner` threaded through `repo.create(entity, qr)` for multi-write operations (core supports the `qr?` param).
  - **Domain errors** — `badRequest('<i18n-code>', params)` (bilingual via the i18n filter).

- [ ] **Step 2: Sync + commit** (message: `feat(nestjs): actions pack — custom endpoints, cross-module, workflow, export`).

---

## Task 7: Upgrade `nestjs-write-code` skill + reconcile refs

**Files:** Modify `skills/tracks/nestjs/write-code.md`, `_refs/sdlc/nestjs.md`, `_refs/nestjs/architecture-principles.md`

- [ ] **Step 1: Rewrite `skills/tracks/nestjs/write-code.md`** to a pack-dispatching orchestrator, mirroring `skills/tracks/angular/write-code.md`. English-only frontmatter + body:
  - `name: nestjs-write-code` (unchanged). New `description` (English): "Generate NestJS modular-monolith backend code on `@sdcorejs/nestjs` — after `sdcorejs-review-plan` approves, OR as the single entry point for any direct backend code-gen request. Loads the matching on-demand pack under `_refs/nestjs/write-code/`: init-project, init-module, init-entity (full CRUD stack), actions (custom / non-CRUD). Triggers - "init backend / scaffold nestjs app", "add module", "add entity / CRUD", "add endpoint / custom action / workflow / bulk / export", plus generic "generate backend code", "go ahead" (after a nestjs plan was approved). NOT for spec/plan, code review, or angular/nextjs code. After completion runs the mandatory tail chain (sdcorejs-test → sdcorejs-review → repair-loop → comment-code → verify-before-done → branch-ready → auto-docs → auto-task-tracker → memories). Bilingual (VI/EN runtime)." Remove the stale "SCAFFOLD STATUS … 10-init-project, 11-init-module … not yet implemented" sentence.
  - Body: per-pack trigger catalog (which pack for which request) + how it loads `_refs/nestjs/write-code/<pack>.md` on demand + persona Step 0 + the mandatory tail chain + "writes to target project, not this repo". Mirror the angular orchestrator's structure.

- [ ] **Step 2: Reconcile `_refs/sdlc/nestjs.md` + `_refs/nestjs/architecture-principles.md`** with the grounded reality. Edits (verify each anchor with Read first):
  - Core package is `@sdcorejs/nestjs` with sub-path imports (correct any stale name like `be-masterdata` baseline references that conflict).
  - Permission code format: the reference app uses flat `model:action` (`crm_task:create`) — align (architecture-principles previously hedged "pick one"; set the convention to `<module>_<entity>:<action>`).
  - Persistence: schema-per-module Postgres + `synchronize` in dev / migrations in prod — document explicitly and reconcile the Plan 2 Dockerfile CMD note.
  - Cross-reference `_refs/nestjs/core-catalog.md` + `_refs/nestjs/write-code/*` packs.

- [ ] **Step 3: Frontmatter + sync gate.**
```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && bash .claude/check-skill-frontmatter.sh skills/tracks/nestjs/write-code.md && bash .claude/sync-skills.sh >/dev/null && bash .claude/sync-skills.sh --check 2>&1 | grep -E "in sync|OUT OF" && echo NESTJS_SKILL_OK
```
Expected: frontmatter exit 0; four "in sync"; `NESTJS_SKILL_OK`.

- [ ] **Step 4: Commit** (message: `feat(nestjs): write-code orchestrator dispatches write-code packs (+ reconcile refs)`).

---

## Task 8: Wire entry files + TESTING + design + full validation

**Files:** Modify `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `TESTING.md`, design doc

- [ ] **Step 1: Entry files — flip NestJS track status.** In CLAUDE.md (+ AGENTS.md + copilot) Tracks table, change NestJS from "🟡 Scaffold" to "✅ Complete (write-code orchestrator dispatches `_refs/nestjs/write-code/` packs: init-project, init-module, init-entity, actions; core `@sdcorejs/nestjs`)". Update any workflow text that called nestjs a scaffold/plan-walker.

- [ ] **Step 2: TESTING.md — add Test 9 (NestJS write-code).** Three prompts + pass criteria:
  - `scaffold a nestjs backend` → dispatches `nestjs-write-code` (init-project pack); pass: proposes app skeleton (package.json with `@sdcorejs/nestjs`, app.module with `SdCoreModule.forRoot`, schema-per-module, main.ts ensureSchemas) into the TARGET project.
  - `add a products module with a product entity` → init-module + init-entity; pass: emits entity (extends base-entity, `@Scoped`, `@Entity({schema})`), repository (`BaseRepository` + Symbol token), service (`BaseService` + mapDTO), controller (`BaseController` + `AdminAuthGuard` + `@HasPermission('products_product:create')` + `ZodValidationGuard`), Zod schema.
  - `add a bulk-approve endpoint to products` → actions pack; pass: custom route + `@HasPermission` + service method.

- [ ] **Step 3: Design doc** — Sequencing, append to Phase 3 line ` — ✅ shipped (Plan 3)`.

- [ ] **Step 4: Full validation + commit.**
```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && npx lefthook run check 2>&1 | tail -8 ; bash .claude/sync-skills.sh --check 2>&1 | grep -E "in sync|OUT OF" && git add -A && git commit -F - <<'MSG'
docs(nestjs): flip track to complete + TESTING; mark Phase 3 shipped

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
MSG
```
Expected: lefthook check passes; mirrors in sync (skill count unchanged at 40 — packs are `_refs`, not skills; only `nestjs-write-code`'s body changed).

---

## Self-review notes (author)

- **Spec coverage:** implements design §Phase 3 (nestjs write-code packs). The pack set deviates from the design's illustrative `controller/service/repository` list → `init-project/init-module/init-entity/actions` (justified above; flagged for review). Phase 4 (`sdcorejs-solution-builder`) deferred.
- **Grounded, not invented:** every template traces to `@sdcorejs/nestjs` v0.1.6 exports (core fact sheet) + the `enterprise-platform` reference app (anatomy fact sheet) — import sub-paths, base classes, `SdCoreModule.forRoot`, `model:action` codes, schema-per-module, Zod v4 schemas, `SdContext`, `AdminAuthGuard`.
- **English source** applied throughout (Task 1 records the convention; all packs + the skill description authored in English).
- **Cross-plan reconciliation:** Task 3 + Task 7 explicitly reconcile the Plan 2 `backend.Dockerfile` migration CMD against the reference app's synchronize-in-dev model (don't leave the Dockerfile assuming a migration script that init-project doesn't create).
- **Adapted "tests":** docs/skills repo — verification = frontmatter check, mirror `--check`, content-correctness review of snippets against `core-catalog.md`, smoke-test entries. Real `npm run build` of generated output is E2E in a target project (out of scope to land this plan).

## Deferred (flag for the user)
- **Retrofit existing ~40 skills to English-only descriptions/triggers.** Task 1 sets the convention + applies it to new content; existing skills (Plan 1/2 + the inherited pack) still carry Vietnamese trigger phrases. A dedicated sweep (its own small plan) should translate them — risk: VI trigger phrases currently aid VI-request matching, so verify trigger-eval after. Recommend a separate pass, not folded into Plan 3.
- nestjs **integration test pack** (using core's `pg-mem` fixture) — natural Plan 3.5 once codegen lands.
