> **Reference for the `nextjs-write-code` orchestrator.** Loaded on demand when the
> confirmed plan routes a step here. Not a standalone skill — the orchestrator reads this file via
> its dispatch table. Sibling reference packs live in the same dir; track-level refs under `_refs/nextjs/build-website/`.

# Build Website — Responsive Discipline

## Purpose
Most "responsive bugs" are not bugs — they're missing breakpoint variants, raw fixed widths, or images served at the wrong size. This skill establishes the mobile-first conventions, the image `sizes` policy, and the patterns that ship without the typical breakpoints-broken-at-768px problem.

## When invoked
- Automatic step in the `nextjs-write-code` orchestrator after pages exist (audit pass)
- User says "responsive vỡ", "mobile broken", "tablet không đúng", "responsive audit"
- Adding new sections or pages — verify before committing

## Breakpoint conventions

Tailwind's defaults are good — don't redefine. Use as-is:

| Prefix | Min width | Typical device |
|---|---|---|
| (none) | 0px | Phone (default — mobile-first base styles) |
| `sm:` | 640px | Large phone, small tablet portrait |
| `md:` | 768px | Tablet portrait |
| `lg:` | 1024px | Tablet landscape, small laptop |
| `xl:` | 1280px | Laptop |
| `2xl:` | 1536px | Large desktop |

**Mobile-first rule**: Base classes target phone; `md:`, `lg:`, `xl:` PROGRESSIVELY ENHANCE upward.

```tsx
// ✓ Mobile-first (correct)
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

// ✗ Desktop-first (wrong — fights against Tailwind's design)
<div className="grid grid-cols-3 gap-4 lg:grid-cols-2 md:grid-cols-1">
```

## Container & max-width policy

Every section uses a container with consistent max-width + horizontal padding. Defined in `tailwind.config.ts` (from `theme.md`) as `maxWidth.container: '1280px'`.

```tsx
<section className="py-section">
  <div className="container mx-auto max-w-container px-4 md:px-6 lg:px-8">
    {/* section content */}
  </div>
</section>
```

Why not just `container`: Tailwind's `container` utility scales to specific widths per breakpoint (`max-w-screen-sm`, `max-w-screen-md`, etc.) which feels jumpy. Using `max-w-container` with `mx-auto` gives a single max-width for all breakpoints, padding-only adjustments.

**For long-form text** (blog post, About page paragraph): use `max-w-prose` (≈65ch) for readability.

## Image policy (the #1 perf lever)

`next/image` requires `sizes` prop on responsive images for correct srcset generation. Without it, Next.js falls back to serving the largest size to every device → slow mobile.

```tsx
// Hero image (full width on every breakpoint)
<Image
  src="/images/hero.jpg"
  alt="Kho vật liệu xây dựng — toàn cảnh"
  fill
  priority             // above-the-fold — load eagerly
  sizes="100vw"
  className="object-cover"
/>

// Feature card image (4-up on desktop, 2-up on tablet, 1-up on phone)
<Image
  src="/images/feature-1.jpg"
  alt="..."
  width={600}
  height={400}
  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
  className="rounded-lg object-cover"
/>

// Avatar / testimonial portrait (fixed small)
<Image
  src="/images/avatar.jpg"
  alt="Nguyễn Văn A"
  width={64}
  height={64}
  className="size-16 rounded-full object-cover"
/>
// No `sizes` needed for fixed-width images.
```

**Rules:**
- `priority` ONLY on above-the-fold hero (one per page max — usually). Don't `priority` everything.
- `alt` is mandatory. Empty alt (`alt=""`) acceptable ONLY for decorative images that screen readers should skip.
- Use `fill` with `object-cover` for hero / banner / full-bleed.
- Use explicit `width` + `height` for content images (lets browser reserve space → no CLS).
- `next/image` already emits AVIF + WebP variants per `next.config.ts` (set in `init-site.md`).

## Font size scaling

Use `clamp()` for fluid typography that adapts smoothly instead of stepping at breakpoints:

```css
/* In globals.css (already set in theme.md) */
h1 { font-size: clamp(2rem, 4vw, 3.5rem); }
h2 { font-size: clamp(1.5rem, 3vw, 2.5rem); }
h3 { font-size: clamp(1.25rem, 2vw, 1.75rem); }
```

Body text stays at `16px` (Tailwind's `text-base`) — don't shrink for mobile (a11y issue + reduces conversion).

## Touch targets — minimum 44×44 px

WCAG / Apple HIG / Material guideline. Every interactive element on mobile must be at least 44px square.

```tsx
// ✓ Adequate touch target
<button className="min-h-11 min-w-11 px-4">Submit</button>
// (min-h-11 = 2.75rem = 44px)

// ✓ Icon-only button — needs explicit min-h/min-w
<button className="size-11 grid place-items-center" aria-label="Menu">
  <Menu className="size-5" />
</button>

// ✗ Too small (32px height, fails 44px guideline)
<button className="h-8 px-3 text-sm">×</button>
```

For closely-stacked elements (footer links, table rows), increase `py-` and `gap-` so users don't mis-tap.

## Common section patterns

### Navigation — drawer on mobile, inline on desktop

```tsx
// components/layout/header.tsx
<header>
  <nav className="container mx-auto flex items-center justify-between px-4 py-4">
    <Link href="/" className="font-semibold">{company.name}</Link>

    {/* Desktop inline nav */}
    <ul className="hidden md:flex md:gap-6">
      <li><Link href="/ve-chung-toi">{t('nav.about')}</Link></li>
      <li><Link href="/san-pham">{t('nav.products')}</Link></li>
      <li><Link href="/lien-he">{t('nav.contact')}</Link></li>
    </ul>

    {/* Mobile menu button */}
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Mở menu"
      className="md:hidden size-11 grid place-items-center"
    >
      <Menu />
    </button>

    {/* Drawer (Sheet/Dialog primitive) — only when open */}
    {open && <MobileDrawer onClose={() => setOpen(false)} />}
  </nav>
</header>
```

### Grid → Stack

```tsx
// 3 columns desktop, 2 tablet, 1 phone
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
```

### Hero — image scale

```tsx
<section className="relative min-h-[60vh] md:min-h-[75vh]">
  <Image fill priority sizes="100vw" src="..." alt="..." className="object-cover" />
  <div className="absolute inset-0 bg-black/40" />
  <div className="relative z-10 container mx-auto px-4 pt-32 md:pt-48">
    <h1 className="text-white">...</h1>
  </div>
</section>
```

### Card with image — stack on phone, side-by-side on tablet+

```tsx
<article className="flex flex-col gap-6 md:flex-row">
  <div className="md:w-1/3">
    <Image
      src="..." alt="..."
      width={400} height={300}
      sizes="(min-width: 768px) 33vw, 100vw"
      className="rounded-lg w-full h-auto"
    />
  </div>
  <div className="md:w-2/3">
    <h3>...</h3>
    <p>...</p>
  </div>
</article>
```

### Footer columns

```tsx
<footer className="bg-neutral-900 text-neutral-100">
  <div className="container mx-auto px-4 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
    {/* 4 column blocks */}
  </div>
</footer>
```

## Testing checklist

Run for every new page / major section:

1. **Chrome DevTools device modes** (toolbar → device toggle):
   - iPhone SE (375×667) — narrowest common phone
   - iPhone 14 Pro (393×852) — typical phone
   - iPad (768×1024) — portrait
   - iPad Pro (1024×1366) — landscape
   - Desktop 1280, 1440, 1920 — test xl+ breakpoints
2. **Touch targets**: tap-test all buttons / links / form fields on the iPhone SE preset.
3. **Horizontal scroll**: confirm `<html>` doesn't horizontally scroll on any breakpoint. (Most common cause: a child with explicit width > viewport, or negative margin overflowing.)
4. **Font readability**: body text must be ≥16px. Don't reduce for mobile.
5. **Image LCP**: hero loads in <2.5s on slow 4G (Chrome Network → Slow 4G throttle).
6. **No layout shift**: page elements shouldn't jump as images load (CLS < 0.1). Explicit width/height on images prevents this.

## Quick fixes for common breakage

| Symptom | Cause | Fix |
|---|---|---|
| Horizontal scroll on phone | Element with `w-[100rem]` or large fixed pixel width | Audit fixed widths; use `max-w-` or `w-full` |
| Hero text unreadable | White text on light image | Add `bg-black/40` overlay between image and text |
| Image stretched / squished | Missing `object-cover` or wrong `width:height` ratio | Add `className="object-cover"` and use ratio container if `fill` |
| Nav links overlap on tablet | `flex-wrap` missing; or inline nav shown below md breakpoint | Audit `md:hidden` / `md:flex` classes |
| Button taps don't register | Too small (<44px) | Add `min-h-11 min-w-11` |
| Slow LCP | Hero image too large / not optimized | Confirm `priority`, `sizes`, `next/image` (not `<img>`) |
| Layout jumps as images load | Missing width/height on `<Image>` | Add explicit dimensions OR use aspect-ratio container with `fill` |

## Rules

### MUST DO
- Mobile-first: base classes target phone, `md:`/`lg:`/`xl:` enhance up
- Use `next/image` for every raster image — never `<img>`
- Provide `sizes` prop on responsive images
- Provide `alt` on every image (empty `alt=""` only for decorative)
- Touch targets ≥ 44×44 px
- Body text ≥ 16px on all breakpoints
- `priority` ONLY on the page's hero image (1 per page)
- Use `max-w-container` + `mx-auto` + `px-4 md:px-6 lg:px-8` for section wrappers
- Test on iPhone SE width (375px) — narrowest common device

### MUST NOT
- Use `<img>` instead of `next/image`
- Skip `alt` on images (a11y + SEO penalty)
- Hardcode pixel widths > 320 (will cause horizontal scroll on phone)
- Shrink body text below 16px on mobile
- Use breakpoint prefixes inversely (`lg:grid-cols-1 grid-cols-3`) — fights mobile-first
- Animate layout on resize (causes jank)
- Use `priority` on multiple images (defeats the purpose)
- Ship a page without testing on at least one phone width

## Anti-patterns
- **Pixel-perfect Figma copy** that breaks at any width other than 1440 — Figma is reference, code is mobile-first
- **Single image served at 4K to a phone** — `sizes` solves this; default behavior penalizes mobile traffic
- **`hidden md:flex` on the entire nav** without a mobile alternative — mobile users see nothing
- **`overflow-x-hidden` on `body`** to "fix" horizontal scroll — masks the real bug; find the offending child
- **Negative margins for layout** — usually breaks at unexpected breakpoints; use proper grid/flex
- **`position: absolute` everywhere** — composes poorly responsive; prefer flex/grid layout

## Cross-references
- Image strategy: `pages-and-blocks.md` (section components use `next/image` with `sizes`)
- Container tokens: `theme.md` (`maxWidth.container`)
- Touch targets: also reviewed in `sdcorejs-review` accessibility section
- Performance: `orchestration/verify-before-done` includes Lighthouse mobile score as acceptance criterion (target ≥ 90)
