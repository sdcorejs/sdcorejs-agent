---
name: sdcorejs-spec
description: Spec authoring and approval gate. Use after brainstorming confirms requirements, or when the user asks to write/review/approve/change a spec or design doc. Writes draft spec under .sdcorejs/docs/<track>/, self-reviews, waits for explicit approval, then persists approved snapshot under .sdcorejs/specs/<track>/ before plan. Applies across tracks. Runtime-localized.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 02 - Spec


## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.

## Purpose
Turn the confirmed requirement contract into a durable spec, hold the user approval gate, and persist the approved spec corpus inside the same skill.

A spec answers what and why. A plan answers which files and in what order.

## Preconditions
- `sdcorejs-brainstorming` has confirmed the minimum blockers, or the conversation already contains an equivalent confirmed contract.
- Target root and context/track are known.
- For non-trivial code/test generation, do not proceed from an unconfirmed idea.

If these are missing, route back to `sdcorejs-brainstorming`.

## Process

### 1. Load guidance and prior style
Read the relevant guidance:

- angular / nestjs / nextjs: `_refs/sdlc/<track>.md`
- test: `_refs/shared/testing-philosophy.md` plus the target stack test ref if known
- product: existing product ledgers under `.sdcorejs/docs/product/`
- generic harness: previous approved specs/plans and available project scripts

Then read:

- Latest 3 `.sdcorejs/docs/<track>/*.md`.
- Relevant `.sdcorejs/memories/<track>/*.md`.
- Latest 1-3 approved specs under `.sdcorejs/specs/<track>/` to mirror style.

### 2. Write the draft spec file
Write the editable draft to:

```text
<target-project>/.sdcorejs/docs/<track>/<YYYY-MM-DD-HH-mm>-<kebab-topic>-spec.md
```

Use this template:

```markdown
# Spec - <Title> - <YYYY-MM-DD HH:mm>

## Problem & Goals
<What problem this solves, who it serves, and what success looks like.>

## Non-goals
- <Explicit out-of-scope item>

## Architecture
<How this fits the project, including context/track-specific conventions.>

## File structure
- `<path>` - <create/edit intent>

## Acceptance criteria
1. <Concrete, testable criterion>

## Risks & mitigations
- **Risk:** <risk> -> **Mitigation:** <mitigation>

## Out of scope (deferred)
- <Deferred item> - defer until <trigger>
```

For test-track specs, "File structure" may describe test files, fixtures, page objects, or harness files. For product-track specs, it may describe product ledgers, UAT checklists, traceability matrices, and source artifacts. For generic harness specs, it may describe the files/commands the harness is allowed to touch.

### 3. Self-review before showing the user
Fix the spec before presenting if any checklist item fails:

- No `TBD`, `TODO`, `???`, or placeholder text.
- Every template section is present and populated.
- At least one explicit non-goal.
- At least one acceptance criterion per user-visible behavior.
- Architecture matches the confirmed requirement contract.
- File paths match the detected context or are clearly marked generic harness paths.
- Language is consistent with the user.
- Scope is not too large; suggest splitting if the spec is over 2 pages.

### 4. Present the approval gate
Show a concise summary, not the whole spec:

```text
Spec written: <relative path>

Summary:
- Goal: <1 line>
- Scope: <module/entity/page/test/harness area>
- Files: <N> create, <M> edit
- Acceptance: <N> criteria
- Non-goals: <short list>
- Risks: <short list>

Do you approve this spec?
- "OK" -> snapshot the spec and draft the plan
- "change <X>" -> update the spec and show it again
- "cancel" -> stop
```

Translate the prompt at runtime.

### 5. Handle user response

Approve:

1. Write an immutable approved-spec snapshot under:

```text
<target-project>/.sdcorejs/specs/<track>/<YYYY-MM-DD-HH-mm>-<kebab-topic>.md
```

2. Include frontmatter:

```yaml
---
name: <kebab-topic>
description: <one-line future-loading hook>
approvedAt: <ISO-8601 timestamp with timezone>
approvedBy: <git user.email or session user when known>
track: <angular|nestjs|nextjs|test|product|generic>
sourceDraftPath: .sdcorejs/docs/<track>/<timestamp>-<topic>-spec.md
---
```

3. Body format:

```markdown
# <Title> - Approved Spec

> Snapshot of what the user approved at the `sdcorejs-spec` gate. Do not edit by hand; re-author through `sdcorejs-spec` if the contract changes.

## Approved contract
<verbatim approved spec content>

## Decisions captured during review
- <what changed during review, or `(approved as drafted)`>

## Skill provenance
sdcorejs-spec (approved on attempt <N> / 3)
```

4. Only after the approved snapshot succeeds, hand off to `sdcorejs-plan` with the draft spec path and approved snapshot path.

Change request:

1. Edit the spec in place.
2. Re-run the self-review checklist.
3. Re-present the summary.
4. Cap at 3 revision rounds, then suggest returning to `sdcorejs-brainstorming`.

Abort:

1. Leave the spec file in place.
2. Do not write an approved snapshot.
3. Stop the workflow.

## Rules

### Must do
- Write the spec in the target project, never in the `sdcorejs-agent` repo.
- Wait for explicit approval before writing the approved snapshot or planning.
- Create a new approved snapshot every time; snapshots are immutable history.
- Capture review decisions honestly; never leave the section blank.
- Treat silence, "thanks", and follow-up questions as not approved.
- Preserve the user's language in prose.
- Use English identifiers and route paths.

### Must not
- Mix implementation order into the spec.
- Auto-approve the spec.
- Skip approved snapshot writing on approval.
- Proceed to `sdcorejs-plan` before the SPEC snapshot is written.
- Overwrite an old approved snapshot.

## Cross-references
- `sdcorejs-brainstorming` - requirement contract input
- `sdcorejs-plan` - consumes the approved spec
