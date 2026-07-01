# Keycloak — Auth Provider Knowledge (for `sdcorejs-auth`)

This is the provider-specific knowledge the `sdcorejs-auth` skill loads when wiring authentication into a project that uses the bundled Keycloak stack (the `_refs/infra/docker-compose.yml` full local stack). The skill CONFIGURES the existing Keycloak provider on both ends — it does NOT implement token validation, login flows, or PKCE itself; those live in `@sdcorejs/angular/modules/keycloak` (frontend) and the NestJS `AuthGuard` (backend).

Read alongside:
- `_refs/infra/docker-compose.yml` — how the four services wire together.
- `_refs/infra/keycloak/realm-export.json` — the realm template that is imported.
- `node _refs/angular/core-docs-fetch.mjs --print sd-keycloak` — full public API of the FE module (façades, interceptor, behavior notes), fetched on-demand (docs not committed).
- `_refs/nestjs/architecture-principles.md` — guard order and the auth-as-precondition rule.

---

## 1. What the realm import contains

The realm template at `_refs/infra/keycloak/realm-export.json` seeds a ready-to-use realm so the stack works on first boot with zero manual Keycloak setup:

- **Realm:** `app`
- **Client: `app-spa`** — a **public** OpenID-Connect client (PKCE / standard flow; no client secret). Redirect + web-origins locked to `http://localhost:4200`.
- **Client: `app-admin`** — a **confidential** service-account client (`publicClient: false`, `serviceAccountsEnabled: true`, standard/direct-access flows disabled). Used by the backend admin module to call the Keycloak Admin API. Its service account is granted `manage-users` + `view-users` on `realm-management`. Override the placeholder secret in `.env` before first boot.
- **Realm roles:** `user` and `admin` (coarse-grained login markers only). Fine-grained authorization — permission codes such as `<module>_<entity>:<action>` — is the **admin module's** responsibility (app-DB role→permission codes resolved at login via `JwtStrategy`→`internalDetail`→`loadPermissions`). Realm roles are NOT the permission source in either profile.
- **Demo user:** username **`demo`**, password **`demo`** (non-temporary), assigned the `user` realm role. The `demo` user is granted the `admin` role inside the **app DB** by the admin module's boot seed (`init-admin`) — not via Keycloak realm roles. Use it to log in immediately after `docker compose up`.

**How and when it is imported.** The `keycloak` compose service runs `start-dev --import-realm`, which reads any realm JSON mounted under `/opt/keycloak/data/import/`. Keycloak persists realm state in its own `keycloak` database (a separate DB on the same Postgres server, per the compose comments). Because of this:

- The realm is seeded **only on first boot**, when the realm does not yet exist.
- It **survives restarts** — the imported realm lives in Postgres, not in the container filesystem.
- `--import-realm` **re-seeds only an empty realm**; it will NOT overwrite changes you make later in the admin console. To re-apply a changed template you must delete the realm (or its DB) first.

> Admin console: `http://localhost:8080` (admin credentials come from the `.env` file — `KEYCLOAK_ADMIN` / `KEYCLOAK_ADMIN_PASSWORD`).

---

## 2. Frontend wiring (Angular)

The SPA authenticates against Keycloak through `@sdcorejs/angular/modules/keycloak`. `provideSdKeycloak` initializes `keycloak-js` at app-init using `onLoad: 'check-sso'` — it checks for an existing SSO session but does NOT force login (anonymous users still see the app; the app decides when to call `login()`).

**`app.config.ts`:**

```ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideSdKeycloak, SdKeycloakInterceptor } from '@sdcorejs/angular/modules/keycloak';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([SdKeycloakInterceptor])),
    provideSdKeycloak({
      useFactory: () => ({
        loadTenantConfig: () => Promise.resolve({
          url: 'http://localhost:8080',   // browser-reachable Keycloak origin
          realm: 'app',
          clientId: 'app-spa',
          secureRoutes: ['/api'],
        }),
      }),
    }),
  ],
};
```

- `SdKeycloakInterceptor` attaches `Bearer <token>` to every request whose URL contains a `secureRoutes` substring. With the single-origin nginx setup, `['/api']` is enough (see §5).
- `SdKeycloakTenantConfig` is `<localized text>`. `url` MUST be the **browser-reachable** Keycloak origin (see §4).

**Required file — `public/silent-renew.html`.** `keycloak-js` does its silent SSO check by loading this page in a hidden iframe (`silentCheckSsoRedirectUri = ${origin}/silent-renew.html`). It only needs to hand the auth response back to the parent window. A minimal file is enough:

```html
<!DOCTYPE html>
<html>
  <body>
    <script>
      parent.postMessage(location.href, location.origin);
    </script>
  </body>
</html>
```

If this file is missing, the silent check fails and `init` can resolve `false` unexpectedly.

**Façades (optional but recommended).** To light up the layout user-menu and permission checks, wire `SD_AUTH_CONFIGURATION` (user info + signout) and `SD_PERMISSION_CONFIGURATION` (`loadPermissions` from `<localized text>`, `getToken`, `onForbiden`) from `SdKeycloakService`. The exact provider factories are documented in the on-demand FE module doc (`node _refs/angular/core-docs-fetch.mjs --print sd-keycloak`).

---

## 3. Backend wiring (NestJS)

The backend validates the incoming `Bearer` token against the same Keycloak realm. It reads three environment variables (set in compose / `.env`):

| Env var | Value in the local stack | Meaning |
|---|---|---|
| `KEYCLOAK_URL` | `http://keycloak:8080` | **in-container** Keycloak origin — used to fetch the realm's JWKS and validate tokens |
| `KEYCLOAK_REALM` | `app` | realm to validate against |
| `KEYCLOAK_CLIENT_ID` | `app-spa` | expected client / audience |

The `AuthGuard` verifies the token signature against the realm's JWKS endpoint and rejects unauthenticated requests. Per `_refs/nestjs/architecture-principles.md`, the guard order is:

```
AuthGuard → ZodValidationGuard → @HasPermission()
```

Auth is a precondition for everything else: reject unauthenticated requests first (cheap), then validate the payload, then check per-endpoint permissions.

**This skill CONFIGURES the existing provider and guard — it does NOT implement token validation.** The JWKS fetch, signature check, and guard wiring already exist in the NestJS baseline; `sdcorejs-auth` only sets the three env vars and confirms the guard order. Do not hand-roll token parsing.

---

## 4. The two-URL gotcha (read this before debugging "it logs in but the API 401s")

There is exactly one Keycloak server, but it is reached by **two different hostnames** depending on who is calling:

| Caller | Keycloak URL | Why |
|---|---|---|
| Browser (FE `url`) | `http://localhost:8080` | the user's browser is outside Docker; it can only reach the published host port |
| Backend container (`KEYCLOAK_URL`) | `http://keycloak:8080` | inside the Docker network, services reach each other by **service name**, not `localhost` |

**Symptom of confusing them:** the token's `iss` (issuer) claim is stamped with whatever host the browser used to obtain it (`http://localhost:8080/realms/app`), while the backend — if it builds the expected issuer from its in-container `KEYCLOAK_URL` (`http://keycloak:8080/realms/app`) — sees a **mismatched issuer** and rejects the token (typically a `401` with an issuer/`iss` error), even though login on the FE clearly succeeded.

**Fix (pick one, keep it consistent):**
- Pin the issuer hostname so it is identical regardless of caller — set `KC_HOSTNAME` on the Keycloak service so all issued tokens carry one canonical issuer, and have the backend validate against that same value; or
- Configure the backend to **accept both issuers** (`http://localhost:8080/realms/app` and `http://keycloak:8080/realms/app`), validating against the realm JWKS regardless of which host string appears in `iss`.

The rule of thumb: **FE `url` = browser origin, BE `KEYCLOAK_URL` = in-container origin** — never swap them, and make sure the issuer the backend expects matches the issuer Keycloak actually stamps.

---

## 5. Why nginx proxies `/api`

The frontend nginx (`_refs/infra/frontend-nginx.conf`) serves the SPA at `http://localhost:4200` AND reverse-proxies `<localized text>`. The backend has **no published port of its own** — it is reachable only through this proxy.

This gives the app a **single origin**: the SPA and the API both live under `http://localhost:4200`. Consequences:

- `secureRoutes: ['/api']` on the FE is sufficient — every API call is a same-origin `/api/...` request, so the interceptor reliably attaches the token.
- **No CORS** — the browser never makes a cross-origin request, so there are no preflight / `Access-Control-*` headers to configure.
- **No redirect / cookie headaches** — one origin means no third-party-cookie or cross-site issues.

nginx forwards the `Authorization` header explicitly (`proxy_set_header Authorization $http_authorization;`) so the `Bearer` token reaches the backend `AuthGuard` intact.

---

## 6. Adding another auth provider later

`sdcorejs-auth` is **provider-agnostic**. The skill body describes *how* to wire auth (FE module + interceptor, BE guard + env, façades, single-origin proxy); the provider-specific facts (realm contents, client id, URLs, gotchas) live in a sibling knowledge ref like this one.

To support a different provider (Auth0, AuthOM, a hosted OIDC, etc.):

1. Add a new sibling reference, e.g. `_refs/infra/auth-<provider>.md`, capturing that provider's equivalents of §1–§5.
2. The `sdcorejs-auth` skill body **stays the same** — it just loads the new ref instead of (or in addition to) this one.

No skill edits are required to onboard a new provider — only a new knowledge ref.

---

## 7. Permission model by profile

In **both** profiles, permission codes (`<module>_<entity>:<action>`) come from the generated **admin module**, not from Keycloak realm roles.

- `JwtStrategy.validate` calls `internalDetail` → `loadPermissions`, which reads the app-DB role→permission mapping seeded by the admin module's `init-admin` boot seed.
- `@HasPermission('<module>_<entity>:<action>')` and the FE `SD_PERMISSION_CONFIGURATION.loadPermissions` consume these app-DB-sourced codes.
- The `demo` user is granted the `admin` role in the **app DB** by the boot seed — it is NOT assigned permission codes as Keycloak realm roles.
- Keycloak realm roles (`user` and `admin`) remain in the realm as coarse-grained login markers only — they are not read by `RolePermissionStrategy` or `AppPermissionStrategy` for authorization.
- The backend admin module calls the Keycloak Admin API (user search, account management) using the confidential `app-admin` service-account client (`KEYCLOAK_ADMIN_CLIENT_ID` / `KEYCLOAK_ADMIN_CLIENT_SECRET` — see §3 and `sdcorejs-auth` Step 1.5).
