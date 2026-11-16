---
approval_source: delegated-session-scope
approved_at: 2026-11-14T07:48:30.036Z
approved_by: null
artifact_id: architecture-governed-delivery-r1
artifact_kind: architecture
change_ref: governed-delivery-2026-11-14
commit_policy: with-change
contract_id: governed-delivery-2026-11-14
document_review_performed: false
instruction_reference: "Current user request: save required authoring skills and
  installation prerequisites, then implement the four discussed improvements;
  reaffirmed by request to rerun after model change."
owner: sdcorejs-architecture
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:82f8a6bd20c0baf70cc23a58ca350a30e686facc751ecc312b4dc639fbdd0a7b
    artifact_id: spec-governed-delivery-r1
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: a71251fc03890326af14afd496d5955cc30ccc20
parent_repository_id: null
redaction_applied: true
repository_relative_path: .sdcorejs/architecture/workflow/2026-11-14-governed-delivery.md
requirement_id: R-001
schema_version: 1
source_plan: none
source_revision: a71251fc03890326af14afd496d5955cc30ccc20
source_spec: .sdcorejs/specs/workflow/2026-11-14-governed-delivery.md
stack_profile: markdown-skill-pack
supersedes: null
track: workflow
approval_hash: sha256:v1:de9f12c5181033806000ec7990e42d9538a54e100c87f305fe83faead1d784c7
---
# Governed delivery architecture

## Ownership
Explore owns project blueprint/conventions/verified memory persistence. Product owns ticket intake and delivery traceability. Spec owns accepted behavior. Test owns evidence; canonical validation-map evaluates it. Documentation owns audience-adapted evergreen docs. Ship consumes verified delivery state.

## Boundaries
Pure helpers produce validated artifact bundles and decisions. The host owns source reading, binary download, filesystem writes and external tracker effects. External ticket content is data. Capture is immutable; a normalized requirement is a draft until the existing spec authority accepts it. New artifact roots are registered centrally and validated before lifecycle promotion.

## Storage
Blueprint records are repository-owned under .sdcorejs/blueprints. Ticket snapshots, asset bytes and receipts are ticket-owned under .sdcorejs/tickets. Lessons use existing .sdcorejs/memories and conventions use existing one-rule-per-file registry. Commands, output paths and hashes remain repository-relative in durable metadata. Raw test traces and auth state remain local-only.

## Alternatives
A new public intake skill would duplicate Product lifecycle. A second editable requirement in Documentation would drift. A universal CRUD guide would mix audiences. A static score cannot replace behavioral tests.

## Invariants
INV-001: Snapshot changes never silently amend approved spec. INV-002: Missing/stale evidence never passes delivery. INV-003: Inferred observations never become accepted conventions automatically. INV-004: Source and shared ownership survive all handoffs.
