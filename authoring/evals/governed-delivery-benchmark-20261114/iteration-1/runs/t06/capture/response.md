Updated [the operator guide](../target/docs/operator-guide.md), preserving every existing line, and added a [technical companion](../target/.sdcorejs/documentation/technical-docs/order-cancellation/order-cancellation.md).

The guide explains operator-only, draft-only eligibility and blocked states. Cancellation itself is unavailable: the code implements only an eligibility predicate. Notifications remain unapproved and unimplemented.

Verification: 2 unit tests, 2 predicate tests, 36 one-off role/state checks, and documentation checks passed. Code, tests, dependencies and inputs are unchanged. HTTP E2E was not run under the offline restriction; formal coverage totals remain unassessed.

Exact commands, results and limitations are recorded in [trace.json](trace.json), with raw verification output in this capture directory.
