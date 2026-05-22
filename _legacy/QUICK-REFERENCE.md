# sdcorejs Angular - Quick Reference Guide

**Last Updated**: April 18, 2026

---

## 1. MODULE CREATION CHECKLIST

```
✅ Create module folder in src/libs/[module-name]/
✅ Create routes.ts with lazy-loaded children
✅ Create configurations/
   - [module].configuration.ts (interface definition)
   - api.configuration.ts (request/response interceptors)
   - index.ts (exports)
✅ Create guards/[module].guard.ts
✅ Create services/base/ (base.model.ts + base.service.ts)
✅ Create index.ts (barrel export)
✅ For each entity:
   - Create modules/[entity]/ folder
   - Create [entity].routes.ts
   - Create services/[entity].model.ts
   - Create services/[entity].service.ts
   - Create pages/list/
   - Create pages/detail/
```

---

## 2. ENTITY CRUD PATTERN (Copy & Modify)

### Service Template
```typescript
import { BaseService } from '@[module]/services';
import { [Entity]DTO, [Entity]SaveReq } from './[entity].model';

export class [Entity]Service extends BaseService {
  readonly #api = this.register<[Entity]DTO, [Entity]SaveReq>('[entity]');
  
  paging = this.#api.paging;
  detail = this.#api.detail;
  create = this.#api.create;
  update = this.#api.update;
  remove = this.#api.remove;
}
```

### Model Template
```typescript
export interface [Entity]SaveReq {
  field1?: type;
  field2?: type;
}

export type [Entity]DTO = Required<[Entity]SaveReq> & BaseEntity;
```

### Routes Template
```typescript
export const [entity]Routes: Routes = [
  {
    path: '',
    providers: [[Entity]Service],
    children: [
      { path: '', loadComponent: () => import('./pages/list/list.component').then(m => m.ListComponent) },
      { path: 'create', loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent) },
      { path: 'detail/:id', loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent) },
      { path: 'update/:id', loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent) },
    ],
  },
];
```

---

## 3. LIST PAGE TEMPLATE

```typescript
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { SdButton, SdPageComponent, SdTable, SdTableOption } from '@sd-angular/core/components';
import { SdConfirmService, SdNotifyService } from '@sd-angular/core/services';
import { Router, ActivatedRoute } from '@angular/router';
import { [Entity]DTO, [Entity]Service } from '../../services';

@Component({
  selector: '[entity]-list',
  imports: [SdButton, SdTable, SdPageComponent],
  template: `
    <sd-page title="[Entity Title]">
      <div class="d-flex align-items-center" headerRight>
        <sd-button title="Tạo mới" type="fill" prefixIcon="add" color="primary" (click)="onCreate()"></sd-button>
      </div>
      <div class="h-full p-8">
        @if (tableOption) {
          <sd-table [option]="tableOption" #table autoId="[module]_[entity]"></sd-table>
        }
      </div>
    </sd-page>
  `,
})
export class ListComponent implements OnInit {
  @ViewChild(SdTable) table!: SdTable<[Entity]DTO>;

  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #confirmService = inject(SdConfirmService);
  readonly #notifyService = inject(SdNotifyService);
  readonly #service = inject([Entity]Service);

  tableOption!: SdTableOption<[Entity]DTO>;

  ngOnInit(): void {
    this.tableOption = {
      key: '[module]-[entity]-list',
      type: 'server',
      reload: { visible: true },
      config: { visible: true },
      items: async (_, pagingRequest) => {
        return await this.#service.paging(pagingRequest);
      },
      selector: {
        actions: [
          {
            icon: 'delete',
            title: 'Xóa',
            click: rows => {
              this.#confirmService.confirm(`Xóa ${rows.length} dữ liệu?`).then(() => {
                this.#onRemove(rows.map(e => e.id));
              });
            },
          },
        ],
      },
      columns: [
        {
          title: 'ID',
          field: 'id',
          type: 'string',
          width: '150px',
          click: (value, row) => this.#onDetail(row.id),
        },
        // Add more columns...
      ],
    };
  }

  onCreate = () => this.#router.navigate(['create'], { relativeTo: this.#route });
  #onDetail = (id: string) => this.#router.navigate(['detail', id], { relativeTo: this.#route });
  
  #onRemove = async (ids: string[]) => {
    try {
      await this.#service.remove(ids);
      this.#notifyService.success('Xóa thành công');
      this.table.reload();
    } catch (error) {
      this.#notifyService.error('Xóa thất bại');
    }
  };
}
```

---

## 4. DETAIL PAGE TEMPLATE

```typescript
import { Component, OnInit, inject, viewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SdButton, SdInput, SdPageComponent, SdSection, SdUploadFile } from '@sd-angular/core/components';
import { SdLoadingService, SdNotifyService } from '@sd-angular/core/services';
import { [Entity]DTO, [Entity]Service } from '../../services';

@Component({
  selector: '[entity]-detail',
  imports: [SdInput, SdButton, SdSection, SdPageComponent, SdUploadFile],
  template: `
    <sd-page [title]="title">
      <div class="d-flex align-items-center" style="gap: 8px" headerRight>
        <sd-button title="Quay lại" prefixIcon="replay" (click)="onBack()"></sd-button>
        @if (state === 'DETAIL' && editable) {
          <sd-button title="Cập nhật" type="fill" prefixIcon="edit" color="primary" (click)="onUpdate()"></sd-button>
        } @else if (state === 'UPDATE' || state === 'CREATE') {
          <sd-button title="Lưu" type="fill" prefixIcon="save" color="primary" (click)="onSave()" [loading]="saving"></sd-button>
        }
      </div>
      <div class="h-full p-8">
        <sd-section title="Thông tin">
          <div class="row row-sm mx-0">
            <div class="col-6">
              <sd-input label="Field 1" [(model)]="entity.field1" [form]="form" required [viewed]="state === 'DETAIL'"></sd-input>
            </div>
            <!-- Add more form fields -->
          </div>
        </sd-section>
      </div>
    </sd-page>
  `,
})
export class DetailComponent implements OnInit {
  uploadFiles = viewChildren(SdUploadFile);

  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #notifyService = inject(SdNotifyService);
  readonly #loadingService = inject(SdLoadingService);
  readonly #service = inject([Entity]Service);

  form = new FormGroup({});
  saving = false;
  entity: Partial<[Entity]DTO> = {};
  id = '';
  state: 'CREATE' | 'UPDATE' | 'DETAIL' = 'CREATE';
  title = '';
  editable = false;

  ngOnInit() {
    this.id = this.#route.snapshot.params?.['id'];
    const url = this.#router.url;

    if (url.includes('update')) {
      this.state = 'UPDATE';
      this.title = 'Cập nhật';
    } else if (url.includes('detail')) {
      this.state = 'DETAIL';
      this.title = 'Chi tiết';
    } else {
      this.state = 'CREATE';
      this.title = 'Tạo mới';
    }

    if (this.id) {
      this.#detail(this.id);
    }
  }

  #detail = (id: string) => {
    this.#loadingService.start();
    this.#service
      .detail(id)
      .then(entity => {
        this.entity = entity;
        if (this.state === 'UPDATE' && !this.editable) {
          this.#router.navigate(['../../detail', this.id], {
            relativeTo: this.#route,
            state: { replaceTab: true },
          });
        }
      })
      .finally(() => this.#loadingService.stop());
  };

  onBack = () => {
    const path = this.state === 'CREATE' ? ['../'] : ['../../'];
    this.#router.navigate(path, { relativeTo: this.#route, state: { replaceTab: true } });
  };

  onUpdate = () => {
    if (this.state === 'DETAIL') {
      this.#router.navigate(['../../update', this.id], {
        relativeTo: this.#route,
        state: { replaceTab: true },
      });
    }
  };

  onSave = async () => {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    try {
      if (this.uploadFiles?.length) {
        await Promise.all(this.uploadFiles().map(f => f.upload()));
      }

      if (this.entity.id) {
        await this.#service.update(this.entity.id, this.entity);
        this.#notifyService.success('Cập nhật thành công');
        this.#detail(this.id);
      } else {
        const newEntity = await this.#service.create(this.entity);
        this.#notifyService.success('Tạo mới thành công');
        this.#router.navigate(['../detail', newEntity.id], {
          relativeTo: this.#route,
          state: { replaceTab: true },
        });
      }
    } finally {
      this.saving = false;
    }
  };
}
```

---

## 5. FORM COMPONENTS REFERENCE

### Common Form Fields
```typescript
// Text input
<sd-input label="Name" [(model)]="entity.name" [form]="form" required></sd-input>

// Number input
<sd-input-number label="Price" [(model)]="entity.price" [form]="form" required></sd-input-number>

// Date picker
<sd-date label="Birth Date" [(model)]="entity.birthDate" [form]="form"></sd-date>

// DateTime picker
<sd-datetime label="Created At" [(model)]="entity.createdAt" [form]="form" [viewed]="true"></sd-datetime>

// Static Select
<sd-select label="Status" [(model)]="entity.status" [form]="form" 
  [items]="statusOptions" valueField="value" displayField="display"></sd-select>

// Dynamic Select (async)
<sd-select label="Department" [(model)]="entity.departmentId" [form]="form"
  [items]="getDepartments" valueField="id" displayField="name"></sd-select>

// TextArea
<sd-textarea label="Notes" [(model)]="entity.notes" [form]="form"></sd-textarea>

// Switch/Toggle
<sd-switch label="Active" [(model)]="entity.isActive" [form]="form"></sd-switch>

// File Upload
<sd-upload-file label="Attachments" [(model)]="entity.fileIds" [form]="form"></sd-upload-file>
```

---

## 6. TABLE COLUMN TYPES

```typescript
columns: [
  { title: 'Code', field: 'code', type: 'string', width: '150px' },
  { title: 'Amount', field: 'amount', type: 'number', width: '120px' },
  { title: 'Date', field: 'date', type: 'date', width: '150px' },
  { title: 'DateTime', field: 'createdAt', type: 'datetime', width: '180px' },
  { title: 'Active', field: 'isActive', type: 'boolean', width: '100px',
    option: { displayOnTrue: 'Yes', displayOnFalse: 'No' } },
  { title: 'Status', field: 'status', type: 'values', width: '120px',
    option: { items: statuses, valueField: 'id', displayField: 'name' } },
  { title: 'Category', field: 'categoryId', type: 'lazy-values', width: '120px',
    option: { items: req => getCategories(req), valueField: 'id', displayField: 'name' } },
]
```

---

## 7. DEPENDENCY INJECTION PATTERNS

### Private Field Naming
```typescript
// Always use private fields with # prefix
readonly #router = inject(Router);
readonly #service = inject(MyService);
readonly #notifyService = inject(SdNotifyService);
```

### Using Injected Dependencies
```typescript
ngOnInit() {
  this.#router.navigate(['path']);
  this.#service.getData().then(data => { ... });
  this.#notifyService.success('Done');
}
```

---

## 8. ROUTE NAVIGATION PATTERNS

```typescript
// Navigate to sibling route
this.#router.navigate(['../'], { relativeTo: this.#route });

// Navigate with ID param
this.#router.navigate(['detail', id], { relativeTo: this.#route });

// Replace current tab
this.#router.navigate(['./'], { 
  relativeTo: this.#route, 
  state: { replaceTab: true } 
});

// Back button
onBack = () => this.#router.navigate(['../'], { relativeTo: this.#route });
```

---

## 9. API ERROR HANDLING

### Centralized (via ApiConfiguration)
```typescript
afterRemote: res => {
  if (res instanceof HttpErrorResponse) {
    const message = res.error?.meta?.message || 'Error occurred';
    this.#notifyService.error(message);
  }
};
```

### Per-Component (optional)
```typescript
try {
  const result = await this.#service.create(entity);
} catch (error) {
  this.#notifyService.error('Failed to create');
}
```

---

## 10. PERMISSION-BASED VISIBILITY

### Directive Usage
```typescript
<!-- Hide button if no permission -->
<sd-button 
  *sdPermission="'MODULE_ENTITY_CREATE'"
  title="Create">
</sd-button>

<!-- Show only if has permission -->
<div *sdPermission="'MODULE_ENTITY_DELETE'">
  Delete options
</div>
```

---

## 11. KEY FILES LOCATIONS

| Item | Path |
|------|------|
| Module Routes | `src/libs/[module]/routes.ts` |
| Module Configuration | `src/libs/[module]/configurations/[module].configuration.ts` |
| API Configuration | `src/libs/[module]/configurations/api.configuration.ts` |
| Base Service | `src/libs/[module]/services/base/base.service.ts` |
| Entity Routes | `src/libs/[module]/modules/[entity]/[entity].routes.ts` |
| Entity Service | `src/libs/[module]/modules/[entity]/services/[entity].service.ts` |
| Entity Model | `src/libs/[module]/modules/[entity]/services/[entity].model.ts` |
| List Page | `src/libs/[module]/modules/[entity]/pages/list/list.component.ts` |
| Detail Page | `src/libs/[module]/modules/[entity]/pages/detail/detail.component.ts` |

---

## 12. COMMON MISTAKES TO AVOID

❌ **DON'T**: Use `providedIn: 'root'` for entity services  
→ **DO**: Provide at route level only  

❌ **DON'T**: Hard-code API URLs  
→ **DO**: Use configuration injection  

❌ **DON'T**: Mix NgModule and standalone components  
→ **DO**: Always use standalone with `imports`  

❌ **DON'T**: Call API directly from components  
→ **DO**: Use services  

❌ **DON'T**: Forget to upload files before save  
→ **DO**: Upload first, then submit fileIds  

❌ **DON'T**: Skip form validation check  
→ **DO**: Always check `form.invalid`  

---

## 13. IMPORT ALIASES

```typescript
// In tsconfig.json
"paths": {
  "@[module]": ["./src/libs/[module]"],
  "@[module]/*": ["./src/libs/[module]/*"],
  "@sd-angular/core/*": ["../sd-angular/..."]
}

// Usage in code
import { EmployeeService } from '@sample/modules/employee/services';
import { BaseService } from '@sample/services';
import { SdButton } from '@sd-angular/core/components';
```

---

**Quick Links**:
- Full Patterns Document: [PATTERNS-FINDINGS.md](PATTERNS-FINDINGS.md)
- Internal Starter Baseline: [core/templates/angular-portal-starter/README.md](core/templates/angular-portal-starter/README.md)
- Internal Starter Package Baseline: [core/templates/angular-portal-starter/package.template.json](core/templates/angular-portal-starter/package.template.json)
