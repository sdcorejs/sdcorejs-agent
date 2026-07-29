# Tasks / Progress Protocol

Use a visible task/progress mechanism before starting non-trivial work. The
mechanism belongs to the active thread, agent harness, or client runtime. It is
not repository state.

## When Required

Use visible progress for multi-step edits, analysis, debugging, review,
dependency/Git work, verification, and readiness checks. Skip it for simple
Q&A, naming, short explanations, translations, and single-step answers.

## Task Shape

Tasks must be outcome-based rather than microscopic. Prefer a few meaningful
outcomes over line-by-line or command-by-command entries.

Clients may use an equivalent native progress API, task tool, checklist, or
harness-owned state; Markdown checkboxes are not required when a native
mechanism exists.

## Derive From Existing Plans

Derive progress from approved-plan outcomes, executor units, or utility
workflow phases, and keep one authoritative runtime tracker. The approved plan
remains the immutable durable execution contract; progress neither replaces nor
mutates it.

## Progress Events

Create or update visible progress when:

- non-trivial work starts;
- a meaningful outcome completes;
- scope changes;
- a blocker appears;
- a verification phase completes or fails;
- a user decision is required; or
- the user asks for status.

Do not emit progress merely because:

- another file is read;
- an ordinary action runs;
- execution moves between commands within the same outcome;
- the final response is about to be sent; or
- internal reasoning could be narrated.

Mark an outcome complete only when it is real. Keep blocked, skipped, or
unfinished outcomes open and explain why. Never mark verification complete
unless it actually ran; commands, diffs, logs, tests, and inspected files are
evidence, while the task list is not.

If a native tracker must be closed and its state changed, update it. Do not
emit a user-visible summary immediately before a final response with the same
content. The final response may be the final user projection. A host-required
heartbeat for long-running work stays short and does not repeat evidence.

## Runtime-Only State

Live progress belongs to the current thread/harness, the approved plan being
executed, runtime contexts passed within that workflow, and current evidence.

Do not mirror checkbox changes, verification transitions, or live status into a
repository file. Do not create a mutable global "current task", "active
change", session index, per-thread checkpoint directory, or equivalent
repository-backed coordination mechanism.

Ignore legacy `.sdcorejs/tasks/current-session.md`; never update, stage, or
recreate it. Mention optional removal at most once and never delete user data
without permission.

## Explicit Handoff

Create a durable handoff only on explicit request, genuine blocked/deferred
transfer, or recovery need.

Use a change-scoped immutable path such as:

```text
.sdcorejs/handoffs/<track>/<timestamp>-<change-id>-handoff.md
```

The handoff must follow `_refs/shared/artifact-lifecycle.md`, include artifact
metadata, stay concise, and omit secrets, credentials, PII, large diffs, and
raw logs. It is not a replacement for live progress and is committed only when
its declared policy and the user/workflow intent allow it.

## Final Response

Lead the final response with the outcome. Include material changed paths,
verification, blockers, risks, skipped checks, or a required decision; omit
empty sections. Do not repeat the plan, full context, full diff, or action log.
Do not say "done", "ready", or "safe to ship" unless current verification is
complete or skipped verification is explicitly disclosed. Apply
`_refs/harness/communication-economy.md` when projection details are needed.
