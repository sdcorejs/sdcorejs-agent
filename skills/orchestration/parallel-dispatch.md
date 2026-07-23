---
name: sdcorejs-parallel-dispatch
description: Parallel execution gate and subagent fan-out discipline. Use after execute-plan asks sequential vs parallel and user chooses parallel, when an approved plan is explicitly split across agents, or for read-only parallel audits. Validates protocol-v2 contracts, runtime capabilities, path/resource ownership, per-unit isolation, DAG waves, deterministic fan-in, repair ownership, and evidence freshness. Applies to all tracks and generic work. Runtime-localized.
allowed-tools: Read, Write, Glob, Grep, Bash, Agent
---

# Parallel Dispatch

## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Read `_refs/orchestration/parallel-protocol.md` completely and validate every dispatch against it.
5. Import the deterministic validators from `_refs/orchestration/parallel-protocol.mjs`; do not reimplement their contract, path, workspace, topology, fan-in, repair, evidence, or state checks in prompts.
   When `product_flow` is declared, that validator delegates lifecycle checks
   to `_refs/product/product-protocol.mjs`.
   For write work, first call `verifyApprovedOwnershipAuthority(...)`, then
   consume its verified opaque result exactly once through
   `await validateDispatchContextWithAuthority(context, { approvedOwnershipAuthority })`.
   That wrapper re-reads the authority files and runs canonical workspace
   realpath checks immediately before dispatch. Never substitute a
   caller-authored object/digest or reuse a consumed authority.
6. For write-capable work, read `_refs/orchestration/workspace-isolation.md` before creating or selecting unit workspaces.
7. Current user request, current files, diffs, logs, failing tests, and command output override stored context.
8. Before a user-facing choice, apply `_refs/shared/user-choice-prompt.md`.

## Purpose

This skill is the fail-closed gate for parallel work. It validates a protocol-v2
contract, classifies the dependency topology, dispatches only mechanically safe
units, integrates immutable or exact-diff results deterministically, and runs
global verification plus the final read-only branch-ready gate.

The public compatibility verdicts remain:

- `SEQUENTIAL`
- `PARALLEL-CANDIDATE`
- `ROLE-SPLIT`

The underlying topology is one of `READ_ONLY_FANOUT`,
`INDEPENDENT_WRITE_UNITS`, `CONTRACT_BOUND_ROLES`, or `SEQUENTIAL_DAG`.

Parent write permission is narrow: it may write an approved protocol/brief
artifact under the target `.sdcorejs/` area and may apply validated unit results
in the integration workspace. It does not own implementation files. Shared
implementation paths belong to a concrete unit or `integration-unit`;
`parent-contract-only` owns contract metadata only. In the read-only contract,
the parent and units make no writes.

## Entry Contracts

Accept exactly one discriminated contract branch:

1. `approved-plan` for every write-capable unit. It requires a contract ID,
   immutable approved-plan path and hash, frozen-contract identity, working-tree
   preflight, per-unit workspace/result protocol, a file-backed trusted
   ownership authority, and mandatory final tail. The approved plan must anchor
   the immutable `.parallel.json` path/hash, normalized ownership digest,
   revision, and supersession identity in both frontmatter and its hashed body.
2. `read-only-request` for report/evidence-only fan-out. It requires request and
   scope hashes plus `write_policy: deny`. It must not invent approved-plan
   fields. Every unit uses `shared-readonly`, has no writable paths, returns a
   report, and proves equal before/after state with empty computed changed-path
   and actual-write arrays.

Unapproved implementation returns to `sdcorejs-plan`. A direct write-capable
invocation must run the same working-tree preflight as `sdcorejs-execute-plan`;
direct invocation is not a bypass.

## Workflow

### 1. Precheck

1. Run `sdcorejs-explore (summary-read)` through project-context. Do not refresh the summary merely because execution is
   write-approved.
2. For write work, read/realpath the approved spec, approved plan, and frozen
   JSON through `verifyApprovedOwnershipAuthority`. Require valid UTF-8, exact
   frozen bytes/hash, closed schema, unique unit IDs, plan-contained ownership,
   and a token bound to this repository; consume it once so the approved files
   are re-read/re-hashed and workspace paths are canonicalized immediately
   before dispatch, then validate the contract union.
3. Capture current branch, HEAD, staged, unstaged, untracked, dirty-diff hash,
   unrelated dirty paths, and intended-output overlap.
4. Negotiate runtime capabilities. Unknown write-heavy capability is blocking.
5. Derive paths, stacks, executors, commands, roles, and resources from the
   approved plan and target evidence. Do not assume a framework or directory
   layout.
6. Emit the complete `parallel_context` from the protocol reference.

The emitted context begins with:

```yaml
parallel_context:
  schema_version: 2
  contract: <approved-plan or read-only-request>
  target:
    stack_profile: <detected or plan-provided profile>
  units: []
  global_verification: {}
```

For consumers that still read `allowed_paths_by_unit`, provide it only as a
derived compatibility projection of `units[].ownership.allowed_paths`. The
protocol-v2 unit records, `prohibited_paths`, and `shared_files` ownership are
authoritative; the projection cannot grant write permission.

If the working tree, contract, runtime, or target boundary cannot be proven
safe, return `SEQUENTIAL`, return to the appropriate plan/execution decision,
or mark the run `BLOCKED`; do not dispatch optimistically.

### 2. Classify And Wave

Build a dependency/resource graph from each unit's `depends_on`, `produces`,
`consumes`, path ownership, exclusive resources, shared read-only resources,
ports, database namespace, temp/cache/coverage roots, and expected cost.

- Read-only audits may share one checkout.
- Two expensive independent write units are enough to justify parallelism.
- Heterogeneous independent units may run together when ownership is disjoint.
- Contract-bound roles run as plan-derived DAG waves, not as an unconditional
  Product/Design/Backend/Frontend/QC flat wave.
- Resource or path conflicts force separate waves or sequential execution.
- Wildcard-prefix or malformed/ambiguous glob intersections fail closed to
  sequential execution.
- Cross-stack test authoring may run early; execution waits for required
  integrated implementation results.

Do not dispatch approval gates, contract drafting, shared-file mutation, or a
single cheap task.

### 3. Isolate And Brief

Each write unit must have a known workspace strategy, path, branch when
applicable, common base HEAD, ownership scope, resource allocation,
verification command/cwd, result type, failure policy, and current contract
hash. Supported strategies are:

- `shared-readonly`
- `disjoint-same-tree`, only after mechanical path and resource checks
- `worktree`, with a distinct unit worktree/result and separate integration
  workspace

Briefs are self-contained and include contract identity, approved-plan slice,
dependencies, exact scope, allowed/prohibited paths, resources, verification,
result protocol, redaction rules, and out-of-scope behavior. A unit may not
self-certify path compliance and may not spawn subagents.

### 4. Dispatch And Collect

Dispatch only units whose dependencies are satisfied. Respect the runtime's
effective concurrency. If calls serialize, run explicit sequential waves and
report that real concurrency was unavailable.

Each result must identify its commit, patch, exact working-tree diff, or report;
the expected base; actual changed paths computed by the parent; exit code;
blockers; and evidence digest. A missing result, non-zero claimed success,
wrong cwd/base, timeout, deterministic path/contract violation, or unexpected
write fails or blocks the unit under the protocol state machine.
For read-only units, independently compare the before/after state and require
all result/proof changed-path and actual-write arrays to be empty. Run the unit
through `observeReadOnlyExecution(...)`; only its opaque parent-observed proof,
bound to repository/request/scope/unit/result identity, is admissible. Consume
it once with `validateReadOnlyDispatchContext(..., { readState })`, which must
independently confirm that current repository state still equals the observed
state.

### 5. Review, Repair, And Fan In

For each result:

1. Recompute changed paths from Git/filesystem evidence.
2. Run the mandatory path-boundary validator from the protocol reference.
3. Validate base ancestry/result identity and Stage A scope compliance.
4. Run Stage B `sdcorejs-review` for changed code.
5. Route valid findings through `sdcorejs-repair-loop` using an explicit
   `repair_assignment` bound to the original owner, workspace, base result,
   current contract hash, and allowlist.
6. Re-run Stage A, Stage B, path validation, and unit verification after writes.
7. Fan in only a `PASSED` unit, one at a time, in declared merge order using the
   declared cherry-pick, patch, or disjoint-same-tree strategy.
8. Run required integration probes after each accepted result.

Call fan-in only with explicit executable per-unit `checkpoint`, `apply`,
`probe`, and `rollbackUnit` callbacks; `all-or-nothing` also requires the global
rollback callback. Restore the current unit checkpoint after every failed apply
or probe under every atomicity policy, and record a unit as integrated only
after its probe succeeds. Resolve `user-decision` to a structured approved
effective policy and durable decision reference through the opaque one-shot
authority returned by `observeIntegrationDecision(...)`; a plain object cannot
authorize mutation. After global verification, independently reread the repository state and require it
to equal the pre-verification observed identity; a change triggers the declared
rollback/failure policy.

Deferred blocking findings produce `BLOCKED`, never `PASSED`. A cross-unit
repair must use `assignRepairWithAuthority(...)` with a fresh file-verified
opaque authority for a later immutable revision. It must supersede the original
frozen contract path and use the exact revised unit allowlist; caller-authored
approval, hashes, or widened paths are rejected. The transfer invalidates all
affected evidence, and exact or case-only protected roots remain denied.

### 6. Contract Change Control

Never mutate an approved plan or frozen contract in place.

- A non-semantic erratum creates a new revision/hash record and re-evaluates
  affected evidence.
- A material change transitions to `PLAN_REVISION_REQUIRED`, stops affected
  dispatch/fan-in, returns to `sdcorejs-plan`, obtains approval for a new
  immutable plan revision, marks dependent old results/evidence `STALE`, and
  re-briefs affected units.

### 7. Global Verification And Final Tail

After deterministic fan-in, run every discovered global command against the
exact integrated HEAD/diff. Each evidence record contains command, cwd,
timestamps, exit code, associated result identity, output digest, and
environment fingerprint.

When a product contract is in scope, Product is not an initial build-wave role.
Enforce the declared lifecycle: approved seed/freeze -> implementation and test
waves -> deterministic fan-in -> every other write-producing tail ->
`traceability-sync` owned by the integration unit -> global verification on the
post-sync state -> `audit-readonly` with zero writes -> ship. Every behavior
unit consumes the same frozen contract hash. A premature sync, writable audit,
ship bypass, or post-audit relevant write fails the product flow and stales its
evidence.

For write-capable work, `verify_before_done`, `branch_ready_final_gate`, and
`no_writes_after_branch_ready` are always true. Run all write-producing tail
steps before `sdcorejs-ship (verify-before-done mode)`, then run
`sdcorejs-ship (branch-ready mode)` as the last read-only gate. Any later write
invalidates the corresponding evidence and requires rerunning the gate.
No writes after branch-ready are permitted without that invalidation and rerun.

## Reporting

Report the topology, compatibility verdict, runtime capability/fallback,
per-unit status/result/evidence, integration order and atomicity outcome,
global checks, final gate, and genuine blockers. Distinguish deterministic
local simulation from real runtime concurrency evidence.

## Rules

### Must do

- Validate protocol v2 before dispatch.
- Fail closed on unknown write-heavy capability, ownership, base, workspace, or
  result identity.
- Mechanically compute actual changed paths and store the normalized list.
- Expand both unscored and scored Git renames (for example `R100`) into source
  deletion plus destination addition, require a non-empty source path, and
  reject invalid/unknown name-status values including scores above `R100`.
- Require every result and parent-verdict changed-path entry to be a non-empty
  string.
- Reapply protected, sensitive, and lockfile policy to projected symlink targets
  and reject nested-repository leaf roots.
- Canonicalize unit/integration/cwd/worktree realpaths and reject symlink,
  junction, alias, and bidirectional nesting collisions between every unit
  workspace/cwd and integration, including pairwise checks across all unit
  workspace/cwd paths without trusting `existing_worktrees`.
- Use plan-derived DAG waves and deterministic integration.
- Keep approved snapshots immutable and stale old evidence after revision.
- Route repairs to an explicit owner/workspace.
- Surface partial failures and unsupported cancellation honestly.
- Run global verification and final branch-ready on the final state.

### Must not

- Require fake approved-plan fields for read-only requests.
- Treat disjoint application files as sufficient isolation proof.
- Let a prompt allowlist replace mechanical path validation.
- Accept a self-signed ownership digest, a forged authority object, or an
  stale/reused authority token or one issued for another repository.
- Accept a caller-authored read-only proof or ownership-transfer approval.
- Accept a caller-authored or replayed integration user-decision authority.
- Use `parent` as an implementation-file owner; use a concrete unit,
  `integration-unit`, or `parent-contract-only`.
- Retry deterministic path or contract violations automatically.
- Fan in failed, blocked, cancelled, or stale units.
- Hard-code one framework, package manager, directory layout, or five-role wave.
- Promise timeout/cancellation/concurrency a runtime cannot provide.
- Write after final branch-ready without invalidating and rerunning it.

## Cross-references

- `_refs/orchestration/parallel-protocol.md` - normative schema, validators,
  state machine, fan-in, failure, repair, and evidence semantics.
- `_refs/orchestration/parallel-protocol.mjs` - distributed deterministic
  validator implementation used by runtime automation and tests.
- `_refs/orchestration/workspace-isolation.md` - safe unit/integration workspace
  creation and cleanup ownership.
- `sdcorejs-execute-plan` - approved-plan execution entrypoint.
- `sdcorejs-plan` - immutable plan creation and revision approval.
- `sdcorejs-review`, `sdcorejs-repair-loop`, and `sdcorejs-ship` - per-unit
  review/repair and final verification gates.
