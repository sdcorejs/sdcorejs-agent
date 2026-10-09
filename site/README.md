# SDCoreJS Agent documentation site

Task-oriented Vietnamese and English docs for developers and team leads. Astro 7
static HTML, vanilla CSS and small progressive JavaScript interactions; no UI
framework or new dependency. Blue/orange identity and system fonts are retained.

## Local preview

From `site/`, with Node.js >=22.12.0:

```bash
npm ci
npm run build
npm run check:links
npm run preview -- --host 127.0.0.1 --port 4321
```

Vietnamese: `http://127.0.0.1:4321/sdcorejs-agent/vi/`.
English: `http://127.0.0.1:4321/sdcorejs-agent/en/`.
Both dev and production use `SITE_BASE`, default `/sdcorejs-agent/`. Override
`SITE_BASE=/` for a root-mounted build and pass the same environment to the
checker. Astro 7 can run preview in the background; use
`npm run astro -- preview status` and `npm run astro -- preview stop` when needed.
The preview is local to the host; it is not an iOS-accessible public URL.

## Information architecture and locales

Every content route has `/vi/` and `/en/` counterparts: 38 pages per language.
The native language links retain the corresponding page. Each page emits its
own canonical URL and alternate language links, with Vietnamese as `x-default`.
The paths below follow either locale prefix:

- `/`: orientation and task-based starting points.
- `/docs/capabilities/`: outcomes, tracks, eligibility and scope boundaries.
- `/docs/quickstart/`: source-backed installation paths and smoke prompts.
- `/docs/workflows/`: choose the owner from the problem and required output.
- `/docs/recipes/`: feature, UI, debug and AI-agent examples.
- `/skills/`: searchable/filterable catalog and 24 public skill references.
- `/angular/`: Angular adoption guide.
- `/docs/artifacts/`: approval, ownership, artifact layout and evidence layers.
- `/docs/troubleshooting/`: installation/context/gate/environment diagnosis.
- `/docs/versions/`: main snapshot, candidate boundary and evidence limits.

The 38 unprefixed content URLs are static HTML aliases that redirect to
their Vietnamese counterpart with a meta refresh and visible VI/EN links.
These are not HTTP 301 redirects. Each locale has a `/404/` help page; the global
`404.html` includes both languages because static hosting has one fallback file.

## Maintain content

Author UTF-8 Markdown in `src/content/docs/` and corresponding English files in
`src/content/en/docs/`, with matching `slug` and localized `title`/`description`.
Angular guides live in `src/content/angular.md` and `src/content/en/angular.md`.
Use site-root Markdown links such as `[Quickstart](/docs/quickstart/)`.
`src/data/content.ts` rewrites compiled page links under the configured base and
current locale; static assets retain the base without a locale. Do not pre-add
the base or locale to authored links. Astro's Markdown processor stays in place.

`src/data/navigation.ts` owns navigation and the pinned source snapshot.
`src/data/catalog.ts` reads canonical skill names/paths and pairs them with
Vietnamese notes; `catalog-en.ts` holds English input/output/boundary/prompt
notes for the same 24 skills. Inventory drift fails the build. `home.ts` holds
localized overview content, and `i18n.ts` holds shared UI and state messages.
Runtime skills and generated mirrors are read-only inputs. Updating a revision
requires factual review of claims, commands and boundaries in both languages;
changing only the link hash is insufficient. Main snapshots and candidates must
remain clearly distinguished from verified releases.

The current working-tree catalog includes the approved `sdcorejs-cleanup`
utility as an unpublished candidate. Its canonical path does not exist in the
documented pinned revision, so its page shows candidate status and the local
source path without a GitHub blob link. The other 23 skill pages retain their
pinned source links. `hasPublishedSource` checks local Git objects at build
time; publishing the candidate remains a separately authorized Git delivery.

Static `vi/search-index.json` and `en/search-index.json` each cover all 38 pages,
including Angular body text and skill notes. Search results stay in the active
locale. The modal supports Tab/Enter/Escape and `/`; search and catalog filtering
normalize Vietnamese accents. Navigation, guides, language links and all skill
references remain accessible without JavaScript. Native `<details>` provides
mobile navigation; code remains selectable if clipboard access fails.

## Verification

Build first, then run `npm run check:links` with the same `SITE_BASE`. The checker
validates HTML links/assets/fragments, both locale route sets and search indexes,
language-switch targets, canonical/alternate links, legacy aliases, main
landmarks, encoding and 41 pinned GitHub source paths against local Git objects.
Search inventory derives from canonical skills, guides and the three overview
pages. Each skill's published/candidate status and source-link availability are
checked against the documented revision; candidates cannot link to absent blobs.
It also checks the 12 Markdown pairs for section counts, source URL parity and
unchanged executable Bash/PowerShell blocks. These structural checks do not
prove translation quality, external HTTP availability or WCAG conformance.

For UI edits, inspect both languages at desktop, 390px mobile and 320px reflow.
Exercise keyboard navigation, search empty/loading/error states, focus return,
filters, clipboard, language-switch page retention and no-JavaScript fallbacks.
Capture real local-preview screenshots. Screen-reader and real iOS/Safari checks
need separate evidence.

The existing Pages workflow deploys source built from `main`. Publishing requires
an explicitly authorized Git delivery; a local build or ZIP does not publish it.
This site adds no tracking, hosting service or paid dependency.
