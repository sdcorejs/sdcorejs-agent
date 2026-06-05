---
name: nextjs-build-website-write-code
description: Use when the user is ready to generate code for a Next.js landing site — either after 06-review-plan approved a plan, OR as the single entry point for any direct build-website code-generation request. This one orchestrator absorbs what used to be ten separate sub-skills; it reads the confirmed scope and loads the matching on-demand reference pack under `_refs/nextjs/build-website/write-code/`. Capabilities & trigger phrases — init-site (bootstrap new site - "init site", "tạo project Next.js", "bootstrap website", "khởi tạo website"); theme (palette/typography/design tokens - "pick theme", "chọn theme", "set up colors / fonts", "design system"); pages-and-blocks (compose pages from section blocks - "add a page", "thêm trang", "tạo section", "compose home page"); seo (generateMetadata + JSON-LD + sitemap + robots + favicon - "set up SEO", "metadata", "structured data", "sitemap", "robots", "favicon"); og-preview (OG / Twitter card images - "OG image", "Zalo preview hỏng", "Facebook share không hiện ảnh", "Twitter card", "social preview"); i18n (next-intl bilingual VI/EN - "add English", "thêm tiếng Anh", "setup i18n", "đa ngôn ngữ", "language switcher"); caching (30-min ISR default + revalidation - "set up caching", "cấu hình cache", "cache lâu/ngắn quá", "ISR settings", "revalidate"); responsive (mobile-first audit - "responsive bị vỡ", "mobile broken", "responsive audit", "fix mobile layout", "touch target"); contact-form (real working form + email + rate limit - "contact form", "biểu mẫu liên hệ", "form không gửi email", "fix fake form"); content-quality (bilingual parity + word counts + prose + Article schema + on-page SEO - "review content", "rà soát nội dung", "bài viết quá ngắn", "câu chữ chưa rõ", "set up content rules", "thin content"). Also fires on generic generate triggers - "generate code", "viết code", "sinh code đi", "go ahead", "proceed with implementation". For auditing an EXISTING site (read-only gap report) use `nextjs-build-website-audit-existing-site` instead — that is a separate entry point, not part of this orchestrator. After completion, mandatory hand-off chain - 40-e2e-test (when written) → sdcorejs-review-code → orchestration/repair-loop → orchestration/comment-code → orchestration/verify-before-done → orchestration/auto-docs → orchestration/auto-task-tracker → orchestration/memories (when applicable). Bilingual (VI/EN).
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
- No plan exists or plan is unapproved → go back to `05-plan` / `06-review-plan`
- Scope changed since plan was approved → re-plan with `05-plan`
- The user wants to AUDIT an existing site (not generate) → `nextjs-build-website-audit-existing-site`

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
40-e2e-test          ← happy-path tests for each generated page
   ↓
sdcorejs-review-code       ← convention check; outputs Critical / Important / Minor findings
   ↓
orchestration/repair-loop     ← apply findings, iterate to clean
   ↓
orchestration/comment-code ← ASK gate (skip / simple / medium / full); applies chosen level
   ↓
orchestration/verify-before-done ← BLOCK "done" until acceptance criteria from spec are ✅
   ↓
orchestration/auto-docs    ← session summary to .sdcorejs/docs/nextjs/
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
- Inputs: approved plan from `05-plan` / `06-review-plan` + brainstorm + clarify outputs
- Reference packs: `_refs/nextjs/build-website/write-code/{init-site,theme,pages-and-blocks,seo,og-preview,i18n,caching,responsive,contact-form,content-quality}.md`
- Audit an existing site (separate entry, read-only): `nextjs-build-website-audit-existing-site`
- Tail-call chain: see CLAUDE.md workflow chart
- Parallel execution: `orchestration/parallel-dispatch` + `orchestration/subagent-driven-dev`

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
