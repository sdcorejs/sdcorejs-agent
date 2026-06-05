# SDCoreJS SDLC Agent — Claude Code Instructions

This repository (`sdcorejs-agent`) is an **SDLC agent** for the SDCoreJS ecosystem:

- **Backoffice portals** in Angular with `@sdcorejs/angular` (Core UI)
- **Backend** in NestJS + Postgres
- **Public sites** in Next.js (SSR)

When you (Claude Code) start a session — whether in this repo or in a target project that uses any of these stacks — follow these instructions.

## Tracks and status

| Track | Path | Status |
| --- | --- | --- |
| Angular Portal | `skills/tracks/angular/` | ✅ Complete (design-phase cross-track skills + 2 angular skills: `angular-onboarding` and the `angular-write-code` orchestrator. The orchestrator dispatches 6 on-demand reference packs under `_refs/angular/write-code/`: init-portal, init-module, init-entity, screen-list, screen-detail (covers CREATE / UPDATE / DETAIL states + form refinement), actions (workflow / bulk / custom side-effects)). Design-phase + spec/plan/review skills moved to cross-track `skills/shared/sdlc/`. Cross-cutting code-review (single track-aware skill `sdcorejs-review-code` at `skills/review/code.md`) + e2e-test (`sdcorejs-test`). Cross-track comment-code (`orchestration/comment-code`) absorbs the previous per-track `51-write-comments`. |
| NestJS | `skills/tracks/nestjs/` | 🟡 Scaffold (`00-onboarding` + `07-write-code` plan-walking orchestrator). Sub-skills (10-init-project, 11-init-module, 12-init-entity, 20-controller, 21-service, 22-repository) 🚧 planned. Design phase fully usable via shared/sdlc/; review + testing skills already in place — code review via the single track-aware `sdcorejs-review-code` (`review/code.md`), plus `sdcorejs-review-security` + `sdcorejs-review-performance`, `sdcorejs-test`. |
| Next.js | `skills/tracks/nextjs/build-website/` | ✅ `build-website/` pack complete. 3 track skills: `nextjs-build-website-onboarding`, the `nextjs-build-website-write-code` orchestrator, and `nextjs-build-website-audit-existing-site`. The orchestrator dispatches 10 on-demand reference packs under `_refs/nextjs/build-website/write-code/`: init-site, theme, pages-and-blocks, seo, og-preview, i18n, caching, responsive, contact-form, content-quality (consolidated from the former 10-19 sub-skills). Design-phase moved to cross-track `skills/shared/sdlc/`. |

Cross-cutting concerns live outside `tracks/`:
- `skills/shared/sdlc/` — **6 cross-track design-phase skills** (`sdcorejs-brainstorm`, `sdcorejs-clarify-requirements`, `sdcorejs-write-spec`, `sdcorejs-review-spec`, `sdcorejs-write-plan`, `sdcorejs-review-plan`) plus `_refs/{angular,nestjs,nextjs}.md` for track-specific patterns. Replaces the duplicated per-track design files.
- `skills/orchestration/` — 16 SDLC plumbing skills (parallel-dispatch, subagent-driven-dev, repair-loop, auto-docs, auto-summary, recovery, auto-specs, auto-plans, memories, auto-task-tracker, verify-before-done, branch-ready, comment-code, ship, using-worktrees, using-skills)
- `skills/shared/conventions/` — Conventional Commits, changelog, dep-update
- `skills/shared/workflow/` — env-setup, debug, pr-create, code-map
- `skills/review/` — code review (single track-aware skill `sdcorejs-review-code` at `review/code.md`; per-track knowledge in `_refs/<track>/review-code.md`), security audit, performance, architecture, accessibility (filled per track where applicable)
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

1. **At session start**, glob `skills/*/*.md` and read each skill's YAML frontmatter only (cheap — body load happens later).
2. **When the user makes a request**, match it against each skill's `description` (the "Use when..." trigger). Pick the highest-confidence match.
3. **Read that skill's body** and follow its instructions exactly.
4. **If multiple skills tie**, pick the lowest-numbered one in the workflow (clarify before plan, plan before write-code, etc).
5. **If no skill matches**, ask a clarifying question or invoke `<track>-onboarding` (e.g. `angular-onboarding`).

## Workflow per track

Every track shares the same workflow shape. **Design phase is cross-track** (`skills/shared/sdlc/`); **code-writing phase is track-specific** (`skills/tracks/<track>/07-write-code.md`; for angular the orchestrator loads on-demand reference packs under `_refs/angular/write-code/`).

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
orchestration/auto-specs   ← MANDATORY on approval — snapshot to <target>/.sdcorejs/specs/<track>/
  ↓
shared/sdlc/05-write-plan (sdcorejs-write-plan)
  ← cross-track; numbered file-by-file plan
  ↓
shared/sdlc/06-review-plan (sdcorejs-review-plan)
  ← cross-track; user-approval gate
  ↓
orchestration/auto-plans   ← MANDATORY on approval — snapshot to <target>/.sdcorejs/plans/<track>/
  ↓
<track>-write-code (07-write-code, track-specific orchestrator)
  ← angular:        angular-write-code     → loads on-demand reference packs from `_refs/angular/write-code/`: init-portal | init-module | init-entity | screen-list | screen-detail (CREATE / UPDATE / DETAIL states + form refinement) | actions (workflow / bulk / custom side-effects)
  ← nextjs (build-website): nextjs-build-website-write-code → loads on-demand reference packs from `_refs/nextjs/build-website/write-code/`: init-site | theme | pages-and-blocks | seo | og-preview | i18n | caching | responsive | contact-form | content-quality
  ← nestjs:                nestjs-write-code              → SCAFFOLD (plan-walking until 10/11/12 sub-skills ship)
  └─ when feature has 3+ independent units, dispatches via
     orchestration/subagent-driven-dev (after orchestration/parallel-dispatch decision)
  ↓
sdcorejs-test
  ← happy-path tests for what was generated
  ↓
review/code.md (sdcorejs-review-code — auto-detects track from dir architecture)
  ← convention check; outputs color-coded tables (🔴 Critical / 🟡 Important / 🔵 Minor + 🟢 Strengths) with Fix + Tradeoff
  ↓
orchestration/repair-loop
  ← apply review findings + iterate until Critical+Important resolved
  ↓
orchestration/comment-code
  ← MANDATORY ASK gate: skip / simple / medium / full
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
orchestration/auto-task-tracker   ← MANDATORY (immediately after auto-docs) — tick done + append new in <target>/.sdcorejs/tasks/<track>.md
orchestration/memories            ← durable knowledge (when applicable) to <target>/.sdcorejs/memories/<track>/
```

## Mandatory rules (apply to every track)

1. **Auto-docs is mandatory.** At the end of every code-writing skill invocation, run the track-agnostic `auto-docs` skill at `skills/orchestration/auto-docs.md`. This writes a session summary to the **target project's** `.sdcorejs/docs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md` (note the leading dot in `.sdcorejs/`). Do NOT write the doc to this `sdcorejs-agent` repo.

2. **Auto-specs / auto-plans are mandatory.** Immediately after `sdcorejs-review-spec` (cross-track) returns explicit user approval, run `skills/orchestration/auto-specs.md` to persist the approved spec snapshot to `<target>/.sdcorejs/specs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md`. Immediately after `sdcorejs-review-plan` returns explicit user approval, run `skills/orchestration/auto-plans.md` to persist the approved plan snapshot to `<target>/.sdcorejs/plans/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md`. The next step (`sdcorejs-write-plan` / `<track>-write-code`) waits for these writes to finish. The corpus lets future `sdcorejs-write-spec` / `sdcorejs-write-plan` invocations mirror the user's preferred structure and depth.

3. **Memories.** Durable cross-session knowledge lives under the target project's `.sdcorejs/memories/<track>/`, managed by `skills/orchestration/memories.md`. Read frontmatter at session start; write durable facts when the user says "ghi nhớ"/"remember this" or when a recurring correction is detected.

4. **Session-start ritual.** When opening a target project, glob the target's `.sdcorejs/docs/<track>/*.md`, read the latest 3 entries, and silently load that as context before answering. Also glob `.sdcorejs/memories/<track>/*.md` frontmatter for durable facts. Additionally, glob `.sdcorejs/specs/<track>/*.md` and `.sdcorejs/plans/<track>/*.md` (frontmatter only) so the next `03-write-spec` / `05-write-plan` invocation can mirror the user's confirmed style.

5. **Bilingual.** Vietnamese request → Vietnamese output (full diacritics for labels/messages). English → English. Permission codes and route paths stay English in both.

6. **Clarify-before-code.** Do NOT generate code if track-specific minimum-required answers are unconfirmed (Angular: module + entity + fields + layout; NestJS: module + entity + persistence + transactions; Next.js: domain + contact + hosting + caching). Invoke `sdcorejs-clarify-requirements` first (or `sdcorejs-brainstorm` if scope is open-ended).

7. **Approval gates.** `sdcorejs-review-spec` and `sdcorejs-review-plan` REQUIRE explicit user approval before the next skill runs. Silence is not approval. Approval immediately fires the corresponding auto-specs / auto-plans tail-call (see rule 2).

8. **Core UI first.** Use `@sdcorejs/angular` components when one fits. Otherwise generate skeleton + `alert('TODO: ...')` stubs and mark for the developer.

9. **Test after generation.** Run `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts` (Angular) and report summary + failing spec names.

10. **Evidence before claims (always-on).** Never state that something passes, builds, is fixed, or is done without having run the verifying command in the current turn and read its output. This applies to EVERY success claim — interim or final, your own work or a subagent's — not only at the `sdcorejs-verify-before-done` gate. Treat a subagent's "✅ done" as a claim to verify (read the diff / re-run the check), never as fact. "Should pass", "looks correct", or a previously-green run are not evidence. Inspired by `superpowers:verification-before-completion`.

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
| `sdcorejs-auto-specs` | runs IMMEDIATELY after `sdcorejs-review-spec` approval — snapshots to `.sdcorejs/specs/<track>/` so future `sdcorejs-write-spec` can mirror style | ✅ on approval |
| `sdcorejs-auto-plans` | runs IMMEDIATELY after `sdcorejs-review-plan` approval — snapshots to `.sdcorejs/plans/<track>/` so future `sdcorejs-write-plan` can mirror style | ✅ on approval |
| `sdcorejs-auto-task-tracker` | runs IMMEDIATELY after auto-docs — ticks `[x]` done, appends new tasks to `.sdcorejs/tasks/<track>.md` | ✅ |
| `sdcorejs-memories` | "ghi nhớ", durable knowledge — write to target `.sdcorejs/memories/<track>/` | ✅ on trigger |
| `sdcorejs-repair-loop` | runs after `sdcorejs-review-code` outputs findings — categorize / auto-apply / iterate until Critical+Important resolved | ✅ on findings |
| `sdcorejs-comment-code` | ASK gate at the comment phase — skip / simple / medium / full; outcome optional but ASK is mandatory | ✅ ASK |
| `sdcorejs-parallel-dispatch` | about to fan out 3+ independent tasks — decision gate (should I split?) |  |
| `sdcorejs-subagent-driven-dev` | after parallel-dispatch says YES — execution discipline: decompose, brief, dispatch, merge |  |
| `sdcorejs-using-worktrees` | before `<track>-write-code` or parallel fan-out when work needs isolation — detect/create isolated workspace + clean baseline |  |
| `sdcorejs-using-skills` | session-start bootstrap (plugin context) — portable dispatch protocol so skills fire even without this CLAUDE.md present | auto (SessionStart hook) |

### Workflow utilities

| Skill | Trigger | Mandatory? |
| --- | --- | --- |
| `sdcorejs-code-map` | new major feature, "dùng lại shared component" — read-only architecture scan BEFORE generation |  |
| `sdcorejs-commit` | "commit", "tạo commit" — Conventional Commits + scope detection + git safety |  |
| `sdcorejs-pr-create` | "tạo PR", "open PR" — PR title/body from commits + diff via `gh` |  |
| `sdcorejs-debug` | non-trivial bug needing reproduce → isolate → hypothesize → root-cause |  |
| `sdcorejs-recovery` | "tiếp tục", "resume", "where were we" — handoff from docs + memories + git state |  |
| `sdcorejs-env-setup` | "thiết lập môi trường", "setup dev", project mới clone — per-stack bootstrap |  |
| `sdcorejs-changelog` | "viết changelog", release prep — Keep a Changelog entry from commits, semver bump |  |
| `sdcorejs-review-security` | "review bảo mật", before release — cross-track security checklist — track-aware (detects stack, deepens via `_refs/<track>/review-security.md`) |  |
| `sdcorejs-dep-update` | "cập nhật dependency", `npm audit fix` — safe upgrade workflow (audit → branch → group → test) |  |

## Reference docs (load on demand only — do not preload)

- `_refs/sdlc/{angular,nextjs,nestjs}.md` — cross-track design-phase patterns per track (loaded by `sdcorejs-brainstorm` / `sdcorejs-clarify-requirements` / `sdcorejs-write-spec` / `sdcorejs-write-plan` at Step 0-1)
- `_refs/<track>/architecture-principles.md` — WHY-principles per track governing generated code. Load when explaining decisions, reviewing deviations, or onboarding contributors:
  - **angular** (16 principles): feature-first, signal-first, no cross-module imports, 4 canonical layouts, mock-first, OnPush default, …
  - **nextjs/build-website** (15 principles): App Router default, server components default, content-as-data, i18n localized pathnames, SEO non-negotiable, 30-min ISR default, real contact form, mobile-first, …
  - **nestjs** (14 principles, scaffold): bounded-context modules, BaseEntity/Repo/Service mandatory, guard order AuthGuard→Zod→HasPermission, Zod in shared package, thin controllers, explicit QueryRunner transactions, bilingual error messages, …
- `_refs/angular/core-version.md` — pinned `@sdcorejs/angular` version
- `_refs/angular/sdcorejs-angular-catalog.md` — Core UI components inventory
- `_refs/angular/entity-field-types.md` — field type → form control mapping
- `_refs/angular/templates/entity-{skeleton,tests,example-product}.md` — code templates extracted from the init-entity reference pack (split 2026-05-20 to keep the pack under 500 lines)
- `_refs/angular/write-code/{init-portal,init-module,init-entity,screen-list,screen-detail,actions}.md` — on-demand reference packs loaded by `angular-write-code` (no frontmatter, not dispatchable skills)

## Anti-patterns

- ❌ Don't author new skills without explicit user approval. To propose a new skill, ask first.
- ❌ Don't skip clarify-before-code even if scope seems obvious — the user must confirm.
- ❌ Don't write `.sdcorejs/docs/`, `.sdcorejs/specs/`, `.sdcorejs/plans/`, or `.sdcorejs/memories/` content in this `sdcorejs-agent` repo. Auto-docs / auto-specs / auto-plans / memories always target the user's working project.
- ❌ Don't load all skill bodies at session start. Just read frontmatter for dispatch; full body only when picking a skill.
- ❌ Don't bypass git hooks (`--no-verify`) or `.gitignore`d files when committing.
- ❌ Don't generate code that imports `@sdcorejs/angular` features not in the catalog (`_refs/angular/sdcorejs-angular-catalog.md`) without first checking that file.

## See also

- `AGENTS.md` — same instructions for Codex / Cursor / generic AGENTS.md-aware tools
- `.github/copilot-instructions.md` — same instructions for GitHub Copilot
- `.github/chatmodes/sdcorejs.chatmode.md` — Copilot-specific chat mode for SDCoreJS work
