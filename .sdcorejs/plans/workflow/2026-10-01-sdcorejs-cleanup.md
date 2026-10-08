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
approval_source: explicit-user-25-section-implementation-delegation
approved_at: 2026-10-01T17:15:00.000Z
approved_by: workspace-owner
artifact_id: sdcorejs-cleanup-plan
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
  - approval_hash: sha256:v1:aae6caef66e444de820ee81c9937b314acd3a1642722b9ad91ad616c9da34031
    artifact_id: sdcorejs-cleanup-spec
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: 03563d26837751d67a354d38589c6ed0fe67ed24
parent_repository_id: null
prohibited_paths:
  - .env*
  - package-lock.json
  - .git/**
repository_relative_path: .sdcorejs/plans/workflow/2026-10-01-sdcorejs-cleanup.md
requirement_id: sdcorejs-cleanup
schema_version: 1
source_revision: 03563d26837751d67a354d38589c6ed0fe67ed24
source_spec: .sdcorejs/specs/workflow/2026-10-01-sdcorejs-cleanup.md
stack_profile: markdown-skill-pack
supersedes: null
track: workflow
approval_hash: sha256:v1:fd945a8261031c80261fd183341d88f8c1e83a3194dbe47e66dc9ae0bca0fd95
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
