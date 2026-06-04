> **Reference for the `angular-portal-write-code` orchestrator.** Loaded on demand when the
> confirmed plan adds a new entity with full CRUD pages (model + service + routes + list +
> detail). Not a standalone skill — the orchestrator reads this file when its dispatch table
> routes a step here. For list-only refinement see `./screen-list.md`; for detail/form work see
> `./screen-detail.md`; for action buttons see `./actions.md`.

# Init Entity — Entity CRUD Module

## 1. Reference Name
**Entity CRUD Module Generation**

## 2. Description
Generates a complete entity management module following sdcorejs architecture patterns. Creates service layer, models/interfaces, and page components (list and detail) with full CRUD operations, reactive forms, and data tables.

This reference can synthesize UI structure from PRD text, screenshot/attribute images, and sample cURL payloads, then map those into CREATE/UPDATE/DETAIL rendering strategies.

This reference assumes the target feature module is already known. If the request does not specify a module, the agent must resolve that first using the request intake flow.

For common entity forms with around 5-6 fields, prefer a side-drawer detail UI before using a full page detail.

## 3. Rules

### MUST DO ✅
- Confirm target module before generating entity files
- Generate the feature module first if it does not exist (see `./init-module.md`)
- Generate entity service with runnable mock CRUD by default (`localStorage`) when backend API contract is not provided yet
- Generate `services/[entity].mock-data.ts` as the single centralized seed source for each entity (target: **20–40 rows**)
- Generate mock data immediately after `SaveReq` and `DTO` are finalized (whether from user input or semantic inference); do not wait until after list/detail components are built
- Seed rows must use domain-realistic values derived from the inferred field schema; never use generic placeholders like `"Name 1"`, `"Code 01"`, or repeated identical values across all rows
- Ensure mock store reseeds automatically when stored JSON is missing, empty array, or corrupted JSON
- If backend API contract is provided explicitly, service may switch to `BaseService`-based API integration
- Parse and normalize input artifacts when available:
  - PRD text sections
  - screenshot or attribute image hints
  - sample cURL request/response
- Derive a field matrix from artifacts before coding:
  - list columns
  - create/update editable fields
  - detail read-only fields
  - validators and enum candidates
  - request/response field mapping
- Apply cURL mapping by state:
  - request payload fields -> CREATE/UPDATE editable controls
  - response meta/status/audit fields -> DETAIL read-only blocks
  - list endpoint lightweight fields -> LIST columns
- API URL convention is PROJECT-SPECIFIC, NOT fixed by this reference. Scaffold defaults:
  - `BaseService.register('<entity>')` — no version prefix
  - `<entity>-select` template: `url="<entity>"` — same, no prefix
  - When generating against a real project, FIRST inspect existing services in that project (e.g. `BaseService.register('v1/booking')` in `portal-agency`, or `register('api/v2/customer')` elsewhere). Match the project's convention exactly. Do NOT impose `v1/` or any prefix the project doesn't already use.
- Create separate files: `model.ts`, `service.ts` for each entity
- Define `<Entity>SaveReq` (POST/PUT payload) + `<Entity>DTO = Required<<Entity>SaveReq> & BaseEntity` (used for BOTH list and detail responses — scaffold default). Do NOT generate a separate `<Entity>Detail` in scaffold.
- `<Entity>SaveReq` can be split into more specific request types when business needs differ:
  - `<Entity>CreateReq` — POST /create payload (e.g. excludes `id`)
  - `<Entity>UpdateReq` — PUT /:id payload (e.g. allows partial fields, excludes immutable fields)
  - `<Entity>ImportReq` — POST /import payload (e.g. batch import with row-level metadata)
  - Default scaffold uses single `<Entity>SaveReq` for both create + update; split only when shapes diverge.
- Workflow action payloads use convention `<Entity><Action>Req`:
  - `ProductApproveReq`, `OrderCancelReq`, `BookingRejectReq`
  - Action name in PascalCase matches the route action (e.g. POST `/:id/approve` → `ProductApproveReq`)
- Permission code convention is **flexible per project, consistent within a project**. Order is always Module → Entity → Action (large → small). Acceptable shapes — pick ONE per project and stay consistent:
  - `<MODULE>_<ENTITY>_<ACTION>`   — scaffold default (e.g. `CRM_PRODUCT_LIST`)
  - `<MODULE>_C_<ENTITY>_<ACTION>` — common variant (e.g. `CRM_C_PRODUCT_LIST`)
  - `<MODULE>_<ENTITY>:<ACTION>`   — colon-separator variant (e.g. `CRM_PRODUCT:LIST`)
  - When applying to an existing project, detect the established convention and follow it. Never mix two conventions in the same project.
- For root-scoped services, ensure module configuration token is provided at app root (`main.ts`)
- Use `FormGroup` for all forms with validation
- Implement 3-state pattern (CREATE/UPDATE/DETAIL) for detail component
- Use `@SdTabComponent` decorator on list components
- Lazy-load child routes with `loadComponent()`
- Use two-way binding: `[(model)]="entity.field"` with `[form]="form"`
- Define table columns with explicit type and width
- Use `SdTable` with server-side pagination (`type: 'server'`)
- Prioritize Core UI components first for all generated screens/forms/tables/actions
- If a required UI piece has no Core UI equivalent, explicitly mark it as custom and warn developer in generation summary
- Do not modify global CSS/SCSS during entity generation (`src/styles.scss` and shared global theme files are out of scope)
- Add `data: { permission: '<CODE>' }` to every route entry using the standard permission code format; the module guard reads this to block unauthorized navigation automatically
- When module uses keyed permission configuration, add `data.permissionKey` on each route and keep it consistent inside the same module flow
- When module uses keyed upload-file configuration, set `[key]` on `sd-upload-file` to match module upload configuration key
- When routes have `data.permission` guard, do NOT add extra `canViewList` / `canCreate` manual checks inside list/detail components
- For filters rendered outside table columns, define them in `tableOption.filter.externalFilters` instead of custom controls above table
- Mark blocking external filters as `required: true` and rely on table filter validation instead of rendering guidance text like "Vui lòng chọn ..."
- Do not bind template conditions to function calls/getters that execute logic each change detection cycle; compute once (or update explicitly) and bind to plain property/signal
- Keep naming concise and domain-focused (`projects` over `projectOptions`)
- Use `externalFilters[].option.items` as a function when list data is only needed by filter UI; avoid storing extra component state if not reused
- Keep variable scope minimal:
  - component-only internals -> `#privateField`
  - single-function usage -> local `const` inside that function
  - avoid unnecessary intermediate component fields
- Auto-calculate external filter layout with this deterministic rule:
  - `filterCount = externalFilters.length`
  - `externalFilterPerRow = 4` when `filterCount <= 4`, otherwise `6`
  - `rowCount = ceil(filterCount / externalFilterPerRow)`
  - `hideExternalFilterToolbar = true` when `rowCount <= 1`, otherwise `false`
- Only add score cards when user explicitly requests score/summary metrics for that screen
- If score cards are present, use the dedicated score-card component once Core UI provides it; do not handcraft ad-hoc score-card UI
- When score cards exist above table, keep cards fixed in page flow and constrain table area so only table region scrolls (`tableOption.style.maxHeight` + container `overflow: hidden`)
- Include 4 audit columns at the end of every **primary list page** that displays a top-level entity table:
  - Created timestamp (e.g. `createdAt`, `createdDate`, `createTime`) → `type: 'datetime'`, `width: '180px'`
  - Created by (e.g. `createdBy`, `creatorId`, `creator`) → `type: 'string'`, `minWidth: '180px'`
  - Updated timestamp (e.g. `updatedAt`, `modifiedAt`, `lastModifiedDate`) → `type: 'datetime'`, `width: '180px'`
  - Updated by (e.g. `updatedBy`, `modifiedBy`, `lastModifiedBy`) → `type: 'string'`, `minWidth: '180px'`
- Always check the actual DTO/BaseEntity field names — do NOT assume `createdAt`; field names vary per backend framework (Spring, .NET, Django, Laravel all differ)
- Skip audit columns when:
  - The table is embedded inside a detail/form page (sub-table, child entity list)
  - The entity is a simple lookup/enum table (code + name only, no meaningful timeline)
  - The table appears in a dialog or compact drawer with space constraints
  - The user explicitly asks to exclude them
- Upload files BEFORE saving entity (separate step)
- Choose detail style by complexity:
  - 5-6 common fields -> side-drawer
  - complex multi-section workflows -> full page
- For full-page detail with many fields/sections, combine section grouping with `sd-anchor` for fast scroll navigation
  - Use `sd-anchor ellipsis` as wrapper
  - Use one `sd-anchor-item` per business section (for example: "Thông tin chung", "Rổ hàng", "Hồ sơ")
  - Keep each anchor item body inside `sd-section` so navigation and section collapse can work together
- Support 3 page-layout variants for CREATE/UPDATE/DETAIL, and choose based on context:
  - `UnifiedCompact`: CREATE/UPDATE/DETAIL share one unified layout, no split title/form columns
  - `UnifiedSplit`: CREATE/UPDATE/DETAIL share one unified split layout (left title block, right form/content block)
  - `AdaptiveSplitDetail`: CREATE/UPDATE use editable split layout, DETAIL uses a different read-only split layout (like dashboard cards/sections)
- For `AdaptiveSplitDetail`, DETAIL screen should prefer `sd-section` + `sd-section-item` for read-only display blocks instead of editable form controls
- Regardless of DETAIL rendering style (`sd-section-item` or viewed controls), code/name must always render in DETAIL state
- In DETAIL load flow, when entity ID is stale/not found, show a warning and navigate back to list instead of leaving empty placeholders
- When the request does not clearly define expected detail layout, ask one clarification question before final generation:
  - "Bạn muốn giữ layout mặc định hay đổi sang UnifiedCompact / UnifiedSplit / AdaptiveSplitDetail?"
- Reserve extension points for workflow actions in both list and detail (wired by `./actions.md`)
- Entity pages must use 2-component structure for full-page pattern:
  - `pages/list/list.component.ts`
  - `pages/detail/detail.component.ts`
  - URL routes map to `detail.component.ts` states:
    - `/create` -> CREATE
    - `/update/:id` -> UPDATE
    - `/detail/:id` -> DETAIL (read-only)
  - Side-drawer pattern is the compact exception: `pages/list` + `components/detail-side-drawer`
- If required UI is not available in Core UI, generate a custom UI skeleton instead of skipping:
  - add `// CUSTOM_UI: <reason>` comment in component
  - render placeholder block for that UI area
  - wire actions to `alert('TODO: <EventName> - implement here')`
  - include warning in generation summary: `Custom UI required: <ComponentName> - no Core UI equivalent`
- Run tests immediately after module/entity generation:
  - preferred: `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts`
  - fallback: `npm run test -- --watch=false`
  - report pass/fail and failing specs
  - fix failing tests before marking generation complete
- Use `inject()` function (not constructor injection) for all service and dependency injection inside components, services, and directives:
  ```typescript
  readonly #router = inject(Router);
  readonly #myService = inject(MyService);
  ```
- Set `changeDetection: ChangeDetectionStrategy.OnPush` on every list and detail component; import `ChangeDetectionStrategy` from `@angular/core`
  - If component state is updated asynchronously after initialization (i.e., there is an `await` before a state assignment), inject `ChangeDetectorRef` and call `this.#cdr.markForCheck()` after the assignment; or migrate that state to a `signal()`
- Use **signal-first state style** for generated components:
  - Use `signal()` for mutable UI state (`loading`, `state`, `entity`, `tableOption`, selected ids, dialog flags)
  - Use `computed()` for derived state (`isDetail`, button visibility, header title)
  - Use `effect()` only for side effects (reload, sync route params), not as a replacement for `computed()`
  - Keep `FormGroup` as-is, but surrounding UI/view state should be signals
  - Example:
    ```typescript
    readonly state = signal<'CREATE' | 'UPDATE' | 'DETAIL'>('CREATE');
    readonly entity = signal<Partial<ProductSaveReq>>({});
    readonly isDetail = computed(() => this.state() === 'DETAIL');
    ```
- Follow this import order in every component/service file:
  1. Angular framework (`@angular/core`, `@angular/router`, `@angular/common`, `@angular/forms`)
  2. RxJS (if used)
  3. Third-party / library (Core UI imports — see `_refs/angular-portal/core-version.md` for current package name; templates use `<CORE_UI_PACKAGE_NAME>/...` placeholder)
  4. Internal shared / cross-module imports
  5. Relative imports within the same module (models, services, sibling files)
  - Separate each group with a blank line
- Monitor signal invocation efficiency in templates:
  - If a signal is used **2 or more times** in the template, consider:
    - Extract to a `readonly #memoized = computed(() => ...)` in the component to cache the value
    - OR use `@let` syntax (where supported): `@let _varName = signal();` then use `_varName` throughout
  - If a signal is used **only once**: invoke it directly at the point of use, no caching needed
  - Goal: reduce unnecessary signal getter invocations during change detection cycles
- Ensure interactive elements exposed to users have accessible text: use `title` or `aria-label` on buttons/actions so screen readers can describe them; use semantic HTML where possible (`<nav>`, `<main>`, `role="toolbar"`)
- Generate a companion `*.spec.ts` skeleton alongside every new list and detail component; use Arrange-Act-Assert pattern; the skeleton must at minimum assert the component creates successfully:
- Generate companion `*.spec.ts` files alongside service/routes/list/detail with runnable tests; use Arrange-Act-Assert pattern; specs must include at minimum component/service/route creation and one behavior assertion each:
  ```typescript
  describe('ListComponent', () => {
    it('should create', () => { expect(component).toBeTruthy(); });
  });
  ```
- **BEFORE generating spec files, ask developer** which test coverage level they desire:
  - `minimal`: only `should create` test (fastest)
  - `standard`: + permission validation + data visibility + sort/navigation tests (recommended)
  - `full`: + all unit tests from Section 5 (comprehensive coverage)
  - Then use the appropriate template from Section 5 to generate spec files
- Make generated spec files runnable out-of-the-box (not placeholder-only):
  - Provide minimal dependency mocks for `inject()` dependencies (`Router`, `ActivatedRoute`, services)
  - Isolate template with `TestBed.overrideComponent(..., { set: { template: '<div>...</div>' } })` when Core UI dependencies are heavy
  - Ensure `fixture.detectChanges()` runs without DI/template errors
- Generate functional test cases (not only `should create`) for standard/full coverage level:
  - **Route permission coverage**: verify every route has `data.permission` and follows the project's chosen convention (Module → Entity → Action order, single consistent shape)
  - **Data visibility coverage** (list): verify missing required external filter returns empty data, and valid filter triggers service call
  - **Data ordering coverage** (list): verify domain sort behavior (if defined) is applied correctly
  - **Action flow coverage** (detail): verify invalid form blocks save, create path calls `create`, update path calls `update`, and navigation is correct
  - **Signal state coverage**: verify state transitions (`CREATE/UPDATE/DETAIL`) and computed flags (`isDetail`, title) work as expected
- After generating a new module or entity, run tests immediately and report result:
  - Preferred command: `npm run test -- --watch=false --include=src/libs/[module]/features/[entity]/**/*.spec.ts`
  - If include filter is not supported, run full `npm run test -- --watch=false` and summarize spec results
  - If environment lacks headless browser, report blocker explicitly and provide exact command for developer to run locally
- Reserve extension points for workflow actions in both list and detail
- Always run a final double-check pass: route data, permission keys, upload keys, service wiring, and basic build/test status
- Support hybrid NgModule + standalone integration when target codebase still uses NgModule boundaries

### TESTING CHECKLIST FOR DEVELOPERS ⚠️
**When applying this reference to generate a new entity module, developers MUST verify these points before committing:**

1. **Signal Invocation Syntax**
   - [ ] Check all signals are invoked with `()` in templates: `state()`, `entity()`, `form()`, `saving()`
   - [ ] Verify no double invocations like `state()()` exist
   - [ ] Confirm `@let` declarations are used for signals referenced 2+ times
   - [ ] Verify single-use signals invoke directly without `@let` wrapper

2. **Dependency Injection**
   - [ ] All services use `inject()` function: `readonly #service = inject(MyService)`
   - [ ] No constructor injection used; verify 0 occurrences of `constructor(private service: MyService)`
   - [ ] All private dependencies use `#` prefix: `readonly #router = inject(Router)`

3. **Change Detection & Performance**
   - [ ] Verify `changeDetection: ChangeDetectionStrategy.OnPush` on list and detail components
   - [ ] Check that `ChangeDetectionStrategy` is imported from `@angular/core`
   - [ ] If async state updates exist before signal assignment, verify `ChangeDetectorRef.markForCheck()` is called OR state is a `signal()`

4. **Component Field Scope**
   - [ ] Verify all non-exported fields use `#private` prefix
   - [ ] Check no unnecessary component fields exist (push local vars or `#privateFields` instead)
   - [ ] Confirm FormGroup, signals for state are properly scoped

5. **Import Organization**
   - [ ] Verify 5-group import order is followed (Angular → RxJS → @sd-angular → shared → relative)
   - [ ] Check each group is separated by a blank line
   - [ ] Ensure no legacy imports like `from 'sd-angular'` exist; use `<CORE_UI_PACKAGE_NAME>/...` paths (substituted from `_refs/angular-portal/core-version.md`)

6. **Accessibility**
   - [ ] Check action toolbars have `role="toolbar"` attribute
   - [ ] Verify all buttons have `title` or `aria-label` for screen reader support
   - [ ] Confirm use of semantic HTML where possible

7. **Audit Columns (List Page)**
   - [ ] Verify primary list tables include all 4 audit columns at the end: `createdAt`, `createdBy`, `updatedAt`, `updatedBy`
   - [ ] Check field names match actual DTO (vary by backend: `createdAt` vs `CreatedDate` vs `created_at`)
   - [ ] Confirm skip conditions are documented if audit columns are intentionally omitted

8. **Route Permission Guards**
   - [ ] Check every route has `data: { permission: '...' }` defined
   - [ ] Verify permission codes follow the project's chosen convention: Module → Entity → Action order, UPPERCASE, single consistent shape across the whole project (no mixing of `_C_` and plain underscore variants)
   - [ ] Confirm NO duplicate permission checks inside components if route guard is defined
   - [ ] Verify module guard reads `data.permission` automatically (no manual implementation needed)

9. **Spec File Generation**
   - [ ] Verify developer was asked about test coverage level (minimal/standard/full) BEFORE spec files were created
   - [ ] Check generated spec files are NOT placeholders; each test is fully defined and runnable
   - [ ] Confirm mocks are provided for all `inject()` dependencies (Router, ActivatedRoute, services, SdNotifyService, SdLoadingService)
   - [ ] Verify TestBed.overrideComponent isolates templates to avoid heavy UI library dependency errors
   - [ ] Check [entity].routes.spec.ts exists and validates permission codes on all routes
   - [ ] Ensure list.component.spec.ts includes external filter and sort tests (if standard/full coverage chosen)
   - [ ] Ensure detail.component.spec.ts includes state transition and save-flow tests (if standard/full coverage chosen)
   - [ ] Run post-generation test command to verify all specs pass immediately

10. **Build Verification**
   - [ ] Run `npm run build` or equivalent; confirm **no TypeScript errors** (warnings are acceptable for unused code)
   - [ ] If `ChangeDetectionStrategy.OnPush` + async state updates, verify no change detection race conditions in browser console
   - [ ] Test component creation in browser DevTools to confirm signal state initializes correctly

10. **Testing Skeletons**
    - [ ] Verify `*.spec.ts` file exists alongside component
    - [ ] Check AAA pattern is used (Arrange-Act-Assert)
  - [ ] Confirm at minimum `should create` test passes: `expect(component).toBeTruthy()`
  - [ ] Verify spec contains required mocks for `inject()` dependencies so test runs without NullInjector errors
  - [ ] Verify route permission tests exist (`data.permission` presence + naming format)
  - [ ] Verify list data tests exist (required filter behavior + sorted output/asserted data order)
  - [ ] Verify detail save-flow tests exist (invalid/create/update paths)
  - [ ] Run target test command after generation and attach result (pass/fail + error summary if fail)

### MUST NOT ❌
- Guess the module silently when module ownership is ambiguous
- Do not force a full standalone migration when developer requests hybrid NgModule + standalone compatibility mode
- Use ad-hoc permission code naming that breaks Module → Entity → Action order, or mix two conventions within the same project
- Hard-code API URLs (use configuration tokens)
- Add logic to components (delegate to services)
- Skip form validation before save
- Create circular dependencies between modules
- Import non-scoped components directly (use barrel exports)
- Force page detail for short common forms that can fit in side-drawer
- Hard-wire workflow actions into all entities when not requested
- Build ad-hoc top filter UIs that duplicate table external filter capability
- Depend on warning/help text to enforce required filter preconditions
- Auto-add score cards to listing screens when the requirement does not ask for them
- Keep external filter toolbar visible when there is only one external-filter row and no toolbar actions are needed
- Hard-code external filter layout values without applying the auto-calculation rule above
- Expose extra component fields/getters when a local variable or `#privateField` is sufficient
- Use template-bound method calls for permission checks or similar boolean guards
- Omit `data.permission` from route definitions
- Do not omit `data.permissionKey` when the module is designed to use keyed permission configuration
- Do not omit `sd-upload-file [key]` when the module is designed to use keyed upload-file configuration
- Duplicate route-level permission guard as in-component `canViewList` / `canCreate` checks
- Use constructor injection; always use `inject()` function instead
- Omit `changeDetection: ChangeDetectionStrategy.OnPush` from list/detail component declarations
- Reorder imports arbitrarily; always follow the 5-group import order convention
- Generate mutable UI state as plain class fields/getters when `signal()`/`computed()` can represent that state
- Use `effect()` for pure derivations that should be `computed()`
- Omit the 4 audit columns from primary list pages unless an explicit skip condition applies
- Hard-code audit field names without inspecting the DTO definition
- Overuse signal invocations in template without considering the 2+ times rule (apply `computed()` or `@let` when signal is referenced 2+ times)
- Create spec files without first asking developer which test coverage level they prefer (minimal/standard/full)
- Generate placeholder specs with `// TODO add tests` or similar; all specs must be runnable and pass on first `ng test`
- Render long multi-section page forms without anchor navigation when `sd-anchor` is already available
- Use editable inputs in DETAIL read-only summary sections when `AdaptiveSplitDetail` layout is selected
- Leave DETAIL page in broken state when `detail(id)` fails (`Entity not found`) without user feedback or recovery navigation
- Ignore provided cURL contract or PRD image when they define API fields or UI sections


## 4. Templates and code samples

All `.ts` code templates this reference emits live in template files — this file stays slim by linking out:

- **Component + service + routes templates** — `_refs/angular-portal/templates/entity-skeleton.md`
  - Preconditions, layout-variant decisions, anchor heuristic
  - Permission keyed route template (2 components + URL states)
  - Permission directive template
  - Test coverage selection
  - Detail UI mode + pattern selection
  - Workflow extension points
  - Side-drawer vs full-page project structure tables
  - `[entity].model.ts`, `[entity].service.ts`
  - `components/[entity]-select/[entity]-select.component.ts`
  - `list.component.ts` (page variant) and `list.component.ts` (side-drawer variant)
  - `routes.ts` (side-drawer variant)
  - `detail.component.ts` (UnifiedCompact) and `detail.component.ts` (AdaptiveSplitDetail variant)
  - `[entity].routes.spec.ts` (permission validation)
  - `index.ts` (barrel export)

- **Spec.ts templates** — `_refs/angular-portal/templates/entity-tests.md`
  - "Request for Test Coverage" clarify prompt
  - `list.component.spec.ts` and `detail.component.spec.ts` at Standard coverage
  - `[module]-[entity].routes.spec.ts` permission validation tests

- **Worked example (Product entity)** — `_refs/angular-portal/templates/example-product.md`
  - Reference output to verify shape and conventions; do NOT copy-paste — emit the parameterized templates above with the user's confirmed inputs.

Load the relevant ref file ON DEMAND when the corresponding sub-step runs; do NOT pre-load all of them.

## 5. Example Input

```
Create a "Product" entity inside module "catalog" with fields: code, name, description, price, stock, category, isActivated
- List page should display: code, name, price, stock, category with inline edit for isActivated
- Detail page should support file upload for product images
- Use category as a dropdown with lazy loading
```

### Example Input for side-drawer preference

```text
Create Customer CRUD in module crm with 6 fields: code, name, phone, email, type, isActivated.
Use a common quick-edit experience.
```

Expected detail mode:
```text
side-drawer
```

### If the user does not specify module

```text
User input: "Create Product CRUD screens with product code and product name"

Agent must ask:
"Product thuộc module nào? Nếu chưa có module, tôi sẽ tạo module mới trước."
```


## 5. Spec Templates (Functional Testing)
Detailed spec.ts code is in `_refs/angular-portal/templates/entity-tests.md`. The clarify flow for choosing coverage level is at `_refs/angular-portal/templates/entity-tests.md#request-for-test-coverage`.

## 6. Example Output
Worked Product entity (full code samples for model + service + list + detail) lives at `_refs/angular-portal/templates/example-product.md`. Treat it as a sanity reference, not a paste source.

## Implementation Checklist

- [ ] Create model file with SaveReq interface and DTO type
- [ ] Create `services/[entity].mock-data.ts` with 20–40 domain-realistic seed rows immediately after SaveReq/DTO are finalized
- [ ] Create service with mock-first CRUD (`localStorage`) by default; use BaseService/API mode only when backend contract is explicit
- [ ] Create list component with @SdTabComponent decorator
- [ ] Create detail component with 3-state machine
- [ ] Define route configuration with lazy loading
- [ ] Export all from barrel index.ts
- [ ] Service is `@Injectable({ providedIn: 'root' })` (default) — no route-level provider; if scoping is intentionally narrower, document why in the file header
- [ ] Test CREATE/UPDATE/DETAIL flows
- [ ] Validate form before save
- [ ] Test file upload functionality
- [ ] Test permission directives
- [ ] Test server-side pagination
