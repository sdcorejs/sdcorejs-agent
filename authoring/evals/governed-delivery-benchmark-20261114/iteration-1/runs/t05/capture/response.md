Updated `docs/operator-guide.md`, preserving all existing prose verbatim, and added `.sdcorejs/documentation/technical-docs/order-cancellation/order-cancellation.md`.

The guide explains operator-only draft eligibility and blocked submitted orders. It explicitly states that cancellation cannot currently be completed: the application has only an eligibility predicate, with no cancellation endpoint or UI. Notifications remain an unapproved, unimplemented proposal.

Coverage is **partial: 1 approved requirement, 0 met, 1 partial, 0 missing**. Proposed and superseded criteria are excluded.

Verification passed: 2 existing cancellation tests, 8 supplemental predicate checks, original-prose preservation, all 10 local links, documentation metadata, and `git diff --check`. Source, tests, dependencies, and inputs are unchanged. The quantity unit tests and HTTP test were not run; they do not cover cancellation, and the HTTP test requires networking prohibited by this task. No browser or cancellation end-to-end coverage is claimed.

Command output and the execution trace are in this capture directory, including `trace.json` and `commands.jsonl`.
