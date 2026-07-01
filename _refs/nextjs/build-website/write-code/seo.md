> **Reference for the `sdcorejs-nextjs` orchestrator.** Loaded on demand when the
> confirmed plan routes a step here. Not a standalone skill — the orchestrator reads this file via
> its dispatch table. Sibling reference packs live in the same dir; track-level refs under `_refs/nextjs/build-website/`.

# Build Website — SEO Baseline

## Purpose
SEO on Next.js App Router is mostly automatic IF you wire 4 pieces correctly: per-page metadata, JSON-LD structured data, sitemap, robots. This skill installs all 4 in one pass + favicon variants. Skipping any of them costs Google rankings, social previews, or crawler budget.

## When invoked
- Automatic after `pages-and-blocks.md` in a "Full build"
- User says "fix SEO", "<localized text>", "structured data", "sitemap", "robots", "favicon"
- After domain change → re-run to update absolute URLs

Prerequisites:
- Production domain confirmed in `01-brainstorming` (saved to `NEXT_PUBLIC_SITE_URL`)
- Site name + tagline in `src/config/company.ts`
- Pages exist (sitemap reads from them)

## What ships

| File | Purpose |
|---|---|
| `src/lib/seo.ts` | `generateMetadata` factory — every page imports + calls it |
| `src/lib/structured-data.ts` | JSON-LD builders (Organization, LocalBusiness, …) |
| `src/app/sitemap.ts` | Dynamic sitemap from route registry + content |
| `src/app/robots.ts` | Crawler directives |
| `src/app/manifest.ts` | Web app manifest (favicon variants + name + theme color) |
| `src/app/icon.svg` | Vector favicon (modern browsers) |
| `src/app/apple-icon.png` | 180×180 (iOS home screen) |
| `src/app/icon.png` | 32×32 fallback PNG |
| `src/config/seo.ts` | Site-wide defaults (default title template, description, OG defaults) |

## Workflow

### Step 1 — `src/config/seo.ts` (site-wide defaults)

```typescript
import { company } from './company';

export const seo = {
  defaultTitle: company.name,
  titleTemplate: `%s | ${company.name}`,
  defaultDescription: company.tagline,
  defaultKeywords: ['<localized text>', '<localized text>', '<localized text>', /* industry-specific */],
  twitterHandle: '', // @company if any
  facebookAppId: '', // if any
} as const;

export function absoluteUrl(path: string = ''): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return `<localized text>`/${path}`}`;
}
```

### Step 2 — `src/lib/seo.ts` (generateMetadata factory)

```typescript
import { Metadata } from 'next';
import { seo, absoluteUrl } from '@/config/seo';
import { company } from '@/config/company';

interface PageMetaInput {
  title?: string;       // page-specific title (will be templated)
  description?: string;
  path?: string;        // canonical path (e.g. '/san-pham')
  image?: string;       // OG image override (absolute path; see og-preview.md)
  locale?: string;      // 'vi' | 'en' | …
  keywords?: string[];
  noindex?: boolean;
  type?: 'website' | 'article';
}

export function buildMetadata(input: PageMetaInput = {}): Metadata {
  const {
    title,
    description = seo.defaultDescription,
    path = '/',
    image,
    locale = 'vi',
    keywords = seo.defaultKeywords,
    noindex = false,
    type = 'website',
  } = input;

  const fullTitle = title ? seo.titleTemplate.replace('%s', title) : seo.defaultTitle;
  const url = absoluteUrl(path);
  const ogImage = image ?? absoluteUrl('/og-default.png');

  return {
    title: fullTitle,
    description,
    keywords,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    alternates: {
      canonical: url,
      languages: {
        'vi-VN': absoluteUrl(`/vi${path === '/'<localized text>'' : path}`),
        'en-US': absoluteUrl(`/en${path === '/'<localized text>'' : path}`),
      },
    },
    openGraph: {
      type,
      url,
      title: fullTitle,
      description,
      locale: locale === 'en'<localized text>'en_US' : 'vi_VN',
      siteName: company.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      ...(seo.twitterHandle && { site: seo.twitterHandle, creator: seo.twitterHandle }),
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  };
}

// Per-page usage:
// export const metadata = buildMetadata({ title: '<localized text>', path: '/san-pham' });
// OR async:
// export async function generateMetadata({ params }): Promise<Metadata> {
//   return buildMetadata({ title: '...', locale: params.locale });
// }
```

### Step 3 — `src/lib/structured-data.ts` (JSON-LD builders)

Pick the schema types that match the business. For a typical landing site: Organization + LocalBusiness (if has physical address) + WebSite. Per-page: BreadcrumbList + Article (for blog) + Product (for product pages).

```typescript
import { company } from '@/config/company';
import { absoluteUrl } from '@/config/seo';

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/logo.png'),
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: company.phone,
      contactType: 'sales',
      email: company.email,
      availableLanguage: ['Vietnamese', 'English'],
    },
    sameAs: Object.values(company.social).filter(Boolean),
  };
}

export function localBusinessJsonLd() {
  // Use ONLY if the company has a physical address customers visit.
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.name,
    image: absoluteUrl('/logo.png'),
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address,
      addressCountry: 'VN',
    },
    telephone: company.phone,
    email: company.email,
    openingHoursSpecification: company.openingHours
      ? [{ '@type': 'OpeningHoursSpecification', opens: '08:00', closes: '17:00' /* parse from string */ }]
      : undefined,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; href: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function productJsonLd(p: { name: string; description: string; image: string; sku?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: absoluteUrl(p.image),
    ...(p.sku && { sku: p.sku }),
    brand: { '@type': 'Brand', name: company.name },
  };
}
```

Rendering JSON-LD in a page:
```typescript
// src/app/[locale]/page.tsx
import { organizationJsonLd, localBusinessJsonLd } from '@/lib/structured-data';

export default async function HomePage() {
  // ... cache + content ...
  return (
    <>
      <script
        type="application/ld+json"
        // safe: server-rendered, no user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd(), localBusinessJsonLd()]) }}
      />
      <main>{/* page sections */}</main>
    </>
  );
}
```

### Step 4 — `src/app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';
import { absoluteUrl } from '@/config/seo';

// Static route registry. Extend per page added.
const STATIC_ROUTES = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/ve-chung-toi', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/san-pham', priority: 0.9, changeFrequency: 'weekly' as const },
  { path: '/lien-he', priority: 0.6, changeFrequency: 'yearly' as const },
];

const LOCALES = ['vi', 'en'];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return STATIC_ROUTES.flatMap(({ path, priority, changeFrequency }) =>
    LOCALES.map((locale) => ({
      url: absoluteUrl(`/${locale}${path === '/'<localized text>'' : path}`),
      lastModified: now,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, absoluteUrl(`/${l}${path === '/'<localized text>'' : path}`)]),
        ),
      },
    })),
  );
}
```

For dynamic content (blog posts, product detail pages): extend with a fetch-and-flatten pass that reads slugs from CMS / content files.

### Step 5 — `src/app/robots.ts`

```typescript
import { MetadataRoute } from 'next';
import { absoluteUrl } from '@/config/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/admin/', '/_next/'] },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
```

### Step 6 — `src/app/manifest.ts` + favicons

```typescript
// src/app/manifest.ts
import { MetadataRoute } from 'next';
import { company } from '@/config/company';
import { theme } from '@/config/theme';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: company.name,
    short_name: company.name.split(' ')[0],
    description: company.tagline,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: theme.brand.primary,
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
```

Place favicon files:
- `src/app/icon.svg` — vector master (Next.js serves at `/icon.svg`)
- `src/app/apple-icon.png` — 180×180 (Next.js auto-emits `<link rel="apple-touch-icon">`)
- `src/app/icon.png` — 32×32 PNG fallback
- `public/icon-192.png`, `public/icon-512.png` — referenced by manifest

If no SVG logo provided, ask user to provide one (or generate placeholder from initials).

### Step 7 — Per-page usage pattern

```typescript
// src/app/[locale]/san-pham/page.tsx
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({ params: { locale } }) {
  return buildMetadata({
    title: locale === 'en'<localized text>'Products' : '<localized text>',
    description: '...',
    path: '/san-pham',
    locale,
  });
}

export default async function ProductsPage() { /* … */ }
```

For per-locale URL slugs (`/san-pham` (VI) vs `/products` (EN)): see `i18n.md` `pathnames` config. The `path` arg to `buildMetadata` should match the localized path.

### Step 8 — Verify

```bash
# Build
npm run build

# Visit in dev or production:
# - /sitemap.xml      → XML with all routes × locales
# - /robots.txt       → contains sitemap URL
# - /manifest.webmanifest → JSON with icons
# - View source of any page → <script type="application/ld+json"> present
# - View source → <meta property="og:image"> with absolute URL
```

Validate JSON-LD: paste the page's view-source into [Google Rich Results Test](https://search.google.com/test/rich-results). All declared schemas should validate without errors.

## Rules

### MUST DO
- Every page has its own `generateMetadata` or `export const metadata`
- Use absolute URLs in OG image, sitemap, JSON-LD (via `absoluteUrl()` helper)
- Set `metadataBase` on the root layout (or in every `buildMetadata` call as above)
- Include `alternates.languages` for multi-locale sites
- JSON-LD on every page (at minimum Organization on home; per-type elsewhere)
- Sitemap includes all locales × all routes
- Robots disallows `/api/`, `/admin/`, `/_next/`

### MUST NOT
- Hardcode the production URL — read from `NEXT_PUBLIC_SITE_URL`
- Skip favicon variants (Google Search shows favicons in results; missing = worse CTR)
- Use `noindex` by default — opt-in only for thank-you pages, admin, draft routes
- Render JSON-LD with user-controlled content (XSS risk via `dangerouslySetInnerHTML`); only render server-built data
- Repeat the same title on every page (Google penalty)
- Ship without a sitemap or with a stale one

## Anti-patterns
- "Modern responsive website" as description — meaningless, every site says this
- Same OG image on every page (acceptable for Lean tier; Standard+ should use dynamic per-page via `og-preview.md`)
- Hardcoded `https://example.com` in source code — always env var
- Missing canonical when site is served on both `www.` and apex
- Multiple `<title>` tags from competing metadata exports — only one should win (page-level overrides root)
- 1000+ keyword stuffing — keep to 5-10 relevant terms
- Misusing `LocalBusiness` schema for an online-only business (use `Organization` instead)

## Scope boundary — what this skill does NOT cover

This skill installs **technical SEO**: metadata factory, JSON-LD builders, sitemap, robots, favicons. It does NOT cover **on-page SEO** (heading hierarchy, keyword placement, internal linking, content length, title/description length warnings, Article schema authoring, bilingual translation quality). Those belong to `content-quality.md`. Dispatch both for a complete SEO setup — technical SEO alone gets you indexed; on-page SEO is what makes you rank.

## Cross-references
- OG image generation: `og-preview.md` (dynamic per-page OG)
- i18n alternates: `i18n.md` (`pathnames` config drives per-locale URLs in sitemap + alternates)
- Caching: sitemap & robots are auto-cached by Next.js; revalidate on content change
- On-page SEO + Article schema: `content-quality.md` (heading hierarchy, content length, Article JSON-LD with author + dates)
- Verification: `sdcorejs-ship (verify-before-done mode)` includes a "sitemap.xml renders + has all routes" criterion
