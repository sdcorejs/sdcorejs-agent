---
name: sdcorejs-plan
description: Plan authoring and approval gate. Use after approved spec, or when the user asks to write/review/approve/change an implementation plan. Produces numbered file/task plans, self-reviews, waits for explicit approval, then persists the approved snapshot in the matching track directory under .sdcorejs/plans/ before execute-plan. Applies across tracks. Runtime-localized.
allowed-tools: AskUserQuestion, Bash, Edit, Glob, Grep, Read, Write
---

<!-- claude-adapter: generated from required-actions; do not edit mirror by hand -->


# 03 - Plan


## Shared Protocols

Read `_refs/shared/runtime-protocols.md`. Draft and approved plan artifacts
apply `_refs/shared/artifact-lifecycle.md` and emit `artifact_context`. Resolve
all track/profile/repository semantics from
`_refs/shared/system-registry.json`; create and verify approval identity with
`_refs/shared/approved-artifact.mjs`.

## Purpose
Translate an approved spec into an executable contract, hold the user approval gate, and persist the approved plan corpus inside the same skill.

The plan is the exact contract that `sdcorejs-execute-plan` runs.

## Preconditions
- A spec has explicit user approval.
- `sdcorejs-spec` has written the approved spec snapshot.
- The plan must consume `spec_context`, reference the approved spec path, and
  include the approved spec hash.
- The approved spec repository ID, repository-relative path, source revision,
  artifact ID, and approval hash are available.

If the spec is missing or unapproved, route to `sdcorejs-spec`.
Run `verifyApprovedArtifactGraph` against the exact approved spec before
drafting. Any missing parent, hash/revision mismatch, mutation, unknown registry
track/profile, or semantic-owner mismatch blocks planning.

Before drafting, apply `_refs/shared/project-context.md` with:

```text
caller_context: sdcorejs-plan
context_mode: summary-read
side_effects_allowed: true
```

Plan writes are limited to the draft and approved plan artifacts owned by this
skill. Missing or stale summary is not permission to refresh context. Preserve
`contract_id`, `requirement_id`, `target_root`, `target_root_kind`, `track`,
`stack_profile`, owner repository/role/module, execution host repository,
`approved_spec_path`, approved spec repository-relative path/revision, and
`approved_spec_hash` from `spec_context`.

## Process

### 1. Load inputs
Read:

- Approved spec.
- `spec_context`, including `approved_spec_path`, `approved_spec_hash`,
  `target_root_kind`, `stack_profile`, assumptions, risks, non-goals, and
  approval metadata.
- Relevant `_refs/sdlc/<track>.md` for angular / nestjs / nextjs / ai-agent.
- For ai-agent, also read `_refs/ai-agent/manifest.json`,
  `_refs/ai-agent/profile-contract.json`, and
  `_refs/ai-agent/profiles/common.md`.
- `_refs/shared/testing-philosophy.md` and target stack test ref for test-track plans.
- Existing `.sdcorejs/docs/product/` ledgers for product-track plans.
- Directly related approved plans under `.sdcorejs/plans/<track>/`, selected by
  metadata and request scope; use an unrelated prior plan only as explicit
  style evidence.
- `package.json`, `packageManager`, lockfiles (`package-lock.json`,
  `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`/`bun.lock`), workspace config, and
  `package.json` scripts. Record package manager/script evidence instead of
  guessing commands.

Keep the approved spec as the `what`, `why`, constraints, and acceptance source
of truth. The plan references its path/hash and carries only the short scope
delta needed to explain the `how`, order, commands, and file-level changes; it
must not copy the full spec body.

For any non-trivial frontend task, also read
`_refs/shared/frontend-architecture.md` and inspect nearby route/page,
component, state, service/data-access, provider/registration, public API, and
test evidence. The approved plan must carry the completed frontend architecture
contract; planning from a generic folder recipe is not sufficient.

### 2. Check paths
Before drafting:

- Confirm every CREATE path does not already exist.
- Confirm every EDIT path does exist.
- Surface conflicts instead of silently overwriting.
- For generic harness plans, mark unknown paths as `VERIFY THEN EDIT` instead of pretending they are known.
- Define `allowed_paths`, `prohibited_paths`, `generated_artifacts`, and
  `docs_artifacts`. If a path is unknown, say "discover target path during
  execution" and give the path-selection rule instead of inventing a path.
- Mark shared files such as `package.json`, lockfiles, routing modules,
  app-level providers, generated mirrors, global configs, env files, public API
  files, and frozen contracts as coordination-risk paths.
- Record dependency, env, and migration boundaries. Dependency, env, package
  manifest, lockfile, or migration writes require explicit plan approval.
- Every mutable `CREATE`, `EDIT`, or `VERIFY-THEN-EDIT` step names exactly one
  `owner_repository_id` and one matching Git root. Validate/split the result
  with `_refs/shared/repository-contract.mjs`.
- A module-owned plan and its editable steps stay in the module repository, not
  the portal. The portal plan owns only shell/composition/cross-module
  integration, aggregate runner/report, and exact child references.
- For multi-repository work, emit a parent integration plan plus repository-local
  child plans, or repository-local steps with exact deterministic cross-repo
  references. Record semantic owner, execution host, integration owner,
  dependency order, and whether a Gitlink update is approved.

For a non-trivial frontend task:

- complete the `Frontend architecture plan` from
  `_refs/shared/frontend-architecture.md` before creating file tasks;
- derive every component, service/collaborator, provider, registration, public
  export, and test path from that approved component tree and service boundary;
- preserve the target project's detected layout and import conventions;
- treat any example `pages/components/services` structure as a greenfield
  fallback only;
- do not reduce an entity or routed feature to one list component plus one
  detail component when the approved responsibilities require cohesive
  feature-local children;
- do not extract trivial wrappers or add a facade/store without a documented
  state or orchestration reason.

### 2.1 Working-tree and write-scope preflight plan
The plan must tell `sdcorejs-execute-plan` to run this preflight before edits:

- `git status --short`
- staged diffstat
- unstaged diffstat
- untracked files
- current branch
- current HEAD
- allowed_paths and prohibited_paths from `plan_context`
- unrelated dirty files
- `target_root_kind` authoring-repo guard

If unrelated dirty files exist, execution asks:

```text
1. Continue but restrict edits to approved plan-scoped files
2. Continue and allow touching selected dirty files
3. Stop so the user can clean or stash changes first
```

Do not plan edits to prohibited paths, env values, secrets, generated/vendor/
build output, lockfiles, or package manifests unless the approved plan allows
them.

### 3. Draft the plan
Use numbered steps grouped by phase:

````markdown
## Scope
<2-4 lines from the approved spec>

## Execution context
- Track: <canonical registry track>
- Target root kind: <target_root_kind>
- Stack profile: <stack_profile>
- Coverage approach: <post-hoc|TDD>
- Parallel candidates: <yes/no + why>

```yaml
plan_context:
  source: sdcorejs-plan
  contract_id: <contract id>
  requirement_id: <requirement id>
  approved_spec_path: <path>
  approved_spec_hash: <hash>
  approved_spec_reference:
    repository_id: <stable spec owner repository id>
    repository_relative_path: <approved spec repository-relative path>
    artifact_id: <approved spec artifact id>
    revision: <approved spec owner-repository revision>
    approval_hash: <approved spec sha256:v1 hash>
  approved_plan_path: <empty until approved>
  approved_plan_hash: <empty until approved>
  supersedes: <prior approved plan path or null>
  target_root: <target root>
  target_root_kind: target-project | sdcorejs-agent-authoring-repo | skill-pack-authoring-repo | unknown
  owner_repository_id: <stable plan owner repository id>
  owner_repository_role: standalone | portal | module | library | service | documentation
  owner_module_id: <module id or null>
  execution_host_repository_id: <stable execution host repository id>
  integration_owner_repository_id: <stable integration owner repository id>
  dependency_order:
    - <repository-local unit id>
  gitlink_updates_in_scope: true | false
  track: <track>
  stack_profile: <stack profile>
  task_count: <N>
  phase_count: <M>
  allowed_paths:
    - <path or glob>
  prohibited_paths:
    - <path or glob>
  generated_artifacts:
    - <path or glob>
  docs_artifacts:
    - <path or glob>
  dependency_changes:
    required: true | false
    packages:
      - <name or empty>
    approval_required: true | false
  env_changes:
    required: true | false
    files:
      - <path or empty>
    approval_required: true | false
  migration_changes:
    required: true | false
    description: <text or null>
    approval_required: true | false
  frontend_architecture:
    required: <true for non-trivial frontend work; false otherwise>
    not_applicable_reason: <reason or null>
    project_conventions:
      component_style: <detected value or labeled fallback>
      folder_convention: <detected value or labeled fallback>
      state_convention: <detected value or labeled fallback>
      service_data_access_convention: <detected value or labeled fallback>
      registration_provider_convention: <detected value or labeled fallback>
      public_api_barrel_convention: <detected value or labeled fallback>
      test_convention: <detected value or labeled fallback>
      evidence_inspected: [<path or config>]
    component_tree: [<route/page container and meaningful children>]
    reuse_decisions: [<need, exact candidate, decision, reason>]
    file_decisions: [<path, decision, symbols, reason>]
    responsibilities: [<symbol, cohesive responsibility, inputs, outputs>]
    state_owners: [<symbol and owned state>]
    service_boundaries:
      - symbol: <service/collaborator>
        scope: app | module | route | feature | page | component | pure_function
    data_flow: [<page to data access to mapper to view model>]
    declarations_and_registration: [<symbol and mechanism>]
    public_exports: [<symbol or none plus reason>]
    tests: [<architecture contract test>]
    decomposition_rationale: [<meaningful extracted/inline boundary>]
  agent_architecture:
    required: <true for ai-agent; false otherwise>
    not_applicable_reason: <reason or null>
    schema_version: 1
    engine_profile: <exact manifest engine id>
    capability_profile: <exact independent manifest capability id>
    runtime_owner: <application component>
    target_paths: [<approved path>]
    trusted_context_sources: [<authenticated server/job source>]
    tenant_isolation: <policy>
    provider_state: { store_provider_state: false, provider_conversation_enabled: false, governance_approval: null }
    tool_contract_paths: [<path>]
    approval_policy: <policy reference>
    session_policy: <policy reference>
    evidence_policy: <policy reference>
    observability_policy: <policy reference>
    limits: <bounded values>
    deterministic_eval_commands: [<offline command>]
    live_verification: { required: false, authorization: null }
    non_goals: [<explicit exclusion>]
  verification_strategy:
    package_manager: <npm|pnpm|yarn|bun|unknown>
    scripts_detected: [<script name>]
    commands_planned: [<command/script and proof reason>]
    commands_skipped: [<candidate and skip reason>]
    focused_checks: [<check>]
    broad_checks: [<check>]
  parallel_candidates:
    allowed: true | false
    frozen_contract: { path: <path or embedded>, hash: <hash>, revision: <integer>, derived_from_approved_plan_hash: <hash>, supersedes: <id or null> }
    units:
      - id: <stable id>
        depends_on: [<unit id or empty>]
        allowed_paths: [<path or glob>]
        prohibited_paths: [<path or glob>]
        exclusive_resources: [<resource or empty>]
        result_type: commit | patch | working-tree-diff | report
        verification_command: <detected command or manual check>
    shared_files: [<path, single owner, coordination strategy>]
    conflict_risks: [<risk>]
  repository_plan:
    schema_version: 1
    integration_owner_repository_id: <stable repository id>
    gitlink_updates_in_scope: true | false
    dependency_order: [<module/integration unit id>]
    repositories: [<repository id, role, module id, plan artifact id>]
    steps:
      - id: <stable step id>
        action: CREATE | EDIT | VERIFY-THEN-EDIT | VERIFY
        semantic_scope: module | portal-composition | repository
        owner_repository_id: <stable repository id>
        git_roots: [<same repository id for a mutable step>]
        allowed_paths: [<repository-relative path or glob>]
        prohibited_paths: [<repository-relative path or glob>]
        depends_on: [<step id or empty>]
  finish_tail:
    docs_before_final_branch_ready: true
    verify_before_done: true
    branch_ready_final_gate: true
    no_writes_after_branch_ready: true
  approval:
    approved: false
    approved_at: null
  change_control:
    revision: <integer>
    supersedes: <prior approved plan path or null>
    change_reason: <reason or null>
```

## Tasks

### Phase 1 - <phase name>
1. CREATE <repository-id>:<path> - write the RED test before production code
2. EDIT <same-repository-id>:<path> - implement only after the RED evidence

### Phase 2 - Tests / verification
3. CREATE <path> - <intent>

## Acceptance mapping
- AC1 -> tasks 1, 3
- AC2 -> tasks 2, 3

## Verification
- `<detected package-manager command or existing script>`
- Manual: <smoke check>
````

For test-track plans, steps can be test cases, fixtures, page objects, harness scripts, and runner commands. For product-track plans, steps can be ledger creation, story/AC refinement, implementation map update, test map update, UAT checklist, and traceability audit. For generic harness plans, every task must name the tool/action and verification evidence.

### 4. Self-review before showing the user
Fix the plan before presenting if any checklist item fails:

- No placeholders.
- Every task has a number, action marker, target path or command, and one-line intent.
- Acceptance criteria map to at least one task.
- Verification section has commands discovered from package manager/script
  evidence or explicit manual checks. If no script exists, record
  `commands_skipped` with the reason instead of inventing one.
- Path conflicts are surfaced.
- Test coverage matches the spec's coverage approach.
- Test authoring and the approved TDD decision occur before production-code
  tasks; a plan may not defer this decision until after implementation.
- Parallel candidates are identified, but not executed.
- The plan does not hardcode `npm`, `npx`, `tsc`, Playwright, browser installs,
  or any package manager as universal defaults. Do not hardcode npm/npx as
  universal commands, and do not use `npx --yes` or downloading probes without
  explicit approval.
- The plan does not mix package managers.
- Dependency/env/migration/package manifest/lockfile writes are explicitly
  approved or marked out of scope.
- Every non-trivial frontend plan has a complete `frontend_architecture` block
  sourced from `_refs/shared/frontend-architecture.md`; backend-only and trivial
  frontend plans record a concrete `not_applicable_reason`.
- Every AI-agent plan has a complete `agent_architecture` block sourced from
  `_refs/sdlc/ai-agent.md`; its two profile IDs resolve independently in the
  manifest, target paths and dependencies are approved, security-floor fields
  are complete, deterministic checks are offline, and live checks are
  separately authorized or explicitly deferred.
- AI-agent plan review fails generic tools, model/client-owned tenant or
  permissions, missing exact mutation approval, implicit provider storage,
  unbounded execution, missing deterministic/security gates, or unapproved
  dependency/package/lockfile changes.
- Frontend task paths and file decisions match the approved component tree,
  data flow, service boundaries, provider/registration decisions, public API
  policy, and architecture tests.
- Reuse decisions name exact candidate symbols/paths when evidence exists and
  distinguish `reuse`, `extend`, `wrap`, feature-local creation, shared
  creation, and intentional inline markup.
- The component tree protects both sides of the boundary decision: route/page
  containers do not absorb unrelated responsibilities, and trivial markup is
  not extracted only to reduce line count.
- No write-producing step occurs after final branch-ready.

### 5. Present the approval gate
Show a concise summary:

```text
Plan ready: <N> tasks across <M> phases.

Phases:
- Phase 1: tasks 1-K
- Phase 2: tasks K+1...

Verification:
- <command>
- Manual: <check>

Do you approve this plan?

Options:
1. Approve - snapshot the plan and move to execute-plan.
2. Change - name the step or phase to update, then I will revise it.
3. Cancel - stop here.

Reply with `1`, `2`, or `3`. If you choose `2`, describe the change.
```

Translate at runtime.

### 6. Handle user response

Approve:

1. Read `_refs/sdlc/plan-approval-artifact.md` completely.
2. Write its immutable approved-plan snapshot in the semantic owner repository.
   Create and immediately verify the `sha256:v1` identity through
   `_refs/shared/approved-artifact.mjs`; `approved_plan_hash` is the
   compatibility projection of canonical `approval_hash`. Supply the approved plan body excluding frontmatter and the hash field as the helper body input;
   the omitted field is self-referential.
3. Record the approved spec, draft plan, and approved plan under
   `artifact_context.required_with_change`; set `source_plan` to the approved
   snapshot.
4. Build final `plan_context` with the approved path/hash, write scope,
   verification and package-manager evidence, parallel candidates,
   dependency/env/migration boundaries, and change control.
5. Handoff to `sdcorejs-execute-plan` only after the snapshot succeeds. Pass
   the full context through `context.pass` or the validated portable handoff;
   reference the approved spec by `contract_id`, path, and hash instead of
   repeating its body in runtime output.

Change request:

1. Edit the plan.
2. Re-run self-review.
3. Re-present the summary.
4. Cap at 3 revision rounds, then suggest returning to `sdcorejs-spec`.

Abort:

1. Stop the workflow.
2. Do not write an approved snapshot.

## Rules

### Must do
- Keep code generation out of this skill.
- Wait for explicit plan approval.
- Snapshot the approved plan before execution.
- Create a new approved snapshot every time; snapshots are immutable history.
- Treat approved plans as immutable snapshots. If scope changes after approval,
  create a new plan revision with `supersedes` and `change_reason`.
- Preserve the latest approved plan that matches the current
  `approved_spec_hash`. If spec_context and plan_context hashes mismatch, stop
  and ask for plan regeneration.
- Preserve `contract_id`, `requirement_id`, exact approved-spec reference,
  artifact owner, source revision, execution/integration owners, repository
  split, dependency order, and Gitlink scope.
- Record write scope, allowed paths, prohibited paths, generated artifact
  boundaries, docs artifacts, dependency changes, env changes, migration
  changes, verification strategy, package manager/script evidence,
  parallelization metadata, shared-file risks, and final tail ordering.
- Discover package manager from `packageManager`, lockfiles, and workspace
  config; read `package.json` scripts before planning commands.
- Record `commands_planned`, `commands_skipped`, focused checks, and broad
  checks with evidence.
- Capture review decisions honestly; never leave the section blank.
- Pass the approved plan as the exact execution contract to `sdcorejs-execute-plan`.
- Include verification commands.

### Must not
- Dispatch a track orchestrator directly from this skill.
- Modify the plan after handing off without returning to the approval gate.
- Treat silence as approval.
- Hide a path conflict.
- Overwrite an old approved snapshot.
- Mutate an approved plan snapshot in place.
- Add dependencies, env files, migrations, package manifests, lockfiles, or
  generated/vendor/build output unless the approved plan explicitly allows it.
- Hardcode one package manager, mix package managers, invent missing scripts, or
  present npm/npx/tsc as universal defaults.
- Plan writes after final branch-ready.
- Put a module-owned plan in the portal, copy a full child plan into the parent,
  or allow one mutable step to span two Git roots.

## Cross-references
- `sdcorejs-spec` - approved spec input
- `sdcorejs-execute-plan` - runs the approved plan
- `_refs/sdlc/plan-approval-artifact.md` - approved snapshot schema and handoff
