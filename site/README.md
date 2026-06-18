# Doc site - SDCoreJS Agent

The presenter-deck documentation site for the SDCoreJS skill pack, hosted on GitHub Pages.

- Tech: [Astro](https://astro.build/) static, vanilla CSS, no UI framework, no Tailwind, no JS framework.
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

The home page is a no-scroll presentation deck. It advances with Back/Next
buttons instead of vertical page scrolling, so each screen can be used directly
in a stakeholder presentation.

1. **Opening** - promise, pack stats, and audience framing.
2. **Problem** - why prompt-only coding is not enough.
3. **Input context** - images, PRD, API docs, code, logs, and constraints.
4. **5-step SDLC** - discovery, spec, plan, dispatch, finish.
5. **Explore** - project-context, summary, docs, memories, tasks, persona.
6. **Spec gate** - explicit approval before planning.
7. **Plan gate** - file-by-file plan and sequential/parallel choice.
8. **Track dispatch** - product, design, angular, nestjs, nextjs, test, generic.
9. **Finish gate** - ordered mandatory tail from tests/review to docs/tasks/memories.
10. **Memory handoff** - auto-docs, task tracker, memories, persona.
11. **Claude setup** - install and smoke prompts.
12. **Codex setup** - AGENTS.md-compatible usage and smoke prompts.
13. **Skill pack tests** - local verification commands.
14. **Angular Portal usage** - Core UI, code-map, autoId, permissions, tests, docs.
15. **Short prompt examples** - simple real prompts plus the rule that the agent auto-loads context and asks when context is missing or contradictory.
16. **Safety behavior** - agent asks when context is missing or contradictory.
17. **Demo script** - a short presenter flow.
18. **Closing** - context -> spec -> plan -> execute -> verify -> remember.

The home page is intentionally page-local in `src/pages/index.astro` because it
is a presentation deck. Shared shell pieces remain in `src/components/`.
The deck locks body scrolling on the home page and uses local button state for
slide navigation.

## Current facts reflected by the site

- 24 dispatchable skills.
- 7 executor tracks: product, design, angular, nestjs, nextjs, test, generic.
- 2 explicit approval gates: spec and plan.
- 12 deterministic E2E smoke checks.
- Current scope boundary: verified local delivery is covered; production SDLC expansion needs explicit approval/spec/plan.

## Branding assets

`public/icon.png` and `public/logo-text.png` are copies of the originals in the
repo's `images/` directory. The `public/flow-*.svg` files are small diagram
assets used by the SDLC flow board. `public/skill-flow-summary.png` is the
large summary workflow image used on the final presenter slide.

## A note on caching

GitHub Pages serves static files only: no Next.js SSR, no ISR, and no configurable
cache TTL. Pages' default `Cache-Control` is `max-age=600` for HTML and immutable
for hashed assets. If a longer cache is needed later, deploy this site to Vercel
or Netlify where ISR and custom headers are first-class.
