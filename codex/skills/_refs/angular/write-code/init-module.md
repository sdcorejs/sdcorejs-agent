> **Reference for the `sdcorejs-angular` orchestrator.** Loaded on demand when the
> confirmed plan includes creating a new feature module. Not a standalone skill — the
> orchestrator reads this file when its dispatch table routes a step here.

# Init Module — Feature Module Configuration

## Contents

- [Reference Name](#1-reference-name)
- [Description](#2-description)
- [Rules](#3-rules)
- [Templates](#4-templates)
- [Example Input](#5-example-input)
- [Integration Points](#integration-points)
- [Post-init Summary](#post-init--refresh-the-project-summary)

## 1. Reference Name
**Feature Module Configuration Setup**

## 2. Description
Generates the complete feature module configuration including route setup, module-level interceptors, guards, and configuration providers following sdcorejs patterns. This is the foundation that ties all entities together.

In a brand-new portal repo, this is the first generation step whenever the target module does not exist yet.

Default mode is standalone-first, but this reference can generate hybrid-compatible structure when the target application still uses NgModule with standalone components.

For PO/BA prototype mode, generate route and menu wiring that makes the module
demoable immediately. Prefer a simple module path such as `/claims` or
`/contract-management`, add sidebar/menu metadata using the target project's
existing convention, and keep permission metadata future-ready while allowing
prototype navigation when permission data is missing.

### Required vs Optional

| File | Required | Notes |
|---|---|---|
| `[module].configuration.ts` | ✅ Always | Token + interface |
| `[module].module.ts` | ✅ Always | `@NgModule` + `useClass()` / `useValue()` statics — primary public API |
| `configurations/api.configuration.ts` | ✅ Always | Request/error interceptors |
| `guards/[module].guard.ts` | ✅ Always | Route protection |
| `routes.ts` | ✅ Always | Guards + lazy-load entity children. Detect the feature root and entity-route naming convention from nearby code; use `features/` only as a labeled greenfield fallback. Keep module configuration/interceptor providers off this lib-root route; approved entity services/facades may be registered on their entity feature route. |
| `configurations/permission.configuration.ts` | ⚙️ Optional | Only when module has its own permission domain |
| `configurations/upload-file.configuration.ts` | ⚙️ Optional | Only when module entities use file upload |
| `components/base-select/base-select.component.ts` + `.html` | ⚙️ Conditional | Generate only when a confirmed feature needs searchable/remote selection, no compatible Core UI/project/module component exists, multiple consumers share a stable loading/search contract, and the abstraction has a consumer in this change. |

When generating a new module, ask the developer:
```
1. Does this module have its own permission domain? (add permission.configuration.ts)
2. Do any entities in this module use file upload? (add upload-file.configuration.ts)
3. Does the approved frontend architecture require a shared searchable/remote
   select contract after Core UI and project-local reuse discovery? If not, do
   not generate base-select.
If unsure, skip optional files and generate the minimal module first.
```

## 3. Rules

### MUST DO ✅
- Apply this reference before entity CRUD when the module does not exist
- Generate `[module].module.ts` as the primary public API (exposes `useClass()` + `useValue()` statics)
- Put all module configuration/interceptor providers (`SD_API_CONFIGURATION`,
  `SD_UPLOAD_FILE_CONFIGURATION`, custom interceptors, etc.) on
  `@NgModule({ providers: [...] })`, not on the lib-root route
- Create `routes.ts` at lib root with guards + `loadChildren`; entity feature
  routes may register approved feature-scoped services/facades
- Wire the lib at app root via `importProvidersFrom([Module]Module.useValue({...}))` in `main.ts` (or `imports: [[Module]Module.useValue(...)]` for legacy NgModule consumers)
- Do not modify global CSS/SCSS while creating module structure/configuration
- If `SD_PERMISSION_CONFIGURATION` is opted in: keep it at app root injector (`main.ts`) so root-scoped `SdPermissionService` receives full configuration set immediately
- If `SD_UPLOAD_FILE_CONFIGURATION` is opted in: keep it at app root injector (`main.ts`) so root-scoped upload consumers can resolve all keyed configurations
- Define unique `key` for each permission configuration when multiple permission domains exist
- Define unique `key` for each upload-file configuration when multiple module domains exist
- Ensure module routes set `data.permissionKey` to match the configuration `key`
- Define module configuration interface with `InjectionToken`
- If entity services use `providedIn: 'root'`, also provide `[MODULE]_CONFIGURATION` at app root bootstrap (`main.ts`)
- Implement `ApiConfiguration` class for request/response interceptors
- Use `canActivate` guards on root route
- Create `api.configuration.ts` for interceptor logic
- Create `[module].configuration.ts` for interface definition
- Lazy load all child entities with `loadChildren()`
- Export routes as `const [module]Routes: Routes = [...]`
- Support `skeleton module` generation when business details are missing: generate minimum routes/config/guard/index/spec scaffolding first
- Complete `_refs/shared/frontend-architecture.md` before generating any
  module-level UI abstraction
- For a select need, record `reuse`, `extend`, `wrap`,
  `create_feature_local`, `create_shared`, or `keep_inline` with the exact
  candidate path and compatibility reason
- Generate module-level `base-select` only when all of these are true:
  - a confirmed feature in this change needs searchable or remote selection;
  - no compatible Core UI, project-shared, or existing module component fits;
  - at least two selects share a stable loading/search contract, or equivalent
    project evidence proves the abstraction stable;
  - the new base select has an actual consumer in the same change
- Otherwise reuse the existing select, create a domain-specific feature-local
  selector, or generate no wrapper
- Keep module internals private. Add only symbols with verified external
  consumers to `index.ts`/`public-api.ts`; do not use broad export-all entries
  for components, providers, or implementation collaborators
- Generate module unit tests (`routes.spec.ts`, `guard.spec.ts`, and configuration smoke spec) in the same pass
- If project is hybrid NgModule + standalone, generate compatibility wiring without forcing full migration
- Run a post-generation double-check: token wiring, provider scope, route key consistency, and unresolved imports
- Run tests immediately after module generation and report result:
  - preferred: `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts`
  - fallback: `npm run test -- --watch=false`
  - include pass/fail summary and failing spec names
- Keep output token-efficient:
  - load this reference file only after request intake confirms module init is needed
  - reuse existing templates and avoid regenerating unchanged boilerplate explanations

### MUST NOT ❌
- Put module configuration/interceptor tokens in a route provider array. Use
  `[Module]Module` for those root-visible contracts; this does not prohibit an
  approved entity service/facade on its entity feature route.
- Provide `[MODULE]_CONFIGURATION` directly in `main.ts` providers — go through `[Module]Module.useValue({...})` so the consumer pattern stays consistent
- Force migration to pure standalone when developer did not request migration and existing codebase is hybrid
- Hardcode API URLs (inject via configuration)
- Skip error handling in interceptors
- Use global interceptors (module-scoped only via `multi: true` on `SD_API_CONFIGURATION`)
- Assume entity feature-route providers are visible to root-scoped services —
  they are not
- Generate `permission.configuration.ts` or `upload-file.configuration.ts` without confirmation that the module needs them
- Generate `components/base-select/` speculatively, duplicate an existing
  compatible select, create it without a same-change consumer, or create a
  generic wrapper merely for possible future reuse
- Export feature-private components/services through the module public barrel
  or introduce cross-feature deep imports/circular barrel dependencies
- Do not provide `SD_PERMISSION_CONFIGURATION` at module route level when using root-scoped `SdPermissionService`
- Do not provide `SD_UPLOAD_FILE_CONFIGURATION` at module route level when using root-scoped upload configuration resolution
- Do not mark module-local permission providers as `multi: true` and expect root `SdPermissionService` to auto-merge them
- Do not mark module-local upload providers as `multi: true` and expect root consumers to auto-merge them
- Do not reuse the same permission `key` across different configurations
- Do not reuse the same upload `key` across different configurations
- Do not mix route `data.permissionKey='A'` with configuration `key='B'`
- Do not mark module init complete before test command has been executed (unless environment blocker is reported)

## 4. Templates

### Hybrid Compatibility Note
```text
If target codebase uses NgModule root/module wiring:
- keep existing NgModule bootstrap/module boundaries intact
- generate standalone components/routes that can be imported or lazy-loaded from NgModule routes
- avoid breaking changes in app bootstrap path unless developer asks for migration
```

### Code templates

All file-content templates referenced by Section 2 (Required vs Optional) live in [`_refs/angular/templates/init-module-templates.md`](_refs/angular/templates/init-module-templates.md). Read it when materializing each file:

| File to generate | Section in templates ref |
|---|---|
| `[module].configuration.ts` (token + interface) | [`#moduleconfigurationts`](_refs/angular/templates/init-module-templates.md#moduleconfigurationts) |
| `configurations/api.configuration.ts` (interceptor) | [`#configurationsapiconfigurationts`](_refs/angular/templates/init-module-templates.md#configurationsapiconfigurationts) |
| `configurations/upload-file.configuration.ts` (optional) | [`#configurationsupload-fileconfigurationts-optional`](_refs/angular/templates/init-module-templates.md#configurationsupload-fileconfigurationts-optional) |
| `guards/[module].guard.ts` | [`#guardsmoduleguardts`](_refs/angular/templates/init-module-templates.md#guardsmoduleguardts) |
| `[module].module.ts` (primary public API) | [`#modulemodulets-canonical--exposes-the-lib`](_refs/angular/templates/init-module-templates.md#modulemodulets-canonical--exposes-the-lib) |
| `routes.ts` (lib root — guards + lazy children; no module configuration providers) | [`#routests-lib-root--guards--lazy-children-only`](_refs/angular/templates/init-module-templates.md#routests-lib-root--guards--lazy-children-only) |
| `main.ts` wiring (standalone bootstrap) | [`#maints-standalone-bootstrap`](_refs/angular/templates/init-module-templates.md#maints-standalone-bootstrap) |
| Legacy NgModule consumer (hybrid apps) | [`#legacy-ngmodule-consumer-when-the-app-shell-is-still-ngmodule-based`](_refs/angular/templates/init-module-templates.md#legacy-ngmodule-consumer-when-the-app-shell-is-still-ngmodule-based) |
| `permission.configuration.ts` (keyed, optional) | [`#permissionconfigurationts-keyed`](_refs/angular/templates/init-module-templates.md#permissionconfigurationts-keyed) |
| `components/base-select/base-select.component.ts` (conditional; materialize only after the gate above passes) | [`#componentsbase-selectbase-selectcomponentts-conditional`](_refs/angular/templates/init-module-templates.md#componentsbase-selectbase-selectcomponentts-conditional) |
| `components/base-select/base-select.component.html` (conditional companion) | [`#componentsbase-selectbase-selectcomponenthtml-conditional`](_refs/angular/templates/init-module-templates.md#componentsbase-selectbase-selectcomponenthtml-conditional) |
| Route data contract (`data: { permission, permissionKey }`) | [`#route-data-contract-permission`](_refs/angular/templates/init-module-templates.md#route-data-contract-permission) |
| `index.ts` (lib barrel) | [`#indexts-lib-barrel`](_refs/angular/templates/init-module-templates.md#indexts-lib-barrel) |

Resolve `<CORE_UI_PACKAGE_NAME>` from `_refs/angular/core-version.md` before materializing any of these files.

## 5. Example Input

```
Set up feature module "Sample" with:
- API host: http://localhost:3000/api/v1/sample
- Will contain: Order, Customer entities (Order form uses <customer-select>)
- Error handling: Show notification on API errors
- File upload support with 10MB limit
```

### Example Input for a new portal repo

```text
Create Product CRUD screens, but there is no module yet.

Expected agent decision:
1. Ask which module should own Product.
2. If user has no module yet, create module "catalog" or user-approved module first.
3. Then continue with entity CRUD generation inside that module.
```

---

## Integration Points

- Register lib's child routes in root `app.routes.ts`:
  ```typescript
  export const routes: Routes = [
    // ... other routes
    {
      path: '[module]',
      loadChildren: () => import('@[module]').then(m => m.[module]Routes),
    },
  ];
  ```
- Bootstrap the lib in `main.ts`:
  ```typescript
  importProvidersFrom([Module]Module.useValue({ host: environment.[module]BackendUrl }))
  ```
  This wires `[MODULE]_CONFIGURATION` + interceptors + upload config into the
  app's root injector. The lib-root route does not provide those contracts;
  entity feature routes may still own approved feature-scoped services/facades.

## Post-init — refresh the project summary

A new module is an architecture-level change. The sequential workflow or
integration owner may refresh summary v2 after validation, updating only the
invalidated module/route/navigation sections and fingerprints. Workers do not
edit summary. If ownership or safe fingerprint evidence is unavailable, leave
the summary partially stale and let callers use targeted reads.
