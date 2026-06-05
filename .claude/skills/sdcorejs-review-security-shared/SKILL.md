---
name: sdcorejs-review-security-shared
description: Use when the user asks for a cross-track security audit, says "review bảo mật", "security check", "audit security", "kiểm tra bảo mật", or before a release / major refactor. Runs a cross-track security checklist (auth, authorization, injection, secrets, transport, dependencies, error handling) tailored to angular, nestjs, and nextjs conventions. Stack-specific deepens via `review/security/<stack>.md`. Outputs a structured Critical / Important / Minor report with file:line refs. Applies to angular, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Grep, Glob, Bash
---

# Security Review — Cross-Track Checklist

**Extended by:** `review/security/angular.md`, `review/security/nestjs.md`, `review/security/nextjs.md` — each runs this baseline first, then adds stack-specific numbered checks. Run the matching stack file(s) after this one.

## Purpose
Catch common security mistakes BEFORE they ship. Not a substitute for pentest or SAST — this is the engineer-level sanity check that you'd want a reviewer to do, formalized.

## When invoked
- "review bảo mật", "security review", "audit security"
- Before tagging a release that contains auth / permission / input-handling changes
- After integrating a third-party dependency that touches user data
- When the user reports a suspected vuln

## Scope detection
Run the relevant block(s) based on the stack(s) present (use `sdcorejs-env-setup` stack detection logic). For a monorepo, run all applicable blocks.

## Workflow

### 1. Read-only inventory (parallel)
- `git log -20 --oneline` — what landed recently
- `git diff <base>...HEAD` — full diff if a base ref is given, else surface
- `package.json` — find auth/crypto/parsing libs
- `.env.example` / config files — find env var names (without reading real `.env`)

### 2. Run the cross-track checklist

#### A. Authentication
- [ ] JWT secret comes from env, not hardcoded — grep `JWT_SECRET\s*=\s*['"]\w` for hardcoded strings
- [ ] Token lifetime is reasonable (≤ 1d access, ≤ 30d refresh)
- [ ] No tokens logged (grep `console.log` / `Logger.log` near auth code)
- [ ] No tokens in URLs (URL → server access logs → leak)
- [ ] Password handling uses bcrypt/argon2, not MD5/SHA1/plain
- [ ] Refresh-token rotation present (each refresh issues a new RT + invalidates the old one)

#### B. Authorization (RBAC / permissions)
- **NestJS**: every controller method has `@HasPermission(...)` or explicit `@Public()` (no implicit defaults)
- **NestJS**: `AuthGuard` and `RolesGuard` registered globally OR per-controller
- **Angular**: every route in `app-routing.module.ts` has the right `canActivate` guard
- **Angular**: permission code constants are typed (string literal union, not free strings)
- Permission code naming is consistent: `<MODULE>_<RESOURCE>_<ACTION>` (e.g. `CATALOG_C_PRODUCT_CREATE`)
- No "magic boolean" admin checks — use roles/permissions

#### C. Input validation
- **NestJS**: DTOs use the project's validation pipe consistently (this stack often uses custom validators, NOT `class-validator` — confirm before flagging)
- **NestJS**: no `req.body as any` casts
- **Angular**: forms enforce min/max length, pattern; backend validates too (defense in depth)
- File upload: size + MIME type + extension are validated server-side (client-only validation = bypassed)
- No raw HTML rendered from user input (Angular `[innerHTML]`, NextJS `dangerouslySetInnerHTML`)

#### D. Injection
- **SQL** (NestJS + TypeORM/Prisma): use parameterized queries / query builder; flag any `query(\`SELECT ... ${var}\`)` template-string concatenation
- **NoSQL**: same rule for MongoDB / Redis pipelines
- **Command injection**: grep `child_process.exec(`, `execSync(` — should use `execFile` with array args, not shell
- **Path traversal**: file reads with `..` or user-supplied paths must be normalized + bounded
- **XSS** (Angular): `bypassSecurityTrust*` calls require justification; flag every one
- **XSS** (NextJS): `dangerouslySetInnerHTML` requires justification
- **Open redirect**: redirect URLs from query params must be on an allow-list

#### E. Secrets / sensitive data
- [ ] No `.env` / `*.pem` / credentials in the repo (check `git log --all --full-history -- '.env'`)
- [ ] `.env.example` doesn't contain real values
- [ ] No API keys / passwords in commit history (run `git log -p | grep -iE 'password|api_key|secret|bearer'` on suspicious areas)
- [ ] Logs don't dump full request bodies on POST/PUT to auth endpoints
- [ ] PII not echoed in error responses (don't include email/SSN in 4xx body)

#### F. Transport / network
- HTTPS-only in prod (HSTS header set on backend)
- CORS: explicit allow-list, not `*`, on endpoints that use cookies/credentials
- CSRF: tokens for cookie-based session auth; not needed for bearer-token APIs
- Content-Security-Policy header set (NextJS via `next.config.js`, NestJS via `helmet`)
- Cookies: `HttpOnly` + `Secure` + `SameSite=Lax|Strict` for session cookies

#### G. Dependencies
```bash
npm audit --omit=dev                 # or `yarn audit` / `pnpm audit`
npm outdated                         # check what's behind
```
- [ ] No `Critical` / `High` vulns in production deps
- [ ] No deps published <30 days ago in production (supply-chain caution)
- [ ] Lockfile committed and `package-lock.json` / `yarn.lock` not stripped
- [ ] No `npm install --legacy-peer-deps` workaround for an underlying issue

#### H. Error handling & info leak
- 4xx / 5xx responses don't include stack traces in production
- `try/catch` blocks log the error with a request ID, not just `console.error(e)`
- Generic error messages to user; details in server logs only
- No "user not found" vs "wrong password" differentiation (timing + message)

#### I. Stack-specific extras

**Angular Portal**
- [ ] `environment.production.ts` has API URLs / keys for prod only (no dev URLs leaked)
- [ ] Source maps disabled in prod build (`"sourceMap": false` in `angular.json` prod config) OR uploaded only to internal error tracker
- [ ] `inject(HttpClient)` interceptor chain includes auth + error handlers in the right order

**NestJS**
- [ ] `@HasPermission` decorator is reflective AND enforced by a guard (decorator alone does nothing)
- [ ] `SdContext` middleware runs BEFORE auth guard if it sets the request context that the guard reads
- [ ] TypeORM `synchronize: true` is OFF in production
- [ ] No `WHERE 1=1` debug clauses in shipped queries

**NextJS**
- [ ] `NEXT_PUBLIC_*` env vars contain no secrets (everything client-readable is in the bundle)
- [ ] Server Components fetch with auth context; Client Components don't see server-only env
- [ ] Server Actions verify the caller (don't trust the form submission alone)
- [ ] Middleware (`middleware.ts`) matcher excludes static / public paths from auth check, but INCLUDES API routes

### 3. Output

Produce a structured report:

```markdown
## Security Review — <repo> @ <branch> — <date>

### Scope
- Stacks reviewed: <angular | nestjs | nextjs>
- Commit range: <base>...<head> (N commits)
- Files touched: M

### Findings

#### Critical (must fix before merge / release)
1. **<title>** — `path/to/file.ts:42`
   - What: <observation>
   - Risk: <impact>
   - Fix: <suggested change>

#### Important (fix this iteration)
1. ...

#### Minor / nits
1. ...

### Passed checklist items
<short list of the categories where nothing was found — gives the user signal that you actually looked>

### Out of scope (not checked here)
- Penetration testing, DAST, threat modeling
- Infrastructure (network, K8s, IAM)
- Third-party SaaS configuration
```

## Rules

### MUST DO
- Use Grep to actually find evidence — do not list generic risks with no file:line
- Categorize each finding as Critical / Important / Minor with a rationale
- Match SDCoreJS conventions (custom validators in NestJS, `@HasPermission`, etc.) — don't flag deviations from generic frameworks as bugs
- List "Passed" items so the user trusts the report
- Output in the user's session language

### MUST NOT
- Read or echo `.env` / credential files
- Run `npm audit fix --force` automatically — that can introduce breaking upgrades
- Claim a vuln without a file:line reference
- Skip categorization (a flat list of findings is unprioritized noise)
- Treat every `bypassSecurityTrust*` as automatically wrong — surface them, ask for justification

## Anti-patterns
- A 50-item report where everything is "Important" — nothing is, then
- Findings without file:line refs
- Listing OWASP Top 10 generically without evidence in this repo
- Telling the user to "improve security" without specifics
- Running this on a 1000-file repo with no commit range — the noise hides the signal
- Re-running this and producing identical findings to last week (means nothing was fixed; flag it)

## When to escalate
- Critical finding involves PII at rest / in transit → loop in the data/compliance owner before the fix lands
- Vuln in a dep with no patch yet → consider isolating / disabling the feature; report to the dep maintainer
- Suspected active exploit → stop, this is incident response, not code review

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
