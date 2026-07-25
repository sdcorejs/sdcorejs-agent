# Test Data Lifecycle

## Contents

- [Environment policy](#environment-policy)
- [Ownership contract](#ownership-contract)
- [Setup and cleanup](#setup-and-cleanup)
- [External effects](#external-effects)
- [Evidence](#evidence)

## Environment policy

Use an existing test database, fixture system, API factory, seed helper, or
isolated tenant when the project already provides one. Production is read-only.
Staging is read-only unless the current request explicitly approves an isolated
write policy and the project provides safe ownership/cleanup boundaries.
Unknown environments block state-changing tests.

## Ownership contract

```yaml
data:
  strategy: existing-helper # existing-helper | test-database | isolated-tenant | read-only
  run_id: run-20260724-001
  records_owned_by_run: [order:e2e-run-20260724-001]
  ownership_filter: created_by_run_id=e2e-run-20260724-001
  cleanup_required: true
  cleanup_status: pending
```

Every state-changing test has a unique run ID and an `ownership_filter`.
`records_owned_by_run` contains only objects created for that run. Never delete
or mutate records merely because they resemble fixture data.

## Setup and cleanup

Setup and cleanup must be idempotent. Re-running cleanup must be safe. Cleanup
targets only records proven to be owned by the run and should execute in a
`finally`/teardown path. A cleanup failure is a test evidence failure: record it,
stop promotion of the run, and provide the smallest safe recovery instruction.

Do not introduce a universal seed/reset tool. Reuse project helpers. If none
exists, prefer API-level creation with traceable IDs or a read-only scenario;
request approval before adding shared infrastructure.

## External effects

Email, SMS, payment, webhook, notification, queue, and third-party calls need an
explicit sandbox, test double already supported by the project, or read-only
assertion. Never send real messages or charges as an incidental test effect.
Verify idempotency and retry behavior only when the requirement or observed risk
calls for it. Use unique idempotency keys owned by the run.

## Evidence

Record strategy, ownership filter, created identifiers in redacted form,
cleanup outcome, and any skipped external assertion. Do not persist database
dumps, customer data, raw email bodies, payment tokens, or personal information.
