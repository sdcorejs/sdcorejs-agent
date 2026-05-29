---
name: sdcorejs-review-performance-angular-portal
description: Use to audit Angular portal performance against `review/performance/budget.md` thresholds — initial bundle size, lazy-route chunks, change detection efficiency, RxJS subscription leaks, memory growth, render-blocking, OnPush adoption. Outputs Critical/Important/Minor findings with file:line. Triggers - "portal chậm", "Angular performance", "bundle quá to", "memory leak", "change detection loop", or invocation pre-release. Bilingual (VI/EN).
allowed-tools: Read, Bash, Glob, Grep
---

# Review — Performance (Angular Portal)

## Purpose
Angular portals have stack-specific bottlenecks that don't apply elsewhere — change detection cycles, large initial bundle, RxJS subscription leaks, the cost of `*ngFor` without `trackBy`. This skill audits against `review/performance/budget.md` plus Angular-specific probes.

## When invoked
- Pre-release perf gate
- User says "portal chậm", "load chậm", "stuck UI", "memory leak"
- After adding new modules / shared components

## Probe suite

### Probe 1 — Bundle analysis

```bash
# Build production
npm run build -- --configuration=production --stats-json

# Analyze with source-map-explorer
npx --yes source-map-explorer dist/**/main*.js > /tmp/bundle-map.txt
# Or webpack-bundle-analyzer
npx --yes webpack-bundle-analyzer dist/**/*.json
```

Per-route lazy chunks should each be ≤ 100 KB gzipped. Main bundle ≤ 250 KB gzipped. These are the **sanctioned Angular Portal overrides** of the universal budget (see "Per-track exceptions" in `review/performance/budget.md`) — portals ship `@angular/core` + `@angular/cdk` + RxJS + `@sd-angular/core`, run on desktop behind auth, and aren't SEO-indexed.

Severity:
- Critical: main bundle > 400 KB gz
- Critical: any lazy chunk > 200 KB gz (probably eager-imported something heavy)
- Important: single npm package contributing > 25% of a chunk

### Probe 2 — OnPush adoption

`ChangeDetectionStrategy.OnPush` cuts change-detection time dramatically. Standard Core UI pattern is OnPush.

```bash
# Count components using OnPush vs default
total=$(grep -rl "@Component" src/libs/ | wc -l)
onpush=$(grep -rl "ChangeDetectionStrategy.OnPush" src/libs/ | wc -l)
echo "OnPush: $onpush / $total ($(( onpush * 100 / total ))%)"
```

Target: ≥ 80% of components use OnPush. Below = Important finding with file list.

### Probe 3 — `trackBy` on `*ngFor`

```bash
# Find ngFor without trackBy
grep -rnE "\*ngFor=\"let" src/libs/*/features/*/pages/ | grep -v trackBy
```

Severity:
- Important per `*ngFor` over ≥ 10 items without `trackBy`
- Minor per `*ngFor` over ≤ 10 items (negligible perf hit)

### Probe 4 — RxJS subscription hygiene

Leaked subscriptions = memory leaks + duplicate-handler bugs.

```bash
# Find .subscribe( calls in components
grep -rnE "\.subscribe\s*\(" src/libs/*/features/*/pages/ | head -20

# For each, the file should either:
# - use takeUntilDestroyed() (Angular 16+ recommended)
# - use async pipe (no manual subscribe)
# - track subscriptions and unsubscribe in ngOnDestroy
grep -rnE "takeUntilDestroyed|async\s+\|" src/libs/
```

Severity: Critical per `.subscribe()` in component that doesn't have `takeUntilDestroyed` / `unsubscribe` / `async pipe`.

### Probe 5 — Heavy operators inside template

```bash
# Functions called inside templates re-run on EVERY change detection cycle
grep -rnE "\{\{.*\(.*\)" src/libs/*/features/*/pages/*.html
# Each function call in template is a perf liability — should be precomputed via pipe or memoized
```

Severity: Important per function call inside a template binding (especially if the component is OnPush, the function will run, and if it returns a new object reference each call, it forces re-render).

### Probe 6 — Image optimization

Portals less image-heavy than landing sites but still relevant for product catalogs:

```bash
# Find raw <img> tags
grep -rnE "<img " src/libs/ | head -10
# Each should use Angular's NgOptimizedImage (introduced 14.2+) for above-the-fold images
grep -rnE "NgOptimizedImage|ngSrc" src/libs/
```

Severity: Important — at minimum the user avatar / brand logos should use NgOptimizedImage.

### Probe 7 — Initial paint time

Run Lighthouse against the portal:

```bash
URL="${PORTAL_URL:-http://localhost:4200}"
npx --yes lighthouse "$URL" --only-categories=performance --quiet \
  --chrome-flags="--headless" --output=json --output-path=/tmp/lh-portal.json

node -e "
const r = require('/tmp/lh-portal.json');
const a = r.audits;
console.log({
  perf: Math.round(r.categories.performance.score * 100),
  fcp_ms: Math.round(a['first-contentful-paint'].numericValue),
  lcp_ms: Math.round(a['largest-contentful-paint'].numericValue),
  tbt_ms: Math.round(a['total-blocking-time'].numericValue),
  ttfb_ms: Math.round(a['server-response-time'].numericValue),
});
"
```

Targets (sanctioned Angular Portal override of the universal mobile budget — see "Per-track exceptions" in `review/performance/budget.md`):
- Performance ≥ 80 on desktop preset
- LCP ≤ 3.5 s
- TBT ≤ 400 ms

### Probe 8 — Lazy loading boundaries

Every feature module should be lazy-loaded except the shell.

```bash
# Routes that import a component statically (vs lazy `loadChildren`)
grep -rnE "component:" src/app/app.routes.ts src/libs/*/routes.ts
grep -rnE "loadChildren:" src/app/app.routes.ts src/libs/*/routes.ts
```

Ratio should be loadChildren-heavy. Static component imports at top-level routes → Important finding.

### Probe 9 — Service worker / caching

If portal targets offline / repeat-visit performance, check service worker config.

```bash
grep -rl "ngsw-config" .
# If present, audit cache-strategy per resource group
```

Severity: Minor — most internal portals don't need SW; flag missing only if spec requires offline.

### Probe 10 — Change detection profiling

Manual check: open DevTools → Performance, record while interacting with list page. Look for:
- Excessive `Tick()` calls (Angular change detection runs)
- Long tasks > 50 ms in component render

Severity: depends on findings — Critical if 200+ ms tasks block UI; Important for 50-200 ms.

## Output

```markdown
# Performance Audit (Angular) — <portal> — <date>

## Bundle summary
| Chunk | Raw | Gzip | Budget | Status |
|---|---|---|---|---|
| main | 850 KB | 280 KB | ≤ 250 KB | ❌ over |
| catalog (lazy) | 320 KB | 110 KB | ≤ 100 KB | ⚠️ borderline |
| auth (lazy) | 80 KB | 28 KB | ≤ 100 KB | ✓ |

## OnPush adoption
- 42 / 58 components (72%) — target 80% — `<file list of default-strategy components>`

## RxJS hygiene
- 6 `.subscribe()` calls without `takeUntilDestroyed` — leak risk

## Findings

### Critical
| # | Probe | Issue | Fix |
|---|---|---|---|
| C-1 | Bundle | main bundle 280 KB gz, over 250 KB budget. `lodash` full import accounts for 70 KB | Switch to `lodash-es` named imports; tree-shaking will eliminate unused |
| C-2 | RxJS | `product-list.component.ts:42` subscribes to `service.search()` without unsubscribe — leak on route change | Add `takeUntilDestroyed(this.destroyRef)` or convert to `async` pipe |

### Important
| # | ... | ... |

### Minor
| # | ... | ... |
```

## Rules

### MUST DO
- Run probes against PRODUCTION build (`ng build --configuration=production`), not dev
- Per-component analysis for OnPush + trackBy; aggregate ratios are misleading
- Cite the budget threshold next to each measurement
- Use Angular DevTools (browser extension) for change detection profiling

### MUST NOT
- Trust dev-mode bundle sizes — they include source maps + HMR + un-minified code
- Audit memory in dev mode — HMR retains stale closures
- Optimise prematurely — measure first, then fix the top 3, then re-measure

## Anti-patterns
- **Pre-loading every lazy module** — defeats lazy loading; only pre-load high-probability next routes
- **`ChangeDetectionStrategy.Default` everywhere + manual `cdr.detectChanges()`** — opt-out then re-trigger manually; OnPush + signals is cleaner
- **Eager-loading icon set** (full `material-icons` 200 KB) — use tree-shakeable icon library
- **Pipe with side effects** — pipes should be pure; non-pure pipes cause re-runs every CD cycle
- **`*ngFor` over 1000 items without virtual scroll** — use `cdk-virtual-scroll-viewport`
- **Storing observables in template (no async pipe)** — manual subscribe leaks

## Cross-references
- Budget thresholds: `review/performance/budget.md`
- Core UI patterns that affect perf: `_refs/angular-portal/sd-angular-core-catalog.md`
- Repair loop: `orchestration/repair-loop`
- Verification: `orchestration/verify-before-done` runs probes as criteria

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
