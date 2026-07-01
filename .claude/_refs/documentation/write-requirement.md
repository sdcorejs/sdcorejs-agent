# Write Requirement Reference

Internal reference loaded by `sdcorejs-documentation` in `write-requirement`
mode. This file is not a dispatchable skill.

## Purpose

Capture a lightweight task-level requirement record under the documentation
folder when the user gives a `TASKID` or wants the requirement saved for later
implementation, review, or handoff.

This is not a replacement for the product track. Use `sdcorejs-product` for
full PRDs, user stories, acceptance criteria, UAT checklists, traceability
matrices, and requirement/implementation/test consistency reviews.

## Output Path

Write exactly one file per task id:

```text
<target>/.sdcorejs/documentation/requirements/<TASKID>.md
```

Normalize `TASKID` for the filename by preserving uppercase/lowercase letters,
digits, `_`, and `-`; reject path separators. Examples: `TASK-001.md`,
`JIRA-123.md`, `REQ_AUTH_LOGIN.md`.

## When To Run

Run this reference when:

- The user includes an explicit `TASKID`, task id, ticket id, or issue id and
  provides requirement/context text.
- The user asks to "record requirement", "save requirement", "write requirement
  doc", or localized equivalents.
- A code/test track documentation gate asks whether to record the requirement
  and the user answers yes with a `TASKID`.

If the user wants to record a requirement but did not provide a `TASKID`, ask
for it before writing. Do not invent one.

If the user did not ask to record a requirement and no `TASKID` is present,
ask once after code/test documentation gate for user-visible requirement work:

```text
Do you want to record this requirement under
.sdcorejs/documentation/requirements/<TASKID>.md? If yes, please provide TASKID.
```

If they decline or do not provide a `TASKID`, skip this reference and report
that requirement recording was skipped.

## Template

Use the user's language for prose. Keep ids, URLs, file paths, API paths,
permission codes, and symbols in English.

````markdown
---
id: <TASKID>
title: <Short task title>
status: draft
version: 0.1.0
owner: ""
created_at: <YYYY-MM-DD>
updated_at: <YYYY-MM-DD>
sources:
  - type: prd
    name: ""
    path_or_url: ""
  - type: design
    name: ""
    path_or_url: ""
  - type: api_doc
    name: ""
    path_or_url: ""
---

# Requirement: <Task title>

## 1. Context

<Short context for the task.>

Prompts to fill:
- Why does this task exist?
- Which user or stakeholder needs it?
- What is the current problem?

## 2. Goal

Desired outcome:

```text
As a <user/persona>,
I want <capability>,
so that <business/user outcome>.
```

## 3. Scope

### In scope
- <What must be included>

### Out of scope
- <What is explicitly excluded>

## 4. Functional Requirements

| ID | Requirement | Priority | Notes |
|---|---|---|---|
| <TASKID>-FR-001 | <Requirement statement> | must | <notes> |

## 5. Acceptance Checks

| ID | Check | Verification |
|---|---|---|
| <TASKID>-AC-001 | <Observable expected behavior> | <manual/test/doc evidence> |

## 6. UX / API / Data Notes

- UX:
- API:
- Data:
- Permissions:

## 7. Dependencies And Risks

- Dependencies:
- Risks:
- Assumptions:

## 8. Open Questions

- [ ] <Question>

## 9. Traceability

| Artifact | Path/URL | Notes |
|---|---|---|
| Spec |  |  |
| Plan |  |  |
| Implementation |  |  |
| Tests |  |  |
| User guide |  |  |
| Technical doc |  |  |
````

## Update Rules

- If `<TASKID>.md` already exists, read it first and update in place.
- Preserve confirmed facts, source links, decisions, and open questions.
- Update `updated_at` on every edit. Keep `created_at` unchanged.
- Increment `version` only when a meaningful requirement changes; use patch
  increments (`0.1.0` -> `0.1.1`) unless the user provides a version.
- Keep status as `draft` unless the user explicitly says approved, active,
  blocked, done, or superseded.
- Do not invent acceptance checks when evidence is missing; add open questions.

## Verification

- Run `git diff --check` after writing.
- Manually verify the output path stays under
  `.sdcorejs/documentation/requirements/`.
- Report whether a `TASKID` was provided, asked for, or skipped.
