---
name: nestjs-write-code
description: Generate NestJS modular-monolith backend code on the @sdcorejs/nestjs core — after sdcorejs-review-plan approves, OR as the single entry point for any direct backend code-gen request. Loads the matching on-demand pack under _refs/nestjs/write-code/ (per-pack trigger catalog in the body): init-project (scaffold app), init-module (bounded-context module), init-entity (full CRUD stack: entity/repository/service/controller/schema/DTO), actions (custom / non-CRUD endpoints — domain methods, cross-module, workflow, bulk, export). Triggers - "scaffold nestjs / init backend", "add module", "add entity / create CRUD", "add endpoint / custom action / workflow / bulk / export", plus generic "generate backend code", "write backend", "go ahead" (after a nestjs plan was approved). NOT for spec/plan, code review, or angular/nextjs code (separate skills). After completion runs the mandatory tail chain (sdcorejs-test → sdcorejs-review → repair-loop → comment-code → verify-before-done → branch-ready → auto-docs → auto-task-tracker → memories). Applies to nestjs. Bilingual (runtime: respond in the user's language).
allowed-tools: Read, Write, Edit, Bash, Glob
---

# 07 — Write Code (NestJS Orchestrator)

## Purpose

Single entry point for generating NestJS **modular-monolith** backend code on the `@sdcorejs/nestjs` core. Transforms an approved plan + the user's confirmed scope into runnable backend code:
- App scaffold (one NestJS app, one Postgres, schema-per-module, `SdCoreModule.forRoot` kernel)
- Bounded-context modules (`src/modules/<module>/`)
- Full CRUD entity stacks (entity / repository / service / controller / Zod schema / DTO)
- Custom / non-CRUD endpoints (domain methods, cross-module access, workflow transitions, bulk operations, Excel export)

This skill is an **orchestrator**: it does NOT inline the full generation rules for every concern. It picks the right **reference pack** for each scope item and reads it on demand. The detailed rules + code templates for each concern live in `_refs/nestjs/write-code/*.md`.

## Step 0 — Persona

Read `<target>/.sdcorejs/persona.md` (project-local persona, if present) and `_refs/shared/persona.md` to detect technical vs non-technical framing. For a **non-technical** persona, open each pack in plain language before generating (each pack carries its own "Persona Step 0" narration). For a **technical** persona, skip the narration and generate directly. Either way, respond in the user's language at runtime.

## Step 0.1 — Pre-flight: ensure project summary

Before dispatching ANY reference, run `orchestration/auto-summary`. If `<target>/.sdcorejs/summary.md` is missing it MUST be generated first (auto-summary delegates the scan to `sdcorejs-code-map` and distills the brief) — this is the gate that keeps generation from inventing module / base-class paths or duplicating shared abstractions. If it exists, auto-summary reads it (refreshing on drift) so dispatch slots into the real layout. Exception: when this run is itself a brand-new `init-project`, there is no project to summarize yet — auto-summary runs in WRITE mode at the END of init instead (see `init-project.md` Step 10).

After ensuring the summary exists, READ the **`profile`** field from `<target>/.sdcorejs/summary.md` (default `simple` if absent). Pass the resolved profile into EVERY dispatched pack (`init-project` / `init-module` / `init-entity` / `actions`) — each pack emits only that profile's templates (see each pack's 'Profile (read FIRST)' section).

## Reference — read the core catalog FIRST

Before generating any backend code, read [`_refs/nestjs/core-catalog.md`](_refs/nestjs/core-catalog.md). It is the authoritative inventory of the `@sdcorejs/nestjs` core package — the import sub-paths (`@sdcorejs/nestjs`, `/orm`, `/permission`, `/validation`, `/jwt`, `/context`, `/tenancy`, `/audit`, `/i18n`, …), the building blocks (`BaseEntity` + `WithAudit` / `WithTimestamps` mixins, `BaseRepository`, `BaseService`, `BaseController`, `AuthGuard`, `@HasPermission`, `ZodValidationGuard`, `SdCoreModule.forRoot`, `ApiResponse` / `apiError`), and the version pin. **Every import in the packs MUST match a sub-path the catalog documents — do not invent imports.** The architecture WHY behind these choices lives in [`_refs/nestjs/architecture-principles.md`](_refs/nestjs/architecture-principles.md).

## Per-pack trigger catalog (dispatch table)

For each scope item in the confirmed plan (or the direct request), match it to a pack, READ that pack under `_refs/nestjs/write-code/`, and follow it. Load ON DEMAND only — read the one pack for the step you are executing, not all four.

| Request / scope item | Pack to read |
|---|---|
| Scaffold a fresh backend — "khởi tạo backend / init backend", "bootstrap a modular-monolith API on @sdcorejs/nestjs", "set up the NestJS project skeleton" (no existing project yet) | [`_refs/nestjs/write-code/init-project.md`](_refs/nestjs/write-code/init-project.md) (run FIRST before any module/entity work) |
| Always — the admin module (authn/authz authority): users/roles/permissions [+tenant/department enterprise] | [`_refs/nestjs/write-code/init-admin.md`](_refs/nestjs/write-code/init-admin.md) (ALWAYS run, right after init-project) |
| Add a bounded-context module — "tạo module X / add a domain module", "scaffold the crm / masterdata / billing module", "set up a new module before adding entities" | [`_refs/nestjs/write-code/init-module.md`](_refs/nestjs/write-code/init-module.md) |
| Add a full CRUD entity — "thêm entity X / tạo CRUD cho X", "scaffold the task / customer / invoice entity with full CRUD", "add an entity + repository, service, controller, validation" (entity / repository / service / controller / schema / DTO) | [`_refs/nestjs/write-code/init-entity.md`](_refs/nestjs/write-code/init-entity.md) |
| Custom / non-CRUD endpoints — "thêm action / nút approve / chuyển trạng thái" (workflow), "màn của tôi / việc của team" (caller-scoped), "xuất Excel / export báo cáo", "import / bulk create / xóa nhiều", any domain method or cross-module access on top of an existing entity stack | [`_refs/nestjs/write-code/actions.md`](_refs/nestjs/write-code/actions.md) |

Each pack further links the literal code templates / snippets it renders. For a brand-new backend, the natural sequence is **init-project → admin → init-module → init-entity → actions**.

## Execution order + subagent fan-out

Execution order: **project → admin → module → entity → actions**. `init-admin` ALWAYS runs right after `init-project` and BEFORE any `init-module` / `init-entity` — it owns the project's `IPermissionStrategy` + user-lookup `JwtStrategy`, so domain modules' `@HasPermission` resolve against it. If the plan touches multiple items, run them in this order. Most backend work shares DB / module state, so the default is sequential — do NOT parallelize entity stacks that touch the same module wiring.

**Subagent-driven fan-out (when 3+ independent units):** if the plan adds 3 or more *independent* units that do NOT share mutable state — e.g. several entities in DIFFERENT modules, or several self-contained custom actions with no shared files — dispatch them via `orchestration/parallel-dispatch` / `sdcorejs-subagent-driven-dev` so each unit is generated + reviewed in its own subagent. Units that append to the same `<module>.module.ts` barrels or the same `MODULE_SCHEMAS` / `RouterModule.register` arrays are NOT independent — keep those sequential.

## TDD gate — mandatory before each code-generating step

Before writing any production file (entity / repository / service / controller), invoke `sdcorejs-tdd`:
1. Write the failing test first (unit test for service logic / business rules; e2e spec for controller endpoints — HTTP verb + expected status + response shape) → run → confirm RED.
2. Generate the production file with minimal passing code → run → confirm GREEN.
3. Refactor if needed → run → confirm still GREEN.

Skip only for pure config (`nest-cli.json`, `tsconfig.json`, `.env.example`) and the `RouterModule.register` / `MODULE_SCHEMAS` registrations (framework wiring, no business behaviour).

## Mandatory tail chain

After all referenced steps finish, hand off in this exact order. Each tail-call is mandatory (per CLAUDE.md).

1. `sdcorejs-test` — happy-path tests for what was generated (unit + integration via real DI + pg-mem; e2e via `supertest` against a real test PG where the layer warrants it)
2. `sdcorejs-review` (auto-detects NestJS → loads `_refs/nestjs/review-code.md`) — convention review; outputs color-coded tables (🔴 Critical / 🟡 Important / 🔵 Minor + 🟢 Strengths) with Fix + Tradeoff columns
3. `orchestration/repair-loop` — apply findings, iterate until Critical+Important resolved (or user defers)
4. `orchestration/comment-code` — ASK gate (skip / simple / medium / full); applies the chosen level inline
5. `orchestration/verify-before-done` — BLOCK "done" until every acceptance criterion in the spec is ✅ verified or ⚠️ explicitly deferred
6. `orchestration/branch-ready` — branch-hygiene sweep (debug logs, secrets, focused tests, lint+build+test) + merge/PR options
7. `orchestration/auto-docs` — session summary written to `<target>/.sdcorejs/docs/nestjs/`
8. `orchestration/auto-task-tracker` — tick `[x]` completed tasks, append new ones from the doc's "Next suggested action" / "Open questions"
9. `orchestration/memories` — only if durable knowledge surfaced (recurring convention, stakeholder constraint, anti-pattern)

Do NOT skip `verify-before-done` — that's how acceptance criteria silently slip. Do NOT skip the `orchestration/comment-code` ASK gate (the gate IS the value; auto-defaulting defeats the design).

## When to use

- After `sdcorejs-review-plan` confirmed approval of a NestJS plan (user said "OK", "duyệt", "go ahead", or equivalent, and `orchestration/auto-plans` has snapshotted it).
- OR as the single entry point for any direct backend code-gen request matching the dispatch table above.

If no approved plan exists and the request is non-trivial, route back to `sdcorejs-write-plan` / `sdcorejs-review-plan` first. NOT for spec/plan authoring, code review, or angular/nextjs code (those are separate skills).

## Critical write-target rule

**All generated files are written to the TARGET backend project**, NEVER into this agent repo (`sdcorejs-agent`). The packs are the source of truth — render them into the user's chosen project directory.

## Rules

### MUST DO
- Every generated backend includes the `admin` module (`init-admin`) — the authn/authz authority. Run it right after `init-project`, before domain modules. Account ops proxy the Keycloak Admin API; permissions are app-DB role→code (NOT realm roles).
- Read `_refs/nestjs/core-catalog.md` before generating; every import must match a documented sub-path.
- Dispatch the matching pack on demand; follow it instead of re-deriving rules here.
- Enforce the architecture principles (`_refs/nestjs/architecture-principles.md`) on every generated file: `WithAudit(BaseEntity)` base, `BaseRepository` / `BaseService` / `BaseController` inheritance, guard order `@UseGuards(AuthGuard, ZodValidationGuard(schema))` + per-route `@HasPermission`, Zod-not-class-validator, explicit `QueryRunner` for multi-table writes, soft-delete by default, bilingual error envelope via the i18n catalog.
- Resolve the `profile` (`simple` default | `enterprise`) once from `.sdcorejs/summary.md` and emit it CONSISTENTLY across every pack in the project — never mix profiles within one backend.
- Match the user's language at runtime (VI/EN); for VI, all error messages, log messages, and comments use proper diacritics.
- Run the full tail chain after the last step.

### MUST NOT
- Generate code outside the approved plan (no surprise utility files).
- Invent imports the core catalog does not document.
- Inline `class-validator` decorators — Zod is the validation contract.
- Return single-language error messages — go through the i18n catalog (`{ code, message }`).
- Skip the guard order (`AuthGuard` before `ZodValidationGuard`).
- Skip `verify-before-done` — even when tests pass, acceptance criteria are a separate check.

## Related references
- `_refs/nestjs/core-catalog.md` — `@sdcorejs/nestjs` core API inventory (read FIRST)
- `_refs/nestjs/write-code/{init-project,init-admin,init-module,init-entity,actions}.md` — the on-demand packs
- `_refs/nestjs/architecture-principles.md` — the WHY behind the conventions
- `_refs/sdlc/nestjs.md` — design-phase (brainstorm/clarify/spec/plan) patterns
- `sdcorejs-review-plan` — runs before; the approved plan is the input
- Tail chain — see "Mandatory tail chain" above
