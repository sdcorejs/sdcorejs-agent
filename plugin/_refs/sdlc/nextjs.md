# Next.js Landing Site — SDLC Reference

This file is loaded by `skills/shared/sdlc/0[1-6]-*.md` when the detected track is `nextjs`. Currently scoped to the `build-website` pack — when other Next.js skill packs land (e.g. app dashboards), add their variants here under sub-headings.

---

## Brainstorm

### Industry-aware proposal pattern
Most landing-site requests start vague ("công ty mình muốn có website"). The brainstorm forces an industry pick FIRST, then maps to a profile, then proposes 3 tiers.

#### Step A — Detect industry (BLOCKING)
Ask, in user's language:

> Bạn xây website cho ngành nghề gì? Một số ví dụ:
> - **Xây dựng / Vật liệu**: công ty xây dựng, đại lý xi măng/sắt thép, nội thất, thiết bị
> - **F&B**: nhà hàng, café, beerclub, chuỗi đồ uống
> - **Y tế / Chăm sóc sức khoẻ**: phòng khám, nha khoa, thẩm mỹ viện, spa
> - **Giáo dục**: trung tâm tiếng Anh, trường mầm non, khoá học online
> - **Bất động sản**: môi giới, dự án căn hộ, cho thuê
> - **Doanh nghiệp / Tư vấn**: B2B service, agency, công ty luật, kiểm toán
> - **Du lịch / Lưu trú**: tour, homestay, khách sạn
> - **Bán lẻ catalog** (không giỏ hàng): showroom thời trang, đồ thủ công
> - **Tech / SaaS**: phần mềm, ứng dụng, công cụ
> - **Phi lợi nhuận / Tổ chức**: NGO, cộng đồng, sự kiện
> - Khác — vui lòng mô tả

#### Step B — Pull industry profile

| Industry | Vibe | Must-have pages | Key utilities | Image style |
|---|---|---|---|---|
| **Xây dựng / Vật liệu** | Trust, scale, dependable. Earth tones / industrial blues + accent orange | Home / Sản phẩm (catalog) / Về chúng tôi / Năng lực / Liên hệ | Catalog filter, số liệu, certificate logos, Maps embed, hotline sticky | Wide-angle warehouse + close-up product, no people focus |
| **F&B** | Appetite, atmosphere. Warm palette (terracotta, cream, deep green); generous serif | Home / Menu / Câu chuyện / Đặt bàn / Liên hệ + Maps | Menu sections, reservation form, gallery, opening hours, Instagram | Food overhead + 45°, interior atmosphere, candid people |
| **Y tế / Chăm sóc** | Clean, trustworthy. White + medical blue or sage green; sans-serif neutral | Home / Dịch vụ / Đội ngũ / Bảng giá / Đặt lịch / Tin tức / Liên hệ | Appointment booking, credentials wall, before-after gallery, FAQ | Professional staff portraits, clean facility, NO stock clichés |
| **Giáo dục** | Inviting, aspirational. Blue + warm accent; rounded sans | Home / Khoá học / Phương pháp / Học viên / Tuyển sinh / Blog / Liên hệ | Course catalog, enrollment CTA, testimonials, schedule, brochure | Students + teachers, classroom, learning artifacts |
| **Bất động sản** | Aspirational, premium. Deep navy / charcoal + gold; serif accent | Home / Dự án / Tìm nhà / Tin tức / Đội ngũ / Liên hệ | Property filter, detail (gallery + spec + floorplan + map), agent card | Property exterior + interior, twilight, no people |
| **Doanh nghiệp / Tư vấn** | Professional, confident. Navy + accent; clean sans | Home / Dịch vụ / Case studies / Đội ngũ / Bài viết / Liên hệ | Case study cards, team profiles, whitepaper, lead form, client logos | Team in action, abstract bg, no stock |
| **Du lịch / Lưu trú** | Inspirational, scenic. Sky blue / sand + accent | Home / Tour-Phòng / Trải nghiệm / Đánh giá / Đặt / Blog | Tour cards, booking form, reviews carousel, itinerary, gallery | Destination, atmospheric, food + activities |
| **Bán lẻ catalog** | Brand-led | Home / Bộ sưu tập / Sản phẩm / Câu chuyện / Cửa hàng / Liên hệ | Grid + filter, lookbook, store locator, Instagram | Studio + lifestyle |
| **Tech / SaaS** | Modern, energetic. Dark mode + neon, or light + gradient | Home / Tính năng / Pricing / Customers / Docs / Đăng ký | Feature comparison, pricing tiers, demo CTA, integrations | Product screenshots, isometric, customer logos |
| **Phi lợi nhuận** | Human, warm. Mission palette; readable serif/sans mix | Home / Sứ mệnh / Chương trình / Tin tức / Quyên góp / Tham gia / Liên hệ | Donation widget, volunteer signup, impact metrics, story cards | Real beneficiaries (consent), action shots |

For "Khác" → synthesize a profile from the description, present explicitly, ask user to validate.

#### Step C — Propose 3 tiers

```markdown
### A) LEAN (~1 tuần dev)
- Pages: 3-4 trang core
- Skip: blog, dynamic OG per page, dark mode, analytics dashboard
- Hosting: Vercel free tier
- Phù hợp nếu: cần online sớm, content tự cập nhật, ngân sách hạn chế
- Tradeoff: cập nhật content phải code lại; SEO ổn nhưng không phong phú

### B) STANDARD (~2-3 tuần dev)  ← RECOMMENDED nếu chưa rõ ngân sách
- Pages: 3-4 trang core + blog hoặc gallery + ~2 trang phụ
- Bao gồm: full SEO (sitemap/JSON-LD/dynamic OG per page), bilingual VI/EN, real contact form, ISR 30 min, analytics nhẹ
- Hosting: Vercel Hobby / Pro
- Phù hợp nếu: muốn site chuyên nghiệp, có thể mở rộng

### C) FULL (~4-6 tuần dev)
- Pages: full set + blog với CMS (Sanity / Contentful / Strapi)
- Bao gồm: tất cả Standard + headless CMS + auth admin + image CDN + A/B test optional
- Hosting: Vercel Pro / dedicated
- Phù hợp nếu: team marketing tự cập nhật content, traffic dự kiến lớn
```

---

## Clarify

### Minimum-required (blocking)
Ask in groups of 3-4. Each must have an answer before the spec stage.

**Block 1 — Identity**
1. **Site name + tagline (1 dòng)** — used in `<title>`, OG, hero, JSON-LD
2. **Production domain** — used in sitemap, robots, OG absolute URLs, canonical. If undecided, accept `https://example.com` placeholder + FLAG for updating before launch.
3. **Logo + brand assets** — logo file (SVG > PNG), brand colors (HEX or "auto-pick from logo"), brand fonts (default `Be Vietnam Pro` / Inter / custom)

**Block 2 — Content & language**
4. **Languages** — VI only / VI+EN / khác. Default VI at launch, structure ready for EN later.
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
## Đã chốt — sẵn sàng spec

| | |
|---|---|
| **Ngành** | <Industry> |
| **Tier** | <Lean | Standard | Full> |
| **Tên + tagline** | "<Site name — tagline>" |
| **Domain** | <https://...> |
| **Languages** | <VI only | VI+EN> |
| **Logo + brand** | <files + palette + fonts> |
| **Contact email** | <email> (reply-to: <yes | no>) |
| **Analytics** | <none | GA4 (id: G-...) | Plausible | …> |
| **Hosting** | <Vercel | Cloudflare | self-hosted> |
| **Caching** | ISR <30 min | …> |
| **OG** | <static | dynamic per page> |
| **Blog** | <yes (N bài/tuần) | no> |

→ Tiếp theo: `sdcorejs-write-spec` để mình draft spec.
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
1. **Init** (only if new site): `10-init-site` (create-next-app + standard deps + folder scaffold)
2. **Theme**: `11-theme` (palette + typography + tokens)
3. **i18n**: `15-i18n` (next-intl middleware, message JSON, language switcher, localized pathnames)
4. **Pages & blocks**: `12-pages-and-blocks` (compose section blocks, externalize content)
5. **SEO baseline**: `13-seo` (generateMetadata factory, JSON-LD, sitemap, robots, manifest, favicons)
6. **OG preview**: `14-og-preview` (static fallback + dynamic `opengraph-image.tsx` per route)
7. **Contact form**: `18-contact-form` (zod + react-hook-form + API route + Resend + rate limit)
8. **Caching**: `16-caching` (per-route ISR window + on-demand revalidation)
9. **Responsive**: `17-responsive` (mobile-first audit, breakpoints, touch targets)
10. **Content quality**: `19-content-quality` (word counts, headings, TOC, Article JSON-LD, parity check)
11. **Tests** (if user opted in): e2e via Playwright (`testing/e2e/nextjs.md`)

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
Last numbered step references the tail-call chain (40-e2e-test → sdcorejs-review-code → orchestration/repair-loop → orchestration/comment-code → orchestration/verify-before-done → orchestration/auto-docs → orchestration/auto-task-tracker → orchestration/memories). The reviewer checks the chain is implicit, not omitted.

### Existing-site improvement variant
If the user is improving an EXISTING site (came via `08-audit-existing-site`), phases are gap-driven, not greenfield. The plan should be one phase per audit finding, ordered Critical → Important → Minor.
