# Doc site - SDCoreJS Agent

The infographic-style documentation site for the SDCoreJS skill pack, hosted on GitHub Pages.

- Tech: [Astro](https://astro.build/) static, vanilla CSS, IntersectionObserver scroll reveals. No UI framework, no Tailwind, no JS framework.
- Theme: light only. Palette derived from the brand logo, with per-track accent colors.
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

1. **Title** - promise, pack stats, and audience framing.
2. **Problem** - why prompt-only coding is not enough.
3. **5-step SDLC** - discovery, spec/plan, dispatch, finish, handoff.
4. **Approval gates** - spec and plan as explicit contracts.
5. **Track dispatch** - sequential/parallel choice plus executor track grid.
6. **Finish discipline** - ordered mandatory tail from tests/review to docs/tasks/memories.
7. **Session context** - how `project-context.md`, `.sdcorejs/summary.md`, docs, memories, specs, plans, tasks, and persona load.
8. **Positioning** - verified local delivery today, production SDLC expansion by approval.

The home page is intentionally page-local in `src/pages/index.astro` because it
is a presentation deck. Shared shell pieces remain in `src/components/`.
Reveals use the `.reveal` class; the `IntersectionObserver` in
`src/layouts/Layout.astro` adds `.is-visible` when an element enters the viewport.

## Current facts reflected by the site

- 24 dispatchable skills.
- 7 executor tracks: product, design, angular, nestjs, nextjs, test, generic.
- 2 explicit approval gates: spec and plan.
- 12 deterministic E2E smoke checks.
- Current scope boundary: verified local delivery is covered; production SDLC expansion needs explicit approval/spec/plan.

## Branding assets

`public/icon.png` and `public/logo-text.png` are copies of the originals in the
repo's `images/` directory. The `public/flow-*.svg` files are small diagram
assets used by the SDLC flow board.

## A note on caching

GitHub Pages serves static files only: no Next.js SSR, no ISR, and no configurable
cache TTL. Pages' default `Cache-Control` is `max-age=600` for HTML and immutable
for hashed assets. If a longer cache is needed later, deploy this site to Vercel
or Netlify where ISR and custom headers are first-class.
