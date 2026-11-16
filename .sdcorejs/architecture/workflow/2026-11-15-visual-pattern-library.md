---
approval_source: delegated-session-scope
approved_at: 2026-11-15T10:04:20.836Z
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
artifact_id: architecture-visual-pattern-library-r1
artifact_kind: architecture
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
owner: sdcorejs-architecture
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references:
  - approval_hash: sha256:v1:cd983c02bcf651bf36a77998c184e4a6280fd8361de6afd84ea7d6e2a9fdf82b
    artifact_id: spec-visual-pattern-library-r1
    artifact_kind: spec
    repository_id: github.com/sdcorejs/sdcorejs-agent
    revision: a71251fc03890326af14afd496d5955cc30ccc20
parent_repository_id: null
repository_relative_path: .sdcorejs/architecture/workflow/2026-11-15-visual-pattern-library.md
requirement_id: R-001
schema_version: 1
source_plan: none
source_revision: a71251fc03890326af14afd496d5955cc30ccc20
source_spec: .sdcorejs/specs/workflow/2026-11-15-visual-pattern-library.md
stack_profile: markdown-skill-pack
supersedes: null
track: workflow
approval_hash: sha256:v1:0c3b059a8ca79440f8ac8864f1ff9d4be65531fe81913e7d382781a41c6b4771
---
# Visual pattern library — approved architecture

## Decisions and invariants
- D-001 / INV-001: Separate pinned source evidence, compact catalog and task-loaded records from trusted renderer code. Data cannot execute instructions, arbitrary markup, JavaScript or network requests.
- D-002 / INV-002: Keep one Visual Companion screen owner. Schema v1 remains valid; schema v2 admits typed pattern previews and checks library revision. Static and live use the same rendering primitives.
- D-003 / INV-003: Option selection controls stay outside interactive preview controls. Fixed local script supplies viewport, state, tabs and steps. Selected screen/content hashes are checked before handoff.
- D-004 / INV-004: Existing tokens and exact installed component versions take precedence. Upstream source mappings are references, not proof of installed compatibility; Portal/Core conflicts are explicit.
- D-005 / INV-005: Conversation remains approval authority. Preserve existing invitation, decline and live-runtime scopes. No new server, provider dependency or consumer checkpoint.
- D-006 / INV-006: Design owns editable artifacts; executors own production code. Source repos remain read-only and canonical public sources alone feed mirrors.

## Boundaries
Catalog -> bounded selection -> validated typed preview -> shared static/live renderer -> content-bound selection -> Design handoff. The renderer is responsible for markup, CSS and fixed local interactions; authored values remain text or bounded token values.

## State ownership
Transient selection/viewport/example state stays in the preview/session. Approved selections enter the existing Design decision/spec bundle through its resolver. No browser feedback is implementation approval.

## Validation obligations
Prove escaping, malformed/unknown IDs, stale revisions, token conflicts, wrong surfaces, keyboard behavior, no network, responsive rendering, selected artifact identity, mirror path resolution and source-license provenance. Run available browser and independent review checks; keep static and model-backed evidence distinct.
