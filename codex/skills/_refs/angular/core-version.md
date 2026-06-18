# Core UI Package (Single Source of Truth)

Use this file as the only place to update the Core UI package name and version for angular skills.

- packageName: `@sdcorejs/angular`  (new default — what `init-portal` installs)
- packageNameLegacy: `@sd-angular/core`  (co-published alias — same code, same version line; ACTIVE, not deprecated)
- currentVersion: `20.0.7`
- lastUpdated: `2026-06-16`
- policy: npm registry version only (do not use local tgz `file:sd-angular-core-*.tgz`)
- Core-UI detection (BOTH names count): a project is an SDCoreJS Core UI portal if `package.json` depends on EITHER `@sdcorejs/angular` OR `@sd-angular/core`. The two are published from the same source at the same version, and the docs site serves both — so ALWAYS fetch docs version-matched (the fetcher already detects either name), and NEVER skip the doc-fetch just because a project uses the legacy name. Generate imports with whichever prefix the project actually installed.

## Two co-published names — `@sdcorejs/angular` (new) + `@sd-angular/core` (legacy alias)

The Core UI library is published under TWO npm names **at the same time, at the same version**: the ecosystem-aligned **`@sdcorejs/angular`** (new default) and **`@sd-angular/core`** (legacy alias — still actively co-deployed, NOT deprecated, NOT a one-way migration). They share an identical API surface (same components, entry points, selectors) — only the npm name differs. A consumer may legitimately be on either name today and stay there.

Because both names are equal and co-versioned, the angular track treats EITHER as a valid Core UI marker:

- **New projects (default):** init with **`@sdcorejs/angular@20.0.7`** (paired with the Angular 20.3 baseline template). This is what `<CORE_UI_PACKAGE_NAME>` / `<CORE_VERSION>` resolve to.
- **Legacy / existing projects:** keep importing from **`@sd-angular/core`**. Do NOT force-migrate an existing project's imports — the package name is a project-level decision. Detect the installed name and import from whatever the project uses.
- **Docs work for BOTH:** the published docs site (and the on-demand fetcher) serves the same docs regardless of which name the consumer installed. `node _refs/angular/core-docs-fetch.mjs` auto-detects the version from EITHER `@sdcorejs/angular` or `@sd-angular/core`, so a `@sd-angular/core` consumer gets the same version-matched docs — **never skip the fetch for a legacy project.**
- **Version map:** published on npm as [`@sdcorejs/angular`](https://www.npmjs.com/package/@sdcorejs/angular) (and `@sd-angular/core`) — `19.0.x` / `20.0.x` / `21.0.x` are equivalent builds of the same Core UI code, one line per Angular major (19 / 20 / 21). The agent's init baseline is Angular 20.3 → pin `20.0.7`. Bump to `21.0.7` only when the starter template moves to Angular 21.

> The fetched Core UI docs (via `node _refs/angular/core-docs-fetch.mjs --list` / `--print sd-<name>`; not committed) document the surface using the **new** package name (`@sdcorejs/angular/...`). Entry-point sub-paths are identical across both names — for a project on `@sd-angular/core`, generate imports with the `@sd-angular/core/...` prefix (swap only the leading package name).

## Placeholders used in skill templates

| Placeholder | Resolves to (current) | Replaces when bumped |
|---|---|---|
| `<CORE_UI_PACKAGE_NAME>` | `@sdcorejs/angular` | `packageName` field above |
| `<CORE_VERSION>` | `20.0.7` | `currentVersion` field above |

## Where these placeholders are referenced

Single source of truth. Every consumer uses placeholders, substituted at generation time:

| File | How it references the package | Update on bump? |
|---|---|---|
| `_refs/angular/core-version.md` | THIS file — `packageName` + `currentVersion` fields | ✅ Yes — the single edit |
| `_refs/angular/write-code/init-portal.md` | Uses `<CORE_UI_PACKAGE_NAME>` + `<CORE_VERSION>` in `package.json` template, tree diagram, checklist, verification, commit example. Agent reads this file and substitutes at generation time. | ❌ No edit needed — placeholders resolve dynamically |
| `_refs/angular/core-docs-fetch.mjs` | Per-component Core UI docs are NOT committed — pulled on-demand from the published site, version-matched to the target's installed package, cached. Separate concern from the npm pin. | ❌ Nothing to update — docs are fetched fresh at generation time (see "Catalog docs are fetched on-demand" below) |

`shared/workflow/ship.md` dependency-update mode and `shared/workflow/explore.md` env-setup mode reference this file by PATH only — no literal version/name, no update.

## How the placeholders work

In `_refs/angular/write-code/init-portal.md`, every `<CORE_UI_PACKAGE_NAME>` and `<CORE_VERSION>` is a token the agent must replace BEFORE writing output:

1. Agent reads `packageName` + `currentVersion` from this file
2. Agent generates the target project's files, substituting the tokens with those values
3. The reference file `_refs/angular/write-code/init-portal.md` itself is NOT mutated — the placeholders stay for the next generation

> **Import statements** in TypeScript examples inside skill templates / catalog docs show the new default package (`from '@sdcorejs/angular/...'`). When generating into a LEGACY project that uses `@sd-angular/core`, the agent rewrites the prefix during generation to match the project's installed package. Treat literal imports inside examples as "new-project default for reading", not as a hard source of truth.

This is documented in the "Source of truth — Core UI package" section at the top of `_refs/angular/write-code/init-portal.md`.

## Catalog docs are fetched on-demand (not committed)

The per-component Core UI docs are **NOT** stored in this repo. The angular skills pull them at
generation time via `_refs/angular/core-docs-fetch.mjs`. The npm *pin* (`currentVersion` above —
which Angular major `init-portal` installs) is a **separate concern** from the docs version.

- **Fetch:** `node _refs/angular/core-docs-fetch.mjs --list` (inventory) / `node _refs/angular/core-docs-fetch.mjs <id>` (one component's full API) → raw fetch (NOT summarized) from `https://sdcorejs.github.io/sdcorejs-angular/docs/<version>/`.
- **Version match (with nearest-version fallback):** auto-detected from the target project's installed `@sdcorejs/angular` (or legacy `@sd-angular/core`) version. `--version X` is resolved the SAME way as the installed version. Resolution order: **exact published patch → newest published patch of the SAME major → nearest other major (by major distance, then newest patch) → `latest`**. The fetcher then tries each candidate's `index.json` in that order and uses the first that actually downloads — so a version whose docs can't be pulled falls through to the nearest one that can. Example: a literal npm pin like `20.0.1` (which the docs registry doesn't publish as a docs build) maps to the newest published `20.0.x`; an unpublished major like `18.x` maps to the nearest published major (`19.0.x`). (The API is byte-identical across majors 19/20/21, so an exact patch match is not required.)
- **Cache:** `~/.cache/sdcorejs/core-docs/<version>/` — pulled once, reused, and used as the offline fallback. Never committed.
- **Mojibake guard (rule 6):** the fetcher refuses (exit 3) any upstream doc that is double-encoded (UTF-8-as-CP1252). The fix is upstream (the doc generator / published site), not here.
- **Offline:** no network + no cache → the fetcher exits non-zero and the skill falls back to generic Angular Material + `alert('TODO')`, flagged.

> Rationale: keeps this repo (and the published plugin) lean, and the docs always track the latest published release with zero re-sync/commit churn. Trade-off: the angular track needs network on first use per version (acceptable — it runs inside an AI tool that is already online).

## Upgrade Procedure

1. Update `packageName` (if migrating) and/or `currentVersion` + `lastUpdated` in this file — this is the **npm install pin** for `init-portal`. (That's the only edit; the published docs are fetched on-demand, nothing to re-sync.)
2. Run starter verification: `npm install`, `npm run build-dev`, `npm start`, `npm run test -- --watch=false`.

## Drift check

Init skill must use placeholders, not a hardcoded package/version. This grep flags a regression:

```bash
grep -nE "@sd(corejs/angular|-angular/core)@[0-9]" _refs/angular/write-code/init-portal.md
# Should match 0 lines. Any match is a regression — replace with <CORE_UI_PACKAGE_NAME>@<CORE_VERSION>.
```

Wired into pre-commit via `lefthook.yml` + `.claude/check-core-version-placeholder.sh`.
