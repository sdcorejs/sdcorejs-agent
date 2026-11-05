# NestJS Security Review

Apply after the code review scope gate.

## Authentication and authorization

Audit every route metadata record. Protected routes require authentication and a
stable permission/policy. Attempt missing metadata, unknown permission, forged
actor, and forged capability flags.

## Tenant isolation

For enterprise, trace trusted tenant/department context to every repository data
path: search, detail, mutation, transition, export, report, uniqueness, jobs, and
artifact downloads. Cross-tenant denial must happen before ownership or role
logic and must not leak existence through status, count, timing, or error detail.

## Input, output, and secrets

Confirm strict schemas reject unknown/server-owned fields and validate params.
Probe oversized bodies, formula injection, unsafe filenames, date ranges, and row
limits. Confirm error/log/audit/DTO output redacts stack, SQL, tokens, and secrets.

## Keycloak and cross-system state

Verify internal client UUID resolution, secret-provider isolation, persisted
idempotency, retry-safe state transitions, compensation rules, and reconciliation
of ambiguous outcomes.

Report only evidence-backed findings with safe reproduction steps.

## Effective behavior and comparable patterns

Resolve global APP_GUARD, controller/method/inherited guards and metadata precedence. HasPermission is profile-specific; check its guard actually executes and public overrides are intentional.
Use _refs/shared/review-screen-patterns.md for the operation/permission/owner/tenant
matrix and _refs/shared/review-data-completeness.md for complete-data consumers.
Retain source locators and denial/boundary test gaps. Accepted inheritance and
intentional bounded previews are controls, not automatic findings.
