# Initialize a Secure NestJS Project

Read `../pack-manifest.json`, `../profile-contract.json`, and
`../core-catalog.md` first. This pack creates project/runtime wiring only; the
admin, domain module, entity, and action packs remain separate manifest nodes.

## Required inputs

- target root;
- resolved profile (`simple` or `enterprise`);
- package name and database connection identifiers;
- explicit production origins and secret references.

Reject an unknown profile, missing target root, traversal, undeclared overwrite,
or incompatible Node/NestJS/core-package range before writing.

## Package and compiler baseline

Generate Node `>=18.18`, NestJS 11-compatible dependencies,
`@sdcorejs/nestjs@^1.0.0`, and strict TypeScript. The generated lockfile is the
build identity. Do not rely on transitive application dependencies.

## Typed startup configuration

Validate environment configuration at startup before creating the Nest
application or connecting to external systems. Production validation rejects:

- a missing database URL, signing/key source, or required Keycloak configuration;
- credentialed CORS with a wildcard origin;
- weak, example, or inline production secrets;
- a non-positive or unbounded body limit;
- automatic synchronization or schema creation.

Expose typed configuration to application code. Redact secret values and include
only key names in validation errors.

## HTTP bootstrap

Use an explicit origin allowlist. When `credentials: true`, reject `*` and
reflect only an exact configured origin. Set a bounded global body limit and
smaller route-specific byte/row limits for import and bulk actions.

Install authentication, request context, validation, and one global error filter.
The error response is `{ code, message, data? }`; production responses exclude
stack traces, SQL, driver errors, tokens, and secrets.

## Database lifecycle

Production startup must not run `CREATE SCHEMA` or any other schema DDL.
TypeORM synchronization is disabled. Versioned migrations create schemas, tables,
constraints, indexes, and rollback behavior. The application identity receives
only runtime privileges after migrations complete.

## Generated project shape

```text
src/
  app.module.ts
  main.ts
  config/env.ts
  auth/
  errors/
  database/migrations/
  modules/
test/
```

The generator owns literal templates under `../generator/templates/common/`.
This Markdown pack explains generalization; it must not duplicate a conflicting
implementation.

## Verification

- invalid production configuration fails before application startup;
- wildcard credentialed CORS is rejected;
- oversized global and bulk requests are rejected;
- production bootstrap contains no schema DDL;
- `nest build` succeeds with strict TypeScript.
