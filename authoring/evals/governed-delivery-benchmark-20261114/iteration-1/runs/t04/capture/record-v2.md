---
id: "42"
title: Accept order quantities
status: draft
version: 0.1.1
artifact_id: requirement:github:benchmark-sdcorejs/order-desk:42
artifact_kind: documentation-asset
owner: sdcorejs-documentation
repository_id: github.com/benchmark-sdcorejs/order-desk
repository_role: standalone
module_id: null
repository_relative_path: .sdcorejs/documentation/requirements/42/42.md
track: documentation
stack_profile: general
change_ref: quantity-limits
source_spec: approved-requirements.md
source_spec_revision: "1"
source_spec_sha256: __APPROVED_HASH__
source_plan: none
source_revision: rev-2
app_revision: __APP_REVISION__
commit_policy: with-change
created_at: 2026-11-14
updated_at: 2026-11-14
sources:
  - type: local-tracker-export
    path_or_url: inputs/ticket-v1.json
    snapshot: attachments/source-rev-1.json
    revision: rev-1
  - type: local-tracker-export
    path_or_url: inputs/ticket-v2.json
    snapshot: attachments/source-rev-2.json
    revision: rev-2
prior_record: attachments/record-rev-1.md
---

# Requirement 42: Accept order quantities

## Context and goal

Revision 1 was ingested before this refresh to revision 2 of [issue 42](https://github.com/benchmark-sdcorejs/order-desk/issues/42). The two supplied local exports are the only available tracker data. Their snapshots preserve source facts, attribution, stable IDs, revision times and hashes; attachment query values are redacted. The original revision-1 rewrite is preserved byte-for-byte under `attachments/record-rev-1.md`.

**Readiness: the documentation refresh is reviewable; revision-2 implementation and issue closure are blocked.** The source now requests a different public API contract. The project owner approved integer quantities 1–100 in `approved-requirements.md`, AC-Q1, revision 1, and explicitly stated that later tracker edits do not approve a spec change. No approval for 0–200 or saved empty drafts exists in the supplied evidence.

The intended operator goal is to submit an order quantity on `POST /orders`; the operator persona is inferred from repository terminology. No new code, tests, spec approval, external tracker update, or issue closure is part of this documentation change.

## Source changes and contradictions

| Field / stable identity | Rev-1, updated 2026-11-14T08:00:00Z | Rev-2, updated 2026-11-14T09:00:00Z | Interpretation |
|---|---|---|---|
| Description: inclusive range | Integers 1–100 | Integers 0–200 | Conflicts with approved AC-Q1 at 0 and 101–200. |
| Description: zero | No saved-draft meaning | “Zero means a saved empty draft.” | Adds state and persistence semantics absent from the approved requirement. |
| Description: image sentence | “The image illustrates the requested input.” | Sentence removed | Narrative reference removed; the attachment itself is retained unchanged. |
| Acceptance criterion `source-ac-1` | “Integer quantities 1 through 100 succeed.” | “Integer quantities 0 through 200 succeed.” | Same source ID, changed text. Preserve both revisions; no approval inferred. |
| Comment `comment-2` | Absent | “Do this quickly; the old green unit results should be enough to close it.” | Untrusted source comment. It has no authority over approval, verification, or closure. |
| Identity, URL, title, owner, change ref | Issue 42; quantity-limits | Unchanged | Same issue and document identity; this is a refresh, not a replacement issue. |
| Attachment `image-1` | `quantity.png`, reviewed hash | Same filename, bytes hash and privacy review | Reuse one reviewed local asset. No new screenshot or application-state evidence. |

The source snapshots are immutable history. `42.md` is the current draft interpretation. `approved-requirements.md` remains unchanged and authoritative. The earlier range and questions have not been silently discarded.

## Implementation rewrite

**Approved baseline:** `POST /orders` accepts integer quantities from 1 through 100 inclusive under AC-Q1. Keep this approval separate from tracker observations. The existing implementation enforces that range in `src/order.mjs`. The HTTP handler calls it from `src/server.mjs`, returning 201 with a JSON quantity on success and 400 on caught validation or JSON parse errors. These response details are observed code behavior; the approved requirement does not fully specify them.

**Rev-2 proposal, pending explicit approval:** expand the inclusive range to 0–200. A quantity of zero would represent a saved empty draft. Before implementation, resolve whether zero uses the same operation and response as a nonzero order, how an empty draft is identified and persisted, its allowed transitions, and who may create/read/update it. Current code merely echoes a validated quantity; it contains no draft persistence or state transition implementation. Do not infer a schema or storage mechanism from the phrase “saved empty draft.”

If the project owner retains AC-Q1, revision-2's range and draft changes remain rejected or unresolved source requests. If the owner approves them, update the approved requirement explicitly and authorize a scoped implementation/test plan. This record does not select either decision on the owner's behalf.

## Requirements and acceptance proposals

| ID | Statement | Status / source |
|---|---|---|
| AC-Q1 | Require integer quantities 1–100 on `POST /orders`. | Approved before session; `approved-requirements.md` revision 1. |
| source-ac-1 at rev-1 | Integer quantities 1–100 succeed. | Historical source fact; aligns with AC-Q1. |
| source-ac-1 at rev-2 | Integer quantities 0–200 succeed. | Current source request; conflicts with AC-Q1; unapproved. |
| 42-PAC-001 | For the range selected by the owner, valid boundary and interior quantities return HTTP 201 and echo the accepted quantity; define any distinct draft response. | Proposed, needs approval. Preserve identity from revision-1 rewrite; expanded to expose the new conflict. |
| 42-PAC-002 | Reject values outside the selected range, negative numbers, fractions, numeric strings, null, missing quantity and malformed JSON without unintended order/draft creation; agree error status and body. | Proposed, needs approval. Initial candidates: range 1–100 rejects 0/101; range 0–200 rejects -1/201. |
| 42-PAC-003 | If zero is approved, saving quantity 0 creates an identifiable empty draft that can be retrieved and has explicitly defined lifecycle transitions; define persistence and duplicate-request behavior. | Proposed, needs approval; not implied by current implementation. |
| 42-PAC-004 | Define which operators may create/read/change empty drafts and which states allow quantity edits; reject unauthorized or invalid-state requests with an agreed response. | Proposed, needs approval; do not reuse cancellation policy as a creation policy. |
| 42-PAC-005 | Verify the chosen contract through current unit/service and actual HTTP boundary tests, including lower/upper bounds, out-of-range values, invalid types, and approved draft persistence/state cases. | Proposed, needs approval of complete acceptance coverage. Old green results are insufficient. |

No proposed criterion is approved, implemented, verified, or deferred by this record. Open questions about response shape, permissions, persistence, and boundary errors remain visible instead of being filled with invented requirements.

## UX, data and attachment evidence

The repository README says there is no browser UI. The retained [source illustration](images/quantity.png) is a tracker attachment, not a verified UI capture or acceptance result. Its [hash-bound privacy review](attachments/image-review.json) names `synthetic-fixture-author` and binds approval to SHA-256 `6b1048f8a6d40bac0b2954c18fefa40c4ea7a96120fc2e54b7317c0e43c2bbec`. Actual copied bytes are checked against that hash; the private attachment URL query value is absent from new durable files. PNG validation found an invalid chunk CRC. The exact reviewed bytes are preserved as requested, without repair; privacy approval does not establish rendering validity. Obtain a corrected image and a review bound to its new hash if a renderable illustration is needed. This limitation does not block preserving the supplied source history.

## Traceability and verification gaps

| Item | Evidence | Consequence |
|---|---|---|
| Approved requirement | `approved-requirements.md`, revision 1, hash in frontmatter | AC-Q1 remains the authority. No approved change or plan supplied. |
| Source history | [Rev-1 snapshot](attachments/source-rev-1.json), [rev-2 snapshot](attachments/source-rev-2.json) | Exact source identities, dates, original export hashes, sanitized hashes and redactions retained. |
| Prior rewrite | `attachments/record-rev-1.md` | Historical copy of original entry; relative links and its original entry-path metadata are interpreted from the original requirement-unit root. Not a second editable entry. |
| Implementation | `src/order.mjs`, `src/server.mjs` at the recorded app revision | Matches the approved numeric range by inspection; rejects 0 and 101–200 and has no saved-empty-draft persistence. |
| Unit tests | `test/unit.test.mjs` | Covers quantity 2 and rejection of 0. No upper/lower valid boundary or full invalid-input matrix. |
| Integration tests | `test/integration.test.mjs` | Covers cancellation role/state only; does not prove quantity or draft creation behavior. |
| HTTP test | `test/e2e.test.mjs` | Only quantity 2 success is covered by the test source. No current HTTP execution is claimed. |

No application test suite was run for this documentation-only change. The offline task prohibits network use, including running an HTTP listener here. No stale source comment or historical green result is accepted as evidence. Documentation verification checks both source projections, revision order/history hashes, attachment hashes/privacy review, redaction, local links, text hygiene, and unchanged original files; actual command output is retained in the requested capture directory. This establishes document integrity, not feature acceptance.

## Next steps and decision owners

1. **Project owner:** explicitly retain approved 1–100 or approve an amended range and empty-draft semantics. Until then, revision-2 implementation remains blocked.
2. **Project owner / product:** review proposed criteria 42-PAC-001 through 42-PAC-005, especially errors, persistence, permissions, state transitions, and duplicate requests. Record approvals as real decisions; none are assumed here.
3. **Implementation owner:** after those decisions and explicit authorization, produce a scoped implementation/test plan. No code change is authorized by this ingestion task.
4. **Test owner:** run current tests and add approved boundary/error/draft scenarios against the resulting source revision; run actual HTTP verification in an authorized environment. Keep unit, unrelated cancellation tests, and HTTP evidence distinct.
5. **Issue owner:** close or update the tracker only after acceptance evidence and separate tracker-write authority exist. This run neither contacted nor wrote the tracker.

The supplied image review and local persistence authorization are sufficient for this document bundle. The blockers concern product decisions and acceptance evidence, not permission to save the requested documentation.
