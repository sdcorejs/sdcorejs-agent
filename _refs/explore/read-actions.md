# Explore Read-Only Actions

Read this reference for read-only explore actions and for the read-only
inspection that precedes any approved write. It grants no write authority:
read-only actions still emit no writes, and every persistence step needs the
separate write gate in `sdcorejs-explore`.

## Stack profile rules

Profile rules:

- Angular: detect from `angular.json`, `@angular/core`, Angular
  components/modules/routes, or Angular tests. Use `core-ui-angular` only when
  `@sdcorejs/angular` is installed/imported/used. Use
  `legacy-core-ui-angular` only when `@sd-angular/core` is installed/imported or
  used. Use `plain-angular` when Angular is present without either Core UI
  package. Do not classify Angular as Core UI from `angular.json` alone.
- NestJS: detect from `nest-cli.json`, `@nestjs/*` dependencies, controllers,
  modules, providers, or Nest tests. Use `sdcorejs-nestjs` only when
  `@sdcorejs/nestjs` or strong SDCoreJS Nest conventions are detected. Use
  `plain-nestjs` otherwise. Do not assume TypeORM, PostgreSQL, Zod,
  `SdContext`, `@HasPermission`, or `@sdcorejs/nestjs` for plain NestJS.
- Next.js: detect from `next.config.*`, `next` dependency, `app/`, `pages/`,
  `page.tsx`, `layout.tsx`, `route.ts`, or Next tests. Use
  `nextjs-build-website` only with strong public-site/build-website evidence
  such as `[locale]` routes, typed i18n navigation, content/public-site
  structure, or prior `sdcorejs-nextjs` build-website context. Use
  `plain-nextjs` otherwise. Do not assume `[locale]`, `setRequestLocale`,
  sitemap metadata, typed i18n navigation, or content folders for plain Next.js.
- React: use `react-vite` for Vite config plus React dependency. Use
  `react-cra` for `react-scripts`. Use `react-next-generic` when Next.js is
  present without build-website evidence and React-specific guidance is needed.
- Node/general: use `node-general` for Node projects without a stronger
  framework profile. Use `general` when no known profile is detected.

`profile_evidence` must cite concrete files, dependencies, imports, configs, or
tests. Do not record guesses as evidence.

## Scanning Discipline

Use safe, bounded scans:

- Prefer `git ls-files` inside git repositories.
- Fall back to targeted globs when not git-backed.
- Exclude generated/vendor/build directories by default:
  `node_modules`, `dist`, `build`, `coverage`, `.next`, `.turbo`, `.angular`,
  `.cache`, `.git`, `playwright-report`, `cypress/videos`,
  `cypress/screenshots`, `test-results`, generated clients, binary/media assets
  unless relevant, and generated/vendor/build output.
- Exclude generated mirrors such as `codex/skills`, `.claude/skills`,
  `plugin/skills`, `plugin/_refs`, and `codex/skills/_refs` unless the target
  request is specifically about skill-pack or mirror behavior.
- Do not scan `.env` files for values. For env setup, read example/template key
  names only.
- Do not dump large files. Cap large result sets and summarize counts.
- Record `commands_skipped` when a repo is too large, a command would be noisy,
  or a probe could expose secrets.
- Use path-specific probes based on detected `source_roots` instead of
  root-level grep across the whole repo when possible.

## Package Manager And Command Discipline

Before suggesting or running commands:

- Detect package manager from `packageManager`, lockfiles, and workspace config.
- Do not mix npm, pnpm, yarn, or bun.
- Read `package.json` scripts before suggesting commands.
- Do not invent missing scripts.
- Do not assume `npm run dev`, `npm run build`, `npm run test`,
  `npm run lint`, or install commands exist.
- Do not install packages, download tools, install browsers, or start services
  unless explicitly requested.
- Record only commands actually run in `commands_run`.
- Record omitted probes in `commands_skipped`.

## `code-map-readonly`

First decide whether targeted reads already answer the question. Do not create
a code map for a few named files, a known entrypoint, or a relationship
answerable from `rg`, manifests, routes, or module config.

Use a scoped map for cross-module/package/layer work, impact or ownership
analysis, composition hosts, frontend-to-persistence traces, unclear dependency
direction, or a large repository where sequential reads would be wasteful.

Return the bounded `code_context` node/edge contract from
`_refs/shared/project-context.md`. Every node and edge cites repository-relative
path evidence. Do not persist the map.

When the repository already has a dependency graph, language/LSP index, or
build graph:

- detect it from config, scripts, or documented tooling;
- use only a documented read-only scoped query;
- do not install or download a tool;
- record provider evidence and limitations;
- classify any generated provider cache as `local_only`;
- keep current code/config as the higher source of truth.

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

## `trace-flow-readonly`

Trace actual code paths, not assumed conventions:

1. Start from the explicit user-provided entrypoint if present.
2. If no entrypoint is provided, infer candidates and ask for selection when
   ambiguous.
3. For frontend-to-backend traces, map UI action -> route/client call -> API
   endpoint -> service/domain/data layer -> response/render/update.
4. For backend traces, map controller/handler -> guards/middleware/pipes/
   interceptors -> service/domain -> persistence/integration -> response/error
   path.
5. For Next.js, distinguish app router/pages router, server/client components,
   route handlers, server actions, caching, and runtime only when detected.
6. For Angular and NestJS, apply Core UI or SDCoreJS rules only when the
   `stack_profile` evidence supports them.

Do not write diagrams or files unless the user explicitly asks.

## Env Setup Actions

`env-setup-readonly` is the default. It may read README, package manifests,
lockfiles, Docker Compose, devcontainer files, env examples, and scripts. It
outputs setup commands/instructions and required env key names only.

It must not create `.env`, `.env.local`, config files, or secrets by default.
It must never overwrite existing env files. It must never insert real secret
values. It must not install packages, download tools, or start services unless
explicitly requested.

## `recovery-readonly`

Recovery mode is read-only. Read valid summary sections, the directly related
approved spec/plan, change-scoped execution docs, an explicit handoff when one
exists, relevant memory metadata, Git status/diff/log, and current user scope.
Select artifacts by exact `contract_id`, `requirement_id`, `change_ref`,
parent/supersedes links, and repository/module owner before path hints. Never
select a durable artifact merely because it is newest.

Ignore legacy session checkpoint files. Do not auto-resume work, create a
handoff, or refresh summary.

End with one numbered choice prompt:

```text
What would you like to do next?

1. Continue the previous task
2. Start a new task from current context
3. Inspect a specific document or file
4. Refresh project summary
5. Stop after this recovery summary

Reply with `1`, `2`, `3`, `4`, or `5`.
```

## Persona and memory reads

`persona-read` reads the current persona only.

`memories-read` loads only relevant memory index/metadata first, not every
memory body.
