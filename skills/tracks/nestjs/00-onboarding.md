---
name: nestjs-onboarding
description: Use when the user opens this agent inside a NestJS backend project for the first time, asks "what can you do for my backend", "how do I start a nestjs module", "list skills cho nestjs", "agent này làm được gì cho be", or seems unsure which skill to invoke. Provides an overview of the NestJS SDLC flow (using shared cross-track design-phase skills + per-track review/test), links to the WHY-rules in `_refs/nestjs/architecture-principles.md`, notes which orchestrator pieces are planned vs available, and routes the user to the next concrete step (usually `sdcorejs-clarify-requirements` or `sdcorejs-brainstorm`). Bilingual (VI/EN).
allowed-tools: Read, Glob, Grep
---

# Onboarding — NestJS Backend (Planned Pipeline)

## Purpose
Welcome the developer inside a NestJS project. This track is in **scaffold status** — the cross-track design pipeline works end-to-end, the review/test skills work, but the code-writing orchestrator (`nestjs-write-code`) and its sub-skills (`10-init-project`, `11-init-module`, `12-init-entity`) are not yet implemented. Until those land, code generation happens manually with the agent following the approved plan task-by-task.

## When to use
- User opens agent inside a project where `nest-cli.json` exists OR `package.json` has `@nestjs/core`
- User asks "what can you do for my backend / nestjs project"
- User says "tạo module backend", "thêm entity nestjs", "build user module"
- User is unsure where to start

## What's available today

### ✅ Working end-to-end
- `sdcorejs-brainstorm` (cross-track) — explore approaches before scope is fixed
- `sdcorejs-clarify-requirements` (cross-track) — block on minimum-required answers
- `sdcorejs-write-spec` (cross-track) — author spec at `.sdcorejs/docs/nestjs/`
- `sdcorejs-review-spec` (cross-track) — user approval gate + `orchestration/auto-specs`
- `sdcorejs-write-plan` (cross-track) — numbered plan
- `sdcorejs-review-plan` (cross-track) — user approval gate + `orchestration/auto-plans`
- `sdcorejs-review-code` — convention review (auto-detects NestJS)
- `skills/review/performance/nestjs.md` — performance audit
- `skills/review/security/nestjs.md` — security audit
- `skills/testing/unit/nestjs.md` — unit tests with mocked dependencies
- `skills/testing/integration/nestjs.md` — pg-mem + real DI
- `skills/testing/e2e/nestjs.md` — supertest + testcontainers Postgres
- `orchestration/auto-summary` — canonical `.sdcorejs/summary.md` project brief; generated (via `code-map`) before code-writing if missing, read at session start
- All cross-track orchestration (`auto-docs`, `repair-loop`, `verify-before-done`, etc.)

### 🚧 Planned (not yet implemented)
- `nestjs-write-code` (orchestrator) — would dispatch sub-skills below
- `nestjs-init-project` (10) — bootstrap repo with be-masterdata baseline
- `nestjs-init-module` (11) — scaffold `src/modules/<module>/` with controllers + services + repositories
- `nestjs-init-entity` (12) — full vertical slice (entity + repository + service + controller + DTO + Zod schema + migration)
- `nestjs-controller-refine` (20) — refine controller endpoints + guards + permissions
- `nestjs-service-logic` (21) — service-layer business logic + transactions
- `nestjs-workflow-actions` (31) — approval / publish workflows via state machine

See `_refs/sdlc/nestjs.md` "Open questions" for the design calls still to be made.

## Suggested first step

Run `sdcorejs-brainstorm` if the user has an open-ended idea ("I want to track promotions in our backend").

Run `sdcorejs-clarify-requirements` if the user already knows what they want ("create promotion module with CRUD endpoints").

## After plan approval — manual code walk

Until `nestjs-write-code` ships, after `sdcorejs-review-plan` approves a plan, the agent walks the plan task-by-task manually:

```
For each numbered task in the approved plan:
  1. Read referenced files (existing entities, services, conventions from baseline)
  2. Apply the change via Write / Edit
  3. Run `npm run build` after each phase boundary
  4. Run `npm run test` after each module's tests phase

Then mandatory tail-call chain:
  1. `skills/testing/e2e/nestjs.md` — write happy-path e2e
  2. `sdcorejs-review-code` — convention review
  3. `orchestration/repair-loop` — apply review findings
  4. `orchestration/comment-code` — ASK gate
  5. `orchestration/verify-before-done` — acceptance criteria gate
  6. `orchestration/auto-docs` — session summary
  7. `orchestration/auto-task-tracker` — tick / append
  8. `orchestration/memories` — durable knowledge (when applicable)
```

The agent should track progress via `TodoWrite` so the user can see which numbered task is in progress.

## Output to user (sample)

```
Đây là project NestJS (phát hiện `nest-cli.json` + `@nestjs/core`).

Track này hiện đang ở trạng thái **scaffold**:
- ✅ Design phase (brainstorm → clarify → write-spec → plan + reviews) đầy đủ qua shared/sdlc
- ✅ Code review, security, performance, testing (unit / integration / e2e) đầy đủ
- 🚧 Code-writing orchestrator (`nestjs-write-code`) chưa có — sau khi plan được duyệt, mình sẽ làm tay theo từng task trong plan

Bạn muốn bắt đầu từ đâu?
- **"Brainstorm"** nếu chưa rõ hướng đi (mình sẽ chạy `sdcorejs-brainstorm`)
- **"Tạo module/entity X"** nếu đã biết — mình chạy `sdcorejs-clarify-requirements`
- **"Review code"** nếu muốn audit code hiện có — mình chạy `sdcorejs-review-code`
- **"Tiếp tục công việc"** nếu đang dở — mình chạy `sdcorejs-recovery`
```

(EN equivalent if the user's session language is English.)

## Rules

### MUST DO
- Be explicit that the pipeline is in **scaffold status** for code generation
- Always point to the working cross-track pieces (design phase, review, testing)
- Route to the right next skill based on the user's intent signal
- Match the user's session language

### MUST NOT
- Promise sub-skills that don't exist yet (`nestjs-write-code`, `12-init-entity` — they're planned)
- Auto-generate code without an approved plan; the manual code walk only kicks in AFTER `sdcorejs-review-plan` approves
- Pretend the cross-track design skills are NestJS-specific — they share workflow, only the `_refs/sdlc/nestjs.md` is track-specific
