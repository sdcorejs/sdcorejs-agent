# Entity Skeleton Templates — init-entity (sdcorejs-angular)

This file holds the canonical Angular code templates the init-entity reference pack ([`init-entity.md`](../write-code/init-entity.md), loaded on demand by the `sdcorejs-angular` orchestrator) generates. The pack picks which template to use based on the chosen layout variant; the actual code lives here so the pack stays concise.

## Contents
- Preconditions
- Detail Layout Variant Template
- Anchor Activation Heuristic
- Permission Keyed Route Template (2 Components + URL States)
- Permission Directive Template
- Test Coverage Selection
- Detail UI Mode Selection
- Workflow Extension Points
- Detail UI Pattern Selection
- Side-drawer Project Structure
- Full-page Project Structure
- `[entity].model.ts`
- `[entity].service.ts`
- `components/[entity]-select/[entity]-select.component.ts`
- `list.component.ts` — page variant
- `list.component.ts` — side-drawer variant
- `routes.ts` — side-drawer variant
- `detail.component.ts` — UnifiedCompact
- `[entity].routes.spec.ts` — Permission Validation
- `index.ts` — barrel export
- `detail.component.ts` — AdaptiveSplitDetail variant

---

### Preconditions
```text
Required before applying this skill:
- module name is known
- module exists, or the agent has already created it
- entity name is known
- minimum display fields are known: code, name, status or equivalent
- default test coverage = `standard` (write specs RED-first, no question; override to minimal/full only on explicit request)

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
    <sd-anchor ellipsis>
      <sd-anchor-item title="Thông tin chung">
        <sd-section title="Thông tin chung" noPaddingBody collapsable> ...editable fields... </sd-section>
      </sd-anchor-item>
      <sd-anchor-item title="Rổ hàng">
        <sd-section title="Rổ hàng" collapsable> ...table/actions... </sd-section>
      </sd-anchor-item>
    </sd-anchor>
  }
</sd-page>
```

### Anchor Activation Heuristic
```text
Enable sd-anchor when one of these is true:
- form has >= 12 fields, or
- form has >= 3 business sections, or
- page includes at least one large child table/upload block plus other sections

If none match, keep regular section layout without anchor.
```

### Permission Keyed Route Template (2 Components + URL States)
```typescript
// Permission codes shown use the scaffold default convention `<MODULE>_<ENTITY>_<ACTION>`.
// Substitute the project's actual convention if it differs (e.g. `<MODULE>_C_<ENTITY>_<ACTION>`).
export const [entity]Routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/list/list.component').then(m => m.ListComponent),
        data: {
          permission: '[MODULE]_[ENTITY]_LIST',
          permissionKey: '[module]',
        },
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: {
          permission: '[MODULE]_[ENTITY]_CREATE',
          permissionKey: '[module]',
        },
      },
      {
        path: 'update/:id',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: {
          permission: '[MODULE]_[ENTITY]_UPDATE',
          permissionKey: '[module]',
        },
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
        data: {
          permission: '[MODULE]_[ENTITY]_DETAIL',
          permissionKey: '[module]',
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
  *sdPermission="'[MODULE]_[ENTITY]_CREATE'; sdPermissionKey: '[module]'"
  mat-flat-button
  color="primary"
>
  Thêm mới
</button>

<!-- Default key (undefined) -->
<button *sdPermission="'[MODULE]_[ENTITY]_EXPORT'" mat-stroked-button>
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
   - Starter reference: core/templates/angular-starter/src/libs/sample/features/product

2. UnifiedCompact  (full page, same layout for CREATE/UPDATE/DETAIL)
   - Sub-routes: list + create + detail/:id + update/:id
   - Same component handles all 3 states via [viewed]="state === 'DETAIL'"
   - Starter reference: core/templates/angular-starter/src/libs/sample/features/employee

3. AdaptiveSplitDetail  (full page, DETAIL differs from CREATE/UPDATE)
   - Sub-routes: list + create + detail/:id + update/:id
   - DETAIL renders sd-section + sd-section-item (read-only label-value pairs)
   - CREATE/UPDATE renders editable sd-input / sd-select / sd-textarea
   - Import SdSectionItem from `<CORE_UI_PACKAGE_NAME>/components/section`
   - Starter reference: core/templates/angular-starter/src/libs/sample/features/department
```

### Side-drawer Project Structure
```
libs/[module]/
├── components/                           # MODULE-LEVEL shared components (one copy, reused everywhere)
│   ├── base-select/                      # Generic dropdown wrapper — generated by the init-module pack
│   │   ├── base-select.component.ts
│   │   └── base-select.component.html
│   └── [entity]-select/                  # Per-entity wrapper around base-select — generated by the init-entity pack
│       └── [entity]-select.component.ts
│
└── features/[entity]/
  ├── routes.ts                     # Only list route, no create/update/detail sub-routes
  ├── routes.spec.ts
  ├── components/
  │   └── detail-side-drawer/
  │       ├── detail-side-drawer.component.spec.ts
  │       └── detail-side-drawer.component.ts
  ├── pages/
  │   └── list/
  │       ├── list.component.spec.ts
  │       └── list.component.ts    # Contains embedded <sd-side-drawer>
  ├── services/
  │   ├── [entity].model.ts
  │   └── [entity].service.ts
  └── index.ts
```

> **Where does `[entity]-select` live?** Always at MODULE level (`libs/[module]/components/[entity]-select/`), NEVER inside `features/[entity]/components/`. The whole point of the entity-select is reuse across entity forms — e.g. `order` form uses `<customer-select>` and `<project-select>`. If `[entity]-select` lived inside its own feature folder, every importer would need a deep relative path and the lib boundary becomes ambiguous.

### Full-page Project Structure (UnifiedCompact / AdaptiveSplitDetail)
```
libs/[module]/
└── features/[entity]/
  ├── routes.ts
  ├── routes.spec.ts
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

// Save request — public Service input contract used for BOTH create + update.
// In scaffold mode, single SaveReq covers both POST and PUT. If the raw API
// differs, the Service maps SaveReq to an internal API payload before sending.
export interface [Entity]SaveReq {
  code?: string;
  name?: string;
  description?: string;
  // Add other editable fields
  isActivated?: boolean;
  fileIds?: string[];
}

// DTO — public Service output contract used for BOTH list rows and detail response.
// Required<SaveReq> is only the scaffold default: every editable field is
// non-optional in the Service response, and BaseEntity adds audit fields
// (id, createdAt, createdBy, updatedAt, updatedBy). When a real backend returns
// a different raw shape, define an internal [Entity]ApiRes in the Service and
// map it into this DTO before exposing it to components.
export type [Entity]DTO = Required<[Entity]SaveReq> & BaseEntity;

// Do not add screen-only fields such as checked, selected, expanded, children,
// disabled, label, or displayName here unless the Service mapper derives and
// guarantees them. Prefer a component-local [Entity]RowVM / TreeNodeVM instead.

// ──────────────────────────────────────────────────────────────────
// Optional — only when business needs diverge from the default
// ──────────────────────────────────────────────────────────────────

// Variant A: split SaveReq when create / update / import have different shapes.
// export interface [Entity]CreateReq { /* POST /create payload */ }
// export interface [Entity]UpdateReq { /* PUT /:id payload — may omit immutable fields */ }
// export interface [Entity]ImportReq { /* POST /import row payload */ }

// Variant B: workflow action payloads use convention `<Entity><Action>Req`.
// export interface [Entity]ApproveReq { note?: string; }
// export interface [Entity]CancelReq  { reason: string; }
// export interface [Entity]RejectReq  { reason: string; }
```

### [entity].service.ts
```typescript
import { Injectable, inject } from '@angular/core';
import { BaseService } from '@[module]/services';
import { [Entity]DTO, [Entity]SaveReq } from './[entity].model';

@Injectable({ providedIn: 'root' })
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

  // If the backend API does not match [Entity]DTO / [Entity]SaveReq exactly,
  // keep raw API types private to this file and map at the Service boundary:
  // type [Entity]ApiRes = { api_id: string; api_name: string; ... };
  // private mapFromApi(raw: [Entity]ApiRes): [Entity]DTO { ... }
}
```

### components/[entity]-select/[entity]-select.component.ts

A thin wrapper around `base-select` (defined at the module level, see [`init-module.md`](../write-code/init-module.md)). One per entity. Lives in `libs/<module>/components/<entity>-select/` so it can be reused by ANY entity form in ANY module that imports it — e.g. the order form has a `<customer-select>` and a `<project-select>` without re-declaring sd-select boilerplate.

**Scaffold rule for `url`:**
- Default scaffold uses `url="[entity]"` — agent should NOT hardcode `v1/` or any version prefix.
- When generating for a real project, read the actual API convention from the existing module's service files (e.g. `BaseService.register('v1/booking')` in `portal-agency`) and substitute the matching prefix.
- The skill's job is to produce the wrapper; the URL prefix is project-specific.

```typescript
import { CommonModule } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseSelectComponent } from '@[module]/components';
import { [Entity]DTO } from '@[module]/services';
import { SdFilter } from '<CORE_UI_PACKAGE_NAME>/utilities';

/**
 * Reusable [Entity] dropdown.
 *
 * Usage from any form in any module:
 *   <[entity]-select
 *     [(model)]="form.value.[entity]Id"
 *     [form]="form"
 *     [filters]="[{ field: 'someField', operator: 'EQUAL', data: someValue }]"
 *   />
 *
 * Built-in business filters (e.g. `status = ACTIVE`) are added via
 * `combinedFilters` so callers don't have to remember them every time.
 */
@Component({
  selector: '[entity]-select',
  imports: [CommonModule, BaseSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  template: `
    <base-select
      url="[entity]"
      [mode]="mode()"
      [label]="label()"
      [model]="valueModel()"
      (modelChange)="onModelChange($event)"
      (sdSelection)="onSelection($event)"
      [autoId]="autoId()"
      [form]="form()"
      [name]="name() || autoId()"
      [valueField]="valueField()"
      [displayField]="displayField()"
      [disabled]="disabled()"
      [viewed]="viewed()"
      [required]="required()"
      [multiple]="multiple()"
      [hideInlineError]="hideInlineError()"
      [filters]="combinedFilters()">
    </base-select>
  `,
})
export class [Entity]SelectComponent {
  // ──────────────────────────────────────────────────────────────────
  // 1. INPUTS
  // ──────────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form = input<FormGroup<any>>();
  label = input<string>('[Entity Display Label]');   // VI label by default
  mode = input<'search' | 'all'>('all');             // 'all' is fine for small lookup tables; switch to 'search' for big ones
  name = input<string>('');
  autoId = input<string>('[entity]-select');

  // Caller can override defaults if the entity uses different fields.
  valueField = input<string>('id');
  displayField = input<string>('name');              // adjust to whatever this entity uses as the human-readable label

  // booleanAttribute lets the bare HTML attribute form work (`required` ⇒ true).
  disabled = input(false, { transform: booleanAttribute });
  viewed = input(false, { transform: booleanAttribute });
  multiple = input(false, { transform: booleanAttribute });
  required = input(false, { transform: booleanAttribute });
  hideInlineError = input(false, { transform: booleanAttribute });

  /** Extra filters from the caller — merged with the entity-specific defaults below. */
  filters = input<SdFilter[]>([]);

  // ──────────────────────────────────────────────────────────────────
  // 2. MODEL & OUTPUTS
  // ──────────────────────────────────────────────────────────────────
  valueModel = model<string | string[] | null | undefined>(undefined, { alias: 'model' });
  sdChange = output<string | string[] | null | undefined>();
  sdSelection = output<[Entity]DTO[]>();

  // ──────────────────────────────────────────────────────────────────
  // 3. COMPUTED — merge caller filters with entity defaults.
  //
  // Why `computed` and not a plain method:
  // - Methods called from templates re-execute on every change detection
  //   tick. A computed memoises and only re-runs when `filters()` changes.
  // - Array-reference matters for sd-select's cacheChecksum: a new array
  //   each tick would invalidate the cache constantly.
  // ──────────────────────────────────────────────────────────────────
  combinedFilters = computed<SdFilter[]>(() => {
    const customFilters = this.filters() ?? [];
    return [
      ...customFilters,
      // Entity-specific default(s): e.g. only show ACTIVE rows.
      // Adjust or remove if this entity doesn't have a status field.
      { field: 'status', operator: 'EQUAL', data: 'ACTIVE' },
    ];
  });

  // ──────────────────────────────────────────────────────────────────
  // 4. HANDLERS
  // ──────────────────────────────────────────────────────────────────
  onModelChange = (val: string | string[] | null | undefined) => {
    this.valueModel.set(val);
    this.sdChange.emit(val);
  };

  onSelection = (items: [Entity]DTO[]) => {
    this.sdSelection.emit(items);
  };
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
} from '<CORE_UI_PACKAGE_NAME>/components';

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
          *sdPermission="'[MODULE]_[ENTITY]_CREATE'"
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
          // EXAMPLE filter — replace with the entity's actual business filters
          // (or remove if the list has none). The `required: true` + empty
          // result on missing value pattern is what we want to keep; the
          // `projectId / 'P001 - Sample Project'` shape is placeholder data.
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
        // Audit columns — mandatory on every primary list page. Check the
        // actual DTO/BaseEntity field names (Spring uses `createdDate`, .NET
        // `CreatedDate`, Django `created_at`, etc.) and adjust if needed.
        { title: 'Ngày tạo', field: 'createdAt', type: 'datetime', width: '180px' },
        { title: 'Người tạo', field: 'createdBy', type: 'string', minWidth: '180px' },
        { title: 'Ngày cập nhật', field: 'updatedAt', type: 'datetime', width: '180px' },
        { title: 'Người cập nhật', field: 'updatedBy', type: 'string', minWidth: '180px' },
      ],
    });
  }

  onCreate(): void {
    this.#router.navigate(['create']);
  }

  async onChangeIsActivated(item: [Entity]DTO): Promise<void> {
    // All [Entity]SaveReq fields are optional (`?`), so a partial payload is type-safe.
    await this.#[entity]Service.update(item.id, { isActivated: item.isActivated });
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
// Reference: core/templates/angular-starter/src/libs/sample/features/product/pages/list/list.component.ts

import { ChangeDetectionStrategy, Component, OnInit, ViewChild, computed, inject, signal, viewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { SdButton, SdSection, SdTabComponent, SdTabelCellDefDirective, SdTable, SdTableOption } from '<CORE_UI_PACKAGE_NAME>/components';
import { SdSideDrawer } from '<CORE_UI_PACKAGE_NAME>/components/side-drawer';
import { SdInput, SdInputNumber, SdSelect, SdSwitch, SdTextarea } from '<CORE_UI_PACKAGE_NAME>/forms';
import { SdPageComponent, SdPermissionDirective } from '<CORE_UI_PACKAGE_NAME>/modules';
import { SdConfirmService, SdLoadingService, SdNotifyService } from '<CORE_UI_PACKAGE_NAME>/services';

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
          *sdPermission="'[MODULE]_[ENTITY]_CREATE'; sdPermissionKey: '[module]'"
          title="Tạo mới" type="fill" prefixIcon="add" color="primary"
          (click)="onOpenCreate()">
        </sd-button>
      </div>
      <div class="h-full p-8">
        @if (tableOption(); as opt) {
          <sd-table [option]="opt" #table autoId="[module]_[entity]">
            <ng-template sdTableCellDef="isActivated" let-item="item">
              <sd-switch class="d-block text-center"
                [(model)]="item.isActivated" (sdChange)="onChangeIsActivated(item)"></sd-switch>
            </ng-template>
          </sd-table>
        }
      </div>
    </sd-page>

    <!-- Side-drawer: handles CREATE / UPDATE / DETAIL inline, no sub-routes needed -->
    @let _drawerState = drawerState();
    <sd-side-drawer #drawer [title]="drawerTitle()" width="480px">
      <div class="p-16">
        <sd-section title="Thông tin chung" noPaddingBody>
          <div class="row row-sm mx-0 pt-8">
            <!-- Add form fields here with [viewed]="_drawerState === 'DETAIL'" -->
            <div class="col-12">
              <sd-input label="Mã"
                [model]="drawerEntity().code"
                (modelChange)="onDrawerFieldChange('code', $event)"
                [form]="drawerForm" required
                [viewed]="_drawerState === 'DETAIL'"></sd-input>
            </div>
            <div class="col-12">
              <sd-input label="Tên"
                [model]="drawerEntity().name"
                (modelChange)="onDrawerFieldChange('name', $event)"
                [form]="drawerForm" required
                [viewed]="_drawerState === 'DETAIL'"></sd-input>
            </div>
          </div>
        </sd-section>

        <div class="d-flex justify-content-end gap-8 mt-16">
          @if (_drawerState === 'DETAIL') {
            <sd-button *sdPermission="'[MODULE]_[ENTITY]_UPDATE'; sdPermissionKey: '[module]'"
              title="Cập nhật" type="fill" prefixIcon="edit" color="primary"
              (click)="onDrawerEdit()"></sd-button>
          } @else {
            <sd-button title="Hủy" (click)="drawer.close()"></sd-button>
            <sd-button title="Lưu" type="fill" prefixIcon="save" color="primary"
              [loading]="drawerSaving()" (click)="onDrawerSave()"></sd-button>
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

  readonly tableOption = signal<SdTableOption<[Entity]DTO> | null>(null);
  drawerForm = new FormGroup({});
  readonly drawerSaving = signal(false);
  readonly drawerEntity = signal<Partial<[Entity]SaveReq & { id?: string }>>({});
  readonly drawerState = signal<'CREATE' | 'UPDATE' | 'DETAIL'>('CREATE');
  readonly drawerTitle = computed(() => {
    const s = this.drawerState();
    if (s === 'CREATE') return 'Tạo mới [entity label]';
    if (s === 'UPDATE') return 'Cập nhật [entity label]';
    return 'Chi tiết [entity label]';
  });

  ngOnInit(): void {
    this.tableOption.set({
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
    });
  }

  onOpenCreate = () => {
    this.drawerState.set('CREATE');
    this.drawerEntity.set({});
    this.drawerForm.reset();
    this.#drawer().open();
  };

  #onOpenDetail = (row: [Entity]DTO) => {
    this.drawerState.set('DETAIL');
    this.drawerEntity.set({ ...row });
    this.#drawer().open();
  };

  onDrawerEdit = () => { this.drawerState.set('UPDATE'); };

  onDrawerFieldChange<K extends keyof [Entity]SaveReq>(key: K, value: [Entity]SaveReq[K]): void {
    this.drawerEntity.update(prev => ({ ...prev, [key]: value }));
  }

  onDrawerSave = async () => {
    if (this.drawerForm.invalid) { this.drawerForm.markAllAsTouched(); return; }
    this.drawerSaving.set(true);
    try {
      const current = this.drawerEntity();
      if (current.id) {
        await this.#[entity]Service.update(current.id, current);
        this.#notifyService.success('Cập nhật [entity label] thành công');
      } else {
        await this.#[entity]Service.create(current);
        this.#notifyService.success('Tạo mới [entity label] thành công');
      }
      this.#drawer().close();
      this.table.reload();
    } finally { this.drawerSaving.set(false); }
  };

  #onRemove = (ids: string[]) => {
    this.#loadingService.start();
    this.#[entity]Service.remove(ids)
      .then(() => { this.#notifyService.success('Xóa [entity label] thành công'); this.table.reload(); })
      .finally(() => this.#loadingService.stop());
  };

  onChangeIsActivated = (row: [Entity]DTO) => {
    this.#[entity]Service.update(row.id, { isActivated: row.isActivated }).catch(console.error);
  };
}
```

### routes.ts (Side-drawer variant — list only, no sub-routes)
```typescript
export const [entity]Routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/list/list.component').then(m => m.ListComponent),
        data: { permission: '[MODULE]_[ENTITY]_LIST', permissionKey: '[module]' },
      },
    ],
  },
];
```
> No `providers: [<Entity>Service]` on the route — `[Entity]Service` is `@Injectable({ providedIn: 'root' })` so DI resolves at the root injector. Route-level providers were the old pattern.

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
} from '<CORE_UI_PACKAGE_NAME>/components';
import { SdConfirmService } from '<CORE_UI_PACKAGE_NAME>/services';
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
  readonly #confirmService = inject(SdConfirmService);
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
    if (!currentEntity.id) return;

    try {
      await this.#confirmService.confirm('Bạn có chắc muốn xóa?');
    } catch {
      // User cancelled — SdConfirmService rejects on cancel.
      return;
    }

    try {
      await this.#[entity]Service.remove(currentEntity.id);
      this.#router.navigate(['..'], { relativeTo: this.#activatedRoute });
    } catch (error) {
      console.error(error);
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


### [entity].routes.spec.ts (Permission Validation)
```text
ALWAYS generate this spec file—it validates permission codes on routes (not UI-dependent).

Generation instructions:
- Use template from Section 5 "[module]-[entity].routes.spec.ts"
- Replace [Entity] and [entity] with actual names
- Test must verify:
  1. Every route has a data.permission property
  2. All permission codes follow the project's chosen convention (Module → Entity → Action order, single consistent shape)
  3. No route is left without permission guard

Example route spec test (uses scaffold default convention; substitute `_C_` etc. when the project uses a different shape):
- Route '' (list) → permission 'PRICING_PRICE_LIST'
- Route 'create' → permission 'PRICING_PRICE_CREATE'
- Route 'detail/:id' → permission 'PRICING_PRICE_DETAIL'
- Route 'update/:id' → permission 'PRICING_PRICE_UPDATE'

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
// Reference: core/templates/angular-starter/src/libs/sample/features/department/pages/detail/detail.component.ts

import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { SdButton, SdSection, SdTabComponent } from '<CORE_UI_PACKAGE_NAME>/components';
import { SdSectionItem } from '<CORE_UI_PACKAGE_NAME>/components/section';
import { SdInput, SdSelect, SdTextarea } from '<CORE_UI_PACKAGE_NAME>/forms';
import { SdPageComponent } from '<CORE_UI_PACKAGE_NAME>/modules';
import { SdLoadingService, SdNotifyService } from '<CORE_UI_PACKAGE_NAME>/services';

import { [Entity]DTO, [Entity]SaveReq } from '../../services/[entity].model';
import { [Entity]Service } from '../../services/[entity].service';

@Component({
  selector: '[entity]-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SdInput, SdSelect, SdTextarea, SdButton, SdSection, SdSectionItem, SdPageComponent],
  template: `
    @let _state = state();
    @let _entity = entity();
    <sd-page [title]="title()">
      <div class="d-flex align-items-center" style="gap: 8px" headerRight>
        <sd-button title="Quay lại" prefixIcon="replay" (click)="onBack()"></sd-button>
        @if (_state === 'DETAIL') {
          <sd-button title="Cập nhật" type="fill" prefixIcon="edit" color="primary" (click)="onUpdate()"></sd-button>
        } @else {
          <sd-button title="Lưu" type="fill" prefixIcon="save" color="primary" (click)="onSave()" [loading]="saving()"></sd-button>
        }
      </div>

      <div class="h-full p-8">
        @if (_state === 'DETAIL') {
          <!-- AdaptiveSplitDetail: read-only label-value layout -->
          <sd-section title="Thông tin chung" collapsable>
            <sd-section-item label="Mã" labelWidth="120px">{{ _entity.code }}</sd-section-item>
            <sd-section-item label="Tên" labelWidth="120px">{{ _entity.name }}</sd-section-item>
            <!-- Add more sd-section-item for each read-only field -->
          </sd-section>
        } @else {
          <!-- CREATE / UPDATE: editable form -->
          <sd-section title="Thông tin chung">
            <div class="row row-sm mx-0">
              <div class="col-6">
                <sd-input label="Mã"
                  [model]="_entity.code"
                  (modelChange)="onFieldChange('code', $event)"
                  [form]="form" required maxlength="32"></sd-input>
              </div>
              <div class="col-6">
                <sd-input label="Tên"
                  [model]="_entity.name"
                  (modelChange)="onFieldChange('name', $event)"
                  [form]="form" required></sd-input>
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
  readonly saving = signal(false);
  readonly entity = signal<Partial<[Entity]DTO>>({});
  readonly id = signal<string>('');
  readonly state = signal<'CREATE' | 'UPDATE' | 'DETAIL'>('CREATE');
  readonly title = computed(() => {
    const s = this.state();
    if (s === 'CREATE') return 'Tạo mới [entity label]';
    if (s === 'UPDATE') return 'Cập nhật [entity label]';
    return 'Chi tiết [entity label]';
  });

  ngOnInit() {
    const paramId = this.#route.snapshot.params?.['id'] ?? '';
    this.id.set(paramId);

    const url = this.#router.url;
    if (url.includes('update')) this.state.set('UPDATE');
    else if (url.includes('detail')) this.state.set('DETAIL');
    else this.state.set('CREATE');

    if (paramId) this.#loadDetail(paramId);
  }

  onFieldChange<K extends keyof [Entity]SaveReq>(key: K, value: [Entity]SaveReq[K]): void {
    this.entity.update(prev => ({ ...prev, [key]: value }));
  }

  #loadDetail = (id: string) => {
    this.#loadingService.start();
    this.#[entity]Service.detail(id)
      .then(e => this.entity.set(e))
      .finally(() => this.#loadingService.stop());
  };

  onBack = () => {
    const path = this.state() === 'CREATE' ? ['../'] : ['../../'];
    this.#router.navigate(path, { relativeTo: this.#route, state: { replaceTab: true } });
  };

  onUpdate = () => {
    this.#router.navigate(['../../update', this.id()], { relativeTo: this.#route, state: { replaceTab: true } });
  };

  onSave = async () => {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    try {
      const current = this.entity();
      if (current.id) {
        await this.#[entity]Service.update(current.id, current);
        this.#notifyService.success('Cập nhật [entity label] thành công');
        this.#loadDetail(this.id());
      } else {
        const created = await this.#[entity]Service.create(current);
        this.#notifyService.success('Tạo mới [entity label] thành công');
        this.#router.navigate(['../detail', created.id], { relativeTo: this.#route, state: { replaceTab: true } });
      }
    } finally { this.saving.set(false); }
  };
}
```
