# Write User Guide Reference

## Contents

- [Purpose](#purpose)
- [Modes](#modes)
- [Out Of Scope](#not)
- [Per-module Incremental Mode](#mode-1--per-module-incremental-write-code-tail)
- [Coverage Versus Requirements](#mode-4--coverage-vs-requirements-runs-inside-mode-1--2)
- [Rules](#rules)
- [Related References](#related)
- [Aggregate Build And Export](#mode-2--aggregate-build--export)
- [Legacy Reverse-engineering](#mode-3--legacy-reverse-engineer)

Internal reference loaded by `sdcorejs-documentation` in `write-user-guide`
mode. This file is not a dispatchable skill.

## Purpose

Generate and maintain **evergreen end-user feature references** for generated SDCoreJS apps. Unlike other `.sdcorejs/` artifacts, this reference produces documentation for *end users* (or QA / PMs), not for the next AI session.

| Artifact | Question answered | Lifecycle |
|---|---|---|
| **`.sdcorejs/documentation/user-guides/<module>.md`** (this reference) | "<localized text>" | idempotent change-scoped artifact with current provenance |
| **Verified UI evidence** | "How were guide screenshots captured and verified?" | reuse the target runner; link evidence through `artifact_context` |
| **`.sdcorejs/documentation/sdcorejs-user-guide.md`** (aggregate, Mode 2) | "<localized text>" | rebuilt from per-module guides on demand |
| `.sdcorejs/docs/<track>/*.md` (`auto-docs`) | "What durable decisions/evidence belong to this change?" | immutable change-scoped execution records |
| `.sdcorejs/summary.md` (`sdcorejs-explore`) | "What IS this project" | one canonical project brief |

Templates live in `_refs/shared/user-guide-template.md`. Per-module guides go to `<target>/.sdcorejs/documentation/user-guides/<module>.md`; the aggregate goes to `<target>/.sdcorejs/documentation/sdcorejs-user-guide.md`. Both are generated artifacts and are idempotently overwritten.

## Modes

| # | Mode | When | Trigger |
|---|---|---|---|
| 1 | **Per-module incremental** | write-code tail chain (auto), or manual for one module | end of write-code / `auto-docs`; "write user guide for module X" |
| 2 | **Aggregate build** | ship a large feature, export to DOCX/PDF, manual | "build aggregate user guide", "export user guide docx/pdf", `sdcorejs-ship` |
| 3 | **Legacy reverse-engineer** | existing project, no spec, read-first | "read the whole project and write the user guide", "write user guide from legacy code" |
| 4 | **PRD-coverage compare** | runs inside Mode 1 & 2 automatically | "compare against PRD / requirement coverage"; always fires when a spec or PRD exists |

## Not

- Do NOT duplicate `_refs/orchestration/tail/auto-docs.md` (change-scoped
  execution records) or `sdcorejs-explore` (project brief). READ
  `.sdcorejs/summary.md` as context when relevant.
- Mode 3 (Legacy) MUST delegate discovery to `sdcorejs-explore` — do NOT re-implement route/permission globbing here.
- All artifacts write to the **TARGET project**, never to the `sdcorejs-agent` repo.

---

## Mode 1 — Per-module incremental (write-code tail)

### 1. Trigger

**Automatic** at the end of an approved write-code tail (tail chain:
`auto-docs` → **`write-user-guide` Mode 1**), for every module in the current
change.

Also triggered **manually**: "write user guide for module X", "update user guide", "user guide module <name>", or localized equivalents.

For write-code tails, this automatic trigger is gated by
`_refs/documentation/gate.md`:

- If the corresponding per-module guide is missing for a new feature, create it
  only when the gate returned `user_guide=create` or the current request
  explicitly asked for a user guide.
- If the guide already exists, update it only when the gate returned
  `user_guide=update`, saved preferences authorize updates, or the current
  request explicitly asked for an update.

### 2. Harvest the touched module

Identify the `<module>` name from current change context and target paths. Then
probe the target project for routes, permissions, entity fields, and screens.

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

Write `<target>/.sdcorejs/documentation/user-guides/<module>.md` from the per-module template in `_refs/shared/user-guide-template.md`.

Fill the YAML frontmatter:
- `artifact_id`, `artifact_kind: documentation-asset`, `change_ref`,
  `source_spec`, `source_plan`, `commit_policy: with-change`, and
  `owner: sdcorejs-documentation` from Artifact Lifecycle;
- `module` — module slug
- `title` — human-readable feature name (session language preferred; English fallback)
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

Fill the body sections using the harvested data:
1. **Overview** — plain-language description of what the module does for the user.
2. **Screens and tasks** — one subsection per detected screen, with user tasks, required permission, and main fields/buttons. Include `![<screen>](images/<module>-<screen>.png)` only when that file already exists or the screenshot was successfully captured during this run; otherwise omit the image markdown and rely on the screenshot checklist.
3. **Permission table** — table of all permission codes with their action and typical role.
4. **Data reference** — table of entity fields (name / type / required / constraints) from the `@Column` / Zod harvest.
5. **Special actions** — workflow transitions, bulk actions, custom side-effects (omit section if none found).
6. **Core UI components used** (**angular only**) — table of every `@sdcorejs/angular` component/service/directive the module actually imports/uses, each with a one-line feature-specific purpose (the same table the orchestrator showed the user after generating). Harvest from the templates/components (`sd-*` tags, `inject(Sd*Service)`, `*sd*` directives). Omit this section for nestjs/nextjs.
7. **Coverage vs requirements** — filled by Mode 4 (see below).
8. **Illustration images — capture checklist** — `- [ ] images/<module>-<screen>.png`
   for every detected screen, plus the required `ui-evidence-capture` scenario
   inputs.

**Idempotent after approval:** this file is a generated artifact — after the
gate has approved creation/update, overwrite it. Do not append to an existing
file.

### 4. Run Mode 4 — Coverage (always)

After rendering the body sections, immediately run **Mode 4** to fill the `## Coverage vs requirements` table and update the `coverage` frontmatter counts. See Mode 4 below.

### 5. Request verified UI evidence

Documentation owns the guide and image placement; it does not invent a browser
runner or certify screenshots by file existence alone.

1. Inspect the target project's existing browser runner, base URL key
   references, persona catalog, and screenshot fixture.
2. When a required image is missing or stale, call
   `sdcorejs-test (ui-evidence-capture)` with route, target state, logical
   persona, output path, and current `associated_HEAD_or_diff`.
3. Reuse the existing runner and its real-ui or approved manual-real-ui login.
   Do not install Playwright, generate a standalone bare-browser script, invent
   a localhost fallback, or bypass authentication.
4. Consume `test_context`, `test_status`, `test_evidence.captures`,
   `ui_capture_context`, and `artifact_context`.
5. Link an image only when the capture is verified: target state visible,
   login redirect absent, access denied absent, PII screening passed, file hash
   present, and provenance current.

Keep the `## Illustration images` checklist. For each missing, blocked, or stale
image, record its requested state and blocker without a broken markdown link.
Login pages, access-denied pages, blank/error states, unverified manual files,
and diagnostic failure screenshots cannot satisfy the checklist.

Verified guide images are `documentation-asset` entries in
`artifact_context.required_with_change` when referenced by the changed guide.
Failure captures, traces, videos, and auth state remain local-only.

---

## Mode 4 — Coverage vs requirements (runs inside Mode 1 & 2)

### Purpose

Map every requirement from the approved spec / PRD to either ✅ documented & implemented, ⚠️ partial, or ❌ missing. Fills the guide's `## Coverage vs requirements` table and the `coverage` frontmatter block.

### 1. Load the spec

```bash
# Prefer spec scoped to this module (filename contains module slug)
Glob: <target>/.sdcorejs/docs/<track>/*-<module>*-spec.md
Glob: <target>/.sdcorejs/specs/<track>/*-<module>*-spec.md
# If no module-scoped match: select a related change-scoped execution record
# by change_ref/source metadata and resolve its spec_refs field.
# Last fallback: most-recent *-spec.md in the track docs dir regardless of module.
# Extract "## Acceptance criteria" section from the resolved spec file.
```

### 2. Load the PRD (optional)

```bash
# External PRD if it exists
Glob: <target>/.sdcorejs/prd/<feature>.md
Read: extract requirement list / acceptance criteria
```

Also load matching task-level requirement records when present:

```bash
Glob: <target>/.sdcorejs/documentation/requirements/*.md
# Prefer files whose id/title/source refs match the module, TASKID, change_ref,
# source_spec, source_plan, or explicit user scope.
```

If spec, PRD, and requirement records exist, merge their criteria (deduplicate by intent).

### 3. Map each requirement

For every criterion, determine its status by checking the guide's populated sections:
- **✅ met** — the guide's `## Screens and tasks`, `## Permission table`, or `## Data reference` explicitly covers it AND the harvest found the corresponding code artefact (route / permission / field / action).
- **⚠️ partial** — the criterion is partially described or the implementation evidence is incomplete (e.g. field exists but no validation documented, or screen exists but permission guard missing).
- **❌ missing** — no evidence in code or guide; include a short gap note.

### 4. Render the coverage table

```markdown
## Coverage vs requirements
| # | Requirement (spec/PRD) | Status | Documented in section |
|---|---|---|---|
| 1 | <criterion text> | ✅ met | Screens and tasks |
| 2 | <criterion text> | ⚠️ partial | <gap note> |
| 3 | <criterion text> | ❌ missing | — |
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
## Coverage vs requirements
> No spec/PRD was found, so the coverage table is filled best-effort from code.

| # | Feature detected from code | Status | Note |
|---|---|---|---|
| 1 | <harvested route / permission / screen> | ✅ met | from code |
```

---

## Rules

### MUST DO
- Render from `_refs/shared/user-guide-template.md` — do NOT hard-code the template inline.
- **Creation approval required** — when `<target>/.sdcorejs/documentation/user-guides/<module>.md` does not exist for a new feature, create it only after `_refs/documentation/gate.md` returns `user_guide=create` or the current request explicitly asks for it.
- **Idempotent overwrite after approval** — once creation/update is approved, `<target>/.sdcorejs/documentation/user-guides/<module>.md` is a generated artifact; overwrite it, never append.
- Write to the **TARGET project** (resolve `TARGET_ROOT=$(git rev-parse --show-toplevel)` from the user's CWD; never write into the `sdcorejs-agent` repo). **Guard:** if `TARGET_ROOT` basename matches `sdcorejs-agent`, or the directory contains no `src/`, `frontend/`, or `package.json` at its root (no evidence of an app project), **abort and ask** the user to provide the target project path explicitly — do not write user guides into the agent repo.
- **Runtime-localized** — section headings and prose use the user's session language; field names, permission codes, and route paths stay English.
- Emit the capture checklist and request `ui-evidence-capture` only for required
  missing/stale images. Reuse the target project's existing runner.
- Never emit markdown image links for missing or unverified files. Keep their
  checklist entries blocked until evidence is current.
- Record lifecycle/source metadata, `git_head`, and `generated_at` in every
  frontmatter block. HEAD is provenance, not the sole freshness/lifecycle key.

### MUST NOT
- Duplicate `_refs/orchestration/tail/auto-docs.md` (change-scoped execution
  records) — the user guide is a timeless end-user reference.
- Duplicate `sdcorejs-explore` (project brief) — READ `summary.md` as context, never replace it.
- Claim screenshots were captured or verified without current
  `ui_capture_context` and passing assertions.
- Start or modify the target app runtime unless the user explicitly asked for
  that exact action.
- Write any artifact into the `sdcorejs-agent` repo (the agent repo holds skills, not project content).
- Invent routes, permissions, or field names not found in the harvest — prefer "<localized text>" over fabrication.

## Related

- `_refs/shared/user-guide-template.md` — per-module + aggregate templates + pandoc export command
- `sdcorejs-explore` — discovery engine used by Mode 3 (legacy reverse-engineer)
- `_refs/orchestration/tail/auto-docs.md` — change-scoped execution-record tail
  (distinct from evergreen guides)
- `sdcorejs-explore` — canonical project brief (read as context before writing guides)
- `sdcorejs-ship` — triggers Mode 2 (aggregate build) as part of the ship checklist

## Mode 2 — Aggregate build + export

### 1. Trigger

**Automatic** when `sdcorejs-ship` runs (large-feature or release mode).

Also triggered **manually**: "build aggregate user guide", "export user guide docx/pdf", "build user guide", or any explicit request to produce the aggregate or export to DOCX/PDF.

### 2. Refresh stale guides before assembling

Each per-module guide records lifecycle/source metadata plus `git_head`.
Before assembling, compare its `change_ref`, source spec/plan, target paths,
current relevant diff, and capture evidence. `git_head` is an additional
provenance signal:

```bash
CURRENT_HEAD=$(git -C <target> rev-parse HEAD)
```

Refresh a guide when related source/requirements/captures changed or its
relationship metadata is stale. A different `git_head` caused only by unrelated
changes does not force a refresh; a matching `git_head` does not prove the
guide/capture is current.

This step prevents the aggregate from silently embedding stale module guides written before the latest commits.

### 3. Assemble the aggregate

Glob all per-module guides (after step 2 has refreshed any stale ones):

```bash
Glob: <target>/.sdcorejs/documentation/user-guides/*.md
# Read each file; extract YAML frontmatter (module, title, coverage) + body (strip frontmatter block)
```

Build `<target>/.sdcorejs/documentation/sdcorejs-user-guide.md` from the **aggregate template** in `_refs/shared/user-guide-template.md`:

1. **YAML frontmatter** — set Artifact Lifecycle metadata, `title` (project
   name from relevant context / ask if absent), `generated_at`, `git_head` as
   provenance, `modules` (sorted), and summed `coverage`.
2. **`## Table of contents`** — numbered list linking to each `## <Module>` section anchor.
3. **`## System Overview`** — 1-2 sentences: what the system does, who it is for (read from `.sdcorejs/summary.md` if it exists; otherwise write best-effort from module titles).
4. **One `## <Module>` section per file** — insert each module's body content verbatim after stripping the YAML frontmatter block (the `---…---` header). Preserve all headings (shift level if needed so they sit below the `##` module heading).
5. **`## Coverage vs requirements summary`** — global summary table; sum each module's `coverage` frontmatter counts:

```markdown
## Coverage vs requirements summary
| Module | met ✅ | partial ⚠️ | missing ❌ |
|---|---|---|---|
| <module1> | <met> | <partial> | <missing> |
| **Total** | <sum_met> | <sum_partial> | <sum_missing> |
```

Update the aggregate frontmatter `coverage` block with the summed totals.

**Idempotent:** overwrite `<target>/.sdcorejs/documentation/sdcorejs-user-guide.md` unconditionally — never append to an existing file.

### 4. Export to DOCX / PDF

After writing the aggregate, emit the pandoc commands from `_refs/shared/user-guide-template.md`:

```bash
# DOCX (preferred — supports embedded scaffold images):
pandoc <target>/.sdcorejs/documentation/sdcorejs-user-guide.md \
  -o <target>/.sdcorejs/documentation/sdcorejs-user-guide.docx \
  --resource-path=<target>/.sdcorejs/documentation/user-guides

# PDF (alternative):
pandoc <target>/.sdcorejs/documentation/sdcorejs-user-guide.md \
  -o <target>/.sdcorejs/documentation/sdcorejs-user-guide.pdf \
  --resource-path=<target>/.sdcorejs/documentation/user-guides
```

**The skill does NOT run pandoc or start the target app unless explicitly
asked.** Before export, it reports missing/stale images and requests
`sdcorejs-test (ui-evidence-capture)` for those assets using the target
project's existing runner. Export only verified images; blocked images remain
unlinked checklist items.

When invoked from `sdcorejs-ship`: **always rebuild** the aggregate. **Ask before emitting the pandoc export command** (large-feature ships may not need DOCX every time):
> "<localized text>"

When triggered manually (e.g. "export user guide docx" or localized equivalents): emit the export command immediately without asking.

---

## Mode 3 — Legacy reverse-engineer

### 1. Trigger

**Manual only.** Fire this mode when the user says:
- "read the whole project and write the user guide"
- "write user guide for a legacy project"
- "reverse-engineer user guide"
- or any equivalent request to produce guides for an existing/legacy project
  where no spec, plan, or current change context exists.

### 2. Harvest the whole project via `sdcorejs-explore`

Delegate ALL discovery to `sdcorejs-explore` (read-only architecture-discovery skill). Do NOT re-implement route/permission/entity/screen globbing here.

```
Invoke: sdcorejs-explore
Mode:    code-map with the Documentation harvest add-on
Purpose: full project inventory — modules/libs, routes + controllers, permission codes,
         screens, shared components, base classes, path conventions
Output:  module list + per-module facts used as the harvest basis for step 3
```

If the `sdcorejs-explore` output lacks a `Documentation harvest` section, rerun
`sdcorejs-explore (code-map mode)` and explicitly request the documentation
harvest add-on. If a module still has unresolved route, permission, entity, or
screen data after that harvest, keep the module and mark missing values as
`unknown - fill manually`; do not probe from this reference.

### 3. Render per-module guides

For **each module** discovered by `sdcorejs-explore`, render `<target>/.sdcorejs/documentation/user-guides/<module>.md` from the per-module template in `_refs/shared/user-guide-template.md`, best-effort from the harvested facts.

Fill frontmatter and all body sections exactly as in Mode 1, Step 3 (including the angular-only Core UI components table), using only data found in the harvest — **do NOT invent** routes, permissions, field names, or Core UI components not present in the code. Where a value could not be resolved, write `<localized text>` rather than fabricating.

**FLAG unresolved modules explicitly.** For every module where routes and/or permission codes could NOT be resolved from the harvest, add a prominent notice at the top of that module's guide:

```markdown
> ⚠️ **Harvest incomplete** — routes and/or permission codes could not be resolved for this
> module (the project may not follow SDCoreJS conventions). The sections below are best-effort;
> a developer should verify and fill in the missing details manually.
```

Do not silently omit such modules — include them with the flag so the gap is visible.

### 4. Run Mode 2 — Aggregate build

After all per-module guides are written, immediately run **Mode 2** to assemble `<target>/.sdcorejs/documentation/sdcorejs-user-guide.md` from the full set of per-module guides. Follow all Mode 2 steps (assemble, frontmatter, coverage summary, pandoc export offer).

### 5. Coverage section — "reverse-engineered" note

Because Mode 3 targets legacy projects, there is typically no approved spec or PRD. In the `## Coverage vs requirements` section of each module guide, apply the **Mode 4 "No spec or PRD"** path (see Mode 4 §6) and add this note at the top of the table:

```markdown
> Reverse-engineered — no spec/PRD. Coverage is best-effort from code harvest.
```

**Exception:** if `<target>/.sdcorejs/prd/<feature>.md` exists for a given module, load that PRD and apply the full **Mode 4** comparison (map each criterion, render status ✅ / ⚠️ / ❌, update frontmatter `coverage` counts). In that case omit the "no spec/PRD" note and use the standard PRD-coverage table instead.
