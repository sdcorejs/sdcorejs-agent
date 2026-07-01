# Next.js Landing Site — SDLC Reference

This file is loaded by `skills/shared/sdlc/0[1-3]-*.md` when the detected track is `nextjs`. Currently scoped to the `build-website` pack — when other Next.js skill packs land (e.g. app dashboards), add their variants here under sub-headings.

---

## Brainstorming: exploration

### Industry-aware proposal pattern
Most landing-site requests start vague ("<localized text>"). The brainstorm forces an industry pick FIRST, then maps to a profile, then proposes 3 tiers.

#### Step A — Detect industry (BLOCKING)
Ask, in user's language:

> Which industry is this website for? Examples:
> - **Construction / Materials**: construction company, cement/steel distributor, interiors, equipment
> - **F&B**: restaurant, cafe, bar, beverage chain
> - **Healthcare / Wellness**: clinic, dental practice, beauty clinic, spa
> - **Education**: language center, preschool, online course
> - **Real estate**: brokerage, apartment project, rental
> - **Business / Consulting**: B2B service, agency, law firm, audit firm
> - **Travel / Hospitality**: tours, homestay, hotel
> - **Retail catalog** (no cart): fashion showroom, handmade goods
> - **Tech / SaaS**: software, app, tool
> - **Nonprofit / Organization**: NGO, community, event
> - Other - please describe

#### Step B — Pull industry profile

| Industry | Vibe | Must-have pages | Key utilities | Image style |
|---|---|---|---|---|
| **Construction / Materials** | Trust, scale, dependable. Earth tones / industrial blues + accent orange | Home / Products (catalog) / About / Capabilities / Contact | Catalog filter, metrics, certificate logos, Maps embed, sticky hotline | Wide-angle warehouse + close-up product, no people focus |
| **F&B** | Appetite, atmosphere. Warm palette (terracotta, cream, deep green); generous serif | Home / Menu / Story / Reservation / Contact + Maps | Menu sections, reservation form, gallery, opening hours, Instagram | Food overhead + 45°, interior atmosphere, candid people |
| **Healthcare / Wellness** | Clean, trustworthy. White + medical blue or sage green; sans-serif neutral | Home / Services / Team / Pricing / Appointment / News / Contact | Appointment booking, credentials wall, before-after gallery, FAQ | Professional staff portraits, clean facility, NO stock cliches |
| **Education** | Inviting, aspirational. Blue + warm accent; rounded sans | Home / Courses / Method / Learners / Enrollment / Blog / Contact | Course catalog, enrollment CTA, testimonials, schedule, brochure | Students + teachers, classroom, learning artifacts |
| **Real estate** | Aspirational, premium. Deep navy / charcoal + gold; serif accent | Home / Projects / Find a home / News / Team / Contact | Property filter, detail (gallery + spec + floorplan + map), agent card | Property exterior + interior, twilight, no people |
| **Business / Consulting** | Professional, confident. Navy + accent; clean sans | Home / Services / Case studies / Team / Insights / Contact | Case study cards, team profiles, whitepaper, lead form, client logos | Team in action, abstract bg, no stock |
| **Travel / Hospitality** | Inspirational, scenic. Sky blue / sand + accent | Home / Tours-Rooms / Experiences / Reviews / Booking / Blog | Tour cards, booking form, reviews carousel, itinerary, gallery | Destination, atmospheric, food + activities |
| **Retail catalog** | Brand-led | Home / Collections / Products / Story / Stores / Contact | Grid + filter, lookbook, store locator, Instagram | Studio + lifestyle |
| **Tech / SaaS** | Modern, energetic. Dark mode + neon, or light + gradient | Home / Features / Pricing / Customers / Docs / Sign up | Feature comparison, pricing tiers, demo CTA, integrations | Product screenshots, isometric, customer logos |
| **Nonprofit** | Human, warm. Mission palette; readable serif/sans mix | Home / Mission / Programs / News / Donate / Join / Contact | Donation widget, volunteer signup, impact metrics, story cards | Real beneficiaries (consent), action shots |

For "<localized text>" → synthesize a profile from the description, present explicitly, ask user to validate.

#### Step C — Propose 3 tiers

```markdown
### A) LEAN (~1 dev week)
- Pages: 3-4 core pages
- Skip: blog, dynamic OG per page, dark mode, analytics dashboard
- Hosting: Vercel free tier
- Best when: launch speed matters, content rarely changes, budget is limited
- Tradeoff: content updates require code changes; SEO is solid but not rich

### B) STANDARD (~2-3 dev weeks) - RECOMMENDED when budget is unclear
- Pages: 3-4 core pages + blog or gallery + ~2 supporting pages
- Includes: full SEO (sitemap/JSON-LD/dynamic OG per page), bilingual support when requested, real contact form, 30-min ISR, light analytics
- Hosting: Vercel Hobby / Pro
- Best when: the site should feel professional and remain extensible

### C) FULL (~4-6 dev weeks)
- Pages: full set + blog with CMS (Sanity / Contentful / Strapi)
- Includes: everything in Standard + headless CMS + admin auth + image CDN + optional A/B testing
- Hosting: Vercel Pro / dedicated
- Best when: marketing will update content independently or traffic is expected to grow
```

---

## Brainstorming: required confirmations

### Minimum-required (blocking)
Ask in groups of 3-4. Each must have an answer before the spec stage.

**Block 1 — Identity**
1. **Site name + tagline (one line)** — used in `<title>`, OG, hero, JSON-LD
2. **Production domain** — used in sitemap, robots, OG absolute URLs, canonical. If undecided, accept `https://example.com` placeholder + FLAG for updating before launch.
3. **Logo + brand assets** — logo file (SVG > PNG), brand colors (HEX or "auto-pick from logo"), brand fonts (default `Be Vietnam Pro` / Inter / custom)

**Block 2 — Content & language**
4. **Languages** — single language / bilingual / other. Default to the user's language at launch, structure ready for another locale later.
5. **Content source** — user provides text+images / agent generates placeholder (lorem-ipsum-VI) / CMS (FULL tier only)

**Block 3 — Contact & integrations**
6. **Contact form destination** — email(s), reply-to behavior, notification format, required fields, email service (Resend default / SendGrid / SMTP)
7. **Public contact info** — phone, email, address (with map yes/no), social profiles, opening hours (F&B / healthcare / retail)
8. **Analytics** — None (default) / GA4 (needs Measurement ID) / Plausible / FB Pixel / Custom

**Block 4 — Technical**
9. **Hosting** — Vercel (default) / Cloudflare Pages (needs `next-on-pages`) / self-hosted
10. **Caching** — 30-min ISR (default, recommended) / 5-15 min (time-sensitive) / 1-24 hour (truly static) / on-demand only (CMS-driven)

**Block 5 — Visual**
11. **OG strategy** — static fallback only / dynamic per page (`@vercel/og`)

### Useful-optional (tier-dependent)
- Blog / news section (Standard / Full)
- Newsletter signup (Standard / Full)
- Dark mode (Standard / Full)
- Chat widget (Standard / Full): Messenger plugin / Tawk / Crisp / Zalo OA
- Accessibility target (all tiers): Lighthouse a11y ≥ 90?

### Summary template
```markdown
## Confirmed - ready for spec

| | |
|---|---|
| **Industry** | <Industry> |
| **Tier** | <Lean | Standard | Full> |
| **Name + tagline** | "<localized text>" |
| **Domain** | <https://...> |
| **Languages** | <single language | bilingual> |
| **Logo + brand** | <files + palette + fonts> |
| **Contact email** | <email> (reply-to: <yes | no>) |
| **Analytics** | <none | GA4 (id: G-...) | Plausible | …> |
| **Hosting** | <Vercel | Cloudflare | self-hosted> |
| **Caching** | ISR <30 min | …> |
| **OG** | <static | dynamic per page> |
| **Blog** | <yes (N posts/week) | no> |

Next: run `sdcorejs-spec` to draft the spec and ask for confirmation in the same gate.
```

---

## Spec

### Path conventions
- Pages (App Router): `app/[locale]/<route>/page.tsx`
- Layouts: `app/[locale]/layout.tsx`, nested per route
- Components: `components/` (organized by section/block)
- Content (externalized): `content/<locale>/<route>.{json|md}`
- Assets: `public/` (logos, OG fallback, brand images)
- API routes: `app/api/<endpoint>/route.ts`
- OG dynamic: `app/<route>/opengraph-image.tsx`
- SEO baseline: `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, `app/icon.svg`, `app/apple-icon.png`
- i18n: `i18n/`, `messages/<locale>.json`, `middleware.ts`

### Architecture section emphasis
Capture:
- App Router boundaries — which pages are server components, which are client, why
- i18n routing strategy (localized pathnames `/san-pham` vs `/products`)
- Caching strategy per route (default 30-min ISR; exceptions explicit)
- OG strategy (static fallback + dynamic per `<route>/opengraph-image.tsx`)
- Contact-form path: route handler at `app/api/contact/route.ts` + Resend integration
- Content externalization (no hardcoded strings in components — all in `content/<locale>/`)

### Acceptance criteria examples
- [ ] All pages return 200 with `next build` + `next start` smoke
- [ ] Lighthouse SEO ≥ 95 on every public route (mobile preset)
- [ ] Lighthouse a11y ≥ 90
- [ ] Every public route has its own `generateMetadata` with title + description
- [ ] OG default image renders on Zalo / Messenger / Facebook / Twitter X share preview
- [ ] Contact form sends real email to `<dest>` and confirms with success UI (no fake `setTimeout`)
- [ ] `npm run check:i18n` exits 0 — full VI/EN parity
- [ ] `npm run check:content` exits 0 — no thin-content warnings for long-form pages
- [ ] ISR revalidates every 30 min (or chosen window); on-demand revalidation works for `<source>` updates
- [ ] All Vietnamese labels render with full diacritics

---

## Plan

### Phase grouping
Each phase below maps to a write-code reference pack the `sdcorejs-nextjs` orchestrator dispatches (under `_refs/nextjs/build-website/write-code/`).
1. **Init** (only if new site): `init-site` pack (create-next-app + standard deps + folder scaffold)
2. **Theme**: `theme` pack (palette + typography + tokens)
3. **i18n**: `i18n` pack (next-intl middleware, message JSON, language switcher, localized pathnames)
4. **Pages & blocks**: `pages-and-blocks` pack (compose section blocks, externalize content)
5. **SEO baseline**: `seo` pack (generateMetadata factory, JSON-LD, sitemap, robots, manifest, favicons)
6. **OG preview**: `og-preview` pack (static fallback + dynamic `opengraph-image.tsx` per route)
7. **Contact form**: `contact-form` pack (zod + react-hook-form + API route + Resend + rate limit)
8. **Caching**: `caching` pack (per-route ISR window + on-demand revalidation)
9. **Responsive**: `responsive` pack (mobile-first audit, breakpoints, touch targets)
10. **Content quality**: `content-quality` pack (word counts, headings, TOC, Article JSON-LD, parity check)
11. **Tests** (if user opted in): e2e via Playwright (`sdcorejs-test`)

### Verification commands
```bash
npm install
npm run build                                                                                                          # expect exit 0
npm run check:i18n                                                                                                     # bilingual parity script
npm run check:content                                                                                                  # word counts, parity, alt-text
npm run lint
# Lighthouse mobile preset (manual or CI)
npx lhci autorun --preset=mobile  # or `lighthouse http://localhost:3000/<route> --preset=mobile`
# Smoke browse: http://localhost:3000/[locale]/<route>
```

### Final-step expectations
Documentation gate supplement: the finish gate loads `_refs/documentation/gate.md`
before documentation tail steps. It may save
`.sdcorejs/documentation/preferences.md`, captures `comment_code`,
`user_guide`, and `technical_doc`, and can insert
`sdcorejs-documentation (write-technical-doc mode)` before verify-before-done
when `technical_doc=write` or `technical_doc=auto` criteria are met.

Last numbered step references the tail-call chain (sdcorejs-test → sdcorejs-review → sdcorejs-repair-loop → sdcorejs-documentation (comment-code mode) → sdcorejs-ship (verify-before-done mode) → sdcorejs-ship (branch-ready mode) → _refs/orchestration/tail/auto-docs.md → sdcorejs-documentation (write-user-guide mode) → _refs/orchestration/tail/auto-task-tracker.md → sdcorejs-explore (memories mode)). The reviewer checks the chain is implicit, not omitted.

### Existing-site improvement variant
If the user is improving an EXISTING site (came via `08-audit-existing-site`), phases are gap-driven, not greenfield. The plan should be one phase per audit finding, ordered Critical → Important → Minor.
