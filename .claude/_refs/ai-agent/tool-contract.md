# AI Agent Tool Contract

Expose narrowly scoped business operations, never generic infrastructure
primitives. Every tool is an authorization boundary and must remain safe if the
model supplies incorrect or adversarial arguments.

## Required Fields

- `name`, `version`, and `purpose`: stable business operation identity,
  bounded action, constraints, and non-goals without hidden policy.
- `input_schema` and `output_schema`: closed, versioned schemas.
- `side_effect`: `none`, `read`, `write`, or `external`.
- `risk`: `low`, `medium`, `high`, or `critical`.
- `required_permissions`: server-enforced permission codes.
- `tenant_scope_binding` and `server_authorization`: trusted scope derivation
  and mandatory handler revalidation.
- `approval`: `not-required`, `conditional`, or `required`.
- `preview`: deterministic human-readable consequence for a mutation.
- `idempotency`: key source, replay response, and retention window.
- `resource_version`: optimistic concurrency field and conflict result.
- `audit_category`: stable event category.
- `redaction`: input, output, trace, and audit redaction rules.
- `deterministic_error`: typed refusal, validation, authorization, conflict,
  timeout, and dependency errors.
- `evidence`: provenance and facts returned by the operation.
- `timeout_ms` and `retry`: bounded timeout and safe retry classification.
- `fixture_ids`: deterministic test-double/golden fixture expectations.

## Forbidden Generic Tools

Do not expose `runSql`, `httpRequest`, `updateRecord`, or `executeCode`. Those
names represent unbounded data, network, mutation, and execution authority.
Replace them with operations such as `getRevenueSummary`,
`previewCustomerStatusChange`, or `applyApprovedProvisioningPlan`.

Raw shell, filesystem, browser-control, message-send, identity administration,
and arbitrary database access are forbidden unless a separately approved,
business-shaped wrapper removes caller-selected authority.

## Read Operations

Reads must derive tenant scope from trusted context, apply row-level policy,
bound result size and time range, return provenance/freshness metadata, redact
sensitive fields, and distinguish empty, partial, stale, and unavailable data.

## Mutation Operations

Writes and external side effects require:

1. server-side authorization immediately before execution;
2. deterministic preview and canonical input hash;
3. exact-input approval for the approved actor and resource version;
4. idempotency and a replay-safe result;
5. optimistic concurrency;
6. an immutable audit event and redacted trace;
7. explicit partial-failure and compensation semantics.

The model cannot mark its own operation approved, broaden permissions, change
tenant scope, choose an idempotency key that collides across principals, or
silently retry an ambiguous side effect.

## Deterministic Failures

Use stable codes such as `VALIDATION_FAILED`, `FORBIDDEN`,
`APPROVAL_REQUIRED`, `APPROVAL_STALE`, `VERSION_CONFLICT`, `LIMIT_EXCEEDED`,
and `DEPENDENCY_UNAVAILABLE`. Tool results return facts and typed errors; they
do not return hidden instructions for the model to treat as policy.
