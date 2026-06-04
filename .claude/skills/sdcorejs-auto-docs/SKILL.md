---
name: sdcorejs-auto-docs
description: MANDATORY skill that runs automatically at the end of EVERY code-writing task across all SDCoreJS tracks (angular-portal, nestjs, nextjs). Writes a session summary as a new markdown file in the target project under `.sdcorejs/docs/<track>/` so the next session can recall prior context. Also runs in READ-ONLY mode at session start to refresh memory. Triggers - end of any code-writing skill invocation (write-code orchestrator, init-X, screen-X, e2e-test, review-code, write-comments) AND start of a new session inside a target project. Applies to angular-portal, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Write, Bash, Glob
---

# Auto-Docs — Session Summary

## Purpose
Mandatory + automatic. Gives the next session a memory of what was done, what was decided, and what's still open. Without this, every new session starts blind.

This skill is shared across SDCoreJS tracks (`angular-portal`, `nestjs`, `nextjs`). The agent substitutes the `<track>` placeholder below with the active track name when resolving paths.

## When invoked

### Auto-trigger at end of code-writing skills
The agent MUST run this skill (write mode) at the end of every code-writing skill invocation, without prompting. For the angular-portal track that means:
- `07-write-code` (the `angular-portal-write-code` orchestrator, plus the on-demand reference packs it loads: `init-portal`, `init-module`, `init-entity`, `screen-list`, `screen-detail`, `actions`)
- `40-e2e-test`
- `sdcorejs-review-code` (write a "review session" doc summarizing findings, even though no code changed)
- `orchestration/comment-code` when the chosen level is not `skip`

For nestjs and nextjs tracks, the equivalent code-writing skills under each track folder trigger this skill the same way.

If the skill being run did not change any code AND did not produce a new finding, skip auto-docs.

### Session-start ritual (read-only mode)
At the START of any new session in a target project, the agent MUST:
1. Resolve target project root: `git rev-parse --show-toplevel` from the user's CWD
2. Glob `<target-root>/.sdcorejs/docs/<track>/*.md` for the relevant track
3. Read the latest 3 files (sorted by filename — timestamp prefix sorts naturally)
4. Summarize them to itself before answering the user's first question
5. Acknowledge briefly: "Đã đọc 3 doc gần nhất từ .sdcorejs/docs/<track>/. Bạn muốn ..." (or EN equivalent)

This read-only step does NOT write a new doc.

## Output path

```bash
# Resolve target project root (NOT the sdcorejs-agent repo!)
TARGET_ROOT=$(git rev-parse --show-toplevel)

# Pick the active <track>: angular-portal | nestjs | nextjs
TRACK=angular-portal

# Ensure folder exists (note the leading dot in .sdcorejs/)
mkdir -p "$TARGET_ROOT/.sdcorejs/docs/$TRACK"

# Filename pattern: YYYY-MM-DD-HH-mm-<kebab-topic>.md
FILE="$TARGET_ROOT/.sdcorejs/docs/$TRACK/2026-05-09-14-30-add-product-entity.md"
```

The `<kebab-topic>` is a 3-6 word slug derived from what was actually done. Examples:
- `init-sales-portal`
- `add-product-entity-to-catalog`
- `refine-employee-form-validation`
- `review-pricing-module`
- `add-comments-to-payment-flow`

## Output content template

```markdown
# <Title> — <YYYY-MM-DD HH:mm>

## What was requested
<1-3 sentence verbatim or paraphrased user request, in user's original language>

## What was changed
- CREATE  src/libs/catalog/features/product/services/product.model.ts — Product DTO + SaveReq with 6 fields
- CREATE  src/libs/catalog/features/product/services/product.mock-data.ts — 25 seed rows
- CREATE  src/libs/catalog/features/product/services/product.service.ts — MockCrudStore wiring
- CREATE  src/libs/catalog/features/product/pages/list/list.component.ts — list page with audit columns
- CREATE  src/libs/catalog/features/product/pages/detail/detail.component.ts — UnifiedCompact 3-state
- EDIT    src/libs/catalog/routes.ts — registered product child route

## Decisions made
- Layout: chose UnifiedCompact (form is 6 fields, no workflow blocks)
- Test coverage level: standard (per user response)
- Bilingual: Vietnamese labels with full diacritics (per portal language)
- Permission codes: `CATALOG_C_PRODUCT_LIST/DETAIL/CREATE/UPDATE/DELETE`

## Open questions / follow-ups
- Backend API host not yet provided — service is mock-first; switch to BaseService when API contract lands
- No workflow yet; if approval flow is needed later, invoke `angular-portal-write-code` (actions pack)

## Next suggested action
- Run `npm run test -- --watch=false --include=src/libs/catalog/features/product/**/*.spec.ts`
- Open `http://localhost:4200/catalog/product` to verify list renders
- Optional: invoke `40-e2e-test` to add happy-path E2E coverage

## Skill provenance
Skills invoked this session: `02-clarify-requirements` → `05-plan` → `07-write-code` (init-entity pack)
```

## Rules

### MUST DO
- Resolve `TARGET_ROOT` via `git rev-parse --show-toplevel` from the user's CWD; never write to the agent repo
- Create the `.sdcorejs/docs/<track>/` folder if it doesn't exist (leading dot is required)
- Use timestamp prefix `YYYY-MM-DD-HH-mm-` so files sort chronologically
- Always create a NEW file — never overwrite an existing one
- Include the file list with CREATE/EDIT markers
- Capture decisions and trade-offs that future sessions would not infer from the code alone
- Note open questions / follow-ups so the next session knows what's incomplete
- At session start, read the 3 latest docs and acknowledge in ≤1 sentence so the user knows context was loaded
- Pair with `orchestration/memories.md`: auto-docs captures session-scoped facts; `memories.md` captures durable knowledge that survives across sessions

### MUST NOT
- Write a doc to the `sdcorejs-agent` repo (the agent repo is the source for skills, not session memory)
- Write to `docs/sdcorejs/` or `.docs/sdcorejs/` (legacy paths) — the canonical location is `.sdcorejs/docs/`
- Overwrite an existing doc — collisions are impossible if the timestamp includes minutes; if collision still happens (rapid-fire), append `-2`, `-3` suffix
- Write empty / template-only docs — if nothing was done, skip
- Write docs in a language different from the user's session language (VI request → VI doc; EN request → EN doc; mixed → match the dominant language)
- Skip the session-start read step — that's how memory works
- Leak secrets, tokens, or full file contents into the doc (file paths + summaries only)

## Cross-track usage

This skill applies to `angular-portal`, `nestjs`, and `nextjs` tracks. The only difference is the `<track>` segment in the output path:
- Angular: `.sdcorejs/docs/angular-portal/`
- NestJS: `.sdcorejs/docs/nestjs/`
- NextJS: `.sdcorejs/docs/nextjs/`

When the agent works inside a multi-track repo, write to the track folder matching the work performed. If unsure, ask the user before writing.

## Anti-patterns
- Writing the doc to the agent repo (`sdcorejs-agent/.sdcorejs/...`) instead of the target project
- Writing to `docs/sdcorejs/` or `.docs/sdcorejs/` (legacy paths) — canonical is `.sdcorejs/docs/`
- Overwriting yesterday's doc with today's — destroys the history that makes this skill valuable
- Empty doc with only a title (no info to recall later)
- Doc that lists every file change with no decisions/rationale (the diff already exists in git)
- Skipping session-start read because "user didn't ask for it" — this is mandatory automatic behavior
- Dumping full file contents into the doc — keep it scannable (file path + 1-line intent)
- Forgetting to set `<track>` correctly in multi-track repos
- Hardcoding `angular-portal` when the active track is actually nestjs/nextjs

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
