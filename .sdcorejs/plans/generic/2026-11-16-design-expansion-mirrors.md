---
allowed_paths:
  - _refs/design/visual-library/**
  - _refs/design/visual-library.md
  - test/e2e/design-visual-library.test.mjs
  - test/e2e/design-visual-browser.mjs
  - README.md
  - authoring/evals/design-expansion/**
  - codex/skills/_refs/design/**
  - plugin/_refs/design/**
  - .sdcorejs/specs/generic/2026-11-16-design-expansion.md
  - .sdcorejs/plans/generic/2026-11-16-design-expansion.md
  - .claude/_refs/design/**
  - .sdcorejs/plans/generic/2026-11-16-design-expansion-mirrors.md
approval_instruction: User requested more templates from UI UX Pro Max and asked
  to include Meta Astryx, retaining the previously selected business-first
  emphasis.
approval_source: delegated-session-scope
approved_at: 2026-11-16T10:04:48.073Z
approved_by: null
approved_spec_hash: sha256:v1:e5a6815094eb90df059827dd8249554d8fb6c88fe653b12843660ebfb79ae47e
artifact_id: plan-design-expansion-mirrors-20261116
artifact_kind: plan
change_ref: design-expansion-20261116
commit_policy: with-change
contract_id: design-expansion-20261116
document_review_performed: false
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
owner: sdcorejs-plan
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:e5a6815094eb90df059827dd8249554d8fb6c88fe653b12843660ebfb79ae47e
    artifact_id: spec-design-expansion-20261116
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: 9af8f5842d0a142b301eec4e05ca99efbf56201c
parent_repository_id: null
prohibited_paths:
  - .github/workflows/**
  - scripts/release.mjs
  - package-lock.json
  - authoring/evals/design-visual-library/**
  - authoring/evals/design-visual-polish/**
repository_relative_path: .sdcorejs/plans/generic/2026-11-16-design-expansion-mirrors.md
requirement_id: R-DESIGN-LIBRARY
schema_version: 1
source_revision: 9af8f5842d0a142b301eec4e05ca99efbf56201c
stack_profile: node-general
supersedes: plan-design-expansion-20261116
track: general
approval_hash: sha256:v1:70907998f8c4e1429c5ec78e71b659e525ae1984cf157445ba4e0d3c82e89fc4
---

# Visual library implementation plan

Execute sequentially on codex/design-library-expansion from 9af8f58 with the generic Node harness. The initial working tree is clean. The publish branch and main remain untouched. Independent audit is read-only; the integration owner repairs findings.

1. AC-1/3: Capture prerequisites, upstream sources and clean baseline; pin exact source bytes. Record new task lookup/rendering failures before implementation.
2. AC-1/2/4: Add ten records, task-specific samples and bounded board groups. Render distinct layouts with escaped text, existing tokens and no external assets. Preserve compatibility with old payloads that omit groups.
3. AC-2/4/5: Add six paired examples; exercise state/viewport controls, local search, keyboard FAQ and input validation. Verify no HTTP requests or page errors and no overflow at 375/768/1440 and 200% text.
4. AC-3/5: Update source/licensing and count/discovery docs; generate mirrors. Store new change-scoped source manifest and command receipts without rewriting old evaluations.
5. AC-1..5: Run design-library/browser, UIUX, authoring, hygiene/reference checks; fresh independent review and available NVIDIA static checks. Repair/retest affected inputs. No live benchmark, Git commit/push/merge, release or publication is claimed.

Self-review: counts reflect actual layouts; recommendations are not templates. Review/messaging upstream templates marked not ready remain structural references only. The library never imports upstream executable code or implies framework compatibility. Full assistive technology and production integration remain outside these illustrative previews.

Mirror path continuation: the existing sync command also writes `.claude/_refs/design/**`. This path is part of the already-authorized generated mirrors; enumerate it explicitly alongside plugin and Codex mirrors. No additional behavior or external action is authorized.
