# `<sd-autocomplete>`

**Type**: Component (form input)
**Selector**: `sd-autocomplete`
**Import path**: `@sd-angular/core/forms/autocomplete` (or barrel: `@sd-angular/core/forms`)
**Class**: `SdAutocomplete<T = any>`
**Standalone**: yes
**Change detection**: `OnPush`
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
Typeahead single-select dropdown — user types to filter a static array OR an async backend source, then picks one item. Wraps Material `mat-autocomplete` with SDCoreJS label/validators/`viewed` read-only support.

## When to use
- Picking ONE entity from a long list (customer, product, employee, …) where a plain `<sd-select>` would be too crowded
- Backend-driven dynamic dropdown — set `items` to a function returning `Observable<T[]>` / `Promise<T[]>`
- Static list with search-as-you-type (`items` is an array)
- DETAIL state that needs read-only display via `[viewed]="true"`

## When NOT to use
- Multi-select tags → use `<sd-chip>` (multi values) or `<sd-select [multiple]>`
- Picking a date → `<sd-date>` / `<sd-date-range>` / `<sd-chip-calendar>`
- Free-text input (no list) → `<sd-input>`
- Hierarchical/tree picker → see tree-select components, not this one

## Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `autoId` | `string \| null \| undefined` | `undefined` | Generates `data-autoId="forms-autocomplete-<value>"` for E2E selectors. |
| `name` | `string` | random uuid | FormGroup control name when bound via `[form]`. |
| `size` | `SdSize` (`'sm' \| 'md' \| 'lg'`) | `'md'` | Field height. |
| `form` | `NgForm \| FormGroup \| undefined` | `undefined` | Parent form. NgForm is auto-unwrapped to its inner `FormGroup`. |
| `label` | `string \| undefined` | `undefined` | Field label (rendered via `<sd-label>`). |
| `helperText` | `string \| undefined` | `undefined` | Hint text under the field. |
| `placeholder` | `string \| undefined` | `undefined` | Placeholder when empty. |
| `valueField` | `string \| undefined` | `undefined` | Property of an item used as VALUE (supports nested path `a.b.c`). |
| `displayField` | `string \| undefined` | `undefined` | Property used as DISPLAY label (supports nested path). |
| `disabledField` | `string` | `''` | Property name marking an item as disabled. |
| `limit` | `number` | `100` | Max items rendered for static-array filter results. |
| `cacheChecksum` | `any` | `undefined` | Bust per-search cache when this value changes (e.g. external filter context). |
| `hyperlink` | `string \| null \| undefined` | `undefined` | Render value as a link in `[viewed]` mode. |
| `items` | `T[] \| SdSearch<T> \| null \| undefined` | `undefined` | Static array OR a function `({type:'SEARCH',searchText} \| {type:'VALUE',value}) => Observable<T[]> \| Promise<T[]>`. |
| `appearance` | `MatFormFieldAppearance` | from `SD_FORM_CONFIGURATION` ?? `'outline'` | Material form-field style. |
| `addable` | `boolean` | `false` | Show "+" add button → emits `sdAdd`. |
| `required` | `boolean` | `false` | Adds `Validators.required`. |
| `disabled` | `boolean` | `false` | Disables both display + filter controls. |
| `viewed` | `boolean` | `false` | Read-only DETAIL mode — renders display value (or `<sd-view-def>` template) instead of the input. |
| `hideInlineError` | `boolean` | `false` | Hide inline message; surfaces error as a tooltip instead. |
| `validator` | `SdCustomValidator \| undefined` | `undefined` | Async custom validator (wrapped via `HandleSdCustomValidator`). |
| `inlineError` | `string \| undefined` | `undefined` | Forces an inline error message (sets a synthetic `inlineError` validator). |
| `model` | `string \| number \| null \| undefined` | `undefined` | Two-way bound selected VALUE (use `[(model)]`). |

> **Coerce**: `addable`, `required`, `disabled`, `viewed`, `hideInlineError` use `booleanAttribute` — bare attribute = `true`.

## Outputs
| Name | Type | Notes |
| --- | --- | --- |
| `sdChange` | `string \| number \| null` | Emitted when selection changes (the resolved VALUE). |
| `sdSelection` | `SdSelectionData` | `{ values, selectedItems, value, selectedItem }` — full payload incl. raw item. |
| `sdAdd` | `void` | Fired by the "+" button when `[addable]="true"`. |

## Content projection (slots)
- `#sdLabel` template — custom label rendering
- `#sdValue` template — custom in-list option rendering
- `<ng-template sdItemDef>` — alternate option-row template
- `<ng-template sdViewDef>` — read-only display template used in `[viewed]` mode

## Form integration
- **Does NOT implement `ControlValueAccessor`.** Forms use the SDCoreJS pattern: pass the parent form via `[form]="formGroup"` (or `[form]="ngForm"`) plus a `name`. The component then `addControl(name, formControl)` to that group on `ngAfterViewInit`.
- **`formControlName` and `[(ngModel)]` are NOT supported.** Use `[(model)]` for two-way value binding and `[form]+[name]` for FormGroup integration.
- **`[viewed]="true"`** flips into DETAIL read-only mode: input is hidden, the display label (or `<ng-template sdViewDef>`) is rendered. If `hyperlink` is set, the value renders as a link.
- **Validators**: `[required]` adds `Validators.required`. `[validator]` accepts an async custom validator. `[inlineError]="msg"` injects a synthetic error and shows `msg`. Built-in error tooltip messages: required → "Vui lòng nhập thông tin"; custom validator and inline-error messages bubble up via `errorTooltipMessage`.

## Visual cues (helps agent map screenshots → component)
- Outlined input field with a label that floats on focus
- Trailing icons: ▼ caret to toggle the panel; ✕ clear button when a value is set; optional "+" add button when `[addable]`
- Below the field, a Material panel slides down listing matching options; each row uses `displayField` (or custom `sdValue` template)
- Loading spinner appears in the panel when an async `items` function is in flight
- Highlighted/selected option painted in primary color
- In `[viewed]="true"` mode: no input box — just plain text (or hyperlink) of the resolved display value

## Examples

### 1. Static array, simple value
```html
<sd-autocomplete
  [form]="form" name="status" label="Trạng thái"
  [items]="statusOptions"
  valueField="code" displayField="name"
  [(model)]="model.status"
  required
  (sdChange)="onStatusChange($event)">
</sd-autocomplete>
```

### 2. Async backend source (typeahead)
```ts
loadCustomers = ({ type, searchText, value }: any) => {
  if (type === 'SEARCH') return this.api.searchCustomers(searchText);
  if (type === 'VALUE')  return this.api.getCustomerByCode(value).pipe(map(c => [c]));
  return of([]);
};
```
```html
<sd-autocomplete
  [form]="form" name="customerCode" label="Khách hàng"
  [items]="loadCustomers"
  valueField="code" displayField="fullName"
  [(model)]="model.customerCode"
  [addable]="true" (sdAdd)="openCreateCustomer()">
</sd-autocomplete>
```

### 3. DETAIL state (read-only with link)
```html
<sd-autocomplete
  label="Khách hàng" [items]="customers"
  valueField="code" displayField="fullName"
  [model]="model.customerCode"
  [viewed]="true"
  hyperlink="/customer/{{ model.customerCode }}">
</sd-autocomplete>
```

## Anti-patterns
- ❌ Using `formControlName` / `[(ngModel)]` — not wired; use `[form]+[name]` and `[(model)]`.
- ❌ Loading the entire dataset into `items` for huge collections — pass a function (`SdSearch`) so search is delegated to the backend.
- ❌ Forgetting `valueField`/`displayField` when items are objects — display will be empty.
- ❌ Mutating the array passed to `[items]` in place — pass a new reference so the signal effect re-runs and the cache resets.
- ❌ Using `[disabled]` to express read-only DETAIL state — use `[viewed]="true"` instead so labels/links render correctly.

## Related
- `<sd-select>` — non-search dropdown (incl. multi-select)
- `<sd-chip>` — multi-value tag input
- `<sd-input>` — free-text
- `<sd-label>` — label primitive used internally
- `SdSearch<T>` model — backend source contract
- `SD_FORM_CONFIGURATION` token — global default `appearance`
