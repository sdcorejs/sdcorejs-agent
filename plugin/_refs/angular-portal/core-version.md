# Core UI Package (Single Source of Truth)

Use this file as the only place to update the Core UI package name and version for angular-portal skills.

- packageName: `@sdcorejs/angular`
- currentVersion: `20.0.1`
- lastUpdated: `2026-06-01`
- policy: npm registry version only (do not use local tgz `file:sd-angular-core-*.tgz`)

## Package migration — `@sd-angular/core` → `@sdcorejs/angular` (DONE)

The Core UI library was republished under the ecosystem-aligned name **`@sdcorejs/angular`**. The two packages share identical API surface (same components, entry points, selectors) — only the npm name + the version line differ.

- **New projects (default):** init with **`@sdcorejs/angular@20.0.1`** (paired with the Angular 20.3 baseline template). This is what `<CORE_UI_PACKAGE_NAME>` / `<CORE_VERSION>` now resolve to.
- **Legacy projects:** keep importing from **`@sd-angular/core`**. Do NOT force-migrate an existing project's imports — the package alias is a project-level decision. When working in a legacy repo, detect its installed Core UI package and import from whatever it uses.
- **Version map:** published on npm as [`@sdcorejs/angular`](https://www.npmjs.com/package/@sdcorejs/angular) — `19.0.1` / `20.0.1` / `21.0.1` are equivalent builds of the same Core UI code, one per Angular major (19 / 20 / 21). The agent's init baseline is Angular 20.3 → pin `20.0.1`. Bump to `21.0.1` only when the starter template moves to Angular 21.

> The catalog under `_refs/angular-portal/sdcorejs-angular/**` documents the surface using the **new** package name (`@sdcorejs/angular/...`). For a legacy project, swap the prefix back to `@sd-angular/core/...` — entry-point sub-paths are identical.

## Placeholders used in skill templates

| Placeholder | Resolves to (current) | Replaces when bumped |
|---|---|---|
| `<CORE_UI_PACKAGE_NAME>` | `@sdcorejs/angular` | `packageName` field above |
| `<CORE_VERSION>` | `20.0.1` | `currentVersion` field above |

## Where these placeholders are referenced

Single source of truth. Every consumer uses placeholders, substituted at generation time:

| File | How it references the package | Update on bump? |
|---|---|---|
| `_refs/angular-portal/core-version.md` | THIS file — `packageName` + `currentVersion` fields | ✅ Yes — the single edit |
| `tracks/angular-portal/10-init-portal.md` | Uses `<CORE_UI_PACKAGE_NAME>` + `<CORE_VERSION>` in `package.json` template, tree diagram, checklist, verification, commit example. Agent reads this file and substitutes at generation time. | ❌ No edit needed — placeholders resolve dynamically |
| `_refs/angular-portal/sdcorejs-angular/**/*.md` | "Library version" metadata = the version the catalog was GENERATED FROM (snapshot, currently `@sdcorejs/angular@20.0.1`). Separate concern from the pin. | ❌ No, unless catalog is regenerated from a different source version |

`shared/conventions/dep-update.md`, `shared/workflow/env-setup.md`, `tracks/angular-portal/00-onboarding.md` reference this file by PATH only — no literal version/name, no update.

## How the placeholders work

In `10-init-portal.md`, every `<CORE_UI_PACKAGE_NAME>` and `<CORE_VERSION>` is a token the agent must replace BEFORE writing output:

1. Agent reads `packageName` + `currentVersion` from this file
2. Agent generates the target project's files, substituting the tokens with those values
3. The skill file `10-init-portal.md` itself is NOT mutated — the placeholders stay for the next generation

> **Import statements** in TypeScript examples inside skill templates / catalog docs show the new default package (`from '@sdcorejs/angular/...'`). When generating into a LEGACY project that uses `@sd-angular/core`, the agent rewrites the prefix during generation to match the project's installed package. Treat literal imports inside examples as "new-project default for reading", not as a hard source of truth.

This is documented in the "Source of truth — Core UI package" section at the top of `10-init-portal.md`.

## Upgrade Procedure

1. Update `packageName` (if migrating) and/or `currentVersion` + `lastUpdated` in this file.
2. (Done — no other edits needed for the pin.)
3. Decide whether to regenerate `_refs/angular-portal/sdcorejs-angular/**` from the new source — only needed if API surface changed between versions. If yes, also bump the `**Library version**: @sdcorejs/angular@X.Y.Z` line at the top of each catalog file.
   - **Sync mapping:** upstream `vn-angular` still publishes its per-component docs under the name `@sd-angular/core`. When re-syncing the catalog from upstream, MAP `@sd-angular/core` → `@sdcorejs/angular` and the source version → the pinned `currentVersion` while copying (the catalog is package-renamed by design).
4. Run starter verification: `npm install`, `npm run build-dev`, `npm start`, `npm run test -- --watch=false`.

## Drift check

Init skill must use placeholders, not a hardcoded package/version. This grep flags a regression:

```bash
grep -nE "@sd(corejs/angular|-angular/core)@[0-9]" skills/tracks/angular-portal/10-init-portal.md
# Should match 0 lines. Any match is a regression — replace with <CORE_UI_PACKAGE_NAME>@<CORE_VERSION>.
```

Wired into pre-commit via `lefthook.yml` + `.claude/check-core-version-placeholder.sh`.
