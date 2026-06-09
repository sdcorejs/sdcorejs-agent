# Showcase site - SDCoreJS Agent

The marketing / showcase site for the SDCoreJS skill pack, hosted on GitHub Pages.

- Tech: [Astro](https://astro.build/) static, vanilla CSS, IntersectionObserver scroll reveals. No UI framework, no Tailwind, no JS framework.
- Theme: light only. Palette derived from the brand logo (blue + orange on white).
- Output: pure HTML/CSS/JS in `dist/`, deployed by `.github/workflows/deploy-site.yml`.

## Local development

```bash
cd site
npm install        # one-time
npm run dev        # http://localhost:4321
npm run build      # output -> site/dist/
npm run preview    # serve the built dist locally
```

The dev server uses Astro's default base `/`. The production build uses
`/sdcorejs-agent/` (set in `astro.config.mjs`) because GitHub Pages serves repo
sites under `<owner>.github.io/<repo>/`. The CI workflow overrides via
`SITE_BASE` if the repo is renamed.

## Sections

1. **Hero** - current pack stats, runtime-localized positioning, and install CTA.
2. **Tracks** - Angular Portal, NestJS, and Next.js track summaries.
3. **Angular Portal** - track focus, on-demand reference packs, generated shape.
4. **Quality Gates** - E2E harness phases, including full Phase 4 opt-in command.
5. **Install** - 3-step plugin install with copy-to-clipboard buttons.
6. **Footer** - links + license.

Each component lives in `src/components/<Name>.astro` with scoped styles. Reveals
use the `.reveal` class; the `IntersectionObserver` in `src/layouts/Layout.astro`
adds `.is-visible` when an element enters the viewport.

## Current facts reflected by the site

- 42 dispatchable skills.
- 147 reference documents.
- English source skills with runtime-localized output.
- E2E harness phases:
  - Phase 1: deterministic skill-pack runner.
  - Phase 2: Codex + Claude CLI adapter smoke.
  - Phase 3: Copilot/Cursor entrypoint and prompt eval smoke.
  - Phase 4: generated target-app golden test with Docker, supertest, and Playwright when `SDCOREJS_E2E_FULL=1`.

## Branding assets

`public/icon.png` and `public/logo-text.png` are copies of the originals in the
repo's `images/` directory. When the brand changes, update both locations or sync
via a small copy script.

## A note on caching

GitHub Pages serves static files only: no Next.js SSR, no ISR, and no configurable
cache TTL. Pages' default `Cache-Control` is `max-age=600` for HTML and immutable
for hashed assets. If a longer cache is needed later, deploy this site to Vercel
or Netlify where ISR and custom headers are first-class.
