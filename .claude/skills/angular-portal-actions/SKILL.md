---
name: angular-portal-actions
description: Use when wiring action buttons or side-effects on detail / list pages — workflow transitions (approve / reject / submit-for-approval), bulk operations on selected rows, or any custom action button that triggers a service call (export, re-sync, recompute, send notification, mark-as-read, archive, etc). Owns placement rules (detail headerRight vs list selector.actions), confirmation dialogs, permission gates, post-action navigation / reload, and the "Lưu & Gửi duyệt" pattern that combines save + workflow transition. Triggers - "thêm action button", "action button", "approve flow", "workflow action", "bulk approve", "bulk action", "custom action", "side effect button", "gửi duyệt", "phê duyệt", "từ chối", "xuất excel", "đồng bộ lại". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 31 — Actions on Detail and List Pages

## Purpose

Define how to wire action buttons and side-effects on detail and list screens. "Action" here is **any button that calls a service method beyond the standard save / cancel** — workflow transitions are the most common case, but the rules below apply equally to:

- Workflow transitions: `submit`, `approve`, `reject`, `withdraw`, `publish`, `archive`
- Bulk operations on selected rows: bulk-approve, bulk-delete, bulk-export
- Custom side-effects: re-sync from upstream, recompute totals, send notification, mark-as-read, regenerate token, export to Excel, duplicate record
- Combined save + transition: "Lưu & Gửi duyệt" — save first, then call workflow method

Workflow actions are just one shape of action — the placement / confirm / permission / reload rules apply to all of them.

## When to use

- User asks "thêm action button", "custom action", "approve flow", "workflow", "bulk approve", "export excel", "gửi duyệt", "phê duyệt", "từ chối", "xuất excel", "đồng bộ lại"
- After [`21-screen-detail.md`](./21-screen-detail.md) or [`20-screen-list.md`](./20-screen-list.md) generated the base screen and you need to add side-effects on top
- When a single button needs to combine validation + save + workflow transition (the "save and submit" pattern)

Defer to:
- [`21-screen-detail.md`](./21-screen-detail.md) when the request is about the form / state machine itself (CREATE / UPDATE / DETAIL), not the side-effect buttons
- [`20-screen-list.md`](./20-screen-list.md) when the request is about table columns / paging / filters (NOT the row / bulk action buttons)

## Placement matrix

```text
Detail screen (headerRight):
  CREATE state:  Save / Save + Submit (if workflow)
  UPDATE state:  Save / Save + Submit (if editable)
  DETAIL state:  Edit (if editable)
                 Workflow: Approve / Reject (if approvable)
                 Custom side-effects: Export / Re-sync / Duplicate / etc.

List screen:
  Toolbar (above table):       Create, Reload, Filter
  Selector actions (per-row    Bulk-submit, Bulk-approve, Bulk-reject,
   menu when rows selected):   Bulk-delete, Bulk-export, etc.
  Row action column (always    Edit, Detail (inline icons per row)
   visible):
```

The decisive question for placement: **does the action operate on the current record (detail) or on a selection (list)?**

## Rules

### MUST DO ✅

- Pick the placement that matches the action's scope:
  - Single-record action that requires the full record context → **detail header**
  - Action that runs against N selected rows → **list `selector.actions`**
  - Quick per-row action without leaving the list → **row action column**
- Show actions **conditionally on state** (`CREATE` / `UPDATE` / `DETAIL`) + business flags (`approvable`, `editable`, `exportable`, `status === 'PENDING'`, etc.)
- Use the project's confirmation service for destructive or sensitive actions (`approve` / `reject` / `delete` / `bulk-*`)
- For workflow transitions that need a reason, use the **confirm-with-input** variant — operator types a note before submitting
- After a successful transition: notify success → reload the list / re-load the detail (so workflow status updates in UI)
- Gate every action with `*sdPermission` matching the project's chosen permission code shape
- Keep button titles **task-oriented and domain-consistent** ("Phê duyệt" not "OK"; "Xuất Excel" not "Action")
- For Vietnamese portals: full diacritics on button titles + confirm prompts; permission codes stay English
- For combined save + transition ("Lưu & Gửi duyệt"): route through the **same validation gate** as plain save (`form.invalid` → `markAllAsTouched()` → notify), then call `service.create/update` first, then `service.submit/...` on the returned id
- For bulk actions: confirm with row count in the message (`"Phê duyệt 3 bản ghi?"`), call `bulkXxx(ids)` in one round-trip, then reload the table

### MUST NOT ❌

- Expose approve / reject / submit in CREATE state (no record exists yet)
- Trigger workflow transitions WITHOUT confirmation for high-impact actions
- Mix bulk actions into detail-only context (or vice-versa)
- Hard-code action visibility without considering state AND permission AND business flags
- Call workflow methods that mutate without first reading current status (race conditions when another tab transitioned the record)
- Skip permission directive on action buttons even when the route guard covers the page (defense in depth)
- Forget to reload the list / detail after the transition — user sees stale data

## Action patterns — by category

### Workflow transition (approve / reject / submit / withdraw)

- Single-record: detail header, DETAIL state only, gated by `approvable` / `submittable` / etc. + permission
- Bulk: list `selector.actions`, gated by permission, confirm with row count
- "Save and submit" combo: replaces / adds beside the Save button in CREATE / UPDATE, routes through the same validation gate

### Custom side-effect (export / re-sync / recompute / etc.)

- Single-record: detail header, DETAIL state (don't surface in edit mode), gated by permission
- Bulk: list `selector.actions` if it makes sense to run on selection; otherwise list toolbar
- For long-running side-effects: show loading state via `SdLoadingService` + disable the button while in-flight to prevent double-clicks

### Destructive (delete / archive)

- Always confirm. For DELETE: highlight in confirmation that the action is irreversible
- Single-record delete on detail is rare — usually deletion happens from the list (bulk-delete on selected rows)
- For irreversible bulk: show the count + sample of what will be affected (`"Xóa 3 bản ghi: PRD-001, PRD-002, PRD-003?"`)

## Code templates

The literal HTML / TypeScript snippets for action wiring live in this skill body (they are short — no separate ref file). Use them as patterns; substitute domain-specific bits.

### Detail headerRight — full state-aware example

```html
<div class="d-flex align-items-center" style="gap: 8px" headerRight>
  <sd-button title="Bỏ qua" (click)="onBack()" color="primary"></sd-button>

  @if (state() === 'DETAIL' && entity()?.id) {
    @if (approvable()) {
      <sd-button
        *sdPermission="'<MODULE>_C_<ENTITY>_APPROVE'; sdPermissionKey: '<module>'"
        title="Từ chối" type="light" prefixIcon="thumb_down" color="primary"
        (click)="onReject()"></sd-button>
      <sd-button
        *sdPermission="'<MODULE>_C_<ENTITY>_APPROVE'; sdPermissionKey: '<module>'"
        title="Phê duyệt" type="light" prefixIcon="thumb_up" color="primary"
        (click)="onApprove()"></sd-button>
    }
    @if (editable()) {
      <sd-button
        *sdPermission="'<MODULE>_C_<ENTITY>_UPDATE'; sdPermissionKey: '<module>'"
        title="Chỉnh sửa" type="fill" prefixIcon="edit" color="primary"
        (click)="onEdit()"></sd-button>
    }
  } @else if (state() === 'CREATE' || (state() === 'UPDATE' && editable())) {
    <sd-button
      title="Lưu" type="fill" prefixIcon="save" color="primary"
      (click)="onSave()" [loading]="saving()"></sd-button>
    <sd-button
      *sdPermission="'<MODULE>_C_<ENTITY>_SUBMIT'; sdPermissionKey: '<module>'"
      title="Lưu & Gửi duyệt" type="fill" prefixIcon="send" color="primary"
      (click)="onSaveAndSubmit()" [loading]="saving()"></sd-button>
  }
</div>
```

### List selector.actions — bulk operations

```typescript
selector: {
  actions: [
    {
      icon: 'send',
      title: 'Gửi duyệt',
      action: rows => this.onBulkSubmit(rows),
    },
    {
      icon: 'thumb_up',
      title: 'Phê duyệt',
      action: rows => this.onBulkApprove(rows),
    },
    {
      icon: 'thumb_down',
      title: 'Từ chối',
      action: rows => this.onBulkReject(rows),
    },
    {
      icon: 'download',
      title: 'Xuất Excel',
      action: rows => this.onBulkExport(rows),
    },
  ],
}
```

### Component methods — workflow + custom side-effect

```typescript
onApprove = () => {
  this.#confirmService
    .withInput('Bạn có chắc chắn muốn phê duyệt?', {
      title: 'Xác nhận phê duyệt',
      yesTitle: 'Xác nhận',
      noTitle: 'Quay lại',
      noButtonColor: 'primary',
    })
    .then(note => this.#service.approve(this.entity()!.id, note))
    .then(() => {
      this.#notifyService.success('Phê duyệt thành công');
      return this.loadEntityData(this.entity()!.id);
    });
};

onReject = () => {
  this.#confirmService
    .withInput('Bạn có chắc chắn muốn từ chối?', {
      title: 'Xác nhận từ chối',
      yesTitle: 'Xác nhận',
      noTitle: 'Quay lại',
      noButtonColor: 'primary',
    })
    .then(note => this.#service.reject(this.entity()!.id, note))
    .then(() => {
      this.#notifyService.success('Từ chối thành công');
      return this.loadEntityData(this.entity()!.id);
    });
};

onSaveAndSubmit = async () => {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.#notifyService.error('Vui lòng kiểm tra các trường bắt buộc');
    return;
  }
  this.saving.set(true);
  try {
    this.#loadingService.show();
    const payload = this.form.getRawValue();
    const saved = this.state() === 'UPDATE'
      ? await this.#service.update(this.entity()!.id, payload)
      : await this.#service.create(payload);
    await this.#service.submit(saved.id);
    this.#notifyService.success('Lưu và gửi duyệt thành công');
    this.#router.navigate(['..'], { relativeTo: this.#route });
  } catch (err) {
    this.#notifyService.error('Lưu hoặc gửi duyệt thất bại');
  } finally {
    this.saving.set(false);
    this.#loadingService.hide();
  }
};

onBulkSubmit = (rows: EntityDTO[]) => {
  const ids = rows.map(r => r.id);
  this.#confirmService
    .confirm(`Gửi duyệt ${ids.length} bản ghi?`)
    .then(() => this.#service.bulkSubmit(ids))
    .then(() => {
      this.#notifyService.success('Gửi duyệt thành công');
      this.table.reload();
    });
};

// Custom side-effect — export to Excel (no confirm needed; it's read-only output)
onExport = async () => {
  this.#loadingService.show();
  try {
    const blob = await this.#service.exportExcel(this.entity()!.id);
    saveAs(blob, `${this.entity()!.code}.xlsx`);
  } finally {
    this.#loadingService.hide();
  }
};
```

## Implementation checklist

- [ ] Action defined with explicit scope (single-record / bulk / row-inline)
- [ ] Placement matches scope (detail header / list selector / row action column)
- [ ] Visibility gated by state + business flags + permission
- [ ] Confirm dialog for destructive or sensitive actions
- [ ] Workflow transition that needs a note → confirm-with-input
- [ ] Service method exists (create one if missing — single-record + bulk where applicable)
- [ ] Notify on success + reload list / detail
- [ ] `*sdPermission` directive on the button (defense in depth even if route guard exists)
- [ ] For "Save and Submit": routes through validation gate before either call; rollback on partial failure documented
- [ ] Button title task-oriented + bilingual (VI portal → diacritics)
- [ ] Loading state via `[loading]="saving()"` or `SdLoadingService.show/hide` to prevent double-clicks

## Anti-patterns

- Surfacing approve / reject in CREATE / UPDATE (state mismatch → confusing UX + bad data)
- Skipping the permission directive because "the route guard handles it" (defense in depth + UX: hide the button user can't use)
- Hard-coding action visibility independent of business state (`@if (true)` instead of `@if (approvable())`)
- Workflow transitions without reload — user sees stale status until manual refresh
- Bulk action without row count in confirm prompt
- Single action button doing both "save" AND "submit" without going through the validation gate
- Long-running side-effect without disabling the button — multiple clicks fire duplicate calls
- Trying to combine ALL actions into one menu — separate by scope, group only when truly the same scope

## Related skills

- [`21-screen-detail.md`](./21-screen-detail.md) — the detail component the action buttons attach to
- [`20-screen-list.md`](./20-screen-list.md) — the list component for `selector.actions` + row action column
- [`12-init-entity.md`](./12-init-entity.md) — when service methods (`approve`, `reject`, `bulkSubmit`, `exportExcel`) don't exist yet

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
