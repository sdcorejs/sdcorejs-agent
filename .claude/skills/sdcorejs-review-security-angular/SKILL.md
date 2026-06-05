---
name: sdcorejs-review-security-angular
description: Use to audit Angular Portal-specific security concerns beyond the cross-track `review/security/shared.md` baseline — route guard coverage (`canActivate`), permission-code constants vs free strings, `bypassSecurityTrust*` / `[innerHTML]` XSS, token storage (localStorage vs httpOnly cookie), HttpClient interceptor order, prod source maps, leaked dev API URLs in `environment.production.ts`, and `@sdcorejs/angular` permission directive usage. Outputs Critical/Important/Minor findings. Triggers - "security review angular", "audit portal security", "check route guards", "innerHTML XSS", "token storage", or invocation pre-release. Applies to angular. Bilingual (VI/EN).
allowed-tools: Read, Bash, Glob, Grep
---

# Review — Security (Angular Portal)

## Purpose
Run the cross-track `review/security/shared.md` baseline + Angular Portal-specific checks. Most portal issues are: (a) a route missing its `canActivate` guard, (b) XSS via `bypassSecurityTrust*` or `[innerHTML]` on server data, (c) tokens in `localStorage` (XSS-readable), (d) an interceptor chain in the wrong order, (e) dev API URLs or source maps shipped to prod. This skill catches them. The backend is the real authorization boundary — portal guards are UX, not security — so this skill flags where the FE assumes protection the BE must actually enforce.

## When invoked
- Pre-release security gate
- After adding routes, an `[innerHTML]` binding, a new interceptor, or a third-party widget
- User says "security check portal", "audit FE security"

## Probe layer 1 — Baseline (shared)

Run `review/security/shared.md` first.

## Probe layer 2 — Angular Portal-specific

### AG-1: Every protected route has a guard

```bash
# Find route definitions and check for canActivate / canMatch
grep -rnE "path:\s*['\"]" src/ --include='*routes.ts' --include='*-routing.module.ts' | head -40
grep -rnE "canActivate|canMatch|canActivateChild" src/ --include='*routes.ts' --include='*-routing.module.ts' | head
```

Every authenticated feature route needs an auth/permission guard. A route without one is reachable by URL.

Severity: Critical per unguarded protected route.

OWASP A01 Broken Access Control.

### AG-2: Permission codes are typed constants, not free strings

```bash
# Look for inline permission strings vs imported constants
grep -rnE "hasPermission\(['\"]|@HasPermission\(['\"]|sdHasPermission=['\"]" src/ | head
```

Permission checks should reference a typed constant (string-literal union) from the shared permissions module — free strings drift and typo silently to "always false" (locks users out) or worse.

Severity: Important per free-string permission check.

OWASP A01.

### AG-3: `bypassSecurityTrust*` is justified

```bash
grep -rnE "bypassSecurityTrust(Html|Script|Style|Url|ResourceUrl)" src/
```

Each call disables Angular's built-in sanitizer. Flag every one; require justification and confirm the input is author-controlled, not server/user data.

Severity: Critical if bypassing on user/server data; Minor (justify) if static.

OWASP A03 Injection (XSS).

### AG-4: `[innerHTML]` on dynamic data

```bash
grep -rnE "\[innerHTML\]" src/ --include='*.html' --include='*.ts'
```

`[innerHTML]` runs Angular's sanitizer but still flag bindings fed by server/user content — combined with `bypassSecurityTrustHtml` it becomes a live XSS sink.

Severity: Important per dynamic-data binding (Critical if paired with a bypass).

OWASP A03.

### AG-5: Token storage

```bash
grep -rnE "localStorage\.(set|get)Item\(.*(token|jwt|access|refresh)" src/ -i | head
grep -rnE "sessionStorage\.(set|get)Item\(.*(token|jwt|access|refresh)" src/ -i | head
```

Tokens in `localStorage` are readable by any XSS. Prefer httpOnly cookies set by the backend. If `localStorage` is a deliberate constraint, the XSS surface (AG-3/AG-4) must be airtight.

Severity: Important (Critical if combined with an unsanitized XSS sink).

OWASP A05 Misconfiguration.

### AG-6: HttpClient interceptor order

```bash
grep -rnE "HTTP_INTERCEPTORS|provideHttpClient|withInterceptors" src/ | head
```

Auth interceptor (attaches token) must run before the error interceptor (handles 401 → refresh). A wrong order can leak errors before auth or double-handle 401s. Confirm the registration order.

Severity: Important if order is wrong.

### AG-7: Production source maps + dev URLs

```bash
# Source maps should be off (or internal-only) in prod
grep -nE "\"sourceMap\"" angular.json | head
# environment.production.ts must not carry dev/localhost API URLs
grep -nE "localhost|127\.0\.0\.1|http://" src/environments/environment.prod*.ts src/environments/environment.production.ts 2>/dev/null
```

Severity: Important per leaked dev URL or shipped prod source map.

OWASP A05.

### AG-8: No secrets in environment files

```bash
grep -rnE "(apiKey|secret|password|token|clientSecret)\s*[:=]\s*['\"]\w{12,}" src/environments/ 2>/dev/null
```

Anything in `environment*.ts` ships in the bundle. No real secrets — only public endpoint URLs and feature flags.

Severity: Critical per embedded secret.

OWASP A02 Cryptographic Failures.

### AG-9: `@sdcorejs/angular` permission directive used, not hand-rolled `*ngIf`

```bash
# Confirm permission-gating uses the Core directive where one exists
grep -rnE "\*sdHasPermission|sdHasPermission|\*ngIf=.*hasPermission" src/ --include='*.html' | head
```

Prefer the Core permission directive (consistent, testable) over ad-hoc `*ngIf="hasPermission(...)"`. Either way, remember client gating is UX only — the BE must enforce.

Severity: Minor (consistency) — but note any UI gate with no corresponding BE check as Important.

OWASP A01.

### AG-10: External links / `target="_blank"` reverse tabnabbing

```bash
grep -rnE "target=['\"]_blank['\"]" src/ --include='*.html' | head
```

`target="_blank"` without `rel="noopener noreferrer"` lets the opened page control `window.opener`.

Severity: Minor per occurrence.

OWASP A05.

### AG-11: Open redirect after login

```bash
grep -rnE "returnUrl|redirectTo|navigateByUrl\(.*queryParam" src/ -i | head
```

A `returnUrl` read from query params and passed to `router.navigateByUrl` must be validated as a same-origin relative path.

Severity: Important per unbounded redirect.

OWASP A01.

## Output

```markdown
# Security Audit (Angular Portal) — <portal> — <date>

## Baseline (review/security/shared.md)
- Findings: <N>

## Angular-specific findings (AG-1 through AG-11)

### Critical (must fix before release)
| # | Check | Location | OWASP | Fix |
|---|---|---|---|---|

### Important
...

### Minor
...

## Manual audit (cannot automate)
- [ ] Navigating directly to a protected URL while logged out redirects to login: <pass/fail>
- [ ] Built bundle contains no secret values (grep `dist/`): <pass/fail>
- [ ] A UI element hidden by permission is also rejected by the BE when called directly: <pass/fail>
- [ ] Stored XSS payload in a text field does not execute when rendered: <pass/fail>
- [ ] 401 triggers a single refresh attempt, then logout (no loop): <pass/fail>
```

## Rules

### MUST DO
- Run baseline `review/security/shared.md` first
- Cite the OWASP top-10 category for each finding
- State explicitly that portal guards are UX and the BE is the authorization boundary — flag UI gates with no BE counterpart
- Check the PRODUCTION build config (`angular.json` prod) and `environment.production.ts`, not dev
- Verify findings with Grep evidence (file:line)

### MUST NOT
- Treat a route guard as a security control on its own — it's bypassable; the BE must enforce
- Flag every `[innerHTML]` as Critical — check whether the data is author-controlled or server/user data
- Read or echo any real credentials found
- Assume `@sdcorejs/angular` sanitizes everything — `bypassSecurityTrust*` defeats it

## Anti-patterns
- **Relying on `*ngIf="isAdmin"` for security** — hiding a button is not access control; the endpoint must reject
- **Free-string permission codes** — typos fail silently; use the typed constants module
- **`bypassSecurityTrustHtml(serverData)`** — direct XSS; sanitize or render as text
- **Tokens in `localStorage` on a portal with any `bypassSecurityTrust*`** — one XSS exfiltrates every session
- **Shipping prod source maps publicly** — hands attackers your readable source; keep them internal-only

## Cross-references
- Cross-track baseline: `review/security/shared.md`
- Code review: `sdcorejs-review-code` (overlap on guard + permission conventions)
- Performance: `review/performance/angular`
- Core UI catalog: `_refs/angular/sdcorejs-angular-catalog.md`
- Verification: `orchestration/verify-before-done`

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
