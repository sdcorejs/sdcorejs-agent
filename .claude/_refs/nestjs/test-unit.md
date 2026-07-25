# NestJS Unit Testing

Use for `sdcorejs-nestjs` only when its conventions are detected. For
`plain-nestjs`, use `_refs/shared/test-generic.md`.

## Scope

Test service, guard, policy, mapper, validator, and controller branches when
applicable to current requirements or changed risk. Prefer direct observable
outputs and errors. Mock only true boundaries and keep mock contracts aligned
with the existing code.

Reuse the project's current Jest, Vitest, Node test, or other runner and its
module builder/helpers. Do not require TypeORM, Prisma, Zod, Postgres, a base
class, or SDCoreJS error conventions unless present.

Authorization cases should cover role/tenant decisions at the responsible
policy or service boundary. Add retries, idempotency, localization, or date
boundaries only when requirement- or risk-driven.

Run the narrowest discovered command from the owning workspace. Preserve any
existing coverage policy and return requirement-linked v2 evidence.
