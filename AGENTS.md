# SDCoreJS SDLC Agent

> Entry point for AGENTS.md-aware tools (Codex, Cursor, OpenAI Agents SDK, etc).
> Claude Code reads `CLAUDE.md` instead — same skill structure, same rules.

This repo is an SDLC agent for the SDCoreJS stack: Angular portal (Core UI), NestJS + Postgres backend, Next.js public sites. It exposes its capabilities as **skills** — markdown files with YAML frontmatter — that you dispatch based on the user's request.

## Skill structure

```
skills/
├── tracks/                       stack-specific SDLC + build skills
│   ├── angular-portal/   ✅  19 skills (00-onboarding through 52-faq; e2e + review moved out)
│   │   └── _refs/        reference data, no frontmatter, load on demand
│   ├── nestjs/           🚧  planned (be-masterdata baseline reviewed)
│   └── nextjs/
│       └── build-website/  ✅  15 skills — SDLC entry + audit (00/01/02/07/08) + 10 specialized (10-init / 11-theme / 12-pages / 13-seo / 14-og / 15-i18n / 16-caching / 17-responsive / 18-contact-form / 19-content-quality)
│
├── orchestration/        SDLC plumbing (11 files): dispatcher, subagent-driven-dev, repair-loop, context-summarizer, recovery, auto-specs, auto-plans, memories, auto-task-tracker, verify-before-done, comment-code
│
├── shared/
│   ├── conventions/      Conventional Commits, changelog, dep-update
│   ├── workflow/         env-setup, debug, pr-create, code-map
│   ├── templates/        frontmatter templates (placeholder)
│   └── specs/            spec authoring convention docs (placeholder)
│
├── review/
│   ├── code/             per-track code review (angular-portal.md present; nextjs.md + nestjs.md to come)
│   ├── security/         shared.md (cross-track) + per-track narrow checks
│   ├── architecture/     (to come)
│   ├── performance/      (per-track + budget.md to come)
│   └── accessibility/    (per-track + baseline.md to come)
│
└── testing/
    ├── e2e/              per-track e2e patterns (angular-portal.md present; nextjs.md + nestjs.md to come)
    ├── integration/      (per-track, to come)
    ├── unit/             (per-track, to come)
    └── philosophy.md     (cross-track principles, to come)
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
6. If no skill matches, ask a clarifying question or invoke `<track>-onboarding`.

## Workflow per track

Every track shares the same workflow shape (superpowers-aligned, with explicit user-approval gates):

```
Request
  → 01-brainstorm (optional, when scope is open-ended)
  → 02-clarify-requirements
  → 03-write-spec → 04-review-spec      (approval gate)
                  → orchestration/auto-specs  (MANDATORY on approval — snapshot to .sdcorejs/specs/<track>/)
  → 05-plan       → 06-review-plan      (approval gate)
                  → orchestration/auto-plans  (MANDATORY on approval — snapshot to .sdcorejs/plans/<track>/)
  → 07-write-code (dispatches sub-skills; uses orchestration/subagent-driven-dev when fan-out ≥3)
  → 40-e2e-test → 50-review-code → orchestration/repair-loop (if findings)
  → orchestration/comment-code (MANDATORY ASK: skip/simple/medium/full → if full, dispatches 51-write-comments)
  → orchestration/verify-before-done (MANDATORY acceptance gate)
  → orchestration/context-summarizer (MANDATORY) → orchestration/auto-task-tracker (MANDATORY) → orchestration/memories (when durable knowledge surfaces)
```

For the angular-portal track, sub-skills under `07-write-code`:
`10-init-portal`, `11-init-module`, `12-init-entity`, `20-screen-list`, `21-screen-detail`, `22-screen-create`, `23-screen-update`, `30-reactive-form`, `31-workflow-actions`.

## Mandatory rules

To avoid drift, the source of truth for these rules is `CLAUDE.md`. Summary:

1. **Auto-docs is mandatory** — at the end of every code-writing skill invocation, the track-agnostic `skills/orchestration/context-summarizer.md` writes a summary to the **target project's** `.sdcorejs/docs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md` (note the leading dot). Never to this `sdcorejs-agent` repo.

2. **Auto-specs / auto-plans are mandatory** — immediately after `04-review-spec` approval, `skills/orchestration/auto-specs.md` writes the approved spec to `<target>/.sdcorejs/specs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md`. Immediately after `06-review-plan` approval, `skills/orchestration/auto-plans.md` writes the approved plan to `<target>/.sdcorejs/plans/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md`. These corpuses let future `03-write-spec` / `05-plan` mirror the user's confirmed style.

3. **Memories** — durable cross-session knowledge lives under the target project's `.sdcorejs/memories/<track>/`, managed by `skills/orchestration/memories.md`.

4. **Session-start ritual** — read the target project's `.sdcorejs/docs/<track>/*.md` (latest 3) and `.sdcorejs/memories/<track>/*.md` (frontmatter) before answering. Also glob `.sdcorejs/specs/<track>/*.md` and `.sdcorejs/plans/<track>/*.md` (frontmatter only) so the next `03-write-spec` / `05-plan` can mirror style.

5. **Bilingual** — match user's language. Vietnamese request → Vietnamese output (full diacritics). Permission codes and route paths stay English.

6. **Clarify-before-code** — do not generate code if scope is unspecified. Run `02-clarify-requirements` first (or `01-brainstorm` for open-ended ideas).

7. **Approval gates** — `04-review-spec` and `06-review-plan` require explicit user approval before the next skill runs. Approval immediately fires the corresponding auto-specs / auto-plans tail-call (rule 2).

8. **Core UI first** — use `@sd-angular/core` components when one fits; otherwise skeleton + `alert('TODO: ...')` stubs.

9. **Test after generation** — `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts` and report summary.

## Cross-track utility skills (`skills/orchestration/`, `skills/shared/`, `skills/review/`, `skills/testing/`)

Cross-track skills — apply to angular-portal, nestjs, nextjs alike. Dispatch is by skill `name:` frontmatter; the directory layout above is for organization only.

| Skill | Trigger | Mandatory? |
| --- | --- | --- |
| `sdcorejs-verify-before-done` | runs BEFORE auto-docs — verifies acceptance criteria from spec; blocks "done" | ✅ |
| `sdcorejs-auto-docs` | end of every code-writing task — session summary | ✅ |
| `sdcorejs-auto-specs` | IMMEDIATELY after `04-review-spec` approval — snapshot approved spec to `.sdcorejs/specs/<track>/` | ✅ on approval |
| `sdcorejs-auto-plans` | IMMEDIATELY after `06-review-plan` approval — snapshot approved plan to `.sdcorejs/plans/<track>/` | ✅ on approval |
| `sdcorejs-auto-task-tracker` | IMMEDIATELY after auto-docs — `.sdcorejs/tasks/<track>.md` | ✅ |
| `sdcorejs-memories` | "ghi nhớ", durable knowledge | ✅ on trigger |
| `sdcorejs-fix-loop` | after `50-review-code` outputs findings — apply + iterate until clean | ✅ on findings |
| `sdcorejs-comment-code` | ASK gate at comment phase — skip/simple/medium/full; ASK mandatory, outcome optional | ✅ ASK |
| `sdcorejs-code-map` | new feature / reuse check — read-only architecture scan |  |
| `sdcorejs-parallel-dispatch` | fan-out 3+ independent tasks — decision gate (should I split?) |  |
| `sdcorejs-subagent-driven-dev` | after parallel-dispatch=YES — execution: decompose + brief + dispatch + merge |  |
| `sdcorejs-commit` | "commit", "tạo commit" — Conventional Commits + scope + git safety |  |
| `sdcorejs-pr-create` | "tạo PR", "open PR" — PR body from commits + diff |  |
| `sdcorejs-debug` | "lỗi", "error", "fix bug" — systematic debugging |  |
| `sdcorejs-recovery` | "tiếp tục", "resume" — handoff from docs + memories + git state |  |
| `sdcorejs-env-setup` | "thiết lập môi trường", "setup dev" — per-stack bootstrap |  |
| `sdcorejs-changelog` | "viết changelog", release — Keep a Changelog + semver bump |  |
| `sdcorejs-security-review` | "review bảo mật", pre-release — Critical/Important/Minor report |  |
| `sdcorejs-dep-update` | "cập nhật dependency", audit fix — safe upgrade workflow |  |

## Reference docs (load on demand)

- `skills/tracks/angular-portal/_refs/core-version.md` — pinned `@sd-angular/core` version
- `skills/tracks/angular-portal/_refs/sd-angular-core-catalog.md` — Core UI components inventory
- `skills/tracks/angular-portal/_refs/entity-field-types.md` — field type → form control mapping

## Anti-patterns

- Don't author new skills without explicit user approval.
- Don't skip clarify-before-code even when scope seems obvious.
- Don't write `.sdcorejs/docs/`, `.sdcorejs/specs/`, `.sdcorejs/plans/`, or `.sdcorejs/memories/` content in this `sdcorejs-agent` repo. Auto-docs / auto-specs / auto-plans / memories target the user's working project.
- Don't load all skill bodies at session start — frontmatter only for dispatch.

## See also

- `CLAUDE.md` — Claude Code-specific entry point
- `.github/copilot-instructions.md` — GitHub Copilot entry point
- `.github/chatmodes/sdcorejs.chatmode.md` — Copilot specialized chat mode
