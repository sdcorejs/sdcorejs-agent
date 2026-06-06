# SDCoreJS SDLC Agent — GitHub Copilot Instructions

This repository is an **SDLC agent** for the SDCoreJS ecosystem. When you (GitHub Copilot) work in this repo or in a target project that uses SDCoreJS stacks, follow these instructions.

## Stacks supported

- **Backoffice portals** in Angular with `@sdcorejs/angular` (Core UI)
- **Backend** in NestJS + Postgres
- **Public sites** in Next.js (SSR)

## Tracks and status

| Track | Path | Status |
| --- | --- | --- |
| Angular Portal | `skills/tracks/angular/` | ✅ Complete (design-phase cross-track skills + 1 angular skill: the `angular-write-code` orchestrator (onboarding via `sdcorejs-using-skills`), which dispatches 6 on-demand reference packs under `_refs/angular/write-code/`: init-portal, init-module, init-entity, screen-list, screen-detail (CREATE / UPDATE / DETAIL states + form refinement), actions (workflow / bulk / custom side-effects)). Design phase + spec/plan moved to cross-track `skills/shared/sdlc/`. Cross-track `orchestration/comment-code` absorbs the previous per-track `51-write-comments`. |
| NestJS | `skills/tracks/nestjs/` | ✅ Complete — the `nestjs-write-code` orchestrator (onboarding via `sdcorejs-using-skills`) dispatches on-demand reference packs under `_refs/nestjs/write-code/`: init-project, init-module, init-entity (full CRUD stack), actions (custom / non-CRUD endpoints). Core: `@sdcorejs/nestjs` (`_refs/nestjs/core-catalog.md`). Design phase usable via shared/sdlc/; review + testing already in place. |
| Next.js | `skills/tracks/nextjs/` | ✅ `build-website/` pack complete (1 track skill: `nextjs-write-code` orchestrator (onboarding via `sdcorejs-using-skills`); the orchestrator dispatches 10 on-demand reference packs under `_refs/nextjs/build-website/write-code/`: init-site … content-quality). EXISTING-site audit folded into `sdcorejs-review` (nextjs site-audit mode). Design phase moved to cross-track shared/sdlc/. |

Cross-cutting skills live in:
- `skills/shared/sdlc/` — **6 cross-track design-phase skills** (brainstorm, clarify-requirements, write-spec, review-spec, write-plan, review-plan) + `_refs/{angular,nextjs,nestjs}.md`
- `skills/orchestration/` — SDLC plumbing (18 files: parallel-dispatch, subagent-driven-dev, repair-loop, auto-docs, auto-summary, recovery, auto-specs, auto-plans, memories, auto-task-tracker, verify-before-done, branch-ready, comment-code, ship, using-worktrees, using-skills, persona, solution-builder)
- `skills/shared/conventions/` + `shared/workflow/` — commits, changelog, dep-update, debug, env-setup, pr-create, code-map
- `skills/review/` — `sdcorejs-review` (one track-aware skill, dimensions: code / security / performance / accessibility) + `sdcorejs-review-architecture` (module-level)
- `skills/testing/` — `sdcorejs-tdd` (RED-first) + `sdcorejs-test` (track+level-aware: unit/integration/e2e); principles in `_refs/shared/testing-philosophy.md`

Dispatch is by skill `name:` frontmatter, not path.

## Skill structure

Each track exposes capabilities as **skills** — markdown files with YAML frontmatter:

```yaml
---
name: <kebab-case skill name>
description: Use when ... (the trigger description used for dispatch)
allowed-tools: Read, Write, Edit, ...
---
```

## Skill dispatch protocol

1. **At session start**, glob `skills/*/*.md` and read each skill's frontmatter (cheap — body load happens later).
2. **When the user makes a request**, match it against each skill's `description` (the "Use when..." trigger). Pick the highest-confidence match.
3. **Read that skill's body** and follow its instructions exactly.
4. **If multiple skills tie**, pick the lowest-numbered one in the workflow (clarify before plan, plan before write-code, etc).
5. **If no skill matches**, ask a clarifying question or invoke `sdcorejs-using-skills` (the bootstrap, which now serves onboarding).

## Workflow per track

Design phase is cross-track (`skills/shared/sdlc/`); code-writing is per-track.

```
Request
  → shared/sdlc/01-brainstorm   (sdcorejs-brainstorm, optional)
  → shared/sdlc/02-clarify-requirements   (sdcorejs-clarify-requirements)
  → shared/sdlc/03-write-spec → shared/sdlc/04-review-spec   (approval gate)
                              → orchestration/auto-specs  (MANDATORY on approval — snapshot to .sdcorejs/specs/<track>/)
  → shared/sdlc/05-write-plan       → shared/sdlc/06-review-plan  (approval gate)
                              → orchestration/auto-plans  (MANDATORY on approval — snapshot to .sdcorejs/plans/<track>/)
  → <track>-write-code (track-specific orchestrator; dispatches sub-skills; uses orchestration/subagent-driven-dev when fan-out ≥3)
       angular:         angular-write-code
       nextjs (build-website): nextjs-write-code
       nestjs:                 nestjs-write-code (loads _refs/nestjs/write-code/ packs: init-project | init-module | init-entity | actions)
  → sdcorejs-test → sdcorejs-review (auto-detects track) → orchestration/repair-loop (if findings)
  → orchestration/comment-code (MANDATORY ASK: skip/simple/medium/full — all levels applied inline; cross-track baseline + per-track addenda inside the skill)
  → orchestration/verify-before-done (MANDATORY acceptance gate) → orchestration/branch-ready (branch-hygiene sweep)
  → orchestration/auto-docs (MANDATORY) → orchestration/auto-task-tracker (MANDATORY) + orchestration/memories (durable knowledge)
```

After `branch-ready`, an **OPTIONAL packaging branch** may run `sdcorejs-dockerize → sdcorejs-auth → sdcorejs-run-guide` to deliver a runnable Docker stack (the non-tech default). See "Infra / packaging" below.

**Non-tech one-door:** `sdcorejs-solution-builder` chains persona → clarify (feature+UI) → spec/plan (gates) → nestjs-write-code → angular-write-code → dockerize → auth → run-guide → verify.

Each cross-track design skill detects the target track at runtime and loads `skills/shared/sdlc/_refs/<track>.md` for track-specific patterns.

For the angular track, `write-code` is the single orchestrator; it loads on-demand reference packs from `_refs/angular/write-code/` (no frontmatter, not dispatchable skills):
`init-portal`, `init-module`, `init-entity`, `screen-list`, `screen-detail` (CREATE / UPDATE / DETAIL states + reactive-form refinement), `actions` (workflow / bulk / custom side-effects).

## Mandatory rules (apply to every track)

1. **Auto-docs is mandatory.** At the end of every code-writing skill invocation, run the track-agnostic `auto-docs` skill at `skills/orchestration/auto-docs.md`. This writes a session summary to the **target project's** `.sdcorejs/docs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md` (leading dot is required). Do NOT write the doc to this `sdcorejs-agent` repo.

2. **Auto-specs / auto-plans are mandatory.** Immediately after `sdcorejs-review-spec` returns explicit user approval, run `skills/orchestration/auto-specs.md` to persist the approved spec snapshot to `<target>/.sdcorejs/specs/<track>/`. Immediately after `sdcorejs-review-plan` approval, run `skills/orchestration/auto-plans.md` to persist the approved plan snapshot to `<target>/.sdcorejs/plans/<track>/`. The corpus lets future `sdcorejs-write-spec` / `sdcorejs-write-plan` mirror the user's confirmed structure.

3. **Memories.** Durable cross-session knowledge lives under the target project's `.sdcorejs/memories/<track>/`, managed by `skills/orchestration/memories.md`. Write when the user says "ghi nhớ"/"remember this" or when a recurring correction is detected.

4. **Session-start ritual.** When opening a target project, glob the target's `.sdcorejs/docs/<track>/*.md` (latest 3) and `.sdcorejs/memories/<track>/*.md` (frontmatter), and silently load that as context before answering. Also glob `.sdcorejs/specs/<track>/*.md` and `.sdcorejs/plans/<track>/*.md` (frontmatter only) so the next `sdcorejs-write-spec` / `sdcorejs-write-plan` can mirror style. Also glob `.sdcorejs/persona.md`; if absent on the first substantive request, invoke `sdcorejs-persona` to set it. Once set, load `_refs/shared/persona.md` and adapt all user-facing output to the stored persona.

5. **Skills go global — English source, runtime-localized I/O.** Author every skill's `name`, `description`, body, notes, and inline comments in **English** (skills are published for a global audience). At runtime, detect the user's language from their message and BOTH match triggers and respond in that language — Vietnamese request → Vietnamese reply (full diacritics for labels/messages); English → English. Permission codes and route paths stay English in both. (Generated artifacts in a target project: follow the user's language for prose, English for identifiers.)

6. **Clarify-before-code.** Do NOT generate code if track-specific minimum-required answers are unconfirmed. Invoke `sdcorejs-clarify-requirements` first (or `sdcorejs-brainstorm` for open-ended ideas).

7. **Approval gates.** `sdcorejs-review-spec` and `sdcorejs-review-plan` REQUIRE explicit user approval before proceeding. Approval immediately fires the corresponding auto-specs / auto-plans tail-call (rule 2).

8. **Core UI first.** Use `@sdcorejs/angular` components when one fits. Otherwise generate skeleton + `alert('TODO: ...')` stubs and mark for the developer.

9. **Test after generation.** Run `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts` and report summary + failing spec names.

10. **Evidence before claims (always-on).** Never state that something passes, builds, is fixed, or is done without having run the verifying command in the current turn and read its output. This applies to EVERY success claim — interim or final, your own work or a subagent's — not only at the `sdcorejs-verify-before-done` gate. Treat a subagent's "✅ done" as a claim to verify, never as fact. "Should pass" / "looks correct" / a previously-green run are not evidence. Inspired by `superpowers:verification-before-completion`.

11. **Persona-aware output.** Read the target project's `.sdcorejs/persona.md` (default `tech` if absent) and load `_refs/shared/persona.md` before producing user-facing output. `non-tech` = no unexplained jargon, hidden mechanics, forced infra defaults (Angular + NestJS modular-monolith + Keycloak + Postgres on docker-compose), always finish with a run guide, both approval gates kept but plainly worded (soft gates), requirement questions about features + UI not architecture. `tech` = unchanged baseline. Orthogonal to the bilingual rule. Managed by `sdcorejs-persona`.

## Copilot-specific notes

- The chat mode `.github/chatmodes/sdcorejs.chatmode.md` provides a focused experience for SDCoreJS work. Activate it when working on SDCoreJS-stack projects.
- Prompt files in `.github/prompts/` are legacy fallback prompts kept for teammates without skill-aware Copilot. They duplicate skill content in a single-prompt form.
- When a skill's `allowed-tools` includes `Bash`, Copilot's terminal tool is the equivalent.

## Cross-track skills

Cross-track skills — apply to all tracks. Dispatch by `description`; directory location is organizational, not a dispatch key.

### Design phase (`skills/shared/sdlc/`)
| Skill | Trigger | Mandatory? |
| --- | --- | --- |
| `sdcorejs-brainstorm` | open-ended idea before scope is fixed | optional |
| `sdcorejs-clarify-requirements` | request for concrete artifacts | ✅ |
| `sdcorejs-write-spec` | after clarify confirms | ✅ |
| `sdcorejs-review-spec` | after write-spec | ✅ |
| `sdcorejs-write-plan` | after review-spec approves | ✅ |
| `sdcorejs-review-plan` | after plan | ✅ |

### Orchestration + utility
| Skill | Trigger | Mandatory? |
| --- | --- | --- |
| `sdcorejs-verify-before-done` | runs BEFORE auto-docs — verifies acceptance criteria; blocks "done" | ✅ |
| `sdcorejs-branch-ready` | branch-hygiene sweep AFTER verify-before-done (debug logs, secrets, focused tests, lint+build+test). Inspired by `superpowers:finishing-a-development-branch` | ✅ |
| `sdcorejs-auto-docs` | end of every code-writing task — session summary | ✅ |
| `sdcorejs-auto-specs` | IMMEDIATELY after `sdcorejs-review-spec` approval | ✅ on approval |
| `sdcorejs-auto-plans` | IMMEDIATELY after `sdcorejs-review-plan` approval | ✅ on approval |
| `sdcorejs-auto-task-tracker` | IMMEDIATELY after auto-docs | ✅ |
| `sdcorejs-memories` | "ghi nhớ", durable knowledge | ✅ on trigger |
| `sdcorejs-repair-loop` | after `sdcorejs-review` outputs findings | ✅ on findings |
| `sdcorejs-comment-code` | ASK gate at comment phase — skip/simple/medium/full | ✅ ASK |
| `sdcorejs-persona` | first request in a target project with no `.sdcorejs/persona.md`; "giải thích dễ hiểu", "set persona" — ask-once tech/non-tech, store flag, load `_refs/shared/persona.md` | auto on first entry |
| `sdcorejs-solution-builder` | "build me an app / a system; the non-tech one-door full-app flow" — chains persona → clarify → spec/plan (2 gates) → nestjs-write-code → angular-write-code → dockerize → auth → run-guide → verify |  |
| `sdcorejs-code-map` | new feature / reuse check — read-only architecture scan |  |
| `sdcorejs-parallel-dispatch` | fan-out 3+ independent tasks — decision gate |  |
| `sdcorejs-subagent-driven-dev` | after parallel-dispatch=YES |  |
| `sdcorejs-commit` | "commit", "tạo commit" — Conventional Commits |  |
| `sdcorejs-pr-create` | "tạo PR", "open PR" |  |
| `sdcorejs-debug` | non-trivial bug needing systematic debugging |  |
| `sdcorejs-recovery` | "tiếp tục", "resume" |  |
| `sdcorejs-env-setup` | "thiết lập môi trường", "setup dev" |  |
| `sdcorejs-changelog` | "viết changelog", release |  |
| `sdcorejs-review` | cross-track security checklist — track-aware (detects stack, deepens via `_refs/<track>/review-security.md`) |  |
| `sdcorejs-dep-update` | "cập nhật dependency", audit fix |  |

### Infra / packaging (`skills/infra/`)

Emit a one-command runnable Docker stack into a target project's **deploy root** (never this repo). Templates live in `_refs/infra/`. Non-tech is the default consumer; composes with the angular + nestjs tracks.

| Skill | Trigger | Emits |
| --- | --- | --- |
| `sdcorejs-dockerize` | "dockerize", "đóng gói docker", "chạy bằng docker" | Dockerfiles + `docker-compose.yml` (FE + BE + Keycloak + Postgres), `.env`, nginx |
| `sdcorejs-auth` | "thêm đăng nhập", "cấu hình keycloak", "xác thực" | Keycloak realm import + FE `provideSdKeycloak` + BE token-validation wiring |
| `sdcorejs-run-guide` | "hướng dẫn chạy", "cách chạy", "start guide" | plain-language `START.md` (install Docker → one command → URL → demo login) |

## Reference docs (load on demand only)

- `skills/shared/sdlc/_refs/{angular,nextjs,nestjs}.md` — track-specific design-phase patterns
- `skills/tracks/angular/_refs/core-version.md` — pinned `@sdcorejs/angular` version
- `skills/tracks/angular/_refs/sdcorejs-angular-catalog.md` — Core UI components inventory
- `skills/tracks/angular/_refs/entity-field-types.md` — field type → form control mapping
- `skills/tracks/angular/_refs/templates/entity-{skeleton,tests,example-product}.md` — extracted code templates for the init-entity reference pack
- `_refs/angular/write-code/{init-portal,init-module,init-entity,screen-list,screen-detail,actions}.md` — on-demand reference packs loaded by `angular-write-code`
- `_refs/nestjs/core-catalog.md` — `@sdcorejs/nestjs` core inventory
- `_refs/nestjs/write-code/{init-project,init-module,init-entity,actions}.md` — on-demand reference packs loaded by `nestjs-write-code`

## Anti-patterns

- ❌ Don't author new skills without explicit user approval. To propose a new skill, ask first.
- ❌ Don't skip clarify-before-code even if scope seems obvious — the user must confirm.
- ❌ Don't write `.sdcorejs/docs/`, `.sdcorejs/specs/`, `.sdcorejs/plans/`, or `.sdcorejs/memories/` content in this `sdcorejs-agent` repo. Auto-docs / auto-specs / auto-plans / memories always target the user's working project.
- ❌ Don't load all skill bodies at session start — frontmatter only for dispatch; full body only when a skill is picked.

## See also

- `CLAUDE.md` — same instructions for Claude Code
- `AGENTS.md` — same instructions for Codex / Cursor / generic AGENTS.md-aware tools
- `.github/chatmodes/sdcorejs.chatmode.md` — Copilot specialized chat mode

## Persistent repo memory (legacy)

Reference docs may still mention `knowledge/repo-memory/`. That directory holds older context kept for reference; do NOT load it eagerly. The new skill structure under `skills/<track>/` is the primary source of truth.
