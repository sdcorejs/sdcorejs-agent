---
name: angular-portal-review-spec
description: Use after `03-write-spec` writes a spec file. Presents the spec to the user with a request for review and approval; iterates on feedback until the user approves. Acts as the user-approval gate before `05-plan` starts. Triggers - automatic after 03-write-spec; or user says "review spec", "approve spec", "let's check the spec", "rà soát spec", "duyệt spec". Bilingual (VI/EN).
allowed-tools: Read, Edit, Glob
---

# 04 — Review Spec

## Purpose
Hold the user-approval gate between spec authoring (`03-write-spec`) and planning (`05-plan`). Without explicit approval, the agent cannot proceed — design ambiguity caught here is 10x cheaper than ambiguity caught during code generation.

## When to use

- Automatically right after `03-write-spec` writes a spec file
- When the user says "review spec", "let's check the spec", "rà soát spec", "duyệt spec", "approve spec"

## Process

### 1. Re-read the spec
Open the file just written under `<target-project>/.sdcorejs/docs/angular-portal/*-spec.md`. Re-read it as if you've never seen it.

### 2. Self-review (before showing to user)
Run the checklist below silently. If ANY item fails, edit the spec to fix it BEFORE presenting to the user.

**Self-review checklist:**
- [ ] No `TBD`, `TODO`, `???`, or placeholder text in any section
- [ ] Every section header from the template is present and populated
- [ ] At least one explicit non-goal
- [ ] At least one acceptance criterion per user-visible behavior in "Goals"
- [ ] No internal contradictions (e.g. "Workflow: yes" in Architecture but no workflow acceptance criterion)
- [ ] Scope-fit: if the spec is >2 pages, suggest splitting into 2+ smaller specs (decomposability check)
- [ ] No ambiguous pronouns or vague verbs ("handle", "support", "manage" without object)
- [ ] All file paths match SDCoreJS conventions (`src/libs/<lib>/features/<entity>/...`)
- [ ] Language consistency: VI spec uses full diacritics; EN spec is grammatical
- [ ] References to prior memories/auto-docs are concrete (path or topic), not handwaved

### 3. Render summary to user
Present a CONCISE summary (not the full spec text — they wrote/saw it). Format:

```
Spec written: <relative-path-from-target-root>

Summary:
- Goal: <1 line>
- Module / entity: <module> / <entity>
- Files: <N> create, <M> edit
- Workflow: <none | submit-approve-reject>
- Acceptance: <N> criteria
- Non-goals called out: <list>
- Risks flagged: <list>

Bạn duyệt spec này chứ?
  - "OK" → tiếp tục sang `05-plan`
  - "đổi <X>" → mình sẽ sửa và trình lại
  - "hủy" → dừng, không sinh plan
```

### 4. Handle response
- **Approve** ("OK", "duyệt", "approve", "go", "tiếp tục"): mark the spec approved (no file mutation needed — the user's confirmation in chat is the audit trail), then IMMEDIATELY invoke `orchestration/auto-specs` (write mode) to persist the approved spec snapshot to `.sdcorejs/specs/<track>/`, and only then invoke `05-plan` with the spec file path as input
- **Request changes** ("đổi", "sửa", "change", "amend"): edit the spec file in-place, re-run self-review, re-present (loop max 3 rounds; if still not approved, suggest the user rewrite the spec or rebrainstorm). DO NOT invoke `orchestration/auto-specs` — only an approved spec gets snapshotted
- **Abort** ("hủy", "dừng", "cancel", "stop"): leave the spec file in place (it's a useful artifact even if not pursued) and stop the workflow. DO NOT invoke `orchestration/auto-specs`. Suggest invoking `orchestration/memories` to capture WHY the user aborted, if there's a durable lesson.

## Rules

### MUST DO
- Run the self-review checklist BEFORE showing the spec to the user
- Fix any failing checklist item via `Edit` on the spec file, then re-check
- Show a concise summary, not the full spec text
- Wait for an explicit affirmative — "looks good", "OK", "duyệt"
- Pass the approved spec file path to `05-plan` when handing off
- Match the user's language

### MUST NOT
- Auto-approve. "User wrote 'thanks'" is NOT approval.
- Proceed to `05-plan` without an explicit "OK"
- Rewrite the spec without confirming the user's intent on each change
- Loop endlessly on revisions — cap at 3 rounds, then suggest re-brainstorming

## Anti-patterns
- Treating silence as approval (the user might be reading; wait)
- Showing the full spec text instead of a summary — defeats the review purpose
- Editing the spec without re-running the self-review checklist after the edit
- Skipping the user-approval gate "because the spec looks fine" — that's the agent's bias, not user confirmation
- Carrying a half-approved spec into `05-plan` — partial approval becomes full ambiguity downstream

## Related skills
- `03-write-spec` — runs immediately before; produces the spec file
- `orchestration/auto-specs` — MANDATORY tail-call on approval; persists the approved spec snapshot to `.sdcorejs/specs/<track>/`
- `05-plan` — runs after auto-specs; consumes the approved spec
- `orchestration/memories` — capture durable lessons learned during review (e.g. "user always wants explicit non-goal for X")
