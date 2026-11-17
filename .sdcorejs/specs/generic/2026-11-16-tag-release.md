---
approval_instruction: User requested implementation on the publish branch, then
  tag-driven distribution where tag 1.0.0 is version 1.0.0.
approval_source: delegated-session-scope
approved_at: 2026-11-16T05:34:16.238Z
approved_by: null
artifact_id: spec-tag-release-20261116
artifact_kind: spec
change_ref: tag-release-20261116
commit_policy: with-change
contract_id: tag-release-20261116
document_review_performed: false
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
owner: sdcorejs-spec
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references: []
parent_repository_id: null
repository_relative_path: .sdcorejs/specs/generic/2026-11-16-tag-release.md
requirement_id: R-RELEASE
schema_version: 1
source_revision: e4e07cd60d7c033e9a96a1247712230db9e6432e
stack_profile: node-general
supersedes: null
track: general
approval_hash: sha256:v1:cdaef8bfa9296e5841cd5f2f1d789b439a0bedb65df9dd44e661289692de2955
---

# Tag-driven skill distribution

This snapshot records bounded implementation authority from the current user request, not user review of the generated document or authorization to perform a release now.

- AC-1: Bare SemVer tag 1.0.0 yields version 1.0.0 in npm and OpenAI/Claude artifacts. Reject malformed tags, v aliases and build metadata; prereleases use next.
- AC-2: Publishing requires clean tagged HEAD on origin/main and successful complete CI. Ordinary pushes and PRs never publish.
- AC-3: Assemble public assets into a new external directory, preserving source metadata, existing work, historical evidence and the 25-skill inventory. Include licenses, input hashes and checksums. Exclude maintainer dependencies and OpenAI lifecycle hooks.
- AC-4: Preview builds, actual archive extraction/runtime smoke, negative identity tests and independent review establish scoped evidence. Unavailable host checks remain explicit.
- AC-5: Document npm ownership/OIDC setup and separate OpenAI review. No tags, registry publication or portal submission during implementation.

Architecture decision: no separate architecture artifact is required for extending existing repository tooling with a deterministic packager and reusing CI. No application service, hosted state, model calls, new skill or installation behavior is introduced.

Risk review: immutable version identity, lost shared references, private-file inclusion, partial publication and host capability differences. Mitigations: exact tag binding, public input inventory, extracted helper smoke, separate archives, saved checksums and documented recovery. Root tooling stays private.
