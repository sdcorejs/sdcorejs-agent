# Angular Skill: Feature Module Configuration

## 1. Skill Name
**Feature Module Configuration Setup**

## 2. Description
Generates the complete feature module configuration including route setup, module-level interceptors, guards, and configuration providers following sdcorejs patterns. This is the foundation that ties all entities together.

In a brand-new portal repo, this skill is the first generation step whenever the target module does not exist yet.

## 3. Rules

### MUST DO ✅
- Apply this skill before entity CRUD when the module does not exist
- Create `routes.ts` at module root level
- Provide `SD_API_CONFIG` and `SD_UPLOAD_FILE_CONFIGURATION` at route level
- Define module configuration interface with `InjectionToken`
- If entity services use `providedIn: 'root'`, also provide `[MODULE]_CONFIGURATION` at app root bootstrap (`main.ts`)
- Implement `ApiConfiguration` class for request/response interceptors
- Use `canActivate` guards on root route
- Create `api.configuration.ts` for interceptor logic
- Create `[module].configuration.ts` for interface definition
- Lazy load all child entities with `loadChildren()`
- Export routes as `const [module]Routes: Routes = [...]`

### MUST NOT ❌
- Provide services in route-level configuration (only for interceptors/guards)
- Mix NgModule with standalone route configuration
- Hardcode API URLs (inject via configuration)
- Skip error handling in interceptors
- Use global interceptors (module-scoped only)
- Assume route-level providers are visible to root-scoped services

## 4. Template

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
import { SD_UPLOAD_FILE_CONFIGURATION, ISdUploadFileConfiguration } from 'sd-angular';
import { I[Module]Configuration, [MODULE]_CONFIGURATION } from '../[module].configuration';

@Injectable()
export class UploadFileConfiguration implements ISdUploadFileConfiguration {
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
import { SD_API_CONFIG, SD_UPLOAD_FILE_CONFIGURATION } from 'sd-angular';
import { ApiConfiguration } from './configurations/api.configuration';
import { UploadFileConfiguration } from './configurations/upload-file.configuration';
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
      { provide: SD_UPLOAD_FILE_CONFIGURATION, useClass: UploadFileConfiguration, multi: true },
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
import { [MODULE]_CONFIGURATION } from '@[module]/configurations';
import { [Module]Configuration } from './app/configurations/[module].configuration';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: [MODULE]_CONFIGURATION, useClass: [Module]Configuration },
  ],
});
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
import { SD_API_CONFIG, SD_UPLOAD_FILE_CONFIGURATION } from 'sd-angular';
import { ApiConfiguration } from './configurations/api.configuration';
import { UploadFileConfiguration } from './configurations/upload-file.configuration';
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
      { provide: SD_UPLOAD_FILE_CONFIGURATION, useClass: UploadFileConfiguration, multi: true },
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
- [ ] Test configuration injection in child modules
- [ ] Test API error handling
- [ ] Test file upload configuration
- [ ] Verify lazy loading works
