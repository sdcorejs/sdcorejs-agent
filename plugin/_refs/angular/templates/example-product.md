# Worked Example — `product` entity

Reference output from a complete init-entity run (the `sdcorejs-angular` orchestrator with the [`init-entity.md`](../write-code/init-entity.md) pack) against `product`. Use this to verify the shape and conventions of the generated bundle; do NOT copy-paste — let the orchestrator emit the parameterized templates from `entity-skeleton.md`.

## Contents
- `libs/sample/features/product/services/product.model.ts`
- `libs/sample/features/product/services/product.service.ts`
- `libs/sample/features/product/pages/list/list.component.ts`
- `libs/sample/features/product/pages/detail/detail.component.ts`

---

## 6. Example Output

### File: `libs/sample/features/product/services/product.model.ts`
```typescript
import { BaseEntity } from '@sample/services';

export const PRODUCT_CATEGORIES = [
  { value: 'ELECTRONICS', display: '<localized text>' },
  { value: 'CLOTHING', display: '<localized text>' },
  { value: 'FOOD', display: '<localized text>' },
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

// Scaffold default Service output contract. If the raw backend API differs,
// ProductService owns the mapper and keeps raw API types internal.
export type ProductDTO = Required<ProductSaveReq> & BaseEntity;
```

### File: `libs/sample/features/product/services/product.service.ts`
```typescript
import { Injectable, inject } from '@angular/core';
import { BaseService } from '@sample/services';
import { ProductDTO, ProductSaveReq } from './product.model';

@Injectable({ providedIn: 'root' })
export class ProductService extends BaseService {
  readonly #api = this.register<ProductDTO, ProductSaveReq>('product');

  paging = this.#api.paging;
  search = this.#api.search;
  all = this.#api.all;
  detail = this.#api.detail;
  create = this.#api.create;
  update = this.#api.update;
  remove = this.#api.remove;

  // UI-only fields such as checked/selected/displayName belong in component
  // ViewModels unless this Service explicitly derives and guarantees them.
}
```

### File: `libs/sample/features/product/pages/list/list.component.ts`
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
} from '<CORE_UI_PACKAGE_NAME>/components';

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
    <sd-page title="<localized text>">
      <div class="d-flex align-items-center" role="toolbar" headerRight>
        <sd-button
          *sdPermission="'SAMPLE_PRODUCT_CREATE'"
          title="<localized text>"
          aria-label="<localized text>"
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
  name: '<localized text>',
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
          title: '<localized text>',
          field: 'code',
          type: 'string',
          width: '120px',
          click: (_value, row) => this.#onDetail(row.id),
        },
        {
          title: '<localized text>',
          field: 'name',
          type: 'string',
          width: '250px',
        },
        {
          title: '<localized text>',
          field: 'price',
          type: 'number',
          width: '120px',
        },
        {
          title: '<localized text>',
          field: 'stock',
          type: 'number',
          width: '120px',
        },
        {
          title: '<localized text>',
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
          title: '<localized text>',
          field: 'isActivated',
          type: 'boolean',
          option: { displayOnTrue: '<localized text>', displayOnFalse: '<localized text>' },
          width: '120px',
        },
      ],
    });
  }

  onCreate(): void {
    this.#router.navigate(['create']);
  }

  async onChangeIsActivated(item: ProductDTO): Promise<void> {
    await this.#productService.update(item.id, { isActivated: item.isActivated });
    this.table.reload();
  }

  #onDetail(id: string): void {
    this.#router.navigate(['detail', id]);
  }
}
```

### File: `libs/sample/features/product/pages/detail/detail.component.ts`
```typescript
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
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
} from '<CORE_UI_PACKAGE_NAME>/components';
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
            *sdPermission="'SAMPLE_PRODUCT_DELETE'"
            title="<localized text>"
            aria-label="<localized text>"
            type="fill"
            color="error"
            prefixIcon="delete"
            (click)="onDelete()">
          </sd-button>
        }
        @if (state() === 'CREATE' || state() === 'UPDATE') {
          <sd-button
            title="<localized text>"
            aria-label="<localized text>"
            type="fill"
            prefixIcon="save"
            (click)="onSave()">
          </sd-button>
        }
        <sd-button
          title="<localized text>"
          aria-label="<localized text>"
          type="outline"
          prefixIcon="arrow_back"
          (click)="onBack()">
        </sd-button>
      </div>

      <div class="p-8">
        <sd-section>
          <sd-input
            label="<localized text>"
            [model]="entity.code"
            (modelChange)="onEntityFieldChange('code', $event)"
            [form]="form"
            required
            maxlength="32"
            [viewed]="isDetail()">
          </sd-input>

          <sd-input
            label="<localized text>"
            [model]="entity.name"
            (modelChange)="onEntityFieldChange('name', $event)"
            [form]="form"
            required
            maxlength="255"
            [viewed]="isDetail()">
          </sd-input>

          <sd-textarea
            label="<localized text>"
            [model]="entity.description"
            (modelChange)="onEntityFieldChange('description', $event)"
            [form]="form"
            maxlength="1000"
            [viewed]="isDetail()">
          </sd-textarea>

          <sd-input-number
            label="<localized text>"
            [model]="entity.price"
            (modelChange)="onEntityFieldChange('price', $event)"
            [form]="form"
            required
            [viewed]="isDetail()">
          </sd-input-number>

          <sd-input-number
            label="<localized text>"
            [model]="entity.stock"
            (modelChange)="onEntityFieldChange('stock', $event)"
            [form]="form"
            required
            [viewed]="isDetail()">
          </sd-input-number>

          <sd-select
            label="<localized text>"
            [model]="entity.category"
            (modelChange)="onEntityFieldChange('category', $event)"
            [form]="form"
            required
            [items]="PRODUCT_CATEGORIES"
            valueField="value"
            displayField="display"
            [viewed]="isDetail()">
          </sd-select>

          <sd-switch
            label="<localized text>"
            [model]="entity.isActivated"
            (modelChange)="onEntityFieldChange('isActivated', $event)"
            [form]="form"
            [viewed]="isDetail()">
          </sd-switch>

          @if (!isDetail()) {
            <sd-upload-file
              label="<localized text>"
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
  entity: Partial<ProductSaveReq & { id?: string }> = {};
  readonly pageTitle = computed(() => {
    if (this.state() === 'CREATE') return '<localized text>';
    return this.state() === 'DETAIL'<localized text>'<localized text>' : '<localized text>';
  });
  readonly isDetail = computed(() => this.state() === 'DETAIL');
  readonly PRODUCT_CATEGORIES = PRODUCT_CATEGORIES;

  @ViewChild('uploadFiles') uploadFiles!: SdUploadFile;

  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #productService = inject(ProductService);
  readonly #cdr = inject(ChangeDetectorRef);

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
    this.entity = { ...this.entity, [key]: value };
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
      this.entity = { ...this.entity, fileIds: fileIds.filter(Boolean) };
    }

    try {
      const { id, ...payload } = this.entity;

      if (id) {
        await this.#productService.update(id, payload as ProductSaveReq);
      } else {
        const newEntity = await this.#productService.create(payload as ProductSaveReq);
        this.entity = newEntity;
        this.state.set('UPDATE');
        this.#cdr.markForCheck();
      }
      this.#router.navigate(['..'], { relativeTo: this.#activatedRoute });
    } catch (error) {
      console.error(error);
    }
  }

  async onDelete(): Promise<void> {
    const currentEntity = this.entity;

    if (confirm('<localized text>') && currentEntity.id) {
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
      this.entity = await this.#productService.detail(id);
      this.#cdr.markForCheck();
    } catch (error) {
      console.error(error);
    }
  }
}
```

---
