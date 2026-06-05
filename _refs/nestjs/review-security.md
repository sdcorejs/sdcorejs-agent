# Review-Security Knowledge — NestJS

> Track-specific probes loaded on demand by `sdcorejs-review-security` when the
> project is a NestJS backend (`nest-cli.json` + `@nestjs/*`), AFTER the cross-track
> baseline in `_refs/shared/review-security.md`. Not a dispatchable skill — no
> frontmatter. Output format owned by the parent skill.

Most BE issues: (a) endpoint missing auth/permission, (b) raw SQL with user input, (c) over-permissive CORS, (d) secrets in code/logs. The BE is the authorization boundary — enforce, don't assume.

## NS-1: Every write endpoint has `@HasPermission`
```bash
grep -rnB3 -E "@(Post|Put|Delete|Patch)\(" src/**/*.controller.ts | grep -B3 -E "@(Post|Put|Delete|Patch)"
```
**Critical** per missing decorator on a write endpoint. OWASP A01.

## NS-2: Guard order — AuthGuard before ZodValidationGuard
If Zod runs first, unauthenticated users see validation hints (info leak revealing API shape).
```bash
grep -rnE "@UseGuards\([^)]+\)" src/**/*.controller.ts | head
# arg-list order = execution order; AuthGuard must be first
```
**Critical** per swap. OWASP A01.

## NS-3: SQL injection via raw query
```bash
grep -rnE "(query|createQueryBuilder|getRawOne|getRawMany)\(" src/**/*.repository.ts src/**/*.service.ts | head -20
grep -rnE "(query|where)\(.*\\\$\{" src/   # template literal in query = bad
grep -rnE "(query|where)\(.*\+\s*\w+" src/ # string concat = bad
```
**Critical** per concatenated raw SQL. OWASP A03.

## NS-4: File upload limits
```bash
grep -rnE "(FileInterceptor|@UploadedFile)" src/ | head
grep -rnE "limits:\s*\{" src/ | head
```
**Critical** if no `limits` (DoS via unlimited upload).

## NS-5: CORS allowlist (not `origin: '*'`)
```bash
grep -rnE "enableCors|@CrossOrigin" src/main.ts src/ | head
```
**Critical** for a production-facing API. Permissive CORS = CSRF risk if cookies used.

## NS-6: JWT secret strength + rotation
```bash
grep -rnE "(JwtModule\.register|jwtSecret|jwt\.signOptions)" src/ | head
grep -rnE "(JwtModule\.register).*secret:\s*['\"]\w+['\"]" src/   # hardcoded = Critical
```
**Critical** per hardcoded secret; secret from env + `expiresIn` set.

## NS-7: Rate limit on auth + sensitive endpoints
```bash
grep -rnE "(Throttle|ThrottlerModule)" src/ | head
```
**Critical** if the login endpoint has no rate limit (brute-force).

## NS-8: Bilingual error doesn't leak internals
`HttpException` message reaches the client — no stack traces / SQL fragments / internal ids.
```bash
grep -rnE "throw new (BadRequestException|InternalServerErrorException)\(.*error\.message" src/ | head
```
**Important** per leak.

## NS-9: Secrets logging
```bash
grep -rnE "console\.(log|debug)\(.*password|.*token|.*secret" src/
grep -rnE "logger\.\w+\(.*password|.*token|.*secret" src/
```
**Critical** per occurrence.

## NS-10: Mass assignment
```bash
grep -rnE "repo\.save\(\s*req\.body\)|repository\.save\(\s*body\)" src/ | head
```
User can set `createdBy`, `isAdmin`, etc. **Critical** — pick fields from the DTO explicitly.

## NS-11: `.env.example` has no real secrets
```bash
grep -E "(jwt|secret|key|password|token).*=.*\w{20,}" .env.example
```
**Critical** if a real secret is committed.

## NS-12: Soft-deleted records excluded from queries
```bash
grep -rnE "\.find\(|\.findOne\(|\.createQueryBuilder" src/**/*.repository.ts | head
```
Each should add `deletedAt IS NULL` or use the BaseRepository pattern. **Important** — leaking soft-deleted records is a privacy issue.

## NS-13: Webhook signature verification
```bash
grep -rnE "@Post\([^)]*webhook|signature" src/ | head
```
**Critical** per webhook endpoint without signature verification.

## NS-14: `Helmet` / security headers
```bash
grep -nE "helmet" src/main.ts package.json
```
**Important** — `helmet` adds CSP / HSTS / X-Frame-Options defaults.

## NS-15: CSRF protection (only if cookies used for auth)
If the API uses cookie-based sessions (not Bearer tokens), CSRF protection is required. **Critical** if cookie auth without CSRF.

## Manual audit (cannot automate)
- [ ] Token expiry tested (expires when expected)
- [ ] Permission escalation impossible (user A cannot reach user B's data)
- [ ] Rate limit tested under load (login locks after N attempts)
- [ ] File upload of an executable rejected
- [ ] OWASP top-10 thinking applied

## Anti-patterns
- CORS allowlist that includes localhost in production (`.env.example` ships localhost — ensure prod overrides)
- `@HasPermission('PUBLIC')` to make an endpoint public — use explicit `@Public()`
- Returning a DTO that includes `password` (even hashed) — pick fields explicitly
- Logging the entire request body "for debugging" — redact PII / secrets
- JWT in localStorage — prefer httpOnly cookie

## Cross-references
- Code review (`@HasPermission` overlap): `sdcorejs-review-code` · Performance (rate-limit overlap): `review/performance/nestjs`
