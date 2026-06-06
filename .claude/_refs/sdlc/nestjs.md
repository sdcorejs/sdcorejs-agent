# NestJS Backend — SDLC Reference

This file is loaded by `skills/shared/sdlc/0[1-6]-*.md` when the detected track is `nestjs`.

**Status:** Track-specific orchestrator (`write-code` for NestJS) is planned, not yet shipped. Cross-track SDLC skills work today — they will dispatch to the future `nestjs-write-code` orchestrator once it lands. Until then, after `sdcorejs-review-plan` approves a plan, dispatch is a manual sub-skill walk through `sdcorejs-review` + `skills/testing/*/nestjs.md`.

This ref captures the conventions from the `be-masterdata` baseline.

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

### Clarifying questions to seed
- "Persistence default TypeORM + Postgres — OK hay cần raw SQL / external API proxy?"
- "Bạn cần audit log (created_by/updated_by) + soft-delete trong toàn bộ entity?"
- "Có workflow approval / publish không, hay write-and-go?"
- "Permission model: per-endpoint via `@HasPermission()` hay role-based scope?"

---

## Clarify

### Minimum-required (blocking)
1. **Module name** (existing or new) — folder under `src/modules/<module>/`
2. **Entity name** (camelCase, e.g. `product`, `purchaseOrder`)
3. **Display label** (VI: full diacritics)
4. **Persistence**: TypeORM + Postgres (default) | raw SQL | external proxy | none (read-only)
5. **Transaction style**: queryRunner manual (default) | `@Transaction` | saga/outbox
6. **API style**: REST (default) | GraphQL (if used) | gRPC (if used)
7. **Permission scope**: per-endpoint `@HasPermission()` codes
8. **Test coverage**: `minimal` | `standard` (default) | `full`

### Useful-optional (defaults safe)
- Audit columns (default: `createdAt`, `updatedAt`, `createdBy`, `updatedBy` from BaseEntity)
- Soft-delete (default: yes via BaseEntity `deletedAt`)
- Pagination (default: cursor + page-size, `Pagination` helper from shared package)
- Validation: Zod schemas in shared package (mandatory — no class-validator)
- Migration strategy: TypeORM migration files in `src/migrations/`
- Bilingual error messages (mandatory for VI projects — return `{ vi: '...', en: '...' }`)

### Question grouping (3-4 per turn)

**Block A — Identity & persistence**
1. Module name + entity name + display label
2. Persistence (default TypeORM + Postgres — OK?)
3. Audit + soft-delete (defaults yes — OK?)

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
| **Permissions** | <MODULE>:<ENTITY>:{LIST,CREATE,UPDATE,DELETE} |
| **Audit + soft-delete** | yes |
| **Tests** | <minimal | standard | full> |

→ Tiếp theo: `sdcorejs-write-spec` để mình draft spec.
```

---

## Spec

### Path conventions (be-masterdata baseline)
- Module folder: `src/modules/<module>/`
- Sub-folders: `entities/`, `repositories/`, `services/`, `controllers/`, `dto/`, `schemas/` (Zod), `mappers/`
- Shared package (cross-module Zod schemas + base classes): `libs/shared/`
- Migrations: `src/migrations/<timestamp>-<topic>.ts`
- Tests: alongside source, `.spec.ts` + `.e2e-spec.ts` suffixes; integration tests under `test/integration/`

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
- [ ] `POST /<entity>` requires permission `<MODULE>:<ENTITY>:CREATE`, returns 403 otherwise
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
Until the `nestjs-write-code` orchestrator ships, the last plan step should call out the manual tail-call sequence:
1. `sdcorejs-test` — write e2e tests for happy path
2. `sdcorejs-review` — convention review
3. `orchestration/repair-loop` — apply review findings
4. `orchestration/comment-code` — ASK gate (skip / simple / medium / full)
5. `orchestration/verify-before-done` — acceptance criteria gate
6. `orchestration/branch-ready` — branch-hygiene sweep (debug logs, secrets, focused tests, lint+build+test) before docs
7. `orchestration/auto-docs` — session summary to `.sdcorejs/docs/nestjs/`
8. `orchestration/auto-task-tracker` — tick / append tasks
9. `orchestration/memories` — durable knowledge if applicable

Once the orchestrator ships, the plan can simply reference `nestjs-write-code` and the tail-call chain is owned there.

---

## Open questions for this track (track is "planned")
- Where do shared validators live exactly — `libs/shared/schemas/` or `libs/shared/zod/`? (need confirmation from be-masterdata project layout)
- Default cursor-pagination shape (offset+limit vs id-cursor) — confirm before any plan locks it in
- Permission code naming convention (uppercase enum vs strings) — confirm from existing modules
- Should the `nestjs-write-code` orchestrator dispatch sub-skills `10-init-project`, `11-init-module`, `12-init-entity`, `20-controller`, `21-service`, `22-repository`, or a flatter layout — open design call
