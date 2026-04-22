# Entity Field Type System

## Field Type Definitions

Hệ thống định nghĩa field dùng để tự động sinh CRUD components.

### Field Type Enum

```typescript
type FieldType = 
  | 'string'          // sd-input, maxlength
  | 'number'          // sd-input-number
  | 'decimal'         // sd-input-number with decimals
  | 'boolean'         // sd-switch
  | 'date'            // sd-date (ngày: YYYY-MM-DD)
  | 'datetime'        // sd-datetime (ngày giờ)
  | 'select'          // sd-select (enum hoặc API)
  | 'textarea'        // sd-textarea (nhiều dòng)
  | 'file'            // sd-upload-file (single file)
  | 'files'           // sd-upload-file (multiple files)
  | 'rich-text'       // sd-editor (HTML editor)
```

### Field Metadata Schema

```typescript
interface FieldConfig {
  name: string;                    // 'code', 'name', 'salary'
  type: FieldType;                 // 'string' | 'number' | 'date'...
  label: string;                   // 'Mã sản phẩm', 'Tên nhân viên'
  required?: boolean;              // default: false
  maxLength?: number;              // for string
  min?: number;                    // for number
  max?: number;                    // for number
  decimals?: number;               // for decimal
  pattern?: string;                // regex validation
  readonly?: boolean;              // không edit
  visibleInList?: boolean;         // hiển thị ở list (default: true)
  visibleInDetail?: boolean;       // hiển thị ở detail form (default: true)
  
  // Cho select type
  selectOptions?: Array<{
    value: string | number | boolean;
    display: string;
  }>;
  selectApiEndpoint?: string;      // '/api/departments' → return { data: [...], total: 0 }
  selectApiValueField?: string;    // 'id' (default)
  selectApiLabelField?: string;    // 'name' (default)
  
  // Validation messages
  errorMessage?: string;
  
  // Display in list
  columnWidth?: string;            // '120px', '20%'
  columnFormat?: 'date' | 'number' | 'currency' | 'percent' | 'custom';
  columnFormatFn?: string;         // function name: 'formatCurrency', etc.
  
  // Grouping in form
  section?: string;                // 'Thông tin cơ bản', 'Thông tin chi tiết'
}
```

## Entity Schema Definition

```typescript
interface EntitySchema {
  // Module-level
  module: string;                  // 'sample', 'hrm', 'sales'
  
  // Entity-level
  entity: string;                  // 'employee', 'product', 'contract'
  entityPascal: string;            // 'Employee', 'Product'
  entityLabel: string;             // 'Nhân viên', 'Sản phẩm'
  entityLabelPlural: string;       // 'Các nhân viên', 'Sản phẩm'
  
  // API Endpoint
  apiEndpoint: string;             // 'employee', 'product' (POST /module/entity/paging, etc.)
  
  // Fields
  fields: FieldConfig[];
  
  // UI Preferences
  detailLayout?: 'full-page' | 'side-drawer' | 'modal';
  listPageSize?: number;           // default: 10
  
  // Permissions (angular-permission style)
  permissionCreate?: string;       // 'SAMPLE_EMPLOYEE_CREATE'
  permissionUpdate?: string;       // 'SAMPLE_EMPLOYEE_UPDATE'
  permissionDelete?: string;       // 'SAMPLE_EMPLOYEE_DELETE'
  permissionExport?: string;       // 'SAMPLE_EMPLOYEE_EXPORT'
  
  // Features
  hasSearch?: boolean;             // default: true
  hasFilter?: boolean;             // default: true
  hasDelete?: boolean;             // default: true
  hasExcel?: boolean;              // default: false
  hasBulkUpdate?: boolean;         // default: false (toggle isActivated, etc.)
}
```

## Example: Employee Schema

```typescript
const EMPLOYEE_SCHEMA: EntitySchema = {
  module: 'sample',
  entity: 'employee',
  entityPascal: 'Employee',
  entityLabel: 'Nhân viên',
  entityLabelPlural: 'Các nhân viên',
  apiEndpoint: 'employee',
  
  fields: [
    {
      name: 'code',
      type: 'string',
      label: 'Mã nhân viên',
      required: true,
      maxLength: 16,
      visibleInList: true,
      columnWidth: '120px'
    },
    {
      name: 'name',
      type: 'string',
      label: 'Tên nhân viên',
      required: true,
      maxLength: 255,
      visibleInList: true,
      columnWidth: '200px'
    },
    {
      name: 'birthday',
      type: 'date',
      label: 'Ngày sinh',
      visibleInList: true,
      columnFormat: 'date'
    },
    {
      name: 'role',
      type: 'select',
      label: 'Chức vụ',
      selectOptions: [
        { value: 'EMPLOYEE', display: 'Nhân viên' },
        { value: 'MANAGER', display: 'Quản lý' }
      ],
      visibleInList: true
    },
    {
      name: 'salary',
      type: 'decimal',
      label: 'Lương',
      min: 0,
      decimals: 2,
      columnFormat: 'currency'
    },
    {
      name: 'isActivated',
      type: 'boolean',
      label: 'Kích hoạt',
      visibleInList: true
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Ghi chú'
    }
  ],
  
  detailLayout: 'full-page',
  listPageSize: 10,
  permissionCreate: 'SAMPLE_EMPLOYEE_CREATE',
  permissionUpdate: 'SAMPLE_EMPLOYEE_UPDATE',
  permissionDelete: 'SAMPLE_EMPLOYEE_DELETE'
};
```

## Example: Product Schema (with API-based select)

```typescript
const PRODUCT_SCHEMA: EntitySchema = {
  module: 'sample',
  entity: 'product',
  entityPascal: 'Product',
  entityLabel: 'Sản phẩm',
  apiEndpoint: 'product',
  
  fields: [
    {
      name: 'code',
      type: 'string',
      label: 'Mã sản phẩm',
      required: true,
      maxLength: 32
    },
    {
      name: 'name',
      type: 'string',
      label: 'Tên sản phẩm',
      required: true
    },
    {
      name: 'categoryId',
      type: 'select',
      label: 'Loại sản phẩm',
      selectApiEndpoint: '/api/categories',
      selectApiValueField: 'id',
      selectApiLabelField: 'name'
    },
    {
      name: 'price',
      type: 'decimal',
      label: 'Giá bán',
      min: 0,
      decimals: 2,
      columnFormat: 'currency'
    },
    {
      name: 'stock',
      type: 'number',
      label: 'Tồn kho',
      min: 0
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Mô tả'
    },
    {
      name: 'image',
      type: 'file',
      label: 'Hình ảnh'
    }
  ],
  
  hasSearch: true,
  hasFilter: true,
  hasDelete: true
};
```

## Model Generation from Schema

### DTO Types (auto-generated)

```typescript
// From EMPLOYEE_SCHEMA:

export interface EmployeeSaveReq {
  code?: string;
  name?: string;
  birthday?: string;
  role?: string;
  salary?: number;
  isActivated?: boolean;
  note?: string;
}

export type EmployeeDTO = Required<EmployeeSaveReq> & BaseEntity;
```

### Validation Rules (auto-generated)

```typescript
// From EMPLOYEE_SCHEMA fields:

export const EMPLOYEE_FORM_VALIDATORS = {
  code: [Validators.required, Validators.maxLength(16)],
  name: [Validators.required, Validators.maxLength(255)],
  birthday: [],
  role: [],
  salary: [Validators.min(0)],
  isActivated: [],
  note: []
};
```

## Usage in Skills

### Skill: Generate Entity Model

**Input:**
```
Entity Schema: EMPLOYEE_SCHEMA
```

**Output:**
```typescript
// employee.model.ts
export interface EmployeeSaveReq { ... }
export type EmployeeDTO = ... 
export const EMPLOYEE_FORM_VALIDATORS = { ... }
```

### Skill: Generate Entity Service

**Input:**
```
Entity Schema: EMPLOYEE_SCHEMA
Module: 'sample'
```

**Output:**
```typescript
// employee.service.ts
export class EmployeeService extends BaseService {
  readonly #api = this.register<EmployeeDTO, EmployeeSaveReq>('employee');
  
  paging(req: IPagingRequest) { return this.#api.paging(req); }
  // ...all CRUD methods
}
```

### Skill: Generate List Component

**Input:**
```
Entity Schema: EMPLOYEE_SCHEMA
Module: 'sample'
```

**Output:**
```typescript
// list.component.ts (full CRUD with SdTable, pagination, columns from schema)
```

### Skill: Generate Detail Component

**Input:**
```
Entity Schema: EMPLOYEE_SCHEMA
Module: 'sample'
```

**Output:**
```typescript
// detail.component.ts (full form with fields from schema, state: CREATE/UPDATE/DETAIL)
```

### Skill: Generate Routes

**Input:**
```
Entity Schema: EMPLOYEE_SCHEMA
Module: 'sample'
```

**Output:**
```typescript
// employee.routes.ts
export const employeeRoutes: Routes = [...]
```
