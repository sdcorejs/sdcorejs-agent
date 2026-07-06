---
name: sdcorejs-brainstorming
description: Discovery and requirement-confirmation gate before spec. Use for open-ended ideas, compare approaches, CRUD/entity/screen/module/backend/site/test/product-doc requests, or missing blockers. Detects track, explores options only when direction is unsettled, then confirms minimum inputs for spec. Applies to angular, nestjs, nextjs, test, product, generic. Runtime-localized.
allowed-tools: Read, Glob, Grep, Bash, WebFetch
---

# 01 - Brainstorming


## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.
5. Before presenting user-facing choices, approval gates, yes/no questions, or mode selections, read and apply `_refs/shared/user-choice-prompt.md` so options are presented as sequential numbered choices.

## Purpose
Turn a request into a confirmed requirement contract. This skill now owns both jobs that used to be split:

1. Explore options when the direction is still open.
2. Confirm the blocking inputs needed before `sdcorejs-spec`.

Output dialogue only. Do not write specs, plans, or code here.

## Process

### 0. Detect execution context
Detect the target project root, then classify the context:

```bash
TARGET_ROOT=$(git rev-parse --show-toplevel)
cd "$TARGET_ROOT"

if   [ -f angular.json ] || grep -q '"@angular/core"' package.json 2>/dev/null; then TRACK=angular
elif [ -f nest-cli.json ] || grep -q '"@nestjs/core"' package.json 2>/dev/null; then TRACK=nestjs
elif [ -f next.config.js ] || [ -f next.config.ts ] || [ -f next.config.mjs ] || grep -q '"next"' package.json 2>/dev/null; then TRACK=nextjs
elif echo "$USER_INTENT" | grep -Eiq 'test|e2e|unit|integration|inspector|playwright|cypress|robot'; then TRACK=test
elif echo "$USER_INTENT" | grep -Eiq 'product doc|po doc|user stor(y|ies)|acceptance criteria|traceability|uat|requirement review|gap review'; then TRACK=product
else TRACK=generic
fi
```

If multiple app roots exist, ask the user which root to target with a numbered
list and short aliases from `_refs/shared/user-choice-prompt.md`. If no known
stack is detected, keep `TRACK=generic`; `sdcorejs-execute-plan` can still run
the approved plan through the harness fallback.

### 1. Load context cheaply
Read only what changes the questions:

- Latest 3 `.sdcorejs/docs/<track>/*.md`, if present.
- `.sdcorejs/memories/<track>/*.md` frontmatter; load relevant bodies only.
- Latest approved specs/plans frontmatter under `.sdcorejs/specs/<track>/` and `.sdcorejs/plans/<track>/`.
- For angular / nestjs / nextjs: `_refs/sdlc/<track>.md`.
- For test: `_refs/shared/testing-philosophy.md`, then the target stack test ref when known.
- For product: latest `.sdcorejs/docs/product/*.md` plus related specs/plans.

### 2. Decide explore mode vs confirm mode
Use explore mode when the request is unsettled:

- The user describes a goal, not concrete artifacts.
- There are multiple plausible approaches.
- The user compares options or says they are unsure.
- For nextjs, industry / audience / page set is unknown.
- For angular / nestjs, module ownership or workflow shape is unclear.
- For test, the user provided selectors or an inspector export without test cases and assertions.

Use confirm mode when the user already gave concrete artifacts and the remaining work is to lock blockers.

### 3. Explore only when needed
When in explore mode:

1. Ask at most one targeted question if the answer changes the option set.
2. Present 2-3 approaches with stable numeric selectors (`1/2/3`) and tradeoffs.
3. Recommend one approach with a short reason tied to the user's goal.
4. Ask for direction confirmation and state that the user can reply with the selector, alias, or "you decide".

Do not continue to blocker confirmation until the direction is selected or the user explicitly says "you decide".

## Optional Visual Companion

Use the visual companion as an optional browser-based aid during brainstorming
when seeing a mockup, wireframe, layout, diagram, flow, or side-by-side
comparison would make the next decision clearer than text.

The visual companion is a tool, not a mode. Accepting it means it is available
for suitable visual questions; it does not mean every brainstorming step should
use the browser.

Do not offer the visual companion upfront. First understand the user's request,
project context, constraints, and current design question. Offer it only when
the next decision would genuinely be clearer if shown visually, such as choosing
between layouts, UI flows, component structures, information architecture,
navigation models, visual hierarchy, architecture boundaries, data flows, state
machines, entity relationships, or side-by-side design directions.

When that first genuinely visual decision appears, send the offer as its own
standalone message using two numbered choices. Runtime-localize the prose while
preserving the two-choice shape:

```text
The next decision may be easier to understand if shown visually as a mockup,
diagram, or browser comparison. Which direction do you want?

1. Use visual companion to preview visual options before approving the design
2. Do not use visual companion; continue brainstorming in text + TDD

Reply with `1` or `2`.
```

Do not combine this offer with a clarifying question, implementation plan,
design summary, or any other content. Wait for the user's response.

If the user chooses option 1:

- Read `visual-companion.md` before proceeding.
- Locate the visual companion reference, runtime, and templates using the
  current skill/project convention.
- Start or use the available visual companion runtime if one exists.
- If no browser runtime exists, create static HTML or Markdown visual artifacts
  using the current project convention.
- Use the visual companion per question, not per session.
- Create one visual decision screen at a time.
- Prefer 2-3 options, not many options.
- Ask the user to review the screen and respond in the main conversation.
- Treat browser clicks or visual selections as supporting feedback, not as the
  only source of truth.
- Merge visual feedback with the user's written response before updating the
  design.

If the user chooses option 2:

- Continue text-only.
- Do not offer the visual companion again unless the user asks for it or a later
  design decision would be extremely unclear without visual support.

Per-question rule:

- Use browser visuals for UI mockups, wireframes, layout comparisons, navigation
  structures, architecture diagrams, data-flow diagrams, state machines, entity
  relationships, spatial relationships, before/after UX comparisons, and visual
  polish questions.
- Use text for requirements, scope, API design, data model decisions, TDD
  strategy, trade-off lists, business rules, acceptance criteria, and
  implementation sequencing.

A UI-related topic is not automatically a visual topic. "What should this
dashboard do?" is text. "Which dashboard layout feels clearer?" is visual.

The main conversation remains the source of truth. Browser clicks, UI
selections, or visual-only feedback are supporting signals. If visual feedback
conflicts with the user's written response, prioritize the written response.

The visual companion must never bypass the normal `sdcorejs-brainstorming` gate:

1. Understand context.
2. Clarify intent and constraints.
3. Propose options.
4. Get design approval.
5. Convert the approved direction into acceptance criteria and testable
   behavior.
6. Only then move to implementation planning and TDD.

### 4. Confirm blockers
Ask grouped blocking questions, 3-4 related questions per turn. Reuse answers
already present in the conversation or artifacts. When a blocker has known
alternatives, label them with short selectors so the user can reply quickly.

Minimum blockers by context:

| Context | Required before spec |
|---|---|
| angular | module, entity/screen, fields or visible data, layout, workflow/actions, permissions if applicable |
| nestjs | module, entity/resource, persistence, transaction style, endpoint/action set, profile (`simple` default for non-tech users) |
| nextjs | domain or temporary production URL, target audience, page set, contact channel, languages, hosting/caching, OG/SEO expectations |
| test | target stack, test level, subject under test, cases with expected results, data/auth/env, selector/source inventory, reuse vs new fixtures |
| product | feature name, business goal, users/personas, scenarios, acceptance criteria seed, source artifacts, impacted tracks, UAT expectations |
| generic | goal, files/areas in scope, constraints, acceptance criteria, verification command or manual check |

Also ask the coverage approach once:

- `post-hoc` (default for UI/content scaffolding).
- `TDD` (default for service logic, validators, workflows, transactions).

Record this answer for `sdcorejs-plan`.

### 5. Infer then confirm
When a semantic default is obvious, propose it instead of asking from scratch:

- Entity fields from entity name.
- Next.js page set from industry and goal.
- Test cases from acceptance criteria or an inspector export.
- Product acceptance criteria from approved requirements, marking inferred items for confirmation.
- Generic harness verification from scripts in `package.json`.

Always present inferred values for confirmation before locking them.

### 6. Output the requirement contract
End with a concise confirmed summary in the user's language:

- Track/context.
- Chosen direction.
- Required inputs.
- Defaults accepted.
- Coverage approach.
- Acceptance criteria seed.
- Open questions, if any.

If any minimum blocker remains unanswered, stop here and ask only for the missing blocker. When all blockers are confirmed, hand off to `sdcorejs-spec`.

## Rules

### Must do
- Keep the user's language at runtime.
- Preserve locale-specific marks in generated labels and prose.
- Use English identifiers, permission codes, and route paths.
- Block `sdcorejs-spec` until minimum blockers are confirmed.
- Save durable repeated preferences through `sdcorejs-explore (memories mode)` when relevant.

### Must not
- Generate code, specs, plans, or commits.
- Ask architecture questions to a non-tech persona when a safe default exists.
- Show angular blockers to nextjs, or nestjs blockers to test.
- Dump every question at once.
- Treat "thanks" or silence as approval.

## Hand-off
Pass `sdcorejs-spec` this context:

- target root
- detected context/track
- confirmed requirement contract
- chosen direction and tradeoffs considered
- source artifacts provided by the user
- coverage approach

## Cross-references
- `_refs/sdlc/<track>.md` - angular / nestjs / nextjs discovery, spec, and plan patterns
- `_refs/shared/testing-philosophy.md` - test-track principles
- `sdcorejs-product` - product ledger and traceability review
- `sdcorejs-spec` - writes and reviews the spec gate
- `sdcorejs-explore (memories mode)` - durable project preferences
