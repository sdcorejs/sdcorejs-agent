---
name: angular-portal-init-module
description: Use when creating a new feature module inside an existing portal (configuration, routes, guards, interceptor, optional permission/upload configs). Triggers - "tạo module X", "create module", "thêm module", "add feature module", "init module". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Angular Skill: Feature Module Configuration

## 1. Skill Name
**Feature Module Configuration Setup**

## 2. Description
Generates the complete feature module configuration including route setup, module-level interceptors, guards, and configuration providers following sdcorejs patterns. This is the foundation that ties all entities together.

In a brand-new portal repo, this skill is the first generation step whenever the target module does not exist yet.

Default mode is standalone-first, but this skill can generate hybrid-compatible structure when the target application still uses NgModule with standalone components.

### Required vs Optional

| File | Required | Notes |
|---|---|---|
| `[module].configuration.ts` | ✅ Always | Token + interface |
| `[module].module.ts` | ✅ Always | `@NgModule` + `useClass()` / `useValue()` statics — primary public API |
| `configurations/api.configuration.ts` | ✅ Always | Request/error interceptors |
| `guards/[module].guard.ts` | ✅ Always | Route protection |
| `routes.ts` | ✅ Always | Guards + lazy-load entity children. NO providers. File naming convention: `routes.ts` at lib/module root (e.g. `libs/agency/routes.ts`); entity-level routes use `<entity>.routing.ts` (e.g. `libs/agency/features/booking/booking.routing.ts`). Don't mix — `<module>.routing.ts` at lib root is acceptable only in legacy projects. |
| `configurations/permission.configuration.ts` | ⚙️ Optional | Only when module has its own permission domain |
| `configurations/upload-file.configuration.ts` | ⚙️ Optional | Only when module entities use file upload |
| `components/base-select/base-select.component.ts` + `.html` | ✅ Always | Generic dropdown wrapping `sd-select` + `BaseService` search/all. Reused by every `<entity>-select` in this module. One copy per module. |

When generating a new module, ask the developer:
```
1. Does this module have its own permission domain? (add permission.configuration.ts)
2. Do any entities in this module use file upload? (add upload-file.configuration.ts)
If unsure, skip both and generate minimal module first.
```

## 3. Rules

### MUST DO ✅
- Apply this skill before entity CRUD when the module does not exist
- Generate `[module].module.ts` as the primary public API (exposes `useClass()` + `useValue()` statics)
- Put ALL module-scoped providers (`SD_API_CONFIGURATION`, `SD_UPLOAD_FILE_CONFIGURATION`, custom interceptors, etc.) on `@NgModule({ providers: [...] })` — NOT on the route
- Create `routes.ts` at lib root with guards + `loadChildren` only (no `providers` array)
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
- Generate module unit tests (`routes.spec.ts`, `guard.spec.ts`, and configuration smoke spec) in the same pass
- If project is hybrid NgModule + standalone, generate compatibility wiring without forcing full migration
- Run a post-generation double-check: token wiring, provider scope, route key consistency, and unresolved imports
- Run tests immediately after module generation and report result:
  - preferred: `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts`
  - fallback: `npm run test -- --watch=false`
  - include pass/fail summary and failing spec names
- Keep output token-efficient:
  - load this skill file only after request intake confirms module init is needed
  - reuse existing templates and avoid regenerating unchanged boilerplate explanations

### MUST NOT ❌
- Put `providers: [...]` on the route — that creates a lazy-bound injector invisible to root-scoped services like `SdPermissionService`. Use `[Module]Module` instead.
- Provide `[MODULE]_CONFIGURATION` directly in `main.ts` providers — go through `[Module]Module.useValue({...})` so the consumer pattern stays consistent
- Force migration to pure standalone when developer did not request migration and existing codebase is hybrid
- Hardcode API URLs (inject via configuration)
- Skip error handling in interceptors
- Use global interceptors (module-scoped only via `multi: true` on `SD_API_CONFIGURATION`)
- Assume route-level providers are visible to root-scoped services — they are not
- Generate `permission.configuration.ts` or `upload-file.configuration.ts` without confirmation that the module needs them
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

All file-content templates referenced by Section 2 (Required vs Optional) live in [`_refs/templates/init-module-templates.md`](./_refs/templates/init-module-templates.md). Read it when materializing each file:

| File to generate | Section in templates ref |
|---|---|
| `[module].configuration.ts` (token + interface) | [`#moduleconfigurationts`](./_refs/templates/init-module-templates.md#moduleconfigurationts) |
| `configurations/api.configuration.ts` (interceptor) | [`#configurationsapiconfigurationts`](./_refs/templates/init-module-templates.md#configurationsapiconfigurationts) |
| `configurations/upload-file.configuration.ts` (optional) | [`#configurationsupload-fileconfigurationts-optional`](./_refs/templates/init-module-templates.md#configurationsupload-fileconfigurationts-optional) |
| `guards/[module].guard.ts` | [`#guardsmoduleguardts`](./_refs/templates/init-module-templates.md#guardsmoduleguardts) |
| `[module].module.ts` (primary public API) | [`#modulemodulets-canonical--exposes-the-lib`](./_refs/templates/init-module-templates.md#modulemodulets-canonical--exposes-the-lib) |
| `routes.ts` (lib root — guards + lazy children, NO providers) | [`#routests-lib-root--guards--lazy-children-only`](./_refs/templates/init-module-templates.md#routests-lib-root--guards--lazy-children-only) |
| `main.ts` wiring (standalone bootstrap) | [`#maints-standalone-bootstrap`](./_refs/templates/init-module-templates.md#maints-standalone-bootstrap) |
| Legacy NgModule consumer (hybrid apps) | [`#legacy-ngmodule-consumer-when-the-app-shell-is-still-ngmodule-based`](./_refs/templates/init-module-templates.md#legacy-ngmodule-consumer-when-the-app-shell-is-still-ngmodule-based) |
| `permission.configuration.ts` (keyed, optional) | [`#permissionconfigurationts-keyed`](./_refs/templates/init-module-templates.md#permissionconfigurationts-keyed) |
| `components/base-select/base-select.component.ts` (load-bearing — preserve inline rationale verbatim) | [`#componentsbase-selectbase-selectcomponentts`](./_refs/templates/init-module-templates.md#componentsbase-selectbase-selectcomponentts) |
| `components/base-select/base-select.component.html` | [`#componentsbase-selectbase-selectcomponenthtml`](./_refs/templates/init-module-templates.md#componentsbase-selectbase-selectcomponenthtml) |
| Route data contract (`data: { permission, permissionKey }`) | [`#route-data-contract-permission`](./_refs/templates/init-module-templates.md#route-data-contract-permission) |
| `index.ts` (lib barrel) | [`#indexts-lib-barrel`](./_refs/templates/init-module-templates.md#indexts-lib-barrel) |

Resolve `<CORE_UI_PACKAGE_NAME>` from `_refs/core-version.md` before materializing any of these files.

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
  This is what wires `[MODULE]_CONFIGURATION` + interceptors + upload config into the app's root injector — the routes file knows nothing about providers.

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
