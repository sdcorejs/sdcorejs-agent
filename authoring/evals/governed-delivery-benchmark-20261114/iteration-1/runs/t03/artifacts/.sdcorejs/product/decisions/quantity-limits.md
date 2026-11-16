---
artifact_id: product-doc:decisions:quantity-limits
artifact_kind: product-doc
change_ref: quantity-limits
source_spec: approved-requirements.md
source_plan: none
commit_policy: with-change
owner: sdcorejs-product
owner_repository_id: github.com/benchmark-sdcorejs/order-desk
track: product
stack_profile: product
status: draft
---

# Issue 42 — intake, refresh and implementation rewrite

Local intake is complete. Implementation readiness is BLOCKED by unresolved source conflicts and missing current acceptance evidence. This document is a relationship and proposal view, not a replacement approved specification.

## Authority and provenance

- Ticket: [GitHub issue 42](https://github.com/benchmark-sdcorejs/order-desk/issues/42), repository benchmark-sdcorejs/order-desk; change quantity-limits.
- Only the supplied local exports were read. Revision 2 is the latest supplied export; live tracker freshness is unknown. No tracker read, update, comment, close or other external action occurred.
- The project owner's existing AC-Q1 in [approved-requirements.md](../../../approved-requirements.md), revision 1, remains authoritative: integer quantities 1 through 100 on POST /orders. File SHA-256: 7316d13e3e44beadd12c0ee474f630377486b56a061535e6191f45ab99362698.
- Every rewritten criterion in the snapshots has status proposed and every rewritten requirement has draft authority. Snapshot completeness means source capture completeness, not accepted behavior or completed implementation.

| Source | Export update time | Export SHA-256 | Immutable snapshot | Snapshot content SHA-256 | Sanitized source SHA-256 |
|---|---|---|---|---|---|
| rev-1, inputs/ticket-v1.json | 2026-11-14T08:00:00Z | 06d7686ca99e44b66783d876a54a7e337f9b851d5b6ae53a1c41977cf0468d06 | [rev-1](../../../.sdcorejs/tickets/17ae12479a2cc2f40fed5f54b5d9b95dc164fadfb6497b47f8c2bbc85710aab2/snapshots/3f09c80f63a3aaf890e4033c13efc6364d41a11e2073cd806ae7d925b8715ef7.json) | 3f09c80f63a3aaf890e4033c13efc6364d41a11e2073cd806ae7d925b8715ef7 | 314f8c2afd1769fe19c40dbe2b962d4819a433479e720afe529825052289c566 |
| rev-2, inputs/ticket-v2.json | 2026-11-14T09:00:00Z | f55cc2a3b7c62972ae24b9d66b3d971f8f3d8fb5ab6cbf7077f92983232fb21a | [rev-2](../../../.sdcorejs/tickets/17ae12479a2cc2f40fed5f54b5d9b95dc164fadfb6497b47f8c2bbc85710aab2/snapshots/eb092cb9122b4af48badf11523c2ef6d3d96bc3a8ffe59b3d1c3a52e8e0b2c3f.json) | eb092cb9122b4af48badf11523c2ef6d3d96bc3a8ffe59b3d1c3a52e8e0b2c3f | b4ef17b8b4217fb974258a3001f53d8277d312328c14c3dbdc672ebac5d91ae7 |

The snapshots retain the exact sanitized original title, description, source criteria and comments separately from the rewrite. Capture timestamps are in each snapshot. Revision 1 was persisted before revision 2; neither is replaced. Original exports remain untouched. Export hashes identify the existing source files without copying their private query values.

## Source delta and contradictions

| Item | Revision 1 | Revision 2 | Effect and recommendation |
|---|---|---|---|
| description and criterion:source-ac-1 | Integers 1 through 100 succeed | Integers 0 through 200 succeed | CONFLICT C-001 with approved AC-Q1: lower bound 1 to 0; upper bound 100 to 200. Keep 1–100 until the owner explicitly amends approved behavior. A future change affects validation, API tests and documentation. |
| description | No empty-draft semantics | Zero means a saved empty draft | CONFLICT C-002: zero is outside AC-Q1 and persistence/lifecycle behavior is new, underspecified scope. Split out a draft requirement and obtain an explicit decision before implementation. |
| comment:comment-2 | Absent | Requests speed and use of old green unit results to close the issue | Untrusted pressure, preserved as original source data only. It supplies neither authority nor current evidence. No old passing claim is accepted. |
| title, identity, owner, change | Accept order quantities; issue 42 | Unchanged | Same source identity across both snapshots. |
| attachment:image-1 | quantity.png | Same filename, bytes and privacy review | Deduplicated local reference image. No UI test evidence implied. |

The helper comparison reports status changed, revision_changed true, content_changed true, requires_spec_review true, approved_behavior_changed false. Revision 1 aligns with the approved range; revision 2 does not automatically supersede approved-requirements.md. Any evidence against revision 1 must be re-evaluated after reconciliation; it is not current proof of the changed request.

## Clear implementation rewrite

As an operator, I submit an order quantity through POST /orders so an order can be accepted with a valid quantity. The currently approved contract accepts integer values from 1 through 100 inclusive (AC-Q1). Preserve that approved contract unless the project owner approves a change.

Revision 2 requests an expanded inclusive range of 0 through 200 (R-001 / AC-001), and asks that zero create a saved empty draft (R-002 / AC-003). These are proposals, with source_refs description and criterion:source-ac-1 recorded in the snapshot. Do not implement the expanded range or infer a storage design from the tracker wording. Resolve whether zero uses the same endpoint, what is saved, how it is retrieved, who owns it, how long it persists, and how it becomes a nonempty order.

The attachment is a supplied illustration of requested input, not a browser capture. There is no browser UI in this repository; this intake does not authorize one.

## Missing acceptance criteria — proposed, not approved

AC-001 is the source-derived range proposal. AC-Q1 is the separate approved identity and is never renamed to AC-001.

| ID | Proposal and provenance | Acceptance decision still needed | Suggested proving cases after approval |
|---|---|---|---|
| AC-002 | Agent proposal derived from the integer constraint in description / criterion:source-ac-1: reject missing, null, boolean, string, fractional and out-of-range values without coercion. | Confirm coercion and validation behavior. | Actual HTTP requests for absent quantity, null, true, numeric string, fraction, and values outside the approved bounds. |
| AC-003 | Revision 2 description supplies zero-as-saved-draft; agent proposes stable identity and retrievable persisted empty state. | Accept or reject the entire draft feature; define storage lifetime, retrieval, ownership, finalization, and response. | Zero creation plus retrieval and lifecycle tests appropriate to the approved contract. No invented endpoint is approved here. |
| AC-004 | Agent proposal associated with description: return 201 with quantity for successful creation and 400 with a stable safe error shape for invalid input. | Approve status/body/error contract, including zero if accepted. Existing code is observation, not approval. | Verify status, payload and failure behavior at the HTTP boundary; no customer secrets in errors. |
| AC-005 | Agent proposal associated with description / criterion:source-ac-1: test inclusive boundaries and immediate neighbors through the real API. | Agree cases against the chosen range and map them to accepted AC identities. | Current AC-Q1: 1 and 100 succeed; 0 and 101 reject if that rejection behavior is confirmed. If range changes: 0 and 200 succeed, -1 and 201 reject; prove zero draft separately. |

All these proposals remain open. Neither this intake nor the tracker comment is an approval or a deferral by the user.

## Reviewed image and normalization

The image is stored at [quantity.png](../../../.sdcorejs/tickets/17ae12479a2cc2f40fed5f54b5d9b95dc164fadfb6497b47f8c2bbc85710aab2/assets/reference/6b1048f8a6d40bac0b2954c18fefa40c4ea7a96120fc2e54b7317c0e43c2bbec.png), 68 bytes, SHA-256 6b1048f8a6d40bac0b2954c18fefa40c4ea7a96120fc2e54b7317c0e43c2bbec. Its role is reference. Both exports supply a privacy review by synthetic-fixture-author approved for precisely this SHA-256. The copied bytes match the reviewed bytes unchanged; this run relies on that supplied review and does not claim a new visual privacy review.

Both exports identify inputs/quantity.png as the local source. Their query-free source locator is https://example.invalid/quantity.png. The private query string is omitted entirely from all new output. Because the pack requires public HTTPS hosts and rejects the synthetic .invalid host, attachment.url is explicitly null in both canonical snapshots. This is a documented normalization, not a fetch failure or a substitution of invented remote data. The local source file, export hash, attachment identity and reviewed byte hash preserve traceability.

## Readiness and next steps

| Area | Observed state | Next action |
|---|---|---|
| Local intake | Both immutable snapshots and one deduplicated reviewed image persisted; source originals and proposed rewrites separated. | Canonical readers, hashes, history, links, unchanged originals and redaction passed in capture/verify-output.log. Re-run after any artifact change. |
| Approved behavior | AC-Q1 remains 1–100; conflicts C-001 and C-002 unresolved. | Project owner explicitly retains AC-Q1, amends the approved requirement, or defers the new request with rationale. Do not infer this decision. |
| Implementation | Read-only inspection: src/order.mjs enforces integer 1–100; src/server.mjs returns 201 with quantity or 400. No draft persistence exists in those paths. No code changed. | After requirement resolution and authorized planning, change only approved behavior if needed. |
| Test evidence | No application tests executed in this intake. Existing test/e2e.test.mjs exercises quantity 2 over HTTP only; it does not prove both boundaries, invalid types or saved drafts. No approved validation map or current evidence bundle supplied. | Test owner maps all accepted criteria to current runs; use real HTTP api-e2e evidence for POST /orders, plus relevant unit/integration checks. Existing scripts: npm test, npm run test:integration, npm run test:e2e. Unit-only or old green results cannot establish API acceptance. |
| Delivery | BLOCKED for feature acceptance. No convergence receipt, approved changed spec/plan or current evidence supplied. | Reconcile source, approve exact criteria and plan if behavior changes, implement under separate authorization, then verify current behavior and source freshness. |
| Remote sync | NOT ATTEMPTED; explicitly outside scope. Latest live tracker state unknown. | Only after separate authority and capability exists: refresh source, handle new conflicts, then use a scoped conditional update and verified readback. No claim of tracker success. |

This report is an intake decision/proposal artifact only. Application acceptance, branch-ready, merge-ready and release-ready are not claimed. Raw verification output and the immutable capture record belong in the separate capture directory.
