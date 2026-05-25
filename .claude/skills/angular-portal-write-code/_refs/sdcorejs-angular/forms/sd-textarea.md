# `<sd-textarea>`

**Type**: Component (form input)
**Selector**: `sd-textarea`
**Import path**: `@sd-angular/core/forms/textarea` (or barrel: `@sd-angular/core/forms`)
**Class**: `SdTextarea`
**Standalone**: yes
**Change detection**: default (no `OnPush` declared)
**Library version**: `@sd-angular/core@19.0.0-beta.86`


## One-line purpose
Multi-line text input — `<textarea>` with label, validators (required/maxlength/pattern/custom), an optional auto-grow mode, a built-in `count/max` suffix counter when `maxlength` is set, and DETAIL `[viewed]` read-only mode.

## When to use
- Free-form descriptions, comments, notes, addresses spanning multiple lines
- Form fields that may legitimately need 50+ characters (description, reason, remark)
- DETAIL state via `[viewed]="true"` to render the saved value instead of the input chrome
- Forms where the user benefits from seeing the character budget — set `[maxlength]` for the live counter

## When NOT to use
- Single-line text → use `<sd-input>`
- Numbers / amounts → use `<sd-input-number>`
- Code / syntax-highlighted text → use the project's code editor component (out of scope for `forms/`)
- Rich text (bold, lists, ...) → use the project's rich-text editor component

## Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `autoId` | `string \| null \| undefined` | `undefined` | Generates `data-autoId="forms-textarea-<value>"` for E2E selectors. |
| `name` | `string` | random uuid | FormGroup control name when bound via `[form]`. |
| `size` | `Size` (`'sm' \| 'md' \| 'lg'`) | `'md'` | Field height (applied via `.sd-md` / `.sd-sm` class). |
| `form` | `FormGroup \| NgForm \| { form: FormGroup } \| undefined` | `undefined` | Parent form. `NgForm` and `{ form }` wrappers are auto-unwrapped to `FormGroup`. |
| `label` | `string \| undefined` | `undefined` | Field label. |
| `helperText` | `string \| undefined` | `undefined` | Hint text (rendered as info icon next to label). |
| `placeholder` | `string \| undefined` | `undefined` | Placeholder when empty (falls back to `label`). |
| `rows` | `number` | `5` | `<textarea rows="...">`; ignored when `[autoHeight]="true"` after first render. |
| `maxlength` | `number \| null` | `null` | Coerced to a positive integer or `null`. Adds `Validators.maxLength` AND shows a `count/max` suffix counter. |
| `pattern` | `string \| undefined` | `undefined` | Adds `Validators.pattern` with this raw regex string. |
| `appearance` | `MatFormFieldAppearance \| undefined` | from `SD_FORM_CONFIGURATION` ?? `'outline'` | Material form-field style. Pass `null` to suppress the form-field wrapper and render the label as a separate `<sd-label>` above. |
| `floatLabel` | `FloatLabelType` | `'auto'` | Material float-label behaviour. |
| `validator` | `SdCustomValidator \| undefined` | `undefined` | Async custom validator returning `string \| Promise<string>` (empty = pass). |
| `inlineError` | `string \| undefined` | `undefined` | Forces a synthetic `inlineError` validator with this message. |
| `model` | `any` | `undefined` | Two-way bound value (use `[(model)]`). |
| `required` | `boolean` | `false` | Adds `Validators.required`. Bare attribute = `true`. |
| `disabled` | `boolean` | `false` | Disables the underlying `FormControl`. Bare attribute = `true`. |
| `viewed` | `boolean` | `false` | Read-only DETAIL mode. Bare attribute = `true`. |
| `autoHeight` | `boolean` | `false` | Auto-grow: textarea height tracks content (`scrollHeight`). Disables vertical scroll. Bare attribute = `true`. |
| `hideInlineError` | `boolean` | `false` | Hide inline `<mat-error>`; surface error via tooltip on a red error icon suffix. Bare attribute = `true`. |

> **Coerce note**: `required`, `disabled`, `viewed`, `autoHeight`, `hideInlineError` use the `booleanAttribute` transform — bare attribute presence (e.g. `<sd-textarea autoHeight>`) is treated as `true`.

## Outputs
| Name | Type | Notes |
| --- | --- | --- |
| `sdChange` | `any` | Emitted on each value change (and after auto-trim on blur). |

## Content projection (slots)
- `<ng-template sdLabelDef>` — custom label rendering (used only when `[appearance]` is null/falsy)
- `<ng-template sdSuffixDef>` — custom suffix (e.g. icon button) rendered as `matSuffix`
- `<ng-template sdViewDef>` — custom DETAIL display (receives `{ value }` as context)

## Form integration
- **Does NOT implement `ControlValueAccessor`.** Forms use the SDCoreJS pattern: pass the parent form via `[form]="formGroup"` (or `[form]="ngForm"`) plus a `name`. In `ngOnInit`, the component calls `formGroup.addControl(name, formControl)` and removes it in `ngOnDestroy`.
- **`formControlName` and `[(ngModel)]` are NOT supported.** Use `[(model)]` for two-way value binding and `[form]+[name]` for FormGroup integration.
- **`[viewed]="true"`** flips into DETAIL read-only mode: textarea is hidden, value is rendered as plain text (or via `<ng-template sdLabelDef>` for the label and `<ng-template sdViewDef>` for the value); falls back to em-dash via `sdEmpty` when empty.
- **Validators**: `[required]` → `Validators.required`. `[maxlength]` → `Validators.maxLength`. `[pattern]` → `Validators.pattern` (raw regex string). `[validator]` → async custom validator. `[inlineError]="msg"` → synthetic `inlineError` validator. Error tooltip messages: required → "Vui lòng nhập thông tin"; maxlength → "Số ký tự tối đa: N"; pattern → "Định dạng không hợp lệ"; customValidator → message returned by validator; inlineError → echoes `inlineError`.
- **Reactive validator updates** — validator inputs (`required` / `maxlength` / `pattern` / `inlineError` / `validator`) are signal inputs; an internal `effect()` re-runs `setValidators` + `updateValueAndValidity({ emitEvent: false })` whenever any of them changes. You can flip `required` on/off at runtime and the control re-validates automatically.
- **`[disabled]` reactive** — toggling `disabled` calls `formControl.disable() / enable()` via an effect, with `emitEvent: false` (no spurious `statusChanges` emitted).
- **`[(model)]` two-way** — host-side writes propagate via a signal effect: when `model` changes, the component calls `formControl.setValue(val, { emitEvent: false })` so the host won't re-trigger its own `(modelChange)` listener. The reverse direction (user typing → `valueChanges` → `valueModel.set()` → `(modelChange)` emit) runs through the normal Angular signal-model mechanism.
- **Auto-trim on blur** — leading/trailing whitespace is stripped when the user blurs the field. This triggers a `setValue` which propagates to `sdChange` if the value actually changed.
- **Default `appearance`** — when `[appearance]` is omitted, the component reads the `SD_FORM_CONFIGURATION` injection token (`{ appearance: MatFormFieldAppearance }`). Provide it once at application bootstrap to flip ALL form fields to `'fill'` (or any other appearance). Falls back to `'outline'` if the token is not provided.

### Three ways to integrate

```html
<!-- 1. Standalone two-way binding (no FormGroup) -->
<sd-textarea
  label="Ghi chú"
  [(model)]="model.note">
</sd-textarea>

<!-- 2. Reactive FormGroup (self-registers via addControl) -->
<form [formGroup]="form">
  <sd-textarea
    label="Mô tả" name="description"
    [form]="form" required
    [maxlength]="500"
    [(model)]="model.description">
  </sd-textarea>
</form>

<!-- 3. Template-driven NgForm -->
<form #f="ngForm">
  <sd-textarea
    label="Lý do" name="reason"
    [form]="f" required
    [(model)]="model.reason">
  </sd-textarea>
</form>
```

> **How it works**: the `[form]` signal-input has a `transform` that detects `NgForm` (via `instanceof NgForm` — unwraps `.form`) and `FormGroup` (used directly). It also accepts an object literal of shape `{ form: FormGroup }` as a safety fallback. In all three patterns the component manages `addControl` / `removeControl` lifecycle internally — never call them yourself.

## Visual cues (helps agent map screenshots → component)
- A multi-line text box, default 5 rows tall, with the standard outlined Material chrome (label floats above on focus / when filled)
- A small resize handle in the bottom-right corner (browser default for `<textarea>`) — UNLESS `[autoHeight]="true"`, which disables vertical scroll and grows the box as the user types
- When `[maxlength]` is set: a small `123/500` counter appears as a suffix at the bottom-right inside the field
- Required marker shows as a red `*` next to the label
- When `[hideInlineError]="true"`: red error-icon suffix with hover-tooltip; otherwise inline `<mat-error>` below the field
- Helper text shows as an info icon (`info_outline`) next to the label, with the helper text in a tooltip
- In `[viewed]="true"` mode: just plain text — the saved value (or via `<ng-template sdViewDef>`); empty values render as em-dash via `sdEmpty`

## Examples

### 1. Required description with maxlength counter
```html
<sd-textarea
  [form]="form" name="description"
  label="Mô tả" required
  [maxlength]="500"
  [(model)]="model.description">
</sd-textarea>
```

### 2. Auto-growing comment box
```html
<sd-textarea
  [form]="form" name="comment"
  label="Ghi chú"
  autoHeight rows="3"
  placeholder="Nhập ghi chú..."
  [(model)]="model.comment">
</sd-textarea>
```

### 3. Pattern + custom async validator
```html
<sd-textarea
  [form]="form" name="address"
  label="Địa chỉ" required
  [pattern]="addressRegex"
  [validator]="checkAddressOnServer"
  [(model)]="model.address">
</sd-textarea>
```

### 4. DETAIL state with custom view template
```html
<sd-textarea
  label="Lý do từ chối"
  [model]="model.rejectReason"
  [viewed]="true">
  <ng-template sdViewDef let-value>
    <pre class="text-black700 T14R">{{ value }}</pre>
  </ng-template>
</sd-textarea>
```

### 5. Custom suffix (clear button)
```html
<sd-textarea label="Ghi chú" [(model)]="note">
  <ng-template sdSuffixDef>
    <sd-button type="link" prefixIcon="close" (click)="note = ''"></sd-button>
  </ng-template>
</sd-textarea>
```

## Anti-patterns
- ❌ Using `formControlName` / `[(ngModel)]` — not wired; use `[form]+[name]` and `[(model)]`.
- ❌ Using `<sd-textarea>` for single-line text — use `<sd-input>` (visual convention + Enter-to-submit semantics).
- ❌ Combining `[autoHeight]="true"` with a tall fixed `[rows]` — the row attribute only sets the initial height before auto-grow kicks in; large `rows` defeats the auto-grow effect.
- ❌ Wiring up trim logic in the parent — the component already trims on blur.
- ❌ Using `[disabled]="true"` to express read-only DETAIL state — use `[viewed]="true"` so the saved value renders as text.
- ❌ Setting `[maxlength]` to a non-positive integer — the input transform coerces it to `null` (validator + counter both vanish). Use a positive integer.

## Related
- `<sd-input>` — single-line text
- `<sd-input-number>` — numeric input with thousand-separator
- `<sd-label>` — label primitive
- `SdSuffixDefDirective` / `SdLabelDefDirective` / `SdViewDefDirective` — content-projection slots
- `SD_FORM_CONFIGURATION` token — global default `appearance`
