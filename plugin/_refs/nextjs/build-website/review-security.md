# Review-Security Knowledge — Next.js (build-website)

> Track-specific probes loaded on demand by `sdcorejs-review-security` when the
> project is a Next.js site (`next.config.*` + `next` dep), AFTER the cross-track
> baseline in `_refs/shared/review-security.md`. Not a dispatchable skill — no
> frontmatter. Output format owned by the parent skill.

Most site issues: (a) a secret leaked via `NEXT_PUBLIC_` into the client bundle, (b) a Server Action / route handler that trusts the request without verifying the caller, (c) missing/weak CSP, (d) `dangerouslySetInnerHTML` on user/CMS content, (e) an open redirect from a query param.

## NX-1: No secrets in `NEXT_PUBLIC_*`
Everything `NEXT_PUBLIC_` is inlined into the client bundle at build time.
```bash
grep -rnE "NEXT_PUBLIC_\w*(SECRET|KEY|TOKEN|PASSWORD|PRIVATE)" . --include='*.ts' --include='*.tsx' --include='.env*'
```
**Critical** per secret-bearing `NEXT_PUBLIC_` var. OWASP A02 / A05.

## NX-2: Server Actions verify the caller
A Server Action is a public POST endpoint — the form being on an authed page does NOT protect it.
```bash
grep -rnl "['\"]use server['\"]" app/ src/ 2>/dev/null
```
**Critical** per mutating action with no caller verification. OWASP A01.

## NX-3: Route handlers authenticate
```bash
grep -rnl "export async function (GET|POST|PUT|DELETE|PATCH)" app/ --include='route.ts' --include='route.tsx' 2>/dev/null
```
**Critical** per unauthenticated mutating handler. OWASP A01.

## NX-4: Content-Security-Policy header present
```bash
grep -rnE "Content-Security-Policy|contentSecurityPolicy" next.config.* middleware.ts 2>/dev/null
```
Sites with third-party embeds need a CSP with an explicit allowlist — not `unsafe-inline`/`unsafe-eval` everywhere. **Important** if no CSP; **Critical** if CSP uses `unsafe-eval` with user-influenced script. OWASP A05.

## NX-5: `dangerouslySetInnerHTML` justified + sanitized
```bash
grep -rnE "dangerouslySetInnerHTML" app/ src/ components/ 2>/dev/null
```
CMS/MDX/user content must pass a sanitizer (e.g. `isomorphic-dompurify`). **Critical** if user/remote content unsanitized; **Minor** (justify) if static. OWASP A03 (XSS).

## NX-6: Open redirect from query params
```bash
grep -rnE "redirect\(.*searchParams|redirect\(.*req(uest)?\.(nextUrl|url)" app/ src/ 2>/dev/null
```
Redirect target from `?next=` / `?returnUrl=` must be allowlisted / same-origin relative. **Critical** per unbounded redirect. OWASP A01.

## NX-7: Middleware matcher includes protected paths
```bash
grep -nE "matcher|config\s*=" middleware.ts 2>/dev/null
```
A too-narrow `matcher` silently disables the guard. **Critical** if it excludes routes the guard should protect. OWASP A01.

## NX-8: `next/image` `remotePatterns` is a tight allowlist
```bash
grep -nE "remotePatterns|domains" next.config.* 2>/dev/null
```
Wildcard `hostname: '**'` turns the optimizer into an open proxy (SSRF / bandwidth abuse). **Important** per wildcard. OWASP A10 SSRF.

## NX-9: Contact form — spam + rate limit + validation
```bash
grep -rnE "honeypot|rate.?limit|recaptcha|turnstile|hcaptcha" app/ src/ lib/ 2>/dev/null
```
Each submission path needs server-side Zod validation, a per-IP rate limit, and a bot deterrent; email content escaped before templating. **Critical** if no rate limit (mail-bomb / cost abuse); **Important** if no bot deterrent. OWASP A04.

## NX-10: No server-only env in Client Components
```bash
grep -rlE "['\"]use client['\"]" app/ src/ components/ 2>/dev/null
# then grep each for process.env.<NON-NEXT_PUBLIC>
```
**Important** per occurrence (undefined at runtime, or a leak if bundled). OWASP A05.

## NX-11: Security response headers
```bash
grep -nE "X-Frame-Options|Strict-Transport-Security|X-Content-Type-Options|Referrer-Policy|Permissions-Policy" next.config.* middleware.ts 2>/dev/null
```
Set `X-Frame-Options: DENY` (or CSP `frame-ancestors`), HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy` in `next.config` `headers()`. **Important** if missing. OWASP A05.

## NX-12: `.env*` files not committed
```bash
git log --all --full-history -- '.env' '.env.local' '.env.production' 2>/dev/null | head
grep -nE "^\.env" .gitignore 2>/dev/null
```
Only `.env.example` (placeholders) is committed. **Critical** if a real `.env*` is tracked. OWASP A02.

## Manual audit (cannot automate)
- [ ] Server Action called directly (bypassing the form) is rejected
- [ ] View-source of a built page contains no secret values
- [ ] Open-redirect attempt (`?next=https://evil.com`) is blocked
- [ ] Contact form survives a burst without sending N mails
- [ ] CSP blocks an injected inline script in the browser console

## Anti-patterns
- Trusting `NEXT_PUBLIC_` for "low-sensitivity" keys — if it's in the bundle, it's public
- CSP with `'unsafe-inline' 'unsafe-eval'` everywhere — that's no CSP; scope nonces/hashes
- Open redirect "for UX" (`?returnUrl=`) — allowlist or force same-origin relative
- Wildcard image `remotePatterns: [{ hostname: '**' }]` — open proxy
- Contact form with client-only validation — server-side Zod + rate limit are mandatory

## Cross-references
- Contact-form generation: `_refs/nextjs/build-website/write-code/contact-form.md`
- Code review (server/client boundary overlap): `sdcorejs-review-code`
