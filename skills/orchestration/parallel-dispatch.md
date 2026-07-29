---
name: sdcorejs-parallel-dispatch
description: Parallel execution gate and role-aware subagent fan-out discipline. Use when an approved plan has multiple feasible independent units, when the user explicitly requests a safe split, or for read-only parallel audits. Validates protocol-v2 contracts, capabilities, model tiers, path/resource ownership, task briefs, deterministic fan-in, repair ownership, and evidence freshness. Runtime-localized.
required-actions: artifact.read, artifact.write, context.pass, verification.run, progress.create, progress.update, user.choose, agent.dispatch, agent.resume, agent.interrupt, workspace.isolate
---

# Parallel Dispatch

## Shared Protocols

Read `_refs/shared/runtime-protocols.md` and the complete
`_refs/orchestration/parallel-protocol.md`; use its deterministic validators
rather than reimplementing them in prompts. For write-capable work, load
`_refs/orchestration/workspace-isolation.md` and assign one owner for every
shared artifact. Load `_refs/harness/delegation-policy.json` and
`_refs/harness/task-brief.md` only after dispatch is feasible.

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

Parent write permission is narrow: it may write an approved, change-scoped
protocol artifact under the target `.sdcorejs/` area and may apply validated
unit results in the integration workspace. Runtime `task_brief` and
`review_package` messages stay in the harness/thread and never become mutable
`.sdcorejs/**` checkpoints. The parent does not own implementation files.
Workers may create only approved change-scoped artifacts and must not update
summary, persona, memory, or living track backlogs. The named
integration owner updates shared artifacts once after fan-in and emits the
merged `artifact_context`. Shared implementation paths belong to a concrete
unit or `integration-unit`; `parent-contract-only` owns contract metadata only.
In the read-only contract, the parent and units make no writes.

## Entry Contracts

Accept exactly one discriminated contract branch:

1. `approved-plan` for every write-capable unit. It requires a contract ID,
   immutable approved-plan path and hash, frozen-contract identity, working-tree
   preflight, per-unit workspace/result protocol, and mandatory final tail.
2. `read-only-request` for report/evidence-only fan-out. It requires request and
   scope hashes plus `write_policy: deny`. It must not invent approved-plan
   fields. Every unit uses `shared-readonly`, has no writable paths, returns a
   report, and fails if the before/after changed-path snapshot is non-empty.

Unapproved implementation returns to `sdcorejs-plan`. A direct write-capable
invocation must run the same working-tree preflight as `sdcorejs-execute-plan`;
direct invocation is not a bypass.

## Workflow

### 1. Precheck

1. Assemble read-only `project_context`. Use valid summary sections when
   available; otherwise continue with targeted reads or a scoped code map. Do
   not refresh the summary merely because execution is write-approved.
2. Validate the contract union and its hashes.
3. Capture current branch, HEAD, staged, unstaged, untracked, dirty-diff hash,
   unrelated dirty paths, and intended-output overlap.
4. Negotiate runtime capabilities through
   `_refs/harness/capability-contract.json`. Unsupported or unknown subagent,
   isolation, or per-worker control falls back to sequential parent execution;
   never assume it exists.
5. Derive paths, stacks, executors, commands, roles, and resources from the
   approved plan and target evidence. Do not assume a framework or directory
   layout.
6. Emit the complete `parallel_context` from the protocol reference. Keep it
   authoritative and internal by default; pass it to the execute-plan parent or
   final ship consumer through `context.pass`. If
   `runtime_context_channel` is `unsupported` or `unknown`, use the validated
   portable matrix so contract identity, ownership, unit result identity,
   deterministic fan-in state, global verification, and final-tail state are
   preserved without embedding plan, diff, or log bodies.
7. Carry one runtime `artifact_context` per change. Workers return only their
   owned change-scoped entries; the integration owner performs deterministic
   merge and owns shared entries.

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

Create the exact runtime `task_brief` from `_refs/harness/task-brief.md`.
Reference the approved spec/plan by ID, path, and hash; include only the bounded
plan step or excerpt needed by the unit. Never paste a full spec, full plan, or
repository summary into each worker. A unit may not self-certify path
compliance and may not spawn subagents.

Select one role (`explorer`, `test_writer`, `docs_writer`, `reviewer`, or
`implementation_worker`) and semantic model tier (`fast`, `balanced`, or
`deep`) from `_refs/harness/delegation-policy.json`.

- Fast workers are limited to bounded documentation or test scaffolding after
  behavior, acceptance criteria, test layer, and owned paths are confirmed.
- Test writing is not inherently simple. Security, concurrency, flaky,
  integration-root-cause, and public-contract tests use balanced or deep.
- Architecture, security review, public-contract decisions, and final
  acceptance remain with the parent or a deep reviewer.
- When model override is unsupported or unknown, inherit the parent model and
  record the limitation. Never require a provider model ID.
- Do not create a worker just to run one command. Delegate execution only for
  independent suites or substantial log analysis.

### 4. Dispatch And Collect

Dispatch only units whose dependencies are satisfied. Respect the runtime's
effective concurrency. If calls serialize, run explicit sequential waves and
report that real concurrency was unavailable.

Each result returns the exact runtime `review_package` plus its commit, patch,
exact working-tree diff, or report; expected base; actual changed paths
computed by the parent; exit code; blockers; and evidence digest. A missing
result, non-zero claimed success, wrong cwd/base, timeout, deterministic
path/contract violation, or unexpected write fails or blocks the unit under the
protocol state machine.

### 5. Review, Repair, And Fan In

For each result:

1. Recompute changed paths from Git/filesystem evidence.
2. Run the mandatory path-boundary validator from the protocol reference.
3. Validate base ancestry/result identity and Stage A scope compliance.
4. Run Stage B `sdcorejs-review` for changed code.
5. Prefer `agent.resume` to return valid findings to the original implementer,
   using an explicit `repair_assignment` bound to the original owner,
   workspace, base result, current contract hash, and allowlist. Permit at most
   three scoped repair rounds; then escalate to the parent/deeper role. Escalate
   immediately if a finding changes architecture, security, or public behavior.
6. Re-run Stage A, Stage B, path validation, and unit verification after writes.
7. The parent re-reads the current diff and fresh evidence; then fan in only a
   `PASSED` unit, one at a time, in declared merge order using the
   declared cherry-pick, patch, or disjoint-same-tree strategy.
8. Run required integration probes after each accepted result.

Deferred blocking findings produce `BLOCKED`, never `PASSED`. A cross-unit
repair requires recorded integration ownership transfer and invalidates all
affected evidence.

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

Run `sdcorejs-git` only after fan-in. Before final verification, the integration
owner updates any authorized summary, persona, memory, or living backlog once;
workers never write those shared artifacts.

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
  result identity for parallel dispatch; continue through the portable
  sequential parent fallback when safe.
- Mechanically compute actual changed paths and store the normalized list.
- Use plan-derived DAG waves and deterministic integration.
- Keep approved snapshots immutable and stale old evidence after revision.
- Keep live progress in runtime task state; never coordinate through a session
  checkpoint file.
- Require explicit ownership for shared artifacts and merge `artifact_context`
  deterministically after fan-in.
- Route repairs to an explicit owner/workspace.
- Keep task briefs and review packages runtime-only and bounded.
- Surface partial failures and unsupported cancellation honestly.
- Run global verification and final branch-ready on the final state.

### Must not

- Require fake approved-plan fields for read-only requests.
- Treat disjoint application files as sufficient isolation proof.
- Let a prompt allowlist replace mechanical path validation.
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
