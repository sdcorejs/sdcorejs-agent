> **Reference for the `sdcorejs-angular` orchestrator.** Loaded on demand when the
> confirmed plan generates or refines a list page. Not a standalone skill — the orchestrator
> reads this file when its dispatch table routes a step here.

# Screen: List Component Template

## Purpose

From an `EntitySchema`, generate a full CRUD list component with `SdTable`, server-side paging, bulk delete, optional `isActivated` toggle, and action buttons that route to create/update/detail. Used when generating a fresh entity's list page OR when refining an existing one — the write-code orchestrator routes here for both.

## When to use

- Generating a fresh entity's list page (typically after `./init-entity.md`)
- Refining an existing list — adding external filters, score cards, audit columns, custom actions
- User asks "<localized text>", "<localized text>", "<localized text>", "refine list page"

## Inputs the reference needs

Resolve before generating:

- `module`, `entity`, `entityPascal`, `entityCamel`, `entityKebab`, `entityLabel`, `entityLabelPlural` — from the `EntitySchema`
- Visible columns: every field with `visibleInList: true`
- Permission codes: `permissionCreate` / `permissionUpdate` / `permissionDelete` (Module → Entity → Action order)
- Audit columns presence (4 columns by default for primary list pages — see `./init-entity.md` MUST DO §audit-columns)
- Related entity reuse decisions for select/filter/display fields, from `./reuse-existing-entities.md`

If any of the above is missing, ask the developer rather than guess.

## Template + column patterns

The literal `list.component.ts` body and the per-type column entries live in [`_refs/angular/templates/screen-list-component.md`](_refs/angular/templates/screen-list-component.md):

| Need | Section in templates ref |
|---|---|
| Full `list.component.ts` template (imports, `@SdTabComponent`, table option, paging, delete action, header buttons, action column, `onToggleActivation`) | [`#full-listcomponentts-template`](_refs/angular/templates/screen-list-component.md#full-listcomponentts-template) |
| Per-field column entries to substitute for `{{ columnsConfig }}` (text / date / number-currency / select / boolean+template) | [`#column-configuration-patterns`](_refs/angular/templates/screen-list-component.md#column-configuration-patterns) |

Pick the column pattern by field `type` from the schema. For boolean fields rendered as a toggle switch, the matching `<ng-template sdTableCellDef="...">` is already wired inside the main template.

## Generation rules

- Server-side paging is the default (`type: 'server'`). Switch to `'client'` only when the user explicitly asks for an in-memory list AND the dataset is small/static.
- External filters live in `tableOption.filter.externalFilters`, not as custom controls above the table (see `./init-entity.md` §external-filters).
- Audit columns (`createdAt`, `createdBy`, `updatedAt`, `updatedBy`) go at the END of the column array on primary list pages. Skip when the table is embedded, a lookup table, or in a compact drawer.
- Action column always includes Edit + Detail. Add Delete when the user has bulk delete; the bulk-delete handler in `selector.actions` covers row-level delete via "select then delete".
- Bind the Create button with `*sdPermission`; do not duplicate the route-level permission guard inside the component.
- Use `@SdTabComponent` so the list opens as a named tab when the host shell uses the tab router pattern.
- When a column/filter/select references another entity, read `./reuse-existing-entities.md`, reuse the existing related model/summary type and service, and avoid creating duplicate API logic for that related entity.
- Before adding local formatting, filtering, search, paging, query-param, or copy/download helper code, read `_refs/shared/sdcorejs-utils.md` and reuse `@sdcorejs/utils` (`DateUtilities`, `NumberUtilities`, `ArrayUtilities`, `FilterUtilities`, `Utilities`, `BrowserUtilities`) when applicable.
- Add `changeDetection: ChangeDetectionStrategy.OnPush` to the component and import `ChangeDetectionStrategy` from `@angular/core`.
- Keep table option, loading flags, selected rows, and other mutable UI state in `signal()` where practical; use `computed()` for derived title, visibility, disabled state, counts, and class/color values.
- Do not call component methods/getters from interpolation, property/class bindings, or `@if`/`@for` conditions to compute displayed/derived values. Use table column callbacks, `computed()`/signals, pure pipes, or row/view-model fields. Event handlers such as `(click)="onCreate()"` remain valid.

## AI generation checklist

- [ ] Imports match the schema (only the form/cell components actually used in the output)
- [ ] `ChangeDetectionStrategy` imported and `changeDetection: ChangeDetectionStrategy.OnPush` set
- [ ] `@SdTabComponent` decorator present with `name: '<entityLabel>'`
- [ ] `tableOption` initialized in `ngOnInit` (not in field initializer — `inject` may not be ready)
- [ ] `items: async filterRequest => ...` calls `service.paging(pagingRequest)` after `convertTableFilter`
- [ ] Bulk delete action with confirm dialog + loading + notify + table reload
- [ ] Columns array derived from `visibleInList` fields, in schema order, with the right `type` per field
- [ ] Audit columns appended (unless skip condition applies)
- [ ] Action column (Edit + Detail) at the end
- [ ] Toggle `isActivated` template wired when the schema has that field
- [ ] Navigation via `Router.navigate(['create' | 'update', id | 'detail', id], { relativeTo })`
- [ ] Loading / notify / confirm services injected via `inject()` (not constructor)
- [ ] Template binds only precomputed state for display/visibility/disabled/class values; no method/getter calls for those bindings
- [ ] Styled utility-first per [`../styling.md`](../styling.md) — Core UI utility classes (`d-flex`, `gap-16`, `justify-content-between`, `w-full`) on the template, no bespoke flex/spacing CSS; Tailwind only if the consumer ships it; component `.scss` near-empty
- [ ] Related entity fields reuse existing model/summary/service contracts or document why a new contract is required
- [ ] `@sdcorejs/utils` checked before local list formatter/filter/search/paging/copy/download helpers are written
