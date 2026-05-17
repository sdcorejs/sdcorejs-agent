---
name: angular-portal-workflow-actions
description: Use when wiring action buttons or workflow side-effects (approve/reject, submit-for-approval, bulk actions, status transitions) on detail or list pages. Triggers - "thêm action button", "approve flow", "workflow actions", "bulk approve", "gửi duyệt", "phê duyệt", "từ chối". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Angular Skill: Workflow Actions in Detail and List

## 1. Skill Name
**Workflow Actions for Detail and List**

## 2. Description
Defines how to generate business workflow actions such as submit for approval, approve, reject, and other state-driven operations across detail and list screens.

This skill ensures action placement is consistent:
- detail actions for a single record lifecycle
- list actions for bulk operations on selected rows

## 3. Rules

### MUST DO ✅
- Model actions based on explicit business states and permissions
- Keep primary record actions in detail headerRight (save, submit, approve, reject, edit)
- Show actions conditionally by state (`CREATE`, `UPDATE`, `DETAIL`)
- Use service methods for workflow transitions (`submit`, `approve`, `reject`, etc.)
- Use confirmation dialogs for destructive or sensitive actions
- Support bulk list actions when the use case includes multi-record workflow
- Gate actions with permission checks where applicable
- Keep action labels task-oriented and domain-consistent

### MUST NOT ❌
- Expose approve/reject actions in `CREATE` state
- Trigger workflow transitions without confirmation for high-impact actions
- Mix bulk actions into detail-only context
- Hard-code action visibility without considering state and permission

## 4. Template

### Action Decision Matrix
```text
Detail screen:
- CREATE: Save / Save and Submit
- UPDATE: Save / Save and Submit (if editable)
- DETAIL: Edit (if editable), Approve/Reject (if approvable)

List screen:
- Always: create, reload, filter
- Optional bulk actions when workflow requires mass transition:
  - bulk submit
  - bulk approve
  - bulk reject
  - bulk delete (if allowed)
```

### detail actions template
```html
<div class="d-flex align-items-center" style="gap: 8px" headerRight>
  <sd-button title="Bỏ qua" (click)="onBack()" color="primary"></sd-button>

  @if (state === 'DETAIL' && entity?.id) {
    @if (approvable) {
      <sd-button title="Từ chối" type="light" prefixIcon="thumb_down" color="primary" (click)="onReject()"></sd-button>
      <sd-button title="Phê duyệt" type="light" prefixIcon="thumb_up" color="primary" (click)="onApprove()"></sd-button>
    }
    @if (editable) {
      <sd-button title="Chỉnh sửa" type="fill" prefixIcon="edit" color="primary" (click)="onUpdate()"></sd-button>
    }
  } @else if (state === 'CREATE' || (state === 'UPDATE' && editable)) {
    <sd-button title="Lưu & Gửi duyệt" type="fill" prefixIcon="send" color="primary" (click)="onSave()" [loading]="saving"></sd-button>
  }
</div>
```

### list bulk actions template
```typescript
selector: {
  actions: [
    {
      icon: 'send',
      title: 'Gửi duyệt',
      click: rows => this.onBulkSubmit(rows),
    },
    {
      icon: 'thumb_up',
      title: 'Phê duyệt',
      click: rows => this.onBulkApprove(rows),
    },
    {
      icon: 'thumb_down',
      title: 'Từ chối',
      click: rows => this.onBulkReject(rows),
    },
  ],
}
```

### component methods template
```typescript
onApprove = () => {
  this.#confirmService
    .withInput('Bạn có chắc chắn muốn phê duyệt?', {
      title: 'Xác nhận phê duyệt',
      yesTitle: 'Xác nhận',
      noTitle: 'Quay lại',
      noButtonColor: 'primary',
    })
    .then(note => this.#service.approve(this.entity.id!, note))
    .then(() => this.#notifyService.success('Phê duyệt thành công'));
};

onReject = () => {
  this.#confirmService
    .withInput('Bạn có chắc chắn muốn từ chối?', {
      title: 'Xác nhận từ chối',
      yesTitle: 'Xác nhận',
      noTitle: 'Quay lại',
      noButtonColor: 'primary',
    })
    .then(note => this.#service.reject(this.entity.id!, note))
    .then(() => this.#notifyService.success('Từ chối thành công'));
};

onBulkSubmit = (rows: [Entity]DTO[]) => {
  const ids = rows.map(r => r.id);
  this.#confirmService.confirm(`Gửi duyệt ${ids.length} bản ghi`).then(() => {
    this.#service.bulkSubmit(ids).then(() => {
      this.#notifyService.success('Gửi duyệt thành công');
      this.table.reload();
    });
  });
};
```

## 5. Example Input

```text
Tạo màn product có workflow gửi duyệt, duyệt, từ chối.
Ở list cần hỗ trợ gửi duyệt hàng loạt.
```

## 6. Example Output

```text
Detail:
- CREATE/UPDATE: hiển thị nút "Lưu & Gửi duyệt"
- DETAIL: hiển thị "Phê duyệt" và "Từ chối" khi approvable = true
- DETAIL: hiển thị "Chỉnh sửa" khi editable = true

List:
- thêm selector actions: "Gửi duyệt" cho selected rows
- gọi service bulkSubmit(ids)
- confirm trước khi gửi duyệt
```

## Implementation Checklist

- [ ] Define workflow states and permission flags
- [ ] Add detail header actions by state
- [ ] Add confirm dialogs for approve/reject/submit
- [ ] Add service transition methods (single + bulk if needed)
- [ ] Add list selector actions for bulk operations
- [ ] Reload list/detail after transition success
