# Test Environment Guard

## Contents

- [Environment Classes](#environment-classes)
- [Preflight](#preflight)
- [Write policy](#write-policy)
- [Secrets and artifacts](#secrets-and-artifacts)

## Environment Classes

| Class | Default write policy |
|---|---|
| `local` / isolated container | `isolated-only` when ownership and cleanup are known |
| local mock/sandbox | policy supplied by the existing fixture contract |
| shared `dev` | read-only until isolation and cleanup are proven |
| `staging` / UAT | read-only; explicit isolated approval required for writes |
| `prod` / production | read-only smoke only with explicit request |
| `unknown` | block all state-changing execution |

Unknown must block writes. Prod must block destructive or state-changing tests.
Do not infer environment class from a friendly hostname alone.

## Preflight

Record logical environment ID, base URL key reference, class, `write_policy`,
actor/persona ID, auth source, data strategy, cleanup, external effects, and
runner artifacts. Missing environment, actor/persona, auth source, or ownership
data blocks the affected test without guessing.

## Write policy

Block destructive tests against production: record mutations, reset/truncate,
seed/migration, account/password/token changes, or real email, SMS, payment, and
notification effects. Shared dev/staging writes require run-owned isolated data,
an ownership filter, idempotent cleanup, and approved sandbox integrations.
Cleanup failure blocks evidence promotion.

Read-only production smoke is allowed only when explicitly requested, scoped,
rate-safe, and free of sensitive artifact capture.

## Secrets and artifacts

Redact before reporting credentials, tokens, cookies, headers, PII, embedded
database credentials, and secret-bearing URLs. Emit only key references and
logical IDs.

Traces, video, failure screenshots, storage state, raw reports, coverage HTML,
and browser binaries are local-only by default. A verified guide screenshot is
classified separately through the UI evidence and artifact lifecycle contracts.
