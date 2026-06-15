# Review-Performance Knowledge — Angular Portal

> Track-specific probes loaded on demand by `sdcorejs-review` when the
> project is an Angular portal (`angular.json` + `@sdcorejs/angular`), AFTER the
> cross-track budget in `_refs/shared/review-performance.md`. Not a dispatchable
> skill — no frontmatter. Output format owned by the parent skill. All numeric
> budget thresholds live in the shared ref; the Angular Portal **sanctioned
> overrides** (heavier framework baseline, desktop-behind-auth) are in that ref's
> "Per-track exceptions".

Angular portals have stack-specific bottlenecks that don't apply elsewhere — change-detection cycles, large initial bundle, RxJS subscription leaks, the cost of `*ngFor` without `trackBy`. Audit against the shared budget plus these probes. Run against a PRODUCTION build (`ng build --configuration=production`), never dev.

## AG-P1: Bundle analysis

```bash
# Build production
npm run build -- --configuration=production --stats-json

# Analyze with source-map-explorer
npx --yes source-map-explorer dist/**/main*.js > /tmp/bundle-map.txt
# Or webpack-bundle-analyzer
npx --yes webpack-bundle-analyzer dist/**/*.json
```

Per-route lazy chunks should each be ≤ 100 KB gzipped. Main bundle ≤ 250 KB gzipped. These are the **sanctioned Angular Portal overrides** of the universal budget (see "Per-track exceptions" in `_refs/shared/review-performance.md`) — portals ship `@angular/core` + `@angular/cdk` + RxJS + `@sdcorejs/angular`, run on desktop behind auth, and aren't SEO-indexed.

Severity:
- **Critical**: main bundle > 400 KB gz
- **Critical**: any lazy chunk > 200 KB gz (probably eager-imported something heavy)
- **Important**: single npm package contributing > 25% of a chunk

## AG-P2: OnPush adoption

`ChangeDetectionStrategy.OnPush` cuts change-detection time dramatically. Standard Core UI pattern is OnPush.

```bash
# Count components using OnPush vs default
total=$(grep -rl "@Component" src/libs/ | wc -l)
onpush=$(grep -rl "ChangeDetectionStrategy.OnPush" src/libs/ | wc -l)
echo "OnPush: $onpush / $total ($(( onpush * 100 / total ))%)"
```

Target: ≥ 80% of components use OnPush. Below = **Important** finding with file list.

## AG-P3: `trackBy` on `*ngFor`

```bash
# Find ngFor without trackBy
grep -rnE "\*ngFor=\"let" src/libs/*/features/*/pages/ | grep -v trackBy
```

Severity:
- **Important** per `*ngFor` over ≥ 10 items without `trackBy`
- **Minor** per `*ngFor` over ≤ 10 items (negligible perf hit)

## AG-P4: RxJS subscription hygiene

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

Severity: **Critical** per `.subscribe()` in component that doesn't have `takeUntilDestroyed` / `unsubscribe` / `async pipe`.

## AG-P5: Heavy operators inside template

```bash
# Functions called inside templates re-run on EVERY change detection cycle
grep -rnE "\{\{.*\(.*\)" src/libs/*/features/*/pages/*.html
# Each function call in template is a perf liability — should be precomputed via pipe or memoized
```

Severity: **Important** per function call inside a template binding (especially if the component is OnPush, the function will run, and if it returns a new object reference each call, it forces re-render).

## AG-P6: Image optimization

Portals are less image-heavy than landing sites but still relevant for product catalogs:

```bash
# Find raw <img> tags
grep -rnE "<img " src/libs/ | head -10
# Each should use Angular's NgOptimizedImage (introduced 14.2+) for above-the-fold images
grep -rnE "NgOptimizedImage|ngSrc" src/libs/
```

Severity: **Important** — at minimum the user avatar / brand logos should use NgOptimizedImage.

## AG-P7: Initial paint time

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

Targets (sanctioned Angular Portal override of the universal mobile budget — see "Per-track exceptions" in `_refs/shared/review-performance.md`):
- Performance ≥ 80 on desktop preset
- LCP ≤ 3.5 s
- TBT ≤ 400 ms

## AG-P8: Lazy loading boundaries

Every feature module should be lazy-loaded except the shell.

```bash
# Routes that import a component statically (vs lazy `loadChildren`)
grep -rnE "component:" src/app/app.routes.ts src/libs/*/routes.ts
grep -rnE "loadChildren:" src/app/app.routes.ts src/libs/*/routes.ts
```

Ratio should be loadChildren-heavy. Static component imports at top-level routes → **Important** finding.

## AG-P9: Service worker / caching

If portal targets offline / repeat-visit performance, check service worker config.

```bash
grep -rl "ngsw-config" .
# If present, audit cache-strategy per resource group
```

Severity: **Minor** — most internal portals don't need SW; flag missing only if spec requires offline.

## AG-P10: Change detection profiling

Manual check: open DevTools → Performance, record while interacting with the list page. Look for:
- Excessive `Tick()` calls (Angular change detection runs)
- Long tasks > 50 ms in component render

Severity: depends on findings — **Critical** if 200+ ms tasks block UI; **Important** for 50–200 ms.

## Manual audit (cannot automate)
- [ ] Use Angular DevTools (browser extension) for change-detection profiling under interaction
- [ ] Memory growth over a 10-min session stays under budget (profile in a production build, not dev — HMR retains stale closures)
- [ ] Per-component OnPush + trackBy verified by reading, not just aggregate ratios
- [ ] After fixing the top 3 findings, re-measure (don't assume)

## Anti-patterns
- **Pre-loading every lazy module** — defeats lazy loading; only pre-load high-probability next routes
- **`ChangeDetectionStrategy.Default` everywhere + manual `cdr.detectChanges()`** — opt-out then re-trigger manually; OnPush + signals is cleaner
- **Eager-loading icon set** (full `material-icons` 200 KB) — use tree-shakeable icon library
- **Pipe with side effects** — pipes should be pure; non-pure pipes cause re-runs every CD cycle
- **`*ngFor` over 1000 items without virtual scroll** — use `cdk-virtual-scroll-viewport`
- **Storing observables in template (no async pipe)** — manual subscribe leaks
- **Trusting dev-mode bundle sizes** — they include source maps + HMR + un-minified code

## Cross-references
- Budget thresholds: `_refs/shared/review-performance.md`
- Core UI patterns that affect perf: fetch on-demand (not committed) via `node _refs/angular/core-docs-fetch.mjs --list` (or `--print sd-<name>` for one component)
- Code review (correctness overlap): `sdcorejs-review` · Repair loop: `orchestration/repair-loop`
- Verification: `orchestration/verify-before-done` runs probes as criteria
