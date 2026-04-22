# Skill: Generate Entity CRUD from Schema

## Purpose

Transform EntitySchema + generic templates into complete CRUD entity code:
- Model (DTO, SaveReq, validators)
- Service (mock-first CRUD via centralized seed data file)
- Routes (lazy-loaded)
- Components (List, Detail)

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
   - Ask user to describe fields OR provide minimal schema
   - For each field: name, type (string/number/date/select/etc), required?, label
   
5. **UI Preferences**:
   - Detail layout: full-page or side-drawer? (default: full-page)
   - Has search? filter? delete? excel? (defaults: yes/yes/yes/no)
   - Permissions: use default naming pattern or custom? (default: {{ MODULE }}_{{ ENTITY }}_CREATE, etc.)

## Generation Process

### Step 1: Build EntitySchema

From user input, construct EntitySchema object with all field metadata.

**Example user input:**
```
Module: sample
Entity: product
Label: Sản phẩm
Fields:
  - code (string, required, max 32)
  - name (string, required, max 255)
  - categoryId (select, label: Loại sản phẩm, api: /api/categories)
  - price (decimal, required, min 0)
  - stock (number, required, min 0)
  - description (textarea)
```

**Result EntitySchema:**
```typescript
const PRODUCT_SCHEMA: EntitySchema = {
  module: 'sample',
  entity: 'product',
  entityPascal: 'Product',
  entityLabel: 'Sản phẩm',
  entityLabelPlural: 'Sản phẩm',
  apiEndpoint: 'product',
  
  fields: [
    { name: 'code', type: 'string', label: 'Mã sản phẩm', required: true, maxLength: 32, visibleInList: true },
    { name: 'name', type: 'string', label: 'Tên sản phẩm', required: true, maxLength: 255, visibleInList: true },
    { name: 'categoryId', type: 'select', label: 'Loại sản phẩm', selectApiEndpoint: '/api/categories', selectApiValueField: 'id', selectApiLabelField: 'name' },
    { name: 'price', type: 'decimal', label: 'Giá bán', required: true, min: 0, decimals: 2, visibleInList: true, columnFormat: 'currency' },
    { name: 'stock', type: 'number', label: 'Tồn kho', required: true, min: 0, visibleInList: true },
    { name: 'description', type: 'textarea', label: 'Mô tả' }
  ],
  
  detailLayout: 'full-page',
  listPageSize: 10,
  permissionCreate: 'SAMPLE_PRODUCT_CREATE',
  permissionUpdate: 'SAMPLE_PRODUCT_UPDATE',
  permissionDelete: 'SAMPLE_PRODUCT_DELETE'
};
```

### Step 2: Generate Model (product.model.ts)

From EntitySchema, generate:
- `{{ entityPascal }}SaveReq` interface (all fields except id, timestamps)
- `{{ entityPascal }}DTO` type (SaveReq + BaseEntity)
- `{{ entityPascal }}_ROLES` constant (if any select options with static values)
- Validation config (if needed)

**Template Usage:**
- Take field definitions
- For each field:
  - Add JSDoc comment explaining UI control (sd-input, sd-date, sd-select, etc.)
  - Mark as optional (?) if not required
  - Include validation hints in comments (maxlength, min/max)

**Output (product.model.ts):**
```typescript
import { BaseEntity } from '@sample/services';

export interface ProductSaveReq {
  // UI: sd-input (required, maxLength 32)
  code?: string;
  // UI: sd-input (required, maxLength 255)
  name?: string;
  // UI: sd-select (Dynamic API: /api/categories, valueField: id, labelField: name)
  categoryId?: string;
  // UI: sd-input-number (required, decimals 2, min 0)
  price?: number;
  // UI: sd-input-number (required, min 0)
  stock?: number;
  // UI: sd-textarea
  description?: string;
}

export type ProductDTO = Required<ProductSaveReq> & BaseEntity;
```

### Step 3: Generate Mock Data + Service (product.mock-data.ts + product.service.ts)

Pattern: create one centralized mock data file per entity, then wire service to localStorage-backed mock CRUD store.

**Template Usage:**
- Create `{{ entityKebab }}.mock-data.ts` with around 100 seed rows
- Import `MockCrudStore` + seed data in service
- Expose all CRUD methods (`paging/search/all/detail/create/update/remove`) from store
- Only switch to `BaseService` API integration after backend contract is explicit
- Ensure `MockCrudStore` can reseed when existing localStorage value is missing, empty (`[]`), or corrupted JSON

**Output (product.service.ts):**
```typescript
import { Injectable } from '@angular/core';
import { MockCrudStore } from '@sample/services';
import { ProductDTO, ProductSaveReq } from './product.model';
import { PRODUCT_SEED_DATA } from './product.mock-data';

@Injectable({ providedIn: 'root' })
export class ProductService {
  readonly #store = new MockCrudStore<ProductDTO, ProductSaveReq>(
    'product',
    () => [...PRODUCT_SEED_DATA],
    (existing, req) => ({
      ...(existing ?? ({} as ProductDTO)),
      code: String(req.code ?? existing?.code ?? ''),
      name: String(req.name ?? existing?.name ?? ''),
      price: Number(req.price ?? existing?.price ?? 0),
      isActivated: Boolean(req.isActivated ?? existing?.isActivated ?? true),
      note: String(req.note ?? existing?.note ?? ''),
    })
  );

  paging = this.#store.paging;
  search = this.#store.search;
  all = this.#store.all;
  detail = this.#store.detail;
  create = this.#store.create;
  update = this.#store.update;
  remove = this.#store.remove;
}
```

### Step 4: Generate Routes (product.routes.ts)

Pattern: Lazy-load components, provide service

**Template Usage:**
- Declare routes: '' (list), 'create', 'detail/:id', 'update/:id'
- Import ListComponent, DetailComponent
- Provide ProductService at route level
- Lazy load components (COMPONENT_TYPE)

**Output (product.routes.ts):**
```typescript
import { Routes } from '@angular/router';
import { ProductService } from './services/product.service';
import { ListComponent } from './pages/list/list.component';
import { DetailComponent } from './pages/detail/detail.component';

export const productRoutes: Routes = [
  {
    path: '',
    providers: [ProductService],
    children: [
      { path: '', component: ListComponent },
      { path: 'create', component: DetailComponent },
      { path: 'detail/:id', component: DetailComponent },
      { path: 'update/:id', component: DetailComponent }
    ]
  }
];
```

### Step 5: Generate List Component

**Template Usage:**
- Use list-component-template.md
- Substitute placeholders: {{ module }}, {{ entity }}, {{ entityPascal }}, {{ entityLabel }}, etc.
- Generate columns array from visibleInList fields
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
src/libs/{{ module }}/modules/{{ entityKebab }}/
  ├── services/
  │   ├── {{ entityKebab }}.model.ts       (DTO, SaveReq, constants)
  │   ├── {{ entityKebab }}.mock-data.ts   (~100 centralized seed rows)
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
│   │   - PRODUCT_SEED_DATA with ~100 rows
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
└── product.routes.ts
    - Routes with path, providers, children
    - Lazy-load ListComponent and DetailComponent
```

## Validation Checklist

Before returning generated code:

✅ All imports are correct (no circular dependencies)  
✅ All fields from EntitySchema are included  
✅ Form validation matches field requirements  
✅ `{{ entityKebab }}.mock-data.ts` exists with centralized seed rows (~100)  
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

**User Request:**
```
生成 sample 模块的员工 CRUD
字段: code, name, role, salary, birthday, isActivated, note
```

**Agent Process:**

1. ✅ Confirm module: sample (exists)
2. ✅ Entity name: employee
3. ✅ Label: Nhân viên
4. ✅ Fields confirmed with types/validation
5. ✅ Generate EntitySchema (EMPLOYEE_SCHEMA)
6. ✅ Generate model (employee.model.ts)
7. ✅ Generate mock data file (employee.mock-data.ts)
8. ✅ Generate service (employee.service.ts)
9. ✅ Generate routes (employee.routes.ts)
10. ✅ Generate list component
11. ✅ Generate detail component
12. ✅ Verify all files compile without errors
13. ✅ Return complete code package ready to add to module

**Result:**
```
src/libs/sample/modules/employee/
├── services/
│   ├── employee.model.ts
│   ├── employee.service.ts
│   └── index.ts
├── pages/
│   ├── list/list.component.ts
│   └── detail/detail.component.ts
└── employee.routes.ts
```
