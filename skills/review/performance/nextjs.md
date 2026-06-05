---
name: sdcorejs-review-performance-nextjs
description: Use to audit a Next.js landing site against `review/performance/budget.md` thresholds — Core Web Vitals via Lighthouse mobile preset, bundle size via `@next/bundle-analyzer`, ISR cache hit rate, server response p50/p95, image optimization, font loading. Outputs Critical/Important/Minor findings tied to specific files / chunks. Triggers - "performance audit nextjs", "site chậm trên mobile", "Lighthouse fail", "Core Web Vitals", "bundle quá to", "perf check before launch", or invocation after a perf regression report. Bilingual (VI/EN).
allowed-tools: Read, Bash, Glob, Grep
---

# Review — Performance (Next.js)

## Purpose
Concrete numeric audit against the `review/performance/budget.md` thresholds, with Next.js-specific bottlenecks called out (route chunking, image strategy, ISR hit rate, font loading). Run before launch + after each major feature.

Prerequisites:
- Site builds successfully (`npm run build`)
- Either a staging URL OR `npm run start` runs locally on port 3000

## When invoked
- Pre-launch performance gate
- User says "Lighthouse fail", "site chậm", "bundle quá to", "Core Web Vitals"
- After adding new images, third-party scripts, or new pages

## Probe suite

### Probe 1 — Lighthouse mobile

```bash
URL="${E2E_BASE_URL:-http://localhost:3000}"

npx --yes lighthouse "$URL" \
  --preset=mobile \
  --only-categories=performance,best-practices \
  --quiet --chrome-flags="--headless" \
  --output=json --output-path=/tmp/lh-nextjs.json

node -e "
const r = require('/tmp/lh-nextjs.json');
const cat = r.categories;
const aud = r.audits;
console.log({
  performance: Math.round(cat.performance.score * 100),
  bestPractices: Math.round(cat['best-practices'].score * 100),
  lcp_ms: Math.round(aud['largest-contentful-paint'].numericValue),
  fcp_ms: Math.round(aud['first-contentful-paint'].numericValue),
  cls: aud['cumulative-layout-shift'].numericValue.toFixed(3),
  tbt_ms: Math.round(aud['total-blocking-time'].numericValue),
  ttfb_ms: Math.round(aud['server-response-time'].numericValue),
  totalByteWeight_kb: Math.round(aud['total-byte-weight'].numericValue / 1024),
});
"
```

Run against:
- `/vi` (home — typical hero + sections)
- `/vi/san-pham` (longest page — most content)
- `/vi/lien-he` (form page — interactive)

Failure thresholds: Performance < 90, LCP > 2500ms, CLS > 0.1, TBT > 200ms — Critical per page.

### Probe 2 — Bundle size

Install `@next/bundle-analyzer`:
```bash
npm install -D @next/bundle-analyzer
```

`next.config.ts`:
```typescript
import withBundleAnalyzer from '@next/bundle-analyzer';
const config = { /* existing */ };
export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(config);
```

Run:
```bash
ANALYZE=true npm run build
# Inspect .next/analyze/client.html + nodejs.html
```

Programmatic check on chunk sizes:
```bash
# Per-route initial JS (gzipped)
find .next/static/chunks/app -name '*.js' -not -name '*main*' -not -name '*polyfills*' | while read f; do
  raw=$(stat -c%s "$f" 2>/dev/null || stat -f%z "$f")
  gz=$(gzip -c "$f" | wc -c)
  echo "$(basename $f): ${raw}B raw, ${gz}B gz"
done | sort -t: -k2 -n -r | head -10
```

Per-route budget (from `review/performance/budget.md`):
- Initial JS ≤ 170 KB gz
- Per-route lazy ≤ 50 KB gz
- Total JS ≤ 500 KB gz

Critical if any route initial > 250 KB gz.

### Probe 3 — Image optimization

```bash
# All raster images in public/ + their sizes
find public -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -exec ls -lh {} \; | sort -rh -k5 | head -10

# Hero images > 500 KB → Critical (next/image WILL serve smaller but only after CDN cache warms)
# All images using next/image (probed via grep)
grep -rE "from\s+['\"]next/image['\"]" src/ | wc -l
grep -rnE "<img " src/ | head -10  # any raw <img> = Critical
```

### Probe 4 — Font loading

```bash
# next/font configured with subsets including vietnamese
grep -nE "subsets:" src/app/layout.tsx src/config/theme.ts 2>/dev/null
# 'vietnamese' present? otherwise diacritics = tofu

# display: 'swap' to avoid FOIT
grep -nE "display:\s*['\"]swap['\"]" src/app/layout.tsx
```

### Probe 5 — ISR / cache strategy

Each page should declare `"use cache"` + `cacheLife({ revalidate: 1800 })` (default from the `caching` pack).

```bash
find src/app -name 'page.tsx' | while read f; do
  hasUseCache=$(grep -c '"use cache"' "$f")
  hasLife=$(grep -c 'cacheLife' "$f")
  echo "$f: use cache=$hasUseCache life=$hasLife"
done
```

Severity:
- Important: page without `"use cache"` (rebuilds on every request)
- Minor: page with non-default revalidate (intentional but worth flagging)

### Probe 6 — Third-party script weight

```bash
# Direct third-party scripts in app
grep -rnE "<script\s+(async\s+)?src=\"https?://" src/ 2>/dev/null

# Analytics tags (GTM, GA4, Plausible) — should use `next/script` with strategy="afterInteractive"
grep -rnE "from\s+['\"]next/script['\"]" src/
```

Severity:
- Important: third-party `<script>` without `next/script` wrapper (blocks main thread)
- Critical: synchronous third-party script (no `async`/`defer`)

### Probe 7 — Server response time

If staging URL available:
```bash
# Quick p50/p95 sample (autocannon)
npx --yes autocannon -d 30 -c 10 "$URL/vi" --renderStatusCodes --no-progress 2>&1 | tail -20

# Per the budget:
# p50 ≤ 150 ms uncached
# p95 ≤ 400 ms
# p99 ≤ 800 ms
```

## Output: Performance Audit Report

```markdown
# Performance Audit — <url> — <date>

## Lighthouse summary
| Page | Perf | LCP | CLS | TBT | TTFB |
|---|---|---|---|---|---|
| /vi | 87 | 2900ms | 0.05 | 380ms | 720ms |
| /vi/san-pham | 91 | 2400ms | 0.02 | 150ms | 680ms |

## Bundle summary
- Initial JS / | : 195 KB gz (over 170 KB target) ❌
- Initial JS / /san-pham: 210 KB gz ❌
- Total JS: 470 KB gz ✓
- Largest single chunk: vendor.js 95 KB gz (next, react, framework)

## Findings

### Critical
| # | Probe | Issue | Fix |
|---|---|---|---|
| C-1 | LCP | /vi LCP 2900ms (target ≤ 2500ms) — hero image is 850 KB JPG | Compress to WebP, add `priority`; consider `sizes="100vw"` |
| C-2 | Bundle | `lodash` full import in `lib/utils.ts` adds 70 KB | Import only `lodash-es/debounce` or remove |

### Important
| # | Probe | Issue | Fix |
|---|---|---|---|
| I-1 | Cache | `/vi/blog/[slug]` page missing `"use cache"` | Add directive + `cacheLife({ revalidate: 3600 })` |
| I-2 | Script | GTM loaded synchronously in layout.tsx | Wrap in `next/script` strategy="afterInteractive" |

### Minor
| # | ... | ... |
```

## Rules

### MUST DO
- Run probes against PRODUCTION BUILD (`npm run start`), not dev — dev mode hides perf issues
- Run on mobile preset — landing-site traffic is mobile-heavy
- Per-page metrics, not aggregate — averages hide regressions
- Include TTFB — Vercel/hosting issue vs app issue is the most common confusion
- Cite the budget threshold next to the measurement

### MUST NOT
- Trust dev mode Lighthouse — always production build
- Use desktop Lighthouse only — misleading scores
- Report % improvements without baseline — "30% faster" means nothing without numbers
- Aggregate findings across pages — Critical on `/admin/preview` is different from Critical on `/`

## Anti-patterns

- **Lighthouse 95+ on desktop, 60 on mobile, shipped** — landing-site users are 70%+ mobile
- **One mega-chunk for all routes** — defeats route-based code splitting; each page should have its own chunk
- **`priority` on every image** — defeats lazy loading; one per page (hero only)
- **Hero image 2000px wide, 500 KB** — next/image will optimize but CDN cache miss is still slow on first visitor
- **Third-party scripts in `<head>`** — block first paint; always defer or use `next/script`
- **No ISR on content-heavy pages** — every request hits Next.js → slow + costly

## Cross-references
- Budget definition: `review/performance/budget.md`
- Caching strategy: `_refs/nextjs/build-website/write-code/caching.md`
- Image optimization: `_refs/nextjs/build-website/write-code/responsive.md`
- Repair loop: `orchestration/repair-loop`
- Verification gate: `orchestration/verify-before-done` runs these probes as criteria
