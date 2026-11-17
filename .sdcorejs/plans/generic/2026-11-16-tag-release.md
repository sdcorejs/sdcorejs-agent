---
allowed_paths:
  - scripts/release.mjs
  - scripts/release-package-readme.md
  - .github/workflows/release.yml
  - .github/workflows/ci.yml
  - test/e2e/tag-release.test.mjs
  - test/e2e/npm-publication-contract.test.mjs
  - package.json
  - README.md
  - CHANGELOG.md
  - docs/RELEASE_PROCESS.md
  - .sdcorejs/specs/generic/*tag-release*
  - .sdcorejs/plans/generic/*tag-release*
  - .sdcorejs/docs/generic/*tag-release*
approval_instruction: User requested implementation on the publish branch, then
  tag-driven distribution where tag 1.0.0 is version 1.0.0.
approval_source: delegated-session-scope
approved_at: 2026-11-16T05:34:16.238Z
approved_by: null
approved_spec_hash: sha256:v1:cdaef8bfa9296e5841cd5f2f1d789b439a0bedb65df9dd44e661289692de2955
artifact_id: plan-tag-release-20261116
artifact_kind: plan
change_ref: tag-release-20261116
commit_policy: with-change
contract_id: tag-release-20261116
document_review_performed: false
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:cdaef8bfa9296e5841cd5f2f1d789b439a0bedb65df9dd44e661289692de2955
    artifact_id: spec-tag-release-20261116
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: e4e07cd60d7c033e9a96a1247712230db9e6432e
parent_repository_id: null
repository_relative_path: .sdcorejs/plans/generic/2026-11-16-tag-release.md
requirement_id: R-RELEASE
schema_version: 1
source_revision: e4e07cd60d7c033e9a96a1247712230db9e6432e
stack_profile: node-general
supersedes: null
track: general
approval_hash: sha256:v1:8bf3874fe97ecdc9c26b723009c20ba700a4fbd6a00dc84662d34376885ca6ee
---

# Tag release implementation plan

Sequential generic Node implementation on codex/publish-npm-chatgpt. Canonical skills and mirrors are read-only inputs. Independent audits report only; the integration owner handles repairs.

1. TASK-1, AC-1/2: Capture base and prerequisites. Record failing strict tag, clean HEAD, main ancestry and workflow tests before production implementation.
2. TASK-2, AC-1/3/4: Implement isolated staging, versioned manifests, reproducible archives, source hashes and checksums. Verify extracted helper operation and unchanged source manifests.
3. TASK-3, AC-2/5: Reuse complete CI via workflow_call; add tag-only publication with OIDC and saved artifacts. No live release during this task.
4. TASK-4, AC-3/5: Migrate the retired-npm contract to a narrow release path; update README, changelog and release guide with ownership, native activation, source snapshot versions and failure recovery.
5. TASK-5, AC-4: Focused and repository tests, mirror/hygiene checks, archive dry run, independent workflow and packaging review, repairs and final source-bound evidence.

Self-review: acceptance is observable in actual archives and negative controls; repository dependencies and public skills stay unchanged. Python ZIP support is an explicit build prerequisite. Native filesystem/Windows/live-host checks must run in supported environments; missing execution is never passed. Actual npm/OpenAI publication is excluded.
