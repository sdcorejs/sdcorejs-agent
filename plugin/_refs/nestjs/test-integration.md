# NestJS Integration Testing

Use for `sdcorejs-nestjs` only when its conventions are detected. For
`plain-nestjs`, use `_refs/shared/test-generic.md`.

## Scope

Use integration tests when applicable requirements or risks cross Nest modules,
database/repository adapters, queues, caches, external clients, validation, or
transaction boundaries. Search, detail, mutation, workflow, export, report,
and uniqueness cases are conditional, never an enterprise checklist that
always applies.

## Infrastructure

Reuse existing test module builders, database helpers, containers, migrations,
factories, and cleanup. Follow the detected Prisma, TypeORM, Mongoose, MikroORM,
Sequelize, or custom repository pattern. Do not introduce an alternative.

Each state-changing run owns uniquely identified records and performs
idempotent filtered cleanup. A cleanup failure blocks promotion. External email,
SMS, payment, webhook, and queue effects require an existing sandbox or test
double.

## Assertions and evidence

Assert persisted state and public adapter contracts, including rollback,
authorization, tenant isolation, retry, or idempotency when required. Discover
the current command/cwd; do not install tooling or invent a threshold. Return
v2 context/status/evidence and data lifecycle results.
