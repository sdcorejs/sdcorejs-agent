# NestJS Backend — SDLC Reference

This file is loaded by `skills/shared/sdlc/0[1-3]-*.md` when the detected track is `nestjs`.

**Status:** Track-specific orchestrator (`sdcorejs-nestjs`) is shipped — after `sdcorejs-plan` approves a plan, it dispatches the on-demand packs under `_refs/nestjs/write-code/` (`init-project` / `init-module` / `init-entity` / `actions`). This ref covers the **design phase** (brainstorming / spec / plan / execute-plan); the code-generation rules + templates live in those packs.

**Canonical core:** SDCoreJS NestJS backends are modular monoliths built on the **`@sdcorejs/nestjs`** core package (sub-path imports: `@sdcorejs/nestjs`, `/orm`, `/permission`, `/validation`, `/jwt`, `/context`, `/tenancy`, `/audit`, `/i18n`, …). The authoritative export inventory is [`_refs/nestjs/core-catalog.md`](../nestjs/core-catalog.md); the architecture WHY is [`_refs/nestjs/architecture-principles.md`](../nestjs/architecture-principles.md). Historical note: earlier drafts referenced a `be-masterdata` baseline; the canonical reference app today consumes `@sdcorejs/nestjs` and the conventions below are grounded on it.

---

## Brainstorm

### Approach palette
| Approach | Summary | Pros | Cons | Best when |
|---|---|---|---|---|
| **REST + TypeORM + Postgres** (default) | Standard CRUD via REST with TypeORM repositories | Familiar, easy to test with pg-mem, type-safe with Zod | More boilerplate per entity | Most business CRUD |
| **REST + raw SQL + Postgres** | Hand-written queries via QueryRunner | Maximum control, no ORM overhead | More risk (SQL injection, no type-safety), harder migrations | Performance-critical reads, reporting |
| **REST + external API proxy** | NestJS as facade for an upstream API | Auth + rate-limit + caching layer | No own DB; coupling to upstream | Aggregating multiple services |
| **Event-driven (Kafka / NATS / Bull)** | Producers + consumers + outbox table | Async, decoupled, retry-friendly | Operational complexity, ordering challenges | Workflow with side-effects, integrations |

### Transaction style
- **QueryRunner manual** (be-masterdata default) — explicit transaction control, fine for complex multi-table updates
- **TypeORM `@Transaction` decorator** — terser for single-method transactions
- **Saga / outbox pattern** — for event-driven flows that must guarantee write + publish

### Questions to seed
- "Persistence default TypeORM + Postgres — OK hay cần raw SQL / external API proxy?"
- "Bạn cần audit log (created_by/updated_by) + soft-delete trong toàn bộ entity?"
- "Có workflow approval / publish không, hay write-and-go?"
- "Permission model: per-endpoint via `@HasPermission()` hay role-based scope?"

---

## Brainstorming: required confirmations

### Minimum-required (blocking)
1. **Module name** (existing or new) — folder under `src/modules/<module>/`
2. **Entity name** (camelCase, e.g. `product`, `purchaseOrder`)
3. **Display label** (VI: full diacritics)
4. **Persistence**: TypeORM + Postgres (default) | raw SQL | external proxy | none (read-only)
5. **Transaction style**: queryRunner manual (default) | `@Transaction` | saga/outbox
6. **API style**: REST (default) | GraphQL (if used) | gRPC (if used)
7. **Permission scope**: per-endpoint `@HasPermission()` codes — canonical format **`<module>_<entity>:<action>`** (e.g. `crm_task:create`)
8. **Test coverage**: `minimal` | `standard` (default) | `full`
9. **Profile** — `simple` (default) | `enterprise`.
   - `simple`: single-tenant, flat Keycloak-role permissions, DTOs in `src/modules/<module>/dto/`, lib `WithAudit(BaseEntity)`, core `AuthGuard`. The non-tech default.
   - `enterprise`: multi-tenant (`tenantCode` + `departmentCode` scoping), page-permission matrix, `@shared` monorepo kernel, `AdminAuthGuard`, internal-secret module, `MASTER`/`TENANT_ADMIN` scopes. Pick when the app is genuinely multi-tenant / multi-service.

### Useful-optional (defaults safe)
- Audit columns (default: `createdAt`, `updatedAt`, `createdBy`, `updatedBy` from BaseEntity)
- Soft-delete (default: yes via BaseEntity `deletedAt`)
- Pagination (default: cursor + page-size, `Pagination` helper from shared package)
- Validation: Zod schemas (mandatory — no class-validator)
- Persistence: **schema-per-module Postgres** (one database, one schema per bounded-context module; the connection default schema is `core` for the lib's shared tables). `synchronize` in **dev** (TypeORM auto-creates tables; `ensureSchemas()` pre-creates the schemas), **migrations in prod** (`DB_SYNCHRONIZE=false`). Migration files in `src/migrations/`. **Plan 2 reconciliation:** `_refs/infra/backend.Dockerfile`'s start command runs `npm run typeorm migration:run` before `start:prod`, so `init-project` ships a `migration:run` script + an empty `src/migrations/` (a `migration:run` with zero migrations is a clean no-op exit 0, keeping the Docker chain safe) — see `_refs/nestjs/write-code/init-project.md` Step 8.
- Bilingual error messages (mandatory for VI projects — served via the i18n catalog `{ code, message }`)

### Question grouping (3-4 per turn)

**Block A — Identity & persistence**
1. Module name + entity name + display label
2. Persistence (default TypeORM + Postgres — OK?)
3. Audit + soft-delete (defaults yes — OK?)
4. Profile (simple default | enterprise — only ask a technical user; non-tech defaults to simple).

**Block B — Boundaries**
4. Transaction style (default queryRunner manual)
5. API style (default REST)
6. Permission codes (auto-derive from entity name if user skips)

**Block C — Tests**
7. Coverage level
8. Real Postgres via testcontainers vs pg-mem (default: pg-mem for integration, real PG for E2E)

### Summary template
```
## Đã chốt — sẵn sàng spec

| | |
|---|---|
| **Module** | <module> (existing | new) |
| **Entity** | <entityCamel> — "<Display Label VI>" |
| **Persistence** | TypeORM + Postgres |
| **Transactions** | queryRunner manual |
| **API style** | REST |
| **Permissions** | `<module>_<entity>:{list,create,update,delete}` (e.g. `crm_task:create`) |
| **Audit + soft-delete** | yes |
| **Profile** | <simple | enterprise> |
| **Tests** | <minimal | standard | full> |

→ Tiếp theo: `sdcorejs-spec` để mình draft spec + xin xác nhận trong cùng gate.
```

---

## Spec

### Path conventions (`@sdcorejs/nestjs` reference app)
- Module folder: `src/modules/<module>/`
- Sub-folders: `entities/`, `repositories/`, `services/`, `controllers/`, `dto/`, `schemas/` (Zod), `mappers/`
- Shared kernel (re-exports + base DTO, aliased `@shared`): `base/shared/`
- Migrations: `src/migrations/<timestamp>-<topic>.ts`
- Tests: alongside source, `.spec.ts` + `.e2e-spec.ts` suffixes; integration tests under `test/integration/`
- Generation rules + templates per concern: `_refs/nestjs/write-code/{init-project,init-module,init-entity,actions}.md`

### Architecture section emphasis
Capture:
- Entity inheritance from `BaseEntity` (gives audit + soft-delete + id)
- Repository inheritance from `BaseRepository<Entity>`; service from `BaseService<Entity>`
- Controller order: `@UseGuards(AuthGuard, ZodValidationGuard)` then `@HasPermission()` per endpoint
- Where business logic lives (services only; controllers stay thin)
- Zod schemas live in shared package — used by both validation (`ZodValidationGuard`) and OpenAPI
- Bilingual error messages return `{ vi, en }`
- Transactions: which methods open a `QueryRunner` and why

### Acceptance criteria examples
- [ ] `GET /<entity>` returns paginated list with audit fields exposed
- [ ] `POST /<entity>` validates via `ZodValidationGuard`, returns 400 with `{ vi, en }` on invalid payload
- [ ] `POST /<entity>` requires permission `<module>_<entity>:create` (e.g. `crm_task:create`), returns 403 otherwise
- [ ] Multi-table updates roll back atomically if any row fails (QueryRunner test)
- [ ] Soft-delete sets `deletedAt`; subsequent GET excludes the row
- [ ] All endpoints return JSON in the standard `{ data, error }` envelope
- [ ] Migration `<timestamp>-<topic>.ts` applies cleanly and `down()` rolls back without orphaned data
- [ ] E2E test covers the full request lifecycle via supertest against a real test PG

---

## Plan

### Phase grouping
1. **Schema** (if new entity): Zod schema in shared package + migration file
2. **Entity**: TypeORM entity class extending `BaseEntity`
3. **Repository**: extends `BaseRepository`, custom queries
4. **Service**: business logic, transactions, calls repository
5. **Controller**: REST endpoints with `@UseGuards(AuthGuard, ZodValidationGuard)` + `@HasPermission()`
6. **DTO + mapper**: response DTOs + entity↔DTO mapping
7. **Tests** (matching coverage level):
   - unit: service logic with mocked repository (`sdcorejs-test`)
   - integration: real DI + pg-mem (`sdcorejs-test`)
   - e2e: real HTTP + real PG via testcontainers (`sdcorejs-test`)

### Verification commands
```bash
npm install
npm run build
npm run typeorm migration:run                                                                                          # apply latest migration
npm run test                                                                                                           # unit + integration
npm run test:e2e                                                                                                       # supertest against running app
npm run lint
# Smoke: curl http://localhost:3000/<entity> | jq
```

### Final-step expectations
Until the `sdcorejs-nestjs` orchestrator ships, the last plan step should call out the manual tail-call sequence:
1. `sdcorejs-test` — write e2e tests for happy path
2. `sdcorejs-review` — convention review
3. `sdcorejs-repair-loop` — apply review findings
4. `sdcorejs-comment-code` — apply the finish-gate comment level using `_refs/orchestration/tail/comment-code.md`
5. `sdcorejs-ship (verify-before-done mode)` — acceptance criteria gate
6. `sdcorejs-ship (branch-ready mode)` — branch-hygiene sweep (debug logs, secrets, focused tests, lint+build+test) before docs
7. `_refs/orchestration/tail/auto-docs.md` — session summary to `.sdcorejs/docs/nestjs/`
8. `_refs/orchestration/tail/auto-task-tracker.md` — tick / append tasks
9. `sdcorejs-explore (memories mode)` — durable knowledge if applicable

Once the orchestrator ships, the plan can simply reference `sdcorejs-nestjs` and the tail-call chain is owned there.

---

## Resolved (track shipped)
- **Shared kernel location:** `base/shared/` (aliased `@shared`), re-exporting the lib response/paging surface + a base DTO. Per-module Zod schemas live in `src/modules/<module>/schemas/`. See `_refs/nestjs/write-code/init-project.md` Step 7.
- **Permission code convention:** flat `<module>_<entity>:<action>` (e.g. `crm_task:create`) — see `_refs/nestjs/architecture-principles.md` §11.
- **Orchestrator layout:** `sdcorejs-nestjs` dispatches four on-demand packs (`init-project` / `init-module` / `init-entity` / `actions`), not the old 10/11/12/20/21/22 sub-skills.

## Open questions for this track
- Default cursor-pagination shape (offset+limit vs id-cursor) — confirm per project before a plan locks it in.
