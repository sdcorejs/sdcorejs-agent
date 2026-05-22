# Showcase site — SDCoreJS Agent

The marketing / showcase site for the SDCoreJS skill pack, hosted on GitHub Pages.

- Tech: [Astro](https://astro.build/) static, vanilla CSS, IntersectionObserver scroll reveals. No UI framework, no Tailwind, no JS framework.
- Theme: light only. Palette derived from the brand logo (blue + orange on white).
- Output: pure HTML/CSS/JS in `dist/`, deployed by `.github/workflows/deploy-site.yml`.

## Local development

```bash
cd site
npm install        # one-time
npm run dev        # http://localhost:4321
npm run build      # output → site/dist/
npm run preview    # serve the built dist locally
```

The dev server uses Astro's default base `/`. The production build uses
`/sdcorejs-agent/` (set in `astro.config.mjs`) because GitHub Pages serves repo
sites under `<owner>.github.io/<repo>/`. The CI workflow overrides via
`SITE_BASE` if the repo is renamed.

## Sections

1. **Hero** — logo + tagline + install CTA + stats.
2. **Tracks** — three cards: Angular Portal (Available), NestJS (Coming Soon),
   Next.js Sites (Coming Soon).
3. **Angular Portal** — deep-dive: SDLC workflow strip, the 13 dispatched
   skills, code-output preview, feature pills.
4. **Install** — 3-step plugin install with copy-to-clipboard buttons.
5. **Footer** — links + license.

Each component lives in `src/components/<Name>.astro` with scoped styles. Reveals
use the `.reveal` class — the `IntersectionObserver` in `src/layouts/Layout.astro`
adds `.is-visible` when an element enters the viewport.

## Branding assets

`public/icon.png` and `public/logo-text.png` are copies of the originals in the
repo's `images/` directory (kept in `images/` for use by other consumers — README
banners, GitHub social preview, etc.). When the brand changes, update both
locations or sync via a small `cp` script.

## A note on caching

GitHub Pages serves static files only — no Next.js SSR, no ISR, no
configurable cache TTL. Pages' default `Cache-Control` is `max-age=600` (10 min)
for HTML and immutable for hashed assets. There's no portable way to set the
"60 minutes" cache asked for in the original spec, because Pages doesn't expose
header configuration. If a longer cache is needed later, deploy this site to
Vercel or Netlify where ISR + custom headers are first-class.
