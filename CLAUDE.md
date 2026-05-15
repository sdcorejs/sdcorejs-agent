# SDCoreJS SDLC Agent — Claude Code Instructions

This repository (`sdcorejs-agent`) is an **SDLC agent** for the SDCoreJS ecosystem:

- **Backoffice portals** in Angular with `@sd-angular/core` (Core UI)
- **Backend** in NestJS + Postgres
- **Public sites** in Next.js (SSR)

When you (Claude Code) start a session — whether in this repo or in a target project that uses any of these stacks — follow these instructions.

## Tracks and status

| Track | Path | Status |
| --- | --- | --- |
| Angular Portal | `skills/angular-portal/` | ✅ Complete (17 skills) |
| NestJS | `skills/nestjs/` | 🚧 Planned |
| Next.js | `skills/nextjs/` | 🚧 Planned |

Each track exposes its capabilities as **skills** — markdown files with Anthropic-style YAML frontmatter (`name`, `description`, `allowed-tools`).

## Skill dispatch protocol

1. **At session start**, glob `skills/*/*.md` and read each skill's YAML frontmatter only (cheap — body load happens later).
2. **When the user makes a request**, match it against each skill's `description` (the "Use when..." trigger). Pick the highest-confidence match.
3. **Read that skill's body** and follow its instructions exactly.
4. **If multiple skills tie**, pick the lowest-numbered one in the workflow (clarify before plan, plan before write-code, etc).
5. **If no skill matches**, ask a clarifying question or invoke `<track>-onboarding` (e.g. `angular-portal-onboarding`).

## Workflow per track

Every track shares the same workflow shape:

```
Request
  ↓
01-clarify-requirements   ← ask blocking questions (module, entity, fields, version)
  ↓
02-plan                   ← write step-by-step plan, user confirms
  ↓
03-write-code             ← orchestrator that picks sub-skills
   (10-init-portal | 11-init-module | 12-init-entity
    | 20-screen-list | 21-screen-detail | 22-screen-create | 23-screen-update
    | 30-reactive-form | 31-workflow-actions)
  ↓
40-e2e-test               ← write E2E tests for what was just built
  ↓
50-review-code            ← self-review against conventions
51-write-comments         ← add comments + explanations
  ↓
_shared/auto-doc          ← MANDATORY summary to <target>/docs/sdcorejs/<track>/
```

## Mandatory rules (apply to every track)

1. **Auto-doc is mandatory.** At the end of every code-writing skill invocation, run the `auto-doc` skill (currently `skills/angular-portal/_shared/auto-doc.md`; will be promoted to `skills/_shared/auto-doc.md` once NestJS/NextJS land). This writes a session summary to the **target project's** `docs/sdcorejs/<track>/<YYYY-MM-DD-HH-mm>-<topic>.md`. Do NOT write the doc to this `sdcorejs-agent` repo.

2. **Session-start ritual.** When opening a target project, glob the target's `docs/sdcorejs/<track>/*.md`, read the latest 3 entries, and silently load that as context before answering. This is the project's persistent memory of prior work.

3. **Bilingual.** Vietnamese request → Vietnamese output (full diacritics for labels/messages). English → English. Permission codes and route paths stay English in both.

4. **Clarify-before-code.** Do NOT generate code if module ownership, entity name, or key fields are unspecified. Invoke `01-clarify-requirements` first.

5. **Core UI first.** Use `@sd-angular/core` components when one fits. Otherwise generate skeleton + `alert('TODO: ...')` stubs and mark for the developer.

6. **Test after generation.** Run `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts` (Angular) and report summary + failing spec names.

## Reference docs (load on demand only — do not preload)

- `skills/angular-portal/_refs/core-version.md` — pinned `@sd-angular/core` version
- `skills/angular-portal/_refs/sd-angular-core-catalog.md` — Core UI components inventory
- `skills/angular-portal/_refs/entity-field-types.md` — field type → form control mapping

## Anti-patterns

- ❌ Don't author new skills without explicit user approval. To propose a new skill, ask first.
- ❌ Don't skip clarify-before-code even if scope seems obvious — the user must confirm.
- ❌ Don't write `docs/sdcorejs/` content in this `sdcorejs-agent` repo. Auto-doc always targets the user's working project.
- ❌ Don't load all skill bodies at session start. Just read frontmatter for dispatch; full body only when picking a skill.
- ❌ Don't bypass git hooks (`--no-verify`) or `.gitignore`d files when committing.
- ❌ Don't generate code that imports `@sd-angular/core` features not in the catalog (`_refs/sd-angular-core-catalog.md`) without first checking that file.

## See also

- `AGENTS.md` — same instructions for Codex / Cursor / generic AGENTS.md-aware tools
- `.github/copilot-instructions.md` — same instructions for GitHub Copilot
- `.github/chatmodes/sdcorejs.chatmode.md` — Copilot-specific chat mode for SDCoreJS work
