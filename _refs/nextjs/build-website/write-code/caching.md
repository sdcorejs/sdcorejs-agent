> **Reference for the `nextjs-build-website-write-code` orchestrator.** Loaded on demand when the
> confirmed plan routes a step here. Not a standalone skill — the orchestrator reads this file via
> its dispatch table. Sibling reference packs live in the same dir; track-level refs under `_refs/nextjs/build-website/`.

# Build Website — Caching Strategy

## Purpose
A landing site that re-renders every request hits origin too hard; one that's pure SSG is a pain to update. The right default is **ISR with a 30-minute revalidation window** — content updates appear within 30 min without rebuilding, CDN serves cached responses for the rest. This skill applies that default uniformly and gives the user one knob to tune.

## When invoked
- Automatic step of the `nextjs-build-website-write-code` orchestrator after pages are generated
- User says "set up caching", "cấu hình cache", "cache lâu quá / ngắn quá", "fix ISR", "revalidate"
- After CMS integration (need on-demand revalidation)

## The 30-minute default

For a landing site, **ISR 30 min** is the standard recommendation because:

- **Fresh enough**: A content edit (price change, new product, news post) appears live within 30 min — acceptable for the vast majority of marketing pages.
- **Cached enough**: 30 min lets CDN/edge handle ~99% of traffic without hitting Next.js origin — drives Lighthouse perf score and cuts bandwidth cost.
- **Standard everywhere**: Aligns with Vercel's official recommendation for landing pages and matches industry baselines.
- **One knob**: Same number on every page = predictable, easy to reason about, easy to scale up/down later.

Pages get this:

```typescript
// src/app/[locale]/page.tsx (and every other page.tsx)
import { unstable_cacheLife as cacheLife } from 'next/cache';

export default async function Page() {
  'use cache';
  cacheLife({ revalidate: 1800, stale: 1800 });
  // ... return JSX
}
```

`1800` seconds = 30 minutes. `revalidate` is the freshness window; `stale` is how long the stale page can be served while regenerating. Setting them equal = simple, no overlap surprises.

(For Next.js < 16 syntax, use `export const revalidate = 1800;` at the top of the file instead.)

## Decision tree — when to deviate from 30 min

```
Is the page truly static (no data fetch, never changes without a deploy)?
  ├─ Yes → SSG (omit `revalidate`, or set to `false`). Examples: privacy policy, ToS, /about with hand-written copy.
  └─ No → ISR
      ├─ Content changes >1x/day (news, promotions, event countdowns)?  → revalidate: 300 (5 min)
      ├─ Content changes a few times per week (default landing page)?    → revalidate: 1800 (30 min) ← DEFAULT
      ├─ Content rarely changes (about, pricing, services)?              → revalidate: 3600 (1 hour)
      ├─ Truly evergreen content (case studies, completed projects)?     → revalidate: 86400 (1 day)
      └─ Content driven by CMS and user wants instant updates?            → revalidate: false + on-demand
                                                                            revalidation via webhook (see below)

Is the page user-specific (auth, personalization, real-time data)?
  └─ Yes → SSR (`export const dynamic = 'force-dynamic'`). Rare on landing sites — usually only `/account` or `/dashboard`.
```

Rule of thumb: **default 30 min on every page**. Override only with an explicit reason. Mixing many different values is harder to reason about than one number.

## On-demand revalidation

Two cases need it on a landing site:

### Case 1 — CMS webhook (Standard / Full tier)
When marketing edits a page in Sanity/Contentful/Strapi and clicks publish, the CMS POSTs to a Next.js endpoint to mark the page stale immediately. The next visitor gets fresh content; everyone else continues to get cached until then.

**`src/app/api/revalidate/route.ts`**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret');
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: 'invalid secret' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { path, tag } = body as { path?: string; tag?: string };

  if (path) revalidatePath(path);
  if (tag) revalidateTag(tag);

  return NextResponse.json({ ok: true, revalidated: { path, tag } });
}
```

CMS webhook payload examples:
- After publishing a blog post: `{ "tag": "blog" }` → revalidates everything tagged `blog`
- After editing the home hero: `{ "path": "/vi" }` and `{ "path": "/en" }`
- After updating a product: `{ "tag": "products", "path": "/vi/san-pham" }`

Tags are set on the fetch / data layer:
```typescript
// content/<locale>/products.ts or wherever data is loaded
const products = await getProducts({ next: { tags: ['products'] } });
```

### Case 2 — Contact form submission (every tier)
After a successful contact form submission you usually want to revalidate the form's success indicator OR a "latest message" counter. Most landing sites don't need this — but if a `/dashboard` shows submission counts, the form's API route should:
```typescript
import { revalidatePath } from 'next/cache';
// inside the POST handler after sending the email:
revalidatePath('/admin/messages'); // or relevant path
```

## Hosting compatibility

| Hosting | ISR support | On-demand revalidation | Notes |
|---|---|---|---|
| **Vercel** | ✅ Full | ✅ Full | Default; everything works out of box |
| **Cloudflare Pages** (via `next-on-pages`) | ⚠️ Limited — only at edge | ⚠️ Limited | Some ISR features fall back to SSR; ok for small sites |
| **Self-hosted (Node server, Docker)** | ✅ Full | ✅ Full | Works; you handle the disk persistence layer |
| **Static export** (`output: 'export'`) | ❌ Not supported | ❌ Not supported | Equivalent to SSG only — incompatible with ISR; do NOT use for sites needing content updates |

If user picked Cloudflare in `sdcorejs-clarify-requirements` → confirm 30-min ISR is acceptable (it is for most landing sites) OR fall back to longer windows + on-demand only.

## Caching what NOT to cache

Some routes MUST opt out of caching:

```typescript
// API routes that mutate (POST contact form, etc.)
// src/app/api/contact/route.ts
export const dynamic = 'force-dynamic';  // never cache; always run handler
```

```typescript
// Auth-required pages (rare on a landing site)
// src/app/admin/page.tsx
export const dynamic = 'force-dynamic';
```

```typescript
// Pages with personalized content (location-based pricing, A/B test)
export const dynamic = 'force-dynamic';
```

Never put `'use cache'` on an API route handler — it'll cache the response and serve stale to every caller.

## Headers / CDN behavior

ISR pages return `Cache-Control` headers automatically; usually no need to override. For static assets (images, fonts), `next/image` and `next/font` already emit appropriate headers (`public, max-age=31536000, immutable` for hashed assets).

If hosting behind a custom CDN (Cloudflare in front of Vercel, etc.), confirm the CDN respects `s-maxage` from Next.js — most do.

## Verification

After applying caching, verify:

```bash
# Build production
npm run build
# Look at the build output — each route should show its rendering mode:
# ƒ (Dynamic)   server-rendered on demand
# ○ (Static)    prerendered at build time
# ● (SSG)       prerendered with revalidate
```

For a landing site with 30-min ISR, expect every page.tsx to show `●` with the revalidate interval listed.

Smoke test:
```bash
npm run start
# Hit a page; check response headers for Age: 0 (first request, miss)
# Hit again; check Age: increased (second request, hit)
# Wait > 30 min OR call /api/revalidate; verify page regenerates
```

## Rules

### MUST DO
- Apply 30-min ISR to every `page.tsx` by default
- Use the same `revalidate` value across pages unless there's a documented reason to differ
- Wire `/api/revalidate` with a secret header for on-demand revalidation (always — even if no CMS yet)
- Tag fetches that may need targeted revalidation (`{ next: { tags: ['products'] } }`)
- Verify the build output shows the expected rendering mode per route
- Document the chosen interval in the auto-docs entry

### MUST NOT
- Mix many different `revalidate` values across pages without a reason — adds reasoning load
- Cache API routes that handle mutations (`force-dynamic` instead)
- Default to `force-dynamic` everywhere "just in case" — kills perf
- Use `output: 'export'` for sites that need ISR
- Skip the on-demand endpoint — even if no CMS yet, the user might add one later
- Set `revalidate: 0` thinking it means "no cache" — it means "always revalidate", which is effectively SSR with extra steps

## Anti-patterns
- "Cache for 24 hours, just call revalidate after every edit" — works but requires CMS webhook setup before going live; for sites without CMS, 30-min default is simpler
- Setting different intervals per page based on gut feeling — without measurement, you're just adding complexity
- Forgetting to flush ISR cache after a major content rewrite — manually call `/api/revalidate?path=/` once after deploy
- Treating ISR like SSG — you still need on-demand revalidation for time-sensitive updates
- Caching the contact form's response (a redirect to a thank-you page) — the redirect is fine to cache, but the POST endpoint must not be

## When user asks to change the default
- "5 phút thì tươi mới hơn?" → yes, but expect ~6x more origin hits. Often unnecessary for marketing content.
- "Lâu hơn được không?" → yes, up to 1-24 hour for stable content. Just ensure on-demand revalidation is wired so urgent fixes don't wait.
- "Tắt cache đi" → equivalent to SSR; perf will drop; ask why before applying. Usually the real need is on-demand revalidation, not no-cache.

Confirm the change in conversation, apply via Edit, re-build, verify.

## Cross-references
- Inputs: hosting + caching answers from `sdcorejs-clarify-requirements`
- Outputs to: `orchestration/verify-before-done` (caching-rendering-mode is verifiable acceptance criterion)
- Related: `seo.md` (sitemap may itself be cached), `contact-form.md` (revalidate after submit), `i18n.md` (cache per locale, automatic with App Router)
