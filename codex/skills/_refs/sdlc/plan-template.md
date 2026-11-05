# Plan Template

Load only at the entrypoint trigger below. Preserve the shared session authority policy.

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
  schema_version: 2
  source: sdcorejs-plan
  architecture_gate: { valid: true, required: true | false, status: required | not-applicable, signals: [], bypass: <exact bypass object or null>, rationale: <exact normalized rationale> }
  architecture_context: null # exact validated object when required
  decision_coverage:
    schema_version: 1
    revision: <integer>
    records: []
    history: []
  goal_backward_review:
    schema_version: 1
    mode: sdcorejs-plan:goal-backward
    decision_coverage: <exact same object as plan_context.decision_coverage>
    goals: [<G-* with statement and TASK-* refs>]
    tasks: [<TASK-* with owner, dependencies, paths, evidence, justification, INV refs>]
    repository_inventory:
      repositories: [<repository id with existing_paths and intended_new_paths owners>]
    critique_history: [<round, checker version, blockers, resolved and unresolved blockers>]
  validation_map: [<validated R/AC/INV to case, command, level, and evidence rows>]
  contract_id: <contract id>
  requirement_id: <requirement id>
  approved_spec_path: <path>
  approved_spec_hash: <hash>
  approved_spec_reference:
    immutable_identity: <repository id, repository-relative path, artifact id, revision, hash>
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
  allowed_paths: [<path or glob>]
  prohibited_paths: [<path or glob>]
  generated_artifacts: [<path or glob>]
  docs_artifacts: [<path or glob>]
  dependency_changes:
    required: true | false
    packages: [<name or empty>]
    approval_required: true | false
  env_changes:
    required: true | false
    files: [<path or empty>]
    approval_required: true | false
  migration_changes:
    required: true | false
    description: <text or null>
    approval_required: true | false
  frontend_architecture:
    required: <true for non-trivial frontend work; false otherwise>
    conformance_invariant_refs: [<relevant INV-* IDs or empty when not applicable>]
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
    state_owners: [<symbol and owned state>]
    service_boundaries:
      - symbol: <service/collaborator>
        scope: app | module | route | feature | page | component | pure_function
    data_flow: [<page to data access to mapper to view model>]
    declarations_and_registration: [<symbol and mechanism>]
    public_exports: [<symbol or none plus reason>]
    remaining_contract: <responsibilities, tests, and decomposition rationale from the direct ref>
  agent_architecture:
    required: <true for ai-agent; false otherwise>
    conformance_invariant_refs: [<relevant INV-* IDs or empty when not applicable>]
    not_applicable_reason: <reason or null>
    contract: <exact engine/capability/runtime/tool contract from _refs/sdlc/ai-agent.md>
  verification_strategy:
    package_manager: <npm|pnpm|yarn|bun|unknown>
    commands_planned: [<command/script and proof reason>]
    commands_skipped: [<candidate and skip reason>]
    checks: <detected scripts plus focused and broad checks>
  execution_policy: auto | sequential | parallel-preferred
  parallel_candidates:
    allowed: true | false
    units: [<compact id, dependencies, ownership, resources, and estimated cost>]
    shared_files: [<path, single owner, coordination strategy>]
  repository_plan:
    schema_version: 1
    integration_owner_repository_id: <stable repository id>
    dependency_order: [<module/integration unit id>]
    contract: <repositories and one-root mutable steps from repository contract>
  finish_tail:
    contract: <docs_before_final_branch_ready, verify_before_done, branch_ready_final_gate, no_writes_after_branch_ready>
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
1. TASK-001 CREATE <repository-id>:<path> - write the RED test before production code
2. TASK-002 EDIT <same-repository-id>:<path> - implement only after the RED evidence

### Phase 2 - Tests / verification
3. TASK-003 CREATE <repository-id>:<path> - <intent>

## Acceptance mapping
- AC-001 -> TASK-001, TASK-003
- AC-002 -> TASK-002, TASK-003

## Verification
- `<detected package-manager command or existing script>`
- Manual: <smoke check>
````

For test-track plans, steps can be test cases, fixtures, page objects, harness scripts, and runner commands. For product-track plans, steps can be ledger creation, story/AC refinement, implementation map update, test map update, UAT checklist, and traceability audit. For generic harness plans, every task must name the tool/action and verification evidence.
