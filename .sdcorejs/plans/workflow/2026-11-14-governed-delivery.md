---
allowed_paths:
  - AGENTS.md
  - authoring/**
  - _refs/**
  - skills/**
  - test/**
  - scripts/**
  - package.json
  - README.md
  - .sdcorejs/**
  - .claude/**
  - plugin/**
  - codex/**
  - .cursor/**
  - .github/**
approval_source: delegated-session-scope
approved_at: 2026-11-14T07:48:30.036Z
approved_by: null
artifact_id: plan-governed-delivery-r1
artifact_kind: plan
change_ref: governed-delivery-2026-11-14
commit_policy: with-change
contract_id: governed-delivery-2026-11-14
document_review_performed: false
execution_policy: auto
instruction_reference: "Current user request: save required authoring skills and
  installation prerequisites, then implement the four discussed improvements;
  reaffirmed by request to rerun after model change."
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:82f8a6bd20c0baf70cc23a58ca350a30e686facc751ecc312b4dc639fbdd0a7b
    artifact_id: spec-governed-delivery-r1
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: a71251fc03890326af14afd496d5955cc30ccc20
  - approval_hash: sha256:v1:de9f12c5181033806000ec7990e42d9538a54e100c87f305fe83faead1d784c7
    artifact_id: architecture-governed-delivery-r1
    artifact_kind: architecture
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: a71251fc03890326af14afd496d5955cc30ccc20
parent_repository_id: null
prohibited_paths:
  - site/**
redaction_applied: true
repository_relative_path: .sdcorejs/plans/workflow/2026-11-14-governed-delivery.md
requirement_id: R-001
schema_version: 1
source_plan: none
source_revision: a71251fc03890326af14afd496d5955cc30ccc20
source_spec: .sdcorejs/specs/workflow/2026-11-14-governed-delivery.md
stack_profile: markdown-skill-pack
supersedes: null
track: workflow
approval_hash: sha256:v1:c450454c842a6de01c85fb050a59896c200780eb7ce63c05068147fa8b7ce6c1
---
# Governed delivery implementation plan

## Authority
Execute the user-authorized scope above. The documents are self-reviewed; the user has not reviewed their generated text.

## Execution
Parent owns shared registries, entrypoints, package scripts, integration, artifacts and mirrors. Independent helper units may use fresh workers only with disjoint exact file ownership; no worker writes shared state or Git artifacts. Audits are read-only with fresh context.

## Tasks and proving cases
1. TASK-001 (AC-001): Persist authoring prerequisite/install/audit rules; implement a read-only executable preflight with missing/invalid fixture tests.
2. TASK-002 (AC-002, AC-006): Implement blueprint and learning contracts plus references; test incomplete baselines, explicit exceptions, verified lessons, duplicate/stale handling.
3. TASK-003 (AC-003, AC-004): Implement ticket snapshot/refresh/delivery contracts and refs; test source identity collisions, bytes/hashes, redaction, source conflicts, proposed AC and receipt freshness.
4. TASK-004 (AC-005): Implement documentation profile selection and safe update semantics; test non-CRUD roles/journeys and preserving manual edits.
5. TASK-005 (AC-007): Wire central registry, lifecycle and context; route owning skills through the refs; sync mirrors; run existing and new focused suites, repository checks and independent audit.

## Validation map
AC-001..AC-007 each require executable behavioral tests under test/e2e plus affected existing contracts. Evidence class UNIT for pure policy validators; GOLDEN for temporary target filesystem journeys; independent review is separate. Browser E2E is not applicable because this change provides an authoring skill pack without an application UI; real Jira/GitHub connector E2E is NOT RUN without a target fixture account.

## Completion
Repair validated findings, rerun affected checks and audit final hashes. Do not push or publish. Report actual checks, limitations and changed artifacts.
