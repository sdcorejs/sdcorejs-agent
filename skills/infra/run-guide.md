---
name: sdcorejs-run-guide
description: Generate a plain-language START.md that takes a non-technical user from zero to a running app — install Docker Desktop, one command, which URL to open, default login, common problems. Final step after `sdcorejs-dockerize` + `sdcorejs-auth`. Triggers - "run guide", "how to run", "start guide", "app run README", "startup guide", or localized equivalents. Applies to angular, nestjs. Runtime-localized.
allowed-tools: Read, Write
---

# Run Guide — Zero to Running for Non-Tech


## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.

## Purpose

Emit a single plain-language `START.md` into the target deploy root that takes a **non-technical** user from a fresh machine to a running app: install Docker Desktop, run **one** command, open the right URL, log in with the demo account, and recover from the handful of problems they're likely to hit. No jargon, numbered steps, describes what they will SEE on screen. This is the **final step** of the Docker build flow — it runs after `sdcorejs-dockerize` has emitted the compose stack and `sdcorejs-auth` has wired the login, so by now `docker compose up` already boots everything (Angular FE at `http://localhost:4200`, Keycloak admin at `http://localhost:8080`, Postgres internal on a volume).

## When invoked / NOT

**Invoked when:**
- The user asks any trigger above ("run guide", "how to run", "start guide", "app run README", "how to run", "run guide", "startup guide").
- As the **last step of the Docker build flow** — `sdcorejs-auth` hands off here once the stack is dockerized and login is wired, so the user walks away with a runnable result + the instructions to run it.

**NOT for:**
- There is **no compose stack yet** (`<deploy-root>/docker-compose.yml` absent) — there is nothing to write a run guide *for*. Run **`sdcorejs-dockerize` first** (then `sdcorejs-auth`), then return here. Tell the user what's missing rather than emitting a START.md that points at a command that won't work.

## Step 0 — persona

1. Read the target project's `.sdcorejs/persona.md` (`persona:` field). Absent → `tech`.
2. Load `_refs/shared/persona.md` and apply the matching contract.
3. **Non-tech is the DEFAULT audience for this skill** — the whole point of `START.md` is to onboard someone who does not install or wire tools. Even for a `tech` persona the file stays plain: zero jargon, numbered steps, describe what they will SEE on screen (what the browser shows, what the terminal prints), never internal mechanics. No "reverse proxy", "named volume", "JWT", "realm import" in the user-facing file.
4. **Language follows the session / persona:** the source template below is English. At runtime, translate the prose to the user's session language while keeping the same section numbering, commands, URLs, credentials, and placeholders.

## Step 1 — emit START.md

Write the file to the **deploy root** as `<deploy-root>/START.md` (the same directory that holds `docker-compose.yml` — the dir `sdcorejs-dockerize` wrote into). Use Write; this skill WRITES to the target project, never this agent repo.

The canonical English `START.md` the skill emits is below. Copy/adapt it verbatim for English sessions. For non-English sessions, translate the prose at runtime and keep the structure identical.

```markdown
# How to run the application

This guide helps you run the application from a fresh machine, even if you have never used command-line tools before.
Follow the steps in order.

## 1. What to install

Install **Docker Desktop** only. You do not need to install anything else
(no Node, Java, or database setup is required).

- Download it from: https://www.docker.com/products/docker-desktop/
- After installing, open Docker Desktop and leave it running in the background.

## 2. Run the application

1. Open **Terminal** (or Command Prompt / PowerShell) in the same folder as this guide.
2. Type this command exactly, then press Enter:

   ```
   docker compose up
   ```

3. The **first run** downloads and starts the application. This can take a few minutes.
   You will see many lines of text in the terminal; that is normal.
4. Wait until the app looks ready and the terminal is no longer printing new lines continuously.

## 3. Open the application

1. Open a browser (Chrome, Edge, Firefox, or similar).
2. Go to: **http://localhost:4200**
3. Log in with the demo account:
   - Username: **demo**
   - Password: **demo**

## 4. Account admin page (optional)

Use this only if you need to create or edit users. You can skip it otherwise.

- Address: **http://localhost:8080**
- Admin login:
  - Username: **admin**
  - Password: **admin**

## 5. Stop the application

- To stop the application, go back to the running Terminal and press **Ctrl + C**, or type:

  ```
  docker compose down
  ```

  Your data is kept for the next run.

- If you want to **delete all data** and start fresh:

  ```
  docker compose down -v
  ```

## 6. Common problems

- **You see "port is already allocated":**
  another application is using that port. Open the **`.env`** file in this folder and change
  the port number, or stop the other application and run the command again.

- **Docker is not running or cannot be reached:**
  open **Docker Desktop**, wait until it finishes starting, then run the command in Step 2 again.

- **The first run is slow, or login does not work immediately:**
  the login service needs extra time during the first startup while it loads the demo account.
  Wait 1-2 minutes, then try again.

- **You want to inspect a running service:**
  type `docker compose logs <service-name>` to view its logs, for example:

  ```
  docker compose logs backend
  ```
```

Notes for the running agent:
- The fenced block above is the literal `START.md` content — write it as the file's body (without the outer ``` fence).
- For non-English sessions, translate the same six sections with identical headings/order and intent. Keep `docker compose up` / `down` / `down -v` / `logs <service>`, the URLs (`http://localhost:4200`, `http://localhost:8080`), and the logins (`demo`/`demo`, `admin`/`admin`) exactly as-is in every language.
- Do NOT invent ports the stack doesn't use — `4200` (app) and `8080` (Keycloak admin) are the published host ports from the dockerize stack; Postgres is internal (no URL). If the deploy root's `.env` defines different `FRONTEND_PORT` / `KEYCLOAK_PORT`, use those numbers instead so the guide matches the real stack.

## Step 2 — confirm to user

After writing the file, tell the user in plain language that the guide is ready and give them the essentials inline so they don't even have to open it:

- **non-tech:** "I wrote `START.md` in the deploy root. Quick version: install Docker Desktop, open a terminal in this folder, run `docker compose up`, wait a few minutes, then open `http://localhost:4200` and log in with `demo` / `demo`." Translate this sentence at runtime when the session language is not English.
- **tech:** "Wrote `START.md` to the deploy root. TL;DR: install Docker Desktop → `docker compose up` → open `http://localhost:4200` → log in `demo`/`demo`. Keycloak admin at `http://localhost:8080` (`admin`/`admin`); stop with `docker compose down` (data persists)." Translate the prose at runtime when useful; keep commands, URLs, and credentials unchanged.

## Important

- This skill **WRITES to the TARGET project** (the deploy root holding `docker-compose.yml`), **NEVER to this agent repo**. Do not create a `START.md` inside this skills repo — the template lives only inside this skill body and is emitted at run time.
- **Idempotent:** overwriting / refreshing an existing `START.md` is fine — re-running the skill simply rewrites the latest guide. There is no user data in `START.md` to preserve (unlike `.env`), so a plain overwrite is safe.
- Keep the file plain-language regardless of persona. The audience for `START.md` is whoever ends up running the app, who may not be the person who built it.
