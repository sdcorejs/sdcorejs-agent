# Generate an Explicit Entity Stack

Read the manifest, profile contract, module contract, and core catalog. Generate
only operations approved for the entity.

## Files

Create an entity/schema, repository port and implementation, service port and
implementation, explicit controller, separate request schemas, response DTO, and
route audit. Register them in the owning module.

## Request and response separation

Create and update schemas are distinct. Use strict Zod objects that reject unknown
keys and all server-owned fields, including IDs, actor, tenant, department, audit
columns, version, and capability flags. Validate UUIDs, dates, enums, pagination,
bulk input, and each custom body.

A response DTO may expose safe capability flags. It is never accepted as a
mutation request.

## Explicit routes

Explicitly enumerate every route; do not rely on an inherited HTTP surface.
For every protected route:

1. authenticate;
2. attach a stable permission or policy code;
3. validate route params, query values, and body before service/repository calls;
4. serialize through the stable response/error contract.

Missing permission metadata fails closed wherever protection is expected. A
read-only resource emits search/detail routes only and the route audit fails if a
create, update, delete, restore, import, transition, or bulk mutation appears.

## Repositories and scope

The simple repository has no tenant columns. The enterprise repository accepts a
trusted scope object and applies every required field to search, detail, mutation,
transition, export, report, uniqueness, and background-job queries. Missing
tenant context denies before a query. Raw TypeORM access remains private to the
scoped implementation.

## Policies and mutation

Load current state, deny cross-tenant access, then evaluate the authenticated
actor. Mutation services re-evaluate policy inside the transaction. DTO
capability flags are presentation-only and cannot authorize a write.

## Route audit

The generated audit enumerates method, path, operation, authentication metadata,
permission metadata, validators, and read-only classification. It rejects duplicate
routes, parameter shadowing, unprotected routes, and unsupported operations.

## Verification

Run unit tests for policy/service behavior, integration tests for repository scope,
and E2E tests for HTTP auth, permission metadata, validation order, read-only
surfaces, stable errors, and cross-tenant denial.
