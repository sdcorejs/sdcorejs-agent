# SDCoreJS SDLC Agent — Claude Code Instructions

This repository (`sdcorejs-agent`) is an **SDLC agent** for the SDCoreJS ecosystem:

- **Backoffice portals** in Angular with `@sdcorejs/angular` (Core UI)
- **Backend** in NestJS + Postgres
- **Public sites** in Next.js (SSR)

When you (Claude Code) start a session — whether in this repo or in a target project that uses any of these stacks — follow these instructions.

## Tracks and status

| Track | Path | Status |
| --- | --- | --- |
| Angular Portal | `skills/tracks/angular/` | ✅ Complete (design-phase cross-track skills + 1 angular skill: the `sdcorejs-angular` orchestrator (onboarding via `sdcorejs-using-skills`). The orchestrator dispatches 7 on-demand reference packs under `_refs/angular/write-code/`: init-portal, admin-screens (always-on: account/role/permission), init-module, init-entity, screen-list, screen-detail (covers CREATE / UPDATE / DETAIL states + form refinement), actions (workflow / bulk / custom side-effects)). Design-phase + spec/plan/review skills moved to cross-track `skills/shared/sdlc/`. Cross-cutting code-review (single track-aware skill `sdcorejs-review` at `skills/review/review.md`) + e2e-test (`sdcorejs-test`). Cross-track comment-code (`orchestration/comment-code`) absorbs the previous per-track `51-write-comments`. |
| NestJS | `skills/tracks/nestjs/` | ✅ Complete — the `sdcorejs-nestjs` orchestrator (onboarding via `sdcorejs-using-skills`) dispatches on-demand reference packs under `_refs/nestjs/write-code/`: init-project (scaffold app), init-admin (always-on: users/roles/permissions), init-module (bounded-context module), init-entity (full CRUD stack: entity/repository/service/controller/Zod schema/DTO), actions (custom / non-CRUD endpoints — domain methods, cross-module, workflow, bulk, export). Core: `@sdcorejs/nestjs` (inventory in `_refs/nestjs/core-catalog.md`). Codegen is **profile-aware** — `simple` (default; single-tenant, flat Keycloak-role permissions, DTOs in `src/modules/<module>/dto/`, lib `WithAudit` + core `AuthGuard`, no `base/shared`/internal-secret) vs `enterprise` (multi-tenant + department scoping, page-permission matrix, `@shared` monorepo, `AdminAuthGuard`, internal-secret); the profile is set at clarify and recorded in `.sdcorejs/summary.md`. Design phase usable via shared/sdlc/; review + testing already in place — code / security / performance via the single track-aware `sdcorejs-review`, plus `sdcorejs-test`. |
| Next.js | `skills/tracks/nextjs/` | ✅ `build-website/` pack complete. 1 track skill: the `sdcorejs-nextjs` orchestrator (onboarding via `sdcorejs-using-skills`). The orchestrator dispatches 10 on-demand reference packs under `_refs/nextjs/build-website/write-code/`: init-site, theme, pages-and-blocks, seo, og-preview, i18n, caching, responsive, contact-form, content-quality (consolidated from the former 10-19 sub-skills). EXISTING-site audit folded into the cross-track `sdcorejs-review` (nextjs site-audit mode; knowledge in `_refs/nextjs/build-website/audit-existing-site.md`). Design-phase moved to cross-track `skills/shared/sdlc/`. |

Cross-cutting concerns live outside `tracks/`:
- `skills/shared/sdlc/` — **6 cross-track design-phase skills** (`sdcorejs-brainstorm`, `sdcorejs-clarify-requirements`, `sdcorejs-write-spec`, `sdcorejs-review-spec`, `sdcorejs-write-plan`, `sdcorejs-review-plan`) plus `_refs/sdlc/{angular,nestjs,nextjs}.md` for track-specific patterns. Replaces the duplicated per-track design files.
- `skills/orchestration/` — 18 SDLC plumbing skills (parallel-dispatch, subagent-driven-dev, repair-loop, auto-docs, auto-summary, recovery, auto-snapshot, memories, auto-task-tracker, verify-before-done, branch-ready, comment-code, ship, using-worktrees, using-skills, persona, solution-builder, write-user-guide)
- `skills/shared/conventions/` — Conventional Commits, changelog
- `skills/shared/workflow/` — env-setup, debug, pr-create, code-map, dep-update
- `skills/review/` — `sdcorejs-review` (one track-aware skill, dimensions: code / security / performance / accessibility; knowledge in `_refs/<track>/review-<dim>.md` + `_refs/shared/`) + `sdcorejs-review-architecture` (module-level structure)
- `skills/testing/` — `sdcorejs-tdd` (RED-first discipline) + `sdcorejs-test` (one track+level-aware skill: unit / integration / e2e); cross-track principles in `_refs/shared/testing-philosophy.md`, stack patterns in `_refs/<track>/test-<level>.md`

Each track exposes its capabilities as **skills** — markdown files with Anthropic-style YAML frontmatter (`name`, `description`, `allowed-tools`).

## Claude Code native dispatch

This repo also exposes every skill via the native `.claude/skills/<name>/SKILL.md` convention so Claude Code can dispatch them automatically without having to read this instruction file first. The mirror is generated from `skills/<track>/*.md` — do NOT hand-edit `.claude/skills/`.

Sync is enforced automatically: `lefthook.yml` runs `bash .claude/sync-skills.sh` on every commit that touches `skills/`, then stages the regenerated mirror. To install hooks once:

```bash
npm install && npx lefthook install
```

If lefthook is missing, run `npm run sync:skills` manually before committing. See `.claude/README.md`.

The source of truth remains `skills/<track>/*.md`. `.claude/skills/` is generated.

## Skill dispatch protocol

1. **At session start**, glob `skills/**/*.md` (exclude `_refs/**`; skills are identified by `name:` frontmatter) and read each skill's YAML frontmatter only (cheap — body load happens later).
2. **When the user makes a request**, match it against each skill's `description` (the "Use when..." trigger). Pick the highest-confidence match.
3. **Read that skill's body** and follow its instructions exactly.
4. **If multiple skills tie**, pick the lowest-numbered one in the workflow (clarify before plan, plan before write-code, etc).
5. **If no skill matches**, ask a clarifying question or invoke `sdcorejs-using-skills` (the bootstrap, which now serves onboarding).

## Workflow per track

Every track shares the same workflow shape. **Design phase is cross-track** (`skills/shared/sdlc/`); **code-writing phase is track-specific** (`skills/tracks/<track>/sdcorejs-<track>.md`; for angular the orchestrator loads on-demand reference packs under `_refs/angular/write-code/`).

```
Request
  ↓
shared/sdlc/01-brainstorm (sdcorejs-brainstorm)
  ← cross-track; detects target track + loads `_refs/sdlc/<track>.md`
  ← explores 2-3 approaches (skip if scope already clear)
  ↓
shared/sdlc/02-clarify-requirements (sdcorejs-clarify-requirements)
  ← cross-track; blocking questions per `_refs/sdlc/<track>.md`
  ↓
shared/sdlc/03-write-spec (sdcorejs-write-spec)
  ← cross-track; authors spec at <target>/.sdcorejs/docs/<track>/<timestamp>-<topic>-spec.md
  ↓
shared/sdlc/04-review-spec (sdcorejs-review-spec)
  ← cross-track; user-approval gate
  ↓
orchestration/auto-snapshot (SPEC mode)   ← MANDATORY on approval — snapshot to <target>/.sdcorejs/specs/<track>/
  ↓
shared/sdlc/05-write-plan (sdcorejs-write-plan)
  ← cross-track; numbered file-by-file plan
  ↓
shared/sdlc/06-review-plan (sdcorejs-review-plan)
  ← cross-track; user-approval gate
  ↓
orchestration/auto-snapshot (PLAN mode)   ← MANDATORY on approval — snapshot to <target>/.sdcorejs/plans/<track>/
  ↓
<track>-write-code (write-code, track-specific orchestrator)
  ← angular:        sdcorejs-angular     → loads on-demand reference packs from `_refs/angular/write-code/`: init-portal | init-module | init-entity | screen-list | screen-detail (CREATE / UPDATE / DETAIL states + form refinement) | actions (workflow / bulk / custom side-effects)
  ← nextjs (build-website): sdcorejs-nextjs → loads on-demand reference packs from `_refs/nextjs/build-website/write-code/`: init-site | theme | pages-and-blocks | seo | og-preview | i18n | caching | responsive | contact-form | content-quality
  ← nestjs:                sdcorejs-nestjs → loads on-demand reference packs from `_refs/nestjs/write-code/`: init-project | init-module | init-entity (full CRUD stack) | actions (custom / non-CRUD endpoints — domain methods, cross-module, workflow, bulk, export)
  └─ when feature has 3+ independent units, dispatches via
     orchestration/subagent-driven-dev (after orchestration/parallel-dispatch decision)
  ↓
FINISH GATE (_refs/shared/finish-gate.md)  ← MANDATORY + UNCONDITIONAL (standalone trigger OR full flow)
  ← one consolidated ASK: tests (default ON, RED-first/standard — opt-out ok) · comments (skip/simple/medium/full) ·
    user-guide (default ON) · review (default ON); always-on plumbing listed so the user knows it runs
  ← so a standalone "add entity" still surfaces tests/comments/user-guide — never silently skipped
  ↓ (tail steps below run honoring the gate's answers)
sdcorejs-test  (if tests not skipped)
  ← happy-path tests for what was generated
  ↓
sdcorejs-review (auto-detects track from dir architecture)
  ← convention check; outputs color-coded tables (🔴 Critical / 🟡 Important / 🔵 Minor + 🟢 Strengths) with Fix + Tradeoff
  ↓
orchestration/repair-loop
  ← apply review findings + iterate until Critical+Important resolved
  ↓
orchestration/comment-code
  ← applies the comment level the FINISH GATE captured (skip / simple / medium / full) — no second ASK
  ← all levels applied inline by orchestration/comment-code (cross-track baseline +
    per-track addenda live inside that skill; previous `51-write-comments`
    was consolidated)
  ↓
orchestration/verify-before-done
  ← MANDATORY acceptance-criteria gate before claiming "done"
  ↓
orchestration/branch-ready
  ← branch-hygiene sweep (debug logs, secrets, .only/.skip, lint+build+test pass)
  ← inspired by superpowers:finishing-a-development-branch
  ↓
orchestration/auto-docs  ← MANDATORY session summary to <target>/.sdcorejs/docs/<track>/
  ↓
sdcorejs-write-user-guide (Mode 1) ← MANDATORY per-module — update <target>/.sdcorejs/user-guide/<module>.md (features / routes / permissions / data + Coverage-vs-requirements); aggregate rebuilds at ship
orchestration/auto-task-tracker   ← MANDATORY (after write-user-guide) — tick done + append new in <target>/.sdcorejs/tasks/<track>.md
orchestration/memories            ← durable knowledge (when applicable) to <target>/.sdcorejs/memories/<track>/
```

After `branch-ready`, an **OPTIONAL packaging branch** may run `sdcorejs-dockerize → sdcorejs-auth → sdcorejs-run-guide` to deliver a runnable Docker stack (the non-tech default). See "Infra / packaging" below.

**Non-tech one-door:** `sdcorejs-solution-builder` chains persona → clarify (feature+UI) → spec/plan (gates) → build backend+frontend → dockerize → auth → run-guide → stack verify → branch-ready → auto-docs → write-user-guide → auto-task-tracker.

## Mandatory rules (apply to every track)

1. **Auto-docs is mandatory.** At the end of every code-writing skill invocation, run the track-agnostic `auto-docs` skill at `skills/orchestration/auto-docs.md`. This writes a session summary to the **target project's** `.sdcorejs/docs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md` (note the leading dot in `.sdcorejs/`). Do NOT write the doc to this `sdcorejs-agent` repo. Immediately after auto-docs, run `sdcorejs-write-user-guide` (Mode 1) to update the touched module's per-module user guide at `<target>/.sdcorejs/user-guide/<module>.md`; the aggregate `sdcorejs-user-guide.md` + DOCX rebuild at ship.

2. **Auto-snapshot is mandatory (two invocation points).** The single skill `skills/orchestration/auto-snapshot.md` runs in two modes. Immediately after `sdcorejs-review-spec` (cross-track) returns explicit user approval, run `sdcorejs-auto-snapshot` in **SPEC mode** to persist the approved spec snapshot to `<target>/.sdcorejs/specs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md`. Immediately after `sdcorejs-review-plan` returns explicit user approval, run `sdcorejs-auto-snapshot` in **PLAN mode** to persist the approved plan snapshot to `<target>/.sdcorejs/plans/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md`. The next step (`sdcorejs-write-plan` / `<track>-write-code`) waits for these writes to finish. The corpus lets future `sdcorejs-write-spec` / `sdcorejs-write-plan` invocations mirror the user's preferred structure and depth.

3. **Memories.** Durable cross-session knowledge lives under the target project's `.sdcorejs/memories/<track>/`, managed by `skills/orchestration/memories.md`. Read frontmatter at session start; write durable facts when the user says "remember this" (or the same intent in the user's language) or when a recurring correction is detected.

4. **Session-start ritual.** When opening a target project, glob the target's `.sdcorejs/docs/<track>/*.md`, read the latest 3 entries, and silently load that as context before answering. Also glob `.sdcorejs/memories/<track>/*.md` frontmatter for durable facts. Additionally, glob `.sdcorejs/specs/<track>/*.md` and `.sdcorejs/plans/<track>/*.md` (frontmatter only) so the next `03-write-spec` / `05-write-plan` invocation can mirror the user's confirmed style. Also glob `.sdcorejs/persona.md`; if absent on the first substantive request, invoke `sdcorejs-persona` to set it. Once set, load `_refs/shared/persona.md` and adapt all user-facing output to the stored persona.

5. **Skills go global — English source, runtime-localized I/O.** Author every skill's `name`, `description`, body, notes, and inline comments in **English** (skills are published for a global audience). At runtime, detect the user's language from their message and BOTH match triggers and respond in that language. Preserve the user's locale-specific marks in generated labels/messages; keep permission codes and route paths in English. (Generated artifacts in a target project: follow the user's language for prose, English for identifiers.)

6. **Mojibake guard (UTF-8 / Vietnamese).** Treat mojibake as a blocking defect in docs, prompts, skills, comments, and user-facing strings. Preserve UTF-8, Vietnamese diacritics, emoji, arrows, box drawing, and typographic punctuation as real Unicode; never paste or "fix" text from a Windows-1252/ANSI-decoded view. When the user reports Vietnamese/encoding issues, or before claiming any change that edits non-ASCII prose is fixed, run a case-sensitive mojibake scan over the touched text scope. The scan should catch UTF-8-as-Windows-1252 artifacts by codepoint shape (for example `U+00C3` followed by a CP1252 continuation/punctuation character, `U+00E2 U+20AC ...`, `U+00E1 U+00BA/U+00BB ...`, `U+FFFD`) without flagging valid Vietnamese uppercase words such as `ĐÃ` or `NÂNG`. Any hit is a blocker until repaired and re-scanned clean.

7. **Clarify-before-code.** Do NOT generate code if track-specific minimum-required answers are unconfirmed (Angular: module + entity + fields + layout; NestJS: module + entity + persistence + transactions; Next.js: domain + contact + hosting + caching). Invoke `sdcorejs-clarify-requirements` first (or `sdcorejs-brainstorm` if scope is open-ended).

8. **Approval gates.** `sdcorejs-review-spec` and `sdcorejs-review-plan` REQUIRE explicit user approval before the next skill runs. Silence is not approval. Approval immediately fires the corresponding `sdcorejs-auto-snapshot` tail-call — SPEC mode after review-spec, PLAN mode after review-plan (see rule 2).

9. **Core UI first.** Use `@sdcorejs/angular` components when one fits. Otherwise generate skeleton + `alert('TODO: ...')` stubs and mark for the developer.

10. **Test after generation.** Run `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts` (Angular) and report summary + failing spec names.

11. **Evidence before claims (always-on).** Never state that something passes, builds, is fixed, or is done without having run the verifying command in the current turn and read its output. This applies to EVERY success claim — interim or final, your own work or a subagent's — not only at the `sdcorejs-verify-before-done` gate. Treat a subagent's "✅ done" as a claim to verify (read the diff / re-run the check), never as fact. "Should pass", "looks correct", or a previously-green run are not evidence. Inspired by `superpowers:verification-before-completion`.

12. **Persona-aware output.** Read the target project's `.sdcorejs/persona.md` (default `tech` if absent) and load `_refs/shared/persona.md` before producing user-facing output. `non-tech` = no unexplained jargon, hidden mechanics, forced infra defaults (Angular + NestJS modular-monolith + Keycloak + Postgres on docker-compose), always finish with a run guide, both approval gates kept but plainly worded. `tech` = unchanged baseline. Orthogonal to the bilingual rule. Managed by `sdcorejs-persona`.

13. **Finish gate is mandatory and unconditional.** After EVERY track code-gen — whether reached through the full SDLC flow OR triggered as a standalone single skill (e.g. "add entity", "create module X", "add a page") — the track write-code orchestrator (`sdcorejs-angular` / `sdcorejs-nestjs` / `sdcorejs-nextjs`) MUST present the consolidated **FINISH GATE** (`_refs/shared/finish-gate.md`) before running any tail step. The gate surfaces the finishing steps — **tests** (default ON, RED-first, `standard`; user may opt out / change level), **comments** (required pick: skip/simple/medium/full — this IS the `comment-code` ASK, folded in, not asked twice), **user guide** (default ON), **review** (default ON) — with always-on plumbing (verify-before-done → branch-ready → auto-docs → auto-task-tracker → memories) listed so the user knows it runs. NEVER end silently after code-gen, and NEVER skip the gate because the request was a one-liner. The whole point is that the user always KNOWS these steps exist. Tail steps then run honoring the gate's answers.

## Cross-track skills (`skills/shared/sdlc/`, `skills/orchestration/`, `skills/shared/`, `skills/review/`, `skills/testing/`)

Cross-track skills that apply to angular, nestjs, nextjs alike. Match against their `description` like any other skill. Dispatch is by skill `name:` frontmatter, not path — directory is for organization only.

### Design phase (`skills/shared/sdlc/`)
Loaded by every track at the start of every feature. Each detects the track at runtime and loads `_refs/sdlc/<track>.md` for track-specific patterns.

| Skill | Trigger | Mandatory? |
| --- | --- | --- |
| `sdcorejs-brainstorm` | open-ended idea before scope is fixed | optional (skip when scope clear) |
| `sdcorejs-clarify-requirements` | request for concrete artifacts before spec | ✅ |
| `sdcorejs-write-spec` | after clarify confirms minimum-required | ✅ |
| `sdcorejs-review-spec` | after `sdcorejs-write-spec` — user-approval gate | ✅ |
| `sdcorejs-write-plan` | after `sdcorejs-review-spec` approves | ✅ |
| `sdcorejs-review-plan` | after `sdcorejs-write-plan` — user-approval gate | ✅ |

### Orchestration plumbing

| Skill | Trigger | Mandatory? |
| --- | --- | --- |
| `sdcorejs-verify-before-done` | runs BEFORE branch-ready at end of feature — verifies each acceptance criterion from spec; blocks "done" until ✅ or user-acknowledged defer | ✅ |
| `sdcorejs-branch-ready` | runs AFTER verify-before-done, BEFORE auto-docs — branch-hygiene sweep (debug logs, secrets, focused tests, lint+build+test). Inspired by `superpowers:finishing-a-development-branch` | ✅ |
| `sdcorejs-auto-docs` | end of every code-writing task — session summary | ✅ |
| `sdcorejs-auto-snapshot` | two modes: **SPEC mode** runs IMMEDIATELY after `sdcorejs-review-spec` approval → snapshots to `.sdcorejs/specs/<track>/` (so future `sdcorejs-write-spec` mirrors style); **PLAN mode** runs IMMEDIATELY after `sdcorejs-review-plan` approval → snapshots to `.sdcorejs/plans/<track>/` (so future `sdcorejs-write-plan` mirrors style) | ✅ on approval |
| `sdcorejs-write-user-guide` | end of write-code (per-module guide, Mode 1) / ship (aggregate rebuild) / "write user guide" / "read the whole project and write the user guide" — updates `.sdcorejs/user-guide/<module>.md` (features / routes / permissions / data + Coverage-vs-requirements) | ✅ per-module on write-code |
| `sdcorejs-auto-task-tracker` | runs after auto-docs + write-user-guide — ticks `[x]` done, appends new tasks to `.sdcorejs/tasks/<track>.md` | ✅ |
| `sdcorejs-memories` | "remember this", durable knowledge — write to target `.sdcorejs/memories/<track>/` | ✅ on trigger |
| `sdcorejs-repair-loop` | runs after `sdcorejs-review` outputs findings — categorize / auto-apply / iterate until Critical+Important resolved | ✅ on findings |
| `sdcorejs-comment-code` | applies the comment level chosen in the FINISH GATE (skip / simple / medium / full) — no second ASK; asks directly only when invoked standalone outside a code-gen flow | ✅ (via gate) |
| `sdcorejs-parallel-dispatch` | about to fan out 3+ independent tasks — decision gate (should I split?) |  |
| `sdcorejs-subagent-driven-dev` | after parallel-dispatch says YES — execution discipline: decompose, brief, dispatch, merge. **Two modes:** A = independent same-kind units (entities/screens/docs); B = role-split feature loop (backend‖frontend‖QC on one feature via a contract-freeze barrier, looped against acceptance criteria). `parallel-dispatch` routes `PARALLEL-CANDIDATE`→A, `ROLE-SPLIT`→B |  |
| `sdcorejs-using-worktrees` | before `<track>-write-code` or parallel fan-out when work needs isolation — detect/create isolated workspace + clean baseline |  |
| `sdcorejs-persona` | first request in a target project with no `.sdcorejs/persona.md`; "explain simply", "set persona" — ask-once tech/non-tech, store flag, load `_refs/shared/persona.md` | auto on first entry |
| `sdcorejs-using-skills` | session-start bootstrap (plugin context) — portable dispatch protocol so skills fire even without this CLAUDE.md present | auto (SessionStart hook) |
| `sdcorejs-solution-builder` | "build me an app / a system; the non-tech one-door full-app flow" — chains persona → clarify → spec/plan (2 gates) → build backend+frontend → dockerize → auth → run-guide → stack verify → final docs/task tail |  |

### Workflow utilities

| Skill | Trigger | Mandatory? |
| --- | --- | --- |
| `sdcorejs-code-map` | new major feature, "reuse shared components" — read-only architecture scan BEFORE generation |  |
| `sdcorejs-commit` | "commit", "commit changes" — Conventional Commits + scope detection + git safety |  |
| `sdcorejs-pr-create` | "create PR", "open PR" — PR title/body from commits + diff via `gh` |  |
| `sdcorejs-debug` | non-trivial bug needing reproduce → isolate → hypothesize → root-cause |  |
| `sdcorejs-recovery` | "resume", "resume", "where were we" — handoff from docs + memories + git state |  |
| `sdcorejs-env-setup` | "set up the environment", "setup dev", newly cloned project — per-stack bootstrap |  |
| `sdcorejs-changelog` | "write changelog", release prep — Keep a Changelog entry from commits, semver bump |  |
| `sdcorejs-review` | "security review", before release — cross-track security checklist — track-aware (detects stack, deepens via `_refs/<track>/review-security.md`) |  |
| `sdcorejs-dep-update` | "update dependencies", `npm audit fix` — safe upgrade workflow (audit → branch → group → test) |  |

### Infra / packaging (`skills/infra/`)

Emit a one-command runnable Docker stack into a target project's **deploy root** (never this repo). Templates live in `_refs/infra/`. Non-tech is the default consumer; composes with the angular + nestjs tracks.

| Skill | Trigger | Emits |
| --- | --- | --- |
| `sdcorejs-dockerize` | "dockerize", "package with Docker", "run with Docker" | Dockerfiles + `docker-compose.yml` (FE + BE + Keycloak + Postgres), `.env`, nginx |
| `sdcorejs-auth` | "add login", "configure Keycloak", "authentication" | Keycloak realm import + FE `provideSdKeycloak` + BE token-validation wiring |
| `sdcorejs-run-guide` | "run guide", "how to run", "start guide" | plain-language `START.md` (install Docker → one command → URL → demo login) |

## Reference docs (load on demand only — do not preload)

- `_refs/sdlc/{angular,nextjs,nestjs}.md` — cross-track design-phase patterns per track (loaded by `sdcorejs-brainstorm` / `sdcorejs-clarify-requirements` / `sdcorejs-write-spec` / `sdcorejs-write-plan` at Step 0-1)
- `_refs/<track>/architecture-principles.md` — WHY-principles per track governing generated code. Load when explaining decisions, reviewing deviations, or onboarding contributors:
  - **angular** (16 principles): feature-first, signal-first, no cross-module imports, 4 canonical layouts, mock-first, OnPush default, …
  - **nextjs/build-website** (15 principles): App Router default, server components default, content-as-data, i18n localized pathnames, SEO non-negotiable, 30-min ISR default, real contact form, mobile-first, …
  - **nestjs** (14 principles): bounded-context modules, BaseEntity/Repo/Service mandatory, guard order AuthGuard→Zod→HasPermission, Zod in shared package, thin controllers, explicit QueryRunner transactions, bilingual error messages, …
- `_refs/angular/core-version.md` — pinned `@sdcorejs/angular` version (npm install pin for init-portal)
- `_refs/angular/core-docs-fetch.mjs` — **on-demand Core UI doc fetcher** (the component docs are NOT committed). `node _refs/angular/core-docs-fetch.mjs --list` prints the inventory; `node _refs/angular/core-docs-fetch.mjs <id>` pulls one component's full API. Raw fetch (not summarized) from the published docs site, version-matched to the target's installed package (`@sdcorejs/angular` or legacy `@sd-angular/core`), mojibake-guarded, cached at `~/.cache/sdcorejs/core-docs/<version>/`.
- `_refs/angular/entity-field-types.md` — field type → form control mapping
- `_refs/angular/templates/entity-{skeleton,tests,example-product}.md` — code templates extracted from the init-entity reference pack (split 2026-05-20 to keep the pack under 500 lines)
- `_refs/angular/write-code/{init-portal,init-module,init-entity,screen-list,screen-detail,actions}.md` — on-demand reference packs loaded by `sdcorejs-angular` (no frontmatter, not dispatchable skills)
- `_refs/nestjs/core-catalog.md` — `@sdcorejs/nestjs` core inventory (BaseEntity/Repository/Service/Controller, guards, decorators)
- `_refs/nestjs/write-code/{init-project,init-module,init-entity,actions}.md` — on-demand reference packs loaded by `sdcorejs-nestjs` (no frontmatter, not dispatchable skills)

## Anti-patterns

- ❌ Don't author new skills without explicit user approval. To propose a new skill, ask first.
- ❌ Don't skip clarify-before-code even if scope seems obvious — the user must confirm.
- ❌ Don't write `.sdcorejs/docs/`, `.sdcorejs/specs/`, `.sdcorejs/plans/`, or `.sdcorejs/memories/` content in this `sdcorejs-agent` repo. Auto-docs / auto-snapshot / memories always target the user's working project.
- ❌ Don't load all skill bodies at session start. Just read frontmatter for dispatch; full body only when picking a skill.
- ❌ Don't bypass git hooks (`--no-verify`) or `.gitignore`d files when committing.
- ❌ Don't generate code that imports `@sdcorejs/angular` features without first checking they exist — run `node _refs/angular/core-docs-fetch.mjs --list` (and fetch the component doc) on-demand; the Core UI docs are pulled at generation time, not committed.

## See also

- `AGENTS.md` — same instructions for Codex / Cursor / generic AGENTS.md-aware tools
- `.github/copilot-instructions.md` — same instructions for GitHub Copilot
- `.github/chatmodes/sdcorejs.chatmode.md` — Copilot-specific chat mode for SDCoreJS work
