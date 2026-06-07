# Design — Non-tech enablement: persona layer + infra group + `sdcorejs-solution-builder`

**Date:** 2026-06-06
**Status:** Delivered — Phases 1–4 shipped (persona+rename, infra, nestjs packs, solution-builder).
**Repo affected:** `sdcorejs-agent` (the SDLC skill pack itself)

## Problem & Goals

The skill pack today has three **stack** tracks (angular, nestjs, nextjs) sharing one
cross-track SDLC pipeline. Every skill assumes a **developer** reader: it uses domain
jargon, surfaces the full pipeline, and leaves environment/run concerns to the developer.

We want the pack to also serve **low/non-tech** users (PO, QC) so they can "vibe code"
working software while the pack still enforces the five non-negotiables:

| Principle | Already enforced by |
|---|---|
| TDD | `sdcorejs-tdd` (RED-first) + `sdcorejs-test` |
| Security | `sdcorejs-review` (security dimension) + `_refs/<track>/review-security.md` |
| Architecture & Maintenance | `sdcorejs-review-architecture` + `_refs/<track>/architecture-principles.md` |
| Clean Code | `sdcorejs-review` (code dimension) |
| Clear comment | `sdcorejs-comment-code` |

**Key insight:** the five principles already have skills. This work does NOT re-implement
them. It adds (1) a way to *talk to* non-tech users without jargon and (2) a way to *deliver
something they can run* — a Dockerized, one-command stack — while the existing principle
skills keep running underneath (silently for non-tech, results explained in plain language).

For non-tech users the delivered software is opinionated and fixed so they never have to
install or wire anything:

- **Backend:** modular monolith (NestJS) + Keycloak auth + Postgres.
- **Frontend:** Angular (backoffice is the common non-tech use case).
- **Packaging:** `docker-compose` — one `docker compose up` brings up be / fe / keycloak /
  postgres; Postgres data on a named volume; the stack exposes a BE port and an FE port.
- **Run guide:** a plain-language `START.md` (install Docker Desktop → one command → open
  these URLs → default login → troubleshooting).

## Decisions locked during brainstorming

1. **Framing = layer, not a new track.** Persona is a cross-cutting layer (like the bilingual
   rule). The Docker/Keycloak/Postgres capability is a new *infra/packaging* skill group that
   composes with the existing angular + nestjs tracks. No track duplication.
2. **Topology = `docker-compose`, one `up`.** Each concern is its own container (be, fe,
   keycloak, postgres) bundled in one `docker-compose.yml`; Postgres on a named volume so a
   rebuild never drops data. Rejected: cramming everything into a single image (data-loss and
   debuggability anti-pattern). The non-tech user still types only one command.
3. **Persona trigger = ask once, store flag.** On first entry the persona skill asks one
   question and writes `.sdcorejs/persona.md` (`persona: tech | non-tech`). Every later skill
   reads the flag and never re-asks. No language-based guessing.
4. **Scope = Approach B.** Lean infra + an assembly orchestrator named
   **`sdcorejs-solution-builder`** that gives non-tech a single entry point, *plus* building
   out the nestjs track (currently scaffold) so the BE is generated for real.
5. **FE default = Angular** for the non-tech path. Next.js stays available but is not the
   non-tech route.
6. **Keycloak already exists on both ends.** Angular ships `@sdcorejs/angular/modules/keycloak`
   (`provideSdKeycloak` + interceptor + façade wiring). NestJS already has a Keycloak provider.
   So the auth skill *configures and wires existing providers* — it does not build auth from
   scratch.
7. **Approval gates unchanged.** Non-tech keeps both gates (spec + plan); only the wording is
   simplified to plain language. We do NOT collapse to a single gate.

## Non-goals

- Not building a new stack track; not duplicating BE/FE generation logic.
- Not re-implementing the five principle skills.
- Not implementing auth from scratch (providers already exist).
- Not a single-image "everything in one container" deployment.
- Not Kubernetes / cloud deploy — local `docker compose` only for now.
- Not removing or changing the developer (tech-persona) experience.

## Architecture — two orthogonal axes over the existing tracks

```
                 persona layer (cross-cutting, ask-once flag)
                 ────────────────────────────────────────────
ANGULAR ─┐
NESTJS  ─┼──►  existing SDLC pipeline (clarify → spec → plan → code → test → review → …)
NEXTJS  ─┘                         │
                                   ▼
                 infra/packaging group  (dockerize · auth · run-guide)
                                   │
                                   ▼
                 sdcorejs-solution-builder  (non-tech one-door orchestrator,
                 chains: persona → clarify → spec/plan(plain) → BE(nestjs) →
                 FE(angular) → dockerize → keycloak → run-guide → verify)
```

The persona flag changes *behavior and wording* of skills; the infra group adds *new
capabilities*; the orchestrator *composes* tracks + infra for the non-tech one-command result.

## New / changed components

### 1. Persona layer

**`sdcorejs-persona`** (new skill, `skills/orchestration/persona.md`)
- Ask-once: on first entry to a target project, ask "how should I explain things —
  technical (dev) or plain (PO/QC)?" Write `.sdcorejs/persona.md`:
  ```md
  ---
  persona: non-tech   # tech | non-tech
  set: 2026-06-06
  ---
  ```
- Idempotent: if the file exists, read it and do not re-ask. Re-runnable to change persona.
- Read at session start (added to the session-start ritual in CLAUDE.md).

**`_refs/shared/persona.md`** (new shared reference — the behavior contract, loaded on demand)
- `non-tech` →
  - No domain jargon; explain WHAT and HOW in plain language; define any unavoidable term.
  - Hide pipeline mechanics (don't narrate "running repair-loop"); show progress as outcomes.
  - Force infra defaults: docker-compose + keycloak + postgres + Angular FE.
  - Always finish a build with a run-guide and a plain "here's how to start it".
  - Gate prompts (spec/plan approval) phrased as "does this match what you wanted?" — still two
    gates, plain wording.
- `tech` → current behavior, unchanged.

**CLAUDE.md rule** — add: "Read `.sdcorejs/persona.md` (default `tech` if absent) and load
`_refs/shared/persona.md` before producing user-facing output." DRY: behavior lives in one
ref, not duplicated across every skill.

### 2. Infra / packaging group (`skills/infra/`)

**`sdcorejs-dockerize`**
- Generates: BE `Dockerfile` (multi-stage Node), FE `Dockerfile` (build + static serve),
  `docker-compose.yml` with services `be`, `fe`, `keycloak`, `postgres`.
- Postgres on a named volume; healthchecks; `depends_on`; config via `.env`.
- Supports **dev mode** (source volume-mount + hot reload) and **prod mode** (built images).
- Idempotent: if compose/Dockerfiles exist, merge rather than overwrite.

**`sdcorejs-auth`** (generic auth skill — Keycloak is the only provider for now)
- Provider-agnostic skill; provider-specific steps live in a knowledge ref
  (`_refs/infra/auth-keycloak.md`). Today the only provider is Keycloak; adding another later
  means a new knowledge ref, not a new skill.
- Keycloak path (current): exports a realm JSON (realm + client + default roles + a default
  admin/user) imported by the keycloak container on startup.
- BE: wires the existing NestJS Keycloak provider to the compose keycloak service URL.
- FE (Angular): generates `app.config.ts` with `provideSdKeycloak` + tenant config pointing at
  the compose keycloak service, adds `public/silent-renew.html`, and wires the
  permission/layout/auth façades per `_refs/angular/sdcorejs-angular/modules/sd-keycloak.md`.
- Scope = configure + wire existing providers; does NOT build auth.

**`sdcorejs-run-guide`**
- Generates `START.md` for non-tech: install Docker Desktop → `docker compose up` → which URL
  is the app vs the login server → default username/password → common problems + fixes.
- Plain language, no jargon (governed by the persona ref).

*(Postgres bundling folds into `dockerize`; no separate DB skill.)*

### 3. Orchestrator `sdcorejs-solution-builder` (new skill)

One-door entry for non-tech. Chains, each step rendered in plain language; the two approval
gates are kept:

```
set/read persona (non-tech)
  → clarify (plain)              [sdcorejs-clarify-requirements]
  → spec  → GATE 1 (plain)       [sdcorejs-write-spec / -review-spec]
  → plan  → GATE 2 (plain)       [sdcorejs-write-plan / -review-plan]
  → BE module(s)                 [nestjs write-code — see §4]
  → FE                           [angular write-code, FE=Angular]
  → dockerize                    [sdcorejs-dockerize]
  → auth (keycloak)              [sdcorejs-auth]
  → run-guide                    [sdcorejs-run-guide]
  → verify                       [sdcorejs-verify-before-done]
  → "here's how to run your app" [points at START.md]
```

Tech users continue to use the granular skills directly; the orchestrator is optional for them.

### 4. nestjs track build-out (prerequisite for the BE)

Each track exposes a **single** `write-code` skill that loads on-demand reference packs — the
angular pattern (`angular-write-code` → `_refs/angular/write-code/{init-portal, init-module,
init-entity, screen-list, screen-detail, actions}.md`). The nestjs track has the skill but **no
packs yet**. Build out `_refs/nestjs/write-code/` to mirror angular, e.g.
`init-project, init-module, init-entity, controller, service, repository`, dispatched by the one
`nestjs-write-code` skill (no numbered per-capability sub-skills).

These packs generate code against the (nearly complete) `sdcorejs-nestjs` framework and its
Keycloak provider — i.e. they wire an existing framework, they don't build the framework.
`sdcorejs-solution-builder` depends on these for the BE half.

*(Related cleanup — convention drift: the track skills still live at
`skills/tracks/<track>/07-write-code.md`. Since each track now has exactly one write-code skill,
the `07-` prefix is meaningless. Rename to `skills/tracks/<track>/write-code.md` across all three
tracks + update references (CLAUDE.md, AGENTS.md, copilot-instructions) + regenerate the
`.claude/skills/` mirror. New skill files added by this design carry no numeric prefix.)*

## File / layout changes (in `sdcorejs-agent`)

- `skills/orchestration/persona.md` (new skill)
- `skills/infra/dockerize.md`, `skills/infra/auth.md`, `skills/infra/run-guide.md` (new)
- `_refs/infra/auth-keycloak.md` (new — Keycloak provider knowledge for `sdcorejs-auth`)
- `skills/orchestration/solution-builder.md` (new skill)  *(or `skills/tracks/`? — orchestration,
  since it composes tracks; final location decided in the plan)*
- `_refs/nestjs/write-code/{init-project,init-module,init-entity,controller,service,repository}.md`
  — new on-demand reference packs loaded by the single `nestjs-write-code` skill (mirrors
  `_refs/angular/write-code/`)
- `skills/tracks/{angular,nestjs,nextjs}/07-write-code.md` → rename to `write-code.md` (drop the
  now-meaningless numeric prefix; one write-code skill per track)
- `_refs/shared/persona.md` (new behavior contract)
- `_refs/infra/` — compose/Dockerfile/realm-JSON templates loaded by the infra skills
- `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md` — persona session-start rule +
  new skills in the inventory tables + workflow diagram
- `.claude/skills/` mirror — regenerated by `sync-skills.sh` (do not hand-edit)

## Sequencing (phases, each shippable)

1. **Persona layer** — `sdcorejs-persona` + `_refs/shared/persona.md` + CLAUDE.md rule. Small;
   unlocks plain-language everywhere. No dependency. — ✅ shipped (Plan 1: persona layer + `07-` rename cleanup).
2. **Infra group** — `dockerize` → `auth` → `run-guide`. Composes with existing
   angular output; can be exercised against an existing Angular app + scaffold BE. — ✅ shipped (Plan 2).
3. **nestjs build-out** — new `_refs/nestjs/write-code/` packs (mirror angular). Largest chunk. — ✅ shipped (Plan 3).
4. **solution-builder** — ties 1+2+3 together for the non-tech one-door flow. — ✅ shipped (Plan 4).

Phases 1 and 2 are independent and could run in parallel. Phase 4 needs 1+2+3.

## Acceptance criteria

- [ ] First entry to a fresh target project asks persona once and writes `.sdcorejs/persona.md`;
      second entry does not re-ask.
- [ ] With `persona: non-tech`, skill output contains no unexplained domain jargon and ends a
      build with a run-guide. With `persona: tech`, output is byte-for-byte the current behavior.
- [ ] `sdcorejs-dockerize` produces a `docker-compose.yml` where `docker compose up` starts be /
      fe / keycloak / postgres, Postgres uses a named volume, and BE + FE ports are reachable.
- [ ] `sdcorejs-auth` (Keycloak provider) produces an importable realm JSON and wiring such that
      a fresh `up` lets a default user log into the Angular FE via Keycloak.
- [ ] `START.md` lets a non-tech reader go from zero to a running app using only the document.
- [ ] `sdcorejs-solution-builder` runs the full chain, keeping both approval gates, and ends by
      pointing the user at `START.md`.
- [ ] The five principle skills still run in the non-tech flow (TDD/security/arch/clean/comment);
      their results are reported in plain language.
- [ ] `sync-skills.sh` regenerates the `.claude/skills/` mirror with no drift; lint/build pass.

## Risks & mitigations

- **One-container request vs compose reality.** User originally said "one container"; we chose
  compose for data safety. *Mitigation:* run-guide still presents it as "one command", matching
  the felt simplicity.
- **nestjs build-out is the biggest unknown.** *Mitigation:* phase it last; solution-builder can
  ship against scaffold BE first, then deepen.
- **Persona behavior drift across skills.** *Mitigation:* single `_refs/shared/persona.md`
  contract + one CLAUDE.md rule, not per-skill edits.
- **Keycloak realm import portability** across Keycloak versions. *Mitigation:* pin the keycloak
  image tag in compose; template the realm JSON for that version.
- **Token cost** of solution-builder running the full pipeline unattended. *Mitigation:* keep the
  two human gates; let the user stop between phases.

## Out of scope (this design)

- Kubernetes / cloud deployment, CI pipelines, multi-tenant Keycloak.
- Next.js as a non-tech FE.
- Minute/hour-level infra tuning, secrets management beyond `.env`.
- Collapsing the two approval gates into one.
