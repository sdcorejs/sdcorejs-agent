---
name: angular-portal-init-portal
description: Use when initializing a brand-new Angular portal repo using `@sd-angular/core` baseline template. Generates project skeleton (app shell, environments, sample module, configurations). Triggers - "khởi tạo portal", "init portal", "create portal-X", "new portal repo", "tạo dự án portal mới". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Skill: Angular Portal Project Initialization

## Overview

Generates production-ready Angular portal starter from internal baseline template (`sdcorejs-agent/core/templates/angular-portal-starter/`).

**Output:** Complete portal with sample module, seeded entities, dev tools, ready for `npm start`.

**Status:** ✅ **IMPLEMENTED & TESTED**

---

## When to Use

- "Tạo portal mới cho dự án HR"
- "Gen new sales portal starter"
- "Create angular-portal with employee/product crud"

---

## Input Resolution

Before generating, clarify with user:

1. **Project Name** (required)
   - Example: "hr-portal", "sales-portal"
   - Used for: directory name, project config

2. **Environments** (optional, defaults: dev, qc, uat, prod)
   - Example: "dev, staging, prod"
   - Generates matching build scripts in package.json

3. **Application Title** (optional, defaults: "Portal")
   - Used in: browser title, sidebar branding

4. **Sample Entity Names** (optional, defaults: employee, product)
   - Customize seed entities or keep defaults

5. **Additional Modules** (optional)
   - Add more modules beyond sample?
   - Answer: "Use plop after generation"

---

## Generation Steps

### Step 1: Copy Baseline Template

**Source:** `core/templates/angular-portal-starter/`

**Render Exclusion Rule (MANDATORY):**
- Never render local AI/tooling folders into the target starter repo.
- Exclude at minimum: `.claude`, `.github`, `.git`, `.vscode-test`.
- Exclude `.gitkeep` placeholders in generated output, especially under `src/libs/**`.
- If these folders appear in output, remove them before returning generation result.

**Result:** Fresh portal project with:

```
portal-new/
├── package.json                   # @sd-angular/core: 19.0.0-beta.73 (npm)
├── tsconfig.json                  # baseUrl + @sample paths
├── angular.json                   # build/serve configs
├── src/
│   ├── main.ts                    # Bootstrap with config providers
│   ├── app/
│   │   ├── app.component.ts       # RouterOutlet
│   │   ├── app.routes.ts          # Lazy-load sample module
│   │   └── configurations/        # Auth, Layout, Permission, Sample
│   └── libs/
│       └── sample/
│           ├── routes.ts          # Employee + Product + Department routes
│           ├── configurations/    # API interceptor, upload config
│           ├── services/base/     # BaseService with CRUD
│           └── modules/
│               ├── employee/      # UnifiedCompact: full-page detail (same layout CREATE/UPDATE/DETAIL)
│               ├── product/       # Side-drawer: CRUD embedded in list, no sub-routes
│               └── department/    # AdaptiveSplitDetail: DETAIL = read-only sections, CREATE/UPDATE = editable form
├── .prettierrc.json               # Code formatting
├── .vscode/                       # IDE settings
└── plopfile.js                    # Optional generators
```

### Step 2: Dependency Management

**package.json Requirements:**
- ✅ `@sd-angular/core@19.0.0-beta.73` (npm registry version, NOT tgz)
- Source of truth: `skills/angular-portal/core-version.md`
- ✅ `@angular/core@20.3.18`
- ✅ `@angular/router@20.3.18`
- ✅ `prettier@latest`
- ✅ `plop@4.0.1` (optional scaffolding)

**Command:** `npm install`

### Step 3: Build Verification

**Command:** `npm run build-dev`

**Expected Output:**
```
✓ Application bundle generation complete
✓ Exit code: 0 (no errors)
✓ Output: dist/ folder (~1.6MB)
```

### Step 4: Dev Server

**Command:** `npm start`

**Expected:** Server launches at `http://localhost:54439/`

### Step 5: Test Verification (Mandatory)

Run after starter generation:

```bash
# Unit/integration
npm run test -- --watch=false

# E2E (only when project has e2e script/config)
npm run e2e
```

Expected:
- Unit tests pass, or failing specs are reported explicitly
- E2E passes when available; if unavailable, report blocker and required setup

---

## Key Architecture

### Bootstrap (main.ts)

```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding(), withRouterConfig({...})),
    provideHttpClient(withInterceptors([SdKeycloakInterceptor])),

    // Pull in shared lib modules + each feature lib via importProvidersFrom.
    // Each lib's `.useValue()` / `.useClass()` static binds its configuration token
    // and registers its interceptors at root injector — no route-level providers needed.
    importProvidersFrom(
      SdApiModule,
      SampleModule.useValue({ host: environment.sampleHost }),
      // CatalogModule.useValue({ host: environment.catalogHost }),
      // OrderModule.useClass(OrderConfiguration), // when configuration has its own DI
    ),

    // Global (non-lib) configurations
    { provide: SD_CORE_CONFIGURATION, useClass: SdCoreConfiguration },
    { provide: SD_AUTH_CONFIGURATION, useClass: AuthConfiguration },
    { provide: SD_LAYOUT_CONFIGURATION, useClass: LayoutConfiguration },
    { provide: SD_PERMISSION_CONFIGURATION, useClass: PermissionConfiguration, multi: true },
  ]
});
```

### Root Routes (app.routes.ts)

```typescript
export const appRoutes: Routes = [
  { path: '', redirectTo: 'layout/home', pathMatch: 'full' },

  {
    path: 'layout',
    loadChildren: () => import('@sd-angular/core/modules').then(m => m.sdLayoutRoutes),
    canActivate: [SdAuthGuard, SdPermissionGuard, SdPortalGuard]
  },

  {
    // Pure lazy-load — no providers here. SAMPLE_CONFIGURATION is already
    // wired at root via importProvidersFrom(SampleModule.useValue({...})) above.
    path: 'sample',
    loadChildren: () => import('@sample').then(m => m.sampleRoutes),
  },

  { path: '**', redirectTo: 'layout/not-found' }
];
```

### Sample Module (src/libs/sample/)

**3 Demo Entities — each demonstrates a distinct detail UI pattern:**

| Entity | Detail Pattern | Routes |
|---|---|---|
| `employee` | **UnifiedCompact** — full-page with `pages/list` + `pages/detail` (state theo URL) | `/sample/employee`, `/sample/employee/create`, `/sample/employee/detail/:id`, `/sample/employee/update/:id` |
| `product` | **Side-drawer** — all CRUD in embedded `SdSideDrawer`, no sub-routes | `/sample/product` only |
| `department` | **AdaptiveSplitDetail** — `pages/detail` handles CREATE/UPDATE/DETAIL by URL state | `/sample/department`, `/sample/department/create`, `/sample/department/detail/:id`, `/sample/department/update/:id` |

Entity route contract for full-page entities:
- page components: `pages/list`, `pages/detail`
- route states: `/create`, `/update/:id`, `/detail/:id` (all render `pages/detail`)
- Side-drawer entity may keep all states in list page as compact exception

**Service Layer:**
```typescript
// Base CRUD
BaseService.register<EmployeeDTO, EmployeeSaveReq>('employee')
  → paging(), search(), detail(), create(), update(), remove()

// Entity service
EmployeeService extends BaseService
  → paging = this.#api.paging
  → async create(req)
  → async update(id, req)
  → async remove(ids)
```

**List Component:**
- SdTable with pagination
- Delete action with confirmation
- Create button
- Toggle isActivated switch
- Navigate to detail/update

**Detail Component:**
- FormGroup with validation
- States: CREATE | UPDATE | DETAIL
- Form fields: SdInput, SdDate, SdSelect, SdSwitch
- Save/Back/Edit navigation

---

## Real-World Output

**User Request:** "Tạo portal HR mới"

**Result:** (After copying baseline + npm install + npm start)

```bash
✓ Portal created
✓ npm install: packages installed
✓ npm run build-dev: Build complete (0 errors)
✓ npm start: Server running at http://localhost:4200/

Portal features:
✓ Employee list + full-page detail (UnifiedCompact: same layout for CREATE/UPDATE/DETAIL)
✓ Product list + side-drawer CRUD (all states in embedded SdSideDrawer, no sub-routes)
✓ Department list + full-page detail (AdaptiveSplitDetail: DETAIL read-only sections vs editable form)
✓ Keycloak authentication (if configured)
✓ Permission-based UI (*sdPermission directive)
✓ Hot reload on file changes
```

---

## File Customization

### Update API Configuration

**File:** `src/libs/sample/configurations/api.configuration.ts`

```typescript
export class ApiConfiguration implements ISdApiConfiguration {
  handlers = [
    {
      match: req => req.url.includes('employee'),
      handler: async (req, next) => {
        // Add custom headers
        req.headers = req.headers.set('Authorization', `Bearer ${token}`);
        return await next(req);
      }
    }
  ];
}
```

### Add Custom Guard

**File:** `src/libs/sample/guards/custom.guard.ts`

```typescript
export const customGuard: CanActivateFn = (route, state) => {
  // Custom logic
  return true;
};
```

### Customize Entity Fields

**File:** `src/libs/sample/features/employee/services/employee.model.ts`

```typescript
export interface EmployeeSaveReq {
  code?: string;      // Add custom fields
  name?: string;
  customField?: string;  // New field
}

export const EMPLOYEE_FORM_VALIDATORS = {
  code: [Validators.required, Validators.maxLength(16)],
  customField: [Validators.required]
};
```

### Update Configurations

**File:** `src/app/configurations/auth.configuration.ts`

```typescript
export class AuthConfiguration implements ISdAuthConfiguration {
  guard = {
    auth: () => fetch('/.../auth'),
    portal: () => fetch('/.../portal-info')
  };
  
  action = {
    signout: () => window.location.href = '/.../logout',
    changePassword: () => open('/.../change-password')
  };
}
```

---

## Validation Checklist

Before using starter:

- [x] Baseline template location correct: `core/templates/angular-portal-starter/`
- [x] package.json uses npm version of @sd-angular/core: `"19.0.0-beta.73"`
- [x] Core version source of truth documented in `skills/angular-portal/core-version.md`
- [x] tsconfig.json has: `"baseUrl": "./"` + `"@sample": ["./src/libs/sample"]` + `"@sample/*": ["./src/libs/sample/*"]`
- [x] app.routes.ts lazy-loads sample module
- [x] SAMPLE_CONFIGURATION wired at root via `importProvidersFrom(SampleModule.useValue({ host: environment.sampleHost }))` (no route-level providers)
- [x] 3 demo entities exist in `src/libs/sample/features/`:
  - `employee/` — UnifiedCompact full-page detail (same layout for CREATE/UPDATE/DETAIL)
  - `product/` — Side-drawer CRUD embedded in list page (no sub-routes for detail)
  - `department/` — AdaptiveSplitDetail (DETAIL shows read-only sd-section-item, CREATE/UPDATE shows editable form)
- [x] All entity routes have `data.permission` and `data.permissionKey` defined
- [x] BaseService implemented with CRUD register pattern
- [x] npm install succeeds
- [x] npm run build-dev: exit code 0
- [x] npm start: http://localhost:4200/ loads
- [x] Employee list page renders
- [x] Create/Update/Detail flows work
- [x] Prettier formats code on save
- [x] .vscode extensions recommended

---

## What's NOT Included

- Authentication backend wiring (configure via AuthConfiguration)
- Permission backend integration (configure via PermissionConfiguration)
- Database/API backend (provide endpoints)
- Additional business modules (use plop or manual scaffold)
- Deployment configuration (add CI/CD as needed)

---

## Adding New Modules/Entities

### Option 1: Plop (Interactive CLI)

```bash
npx plop module
# Prompts: Enter module name
# Result: src/libs/mymodule/ with configuration scaffold

npx plop entity
# Prompts: Select module, entity name, display label
# Result: model.ts, service.ts, routes.ts, list.component.ts, detail.component.ts
```

### Option 2: Use AI Skill

Use **Entity CRUD Generation Skill** (see `entity-crud-generation-skill.md`) to generate entity with custom field definitions from EntitySchema.

### Option 3: Manual

Copy `src/libs/sample/features/employee/` → `src/libs/mymodule/features/myentity/`, then customize field names.

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "@sample" path not resolving | Verify tsconfig.json has `"baseUrl": "./"` |
| Employee/Product routes not loading | Check `loadChildren` in src/libs/sample/routes.ts |
| API requests failing | Configure SAMPLE_CONFIGURATION host URL |
| Build exceeds budget | Expected for dev (~1.6MB), optimize in prod |
| Prettier not formatting | Check .prettierrc.json exists + vscode extension installed |
| npm install fails | Try `npm install --legacy-peer-deps` |

---

## Summary

✅ **Baseline Template Ready:** Complete, tested, production-quality starter  
✅ **Build Verified:** npm run build-dev → 0 errors  
✅ **Dev Server Tested:** npm start → http://localhost:54439/ works  
✅ **Sample Entities:** Employee + Product CRUD fully functional  
✅ **Type Safety:** Standalone components, strict TypeScript, proper DI  
✅ **Developer Tools:** Prettier, ESLint, VSCode settings included  
✅ **Scalable:** Plop generators for adding modules/entities  

**Result:** Brand new portal is 10 minutes from project initialization to fully working dev environment.
  - if feasible, one build command such as `npm run build-dev`
- Add a final double-check report covering: routes, provider wiring, environment scripts, and unresolved imports

### MUST NOT ❌
- Do not hard-code fixed app/features home/about restrictions; starter may include a customizable `src/app/pages/home` and wire `LayoutConfiguration.homeUrl`
- Do not skip `src/libs/sample` in starter generation
- Do not skip seeding 2 sample entities inside `src/libs/sample/modules`
- Do not use local tarball dependency style for `@sd-angular/core` such as `file:sd-angular-core-*.tgz`
- Do not leave broken path aliases to removed libs in `tsconfig.json`
- Do not keep routes that import removed libs
- Do not generate a starter that requires backend auth, permissions, or APIs to boot locally
- Do not replace `@sd-angular/core` with ad-hoc local components
- Do not hard-code environment names different from the developer request
- Do not create a repo with zero example routes; the starter must visibly demonstrate navigation
- Do not assume the dev wants Plop generators removed; keep them if they still work in the starter
- Do not depend on any external workspace path as starter source
- Do not place `SD_PERMISSION_CONFIGURATION` in module or route providers with `multi: true` and expect root permission service to consume them
- Do not place `SD_UPLOAD_FILE_CONFIGURATION` in module or route providers and expect root upload resolution to consume them
- Do not keep `baseUrl: "./"` by habit when there is no concrete import-resolution need for it
- Do not enable permission checks by default in starter skeleton when permission backend/data source is not ready

## 4. Template

### Preconditions
```text
Required before applying this skill:
- internal baseline templates exist in `core/templates/angular-portal-starter`
- developer confirmed project name
- developer confirmed environment names
- developer confirmed starter should include sample scaffold under `src/libs/sample`
```

### Clarification Questions
```text
Ask the developer:
1. Tên project portal mới là gì? (vd: portal-ops)
2. Cần các môi trường nào? Mặc định: dev, qc, uat, prod
3. Tiêu đề portal/sidebar mặc định là gì?
4. Có muốn đổi cổng chạy local khỏi 4200 không?
5. Giữ 2 entity mẫu mặc định (`employee`, `product`) hay đổi tên?
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
    ├── routes.ts
    ├── configurations/
    │   ├── api.configuration.ts
    │   └── upload-file.configuration.ts
    ├── guards/
    │   └── sample.guard.ts
    └── modules/
      ├── employee/
      │   ├── routes.ts
      │   ├── services/
      │   │   ├── employee.model.ts
      │   │   └── employee.service.ts
      │   └── pages/
      │       ├── list/list.component.ts
      │       └── detail/detail.component.ts
      └── product/
        ├── routes.ts
        ├── services/
        │   ├── product.model.ts
        │   └── product.service.ts
        └── pages/
          ├── list/list.component.ts
          └── detail/detail.component.ts
```

### package.json Template Requirements
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
    "@sd-angular/core": "19.0.0-beta.73"
  }
}
```

### app.routes.ts Template
```typescript
import { Routes } from '@angular/router';
import { SdAuthGuard, SdPermissionGuard, SdPortalGuard } from '@sd-angular/core/modules';

import { MainComponent } from './components/main/main.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'sample/employee',
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
            path: 'layout',
            loadChildren: () => import('@sd-angular/core/modules/layout').then(m => m.SdLayoutModule),
          },
          {
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
import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { SD_CORE_CONFIGURATION } from '@sd-angular/core/configurations';
import {
  SD_AUTH_CONFIGURATION,
  SD_LAYOUT_CONFIGURATION,
  SD_PERMISSION_CONFIGURATION,
} from '@sd-angular/core/modules';
import { SdApiModule } from '@sd-angular/core/services';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { AuthConfiguration, LayoutConfiguration, PermissionConfiguration } from './app/configurations';
import { SampleModule } from '@sample';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withComponentInputBinding(), withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideHttpClient(),

    // Lib bootstraps — each feature lib's `useValue` / `useClass` static wires its
    // configuration token + interceptors at the root injector.
    importProvidersFrom(
      SdApiModule,
      SampleModule.useValue({ host: environment.sampleHost }),
    ),

    {
      provide: SD_CORE_CONFIGURATION,
      useValue: {
        licenseKey: 'Nzg0MTY2NDQ0c2lnbmVk',
      },
    },
    { provide: SD_AUTH_CONFIGURATION, useClass: AuthConfiguration },
    { provide: SD_LAYOUT_CONFIGURATION, useClass: LayoutConfiguration },
    { provide: SD_PERMISSION_CONFIGURATION, useClass: PermissionConfiguration, multi: true },
  ],
}).catch(err => console.error(err));
```

### permission.configuration.ts Skeleton (Starter Default)
```typescript
import { Injectable } from '@angular/core';
import { ISdPermissionConfiguration } from '@sd-angular/core/modules';

@Injectable()
export class PermissionConfiguration implements ISdPermissionConfiguration {
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
    redirectTo: 'employee',
    pathMatch: 'full',
  },
  {
    path: 'employee',
    loadChildren: () => import('./features/employee/employee.routes').then(m => m.routes),
  },
  {
    path: 'product',
    loadChildren: () => import('./features/product/product.routes').then(m => m.routes),
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
6. Open /sample/employee and /sample/product routes
7. If build config exists, run npm run build-dev
8. Run starter unit tests (at minimum route/bootstrap smoke specs)
```

## 5. Example Input

```text
Khoi tao du an portal-starter-moi co cac moi truong dev, qc, uat va prod.
Can include sample scaffold de demo module generation.
Tich hop san @sd-angular/core.
Tao src/libs/sample va seed 2 entity employee, product.
```

## 6. Example Output

### Agent Decision
```text
Use internal baseline under core/templates/angular-portal-starter as source.
Create project portal-starter-moi.
Keep app shell, core configuration, environments, and plop generator files.
Generate src/libs/sample scaffold with seeded employee and product entities.
Generate sample routes and app route wiring to /sample/*.
Pin @sd-angular/core to npm version 19.0.0-beta.73 (no local tgz dependency).
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
[project-name]/src/libs/sample/routes.ts
[project-name]/src/libs/sample/sample.configuration.ts
[project-name]/src/libs/sample/features/employee/routes.ts
[project-name]/src/libs/sample/features/product/routes.ts
[project-name]/src/environments/environment.dev.ts
[project-name]/src/environments/environment.qc.ts
[project-name]/src/environments/environment.uat.ts
[project-name]/src/environments/environment.prod.ts
[project-name]/src/libs/sample/features/employee/services/employee.service.ts
[project-name]/src/libs/sample/features/product/services/product.service.ts
```