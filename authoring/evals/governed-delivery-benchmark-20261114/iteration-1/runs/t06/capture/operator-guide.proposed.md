---
documentation_profile_version: 1
documentation_scope: task
documentation_audience: operator
source_revision: 020550e501e0bb6ba91da9accae65e8238c9432e
generated_at: 2026-11-14T09:10:30.507Z
coverage: { status: gap, total: null, met: null, partial: null, missing: null }
---

# Operator guide

Human note: confirm the order reference with the caller before acting.

## Cancelling orders

The cancellation steps have not been documented yet.

Human note: contact the duty operator for urgent exceptions.

### Check whether cancellation is allowed

Only an operator may cancel an order, and only while it is a draft.

1. Confirm the order reference with the caller before acting.
2. Check your role and the order's current state against the table below. If either is unknown, do not assume cancellation is allowed.
3. Use the result to explain whether the request is eligible. This version has no way to complete a cancellation, even for an eligible draft. Do not tell the caller that the order has been cancelled.

| Your role and the order's state | What to do |
|---|---|
| Operator; draft | The request is eligible under the cancellation rule, but cancellation cannot be completed in this version. |
| Operator; submitted | Stop: submitted orders cannot be cancelled. |
| Any role other than operator, including administrator | You cannot cancel the order, even if it is a draft. Refer the request to an operator; the order must still be a draft. |
| Operator; any state other than draft | Cancellation is blocked. |

### When the request cannot proceed

For urgent exceptions, contact the duty operator as noted above. This escalation does not grant permission to cancel a submitted order or override the draft-only rule.

There is no cancellation screen or action in this version, so no button sequence or success confirmation can be provided. An eligibility check does not change the order. Automatic customer notifications are not available; do not promise that a cancellation notification will be sent.

### Scope of this guidance

This guide applies the user-approved AC-CANCEL-1 rule. The rule is present, but a complete cancellation workflow is not implemented or verified. Existing notes above are preserved verbatim.

The notification proposal AC-NOTIFY-2 is not approved or implemented. The superseded AC-OLD-3 statement does not permit administrators to cancel submitted orders.

Formal requirement coverage totals are not assessed because no verified current specification is available. See the [technical companion](../.sdcorejs/documentation/technical-docs/order-cancellation/order-cancellation.md) for the source evidence and verification limits.
