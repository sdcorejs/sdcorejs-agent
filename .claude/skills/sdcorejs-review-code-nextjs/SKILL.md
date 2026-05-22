---
name: sdcorejs-review-code-nextjs
description: Use to review Next.js landing-site code against the build-website pack's conventions — server-vs-client component boundary, `next/image` enforcement, `generateMetadata` per page, i18n typed Link usage, externalized content, `"use cache"` placement, no `<a>` for internal links, hydration-safe patterns. Outputs structured Critical/Important/Minor report with file:line refs. Triggers - "review code nextjs", "rà soát site này", "audit nextjs project", "check Next.js conventions", or automatic invocation after `07-write-code` completes. Bilingual (VI/EN).
allowed-tools: Read, Glob, Grep
---

# Review — Code (Next.js)

## Purpose
Per-file code review for a Next.js landing-site project. Different from `review/architecture` (structural) and `review/performance/nextjs` (numbers). This skill checks line-level adherence to Next.js + build-website conventions.

## When invoked
- After `07-write-code` completes (automatic, via the tail-call chain)
- User says "review code", "rà soát site này", "check Next.js conventions"
- Before merging a feature branch

## Conventions checked (mapped to sub-skill that defined them)

### 1. Server vs Client component boundary (from `12-pages-and-blocks`)

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
- Critical: missing `"use client"` on file using hooks → build error
- Important: unnecessary `"use client"` bloats bundle (Server Component would suffice)

### 2. `next/image` everywhere (from `17-responsive`)

Raw `<img>` skips AVIF/WebP + sizes + LCP optimization.

Probe:
```bash
grep -rn "<img " src/ public/ 2>/dev/null
```

Severity: Critical for every `<img>` in `src/components/`, `src/app/`. Marketing `<img>` in raw HTML email templates exempt.

### 3. `generateMetadata` on every page (from `13-seo`)

Every `page.tsx` under `src/app/[locale]/` exports `generateMetadata` (async) OR `export const metadata` (static).

Probe:
```bash
find src/app -name 'page.tsx' | while read f; do
  if ! grep -qE "generateMetadata|export const metadata" "$f"; then
    echo "MISSING-META: $f"
  fi
done
```

Severity: Important per page. Critical if it's a top-level marketing page.

### 4. i18n typed `Link` from `@/i18n/routing` (from `15-i18n`)

Internal navigation MUST use typed `Link` (re-exported from `@/i18n/routing`), NOT `next/link` directly — otherwise locale prefix is lost.

Probe:
```bash
# All `next/link` imports outside i18n config files
grep -rnE "from\s+['\"]next/link['\"]" src/ \
  | grep -v "src/i18n/" \
  | grep -v "src/middleware"
```

Severity: Critical per occurrence — produces broken URLs.

### 5. No hardcoded strings in section components (from `12-pages-and-blocks`)

Vietnamese/English literals belong in `src/content/<locale>/` or `src/i18n/messages/<locale>.json`. Components receive strings as props.

Probe:
```bash
# Vietnamese diacritics in section component files
grep -rnE "[àáâãèéêìíòóôõùúýăđĩũơưạ-ỹÀ-Ỹ]" src/components/sections/
```

Severity:
- Critical: hardcoded VI/EN in production component
- Acceptable: comments + aria-label IF they're already in i18n keys

### 6. `"use cache"` + `cacheLife` on every page (from `16-caching`)

Each `src/app/[locale]/**/page.tsx` should declare a cache strategy explicitly (default 30 min ISR per the build-website pack).

Probe:
```bash
find src/app -name 'page.tsx' | while read f; do
  if ! grep -q '"use cache"' "$f"; then
    echo "MISSING-CACHE: $f"
  fi
done
```

Severity: Important — uncached pages hit server on every request → slow + costly.

### 7. `setRequestLocale(locale)` in every `[locale]/page.tsx` (from `15-i18n`)

Required when using async server components with static rendering.

Probe:
```bash
find src/app/\[locale\] -name 'page.tsx' | while read f; do
  if ! grep -q "setRequestLocale" "$f"; then
    echo "MISSING-LOCALE-CONTEXT: $f"
  fi
done
```

Severity: Critical — runtime errors with static generation.

### 8. No `dangerouslySetInnerHTML` for user content (cross-cutting security)

Only acceptable use: rendering server-built JSON-LD (`<script type="application/ld+json">`). Any other usage flags as Critical.

Probe:
```bash
grep -rn "dangerouslySetInnerHTML" src/ | grep -vE "ld\+json|JSON\.stringify"
```

Severity: Critical (XSS risk).

### 9. Form validation via zod (from `18-contact-form`)

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

Severity: Important if the form has > 3 fields; Minor for newsletter signup (single field).

### 10. `next/font` with Vietnamese subset (from `11-theme`)

Vietnamese diacritics need explicit subset; default Latin subset produces tofu (□).

Probe:
```bash
grep -rnE "next/font|google\(.*\{" src/ | head -5
# Inspect each match — should include `subsets: [..., 'vietnamese']`
```

Severity: Critical if site is VI-primary and the subset is missing.

### 11. API routes have rate limit + zod validation (from `18-contact-form`)

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

Severity: Critical for any public POST endpoint.

### 12. Hydration-safe rendering

Common hydration bugs:
- `Date.now()` / `Math.random()` / `new Date()` in server render → different on client
- Conditional `typeof window !== 'undefined'` blocks producing different markup
- Locale-dependent date/number formatting without explicit `useFormatter()`

Probe:
```bash
grep -rnE "(Date\.now|Math\.random|new Date\(\))" src/app/ src/components/sections/
grep -rnE "typeof window" src/app/ src/components/sections/
```

Severity: Critical per occurrence (causes React 18 hydration error).

### 13. `metadataBase` set on root layout

Without `metadataBase`, OG / canonical URLs are relative and break social previews.

Probe:
```bash
grep -nE "metadataBase" src/app/layout.tsx src/lib/seo.ts
```

Severity: Important.

### 14. Bundle hygiene — no client import of server-only modules

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

Severity: Critical — server-only modules in client bundle leak secrets / break build.

## Output: Review Report

```markdown
# Code Review — <feature / branch> — <date>

## Scope
- Files reviewed: <N>
- Pages touched: <list>

## Strengths
- <2-3 bullets>

## Findings by severity

### Critical (must fix before merge)
| # | File:line | Convention violated | From skill | Fix |
|---|---|---|---|---|

### Important
| # | File:line | Convention | From skill | Fix |
|---|---|---|---|---|

### Minor
| # | File:line | Convention | From skill | Fix |
|---|---|---|---|---|

## Next action
- Critical → `orchestration/repair-loop`
- Important → user decides per finding
- Minor → batch
```

## Rules

### MUST DO
- Run all 14 probes automated; surface raw counts before manual review
- Cite the build-website sub-skill that defines each convention
- File:line for every finding
- Acknowledge strengths
- Sort by severity; stable order within same severity (file path alphabetical)

### MUST NOT
- Auto-fix — that's `orchestration/repair-loop`'s job
- Flag style preferences as Critical (e.g. arrow vs function — minor at most)
- Run when there are no Next.js files in the diff (out of scope)
- Duplicate findings from `review/architecture` (module boundaries belong there)

## Anti-patterns
- **Review every file** — focus on the changed files (`git diff`); reviewing the whole site every time is noise
- **"Add more tests" as a finding** — that belongs in `testing/` skill output, not code review
- **Linting concerns flagged as Critical** — ESLint handles those; code review focuses on conventions ESLint doesn't enforce

## Cross-references
- Architecture review (modules, layering): `review/architecture`
- Performance review: `review/performance/nextjs`
- Accessibility review: `review/accessibility/nextjs`
- Security audit (cross-cutting): `review/security/shared`
- Repair loop: `orchestration/repair-loop`
- Source conventions: `tracks/nextjs/build-website/10-init-site.md` through `19-content-quality.md`
