# SdApiService

**Type**: Service (Angular `@Injectable`)
**Class**: `SdApiService`
**Provided in**: `'root'`
**Import path**: `@sd-angular/core/services/api`
**Library version**: `@sd-angular/core@19.0.0-beta.86`

## One-line purpose
HTTP client wrapper around Angular `HttpClient` adding per-host handlers, configurable timeout, in-flight request deduplication, and an optional persistent cache layer via `SdCacheService`.

## When to use
- Any time you call a backend HTTP API from Angular and want consistent timeout/retry/error handling.
- When multiple components fire the same GET concurrently and you want one network round-trip (deduplication within 1s).
- When you need persistent caching of responses (memory/session/local) — pass `cacheOption`.
- When you need per-host request/response interception (auth headers, response normalization) without writing a full `HttpInterceptor`.

## When NOT to use
- For non-HTTP side effects — use plain services.
- When you need streaming/SSE — use `HttpClient` directly with `responseType: 'text'` and a parser.
- When you need raw `HttpResponse` (headers/status) — `SdApiService` returns the response body only via `mapResponse`. Use `service.http` (the underlying `HttpClient`) for raw access.

## Public API

### `get<T>(url, option?): Promise<T>`
Issues a GET. Returns the response body (after handler `mapResponse`). Wraps deduplication and optional persistent cache.

```typescript
get = <T = any>(url: string, option?: SdGetOption): Promise<T>;
```

**Parameters**:
- `url` (`string`): full URL (used to match a `SdApiHandler` via `hosts` startsWith).
- `option` (`SdGetOption`, optional): Angular `HttpClient.get` options + `SdApiOption` (`cacheOption`, `timeout`, `autoCache`).

**Returns**: `Promise<T>` resolving to the response body.

### `post<T>(url, body?, option?): Promise<T>`
```typescript
post = <T = any>(url: string, body?: any, option?: SdPostOption): Promise<T>;
```
Same semantics as `get`. `FormData` bodies are never deduplicated (each call gets a fresh key).

### `put<T>(url, body?, option?): Promise<T>`
```typescript
put = <T = any>(url: string, body?: any, option?: SdPutOption): Promise<T>;
```

### `delete<T>(url, option?): Promise<T>`
```typescript
delete = <T = any>(url: string, option?: SdDeleteOption): Promise<T>;
```

### `upload(url, option?): Promise<any>`
Opens a native file picker (`SdUtilities.upload`), then POSTs the chosen file as `multipart/form-data` (field name `file`).

```typescript
upload = async (url: string, option?: { extensions?: string[]; maxSizeInMb?: number }): Promise<any>;
```

### `uploadFile(url, file): Promise<any>`
POSTs a `File` you already have as `multipart/form-data`. Throws `'Invalid file extension'` if the file name has no `.`.

```typescript
uploadFile = async (url: string, file: File): Promise<any>;
```

### `http`
Getter exposing the underlying `HttpClient` for cases the wrapper doesn't cover.

```typescript
get http(): HttpClient;
```

## Configuration / DI tokens

### `SD_API_CONFIGURATION` — `InjectionToken<ISdApiConfiguration>`
Provide an array of `ISdApiConfiguration` (multi: true) to register per-host handlers.

```typescript
export interface ISdApiConfiguration { handlers: SdApiHandler[]; }

export interface SdApiHandler {
  hosts: string[];                              // matched via url.startsWith(host)
  intercept?: (req: HttpRequest<any>) => HttpRequest<any>;
  beforeRemote?: (req: HttpRequest<any>) => void | Promise<void>;
  afterRemote?: (res: HttpResponse<any> | HttpErrorResponse | Error) => void | Promise<void>;
  mapResponse?: <Tres = any, Tdata = any>(response: Tres) => Tdata;
  timeout?: number;                              // ms; default 60000
}
```

```typescript
// app.config.ts
providers: [
  { provide: SD_API_CONFIGURATION, multi: true, useValue: <ISdApiConfiguration>{
    handlers: [{
      hosts: ['https://api.example.com'],
      mapResponse: res => res?.data ?? res,
      timeout: 30000,
    }],
  }},
]
```

## Behavior notes
- **Default timeout**: 60000 ms (overridable per-call via `option.timeout`, then per-handler).
- **Deduplication**: identical (url + method + params + headers + body) calls within 1 second share a single network request via `shareReplay(1)`. Errors invalidate the dedup entry immediately so the next call retries.
- **Persistent cache**: only applied when `option.cacheOption` is set; uses `SdCacheService.create(...)` keyed by the same hash.
- **Auto-cache opt-out**: `option.autoCache: false` (or any `FormData` body) forces a unique key so dedup is bypassed.
- **Response shape**: if body has `{ ok: false, ... }` it is thrown as the error. Otherwise the handler's `mapResponse` is applied if present.
- **`responseType`**: pass it via `option.responseType` (e.g. `'blob'`, `'text'`).
- **NOTE**: `intercept`, `beforeRemote`, and `afterRemote` are declared on `SdApiHandler` but the current core path only consumes `mapResponse` and `timeout`. To use the other hooks, wire them through a real Angular `HttpInterceptor` or via the `interceptors/` folder in the api package.

## Examples

### 1. Simple GET with mapping
```typescript
import { SdApiService } from '@sd-angular/core/services/api';
import { inject } from '@angular/core';

class UserService {
  private api = inject(SdApiService);
  list() { return this.api.get<User[]>('/api/users'); }
}
```

### 2. POST with custom timeout
```typescript
await this.api.post('/api/heavy-job', payload, { timeout: 120_000 });
```

### 3. GET with persistent cache (1 hour, sessionStorage)
```typescript
const meta = await this.api.get<Meta>('/api/meta', {
  cacheOption: { type: 'session', hours: 1 },
});
```

### 4. File upload via picker
```typescript
const result = await this.api.upload('/api/files', {
  extensions: ['png', 'jpg'],
  maxSizeInMb: 5,
});
```

## Anti-patterns
- Do NOT add a leading `/` and expect handler matching against `https://...` hosts — `hosts` are matched via `url.startsWith`. Use full URLs (or normalize at the handler level).
- Do NOT rely on `intercept` / `beforeRemote` / `afterRemote` from `SdApiHandler` — only `mapResponse` and `timeout` are honored by the service core. Use real Angular interceptors for those concerns.
- Do NOT cache `POST`/`PUT`/`DELETE` with `cacheOption` unless you understand the side effects — write methods should usually pass `autoCache: false` instead.
- Do NOT subscribe to the returned promise twice expecting two requests — `shareReplay(1)` plus the dedup map mean within 1s you reuse the result.

## Related
- `SdCacheService` (`@sd-angular/core/services/cache`) — backs the persistent cache layer.
- `SdUtilities.upload` / `SdUtilities.hash` (`@sd-angular/core/utilities/extensions`) — power `upload()` and key generation.
