---
name: sdcorejs-execute-plan
description: Execute an approved plan snapshot. Use after sdcorejs-plan approval or when asked to execute, run, generate from, or continue an approved plan for AI-agent, Angular, NestJS, Next.js, React, Node, fullstack, product, design, documentation, workflow, test, or generic/general work. Detects track/profile, preserves contract/write scope/package-manager evidence, auto-selects sequential for one or unsafe units, and offers parallel only when feasible. Runtime-localized.
allowed-tools: Agent, AskUserQuestion, Bash, Edit, Glob, Grep, Read, TodoWrite, Write
---

<!-- claude-adapter: generated from required-actions; do not edit mirror by hand -->


# 04 - Execute Plan

## Shared Protocols

Read `_refs/shared/runtime-protocols.md`. Apply
`_refs/shared/artifact-lifecycle.md` and preserve/merge `artifact_context` from
the approved spec, plan, and every producer. Use these executable sources of
truth before any write or dispatch:

- `_refs/shared/approved-artifact.mjs` for approval identity and parent graph.
- `_refs/shared/system-registry.json` for track/profile routing.
- `_refs/shared/decision-coverage.md` and its executable validator for strict
  decision/task/path/evidence coverage.
- `_refs/shared/architecture-contract.mjs` for the conditional approved
  architecture graph, exact handoff identity, and invariant ownership.
- `_refs/shared/convergence-contract.mjs` for exact executed task/change trace rows.
- `_refs/orchestration/execution-contract.mjs` for execution preparation,
  current-root/path authorization, owner routing, working-tree boundaries, and
  execution-mode selection.

## Purpose
Run the approved plan as the execution contract. This skill is the handoff between planning and doing.

It owns four decisions:

1. Which execution track should run.
2. Whether sequential execution is required or a real sequential/parallel
   choice exists.
3. Whether Angular work is Core UI portal work or plain Angular work.
4. Whether NestJS, Next.js, React, Node/general, migration, product, design, or
   test work needs a track executor or the generic harness fallback.

The generic harness is write-capable because it is the approved-plan fallback
executor for unsupported stacks and explicit CREATE/EDIT tasks. Write
permission is constrained by `plan_context.allowed_paths`,
`plan_context.prohibited_paths`, dependency/env/migration boundaries, and the
working-tree preflight below.

## Preconditions
- The approved spec and plan snapshots are available as paths or in context.
- `plan_context` is present, including `approved_spec_hash`,
  `approved_plan_hash`, `target_root_kind`, `stack_profile`, `allowed_paths`,
  `prohibited_paths`, dependency/env/migration boundaries, verification
  strategy, and parallel candidates.

For a schema-v2 `plan_context`, `decision_coverage`, `goal_backward_review`,
and a validated `validation_map` are required, and `architecture_gate` plus
`architecture_context` are mandatory (`architecture_context: null` only for a
concrete not-applicable gate). `prepareExecution` accepts
`approved_architecture` when required and validates their exact
identity, strict execution-stage readiness, task/path/evidence coverage, and
critique result plus the spec -> architecture -> plan graph before any write
authorization. Schema v1 without these fields
remains input-only compatibility; a malformed or incomplete schema-v2 context
must never fall back to that legacy path.

`plan_context` is required: an omitted or null value blocks execution. Only an
explicit `plan_context` with `schema_version: 1` selects legacy compatibility.

If the plan is missing or unapproved, route back to `sdcorejs-plan`.
Before every write, `prepareExecution` MUST verify the approved spec,
`approved_architecture` when required, approved plan, exact conditional parent
graph, schema, hash, track, profile, artifact owner, and `source_revision`
against `repository_revision_map`. Reject missing/stale/mutated architecture,
unknown schema/track, owner mismatch, or path/hash/reference mismatch. Do not mutate approved
artifacts to make execution pass.

For each mutable plan step, resolve the current Git root and call
`authorizePlanWrite`. The current repository must be the step's sole Git root
and `owner_repository_id`; the target must match `allowed_paths` and not
`prohibited_paths`. Reauthorize every path, including generic-harness writes.
After final branch-ready, no write is valid until the Finish gate is rerun.

Resolve every step with `resolveExecutionTarget`. If work starts in a portal but
the step owner is a module, execute in the module repository. Missing,
unavailable, or unwritable module repositories block execution; never author
module output into the portal. A review finding is not an authorized write
unless the user or approved repair scope selected it.

## Step 0 - Context preflight

Before loading the plan or dispatching an executor, assemble `project_context`.

- Use valid summary sections when present.
- If the summary is missing, legacy, unknown, or stale, continue with targeted
  reads. Use a scoped code map only when cross-component relationships remain
  unclear.
- Do not refresh a summary merely because it is missing or because execution is
  write-approved.
- A brand-new approved project initialization may create summary v2 after the
  scaffold exists. An architecture-level change may refresh it only when the
  sequential workflow or integration owner owns that shared write.
- Treat the approved plan and current evidence as stronger than stored context
  when they conflict.

## Step 0.5 - Working-tree preflight

Before any edit or subagent dispatch, inspect the current working tree and
compare it to `plan_context`:

- `git status --short`
- staged diffstat
- unstaged diffstat
- untracked files
- current branch
- current_HEAD
- target_root_kind
- allowed_paths
- prohibited_paths
- unrelated dirty files
- status snapshot hash and dirty diff hash
- intended output paths that already exist or overlap dirty paths

If unrelated dirty files exist, ask one numbered decision before editing:

```text
Working tree has changes outside this approved plan.

Options:
1. Continue but restrict edits to approved plan-scoped files
2. Continue and allow touching selected dirty files
3. Stop so you can clean or stash changes first

Reply with `1`, `2`, or `3`.
```

Do not edit prohibited paths without explicit approval and plan revision. Do not
edit env files, secret files, generated/vendor/build output, lockfiles, package
manifests, or migrations unless `plan_context` explicitly allows it. If
`target_root_kind` is `sdcorejs-agent-authoring-repo` or
`skill-pack-authoring-repo`, confirm that the authoring repo itself is the
intended target before writing.

For direct `sdcorejs-parallel-dispatch` entry, pass this same preflight as the
protocol-v2 `working_tree` block. Direct dispatch is not permission to bypass
branch/HEAD, dirty-state, untracked-file, or intended-output checks.

## Process

### 1. Load the approved plan
Read the plan from `.sdcorejs/plans/<track>/` or the plan path supplied by `sdcorejs-plan`.

Extract:

- `plan_context`.
- Scope and acceptance criteria.
- Task list and phase order.
- File paths and commands.
- Coverage approach.
- `allowed_paths` and `prohibited_paths`.
- Dependency, env, and migration boundaries.
- Verification strategy, `commands_planned`, and `commands_skipped`.
- Any declared parallel candidates.
- The completed `plan_context.frontend_architecture` contract when the plan
  changes a non-trivial frontend feature.
- Solution-root layout when present (`backend/`, `frontend/`, `test/`, `.sdcorejs/`, including the `.sdcorejs/product/` and `.sdcorejs/design/` artifact roots).

### 2. Detect execution track
Resolve the verified plan track through `_refs/shared/system-registry.json`.
Canonical tracks use their declared executor. Aliases resolve to their canonical
track; an unsupported signal resolves deterministically to the registry's
`general` generic-harness fallback. The profile classification gates below
refine executor eligibility but cannot replace or mutate verified plan identity.

#### Angular project classification preflight

Before dispatching any Angular executor, classify the target project. Use the
approved plan, package manifests, lockfiles, existing imports, and current user
request. Record the classification in the execution summary.

| Classification | Evidence | Executor/fallback |
|---|---|---|
| `core-ui-angular` | Existing Angular app depends on or imports `@sdcorejs/angular` | `sdcorejs-angular`; generate imports with `@sdcorejs/angular` |
| `legacy-core-ui-angular` | Existing Angular app depends on or imports `@sd-angular/core` | `sdcorejs-angular`; preserve `@sd-angular/core` imports |
| `plain-angular` | Angular signals exist (`angular.json`, `@angular/core`, components, routes), but neither Core UI package is installed/imported | generic harness fallback; reuse local/shared/design-system components and installed UI libraries only |
| `migration-request` | User or approved plan explicitly asks to install/adopt/migrate to SDCoreJS Core UI | return to `sdcorejs-spec`/`sdcorejs-plan` unless the dependency/migration scope is already explicitly approved |
| `non-angular` | No Angular evidence | Continue non-Angular track detection |

Only dispatch `sdcorejs-angular` for `core-ui-angular`,
`legacy-core-ui-angular`, approved `migration-request`, or brand-new SDCoreJS
portal creation. Do not treat broad Angular signals alone (`angular.json`,
`@angular/core`, components, routes, or `src/libs/**`) as permission to run the
Core UI portal executor.

For `plain-angular`, run the generic harness. It must follow the real project
structure, never import `@sdcorejs/angular` or `@sd-angular/core`, never fetch
Core UI docs, never emit a Core UI usage summary, never force admin screens,
never assume `src/libs/**/features/**` when the project uses another structure,
and must ask for explicit approval before adding `@sdcorejs/angular`,
`@sd-angular/core`, or `@angular/material`.

Do not route plain Angular to `sdcorejs-angular` by default; `plain-angular`
uses the generic harness unless the approved plan is a migration request or
brand-new SDCoreJS portal creation.

#### NestJS project classification preflight

Use approved plan metadata, package manifests, imports, modules/controllers/
providers, and tests.

| Classification | Evidence | Executor/fallback |
|---|---|---|
| `sdcorejs-nestjs` | NestJS app depends on/imports `@sdcorejs/nestjs` or strong SDCoreJS Nest conventions | `sdcorejs-nestjs` |
| `plain-nestjs` | `nest-cli.json`, `@nestjs/*`, modules/controllers/providers, or Nest tests without SDCoreJS Nest evidence | generic harness fallback |
| `migration-request` | Approved plan explicitly adopts SDCoreJS Nest conventions | `sdcorejs-nestjs` only when dependency/migration scope is approved |

Do not route plain NestJS to `sdcorejs-nestjs` by default. Do not assume
TypeORM, PostgreSQL, Zod, SdContext, `@HasPermission`, or `@sdcorejs/nestjs`
for `plain-nestjs` unless detected or approved.

#### Next.js and React classification preflight

Use approved plan metadata, `next.config.*`, React/Vite/CRA config, routes,
content/i18n structure, and tests.

| Classification | Evidence | Executor/fallback |
|---|---|---|
| `nextjs-build-website` | Next.js plus public-site/build-website evidence such as `[locale]`, typed i18n navigation, content/public-site structure, sitemap/OG plan, or prior build-website context | `sdcorejs-nextjs` |
| `plain-nextjs` | Next.js app/router/page evidence without build-website profile | generic harness fallback |
| `react-next-generic` | Next.js present but request is generic React app/dashboard behavior | generic harness fallback |
| `react-vite` | Vite config plus React dependency | generic harness fallback |
| `react-cra` | `react-scripts` | generic harness fallback |
| `node-general` | Node package/scripts/config work without stronger framework | generic harness fallback |
| `general` | unsupported or unknown stack | generic harness fallback |

Do not route plain Next.js to `sdcorejs-nextjs` by default. Do not assume
`[locale]`, `setRequestLocale`, sitemap/public-site metadata, typed i18n
navigation, or content folders for `plain-nextjs`.

For mixed full-stack plans, classify as role-split and prepare to invoke
`sdcorejs-parallel-dispatch`. Preserve any approved multi-project layout
directly from the plan; do not infer or create a universal repository layout.

#### AI-agent architecture preflight

For approved `track: ai-agent`, require `plan_context.agent_architecture` and
apply `_refs/sdlc/ai-agent.md`. Verify `approved_spec_hash` and
`approved_plan_hash`, then resolve `engine_profile` and `capability_profile`
exactly once from `_refs/ai-agent/manifest.json`. Block and return to
`sdcorejs-plan` when either profile is missing, the architecture block is
incomplete, provider storage lacks explicit governance, paths exceed approved
scope, or the selected capability weakens
`_refs/ai-agent/profiles/common.md`.

#### Shared frontend architecture gate

Before the execution-mode question, detect frontend scope from the approved
plan, stack/profile, UI routes/screens/components, or frontend file tasks. This
gate applies to track executors and to generic-harness work, including plain
Angular, plain Next.js, React, Vue, Svelte, and other frontend stacks.

For every non-trivial frontend task:

1. Read `_refs/shared/frontend-architecture.md`.
2. Require `plan_context.frontend_architecture.required: true` and verify that
   it records inspected project conventions, a route/page and child-component
   tree, reuse/extend/wrap/create/inline file decisions, responsibilities, state
   owners, service/data flow, provider lifecycle, registration, public exports,
   architecture tests, and decomposition rationale.
3. Verify planned file paths follow detected project conventions and are
   derived from that contract. Example folder structures are greenfield
   fallbacks, not mandatory layouts.
4. Block code generation and return to `sdcorejs-plan` when the architecture
   block is absent, incomplete, or contradicted by current project evidence.
5. Allow `required: false` only when the plan gives a concrete backend-only or
   trivial frontend reason.

The route/page shell is a minimum boundary, not permission for a monolithic
screen. Conversely, the gate must not invent child components, facades, stores,
or public barrels without a meaningful responsibility and lifecycle reason.

### 3. Select execution mode

Count executable units after dependency, path, resource, workspace, and runtime
capability checks.

- One executable unit: auto-select sequential and state that there is no useful
  fan-out.
- Two or more units but unavailable/unknown subagent or isolation capability,
  overlapping ownership, dependent work, or unsafe resources: auto-select
  sequential and state the blocking reason.
- Two or more independent units with disjoint ownership and both modes
  feasible: present the real trade-off and ask once.

When auto-selecting, continue without a prompt. Mention an override only when
the plan can genuinely be split differently and the required runtime
capabilities are supported. Capability `unknown` uses the portable sequential
fallback.

When both modes are feasible, use `_refs/shared/user-choice-prompt.md`:

```text
Execution mode?

Recommendation: <sequential|parallel> because <reason>.

Options:
1. Sequential - safer, easier to review, best for shared files or dependent steps. [Recommended when applicable]
2. Parallel - faster when tasks are independent; I will use the parallel-dispatch gate first. [Recommended when applicable]

Reply with `1` or `2`.
```

Translate at runtime. Do not execute until the user answers this real choice.
If the user delegates the decision, choose the recommendation and state it.

### 4. If parallel is chosen
Invoke `sdcorejs-parallel-dispatch`. It owns both the safety verdict and the safe parallel execution path.

- If verdict is `PARALLEL-CANDIDATE`, it runs independent-unit fan-out.
- If verdict is `ROLE-SPLIT`, it runs the product/design/backend/frontend/test-QC role-split loop.
- If verdict is `SEQUENTIAL`, explain why parallel is unsafe and ask whether to
  continue sequentially with `1. Continue sequentially (yes)` /
  `2. Stop and revise plan (no)`.

### 5. If sequential is chosen
If the user requested isolation, or the plan is risky enough that isolation is
needed, invoke `sdcorejs-git (workspace mode)` before dispatching. That
mode reads `_refs/orchestration/workspace-isolation.md` and reports the baseline.

Dispatch by detected track:

- angular -> `sdcorejs-angular` only when the Angular classification preflight allows it
- nestjs -> `sdcorejs-nestjs`
- nextjs -> `sdcorejs-nextjs`
- product -> `sdcorejs-product`
- design -> `sdcorejs-design`
- test -> `sdcorejs-test`
- ai-agent -> `sdcorejs-ai-agent`
- generic or `plain-angular` -> run the harness fallback below

Pass the approved plan as the contract. The executor must not add scope without returning to `sdcorejs-plan`.

### 6. Generic harness fallback
Use the generic harness when no track-specific orchestrator matches.

1. Create a progress checklist with one item per approved task plus finishing steps.
2. For frontend scope, enforce the shared frontend architecture gate above and
   keep the approved file decisions, component tree, state ownership,
   service/data flow, provider scope, registration, and public/private export
   decisions visible in the checklist. Do not proceed from a generic framework
   folder recipe.
3. Execute tasks in the approved order using the normal editing and shell tools,
   including Write only for approved CREATE tasks.
4. Keep edits inside `allowed_paths` and outside `prohibited_paths`.
5. Run every verification command from `plan_context.commands_planned`; record
   commands_run with exit codes and commands_skipped with reasons when a script,
   tool, package manager, service, or environment is unavailable.
6. If code changed, present the standard finish gate, run write-producing docs
   or task artifacts before ship, then run `sdcorejs-ship (verify-before-done
   mode)` and `sdcorejs-ship (branch-ready mode)` as the final read-only gate.
7. If only docs/config changed, still run the planned verification and report
   evidence.

The harness is intentionally conservative. If a task needs a domain-specific pattern not captured in the plan, stop and return to `sdcorejs-plan`.

### 7. Build execution context
Before handing off, pausing, or reporting, build the complete
`execution_context` for the exact next consumer. Pass it through
`context.pass`; if `runtime_context_channel` is unsupported or unknown, use
the validated portable handoff. User-facing output projects only the outcome,
changed paths, verification, blockers, risks, skipped checks, and real next
action. Do not echo this full schema by default:

```yaml
execution_context:
  source: sdcorejs-execute-plan
  decision_coverage:
    contract: <exact approved decision coverage object>
  goal_backward_review:
    contract: <exact approval-ready goal-backward object>
  architecture_gate: { valid: true, required: true | false, status: required | not-applicable, signals: [], bypass: <exact bypass object or null>, rationale: <exact normalized rationale> }
  architecture_context: null # exact approved object when required
  validation_map: [] # exact approved plan_context.validation_map
  approved_architecture:
    identity: <path/hash/status or explicit not-applicable/legacy result>
  contract_id: <contract id>
  requirement_id: <requirement id>
  owner_repository_id: <semantic artifact owner>
  execution_host_repository_id: <repository where workflow started>
  integration_owner_repository_id: <composition/integration owner>
  repository_revision_map:
    <repository id>: <verified current revision>
  approved_spec_path: <path>
  approved_spec_hash: <hash>
  approved_plan_path: <path>
  approved_plan_hash: <hash>
  execution_mode: sequential | parallel | generic-harness | delegated-executor
  target_root: <target root>
  target_root_kind: target-project | sdcorejs-agent-authoring-repo | skill-pack-authoring-repo | unknown
  track: <track>
  stack_profile: <stack profile>
  executor_selected: <skill or generic harness>
  executor_reason: <short reason>
  generic_harness_used: true | false
  migration_request: true | false
  frontend_architecture:
    required: true | false
    source: <approved plan path/section or not applicable reason>
    conformance: verified | blocked | not-applicable
  working_tree_preflight:
    current_HEAD: <sha>
    evidence: <HEAD, dirty state, staged, unstaged, untracked, unrelated paths>
  tasks_completed:
    - <task id, repository owner/root, summary, and changed paths>
  convergence_trace: [{ task_id: <TASK-###>, changed_path_refs: [], changed_symbol_refs: [], requirement_refs: [], acceptance_criterion_refs: [], invariant_refs: [], risk_refs: [], evidence_refs: [] }]
  tasks_remaining:
    - id: <task id>
      reason: <reason>
  files_changed:
    - <path>
  artifact_context:
    schema_version: 1
    change_ref: <id or durable artifact path>
    source_spec: <path | none>
    source_plan: <path | none>
    required_with_change: []
    shared_owned: []
    conditional: []
    local_only: []
    unrelated_observed: []
  commands_run:
    - command_or_script: <command>
      exit_code: <code>
      reason: <why run>
  commands_skipped:
    - command_or_probe: <command>
      reason: <why skipped>
  redaction_applied: true | false
  ship_handoff:
    required: true | false
    verification_mode: feature-acceptance | bugfix-verification | docs-only-hygiene | specless-verification | dependency-regression | release-readiness
```

## Rules

### Must do
- Never execute without an approved plan snapshot.
- Consume `plan_context` and preserve `contract_id`, `approved_spec_hash`,
  `approved_plan_hash`, `target_root_kind`, `track`, `stack_profile`,
  validation map, write-scope boundaries, package-manager evidence, and verification strategy.
- Auto-select sequential for one executable unit or when safe parallel
  execution is unavailable; ask only when both modes are feasible.
- Use `sdcorejs-product` as the executor for product-track ledgers and traceability audits.
- Use `sdcorejs-design` as the executor for design-track FE handoff artifacts.
- Use `sdcorejs-test` as the executor for test-track plans.
  Preserve its public action/profile classification and consume v2
  `test_context`, independent `test_status`, append-oriented `test_evidence`,
  and `artifact_context`. Do not infer execution/pass from authored tests.
- Use the generic harness fallback when no track matches.
- Apply `_refs/shared/frontend-architecture.md` to every non-trivial frontend
  plan, including generic plain-framework work, and block generation when the
  approved architecture contract is missing or incomplete.
- Perform working-tree preflight before edits.
- Obey `allowed_paths` and `prohibited_paths`.
- Use package-manager/script discovery from the plan. Do not mix package
  managers, invent missing scripts, run unapproved installs, or use `npx --yes`
  without approval.
- Redact secrets and PII from execution summaries, runtime task state, logs, and
  handoffs.
- Verify success from real command output before claiming anything passed.
- Keep the user's language in status and summaries.
- Run multi-repository steps locally in dependency order; a worker owns one
  repository-local plan and must never expand into another Git root.
- Keep live progress in runtime state. Never create or update
  `.sdcorejs/current-session.md`.

### Must not
- Dispatch a track orchestrator before execution mode is resolved, including
  any required real choice.
- Parallelize shared-file or dependent steps just because it looks faster.
- Let a subagent change the approved plan.
- Hide a `SEQUENTIAL` verdict after the user asked for parallel.
- Skip finish-gate and mandatory tail steps after code generation.
- Edit outside approved scope.
- Mutate approved specs/plans instead of returning to the approval gate for a
  revision.
- Treat an unselected review finding as authorized write scope.
- Write module artifacts into a portal fallback when the module repository is
  missing or unavailable.
- Route plain framework profiles to SDCoreJS-specific executors by default.
- Let a route/page become the only component boundary for a complex screen, or
  extract arbitrary wrappers/facades/stores that the approved architecture does
  not justify.
- Write after final branch-ready unless branch-ready is run again.

## Cross-references
- `sdcorejs-plan` - approved execution contract
- `sdcorejs-parallel-dispatch` - decides whether parallel is safe and executes safe fan-out or role-split work
- `sdcorejs-git (workspace mode)` - isolates work when requested or needed
- `sdcorejs-ai-agent`, `sdcorejs-angular`, `sdcorejs-nestjs`, `sdcorejs-nextjs`, `sdcorejs-product`, `sdcorejs-design`, `sdcorejs-test` - track executors
- `sdcorejs-ship (verify-before-done mode)` - acceptance verification gate
- `_refs/shared/frontend-architecture.md` - mandatory non-trivial frontend architecture preflight and execution contract
