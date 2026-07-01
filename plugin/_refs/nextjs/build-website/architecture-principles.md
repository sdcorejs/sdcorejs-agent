# Next.js Landing Site — Architecture Principles

Source of truth for **WHY** SDCoreJS landing sites look the way they do. Loaded on demand by `sdcorejs-brainstorming`, `sdcorejs-spec`, the `sdcorejs-nextjs` orchestrator (theme / pages-and-blocks / seo / i18n packs), and `sdcorejs-review`.

If a generated file contradicts a principle here, that file is wrong. If a principle here contradicts a real-world need, **the principle is wrong** — surface it as feedback.

Scope: this file applies to the `build-website` pack (public-facing landing sites). When other Next.js skill packs ship (e.g. dashboards, e-commerce), add their variants under sub-headings.

---

## 1. App Router by default

Use App Router (`app/`), never Pages Router (`pages/`).

```
app/
├── [locale]/                     ← i18n-prefixed routes
│   ├── layout.tsx                ← per-locale root layout
│   ├── page.tsx                  ← home
│   ├── san-pham/                 ← localized pathnames (VI uses Vietnamese paths)
│   │   └── page.tsx
│   ├── ve-chung-toi/page.tsx
│   └── lien-he/page.tsx
├── api/contact/route.ts          ← real contact form endpoint
├── sitemap.ts                    ← dynamic sitemap
├── robots.ts                     ← robots.txt
├── manifest.ts                   ← PWA manifest + favicon variants
├── icon.svg                      ← favicon source
├── apple-icon.png                ← iOS home-screen icon
└── opengraph-image.tsx           ← static fallback OG (per-route override OK)
```

**Why App Router**: server components by default = smaller bundle + better SEO + streaming. Pages Router is legacy; Next.js team's investment is on App Router.

---

## 2. Server components by default; client components opt-in

Every component is a server component until proven otherwise. Add `"use client"` ONLY when the component needs:
- Hooks (`useState`, `useEffect`, `useRef`, …)
- Browser-only APIs (`window`, `localStorage`, `IntersectionObserver`)
- Event handlers (`onClick`, `onChange`, `onSubmit`)
- 3rd-party libs that ship hooks (Framer Motion, react-hook-form, …)

```tsx
// ✅ server component (default)
export default function Hero({ data }: { data: HeroData }) {
  return <section>...</section>;
}

// ✅ client component when needed
"use client";
export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  return <form>...</form>;
}
```

**Why**: server components don't ship JS to the client. A 200-line server component costs 0 bytes to the user. A 200-line client component costs ~10 KB (gzipped, including React runtime). Default to server.

**Reviewer**: `sdcorejs-review` flags `"use client"` without justification as **Medium**.

---

## 3. Content is data, not code

Hardcoded strings in components = death by a thousand re-deploys.

```
content/
├── vi/
│   ├── home.json
│   ├── san-pham.json
│   └── ve-chung-toi.json
└── en/
    ├── home.json
    ├── products.json
    └── about.json
```

Components import the locale-appropriate JSON via the i18n loader:

```tsx
import { getContent } from '@/lib/content';

export default async function HomePage({ params: { locale } }) {
  const content = await getContent(locale, 'home');
  return <Hero title={content.hero.title} cta={content.hero.cta} />;
}
```

**Why**:
- Editor / marketing team can update copy without touching code
- VI/EN parity check (`npm run check:i18n`) compares JSON shape, not regex over `.tsx`
- Future CMS swap (Sanity / Contentful) replaces ONLY the loader, components stay
- Content-quality script (`npm run check:content`) can audit word counts per page

**Enforce**: `sdcorejs-review` flags hardcoded Vietnamese / English strings in components as **Medium**.

---

## 4. i18n via `next-intl` with localized pathnames

```
app/[locale]/san-pham/page.tsx           ← VI URL: /vi/san-pham
app/[locale]/products/page.tsx           ← (alternate; pathnames config picks the right one)
i18n/routing.ts                          ← pathnames config: { '/san-pham': { vi: '/san-pham', en: '/products' } }
middleware.ts                             ← detects locale from URL, falls back to `Accept-Language`
messages/vi.json                          ← UI strings (buttons, labels, errors)
messages/en.json
```

VI is first-class (default locale at launch). EN structure-ready for future toggle.

**Localized pathnames**: `/san-pham` for VI, `/products` for EN. NOT `/vi/products` or `/en/san-pham`. Reasons:
- SEO: each locale's URL matches the user's search terms in their language
- Sharing: link looks natural ("vietnamese URL for vietnamese reader")
- Analytics: GA segments cleaner per locale

**Why next-intl over next-i18next**: server-component-native; works without `getStaticProps`.

---

## 5. SEO baseline is NON-NEGOTIABLE

Every public route MUST emit:
- `<title>` and `<meta name="description">` via `generateMetadata`
- Canonical URL pointing to production domain
- OG title / description / image (per-route OK; static fallback REQUIRED)
- Twitter Card with same image
- JSON-LD structured data appropriate to page type:
  - Home → `Organization` + `WebSite`
  - Service / product detail → `Product` or `Service`
  - Blog post → `Article` with `author`, `datePublished`, `dateModified`
  - Local business → `LocalBusiness` with `address`, `geo`, `openingHours`
  - Anywhere with breadcrumbs → `BreadcrumbList`
- Production-absolute URLs in OG / sitemap (never `localhost`)

`app/sitemap.ts` and `app/robots.ts` are required. `app/manifest.ts` + `icon.svg` + `apple-icon.png` for favicon coverage.

**Why**: Vietnamese landing-site projects ship → 2 weeks pass → owner asks "<localized text>". The investment of 30 minutes during generation saves a frantic Lighthouse audit later.

**Reviewer**: missing `generateMetadata` on a public route = **Critical**.

---

## 6. Caching — 30-minute ISR by default

```tsx
// app/[locale]/san-pham/page.tsx
export const revalidate = 1800; // 30 minutes — DEFAULT for landing sites
```

Decision tree:
- Truly static (about-us): `export const dynamic = 'force-static'` + no revalidate (build-time only)
- Standard landing page: **`revalidate = 1800`** (30 min)
- Time-sensitive (event countdown, daily deal): `revalidate = 300` (5 min)
- CMS-driven: `revalidate = 0` (dynamic) + on-demand revalidation via webhook
- Per-user / authenticated: `dynamic = 'force-dynamic'` (rare for landing sites)

**On-demand revalidation** for content updates:
```ts
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
// triggered by CMS webhook OR contact-form submission OR admin action
```

**Why 30 min default**: content updates from marketing team appear within half an hour (good UX for them) while CDN cache hit rate stays >95% (low cost, fast). Shorter = more compute. Longer = stale content frustrates updates.

**Reviewer**: missing `revalidate` on a route that isn't `force-static` = **Important**.

---

## 7. OG strategy — static fallback + dynamic per-route

- **Static fallback** at `app/opengraph-image.tsx` (and `app/twitter-image.tsx` if Twitter needs differ) — used when no per-route OG exists. Required for every site.
- **Dynamic per-route** at `app/<route>/opengraph-image.tsx` using `@vercel/og` — for landing pages with rich preview (product, article, location)
- File names matter: Next.js auto-routes `opengraph-image.{tsx,png,jpg}` and `opengraph-image.alt.txt`. Don't fight the convention.

**Test before launch**:
- Zalo: share URL into chat → preview shows correct image + title
- Messenger: same
- Facebook: https://developers.facebook.com/tools/debug/ → re-scrape
- Twitter: https://cards-dev.twitter.com/validator
- LinkedIn: their preview tool

**Why all 4 platforms**: Vietnamese audience uses Zalo + Facebook heavily. Western audience uses Twitter + LinkedIn. Skip one, lose visibility there.

---

## 8. Contact form is REAL, not `setTimeout`

```tsx
"use client";
const onSubmit = async (data: ContactFormData) => {
  setSubmitting(true);
  const res = await fetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  // handle real success / error
};
```

API route uses Resend (default), SendGrid, or SMTP:

```ts
// app/api/contact/route.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { name, email, message } = await req.json();
  // zod validation
  // in-memory rate limiting (10 req/min/IP)
  await resend.emails.send({
    from: 'noreply@yourdomain.vn',
    to: process.env.CONTACT_DEST_EMAIL!.split(','),
    replyTo: email,
    subject: `<localized text>`,
    text: message,
  });
  return Response.json({ ok: true });
}
```

**Anti-pattern**: `setTimeout(() => setSuccess(true), 1000)` masquerading as a working form. This is in every Next.js starter template. **DELETE IT.** A landing site whose contact form doesn't send email is broken.

**Reviewer**: `setTimeout` in contact-form code without justification = **Critical**.

---

## 9. `next/image` for every image (not `<img>`)

```tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="<localized text>"
  width={1920}
  height={1080}
  priority                                            // above-the-fold
  sizes="100vw"                                        // responsive sizing hint
/>
```

- Width / height required (prevents CLS — Cumulative Layout Shift)
- `alt` describes the image's CONTENT, not "image of …" (for screen readers + SEO)
- `priority` on the LCP element (usually hero) — preloads it
- `sizes` matches the responsive viewport behavior (`100vw` for full-bleed, `(min-width: 768px) 50vw, 100vw` for grid items)

**Why**: `next/image` auto-generates WebP/AVIF variants, serves the right size per viewport, lazy-loads below-the-fold. Plain `<img>` ships the original file to every user.

**Reviewer**: `<img>` in TSX (outside `<noscript>` fallbacks) = **Important**.

---

## 10. Typography — `prose` + Tailwind Typography for long-form

```tsx
<article className="prose prose-lg prose-slate max-w-prose">
  <h1>...</h1>
  <p>...</p>
</article>
```

Long-form pages (blog posts, service pages with body copy, FAQs) use `@tailwindcss/typography` `prose` classes. Don't hand-tune `<h2>` margins per page.

Heading hierarchy: every page has exactly ONE `<h1>` (matches `<title>`). `<h2>` for top-level sections. Skip levels (`<h2>` → `<h4>`) = SEO penalty.

Table of Contents for articles >800 words. Heading anchors auto-generated.

**Why**: consistent reading experience across the site. Custom CSS per page = inconsistent type scale, broken vertical rhythm.

---

## 11. Content quality is a tested criterion

```bash
npm run check:content
```

Script asserts:
- Each page meets minimum word count for its type (home ≥150 words, service detail ≥400, blog ≥800)
- No "lorem ipsum" / "Lorem ipsum" / "TODO" in production content
- Every image has non-empty `alt`
- VI/EN parity: every key in `content/vi/*.json` has matching key in `content/en/*.json` (if EN enabled)
- Heading hierarchy is valid per page

**Why**: a thin landing page (60-word "About us") signals to Google that the site is low-effort and hurts the whole domain's rankings. Better to ship 5 well-written pages than 15 thin ones.

---

## 12. Responsive — mobile-first, Tailwind breakpoints

Default styles target mobile (≤640px). Use `sm:` `md:` `lg:` `xl:` `2xl:` prefixes for larger viewports.

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

Constraints:
- Touch targets ≥44px (Tailwind: `min-h-11 min-w-11`)
- Container max-width: `max-w-7xl` for wide content sections, `max-w-prose` (~65ch) for long-form
- Font scales: never go below 14px on mobile body text
- Hover states have a tap-equivalent (no hover-only navigation)

**Why mobile-first**: 70%+ of Vietnamese traffic is mobile. If the desktop experience drives the design, mobile breaks. If mobile drives, desktop just scales up.

**Reviewer**: hover-only menu without mobile equivalent = **Important**.

---

## 13. Accessibility baseline — Lighthouse ≥90

Every public route must score ≥90 on Lighthouse a11y audit:
- Color contrast ≥4.5:1 (text) / ≥3:1 (large text + UI components)
- Every interactive element keyboard-reachable + focus-visible
- Form inputs have labels (visible or `aria-label`)
- Heading hierarchy valid (rule 10 above)
- `<html lang>` matches the locale
- Sufficient ARIA only where semantic HTML can't express the meaning

Don't aim for 100. A site that scores 92 with clear focus rings beats a 100 with weird live-region announcements.

---

## 14. Hosting — Vercel default, alternates supported

Vercel default because:
- App Router + ISR + on-demand revalidation work without config
- `@vercel/og` for dynamic OG images is first-class
- Free tier sufficient for most landing sites
- Preview deployments per branch

Cloudflare Pages alternative: needs `@cloudflare/next-on-pages` adapter; some ISR limitations.
Self-hosted (Docker): full SSR + ISR available; more ops work.

**Why surface this in principles**: the deploy target affects routing config (`output: 'standalone'` for Docker), caching strategy (Cloudflare KV vs Vercel KV vs none), and OG image generation (Vercel Edge Runtime vs serverless).

---

## 15. Site is not the agent

This skill set generates Next.js landing sites. The principles above govern the **generated code**, not this `sdcorejs-agent` repo. When a developer asks "why does the generated site do X", the answer comes from this file — not from the skill body that emitted X.

When a principle changes, propagate to:
- The reference pack that generates it (`_refs/nextjs/build-website/write-code/{init-site,theme,seo}.md`, …)
- The reviewer (`sdcorejs-review`)
- The auto-docs template if dimension changes

---

## Anti-principles (NOT to do)

- ❌ "Drop everything into client components for safety" — defeats server-rendering benefit; ship-time bundle bloats
- ❌ "Hardcode Vietnamese strings, translate later" — later never comes; content stays trapped in JSX
- ❌ "Skip ISR, render every request" — burns compute; cache hit rate at zero
- ❌ "Fake contact form ships fine, fix when we have email" — fake form ships, never gets fixed, users send emails into the void for 3 months
- ❌ "Use `<img>` because it's simpler" — gigabyte hero images, 4× LCP, mobile users bounce
- ❌ "Throw lorem ipsum, the client will give content tomorrow" — tomorrow becomes Monday becomes next sprint becomes production
- ❌ "OG image is optional" — without it, every shared URL looks broken in Zalo/Messenger
- ❌ "Cache forever" — content updates require a deploy = friction = no one updates content = site grows stale

---

## Related references

- `_refs/sdlc/nextjs.md` — design-phase patterns (industry table, blocking checklist, plan phase grouping)
- `sdcorejs-using-skills` — onboarding / entry point
- `_refs/nextjs/build-website/write-code/seo.md` — SEO baseline implementation
- `_refs/nextjs/build-website/write-code/caching.md` — caching strategy
- `_refs/nextjs/build-website/write-code/content-quality.md` — long-form authoring rules
