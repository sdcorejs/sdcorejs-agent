# Review-Security Knowledge — Cross-Track Baseline

> Cross-track checklist loaded on demand by the `sdcorejs-review` skill
> for every audit, before the stack-specific probes in `_refs/<track>/review-security.md`.
> Not a dispatchable skill — has no frontmatter. The **output format** (color-coded
> report) is owned by the parent skill; this file only supplies *what to check*.

## Scope detection
Run the block(s) for the stack(s) present (`angular.json` / `nest-cli.json` / `next.config.*`).
For a monorepo, run all applicable blocks and scope each finding to its stack.

## Probe and redaction discipline

The parent `sdcorejs-review` must discover the target package manager, scripts,
installed tools, and stack layout before running probes. Commands below are
examples, not mandatory commands. Do not hardcode `npm`, `tsc`, or source roots;
do not install or download tools without explicit approval.

Secret redaction is mandatory. Never echo secret values from `.env`, local
config, CI files, source files, command output, or git history. For secret
findings, report only file path, line number when available, key/category, and
redacted evidence such as `API_KEY=[REDACTED]`. Prefer scans that print file
paths or key names instead of full matching lines.

## Read-only inventory (parallel)
- Inspect the current diff or an explicitly bounded Git review range; do not
  widen scope to arbitrary recent history.
- `git diff <base>...HEAD` — full diff when an explicit base ref defines scope
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
- **NestJS**: trace effective global/controller/method guards, inherited metadata, overrides and public exemptions. Require `@HasPermission` only where the detected SDCoreJS profile and project contract use it; plain NestJS may use another verified mechanism.
- **Angular**: trace parent/child route guards, lazy boundaries and action permissions; a UI guard never substitutes for server authorization.
- Compare permission names within the project's vocabulary and operation boundary; do not impose an SDCoreJS naming scheme on another profile.
- No "magic boolean" admin checks — use roles/permissions

Build an operation/permission/owner/tenant/denial-test matrix for changed surfaces.
Verify unauthenticated, wrong-role, wrong-owner and cross-tenant requests against
the real enforcement layer. A decorator's presence alone is not enforcement;
its absence is not a defect when an effective global/inherited guard covers it.
See `_refs/shared/review-screen-patterns.md` for UI/API parity. Missing evidence
is a gap, not proof of a vulnerability. Keep one primary finding per root cause.

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
- No keys/passwords in history. If history must be inspected, use a redacted
  scan that does not print values or full matching lines; report only
  key/category and affected commit/file evidence.
- Logs don't dump full request bodies on auth POST/PUT; PII not echoed in error responses

### F. Transport / network
- HTTPS-only in prod (HSTS set); CORS = explicit allow-list (not `*`) where cookies/credentials are used
- CSRF tokens for cookie-based sessions (not needed for bearer-token APIs)
- Content-Security-Policy set (NextJS `next.config`, NestJS `helmet`)
- Session cookies `HttpOnly` + `Secure` + `SameSite=Lax|Strict`

### G. Dependencies
```bash
# Use the detected package manager and existing workspace policy.
# Examples only; record skipped probes if no audit/outdated script or tool exists.
<package-manager> audit --omit=dev
<package-manager> outdated
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
