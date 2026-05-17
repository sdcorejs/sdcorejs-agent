# Utilities — Models

**Import path**: `@sd-angular/core/utilities/models`
**Library version**: `@sd-angular/core@19.0.0-beta.86`

Type-only contracts shared across `@sd-angular/core` components, services, and the consuming app (filters, paging, ordering, theming tokens, ...). No runtime code beyond a couple of small constants and one `SdOperators` lookup table.

| File | Exported types / values | Purpose |
| --- | --- | --- |
| `color.model.ts` | `SdColor` (type) | String union `'primary' \| 'secondary' \| 'info' \| 'success' \| 'warning' \| 'error'` — the canonical theme-color token used by buttons, badges, alerts, ...  |
| `empty.model.ts` | `SD_EMPTY_STR` (const `'--'`) | Default placeholder shown by display pipes/components when a value is `null`/`undefined`. |
| `filter.model.ts` | `SdFilter`, `SdFilterHasData`, `SdFilterBetween`, `SdFilterNoData`, `SdFilterAndOr` | Discriminated union describing a query filter expression — single-field with data / `BETWEEN` range / no-data (`NULL`/`NOT_NULL`) / nested `AND`/`OR` group. Used by list components and `SdPagingReq`. |
| `icon.model.ts` | `MaterialIconFontSet` (type), `DefaultMaterialIconFontSet` (const) | Allowed Material icon font sets (`'material-icons-outlined'`, `'material-symbols-outlined'`, ...) and the library default (`'material-icons-outlined'`). |
| `maybe-async.model.ts` | `SdMaybeAsync<T>` (type), `SdResolveMaybeAsync<T>` (fn → `Promise<T>`), `SdNormalizeAsync<T>` (fn → `Observable<T>`) | "Sync-or-async" value: `T \| Promise<T> \| Observable<T>`, plus two helpers to coerce into a single shape. Lets APIs accept any of the three forms transparently. |
| `nested-key-of.model.ts` | `SdNestedKeyOf<T, Depth>` (type) | Recursive (depth-capped at 4) dotted-path key generator — e.g. `keyof Order` produces `'id' \| 'customer.name' \| 'customer.address.city' \| ...`. Powers strongly-typed `field`/`fields` parameters in filters/orders/queries. |
| `operator.model.ts` | `SdOperator`, `SdOperatorHasData`, `SdOperatorNoData` (types), `SdOperators` (const lookup table) | All filter operators (`EQUAL`, `NOT_EQUAL`, `CONTAIN`, `IN`, `BETWEEN`, `NULL`, ...) and a `{value, symbol, display}` table for rendering operator pickers. |
| `order.model.ts` | `SdOrder<T>` (interface) | `{ field: SdNestedKeyOf<T>; direction: 'ASC' \| 'DESC' }` — sort spec used in paging requests. |
| `paging.model.ts` | `SdQueryReq<T>`, `SdPagingReq<T>`, `SdPagingRes<T>` (interfaces) | Standard request/response shapes for filtered & paginated list APIs. `SdPagingRes` is `{ items, total }`. |
| `pattern.model.ts` | `SdPatternType` (type), `SdPatternCommon` (interface), `SdPatternCommons` (const) | Predefined validation pattern catalog — `EMAIL`, `PHONE`, `PHONE_VN`, `IDVN_OR_PASSPORT`, `TIME` — each with regex (sourced from `StringUtilities`) and Vietnamese error message. Used by form components for built-in validators. |
| `size.model.ts` | `SdSize` (type) | String union `'xs' \| 'sm' \| 'md' \| 'lg'` — common size token across components. |
| `unwrap-signal.model.ts` | `SdUnwrapSignal<T>`, `SdUnwrapSafe<T>` (types) | Conditional types that unwrap `InputSignal<T>` / `InputSignalWithTransform<T, U>` / `ModelSignal<T>` to their underlying value type — used when generating typed prop maps over Angular signal-based component APIs. `SdUnwrapSafe` adds `NonNullable`. |

## Notes

- `SdFilter`, `SdOrder`, `SdPagingReq` all parameterize over an entity type `T` and use `SdNestedKeyOf<T>` to constrain `field` keys at compile time.
- `SdOperators` is the only file in this folder that emits non-trivial runtime output — every other export is a type alias / interface / small constant.
- `pattern.model.ts` has a runtime dependency on `@sd-angular/core/utilities/extensions` (`StringUtilities.REGEX_*`); models are otherwise dependency-free.
