# Initialize Admin, Authorization, and Keycloak Boundaries

Run after `init-project` for both profiles. The admin module is the authority for
actors, roles, permissions, and external identity mapping.

## Startup and provisioning

Normal startup creates no automatic privileged user or demo administrator.
Privileged provisioning is an explicit, authenticated, audited operation with an
idempotency key. Example credentials never appear in source or environment
examples.

## Permission manifest

Discover permissions from a typed manifest (or an AST-derived equivalent), not
fragile text matching. Each entry has a stable code, description key, owning
module, supported actions, and profile applicability. Reconciliation reports
added, changed, and stale permissions; stale entries are disabled or require an
explicit reviewed removal.

A protected route without permission metadata fails closed.

## Role uniqueness

Represent role scope explicitly:

- global role: unique by code where tenant and department are absent;
- tenant role: unique by tenant plus code where department is absent;
- department role: unique by tenant, department, and code.

Validate that a department belongs to the actor's tenant before assignment.
Database partial indexes or equivalent constraints enforce the same semantics.

## Keycloak client identity

The public client ID is not the Keycloak admin API's internal resource ID. Search
by client ID, require exactly one match, cache the internal client UUID for the
operation, and use that UUID for secret, role, mapper, and client-management
calls.

## Secret provider

All confidential values cross a secret provider boundary. Production code stores
only secret references or encrypted material, never plaintext client secrets.
Public DTOs, logs, audit payloads, exceptions, and reconciliation records exclude
the secret value.

## Idempotent cross-system operations and reconciliation

Persist idempotency state before changing the database or Keycloak. Record each
step as pending, confirmed, ambiguous, compensated, or failed. Retrying the same
key resumes safely. Compensation is attempted only when the external result is
known; ambiguous outcomes enter reconciliation, which queries both systems and
converges without duplicating users, roles, or credentials.

## Authorization behavior

Policies receive an authenticated actor and current entity state. Tenant mismatch
denies before role or ownership evaluation. The `simple` profile adapts roles to
permissions without tenant fields. The `enterprise` profile requires trusted
tenant context and optionally department context.

## Verification

Generated tests cover no demo bootstrap, missing permission fail-closed behavior,
role uniqueness, stale permission detection, internal client UUID calls, secret
redaction, retry idempotency, ambiguous outcomes, compensation, and reconciliation.
