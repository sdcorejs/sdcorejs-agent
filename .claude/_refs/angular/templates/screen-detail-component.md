# Screen — Detail Component (Shared Shell + State Branches)

The screen-detail reference pack [`screen-detail.md`](../write-code/screen-detail.md) (loaded on demand by the `sdcorejs-angular` orchestrator) owns all three states (CREATE / UPDATE / DETAIL) plus form refinement, because they all write to the **same file**: `src/libs/<module>/<entity>/pages/detail/detail.component.ts`. This ref consolidates the literal code so the developer sees the whole component in one place, with state-specific overlays grouped together.

Sections to consult based on what you're generating / refining:
- Shared shell (imports, FormGroup, ngOnInit dispatcher, loader, header buttons, nav helpers, tab name, form-field rendering): [`#shared-shell`](#shared-shell)
- DETAIL state-specific rules: [`#detail-state`](#detail-state)
- CREATE state-specific rules: [`#create-state`](#create-state)
- UPDATE state-specific rules: [`#update-state`](#update-state)

Placeholders: `{{ entityPascal }}`, `{{ entityKebab }}`, `ENTITY_LABEL` (VI display name constant), `<MODULE>` / `<ENTITY>` / `<module>` (permission code parts), `EntitySaveReq` (the entity's request type).

## Table of contents

- [Shared shell](#shared-shell)
  - [State discriminator](#state-discriminator)
  - [Imports](#imports)
  - [FormGroup definition](#formgroup-definition)
  - [Route resolution (ngOnInit dispatcher)](#route-resolution-ngoninit-dispatcher)
  - [Shared entity loader (with stale-id recovery)](#shared-entity-loader-with-stale-id-recovery)
  - [Header buttons (template)](#header-buttons-template)
  - [Navigation helpers](#navigation-helpers)
  - [Conditional tab name & color](#conditional-tab-name--color)
  - [Form field rendering (template)](#form-field-rendering-template)
  - [Editable child collection rendering (template)](#editable-child-collection-rendering-template)
- [DETAIL state](#detail-state)
- [CREATE state](#create-state)
- [UPDATE state](#update-state)

---

## Shared shell

The parts of `detail.component.ts` that do NOT vary by state. State-specific overlays live in the three state sections below.

### State discriminator

```typescript
type ViewState = 'CREATE' | 'UPDATE' | 'DETAIL';
```

Stored as a signal: `state = signal<ViewState>('DETAIL')`.
Editable entity/form models are plain objects/ViewModels, not signals: `<localized text>`.

Generated detail components must set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component`.
Derived flags such as `isDetail`, `canSave`, titles, and tab color must be `computed()`, not getters or template-called methods.

### Imports

```typescript
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, computed, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SdPageComponent, SdPermissionDirective } from '@sdcorejs/angular/modules';
import { SdButton, SdTabComponent } from '@sdcorejs/angular/components';
import {
  SdInput, SdInputNumber, SdDate, SdDatetime,
  SdSelect, SdSwitch, SdTextarea, SdUploadFile,
} from '@sdcorejs/angular/forms';
import { SdLoadingService, SdNotifyService } from '@sdcorejs/angular/services';
import { {{ entityPascal }}DTO, {{ entityPascal }}SaveReq } from '../../services/{{ entityKebab }}.model';
import { {{ entityPascal }}Service } from '../../services/{{ entityKebab }}.service';
```

When a detail screen has a child collection/table, add the table imports only after the Core UI docs confirm this project's table API:

```typescript
import { SdTable, SdTableCellDefDirective, type SdTableOption } from '@sdcorejs/angular/components/table';
```

When the shell stores loaded entity data outside a signal, inject `ChangeDetectorRef`:

```typescript
entity: Partial<{{ entityPascal }}SaveReq & { id?: string }> = {};
readonly #cdr = inject(ChangeDetectorRef);
```

### FormGroup definition

Build form controls from the EntitySchema. One control per field that is `visibleInDetail: true`. Validators come from the schema:

```typescript
private initForm(): void {
  this.form = this.#fb.group({
    code: ['', [Validators.required, Validators.maxLength(16)]],
    name: ['', [Validators.required]],
    birthday: [''],
    role: [''],
    salary: ['', [Validators.min(0)]],
    isActivated: [false],
    note: [''],
    // ... one entry per visibleInDetail field
  });
}
```

### Route resolution (ngOnInit dispatcher)

Routes `/create`, `/update/:id`, `/detail/:id` all land on this component. `ngOnInit` reads the URL segment + id and sets the correct state:

```typescript
ngOnInit() {
  this.initForm();
  const id = this.#route.snapshot.paramMap.get('id');
  const segment = this.#route.snapshot.url[0]?.path; // 'create' | 'update' | 'detail'

  if (!id) {
    // CREATE branch — see #create-state
    this.state.set('CREATE');
    this.applyDefaults();
    this.form.enable();
    this.pageTitle.set(`<localized text>`);
    return;
  }
  if (segment === 'update') {
    // UPDATE branch — see #update-state
    this.state.set('UPDATE');
    this.loadEntityData(id); // shared loader, leaves form enabled
    return;
  }
  // DETAIL branch — see #detail-state
  this.state.set('DETAIL');
  this.loadEntityData(id);
}
```

### Shared entity loader (with stale-id recovery)

Used by DETAIL and UPDATE. Stale-id recovery is shared — if `service.detail(id)` throws, notify and navigate back to list with `replaceUrl: true`.

```typescript
private async loadEntityData(id: string): Promise<void> {
  try {
    this.#loading.show();
    const dto = await this.#service.detail(id);
    this.entity = dto;
    this.form.patchValue(dto, { emitEvent: false });
    this.form.markAsPristine();
    const displayName = dto.name ?? dto.code ?? id;
    this.pageTitle.set(
      this.state() === 'DETAIL' ? `${ENTITY_LABEL}: ${displayName}` : `<localized text>`,
    );
    if (this.state() === 'DETAIL') {
      this.form.disable();
    } else {
      this.form.enable();
    }
    this.#cdr.markForCheck();
  } catch (err) {
    this.#notify.warning('<localized text>');
    this.#router.navigate(['../../'], { relativeTo: this.#route, replaceUrl: true });
  } finally {
    this.#loading.hide();
  }
}
```

### Header buttons (template)

The `headerRight` block in the `sd-page` template branches on `state()`. Always include Back. Show Edit (DETAIL only) or Save (CREATE/UPDATE only) conditionally. Because `state()` is read more than once, cache it with `@let`.

```html
<div class="d-flex align-items-center gap-8" headerRight>
  @let _state = state();
  <sd-button title="<localized text>" type="outline" prefixIcon="arrow-left" size="sm" (click)="onBack()"></sd-button>

  @if (_state === 'DETAIL') {
    <sd-button
      *sdPermission="'<MODULE>_C_<ENTITY>_UPDATE'; sdPermissionKey: '<module>'"
      title="<localized text>" type="fill" prefixIcon="edit" size="sm" color="primary"
      (click)="onEdit()"
    ></sd-button>
  }
  @if (_state === 'CREATE' || _state === 'UPDATE') {
    <sd-button
      title="<localized text>" type="fill" prefixIcon="save" size="sm" color="primary"
      (click)="onSave()"
      [disabled]="!form.valid || saving()"
    ></sd-button>
  }
</div>
```

### Navigation helpers

```typescript
onBack(): void {
  this.#router.navigate(['..'], { relativeTo: this.#route });
}

onEdit(): void {
  // DETAIL → UPDATE transition
  this.#router.navigate(['../../update', this.entity.id], { relativeTo: this.#route });
}
```

`onSave()` is **state-specific** — see [`#create-state`](#create-state) (calls `service.create(...)`) and [`#update-state`](#update-state) (calls `service.update(id, ...)`).

### Conditional tab name & color

Used by `@SdTabComponent` to brand the tab differently per state:

```typescript
readonly pageTabName = computed(() => {
  switch (this.state()) {
    case 'CREATE': return `<localized text>`;
    case 'UPDATE': return `<localized text>`;
    case 'DETAIL': return `<localized text>`;
  }
});

readonly pageTabColor = computed(() => {
  switch (this.state()) {
    case 'CREATE': return 'success';
    case 'UPDATE': return 'warning';
    case 'DETAIL': return 'primary';
  }
});
```

### Form field rendering (template)

For each schema field, render one control. The `[viewed]` / `[readonly]` flag binds to a computed `isDetail()` so the same template serves all three states without repeated inline conditions.

```typescript
readonly isDetail = computed(() => this.state() === 'DETAIL');
```

```html
<!-- IMPORTANT: @sdcorejs/angular form components do NOT implement ControlValueAccessor.
     Bind the parent FormGroup via [form]="form" and the control name via name="...".
     Each component self-registers into form via addControl(...) on init. -->
@let _isDetail = isDetail();

<!-- String -->
<sd-input [form]="form" name="code" label="<localized text>" [viewed]="_isDetail" [required]="true" maxLength="16"></sd-input>

<!-- Number -->
<sd-input-number [form]="form" name="salary" label="<localized text>" [viewed]="_isDetail" [min]="0" [decimals]="2"></sd-input-number>

<!-- Date -->
<sd-date [form]="form" name="birthday" label="<localized text>" [viewed]="_isDetail"></sd-date>

<!-- Select (static) -->
<sd-select [form]="form" name="role" label="<localized text>" [viewed]="_isDetail"
  [items]="EMPLOYEE_ROLES" valueField="value" labelField="display"></sd-select>

<!-- Select (dynamic) -->
<sd-select [form]="form" name="departmentId" label="<localized text>" [viewed]="_isDetail"
  apiEndpoint="/api/departments" valueField="id" labelField="name"></sd-select>

<!-- Boolean -->
<sd-switch [form]="form" name="isActivated" label="<localized text>" [disabled]="_isDetail"></sd-switch>

<!-- Textarea -->
<sd-textarea [form]="form" name="note" label="<localized text>" [viewed]="_isDetail" rows="5"></sd-textarea>

<!-- File upload -->
<sd-upload-file [form]="form" name="image" label="<localized text>" [viewed]="_isDetail"
  [multiple]="false" acceptTypes=".jpg,.png,.gif"></sd-upload-file>

<!-- Rich text -->
<sd-editor [form]="form" name="description" label="<localized text>" [viewed]="_isDetail"></sd-editor>
```

Group fields by section if the schema declares them; otherwise wrap in one `<localized text>`.

### Editable child collection rendering (template)

Use this when the detail screen has line items or another repeated child collection. The parent `FormGroup` owns the child `FormArray`; the view must not keep a second mutable list for the same rows.

#### Inline table shape for read-only or light inline editing

Use `sd-table` only when the fetched Core UI table docs and an existing local usage confirm projected cells are supported for this version. For heavy spreadsheet-like editing, use the row-editor fallback below.

```typescript
type LineItemRow = {
  rowKey: string;
  formGroup: FormGroup;
  index: number;
  productId?: string;
  quantity?: number;
  unitPrice?: number;
  action?: string;
};

readonly lineItemsRevision = signal(0);
readonly lineItemRows = computed<LineItemRow[]>(() => {
  this.lineItemsRevision();
  return this.lineItems.controls.map((control, index) => ({
    rowKey: control.get('id'<localized text>'tempId')?.value ?? String(index),
    formGroup: control as FormGroup,
    index,
    productId: control.get('productId')?.value,
    quantity: control.get('quantity')?.value,
    unitPrice: control.get('unitPrice')?.value,
  }));
});

private refreshLineItemsRows(): void {
  this.lineItemsRevision.update(value => value + 1);
}

lineItemsTableOption: SdTableOption<LineItemRow> = {
  key: '{{ entityKebab }}-line-items',
  type: 'local',
  paginate: { hidden: true },
  filter: { hideInlineFilter: true, hideExternalFilterToolbar: true },
  items: () => this.lineItemRows(),
  columns: [
    { field: 'index', type: 'number', title: '#', width: '56px' },
    { field: 'productId', type: 'string', title: 'San pham', cell: {} },
    { field: 'quantity', type: 'number', title: 'So luong', width: '140px', cell: {} },
    { field: 'unitPrice', type: 'number', title: 'Don gia', width: '160px', cell: {} },
    { field: 'action', type: 'string', title: '', width: '80px', cell: {} },
  ],
};
```

```html
<sd-section noPaddingBody>
  <div class="d-flex align-items-center justify-content-between gap-12 p-16">
    <div class="d-flex flex-column gap-4">
      <span class="T16B">Chi tiet dong</span>
      <span class="T12R text-black500">{{ lineItems.length }} dong</span>
    </div>

    @if (!isDetail()) {
      <sd-button title="Them dong" type="outline" prefixIcon="add" size="sm" (click)="addLineItem()"></sd-button>
    }
  </div>

  @if (lineItems.length) {
    <sd-table [option]="lineItemsTableOption" autoId="{{ entityKebab }}_line_items">
      <ng-template sdTableCellDef="productId" let-item="item">
        <sd-select
          [form]="item.formGroup"
          name="productId"
          label="San pham"
          size="sm"
          hideInlineError
          [viewed]="isDetail()"
          [items]="productOptions"
          valueField="id"
          displayField="name"
        ></sd-select>
      </ng-template>

      <ng-template sdTableCellDef="quantity" let-item="item">
        <sd-input-number
          [form]="item.formGroup"
          name="quantity"
          label="So luong"
          size="sm"
          hideInlineError
          [viewed]="isDetail()"
          [min]="1"
        ></sd-input-number>
      </ng-template>

      <ng-template sdTableCellDef="unitPrice" let-item="item">
        <sd-input-number
          [form]="item.formGroup"
          name="unitPrice"
          label="Don gia"
          size="sm"
          hideInlineError
          [viewed]="isDetail()"
          [min]="0"
        ></sd-input-number>
      </ng-template>

      <ng-template sdTableCellDef="action" let-item="item">
        @if (!isDetail()) {
          <sd-button
            title="Xoa"
            type="icon"
            color="error"
            prefixIcon="delete"
            size="sm"
            (click)="removeLineItem(item.index)"
          ></sd-button>
        }
      </ng-template>
    </sd-table>
  } @else {
    <div class="d-flex flex-column align-items-center justify-content-center gap-12 p-24">
      <span class="T14R text-black500">Chua co dong nao</span>
      @if (!isDetail()) {
        <sd-button title="Them dong dau tien" type="outline" prefixIcon="add" size="sm" (click)="addLineItem()"></sd-button>
      }
    </div>
  }
</sd-section>
```

Table-cell form controls must use `size="sm"` and `hideInlineError` so row height stays stable. Surface row errors in a compact summary below the table when needed, not as tall inline text inside every cell.

After `addLineItem()` / `removeLineItem()`, call `refreshLineItemsRows()` and reload the table if the local table instance does not pick up the new `items()` result automatically. Form value edits inside cells do not require rebuilding rows because the controls are bound through each row `FormGroup`.

#### Sectioned row-editor fallback

Use this fallback when the Core UI table cannot safely host editable controls or the row has more than 3-4 editable fields.

```html
<sd-section noPaddingBody>
  <div class="d-flex align-items-center justify-content-between gap-12 p-16">
    <div class="d-flex flex-column gap-4">
      <span class="T16B">Chi tiet dong</span>
      <span class="T12R text-black500">{{ lineItems.length }} dong</span>
    </div>

    @if (!isDetail()) {
      <sd-button title="Them dong" type="outline" prefixIcon="add" size="sm" (click)="addLineItem()"></sd-button>
    }
  </div>

  <div class="d-flex flex-column gap-12 px-16 pb-16">
    @for (itemGroup of lineItems.controls; track rowKey(itemGroup); let i = $index) {
      <div class="row row-sm align-items-start">
        <div class="col-12 col-md-5">
          <sd-select [form]="itemGroup" name="productId" label="San pham" [viewed]="isDetail()" required></sd-select>
        </div>
        <div class="col-6 col-md-2">
          <sd-input-number [form]="itemGroup" name="quantity" label="So luong" [viewed]="isDetail()" [min]="1" required></sd-input-number>
        </div>
        <div class="col-6 col-md-3">
          <sd-input-number [form]="itemGroup" name="unitPrice" label="Don gia" [viewed]="isDetail()" [min]="0"></sd-input-number>
        </div>
        <div class="col-12 col-md-2 d-flex justify-content-end gap-8 pt-24">
          @if (!isDetail()) {
            <sd-button title="Xoa" type="icon" color="error" prefixIcon="delete" size="sm" (click)="removeLineItem(i)"></sd-button>
          }
        </div>
      </div>
    } @empty {
      <div class="d-flex flex-column align-items-center justify-content-center gap-12 p-24">
        <span class="T14R text-black500">Chua co dong nao</span>
        @if (!isDetail()) {
          <sd-button title="Them dong dau tien" type="outline" prefixIcon="add" size="sm" (click)="addLineItem()"></sd-button>
        }
      </div>
    }
  </div>
</sd-section>
```

Do not wrap each row in a nested card unless the existing screen already uses that exact pattern. The fallback is still a structured form layout with predictable spacing.

---

## DETAIL state

Read-only branch reached via `/detail/:id`. Owned by [`screen-detail.md`](../write-code/screen-detail.md).

After `loadEntityData(id)` resolves, the form is disabled (`this.form.disable()` happens inside the shared loader when `state() === 'DETAIL'`). Every form control still uses `[viewed]="true"` (or `[disabled]="true"` for `sd-switch`) so values display read-only. No submit button; header shows only Back + Edit.

Edit transition (already in [`#navigation-helpers`](#navigation-helpers)):

```typescript
onEdit(): void {
  this.#router.navigate(['../../update', this.entity.id], { relativeTo: this.#route });
}
```

Stale-id recovery is implemented inside the shared loader — see [`#shared-entity-loader-with-stale-id-recovery`](#shared-entity-loader-with-stale-id-recovery). The DETAIL branch does not add any additional code beyond that.

---

## CREATE state

Empty-form branch reached via `/create`. Rules in [`screen-detail.md` § CREATE state rules](../write-code/screen-detail.md).

### State detection (CREATE branch of the dispatcher)

The shared [`ngOnInit dispatcher`](#route-resolution-ngoninit-dispatcher) already covers the `if (!id) { ... }` CREATE branch. For reference, the body of that branch is:

```typescript
if (!id) {
  this.state.set('CREATE');
  this.form.enable();
  this.pageTitle.set(`<localized text>`); // VI portal
  this.applyDefaults();   // see below
  return;
}
```

`applyDefaults()` patches domain defaults into the form before render — `isActivated: true`, `status: 'DRAFT'`, parent-id from `route.snapshot.queryParamMap.get('parentId')` when scaffolding child entities.

### CREATE-specific `onSave()`

```typescript
async onSave(): Promise<void> {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.#notify.error('<localized text>');
    return;
  }
  this.saving.set(true);
  try {
    this.#loading.show();
    if (this.uploadFiles().length) {
      await Promise.all(this.uploadFiles().map(f => f.upload()));
    }
    const payload = this.form.getRawValue() as EntitySaveReq;
    const created = await this.#service.create(payload);
    this.#notify.success('<localized text>');
    // Navigate back to list (default) OR to detail of the new record (opt-in)
    this.#router.navigate(['..'], { relativeTo: this.#route });
  } catch (err) {
    this.#notify.error('<localized text>');
  } finally {
    this.saving.set(false);
    this.#loading.hide();
  }
}
```

Key points:
- File uploads happen BEFORE `service.create(...)` so the entity carries the resolved file ids
- Navigation default: `['..']` (relative-up) → list page. Alternative (opt-in): `['../detail', created.id]`
- Save button uses `*sdPermission="'<MODULE>_C_<ENTITY>_CREATE'; sdPermissionKey: '<module>'"`

---

## UPDATE state

Prefilled-editable-form branch reached via `/update/:id`. Rules in [`screen-detail.md` § UPDATE state rules](../write-code/screen-detail.md).

### State detection (UPDATE branch of the dispatcher)

The shared [`ngOnInit dispatcher`](#route-resolution-ngoninit-dispatcher) already covers the UPDATE branch:

```typescript
if (segment === 'update') {
  this.state.set('UPDATE');
  this.loadEntityData(id);   // shared with DETAIL — UPDATE keeps form editable
  return;
}
```

### UPDATE-flavored loader override (optional)

The shared loader at [`#shared-entity-loader-with-stale-id-recovery`](#shared-entity-loader-with-stale-id-recovery) already enables the form when `state() === 'UPDATE'`. If the project keeps a state-specific variant, the shape is:

```typescript
private async loadEntityData(id: string): Promise<void> {
  try {
    this.#loading.show();
    const dto = await this.#service.detail(id);
    this.entity = dto;
    this.form.patchValue(dto);
    this.form.markAsPristine();
    this.pageTitle.set(`<localized text>`);
    this.form.enable();   // UPDATE keeps form editable (DETAIL would .disable())
    this.#cdr.markForCheck();
  } catch (err) {
    this.#notify.warning('<localized text>');
    this.#router.navigate(['../../'], { relativeTo: this.#route, replaceUrl: true });
  } finally {
    this.#loading.hide();
  }
}
```

Prefer the shared loader unless the project really needs distinct UPDATE-vs-DETAIL behavior beyond enable/disable.

### UPDATE-specific `onSave()`

```typescript
async onSave(): Promise<void> {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.#notify.error('<localized text>');
    return;
  }
  this.saving.set(true);
  try {
    this.#loading.show();
    if (this.uploadFiles().length) {
      await Promise.all(this.uploadFiles().map(f => f.upload()));
    }
    const payload = this.form.getRawValue() as EntitySaveReq;
    const id = this.entity.id;
    await this.#service.update(id, payload);
    this.#notify.success('<localized text>');
    // Navigate back to list (default) OR to detail of the same record (opt-in)
    this.#router.navigate(['..'], { relativeTo: this.#route });
  } catch (err) {
    this.#notify.error('<localized text>');
  } finally {
    this.saving.set(false);
    this.#loading.hide();
  }
}
```

Key points:
- File uploads happen BEFORE `service.update(id, ...)`
- Navigation default: `['..']`. Alternative (opt-in): `['../../detail', id]`
- Save button + the "Edit" button on the DETAIL state both gated by `<MODULE>_C_<ENTITY>_UPDATE`
- Stale-id recovery is shared with DETAIL — see [`#shared-entity-loader-with-stale-id-recovery`](#shared-entity-loader-with-stale-id-recovery)
