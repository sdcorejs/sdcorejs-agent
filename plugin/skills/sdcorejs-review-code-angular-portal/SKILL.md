---
name: sdcorejs-review-code-angular-portal
description: Use to review generated or modified Angular-portal code against the SDCoreJS Core UI conventions (standalone-first, Core UI components, mock-first services, side-drawer vs page detail patterns, route-state CRUD, audit columns). Outputs a structured Strengths / Issues report sorted Critical → Important → Minor with file:line refs. Triggers - "review code angular", "audit module angular", "rà soát code angular portal", "check Core UI conventions", or invocation after `angular-portal-write-code` completes. Bilingual (VI/EN).
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

### Core UI usage
- Uses `@sd-angular/core/components`, `@sd-angular/core/forms`, `@sd-angular/core/modules` instead of hand-rolled equivalents
- If a custom skeleton exists, it is marked with `// CUSTOM_UI: <reason>` and the generation summary mentioned it
- Imports come from path-specific subpaths (e.g. `@sd-angular/core/components/section`), not legacy `from 'sd-angular'`

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
