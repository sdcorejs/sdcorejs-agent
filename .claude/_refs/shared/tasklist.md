# Tasks / Progress Protocol

Use a visible task/progress mechanism before starting non-trivial work. The
mechanism belongs to the active thread, agent harness, or client runtime. It is
not repository state.

## Contents

- [When Required](#when-required)
- [Task Shape](#task-shape)
- [Derive From Existing Plans](#derive-from-existing-plans)
- [Update Rules](#update-rules)
- [Runtime-only State](#runtime-only-state)
- [Explicit Handoff](#explicit-handoff)
- [Final Response](#final-response)

## When Required

Use visible progress for:

- multi-step work;
- file edits;
- code analysis, debugging, and review;
- dependency updates;
- commit, PR, changelog, or release work;
- verification and readiness checks.

Skip it for simple Q&A, naming advice, short explanations, translations, and
single-step answers.

## Task Shape

Tasks must be outcome-based rather than microscopic. Prefer a few meaningful
outcomes over line-by-line or command-by-command entries.

Suggested presentation when the client uses Markdown:

```md
### Tasks
- [ ] Understand the request and constraints
- [ ] Inspect relevant context and files
- [ ] Execute the main work
- [ ] Verify the result
- [ ] Prepare the final response with outcome, risks, and next steps
```

Clients may use an equivalent native progress API, task tool, checklist, or
harness-owned state. Do not require every client to implement Markdown
checkboxes when it already has a native mechanism.

## Derive From Existing Plans

When executing an approved plan, derive progress from its outcome steps. Keep
one authoritative runtime tracker:

- `sdcorejs-execute-plan`: approved plan steps and execution mode;
- track executors: planned units, affected artifacts, and finishing steps;
- utility workflows: the workflow phases required by the request.

The approved plan is the durable execution contract. Runtime progress is not a
replacement for that plan, and the plan is not mutated after approval.

## Update Rules

- Create visible progress before non-trivial execution begins.
- Mark an item complete only after the outcome is real.
- Keep blocked, skipped, or unfinished items open and explain why.
- Update the runtime tracker when scope or status changes.
- Never mark verification complete unless verification actually ran.
- Treat commands, diffs, logs, tests, and inspected files as proof; the task
  list itself is not evidence.
- Before the final response, make one final runtime progress update.

## Runtime-Only State

Live progress belongs only to:

- the current thread or harness task mechanism;
- the approved plan being executed;
- runtime contexts passed between skills in the same workflow;
- current execution evidence.

Do not mirror checkbox changes, verification transitions, or live status into a
repository file. Do not create a mutable global "current task", "active
change", session index, per-thread checkpoint directory, or equivalent
repository-backed coordination mechanism.

Legacy `.sdcorejs/tasks/current-session.md` files may exist in older target
projects. Ignore them as context, never update or stage them, and do not
recreate them. A workflow may mention once that the user can remove the legacy
file, but it must not delete user data without permission.

## Explicit Handoff

Create a durable handoff only when:

- the user explicitly requests one;
- work is blocked or deferred and another thread must take over; or
- a genuine recovery workflow requires durable transfer.

Use a change-scoped immutable path such as:

```text
.sdcorejs/handoffs/<track>/<timestamp>-<change-id>-handoff.md
```

The handoff must follow `_refs/shared/artifact-lifecycle.md`, include artifact
metadata, stay concise, and omit secrets, credentials, PII, large diffs, and
raw logs. It is not a replacement for live progress and is committed only when
its declared policy and the user/workflow intent allow it.

## Final Response

The final response must accurately mention completed work, skipped work,
blockers, verification status, and remaining risks. Do not say "done",
"ready", or "safe to ship" unless verification is complete or skipped
verification is explicitly disclosed.
