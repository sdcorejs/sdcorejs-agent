---
name: nextjs-build-website-init-site
description: Use to bootstrap a fresh Next.js landing-site project — runs `create-next-app` with App Router + TypeScript + Tailwind 4, installs the standard dependency set (next-intl, @vercel/og, lucide-react, Resend, zod), and scaffolds the folder structure that all other build-website sub-skills assume. Triggers - "init site", "tạo project Next.js", "bootstrap website", "khởi tạo website", or automatic first step of `07-write-code` for a new site. Bilingual (VI/EN).
allowed-tools: Bash, Read, Write, Edit
---

# Build Website — Init Site

## Purpose
Stand up a Next.js 16 landing-site skeleton that every later sub-skill (theme, pages, SEO, i18n, …) expects. After this skill runs, `npm run dev` succeeds, the root route renders an empty hero, and the folder structure is in place for content + components + i18n.

## When invoked
- First step of a "Full build" dispatch in `07-write-code`
- User says "init site", "tạo project Next.js", "khởi tạo website", "bootstrap"
- Brand-new directory or empty project root

Do NOT invoke if:
- An existing Next.js project is present (delegate to relevant sub-skill instead — `11-theme` / `12-pages-and-blocks`)
- User is in an Angular / NestJS context (wrong track)

## Prerequisites (from `02-clarify-requirements`)
- Site name + tagline
- Production domain
- Languages (VI default; EN ready)
- Logo + brand assets path

## Workflow

### 1. Run `create-next-app`
```bash
npx create-next-app@latest <site-slug> \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-eslint
```

Notes:
- `--app` → App Router (required)
- `--src-dir` → `src/` layout (cleaner separation from config files)
- `--no-eslint` → we install our own (next/core-web-vitals + custom rules) below
- `--turbopack` is on by default in Next 16; keep it

### 2. Install standard dependency set

```bash
cd <site-slug>
npm install next-intl @vercel/og lucide-react resend zod clsx tailwind-merge
npm install -D @types/node prettier prettier-plugin-tailwindcss eslint eslint-config-next
```

Why each:
| Dep | Purpose |
|---|---|
| `next-intl` | i18n; `15-i18n` setup |
| `@vercel/og` | Dynamic OG images; `14-og-preview` |
| `lucide-react` | Tree-shakeable, consistent icon set used across all section blocks |
| `resend` | Default email service for `18-contact-form` (swap to SendGrid if user picks) |
| `zod` | Form validation (client + API route in `18-contact-form`) |
| `clsx`, `tailwind-merge` | Conditional class composition for components |
| `prettier-plugin-tailwindcss` | Auto-sorts Tailwind classes in formatter |

If user picked Cloudflare hosting in clarify → also: `npm install -D @cloudflare/next-on-pages`.
If user picked GA4 → also: `npm install @next/third-parties`.
If user picked Plausible → no extra dep (use plain script tag).

### 3. Folder structure — create these directories + files

```
<site-slug>/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx              ← locale-aware root layout
│   │   │   ├── page.tsx                ← home
│   │   │   ├── about/page.tsx
│   │   │   ├── services/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── (additional pages from brainstorm)
│   │   ├── api/
│   │   │   ├── contact/route.ts        ← handled by 18-contact-form
│   │   │   └── revalidate/route.ts     ← on-demand revalidation (16-caching)
│   │   ├── opengraph-image.tsx         ← site-wide fallback OG (14-og-preview)
│   │   ├── sitemap.ts                  ← 13-seo
│   │   ├── robots.ts                   ← 13-seo
│   │   ├── manifest.ts                 ← 13-seo
│   │   ├── icon.svg / icon.png         ← favicon variants
│   │   ├── apple-icon.png
│   │   └── layout.tsx                  ← root layout (handles redirect to default locale)
│   ├── components/
│   │   ├── sections/                   ← reusable blocks (hero, features, ...) — 12-pages-and-blocks
│   │   ├── layout/                     ← Header, Footer, LanguageSwitcher
│   │   └── ui/                         ← Button, Card, Input, …
│   ├── content/
│   │   ├── vi/                         ← per-locale content data (products.ts, services.ts, …)
│   │   └── en/                         ← (created when EN is added in 15-i18n; empty placeholder for now)
│   ├── config/
│   │   ├── company.ts                  ← name, tagline, phone, email, address, social
│   │   ├── theme.ts                    ← design tokens — 11-theme
│   │   └── seo.ts                      ← site-wide SEO defaults — 13-seo
│   ├── i18n/
│   │   ├── routing.ts                  ← next-intl routing config — 15-i18n
│   │   ├── request.ts                  ← message loader
│   │   └── messages/
│   │       ├── vi.json
│   │       └── en.json                 ← empty stub, populated in 15-i18n
│   ├── lib/
│   │   ├── seo.ts                      ← generateMetadata factory — 13-seo
│   │   ├── og.ts                       ← dynamic OG helpers — 14-og-preview
│   │   ├── email.ts                    ← Resend wrapper — 18-contact-form
│   │   └── utils.ts                    ← cn(), formatters
│   └── middleware.ts                   ← next-intl middleware — 15-i18n
├── public/
│   ├── images/                         ← user-uploaded images
│   ├── logo.svg                        ← from clarify (placeholder if not provided)
│   ├── og-default.png                  ← 1200×630 fallback
│   ├── favicon.ico
│   └── robots-static.txt               ← placeholder; app/robots.ts wins
├── .env.local                          ← see template below — gitignored
├── .env.example                        ← committed template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── prettier.config.js
└── README.md                           ← project-specific (NOT this skill's README)
```

### 4. Config files — write these

**`.env.example`** (committed):
```env
# Production URL (used for sitemap, OG absolute URLs, canonical)
NEXT_PUBLIC_SITE_URL=https://example.com

# Contact form
RESEND_API_KEY=re_xxxxxxxx
CONTACT_TO_EMAIL=sales@example.com
CONTACT_FROM_EMAIL=noreply@example.com
# Comma-separated allow-list for reply-to handling
CONTACT_CC=

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=

# On-demand revalidation secret
REVALIDATE_SECRET=
```

**`.env.local`** (gitignored, copied from `.env.example` with real values during dev).

**`next.config.ts`**:
```typescript
import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const config: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85, 95],
  },
  experimental: {
    // Enable per-route "use cache" + cacheLife (Next 16 caching APIs)
    useCache: true,
  },
};

export default withNextIntl(config);
```

**`tailwind.config.ts`** — minimal stub; tokens added by `11-theme`:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
};

export default config;
```

**`src/config/company.ts`** (filled from clarify answers):
```typescript
export const company = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME ?? 'Acme',
  tagline: 'Tagline từ clarify',
  domain: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com',
  phone: '+84 ...',
  email: 'contact@example.com',
  address: 'Số ...',
  social: {
    facebook: '',
    zalo: '',
    instagram: '',
    youtube: '',
  },
  openingHours: '', // optional, set if relevant industry
} as const;
```

**`src/app/layout.tsx`** (root — minimal, redirects to default locale):
```typescript
import { redirect } from 'next/navigation';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Middleware handles locale; root layout is just a shell.
  return children;
}
```

**`src/app/[locale]/layout.tsx`** (locale-aware — real root):
```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

const font = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  return (
    <html lang={locale} className={font.variable}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**`package.json` scripts**:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,md}\""
  }
}
```

**`prettier.config.js`**:
```javascript
module.exports = {
  plugins: ['prettier-plugin-tailwindcss'],
  singleQuote: true,
  semi: true,
  printWidth: 100,
  trailingComma: 'all',
};
```

### 5. Smoke test before handing off

```bash
npm install                # install everything (already done above)
npm run typecheck          # expect 0 errors
npm run dev                # expect dev server on :3000
```

Verify:
- `http://localhost:3000` returns 200 (will redirect to `/vi` after middleware lands in `15-i18n` — for now serves placeholder)
- Browser console: no errors
- TypeScript: no errors

If any of these fail, halt and surface — do NOT proceed to next sub-skill with a broken bootstrap.

## Rules

### MUST DO
- Use `--app` flag (App Router only — never Pages Router)
- Use `--src-dir` for clean layout
- Pin Next.js to `latest` at install time but record the version in the auto-docs entry
- Create all folders listed above, even if empty (other sub-skills assume them)
- Write `.env.example` committed; `.env.local` gitignored
- Run typecheck + dev-server smoke test before claiming "init done"

### MUST NOT
- Generate page content yet — that's `12-pages-and-blocks` after theme + i18n exist
- Configure i18n / SEO / OG in this skill — each has its own sub-skill
- Install dependencies that aren't in the standard set without flagging to user
- Commit `.env.local` or any file with real secrets
- Use Pages Router patterns (`pages/`, `getServerSideProps`, `_app.tsx`, `_document.tsx`)
- Skip the smoke test to "save time"

## Anti-patterns
- Putting page logic in `src/app/page.tsx` instead of `src/app/[locale]/page.tsx` — breaks i18n
- Creating a one-file mega-component for the home page — sections must live in `src/components/sections/`
- Defaulting `NEXT_PUBLIC_SITE_URL` to `localhost:3000` and forgetting to override before launch
- Skipping `prettier-plugin-tailwindcss` → Tailwind classes drift into chaos within a week
- Installing UI libraries (MUI, Chakra) "just in case" — we use custom components + lucide icons

## Cross-references
- Inputs: clarify answers (domain, contact email, languages, brand)
- Next: `11-theme` (palette + typography tokens), then `15-i18n` (next-intl middleware + messages), then `12-pages-and-blocks`
- `shared/workflow/env-setup` covers post-clone environment if a teammate joins later
