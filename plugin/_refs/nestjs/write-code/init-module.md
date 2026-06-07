> **Reference for the `nestjs-write-code` orchestrator.** Loaded on demand when the
> confirmed plan adds a new bounded-context module to an existing `@sdcorejs/nestjs` app.
> Not a standalone skill — the orchestrator reads this file when its dispatch table routes
> a step here.

# Init Module — Add a Bounded-Context Module (`@sdcorejs/nestjs`)

## Purpose / when to use

Add a **single domain (bounded-context) module** to a backend that was already scaffolded by [`init-project`](./init-project.md): its own Postgres schema, its `<module>.module.ts` wiring (`TypeOrmModule.forFeature` + provider bindings + exports), the four barrel folders (`entities` / `repositories` / `services` / `controllers`), a starter Zod `schemas/` file, and the two app-level registrations (`RouterModule.register` + `MODULE_SCHEMAS`). The module ships **empty of entities** — `init-entity` appends the first full CRUD afterwards.

Run order: **`init-project` → `init-module` → `init-entity`**. Use when the plan asks to:

- "Tạo module X" / "thêm bounded context" / "add a domain module"
- "Scaffold the `crm` / `masterdata` / `billing` module"
- "Set up a new module before adding entities"

**Output:** a registered, runnable-but-empty module. After this step `npm run build` still typechecks (no entities to compile yet) and `init-entity` has a home to append into.

### Critical write-target rule

**All generated files are written to the TARGET backend project** (the one `init-project` created), NEVER into this agent repo (`sdcorejs-agent`). The templates below are the source of truth; render them into the target project's `src/modules/<module>/`.

### Persona Step 0 (non-tech mode)

If the persona is **non-technical**, open with plain language before generating, e.g.:

> "I'll create a new self-contained area of your backend for `<module>` — its own data space and its own folders for the pieces we'll add next. After this we'll add the first record type (entity) inside it."

Then confirm only the blocking input (the module name). For a technical persona, skip the narration.

---

## Source of truth — core package

Read [`_refs/nestjs/core-catalog.md`](../core-catalog.md) for the canonical export inventory + import sub-paths BEFORE generating. Every import in the templates below MUST match a sub-path the catalog documents (`@sdcorejs/nestjs`, `/orm`, `/permission`, `/validation`, …). Do not invent imports. The provider-binding pattern (Symbol I-token → concrete class) and the `BaseRepository` / `BaseService` / `BaseController` building blocks come from the catalog's "ORM building blocks" section.

---

## Profile (read FIRST)

Read `profile` from `<target>/.sdcorejs/summary.md` (set at clarify; default `simple`).
Most of this pack is profile-INDEPENDENT (schema-per-module, route prefix, barrels,
the Symbol-I-token DI pattern, RouterModule + MODULE_SCHEMAS registration). The only
profile-divergent point is the DTO/contract location (Step 5 below). `enterprise` output
is unchanged from prior versions.

---

## Input resolution

Before generating, confirm:

1. **Module name** (required) — a lowercase kebab/single word that names the bounded context and doubles as the Postgres schema name and the route prefix. Placeholder below: `<module>` (e.g. `crm`, `masterdata`, `billing`). The PascalCase form is `<Module>` (e.g. `crm` → `Crm`).
2. **Cross-module dependencies** (optional) — other modules this one imports to consume their exported service I-tokens via DI (e.g. `crm` imports `AdminModule` for `IUserService`). Empty for a leaf module. (*Ground: ref app `crm.module.ts` imports `AdminModule` + `MasterdataModule`.*)

> Note: `simple`-profile modules are usually **leaf** (no cross-module imports). The cross-module DI-port pattern below applies to BOTH profiles, but only when a dependency genuinely exists — omit the `imports:` cross-module block for a standalone module.

> Naming derivation used throughout: `<module>` = `crm`, `<Module>` = `Crm`, schema = `crm`, route prefix = `crm`, class = `CrmModule`, file = `crm.module.ts`. Keep all five consistent.

---

## Generation steps

### Step 1 — folder skeleton + barrels

Create the module root and its four canonical subfolders plus a `schemas/` folder:

```
src/modules/<module>/
├── <module>.module.ts          # Step 2
├── entities/
│   └── index.ts                # barrel (empty until init-entity adds entities)
├── repositories/
│   └── index.ts                # barrel
├── services/
│   └── index.ts                # barrel
├── controllers/
│   └── index.ts                # barrel
└── schemas/
    └── <module>.schema.ts      # Step 3
```

Each of the four subfolders gets a **barrel `index.ts`** that re-exports every file in that folder. On a fresh module the barrels start empty (a comment placeholder); `init-entity` appends one `export * from './<entity>.<kind>';` line per file it creates. *(Ground: ref app `crm/entities/index.ts`, `crm/repositories/index.ts`, `crm/services/index.ts`, `crm/controllers/index.ts` — each is a flat list of `export *` lines.)*

```ts
// src/modules/<module>/entities/index.ts
// Barrel — entities live in the `<module>` Postgres schema. init-entity appends:
//   export * from './<entity>.entity';
```

```ts
// src/modules/<module>/repositories/index.ts
// Barrel — each repository file exports BOTH the Symbol I-token AND the concrete class
// (and the I<Entity>Repository interface). init-entity appends:
//   export * from './<entity>.repository';
```

```ts
// src/modules/<module>/services/index.ts
// Barrel — each service file exports BOTH the Symbol I-token AND the concrete class
// (and the I<Entity>Service interface). init-entity appends:
//   export * from './<entity>.service';
```

```ts
// src/modules/<module>/controllers/index.ts
// Barrel — init-entity appends:
//   export * from './<entity>.controller';
```

> **Why repositories/services export the Symbol I-token from the same file (and barrel).** The DI binding uses the `Symbol` as the provide-token and the class as `useClass` (Step 2). Cross-module consumers `@Inject(IFooService)` against the **token re-exported through the barrel** (`from 'src/modules/<module>/services'`) without importing the concrete class — preserving the port/adapter boundary. The interface, the `Symbol`, and the class **share one name** by declaration merging (TS lets a `const` and an `interface` co-exist under the same identifier), exactly as the ref app does:
>
> ```ts
> // pattern init-entity will emit per entity (shown here for grounding, NOT created by init-module)
> export interface IFooRepository extends IBaseRepository<Foo> {}
> export const IFooRepository = Symbol('IFooRepository');
> export class FooRepository extends BaseRepository<Foo> implements IFooRepository { /* ... */ }
> ```
>
> *(Ground: ref app `crm/repositories/task.repository.ts` lines 7-14 and `crm/services/task.service.ts` lines 16-38 — `export interface I…` + `export const I… = Symbol('I…')` + `export class … implements I…`.)*

### Step 2 — `<module>.module.ts`

The module wires everything together. On a fresh module the entity / controller / provider arrays are **empty** — they are placeholders `init-entity` appends to. The shape below mirrors the ref app `crm.module.ts` (imports + forFeature + provider bindings + exports). *(Ground: ref app `src/modules/crm/crm.module.ts`.)*

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Cross-module dependencies (Step Input #2): import other modules to consume their exported
// service I-tokens via DI. Remove this block for a leaf module with no cross-context deps.
// import { AdminModule } from 'src/modules/admin/admin.module';

// init-entity appends entities, controllers, repositories, services to these barrels + arrays.
// import { /* entities */ } from './entities';
// import { /* controllers */ } from './controllers';
// import { /* I<E>Repository, <E>Repository */ } from './repositories';
// import { /* I<E>Service, <E>Service */ } from './services';

/**
 * <Module> bounded-context module. Entities live in the `<module>` Postgres schema; cross-module
 * access is via DI ports (no cross-schema FK, no HTTP). Exports its service I-tokens so other
 * modules can @Inject them. init-entity appends one entity + its repo/service/controller per CRUD.
 */
@Module({
  imports: [
    // AdminModule, // cross-module dep — exposes IUserService etc.
    TypeOrmModule.forFeature([
      // <E>,  ← init-entity appends each entity class here so its repository can inject the repo
    ]),
  ],
  controllers: [
    // <E>Controller,  ← init-entity appends
  ],
  providers: [
    // ---- Repositories: bind the Symbol I-token to the concrete class ----
    // { provide: I<E>Repository, useClass: <E>Repository },

    // ---- Services: bind the Symbol I-token to the concrete class ----
    // { provide: I<E>Service, useClass: <E>Service },
  ],
  exports: [
    // I<E>Service,  ← export service tokens consumed by other modules as DI ports
  ],
})
export class <Module>Module {}
```

> **Provider-binding pattern (the part `init-entity` extends).** Each entity contributes FOUR lines spread across the arrays:
> 1. `TypeOrmModule.forFeature([..., <E>])` — registers the entity's TypeORM repository.
> 2. `controllers: [..., <E>Controller]`
> 3. `providers: [..., { provide: I<E>Repository, useClass: <E>Repository }]`
> 4. `providers: [..., { provide: I<E>Service, useClass: <E>Service }]`
> and optionally `exports: [..., I<E>Service]` when another module consumes it. The `{ provide: <Symbol>, useClass: <Class> }` shape is what lets `@Inject(I<E>Service)` resolve the concrete class while callers depend only on the token. *(Ground: ref app `crm.module.ts` lines 104-130 providers, lines 131-142 exports.)*

### Step 3 — `schemas/<module>.schema.ts`

A starter Zod v4 validation file with the shared `reqStr` helper. `init-entity` appends `<Entity>CreateSchema` / `<Entity>UpdateSchema` pairs here, wired into controllers via `ZodValidationGuard` (catalog "Validation" section). On a fresh module it holds only the helper + a header. *(Ground: ref app `src/modules/crm/schemas/crm.schema.ts` lines 1-17.)*

```ts
import { z } from 'zod';

/**
 * Zod v4 validation schemas for <module> write requests. Boundary validation is wired via
 * ZodValidationGuard on controller create/update routes (strips unknown keys, coerces nothing).
 *
 * Each error message is an i18n CODE (e.g. `<module>.<entity>.<field>.required`); the guard
 * surfaces the code, and the app's exception filter localizes it through the i18n catalog.
 *
 * Convention: `<Entity>CreateSchema` enforces required fields; `<Entity>UpdateSchema` = `.partial()`
 * (every field optional, but any present field must still satisfy its rules). init-entity appends
 * a Create/Update pair per entity below.
 */

/** Required, trimmed, non-empty string whose error resolves to the given i18n code. */
const reqStr = (code: string) => z.string({ error: code }).trim().min(1, code);

// init-entity appends, e.g.:
// export const <Entity>CreateSchema = z.object({ name: reqStr('<module>.<entity>.name.required') });
// export const <Entity>UpdateSchema = <Entity>CreateSchema.partial();
```

> `reqStr` is intentionally exported via local use (kept in this file). If `init-entity` needs it cross-file, promote it to a shared helper; the ref app keeps it module-local. The `// eslint-disable` line is unused on a fresh file with no `reqStr` consumer yet — once `init-entity` adds the first schema using `reqStr`, the lint "unused var" warning clears. If your lint fails on the unused helper before any entity exists, add a temporary `void reqStr;` or generate the module together with its first entity.

### Step 4 — register the module in the app (two idempotent edits)

Two app-level files gain one entry each. **Both edits MUST be idempotent** — never duplicate an entry that already exists (re-running `init-module` for the same `<module>` is a no-op).

**4a — `src/app.module.ts`:** add the module to `imports` AND a `RouterModule.register([...])` entry so every controller in the module serves under the `/<module>` prefix. *(Ground: ref app `src/app.module.ts` — `CrmModule` in `imports` line 109, `{ path: 'crm', module: CrmModule }` in `RouterModule.register` line 121.)*

```ts
// src/app.module.ts
import { <Module>Module } from './modules/<module>/<module>.module';   // ← add import (skip if present)

@Module({
  imports: [
    // ...existing imports...
    <Module>Module,                                                    // ← add to imports[] (skip if present)

    // RouterModule.register([]) was emitted EMPTY by init-project. Append one entry per module
    // (a controller's path does NOT cascade from a parent module's prefix — each needs its own entry):
    RouterModule.register([
      // ...existing { path, module } entries...
      { path: '<module>', module: <Module>Module },                    // ← add this entry (skip if present)
    ]),
  ],
})
export class AppModule {}
```

> **Idempotency check:** before editing, scan `app.module.ts` for `<Module>Module` and `path: '<module>'`. If either already appears, skip that specific insertion. If `RouterModule.register([])` is still empty (fresh from `init-project`), replace `[]` with `[{ path: '<module>', module: <Module>Module }]`; otherwise append inside the existing array.

**4b — `src/main.ts`:** add `'<module>'` to the `MODULE_SCHEMAS` array so `ensureSchemas()` creates the Postgres schema on boot (TypeORM `synchronize` creates tables but never the schema). *(Ground: ref app `src/main.ts` line 8 — `const MODULE_SCHEMAS = ['admin', 'masterdata', 'crm', 'fleet', 'workflow', 'annify'];`.)*

```ts
// src/main.ts
// init-project emitted: const MODULE_SCHEMAS = ['core', ...];  (or ['core'] on a bare scaffold)
const MODULE_SCHEMAS = ['core', '<module>'];   // ← add '<module>' (skip if already in the array)
```

> **Idempotency check:** if `'<module>'` is already an element of `MODULE_SCHEMAS`, leave it. The schema name here MUST match the `@Entity({ schema: '<module>' })` every entity in this module declares (Step 5) — `init-entity` sets that schema on each entity.

### Step 5 — conventions to follow inside the module

- **Postgres schema-per-module.** Every entity `init-entity` adds sets `@Entity({ schema: '<module>', name: '<table>' })` (*ground: ref app `crm/entities/task-status.entity.ts` line 6-12 — `@Entity({ schema: 'crm', name: 'task-status' })`*). The schema name = the module name = the `MODULE_SCHEMAS` entry (Step 4b) = the route prefix (Step 4a). No cross-schema foreign keys — cross-module data access goes through exported service I-tokens, not SQL joins.
- **Permission-code namespace `<module>_<entity>:<action>`.** Route guards use `@HasPermission('<module>_<entity>:<action>')` and services check `SdContext.hasPermission('<module>_<entity>', '<action>')` (the facade joins them to `<module>_<entity>:<action>`). The model segment is `<module>_<entity>` (underscore-joined), the action is one of `create` / `update` / `delete` / `view` (extend per feature). *(Ground: ref app `crm/services/task.service.ts` lines 572-575 — `hasPermission('crm_task', 'update')`, `hasPermission('crm_task', 'delete')`.)*
- **Barrel discipline.** Code OUTSIDE a folder imports from the folder barrel (`from 'src/modules/<module>/repositories'`), never from a deep file path. `init-entity` keeps each barrel's `export *` list current in the same change that adds the file.
- **Cross-module DI = exported service I-tokens only.** A module exports the service `Symbol` tokens (NOT repositories, NOT concrete classes) other modules need. The consumer imports the producing module and `@Inject(IFooService)` the token. *(Ground: ref app `crm.module.ts` `exports: [ITaskService, IDealService, …]` and `task.service.ts` constructor `@Inject(IUserService)` / `@Inject(ITeamService)` from imported `AdminModule` / `MasterdataModule`.)*
- **App base entity.** Entities extend the app's `BaseEntity` (`src/common/base-entity.ts` from `init-project`, which wraps the lib `WithAudit(BaseEntity)`), not the lib base directly — so audit/timestamps are uniform.
- **DTO / contract location (profile-divergent).** `simple` → entity DTOs live in `src/modules/<module>/dto/<entity>.dto.ts` (no `base/shared`; `init-entity` emits them). `enterprise` → DTOs live in the `@shared` kernel at `base/shared/<module>/` so the Angular portal imports the same type. Everything else in this pack is identical across profiles.

---

## Expected module structure (after init-module, before init-entity)

```
src/modules/<module>/
├── <module>.module.ts          # @Module with empty forFeature/controllers/providers/exports arrays
├── entities/index.ts           # empty barrel
├── repositories/index.ts       # empty barrel
├── services/index.ts           # empty barrel
├── controllers/index.ts        # empty barrel
└── schemas/<module>.schema.ts  # z import + reqStr helper

# plus two edits to existing app files:
src/app.module.ts               # + <Module>Module in imports + RouterModule.register entry
src/main.ts                     # + '<module>' in MODULE_SCHEMAS
```

---

## Verification checklist

- `src/modules/<module>/<module>.module.ts` exists and exports `<Module>Module`.
- All four barrels (`entities` / `repositories` / `services` / `controllers`) and `schemas/<module>.schema.ts` exist.
- `src/app.module.ts` imports `<Module>Module` exactly once AND has exactly one `{ path: '<module>', module: <Module>Module }` in `RouterModule.register`.
- `src/main.ts` `MODULE_SCHEMAS` contains `'<module>'` exactly once.
- `npm run build` (nest build) typechecks — the empty module compiles (no entities yet).
- Re-running `init-module` for the same `<module>` makes NO duplicate edits (idempotent).
- Hand off to `init-entity` to add the first full CRUD into this module.

---

## Example input

```text
Thêm module `crm` vào backend hiện tại. Schema riêng `crm`, route prefix `/crm`.
Module này phụ thuộc AdminModule (IUserService) và MasterdataModule (IEmployeeService, ITeamService).
```
