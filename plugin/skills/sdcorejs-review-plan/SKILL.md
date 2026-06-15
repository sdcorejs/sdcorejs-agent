---
name: sdcorejs-review-plan
description: Use AFTER `sdcorejs-write-plan` writes a step-by-step plan. Presents the plan to the user for review BEFORE code is generated. Acts as the user-approval gate before `<track>-write-code` runs; on approval, fires `orchestration/auto-snapshot` (PLAN mode) to persist the snapshot and dispatches the track's write-code orchestrator. Triggers - automatic after `sdcorejs-write-plan`; or user says "review plan", "check the plan", "review the plan", "approve the plan", "approve plan". Applies to angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Read, Edit, Glob
---

# 06 — Review Plan (Cross-Track)

## Purpose
Hold the user-approval gate between planning (`sdcorejs-write-plan`) and code generation (`<track>-write-code`). The plan is the contract: once approved, the write-code orchestrator executes exactly what it says, no more, no less.

Catching missing steps or wrong file paths here is far cheaper than catching them mid-generation. This skill is fully track-agnostic — only the dispatched write-code orchestrator differs.

## When to use
- Automatically right after `sdcorejs-write-plan` writes a plan
- When the user says "review plan", "check the plan", "review the plan", "approve the plan", "approve plan", "let's verify the plan"

## Process

> **STOP — approval gate.** This skill BLOCKS code generation. After presenting the plan summary (step 3), you MUST wait for an explicit affirmative ("OK", "approve", "go ahead", "proceed", or localized equivalents) before invoking `orchestration/auto-snapshot` (PLAN mode) or dispatching `<track>-write-code`. Silence or absence of objection is NOT approval. Never start a write-code task — not even step 1 — while the plan is still under review.

### 1. Re-read the plan
Either re-read from the in-chat response (if `sdcorejs-write-plan` rendered it inline) or from the plan file if one was written. Re-read it as if you've never seen it.

### 2. Self-review (before showing to user)
Run the checklist below silently. If ANY item fails, edit the plan to fix it BEFORE presenting.

**Self-review checklist:**
- [ ] No `TBD`, `TODO`, `???`, `<...>` placeholder text — every file path is concrete
- [ ] Every task has: exact file path + CREATE/EDIT marker + 1-line intent
- [ ] Tasks are numbered (so the user can reference "step 7")
- [ ] Steps are grouped by phase per `_refs/sdlc/<TRACK>.md`
- [ ] Verification section is present with exact commands
- [ ] Each acceptance criterion from the spec maps to ≥1 numbered task
- [ ] Frequent commit boundaries: no single task that bundles >5 files without a verification step
- [ ] No CREATE path conflicts with an existing file in the target project; no EDIT path points to a non-existent file
- [ ] Test-coverage tasks are present and match the agreed coverage level
- [ ] Track-specific final-step references look correct (see `_refs/sdlc/<TRACK>.md`)

### 3. Render summary to user
Present a CONCISE phase + verification summary, not the full numbered list (user already saw that in `sdcorejs-write-plan`).

```
Plan ready: <N> tasks across <M> phases.

Phases:
- Phase 1 (<track-relevant phase>): tasks 1-K
- Phase 2 (<track-relevant phase>): tasks K+1...
- ...
- Phase N (tests): tasks ...

Verification:
- <track-specific command 1>
- <track-specific command 2>
- Manual: <track-specific smoke route>

Do you approve this plan?
  - "OK" → I will run `<track>-write-code` according to the plan
  - "change step <N>" → I will update it and present it again
  - "cancel" → stop without generating code

Translate this prompt at runtime.
```

### 4. Handle response

#### Approve ("OK", "approve", "go ahead", "proceed", "generate", or localized equivalents)
1. IMMEDIATELY invoke `orchestration/auto-snapshot` in PLAN mode (write mode) to persist the approved plan snapshot to `<target>/.sdcorejs/plans/<TRACK>/<YYYY-MM-DD-HH-mm>-<topic>.md`
2. Dispatch the right track's write-code orchestrator with the approved plan as input:
   - `angular` → `sdcorejs-angular`
   - `nextjs` → `sdcorejs-nextjs`
   - `nestjs` → `sdcorejs-nestjs` (when available; until then ASK user)

#### Request changes ("change step N", "change", "amend", "change")
1. Edit the plan
2. Re-run self-review
3. Re-present (loop max 3 rounds; if still not approved, suggest going back to `sdcorejs-write-plan` or `sdcorejs-review-spec`)
4. DO NOT invoke `orchestration/auto-snapshot` — only an approved plan gets snapshotted

#### Abort ("cancel", "stop", or localized equivalents)
1. Stop the workflow
2. DO NOT invoke `orchestration/auto-snapshot`
3. Optionally invoke `orchestration/memories` if the abort surfaced a durable lesson ("user prefers smaller batches; plan was too big")

## Rules

### MUST DO
- Run the self-review checklist BEFORE showing the plan to the user
- Fix every failing checklist item before presenting
- Show a concise phase + verification summary, not the full numbered list
- Wait for an explicit affirmative
- Pass the approved plan as the input contract to `<track>-write-code` — code generation must match the plan task-for-task
- Match the user's language

### MUST NOT
- Skip review on "simple" tasks. Even a 3-step plan deserves the gate — the time cost is seconds, the benefit is consistent rigor.
- Proceed to `<track>-write-code` without explicit user approval
- Let the write-code orchestrator start before the user says "OK", "approve", or equivalent
- Modify the plan after handing off — if late changes are needed, abort and re-plan
- Treat the absence of objection as approval

## Anti-patterns
- "Plan looks good, generating now" — that's the agent approving, not the user. Wait.
- Showing the full numbered task list again — the user already saw it; show only the deltas/summary.
- Letting code generation start mid-review ("while you're reviewing, I'll start step 1") — the gate is binary, not progressive.
- Skipping review when the user previously approved a related plan — every plan needs its own gate.
- Auto-approval based on confidence — confidence is the agent's, approval must be the user's.

## Related skills
- `_refs/sdlc/<TRACK>.md` — track-specific phase + verification conventions
- `sdcorejs-write-plan` — runs immediately before
- `orchestration/auto-snapshot` (PLAN mode) — MANDATORY tail-call on approval
- `<track>-write-code` — runs after auto-snapshot
- `sdcorejs-review-spec` — sibling gate one stage earlier
- `orchestration/memories` — capture durable lessons learned during review

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
