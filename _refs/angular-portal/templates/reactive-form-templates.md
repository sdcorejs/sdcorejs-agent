# Reactive Form — Code Templates

Code templates referenced from the screen-detail reference pack [`screen-detail.md`](../write-code/screen-detail.md) (form refinement section — validators, signal-first rules, FormArray; loaded on demand by the `angular-portal-write-code` orchestrator). The pack owns the validation strategy and the "lightweight first, strict second" doctrine; this file holds the literal templates.

## Table of contents

- [form-validator.ts — shared `SdValidators` class](#form-validatorts--shared-sdvalidators-class)
- [detail.component.ts — lightweight model-binding first](#detailcomponentts--lightweight-model-binding-first)
- [detail-advanced.component.ts — with `FormArray` (dynamic fields)](#detail-advancedcomponentts--with-formarray-dynamic-fields)
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
import { Component, OnInit, inject, viewChildren } from '@angular/core';
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
import { [Entity]DTO } from '../services/[entity].model';

@Component({
  selector: '[entity]-detail',
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
  readonly entity = signal<Partial<[Entity]DTO>>({});

  typeOptions = [
    { value: 'A', display: 'Loại A' },
    { value: 'B', display: 'Loại B' },
  ];

  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #service = inject([Entity]Service);

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
      this.entity.set(await this.#service.detail(id));
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

      const currentEntity = this.entity();
      if (currentEntity.id) {
        await this.#service.update(currentEntity.id, currentEntity as [Entity]DTO);
      } else {
        await this.#service.create(currentEntity as [Entity]DTO);
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
import { Component, OnInit, FormBuilder, Validators, computed, inject, signal } from '@angular/core';
import { FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { SdInput, SdButton } from 'sd-angular';

@Component({
  selector: '[entity]-detail-advanced',
  standalone: true,
  imports: [ReactiveFormsModule, SdInput, SdButton],
  template: `
    <!-- NOTE: @sdcorejs/angular form components self-register via [form]+name="..."
         (they do NOT implement ControlValueAccessor — formControlName won't bind).
         For FormArray/FormGroup nesting, pass the nested FormGroup instance to [form]. -->
    <form [formGroup]="form">
      <sd-input
        label="Entity Name"
        [form]="form"
        name="name"
        required>
      </sd-input>

      <!-- Dynamic form array for items -->
      @for (let itemGroup of items.controls; let i = $index) {
        <div class="item-group">
          <sd-input
            label="Item Name"
            [form]="itemGroup"
            name="itemName"
            required>
          </sd-input>

          <sd-input
            label="Quantity"
            [form]="itemGroup"
            name="quantity"
            type="number"
            required>
          </sd-input>

          <sd-button
            title="Remove"
            (click)="removeItem(i)"
            type="outline"
            color="error">
          </sd-button>
        </div>
      }

      <sd-button
        title="Add Item"
        (click)="addItem()"
        type="outline">
      </sd-button>

      <div class="form-actions">
        <sd-button
          title="Save"
          [disabled]="form.invalid"
          (click)="onSave()"
          type="fill">
        </sd-button>
      </div>
    </form>
  `,
})
export class DetailAdvancedComponent implements OnInit {
  form!: FormGroup;

  readonly #formBuilder = inject(FormBuilder);

  ngOnInit(): void {
    this.#initializeForm();
  }

  #initializeForm(): void {
    this.form = this.#formBuilder.group({
      name: ['', [Validators.required]],
      items: this.#formBuilder.array([
        this.#createItemFormGroup(),
      ]),
    });
  }

  #createItemFormGroup(): FormGroup {
    return this.#formBuilder.group({
      itemName: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  addItem(): void {
    this.items.push(this.#createItemFormGroup());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  async onSave(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log(this.form.value);
  }
}
```

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
import { Component, OnInit, FormBuilder, Validators, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
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

@Component({
  selector: 'product-detail',
  standalone: true,
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
              @if (getFieldError('code'); as error) {
                <span class="text-error">{{ getErrorMessage('code', error) }}</span>
              }
            </sd-input>

            <sd-input
              label="Name"
              [form]="form"
              name="name"
              required
              maxlength="255"
              [viewed]="state() === 'DETAIL'">
              @if (getFieldError('name'); as error) {
                <span class="text-error">{{ getErrorMessage('name', error) }}</span>
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
              @if (getFieldError('price'); as error) {
                <span class="text-error">{{ getErrorMessage('price', error) }}</span>
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
              @if (getFieldError('category'); as error) {
                <span class="text-error">{{ getErrorMessage('category', error) }}</span>
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
  readonly entity = signal<Partial<ProductSaveReq>>({});
  readonly pageTitle = computed(() => {
    if (this.state() === 'CREATE') return 'Tạo sản phẩm';
    return this.state() === 'DETAIL' ? 'Chi tiết sản phẩm' : 'Cập nhật sản phẩm';
  });
  readonly PRODUCT_CATEGORIES = PRODUCT_CATEGORIES;

  readonly #formBuilder = inject(FormBuilder);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #productService = inject(ProductService);

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
      this.entity.set(entity);
      this.form.patchValue(entity);
      this.form.markAsPristine();
    } catch (error) {
      console.error(error);
    }
  }

  async onSave(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    try {
      const currentEntity = this.entity();
      if (currentEntity.id) {
        await this.#productService.update(currentEntity.id, formValue);
      } else {
        this.entity.set(await this.#productService.create(formValue));
      }
      this.#router.navigate(['..'], { relativeTo: this.#activatedRoute });
    } catch (error) {
      console.error(error);
    }
  }

  async onDelete(): Promise<void> {
    const currentEntity = this.entity();
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

  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (field?.touched && field?.errors) {
      return Object.keys(field.errors)[0];
    }
    return null;
  }

  getErrorMessage(fieldName: string, errorType: string): string {
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
