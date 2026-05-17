# Core UI Package (Single Source of Truth)

Use this file as the only place to update the Core UI package name and version for angular-portal skills.

- packageName: `@sd-angular/core`
- currentVersion: `19.0.0-beta.93`
- lastUpdated: `2026-05-17`
- policy: npm registry version only (do not use local tgz `file:sd-angular-core-*.tgz`)

> The package name is tracked here because the org plans to migrate from `@sd-angular/core` to `@sdcorejs/angular`. When the move happens, this is the only file that changes — every skill template references the placeholders `<CORE_UI_PACKAGE_NAME>` / `<CORE_VERSION>`.

## Placeholders used in skill templates

| Placeholder | Resolves to (current) | Replaces when bumped |
|---|---|---|
| `<CORE_UI_PACKAGE_NAME>` | `@sd-angular/core` | `packageName` field above |
| `<CORE_VERSION>` | `19.0.0-beta.93` | `currentVersion` field above |

## Where these placeholders are referenced

Single source of truth. Every consumer uses placeholders, substituted at generation time:

| File | How it references the package | Update on bump? |
|---|---|---|
| `tracks/angular-portal/_refs/core-version.md` | THIS file — `packageName` + `currentVersion` fields | ✅ Yes — the single edit |
| `tracks/angular-portal/10-init-portal.md` | Uses `<CORE_UI_PACKAGE_NAME>` + `<CORE_VERSION>` in `package.json` template, tree diagram, checklist, verification, commit example. Agent reads this file and substitutes at generation time. | ❌ No edit needed — placeholders resolve dynamically |
| `tracks/angular-portal/_refs/sdcorejs-angular/**/*.md` | "Library version" metadata = the version the catalog was GENERATED FROM (snapshot, currently `19.0.0-beta.86`). Separate concern from the pin. | ❌ No, unless catalog is regenerated from a different source version |

`shared/conventions/dep-update.md`, `shared/workflow/env-setup.md`, `tracks/angular-portal/00-onboarding.md` reference this file by PATH only — no literal version/name, no update.

## How the placeholders work

In `10-init-portal.md`, every `<CORE_UI_PACKAGE_NAME>` and `<CORE_VERSION>` is a token the agent must replace BEFORE writing output:

1. Agent reads `packageName` + `currentVersion` from this file
2. Agent generates the target project's files, substituting the tokens with those values
3. The skill file `10-init-portal.md` itself is NOT mutated — the placeholders stay for the next generation

> **Import statements** in TypeScript examples inside skill templates may still show the literal current package name (`from '@sd-angular/core/...'`) for readability. When the package name changes, the agent rewrites imports during generation using the new `packageName`. Treat literal imports inside skill examples as "current snapshot for reading", not as the source of truth.

This is documented in the "Source of truth — Core UI package" section at the top of `10-init-portal.md`.

## Upgrade Procedure

1. Update `packageName` (if migrating) and/or `currentVersion` + `lastUpdated` in this file.
2. (Done — no other edits needed for the pin.)
3. Decide whether to regenerate `_refs/sdcorejs-angular/**` from the new source — only needed if API surface changed between versions. If yes, also bump the `Library version: @sd-angular/core@X.Y.Z-beta.N` line at the top of each catalog file.
4. Run starter verification: `npm install`, `npm run build-dev`, `npm start`, `npm run test -- --watch=false`.

## Drift check

If someone reintroduces a hardcoded version in `10-init-portal.md`, the following grep flags it:

```bash
grep -nE "19\.[0-9]+\.[0-9]+-beta\.[0-9]+" skills/tracks/angular-portal/10-init-portal.md
# Should match 0 lines. Any match is a regression — replace with <CORE_VERSION>.
```

Wired into pre-commit via `lefthook.yml` + `.claude/check-core-version-placeholder.sh`.
