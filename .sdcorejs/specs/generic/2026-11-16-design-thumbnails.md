---
approval_instruction: User requested thumbnail capability so consumers can
  understand UI layouts while choosing, and explicitly selected both gallery and
  in-chat display.
approval_source: delegated-session-scope
approved_at: 2026-11-16T10:27:04.321Z
approved_by: null
artifact_id: spec-design-thumbnails-20261116
artifact_kind: spec
change_ref: design-thumbnails-20261116
commit_policy: with-change
contract_id: design-thumbnails-20261116
document_review_performed: false
execution_host_repository_id: github.com/sdcorejs/sdcorejs-agent
owner: sdcorejs-spec
owner_module_id: null
owner_repository_id: github.com/sdcorejs/sdcorejs-agent
owner_repository_role: standalone
parent_references: []
parent_repository_id: null
repository_relative_path: .sdcorejs/specs/generic/2026-11-16-design-thumbnails.md
requirement_id: R-DESIGN-THUMBNAILS
schema_version: 1
source_revision: 9af8f5842d0a142b301eec4e05ca99efbf56201c
stack_profile: node-general
supersedes: null
track: general
approval_hash: sha256:v1:8d276eee82b625b374c105c49b9436c0ac0179739c68988c605a1712065516b2
---

# Thumbnails for visual selection

Delegated implementation scope, not a claim that the user reviewed this document. Preserve all uncommitted design expansion work and historical reports.

- AC-1: Ship real rendered PNG thumbnails for all 42 default variants and a browsable offline gallery with clear pattern/variant labels.
- AC-2: Thumbnail comparison mode shows compact visual option cards, opens the full editable preview, and keeps selection as design feedback. Existing full-preview mode remains supported.
- AC-3: Each thumbnail binds exact HTML, PNG bytes, library revision, pattern/variant and viewport. Changed content/theme/locale or corrupted/stale assets must not display an unrelated image. Fall back to the real HTML.
- AC-4: Provide optional browser capture for customized project previews and PNG paths for native in-chat display. Consumers without a browser can use shipped thumbnails/HTML; no runtime dependency or install requirement is added. Chat hosts without image support get an explicit HTML/text fallback.
- AC-5: Closed local PNG intake, bounded bytes/dimensions, fixed CSP, no network or arbitrary HTML execution, isolated output writes, accessible/localized controls and unchanged approval gates.
- AC-6: Source guidance activates thumbnails during useful accepted UI choices, not fixed/declined designs. Focused/browser regression, binary mirror checks and independent review bind the final inputs.

Architecture: reuse the existing static/live renderer and feedback contract. Derived thumbnail assets are validated separately and excluded from the library source revision to avoid self-referential hashes. No new service, public skill, provider calls or production UI dependency.
