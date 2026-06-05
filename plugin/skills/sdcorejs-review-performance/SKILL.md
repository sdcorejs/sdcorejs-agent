---
name: sdcorejs-review-performance
description: Single entry point for a performance review/audit across every SDCoreJS track. Auto-detects the stack from the directory architecture (Angular portal · NestJS · Next.js), runs the cross-track budget from `_refs/shared/review-performance.md`, then deepens with the stack probes in `_refs/<track>/review-performance.md` (bundle size, Core Web Vitals/Lighthouse, change detection, RxJS leaks, N+1 queries, missing indexes, slow queries, connection pool, ISR cache, image/font loading, memory growth). Outputs a color-coded 🔴 Critical / 🟡 Important / 🔵 Minor report with file:line + breached budget + Fix, plus Passed + manual-audit lists. Read-only — never edits. Triggers - "review hiệu năng", "performance audit", "perf", "bundle size", "bundle quá to", "slow query", "lighthouse", "Core Web Vitals", "N+1", "site chậm", "BE chậm", "API timeout", "memory leak", or pre-release / post-regression gate. Applies to angular, nestjs, nextjs. Bilingual (VI/EN).
allowed-tools: Read, Grep, Glob, Bash
---

# Review — Performance (unified, track-aware)

## Purpose
One skill, every stack. "Slow" is subjective until you set numbers — this skill
ships the budget numbers, the commands that measure them, and the stack-specific
probes that find the cause. **Read-only** — surfaces issues a human (or
`orchestration/repair-loop`) should fix; never edits. Not a substitute for
sustained load testing or real-user monitoring (RUM).

This skill replaces the previous `sdcorejs-review-performance-{budget,angular,nestjs,nextjs}`
skills. The cross-track budget + each stack's probes now live as reference docs
loaded on demand; the dispatch surface and output format are unified here.

## When to use
- Before tagging a release that touches a hot path / large feature
- After adding modules, shared components, images, third-party scripts, or new pages
- After a load test reveals a p95 / p99 regression or a perf regression is reported
- User says "review hiệu năng", "performance audit", "perf check", "site chậm", "BE chậm", "bundle quá to", "Lighthouse fail", "N+1"

## Step 0 — Detect the track from the directory architecture

| Track | Signals |
|---|---|
| **angular** | `angular.json`; `@sdcorejs/angular`; `src/libs/<module>/`; `*.component.ts`, `*.routes.ts` |
| **nestjs** | `nest-cli.json`; `@nestjs/*`; `*.controller.ts` / `*.service.ts` / `*.entity.ts` |
| **nextjs** | `next.config.*`; `next` dep; `src/app/[locale]/`; `page.tsx`, `middleware.ts` |
| **monorepo** | run every applicable block; scope each finding to its stack |

State the detected track(s) in the report header.

## Step 1 — Load the matching knowledge
- **Always** read `_refs/shared/review-performance.md` (cross-track budget thresholds + universal checklist + per-track exceptions). **All numeric budget thresholds live there** — track refs cite them, never redefine them.
- **angular** → also read `_refs/angular/review-performance.md` (AG-P1…AG-P10)
- **nestjs** → also read `_refs/nestjs/review-performance.md` (NS-P1…NS-P10)
- **nextjs** → also read `_refs/nextjs/build-website/review-performance.md` (NX-P1…NX-P7)

Each ref supplies *what to measure* (probes + severity + budget/Web-Vitals citation). The
**output format** below is owned by this skill and used for all tracks.

## Step 2 — Audit
1. **Read-only inventory (parallel):** `git log -20 --oneline`; `git diff <base>...HEAD` if a base ref is given (else scope to surface); `package.json` (heavy deps, bundle analyzers, load-test tools); build config (`angular.json` / `next.config.*` / `ormconfig`).
2. **Measure against a PRODUCTION-like build** — `ng build --configuration=production` / `next build && next start` / staging or local production NestJS. Dev mode hides perf issues (source maps, HMR, dev middleware) and produces misleading numbers.
3. Run the shared budget + checklist, then the track probes. Cite the breached budget threshold next to every measurement — no finding without a `file:line` (or chunk / endpoint / query) and a number.
4. Always report p50 **and** p95/p99 for latency; per-page / per-route (never aggregate) for frontend — averages hide tail latency and regressions.
5. Map each finding to severity (use the ref's mapping) + the budget it breaches.
6. Emit the report.

## Output format (ALL tracks)

Match the user's language (VI/EN). Cite `file:line` (or chunk / endpoint / query) + the breached budget threshold for every finding. Severity labels are **🔴 Critical / 🟡 Important / 🔵 Minor** — never "Medium".

```markdown
# Performance Review — <repo> — <detected track(s)> — <date>

## Scope
- Track(s): <angular | nestjs | nextjs | monorepo>
- Measured against: <prod build | staging URL> · Commit range: <base>...<head> (N commits)

## Measurement summary
<stack-appropriate table — e.g. Lighthouse per page (Perf/LCP/CLS/TBT/TTFB), bundle per chunk (raw/gz/budget/status), or endpoint latency (p50/p95/p99/budget/status). Include the budget column.>

## 🔴 Critical (must fix before merge / release)
| # | Finding | File:line / chunk / endpoint | Budget breached | Fix |
|---|---|---|---|---|

## 🟡 Important (fix this iteration)
| # | Finding | File:line / chunk / endpoint | Budget breached | Fix |
|---|---|---|---|---|

## 🔵 Minor / nits
| # | Finding | File:line / chunk / endpoint | Budget breached | Fix |
|---|---|---|---|---|

## ✅ Passed budget items
<budgets/checks that came in under threshold — signals you actually measured>

## Manual audit (cannot automate — track ref lists these)
- [ ] <e.g. change-detection profile under interaction; 24h memory growth; CDN cache warm; …>

## Out of scope (not checked here)
- Sustained load / soak testing · RUM · infrastructure (CDN, K8s autoscaling) · third-party SaaS latency
```

- A severity table with no rows: write `_none_` rather than omitting the heading.
- The Passed list is required — a report with only findings reads as untrustworthy.

## Rules

### MUST DO
- Detect the track first; state it in the header.
- Measure against a PRODUCTION-like build, after warmup — never `npm run start:dev` / `ng serve`.
- Cite the breached budget threshold next to every measurement; no finding without a `file:line` / chunk / endpoint / query + a number.
- Report p50 **and** p95/p99 for latency; per-page / per-route for frontend (averages hide the tail).
- Categorize Critical / Important / Minor with a rationale; never a flat list.
- Honour the **per-track budget exceptions** in the shared ref (Angular Portal ships a heavier framework baseline and is desktop-behind-auth, so its numbers differ) — don't flag a portal against the landing-site budget.
- List Passed items so the report is trustworthy.

### MUST NOT
- Trust dev-mode bundle sizes / Lighthouse / query logs — they include source maps, HMR, dev middleware.
- Audit memory in dev mode — HMR retains stale closures.
- Report "% faster / slower" without baseline numbers.
- Aggregate findings across pages / routes — Critical on `/admin/preview` ≠ Critical on `/`.
- Optimise prematurely — measure first, fix the top 3, re-measure.
- Use the label "Medium" — convert to 🟡 Important.
- Duplicate `sdcorejs-review-code` / `review/architecture` findings (structural N+1, god-function) — one entry, not two.

## Anti-patterns
- A 50-item report where everything is "Important" — nothing is, then.
- Running on a 1000-file repo with no commit range / scope — noise hides signal.
- Treating the Lighthouse score as the only metric — it simulates one device; RUM is ground truth.
- One global budget for all routes — `/` (hero + images) and `/admin/settings` (data tables) have wildly different floors.
- Re-running and producing last week's findings verbatim (means nothing was fixed; flag it).

## When to escalate
- Critical regression with no obvious cause across the diff → bisect (`git bisect`) before guessing.
- Confirmed memory leak (>30% growth / 24h) → capture a heap snapshot; loop in the owner before shipping.
- Budget breach rooted in a third-party dep / hosting tier → flag the tradeoff to the owner; don't silently swap deps.

## Cross-references
- Cross-track budget + checklist: `_refs/shared/review-performance.md`
- Track probes: `_refs/<track>/review-performance.md` (nextjs: `_refs/nextjs/build-website/review-performance.md`)
- Code review (correctness overlap): `sdcorejs-review-code` · Architecture (structural perf): `sdcorejs-review-architecture`
- Caching that often resolves findings: track-specific (e.g. `_refs/nextjs/build-website/write-code/caching.md`)
- Repair loop: `orchestration/repair-loop` · Verification: `orchestration/verify-before-done` runs budget verifiers as acceptance criteria

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
