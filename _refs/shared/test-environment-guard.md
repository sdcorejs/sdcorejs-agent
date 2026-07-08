# Test Environment Guard

> Loaded by `sdcorejs-test` before e2e, UAT, integration tests that touch external
> state, or any command that can write outside local test artifacts.

## Environment Classes

Classify the environment before running tests:

| Class | Signals | Policy |
|---|---|---|
| `local` | localhost, local container, local dev server, in-memory DB | Safe for normal test execution when commands are discovered. |
| `mock` | mocked backend, fixture server, local fake services | Safe when the mock data contract is understood. |
| `dev` | shared dev URL or DB | Avoid destructive tests unless test data is isolated and cleanup is approved. |
| `staging` | staging/UAT URL | Read-only smoke tests by default; writes require approved test accounts/data and cleanup. |
| `prod` | production host, production DB, live payment/email/SMS | Block destructive tests. Read-only smoke only when explicitly requested and safe. |
| `unknown` | base URL/env cannot be classified | Block e2e/UAT writes and report missing environment data. |

## Required Inputs For E2E/UAT

Before running browser/API journey tests, establish:

- base URL or local server command from existing config
- actor/role and auth source
- environment class
- test data setup and cleanup
- whether external email/SMS/payment/integration calls are mocked, sandboxed, or live
- artifacts that the runner may create

If any required input is missing, report the blocker instead of guessing.

## Production And Shared-Env Safety

Do not run destructive operations against production:

- create/update/delete records
- cleanup/truncate/reset scripts
- payment, email, SMS, or notification sends
- permission, password, token, or account mutations
- seed or migration commands

For dev/staging, require isolated test data and cleanup proof before writes. Prefer generated test identifiers and idempotent cleanup.

## Secrets And PII

Redact before reporting:

- credentials, tokens, cookies, API keys, authorization headers
- emails, phone numbers, national IDs, customer names, addresses
- database URLs and service endpoints with embedded credentials

Use `[REDACTED]` in evidence snippets.

## Artifact Policy

Do not commit by default:

- reports
- videos
- screenshots
- traces
- coverage HTML
- raw runner logs
- downloaded browser binaries

Keep artifacts only when the user asks or when the target project already has a committed convention for that artifact type.
