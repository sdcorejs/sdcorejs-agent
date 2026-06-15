# Handoff — non-tech full-app pipeline (Phases 1–4)

**Date:** 2026-06-06
**Branch:** `feat/non-tech-solution-builder` (pushed to `origin`)
**For:** the next session (another machine) — self-contained; you do not need prior chat history.

---

## TL;DR

1. The entire "non-tech enablement" design is **built and committed** on `feat/non-tech-solution-builder` — 37 commits, all 4 phases shipped. Branch is **pushed to origin**.
2. A PR has **not** been opened yet (`gh` is not installed on the build machine). Open it manually (URL + ready body below), then **merge `--no-ff`** into `main` (the chosen strategy — preserves plan-by-plan history + a feature merge node).
3. Nothing was pushed to `main`. `main` is still at `6e317b1` (= `origin/main`).
4. Next actions: (a) review + open/merge the PR; (b) optionally pick up a deferred follow-up (list at the bottom).

---

## Git state

- Branch `feat/non-tech-solution-builder`, HEAD `5c2303f` (verify with `git rev-parse --short HEAD`).
- `main` = `origin/main` = `6e317b1` (no divergence; the branch is a clean linear descendant → no merge conflicts).
- Branch is pushed: `origin/feat/non-tech-solution-builder`.
- Working tree clean. 41 skills; `.claude/skills` + `plugin/skills` + `.claude/_refs` + `plugin/_refs` mirrors all in sync.

### Open the PR (gh not installed)
- URL: https://github.com/sdcorejs/sdcorejs-agent/pull/new/feat/non-tech-solution-builder
- Compare: https://github.com/sdcorejs/sdcorejs-agent/compare/main...feat/non-tech-solution-builder?expand=1
- Title: `feat: non-tech full-app build pipeline — persona, infra, nestjs, solution-builder`
- Body + test plan: in `docs/superpowers/plans/` context; or reconstruct from the per-phase summary below. Merge **`--no-ff`**.
- If `gh` is available on the other machine: `gh pr create --base main --head feat/non-tech-solution-builder --title "..." --body "..."`.

---

## What was built (by phase)

The design doc is `docs/superpowers/specs/2026-06-06-non-tech-solution-builder-design.md` (Status: Delivered — Phases 1–4 shipped). Each phase has an approved plan under `docs/superpowers/plans/2026-06-06-*.md`. Read those for full detail.

### Phase 1 — Persona layer (Plan 1)
- `skills/orchestration/persona.md` (`sdcorejs-persona`) — ask-once tech/non-tech, stores `<target>/.sdcorejs/persona.md`, idempotent.
- `_refs/shared/persona.md` — behavior contract. **Rule 7:** non-tech requirement questions focus on **features + screens, never architecture** (the agent derives modules/entities itself).
- Wired into CLAUDE.md / AGENTS.md / `.github/copilot-instructions.md` (session-start ritual + rule 11 + skill table).
- Cleanup: renamed `skills/tracks/{angular,nestjs,nextjs}/07-write-code.md` → `write-code.md` (the `07-` prefix was meaningless with one write-code skill per track). Mirror dirs key off `name:` frontmatter, so the rename left mirrors byte-identical.

### Phase 2 — Infra group (Plan 2)
- `skills/infra/dockerize.md` (`sdcorejs-dockerize`), `skills/infra/auth.md` (`sdcorejs-auth`), `skills/infra/run-guide.md` (`sdcorejs-run-guide`).
- `_refs/infra/`: `docker-compose.yml` (postgres/keycloak/backend/frontend), `docker-compose` semantics, `.env.example`, `postgres-init/01-keycloak-db.sh`, `backend.Dockerfile`, `frontend.Dockerfile`, `frontend-nginx.conf`, `keycloak/realm-export.json`, `auth-keycloak.md`.
- Topology: one host URL **http://localhost:4200** (nginx serves the SPA + reverse-proxies `/api` → `backend:3000`); Keycloak admin :8080; Postgres internal on a named volume (survives rebuild). Keycloak persisted on the same Postgres (separate `keycloak` DB). Demo login **`demo` / `demo`**; Keycloak admin `admin`/`admin`.
- Two-URL gotcha (documented in `_refs/infra/auth-keycloak.md`): FE `provideSdKeycloak` `url` = browser origin `http://localhost:8080`; BE `KEYCLOAK_URL` = in-container `http://keycloak:8080`.

### Phase 3 — NestJS build-out (Plan 3)
- `_refs/nestjs/core-catalog.md` — inventory of the `@sdcorejs/nestjs` (v0.1.6) core: sub-path exports (`/orm`, `/permission`, `/validation`, `/jwt`, `/context`, `/tenancy`, `/audit`), `BaseEntity`+`WithAudit`/`BaseRepository`/`BaseService`/`BaseController`, `SdCoreModule.forRoot`, `AuthGuard`+`@HasPermission`+`ZodValidationGuard`, `JwtModule` (Keycloak JWKS).
- `_refs/nestjs/write-code/{init-project,init-module,init-entity,actions}.md` — codegen packs, loaded on demand by the single `sdcorejs-nestjs` skill.
- `skills/tracks/nestjs/write-code.md` — upgraded scaffold plan-walker → pack-dispatching orchestrator (mirrors `sdcorejs-angular`). NestJS track flipped to ✅ Complete in the entry files.
- Reconciled `_refs/sdlc/nestjs.md` + `_refs/nestjs/architecture-principles.md`: canonical core `@sdcorejs/nestjs`; permission codes flat `<module>_<entity>:<action>` (e.g. `crm_task:create`); schema-per-module Postgres; `synchronize` in dev / migrations in prod (init-project ships a safe no-op `migration:run` + empty `src/migrations/` so the Plan 2 Dockerfile CMD never fails).
- Grounded in real repos: core `Documents/sdcorejs/sdcorejs-nestjs`; reference modular monolith `Documents/local-solution/enterprise-platform/enterprise-platform`.

### Phase 4 — Solution builder (Plan 4)
- `skills/orchestration/solution-builder.md` (`sdcorejs-solution-builder`) — the non-tech one-door orchestrator. **Composes** existing skills (no new generation logic): persona → clarify(feature+UI) → write-spec/review-spec (**GATE 1**) → write-plan/review-plan (**GATE 2**) → `sdcorejs-nestjs` → `sdcorejs-angular` → `sdcorejs-dockerize` → `sdcorejs-auth` → `sdcorejs-run-guide` → `verify-before-done` → "here's how to run it". Both gates kept, plainly worded ("Does this match what you wanted?"); silence ≠ approval.

### Cross-cutting convention (recorded in entry files + persona ref)
- **Skills go global → English source.** Author skill `name`/`description`/body/notes/comments in English. At runtime, detect the user's language and both trigger-match and respond in it. (CLAUDE.md/AGENTS.md/copilot rule 5.) **All NEW content from Phase 3 onward is English; the ~40 pre-existing VI-laden descriptions are NOT yet retrofitted — see Deferred.**

---

## Quality / process notes

- Every phase ran **subagent-driven** (fresh subagent per task + independent review). Reviews caught + fixed real defects:
  - Plan 2: `KC_DB_NAME` default in compose `KC_DB_URL`.
  - Plan 3: **4 blocking cross-pack drifts** — `SdPagingReq/Res` vs `PagingReq/Res`, `BaseService.update(id, entity)` arg order, missing `src/common/errors.ts` (`badRequest`), missing `SdContext.fullName` — all repaired in `aabc5e7`.
- "Tests" here = the repo's real gates (frontmatter check, mirror `--check`, `git grep`, structural lint), since this is a docs/skills repo. Live `docker compose up` / `npm run build` of generated output is a target-project E2E, out of scope to land the branch.

---

## How to continue (next session)

1. **Sanity-check the checkout** (after pull on the other machine):
   ```bash
   cd <repo>
   git rev-parse --short HEAD              # expect 5c2303f (or later)
   git status --short                       # clean
   bash .claude/sync-skills.sh --check      # 41 skills, all "in sync"
   npx lefthook run check                   # frontmatter / sync / core-version green
   ```
2. **Open + merge the PR** (`--no-ff`) — see Git state above.
3. **Reference repos** the nestjs packs are grounded on (read-only, for any nestjs pack edits):
   - Core: `Documents/sdcorejs/sdcorejs-nestjs` (package `@sdcorejs/nestjs` v0.1.6).
   - Reference app: `Documents/local-solution/enterprise-platform/enterprise-platform`.

### Repo gotchas (carry forward)
- **Never hand-edit** `.claude/skills/`, `plugin/skills/`, `.claude/_refs`, `plugin/_refs` — they're generated. Edit `skills/<area>/*.md` + `_refs/**`, then `bash .claude/sync-skills.sh` and stage the mirrors. lefthook (`pre-commit`) re-syncs + checks; `sync-skills.sh` takes ~30–90s.
- Mirror dir name = the skill's `name:` frontmatter, NOT the filename.
- `_refs/**` files have **no frontmatter** (reference data); `skills/**` files **must** have frontmatter (`name`/`description`/`allowed-tools`).
- `gh` is **not installed** on the build machine — PR creation is manual via URL.
- When scripting git/bash, the shell cwd can reset between calls — prefix commands with `cd <repo> && …`.
- The pre-existing `WARN: no 'name:' frontmatter in skills/tracks/nestjs/_README.md` on every sync is benign (it's a README, intentionally skipped).

---

## Deferred follow-ups (not done; pick up anytime)

1. **English retrofit of ~40 existing skill descriptions/triggers.** The skills-go-global convention is set + applied to new content, but the inherited skills still carry Vietnamese trigger phrases. Do a dedicated sweep; **verify trigger-eval afterward** (VI phrases currently aid VI-request matching, so confirm dispatch accuracy doesn't regress). `docs/skill-eval-sets/` holds the eval JSONs.
2. **`_refs/nestjs/review-code.md` still references `be-masterdata`** as the baseline (out of scope in Plan 3 Task 7). Reconcile to `@sdcorejs/nestjs` as canonical, like the sdlc + architecture-principles docs already were.
3. **nestjs integration-test pack** — using the core's `pg-mem` fixture (a natural Plan 3.5 once codegen is exercised end-to-end).
4. **Live E2E** — run `sdcorejs-solution-builder` end to end in a real target project and confirm the generated stack actually `docker compose up`s (the only validation the agent repo couldn't do itself).

---

## Key file index

- Design: `docs/superpowers/specs/2026-06-06-non-tech-solution-builder-design.md`
- Plans: `docs/superpowers/plans/2026-06-06-{persona-layer-and-write-code-rename, infra-group-dockerize-auth-runguide, sdcorejs-nestjs-packs, solution-builder-orchestrator}.md`
- New skills: `skills/orchestration/{persona,solution-builder}.md`, `skills/infra/{dockerize,auth,run-guide}.md`
- New refs: `_refs/shared/persona.md`, `_refs/infra/*`, `_refs/nestjs/core-catalog.md`, `_refs/nestjs/write-code/*`
- Upgraded: `skills/tracks/nestjs/write-code.md`
- Tests: `TESTING.md` Tests 7 (persona), 8 (infra), 9 (nestjs), 10 (solution-builder)
