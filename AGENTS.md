# SDCoreJS SDLC Agent

> Entry point for AGENTS.md-aware tools (Codex, Cursor, OpenAI Agents SDK, etc).
> Claude Code reads `CLAUDE.md` instead — same skill structure, same rules.

This repo is an SDLC agent for the SDCoreJS stack: Angular portal (Core UI), NestJS + Postgres backend, Next.js public sites. It exposes its capabilities as **skills** — markdown files with YAML frontmatter — that you dispatch based on the user's request.

## Skill structure

```
skills/
├── _shared/          cross-track utility skills (12 files: auto-docs, auto-task-tracker, memories, code-map, commit, pr-create, debug, recovery, env-setup, changelog, security-review, dep-update, parallel-dispatch)
├── angular-portal/   ✅  21 skills (00-onboarding through 52-faq)
│   └── _refs/        reference data, no frontmatter, load on demand
├── nestjs/           🚧  planned
└── nextjs/           🚧  planned
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
  → 05-plan       → 06-review-plan      (approval gate)
  → 07-write-code (dispatches sub-skills)
  → 40-e2e-test → 50-review-code → 51-write-comments
  → _shared/auto-docs (MANDATORY) + _shared/memories (when durable knowledge surfaces)
```

For the angular-portal track, sub-skills under `07-write-code`:
`10-init-portal`, `11-init-module`, `12-init-entity`, `20-screen-list`, `21-screen-detail`, `22-screen-create`, `23-screen-update`, `30-reactive-form`, `31-workflow-actions`.

## Mandatory rules

To avoid drift, the source of truth for these rules is `CLAUDE.md`. Summary:

1. **Auto-docs is mandatory** — at the end of every code-writing skill invocation, the track-agnostic `skills/_shared/auto-docs.md` writes a summary to the **target project's** `.sdcorejs/docs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md` (note the leading dot). Never to this `sdcorejs-agent` repo.

2. **Memories** — durable cross-session knowledge lives under the target project's `.sdcorejs/memories/<track>/`, managed by `skills/_shared/memories.md`.

3. **Session-start ritual** — read the target project's `.sdcorejs/docs/<track>/*.md` (latest 3) and `.sdcorejs/memories/<track>/*.md` (frontmatter) before answering.

4. **Bilingual** — match user's language. Vietnamese request → Vietnamese output (full diacritics). Permission codes and route paths stay English.

5. **Clarify-before-code** — do not generate code if scope is unspecified. Run `02-clarify-requirements` first (or `01-brainstorm` for open-ended ideas).

6. **Approval gates** — `04-review-spec` and `06-review-plan` require explicit user approval before the next skill runs.

7. **Core UI first** — use `@sd-angular/core` components when one fits; otherwise skeleton + `alert('TODO: ...')` stubs.

8. **Test after generation** — `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts` and report summary.

## Shared utility skills (`skills/_shared/`)

Cross-track skills — apply to angular-portal, nestjs, nextjs alike. Dispatch by `description`:

| Skill | Trigger | Mandatory? |
| --- | --- | --- |
| `sdcorejs-auto-docs` | end of every code-writing task — session summary | ✅ |
| `sdcorejs-auto-task-tracker` | IMMEDIATELY after auto-docs — `.sdcorejs/tasks/<track>.md` | ✅ |
| `sdcorejs-memories` | "ghi nhớ", durable knowledge | ✅ on trigger |
| `sdcorejs-code-map` | new feature / reuse check — read-only architecture scan |  |
| `sdcorejs-commit` | "commit", "tạo commit" — Conventional Commits + scope + git safety |  |
| `sdcorejs-pr-create` | "tạo PR", "open PR" — PR body from commits + diff |  |
| `sdcorejs-debug` | "lỗi", "error", "fix bug" — systematic debugging |  |
| `sdcorejs-recovery` | "tiếp tục", "resume" — handoff from docs + memories + git state |  |
| `sdcorejs-env-setup` | "thiết lập môi trường", "setup dev" — per-stack bootstrap |  |
| `sdcorejs-changelog` | "viết changelog", release — Keep a Changelog + semver bump |  |
| `sdcorejs-security-review` | "review bảo mật", pre-release — Critical/Important/Minor report |  |
| `sdcorejs-dep-update` | "cập nhật dependency", audit fix — safe upgrade workflow |  |
| `sdcorejs-parallel-dispatch` | fan-out 3+ independent tasks — decision gate + briefing |  |

## Reference docs (load on demand)

- `skills/angular-portal/_refs/core-version.md` — pinned `@sd-angular/core` version
- `skills/angular-portal/_refs/sd-angular-core-catalog.md` — Core UI components inventory
- `skills/angular-portal/_refs/entity-field-types.md` — field type → form control mapping

## Anti-patterns

- Don't author new skills without explicit user approval.
- Don't skip clarify-before-code even when scope seems obvious.
- Don't write `.sdcorejs/docs/` or `.sdcorejs/memories/` content in this `sdcorejs-agent` repo. Auto-docs and memories target the user's working project.
- Don't load all skill bodies at session start — frontmatter only for dispatch.

## See also

- `CLAUDE.md` — Claude Code-specific entry point
- `.github/copilot-instructions.md` — GitHub Copilot entry point
- `.github/chatmodes/sdcorejs.chatmode.md` — Copilot specialized chat mode
