---
name: nextjs-build-website-i18n
description: Use to install full bilingual VI/EN support via `next-intl` — middleware, routing config with localized URL pathnames (`/san-pham` vs `/products`), message JSON files, language switcher component, and server/client component patterns. Triggers - "add English", "thêm tiếng Anh", "setup i18n", "đa ngôn ngữ", "language switcher", or automatic step of `07-write-code` after `10-init-site`. Bilingual (VI/EN).
allowed-tools: Read, Write, Edit
---

# Build Website — i18n (Vietnamese + English)

## Purpose
Adding a second language to a site that hardcoded the first is a refactor; adding it to a site built bilingual from day 1 is filling in JSON files. This skill installs the bilingual foundation — Vietnamese default, English structure-ready — using `next-intl` v3 (the de-facto standard for Next.js App Router).

## When invoked
- Automatic step 3 of "Full build" dispatch (between `11-theme` and `12-pages-and-blocks`)
- User says "add English", "thêm tiếng Anh", "setup i18n", "language switcher"
- Adding a 3rd locale after the site ships

## What ships

| File | Purpose |
|---|---|
| `src/i18n/routing.ts` | Locale list + default + pathname mapping (`/san-pham` ↔ `/products`) |
| `src/i18n/request.ts` | Server-side message loader |
| `src/i18n/messages/vi.json` | Vietnamese UI strings |
| `src/i18n/messages/en.json` | English UI strings (placeholder OK at init) |
| `src/middleware.ts` | next-intl middleware (locale detection + redirect) |
| `src/app/[locale]/layout.tsx` | Locale-aware root layout (already exists from `10-init-site`) |
| `src/components/layout/locale-switcher.tsx` | Language toggle in header |

## Workflow

### Step 1 — `src/i18n/routing.ts`

```typescript
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // Supported locales — VI default
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localeDetection: true,  // try Accept-Language header first
  localePrefix: 'always', // always include /vi or /en in URL (cleaner for sitemap)

  // Localized pathnames — different URL slugs per locale
  pathnames: {
    '/': '/',
    '/ve-chung-toi': {
      vi: '/ve-chung-toi',
      en: '/about-us',
    },
    '/san-pham': {
      vi: '/san-pham',
      en: '/products',
    },
    '/lien-he': {
      vi: '/lien-he',
      en: '/contact',
    },
    // Add more as pages are added
  },
});

// Re-export typed navigation utilities — use these instead of next/link / useRouter
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

Why localized pathnames: VI users see `example.vn/san-pham`, EN users see `example.vn/products`. Better UX + better SEO (each locale's URLs match its content vocabulary). The Next.js + next-intl machinery handles the URL ↔ canonical route mapping.

### Step 2 — `src/i18n/request.ts` (server-side messages)

```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

### Step 3 — `src/middleware.ts`

```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all routes except API, static, and Next internals
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

### Step 4 — Message JSON files

**`src/i18n/messages/vi.json`** (default — populated as components are added):
```json
{
  "nav": {
    "home": "Trang chủ",
    "about": "Về chúng tôi",
    "products": "Sản phẩm",
    "contact": "Liên hệ"
  },
  "common": {
    "learnMore": "Tìm hiểu thêm",
    "contactUs": "Liên hệ ngay",
    "viewAll": "Xem tất cả",
    "submit": "Gửi",
    "submitting": "Đang gửi...",
    "success": "Đã gửi thành công",
    "error": "Có lỗi xảy ra. Vui lòng thử lại.",
    "required": "Trường này là bắt buộc"
  },
  "footer": {
    "copyright": "© {year} {company}. Đã đăng ký bản quyền.",
    "address": "Địa chỉ",
    "phone": "Hotline",
    "email": "Email"
  },
  "locale": {
    "vi": "Tiếng Việt",
    "en": "English"
  }
}
```

**`src/i18n/messages/en.json`** (mirror VI keys; populated when EN content is requested):
```json
{
  "nav": {
    "home": "Home",
    "about": "About Us",
    "products": "Products",
    "contact": "Contact"
  },
  "common": {
    "learnMore": "Learn more",
    "contactUs": "Contact us",
    "viewAll": "View all",
    "submit": "Submit",
    "submitting": "Submitting...",
    "success": "Submitted successfully",
    "error": "Something went wrong. Please try again.",
    "required": "This field is required"
  },
  "footer": {
    "copyright": "© {year} {company}. All rights reserved.",
    "address": "Address",
    "phone": "Hotline",
    "email": "Email"
  },
  "locale": {
    "vi": "Tiếng Việt",
    "en": "English"
  }
}
```

ALWAYS keep keys symmetric across locales. If a key exists in VI, it MUST exist in EN (and vice versa). Missing-key warnings are a Critical finding in `50-review-code`.

**Parity check is enforced at build time** by `scripts/check-i18n-parity.ts` (installed by `19-content-quality`). It diffs the key sets of `vi.json` ↔ `en.json` and the file sets of `content/vi/` ↔ `content/en/`, then fails `npm run build` if they diverge. Run manually with `npm run check:i18n`. See `19-content-quality` Part 1 for the script and the broader bilingual quality rules (no machine translation, per-locale keyword research, etc.).

### Step 5 — Server component usage

```typescript
// src/app/[locale]/page.tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  // Required when using async components with static rendering
  setRequestLocale(locale);

  // Server-side translation
  const t = await getTranslations('common');

  return (
    <main>
      <h1>{t('learnMore')}</h1>
    </main>
  );
}
```

For metadata:
```typescript
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  return buildMetadata({
    title: t('home'),
    locale,
  });
}
```

### Step 6 — Client component usage

```typescript
// src/components/sections/some-interactive-block.tsx
'use client';
import { useTranslations } from 'next-intl';

export function SomeBlock() {
  const t = useTranslations('common');
  return <button>{t('learnMore')}</button>;
}
```

### Step 7 — Locale switcher

```typescript
// src/components/layout/locale-switcher.tsx
'use client';

import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

export function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations('locale');
  const [, startTransition] = useTransition();

  function setLocale(next: 'vi' | 'en') {
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        type="button"
        onClick={() => setLocale('vi')}
        className={currentLocale === 'vi' ? 'font-semibold' : 'text-neutral-500'}
        aria-current={currentLocale === 'vi' ? 'true' : undefined}
      >
        VI
      </button>
      <span className="text-neutral-300">|</span>
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={currentLocale === 'en' ? 'font-semibold' : 'text-neutral-500'}
        aria-current={currentLocale === 'en' ? 'true' : undefined}
      >
        EN
      </button>
    </div>
  );
}
```

Mount in `components/layout/header.tsx`.

### Step 8 — Internal links

Use the typed `Link` from `@/i18n/routing` (NOT `next/link` directly). It auto-resolves the localized pathname for the current locale.

```typescript
import { Link } from '@/i18n/routing';

<Link href="/san-pham">{t('nav.products')}</Link>
// On VI → /vi/san-pham
// On EN → /en/products  (auto-translated via routing.pathnames)
```

For external links: keep using `<a>` or `next/link` directly.

### Step 9 — Content data per locale

UI strings live in JSON; long-form content (product list, articles) lives in `src/content/<locale>/` (per `12-pages-and-blocks`). Both need translation. Convention:

```
src/i18n/messages/vi.json     ← UI strings (buttons, nav, errors)
src/i18n/messages/en.json
src/content/vi/products.ts    ← long-form data (product names, descriptions)
src/content/en/products.ts
```

Don't conflate the two. UI strings are small and centralized; content is per-page and can be large.

### Step 10 — Date / number / currency formatting

`next-intl` provides `useFormatter()` (client) and `getFormatter()` (server):

```typescript
import { useFormatter } from 'next-intl';

const format = useFormatter();
format.dateTime(new Date(), { dateStyle: 'long' });      // "16 tháng 5, 2026" (VI) / "May 16, 2026" (EN)
format.number(1500000, { style: 'currency', currency: 'VND' });   // "1.500.000 ₫" / "₫1,500,000"
format.relativeTime(-2, 'hour');                          // "2 giờ trước" / "2 hours ago"
```

For pluralization, use ICU MessageFormat syntax in JSON:
```json
"itemCount": "{count, plural, =0 {Không có sản phẩm} =1 {1 sản phẩm} other {# sản phẩm}}"
```

### Step 11 — Verify

```bash
npm run dev

# Visit:
# - /          → redirects to /vi (default + browser preference)
# - /vi        → renders Vietnamese
# - /en        → renders English (if EN messages filled)
# - /vi/san-pham → VI products page
# - /en/products → EN products page (same route, localized URL)
# Switch locale in switcher; URL slug should change correctly
```

Check console: no `MISSING_MESSAGE` warnings.

## Localized pathnames in `13-seo` sitemap

Update `src/app/sitemap.ts` to read `routing.pathnames` and emit per-locale URLs:

```typescript
import { routing } from '@/i18n/routing';

// In sitemap():
for (const [canonical, localizedMap] of Object.entries(routing.pathnames)) {
  for (const locale of routing.locales) {
    const path = typeof localizedMap === 'string' ? localizedMap : localizedMap[locale];
    // emit { url: absoluteUrl(`/${locale}${path}`), … }
  }
}
```

## Rules

### MUST DO
- VI is default; EN structure ready even if user picked "VI only" in clarify
- Use typed `Link` / `useRouter` / `usePathname` from `@/i18n/routing` (NOT `next/link`)
- Keep VI/EN message keys symmetric — missing keys = silent fallback to key name
- Use `setRequestLocale(locale)` in every `[locale]/page.tsx` for static rendering
- Externalize UI strings to messages JSON
- Externalize long-form content to `content/<locale>/`
- Provide localized pathnames for user-facing routes (better SEO + UX)
- Wire `LocaleSwitcher` in header

### MUST NOT
- Use `next/link` for internal navigation in i18n contexts — locale prefix gets lost
- Hardcode Vietnamese (or English) strings in components — every string goes through `t()` or content
- Mix UI strings + long-form content in the same JSON file
- Use `useTranslations` in a server component — use `getTranslations` instead
- Skip `setRequestLocale` — causes runtime errors with static generation
- Localize JSON-LD schema labels (Google reads schema.org keys, not user-facing labels)
- Default to EN — VI users vastly outnumber EN users for VN sites

## Anti-patterns
- **Two sites in two folders** (`/vi/` + `/en/` as separate apps) — defeats the point; use next-intl's locale routing
- **Same URL slug across locales** (`/about` on both) — works but loses SEO benefit of localized URLs
- **Hardcoded `<html lang="vi">`** — must derive from locale param
- **Missing diacritic font subset** — confirm `next/font/google` config includes `subsets: ['vietnamese', 'latin']`
- **Translating brand name** — "ACME Corp." stays "ACME Corp." in EN
- **EN as primary language but VI poorly written** — confirm with user which is the authoritative version; the other is translated FROM it
- **Auto-translate JSON via Google Translate** — produces awkward VI; have a native speaker review before launch

## Cross-references
- Sitemap: `13-seo` includes per-locale alternates derived from routing config
- Localized pathnames: `12-pages-and-blocks` uses `Link` from `@/i18n/routing`
- Theme: `11-theme` already loads `Be Vietnam Pro` with `vietnamese` subset
- Static generation: `setRequestLocale` interacts with `"use cache"` in `16-caching`
- **Bilingual parity + content quality**: `19-content-quality` installs the `check:i18n` script, enforces translation-quality rules (no machine translation), per-locale keyword research, and minimum content lengths

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
