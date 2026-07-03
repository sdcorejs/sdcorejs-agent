# Angular Input Analysis and UI Reuse Preflight

Loaded by `sdcorejs-angular` before implementing Angular UI work when the
request includes visual input, PRD/requirements input, user stories,
acceptance criteria, mock API/API-contract input, or any UI-affecting feature
description.

This reference keeps image/PRD analysis, Core UI reuse, local project reuse,
API/service assumptions, and the post-implementation UI check in one place. It
is not a dispatchable skill.

## When To Run

Run this reference before choosing feature-specific components, services, or
templates for Angular UI work.

Use it for:

- screenshots, wireframes, mockups, Figma exports, rough visual references, or
  attached images
- PRDs, requirement documents, user stories, feature descriptions, or
  acceptance criteria
- mock API docs, OpenAPI/Swagger, Postman/Insomnia, MSW/WireMock/Prism/JSON
  Server specs, endpoint tables, JSON fixtures, schemas, or sample cURL
- mixed visual and textual input
- direct UI implementation requests where the source is informal but
  user-facing behavior or layout will change

Skip only for non-UI Angular work, such as pure model typing, route-only
permission wiring, or a backend-only contract discussion.

## Core UI Documentation Source

Treat the SDCoreJS Angular docs registry as the source of truth for available
Core UI components, services, utilities, and examples:

```text
https://sdcorejs.github.io/sdcorejs-angular/docs/versions.json
```

Use the on-demand fetcher instead of memorized APIs:

```bash
node _refs/angular/core-docs-fetch.mjs --cwd <target-project> --list
node _refs/angular/core-docs-fetch.mjs --cwd <target-project> --print assets/STYLE-GUIDE
node _refs/angular/core-docs-fetch.mjs --cwd <target-project> --print <component-or-service-id>
```

The fetcher resolves the installed `@sdcorejs/angular` or `@sd-angular/core`
version from target project evidence, loads `versions.json`, prefers an exact
docs match, falls back to a compatible same-major docs version, and then falls
back to latest/cache when needed.

Before creating custom UI, inspect:

- `package.json`, workspace package manifests, lockfiles, and existing imports
  from `@sdcorejs/angular` or `@sd-angular/core`
- Core UI inventory and the specific component docs for likely controls
- existing project `core`, `shared`, `ui`, `design-system`, `components`,
  `libs`, `projects`, `src/app/core`, `src/app/shared`, and feature-level
  shared folders
- Storybook stories, local docs, README files, and nearby Angular usage
  patterns when present

If the remote registry or selected docs index cannot be fetched, use cached
docs when available. If neither remote docs nor cache are available, do not
invent Core UI APIs. Continue from local repository evidence and state that the
remote Core UI docs could not be checked.

## Required Planning Output

Before implementation, output a concise planning block in the user's language.
Keep identifiers, component names, selectors, routes, permissions, and file
paths in English.

Always include this block:

```text
SDCoreJS Core reuse analysis:
- Detected `@sdcorejs/angular` / `@sd-angular/core` version:
  - <version or "not detected">
- Documentation version/index used:
  - <docs version and index URL, cached version, or fallback reason>
- SDCoreJS Core components/services/utilities to reuse:
  - <items or "none found">
- Existing project components/services/utilities to reuse:
  - <items or "none found">
- Feature-specific components/services to create:
  - <items or "none">
- Components/services intentionally not reused:
  - <item + reason, or "none">
- Assumptions:
  - <only assumptions that affect implementation>
```

For visual input, also include:

```text
UI decomposition:
- SDCoreJS Core components/services/utilities to reuse:
  - ...
- Existing project components/services to reuse:
  - ...
- Feature-specific components/services to create:
  - ...
- Layout assumptions:
  - ...
- Ambiguities / assumptions:
  - ...
```

Treat visual input as an approximate UI specification unless the user explicitly
asks for pixel-perfect implementation. Extract visible page regions, hierarchy,
form groups, table columns, actions, responsive assumptions, component states,
spacing rhythm, alignment, and typography hierarchy. Do not invent hidden
behavior from an image.

For PRD/requirement input, also include:

```text
Requirement mapping:
- User-facing requirements:
  - ...
- SDCoreJS Core components/services/utilities to reuse:
  - ...
- Existing project components/services/utilities to reuse:
  - ...
- Feature-specific components/services to create:
  - ...
- Validation and state handling:
  - ...
- API/service assumptions:
  - ...
```

Extract pages, forms, fields, validations, actions, tables/lists, filters,
sorting, pagination, navigation, modals/drawers, permissions, loading/empty/error
states, success/error messages, API interactions, and analytics/tracking only
when present in the source material.

For mock API/API-contract input, also read `./mock-api-input.md` and include its
required `Mock API contract mapping` block. The PRD or acceptance criteria remain
the behavior source of truth; the API artifact supplies endpoint, request,
response, field, enum/status, paging/filter/sort, lookup, and error-state
evidence. If the API artifact is only a mock/specification and no runnable
backend/configuration is available, plan a mock-first service instead of live API
integration.

For mixed visual and PRD input, use the PRD as the source of truth for behavior
and acceptance criteria, the image as the source of truth for visual structure,
and Core UI/local project conventions as the source of truth for implementation
primitives. Also include:

```text
Image + PRD mapping:
- Behavior from PRD:
  - ...
- Visual structure from image:
  - ...
- SDCoreJS Core components/services/utilities to reuse:
  - ...
- Existing project components/services to reuse:
  - ...
- Feature-specific components/services to create:
  - ...
- Conflicts or assumptions:
  - ...
```

## Core-First Implementation Policy

Prefer reuse in this order:

1. SDCoreJS Angular Core UI component/service/utility that directly fits.
2. Existing project core/shared/design-system component, service, validator,
   pipe, directive, guard, resolver, interceptor, state utility, model, or type.
3. Feature-specific component or service that composes existing primitives into
   domain behavior.
4. Custom primitive only when Core UI and local shared assets do not fit, with a
   clear reason in the summary.

Do not create a new primitive button, input, select, dropdown, table, modal,
drawer, card, tooltip, badge, loading indicator, empty state, or error state
when Core UI or a local shared component already satisfies the need.

Create feature-specific components only when they are domain-specific,
compose multiple primitives into a feature flow, improve readability or reuse
inside the feature, and avoid incorrect coupling to unrelated features.

Match project conventions for:

- standalone components vs NgModules
- signals vs RxJS state
- reactive forms vs template-driven forms
- Angular template control-flow syntax
- SCSS, CSS utilities, Tailwind, or design tokens
- folder structure, naming conventions, and test style

## Post-Implementation UI Check

For UI-affecting Angular changes, perform a UI check before final response and
before claiming the work is complete.

Prefer a real browser/preview check when the target app can run in the current
environment. If a browser/preview is unavailable, perform a code-level UI
review and say so honestly. Do not claim visual/browser verification unless it actually happened.

Check:

- visual consistency: spacing, padding, alignment, typography hierarchy, colors,
  icons, Core UI control usage, and loading/empty/disabled/error/success states
- layout behavior: breakpoints, overflow, long text, empty data, form alignment,
  table/list behavior, modal/drawer/card spacing, and action placement
- Angular behavior: bindings, validation messages, loading/error/empty states,
  disabled states, change detection, signal/RxJS state, cleanup, and navigation
- accessibility basics: labels, keyboard access, accessible button names, focus
  handling, non-misleading ARIA, and error association when project conventions
  support it
- source consistency: no duplicated Core UI or project shared primitive, correct
  feature folder placement, local styling conventions, reused services/components,
  and no unrelated refactors

Fix obvious UI issues before continuing. If the UI check changes code, rerun the
smallest relevant verification command before final response.

## Final Response Requirements

For Angular UI work, include:

```text
Core reuse summary:
- Reused SDCoreJS/Core components:
  - ...
- Reused existing project components/services:
  - ...
- Created feature-specific components/services:
  - ...
- Reason new components/services were needed:
  - ...

UI check:
- <browser/preview check result, or code-level UI review reason>
- <notable fixes or remaining limitations>
```

Also report commands run and assumptions. Do not claim a user-guide or
technical-doc file was created unless the documentation gate approved it or the
user explicitly requested it.
