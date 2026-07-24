# Git Commit Scope Ledger

Read this reference before staging or committing. It defines the full ledger
and dirty-tree inclusion rules; `_refs/shared/artifact-lifecycle.md` remains
authoritative for `.sdcorejs/**`.

## Contents

- [Ledger](#ledger)
- [Scope Rules](#scope-rules)

## Ledger

```yaml
Commit Scope Ledger:
  branch:
  current_HEAD:
  protected_branch_status:
  staged_paths:
  unstaged_paths:
  untracked_paths:
  included_paths:
  excluded_dirty_paths:
  generated_mirrors:
  docs_or_task_artifacts:
  sdcorejs_artifacts:
    change_ref:
    discovery_complete:
    discovery_errors:
    discovered_paths:
    required_paths:
    shared_owned_paths:
    conditional_paths:
    included_paths:
    excluded_unrelated_paths:
    local_only_paths:
    unknown_paths:
    missing_required_paths:
    invalid_context_paths:
    uncommitted_included_paths:
    closure_result: complete | incomplete | ambiguous
  suspected_secret_paths:
  secret_scan_result:
  ship_evidence:
    ship_context:
    mode:
    commands:
    result:
    associated_HEAD_or_diff:
    timestamp_if_available:
  branch_ready_evidence:
    commands:
    result:
    associated_HEAD_or_diff:
    timestamp_if_available:
  commit_type:
  commit_scope:
  commit_message_preview:
```

## Scope Rules

- Inspect short status, staged names/diffstat, unstaged diffstat, and untracked
  paths before staging.
- Treat pre-existing staged paths as unowned until current scope proves them.
- When staged, unstaged, and untracked work coexist, ask for scope unless the
  current task clearly owns every included path.
- Stage only explicit paths or explicit path groups.
- Never stage unrelated work or generated/vendor/build/cache/log/env/temp
  output by default.
- Even for “commit all”, stop on unrelated or ambiguous changes.
- Include generated mirrors only when repository policy requires them for the
  current canonical source/ref change.
- Include docs/task artifacts only when the workflow intentionally produced
  them.
- Use `artifact_context` and lifecycle metadata as authority for
  `.sdcorejs/**`; never treat that directory as one staging unit.
- If files are unrelated, offer commit task-scoped files, include selected
  additional files, or stop for cleanup/stash.
