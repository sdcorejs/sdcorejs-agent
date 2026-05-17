# Core Version (Single Source of Truth)

Use this file as the only place to update `@sd-angular/core` version for angular-portal skills.

- package: `@sd-angular/core`
- currentVersion: `19.0.0-beta.93`
- lastUpdated: `2026-05-17`
- policy: npm registry version only (do not use local tgz `file:sd-angular-core-*.tgz`)

## Where this version is referenced

This file is the **single source of truth**. Every other reference uses the placeholder `<CORE_VERSION>`, substituted at generation time:

| File | How it references the version | Update on bump? |
|---|---|---|
| `tracks/angular-portal/_refs/core-version.md` | THIS file — `currentVersion` field | ✅ Yes — the single edit |
| `tracks/angular-portal/10-init-portal.md` | Uses `<CORE_VERSION>` placeholder in 5 spots (package.json template, tree diagram, checklist, verification, commit example). Agent reads this file and substitutes at generation time. | ❌ No edit needed — placeholder resolves dynamically |
| `tracks/angular-portal/_refs/sdcorejs-angular/**/*.md` | "Library version" metadata = the version the catalog was GENERATED FROM (snapshot, currently `19.0.0-beta.86`). Separate concern from the pin. | ❌ No, unless catalog is regenerated from a different source version |

`shared/conventions/dep-update.md`, `shared/workflow/env-setup.md`, `tracks/angular-portal/00-onboarding.md` reference this file by PATH only — no version literal, no update.

## How the placeholder works

In `10-init-portal.md`, every `<CORE_VERSION>` is a token the agent must replace BEFORE writing output:

1. Agent reads `currentVersion` from this file
2. Agent generates the target project's files, substituting `<CORE_VERSION>` with that value
3. The skill file `10-init-portal.md` itself is NOT mutated — the placeholder stays for the next generation

This is documented in the "Source of truth — @sd-angular/core version" section at the top of `10-init-portal.md`.

## Upgrade Procedure

1. Update `currentVersion` and `lastUpdated` in this file.
2. (Done — no other edits needed for the pin.)
3. Decide whether to regenerate `_refs/sdcorejs-angular/**` from the new source — only needed if API surface changed between versions. If yes, also bump the `Library version: @sd-angular/core@X.Y.Z-beta.N` line at the top of each catalog file.
4. Run starter verification: `npm install`, `npm run build-dev`, `npm start`, `npm run test -- --watch=false`.

## Drift check

If someone reintroduces a hardcoded version in `10-init-portal.md`, the following grep will flag it:

```bash
grep -nE "19\.[0-9]+\.[0-9]+-beta\.[0-9]+" skills/tracks/angular-portal/10-init-portal.md
# Should match 0 lines. Any match is a regression — replace with <CORE_VERSION>.
```

Consider wiring this into pre-commit (lefthook) to enforce permanently.
