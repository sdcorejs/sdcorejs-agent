# `sdcorejs-write-user-guide` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new skill that generates + maintains evergreen end-user feature guides for generated SDCoreJS apps (per-module + aggregate + DOCX/PDF + coverage-vs-requirements).

**Architecture:** Meta-work on the `sdcorejs-agent` repo's own skills + `_refs`. One new skill `skills/orchestration/write-user-guide.md` (4 modes) + one new ref `_refs/shared/user-guide-template.md` (templates + pandoc command), wired into the three write-code tail chains + `ship` + CLAUDE.md. "Tests" = `bash .claude/sync-skills.sh --check`, `npx lefthook run check`, and `rg` assertions per task.

**Tech Stack:** Markdown skill (YAML frontmatter) + no-frontmatter `_refs` template; generated guides are Markdown exported via `pandoc`; harvest reads the angular/nestjs write-code pack outputs.

**Design doc:** `docs/superpowers/specs/2026-06-09-sdcorejs-write-user-guide-design.md`

---

## Conventions (every task)
- Edit/create source under `_refs/**` + `skills/**` ONLY. NEVER hand-edit mirrors (`.claude/skills`, `plugin/skills`, `.claude/_refs`, `plugin/_refs`).
- Every commit step: `bash .claude/sync-skills.sh` first, then `git add` source **and** mirror dirs.
- `_refs/**` = NO frontmatter; `skills/**` MUST have frontmatter (`name`/`description`/`allowed-tools`).
- Benign `WARN: no 'name:' frontmatter in skills/tracks/nestjs/_README.md` during sync is expected.

## File map
| File | Phase | Responsibility |
|---|---|---|
| `_refs/shared/user-guide-template.md` | P1 | per-module + aggregate templates, pandoc command, image checklist |
| `skills/orchestration/write-user-guide.md` | P2,P3,P4 | the skill: 4 modes + harvest + coverage |
| `skills/orchestration/ship.md` | P3 | aggregate-build hook on ship |
| `skills/tracks/angular/write-code.md` | P5 | tail-chain insert (mode 1) |
| `skills/tracks/nestjs/write-code.md` | P5 | tail-chain insert (mode 1) |
| `skills/tracks/nextjs/write-code.md` | P5 | tail-chain insert (mode 1) |
| `CLAUDE.md` | P5 | skill table + workflow diagram + mandatory-rule note |

---

# PHASE 1 — Template ref

## Task 1: Create `_refs/shared/user-guide-template.md`

**Files:**
- Create: `_refs/shared/user-guide-template.md`

- [ ] **Step 1: Header + scope note**

Create the file (NO frontmatter — it's a `_refs` template):
```
# User-Guide Templates (for `sdcorejs-write-user-guide`)

Templates the `sdcorejs-write-user-guide` skill renders. Per-module guides live at
`<target>/.sdcorejs/user-guide/<module>.md`; the aggregate at `<target>/sdcorejs-user-guide.md`.
Markdown is canonical; DOCX/PDF is produced by the pandoc command at the bottom. Images are
placeholders the target project fills (the agent does not run the app / capture screenshots).
```

- [ ] **Step 2: Per-module template (frontmatter + 7 sections)**

Add a `## Per-module template (.sdcorejs/user-guide/<module>.md)` section containing this verbatim template block:
```markdown
---
module: <module>
title: <Tên tính năng>
tracks: [angular, nestjs]
generated_at: <ISO8601>
git_head: <sha>
routes:
  - { path: /<module>/<entity>, screen: list, permission: <module>_<entity>:view }
permissions: [<module>_<entity>:view, <module>_<entity>:create, ...]
entities:
  - { name: <Entity>, fields: [code, name, ...] }
screens: [list, detail, create, update]
spec_refs: [.sdcorejs/docs/<track>/<ts>-<topic>-spec.md]
prd_refs: []
coverage: { total: 0, met: 0, partial: 0, missing: 0 }
---

# <Tên tính năng> — Hướng dẫn người dùng

## Tổng quan
<Mô tả module làm gì cho người dùng, ngôn ngữ phổ thông.>

## Màn hình & tác vụ
### <Tên màn> — `/<module>/<entity>`
- **Người dùng làm gì:** <mô tả tác vụ>
- **Ai dùng được:** quyền `<module>_<entity>:<action>`
- **Trường/nút chính:** <liệt kê>
![<Tên màn>](images/<module>-<screen>.png)

## Bảng quyền
| Mã quyền | Tác vụ | Ai/Vai trò |
|---|---|---|
| `<module>_<entity>:view` | Xem danh sách/chi tiết | <role> |
| `<module>_<entity>:create` | Tạo mới | <role> |

## Tham chiếu dữ liệu
| Trường | Kiểu | Bắt buộc | Ràng buộc |
|---|---|---|---|
| code | string | có | duy nhất |
| name | string | có | <=255 |

## Hành động đặc biệt
<workflow / chuyển trạng thái / bulk / xuất Excel — nếu có; bỏ nếu không.>

## Coverage vs yêu cầu
| # | Yêu cầu (spec/PRD) | Trạng thái | Tài liệu ở mục |
|---|---|---|---|
| 1 | <acceptance criterion> | ✅ đủ | Màn hình & tác vụ |
| 2 | <criterion> | ⚠️ một phần | <gap> |
| 3 | <criterion> | ❌ thiếu | — |

## Ảnh minh hoạ — checklist chụp
- [ ] `images/<module>-list.png` — màn danh sách
- [ ] `images/<module>-detail.png` — màn chi tiết
```

- [ ] **Step 3: Aggregate template**

Add a `## Aggregate template (<root>/sdcorejs-user-guide.md)` section:
```markdown
---
title: <Tên dự án> — Hướng dẫn sử dụng
generated_at: <ISO8601>
git_head: <sha>
modules: [<module1>, <module2>]
coverage: { total: 0, met: 0, partial: 0, missing: 0 }
---

# <Tên dự án> — Hướng dẫn sử dụng

## Mục lục
1. [<Module 1>](#module-1) …

## Tổng quan hệ thống
<1-2 đoạn: hệ thống làm gì, dành cho ai.>

## <Module 1>
<chèn nội dung .sdcorejs/user-guide/<module1>.md (bỏ frontmatter)>

## Tổng hợp Coverage vs yêu cầu
| Module | Đủ ✅ | Một phần ⚠️ | Thiếu ❌ |
|---|---|---|---|
| <module1> | 5 | 1 | 0 |
```

- [ ] **Step 4: pandoc command + image note**

Add a `## Xuất DOCX/PDF (pandoc)` section:
```
DOCX (ưu tiên — chèn được ảnh scaffold):
  pandoc <target>/sdcorejs-user-guide.md -o <target>/sdcorejs-user-guide.docx --resource-path=<target>/.sdcorejs/user-guide
PDF:
  pandoc <target>/sdcorejs-user-guide.md -o <target>/sdcorejs-user-guide.pdf --resource-path=<target>/.sdcorejs/user-guide

- Ảnh là placeholder `images/<module>-<screen>.png`; đặt ảnh vào `<target>/.sdcorejs/user-guide/images/` rồi chạy pandoc.
- Agent KHÔNG chạy app/chụp ảnh — checklist chụp ở mỗi guide nói rõ cần chụp màn nào.
```

- [ ] **Step 5: Verify**

Run: `rg -n "Per-module template|Aggregate template|Coverage vs yêu cầu|pandoc|images/<module>" _refs/shared/user-guide-template.md`
Expected: all sections + pandoc + image placeholder present.

- [ ] **Step 6: Sync + commit**

```bash
cd "c:\Users\Admin\Documents\sdcorejs\sdcorejs-agent"
bash .claude/sync-skills.sh
git add _refs/shared/user-guide-template.md .claude/_refs plugin/_refs
git commit -m "feat(refs): add user-guide-template (per-module + aggregate + pandoc) (P1)"
```

---

# PHASE 2 — Skill core + Mode 1 (per-module incremental)

## Task 2: Create `skills/orchestration/write-user-guide.md`

**Files:**
- Create: `skills/orchestration/write-user-guide.md`

- [ ] **Step 1: Frontmatter + Purpose**

Create the file with this frontmatter (single-line description):
```
---
name: sdcorejs-write-user-guide
description: Generate + maintain evergreen end-user feature guides for generated SDCoreJS apps. Per-module `.sdcorejs/user-guide/<module>.md` (features / tasks / routes / permissions / data + a Coverage-vs-requirements table) and a root aggregate `sdcorejs-user-guide.md` exportable to DOCX/PDF via pandoc (scaffold images = placeholders + a capture checklist). Four modes - per-module incremental (auto in the write-code tail chain, right after auto-docs), aggregate build (on ship / large feature / manual), legacy reverse-engineer (read an existing project via `sdcorejs-code-map`), PRD-coverage compare (spec acceptance criteria + optional external `.sdcorejs/prd/<feature>.md`). Distinct from `sdcorejs-auto-docs` (session deltas) and `sdcorejs-auto-summary` (project brief). Triggers - end of any write-code task (per-module update), "viết user guide", "tài liệu người dùng", "user manual", "gom user guide", "xuất user guide docx/pdf", "so PRD / đáp ứng yêu cầu chưa", ship of a large feature, "đọc toàn dự án viết user guide". Applies to angular, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---
```
Then a `# Write User Guide` title + `## Purpose` (evergreen end-user feature reference; distinct from auto-docs/auto-summary; templates in `_refs/shared/user-guide-template.md`).

- [ ] **Step 2: Modes overview + non-overlap**

Add `## Modes` (table: 1 per-module incremental / 2 aggregate build / 3 legacy reverse-engineer / 4 PRD-coverage [runs inside 1+2]) and a `## Not` note: do NOT duplicate `auto-docs` (session deltas) or `auto-summary` (project brief); read `summary.md` as context; reuse `code-map` for harvest (mode 3).

- [ ] **Step 3: Mode 1 — per-module incremental**

Add `## Mode 1 — Per-module incremental (write-code tail)`. Document:
1. **Trigger:** automatic at the end of a write-code task (tail chain, right after `auto-docs`), for the module(s) touched this session. Also manual ("viết user guide cho module X").
2. **Harvest the touched module** (cite the sources): 
   - Angular routes + permissions: `rg -n "data:\s*\{[^}]*permission" <fe>/src/libs/<module>` and `rg -n "sdPermission" <fe>/src/libs/<module>`.
   - NestJS routes + permissions: the module's `RouterModule` prefix + `BaseController` inherited paths + `rg -n "@HasPermission\('([^']+)'\)" <be>/src/modules/<module>`.
   - Entity fields + Zod: the entity `@Column`s + `schemas/<module>.schema.ts`.
   - Screen types: list/detail/create/update + custom actions.
3. **Render** `<target>/.sdcorejs/user-guide/<module>.md` from the per-module template (`_refs/shared/user-guide-template.md`) — fill frontmatter (routes/permissions/entities/screens/spec_refs/git_head) + the 7 sections. Idempotent: overwrite the module's file (it's a generated artifact).
4. **Coverage:** see Mode 4.
5. Image placeholders + capture checklist always emitted.

- [ ] **Step 4: Mode 4 — PRD-coverage compare (runs inside 1 & 2)**

Add `## Mode 4 — Coverage vs requirements`. Document: load the feature's spec (`<target>/.sdcorejs/docs|specs/<track>/*-spec.md`) `## Acceptance criteria`; if `<target>/.sdcorejs/prd/<feature>.md` exists, also load it. Map each requirement → ✅ documented & implemented / ⚠️ partial / ❌ missing, into the guide's `## Coverage vs yêu cầu` table + the frontmatter `coverage` counts. If no spec/PRD (e.g. legacy), note "không có spec/PRD — best-effort từ code".

- [ ] **Step 5: Rules + related refs** — MUST DO (templates from the ref; idempotent overwrite; bilingual; never run the target app); MUST NOT (duplicate auto-docs/auto-summary; capture screenshots; write to the agent repo). Related: `_refs/shared/user-guide-template.md`, `sdcorejs-code-map`, `sdcorejs-auto-docs`, `sdcorejs-auto-summary`, `sdcorejs-ship`.

- [ ] **Step 6: Verify**

```bash
rg -n "name: sdcorejs-write-user-guide|Mode 1 — Per-module|Coverage vs requirements|\.sdcorejs/user-guide/<module>" skills/orchestration/write-user-guide.md
head -4 skills/orchestration/write-user-guide.md   # frontmatter valid
```
Expected: frontmatter + Mode 1 + Mode 4 present.

- [ ] **Step 7: Sync + commit**

```bash
bash .claude/sync-skills.sh
git add skills/orchestration/write-user-guide.md .claude/skills plugin/skills
git commit -m "feat(skills): add sdcorejs-write-user-guide skill — mode 1 per-module + coverage (P2)"
```

---

# PHASE 3 — Mode 2 (aggregate + export) + ship hook

## Task 3: Aggregate mode in the skill + ship hook

**Files:**
- Modify: `skills/orchestration/write-user-guide.md`
- Modify: `skills/orchestration/ship.md`

- [ ] **Step 1: Mode 2 in the skill**

Append `## Mode 2 — Aggregate build + export`. Document:
1. **Trigger:** on ship / large feature / manual ("gom user guide", "xuất user guide docx").
2. Glob `<target>/.sdcorejs/user-guide/*.md`; assemble `<target>/sdcorejs-user-guide.md` from the aggregate template (TOC + each module's body sans-frontmatter + the global coverage summary table summing each module's `coverage`).
3. Emit the pandoc command (from the template ref) for DOCX (preferred) / PDF; tell the user to drop images into `.sdcorejs/user-guide/images/` then run it. Do NOT run the target app.
4. Idempotent overwrite of the root aggregate.

- [ ] **Step 2: ship.md hook**

First READ `skills/orchestration/ship.md` (step list: verify → branch-ready → [changelog] → commit → push → pr). Insert a step **after `branch-ready`, before commit** (so the regenerated aggregate is committed with the feature): "Rebuild the user guide aggregate (`sdcorejs-write-user-guide` Mode 2) + offer the pandoc DOCX export. Large-feature/release ships always rebuild; ask before exporting DOCX." Add it to the step list + the summary.

- [ ] **Step 3: Verify**

```bash
rg -n "Mode 2 — Aggregate|sdcorejs-user-guide.md|pandoc" skills/orchestration/write-user-guide.md
rg -n "write-user-guide|user guide aggregate" skills/orchestration/ship.md
```
Expected: Mode 2 in the skill; the ship hook references the aggregate rebuild.

- [ ] **Step 4: Sync + commit**

```bash
bash .claude/sync-skills.sh
git add skills/orchestration/write-user-guide.md skills/orchestration/ship.md .claude/skills plugin/skills
git commit -m "feat(skills): user-guide aggregate build + pandoc export + ship hook (P3)"
```

---

# PHASE 4 — Mode 3 (legacy reverse-engineer)

## Task 4: Legacy mode in the skill

**Files:**
- Modify: `skills/orchestration/write-user-guide.md`

- [ ] **Step 1: Mode 3**

Append `## Mode 3 — Legacy reverse-engineer`. Document:
1. **Trigger:** manual ("đọc toàn dự án viết user guide", "viết user guide cho dự án cũ").
2. Invoke `sdcorejs-code-map` to harvest the WHOLE project — modules, routes, permission codes, screens, shared components (code-map already surfaces these). 
3. For each discovered module, render `.sdcorejs/user-guide/<module>.md` from the per-module template using the harvested facts (no write-code pack output to read — derive from the existing code that code-map mapped + targeted `rg` for routes/permissions).
4. Then run Mode 2 (aggregate). Coverage section notes "reverse-engineered — no spec/PRD" unless a `.sdcorejs/prd/<feature>.md` is supplied.
5. Note: legacy projects may not follow SDCoreJS conventions exactly — harvest is best-effort; flag modules where routes/permissions couldn't be resolved.

- [ ] **Step 2: Verify**

```bash
rg -n "Mode 3 — Legacy|sdcorejs-code-map|reverse-engineer" skills/orchestration/write-user-guide.md
```
Expected: Mode 3 present + invokes code-map.

- [ ] **Step 3: Sync + commit**

```bash
bash .claude/sync-skills.sh
git add skills/orchestration/write-user-guide.md .claude/skills plugin/skills
git commit -m "feat(skills): user-guide legacy reverse-engineer mode via code-map (P4)"
```

---

# PHASE 5 — Wiring

## Task 5: Tail-chain inserts + CLAUDE.md + final gate

**Files:**
- Modify: `skills/tracks/angular/write-code.md`, `skills/tracks/nestjs/write-code.md`, `skills/tracks/nextjs/write-code.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Tail-chain inserts (3 files)**

In each write-code orchestrator's "Mandatory tail chain", insert `sdcorejs-write-user-guide` **right after `auto-docs`** (so the cluster reads: `auto-docs` → `write-user-guide` → `auto-task-tracker` → `memories`). Wording: "`sdcorejs-write-user-guide` (Mode 1) — update the touched module's `.sdcorejs/user-guide/<module>.md` (features/routes/permissions + coverage). Per-module incremental; the aggregate rebuilds at ship." Match each file's existing numbered-list style + renumber the subsequent steps (auto-task-tracker, memories).

- [ ] **Step 2: CLAUDE.md**

(a) Add a row to the orchestration skill table for `sdcorejs-write-user-guide` (trigger: end of write-code per-module / ship aggregate / "viết user guide" / legacy scan). (b) Add a node to the workflow diagram after `auto-docs` (`→ write-user-guide`). (c) Add a one-line mandatory note: "Per-module user guide updated on every write-code (after auto-docs); aggregate + DOCX rebuilt on ship."

- [ ] **Step 3: Verify**

```bash
rg -n "write-user-guide" skills/tracks/angular/write-code.md skills/tracks/nestjs/write-code.md skills/tracks/nextjs/write-code.md CLAUDE.md
```
Expected: the step present in all three tail chains + CLAUDE.md (table + diagram + note).

- [ ] **Step 4: Full gate**

```bash
bash .claude/sync-skills.sh --check     # all 4 mirror trees in sync
npx lefthook run check                  # core-version / frontmatter / sync green
git status --short                      # only intended files
```

- [ ] **Step 5: Commit**

```bash
git add skills/tracks/angular/write-code.md skills/tracks/nestjs/write-code.md skills/tracks/nextjs/write-code.md CLAUDE.md .claude/skills plugin/skills .claude/_refs plugin/_refs
git commit -m "feat(skills): wire write-user-guide into write-code tail chains + ship + CLAUDE.md (P5)"
```

---

## Acceptance criteria → task map (self-review)

| Spec criterion | Task(s) |
|---|---|
| skill exists, valid frontmatter, 4 modes; mirror sync | T2 (frontmatter+modes 1/4), T3 (mode 2), T4 (mode 3) |
| template ref: per-module (frontmatter+7 sections), aggregate, pandoc, image checklist | T1 |
| per-module path `.sdcorejs/user-guide/<module>.md`; aggregate root | T1, T2, T3 |
| mode 1 wired into 3 tail chains right after auto-docs, touched-module only | T5 Step 1 (+ T2 mode 1) |
| mode 2 wired into ship after branch-ready | T3 Step 2 |
| mode 3 legacy via code-map, no spec needed | T4 |
| coverage maps spec acceptance criteria + optional external PRD → ✅/⚠️/❌ | T2 Step 4 (mode 4) |
| no duplication of auto-docs/auto-summary/code-map; CLAUDE.md + diagram updated | T2 Step 2 (Not note), T5 Step 2 |
| sync --check + lefthook green | every commit; T5 Step 4 |

All spec acceptance criteria map to ≥1 task. No gaps.
