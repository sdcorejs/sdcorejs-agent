# Parallel Dispatch Protocol v2

Normative protocol for `sdcorejs-parallel-dispatch`. The skill must apply every
required validation below before it treats a unit or integration state as safe.
The distributed `_refs/orchestration/parallel-protocol.mjs` module implements
the mechanically enforceable subset. Passing its tests is not evidence that an
external runtime invokes it or enforces the remaining orchestration rules.

## Contents

- [Contract Union](#contract-union)
- [Required Context](#required-context)
- [Working-tree Preflight](#working-tree-preflight)
- [Runtime Capability Fallback](#runtime-capability-fallback)
- [Topology And DAG Rules](#topology-and-dag-rules)
- [Isolation And Resource Validation](#isolation-and-resource-validation)
- [Mechanical Path-boundary Validator](#mechanical-path-boundary-validator)
- [Deterministic Fan-in](#deterministic-fan-in)
- [Repair Assignment](#repair-assignment)
- [Contract Revision](#contract-revision)
- [Failure Policy](#failure-policy)
- [Evidence And Redaction](#evidence-and-redaction)
- [State Machine](#state-machine)
- [Final Tail](#final-tail)

## Contract Union

`contract.source` is the discriminator.

```yaml
contract:
  source: approved-plan
  contract_id: <stable id>
  approved_plan_path: <immutable snapshot path>
  approved_plan_hash: <hash>
  frozen_contract_path: <path or embedded>
  frozen_contract_hash: <hash>
  revision: <integer>
  supersedes: <prior contract id or null>
```

The `approved-plan` branch is mandatory if any unit can write.

```yaml
contract:
  source: read-only-request
  request_hash: <hash of normalized request>
  scope_hash: <hash of file/report scope>
  write_policy: deny
```

The `read-only-request` branch must omit approved-plan fields. Its unit
allowlists are empty, workspace strategy is `shared-readonly`, result type is
`report`, and before/after changed paths must be empty. A detected write is
`PATH_VIOLATION -> UNIT_FAILED`.

## Required Context

```yaml
parallel_context:
  schema_version: 2
  source: sdcorejs-parallel-dispatch

  contract: <one union branch above>

  target:
    repo_root:
    target_root:
    target_root_kind:
    track:
    stack_profile:

  working_tree:
    repo_root:
    current_branch:
    current_head:
    expected_branch:
    expected_head:
    status_snapshot_hash:
    dirty_diff_hash:
    staged_paths: []
    unstaged_paths: []
    untracked_paths: []
    unrelated_dirty_paths: []
    intended_output_paths: []
    user_dirty_tree_decision:

  runtime_capabilities:
    runtime:
    supports_subagents:
    supports_parallel_dispatch:
    supports_agent_cwd:
    supports_native_worktree:
    supports_result_ref:
    supports_timeout:
    supports_cancellation:
    effective_max_concurrency:

  topology:
    kind: READ_ONLY_FANOUT | INDEPENDENT_WRITE_UNITS | CONTRACT_BOUND_ROLES | SEQUENTIAL_DAG
    verdict: SEQUENTIAL | PARALLEL-CANDIDATE | ROLE-SPLIT

  integration:
    workspace_path:
    branch:
    base_head:
    merge_strategy: cherry-pick | patch | disjoint-same-tree
    merge_order: []
    atomicity: all-or-nothing | independent-successes | user-decision
    rollback_strategy: <required executable strategy for all-or-nothing>

  units:
    - id:
      role:
      wave:
      depends_on: []
      produces: []
      consumes: []
      contract_hash:

      workspace:
        strategy: shared-readonly | disjoint-same-tree | worktree
        path:
        branch:
        base_head:
        created_by_current_run:
        mechanically_disjoint: true | false

      ownership:
        allowed_paths: []
        prohibited_paths: []
        shared_files:
          - path:
            owner: <unit-id> | integration-unit | parent-contract-only
        exclusive_resources: []
        shared_readonly_resources: []
        allocated_ports: []
        database_namespace:
        temp_root:
        cache_root:
        coverage_root:

      task:
        exact_scope:
        approved_plan_slice:
        out_of_scope: []

      verification:
        command:
        cwd:
        timeout_seconds:
        expected_artifacts: []

      result:
        type: report | commit | patch | working-tree-diff
        ref:
        base_head:
        associated_head_or_diff:
        changed_paths: []
        exit_code:
        output_digest:
        blockers: []

      status: PENDING | RUNNING | PASSED | FAILED | BLOCKED | CANCELLED | STALE
      attempts: 0

  failure_policy:
    mode: fail-fast | best-effort
    max_attempts:
    timeout_seconds:
    cancel_pending_on_blocker:
    merge_successful_units_on_partial_failure:
    retry_transient_failures:
    rollback_on_global_failure:
    checkpoint_path:

  redaction:
    excluded_paths: []
    excluded_patterns: []
    secret_scan:
    pii_redacted:
    logs_sanitized:
    notes:

  global_verification:
    commands_planned: []
    commands_skipped: []
    associated_head_or_diff:
    output_digest:

  final_tail:
    verify_before_done: true
    branch_ready_final_gate: true
    no_writes_after_branch_ready: true
```

Fields are operational:

- hashes select the immutable contract/result state;
- workspace fields select the unit checkout and prohibit wrong-cwd execution;
- ownership fields feed path/resource conflict validation;
- dependency fields generate waves;
- verification and result fields bind evidence;
- failure fields decide retries, partial integration, rollback, and checkpointing;
- redaction fields constrain briefs and logs;
- final-tail booleans reject invalid write-workflow combinations.

## Working-tree Preflight

For write work, record branch, HEAD, porcelain status, staged/unstaged/untracked
paths, a canonical status hash, dirty diff hash, unrelated dirty paths, and
whether intended outputs already exist or overlap dirt. Compare branch and HEAD
with the approved baseline. Reuse the decision prompt from
`sdcorejs-execute-plan` for unrelated changes.

Fail closed when branch/HEAD mismatch, target-root identity, existing output,
or dirty ownership cannot be resolved. Read-only mode records HEAD and a status
snapshot so an after-snapshot can prove zero writes.

## Runtime Capability Fallback

| Capability result | Required behavior |
|---|---|
| no subagents | sequential execution |
| subagent calls serialize | explicit sequential waves; report no concurrency |
| no agent cwd | read-only or mechanically proven `disjoint-same-tree` only |
| no immutable result ref | exact changed-path/diff snapshot bound to evidence |
| no timeout/cancellation | best-effort reporting; no fail-fast cancellation claim |
| unknown for write-heavy work | `BLOCKED` |

The effective concurrency is the smaller of runtime capacity, safe unit count,
and repository/resource limits.

## Topology And DAG Rules

Classification uses dependency edges, normalized path overlap, exclusive
resource overlap, expected benefit, coordination/review cost, blast radius,
runtime capability, and integration complexity. Unit count and role names alone
are insufficient.

Topologically sort units into deterministic waves. A cycle or missing dependency
is blocking. Derive roles from the plan; do not manufacture Product, Design,
Backend, Frontend, or QC units. Test authoring may run before integration when
its inputs are frozen. Cross-stack execution consumes integrated results and
therefore runs in a later wave.

## Isolation And Resource Validation

`shared-readonly` compares before/after Git and filesystem snapshots and fails
on any change.

`disjoint-same-tree` is allowed only when normalized ownership does not overlap
and commands cannot mutate shared state. Repository-wide formatters, install or
lockfile operations, generators, Git index/staging, shared databases, shared
outputs/caches, ports, browser profiles, Compose project names, test accounts,
snapshot directories, and coverage roots require unique allocation or a
separate wave.
Set `mechanically_disjoint: true` only after these checks are recorded; absence
or `false` demotes the unit to worktree or sequential execution.

Normalize typed resource claims before comparison: a declared `port:3000` and
`allocated_ports: [3000]` are the same claim. Temp/cache/coverage roots use
canonical separators and case rules; equal or parent/child roots conflict.

`worktree` uses one worktree/branch per unit, a common approved base, and a
separate integration workspace. Verify result ancestry/base before fan-in.
Record which worktrees the current run created. Cleanup may remove only those
recorded worktrees after verifying their resolved paths; never remove a
pre-existing or nested worktree.

## Mechanical Path-boundary Validator

The parent/integration owner, not the unit report, performs this algorithm:

1. Obtain actual tracked, staged, unstaged, untracked, added, deleted, and
   renamed paths from Git plus relevant filesystem evidence.
2. Expand a rename into source deletion and destination addition.
3. Normalize separators and `.` segments; reject absolute paths and `..`
   escapes. Apply filesystem case rules.
4. Resolve existing symlinks and every existing ancestor of new paths. Reject
   an escape from the repository real path.
5. Detect submodule and nested-repository boundaries; allow them only when the
   approved contract explicitly owns that repository operation.
6. Match every normalized actual path against the unit allowlist and prohibited
   list. Lockfiles, manifests, env/migration files, frozen contracts, and shared
   generated artifacts remain prohibited unless explicitly approved.
7. Detect parent/child and glob overlap between units before dispatch.
8. Compare the computed list with the unit's report. A mismatch is failure, not
   a warning.
9. Store the exact normalized actual list in result/evidence.

Any formatter, generator, install, or other command that spills outside scope
causes `PATH_VIOLATION -> UNIT_FAILED`.

## Deterministic Fan-in

For each ID in `integration.merge_order`:

1. Require status `PASSED` and an existing result ref/snapshot.
2. Verify expected base and commit ancestry or patch/diff base binding.
3. Recompute actual paths and run the path-boundary validator.
4. Run Stage A scope/result validation.
5. Run Stage B review and permitted owner-bound repair.
6. Apply exactly one result using `merge_strategy`.
7. Run its required integration probe before continuing.
8. Record the new integration HEAD/diff and invalidate assumptions tied to the
   prior integration state.

After all accepted results, run complete global verification. A conflict,
patch failure, failed probe, or unit that fails only after another integration
transitions to `INTEGRATION_BLOCKED`.

Path/Stage A and Stage B verdicts are parent-owned structured evidence bound to
the unit result identity. Missing callbacks, `undefined`, stale identities, or
unit-authored boolean claims are not pass verdicts.

Atomicity:

- `all-or-nothing`: preserve the pre-fan-in base and roll back only results
  created/applied by this run when integration/global verification fails. Mark
  the transaction dirty before each apply so a partially mutating apply that
  throws also triggers rollback; verification exceptions do the same;
- `independent-successes`: preserve verified independent results but do not
  represent the overall run as passed;
- `user-decision`: stop before partial fan-in and request the numbered choice.

Never perform destructive rollback on unrelated user state. Retry only a
classified transient integration failure within `max_attempts`; conflicts,
path violations, contract violations, stale bases, and deterministic test
failures are not automatic retries.

## Repair Assignment

```yaml
repair_assignment:
  finding_id:
  original_unit_id:
  repair_owner: original-unit | integration-owner
  workspace_path:
  base_result_ref:
  contract_hash:
  allowed_paths: []
  ownership_transfer_approved: false
```

Default to original unit, original workspace, original scope, current contract
hash, and exact result. A repair write stales prior evidence. A cross-unit
finding may transfer to an integration owner only after explicit classification,
recorded ownership transfer, updated scopes, and invalidation of affected
results/evidence. Re-run path validation, Stage A, Stage B, and verification.
Deferred blocking findings remain `BLOCKED` and cannot fan in.

## Contract Revision

The frozen contract records path, hash, revision, approved-plan source hash,
and superseded identity. A non-semantic erratum still creates a new explicit
hash/revision and causes affected units to acknowledge it and evidence to be
re-evaluated.

A behavioral, scope, permission, ownership, API/data shape, route, validation,
acceptance, or deliverable change is material:

```text
CONTRACT_CHANGED -> PLAN_REVISION_REQUIRED
```

Stop affected dispatch/fan-in, create and approve a new immutable plan snapshot,
issue a new contract identity, mark dependent prior results/evidence `STALE`,
then re-brief and rerun affected units.

## Failure Policy

Record timeout per unit, transient/deterministic classification, retry count,
runtime cancellation support, straggler handling, partial-success policy,
rollback, checkpoint path, and idempotency key (`contract_hash + unit_id +
attempt + base_head`). A crash/no result, claimed success with non-zero exit,
fake path report, timeout, or deterministic violation is not `PASSED`.

Fail-fast cancels pending work only when the runtime supports cancellation;
otherwise stop new dispatch and report in-flight work as best effort.
Best-effort may finish independent units but does not fan in blocked results.

## Evidence And Redaction

```yaml
verification_evidence:
  command:
  cwd:
  started_at:
  finished_at:
  exit_code:
  associated_head_or_diff:
  output_digest:
  environment_fingerprint:
```

The associated identity must be the exact commit, patch, or canonical diff.
Wrong cwd, old HEAD, output digest mismatch, or any later write makes evidence
stale. Integration requires new integration evidence. Global verification must
run after the final accepted result. Read-only evidence also stores the empty
changed-path proof.

Redaction excludes secret/env/key/credential paths and configured patterns from
briefs and logs, runs an available secret scan, records PII/log sanitation, and
never copies unnecessary repository/customer content.

## State Machine

Normal progression:

```text
PRECHECK -> CLASSIFIED -> ISOLATED -> BRIEFED -> DISPATCHED
-> UNIT_REVIEWED -> UNIT_VERIFIED -> FAN_IN -> GLOBAL_VERIFIED -> BRANCH_READY
```

Exceptional transitions:

```text
CONTRACT_CHANGED -> PLAN_REVISION_REQUIRED
PATH_VIOLATION -> UNIT_FAILED
BLOCKING_FINDING -> UNIT_BLOCKED
UNIT_REPAIRED -> UNIT_REVIEWED
WRITE_AFTER_VERIFY -> GLOBAL_VERIFICATION_STALE
WRITE_AFTER_BRANCH_READY -> BRANCH_READY_STALE
MERGE_CONFLICT -> INTEGRATION_BLOCKED
```

Invariants:

1. No write unit dispatches without base, workspace, ownership, verification,
   result, and evidence protocols.
2. Only `PASSED` units fan in.
3. Any out-of-scope path fails the unit.
4. Contract revision stales affected results/evidence.
5. Repair writes stale affected evidence.
6. Integration changes require integration verification.
7. Writes after verification or branch-ready invalidate that state.
8. Read-only units produce zero changed paths.
9. Deferred blocking findings are `BLOCKED`.

## Final Tail

Write-capable contexts cannot represent `verify_before_done: false`,
`branch_ready_final_gate: false`, or `no_writes_after_branch_ready: false`.
Run every write-producing tail step first. Verify-before-done and branch-ready
are read-only. A later write transitions to stale and requires both relevant
checks to rerun before any Git artifact handoff.
