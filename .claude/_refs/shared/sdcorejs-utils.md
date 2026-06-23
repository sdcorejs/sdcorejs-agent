# SDCoreJS Utilities Reuse

## Contents

- [Package Evidence](#package-evidence)
- [Preflight](#preflight)
- [Utility Map](#utility-map)
- [Framework Rules](#framework-rules)
- [Required Output Before Code](#required-output-before-code)
- [Do Not](#do-not)

Use this reference before writing helper, formatter, validator, mapper,
paging/filter, random-id, query-param, upload/download, or browser-clipboard code
in Angular, Next.js, or NestJS work.

## Package Evidence

`@sdcorejs/utils` is a pure TypeScript utility package. Latest verified via
`npm view @sdcorejs/utils` on 2026-06-23: `1.1.4`.

Public exports:

- `@sdcorejs/utils`
- `@sdcorejs/utils/fns`
- `@sdcorejs/utils/models`
- `@sdcorejs/utils/constants`

Never import from `@sdcorejs/utils/dist/*` or other private paths.

## Preflight

Before creating a new utility/helper file or helper function:

1. Inspect the target project's `package.json`, lockfile, and existing imports.
2. Run or infer `npm ls @sdcorejs/utils` when dependency state is unclear.
3. Prefer a direct dependency in the target app before importing it. Do not rely
   on a transitive dependency from `@sdcorejs/angular`, `@sd-angular/core`, or
   `@sdcorejs/nestjs`.
4. For fresh scaffolds, add `@sdcorejs/utils` as a direct dependency.
5. For existing projects, add the dependency only when the user request includes
   code generation or dependency changes. Otherwise state the assumption and
   propose the dependency update.
6. Search current code first. Reuse existing project wrappers if they already
   centralize `@sdcorejs/utils`.

## Utility Map

| Need | Prefer |
|---|---|
| Date format/parse/diff/elapsed time | `DateUtilities` from `/fns` |
| VND currency, rounding, positive-number checks | `NumberUtilities` from `/fns` |
| Email/phone/url/uuid/code validation helpers | `ValidationUtilities` from `/fns` |
| Null/empty strings, alias includes, SHA-256, unique code, string regex constants | `StringUtilities` from `/fns` |
| Search, union, paging on arrays | `ArrayUtilities` from `/fns` |
| Filter matching/evaluation, relative dates, epoch conversion | `FilterUtilities` from `/fns` |
| Fetch all pages, random id, UUID, query params | `Utilities` from `/fns` |
| Object clone/merge/hash/stable stringify/nested value | `ObjectUtilities` from `/fns` |
| HSL/RGB to hex conversion | `ColorUtilities` from `/fns` |
| Upload, download, copy to clipboard, incognito detection | `BrowserUtilities` from `/fns` |
| Paging/filter/shared TS contracts | `PagingReq`, `PagingRes`, `Filter`, `NestedKeyOf`, `MaybeAsync` from `/models` or root |
| Shared constants/patterns | `OPERATORS`, `VALIDATION_PATTERNS`, `SUPPORTED_LANGUAGES`, `EMPTY_STR` from `/constants` |

Use table-driven tests around the utility caller when business logic adds
branching. Do not test the library implementation itself.

## Framework Rules

### Angular

- Use `@sdcorejs/utils` in pipes, validators, mappers, services, stores, and
  component helpers before writing local `formatDate`, `formatNumber`,
  `currency`, `email`, `search`, `dateDiff`, `paging`, or `copyToClipboard`
  helpers.
- `BrowserUtilities` is allowed only in browser-side components/services and
  must not run during SSR or server-only tooling.
- When Core UI already provides the UI behavior and `@sdcorejs/utils` provides
  the data/helper behavior, use both instead of hand-rolling either layer.

### Next.js

- Use `@sdcorejs/utils` for shared pure helpers in `src/lib`, API routes, server
  actions, client hooks, and content mappers.
- Keep `next-intl` `useFormatter()`/`getFormatter()` for locale-bound UI date,
  number, currency, and relative-time output. Do not replace locale UI
  formatting with generic helpers unless the product explicitly wants that
  fixed format.
- `BrowserUtilities` belongs only in client files marked with `'use client'`.
  Never import it from server components, route handlers, metadata, sitemap, or
  other server-only code.

### NestJS

- Use `@sdcorejs/utils` for pure server helpers, paging/filter models, date or
  number normalization, query parsing, random IDs, UUIDs, and shared constants.
- Never use `BrowserUtilities` in NestJS code.
- Keep runtime validation in Zod or the app's validation layer. Utilities can
  support normalization and reusable constants, but they do not replace request
  validation schemas.
- Keep `@sdcorejs/nestjs` core imports for BaseEntity/BaseRepository/BaseService,
  guards, validation guard, and response/error envelope. Utilities complement
  the core; they do not replace it.

## Required Output Before Code

When the generated code would otherwise include a custom helper, output a short
reuse summary before writing production code:

- Existing `@sdcorejs/utils` dependency/imports found or dependency action taken.
- Utilities reused, with import subpaths.
- Custom helpers still being written and why the package does not cover them.

## Do Not

- Do not duplicate `DateUtilities`, `NumberUtilities`, `StringUtilities`,
  `ValidationUtilities`, `ArrayUtilities`, `FilterUtilities`, `Utilities`,
  `ObjectUtilities`, `ColorUtilities`, or `BrowserUtilities` behavior in local
  helper files.
- Do not deep-import `dist`.
- Do not rely on transitive dependencies.
- Do not use browser-only helpers in server-side code.
- Do not mock `@sdcorejs/utils` deeply in tests unless the caller behavior cannot
  be observed without it.
