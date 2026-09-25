# Review Profiles And Reference Matrix

Read this reference for executable-code reviews before classifying
`track_profile` and before loading any track-specific reference. The review
stays read-only; this file only selects criteria.

## Track profile evidence

| track | track_profile | Required evidence |
|---|---|---|
| angular | `core-ui-angular` | Angular signals plus `@sdcorejs/angular` in `package.json` or strong existing imports/usages. |
| angular | `legacy-core-ui-angular` | Angular signals plus `@sd-angular/core` in `package.json` or strong existing imports/usages. |
| angular | `plain-angular` | Angular signals but neither Core UI package/convention is installed or used. |
| nestjs | `sdcorejs-nestjs` | NestJS signals plus `@sdcorejs/nestjs` or strong SDCoreJS NestJS conventions/libraries. |
| nestjs | `plain-nestjs` | NestJS signals without `@sdcorejs/nestjs` or SDCoreJS NestJS conventions. |
| nextjs | `nextjs-build-website` | Next.js signals plus build-website/public-site evidence such as `src/app/[locale]`, typed i18n navigation, content/public-site structure, build-website summary/plan/spec/task context, or explicit public-site scope. |
| nextjs | `plain-nextjs` | Next.js signals without build-website/public-site evidence. |
| general | `general` | No known track can be confidently classified, or mixed/unknown stack where only shared rules are safe. |

Rules:

- Do not treat Angular as Core UI Angular merely because `angular.json` or
  `@angular/core` exists.
- Do not treat NestJS as SDCoreJS NestJS merely because `@nestjs/*` exists.
- Do not treat Next.js as build-website merely because `next.config.*` or
  `next` exists.
- Do not enforce Zod, TypeORM, PostgreSQL, `@sdcorejs/nestjs`, Core UI,
  `[locale]`, typed i18n navigation, or build-website caching/layout patterns
  unless the classified profile or actual installed/used stack supports them.
- If the user explicitly asks to review a migration/install to an SDCoreJS
  framework profile, classify the migration scope separately and review only the
  approved migration evidence.

## Reference matrix

| track_profile | code | security | performance | accessibility | architecture |
|---|---|---|---|---|---|
| `core-ui-angular` | `_refs/angular/review-code.md` | `_refs/shared/review-security.md` + `_refs/angular/review-security.md` | `_refs/shared/review-performance.md` + `_refs/angular/review-performance.md` | `_refs/shared/review-accessibility.md` + `_refs/angular/review-accessibility.md` | `_refs/shared/review-architecture.md` |
| `legacy-core-ui-angular` | `_refs/angular/review-code.md` | same as Core UI Angular | same as Core UI Angular | same as Core UI Angular | `_refs/shared/review-architecture.md` |
| `plain-angular` | `_refs/shared/review-code.md` plus generic/local Angular checks only | `_refs/shared/review-security.md` | `_refs/shared/review-performance.md` | `_refs/shared/review-accessibility.md` for UI scope only | `_refs/shared/review-architecture.md` |
| `sdcorejs-nestjs` | `_refs/nestjs/review-code.md` | `_refs/shared/review-security.md` + `_refs/nestjs/review-security.md` | `_refs/shared/review-performance.md` + `_refs/nestjs/review-performance.md` | N/A unless API usability/docs/UI scope requested | `_refs/shared/review-architecture.md` |
| `plain-nestjs` | `_refs/shared/review-code.md` plus generic/local NestJS checks only | `_refs/shared/review-security.md` | `_refs/shared/review-performance.md` | N/A unless API usability/docs/UI scope requested | `_refs/shared/review-architecture.md` |
| `nextjs-build-website` | `_refs/nextjs/build-website/review-code.md` | `_refs/shared/review-security.md` + `_refs/nextjs/build-website/review-security.md` | `_refs/shared/review-performance.md` + `_refs/nextjs/build-website/review-performance.md` | `_refs/shared/review-accessibility.md` + `_refs/nextjs/build-website/review-accessibility.md` | `_refs/shared/review-architecture.md` |
| `plain-nextjs` | `_refs/shared/review-code.md` plus generic/local Next.js checks only | `_refs/shared/review-security.md` | `_refs/shared/review-performance.md` | `_refs/shared/review-accessibility.md` for UI scope only | `_refs/shared/review-architecture.md` |
| `general` | `_refs/shared/review-code.md` | `_refs/shared/review-security.md` | `_refs/shared/review-performance.md` | `_refs/shared/review-accessibility.md` for UI scope only | `_refs/shared/review-architecture.md` |

## Plain-profile guardrails

Plain-profile guardrails:

- `plain-angular`: must not flag missing `Sd*` components/services, Core UI
  imports, `autoId`, Core UI style utilities, `src/libs/**/features/**`,
  `MockCrudStore`, `SdTable`, `SdNotifyService`, forced admin screens, or Core
  UI usage summaries unless the project already uses SDCoreJS Core UI.
- `plain-nestjs`: must not enforce `@sdcorejs/nestjs`, Zod, TypeORM,
  PostgreSQL, base repositories/services, or a specific module layout unless
  detected in the target project. If the project uses Prisma, class-validator,
  Mongoose, Fastify, or another stack, review against that actual stack.
- `plain-nextjs`: must not enforce `[locale]`, `setRequestLocale`, typed i18n
  navigation, content/public-site folders, landing-site metadata conventions, or
  build-website caching rules unless detected.
