# NestJS Performance Review

Review is read-only and must not run load tests against shared environments
without explicit approval.

## Database

Inspect paging bounds, tenant-leading indexes, uniqueness indexes, query plans,
N+1 access, transaction duration, lock order, and retry behavior. Verify scoped
predicates cannot be dropped from optimized/report queries.

## Request and memory bounds

Check global body limits, action-specific row/byte limits, streaming backpressure,
and asynchronous export thresholds. Flag whole-dataset reads, unbounded workbook
buffers, unbounded concurrency, and large raw error payloads.

## External systems

Review Keycloak timeout, retry, idempotency, circuit behavior, and reconciliation
load. Cache internal client UUIDs only within an appropriate bounded lifetime.

## Evidence

Use focused local probes when safe. Report command, cwd, result identity, exit
code, and environment limitations. Do not turn estimates into measured claims.
