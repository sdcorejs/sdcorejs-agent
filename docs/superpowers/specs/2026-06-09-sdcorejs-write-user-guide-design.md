# Design — `sdcorejs-write-user-guide` skill

**Date:** 2026-06-09
**Status:** Approved (brainstorm) — pending written-spec review, then plan.
**Branch:** `feat/sdcorejs-write-user-guide` (off `main` @ `f9b3416`).
**Author:** brainstorming session (Opus 4.8), grounded on a scout of the existing doc skills (`auto-docs`, `auto-summary`, `code-map`, `ship`) + the write-code tail chains + the angular/nestjs write-code packs.

## TL;DR

A new dispatchable skill `sdcorejs-write-user-guide` that produces an **evergreen, end-user-facing feature reference** for generated SDCoreJS apps. Per-module Markdown guides at `.sdcorejs/user-guide/<module>.md`, aggregated into a root `sdcorejs-user-guide.md`, exportable to DOCX/PDF via `pandoc` (images as placeholders + a capture checklist). Auto-triggers two-tier: per-module incremental on any write-code edit (tail-chain step); aggregate rebuild on ship / large feature / manual. Also a legacy reverse-engineer mode (read a whole existing project → write guides). Content is structured (YAML frontmatter + fixed sections) so an AI can answer end-user questions from it, and includes a **Coverage vs requirements** section mapping the spec's acceptance criteria (and an optional external PRD) to ✅/⚠️/❌.

## Problem & motivation

Generated apps have no end-user documentation. The existing doc skills don't fill this: `auto-docs` = per-session deltas, `auto-summary` = a 1-page project brief, `code-map` = a read-only architecture scan. None is a stable, end-user-facing "what the software does + how to use each feature + does it meet the requirements" reference. This skill adds that, and makes it (a) machine-readable so an AI can answer user questions and (b) traceable to the PRD/acceptance criteria.

## Decisions (brainstorm)

| # | Decision | Choice |
|---|---|---|
| D1 | Export pipeline | **Markdown canonical + `pandoc` DOCX/PDF + image placeholders.** Agent emits the command + a template + `![…](images/…)` placeholders with a capture checklist; it does NOT run the target app or capture screenshots. |
| D2 | Per-module file location | **`.sdcorejs/user-guide/<module>.md`** (centralized, one canonical file per module; matches the `.sdcorejs/` convention). Aggregate at the project **root** `sdcorejs-user-guide.md`. |
| D3 | Trigger cadence | **Two-tier.** Small write-code edit → incremental update of the touched module's guide (tail-chain). Ship / large feature / manual → rebuild the aggregate + optional DOCX export. Legacy-scan = full regen. |
| D4 | PRD/requirements source | **Both.** Default = the feature spec's `## Acceptance criteria`; ALSO consume an external `.sdcorejs/prd/<feature>.md` when present → combined coverage report. |

## Non-overlap with existing skills

- `sdcorejs-auto-docs` — "what changed this session" (dated delta files). Untouched.
- `sdcorejs-auto-summary` — "what the project IS" (`.sdcorejs/summary.md`, 1 page). Read as pre-context.
- `sdcorejs-code-map` — architecture discovery (modules/routes/permissions/shared). **Reused** by the legacy mode's harvest.
- `sdcorejs-write-user-guide` (new) — "what the software DOES for end users + does it meet requirements" (evergreen, per-feature/module).

---

## §1 — Artifacts

- **Per-module:** `<target>/.sdcorejs/user-guide/<module>.md` — one canonical file per module; covers the FE screens + the BE permissions/actions of that module (a full-stack module spans `frontend/` + `backend/`, but the guide is single + user-facing).
- **Aggregate:** `<target>/sdcorejs-user-guide.md` (project root) — table of contents + each module guide (distilled) + a global coverage summary + the pandoc export command.
- **Export:** Markdown is the source of truth. `pandoc <root>/sdcorejs-user-guide.md -o sdcorejs-user-guide.docx --reference-doc=<template>` (DOCX preferred for inserted images; `-o ….pdf` for PDF). A `_refs/shared/user-guide-template.md` ships the per-module + aggregate templates and the pandoc invocation. Images: `![<screen label>](images/<module>-<screen>.png)` placeholders + a "## Ảnh minh hoạ — checklist chụp" listing each screen to capture (filled by a human, or an optional Playwright step in the target project — out of the agent's scope).

## §2 — Per-module guide structure (machine-readable)

YAML frontmatter (queryable by an AI):
```yaml
---
module: <module>
title: <Tên tính năng tiếng Việt>
tracks: [angular, nestjs]
generated_at: <ISO>
git_head: <sha>
routes: [{ path, screen, permission }]
permissions: [<module>_<entity>:<action>, ...]
entities: [{ name, fields: [...] }]
screens: [list, detail, create, update, <custom>]
spec_refs: [.sdcorejs/docs/<track>/<ts>-<topic>-spec.md]
prd_refs: [.sdcorejs/prd/<feature>.md]   # if present
coverage: { total, met, partial, missing }
---
```
Body sections (fixed order):
1. **Tổng quan** — plain-language description of what the module does for the user.
2. **Màn hình & tác vụ** — per screen: name · route path · what the user does · who can use it (permission) · key fields & actions. (the core end-user content)
3. **Bảng quyền** — table: permission code → action → role/who can.
4. **Tham chiếu dữ liệu** — entity fields + validation rules (completeness, for support/AI).
5. **Hành động đặc biệt** — workflows / state transitions / bulk / export (from the actions pack), if any.
6. **Coverage vs yêu cầu** — table: each acceptance criterion (from spec [+ external PRD]) → ✅ documented & implemented / ⚠️ partial / ❌ missing → where documented. Drives the "does it meet requirements" check.
7. **Ảnh minh hoạ** — image placeholders + the capture checklist.

**Harvest sources** (from the write-code packs): Angular routes (`<entity>.routes.ts` `data.permission`) + `*sdPermission` directives; NestJS `RouterModule` prefixes + `BaseController` inherited paths + `@HasPermission` + custom action routes; entity fields + Zod schemas; screen types (list / detail / 3-state create-update-detail) + layout; the spec's `## Acceptance criteria`.

## §3 — Modes (the four triggers)

1. **Per-module incremental** *(automatic, every write-code — small or large)* — update ONLY the touched module's `.sdcorejs/user-guide/<module>.md` (re-harvest that module + re-map coverage). Cheap; keeps guides current without rebuilding everything. Runs in the tail chain **right after `auto-docs`** (the doc-writing cluster: `auto-docs` → `write-user-guide` → `auto-task-tracker` → `memories`), so it sits after the `branch-ready` hygiene sweep alongside the other doc steps.
2. **Aggregate build** *(ship / large feature / manual)* — assemble `<root>/sdcorejs-user-guide.md` from all per-module guides + a global coverage summary; optionally run the pandoc DOCX export. 
3. **Legacy reverse-engineer** *(manual: "đọc toàn dự án viết user guide")* — invoke `sdcorejs-code-map` to harvest modules/routes/permissions/screens from an existing (possibly hand-written) project, then synthesize all per-module guides + the aggregate from the code. No spec required; the coverage section notes "reverse-engineered — no spec/PRD" (or compares to a PRD if one is dropped in).
4. **PRD compare** *(runs inside modes 1 & 2)* — default source = the feature spec's acceptance criteria; if `.sdcorejs/prd/<feature>.md` exists, also map each PRD requirement → ✅/⚠️/❌. Output is the §2.6 Coverage table + the aggregate's global coverage summary.

## §4 — Wiring (the edits)

- **New skill** `skills/orchestration/write-user-guide.md` (`name: sdcorejs-write-user-guide`, bilingual, allowed-tools Read/Write/Edit/Bash/Glob/Grep). Body documents the 4 modes + the harvest + the templates pointer.
- **New ref** `_refs/shared/user-guide-template.md` — the per-module + aggregate Markdown templates + the pandoc command + the image-capture-checklist pattern.
- **Tail-chain (mode 1):** insert a `sdcorejs-write-user-guide` step in `skills/tracks/{angular,nestjs,nextjs}/write-code.md` mandatory tail — **right after `auto-docs`** (doc-writing cluster: `auto-docs` → `write-user-guide` → `auto-task-tracker` → `memories`). Document it as the per-module incremental trigger.
- **Ship (mode 2):** add a step in `skills/orchestration/ship.md` after `branch-ready` — rebuild the aggregate + offer DOCX export.
- **CLAUDE.md:** add the skill to the orchestration table + a node in the workflow diagram (after verify-before-done) + a one-line mandatory-rule note (per-module guide on write-code; aggregate on ship).
- **Mirror:** every `skills/**` / `_refs/**` edit re-runs `bash .claude/sync-skills.sh` and stages the mirrors.

## Acceptance criteria

- [ ] `sdcorejs-write-user-guide.md` exists with valid frontmatter (name/description/allowed-tools) + documents all 4 modes; mirror in sync.
- [ ] `_refs/shared/user-guide-template.md` ships the per-module template (frontmatter + the 7 sections), the aggregate template, the pandoc DOCX/PDF command, and the image-placeholder + capture-checklist pattern.
- [ ] Per-module guide path is `.sdcorejs/user-guide/<module>.md`; aggregate is `<root>/sdcorejs-user-guide.md`.
- [ ] Mode 1 (incremental) is wired into all three write-code tail chains right after `auto-docs`; documented as updating ONLY the touched module.
- [ ] Mode 2 (aggregate + pandoc) is wired into `ship` after `branch-ready`.
- [ ] Mode 3 (legacy) invokes `code-map` for harvest and produces guides from existing code without a spec.
- [ ] Coverage section maps spec acceptance criteria (+ external `.sdcorejs/prd/<feature>.md` if present) → ✅/⚠️/❌.
- [ ] No duplication of `auto-docs`/`auto-summary`/`code-map`; CLAUDE.md + workflow diagram updated.
- [ ] `bash .claude/sync-skills.sh --check` + `npx lefthook run check` green.

## Risks & mitigations

- **Auto-trigger noise** — two-tier cadence (incremental per-module only on edits; aggregate only on ship/manual).
- **Export + screenshots are target-project-side** — the skill emits the pandoc command + image placeholders + a capture checklist; it never runs the target app (the agent repo can't). Document this boundary.
- **Coverage accuracy depends on a spec/PRD existing** — legacy mode flags "no spec"; the coverage table is best-effort when only code exists.
- **Drift between guide and code** — mode 1 re-harvests the touched module each edit; the aggregate is rebuilt at ship, so it never lags a release.
- **Large skill** — phased plan (per-module mode → aggregate+export → legacy mode → wiring), each independently testable.

## Out of scope

- Auto-capturing scaffold screenshots (no running app in the agent repo; placeholders + checklist instead; optional Playwright step is a target-project concern).
- A live DOCX/PDF renderer inside the skill (delegated to `pandoc`, which the target environment runs).
- nextjs content guides beyond the wiring entry (the harvest focuses on angular+nestjs feature modules; nextjs sites can reuse the aggregate mode).
- Translating guides (guides follow the user's language per the bilingual rule; no separate i18n pipeline).

## Suggested phasing (for the plan)

1. **Template ref** — `_refs/shared/user-guide-template.md` (per-module + aggregate templates, pandoc command, image checklist).
2. **Skill core + mode 1** — `write-user-guide.md` with the harvest + per-module incremental generation + the coverage mapping.
3. **Mode 2 (aggregate + export)** — aggregate assembly + pandoc command emission + ship hook.
4. **Mode 3 (legacy)** — code-map harvest → synthesize guides for an existing project.
5. **Wiring** — tail-chain inserts (3 tracks) + ship + CLAUDE.md + workflow diagram + final gate.

Each phase is independently committable + mirror-synced; phases 1–2 deliver a working per-module guide generator before the aggregate/legacy/wiring layers.
