> **Reference for the `sdcorejs-nextjs` orchestrator.** Loaded on demand when the
> confirmed plan routes a step here. Not a standalone skill — the orchestrator reads this file via
> its dispatch table. Sibling reference packs live in the same dir; track-level refs under `_refs/nextjs/build-website/`.

# Build Website — Theme & Design Tokens

## Purpose
A landing site that ships without a deliberate design system ends up with Tailwind class chaos (`text-orange-500` here, `text-amber-600` there). This skill picks an industry-appropriate palette + typography pair, locks them into `tailwind.config.ts` + `globals.css` as design tokens, and forces every later component to use the tokens instead of raw color/size values.

## When invoked
- Automatic after `init-site.md` in a "Full build" dispatch
- User says "pick theme", "set up colors", "chọn theme", "set up design system", "rebrand"
- After a logo change → re-pick palette from logo

## Prerequisites
- Industry + tier from `01-brainstorming`
- Logo + brand color answer from `01-brainstorming` (if user provided)

## Workflow

### Step 1 — Pick the palette

Match industry vibe (from brainstorm) to the table below. Each row is a starting palette — user can override.

| Industry | Primary | Accent | Neutrals | Vibe |
|---|---|---|---|---|
| **Xây dựng / Vật liệu** | `#ea580c` (orange-600) | `#1e293b` (slate-800) | warm grays (`stone-*`) | Industrial, trust, scale |
| **F&B (restaurant)** | `#a16207` (yellow-700) or terracotta `#b45309` | `#166534` (green-800) | cream `#fef3c7`, charcoal | Warm, appetizing |
| **F&B (cafe)** | `#7c2d12` (orange-900) or olive | cream + gold accent | warm grays | Cozy, artisan |
| **Y tế / Phòng khám** | `#0284c7` (sky-600) or sage `#65a30d` | `#0f172a` (slate-900) | cool grays | Clean, trustworthy |
| **Giáo dục** | `#2563eb` (blue-600) | `#facc15` (yellow-400) | neutral grays | Inviting, aspirational |
| **Bất động sản** | `#1e3a8a` (blue-900) or charcoal | `#d97706` (gold) | warm grays | Premium, aspirational |
| **Tư vấn / B2B** | `#0f172a` (slate-900) | `#0ea5e9` (sky-500) | neutral grays | Professional, confident |
| **Du lịch** | `#0891b2` (cyan-600) or sand `#fde68a` | `#ea580c` (sunset) | sky/sand neutrals | Inspirational, scenic |
| **Retail catalog** | Brand-led (read logo) | brand-led | brand-led | Match brand identity |
| **Tech / SaaS** | `#7c3aed` (violet-600) or `#0891b2` | gradient or neon `#22d3ee` | dark mode + neutral | Modern, energetic |
| **Phi lợi nhuận** | `#15803d` (green-700) or `#dc2626` (red-600) | warm gold or sky | warm neutrals | Human, mission-driven |

If user provided a brand color during brainstorming, **derive the palette from that**:
1. Set provided color as `--color-brand`
2. Pick complementary accent (HSL hue ±150° from primary)
3. Pick neutral family (warm or cool based on primary's temperature)
4. Confirm with user before locking

### Step 2 — Pick typography

Match industry + locale (VI default uses `Be Vietnam Pro` baseline). Pair: heading + body.

| Industry | Heading | Body | Why |
|---|---|---|---|
| **Xây dựng / B2B / Tư vấn** | `Be Vietnam Pro` 700 | `Be Vietnam Pro` 400/500 | Same family, weight contrast; locked-down feel |
| **F&B / artisan retail** | `Playfair Display` or `Cormorant Garamond` | `Be Vietnam Pro` | Serif heading adds warmth/character |
| **Y tế / Giáo dục** | `Be Vietnam Pro` 600 | `Be Vietnam Pro` 400 | Neutral, readable |
| **BĐS / Luxury** | `Cormorant Garamond` or `Libre Caslon` | `Be Vietnam Pro` | Editorial serif |
| **Tech / SaaS** | `Inter` 700 or `Geist` | `Inter` 400 | Modern sans |
| **NGO / Tourism** | `Merriweather` or `Lora` | `Be Vietnam Pro` | Friendly serif |

ALWAYS use `next/font/google` (already wired in `[locale]/layout.tsx` from `init-site.md`). If pairing requires 2 families, add a second font in the layout.

### Step 3 — Write `src/config/theme.ts`

Single source of truth for color names + spacing. Components MUST import from here, never raw hex/Tailwind colors.

```typescript
// src/config/theme.ts
export const theme = {
  brand: {
    primary: '#ea580c',      // brand primary (e.g. orange-600)
    primaryDark: '#c2410c',  // hover / pressed
    primaryLight: '#fff7ed', // tint backgrounds
    accent: '#1e293b',       // secondary brand color
  },
  neutral: {
    50: '#fafaf9',
    100: '#f5f5f4',
    200: '#e7e5e4',
    400: '#a8a29e',
    600: '#57534e',
    900: '#1c1917',
  },
  semantic: {
    success: '#16a34a',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#0284c7',
  },
} as const;
```

### Step 4 — Wire `tailwind.config.ts` to consume the tokens

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import { theme } from './src/config/theme';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: theme.brand.primary,
          dark: theme.brand.primaryDark,
          light: theme.brand.primaryLight,
          accent: theme.brand.accent,
        },
        neutral: theme.neutral,
        success: theme.semantic.success,
        warning: theme.semantic.warning,
        danger: theme.semantic.danger,
        info: theme.semantic.info,
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
      },
      maxWidth: {
        container: '1280px',   // standard container
        prose: '65ch',         // long-form text
      },
      spacing: {
        section: '5rem',       // vertical spacing between sections
      },
    },
  },
  plugins: [],
};

export default config;
```

### Step 5 — Tailwind 4 `@theme` block in `globals.css`

Tailwind 4 supports CSS-first design tokens via `@theme`. Mirror the tokens so non-Tailwind CSS (and IDE color preview) sees them too.

```css
/* src/app/[locale]/globals.css */
@import 'tailwindcss';

@theme {
  --color-brand: #ea580c;
  --color-brand-dark: #c2410c;
  --color-brand-light: #fff7ed;
  --color-brand-accent: #1e293b;

  --color-neutral-50: #fafaf9;
  --color-neutral-900: #1c1917;

  --font-sans: 'Be Vietnam Pro', system-ui, sans-serif;
}

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    color: var(--color-neutral-900);
    background: white;
  }
  /* Heading defaults */
  h1, h2, h3, h4 { font-weight: 700; letter-spacing: -0.02em; }
  h1 { font-size: clamp(2rem, 4vw, 3.5rem); }
  h2 { font-size: clamp(1.5rem, 3vw, 2.5rem); }
  h3 { font-size: clamp(1.25rem, 2vw, 1.75rem); }
}
```

### Step 6 — Document the system in `src/config/theme.ts` JSDoc

Add a brief JSDoc at the top:
```typescript
/**
 * Design tokens for <site-name>.
 *
 * Source of truth for colors / spacing. All components MUST import from
 * this file (or use the Tailwind classes `brand-*`, `neutral-*`, `success`, …).
 *
 * To change the palette: update this file + `globals.css` `@theme` block in lockstep.
 * Do NOT use raw hex codes or arbitrary Tailwind colors in components.
 */
```

### Step 7 — Verify

```bash
npm run typecheck    # tokens import correctly
npm run dev          # confirm fonts load, body text uses Be Vietnam Pro
```

Open `localhost:3000` and inspect:
- Body computed font should be `'Be Vietnam Pro', system-ui, sans-serif`
- A `<div className="bg-brand text-white">test</div>` should render the brand color
- No "unknown utility class" warnings in console

## Constraints

- **WCAG AA contrast**: every text-on-background pair must hit 4.5:1 (normal text) or 3:1 (large text). Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) on the picked palette pairs. If a pair fails, darken the foreground or lighten the background.
- **4-6 colors max** in the palette. More = harder to maintain consistency.
- **No raw hex** in components (Editor lint rule: `no-restricted-syntax` for hex literals OR just rely on review).
- **Dark mode**: out of scope for Lean/Standard tiers by default. Add only when user asks (Full tier).

## Rules

### MUST DO
- Pick palette from the industry table (or derive from user's brand color)
- Confirm WCAG AA contrast on body-text / heading / button states before locking
- Write tokens in `src/config/theme.ts` AND mirror to `globals.css` `@theme`
- Mirror to `tailwind.config.ts` so `bg-brand`, `text-neutral-600` work
- Use `next/font/google` for both heading + body
- Run typecheck + dev-server visual check before claiming done

### MUST NOT
- Hardcode hex codes in components — always go through tokens
- Pick more than 6 colors (primary + 1-2 accents + neutrals)
- Use Tailwind's full color palette directly (`text-orange-500` not `text-brand`)
- Add dark mode in this skill — it's a separate decision
- Change palette per page — site-wide consistency is the point
- Skip the contrast check — accessibility findings will surface in `sdcorejs-review` anyway

## Anti-patterns
- **Tailwind class soup**: `bg-orange-500 hover:bg-orange-600 text-white border border-orange-700` repeated in 8 components. Solution: extract `<Button variant="primary">` to `components/ui/button.tsx`.
- **Random gradients**: aesthetic gradients without semantic meaning. If used, define `--gradient-hero` once in tokens.
- **Two competing primary colors**: pick ONE primary; accent is supporting.
- **Heading font with no Vietnamese subset**: confirm `next/font/google` config includes `subsets: ['vietnamese', 'latin']`
- **Body font weight 300 (Light)**: poor readability for VI diacritics, accessibility issue

## Cross-references
- Inputs: industry from `01-brainstorming`, brand color from `01-brainstorming`
- Used by: every component in `components/sections/` and `components/ui/`
- Affects: `pages-and-blocks.md` (components consume these tokens), `responsive.md` (font scaling), `sdcorejs-review` (contrast audit)
