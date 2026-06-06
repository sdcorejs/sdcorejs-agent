---
name: sdcorejs-write-plan
description: Use AFTER `sdcorejs-review-spec` has approved the spec, BEFORE the track-specific write-code orchestrator runs (`angular-write-code` / `nextjs-write-code` / future `nestjs-write-code`). Writes a numbered file-by-file plan to the chat (and optionally to a plan file under `.sdcorejs/plans/<track>/`) for the user to review and confirm. No code is written here. Hands off to `sdcorejs-review-plan` for user approval, which then snapshots via `orchestration/auto-plans` and dispatches `<track>-write-code`. Triggers - "lên kế hoạch", "plan", "show me steps before coding", "kế hoạch trước khi code", "draft a plan". Applies to angular, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Glob, Grep, Bash
---

# 05 — Write Plan (Cross-Track)

## Purpose
Translate an approved spec into a concrete, ordered, file-by-file plan that the user reviews and approves before any code is generated. The plan is the contract — the track's `write-code` orchestrator executes exactly what was approved.

A spec answers "what + why". A plan answers "which file, in what order".

## When to use
- After `sdcorejs-review-spec` has confirmed approval of a spec file
- BEFORE invoking any `<track>-write-code` orchestrator
- When the user explicitly says "plan first", "lên kế hoạch", "draft a plan", "kế hoạch trước khi code"

If the spec is missing items, route back to `sdcorejs-clarify-requirements` or `sdcorejs-write-spec` instead.

## Process

### Step 0 — Detect target track
```bash
TARGET_ROOT=$(git rev-parse --show-toplevel)
cd "$TARGET_ROOT"
# (same detection block as 01-brainstorm / 02-clarify / 03-write-spec)
```

### Step 1 — Load the approved spec
Read the spec file passed in by `sdcorejs-review-spec` (path under `.sdcorejs/docs/<TRACK>/*-spec.md`). Extract:
- Scope summary
- File structure section (this becomes the backbone of the plan)
- Acceptance criteria (each must map to ≥1 plan task)

### Step 2 — Load track-specific phase grouping
Read `_refs/sdlc/<TRACK>.md` (the **Plan** section). Each track defines:
- Standard phase order (e.g. angular: module bootstrap → entity model/service → routes/components → tests; nestjs: schema → entity → repository → service → controller → tests; nextjs: init → theme → i18n → pages → SEO → contact → caching → content quality)
- Verification commands (track-specific `npm` scripts, smoke commands)

### Step 3 — Glob-check for path conflicts
Before writing the plan, `Glob` the target project to verify that every CREATE path doesn't already exist (surface conflicts) and every EDIT path does exist (surface phantom paths).

### Step 4 — Mirror previous approved plans
Read the latest 1-3 approved plans in `.sdcorejs/plans/<TRACK>/` (if any) and mirror their granularity BEFORE drafting. The user has a preferred phase grouping and verification style — match it so the draft lands right the first time.

### Step 5 — Draft the plan from the template

```markdown
## Scope (recap from spec)
<2-4 lines matching the spec's "Problem & Goals" + key inputs>

## Files to create / edit

### Phase 1 — <track-relevant phase>
1. CREATE  <path>  — <1-line intent>
2. CREATE  <path>  — <1-line intent>
3. EDIT    <path>  — <1-line intent>

### Phase 2 — <track-relevant phase>
4. CREATE  <path>  — <1-line intent>
...

### Phase N — Tests
N+1. CREATE  <path>  — <1-line intent>
...

## Verification
<Track-specific commands from `_refs/sdlc/<TRACK>.md`>
- e.g. angular: `npm run build-dev`, `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts`
- e.g. nextjs: `npm run build`, `npm run check:i18n`, `npm run check:content`
- e.g. nestjs: `npm run build`, `npm run test:e2e`, `npm run typeorm migration:run`
- Manual smoke route (track-specific)

## Confirm
Plan này có phù hợp không?
- "OK, generate" → invoke `sdcorejs-review-plan` (which then dispatches the track's write-code)
- "Đổi step <N>" → revise this plan
- "Quay lại clarify" → invoke `sdcorejs-clarify-requirements`
```

### Step 6 — Hand off to `sdcorejs-review-plan`

## Rules

### MUST DO
- Recap scope in 2-4 lines before listing files — the user must see we agree on what was decided
- Number every file step; show absolute path under the target project, not the agent repo
- Mark each step as CREATE or EDIT explicitly
- Group steps by phase per `_refs/sdlc/<TRACK>.md`
- Include verification steps with exact commands
- Each acceptance criterion from the spec must map to ≥1 plan task
- End with an explicit confirm / amend / revert prompt
- Match the user's language (VI/EN)
- Surface path conflicts found in Step 3 — do NOT silently overwrite

### MUST NOT
- Write any code in this skill — only the plan
- Invoke `<track>-write-code` before the user confirms via `sdcorejs-review-plan`
- Invent file paths that don't match the conventions in `_refs/sdlc/<TRACK>.md`
- Skip verification steps to keep the plan short
- Hide trade-offs (if the user picked a heavy option but the spec is small, call it out)
- Bundle >5 files into one step without a verification checkpoint

## Hand-off
After writing the plan, hand off to `sdcorejs-review-plan`. On user approval there:
1. `orchestration/auto-plans` snapshots the approved plan to `.sdcorejs/plans/<TRACK>/`
2. The track's write-code orchestrator is invoked with the approved plan as input
3. After generation, the full tail-call chain runs (sdcorejs-test → sdcorejs-review → repair-loop → comment-code → verify-before-done → branch-ready → auto-docs → auto-task-tracker → memories)

## Anti-patterns
- Bullet lists without numbers (user can't reference "step 7")
- Plans without a verification section (user has no way to confirm correctness)
- Skipping the explicit confirm prompt (agent assumes consent)
- Mixing planning with code generation in one response
- Re-asking clarify questions here — those belong in `sdcorejs-clarify-requirements`
- Skipping the `sdcorejs-review-plan` gate and jumping straight to `<track>-write-code`

## Related skills
- `_refs/sdlc/<TRACK>.md` — track-specific phase grouping + verification commands
- `sdcorejs-review-spec` — runs before this (approves the spec)
- `sdcorejs-review-plan` — runs after this (gates on user approval)
- `orchestration/auto-plans` — MANDATORY tail-call on review-plan approval
- `<track>-write-code` — executes the approved plan

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
