---
name: sdcorejs-dockerize
description: Generate a one-command Docker stack for Angular FE + NestJS BE + Keycloak + Postgres. Use for dockerize/containerize/Dockerfile/docker compose/run with Docker requests before auth/run-guide. Emits deploy-root Dockerfiles, compose, nginx SPA + /api proxy, and Postgres volume using _refs/infra templates. Applies to angular, nestjs. Runtime-localized.
allowed-tools: Read, Write, Edit, Bash, Glob
---

# Dockerize — One-Command Runnable Stack


## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.
5. Before presenting user-facing choices, approval gates, yes/no questions, or mode selections, read and apply `_refs/shared/user-choice-prompt.md` so options are presented as sequential numbered choices.

## Purpose

Turn an SDCoreJS frontend + backend into a single `docker compose up`. This skill emits Dockerfiles and a `docker-compose.yml` that wire four services together — Angular (served by nginx), NestJS, Keycloak, and Postgres — into a **deploy root** so anyone can boot the whole stack with one command, no local Node/Java/Postgres install required. Postgres data persists on a named volume; nginx serves the SPA and reverse-proxies `/api` to the backend so the browser sees a single origin.

## When invoked / NOT

**Invoked when:**
- The user asks any trigger above ("dockerize", "package with Docker", "run with Docker", "containerize", "docker compose", "create Dockerfile", or localized equivalents).
- As a step in the non-tech build flow — once an FE + BE exist, the stack is packaged so the user can run it with one command.

**NOT for:**
- The user only wants a Dockerfile for a single, non-SDCoreJS service (no Angular FE + NestJS BE pairing) — write a plain Dockerfile, do not pull in this whole stack.
- No FE or BE exists yet — build them first (`sdcorejs-angular` / `sdcorejs-nestjs`), then dockerize. Tell the user what's missing rather than emitting a stack that can't build.

## Deploy-root layout this skill produces

```
<deploy-root>/
  docker-compose.yml          # prod (built images) — `docker compose up`
  docker-compose.dev.yml      # dev override (bind-mounts + hot reload)
  .env                        # copied from .env.example (never overwritten)
  product/?                   # optional solution-builder PO docs
  design/?                    # optional solution-builder FE handoff artifacts
  backend/                    # NestJS build context (separate repo, placed here)
  frontend/                   # Angular build context (separate repo, placed here)
    frontend-nginx.conf       # copied here because frontend.Dockerfile COPYs it from this context
  test/?                      # optional solution-builder cross-stack tests/reports
  infra/
    backend.Dockerfile
    frontend.Dockerfile
    frontend-nginx.conf       # canonical copy (source of the one placed in frontend/)
    postgres-init/01-keycloak-db.sh
    keycloak/realm-export.json
```

FE and BE are **separate repos placed side by side** under the deploy root as `frontend/` and `backend/`. In a `sdcorejs-solution-builder` root, the same deploy root may also contain `product/`, `design/`, and `test/`; those are documentation/design/test artifacts and are not Docker build contexts. This skill does not move or clone apps — it expects them already present (or asks where they are).

## Step 0 — persona

1. Read the target project's `.sdcorejs/persona.md` (`persona:` field). Absent → `tech`.
2. Load `_refs/shared/persona.md` and apply the matching contract.
3. If `non-tech`: explain in plain language — "I will package the app so you can run the whole thing with one command on your machine." Do NOT dump Docker jargon (no "multi-stage build", "reverse proxy", "named volume" in the user-facing narration). Report progress as outcomes ("the one-command package is ready"). Translate user-facing narration at runtime. If `tech`: use exact terms freely.

## Step 1 — locate & derive

1. **Find the deploy root.** Look for a directory holding both `backend/` and `frontend/` (optionally also `product/`, `design/`, and `test/` in solution-builder output). Common spots: a `deploy/` dir, or the parent dir of the FE/BE repos. If ambiguous or none found, **ask** the user for the deploy root path (default offer: create `deploy/` beside the repos, or use the parent dir that already contains `frontend/` + `backend/`). Do not guess silently.
2. **Derive Angular dist name → `PROJECT_DIST`.** Read `frontend/angular.json`; the build output project name is the folder under `dist/` (i.e. the project key under `projects.<name>` whose `architect.build.options.outputPath` ends in that name). Use it as `PROJECT_DIST`.
3. **Derive the Angular build script → `BUILD_CMD`.** Default `build-prod`. Read `frontend/package.json` `scripts` — if `build-prod` is absent, prefer a prod-config build script that exists (`build:prod`, or `build` with a `production` configuration). Record the actual script name as `BUILD_CMD`.
4. **Derive the BE migration script.** Read `backend/package.json` `scripts` for the TypeORM migration runner; default `typeorm migration:run` (matches `backend.Dockerfile`'s `CMD`). If the project uses a different script name, note it for the `backend.Dockerfile` `CMD` substitution in Step 2.
5. State explicitly (to the user, persona-appropriately) that FE and BE are separate repos placed side by side under the deploy root.

## Step 2 — emit templates

Copy each file under `_refs/infra/` into the deploy-root layout above. Use Read to load each template, then Write into the target (this skill WRITES to the target project, never this agent repo).

Per-file mapping + substitutions:

- `_refs/infra/docker-compose.yml` → `<deploy-root>/docker-compose.yml`
  - Pass `PROJECT_DIST` and `BUILD_CMD` as Docker **build ARGs** under the `frontend` service `build.args` (e.g. `build: { context: ./frontend, dockerfile: ../infra/frontend.Dockerfile, args: { PROJECT_DIST: <name>, BUILD_CMD: <script> } }`).
  - Host ports come from `.env` (`FRONTEND_PORT`, `KEYCLOAK_PORT`) — leave the `${...}` references intact; the values live in `.env`.
- `_refs/infra/backend.Dockerfile` → `<deploy-root>/infra/backend.Dockerfile`
  - If the derived BE migration script (Step 1.4) differs from `typeorm migration:run`, substitute it in the final `CMD`.
- `_refs/infra/frontend.Dockerfile` → `<deploy-root>/infra/frontend.Dockerfile`
  - The `ARG PROJECT_DIST` / `ARG BUILD_CMD` defaults stay; the real values are passed from compose `build.args`.
- `_refs/infra/frontend-nginx.conf` → **two places**:
  - `<deploy-root>/infra/frontend-nginx.conf` (canonical copy), AND
  - **`<deploy-root>/frontend/frontend-nginx.conf`** — **CRITICAL:** `frontend.Dockerfile` does `COPY frontend-nginx.conf /etc/nginx/conf.d/default.conf` from the **frontend build context** (`./frontend`), so the file MUST physically exist inside `frontend/` or the image build fails. **Pick option 1: copy `frontend-nginx.conf` into `frontend/`** (do NOT instead repoint `build.context` to `./infra`). Say so explicitly to the user, and note this added file lives in the FE repo's working tree (gitignore it there if the FE repo shouldn't track it).
- `_refs/infra/postgres-init/01-keycloak-db.sh` → `<deploy-root>/infra/postgres-init/01-keycloak-db.sh`
- `_refs/infra/keycloak/realm-export.json` → `<deploy-root>/infra/keycloak/realm-export.json`
- `_refs/infra/.env.example` → `<deploy-root>/.env.example` AND, **only if `<deploy-root>/.env` is absent**, copy it to `<deploy-root>/.env`. **NEVER overwrite an existing `.env`** (it holds the user's real ports/passwords).

## Step 3 — dev vs prod

`docker-compose.yml` (Step 2) is the **prod** stack — it builds images and runs them. Also emit a **`docker-compose.dev.yml` override** for hot-reload development. This dev file is NOT stored as a `_refs` template; produce it at skill-run time with this shape:

- `backend` service: bind-mount `./backend:/app` (plus an anonymous volume for `/app/node_modules` so the host's empty/absent `node_modules` doesn't shadow the container's), and override the command to `npm run start:dev` for watch-mode recompile.
- `frontend` service: bind-mount `./frontend:/app` (+ anonymous `/app/node_modules` volume), override command to `npm start` (i.e. `ng serve --host 0.0.0.0`), and expose Angular's dev port `4200` (map `${FRONTEND_PORT}:4200`). The dev FE talks to the BE via the same `/api` proxy or the dev-server proxy config — keep single-origin behavior.
- Keep `postgres` and `keycloak` exactly as prod (no override needed); the override only changes the two app services.

Document both run modes in the hand-off:
- **Prod:** `docker compose up` (uses `docker-compose.yml` only).
- **Dev (hot reload):** `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`.

## Step 4 — hand off

After files are emitted, hand off in order:
1. Run **`sdcorejs-auth`** — wire Keycloak into FE + BE (configures the realm/client against the bundled Keycloak; reads `_refs/infra/auth-keycloak.md`).
2. Then run **`sdcorejs-run-guide`** — write `START.md` with the exact commands to boot, where to open the app, default logins, and how to stop/reset.

## Step 5 — verify

- If Docker is present on the machine (`docker --version` / `docker compose version` succeeds), run from the deploy root:
  ```
  docker compose config -q
  ```
  This validates the compose file resolves (env interpolation, build contexts, volumes) WITHOUT building or starting anything. Report pass/fail; on failure, show the offending key and fix the substitution.
- Do NOT run a full `docker compose up` / `build` as part of verification (slow, requires images pulled) unless the user explicitly asks.
- **Healthcheck note:** the `backend` service healthcheck assumes a `GET /health` route exists. If the backend has **no** `/health` route, instruct the user (or edit, with confirmation) to **remove the backend `healthcheck` block AND the `frontend` service's `depends_on: backend: condition: service_healthy`** (downgrade it to `condition: service_started`) — otherwise the frontend never starts because the backend is reported unhealthy forever.

## Idempotency

- **Never clobber** an existing `<deploy-root>/docker-compose.yml`, `docker-compose.dev.yml`, or `.env`. If one already exists: diff against what this skill would emit, then either MERGE the missing pieces (preferred for `docker-compose.yml` — e.g. add a missing `build.args`) or ASK the user before changing it. Re-running the skill on an already-dockerized root must be safe.
- Re-emitting the static infra templates (`infra/*`) is fine to overwrite (they're generated artifacts), but mention what changed.

## Important

- This skill **WRITES to the TARGET project's deploy root**, NEVER to this agent repo. The `_refs/infra/*` files are read-only source templates — read them, never edit them here.
- All emitted paths are under `<deploy-root>/`. Confirm the deploy root before writing anything.

<!-- response-style: auto-injected by sync-skills; do not edit mirror by hand -->

**Response style (terse mode active for this skill - reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal - no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
