---
name: angular-portal-review-plan
description: Use after `05-plan` writes a step-by-step plan. Presents the plan to the user for review before code is generated. Acts as the user-approval gate before `07-write-code` runs. Triggers - automatic after 05-plan; or user says "review plan", "check the plan", "rà soát plan", "duyệt plan", "approve plan". Bilingual (VI/EN).
allowed-tools: Read, Edit, Glob
---

# 06 — Review Plan

## Purpose
Hold the user-approval gate between planning (`05-plan`) and code generation (`07-write-code`). The plan is the contract: once approved, `07-write-code` executes exactly what it says, no more, no less. Catching missing steps or wrong file paths here is far cheaper than catching them mid-generation.

## When to use

- Automatically right after `05-plan` writes a plan
- When the user says "review plan", "check the plan", "rà soát plan", "duyệt plan", "approve plan", "let's verify the plan"

## Process

### 1. Re-read the plan
Either re-read the plan from the in-chat response (if `05-plan` rendered it inline) or from the plan file if one was written. Re-read it as if you've never seen it.

### 2. Self-review (before showing to user)
Run the checklist below silently. If ANY item fails, edit the plan to fix it BEFORE presenting to the user.

**Self-review checklist:**
- [ ] No `TBD`, `TODO`, `???`, `<...>` placeholder text — every file path is concrete
- [ ] Every task has: exact file path + CREATE/EDIT marker + 1-line intent
- [ ] Tasks are numbered (so the user can reference "step 7")
- [ ] Steps are grouped by phase (module bootstrap → entity model/service → entity routes/components → tests)
- [ ] Verification section is present with exact commands (`npm install`, `npm run build`, `npm run test -- ...`)
- [ ] Each acceptance criterion from the spec maps to at least one numbered task
- [ ] Frequent commit boundaries: no single task that bundles >5 files without a verification step
- [ ] Test-coverage tasks are present and match the agreed coverage level (minimal | standard | full)
- [ ] No file paths conflict with existing files in the target project (glob-check first)
- [ ] If layout is side-drawer, no `pages/detail/` step is present (component goes under `components/`)
- [ ] If workflow is enabled, `31-workflow-actions` is dispatched in the right step
- [ ] Final step references `orchestration/context-summarizer` (mandatory) and optionally `orchestration/memories`

### 3. Render summary to user
Present a CONCISE summary, not the full plan text. Format:

```
Plan ready: <N> tasks across <M> phases.

Phases:
- Phase 1 (module bootstrap): tasks 1-6
- Phase 2 (entity model/service): tasks 7-10
- Phase 3 (entity routes + screens): tasks 11-13
- Phase 4 (tests): tasks 14-16

Verification:
- npm run build-dev
- npm run test -- --watch=false --include=src/libs/sales/**/*.spec.ts
- Manual: http://localhost:4200/sales/promotion

Bạn duyệt plan này chứ?
  - "OK" → mình sẽ chạy `07-write-code` theo đúng plan
  - "đổi step <N>" → mình sẽ sửa và trình lại
  - "hủy" → dừng, không sinh code
```

### 4. Handle response
- **Approve** ("OK", "duyệt", "approve", "go ahead", "tiến hành", "generate"): IMMEDIATELY invoke `orchestration/auto-plans` (write mode) to persist the approved plan snapshot to `.sdcorejs/plans/<track>/`, and only then hand off to `07-write-code` with the approved plan as input
- **Request changes** ("đổi step N", "sửa", "amend", "change"): edit the plan, re-run self-review, re-present (loop max 3 rounds; if still not approved, suggest going back to `05-plan` or `04-review-spec`). DO NOT invoke `orchestration/auto-plans` — only an approved plan gets snapshotted
- **Abort** ("hủy", "dừng", "cancel", "stop"): stop the workflow. DO NOT invoke `orchestration/auto-plans`. Optionally invoke `orchestration/memories` if the user abort surfaced a durable lesson (e.g. "user prefers smaller batches; plan was too big")

## Rules

### MUST DO
- Run the self-review checklist BEFORE showing the plan to the user
- Fix every failing checklist item before presenting
- Show a concise phase + verification summary, not the full numbered list (user already saw that in `05-plan`)
- Wait for an explicit affirmative
- Pass the approved plan as the input contract to `07-write-code` — code generation must match the plan task-for-task
- Match the user's language

### MUST NOT
- Skip review on "simple" tasks. Even a 3-step plan deserves the gate — the time cost is seconds, the benefit is consistent rigor.
- Proceed to `07-write-code` without explicit user approval
- Let `07-write-code` start before the user says "OK", "duyệt", or equivalent affirmative
- Modify the plan after handing off — if late changes are needed, abort and re-plan
- Treat the absence of objection as approval

## Anti-patterns
- "Plan looks good, generating now" — that's the agent approving, not the user. Wait.
- Showing the full numbered task list again — the user already saw it; show only the deltas/summary.
- Letting code generation start mid-review (e.g. "while you're reviewing, I'll start step 1") — the gate is binary, not progressive.
- Skipping review when the user previously approved a related plan — every plan needs its own gate.
- Auto-approval based on confidence — confidence is the agent's, approval must be the user's.

## Related skills
- `05-plan` — runs immediately before; produces the plan
- `orchestration/auto-plans` — MANDATORY tail-call on approval; persists the approved plan snapshot to `.sdcorejs/plans/<track>/`
- `07-write-code` — runs after auto-plans; executes the plan
- `04-review-spec` — sibling gate, one stage earlier in the workflow
- `orchestration/memories` — capture durable lessons learned during review
