# Explore: documentation-harvest-readonly

## `documentation-harvest-readonly`

Documentation harvest must first detect the actual stack_profile and libraries
in use. Do not assume SDCoreJS/Core UI/TypeORM/build-website conventions for
plain projects.

Profile-aware harvest rules:

- Core UI harvest columns/checks apply only to `core-ui-angular` or
  `legacy-core-ui-angular`.
- SDCoreJS Nest, TypeORM, PostgreSQL, and permission decorator harvest applies
  only when those technologies are detected.
- Plain Angular harvests actual routes, UI libraries, components, forms,
  validators, services, state, and local component conventions.
- Plain NestJS harvests actual controllers, services, modules, DTOs,
  validation, database technology, persistence layer, and integration clients.
- Plain Next.js harvests actual app/pages routes, data fetching, components,
  server/client boundaries, route handlers, server actions, caching, and
  public/internal site structure.
- If the project uses Prisma, Mongoose, class-validator, Zod, Angular Material,
  PrimeNG, Tailwind, local components, or another library, describe actual usage
  instead of forcing SDCoreJS assumptions.
- Do not create false gaps based on absent SDCoreJS conventions.

Output a facts table with path evidence and `unknown - reason` for gaps that
cannot be proven.
