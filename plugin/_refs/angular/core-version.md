# Core UI Package (Single Source of Truth)

Use this file as the only place to update the Core UI package name and version for angular skills.

- packageName: `@sdcorejs/angular`
- currentVersion: `20.0.1`
- lastUpdated: `2026-06-01`
- policy: npm registry version only (do not use local tgz `file:sd-angular-core-*.tgz`)

## Package migration — `@sd-angular/core` → `@sdcorejs/angular` (DONE)

The Core UI library was republished under the ecosystem-aligned name **`@sdcorejs/angular`**. The two packages share identical API surface (same components, entry points, selectors) — only the npm name + the version line differ.

- **New projects (default):** init with **`@sdcorejs/angular@20.0.1`** (paired with the Angular 20.3 baseline template). This is what `<CORE_UI_PACKAGE_NAME>` / `<CORE_VERSION>` now resolve to.
- **Legacy projects:** keep importing from **`@sd-angular/core`**. Do NOT force-migrate an existing project's imports — the package alias is a project-level decision. When working in a legacy repo, detect its installed Core UI package and import from whatever it uses.
- **Version map:** published on npm as [`@sdcorejs/angular`](https://www.npmjs.com/package/@sdcorejs/angular) — `19.0.1` / `20.0.1` / `21.0.1` are equivalent builds of the same Core UI code, one per Angular major (19 / 20 / 21). The agent's init baseline is Angular 20.3 → pin `20.0.1`. Bump to `21.0.1` only when the starter template moves to Angular 21.

> The on-demand Core UI docs (fetched via `node _refs/angular/core-docs-fetch.mjs --list` / `--print sd-<name>`; not committed) document the surface using the **new** package name (`@sdcorejs/angular/...`). For a legacy project, swap the prefix back to `@sd-angular/core/...` — entry-point sub-paths are identical.

## Placeholders used in skill templates

| Placeholder | Resolves to (current) | Replaces when bumped |
|---|---|---|
| `<CORE_UI_PACKAGE_NAME>` | `@sdcorejs/angular` | `packageName` field above |
| `<CORE_VERSION>` | `20.0.1` | `currentVersion` field above |

## Where these placeholders are referenced

Single source of truth. Every consumer uses placeholders, substituted at generation time:

| File | How it references the package | Update on bump? |
|---|---|---|
| `_refs/angular/core-version.md` | THIS file — `packageName` + `currentVersion` fields | ✅ Yes — the single edit |
| `tracks/angular/10-init-portal.md` | Uses `<CORE_UI_PACKAGE_NAME>` + `<CORE_VERSION>` in `package.json` template, tree diagram, checklist, verification, commit example. Agent reads this file and substitutes at generation time. | ❌ No edit needed — placeholders resolve dynamically |
| `_refs/angular/core-docs-fetch.mjs` | Per-component Core UI docs are NOT committed — pulled on-demand from the published site, version-matched to the target's installed package, cached. Separate concern from the npm pin. | ❌ Nothing to update — docs are fetched fresh at generation time (see "Catalog docs are fetched on-demand" below) |

`shared/workflow/dep-update.md`, `shared/workflow/env-setup.md` reference this file by PATH only — no literal version/name, no update.

## How the placeholders work

In `10-init-portal.md`, every `<CORE_UI_PACKAGE_NAME>` and `<CORE_VERSION>` is a token the agent must replace BEFORE writing output:

1. Agent reads `packageName` + `currentVersion` from this file
2. Agent generates the target project's files, substituting the tokens with those values
3. The skill file `10-init-portal.md` itself is NOT mutated — the placeholders stay for the next generation

> **Import statements** in TypeScript examples inside skill templates / catalog docs show the new default package (`from '@sdcorejs/angular/...'`). When generating into a LEGACY project that uses `@sd-angular/core`, the agent rewrites the prefix during generation to match the project's installed package. Treat literal imports inside examples as "new-project default for reading", not as a hard source of truth.

This is documented in the "Source of truth — Core UI package" section at the top of `10-init-portal.md`.

## Catalog docs are fetched on-demand (not committed)

The per-component Core UI docs are **NOT** stored in this repo. The angular skills pull them at
generation time via `_refs/angular/core-docs-fetch.mjs`. The npm *pin* (`currentVersion` above —
which Angular major `init-portal` installs) is a **separate concern** from the docs version.

- **Fetch:** `node _refs/angular/core-docs-fetch.mjs --list` (inventory) / `node _refs/angular/core-docs-fetch.mjs <id>` (one component's full API) → raw fetch (NOT summarized) from `https://sdcorejs.github.io/sdcorejs-angular/docs/<version>/`.
- **Version match:** auto-detected from the target project's installed `@sdcorejs/angular` (or legacy `@sd-angular/core`) version. `--version X` is resolved the SAME way as the installed version — exact published patch → newest published patch of that major → `latest`. So a literal npm pin like `20.0.1` (which the docs registry may not publish as a docs build) maps to the newest published `20.x` docs instead of 404-ing. (The API is byte-identical across majors 19/20/21, so an exact patch match is not required.)
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
grep -nE "@sd(corejs/angular|-angular/core)@[0-9]" skills/tracks/angular/10-init-portal.md
# Should match 0 lines. Any match is a regression — replace with <CORE_UI_PACKAGE_NAME>@<CORE_VERSION>.
```

Wired into pre-commit via `lefthook.yml` + `.claude/check-core-version-placeholder.sh`.
