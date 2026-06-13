---
name: sdcorejs-review-spec
description: Use AFTER `sdcorejs-write-spec` writes a spec file. Presents the spec to the user with a request for review and approval; iterates on feedback until the user approves. Acts as the user-approval gate before `sdcorejs-write-plan` starts; on approval, fires `orchestration/auto-snapshot` (SPEC mode) to persist the approved snapshot. Triggers - automatic after `sdcorejs-write-spec`; or user says "review spec", "approve spec", "let's check the spec", "review the spec", "approve the spec". Applies to angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Read, Edit, Glob
---

# 04 — Review Spec (Cross-Track)

## Purpose
Hold the user-approval gate between spec authoring (`sdcorejs-write-spec`) and planning (`sdcorejs-write-plan`). Without explicit approval, the agent cannot proceed. Design ambiguity caught here is 10× cheaper than ambiguity caught during code generation.

This skill is fully track-agnostic — the spec template, file paths, and tail-calls are the same across angular / nestjs / nextjs.

## When to use
- Automatically right after `sdcorejs-write-spec` writes a spec file
- When the user says "review spec", "let's check the spec", "review the spec", "approve the spec", "approve spec"

## Process

> **STOP — approval gate.** This skill exists to BLOCK the workflow. After presenting the spec summary (step 3), you MUST wait for an explicit affirmative ("OK", "approve", "go", "looks good", or localized equivalents) before invoking `orchestration/auto-snapshot` (SPEC mode) or `sdcorejs-write-plan`. Silence, "thanks", or a follow-up question is NOT approval. Do not proceed on your own judgment that the spec "looks fine".

### 1. Re-read the spec
Open the file just written under `<target-project>/.sdcorejs/docs/<TRACK>/*-spec.md`. Re-read it as if you've never seen it.

### 2. Self-review (before showing to user)
Run the checklist below silently. If ANY item fails, edit the spec to fix it BEFORE presenting to the user.

**Self-review checklist:**
- [ ] No `TBD`, `TODO`, `???`, or placeholder text in any section
- [ ] Every section header from the template is present and populated
- [ ] At least one explicit non-goal
- [ ] At least one acceptance criterion per user-visible behavior in "Goals"
- [ ] No internal contradictions (e.g. "Workflow: yes" in Architecture but no workflow acceptance criterion)
- [ ] Scope-fit: if the spec is >2 pages, suggest splitting into 2+ smaller specs
- [ ] No ambiguous pronouns or vague verbs ("handle", "support", "manage" without object)
- [ ] All file paths match the track conventions (see `_refs/sdlc/<TRACK>.md`)
- [ ] Language consistency: localized specs preserve locale-specific marks; English specs are grammatical
- [ ] References to prior memories / auto-docs are concrete (path or topic), not handwaved

### 3. Render summary to user
Present a CONCISE summary (not the full spec text — they wrote / saw it). Use this layout:

```
Spec written: <relative-path-from-target-root>

Summary:
- Goal: <1 line>
- Scope: <module / entity / page / endpoint set>
- Files: <N> create, <M> edit
- Workflow / persistence / caching / etc: <track-relevant headline>
- Acceptance: <N> criteria
- Non-goals called out: <list>
- Risks flagged: <list>

Do you approve this spec?
  - "OK" → continue to `sdcorejs-write-plan`
  - "change <X>" → I will update it and present it again
  - "cancel" → stop without generating a plan

Translate this prompt at runtime.
```

### 4. Handle response

#### Approve ("OK", "approve", "go", "resume", or localized equivalents)
1. Mark the spec approved (the user's confirmation in chat is the audit trail)
2. IMMEDIATELY invoke `orchestration/auto-snapshot` in SPEC mode (write mode) to persist the approved spec snapshot to `<target>/.sdcorejs/specs/<TRACK>/<YYYY-MM-DD-HH-mm>-<topic>.md`
3. Only then invoke `sdcorejs-write-plan` with the spec file path as input

#### Request changes ("change", "change", "change", "amend")
1. Edit the spec file in-place via `Edit` tool
2. Re-run the self-review checklist
3. Re-present (loop max 3 rounds — if still not approved, suggest re-brainstorming or rewriting the spec)
4. DO NOT invoke `orchestration/auto-snapshot` — only an approved spec gets snapshotted

#### Abort ("cancel", "stop", or localized equivalents)
1. Leave the spec file in place (it's a useful artifact even if not pursued)
2. Stop the workflow
3. DO NOT invoke `orchestration/auto-snapshot`
4. Optionally invoke `orchestration/memories` to capture WHY the user aborted, if there's a durable lesson

## Rules

### MUST DO
- Run the self-review checklist BEFORE showing the spec to the user
- Fix any failing checklist item via `Edit` on the spec file, then re-check
- Show a concise summary, not the full spec text
- Wait for an explicit affirmative — "looks good", "OK", "approve"
- Pass the approved spec file path to `sdcorejs-write-plan` when handing off
- Match the user's language

### MUST NOT
- Auto-approve. "User wrote 'thanks'" is NOT approval.
- Proceed to `sdcorejs-write-plan` without an explicit affirmative
- Rewrite the spec without confirming the user's intent on each change
- Loop endlessly on revisions — cap at 3 rounds, then suggest re-brainstorming

## Anti-patterns
- Treating silence as approval (the user might be reading; wait)
- Showing the full spec text instead of a summary — defeats the review purpose
- Editing the spec without re-running the self-review checklist after the edit
- Skipping the gate "because the spec looks fine" — that's the agent's bias, not user confirmation
- Carrying a half-approved spec into `sdcorejs-write-plan` — partial approval becomes full ambiguity downstream

## Related skills
- `sdcorejs-write-spec` — runs immediately before; produces the spec file
- `orchestration/auto-snapshot` (SPEC mode) — MANDATORY tail-call on approval; persists the approved spec snapshot
- `sdcorejs-write-plan` — runs after auto-snapshot; consumes the approved spec
- `orchestration/memories` — capture durable lessons learned during review
