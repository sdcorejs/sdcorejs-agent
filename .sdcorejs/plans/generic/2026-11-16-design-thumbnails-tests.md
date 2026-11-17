---
allowed_paths:
  - _refs/design/visual-library/**
  - _refs/sdlc/static-visual-composer.mjs
  - _refs/sdlc/visual-companion/renderer.mjs
  - _refs/sdlc/visual-companion/live-document.mjs
  - _refs/sdlc/visual-offer-policy.md
  - skills/tracks/design/sdcorejs-design.md
  - test/e2e/design-thumbnails.test.mjs
  - test/e2e/design-thumbnail-browser.mjs
  - README.md
  - authoring/evals/design-thumbnails/**
  - .claude/**
  - codex/**
  - plugin/**
  - .sdcorejs/specs/generic/2026-11-16-design-thumbnails.md
  - .sdcorejs/plans/generic/2026-11-16-design-thumbnails.md
  - package.json
  - .sdcorejs/plans/generic/2026-11-16-design-thumbnails-tests.md
approval_instruction: User requested thumbnail capability so consumers can
  understand UI layouts while choosing, and explicitly selected both gallery and
  in-chat display.
approval_source: delegated-session-scope
approved_at: 2026-11-16T10:34:45.163Z
approved_by: null
approved_spec_hash: sha256:v1:8d276eee82b625b374c105c49b9436c0ac0179739c68988c605a1712065516b2
artifact_id: plan-design-thumbnails-tests-20261116
artifact_kind: plan
change_ref: design-thumbnails-20261116
commit_policy: with-change
contract_id: design-thumbnails-20261116
document_review_performed: false
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:8d276eee82b625b374c105c49b9436c0ac0179739c68988c605a1712065516b2
    artifact_id: spec-design-thumbnails-20261116
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: 9af8f5842d0a142b301eec4e05ca99efbf56201c
parent_repository_id: null
prohibited_paths:
  - package-lock.json
  - .github/workflows/**
  - authoring/evals/design-expansion/**
  - authoring/evals/design-visual-library/**
  - authoring/evals/design-visual-polish/**
repository_relative_path: .sdcorejs/plans/generic/2026-11-16-design-thumbnails-tests.md
requirement_id: R-DESIGN-THUMBNAILS
schema_version: 1
source_revision: 9af8f5842d0a142b301eec4e05ca99efbf56201c
stack_profile: node-general
supersedes: plan-design-thumbnails-20261116
track: general
approval_hash: sha256:v1:232f6cd7b3e14ff3db2dec84dba8c4a9f3eeb03da9e393d34a5d19296224e92b
---

# Thumbnail implementation plan

Sequential generic Node implementation on the existing design branch. Initial dirty files belong to the reviewed design expansion; record their hashes and preserve that work. The prior expansion receipt remains historical.

1. AC-1/3: Capture baseline and failing thumbnail capability tests. Implement bounded read-only thumbnail resolution and source/PNG integrity checks.
2. AC-1/4/5: Add optional existing-browser capture into a new output directory, generate the 42 default images and manifest, and expose their paths for native chat display.
3. AC-2/5: Add opt-in compact thumbnail cards to shared static/live rendering; embed validated local PNG bytes, keep full preview disclosure separate from choice buttons and preserve response/digest semantics. Fall back consistently to HTML when exact images are unavailable.
4. AC-1/4/6: Add offline gallery and CLI recipes; update Design/visual-offer guidance for gallery and native chat delivery without claiming unsupported host capability.
5. AC-3/5/6: Verify stale/tampered/missing/custom/localized inputs, keyboard disclosure and selection, responsive layout, zero network, binary mirrors and independent read-only audit. Capture new sanitized evidence; no commit, push, merge or publish.

Self-review: default thumbnails are illustrative examples, not final project designs. Customized content requires a matching capture; a filename alone is never delivered imagery. Derived assets cannot authorize execution.

Test integration continuation: package.json test scripts may register the new focused tests in existing repository/design suites. Dependency, version, release and lockfile fields remain unchanged. This is necessary verification within the delegated feature scope.
