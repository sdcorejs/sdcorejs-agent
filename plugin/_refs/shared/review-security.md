# Review-Security Knowledge — Cross-Track Baseline

> Cross-track checklist loaded on demand by the `sdcorejs-review` skill
> for every audit, before the stack-specific probes in `_refs/<track>/review-security.md`.
> Not a dispatchable skill — has no frontmatter. The **output format** (color-coded
> report) is owned by the parent skill; this file only supplies *what to check*.

## Scope detection
Run the block(s) for the stack(s) present (`angular.json` / `nest-cli.json` / `next.config.*`).
For a monorepo, run all applicable blocks and scope each finding to its stack.

## Read-only inventory (parallel)
- `git log -20 --oneline` — what landed recently
- `git diff <base>...HEAD` — full diff if a base ref is given, else surface
- `package.json` — auth/crypto/parsing libs
- `.env.example` / config — env var **names** only (never read real `.env`)

## Cross-track checklist

### A. Authentication
- JWT secret from env, not hardcoded — grep `JWT_SECRET\s*=\s*['"]\w`
- Token lifetime reasonable (≤ 1d access, ≤ 30d refresh)
- No tokens logged (grep `console.log` / `Logger.log` near auth) and none in URLs (→ access-log leak)
- Passwords use bcrypt/argon2 (12+ rounds), never MD5/SHA1/plain
- Refresh-token rotation present (each refresh issues a new RT + invalidates the old)

### B. Authorization (RBAC / permissions)
- **NestJS**: every controller method has `@HasPermission(...)` or explicit `@Public()`; `AuthGuard`/`RolesGuard` registered global or per-controller
- **Angular**: every route has the right `canActivate`; permission codes are typed (string-literal union, not free strings)
- Permission naming consistent `<MODULE>_<RESOURCE>_<ACTION>` (e.g. `CATALOG_C_PRODUCT_CREATE`)
- No "magic boolean" admin checks — use roles/permissions

### C. Input validation
- **NestJS**: DTOs use the project's validation pipe consistently (this stack often uses custom validators, NOT `class-validator` — confirm before flagging); no `req.body as any`
- **Angular**: forms enforce min/max/pattern; backend validates too (defense in depth)
- File upload: size + MIME + extension validated **server-side** (client-only = bypassed)
- No raw HTML from user input (Angular `[innerHTML]`, NextJS `dangerouslySetInnerHTML`)

### D. Injection
- **SQL** (TypeORM/Prisma): parameterized queries / query builder; flag `<localized text>` concatenation
- **NoSQL**: same for MongoDB / Redis pipelines
- **Command**: grep `child_process.exec(` / `execSync(` → use `execFile` with array args, not shell
- **Path traversal**: user-supplied paths normalized + bounded (no `..`)
- **XSS**: Angular `bypassSecurityTrust*` / NextJS `dangerouslySetInnerHTML` each require justification — flag every one
- **Open redirect**: redirect URLs from query params must be on an allow-list / same-origin relative

### E. Secrets / sensitive data
- No `.env` / `*.pem` / credentials in repo (`git log --all --full-history -- '.env'`)
- `.env.example` has placeholders, not real values
- No keys/passwords in history (`git log -p | grep -iE 'password|api_key|secret|bearer'` on suspect areas)
- Logs don't dump full request bodies on auth POST/PUT; PII not echoed in error responses

### F. Transport / network
- HTTPS-only in prod (HSTS set); CORS = explicit allow-list (not `*`) where cookies/credentials are used
- CSRF tokens for cookie-based sessions (not needed for bearer-token APIs)
- Content-Security-Policy set (NextJS `next.config`, NestJS `helmet`)
- Session cookies `HttpOnly` + `Secure` + `SameSite=Lax|Strict`

### G. Dependencies
```bash
npm audit --omit=dev      # or yarn/pnpm audit
npm outdated
```
- No Critical/High vulns in prod deps; no deps published <30 days in prod (supply-chain)
- Lockfile committed; no `--legacy-peer-deps` papering over a real conflict

### H. Error handling & info leak
- 4xx/5xx carry no stack traces in prod; generic message to user, details in server logs only
- `try/catch` logs with a request id, not bare `console.error(e)`
- No "user not found" vs "wrong password" differentiation (timing + message)

### I. Stack-specific quick flags (full probes in `_refs/<track>/review-security.md`)
- **Angular**: prod source maps off / internal-only; `environment.production.ts` carries no dev URLs / secrets; interceptor order (auth before error)
- **NestJS**: `@HasPermission` enforced by a guard (decorator alone is inert); TypeORM `synchronize: true` OFF in prod
- **NextJS**: `NEXT_PUBLIC_*` holds no secrets; Server Actions verify the caller; middleware `matcher` covers protected + API routes

## Escalation
- Critical touching PII → loop in data/compliance before the fix lands
- Unpatched dep vuln → isolate/disable the feature; report upstream
- Suspected active exploit → stop; incident response, not code review
