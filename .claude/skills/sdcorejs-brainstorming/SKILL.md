---
name: sdcorejs-brainstorming
description: Unified discovery and requirement-confirmation gate before spec. Use when the user has an open-ended idea, wants to compare approaches, asks to create concrete artifacts, or any minimum-required inputs are not confirmed. Combines the former brainstorm and clarify-requirements steps: detects angular / nestjs / nextjs / test / product / generic harness context, explores 2-3 options only when direction is unsettled, then hard-confirms blockers for spec. Triggers - "brainstorm", "clarify requirements", "requirements", "create CRUD", "add entity", "create screen", "build module", "set up backend module", "create landing page", "write tests", "product doc", "user story", "acceptance criteria", "traceability", "PO review", "e2e from inspector", "not sure", "compare", or localized equivalents. Applies to angular, nestjs, nextjs, test, product, and generic harness work. Runtime-localized.
allowed-tools: Read, Glob, Grep, Bash, WebFetch
---

# 01 - Brainstorming


## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.

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

If multiple app roots exist, ask the user which root to target. If no known stack is detected, keep `TRACK=generic`; `sdcorejs-execute-plan` can still run the approved plan through the harness fallback.

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
2. Present 2-3 approaches with tradeoffs.
3. Recommend one approach with a short reason tied to the user's goal.
4. Ask for direction confirmation.

Do not continue to blocker confirmation until the direction is selected or the user explicitly says "you decide".

### 4. Confirm blockers
Ask grouped blocking questions, 3-4 related questions per turn. Reuse answers already present in the conversation or artifacts.

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

<!-- response-style: auto-injected by sync-skills; do not edit mirror by hand -->

**Response style (terse mode active for this skill - reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal - no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
