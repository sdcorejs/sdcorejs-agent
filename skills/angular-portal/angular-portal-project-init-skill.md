# Angular Skill: Portal Project Initialization

## 1. Skill Name
**Portal Project Initialization from Internal Baseline**

## 2. Description
Generates a new Angular portal repository from the internal baseline templates inside `sdcorejs-agent`, producing a clean starter that does not yet include business feature libs. The generated starter must already integrate `@sd-angular/core`, define the requested environments, include 1-2 working example routes, and be able to run with `npm start` immediately after installation.

This skill is for the very first step of a brand-new portal repo, before module/entity generation begins.

## 3. Rules

### MUST DO ✅
- Base the starter strictly on internal baseline templates in `core/templates/angular-portal-starter`
- Do not read starter conventions from sibling workspace folders
- Ask the developer for:
  - project name
  - environment list (minimum: `dev`, `qc`, `uat`, `prod`)
  - preferred application title
  - preferred dev port if different from `4200`
  - whether example routes should use pure `src/app/features/*` pages or placeholder `src/libs/*` modules
- Default to generating a **minimal repo without feature libs** under `src/libs`
- Keep `@sd-angular/core` installed and pinned according to `core/templates/angular-portal-starter/package.template.json`
- At the moment of writing this skill, use `@sd-angular/core` version `19.0.0-beta.72`
- Generate all requested environment files under `src/environments/`
- Generate matching build scripts for each requested environment in `package.json`
- Keep Angular standalone bootstrap style (`bootstrapApplication`, `provideRouter`, `provideHttpClient`)
- Keep `SD_CORE_CONFIGURATION`, `SD_AUTH_CONFIGURATION`, `SD_LAYOUT_CONFIGURATION`, and `SD_PERMISSION_CONFIGURATION` in `src/main.ts`
- Register `SD_PERMISSION_CONFIGURATION` only at app root injector (`main.ts`) for compatibility with root-scoped `SdPermissionService`
- Register `SD_UPLOAD_FILE_CONFIGURATION` at app root injector (`main.ts`) and use keyed configurations per module when needed
- Do not modify global CSS/SCSS beyond minimal starter baseline (`src/styles.scss` remains untouched unless developer explicitly asks)
- Provide a minimal `AuthConfiguration`, `LayoutConfiguration`, and `PermissionConfiguration` so the starter can boot without backend integration
- Generate 1-2 example routes that do not depend on future business libs
- Keep root routing simple:
  - redirect `/` to an example route
  - keep a shell route using `MainComponent`
  - keep fallback `**` redirect
- Ensure the starter still compiles without unrelated demo/business aliases that are not part of requested starter scope
- Update `angular.json` serve/build configurations so the new project name and requested environments are aligned
- Update `tsconfig.json` path aliases only for paths that still exist in the starter
- Keep `tsconfig.json` minimal: remove `compilerOptions.baseUrl` when the starter does not use local absolute imports (`src/...`, `app/...`, `libs/...`)
- Keep `compilerOptions.paths` aliases explicit and valid without relying on `baseUrl`
- Ensure `src/libs` exists in generated starter (at minimum `src/libs/.gitkeep`)
- Verify the generated repo by running:
  - `npm install`
  - `npm start`
  - if feasible, one build command such as `npm run build-dev`
- Add a final double-check report covering: routes, provider wiring, environment scripts, and unresolved imports

### MUST NOT ❌
- Do not copy business/demo libs (`sample`, `pricing`, `crm`, `examples`) into a new starter unless the developer explicitly asks for them
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

## 4. Template

### Preconditions
```text
Required before applying this skill:
- internal baseline templates exist in `core/templates/angular-portal-starter`
- developer confirmed project name
- developer confirmed environment names
- developer confirmed starter should not include feature libs yet
```

### Clarification Questions
```text
Ask the developer:
1. Tên project portal mới là gì? (vd: portal-ops)
2. Cần các môi trường nào? Mặc định: dev, qc, uat, prod
3. Tiêu đề portal/sidebar mặc định là gì?
4. Có muốn đổi cổng chạy local khỏi 4200 không?
5. Muốn 1 hay 2 route ví dụ trong starter?
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
│   │   ├── configurations/
│   │   │   ├── auth.configuration.ts
│   │   │   ├── layout.configuration.ts
│   │   │   ├── permission.configuration.ts
│   │   │   └── index.ts
│   │   └── features/
│   │       ├── home/
│   │       │   └── home.page.ts
│   │       └── about/
│   │           └── about.page.ts
│   └── environments/
│       ├── environment.model.ts
│       ├── environment.ts
│       ├── environment.dev.ts
│       ├── environment.qc.ts
│       ├── environment.uat.ts
│       └── environment.prod.ts
└── src/libs/
    └── .gitkeep
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
    "@sd-angular/core": "file:sd-angular-core-19.0.0-beta.72.tgz"
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
    redirectTo: 'home',
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
            path: 'home',
            loadComponent: () => import('./features/home/home.page').then(m => m.HomePage),
          },
          {
            path: 'about',
            loadComponent: () => import('./features/about/about.page').then(m => m.AboutPage),
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
import { provideHttpClient } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { SD_CORE_CONFIGURATION } from '@sd-angular/core/configurations';
import {
  SD_AUTH_CONFIGURATION,
  SD_LAYOUT_CONFIGURATION,
  SD_PERMISSION_CONFIGURATION,
} from '@sd-angular/core/modules';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { AuthConfiguration, LayoutConfiguration, PermissionConfiguration } from './app/configurations';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withComponentInputBinding(), withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideHttpClient(),
    {
      provide: SD_CORE_CONFIGURATION,
      useValue: {
        licenseKey: 'Nzg0MTY2NDQ0c2lnbmVk',
      },
    },
    { provide: SD_AUTH_CONFIGURATION, useClass: AuthConfiguration },
    { provide: SD_LAYOUT_CONFIGURATION, useClass: LayoutConfiguration },
    { provide: SD_PERMISSION_CONFIGURATION, useClass: PermissionConfiguration },
  ],
}).catch(err => console.error(err));
```

### Example Page Template
```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <section class="p-16">
      <h1>Portal Home</h1>
      <p>Portal starter da khoi tao thanh cong va san sang de them module.</p>
      <a routerLink="/about">Mo trang about</a>
    </section>
  `,
})
export class HomePage {}
```

### Verification Steps
```text
After generation:
1. Confirm package name, Angular project name, and output path match developer request
2. Confirm starter is generated from `core/templates/angular-portal-starter` without workspace-external dependencies
3. Confirm `tsconfig.json` has no unnecessary `compilerOptions.baseUrl` (or document why it is needed)
4. Run npm install
5. Run npm start
6. Open /home and /about routes
7. If build config exists, run npm run build-dev
```

## 5. Example Input

```text
Khoi tao du an portal-starter-moi co cac moi truong dev, qc, uat va prod.
Chua can business libs.
Tich hop san @sd-angular/core.
Cho san 2 route vi du de dev bat dau code.
```

## 6. Example Output

### Agent Decision
```text
Use internal baseline under core/templates/angular-portal-starter as source.
Create project portal-starter-moi.
Keep only app shell, core configuration, environments, and plop generator files.
Keep src/libs scaffold (including .gitkeep) for future module generation.
Generate /home and /about example routes under src/app/features.
Pin @sd-angular/core to file:sd-angular-core-19.0.0-beta.72.tgz.
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
[project-name]/src/app/features/home/home.page.ts
[project-name]/src/app/features/about/about.page.ts
[project-name]/src/environments/environment.dev.ts
[project-name]/src/environments/environment.qc.ts
[project-name]/src/environments/environment.uat.ts
[project-name]/src/environments/environment.prod.ts
[project-name]/src/libs/.gitkeep
```