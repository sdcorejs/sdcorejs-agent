---
name: angular-portal-onboarding
description: Use when the user opens this agent for the first time inside an Angular-portal project, asks "what can you do", "how do I start", "list skills", "help", "agent này làm được gì", or seems unsure which skill to invoke. Provides an overview of the Angular-portal SDLC workflow, lists available skills, and routes the user to the next concrete step (usually `sdcorejs-clarify-requirements` from shared/sdlc/, or `sdcorejs-brainstorm` if scope is open-ended). Bilingual (VI/EN).
allowed-tools: Read, Glob, Grep
---

# Onboarding — Angular Portal SDLC Agent

## Purpose
Welcome the developer and help them pick the right next skill. This is the entry point when the developer is new to this agent or unsure where to start.

## When to use
- First interaction in a session
- User asks "agent này làm được gì", "list skill", "help", "how do I use this"
- User describes work but is unsure how to proceed
- User opens the project after a long pause and needs orientation

## Response template

### 1. One-sentence intro
> "This agent helps you build Angular portal apps using `@sd-angular/core` (Core UI), following SDCoreJS conventions across the full SDLC — from requirement clarification to code, tests, review, and documentation."

### 2. SDLC workflow at a glance

```
Request
  ↓
01-brainstorm             ← explore 2-3 approaches (only if scope is open-ended)
  ↓
02-clarify-requirements   ← ask blocking questions (module, entity, fields, version)
  ↓
03-write-spec             ← write design spec (goals, architecture, acceptance criteria)
  ↓
04-review-spec            ← user-approval gate before planning
  ↓
05-plan                   ← write step-by-step plan, user confirms
  ↓
06-review-plan            ← user-approval gate before code
  ↓
07-write-code             ← orchestrator, picks sub-skills:
   ├─ 10-init-portal      (new portal repo)
   ├─ 11-init-module      (new feature module)
   ├─ 12-init-entity      (new entity CRUD pages)
   ├─ 20-screen-list
   ├─ 21-screen-detail
   ├─ 22-screen-create
   ├─ 23-screen-update
   ├─ 30-reactive-form    (form refinement)
   └─ 31-workflow-actions (action buttons, side-effects)
  ↓
40-e2e-test               ← write E2E tests for what was just built
  ↓
50-review-code            ← self-review against conventions
51-write-comments         ← add comments + explanations
  ↓
orchestration/context-summarizer         ← MANDATORY summary to <target>/.sdcorejs/docs/angular-portal/
orchestration/memories          ← write durable knowledge to <target>/.sdcorejs/memories/angular-portal/ (when relevant)
```

### 3. How to invoke skills
You don't need to memorize skill names. Just describe what you want — the agent matches your request against each skill's `description` and picks the right one. Examples:

| User says | Skill picked |
|---|---|
| "Khởi tạo portal-shop với dev/qc/uat/prod" | `10-init-portal` |
| "Thêm entity product, fields code/name/price" | `02-clarify-requirements` (if needed) → `12-init-entity` |
| "Tạo màn list cho user" | `20-screen-list` |
| "Review module catalog" | `50-review-code` |
| "Test cho entity product" | `40-e2e-test` |

### 4. Mandatory rules (always apply)
- **Auto-docs**: every code-writing task ends with a summary at `<target-project>/.sdcorejs/docs/angular-portal/<YYYY-MM-DD-HH-mm>-<topic>.md`. The agent reads this folder at session start to recall prior work.
- **Memories**: durable knowledge (corrections, stakeholder constraints, project decisions) lives at `<target-project>/.sdcorejs/memories/angular-portal/`. Agent reads frontmatter at session start; bodies on demand.
- **Bilingual**: Vietnamese request → Vietnamese output (full diacritics). English request → English output. Permission codes and route paths stay English in both cases.
- **Clarify-before-code**: agent will not generate code when module ownership, entity name, or key fields are unspecified.
- **Test after generation**: `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts`. Report summary and failing spec names.
- **Core UI first**: use `@sd-angular/core` components when one fits; otherwise generate skeleton + `alert('TODO: ...')` stubs and mark for developer.

### 5. Reference docs (loaded on demand)
The agent only reads these when relevant — don't load upfront:
- [`_refs/core-version.md`](./_refs/core-version.md) — pinned `@sd-angular/core` version
- [`_refs/sd-angular-core-catalog.md`](./_refs/sd-angular-core-catalog.md) — Core UI components and patterns
- [`_refs/entity-field-types.md`](./_refs/entity-field-types.md) — field type → form control mapping

### 6. What to do next
- **New project**: invoke `02-clarify-requirements` to define portal name + environments + first module (or `01-brainstorm` first if scope is still open-ended)
- **Existing project**: describe what to add (module / entity / screen). Agent dispatches the right sub-skill.
- **Resuming work**: agent reads `<target>/.sdcorejs/docs/angular-portal/` first to recall what's been built. Skim the latest entry yourself if you want a quick status.

## Output guidelines for this skill
- Keep replies short. Skip preamble like "I am an AI assistant...".
- One bullet per skill, max 1 line each.
- Always end with **one concrete next step** the user can take ("Tell me X to proceed").
- Match the user's language (VI ↔ EN).

## Anti-patterns
- ❌ Don't repeat full rules from other skill files. Link to them.
- ❌ Don't generate code from this skill. Defer to `07-write-code` and its sub-skills.
- ❌ Don't ask clarifying questions about scope here — that's `02-clarify-requirements`'s job.
