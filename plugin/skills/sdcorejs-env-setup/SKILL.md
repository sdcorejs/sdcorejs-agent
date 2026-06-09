---
name: sdcorejs-env-setup
description: Use when the user is setting up a new clone, says "set up the environment", "setup dev", "first run", "cannot run", "nnewly cloned project", or hits env-related errors (missing .env, port conflict, postgres connection refused, wrong node version). Provides per-stack bootstrap checklist (Angular / NestJS / NextJS) plus shared prerequisites. Applies to angular, nestjs, nextjs. Runtime-localized.
allowed-tools: Read, Bash, Glob, Write
---

# Env Setup — First-Time Bootstrap

## Purpose
Get a fresh clone running locally with one focused checklist instead of trial-and-error. Detect what's missing, fill the gaps in the right order, verify each step.

## When invoked
- "set up the environment", "setup dev", "first run", "cannot run", "newly cloned project"
- Specific errors: `EADDRINUSE`, `connection refused`, `ENOENT .env`, `node version mismatch`, `Cannot find module`
- After cloning a fresh repo for the first time

## Workflow

### 0. Detect stack (mandatory first step)
```bash
ls package.json angular.json nest-cli.json next.config.* 2>/dev/null
```
- `angular.json` present → **angular track**
- `nest-cli.json` present → **nestjs track**
- `next.config.js` / `next.config.ts` / `next.config.mjs` → **nextjs track**
- Mixed (monorepo) → ask which app/lib to set up first

Read `package.json` `engines` and `scripts` to know the required node version + how the project actually starts.

### 1. Shared prerequisites
Check in parallel:
```bash
node --version            # vs package.json engines.node
npm --version             # or yarn / pnpm if lockfile says so
git --version
git config user.name
git config user.email
```
Lockfile dictates package manager:
- `yarn.lock` → yarn
- `pnpm-lock.yaml` → pnpm
- `package-lock.json` → npm

Don't introduce a new package manager — match the lockfile.

### 2. Install dependencies
```bash
<pm> install              # one of: npm install | yarn | pnpm install
```
If install fails:
- Node version mismatch → `nvm use` or install correct node first (don't proceed)
- Native build errors (node-gyp, sharp, bcrypt) → check `python` + build tools (Windows: `npm i -g windows-build-tools` is deprecated; use Visual Studio Build Tools)
- Network/registry issues → check corporate proxy config in `.npmrc`

### 3. Stack-specific setup

#### Angular Portal
```bash
# 1. Env file (if needed by the project — most Angular portals use src/environments/*.ts)
ls src/environments/
# If environment.development.ts is gitignored:
cp src/environments/environment.template.ts src/environments/environment.development.ts
# Then edit API_BASE_URL, AUTH_URL, etc.

# 2. Verify Core UI installed
grep -qE '@sdcorejs/angular|@sd-angular/core' package.json && echo "Core UI present" || echo "MISSING Core UI (@sdcorejs/angular new / @sd-angular/core legacy)"

# 3. Dev server
<pm> start                # usually `ng serve` under the hood
```
Verification:
- Hit `http://localhost:4200` (or the port shown in console) — login screen or first route loads
- Browser console: no red errors
- `npm run lint` and `npm run test -- --watch=false` pass

Common Angular failures:
- `NG6100` / module-not-found → run install again, may have been interrupted
- `Port 4200 is already in use` → `<pm> start -- --port 4201` or kill the holder
- White screen + console error about `inject()` outside context → version mismatch between Angular and `@sdcorejs/angular`; check `_refs/angular/core-version.md`

#### NestJS
```bash
# 1. Env file
cp .env.example .env
# Fill in (typical):
#   NODE_ENV=development
#   PORT=3000
#   DB_HOST=localhost
#   DB_PORT=5432
#   DB_USERNAME=postgres
#   DB_PASSWORD=postgres
#   DB_NAME=<project>_dev
#   JWT_SECRET=<random-32-char>
#   JWT_EXPIRATION=1d

# 2. Postgres
docker ps | grep postgres                                # if using docker
# OR
pg_isready -h localhost -p 5432                          # if local install
# Create DB if missing
createdb <project>_dev 2>/dev/null || true

# 3. Migrations
<pm> run migration:run                                   # name varies by project
# OR for seed
<pm> run seed                                            # if seed script exists

# 4. Dev server
<pm> run start:dev
```
Verification:
- `curl http://localhost:3000/health` (or `/api/health`) → 200
- Server logs: `Nest application successfully started`
- No `ECONNREFUSED` to Postgres

Common NestJS failures:
- `ECONNREFUSED 127.0.0.1:5432` → Postgres not running. Start docker container or `brew services start postgresql` / `pg_ctl start`
- `password authentication failed` → wrong creds in `.env` OR postgres role missing
- `Migration table does not exist` → run migrations
- `Port 3000 is already in use` → another Node process; `lsof -i :3000` to find, kill, or change `PORT` in `.env`
- `Cannot find module '@nestjs/cli'` → install dev deps; if global cli needed, `<pm> add -D @nestjs/cli`

#### Next.js
```bash
# 1. Env files (App Router convention)
cp .env.example .env.local                               # never commit .env.local
# Common vars:
#   NEXT_PUBLIC_API_URL=http://localhost:3000     # client-readable
#   API_SECRET=<server-only>                       # server-only
#   NEXTAUTH_URL=http://localhost:3001
#   NEXTAUTH_SECRET=<random-32-char>

# 2. Dev server
<pm> run dev
```
Verification:
- Hit `http://localhost:3000` (default) → home route renders
- No hydration errors in browser console
- API routes respond: `curl http://localhost:3000/api/health`

Common Next.js failures:
- Hydration mismatch on first load → `Date.now()` / locale / `typeof window` in render. Move to `useEffect` or wrap with `<NoSsr>`.
- `NEXT_PUBLIC_*` not visible client-side → typo (must start with `NEXT_PUBLIC_`) or didn't restart dev server after editing `.env.local`
- `Cannot find module 'next'` → install didn't finish
- 404 on `/api/foo` → file in `app/api/foo/route.ts` (App Router) vs `pages/api/foo.ts` (Pages Router); know which the project uses

### 4. Git hooks (cross-stack)
```bash
ls lefthook.yml .husky/ .pre-commit-config.yaml 2>/dev/null
```
- `lefthook.yml` → run `<pm> exec lefthook install`
- `.husky/` → `<pm> install` should have set it via `prepare` script; verify with `ls .husky/_/husky.sh`
- Pre-commit (`.pre-commit-config.yaml`) → `pre-commit install`

### 5. IDE / tool integration (optional, only if user asks)
- VSCode: open recommended extensions (`.vscode/extensions.json`)
- Claude Code / Copilot / Codex: confirm entry-point files (`CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`) are present so the agent loads SDCoreJS skills

### 6. Smoke test
End-to-end check that proves the stack is live:
- Angular: open the home route, click one link
- NestJS: hit one real endpoint with auth (`curl -H "Authorization: Bearer ..."`)
- NextJS: open home + one server-rendered route, no hydration errors

Report status to user with the verification output, not just "done".

## Rules

### MUST DO
- Detect stack BEFORE giving instructions — never assume
- Match the lockfile's package manager
- Match `engines.node` — wrong major node version is the #1 silent failure
- Copy `.env.example` → `.env` / `.env.local`; never edit `.env.example`
- Verify each step with an actual command, not "should be working now"
- Surface failures with the actual error + likely cause

### MUST NOT
- Run `npm install` on a `yarn.lock` repo (or vice versa) — corrupts lockfile
- Commit `.env`, `.env.local`, or any file with real credentials
- `chmod` / `sudo` / install global packages without asking
- Set up production DB / staging — local dev only
- Skip dependencies because "they look optional"
- Bypass hook install (`HUSKY=0`) just to move faster

## Anti-patterns
- Generic "did you install dependencies?" without checking
- Copying generic `.env` content from this doc without reading what the project actually needs
- Setting up Postgres globally when the project ships a `docker-compose.yml`
- Skipping migrations and wondering why endpoints 500
- Filling `JWT_SECRET=secret` (weak) — generate `openssl rand -hex 32`
- Running `<pm> install --force` to mask a real conflict
- "Works on my machine" — verify on a clean checkout

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
