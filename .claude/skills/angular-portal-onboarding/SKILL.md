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
> "This agent helps you build Angular portal apps using `@sdcorejs/angular` (Core UI), following SDCoreJS conventions across the full SDLC — from requirement clarification to code, tests, review, and documentation."

### 2. SDLC workflow at a glance

Design phase is **cross-track** (`skills/shared/sdlc/`); each skill detects the target as `angular-portal` and loads `_refs/sdlc/angular-portal.md`. Code-writing + tests + reviews are track-specific.

```
Request
  ↓
shared/sdlc/01-brainstorm        (sdcorejs-brainstorm)
  ← only if scope is open-ended
  ↓
shared/sdlc/02-clarify-requirements  (sdcorejs-clarify-requirements)
  ← blocking questions: module / entity / fields / layout / workflow / coverage
  ↓
shared/sdlc/03-write-spec        (sdcorejs-write-spec)
  ← spec written to <target>/.sdcorejs/docs/angular-portal/*-spec.md
  ↓
shared/sdlc/04-review-spec       (sdcorejs-review-spec) — APPROVAL GATE
  ↓
orchestration/auto-specs         ← MANDATORY on approval; snapshot to .sdcorejs/specs/angular-portal/
  ↓
shared/sdlc/05-plan              (sdcorejs-plan)
  ← numbered file-by-file plan
  ↓
shared/sdlc/06-review-plan       (sdcorejs-review-plan) — APPROVAL GATE
  ↓
orchestration/auto-plans         ← MANDATORY on approval; snapshot to .sdcorejs/plans/angular-portal/
  ↓
tracks/angular-portal/07-write-code  (angular-portal-write-code)
  ← single orchestrator skill; reads the confirmed scope and loads the matching
    on-demand reference pack under _refs/angular-portal/write-code/:
   ├─ init-portal.md       (new portal repo)
   ├─ init-module.md       (new feature module)
   ├─ init-entity.md       (new entity CRUD = model/service/routes/list/detail — links to _refs/angular-portal/templates/)
   ├─ screen-list.md       (list page)
   ├─ screen-detail.md     (detail.component.ts — CREATE / UPDATE / DETAIL + form refinement)
   └─ actions.md           (action buttons — workflow / bulk / custom side-effects)
  (these 6 were standalone sub-skills before — now consolidated so the track
   exposes ONE skill instead of seven)
  ↓
testing/e2e/angular-portal       (sdcorejs-testing-e2e-angular-portal)
  ← happy-path E2E for what was just built
  ↓
review/code.md                   (sdcorejs-review-code)
  ← convention check; Critical / Important / Minor findings
  ↓
orchestration/repair-loop        ← apply findings + iterate until Critical+Important resolved
  ↓
orchestration/comment-code       ← MANDATORY ASK gate: skip / simple / medium / full
   └─ rules applied inline (cross-track baseline + per-track addenda live in this skill)
  ↓
orchestration/verify-before-done ← MANDATORY acceptance-criteria gate; blocks "done" until ✅ / deferred
  ↓
orchestration/auto-docs ← MANDATORY summary to <target>/.sdcorejs/docs/angular-portal/
orchestration/auto-task-tracker  ← MANDATORY; tick `[x]` done + append new in .sdcorejs/tasks/angular-portal.md
orchestration/memories           ← durable knowledge (when surfaced) to .sdcorejs/memories/angular-portal/
```

### 3. How to invoke skills
You don't need to memorize skill names. Just describe what you want — the agent matches your request against each skill's `description` and picks the right one. Examples:

| User says | Skill picked |
|---|---|
| "Khởi tạo portal-shop với dev/qc/uat/prod" | `angular-portal-write-code` (→ init-portal pack) |
| "Thêm entity product, fields code/name/price" | `sdcorejs-clarify-requirements` (cross-track) → `angular-portal-write-code` (→ init-entity pack) |
| "Tạo màn list cho user" | `angular-portal-write-code` (→ screen-list pack) |
| "Review module catalog" | `sdcorejs-review-code` |
| "Test cho entity product" | `sdcorejs-testing-e2e-angular-portal` |
| "Brainstorm cho module sales" | `sdcorejs-brainstorm` (cross-track) |
| "Viết spec cho module catalog" | `sdcorejs-write-spec` (cross-track) |

### 4. Mandatory rules (always apply)
- **Project summary (gate)**: a single canonical `<target-project>/.sdcorejs/summary.md` describes what the project IS (domain, stack, architecture, reuse cheatsheet). It's read at session start; if missing, `sdcorejs-auto-summary` MUST generate it (via `sdcorejs-code-map`) before any code-writing. Distinct from auto-docs — this is the evergreen overview, not per-session deltas.
- **Auto-docs**: every code-writing task ends with a summary at `<target-project>/.sdcorejs/docs/angular-portal/<YYYY-MM-DD-HH-mm>-<topic>.md`. The agent reads this folder at session start to recall prior work.
- **Memories**: durable knowledge (corrections, stakeholder constraints, project decisions) lives at `<target-project>/.sdcorejs/memories/angular-portal/`. Agent reads frontmatter at session start; bodies on demand.
- **Bilingual**: Vietnamese request → Vietnamese output (full diacritics). English request → English output. Permission codes and route paths stay English in both cases.
- **Clarify-before-code**: agent will not generate code when module ownership, entity name, or key fields are unspecified.
- **Test after generation**: `npm run test -- --watch=false --include=src/libs/<module>/**/*.spec.ts`. Report summary and failing spec names.
- **Core UI first**: use `@sdcorejs/angular` components when one fits; otherwise generate skeleton + `alert('TODO: ...')` stubs and mark for developer.

### 5. Reference docs (loaded on demand)
The agent only reads these when relevant — don't load upfront:
- [`_refs/angular-portal/architecture-principles.md`](_refs/angular-portal/architecture-principles.md) — **the WHY**: 16 principles governing what generated code looks like (feature-first, signal-first, no cross-module imports, OnPush default, 4 canonical layouts, mock-first, …). Load when explaining a decision, reviewing a deviation, or onboarding a new contributor.
- [`_refs/angular-portal/core-version.md`](_refs/angular-portal/core-version.md) — pinned `@sdcorejs/angular` version
- [`_refs/angular-portal/sdcorejs-angular-catalog.md`](_refs/angular-portal/sdcorejs-angular-catalog.md) — Core UI components and patterns
- [`_refs/angular-portal/entity-field-types.md`](_refs/angular-portal/entity-field-types.md) — field type → form control mapping
- [`_refs/angular-portal/templates/entity-{skeleton,tests,example-product}.md`](_refs/angular-portal/templates/) — canonical code templates emitted by `angular-portal-write-code` (init-entity pack)
- [`_refs/angular-portal/write-code/*.md`](_refs/angular-portal/write-code/) — the 6 on-demand reference packs the write-code orchestrator dispatches to (init-portal / init-module / init-entity / screen-list / screen-detail / actions)

### 6. What to do next
- **New project**: invoke `sdcorejs-clarify-requirements` (cross-track) to define portal name + environments + first module — or `sdcorejs-brainstorm` first if scope is still open-ended.
- **Existing project**: describe what to add (module / entity / screen). Agent dispatches the right sub-skill.
- **Resuming work**: agent reads `<target>/.sdcorejs/docs/angular-portal/` first to recall what's been built. Skim the latest entry yourself if you want a quick status — or invoke `sdcorejs-recovery` for a one-screen handoff.

## Output guidelines for this skill
- Keep replies short. Skip preamble like "I am an AI assistant...".
- One bullet per skill, max 1 line each.
- Always end with **one concrete next step** the user can take ("Tell me X to proceed").
- Match the user's language (VI ↔ EN).

## Anti-patterns
- ❌ Don't repeat full rules from other skill files. Link to them.
- ❌ Don't generate code from this skill. Defer to `angular-portal-write-code` and its reference packs.
- ❌ Don't ask clarifying questions about scope here — that's `sdcorejs-clarify-requirements`'s job (cross-track).

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
