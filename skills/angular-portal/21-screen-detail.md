---
name: angular-portal-screen-detail
description: Use when generating or refining the read-only DETAIL state of a record (URL `/detail/:id`, fields rendered as read-only via `[viewed]` or `sd-section-item`). This skill owns the SHARED component shell and the DETAIL state rules. CREATE state lives in 22-screen-create.md, UPDATE state in 23-screen-update.md. Triggers - "màn detail", "trang chi tiết", "view record", "read-only screen". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 21 — Screen: DETAIL state (and shared component shell)

## Purpose
Implement the DETAIL branch of an entity's `pages/detail/detail.component.ts`, AND own the **shared shell** (imports, FormGroup, route resolution, navigation helpers) that is reused by the CREATE and UPDATE states.

The same component file handles all three states (`/create`, `/update/:id`, `/detail/:id`). This skill is the source of truth for the parts that do NOT vary by state. State-specific rules live in:

- `22-screen-create.md` — CREATE state (empty form, `service.create(...)`, navigate to list)
- `23-screen-update.md` — UPDATE state (prefilled form, `service.update(id, ...)`, navigate to list/detail)

## When to use
- User asks "tạo màn detail cho ...", "trang chi tiết", "read-only screen", "view record"
- Generating a fresh entity and the DETAIL state has not been wired yet
- Refining an existing detail component that does not yet handle DETAIL correctly (form not disabled, missing Edit button, missing back navigation)
- Generating the **shared shell** for the first time (this skill must run before 22 and 23 can do their state-specific overlays)

If the user is asking about the empty CREATE state or the editable UPDATE state, defer to `22-screen-create.md` or `23-screen-update.md`.

## Shared component shell

### File path
`src/libs/<module>/<entity>/pages/detail/detail.component.ts`

### State discriminator
```typescript
type ViewState = 'CREATE' | 'UPDATE' | 'DETAIL';
```
Stored as a signal: `state = signal<ViewState>('DETAIL')`.

### Imports (shared across all 3 states)
```typescript
import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SdPageComponent, SdPermissionDirective } from '@sd-angular/core/modules';
import { SdButton, SdTabComponent } from '@sd-angular/core/components';
import {
  SdInput, SdInputNumber, SdDate, SdDatetime,
  SdSelect, SdSwitch, SdTextarea, SdUploadFile,
} from '@sd-angular/core/forms';
import { SdLoadingService, SdNotifyService } from '@sd-angular/core/services';
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

### Route resolution (dispatch to state branches)
```typescript
ngOnInit() {
  this.initForm();
  const id = this.#route.snapshot.paramMap.get('id');
  const segment = this.#route.snapshot.url[0]?.path; // 'create' | 'update' | 'detail'

  if (!id) {
    // CREATE branch — see 22-screen-create.md
    this.state.set('CREATE');
    this.applyDefaults();
    this.form.enable();
    this.pageTitle.set(`Tạo mới ${ENTITY_LABEL}`);
    return;
  }
  if (segment === 'update') {
    // UPDATE branch — see 23-screen-update.md
    this.state.set('UPDATE');
    this.loadEntityData(id); // shared loader, leaves form enabled
    return;
  }
  // DETAIL branch (this skill)
  this.state.set('DETAIL');
  this.loadEntityData(id);
}
```

### Shared entity loader
Used by DETAIL and UPDATE. Stale-id recovery is shared too — if `service.detail(id)` throws, notify and navigate back to list with `replaceUrl: true`.

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
The `headerRight` block in the `sd-page` template branches on `state()`. Always include the back button. Add Edit (DETAIL only) or Save (CREATE/UPDATE only) conditionally.

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

### Navigation helpers (shared)
```typescript
onBack(): void {
  this.#router.navigate(['..'], { relativeTo: this.#route });
}

onEdit(): void {
  // DETAIL → UPDATE transition
  this.#router.navigate(['../../update', this.entity()!.id], { relativeTo: this.#route });
}
```

`onSave()` is **state-specific** — defined in 22-screen-create.md (calls `service.create(...)`) and 23-screen-update.md (calls `service.update(id, ...)`).

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

### Form field rendering (shared)
For each schema field, render one control. The `[viewed]` / `[readonly]` flag binds to `state() === 'DETAIL'` so the same template serves all three states.

```html
<!-- IMPORTANT: @sd-angular/core form components do NOT implement ControlValueAccessor.
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

## DETAIL-state rules

### Route
`{ path: 'detail/:id', loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent), data: { permission: '<MODULE>_C_<ENTITY>_VIEW', permissionKey: '<module>' } }`

### Form behavior
- Form is **disabled** after `loadEntityData(id)` resolves (`this.form.disable()` in the shared loader when `state() === 'DETAIL'`).
- Every form control renders with `[viewed]="true"` (or `[disabled]="true"` for `sd-switch`) so values display read-only.
- No submit button. The header shows only Back + Edit (the latter gated by the UPDATE permission).
- `markAllAsTouched()` and validity checks are NOT used here — there is no save flow.

### Edit transition
Clicking Edit dispatches to the UPDATE state:
```typescript
onEdit(): void {
  this.#router.navigate(['../../update', this.entity()!.id], { relativeTo: this.#route });
}
```
The Edit button is only visible when the user has `<MODULE>_C_<ENTITY>_UPDATE`.

### Stale-id recovery
If `service.detail(id)` throws (record deleted in another tab):
1. Show warning notify
2. Navigate to list (`['../../']`) with `replaceUrl: true` so back button does not re-enter the broken URL
3. Do NOT leave the form blank

This rule is shared with UPDATE — implementation lives in `loadEntityData` above.

### Permission gate
- Route: `data.permission: '<MODULE>_C_<ENTITY>_VIEW'`
- Edit button: `*sdPermission="'<MODULE>_C_<ENTITY>_UPDATE'; sdPermissionKey: '<module>'"`

### Workflow integration
If the entity has workflow (see `31-workflow-actions.md`), DETAIL is where approve/reject/withdraw buttons appear — gated by both `state() === 'DETAIL'` AND the current workflow status. Those buttons are described in 31, not here.

## AI Generation Checklist (shared shell + DETAIL)
- Component file at `pages/detail/detail.component.ts` with frontmatter imports above
- `state` signal initialized to `'DETAIL'`
- `initForm()` builds FormGroup from schema
- `ngOnInit` resolves route to one of CREATE / UPDATE / DETAIL and dispatches
- `loadEntityData(id)` shared by DETAIL and UPDATE, with stale-id recovery
- `onBack()` and `onEdit()` defined
- Template `headerRight` has Back + state-conditional Edit / Save
- Form fields render with `[viewed]="state() === 'DETAIL'"`
- DETAIL route registered with `_VIEW` permission
- Edit button gated by `_UPDATE` permission

## Anti-patterns
- Treating DETAIL as "just disable the form" without also branding the page title and tab color differently
- Forgetting `replaceUrl: true` on stale-id recovery (back button re-enters the broken URL)
- Showing the Save button in DETAIL state (only Back + Edit belong there)
- Calling `service.detail(id)` from CREATE — only DETAIL/UPDATE need it (see 22)
- Duplicating the FormGroup definition across three files — it lives here, in the shared shell
- Hardcoding the Edit button without a permission directive
- Mixing approve/reject buttons into the shell — those belong in `31-workflow-actions.md`

## Related skills
- [`22-screen-create.md`](./22-screen-create.md) — CREATE state (empty form, submit creates record)
- [`23-screen-update.md`](./23-screen-update.md) — UPDATE state (prefilled form, submit updates record)
- [`30-reactive-form.md`](./30-reactive-form.md) — form-level refinements (cross-field validators, dynamic visibility)
- [`31-workflow-actions.md`](./31-workflow-actions.md) — approve / reject / submit-for-approval buttons on DETAIL
