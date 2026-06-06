# Review-Security Knowledge — Angular Portal

> Track-specific probes loaded on demand by `sdcorejs-review` when the
> project is an Angular portal (`angular.json` + `@sdcorejs/angular`), AFTER the
> cross-track baseline in `_refs/shared/review-security.md`. Not a dispatchable
> skill — no frontmatter. Output format owned by the parent skill.

Most portal issues: (a) a route missing `canActivate`, (b) XSS via `bypassSecurityTrust*` / `[innerHTML]` on server data, (c) tokens in `localStorage`, (d) interceptor chain in wrong order, (e) dev API URLs / source maps shipped to prod. **The backend is the real authorization boundary — portal guards are UX, not security.** Flag where the FE assumes protection the BE must enforce.

## AG-1: Every protected route has a guard
```bash
grep -rnE "path:\s*['\"]" src/ --include='*routes.ts' --include='*-routing.module.ts' | head -40
grep -rnE "canActivate|canMatch|canActivateChild" src/ --include='*routes.ts' --include='*-routing.module.ts' | head
```
A route without an auth/permission guard is reachable by URL. **Critical** per unguarded protected route. OWASP A01.

## AG-2: Permission codes are typed constants, not free strings
```bash
grep -rnE "hasPermission\(['\"]|@HasPermission\(['\"]|sdHasPermission=['\"]" src/ | head
```
Free strings drift / typo silently to "always false" (locks users out) or worse. **Important** per free-string check. OWASP A01.

## AG-3: `bypassSecurityTrust*` is justified
```bash
grep -rnE "bypassSecurityTrust(Html|Script|Style|Url|ResourceUrl)" src/
```
Each disables the sanitizer. **Critical** if bypassing user/server data; **Minor** (justify) if static. OWASP A03 (XSS).

## AG-4: `[innerHTML]` on dynamic data
```bash
grep -rnE "\[innerHTML\]" src/ --include='*.html' --include='*.ts'
```
**Important** per dynamic-data binding (**Critical** if paired with a bypass). OWASP A03.

## AG-5: Token storage
```bash
grep -rnE "localStorage\.(set|get)Item\(.*(token|jwt|access|refresh)" src/ -i | head
grep -rnE "sessionStorage\.(set|get)Item\(.*(token|jwt|access|refresh)" src/ -i | head
```
Tokens in `localStorage` are XSS-readable; prefer httpOnly cookies. **Important** (**Critical** if combined with an unsanitized XSS sink). OWASP A05.

## AG-6: HttpClient interceptor order
```bash
grep -rnE "HTTP_INTERCEPTORS|provideHttpClient|withInterceptors" src/ | head
```
Auth interceptor (attaches token) must run before the error interceptor (401 → refresh). **Important** if order wrong.

## AG-7: Production source maps + dev URLs
```bash
grep -nE "\"sourceMap\"" angular.json | head
grep -nE "localhost|127\.0\.0\.1|http://" src/environments/environment.prod*.ts src/environments/environment.production.ts 2>/dev/null
```
**Important** per leaked dev URL or shipped prod source map. OWASP A05.

## AG-8: No secrets in environment files
```bash
grep -rnE "(apiKey|secret|password|token|clientSecret)\s*[:=]\s*['\"]\w{12,}" src/environments/ 2>/dev/null
```
Anything in `environment*.ts` ships in the bundle. **Critical** per embedded secret. OWASP A02.

## AG-9: Core permission directive, not hand-rolled `*ngIf`
```bash
grep -rnE "\*sdHasPermission|sdHasPermission|\*ngIf=.*hasPermission" src/ --include='*.html' | head
```
Prefer the Core directive (consistent, testable). **Minor** (consistency) — but a UI gate with no corresponding BE check is **Important**. OWASP A01.

## AG-10: External links / `target="_blank"` reverse tabnabbing
```bash
grep -rnE "target=['\"]_blank['\"]" src/ --include='*.html' | head
```
Needs `rel="noopener noreferrer"`. **Minor** per occurrence. OWASP A05.

## AG-11: Open redirect after login
```bash
grep -rnE "returnUrl|redirectTo|navigateByUrl\(.*queryParam" src/ -i | head
```
A `returnUrl` from query params passed to `navigateByUrl` must be a validated same-origin relative path. **Important** per unbounded redirect. OWASP A01.

## Manual audit (cannot automate)
- [ ] Navigating directly to a protected URL while logged out redirects to login
- [ ] Built bundle (`dist/`) contains no secret values
- [ ] A UI element hidden by permission is also rejected by the BE when called directly
- [ ] Stored XSS payload in a text field does not execute when rendered
- [ ] 401 triggers a single refresh attempt, then logout (no loop)

## Anti-patterns
- Relying on `*ngIf="isAdmin"` for security — hiding a button is not access control; the endpoint must reject
- Free-string permission codes — typos fail silently; use the typed constants module
- `bypassSecurityTrustHtml(serverData)` — direct XSS; sanitize or render as text
- Tokens in `localStorage` on a portal with any `bypassSecurityTrust*` — one XSS exfiltrates every session
- Shipping prod source maps publicly — keep them internal-only

## Cross-references
- Code review (guard/permission overlap): `sdcorejs-review` · Core UI catalog: `_refs/angular/sdcorejs-angular-catalog.md`
