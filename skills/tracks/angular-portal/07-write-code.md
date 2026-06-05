---
name: angular-portal-write-code
description: Generate Angular-portal code — after 06-review-plan approves, OR as the single entry point for any direct Angular-portal code-gen request. Loads the matching on-demand pack under `_refs/angular-portal/write-code/` (per-pack trigger catalog is in the body): init-portal, init-module, init-entity (full CRUD), screen-list, screen-detail (CREATE/UPDATE/DETAIL + reactive-form/validators), actions (workflow / bulk / custom buttons). Triggers - "khởi tạo portal", "tạo module X", "thêm entity / tạo CRUD", "màn list / thêm cột", "tạo màn detail / form validation / custom validator", "thêm action button / approve / bulk approve / xuất excel", and generic "generate code", "viết code", "sinh code đi", "go ahead". NOT for spec/plan, code review, or nestjs/nextjs code (separate skills). After completion runs the mandatory tail chain (e2e → review-code → repair-loop → comment-code → verify-before-done → branch-ready → auto-docs → auto-task-tracker → memories). Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 07 — Write Code (Orchestrator)

## Purpose

Single entry point for generating Angular-portal code. Transforms an approved plan + the user's confirmed scope into complete CRUD entity code:
- Model (DTO, SaveReq, validators)
- Service (mock-first CRUD via centralized seed data file)
- Routes (lazy-loaded)
- Components (List, Detail)
- Workflow / bulk / custom action buttons

This skill is an **orchestrator**: it does NOT inline the full generation rules for every file type. It picks the right **reference pack** for each scope item and reads it on demand. The detailed rules + code-template links for each concern live in `_refs/angular-portal/write-code/*.md` (formerly the 10/11/12/20/21/31 sub-skills — consolidated here so the track exposes one skill instead of seven).

## Dispatch table

For each scope item in the confirmed plan (or the direct request), READ the matching reference pack and follow it:

| Scope item | Reference pack to read |
|---|---|
| New portal (no existing project yet) | [`_refs/angular-portal/write-code/init-portal.md`](_refs/angular-portal/write-code/init-portal.md) (run FIRST before any module work) |
| New module (`src/libs/<module>/`) | [`_refs/angular-portal/write-code/init-module.md`](_refs/angular-portal/write-code/init-module.md) |
| New entity with full CRUD (model + service + routes + list + detail) | [`_refs/angular-portal/write-code/init-entity.md`](_refs/angular-portal/write-code/init-entity.md) |
| List page only (entity already exists) | [`_refs/angular-portal/write-code/screen-list.md`](_refs/angular-portal/write-code/screen-list.md) |
| Detail component — any state (CREATE / UPDATE / DETAIL) or form refinement (validators, FormArray, async validators) | [`_refs/angular-portal/write-code/screen-detail.md`](_refs/angular-portal/write-code/screen-detail.md) |
| Action buttons — workflow transitions, bulk operations, custom side-effects (export, re-sync, etc.) | [`_refs/angular-portal/write-code/actions.md`](_refs/angular-portal/write-code/actions.md) |

Read ON DEMAND only — load the one reference for the step you are executing, not all of them. Each reference further links to the literal code templates under `_refs/angular-portal/templates/`.

### Step 0 — Pre-flight: ensure project summary

Before dispatching ANY reference, run `orchestration/auto-summary`. If `<target>/.sdcorejs/summary.md` is missing, it MUST be generated first (auto-summary delegates the scan to `sdcorejs-code-map` and distills the brief) — this is the gate that stops generation from hallucinating paths / duplicating shared abstractions. If the summary exists, auto-summary reads it (and refreshes on drift) so dispatch slots into the real architecture. Exception: when this run is itself a brand-new init-portal, there is no project to summarize yet — auto-summary runs in WRITE mode at the END of init instead (see `init-portal.md` Post-init).

### Execution order + hand-off

Execution order: portal → module → entity → screens → actions. If the plan touches multiple items, run them in this order; do not parallelize. After all referenced steps finish, hand off in sequence:

1. `sdcorejs-testing-e2e-angular-portal` (skills/testing/e2e/angular-portal.md) — happy-path tests for what was generated
2. `sdcorejs-review-code` (skills/review/code.md; auto-detects Angular → loads `_refs/angular-portal/review-code.md`) — convention check; outputs color-coded tables (🔴 Critical / 🟡 Important / 🔵 Minor + 🟢 Strengths) with Fix + Tradeoff columns
3. `orchestration/repair-loop` — apply findings, iterate until Critical+Important resolved (or user defers)
4. `orchestration/comment-code` — ASK gate (skip / simple / medium / full); applies the chosen level inline. Cross-track baseline + per-track addenda live inside `orchestration/comment-code` itself
5. `orchestration/verify-before-done` — BLOCK "done" until acceptance criteria from the spec are ✅ verified or ⚠️ explicitly deferred
6. `orchestration/branch-ready` — branch-hygiene sweep (debug logs, secrets, focused tests, lint+build+test) + merge/PR options
7. `orchestration/auto-docs` — session summary written to `<target>/.sdcorejs/docs/angular-portal/`
8. `orchestration/auto-task-tracker` — tick `[x]` completed tasks, append new ones from the doc's "Next suggested action" / "Open questions"
9. `orchestration/memories` — only if durable knowledge surfaced (recurring convention, stakeholder constraint, anti-pattern)

Each tail-call is mandatory (per CLAUDE.md). Do NOT skip `verify-before-done` — that's how acceptance criteria silently slip. Do NOT skip the `orchestration/comment-code` ASK gate (the gate IS the value; auto-defaulting defeats the design).

## When to Use

When user requests a new entity in a module, or any of the dispatch-table scope items:
- "Generate product CRUD in sample module" → init-entity
- "Khởi tạo portal-shop với dev/qc/uat/prod" → init-portal
- "Tạo module catalog" → init-module
- "Tạo màn list cho user" → screen-list
- "Thêm validator cho form product" → screen-detail
- "Thêm nút phê duyệt cho đơn hàng" → actions

## Input Resolution

Before generating an entity, clarify with user:

1. **Module**: Which module does this entity belong to? (module)
   - If missing: Ask which existing module, or propose creating new module first (init-module)

2. **Entity Name**: What's the entity name? (entity, entityPascal)
   - Examples: product, employee, purchase-order, sales-invoice

3. **Display Label**: What label should appear in UI? (entityLabel, entityLabelPlural)
   - Examples: "Sản phẩm", "Nhân viên", "Đơn mua hàng"

4. **Fields**: What fields should this entity have?
  - Ask user to describe fields OR infer a semantic schema when fields are omitted
  - For each field: name, type (string/number/date/select/etc), required?, label
  - When inferring, derive concrete domain fields from the entity meaning and current portal conventions
  - For Vietnamese portals, all generated labels must use proper diacritics

5. **UI Preferences**:
  - Detail layout: auto-select side-drawer or full-page from inferred complexity, unless user overrides
  - Has search? filter? delete? excel? (defaults: yes/yes/yes/no)
  - Permissions: use default naming pattern or custom? (default: {{ MODULE }}_{{ ENTITY }}_CREATE, etc.)

### Semantic Inference Fallback

If the user gives only the entity name or only a very vague description, do not stop at a generic skeleton. Build a first-pass `EntitySchema` from the entity semantics.

Use this inference order:
1. Entity noun meaning in Vietnamese/English
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

### TDD Gate — mandatory before each code-generating step

Before writing any production file (model / service / list / detail), invoke `sdcorejs-tdd`:

1. Write the failing `.spec.ts` for that chunk first → run test → confirm RED
2. Generate the production file with minimal passing code → run test → confirm GREEN
3. Refactor if needed → run test → confirm still GREEN

Applies to: model (validators / type contracts), service (CRUD method contracts), list component (rendering + actions), detail component (form + state transitions).

Skip for: `mock-data` seed rows (pure data, no testable logic) and `routes.ts` (Angular config, no business behaviour).

### Step 1: Build EntitySchema (shared input for every reference)

From user input or semantic inference, construct `EntitySchema` with all field metadata. The schema is the single input every reference pack consumes — init-entity, screen-list, and screen-detail all read these names + field flags (`visibleInList`, `visibleInDetail`, `type`, `required`, permission codes).

For two worked examples (user-supplied Product fields + inferred Promotion schema), see [`_refs/angular-portal/templates/orchestrator-step-examples.md#step-1--build-entityschema`](_refs/angular-portal/templates/orchestrator-step-examples.md#step-1--build-entityschema).

### Step 2: Generate per the dispatched reference

Once the EntitySchema exists, generate each file by following the reference pack the dispatch table routed you to. The per-file rules, decision heuristics, and code-template links all live in the reference — do NOT re-derive them here. Map:

| File(s) | Reference + worked-code template |
|---|---|
| `<entity>.model.ts` (SaveReq / DTO / constants) | `init-entity.md` → [`orchestrator-step-examples.md#step-2--generate-model`](_refs/angular-portal/templates/orchestrator-step-examples.md#step-2--generate-model-productmodelts) |
| `<entity>.mock-data.ts` + `<entity>.service.ts` (mock-first CRUD, 20–40 domain-realistic rows) | `init-entity.md` → [`orchestrator-step-examples.md#step-3--generate-mock-data--service`](_refs/angular-portal/templates/orchestrator-step-examples.md#step-3--generate-mock-data--service) |
| `<entity>.routes.ts` (lazy-loaded, `data.permission`, no providers) | `init-entity.md` → [`orchestrator-step-examples.md#step-4--generate-routes`](_refs/angular-portal/templates/orchestrator-step-examples.md#step-4--generate-routes-productroutests) |
| `pages/list/list.component.ts` | `screen-list.md` (+ `_refs/angular-portal/templates/screen-list-component.md`) |
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

## Validation Checklist

Before returning generated code:

✅ Each production file (model / service / list / detail) has a corresponding `.spec.ts` written RED before the file was created
✅ All imports are correct (no circular dependencies)
✅ All fields from EntitySchema are included
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

A worked end-to-end example (user request → EntitySchema → final file tree, following `init-entity.md`) lives in [`_refs/angular-portal/templates/orchestrator-step-examples.md#worked-end-to-end--employee-entity`](_refs/angular-portal/templates/orchestrator-step-examples.md#worked-end-to-end--employee-entity). Read it when you want to see how the dispatch table cashes out on a real request.
