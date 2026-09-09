# Navigation

Use for the affected navigation region only. Source/status: SDCoreJS-authored
interaction heuristics, informed by the upstream topic taxonomy; candidate
until grounded in the project. Accessibility mechanics reference the WAI-ARIA
[disclosure navigation example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/).
An example is implementation guidance, not proof of WCAG conformance.

### UX-NAV-HIERARCHY - Preserve location through nested navigation

- Applies: two/three-level portal sidebars and hierarchical site navigation.
- Excludes: flat peer navigation; do not manufacture levels or reorganize routes.
- Do: map route, permission filter, visible label, icon, depth, parent, and active
  destination from current configuration. Differentiate the current link from
  an ancestor containing it. Preserve the active route on expand/collapse; open
  its ancestors when entering from a deep link if that is the approved behavior.
  Use separate link and disclosure controls if a parent both navigates and opens
  children. Remove permission-filtered empty groups without changing authorization.
- Avoid: treating parent expansion as route selection, showing every ancestor
  as the current page, hiding the only route to a permitted child, or inventing
  permission codes to clean up a visual hierarchy.
- Verify: inspect route/menu/permission mappings; exercise a deep link at each
  level, browser back/forward, selected parent/leaf, and roles with partial menu
  visibility. Confirm click/keyboard expansion changes no route or permission.

### UX-NAV-COLLAPSE - Keep collapsed navigation usable

- Applies: expanded/collapsed sidebars, long labels, narrow viewports.
- Excludes: layouts without a collapsed state; do not add a second navigation mode.
- Do: retain the existing icon family and spacing tokens. Give icon-only links
  accessible names and labels discoverable by keyboard/touch, not hover alone.
  Specify how a collapsed parent exposes children, where focus moves, how it
  closes, and whether expansion persists. Use semantic links and disclosure
  buttons with correct expanded state. For ordinary site navigation, Tab and
  native link/button activation suffice; choose a tree/menu keyboard model only
  when its actual widget semantics and implementation support the full model.
- Avoid: decorative icons carrying the only label, hover-only flyouts, focus
  landing in hidden children, or arbitrary arrow-key handling on a plain link list.
- Verify: keyboard through expanded/collapsed navigation and long translated
  labels; check accessible names, current/expanded state, focus visibility and
  return after closing. Test narrow view/zoom without obscuring content.

### UX-NAV-CONTEXT - Explain module and page location

- Applies: module switchers, breadcrumbs, portal shell/integration navigation.
- Excludes: a single-level flow where extra breadcrumbs would add no information.
- Do: show the current module and destination; make breadcrumb ancestors actual
  authorized destinations and mark the current page. Preserve unsaved-change
  behavior when switching modules. Keep module-owned destinations linked to
  module source; the portal owns shell/composition only.
- Avoid: clickable breadcrumbs with no destination, navigation labels copied from
  internal permission keys, or duplicate editable module menus in portal artifacts.
- Verify: deep-link refresh, module switch/back, inaccessible ancestor behavior,
  and the existing unsaved-change flow; trace ownership from menu to route source.
