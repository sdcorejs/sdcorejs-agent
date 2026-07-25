# NestJS API End-to-End Testing

Use for `sdcorejs-nestjs` only when its conventions are detected. For
`plain-nestjs`, use `_refs/shared/test-generic.md`. Always apply
`_refs/shared/test-environment-guard.md`.

## Scope

Select API e2e cases from acceptance criteria and public contract risk when
applicable: validation, response shape, error mapping, authentication,
authorization, tenant isolation, transaction behavior, pagination, or external
side effects. Do not infer endpoints or operations from framework conventions.

## Setup

Reuse the existing application bootstrap, HTTP client, auth fixture, database
helper, migration, and teardown. Real permission behavior is required for
authorization evidence; do not replace it with a mocked guard. Test personas
use credential or token key references without persisting values.

State-changing tests require run-owned records and idempotent cleanup.
Production remains read-only; unknown or unsafe environments block execution.
Use sandboxed email, SMS, payment, queue, or webhook infrastructure only when
already provided and required.

## Execution and evidence

Run the discovered API e2e command in the owning workspace. Record current diff,
config, environment class, persona IDs, case results, cleanup, and redacted
failure excerpts in v2 context/status/evidence. Preserve existing thresholds;
do not create a numeric coverage requirement.
