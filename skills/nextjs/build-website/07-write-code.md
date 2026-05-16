---
name: nextjs-build-website-write-code
description: Use AFTER `06-review-plan` (or the cross-track equivalent) has approved a plan and the user is ready to generate code for a Next.js landing site. Orchestrator skill — dispatches sub-skills `10-init-site`, `11-theme`, `12-pages-and-blocks`, `13-seo`, `14-og-preview`, `15-i18n`, `16-caching`, `17-responsive`, `18-contact-form` based on the confirmed scope. After completion, mandatory hand-off chain: `40-e2e-test` (when written) → `50-review-code` → `_shared/fix-loop` → `_shared/comment-code` → `_shared/verify-before-done` → `_shared/auto-docs` → `_shared/auto-task-tracker`. Triggers - "generate code", "viết code", "sinh code", "go ahead", "proceed with implementation". Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Glob, Bash
---

# Build Website — Write Code Orchestrator

## Purpose
This skill is the dispatch table between the approved plan and the specialized sub-skills that actually generate code. It does NOT generate code itself — every step delegates to a focused sub-skill.

## When invoked
- After `06-review-plan` (or `_shared` plan-review) is approved
- User says "generate code", "viết code", "sinh code đi", "go ahead", "OK proceed"
- After `_shared/recovery` and user explicitly resumes work

Do NOT invoke if:
- No plan exists or plan is unapproved → go back to `05-plan` / `06-review-plan`
- Scope changed since plan was approved → re-plan with `05-plan`

## Dispatch table

Read the approved plan. Match the work items to the sub-skill table; dispatch in the order listed below (order matters — theme + i18n + content architecture must exist BEFORE pages are composed).

| User intent / plan item | Dispatch | Phase |
|---|---|---|
| "Start a new site from scratch" | `10-init-site` → `11-theme` → `15-i18n` → `12-pages-and-blocks` → `13-seo` → `14-og-preview` → `16-caching` → `17-responsive` → `18-contact-form` | Full build |
| "Init project only" | `10-init-site` | Bootstrap |
| "Pick / change theme" | `11-theme` | Tokens |
| "Add a page" / "thêm trang X" | `12-pages-and-blocks` | Composition |
| "Add a section" / "thêm block hero / testimonials" | `12-pages-and-blocks` | Composition |
| "Set up SEO" / "fix meta tags" | `13-seo` | SEO |
| "OG preview hỏng" / "Zalo không hiện ảnh" | `14-og-preview` | OG |
| "Thêm tiếng Anh" / "add EN" | `15-i18n` | i18n |
| "Cache lâu/ngắn quá", "ISR settings" | `16-caching` | Cache |
| "Responsive vỡ mobile" | `17-responsive` | Responsive |
| "Contact form chưa gửi email" / "real form" | `18-contact-form` | Form |

If the plan covers multiple items, dispatch in the order listed in the "Full build" row.

## Full-build execution sequence

For a new site, the recommended order:

```
1. 10-init-site            ← Bootstrap; creates folder structure, deps, env template
                              Output: runnable `npm run dev` with empty pages
2. 11-theme                ← Apply industry palette / typography / design tokens
                              Output: tokens in tailwind.config + globals.css
3. 15-i18n                 ← next-intl setup, /vi /en routing, messages skeleton
                              Output: locale switcher, all UI strings go through next-intl
4. 12-pages-and-blocks     ← Page set + section library; externalize content to content/<locale>/
                              Output: each page composed of imported section blocks
5. 13-seo                  ← generateMetadata factory + JSON-LD + sitemap + robots
                              Output: every page gets proper metadata
6. 14-og-preview           ← Static fallback + dynamic per-page (if Standard/Full tier)
                              Output: opengraph-image.tsx per route segment
7. 16-caching              ← Apply ISR 30-min default per route; on-demand revalidation for forms
                              Output: cache directives on each page
8. 17-responsive           ← Audit breakpoints, image sizes, font loading
                              Output: mobile-pass on all pages
9. 18-contact-form         ← Real API route + email service + validation + rate limit
                              Output: working form, test email sent
```

When `sdcorejs-parallel-dispatch` decision tree green-lights parallelism (3+ independent units, no shared file edits), the orchestrator MAY use `sdcorejs-subagent-driven-dev` to fan out — typically:
- Section components (hero, features, testimonials, …) can be generated in parallel
- SEO + OG + sitemap can run in parallel after pages exist
- i18n message extraction can fan out across content/<page>.json files

Steps 1–4 are sequential (each depends on the previous). Steps 5–8 can be parallel after step 4 lands.

## After all dispatched sub-skills complete

Run the standard tail-call chain (cross-track mandatory):

```
40-e2e-test          ← happy-path tests for each generated page
   ↓
50-review-code       ← convention check; outputs Critical / Important / Minor findings
   ↓
_shared/fix-loop     ← apply findings, iterate to clean
   ↓
_shared/comment-code ← ASK gate (skip / simple / medium / full); applies chosen level
   ↓
_shared/verify-before-done ← BLOCK "done" until acceptance criteria from spec are ✅
   ↓
_shared/auto-docs    ← session summary to .sdcorejs/docs/nextjs/
_shared/auto-task-tracker ← tick done, append new
_shared/memories     ← durable knowledge (when applicable)
```

Each tail-call is mandatory (per the cross-track rules in CLAUDE.md / AGENTS.md / copilot-instructions.md). Do NOT skip `verify-before-done` — that's how acceptance criteria slip.

## Rules

### MUST DO
- Read the approved plan BEFORE dispatching — never invent scope
- Dispatch in the order listed (theme/i18n/content BEFORE pages BEFORE seo)
- Pass the brainstorm + clarify outputs to each sub-skill as context
- Use parallel dispatch only when `parallel-dispatch` decision tree allows
- Run the tail-call chain in full — no shortcuts
- Report progress after each sub-skill completes (1 line per skill)

### MUST NOT
- Generate code directly in this skill — always delegate
- Skip `15-i18n` even for VI-only sites (structure must be ready for EN)
- Skip `18-contact-form` and ship a fake form (this is the difference from `website_myhoa`)
- Skip `verify-before-done` because tests passed — acceptance criteria are independent
- Dispatch sub-skills out of order (e.g. `12-pages` before `11-theme`)
- Mark "done" before `verify-before-done` returns green

## Anti-patterns
- Generating ALL pages first, THEN applying theme/i18n — leads to massive refactor when content gets externalized
- Skipping `13-seo` because "we'll do it later" — every page launched without metadata costs a re-ship
- Treating `18-contact-form` as optional — a landing site without a working form is incomplete
- Re-implementing OG image per page manually instead of using `@vercel/og` factory from `14-og-preview`
- Bypassing the tail-call chain because "it's a small change" — small changes compound into untracked drift

## Cross-references
- Inputs: approved plan from `05-plan` / `06-review-plan` + brainstorm + clarify outputs
- Sub-skills: `10-init-site` through `18-contact-form` (some in this batch, some in Batch 2)
- Tail-call chain: see CLAUDE.md workflow chart
- Parallel execution: `_shared/parallel-dispatch` + `_shared/subagent-driven-dev`
