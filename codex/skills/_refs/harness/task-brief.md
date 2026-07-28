# Delegation Envelopes

These envelopes are runtime-only messages. Never persist them as mutable
session state under `.sdcorejs/**`.

## Task Brief

```yaml
task_brief:
  task_id:
  objective:
  plan_step:
  dependencies: []
  owned_paths: []
  readable_paths: []
  do_not_touch: []
  context_refs: []
  acceptance_criteria: []
  verification_commands: []
  expected_output:
  model_tier:
  escalation_conditions: []
```

Use IDs, exact paths, and bounded excerpts. `context_refs` contains portable
contract, artifact, diff, and evidence references required by the worker.
Reference the approved spec and plan by stable ID/path/hash; do not embed their
complete bodies or a complete repository context. Do not place a full
spec/plan body inside a nominally valid string field. Write-capable workers
must have non-overlapping path and exclusive-resource ownership. The worker
stops and returns control when scope, ownership, contract, or risk exceeds the
brief.

## Review Package

```yaml
review_package:
  task_id:
  changed_paths: []
  diff_reference:
  verification:
  evidence: []
  risks: []
  unresolved: []
```

The parent re-reads every changed path, the current diff, and fresh verification
evidence before integration. Worker statements are evidence inputs, not
acceptance. `diff_reference` identifies the diff; the package does not paste a
full patch into another field.

## Review and Repair

Return a scoped review finding to the original implementer with `agent.resume`
when that capability is supported. Allow at most three bounded repair rounds.
After three unsuccessful rounds, or immediately when the finding changes the
task's architecture, security boundary, or public contract, escalate to a
deeper role/model or the parent. When resume is unsupported or unknown, the
parent owns the repair.

Fan-in follows the approved DAG and deterministic merge order. Conflicting path
or resource ownership blocks dispatch; completion order never decides which
write wins.
