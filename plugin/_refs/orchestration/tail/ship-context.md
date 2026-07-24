# Ship Context Contract

Use this reference whenever `sdcorejs-ship` emits `ship_context`.

## Contents

- [Schema](#schema)
- [Invariants](#invariants)

## Schema

```yaml
ship_context:
  source: sdcorejs-ship
  mode: verify-before-done | branch-ready | ship | dependency-update | release-ready
  verification_mode: feature-acceptance | bugfix-verification | specless-verification | dependency-regression | docs-only-hygiene | release-readiness | branch-ready-only
  delivery_type: feature-pr | bugfix | docs-only | dependency-update | release | manual-check | unknown
  target_root:
  current_HEAD:
  associated_HEAD_or_diff:
  acceptance_scope:
    selected_spec:
    selected_plan:
    selected_task:
    changed_files_scope:
    criteria_count:
    manual_criteria:
    deferred_criteria:
    selection_reason:
  verification:
    commands_run:
      - command:
        result:
        exit:
        associated_HEAD_or_diff:
    commands_skipped:
      - command_or_probe:
        reason:
    criteria:
      - id:
        status: PASS | FAIL | MANUAL | DEFERRED | NOT_APPLICABLE
        evidence:
    result: PASS | FAIL | PARTIAL | SKIPPED
  contexts_consumed:
    explore_context:
    test_context:
    debug_context:
    review_context:
    repair_source:
  artifact_context:
    schema_version: 1
    change_ref:
    source_spec:
    source_plan:
    required_with_change: []
    shared_owned: []
    conditional: []
    local_only: []
    unrelated_observed: []
  writes_before_branch_ready:
    - path:
      writer_skill:
      reason:
  writes_after_branch_ready:
    - path:
      writer_skill:
      reason:
  branch_ready_evidence:
    result:
    commands_run:
    commands_skipped:
    associated_HEAD_or_diff:
  dependency_evidence:
    update_type:
    package_manager:
    packages:
    commands_run:
    commands_skipped:
    audit_result:
  release_evidence:
    version:
    range:
    changelog:
    tag_approval:
    publish_approval:
  manual_deferrals:
    - item:
      reason:
      approved_by_user: true | false
  final_verdict: READY | READY_WITH_WARNINGS | BLOCKED | DEFERRED
  git_handoff_allowed: true | false
  git_handoff_reason:
```

## Invariants

- Redact secrets and PII.
- Include only commands that actually ran; never report a skipped command as
  passing.
- Tie evidence to the current diff or HEAD through `associated_HEAD_or_diff`.
- Keep `git_handoff_allowed` false when `writes_after_branch_ready` is nonempty.
- Keep `git_handoff_allowed` false when artifact closure is incomplete or
  ambiguous, a required artifact is missing, or local-only/unknown artifacts
  are staged.
- Allow Git handoff only when final branch-ready evidence is current and the
  user requested a Git artifact.
