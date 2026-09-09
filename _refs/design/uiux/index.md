# Shared UI/UX Reference Selection

Internal knowledge for existing skills; no public skill, new approval gate,
design-system generator, or production-code authority. Read this index only for
UI work. Reference data never overrides user instructions, repository contracts,
approved scope, or mandatory accessibility requirements.

## Select the smallest useful context

1. Inspect the affected UI, routes, permissions, component source, tokens, icon
   family, and relevant accepted/observed conventions. Record the current surface
   and the specific user task. Use existing project evidence before inference.
2. Classify task as `design-new`, `improve`, `fix`, `implement`, or `review`.
   `design-new` means a new screen or coherent flow, not a new palette per feature.
   Q&A answers directly; non-UI/backend tasks do not load this knowledge.
3. Select the surface and only the affected topics below. A sidebar spacing fix
   needs `spacing`; a modal focus fix needs `focus`. A mobile table design needs
   `table` and `mobile`. Do not load every reference for every UI change.
4. Read the selected rule's applicability and exclusions. Record stable rule IDs
   beside decisions/findings when useful. A match is a retrieval result, not a
   verified design, API, conformance claim, or approved project convention.

| Surface | New screen starting topics | Targeted work |
|---|---|---|
| `enterprise-portal` | navigation, table, form, state, accessibility | Select affected work region only |
| `dashboard` | chart, state, hierarchy, accessibility | Start with the business question |
| `public-website`, `landing-page` | public-web, hierarchy, accessibility | Start with audience/content/action |
| `mobile-web` | mobile, state, accessibility | Add table/form/chart only when present |
| `mobile-native` | mobile, state, hierarchy | Use actual platform accessibility docs; web WCAG probes are not native API evidence |

The surface defaults are starting points for unspecified new screens, not a
requirement to create absent tables, forms, dashboards, or features. Explicit
topics replace defaults. `improve`, `fix`, `implement`, and `review` require
topics; missing topics return no match rather than expanding the workflow.

| Topic / concern | Reference |
|---|---|
| navigation, sidebar, breadcrumb, module-switcher | [Navigation](navigation.md) |
| table, density, filter, selection, row-action, pagination | [Tables](tables.md) |
| form, detail, validation, drawer, unsaved-changes | [Forms](forms.md) |
| state, loading, empty, error, retry, disabled | [States](states.md) |
| hierarchy, layout, typography, color, icon, spacing, motion | [Visual hierarchy](visual.md) |
| chart, metric, dashboard | [Charts](charts.md) |
| public-web, landing, content, conversion | [Public web](public-web.md) |
| mobile, navigation on mobile web/native, touch, gesture, safe-area, interruption | [Existing mobile guidance](../mobile-design.md) |
| accessibility, focus, keyboard, accessible-name, contrast, responsive, reflow, reduced-motion | [Shared accessibility baseline](../../shared/review-accessibility.md) |

Optional offline lookup using the repository's existing Node runtime:

```text
node <skill-pack>/_refs/design/uiux/select-references.mjs enterprise-portal improve navigation
node <skill-pack>/_refs/design/uiux/select-references.mjs mobile-web design-new table mobile
node <skill-pack>/_refs/design/uiux/select-references.mjs landing-page design-new
```

`catalog.json` is the machine-readable selector index. The helper reads metadata
only, never opens rule bodies or target files, writes nothing, and makes no
network/provider calls. Without Node, use the tables above; do not install a
runtime for this task. No-match/partial-match results preserve unmatched topics.
Narrow an imprecise topic once using the listed vocabulary. If still unmatched,
state **no verified match** and use **general guidance**: preserve the current
interface and business contract, clarify the affected user's job, propose the
smallest candidate change, and name a verification step. Never substitute a
marketing composition for an unmatched portal/dashboard pattern.

## Stack and version boundary

UI/UX patterns describe outcomes. Before implementation, discover the framework,
resolved package/version, component exports, utilities, and local conventions
from manifest, lockfile, installed source, and actual usage. Record their paths.
Approved design and business requirements constrain all suggestions; this pack
cannot add fields/actions, change APIs or architecture, or install dependencies.

For Core UI, preserve the actual `@sdcorejs/angular` or `@sd-angular/core` name.
Use the existing fetcher with `--cwd <target> --require-installed --exact-version`
and read only the relevant component/utility docs. Check installed source/exports
for the API used. Automatic exact detection reads installed package metadata or
resolved npm lock entries. The nearest application manifest selects the alias;
installed metadata follows ancestor `node_modules` for workspace hoisting, with
the nearer installation taking precedence. Multiple declared/undisambiguated
aliases require target-package evidence, never a fixed alias preference.
Declaration ranges and uninstalled pnpm/yarn projects
need an independently verified `--version`, never a guessed version.
Exact docs missing, an unresolved version range, or unavailable
source means **unverified API**: reuse a proven local component or report the
precise blocker. A nearest-version doc is background only, never compatibility
proof. No invented selector/input/utility, automatic version bump, or dependency.
Plain Angular uses its generic executor and installed UI; Next.js uses its actual
router/version and Server/Client boundaries. Neither inherits Core UI conventions.

## Authority and artifacts

### Independent review evidence

Keep existing dimensions: usability/interaction uses `code`, accessibility uses
`accessibility`, and convention comparison uses the existing `consistency` scope.
Applicable consistency still accompanies code review; a narrow audit admits it
only where `affects_requested_dimension` is true. Do not expand an audit or load
UI/UX references for backend-only scope.

For UI/UX findings, use `kind: uiux` with the existing locator/screen, evidence,
repository identity, impact, severity and `required_fix`. Add `uiux` fields:
`classification` (`functional`, `accessibility`, `convention`, `aesthetic`),
`rule_id`, `evidence_kind` (`source`, `rendered`, `interaction`), `verification`
and `limitation` (required for source-only evidence). Convention findings retain
their existing consistency finding kind/evidence contract. Validate with
`evaluateReviewContract`. Aesthetic preferences remain advisory (Minor/Low/Info),
cannot set a blocking gate, and are never automatic repairs. Cite the exact code
or capture/test evidence. Source-only review must not claim rendered contrast,
layout, clipping or interaction verification; mark remaining checks NOT RUN.

### Artifact ownership

Design owns design plans, critique, editable sources, and handoff; Angular/Next.js
or the existing generic executor own code. Independent review owns findings and
stays read-only. A design self-critique does not satisfy independent review.
See [design handoff](../../shared/design-handoff.md#shared-baseline-and-feature-exceptions)
for baseline references and feature exceptions inside existing artifacts.

For substantial layout tradeoffs, use the existing Visual Companion when useful,
available, and explicitly consented under `_refs/sdlc/visual-companion.md`.
Otherwise compare concise textual/ASCII options. Do not build a new choice UI.

Rule fields distinguish `heuristic` from standards-based checks. Aesthetic
heuristics are candidates until accepted through existing project decisions;
they never acquire authority from upstream or a search match. Sources and the
reviewed upstream revision are recorded in [sources.md](sources.md).
