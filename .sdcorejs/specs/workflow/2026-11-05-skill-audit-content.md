---
approval_source: delegated-session-scope
approved_at: 2026-11-05T09:17:58.580Z
approved_by: requesting-user
artifact_id: skill-audit-content-20261105-spec
artifact_kind: spec
authorization_basis: "Current task, 2026-11-05: user explicitly authorizes
  autonomous completion and execution of spec/plan for verified F-001..F-012,
  workflow/context improvements, behavioral regressions and sdcorejs-content
  including inventory/routing/mirrors, grouped commits, push and PR to main. No
  separate document-review interaction occurred. This is delegated scope
  authorization, not a claim that the user reviewed these generated documents."
change_ref: skill-audit-content-20261105
commit_policy: with-change
contract_id: skill-audit-content-20261105
document_review_performed: false
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
owner: sdcorejs-spec
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references: []
parent_repository_id: null
redaction_applied: true
repository_relative_path: .sdcorejs/specs/workflow/2026-11-05-skill-audit-content.md
requirement_id: skill-audit-content-20261105
schema_version: 1
source_plan: none
source_revision: af42f21a36f12ae31c09abac1009f41f51b3d87f
source_spec: none
stack_profile: markdown-skill-pack
supersedes: null
track: workflow
approval_hash: sha256:v1:21af1819137563b3629cdca1b8641fbf0fca6e17958cdd9189e92792aae20145
---
# Skill audit implementation and Content

## Authority and problem
Current task, 2026-11-05: user explicitly authorizes autonomous completion and execution of spec/plan for verified F-001..F-012, workflow/context improvements, behavioral regressions and sdcorejs-content including inventory/routing/mirrors, grouped commits, push and PR to main. No separate document-review interaction occurred. This is delegated scope authorization, not a claim that the user reviewed these generated documents.

The historical handoff is evidence, not implementation approval. Revalidate findings against af42f21a36f12ae31c09abac1009f41f51b3d87f; preserve its two documents and all prior evaluation transcripts. Existing helper tests can pass while published producers and consumers disagree.

## Outcomes and acceptance
- AC-001: Spec/plan literal templates round-trip with self hash aliases; body, owner, parent hash and mismatched aliases remain tamper-sensitive.
- AC-002: Read-only parallel compilation preserves request identity, zero writable paths, report output, and denied mutations through dispatch; invalid write inputs reject.
- AC-003: Debug attempt authorization is independent of post-fix completion; bounded direct authority preserves owner/path/freshness/root-hypothesis controls.
- AC-004: Explore authority is action-specific; role alone cannot write environment, persona or memory.
- AC-005: Next.js basic and i18n use the same maintained config producer as the recipe and build independently; actual plan command and Product AC shapes reach consumers.
- AC-006: One session authority policy keeps fast-fix, same-change dirty edits, finish review and authorized Git continuation proportional; ambiguity and scope/risk growth stay gated.
- AC-007: Git/Ship use one disposition table for verified delivery, explicitly deferred draft/local work and non-waivable hygiene.
- AC-008: Documentation routes by requested action, memory retrieval is selective/advisory, current evidence wins.
- AC-009: All 24 existing skills are inventoried; selected large entrypoints load mode/schema references only when needed, with invariants retained and measured source and selected-context costs separated.
- AC-010: Content serves personal and product voices, Facebook/TikTok and extensible channel/format/domain references; brief, strategy, research, draft/edit, repurpose, review and real-feedback learning are usable. Unsupported claims and unprovided firsthand experience are excluded; drafting never grants publishing, scheduling, messaging or persistent profile updates.
- AC-011: Regression covers real templates and cross-skill transitions with negative controls; isolated agent evidence, deterministic checks, runtime checks and NOT RUN layers are distinct.
- AC-012: Canonical changes generate clean mirrors, preserve internal non-distribution, pass relevant checks and receive independent review before PR to main; no merge.

## Boundaries and design
Owner/execution host: github.com/sdcorejs/sdcorejs-agent, standalone authoring repository. Track workflow, profile markdown-skill-pack. Keep helper APIs additive when possible. Avoid changing hash semantics for previously valid snapshots: represent compatibility self-hashes outside protected payload with exact-equality validation. Retain parent hashes inside protection. Content is a distinct editorial lifecycle and authority boundary, integrated as the 25th public skill under existing distribution, not a production-SDLC extension.

Architecture gate: not-applicable. Changes stay in one repository and existing ownership model; there is no new cross-repository API, persisted application data model or trust boundary. Contract fixes preserve fail-closed controls.

## Verification and risks
Use test/e2e with literal templates, actual helper calls and temporary repositories; baseline failures first. Exercise Next.js golden basic/i18n runtime, focused authoring/routing/contract suites and repository integration. Independent agents get realistic raw requests without intended answers for behavioral cases. Hash new evidence separately; old source-only/live NOT RUN records stay historical. Changes to authoring-source hashes may require explicit continuation records rather than overwriting old attestations.

## Non-goals and deferred opportunities
No CI/CD, infrastructure, SRE, deployment, release, publishing or merge. No unverified broad NestJS profile rewrite, AI adapter redesign, new cleanup backends or universal social algorithm rules. Additional audit opportunities are evaluated, not automatically implemented. Full live-provider/OS/browser coverage is recorded NOT RUN unless actually exercised.
