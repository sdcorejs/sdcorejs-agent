# Angular Core UI Accessibility Addenda

Apply only to `core-ui-angular`, `legacy-core-ui-angular`, or an explicit Core UI
migration review. For `plain-angular`, mark this ref N/A and use the shared
baseline plus actual installed libraries/local components. Both `@sdcorejs/angular`
and `@sd-angular/core` count; preserve the installed name.

Read `_refs/shared/review-accessibility.md` first. It owns criterion levels,
role-specific thresholds, exceptions and verification discipline; these probes
must not redefine them. The parent review owns severity based on actual impact.
Source-only inspection is not rendered or interaction verification. Discover
scripts, URLs and installed tools; do not download probe tools without approval.

## Installed component and version evidence

Use `_refs/angular/core-docs-fetch.mjs --cwd <target> --require-installed
--exact-version` for relevant component docs, and inspect actual exports/source
and existing use. Missing exact docs require local evidence or an explicit
limitation. Do not infer a selector, input or utility from the component name.

## Focused probes

| Concern | Angular/Core UI evidence | Verify against shared rule |
|---|---|---|
| Dialog/drawer | Inspect the installed primitive and custom wrapper focus behavior. Use an already available CDK focus facility only when needed and compatible; missing `cdkTrapFocus` alone is not a defect. | UX-A11Y-KEYBOARD: open/close, containment, escape and focus return |
| Focus styling | Inspect component styles and actual focus-visible output, including surrounding surfaces and sticky shell. | UX-A11Y-KEYBOARD and UX-A11Y-CONTRAST |
| Async feedback | Inspect actual notification/error-summary component and rendered accessibility semantics, including available `LiveAnnouncer` usage. Do not invent a toast API. | UX-A11Y-NAME and UX-A11Y-ERROR: trigger success/error and listen |
| Forms | Follow label/error IDs through the control wrapper and generated DOM; do not assume Core UI associates them automatically. | UX-A11Y-NAME and UX-A11Y-ERROR: invalid submit and correction |
| Tables/selection | Determine whether the installed component is a semantic table or interactive grid. Do not require arrow keys for every table. Check independent row-open, checkbox and action controls. | UX-A11Y-KEYBOARD and UX-A11Y-NAME; UX-TABLE-SELECTION for scope parity |
| Route changes | Inspect RouterOutlet/navigation and current page-title/focus/announcement conventions; do not prescribe a focus reset on every click. | UX-A11Y-KEYBOARD: navigate menu, breadcrumb and deep links |
| Section headings | Inspect actual rendered heading levels across the composed page rather than assuming a Core UI component always emits h3. | UX-A11Y-NAME; accepted heading conventions stay separate |
| Responsive actions | Inspect rendered bounds, adjacent targets, zoom, text scaling and sticky shell. No portal-specific relaxation or universal 32/44px rule. | UX-A11Y-TARGET and UX-A11Y-REFLOW |
| Status and locale | Check programmatic/visible state and document language against the actual supported locales. Do not invent a language switcher. | UX-A11Y-NAME and UX-A11Y-CONTRAST |
| Disclosure/sidebar | Inspect current link/disclosure semantics and permission-filtered navigation at each actual level. | UX-A11Y-KEYBOARD and UX-NAV-HIERARCHY/UX-NAV-COLLAPSE |

Choose representative affected list/detail/form routes from the project. Test
keyboard, focus, errors, zoom and assistive announcements where runtime access
exists. Otherwise record NOT RUN and exact source limitations. A Lighthouse
score or a successful build is not an accessibility pass. Never prescribe a
lower conformance target because portal applications are complex.

Review stays read-only; source fixes remain with the authorized repair/executor.
