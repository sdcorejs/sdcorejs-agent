---
name: sdcorejs-write-user-guide
description: Generate + maintain evergreen end-user feature guides for generated SDCoreJS apps. Per-module `.sdcorejs/user-guide/<module>.md` (features / tasks / routes / permissions / data + a Coverage-vs-requirements table) and a root aggregate `sdcorejs-user-guide.md` exportable to DOCX/PDF via pandoc (scaffold images = placeholders + a capture checklist). Four modes - per-module incremental (auto in the write-code tail chain, right after auto-docs), aggregate build (on ship / large feature / manual), legacy reverse-engineer (read an existing project via `sdcorejs-code-map`), PRD-coverage compare (spec acceptance criteria + optional external `.sdcorejs/prd/<feature>.md`). Distinct from `sdcorejs-auto-docs` (session deltas) and `sdcorejs-auto-summary` (project brief). Triggers - end of any write-code task (per-module update), "viết user guide", "tài liệu người dùng", "user manual", "gom user guide", "xuất user guide docx/pdf", "so PRD / đáp ứng yêu cầu chưa", ship of a large feature, "đọc toàn dự án viết user guide". Applies to angular, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Write User Guide

## Purpose

Generate and maintain **evergreen end-user feature references** for generated SDCoreJS apps. Unlike other `.sdcorejs/` artifacts, this skill produces documentation for *end users* (or QA / PMs), not for the next AI session.

| Artifact | Question answered | Lifecycle |
|---|---|---|
| **`.sdcorejs/user-guide/<module>.md`** (this skill) | "How do I USE this feature?" | idempotent overwrite per module, keyed to git HEAD |
| **`sdcorejs-user-guide.md`** (aggregate, Mode 2) | "The full system — one doc to export" | rebuilt from per-module guides on demand |
| `.sdcorejs/docs/<track>/*.md` (`auto-docs`) | "What was DONE this session" | many timestamped session deltas |
| `.sdcorejs/summary.md` (`auto-summary`) | "What IS this project" | one canonical project brief |

Templates live in `_refs/shared/user-guide-template.md`. Per-module guides go to `<target>/.sdcorejs/user-guide/<module>.md`; the aggregate goes to `<target>/sdcorejs-user-guide.md`. Both are generated artifacts and are idempotently overwritten.

## Modes

| # | Mode | When | Trigger |
|---|---|---|---|
| 1 | **Per-module incremental** | write-code tail chain (auto), or manual for one module | end of write-code / `auto-docs`; "viết user guide cho module X" |
| 2 | **Aggregate build** | ship a large feature, export to DOCX/PDF, manual | "gom user guide", "xuất user guide docx/pdf", `sdcorejs-ship` |
| 3 | **Legacy reverse-engineer** | existing project, no spec, read-first | "đọc toàn dự án viết user guide", "viết user guide từ code cũ" |
| 4 | **PRD-coverage compare** | runs inside Mode 1 & 2 automatically | "so PRD / đáp ứng yêu cầu chưa"; always fires when a spec or PRD exists |

## Not

- Do NOT duplicate `sdcorejs-auto-docs` (session deltas — timestamped, one file per session) or `sdcorejs-auto-summary` (project brief — one canonical file). READ `.sdcorejs/summary.md` as context before writing user guides; it provides the module list, stack, and architecture map.
- Mode 3 (Legacy) MUST delegate discovery to `sdcorejs-code-map` — do NOT re-implement route/permission globbing here.
- All artifacts write to the **TARGET project**, never to the `sdcorejs-agent` repo.

---

## Mode 1 — Per-module incremental (write-code tail)

### 1. Trigger

**Automatic** at the end of any write-code task (tail chain: `auto-docs` → **`write-user-guide` Mode 1**), for every module touched this session.

Also triggered **manually**: "viết user guide cho module X", "cập nhật user guide", "user guide module <name>".

### 2. Harvest the touched module

Identify the `<module>` name from the write-code context (module root dir, session notes). Then probe the target project for routes, permissions, entity fields, and screen types.

**Angular — routes & permissions:**
```bash
# Permission data on routes
rg -n "data:\s*\{[^}]*permission" <fe>/src/libs/<module>

# sdPermission directive usages
rg -n "sdPermission" <fe>/src/libs/<module>

# Route declarations
rg -n "path:" <fe>/src/libs/<module>/routes.ts
```

**NestJS — routes & permissions:**
```bash
# Module route prefix (RouterModule registration)
rg -n "RouterModule\|path:" <be>/src/app.module.ts <be>/src/modules/<module>/<module>.module.ts

# BaseController inherited paths (auto-wired):
#   POST /search | /paging
#   GET  /all | /:id
#   DELETE /:id
#   POST / (create) | PUT /:id (update)

# Explicit permission guards
rg -n "@HasPermission\('([^']+)'\)" <be>/src/modules/<module>
```

**Entity fields & Zod schema:**
```bash
# Entity column definitions
rg -n "@Column" <be>/src/modules/<module>/entities/

# Zod schema file
Glob: <be>/src/modules/<module>/schemas/<module>.schema.ts
Read: extract field names + validation rules
```

**Screen types (Angular):**
```bash
# Detect list / detail / create / update / custom-action screens
Glob: <fe>/src/libs/<module>/features/<entity>/pages/*/
# list.component.ts | detail.component.ts | create.component.ts | update.component.ts
rg -n "openWorkflow\|openBulk\|openCustomAction\|SdActionButton" <fe>/src/libs/<module>
```

### 3. Render the per-module guide

Write `<target>/.sdcorejs/user-guide/<module>.md` from the per-module template in `_refs/shared/user-guide-template.md`.

Fill the YAML frontmatter:
- `module` — module slug
- `title` — human-readable feature name (Vietnamese preferred; English fallback)
- `tracks` — e.g. `[angular, nestjs]`
- `generated_at` — ISO 8601 timestamp
- `git_head` — `git rev-parse HEAD` of the target repo
- `routes` — list of `{ path, screen, permission }` from the harvest
- `permissions` — flat list of all permission codes found
- `entities` — list of `{ name, fields[] }` from entity harvest
- `screens` — list of screen types detected: `[list, detail, create, update]`
- `spec_refs` — path(s) to the relevant `<target>/.sdcorejs/docs/<track>/*-spec.md` (glob latest)
- `prd_refs` — path(s) to `<target>/.sdcorejs/prd/<feature>.md` if they exist (leave `[]` if absent)
- `coverage` — filled by Mode 4 below; initialize to `{ total: 0, met: 0, partial: 0, missing: 0 }`

Fill the 7 body sections using the harvested data:
1. **Tổng quan** — plain-language description of what the module does for the user.
2. **Màn hình & tác vụ** — one subsection per detected screen, with user tasks, required permission, and main fields/buttons. Include the `![<screen>](images/<module>-<screen>.png)` placeholder.
3. **Bảng quyền** — table of all permission codes with their action and typical role.
4. **Tham chiếu dữ liệu** — table of entity fields (name / type / required / constraints) from the `@Column` / Zod harvest.
5. **Hành động đặc biệt** — workflow transitions, bulk actions, custom side-effects (omit section if none found).
6. **Coverage vs yêu cầu** — filled by Mode 4 (see below).
7. **Ảnh minh hoạ — checklist chụp** — `- [ ] images/<module>-<screen>.png` for every detected screen.

**Idempotent:** this file is a generated artifact — overwrite it unconditionally. Do not append to an existing file.

### 4. Run Mode 4 — Coverage (always)

After rendering the 7 sections, immediately run **Mode 4** to fill the `## Coverage vs yêu cầu` table and update the `coverage` frontmatter counts. See Mode 4 below.

### 5. Emit image placeholders

Always include the `## Ảnh minh hoạ` capture checklist even if no screens are detected (list what *should* exist). The agent does NOT run the app or capture screenshots — the checklist tells the developer which images to capture and where to place them (`<target>/.sdcorejs/user-guide/images/`).

---

## Mode 4 — Coverage vs requirements (runs inside Mode 1 & 2)

### Purpose

Map every requirement from the approved spec / PRD to either ✅ documented & implemented, ⚠️ partial, or ❌ missing. Fills the guide's `## Coverage vs yêu cầu` table and the `coverage` frontmatter block.

### 1. Load the spec

```bash
# Latest spec for this track/feature
Glob: <target>/.sdcorejs/docs/<track>/*-spec.md
Glob: <target>/.sdcorejs/specs/<track>/*-spec.md
# Read the most recent match; extract "## Acceptance criteria" section
```

### 2. Load the PRD (optional)

```bash
# External PRD if it exists
Glob: <target>/.sdcorejs/prd/<feature>.md
Read: extract requirement list / acceptance criteria
```

If both spec and PRD exist, merge their criteria (deduplicate by intent).

### 3. Map each requirement

For every criterion, determine its status by checking the guide's populated sections:
- **✅ đủ** — the guide's `## Màn hình & tác vụ`, `## Bảng quyền`, or `## Tham chiếu dữ liệu` explicitly covers it AND the harvest found the corresponding code artefact (route / permission / field / action).
- **⚠️ một phần** — the criterion is partially described or the implementation evidence is incomplete (e.g. field exists but no validation documented, or screen exists but permission guard missing).
- **❌ thiếu** — no evidence in code or guide; include a short gap note.

### 4. Render the coverage table

```markdown
## Coverage vs yêu cầu
| # | Yêu cầu (spec/PRD) | Trạng thái | Tài liệu ở mục |
|---|---|---|---|
| 1 | <criterion text> | ✅ đủ | Màn hình & tác vụ |
| 2 | <criterion text> | ⚠️ một phần | <gap note> |
| 3 | <criterion text> | ❌ thiếu | — |
```

### 5. Update frontmatter counts

```yaml
coverage:
  total: <N>
  met: <count of ✅>
  partial: <count of ⚠️>
  missing: <count of ❌>
```

### 6. No spec or PRD

If no spec or PRD file is found (legacy project or early-stage feature), write:
```markdown
## Coverage vs yêu cầu
> Không có spec/PRD — bảng coverage được điền best-effort từ code.

| # | Tính năng phát hiện từ code | Trạng thái | Ghi chú |
|---|---|---|---|
| 1 | <harvested route / permission / screen> | ✅ đủ | từ code |
```

---

## Rules

### MUST DO
- Render from `_refs/shared/user-guide-template.md` — do NOT hard-code the template inline.
- **Idempotent overwrite** — `<target>/.sdcorejs/user-guide/<module>.md` is a generated artifact; overwrite it unconditionally, never append.
- Write to the **TARGET project** (resolve `TARGET_ROOT=$(git rev-parse --show-toplevel)` from the user's CWD; never write into the `sdcorejs-agent` repo).
- **Bilingual VI/EN** — section headings in Vietnamese (as in the template); field names, permission codes, and route paths in English; prose in the user's session language.
- Always emit **image placeholders + the capture checklist** (`## Ảnh minh hoạ`), even when no real images exist yet.
- Record `git_head` and `generated_at` in every frontmatter block so drift is detectable.

### MUST NOT
- Duplicate `sdcorejs-auto-docs` (session deltas) — the user guide is a timeless end-user reference, not a session changelog.
- Duplicate `sdcorejs-auto-summary` (project brief) — READ `summary.md` as context, never replace it.
- **Capture screenshots or run the target app** — the agent is read-only with respect to runtime; image entries are always placeholders.
- Write any artifact into the `sdcorejs-agent` repo (the agent repo holds skills, not project content).
- Invent routes, permissions, or field names not found in the harvest — prefer "unknown — fill manually" over fabrication.

## Related

- `_refs/shared/user-guide-template.md` — per-module + aggregate templates + pandoc export command
- `sdcorejs-code-map` — discovery engine used by Mode 3 (legacy reverse-engineer)
- `sdcorejs-auto-docs` — session-delta skill (distinct from this skill's evergreen guides)
- `sdcorejs-auto-summary` — canonical project brief (read as context before writing guides)
- `sdcorejs-ship` — triggers Mode 2 (aggregate build) as part of the ship checklist

<!-- Mode 2 (aggregate) + Mode 3 (legacy) appended by later tasks -->
