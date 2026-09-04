---
artifact_id: spec-contract-subagent-driven-execution-20260904-r1
artifact_kind: spec
schema_version: 1
change_ref: subagent-driven-execution-20260904
source_spec: none
source_plan: none
commit_policy: with-change
owner: sdcorejs-spec
name: subagent-driven-execution
description: Approved contract for delegated execution, runtime attestation, DAG waves, workspace isolation, and portable Git guidance.
contract_id: contract-subagent-driven-execution-20260904
requirement_id: req-subagent-driven-execution-20260904
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
owner_module_id: null
repository_relative_path: .sdcorejs/specs/workflow/2026-09-04-21-12-subagent-driven-execution.md
source_revision: 359e2c7e9d311a4fd780c54b1fa42196ca990611
parent_repository_id: null
parent_references: []
approved_at: 2026-09-04T14:12:54.026Z
approved_by: workspace-owner
approval_source: equivalent-complete-input
track: workflow
target_root_kind: sdcorejs-agent-authoring-repo
stack_profile: markdown-skill-pack
profile_confidence: high
sourceDraftPath: .sdcorejs/docs/workflow/2026-09-04-21-12-subagent-driven-execution-spec.md
approval_hash: sha256:v1:a98dc8a7074a04bf0ea486c71fb26138ec211c6f1a67f1cedba463cbe4c3f0f7
approved_spec_hash: sha256:v1:a98dc8a7074a04bf0ea486c71fb26138ec211c6f1a67f1cedba463cbe4c3f0f7
acceptance_criteria_count: 15
manual_criteria_count: 1
redaction_applied: false
supersedes: null
change_control:
  revision: 1
  supersedes: null
  change_reason: null
---

# Subagent-Driven Execution and Portable Isolation - Approved Spec

> Snapshot of the contract approved at the `sdcorejs-spec` gate. Re-author
> through `sdcorejs-spec` if the contract changes.

## Approved contract

Make delegated execution a reliable first-class workflow instead of an
occasionally reached parallel-only branch. Preserve `sdcorejs-parallel-dispatch`
as the low-level safety scheduler, add one high-level
`sdcorejs-subagent-driven-development` entrypoint, and keep workspace isolation
as a provider-neutral orchestration primitive rather than a Git-artifact mode.

The approved implementation must:

1. Add evidence-backed runtime attestation for delegation, concurrency,
   worker-CWD, worktree, cancellation, result-reference, and maximum-concurrency
   observations while preserving tri-state static defaults.
2. Compile compact approved-plan units into deterministic dependency waves and
   a parallel opportunity report with eligibility, benefit, blockers, and safe
   repair suggestions.
3. Use one dependency-wave interpretation across execute-plan selection and
   parallel classification. A dependency tail orders waves instead of
   automatically rejecting all parallel work.
4. Apply the fallback order parallel fresh workers, sequential fresh workers,
   then parent execution only when delegation is unavailable.
5. Prove bounded overlap only when explicitly attested, preserve sequential
   default behavior, and report fail-fast cancellation honestly.
6. Keep `sdcorejs-parallel-dispatch` as a low-level scheduler and introduce
   exactly one new public high-level skill. Direct delegated approved-plan work
   uses the new skill; generic approved-plan execution stays with
   `sdcorejs-execute-plan`; read-only parallel audits stay with the scheduler;
   unapproved writes remain behind discovery and planning.
7. Make workspace isolation an orchestration primitive with one owner while
   retaining consent, no-nesting, baseline, package-manager, cleanup, and
   integration safety rules. Git continues to own commit, PR, changelog, and
   release-note artifacts only.
8. Replace canonical POSIX-only Git instructions with shell-neutral behavior
   and labeled shell-specific alternatives.
9. Keep all canonical sources, mirrors, manifests, entrypoints, public docs,
   site content, and tests synchronized at 23 public skills.
10. Preserve the existing dependency, lockfile, environment, migration,
    package-version, release, commit, and push state.

Acceptance is AC-001 through AC-015 in the source draft. Deterministic tests
must cover routing controls, runtime observation validation, DAG consistency,
plan compilation, measured overlap, fail-closed fallbacks, workspace ownership,
Git portability, mirror parity, and public inventory count. Live provider
behavior remains a distinct `NOT RUN` layer unless separately authorized.

## Decisions captured during review

- The user approved the single new public trigger; its trusted approval record
  is `.sdcorejs/approvals/subagent-driven-development-new-trigger.json`.
- A second public workspace skill is deliberately not added because the current
  23-skill ceiling has one remaining slot. Workspace isolation is extracted as
  an internal primitive and routed by execution owners.
- `sdcorejs-parallel-dispatch` is not renamed or deleted because scheduler
  safety and delegated-development lifecycle are separate responsibilities.
- The current baseline authoring transcript-hash failure and the Node 22.22.2
  engine mismatch remain explicit limitations, not claimed regressions or
  passing evidence.

## Skill provenance

sdcorejs-spec (approved on attempt 1 / 3 through equivalent complete input)
