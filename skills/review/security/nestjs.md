---
name: sdcorejs-review-security-nestjs
description: Use to audit NestJS-specific security concerns beyond the cross-track `review/security/shared.md` baseline — AuthGuard placement order vs ZodValidationGuard, `@HasPermission` on every write endpoint, SQL injection via raw queries / query builder, file upload limits, CORS allowlist, JWT secret rotation, rate limiting per endpoint, secrets handling. Outputs Critical/Important/Minor findings. Triggers - "security review nestjs", "audit BE security", "check permission decorators", "SQL injection", "secrets check", or invocation pre-release. Bilingual (VI/EN).
allowed-tools: Read, Bash, Glob, Grep
---

# Review — Security (NestJS)

## Purpose
Run the cross-track `review/security/shared.md` baseline + NestJS-specific checks. Most BE security issues are: (a) endpoint missing auth/permission, (b) raw SQL with user input, (c) over-permissive CORS, (d) secrets in code / logs. This skill catches them.

## When invoked
- Pre-release security gate
- After adding new endpoints / file upload / external service integration
- User says "security check BE", "audit BE security"

## Probe layer 1 — Baseline (shared)

Run `review/security/shared.md` first.

## Probe layer 2 — NestJS-specific

### NS-1: Every write endpoint has `@HasPermission`

```bash
# Find all POST / PUT / DELETE / PATCH methods in controllers
grep -rnB3 -E "@(Post|Put|Delete|Patch)\(" src/**/*.controller.ts | grep -B3 -E "@(Post|Put|Delete|Patch)"
# For each method block, verify @HasPermission is in the 3 lines above
```

Severity: Critical per missing decorator on write endpoint.

WCAG-equivalent / OWASP: Broken Access Control (A01).

### NS-2: Guard order — AuthGuard MUST run before ZodValidationGuard

If Zod runs first, unauthenticated users see validation hints (info leak: "this field is required, that one expects email format" → reveals API shape).

```bash
grep -rnE "@UseGuards\([^)]+\)" src/**/*.controller.ts | head
# Order in arg list = execution order. AuthGuard must be first.
# Anti-pattern: @UseGuards(ZodValidationGuard(...), AuthGuard)
```

Severity: Critical per swap.

OWASP A01.

### NS-3: SQL injection via raw query

```bash
# Find raw queries
grep -rnE "(query|createQueryBuilder|getRawOne|getRawMany)\(" src/**/*.repository.ts src/**/*.service.ts | head -20

# For each, verify parameters are bound, not concatenated
grep -rnE "(query|where)\(.*\\\$\{" src/ # template literal in query = bad
grep -rnE "(query|where)\(.*\+\s*\w+" src/ # string concat = bad
```

Severity: Critical per concatenated raw SQL.

OWASP A03 Injection.

### NS-4: File upload limits

```bash
# Find @UploadedFile / FileInterceptor usage
grep -rnE "(FileInterceptor|@UploadedFile)" src/ | head
# For each, verify limits: { fileSize: <bytes>, files: <N> }
grep -rnE "limits:\s*\{" src/ | head
```

Severity: Critical if no `limits` set (DoS via unlimited upload).

### NS-5: CORS allowlist (not `origin: '*'`)

```bash
grep -rnE "enableCors|@CrossOrigin" src/main.ts src/ | head
# Look for origin: '*' or true (allow all)
```

Severity: Critical for production-facing API. Permissive CORS = CSRF risk if cookies used.

### NS-6: JWT secret strength + rotation

```bash
# Find JWT config
grep -rnE "(JwtModule\.register|jwtSecret|jwt\.signOptions)" src/ | head
# Check: secret comes from env, not hardcoded; expiresIn set
```

```bash
# Hardcoded secret = Critical
grep -rnE "(JwtModule\.register).*secret:\s*['\"]\w+['\"]" src/
```

Severity: Critical per hardcoded secret.

### NS-7: Rate limit on auth + sensitive endpoints

```bash
# Find @Throttle / global ThrottlerModule
grep -rnE "(Throttle|ThrottlerModule)" src/ | head
# Auth endpoints (login, register, password-reset) need stricter rate limit
```

Severity: Critical if login endpoint has no rate limit (brute-force).

### NS-8: Bilingual error doesn't leak internals

`HttpException` message reaches the client. Stack traces, SQL fragments, internal IDs should NEVER appear in user-facing error messages.

```bash
# Look for throws that may leak
grep -rnE "throw new (BadRequestException|InternalServerErrorException)\(.*error\.message" src/ | head
# Passing the raw `error.message` to user can leak SQL / stack info
```

Severity: Important per leak.

### NS-9: Secrets logging

```bash
# Any code logging sensitive fields
grep -rnE "console\.(log|debug)\(.*password|.*token|.*secret" src/
# OR via structured logger
grep -rnE "logger\.\w+\(.*password|.*token|.*secret" src/
```

Severity: Critical per occurrence.

### NS-10: Mass assignment

```bash
# Methods that take the full body and pass to repo.save
grep -rnE "repo\.save\(\s*req\.body\)|repository\.save\(\s*body\)" src/ | head
# Each = mass assignment vulnerability (user can set createdBy, isAdmin, etc.)
```

Severity: Critical — always pick fields from DTO explicitly.

### NS-11: .env.example doesn't include real secrets

```bash
# Make sure .env.example has placeholder values, not real secrets
grep -E "(jwt|secret|key|password|token).*=.*\w{20,}" .env.example
```

Severity: Critical if real secret committed.

### NS-12: Soft-deleted records not excluded from queries

```bash
# Custom queries that should respect soft delete
grep -rnE "\.find\(|\.findOne\(|\.createQueryBuilder" src/**/*.repository.ts | head
# Each should add `.andWhere('deletedAt IS NULL')` OR use the BaseRepository pattern
```

Severity: Important — soft-deleted records leaking is a privacy issue (especially for user deletion).

### NS-13: Webhook signature verification

If the API receives webhooks (Stripe, Resend bounce, etc.), each must verify signature.

```bash
grep -rnE "@Post\([^)]*webhook|signature" src/ | head
```

Severity: Critical per webhook endpoint without signature verification.

### NS-14: `Helmet` / security headers

```bash
grep -nE "helmet" src/main.ts package.json
```

Severity: Important — `helmet` adds default security headers (CSP, HSTS, X-Frame-Options).

### NS-15: `csurf` / CSRF protection (only if cookies used for auth)

If API uses cookie-based sessions (not Bearer tokens), CSRF protection is required.

Severity: Critical if cookie auth without CSRF.

## Output

```markdown
# Security Audit (NestJS) — <api> — <date>

## Baseline (review/security/shared.md)
- Findings: <N>

## NestJS-specific findings (NS-1 through NS-15)

### Critical (must fix before release)
| # | Check | Location | OWASP | Fix |
|---|---|---|---|---|

### Important
...

### Minor
...

## Manual audit (cannot automate)
- [ ] Token expiry tested (token expires when expected): <pass/fail>
- [ ] Permission escalation impossible (user A cannot access user B's data): <pass/fail>
- [ ] Rate limit tested under load (login locks after N attempts): <pass/fail>
- [ ] File upload of executable rejected: <pass/fail>
- [ ] OWASP top-10 thinking applied: <pass/fail>
```

## Rules

### MUST DO
- Run baseline `review/security/shared.md` first
- Cite OWASP top-10 category for each finding (A01 Access, A03 Injection, etc.)
- Manual section is mandatory — automation catches ~50% of BE security issues
- Run against PRODUCTION-LIKE config — dev mode may have lax CORS / no rate limit on purpose
- Test the manual section yourself on a staging environment

### MUST NOT
- Claim ✅ without testing in production-like config
- Use a real production token in test scripts
- Skip the file upload + webhook checks because "we don't have those" — confirm by grep
- Audit security in isolation from code review — overlapping findings get one entry, not two

## Anti-patterns
- **Whitelisting CORS by reading from a list that includes localhost in production** — `.env.example` ships with localhost; ensure production overrides
- **`@HasPermission('PUBLIC')` as a way to make endpoint public** — explicit `@Public()` decorator is clearer; `@HasPermission` shouldn't be how you opt out
- **Plain bcrypt without salt rounds set** — default rounds may be too low; explicit 12+
- **Returning DTO that includes `password` field** — even if hashed, never; pick fields explicitly
- **Logging entire request body for "debugging"** — leaks secrets; log selective fields with PII redacted
- **JWT in localStorage (per browser default)** — vulnerable to XSS; use httpOnly cookie if possible

## Cross-references
- Cross-track baseline: `review/security/shared.md`
- Code review: `review/code/nestjs` (some overlap on `@HasPermission`)
- Performance: `review/performance/nestjs` (rate limit overlap)
- Verification: `orchestration/verify-before-done`
