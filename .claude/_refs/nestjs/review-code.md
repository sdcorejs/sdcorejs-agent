# Review-Code Knowledge — NestJS

> Track-specific knowledge loaded on demand by the `sdcorejs-review` skill
> when the project architecture is detected as a NestJS backend (`nest-cli.json`
> + `@nestjs/*` deps). Not a dispatchable skill — has no frontmatter.
> The **output format** is owned by the parent skill; this
> file only supplies *what to check*.

## What this covers
Per-file code review for a NestJS backend on the `@sdcorejs/nestjs` core.
Different from the `architecture` dimension of `sdcorejs-review` (structural). This file checks
adherence to the conventions the `sdcorejs-nestjs` packs actually generate
(`_refs/nestjs/write-code/*`) at whichever **profile** the project uses
(`simple` | `enterprise`; see `init-project.md`). Probes that only apply to one
profile are marked `[enterprise]`.

## Conventions checked

### 0. Mandatory NestJS / PostgreSQL / TypeORM / Zod checklist
Run these checks in addition to the SDCoreJS NestJS conventions below. Report results through the parent skill's Angular/NestJS code-review table mode with `STT`, `Severity`, `Nhóm`, `File/Dòng`, `Vấn đề`, `Rủi ro`, `Đề xuất fix`, and `Gate`.

#### Review judgement guardrails
- Do not review mechanically. Do not flag an issue only because the code does not use a newer pattern/convention when the project has not adopted it.
- Distinguish real defects from project conventions, intentional technical debt, unfinished migrations, and personal preference.
- Require concrete evidence for every issue: file, line, code fragment, repeated pattern, failing probe, or clear project convention.
- If evidence is incomplete, use `INFO` or `RECOMMENDED`; do not inflate severity.

#### NestJS architecture & module boundaries
- Check modules follow business boundaries and do not concentrate too much logic in one module/service/controller.
- Controllers should handle HTTP concerns only: request/response, status code, guards, validation pipe, and basic input/output mapping.
- Keep business logic in services/use cases/domain layer; keep repository/data-access logic out of controllers.
- Flag circular dependencies and avoid `forwardRef()` unless there is a clear reason or refactor path.
- Provider scope must be intentional: avoid request-scoped providers unless needed, and avoid injecting heavy services into request scope.
- Module imports/exports should be explicit; do not export internal providers unnecessarily.

#### Naming & file structure
- Files should use kebab-case and role suffixes such as `*.controller.ts`, `*.service.ts`, `*.module.ts`, `*.repository.ts`, `*.entity.ts`, `*.schema.ts`, `*.dto.ts`, and `*.spec.ts`.
- Entity class names should be singular because one entity represents one record/domain object: `UserEntity`, `OrderEntity`, `PaymentTransactionEntity`.
- Entity filenames should be singular when project convention allows: `user.entity.ts`, `order.entity.ts`, `payment-transaction.entity.ts`.
- Database table names may be plural or follow project DB convention, for example `@Entity('users')` with `UserEntity`.
- Do not flag plural naming if the project clearly uses a different convention; use `INFO` or `RECOMMENDED` when naming causes confusion.

#### Controller, route & API contract
- Check route paths, methods, params, and query names are consistent and do not conflict, such as `/:id` before `/search`.
- Check HTTP status code semantics: `201` create, `200` query/update, `204` delete without body, `400` validation, `401` unauthenticated, `403` unauthorized, `404` not found, `409` conflict.
- Response shape should match project convention.
- Do not expose TypeORM entities directly when they contain sensitive fields or large relations; map to DTO/response models.
- Pagination/filter/sort contracts should be explicit.
- Parse and validate query params; do not use raw strings for number/boolean/date semantics.

#### DTO, Zod validation & data boundary
- Validate request body/query/params with Zod or the project's validation mechanism; TypeScript types/interfaces alone do not validate runtime input.
- Zod schemas must cover types, required/optional fields, min/max, enum, format, nested object/array constraints, and transforms/coercion when needed.
- Flag `z.any()`, `z.unknown()`, and broad `.passthrough()` without a reasoned comment or documented contract.
- Prefer `.strict()` or an explicit unknown-field policy when the API contract requires it.
- Check `.optional()`, `.nullable()`, and `.nullish()` match business meaning.
- For `z.coerce.number()`, validate `NaN`, range, and integer constraints when relevant. Date strings need format/timezone validation when important. Boolean query params must parse `"false"` correctly.
- Prefer `z.infer<typeof schema>` where it avoids duplicate schema/type drift.
- Validation errors should be clear without leaking sensitive internal details.

#### TypeORM entity design
- Entity class/file naming should be singular unless project convention says otherwise.
- Entity nullable/default settings must match migrations and business rules; do not use `nullable: true` for required business fields.
- Sensitive fields such as password/token/secret must not be returned in responses.
- Handle `select: false` fields intentionally when needed, such as password hashes.
- PostgreSQL `numeric`/`decimal` values often return strings; do not assume `number` without conversion policy.
- Timestamp strategy should be consistent (`createdAt`, `updatedAt`, `deletedAt`, timezone, `timestamptz` when required).
- Soft delete behavior must be explicit for query/include/restore/delete paths.
- Relations should avoid unbounded eager loading; flag `eager: true` and broad `cascade: true` without a strong reason.
- Indexes, unique constraints, and enum columns must match query patterns, business rules, and migrations.

#### TypeORM query & repository usage
- Raw SQL and QueryBuilder must use parameter binding; never interpolate client input into SQL.
- List endpoints must have pagination and max limits.
- Sort/filter fields must be validated or whitelisted before reaching `ORDER BY` or dynamic predicates.
- Avoid unbounded `find`/`findOne` patterns that can scan large tables or return the wrong row.
- Check N+1 relation loading; use joins, batching, or optimized queries when needed.
- Select only required fields and avoid loading large unused relations.
- Multi-write business operations need transactions. Inside a transaction, use the transactional manager/repository, not the outer repository.
- Check locks/concurrency/idempotency for balance, inventory, quota, payment, booking, and retry-prone endpoints.

#### PostgreSQL schema, migration & data integrity
- Every schema change must have a corresponding migration; do not rely on `synchronize: true` in production.
- Migrations need meaningful `up`/`down`, data-loss awareness, and a backfill strategy for adding non-null columns to populated tables.
- Use DB constraints for important invariants: unique, foreign key, check, and not null.
- Do not enforce race-prone uniqueness/business rules only in application code.
- Check indexes for common filter/join/order columns; avoid unnecessary indexes that slow writes.
- Partial unique indexes for soft delete must use the correct predicate.
- Choose data types intentionally: UUID vs serial/bigint, numeric for money, jsonb only when queryable JSON is needed, text/varchar length by business rule.
- Do not store sensitive data in plain text. Date/timezone handling must avoid off-by-one range bugs.

#### Error handling & exception mapping
- Do not throw generic errors that expose stack traces or internal details.
- Map common DB/domain errors to correct HTTP exceptions, for example unique violation `23505` -> `409`, foreign key `23503` -> `400` or `409`, not found -> `404`, validation -> `400`.
- Do not swallow errors with empty catch blocks.
- Do not log sensitive details in errors.
- Error response shape should match project convention. Global exception filters must preserve useful context.

#### Authentication, authorization & security
- Endpoints that need auth must have guards; never rely only on frontend checks.
- Authorization must check resource ownership/role/permission; do not trust `userId`/`tenantId` from body/query when it should come from auth context.
- Admin/internal endpoints must not be exposed without guards.
- Do not log tokens, passwords, secrets, or PII. Passwords must be hashed with an appropriate algorithm.
- Secrets/config must come from environment/config service, not hardcoded values.
- Check CORS, rate limit, helmet/security headers when relevant.
- Check injection risks: SQL injection, command injection, path traversal, SSRF.
- File uploads need mime/type/size/extension validation and project-specific scanning policy where required.

#### Configuration & environment
- Validate config at bootstrap.
- Avoid scattered `process.env.X` reads when the project has ConfigService/schema.
- Environment variables need safe defaults or fail-fast behavior.
- Do not let dev/test config leak into production.
- DB pool size, timeout, retry, logging level, and feature flag fallback should match environment needs.

#### Logging, observability & audit
- Logs should include useful context such as requestId/correlationId/userId where appropriate.
- Do not log sensitive payloads.
- Avoid `console.log` in production code when the project has a structured logger.
- Important failures need appropriate severity.
- Sensitive actions such as permission changes, payment, delete, export data, login/security events need audit logs when the project requires them.
- Metrics/tracing should follow project standards when present.

#### Performance & scalability
- List endpoints need pagination and max page size.
- Avoid unbounded relation/tree loads.
- Avoid per-item DB/API calls when batching is possible.
- Check index usage for filters/sorts on large tables.
- Cache must have TTL/invalidation and correct user/tenant scope.
- File/export/import flows should stream large data instead of loading everything into memory.
- External calls need timeout/retry policies.

#### Multi-tenancy / ownership
- Tenant/user-scoped data queries must filter by `tenantId`, `organizationId`, owner, or equivalent boundary.
- Do not trust tenant/user IDs from the client when auth context owns them.
- Check tenant-scoped uniqueness/indexes.
- Users must not read/update/delete resources from another tenant. Background jobs, exports, and reports must preserve tenant boundaries.

#### Background jobs, scheduler & async processing
- Jobs should be idempotent when retries are possible.
- Queues need retry/backoff/dead-letter strategy where supported.
- Jobs must not swallow errors.
- Avoid parallel job execution races without locks.
- Schedulers must avoid duplicate execution across multiple instances unless distributed locking exists.
- Batch jobs need limits, checkpoints, timeouts, and logging.

#### Tests
- Unit tests should cover important service business logic.
- Controller/e2e tests should cover validation/auth/error mapping for important endpoints.
- Repository/query tests should cover complex queries.
- Transaction/concurrency/idempotency tests are needed for sensitive business flows.
- Zod validation tests should cover valid payloads, missing required fields, invalid enum/type/range, and unknown-field behavior when strict mode is used.
- Do not over-mock so much that tests miss contract errors.
- DB tests need clear setup/teardown and should not depend on stale state. Important migrations should be verified.

#### Code quality & maintainability
- Avoid `any` and `as any` without a reasoned comment.
- Remove dead code, unused providers, and unused DTO/schema files.
- Service methods should not be overly long or carry multiple responsibilities.
- Avoid duplicating business rules across layers; centralize in domain/service/schema where appropriate.
- Comments should explain why, not restate what the code does.

### 1. Layering — controller → service → repository → entity

Controllers must NOT touch the repository directly. Services must NOT call other controllers. Repositories are the ONLY place TypeORM imports live in feature code.

Probe:
```bash
# Controller importing repository = layer violation
grep -rnE "from\s+['\"].*\.repository['\"]" src/*/[!_]*/*.controller.ts 2>/dev/null

# Service importing controller = layer violation
grep -rnE "from\s+['\"].*\.controller['\"]" src/**/*.service.ts 2>/dev/null

# Non-repository file importing typeorm directly
grep -rnE "from\s+['\"]typeorm['\"]" src/ | grep -v "\.repository\.ts" | grep -v "\.entity\.ts" | grep -v "data-source"
```

Severity: 🔴 Critical per violation.

### 2. Zod schemas live in `src/modules/<module>/schemas/<module>.schema.ts`

Schemas belong in the dedicated `schemas/` folder within each module, not inline in service or controller files. The shared `@shared` location is `[enterprise]`-only (cross-module contracts).

Probe:
```bash
# Inline Zod schemas in service / controller files = drift (schemas belong in schemas/<module>.schema.ts)
rg -n "z\.object\(\{" src/modules --glob '!**/schemas/**' 2>/dev/null | head
# Expected: 0 — all create/update schemas live in src/modules/<module>/schemas/
```

Severity: 🟡 Important — drift means BE + FE can diverge silently.

### 3. `@HasPermission` decorator on every endpoint that mutates state

Read-only GET endpoints often skip permission. Anything that writes MUST have `@HasPermission('CODE')`.

Probe:
```bash
# Find POST/PUT/DELETE/PATCH methods
grep -rnB2 -E "@(Post|Put|Delete|Patch)\(" src/**/*.controller.ts | grep -B2 "@(Post|Put|Delete|Patch)"
# For each, the method above should have @HasPermission
```

Severity: 🔴 Critical per missing decorator on write endpoint.

### 4. Controller methods are thin (≤ 5 lines)

Business logic in controllers = uncoverable + untransactional + uncacheable.

Probe:
```bash
# Find long controller methods (>20 lines)
awk '
  /async\s+\w+\(/ { start=NR; name=$0 }
  /^\s*\}/ && start {
    if ((NR - start) > 20) print FILENAME ":" start " " name
    start=0
  }
' src/**/*.controller.ts 2>/dev/null
```

Severity: 🟡 Important per controller method > 20 lines.

### 5. Manual transactions via `QueryRunner` for multi-write operations

Multi-write operations (create+ update related + audit log) must use a `QueryRunner` with try/catch/release.

Probe:
```bash
# Service methods with 2+ repo.save / repo.update calls without QueryRunner
# Hard to grep precisely; flag for manual review
grep -rnE "repository\.(save|update|delete)" src/**/*.service.ts | head
# For each service file: if it has 2+ writes, manually verify QueryRunner is present
```

Severity: 🔴 Critical per multi-write service method without transaction.

### 6. `BaseEntity` / `BaseRepository` / `BaseService` from `@sdcorejs/nestjs/core`

Use the base classes — they ship the audit columns (createdAt, updatedAt, createdBy, modifiedBy), the soft-delete pattern, and the error helpers. The entity base is `WithAudit(BaseEntity)` (simple profile) or the local `src/common/base-entity.ts` (`[enterprise]`).

Probe:
```bash
# Entity files NOT extending BaseEntity or WithAudit
grep -rl "@Entity" src/**/*.entity.ts | while read f; do
  if ! grep -qE "extends\s+(BaseEntity|WithAudit)" "$f"; then
    echo "NOT-EXTENDING-BASE: $f"
  fi
done

# Repository / service classes not extending base
grep -rl "@Injectable" src/**/*.repository.ts | while read f; do
  if ! grep -qE "extends\s+BaseRepository" "$f"; then
    echo "NOT-EXTENDING-BASE: $f"
  fi
done
```

Severity: 🟡 Important — drift from base = duplicate audit logic, inconsistent soft-delete.

### 7. Domain errors via `badRequest(code, data?)` — not raw exception strings

Domain errors go through `badRequest(code, data?)` (from `src/common/errors`) wrapping `apiError(code, message, data?)`, localized by the i18n catalog. Throwing a raw string message bypasses the i18n envelope and exposes non-localized text to the FE.

Probe:
```bash
# Throws that bypass the i18n envelope (raw string message, not a code)
rg -n "throw new (BadRequestException|NotFoundException|ConflictException)\(['\"]" src/ | head
# Expected: 0 — domain errors use badRequest('<module>.<entity>.<rule>', data?)
```

Severity: 🔴 Critical for external-facing errors (FE displays them); 🟡 Important for internal-only errors.

### 8. `optionalString` / `requiredString` helpers from `base/shared/`

Common Zod patterns are pre-built — don't reimplement.

Probe:
```bash
grep -rnE "z\.string\(\)\.min\(1," src/ src/shared/ # ad-hoc requiredString
# Should be 0; use requiredString() helper from base/shared/
```

Severity: 🔵 Minor (consistency win).

### 9. `ZodValidationGuard` order — AuthGuard FIRST, then ZodValidationGuard

```bash
# Find @UseGuards declarations on controllers
grep -rnE "@UseGuards" src/**/*.controller.ts | head
# Order should be: @UseGuards(AuthGuard, ZodValidationGuard(...)) — AuthGuard first
```

Severity: 🔴 Critical — if Zod runs before auth, unauthenticated users get validation hints; possible info leak.

### 10. `PartialInput<T>` for update DTOs (not bespoke partial schemas)

```bash
# Update DTOs that aren't using PartialInput
grep -rnE "UpdateReq\s*=\s*z\." src/shared/ src/ | head
# Should use the helper that auto-makes Create fields optional
```

Severity: 🔵 Minor.

### 11. Endpoint returns DTO, not entity

Returning the raw entity exposes internal columns, soft-delete flag, audit fields the FE doesn't need.

```bash
# Controller methods returning entity directly (TypeORM entity has @Entity decorator)
grep -rnE "return\s+(this|service|repo)\." src/**/*.controller.ts | head
# Each should map to DTO before return
```

Severity: 🟡 Important per leak.

### 12. Database migrations checked in

Schema changes must come with a migration file.

```bash
ls src/migrations/ 2>/dev/null | wc -l
# Compare against the count of @Entity files — if entities grow but migrations don't, you have drift
```

Severity: 🔴 Critical — schema drift between dev (synchronize) and prod (migrations) breaks deployments.

### 13. `.env.example` matches `process.env` reads

```bash
# All process.env reads
grep -rnE "process\.env\.\w+" src/ | grep -oE "process\.env\.\w+" | sort -u > /tmp/env-uses.txt

# .env.example keys
grep -oE "^\w+" .env.example 2>/dev/null | sort -u > /tmp/env-declared.txt

diff /tmp/env-uses.txt /tmp/env-declared.txt
```

Severity: 🟡 Important — missing entries fail in CI / on fresh clone.

### 14. Logging via structured logger, not `console.log`

```bash
grep -rnE "console\.(log|error|warn)" src/ | head
```

Severity: 🟡 Important — `console.log` in prod hits stdout but lacks request context / structured fields.

## Severity and gate mapping for this track
- **🔴 Critical** + `BLOCKER` — SQL injection, auth bypass, tenant data leak, exposed secrets/PII, data loss, money/data corruption, runtime crash in core flows, missing write authorization, unsafe guard order, or severe schema/migration drift.
- **🟠 High** + `BLOCKER`/`REQUIRED` — missing transaction for important multi-write operations, race condition in payment/inventory/quota/booking, admin endpoint without guard, serious data-integrity risk, unbounded query on critical endpoint, or unsafe TypeORM cascade/eager behavior with high mutation/load risk.
- **🟡 Medium** + `REQUIRED`/`RECOMMENDED` — missing request-boundary validation, missing important DB constraint, missing pagination/max limit, sort/filter not whitelisted, unreasoned `z.any()`/`z.unknown()`, entity leak, env/config/logging gap, or maintainability risk with clear evidence.
- **🟢 Low** + `RECOMMENDED`/`OPTIONAL` — naming/style/format/readability issues, missing `down` in low-risk migration, excess provider exports, helper-reuse consistency (`requiredString`, `PartialInput`), or convention drift without immediate behavioral risk.
- **🔵 Info / Kudos** + `INFO` — useful note, project-specific convention, or positive implementation detail.
- **🟢 Pass / Compliant** / **✅ Checked** + `PASS` — reviewed criterion passed.
- **✨/🌟 Excellent** + `INFO` — notably robust security, transaction, query, validation, or migration design worth mirroring.

## Positive rows to include when applicable
- Clear module boundaries and thin controllers.
- Zod validation covers runtime input boundary and edge cases.
- TypeORM queries use parameter binding and whitelist sort/filter inputs.
- Multi-write business flows use transactions with the transactional manager.
- PostgreSQL migrations include safe `up/down`, constraints, indexes, and backfill.
- Auth/authorization checks include ownership/tenant boundaries.
- Tests cover happy path, error path, validation, and critical transaction/query behavior.

## Post-review assistance
- For small fixes, include a concrete patch idea or snippet in the `Đề xuất fix` cell.
- For medium/large fixes, recommend a spec/plan before editing and include scope, affected files, risks, tests to run, and rollback strategy.
- For large cross-module/backend changes, do not approve the gate without lint/test/build evidence plus side-effect review for migration, transaction, authorization, and dependency impact.
- Prefer small, behavior-preserving changes.
- If context is insufficient, use `INFO` or `RECOMMENDED` and state what must be checked next.
- Prioritize security, authorization, validation boundary, transaction, data integrity, and DB constraints before style/convention.

## Scope rules
- Stop at code review — structural concerns go to `sdcorejs-review` with the `architecture` dimension.
- Do NOT duplicate `sdcorejs-review` findings (auth/injection belong there).
- Flag for manual review where a probe can't be precise (e.g. multi-write detection).

## Anti-patterns to flag
- **Service that imports `Request` from express** — service must not know about HTTP; pass user via parameter or use a request-scoped provider
- **Try-catch around every line in a service method** — bubble up; let global exception filter handle conversion
- **`@Injectable() { providedIn: 'root' }`** — that's Angular syntax; NestJS uses module providers
- **`@Get(':id') findOne(@Param('id') id) { return id; }`** — unused — controllers should at minimum delegate to service
- **Returning HTTP status codes via `res.status(...)`** — break NestJS exception flow; throw `HttpException` instead

## Cross-references
- Architecture review: `sdcorejs-review` with the `architecture` dimension
- Security audit: `sdcorejs-review`
- Performance audit: `sdcorejs-review`
- Repair loop: `sdcorejs-repair-loop`
- Conventions referenced: `@sdcorejs/nestjs` core (`_refs/nestjs/core-catalog.md`) + the write-code packs + `architecture-principles.md`
