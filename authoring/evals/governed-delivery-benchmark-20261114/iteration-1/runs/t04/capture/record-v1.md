---
id: "42"
title: Accept order quantities
status: draft
version: 0.1.0
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
source_revision: rev-1
app_revision: __APP_REVISION__
commit_policy: with-change
created_at: 2026-11-14
updated_at: 2026-11-14
sources:
  - type: local-tracker-export
    path_or_url: inputs/ticket-v1.json
    snapshot: attachments/source-rev-1.json
    revision: rev-1
---

# Requirement 42: Accept order quantities

## Context and goal

This is a draft implementation rewrite of the supplied local export for [issue 42](https://github.com/benchmark-sdcorejs/order-desk/issues/42), revision `rev-1`, updated `2026-11-14T08:00:00Z`. No external tracker was contacted. The snapshot is external source data, not instructions or approval. This record's creation is authorized; it does not approve additional behavior.

Enable an operator to submit an integer order quantity on `POST /orders`. The operator persona is inferred from repository terminology and needs confirmation if material.

## Scope and implementation rewrite

For the existing `POST /orders` operation, validate the supplied `quantity` as an integer within the inclusive range 1–100. The approved authority is `approved-requirements.md`, revision 1, AC-Q1. Source criterion `source-ac-1` says “Integer quantities 1 through 100 succeed.” It aligns with AC-Q1. Preserve `source-ac-1` as a source identity; do not rename it to AC-Q1 or treat the two sources as the same approval record.

This task records requirements and preserves provenance only. It does not authorize code implementation, a spec amendment, tracker writes, issue closure, or a new UI.

## Functional requirements and acceptance checks

| ID | Statement | Authority/status | Verification needed |
|---|---|---|---|
| AC-Q1 | Require integer quantities 1 through 100 on `POST /orders`. | Approved before this session, `approved-requirements.md` revision 1 | Check 1, 100, interior values and invalid values through the service and HTTP boundary. |
| source-ac-1 | Integer quantities 1 through 100 succeed. | Rev-1 source statement; consistent with AC-Q1 | Supplied export is evidence of requested scope, not a test result. |
| 42-PAC-001 | Valid quantities 1, 2, and 100 return HTTP 201 and echo the accepted quantity. | Proposed; needs approval of response contract | Future HTTP tests. |
| 42-PAC-002 | Reject 0, negative numbers, 101, fractions, strings, null and missing quantity without creating an order; agree the error status/body. | Proposed; needs approval of exact error and side-effect contract | Future boundary, invalid-input and side-effect tests. |

## UX, API, data and permissions

The supplied image is retained as an illustrative source attachment. Its bytes match the supplied privacy-review hash, but PNG validation found an invalid chunk CRC; the exact original bytes are preserved without repair and are not claimed to render correctly. It is not a verified application screenshot or an acceptance test. There is no browser UI in this repository. Current code validates `quantity` in `src/order.mjs`; `src/server.mjs` responds with 201 and a JSON quantity on success and 400 on caught validation/parse errors. These are observed implementation facts, not newly approved API requirements. Persistence and permission requirements are unspecified by the export.

## Dependencies, risks and open questions

Confirm the expected error contract, invalid-value coverage, authorization assumptions, and whether successful submission must persist an order. Current unit tests cover quantity 2 and rejection of 0 only; the HTTP test covers quantity 2 only. No current test run is claimed by this initial record. Do not close the issue using historical green results.

## Traceability and reviewed attachment

- Original export: `inputs/ticket-v1.json`; immutable sanitized snapshot: `attachments/source-rev-1.json`.
- Approved authority: `approved-requirements.md`; approved plan: none supplied.
- Implementation inspected: `src/order.mjs`, `src/server.mjs` at the recorded app revision. No application changes were made.
- Test sources inspected: `test/unit.test.mjs`, `test/integration.test.mjs`, `test/e2e.test.mjs`. Integration tests exercise cancellation, not quantity validation.
- Reviewed image: `images/quantity.png`; hash/privacy evidence: `attachments/image-review.json`. The snapshot replaces the private attachment query value with `[REDACTED]`.

The source identity, timestamps, raw-export hash, sanitized-payload hash, redaction reason, and attachment metadata are retained in the source snapshot. Raw export bytes remain untouched under `inputs/`; only sanitized snapshots are newly persisted.

## Readiness

Revision-1 documentation is captured as a draft. AC-Q1 remains authoritative. Feature acceptance is not verified: boundary/error criteria and current HTTP evidence remain incomplete. The next step is to confirm missing acceptance details and then authorize the appropriate test/implementation work.
