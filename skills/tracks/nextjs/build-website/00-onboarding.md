---
name: nextjs-build-website-onboarding
description: Use when the user opens this agent inside a Next.js landing-site project for the first time, asks "what can you do for my website", "how do I start a landing site", "list skills cho website", "tạo landing page", or seems unsure which skill to invoke. Provides overview of the build-website skill pack, the SDLC flow, links to the WHY-rules in `_refs/nextjs/build-website/architecture-principles.md`, and routes the user to the next concrete step (usually `sdcorejs-brainstorm`). Bilingual (VI/EN).
allowed-tools: Read, Glob
---

# Build Website — Onboarding

## What this pack does
Generates **production-grade Next.js landing sites** with SSR/ISR, full bilingual VI/EN support, SEO that ranks, OG previews that render correctly on Zalo/Messenger/Facebook, and a real (not fake) contact pipeline. No template repo — every site is composed from the skill pack's primitives, tailored to your industry.

Ships the full quality bar for a production landing site from day 1: i18n, externalized content, structured data, real form integration, sitemap/robots, OG-per-page, mobile-first responsive, ISR caching.

## Workflow

Every site follows the standard SDCoreJS SDLC. Two parallel entry points depending on whether the repo exists:

```
GREENFIELD (no repo yet)                  │   BROWNFIELD (existing site to improve)
Request: "tạo landing page cho X"         │   Request: "audit site này", "improve site đã có"
  ↓                                       │     ↓
01-brainstorm                             │   08-audit-existing-site
   INDUSTRY-AWARE: detect ngành nghề →    │     READ-ONLY scan; 30-check quality bar →
   suggest theme/pages/utilities          │     Critical/Important/Minor gap report →
                                          │     user picks improvement priorities
   ↓                                      │     ↓
   └────────────────────┬─────────────────┘
                        ↓
02-clarify-requirements    ← greenfield: 11 blockers; brownfield: skip what audit answered
  ↓
03-write-spec  → 04-review-spec    (use shared SDLC — same as other tracks)
05-plan        → 06-review-plan
  ↓
07-write-code              ← orchestrator, dispatches build sub-skills below
   10-init-site      — Next.js project bootstrap (greenfield only)
   11-theme          — industry-driven palette + typography + design tokens
   12-pages-and-blocks — page set + reusable section library + content externalization
   13-seo            — generateMetadata factory + JSON-LD + sitemap + robots (technical SEO)
   14-og-preview     — static + dynamic OG image; verify Zalo/Messenger preview
   15-i18n           — next-intl + /vi /en URL strategy
   16-caching        — SSG / ISR / SSR strategy; default ISR 30 min
   17-responsive     — mobile-first breakpoints + image + font policy
   18-contact-form   — REAL form: API route + email service + validation
   19-content-quality — bilingual parity check + min word counts + prose typography + on-page SEO + Article schema
  ↓
40-e2e-test (generic) → 50-review-code (generic) → orchestration/repair-loop
  ↓
orchestration/comment-code (ASK gate) → orchestration/verify-before-done (acceptance gate)
  ↓
orchestration/auto-docs → orchestration/auto-task-tracker → orchestration/memories
```

## When to invoke each skill directly

| User says | Skill |
|---|---|
| "tạo landing page", "build website", "new site" (greenfield) | `01-brainstorm` |
| "audit site", "review website đã có", "improve existing site", "site này thiếu gì" (brownfield) | `08-audit-existing-site` |
| Scope already clear | `02-clarify-requirements` |
| Already clarified, want plan | `05-plan` (track-specific) |
| Init the project | `10-init-site` |
| Pick colors / typography | `11-theme` |
| Add a page or section | `12-pages-and-blocks` |
| "SEO không tốt", "meta tags" | `13-seo` |
| "OG image preview hỏng trên Zalo" | `14-og-preview` |
| "Thêm tiếng Anh" | `15-i18n` |
| "Cache lâu quá / ngắn quá" | `16-caching` |
| "Responsive bị vỡ trên mobile" | `17-responsive` |
| "Contact form chưa gửi email" | `18-contact-form` |
| "Bài viết quá ngắn", "câu chữ không rõ", "rà soát nội dung", "thin content" | `19-content-quality` |
| "Song ngữ không khớp", "VI/EN parity", "i18n missing key" | `19-content-quality` (parity check) |
| "Bài viết / blog", "long-form article", "tối ưu SEO trang sản phẩm" | `19-content-quality` |

## What's included by default

A production-quality landing site needs more than a hero section and a contact form. This pack ships the following baseline so you don't have to retrofit later:

| Concern | What this pack delivers | Why it matters |
|---|---|---|
| Strings | Externalized to `content/<locale>/*.ts` — never hardcoded in components | Switching language or CMS later requires zero component rewrites |
| i18n | `next-intl` wired from day 1 (default VI, EN ready), localized URL pathnames | SEO benefits from per-locale URLs; UX from native-feeling links |
| Contact form | Real submit: zod validation + API route + email service (Resend) + rate limit | A landing site without a working form leaks leads silently |
| OG image | Static fallback + dynamic per-page via `@vercel/og` | Zalo / Messenger / Facebook share previews look intentional, not broken |
| Structured data | JSON-LD per page type (Organization / LocalBusiness / Product / Article) | Rich snippets in Google + better LLM citations |
| Sitemap / robots | `app/sitemap.ts` + `app/robots.ts` generated from routes | Search engines discover all pages, not just the homepage |
| Favicon | Full variant set (ico, svg, apple-touch, web manifest) | Tab icons, iOS home-screen, Android PWA all look right |
| Caching | ISR 30 min default via `"use cache"` + decision tree + on-demand revalidation | Fast pages without stale content after edits |
| Responsive | Mobile-first Tailwind, touch targets ≥ 44px, `next/image sizes` policy | Most landing-site traffic is mobile; broken mobile = lost leads |
| Content quality | Min word counts per page type, sentence/paragraph discipline, prose typography, bilingual parity check (`npm run check:i18n`) | Google's thin-content algorithm penalizes <300-word pages; machine-translated EN ranks worse than VI-only |
| On-page SEO | Heading hierarchy, internal linking, descriptive alt text, Article JSON-LD with author + dates | Technical SEO (`13-seo`) gets you indexed; on-page SEO is what makes you rank |
| Analytics | Optional (GA4 / Plausible) gated by clarify question | Surfaced as a choice, not a hidden default |

## Cross-track shared skills you'll use

These come from `skills/orchestration/`, `skills/shared/`, `skills/review/`, `skills/testing/` (split by concern) and apply to every track:

- **`sdcorejs-auto-docs`** — mandatory session summary
- **`sdcorejs-auto-task-tracker`** — living TODO per track
- **`sdcorejs-memories`** — durable knowledge
- **`sdcorejs-verify-before-done`** — acceptance gate before "done"
- **`sdcorejs-repair-loop`** — after `50-review-code` findings
- **`sdcorejs-comment-code`** — ASK gate at comment phase
- **`sdcorejs-commit`** — Conventional Commits
- **`sdcorejs-debug`** — when something breaks
- **`sdcorejs-env-setup`** — when env / clone setup is off
- **`sdcorejs-code-map`** — when integrating into an existing repo

## Default starting point

Two cases:

1. **Greenfield** — user says "tạo landing page cho [X]" with no other context AND `package.json` is absent → invoke `01-brainstorm` immediately.
2. **Brownfield** — user is inside a repo that has `package.json` with `next` dependency AND says "audit / review / improve" → invoke `08-audit-existing-site` immediately.

Do NOT generate code or jump to `10-init-site` before brainstorm/audit + clarify have run. This is hard-enforced by `02-clarify-requirements`'s gating questions and the audit's read-only contract.

## See also

- `skills/orchestration/`, `skills/shared/`, `skills/review/`, `skills/testing/` — cross-track utilities (split by concern)
- `_refs/nextjs/build-website/` — reference docs (created on demand as the pack grows)
- `CLAUDE.md` / `AGENTS.md` / `.github/copilot-instructions.md` — entry points for the 3 supported tools
