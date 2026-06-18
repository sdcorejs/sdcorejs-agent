# Handoff — `sdcorejs-write-user-guide` skill

**Date:** 2026-06-09
**Branch:** `feat/sdcorejs-write-user-guide` (pushed to origin)
**For:** the next session (another machine) — self-contained; no prior chat history needed.

---

## TL;DR

1. New skill **`sdcorejs-write-user-guide`** is **built + reviewed (verdict: SHIP)** on `feat/sdcorejs-write-user-guide` — 7 commits (design + plan + 5 implementation tasks). Pushed to origin.
2. **Not merged.** `main` is at `f9b3416` (the prior squash-merge of the non-tech pipeline). This branch is **7 ahead / 0 behind** main → clean linear descendant, no conflicts.
3. Next action: open a PR and **squash-merge** into `main` (the established workflow). `gh` is **not authenticated** on this machine — either `gh auth login` then `gh pr create`, or open the PR via the URL below.
4. One cosmetic 🔵 nit left (optional polish — see Deferred).

---

## Git state

- Branch `feat/sdcorejs-write-user-guide`, HEAD `edc0b33` (verify: `git rev-parse --short HEAD`).
- `main` = `f9b3416` (prior work already squash-merged). `git rev-list --left-right --count main...HEAD` → `0  7` (clean descendant).
- Working tree clean. 42 skills; `.claude/skills` + `plugin/skills` + `.claude/_refs` + `plugin/_refs` mirrors all in sync.

### Commits on this branch (oldest → newest)
```
2340efc docs(design): sdcorejs-write-user-guide skill
07caf4e docs(plan): sdcorejs-write-user-guide (5-phase)
867833a feat(refs): add user-guide-template (per-module + aggregate + pandoc) (P1)
c362764 feat(skills): add sdcorejs-write-user-guide skill — mode 1 per-module + coverage (P2)
4faadaf feat(skills): user-guide aggregate build + pandoc export + ship hook (P3)
65f13cf feat(skills): user-guide legacy reverse-engineer mode via code-map mode (P4)
edc0b33 feat(skills): wire write-user-guide into write-code tail chains + ship + CLAUDE.md (P5)
```

### Open the PR (gh not authed)
- URL: https://github.com/sdcorejs/sdcorejs-agent/pull/new/feat/sdcorejs-write-user-guide
- Title: `feat: add sdcorejs-write-user-guide skill (per-module + aggregate user guides)`
- Body: summarize the 5 phases below + the test plan (sync-skills --check + lefthook). Land via **Squash and merge**.
- If `gh` is available on the other machine: `gh auth login` then `gh pr create --base main --head feat/sdcorejs-write-user-guide --title "..." --body "..."`.

---

## What the skill does (the design)

Design doc: `docs/superpowers/specs/2026-06-09-sdcorejs-write-user-guide-design.md` (Status: Delivered). Plan: `docs/superpowers/plans/2026-06-09-sdcorejs-write-user-guide.md`.

An **evergreen end-user feature reference** for generated SDCoreJS apps — distinct from `auto-docs` (session deltas) and `summary mode` (project brief).

- **Artifacts:** per-module `<target>/.sdcorejs/user-guide/<module>.md`; aggregate `<target>/sdcorejs-user-guide.md` (project root). Markdown canonical; DOCX/PDF via `pandoc`; scaffold images = `![…](images/…)` placeholders + a capture checklist (the agent never runs the target app).
- **4 modes:** (1) per-module incremental — auto in the write-code tail chain, right after `auto-docs`, updates only the touched module; (2) aggregate build — on ship / large feature / manual, assembles the root guide + emits the pandoc command; (3) legacy reverse-engineer — reads a whole existing project via `sdcorejs-explore`; (4) PRD-coverage — maps the spec's `## Acceptance criteria` (+ optional external `.sdcorejs/prd/<feature>.md`) → ✅/⚠️/❌ in a "Coverage vs yêu cầu" table.

### What was built (5 phases / tasks)
- **P1** `_refs/shared/user-guide-template.md` — per-module template (frontmatter + 7 sections: Tổng quan / Màn hình & tác vụ / Bảng quyền / Tham chiếu dữ liệu / Hành động đặc biệt / Coverage vs yêu cầu / Ảnh minh hoạ), aggregate template, pandoc command, image checklist.
- **P2** `skills/orchestration/write-user-guide.md` — the skill: frontmatter + Mode 1 (per-module harvest + render) + Mode 4 (coverage).
- **P3** Mode 2 (aggregate + pandoc) in the skill + a `ship.md` step (after `branch-ready`, before `commit`).
- **P4** Mode 3 (legacy reverse-engineer via `code-map mode`).
- **P5** wiring — `sdcorejs-write-user-guide` inserted in all 3 write-code tail chains right after `auto-docs`; CLAUDE.md skill table + workflow diagram + mandatory-rule note.

### Tail chain now (all 3 tracks)
`... → branch-ready → auto-docs → write-user-guide → auto-task-tracker → memories`

---

## Quality / review

- Built subagent-driven (fresh subagent per task + controller review of each committed diff).
- **Final holistic review verdict: SHIP** — no Critical / Important. Confirmed: tail-chain insert correct in all 3 tracks (after auto-docs, once, no reorder); `## Not` overlap-guard present (distinct artifact paths vs auto-docs/summary mode); template↔skill section names + paths + pandoc command consistent; ship hook placement correct; all acceptance criteria met; sync gate green (4/4 mirror trees, 42 source files).
- "Tests" = the repo's real gates (`bash .claude/sync-skills.sh --check`, `npx lefthook run check`, `rg` assertions). Live `pandoc` export of a real target project's guide is a target-project E2E, out of scope to land the branch.

---

## How to continue (next session)

1. **Sanity-check the checkout:**
   ```bash
   cd <repo>
   git rev-parse --short HEAD              # expect edc0b33 (or later)
   git status --short                       # clean
   bash .claude/sync-skills.sh --check      # 42 skills, all "in sync"
   npx lefthook run check                   # frontmatter / sync / core-version green
   ```
2. **Open + squash-merge the PR** — see Git state above.
3. Optionally pick up a deferred item below.

### Repo gotchas (carry forward)
- **Never hand-edit** `.claude/skills`, `plugin/skills`, `.claude/_refs`, `plugin/_refs` — generated mirrors. Edit `skills/<area>/*.md` + `_refs/**`, then `bash .claude/sync-skills.sh` and stage the mirrors. lefthook re-syncs + checks on commit; sync takes ~30-90s.
- Mirror dir name = the skill's `name:` frontmatter, NOT the filename.
- `_refs/**` files have NO frontmatter; `skills/**` files MUST have frontmatter.
- `gh` is **not authenticated** here — PR creation is manual via URL or after `gh auth login`.
- The benign `WARN: no 'name:' frontmatter in skills/tracks/nestjs/_README.md` on every sync is expected (intentional README skip).

---

## Deferred follow-ups (optional)

1. **🔵 cosmetic nit (from the final review):** in `_refs/shared/user-guide-template.md` the per-module template's `spec_refs:` frontmatter EXAMPLE shows only `.sdcorejs/docs/<track>/…-spec.md`, while the skill's Mode 4 correctly globs BOTH `.sdcorejs/docs/<track>/` AND `.sdcorejs/specs/<track>/`. One-line clarification in the template comment would remove the inconsistency. Non-blocking (the skill behaves correctly).
2. **Skill-trigger eval:** add an eval set for `sdcorejs-write-user-guide` (`docs/skill-eval-sets/` holds the existing eval JSONs) to confirm its description triggers on "viết user guide" / "đọc toàn dự án viết user guide" without cannibalizing `auto-docs`/`summary mode` triggers.
3. **Live E2E:** run the skill end-to-end in a real target project (per-module → aggregate → `pandoc` DOCX) and confirm the export + image-placeholder flow actually produces a usable DOCX — the only validation the agent repo can't do itself.

---

## Key file index
- Design: `docs/superpowers/specs/2026-06-09-sdcorejs-write-user-guide-design.md`
- Plan: `docs/superpowers/plans/2026-06-09-sdcorejs-write-user-guide.md`
- New skill: `skills/orchestration/write-user-guide.md`
- New ref: `_refs/shared/user-guide-template.md`
- Edited: `skills/orchestration/ship.md`, `skills/tracks/{angular,nestjs,nextjs}/write-code.md`, `CLAUDE.md`
