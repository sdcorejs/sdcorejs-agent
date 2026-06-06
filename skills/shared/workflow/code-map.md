---
name: sdcorejs-code-map
description: READ-ONLY skill for architecture discovery. Use when starting a new major feature, when the user asks to "dùng lại shared component", "use existing shared components", "reuse what we have", or when generating code that should slot into existing modules. Scans the target project's structure to find existing modules, shared UI components, base DTOs/services, route registry, and permission codes — BEFORE writing code. Prevents hallucinated paths and duplicated abstractions. Applies to angular, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Bash, Glob, Read
---

# Code Map — Architecture Discovery

## Purpose
Before generating a new module / entity / screen, find what already exists. AI generators that skip this step invent paths, duplicate shared services, and break conventions invisible from a single file. This skill gives the next code-writing skill an accurate picture of the local architecture.

## When invoked

Triggering is description-based: there is no orchestration hook that runs this skill automatically. When a code-writing skill (`write-code` — the `angular-write-code` orchestrator and its init-portal / init-module reference packs, or another track's init step) is about to generate into an existing repo, the agent is responsible for invoking this skill first — treat that as a strong default, not an enforced gate. Skipping it is the single biggest cause of hallucinated paths and duplicated abstractions, so only skip when the repo's layout is already established in the current session.

### Invoke before generation (strongly recommended)
- About to invoke `write-code` for a new module / entity / screen
- About to run the `angular-write-code` init-portal / init-module packs (or another track's init step)
- User starts a major feature and the agent has no prior map of this repo

### Invoke on explicit request
- User asks "dùng lại shared component nào", "use existing", "reuse"
- "show me the structure", "code map", "what modules exist"
- Architecture review / audit

This skill is READ-ONLY. It NEVER edits files.

## Scope detection
Use the same detection logic as `sdcorejs-env-setup`:
- `angular.json` → angular
- `nest-cli.json` → nestjs
- `next.config.*` → nextjs

For monorepos, run a scan per stack (one report each).

## Workflow

### 1. Find the project root + conventions
```bash
git rev-parse --show-toplevel
ls angular.json nest-cli.json next.config.* package.json apps/ libs/ packages/ 2>/dev/null
```
Look for monorepo layout (`apps/`, `libs/`, `packages/`) vs flat. This shapes every subsequent glob.

### 1b. Discover the ACTUAL source layout before globbing — don't assume

Repos in the wild do not all put code where a template expects. The globs in step 2 are written against the *common* layout for each stack, but real repos vary widely, and a glob aimed at a path that doesn't exist silently returns nothing — which reads as "empty project" and is exactly how this skill hallucinates structure. So first find where source actually clusters, then point the step-2 globs at the roots you found.

Layouts you will encounter (non-exhaustive — derive, don't memorize):
- **Angular**: `src/app/`, `src/libs/<lib>/` (portal template), `projects/<lib>/{components,forms}/` (component-library / publishable entry points), `libs/<lib>/` or `projects/<app>/src/libs/` (Nx).
- **NestJS**: `src/modules/`, `src/<domain>/`, `core-be/modules/` + `core-be/{base,guards,decorators}/` + `shared/<domain>/` (OneMount masterdata layout), `apps/<app>/src/` + `libs/<lib>/src/` (Nx monorepo).
- **NextJS**: `app/` (App Router) or `pages/` (Pages Router); components at `components/`, `src/components/`, or co-located.

Find the real roots, e.g.:
```bash
# Where do the stack's signature files actually live? (these answers drive step 2)
# Angular: component/module/routes roots
find . \( -name '*.component.ts' -o -name '*.routes.ts' -o -name 'routes.ts' \) \
  -not -path '*/node_modules/*' -not -path '*/dist/*' 2>/dev/null | sed 's|/[^/]*$||' | sort -u | head -40
# NestJS: controllers/modules/base classes
grep -rl --include='*.ts' -E '@Controller\(|@Module\(|extends Base' . 2>/dev/null \
  | grep -v node_modules | sed 's|/[^/]*$||' | sort -u | head -40
# NextJS: route files
find . \( -name 'page.tsx' -o -name 'route.ts' \) -not -path '*/node_modules/*' 2>/dev/null \
  | sed 's|/[^/]*$||' | sort -u | head -40
```
Let the directories that come back define `<SRC>` for the next step. If the common-layout globs below return nothing, that's the signal the repo uses a different root — fall back to these discovery commands rather than concluding the project is empty.

### 2. Glob the structure (parallel — all read-only)

Treat the paths below as the *common-case* roots. Substitute the real roots from step 1b wherever they differ (e.g. `core-be/modules` instead of `src/modules`, `projects/<lib>/components` instead of `src/libs`).

#### Angular Portal
```bash
# Feature libs / app modules (top-level domains) — covers src/libs, src/app, projects/*, Nx libs
find src/libs src/app projects -maxdepth 3 -type d 2>/dev/null | grep -v node_modules
# Publishable component-library entry points (component-per-folder layout)
find projects -maxdepth 3 -type d \( -name components -o -name forms \) 2>/dev/null
# Per-entity feature folders inside each lib
find src/libs/*/features projects/*/features -maxdepth 1 -type d 2>/dev/null
# Shared UI / pipes / directives
find src/libs/shared projects/*/shared -maxdepth 3 -type d 2>/dev/null
# Route registries (whole tree — names vary: routes.ts, *.routes.ts)
find . \( -name 'routes.ts' -o -name '*.routes.ts' \) -not -path '*/node_modules/*' 2>/dev/null
# Permission codes
grep -r --include='*.ts' -E '_C_[A-Z_]+|_PERMISSIONS\s*=' src/ projects/ 2>/dev/null | head -30
```

#### NestJS
```bash
# Feature modules — covers src/modules, core-be/modules, apps/*/src, src/<domain>
find src/modules core-be/modules apps -maxdepth 3 -type d 2>/dev/null | grep -v node_modules
# Shared / base classes — covers src/{shared,common}, core-be/{base,guards,decorators}, shared/*
find src/shared src/common src/libs/shared core-be/base core-be/guards core-be/decorators shared \
  -maxdepth 2 -type d 2>/dev/null | grep -v node_modules
# Entities + DTOs (whole tree, node_modules excluded)
find . -name '*.entity.ts' -not -path '*/node_modules/*' 2>/dev/null | head -50
find . -name '*.dto.ts' -not -path '*/node_modules/*' 2>/dev/null | head -50
# Decorators / guards / permission setup
grep -rl --include='*.ts' -E 'HasPermission|AuthGuard|@Public' . 2>/dev/null | grep -v node_modules | head -20
# Routes / controllers
grep -r --include='*.ts' -E "@Controller\(" . 2>/dev/null | grep -v node_modules | head -40
```

#### NextJS
```bash
# App router structure (parenthesize the -o so -maxdepth applies to both, not just the first)
find app src/app -maxdepth 3 \( -name 'page.tsx' -o -name 'route.ts' \) 2>/dev/null | head -50
# Shared components
find components src/components -maxdepth 3 -type d 2>/dev/null
# Server actions / API
find app src/app \( -name 'actions.ts' -o -name 'route.ts' \) 2>/dev/null | head -20
```

### 3. Read just enough to summarize

For each module/lib found:
- Read its `index.ts` / barrel file (exports tell you the public API)
- Read its `routes.ts` if present (registered routes + lazy-load points)
- Read its `<module-name>.module.ts` (declarations + providers)
- DO NOT read full component bodies — listings + signatures are enough

For shared utilities:
- Read filenames + first 30 lines (imports + signature) to know intent
- Aggregate by directory

### 4. Build the report

Output to the chat (not a file, unless user asks):

```markdown
## Code Map — <repo>/<stack> — <timestamp>

### Module / lib inventory
| Module | Path | Purpose | Entities |
|---|---|---|---|
| catalog | `src/libs/catalog` | sản phẩm + danh mục | Product, Category |
| order | `src/libs/order` | đơn hàng | Order, OrderItem |
| shared | `src/libs/shared` | utilities | — |

### Shared UI / utilities
- **components/**: `LoadingOverlay`, `EmptyState`, `ConfirmDialog`
- **directives/**: `AutoFocus`, `ClickOutside`
- **pipes/**: `VnDate`, `Money`
- **validators/**: `EmailVnRegex`, `PhoneVn`

### Base classes / services (NestJS)
- `BaseEntity` — `src/shared/base/base.entity.ts` (id, createdAt, updatedAt, createdBy, updatedBy)
- `BaseRepository<T>` — `src/shared/base/base.repository.ts` (paginate, findByIds, softDelete)
- `BaseService<T>` — `src/shared/base/base.service.ts` (CRUD + permission check hooks)
- `SdContext` middleware — `src/shared/middleware/sd-context.middleware.ts` (req.context.userId, .roles)

### Routes / controllers (NestJS)
- `/products` — ProductsController (uses HasPermission('CATALOG_C_PRODUCT_*'))
- `/orders` — OrdersController
- `/auth` — AuthController (@Public on /login + /refresh)

### Permission codes in use
- `CATALOG_C_PRODUCT_{LIST,DETAIL,CREATE,UPDATE,DELETE}`
- `ORDER_O_ORDER_{LIST,DETAIL,APPROVE,REJECT,SUBMIT}`
- (33 total — see `src/libs/shared/constants/permissions.ts`)

### Reusable for the upcoming task
Based on the planned work (<insert from caller's context>):
- ✅ Reuse `BaseService<T>` for CRUD plumbing — don't reimplement
- ✅ Reuse `ConfirmDialog` for delete confirmation — don't write a new modal
- ✅ Reuse `VnDate` pipe — don't import dayjs directly
- ⚠️ No existing module for `pricing` — will create new `src/libs/pricing/` per convention

### Path conventions detected
- Each lib lives at `src/libs/<lib>/`; per-entity feature folders are at `src/libs/<lib>/features/<entity>/`
- Routes registered in `src/libs/<module>/routes.ts`, lazy-loaded
- DTOs colocated with services: `services/<entity>.model.ts`
- Mock data: `services/<entity>.mock-data.ts`
- Permissions: imported from `src/libs/shared/constants/permissions.ts`

### Anti-conventions to avoid
(Things the agent is at risk of doing wrong based on what it has found — derived, not invented.)
- ❌ Don't import from `dayjs` directly — there's a project-standard pipe
- ❌ Don't define a new `BaseEntity` — there's one in `src/shared/base`
- ❌ Don't hardcode route paths — register in the module's `routes.ts`
```

### 5. Hand off
After the report, return control. The caller (usually `write-code` or a planning skill) uses the map to slot generation into existing structure.

If the caller is the user directly asking for the map → just present the report and stop.

## Per-stack quirks

### Angular Portal
- Module roots vary: `src/libs/` (portal template), `projects/<project>/src/libs/` (Nx), and `projects/<lib>/{components,forms}/` for **publishable component libraries** where each component is its own entry-point folder (e.g. `@sdcorejs/angular`). Detect from `angular.json` `projects` first; don't assume `src/libs`.
- Watch for `@sdcorejs/angular` imports — the project's UI baseline. Cross-reference `_refs/angular/sdcorejs-angular-catalog.md` when listing components in use.

### NestJS
- This stack typically uses custom validators, NOT `class-validator` — flag if you see both in use (one is dead code)
- `@HasPermission` decorator alone does nothing without `AuthGuard` registered — verify both are present
- `BaseRepository` / `BaseEntity` patterns vary across OneMount sub-projects (`be-admin`, `be-masterdata`) — read the actual base class, don't assume
- Module/base roots vary: `src/modules/` on greenfield apps, but the masterdata baseline puts feature modules under `core-be/modules/`, base classes/guards/decorators under `core-be/{base,guards,decorators}/`, and shared domain models under `shared/<domain>/`. If `src/modules` is empty, look there before reporting "no modules".

### NextJS
- App Router (`app/`) vs Pages Router (`pages/`) — never mix recommendations
- Server Components vs Client Components — note which directories use `'use client'`

## Rules

### MUST DO
- READ-ONLY — never edit, never create files (except an optional cached report if explicitly requested)
- Glob first, read second — don't open files you don't need
- Read barrel files / `index.ts` / `routes.ts` for the public surface; skip implementation bodies
- Output a structured report grouped by category (modules / shared / base / routes / permissions)
- Surface "reusable for the upcoming task" only if the caller passes upcoming-task context
- Flag anti-conventions derived from observed evidence (not generic best practices)

### MUST NOT
- Edit files
- Write a permanent cache (`.sdcorejs/cache/codebase-map.json`) by default — only if explicitly asked, and explain the staleness risk
- Read full component bodies / large files
- Invent paths the glob didn't find
- Run on a 10k-file repo without scoping — ask user for a subdirectory if needed
- Recommend reuse without verifying the reusable thing actually exists at the path you claim

## Anti-patterns
- Reading every `.ts` file in the repo — defeats the purpose (slow + noisy)
- Producing a generic architecture recommendation that doesn't reference the actual files found
- Caching results across sessions and trusting them when the repo has changed (use `git log` to check freshness)
- Listing 50+ modules without grouping (reviewer can't use it)
- Telling the user "there's a base class" without naming the file
- Recommending a shared component that exists in the LIBRARY but isn't actually imported anywhere yet (could be unused / deprecated)
