# Build Website — Audit Existing Site

> Loaded on demand by `sdcorejs-review` when auditing an EXISTING Next.js site
> (full-site quality-bar audit mode). Not a dispatchable skill — no frontmatter.
> Read-only; the parent skill owns dispatch.

## Purpose
`01-brainstorm` assumes greenfield (we choose industry, tier, theme from nothing). **This skill is the opposite entry**: a Next.js repo already exists, and the user wants to know what's missing or weak so they can prioritise improvements.

The audit measures the existing repo against the same 14-point quality bar that this skill pack would produce from scratch, then surfaces the gaps as a structured report that maps each finding to the specific sub-skill that fixes it. The user picks priorities; the standard SDLC (02-clarify → 03-spec → 04-review → 05-write-plan → 06-review → 07-write-code) executes them.

This skill is **read-only**. It never modifies code, never auto-applies fixes. Approval gates downstream are sacred.

## When invoked
- User opens the agent inside an existing Next.js repo and says: "audit", "review site này", "improve site đã có", "thiếu gì", "kiểm tra chất lượng"
- User pulls/clones a take-over project and asks for a starting assessment
- After a major dependency upgrade — confirm nothing regressed against the quality bar
- Before a marketing push / launch — last-pass check

Do NOT invoke when:
- The repo is empty / has no `package.json` → fall back to `01-brainstorm` (greenfield)
- The user only wants to fix ONE specific thing (e.g. "fix contact form") → invoke that sub-skill directly, no audit needed
- The repo is not Next.js → out of scope

## Prerequisites detection

```bash
TARGET_ROOT=$(git rev-parse --show-toplevel)

# Confirm it is a Next.js project
test -f "$TARGET_ROOT/package.json" || { echo "No package.json — not a code repo"; exit 1; }
grep -q '"next"' "$TARGET_ROOT/package.json" || { echo "Not a Next.js project"; exit 1; }

# Capture key facts
NEXT_VERSION=$(node -p "require('$TARGET_ROOT/package.json').dependencies?.next ?? 'unknown'")
APP_ROUTER=$([ -d "$TARGET_ROOT/src/app" ] || [ -d "$TARGET_ROOT/app" ] && echo "yes" || echo "no")
TAILWIND=$(grep -q '"tailwindcss"' "$TARGET_ROOT/package.json" && echo "yes" || echo "no")
```

If App Router is missing — flag as Important (Pages Router is legacy for landing sites; recommend migration but don't block).

## Workflow

### Step 1 — Quick repo map (≤ 60 seconds)

```bash
# Structure
ls "$TARGET_ROOT/src/app/[locale]" 2>/dev/null   # locale-aware?
ls "$TARGET_ROOT/src/content"      2>/dev/null   # content externalized?
ls "$TARGET_ROOT/src/i18n"         2>/dev/null   # next-intl wired?
ls "$TARGET_ROOT/src/components/sections" 2>/dev/null  # section library?

# Page count
find "$TARGET_ROOT" -path '*/app/*' -name 'page.tsx' | wc -l
```

### Step 2 — Run automated quality probes

Run in parallel; each is fast.

```bash
cd "$TARGET_ROOT"

# Build / lint / typecheck — proves the project still works
npm run build  2>&1 | tail -20  > /tmp/audit-build.log
npm run lint   2>&1 | tail -20  > /tmp/audit-lint.log
npx tsc --noEmit 2>&1 | tail -20 > /tmp/audit-tsc.log

# Bilingual + content scripts (from the content-quality pack) — only run if defined
node -e "const p=require('./package.json').scripts??{}; process.exit(p['check:i18n']?0:1)" \
  && npm run check:i18n 2>&1 > /tmp/audit-i18n.log \
  || echo "MISSING:check:i18n" > /tmp/audit-i18n.log

node -e "const p=require('./package.json').scripts??{}; process.exit(p['check:content']?0:1)" \
  && npm run check:content 2>&1 > /tmp/audit-content.log \
  || echo "MISSING:check:content" > /tmp/audit-content.log

# Lighthouse — only if dev server can boot OR a staging URL is available
# Ask user: "Có URL staging cho audit không? (skip nếu không có)"
# If yes:
npx --yes lighthouse "$URL" --only-categories=seo,performance,accessibility --quiet \
  --chrome-flags="--headless" --output=json --output-path=/tmp/audit-lh.json
```

### Step 3 — Code-level checks (read-only, grep-driven)

Each check maps to one sub-skill from the build-website pack. The findings table at the end uses these checks.

| # | Check | Probe |
|---|---|---|
| A1 | **init-site** Folder structure has `src/app/[locale]/`, `src/i18n/`, `src/content/<locale>/` | `Glob` those paths |
| A2 | **theme** Tokens defined in `tailwind.config.ts` (extend.colors.brand, fontFamily) | `Grep` `theme.extend.colors` |
| A3 | **theme** Vietnamese subset loaded via `next/font` | `Grep` `subsets:\s*\[.*vietnamese` |
| B1 | **pages-and-blocks** Section components exist in `src/components/sections/` | `Glob src/components/sections/*.tsx` |
| B2 | **pages-and-blocks** No hardcoded Vietnamese in components (all strings via props/t()) | `Grep '[àáâ-ỹ]' src/components/sections/*.tsx` — should return 0 |
| B3 | **pages-and-blocks** Content externalized to `src/content/<locale>/` | `Glob src/content/*/*` non-empty |
| C1 | **seo** `generateMetadata` per page | `Grep 'generateMetadata\|export const metadata' src/app/**/*.tsx` per page |
| C2 | **seo** `app/sitemap.ts` exists | `Glob src/app/sitemap.{ts,tsx}` |
| C3 | **seo** `app/robots.ts` exists | `Glob src/app/robots.{ts,tsx}` |
| C4 | **seo** Favicon variants — `icon.svg`, `apple-icon.png`, `manifest.ts` | Glob |
| C5 | **seo** Organization JSON-LD on home | `Grep 'application/ld+json' src/app/[locale]/page.tsx` |
| D1 | **og-preview** Static OG fallback at `public/og-default.png` | File exists |
| D2 | **og-preview** Dynamic OG via `opengraph-image.tsx` for at least home | Glob |
| E1 | **i18n** `src/middleware.ts` uses `createMiddleware` | Grep |
| E2 | **i18n** `routing.ts` with `pathnames` (localized URLs) | Grep `pathnames:` |
| E3 | **i18n** Both `vi.json` + `en.json` exist | Glob |
| E4 | **i18n** Keys symmetric (handled by `check:i18n` in Step 2) | from /tmp/audit-i18n.log |
| F1 | **caching** `"use cache"` + `cacheLife` on pages | `Grep '"use cache"' src/app/**/*.tsx` |
| F2 | **caching** On-demand revalidation route exists if content can change | `Glob src/app/api/revalidate/route.ts` |
| G1 | **responsive** Tailwind mobile-first; no `lg:hidden md:hidden` blocking mobile nav | `Grep -r 'md:hidden\|lg:hidden' src/components/layout/` — sanity check |
| G2 | **responsive** `next/image` everywhere; no raw `<img>` | `Grep '<img ' src/` — should be 0 |
| G3 | **responsive** `sizes` prop on responsive images | `Grep -A2 'Image' src/components/sections/*.tsx \| grep -c sizes` |
| H1 | **contact-form** Real API route at `src/app/api/contact/` | Glob |
| H2 | **contact-form** Email service wired (Resend / SendGrid) — not `setTimeout` stub | `Grep 'setTimeout' src/components/sections/contact-form.tsx` — should be 0; `Grep 'resend\|sendgrid' src/app/api/contact/route.ts` — should be 1+ |
| H3 | **contact-form** Rate limit applied | `Grep 'rateLimit\|RATE_LIMIT' src/app/api/contact/` |
| I1 | **content-quality** `@tailwindcss/typography` installed | `Grep '@tailwindcss/typography' package.json` |
| I2 | **content-quality** `check:i18n` script (handled in Step 2) | from log |
| I3 | **content-quality** `check:content` script (handled in Step 2) | from log |
| I4 | **content-quality** Article JSON-LD builder for article pages | `Grep 'articleJsonLd\|"@type":\s*"Article"' src/lib/structured-data.ts` |
| I5 | **content-quality** Min word counts respected on key pages | from /tmp/audit-content.log |
| I6 | **content-quality** Heading hierarchy — exactly 1 `<h1>` per page | `Grep -c '<h1' src/app/**/*.tsx` per file = 1 |

The reference pack that fixes each finding is named in the "Check" column — drives the gap report's "Fix via" cell automatically. All packs are dispatched through the `nextjs-write-code` orchestrator.

### Step 4 — Produce the gap report

```markdown
## Audit — <site-name or repo-path> — <YYYY-MM-DD HH:mm>

### Stack
- Next.js: <version>, App Router: yes/no
- Tailwind: yes/no (v3/v4)
- next-intl: yes/no
- Detected industry: <from content / config, or "unknown — ask user">
- Tier (estimated): Lean / Standard / Full

### Automated probes
- build: ✅ / ❌
- lint: ✅ / ❌
- typecheck (tsc): ✅ / ❌
- check:i18n: ✅ / ❌ / ⚠️ missing script
- check:content: ✅ / ❌ / ⚠️ missing script
- Lighthouse SEO: 87 / 100 (target ≥ 95)  ← if URL provided
- Lighthouse Perf: 72 / 100  ← if URL provided
- Lighthouse A11y: 91 / 100  ← if URL provided

### Findings by severity

#### Critical (blocks launch / hurts ranking now)
| # | Finding | Fix via | Effort |
|---|---|---|---|
| C-1 | Contact form uses `setTimeout` stub — no email actually sent (H2) | `write-code → contact-form` | M |
| C-2 | No `app/sitemap.ts` — search engines can't discover pages (C2) | `write-code → seo` | S |
| C-3 | check:content fails: home.vi.ts has 180 words (min 400) — Google thin-content threshold (I5) | `write-code → content-quality` | M |

#### Important (degrades UX or SEO meaningfully)
| # | Finding | Fix via | Effort |
|---|---|---|---|
| I-1 | `<img>` tags in 4 components instead of `next/image` — no AVIF/WebP, no LCP optimization (G2) | `write-code → responsive` | M |
| I-2 | No Article JSON-LD on blog pages — rich snippets disabled (I4) | `write-code → content-quality` | S |
| I-3 | EN message file missing 14 keys present in VI — i18n parity broken (E4) | `write-code → i18n` | S |

#### Minor (polish; ship-blocking only if all above resolved)
| # | Finding | Fix via | Effort |
|---|---|---|---|
| M-1 | No dynamic OG image — every share uses the same default (D2) | `write-code → og-preview` | M |
| M-2 | No `opengraph-image.tsx` per route segment (D2) | `write-code → og-preview` | S |
| M-3 | Favicon set incomplete — missing apple-icon.png (C4) | `write-code → seo` | S |

### Quality bar coverage
<X> / 30 checks passing.
Build-website pack would ship at 28+/30.

### What this site does well
- <2-3 bullets of strengths — important to acknowledge, not all-negative>

### Recommended next step
Pick 1-3 Critical findings to address in the next sprint. Mở `02-clarify-requirements` để xác định scope + acceptance criteria, sau đó `03-write-spec` → review → plan → implement.
```

### Step 5 — Brainstorm improvement priority with the user

After showing the report, ask:

> Báo cáo cho thấy **<N>** finding (Critical: X, Important: Y, Minor: Z). Bạn muốn:
> - **A**: Xử lý toàn bộ Critical trong 1 sprint (recommended nếu site đang chạy production)
> - **B**: Pick 2-3 finding quan trọng nhất theo ý bạn — mình chạy lần lượt
> - **C**: Tập trung 1 trục cụ thể (ví dụ "chỉ SEO" hoặc "chỉ contact form + i18n")
> - **D**: Defer report — không hành động bây giờ, lưu lại làm reference

If user picks A/B/C → hand off to `02-clarify-requirements` with:
- The selected findings as the implicit scope
- The audit report saved to `<target>/.sdcorejs/docs/nextjs/<timestamp>-audit.md` (for traceability)
- Locale of the site, current tier estimate, industry

If D → save report only, do NOT continue. The next session can pick up via `orchestration/recovery`.

### Step 6 — Save audit artifact (auto-docs writes this)

The audit report goes through `orchestration/auto-docs` as a special doc type:

```
<target>/.sdcorejs/docs/nextjs/<YYYY-MM-DD-HH-mm>-audit-<site-slug>.md
```

Future sessions that invoke `orchestration/recovery` will read this and know the gap baseline. If audit is re-run after fixes ship, the new report can diff against the old one.

## Output: handoff payload to `02-clarify-requirements`

The clarify skill normally asks 11 blockers from scratch. When invoked AFTER an audit, it should:
1. **Skip** clarification of facts already discovered in the audit (industry, current pages, locales, hosting if `vercel.json` / `package.json` shows it)
2. **Ask** the improve-specific blockers:
   - Which findings are in scope for this sprint? (numbered list from the report)
   - Production constraints — is the site live now? (informs whether to use feature branch + preview deploys vs direct)
   - Are there content changes expected (new copy) or pure technical fixes?
   - Locale parity — if EN currently lags, fix to parity or ship VI-only-cleaned?
   - Bridge mode for breaking changes (e.g. URL slug change from `/about` to `/ve-chung-toi`) — redirects required?

Pass these context fields to `02-clarify-requirements` so it knows to skip what's already answered.

## Rules

### MUST DO
- READ-ONLY operation — no Write, no Edit on the target repo
- Confirm Next.js project before running any probe
- Run every automated check that the project supports; surface missing scripts as Important findings
- Sort findings by Severity (Critical → Important → Minor) and then by ease (small effort first within same severity for quick wins)
- Map each finding to the EXACT reference pack that fixes it (dispatched via `nextjs-write-code`) — don't make the user search
- Acknowledge strengths — "what this site does well" prevents the report feeling adversarial
- Save the audit report via `auto-docs` for traceability
- Hand off to `02-clarify-requirements` with the audit context — do NOT skip the SDLC

### MUST NOT
- Modify any file in the target repo
- Auto-dispatch sub-skills to fix findings — that bypasses spec/plan/review gates
- Run audit on a non-Next.js repo (fail fast with a clear message)
- Treat missing scripts (`check:i18n`, `check:content`) as failures when the project never installed them — they're "Important: run the content-quality pack via `nextjs-write-code`" findings, not Criticals
- Repeat clarify questions whose answer is already in the audit (waste of user time)
- Hide findings to make the report look better — every probed gap goes in
- Continue past the user's "defer" choice — read-only ends there

## Anti-patterns

- **Generating a 50-row finding list with no priority** — user can't act; rank ruthlessly
- **Mistaking missing for broken** — a Standard-tier site without dynamic OG is missing a Minor feature, not "broken"
- **Auto-running Lighthouse against `localhost` while the dev server isn't booted** — produces fake-zero scores; ask for a URL instead
- **Skipping the "what this site does well" section** — biases the user toward over-correction
- **Re-running audit each time the user fixes one thing** — invoke targeted re-check via Step 2 + Step 3 only for the affected sub-skill area; full re-audit once at end of sprint
- **Treating audit findings as a contract** — they are recommendations; the user can defer / disagree / re-prioritise. Final scope is set in `02-clarify` + spec, not here.

## Cross-references
- `01-brainstorm` — parallel entry (greenfield); this skill is the brownfield analogue
- `02-clarify-requirements` — receives the audit context as input
- `03-write-spec` → `04-review-spec` → `05-write-plan` → `06-review-plan` → `07-write-code` — standard downstream flow
- `shared/workflow/code-map` — even more general read-only architecture scan (cross-track); this skill is NextJS-specific and quality-focused
- `orchestration/recovery` — picks up here if a user resumes mid-sprint
- Each finding's "Fix via" column points to the relevant reference pack (init-site through content-quality), all dispatched through the `nextjs-write-code` orchestrator (`_refs/nextjs/build-website/write-code/`)
- `orchestration/auto-docs` — persists the audit report for future sessions
