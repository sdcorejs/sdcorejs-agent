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
| `routes.ts` | ✅ Always | Guards + lazy-load entity children. NO providers. (Filename `<module>.routing.ts` is an accepted alternative.) |
| `configurations/permission.configuration.ts` | ⚙️ Optional | Only when module has its own permission domain |
| `configurations/upload-file.configuration.ts` | ⚙️ Optional | Only when module entities use file upload |

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

## 4. Template

### Hybrid Compatibility Note
```text
If target codebase uses NgModule root/module wiring:
- keep existing NgModule bootstrap/module boundaries intact
- generate standalone components/routes that can be imported or lazy-loaded from NgModule routes
- avoid breaking changes in app bootstrap path unless developer asks for migration
```

### [module].configuration.ts
```typescript
import { InjectionToken } from '@angular/core';

export interface I[Module]Configuration {
  host: string;  // API endpoint: http://localhost:3000/api/v1/[module]
  // Add other module-specific configs
}

export const [MODULE]_CONFIGURATION = new InjectionToken<I[Module]Configuration>('[module].configuration');
```

### configurations/api.configuration.ts
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import {
  SD_API_CONFIGURATION,
  ISdApiConfiguration,
  SdNotifyService,
} from 'sd-angular';
import { I[Module]Configuration, [MODULE]_CONFIGURATION } from '../[module].configuration';

@Injectable()
export class ApiConfiguration implements ISdApiConfiguration {
  readonly #notifyService = inject(SdNotifyService);
  readonly #configuration = inject<I[Module]Configuration>([MODULE]_CONFIGURATION);

  handlers: ISdApiConfiguration['handlers'] = [
    {
      // Only runs for this module's host
      hosts: [this.#configuration.host],

      // Intercept REQUEST before sending
      intercept: (request: HttpRequest<unknown>) => {
        return request.clone({
          setHeaders: {
            // Add custom headers here if needed
            // 'Authorization': 'Bearer ' + token,
          },
        });
      },

      // Handle RESPONSE or ERROR
      afterRemote: (res: HttpResponse<any> | HttpErrorResponse) => {
        if (res instanceof HttpErrorResponse) {
          if (res.status !== 200 && res.status !== 204) {
            const errorMessage = res.error?.meta?.message || 'Đã có lỗi xảy ra';
            this.#notifyService.error(errorMessage);
          }
        }
      },
    },
  ];
}
```

### configurations/upload-file.configuration.ts (Optional)
```typescript
import { Injectable, inject } from '@angular/core';
import { ISdUploadFileConfiguration } from 'sd-angular';
import { I[Module]Configuration, [MODULE]_CONFIGURATION } from '../[module].configuration';

@Injectable()
export class UploadFileConfiguration implements ISdUploadFileConfiguration {
  key = '[module]';
  readonly #configuration = inject<I[Module]Configuration>([MODULE]_CONFIGURATION);

  uploadUri = `${this.#configuration.host}/file/upload`;
  acceptFileType = ['image/*', '.pdf', '.doc', '.docx'];
  maxFileSize = 10 * 1024 * 1024; // 10MB
}
```

### guards/[module].guard.ts
```typescript
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { SdPermissionService } from 'sd-angular';

export const [module]Guard: CanActivateFn = () => {
  const permissionService = inject(SdPermissionService);
  // Add any route-level guards logic here
  // Example: Check if user has permission to access this module
  return permissionService.hasPermission('[MODULE]');
};
```

### [module].module.ts (canonical — exposes the lib via `useClass()` / `useValue()`)
This is the SINGLE place where module-scoped providers live. The lib is consumed at app root via `importProvidersFrom([Module]Module.useValue({...}))` (standalone bootstrap) or via `imports: [[Module]Module.useValue(...)]` (legacy NgModule consumers).

```typescript
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { SD_API_CONFIGURATION } from '@sd-angular/core/services';
import { SD_UPLOAD_FILE_CONFIGURATION } from '@sd-angular/core/components';
import {
  [MODULE]_CONFIGURATION,
  I[Module]Configuration,
} from './[module].configuration';
import { ApiConfiguration } from './configurations/api.configuration';
import { UploadFileConfiguration } from './configurations/upload-file.configuration';

@NgModule({
  declarations: [],
  providers: [
    // Module-scoped interceptors / configurations live HERE, not on the route.
    { provide: SD_API_CONFIGURATION, useClass: ApiConfiguration, multi: true },
    { provide: SD_UPLOAD_FILE_CONFIGURATION, useClass: UploadFileConfiguration, multi: true },
  ],
})
export class [Module]Module {
  /** Inject a configuration via a class — useful when the configuration has its own deps. */
  static useClass(
    classConfiguration: Type<I[Module]Configuration>,
  ): ModuleWithProviders<[Module]Module> {
    return {
      ngModule: [Module]Module,
      providers: [{ provide: [MODULE]_CONFIGURATION, useClass: classConfiguration }],
    };
  }

  /** Inject a configuration via a plain object — typical for `{ host: environment.baseUrl }`. */
  static useValue(
    valueConfiguration: I[Module]Configuration,
  ): ModuleWithProviders<[Module]Module> {
    return {
      ngModule: [Module]Module,
      providers: [{ provide: [MODULE]_CONFIGURATION, useValue: valueConfiguration }],
    };
  }
}
```

### routes.ts (guards + lazy children only — NO providers)
```typescript
import { Routes } from '@angular/router';
import { [module]Guard } from './guards/[module].guard';

export const [module]Routes: Routes = [
  {
    path: '',
    canActivate: [[module]Guard],
    children: [
      {
        path: 'employee',
        loadChildren: () => import('./features/employee').then(m => m.employeeRoutes),
        data: { permission: '[MODULE]_C_EMPLOYEE_LIST', permissionKey: '[module]' },
      },
      {
        path: 'department',
        loadChildren: () => import('./features/department').then(m => m.departmentRoutes),
        data: { permission: '[MODULE]_C_DEPARTMENT_LIST', permissionKey: '[module]' },
      },
      // Add more entities as needed
    ],
  },
];
```

> ⚠️ **No `providers: []` on the route.** All module-scoped providers (interceptors, configuration token, upload, etc.) belong on `[Module]Module`. Route-level providers create lazy-bound injectors that root-scoped services cannot see — leading to "no provider for `[MODULE]_CONFIGURATION`" errors when `SdPermissionService` / shared services run.
>
> Filename can also be `<module>.routing.ts` (alternative naming used in some projects); `routes.ts` is the preferred default.

### main.ts (standalone bootstrap)
The lib is consumed at root via `importProvidersFrom`. `useValue` for inline config, `useClass` when the configuration needs its own DI.

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { SD_PERMISSION_CONFIGURATION } from '@sd-angular/core/modules';
import { SdApiModule } from '@sd-angular/core/services';
import { [Module]Module } from '@[module]';
import { PermissionConfiguration } from './app/configurations/permission.configuration';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      SdApiModule,
      // Inline value — typical for { host: ... }
      [Module]Module.useValue({ host: environment.[module]Host }),
      // Or class form, when the configuration injects other deps:
      // [Module]Module.useClass([Module]Configuration),
    ),
    // Keep permission configuration at root injector for root-scoped SdPermissionService
    { provide: SD_PERMISSION_CONFIGURATION, useClass: PermissionConfiguration, multi: true },
  ],
});
```

### Legacy NgModule consumer (when the app shell is still NgModule-based)
```typescript
@NgModule({
  imports: [
    [Module]Module.useValue({ host: environment.[module]Host }),
    RouterModule.forRoot([...]),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

The same `[Module]Module` works for both flows — that's the point of `ModuleWithProviders`.

### permission.configuration.ts (Keyed)
```typescript
import { Injectable } from '@angular/core';
import { ISdPermissionConfiguration } from '@sd-angular/core/modules';

@Injectable()
export class PermissionConfiguration implements ISdPermissionConfiguration {
  key = 'sample';
  disabled = false;

  loadPermissions = async () => {
    return [
      'SAMPLE_C_EMPLOYEE_LIST',
      'SAMPLE_C_EMPLOYEE_DETAIL',
      'SAMPLE_C_EMPLOYEE_CREATE',
    ];
  };

  onForbiden = () => {
    // redirect forbidden page
  };
}
```

### Route Data Contract (Permission)
```typescript
{
  path: 'employee',
  loadChildren: () => import('./features/employee').then(m => m.employeeRoutes),
  data: {
    permission: 'SAMPLE_C_EMPLOYEE_LIST',
    permissionKey: 'sample',
  },
}
```

### index.ts (Lib Barrel Export)
```typescript
export * from './[module].module';        // primary public API — consumed via `.useValue()` / `.useClass()`
export * from './[module].configuration'; // token + interface
export * from './routes';                  // for app.routes lazy-load reference
export * from './guards/[module].guard';

// Services and models from base folder
export * from './services';
```

## 5. Example Input

```
Set up feature module "Sample" with:
- API host: http://localhost:3000/api/v1/sample
- Will contain: Employee, Department entities
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

## 6. Example Output

### File: `libs/sample/sample.configuration.ts`
```typescript
import { InjectionToken } from '@angular/core';

export interface ISampleConfiguration {
  host: string;
}

export const SAMPLE_CONFIGURATION = new InjectionToken<ISampleConfiguration>('sample.configuration');
```

### File: `libs/sample/configurations/api.configuration.ts`
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import {
  SD_API_CONFIGURATION,
  ISdApiConfiguration,
  SdNotifyService,
} from 'sd-angular';
import { ISampleConfiguration, SAMPLE_CONFIGURATION } from '../sample.configuration';

@Injectable()
export class ApiConfiguration implements ISdApiConfiguration {
  readonly #notifyService = inject(SdNotifyService);
  readonly #configuration = inject<ISampleConfiguration>(SAMPLE_CONFIGURATION);

  handlers: ISdApiConfiguration['handlers'] = [
    {
      hosts: [this.#configuration.host],

      intercept: (request: HttpRequest<unknown>) => {
        return request.clone({
          setHeaders: {
            'X-Module': 'sample',
          },
        });
      },

      afterRemote: (res: HttpResponse<any> | HttpErrorResponse) => {
        if (res instanceof HttpErrorResponse && res.status !== 200 && res.status !== 204) {
          const errorMessage = res.error?.meta?.message || 'Đã có lỗi xảy ra';
          this.#notifyService.error(errorMessage);
        }
      },
    },
  ];
}
```

### File: `libs/sample/configurations/upload-file.configuration.ts`
```typescript
import { Injectable, inject } from '@angular/core';
import { SD_UPLOAD_FILE_CONFIGURATION, ISdUploadFileConfiguration } from 'sd-angular';
import { ISampleConfiguration, SAMPLE_CONFIGURATION } from '../sample.configuration';

@Injectable()
export class UploadFileConfiguration implements ISdUploadFileConfiguration {
  readonly #configuration = inject<ISampleConfiguration>(SAMPLE_CONFIGURATION);

  uploadUri = `${this.#configuration.host}/file/upload`;
  acceptFileType = ['image/*', '.pdf'];
  maxFileSize = 10 * 1024 * 1024; // 10MB
}
```

### File: `libs/sample/guards/sample.guard.ts`
```typescript
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { SdPermissionService } from 'sd-angular';

export const sampleGuard: CanActivateFn = () => {
  const permissionService = inject(SdPermissionService);
  return permissionService.hasPermission('SAMPLE');
};
```

### File: `libs/sample/sample.module.ts`
```typescript
import { ModuleWithProviders, NgModule, Type } from '@angular/core';
import { SD_API_CONFIGURATION } from '@sd-angular/core/services';
import { SD_UPLOAD_FILE_CONFIGURATION } from '@sd-angular/core/components';
import { ISampleConfiguration, SAMPLE_CONFIGURATION } from './sample.configuration';
import { ApiConfiguration } from './configurations/api.configuration';
import { UploadFileConfiguration } from './configurations/upload-file.configuration';

@NgModule({
  declarations: [],
  providers: [
    { provide: SD_API_CONFIGURATION, useClass: ApiConfiguration, multi: true },
    { provide: SD_UPLOAD_FILE_CONFIGURATION, useClass: UploadFileConfiguration, multi: true },
  ],
})
export class SampleModule {
  static useClass(
    classConfiguration: Type<ISampleConfiguration>,
  ): ModuleWithProviders<SampleModule> {
    return {
      ngModule: SampleModule,
      providers: [{ provide: SAMPLE_CONFIGURATION, useClass: classConfiguration }],
    };
  }

  static useValue(
    valueConfiguration: ISampleConfiguration,
  ): ModuleWithProviders<SampleModule> {
    return {
      ngModule: SampleModule,
      providers: [{ provide: SAMPLE_CONFIGURATION, useValue: valueConfiguration }],
    };
  }
}
```

### File: `libs/sample/routes.ts`
```typescript
import { Routes } from '@angular/router';
import { sampleGuard } from './guards/sample.guard';

export const sampleRoutes: Routes = [
  {
    path: '',
    canActivate: [sampleGuard],
    children: [
      {
        path: 'employee',
        loadChildren: () => import('./features/employee').then(m => m.employeeRoutes),
        data: { permission: 'SAMPLE_C_EMPLOYEE_LIST', permissionKey: 'sample' },
      },
      {
        path: 'department',
        loadChildren: () => import('./features/department').then(m => m.departmentRoutes),
        data: { permission: 'SAMPLE_C_DEPARTMENT_LIST', permissionKey: 'sample' },
      },
    ],
  },
];
```

### File: `src/main.ts` (consumer)
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { SdApiModule } from '@sd-angular/core/services';
import { SampleModule } from '@sample';
import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      SdApiModule,
      SampleModule.useValue({ host: environment.sampleHost }),
    ),
  ],
});
```

---

## Integration Points

- Register lib's child routes in root `app.routes.ts`:
  ```typescript
  export const routes: Routes = [
    // ... other routes
    {
      path: 'sample',
      loadChildren: () => import('@sample').then(m => m.sampleRoutes),
    },
  ];
  ```
- Bootstrap the lib in `main.ts`:
  ```typescript
  importProvidersFrom(SampleModule.useValue({ host: environment.sampleHost }))
  ```
  This is what wires `SAMPLE_CONFIGURATION` + interceptors + upload config into the app's root injector — the routes file knows nothing about providers.

## Implementation Checklist

- [ ] Create configuration interface + `InjectionToken` (`[module].configuration.ts`)
- [ ] Create `[module].module.ts` with `@NgModule({ providers })` + `useClass()` / `useValue()` statics
- [ ] Create API configuration with interceptors
- [ ] Create upload file configuration (if file upload is in scope)
- [ ] Create module guard
- [ ] Create `routes.ts` with guards + `loadChildren` only (NO `providers` array)
- [ ] Wire lib at root via `importProvidersFrom([Module]Module.useValue({...}))` in `main.ts`
- [ ] Generate module skeleton specs (`routes.spec.ts`, `guard.spec.ts`, `api.configuration.spec.ts`, `module.spec.ts`)
- [ ] Test configuration injection in child features (root-scoped services see `[MODULE]_CONFIGURATION`)
- [ ] Test API error handling end-to-end
- [ ] Test file upload configuration resolves the right host
- [ ] Verify lazy loading of each feature works
