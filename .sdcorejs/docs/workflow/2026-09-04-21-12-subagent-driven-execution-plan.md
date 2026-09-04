---
artifact_id: plan-draft-contract-subagent-driven-execution-20260904-r1
artifact_kind: execution-doc
change_ref: subagent-driven-execution-20260904
source_spec: .sdcorejs/specs/workflow/2026-09-04-21-12-subagent-driven-execution.md
source_plan: .sdcorejs/plans/workflow/2026-09-04-21-12-subagent-driven-execution.md
commit_policy: with-change
owner: sdcorejs-plan
---

# Plan - Subagent-Driven Execution and Portable Isolation

## Scope

Implement the approved delegated-execution architecture on the clean
`359e2c7e9d311a4fd780c54b1fa42196ca990611` baseline. Add one public skill,
runtime capability attestation, compact plan compilation, consistent DAG waves,
bounded concurrency proof, workspace-ownership extraction, shell-neutral Git
guidance, routing controls, synchronized mirrors, and public inventory updates.

## Execution context

```yaml
plan_context:
  schema_version: 1
  source: sdcorejs-plan
  contract_id: contract-subagent-driven-execution-20260904
  requirement_id: req-subagent-driven-execution-20260904
  approved_spec_path: .sdcorejs/specs/workflow/2026-09-04-21-12-subagent-driven-execution.md
  approved_spec_hash: sha256:v1:a98dc8a7074a04bf0ea486c71fb26138ec211c6f1a67f1cedba463cbe4c3f0f7
  approved_plan_path: .sdcorejs/plans/workflow/2026-09-04-21-12-subagent-driven-execution.md
  approved_plan_hash: sha256:v1:4c5fb8a1ab66b8bb3da36c906394476dfcbc4b74de1b8092a112764bf2ffd1e5
  target_root_kind: sdcorejs-agent-authoring-repo
  owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  owner_repository_role: standalone
  owner_module_id: null
  execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
  integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
  track: workflow
  stack_profile: markdown-skill-pack
  task_count: 16
  phase_count: 5
  execution_policy: sequential
  execution_reason: Shared routing, adapter contracts, generated mirrors, counts, and documentation require one integration owner; this session has no explicit subagent-execution authorization.
  allowed_paths:
    - .sdcorejs/approvals/subagent-driven-development-new-trigger.json
    - .sdcorejs/docs/workflow/2026-09-04-21-12-subagent-driven-execution-*.md
    - .sdcorejs/specs/workflow/2026-09-04-21-12-subagent-driven-execution.md
    - .sdcorejs/plans/workflow/2026-09-04-21-12-subagent-driven-execution.md
    - skills/orchestration/subagent-driven-development.md
    - skills/orchestration/parallel-dispatch.md
    - skills/orchestration/using-skills.md
    - skills/shared/sdlc/03-plan.md
    - skills/shared/sdlc/04-execute-plan.md
    - skills/shared/workflow/git.md
    - _refs/harness/runtime-attestation.mjs
    - _refs/harness/runtime-attestation.md
    - _refs/harness/runtime-policy.mjs
    - _refs/harness/capability-contract.json
    - _refs/harness/README.md
    - _refs/harness/adapter-compatibility.md
    - _refs/orchestration/execution-contract.mjs
    - _refs/orchestration/parallel-protocol.mjs
    - _refs/orchestration/parallel-protocol.md
    - _refs/orchestration/workspace-isolation.md
    - AGENTS.md
    - CLAUDE.md
    - .clinerules
    - .github/copilot-instructions.md
    - .github/chatmodes/sdcorejs.chatmode.md
    - test/e2e/parallel-dispatch-protocol.test.mjs
    - test/e2e/harness-behavioral-sentinel.test.mjs
    - test/e2e/production-readiness-contract.test.mjs
    - test/e2e/entrypoint-smoke.test.mjs
    - test/e2e/skill-pack-runner.test.mjs
    - test/e2e/architecture-contract.test.mjs
    - test/e2e/ai-agent-track-contract.test.mjs
    - test/e2e/communication-economy.test.mjs
    - test/e2e/npm-publication-contract.test.mjs
    - test/e2e/simplify-skill-contract.test.mjs
    - test/e2e/skill-authoring-contract.test.mjs
    - test/e2e/support/entrypoint-smoke.mjs
    - test/e2e/support/skill-pack-runner.mjs
    - test/e2e/fixtures/prompt-evals.json
    - README.md
    - TESTING.md
    - VALIDATION.md
    - docs/ADOPTION.md
    - docs/RELEASE_PROCESS.md
    - site/README.md
    - site/src/pages/index.astro
    - site/src/components/Hero.astro
    - site/src/components/Install.astro
    - site/src/components/SkillCatalog.astro
    - .claude/skills/**
    - .claude/_refs/**
    - plugin/skills/**
    - plugin/_refs/**
    - codex/skills/**
    - codex/skills/_refs/**
    - .cursor/rules/sdcorejs-agent.mdc
    - .claude/sdcorejs-harness.json
    - plugin/sdcorejs-harness.json
    - codex/sdcorejs-harness.json
    - .cursor/sdcorejs-harness.json
    - .github/sdcorejs-harness.json
  prohibited_paths:
    - package.json
    - package-lock.json
    - site/package.json
    - site/package-lock.json
    - .env*
    - node_modules/**
    - site/node_modules/**
    - dist/**
    - site/dist/**
    - coverage/**
    - .sdcorejs/summary.md
    - .sdcorejs/tasks/current-session.md
    - .sdcorejs/tasks/sessions/**
  generated_artifacts:
    - .claude/skills/**
    - .claude/_refs/**
    - plugin/skills/**
    - plugin/_refs/**
    - codex/skills/**
    - codex/skills/_refs/**
    - .cursor/rules/sdcorejs-agent.mdc
    - .claude/sdcorejs-harness.json
    - plugin/sdcorejs-harness.json
    - codex/sdcorejs-harness.json
    - .cursor/sdcorejs-harness.json
    - .github/sdcorejs-harness.json
  dependency_changes: { required: false, packages: [], approval_required: false }
  env_changes: { required: false, files: [], approval_required: false }
  migration_changes: { required: false, description: null, approval_required: false }
  parallel_candidates:
    allowed: false
    contract:
      reason: The implementation changes shared scheduler, routing, count, and generated integration surfaces.
      fallback: sequential integration owner
    shared_files:
      - path: _refs/harness/capability-contract.json
        owner: sequential-integration
      - path: test/e2e/support/skill-pack-runner.mjs
        owner: sequential-integration
      - path: generated mirrors
        owner: sequential-integration
  finish_tail:
    docs_before_final_branch_ready: true
    verify_before_done: true
    branch_ready_final_gate: true
    no_writes_after_branch_ready: true
  approval:
    approved: true
    approved_at: 2026-09-04T14:12:54.026Z
    approval_source: equivalent-complete-input
```

## Tasks

### Phase 1 - Contracts and RED

1. TASK-001 VERIFY the approved spec and new-trigger approval artifacts against
   `_refs/shared/approved-artifact.mjs`.
2. TASK-002 EDIT `test/e2e/parallel-dispatch-protocol.test.mjs` and
   `test/e2e/production-readiness-contract.test.mjs` with failing tests for DAG
   agreement, compact compilation, bounded overlap, and fail-fast truthfulness.
3. TASK-003 EDIT `test/e2e/harness-behavioral-sentinel.test.mjs` with failing
   runtime-attestation and delegated-fallback tests.
4. TASK-004 EDIT routing/count/portability tests and fixtures with failing
   positive and negative cases for the 23rd skill and shell-neutral Git rules.

### Phase 2 - Runtime and scheduler

5. TASK-005 CREATE `_refs/harness/runtime-attestation.{mjs,md}` and EDIT the
   capability contract/runtime policy to implement evidence-backed session
   observations and effective parallel capabilities.
6. TASK-006 EDIT `_refs/orchestration/execution-contract.mjs` and
   `_refs/orchestration/parallel-protocol.mjs` so dependency waves, compilation,
   opportunity reporting, policy selection, and bounded concurrency share one
   deterministic contract.
7. TASK-007 EDIT protocol documentation and run the focused runtime/parallel
   tests to GREEN.

### Phase 3 - Skill ownership and routing

8. TASK-008 CREATE `skills/orchestration/subagent-driven-development.md` with
   fresh-worker lifecycle, two-stage review, owner repair, fan-in, and fallback
   hierarchy.
9. TASK-009 EDIT parallel-dispatch, execute-plan, plan, and using-skills so the
   high-level lifecycle, scheduler gate, and approved execution policy have
   non-overlapping ownership.
10. TASK-010 EDIT workspace-isolation and Git workflow guidance to establish one
    orchestration owner and shell-neutral commit/PR behavior.
11. TASK-011 EDIT source-owned entrypoints and deterministic routing support;
    run the routing, authoring, portability, and negative-control tests.

### Phase 4 - Distribution and documentation

12. TASK-012 UPDATE count assertions and public documentation/site inventory to
    23 without changing package or release versions.
13. TASK-013 RUN `npm run sync:skills` to regenerate only declared mirrors and
    manifests, then inspect the new skill and capability projections.
14. TASK-014 RUN focused mirror, authoring, entrypoint, parallel, and
    publication-contract checks; repair only in approved paths.

### Phase 5 - Verification and closeout

15. TASK-015 RUN text hygiene, skill parity, repository E2E, site build, audit,
    and `git diff --check`; preserve exact failures and the Node-engine caveat.
16. TASK-016 PERFORM final read-only diff/ownership review and branch-readiness
    inspection with no later writes; do not commit, push, tag, or release.

## Acceptance mapping

- AC-001, AC-012 -> TASK-004, TASK-008, TASK-011, TASK-012, TASK-013, TASK-014
- AC-002, AC-009 -> TASK-004, TASK-008, TASK-009, TASK-011
- AC-003, AC-004 -> TASK-003, TASK-005, TASK-007
- AC-005, AC-006, AC-007 -> TASK-002, TASK-006, TASK-007, TASK-009
- AC-008 -> TASK-002, TASK-006, TASK-007
- AC-010 -> TASK-004, TASK-009, TASK-010, TASK-014
- AC-011 -> TASK-004, TASK-010, TASK-014
- AC-013, AC-014 -> TASK-002, TASK-003, TASK-004, TASK-007, TASK-011, TASK-014, TASK-015
- AC-015 -> TASK-012, TASK-013, TASK-015, TASK-016

## Verification

- `node --test test/e2e/parallel-dispatch-protocol.test.mjs`
- `node --test test/e2e/harness-behavioral-sentinel.test.mjs`
- `node --test test/e2e/production-readiness-contract.test.mjs`
- `node --test test/e2e/entrypoint-smoke.test.mjs test/e2e/skill-pack-runner.test.mjs`
- `node authoring/evals/run-deterministic.mjs`
- `npm run test:e2e:skill-authoring`
- `npm run sync:skills`
- `npm run check:text-hygiene`
- `npm run check:skills`
- `npm run check:skills:ps`
- `npm run test:e2e:repository`
- `npm run build:site`
- `npm run check:audit`
- `npm run check:site:audit`
- `git diff --check`
- Manual: inspect capability evidence, new-skill mirrors, routing controls,
  worktree ownership, Git shell examples, count 23, and live-agent `NOT RUN`
  disclosure.
