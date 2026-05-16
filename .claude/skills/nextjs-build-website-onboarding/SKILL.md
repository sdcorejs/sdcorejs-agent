---
name: nextjs-build-website-onboarding
description: Use when the user opens this agent inside a Next.js landing-site project for the first time, asks "what can you do for my website", "how do I start a landing site", "list skills cho website", "tạo landing page", or seems unsure which skill to invoke. Provides overview of the build-website skill pack, the SDLC flow, and routes the user to the next concrete step (usually `01-brainstorm`). Bilingual (VI/EN).
allowed-tools: Read, Glob
---

# Build Website — Onboarding

## What this pack does
Generates **production-grade Next.js landing sites** with SSR/ISR, full bilingual VI/EN support, SEO that ranks, OG previews that render correctly on Zalo/Messenger/Facebook, and a real (not fake) contact pipeline. No template repo — every site is composed from the skill pack's primitives, tailored to your industry.

Built to beat the `website_myhoa` baseline: i18n from day 1, externalized content, structured data, real form integration, sitemap/robots, OG-per-page.

## Workflow

Every site follows the standard SDCoreJS SDLC, with website-specific brainstorm + clarify steps:

```
Request: "tạo landing page cho công ty X"
  ↓
01-brainstorm              ← INDUSTRY-AWARE: detect ngành nghề → suggest theme/pages/utilities
  ↓
02-clarify-requirements    ← hard-confirm: audience, languages, pages, contact, hosting, ...
  ↓
03-write-spec  → 04-review-spec    (use shared SDLC — same as other tracks)
05-plan        → 06-review-plan
  ↓
07-write-code              ← orchestrator, dispatches build sub-skills below
   10-init-site      — Next.js project bootstrap
   11-theme          — industry-driven palette + typography + design tokens
   12-pages-and-blocks — page set + reusable section library + content externalization
   13-seo            — generateMetadata factory + JSON-LD + sitemap + robots
   14-og-preview     — static + dynamic OG image; verify Zalo/Messenger preview
   15-i18n           — next-intl + /vi /en URL strategy
   16-caching        — SSG / ISR / SSR strategy; default ISR 30 min
   17-responsive     — mobile-first breakpoints + image + font policy
   18-contact-form   — REAL form: API route + email service + validation
  ↓
40-e2e-test (generic) → 50-review-code (generic) → _shared/fix-loop
  ↓
_shared/comment-code (ASK gate) → _shared/verify-before-done (acceptance gate)
  ↓
_shared/auto-docs → _shared/auto-task-tracker → _shared/memories
```

## When to invoke each skill directly

| User says | Skill |
|---|---|
| "tạo landing page", "build website", "new site" | `01-brainstorm` |
| Scope already clear | `02-clarify-requirements` |
| Already clarified, want plan | `05-plan` (from `_shared` or angular-portal) |
| Init the project | `10-init-site` |
| Pick colors / typography | `11-theme` |
| Add a page or section | `12-pages-and-blocks` |
| "SEO không tốt", "meta tags" | `13-seo` |
| "OG image preview hỏng trên Zalo" | `14-og-preview` |
| "Thêm tiếng Anh" | `15-i18n` |
| "Cache lâu quá / ngắn quá" | `16-caching` |
| "Responsive bị vỡ trên mobile" | `17-responsive` |
| "Contact form chưa gửi email" | `18-contact-form` |

## What's included by default (vs the `website_myhoa` baseline)

| Concern | website_myhoa | This pack |
|---|---|---|
| Strings | Hardcoded VI | Externalized to `content/<locale>/*.ts` |
| i18n | None | `next-intl` from day 1 (default VI, EN ready) |
| Contact form | Fake (setTimeout) | Real: API route + email service + rate limit |
| OG image | Static env-var fallback | Static fallback + dynamic per-page via `@vercel/og` |
| Structured data | None | JSON-LD (Organization / LocalBusiness / Product) |
| Sitemap / robots | Missing | `app/sitemap.ts`, `app/robots.ts` generated |
| Favicon | Single PNG | Full variant set (ico, svg, apple-touch, web manifest) |
| Caching | ISR 30 min via `"use cache"` | Same default + decision tree per route + on-demand revalidation |
| Analytics | None | Optional (GA4 / Plausible) gated by clarify question |

## Cross-track shared skills you'll use

These come from `skills/_shared/` and apply to every track:

- **`sdcorejs-auto-docs`** — mandatory session summary
- **`sdcorejs-auto-task-tracker`** — living TODO per track
- **`sdcorejs-memories`** — durable knowledge
- **`sdcorejs-verify-before-done`** — acceptance gate before "done"
- **`sdcorejs-fix-loop`** — after `50-review-code` findings
- **`sdcorejs-comment-code`** — ASK gate at comment phase
- **`sdcorejs-commit`** — Conventional Commits
- **`sdcorejs-debug`** — when something breaks
- **`sdcorejs-env-setup`** — when env / clone setup is off
- **`sdcorejs-code-map`** — when integrating into an existing repo

## Default starting point

If the user says "tạo landing page cho [X]" with no other context → invoke `01-brainstorm` immediately. Do NOT generate code or jump to `10-init-site` before brainstorm + clarify have run. This is hard-enforced by `02-clarify-requirements`'s gating questions.

## See also

- `skills/_shared/` — cross-track utilities
- `skills/nextjs/build-website/_refs/` — reference docs (created on demand as the pack grows)
- `CLAUDE.md` / `AGENTS.md` / `.github/copilot-instructions.md` — entry points for the 3 supported tools
