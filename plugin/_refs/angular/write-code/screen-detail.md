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

## Core UI component selection gate

Before writing or changing the template, run the Core UI discovery step from the main Angular skill:

1. `node _refs/angular/core-docs-fetch.mjs --list`
2. `node _refs/angular/core-docs-fetch.mjs --print assets/STYLE-GUIDE`
3. Read the exact component docs for every UI need on this screen before generating markup. For a detail screen this normally means page/section, button, form controls, table/grid, modal/drawer when used, permission directive, loading/notify services, and icon support.

The generator must pick an existing Core UI component first. A custom `div`/`table`/CSS implementation is allowed only after the inventory check proves there is no suitable Core UI component, and the final response must explicitly flag the fallback.

| UI need | Default Core UI choice | Do not generate instead |
|---|---|---|
| Page shell, title, header actions | `SdPageComponent`, `SdTabComponent`, `headerRight` template | Free-form page header divs, hardcoded sticky bars |
| Business section | `SdSection` with utility spacing | Nested card-like wrappers, anonymous bordered panels |
| Text / number / date / boolean / textarea / upload / editor fields | `sd-input`, `sd-input-number`, `sd-date`/`sd-datetime`, `sd-switch`, `sd-textarea`, `sd-upload-file`, `sd-editor` | Native inputs, Material form fields, custom field CSS |
| Select / relation picker | `sd-select` with existing related model/service contracts | Inline relation objects, ad hoc dropdown markup |
| Primary/secondary/destructive actions | `sd-button` with icon/title/type/color/permission | Raw `<button>` or Material buttons mixed into Core UI screens |
| Multi-row child data with add/remove/edit rows | Core UI table/grid component if available; otherwise the sectioned FormArray row-editor fallback in this ref | Hand-written `<table>`, repeated card stacks, or unmanaged arrays |
| Empty/loading/error affordance | Existing Core UI empty/loading/notify patterns when available | Silent blank areas with no spacing or action |

If the Core UI docs show multiple candidates, choose the component whose API directly models the domain behavior:

- List-like, many rows, sortable/scan-heavy data -> table/grid component.
- Small repeated data set that must be edited inline -> table/grid with cell templates if supported.
- Repeated data set where each row has many fields or mobile density matters -> sectioned FormArray row-editor fallback.
- One-off confirmation or secondary edit flow -> modal/drawer only when the project already uses that Core UI component or the docs prove it exists.

Never "self-draw" a component because the exact syntax is not remembered. Fetch the docs, mirror an existing local usage with `rg`, then generate.

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
| Editable child collections / line items in detail | [`#editable-child-collection-rendering-template`](_refs/angular/templates/screen-detail-component.md#editable-child-collection-rendering-template) |
| **CREATE-specific:** state detection + `applyDefaults()` + `onSave()` | [`#create-state`](_refs/angular/templates/screen-detail-component.md#create-state) |
| **UPDATE-specific:** state detection + optional loader override + `onSave()` | [`#update-state`](_refs/angular/templates/screen-detail-component.md#update-state) |

For form-level refinement (validators, FormArray, error messages), use [`_refs/angular/templates/reactive-form-templates.md`](_refs/angular/templates/reactive-form-templates.md):

| Need | Section in reactive-form ref |
|---|---|
| Shared `SdValidators` class (`notBlank` / `phoneNumber` / `email` / `url` / async `uniqueValue`) | [`#form-validatorts--shared-sdvalidators-class`](_refs/angular/templates/reactive-form-templates.md#form-validatorts--shared-sdvalidators-class) |
| Lightweight `[(model)]` + `[form]` binding (default starting point) | [`#detailcomponentts--lightweight-model-binding-first`](_refs/angular/templates/reactive-form-templates.md#detailcomponentts--lightweight-model-binding-first) |
| Advanced shape with `FormArray` for repeating sub-records | [`#detail-advancedcomponentts--with-formarray-dynamic-fields`](_refs/angular/templates/reactive-form-templates.md#detail-advancedcomponentts--with-formarray-dynamic-fields) |
| Editable line-item `FormArray` contract for detail tables | [`#editable-line-item-formarray-contract`](_refs/angular/templates/reactive-form-templates.md#editable-line-item-formarray-contract) |
| Worked example with typed validators + per-field error messages | [`#worked-example-product-entity`](_refs/angular/templates/reactive-form-templates.md#worked-example-product-entity) |

---

## Detail child collections and editable rows

Treat child arrays in a detail screen as first-class form/UI work, not as a decorative block. This section applies when the entity has line items, order details, variants, attachments with metadata, approval steps, contacts, addresses, price tiers, schedules, or any repeated sub-record that can be added, removed, or edited from the detail page.

### Detection triggers

Use this pattern when any of these are true:

- The request says "table in detail", "many rows", "add row", "remove row", "edit row", "line items", "chi tiet don", "dong con", "nhieu dong", "them/xoa/sua tren dong".
- The schema has an array field (`items`, `details`, `children`, `lines`, `attachments`, `variants`, `prices`, `contacts`, `addresses`, etc.).
- The same child fields repeat more than once in the UI.
- Users need row-level actions, row-level validation, totals, or a row count summary.

### Default UI decision

1. Fetch Core UI docs for the table/grid component and examples.
2. If the Core UI table/grid supports cell templates or projected cell content, render the child collection as an editable table.
3. If the table/grid only supports read-only rows, use it for DETAIL state and use the sectioned `FormArray` row-editor fallback for CREATE/UPDATE.
4. If no Core UI table/grid is available, use the sectioned `FormArray` row-editor fallback, flag the fallback, and keep all layout via utilities.

Do not hand-write an HTML `<table>` unless the Core UI inventory has no table/grid candidate and an existing local screen already uses native tables for the same design system.

### State behavior

- CREATE/UPDATE: rows are editable, add/remove buttons are enabled, field controls bind to each row `FormGroup`.
- DETAIL: rows are read-only; hide add/remove actions and set child controls to viewed/disabled. Keep the same visual density so users can compare detail vs update without layout jump.
- Deleting an unsaved row removes it from the `FormArray`. Deleting a persisted row follows the API contract: either mark `_deleted: true` in payload or call the child delete endpoint, whichever existing services already use.
- Use one validation gate for parent + rows: `form.invalid` -> `form.markAllAsTouched()` -> notify -> stop. Do not save parent data while child rows are invalid.

### Editable table contract

When table/grid cell templates are supported:

- Source of truth is the parent `FormGroup` with a child `FormArray`; do not keep a second mutable array for the same rows.
- Each row maps to one child `FormGroup`.
- Each editable column maps to a Core UI form control (`sd-input`, `sd-input-number`, `sd-select`, `sd-date`/`sd-datetime`, `sd-switch`, etc.) with `[form]="rowGroup"` and `name="<field>"`.
- Row action column uses `sd-button` icon/compact style for remove/restore actions. Gate destructive actions by state and permission when relevant.
- Header action uses `sd-button` ("Them dong", "Them san pham", etc.) in the section/table toolbar, not a floating custom button.
- Show empty state inside the section/table body with a clear add action in CREATE/UPDATE and read-only message in DETAIL.
- Keep row identities stable with `track rowId`/`track $index` only when there is no stable id; prefer `id`, `tempId`, or a generated client key.

### Fallback sectioned row-editor contract

Use this when a Core UI table cannot host controls safely or the row has many fields:

- Wrap the collection in one `sd-section` with a toolbar row: title/count on the left, add action on the right.
- Render each row as a compact utility-grid block, not as nested cards. Use `row row-sm` or `grid-container` with `gap-12`/`gap-16`.
- Keep each row action in a fixed-width trailing area so add/remove buttons do not shift field columns.
- For 5+ rows, avoid tall card stacks. Prefer table/grid if possible; otherwise make each row compact and scan-friendly.
- Surface row-level validation near the row and field-level validation near the field when business rules require messages.

### Save payload

Normalize child rows before save:

- Use `this.form.getRawValue()` so disabled read-only fields required by the API are not accidentally dropped.
- Remove UI-only keys (`tempId`, `_expanded`, `_editing`) before calling `service.create(...)` / `service.update(...)`.
- Preserve existing child ids on UPDATE so the backend can distinguish update vs create.
- Include delete markers only if the backend contract expects them.

### Anti-patterns for child rows

- Repeated plain `div` rows with native `<input>` while the rest of the page uses Core UI forms.
- Maintaining `items: Child[]` and `FormArray` separately without a clear mapper.
- Add/remove mutating a display array but not the submitted form value.
- One large textarea containing JSON/list data instead of row controls.
- Missing toolbar spacing, missing empty state, or action buttons glued to table edges.
- Reusing list-page `SdTable` pagination/filter UX for a small editable child set when inline editing is the actual task.

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

- Run Core UI component discovery before generating markup; pick Core UI page/section/form/button/table components before any custom HTML/CSS.
- Lightweight `new FormGroup({})` allowed by default; add typed validators only when business rules are stable
- `ChangeDetectionStrategy.OnPush` declared on the detail component
- Required field validation enforced at save (`form.invalid` → `markAllAsTouched()` → notify; do not let invalid submits through)
- Use `[form]="form"` + `[(model)]="entity.field"` as the default binding pattern, where `entity` is a plain object/ViewModel (Core UI form components self-register via `[form]+name`; do NOT use `formControlName` — they do not implement `ControlValueAccessor`)
- For child arrays / line items, use the editable child collection pattern above: parent `FormGroup` + child `FormArray` + Core UI table/grid or sectioned row-editor fallback.
- Use Vietnamese labels / messages / notify for VI portals (full diacritics); permission codes + route paths stay English
- Use grid `row row-sm` for form sections (compact spacing)
- For relation fields, read `./reuse-existing-entities.md`; reuse existing related model/summary types and services, use `<entity>Id` when the API only returns an id, and do not inline the related entity shape when a contract exists
- Generate runnable `.spec.ts` per state branch, mocking `inject()` deps (`Router`, `ActivatedRoute`, services, notify, loading)
- Run tests immediately after generation; report pass/fail

### MUST NOT ❌

- Self-draw page sections, forms, tables, or action bars when a Core UI component exists.
- Use native `<input>`, native `<select>`, Material form fields, raw `<button>`, or hand-written `<table>` inside a Core UI detail page unless the fallback is documented.
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
- Add/remove child rows in a display-only array while the submitted `FormArray` stays unchanged.
- Render editable child rows as unstructured card stacks without table/grid/fallback reasoning.

---

## AI generation checklist (full component)

- [ ] Core UI inventory + STYLE-GUIDE fetched before template generation; component docs read for page/section/form/button/table needs
- [ ] Component file at `pages/detail/detail.component.ts` with imports from the shared shell ref
- [ ] `state` signal initialized to `'DETAIL'` (overridden by `ngOnInit` dispatcher)
- [ ] `initForm()` builds FormGroup from schema (one control per `visibleInDetail` field with declared validators)
- [ ] Any child array / line-item field is represented in the parent form as a `FormArray`, not a disconnected display array
- [ ] Editable child rows use Core UI table/grid when supported, or the documented sectioned row-editor fallback when not supported
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
- [ ] Row-level add/remove/edit actions are state-aware, permission-aware when needed, and hidden/disabled in DETAIL
- [ ] Empty state exists for child rows; CREATE/UPDATE empty state includes an add action
- [ ] Signal-first state for UI flags; `computed()` for derived; `@let` or `computed()` for 2+ template references
- [ ] No template method/getter calls for displayed/derived values; use signals/computed/pure pipes/view-model fields
- [ ] `ChangeDetectionStrategy.OnPush` imported and declared
- [ ] Companion `.spec.ts` written RED-first at `standard` coverage by default (minimal/full only on explicit request)
- [ ] Styled utility-first per [`../styling.md`](../styling.md) — layout/spacing via Core UI utilities (`d-flex flex-column gap-16`, `row`/`col-*`, `grid-container`, section spacing `p-16`/`mb-24`), no hand-rolled flex/spacing CSS; Tailwind only if the consumer ships it; spacing px-based 0–200 (multiples of 4); custom `.scss` only when no utility fits (`var(--sd-*)` + `// why:`)

---

## Anti-patterns

- Skipping Core UI discovery and generating custom form/table/action markup from memory
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
- Rendering detail child rows as hand-written `<table>`/`div` markup while Core UI table/grid or sectioned FormArray row-editor would fit
- Building add/remove row UI without spacing, empty state, validation, stable row keys, or payload normalization

---

## Related references

- [`./screen-list.md`](./screen-list.md) — list page (separate file: `list.component.ts`)
- [`./actions.md`](./actions.md) — action buttons (workflow / bulk / custom side-effects) layered on top
- [`./init-entity.md`](./init-entity.md) — when model / service / routes don't exist yet
- [`./reuse-existing-entities.md`](./reuse-existing-entities.md) — relation model/service reuse before generating fields or service calls
- [`_refs/angular/templates/screen-detail-component.md`](_refs/angular/templates/screen-detail-component.md) — code templates for the shared shell + per-state branches
- [`_refs/angular/templates/reactive-form-templates.md`](_refs/angular/templates/reactive-form-templates.md) — code templates for form refinement
