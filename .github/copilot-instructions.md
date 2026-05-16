# SDCoreJS SDLC Agent — GitHub Copilot Instructions

This repository is an **SDLC agent** for the SDCoreJS ecosystem. When you (GitHub Copilot) work in this repo or in a target project that uses SDCoreJS stacks, follow these instructions.

## Stacks supported

- **Backoffice portals** in Angular with `@sd-angular/core` (Core UI)
- **Backend** in NestJS + Postgres
- **Public sites** in Next.js (SSR)

## Tracks and status

| Track | Path | Status |
| --- | --- | --- |
| Angular Portal | `skills/angular-portal/` | ✅ Complete (21 skills) |
| NestJS | `skills/nestjs/` | 🚧 Planned |
| Next.js | `skills/nextjs/` | 🚧 Planned |

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
5. **If no skill matches**, ask a clarifying question or invoke `<track>-onboarding` (e.g. `angular-portal-onboarding`).

## Workflow per track

```
Request
  → 01-brainstorm (optional)
  → 02-clarify-requirements
  → 03-write-spec → 04-review-spec      (approval gate)
  → 05-plan       → 06-review-plan      (approval gate)
  → 07-write-code (dispatches sub-skills)
  → 40-e2e-test → 50-review-code → 51-write-comments
  → _shared/auto-docs (MANDATORY) + _shared/memories (durable knowledge)
```

Sub-skills under `07-write-code` (angular-portal track):
`10-init-portal`, `11-init-module`, `12-init-entity`, `20-screen-list`, `21-screen-detail`, `22-screen-create`, `23-screen-update`, `30-reactive-form`, `31-workflow-actions`.

## Mandatory rules (apply to every track)

1. **Auto-docs is mandatory.** At the end of every code-writing skill invocation, run the track-agnostic `auto-docs` skill at `skills/_shared/auto-docs.md`. This writes a session summary to the **target project's** `.sdcorejs/docs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md` (leading dot is required). Do NOT write the doc to this `sdcorejs-agent` repo.

2. **Memories.** Durable cross-session knowledge lives under the target project's `.sdcorejs/memories/<track>/`, managed by `skills/_shared/memories.md`. Write when the user says "ghi nhớ"/"remember this" or when a recurring correction is detected.

3. **Session-start ritual.** When opening a target project, glob the target's `.sdcorejs/docs/<track>/*.md` (latest 3) and `.sdcorejs/memories/<track>/*.md` (frontmatter), and silently load that as context before answering.

4. **Bilingual.** Vietnamese request → Vietnamese output (full diacritics for labels/messages). English → English. Permission codes and route paths stay English in both.

5. **Clarify-before-code.** Do NOT generate code if module ownership, entity name, or key fields are unspecified. Invoke `02-clarify-requirements` first (or `01-brainstorm` for open-ended ideas).

6. **Approval gates.** `04-review-spec` and `06-review-plan` REQUIRE explicit user approval before proceeding.

7. **Core UI first.** Use `@sd-angular/core` components when one fits. Otherwise generate skeleton + `alert('TODO: ...')` stubs and mark for the developer.

8. **Test after generation.** Run `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts` and report summary + failing spec names.

## Copilot-specific notes

- The chat mode `.github/chatmodes/sdcorejs.chatmode.md` provides a focused experience for SDCoreJS work. Activate it when working on SDCoreJS-stack projects.
- Prompt files in `.github/prompts/` are legacy fallback prompts kept for teammates without skill-aware Copilot. They duplicate skill content in a single-prompt form.
- When a skill's `allowed-tools` includes `Bash`, Copilot's terminal tool is the equivalent.

## Reference docs (load on demand only)

- `skills/angular-portal/_refs/core-version.md` — pinned `@sd-angular/core` version
- `skills/angular-portal/_refs/sd-angular-core-catalog.md` — Core UI components inventory
- `skills/angular-portal/_refs/entity-field-types.md` — field type → form control mapping

## Anti-patterns

- ❌ Don't author new skills without explicit user approval. To propose a new skill, ask first.
- ❌ Don't skip clarify-before-code even if scope seems obvious — the user must confirm.
- ❌ Don't write `.sdcorejs/docs/` or `.sdcorejs/memories/` content in this `sdcorejs-agent` repo. Auto-docs and memories always target the user's working project.
- ❌ Don't load all skill bodies at session start — frontmatter only for dispatch; full body only when a skill is picked.

## See also

- `CLAUDE.md` — same instructions for Claude Code
- `AGENTS.md` — same instructions for Codex / Cursor / generic AGENTS.md-aware tools
- `.github/chatmodes/sdcorejs.chatmode.md` — Copilot specialized chat mode

## Persistent repo memory (legacy)

Reference docs may still mention `knowledge/repo-memory/`. That directory holds older context kept for reference; do NOT load it eagerly. The new skill structure under `skills/<track>/` is the primary source of truth.
