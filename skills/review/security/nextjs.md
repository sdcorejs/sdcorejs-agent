---
name: sdcorejs-review-security-nextjs
description: Use to audit Next.js-specific security concerns beyond the cross-track `review/security/shared.md` baseline — Server Action caller verification, `NEXT_PUBLIC_` secret leaks into the client bundle, Content-Security-Policy headers, middleware matcher gaps, `dangerouslySetInnerHTML`, open redirects, route-handler auth, image `remotePatterns` allowlist, and contact-form spam/rate-limit handling on landing sites. Outputs Critical/Important/Minor findings. Triggers - "security review nextjs", "audit site security", "check server actions", "NEXT_PUBLIC leak", "CSP header", or invocation pre-release. Applies to nextjs. Bilingual (VI/EN).
allowed-tools: Read, Bash, Glob, Grep
---

# Review — Security (Next.js)

## Purpose
Run the cross-track `review/security/shared.md` baseline + Next.js-specific checks. Most Next.js site issues are: (a) a secret leaked through a `NEXT_PUBLIC_` var into the client bundle, (b) a Server Action / route handler that trusts the request without verifying the caller, (c) a missing or weak Content-Security-Policy, (d) `dangerouslySetInnerHTML` on user/CMS content, (e) an open redirect from a query param. This skill catches them.

## When invoked
- Pre-release security gate
- After adding Server Actions, route handlers, a contact form, or a third-party embed
- User says "security check site", "audit FE security"

## Probe layer 1 — Baseline (shared)

Run `review/security/shared.md` first.

## Probe layer 2 — Next.js-specific

### NX-1: No secrets in `NEXT_PUBLIC_*`

Everything prefixed `NEXT_PUBLIC_` is inlined into the client bundle at build time and readable by anyone.

```bash
grep -rnE "NEXT_PUBLIC_\w*(SECRET|KEY|TOKEN|PASSWORD|PRIVATE)" . --include='*.ts' --include='*.tsx' --include='.env*'
```

Severity: Critical per secret-bearing `NEXT_PUBLIC_` var.

OWASP A02 Cryptographic Failures / A05 Misconfiguration.

### NX-2: Server Actions verify the caller

A Server Action is a public POST endpoint. The form being on an authed page does NOT protect it — anyone can call the action directly.

```bash
# Find server actions ("use server")
grep -rnl "['\"]use server['\"]" app/ src/ 2>/dev/null
# For each action that mutates data, verify it checks auth/session before acting
```

Severity: Critical per mutating action with no caller verification.

OWASP A01 Broken Access Control.

### NX-3: Route handlers authenticate

```bash
# Find route handlers
grep -rnl "export async function (GET|POST|PUT|DELETE|PATCH)" app/ --include='route.ts' --include='route.tsx' 2>/dev/null
# Each mutating handler must verify the session/token before acting
```

Severity: Critical per unauthenticated mutating handler.

OWASP A01.

### NX-4: Content-Security-Policy header present

```bash
grep -rnE "Content-Security-Policy|contentSecurityPolicy" next.config.* middleware.ts 2>/dev/null
```

A landing site with third-party embeds (analytics, fonts, maps) needs a CSP with an explicit allowlist — not `unsafe-inline` / `unsafe-eval` everywhere.

Severity: Important if no CSP; Critical if CSP exists but uses `unsafe-eval` with user-influenced script.

OWASP A05.

### NX-5: `dangerouslySetInnerHTML` is justified + sanitized

```bash
grep -rnE "dangerouslySetInnerHTML" app/ src/ components/ 2>/dev/null
```

Every occurrence rendering CMS/MDX/user content must pass through a sanitizer (e.g. `isomorphic-dompurify`). Static, author-controlled HTML is acceptable but should be flagged for justification.

Severity: Critical if rendering user/remote content unsanitized; Minor (justify) if static.

OWASP A03 Injection (XSS).

### NX-6: Open redirect from query params

```bash
grep -rnE "redirect\(.*searchParams|redirect\(.*req(uest)?\.(nextUrl|url)" app/ src/ 2>/dev/null
```

A redirect target read from `?next=` / `?returnUrl=` must be validated against an allowlist (or restricted to same-origin relative paths).

Severity: Critical per unbounded redirect.

OWASP A01.

### NX-7: Middleware matcher includes protected paths

```bash
grep -nE "matcher|config\s*=" middleware.ts 2>/dev/null
```

If `middleware.ts` does auth/redirect work, confirm its `matcher` actually covers the protected routes and API routes — a too-narrow matcher silently disables the guard.

Severity: Critical if the matcher excludes routes the guard is meant to protect.

OWASP A01.

### NX-8: `next/image` `remotePatterns` is a tight allowlist

```bash
grep -nE "remotePatterns|domains" next.config.* 2>/dev/null
```

Wildcard `hostname: '**'` lets the optimizer proxy arbitrary remote images (SSRF / bandwidth abuse). Use specific hostnames.

Severity: Important per wildcard remote pattern.

OWASP A10 SSRF.

### NX-9: Contact form — spam + rate limit + validation

Landing-site contact forms (track `build-website`, skill `18-contact-form`) are the main abuse surface.

```bash
# Find the contact action/handler + its protections
grep -rnE "honeypot|rate.?limit|recaptcha|turnstile|hcaptcha" app/ src/ lib/ 2>/dev/null
```

Each contact submission path needs: server-side validation (Zod), a rate limit (per IP), and a bot deterrent (honeypot field or captcha). Email content must be escaped before templating to avoid header/HTML injection.

Severity: Critical if no rate limit (mail-bomb / cost abuse); Important if no bot deterrent.

OWASP A04 Insecure Design.

### NX-10: No server-only env read in Client Components

```bash
# Components marked "use client" must not read non-public env
grep -rlE "['\"]use client['\"]" app/ src/ components/ 2>/dev/null
# For each, grep for process.env.<NON-PUBLIC>
grep -rnE "process\.env\.(?!NEXT_PUBLIC_)\w+" $(grep -rlE "['\"]use client['\"]" app/ src/ components/ 2>/dev/null) 2>/dev/null
```

A server-only env var read in a Client Component is either `undefined` at runtime (bug) or, if bundled, a leak.

Severity: Important per occurrence.

OWASP A05.

### NX-11: Security response headers

```bash
grep -nE "X-Frame-Options|Strict-Transport-Security|X-Content-Type-Options|Referrer-Policy|Permissions-Policy" next.config.* middleware.ts 2>/dev/null
```

Set `X-Frame-Options: DENY` (or CSP `frame-ancestors`), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy` in `next.config.js` `headers()`.

Severity: Important if missing.

OWASP A05.

### NX-12: `.env*` files not committed

```bash
git log --all --full-history -- '.env' '.env.local' '.env.production' 2>/dev/null | head
grep -nE "^\.env" .gitignore 2>/dev/null
```

`.env.local` and `.env.production` must be gitignored; only `.env.example` (placeholders) is committed.

Severity: Critical if a real `.env*` is tracked.

OWASP A02.

## Output

```markdown
# Security Audit (Next.js) — <site> — <date>

## Baseline (review/security/shared.md)
- Findings: <N>

## Next.js-specific findings (NX-1 through NX-12)

### Critical (must fix before release)
| # | Check | Location | OWASP | Fix |
|---|---|---|---|---|

### Important
...

### Minor
...

## Manual audit (cannot automate)
- [ ] Server Action called directly (bypassing the form) is rejected: <pass/fail>
- [ ] View-source of a built page contains no secret values: <pass/fail>
- [ ] Open-redirect attempt (`?next=https://evil.com`) is blocked: <pass/fail>
- [ ] Contact form survives a burst without sending N mails: <pass/fail>
- [ ] CSP blocks an injected inline script in the browser console: <pass/fail>
```

## Rules

### MUST DO
- Run baseline `review/security/shared.md` first
- Cite the OWASP top-10 category for each finding
- Distinguish "static author HTML" from "remote/user HTML" before flagging `dangerouslySetInnerHTML`
- Check the PRODUCTION build/config — `next dev` relaxes some headers and caching
- Verify findings with Grep evidence (file:line), never list generic risks

### MUST NOT
- Read or echo `.env.local` / `.env.production` contents
- Flag every `dangerouslySetInnerHTML` as Critical without checking the content source
- Assume a Server Action is safe because its page is behind auth — the action is independently reachable
- Skip the contact-form checks because "it's just a landing page" — that form is the abuse surface

## Anti-patterns
- **Trusting `NEXT_PUBLIC_` for "low-sensitivity" keys** — if it's in the bundle, treat it as public, full stop
- **CSP with `'unsafe-inline' 'unsafe-eval'` everywhere** — that's no CSP; scope nonces/hashes instead
- **Open redirect "for UX" (`?returnUrl=`)** — always allowlist or force same-origin relative paths
- **Wildcard image `remotePatterns: [{ hostname: '**' }]`** — turns the optimizer into an open proxy
- **Contact form with client-only validation** — server-side Zod + rate limit are mandatory; client checks are bypassable

## Cross-references
- Cross-track baseline: `review/security/shared.md`
- Contact form generation: `tracks/nextjs/build-website/18-contact-form`
- Code review: `review/code/nextjs` (overlap on Server Component / Client Component boundaries)
- Performance: `review/performance/nextjs`
- Verification: `orchestration/verify-before-done`
