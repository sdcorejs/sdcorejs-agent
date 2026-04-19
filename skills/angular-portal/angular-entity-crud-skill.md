# Angular Skill: Entity CRUD Module

## 1. Skill Name
**Entity CRUD Module Generation**

## 2. Description
Generates a complete entity management module following sdcorejs architecture patterns. Creates service layer (with BaseService integration), models/interfaces, and page components (list and detail) with full CRUD operations, reactive forms, and data tables.

This skill assumes the target feature module is already known. If the request does not specify a module, the agent must resolve that first using the request intake flow.

For common entity forms with around 5-6 fields, this skill should prefer a side-drawer detail UI before using a full page detail.

## 3. Rules

### MUST DO ✅
- Confirm target module before generating entity files
- Generate the feature module first if it does not exist
- Extend `BaseService` for entity services
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
- Add `data: { permission: '<CODE>' }` to every route entry using the standard permission code format; the module guard reads this to block unauthorized navigation automatically
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
- Ensure interactive elements exposed to users have accessible text: use `title` or `aria-label` on buttons/actions so screen readers can describe them; use semantic HTML where possible (`<nav>`, `<main>`, `role="toolbar"`)
- Generate a companion `*.spec.ts` skeleton alongside every new list and detail component; use Arrange-Act-Assert pattern; the skeleton must at minimum assert the component creates successfully:
  ```typescript
  describe('ListComponent', () => {
    it('should create', () => { expect(component).toBeTruthy(); });
  });
  ```
- Reserve extension points for workflow actions in both list and detail

### MUST NOT ❌
- Guess the module silently when module ownership is ambiguous
- Mix standalone and NgModule approaches
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
- Duplicate route-level permission guard as in-component `canViewList` / `canCreate` checks
- Use constructor injection; always use `inject()` function instead
- Omit `changeDetection: ChangeDetectionStrategy.OnPush` from list/detail component declarations
- Reorder imports arbitrarily; always follow the 5-group import order convention
- Generate mutable UI state as plain class fields/getters when `signal()`/`computed()` can represent that state
- Use `effect()` for pure derivations that should be `computed()`
- Omit the 4 audit columns from primary list pages unless an explicit skip condition applies
- Hard-code audit field names without inspecting the DTO definition

## 4. Template

### Preconditions
```text
Required before applying this skill:
- module name is known
- module exists, or the agent has already created it
- entity name is known
- minimum display fields are known: code, name, status or equivalent
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

### Project Structure
```
libs/[module]/
└── modules/[entity]/
  ├── [entity].routes.ts
  ├── pages/
  │   ├── list/
  │   │   └── list.component.ts
  │   └── detail/
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

### list.component.spec.ts (skeleton)
```typescript
// Arrange-Act-Assert pattern — expand with domain-specific scenarios
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListComponent } from './list.component';

describe('ListComponent', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
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

### index.ts (Barrel Export)
```typescript
export * from './[entity].routes';
export { ListComponent } from './pages/list/list.component';
export { DetailComponent } from './pages/detail/detail.component';
export { [Entity]Service } from './services/[entity].service';
export * from './services/[entity].model';
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
- [ ] Create service extending BaseService
- [ ] Create list component with @SdTabComponent decorator
- [ ] Create detail component with 3-state machine
- [ ] Define route configuration with lazy loading
- [ ] Export all from barrel index.ts
- [ ] Add service to route providers (NOT root)
- [ ] Test CREATE/UPDATE/DETAIL flows
- [ ] Validate form before save
- [ ] Test file upload functionality
- [ ] Test permission directives
- [ ] Test server-side pagination
