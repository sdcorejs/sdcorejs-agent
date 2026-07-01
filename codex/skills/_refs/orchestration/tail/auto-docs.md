# Auto-Docs Tail Reference — Session Summary

## Purpose
Internal tail reference. Load this file from a dispatchable executor when a session summary must be written or read. This file is not a dispatchable skill.

Gives the next session a memory of what was done, what was decided, and what's still open. Without this, every new session starts blind.

This reference is shared across SDCoreJS app/test tracks (`angular`, `nestjs`, `nextjs`, `test`). The agent substitutes the `<track>` placeholder below with the active track name when resolving paths.

Product traceability is a separate ledger under `.sdcorejs/docs/product/`, owned by `sdcorejs-product`. Auto-docs should link to that ledger when a user-visible feature changes, but it should not duplicate the requirement/implementation/test matrix.

## When invoked

### End of code-writing skills
The agent MUST run this reference (write mode) at the end of every code-writing skill invocation, without prompting. For the angular track that means:
- `write-code` (the `sdcorejs-angular` orchestrator, plus the on-demand reference packs it loads: `init-portal`, `init-module`, `init-entity`, `screen-list`, `screen-detail`, `actions`)
- `sdcorejs-test`
- `sdcorejs-review` (write a "review session" doc summarizing findings, even though no code changed)
- `sdcorejs-documentation (comment-code mode)` when the chosen level is not `skip`

For nestjs, nextjs, and test tracks, the equivalent writing skills trigger this skill the same way.

If a user-visible feature was created or changed, also invoke or update `sdcorejs-product` so `.sdcorejs/docs/product/` records the business goal, acceptance criteria, implementation map, test map, and gaps.

If the current executor did not change any code AND did not produce a new finding, skip auto-docs.

### Session-start ritual (read-only mode)
At the START of any new session in a target project, the agent MUST:
1. Resolve target project root: `git rev-parse --show-toplevel` from the user's CWD
2. Glob `<target-root>/.sdcorejs/docs/<track>/*.md` for the relevant track
3. Read the latest 3 files (sorted by filename — timestamp prefix sorts naturally)
4. Summarize them to itself before answering the user's first question
5. Acknowledge briefly: "<localized text>" (or EN equivalent)

This read-only step does NOT write a new doc.

## Output path

```bash
# Resolve target project root (NOT the sdcorejs-agent repo!)
TARGET_ROOT=$(git rev-parse --show-toplevel)

# Pick the active <track>: angular | nestjs | nextjs | test
TRACK=angular

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
- Runtime-localized labels with locale-specific marks preserved
- Permission codes: `CATALOG_C_PRODUCT_LIST/DETAIL/CREATE/UPDATE/DELETE`

## Open questions / follow-ups
- Backend API host not yet provided — service is mock-first; switch to BaseService when API contract lands
- No workflow yet; if approval flow is needed later, invoke `sdcorejs-angular` (actions pack)

## Product traceability
- Ledger: `.sdcorejs/docs/product/2026-05-09-14-20-add-product-entity.md`
- Status: partial - backend API host is still open

## Next suggested action
- Run `npm run test -- --watch=false --include=src/libs/catalog/features/product/**/*.spec.ts`
- Open `http://localhost:4200/catalog/product` to verify list renders
- Optional: invoke `sdcorejs-test` to add happy-path E2E coverage

## Skill provenance
Skills invoked this session: `sdcorejs-brainstorming` -> `sdcorejs-spec` -> `sdcorejs-plan` -> `sdcorejs-execute-plan` -> `write-code` (init-entity pack)
```

## Rules

### MUST DO
- Resolve `TARGET_ROOT` via `git rev-parse --show-toplevel` from the user's CWD; never write to the agent repo
- Create the `.sdcorejs/docs/<track>/` folder if it doesn't exist (leading dot is required)
- Use timestamp prefix `YYYY-MM-DD-HH-mm-` so files sort chronologically
- Always create a NEW file — never overwrite an existing one
- Include the file list with CREATE/EDIT markers
- Capture decisions and trade-offs that future sessions would not infer from the code alone
- Link the related `.sdcorejs/docs/product/` ledger when one exists or was created for the feature
- Note open questions / follow-ups so the next session knows what's incomplete
- At session start, read the 3 latest docs and acknowledge in ≤1 sentence so the user knows context was loaded
- Pair with `sdcorejs-explore (memories mode)`: auto-docs captures session-scoped facts; memories mode captures durable knowledge that survives across sessions

### MUST NOT
- Write a doc to the `sdcorejs-agent` repo (the agent repo is the source for skills, not session memory)
- Write to `docs/sdcorejs/` or `.docs/sdcorejs/` (legacy paths) — the canonical location is `.sdcorejs/docs/`
- Overwrite an existing doc — collisions are impossible if the timestamp includes minutes; if collision still happens (rapid-fire), append `-2`, `-3` suffix
- Write empty / template-only docs — if nothing was done, skip
- Write docs in a language different from the user's session language; for mixed-language sessions, match the dominant language
- Skip the session-start read step — that's how memory works
- Leak secrets, tokens, or full file contents into the doc (file paths + summaries only)

## Cross-track usage

This skill applies to `angular`, `nestjs`, `nextjs`, and `test` tracks. The only difference is the `<track>` segment in the output path:
- Angular: `.sdcorejs/docs/angular/`
- NestJS: `.sdcorejs/docs/nestjs/`
- NextJS: `.sdcorejs/docs/nextjs/`
- Test: `.sdcorejs/docs/test/`

The product track writes PO-facing ledgers under `.sdcorejs/docs/product/` through `sdcorejs-product`. Use auto-docs for session summaries; use product ledgers for feature traceability.

When the agent works inside a multi-track repo, write to the track folder
matching the work performed. If unsure, ask the user before writing using
`_refs/shared/user-choice-prompt.md` with numbered candidate tracks and aliases.

## Anti-patterns
- Writing the doc to the agent repo (`sdcorejs-agent/.sdcorejs/...`) instead of the target project
- Writing to `docs/sdcorejs/` or `.docs/sdcorejs/` (legacy paths) — canonical is `.sdcorejs/docs/`
- Overwriting yesterday's doc with today's — destroys the history that makes this skill valuable
- Empty doc with only a title (no info to recall later)
- Doc that lists every file change with no decisions/rationale (the diff already exists in git)
- Skipping session-start read because "user didn't ask for it" — this is mandatory automatic behavior
- Dumping full file contents into the doc — keep it scannable (file path + 1-line intent)
- Forgetting to set `<track>` correctly in multi-track repos
- Hardcoding `angular` when the active track is actually nestjs/nextjs/test
- Treating auto-docs as a substitute for the product traceability ledger
