# Reactive Form — Code Templates

Code templates referenced from the screen-detail reference pack [`screen-detail.md`](../write-code/screen-detail.md) (form refinement section — validators, signal-first rules, FormArray; loaded on demand by the `sdcorejs-angular` orchestrator). The pack owns the validation strategy and the "lightweight first, strict second" doctrine; this file holds the literal templates.

## Table of contents

- [form-validator.ts — shared `SdValidators` class](#form-validatorts--shared-sdvalidators-class)
- [detail.component.ts — lightweight model-binding first](#detailcomponentts--lightweight-model-binding-first)
- [detail-advanced.component.ts — with `FormArray` (dynamic fields)](#detail-advancedcomponentts--with-formarray-dynamic-fields)
- [Editable line-item FormArray contract](#editable-line-item-formarray-contract)
- [Worked example: Product entity](#worked-example-product-entity)
  - [product-validators.ts](#libssampleffeaturesproductvalidatorsproduct-validatorsts)
  - [product detail component with field-level errors](#libssampleffeaturesproductpagesdetaildetailcomponentts)

---

## form-validator.ts — shared `SdValidators` class

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, first } from 'rxjs/operators';

export class SdValidators {
  // Validate that field is not only whitespace
  static notBlank(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return /^\s+$/.test(control.value) ? { notBlank: true } : null;
    };
  }

  // Validate phone number format
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const phoneRegex = /^[0-9]{10,15}$/;
      return phoneRegex.test(control.value) ? null : { invalidPhone: true };
    };
  }

  // Validate email format
  static email(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(control.value) ? null : { invalidEmail: true };
    };
  }

  // Validate URL format
  static url(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      try {
        new URL(control.value);
        return null;
      } catch {
        return { invalidUrl: true };
      }
    };
  }

  // Check unique value (async - requires service)
  static uniqueValue(service: any, fieldName: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) return of(null);
      return service.checkUnique(fieldName, control.value).pipe(
        debounceTime(300),
        distinctUntilChanged(),
        first(),
        map(isUnique => (isUnique ? null : { duplicateValue: true })),
        catchError(() => of(null))
      );
    };
  }
}
```

## detail.component.ts — lightweight model-binding first

Default starting point: `[form]="form"` + `[(model)]="entity.field"` binding, validation gated at save time. No FormBuilder, no per-field validators in TypeScript — let the template attributes (`required`, `maxlength`, `min`) drive validation.

```typescript
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, signal, viewChildren } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  SdButton,
  SdInput,
  SdInputNumber,
  SdSelect,
  SdDatetime,
  SdUploadFile,
  SdSection,
} from '@sdcorejs/angular/components';
import { SdFormsModule } from '@sdcorejs/angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { [Entity]Service } from '../services/[entity].service';
import { [Entity]SaveReq } from '../services/[entity].model';

@Component({
  selector: '[entity]-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SdFormsModule,
    SdButton,
    SdSection,
    SdInput,
    SdInputNumber,
    SdSelect,
    SdDatetime,
    SdUploadFile,
  ],
  template: `
    <sd-section title="Thông tin chung" noPaddingBody>
      <div class="row row-sm mx-0">
        <div class="col-4">
          <sd-input
            label="Mã"
            [(model)]="entity.code"
            [form]="form"
            required
            maxlength="32">
          </sd-input>
        </div>

        <div class="col-4">
          <sd-input
            label="Tên"
            [(model)]="entity.name"
            [form]="form"
            required
            maxlength="255">
          </sd-input>
        </div>

        <div class="col-4">
          <sd-input-number
            label="Giá"
            [(model)]="entity.price"
            [form]="form"
            required>
          </sd-input-number>
        </div>

        <div class="col-4">
          <sd-select
            label="Loại"
            [(model)]="entity.type"
            [form]="form"
            required
            [items]="typeOptions"
            valueField="value"
            displayField="display">
          </sd-select>
        </div>

        <div class="col-4">
          <sd-datetime label="Ngày hiệu lực" [(model)]="entity.effectiveAt" [form]="form" required></sd-datetime>
        </div>

        <div class="col-8">
          <sd-upload-file label="Tệp đính kèm" [(model)]="entity.fileIds" [form]="form"></sd-upload-file>
        </div>
      </div>
    </sd-section>

    <div class="d-flex align-items-center" style="gap: 8px">
      <sd-button title="Bỏ qua" (click)="onCancel()"></sd-button>
      <sd-button title="Lưu" type="fill" (click)="onSave()" [loading]="saving()"></sd-button>
    </div>
  `,
})
export class DetailComponent implements OnInit {
  uploadFiles = viewChildren(SdUploadFile);

  form = new FormGroup({});
  readonly saving = signal(false);
  readonly state = signal<'CREATE' | 'UPDATE' | 'DETAIL'>('CREATE');
  entity: Partial<[Entity]SaveReq & { id?: string }> = {};

  typeOptions = [
    { value: 'A', display: 'Loại A' },
    { value: 'B', display: 'Loại B' },
  ];

  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #service = inject([Entity]Service);
  readonly #cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const id = this.#activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.state.set('UPDATE');
      this.#loadEntity(id);
    } else {
      this.state.set('CREATE');
    }
  }

  async #loadEntity(id: string): Promise<void> {
    try {
      this.entity = await this.#service.detail(id);
      this.#cdr.markForCheck();
    } catch (error) {
      console.error(error);
    }
  }

  async onSave(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    try {
      if (this.uploadFiles().length) {
        await Promise.all(this.uploadFiles().map(file => file.upload()));
      }

      const { id, ...payload } = this.entity;
      if (id) {
        await this.#service.update(id, payload as [Entity]SaveReq);
      } else {
        await this.#service.create(payload as [Entity]SaveReq);
      }
      this.#router.navigate(['..'], { relativeTo: this.#activatedRoute });
    } catch (error) {
      console.error(error);
    } finally {
      this.saving.set(false);
    }
  }

  onCancel(): void {
    this.#router.navigate(['..'], { relativeTo: this.#activatedRoute });
  }
}
```

## detail-advanced.component.ts — with `FormArray` (dynamic fields)

Use this shape only when the screen has repeating sub-records (line items, attachments-with-metadata, multi-row config). For flat forms, the lightweight template above is preferred.

```typescript
import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SdButton, SdSection } from '@sdcorejs/angular/components';
import { SdInput, SdInputNumber } from '@sdcorejs/angular/forms';

@Component({
  selector: '[entity]-detail-advanced',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SdButton, SdSection, SdInput, SdInputNumber],
  template: `
    <!-- NOTE: @sdcorejs/angular form components self-register via [form]+name="..."
         (they do NOT implement ControlValueAccessor - formControlName won't bind).
         For FormArray/FormGroup nesting, pass the nested FormGroup instance to [form]. -->
    <div class="d-flex flex-column gap-16">
      <sd-section title="Thong tin chung" noPaddingBody>
        <div class="row row-sm mx-0">
          <div class="col-12 col-md-6">
            <sd-input label="Ten" [form]="form" name="name" [viewed]="isDetail()" required></sd-input>
          </div>
        </div>
      </sd-section>

      <sd-section noPaddingBody>
        <div class="d-flex align-items-center justify-content-between gap-12 p-16">
          <div class="d-flex flex-column gap-4">
            <span class="T16B">Danh sach dong</span>
            <span class="T12R text-black500">{{ items.length }} dong</span>
          </div>

          @if (!isDetail()) {
            <sd-button title="Them dong" type="outline" prefixIcon="add" size="sm" (click)="addItem()"></sd-button>
          }
        </div>

        <div class="d-flex flex-column gap-12 px-16 pb-16">
          @for (itemGroup of items.controls; track rowKey(itemGroup); let i = $index) {
            <div class="row row-sm align-items-start">
              <div class="col-12 col-md-6">
                <sd-input label="Ten dong" [form]="itemGroup" name="itemName" [viewed]="isDetail()" required></sd-input>
              </div>
              <div class="col-8 col-md-4">
                <sd-input-number label="So luong" [form]="itemGroup" name="quantity" [viewed]="isDetail()" [min]="1" required></sd-input-number>
              </div>
              <div class="col-4 col-md-2 d-flex justify-content-end gap-8 pt-24">
                @if (!isDetail()) {
                  <sd-button title="Xoa" type="icon" color="error" prefixIcon="delete" size="sm" (click)="removeItem(i)"></sd-button>
                }
              </div>
            </div>
          } @empty {
            <div class="d-flex flex-column align-items-center justify-content-center gap-12 p-24">
              <span class="T14R text-black500">Chua co dong nao</span>
              @if (!isDetail()) {
                <sd-button title="Them dong dau tien" type="outline" prefixIcon="add" size="sm" (click)="addItem()"></sd-button>
              }
            </div>
          }
        </div>
      </sd-section>

      <div class="d-flex align-items-center justify-content-end gap-8">
        <sd-button title="Luu" type="fill" prefixIcon="save" [disabled]="form.invalid" (click)="onSave()"></sd-button>
      </div>
    </div>
  `,
})
export class DetailAdvancedComponent implements OnInit {
  form!: FormGroup;
  items!: FormArray;
  readonly isDetail = computed(() => false);

  readonly #formBuilder = inject(FormBuilder);

  ngOnInit(): void {
    this.#initializeForm();
  }

  #initializeForm(): void {
    this.items = this.#formBuilder.array([
      this.#createItemFormGroup(),
    ]);

    this.form = this.#formBuilder.group({
      name: ['', [Validators.required]],
      items: this.items,
    });
  }

  #createItemFormGroup(): FormGroup {
    return this.#formBuilder.group({
      tempId: [crypto.randomUUID()],
      itemName: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  addItem(): void {
    this.items.push(this.#createItemFormGroup());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  rowKey(itemGroup: unknown): string {
    const group = itemGroup as FormGroup;
    return group.get('id')?.value ?? group.get('tempId')?.value ?? String(this.items.controls.indexOf(group));
  }

  async onSave(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const payload = this.#normalizePayload();
    console.log(payload);
  }

  #normalizePayload(): Record<string, unknown> {
    const raw = this.form.getRawValue();
    return {
      ...raw,
      items: raw.items.map(({ tempId, ...item }: Record<string, unknown>) => item),
    };
  }
}
```

## Editable line-item FormArray contract

Use this contract for detail tables with add/remove/edit rows. It is intentionally explicit so generated UI has one source of truth and predictable save behavior.

```typescript
interface LineItemSaveReq {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice?: number;
  note?: string;
  _deleted?: boolean;
}

interface ParentSaveReq {
  name: string;
  items: LineItemSaveReq[];
}

form = this.#fb.group({
  name: ['', [Validators.required]],
  items: this.#fb.array<FormGroup>([]),
});

get lineItems(): FormArray<FormGroup> {
  return this.form.get('items') as FormArray<FormGroup>;
}

#createLineItemGroup(item?: Partial<LineItemSaveReq>): FormGroup {
  return this.#fb.group({
    id: [item?.id ?? null],
    tempId: [crypto.randomUUID()],
    productId: [item?.productId ?? null, [Validators.required]],
    quantity: [item?.quantity ?? 1, [Validators.required, Validators.min(1)]],
    unitPrice: [item?.unitPrice ?? null, [Validators.min(0)]],
    note: [item?.note ?? null],
    _deleted: [item?._deleted ?? false],
  });
}

setLineItems(items: LineItemSaveReq[]): void {
  this.lineItems.clear();
  for (const item of items) {
    this.lineItems.push(this.#createLineItemGroup(item));
  }
}

addLineItem(): void {
  this.lineItems.push(this.#createLineItemGroup());
  this.form.markAsDirty();
}

removeLineItem(index: number): void {
  const group = this.lineItems.at(index) as FormGroup;
  const persistedId = group.get('id')?.value;

  if (persistedId) {
    group.patchValue({ _deleted: true });
  } else {
    this.lineItems.removeAt(index);
  }

  this.form.markAsDirty();
}

rowKey(group: unknown): string {
  const formGroup = group as FormGroup;
  return formGroup.get('id')?.value ?? formGroup.get('tempId')?.value ?? String(this.lineItems.controls.indexOf(formGroup));
}

#buildPayload(): ParentSaveReq {
  const raw = this.form.getRawValue();
  return {
    ...raw,
    items: raw.items
      .filter((item: LineItemSaveReq) => item.id || !item._deleted)
      .map(({ tempId, ...item }: LineItemSaveReq & { tempId?: string }) => item),
  };
}
```

Rules:

- The `FormArray` is the source of truth for the child rows. Do not maintain `itemsForDisplay` unless it is a read-only `computed()` derived from the form.
- Persisted rows keep their `id`; new rows use `tempId` only for `track`.
- Remove unsaved rows physically; mark persisted rows as `_deleted` only when the backend expects delete markers.
- Use `getRawValue()` so disabled fields required by the API are not dropped.
- Strip UI-only fields (`tempId`, `_expanded`, `_editing`) before save.
- On invalid save, call `form.markAllAsTouched()` once and stop. Do not save parent data while child rows are invalid.

## Worked example: Product entity

Use this when the lightweight model-binding shape isn't enough — typically when fields need typed validators (custom regex, cross-field rules) and surfaced error messages per field.

### `libs/sample/features/product/validators/product-validators.ts`

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ProductValidators {
  static positivePrice(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return control.value > 0 ? null : { negativePrice: true };
    };
  }

  static validSku(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const skuRegex = /^[A-Z0-9\-]{5,20}$/;
      return skuRegex.test(control.value) ? null : { invalidSku: true };
    };
  }
}
```

### `libs/sample/features/product/pages/detail/detail.component.ts`

```typescript
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  SdButton,
  SdInput,
  SdInputNumber,
  SdPageComponent,
  SdSection,
  SdSelect,
  SdSwitch,
  SdTextarea,
} from '@sdcorejs/angular/components';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductDTO, ProductSaveReq, PRODUCT_CATEGORIES } from '../../services/product.model';
import { ProductValidators } from '../../validators/product-validators';

type ProductFieldName = 'code' | 'name' | 'price' | 'category' | 'description';

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
    SdSection,
    SdSelect,
    SdSwitch,
    SdTextarea,
  ],
  template: `
    <sd-page [title]="pageTitle()">
      @let _fieldErrors = fieldErrorMessages();
      <div class="d-flex gap-8" headerRight>
        @if (state() === 'UPDATE') {
          <sd-button
            title="Delete"
            type="fill"
            color="error"
            prefixIcon="delete"
            (click)="onDelete()">
          </sd-button>
        }
        @if (state() !== 'DETAIL') {
          <sd-button
            title="Save"
            type="fill"
            prefixIcon="save"
            [disabled]="form.invalid"
            (click)="onSave()">
          </sd-button>
        }
        <sd-button
          title="Back"
          type="outline"
          prefixIcon="arrow_back"
          (click)="onBack()">
        </sd-button>
      </div>

      <div class="p-8">
        <sd-section>
          <!-- NOTE: @sdcorejs/angular form components self-register via [form]+name="..."
               (they do NOT implement ControlValueAccessor — formControlName won't bind). -->
          <form [formGroup]="form">
            <sd-input
              label="Code"
              [form]="form"
              name="code"
              required
              maxlength="32"
              [viewed]="state() === 'DETAIL'">
              @if (_fieldErrors.code; as message) {
                <span class="text-error">{{ message }}</span>
              }
            </sd-input>

            <sd-input
              label="Name"
              [form]="form"
              name="name"
              required
              maxlength="255"
              [viewed]="state() === 'DETAIL'">
              @if (_fieldErrors.name; as message) {
                <span class="text-error">{{ message }}</span>
              }
            </sd-input>

            <sd-textarea
              label="Description"
              [form]="form"
              name="description"
              maxlength="1000"
              [viewed]="state() === 'DETAIL'">
            </sd-textarea>

            <sd-input-number
              label="Price"
              [form]="form"
              name="price"
              required
              [min]="0"
              [step]="0.01"
              [viewed]="state() === 'DETAIL'">
              @if (_fieldErrors.price; as message) {
                <span class="text-error">{{ message }}</span>
              }
            </sd-input-number>

            <sd-select
              label="Category"
              [form]="form"
              name="category"
              required
              [items]="PRODUCT_CATEGORIES"
              valueField="value"
              displayField="display"
              [viewed]="state() === 'DETAIL'">
              @if (_fieldErrors.category; as message) {
                <span class="text-error">{{ message }}</span>
              }
            </sd-select>

            <sd-switch
              label="Active"
              [form]="form"
              name="isActivated"
              [viewed]="state() === 'DETAIL'">
            </sd-switch>
          </form>
        </sd-section>
      </div>
    </sd-page>
  `,
})
export class DetailComponent implements OnInit {
  form!: FormGroup;
  readonly state = signal<'CREATE' | 'UPDATE' | 'DETAIL'>('CREATE');
  entity: Partial<ProductSaveReq & { id?: string }> = {};
  readonly pageTitle = computed(() => {
    if (this.state() === 'CREATE') return 'Tạo sản phẩm';
    return this.state() === 'DETAIL' ? 'Chi tiết sản phẩm' : 'Cập nhật sản phẩm';
  });
  readonly fieldErrorMessages = signal<Record<ProductFieldName, string | null>>({
    code: null,
    name: null,
    price: null,
    category: null,
    description: null,
  });
  readonly PRODUCT_CATEGORIES = PRODUCT_CATEGORIES;

  readonly #formBuilder = inject(FormBuilder);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #productService = inject(ProductService);
  readonly #cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.#initializeForm();
    const url = this.#router.url;
    const id = this.#activatedRoute.snapshot.paramMap.get('id');

    if (url.includes('update') && id) {
      this.state.set('UPDATE');
      this.#loadEntity(id);
    } else if (url.includes('detail') && id) {
      this.state.set('DETAIL');
      this.#loadEntity(id);
    } else {
      this.state.set('CREATE');
    }
  }

  #initializeForm(): void {
    this.form = this.#formBuilder.group({
      code: ['', [Validators.required, Validators.maxLength(32)]],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.maxLength(1000)]],
      price: [null, [Validators.required, Validators.min(0)]],
      category: ['', [Validators.required]],
      isActivated: [true],
    });
  }

  async #loadEntity(id: string): Promise<void> {
    try {
      const entity = await this.#productService.detail(id);
      this.entity = entity;
      this.form.patchValue(entity);
      this.form.markAsPristine();
      this.#cdr.markForCheck();
    } catch (error) {
      console.error(error);
    }
  }

  async onSave(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.#refreshFieldErrorMessages();
      return;
    }

    const formValue = this.form.value;
    try {
      const { id } = this.entity;
      if (id) {
        await this.#productService.update(id, formValue);
      } else {
        this.entity = await this.#productService.create(formValue);
        this.#cdr.markForCheck();
      }
      this.#router.navigate(['..'], { relativeTo: this.#activatedRoute });
    } catch (error) {
      console.error(error);
    }
  }

  async onDelete(): Promise<void> {
    const currentEntity = this.entity;
    if (confirm('Are you sure?') && currentEntity.id) {
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

  #refreshFieldErrorMessages(): void {
    this.fieldErrorMessages.set({
      code: this.#messageFor('code'),
      name: this.#messageFor('name'),
      price: this.#messageFor('price'),
      category: this.#messageFor('category'),
      description: this.#messageFor('description'),
    });
  }

  #messageFor(fieldName: ProductFieldName): string | null {
    const field = this.form.get(fieldName);
    if (!field?.touched || !field.errors) return null;
    const errorType = Object.keys(field.errors)[0];
    const messages: Record<string, Record<string, string>> = {
      code: {
        required: 'Code is required',
        maxlength: 'Code must not exceed 32 characters',
      },
      name: {
        required: 'Name is required',
        maxlength: 'Name must not exceed 255 characters',
      },
      price: {
        required: 'Price is required',
        min: 'Price must be greater than 0',
      },
      category: {
        required: 'Category is required',
      },
      description: {
        maxlength: 'Description must not exceed 1000 characters',
      },
    };
    return messages[fieldName]?.[errorType] || 'Invalid field';
  }
}
```
