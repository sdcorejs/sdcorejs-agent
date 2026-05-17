# `<sd-chip>`

**Type**: Component (form input)
**Selector**: `sd-chip`
**Import path**: `@sd-angular/core/forms/chip` (or barrel: `@sd-angular/core/forms`)
**Class**: `SdChip`
**Standalone**: yes
**Change detection**: `OnPush`
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
Multi-value tag input — user types and presses Enter/comma to add a chip; chips can be removed individually. Backed by Material `mat-chips` and integrates with SDCoreJS forms (`[form]+[name]`, validators, `[viewed]` read-only).

## When to use
- Free-text multi-value fields: keywords, tags, email recipients, hashtags
- Bulk-entry of short string/number values where order is not significant
- DETAIL state needs to render the same chip strip read-only via `[viewed]`

## When NOT to use
- Picking from a fixed list of options → use `<sd-select [multiple]="true">`
- Multi-date selection → use `<sd-chip-calendar>`
- Single tag/value → use `<sd-input>` or `<sd-autocomplete>`

## Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `autoId` | `string \| undefined` | `undefined` | Forwarded for E2E hooks (no auto-prefix here). |
| `name` | `string \| undefined` | random uuid | Control name registered into `[form]`. |
| `appearance` | `MatFormFieldAppearance` | `'outline'` | Material form-field style. |
| `floatLabel` | `FloatLabelType` | `'auto'` | When the label floats (`auto \| always`). |
| `size` | `SdSize` (`'sm' \| 'md' \| 'lg'`) | `'md'` | Field height. |
| `form` | `NgForm \| FormGroup \| undefined` | `undefined` | Parent form; NgForm auto-unwrapped. |
| `label` | `string` | `''` | Field label. |
| `placeholder` | `string \| undefined` | `undefined` | Placeholder for the typing area. |
| `removable` | `boolean \| ((item:any) => boolean)` | `true` | Whether each chip shows the ✕ remove button (or per-item predicate). |
| `model` | `(string \| number)[] \| undefined` | `undefined` | Current array of chip values (one-way input — pair with `(modelChange)`). |
| `min` | `number` | `0` | When > 0, adds `Validators.minLength(min)`. |
| `max` | `number` | `0` | When > 0, adds `Validators.maxLength(max)`. |
| `addable` | `boolean` | `true` | When `false`, typing in new values is suppressed. |
| `required` | `boolean` | `false` | Adds `Validators.required`. |
| `disabled` | `boolean` | `false` | Disables both the chip strip and the input. |
| `viewed` | `boolean` | `false` | DETAIL read-only mode — chips render but are not editable; `<ng-template sdViewDef>` (if present) overrides the rendering. |
| `hideInlineError` | `boolean` | `false` | Hide inline error; expose via `errorTooltipMessage`. |
| `hyperlink` | `string \| null \| undefined` | `undefined` | Used in `[viewed]` mode to link the chip text. |

> **Coerce**: `addable`, `required`, `disabled`, `viewed`, `hideInlineError` use `booleanAttribute` — bare attribute = `true`.

## Outputs
| Name | Type | Notes |
| --- | --- | --- |
| `modelChange` | `any[]` | Emits the new chip array on add/remove/clear. |
| `sdChange` | `any[]` | SDCoreJS-standard change event (same payload as `modelChange`). |

## Content projection (slots)
- `#sdLabel` template — custom label rendering
- `#sdValue` template — custom value rendering
- `<ng-template sdLabelDef>` — alternate label
- `<ng-template sdViewDef>` — read-only display template used in `[viewed]` mode

## Form integration
- **Does NOT implement `ControlValueAccessor`.** Standard SDCoreJS form pattern: provide `[form]` + `name`, the component will `addControl(name, formControl)` on `ngAfterViewInit`.
- **`formControlName` and `[(ngModel)]` are NOT supported.** Use `[model]` + `(modelChange)` (or `[(model)]` shorthand) and `[form]+[name]`.
- **`[viewed]="true"`** = DETAIL read-only mode: chips display without ✕, no input box; honors `<ng-template sdViewDef>` for custom rendering and `hyperlink` for clickable values.
- **Validators**: `[required]`, `[min]` (→ `minLength`), `[max]` (→ `maxLength`). Error tooltip messages: required → "Vui lòng nhập thông tin"; minlength → "Vui lòng nhập ít nhất N giá trị"; maxlength → "Vui lòng nhập tối đa N giá trị".

## Chip data structure
Values are primitives — `string` or `number` (the component filters on `typeof item === 'string' \| 'number'`). It does NOT store object chips. If you need object chips, normalize to a string key first.

## Visual cues (helps agent map screenshots → component)
- Outlined input box containing rounded-pill chips inline
- Each chip: pill shape, value text, small ✕ button on the right (unless `removable=false`)
- A free-text caret blinks at the end of the chip strip; pressing Enter or comma commits a new chip
- Trailing ✕ at the far right clears all chips
- Loading/error state mirrors other SDCoreJS inputs (red underline, tooltip)
- In `[viewed]` mode: chip strip without input or ✕

## Examples

### 1. Tag/keyword input
```html
<sd-chip
  [form]="form" name="tags"
  label="Tags" placeholder="Nhập tag, Enter để thêm"
  [(model)]="model.tags"
  [min]="1" [max]="10"
  required>
</sd-chip>
```

### 2. Email recipients with custom remove rule
```html
<sd-chip
  [form]="form" name="recipients"
  label="Người nhận"
  [(model)]="model.recipients"
  [removable]="canRemoveRecipient">
</sd-chip>
```
```ts
canRemoveRecipient = (email: string) => email !== this.currentUserEmail;
```

### 3. DETAIL read-only display
```html
<sd-chip
  label="Tags" [model]="model.tags"
  [viewed]="true">
</sd-chip>
```

## Anti-patterns
- ❌ Using `formControlName` / `[(ngModel)]` — not wired; use `[(model)]` + `[form]+[name]`.
- ❌ Pushing onto the `model` array in place — pass a new array reference so the signal effect re-runs.
- ❌ Storing complex objects per chip — values must be primitive (string/number).
- ❌ Using `<sd-chip>` for selecting from a fixed option list — prefer `<sd-select [multiple]>` for closed-set UX.
- ❌ Using `[disabled]` instead of `[viewed]` for DETAIL state — `[viewed]` produces the correct read-only visual via `sdViewDef`.

## Related
- `<sd-chip-calendar>` — multi-date chip input
- `<sd-autocomplete>` — single-select with typeahead
- `<sd-select>` — closed-set picker (with `[multiple]`)
- `<sd-input>` — single-value free text
