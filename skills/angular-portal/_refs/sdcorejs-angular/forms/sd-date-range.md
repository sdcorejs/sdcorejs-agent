# `<sd-date-range>`

**Type**: Component (form input)
**Selector**: `sd-date-range`
**Import path**: `@sd-angular/core/forms/date-range` (or barrel: `@sd-angular/core/forms`)
**Class**: `SdDateRange`
**Standalone**: yes
**Change detection**: `OnPush`
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
Two-date range picker — user picks a start date AND an end date through a single 2-month calendar popup. Wraps Material `mat-date-range-picker` with SDCoreJS label/validators/min-max boundary support.

## When to use
- Filtering a list page by a date interval ("from" → "to" — e.g. transaction date, hire date, posting period)
- Report parameter form needing a date interval
- Picking validity periods (effective-from / expiry-to) where both ends matter and must stay in sync
- DETAIL state where the saved range needs to be displayed (component still shows two read-only inputs unless you swap to plain text)

## When NOT to use
- Single-date selection → use `<sd-date>`
- Date + time of a single moment → use `<sd-datetime>`
- Quick preset chips ("Today", "This week", …) on top of a list → use `<sd-chip-calendar>`
- Multi-period or non-contiguous dates → not supported — pick a different pattern
- Range bound to time-of-day (start-time / end-time) — this picker is date-only

## Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `autoId` | `string \| null \| undefined` | `undefined` | Generates `data-autoId="forms-date-range-<value>"` for E2E selectors. |
| `name` | `string` | random uuid | FormGroup control name when bound via `[form]`. The component also registers two internal sub-controls (random uuids) for the start/end inputs. |
| `size` | `SdSize` (`'sm' \| 'md' \| 'lg'`) | `'md'` | Field height. |
| `form` | `NgForm \| FormGroup \| undefined` | `undefined` | Parent form. NgForm is auto-unwrapped to its inner `FormGroup`. |
| `label` | `string \| undefined` | `undefined` | Field label (rendered via `<sd-label>`). |
| `helperText` | `string \| undefined` | `undefined` | Hint icon + tooltip in the label area. |
| `appearance` | `MatFormFieldAppearance` | from `SD_FORM_CONFIGURATION` ?? `'outline'` | Material form-field style. |
| `floatLabel` | `FloatLabelType` | `'auto'` | Material float-label behaviour. |
| `min` | `Date \| string \| 'TODAY'` | `undefined` | Earliest allowed start date. `'TODAY'` resolves to `new Date()`. |
| `max` | `Date \| string \| 'TODAY'` | `undefined` | Latest allowed end date. |
| `required` | `boolean` | `false` | Adds `Validators.required` to BOTH internal controls and the outer aggregate control. |
| `disabled` | `boolean` | `false` | Disables both date inputs and the picker trigger. |
| `hideInlineError` | `boolean` | `false` | Hide inline message; surfaces error via `errorTooltipMessage` instead. |
| `model` | `{ from?: string \| null; to?: string \| null } \| null \| undefined` | `undefined` | Two-way bound range value (use `[(model)]`). Both ends are ISO-style date strings (`yyyy/MM/dd`). |

> **Coerce**: `required`, `disabled`, `hideInlineError` use `booleanAttribute` — bare attribute = `true`.

## Outputs
| Name | Type | Notes |
| --- | --- | --- |
| `sdChange` | `{ from, to } \| null` | Emitted on blur, Enter, picker-close, and clear. Same shape as `model`. |

## Content projection (slots)
- `<ng-template sdLabelDef>` — custom label rendering (replaces the plain `label` text). The component uses `SdLabelDefDirective` content child.

## Form integration
- **Does NOT implement `ControlValueAccessor`.** Forms use the SDCoreJS pattern: pass the parent form via `[form]="formGroup"` (or `[form]="ngForm"`) plus a `name`. On `ngOnInit`, the component calls `formGroup.addControl(name, formControl)` PLUS two internal start/end controls under random uuids for fine-grained validity. All three are removed in `ngOnDestroy`.
- **`formControlName` and `[(ngModel)]` are NOT supported.** Use `[(model)]` for two-way value binding and `[form]+[name]` for FormGroup integration.
- **No `[viewed]` flag** — unlike `<sd-date>`, `<sd-datetime>`, `<sd-input>` etc., this component has no DETAIL read-only mode. For read-only display, either set `[disabled]="true"` or render the formatted range as plain text outside the component.
- **Validators**: `[required]` adds `Validators.required` to both internal controls and the aggregate. Material picker auto-emits `matDatepickerMin` / `matDatepickerMax` errors when `min`/`max` are violated. Error tooltip messages: required → "Vui lòng nhập thông tin"; min → "Ngày bắt đầu không hợp lệ (nhỏ hơn giới hạn)"; max → "Ngày kết thúc không hợp lệ (lớn hơn giới hạn)".

## Visual cues (helps agent map screenshots → component)
- A single Material outlined field with TWO date inputs side-by-side separated by an "→" / dash, each in `dd/MM/yyyy` format (e.g. `01/01/2025  →  31/12/2025`)
- Trailing icons: a calendar icon to open the picker; an ✕ clear button when a value is set
- Clicking the calendar icon opens a 2-month side-by-side calendar popup; user clicks start date, then end date — the range fills in
- When focused, both inputs share a single underline/outline (visually one field, not two)
- Helper-text shows as an info icon next to the label

## Examples

### 1. Filter by transaction date on a list page
```html
<sd-date-range
  [form]="filterForm" name="transactionDate"
  label="Khoảng ngày giao dịch"
  [(model)]="filter.transactionDate"
  (sdChange)="onFilterChange()">
</sd-date-range>
```

### 2. Required range with min/max boundaries
```html
<sd-date-range
  [form]="form" name="effectivePeriod"
  label="Hiệu lực" required
  min="TODAY" [max]="contractEndDate"
  [(model)]="model.effectivePeriod">
</sd-date-range>
```

### 3. Disabled (read-only-ish) display
```html
<sd-date-range
  label="Kỳ báo cáo"
  [model]="report.period"
  [disabled]="true">
</sd-date-range>
```

## Anti-patterns
- ❌ Using `formControlName` / `[(ngModel)]` — not wired; use `[form]+[name]` and `[(model)]`.
- ❌ Trying `[viewed]="true"` — no such input on this component. Use `[disabled]` or render plain text.
- ❌ Treating the model as two separate strings — it is `{ from, to }`. Splitting it across two `<sd-date>` defeats the purpose (no shared calendar, no aggregate validation).
- ❌ Mutating `model.from` / `model.to` directly — assign a new object literal so the `effect` re-runs.
- ❌ Using this for date-and-time intervals — neither end carries time. Use two `<sd-datetime>` if you need that.

## Related
- `<sd-date>` — single-date picker
- `<sd-datetime>` — single date+time picker
- `<sd-chip-calendar>` — date with quick preset chips (Today, This week, …)
- `<sd-label>` — label primitive used internally
- `SdLabelDefDirective` — custom label projection
- `SD_FORM_CONFIGURATION` token — global default `appearance`
