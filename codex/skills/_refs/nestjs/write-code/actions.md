# Generate Safe Domain Actions

Use this pack for workflows, caller-scoped listings, bulk import, export, reports,
and multi-system or multi-row operations. The resolved profile remains unchanged.

## Actor and scope policy

Every policy receives the authenticated actor and current entity. Cross-tenant
denial happens before ownership, role, or actor evaluation. Enterprise operations
scope search, detail, mutation, export, and report behavior plus transition,
uniqueness, and background work. Never compare two entity-owned fields as a proxy
for caller identity.

Capability flags are presentation hints and are not authoritative for mutations.
A write reloads current state and re-runs scope and actor policy at the write
boundary.

## Explicit action route

Declare the literal route, HTTP verb, authentication, permission/policy metadata,
parameter schema, query schema, body schema, limits, response type, and error
codes. Validate before calling a service or repository. Register every permission
in the typed manifest.

## Concurrency-safe workflow

Use an optimistic version predicate or row lock. Inside one transaction:

1. load the scoped current row;
2. deny scope mismatch;
3. re-evaluate actor policy;
4. validate the transition from current state;
5. write with the expected version or held lock;
6. commit once.

A conflicting transition changes zero rows or waits and then fails validation, so
only one conflicting transition can commit.

## Bounded import

Import is bounded by bytes and row count, sanitized against formula injection,
validated with strict request schemas, and idempotent when an idempotency key is
required. Bind operation keys to the trusted tenant and department scope plus a
request digest. Claim an operation atomically before work, persist its safe result,
replay identical retries, and reject reuse of the key with a different request.
Normalize deduplication keys before the transaction. Return safe row results
containing row number, stable code, and approved fields only; exclude SQL, stack
traces, secrets, and raw input. A local file-backed provider is suitable for the
generated single-instance sample; multi-instance deployments must bind the storage
port to a database with an equivalent unique key and transaction contract.

Choose all-or-nothing or per-row transactions explicitly. Thread one QueryRunner
through every write that belongs to one atomic unit and always release it.

## Bounded export

Export is scope-safe and row bounded. Validate an inclusive date/range contract,
enforce a maximum window and row count, and use a cursor or keyset iterator.
Stream the response with backpressure for bounded output; enqueue an asynchronous
artifact for larger output. Never buffer an unbounded workbook in memory.

The artifact name is sanitized, short-lived, actor-bound, and tenant-bound. Audit
the normalized filter and count, not exported confidential rows.

## Cross-system action

Persist idempotency and step state before external calls. Distinguish confirmed,
ambiguous, compensated, and failed outcomes. Reconciliation queries both systems
and safely resumes without duplicate side effects.

## Verification

Test forged capability flags, missing actor/scope, cross-tenant access, conflicting
transitions, oversized or formula-bearing import rows, repeated idempotency keys,
unsafe ranges, row limits, stream backpressure, and background artifact ownership.
