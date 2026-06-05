# Review-Code Knowledge — NestJS

> Track-specific knowledge loaded on demand by the `sdcorejs-review-code` skill
> when the project architecture is detected as a NestJS backend (`nest-cli.json`
> + `@nestjs/*` deps). Not a dispatchable skill — has no frontmatter.
> The **output format** (color-coded tables) is owned by the parent skill; this
> file only supplies *what to check*.

## What this covers
Per-file code review for a NestJS backend following the `be-masterdata` baseline.
Different from `review/architecture` (structural), `review/security/nestjs`
(auth/injection), `review/performance/nestjs` (queries). This file checks
adherence to NestJS + be-masterdata conventions.

## Conventions checked

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

### 2. Zod schemas live in `base/shared/<domain>/`

Schemas are shared with frontend, so they live in `base/shared/<domain>/`, not in `src/<module>/`.

Probe:
```bash
# Look for inline Zod schemas in service / controller files
grep -rnE "z\.object\(\{" src/ 2>/dev/null | head -10
# Should be 0 matches; all schemas come from `@/shared/<domain>/...`
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

### 6. `BaseEntity` / `BaseRepository` / `BaseService` from `base/core-be/`

Use the base classes — they ship the audit columns (createdAt, updatedAt, createdBy, updatedBy), the soft-delete pattern, and the bilingual error helpers.

Probe:
```bash
# Entity files NOT extending BaseEntity
grep -rl "@Entity" src/**/*.entity.ts | while read f; do
  if ! grep -qE "extends\s+BaseEntity" "$f"; then
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

### 7. Bilingual error messages

Errors thrown to the user must be bilingual `{ vi, en }` via `bilingualMsg(vi, en)`.

Probe:
```bash
# Throw statements with plain string message
grep -rnE "throw new (HttpException|BadRequestException|NotFoundException|ConflictException)" src/ | head
# Each should pass a bilingual message, not a plain string
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

## Severity mapping for this track
- **🔴 Critical** — layer violations, missing `@HasPermission` on writes, untransactional multi-writes, guard order, schema/migration drift, external bilingual-error gaps.
- **🟡 Important** — Zod-in-feature drift, fat controllers, base-class drift, entity leaks, env/logging gaps.
- **🔵 Minor** — helper-reuse consistency (`requiredString`, `PartialInput`).
- **🟢 Strengths (mirror)** — clean layering, correct QueryRunner transactions, DTO mapping worth replicating.

## Scope rules
- Stop at code review — structural concerns go to `review/architecture`.
- Do NOT duplicate `review/security/nestjs` findings (auth/injection belong there).
- Flag for manual review where a probe can't be precise (e.g. multi-write detection).

## Anti-patterns to flag
- **Service that imports `Request` from express** — service must not know about HTTP; pass user via parameter or use a request-scoped provider
- **Try-catch around every line in a service method** — bubble up; let global exception filter handle conversion
- **`@Injectable() { providedIn: 'root' }`** — that's Angular syntax; NestJS uses module providers
- **`@Get(':id') findOne(@Param('id') id) { return id; }`** — unused — controllers should at minimum delegate to service
- **Returning HTTP status codes via `res.status(...)`** — break NestJS exception flow; throw `HttpException` instead

## Cross-references
- Architecture review: `review/architecture`
- Security audit: `review/security/nestjs` + `review/security/shared`
- Performance audit: `review/performance/nestjs`
- Repair loop: `orchestration/repair-loop`
- Conventions referenced: be-masterdata baseline + `base/core-be/` + `base/shared/`
