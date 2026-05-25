# SdFirebaseService

**Type**: Service (Angular `@Injectable`)
**Class**: `SdFirebaseService`
**Provided in**: `'root'`
**Import path**: `@sd-angular/core/services/firebase`
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
Thin facade for Firebase-backed integrations (currently exposes an `excel` namespace stub). Configured via `SD_FIREBASE_CONFIG` so consuming apps can point at their own Firebase Functions endpoint and project/env folder.

## When to use
- Apps that already have a Firebase project and need a single injection point to call Firebase Functions through the same `SdApiService` plumbing.
- When you want a centralized place to thread `functionUrl` / `project` / `env` / `folder` config (e.g. for Excel template uploads to Cloud Storage) instead of hard-coding URLs.
- As an extension surface — you can grow this service (or wrap it) to add Auth, FCM, Firestore methods that share the same configuration token.

## When NOT to use
- For raw Firebase SDK usage — install `@angular/fire` directly. This service does not wrap Auth/Firestore/FCM.
- If you don't have Firebase Functions deployed — the configured `functionUrl` is required for the planned `excel` operations.
- For generic HTTP — use `SdApiService` directly.

## Public API

### `excel.uploadFile(): void`
Stub. Reserved for uploading an Excel template to Firebase Storage / Functions. Currently a no-op — extend the service or replace it in your app.

```typescript
excel.uploadFile = () => {};
```

### `excel.removeFile(): void`
Stub. Reserved for removing a previously uploaded Excel asset. Currently a no-op.

```typescript
excel.removeFile = () => {};
```

## Configuration / DI tokens

### `SD_FIREBASE_CONFIG` — `InjectionToken<ISdFirebaseConfiguration>`
Optional. Provide app-wide Firebase coordinates so the service (and downstream extensions) know where to call.

```typescript
export interface ISdFirebaseConfiguration {
  functionUrl: string;            // Cloud Functions base URL
  project: string;                // Firebase project id
  env: string;                    // 'dev' | 'uat' | 'prod' etc.
  folder?: string | (() => string); // optional storage folder (or factory)
}

export const SD_FIREBASE_CONFIG: InjectionToken<ISdFirebaseConfiguration>;
```

```typescript
// app.config.ts
providers: [
  { provide: SD_FIREBASE_CONFIG, useValue: <ISdFirebaseConfiguration>{
    functionUrl: 'https://us-central1-myproj.cloudfunctions.net',
    project: 'myproj',
    env: 'prod',
    folder: () => `users/${currentUserId()}`,
  }},
]
```

## Behavior notes
- The service depends on `SdApiService` (injected) — when methods are implemented, they will go through the standard api timeout/dedup/cache pipeline.
- Configuration is `@Optional()`. Without it the stubs still no-op safely; future implementations should guard for missing config.
- `folder` may be a string or a factory function — call `typeof folder === 'function' ? folder() : folder` at call sites that need a fresh value.

## Examples

### 1. Inject and call a stub
```typescript
import { SdFirebaseService } from '@sd-angular/core/services/firebase';
import { inject } from '@angular/core';

class TemplatesPage {
  private firebase = inject(SdFirebaseService);
  upload() { this.firebase.excel.uploadFile(); }
}
```

### 2. Provide configuration at bootstrap
```typescript
import { SD_FIREBASE_CONFIG } from '@sd-angular/core/services/firebase';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: SD_FIREBASE_CONFIG, useValue: {
      functionUrl: environment.firebaseFunctionUrl,
      project: environment.firebaseProject,
      env: environment.name,
    }},
  ],
});
```

### 3. Wrap with a project-specific service
```typescript
@Injectable({ providedIn: 'root' })
class MyExcelTemplatesService {
  constructor(
    private firebase: SdFirebaseService,
    private api: SdApiService,
    @Inject(SD_FIREBASE_CONFIG) private cfg: ISdFirebaseConfiguration,
  ) {}
  upload(file: File) {
    return this.api.uploadFile(`${this.cfg.functionUrl}/uploadExcel`, file);
  }
}
```

## Anti-patterns
- Do NOT call `excel.uploadFile` / `excel.removeFile` and expect them to do work — they are intentional stubs.
- Do NOT inject `SD_FIREBASE_CONFIG` without `@Optional()` if your library/feature must work in apps that haven't set it.
- Do NOT use this service as a shortcut for `@angular/fire` / `firebase-js-sdk` features (Auth, Firestore, FCM). Install those directly.

## Related
- `SdApiService` (`@sd-angular/core/services/api`) — used internally for HTTP calls.
- `@angular/fire` — official Angular Firebase bindings if you need richer Firebase integration.
