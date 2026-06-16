---
name: sdcorejs-code-map
description: READ-ONLY skill for architecture discovery. Use when starting a new major feature, when the user asks to "reuse shared components", "use existing shared components", "reuse what we have", or when generating code that should slot into existing modules. Scans the target project's structure to find existing modules, shared UI components, base DTOs/services, route registry, and permission codes — BEFORE writing code. Prevents hallucinated paths and duplicated abstractions. Applies to angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Bash, Glob, Read
---

# Code Map — Architecture Discovery

## Purpose
Before generating a new module / entity / screen, find what already exists. Generators that skip this invent paths, duplicate shared services, and break conventions invisible from a single file. This skill hands the next code-writing skill an accurate picture of the local architecture. It is **READ-ONLY** — never edits or creates files.

## When to run
No orchestration hook runs this automatically — the agent invokes it. Treat it as a **strong default** before `write-code` (the `sdcorejs-angular` orchestrator + its init packs, or another track's init step) generates into an existing repo; skipping is the #1 cause of hallucinated paths. Only skip when the repo layout is already established this session. Also runs on explicit request ("reuse existing", "show me the structure", "code map", architecture review).

## Scope detection
Same as `sdcorejs-env-setup`: `angular.json`→angular, `nest-cli.json`→nestjs, `next.config.*`→nextjs. Monorepo → one scan + report per stack.

## Workflow

### 1. Root + REAL source layout (don't assume)
Globs aimed at a path that doesn't exist return nothing silently — which reads as "empty project" and is exactly how this skill hallucinates. So find where source actually clusters first, then point step-2 globs at the roots you found.

```bash
git rev-parse --show-toplevel
ls angular.json nest-cli.json next.config.* package.json apps/ libs/ packages/ 2>/dev/null   # flat vs monorepo
# Where do the stack's signature files actually live? (drives step 2)
# Angular:
find . \( -name '*.component.ts' -o -name '*.routes.ts' -o -name 'routes.ts' \) -not -path '*/node_modules/*' -not -path '*/dist/*' 2>/dev/null | sed 's|/[^/]*$||' | sort -u | head -40
# NestJS:
grep -rl --include='*.ts' -E '@Controller\(|@Module\(|extends Base' . 2>/dev/null | grep -v node_modules | sed 's|/[^/]*$||' | sort -u | head -40
# NextJS:
find . \( -name 'page.tsx' -o -name 'route.ts' \) -not -path '*/node_modules/*' 2>/dev/null | sed 's|/[^/]*$||' | sort -u | head -40
```
Common roots (derive, don't memorize): Angular `src/libs/<lib>`, `src/app`, `projects/<lib>/{components,forms}` (publishable libs), Nx `libs/`. NestJS `src/modules`, `core-be/modules` + `core-be/{base,guards,decorators}` + `shared/<domain>` (masterdata), Nx `apps/*/src`+`libs/*/src`. NextJS `app/` or `pages/`. If the step-2 globs return nothing, the repo uses a different root — re-run the discovery above rather than concluding "empty".

### 2. Glob the structure (all read-only; substitute the real roots from step 1)

```bash
# ── Angular ──
find src/libs src/app projects -maxdepth 3 -type d 2>/dev/null | grep -v node_modules     # domains
find projects -maxdepth 3 -type d \( -name components -o -name forms \) 2>/dev/null          # publishable lib entry points
find src/libs/*/features projects/*/features -maxdepth 1 -type d 2>/dev/null                 # per-entity folders
find src/libs/shared projects/*/shared -maxdepth 3 -type d 2>/dev/null                        # shared UI/pipes/directives
find . \( -name 'routes.ts' -o -name '*.routes.ts' \) -not -path '*/node_modules/*' 2>/dev/null   # route registries
grep -r --include='*.ts' -E '_C_[A-Z_]+|_PERMISSIONS\s*=' src/ projects/ 2>/dev/null | head -30    # permission codes

# ── NestJS ──
find src/modules core-be/modules apps -maxdepth 3 -type d 2>/dev/null | grep -v node_modules
find src/shared src/common src/libs/shared core-be/base core-be/guards core-be/decorators shared -maxdepth 2 -type d 2>/dev/null | grep -v node_modules
find . -name '*.entity.ts' -not -path '*/node_modules/*' 2>/dev/null | head -50
find . -name '*.dto.ts' -not -path '*/node_modules/*' 2>/dev/null | head -50
grep -r --include='*.ts' -E "@Controller\(" . 2>/dev/null | grep -v node_modules | head -40

# ── NextJS ──
find app src/app -maxdepth 3 \( -name 'page.tsx' -o -name 'route.ts' \) 2>/dev/null | head -50
find components src/components -maxdepth 3 -type d 2>/dev/null
```

### 3. Read just enough
Per module/lib: its barrel `index.ts` (public API), `routes.ts` (registered/lazy routes), `<module>.module.ts` (declarations/providers). For shared utils: filenames + first ~30 lines (imports + signature). **Never** read full component bodies — listings + signatures suffice.

### 4. Build the report (to chat, not a file unless asked)
Group by category; reference ACTUAL files found (never generic advice):

```markdown
## Code Map — <repo>/<stack> — <timestamp>
### Module / lib inventory   — table: Module | Path | Purpose | Entities
### Shared UI / utilities    — components / directives / pipes / validators (named)
### Base classes / services  — e.g. `BaseService<T>` — `src/shared/base/base.service.ts` (CRUD + permission hooks)
### Routes / controllers     — path → controller (+ permission guard)
### Permission codes in use  — e.g. `CATALOG_C_PRODUCT_{LIST,DETAIL,CREATE,UPDATE,DELETE}` (N total — source file)
### Reusable for the upcoming task   — ✅ reuse X (path) / ⚠️ no module for Y → create per convention  (only if caller passed task context)
### Path conventions detected        — lib at `src/libs/<lib>/`, features at `.../features/<entity>/`, etc.
### Anti-conventions to avoid         — ❌ derived from evidence (e.g. don't redefine `BaseEntity` — exists at <path>)
```

### 5. Hand off
Return control — the caller (`write-code` / a planning skill) slots generation into the map. If the user asked directly, just present the report and stop.

## Per-stack notes
- **Angular** — detect roots from `angular.json` `projects` first; don't assume `src/libs`. Publishable libs (e.g. `@sdcorejs/angular`) use component-per-folder entry points under `projects/<lib>/{components,forms}`. Core UI is co-published under TWO equal names — `@sdcorejs/angular` (new) and `@sd-angular/core` (legacy alias, same version); detect EITHER. For Core UI imports in use (either name), cross-reference the on-demand inventory: `node _refs/angular/core-docs-fetch.mjs --list` (docs not committed; the fetcher version-matches either package name).
- **NestJS** — masterdata baseline puts modules under `core-be/modules/`, base/guards/decorators under `core-be/{base,guards,decorators}/`, shared models under `shared/<domain>/`; if `src/modules` is empty, look there before reporting "no modules". Stack typically uses CUSTOM validators (flag if `class-validator` also present — one is dead code). `@HasPermission` does nothing without `AuthGuard` registered — verify both. Read the actual `BaseEntity`/`BaseRepository` (varies across `be-admin`/`be-masterdata`).
- **NextJS** — App Router (`app/`) vs Pages Router (`pages/`): never mix recommendations. Note which dirs use `'use client'`.

## Rules

### MUST DO
- READ-ONLY — glob first, read second; open only barrels / `routes.ts` / `*.module.ts`, not implementation bodies
- Group the report by category; surface "reusable for the upcoming task" only if the caller passed task context
- Flag anti-conventions derived from observed evidence, not generic best practices

### MUST NOT
- Edit or create files (no permanent cache by default; only if explicitly asked, with a staleness warning)
- Invent paths the glob didn't find, or recommend reuse without verifying the thing exists at the claimed path
- Read full component bodies / large files; run on a 10k-file repo without scoping (ask for a subdir)

## Anti-patterns
- Reading every `.ts` in the repo (slow + noisy — defeats the purpose)
- A generic recommendation that doesn't reference the actual files found
- Trusting a cached map across sessions when the repo changed (check `git log` for freshness)
- Listing 50+ modules ungrouped; naming "there's a base class" without the file
- Recommending a shared component that exists in the library but isn't imported anywhere (unused / deprecated)

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
