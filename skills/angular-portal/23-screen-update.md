---
name: angular-portal-screen-update
description: Use when generating or refining the UPDATE state of an entity detail screen (URL `/update/:id`, prefilled form, calls `service.update(id, ...)` on submit, navigates back to list or detail on success). Shares the same component shell as 21-screen-detail.md. Triggers - "màn update", "trang chỉnh sửa", "edit form", "update screen", "sửa bản ghi". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 23 — Screen: UPDATE state

## Purpose
Implement the UPDATE branch of an entity's `pages/detail/detail.component.ts`. This is the prefilled-editable-form state used when the user hits `/update/:id`. The component shell (template, imports, signals, navigation helpers) is owned by `21-screen-detail.md`; this skill only adds UPDATE-specific rules.

## When to use
- User asks "tạo màn update cho ...", "edit page", "form chỉnh sửa", "update screen"
- Generating a fresh entity and the UPDATE state has not been wired yet
- Refining an existing detail component that does not yet handle the UPDATE branch correctly (missing prefill, missing stale-id recovery, wrong navigation)

If the user is asking about read-only DETAIL or about the empty CREATE state, defer to `21-screen-detail.md` or `22-screen-create.md`.

## Reference: shared component shell
Read `21-screen-detail.md` first for:
- file path (`pages/detail/detail.component.ts`)
- `ViewState = 'CREATE' | 'UPDATE' | 'DETAIL'` discriminator
- imports of `SdInput / SdSelect / SdDate / SdTextarea`
- the FormGroup definition (do not redefine here)
- `pageTitle`, `headerRight` button structure
- the `onBack()` flow

UPDATE shares the entity-loading helper (`loadEntityData(id)`) with DETAIL, but enables instead of disables the form.

## UPDATE-state rules

### Route
`{ path: 'update/:id', loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent), data: { permission: '<MODULE>_C_<ENTITY>_UPDATE', permissionKey: '<module>' } }`

### State detection
```typescript
ngOnInit() {
  const id = this.#route.snapshot.paramMap.get('id');
  const segment = this.#route.snapshot.url[0]?.path; // 'update' | 'detail'
  if (id && segment === 'update') {
    this.state.set('UPDATE');
    this.loadEntityData(id);   // shared with DETAIL — but this branch keeps form editable
    return;
  }
  // ... CREATE / DETAIL branches handled in 22-screen-create.md / 21-screen-detail.md
}
```

### Form prefill + enable
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
    // see "Stale-id recovery" below
    this.#notify.warning('Không tìm thấy bản ghi, quay về danh sách');
    this.#router.navigate(['../../'], { relativeTo: this.#route, replaceUrl: true });
  } finally {
    this.#loading.hide();
  }
}
```

### Stale-id recovery
If `service.detail(id)` throws `Entity not found` (record was deleted in another tab), the component MUST:
1. Show a warning notify
2. Navigate back to the list (`../..`) with `replaceUrl: true` so back button does not re-enter the broken URL
3. NOT leave the form blank/half-filled

This rule is shared between UPDATE and DETAIL — see `21-screen-detail.md`.

### File uploads
Same pattern as CREATE: `await Promise.all(this.uploadFiles().map(f => f.upload()))` BEFORE `service.update(id, ...)`.

### Submit
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

### Navigation after success
Default: navigate up (`['..']`) — typically returns to list. Alternative (opt-in): navigate to the read-only `detail/:id` view. Document choice in auto-doc.

### Permission gate
- Route: `data.permission: '<MODULE>_C_<ENTITY>_UPDATE'`
- Save button: `*sdPermission="'<MODULE>_C_<ENTITY>_UPDATE'; sdPermissionKey: '<module>'"`
- "Edit" button on DETAIL state (which navigates here) is gated by the same code

### Concurrency / dirty-check (optional, opt-in)
For high-contention entities (orders, approvals): consider checking `dto.updatedAt` against last-known timestamp, prompt user to reload if changed. Do NOT implement this by default — only when user requests it.

## Anti-patterns
- Forgetting to call `form.enable()` after `patchValue` (form stays disabled if shared shell defaulted to disable)
- Calling `service.create(...)` when in UPDATE state — must call `service.update(id, ...)`
- Skipping the stale-id recovery branch (broken UX when record is deleted elsewhere)
- Uploading files AFTER `service.update(...)` (orphans blobs on failure)
- Reusing the same submit handler with `if (this.entity().id) update else create` BUT forgetting to set `state` properly — keep the state-aware branching explicit
- Hardcoding the success navigation target without checking user preference
- Forgetting `data.permission` on the `/update/:id` route
- Mixing approve/reject buttons into UPDATE — those belong in DETAIL when the workflow is in an approvable state (see `31-workflow-actions.md`)
