---
name: sdcorejs-execute-plan
description: Execute an approved plan snapshot. Use after sdcorejs-plan approval or when the user asks to execute, run, generate from, or continue an approved plan. Detects angular/nestjs/nextjs/product/design/test/generic executor, asks sequential vs parallel, handles isolation when needed, and invokes parallel-dispatch when approved. Runtime-localized.
allowed-tools: Read, Edit, Glob, Grep, Bash, Agent, TodoWrite
---

# 04 - Execute Plan


## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.

## Purpose
Run the approved plan as the execution contract. This skill is the handoff between planning and doing.

It owns three decisions:

1. Which execution track should run.
2. Whether the user wants sequential or parallel execution.
3. Whether to use a track orchestrator or the generic harness fallback.

## Preconditions
- `sdcorejs-plan` has explicit user approval.
- `sdcorejs-plan` has written the approved plan snapshot.
- The approved plan is available as a path or in context.

If the plan is missing or unapproved, route back to `sdcorejs-plan`.

## Step 0 - Context preflight

Before loading the plan or dispatching any executor, run `sdcorejs-explore
(summary mode)` through `_refs/shared/project-context.md`.

- If the target root already exists and `<target>/.sdcorejs/summary.md` is
  missing, generate it first so track detection uses the real project map.
- If the summary exists, read it and refresh on drift before choosing the
  executor.
- If the approved plan creates a brand-new target root that does not exist yet,
  record this exception and require the owning executor to run
  `sdcorejs-explore (summary mode)` immediately after the first scaffold lands.
- Treat the approved plan and current evidence as stronger than stored context
  when they conflict.

## Process

### 1. Load the approved plan
Read the plan from `.sdcorejs/plans/<track>/` or the plan path supplied by `sdcorejs-plan`.

Extract:

- Scope and acceptance criteria.
- Task list and phase order.
- File paths and commands.
- Coverage approach.
- Any declared parallel candidates.
- Solution-root layout when present (`product/`, `design/`, `backend/`, `frontend/`, `test/`, `.sdcorejs/`).

### 2. Detect execution track
Prefer explicit track metadata in the plan. Otherwise infer from project signals and paths:

| Track | Signals | Executor |
|---|---|---|
| angular | `angular.json`, `@angular/core`, `src/libs/**`, components, routes, Core UI | `sdcorejs-angular` |
| nestjs | `nest-cli.json`, `@nestjs/core`, controllers, services, DTOs, modules | `sdcorejs-nestjs` |
| nextjs | `next.config.*`, `app/**`, `pages/**`, SEO/OG/contact/i18n/caching tasks | `sdcorejs-nextjs` |
| product | product docs, PO docs, user stories, acceptance criteria, UAT, traceability matrix, requirement/implementation/test gap review | `sdcorejs-product` |
| design | design docs, wireframes, mockups, UI/UX, screen flow, PNG previews, FE handoff, story-to-screen mapping | `sdcorejs-design` |
| test | test-only plan, `*.spec.*`, e2e, Playwright/Cypress/Robot/Jest, inspector export | `sdcorejs-test` |
| generic | unsupported stack, docs/scripts/config changes, mixed non-track work | generic harness fallback |

For mixed full-stack plans, classify as role-split and prepare to invoke `sdcorejs-parallel-dispatch`. If the plan came from `sdcorejs-solution-builder`, preserve the solution-root contract: product docs in `product/`, design handoff in `design/`, backend in `backend/`, frontend in `frontend/`, cross-stack tests in `test/`, and traceability/evidence in `.sdcorejs/`.

### 3. Always ask parallel vs sequential
Before any code/test generation, ask the user:

```text
Execution mode?
- Sequential: safer, easier to review, best for shared files or dependent steps.
- Parallel: faster when tasks are independent; I will use the parallel-dispatch gate first.

Recommendation: <sequential|parallel> because <reason>.
Choose sequential or parallel.
```

Translate at runtime. Do not execute until the user answers. If the user says "you decide", choose the recommendation and state it.

### 4. If parallel is chosen
Invoke `sdcorejs-parallel-dispatch`. It owns both the safety verdict and the safe parallel execution path.

- If verdict is `PARALLEL-CANDIDATE`, it runs independent-unit fan-out.
- If verdict is `ROLE-SPLIT`, it runs the product/design/backend/frontend/test-QC role-split loop.
- If verdict is `SEQUENTIAL`, explain why parallel is unsafe and ask whether to continue sequentially.

### 5. If sequential is chosen
If the user requested isolation, or the plan is risky enough that isolation is
needed, invoke `sdcorejs-git (workspace mode)` before dispatching. That
mode reads `_refs/orchestration/workspace-isolation.md` and reports the baseline.

Dispatch by detected track:

- angular -> `sdcorejs-angular`
- nestjs -> `sdcorejs-nestjs`
- nextjs -> `sdcorejs-nextjs`
- product -> `sdcorejs-product`
- design -> `sdcorejs-design`
- test -> `sdcorejs-test`
- generic -> run the harness fallback below

Pass the approved plan as the contract. The executor must not add scope without returning to `sdcorejs-plan`.

### 6. Generic harness fallback
Use the generic harness when no track-specific orchestrator matches.

1. Create a progress checklist with one item per approved task plus finishing steps.
2. Execute tasks in the approved order using the normal editing and shell tools.
3. Keep edits inside the approved paths/commands.
4. Run every verification command from the plan.
5. If code changed, present the standard finish gate, then run the mandatory tail chain.
6. If only docs/config changed, still run the verification and report evidence.

The harness is intentionally conservative. If a task needs a domain-specific pattern not captured in the plan, stop and return to `sdcorejs-plan`.

## Rules

### Must do
- Never execute without an approved plan snapshot.
- Always ask sequential vs parallel before execution.
- Use `sdcorejs-product` as the executor for product-track ledgers and traceability audits.
- Use `sdcorejs-design` as the executor for design-track FE handoff artifacts.
- Use `sdcorejs-test` as the executor for test-track plans.
- Use the generic harness fallback when no track matches.
- Verify success from real command output before claiming anything passed.
- Keep the user's language in status and summaries.

### Must not
- Dispatch a track orchestrator before the parallel question is answered.
- Parallelize shared-file or dependent steps just because it looks faster.
- Let a subagent change the approved plan.
- Hide a `SEQUENTIAL` verdict after the user asked for parallel.
- Skip finish-gate and mandatory tail steps after code generation.

## Cross-references
- `sdcorejs-plan` - approved execution contract
- `sdcorejs-parallel-dispatch` - decides whether parallel is safe and executes safe fan-out or role-split work
- `sdcorejs-git (workspace mode)` - isolates work when requested or needed
- `sdcorejs-angular`, `sdcorejs-nestjs`, `sdcorejs-nextjs`, `sdcorejs-product`, `sdcorejs-design`, `sdcorejs-test` - track executors
- `sdcorejs-ship (verify-before-done mode)` - acceptance verification gate
