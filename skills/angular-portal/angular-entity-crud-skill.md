# Angular Skill: Entity CRUD Module

## 1. Skill Name
**Entity CRUD Module Generation**

## 2. Description
Generates a complete entity management module following sdcorejs architecture patterns. Creates service layer, models/interfaces, and page components (list and detail) with full CRUD operations, reactive forms, and data tables.

This skill can synthesize UI structure from PRD text, screenshot/attribute images, and sample cURL payloads, then map those into CREATE/UPDATE/DETAIL rendering strategies.

This skill assumes the target feature module is already known. If the request does not specify a module, the agent must resolve that first using the request intake flow.

For common entity forms with around 5-6 fields, this skill should prefer a side-drawer detail UI before using a full page detail.

## 3. Rules

### MUST DO ✅
- Confirm target module before generating entity files
- Generate the feature module first if it does not exist
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
- Create separate files: `model.ts`, `service.ts` for each entity
- Define request model (SaveReq) and response type (DTO extends BaseEntity)
- Use permission code format: `<MODULE>_C_<ENTITY>_<ACTION>`
  - Examples: `CRM_C_PRODUCT_LIST`, `CRM_C_PRODUCT_DETAIL`, `CRM_C_PRODUCT_CREATE`, `CRM_C_PRODUCT_UPDATE`, `CRM_C_PRODUCT_APPROVE`
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
- For full-page detail with many fields/sections, combine section grouping with `sd-anchor-v2` for fast scroll navigation
  - Use `sd-anchor-v2 type="vertical" ellipsis` as wrapper
  - Use one `sd-anchor-item-v2` per business section (for example: "Thông tin chung", "Rổ hàng", "Hồ sơ")
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
- Reserve extension points for workflow actions in both list and detail
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
  3. Third-party / library (`@sd-angular/core/...`, other npm packages)
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
  - **Route permission coverage**: verify every route has `data.permission` and follows `<MODULE>_C_<ENTITY>_<ACTION>` format
  - **Data visibility coverage** (list): verify missing required external filter returns empty data, and valid filter triggers service call
  - **Data ordering coverage** (list): verify domain sort behavior (if defined) is applied correctly
  - **Action flow coverage** (detail): verify invalid form blocks save, create path calls `create`, update path calls `update`, and navigation is correct
  - **Signal state coverage**: verify state transitions (`CREATE/UPDATE/DETAIL`) and computed flags (`isDetail`, title) work as expected
- After generating a new module or entity, run tests immediately and report result:
  - Preferred command: `npm run test -- --watch=false --include=src/libs/[module]/modules/[entity]/**/*.spec.ts`
  - If include filter is not supported, run full `npm run test -- --watch=false` and summarize spec results
  - If environment lacks headless browser, report blocker explicitly and provide exact command for developer to run locally
- Reserve extension points for workflow actions in both list and detail
- Always run a final double-check pass: route data, permission keys, upload keys, service wiring, and basic build/test status
- Support hybrid NgModule + standalone integration when target codebase still uses NgModule boundaries

### TESTING CHECKLIST FOR DEVELOPERS ⚠️
**When applying this skill to generate a new entity module, developers MUST verify these points before committing:**

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
   - [ ] Ensure no legacy imports like `from 'sd-angular'` exist; use `@sd-angular/core/...` paths

6. **Accessibility**
   - [ ] Check action toolbars have `role="toolbar"` attribute
   - [ ] Verify all buttons have `title` or `aria-label` for screen reader support
   - [ ] Confirm use of semantic HTML where possible

7. **Audit Columns (List Page)**
   - [ ] Verify primary list tables include all 4 audit columns at the end: `createdAt`, `createdBy`, `updatedAt`, `updatedBy`
   - [ ] Check field names match actual DTO (vary by backend: `createdAt` vs `CreatedDate` vs `created_at`)
   - [ ] Confirm skip conditions are documented if audit columns are intentionally omitted

8. **Route Permission Guards**
   - [ ] Check every route has `data: { permission: 'MODULE_C_ENTITY_ACTION' }` defined
   - [ ] Verify permission codes follow strict format: `<UPPERCASE_MODULE>_C_<UPPERCASE_ENTITY>_<ACTION>`
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
- Use ad-hoc permission code naming that does not follow `<MODULE>_C_<ENTITY>_<ACTION>`
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
- Render long multi-section page forms without anchor navigation when `sd-anchor-v2` is already available
- Use editable inputs in DETAIL read-only summary sections when `AdaptiveSplitDetail` layout is selected
- Leave DETAIL page in broken state when `detail(id)` fails (`Entity not found`) without user feedback or recovery navigation
- Ignore provided cURL contract or PRD image when they define API fields or UI sections

## 4. Template

### Preconditions
```text
Required before applying this skill:
- module name is known
- module exists, or the agent has already created it
- entity name is known
- minimum display fields are known: code, name, status or equivalent
- clarify test coverage level with developer before generating spec files

If permission is key-based:
- permissionKey is known (or explicitly use default key = undefined)
```

### Detail Layout Variant Template
```typescript
// Variant A: UnifiedCompact
// CREATE/UPDATE/DETAIL share same no-split layout
<sd-page>
  <sd-section title="Thông tin chung"> ...form/read-only blocks... </sd-section>
</sd-page>

// Variant B: UnifiedSplit
// CREATE/UPDATE/DETAIL share same split layout (left title, right form)
<sd-page>
  <div class="c-item align-items-start">
    <div class="c-item__label">Thông tin đợt mở bán</div>
    <div class="c-item__content"> ...fields... </div>
  </div>
</sd-page>

// Variant C: AdaptiveSplitDetail
// CREATE/UPDATE: split editable form + anchor
// DETAIL: split read-only cards with sd-section-item
<sd-page>
  @if (state === 'DETAIL') {
    <div class="row row-sm mx-0">
      <sd-section class="col-4" title="Thông tin chung" noPaddingBody collapsable>
        <sd-section-item label="Mã" labelWidth="136px"><div>{{ entity.code }}</div></sd-section-item>
      </sd-section>
      <sd-section class="col-12 mt-16" title="Rổ hàng" collapsable>
        <sd-table [option]="tableOption"></sd-table>
      </sd-section>
    </div>
  } @else {
    <sd-anchor-v2 type="vertical" ellipsis>
      <sd-anchor-item-v2 title="Thông tin chung">
        <sd-section title="Thông tin chung" noPaddingBody collapsable> ...editable fields... </sd-section>
      </sd-anchor-item-v2>
      <sd-anchor-item-v2 title="Rổ hàng">
        <sd-section title="Rổ hàng" collapsable> ...table/actions... </sd-section>
      </sd-anchor-item-v2>
    </sd-anchor-v2>
  }
</sd-page>
```

### Anchor Activation Heuristic
```text
Enable sd-anchor-v2 when one of these is true:
- form has >= 12 fields, or
- form has >= 3 business sections, or
- page includes at least one large child table/upload block plus other sections

If none match, keep regular section layout without anchor.
```

### Permission Keyed Route Template
```typescript
export const employeeRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/list/list.component').then(m => m.ListComponent),
        data: {
          permission: 'SAMPLE_C_EMPLOYEE_LIST',
          permissionKey: 'sample',
        },
      },
      {
        path: ':id',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: {
          permission: 'SAMPLE_C_EMPLOYEE_DETAIL',
          permissionKey: 'sample',
        },
      },
    ],
  },
];
```

### Permission Directive Template
```html
<!-- Keyed permission -->
<button
  *sdPermission="'SAMPLE_C_EMPLOYEE_CREATE'; sdPermissionKey: 'sample'"
  mat-flat-button
  color="primary"
>
  Thêm mới
</button>

<!-- Default key (undefined) -->
<button *sdPermission="'SAMPLE_C_EMPLOYEE_EXPORT'" mat-stroked-button>
  Xuất dữ liệu
</button>
```

### Test Coverage Selection
```text
Ask developer before proceeding:
"Bạn muốn cấp độ test coverage nào cho module này?"

Options:
- minimal   : only 'should create' test (fastest, demo/prototype)
- standard  : + permission route tests + data visibility/sort tests (recommended)
- full      : + all unit/integration tests for state, save flow, edge cases

Based on response, generate spec templates from Section 5 accordingly.
```

### Detail UI Mode Selection
```text
If user does not specify UI mode:
- default `side-drawer` when detail form has around 5-6 common fields
- ensure no vertical scroll in normal desktop viewport for common screens
- switch to `page` when workflow includes:
  - multiple business sections
  - approval actions and timeline
  - heavy file areas and large child table

### Workflow Extension Points
```text
If entity includes workflow (submit/approve/reject):
- detail: render state-based action buttons in headerRight
- list: add selector bulk actions only if business asks for mass operation
- service: expose transition methods (submit, approve, reject, bulkSubmit...)
```
```

### Detail UI Pattern Selection
```text
Choose ONE based on entity complexity:

1. Side-drawer  (≤6 fields, simple form)
   - All CRUD embedded in list page via <sd-side-drawer>
   - No sub-routes (create/detail/update); only one list route
   - Use viewChild.required<SdSideDrawer>('drawer') to open/close
   - Starter reference: core/templates/angular-portal-starter/src/libs/sample/modules/product

2. UnifiedCompact  (full page, same layout for CREATE/UPDATE/DETAIL)
   - Sub-routes: list + create + detail/:id + update/:id
   - Same component handles all 3 states via [viewed]="state === 'DETAIL'"
   - Starter reference: core/templates/angular-portal-starter/src/libs/sample/modules/employee

3. AdaptiveSplitDetail  (full page, DETAIL differs from CREATE/UPDATE)
   - Sub-routes: list + create + detail/:id + update/:id
   - DETAIL renders sd-section + sd-section-item (read-only label-value pairs)
   - CREATE/UPDATE renders editable sd-input / sd-select / sd-textarea
   - Import SdSectionItem from @sd-angular/core/components/section
   - Starter reference: core/templates/angular-portal-starter/src/libs/sample/modules/department
```

### Side-drawer Project Structure
```
libs/[module]/
└── modules/[entity]/
  ├── [entity].routes.ts           # Only list route, no create/detail/update sub-routes
  ├── [entity].routes.spec.ts
  ├── pages/
  │   └── list/
  │       ├── list.component.spec.ts
  │       └── list.component.ts    # Contains embedded <sd-side-drawer>
  ├── services/
  │   ├── [entity].model.ts
  │   └── [entity].service.ts
  └── index.ts
```

### Full-page Project Structure (UnifiedCompact / AdaptiveSplitDetail)
```
libs/[module]/
└── modules/[entity]/
  ├── [entity].routes.ts
  ├── [entity].routes.spec.ts
  ├── pages/
  │   ├── list/
  │   │   ├── list.component.spec.ts
  │   │   └── list.component.ts
  │   └── detail/
  │       ├── detail.component.spec.ts
  │       └── detail.component.ts
  ├── services/
  │   ├── [entity].model.ts
  │   └── [entity].service.ts
  └── index.ts
```

### [entity].model.ts
```typescript
import { BaseEntity } from '@[module]/services';

// Constants for enum-like values
export const [ENTITY_UPPER]_STATUSES = [
  { value: 'ACTIVE', display: 'Hoạt động' },
  { value: 'INACTIVE', display: 'Không hoạt động' },
];

// Save request - used for create/update
export interface [Entity]SaveReq {
  code?: string;
  name?: string;
  description?: string;
  // Add other editable fields
  isActivated?: boolean;
  fileIds?: string[];
}

// Response - extends SaveReq with BaseEntity fields
export type [Entity]DTO = Required<[Entity]SaveReq> & BaseEntity;
```

### [entity].service.ts
```typescript
import { Injectable, inject } from '@angular/core';
import { BaseService } from '@[module]/services';
import { [Entity]DTO, [Entity]SaveReq } from './[entity].model';

@Injectable()
export class [Entity]Service extends BaseService {
  readonly #api = this.register<[Entity]DTO, [Entity]SaveReq>('[entity]');

  // Expose CRUD methods
  paging = this.#api.paging;
  search = this.#api.search;
  all = this.#api.all;
  detail = this.#api.detail;
  create = this.#api.create;
  update = this.#api.update;
  remove = this.#api.remove;

  // Optional: Custom API methods
  // async customAction(id: string) { return this.#api.baseUrl; }
}
```

### list.component.spec.ts (generated based on test coverage level)
```text
Generation process:

STEP 1: Ask developer
"Bạn muốn cấp độ test coverage nào?"
- minimal  → generate only "should create" test
- standard → generate full template from Section 5 (6 tests)
- full     → generate Section 5 template + extended edge cases

STEP 2: Generate spec file from template
- If minimal: use only 2 test cases (describe block + "should create")
- If standard or full: use complete template from Section 5 "list.component.spec.ts"
  - Replace [Entity] with actual entity name (e.g., PriceService)
  - Replace [entity] with entity camelCase (e.g., priceService)
  - Replace [module] with module name (e.g., pricing)
- Mock Router, ActivatedRoute, [Entity]Service with Jasmine spies
- Use TestBed.overrideComponent to isolate template from heavy UI library

STEP 3: Ensure spec is runnable
- No placeholder comments
- All mocks configured
- All expects defined
- Can run: npx ng test --watch=false --include="...spec.ts"
```

### detail.component.spec.ts (generated based on test coverage level)
```text
Generation process:

STEP 1: Ask developer (if not already asked for list.component.spec.ts)
"Bạn muốn cấp độ test coverage nào?"
- minimal  → generate only "should create" test
- standard → generate full template from Section 5 (11 tests)
- full     → generate Section 5 template + extended state/save edge cases

STEP 2: Generate spec file from template
- If minimal: use only 2 test cases (describe block + "should create")
- If standard or full: use complete template from Section 5 "detail.component.spec.ts"
  - Replace [Entity] with actual entity name (e.g., PriceService, PriceDTO)
  - Replace [entity] with entity camelCase (e.g., priceService)
  - Replace [module] with module name (e.g., pricing)
- Mock Router (with url property), ActivatedRoute (with snapshot.params), all services
- Use TestBed.overrideComponent to isolate template from heavy UI library
- Mock form.markAllAsTouched, form.invalid with spyOnProperty

STEP 3: Test state transitions and save flow
- Test CREATE/UPDATE/DETAIL state initialization based on route URL and params
- Test entity field updates via signal update() method
- Test form invalid gate on save
- Test create vs update service calls based on entity.id presence
- Test notification and navigation after save

STEP 4: Ensure spec is runnable
- No placeholder comments
- All signal invocations tested via component.state(), component.entity()
- All expects defined
- Can run: npx ng test --watch=false --include="...spec.ts"
```

### list.component.ts
```typescript
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import {
  SdButton,
  SdPageComponent,
  SdPermissionDirective,
  SdSwitch,
  SdTable,
  SdTabComponent,
  SdTableCellDefDirective,
  SdTableOption,
} from '@sd-angular/core/components';

import { [Entity]DTO } from '../services/[entity].model';
import { [Entity]Service } from '../services/[entity].service';

@Component({
  selector: '[entity]-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SdButton,
    SdPageComponent,
    SdTable,
    SdTableCellDefDirective,
    SdPermissionDirective,
    SdSwitch,
  ],
  template: `
    <sd-page title="[Entity Display Name]">
      <div class="d-flex align-items-center" role="toolbar" headerRight>
        <sd-button
          *sdPermission="'[MODULE]_C_[ENTITY]_CREATE'"
          title="Tạo mới"
          aria-label="Tạo mới"
          type="fill"
          prefixIcon="add"
          (click)="onCreate()">
        </sd-button>
      </div>

      <div class="h-full p-8">
        @if (tableOption()) {
          <sd-table [option]="tableOption()!" #table autoId="[module]_[entity]">
            <ng-template sdTableCellDef="isActivated" let-item="item">
              <sd-switch [(model)]="item.isActivated" (sdChange)="onChangeIsActivated(item)"></sd-switch>
            </ng-template>
          </sd-table>
        }
      </div>
    </sd-page>
  `,
})
@SdTabComponent({
  component: ListComponent,
  name: '[Entity Display Name]',
  color: 'primary',
})
export class ListComponent implements OnInit {
  @ViewChild(SdTable) table!: SdTable<[Entity]DTO>;

  readonly #router = inject(Router);
  readonly #[entity]Service = inject([Entity]Service);

  readonly tableOption = signal<SdTableOption<[Entity]DTO> | null>(null);

  ngOnInit(): void {
    const filterCount = 1;
    const externalFilterPerRow = filterCount <= 4 ? 4 : 6;
    const hideExternalFilterToolbar = Math.ceil(filterCount / externalFilterPerRow) <= 1;

    this.tableOption.set({
      key: '[module]-[entity]-list',
      type: 'server',
      reload: { visible: true },
      config: { visible: true },
      filter: {
        externalFilterPerRow,
        hideExternalFilterToolbar,
        externalFilters: [
          {
            field: 'projectId',
            title: 'Dự án',
            type: 'values',
            defaultShowing: true,
            required: true,
            option: {
              valueField: 'id',
              displayField: 'display',
              items: async () => [{ id: 'P001', display: 'P001 - Sample Project' }],
            },
          },
        ],
      },
      items: async (_, pagingRequest) => this.#[entity]Service.paging(pagingRequest),
      columns: [
        {
          title: 'Mã',
          field: 'code',
          type: 'string',
          width: '150px',
          click: (_value, row) => this.#onDetail(row.id),
        },
        {
          title: 'Tên',
          field: 'name',
          type: 'string',
          width: '300px',
        },
        {
          title: 'Trạng thái',
          field: 'isActivated',
          type: 'boolean',
          option: { displayOnTrue: 'Hoạt động', displayOnFalse: 'Khóa' },
          width: '150px',
        },
      ],
    });
  }

  onCreate(): void {
    this.#router.navigate(['create']);
  }

  async onChangeIsActivated(item: [Entity]DTO): Promise<void> {
    await this.#[entity]Service.update(item.id, { isActivated: item.isActivated } as any);
    this.table.reload();
  }

  #onDetail(id: string): void {
    this.#router.navigate(['detail', id]);
  }
}
```

### list.component.ts (Side-drawer variant)
```typescript
// Use when: ≤6 fields, simple form, no separate page/route needed.
// Reference: core/templates/angular-portal-starter/src/libs/sample/modules/product/pages/list/list.component.ts

import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject, viewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { SdButton, SdSection, SdTabComponent, SdTabelCellDefDirective, SdTable, SdTableOption } from '@sd-angular/core/components';
import { SdSideDrawer } from '@sd-angular/core/components/side-drawer';
import { SdInput, SdInputNumber, SdSelect, SdSwitch, SdTextarea } from '@sd-angular/core/forms';
import { SdPageComponent, SdPermissionDirective } from '@sd-angular/core/modules';
import { SdConfirmService, SdLoadingService, SdNotifyService } from '@sd-angular/core/services';

import { [Entity]DTO, [Entity]SaveReq } from '../../services/[entity].model';
import { [Entity]Service } from '../../services/[entity].service';

@Component({
  selector: '[entity]-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SdButton, SdSection, SdSideDrawer, SdTable, SdTabelCellDefDirective,
            SdPermissionDirective, SdInput, SdInputNumber, SdSelect, SdSwitch, SdTextarea, SdPageComponent],
  template: `
    <sd-page title="[Entity Display Name]">
      <div class="d-flex align-items-center" role="toolbar" headerRight>
        <sd-button
          *sdPermission="'[MODULE]_C_[ENTITY]_CREATE'; sdPermissionKey: '[module]'"
          title="Tạo mới" type="fill" prefixIcon="add" color="primary"
          (click)="onOpenCreate()">
        </sd-button>
      </div>
      <div class="h-full p-8">
        @if (tableOption) {
          <sd-table [option]="tableOption" #table autoId="[module]_[entity]">
            <ng-template sdTableCellDef="isActivated" let-item="item">
              <sd-switch class="d-block text-center"
                [(model)]="item.isActivated" (sdChange)="onChangeIsActivated(item)"></sd-switch>
            </ng-template>
          </sd-table>
        }
      </div>
    </sd-page>

    <!-- Side-drawer: handles CREATE / UPDATE / DETAIL inline, no sub-routes needed -->
    <sd-side-drawer #drawer [title]="drawerTitle" width="480px">
      <div class="p-16">
        <sd-section title="Thông tin chung" noPaddingBody>
          <div class="row row-sm mx-0 pt-8">
            <!-- Add form fields here with [viewed]="drawerState === 'DETAIL'" -->
            <div class="col-12">
              <sd-input label="Mã" [(model)]="drawerEntity.code" [form]="drawerForm" required
                [viewed]="drawerState === 'DETAIL'"></sd-input>
            </div>
            <div class="col-12">
              <sd-input label="Tên" [(model)]="drawerEntity.name" [form]="drawerForm" required
                [viewed]="drawerState === 'DETAIL'"></sd-input>
            </div>
          </div>
        </sd-section>

        <div class="d-flex justify-content-end gap-8 mt-16">
          @if (drawerState === 'DETAIL') {
            <sd-button *sdPermission="'[MODULE]_C_[ENTITY]_UPDATE'; sdPermissionKey: '[module]'"
              title="Cập nhật" type="fill" prefixIcon="edit" color="primary"
              (click)="onDrawerEdit()"></sd-button>
          } @else {
            <sd-button title="Hủy" (click)="drawer.close()"></sd-button>
            <sd-button title="Lưu" type="fill" prefixIcon="save" color="primary"
              [loading]="drawerSaving" (click)="onDrawerSave()"></sd-button>
          }
        </div>
      </div>
    </sd-side-drawer>
  `,
})
@SdTabComponent({ component: ListComponent, name: '[Entity Display Name]', color: 'primary' })
export class ListComponent implements OnInit {
  @ViewChild(SdTable) table!: SdTable<[Entity]DTO>;
  readonly #drawer = viewChild.required<SdSideDrawer>('drawer');
  readonly #notifyService = inject(SdNotifyService);
  readonly #confirmService = inject(SdConfirmService);
  readonly #loadingService = inject(SdLoadingService);
  readonly #[entity]Service = inject([Entity]Service);

  tableOption!: SdTableOption<[Entity]DTO>;
  drawerForm = new FormGroup({});
  drawerSaving = false;
  drawerEntity: Partial<[Entity]SaveReq & { id?: string }> = {};
  drawerState: 'CREATE' | 'UPDATE' | 'DETAIL' = 'CREATE';
  drawerTitle = 'Tạo mới [entity label]';

  ngOnInit(): void {
    this.tableOption = {
      key: '[module]-[entity]-list',
      type: 'server',
      reload: { visible: true },
      config: { visible: true },
      items: async (_, pagingRequest) => this.#[entity]Service.paging(pagingRequest),
      selector: {
        actions: [{
          icon: 'delete',
          title: 'Xóa',
          click: rows => {
            this.#confirmService.confirm(`Xóa ${rows.length} dữ liệu đã chọn`).then(() => {
              this.#onRemove(rows.map(e => e.id));
            });
          },
        }],
      },
      columns: [
        { title: 'Mã', field: 'code', type: 'string', width: '150px', click: (_v, row) => this.#onOpenDetail(row) },
        { title: 'Tên', field: 'name', type: 'string', minWidth: '250px' },
        { title: 'Trạng thái', field: 'isActivated', type: 'boolean',
          option: { displayOnTrue: 'Hoạt động', displayOnFalse: 'Khóa' }, width: '130px' },
        // Audit columns
        { title: 'Ngày tạo', field: 'createdAt', type: 'datetime', width: '180px' },
        { title: 'Người tạo', field: 'createdBy', type: 'string', minWidth: '150px' },
        { title: 'Ngày cập nhật', field: 'updatedAt', type: 'datetime', width: '180px' },
        { title: 'Người cập nhật', field: 'updatedBy', type: 'string', minWidth: '150px' },
      ],
    };
  }

  onOpenCreate = () => {
    this.drawerState = 'CREATE';
    this.drawerTitle = 'Tạo mới [entity label]';
    this.drawerEntity = {};
    this.drawerForm.reset();
    this.#drawer().open();
  };

  #onOpenDetail = (row: [Entity]DTO) => {
    this.drawerState = 'DETAIL';
    this.drawerTitle = 'Chi tiết [entity label]';
    this.drawerEntity = { ...row };
    this.#drawer().open();
  };

  onDrawerEdit = () => { this.drawerState = 'UPDATE'; this.drawerTitle = 'Cập nhật [entity label]'; };

  onDrawerSave = async () => {
    if (this.drawerForm.invalid) { this.drawerForm.markAllAsTouched(); return; }
    this.drawerSaving = true;
    try {
      if (this.drawerEntity['id']) {
        await this.#[entity]Service.update(this.drawerEntity['id'], this.drawerEntity);
        this.#notifyService.success('Cập nhật [entity label] thành công');
      } else {
        await this.#[entity]Service.create(this.drawerEntity);
        this.#notifyService.success('Tạo mới [entity label] thành công');
      }
      this.#drawer().close();
      this.table.reload();
    } finally { this.drawerSaving = false; }
  };

  #onRemove = (ids: string[]) => {
    this.#loadingService.start();
    this.#[entity]Service.remove(ids)
      .then(() => { this.#notifyService.success('Xóa [entity label] thành công'); this.table.reload(); })
      .finally(() => this.#loadingService.stop());
  };

  onChangeIsActivated = (row: [Entity]DTO) => {
    this.#[entity]Service.update(row.id, { isActivated: row.isActivated } as any).catch(console.error);
  };
}
```

### [entity].routes.ts (Side-drawer variant — list only, no sub-routes)
```typescript
export const [entity]Routes: Routes = [
  {
    path: '',
    providers: [[Entity]Service],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/list/list.component').then(m => m.ListComponent),
        data: { permission: '[MODULE]_C_[ENTITY]_LIST', permissionKey: '[module]' },
      },
    ],
  },
];
```

### detail.component.ts
```typescript
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  SdButton,
  SdDate,
  SdDatetime,
  SdInput,
  SdInputNumber,
  SdPageComponent,
  SdPermissionDirective,
  SdSection,
  SdSelect,
  SdSwitch,
  SdTextarea,
  SdUploadFile,
} from '@sd-angular/core/components';
import { ActivatedRoute, Router } from '@angular/router';
import { [Entity]DTO, [Entity]SaveReq } from '../services/[entity].model';
import { [Entity]Service } from '../services/[entity].service';

@Component({
  selector: '[entity]-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    SdButton,
    SdDate,
    SdDatetime,
    SdInput,
    SdInputNumber,
    SdPageComponent,
    SdPermissionDirective,
    SdSection,
    SdSelect,
    SdSwitch,
    SdTextarea,
    SdUploadFile,
  ],
  template: `
    <sd-page [title]="pageTitle()">
      <div class="d-flex gap-8" role="toolbar" headerRight>
        @if (state() === 'CREATE' || state() === 'UPDATE') {
          <sd-button
            *sdPermission="'[MODULE]_[ENTITY]_DELETE'"
            title="Xóa"
            type="fill"
            color="error"
            prefixIcon="delete"
            (click)="onDelete()">
          </sd-button>
          <sd-button
            title="Lưu"
            type="fill"
            prefixIcon="save"
            (click)="onSave()">
          </sd-button>
        }
        <sd-button
          title="Quay lại"
          type="outline"
          prefixIcon="arrow_back"
          (click)="onBack()">
        </sd-button>
      </div>

      <div class="p-8">
        <sd-section>
          <sd-input
            label="Mã"
            [model]="entity().code"
            (modelChange)="onEntityFieldChange('code', $event)"
            [form]="form"
            required
            maxlength="32"
            [viewed]="isDetail()">
          </sd-input>

          <sd-input
            label="Tên"
            [model]="entity().name"
            (modelChange)="onEntityFieldChange('name', $event)"
            [form]="form"
            required
            maxlength="255"
            [viewed]="isDetail()">
          </sd-input>

          <sd-textarea
            label="Mô tả"
            [model]="entity().description"
            (modelChange)="onEntityFieldChange('description', $event)"
            [form]="form"
            maxlength="1000"
            [viewed]="isDetail()">
          </sd-textarea>

          <sd-switch
            label="Hoạt động"
            [model]="entity().isActivated"
            (modelChange)="onEntityFieldChange('isActivated', $event)"
            [form]="form"
            [viewed]="isDetail()">
          </sd-switch>

          @if (!isDetail()) {
            <sd-upload-file
              label="Tải lên tệp"
              #uploadFiles
              multiple
              [viewed]="isDetail()">
            </sd-upload-file>
          }
        </sd-section>
      </div>
    </sd-page>
  `,
})
export class DetailComponent implements OnInit {
  form = new FormGroup({});
  readonly state = signal<'CREATE' | 'UPDATE' | 'DETAIL'>('CREATE');
  readonly entity = signal<Partial<[Entity]SaveReq>>({});
  readonly pageTitle = computed(() => {
    if (this.state() === 'CREATE') return 'Tạo [Entity Display Name]';
    return this.state() === 'DETAIL' ? 'Chi tiết [Entity Display Name]' : 'Cập nhật [Entity Display Name]';
  });
  readonly isDetail = computed(() => this.state() === 'DETAIL');

  @ViewChild('uploadFiles') uploadFiles!: SdUploadFile;

  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #[entity]Service = inject([Entity]Service);

  ngOnInit(): void {
    const url = this.#router.url;
    const id = this.#activatedRoute.snapshot.paramMap.get('id');

    if (url.includes('update') && id) {
      this.state.set('UPDATE');
      this.#detail(id);
    } else if (url.includes('detail') && id) {
      this.state.set('DETAIL');
      this.#detail(id);
    } else {
      this.state.set('CREATE');
    }
  }

  onEntityFieldChange<K extends keyof [Entity]SaveReq>(key: K, value: [Entity]SaveReq[K]): void {
    this.entity.update(prev => ({ ...prev, [key]: value }));
  }

  async onSave(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Upload files first
    if (this.uploadFiles?.getUploadedFileInfos?.()?.length) {
      const fileIds = await Promise.all(
        this.uploadFiles.getUploadedFileInfos().map((f: any) => f.upload())
      );
      this.entity.update(prev => ({ ...prev, fileIds: fileIds.filter(Boolean) }));
    }

    try {
      const currentEntity = this.entity();

      if (currentEntity.id) {
        await this.#[entity]Service.update(currentEntity.id, currentEntity);
      } else {
        const newEntity = await this.#[entity]Service.create(currentEntity);
        this.entity.set(newEntity);
        this.state.set('UPDATE');
      }

      this.#router.navigate(['..'], { relativeTo: this.#activatedRoute });
    } catch (error) {
      console.error(error);
    }
  }

  async onDelete(): Promise<void> {
    const currentEntity = this.entity();

    if (confirm('Bạn có chắc muốn xóa?') && currentEntity.id) {
      try {
        await this.#[entity]Service.remove(currentEntity.id);
        this.#router.navigate(['..'], { relativeTo: this.#activatedRoute });
      } catch (error) {
        console.error(error);
      }
    }
  }

  onBack(): void {
    this.#router.navigate(['..'], { relativeTo: this.#activatedRoute });
  }

  async #detail(id: string): Promise<void> {
    try {
      this.entity.set(await this.#[entity]Service.detail(id));
    } catch (error) {
      console.error(error);
    }
  }
}
```

### [entity].routes.ts
```typescript
import { Routes } from '@angular/router';
import { ListComponent } from './pages/list/list.component';
import { DetailComponent } from './pages/detail/detail.component';
import { [Entity]Service } from './services/[entity].service';

export const [entity]Routes: Routes = [
  {
    path: '',
    component: ListComponent,
    data: { permission: '[MODULE]_C_[ENTITY]_LIST' },
  },
  {
    path: 'create',
    component: DetailComponent,
    data: { permission: '[MODULE]_C_[ENTITY]_CREATE' },
  },
  {
    path: 'detail/:id',
    component: DetailComponent,
    data: { permission: '[MODULE]_C_[ENTITY]_DETAIL' },
  },
  {
    path: 'update/:id',
    component: DetailComponent,
    data: { permission: '[MODULE]_C_[ENTITY]_UPDATE' },
  },
];
```

### [entity].routes.spec.ts (Permission Validation)
```text
ALWAYS generate this spec file—it validates permission codes on routes (not UI-dependent).

Generation instructions:
- Use template from Section 5 "[module]-[entity].routes.spec.ts"
- Replace [Entity] and [entity] with actual names
- Test must verify:
  1. Every route has a data.permission property
  2. All permission codes follow <MODULE>_C_<ENTITY>_<ACTION> format
  3. No route is left without permission guard

Example route spec test:
- Route '' (list) → permission 'PRICING_C_PRICE_LIST'
- Route 'create' → permission 'PRICING_C_PRICE_CREATE'
- Route 'detail/:id' → permission 'PRICING_C_PRICE_DETAIL'
- Route 'update/:id' → permission 'PRICING_C_PRICE_UPDATE'

Run via: npx ng test --watch=false --include="**/[entity].routes.spec.ts"
```

### index.ts (Barrel Export)
```typescript
export * from './[entity].routes';
export { ListComponent } from './pages/list/list.component';
// For full-page patterns (UnifiedCompact / AdaptiveSplitDetail):
export { DetailComponent } from './pages/detail/detail.component';
// For side-drawer pattern: no DetailComponent export needed
export { [Entity]Service } from './services/[entity].service';
export * from './services/[entity].model';
```

### detail.component.ts (AdaptiveSplitDetail variant)
```typescript
// Use when: DETAIL must display read-only label-value pairs (sd-section-item),
//           while CREATE/UPDATE use editable form controls.
// Reference: core/templates/angular-portal-starter/src/libs/sample/modules/department/pages/detail/detail.component.ts

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SdButton, SdSection, SdTabComponent } from '@sd-angular/core/components';
import { SdSectionItem } from '@sd-angular/core/components/section';
import { SdInput, SdSelect, SdTextarea } from '@sd-angular/core/forms';
import { SdPageComponent } from '@sd-angular/core/modules';
import { SdLoadingService, SdNotifyService } from '@sd-angular/core/services';

import { [Entity]DTO } from '../../services/[entity].model';
import { [Entity]Service } from '../../services/[entity].service';

@Component({
  selector: '[entity]-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SdInput, SdSelect, SdTextarea, SdButton, SdSection, SdSectionItem, SdPageComponent],
  template: `
    <sd-page [title]="title">
      <div class="d-flex align-items-center" style="gap: 8px" headerRight>
        <sd-button title="Quay lại" prefixIcon="replay" (click)="onBack()"></sd-button>
        @if (state === 'DETAIL') {
          <sd-button title="Cập nhật" type="fill" prefixIcon="edit" color="primary" (click)="onUpdate()"></sd-button>
        } @else {
          <sd-button title="Lưu" type="fill" prefixIcon="save" color="primary" (click)="onSave()" [loading]="saving"></sd-button>
        }
      </div>

      <div class="h-full p-8">
        @if (state === 'DETAIL') {
          <!-- AdaptiveSplitDetail: read-only label-value layout -->
          <sd-section title="Thông tin chung" collapsable>
            <sd-section-item label="Mã" labelWidth="120px">{{ entity.code }}</sd-section-item>
            <sd-section-item label="Tên" labelWidth="120px">{{ entity.name }}</sd-section-item>
            <!-- Add more sd-section-item for each read-only field -->
          </sd-section>
        } @else {
          <!-- CREATE / UPDATE: editable form -->
          <sd-section title="Thông tin chung">
            <div class="row row-sm mx-0">
              <div class="col-6">
                <sd-input label="Mã" [(model)]="entity.code" [form]="form" required maxlength="32"></sd-input>
              </div>
              <div class="col-6">
                <sd-input label="Tên" [(model)]="entity.name" [form]="form" required></sd-input>
              </div>
              <!-- Add more form fields -->
            </div>
          </sd-section>
        }
      </div>
    </sd-page>
  `,
})
@SdTabComponent({
  component: DetailComponent,
  name: args => {
    if (args?.url?.includes('update')) return 'Cập nhật [entity label]';
    if (args?.url?.includes('detail')) return 'Chi tiết [entity label]';
    return 'Tạo mới [entity label]';
  },
  color: args => {
    if (args?.url?.includes('update')) return 'warning';
    if (args?.url?.includes('detail')) return 'info';
    return 'success';
  },
})
export class DetailComponent implements OnInit {
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #notifyService = inject(SdNotifyService);
  readonly #loadingService = inject(SdLoadingService);
  readonly #[entity]Service = inject([Entity]Service);

  form = new FormGroup({});
  saving = false;
  entity: Partial<[Entity]DTO> = {};
  id = '';
  state: 'CREATE' | 'UPDATE' | 'DETAIL' = 'CREATE';
  title = '';

  ngOnInit() {
    this.id = this.#route.snapshot.params?.['id'];
    if (this.#router.url.includes('update')) { this.state = 'UPDATE'; this.title = 'Cập nhật [entity label]'; }
    else if (this.#router.url.includes('detail')) { this.state = 'DETAIL'; this.title = 'Chi tiết [entity label]'; }
    else { this.state = 'CREATE'; this.title = 'Tạo mới [entity label]'; }
    if (this.id) { this.#loadDetail(this.id); }
  }

  #loadDetail = (id: string) => {
    this.#loadingService.start();
    this.#[entity]Service.detail(id).then(e => { this.entity = e; }).finally(() => this.#loadingService.stop());
  };

  onBack = () => {
    const path = this.state === 'CREATE' ? ['../'] : ['../../'];
    this.#router.navigate(path, { relativeTo: this.#route, state: { replaceTab: true } });
  };

  onUpdate = () => {
    this.#router.navigate(['../../update', this.id], { relativeTo: this.#route, state: { replaceTab: true } });
  };

  onSave = async () => {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true;
    try {
      if (this.entity.id) {
        await this.#[entity]Service.update(this.entity.id, this.entity);
        this.#notifyService.success('Cập nhật [entity label] thành công');
        this.#loadDetail(this.id);
      } else {
        const created = await this.#[entity]Service.create(this.entity);
        this.#notifyService.success('Tạo mới [entity label] thành công');
        this.#router.navigate(['../detail', created.id], { relativeTo: this.#route, state: { replaceTab: true } });
      }
    } finally { this.saving = false; }
  };
}
```

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

### Request for Test Coverage
**Before generating spec files, ask developer:**

> "Bạn muốn cấp độ test coverage nào cho module này?"
> 
> - **minimal**: chỉ `should create` (nhanh nhất, phù hợp prototype/v1)
> - **standard**: + permission route tests + basic data/sort tests (được khuyến nghị)
> - **full**: + tất cả unit + integration tests cho save flow, state transitions, edge cases

---

### list.component.spec.ts (Standard Coverage)
```typescript
// Arrange-Act-Assert pattern — functional tests for data visibility, filtering, sorting
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { [Entity]Service } from '../../services/[entity].service';
import { ListComponent } from './list.component';

describe('ListComponent ([module]/[entity])', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteMock: ActivatedRoute;
  let [entity]ServiceMock: Pick<[Entity]Service, 'paging'>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate'], { url: '/[module]/[entity]/list' });
    [entity]ServiceMock = {
      paging: jasmine.createSpy('paging').and.resolveTo({ items: [], total: 0 }),
    };
    activatedRouteMock = { snapshot: { params: {} } } as ActivatedRoute;

    TestBed.configureTestingModule({
      imports: [ListComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: [Entity]Service, useValue: [entity]ServiceMock },
      ],
    });

    TestBed.overrideComponent(ListComponent, {
      set: { template: '<div>list-test-host</div>' },
    });

    await TestBed.compileComponents();
    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize tableOption with server-side pagination and external filters', () => {
    const option = component.tableOption();
    expect(option).toBeTruthy();
    expect(option?.type).toBe('server');
    expect(option?.filter?.externalFilters?.length).toBeGreaterThan(0);
  });

  it('should return empty items when required external filter is missing', async () => {
    const option = component.tableOption();
    const result = await option?.items?.({ rawExternalFilter: {} } as any, {} as any);
    expect(result).toEqual({ items: [], total: 0 });
  });

  it('should call paging service when external filter is provided', async () => {
    const option = component.tableOption();
    await option?.items?.({ rawExternalFilter: { filter1: 'value' } } as any, {} as any);
    expect([entity]ServiceMock.paging).toHaveBeenCalled();
  });

  it('should navigate to create page', () => {
    component.onCreate();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['create'], { relativeTo: activatedRouteMock });
  });

  it('should navigate to detail page when row is clicked', () => {
    const option = component.tableOption();
    const codeCol = option?.columns.find(col => col.field === 'code');
    codeCol?.click?.('CODE-001', { id: 'id-1' } as any);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['detail', 'id-1'], { relativeTo: activatedRouteMock });
  });
});
```

### detail.component.spec.ts (Standard Coverage)
```typescript
// Arrange-Act-Assert pattern — functional tests for state transitions, save flow, validation
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { SdLoadingService, SdNotifyService } from '@sd-angular/core/services';

import { [Entity]Service } from '../../services/[entity].service';
import { DetailComponent } from './detail.component';

describe('DetailComponent ([module]/[entity])', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteMock: ActivatedRoute;
  let notifySpy: jasmine.SpyObj<SdNotifyService>;
  let loadingSpy: jasmine.SpyObj<SdLoadingService>;
  let [entity]ServiceMock: Pick<[Entity]Service, 'detail' | 'create' | 'update'>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate'], { url: '/[module]/[entity]/create' });
    notifySpy = jasmine.createSpyObj<SdNotifyService>('SdNotifyService', ['success']);
    loadingSpy = jasmine.createSpyObj<SdLoadingService>('SdLoadingService', ['start', 'stop']);
    [entity]ServiceMock = {
      detail: jasmine.createSpy('detail').and.resolveTo({}),
      create: jasmine.createSpy('create').and.resolveTo({ id: 'new-id' }),
      update: jasmine.createSpy('update').and.resolveTo({}),
    };
    activatedRouteMock = { snapshot: { params: {} } } as ActivatedRoute;

    TestBed.configureTestingModule({
      imports: [DetailComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: SdNotifyService, useValue: notifySpy },
        { provide: SdLoadingService, useValue: loadingSpy },
        { provide: [Entity]Service, useValue: [entity]ServiceMock },
      ],
    });

    TestBed.overrideComponent(DetailComponent, {
      set: { template: '<div>detail-test-host</div>' },
    });

    await TestBed.compileComponents();
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize CREATE state when no id in route', () => {
    component.ngOnInit();
    expect(component.state()).toBe('CREATE');
  });

  it('should initialize DETAIL state and load entity when url contains detail/:id', () => {
    Object.defineProperty(routerSpy, 'url', { value: '/[module]/[entity]/detail/abc', configurable: true });
    Object.defineProperty(activatedRouteMock, 'snapshot', { value: { params: { id: 'abc' } }, configurable: true });
    component.ngOnInit();
    expect(component.state()).toBe('DETAIL');
    expect([entity]ServiceMock.detail).toHaveBeenCalledWith('abc');
  });

  it('should mark form touched and block save when form is invalid', async () => {
    spyOn(component.form, 'markAllAsTouched');
    spyOnProperty(component.form, 'invalid', 'get').and.returnValue(true);
    await component.onSave();
    expect(component.form.markAllAsTouched).toHaveBeenCalled();
    expect([entity]ServiceMock.create).not.toHaveBeenCalled();
  });

  it('should call create when entity has no id', async () => {
    spyOnProperty(component.form, 'invalid', 'get').and.returnValue(false);
    component.entity.set({ name: 'New Entity' });
    await component.onSave();
    expect([entity]ServiceMock.create).toHaveBeenCalled();
    expect(notifySpy.success).toHaveBeenCalled();
  });

  it('should call update when entity has id', async () => {
    spyOnProperty(component.form, 'invalid', 'get').and.returnValue(false);
    component.entity.set({ id: 'id-1', name: 'Updated' });
    await component.onSave();
    expect([entity]ServiceMock.update).toHaveBeenCalledWith('id-1', jasmine.any(Object));
  });
});
```

### [module]-[entity].routes.spec.ts (Permission Validation)
```typescript
import { [Entity]Routes } from './[entity].routes';

describe('[Entity]Routes (permission guards)', () => {
  it('should define permission code for all routes', () => {
    const missingPermission = [Entity]Routes.filter(route => !route.data || !route.data['permission']);
    expect(missingPermission).toEqual([]);
  });

  it('should use MODULE_C_ENTITY_ACTION naming format', () => {
    const permissionPattern = /^[A-Z]+_C_[A-Z]+_[A-Z]+$/;
    const permissions = [Entity]Routes
      .map(route => route.data?.['permission'])
      .filter((x): x is string => typeof x === 'string');
    permissions.forEach(code => {
      expect(code).toMatch(permissionPattern);
    });
  });
});
```

## 6. Example Output

### File: `libs/sample/modules/product/services/product.model.ts`
```typescript
import { BaseEntity } from '@sample/services';

export const PRODUCT_CATEGORIES = [
  { value: 'ELECTRONICS', display: 'Điện tử' },
  { value: 'CLOTHING', display: 'Quần áo' },
  { value: 'FOOD', display: 'Thực phẩm' },
];

export interface ProductSaveReq {
  code?: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  isActivated?: boolean;
  fileIds?: string[];
}

export type ProductDTO = Required<ProductSaveReq> & BaseEntity;
```

### File: `libs/sample/modules/product/services/product.service.ts`
```typescript
import { Injectable, inject } from '@angular/core';
import { BaseService } from '@sample/services';
import { ProductDTO, ProductSaveReq } from './product.model';

@Injectable()
export class ProductService extends BaseService {
  readonly #api = this.register<ProductDTO, ProductSaveReq>('product');

  paging = this.#api.paging;
  search = this.#api.search;
  all = this.#api.all;
  detail = this.#api.detail;
  create = this.#api.create;
  update = this.#api.update;
  remove = this.#api.remove;
}
```

### File: `libs/sample/modules/product/pages/list/list.component.ts`
```typescript
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import {
  SdButton,
  SdPageComponent,
  SdPermissionDirective,
  SdSwitch,
  SdTable,
  SdTableCellDefDirective,
  SdTableOption,
  SdTabComponent,
} from '@sd-angular/core/components';

import { ProductDTO, PRODUCT_CATEGORIES } from '../services/product.model';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'product-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SdButton,
    SdPageComponent,
    SdTable,
    SdTableCellDefDirective,
    SdPermissionDirective,
    SdSwitch,
  ],
  template: `
    <sd-page title="Sản phẩm">
      <div class="d-flex align-items-center" role="toolbar" headerRight>
        <sd-button
          *sdPermission="'SAMPLE_C_PRODUCT_CREATE'"
          title="Tạo mới"
          aria-label="Tạo mới"
          type="fill"
          prefixIcon="add"
          (click)="onCreate()">
        </sd-button>
      </div>

      <div class="h-full p-8">
        @if (tableOption()) {
          <sd-table [option]="tableOption()!" #table autoId="sample_product">
            <ng-template sdTableCellDef="isActivated" let-item="item">
              <sd-switch [(model)]="item.isActivated" (sdChange)="onChangeIsActivated(item)"></sd-switch>
            </ng-template>
          </sd-table>
        }
      </div>
    </sd-page>
  `,
})
@SdTabComponent({
  component: ListComponent,
  name: 'Sản phẩm',
  color: 'primary',
})
export class ListComponent implements OnInit {
  @ViewChild(SdTable) table!: SdTable<ProductDTO>;

  readonly #router = inject(Router);
  readonly #productService = inject(ProductService);

  readonly tableOption = signal<SdTableOption<ProductDTO> | null>(null);

  ngOnInit(): void {
    this.tableOption.set({
      key: 'sample-product-list',
      type: 'server',
      reload: { visible: true },
      config: { visible: true },
      items: async (_, pagingRequest) => this.#productService.paging(pagingRequest),
      columns: [
        {
          title: 'Mã',
          field: 'code',
          type: 'string',
          width: '120px',
          click: (_value, row) => this.#onDetail(row.id),
        },
        {
          title: 'Tên',
          field: 'name',
          type: 'string',
          width: '250px',
        },
        {
          title: 'Giá',
          field: 'price',
          type: 'number',
          width: '120px',
        },
        {
          title: 'Tồn kho',
          field: 'stock',
          type: 'number',
          width: '120px',
        },
        {
          title: 'Danh mục',
          field: 'category',
          type: 'values',
          option: {
            items: PRODUCT_CATEGORIES,
            valueField: 'value',
            displayField: 'display',
          },
          width: '150px',
        },
        {
          title: 'Trạng thái',
          field: 'isActivated',
          type: 'boolean',
          option: { displayOnTrue: 'Hoạt động', displayOnFalse: 'Khóa' },
          width: '120px',
        },
      ],
    });
  }

  onCreate(): void {
    this.#router.navigate(['create']);
  }

  async onChangeIsActivated(item: ProductDTO): Promise<void> {
    await this.#productService.update(item.id, { isActivated: item.isActivated } as any);
    this.table.reload();
  }

  #onDetail(id: string): void {
    this.#router.navigate(['detail', id]);
  }
}
```

### File: `libs/sample/modules/product/pages/detail/detail.component.ts`
```typescript
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  SdButton,
  SdInput,
  SdInputNumber,
  SdPageComponent,
  SdPermissionDirective,
  SdSection,
  SdSelect,
  SdSwitch,
  SdTextarea,
  SdUploadFile,
} from '@sd-angular/core/components';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductDTO, ProductSaveReq, PRODUCT_CATEGORIES } from '../services/product.model';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'product-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    SdButton,
    SdInput,
    SdInputNumber,
    SdPageComponent,
    SdPermissionDirective,
    SdSection,
    SdSelect,
    SdSwitch,
    SdTextarea,
    SdUploadFile,
  ],
  template: `
    <sd-page [title]="pageTitle()">
      <div class="d-flex gap-8" role="toolbar" headerRight>
        @if (state() === 'UPDATE') {
          <sd-button
            *sdPermission="'SAMPLE_C_PRODUCT_DELETE'"
            title="Xóa"
            aria-label="Xóa"
            type="fill"
            color="error"
            prefixIcon="delete"
            (click)="onDelete()">
          </sd-button>
        }
        @if (state() === 'CREATE' || state() === 'UPDATE') {
          <sd-button
            title="Lưu"
            aria-label="Lưu"
            type="fill"
            prefixIcon="save"
            (click)="onSave()">
          </sd-button>
        }
        <sd-button
          title="Quay lại"
          aria-label="Quay lại"
          type="outline"
          prefixIcon="arrow_back"
          (click)="onBack()">
        </sd-button>
      </div>

      <div class="p-8">
        <sd-section>
          <sd-input
            label="Mã"
            [model]="entity().code"
            (modelChange)="onEntityFieldChange('code', $event)"
            [form]="form"
            required
            maxlength="32"
            [viewed]="isDetail()">
          </sd-input>

          <sd-input
            label="Tên"
            [model]="entity().name"
            (modelChange)="onEntityFieldChange('name', $event)"
            [form]="form"
            required
            maxlength="255"
            [viewed]="isDetail()">
          </sd-input>

          <sd-textarea
            label="Mô tả"
            [model]="entity().description"
            (modelChange)="onEntityFieldChange('description', $event)"
            [form]="form"
            maxlength="1000"
            [viewed]="isDetail()">
          </sd-textarea>

          <sd-input-number
            label="Giá"
            [model]="entity().price"
            (modelChange)="onEntityFieldChange('price', $event)"
            [form]="form"
            required
            [viewed]="isDetail()">
          </sd-input-number>

          <sd-input-number
            label="Tồn kho"
            [model]="entity().stock"
            (modelChange)="onEntityFieldChange('stock', $event)"
            [form]="form"
            required
            [viewed]="isDetail()">
          </sd-input-number>

          <sd-select
            label="Danh mục"
            [model]="entity().category"
            (modelChange)="onEntityFieldChange('category', $event)"
            [form]="form"
            required
            [items]="PRODUCT_CATEGORIES"
            valueField="value"
            displayField="display"
            [viewed]="isDetail()">
          </sd-select>

          <sd-switch
            label="Hoạt động"
            [model]="entity().isActivated"
            (modelChange)="onEntityFieldChange('isActivated', $event)"
            [form]="form"
            [viewed]="isDetail()">
          </sd-switch>

          @if (!isDetail()) {
            <sd-upload-file
              label="Hình ảnh sản phẩm"
              #uploadFiles
              multiple>
            </sd-upload-file>
          }
        </sd-section>
      </div>
    </sd-page>
  `,
})
export class DetailComponent implements OnInit {
  form = new FormGroup({});
  readonly state = signal<'CREATE' | 'UPDATE' | 'DETAIL'>('CREATE');
  readonly entity = signal<Partial<ProductSaveReq>>({});
  readonly pageTitle = computed(() => {
    if (this.state() === 'CREATE') return 'Tạo sản phẩm';
    return this.state() === 'DETAIL' ? 'Chi tiết sản phẩm' : 'Cập nhật sản phẩm';
  });
  readonly isDetail = computed(() => this.state() === 'DETAIL');
  readonly PRODUCT_CATEGORIES = PRODUCT_CATEGORIES;

  @ViewChild('uploadFiles') uploadFiles!: SdUploadFile;

  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #productService = inject(ProductService);

  ngOnInit(): void {
    const url = this.#router.url;
    const id = this.#activatedRoute.snapshot.paramMap.get('id');

    if (url.includes('update') && id) {
      this.state.set('UPDATE');
      this.#detail(id);
    } else if (url.includes('detail') && id) {
      this.state.set('DETAIL');
      this.#detail(id);
    } else {
      this.state.set('CREATE');
    }
  }

  onEntityFieldChange<K extends keyof ProductSaveReq>(key: K, value: ProductSaveReq[K]): void {
    this.entity.update(prev => ({ ...prev, [key]: value }));
  }

  async onSave(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.uploadFiles?.getUploadedFileInfos?.()?.length) {
      const fileIds = await Promise.all(
        this.uploadFiles.getUploadedFileInfos().map((f: any) => f.upload())
      );
      this.entity.update(prev => ({ ...prev, fileIds: fileIds.filter(Boolean) }));
    }

    try {
      const currentEntity = this.entity();

      if (currentEntity.id) {
        await this.#productService.update(currentEntity.id, currentEntity);
      } else {
        const newEntity = await this.#productService.create(currentEntity);
        this.entity.set(newEntity);
        this.state.set('UPDATE');
      }
      this.#router.navigate(['..'], { relativeTo: this.#activatedRoute });
    } catch (error) {
      console.error(error);
    }
  }

  async onDelete(): Promise<void> {
    const currentEntity = this.entity();

    if (confirm('Bạn có chắc muốn xóa?') && currentEntity.id) {
      try {
        await this.#productService.remove(currentEntity.id);
        this.#router.navigate(['..'], { relativeTo: this.#activatedRoute });
      } catch (error) {
        console.error(error);
      }
    }
  }

  onBack(): void {
    this.#router.navigate(['..'], { relativeTo: this.#activatedRoute });
  }

  async #detail(id: string): Promise<void> {
    try {
      this.entity.set(await this.#productService.detail(id));
    } catch (error) {
      console.error(error);
    }
  }
}
```

---

## Implementation Checklist

- [ ] Create model file with SaveReq interface and DTO type
- [ ] Create `services/[entity].mock-data.ts` with 20–40 domain-realistic seed rows immediately after SaveReq/DTO are finalized
- [ ] Create service with mock-first CRUD (`localStorage`) by default; use BaseService/API mode only when backend contract is explicit
- [ ] Create list component with @SdTabComponent decorator
- [ ] Create detail component with 3-state machine
- [ ] Define route configuration with lazy loading
- [ ] Export all from barrel index.ts
- [ ] Set service provider scope correctly (default `providedIn: 'root'` for mock/root usage, or module/route scope only when intentionally required)
- [ ] Test CREATE/UPDATE/DETAIL flows
- [ ] Validate form before save
- [ ] Test file upload functionality
- [ ] Test permission directives
- [ ] Test server-side pagination
