# NestJS Integration Test Reference

## Applicability

For `sdcorejs-nestjs`, compile real Nest dependency injection and exercise the
repository/service boundary. For `plain-nestjs`, load
`_refs/shared/test-generic.md` and use the project's established database test
strategy.

Do not add packages or mutate shared infrastructure from this reference.

## Required cases

- module providers and Symbol ports resolve through real Nest DI;
- migrations create the expected schema without runtime synchronization;
- enterprise search/detail/mutation/workflow/export/report/uniqueness operations
  always apply required tenant and optional department predicates;
- missing scope fails before SQL execution;
- tenant A cannot observe tenant B through counts, errors, uniqueness, or exports;
- optimistic version or row-lock conflicts allow only one transition to commit;
- idempotency state survives retry and ambiguous external outcomes;
- role uniqueness matches global, tenant, and department semantics.

Prefer an isolated transaction/database per test. Record the actual engine:
in-memory emulation is not evidence for Postgres locking or Keycloak behavior.
