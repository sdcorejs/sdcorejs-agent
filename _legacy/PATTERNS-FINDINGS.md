# sdcorejs Angular Architecture Patterns - Exploration Findings

**Date**: April 18, 2026  
**Scope**: vn-angular (library), portal-template (application)  
**Focus**: Feature modules, components, services, forms, and routing patterns

---

## 1. PROJECT STRUCTURE OVERVIEW

### Portal-Template Organization
```
portal-template/src/
├── app/                          # Root application
│   ├── app.component.ts
│   ├── app.routes.ts            # Root routes with guards & providers
│   ├── components/              # App-level components (MainComponent)
│   └── configurations/          # Portal-level config implementations
├── libs/                        # Feature modules (lazy-loaded)
│   ├── sample/
│   ├── forms/
│   ├── components/
│   ├── services/
│   ├── patterns/
│   └── instructions/
└── environments/
```

### vn-Angular Library Structure
```
sd-angular/
├── components/                  # UI Components (Button, Table, Section, etc.)
│   ├── table/
│   ├── button/
│   ├── modal/
│   ├── upload-file/
│   └── ...
├── forms/                       # Form Components (Input, Select, Date, etc.)
│   ├── input/
│   ├── select/
│   ├── date/
│   ├── input-number/
│   └── ...
├── modules/                     # Feature modules (Layout, Auth, Permission)
├── services/                    # Core services (API, Cache, Notify, etc.)
├── directives/                  # Custom directives
├── pipes/                       # Custom pipes
└── utilities/                   # Helper functions & types
```

---

## 2. FEATURE MODULE STRUCTURE

### Standard Module Layout
**File Path Example**: `portal-template/src/libs/sample/`

```
sample/
├── routes.ts                   # Module routes & providers
├── index.ts                    # Module exports
├── configurations/
│   ├── sample.configuration.ts # Interface definition
│   ├── api.configuration.ts    # API interceptor config
│   └── index.ts                # Export barrel
├── guards/
│   ├── sample.guard.ts         # Route guard
│   └── index.ts
├── modules/
│   └── employee/               # Entity module
│       ├── employee.routes.ts
│       ├── pages/
│       │   ├── list/
│       │   └── detail/
│       ├── services/
│       │   ├── employee.model.ts
│       │   └── employee.service.ts
│       ├── components/         # (Optional) Reusable sub-components
│       └── index.ts
└── services/
    ├── base/
    │   ├── base.model.ts      # Base entity & register interface
    │   └── base.service.ts    # Generic CRUD service
    └── index.ts
```

### Routes Configuration Pattern

**[sample/routes.ts](portal-template/src/libs/sample/routes.ts)**
```typescript
export const sampleRoutes: Routes = [
  {
    path: '',
    canActivate: [sampleGuard],
    providers: [
      { provide: SD_API_CONFIG, useClass: ApiConfiguration, multi: true },
      { provide: SD_UPLOAD_FILE_CONFIGURATION, useClass: UploadFileConfiguration, multi: true },
    ],
    children: [
      { path: 'employee', loadChildren: () => import('@sample/modules/employee').then(m => m.employeeRoutes) },
    ],
  },
];
```

**Key Pattern**: Configuration providers injected at route level using multi-provider pattern

---

## 3. COMPONENT PATTERNS

### 3.1 Page Component Structure (List Pages)

**[sample/modules/employee/pages/list/list.component.ts](portal-template/src/libs/sample/modules/employee/pages/list/list.component.ts)**

**Architecture**:
- Standalone component with inline template
- Uses `@SdTabComponent` decorator for tab integration
- Injects services via `inject()` function
- Server-side pagination with `SdTableOption<T>`

**Key Components Used**:
- `SdPageComponent` - Main layout container
- `SdButton` - Action buttons (Create, etc.)
- `SdTable` - Data grid with pagination
- `SdSwitch` - Inline edit controls
- `SdPermissionDirective` - Permission-based visibility

**Example**:
```typescript
@Component({
  selector: 'employee-list',
  imports: [SdButton, SdTable, SdTabelCellDefDirective, SdPermissionDirective, SdSwitch, SdPageComponent],
  template: `
    <sd-page title="nhân viên">
      <div class="d-flex align-items-center" headerRight>
        <sd-button
          *sdPermission="'SAMPLE_EMPLOYEE_CREATE'"
          title="Tạo mới"
          type="fill"
          prefixIcon="add"
          (click)="onCreate()">
        </sd-button>
      </div>
      <div class="h-full p-8">
        @if (tableOption) {
          <sd-table [option]="tableOption" #table autoId="sample_employee">
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
  name: 'nhân viên',
  color: 'primary',
})
export class ListComponent implements OnInit {
  @ViewChild(SdTable) table!: SdTable<EmployeeDTO>;
  readonly #employeeService = inject(EmployeeService);
  tableOption!: SdTableOption<EmployeeDTO>;

  ngOnInit(): void {
    this.tableOption = {
      key: 'sample-employee-list',
      type: 'server',
      reload: { visible: true },
      config: { visible: true },
      items: async (_, pagingRequest) => {
        return await this.#employeeService.paging(pagingRequest);
      },
      // ... column definitions
    };
  }
}
```

### 3.2 Page Component Structure (Detail Pages)

**[sample/modules/employee/pages/detail/detail.component.ts](portal-template/src/libs/sample/modules/employee/pages/detail/detail.component.ts)**

**Architecture**:
- Handles 3 states: CREATE, UPDATE, DETAIL (read-only)
- Reactive forms with `FormGroup`
- Two-way binding with `[(model)]`
- File upload support via `SdUploadFile`

**State Machine**:
- **CREATE**: POST new entity
- **UPDATE**: GET entity, show edit form, PUT changes
- **DETAIL**: GET entity, display read-only view

**Example**:
```typescript
export class DetailComponent implements OnInit {
  form = new FormGroup({});
  state: 'CREATE' | 'UPDATE' | 'DETAIL' = 'CREATE';
  entity: Partial<EmployeeDTO> = {};
  
  ngOnInit() {
    const url = this.#router.url;
    if (url.includes('update')) {
      this.state = 'UPDATE';
      this.#detail(this.id);
    } else if (url.includes('detail')) {
      this.state = 'DETAIL';
      this.#detail(this.id);
    } else {
      this.state = 'CREATE';
    }
  }

  onSave = async () => {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.uploadFiles?.length) {
      await Promise.all(this.uploadFiles().map(f => f.upload()));
    }
    if (this.entity.id) {
      await this.#employeeService.update(this.entity.id, this.entity);
    } else {
      const newEntity = await this.#employeeService.create(this.entity);
    }
  };
}
```

### 3.3 Form Integration Pattern

**Components Used**:
```typescript
imports: [
  SdInput,           // Text input
  SdInputNumber,     // Numeric input
  SdDate,            // Date picker
  SdDatetime,        // DateTime picker
  SdSelect,          // Dropdown (static or dynamic)
  SdTextarea,        // Multi-line text
  SdUploadFile,      // File upload
  SdButton,
  SdSection,         // Fieldset grouping
  SdPageComponent
]
```

**Two-Way Binding Convention**:
```typescript
<sd-input 
  label="Mã" 
  [(model)]="entity.code"          // Two-way binding
  [form]="form"                     // FormGroup reference
  required 
  maxlength="16"
  [viewed]="state === 'DETAIL'">   // Read-only mode
</sd-input>
```

### 3.4 Table Column Definition Pattern

**[SdTableColumn Configuration](portal-template/src/libs/sample/modules/employee/pages/list/list.component.ts)**

```typescript
columns: [
  {
    title: 'Mã',
    field: 'code',
    type: 'string',
    width: '150px',
    click: (value, row) => this.#onDetail(row.id),
  },
  {
    title: 'Ngày sinh',
    field: 'birthday',
    type: 'date',
    width: '150px',
  },
  {
    title: 'Vai trò',
    field: 'role',
    type: 'values',
    option: {
      items: EMPLOYEE_ROLES,
      valueField: 'value',
      displayField: 'display',
    },
    width: '200px',
  },
  {
    title: 'Trạng thái',
    field: 'isActivated',
    type: 'boolean',
    option: { displayOnTrue: 'Hoạt động', displayOnFalse: 'Khóa' },
    width: '150px',
  },
]
```

**Column Types**: `string`, `date`, `datetime`, `boolean`, `values`, `lazy-values`, `number`

---

## 4. SERVICE PATTERNS

### 4.1 BaseService - Generic CRUD Pattern

**[base/base.service.ts](portal-template/plop-templates/module/base.service.ts.hbs)**

**Purpose**: Provides generic CRUD operations for any entity

**Key Features**:
- `register<TDto, TSaveReq>()` - Factory function returning CRUD interface
- Automatic host/baseUrl construction from configuration
- Built-in error handling and data transformation

```typescript
export class BaseService {
  readonly #apiService = inject(SdApiService);
  readonly #configuration = inject<I{{properCase name}}Configuration>({{constantCase name}}_CONFIGURATION);

  register = <TDto = any, TSaveReq = TDto>(entity: string): IBaseRegister<TDto, TSaveReq> => {
    const host = this.#configuration.host;
    const baseUrl = `${host}/${entity}`;
    
    return {
      host,
      baseUrl,
      paging: async (pagingReq) => { /* POST /entity/paging */ },
      search: async (keyword, filters) => { /* POST /entity/search */ },
      all: async () => { /* GET /entity/all */ },
      detail: async (id) => { /* GET /entity/{id} */ },
      create: async (req) => { /* POST /entity */ },
      update: async (id, req) => { /* PUT /entity/{id} */ },
      remove: async (id) => { /* DELETE /entity/{id} */ },
    };
  };
}
```

### 4.2 Entity Service Implementation

**[employee.service.ts](portal-template/src/libs/sample/modules/employee/services/employee.service.ts)**

```typescript
import { BaseService } from '@sample/services';
import { EmployeeDTO, EmployeeSaveReq } from './employee.model';

export class EmployeeService extends BaseService {
  readonly #api = this.register<EmployeeDTO, EmployeeSaveReq>('employee');

  // Expose base CRUD methods
  paging = this.#api.paging;
  search = this.#api.search;
  all = this.#api.all;
  detail = this.#api.detail;
  create = this.#api.create;
  update = this.#api.update;
  remove = this.#api.remove;

  // Custom API methods (optional)
  // approve = async (id: string) => { ... };
}
```

### 4.3 API Configuration with Interceptors

**[api.configuration.ts](portal-template/src/libs/sample/configurations/api.configuration.ts)**

**Purpose**: Define request/response interceptors per module

```typescript
@Injectable()
export class ApiConfiguration implements ISdApiConfiguration {
  #notifyService = inject(SdNotifyService);
  #configuration = inject<ISampleConfiguration>(SAMPLE_CONFIGURATION);

  handlers: ISdApiConfiguration['handlers'] = [
    {
      // Only runs for this module's host
      hosts: [this.#configuration.host],

      // Intercept REQUEST before sending
      intercept: request => {
        return request.clone({
          setHeaders: {
            // Add custom headers here
          },
        });
      },

      // Handle RESPONSE or ERROR
      afterRemote: res => {
        if (res instanceof HttpErrorResponse && res.status !== 200 && res.status !== 204) {
          const errorMessage = res.error?.meta?.message || 'Đã có lỗi xảy ra';
          this.#notifyService.error(errorMessage);
        }
      },
    },
  ];
}
```

### 4.4 Service Injection Pattern

**Key Convention**: Services are injected at route level, not `providedIn: 'root'`

```typescript
// In routes.ts
export const employeeRoutes: Routes = [
  {
    path: '',
    providers: [EmployeeService],  // Scoped provider
    children: [
      { path: '', loadComponent: () => import('./pages/list/list.component').then(m => m.ListComponent) },
      // ... other routes
    ],
  },
];
```

---

## 5. MODEL & INTERFACE PATTERNS

### 5.1 Base Entity

**[base.model.ts](portal-template/plop-templates/module/base.model.ts.hbs)**

```typescript
export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}
```

### 5.2 Entity-Specific Models

**[employee.model.ts](portal-template/src/libs/sample/modules/employee/services/employee.model.ts)**

```typescript
// Constants
export const EMPLOYEE_ROLES = [
  { value: 'EMPLOYEE', display: 'Nhân viên' },
  { value: 'MANAGER', display: 'Quản lý' },
];

// Request model (for create/update)
export interface EmployeeSaveReq {
  code?: string;
  name?: string;
  salary?: number;
  birthday?: string;         // Date: YYYY-MM-DD
  effectiveTime?: string;    // DateTime: ISO string
  role?: string;
  departmentId?: string;
  isActivated?: boolean;
  note?: string;
  fileIds?: string[];
}

// Response model (extends BaseEntity with required fields)
export type EmployeeDTO = Required<EmployeeSaveReq> & BaseEntity;

// Mock interface for related entities
export interface DepartmentMockDTO {
  id: string;
  code: string;
  name: string;
}
```

### 5.3 Configuration Interface

**[sample.configuration.ts](portal-template/src/libs/sample/configurations/sample.configuration.ts)**

```typescript
export interface ISampleConfiguration {
  host: string;  // API endpoint base URL
}

export const SAMPLE_CONFIGURATION = new InjectionToken<ISampleConfiguration>('sample.configuration');
```

---

## 6. ROUTE CONFIGURATION PATTERNS

### 6.1 Root Route Setup

**[app.routes.ts](portal-template/src/app/app.routes.ts)**

```typescript
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'layout/home',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainComponent,
    canActivate: [SdAuthGuard, SdPermissionGuard],
    canActivateChild: [SdPermissionGuard],
    children: [
      {
        path: '',
        canActivate: [SdPortalGuard],
        children: [
          {
            path: 'layout',
            loadChildren: () => import('@sd-angular/core/modules/layout').then(m => m.SdLayoutModule),
          },
          {
            path: 'sample',
            providers: [{ provide: SAMPLE_CONFIGURATION, useClass: SampleConfiguration }],
            loadChildren: () => import('@sample').then(m => m.sampleRoutes),
          },
          // ... other modules
        ],
      },
    ],
  },
];
```

### 6.2 Module-Level Routes

**[sample/routes.ts](portal-template/src/libs/sample/routes.ts)**

```typescript
export const sampleRoutes: Routes = [
  {
    path: '',
    canActivate: [sampleGuard],
    providers: [
      { provide: SD_API_CONFIG, useClass: ApiConfiguration, multi: true },
      { provide: SD_UPLOAD_FILE_CONFIGURATION, useClass: UploadFileConfiguration, multi: true },
    ],
    children: [
      { path: 'employee', loadChildren: () => import('@sample/modules/employee').then(m => m.employeeRoutes) },
    ],
  },
];
```

### 6.3 Entity-Level Routes

**[employee.routes.ts](portal-template/src/libs/sample/modules/employee/employee.routes.ts)**

```typescript
export const employeeRoutes: Routes = [
  {
    path: '',
    providers: [EmployeeService],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/list/list.component').then(m => m.ListComponent),
      },
      {
        path: 'create',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
      },
      {
        path: 'detail/:id',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
      },
      {
        path: 'update/:id',
        loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
      },
    ],
  },
];
```

### 6.4 Route Pattern Summary

**Convention**:
1. Configuration providers at module entry point
2. Service providers at entity entry point
3. `loadComponent()` for standalone components
4. `loadChildren()` for child routes
5. Guard checks at appropriate levels

---

## 7. FORM & VALIDATION PATTERNS

### 7.1 Reactive Forms Setup

**Two-Way Binding Pattern**:
```typescript
<sd-input 
  label="Họ tên"
  [(model)]="entity.name"     // Automatic FormControl creation
  [form]="form"                # Reference for validation state
  required
  [viewed]="state === 'DETAIL'"  # Read-only mode
></sd-input>
```

### 7.2 Form Validation

**Validation on Save**:
```typescript
onSave = async () => {
  // Mark all fields as touched to show validation errors
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;  // Prevent submission
  }
  
  // Process form data
  await this.#employeeService.update(this.entity.id, this.entity);
};
```

### 7.3 Form Control Types

| Component | Type | Usage |
|-----------|------|-------|
| `SdInput` | text | Single-line strings |
| `SdInputNumber` | number | Numeric values |
| `SdDate` | date | Date picker (YYYY-MM-DD) |
| `SdDatetime` | datetime | DateTime picker (ISO string) |
| `SdSelect` | select | Static or dynamic dropdowns |
| `SdTextarea` | textarea | Multi-line text |
| `SdUploadFile` | file | File upload with IDs |
| `SdSwitch` | switch | Boolean toggles |
| `SdRadio` | radio | Single selection |
| `SdCheckbox` | checkbox | Multi-selection |

### 7.4 File Upload Pattern

```typescript
<sd-upload-file
  label="Tệp đính kèm"
  [(model)]="entity.fileIds"     # Store file IDs
  [form]="form"
  [disabled]="state === 'DETAIL'"
></sd-upload-file>
```

**In Component**:
```typescript
uploadFiles = viewChildren(SdUploadFile);

onSave = async () => {
  // Upload files first
  if (this.uploadFiles?.length) {
    await Promise.all(this.uploadFiles().map(f => f.upload()));
  }
  
  // Then save entity with fileIds
  await this.#employeeService.update(this.entity.id, this.entity);
};
```

---

## 8. ARCHITECTURE CONVENTIONS

### 8.1 Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Module folder | kebab-case | `sample`, `purchase-order` |
| Entity folder | kebab-case | `employee`, `product-line` |
| Service class | PascalCase + Service | `EmployeeService` |
| Model interface | PascalCase + (DTO\|SaveReq) | `EmployeeDTO`, `EmployeeSaveReq` |
| Configuration token | SCREAMING_SNAKE_CASE | `SAMPLE_CONFIGURATION` |
| Component selector | kebab-case | `employee-list`, `employee-detail` |
| Guards | camelCase | `sampleGuard`, `employeeGuard` |

### 8.2 Import Path Aliases

```typescript
// tsconfig.json paths
"@sample": ["./src/libs/sample"]
"@sample/*": ["./src/libs/sample/*"]
"@sd-angular/core/*": ["../sd-angular/..."]
```

**Usage**:
```typescript
import { EmployeeService } from '@sample/modules/employee/services';
import { BaseService } from '@sample/services';
import { SdButton } from '@sd-angular/core/components';
```

### 8.3 Dependency Injection Pattern

**Modern Angular Inject API** (preferred over constructor injection):
```typescript
export class ListComponent {
  readonly #router = inject(Router);
  readonly #notifyService = inject(SdNotifyService);
  readonly #employeeService = inject(EmployeeService);
}
```

**Advantages**:
- Private field naming with `#` prefix
- Clear dependency visibility
- Easier tree-shaking

### 8.4 Component Lifecycle

**Standard Pattern**:
1. Inject dependencies
2. Initialize observables/signals
3. ngOnInit: Load data, set up form
4. ngOnDestroy: Cleanup (if needed)

### 8.5 Error Handling

**Centralized via ApiConfiguration**:
```typescript
afterRemote: res => {
  if (res instanceof HttpErrorResponse) {
    const message = res.error?.meta?.message || 'Lỗi';
    this.#notifyService.error(message);
  }
};
```

**Optional: Per-component error handling**:
```typescript
try {
  await this.#employeeService.update(id, data);
} catch (error) {
  this.#notifyService.error('Update failed');
}
```

---

## 9. CODE GENERATION TEMPLATES

The project uses **Plop** for scaffolding new modules:

```bash
npm run plop  # Generates module structure automatically
```

**Generated Files**:
- `routes.ts`
- `configurations/` (module config + API config)
- `guards/` (route guards)
- `services/` (base model + base service)
- `modules/` (entity submodule structure)

---

## 10. KEY SDCOREJS LIBRARY COMPONENTS

### 10.1 Layout Components

| Component | Purpose |
|-----------|---------|
| `SdPageComponent` | Main page container with title |
| `SdSection` | Fieldset/grouping container |
| `SdButton` | Action button with variants |
| `SdBadge` | Status/count badge |

### 10.2 Data Display

| Component | Purpose |
|-----------|---------|
| `SdTable` | Server/client-side table with pagination |
| `SdAvatar` | User profile image |
| `SdView` | Read-only data display |

### 10.3 Form Components

| Component | Purpose |
|-----------|---------|
| `SdInput` | Text input |
| `SdSelect` | Dropdown (supports lazy loading) |
| `SdDate` / `SdDatetime` | Date/time pickers |
| `SdTextarea` | Multi-line text |
| `SdUploadFile` | File upload |
| `SdSwitch` / `SdCheckbox` | Boolean/multi-choice |

### 10.4 User Interaction

| Component | Purpose |
|-----------|---------|
| `SdModal` | Modal dialog |
| `SdSideDrawer` | Side panel |
| `SdTabComponent` | Tab content registration |

### 10.5 Core Services

| Service | Purpose |
|---------|---------|
| `SdApiService` | HTTP client with interceptors |
| `SdNotifyService` | Toast notifications |
| `SdLoadingService` | Global loading spinner |
| `SdConfirmService` | Confirmation dialogs |
| `SdPermissionDirective` | Permission-based visibility |

---

## 11. ARCHITECTURAL CONSTRAINTS & RULES

### MUST DO:
✅ Use lazy loading for all feature modules  
✅ Provide services at route level (not root)  
✅ Inject configuration via InjectionToken at route level  
✅ Use BaseService for generic CRUD operations  
✅ Implement 3-state pattern for detail components (CREATE/UPDATE/DETAIL)  
✅ Use standalone components with `imports` array  
✅ Use `inject()` for dependency injection  
✅ Two-way bind forms with `[(model)]`  
✅ Handle file uploads before entity save  

### MUST NOT DO:
❌ Use `providedIn: 'root'` for entity-specific services  
❌ Mix NgModule and standalone approaches in same route  
❌ Access FormGroup without checking form existence  
❌ Call API directly from components (use services)  
❌ Hard-code API URLs (use configuration)  
❌ Add custom logic outside of services  

---

## 12. EXAMPLE: Complete CRUD Entity

### File: `sample/modules/product/`

```
product/
├── product.routes.ts
├── product.model.ts
├── product.service.ts
├── pages/
│   ├── list.component.ts
│   └── detail.component.ts
└── index.ts
```

### Routes
```typescript
export const productRoutes: Routes = [
  {
    path: '',
    providers: [ProductService],
    children: [
      { path: '', loadComponent: () => import('./pages/list.component').then(m => m.ListComponent) },
      { path: 'create', loadComponent: () => import('./pages/detail.component').then(m => m.DetailComponent) },
      { path: 'detail/:id', loadComponent: () => import('./pages/detail.component').then(m => m.DetailComponent) },
      { path: 'update/:id', loadComponent: () => import('./pages/detail.component').then(m => m.DetailComponent) },
    ],
  },
];
```

### Service
```typescript
export class ProductService extends BaseService {
  readonly #api = this.register<ProductDTO, ProductSaveReq>('product');
  paging = this.#api.paging;
  create = this.#api.create;
  update = this.#api.update;
  remove = this.#api.remove;
  // ... custom methods
}
```

### Model
```typescript
export interface ProductSaveReq {
  code: string;
  name: string;
  price: number;
  description: string;
}

export type ProductDTO = Required<ProductSaveReq> & BaseEntity;
```

### List Component
```typescript
@Component({
  selector: 'product-list',
  imports: [SdButton, SdTable, SdPageComponent],
  template: `
    <sd-page title="Sản phẩm">
      <div headerRight>
        <sd-button title="Tạo mới" (click)="onCreate()"></sd-button>
      </div>
      <sd-table [option]="tableOption"></sd-table>
    </sd-page>
  `,
})
export class ListComponent implements OnInit {
  #productService = inject(ProductService);
  tableOption!: SdTableOption<ProductDTO>;

  ngOnInit() {
    this.tableOption = {
      type: 'server',
      items: async (_, paging) => this.#productService.paging(paging),
      columns: [
        { title: 'Code', field: 'code', type: 'string' },
        { title: 'Name', field: 'name', type: 'string' },
        { title: 'Price', field: 'price', type: 'number' },
      ],
    };
  }
}
```

---

## 13. SUMMARY OF PATTERNS

| Pattern | File Location | Usage |
|---------|---------------|-------|
| **Module Structure** | `libs/[module]/routes.ts` | Define lazy-loaded modules with providers |
| **Entity Service** | `libs/[module]/services/[entity].service.ts` | Extend BaseService for CRUD |
| **Entity Model** | `libs/[module]/services/[entity].model.ts` | DTO + SaveReq interfaces |
| **List Page** | `libs/[module]/pages/list.component.ts` | SdTable with server paging |
| **Detail Page** | `libs/[module]/pages/detail.component.ts` | Form with 3-state machine |
| **Configuration** | `libs/[module]/configurations/` | API config with interceptors |
| **Guards** | `libs/[module]/guards/` | Route protection |
| **Base Service** | `libs/[module]/services/base/` | Generic CRUD template |

---

## 14. NEXT STEPS FOR SKILL LIBRARY

These patterns should be extracted into structured skills for the sdcorejs-agent:

1. **Skill: Create Feature Module** - Generate module structure with routes & config
2. **Skill: Create Entity CRUD** - Generate entity service, model, list/detail pages
3. **Skill: Configure API Interceptor** - Create ApiConfiguration with error handling
4. **Skill: Build Form Page** - Generate detail component with validation
5. **Skill: Build Table Page** - Generate list component with pagination
6. **Skill: Generate Guard** - Create route protection logic

---

**Generated**: 2026-04-18  
**Project**: sdcorejs Angular Architecture Analysis
