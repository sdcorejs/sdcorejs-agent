---
name: nextjs-write-code
description: Generate code for a Next.js landing site — after 06-review-plan approves, OR as the single entry point for any direct build-website code-gen request. Loads the matching on-demand pack under `_refs/nextjs/build-website/write-code/` (per-pack trigger catalog is in the body): init-site, theme, pages-and-blocks, seo, og-preview, i18n, caching, responsive, contact-form, content-quality. Triggers - "bootstrap website", "chọn theme", "add a page / tạo section", "set up SEO / sitemap", "OG image / social preview hỏng", "thêm tiếng Anh / i18n", "caching / ISR", "responsive bị vỡ / mobile broken", "contact form / form không gửi email", "review content / bài viết quá ngắn", plus generic "generate code", "viết code", "go ahead". To audit an EXISTING site use `sdcorejs-review` instead. After completion runs the mandatory tail chain (sdcorejs-test → sdcorejs-review → repair-loop → comment-code → verify-before-done → branch-ready → auto-docs → write-user-guide → auto-task-tracker → memories). Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Bash
---

# Build Website — Write Code Orchestrator

## Purpose
Single entry point for generating Next.js landing-site code. This skill is the dispatch layer between the approved plan (or a direct request) and the focused REFERENCE PACKS that hold the per-concern generation rules. It does NOT inline those rules — it reads the right pack on demand. The ten packs under `_refs/nextjs/build-website/write-code/` were standalone sub-skills before they were consolidated here so the track exposes one orchestrator instead of eleven.

## When invoked
- After `06-review-plan` (or cross-track plan-review) is approved
- User says "generate code", "viết code", "sinh code đi", "go ahead", "OK proceed"
- A direct build-website request matching any capability in the dispatch table below
- After `orchestration/recovery` and user explicitly resumes work

Do NOT invoke if:
- No plan exists or plan is unapproved → go back to `05-write-plan` / `06-review-plan`
- Scope changed since plan was approved → re-plan with `05-write-plan`
- The user wants to AUDIT an existing site (not generate) → `sdcorejs-review`

## Step 0 — Pre-flight: ensure project summary

Before reading the plan or dispatching, run `orchestration/auto-summary`. For an EXISTING site (taking over / extending), if `<target>/.sdcorejs/summary.md` is missing it MUST be generated first (auto-summary delegates the scan to `sdcorejs-code-map` and distills the brief) so generation slots into the real app-router / component / content structure instead of guessing. For a brand-new site (`init-site` in scope), there is nothing to summarize yet — auto-summary runs in WRITE mode AFTER init scaffolds the project.

## Dispatch table

Read the approved plan (or the direct request). Match the work items to the reference pack; READ that pack on demand and follow it. Dispatch in the order listed in the "Full build" row (order matters — theme + i18n + content architecture must exist BEFORE pages are composed).

| User intent / plan item | Reference pack to read | Phase |
|---|---|---|
| "Start a new site from scratch" | the full sequence below | Full build |
| "Init project only" | [`_refs/nextjs/build-website/write-code/init-site.md`](_refs/nextjs/build-website/write-code/init-site.md) | Bootstrap |
| "Pick / change theme" | [`_refs/nextjs/build-website/write-code/theme.md`](_refs/nextjs/build-website/write-code/theme.md) | Tokens |
| "Add a page" / "thêm trang X" / "thêm block hero / testimonials" | [`_refs/nextjs/build-website/write-code/pages-and-blocks.md`](_refs/nextjs/build-website/write-code/pages-and-blocks.md) | Composition |
| "Set up SEO" / "fix meta tags" | [`_refs/nextjs/build-website/write-code/seo.md`](_refs/nextjs/build-website/write-code/seo.md) | SEO |
| "OG preview hỏng" / "Zalo không hiện ảnh" | [`_refs/nextjs/build-website/write-code/og-preview.md`](_refs/nextjs/build-website/write-code/og-preview.md) | OG |
| "Thêm tiếng Anh" / "add EN" | [`_refs/nextjs/build-website/write-code/i18n.md`](_refs/nextjs/build-website/write-code/i18n.md) | i18n |
| "Cache lâu/ngắn quá", "ISR settings" | [`_refs/nextjs/build-website/write-code/caching.md`](_refs/nextjs/build-website/write-code/caching.md) | Cache |
| "Responsive vỡ mobile" | [`_refs/nextjs/build-website/write-code/responsive.md`](_refs/nextjs/build-website/write-code/responsive.md) | Responsive |
| "Contact form chưa gửi email" / "real form" | [`_refs/nextjs/build-website/write-code/contact-form.md`](_refs/nextjs/build-website/write-code/contact-form.md) | Form |
| "Bài viết quá ngắn" / "rà soát nội dung" / "VI/EN parity" / "Article schema" / "thin content" | [`_refs/nextjs/build-website/write-code/content-quality.md`](_refs/nextjs/build-website/write-code/content-quality.md) | Content |

Read ON DEMAND only — load the one pack for the step you are executing. Each pack further links to track-level reference data under `_refs/nextjs/build-website/`.

## Full-build execution sequence

For a new site, read and apply the packs in this order:

```
1. init-site.md          ← Bootstrap; creates folder structure, deps, env template
                            Output: runnable `npm run dev` with empty pages
2. theme.md              ← Apply industry palette / typography / design tokens
                            Output: tokens in tailwind.config + globals.css
3. i18n.md               ← next-intl setup, /vi /en routing, messages skeleton
                            Output: locale switcher, all UI strings go through next-intl
4. pages-and-blocks.md   ← Page set + section library; externalize content to content/<locale>/
                            Output: each page composed of imported section blocks
5. seo.md                ← generateMetadata factory + JSON-LD + sitemap + robots
                            Output: every page gets proper metadata
6. og-preview.md         ← Static fallback + dynamic per-page (if Standard/Full tier)
                            Output: opengraph-image.tsx per route segment
7. caching.md            ← Apply ISR 30-min default per route; on-demand revalidation for forms
                            Output: cache directives on each page
8. responsive.md         ← Audit breakpoints, image sizes, font loading
                            Output: mobile-pass on all pages
9. contact-form.md       ← Real API route + email service + validation + rate limit
                            Output: working form, test email sent
10. content-quality.md   ← Bilingual parity check + min word counts + prose typography + Article schema + on-page SEO
                            Output: `npm run check:i18n` + `npm run check:content` pass; Tailwind Typography wired; long-form copy meets thresholds
```

When `sdcorejs-parallel-dispatch` decision tree green-lights parallelism (3+ independent units, no shared file edits), the orchestrator MAY use `sdcorejs-subagent-driven-dev` to fan out — typically:
- Section components (hero, features, testimonials, …) can be generated in parallel
- SEO + OG + sitemap can run in parallel after pages exist
- i18n message extraction can fan out across content/<page>.json files

Steps 1–4 are sequential (each depends on the previous). Steps 5–8 can be parallel after step 4 lands.

## After all dispatched packs complete

Run the standard tail-call chain (cross-track mandatory):

```
sdcorejs-test  ← happy-path tests for each generated page
   ↓
sdcorejs-review       ← convention check; outputs Critical / Important / Minor findings
   ↓
orchestration/repair-loop     ← apply findings, iterate to clean
   ↓
orchestration/comment-code ← ASK gate (skip / simple / medium / full); applies chosen level
   ↓
orchestration/verify-before-done ← BLOCK "done" until acceptance criteria from spec are ✅
   ↓
orchestration/branch-ready ← branch-hygiene sweep (debug logs, secrets, focused tests, lint+build+test)
   ↓
orchestration/auto-docs    ← session summary to .sdcorejs/docs/nextjs/
   ↓
sdcorejs-write-user-guide (Mode 1) ← update touched module's .sdcorejs/user-guide/<module>.md (features / routes / permissions / data + Coverage-vs-requirements); per-module incremental, aggregate rebuilds at ship
   ↓
orchestration/auto-task-tracker ← tick done, append new
orchestration/memories     ← durable knowledge (when applicable)
```

Each tail-call is mandatory (per the cross-track rules in CLAUDE.md / AGENTS.md / copilot-instructions.md). Do NOT skip `verify-before-done` — that's how acceptance criteria slip.

## Rules

### MUST DO
- Read the approved plan BEFORE dispatching — never invent scope
- Dispatch in the order listed (theme/i18n/content BEFORE pages BEFORE seo)
- Pass the brainstorm + clarify outputs to each pack as context
- Use parallel dispatch only when `parallel-dispatch` decision tree allows
- Run the tail-call chain in full — no shortcuts
- Report progress after each pack is applied (1 line per pack)
- Invoke `sdcorejs-tdd` for any pack that writes testable logic (custom hooks, server actions, API route handlers, form validation in `contact-form.md`, utility functions) — write failing tests first, then implement

### MUST NOT
- Generate code from memory when a pack covers the concern — read the pack
- Skip `i18n.md` even for VI-only sites (structure must be ready for EN)
- Skip `contact-form.md` and ship a fake `setTimeout` form — leads will silently disappear
- Skip `verify-before-done` because tests passed — acceptance criteria are independent
- Apply packs out of order (e.g. pages before theme)
- Mark "done" before `verify-before-done` returns green
- Skip `sdcorejs-tdd` for packs that write logic — config files and content may bypass; custom code must not

## Anti-patterns
- Generating ALL pages first, THEN applying theme/i18n — leads to massive refactor when content gets externalized
- Skipping `seo.md` because "we'll do it later" — every page launched without metadata costs a re-ship
- Treating `contact-form.md` as optional — a landing site without a working form is incomplete
- Re-implementing OG image per page manually instead of using `@vercel/og` factory from `og-preview.md`
- Bypassing the tail-call chain because "it's a small change" — small changes compound into untracked drift

## Cross-references
- Inputs: approved plan from `05-write-plan` / `06-review-plan` + brainstorm + clarify outputs
- Reference packs: `_refs/nextjs/build-website/write-code/{init-site,theme,pages-and-blocks,seo,og-preview,i18n,caching,responsive,contact-form,content-quality}.md`
- Audit an existing site (separate entry, read-only): `sdcorejs-review`
- Tail-call chain: see CLAUDE.md workflow chart
- Parallel execution: `orchestration/parallel-dispatch` + `orchestration/subagent-driven-dev`
