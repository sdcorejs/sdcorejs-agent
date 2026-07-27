---
artifact_id: plan-contract-sdcorejs-simplify-20260727-r1
artifact_kind: plan
change_ref: sdcorejs-simplify-20260727
source_spec: .sdcorejs/specs/workflow/2026-07-27-10-43-sdcorejs-simplify.md
source_plan: none
commit_policy: with-change
owner: sdcorejs-plan
name: sdcorejs-simplify
description: Approved sequential implementation plan for the behavior-preserving simplify workflow utility.
approvedAt: 2026-07-27T10:43:44+07:00
approvedBy: nghiatt15@onemount.com
approval_source: equivalent-complete-input
track: workflow
sourceSpecPath: .sdcorejs/specs/workflow/2026-07-27-10-43-sdcorejs-simplify.md
taskCount: 20
phaseCount: 6
target_root_kind: sdcorejs-agent-authoring-repo
stack_profile: node-general
approved_spec_hash: 3e2195d10292a8bdda0412a62194b7dc4f2d540bde614fc18159388f67128b6c
allowed_paths:
  - canonical simplify skill and references
  - source-owned routing, finish-tail, downstream, test, public documentation, and catalog files
  - generated Claude, plugin, Codex, reference, and Cursor mirrors through sync only
  - four change-scoped spec and plan artifacts
prohibited_paths:
  - package-lock.json
  - site/package-lock.json
  - site/package.json
  - .env*
  - generated, vendor, build, and coverage output outside the declared sync targets
  - .sdcorejs/summary.md
  - mutable session/checkpoint paths
dependency_changes:
  required: false
  approval_required: false
env_changes:
  required: false
  approval_required: false
migration_changes:
  required: false
  approval_required: false
approved_plan_hash: a16a00f46c4206932d46b61ada37a62b52b78954ee7772a29061110a7b273662
supersedes: null
change_control:
  revision: 1
  supersedes: null
  change_reason: null
---

# SDCoreJS Simplify Workflow Utility - Approved Plan

> Snapshot of the plan approved through equivalent complete user input at the
> `sdcorejs-plan` gate. Do not edit this snapshot; re-author through
> `sdcorejs-plan` if the contract changes.

## Approved contract

The complete 20-task, six-phase approved execution contract is frozen in
`.sdcorejs/docs/workflow/2026-07-27-10-43-sdcorejs-simplify-plan.md`, identified
by SHA-256
`a16a00f46c4206932d46b61ada37a62b52b78954ee7772a29061110a7b273662`.
It is incorporated into this immutable snapshot by hash and
`sourceSpecPath`. The source draft is a required-with-change artifact under the
same `change_ref`.

Execution is sequential because routing, finish-tail ordering, package
aggregation, public counts, and generated mirrors are shared integration
surfaces. The plan authorizes only canonical/source-owned edits plus
sync-generated mirrors. It forbids dependency, env, migration, package-version,
lockfile, summary, session/checkpoint, Git-history, release, and unrelated
changes.

## Decisions captured during review

- The detailed attached request is accepted as explicit approval for the plan
  and its sequential integration mode.
- The requested verification and documentation matrix preselects those finish
  outcomes; a separate finish prompt does not reopen them.
- Simplification is skipped for this authoring run unless a separate eligible
  executable-source scope with a green baseline exists.
- Read-only contract/diff review and scoped repair of verified findings are
  included before final read-only gates.

## Skill provenance

sdcorejs-plan (approved on attempt 1 / 3 through equivalent complete input)
