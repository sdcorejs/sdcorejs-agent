# Angular Skill: Reactive Form with Validation

## 1. Skill Name
**Reactive Form Builder with Validation**

## 2. Description
Generates reactive forms with practical validation patterns for sdcorejs screens. Supports both lightweight model-binding forms and stricter typed validation when needed.

This skill is a refinement step after module and entity ownership have already been resolved.

## 3. Rules

### MUST DO ✅
- Apply this skill only after module and entity context are known
- Allow lightweight `new FormGroup({})` for common forms and incremental validation
- Define required validation at component level (`required`, `maxlength`, `min`, `max`, etc.) and enforce at save time
- Use strong typing with interfaces
- Apply validators based on field criticality; do not over-constrain on first pass
- Show validation feedback when needed (warning/mark touched at save)
- Mark all fields as touched before save attempt (`form.markAllAsTouched()`)
- Use `[form]="form"` with `[(model)]="entity.field"` as default binding pattern
- Implement custom validators for business rules only when rule is confirmed
- Provide visual feedback via notify + field state
- Use `[form]="form"` parameter on SDCore input components
- Support workflow submit/save paths with shared validation gate (`onSave`, `onSubmit`)
- Use grid layout `row row-sm` for form sections to keep vertical spacing compact and consistent
- Use Vietnamese labels/messages for Vietnamese portals (title, button, field label, notify)
- Use **signal-first** style for form screen UI state:
  - `entity`, `mode/state`, `loading`, `submitting`, tab flags -> `signal()`
  - derived flags/messages (`isDetail`, `canSubmit`, `pageTitle`) -> `computed()`
  - keep `FormGroup` for validation, but do not model mutable UI state as plain class fields
  - example:
    ```typescript
    readonly state = signal<'CREATE' | 'UPDATE' | 'DETAIL'>('CREATE');
    readonly entity = signal<Partial<ProductSaveReq>>({});
    readonly pageTitle = computed(() => this.state() === 'CREATE' ? 'Tạo mới' : 'Chi tiết');
    ```
- Monitor signal invocation efficiency in templates:
  - If a signal is used **2 or more times** in the template, consider:
    - Extract to a `readonly #memoized = computed(() => ...)` to cache the value
    - OR use `@let` template syntax (where supported)
  - If a signal is used **only once**: invoke it directly, no optimization needed
  - Goal: reduce unnecessary getter invocations during change detection
- Generate runnable `*.spec.ts` for each form/detail component (not placeholder-only):
  - Mock required `inject()` dependencies (`Router`, `ActivatedRoute`, notify/loading/services)
  - Use `TestBed.overrideComponent` to isolate heavy template dependencies when needed
  - Ensure `fixture.detectChanges()` can run without DI/template errors
- Run tests right after generation and report status:
  - Preferred: `npm run test -- --watch=false --include=src/libs/[module]/modules/[entity]/**/*.spec.ts`
  - Fallback: `npm run test -- --watch=false` when include filter is unavailable

### MUST NOT ❌
- Skip form validation before submission
- Hard-code error messages (use i18n for translations)
- Add form logic to components (delegate to FormService if complex)
- Over-design validation rules at `CREATE` stage when business rules are still incomplete
- Allow form submission while invalid
- Duplicate validation logic across save/submit/approve handlers
- Store mutable form-screen UI state in plain mutable fields/getters instead of signals
- Overuse signal invocations in template without considering the 2+ times rule

## 4. Template

### form-validator.ts (Custom Validators - Shared)
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

### detail.component.ts (Lightweight model-binding first)
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
} from '@sd-angular/core/components';
import { SdFormsModule } from '@sd-angular/core/forms';
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

### detail-advanced.component.ts (With Dynamic Fields)
```typescript
import { Component, OnInit, FormBuilder, Validators, computed, inject, signal } from '@angular/core';
import { FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { SdInput, SdButton } from 'sd-angular';

@Component({
  selector: '[entity]-detail-advanced',
  standalone: true,
  imports: [ReactiveFormsModule, SdInput, SdButton],
  template: `
    <form [formGroup]="form">
      <sd-input
        label="Entity Name"
        formControlName="name"
        required>
      </sd-input>

      <!-- Dynamic form array for items -->
      <div formArrayName="items">
        @for (let item of items.controls; let i = $index) {
          <div [formGroupName]="i" class="item-group">
            <sd-input
              label="Item Name"
              formControlName="itemName"
              required>
            </sd-input>

            <sd-input
              label="Quantity"
              formControlName="quantity"
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
      </div>

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

## 5. Example Input

```
Create a reactive form for "Product" entity with:
- Code (required, max 32 chars)
- Name (required, max 255 chars)
- Price (required, min 0, decimal)
- Category (required, dropdown)
- Description (optional, max 1000 chars)
- IsActivated (boolean)
- Validation errors shown only when field is touched
```

### Precondition Reminder

```text
Before using this skill, the agent must already know:
- module name
- entity name
- the fields that belong to the detail screen
```

### Validation Strategy Reminder

```text
Default strategy for common screens:
- start with lightweight model-binding + FormGroup({})
- validate at save boundary with form.invalid + markAllAsTouched
- add stricter typed validators in a second refinement pass when business rules are stable

For workflow-enabled screens:
- route `Lưu`, `Lưu & Gửi duyệt`, or similar actions through one validation gate
- keep approve/reject actions independent from field validation when they operate on existing data
```

## 6. Example Output

### File: `libs/sample/modules/product/validators/product-validators.ts`
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

### File: `libs/sample/modules/product/pages/detail/detail.component.ts`
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
} from '@sd-angular/core/components';
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
          <form [formGroup]="form">
            <sd-input
              label="Code"
              formControlName="code"
              required
              maxlength="32"
              [viewed]="state() === 'DETAIL'">
              @if (getFieldError('code'); as error) {
                <span class="text-error">{{ getErrorMessage('code', error) }}</span>
              }
            </sd-input>

            <sd-input
              label="Name"
              formControlName="name"
              required
              maxlength="255"
              [viewed]="state() === 'DETAIL'">
              @if (getFieldError('name'); as error) {
                <span class="text-error">{{ getErrorMessage('name', error) }}</span>
              }
            </sd-input>

            <sd-textarea
              label="Description"
              formControlName="description"
              maxlength="1000"
              [viewed]="state() === 'DETAIL'">
            </sd-textarea>

            <sd-input-number
              label="Price"
              formControlName="price"
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
              formControlName="category"
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
              formControlName="isActivated"
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

---

## Implementation Checklist

- [ ] Define FormGroup structure in ngOnInit
- [ ] Apply appropriate validators to each field
- [ ] Handle form errors with proper validation state checks
- [ ] Show error messages only when field is touched
- [ ] Mark all fields as touched before submission
- [ ] Test form validation flows
- [ ] Implement custom validators if needed
- [ ] Test FormArray with dynamic controls (if applicable)
- [ ] Use patchValue for partial updates
- [ ] Use FormBuilder (not manual FormGroup creation)
