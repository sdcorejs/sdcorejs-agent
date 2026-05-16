---
name: nextjs-build-website-brainstorm
description: Use BEFORE any landing-site code is generated, when the user has an open-ended idea like "tạo website cho công ty xây dựng", "landing page cho nhà hàng", "build a clinic site", or when industry/audience/pages aren't yet decided. Industry-aware — detects the business sector and proposes 2-3 site concepts (theme vibe, page set, key utilities, image style) with tradeoffs, recommends one. Different from `02-clarify-requirements` which hard-confirms after direction is chosen. Bilingual (VI/EN).
allowed-tools: Read, WebFetch
---

# Build Website — Industry-Aware Brainstorm

## Purpose
Most landing-site requests start vague: "công ty mình muốn có 1 website". The site that ships if you skip this step is generic — same hero, same 3 features, same beige palette. This skill forces the conversation through industry-specific patterns FIRST, so the spec downstream is targeted.

## When invoked
- User says "tạo landing page", "build website", "tạo trang giới thiệu", "ý tưởng cho website", "should I add X to my site"
- Industry / target audience / pages aren't yet fixed
- After session start when no spec exists

Skip if:
- User has already provided spec / mockup / detailed brief → go to `02-clarify-requirements`
- Existing site, only refining one page → go to `12-pages-and-blocks`

## Workflow

### Step 1 — Detect the industry (BLOCKING)
Ask, in user's language:

> Bạn xây website cho ngành nghề gì? Một số ví dụ:
> - **Xây dựng / Vật liệu** (như Mỹ Hoà): công ty xây dựng, đại lý xi măng/sắt thép, nội thất, thiết bị
> - **F&B**: nhà hàng, café, beerclub, chuỗi đồ uống
> - **Y tế / Chăm sóc sức khoẻ**: phòng khám, nha khoa, thẩm mỹ viện, spa
> - **Giáo dục**: trung tâm tiếng Anh, trường mầm non, khoá học online
> - **Bất động sản**: môi giới, dự án căn hộ, cho thuê
> - **Doanh nghiệp / Tư vấn**: B2B service, agency, công ty luật, kiểm toán
> - **Du lịch / Dịch vụ lưu trú**: tour, homestay, khách sạn
> - **Bán lẻ catalog** (không có giỏ hàng): showroom thời trang, đồ thủ công
> - **Tech / SaaS**: phần mềm, ứng dụng, công cụ
> - **Phi lợi nhuận / Tổ chức**: NGO, cộng đồng, sự kiện
> - Khác — vui lòng mô tả

DO NOT proceed without an answer. If the user picks "Khác", ask for 1-2 sentences describing what their business does.

### Step 2 — Pull the industry profile

Match the answer against the table below. Each profile is a starting point — the user can override anything in `02-clarify-requirements`.

| Industry | Vibe | Must-have pages | Key utilities | Image style |
|---|---|---|---|---|
| **Xây dựng / Vật liệu** | Trust, scale, dependable. Earth tones / industrial blues + accent orange | Home / Sản phẩm (catalog) / Về chúng tôi / Năng lực (factory/warehouse photos) / Liên hệ | Catalog filter (loại / nhóm), số liệu (năm hoạt động, dự án, m²), certificate logos, Google Maps embed, hotline sticky | Wide-angle warehouse + close-up product, no people focus |
| **F&B** | Appetite, atmosphere. Warm palette (terracotta, cream, deep green); generous serif/script | Home / Menu / Câu chuyện / Đặt bàn / Tin tức/khuyến mãi (optional) / Liên hệ + Google Maps | Menu sections, reservation form (date/time/party size), gallery (food + interior), opening hours block, social embeds (Instagram) | Close-up food (overhead + 45°), interior atmosphere, candid people enjoying |
| **Y tế / Chăm sóc** | Clean, trustworthy. White + medical blue or sage green; sans-serif neutral | Home / Dịch vụ / Đội ngũ bác sĩ / Bảng giá / Đặt lịch / Tin tức/blog / Liên hệ | Appointment booking (date/service/practitioner), credentials wall, before-after gallery (with consent), FAQ section, insurance/payment info | Professional staff portraits, clean facility, NO stock-photo medical clichés |
| **Giáo dục** | Inviting, aspirational. Blue + warm accent (yellow / coral); rounded sans | Home / Khoá học / Phương pháp / Học viên (testimonials/results) / Tuyển sinh / Blog / Liên hệ | Course catalog, enrollment CTA, testimonials with photo+name+result, schedule timeline, downloadable brochure | Students + teachers interacting, classroom atmosphere, learning artifacts |
| **Bất động sản** | Aspirational, premium. Deep navy / charcoal + gold; serif accent | Home / Dự án / Tìm nhà (filter) / Tin tức thị trường / Đội ngũ / Liên hệ | Property filter (loại / giá / khu vực), property detail (gallery + spec table + floorplan + map), agent contact card, mortgage calculator (optional) | Property exterior + interior, no people, twilight shots |
| **Doanh nghiệp / Tư vấn** | Professional, confident. Navy / charcoal + accent; clean sans | Home / Dịch vụ / Khách hàng/case studies / Đội ngũ / Bài viết / Liên hệ | Case study cards (industry + result), team profiles, downloadable whitepaper, lead form, client logos wall | Team in action, abstract/geometric backgrounds, no stock clichés |
| **Du lịch / Lưu trú** | Inspirational, scenic. Sky blue / sand + accent; cursive accent | Home / Tour/Phòng / Trải nghiệm / Đánh giá / Đặt phòng/tour / Blog | Tour/room cards (price + duration + highlights), booking form (date/guests), reviews carousel, itinerary timeline, photo-heavy gallery | Destination shots, atmospheric/wide, food + activities, happy guests |
| **Bán lẻ catalog** | Brand-led. Match brand personality (minimal / artisan / luxe) | Home / Bộ sưu tập / Sản phẩm / Câu chuyện / Cửa hàng / Liên hệ | Product grid + filter, lookbook gallery, store locator (Maps), Instagram embed, size guide | Studio product shots + lifestyle, brand-consistent |
| **Tech / SaaS** | Modern, energetic. Dark mode + neon accent or light + bold gradient | Home / Tính năng / Bảng giá / Khách hàng / Tài liệu / Đăng ký | Feature comparison table, pricing tiers, demo CTA, integration logos, code/screenshot blocks | Product screenshots, isometric illustrations, customer logos |
| **Phi lợi nhuận** | Human, warm. Mission-driven palette; readable serif/sans mix | Home / Sứ mệnh / Chương trình / Tin tức / Quyên góp / Tham gia / Liên hệ | Donation widget (Stripe/MoMo), volunteer signup, impact metrics, story cards, partner logos | Real beneficiaries (consent), action shots, community |

If user picked "Khác" → synthesize a profile from the description, present it explicitly, and ask the user to validate.

### Step 3 — Propose 2-3 concepts

Always offer 3 levels, framed as tradeoffs:

```markdown
## 3 hướng đi cho website [ngành nghề] của bạn

### A) LEAN (~1 tuần dev)
- Pages: [3-4 trang core]
- Skip: blog, dynamic OG per page, dark mode, analytics dashboard
- Hosting: Vercel free tier
- Phù hợp nếu: cần online sớm, content sẽ tự cập nhật, ngân sách hạn chế
- Tradeoff: cập nhật content phải code lại (chưa CMS); SEO ổn nhưng không phong phú

### B) STANDARD (~2-3 tuần dev)  ← RECOMMENDED nếu chưa rõ ngân sách
- Pages: [3-4 trang core + blog hoặc gallery + ~2 trang phụ]
- Bao gồm: full SEO (sitemap/JSON-LD/dynamic OG per page), bilingual VI/EN, real contact form, ISR 30 min, analytics nhẹ
- Hosting: Vercel Hobby / Pro
- Phù hợp nếu: muốn site chuyên nghiệp, có thể mở rộng, hỗ trợ team marketing
- Tradeoff: chưa có CMS, content vẫn trong code (nhưng đã externalize → CMS sau dễ)

### C) FULL (~4-6 tuần dev)
- Pages: full set + blog với CMS (Sanity / Contentful / Strapi)
- Bao gồm: tất cả của Standard + headless CMS + auth admin + image CDN + A/B test optional
- Hosting: Vercel Pro / dedicated
- Phù hợp nếu: team marketing tự cập nhật được content, có nhiều campaign, traffic dự kiến lớn
- Tradeoff: chi phí CMS + setup phức tạp; cần training team cập nhật content

### Mình recommend [A/B/C] vì [reason dựa trên context user đã chia sẻ].
### Bạn chọn hướng nào, hay điều chỉnh khác?
```

### Step 4 — Capture user's pick and key opinions

Once user picks, write a short note (in user's language) that summarizes:
- Industry + chosen vibe
- Page set agreed
- Tier (Lean / Standard / Full)
- Any anti-preferences ("không muốn animation màu mè", "tránh stock photo")
- Languages target (VI default, EN optional)
- Caching default (30 min ISR — confirm or adjust)

This becomes the input to `02-clarify-requirements`, which then hard-confirms remaining blockers.

## Rules

### MUST DO
- ASK industry FIRST — never assume
- Use the table as a starting point; don't invent generic recommendations
- Always offer 3 tiers (Lean / Standard / Full) so the user can see tradeoffs
- Recommend one tier with explicit reasoning, but yield to user's pick
- Capture anti-preferences (what they DON'T want) — these prevent rework
- Output in user's session language
- Hand off cleanly to `02-clarify-requirements` after pick

### MUST NOT
- Generate code, file paths, or designs at this stage
- Lock in tech choices (CMS / framework features) before user picks a tier
- Recommend Full tier when user signals budget concerns
- Ignore industry — generic "modern landing page" is the failure mode
- Skip the tradeoff section — "what could I have done?" is a real question

## Anti-patterns
- "Modern, clean, responsive" — meaningless; every site claims this
- Auto-picking the most complex tier — overbuilds for small businesses
- Recommending features the industry doesn't need (e.g. pricing table for a nonprofit)
- Showing the same hero pattern regardless of industry
- Treating brainstorm as a checkbox — if the user replies "anything", press for the industry once more before falling back to Standard tier

## Cross-references
- After this skill: `02-clarify-requirements`
- Industry profiles inform `11-theme` (palette/typography) and `12-pages-and-blocks` (page set)
- Caching tier hint feeds into `16-caching`
- Languages question feeds into `15-i18n`
