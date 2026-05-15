# `<sd-select>`

**Type**: Component (form input)
**Selector**: `sd-select`
**Import path**: `@sd-angular/core/forms/select` (or barrel: `@sd-angular/core/forms`)
**Class**: `SdSelect<T>`
**Standalone**: yes
**Change detection**: `OnPush`
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
Dropdown picker — single OR multi-select from a static array OR an async API. Built-in search/filter (auto-enabled when items > 10 or when `items` is a search function), `[multiple]` mode with checkboxes, paging via `[limit]`, label/value field accessors with nested-key support, and DETAIL `[viewed]` read-only mode. After `<sd-input>` this is the most-used form control.

## When to use
- Pick from a known list (status, currency, country, partner, ...) — static `items` array
- Pick from an API-loaded list — pass an async `SdSearch` function as `[items]`
- Multi-select with checkboxes via `[multiple]="true"`
- DETAIL state via `[viewed]="true"` to render the saved option's display text (or as a hyperlink)
- Cascade-style fields where the parent component already has the data array as a `Signal<T[]>`

## When NOT to use
- ≤ 6 short options where seeing all at once helps the user → use `<sd-radio>`
- Free-text input with typeahead suggestions (where any text is allowed) → use `<sd-autocomplete>`
- Boolean on/off → use `<sd-switch>` / `<sd-checkbox>`
- Multi-tag chip input → use `<sd-chip>`

## Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `autoId` | `string \| null \| undefined` | `undefined` | Generates `data-autoId="forms-select-<value>"` for E2E selectors. |
| `name` | `string` | random uuid | FormGroup control name when bound via `[form]`. |
| `size` | `SdSize` (`'sm' \| 'md' \| 'lg'`) | `'md'` | Field height. |
| `form` | `FormGroup \| NgForm \| { form: FormGroup } \| undefined` | `undefined` | Parent form. `NgForm` and `{ form }` wrappers are auto-unwrapped to `FormGroup`. |
| `label` | `string \| undefined` | `undefined` | Field label. |
| `helperText` | `string \| undefined` | `undefined` | Hint text (rendered as info icon next to label). |
| `placeholder` | `string \| undefined` | `undefined` | Placeholder when empty. |
| `valueField` | `SdNestedKeyOf<T>` (**required**) | — | Key in each item used as the bound value. Supports nested paths (e.g. `'meta.code'`). |
| `displayField` | `SdNestedKeyOf<T>` (**required**) | — | Key in each item used as the visible label. Supports nested paths. |
| `disabledField` | `SdNestedKeyOf<T> \| ''` | `''` | Key whose truthy value disables the option. |
| `cacheChecksum` | `any` | `undefined` | Invalidates async-search cache when the value changes. |
| `limit` | `number` | `50` | Max items rendered in the panel (paging via `ArrayUtilities.paging`). |
| `hyperlink` | `string \| null \| undefined` | `undefined` | In DETAIL mode, render value as a link. |
| `minWidthPanel` | `string \| number` | `'auto'` | Minimum panel width. If host is narrower, panel expands to this value. |
| `appearance` | `MatFormFieldAppearance` | from `SD_FORM_CONFIGURATION` ?? `'outline'` | Material form-field style. |
| `floatLabel` | `FloatLabelType` | `'auto'` | Material float-label behaviour. |
| `items` | `T[] \| SdSearch \| Signal<T[]> \| undefined \| null` | `undefined` | Static array, async search function (`(req: { type: 'SEARCH' \| 'VALUE', searchText?, value? }) => Promise<T[]>`), or a Signal — auto-unwrapped. |
| `model` | `boolean \| number \| string \| (number\|string)[] \| null \| undefined` | `undefined` | Two-way bound value. Single value or array (when `[multiple]`). |
| `required` | `boolean` | `false` | Adds `Validators.required`. Bare attribute = `true`. |
| `disabled` | `boolean` | `false` | Disables the underlying `FormControl`. Bare attribute = `true`. |
| `viewed` | `boolean` | `false` | Read-only DETAIL mode (renders via `<sd-view>`). Bare attribute = `true`. |
| `multiple` | `boolean` | `false` | Multi-select with checkboxes; value becomes an array. Bare attribute = `true`. |
| `hideInlineError` | `boolean` | `false` | Hide inline message; surface error via tooltip on a red error icon. Bare attribute = `true`. |
| `validator` | `SdCustomValidator \| undefined` | `undefined` | Async custom validator (wrapped via `HandleSdCustomValidator`). |
| `inlineError` | `string \| undefined` | `undefined` | Forces a synthetic `inlineError` validator with this message. |

> **Coerce note**: `required`, `disabled`, `viewed`, `multiple`, `hideInlineError` use the `booleanAttribute` transform — bare attribute presence (e.g. `<sd-select multiple>`) is treated as `true`.

## Outputs
| Name | Type | Notes |
| --- | --- | --- |
| `sdChange` | `any` | Emitted **only when the panel closes** AND the value changed since opening (intentional — avoids spamming on each click in `[multiple]` mode). |
| `sdSelection` | `SdSelectionData` | Emitted alongside `sdChange`. Shape varies by `[multiple]`: single → `{ multiple: false, value, selectedItem, values, selectedItems }`; multi → `{ multiple: true, values, selectedItems }`. |

## Content projection (slots)
- `<ng-template #sdLabel>` — custom label template (used by `<sd-view>` in DETAIL mode)
- `<ng-template #sdValue>` — custom value-display template in DETAIL mode
- `*sdItemDef` (via `SdItemDefDefDirective`) — custom rendering of each option in the dropdown panel
- `<ng-template sdViewDef>` — custom DETAIL display (receives `{ value, selectedItems }` as context)

## Form integration
- **Does NOT implement `ControlValueAccessor`.** Forms use the SDCoreJS pattern: pass the parent form via `[form]="formGroup"` (or `[form]="ngForm"`) plus a `name`. An `effect()` calls `formGroup.addControl(name, formControl)` and tears it down via `onCleanup` when the component is destroyed OR when `form`/`name` change.
- **`formControlName` and `[(ngModel)]` are NOT supported.** Use `[(model)]` for two-way value binding and `[form]+[name]` for FormGroup integration.
- **`[viewed]="true"`** flips into DETAIL read-only mode rendered by `<sd-view>` — selected item's `displayField` is shown, optionally as a hyperlink.
- **Validators**: `[required]` → `Validators.required`. `[validator]` → async custom validator. `[inlineError]="msg"` → synthetic `inlineError` validator. Error tooltip messages: required → "Vui lòng nhập thông tin"; customValidator → message returned by validator; inlineError → echoes `inlineError`.
- **Async search**: when `items` is a function, the component calls it on each search keystroke (debounced 500ms) with `{ type: 'SEARCH', searchText }`, and on initial bind / value-change with `{ type: 'VALUE', value }` to resolve already-selected values into items. Results are cached per `cacheChecksum`+`searchText`.

## Visual cues (helps agent map screenshots → component)
- An input-like field with a chevron-down (`expand_more`) icon on the right
- Click opens a dropdown panel below; if `items.length > 10` (or `items` is a function) a search input appears at the top of the panel
- In `[multiple]="true"` mode: each row in the panel has a checkbox; the field shows a comma-joined list of display values, with a hover tooltip listing each as `• <value> - <display>`
- Loading spinner appears in the panel while an async `SdSearch` is in flight
- A small clear-button (× icon) appears as a suffix when a value is set (clears via `clear()`)
- Required marker shows as a red `*` next to the label
- When `[hideInlineError]="true"`: red error-icon suffix with tooltip; otherwise inline `<mat-error>` below the field
- In `[viewed]="true"` mode: rendered by `<sd-view>` — plain text (or hyperlink) of the selected display value(s)

## Examples

### 1. Static items, single select, required
```html
<sd-select
  [form]="form" name="status"
  label="Trạng thái" required
  [items]="statusList"
  valueField="code" displayField="name"
  [(model)]="model.status">
</sd-select>
```

### 2. Multi-select with checkboxes
```html
<sd-select
  [form]="form" name="tags"
  label="Tags" multiple
  [items]="tagList"
  valueField="id" displayField="label"
  [(model)]="model.tagIds">
</sd-select>
```

### 3. Async-search (API-loaded) with cache invalidation
```html
<sd-select
  [form]="form" name="customer"
  label="Khách hàng"
  [items]="searchCustomers"        <!-- (req) => Promise<Customer[]> -->
  [cacheChecksum]="model.branchId"  <!-- invalidate when branch changes -->
  valueField="id" displayField="fullName"
  [(model)]="model.customerId"
  (sdSelection)="onCustomerPicked($event)">
</sd-select>
```

### 4. Custom item rendering (`*sdItemDef`)
```html
<sd-select
  [items]="users" valueField="id" displayField="name"
  [(model)]="model.userId">
  <ng-template sdItemDef let-item>
    <div class="d-flex align-items-center gap-8">
      <img [src]="item.avatar" class="avatar-24" />
      <div>{{ item.name }} <small class="text-black400">{{ item.email }}</small></div>
    </div>
  </ng-template>
</sd-select>
```

### 5. DETAIL state with hyperlink
```html
<sd-select
  label="Đơn vị"
  [items]="orgUnits" valueField="code" displayField="name"
  [model]="model.orgUnitCode"
  [viewed]="true"
  hyperlink="/org-unit/{{ model.orgUnitCode }}">
</sd-select>
```

## Anti-patterns
- ❌ Using `formControlName` / `[(ngModel)]` — not wired; use `[form]+[name]` and `[(model)]`.
- ❌ Using `<sd-select>` for ≤ 6 short options — use `<sd-radio>` so all options are visible without a click.
- ❌ Subscribing to `sdChange` and expecting it to fire on every click in `[multiple]` mode — it ONLY fires when the panel CLOSES, by design. For per-toggle reactions, derive from `[(model)]`.
- ❌ Re-creating the `items` array reference on every change-detection cycle — it forces re-fetch / re-cache. Memoize or use a `Signal<T[]>`.
- ❌ Forgetting `cacheChecksum` when async results depend on another field — stale cached results will leak across context switches.
- ❌ Using `[disabled]="true"` to express read-only DETAIL state — use `[viewed]="true"` so the value renders as text/hyperlink.

## Related
- `<sd-autocomplete>` — text input with typeahead (free text allowed)
- `<sd-radio>` — pick-one for short, all-visible lists
- `<sd-checkbox>` — multi-select group / boolean
- `<sd-chip>` — multi-tag input
- `<sd-view>` — DETAIL renderer used internally
- `<sd-label>` — label primitive
- `SdItemDefDefDirective` / `SdViewDefDirective` — content-projection slots
- `SdSearch` — async-search function signature
- `SdSelectionData` — output payload shape
- `SD_FORM_CONFIGURATION` token — global default `appearance`
