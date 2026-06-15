---
name: sdcorejs-auth
description: Configure authentication for an SDCoreJS stack. Provider-agnostic; the only provider today is Keycloak (knowledge in `_refs/infra/auth-keycloak.md`). Ensures the realm import is present, wires the Angular FE via `provideSdKeycloak` + `silent-renew.html`, and points the NestJS BE token-validation at the Keycloak service. Use after `sdcorejs-dockerize`. Triggers - "add login", "configure Keycloak", "auth", "login", "authentication", "wire keycloak", "set up authentication", "Keycloak login", or localized equivalents. Applies to angular, nestjs. Runtime-localized.
allowed-tools: Read, Write, Edit, Glob
---

# Auth — Wire Keycloak (existing providers)

## Purpose

Configure authentication for an SDCoreJS stack — **configure, don't build**. The login provider, token validation, and guards already exist; this skill points them at the bundled Keycloak service and confirms the realm import is in place. The frontend uses `@sdcorejs/angular/modules/keycloak` (`provideSdKeycloak` + `SdKeycloakInterceptor`) to authenticate and attach a `Bearer` token to every `/api` call; the NestJS backend's `AuthGuard` validates that token against the same realm. This skill writes a small amount of FE config + BE env, never hand-rolls login flows, PKCE, or token parsing.

Provider-agnostic by design: the skill body describes *how* to wire auth; the provider-specific facts (realm, client, URLs, gotchas) live in `_refs/infra/auth-keycloak.md`. Keycloak is the only provider today.

## When invoked / NOT

**Invoked when:**
- The user asks any trigger above ("add login", "configure Keycloak", "auth", "login", "authentication", "wire keycloak", "set up authentication", "Keycloak login").
- As the **auth step** of the Docker build flow — `sdcorejs-dockerize` hands off here to wire Keycloak into the FE + BE before `sdcorejs-run-guide`.

**NOT for:**
- There is **no Keycloak service in the compose** — there is nothing to wire auth against. Run **`sdcorejs-dockerize` first** (it emits the Keycloak service + realm import), then return here. Tell the user what's missing rather than configuring against a service that won't exist.
- The app needs a **non-Keycloak provider** (Auth0, AuthOM, a hosted OIDC, etc.). Do NOT bend this skill to it. Add a new sibling knowledge ref `_refs/infra/auth-<provider>.md` capturing that provider's equivalents of §1–§5 (see `_refs/infra/auth-keycloak.md` §6) — the skill body stays the same and loads the new ref instead.

## Step 0 — load knowledge + persona

1. **Load `_refs/infra/auth-keycloak.md`** — this is the **source of truth** for everything below (realm contents, FE/BE wiring, the two-URL gotcha, single-origin `/api`). Read it before writing anything; do not work from memory.
2. **Read persona.** Read the target project's `.sdcorejs/persona.md` (`persona:` field). Absent → `tech`. Then load `_refs/shared/persona.md` and apply the matching contract.
3. If `non-tech`: call this step **"login"**. Explain in plain words — "I will turn on login for the app, so it opens with a login screen and a demo account." **Hide the JWT/OIDC mechanics** — no "Bearer token", "JWKS", "issuer", "PKCE", "interceptor", "guard" in the user-facing narration. Report progress as outcomes ("login is ready"). Translate user-facing narration at runtime. If `tech`: use the exact terms freely.
4. Detect the backend **profile** — read `profile` from `<target>/.sdcorejs/summary.md` (default `simple`). The permission wiring differs by profile (Step 1.5).

## Step 1 — realm import present

The realm template seeds a ready-to-use realm (realm `app`, public client `app-spa`, demo user `demo`/`demo`) so login works on first boot with zero manual Keycloak setup.

1. Confirm **`<deploy-root>/infra/keycloak/realm-export.json`** exists in the deploy root (it is emitted by `sdcorejs-dockerize` and mounted into the Keycloak container at `/opt/keycloak/data/import/`).
2. If it is **missing**, copy it from `_refs/infra/keycloak/realm-export.json` into `<deploy-root>/infra/keycloak/realm-export.json` (Read the template, Write to the target).
3. Do NOT edit the realm contents here, **except** for one permitted pre-first-boot change: if the backend uses the **simple profile**, augment the realm import with the app's permission codes as realm roles assigned to `demo` (see Step 1.5). Beyond that, realm contents are not modified here — the realm is seeded only on first boot and survives restarts (it lives in the `keycloak` Postgres DB, not the container filesystem) — see `_refs/infra/auth-keycloak.md` §1.

## Step 1.5 — Permission model (admin module owns it)

In **both** profiles (simple and enterprise), permission codes come from the generated **admin module** — they are seeded into the app DB at boot by the admin module's `init-admin` seed, and resolved at login via `JwtStrategy` → `internalDetail` → `loadPermissions`. Keycloak realm roles are **NOT** the permission source.

- The `demo` user is granted the seeded `admin` role inside the **app DB** (by the admin module's boot seed) — **not via Keycloak realm roles**. This gives `demo` full access to every permission code without any realm-role engineering.
- Realm roles (`user` and `admin`) remain in the import only as coarse-grained login markers. Fine-grained authorization is entirely the admin module's responsibility.

**What auth.md's job is here (both profiles):**

1. Confirm the confidential **`app-admin`** service-account client is present in the realm import at `<deploy-root>/infra/keycloak/realm-export.json`. This client (already in the template) grants the backend admin module the Keycloak Admin API access it needs (`manage-users` + `view-users` on `realm-management`).
2. Ensure the two env vars below are set in the backend compose env / `.env` so the admin module can call the Keycloak Admin API (added to Step 3 table):

   | Env var | Example value | Meaning |
   |---|---|---|
   | `KEYCLOAK_ADMIN_CLIENT_ID` | `app-admin` | service-account client for the Admin API |
   | `KEYCLOAK_ADMIN_CLIENT_SECRET` | *(from `.env`)* | client secret for `app-admin` — override the placeholder in `.env` before first boot |

Keep everything else as-is: the two-URL gotcha, the `demo`/`demo` login, and the FE/BE wiring steps.

## Step 2 — Frontend (Angular)

Write or patch **`frontend/src/app/app.config.ts`** to register the Keycloak provider + interceptor. The SPA authenticates against Keycloak through `@sdcorejs/angular/modules/keycloak`.

1. Add the HTTP client with the interceptor and the Keycloak provider to `appConfig.providers`:

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
       // ...existing providers
     ],
   };
   ```

   - **Patch, don't clobber.** If `app.config.ts` already has `provideHttpClient(...)`, merge `withInterceptors([SdKeycloakInterceptor])` into it (don't add a second `provideHttpClient`). Keep all existing providers.
   - **`url` MUST be the browser origin `http://localhost:8080`** — the user's browser is outside Docker and can only reach the published host port. Do NOT use the in-container `keycloak:8080` here (that's the backend's value — see Step 4).
   - `SdKeycloakInterceptor` attaches `Bearer <token>` to every request whose URL matches a `secureRoutes` substring; with the single-origin nginx setup, `secureRoutes: ['/api']` is sufficient.

2. Add **`frontend/public/silent-renew.html`** — `keycloak-js` does its silent SSO check by loading this page in a hidden iframe. A minimal target is enough (if absent, the silent check fails and `init` can resolve `false` unexpectedly):

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

3. **Façades (optional but recommended).** To light up the layout user-menu + permission checks, wire `SD_AUTH_CONFIGURATION` (user info + signout) and `SD_PERMISSION_CONFIGURATION` (`loadPermissions` from `kc.keycloak.realmAccess?.roles`, `getToken`, `onForbiden`) from `SdKeycloakService`. The exact provider factories are in the on-demand FE module doc (`node _refs/angular/core-docs-fetch.mjs --print sd-keycloak`; docs not committed).

## Step 3 — Backend (NestJS)

The backend's `AuthGuard` validates the incoming `Bearer` token against the same realm. **This step CONFIGURES the existing provider/guard — it does NOT implement validation** (the JWKS fetch, signature check, and guard wiring already exist in the NestJS baseline; do not hand-roll token parsing).

1. Set/confirm the BE env vars (in the compose `backend` service env and/or `.env`):

   | Env var | Value in the local stack | Meaning |
   |---|---|---|
   | `KEYCLOAK_URL` | `http://keycloak:8080` | **in-container** Keycloak origin — used to fetch the realm JWKS and validate tokens |
   | `KEYCLOAK_REALM` | `app` | realm to validate against |
   | `KEYCLOAK_CLIENT_ID` | `app-spa` | expected client / audience |
   | `KEYCLOAK_ADMIN_CLIENT_ID` | `app-admin` | service-account client used by the admin module to call the Keycloak Admin API |
   | `KEYCLOAK_ADMIN_CLIENT_SECRET` | *(from `.env`)* | client secret for `app-admin` — override the placeholder before first boot |

   - **`KEYCLOAK_URL` is the in-container origin `http://keycloak:8080`** — inside the Docker network services reach each other by service name, not `localhost`. (This is the opposite of the FE `url` in Step 2 — see Step 4.)

2. Confirm the **guard order** is:

   ```
   AuthGuard → ZodValidationGuard → @HasPermission()
   ```

   Auth is a precondition for everything else: reject unauthenticated requests first (cheap), then validate the payload, then check per-endpoint permissions. See `_refs/nestjs/architecture-principles.md`.

## Step 4 — the two-URL gotcha

There is exactly **one** Keycloak server, reached by **two different hostnames** depending on who calls — never swap them:

| Caller | Keycloak URL | Why |
|---|---|---|
| Browser (FE `url`, Step 2) | `http://localhost:8080` | the browser is outside Docker; only the published host port is reachable |
| Backend container (`KEYCLOAK_URL`, Step 3) | `http://keycloak:8080` | inside the Docker network, services reach each other by service name |

**Symptom — "it logs in but the API 401s":** the token's `iss` (issuer) claim is stamped with the host the browser used (`http://localhost:8080/realms/app`), while a backend that builds its expected issuer from the in-container `KEYCLOAK_URL` (`http://keycloak:8080/realms/app`) sees a **mismatched issuer** and rejects the token even though FE login clearly succeeded.

**Fix (pick one, keep it consistent):** pin the issuer hostname (`KC_HOSTNAME` on the Keycloak service so all tokens carry one canonical issuer, validated against that same value), OR configure the backend to **accept both issuers** (validate against the realm JWKS regardless of which host string appears in `iss`). Full detail in `_refs/infra/auth-keycloak.md` §4.

## Step 5 — report

After wiring, tell the user the **demo login**:

- **tech:** "Auth is wired. Log in with the seeded demo user — **`demo` / `demo`** (username / password) — this account has all permission codes assigned so every action in the app is accessible. If the read-only `teacher`/`teacher` account was seeded (Step 1.5), it can only view, not write. Keycloak admin console at `http://localhost:8080` (admin creds from `.env`)."
- **non-tech:** in plain words — "Login is ready. When the app starts, log in with **demo / demo** (`demo` as the username, `demo` as the password). That demo account can use the full feature set. If a **teacher / teacher** account exists, it is read-only." Translate at runtime. Do not mention realms, JWKS, issuers, or interceptors.

If this skill ran as part of the Docker build flow, hand off to **`sdcorejs-run-guide`** so the demo login also lands in `START.md`.

## Important

- This skill **WRITES to the TARGET project** (its `frontend/`, `backend/`, and deploy-root `infra/`), **NEVER to this agent repo**. The `_refs/infra/*` files (including `auth-keycloak.md` and `keycloak/realm-export.json`) are read-only source knowledge/templates — read them, never edit them here.
- **Configure, don't build.** The FE module + interceptor and the BE guard + validation already exist. This skill only sets config (FE provider, BE env) and confirms the realm import + guard order. Do not implement login flows, PKCE, JWKS fetching, or token parsing.
- **Patch, don't clobber** existing FE config — merge into the existing `provideHttpClient` / providers rather than replacing them. Re-running the skill on an already-wired project must be safe.

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
