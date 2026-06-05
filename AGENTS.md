# SDCoreJS SDLC Agent

> Entry point for AGENTS.md-aware tools (Codex, Cursor, OpenAI Agents SDK, etc).
> Claude Code reads `CLAUDE.md` instead — same skill structure, same rules.

This repo is an SDLC agent for the SDCoreJS stack: Angular portal (Core UI), NestJS + Postgres backend, Next.js public sites. It exposes its capabilities as **skills** — markdown files with YAML frontmatter — that you dispatch based on the user's request.

## Skill structure

```
_refs/                            reference data (no frontmatter, load on demand) — single top-level tree, sync'd once per mirror
├── angular/                core-version, catalog, entity-field-types, templates/, sdcorejs-angular/...
├── nestjs/                        architecture-principles
├── nextjs/build-website/          architecture-principles
└── sdlc/                          cross-track design-phase patterns (angular.md, nestjs.md, nextjs.md)

skills/
├── tracks/                       stack-specific code-writing skills
│   ├── angular/   ✅  1 track skill — 07-write-code orchestrator (onboarding via sdcorejs-using-skills); orchestrator loads 6 on-demand reference packs from `_refs/angular/write-code/` (init-portal, init-module, init-entity, screen-list, screen-detail (CREATE/UPDATE/DETAIL states + form refinement), actions (workflow / bulk / custom side-effects))
│   ├── nestjs/           🟡  scaffold (07-write-code plan-walker; onboarding via sdcorejs-using-skills); 10/11/12 sub-skills planned
│   └── nextjs/
│       └── build-website/  ✅  2 track skills — 07-write-code orchestrator, 08-audit-existing-site (orchestrator dispatches 10 reference packs in _refs/nextjs/build-website/write-code/: init-site, theme, pages-and-blocks, seo, og-preview, i18n, caching, responsive, contact-form, content-quality)
│
├── shared/
│   ├── sdlc/             ✅  6 cross-track design-phase skills (01-brainstorm, 02-clarify-requirements, 03-write-spec, 04-review-spec, 05-write-plan, 06-review-plan); patterns live in `_refs/sdlc/{angular,nextjs,nestjs}.md`
│   ├── conventions/      Conventional Commits, changelog, dep-update
│   └── workflow/         env-setup, debug, pr-create, code-map
│
├── orchestration/        SDLC plumbing (16 files): parallel-dispatch, subagent-driven-dev, repair-loop, auto-docs, auto-summary, recovery, auto-specs, auto-plans, memories, auto-task-tracker, verify-before-done, branch-ready, comment-code, ship, using-worktrees, using-skills
│
├── review/
│   ├── code.md           single track-aware code review (sdcorejs-review-code); per-track knowledge in _refs/<track>/review-code.md (nextjs: _refs/nextjs/build-website/review-code.md)
│   ├── security.md       single track-aware (sdcorejs-review-security); knowledge in _refs/<track>/review-security.md
│   ├── architecture.md   cross-track architecture review
│   ├── performance.md   single track-aware (sdcorejs-review-performance); knowledge in _refs/<track>/review-performance.md
│   └── accessibility.md single track-aware (sdcorejs-review-accessibility); knowledge in _refs/<track>/review-accessibility.md
│
└── testing/
    ├── test.md           single track+level-aware test skill (sdcorejs-test); knowledge in _refs/<track>/test-<level>.md + _refs/shared/testing-philosophy.md
    └── tdd.md            cross-track RED→GREEN→refactor discipline
```

Each skill file has Anthropic-style frontmatter:

```yaml
---
name: <kebab-case skill name>
description: Use when ... (the trigger description used for dispatch)
allowed-tools: Read, Write, Edit, ...
---
```

## Skill dispatch protocol

1. Glob `skills/*/*.md` at session start.
2. Read each file's frontmatter only (cheap — body load happens later).
3. When the user makes a request, match it against each skill's `description` (the "Use when..." trigger). Pick the highest-confidence match.
4. Read that skill's body and follow its rules exactly.
5. If multiple skills tie, pick the lowest-numbered one in the workflow (clarify before plan, plan before write-code, etc).
6. If no skill matches, ask a clarifying question or invoke `sdcorejs-using-skills`.

## Workflow per track

Every track shares the same workflow shape (superpowers-aligned, with explicit user-approval gates):

```
Request
  → shared/sdlc/01-brainstorm   (sdcorejs-brainstorm, optional when scope is open-ended)
  → shared/sdlc/02-clarify-requirements   (sdcorejs-clarify-requirements)
  → shared/sdlc/03-write-spec → shared/sdlc/04-review-spec   (approval gate)
                              → orchestration/auto-specs  (MANDATORY on approval — snapshot to .sdcorejs/specs/<track>/)
  → shared/sdlc/05-write-plan       → shared/sdlc/06-review-plan  (approval gate)
                              → orchestration/auto-plans  (MANDATORY on approval — snapshot to .sdcorejs/plans/<track>/)
  → <track>-write-code (track-specific orchestrator; dispatches sub-skills; uses orchestration/subagent-driven-dev when fan-out ≥3)
       angular:        angular-write-code
       nextjs (build-website): nextjs-build-website-write-code
       nestjs:                 nestjs-write-code (SCAFFOLD — plan-walker until sub-skills ship)
  → sdcorejs-test → review/code.md (sdcorejs-review-code, auto-detects track) → orchestration/repair-loop (if findings)
  → orchestration/comment-code (MANDATORY ASK: skip/simple/medium/full — all levels applied inline; cross-track baseline + per-track addenda inside the skill)
  → orchestration/verify-before-done (MANDATORY acceptance gate) → orchestration/branch-ready (branch-hygiene sweep)
  → orchestration/auto-docs (MANDATORY) → orchestration/auto-task-tracker (MANDATORY) → orchestration/memories (when durable knowledge surfaces)
```

**Design phase is cross-track** (`skills/shared/sdlc/`). Each skill detects the target track from the project and loads `_refs/sdlc/<track>.md` for track-specific patterns (industry table for nextjs, layout matrix for angular, persistence/transaction matrix for nestjs).

For the angular track, `07-write-code` is the single orchestrator; it loads on-demand reference packs from `_refs/angular/write-code/` (no frontmatter, not dispatchable skills):
`init-portal`, `init-module`, `init-entity`, `screen-list`, `screen-detail` (handles CREATE / UPDATE / DETAIL states + reactive-form refinement), `actions` (workflow transitions, bulk operations, custom side-effects).

## Mandatory rules

To avoid drift, the source of truth for these rules is `CLAUDE.md`. Summary:

1. **Auto-docs is mandatory** — at the end of every code-writing skill invocation, the track-agnostic `skills/orchestration/auto-docs.md` writes a summary to the **target project's** `.sdcorejs/docs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md` (note the leading dot). Never to this `sdcorejs-agent` repo.

2. **Auto-specs / auto-plans are mandatory** — immediately after `sdcorejs-review-spec` approval, `skills/orchestration/auto-specs.md` writes the approved spec to `<target>/.sdcorejs/specs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md`. Immediately after `sdcorejs-review-plan` approval, `skills/orchestration/auto-plans.md` writes the approved plan to `<target>/.sdcorejs/plans/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md`. These corpuses let future `sdcorejs-write-spec` / `sdcorejs-write-plan` mirror the user's confirmed style.

3. **Memories** — durable cross-session knowledge lives under the target project's `.sdcorejs/memories/<track>/`, managed by `skills/orchestration/memories.md`.

4. **Session-start ritual** — read the target project's `.sdcorejs/docs/<track>/*.md` (latest 3) and `.sdcorejs/memories/<track>/*.md` (frontmatter) before answering. Also glob `.sdcorejs/specs/<track>/*.md` and `.sdcorejs/plans/<track>/*.md` (frontmatter only) so the next `sdcorejs-write-spec` / `sdcorejs-write-plan` can mirror style.

5. **Bilingual** — match user's language. Vietnamese request → Vietnamese output (full diacritics). Permission codes and route paths stay English.

6. **Clarify-before-code** — do not generate code if track-specific minimum-required answers are unconfirmed. Run `sdcorejs-clarify-requirements` first (or `sdcorejs-brainstorm` for open-ended ideas).

7. **Approval gates** — `sdcorejs-review-spec` and `sdcorejs-review-plan` require explicit user approval before the next skill runs. Approval immediately fires the corresponding auto-specs / auto-plans tail-call (rule 2).

8. **Core UI first** — use `@sdcorejs/angular` components when one fits; otherwise skeleton + `alert('TODO: ...')` stubs.

9. **Test after generation** — `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts` and report summary.

10. **Evidence before claims (always-on)** — never claim something passes / builds / is fixed / is done without running the verifying command in the current turn and reading its output. Applies to every success claim (interim or final, your own or a subagent's), not only at the `sdcorejs-verify-before-done` gate. A subagent's "✅ done" is a claim to verify (read the diff / re-run the check), not a fact. Inspired by `superpowers:verification-before-completion`.

## Cross-track skills (`skills/shared/sdlc/`, `skills/orchestration/`, `skills/shared/`, `skills/review/`, `skills/testing/`)

Cross-track skills — apply to angular, nestjs, nextjs alike. Dispatch is by skill `name:` frontmatter; the directory layout above is for organization only.

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
| `sdcorejs-repair-loop` | after `sdcorejs-review-code` outputs findings | ✅ on findings |
| `sdcorejs-comment-code` | ASK gate at comment phase — skip/simple/medium/full | ✅ ASK |
| `sdcorejs-code-map` | new feature / reuse check — read-only architecture scan |  |
| `sdcorejs-parallel-dispatch` | fan-out 3+ independent tasks — decision gate |  |
| `sdcorejs-subagent-driven-dev` | after parallel-dispatch=YES — execution: decompose + brief + dispatch + merge |  |
| `sdcorejs-commit` | "commit", "tạo commit" — Conventional Commits + scope + git safety |  |
| `sdcorejs-pr-create` | "tạo PR", "open PR" — PR body from commits + diff |  |
| `sdcorejs-debug` | non-trivial bug needing systematic debugging |  |
| `sdcorejs-recovery` | "tiếp tục", "resume" — handoff from docs + memories + git state |  |
| `sdcorejs-env-setup` | "thiết lập môi trường", "setup dev" — per-stack bootstrap |  |
| `sdcorejs-changelog` | "viết changelog", release — Keep a Changelog + semver bump |  |
| `sdcorejs-review-security` | cross-track security checklist — track-aware (detects stack, deepens via `_refs/<track>/review-security.md`) |  |
| `sdcorejs-dep-update` | "cập nhật dependency", audit fix — safe upgrade workflow |  |

## Reference docs (load on demand)

- `_refs/sdlc/{angular,nextjs,nestjs}.md` — track-specific design-phase patterns
- `_refs/angular/core-version.md` — pinned `@sdcorejs/angular` version
- `_refs/angular/sdcorejs-angular-catalog.md` — Core UI components inventory
- `_refs/angular/entity-field-types.md` — field type → form control mapping
- `_refs/angular/templates/entity-{skeleton,tests,example-product}.md` — extracted code templates for the init-entity reference pack
- `_refs/angular/write-code/{init-portal,init-module,init-entity,screen-list,screen-detail,actions}.md` — on-demand reference packs loaded by `angular-write-code`

## Anti-patterns

- Don't author new skills without explicit user approval.
- Don't skip clarify-before-code even when scope seems obvious.
- Don't write `.sdcorejs/docs/`, `.sdcorejs/specs/`, `.sdcorejs/plans/`, or `.sdcorejs/memories/` content in this `sdcorejs-agent` repo. Auto-docs / auto-specs / auto-plans / memories target the user's working project.
- Don't load all skill bodies at session start — frontmatter only for dispatch.

## See also

- `CLAUDE.md` — Claude Code-specific entry point
- `.github/copilot-instructions.md` — GitHub Copilot entry point
- `.github/chatmodes/sdcorejs.chatmode.md` — Copilot specialized chat mode
