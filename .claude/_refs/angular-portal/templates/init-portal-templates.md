# Init Portal — Code Templates

Code templates referenced from the init-portal reference pack [`init-portal.md`](../write-code/init-portal.md) (loaded on demand by the `angular-portal-write-code` orchestrator). The pack owns the decision logic, rules, and verification flow; this file holds the literal file content to write into the starter.

`<CORE_UI_PACKAGE_NAME>` and `<CORE_VERSION>` placeholders are resolved from [`../core-version.md`](../core-version.md) **before** writing any file (see skill body §"Source of truth — Core UI package").

## Table of contents
- [package.json](#packagejson)
- [app.routes.ts](#approutests)
- [main.ts](#maints) — most rationale-heavy template; explains each provider
- [permission.configuration.ts (starter default — disabled)](#permissionconfigurationts-starter-default--disabled)
- [layout.configuration.ts](#layoutconfigurationts) — sidebar branding, wires `/logo.png`
- [sample/routes.ts](#sampleroutests)

> Brand asset: copy [`../assets/logo.png`](../assets/logo.png) verbatim to `<project>/public/logo.png`. The layout template below references it as `sidebar.logoUrl: '/logo.png'`.

---

## package.json

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

## app.routes.ts

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

## main.ts

The bootstrap file that wires everything at root injector. The inline comments explain WHY each provider exists — keep them when writing the file; they're the load-bearing context for whoever picks the project up later.

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

## permission.configuration.ts (starter default — disabled)

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

## layout.configuration.ts

Sidebar branding + menu. The `sidebar.logoUrl` is served from `public/logo.png` (file copied verbatim from `_refs/angular-portal/assets/logo.png` during generation — replace per project without touching code).

```typescript
import { Injectable, inject } from '@angular/core';
import { ISdLayoutConfiguration, SdAuthService } from '<CORE_UI_PACKAGE_NAME>/modules';

@Injectable()
export class LayoutConfiguration implements ISdLayoutConfiguration {
  private readonly auth = inject(SdAuthService, { optional: true });

  homeUrl = '/sample/order';

  sidebar = {
    version: 1 as const,
    brandColor: '#1890ff',
    logoUrl: '/logo.png',
    defaultTitle: 'Portal',
  };

  menu = [
    { path: '/sample/order', icon: 'shopping-cart', title: 'Order', permission: true },
    { path: '/sample/customer', icon: 'user', title: 'Customer', permission: true },
  ];

  userInfo = () => {
    const u = this.auth?.getAuthInfo?.() ?? {};
    return {
      fullName: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.username,
      email: u.email,
      username: u.username,
    };
  };

  signout = () => this.auth?.signout();
  changePassword = () => this.auth?.changePassword();
}
```

## sample/routes.ts

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
