# Data Tables and Mobile Cards

Source/status: SDCoreJS-authored interaction heuristics using the existing
list/detail and state-ownership contracts; candidate guidance, not authorization
to add features. For semantic HTML tables versus interactive grids consult the
[APG table pattern](https://www.w3.org/WAI/ARIA/apg/patterns/table/) and the
installed component documentation. Do not convert every table into a grid.

### UX-TABLE-WORKSPACE - Make repeated data work scannable

- Applies: operational lists, result tables, approved filters and row actions.
- Excludes: small content lists where table comparison is unnecessary.
- Do: group search/filter controls and active filter summaries in a stable
  toolbar; distinguish filter reset from destructive actions. Preserve sort,
  pagination, query ownership, totals and URL behavior. Align numeric values
  and their units for comparison. Choose density from user tasks, content and
  existing tokens; keep actions readable and keyboard/touch reachable. Decide
  which columns remain visible, scroll, or disclose details at narrow widths.
- Avoid: shrinking text/targets to fit every column, nested decorative cards,
  frozen columns covering actions, invisible active filters, or replacing a
  server-paged contract with client-only filtering.
- Verify: long values, large numbers, empty/no-results/loading/error states,
  page-size and last-page changes, zoom, horizontal overflow, sticky-header
  occlusion, and all current filter/sort/page transitions.

### UX-TABLE-SELECTION - Make action scope explicit

- Applies: row selection, select-all and approved bulk operations.
- Excludes: read-only lists without selection; do not invent bulk API support.
- Do: record stable item identity and the selection owner. State whether
  select-all covers the current page, loaded rows, or all filtered results;
  only offer scopes supported by the business/API contract. Show the selection
  count and mixed state. Define selection survival/reset on page, filter, sort
  and refresh changes. Keep row open, selection and action-menu targets separate;
  checkbox/action activation must not accidentally open the row. Show eligible
  action scope and partial failures without discarding recoverable selection.
- Avoid: visually implying all-results selection while submitting one page,
  indexing selection by row position, silent selection loss, or disabling every
  action because one selected row is ineligible without explaining it.
- Verify: mouse and keyboard selection, select-all/mixed state, pagination and
  filter changes, deleted/stale rows, and permitted/ineligible selections.
  Assert submitted IDs/scope equal the displayed scope; no extra navigation.

### UX-TABLE-MOBILE - Preserve behavior when rows become cards

- Applies: mobile card presentation of an existing tabular workflow.
- Excludes: comparisons requiring aligned columns; an accessible scrollable
  table may be better. Mobile cards are not an automatic responsive requirement.
- Do: map each card to the same item ID and label/value semantics. Name the
  primary detail link, separate selection control, and row actions. Preserve
  sorting, filters, pagination, selection scope/count and bulk availability.
  Keep critical identifiers/status visible; disclose secondary fields without
  dropping business-required information. Specify gesture alternatives and
  return position/focus from detail using the current app behavior.
- Avoid: making the entire card a button containing other buttons, tap-to-open
  also selecting the item, or swapping table APIs and permission logic to fit
  the card design.
- Verify: a desktop/mobile parity matrix for item identity, fields, open,
  selection, row action, bulk action, query and navigation. Check touch,
  keyboard, long labels, empty states and page changes on both presentations.
