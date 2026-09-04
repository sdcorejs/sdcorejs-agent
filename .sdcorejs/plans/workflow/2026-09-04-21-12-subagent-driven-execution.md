---
artifact_id: plan-contract-subagent-driven-execution-20260904-r1
artifact_kind: plan
schema_version: 1
change_ref: subagent-driven-execution-20260904
source_spec: .sdcorejs/specs/workflow/2026-09-04-21-12-subagent-driven-execution.md
source_plan: none
commit_policy: with-change
owner: sdcorejs-plan
name: subagent-driven-execution
description: Approved sequential integration plan for delegated execution and portable isolation improvements.
contract_id: contract-subagent-driven-execution-20260904
requirement_id: req-subagent-driven-execution-20260904
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
repository_relative_path: .sdcorejs/plans/workflow/2026-09-04-21-12-subagent-driven-execution.md
source_revision: 359e2c7e9d311a4fd780c54b1fa42196ca990611
parent_repository_id: github.com/sdcorejs/sdcorejs-agent
parent_references:
  - repository_id: github.com/sdcorejs/sdcorejs-agent
    artifact_id: spec-contract-subagent-driven-execution-20260904-r1
    artifact_kind: spec
    revision: 359e2c7e9d311a4fd780c54b1fa42196ca990611
    approval_hash: sha256:v1:a98dc8a7074a04bf0ea486c71fb26138ec211c6f1a67f1cedba463cbe4c3f0f7
approved_at: 2026-09-04T14:12:54.026Z
approved_by: workspace-owner
approval_source: equivalent-complete-input
track: workflow
target_root_kind: sdcorejs-agent-authoring-repo
stack_profile: markdown-skill-pack
sourceSpecPath: .sdcorejs/specs/workflow/2026-09-04-21-12-subagent-driven-execution.md
approved_spec_hash: sha256:v1:a98dc8a7074a04bf0ea486c71fb26138ec211c6f1a67f1cedba463cbe4c3f0f7
taskCount: 16
phaseCount: 5
execution_policy: sequential
allowed_paths:
  - .sdcorejs/approvals/subagent-driven-development-new-trigger.json
  - .sdcorejs/docs/workflow/2026-09-04-21-12-subagent-driven-execution-*.md
  - .sdcorejs/specs/workflow/2026-09-04-21-12-subagent-driven-execution.md
  - .sdcorejs/plans/workflow/2026-09-04-21-12-subagent-driven-execution.md
  - skills/**
  - _refs/harness/**
  - _refs/orchestration/**
  - test/e2e/**
  - AGENTS.md
  - CLAUDE.md
  - .clinerules
  - .github/**
  - README.md
  - TESTING.md
  - VALIDATION.md
  - docs/ADOPTION.md
  - docs/RELEASE_PROCESS.md
  - site/README.md
  - site/src/**
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
dependency_changes:
  required: false
  approval_required: false
env_changes:
  required: false
  approval_required: false
migration_changes:
  required: false
  approval_required: false
approval_hash: sha256:v1:4c5fb8a1ab66b8bb3da36c906394476dfcbc4b74de1b8092a112764bf2ffd1e5
approved_plan_hash: sha256:v1:4c5fb8a1ab66b8bb3da36c906394476dfcbc4b74de1b8092a112764bf2ffd1e5
supersedes: null
change_control:
  revision: 1
  supersedes: null
  change_reason: null
---

# Subagent-Driven Execution and Portable Isolation - Approved Plan

> Snapshot of the plan approved at the `sdcorejs-plan` gate. Re-author through
> `sdcorejs-plan` if the contract changes.

## Approved contract

Execute the 16 tasks in the source plan across five phases: establish RED
contracts, implement runtime attestation and the shared DAG/concurrency
protocol, add the high-level delegated-development skill and separate ownership
boundaries, synchronize the 23-skill distribution, then run current verification
and read-only closeout.

The implementation is sequential in this authoring worktree because capability,
routing, count, and generated-mirror files are shared integration surfaces and
the current session has no explicit authorization to launch implementation
subagents. This execution choice does not weaken the product contract: the
implemented skill must prefer parallel fresh workers when attested and safe,
fall back to sequential fresh workers when only concurrency/isolation is unsafe,
and use the parent only when delegation is unavailable.

Writes are limited to the paths listed in approved metadata. Package manifests,
lockfiles, environment files, dependencies, migrations, package versions,
summary/session state, release actions, commits, pushes, tags, and unrelated
changes are prohibited. Canonical files are edited first; generated surfaces
are produced only by `npm run sync:skills` after focused tests are green.

## Decisions captured during review

- The user-approved 23rd public trigger is retained as a change-scoped approval
  artifact and no ceiling increase is made.
- Runtime attestation is session evidence, not a static promise in an adapter
  manifest.
- A real bounded runner is tested only under explicit concurrency attestation;
  sequential default behavior remains compatible.
- Existing baseline failures and the local Node engine mismatch are reported
  separately from regressions introduced by this plan.
- Live provider evaluation is not authorized by this plan and remains `NOT RUN`.

## Skill provenance

sdcorejs-plan (approved on attempt 1 / 3 through equivalent complete input)
