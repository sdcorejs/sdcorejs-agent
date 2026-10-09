---
allowed_paths:
  - skills/**
  - _refs/**
  - authoring/**
  - test/**
  - scripts/**
  - AGENTS.md
  - CLAUDE.md
  - README.md
  - VALIDATION.md
  - TESTING.md
  - MIRROR_POLICY.md
  - package.json
  - site/src/**
  - site/scripts/**
  - .github/**
  - .claude/**
  - plugin/**
  - codex/**
  - .cursor/**
  - .sdcorejs/approvals/**
  - .sdcorejs/specs/workflow/2026-10-01-sdcorejs-cleanup.md
  - .sdcorejs/plans/workflow/2026-10-01-sdcorejs-cleanup.md
  - .sdcorejs/specs/workflow/2026-10-02-sdcorejs-cleanup-native-boundary.md
  - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-native-boundary.md
  - site/README.md
  - .sdcorejs/docs/workflow/cleanup-implementation-evidence.md
  - .sdcorejs/summary.md
  - .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-finalization.md
approval_source: delegated-implementation-and-repair-authority
approved_at: 2026-10-01T18:39:03.525Z
approved_by: workspace-owner
artifact_id: sdcorejs-cleanup-plan-finalization
artifact_kind: plan
change_ref: sdcorejs-cleanup
commit_policy: with-change
contract_id: sdcorejs-cleanup:v1
coverage_approach: TDD
execution_policy: sequential
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:e634b4e4e29fa034b23a2d0b1dad87e5b235217f07a2fbc0fd3cfab99b626cda
    artifact_id: sdcorejs-cleanup-spec-native-boundary
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: 03563d26837751d67a354d38589c6ed0fe67ed24
parent_repository_id: null
prohibited_paths:
  - .env*
  - package-lock.json
  - .git/**
repository_relative_path: .sdcorejs/plans/workflow/2026-10-02-sdcorejs-cleanup-finalization.md
requirement_id: sdcorejs-cleanup
schema_version: 1
source_revision: 03563d26837751d67a354d38589c6ed0fe67ed24
source_spec: .sdcorejs/specs/workflow/2026-10-02-sdcorejs-cleanup-native-boundary.md
stack_profile: markdown-skill-pack
supersedes: sdcorejs-cleanup-plan-native-boundary
track: workflow
approval_hash: sha256:v1:26422565014629a7252782cb910fcc71e90dc10474b6a11f761a3f492a533906
---

# Cleanup implementation plan

Execution policy: sequential core implementation with disjoint authoring/integration and fixture-test units; independent read-only final review. The user explicitly delegated implementation and requested end-to-end delivery. All work is in an isolated branch from 03563d26837751d67a354d38589c6ed0fe67ed24. No user-data cleanup or Git artifact delivery is authorized.

D-001: A distinct public utility owns discovery, frozen mutation, recovery and offer lifecycle. Explore remains context/signal producer; simplify remains source-refinement owner. This lifecycle and authority cannot be expressed cleanly as an explorer write mode without mixing context ownership with destructive operations. Raise public ceiling from 23 to 24 using canonical trigger and ceiling approvals; preserve the guard and adversarial tests.
D-002: Put reusable pure policy/offer contracts and bounded filesystem engine under _refs/cleanup; reuse artifact lifecycle, repository identity, documentation path normalization, capabilities and interaction contracts.
D-003: Default analysis scope is explicit. Reference discovery is separately bounded; incomplete coverage stays unknown. Runtime producer/ownership evidence is explicit, never guessed from a filename.
D-004: Mutation is per exact file with no recursive cleanup; quarantine/archives have exact destination and snapshot records, fail on occupied restore paths; directory inventory and reference fingerprints make approvals stale when material state changes.

TASK-001 (R-001..R-005, AC-001..AC-004, AC-006): Implement scanner/classification, frozen plan/authority/revalidation, apply/quarantine/archive/delete/restore and receipts; protect roots, active evidence, symlinks, Git boundaries and locks.
TASK-002 (R-006..R-008, AC-005, AC-007): Author public skill, canonical routing, inventory/ceiling approvals and tests, explorer signals, coordinator offers, task-tail and ship/convergence protocol integration; update docs. Owned surfaces exclude engine and new cleanup fixture tests.
TASK-003 (R-002..R-007, AC-001..AC-006): Author isolated Node fixtures and adversarial behavioral tests for the explicit acceptance matrix; no live data or external provider calls.
TASK-004 (R-008, AC-007): Fan in, sync official mirrors, focused suites, deterministic authoring matrix, text/reference checks, repository E2E/site validation, independent read-only review, bounded repair, final verification and branch hygiene.

Architecture gate: repository-local utility/helper contracts; no application frontend or production delivery infrastructure. No new implementation track, artifact lifecycle enum or global current-state mechanism.
Verification: node --test test/e2e/cleanup-*.test.mjs; npm run test:e2e:skill-authoring; node authoring/evals/run-deterministic.mjs; npm run sync:skills; npm run check:skills; npm run check:skills:ps; npm run check:text-hygiene; npm run check:executable-references; npm run test:e2e:repository; npm test; site install/check/build when available. Record exact results and any unavailable supported runtime, external containers or live evaluation. Evidence must map to ACs; no skipped layer is a pass.

D-005: Repair the Windows file-operation race using existing OS handles, including writer creation and release. Analyze and planning remain portable; mutation fails closed where this backend is unavailable. Recheck scoped nested-repository markers at the final observed boundary. Report logical active-path bytes, recovery-held bytes and measured native source allocation separately; never infer real reclaim from logical sparse-file length.
D-006: Restore is a separately sealed mutation event with before/after snapshots and actual affected commands. Preserve cleanup suppression/proof through both native and portable existing context handoffs, then re-run convergence/branch-ready. Final verification binds current sources, leaving earlier evaluation captures historical.

D-007: Perform source summary-refresh in the authorized documentation/finalization phase after package scripts and utility registration change. Preserve the Summary v2 contract and declared entrypoints; never write from read-only runtime preflight. This repository-maintenance step is covered by existing end-to-end implementation/documentation/verification authority, not inferred from a stale-summary signal. Original approved plans remain immutable.
