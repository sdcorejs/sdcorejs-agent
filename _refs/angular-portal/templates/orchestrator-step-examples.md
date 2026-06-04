# Write-Code Orchestrator — Step Examples

Walkthrough examples referenced from [`07-write-code.md`](../../07-write-code.md) (the `angular-portal-write-code` orchestrator). The skill body owns the dispatch table, TDD gate, input resolution, semantic inference rules, and the file/naming conventions; these examples show what the on-demand reference packs it loads (`init-entity`, `screen-list`, etc.) ultimately produce. Use them when you want to picture the end shape, or when explaining the flow to someone reading the orchestrator for the first time.

For the canonical entity-skeleton + tests + product example actually used by the init-entity pack, see the sibling refs [`entity-skeleton.md`](./entity-skeleton.md), [`entity-tests.md`](./entity-tests.md), and [`example-product.md`](./example-product.md).

## Table of contents

- [Step 1 — Build EntitySchema](#step-1--build-entityschema)
  - [User-provided fields (Product)](#user-provided-fields-product)
  - [Inferred schema (Promotion — fields omitted)](#inferred-schema-promotion--fields-omitted)
- [Step 2 — Generate Model (`product.model.ts`)](#step-2--generate-model-productmodelts)
- [Step 3 — Generate Mock Data + Service](#step-3--generate-mock-data--service)
  - [product.service.ts](#productservicets)
  - [promotion.mock-data.ts (inferred schema, domain-realistic)](#promotionmock-datats-inferred-schema-domain-realistic)
- [Step 4 — Generate Routes (`product.routes.ts`)](#step-4--generate-routes-productroutests)
- [Step 5 / Step 6 — List + Detail components](#step-5--step-6--list--detail-components)
- [Worked end-to-end — Employee entity](#worked-end-to-end--employee-entity)

---

## Step 1 — Build EntitySchema

### User-provided fields (Product)

When the user supplies fields:

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

Resulting `EntitySchema`:

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

### Inferred schema (Promotion — fields omitted)

When the user only names the entity:

```text
Request: "Thêm entity khuyến mãi cho module sales"
```

The orchestrator applies the Semantic Inference Fallback (see skill body §"Semantic Inference Fallback") and produces a first-pass `EntitySchema`:

```typescript
const PROMOTION_SCHEMA: EntitySchema = {
  module: 'sales',
  entity: 'promotion',
  entityPascal: 'Promotion',
  entityLabel: 'Khuyến mãi',
  entityLabelPlural: 'Khuyến mãi',
  apiEndpoint: 'promotion',

  fields: [
    { name: 'code', type: 'string', label: 'Mã khuyến mãi', required: true, maxLength: 32, visibleInList: true },
    { name: 'name', type: 'string', label: 'Tên khuyến mãi', required: true, maxLength: 255, visibleInList: true },
    { name: 'type', type: 'select', label: 'Loại khuyến mãi', required: true, visibleInList: true },
    { name: 'discountValue', type: 'decimal', label: 'Giá trị giảm', required: true, min: 0, visibleInList: true },
    { name: 'startDate', type: 'date', label: 'Ngày bắt đầu', required: true, visibleInList: true },
    { name: 'endDate', type: 'date', label: 'Ngày kết thúc', required: true, visibleInList: true },
    { name: 'status', type: 'select', label: 'Trạng thái', required: true, visibleInList: true },
    { name: 'description', type: 'textarea', label: 'Mô tả' }
  ],

  detailLayout: 'full-page',
  listPageSize: 10,
  permissionCreate: 'SALES_PROMOTION_CREATE',
  permissionUpdate: 'SALES_PROMOTION_UPDATE',
  permissionDelete: 'SALES_PROMOTION_DELETE'
};
```

## Step 2 — Generate Model (`product.model.ts`)

From the `EntitySchema`, generate:

- `<EntityPascal>SaveReq` interface (writable business fields)
- `<EntityPascal>DTO` type (`SaveReq` + `BaseEntity`)
- `<ENTITY>_ROLES` constant when there are static select options
- JSDoc comments above each field explaining the UI control + validation hints
- For Vietnamese portals, labels/comments preserve full diacritics

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

## Step 3 — Generate Mock Data + Service

Pattern: one centralized mock data file per entity + a service wired to a localStorage-backed `MockCrudStore`. This step is mandatory after semantic schema inference — the list page should render with real-looking data on first load.

### product.service.ts

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

### promotion.mock-data.ts (inferred schema, domain-realistic)

Mock-data rules (apply when generating any entity's seed file):

- Produce **20–40 rows** total
- Distribute select/enum values across every option (don't use one value for all rows)
- Spread dates across the past ~12 months
- Use plausible numeric ranges that match the domain (percentage 1–50, fixed amount 10k–500k, stock 0–1000)
- Vietnamese portal → Vietnamese business names with full diacritics
- `id: uuidv4()` on every row so `MockCrudStore` can address records
- `isActivated` ~70/30 unless domain logic says otherwise

```typescript
import { v4 as uuidv4 } from 'uuid';
import { PromotionDTO } from './promotion.model';

export const PROMOTION_SEED_DATA: PromotionDTO[] = [
  {
    id: uuidv4(), code: 'KM-2024-01', name: 'Khuyến mãi hè 2024',
    type: 'PERCENT', discountValue: 15,
    startDate: '2024-06-01', endDate: '2024-08-31',
    status: 'INACTIVE', description: 'Giảm 15% toàn bộ sản phẩm mùa hè',
    isActivated: false, createdAt: '2024-05-20T08:00:00Z', updatedAt: '2024-05-20T08:00:00Z',
  },
  {
    id: uuidv4(), code: 'KM-2024-02', name: 'Ưu đãi cuối năm 2024',
    type: 'FIXED', discountValue: 50000,
    startDate: '2024-12-01', endDate: '2024-12-31',
    status: 'INACTIVE', description: 'Giảm 50.000đ cho đơn từ 500.000đ',
    isActivated: false, createdAt: '2024-11-10T09:00:00Z', updatedAt: '2024-11-10T09:00:00Z',
  },
  {
    id: uuidv4(), code: 'KM-2025-01', name: 'Flash sale 1/1/2025',
    type: 'PERCENT', discountValue: 20,
    startDate: '2025-01-01', endDate: '2025-01-01',
    status: 'INACTIVE', description: 'Flash sale mừng năm mới',
    isActivated: false, createdAt: '2024-12-20T10:00:00Z', updatedAt: '2024-12-20T10:00:00Z',
  },
  // ... continue to 20–40 rows, distributed evenly across type/status
];
```

## Step 4 — Generate Routes (`product.routes.ts`)

Lazy-load components. No `providers` array on the entity route — the entity service is `@Injectable({ providedIn: 'root' })`, and the lib-scoped tokens are wired by `<Lib>Module.useValue({...})` at root (see [`init-module.md`](../write-code/init-module.md) §`[module].module.ts`).

```typescript
import { Routes } from '@angular/router';
import { ListComponent } from './pages/list/list.component';
import { DetailComponent } from './pages/detail/detail.component';

export const productRoutes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: ListComponent },
      { path: 'create', component: DetailComponent },
      { path: 'detail/:id', component: DetailComponent },
      { path: 'update/:id', component: DetailComponent }
    ]
  }
];
```

## Step 5 / Step 6 — List + Detail components

For the list and detail component bodies (`SdTable`, audit columns, action buttons, `CREATE/UPDATE/DETAIL` state machine, stale-id recovery, form refinement), defer to the screen reference packs the orchestrator loads on demand:

- List page → see [`screen-list.md`](../write-code/screen-list.md)
- Detail component (shell + CREATE / UPDATE / DETAIL states + form refinement) → see [`screen-detail.md`](../write-code/screen-detail.md)
- Action buttons layered on top (workflow / bulk / custom side-effects) → see [`actions.md`](../write-code/actions.md)

## Worked end-to-end — Employee entity

**User request:**

```
生成 sample 模块的员工 CRUD
字段: code, name, role, salary, birthday, isActivated, note
```

**Agent process:**

1. Confirm module `sample` exists
2. Entity name: `employee`
3. Label: `Nhân viên`
4. Fields confirmed with types/validation
5. Generate `EMPLOYEE_SCHEMA` (Step 1)
6. Generate `employee.model.ts` (Step 2)
7. Generate `employee.mock-data.ts` (Step 3)
8. Generate `employee.service.ts` (Step 3)
9. Generate `employee.routes.ts` (Step 4)
10. Generate list component (Step 5 — using the `screen-list` reference pack)
11. Generate detail component (Step 6 — using the `screen-detail` reference pack, all CREATE/UPDATE/DETAIL states)
12. Verify all files compile without errors
13. Return complete code package ready to add to module

**Result tree:**

```
src/libs/sample/features/employee/
├── services/
│   ├── employee.model.ts
│   ├── employee.mock-data.ts
│   ├── employee.service.ts
│   └── index.ts
├── pages/
│   ├── list/list.component.ts
│   └── detail/detail.component.ts
└── routes.ts
```
