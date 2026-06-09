---
name: sdcorejs-auto-specs
description: MANDATORY skill that runs AUTOMATICALLY right after `04-review-spec` receives explicit user approval. Persists the approved spec into the target project under `.sdcorejs/specs/<track>/YYYY-MM-DD-HH-mm-<topic>.md` so future sessions build a corpus of user-approved specs and learn the user's preferred structure, depth, and conventions. Also runs in READ-ONLY mode at session start to load the latest 3 approved specs as style references for `03-write-spec`. Triggers - immediately after `04-review-spec` returns an explicit affirmative ("OK", "approve", "go", "looks good"), AND at session start in a target project. Applies to angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Read, Write, Bash, Glob
---

# Auto-Specs — Approved-Spec Corpus

## Purpose
`auto-docs` captures what happened in a session; `auto-specs` captures the **decision contract** the user actually approved. By snapshotting every approved spec into `.sdcorejs/specs/<track>/`, future sessions can:
- Mirror the user's preferred spec structure (section order, depth, level of formality)
- Reuse phrasing conventions for goals / non-goals / acceptance criteria
- Detect drift when a new request contradicts an approved precedent

Without this corpus, `03-write-spec` regenerates a generic spec every time and the user has to re-correct the same style choices.

Shared across SDCoreJS tracks (`angular`, `nestjs`, `nextjs`). Substitute `<track>` with the active track.

## When invoked

### Auto-trigger right after `04-review-spec` approval
The agent MUST run this skill (write mode) IMMEDIATELY after `04-review-spec` receives explicit user approval, BEFORE handing off to `05-write-plan`. The handoff to `05-write-plan` waits for this skill to finish.

Approval signals that count: "OK", "approve", "go", "resume", "looks good", or localized equivalents.
Approval signals that DO NOT count: silence, "thanks", "got it", "noted" — those do not fire this skill.

If the user aborts ("cancel", "stop", "cancel") or requests changes ("change", "change"), DO NOT write — the spec is not yet a decision contract.

### Session-start ritual (read-only mode)
At session start in a target project, the agent MUST:
1. Resolve `TARGET_ROOT = git rev-parse --show-toplevel` from user CWD
2. Glob `<TARGET_ROOT>/.sdcorejs/specs/<track>/*.md` for the active track
3. Read the latest 3 files (filename timestamp sorts naturally) — frontmatter + section headers only, not full bodies
4. Load full body on demand when `03-write-spec` is about to author a new spec — use the latest entries as style reference
5. Do NOT write a new file in read mode

## Output path

```bash
# Resolve target project root (NOT the sdcorejs-agent repo!)
TARGET_ROOT=$(git rev-parse --show-toplevel)

# Pick the active <track>: angular | nestjs | nextjs
TRACK=angular

# Ensure folder exists (note the leading dot in .sdcorejs/)
mkdir -p "$TARGET_ROOT/.sdcorejs/specs/$TRACK"

# Filename pattern: YYYY-MM-DD-HH-mm-<kebab-topic>.md
FILE="$TARGET_ROOT/.sdcorejs/specs/$TRACK/2026-05-17-09-30-add-product-entity.md"
```

The `<kebab-topic>` matches the topic slug used by `auto-docs` for the same feature when possible, so a `docs/<topic>.md` and `specs/<topic>.md` pair is easy to find.

## Output content template

```markdown
---
name: <kebab-topic>
description: <one-line hook so future sessions can decide whether to load this spec as a style reference>
approvedAt: 2026-05-17T09:30+07:00
approvedBy: <user identifier from git config user.email or session context>
track: angular
module: catalog            # optional — empty for cross-cutting work
entity: product            # optional
sourceSpecPath: .sdcorejs/docs/<track>/2026-05-17-09-20-add-product-entity-spec.md   # path to the draft auto-docs entry, if any
---

# <Title> — Approved Spec

> Snapshot of the spec the user approved at the `04-review-spec` gate. The body below is the exact contract `05-write-plan` consumed. Do not edit by hand — re-author via `03-write-spec` + `04-review-spec` if the contract changes.

## Goals
<verbatim from the approved spec>

## Non-goals
<verbatim>

## Architecture
<verbatim>

## Acceptance criteria
<verbatim, numbered>

## Decisions captured during review
- <what the user changed during 04-review-spec iterations — captures the user's STYLE, e.g. "Asked for non-goal section to mention legacy CRM API exclusion explicitly", "Pushed acceptance criteria from prose to numbered list">

## Skill provenance
03-write-spec → 04-review-spec (approved on attempt <N> / 3)
```

The "Decisions captured during review" section is the highest-value field — it is the **delta between the agent's first draft and what the user actually approved**, which is the strongest style signal we can persist.

## How `03-write-spec` consumes this corpus

When `03-write-spec` is about to author a new spec, after reading the active project's spec template:
1. Glob `<TARGET_ROOT>/.sdcorejs/specs/<track>/*.md`
2. Read the latest 3 by filename
3. Mirror their:
   - Section order and section names
   - Level of detail in "Goals" and "Non-goals"
   - Style for acceptance criteria (numbered list vs Given/When/Then)
   - Vocabulary (e.g. user prefers "module" vs "feature", "entity" vs "domain object")
4. If a contradiction arises between corpus style and template defaults, prefer the corpus — it reflects the user's confirmed preference.

## Rules

### MUST DO
- Resolve `TARGET_ROOT` via `git rev-parse --show-toplevel`; never write to the `sdcorejs-agent` repo
- Wait for an EXPLICIT affirmative at `04-review-spec` before writing — implicit approval is forbidden
- Create the `.sdcorejs/specs/<track>/` folder if missing (leading dot required)
- Use the timestamp prefix `YYYY-MM-DD-HH-mm-` so files sort chronologically
- Always create a NEW file — never overwrite an existing approved spec
- Capture the "Decisions captured during review" section honestly — that's the durable style signal
- At session start, glob + frontmatter-only read of the latest 3 entries; load bodies only when `03-write-spec` runs

### MUST NOT
- Write the file before `04-review-spec` approval — partial-approval data poisons the corpus
- Write to `sdcorejs-agent/.sdcorejs/specs/` — auto-specs lives in the target project only
- Overwrite an earlier approved spec — they are immutable historical decisions
- Write empty bodies — if the spec was approved as-is without iteration, set "Decisions captured during review" to `(approved as drafted)` instead of leaving it blank
- Translate the spec body — match the language the user used during the review

## Cross-track usage

| Track | Output folder |
|---|---|
| Angular Portal | `.sdcorejs/specs/angular/` |
| NestJS | `.sdcorejs/specs/nestjs/` |
| Next.js | `.sdcorejs/specs/nextjs/` |

In multi-track repos, write to the track folder matching the work being specified. If unsure, ask the user before writing.

## Anti-patterns
- Writing the spec to the `sdcorejs-agent` repo
- Treating `04-review-spec` silence as approval and writing anyway — corrupts the corpus with un-approved drafts
- Skipping the "Decisions captured during review" section — without it, the corpus is just duplicate of the draft spec
- Updating an existing file when the spec changes — instead, write a new approved snapshot; history is the point
- Reading the corpus eagerly at session start (full bodies) — frontmatter only at start, bodies on demand when `03-write-spec` runs

## Pairing with auto-docs and auto-plans

| Concern | auto-docs | auto-specs | auto-plans |
|---|---|---|---|
| Captures | Per-session summary | User-approved spec contract | User-approved plan contract |
| Triggered by | End of code-writing skill | `04-review-spec` approval | `06-review-plan` approval |
| Path | `.sdcorejs/docs/<track>/` | `.sdcorejs/specs/<track>/` | `.sdcorejs/plans/<track>/` |
| Filename | `YYYY-MM-DD-HH-mm-<topic>.md` | `YYYY-MM-DD-HH-mm-<topic>.md` | `YYYY-MM-DD-HH-mm-<topic>.md` |
| Lifetime | Per session | Permanent corpus | Permanent corpus |
| Consumed by | Session-start ritual | `03-write-spec` style mirror | `05-write-plan` style mirror |
