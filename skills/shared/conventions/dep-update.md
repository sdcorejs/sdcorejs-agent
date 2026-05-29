---
name: sdcorejs-dep-update
description: Use when the user asks to update / upgrade dependencies, says "cập nhật dependency", "update package", "bump version", "npm outdated", "audit fix", or after a security advisory. Runs a safe upgrade workflow — audit → classify (patch/minor/major) → branch → upgrade one logical group at a time → lockfile diff → tests → smoke run. Applies to angular-portal, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Bash, Read, Edit
---

# Dependency Update — Safe Upgrade Workflow

## Purpose
"Update everything to latest" is how lockfile sludge and Sunday-night production incidents happen. This skill enforces incremental, testable, reversible upgrades.

## When invoked
- "cập nhật dependency", "update package", "bump <pkg>", "npm outdated"
- Security advisory / `npm audit` flagging a Critical/High
- Renovate / Dependabot PR review
- Before a release, to refresh deps

Do NOT invoke for:
- Adding a brand-new dependency (different workflow — review the lib, fit, license first)
- Major framework upgrades (Angular 18→19, NestJS 10→11) — those need a dedicated migration spec via `03-write-spec`

## Workflow

### 1. Determine state (parallel)
```bash
# Outdated report
<pm> outdated                                # npm | yarn | pnpm
# Vulnerability scan
<pm> audit --omit=dev                        # production deps only
# Lockfile present?
ls package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null
# Current branch
git rev-parse --abbrev-ref HEAD
# Pinned version constraints?
grep -E '"\^|"~|"=|"<|">' package.json | head -20
```
Identify package manager from lockfile — never mix.

### 2. Safety gates
- **On `main` / `master`** → stop, ask user to branch (`git checkout -b chore/update-deps-YYYY-MM-DD`)
- **Uncommitted changes** → stop, ask user to commit or stash
- **No tests in repo** → warn, ask user how they intend to verify; do not proceed silently

### 3. Classify upgrades

For each outdated package, decide its risk tier:

| Tier | Trigger | Action |
|---|---|---|
| **Patch** (1.2.3 → 1.2.4) | semver patch only, no breaking | Batch with other patches, single PR |
| **Minor** (1.2.x → 1.3.0) | new features, no breaking promised | Group by ecosystem; read each changelog |
| **Major** (1.x → 2.0) | breaking | One package per PR; read migration guide |
| **Pinned** (e.g. `@sd-angular/core`) | locked by reference doc | DO NOT upgrade without re-pinning ref; see `_refs/angular-portal/core-version.md` |
| **Critical security** | npm audit High/Critical | Out-of-band fix, highest priority |

For `@sd-angular/core` specifically — read `_refs/angular-portal/core-version.md`. If the target project pins to a version, do NOT upgrade unilaterally; ask the user and update the reference doc together.

### 4. Upgrade — one logical group at a time

Patches batch:
```bash
<pm> update                                  # patches + caret-allowed minor
```

Minor / Major (per package):
```bash
<pm> install <pkg>@<target-version> --save-exact   # or with appropriate range
```

After each upgrade group:
- `git diff package.json <lockfile>` — sanity-check what changed
- Look for indirect updates that look surprising (a peer dep also bumped a major)

### 5. Lockfile diff sanity check
```bash
git diff --stat package.json $(ls package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null)
```
Red flags:
- A patch upgrade touches 100+ lockfile lines → a transitive dep also major-bumped
- New deps added that the user didn't request → investigate the source
- A dep was removed unexpectedly → check if it was a peer; pin if needed

### 6. Build + test
```bash
<pm> install                                 # rebuild from updated lockfile (sanity)
<pm> run build                               # if applicable
<pm> run test -- --watch=false               # full suite, not just changed
<pm> run lint                                # catches new lint rules from upgraded ESLint configs
```
If ANY of these fail:
- Patch failure → likely a real regression, investigate via `sdcorejs-debug`
- Minor failure → check the dep's changelog for behavior changes
- Major failure → expected; follow the migration guide

### 7. Smoke run (dev server)
Don't skip this. Tests can pass on a stack that won't start.
- Angular: `<pm> start` → load home route → no console errors
- NestJS: `<pm> run start:dev` → hit a real endpoint
- NextJS: `<pm> run dev` → load home + a server-rendered route

### 8. Commit per logical group
Use `sdcorejs-commit`. Examples:

```
chore(deps): bump patch versions across project

- @types/node 20.10.0 → 20.10.3
- prettier 3.1.0 → 3.1.1
- typescript 5.3.2 → 5.3.3

No behavior change expected; lockfile churn is minimal.
```

```
chore(deps): bump @nestjs/core 10.2.x → 10.3.0 (minor)

Adds Standalone Module Decorators. No call sites use the new
feature yet; existing tests pass.

Refs: nestjs/nest#12345 (release notes)
```

```
chore(deps)!: bump typeorm 0.3.17 → 0.4.0 (major)

BREAKING CHANGE: connection options renamed. Migrated:
- src/config/typeorm.config.ts (entities/migrations paths)
- src/main.ts (DataSource init signature)

Migration guide followed: typeorm.io/upgrading-to-v0.4

Refs: #ENG-1500
```

### 9. Audit-fix path (security-only)
For `npm audit` Critical/High that has a patch available:
```bash
<pm> audit fix                               # only safe upgrades
```
Re-run tests + smoke after.

Do NOT use:
- `--force` — applies upgrades that violate semver constraints, often breaks builds
- `--legacy-peer-deps` to mask the underlying conflict — fix the peer instead

If the only fix requires a major upgrade → that's a separate workflow (step 3 Major track), not a quick `audit fix`.

## Per-stack notes

### Angular Portal
- `@angular/*` packages MUST be upgraded together (same major)
- `@sd-angular/core` is pinned via `_refs/angular-portal/core-version.md` — coordinate
- `@angular/cli` major upgrades come with `ng update` schematics — prefer that to manual edits
- TypeScript version is bounded by the Angular version's `peerDependencies`

### NestJS
- `@nestjs/*` packages must move together for majors
- TypeORM majors often require migration testing in a copy of the dev DB
- `class-validator` upgrades sometimes change decorator semantics — re-run integration tests, not just unit
- This stack uses custom validators in many projects; check before assuming standard `class-validator` behavior

### NextJS
- `next` major (e.g. 14 → 15) often deprecates Pages Router behaviors used in App Router edge cases
- React majors paired with Next — they move together
- `eslint-config-next` upgrade can surface dormant lint errors as build failures

## Rules

### MUST DO
- Branch first; never upgrade on `main`
- Match package manager to the lockfile
- One logical group per commit (patches OK to batch, majors never)
- Run tests + lint + smoke between groups
- Read the changelog for any minor/major upgrade — at least the breaking-change section
- Update `_refs/angular-portal/core-version.md` if `@sd-angular/core` is bumped
- Commit lockfile changes — never `.gitignore` them

### MUST NOT
- `--force`, `--legacy-peer-deps`, `--ignore-scripts` to mask a real conflict
- Upgrade everything at once and figure out later what broke
- Skip the smoke run because tests passed
- Drop a pinned version without checking why it was pinned
- Auto-merge a Dependabot PR without reading the diff
- Run `audit fix --force` as a reflex

## Anti-patterns
- "Bump all caret deps" YOLO commit covering 47 packages
- Adding `overrides` / `resolutions` to mask a transitive conflict without a comment explaining WHY
- Upgrading the dep that has the CVE but ignoring its `peerDependency` warnings
- Committing `package.json` without the lockfile (other devs get different versions)
- Removing `engines.node` because "it's annoying" — that's CI guardrail
- Pinning to `latest` in `package.json` — non-reproducible builds
