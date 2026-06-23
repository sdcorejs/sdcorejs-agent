---
name: sdcorejs-angular
description: Angular portal code executor for approved/direct frontend work with confirmed requirements. Use for init portal, admin screens, modules, CRUD entities, list/detail screens, forms/validators, actions, approval/bulk/export buttons, reuse of existing related models/services/entities, reuse of @sdcorejs/utils utilities, or generic generate-code/go-ahead requests. Loads _refs/angular/write-code/ packs and runs mandatory finish tail. Runtime-localized.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, TodoWrite
---

# 07 — Write Code (Orchestrator)


## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.

## Purpose

Single entry point for generating Angular-portal code. Transforms an approved plan from `sdcorejs-execute-plan` plus the user's confirmed scope into complete CRUD entity code:
- Model (DTO, SaveReq, validators)
- Service (mock-first CRUD via centralized seed data file)
- Routes (lazy-loaded)
- Components (List, Detail)
- Workflow / bulk / custom action buttons

This skill is an **orchestrator**: it does NOT inline the full generation rules for every file type. It picks the right **reference pack** for each scope item and reads it on demand. The detailed rules + code-template links for each concern live in `_refs/angular/write-code/*.md` (formerly the 10/11/12/20/21/31 sub-skills — consolidated here so the track exposes one skill instead of seven).

## Dispatch table

For each scope item in the approved plan (or a direct request whose requirements are already confirmed), READ the matching reference pack and follow it:

| Scope item | Reference pack to read |
|---|---|
| New portal (no existing project yet) | [`_refs/angular/write-code/init-portal.md`](_refs/angular/write-code/init-portal.md) (run FIRST before any module work) |
| Always — admin screens (account/role/permission [+tenant/department enterprise]) | [`_refs/angular/write-code/admin-screens.md`](_refs/angular/write-code/admin-screens.md) (ALWAYS run, after init-portal) |
| New module (`src/libs/<module>/`) | [`_refs/angular/write-code/init-module.md`](_refs/angular/write-code/init-module.md) |
| New entity with full CRUD (model + service + routes + list + detail) | [`_refs/angular/write-code/init-entity.md`](_refs/angular/write-code/init-entity.md) |
| Entity/model/service reuse preflight before generating or extending entity contracts | [`_refs/angular/write-code/reuse-existing-entities.md`](_refs/angular/write-code/reuse-existing-entities.md) |
| List page only (entity already exists) | [`_refs/angular/write-code/screen-list.md`](_refs/angular/write-code/screen-list.md) |
| Detail component — any state (CREATE / UPDATE / DETAIL) or form refinement (validators, FormArray, async validators) | [`_refs/angular/write-code/screen-detail.md`](_refs/angular/write-code/screen-detail.md) |
| Action buttons — workflow transitions, bulk operations, custom side-effects (export, re-sync, etc.) | [`_refs/angular/write-code/actions.md`](_refs/angular/write-code/actions.md) |

Read ON DEMAND only — load the one reference for the step you are executing, not all of them. Each reference further links to the literal code templates under `_refs/angular/templates/`.

### Step 0 — Pre-flight: ensure project summary

Before dispatching ANY reference, run `sdcorejs-explore (summary mode)`. If `<target>/.sdcorejs/summary.md` is missing, it MUST be generated first (`sdcorejs-explore` scans the code map and distills the brief) — this is the gate that stops generation from hallucinating paths / duplicating shared abstractions. If the summary exists, `sdcorejs-explore` reads it and refreshes on drift so dispatch slots into the real architecture. Exception: when this run is itself a brand-new init-portal, there is no project to summarize yet — run summary mode at the END of init instead (see `init-portal.md` Post-init).

Before generating or extending any model, interface, type, service, store, repository, or API client, also run the entity reuse preflight in `_refs/angular/write-code/reuse-existing-entities.md`. This is mandatory for API docs, PRDs, Figma/image/screenshot input, business descriptions, schemas, and any feature with related entities. The codebase is the source of truth for reuse decisions; the external artifact is only the new contract.

Before writing any helper, formatter, validator, mapper, pipe utility, paging/filter helper, random-id helper, query-param helper, upload/download helper, or clipboard/browser helper, read `_refs/shared/sdcorejs-utils.md` and reuse `@sdcorejs/utils` when it covers the behavior. The package must be a direct target-project dependency before generated code imports it; do not rely on Core UI's transitive dependencies.

### Execution order + hand-off

Execution order: portal → admin-screens → module → entity → screens → actions. `admin-screens` ALWAYS runs after `init-portal` and before any domain module work. If the plan touches multiple items, run them in this order; do not parallelize. After all referenced steps finish, hand off as follows:

#### MANDATORY: Core UI usage summary (show the user right after generating)

Right after the code is written and BEFORE the finish gate, emit a short table of every `@sdcorejs/angular` Core UI piece the feature actually uses — component, service, or directive — each with a one-line purpose **tied to this feature**, in the user's language. This gives the user (especially non-tech) a plain-language overview of the building blocks. Build the rows from what you ACTUALLY imported/used — never list a component you didn't use, never describe it generically.

```
🧩 Core UI dùng trong <tên chức năng>:

| Core UI | Vai trò trong chức năng này |
|---|---|
| `SdTable` | Hiển thị danh sách <entity> kèm phân trang, lọc, sắp xếp |
| `SdNotifyService` | Thông báo thành công / lỗi khi lưu, xoá |
| `SdSection` | Gom nhóm các trường trong màn hình chi tiết |
| `sd-button` | Nút Lưu / Huỷ / hành động |
```

Keep each purpose one line, concrete to the feature (not "a table component"). Persona-aware: plain wording for non-tech. The same table is persisted into the module's user guide at the write-user-guide step.

#### MANDATORY FINISH GATE (always — standalone trigger OR full SDLC flow)

**STOP and present the consolidated finish gate from [`_refs/shared/finish-gate.md`](../../../_refs/shared/finish-gate.md) before running ANY tail step.** This is UNCONDITIONAL: it fires even when this skill was triggered directly for a one-line request (e.g. "add entity", "create module X") — NOT only inside the spec→plan flow. The gate surfaces tests / comments / user-guide / review with defaults so the user always knows these steps exist and can opt out. "Small change" is not a reason to skip the gate. Read the ref for the exact prompt + rules.

Then run the tail in this order, honoring the gate's answers (skip = omit that step; everything not skipped runs):

1. *(if Tests not skipped)* `sdcorejs-test` (sdcorejs-test) — RUN the `.spec.ts` files already written RED-first during the TDD gate and report pass/fail + failing names; add happy-path e2e only when a dev server/browser is available (else report the exact local command). Unit specs are NOT optional unless the user chose `skip` in the gate — if any testable file still lacks one, write it here.
2. *(if Review not skipped)* `sdcorejs-review` (skills/shared/workflow/review.md; auto-detects Angular → loads `_refs/angular/review-code.md`) — convention check; actionable Angular code-review table with severity, group, file/line, risk, fix, and gate
3. *(if Review not skipped)* `sdcorejs-repair-loop` — apply findings, iterate until `BLOCKER`/`REQUIRED` findings are fixed or explicitly deferred
4. `sdcorejs-comment-code` — apply the comment level the FINISH GATE captured (skip / simple / medium / full). Do NOT ASK again — the gate already asked. Cross-track baseline + per-track addenda live in `_refs/orchestration/tail/comment-code.md`
5. `sdcorejs-product` *(when user-visible feature traceability is needed)* - seed/update `.sdcorejs/docs/product/` with requirement, implementation, and test mapping
6. `sdcorejs-ship (verify-before-done mode)` *(always)* — BLOCK "done" until acceptance criteria from the spec are ✅ verified or ⚠️ explicitly deferred
7. `sdcorejs-ship (branch-ready mode)` *(always)* — branch-hygiene sweep (debug logs, secrets, focused tests, lint+build+test) + merge/PR options
8. `_refs/orchestration/tail/auto-docs.md` *(always)* — session summary written to `<target>/.sdcorejs/docs/angular/`
9. *(if User guide not skipped)* `sdcorejs-write-user-guide` (Mode 1) — update the touched module's `.sdcorejs/user-guide/<module>.md` (features / routes / permissions / data + Coverage-vs-requirements). Per-module incremental; the aggregate rebuilds at ship.
10. `_refs/orchestration/tail/auto-task-tracker.md` *(always)* — tick `[x]` completed tasks, append new ones from the doc's "Next suggested action" / "Open questions"
11. `sdcorejs-explore (memories mode)` — only if durable knowledge surfaced (recurring convention, stakeholder constraint, anti-pattern)

The FINISH GATE itself is mandatory and unconditional. The always-on plumbing steps (`sdcorejs-ship (verify-before-done mode)`, `sdcorejs-ship (branch-ready mode)`, auto-docs tail ref, auto-task-tracker tail ref, memories) run regardless of gate answers. Do NOT skip `sdcorejs-ship (verify-before-done mode)` — that's how acceptance criteria silently slip.

## When to Use

When user requests a new entity in a module, or any of the dispatch-table scope items:
- "Generate product CRUD in sample module" → init-entity
- "Initialize portal-shop with dev/qc/uat/prod" → init-portal
- "Create catalog module" → init-module
- "Create user list screen" → screen-list
- "Add validator to product form" → screen-detail
- "Add an approval button for orders" → actions

## Input Resolution

Before generating an entity, clarify with user:

1. **Module**: Which module does this entity belong to? (module)
   - If missing: Ask which existing module, or propose creating new module first (init-module)

2. **Entity Name**: What's the entity name? (entity, entityPascal)
   - Examples: product, employee, purchase-order, sales-invoice

3. **Display Label**: What label should appear in UI? (entityLabel, entityLabelPlural)
   - Examples: "Product", "Employee", "Purchase Order"

4. **Fields**: What fields should this entity have?
  - Ask user to describe fields OR infer a semantic schema when fields are omitted
  - For each field: name, type (string/number/date/select/etc), required?, label
  - When inferring, derive concrete domain fields from the entity meaning and current portal conventions
  - For localized portals, all generated labels must use proper diacritics

5. **UI Preferences**:
  - Detail layout: auto-select side-drawer or full-page from inferred complexity, unless user overrides
  - Has search? filter? delete? excel? (defaults: yes/yes/yes/no)
  - Permissions: use default naming pattern or custom? (default: {{ MODULE }}_{{ ENTITY }}_CREATE, etc.)

### Semantic Inference Fallback

If the user gives only the entity name or only a very vague description, do not stop at a generic skeleton. Build a first-pass `EntitySchema` from the entity semantics.

Use this inference order:
1. Entity noun meaning in localized/English
2. Existing portal conventions already confirmed in this repository
3. Common business fields for that entity class
4. Safe defaults for status/audit/search fields

Inference rules:
- Always infer an identity pair: `code` + `name` or `title`
- Add one or more classification fields when the entity naturally belongs to a type/category/group
- Add amount/date/status fields when the entity semantics imply pricing, lifecycle, scheduling, or accounting
- Add note/description only when the entity likely needs free-text explanation
- Add attachment/upload only when the entity likely carries documents/images/files
- Separate writable fields (`SaveReq`) from read-only/detail fields (`DTO`) such as approval status, created info, updated info, or derived totals
- Produce at least 3 meaningful list columns when the entity supports them
- Keep the inferred schema small enough to stay maintainable, but rich enough to render a believable business screen
- If the inferred form fits one compact business section, use `side-drawer`; otherwise use full page

## Generation Process

### TDD Gate — mandatory before each code-generating step (NEVER skipped, NEVER gated behind a question)

Tests are a REQUIRED deliverable of this skill, not an optional add-on. Every code-gen run MUST leave a runnable `.spec.ts` next to every testable production file. Do NOT ask the user whether to write tests, and do NOT ask which coverage level first — default to **`standard`** coverage and proceed. Only switch to `minimal` / `full` if the user EXPLICITLY requested a different level (e.g. in `sdcorejs-brainstorming`). A missing spec is a generation defect, not a style choice. RED-first is the DEFAULT ordering (not post-hoc).

Before writing any production file (model / service / list / detail), invoke `sdcorejs-test (tdd mode)`:

1. Write the failing `.spec.ts` for that chunk first → run test → confirm RED
2. Generate the production file with minimal passing code → run test → confirm GREEN
3. Refactor if needed → run test → confirm still GREEN

Applies to: model (validators / type contracts), service (CRUD method contracts), list component (rendering + actions), detail component (form + state transitions). Default `standard` coverage = `should create` + route-permission + list data/sort + detail save-flow/state, per `_refs/angular/templates/entity-tests.md`.

Skip RED-first for: `mock-data` seed rows (pure data, no testable logic) and `routes.ts` (Angular config — but its `*.routes.spec.ts` permission-validation spec IS still written).

### Step 1: Build EntitySchema (shared input for every reference)

From user input, product docs, design handoff, or semantic inference, construct `EntitySchema` with all field metadata. The schema is the single input every reference pack consumes — init-entity, screen-list, and screen-detail all read these names + field flags (`visibleInList`, `visibleInDetail`, `type`, `required`, permission codes).

If a matching `design/specs/` or `design/wireframes/` handoff exists, read it before generating UI. Follow its screen/state/copy contract unless it conflicts with approved product criteria; if it conflicts, stop and surface the mismatch instead of silently choosing one.

Before finalizing `EntitySchema`, identify the primary entity and every related entity, scan existing model/interface/type/dto/service/api/repository/store files, and record one decision per entity: `reuse`, `extend`, or `create new`. Relationship fields must point to existing imported types or minimal summary types when those contracts exist; use `<entity>Id` when the API only returns an id. Do not inline a related entity object or create a duplicate model/service after an existing contract is found.

Before outputting code, present a short reuse summary: existing model/service found, imports to reuse, files to extend, files to create, and why duplicate contracts are not being created.

For two worked examples (user-supplied Product fields + inferred Promotion schema), see [`_refs/angular/templates/orchestrator-step-examples.md#step-1--build-entityschema`](_refs/angular/templates/orchestrator-step-examples.md#step-1--build-entityschema).

### Step 2: Generate per the dispatched reference

Once the EntitySchema exists, generate each file by following the reference pack the dispatch table routed you to. The per-file rules, decision heuristics, and code-template links all live in the reference — do NOT re-derive them here. Map:

| File(s) | Reference + worked-code template |
|---|---|
| `<entity>.model.ts` (SaveReq / DTO / constants) | `init-entity.md` → [`orchestrator-step-examples.md#step-2--generate-model`](_refs/angular/templates/orchestrator-step-examples.md#step-2--generate-model-productmodelts) |
| `<entity>.mock-data.ts` + `<entity>.service.ts` (mock-first CRUD, 20–40 domain-realistic rows) | `init-entity.md` → [`orchestrator-step-examples.md#step-3--generate-mock-data--service`](_refs/angular/templates/orchestrator-step-examples.md#step-3--generate-mock-data--service) |
| `<entity>.routes.ts` (lazy-loaded, `data.permission`, no providers) | `init-entity.md` → [`orchestrator-step-examples.md#step-4--generate-routes`](_refs/angular/templates/orchestrator-step-examples.md#step-4--generate-routes-productroutests) |
| `pages/list/list.component.ts` | `screen-list.md` (+ `_refs/angular/templates/screen-list-component.md`) |
| `pages/detail/detail.component.ts` (CREATE / UPDATE / DETAIL + form) | `screen-detail.md` (+ `screen-detail-component.md`, `reactive-form-templates.md`) |
| Action buttons (workflow / bulk / custom) | `actions.md` |

For a full new entity, read `init-entity.md` end-to-end (it covers model → service → routes → list → detail in one pass). For a single-file refinement on an existing entity, read just the screen-list / screen-detail / actions reference.

## Code Generation Rules

These cross-cutting rules apply regardless of which reference is dispatched.

### 1. File Naming & Paths

```
src/libs/{{ module }}/features/{{ entityKebab }}/
  ├── services/
  │   ├── {{ entityKebab }}.model.ts       (DTO, SaveReq, constants)
  │   ├── {{ entityKebab }}.mock-data.ts   (20–40 domain-realistic seed rows)
  │   ├── {{ entityKebab }}.service.ts     (mock-first CRUD via MockCrudStore)
  │   └── index.ts                         (exports)
  ├── pages/
  │   ├── list/
  │   │   └── list.component.ts            (CRUD list with SdTable)
  │   └── detail/
  │       └── detail.component.ts          (CRUD form, CREATE/UPDATE/DETAIL)
  └── {{ entityKebab }}.routes.ts          (lazy-loaded routes)
```

### 2. Naming Conventions

- **entity** (kebab-case): product, purchase-order
- **entityPascal** (PascalCase): Product, PurchaseOrder
- **entityCamel** (camelCase): product, purchaseOrder
- **entityConstant** (CONSTANT_CASE): PRODUCT, PURCHASE_ORDER

Apply to:
- Service class name: `{{ entityPascal }}Service`
- Service injection token: `#{{ entityCamel }}Service`
- Model types: `{{ entityPascal }}DTO`, `{{ entityPascal }}SaveReq`
- Component selector: `{{ entityKebab }}-list`, `{{ entityKebab }}-detail`
- Route paths: `/{{ entity }}`, `/{{ entity }}/create`

### 2a. Existing entity/service reuse

- Search the target codebase for related entity contracts before creating new model/service/type files.
- Import and reuse existing related entity models, DTOs, summary types, options, and services.
- Extend an existing model/service minimally when it lacks the field/method required by the new feature.
- Preserve compatibility: prefer optional additions, do not rename existing fields without checking usages, and do not change a contract used by another feature without evidence.
- Create a new model/service only after the reuse search confirms no suitable existing contract and the folder/naming convention is clear.
- Never inline a full related entity object inside another model when a related entity type already exists.

### 3. TypeScript Strict Mode

- Use non-null assertions (!) only when 100% certain
- Avoid `any` type - use proper generics
- Inject services with `readonly #service = inject(...)`
- Use `@ViewChild` with proper typing

### 4. Form Validation

- Use `Validators.required` for required fields
- Use `Validators.maxLength(n)` for string length
- Use `Validators.min(n)`, `Validators.max(n)` for numbers
- Use `Validators.pattern(regex)` for patterns
- Custom validators for complex rules (see `screen-detail.md` form refinement)

### 5. Error Handling

- Wrap service calls in try-catch
- Call `SdLoadingService.show()/hide()` around async operations
- Call `SdNotifyService.error/success/warning/info()` for feedback
- Handle cancel/back cases gracefully
- Revert form state if save fails

### 6. Comments & Documentation

- Add JSDoc for public methods
- Comment complex logic (e.g., form state transitions)
- Document special cases (e.g., bulk updates)
- Keep comments concise and up-to-date

## Rules

### MUST DO
- Show a live progress checklist with **TodoWrite** from the START of generation — one checkbox item per planned unit (each file / screen / entity / pack step) PLUS the finishing steps (tests, review, comments, user-guide). Keep exactly one item `in_progress`; flip it to `completed` the moment that unit is done and start the next. Update after EACH task, never batch at the end — this is how the user tracks progress. Create it before writing the first file.
- Run the entity reuse preflight before generating model/service/entity code; identify primary + related entities, scan existing model/interface/type/dto/service/api/repository/store files, and decide reuse/extend/create new before writing code.
- Run the `@sdcorejs/utils` reuse preflight before writing helper/formatter/validator/mapper/pipe utility code; report which utilities were reused and why any custom helper remains necessary.
- After generating UI, show the **Core UI usage summary** table (every `@sdcorejs/angular` component/service/directive actually used + a one-line, feature-specific purpose, in the user's language) so the user sees the building blocks at a glance. List only what was used. Persist the same table into the module user guide at write-user-guide.
- Present the **MANDATORY FINISH GATE** ([`_refs/shared/finish-gate.md`](../../../_refs/shared/finish-gate.md)) after EVERY code-gen — standalone trigger or full SDLC flow. It surfaces tests / comments / user-guide / review so the user always knows these exist. NEVER silently end after generating code, and NEVER skip the gate because the request was a one-liner.
- Tests are mandatory and written RED-first at `standard` coverage by default (see the TDD Gate). They are surfaced (default ON) in the finish gate so the user can opt out or change level — but never silently skipped. NEVER ask a separate "which coverage level?" question outside the gate.
- Every generated portal includes the admin screens (`admin-screens`) so end users administer accounts/roles in-app — never the Keycloak console. Run `admin-screens` right after `init-portal`, before any domain module work.
- Detect the installed Core UI package FIRST — a project is a Core UI portal if `package.json` depends on EITHER `@sdcorejs/angular` (new default) OR `@sd-angular/core` (legacy alias — same code, same version, actively co-deployed). Treat both as equal: NEVER skip doc discovery just because the project uses the legacy name, and generate imports with whichever prefix the project installed.
- Discover Core UI on-demand before generating (docs are NOT committed — pulled fresh from the published site, version-matched, cached): run `node _refs/angular/core-docs-fetch.mjs --list` to see the component inventory, then `node _refs/angular/core-docs-fetch.mjs <id>` (e.g. `sd-button`, or `--print <id>` for inline content) to read a component's full API BEFORE using it. Before writing any template styling, ALWAYS fetch the Core UI style guide first — `node _refs/angular/core-docs-fetch.mjs --print assets/STYLE-GUIDE` — the single authoritative list of shipped utility classes. It is NOT committed (a stored copy would drift); the fetcher caches it if already pulled (version-matched), so "fetch if not present" is automatic — just run it. Never rely on hardcoded/memorized class names. The fetcher auto-detects the version from EITHER package name (add `--cwd <target-project>` when you run it from outside the project dir, so detection reads the consumer's `package.json` and not the agent's). Prefer a Core UI component when one fits; if none does, scaffold a skeleton + `alert('TODO: ...')` and flag it. It mojibake-guards upstream + falls back to cache offline. If no network AND no cache, fall back to generic Angular Material and flag it.
- Style utility-first — see [`_refs/angular/styling.md`](../../../_refs/angular/styling.md). Lean on the Core UI utility classes from the STYLE-GUIDE (`d-flex`, `flex-1`, `justify-content-between`, `gap-16`, `m-*`/`p-*`, `w-full`, `rounded-8`, `text-primary`, `T14M`, `row`/`col-*`, `grid-container`/`grid-cols-*`, `mat-elevation-z*`) for layout / spacing / sizing / color / typography. If the consumer app ships Tailwind (`tailwind.config.*` or a `tailwindcss` dependency), use Tailwind utilities too, matching whatever the existing components use. Core UI spacing/sizing utilities are **px-based, integer 0–200** (`mb-16` = 16px — NOT a Bootstrap multiplier); use multiples of 4. Write custom component `.scss` ONLY when no utility fits, keep it token-based (`var(--sd-*)`), and flag each rule with a one-line `// why:`.
- Enforce the execution order (portal → admin-screens → module → entity → screens → actions) and do not skip or reorder steps.
- Run the full tail chain after the last step.

### MUST NOT
- Hand-write CSS for flex / spacing / alignment / color / typography that a STYLE-GUIDE utility class already covers, or fill a component `.scss` with rules that duplicate shipped utilities — this is the "too many unnecessary CSS classes" anti-pattern. Put the utilities on the template; keep the `.scss` near-empty. Never use Bootstrap class names (`btn`, `card`, `form-control`, `modal` — they don't exist) or Tailwind syntax when the consumer has no Tailwind.
- Skip test generation, defer it to "later", or block spec writing behind a coverage-level question — specs are a required deliverable, written RED-first at `standard` by default.
- Generate portal code that requires end users to open the Keycloak console to manage accounts or roles.
- Skip the `admin-screens` pack even when the user's request focuses on a domain entity — the admin layer is always present.
- Create duplicate model/service/type/store/repository/API-client files for a related entity that already has a usable contract in the project.
- Inline a full related entity object inside another model when an imported related model or summary type exists.
- Recreate helper behavior already covered by `@sdcorejs/utils` (`DateUtilities`, `NumberUtilities`, `StringUtilities`, `ValidationUtilities`, `ArrayUtilities`, `FilterUtilities`, `Utilities`, `ObjectUtilities`, `ColorUtilities`, `BrowserUtilities`) or deep-import from `@sdcorejs/utils/dist/*`.

## Validation Checklist

Before returning generated code:

✅ Each production file (model / service / list / detail) has a corresponding `.spec.ts` written RED before the file was created
✅ All imports are correct (no circular dependencies)
✅ All fields from EntitySchema are included
✅ Existing related models/services were scanned and reused or minimally extended before any new contract was created
✅ `@sdcorejs/utils` was checked before writing helper/formatter/validator/mapper/pipe utility code
✅ No duplicate model/service/type exists for the same domain entity
✅ Relationship fields use imported existing types or `<entity>Id` instead of unnecessary inline object shapes
✅ Form validation matches field requirements
✅ `{{ entityKebab }}.mock-data.ts` exists with 20–40 domain-realistic seed rows
✅ Seed rows use realistic domain values derived from inferred field schema, not generic placeholders
✅ Service methods are wired to mock store by default
✅ Mock store reseeds if persisted dataset is empty or corrupted
✅ Component decorators (@SdTabComponent) are present
✅ State management (CREATE/UPDATE/DETAIL) works correctly
✅ DETAIL route handles stale entity IDs by recovering to list instead of rendering blank fields
✅ Routes are lazy-loaded
✅ Column visibility matches schema
✅ Error handling is comprehensive
✅ TypeScript strict mode compliance
✅ No hardcoded values (use constants from schema)
✅ Naming conventions consistent throughout
✅ Comments explain complex logic

## Example: Complete Employee Entity Generation

A worked end-to-end example (user request → EntitySchema → final file tree, following `init-entity.md`) lives in [`_refs/angular/templates/orchestrator-step-examples.md#worked-end-to-end--employee-entity`](_refs/angular/templates/orchestrator-step-examples.md#worked-end-to-end--employee-entity). Read it when you want to see how the dispatch table cashes out on a real request.
