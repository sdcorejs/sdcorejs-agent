# Screen — Detail Component (Shared Shell + State Branches)

The screen-detail reference pack [`screen-detail.md`](../write-code/screen-detail.md) (loaded on demand by the `angular-portal-write-code` orchestrator) owns all three states (CREATE / UPDATE / DETAIL) plus form refinement, because they all write to the **same file**: `src/libs/<module>/<entity>/pages/detail/detail.component.ts`. This ref consolidates the literal code so the developer sees the whole component in one place, with state-specific overlays grouped together.

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

### Imports

```typescript
import { Component, OnInit, signal, inject } from '@angular/core';
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
    this.pageTitle.set(`Tạo mới ${ENTITY_LABEL}`);
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
    this.entity.set(dto);
    this.form.patchValue(dto, { emitEvent: false });
    this.form.markAsPristine();
    const displayName = dto.name ?? dto.code ?? id;
    this.pageTitle.set(
      this.state() === 'DETAIL' ? `${ENTITY_LABEL}: ${displayName}` : `Cập nhật: ${displayName}`,
    );
    if (this.state() === 'DETAIL') {
      this.form.disable();
    } else {
      this.form.enable();
    }
  } catch (err) {
    this.#notify.warning('Không tìm thấy bản ghi, quay về danh sách');
    this.#router.navigate(['../../'], { relativeTo: this.#route, replaceUrl: true });
  } finally {
    this.#loading.hide();
  }
}
```

### Header buttons (template)

The `headerRight` block in the `sd-page` template branches on `state()`. Always include Back. Show Edit (DETAIL only) or Save (CREATE/UPDATE only) conditionally.

```html
<div class="d-flex align-items-center gap-8" headerRight>
  <sd-button title="Quay lại" type="outline" prefixIcon="arrow-left" size="sm" (click)="onBack()"></sd-button>

  @if (state() === 'DETAIL') {
    <sd-button
      *sdPermission="'<MODULE>_C_<ENTITY>_UPDATE'; sdPermissionKey: '<module>'"
      title="Chỉnh sửa" type="fill" prefixIcon="edit" size="sm" color="primary"
      (click)="onEdit()"
    ></sd-button>
  }
  @if (state() === 'CREATE' || state() === 'UPDATE') {
    <sd-button
      title="Lưu" type="fill" prefixIcon="save" size="sm" color="primary"
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
  this.#router.navigate(['../../update', this.entity()!.id], { relativeTo: this.#route });
}
```

`onSave()` is **state-specific** — see [`#create-state`](#create-state) (calls `service.create(...)`) and [`#update-state`](#update-state) (calls `service.update(id, ...)`).

### Conditional tab name & color

Used by `@SdTabComponent` to brand the tab differently per state:

```typescript
get pageTabName(): string {
  switch (this.state()) {
    case 'CREATE': return `Tạo mới ${ENTITY_LABEL}`;
    case 'UPDATE': return `Chỉnh sửa ${ENTITY_LABEL}`;
    case 'DETAIL': return `${ENTITY_LABEL} — Chi tiết`;
  }
}
get pageTabColor(): string {
  switch (this.state()) {
    case 'CREATE': return 'success';
    case 'UPDATE': return 'warning';
    case 'DETAIL': return 'primary';
  }
}
```

### Form field rendering (template)

For each schema field, render one control. The `[viewed]` / `[readonly]` flag binds to `state() === 'DETAIL'` so the same template serves all three states.

```html
<!-- IMPORTANT: @sdcorejs/angular form components do NOT implement ControlValueAccessor.
     Bind the parent FormGroup via [form]="form" and the control name via name="...".
     Each component self-registers into form via addControl(...) on init. -->

<!-- String -->
<sd-input [form]="form" name="code" label="Mã" [viewed]="state() === 'DETAIL'" [required]="true" maxLength="16"></sd-input>

<!-- Number -->
<sd-input-number [form]="form" name="salary" label="Lương" [viewed]="state() === 'DETAIL'" [min]="0" [decimals]="2"></sd-input-number>

<!-- Date -->
<sd-date [form]="form" name="birthday" label="Ngày sinh" [viewed]="state() === 'DETAIL'"></sd-date>

<!-- Select (static) -->
<sd-select [form]="form" name="role" label="Chức vụ" [viewed]="state() === 'DETAIL'"
  [items]="EMPLOYEE_ROLES" valueField="value" labelField="display"></sd-select>

<!-- Select (dynamic) -->
<sd-select [form]="form" name="departmentId" label="Phòng ban" [viewed]="state() === 'DETAIL'"
  apiEndpoint="/api/departments" valueField="id" labelField="name"></sd-select>

<!-- Boolean -->
<sd-switch [form]="form" name="isActivated" label="Kích hoạt" [disabled]="state() === 'DETAIL'"></sd-switch>

<!-- Textarea -->
<sd-textarea [form]="form" name="note" label="Ghi chú" [viewed]="state() === 'DETAIL'" rows="5"></sd-textarea>

<!-- File upload -->
<sd-upload-file [form]="form" name="image" label="Hình ảnh" [viewed]="state() === 'DETAIL'"
  [multiple]="false" acceptTypes=".jpg,.png,.gif"></sd-upload-file>

<!-- Rich text -->
<sd-editor [form]="form" name="description" label="Mô tả" [viewed]="state() === 'DETAIL'"></sd-editor>
```

Group fields by section if the schema declares them; otherwise wrap in one `<sd-section title="Thông tin chung">`.

---

## DETAIL state

Read-only branch reached via `/detail/:id`. Owned by [`screen-detail.md`](../write-code/screen-detail.md).

After `loadEntityData(id)` resolves, the form is disabled (`this.form.disable()` happens inside the shared loader when `state() === 'DETAIL'`). Every form control still uses `[viewed]="true"` (or `[disabled]="true"` for `sd-switch`) so values display read-only. No submit button; header shows only Back + Edit.

Edit transition (already in [`#navigation-helpers`](#navigation-helpers)):

```typescript
onEdit(): void {
  this.#router.navigate(['../../update', this.entity()!.id], { relativeTo: this.#route });
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
  this.pageTitle.set(`Tạo mới ${ENTITY_LABEL}`); // VI portal
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
    this.#notify.error('Vui lòng kiểm tra các trường bắt buộc');
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
    this.#notify.success('Tạo mới thành công');
    // Navigate back to list (default) OR to detail of the new record (opt-in)
    this.#router.navigate(['..'], { relativeTo: this.#route });
  } catch (err) {
    this.#notify.error('Tạo mới thất bại');
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
    this.entity.set(dto);
    this.form.patchValue(dto);
    this.form.markAsPristine();
    this.pageTitle.set(`Cập nhật: ${dto.name ?? dto.code ?? id}`);
    this.form.enable();   // UPDATE keeps form editable (DETAIL would .disable())
  } catch (err) {
    this.#notify.warning('Không tìm thấy bản ghi, quay về danh sách');
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
    this.#notify.error('Vui lòng kiểm tra các trường bắt buộc');
    return;
  }
  this.saving.set(true);
  try {
    this.#loading.show();
    if (this.uploadFiles().length) {
      await Promise.all(this.uploadFiles().map(f => f.upload()));
    }
    const payload = this.form.getRawValue() as EntitySaveReq;
    const id = this.entity()!.id;
    await this.#service.update(id, payload);
    this.#notify.success('Cập nhật thành công');
    // Navigate back to list (default) OR to detail of the same record (opt-in)
    this.#router.navigate(['..'], { relativeTo: this.#route });
  } catch (err) {
    this.#notify.error('Cập nhật thất bại');
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
