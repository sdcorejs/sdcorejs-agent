# Infra Group (dockerize · auth · run-guide) — Implementation Plan (Plan 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the infra/packaging skill group so any SDCoreJS project can be turned into a one-command runnable stack — Angular FE + NestJS modular-monolith BE + Keycloak + Postgres via `docker compose up` — with a plain-language start guide. This is design-doc Phase 2 (`docs/superpowers/specs/2026-06-06-non-tech-solution-builder-design.md`).

**Architecture:** Three new dispatchable skills under `skills/infra/` — `sdcorejs-dockerize` (emits Dockerfiles + `docker-compose.yml`), `sdcorejs-auth` (configures Keycloak via the existing FE `provideSdKeycloak` + BE token-validation, provider knowledge in `_refs/infra/auth-keycloak.md`), `sdcorejs-run-guide` (emits a plain-language `START.md`). They EMIT files into a target project's deploy root; the canonical template content lives under `_refs/infra/` and is mirrored to `.claude/_refs` + `plugin/_refs` by `sync-skills.sh`. The skills consult `_refs/shared/persona.md` so non-tech output stays jargon-free.

**Tech Stack (target-stack facts these templates encode):**
- BE: NestJS modular monolith, port **3000**, npm scripts `build` / `start:prod` / `typeorm migration:run`, TypeORM, connection via `DATABASE_URL`, single `package.json` + `src/`.
- FE: Angular 20.3 + `@sdcorejs/angular@20.0.1`, build → `dist/<project>/browser`, dev serve **4200**, Keycloak via `provideSdKeycloak({ loadTenantConfig })` needing `public/silent-renew.html`; `SdKeycloakTenantConfig = { url, realm, clientId, secureRoutes? }`.
- FE + BE are **separate repos**, orchestrated together at the Docker layer in a **deploy root** that holds the compose file and references each via build context.
- Postgres 16-alpine; Keycloak official image (`quay.io/keycloak/keycloak`).

**Repo conventions (read once):**
- Skill source of truth `skills/<area>/*.md`; mirrors generated — never hand-edit `.claude/skills/`, `plugin/skills/`, `.claude/_refs`, `plugin/_refs`.
- `_refs/**` = no frontmatter, copied wholesale (excluded from the frontmatter check). This is where the Docker/realm/nginx templates live.
- Every skill `.md` needs `name:` (kebab) + `description:` (incl. `Triggers -` + `Applies to … Bilingual` tail) + `allowed-tools:`.
- After any change under `skills/**` or `_refs/**`: `bash .claude/sync-skills.sh` then `bash .claude/sync-skills.sh --check`.
- Infra files are EMITTED into the **target project**, never written into this agent repo. The agent repo only holds the templates + skills.

**Scope boundary (NOT in this plan):** nestjs write-code packs = Plan 3; `sdcorejs-solution-builder` orchestrator = Plan 4. This plan ships independently: the three infra skills + templates, verifiable by frontmatter/sync checks + a structural lint of the emitted templates (`docker compose config` dry-validate where Docker is available; otherwise YAML/Dockerfile syntax review). NO live `docker compose up` is required to land this plan (that's an E2E in a real target project).

---

## Deployment topology these templates produce

```
<target-deploy-root>/
  docker-compose.yml            # be / fe / keycloak / postgres
  docker-compose.dev.yml        # dev override: source mounts + hot reload
  .env                          # from .env.example (user fills/keeps defaults)
  backend/                      # NestJS repo (build context)  → image, :3000 internal
  frontend/                     # Angular repo (build context) → nginx, served at host :4200
  infra/
    backend.Dockerfile
    frontend.Dockerfile
    frontend-nginx.conf
    keycloak/realm-export.json
```
- One host-facing URL for the app: **http://localhost:4200** (nginx serves the SPA AND reverse-proxies `/api` → `backend:3000`, so the browser only ever talks to one origin → Keycloak `secureRoutes: ['/api']`).
- Keycloak admin console: **http://localhost:8080** (only needed for admin, not end users).
- Postgres: internal only (named volume `pgdata`, not host-exposed) → data survives rebuilds.

---

## File Structure (created in THIS agent repo)

| File | Action | Responsibility |
|---|---|---|
| `_refs/infra/docker-compose.yml` | Create | 4-service compose template (postgres, keycloak, backend, frontend). |
| `_refs/infra/docker-compose.dev.yml` | Create | Dev override: bind-mount source + hot-reload commands. |
| `_refs/infra/backend.Dockerfile` | Create | Multi-stage NestJS build → prod runtime; runs migrations then `start:prod`. |
| `_refs/infra/frontend.Dockerfile` | Create | Multi-stage Angular build → nginx static serve. |
| `_refs/infra/frontend-nginx.conf` | Create | SPA fallback + `/api` reverse proxy + serves `silent-renew.html`. |
| `_refs/infra/.env.example` | Create | All env vars (DB, Keycloak, ports) with safe local defaults. |
| `_refs/infra/keycloak/realm-export.json` | Create | Importable realm: realm + public SPA client + `user`/`admin` roles + one demo user. |
| `_refs/infra/auth-keycloak.md` | Create | Knowledge doc for `sdcorejs-auth`: realm wiring, FE `provideSdKeycloak`, BE token validation + env. |
| `skills/infra/dockerize.md` | Create | Skill `sdcorejs-dockerize`. |
| `skills/infra/auth.md` | Create | Skill `sdcorejs-auth`. |
| `skills/infra/run-guide.md` | Create | Skill `sdcorejs-run-guide` (+ `START.md` template embedded in body). |
| `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md` | Modify | Add the 3 skills to the inventory tables + a one-line infra note in the workflow. |
| `TESTING.md` | Modify | Smoke tests for the 3 infra skills. |
| `docs/superpowers/specs/2026-06-06-non-tech-solution-builder-design.md` | Modify | Mark Phase 2 shipped. |
| mirrors (`.claude/**`, `plugin/**`) | Generated | `sync-skills.sh` only. |

---

## Task 1: Compose + env templates (`_refs/infra/docker-compose.yml`, `.env.example`)

**Files:** Create `_refs/infra/docker-compose.yml`, `_refs/infra/.env.example`

- [ ] **Step 1: Create `_refs/infra/.env.example`** — all knobs with local-safe defaults:

```dotenv
# ── Postgres (app data) ──
POSTGRES_USER=app
POSTGRES_PASSWORD=app_local_pw
POSTGRES_DB=app
# ── Keycloak admin (console login at :8080) ──
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin
# Keycloak's own DB (separate database on the same Postgres server)
KC_DB_NAME=keycloak
# ── Backend → Keycloak (token validation) ──
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=app
KEYCLOAK_CLIENT_ID=app-spa
# ── Backend → Postgres ──
DATABASE_URL=postgres://app:app_local_pw@postgres:5432/app
# ── Host ports (what you open in the browser) ──
FRONTEND_PORT=4200
KEYCLOAK_PORT=8080
```

- [ ] **Step 2: Create `_refs/infra/docker-compose.yml`** with these EXACT services/semantics (idiomatic Compose v2, no `version:` key):
  - `postgres`: image `postgres:16-alpine`; env `POSTGRES_USER/PASSWORD/DB` from `.env`; volume `pgdata:/var/lib/postgresql/data`; healthcheck `pg_isready -U $POSTGRES_USER` (interval 5s, retries 10); **no host port** (internal only). Add an init step that also creates the `${KC_DB_NAME}` database — via a mounted `infra/postgres-init/01-keycloak-db.sh` that runs `CREATE DATABASE keycloak;` (idempotent guard). (Create that init script as part of this step.)
  - `keycloak`: image `quay.io/keycloak/keycloak:26.0`; command `start-dev --import-realm`; env `KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD`, `KC_DB=postgres`, `KC_DB_URL=jdbc:postgresql://postgres:5432/${KC_DB_NAME}`, `KC_DB_USERNAME=${POSTGRES_USER}`, `KC_DB_PASSWORD=${POSTGRES_PASSWORD}`, `KC_HEALTH_ENABLED=true`; mount `./infra/keycloak/realm-export.json:/opt/keycloak/data/import/realm-export.json:ro`; `depends_on: postgres (condition: service_healthy)`; healthcheck hitting `/health/ready` (note Keycloak 26 health on mgmt port 9000 — use the documented readiness check); host port `${KEYCLOAK_PORT}:8080`.
  - `backend`: `build: { context: ./backend, dockerfile: ../infra/backend.Dockerfile }`; env `DATABASE_URL`, `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `PORT=3000`; `depends_on: postgres (service_healthy), keycloak (service_healthy)`; **no host port** (reached only via the FE proxy); healthcheck `wget -qO- http://localhost:3000/health || exit 1` (note in the skill that the BE should expose a `/health` route; if absent, drop the healthcheck).
  - `frontend`: `build: { context: ./frontend, dockerfile: ../infra/frontend.Dockerfile }`; `depends_on: backend`; host port `${FRONTEND_PORT}:80`.
  - top-level `volumes: { pgdata: {} }`.
  - Add a header comment block explaining each service in plain language (non-tech readers may open this).

- [ ] **Step 3: Validate compose syntax (the template "test")**

Run (if Docker is installed): `cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && docker compose -f _refs/infra/docker-compose.yml --env-file _refs/infra/.env.example config -q && echo COMPOSE_OK`
Expected: `COMPOSE_OK` (validates interpolation + schema; it does NOT need build contexts to exist for `config`).
If Docker is NOT available: run a YAML lint instead — `python -c "import yaml,sys; yaml.safe_load(open('_refs/infra/docker-compose.yml')); print('YAML_OK')"` and note in the report that `docker compose config` was skipped (no Docker).

- [ ] **Step 4: Sync + commit**

```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && bash .claude/sync-skills.sh >/dev/null && git add _refs/infra .claude/_refs plugin/_refs && git commit -F - <<'MSG'
feat(infra): docker-compose + .env templates (postgres/keycloak/backend/frontend)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
MSG
```

---

## Task 2: Dockerfiles + nginx (`backend.Dockerfile`, `frontend.Dockerfile`, `frontend-nginx.conf`)

**Files:** Create `_refs/infra/backend.Dockerfile`, `_refs/infra/frontend.Dockerfile`, `_refs/infra/frontend-nginx.conf`

- [ ] **Step 1: `_refs/infra/backend.Dockerfile`** — multi-stage:
  - Stage `build`: `FROM node:20-alpine`; `WORKDIR /app`; copy `package*.json`; `RUN npm ci`; copy rest; `RUN npm run build`.
  - Stage `run`: `FROM node:20-alpine`; `WORKDIR /app`; copy `package*.json`; `RUN npm ci --omit=dev`; copy `--from=build /app/dist ./dist`; copy any TypeORM datasource/migrations needed at runtime; `EXPOSE 3000`; entrypoint runs migrations then boots: `CMD ["sh","-c","npm run typeorm migration:run && node dist/main.js"]`.
  - Add a comment: if the project's migration script differs, the skill adapts the CMD.

- [ ] **Step 2: `_refs/infra/frontend.Dockerfile`** — multi-stage:
  - Stage `build`: `FROM node:20-alpine`; `WORKDIR /app`; copy `package*.json`; `RUN npm ci`; copy rest; `ARG BUILD_CMD=build-prod`; `RUN npm run $BUILD_CMD`. (Build outputs to `dist/<project>/browser`.)
  - Stage `serve`: `FROM nginx:alpine`; copy `frontend-nginx.conf` → `/etc/nginx/conf.d/default.conf`; `ARG PROJECT_DIST`; copy `--from=build /app/dist/${PROJECT_DIST}/browser /usr/share/nginx/html`; `EXPOSE 80`. Note in a comment: the skill substitutes `PROJECT_DIST` with the real Angular project name (from `angular.json`).

- [ ] **Step 3: `_refs/infra/frontend-nginx.conf`** — exact content:

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  # SPA: client-side routes fall back to index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Same-origin API: browser calls /api/... → forwarded to the backend container.
  # Keeps one origin so Keycloak secureRoutes can be ['/api'].
  location /api/ {
    proxy_pass http://backend:3000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Authorization $http_authorization;
  }
}
```

- [ ] **Step 4: Lint the Dockerfiles** — basic sanity:

Run: `cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && for f in _refs/infra/backend.Dockerfile _refs/infra/frontend.Dockerfile; do grep -q "^FROM " "$f" && echo "$f OK" || echo "$f MISSING FROM"; done`
Expected: both `OK`. (If `hadolint` is available, run it and report; otherwise this grep is the gate.)

- [ ] **Step 5: Sync + commit**

```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && bash .claude/sync-skills.sh >/dev/null && git add _refs/infra .claude/_refs plugin/_refs && git commit -F - <<'MSG'
feat(infra): backend + frontend Dockerfiles + nginx SPA/api-proxy

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
MSG
```

---

## Task 3: Keycloak realm export + silent-renew (`keycloak/realm-export.json`)

**Files:** Create `_refs/infra/keycloak/realm-export.json`

- [ ] **Step 1: `_refs/infra/keycloak/realm-export.json`** — minimal importable realm with these EXACT fields:
  - `realm: "app"`, `enabled: true`.
  - One client: `clientId: "app-spa"`, `publicClient: true`, `standardFlowEnabled: true`, `directAccessGrantsEnabled: false`, `redirectUris: ["http://localhost:4200/*"]`, `webOrigins: ["http://localhost:4200"]`, `attributes: { "post.logout.redirect.uris": "http://localhost:4200/*" }`. (Public SPA client — matches `provideSdKeycloak`/`keycloak-js` `check-sso`.)
  - Realm roles: `["user", "admin"]`.
  - One demo user: `username: "demo"`, `enabled: true`, `email: "demo@local"`, `emailVerified: true`, credentials `[{ type: "password", value: "demo", temporary: false }]`, realmRoles `["user"]`. (Documented in `START.md` as the default login.)
  - Keep it minimal-valid for Keycloak 26 `--import-realm`. Add a top-of-file note (JSON can't comment — instead document the demo creds in `auth-keycloak.md` + `START.md`).

- [ ] **Step 2: Validate JSON**

Run: `cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && python -c "import json; d=json.load(open('_refs/infra/keycloak/realm-export.json')); assert d['realm']=='app'; assert any(c['clientId']=='app-spa' for c in d['clients']); print('REALM_JSON_OK')"`
Expected: `REALM_JSON_OK`.

- [ ] **Step 3: Sync + commit**

```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && bash .claude/sync-skills.sh >/dev/null && git add _refs/infra .claude/_refs plugin/_refs && git commit -F - <<'MSG'
feat(infra): Keycloak realm-export (app realm + app-spa public client + demo user)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
MSG
```

---

## Task 4: Auth knowledge doc (`_refs/infra/auth-keycloak.md`)

**Files:** Create `_refs/infra/auth-keycloak.md` (no frontmatter — reference data)

- [ ] **Step 1: Author `_refs/infra/auth-keycloak.md`** covering, in clear prose:
  1. **What the realm export contains** (realm `app`, public client `app-spa`, roles `user`/`admin`, demo user `demo`/`demo`) and that the `keycloak` service imports it on first boot via `--import-realm`.
  2. **FE wiring** — generate `provideSdKeycloak({ useFactory: () => ({ loadTenantConfig: () => Promise.resolve({ url: <keycloak public URL>, realm: 'app', clientId: 'app-spa', secureRoutes: ['/api'] }) }) })` in `app.config.ts`; register `SdKeycloakInterceptor` via `withInterceptors`; add `public/silent-renew.html` (give the one-line content: a script that calls `parent.postMessage(location.href, location.origin)` — or reference the keycloak-js silent-check snippet). Note `url` must be the **browser-reachable** Keycloak origin (`http://localhost:8080`), NOT the in-container `http://keycloak:8080`.
  3. **BE wiring** — the NestJS app validates the `Bearer` token against Keycloak using env `KEYCLOAK_URL` (in-container `http://keycloak:8080`), `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`; guard order `AuthGuard → ZodValidationGuard → @HasPermission()` per `_refs/nestjs/architecture-principles.md`. State that this skill CONFIGURES the existing provider — it does not implement token validation.
  4. **The two-URL gotcha** (browser vs in-container Keycloak hostname) and why nginx proxies `/api` (single origin).
  5. **Adding another provider later** = a new sibling knowledge ref; `sdcorejs-auth` stays provider-agnostic.

- [ ] **Step 2: Sync + commit**

```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && bash .claude/sync-skills.sh >/dev/null && git add _refs/infra .claude/_refs plugin/_refs && git commit -F - <<'MSG'
docs(infra): Keycloak provider knowledge for sdcorejs-auth (FE + BE wiring, two-URL gotcha)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
MSG
```

---

## Task 5: `sdcorejs-dockerize` skill

**Files:** Create `skills/infra/dockerize.md`

- [ ] **Step 1: Author the skill** with frontmatter:
  - `name: sdcorejs-dockerize`
  - `description:` — "Generate a one-command runnable Docker stack for an SDCoreJS project: emits Dockerfiles + `docker-compose.yml` (Angular FE + NestJS BE + Keycloak + Postgres) into a deploy root so `docker compose up` boots everything; Postgres on a named volume; nginx serves the SPA and proxies `/api` to the backend. Templates from `_refs/infra/`. Triggers - "dockerize", "đóng gói docker", "docker compose", "chạy bằng docker", "tạo Dockerfile", "build trên docker", "đóng gói để chạy". Applies to angular, nestjs. Bilingual (VI/EN)."
  - `allowed-tools: Read, Write, Edit, Bash, Glob`
  Body sections: Purpose; When invoked / NOT; Step 0 (read persona → if non-tech, plain language + no Docker jargon dumped on the user); Step 1 locate/derive deploy root + the FE project name (from `angular.json`) + BE migration script name; Step 2 emit the `_refs/infra/*` templates into `<deploy-root>/` (compose, both Dockerfiles, nginx, `.env` from `.env.example`, `infra/postgres-init`, realm mount path), substituting `PROJECT_DIST`, `BUILD_CMD`, ports; Step 3 dev vs prod (`docker-compose.dev.yml` override — bind mounts + `start:dev` / `ng serve`); Step 4 hand off to `sdcorejs-auth` (Keycloak) then `sdcorejs-run-guide`; Step 5 verify (`docker compose config -q` if Docker present). Include an idempotency note (merge, don't clobber an existing compose). Make clear it WRITES to the target project, never this repo.

- [ ] **Step 2: Frontmatter + sync gate**

```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && bash .claude/check-skill-frontmatter.sh skills/infra/dockerize.md && bash .claude/sync-skills.sh >/dev/null && bash .claude/sync-skills.sh --check 2>&1 | grep -E "in sync|OUT OF" && test -f .claude/skills/sdcorejs-dockerize/SKILL.md && test -f plugin/skills/sdcorejs-dockerize/SKILL.md && echo DOCKERIZE_OK
```
Expected: frontmatter exit 0; all four "in sync"; `DOCKERIZE_OK`.

- [ ] **Step 3: Commit**

```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && git add skills/infra/dockerize.md .claude/skills plugin/skills && git commit -F - <<'MSG'
feat(infra): sdcorejs-dockerize skill — emit one-command Docker stack

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
MSG
```

---

## Task 6: `sdcorejs-auth` skill

**Files:** Create `skills/infra/auth.md`

- [ ] **Step 1: Author the skill** with frontmatter:
  - `name: sdcorejs-auth`
  - `description:` — "Configure authentication for an SDCoreJS stack. Provider-agnostic; the only provider today is Keycloak (knowledge in `_refs/infra/auth-keycloak.md`). Emits the realm import, wires the Angular FE via `provideSdKeycloak` + `silent-renew.html`, and points the NestJS BE token-validation at the Keycloak service. Use after `sdcorejs-dockerize`. Triggers - "thêm đăng nhập", "cấu hình keycloak", "auth", "login", "xác thực", "wire keycloak", "set up authentication". Applies to angular, nestjs. Bilingual (VI/EN)."
  - `allowed-tools: Read, Write, Edit, Glob`
  Body: Purpose; load `_refs/infra/auth-keycloak.md`; Step 1 ensure realm export present in deploy root (from dockerize); Step 2 FE — write/patch `app.config.ts` (`provideSdKeycloak` with browser-reachable `url`, realm `app`, clientId `app-spa`, secureRoutes `['/api']`) + add `public/silent-renew.html` + wire layout/permission façades per `sd-keycloak.md`; Step 3 BE — set the Keycloak env vars (in-container URL) + confirm guard order; Step 4 the two-URL gotcha (browser vs container hostname); Step 5 report the demo login (`demo`/`demo`) for non-tech. Persona-aware (non-tech: explain "đăng nhập" in plain terms, hide JWT mechanics).

- [ ] **Step 2: Frontmatter + sync gate** (same shape as Task 5 Step 2, for `skills/infra/auth.md` + `sdcorejs-auth` mirror dirs) → expect `AUTH_OK`.

- [ ] **Step 3: Commit**

```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && git add skills/infra/auth.md .claude/skills plugin/skills && git commit -F - <<'MSG'
feat(infra): sdcorejs-auth skill — wire Keycloak (FE provideSdKeycloak + BE token validation)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
MSG
```

---

## Task 7: `sdcorejs-run-guide` skill (+ START.md template)

**Files:** Create `skills/infra/run-guide.md`

- [ ] **Step 1: Author the skill** with frontmatter:
  - `name: sdcorejs-run-guide`
  - `description:` — "Generate a plain-language START.md that takes a non-technical user from zero to a running app: install Docker Desktop → one command → which URL to open → default login → common problems. Use as the final step after `sdcorejs-dockerize` + `sdcorejs-auth`. Triggers - "hướng dẫn chạy", "cách chạy", "start guide", "README chạy app", "làm sao để chạy", "run guide". Applies to angular, nestjs. Bilingual (VI/EN)."
  - `allowed-tools: Read, Write`
  Body: Purpose; persona (non-tech = the primary audience → zero jargon, numbered steps, screenshots-in-words); the embedded `START.md` template to emit into the deploy root, containing exactly these sections (write them out in the skill body as the template):
    1. **Cần cài gì** — Docker Desktop (link), nothing else.
    2. **Chạy** — `docker compose up` (or "double-click run.bat"); wait until logs say ready.
    3. **Mở app** — http://localhost:4200 ; **Đăng nhập**: `demo` / `demo`.
    4. **Trang quản trị Keycloak** (optional) — http://localhost:8080 , admin `admin`/`admin`.
    5. **Dừng** — `docker compose down` (data kept); `down -v` (xóa sạch).
    6. **Gặp lỗi?** — port busy, Docker not started, first-boot slow (Keycloak import), `docker compose logs <service>`.
  - Bilingual: emit VI when persona/session is VI, EN otherwise.

- [ ] **Step 2: Frontmatter + sync gate** → expect `RUNGUIDE_OK`.

- [ ] **Step 3: Commit**

```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && git add skills/infra/run-guide.md .claude/skills plugin/skills && git commit -F - <<'MSG'
feat(infra): sdcorejs-run-guide skill — plain-language START.md for non-tech

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
MSG
```

---

## Task 8: Wire skills into entry files + TESTING + design

**Files:** Modify `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `TESTING.md`, design doc

- [ ] **Step 1: CLAUDE.md** — add an "Infra / packaging" subsection (or rows in the workflow-utilities table) listing the 3 skills with their triggers + the note "emit into the target project's deploy root; non-tech path is the default consumer". Add to the workflow diagram a trailing optional branch: after `branch-ready`, infra skills can package the result (`dockerize → auth → run-guide`). Reference `_refs/infra/`.

- [ ] **Step 2: AGENTS.md + copilot-instructions.md** — mirror the same 3-skill entries + one-line infra note, matching each file's existing structure.

Verify: `cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && for f in CLAUDE.md AGENTS.md .github/copilot-instructions.md; do echo "$f:"; grep -c "sdcorejs-dockerize\|sdcorejs-auth\|sdcorejs-run-guide" "$f"; done` → each ≥3.

- [ ] **Step 3: TESTING.md** — add smoke tests: prompt "đóng gói app này để chạy bằng docker" → dispatches `sdcorejs-dockerize`; "thêm đăng nhập keycloak" → `sdcorejs-auth`; "hướng dẫn chạy cho người không rành kỹ thuật" → `sdcorejs-run-guide`. Pass criteria: emits files to target deploy root (NOT the agent repo), compose has 4 services, START.md is jargon-free.

- [ ] **Step 4: Design doc** — in `docs/superpowers/specs/2026-06-06-non-tech-solution-builder-design.md` Sequencing, append to Phase 2: ` — ✅ shipped (Plan 2)`.

- [ ] **Step 5: Full validation + commit**

```
cd /c/Users/nghiatt15_onemount/Documents/sdcorejs/sdcorejs-agent && npx lefthook run check 2>&1 | tail -6 ; bash .claude/sync-skills.sh --check 2>&1 | grep -E "in sync|OUT OF" && git add -A && git commit -F - <<'MSG'
docs(infra): wire dockerize/auth/run-guide into entry files + TESTING; mark Phase 2 shipped

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
MSG
```
Expected: lefthook check passes; mirrors in sync (skill count = 37 + 3 = 40).

---

## Self-review notes (author)

- **Spec coverage:** implements design §Phase 2 (dockerize/auth/run-guide + `_refs/infra/`). Phases 3–4 deferred.
- **No placeholders:** every template is given as exact content or a precise field-level spec (services, env, stages, healthchecks, realm fields, nginx config verbatim). Tricky bits (migration-on-start CMD, `/api` proxy, browser-vs-container Keycloak URL, keycloak-on-postgres + separate DB) are called out explicitly.
- **Name consistency:** skills `sdcorejs-dockerize` / `sdcorejs-auth` / `sdcorejs-run-guide`; realm `app`; client `app-spa`; demo user `demo`/`demo`; one app URL `:4200`, Keycloak `:8080` — used identically across compose, realm, auth doc, run-guide.
- **Adapted "tests":** docs/skills repo — verification = frontmatter check, mirror `--check`, `docker compose config -q` / YAML+JSON validation of templates, grep for wiring. Live `docker compose up` is an E2E in a real target project, out of scope for landing this plan (flagged).
- **Decisions baked in (surface for review):** (a) Keycloak persisted on the same Postgres (separate `keycloak` DB) not H2 → survives rebuilds; (b) nginx single-origin `/api` proxy → `secureRoutes: ['/api']`; (c) browser-reachable vs in-container Keycloak URL split; (d) Postgres not host-exposed; (e) `start-dev --import-realm` (dev-grade Keycloak — fine for the non-tech local target, NOT production-hardened).
