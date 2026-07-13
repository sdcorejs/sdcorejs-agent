# NestJS E2E Test Reference

## Applicability

For `sdcorejs-nestjs`, boot the generated Nest application and inspect real HTTP
metadata and behavior. For `plain-nestjs`, load
`_refs/shared/test-generic.md`. Before any external service test, apply
`_refs/shared/test-environment-guard.md`.

Do not install browsers, dependencies, databases, or images implicitly.

## Required HTTP cases

- every protected route rejects unauthenticated and unauthorized requests;
- expected protection with missing permission metadata fails closed;
- read-only resources expose no mutation route;
- malformed params and bodies fail before repository execution;
- unknown/server-owned fields are rejected;
- wildcard credentialed CORS and insecure production configuration fail startup;
- global and action-specific body limits return bounded errors;
- error envelopes are stable and redacted;
- enterprise requests deny search, detail, mutation, transition, export, report,
  uniqueness inference, and background artifact access across tenants.

## Evidence tiers

1. Generated project compile.
2. Unit and in-process integration.
3. Nest HTTP E2E.
4. Real Postgres concurrency and scope behavior.
5. Real Keycloak admin behavior.

Apply `test-environment-guard` before tiers 4 and 5. If Docker or an image is
unavailable, report the tier as skipped/blocked with the exact reason.
