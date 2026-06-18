# Tasks / Progress Protocol

Use a visible Markdown checkbox `Tasks` section before starting any non-trivial
agent task.

## When Required

Use a `Tasks` section for non-trivial work:

- multi-step work
- file edits
- code analysis
- debugging
- review
- dependency update
- commit, PR, changelog, or release work
- verification or readiness checks

Do not use a `Tasks` section for:

- simple Q&A
- naming advice
- short explanations
- translations
- single-step answers

## Task Shape

Tasks must be outcome-based, not microscopic. Prefer a few meaningful outcomes
over line-by-line or command-by-command checkboxes.

Suggested default format:

```md
### Tasks
- [ ] Understand the request and constraints
- [ ] Inspect relevant context/files
- [ ] Execute the main work
- [ ] Verify the result
- [ ] Prepare final response with outcome, risks, and next steps
```

Adapt the labels to the actual work. For example, a review may use "Inspect
changed files" and "Report findings"; a dependency update may use "Classify
upgrade risk" and "Run regression checks".

## Derive From Existing Plans

If the task is executing an approved plan, derive the visible `Tasks` section from that
plan's outcome steps. If the skill already uses `TodoWrite` or a track-specific
progress checklist, keep the Markdown `Tasks` section aligned with that source instead
of creating a second, conflicting tracker.

For track executors, use the approved plan or executor task units as the
progress source:

- `sdcorejs-execute-plan`: approved plan steps and selected execution mode.
- Track executors (`sdcorejs-angular`, `sdcorejs-nestjs`, `sdcorejs-nextjs`,
  `sdcorejs-product`, `sdcorejs-design`, `sdcorejs-test`): planned units,
  affected artifacts, and mandatory finishing steps.
- Utility workflows (`sdcorejs-git`, `sdcorejs-ship`, `sdcorejs-debug`,
  `sdcorejs-review`, `sdcorejs-explore`): the workflow phases required by the
  request.

## Update Rules

- Create the `Tasks` section before work starts.
- Keep the `Tasks` section visible to the user.
- Mark `[x]` only after the task is actually done.
- Keep blocked, skipped, or unfinished work unchecked and explain why.
- Update the `Tasks` section if scope changes.
- Never mark verification complete unless verification was actually performed.
- Do not use the checkbox list as proof; commands, diffs, logs, and inspected files
  are the proof.
- Before the final response, send one last `Tasks` update when any checkbox state
  changed. Mark every actually completed item `[x]`; leave skipped, blocked, or
  unfinished items unchecked with a short reason.

## Persistent Checkpoint

For non-trivial work inside a target project, mirror the visible `Tasks` state to
a lightweight checkpoint so a new context window or another AI can resume even
if the session stops before the tail chain runs.

Path:

```text
<target-project>/.sdcorejs/tasks/current-session.md
```

Write or update this file when:

- the `Tasks` section is first created
- any checkbox state changes
- scope changes
- a meaningful artifact is written
- verification starts or finishes
- work becomes blocked, skipped, or complete

Skip this checkpoint for simple Q&A and for work where there is no target
project root. In the `sdcorejs-agent` authoring repo, write it only when this
repo itself is the explicit target; never write target-project session artifacts
here by accident.

Use this format:

```md
---
updated_at: <ISO-8601 timestamp>
status: in_progress | blocked | complete
track: <angular | nestjs | nextjs | product | design | test | multi | generic>
active_skill: <skill-name>
branch: <git-branch-or-unknown>
---

# Current Session Checkpoint

## User Request
<short paraphrase in the user's language>

## Tasks
- [x] <completed task>
- [ ] <open task>

## Current State
- Last completed: <latest real completed action>
- In progress: <current action or none>
- Blocked/skipped: <reason or none>

## Artifacts Touched
- EDIT path/to/file - <short reason>

## Verification
- <command> - <pass/fail/not run yet>

## Resume From Here
<one concrete next step>
```

Rules:

- Keep it short. It is a handoff note, not an auto-docs replacement.
- Do not paste secrets, tokens, large diffs, or full file contents.
- Do not claim verification passed unless the command actually ran.
- On normal completion, set `status: complete` and keep the final task state.
- If the tail chain later writes auto-docs and the living TODO, link those paths
  in `Artifacts Touched` or `Resume From Here`.
- Recovery should treat `status: in_progress` or `blocked` as higher priority
  than older auto-docs because it may describe an interrupted session.

## Final Response

The final response must accurately mention, when relevant:

- completed work
- skipped work
- blockers
- verification status
- remaining risks

Do not say "done", "ready", or "safe to ship" unless verification is complete,
or skipped verification is explicitly disclosed.
