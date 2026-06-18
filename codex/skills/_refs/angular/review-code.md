# Review-Code Knowledge — Angular Portal

> Track-specific knowledge loaded on demand by the `sdcorejs-review` skill
> when the project architecture is detected as an Angular portal (`angular.json`
> + `@sdcorejs/angular`). Not a dispatchable skill — has no frontmatter.
> The **output format** (color-coded tables) is owned by the parent skill; this
> file only supplies *what to check*. The scored deep-review mode (below) is an
> Angular-specific alternate output.

## What this covers
Audit generated or modified Angular portal code against SDCoreJS Core UI
conventions. Read-only — surfaces violations the human reviewer should fix.

## Review checklist

For every file under review, check the following.

### Architecture
- Lazy loading: every entity route uses `loadComponent` / `loadChildren`, not eager imports
- Module wiring: `<MODULE>_CONFIGURATION` provided at the right scope (root for root-scoped services, route-level for module-scoped interceptors)
- Permission keys consistent: `data.permission` matches `<MODULE>_C_<ENTITY>_<ACTION>` and `data.permissionKey` matches the configuration `key`
- Standalone-first unless the project is hybrid; no mixing without reason
- Interceptor wiring: HTTP interceptors registered via `HTTP_INTERCEPTORS` multi-provider (or `withInterceptors`) in the right ORDER — `SdUnauthorizedInterceptor` (401 → signout) and `SdNoInternetInterceptor` (offline / 503) imported from `@sdcorejs/angular/interceptors`, not hand-rolled. Auth/refresh interceptor before the error-surfacing ones.

### Core UI usage
- Uses `@sdcorejs/angular/components`, `@sdcorejs/angular/forms`, `@sdcorejs/angular/modules` instead of hand-rolled equivalents
- If a custom skeleton exists, it is marked with `// CUSTOM_UI: <reason>` and the generation summary mentioned it
- Imports come from path-specific subpaths (e.g. `@sdcorejs/angular/components/section`), not the barrel `from 'sd-angular'`
- **Don't re-implement what Core UI already ships.** When a hand-rolled widget duplicates a Core UI component (filter bar, operator picker, splitter, stepper, banner, dynamic form, color input, …), flag it and point the dev to the built-in. The authoritative component inventory is fetched on-demand (not committed) via `node _refs/angular/core-docs-fetch.mjs --list`; each component's per-component conventions and required configuration tokens via `node _refs/angular/core-docs-fetch.mjs --print sd-<name>` — consult it rather than hard-coding a component list here (drift-proof: the fetcher is version-matched to the pinned `@sdcorejs/angular` and stays current).

### Naming
- Files: `<entity-kebab>.model.ts`, `<entity-kebab>.service.ts`, `<entity-kebab>.routes.ts`, `<entity-kebab>.mock-data.ts`
- Classes: `<EntityPascal>Service`, `<EntityPascal>DTO`, `<EntityPascal>SaveReq`
- Selectors: `<entity-kebab>-list`, `<entity-kebab>-detail`
- Permission codes: `<MODULE>_C_<ENTITY>_<ACTION>` strict format

### Components
- `changeDetection: ChangeDetectionStrategy.OnPush` on every list and detail component
- All injections via `inject()` function, not constructor params
- Private fields use `#` prefix (`readonly #service = inject(...)`)
- Mutable UI state uses `signal()`, derived state uses `computed()`, side effects use `effect()`
- Signals referenced 2+ times in template are extracted via `@let` or `computed()`
- Form uses `FormGroup` with explicit validators; submit gates on `form.invalid → markAllAsTouched`

### autoId (E2E selectors + inspector) — WARN when missing
Core UI components accept an `autoId` input, emitted as `data-autoId` / `data-autoid` so E2E specs and the `sd-autoid-inspector` overlay can grab the element. Missing `autoId` = the element is invisible to the inspector and E2E by stable selector. Warn (Important, not Critical) so the dev backfills it.
- Every interactive Core UI element has an `autoId`: form controls (`sd-input`, `sd-select`, `sd-date`, `sd-checkbox`, `sd-switch`, `sd-radio`, …), `sd-button`, `sd-table` (+ row command buttons), `sd-query-bar`, `sd-modal` / `sd-side-drawer`, tabs, action toolbars.
- `autoId` values are stable + meaningful (e.g. `product-name`, `product-save`, `product-list`), kebab-case, unique within the page — not random or duplicated.
- Composite components that need per-item ids (e.g. `sd-anchor-item` `key`, table row actions) have the id wired so the emitted `data-autoId` resolves per item.
- Report missing/empty `autoId` grouped per component type with the file:line list, phrased as a dev action: "Add `autoId` to N controls so the inspector + E2E can target them."

### List page
- Uses `SdTable` with `type: 'server'` and pagination
- Columns include 4 audit columns (`createdAt`, `createdBy`, `updatedAt`, `updatedBy`) — unless skip condition applies (embedded table, lookup entity, dialog)
- External filters in `tableOption.filter.externalFilters`, not custom controls above the table
- Permission directive on Create / Delete buttons

### Detail page
- Implements 3-state pattern (`CREATE | UPDATE | DETAIL`) with explicit branches
- Stale-id recovery: catches `detail(id)` errors, navigates back to list with notify
- Form fields render with `[viewed]="state() === 'DETAIL'"` for read-only state
- File uploads happen BEFORE save call

### Tests
- `*.spec.ts` exists alongside every component/service/routes file — a missing spec is a 🔴 defect, not a style nit
- Tests are runnable, not placeholders (no `// TODO`)
- `inject()` deps are mocked
- Spec coverage is `standard` by default (or the level the user explicitly chose); specs written RED-first
- `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts` exit code 0

### Styling (utility-first)
- Layout / spacing / color / typography use Core UI utility classes (or the consumer's Tailwind), not bespoke CSS — see `_refs/angular/styling.md`
- 🟡 flag a component `.scss` that hand-rolls `display:flex` / `gap` / `padding` / color a utility class already provides (`d-flex`, `gap-16`, `p-16`, `text-primary`) — the "too many unnecessary CSS classes" smell
- Spacing/sizing utilities are px-based 0–200, multiples of 4 (`mb-16` not `mb-3`); flag off-scale or out-of-range values
- No Bootstrap class names (`btn`, `card`, `form-control`, `modal`) and no Tailwind syntax when the consumer has no Tailwind
- Any custom `.scss` is token-based (`var(--sd-*)`) and carries a `// why:`

### Bilingual
- Vietnamese portal: labels, button titles, notify messages use VI with full diacritics
- English portal: same in EN
- Permission codes and route paths stay English in both cases

### Accessibility
- Buttons have `title` or `aria-label`
- Action toolbars have `role="toolbar"`
- Semantic HTML where possible (`<nav>`, `<main>`, `<section>`)

### Anti-patterns to flag
- Constructor injection
- Mutable plain class fields where `signal()` would be correct
- `effect()` used as `computed()`
- Hardcoded API URLs
- Logic in components instead of services
- Duplicate permission checks (route guard + in-component `canViewList`)
- Method calls in template bindings (re-runs every CD cycle)
- Missing `autoId` on interactive Core UI elements (breaks E2E + `sd-autoid-inspector`) — WARN, dev backfills
- Hand-rolled UI where a Core UI component fits — check the candidate against the on-demand inventory (`node _refs/angular/core-docs-fetch.mjs --list`)
- A Core UI component used without its required configuration token provided (runtime throw) — `node _refs/angular/core-docs-fetch.mjs --print sd-<name>` lists each component's setup requirements

## Verification commands (run, include exit codes in the report)
- `npm run build-dev` → exit 0 / failed
- `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts` → N passed, 0 failed

## Severity mapping for this track
- **🔴 Critical** — security, broken behavior, data loss, runtime throw (e.g. a Core UI component missing its required config token — see catalog), Zod/permission gaps, hardcoded API URLs.
- **🟡 Important** — convention violation that causes maintenance pain (constructor DI, missing `autoId`, method calls in template bindings, hand-rolled UI where Core UI fits).
- **🔵 Minor** — style, doc, naming nits that don't change behavior.
- **🟢 Strengths (mirror)** — correct 3-state pattern, clean signal usage, proper Core UI adoption worth replicating elsewhere.

## Scored deep-review mode (enterprise audit) — Angular-specific alternate output

Use this mode for a full module/branch audit, or when the user asks for a "scored review", "đánh giá", "chấm điểm", or an enterprise-readiness assessment. The color-table format from the parent skill stays the default for small diffs.

**Priority lens (weight findings in this order):** Performance → Maintainability → Scalability → Enterprise readiness. A finding that hurts a higher-priority axis outranks one that only affects a lower axis. **Do NOT score formatting/style** unless it measurably hurts maintainability (then say how).

**Scoring bands (1–10):** 9–10 exemplary · 7–8 solid, minor gaps · 5–6 works but real debt · 3–4 significant issues, rework needed · 1–2 broken / risky. Score against what an enterprise Angular-20 portal should look like, not against "it compiles".

Score each of these 13 categories. For every category output **Score (1–10)**, **Findings** (concrete, `file:line`), **Risks** (what breaks at scale / over time), **Recommended improvements** (actionable, prioritized).

1. **Architecture & folder structure** — module/entity layout, feature isolation + boundaries, lazy routes, barrel hygiene, no cross-module reach-around, config-token scoping.
2. **Component design** — single responsibility, smart/dumb split, `input()/model()/output()` surface, content projection vs prop drilling, component size, standalone.
3. **Dependency injection** — `inject()` fn, `providedIn` scope correctness, no service-locator abuse, injection tokens for config, no circular deps, no logic-heavy constructors.
4. **RxJS usage** — teardown (`takeUntilDestroyed` / `async` pipe, no manual leak-prone `subscribe`), no nested `subscribe`, correct operators (switch/merge/concat/exhaust), error handling, no over-RxJS where a signal fits.
5. **Signal adoption** — `signal/computed/effect` used correctly, `effect` not used as `computed`, no redundant `BehaviorSubject` where a signal fits, `toSignal`/`toObservable` at boundaries, no signal writes inside `computed`.
6. **Change detection strategy** — `OnPush` everywhere, no method calls in bindings, `@for` `track`, zoneless-readiness (no `setTimeout`/manual `markForCheck` hacks), minimal CD surface.
7. **Template quality & styling** — native control flow (`@if/@for/@let`, no `*ngIf/*ngFor`), `track` keys, `async` pipe over manual subscribe, no heavy expressions/logic in template, signals referenced 2+ times extracted. Styling is utility-first (Core UI STYLE-GUIDE classes or consumer Tailwind); component `.scss` near-empty; bespoke CSS that duplicates a shipped utility (flex/spacing/color/typography) is a finding; spacing px-based 0–200.
8. **Forms implementation** — typed reactive forms (`FormGroup<...>`), explicit validators + async validators where needed, cross-field rules, submit gating (`invalid → markAllAsTouched`), no template-driven for complex forms, error surfacing.
9. **API layer design** — typed DTOs (`SaveReq`/`DTO`), `SdApiService` (no raw `HttpClient` ad-hoc), URLs from environment (no hardcode), error/retry/caching strategy, logic in services not components, mock-first parity.
10. **Testing strategy** — spec exists alongside each file (missing = 🔴), coverage `standard` by default (or explicit override), written RED-first, runnable (no `// TODO`), deps mocked, meaningful assertions (not just "created"), integration where behavior matters.
11. **Accessibility** — semantic HTML (`<nav>/<main>/<section>`), `aria-label`/`title` on icon buttons, `role="toolbar"`, keyboard + focus management, AND `autoId` on interactive elements (E2E + `sd-autoid-inspector` selectors).
12. **Security** — XSS (`bypassSecurityTrust*` / `[innerHTML]` audited), token storage (httpOnly cookie vs localStorage), permission gating (route guard + directive, not duplicated logic), no secrets / prod source maps / leaked dev API URLs, interceptor order.
13. **Angular 20 readiness** — standalone + signals-first, native control flow, `inject()` (no constructor DI), no `NgModule`/deprecated APIs, zoneless-compatible, `@defer` for heavy/below-fold blocks, modern lifecycle (`afterNextRender`), `@sdcorejs/angular@20.0.1` aligned.

### Scored output format
```markdown
# Scored Review — <module>/<entity>   (Angular 20 / @sdcorejs/angular)

**Overall: X.X / 10** — <one-line verdict>. Priority lens: Performance · Maintainability · Scalability · Enterprise.

| # | Category | Score |
|---|----------|-------|
| 1 | Architecture & folder structure | 7 |
| … | … | … |
| 13 | Angular 20 readiness | 6 |

## 1. Architecture & folder structure — 7/10
- **Findings:** <file:line> …
- **Risks:** …
- **Recommended:** 1) … 2) …

## 2. Component design — N/10
…(repeat for all 13)…

## Top risks (cross-cutting, ranked)
1. <highest-priority-axis risk> — <impact>

## Quick wins (high value, low effort)
- …

## Verification commands run
- `npm run build-dev` → exit 0 / failed
- `npm run test -- --watch=false --include=...` → N passed, 0 failed
```

Overall score = weighted by the priority lens (Performance/Maintainability heaviest), not a flat average — state the weighting if it changes the headline number.
