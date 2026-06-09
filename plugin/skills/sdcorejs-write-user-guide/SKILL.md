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

# Route declarations (covers flat routes.ts + nested *.routes.ts / *.routing.ts)
Glob: <fe>/src/libs/<module>/**/{routes.ts,*.routes.ts,*.routing.ts}
rg -rn "path:" <fe>/src/libs/<module>/
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
# Prefer spec scoped to this module (filename contains module slug)
Glob: <target>/.sdcorejs/docs/<track>/*-<module>*-spec.md
Glob: <target>/.sdcorejs/specs/<track>/*-<module>*-spec.md
# If no module-scoped match: read the latest auto-docs file for this session
# (<target>/.sdcorejs/docs/<track>/<latest>-auto-docs.md) and resolve its spec_refs field.
# Last fallback: most-recent *-spec.md in the track docs dir regardless of module.
# Extract "## Acceptance criteria" section from the resolved spec file.
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
- Write to the **TARGET project** (resolve `TARGET_ROOT=$(git rev-parse --show-toplevel)` from the user's CWD; never write into the `sdcorejs-agent` repo). **Guard:** if `TARGET_ROOT` basename matches `sdcorejs-agent`, or the directory contains no `src/`, `frontend/`, or `package.json` at its root (no evidence of an app project), **abort and ask** the user to provide the target project path explicitly — do not write user guides into the agent repo.
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

## Mode 2 — Aggregate build + export

### 1. Trigger

**Automatic** when `sdcorejs-ship` runs (large-feature or release mode).

Also triggered **manually**: "gom user guide", "xuất user guide docx/pdf", "build user guide", or any explicit request to produce the aggregate or export to DOCX/PDF.

### 2. Refresh stale guides before assembling

Each per-module guide records `git_head` in its YAML frontmatter. Before assembling, compare every guide's `git_head` to the **current** HEAD of the target repo:

```bash
CURRENT_HEAD=$(git -C <target> rev-parse HEAD)
```

For each `.sdcorejs/user-guide/*.md` whose `git_head` value ≠ `CURRENT_HEAD`: re-run **Mode 1** for that module now to bring it current. Modules whose `git_head == CURRENT_HEAD` are up to date — skip them.

This step prevents the aggregate from silently embedding stale module guides written before the latest commits.

### 3. Assemble the aggregate

Glob all per-module guides (after step 2 has refreshed any stale ones):

```bash
Glob: <target>/.sdcorejs/user-guide/*.md
# Read each file; extract YAML frontmatter (module, title, coverage) + body (strip frontmatter block)
```

Build `<target>/sdcorejs-user-guide.md` from the **aggregate template** in `_refs/shared/user-guide-template.md`:

1. **YAML frontmatter** — set `title` (project name from `sdcorejs-auto-summary` / ask user if absent), `generated_at` (ISO 8601 now), `git_head` (`git rev-parse HEAD`), `modules` (sorted list of all `module` slugs found), `coverage` (summed from step 4 below).
2. **`## Mục lục`** — numbered list linking to each `## <Module>` section anchor.
3. **`## Tổng quan hệ thống`** — 1–2 sentences: what the system does, who it is for (read from `.sdcorejs/summary.md` if it exists; otherwise write best-effort from module titles).
4. **One `## <Module>` section per file** — insert each module's body content verbatim after stripping the YAML frontmatter block (the `---…---` header). Preserve all headings (shift level if needed so they sit below the `##` module heading).
5. **`## Tổng hợp Coverage vs yêu cầu`** — global summary table; sum each module's `coverage` frontmatter counts:

```markdown
## Tổng hợp Coverage vs yêu cầu
| Module | Đủ ✅ | Một phần ⚠️ | Thiếu ❌ |
|---|---|---|---|
| <module1> | <met> | <partial> | <missing> |
| **Tổng** | <sum_met> | <sum_partial> | <sum_missing> |
```

Update the aggregate frontmatter `coverage` block with the summed totals.

**Idempotent:** overwrite `<target>/sdcorejs-user-guide.md` unconditionally — never append to an existing file.

### 4. Export to DOCX / PDF

After writing the aggregate, emit the pandoc commands from `_refs/shared/user-guide-template.md`:

```bash
# DOCX (preferred — supports embedded scaffold images):
pandoc <target>/sdcorejs-user-guide.md \
  -o <target>/sdcorejs-user-guide.docx \
  --resource-path=<target>/.sdcorejs/user-guide

# PDF (alternative):
pandoc <target>/sdcorejs-user-guide.md \
  -o <target>/sdcorejs-user-guide.pdf \
  --resource-path=<target>/.sdcorejs/user-guide
```

**The skill does NOT run pandoc or the target app.** It emits the commands above and reports the capture checklist — the developer runs pandoc locally after placing real screenshots.

Instruct the user:
> "Đặt ảnh thực tế vào `<target>/.sdcorejs/user-guide/images/` (xem checklist trong từng module guide), rồi chạy lệnh pandoc ở trên để xuất DOCX/PDF."

When invoked from `sdcorejs-ship`: **always rebuild** the aggregate. **Ask before emitting the pandoc export command** (large-feature ships may not need DOCX every time):
> "Bạn có muốn xuất DOCX ngay bây giờ không? (y / n)"

When triggered manually (e.g. "xuất user guide docx"): emit the export command immediately without asking.

---

## Mode 3 — Legacy reverse-engineer

### 1. Trigger

**Manual only.** Fire this mode when the user says:
- "đọc toàn dự án viết user guide"
- "viết user guide cho dự án cũ"
- "reverse-engineer user guide"
- or any equivalent request to produce guides for an existing/legacy project where no spec, plan, or write-code session output exists.

### 2. Harvest the whole project via `sdcorejs-code-map`

Delegate ALL discovery to `sdcorejs-code-map` (read-only architecture-discovery skill). Do NOT re-implement route/permission globbing here.

```
Invoke: sdcorejs-code-map
Purpose: full project inventory — modules/libs, routes + controllers, permission codes,
         screens, shared components, base classes, path conventions
Output:  module list + per-module facts used as the harvest basis for step 3
```

After `sdcorejs-code-map` completes, supplement its output with targeted probes (same probes as Mode 1) for any module where route or permission data is still missing:

**Angular — routes & permissions (supplement):**
```bash
rg -n "data:\s*\{[^}]*permission" <fe>/src/libs/<module>
rg -n "sdPermission" <fe>/src/libs/<module>
Glob: <fe>/src/libs/<module>/**/{routes.ts,*.routes.ts,*.routing.ts}
rg -rn "path:" <fe>/src/libs/<module>/
```

**NestJS — routes & permissions (supplement):**
```bash
rg -n "RouterModule\|path:" <be>/src/app.module.ts <be>/src/modules/<module>/<module>.module.ts
rg -n "@HasPermission\('([^']+)'\)" <be>/src/modules/<module>
```

**Entity fields & Zod schema (supplement):**
```bash
rg -n "@Column" <be>/src/modules/<module>/entities/
Glob: <be>/src/modules/<module>/schemas/<module>.schema.ts
```

**Screen types (Angular, supplement):**
```bash
Glob: <fe>/src/libs/<module>/features/<entity>/pages/*/
rg -n "openWorkflow\|openBulk\|openCustomAction\|SdActionButton" <fe>/src/libs/<module>
```

### 3. Render per-module guides

For **each module** discovered by `sdcorejs-code-map`, render `<target>/.sdcorejs/user-guide/<module>.md` from the per-module template in `_refs/shared/user-guide-template.md`, best-effort from the harvested facts.

Fill frontmatter and all 7 body sections exactly as in Mode 1, Step 3, using only data found in the harvest — **do NOT invent** routes, permissions, or field names not present in the code. Where a value could not be resolved, write `"unknown — fill manually"` rather than fabricating.

**FLAG unresolved modules explicitly.** For every module where routes and/or permission codes could NOT be resolved from the harvest, add a prominent notice at the top of that module's guide:

```markdown
> ⚠️ **Harvest incomplete** — routes and/or permission codes could not be resolved for this
> module (the project may not follow SDCoreJS conventions). The sections below are best-effort;
> a developer should verify and fill in the missing details manually.
```

Do not silently omit such modules — include them with the flag so the gap is visible.

### 4. Run Mode 2 — Aggregate build

After all per-module guides are written, immediately run **Mode 2** to assemble `<target>/sdcorejs-user-guide.md` from the full set of per-module guides. Follow all Mode 2 steps (assemble, frontmatter, coverage summary, pandoc export offer).

### 5. Coverage section — "reverse-engineered" note

Because Mode 3 targets legacy projects, there is typically no approved spec or PRD. In the `## Coverage vs yêu cầu` section of each module guide, apply the **Mode 4 "No spec or PRD"** path (see Mode 4 §6) and add this note at the top of the table:

```markdown
> Reverse-engineered — no spec/PRD. Coverage is best-effort from code harvest.
```

**Exception:** if `<target>/.sdcorejs/prd/<feature>.md` exists for a given module, load that PRD and apply the full **Mode 4** comparison (map each criterion, render status ✅ / ⚠️ / ❌, update frontmatter `coverage` counts). In that case omit the "no spec/PRD" note and use the standard PRD-coverage table instead.

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
