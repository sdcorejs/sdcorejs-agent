# Delegation Envelopes

These envelopes are runtime-only messages. Never persist them as mutable
session state under `.sdcorejs/**`.

## Task Brief

```yaml
task_brief:
  task_id:
  objective:
  plan_step:
  dispatch_envelope:
    contract_id:
    plan_artifact_id:
    plan_approval_hash:
    repository_id:
    repository_role:
    module_id:
    git_root:
    source_revision:
    allowed_paths: []
    prohibited_paths: []
    authority: read-only | read-write
    git_mutations: deny
    approved_artifact_mutation: deny
    required_validations: []
    output_evidence_contract:
      result_type:
      required_fields: []
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
brief. The worker never changes Git roots, writes coordinated integration
paths, mutates approved artifacts, stages, commits, or pushes. The primary
integration agent validates the returned diff and creates any integration
snapshot required by the result protocol.

For a `read-only-request`, use the discriminated envelope from
`_refs/orchestration/parallel-protocol.md`: `source`, `request_hash`, `scope_hash`,
`write_policy: deny`, `authority: read-only`, empty `allowed_paths`, and report
output. Omit `contract_id`, `plan_artifact_id`, and `plan_approval_hash`; set the
outer `plan_step` to `not-applicable: read-only request`. `owned_paths` is empty.
Include exact diagnostic questions/errors and expected versus observed behavior
when relevant. Verification commands must themselves preserve the read-only
contract; a test that writes caches or a database is not automatically read-only.

Supply the brief to a fresh isolated context rather than inheriting the parent
history. Report-only workers return citations, observations, hypotheses and
confidence, conflicts, unresolved questions, and actual commands/results. They
do not declare a fix or start new workers. The parent validates this evidence
and reconciles shared relationships before returning one answer.

## Review Package

```yaml
review_package:
  task_id:
  repository_id:
  repository_role:
  module_id:
  source_revision:
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
