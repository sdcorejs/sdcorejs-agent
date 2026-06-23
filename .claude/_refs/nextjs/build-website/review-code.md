# Review-Code Knowledge — Next.js (build-website)

> Track-specific knowledge loaded on demand by the `sdcorejs-review` skill
> when the project architecture is detected as a Next.js site (`next.config.*` +
> `next` dep + `src/app/[locale]`). Not a dispatchable skill — has no frontmatter.
> The **output format** (color-coded tables) is owned by the parent skill; this
> file only supplies *what to check*.

## What this covers
Per-file code review for a Next.js landing-site project. Different from
the `architecture` dimension of `sdcorejs-review` (structural) and performance review (numbers).
This file checks line-level adherence to Next.js + build-website conventions.

## Conventions checked (mapped to the write-code reference pack that defined them)

### 1. Server vs Client component boundary (from the `pages-and-blocks` pack)

Default is server component. Add `"use client"` ONLY when interactive (state, effects, browser APIs).

Probe:
```bash
# Components with 'use client' but no hooks/events → can be server
grep -rl "'use client'" src/components/sections/ | while read f; do
  if ! grep -qE "useState|useEffect|onClick|onChange|onSubmit|useRef|useReducer" "$f"; then
    echo "POSSIBLE FALSE-CLIENT: $f"
  fi
done

# Components missing 'use client' but using state/events
grep -rL "'use client'" src/components/ | while read f; do
  if grep -qE "useState|useEffect|onClick|onSubmit" "$f"; then
    echo "MISSING-CLIENT: $f"
  fi
done
```

Severity:
- 🔴 Critical: missing `"use client"` on file using hooks → build error
- 🟡 Important: unnecessary `"use client"` bloats bundle (Server Component would suffice)

### 2. `next/image` everywhere (from the `responsive` pack)

Raw `<img>` skips AVIF/WebP + sizes + LCP optimization.

Probe:
```bash
grep -rn "<img " src/ public/ 2>/dev/null
```

Severity: 🔴 Critical for every `<img>` in `src/components/`, `src/app/`. Marketing `<img>` in raw HTML email templates exempt.

### 3. `generateMetadata` on every page (from the `seo` pack)

Every `page.tsx` under `src/app/[locale]/` exports `generateMetadata` (async) OR `export const metadata` (static).

Probe:
```bash
find src/app -name 'page.tsx' | while read f; do
  if ! grep -qE "generateMetadata|export const metadata" "$f"; then
    echo "MISSING-META: $f"
  fi
done
```

Severity: 🟡 Important per page. 🔴 Critical if it's a top-level marketing page.

### 4. i18n typed `Link` from `@/i18n/routing` (from the `i18n` pack)

Internal navigation MUST use typed `Link` (re-exported from `@/i18n/routing`), NOT `next/link` directly — otherwise locale prefix is lost.

Probe:
```bash
# All `next/link` imports outside i18n config files
grep -rnE "from\s+['\"]next/link['\"]" src/ \
  | grep -v "src/i18n/" \
  | grep -v "src/middleware"
```

Severity: 🔴 Critical per occurrence — produces broken URLs.

### 5. No hardcoded strings in section components (from the `pages-and-blocks` pack)

Vietnamese/English literals belong in `src/content/<locale>/` or `src/i18n/messages/<locale>.json`. Components receive strings as props.

Probe:
```bash
# Vietnamese diacritics in section component files
grep -rnE "[àáâãèéêìíòóôõùúýăđĩũơưạ-ỹÀ-Ỹ]" src/components/sections/
```

Severity:
- 🔴 Critical: hardcoded VI/EN in production component
- Acceptable: comments + aria-label IF they're already in i18n keys

### 6. `"use cache"` + `cacheLife` on every page (from the `caching` pack)

Each `src/app/[locale]/**/page.tsx` should declare a cache strategy explicitly (default 30 min ISR per the build-website pack).

Probe:
```bash
find src/app -name 'page.tsx' | while read f; do
  if ! grep -q '"use cache"' "$f"; then
    echo "MISSING-CACHE: $f"
  fi
done
```

Severity: 🟡 Important — uncached pages hit server on every request → slow + costly.

### 7. `setRequestLocale(locale)` in every `[locale]/page.tsx` (from the `i18n` pack)

Required when using async server components with static rendering.

Probe:
```bash
find src/app/\[locale\] -name 'page.tsx' | while read f; do
  if ! grep -q "setRequestLocale" "$f"; then
    echo "MISSING-LOCALE-CONTEXT: $f"
  fi
done
```

Severity: 🔴 Critical — runtime errors with static generation.

### 8. No `dangerouslySetInnerHTML` for user content (cross-cutting security)

Only acceptable use: rendering server-built JSON-LD (`<script type="application/ld+json">`). Any other usage flags as Critical.

Probe:
```bash
grep -rn "dangerouslySetInnerHTML" src/ | grep -vE "ld\+json|JSON\.stringify"
```

Severity: 🔴 Critical (XSS risk).

### 9. Form validation via zod (from the `contact-form` pack)

Forms validate via shared zod schema (client + server). No bespoke regex validation that diverges between client and server.

Probe:
```bash
# Find form components without zod import nearby
find src/components -name 'contact*.tsx' -o -name '*-form.tsx' | while read f; do
  if ! grep -lqE "from\s+['\"]zod['\"]" "$f"; then
    echo "POSSIBLE-NO-ZOD: $f"
  fi
done
```

Severity: 🟡 Important if the form has > 3 fields; 🔵 Minor for newsletter signup (single field).

### 10. `next/font` with Vietnamese subset (from the `theme` pack)

Vietnamese diacritics need explicit subset; default Latin subset produces tofu (□).

Probe:
```bash
grep -rnE "next/font|google\(.*\{" src/ | head -5
# Inspect each match — should include `subsets: [..., 'vietnamese']`
```

Severity: 🔴 Critical if site is VI-primary and the subset is missing.

### 11. API routes have rate limit + zod validation (from the `contact-form` pack)

`src/app/api/**/route.ts` POST handlers must:
- Validate body via zod
- Apply rate limit (in-memory map or upstream tool)
- Return structured error (`{ error: 'reason' }`) not stack trace

Probe:
```bash
find src/app/api -name 'route.ts' | while read f; do
  echo "=== $f ==="
  grep -cE "rateLimit|RATE_LIMIT|x-forwarded-for" "$f" || echo "  no rate-limit reference"
  grep -cE "z\.object|z\.string|zod" "$f" || echo "  no zod"
done
```

Severity: 🔴 Critical for any public POST endpoint.

### 12. Server/API contract vs Component ViewModel boundary

Route handlers, server actions, fetchers, and service helpers expose a public contract to pages/components. That contract does not need to mirror the raw upstream API or provider response 1:1 when a server-side mapper intentionally transforms it.

Review checks:
- Every public route/action/fetcher output field is returned or guaranteed by the mapper/service.
- Every public input field is validated, accepted, or intentionally ignored with a documented reason.
- Raw upstream types stay behind the server boundary (`CmsPostRaw`, `CrmLeadApiRes`, provider response types) and are mapped before reaching React components.
- Components do not mutate server DTOs with UI-only fields such as `checked`, `selected`, `expanded`, `children`, `disabled`, `label`, `displayName`, `color`, or `icon`.
- UI-only fields live in local component state/ViewModels unless the server mapper derives and documents them as part of the public contract.
- Findings name the layer for ambiguous fields: `Upstream API field`, `Route/action/fetcher output field`, `Component ViewModel field`, or `UI state field`.

Severity:
- 🟡 Important when false contracts or UI-only fields create maintainability/type-safety risk.
- 🔴 Critical when the mismatch breaks a form submit, sends an invalid payload, hides required upstream data, or leaks provider-only fields to the client.

### 13. Hydration-safe rendering

Common hydration bugs:
- `Date.now()` / `Math.random()` / `new Date()` in server render → different on client
- Conditional `typeof window !== 'undefined'` blocks producing different markup
- Locale-dependent date/number formatting without explicit `useFormatter()`

Probe:
```bash
grep -rnE "(Date\.now|Math\.random|new Date\(\))" src/app/ src/components/sections/
grep -rnE "typeof window" src/app/ src/components/sections/
```

Severity: 🔴 Critical per occurrence (causes React 18 hydration error).

### 13. Shared utility reuse with `@sdcorejs/utils`

Generic helpers should come from `@sdcorejs/utils` or a thin project wrapper, not be recreated in `src/lib/utils.ts`, route handlers, hooks, or components.

Probe:
```bash
rg -n "(formatDate|formatNumber|toCurrency|isValidEmail|isEmail|isPhone|isUrl|copyToClipboard|randomId|generateUuid|parseQuery|arraySearch|dateDiff|deepMerge|stableStringify)" src/lib src/app src/components 2>/dev/null
rg -n "from ['\"]@sdcorejs/utils/dist" src/ 2>/dev/null
rg -n "BrowserUtilities" src/app src/lib 2>/dev/null
```

Review rules:
- If generated code imports `@sdcorejs/utils`, verify `package.json` has a direct dependency.
- Flag duplicate Date/Number/String/Validation/Array/Filter/Object/Color/Browser helpers when `@sdcorejs/utils` covers the behavior.
- Keep `next-intl` `useFormatter()`/`getFormatter()` for locale-bound UI output. Do not replace correct locale formatting with generic utilities.
- `BrowserUtilities` is only valid in client files with `'use client'`; it is forbidden in route handlers, metadata, sitemap, server components, and other server-only code.

Severity: 🟡 Important for duplicate business-visible date/number/filter behavior or server import of browser utilities; 🔵 Minor for small local wrappers with a clear reason.

### 14. `metadataBase` set on root layout

Without `metadataBase`, OG / canonical URLs are relative and break social previews.

Probe:
```bash
grep -nE "metadataBase" src/app/layout.tsx src/lib/seo.ts
```

Severity: 🟡 Important.

### 15. Bundle hygiene — no client import of server-only modules

Server-only deps (`fs`, `path`, `@aws-sdk`, anything in `lib/server-only/`) MUST NOT be imported from client components.

Probe:
```bash
# For each 'use client' file, follow imports and check
grep -l "'use client'" src/components/ -r | while read f; do
  for forbidden in 'from .node:fs.' 'from .fs.' '@aws-sdk' 'lib/server-only'; do
    grep -lE "$forbidden" "$f" 2>/dev/null && echo "BAD-CLIENT-IMPORT: $f → $forbidden"
  done
done
```

Severity: 🔴 Critical — server-only modules in client bundle leak secrets / break build.

## Severity mapping for this track
- **🔴 Critical** — build-breaking (`use client` gap, missing `setRequestLocale`), broken URLs (direct `next/link`), XSS (`dangerouslySetInnerHTML`), hydration mismatches, server-only leaks into client, hardcoded VI/EN in prod, unguarded public POST.
- **🟡 Important** — missing metadata/cache/`metadataBase`, unnecessary `"use client"`, multi-field form without zod, false route/action/fetcher model fields, or UI-only state added to server DTOs.
- **🔵 Minor** — single-field form without zod, style nits.
- **🟢 Strengths (mirror)** — correct server/client split, typed i18n Link usage, clean cache strategy worth replicating.

## Scope rules
- Focus on the changed files (`git diff`); reviewing the whole site every time is noise.
- Do NOT auto-fix — that's `sdcorejs-repair-loop`'s job.
- Do NOT run when there are no Next.js files in the diff (out of scope).
- Do NOT duplicate `sdcorejs-review` architecture-dimension findings (module boundaries belong there).
- Cite the build-website sub-skill that defines each convention.

## Anti-patterns to flag
- **Review every file** — focus on the changed files; whole-site review every time is noise.
- **"Add more tests" as a finding** — that belongs in `testing/` skill output, not code review.
- **Linting concerns flagged as Critical** — ESLint handles those; code review focuses on conventions ESLint doesn't enforce.
- **DTO as client scratch object** — server data models should not be mutated with UI-only fields; use a local ViewModel or mapper-owned derived field.

## Cross-references
- Architecture review (modules, layering): `sdcorejs-review` with the `architecture` dimension
- Performance review: `sdcorejs-review`
- Accessibility review: `sdcorejs-review`
- Security audit (cross-cutting): `sdcorejs-review`
- Repair loop: `sdcorejs-repair-loop`
- Source conventions: `_refs/nextjs/build-website/write-code/{init-site,theme,pages-and-blocks,seo,og-preview,i18n,caching,responsive,contact-form,content-quality}.md`
