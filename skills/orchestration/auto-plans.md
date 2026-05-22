---
name: sdcorejs-auto-plans
description: MANDATORY skill that runs AUTOMATICALLY right after `06-review-plan` receives explicit user approval. Persists the approved plan into the target project under `.sdcorejs/plans/<track>/YYYY-MM-DD-HH-mm-<topic>.md` so future sessions build a corpus of user-approved plans and learn the user's preferred granularity, phasing, and verification style. Also runs in READ-ONLY mode at session start to load the latest 3 approved plans as style references for `05-plan`. Triggers - immediately after `06-review-plan` returns an explicit affirmative ("OK", "duyệt", "approve"), AND at session start in a target project. Applies to angular-portal, nestjs, nextjs.
allowed-tools: Read, Write, Bash, Glob
---

# Auto-Plans — Approved-Plan Corpus

## Purpose
`auto-specs` captures the WHAT the user agreed to; `auto-plans` captures the HOW. By snapshotting every approved plan into `.sdcorejs/plans/<track>/`, future sessions can:
- Mirror the user's preferred task granularity (do they want 5 big tasks or 25 small ones?)
- Reuse phase grouping (module bootstrap → entity → screens → tests vs. file-by-file flat)
- Match verification rigor (one final test run vs. test-per-phase)
- Detect when a new plan diverges from precedent that the user already accepted

Without this corpus, `05-plan` produces a generic structure every time and the user has to re-correct the same phasing / granularity choices.

Shared across SDCoreJS tracks (`angular-portal`, `nestjs`, `nextjs`). Substitute `<track>` with the active track.

## When invoked

### Auto-trigger right after `06-review-plan` approval
The agent MUST run this skill (write mode) IMMEDIATELY after `06-review-plan` receives explicit user approval, BEFORE handing off to `07-write-code`. The handoff to `07-write-code` waits for this skill to finish.

Approval signals that count: "OK", "duyệt", "approve", "go ahead", "tiến hành", "generate", "looks good", "đồng ý".
Approval signals that DO NOT count: silence, "thanks", "got it", "noted".

If the user aborts ("hủy", "stop", "cancel") or requests changes ("đổi step N", "sửa"), DO NOT write — the plan is not yet a decision contract.

### Session-start ritual (read-only mode)
At session start in a target project, the agent MUST:
1. Resolve `TARGET_ROOT = git rev-parse --show-toplevel` from user CWD
2. Glob `<TARGET_ROOT>/.sdcorejs/plans/<track>/*.md` for the active track
3. Read the latest 3 files — frontmatter + phase headers only, not full task lists
4. Load full body on demand when `05-plan` is about to author a new plan — use the latest entries as style reference
5. Do NOT write a new file in read mode

## Output path

```bash
# Resolve target project root (NOT the sdcorejs-agent repo!)
TARGET_ROOT=$(git rev-parse --show-toplevel)

# Pick the active <track>: angular-portal | nestjs | nextjs
TRACK=angular-portal

# Ensure folder exists (note the leading dot in .sdcorejs/)
mkdir -p "$TARGET_ROOT/.sdcorejs/plans/$TRACK"

# Filename pattern: YYYY-MM-DD-HH-mm-<kebab-topic>.md
FILE="$TARGET_ROOT/.sdcorejs/plans/$TRACK/2026-05-17-10-05-add-product-entity.md"
```

The `<kebab-topic>` should match the slug used by the paired `auto-specs` entry for the same feature when possible, so `specs/<topic>.md` and `plans/<topic>.md` line up.

## Output content template

```markdown
---
name: <kebab-topic>
description: <one-line hook so future sessions can decide whether to load this plan as a style reference>
approvedAt: 2026-05-17T10:05+07:00
approvedBy: <user identifier from git config user.email or session context>
track: angular-portal
module: catalog
entity: product
sourceSpecPath: .sdcorejs/specs/<track>/2026-05-17-09-30-add-product-entity.md   # the approved spec this plan implements
taskCount: 16
phaseCount: 4
---

# <Title> — Approved Plan

> Snapshot of the plan the user approved at the `06-review-plan` gate. The body below is the exact contract `07-write-code` executed. Do not edit by hand — re-author via `05-plan` + `06-review-plan` if the contract changes.

## Phases
- Phase 1 (module bootstrap): tasks 1-6
- Phase 2 (entity model/service): tasks 7-10
- Phase 3 (entity routes + screens): tasks 11-13
- Phase 4 (tests): tasks 14-16

## Tasks
1. CREATE src/libs/catalog/features/product/services/product.model.ts — Product DTO + SaveReq with 6 fields
2. CREATE src/libs/catalog/features/product/services/product.mock-data.ts — 25 seed rows
3. ...
<verbatim from the approved plan, numbered>

## Verification
- npm run build-dev
- npm run test -- --watch=false --include=src/libs/catalog/**/*.spec.ts
- Manual: http://localhost:4200/catalog/product

## Decisions captured during review
- <what the user changed during 06-review-plan iterations — captures the user's STYLE, e.g. "Asked to split task 7 into 7a/7b because mock-data and DTO shouldn't share a commit", "Pushed verification to per-phase instead of one final run", "Requested explicit anchor v2 task instead of folding it into screen-detail">

## Skill provenance
05-plan → 06-review-plan (approved on attempt <N> / 3)
```

The "Decisions captured during review" section is the highest-value field — it is the **delta between the agent's first draft and the plan the user actually approved**, which is the strongest planning-style signal we can persist.

## How `05-plan` consumes this corpus

When `05-plan` is about to author a new plan, after reading the approved spec:
1. Glob `<TARGET_ROOT>/.sdcorejs/plans/<track>/*.md`
2. Read the latest 3 by filename
3. Mirror:
   - Task granularity (typical task count per phase from the corpus)
   - Phase grouping pattern (does the user split tests into a final phase or interleave?)
   - Verification cadence (final-only vs per-phase)
   - File-path conventions confirmed in prior approvals
4. If a contradiction arises between corpus style and template defaults, prefer the corpus — it reflects the user's confirmed preference.

## Rules

### MUST DO
- Resolve `TARGET_ROOT` via `git rev-parse --show-toplevel`; never write to the `sdcorejs-agent` repo
- Wait for an EXPLICIT affirmative at `06-review-plan` before writing — implicit approval is forbidden
- Create the `.sdcorejs/plans/<track>/` folder if missing (leading dot required)
- Use the timestamp prefix `YYYY-MM-DD-HH-mm-` so files sort chronologically
- Always create a NEW file — never overwrite an existing approved plan
- Link to the paired approved spec via `sourceSpecPath` in frontmatter — the spec / plan pair is what makes the corpus most useful
- Capture the "Decisions captured during review" section honestly — that's the durable style signal
- At session start, glob + frontmatter-only read of the latest 3 entries; load bodies only when `05-plan` runs

### MUST NOT
- Write the file before `06-review-plan` approval — partial-approval data poisons the corpus
- Write to `sdcorejs-agent/.sdcorejs/plans/` — auto-plans lives in the target project only
- Overwrite an earlier approved plan — they are immutable historical decisions
- Translate the plan body — match the language the user used during the review
- Re-derive the plan from `07-write-code` output after the fact — the snapshot must be what the user approved, not what was eventually executed (deltas are tracked in `auto-docs` instead)

## Cross-track usage

| Track | Output folder |
|---|---|
| Angular Portal | `.sdcorejs/plans/angular-portal/` |
| NestJS | `.sdcorejs/plans/nestjs/` |
| Next.js | `.sdcorejs/plans/nextjs/` |

In multi-track repos, write to the track folder matching the work being planned. If unsure, ask the user before writing.

## Anti-patterns
- Writing the plan to the `sdcorejs-agent` repo
- Treating `06-review-plan` silence as approval and writing anyway — corrupts the corpus with un-approved drafts
- Skipping the "Decisions captured during review" section — without it, the corpus is just a duplicate of the draft plan
- Updating an existing file when the plan changes mid-implementation — instead, the deltas belong in `auto-docs`; the plan snapshot stays immutable
- Reading the corpus eagerly at session start (full bodies) — frontmatter only at start, bodies on demand when `05-plan` runs
- Omitting `sourceSpecPath` — breaks the spec/plan pairing that future sessions rely on

## Pairing with auto-docs, auto-specs and memories

| Concern | auto-docs | auto-specs | auto-plans | memories |
|---|---|---|---|---|
| Captures | Per-session summary | User-approved spec contract | User-approved plan contract | Durable cross-session knowledge |
| Triggered by | End of code-writing skill | `04-review-spec` approval | `06-review-plan` approval | "ghi nhớ" / detected durable fact |
| Path | `.sdcorejs/docs/<track>/` | `.sdcorejs/specs/<track>/` | `.sdcorejs/plans/<track>/` | `.sdcorejs/memories/<track>/` |
| Lifetime | Per session | Permanent corpus | Permanent corpus | Permanent, updatable |
| Consumed by | Session-start ritual (latest 3) | `03-write-spec` style mirror | `05-plan` style mirror | Authoritative context at session start |
