# SDCoreJS SDLC Agent

> Entry point for AGENTS.md-aware tools (Codex, Cursor, OpenAI Agents SDK, etc).
> Claude Code reads `CLAUDE.md` instead — same skill structure, same rules.

This repo is an SDLC agent for the SDCoreJS stack: Angular portal (Core UI), NestJS + Postgres backend, Next.js public sites. It exposes its capabilities as **skills** — markdown files with YAML frontmatter — that you dispatch based on the user's request.

## Skill structure

```
skills/
├── angular-portal/   ✅  17 skills (00-onboarding through 52-faq)
│   ├── _refs/        reference data, no frontmatter, load on demand
│   └── _shared/      cross-skill rules (auto-doc)
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

Every track shares the same workflow shape:

```
Request → 01-clarify-requirements → 02-plan → 03-write-code (dispatches sub-skills)
        → 40-e2e-test → 50-review-code → 51-write-comments → _shared/auto-doc (MANDATORY)
```

For the angular-portal track, sub-skills under `03-write-code`:
`10-init-portal`, `11-init-module`, `12-init-entity`, `20-screen-list`, `21-screen-detail`, `22-screen-create`, `23-screen-update`, `30-reactive-form`, `31-workflow-actions`.

## Mandatory rules

To avoid drift, the source of truth for these rules is `CLAUDE.md`. Summary:

1. **Auto-doc is mandatory** — at the end of every code-writing skill invocation, write a summary to the **target project's** `docs/sdcorejs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md`. Never to this `sdcorejs-agent` repo.

2. **Session-start ritual** — read the target project's `docs/sdcorejs/<track>/*.md` (latest 3 entries) before answering.

3. **Bilingual** — match user's language. Vietnamese request → Vietnamese output (full diacritics). Permission codes and route paths stay English.

4. **Clarify-before-code** — do not generate code if scope is unspecified. Run `01-clarify-requirements` first.

5. **Core UI first** — use `@sd-angular/core` components when one fits; otherwise skeleton + `alert('TODO: ...')` stubs.

6. **Test after generation** — `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts` and report summary.

## Reference docs (load on demand)

- `skills/angular-portal/_refs/core-version.md` — pinned `@sd-angular/core` version
- `skills/angular-portal/_refs/sd-angular-core-catalog.md` — Core UI components inventory
- `skills/angular-portal/_refs/entity-field-types.md` — field type → form control mapping

## Anti-patterns

- Don't author new skills without explicit user approval.
- Don't skip clarify-before-code even when scope seems obvious.
- Don't write `docs/sdcorejs/` content in this `sdcorejs-agent` repo. Auto-doc targets the user's working project.
- Don't load all skill bodies at session start — frontmatter only for dispatch.

## See also

- `CLAUDE.md` — Claude Code-specific entry point
- `.github/copilot-instructions.md` — GitHub Copilot entry point
- `.github/chatmodes/sdcorejs.chatmode.md` — Copilot specialized chat mode
