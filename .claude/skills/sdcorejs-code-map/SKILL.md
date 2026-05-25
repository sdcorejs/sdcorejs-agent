---
name: sdcorejs-code-map
description: READ-ONLY skill for architecture discovery. Use when starting a new major feature, when the user asks to "dùng lại shared component", "use existing shared components", "reuse what we have", or when generating code that should slot into existing modules. Scans the target project's structure to find existing modules, shared UI components, base DTOs/services, route registry, and permission codes — BEFORE writing code. Prevents hallucinated paths and duplicated abstractions. Applies to angular-portal, nestjs, nextjs.
allowed-tools: Bash, Glob, Read
---

# Code Map — Architecture Discovery

## Purpose
Before generating a new module / entity / screen, find what already exists. AI generators that skip this step invent paths, duplicate shared services, and break conventions invisible from a single file. This skill gives the next code-writing skill an accurate picture of the local architecture.

## When invoked

### Mandatory triggers (auto-run before generation)
- About to invoke `07-write-code` for a new module / entity / screen
- About to invoke any `10-init-*` or `11-init-module` skill
- User asks "dùng lại shared component nào", "use existing", "reuse"
- User starts a major feature and the agent has no prior session context for this repo

### Optional triggers (on user request)
- "show me the structure", "code map", "what modules exist"
- Architecture review / audit

This skill is READ-ONLY. It NEVER edits files.

## Scope detection
Use the same detection logic as `sdcorejs-env-setup`:
- `angular.json` → angular-portal
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

### 2. Glob the structure (parallel — all read-only)

#### Angular Portal
```bash
# Feature libs (top-level domains)
find src/libs -maxdepth 2 -type d 2>/dev/null              # or libs/ in nx repos
# Per-entity feature folders inside each lib
find src/libs/*/features -maxdepth 1 -type d 2>/dev/null
# Shared UI / pipes / directives
find src/libs/shared -maxdepth 3 -type d 2>/dev/null
# Route registries
find . -name 'routes.ts' -not -path '*/node_modules/*' 2>/dev/null
# Permission codes
grep -r --include='*.ts' -E '_C_[A-Z_]+|_PERMISSIONS\s*=' src/ 2>/dev/null | head -30
```

#### NestJS
```bash
# Feature modules
find src/modules -maxdepth 1 -type d 2>/dev/null
# Shared / base classes
find src/shared src/common src/libs/shared -maxdepth 2 -type d 2>/dev/null
# Entities + DTOs
find src -name '*.entity.ts' -not -path '*/node_modules/*' 2>/dev/null | head -50
find src -name '*.dto.ts' -not -path '*/node_modules/*' 2>/dev/null | head -50
# Decorators / guards
grep -r --include='*.ts' -l 'HasPermission\|AuthGuard\|@Public' src/ 2>/dev/null | head -20
# Routes / controllers
grep -r --include='*.ts' -E "@Controller\(['\"]" src/ 2>/dev/null
```

#### NextJS
```bash
# App router structure
find app -maxdepth 3 -name 'page.tsx' -o -name 'route.ts' 2>/dev/null | head -50
# Shared components
find components -maxdepth 3 -type d 2>/dev/null
# Server actions / API
find app -name 'actions.ts' -o -name 'route.ts' 2>/dev/null | head -20
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
After the report, return control. The caller (usually `07-write-code` or a planning skill) uses the map to slot generation into existing structure.

If the caller is the user directly asking for the map → just present the report and stop.

## Per-stack quirks

### Angular Portal
- Some repos put modules under `src/libs/`, others under `projects/<project>/src/libs/` (Nx). Detect from `angular.json` first.
- Watch for `@sd-angular/core` imports — the project's UI baseline. Cross-reference `_refs/sd-angular-core-catalog.md` when listing components in use.

### NestJS
- This stack typically uses custom validators, NOT `class-validator` — flag if you see both in use (one is dead code)
- `@HasPermission` decorator alone does nothing without `AuthGuard` registered — verify both are present
- `BaseRepository` / `BaseEntity` patterns vary across OneMount sub-projects (`be-admin`, `be-masterdata`) — read the actual base class, don't assume

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

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
