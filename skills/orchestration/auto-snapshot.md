---
name: sdcorejs-auto-snapshot
description: MANDATORY skill that snapshots a user-APPROVED decision contract into the target project so future sessions mirror the user's style. Two modes — SPEC mode runs right after `04-review-spec` approval (→ `.sdcorejs/specs/<track>/`), PLAN mode runs right after `06-review-plan` approval (→ `.sdcorejs/plans/<track>/`). Also runs READ-ONLY at session start to load the latest 3 approved specs + plans as style references for `03-write-spec` / `05-write-plan`. (Consolidates the former `auto-specs` + `auto-plans` — same shape, one skill.) Triggers - immediately after `04-review-spec` OR `06-review-plan` returns an explicit affirmative ("OK", "approve", "go ahead", "proceed", "looks good"), AND at session start in a target project. Applies to angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Read, Write, Bash, Glob
---

# Auto-Snapshot — Approved Spec / Plan Corpus

## Purpose
`auto-docs` captures what happened in a session; **auto-snapshot captures the decision contract the user actually approved** at a gate. Persisting every approved spec/plan into `.sdcorejs/specs|plans/<track>/` lets future sessions:
- Mirror the user's preferred structure — spec section order/depth, plan task granularity + phasing + verification cadence
- Reuse phrasing/vocabulary conventions (e.g. "module" vs "feature", numbered vs Given/When/Then)
- Detect drift when a new request contradicts an approved precedent

Without this corpus, `03-write-spec` / `05-write-plan` regenerate a generic structure every time and the user re-corrects the same choices. The single most valuable field is **"Decisions captured during review"** — the delta between the agent's first draft and what the user approved, the strongest style signal we can persist.

Shared across SDCoreJS tracks (`angular`, `nestjs`, `nextjs`). Substitute `<track>` with the active track.

## The two modes

| | SPEC mode | PLAN mode |
|---|---|---|
| Fires after | `04-review-spec` approval (before `05-write-plan`) | `06-review-plan` approval (before `write-code`) |
| Captures | The WHAT — approved spec contract | The HOW — approved plan contract |
| Output dir | `.sdcorejs/specs/<track>/` | `.sdcorejs/plans/<track>/` |
| Body sections | Goals / Non-goals / Architecture / Acceptance criteria | Phases / Tasks / Verification |
| Extra frontmatter | — | `sourceSpecPath`, `taskCount`, `phaseCount` |
| Consumed by | `03-write-spec` style mirror | `05-write-plan` style mirror |

Everything else (trigger discipline, path scheme, the `Decisions captured during review` + `Skill provenance` sections, immutability, session-start read) is identical across modes.

## When invoked

### Write mode — right after an approval gate
Run IMMEDIATELY after the gate (`04-review-spec` for SPEC, `06-review-plan` for PLAN) receives explicit user approval, BEFORE the next step hands off (`05-write-plan` / `write-code` waits for this to finish).

- Approval signals that COUNT: "OK", "approve", "go", "go ahead", "proceed", "looks good", or localized equivalents.
- Signals that DO NOT count: silence, "thanks", "got it", "noted" — they do not fire this skill.
- If the user aborts ("cancel", "stop") or requests changes, DO NOT write — it is not yet a decision contract.

### Read mode — session-start ritual
At session start in a target project:
1. Resolve `TARGET_ROOT = git rev-parse --show-toplevel` from the user CWD
2. Glob `<TARGET_ROOT>/.sdcorejs/specs/<track>/*.md` AND `.sdcorejs/plans/<track>/*.md` for the active track
3. Read the latest 3 of each — frontmatter + section/phase headers only, not full bodies
4. Load a full body on demand when `03-write-spec` / `05-write-plan` is about to author — use the latest entries as style reference
5. Do NOT write in read mode

## Output path

```bash
TARGET_ROOT=$(git rev-parse --show-toplevel)   # target project, NOT the sdcorejs-agent repo
TRACK=angular                                   # angular | nestjs | nextjs
KIND=specs                                      # specs (SPEC mode) | plans (PLAN mode)
mkdir -p "$TARGET_ROOT/.sdcorejs/$KIND/$TRACK"  # leading dot required
# Filename pattern: YYYY-MM-DD-HH-mm-<kebab-topic>.md
FILE="$TARGET_ROOT/.sdcorejs/$KIND/$TRACK/2026-05-17-09-30-add-product-entity.md"
```

Keep `<kebab-topic>` matching across the paired `specs/<topic>.md` + `plans/<topic>.md` (and the `auto-docs` entry) for the same feature, so the trio lines up.

## Output content template

```markdown
---
name: <kebab-topic>
description: <one-line hook so a future session can decide whether to load this as a style reference>
approvedAt: 2026-05-17T09:30+07:00
approvedBy: <user id from git config user.email or session context>
track: angular
module: catalog            # optional
entity: product            # optional
# PLAN mode only:
sourceSpecPath: .sdcorejs/specs/<track>/2026-05-17-09-30-add-product-entity.md
taskCount: 16
phaseCount: 4
---

# <Title> — Approved <Spec|Plan>

> Snapshot of what the user approved at the `<04-review-spec|06-review-plan>` gate — the exact contract the next step consumed. Do not edit by hand; re-author via the write/review skills if the contract changes.

## (SPEC mode) Goals / Non-goals / Architecture / Acceptance criteria
<verbatim from the approved spec>

## (PLAN mode) Phases / Tasks / Verification
<verbatim from the approved plan, numbered>

## Decisions captured during review
- <what the user changed during the review iterations — the durable STYLE signal. e.g. SPEC: "Pushed acceptance criteria from prose to numbered list"; PLAN: "Split task 7 into 7a/7b", "verification per-phase not final-only". If approved as drafted, write `(approved as drafted)` — never leave blank.>

## Skill provenance
<03-write-spec → 04-review-spec | 05-write-plan → 06-review-plan> (approved on attempt <N> / 3)
```

## How `03-write-spec` / `05-write-plan` consume the corpus
Before authoring, after reading the active template (and, for plans, the approved spec): glob the matching corpus dir, read the latest 3 by filename, and mirror their section order / granularity / phasing / verification cadence / vocabulary. If corpus style contradicts template defaults, prefer the corpus — it is the user's confirmed preference.

## Rules

### MUST DO
- Resolve `TARGET_ROOT` via `git rev-parse --show-toplevel`; never write to the `sdcorejs-agent` repo
- Wait for an EXPLICIT affirmative at the gate before writing — implicit approval is forbidden
- Create the `.sdcorejs/<specs|plans>/<track>/` folder if missing (leading dot required)
- Use the `YYYY-MM-DD-HH-mm-` prefix so files sort chronologically
- Always create a NEW file — never overwrite an earlier approved snapshot (they are immutable historical decisions)
- PLAN mode: link the paired approved spec via `sourceSpecPath` — the spec/plan pair is what makes the corpus most useful
- Capture "Decisions captured during review" honestly — that's the durable style signal
- At session start, glob + frontmatter-only read of the latest 3 in each corpus; load bodies only when write-spec/write-plan runs

### MUST NOT
- Write before the gate's approval — partial-approval data poisons the corpus
- Write to `sdcorejs-agent/.sdcorejs/...` — the corpus lives in the target project only
- Overwrite an earlier snapshot when the contract changes — write a NEW file; history is the point
- Translate the body — match the language the user used during the review
- (PLAN mode) Re-derive the plan from `write-code` output after the fact — the snapshot must be what the user APPROVED, not what was eventually executed (execution deltas belong in `auto-docs`)

## Cross-track usage

| Track | SPEC folder | PLAN folder |
|---|---|---|
| Angular Portal | `.sdcorejs/specs/angular/` | `.sdcorejs/plans/angular/` |
| NestJS | `.sdcorejs/specs/nestjs/` | `.sdcorejs/plans/nestjs/` |
| Next.js | `.sdcorejs/specs/nextjs/` | `.sdcorejs/plans/nextjs/` |

In multi-track repos, write to the track folder matching the work. If unsure, ask before writing.

## Pairing with the other persistence skills

| Concern | auto-docs | auto-snapshot (SPEC) | auto-snapshot (PLAN) | memories |
|---|---|---|---|---|
| Captures | Per-session summary | Approved spec contract | Approved plan contract | Durable cross-session knowledge |
| Triggered by | End of code-writing skill | `04-review-spec` approval | `06-review-plan` approval | "remember this" / detected fact |
| Path | `.sdcorejs/docs/<track>/` | `.sdcorejs/specs/<track>/` | `.sdcorejs/plans/<track>/` | `.sdcorejs/memories/<track>/` |
| Lifetime | Per session | Permanent corpus | Permanent corpus | Permanent, updatable |
| Consumed by | Session-start ritual | `03-write-spec` style mirror | `05-write-plan` style mirror | Authoritative context at start |

## Anti-patterns
- Writing the snapshot to the `sdcorejs-agent` repo
- Treating gate silence as approval — corrupts the corpus with un-approved drafts
- Skipping "Decisions captured during review" — without it the snapshot is just a duplicate of the draft
- Updating an existing file mid-implementation — deltas belong in `auto-docs`; the snapshot stays immutable
- (PLAN mode) Omitting `sourceSpecPath` — breaks the spec/plan pairing future sessions rely on
- Reading the corpus eagerly (full bodies) at session start — frontmatter only at start, bodies on demand
