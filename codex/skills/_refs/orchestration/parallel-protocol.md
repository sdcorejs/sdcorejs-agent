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
- [Product Lifecycle DAG](#product-lifecycle-dag)
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
  frozen_contract_path: .sdcorejs/plans/<track>/<id>.parallel.json
  frozen_contract_hash: <SHA-256 of exact frozen JSON bytes>
  ownership_manifest_digest: <digest of normalized unit ownership and capabilities>
  revision: <integer>
  supersedes: <prior immutable .parallel.json path or null>
```

The `approved-plan` branch is mandatory if any unit can write. Before sync
validation, call `verifyApprovedOwnershipAuthority(...)`. It reads and
realpaths the approved spec, approved plan, and frozen JSON; rejects symlinked
path components; invokes `validateApprovedPlanIntegrity`; verifies exact file
hashes; and returns an opaque WeakMap-backed authority. Consume that object once
through
`await validateDispatchContextWithAuthority(context, { approvedOwnershipAuthority })`.
Consumption re-reads and re-hashes every authority file, binds the current
contract and manifest, rechecks the canonical top-level plus stable filesystem
and Git metadata directory identity, and invalidates the issued token.
The synchronous validator accepts only the private one-shot lease created by
that wrapper. A plain object, a reused token, a token from another repository,
or caller-recomputed hashes are not authority.

`planContext.target_root` must be an absolute path whose canonical realpath is
the same as `repositoryRoot`. The authority also binds the top-level directory,
Git directory, Git common directory filesystem identities, Git object format,
and the target filesystem's observed case semantics. Ownership containment and
fan-in path matching use that bound case behavior rather than unconditional
case folding or a caller override. This rejects a copied chain, a
symlink/junction redirect, or a different repository recreated later at the
same target path. A changed target requires
a new explicit approval and new immutable snapshots; copying or editing the old
chain is not approval. Snapshot and contract hashes provide tamper-evident
integrity and cross-binding only. They are not cryptographic authenticity
against an actor that can arbitrarily rewrite the repository and every approval
artifact; that threat requires a separately protected signer or trust store.

The approved plan frontmatter, hashed body `plan_context`, and handoff
`planContext` must agree on `frozen_contract_path`, `frozen_contract_hash`,
`ownership_manifest_digest`, `parallel_contract_revision`, and
`parallel_contract_supersedes`. All three files must be regular, non-symlinked,
valid UTF-8 files; hash the frozen JSON's exact bytes before decoding. The
frozen JSON is a closed schema containing
only `schema_version`, `contract_id`, `revision`, `supersedes`,
`ownership_manifest_digest`, and unique `units`. It deliberately omits
`approved_plan_hash` to avoid a hash cycle. Every frozen unit allowlist must be
contained by approved plan `allowed_paths` and disjoint from its
`prohibited_paths`.

```yaml
contract:
  source: read-only-request
  request_hash: <hash of normalized request>
  scope_hash: <hash of file/report scope>
  write_policy: deny
```

The `read-only-request` branch must omit approved-plan fields. Its unit
allowlists are empty, workspace strategy is `shared-readonly`, and result type
is `report`. The parent must run the unit through
`observeReadOnlyExecution(...)`. The module canonicalizes the Git top-level and
derives before/after state internally with shell-free `execFile` calls over
`HEAD`, the symbolic branch/ref, all refs, the index, local Git config, linked
worktree metadata, porcelain status, staged and unstaged binary diffs, tracked
path state, untracked and ignored path/content snapshots, empty-directory
topology, and a declared stable Git metadata scope. That metadata scope covers
the common object store, hooks, info, packed refs, shallow state, and per-worktree
config; it compares deterministic path, kind, mode, size, target, and content
identity rather than volatile timestamps. Caller callbacks may execute the
read-only action but cannot author state or changed-path evidence. Equal
non-empty internal snapshots
issue an opaque proof bound to the canonical repository, request hash, scope
hash, unit ID, and exact report result. Consume the proof exactly once through
`validateReadOnlyDispatchContext(context)`; immediately before acceptance it
recomputes repository state internally and requires equality. Caller-authored,
stale, reused, or replayed proof objects fail closed. A detected persistent write
is `PATH_VIOLATION -> UNIT_FAILED`.

This observation is not an OS sandbox. A write that is completely created and
deleted between snapshots can be transiently invisible, and a malicious host
that can subvert Git, Node, or the filesystem can falsify the observation. Use
an OS-level read-only sandbox or equivalent isolation for those threat models.

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

  product_flow: # optional; required when a product contract participates
    validation_phase: preflight | completed

  integration:
    workspace_path:
    branch:
    base_head:
    merge_strategy: cherry-pick | patch | disjoint-same-tree
    merge_order: []
    atomicity: all-or-nothing | independent-successes | user-decision
    user_decision: <opaque one-shot authority from observeIntegrationDecision>
    rollback_strategy: <required executable strategy for all-or-nothing>

  fan_in_authority: <fresh opaque one-shot lease from verifyFanInAuthority>

  units:
    - id:
      role:
      wave:
      depends_on: []
      produces: []
      consumes: []
      contract_hash:
      product_stage_id: <required when product_flow is present>

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
        allowed_lockfiles: []
        sensitive_write_capabilities:
          - capability: environment-file | package-manifest | lockfile | migration
            approved_by: parent
            approval_ref: <frozen parent approval identity>
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
        contract_hash:
        ref:
        base_head:
        associated_head_or_diff:
        changed_paths: []
        exit_code:
        output_digest:
        blockers: []

      evidence: # optional
        contract_hash:
        status: PASS
        parent_validated: true
        associated_head_or_diff:
        result_output_digest:
        output_digest:

      read_only_proof: # opaque token returned by observeReadOnlyExecution
        before_state:
        after_state: <must equal before_state>
        changed_paths: []
        actual_writes: []

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
- every approved-plan write unit uses the outer `frozen_contract_hash` as its
  `contract_hash`; when a result or evidence object exists, its
  `contract_hash` must equal the same outer hash;
- the parent computes `ownership_manifest_digest` from normalized, ID-sorted
  unit ownership records, including sensitive-write capabilities. The hashed
  approved-plan body anchors that digest and the frozen JSON path/hash; the
  file-backed authority then binds the live manifest and canonical repository
  root. Changing units and recomputing a caller field still fails;
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
or dirty ownership cannot be resolved. Malformed path arrays return validation
errors rather than throwing. Read-only mode records HEAD and a status snapshot
so an equal after-snapshot plus empty actual-write and changed-path arrays prove
zero writes.

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

Treat wildcard-prefix intersections conservatively. For example,
`src/feature*/**` may intersect `src/feature-one/**`; ambiguous or unsupported
glob syntax demotes the topology to sequential instead of throwing or claiming
disjoint ownership.

Topologically sort units into deterministic waves. A cycle or missing dependency
is blocking. Derive roles from the plan; do not manufacture Product, Design,
Backend, Frontend, or QC units. Test authoring may run before integration when
its inputs are frozen. Cross-stack execution consumes integrated results and
therefore runs in a later wave.

## Product Lifecycle DAG

When `product_flow` is present, call
`validateProductOrchestration(productFlow, { validationPhase:
productFlow.validation_phase })` from `_refs/product/product-protocol.mjs`.
Every stage carries the frozen contract hash. The required order is:

```text
seed-from-approved-spec
  -> implementation and test authoring/execution
  -> deterministic integration fan-in
  -> all other write-producing tails
  -> traceability-sync (integration-owned, derived ledger/index only)
  -> global verification associated with the post-sync state
  -> audit-readonly (write_policy: deny; zero actual writes)
  -> ship consuming the audit context
```

Sync must consume integrated changed paths and test evidence and must not own
normative product docs, approved specs, or approved plans. Audit depends on
post-sync global verification. Ship depends on and consumes audit, not seed or
sync. Missing stages,
contract-hash mismatch, premature sync, writable audit, or evidence associated
with the pre-sync state is blocking. Contract-bound roles remain `ROLE-SPLIT`
even when their dependencies produce multiple deterministic waves.

Actual dispatch units and lifecycle stages have an explicit bidirectional
binding. Every item in `parallel_context.units` declares `product_stage_id`,
and that lifecycle stage declares `unit_id` equal to the dispatch unit's `id`.
Conversely, every lifecycle stage that declares `unit_id` must resolve to an
actual unit whose `product_stage_id` names that stage. Both sides are unique.
Every `implementation` and `test-evidence` stage must carry this binding and
must resolve to an actual unit; a stage-only placeholder is not execution
evidence. Parent-owned lifecycle stages such as seed, fan-in, sync, audit, and
ship may omit `unit_id` when they are orchestration steps rather than dispatched
units.

`product_flow.validation_phase` is explicit. `preflight` validates the planned
binding and cannot be represented as completed execution. In `completed`, each
bound implementation or test unit must be `PASSED` and have a non-null result
reference, associated HEAD/diff, and output digest. Its evidence must report
`PASS`, be marked `parent_validated: true`, bind the same associated state and
result output digest, and carry its own output digest. The lifecycle stage must
also report `PASS` and copy the unit result identity, result output digest, and
evidence digest. A never-run placeholder cannot satisfy completed-flow
validation.

Use one `write-tail-complete` stage after fan-in and one
`global-verification` stage after sync. Every stage declares `write_policy`.
The global-verification stage is deny-write, reports `status: PASS`, records an
`output_digest`, and binds `associated_head_or_diff` to `post_sync_state`.
Every allow-write stage except sync must be a transitive ancestor of sync;
sync is the final write. Any later reported write, including after audit,
invalidates the flow.

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
Before dispatch, `validateWorkspaceRealpaths(...)` must resolve every unit,
verification-cwd, integration, and known worktree path; reject symbolic-link or
junction components, aliases to the same canonical path, and canonical
parent/child nesting in either direction between every unit workspace/cwd and
the integration workspace. `validateDispatchWorkspaceRealpaths(...)` additionally
compares every unit workspace/cwd against every other unit, independent of the
caller-provided `existing_worktrees` list, and rejects equal, aliased, or nested
pairwise realpaths.
Record which worktrees the current run created. Cleanup may remove only those
recorded worktrees after verifying their resolved paths; never remove a
pre-existing or nested worktree.

## Mechanical Path-boundary Validator

The parent/integration owner, not the unit report, performs this algorithm:

1. Obtain actual tracked, staged, unstaged, untracked, added, deleted, and
   renamed paths from Git plus relevant filesystem evidence.
2. Enforce the closed supported Git name-status grammar. Expand rename status
   `R` or a score from `R0` through `R100` into source deletion and destination
   addition. Reject `R101`, every other invalid `R`-prefixed value, unknown or
   malformed status, and a rename without a non-empty `from` source path.
3. Normalize separators and `.` segments; reject absolute paths and `..`
   escapes, including drive-relative paths. Apply filesystem case rules.
4. Resolve existing symlinks and every existing ancestor of new paths. Reject
   an escape from the repository real path. Apply the full allow/prohibit,
   unconditional protected-path, sensitive-capability, and lockfile-allowlist
   policy again to each projected in-repository target.
5. Detect submodule and nested-repository boundaries, including when the
   changed path is the nested repository leaf root; reject them.
6. Match every normalized actual path against the unit allowlist and prohibited
   list. `.git/**` and `.sdcorejs/{specs,plans}/**` are unconditional deny
   boundaries that no allowlist can widen. Environment files, package
   manifests, lockfiles, and migration paths require a complete parent-approved
   capability whose declaration is part of the frozen ownership-manifest
   digest. Caller-provided `allowed_paths: ['**']` never bypasses these rules.
7. Detect parent/child and glob overlap between units before dispatch.
8. Require every computed, result, and parent-verdict changed-path entry to be a
   non-empty string. Compare the computed list with the unit's report. A
   mismatch or malformed entry is failure, not a warning.
9. Store the exact normalized actual list in result/evidence.

Any formatter, generator, install, or other command that spills outside scope
causes `PATH_VIOLATION -> UNIT_FAILED`.

## Deterministic Fan-in

Immediately before fan-in, call `verifyFanInAuthority(...)` with the canonical
repository root, approved-plan contract, exact unit/result set, integration
object, approved spec path, and plan context. It independently re-reads and
re-verifies the approved spec, approved plan, and frozen ownership contract,
then issues a private one-shot lease bound to the stable repository identity
and full observed Git/repository state, contract identity, normalized ownership,
exact results, merge order, and merge strategy.
`integrateResults(...)` requires and consumes that lease; standalone or
contractless report, patch, or cherry-pick fan-in is forbidden. Before any apply
callback it checks both unit and result contract hashes, merge-strategy/result
type compatibility, and every reported changed path against the authority's
trusted frozen ownership rather than caller-replaced ownership.

Lease consumption re-reads all three approval files and recomputes repository
state. After the parent validation, review, and checkpoint callbacks, it repeats
the file-backed approval verification and requires the complete repository
snapshot to equal the pre-callback snapshot immediately before each `apply`.
After `apply`, it re-reads the approval chain again, derives actual path changes
from internal index, dirty tracked, untracked, ignored, and empty-directory
manifests, and validates every observed path against frozen ownership and the
unit result. After `probe`, it re-reads approval once more and requires the
repository snapshot to equal the accepted post-apply snapshot. Changing
approval files, refs, branch, config, index, worktree metadata, object storage,
or filesystem content during a read-only callback blocks fan-in.

For each ID in `integration.merge_order`:

Require explicit executable per-unit `checkpoint`, `apply`, `probe`, and
`rollbackUnit` callbacks before the first validation or mutation. Missing
callbacks block integration; no-op defaults are forbidden. `all-or-nothing`
also requires its transaction-level `rollback` callback.

1. Require status `PASSED` and an existing result ref/snapshot.
2. Verify expected base and commit ancestry or patch/diff base binding.
3. Recompute actual paths and run the path-boundary validator.
4. Run Stage A scope/result validation.
5. Run Stage B review and permitted owner-bound repair.
6. Capture an internal pre-callback repository snapshot, obtain the caller's
   per-unit checkpoint, revalidate the approval chain and snapshot, then apply
   exactly one result using `merge_strategy`. Re-read approval, capture the
   post-apply state, and reject any internally observed path outside frozen
   ownership or absent from the unit's result path set.
7. Run its required read-only integration probe, re-read approval, and require
   the repository to remain equal to the accepted post-apply state. If apply or probe
   throws under any atomicity policy, roll the current unit back to its
   checkpoint, recompute repository state independently, and require exact
   equality with the pre-unit snapshot before retrying or stopping. A callback
   that returns without restoring state is `ROLLBACK_FAILED` with
   `rollbackRequired: true`.
8. Only after a successful probe, record the unit as integrated and record the
   new integration HEAD/diff; invalidate assumptions tied to the
   prior integration state.

Changed paths from different units must not overlap after separator and
filesystem-case normalization. Equality and parent/child relationships are
both conflicts; for example, `Generated` conflicts with
`generated/result.json` on a case-insensitive filesystem.

After all accepted results, re-read approval and capture the final accepted
repository digest. The parent independently reads the actual post-integration
HEAD or canonical diff. Run complete global verification against that state and
repository digest; require the returned `associated_head_or_diff` and
`repository_state_digest` to equal both inputs exactly. Capture repository state
after each state-reader and verification callback, then re-read approval once
more. Any write or digest change fails and applies the declared rollback policy
to close the verification TOCTOU window. A unit-supplied identity, a
stale expected identity, or merely a non-empty identity is insufficient. A
conflict, patch failure, failed probe, or unit that fails only after another
integration transitions to `INTEGRATION_BLOCKED`.

Path/Stage A and Stage B verdicts are parent-owned structured evidence bound to
the unit result identity. Missing callbacks, `undefined`, stale identities, or
unit-authored boolean claims are not pass verdicts.

Atomicity:

- `all-or-nothing`: capture the internal pre-fan-in repository state, restore
  the currently mutating unit from its checkpoint, then invoke transaction-level
  rollback for every attempted result created/applied by this run, including a
  partially applied first unit. Recompute state and require exact equality with
  the pre-fan-in snapshot; no-op or incomplete global rollback is
  `ROLLBACK_FAILED` with `rollbackRequired: true`. Verification exceptions do
  the same;
- `independent-successes`: restore the currently mutating unit from its
  checkpoint and preserve only earlier units whose probes succeeded; do not
  represent the overall run as passed;
- `user-decision`: the parent calls `observeIntegrationDecision(...)` to issue
  a private opaque authority bound to the approved contract identity, exact
  result-set identity, integration identity, durable decision reference,
  canonically derived decision attestation, and effective atomicity. Consume it once
  before mutation. A raw echoed request, plain object, replay, or binding change
  stops with `USER_DECISION_REQUIRED`. The parent decision observer remains a
  trust boundary: the module recomputes and verifies the canonical attestation
  at issuance and consumption, but cannot
  prove the parent actually obtained human authorization.

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
  supersedes_contract_path: <required for a widening transfer>
  allowed_paths: []
  ownership_transfer_approved: false
```

Default to original unit, original workspace, original scope, current contract
hash, and exact result. A repair write stales prior evidence. A cross-unit
finding may transfer to an integration owner only through
`assignRepairWithAuthority(...)` and a fresh, file-verified opaque authority for
the revised immutable contract. The revised authority must name the same unit,
use a later revision, bind the new frozen hash, supersede the original frozen
contract path, and define the exact transfer allowlist. Caller-authored transfer
approval, hashes, or widened paths have no authority. The transfer invalidates
affected results/evidence and cannot widen under the old hash.
Exact or case-only `.git`, `.sdcorejs/specs`, and `.sdcorejs/plans` roots remain
protected. Re-run path validation, Stage A, Stage B, and verification.
Deferred blocking findings remain `BLOCKED` and cannot fan in.

## Contract Revision

The immutable `.parallel.json` records schema version, contract ID, revision,
superseded frozen-contract path, normalized ownership-manifest digest, and the
closed list of unique unit ownership records. Its exact byte hash, path,
manifest digest, revision, and supersession identity are anchored in approved
plan frontmatter, hashed body context, and handoff context. It omits the final
approved-plan hash to avoid a cycle; the authority verifier binds that plan
separately. Any ownership or sensitive-capability change therefore changes the
frozen contract and requires a newly approved plan revision. A non-semantic
erratum still creates a new explicit hash/revision and causes affected units to
acknowledge it and evidence to be re-evaluated.

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
  contract_hash:
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
For approved-plan write work, this evidence `contract_hash` and the result
`contract_hash` must equal the unit and outer frozen-contract hash.
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
10. Completed product stages bind to actual parent-validated unit result and
    evidence identities.
11. Global verification binds exactly to an independently observed
    post-integration state.
12. Issued ownership authority is re-read and consumed once at dispatch or
    revised-repair assignment.
13. A failed apply/probe leaves no current-unit mutation under any atomicity
    policy; only successfully probed units enter the integrated set.
14. Read-only proof and user-decision authority are opaque and one-shot; current
    repository/integration identity must still match at consumption.
15. Exported validators reject malformed top-level inputs with deterministic
    blocking errors rather than throwing or accepting them.
16. Fan-in consumes a fresh private file-reverified authority bound to the
    repository, contract, exact results, frozen ownership, and merge strategy.
17. Per-unit and global rollback are successful only when an independent
    repository-state reread equals their captured pre-mutation state.
18. Repository snapshots bind symbolic branch/ref, all refs, index, local Git
    config, linked worktrees, tracked diffs/path state, untracked/ignored
    content, empty directories, and the declared stable Git metadata/object
    scope; fan-in revalidates approval before and after apply, after probes, and
    around final verification callbacks.

## Final Tail

Write-capable contexts cannot represent `verify_before_done: false`,
`branch_ready_final_gate: false`, or `no_writes_after_branch_ready: false`.
Run every write-producing tail step first. Verify-before-done and branch-ready
are read-only. A later write transitions to stale and requires both relevant
checks to rerun before any Git artifact handoff.
