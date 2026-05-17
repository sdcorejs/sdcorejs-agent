---
name: angular-portal-init-portal
description: Use when initializing a brand-new Angular portal repo using `@sd-angular/core` baseline template. Generates project skeleton (app shell, environments, sample module, configurations). Triggers - "khởi tạo portal", "init portal", "create portal-X", "new portal repo", "tạo dự án portal mới". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Skill: Angular Portal Project Initialization

## Overview

Generates production-ready Angular portal starter from internal baseline template (`core/templates/angular-portal-starter/`).

**Output:** Complete portal with sample lib (1 module, 2 entities), dev tools, ready for `npm start`.

---

## Source of truth — Core UI package

This skill uses two placeholders wherever the Core UI package appears:

| Placeholder | Resolved from `_refs/core-version.md` field |
|---|---|
| `<CORE_UI_PACKAGE_NAME>` | `packageName` |
| `<CORE_VERSION>` | `currentVersion` |

> The actual values live ONLY in [`_refs/core-version.md`](./_refs/core-version.md). Do not duplicate them here — the drift-check hook will block any literal version or any import statement that hardcodes the Core UI package name in this file.

**BEFORE generating any file**, the agent MUST:

1. Read [`_refs/core-version.md`](./_refs/core-version.md) and extract `packageName` + `currentVersion`
2. Substitute every `<CORE_UI_PACKAGE_NAME>` / `<CORE_VERSION>` token in this skill's output with those values
3. Apply the same substitution to import statements when the package name differs from the literal shown in templates (anticipates the planned migration `@sd-angular/core` → `@sdcorejs/angular`)
4. NEVER hardcode a literal version string in generated `package.json` / commit message / verification text

Single-file bump: change `_refs/core-version.md` and every future portal picks it up. Do NOT find-replace placeholders inside this skill file itself — they are intentional.

If `_refs/core-version.md` is missing or malformed, STOP and ask the user — never guess the version or package name.

---

## When to Use

- "Tạo portal mới cho dự án HR"
- "Gen new sales portal starter"
- "Create angular-portal with CRUD module"

---

## Input Resolution

Before generating, clarify with user:

1. **Project Name** (required) — e.g. `hr-portal`, `sales-portal`
2. **Environments** (optional, defaults: `dev`, `qc`, `uat`, `prod`)
3. **Application Title** (optional, default: `Portal`)
4. **Sample Entity Names** (optional, defaults: `order`, `customer` — Order uses `<customer-select>` so the sample also demos the base-select / entity-select pattern)
5. **Additional Modules** (optional) — answer: "Use plop or the `11-init-module` skill after generation"

> **Port** is fixed at `4200` (Angular default). Do not ask.

---

## Generation Steps

### Step 1: Copy Baseline Template

**Source:** `core/templates/angular-portal-starter/`

**Render Exclusion Rule (MANDATORY):**
- Never render local AI/tooling folders into the target starter repo
- Exclude at minimum: `.claude`, `.github`, `.git`, `.vscode-test`
- Exclude `.gitkeep` placeholders in generated output, especially under `src/libs/**`
- If these folders appear in output, remove them before returning generation result

**Result:** Fresh portal project with:

```
portal-new/
├── package.json                   # <CORE_UI_PACKAGE_NAME>: <CORE_VERSION> (npm)
├── tsconfig.json                  # baseUrl + @sample paths
├── angular.json                   # build/serve configs
├── src/
│   ├── main.ts                    # Bootstrap with config providers
│   ├── app/
│   │   ├── app.component.ts       # RouterOutlet
│   │   ├── app.routes.ts          # Lazy-load layout + sample
│   │   └── configurations/        # Auth, Layout, Permission
│   └── libs/
│       └── sample/                # ONE sample lib only
│           ├── sample.configuration.ts
│           ├── sample.module.ts
│           ├── routes.ts
│           ├── configurations/    # API interceptor, upload config
│           ├── services/base/     # BaseService with CRUD
│           ├── components/        # MODULE-level reusables
│           │   ├── base-select/   # generic dropdown
│           │   └── customer-select/ # per-entity dropdown (reused by Order)
│           └── features/
│               ├── order/         # AdaptiveSplitDetail — Order form uses <customer-select>
│               └── customer/      # UnifiedCompact full-page detail
├── .prettierrc.json
├── .vscode/
└── plopfile.js                    # Optional generators
```

### Step 2: Dependency Management

Run `npm install`. See `package.json` template below — pins `<CORE_UI_PACKAGE_NAME>@<CORE_VERSION>`.

### Step 3: Build Verification

```
npm run build-dev
# Expect: exit code 0, dist/ folder produced
```

### Step 4: Dev Server

```
npm start
# Expect: server at http://localhost:4200/
```

### Step 5: Test Verification (Mandatory)

```bash
# Unit/integration
npm run test -- --watch=false

# E2E (only when project has e2e script/config)
npm run e2e
```

Report pass/fail summary and failing spec names. If E2E missing, report blocker.

---

## 3. Rules

### MUST DO ✅
- Read `_refs/core-version.md` and substitute placeholders BEFORE writing any file
- Generate starter from internal baseline `core/templates/angular-portal-starter` only
- Generate exactly ONE sample lib with TWO entities: `order` + `customer` (Order's create/update form uses `<customer-select>` — demonstrates the reusable dropdown pattern from `11-init-module`)
- Use `features/` (NOT `modules/`) at the lib level — `src/libs/<lib>/features/<entity>/`
- When applying this skill to a legacy project that already uses `modules/`, still generate new code under `features/` and recommend renaming the existing `modules/` directory
- Place sample lib's reusable dropdowns at MODULE level: `src/libs/sample/components/base-select/` + `src/libs/sample/components/customer-select/`
- Keep the layout route lazy-loaded from Core UI: `loadChildren: () => import('<CORE_UI_PACKAGE_NAME>/modules/layout').then(m => m.SdLayoutModule)`
- Permission code convention is **flexible per project, consistent within a project**:
  - Scaffold default: `<MODULE>_<ENTITY>_<ACTION>` (e.g. `SAMPLE_ORDER_LIST`)
  - Acceptable variants: `<MODULE>_C_<ENTITY>_<ACTION>` (e.g. `SAMPLE_C_ORDER_LIST`), `<MODULE>_<ENTITY>:<ACTION>`, etc.
  - REQUIREMENT: Module → Entity → Action order, large-to-small, AND a single convention across the whole portal. Never mix two conventions in one project.
  - When applying to an existing project, detect the established convention and follow it
- Permission Configuration in starter MUST default to `disabled = true` so the portal boots without a permission backend
- Add a final double-check report covering: routes, provider wiring, environment scripts, unresolved imports

### MUST NOT ❌
- Do not hard-code fixed home/about restrictions; starter may include a customizable `src/app/pages/home` and wire `LayoutConfiguration.homeUrl`
- Do not skip `src/libs/sample` in starter generation
- Do not skip seeding 2 sample entities (`order`, `customer`)
- Do not use local tarball dependency style (`file:sd-angular-core-*.tgz`)
- Do not leave broken path aliases to removed libs in `tsconfig.json`
- Do not generate a starter that requires backend auth, permissions, or APIs to boot locally
- Do not replace `<CORE_UI_PACKAGE_NAME>` with ad-hoc local components
- Do not hard-code environment names different from the developer request
- Do not place `SD_PERMISSION_CONFIGURATION` / `SD_UPLOAD_FILE_CONFIGURATION` in module or route providers with `multi: true` and expect root services to consume them
- Do not enable permission checks by default (`disabled = true`) when permission backend/data source is not ready
- Do not mix two permission-code conventions in the same project

---

## 4. Template

### Preconditions
```text
Required before applying this skill:
- internal baseline templates exist in `core/templates/angular-portal-starter`
- developer confirmed project name
- developer confirmed environment names
- developer confirmed starter should include sample scaffold under `src/libs/sample`
- _refs/core-version.md is present (packageName + currentVersion)
```

### Clarification Questions
```text
Ask the developer:
1. Tên project portal mới là gì? (vd: portal-ops)
2. Cần các môi trường nào? Mặc định: dev, qc, uat, prod
3. Tiêu đề portal/sidebar mặc định là gì?
4. Giữ 2 entity mẫu mặc định (`order`, `customer`) hay đổi tên?
```

### Expected Starter Structure
```text
[project-name]/
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.spec.json
├── eslint.config.js
├── plopfile.js
├── public/
│   └── silent-renew.html
├── src/
│   ├── index.html
│   ├── main.ts
│   ├── styles.scss
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   ├── components/
│   │   │   └── main/
│   │   │       ├── main.component.ts
│   │   │       └── main.component.html
│   │   └── configurations/
│   │       ├── auth.configuration.ts
│   │       ├── layout.configuration.ts
│   │       ├── permission.configuration.ts
│   │       └── index.ts
│   └── environments/
│       ├── environment.model.ts
│       ├── environment.ts
│       ├── environment.dev.ts
│       ├── environment.qc.ts
│       ├── environment.uat.ts
│       └── environment.prod.ts
└── src/libs/
    └── sample/
        ├── sample.configuration.ts
        ├── sample.module.ts
        ├── routes.ts
        ├── index.ts
        ├── configurations/
        │   ├── api.configuration.ts
        │   └── upload-file.configuration.ts
        ├── services/
        │   └── base/
        │       └── base.service.ts
        ├── components/
        │   ├── base-select/
        │   │   ├── base-select.component.ts
        │   │   └── base-select.component.html
        │   └── customer-select/
        │       └── customer-select.component.ts
        └── features/
            ├── order/
            │   ├── routes.ts
            │   ├── services/
            │   │   ├── order.model.ts
            │   │   └── order.service.ts
            │   └── pages/
            │       ├── list/list.component.ts
            │       └── detail/detail.component.ts
            └── customer/
                ├── routes.ts
                ├── services/
                │   ├── customer.model.ts
                │   └── customer.service.ts
                └── pages/
                    ├── list/list.component.ts
                    └── detail/detail.component.ts
```

### package.json Template
```json
{
  "name": "[project-name]",
  "scripts": {
    "start": "ng serve --port 4200",
    "test": "ng test",
    "build": "ng build --configuration=dev",
    "build-dev": "ng build --configuration=dev",
    "build-qc": "ng build --configuration=qc",
    "build-uat": "ng build --configuration=uat",
    "build-prod": "ng build --configuration=prod",
    "plop:module": "npx plop module",
    "plop:entity": "npx plop entity"
  },
  "dependencies": {
    "<CORE_UI_PACKAGE_NAME>": "<CORE_VERSION>",
    "@angular/animations": "^20.3.18",
    "@angular/common": "^20.3.18",
    "@angular/compiler": "^20.3.18",
    "@angular/core": "^20.3.18",
    "@angular/forms": "^20.3.18",
    "@angular/platform-browser": "^20.3.18",
    "@angular/router": "^20.3.18",
    "rxjs": "^7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "^0.15.0"
  },
  "devDependencies": {
    "@angular/build": "^20.3.18",
    "@angular/cli": "^20.3.18",
    "@angular/compiler-cli": "^20.3.18",
    "prettier": "latest",
    "plop": "4.0.1",
    "typescript": "~5.6.0"
  }
}
```

### app.routes.ts Template
```typescript
import { Routes } from '@angular/router';
import { SdAuthGuard, SdPermissionGuard, SdPortalGuard } from '<CORE_UI_PACKAGE_NAME>/modules';

import { MainComponent } from './components/main/main.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'sample/order',
    pathMatch: 'full',
  },
  {
    path: '',
    component: MainComponent,
    canActivate: [SdAuthGuard, SdPermissionGuard],
    canActivateChild: [SdPermissionGuard],
    children: [
      {
        path: '',
        canActivate: [SdPortalGuard],
        children: [
          {
            // Layout shell (sidebar, breadcrumb, not-found, etc.) ships inside
            // <CORE_UI_PACKAGE_NAME>/modules/layout — lazy-loaded so the bundle
            // only pulls it when needed.
            path: 'layout',
            loadChildren: () => import('<CORE_UI_PACKAGE_NAME>/modules/layout').then(m => m.SdLayoutModule),
          },
          {
            // Sample lib — providers are wired at root via SampleModule.useValue(...)
            // in main.ts, so the route itself carries no providers array.
            path: 'sample',
            loadChildren: () => import('../libs/sample/routes').then(m => m.routes),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'layout/not-found',
    pathMatch: 'full',
  },
];
```

### main.ts Template
```typescript
import { importProvidersFrom } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';

// ─── Why each Core UI import is needed at root ─────────────────────────
// SD_CORE_CONFIGURATION → license key + global Core UI settings (REQUIRED)
import { SD_CORE_CONFIGURATION } from '<CORE_UI_PACKAGE_NAME>/configurations';
// SD_AUTH_CONFIGURATION       → auth-guard hooks (signout / change-password / portal-info)
// SD_LAYOUT_CONFIGURATION     → sidebar menu / breadcrumb / portal branding
// SD_PERMISSION_CONFIGURATION → multi:true; each module registers its own key
import {
  SD_AUTH_CONFIGURATION,
  SD_LAYOUT_CONFIGURATION,
  SD_PERMISSION_CONFIGURATION,
} from '<CORE_UI_PACKAGE_NAME>/modules';
// SdApiModule → registers the global SdApiService that BaseService.register(...)
// inside every feature lib depends on. Must be imported once at root.
import { SdApiModule } from '<CORE_UI_PACKAGE_NAME>/services';

// Optional — uncomment ONLY when this portal uses Keycloak SSO.
// For custom auth, omit this import and provide your own interceptor.
// import { SdKeycloakInterceptor } from '<CORE_UI_PACKAGE_NAME>/modules';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { AuthConfiguration, LayoutConfiguration, PermissionConfiguration } from './app/configurations';
import { SampleModule } from '@sample';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    // Router — input binding + reload on same-URL navigation (refresh action on list pages).
    provideRouter(routes, withComponentInputBinding(), withRouterConfig({ onSameUrlNavigation: 'reload' })),

    // HTTP client — Keycloak interceptor is OPTIONAL.
    // - Keycloak SSO: provideHttpClient(withInterceptors([SdKeycloakInterceptor]))
    // - Custom auth: provideHttpClient() and provide your own interceptor via
    //   the HTTP_INTERCEPTORS multi-token OR withInterceptors([myAuthFn]).
    provideHttpClient(/* withInterceptors([SdKeycloakInterceptor]) */),

    // Feature libraries — each `useValue` / `useClass` static wires the
    // module's configuration token + API/upload interceptors at root injector.
    // Convention: `environment.<module>BackendUrl` per module (decide in
    // environment.*.ts whether they share or split URLs).
    importProvidersFrom(
      SdApiModule,
      SampleModule.useValue({ host: environment.sampleBackendUrl }),
    ),

    // SD_CORE_CONFIGURATION — license key for licensed Core UI features
    // (SdTable Pro, etc.). Without this, licensed components throw at runtime.
    // The key is per-portal — replace before deploying.
    {
      provide: SD_CORE_CONFIGURATION,
      useValue: {
        licenseKey: '<your-license-key>',
      },
    },

    // SD_AUTH_CONFIGURATION — class implements ISdAuthConfiguration:
    //   { guard: { auth, portal }, action: { signout, changePassword } }
    // The class shape decides HOW auth works; the token is the contract.
    { provide: SD_AUTH_CONFIGURATION, useClass: AuthConfiguration },

    // SD_LAYOUT_CONFIGURATION — sidebar items + branding + home URL.
    { provide: SD_LAYOUT_CONFIGURATION, useClass: LayoutConfiguration },

    // SD_PERMISSION_CONFIGURATION (multi:true) — each module can register
    // its own configuration under a `key`; the root SdPermissionService
    // merges all registrations. Route data uses `permissionKey` to look up
    // the right configuration set when checking access.
    { provide: SD_PERMISSION_CONFIGURATION, useClass: PermissionConfiguration, multi: true },

    // SD_TABLE_CONFIGURATION (OPTIONAL) — override default SdTable behavior
    // portal-wide (page size, density, etc.). Skip if defaults are fine.
    // { provide: SD_TABLE_CONFIGURATION, useValue: { defaultPageSize: 20 } },
  ],
}).catch(err => console.error(err));
```

### permission.configuration.ts (Starter Default — disabled)
```typescript
import { Injectable } from '@angular/core';
import { ISdPermissionConfiguration } from '<CORE_UI_PACKAGE_NAME>/modules';

@Injectable()
export class PermissionConfiguration implements ISdPermissionConfiguration {
  // Starter ships with permissions disabled so the portal boots without a
  // permission backend. Flip to `false` (and implement `loadPermissions`)
  // once the backend endpoint is wired up.
  disabled = true;

  loadPermissions = async () => [];

  onForbiden = () => {
    // noop in starter skeleton
  };
}
```

### sample/routes.ts Template
```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'order',
    pathMatch: 'full',
  },
  {
    path: 'order',
    loadChildren: () => import('./features/order/routes').then(m => m.routes),
  },
  {
    path: 'customer',
    loadChildren: () => import('./features/customer/routes').then(m => m.routes),
  },
];
```

### Verification Steps
```text
After generation:
1. Confirm package name, Angular project name, and output path match developer request
2. Confirm starter is generated from `core/templates/angular-portal-starter` without workspace-external dependencies
3. Confirm `tsconfig.json` has no unnecessary `compilerOptions.baseUrl` (or document why it is needed)
4. Run npm install
5. Run npm start
6. Open /sample/order and /sample/customer routes
7. Open Order detail and verify the <customer-select> dropdown lists customers
8. If build config exists, run npm run build-dev
9. Run starter unit tests (at minimum route/bootstrap smoke specs)
```

---

## Validation Checklist (apply at end of generation)

- [ ] `_refs/core-version.md` read; placeholders substituted (no literal version/package string left in generated files)
- [ ] `package.json` pins `<CORE_UI_PACKAGE_NAME>@<CORE_VERSION>` (npm, not tgz)
- [ ] `tsconfig.json` has `"baseUrl": "./"` + `"@sample": ["./src/libs/sample"]` + `"@sample/*": ["./src/libs/sample/*"]`
- [ ] `app.routes.ts` lazy-loads sample lib + Core UI layout
- [ ] `SampleModule.useValue({ host: environment.sampleBackendUrl })` wired at root in `main.ts` (no route-level providers)
- [ ] Sample lib has 2 entities under `src/libs/sample/features/`:
  - [ ] `order/` — Order list + detail; detail form contains `<customer-select>` referencing the `customer` entity
  - [ ] `customer/` — Customer list + detail
- [ ] Module-level reusables generated:
  - [ ] `src/libs/sample/components/base-select/`
  - [ ] `src/libs/sample/components/customer-select/`
- [ ] Permission code convention is consistent across the generated portal (single style)
- [ ] `PermissionConfiguration.disabled = true` in starter
- [ ] `npm install` succeeds
- [ ] `npm run build-dev` exits 0
- [ ] `npm start` serves at `http://localhost:4200/`
- [ ] Order list renders; create flow opens with `<customer-select>` populated
- [ ] Prettier formats code on save
- [ ] `.vscode` extensions recommended

---

## 5. Example Input

```text
Khoi tao du an portal-starter-moi co cac moi truong dev, qc, uat va prod.
Can include sample scaffold de demo module + entity-select pattern.
Tich hop san <CORE_UI_PACKAGE_NAME>.
Tao src/libs/sample va seed 2 entity order, customer (Order su dung customer-select).
```

## 6. Example Output

### Agent Decision
```text
Use internal baseline under core/templates/angular-portal-starter as source.
Create project portal-starter-moi.
Keep app shell, core configuration, environments, and plop generator files.
Generate src/libs/sample scaffold with:
  - components/base-select (generic dropdown)
  - components/customer-select (per-entity dropdown)
  - features/order (uses <customer-select> in detail form)
  - features/customer
Pin <CORE_UI_PACKAGE_NAME> to npm version <CORE_VERSION> via _refs/core-version.md (no local tgz).
Ship PermissionConfiguration with disabled=true so the portal boots without a permission backend.
Then run npm install and npm start to verify the starter boots.
```

### Files Generated/Updated
```text
[project-name]/package.json
[project-name]/angular.json
[project-name]/tsconfig.json
[project-name]/src/main.ts
[project-name]/src/app/app.routes.ts
[project-name]/src/app/components/main/main.component.ts
[project-name]/src/app/components/main/main.component.html
[project-name]/src/app/configurations/auth.configuration.ts
[project-name]/src/app/configurations/layout.configuration.ts
[project-name]/src/app/configurations/permission.configuration.ts
[project-name]/src/libs/sample/sample.configuration.ts
[project-name]/src/libs/sample/sample.module.ts
[project-name]/src/libs/sample/routes.ts
[project-name]/src/libs/sample/components/base-select/base-select.component.ts
[project-name]/src/libs/sample/components/base-select/base-select.component.html
[project-name]/src/libs/sample/components/customer-select/customer-select.component.ts
[project-name]/src/libs/sample/features/order/routes.ts
[project-name]/src/libs/sample/features/order/services/order.service.ts
[project-name]/src/libs/sample/features/order/services/order.model.ts
[project-name]/src/libs/sample/features/customer/routes.ts
[project-name]/src/libs/sample/features/customer/services/customer.service.ts
[project-name]/src/libs/sample/features/customer/services/customer.model.ts
[project-name]/src/environments/environment.dev.ts
[project-name]/src/environments/environment.qc.ts
[project-name]/src/environments/environment.uat.ts
[project-name]/src/environments/environment.prod.ts
```
