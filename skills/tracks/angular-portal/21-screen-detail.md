---
name: angular-portal-screen-detail
description: Use when generating or refining the read-only DETAIL state of a record (URL `/detail/:id`, fields rendered as read-only via `[viewed]` or `sd-section-item`). This skill owns the SHARED component shell and the DETAIL state rules. CREATE state lives in 22-screen-create.md, UPDATE state in 23-screen-update.md. Triggers - "màn detail", "trang chi tiết", "view record", "read-only screen". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 21 — Screen: DETAIL state (and shared component shell)

## Purpose

Implement the DETAIL branch of an entity's `pages/detail/detail.component.ts`, AND own the **shared shell** (imports, FormGroup, route resolution, navigation helpers) that is reused by the CREATE and UPDATE states.

The same component file handles all three states (`/create`, `/update/:id`, `/detail/:id`). This skill is the source of truth for the parts that do NOT vary by state. State-specific rules live in:

- [`22-screen-create.md`](./22-screen-create.md) — CREATE state (empty form, `service.create(...)`, navigate to list)
- [`23-screen-update.md`](./23-screen-update.md) — UPDATE state (prefilled form, `service.update(id, ...)`, navigate to list/detail)

## When to use

- User asks "tạo màn detail cho ...", "trang chi tiết", "read-only screen", "view record"
- Generating a fresh entity and the DETAIL state has not been wired yet
- Refining an existing detail component that does not yet handle DETAIL correctly (form not disabled, missing Edit button, missing back navigation)
- Generating the **shared shell** for the first time — this skill must run before 22 and 23 can do their state-specific overlays

If the user is asking about the empty CREATE state or the editable UPDATE state, defer to `22-screen-create.md` or `23-screen-update.md`.

## Shared component shell — code templates

File path: `src/libs/<module>/<entity>/pages/detail/detail.component.ts`

All literal code (state discriminator, imports, FormGroup, ngOnInit dispatcher, shared entity loader, header buttons, navigation helpers, conditional tab name, form-field rendering) lives in [`_refs/templates/screen-detail-component.md`](./_refs/templates/screen-detail-component.md):

| Need | Section in templates ref |
|---|---|
| `ViewState` discriminator + `state` signal | [`#state-discriminator`](./_refs/templates/screen-detail-component.md#state-discriminator) |
| Component imports (Angular + Core UI form components + entity model/service) | [`#imports`](./_refs/templates/screen-detail-component.md#imports) |
| `initForm()` FormGroup definition (one control per `visibleInDetail` field) | [`#formgroup-definition`](./_refs/templates/screen-detail-component.md#formgroup-definition) |
| `ngOnInit` dispatcher (CREATE / UPDATE / DETAIL branching) | [`#route-resolution-ngoninit-dispatcher`](./_refs/templates/screen-detail-component.md#route-resolution-ngoninit-dispatcher) |
| Shared `loadEntityData(id)` with stale-id recovery (used by DETAIL + UPDATE) | [`#shared-entity-loader-with-stale-id-recovery`](./_refs/templates/screen-detail-component.md#shared-entity-loader-with-stale-id-recovery) |
| `headerRight` template (Back always; Edit on DETAIL; Save on CREATE/UPDATE) | [`#header-buttons-template`](./_refs/templates/screen-detail-component.md#header-buttons-template) |
| `onBack()` + `onEdit()` navigation helpers | [`#navigation-helpers`](./_refs/templates/screen-detail-component.md#navigation-helpers) |
| `pageTabName` / `pageTabColor` per state | [`#conditional-tab-name--color`](./_refs/templates/screen-detail-component.md#conditional-tab-name--color) |
| Per-field rendering snippets (`sd-input`, `sd-select`, `sd-date`, `sd-upload-file`, `sd-editor`, etc.) | [`#form-field-rendering-template`](./_refs/templates/screen-detail-component.md#form-field-rendering-template) |

`onSave()` is state-specific — see the CREATE / UPDATE skills.

## DETAIL-state rules

### Route

```typescript
{
  path: 'detail/:id',
  loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
  data: { permission: '<MODULE>_C_<ENTITY>_VIEW', permissionKey: '<module>' },
}
```

### Form behavior

- Form is **disabled** after `loadEntityData(id)` resolves — the shared loader calls `this.form.disable()` when `state() === 'DETAIL'`
- Every form control renders with `[viewed]="true"` (or `[disabled]="true"` for `sd-switch`) so values display read-only
- No submit button. The header shows only Back + Edit (Edit gated by the UPDATE permission)
- `markAllAsTouched()` and validity checks are NOT used here — there is no save flow

### Edit transition

Clicking Edit dispatches to the UPDATE state. The handler lives in [`#navigation-helpers`](./_refs/templates/screen-detail-component.md#navigation-helpers). The button is only visible when the user has `<MODULE>_C_<ENTITY>_UPDATE`.

### Stale-id recovery

If `service.detail(id)` throws (record deleted in another tab):

1. Show warning notify
2. Navigate to list (`['../../']`) with `replaceUrl: true` so back button does not re-enter the broken URL
3. Do NOT leave the form blank

This rule is shared with UPDATE — implementation lives in the shared loader.

### Permission gate

- Route: `data.permission: '<MODULE>_C_<ENTITY>_VIEW'`
- Edit button: `*sdPermission="'<MODULE>_C_<ENTITY>_UPDATE'; sdPermissionKey: '<module>'"`

### Workflow integration

If the entity has workflow (see [`31-workflow-actions.md`](./31-workflow-actions.md)), DETAIL is where approve/reject/withdraw buttons appear — gated by both `state() === 'DETAIL'` AND the current workflow status. Those buttons are described in 31, not here.

## AI generation checklist (shared shell + DETAIL)

- [ ] Component file at `pages/detail/detail.component.ts` with imports from the ref
- [ ] `state` signal initialized to `'DETAIL'`
- [ ] `initForm()` builds FormGroup from schema (one control per `visibleInDetail` field)
- [ ] `ngOnInit` resolves route to one of CREATE / UPDATE / DETAIL and dispatches
- [ ] `loadEntityData(id)` shared by DETAIL and UPDATE, with stale-id recovery
- [ ] `onBack()` and `onEdit()` defined
- [ ] Template `headerRight` has Back + state-conditional Edit / Save
- [ ] Form fields render with `[viewed]="state() === 'DETAIL'"`
- [ ] DETAIL route registered with `_VIEW` permission
- [ ] Edit button gated by `_UPDATE` permission

## Anti-patterns

- Treating DETAIL as "just disable the form" without also branding the page title and tab color differently
- Forgetting `replaceUrl: true` on stale-id recovery (back button re-enters the broken URL)
- Showing the Save button in DETAIL state (only Back + Edit belong there)
- Calling `service.detail(id)` from CREATE — only DETAIL/UPDATE need it (see 22)
- Duplicating the FormGroup definition across three files — it lives once in the shared shell ref
- Hardcoding the Edit button without a permission directive
- Mixing approve/reject buttons into the shell — those belong in `31-workflow-actions.md`

## Related skills

- [`22-screen-create.md`](./22-screen-create.md) — CREATE state (empty form, submit creates record)
- [`23-screen-update.md`](./23-screen-update.md) — UPDATE state (prefilled form, submit updates record)
- [`30-reactive-form.md`](./30-reactive-form.md) — form-level refinements (cross-field validators, dynamic visibility)
- [`31-workflow-actions.md`](./31-workflow-actions.md) — approve / reject / submit-for-approval buttons on DETAIL
