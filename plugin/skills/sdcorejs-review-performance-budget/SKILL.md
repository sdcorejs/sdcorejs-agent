---
name: sdcorejs-review-performance-budget
description: Cross-track performance budget. Defines numeric thresholds per concern (frontend bundle size, Core Web Vitals, API response time, DB query time, memory footprint) and the verification commands that check them. Stack-specific skills (`review/performance/<stack>.md`) inherit these budgets and add stack-specific probes. Triggers - "performance budget", "site chậm quá", "API timeout", "Lighthouse score thấp", "Core Web Vitals", "set up performance gates", or invocation by any stack-specific performance review skill. Bilingual (VI/EN).
allowed-tools: Read, Bash
---

# Review — Performance Budget (Cross-Track)

## Purpose
"Slow" is subjective until you set numbers. This skill ships the numbers + the commands to measure them. Stack-specific performance skills (`review/performance/angular-portal.md`, `nextjs.md`, `nestjs.md`) reference these budgets and add probes that match the stack's bottlenecks.

A budget that no one checks is just a wish. Pair every threshold with a verifier command + a hook (CI, `verify-before-done`, or release checklist).

## When invoked
- Setting up a new project's perf gates (early — before bad habits set in)
- User says "performance budget", "set perf thresholds", "site chậm quá"
- Before a release — gate against regressions
- After a perf regression is reported — anchor the conversation in numbers, not feelings

## Universal budgets (apply to every stack)

### 1. Page load (Core Web Vitals — frontend)
Measured via Lighthouse / WebPageTest / real-user monitoring.

| Metric | Target (Good) | Threshold (Needs improvement) | Hard fail (Poor) |
|---|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2.5 s | 2.5–4.0 s | > 4.0 s |
| **INP** (Interaction to Next Paint) | ≤ 200 ms | 200–500 ms | > 500 ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1–0.25 | > 0.25 |
| **TTFB** (Time to First Byte) | ≤ 600 ms | 600–1500 ms | > 1500 ms |
| Lighthouse Performance score (mobile, throttled) | ≥ 90 | 70–89 | < 70 |

Measured under: Lighthouse "Mobile" preset (Slow 4G, 4× CPU throttle). Desktop scores are easy and misleading.

Verifier:
```bash
npx --yes lighthouse "$URL" \
  --preset=mobile --quiet --chrome-flags="--headless" \
  --output=json --output-path=/tmp/lh.json

node -e "
const r = require('/tmp/lh.json');
const perf = Math.round(r.categories.performance.score * 100);
const lcp = r.audits['largest-contentful-paint'].numericValue;
const cls = r.audits['cumulative-layout-shift'].numericValue;
const tbt = r.audits['total-blocking-time'].numericValue;
console.log({ perf, lcp_ms: Math.round(lcp), cls: cls.toFixed(3), tbt_ms: Math.round(tbt) });
"
```

### 2. Bundle size (frontend ship size)

| Concern | Target | Hard fail |
|---|---|---|
| Initial JS (gzipped, route 1) | ≤ 170 KB | > 250 KB |
| Initial CSS (gzipped) | ≤ 30 KB | > 60 KB |
| Total JS across all routes (gzipped) | ≤ 500 KB | > 800 KB |
| Per-route additional JS (lazy chunk) | ≤ 50 KB gzipped | > 100 KB |
| Image asset (LCP candidate) | ≤ 200 KB | > 500 KB |
| Single npm package contributing > 20% of total bundle | flag | flag |

Verifier (per stack — Angular has `source-map-explorer`, Next.js has `@next/bundle-analyzer`):
```bash
# Universal: read build output for bundle sizes
ls -lh dist/ .next/static/chunks/ 2>/dev/null | sort -rh -k5 | head -10
```

### 3. API response time (backend)

| Concern | Target | Threshold | Hard fail |
|---|---|---|---|
| p50 server response (cached) | ≤ 50 ms | 50–150 ms | > 200 ms |
| p50 server response (uncached, normal load) | ≤ 150 ms | 150–400 ms | > 500 ms |
| p95 server response | ≤ 400 ms | 400–800 ms | > 1000 ms |
| p99 server response | ≤ 800 ms | 800–2000 ms | > 2000 ms |

Verifier: load test with `autocannon` / `k6` / `wrk`:
```bash
npx --yes autocannon -d 30 -c 10 "$URL"
# Or k6:
# k6 run --vus 10 --duration 30s script.js
```

### 4. Database query time

| Concern | Target | Hard fail |
|---|---|---|
| Single-row lookup (`findById`) | ≤ 5 ms | > 50 ms |
| Indexed range query (paged list) | ≤ 30 ms | > 200 ms |
| Full-text search | ≤ 100 ms | > 500 ms |
| Migration on prod-sized table | ≤ 60 s (with strategy doc) | > 5 min |
| N+1 query in any code path | **0 instances** | any > 0 |

N+1 is the silent killer. Probe with query log + count of queries per request:
```bash
# Enable query logging in dev env
# Hit a list endpoint, count queries
psql -c "ALTER SYSTEM SET log_min_duration_statement = 0;"
# Then in your test harness: assert query count
```

### 5. Memory footprint

| Concern | Target | Hard fail |
|---|---|---|
| Node.js server steady-state RSS | ≤ 200 MB | > 800 MB (leak suspected) |
| Memory growth over 24 h | ≤ 10% | > 30% (leak confirmed) |
| Single request peak memory | ≤ 50 MB | > 200 MB |
| Browser tab memory (10 min session) | ≤ 100 MB | > 300 MB |

Verifier (Node):
```bash
# Sample RSS over time during load test
while sleep 5; do ps -o rss= -p $PID; done | tee /tmp/rss.log
```

## How to wire into CI / verify-before-done

For each budget, define an acceptance criterion in the feature spec:

```markdown
## Acceptance criteria
- Lighthouse Performance score ≥ 90 on /products (mobile preset)
- p95 server response for GET /api/products < 400 ms under 10-VU 30s test
- Bundle size for /products route < 170 KB gzipped
- Zero N+1 queries in product list endpoint
```

`orchestration/verify-before-done` then auto-runs each verifier and blocks "done" if any budget fails.

## Anti-patterns

- **Budget set after the fact** — defines what current code already does as "the target"; useless for catching regressions
- **One global budget for all routes** — `/` (hero + images) and `/admin/settings` (data tables) have wildly different floors
- **Optimising p50 only** — p99 is what your worst-served user feels
- **Bundle budget without per-route breakdown** — total stays flat while one route explodes
- **CI gate without local repro command** — devs can't debug what they can't reproduce
- **Treating Lighthouse score as the only metric** — Lighthouse simulates one device; real-user monitoring (RUM) is ground truth
- **Budget defined in `kB` ambiguously** — always specify gzipped vs raw, mobile vs desktop, throttled vs unthrottled

## Cross-references
- Stack-specific perf checks: `review/performance/<stack>.md`
- Caching strategy that often resolves perf findings: track-specific (e.g. `tracks/nextjs/build-website/16-caching.md`)
- Acceptance verification: `orchestration/verify-before-done` runs the budget verifiers as automatable criteria
- Architecture review for structural perf issues (god-function, N+1): `review/architecture`
