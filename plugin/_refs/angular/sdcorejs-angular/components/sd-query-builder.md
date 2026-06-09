# `<sd-query-builder>`

**Type**: Component
**Selector**: `sd-query-builder`
**Import path**: `@sdcorejs/angular/components/query-builder` (or barrel: `@sdcorejs/angular/components`)
**Class**: `SdQueryBuilder`
**Standalone**: yes
**Change detection**: `OnPush` (signal-first)
**Library version**: `@sdcorejs/angular@20.0.1`

## One-line purpose
Visual filter / rule builder â€” compose nested AND/OR groups of `field operator value` conditions through a tree UI. Operators are derived from each field's `type`; the output is the canonical `Filter` from `@sdcorejs/utils` (a nested `FilterAndOr` tree), so it drops straight into the same query endpoints `<sd-query-bar>` feeds. A `mode="view"` renders the rules as a read-only, highlighted SQL-ish raw string.

## When to use
- "TÃ¬m kiáº¿m nÃ¢ng cao" / advanced-search panels where the user builds grouped boolean logic
- Saved-filter / segment / eligibility-rule editors persisted to a backend as `Filter`
- Anywhere a flat `<sd-query-bar>` chip row isn't enough and you need nested `(... and ...) or ...`
- A read-only audit/display of an existing `Filter` (via `mode="view"`)

## When NOT to use
- Simple keyword search â†’ `<sd-input>` with a search icon
- A flat, single-level chip filter bar â†’ `<sd-query-bar>`
- Single-field dropdown filter â†’ `<sd-select>`

## Inputs
| Name | Type | Default | Notes |
| --- | --- | --- | --- |
| `fields` | `SdQueryBuilderField[]` | `[]` | Filterable fields. Each `type` drives the allowed operators + the value-editor control. **Required** to pick fields / show labels. |
| `mode` | `'edit' \| 'view'` | `'edit'` | `edit` = interactive tree Â· `view` = read-only highlighted raw-query string (looks like a disabled input). |
| `comparisonMode` | `'value-only' \| 'value-or-field'` | `'value-only'` | `value-only` = má»—i rule nháº­p giÃ¡ trá»‹ thuáº§n; `value-or-field` = má»—i rule cÃ³ thá»ƒ chá»n nháº­p giÃ¡ trá»‹ hoáº·c so sÃ¡nh vá»›i má»™t field khÃ¡c cÃ¹ng type. |
| `disabled` | `boolean` | `false` | Disables every editing control. Bare attribute = `true`. |
| `autoId` | `string` | `undefined` | Prefix for `data-autoid` on inner controls (E2E selectors). |

## Two-way models (output)
| Name | Type | Notes |
| --- | --- | --- |
| `value` | `Filter \| null` | **Canonical** output â€” the root `FilterAndOr` tree (`null` when empty). `[(value)]`. |
| `filters` | `Filter[]` | Convenience mirror = the root group's direct children. `[(filters)]`. Writing it (with no `value`) seeds an `{ operator: rootLogic, data }` root. |
| `rootLogic` | `'AND' \| 'OR'` | The root group's connector. `[(rootLogic)]`. |

`value` is the source of truth; `filters` is kept in sync. Seeding either rebuilds the internal tree once, then normalizes â€” no echo loop.

### Type shapes
```ts
type SdQueryBuilderFieldType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'values';

interface SdQueryBuilderField {
  key: string;                 // dot-notation path â†’ Filter.field
  label: string;               // field picker + view-mode field token
  type: SdQueryBuilderFieldType;
  icon?: string;               // leading Material icon in the picker; defaults to QB_TYPE_ICON[type] â†’ 'tune'
  operators?: Operator[];      // override the per-type allowed set
  defaultOperator?: Operator;  // override the starting operator
  values?: { value: any; display: string }[];  // for type 'values'
  trueLabel?: string; falseLabel?: string;       // for type 'boolean'
  min?: number | string; max?: number | string;  // also bound onto the number value editor (sd-input-number)
  compareGroup?: string;                         // optional domain guard for field-to-field comparison
  allowFieldCompare?: boolean;                   // false = hide from field-to-field comparison
}
```
The emitted `value` is a `Filter` (`@sdcorejs/utils/models`): leaf rules become `FilterHasData` / `FilterBetween` / `FilterNoData`; groups become `FilterAndOr { operator, data }`. Incomplete rules (missing field / operator / value) are dropped from the output.

### Field-to-field comparison

By default the builder runs in `comparisonMode="value-only"`: every condition is the classic `field operator literal-value` shape.

When `comparisonMode="value-or-field"`, each eligible rule gets a value-source select:
- **Nháº­p giÃ¡ trá»‹** (`literal`) â€” render the normal value editor for the field type.
- **Chá»n trÆ°á»ng** (`field`) â€” render a second field picker and emit a field-reference operand.

Only single-operand operators support field references. `BETWEEN`, `IN`, `NOT_IN`, `NULL`, and `NOT_NULL` stay literal/no-value only. Candidate fields are filtered by exact `type`, exclude the left-hand field itself, and respect `allowFieldCompare: false`. If either side declares `compareGroup`, both fields must have the same `compareGroup`.

The emitted `Filter` uses the canonical `@sdcorejs/utils` shape:

```ts
// price > cost
{ field: 'price', operator: 'GREATER_THAN', dataType: 'field', data: 'cost' }
```

The internal rule state uses `valueSource: 'literal' | 'field'` and `compareField`, but those are never emitted directly. Seeding `[value]` with `dataType: 'field'` round-trips back into the field selector.

### Relative-date value types

For `date` and `datetime` fields with single-value operators (`EQUAL`, `NOT_EQUAL`, `GREATER_THAN`, `LESS_THAN`, `GREATER_OR_EQUAL`, `LESS_OR_EQUAL`), a rule's value may be a **relative date** instead of an absolute date string. As of `@sdcorejs/utils` **1.1.3** the builder **reuses the canonical model from utils** instead of a local one â€” the offset shape is `DateRelative`, and the emitted `Filter` carries a `dataType` discriminator. Types/helpers are re-exported from `@sdcorejs/angular/components/query-builder`.

```ts
import { DateRelative } from '@sdcorejs/utils/models';

// offset spec (utils) â€” what 'relative' mode stores
interface DateRelative {
  amount: number;
  direction: 'previous' | 'next';
  unit: 'hour' | 'day' | 'week' | 'month';   // builder UI offers day/week/month
}

type SdQbRelativeUnit      = DateRelative['unit'];       // alias of the utils member type
type SdQbRelativeDirection = DateRelative['direction'];
type QbDateMode            = 'absolute' | 'now' | 'relative';
type QbToday               = 'TODAY';                    // the date-today sentinel
```

A date rule's internal `value` is exactly one of:
- `null` or a concrete date string â†’ **absolute**
- `'TODAY'` (the `QB_TODAY` sentinel) â†’ **now / today**
- a `DateRelative` object â†’ **relative offset**

Helpers / constants exported:
- `qbIsRelativeDate(v): v is DateRelative` â€” type guard (delegates to `FilterUtilities.isDateRelative`)
- `qbIsToday(v): v is 'TODAY'` â€” narrows the today sentinel
- `qbDefaultRelative(): DateRelative` â€” returns `{ amount: 1, direction: 'previous', unit: 'day' }` (fresh object each call)
- `QB_TODAY` â€” the `'TODAY'` string sentinel
- `QB_DATE_MODES` â€” `[{ value:'absolute', display:'NgÃ y cá»¥ thá»ƒ' }, { value:'now', display:'HÃ´m nay' }, { value:'relative', display:'TÆ°Æ¡ng Ä‘á»‘i' }]`
- `QB_RELATIVE_UNIT_OPTIONS` â€” 6 combined `unit:direction` tokens (`'day:previous'` â€¦ `'month:next'`) with Vietnamese display labels

**Emitted `Filter` shapes for a relative rule** â€” the discriminator is `dataType` (sibling of `data`):

```ts
// today â†’ date-today
{ field: 'createdAt', operator: 'GREATER_THAN', dataType: 'date-today', data: 'TODAY' }

// N units ago / ahead â†’ date-relative
{ field: 'createdAt', operator: 'LESS_THAN', dataType: 'date-relative',
  data: { amount: 7, direction: 'previous', unit: 'day' } }

// BETWEEN â€” no relative mode; always emits absolute { from, to }
{ field: 'createdAt', operator: 'BETWEEN', data: { from: '2026-01-01', to: '2026-12-31' } }
```

An incomplete offset (missing `unit` / `direction`, or `amount < 1`) is invalid and **dropped** from the emitted `Filter` (same as a null value).

**Back-compat:** filters persisted before the migration stored `data: { rel: 'now' | 'offset', â€¦ }`. `filterToTree` still reads that legacy shape when seeding `[value]` and re-emits the new `dataType` form on the next change, so old saved queries keep working.

## Operator vocabulary
Allowed operators come from `QB_OPERATORS_BY_TYPE[type]` unless `field.operators` overrides. The starting operator is `field.defaultOperator ?? QB_DEFAULT_OPERATOR_BY_TYPE[type]`. The operator selector (`<sd-operator>`) is **hidden** when only one operator is allowed. Helpers exported alongside the component: `qbAllowedOperators`, `qbDefaultOperator`, `qbIsNoDataOperator`, `qbIsMultiOperator`, `qbSupportsFieldCompareOperator`.

## Date / datetime value editor

For `date` and `datetime` fields, the value editor behaviour depends on the active operator:

- **`BETWEEN`** â€” always shows two absolute date pickers (`from` / `to`). No mode select; relative dates are not supported for BETWEEN (switching to BETWEEN resets any relative value to `{ from: null, to: null }`).
- **Single-value operators** (`EQUAL`, `NOT_EQUAL`, `GREATER_THAN`, `LESS_THAN`) â€” shows a mode select with three options:
  - **NgÃ y cá»¥ thá»ƒ** (`absolute`) â€” renders an `<sd-date>` / `<sd-datetime>` picker. Emits a date string in `Filter.data`.
  - **HÃ´m nay** (`now`) â€” no further input; emits `dataType: 'date-today', data: 'TODAY'`.
  - **TÆ°Æ¡ng Ä‘á»‘i** (`relative`) â€” renders a number input for the amount + a combined unitÃ—direction select (`ngÃ y/tuáº§n/thÃ¡ng Ã— trÆ°á»›c/tá»›i`). Emits `dataType: 'date-relative', data: { amount, direction, unit }`.
- **`NULL` / `NOT_NULL`** â€” no value editor at all (same as other types).

The mode is **derived from the rule's value** â€” no separate state. The component exposes:
- `dateMode(rule): QbDateMode` â€” reads the current mode (`'absolute'` | `'now'` | `'relative'`)
- `setDateMode(rule, mode)` â€” reseeds the value per mode
- `relativeAmount(rule): number` â€” reads the offset amount (default `1`)
- `setRelativeAmount(rule, raw)` â€” sets amount, clamped to integer `>= 1`
- `relativeUnitDirValue(rule): string` â€” reads the `'unit:direction'` token (e.g. `'day:previous'`)
- `setRelativeUnitDir(rule, token)` â€” writes unit + direction from a `'unit:direction'` token
- `dateModes` â€” stable ref to `QB_DATE_MODES` (for template `[items]`)
- `relativeUnitOptions` â€” stable ref to `QB_RELATIVE_UNIT_OPTIONS` (for template `[items]`)

## Field picker behaviour

The field picker within each rule is **swap-only**: `[clearable]="false"` is set on the underlying `<sd-select>`, and `setField` ignores a `null` / `undefined` key (no-op). The only way to remove a rule is via its âœ• button (`removeNode`). This prevents accidentally clearing a field and leaving the rule in an indeterminate state.

## Compact value rows

Every value editor and the field picker use `hideInlineError`. Validation errors are suppressed inline (they appear via tooltip instead), keeping each rule row compact and preventing row-height jumps when a field is empty.

## View mode (`mode="view"`)
Renders a `<div class="qb-view">` (disabled-input look) containing the rules as a SQL-ish string built by `filterToTokens`:
- field token = the field's **label**
- `EQUAL =`, `NOT_EQUAL !=`, `> < >= <=`, `CONTAIN â†’ like '%v%'`, `START_WITH â†’ like 'v%'`, `END_WITH â†’ like '%v'` (NOT_* â†’ `not like`), `IN â†’ in (â€¦)`, `BETWEEN â†’ between a and b`, `NULL â†’ is null`, `NOT_NULL â†’ is not null`
- `and` / `or` lowercase; nested multi-child groups wrapped in `( â€¦ )`; string values single-quoted (`'` escaped to `''`); `values` shown via their display label; boolean shown via `trueLabel`/`falseLabel`
- each piece is a `<span class="qb-tok qb-tok-<kind>">` so operators (`qb-tok-op`) and values (`qb-tok-value`) are highlighted distinctly from field/logic/paren
- relative date values render as readable Vietnamese: `hÃ´m nay` (for `dataType:'date-today'`) or `N ngÃ y|tuáº§n|thÃ¡ng trÆ°á»›c|tá»›i` (for `dataType:'date-relative'`)
- field-reference operands render as the right-hand field label, e.g. `GiÃ¡ > GiÃ¡ vá»‘n` for `dataType:'field'`

Example output: `(MÃ£ = 'ABC' and TÃªn like '%abc%') or GiÃ¡ > 100`
Relative example: `NgÃ y táº¡o > 7 ngÃ y trÆ°á»›c`

## Examples

### 1. Advanced-search builder + apply
```html
<sd-query-builder [fields]="fields" [(value)]="filter"></sd-query-builder>
<sd-button title="Ãp dá»¥ng" type="fill" color="primary" (click)="search(filter)"></sd-button>
```
```ts
fields: SdQueryBuilderField[] = [
  { key: 'code', label: 'MÃ£', type: 'string' },
  { key: 'price', label: 'GiÃ¡', type: 'number', operators: ['EQUAL', 'BETWEEN', 'GREATER_THAN'] },
  { key: 'status', label: 'Tráº¡ng thÃ¡i', type: 'values',
    values: [{ value: 'active', display: 'Hoáº¡t Ä‘á»™ng' }, { value: 'inactive', display: 'Ngá»«ng' }] },
];
filter: Filter | null = null;
```

### 2. Read-only display of a saved filter
```html
<sd-query-builder [fields]="fields" [value]="savedFilter" mode="view"></sd-query-builder>
```

### 3. Flat mirror for a query endpoint
```html
<sd-query-builder [fields]="fields" [(filters)]="filters"></sd-query-builder>
<!-- `filters` is Filter[] (root group's children) â€” pass to a list/table query -->
```

### 4. Allow comparing with another field
```html
<sd-query-builder
  [fields]="fields"
  comparisonMode="value-or-field"
  [(value)]="filter"
></sd-query-builder>
```
```ts
fields: SdQueryBuilderField[] = [
  { key: 'price', label: 'GiÃ¡', type: 'number', compareGroup: 'money' },
  { key: 'cost', label: 'GiÃ¡ vá»‘n', type: 'number', compareGroup: 'money' },
  { key: 'createdAt', label: 'NgÃ y táº¡o', type: 'date' },
  { key: 'updatedAt', label: 'NgÃ y cáº­p nháº­t', type: 'date' },
];
```

## Anti-patterns
- âŒ Sharing one `value` object across builder instances â€” seed a fresh `Filter`/`null` per instance.
- âŒ Expecting a flat `Filter[]` when you used nested groups â€” nesting lives in `value` (the tree); `filters` only mirrors the root's direct children.
- âŒ Hardcoding operator lists in the template â€” declare `field.operators` / rely on `QB_OPERATORS_BY_TYPE`.
- âŒ Using `mode="view"` to disable editing while keeping the tree UI â€” use `[disabled]="true"` for that; `view` swaps to the raw-string renderer.

## Known limitations

- **Hard-coded Vietnamese strings** â€” display labels for the date-mode select (`'NgÃ y cá»¥ thá»ƒ'`, `'HÃ´m nay'`, `'TÆ°Æ¡ng Ä‘á»‘i'`), relative unit options (`'ngÃ y trÆ°á»›c'`, `'thÃ¡ng tá»›i'`, â€¦), and the view-mode relative tokens (`'hÃ´m nay'`, `'ngÃ y trÆ°á»›c'`, `'tá»›i'`) are baked into the component and serializer. Migration through `I18nService` is deferred tech debt.
- **Relative dates: minute / hour granularity** â€” only `day`, `week`, `month` units are supported. Hour / minute offsets are intentionally out of scope for this iteration.
- **Field-to-field comparison: compound values** â€” field references only support single-operand operators. `BETWEEN`, `IN`, and `NOT_IN` stay literal-value editors.
- **Relative dates: BETWEEN** â€” relative values are not supported as BETWEEN endpoints. Switching from a single-value operator with a relative value to BETWEEN resets the value to `{ from: null, to: null }`.

## Related
- `<sd-query-bar>` â€” flat chip-based filter bar; same `Filter` output, no nesting
- `<sd-operator>` â€” operator picker reused for each rule
- `<sd-select>` / `<sd-input>` / `<sd-date>` / `<sd-datetime>` â€” the per-type value editors
- `Filter` / `Operator` (`@sdcorejs/utils/models`) â€” output contract
- `filterToTokens` / `treeToFilter` / `filterToTree` â€” serializer helpers (exported)
