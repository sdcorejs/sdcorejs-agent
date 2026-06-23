> **Reference for the `sdcorejs-angular` orchestrator.** Loaded on demand when the
> confirmed plan generates or refines `pages/detail/detail.component.ts` (CREATE / UPDATE /
> DETAIL states + reactive-form refinement). Not a standalone skill — the orchestrator reads
> this file when its dispatch table routes a step here.

# Screen: detail.component.ts (CREATE / UPDATE / DETAIL + form refinement)

## Purpose

Implement and refine an entity's `pages/detail/detail.component.ts` — one component file backing three URL routes:

- `/create` → CREATE state (empty form + defaults)
- `/update/:id` → UPDATE state (prefilled, editable)
- `/detail/:id` → DETAIL state (prefilled, read-only)

The same file also owns the form definition, so this reference is also where you add validators, custom validators, conditional fields, async validators, and cross-field rules. Workflow actions (approve / reject / bulk operations / custom side-effects) are layered on top by [`./actions.md`](./actions.md).

## When to use

- Generating the detail component for a fresh entity (typically after [`./init-entity.md`](./init-entity.md))
- Refining any state: form not disabled in DETAIL, missing Edit button, broken stale-id recovery, defaults wrong on CREATE, file uploads firing after save, navigation target wrong, etc.
- Adding or tightening validators: required / maxLength / patterns / `SdValidators.notBlank` / async unique checks / `FormArray` for repeating sub-records / per-field error messages
- Adding controls that reference another entity, such as customer/product/address selects, hydrated detail summaries, or relation ids
- User asks: "tạo màn detail", "trang chi tiết", "màn create", "màn update", "form không hoạt động", "thêm validator", "custom validator", "async validator"

Defer to:
- [`./screen-list.md`](./screen-list.md) when the request is about the list page (different file)
- [`./actions.md`](./actions.md) when the request is about action buttons (workflow / bulk / custom side-effects)
- [`./init-entity.md`](./init-entity.md) when the entity model/service/routes don't exist yet

Before adding custom validators, date/number formatters, normalizers, query-param helpers, upload/download helpers, clipboard helpers, or other form utilities, read `_refs/shared/sdcorejs-utils.md`. Reuse `@sdcorejs/utils` where it covers the behavior, while keeping Angular `Validators`/`SdValidators` for Angular form-specific contracts.

## Shared shell — code templates

File path: `src/libs/<module>/<entity>/pages/detail/detail.component.ts`

All literal code lives in [`_refs/angular/templates/screen-detail-component.md`](_refs/angular/templates/screen-detail-component.md), sectioned by state. This reference owns the rules; the templates ref owns the code:

| Need | Section in templates ref |
|---|---|
| `ViewState` discriminator + `state` signal | [`#state-discriminator`](_refs/angular/templates/screen-detail-component.md#state-discriminator) |
| Component imports (Angular + Core UI form components + entity model/service) | [`#imports`](_refs/angular/templates/screen-detail-component.md#imports) |
| `initForm()` FormGroup definition (one control per `visibleInDetail` field) | [`#formgroup-definition`](_refs/angular/templates/screen-detail-component.md#formgroup-definition) |
| `ngOnInit` dispatcher (CREATE / UPDATE / DETAIL branching) | [`#route-resolution-ngoninit-dispatcher`](_refs/angular/templates/screen-detail-component.md#route-resolution-ngoninit-dispatcher) |
| Shared `loadEntityData(id)` with stale-id recovery (used by DETAIL + UPDATE) | [`#shared-entity-loader-with-stale-id-recovery`](_refs/angular/templates/screen-detail-component.md#shared-entity-loader-with-stale-id-recovery) |
| `headerRight` template (Back always; Edit on DETAIL; Save on CREATE/UPDATE) | [`#header-buttons-template`](_refs/angular/templates/screen-detail-component.md#header-buttons-template) |
| `onBack()` + `onEdit()` navigation helpers | [`#navigation-helpers`](_refs/angular/templates/screen-detail-component.md#navigation-helpers) |
| `pageTabName` / `pageTabColor` computed values per state | [`#conditional-tab-name--color`](_refs/angular/templates/screen-detail-component.md#conditional-tab-name--color) |
| Per-field rendering snippets (`sd-input`, `sd-select`, `sd-date`, `sd-upload-file`, `sd-editor`, etc.) | [`#form-field-rendering-template`](_refs/angular/templates/screen-detail-component.md#form-field-rendering-template) |
| **CREATE-specific:** state detection + `applyDefaults()` + `onSave()` | [`#create-state`](_refs/angular/templates/screen-detail-component.md#create-state) |
| **UPDATE-specific:** state detection + optional loader override + `onSave()` | [`#update-state`](_refs/angular/templates/screen-detail-component.md#update-state) |

For form-level refinement (validators, FormArray, error messages), use [`_refs/angular/templates/reactive-form-templates.md`](_refs/angular/templates/reactive-form-templates.md):

| Need | Section in reactive-form ref |
|---|---|
| Shared `SdValidators` class (`notBlank` / `phoneNumber` / `email` / `url` / async `uniqueValue`) | [`#form-validatorts--shared-sdvalidators-class`](_refs/angular/templates/reactive-form-templates.md#form-validatorts--shared-sdvalidators-class) |
| Lightweight `[(model)]` + `[form]` binding (default starting point) | [`#detailcomponentts--lightweight-model-binding-first`](_refs/angular/templates/reactive-form-templates.md#detailcomponentts--lightweight-model-binding-first) |
| Advanced shape with `FormArray` for repeating sub-records | [`#detail-advancedcomponentts--with-formarray-dynamic-fields`](_refs/angular/templates/reactive-form-templates.md#detail-advancedcomponentts--with-formarray-dynamic-fields) |
| Worked example with typed validators + per-field error messages | [`#worked-example-product-entity`](_refs/angular/templates/reactive-form-templates.md#worked-example-product-entity) |

---

## DETAIL state rules

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
- No submit button — header shows only Back + Edit (Edit gated by the UPDATE permission)
- `markAllAsTouched()` and validity checks are NOT used here

### Edit transition

Clicking Edit dispatches to UPDATE. Handler in [`#navigation-helpers`](_refs/angular/templates/screen-detail-component.md#navigation-helpers). Visible only when user has `<MODULE>_C_<ENTITY>_UPDATE`.

### Stale-id recovery (shared with UPDATE)

If `service.detail(id)` throws (record deleted in another tab):

1. Show warning notify
2. Navigate to list (`['../../']`) with `replaceUrl: true` so back button does not re-enter the broken URL
3. Do NOT leave the form blank

### Permission gate

- Route: `data.permission: '<MODULE>_C_<ENTITY>_VIEW'`
- Edit button: `*sdPermission="'<MODULE>_C_<ENTITY>_UPDATE'; sdPermissionKey: '<module>'"`

---

## CREATE state rules

### Route

```typescript
{
  path: 'create',
  loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
  data: { permission: '<MODULE>_C_<ENTITY>_CREATE', permissionKey: '<module>' },
}
```

### Form behavior

- Form is empty by default — do NOT call `service.detail(id)`
- Apply default values where domain dictates:
  - `isActivated: true`
  - `status: 'DRAFT'` (or domain default)
  - parent id from `route.snapshot.queryParamMap.get('parentId')` when scaffolding child entities
- All fields editable, no `[viewed]` flags

### File uploads (CREATE + UPDATE)

If the form has `sd-upload-file` controls:

1. `await Promise.all(this.uploadFiles().map(f => f.upload()))` BEFORE calling `service.create(...)` / `service.update(...)`
2. Patch returned `fileIds` into the form value
3. Then submit

Uploading AFTER save orphans the file blobs if save fails.

### Submit

Validates → `form.markAllAsTouched()` on invalid → loading + notify → `service.create(payload)` → navigate. Code template in [`#create-state`](_refs/angular/templates/screen-detail-component.md#create-state).

### Navigation after success

Default: navigate up (`['..']`) → list page. Alternative (opt-in when user explicitly asks): `['../detail', created.id]`. Document the choice via `_refs/orchestration/tail/auto-docs.md`.

### Permission gate

Save button uses `*sdPermission="'<MODULE>_C_<ENTITY>_CREATE'; sdPermissionKey: '<module>'"`.

### Workflow integration

If entity has workflow (see [`./actions.md`](./actions.md)), CREATE may show two submit variants:

- `Lưu` → calls `service.create(...)`
- `Lưu & Gửi duyệt` → calls `service.create(...)` then `service.submit(id)`

Both go through the same validation gate.

---

## UPDATE state rules

### Route

```typescript
{
  path: 'update/:id',
  loadComponent: () => import('./pages/detail/detail.component').then(m => m.DetailComponent),
  data: { permission: '<MODULE>_C_<ENTITY>_UPDATE', permissionKey: '<module>' },
}
```

### Form prefill + enable

The shared `loadEntityData(id)` handles prefill and enables the form when `state() === 'UPDATE'`. Override only when the project needs distinct UPDATE-vs-DETAIL behavior beyond enable/disable — see [`#update-state`](_refs/angular/templates/screen-detail-component.md#update-state).

### Submit

Validates → `form.markAllAsTouched()` on invalid → upload files first → `service.update(id, payload)` → navigate. Code in [`#update-state`](_refs/angular/templates/screen-detail-component.md#update-state).

### Navigation after success

Default: navigate up (`['..']`) — list. Alternative (opt-in): read-only `detail/:id` view.

### Permission gate

- Route: `data.permission: '<MODULE>_C_<ENTITY>_UPDATE'`
- Save button: `*sdPermission="'<MODULE>_C_<ENTITY>_UPDATE'; sdPermissionKey: '<module>'"`
- Edit button on DETAIL is gated by the same code

### Concurrency / dirty-check (optional, opt-in)

For high-contention entities (orders, approvals): check `dto.updatedAt` against last-known timestamp, prompt user to reload if changed. Do NOT implement by default — only when user requests it.

---

## Form refinement

### Validation strategy (per-screen default)

Start lightweight, tighten later:

1. **First pass:** `new FormGroup({})` + template attributes (`required`, `maxlength`, `min`, `max`). Validate at save boundary via `form.invalid` + `form.markAllAsTouched()`.
2. **Second pass (when business rules stabilize):** add typed validators per field via `FormBuilder.group({...})`; surface per-field error messages.
3. **Workflow-enabled screens:** route `Lưu`, `Lưu & Gửi duyệt`, etc. through ONE validation gate. Keep approve/reject independent from field validation (they operate on existing data).

### Signal-first UI state

The `FormGroup` itself stays imperative. Use signals for UI state, and keep editable entity/form models as plain objects/ViewModels when using Core UI `[model]` / `[(model)]` binding:

- `state`, `loading`, `saving` -> `signal()`
- `entity: Partial<ProductSaveReq & { id?: string }>` -> plain object/ViewModel
- `isDetail`, `canSubmit`, `pageTitle`, `pageTabColor` → `computed()`
- `effect()` only for side effects (route param sync, reload), never as a replacement for `computed()`
- The component decorator must include `changeDetection: ChangeDetectionStrategy.OnPush`; import `ChangeDetectionStrategy` from `@angular/core`.
- Under `OnPush`, inject `ChangeDetectorRef` and call `markForCheck()` after async assignment to a plain object/ViewModel.
- Template bindings for displayed/derived values must read signals/computed values, pure pipes, or view-model fields. Do not call component methods/getters in interpolation, property/class bindings, or `@if`/`@for` conditions.

```typescript
readonly state = signal<'CREATE' | 'UPDATE' | 'DETAIL'>('CREATE');
entity: Partial<ProductSaveReq & { id?: string }> = {};
readonly pageTitle = computed(() =>
  this.state() === 'CREATE' ? 'Tạo mới' : 'Chi tiết'
);
```

### Signal template-invocation rule

If a signal is referenced **2 or more times** in the template:
- Extract via `readonly #memoized = computed(() => ...)`, OR
- Use `@let _v = signal();` template syntax

If referenced only once: invoke directly. Goal — reduce getter invocations during change-detection cycles.

This rule is about signal reads only. Do not replace method/getter calls with repeated template calls; replace them with `computed()`, `signal()`, pure pipes, or prebuilt maps such as `fieldErrorMessages()`.

### MUST DO ✅

- Lightweight `new FormGroup({})` allowed by default; add typed validators only when business rules are stable
- `ChangeDetectionStrategy.OnPush` declared on the detail component
- Required field validation enforced at save (`form.invalid` → `markAllAsTouched()` → notify; do not let invalid submits through)
- Use `[form]="form"` + `[(model)]="entity.field"` as the default binding pattern, where `entity` is a plain object/ViewModel (Core UI form components self-register via `[form]+name`; do NOT use `formControlName` — they do not implement `ControlValueAccessor`)
- Use Vietnamese labels / messages / notify for VI portals (full diacritics); permission codes + route paths stay English
- Use grid `row row-sm` for form sections (compact spacing)
- For relation fields, read `./reuse-existing-entities.md`; reuse existing related model/summary types and services, use `<entity>Id` when the API only returns an id, and do not inline the related entity shape when a contract exists
- Generate runnable `.spec.ts` per state branch, mocking `inject()` deps (`Router`, `ActivatedRoute`, services, notify, loading)
- Run tests immediately after generation; report pass/fail

### MUST NOT ❌

- Skip form validation before submission (silent broken saves)
- Hard-code error messages (use i18n constants per project convention)
- Add form logic to components when business-level (delegate to service or shared validator)
- Over-design validators at CREATE stage when business rules are still in flux
- Allow form submission while invalid
- Duplicate validation logic across save / submit / approve handlers — funnel through one gate
- Wrap editable entity/form model objects in `signal()` when binding with Core UI `[model]` / `[(model)]`
- Call component methods/getters from template bindings to compute displayed values, field errors, permissions, titles, colors, disabled states, or visibility
- Overuse signal invocations in template without considering the 2+ times rule
- Calling `service.detail(id)` in CREATE — there is no id yet
- Use `[viewed]="true"` on form fields in CREATE state
- Show approve / reject / edit buttons in CREATE
- Upload files AFTER `service.create(...)` / `service.update(...)` — orphans blobs on failure
- Forget to call `form.enable()` after `patchValue` in UPDATE (form stays disabled if shell defaulted to disable)
- Reuse the same submit handler with `if (this.entity.id) update else create` BUT forget to set `state` properly — keep state-aware branching explicit
- Hardcode the success navigation target without checking user preference
- Forget `data.permission` on any of `/create`, `/update/:id`, `/detail/:id`

---

## AI generation checklist (full component)

- [ ] Component file at `pages/detail/detail.component.ts` with imports from the shared shell ref
- [ ] `state` signal initialized to `'DETAIL'` (overridden by `ngOnInit` dispatcher)
- [ ] `initForm()` builds FormGroup from schema (one control per `visibleInDetail` field with declared validators)
- [ ] `ngOnInit` resolves route → one of CREATE / UPDATE / DETAIL, dispatches accordingly
- [ ] `loadEntityData(id)` shared by DETAIL + UPDATE, with stale-id recovery
- [ ] CREATE branch: `applyDefaults()` patches domain defaults (isActivated:true, status, parentId)
- [ ] CREATE / UPDATE: `onSave()` calls correct service method, uploads files before save, validates first
- [ ] DETAIL: form disabled, `[viewed]="state() === 'DETAIL'"` on all fields
- [ ] `onBack()`, `onEdit()` defined; navigation targets match user preference (default vs opt-in)
- [ ] Template `headerRight` has Back + state-conditional Edit / Save
- [ ] Routes registered with correct `data.permission` per state (`_VIEW` / `_CREATE` / `_UPDATE`)
- [ ] Save button gated by matching `*sdPermission`
- [ ] Validators applied per field criticality (don't over-constrain on first pass)
- [ ] Related entity controls import/reuse existing model/summary/service contracts or document why a new contract is required
- [ ] Per-field error display where business rules need surfaced messages
- [ ] Signal-first state for UI flags; `computed()` for derived; `@let` or `computed()` for 2+ template references
- [ ] No template method/getter calls for displayed/derived values; use signals/computed/pure pipes/view-model fields
- [ ] `ChangeDetectionStrategy.OnPush` imported and declared
- [ ] Companion `.spec.ts` written RED-first at `standard` coverage by default (minimal/full only on explicit request)
- [ ] Styled utility-first per [`../styling.md`](../styling.md) — layout/spacing via Core UI utilities (`d-flex flex-column gap-16`, `row`/`col-*`, `grid-container`, section spacing `p-16`/`mb-24`), no hand-rolled flex/spacing CSS; Tailwind only if the consumer ships it; spacing px-based 0–200 (multiples of 4); custom `.scss` only when no utility fits (`var(--sd-*)` + `// why:`)

---

## Anti-patterns

- Treating DETAIL as "just disable the form" without also branding page title + tab color differently
- Forgetting `replaceUrl: true` on stale-id recovery (back button re-enters the broken URL)
- Showing the Save button in DETAIL (only Back + Edit belong there)
- Calling `service.detail(id)` in CREATE — there is no id yet
- Duplicating the FormGroup across separate files — it lives ONCE in the shared shell ref
- Hardcoding the Edit button without a permission directive
- Mixing approve / reject / bulk buttons into the shell — those belong in [`./actions.md`](./actions.md), gated by workflow state inside DETAIL
- Adding typed validators speculatively before business rules are confirmed (over-constraint on first pass)
- Calling `formControlName` with Core UI form components (they self-register via `[form]+name`; `formControlName` silently fails)
- Inlining a related entity object in the detail form model when an imported relation type or id field should be used

---

## Related references

- [`./screen-list.md`](./screen-list.md) — list page (separate file: `list.component.ts`)
- [`./actions.md`](./actions.md) — action buttons (workflow / bulk / custom side-effects) layered on top
- [`./init-entity.md`](./init-entity.md) — when model / service / routes don't exist yet
- [`./reuse-existing-entities.md`](./reuse-existing-entities.md) — relation model/service reuse before generating fields or service calls
- [`_refs/angular/templates/screen-detail-component.md`](_refs/angular/templates/screen-detail-component.md) — code templates for the shared shell + per-state branches
- [`_refs/angular/templates/reactive-form-templates.md`](_refs/angular/templates/reactive-form-templates.md) — code templates for form refinement
