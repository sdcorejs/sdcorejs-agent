# Change Execution Record Tail Reference

## Contents

- [Purpose](#purpose)
- [When To Write](#when-to-write)
- [Relevance-first Reads](#relevance-first-reads)
- [Output Path](#output-path)
- [Template](#template)
- [Runtime Output](#runtime-output)
- [Rules](#rules)
- [Cross-track Usage](#cross-track-usage)

## Purpose

Internal tail reference for a change-scoped durable execution record. It is not
a live session checkpoint, progress mirror, or dispatchable skill.

The record captures decisions and evidence that are useful beyond the current
thread and cannot be recovered cheaply from the diff. Product traceability
remains a separate feature ledger under `.sdcorejs/docs/product/`.

Read `_refs/shared/artifact-lifecycle.md` before writing.

## When To Write

Write one immutable record after a code/test/design/product workflow when:

- the change produced implementation or durable test evidence;
- material decisions or limitations should travel with the change; and
- the approved workflow owns the artifact.

Skip when nothing changed, no durable finding exists, or the diff/approved plan
already provides all useful evidence. Do not write a record merely because a
thread started or ended.

Workers in parallel write workflows may create only their assigned
change-scoped record. The integration owner merges artifact contexts and may
create one integrated record after fan-in. Workers do not update shared summary,
persona, memory, or living backlog files.

## Relevance-First Reads

Do not load the latest records by default. Project-context preflight reads
frontmatter first and selects records related through `change_ref`,
`source_spec`, `source_plan`, explicit user scope, or directly matching paths.

## Output Path

```text
<target-root>/.sdcorejs/docs/<track>/<YYYY-MM-DD-HH-mm>-<change-slug>.md
```

Resolve the target root from the user's working directory. Never write a target
project record into the skill-pack authoring repository unless it is the
explicit target.

Use a collision suffix (`-2`, `-3`) rather than overwriting an existing record.

## Template

```markdown
---
artifact_id: execution-<change-id>-<timestamp>
artifact_kind: execution-doc
change_ref: <change id>
source_spec: <repo-relative path | none>
source_plan: <repo-relative path | none>
commit_policy: with-change
owner: <executor or integration-owner>
track: <track>
created_at: <ISO-8601 timestamp>
redaction_applied: true
---

# Change Execution Record - <Title>

## Requested Outcome
<brief localized paraphrase>

## Material Changes
- EDIT path/to/file - <short purpose>

## Decisions And Invariants
- <decision that is not obvious from the diff>

## Verification Evidence
- `<actual command>` - exit <code> - <short result>

## Known Gaps
- <real unresolved item or none>

## Related Artifacts
- Spec: <path | none>
- Plan: <path | none>
- Product/design/test ledger: <path | none>
```

Use the user's language for artifact prose. Keep identifiers, commands, env
keys, permission codes, and paths exact.

## Runtime Output

Emit:

```yaml
artifact_context:
  schema_version: 1
  change_ref: <change id>
  source_spec: <path | none>
  source_plan: <path | none>
  required_with_change:
    - path: .sdcorejs/docs/<track>/<file>.md
      kind: execution-doc
      reason: durable change evidence
  shared_owned: []
  conditional: []
  local_only: []
  unrelated_observed: []
```

Merge this block with upstream producer contexts and pass it to
`sdcorejs-ship`.

## Rules

### MUST DO

- Keep the record change-scoped and immutable.
- Include only material paths, decisions, actual commands, exit codes, and
  genuine gaps.
- Link related specs, plans, and ledgers by repository-relative path.
- Redact secrets and PII.
- Classify the record as `required_with_change`.

### MUST NOT

- Store live checkbox progress or "resume from here" state.
- Create a record automatically for every thread.
- Read unrelated records merely because they are newest.
- Paste large diffs, raw logs, full file contents, tokens, credentials, or PII.
- Overwrite another change's record.
- Treat the record as product traceability or a project summary.

## Cross-Track Usage

Use the actual active track (`angular`, `nestjs`, `nextjs`, `product`, `design`,
`test`, `documentation`, `workflow`, or `general`). Do not default to Angular.
