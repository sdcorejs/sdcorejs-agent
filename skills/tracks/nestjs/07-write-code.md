---
name: nestjs-write-code
description: Use AFTER `sdcorejs-review-plan` has approved a NestJS plan, when the user is ready to generate backend code. SCAFFOLD STATUS — the dedicated sub-skills (10-init-project, 11-init-module, 12-init-entity, 20-controller, 21-service, 22-repository) are planned but not yet implemented. Until they ship, this orchestrator walks the approved plan task-by-task manually using Read/Write/Edit and the conventions from `_refs/sdlc/nestjs.md` (be-masterdata baseline). After completion, mandatory hand-off chain - skills/testing/e2e/nestjs.md → sdcorejs-review-code → orchestration/repair-loop → orchestration/comment-code → orchestration/verify-before-done → orchestration/auto-docs → orchestration/auto-task-tracker → orchestration/memories (when applicable). Triggers - "generate nestjs code", "viết code backend", "sinh code nestjs", "go ahead" (after a nestjs plan was approved), "proceed with backend implementation". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# 07 — Write Code (NestJS Orchestrator — Scaffold)

## Purpose
Execute the approved NestJS plan task-by-task. This skill is the temporary bridge until the dedicated sub-skills (`10-init-project`, `11-init-module`, `12-init-entity`, etc.) are implemented. It does NOT generate code itself in batch — it walks each numbered plan task, applies the change, runs the right verification, and only then moves to the next task.

## When to use
- After `sdcorejs-review-plan` has confirmed approval of a NestJS plan
- The user has said "OK", "duyệt", "go ahead", or equivalent
- `orchestration/auto-plans` has snapshotted the approved plan

If no approved plan exists, route back to `sdcorejs-write-plan` / `sdcorejs-review-plan`.

## Process

### Step 0 — Pre-flight: ensure project summary
Before loading the plan, run `orchestration/auto-summary`. If `<target>/.sdcorejs/summary.md` is missing it MUST be generated first (auto-summary delegates the scan to `sdcorejs-code-map` and distills the brief) — this is the gate that keeps generation from inventing module/base-class paths or duplicating shared abstractions. If it exists, auto-summary reads it (refreshing on drift) so the plan walk slots into the real layout. Exception: a brand-new project init has nothing to summarize yet — auto-summary then runs in WRITE mode after the scaffold is created.

### Step 1 — Load the approved plan
Read the plan file under `.sdcorejs/plans/nestjs/<timestamp>-<topic>.md` (just snapshotted by `orchestration/auto-plans`).

### Step 2 — Load baseline conventions
Read `_refs/sdlc/nestjs.md` for:
- Path conventions (`src/modules/<module>/<sub-folder>/`)
- Required base classes (`BaseEntity`, `BaseRepository`, `BaseService`)
- Guard order (`AuthGuard` → `ZodValidationGuard` → `@HasPermission()`)
- Bilingual error message contract `{ vi, en }`
- Transaction style (QueryRunner manual)

If the target project has a `CLAUDE.md` / `AGENTS.md`, read it for project-specific overrides.

### Step 3 — Walk plan tasks one-by-one
For each numbered task in the plan, in order:

1. Mark the task as `in_progress` via `TodoWrite` so the user sees what's happening
2. Read all files the task references (existing entities, base classes, sibling modules)
3. **Invoke `sdcorejs-tdd`** — before writing any production code, write the failing test:
   - Unit test for service logic (business rules, validation, edge cases)
   - e2e spec for controller endpoints (HTTP verb + expected status + response shape)
   - Verify RED before touching production files
4. Apply the change:
   - CREATE → `Write` tool, using conventions from `_refs/sdlc/nestjs.md`
   - EDIT → `Read` then `Edit` tool
5. Verify GREEN — re-run the test(s) from step 3; confirm they pass before moving on
6. If the task closes a phase boundary in the plan (e.g. "end of module bootstrap"), run the verification command listed in the plan's Verification section
7. Mark task `completed` and move to next

### Step 4 — Apply mandatory baseline patterns

For every code-generating task, enforce:

- **Entities** extend `BaseEntity` (gives `id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedAt`)
- **Repositories** extend `BaseRepository<Entity>` from the shared package
- **Services** extend `BaseService<Entity>`; business logic lives here, NOT in the controller
- **Controllers** stay thin; guard order is `@UseGuards(AuthGuard, ZodValidationGuard)` THEN `@HasPermission('MODULE:ENTITY:ACTION')` per write endpoint
- **DTOs** are dedicated classes — entities are never serialized directly to HTTP
- **Zod schemas** live in `libs/shared/schemas/` (or the project's shared package path); used by both `ZodValidationGuard` AND OpenAPI generation
- **Error messages** return `{ vi: 'thông báo', en: 'message' }`; never single-language
- **Transactions** open a `QueryRunner` explicitly when ≥2 tables are written atomically
- **Migrations** in `src/migrations/<timestamp>-<topic>.ts`; both `up()` and `down()` complete, tested

### Step 5 — After all plan tasks complete

Hand off the mandatory tail-call chain in this order:

1. **`skills/testing/e2e/nestjs.md`** — write happy-path e2e tests via `supertest` against a real test PG via testcontainers (or `pg-mem` if simpler)
2. **`sdcorejs-review-code`** (auto-detects NestJS → loads `_refs/nestjs/review-code.md`) — convention review; outputs color-coded tables (🔴 Critical / 🟡 Medium / 🔵 Minor + 🟢 Strengths) with Fix + Tradeoff columns
3. **`orchestration/repair-loop`** — apply findings, iterate until Critical+Important resolved (or user defers)
4. **`orchestration/comment-code`** — ASK gate (skip / simple / medium / full). When `nestjs-write-comments` sub-skill ships, level=full delegates there; until then, the chosen level is applied inline by `orchestration/comment-code` itself
5. **`orchestration/verify-before-done`** — BLOCK "done" until every acceptance criterion in the spec is ✅ verified or ⚠️ explicitly deferred
6. **`orchestration/auto-docs`** — session summary at `<target>/.sdcorejs/docs/nestjs/`
7. **`orchestration/auto-task-tracker`** — tick `[x]` completed plan tasks, append new tasks from the doc's "Next suggested action" / "Open questions"
8. **`orchestration/memories`** — only if durable knowledge surfaced (recurring convention, stakeholder constraint, anti-pattern)

Each tail-call is mandatory. Do NOT skip `verify-before-done` — that's how acceptance criteria silently slip.

## Rules

### MUST DO
- Walk plan tasks in the order they're numbered — do not parallelize unless `orchestration/parallel-dispatch` approves (rare for backend work because most tasks share the DB / module state)
- Track every task via `TodoWrite` (in_progress / completed)
- Enforce baseline patterns from `_refs/sdlc/nestjs.md` on every generated file
- Run plan's verification command at every phase boundary, not just at the end
- Match the user's language (VI/EN) — for VI, all error messages, log messages, and code comments use proper diacritics
- Run the full tail-call chain after the last plan task

### MUST NOT
- Generate code outside the approved plan (no surprise utility files, no "while I'm at it")
- Skip the guard order — `AuthGuard` ALWAYS before `ZodValidationGuard` so unauth requests don't burn validator time
- Inline class-validator decorators — Zod is the validation contract in this baseline
- Return single-language error messages — always `{ vi, en }`
- Skip `verify-before-done` — even when tests pass, acceptance criteria are a separate check
- Pretend the planned sub-skills exist — they're planned; this orchestrator is the bridge until they ship

## Anti-patterns
- Generating an entity without a migration to match (orphan TypeORM model)
- Adding `@HasPermission()` on the controller class instead of per-endpoint (too coarse, breaks GET endpoints)
- Wrapping every method in `@Transaction()` — most reads don't need it; mark only multi-write methods
- Soft-deleted rows leaking into list endpoints — repository must filter `deletedAt IS NULL`
- Mock-only tests for endpoints with auth — at minimum, integration test must wire `AuthGuard`

## Related skills
- `_refs/sdlc/nestjs.md` — baseline conventions this skill enforces
- `sdcorejs-review-plan` — runs before; the approved plan is the input
- `orchestration/auto-plans` — has already snapshotted the plan to `.sdcorejs/plans/nestjs/`
- Tail-call chain — see Step 5 above
- (Planned) `nestjs-init-project`, `nestjs-init-module`, `nestjs-init-entity` — will replace the manual walk once implemented
