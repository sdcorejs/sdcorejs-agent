# Durable Track Backlog Tail Reference

## Contents

- [Purpose](#purpose)
- [Ownership Gate](#ownership-gate)
- [Output Path](#output-path)
- [Frontmatter](#frontmatter)
- [Suggested Body](#suggested-body)
- [Reconciliation](#reconciliation)
- [Runtime Output](#runtime-output)
- [Rules](#rules)

## Purpose

Internal tail reference for a shared, durable project backlog under
`.sdcorejs/tasks/<track>.md`. This is not live thread progress, a session
checkpoint, or a coordination file.

The active thread/harness owns live progress. The approved plan is the durable
execution contract. This backlog contains only follow-up work the project wants
to preserve across changes.

Read `_refs/shared/artifact-lifecycle.md` before writing.

## Ownership Gate

Do not update the backlog after every code task.

Write only when:

- the user explicitly asks to update the project backlog;
- an approved tail selects durable backlog reconciliation; or
- the sequential workflow or parallel integration owner is assigned the shared
  artifact.

Parallel workers never update summary, persona, memory, or living backlog
files. The integration owner performs at most one shared backlog update after
fan-in.

If ownership is absent, leave the file unchanged and put the path under
`artifact_context.conditional` only when a future update condition exists.

## Output Path

```text
<target-root>/.sdcorejs/tasks/<track>.md
```

One backlog per track is allowed because it is shared durable project state,
not current thread state. Do not create an empty file.

## Frontmatter

```yaml
---
artifact_id: backlog-<track>
artifact_kind: task
change_ref: shared-track-backlog
source_spec: none
source_plan: none
commit_policy: conditional
owner: <integration role or workflow>
track: <track>
updated_at: <ISO-8601 timestamp>
redaction_applied: true
---
```

## Suggested Body

```markdown
# Durable Backlog - <track>

## Prioritized
- [ ] <project follow-up>

## Next
- [ ] <queued project follow-up>

## Blocked
- [!] <item> - <external dependency or decision>

## Recently Completed
- [x] (<YYYY-MM-DD>) <durable outcome>
```

The checkboxes represent durable backlog items, not the active thread's
step-by-step progress. Do not update this file when a runtime task checkbox
changes.

## Reconciliation

1. Read the existing backlog only when the current request/plan/metadata makes
   it relevant.
2. Read the current change's execution record and approved plan.
3. Close an existing item only when current evidence proves its durable outcome.
4. Add only explicit follow-ups, approved deferred work, or genuine blockers.
5. Preserve hand edits, ordering, and user-authored wording.
6. Keep the backlog compact; archive or remove old completed items only when the
   owner intentionally maintains the file.
7. Emit one concise update summary without dumping the file.

Do not derive tasks from unrelated old execution records, chat history, or the
latest document by default.

## Runtime Output

When the current workflow owns the update:

```yaml
artifact_context:
  schema_version: 1
  change_ref: <current change id>
  source_spec: <path | none>
  source_plan: <path | none>
  required_with_change: []
  shared_owned:
    - path: .sdcorejs/tasks/<track>.md
      kind: task
      reason: integration owner reconciled durable follow-up work
  conditional: []
  local_only: []
  unrelated_observed: []
```

When ownership is not proven, do not write and do not place the path in
`shared_owned`.

## Rules

### MUST DO

- Keep live progress in the thread or harness.
- Require one explicit owner for shared backlog writes.
- Use current change evidence and directly related artifacts.
- Preserve user edits and language.
- Redact secrets and PII.

### MUST NOT

- Mirror runtime progress to the repository.
- Create a "current", "active", session index, or per-thread state file.
- Let parallel workers update the shared backlog.
- Auto-add tasks after every code-writing invocation.
- Re-add tasks the user removed.
- Use this backlog as proof of completion.
