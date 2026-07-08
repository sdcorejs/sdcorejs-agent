# Generic Test Ref

> Stack-neutral fallback loaded by `sdcorejs-test` for plain Angular, plain
> NestJS, plain Next.js, React, and unknown projects.

## Scope

Use this ref when the project does not match an SDCoreJS-specific stack profile or when the profile is uncertain. It prevents SDCoreJS-specific conventions from leaking into plain apps.

Do not enforce:

- Core UI components, providers, auto IDs, routes, or `src/libs` layout
- SDCoreJS NestJS module, repository, schema, bilingual error, or Postgres conventions
- build-website public-site, locale routing, sitemap, or SEO conventions
- any package manager, runner, or dependency not already present

## Workflow

1. Read the files under test and nearby existing tests.
2. Detect runner/config from the project.
3. Match naming, folder layout, imports, helpers, fixtures, providers, and cleanup style.
4. Choose the smallest meaningful level:
   - pure functions and mappers: unit
   - components/forms/hooks: component or integration
   - routers/API boundaries: integration
   - critical user journeys: e2e
5. Prefer existing factories, mock servers, page objects, and test utilities.
6. Run or recommend only discovered commands.

## Frontend Guidance

For React-like projects, prefer behavior-focused tests with accessible queries when the project uses Testing Library. Use `userEvent` for user behavior when available. Handle async UI with runner-native async helpers.

For Angular-like projects, use the existing TestBed, Testing Library, Karma/Jest/Vitest, or project helper conventions. Do not import Core UI or SDCoreJS providers unless the target project already uses them.

For Next.js, test generic pages/components/routes according to the project's existing app/pages router setup. Do not assume locale prefixes, generated metadata, sitemap, or public landing-site requirements unless present.

## Backend Guidance

For NestJS-like projects, follow the existing testing strategy:

- If repositories are mocked in unit tests, keep that unit style.
- If the project has a test database helper, reuse it.
- If it uses Prisma, Mongoose, TypeORM, MikroORM, Sequelize, or another data layer, follow the local pattern.
- Do not introduce Postgres/testcontainers/pg-mem/Zod/supertest unless already present or explicitly approved.

## Output Standard

For plans or audits, list:

- target behavior
- proposed level
- files to test
- existing helpers/runner discovered
- command to run or blocker
- risk covered
- residual risk

For authored tests, include only scoped changes and current verification evidence.
