# NestJS Architecture and Security Principles

## Contract first

The pack manifest owns dependency order, inputs, outputs, write boundaries, and
verification commands. The profile contract is resolved once and propagated to
all packs. Generated behavior must not depend on contradictory prose.

## Explicit HTTP surface

Enumerate every controller route explicitly. Each protected route requires:

- authentication before authorization;
- stable permission or policy metadata;
- validated route parameters, query input, and request body;
- a route audit that fails closed when expected metadata is missing;
- no mutation route when the resource is declared read-only.

Separate create/update request schemas from response DTOs. Reject unknown,
server-owned, tenant, actor, audit, and capability fields at the request boundary.

## Actor authorization and tenant isolation

Authorization receives the authenticated actor plus current entity state.
Cross-tenant denial happens before ownership, role, or actor checks. Capability
flags are presentation hints and are not authoritative for mutations.

Enterprise repositories mechanically scope search, detail, mutation, workflow,
export, report, uniqueness, and background jobs by every required scope field.
Missing tenant context denies the operation. Department scope is applied only
when the entity contract requires it. Raw TypeORM repository access stays inside
the scoped implementation and is review-audited.

## Runtime and database safety

- Strict TypeScript is mandatory.
- Startup validates typed environment configuration.
- Credentialed CORS rejects wildcard origins.
- Global request bodies are bounded; bulk routes have smaller operation-specific
  row/byte limits.
- Production startup performs no schema DDL; migrations own schema changes.
- Errors use one stable redacted envelope.
- Secrets come from a secret-provider boundary and never enter public DTOs or logs.

## Cross-system and data integrity

Keycloak admin calls resolve the internal client UUID before UUID-based
operations. Database/Keycloak workflows persist idempotency state, distinguish
confirmed/ambiguous/failed results, compensate when safe, and reconcile retries.

Workflow transitions lock or version the current row, reload it, and repeat scope,
policy, and transition checks inside the transaction. Imports are bounded,
sanitized, safely reported, and idempotent when requested. Exports validate scope
and ranges, enforce row bounds, and stream or enqueue large artifacts.

## Evidence

Static scans, TypeScript parsing, compilation, behavior, container integration,
and real-agent forward tests are separate evidence tiers. An unavailable tier is
reported as skipped or blocked with a reason, never as passed.
