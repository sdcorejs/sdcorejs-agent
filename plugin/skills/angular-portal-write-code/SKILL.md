---
name: angular-portal-write-code
description: Use when the user has confirmed the plan via 06-review-plan (which was authored by 05-plan) and is ready to generate Angular-portal code. Orchestrator skill - dispatches sub-skills 10-init-portal, 11-init-module, 12-init-entity, 20-screen-list, 21-screen-detail (handles CREATE / UPDATE / DETAIL states + form refinement), 31-actions (workflow / bulk / custom side-effects) based on the confirmed scope. After completion, mandatory hand-off chain - 40-e2e-test → sdcorejs-review-code → orchestration/repair-loop → orchestration/comment-code (ASK gate: skip / simple / medium / full — applied inline) → orchestration/verify-before-done → orchestration/auto-docs → orchestration/auto-task-tracker → orchestration/memories (when applicable). Triggers - "generate code", "viết code", "sinh code đi", "go ahead", "proceed with implementation". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 07 — Write Code (Orchestrator)

## Purpose

Transform an approved plan + EntitySchema into complete CRUD entity code:
- Model (DTO, SaveReq, validators)
- Service (mock-first CRUD via centralized seed data file)
- Routes (lazy-loaded)
- Components (List, Detail)

This skill is an orchestrator: it does NOT itself generate every file — it dispatches the right sub-skill for each numbered step in the approved plan.

## Dispatch table

| Scope item in the approved plan | Sub-skill to invoke |
|---|---|
| New portal (no existing project yet) | `10-init-portal` (run FIRST before any module work) |
| New module (`src/libs/<module>/`) | `11-init-module` |
| New entity with full CRUD (model + service + routes + list + detail) | `12-init-entity` |
| List page only (entity already exists) | `20-screen-list` |
| Detail component — any state (CREATE / UPDATE / DETAIL) or form refinement (validators, FormArray, async validators) | `21-screen-detail` |
| Action buttons — workflow transitions, bulk operations, custom side-effects (export, re-sync, etc.) | `31-actions` |

### Step 0 — Pre-flight: ensure project summary

Before dispatching ANY sub-skill, run `orchestration/auto-summary`. If `<target>/.sdcorejs/summary.md` is missing, it MUST be generated first (auto-summary delegates the scan to `sdcorejs-code-map` and distills the brief) — this is the gate that stops generation from hallucinating paths / duplicating shared abstractions. If the summary exists, auto-summary reads it (and refreshes on drift) so dispatch slots into the real architecture. Exception: when this run is itself a brand-new `10-init-portal`, there is no project to summarize yet — auto-summary runs in WRITE mode at the END of init instead (see the init sub-skills).

Execution order: portal → module → entity → screens → actions. If the plan touches multiple items, run them in this order; do not parallelize. After all sub-skills finish, hand off in sequence:

1. `40-e2e-test` (skills/testing/e2e/angular-portal.md) — happy-path tests for what was generated
2. `sdcorejs-review-code` (skills/review/code.md; auto-detects Angular → loads `_refs/angular-portal/review-code.md`) — convention check; outputs color-coded tables (🔴 Critical / 🟡 Medium / 🔵 Minor + 🟢 Strengths) with Fix + Tradeoff columns
3. `orchestration/repair-loop` — apply findings, iterate until Critical+Important resolved (or user defers)
4. `orchestration/comment-code` — ASK gate (skip / simple / medium / full); applies the chosen level inline. Cross-track baseline + per-track addenda live inside `orchestration/comment-code` itself (no separate `51-write-comments` skill — was consolidated)
5. `orchestration/verify-before-done` — BLOCK "done" until acceptance criteria from the spec are ✅ verified or ⚠️ explicitly deferred
6. `orchestration/auto-docs` — session summary written to `<target>/.sdcorejs/docs/angular-portal/`
7. `orchestration/auto-task-tracker` — tick `[x]` completed tasks, append new ones from the doc's "Next suggested action" / "Open questions"
8. `orchestration/memories` — only if durable knowledge surfaced (recurring convention, stakeholder constraint, anti-pattern)

Each tail-call is mandatory (per CLAUDE.md). Do NOT skip `verify-before-done` — that's how acceptance criteria silently slip. Do NOT skip the `orchestration/comment-code` ASK gate (the gate IS the value; auto-defaulting defeats the design).

## When to Use

When user requests a new entity in a module:
- "Generate product CRUD in sample module"
- "Create employee entity with CRUD pages"
- "Add order entity with fields: code, customerName, totalAmount, status"

## Input Resolution

Before generating, clarify with user:

1. **Module**: Which module does this entity belong to? (module)
   - If missing: Ask which existing module, or propose creating new module first

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

Before writing any production file in Steps 2, 3, 5, and 6, invoke `sdcorejs-tdd`:

1. Write the failing `.spec.ts` for that chunk first → run test → confirm RED
2. Generate the production file with minimal passing code → run test → confirm GREEN
3. Refactor if needed → run test → confirm still GREEN

Applies to: model (validators / type contracts), service (CRUD method contracts), list component (rendering + actions), detail component (form + state transitions).

Skip for: `mock-data` seed rows (pure data, no testable logic) and `routes.ts` (Angular config, no business behaviour).

---

### Step 1: Build EntitySchema

From user input or semantic inference, construct `EntitySchema` with all field metadata. The schema is the single input every later step consumes.

For two worked examples (user-supplied Product fields + inferred Promotion schema), see [`_refs/angular-portal/templates/orchestrator-step-examples.md#step-1--build-entityschema`](_refs/angular-portal/templates/orchestrator-step-examples.md#step-1--build-entityschema).

### Step 2: Generate Model (product.model.ts)

From EntitySchema, generate:
- `{{ entityPascal }}SaveReq` interface (all fields except id, timestamps)
- `{{ entityPascal }}DTO` type (SaveReq + BaseEntity)
- `{{ entityPascal }}_ROLES` constant (if any select options with static values)
- Validation config (if needed)
- Ensure `SaveReq` contains only writable business fields inferred for create/update
- Ensure `DTO` also carries read-only display/meta fields when the domain suggests status/audit/derived values

**Template Usage:**
- Take field definitions
- For each field:
  - Add JSDoc comment explaining UI control (sd-input, sd-date, sd-select, etc.)
  - Mark as optional (?) if not required
  - Include validation hints in comments (maxlength, min/max)
- Prefer concrete domain names over generic placeholders; for Vietnamese portals, labels/comments must preserve diacritics

**Output (product.model.ts):** see [`_refs/angular-portal/templates/orchestrator-step-examples.md#step-2--generate-model-productmodelts`](_refs/angular-portal/templates/orchestrator-step-examples.md#step-2--generate-model-productmodelts).

### Step 3: Generate Mock Data + Service (product.mock-data.ts + product.service.ts)

Pattern: create one centralized mock data file per entity, then wire service to localStorage-backed mock CRUD store.

**This step is mandatory after semantic schema inference.** Once `SaveReq` and `DTO` are determined (from user input or semantic inference), always generate the mock data file immediately so the list page renders with real-looking data on first load.

**Template Usage:**
- Create `{{ entityKebab }}.mock-data.ts` with **20–40 seed rows**
- Rows must use domain-realistic values derived from the inferred field schema, not generic placeholders like `"Name 1"`, `"Code 01"`
  - string/code fields: use realistic short codes or abbreviations matching the domain (e.g. `"SP001"`, `"KM-2024-01"`)
  - name/title fields: use plausible business names matching the entity type (e.g. `"Áo thun basic"`, `"Khuyến mãi hè 2025"`)
  - select/enum fields: distribute values across the enum options (not all the same value)
  - date fields: spread across a realistic recent range (last 6–12 months)
  - number/decimal fields: use plausible numeric ranges (price, stock, discount amount, etc.)
  - boolean/status: mix true/false or active/inactive realistically
- Import `MockCrudStore` + seed data in service
- Expose all CRUD methods (`paging/search/all/detail/create/update/remove`) from store
- Only switch to `BaseService` API integration after backend contract is explicit
- Ensure `MockCrudStore` can reseed when existing localStorage value is missing, empty (`[]`), or corrupted JSON

**Output (product.service.ts + promotion.mock-data.ts):** see [`_refs/angular-portal/templates/orchestrator-step-examples.md#step-3--generate-mock-data--service`](_refs/angular-portal/templates/orchestrator-step-examples.md#step-3--generate-mock-data--service).

**Mock data generation rules:**
- Produce 20–40 rows total
- Distribute select/enum fields across all available values (do not use one value for all rows)
- Use a plausible date range spread across the past 12 months
- Use realistic numeric ranges that match the domain (percentage 1–50%, fixed amount 10k–500k, stock 0–1000, etc.)
- Use Vietnamese business names when the portal language is Vietnamese
- Assign `id: uuidv4()` to every row so MockCrudStore can address each record
- Spread `isActivated` roughly 70% true / 30% false unless domain logic says otherwise

### Step 4: Generate Routes (routes.ts)

Pattern: Lazy-load components. No providers on the route — the entity service is `@Injectable({ providedIn: 'root' })`, the lib-scoped tokens are wired by `<Lib>Module.useValue({...})` at root.

**Template Usage:**
- Declare routes: '' (list), 'create', 'detail/:id', 'update/:id'
- Import ListComponent, DetailComponent
- Lazy-load components (COMPONENT_TYPE)
- NO `providers: [...]` array (see `11-init-module.md` rationale)

**Output (routes.ts):** see [`_refs/angular-portal/templates/orchestrator-step-examples.md#step-4--generate-routes-productroutests`](_refs/angular-portal/templates/orchestrator-step-examples.md#step-4--generate-routes-productroutests).

### Step 5: Generate List Component

**Template Usage:**
- Use list-component-template.md
- Substitute placeholders: {{ module }}, {{ entity }}, {{ entityPascal }}, {{ entityLabel }}, etc.
- Generate columns array from visibleInList fields
- Ensure the chosen columns form a useful business summary instead of a generic placeholder table
- Keep Vietnamese column labels and action text fully accented when the portal language is Vietnamese
- Generate action buttons (edit, detail, delete)
- Generate toggle isActivated if field exists

**Output (pages/list/list.component.ts):**
- Full CRUD list with SdTable
- Pagination via service.paging()
- Delete action with confirmation
- Create button
- Edit/Detail buttons
- Toggle isActivated switch

### Step 6: Generate Detail Component

**Template Usage:**
- Use detail-component-template.md
- Substitute placeholders: {{ module }}, {{ entity }}, {{ entityPascal }}, {{ entityLabel }}, etc.
- Generate form controls from visibleInDetail fields
- Generate form validation rules
- Handle CREATE/UPDATE/DETAIL state transitions
- Render appropriate form fields (SdInput, SdSelect, SdDate, etc.) based on field type
- Group inferred fields into sensible business sections when the domain requires more than one section
- Choose side-drawer only when the inferred form is compact enough to remain readable without heavy scrolling
- Add fallback for stale IDs in DETAIL/UPDATE routes:
  - Catch `detail(id)` errors (`Entity not found`)
  - Notify user with warning
  - Navigate back to list route (`../../`) with replace-tab state

**Output (pages/detail/detail.component.ts):**
- Full CRUD form
- State management (CREATE/UPDATE/DETAIL)
- Form validation
- Data loading for detail/update
- Save/Back/Edit actions

## Code Generation Rules

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
- Custom validators for complex rules

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

## File Structure Output

```
product/ 
├── services/
│   ├── product.model.ts
│   │   - ProductSaveReq interface
│   │   - ProductDTO type
│   │   - PRODUCT_ROLES constant (if applicable)
│   │
│   ├── product.mock-data.ts
│   │   - PRODUCT_SEED_DATA with 20–40 domain-realistic rows
│   │   - centralized seed source for mock CRUD
│   │
│   ├── product.service.ts
│   │   - class ProductService (mock-first)
│   │   - #store = MockCrudStore with DTO, SaveReq
│   │   - paging, search, all, detail, create, update, remove methods
│   │
│   └── index.ts
│       - export * from './product.model'
│       - export * from './product.service'
│
├── pages/
│   ├── list/
│   │   └── list.component.ts
│   │       - @SdTabComponent decorator
│   │       - SdTable with columns from schema
│   │       - paging, delete, create actions
│   │       - toggle isActivated (if field exists)
│   │
│   └── detail/
│       └── detail.component.ts
│           - @SdTabComponent with conditional name/color
│           - FormGroup with controls from schema
│           - CREATE/UPDATE/DETAIL state management
│           - Data loading for detail/update
│           - Save/back/edit navigation
│
└── routes.ts
    - Routes with path, providers, children
    - Lazy-load ListComponent and DetailComponent
```

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

A worked end-to-end example (user request → orchestrator steps 1-6 → final file tree) lives in [`_refs/angular-portal/templates/orchestrator-step-examples.md#worked-end-to-end--employee-entity`](_refs/angular-portal/templates/orchestrator-step-examples.md#worked-end-to-end--employee-entity). Read it when you want to see how the dispatch table cashes out on a real request.

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
