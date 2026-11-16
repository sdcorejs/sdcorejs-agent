---
artifact_id: order-cancellation-technical-reference
artifact_kind: documentation-asset
change_ref: documentation-ac-cancel-1
source_spec: none
source_plan: none
commit_policy: with-change
owner: sdcorejs-documentation
repository_id: github.com/benchmark-sdcorejs/order-desk
repository_role: standalone
tracks: [documentation]
stack_profiles: [node-esm]
generated_at: 2026-11-14T09:07:26.329Z
git_head: 020550e501e0bb6ba91da9accae65e8238c9432e
source_revision: 020550e501e0bb6ba91da9accae65e8238c9432e
app_revision: 020550e501e0bb6ba91da9accae65e8238c9432e
approved_source: explicit-user-task-AC-CANCEL-1
requirement_ids: [AC-CANCEL-1]
guide_path: docs/operator-guide.md
coverage:
  total: 1
  met: 0
  partial: 1
  missing: 0
---

# Order cancellation: implementation and limits

This companion supports the [operator guide](../../../../docs/operator-guide.md).
The approved cancellation policy is implemented as an eligibility predicate.
There is no executable cancellation workflow in the inspected application.

## Permission and state contract

In [src/order.mjs](../../../../src/order.mjs), `canCancel(role, state)` returns
`true` only when `role === 'operator'` and `state === 'draft'`. All other inputs
return `false`, including an operator with a submitted order and an administrator
with either a draft or submitted order. The predicate uses exact string equality;
it does not authenticate a caller, load an order, change its state, or send a
notification. No separate permission code is defined.

The existing [cancellation tests](../../../../test/integration.test.mjs) directly
call this predicate for an operator with a draft and an operator with a submitted
order. Although the package names the command `test:integration`, these tests
verify a function, not an HTTP cancellation or a persisted state transition.

## Entry points and missing workflow

[src/server.mjs](../../../../src/server.mjs) imports only `quantity` from the
order module. `makeServer()` handles only `POST /orders`: it parses JSON,
validates the quantity, and returns `201` with `{quantity: value}` or `400` on
parsing or validation errors. Other method/path combinations return `404`.
This handler does not invoke `canCancel`, authenticate roles, store an order, or
perform cancellation. It must not be described as a cancellation API.

The [README](../../../../README.md) confirms that no browser UI exists.
There are therefore no verified cancellation controls, navigation steps, or
screenshots to document. No screenshot capture is applicable.

The application uses Node ESM and built-in modules without external dependencies;
[package.json](../../../../package.json) requires Node 24 or later.

## Approved requirement coverage

The user's explicit approval is the authority for AC-CANCEL-1. The
[product draft](../../../../inputs/product-draft.md) is supporting source data,
not a source of permission to implement proposals or revive superseded rules.

| Requirement | Documentation | Implementation and verification | Overall status |
| --- | --- | --- | --- |
| AC-CANCEL-1: only an operator can cancel a draft; submitted orders cannot be cancelled | The operator guide explains role eligibility, the submitted-state block, and the unavailable action. | Eligibility predicate exists; two existing tests cover operator/draft and operator/submitted. No cancellation endpoint, UI, or state transition exists. | Partial |

Counts include one approved requirement: 0 met, 1 partial, 0 missing. This is
requirement coverage, not code coverage. AC-NOTIFY-2 is proposed, unapproved,
and unimplemented, so it is excluded. AC-OLD-3 is superseded and excluded;
administrators have no exception for submitted orders.

## Verification and remaining gaps

On Node `v24.22.1`, `node --test test/integration.test.mjs` passed both existing
tests. This is the underlying command for `npm run test:integration`.
Eight supplemental direct predicate assertions also passed, including denied
administrator/viewer roles and absent role/state inputs. Those checks were
captured outside the application and do not add persistent regression coverage.

The existing [unit tests](../../../../test/unit.test.mjs) concern quantity.
The existing [HTTP test](../../../../test/e2e.test.mjs) exercises `POST /orders`
with a valid quantity; it provides no cancellation coverage. Neither was run
for this documentation-only change. The HTTP test also requires a local network
listener, excluded by this offline task. No browser or cancellation end-to-end
test was run, and no cancellation success is claimed.

Persistent tests do not cover non-operator cancellation rejection. Future
workflow work would also need to define and verify the actual cancellation
entry point, authenticated actor, and resulting order state. Those are open
implementation gaps, not changes authorized by this documentation task.
