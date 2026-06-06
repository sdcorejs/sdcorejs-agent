> **Reference for the `nextjs-write-code` orchestrator.** Loaded on demand when the
> confirmed plan routes a step here. Not a standalone skill — the orchestrator reads this file via
> its dispatch table. Sibling reference packs live in the same dir; track-level refs under `_refs/nextjs/build-website/`.

# Build Website — Pages & Section Blocks

## Purpose
A landing site is composition: same 8-10 reusable section types arranged differently per page. This skill defines the section library, the per-page composition rules, and the strict content-externalization rule that makes the site i18n-ready, CMS-ready, and review-stable.

## When invoked
- Automatic after `theme.md` + `i18n.md` in a "Full build" dispatch
- User says "add a page", "thêm trang", "tạo section hero", "compose home page"
- Refactoring an existing page to use the section library

Prerequisites:
- Theme tokens exist (`theme.md` done)
- next-intl is wired (`i18n.md` done, or at least messages files exist)

## The strict rule — no hardcoded strings

**Section components receive ALL strings as props.** They do NOT contain Vietnamese (or English) text literals. Content lives in:
1. `src/content/<locale>/<page>.ts` — typed data per page (products, services, milestones)
2. `src/i18n/messages/<locale>.json` — UI strings (button labels, nav, generic copy)

This is the #1 rule that separates a production-grade landing site from a throwaway. Without it, adding i18n or wiring a CMS later requires a full component rewrite.

## Section library — what's in `src/components/sections/`

| Section | File | Use case | Props |
|---|---|---|---|
| Hero | `hero.tsx` | Above-the-fold attention | `title`, `subtitle`, `cta`, `image` |
| HeroSplit | `hero-split.tsx` | Hero with image side | `title`, `subtitle`, `cta`, `image`, `imagePosition` |
| Features | `features.tsx` | 3-6 feature cards | `title`, `items: { icon, title, description }[]` |
| BentoGrid | `bento-grid.tsx` | Asymmetric feature highlight (Standard+) | `items: { span, content }[]` |
| Testimonials | `testimonials.tsx` | Social proof carousel | `quotes: { author, role, quote, avatar }[]` |
| LogoCloud | `logo-cloud.tsx` | Client / partner / cert logos | `logos: { name, src, href? }[]` |
| Stats | `stats.tsx` | Metric callout (10+ years, 1000+ projects) | `items: { value, label }[]` |
| Pricing | `pricing.tsx` | Tiered pricing table | `tiers: { name, price, features, cta }[]` |
| FAQ | `faq.tsx` | Accordion Q&A | `items: { question, answer }[]` |
| Gallery | `gallery.tsx` | Image grid / lightbox | `images: { src, alt, caption? }[]` |
| ContactCTA | `contact-cta.tsx` | Mid-page CTA strip | `title`, `subtitle`, `cta` |
| ContactForm | `contact-form.tsx` | Inline form (uses `contact-form.md`) | `(none — form owns its strings via i18n)` |
| Map | `map.tsx` | Google Maps embed | `address`, `lat`, `lng`, `zoom?` |
| Newsletter | `newsletter.tsx` | Email capture | `title`, `placeholder`, `cta` |
| BlogList | `blog-list.tsx` | (Standard+ with blog) | `posts: { title, excerpt, slug, date, cover }[]` |

Each component is a **server component by default** (no `"use client"`). Only `ContactForm`, `Gallery` (if it has a lightbox), and `Newsletter` need `"use client"` due to interactivity.

## Per-page composition pattern

**`src/app/[locale]/page.tsx`** (home — for a construction company):
```typescript
import { setRequestLocale } from 'next-intl/server';
import { unstable_cacheLife as cacheLife } from 'next/cache';
import { Hero } from '@/components/sections/hero';
import { Features } from '@/components/sections/features';
import { LogoCloud } from '@/components/sections/logo-cloud';
import { Stats } from '@/components/sections/stats';
import { ContactCTA } from '@/components/sections/contact-cta';
import { getHomeContent } from '@/content/home';

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  'use cache';
  cacheLife({ revalidate: 1800, stale: 1800 });
  setRequestLocale(locale);

  const content = await getHomeContent(locale);

  return (
    <main>
      <Hero
        title={content.hero.title}
        subtitle={content.hero.subtitle}
        cta={content.hero.cta}
        image={content.hero.image}
      />
      <Features title={content.features.title} items={content.features.items} />
      <Stats items={content.stats} />
      <LogoCloud logos={content.partners} />
      <ContactCTA {...content.contactCta} />
    </main>
  );
}

// Per-page metadata (handled by seo.md)
export { generateMetadata } from '@/lib/seo';
```

**`src/content/<locale>/home.ts`** — per-locale typed content:
```typescript
import { Building2, Truck, Shield, Award } from 'lucide-react';

export async function getHomeContent(locale: string) {
  const dict = await import(`./home.${locale}.json`).then(m => m.default);
  return {
    hero: {
      title: dict.hero.title,
      subtitle: dict.hero.subtitle,
      cta: { label: dict.hero.ctaLabel, href: '/lien-he' },
      image: '/images/hero-warehouse.jpg',
    },
    features: {
      title: dict.features.title,
      items: [
        { icon: Building2, title: dict.features.scale.title, description: dict.features.scale.desc },
        { icon: Truck, title: dict.features.delivery.title, description: dict.features.delivery.desc },
        { icon: Shield, title: dict.features.quality.title, description: dict.features.quality.desc },
        { icon: Award, title: dict.features.certified.title, description: dict.features.certified.desc },
      ],
    },
    stats: [
      { value: dict.stats.years.value, label: dict.stats.years.label },
      { value: dict.stats.projects.value, label: dict.stats.projects.label },
      { value: dict.stats.area.value, label: dict.stats.area.label },
    ],
    partners: [
      { name: 'Partner A', src: '/images/partners/a.svg' },
      { name: 'Partner B', src: '/images/partners/b.svg' },
    ],
    contactCta: {
      title: dict.contactCta.title,
      subtitle: dict.contactCta.subtitle,
      cta: { label: dict.contactCta.ctaLabel, href: '/lien-he' },
    },
  };
}
```

The actual VI strings live in `src/content/vi/home.vi.json`; EN in `home.en.json`. Both are loaded by the same content getter function via dynamic import. This keeps the COMPONENT structure declarative and the COPY swappable.

(Alternative simpler pattern for sites that won't use CMS: skip the `dict` indirection and put VI strings directly in `home.vi.ts`. Either way, components never see literals.)

## Section component template (Server Component)

**`src/components/sections/features.tsx`**:
```typescript
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeaturesProps {
  title: string;
  items: FeatureItem[];
  className?: string;
}

export function Features({ title, items, className }: FeaturesProps) {
  return (
    <section className={cn('py-section', className)}>
      <div className="container max-w-container mx-auto px-4">
        <h2 className="text-center font-bold mb-12">{title}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 p-6">
              <item.icon className="size-10 text-brand mb-4" aria-hidden />
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-neutral-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Rules for section components:
1. Server component by default. Client only when needed.
2. Accept `className?: string` for layout overrides at the page level.
3. Use tokens (`bg-brand`, `text-neutral-600`, `py-section`) — never raw colors.
4. ARIA labels in English where required (`aria-hidden`, `role`); user-facing labels via props.
5. Image rendering uses `next/image` with explicit `sizes` (see `responsive.md`).

## Adding a new page

Process:
1. Decide which sections from the library compose the page (typical: hero + 2-4 sections + contact CTA).
2. Create `src/app/[locale]/<route>/page.tsx`.
3. Create `src/content/<locale>/<route>.ts` + i18n JSON files.
4. Wire `generateMetadata` (see `seo.md`).
5. Add the page to `src/app/sitemap.ts` automatically (sitemap reads from a route registry).
6. Add per-locale path to `src/i18n/routing.ts` `pathnames` (see `i18n.md`) if locales should use different URLs (e.g. `/san-pham` (VI) vs `/products` (EN)).
7. Add nav link in `components/layout/header.tsx`.

## Rules

### MUST DO
- Compose pages from sections — no monolithic page.tsx
- Externalize ALL strings to content files; sections receive props
- Use tokens from `theme.md` for color / spacing — never raw hex/Tailwind colors
- `next/image` for every image, with `alt` + `sizes` (mandatory)
- Server component by default; `"use client"` only when interactivity demands
- Apply `"use cache"` + `cacheLife()` per page (from `caching.md`)
- Wire `generateMetadata` per page (from `seo.md`)
- Add new pages to sitemap + locale routing

### MUST NOT
- Hardcode Vietnamese (or English) strings inside section components
- Inline data arrays inside section components (move to `content/<locale>/`)
- Skip `alt` on images
- Use `<img>` over `next/image`
- Use `dangerouslySetInnerHTML` for content (XSS risk; if rich text needed, use a markdown renderer with sanitizer)
- Add a section to one page only — if it's used once, it's not a section (just inline in the page)
- Compose pages with >7 sections — that's information overload; split or trim

## Anti-patterns
- **Hardcoded products array inside ProductsSection.tsx** — common starter-project mistake. Solution: move to `content/<locale>/products.ts`.
- **Same section copy-pasted across pages** with slight variations — extract a section component with props.
- **One-off section that doesn't fit the library** — usually means the section is too specific. Generalize OR keep inline in that page only (do not add to `components/sections/`).
- **Section that imports specific content** (e.g. `Features` importing `homeFeatures` directly) — Features should accept items prop, callers pass content.
- **Tailwind class chaos** like `bg-orange-500 hover:bg-orange-600 text-white` in 8 places — extract `Button variant="primary"` to `components/ui/button.tsx`.
- **`useState` in a section that doesn't need it** — server-render whenever possible.

## Component library — `src/components/ui/`

Small atoms that sections compose:
- `Button` — variants: primary / secondary / outline / ghost; sizes: sm / md / lg
- `Card` — base elevated container
- `Container` — max-width wrapper (alternative to inline `max-w-container mx-auto`)
- `Heading` — semantic h1-h6 with consistent sizing (optional; can rely on globals.css defaults)
- `Input`, `Textarea`, `Select`, `Checkbox` — form atoms (used by ContactForm)

Add these as needed; do NOT bring in a full UI library (MUI, Chakra). Custom components stay lean.

## Cross-references
- Theme tokens: `theme.md`
- Image strategy + responsive: `responsive.md`
- i18n & content JSON: `i18n.md`
- SEO metadata: `seo.md`
- Caching: `caching.md`
- Contact form section impl: `contact-form.md`
