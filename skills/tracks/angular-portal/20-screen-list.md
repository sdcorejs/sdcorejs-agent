---
name: angular-portal-screen-list
description: Use when generating or refining a list page (table view with SdTable, server-side paging, external filters, action buttons, audit columns, bulk delete) for an entity. Triggers - "màn list", "trang danh sách", "table view", "list component", "refine list page". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Generic List Component Template

## Purpose

From an `EntitySchema`, generate a full CRUD list component with `SdTable`, server-side paging, bulk delete, optional `isActivated` toggle, and action buttons that route to create/update/detail. Used standalone OR dispatched by `07-write-code` (Step 5).

## When to use

- Generating a fresh entity's list page (typically after `12-init-entity`)
- Refining an existing list — adding external filters, score cards, audit columns, custom actions
- User asks "tạo màn list cho ...", "thêm cột vào table", "trang danh sách", "refine list page"

## Inputs the skill needs

Resolve before generating:

- `module`, `entity`, `entityPascal`, `entityCamel`, `entityKebab`, `entityLabel`, `entityLabelPlural` — from the `EntitySchema`
- Visible columns: every field with `visibleInList: true`
- Permission codes: `permissionCreate` / `permissionUpdate` / `permissionDelete` (Module → Entity → Action order)
- Audit columns presence (4 columns by default for primary list pages — see `12-init-entity.md` MUST DO §audit-columns)

If any of the above is missing, ask the developer rather than guess.

## Template + column patterns

The literal `list.component.ts` body and the per-type column entries live in [`_refs/angular-portal/templates/screen-list-component.md`](_refs/angular-portal/templates/screen-list-component.md):

| Need | Section in templates ref |
|---|---|
| Full `list.component.ts` template (imports, `@SdTabComponent`, table option, paging, delete action, header buttons, action column, `onToggleActivation`) | [`#full-listcomponentts-template`](_refs/angular-portal/templates/screen-list-component.md#full-listcomponentts-template) |
| Per-field column entries to substitute for `{{ columnsConfig }}` (text / date / number-currency / select / boolean+template) | [`#column-configuration-patterns`](_refs/angular-portal/templates/screen-list-component.md#column-configuration-patterns) |

Pick the column pattern by field `type` from the schema. For boolean fields rendered as a toggle switch, the matching `<ng-template sdTableCellDef="...">` is already wired inside the main template.

## Generation rules

- Server-side paging is the default (`type: 'server'`). Switch to `'client'` only when the user explicitly asks for an in-memory list AND the dataset is small/static.
- External filters live in `tableOption.filter.externalFilters`, not as custom controls above the table (see `12-init-entity.md` §external-filters).
- Audit columns (`createdAt`, `createdBy`, `updatedAt`, `updatedBy`) go at the END of the column array on primary list pages. Skip when the table is embedded, a lookup table, or in a compact drawer.
- Action column always includes Edit + Detail. Add Delete when the user has bulk delete; the bulk-delete handler in `selector.actions` covers row-level delete via "select then delete".
- Bind the Create button with `*sdPermission`; do not duplicate the route-level permission guard inside the component.
- Use `@SdTabComponent` so the list opens as a named tab when the host shell uses the tab router pattern.

## AI generation checklist

- [ ] Imports match the schema (only the form/cell components actually used in the output)
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
