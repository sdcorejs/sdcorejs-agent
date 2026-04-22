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
| `configurations/api.configuration.ts` | ✅ Always | Request/error interceptors |
| `guards/[module].guard.ts` | ✅ Always | Route protection |
| `routes.ts` | ✅ Always | Lazy-load entity children |
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
- Create `routes.ts` at module root level
- Provide `SD_API_CONFIG` at route level
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

### MUST NOT ❌
- Provide services in route-level configuration (only for interceptors/guards)
- Force migration to pure standalone when developer did not request migration and existing codebase is hybrid
- Hardcode API URLs (inject via configuration)
- Skip error handling in interceptors
- Use global interceptors (module-scoped only)
- Assume route-level providers are visible to root-scoped services
- Generate `permission.configuration.ts` or `upload-file.configuration.ts` without confirmation that the module needs them
- Do not provide `SD_PERMISSION_CONFIGURATION` at module route level when using root-scoped `SdPermissionService`
- Do not provide `SD_UPLOAD_FILE_CONFIGURATION` at module route level when using root-scoped upload configuration resolution
- Do not mark module-local permission providers as `multi: true` and expect root `SdPermissionService` to auto-merge them
- Do not mark module-local upload providers as `multi: true` and expect root consumers to auto-merge them
- Do not reuse the same permission `key` across different configurations
- Do not reuse the same upload `key` across different configurations
- Do not mix route `data.permissionKey='A'` with configuration `key='B'`

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
  SD_API_CONFIG,
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

### routes.ts
```typescript
import { Routes } from '@angular/router';
import { SD_API_CONFIG } from 'sd-angular';
import { ApiConfiguration } from './configurations/api.configuration';
import { [module]Guard } from './guards/[module].guard';
import { [MODULE]_CONFIGURATION, I[Module]Configuration } from './[module].configuration';

const [MODULE]_CONFIG: I[Module]Configuration = {
  host: 'http://localhost:3000/api/v1/[module]',
};

export const [module]Routes: Routes = [
  {
    path: '',
    canActivate: [[module]Guard],
    providers: [
      { provide: SD_API_CONFIG, useClass: ApiConfiguration, multi: true },
    ],
    children: [
      {
        path: 'employee',
        loadChildren: () => import('./modules/employee').then(m => m.employeeRoutes),
      },
      {
        path: 'department',
        loadChildren: () => import('./modules/department').then(m => m.departmentRoutes),
      },
      // Add more entities as needed
    ],
  },
];
```

### main.ts (when service is root-scoped)
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { SD_UPLOAD_FILE_CONFIGURATION } from '@sd-angular/core/components';
import { SD_PERMISSION_CONFIGURATION } from 'sd-angular';
import { [MODULE]_CONFIGURATION } from '@[module]/configurations';
import { [Module]Configuration } from './app/configurations/[module].configuration';
import { PermissionConfiguration } from './app/configurations/permission.configuration';
import { UploadFileConfiguration } from './app/configurations/upload-file.configuration';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: [MODULE]_CONFIGURATION, useClass: [Module]Configuration },
    // Keep permission configuration at root injector for root-scoped SdPermissionService
    { provide: SD_PERMISSION_CONFIGURATION, useClass: PermissionConfiguration, multi: true },
    // Keep upload-file configuration at root injector and distinguish by key
    { provide: SD_UPLOAD_FILE_CONFIGURATION, useClass: UploadFileConfiguration, multi: true },
  ],
});
```

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
  loadChildren: () => import('./modules/employee').then(m => m.employeeRoutes),
  data: {
    permission: 'SAMPLE_C_EMPLOYEE_LIST',
    permissionKey: 'sample',
  },
}
```

### index.ts (Module Barrel Export)
```typescript
export * from './[module].configuration';
export * from './routes';
export * from './guards/[module].guard';
export * from './configurations/api.configuration';
export * from './configurations/upload-file.configuration';

// Export services and models from base folder
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
  SD_API_CONFIG,
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

### File: `libs/sample/routes.ts`
```typescript
import { Routes } from '@angular/router';
import { SD_API_CONFIG } from 'sd-angular';
import { ApiConfiguration } from './configurations/api.configuration';
import { sampleGuard } from './guards/sample.guard';
import { SAMPLE_CONFIGURATION, ISampleConfiguration } from './sample.configuration';

const SAMPLE_CONFIG: ISampleConfiguration = {
  host: 'http://localhost:3000/api/v1/sample',
};

export const sampleRoutes: Routes = [
  {
    path: '',
    canActivate: [sampleGuard],
    providers: [
      { provide: SAMPLE_CONFIGURATION, useValue: SAMPLE_CONFIG },
      { provide: SD_API_CONFIG, useClass: ApiConfiguration, multi: true },
    ],
    children: [
      {
        path: 'employee',
        loadChildren: () => import('./modules/employee').then(m => m.employeeRoutes),
      },
      {
        path: 'department',
        loadChildren: () => import('./modules/department').then(m => m.departmentRoutes),
      },
    ],
  },
];
```

---

## Integration Points

- Register in root `app.routes.ts`:
  ```typescript
  export const routes: Routes = [
    // ... other routes
    { 
      path: 'sample', 
      loadChildren: () => import('@sample').then(m => m.sampleRoutes) 
    },
  ];
  ```

## Implementation Checklist

- [ ] Create configuration interface with required properties
- [ ] Create API configuration with interceptors
- [ ] Create upload file configuration
- [ ] Create module guard
- [ ] Create routes.ts with providers
- [ ] Generate module skeleton specs (`routes.spec.ts`, `guard.spec.ts`, `api.configuration.spec.ts`)
- [ ] Test configuration injection in child modules
- [ ] Test API error handling
- [ ] Test file upload configuration
- [ ] Verify lazy loading works
