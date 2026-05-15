# `<sd-chip-calendar>`

**Type**: Component (form input)
**Selector**: `sd-chip-calendar`
**Import path**: `@sd-angular/core/forms/chip-calendar` (or barrel: `@sd-angular/core/forms`)
**Class**: `SdChipCalendar`
**Standalone**: yes
**Change detection**: `OnPush`
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
Multi-date picker rendered as chips — user opens a calendar popup and toggles individual dates; each selected date appears as a removable chip in the field. Uses Material `mat-chips` + `mat-calendar` inside a `mat-menu`.

## When to use
- Selecting an arbitrary set of dates (multiple, non-contiguous), e.g. holidays, training days, off-days
- Where a date RANGE is not appropriate (gaps allowed)
- DETAIL state needing read-only chip strip via `[viewed]`

## When NOT to use
- A single date → use `<sd-date>`
- A start/end range → use `<sd-date-range>`
- Free-text date strings → use `<sd-input>`
- Selecting time-of-day → use `<sd-datetime>`

## Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `autoId` | `string \| undefined` | `undefined` | Forwarded for E2E hooks. |
| `name` | `string \| undefined` | random uuid | Control name registered into `[form]`. |
| `appearance` | `MatFormFieldAppearance` | `'outline'` | Material form-field style. |
| `floatLabel` | `FloatLabelType` | `'auto'` | When the label floats. |
| `size` | `SdSize` (`'sm' \| 'md' \| 'lg'`) | `'md'` | Field height. |
| `form` | `NgForm \| FormGroup \| undefined` | `undefined` | Parent form; NgForm auto-unwrapped. |
| `label` | `string` | `''` | Field label. |
| `placeholder` | `string \| undefined` | `undefined` | Placeholder for the trigger area. |
| `removable` | `boolean \| ((item:any) => boolean)` | `true` | Whether a chip shows the ✕ button (or per-item predicate). |
| `model` | `(string \| number)[] \| undefined` | `undefined` | Current selected dates as `'yyyy/MM/dd'` strings (one-way input — pair with `(modelChange)`). |
| `min` | `number` | `0` | When > 0, adds `Validators.minLength(min)` (count of dates). |
| `max` | `number` | `0` | When > 0, adds `Validators.maxLength(max)` (count of dates). |
| `required` | `boolean` | `false` | Adds `Validators.required`. |
| `disabled` | `boolean` | `false` | Disables interaction. |
| `viewed` | `boolean` | `false` | DETAIL read-only mode. |
| `hideInlineError` | `boolean` | `false` | Hide inline error; expose via `errorTooltipMessage`. |
| `hyperlink` | `string \| null \| undefined` | `undefined` | Used in `[viewed]` mode for clickable chips. |

> **Coerce**: `required`, `disabled`, `viewed`, `hideInlineError` use `booleanAttribute` — bare attribute = `true`.

## Outputs
| Name | Type | Notes |
| --- | --- | --- |
| `modelChange` | `any[]` | Emits the new array of date strings on toggle/remove/clear. |
| `sdChange` | `any[]` | SDCoreJS-standard change event (same payload). |

## Content projection (slots)
- `#sdLabel` template — custom label
- `#sdValue` template — custom chip value rendering
- `<ng-template sdLabelDef>` — alternate label
- `<ng-template sdViewDef>` — read-only display template used in `[viewed]` mode

## Form integration
- **Does NOT implement `ControlValueAccessor`.** Standard SDCoreJS pattern: `[form]+[name]` registers the internal `FormControl` into the parent group on `ngAfterViewInit`.
- **`formControlName` and `[(ngModel)]` are NOT supported.** Use `[model]` + `(modelChange)` (or `[(model)]`) and `[form]+[name]`.
- **`[viewed]="true"`** = read-only chip strip (no calendar trigger, no ✕).
- **Validators**: `[required]`, `[min]` (`minLength`), `[max]` (`maxLength`). Tooltip messages mirror `<sd-chip>`.

## Chip / value structure
Values are date strings formatted `'yyyy/MM/dd'` (produced internally via `DateUtilities.toFormat(date, 'yyyy/MM/dd')`). The component does not emit `Date` objects. Toggling a previously-selected date removes it from the array.

## Visual cues (helps agent map screenshots → component)
- Outlined input box showing one rounded-pill chip per selected date (e.g. `2026/05/09`), each with a ✕
- A trailing calendar icon opens a `mat-menu` containing a Material `mat-calendar`
- Inside the calendar, currently-selected dates are highlighted with the `sd-chip-calendar-selected-date` class
- Clicking a date in the calendar toggles it (add if absent, remove if present)
- ✕ button at the far right clears all selected dates
- In `[viewed]` mode: chip strip only — no calendar trigger, no ✕

## Examples

### 1. Off-days picker
```html
<sd-chip-calendar
  [form]="form" name="offDays"
  label="Ngày nghỉ"
  [(model)]="model.offDays"
  [min]="1" [max]="20"
  required>
</sd-chip-calendar>
```

### 2. DETAIL read-only display
```html
<sd-chip-calendar
  label="Ngày nghỉ"
  [model]="model.offDays"
  [viewed]="true">
</sd-chip-calendar>
```

### 3. Custom remove predicate (lock past dates)
```ts
canRemove = (d: string) => new Date(d.replaceAll('/', '-')) >= new Date();
```
```html
<sd-chip-calendar
  [form]="form" name="trainingDates"
  label="Ngày training"
  [(model)]="model.trainingDates"
  [removable]="canRemove">
</sd-chip-calendar>
```

## Anti-patterns
- ❌ Using `formControlName` or `[(ngModel)]` — not wired.
- ❌ Mutating the `model` array in place — pass a new reference.
- ❌ Storing `Date` objects instead of `'yyyy/MM/dd'` strings — values are normalized to that format and string equality is used for toggle.
- ❌ Using `<sd-chip-calendar>` for a date range — use `<sd-date-range>` for contiguous start/end.
- ❌ Using `[disabled]` instead of `[viewed]` for DETAIL state.

## Related
- `<sd-date>` — single date
- `<sd-date-range>` — start/end range
- `<sd-datetime>` — date + time
- `<sd-chip>` — text/number multi-value tags
