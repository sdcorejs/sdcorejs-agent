# `<sd-radio>`

**Type**: Component (form input)
**Selector**: `sd-radio`
**Import path**: `@sd-angular/core/forms/radio` (or barrel: `@sd-angular/core/forms`)
**Class**: `SdRadio`
**Standalone**: yes
**Change detection**: `OnPush`
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
Radio-button group — user picks exactly ONE option from a small, fixed list. Items can be laid out inline (`row`) or stacked (`column`). Use when the full set of choices should be visible at once (≤ ~6 options); for longer lists, use `<sd-select>` instead.

## When to use
- Pick-one settings with 2–6 short options, all worth showing (e.g. `Gender`, `Type`, `Yes/No/Maybe`)
- Form sections where seeing every option is important for the decision
- DETAIL state via `[viewed]="true"` to render the saved option's display text (or as a hyperlink)

## When NOT to use
- More than ~6 options OR options loaded from API → use `<sd-select>`
- Boolean on/off toggle → use `<sd-switch>` or `<sd-checkbox>`
- Multi-select picks → use `<sd-checkbox>` group or `<sd-select [multiple]>`
- A free-text answer → use `<sd-input>`

## Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `autoId` | `string \| null \| undefined` | `undefined` | Generates `data-autoId="forms-radio-<value>"` for E2E selectors. |
| `name` | `string` | random uuid | FormGroup control name when bound via `[form]`. |
| `form` | `NgForm \| FormGroup \| undefined \| null` | `undefined` | Parent form. `NgForm` is auto-unwrapped to its inner `FormGroup`. |
| `label` | `string \| undefined` | `undefined` | Field label (rendered via `<sd-label>`). |
| `placeholder` | `string \| undefined` | `undefined` | Reserved; not used by the radio template. |
| `display` | `'row' \| 'column'` | `'row'` | Layout: `row` = inline (default), `column` = stacked. |
| `model` | `number \| string \| boolean` | `undefined` | Two-way bound value (use `[(model)]`); matched against `item[valueField]`. |
| `items` | `any[]` | `[]` | List of options (objects). Non-arrays coerce to `[]`. |
| `valueField` | `string` (**required**) | — | Key in each item to use as the radio's bound value. |
| `displayField` | `string` (**required**) | — | Key in each item to use as the visible label. |
| `required` | `boolean` | `false` | Adds `Validators.required`. Bare attribute = `true`. |
| `inlineError` | `string` | `undefined` | Forces a synthetic `inlineError` validator with this message. |
| `disabled` | `boolean` | `false` | Disables the underlying `FormControl`. Bare attribute = `true`. |
| `viewed` | `boolean` | `false` | Read-only DETAIL mode — hides the radios, renders the picked item's display text. Bare attribute = `true`. |
| `hyperlink` | `string \| null \| undefined` | `undefined` | In DETAIL mode, render the value as a link (`[sdHref]`). |

> **Coerce note**: `required`, `disabled`, `viewed` accept `'' | true | false | null | undefined` — bare attribute presence (e.g. `<sd-radio required>`) is treated as `true`. (Hand-rolled in setters; not the `booleanAttribute` transform.)

## Outputs
| Name | Type | Notes |
| --- | --- | --- |
| `modelChange` | `any` | Two-way binding companion for `[(model)]`. |
| `sdChange` | `any` | Emitted on value change with the new selected value. |
| `sdSelection` | `{ value: any \| any[]; item?: any }` | Emitted on change with both the value and the resolved item object (looked up in `items` by `valueField`). |

## Content projection (slots)
- `<ng-template sdLabelDef>` — custom label rendering (overrides `[label]`)
- `<ng-template sdSuffixDef>` — declared via `@ContentChild` but not used by the current template
- `<ng-template sdViewDef>` — declared via `@ContentChild`; the current template falls back to plain text in `[viewed]` mode

## Form integration
- **Does NOT implement `ControlValueAccessor`.** Forms use the SDCoreJS pattern: pass the parent form via `[form]="formGroup"` (or `[form]="ngForm"`) plus a `name`. On `ngAfterViewInit`, the component calls `formGroup.addControl(name, formControl)` and removes it in `ngOnDestroy`.
- **`formControlName` and `[(ngModel)]` are NOT supported.** Use `[(model)]` for two-way value binding and `[form]+[name]` for FormGroup integration.
- **`[viewed]="true"`** flips into DETAIL read-only mode: the radio group is hidden and the picked item's `displayField` value is rendered (via `<ng-template sdLabelDef>` / `hyperlink` if set).
- **Validators**: `[required]` → `Validators.required`. `[inlineError]="msg"` → synthetic `inlineError` validator. Built-in inline errors: required → "Vui lòng nhập thông tin"; inlineError → echoes `inlineError`.

## Visual cues (helps agent map screenshots → component)
- A horizontal (`display="row"`) or vertical (`display="column"`) group of bullet circles, each with the option label to its right
- Selected option: filled inner dot in `primary` color; unselected: empty circle outline
- `row` mode adds horizontal spacing (`mr-16`) between options; `column` mode stacks them flush (`m-0`)
- Required marker shows as a red `*` next to the label (rendered by `<sd-label>`)
- Inline error message appears below the group in red when `formControl.touched && formControl.errors?.required` (or `inlineError`)
- In `[viewed]="true"` mode: just plain text — the matched item's `displayField` value (or as a hyperlink if `hyperlink` is set); falls back to em-dash via `sdEmpty` when nothing selected

## Examples

### 1. Required gender picker (inline)
```html
<sd-radio
  [form]="form" name="gender"
  label="Giới tính" required
  [items]="genderOptions"
  valueField="code" displayField="name"
  [(model)]="model.gender">
</sd-radio>
```

### 2. Stacked option list
```html
<sd-radio
  [form]="form" name="approvalMode"
  label="Hình thức duyệt"
  display="column"
  [items]="approvalModes"
  valueField="id" displayField="label"
  [(model)]="model.approvalMode"
  (sdSelection)="onModeSelected($event)">
</sd-radio>
```

### 3. DETAIL state with hyperlink
```html
<sd-radio
  label="Loại khách hàng"
  [items]="customerTypes"
  valueField="code" displayField="name"
  [model]="model.customerTypeCode"
  [viewed]="true"
  hyperlink="/customer-type/{{ model.customerTypeCode }}">
</sd-radio>
```

## Anti-patterns
- ❌ Using `<sd-radio>` for more than ~6 options or for API-loaded lists — use `<sd-select>` so the list scrolls/filters.
- ❌ Using `formControlName` / `[(ngModel)]` — not wired; use `[form]+[name]` and `[(model)]`.
- ❌ Forgetting `valueField` / `displayField` — both are `required: true` inputs; the component will throw without them.
- ❌ Using `[disabled]="true"` to express read-only DETAIL state — use `[viewed]="true"` so labels/links render correctly.
- ❌ Mixing object types in `items` (e.g. some objects, some primitives) — the lookup uses `item[valueField]`; primitives will fail.

## Related
- `<sd-select>` — dropdown picker for longer or API-loaded lists
- `<sd-checkbox>` — multi-select group / boolean
- `<sd-switch>` — boolean toggle
- `<sd-label>` — label primitive used internally
- `SdLabelDefDirective` / `SdSuffixDefDirective` / `SdViewDefDirective` — content-projection slots
