# Documentation Gate Reference

Internal reference loaded by track executors before documentation tail steps.
This file is not a dispatchable skill.

## Purpose

Make documentation a visible decision for every direct code/test-writing run,
while letting a target project save the decision once and reuse it later.

Applies to direct or approved executor runs that write code or tests:

- `sdcorejs-angular`
- `sdcorejs-nestjs`
- `sdcorejs-nextjs`
- `sdcorejs-test` direct invocation or test-only approved plans

Do not use this gate for read-only review, brainstorming, spec, plan, explore,
or documentation-only requests.

## Preference File

Project-local preferences live in:

```text
<target>/.sdcorejs/documentation/preferences.md
```

This is a committed project artifact, not transient session memory. When
`sdcorejs-git` commits or opens a PR for work that used or changed saved
documentation preferences, include `.sdcorejs/documentation/**` with the
feature changes unless the user explicitly asks for a separate commit.

Suggested file shape:

```markdown
---
version: 1
updated_at: <ISO-8601 timestamp>
source: sdcorejs-documentation-gate
ask_each_time: false
comment_code: simple        # skip | simple | medium | full
user_guide: update          # update | skip
technical_doc: auto         # auto | write | skip
requirement_record: ask     # ask | write | skip
---

# Documentation Preferences

Saved by the SDCoreJS documentation gate. Edit this file or ask Codex to change
documentation preferences when the project needs a different default.
```

## Decision Flow

1. Resolve `TARGET_ROOT` from the target project, not from `sdcorejs-agent`.
2. Read `<TARGET_ROOT>/.sdcorejs/documentation/preferences.md` when present.
3. If preferences exist and `ask_each_time: false`, apply them without asking
   again, unless the current user request overrides a documentation option.
   Briefly report the saved choices being used.
4. If preferences are absent, stale/unparseable, or `ask_each_time: true`,
   present the prompt below and wait for the user.
5. If the user chooses to save, create `.sdcorejs/documentation/` and write or
   update `preferences.md`.

Current-turn explicit instructions override saved preferences. Examples:
"skip docs this time", "full comments", "write technical doc", "do not save".

## Prompt Sequence

Localize each prompt. Defaults are intentionally documentation-friendly. Ask
these questions sequentially and wait for each answer before asking the next.
Do not ask for a combined multi-setting answer.

### Step 1 - Code Comments

```text
Documentation for this code/test change - defaults in brackets.
Documentation step 1/5: code comments.

1. Simple comments - public methods and genuinely non-obvious logic only. [Recommended]
2. Skip comments.
3. Medium comments - public and complex private members.
4. Full comments - full JSDoc plus larger design notes when justified.

Reply with `1`, `2`, `3`, or `4`.
```

### Step 2 - User Guide

```text
Documentation step 2/5: user guide.

1. Update user guide when user-visible behavior changed. [Recommended]
2. Skip user guide.

Reply with `1` or `2`.
```

### Step 3 - Technical Doc

```text
Documentation step 3/5: technical doc.

1. Auto - write only when public APIs, architecture, setup, integration, reusable contracts, or test harness conventions changed. [Recommended]
2. Write technical doc now.
3. Skip technical doc.

Reply with `1`, `2`, or `3`.
```

### Step 4 - Requirement Record

If the current request already includes a `TASKID`, task id, ticket id, or
issue id, write/update `.sdcorejs/documentation/requirements/<TASKID>.md`
without asking this step. Otherwise, when the run represents user-visible
requirement work, ask:

```text
Documentation step 4/5: requirement record.

1. Record requirement - I will ask for TASKID next, then write .sdcorejs/documentation/requirements/<TASKID>.md. [Recommended when this is requirement work]
2. Skip requirement record.

Reply with `1` or `2`.
```

If the user chooses `1`, ask one free-text follow-up:

```text
Please provide TASKID for the requirement file.
```

For `sdcorejs-test` direct runs, adapt item 1 to "Test comments" and item 2 to
"User guide/QA guide" only when the test work documents user-visible flows.

### Step 5 - Save Preference

```text
Documentation step 5/5: save these choices for this project?

1. Save preferences to .sdcorejs/documentation/preferences.md. [Recommended]
2. Do not save; use these choices only this run.

Reply with `1` or `2`.
```

## Default Choices

If the user accepts defaults:

```yaml
comment_code: simple
user_guide: update
technical_doc: auto
requirement_record: ask
save_preference: yes
```

`technical_doc: auto` means write or update a technical doc only when the run
changed evidence that future developers need outside the code diff, such as:

- public API routes, request/response contracts, permission codes, or errors
- architecture decisions, module boundaries, integration flows, queues, jobs
- setup/maintenance instructions derived from real source evidence
- reusable utilities, helpers, fixtures, page objects, or test harness conventions
- non-obvious cross-file behavior that comments/user guide cannot capture well

If none applies, skip the technical doc and report the reason. Do not write a
template-only technical doc.

`requirement_record: ask` means:

- If the current request already includes a `TASKID`, task id, ticket id, or
  issue id, write/update `.sdcorejs/documentation/requirements/<TASKID>.md`.
- If no `TASKID` is present and the run represents user-visible requirement
  work, ask once whether to record the requirement. If yes, require the user to
  provide `TASKID`; do not invent one.
- If the user declines or no `TASKID` is provided, skip requirement recording
  and report the skip.

## Outputs For Callers

The gate returns these effective choices to the calling orchestrator:

```yaml
documentation:
  comment_code: skip | simple | medium | full
  user_guide: update | skip
  technical_doc: auto | write | skip
  requirement_record: ask | write | skip
  task_id: <TASKID> | null
  preference_saved: true | false
  preference_path: .sdcorejs/documentation/preferences.md | null
```

The caller then runs the documentation tail steps in order:

1. `sdcorejs-documentation (comment-code mode)` with `comment_code`.
2. `sdcorejs-documentation (write-technical-doc mode)` when
   `technical_doc=write`, or when `technical_doc=auto` and the auto criteria
   are met.
3. `sdcorejs-documentation (write-requirement mode)` when a `TASKID` exists or
   the user agrees to record the requirement and provides `TASKID`.
4. `sdcorejs-documentation (write-user-guide mode)` when `user_guide=update`.

Use `_refs/documentation/comment-code.md`,
`_refs/documentation/write-technical-doc.md`, and
`_refs/documentation/write-user-guide.md` for the actual documentation work.
Use `_refs/documentation/write-requirement.md` for requirement records.

## Rules

- Prefer writing useful documentation by default. Skipping is allowed, but it
  must be a visible choice or a saved preference.
- Never ask a second comment-code question after this gate; pass the captured
  level to `comment-code` mode.
- Never write preferences into the `sdcorejs-agent` authoring repo unless that
  repo is explicitly the target project.
- Do not store secrets, tokens, local absolute paths, or private environment
  values in `.sdcorejs/documentation/preferences.md`.
- Treat mojibake in prompts or saved preferences as blocking; fix it before
  continuing.
