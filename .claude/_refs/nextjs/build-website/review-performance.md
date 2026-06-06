# Review-Performance Knowledge — Next.js (build-website)

> Track-specific probes loaded on demand by `sdcorejs-review` when the
> project is a Next.js site (`next.config.*` + `next` dep), AFTER the cross-track
> budget in `_refs/shared/review-performance.md`. Not a dispatchable skill — no
> frontmatter. Output format owned by the parent skill. All numeric budget thresholds
> live in the shared ref; the build-website profile uses the universal budgets
> verbatim (≥ 90 mobile Lighthouse, ≤ 170 KB initial JS, LCP ≤ 2.5 s).

Concrete numeric audit against the shared budget thresholds, with Next.js-specific bottlenecks called out (route chunking, image strategy, ISR hit rate, font loading). Run before launch + after each major feature.

Prerequisites:
- Site builds successfully (`npm run build`)
- Either a staging URL OR `npm run start` runs locally on port 3000 (NEVER audit dev mode)

## NX-P1: Lighthouse mobile

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

Failure thresholds (from budget): Performance < 90, LCP > 2500ms, CLS > 0.1, TBT > 200ms — **Critical** per page.

## NX-P2: Bundle size

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

Per-route budget (from `_refs/shared/review-performance.md`):
- Initial JS ≤ 170 KB gz
- Per-route lazy ≤ 50 KB gz
- Total JS ≤ 500 KB gz

**Critical** if any route initial > 250 KB gz.

## NX-P3: Image optimization

```bash
# All raster images in public/ + their sizes
find public -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -exec ls -lh {} \; | sort -rh -k5 | head -10

# Hero images > 500 KB → Critical (next/image WILL serve smaller but only after CDN cache warms)
# All images using next/image (probed via grep)
grep -rE "from\s+['\"]next/image['\"]" src/ | wc -l
grep -rnE "<img " src/ | head -10  # any raw <img> = Critical
```

Severity:
- **Critical**: hero image > 500 KB, or any raw `<img>` (skips next/image optimization)
- **Important**: above-the-fold image without `priority`

## NX-P4: Font loading

```bash
# next/font configured with subsets including vietnamese
grep -nE "subsets:" src/app/layout.tsx src/config/theme.ts 2>/dev/null
# 'vietnamese' present? otherwise diacritics = tofu

# display: 'swap' to avoid FOIT
grep -nE "display:\s*['\"]swap['\"]" src/app/layout.tsx
```

Severity:
- **Important**: missing `vietnamese` subset (diacritics render as tofu) or missing `display: 'swap'` (FOIT — flash of invisible text)

## NX-P5: ISR / cache strategy

Each page should declare `"use cache"` + `cacheLife({ revalidate: 1800 })` (default from the `caching` pack).

```bash
find src/app -name 'page.tsx' | while read f; do
  hasUseCache=$(grep -c '"use cache"' "$f")
  hasLife=$(grep -c 'cacheLife' "$f")
  echo "$f: use cache=$hasUseCache life=$hasLife"
done
```

Severity:
- **Important**: page without `"use cache"` (rebuilds on every request)
- **Minor**: page with non-default revalidate (intentional but worth flagging)

## NX-P6: Third-party script weight

```bash
# Direct third-party scripts in app
grep -rnE "<script\s+(async\s+)?src=\"https?://" src/ 2>/dev/null

# Analytics tags (GTM, GA4, Plausible) — should use `next/script` with strategy="afterInteractive"
grep -rnE "from\s+['\"]next/script['\"]" src/
```

Severity:
- **Important**: third-party `<script>` without `next/script` wrapper (blocks main thread)
- **Critical**: synchronous third-party script (no `async`/`defer`)

## NX-P7: Server response time

If staging URL available:
```bash
# Quick p50/p95 sample (autocannon)
npx --yes autocannon -d 30 -c 10 "$URL/vi" --renderStatusCodes --no-progress 2>&1 | tail -20

# Per the budget:
# p50 ≤ 150 ms uncached
# p95 ≤ 400 ms
# p99 ≤ 800 ms
```

## Manual audit (cannot automate)
- [ ] Run on mobile preset — landing-site traffic is 70%+ mobile; desktop-only scores mislead
- [ ] Per-page metrics, never aggregate — a Critical on `/admin/preview` differs from one on `/`
- [ ] Include TTFB — distinguishes a Vercel/hosting issue from an app issue (the most common confusion)
- [ ] First-visitor CDN cache miss on hero image is still slow even if next/image optimizes — warm the cache or pre-size

## Anti-patterns
- **Lighthouse 95+ on desktop, 60 on mobile, shipped** — landing-site users are 70%+ mobile
- **One mega-chunk for all routes** — defeats route-based code splitting; each page should have its own chunk
- **`priority` on every image** — defeats lazy loading; one per page (hero only)
- **Hero image 2000px wide, 500 KB** — next/image will optimize but CDN cache miss is still slow on first visitor
- **Third-party scripts in `<head>`** — block first paint; always defer or use `next/script`
- **No ISR on content-heavy pages** — every request hits Next.js → slow + costly
- **Trusting dev-mode Lighthouse** — always a production build (`npm run start`)

## Cross-references
- Budget definition: `_refs/shared/review-performance.md`
- Caching strategy: `_refs/nextjs/build-website/write-code/caching.md` · Image optimization: `_refs/nextjs/build-website/write-code/responsive.md`
- Repair loop: `orchestration/repair-loop` · Verification gate: `orchestration/verify-before-done` runs these probes as criteria
