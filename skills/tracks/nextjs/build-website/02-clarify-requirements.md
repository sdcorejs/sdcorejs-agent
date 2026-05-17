---
name: nextjs-build-website-clarify-requirements
description: Use AFTER `01-brainstorm` has settled industry + tier, BEFORE any code is generated. Hard-confirms the remaining blockers — production domain, contact destination, hosting, languages, analytics, brand assets, OG strategy, caching window. Each unanswered question blocks generation. Different from `01-brainstorm` (open-ended exploration) — this is the gating checklist. Bilingual (VI/EN).
allowed-tools: Read
---

# Build Website — Clarify Requirements

## Purpose
A landing site has hard dependencies on details the brainstorm doesn't cover: production domain (drives sitemap + OG absolute URLs), contact destination (drives the API route + email integration), hosting (drives caching + ISR availability), brand assets (drives theme tokens). This skill blocks code generation until every required answer is on the table.

## When invoked
- Automatically after `01-brainstorm` picks a tier
- User says "tạo CRUD ... website", "build the site now" — but blockers are unanswered
- Restart point for an existing project where requirements changed (rebrand, language addition)

Skip if:
- All 11 blocking questions below already have answers in the conversation or in a spec doc

## Blocking questions (must all be answered)

Present in user's language. Ask in batches of 3-4 to avoid overwhelming. Mark each as ✓ when answered.

### Block 1 — Identity (must answer)

1. **Site name + tagline (1 dòng)**
   - Example: "Vật liệu Xây dựng An Phú — Đối tác tin cậy của mọi công trình"
   - Used in: `<title>`, OG image, hero, JSON-LD

2. **Production domain (URL chính thức)**
   - Example: `https://example.vn`, `https://acme.com`
   - Used in: sitemap, robots, OG absolute URLs, canonical
   - If not yet decided → ask user to commit to a placeholder (`https://example.com`) and FLAG that sitemap/OG URLs need updating before launch

3. **Logo + brand assets** — does user have:
   - Logo file (SVG preferred, PNG OK)? Path or upload?
   - Brand colors (HEX or "auto-pick from logo")?
   - Brand fonts ("dùng default `Be Vietnam Pro`" / "Inter" / specific?)
   - If `01-brainstorm` already proposed a palette, confirm or override here

### Block 2 — Content & language

4. **Languages — Vietnamese only / VI+EN / khác?**
   - Default: VI only at launch, structure ready for EN later
   - Confirms `15-i18n` scope

5. **Content source — who writes the copy?**
   - User provides text + images (most common)
   - Agent generates placeholder text (lorem-ipsum-VI) for user to replace later
   - CMS integration (Sanity / Contentful / Strapi) — only for FULL tier

### Block 3 — Contact & integrations

6. **Contact form destination**
   - **Email address(es)** to receive submissions
   - **Reply-to** behavior (use form's email field as reply-to: yes/no)
   - **Notification format** (plain email / Slack webhook / both)
   - **Required fields** (name + email + message default; add: phone, company, service interest?)
   - Email service choice: Resend (default, simple) / SendGrid / SMTP custom

7. **Contact info to display publicly**
   - Phone (hotline)
   - Email
   - Address (with map embed yes/no)
   - Social profiles (Facebook, Zalo, TikTok, Instagram, …)
   - Opening hours (if F&B / healthcare / retail)

8. **Analytics — what tracking?**
   - None (default, fastest)
   - Google Analytics 4 (requires Measurement ID)
   - Plausible (privacy-friendly, requires domain)
   - Facebook Pixel (e-commerce-adjacent)
   - Custom

### Block 4 — Technical / hosting

9. **Hosting target**
   - **Vercel** (default — best Next.js support, ISR works out of box, free tier sufficient for most landing sites)
   - **Cloudflare Pages** (alt — needs `next-on-pages` adapter, some ISR limitations)
   - **Self-hosted** (Docker / VPS — full SSR/ISR available, more setup)
   - Hosting decision affects caching strategy (`16-caching`) and OG image setup (`14-og-preview`)

10. **Caching window — recommend 30 minutes ISR default**
    - **30 min (default, recommended)** — content updates appear within 30 min, CDN serves cached for the rest
    - **5-15 min** — for time-sensitive content (event sites, promotions)
    - **1-24 hour** — for truly static content (cuts CDN cost more)
    - **On-demand only** — for CMS-driven sites (revalidate via webhook)
    - Confirms input to `16-caching`. Default 30 min is the standard for landing pages — only override if user has specific reason.

### Block 5 — Visual & preview

11. **OG image (Zalo / Messenger / Facebook preview) strategy**
    - **Static fallback only** — 1 OG image for the whole site (cheapest)
    - **Dynamic per page** — each page gets its own OG image generated from `@vercel/og` (Lean tier OK if user has design assets; Standard tier includes this by default)
    - User can override per-page in `14-og-preview` later

## Optional follow-ups (ask if relevant to tier)

- **Blog / news section** (Standard / Full): yes/no, frequency, author bylines?
- **Newsletter signup** (Standard / Full): integration (Mailchimp / Resend Audience)?
- **Dark mode** (Standard / Full): yes/no
- **Chat widget** (Standard / Full): which (Messenger plugin / Tawk / Crisp / Zalo OA)?
- **Accessibility target** (all tiers): Lighthouse a11y ≥ 90? AAA contrast?
- **Print stylesheet** (rare, ask only if asked first)

## Output

Once all 11 (+ relevant optionals) are answered, produce a concise summary in user's language:

```markdown
## Đã chốt — sẵn sàng spec

| | |
|---|---|
| **Ngành** | Vật liệu Xây dựng |
| **Tier** | Standard |
| **Tên + tagline** | "Vật liệu XD An Phú — Đối tác tin cậy" |
| **Domain** | https://example.vn |
| **Languages** | VI (EN structure ready) |
| **Logo + brand** | logo.svg cung cấp; màu đỏ cam #ea580c + xám đậm |
| **Contact email** | sales@example.vn (reply-to user's email) |
| **Analytics** | GA4 (id: G-XXXX) |
| **Hosting** | Vercel |
| **Caching** | ISR 30 min |
| **OG** | Dynamic per page qua @vercel/og |
| **Blog** | Có (1-2 bài/tuần) |

→ Tiếp theo: `03-write-spec` để mình draft spec; bạn duyệt rồi qua plan và viết code.
```

## Rules

### MUST DO
- Block code generation until ALL 11 questions answered (8-11 if "Khác" industry)
- Surface defaults clearly so user can accept fast ("OK với default 30 min ISR")
- Convert relative dates to absolute (today is 2026-05-16; "next week" → 2026-05-23)
- Save durable answers (domain, hosting, analytics) — these are project-level and should propagate to `orchestration/memories`
- If user says "you decide" → pick the default with explanation, do NOT silently choose

### MUST NOT
- Generate code or commit files at this stage
- Re-ask questions the user already answered (read the conversation)
- Combine unrelated questions into one mega-question (split into blocks of 3-4)
- Accept "thôi tạo đại đi" — that's how the wrong site gets built. Push back: "Mình cần ít nhất domain + contact email trước, các phần khác lấy default cũng được."
- Defer the contact email — that's the difference between a real and fake form

## Anti-patterns
- Skipping production domain question → sitemap and OG URLs ship with `localhost:3000`
- Skipping contact email → form ships fake (`setTimeout`), defeats the point
- Default-everything without confirmation → wrong palette / wrong pages / wrong tier
- Cutting the analytics question to "save time" → user later asks "why no tracking?" and we refactor
- Bundling 11 questions in one wall of text → user gives up; ask in blocks

## Cross-references
- Inputs from: `01-brainstorm` (industry, tier, vibe)
- Outputs to: `03-write-spec` (which then writes the spec doc)
- Domain answer → `13-seo`, `14-og-preview`
- Languages answer → `15-i18n`
- Hosting + caching → `16-caching`
- Contact answers → `18-contact-form`
- Brand assets → `11-theme`
