# Validation Report

> ⚠️ **STALE SNAPSHOT** — This report was generated 2026-05-16 against the pre-cross-track-refactor skill layout. Several rounds of consolidation have happened since:
> - 2026-05-20 (`071aa18`): per-track design skills moved into `skills/shared/sdlc/*`
> - 2026-05-22: angular-portal UI skills consolidated 13 → 8 (`22-screen-create`, `23-screen-update`, `30-reactive-form` merged into `21-screen-detail`; `31-workflow-actions` → `31-actions`; `51-write-comments` absorbed into `orchestration/comment-code`; `52-faq` dropped)
>
> Current structure: see `CLAUDE.md` for the live layout. The skill-name mapping below is preserved as historical record only.

**Date**: 2026-05-16
**Repo HEAD**: `0c570f6` (pre-Phase-4 commit)
**Phase**: 4 of 4 (final)

## Summary

| Check | Result | Notes |
| --- | --- | --- |
| 1. Frontmatter valid | PASS | 46 files checked (23 source + 23 mirror); all have `name`, `description`, valid `---` fences, kebab-case names, descriptions ≥10 chars |
| 2. Names unique | PASS | 23 distinct names across source; mirror names are a 1:1 superset (23/23 match a source) |
| 3. Cross-references resolve | FAIL | Pre-existing stale READMEs (`skills/README.md`, `skills/angular-portal/README.md`) reference legacy filenames that no longer exist; no broken links in skill bodies, entry files, or `_refs/` |
| 4. `.claude/skills/` mirror in sync | PASS | 23 / 23 files in sync (byte-identical via `diff -q`) |
| 5. Path conventions migrated | PASS | Zero stale uses of `.docs/sdcorejs` or `.memories/sdcorejs` outside explicit "legacy" migration notes inside auto-docs/write-spec skills; no occurrences of singular `auto-doc.md` |
| 6. Entry-point workflow numbering | PASS | `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.github/chatmodes/sdcorejs.chatmode.md` all reference the new `01-brainstorm`..`07-write-code` chain; zero matches for the old `01-clarify-requirements`/`02-plan`/`03-write-code` numbering |
| 7. Reference catalog (69 docs) | PASS | `skills/angular-portal/_refs/sdcorejs-angular` contains exactly 69 `.md` files |
| 8. Skill counts | PASS | 21 source skills under `skills/angular-portal/` (excluding README) + 2 shared under `skills/_shared/` + 23 mirror under `.claude/skills/` |

**Overall: 7 / 8 PASS, 1 FAIL (pre-existing stale READMEs not addressed by Phase A/B refactor).**

## Inventory

Counts captured at HEAD `0c570f6` via `find` / `glob`:

| Bucket | Count | Path |
| --- | --- | --- |
| Source angular-portal skills | 21 | `skills/angular-portal/[0-9]*.md` |
| Source shared skills | 2 | `skills/_shared/*.md` (`auto-docs.md`, `memories.md`) |
| Claude Code mirror skills | 23 | `.claude/skills/*/SKILL.md` |
| Core UI reference docs | 69 | `skills/angular-portal/_refs/sdcorejs-angular/**/*.md` |
| Entry-point files | 4 | `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.github/chatmodes/sdcorejs.chatmode.md` |

### Source skill list (21 + 2)

```
skills/angular-portal/00-onboarding.md            -> angular-portal-onboarding
skills/angular-portal/01-brainstorm.md            -> angular-portal-brainstorm
skills/angular-portal/02-clarify-requirements.md  -> angular-portal-clarify-requirements
skills/angular-portal/03-write-spec.md            -> angular-portal-write-spec
skills/angular-portal/04-review-spec.md           -> angular-portal-review-spec
skills/angular-portal/05-plan.md                  -> angular-portal-plan
skills/angular-portal/06-review-plan.md           -> angular-portal-review-plan
skills/angular-portal/07-write-code.md            -> angular-portal-write-code
skills/angular-portal/10-init-portal.md           -> angular-portal-init-portal
skills/angular-portal/11-init-module.md           -> angular-portal-init-module
skills/angular-portal/12-init-entity.md           -> angular-portal-init-entity
skills/angular-portal/20-screen-list.md           -> angular-portal-screen-list
skills/angular-portal/21-screen-detail.md         -> angular-portal-screen-detail
skills/angular-portal/22-screen-create.md         -> angular-portal-screen-create
skills/angular-portal/23-screen-update.md         -> angular-portal-screen-update
skills/angular-portal/30-reactive-form.md         -> angular-portal-reactive-form
skills/angular-portal/31-workflow-actions.md      -> angular-portal-workflow-actions
skills/angular-portal/40-e2e-test.md              -> angular-portal-e2e-test
skills/angular-portal/50-review-code.md           -> angular-portal-review-code
skills/angular-portal/51-write-comments.md        -> angular-portal-write-comments
skills/angular-portal/52-faq.md                   -> angular-portal-faq
skills/_shared/auto-docs.md                       -> sdcorejs-auto-docs
skills/_shared/memories.md                        -> sdcorejs-memories
```

## Issues found

### Check 3 — Stale cross-references in pre-Phase-A READMEs

`skills/README.md` and `skills/angular-portal/README.md` were never updated to reflect the Phase A/B rename and still link to legacy filenames that no longer exist:

- `skills/README.md`
  - line 13: `angular-portal/angular-request-intake-skill.md`
  - line 14: `angular-portal/angular-entity-crud-skill.md`
  - line 15: `angular-portal/angular-module-configuration-skill.md`
  - line 16: `angular-portal/angular-reactive-form-skill.md`
  - line 20: `angular-portal/INDEX.md`
  - lines 124, 125: `../core/README.md`, `../agents/README.md` (sibling folders that do not exist in this repo)
- `skills/angular-portal/README.md`
  - lines 13, 32, 63, 94, 127, 415, 416, 417, 418: links to `angular-request-intake-skill.md`, `angular-portal-project-init-skill.md`, `angular-entity-crud-skill.md`, `angular-module-configuration-skill.md`, `angular-workflow-actions-skill.md`, `angular-reactive-form-skill.md`
  - lines 209, 210: `core-version.md`, `sdcorejs-angular-catalog.md` (these now live in `_refs/`, so should be `_refs/core-version.md` and `_refs/sdcorejs-angular-catalog.md`)
  - line 431: `../ANGULAR-SKILLS-INDEX.md` (does not exist)
  - lines 433, 434: `../../core/README.md`, `../../README.md` (former is missing)

**Severity**: low — these READMEs are not part of the skill dispatch flow and not referenced by `CLAUDE.md` / `AGENTS.md`. The runtime agent uses the numbered skills directly. However, they should be replaced or deleted in a follow-up to avoid confusing humans browsing the repo.

**Recommended follow-up**: regenerate both READMEs to match the new 00-52 + `_shared/` layout, or delete them entirely (the per-skill frontmatter `description` already self-documents).

### Check 5 — Intentional legacy-path mentions

Six occurrences of `.docs/sdcorejs` appear in:

- `skills/_shared/auto-docs.md` (lines 110, 128)
- `.claude/skills/sdcorejs-auto-docs/SKILL.md` (lines 110, 128) — mirror copy
- `skills/angular-portal/03-write-spec.md` (line 123)
- `.claude/skills/angular-portal-write-spec/SKILL.md` (line 123) — mirror copy

All are inside warnings of the form `Write to docs/sdcorejs/ or .docs/sdcorejs/ (legacy paths) — canonical is .sdcorejs/docs/`. They are intentional migration guidance, **not** stale path uses. Treated as PASS.

## Re-validate after changes

```bash
# After editing skills or entry points, re-run by reviewing VALIDATION.md and re-grepping.
# Update this file by hand or re-run a future validation script.

# Quick checks:
#   - Mirror sync:        for f in .claude/skills/*/SKILL.md; do diff -q "$f" skills/.../<src>; done
#   - Frontmatter:        head -10 skills/**/*.md | grep -E '^name:|^description:'
#   - Path conventions:   git grep -nE '\.docs/sdcorejs|\.memories/sdcorejs'
#   - Old numbering:      git grep -nE '01-clarify-requirements|02-plan|03-write-code' CLAUDE.md AGENTS.md .github/
#   - Catalog count:      find skills/angular-portal/_refs/sdcorejs-angular -name '*.md' | wc -l   # expect 69
```
