# Data Completeness and Hardcoded Assumptions

Load for changed queries, dropdowns, exports, totals, batch actions, or claims to
load all records. Read the caller and server contract, not just the numeric literal.

1. Classify the consumer: one visible page, bounded preview, searchable lookup,
   complete export, aggregate, or bulk mutation. Find the requirement or UI claim.
2. Trace literal, named constant, config default and SDK default through request,
   server clamp/filter/order, response metadata, continuation and consumer.
3. A pageSize of 1000 is not evidence of completeness. A constant named ALL_LIMIT
   is still a cap. Check effective server maximum, total accuracy, hasMore/cursor,
   stable ordering and tie-breakers, duplicate/missing records during updates,
   cancellation, retry and errors on later pages. Do not treat a short page as EOF
   unless the server contract guarantees that interpretation.
4. Derive the effective cap N, then report the trigger and effect at N+1 rows:
   the final record disappears from the picker/export/batch action. Distinguish data loss or
   authorization consequences from a documented top-N preview. Bound severity by
   actual use and contract; do not label every number dangerous.
5. Choose a repair suited to the consumer: server-side search/paging for a picker,
   continuation with termination/error handling for an allowed complete fetch,
   or server export/aggregate/batch endpoint. Never recommend merely raising the cap.

Inspect other hardcoded assumptions with the same source-to-impact trace:
permissions/roles, tenant IDs, environment URLs, time zones, currency/locale,
retry/timeout thresholds and fixed enum mappings. Existing configuration does not
prove a value is correct; an accepted domain cap needs an authoritative bound,
enforcement and behavior when exceeded. Preserve approved exceptions.

Evidence must name path/line, consumer claim, effective bound, failure trigger,
impact, rule source/confidence and current test gap. If the server contract is
unavailable, report uncertainty rather than inventing its maximum or completion
semantics. One root cause gets one primary finding with related affected callers.

## Proving cases

Use actual output assertions for 0, 1, N-1, N and N+1 rows at the effective cap N
(for example 999/1000/1001 for N=1000); assert the final ID and exact set/order,
not just request.pageSize. Vary configured and server-enforced caps. Add absent/wrong
total, cursor continuation, later-page failure and cancellation. A mutation that
removes continuation must fail the final-record assertion. A preview that labels
truncation and a genuinely enforced domain cap are negative controls.

Authoring examples: `test/e2e/fixtures/review-behavior/paging.mjs` contains a capped
loader, a continuation collector and an intentional preview. Fixture execution
proves the sample behavior; only a real isolated review proves detection.
