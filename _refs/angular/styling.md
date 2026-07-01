# Angular styling — utility-first, minimal custom CSS

Loaded on demand by `sdcorejs-angular` (and its write-code packs) whenever a generated template needs layout / spacing / color / typography. The goal: **reuse the utility classes Core UI already ships instead of hand-rolling CSS.** Every bespoke `.scss` rule is a maintenance cost and a chance to drift from the design system — a utility class is reviewed, themed, and consistent.

## 1. ALWAYS fetch the live STYLE-GUIDE first — never hardcode the class list
The STYLE-GUIDE is the SINGLE source of truth for which utility classes exist, and it is deliberately **not** stored in this repo (a committed copy would drift from the published library across versions). Before writing any styling, ALWAYS fetch it:

```bash
node _refs/angular/core-docs-fetch.mjs --print assets/STYLE-GUIDE
```

The fetcher pulls it once and caches it (version-matched to the consumer's installed package, legacy `@sd-angular/core` included); if it's already cached it reuses that, and offline it falls back to cache. So "fetch if not present" is automatic — just run it. Never skip it, and never rely on memorized or hardcoded class names: generate templates using ONLY classes that exist in the freshly fetched doc. If a class you want isn't listed, it does not exist — use the nearest one or write a small flagged custom rule (§5). This file holds the stable RULES; the fetched STYLE-GUIDE holds the class list — the class list is intentionally NOT duplicated here.

## 2. Pick the class system
1. **Core UI utilities (default).** Always available once `assets/scss/sd-core.scss` is in `angular.json` `styles` (init-portal wires this). Cover flex, grid, spacing, sizing, color, typography, border, elevation.
2. **Tailwind (if the consumer ships it).** Detect it — `tailwind.config.{js,ts,cjs,mjs}` present, OR `tailwindcss` in `package.json`, OR `@tailwind`/`@apply` in `styles.scss`. If present, Tailwind utilities are first-class too; match whichever system the existing components already use, don't introduce a second convention in a file that doesn't have it. If Tailwind is absent, do NOT invent Tailwind syntax (`md:flex`, `hover:bg-red-500`, `text-[14px]`) — Core UI does not ship it.

Either way the rule is the same: **utility-first, minimal custom CSS.**

## 3. What the system covers (look up exact classes in the fetched guide)
The fetched STYLE-GUIDE groups utilities by concern, so for almost any need a class already exists — look it up there instead of writing CSS. The concerns: **flex** (direction / wrap / grow-shrink / align / justify), **layout** (12-col `row`/`col` + responsive `col-{sm,md,lg,xl}`, CSS `grid-container`/`grid-cols`/`col-span`), **spacing** (margin / padding / gap), **sizing** (width / height / min / max + `w-full`/`w-fit`), **color** (text / bg / border `--sd-*` tokens), **typography** (size tokens / weight / align / wrap / ellipsis), **border + radius**, **display / position / overflow / visibility**, **elevation** (`<localized text>`), **cursor / vertical-align**. Do NOT keep a copy of the class list here — fetch it (§1); a stored cheatsheet drifts.

### Spacing gotcha (a stable behavioral rule, not a class list)
Core UI spacing/sizing utilities (`m-*` / `p-*` / `gap-*` / `w-*` / `h-*` / `fs-*` / `rounded-*`) are **absolute px, integer 0–200** — NOT Bootstrap multipliers. `mb-16` = 16px (Bootstrap's `mb-3` would be 3px here, almost certainly a bug). Use **multiples of 4**; an off-scale (`m-3`, `p-5`) or out-of-range (>200) value silently produces no class. Confirm exact ranges in the fetched guide.

## 4. Spacing contract for generated screens

Generated UI must declare spacing intentionally. Missing `gap-*`, `p-*`, `m-*`, or grid gutters is a defect, not a neutral default. Start from these stable rules, then adjust only when the existing screen already establishes a different density.

### Default density

- Page content wrapper: `d-flex flex-column gap-16` or `p-16 d-flex flex-column gap-16` when the page shell does not already provide padding.
- Header/action row: `d-flex align-items-center justify-content-between gap-8` or `gap-12`; buttons should not touch titles, filters, or each other.
- Form section body: `row row-sm mx-0` for compact forms; use `gap-16`/`p-16` for non-grid layouts.
- Between sections: `gap-16` for normal detail pages, `gap-24` only when sections are visually dense or have large tables/uploads.
- Table or child collection toolbar: `d-flex align-items-center justify-content-between gap-12 p-16`.
- Child row editor: `d-flex flex-column gap-12 px-16 pb-16` around rows; row itself uses `row row-sm align-items-start`.
- Inline table-cell controls: `size="sm"` and `hideInlineError`; put expanded validation summaries below the table/row group so rows do not jump in height.
- Footer actions: `d-flex align-items-center justify-content-end gap-8`; use `gap-12` when there are 3+ actions or destructive actions.

### Required checks before finishing a generated template

- Every adjacent group of elements has either a grid gutter (`row row-sm`, `col-*`) or an explicit `gap-*`.
- Every section/table/list body has a padding decision: component-provided padding, `p-*`, or an intentional `noPaddingBody` with inner `p-*`/`px-*`/`pb-*`.
- Empty states are centered with `d-flex flex-column align-items-center justify-content-center gap-12 p-24` or the closest existing project pattern.
- Icon-only buttons are not glued to inputs/table edges; use a fixed action column/area plus `gap-8`.
- Mobile width is considered: use `col-12` first, then `col-md-*`/`col-lg-*`; do not force many fixed-width controls into one row.

### Do not

- Leave a naked sequence of `<sd-input>` / `<sd-button>` / `<sd-section>` siblings without `row`, `gap`, or padding.
- Add `style="gap: 8px"` or custom `.scss` for spacing that a fetched utility class covers.
- Wrap sections in decorative card containers to create spacing; use layout utilities and real Core UI sections.
- Use Bootstrap scale assumptions (`mb-3`, `p-2`) in Core UI projects; those are literal pixels here and usually too small.

## 5. When custom CSS IS justified
Only when no utility fits (a true one-off: a specific `clip-path`, a computed gradient, a `w-250` above the 0–200 range, a component-specific animation). Then:
- Keep it in the component'<localized text>'s out of scope).
- Add a one-line `// why:` comment so the reviewer knows it's deliberate, not laziness.
- Reuse Core UI tokens inside it: `var(--sd-primary)`, `var(--sd-black200)` — don't hardcode hex.
- Theme/color overrides + `mat.all-component-themes` belong in `styles.scss` via `sd.theme(...)`, not in components (STYLE-GUIDE §14).

## 6. What review checks (and what NOT to do)
- ❌ Hand-written flexbox/spacing/alignment/color CSS that a utility class already covers — this is the "too many unnecessary CSS classes" anti-pattern the team wants gone.
- ❌ A component `.scss` full of `display:flex; gap:16px; padding:16px` instead of `d-flex gap-16 p-16` on the template.
- ❌ Generated templates with missing spacing between sibling controls/sections, especially detail pages with child tables or row editors.
- ❌ Bootstrap class names (`btn`, `card`, `form-control`, `alert`, `modal`) — they don't exist; use the Core UI component (`<sd-button>`, `<sd-modal>`) or the utility.
- ❌ Tailwind syntax when the consumer has no Tailwind.
- ✅ Template carries the utilities; component `.scss` is near-empty or holds only genuinely-custom, token-based, commented rules.
