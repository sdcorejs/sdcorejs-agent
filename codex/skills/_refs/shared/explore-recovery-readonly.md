# Explore: recovery-readonly

## `recovery-readonly`

Recovery mode is read-only. Read valid summary sections, the directly related
approved spec/plan, change-scoped execution docs, an explicit handoff when one
exists, relevant memory metadata, Git status/diff/log, and current user scope.
Select artifacts by exact `contract_id`, `requirement_id`, `change_ref`,
parent/supersedes links, and repository/module owner before path hints. Never
select a durable artifact merely because it is newest.

Ignore legacy session checkpoint files. Do not auto-resume work, create a
handoff, or refresh summary.

End with one numbered choice prompt:

```text
What would you like to do next?

1. Continue the previous task
2. Start a new task from current context
3. Inspect a specific document or file
4. Refresh project summary
5. Stop after this recovery summary

Reply with `1`, `2`, `3`, `4`, or `5`.
```
