---
approval_source: delegated-session-scope
approved_at: 2026-11-15T10:04:20.827Z
approved_by: null
architecture_gate:
  blocker_messages: []
  blockers: []
  bypass: null
  rationale: A typed pattern preview extends the shared screen contract and
    carries selection identity across static/live and design handoffs.
  required: true
  signals:
    - public-api-contract
    - security-trust-boundary
    - state-data-ownership
  status: required
  valid: true
artifact_id: spec-visual-pattern-library-r1
artifact_kind: spec
change_ref: visual-pattern-library-20261115
commit_policy: with-change
contract_id: visual-pattern-library-20261115
document_review_performed: false
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
instruction_reference: "User requested business-first visual templates, HTML
  choices, sources from sdcorejs-angular and portal-template; after reviewing
  the concrete planning summary, instructed: begin implementation and then
  independent review (2026-11-15)."
integration_owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner: sdcorejs-spec
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references: []
parent_repository_id: null
repository_relative_path: .sdcorejs/specs/workflow/2026-11-15-visual-pattern-library.md
requirement_id: R-001
schema_version: 1
source_plan: none
source_revision: a71251fc03890326af14afd496d5955cc30ccc20
source_spec: none
stack_profile: markdown-skill-pack
supersedes: null
track: workflow
approval_hash: sha256:v1:cd983c02bcf651bf36a77998c184e4a6280fd8361de6afd84ea7d6e2a9fdf82b
---
# Visual pattern library — approved specification

## Authority
User requested business-first visual templates, HTML choices, sources from sdcorejs-angular and portal-template; after reviewing the concrete planning summary, instructed: begin implementation and then independent review (2026-11-15).
The user approved implementation scope; generated snapshots were self-reviewed, not individually reviewed by the user.

## Requirements
- R-001 / AC-001: Each shipped pattern/theme has pinned provenance, license and explicit adaptation; source conflicts are bounded by consumer version.
- R-002 / AC-002: Select task-compatible patterns without replacing existing tokens, imposing Core on plain stacks or expanding business scope.
- R-003 / AC-003: Render twelve pattern families, six optional themes and six meaningful comparisons as editable HTML at desktop/tablet/mobile sizes.
- R-004 / AC-004: Requested previews have a concrete executable recipe; open material choices receive one scoped offer, with negative controls preserved.
- R-005 / AC-005: Selection is content-bound, survives handoffs and never grants mutation authority; stale choices are rejected.
- R-006 / AC-006: Static/live/native/text fallback preserves content; fixed local interactions escape data and introduce no network action.
- R-007 / AC-007: Persist the selected source only in the semantic owner Design bundle with component mapping and existing artifact closure.
- R-008 / AC-008: Keep 25 public skills, synchronized distributions, current verification and an independent fresh-context review.

## Scope
Eight operational and four website families, shared states/shell, six optional themes. Read pinned source repositories; modify only SDCoreJS Agent. Preserve dirty work and all old evaluation evidence. No new public skill, package dependency, deployment, Git mutation or broad automatic upstream sync.

## Verification
Behavioral TDD, source hashes and notices, real browser tests, natural-language scenarios and independent review. Paid evaluation is separate from the previous unrelated 80-trial audit and needs a bounded run scope; unrun evidence stays NOT RUN.
