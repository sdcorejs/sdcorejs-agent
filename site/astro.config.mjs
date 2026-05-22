// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages serves repo sites under <user-or-org>.github.io/<repo>/ — so the
// production base path needs to match the repo name. Override with the
// SITE_BASE env var if the repo is renamed (the deploy workflow sets it).
const base = process.env.SITE_BASE ?? '/sdcorejs-agent/';
const site = process.env.SITE_URL ?? 'https://sdcorejs.github.io';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  // No integrations, no UI framework. The site is intentionally tiny —
  // vanilla Astro + scoped CSS + a few CSS animations + IntersectionObserver
  // for scroll reveals. Keeps the build fast and the output footprint small.
});
