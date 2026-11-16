---
approval_source: delegated-session-scope
approved_at: 2026-11-14T07:48:30.036Z
approved_by: null
artifact_id: spec-governed-delivery-r1
artifact_kind: spec
change_ref: governed-delivery-2026-11-14
commit_policy: with-change
contract_id: governed-delivery-2026-11-14
document_review_performed: false
instruction_reference: "Current user request: save required authoring skills and
  installation prerequisites, then implement the four discussed improvements;
  reaffirmed by request to rerun after model change."
owner: sdcorejs-spec
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references: []
parent_repository_id: null
redaction_applied: true
repository_relative_path: .sdcorejs/specs/workflow/2026-11-14-governed-delivery.md
requirement_id: R-001
schema_version: 1
source_plan: none
source_revision: a71251fc03890326af14afd496d5955cc30ccc20
source_spec: none
stack_profile: markdown-skill-pack
supersedes: null
track: workflow
approval_hash: sha256:v1:82f8a6bd20c0baf70cc23a58ca350a30e686facc751ecc312b4dc639fbdd0a7b
---
# Governed project delivery

## Problem and goals
Connect project initialization, tracker requirements, implementation evidence, adaptive documentation and learning using existing skill owners. Persist authoring prerequisites and independent audit in this authoring repository.

## Requirements and acceptance
- R-001 / AC-001: Authoring preflight discovers installer, creator, Superpowers writing-skills and TDD, NVIDIA evaluator and its executable. Missing prerequisites block authoring with installation guidance; consumer projects do not inherit authoring prerequisites.
- R-002 / AC-002: Project blueprint covers scope, stack, architecture boundaries, coding, APIs/data, permissions, UI/accessibility, unit/integration/E2E, documentation and delivery/learning policies. Each area has evidence or an explicit decision/gap; existing accepted conventions remain authoritative.
- R-003 / AC-003: Product intake creates immutable sanitized tracker snapshots and content-addressed local assets, rewrites requirements with provenance, keeps proposed AC distinct, detects revision changes without silently changing approved behavior.
- R-004 / AC-004: Delivery reuses canonical validation evidence and behavior-based E2E selection. Remote write plans bind source revision and exact payload, are idempotent and require authorized connector writes plus read-back.
- R-005 / AC-005: Documentation selects module/entity/feature/journey scope by audience and actual evidence; preserves manual content; user guides omit framework inventories.
- R-006 / AC-006: Verified reusable lessons carry applicability, root cause, regression protection and source fingerprints; Explore retrieves only relevant records and rejects stale promotion.
- R-007 / AC-007: Registry/lifecycle/context/workflow consumers recognize new artifacts; generated mirrors and existing contracts stay valid. Independent review and evaluator evidence state unrun layers truthfully.

## Decisions
D-001: Extend existing skills/references/helpers; no new public skill. D-002: E2E follows behavior; documented exceptions for pure logic/docs. D-003: Tracker snapshot records external facts; approved specs retain behavior authority. D-004: Audit is performed by a different fresh-context read-only agent.

## Architecture gate
Required: shared artifact contracts and cross-skill ownership change.

## Risks and mitigation
Untrusted tracker text/assets: sanitize, hash, explicit content screening, no instruction authority. Concurrent changes: compare source revision before a write and verify read-back. Stale proof: retain canonical validation-map evaluation. Duplicate requirements: Documentation references Product intake and approved spec.

## Non-goals
No production CI/CD, deployment or incident tooling. No live tracker writes without a concrete target and authority. No paid provider calls or fabricated live evaluation. No public skill inventory increase.

## Verification
Behavioral unit/contract tests and temporary-project filesystem flow; existing repository suites, mirror/text/reference checks, independent agent audit and NVIDIA static quality checks. Real tracker integration/live agent benchmark remain explicitly NOT RUN in this authoring change.
