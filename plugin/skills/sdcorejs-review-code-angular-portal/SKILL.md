---
name: sdcorejs-review-code-angular-portal
description: Use to review generated or modified Angular-portal code against the SDCoreJS Core UI conventions (standalone-first, Core UI components, mock-first services, side-drawer vs page detail patterns, route-state CRUD, audit columns). Outputs a structured Strengths / Issues report sorted Critical → Important → Minor with file:line refs — or, for a full audit, a 13-category scored deep-review (Score/Findings/Risks/Recommendations, weighted by Performance · Maintainability · Scalability · Enterprise readiness). Triggers - "review code angular", "audit module angular", "rà soát code angular portal", "check Core UI conventions", "scored review", "đánh giá / chấm điểm code angular", "enterprise readiness", or invocation after `angular-portal-write-code` completes. Bilingual (VI/EN).
allowed-tools: Read, Glob, Grep
---

# 50 — Review Code

## Purpose
Audit generated or modified Angular portal code against SDCoreJS conventions. Surfaces violations the human reviewer should fix. Read-only — does not modify code.

## When to use
- After `07-write-code` finishes a sizeable batch
- Before merging a feature branch
- User says "review module X", "check code", "audit module sales", "rà soát module catalog"
- After `40-e2e-test` to cross-check that test coverage matches code surface

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

### New Core UI components (use the built-in, don't re-implement)
Flag a hand-rolled equivalent when one of these fits — and check the key conventions:
- `sd-query-bar` — list filter bar. Check `[mode]` (`popover` | `inline`), single `(apply)`/`(queryChange)` wiring (not per-chip apply), `SdQueryField.type` (NOT old `kind`). Prefer over a custom filter row.
- `sd-query-builder` — nested AND/OR rule builder (advanced search). Don't confuse with `sd-query-bar`.
- `sd-operator` — operator picker; two-way `[(model)]` of `Operator`, `operators` input. Don't hand-roll a mat-menu of operators.
- `sd-splitter` + `sd-splitter-panel` — resizable panes. Check `panelId` set when `storageKey` / `collapse|expand|toggle(target)` used; at least one `unit="flex"` panel.
- `sd-stepper` — multi-step wizard indicator. Use instead of a custom step header.
- `sd-inform` — page banner/alert. Presentational; color via boolean shortcut or `color`; `closable` for self-dismiss. Not for toasts (use `SdNotifyService`).
- `sd-form-generic` (`sd-form-builder` / `sd-form-render`) — schema-driven dynamic forms. Requires `SD_FORM_GENERIC_CONFIGURATION` provided (NOT the old `SD_WORKFLOW_CONFIGURATION`); import from `@sdcorejs/angular/components/form-generic`.
- `sd-input-color` — color form control. Use instead of a raw `<input type="color">`.

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
- `*.spec.ts` exists alongside every component/service/routes file
- Tests are runnable, not placeholders (no `// TODO`)
- `inject()` deps are mocked
- Spec coverage matches the level the user picked (minimal / standard / full)
- `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts` exit code 0

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
- Hand-rolled UI where a new Core UI component fits (custom filter row vs `sd-query-bar`, raw color input vs `sd-input-color`, custom resizable panes vs `sd-splitter`)
- `sd-form-render` without `SD_FORM_GENERIC_CONFIGURATION` provided (runtime throw), or still referencing the old `SD_WORKFLOW_CONFIGURATION`

## Output format

```markdown
# Code Review — <module>/<entity>

## Strengths
- <one-line wins, max 5>

## Issues — Critical
1. **<file>:<line>** — <one-line problem>
   <one-paragraph why it matters; suggested fix>

## Issues — Important
2. **<file>:<line>** — ...

## Issues — Minor
3. **<file>:<line>** — ...

## Verification commands run
- `npm run build-dev` → exit 0 / failed
- `npm run test -- --watch=false --include=...` → 47 passed, 0 failed
```

Sort: Critical first (security, broken behavior, data loss), Important second (convention violation that will cause maintenance pain), Minor last (style, doc).

## Scored deep-review mode (enterprise audit)

Use this mode for a full module/branch audit, or when the user asks for a "scored review", "đánh giá", "chấm điểm", or an enterprise-readiness assessment. The quick Strengths/Issues format above stays the default for small diffs.

**Priority lens (weight findings in this order):** Performance → Maintainability → Scalability → Enterprise readiness. A finding that hurts a higher-priority axis outranks one that only affects a lower axis. **Do NOT score formatting/style** unless it measurably hurts maintainability (then say how).

**Scoring bands (1–10):** 9–10 exemplary · 7–8 solid, minor gaps · 5–6 works but real debt · 3–4 significant issues, rework needed · 1–2 broken / risky. Score against what an enterprise Angular-20 portal should look like, not against "it compiles".

Score each of these 13 categories. For every category output **Score (1–10)**, **Findings** (concrete, `file:line`), **Risks** (what breaks at scale / over time), **Recommended improvements** (actionable, prioritized).

1. **Architecture & folder structure** — module/entity layout, feature isolation + boundaries, lazy routes, barrel hygiene, no cross-module reach-around, config-token scoping.
2. **Component design** — single responsibility, smart/dumb split, `input()/model()/output()` surface, content projection vs prop drilling, component size, standalone.
3. **Dependency injection** — `inject()` fn, `providedIn` scope correctness, no service-locator abuse, injection tokens for config, no circular deps, no logic-heavy constructors.
4. **RxJS usage** — teardown (`takeUntilDestroyed` / `async` pipe, no manual leak-prone `subscribe`), no nested `subscribe`, correct operators (switch/merge/concat/exhaust), error handling, no over-RxJS where a signal fits.
5. **Signal adoption** — `signal/computed/effect` used correctly, `effect` not used as `computed`, no redundant `BehaviorSubject` where a signal fits, `toSignal`/`toObservable` at boundaries, no signal writes inside `computed`.
6. **Change detection strategy** — `OnPush` everywhere, no method calls in bindings, `@for` `track`, zoneless-readiness (no `setTimeout`/manual `markForCheck` hacks), minimal CD surface.
7. **Template quality** — native control flow (`@if/@for/@let`, no `*ngIf/*ngFor`), `track` keys, `async` pipe over manual subscribe, no heavy expressions/logic in template, signals referenced 2+ times extracted.
8. **Forms implementation** — typed reactive forms (`FormGroup<...>`), explicit validators + async validators where needed, cross-field rules, submit gating (`invalid → markAllAsTouched`), no template-driven for complex forms, error surfacing.
9. **API layer design** — typed DTOs (`SaveReq`/`DTO`), `SdApiService` (no raw `HttpClient` ad-hoc), URLs from environment (no hardcode), error/retry/caching strategy, logic in services not components, mock-first parity.
10. **Testing strategy** — coverage matches picked level (minimal/standard/full), runnable (no `// TODO`), deps mocked, meaningful assertions (not just "created"), integration where behavior matters, spec alongside each file.
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

## Rules

### MUST DO
- Read every file under review; do not skim
- Cite `file:line` for every issue
- Sort by severity, not by file order
- Run `npm run build-dev` and the relevant test command and include exit codes in the report
- Match user's language (VI/EN) for headings and explanations
- Distinguish "this is a bug" from "this is a style preference"

### MUST NOT
- Edit files (read-only review)
- Mark style preferences as Critical
- Skip running the build/test verification commands
- Output a review without `file:line` references (un-actionable)
- Repeat the same issue 5 times for 5 files — group them ("Same `inject()` violation in 5 files: ...")
- Invent issues that aren't in the code

## Anti-patterns
- "Looks good!" — provide concrete observations
- Critical issues without explanation of impact
- Reviewing without running the build (might miss compile errors)
- Issues without suggested fixes

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
