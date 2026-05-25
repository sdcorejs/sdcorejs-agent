---
name: nextjs-build-website-og-preview
description: Use to set up Open Graph + Twitter Card image previews — static fallback at `public/og-default.png` plus dynamic per-page images via `app/<route>/opengraph-image.tsx` using `@vercel/og`. Verifies preview rendering on Zalo, Messenger, Facebook, Twitter/X. Triggers - "OG image", "Zalo preview hỏng", "Facebook share không hiện ảnh", "Twitter card", "social preview", or automatic step of `07-write-code` after pages exist. Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, WebFetch
---

# Build Website — OG Preview (Zalo / Messenger / Facebook / Twitter)

## Purpose
A share link without a preview image looks broken on Zalo and Messenger (Vietnam's dominant platforms). This skill installs the OG image baseline — static fallback + dynamic per-page generation — and walks through the verification steps that catch the common gotchas (relative URLs, missing alt, cache invalidation).

## When invoked
- Automatic after `13-seo` in a "Full build"
- User says "OG image", "Zalo không hiện ảnh", "Facebook share lỗi", "Twitter card", "social preview"
- After a homepage hero / branding update → re-generate OG

## What ships

| File | Purpose |
|---|---|
| `public/og-default.png` | 1200×630 site-wide fallback (used if a page doesn't override) |
| `src/app/opengraph-image.tsx` | Root-level dynamic OG for the home route |
| `src/app/[locale]/<route>/opengraph-image.tsx` | Per-route dynamic OG (Standard / Full tier) |
| `src/app/twitter-image.tsx` | Optional Twitter-specific variant (usually same as OG) |
| `src/lib/og.ts` | Shared OG renderer helpers (font loader, brand colors) |

OG image strategy is set in `02-clarify-requirements`:
- **Static fallback only** (Lean tier): 1 image at `public/og-default.png`, every page uses it via `buildMetadata` in `13-seo`
- **Dynamic per-page** (Standard / Full): each route has its own `opengraph-image.tsx` rendered at build/request time

## Workflow

### Step 1 — Static fallback (every tier)

Create `public/og-default.png`:
- **Dimensions**: 1200×630 (Facebook's preferred ratio; works on Zalo, Messenger, Twitter)
- **Format**: PNG (universally supported; JPEG also works)
- **Content**: Logo + company name + tagline + brand color background. Text size ≥ 60px (legible at thumbnail crop).
- **File size**: ≤ 200 KB (some platforms cache aggressively; smaller = faster preview)

If the user provided design: place at `public/og-default.png`. If not: generate via `@vercel/og` at build time (see Step 2 with a default route).

The static fallback is already referenced from `src/lib/seo.ts` via the `buildMetadata` factory (`13-seo`). Verify:
```typescript
// from 13-seo's buildMetadata
const ogImage = image ?? absoluteUrl('/og-default.png');
```

### Step 2 — Dynamic OG (Standard / Full tier)

Next.js App Router auto-renders any `opengraph-image.tsx` file colocated with a route. It uses `@vercel/og` (already installed in `10-init-site`) to generate a PNG on demand and cache it.

**Root home OG** — `src/app/[locale]/opengraph-image.tsx`:
```typescript
import { ImageResponse } from 'next/og';
import { company } from '@/config/company';
import { theme } from '@/config/theme';

export const runtime = 'edge';
export const alt = `${company.name} — ${company.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: `linear-gradient(135deg, ${theme.brand.primary} 0%, ${theme.brand.primaryDark} 100%)`,
          color: 'white',
          fontFamily: 'Be Vietnam Pro, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* If logo SVG inlineable, paste here; else omit and rely on text */}
          <span style={{ fontSize: 36, fontWeight: 600 }}>{company.name}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h1 style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
            {company.tagline}
          </h1>
        </div>

        <div style={{ fontSize: 24, opacity: 0.85 }}>{company.domain.replace('https://', '')}</div>
      </div>
    ),
    { ...size },
  );
}
```

**Per-page OG** — e.g. `src/app/[locale]/san-pham/opengraph-image.tsx` can use the same template with different copy ("Sản phẩm chất lượng cao", category-specific title).

For dynamic content (e.g. product detail page `/san-pham/[slug]`):
```typescript
// src/app/[locale]/san-pham/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage({ params }: { params: { slug: string } }) {
  // Fetch product
  const product = await getProductBySlug(params.slug);
  return new ImageResponse(
    (
      <div style={{ /* same shell, but with product.name + product.image as background */ }}>
        <h1>{product.name}</h1>
      </div>
    ),
    { ...size },
  );
}
```

### Step 3 — Custom fonts in OG

`@vercel/og` doesn't pick up `next/font` automatically. For non-system fonts (e.g. Vietnamese diacritics on serif font), load font ArrayBuffer:

```typescript
// src/lib/og.ts
export async function loadBeVietnamProBold() {
  // Self-host the font binary at public/fonts/
  const res = await fetch(new URL('../../public/fonts/BeVietnamPro-Bold.woff', import.meta.url));
  return await res.arrayBuffer();
}
```

```typescript
// in opengraph-image.tsx
import { loadBeVietnamProBold } from '@/lib/og';

export default async function OpengraphImage() {
  const fontData = await loadBeVietnamProBold();
  return new ImageResponse(
    (/* JSX */),
    {
      ...size,
      fonts: [{ name: 'Be Vietnam Pro', data: fontData, weight: 700, style: 'normal' }],
    },
  );
}
```

If user accepts system fallback (Helvetica / Arial), skip font loading entirely — diacritics still render, just less branded.

### Step 4 — Twitter card

Default behavior: Next.js auto-derives the Twitter card from `openGraph` metadata. Override only if Twitter needs a different image (rare).

If override needed:
```typescript
// src/app/[locale]/twitter-image.tsx — same shape as opengraph-image.tsx
```

`13-seo`'s `buildMetadata` already sets `twitter.card: 'summary_large_image'` and `twitter.images: [ogImage]`.

### Step 5 — VERIFY (this is the critical step)

OG images frequently fail in production due to absolute-URL mistakes, cache lag, or platform-specific quirks. Always verify on each target platform after deploy.

#### A. Facebook & Messenger
Use [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/):
1. Enter the production URL
2. Click "Scrape Again" to invalidate Facebook's cache (essential — otherwise the old/missing image lingers)
3. Confirm preview image appears with correct dimensions

#### B. Twitter / X
Use [Twitter Card Validator](https://cards-dev.twitter.com/validator) (deprecated UI but still works) OR post the URL in a draft tweet and preview.

#### C. Zalo
Zalo follows the Open Graph spec. After deploy:
1. Send the URL to yourself in a Zalo chat
2. Wait ~5 seconds for the preview card to render
3. Confirm image + title + description

**Zalo quirks:**
- Caches aggressively per URL — append a `?v=2` query string to force re-fetch during testing
- Image must be absolute URL (https://...) — Zalo doesn't resolve relative URLs
- Image must be publicly accessible (not behind auth or gated)
- HTTPS required (HTTP URLs sometimes get no preview)

#### D. LinkedIn (B2B)
Use [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).

#### E. WhatsApp / Telegram
Both follow OG spec. Test by sharing the URL in a chat.

### Step 6 — Common gotchas

| Symptom | Likely cause | Fix |
|---|---|---|
| Preview missing entirely | Relative URL in `og:image` | Use `absoluteUrl()` helper |
| Old image still showing | Platform cache | Use the platform's debugger to refresh, OR append `?v=N` |
| Image upscaled / pixelated | Wrong dimensions | Stick to 1200×630 |
| Vietnamese chars as boxes | Missing diacritic-capable font | Load font binary (Step 3) |
| Image renders locally but 500s in prod | `runtime: 'edge'` mismatch with hosting | Cloudflare requires edge; Vercel works with either; remove `runtime` line to fall back to Node runtime |
| Different image on Twitter | Twitter pulls `twitter:image` if set | Confirm `13-seo`'s `buildMetadata` includes Twitter card |
| OG image is HTML page instead of PNG | `opengraph-image.tsx` exported wrong type | Must export default function returning `ImageResponse`, plus `size` + `contentType` exports |

### Step 7 — Performance

Dynamic OG images are generated on first request per route then cached. With 30-min ISR (from `16-caching`), the image is regenerated alongside the page. To verify caching is working:
- First request: ~500-800ms (cold)
- Subsequent: <50ms (served from edge/CDN cache)

If too slow on cold: simplify the OG JSX (fewer gradients, no remote image fetches).

## Rules

### MUST DO
- Ship at least a static fallback `public/og-default.png` (1200×630, ≤200 KB)
- Use absolute URLs in `og:image` (`absoluteUrl()` helper from `13-seo`)
- Set `og:image:width` (1200) and `og:image:height` (630) explicitly (Next.js metadata does this when you pass `width`/`height`)
- For Vietnamese content in dynamic OG: load a diacritic-capable font
- Verify on at least Facebook + Zalo before claiming done
- Cache OG images appropriately (Vercel + 30-min ISR handles this automatically)

### MUST NOT
- Use relative URLs in `og:image` — every social platform breaks
- Skip the `alt` export in `opengraph-image.tsx` (accessibility + fallback text)
- Use animated GIFs as OG — most platforms ignore animation; use a static frame
- Generate OG images per user / per request without caching — kills perf
- Make OG image > 5 MB — platforms reject or truncate
- Use `runtime: 'edge'` and then deploy to a host that doesn't support edge
- Ship without testing on Zalo specifically (most common Vietnam preview channel)

## Anti-patterns
- Stretching a square logo to 1200×630 — looks broken; design a proper OG layout
- Putting the entire site name as the image (no text hierarchy) — looks like a placeholder
- White text on light brand background — Facebook compresses, contrast disappears
- Including the URL in the OG image text (already shown by platform as link preview)
- Tiny text in OG (< 24px) — unreadable in thumbnails on mobile
- Forgetting to update `og-default.png` after rebrand — old logo stays in social caches for weeks

## Quick reference — Vietnamese platform priority

For a Vietnamese landing site, the priority order for preview testing is usually:
1. **Zalo** (most chat sharing happens here)
2. **Messenger / Facebook** (high traffic share source)
3. **Twitter/X** (lower priority unless B2B)
4. **LinkedIn** (B2B sites only)
5. **WhatsApp / Telegram** (international audience)

Test the top 2 minimum before marking done.

## Cross-references
- Metadata factory: `13-seo` (provides `buildMetadata` with OG defaults)
- Theme tokens: `11-theme` (OG image uses `theme.brand.primary` for background)
- Company config: `src/config/company.ts` (name, tagline, domain)
- Caching: `16-caching` (OG images cached per route alongside the page)

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
