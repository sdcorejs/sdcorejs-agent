---
artifact_id: technical-order-cancellation
artifact_kind: documentation-asset
change_ref: operator-cancellation-guide
source_spec: none
source_plan: none
commit_policy: with-change
owner: sdcorejs-documentation
repository_id: github.com/benchmark-sdcorejs/order-desk
repository_role: standalone
repository_relative_path: .sdcorejs/documentation/technical-docs/order-cancellation/order-cancellation.md
source_revision: 020550e501e0bb6ba91da9accae65e8238c9432e
app_revision: 020550e501e0bb6ba91da9accae65e8238c9432e
git_head: 020550e501e0bb6ba91da9accae65e8238c9432e
generated_at: 2026-11-14T09:10:30.507Z
documentation_profile_version: 1
documentation_scope: feature
documentation_audience: maintainer
tracks: [documentation, node]
guide_path: docs/operator-guide.md
source_refs: [src/order.mjs, src/server.mjs, test/integration.test.mjs, test/unit.test.mjs, test/e2e.test.mjs, package.json, README.md, inputs/product-draft.md]
coverage: { status: gap, total: null, met: null, partial: null, missing: null }
---

# Order cancellation: implementation and evidence

The operator guide documents eligibility and the current inability to complete cancellation. The approved documentation behavior comes from the user's task: AC-CANCEL-1 permits only an operator to cancel a draft and blocks submitted orders. External draft labels do not grant approval.

## Implemented contract

In `src/order.mjs:2`, `canCancel(role, state)` returns `role === 'operator' && state === 'draft'`. This exact, case-sensitive comparison returns a boolean. It does not authenticate the caller, look up an order, change state, persist a cancellation, or send a notification. Other role or state values return false, including administrator/draft and operator/submitted.

In `src/server.mjs`, `makeServer()` exposes only `POST /orders`, validates `quantity`, and returns that quantity with HTTP 201 (or HTTP 400 for invalid input). Other methods or URLs return HTTP 404. It imports `quantity`, not `canCancel`. There is no cancellation endpoint, order lookup, authenticated operator workflow, or cancellation state transition. Do not document an invented cancellation URL or an API authorization guarantee.

The README confirms there is no browser UI. Screenshots, button labels, and a browser cancellation sequence therefore do not apply. No dependency or application-code changes are part of this documentation update.

## Permissions and blocked states

| Supplied role | Supplied state | Eligibility result |
|---|---|---|
| operator | draft | true |
| operator | submitted | false |
| administrator | draft or submitted | false |
| any value other than operator | any state | false |
| operator | any value other than draft | false |

These are predicate results, not proof of a protected cancellation API. The guide tells operators to confirm the reference, check eligibility, stop for blocked states, and avoid claiming a completed cancellation. The duty-operator escalation is retained from the original human note and provides no override.

## Requirement provenance and coverage limits

| Identifier | Authority or source | Documented result |
|---|---|---|
| AC-CANCEL-1 | Explicitly approved in the current user task; also mentioned in `inputs/product-draft.md` | Permissions and blocked states are documented. Implementation is partial: the predicate exists, but no complete cancellation workflow exists. |
| AC-NOTIFY-2 | External product draft; explicitly unapproved in the user task | Proposed and unimplemented. Excluded from approved scope and any completion count. |
| AC-OLD-3 | External product draft marks it superseded; it conflicts with the current approved task | Excluded. No administrator or submitted-order exception is documented. |

There is no verified current approved spec snapshot or decision-history identity in this repository. Formal pack coverage remains `gap`, with null totals; no acceptance-completion percentage is claimed. The pack's coverage selector also accepts only numeric IDs matching `AC-000`, so these supplied identifiers cannot be passed through it. They remain unchanged in the documentation; they are not renumbered or promoted into fabricated spec receipts. Direct user approval remains authoritative for this scoped guide update.

## Verification and gaps

Run the repository's existing local service checks with `npm run test:integration`. Despite the script name, its two assertions directly call the predicate: operator/draft is true and operator/submitted is false. It does not test role authentication, persistence, notifications, or a cancellation endpoint. The existing test file has no non-operator denial assertion; a one-off in-process role/state matrix was used for this documentation check without changing tests.

`npm test` checks quantity handling, not cancellation. The existing `npm run test:e2e` test uses actual loopback HTTP and verifies only `POST /orders`. It was not run for this offline task because network use is prohibited; it would not prove cancellation even if it passed. No end-to-end cancellation success is claimed.

Current verification results and exact outputs are recorded in the requested capture directory, outside the repository. Markdown checks cover preservation of all original guide text, local-link targets, UTF-8 hygiene, scoped metadata, and unchanged source/tests/dependencies. A usable cancellation action and its end-to-end verification remain absent and outside this documentation task.
