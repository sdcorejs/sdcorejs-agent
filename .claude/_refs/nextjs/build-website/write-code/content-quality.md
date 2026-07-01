> **Reference for the `sdcorejs-nextjs` orchestrator.** Loaded on demand when the
> confirmed plan routes a step here. Not a standalone skill — the orchestrator reads this file via
> its dispatch table. Sibling reference packs live in the same dir; track-level refs under `_refs/nextjs/build-website/`.

# Build Website — Content Quality & On-Page SEO

## Purpose
Technical SEO (`seo.md`) + i18n plumbing (`i18n.md`) get you a site Google can crawl. **This skill is what makes Google actually rank you and humans actually read past the hero**: long-enough copy, clear sentences, scannable structure, strict bilingual parity, and on-page SEO best practices that the search algorithm rewards.

A landing site that ships with 50-word "Lorem ipsum about us" sections + auto-translated EN copy will:
1. Lose to competitors with 400-word, expert-written sections (thin-content penalty)
2. Lose EN traffic to anyone with native-quality copy (Google detects machine translation)
3. Look unprofessional to the human reader who actually scrolls past the hero

This skill enforces the floor: minimum lengths, prose discipline, parity check, on-page SEO.

## When invoked
- Automatic step in the `sdcorejs-nextjs` orchestrator after `pages-and-blocks.md` + `seo.md` (so we have pages and metadata to audit)
- User says "<localized text>", "<localized text>", "<localized text>", "review content quality"
- After adding new pages or articles — before launch
- Anytime `sdcorejs-review` flags "Critical: thin content"

## Prerequisites
- Pages exist (`pages-and-blocks.md` done)
- Metadata factory exists (`seo.md` done)
- i18n wired (`i18n.md` done) — even for "VI only" sites, the structure must be bilingual-ready

## What ships

| File | Purpose |
|---|---|
| `tailwind.config.ts` | Add `@tailwindcss/typography` plugin |
| `src/app/globals.css` | `prose` overrides — Vietnamese-aware (line-height, font-feature-settings) |
| `src/lib/seo.ts` | Extend `buildMetadata` with title-length / description-length warnings |
| `src/lib/structured-data.ts` | Add `articleJsonLd` builder |
| `src/components/ui/prose.tsx` | Wrapper that applies `prose prose-neutral max-w-prose` consistently |
| `src/components/ui/toc.tsx` | Auto-generated Table of Contents from `<h2>` / `<h3>` |
| `src/components/sections/article-body.tsx` | Article body section with prose + TOC |
| `scripts/check-i18n-parity.ts` | Build-time check: vi.json ↔ en.json keys + content/vi/*.ts ↔ content/en/*.ts fields |
| `scripts/check-content-length.ts` | Build-time check: min word counts per page type |
| `package.json` | Add `check:i18n`, `check:content`, wire into `prebuild` |

## Part 1 — Bilingual strictness

### Rule 1.1 — Parity is binary (not "should be in sync")

Every VI key must have an EN counterpart, and vice versa. Every field in `content/vi/<page>.ts` must exist in `content/en/<page>.ts` with the same shape. No exceptions for "EN ready later" — empty string is acceptable, missing key is not.

### Rule 1.2 — No machine translation for production

Google's algorithm detects machine-translated text since 2018 (per their public guidance). Symptoms it picks up:
- Literal word order ("<localized text>" → "We provide high quality" — grammatical but stilted)
- Wrong idioms ("<localized text>" → "thoughtful service" instead of "attentive service")
- Articles + plurals wrong (VI has no articles; auto-translate drops or doubles "a/the/an")
- Tense inconsistency

Rule: **EN copy must be reviewed by someone fluent in English**. If the user lacks an EN speaker, ship VI-only with EN structure ready (empty strings) rather than ship machine-translated EN.

For VI: same rule applies to EN→VI. Vietnamese has tones and diacritics that auto-translate often mangles in idiomatic phrases.

### Rule 1.3 — Keyword research per locale

VI "<localized text>" and EN "construction materials" are not the same search query. They have different volumes, different competition, and different intent (B2B vs B2C splits differ by market). For each locale:
1. List 5-10 keywords with real search volume in THAT language (use Google Trends, Keyword Planner)
2. Use them in title, h1, first paragraph, image alt — for THAT locale
3. Don't translate keywords — research them

### Parity check script

Create `scripts/check-i18n-parity.ts` — compares `vi.json` ↔ `en.json` keys and the `content/vi` ↔ `content/en` file sets, exits 1 on divergence. The full script + the `package.json` `prebuild` wiring live in `_refs/nextjs/build-website/content-quality-refs.md` ("check-i18n-parity.ts"). Once wired into `prebuild`, `npm run build` fails fast on drift, and `sdcorejs-ship (verify-before-done mode)` enforces it automatically.

## Part 2 — Long-form content rules

### Rule 2.1 — Minimum word counts per page type

| Page type | Min words (per locale) | Why |
|---|---|---|
| Homepage | 400 | Below this, search engines treat it as a doorway page |
| About / Company | 400 | E-E-A-T signal — "About" is one of Google's quality flags |
| Service / Product detail | 600 | Long-tail keyword space; competitors typically have 800+ |
| Pillar / Cornerstone article | 1500 | Topic authority; gets internal links from cluster articles |
| Blog post / News | 800 | Below 600 is "thin content"; 800+ is the sweet spot for new sites |
| FAQ page | 500 (across all answers) | Each Q&A should be 50-150 words |
| Contact | 150 | Address + hours + map + form intro is enough |

Below the floor → `sdcorejs-review` flags as **Critical: thin content**.

### Rule 2.2 — Sentence and paragraph discipline

- **Sentence length**: average 15-20 words; max 30. Long sentences break readability and translation accuracy.
- **Paragraph length**: 2-4 sentences (40-80 words). Mobile-first — long paragraphs become walls of text on phone.
- **Active voice over passive**: "<localized text>" not "<localized text>". "We deliver in 24 hours" not "Delivery is provided within 24 hours".
- **Concrete over abstract**: "<localized text>" not "<localized text>". Numbers and place names beat adjectives.
- **No filler**: cut phrases like "best-in-class solution" when they add no meaning.

### Rule 2.3 — Article structure (the F-pattern)

Long-form content follows a known scannable structure because users skim before they read:

```
H1: <Primary keyword | Brand>           ← 50-60 chars, keyword first half
Lead paragraph (≤80 words)               ← Answer the user's question in 1-2 sentences
H2: <Section 1 — secondary keyword>
  ≤200 words, optional H3 subsections
  Image with descriptive alt
H2: <Section 2>
  …
H2: <Section 3>
  …
H2: Conclusion / Call to action
  → Internal link to product/contact page
```

Rules:
- **Exactly one `<h1>`** per page — same as the metadata title (or close to it).
- **3-7 `<h2>` sections** for a typical 800-1500 word article.
- **`<h3>` only inside `<h2>` blocks** — never skip levels (no `<h2>` followed by `<h4>`).
- **First paragraph contains the primary keyword** — Google weights early text more.
- **Last paragraph has the CTA** — never end with "and that's it!"; always guide the reader to the next step.

### Length check script

Create `scripts/check-content-length.ts` — counts words in each `content/<locale>/*.ts` file's string fields and fails below the per-file threshold (`MIN_WORDS`). Full script in `_refs/nextjs/build-website/content-quality-refs.md` ("check-content-length.ts"). For pages with truly little content (`contact.ts` at 150 words), set `MIN_WORDS` accordingly; unset files are skipped. **Note:** this script only scans `.ts` content files — article bodies authored as `.mdx` need a separate per-slug word count (see the MDX caveat in the refs file).

## Part 3 — Reading experience (Tailwind Typography)

### Step 3.1 — Install plugin

```bash
npm install -D @tailwindcss/typography
```

`tailwind.config.ts`:
```typescript
import typography from '@tailwindcss/typography';

export default {
  // ... existing config
  plugins: [typography],
};
```

### Step 3.2 — `globals.css` — Vietnamese-aware prose

Tailwind Typography's defaults are tuned for English. Vietnamese needs adjustment for diacritics (taller line-height + better font-feature-settings).

```css
@layer base {
  .prose {
    /* Tighter than default 1.75 for VI — diacritics already add vertical space */
    line-height: 1.7;
    /* Optimize for both VI and EN rendering */
    font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
  }
  .prose h2 {
    /* Restore some space above section headings */
    margin-top: 2.5em;
  }
  .prose p {
    /* Slightly looser paragraph spacing for scannability */
    margin-bottom: 1.25em;
  }
  .prose a {
    /* Brand color for links inside prose */
    color: var(--color-brand);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .prose img {
    /* Rounded by default in articles */
    border-radius: 0.5rem;
  }
}
```

### Step 3.3–3.5 — Presentation components

Three components ship for long-form reading; full code in `_refs/nextjs/build-website/content-quality-refs.md` ("Presentation components"):

- **`src/components/ui/prose.tsx`** — wraps content in `prose prose-neutral max-w-prose mx-auto` (Tailwind'<localized text>'s eye between rows). Accepts a `size` prop.
- **`src/components/ui/toc.tsx`** — sticky desktop Table of Contents with an `IntersectionObserver` active-section highlight. Render only for articles ≥ 4 `<h2>` blocks. Extract TOC items server-side; for MDX use `rehype-slug` + `rehype-autolink-headings`.
- **`src/components/sections/article-body.tsx`** — composes `Prose` + `TableOfContents` + author byline + published/updated dates into the article layout.

## Part 4 — On-page SEO checklist

Every page must satisfy this checklist before launch. `sdcorejs-ship (verify-before-done mode)` includes it as acceptance criterion.

### 4.1 — Title and meta description

- **Title**: 50-60 characters. Primary keyword in first half. Brand name at end after `|`.
- **Description**: 150-160 characters. Includes primary keyword + a call-to-action verb. Different per page.

Extend `buildMetadata` in `src/lib/seo.ts` to warn at build time:

```typescript
// In buildMetadata, after computing fullTitle / description:
if (process.env.NODE_ENV === 'development') {
  if (fullTitle.length > 60) console.warn(`[SEO] Title too long (${fullTitle.length} chars): "${fullTitle}"`);
  if (fullTitle.length < 30) console.warn(`[SEO] Title too short (${fullTitle.length} chars): "${fullTitle}"`);
  if (description && description.length > 160) console.warn(`[SEO] Description too long (${description.length} chars)`);
  if (description && description.length < 120) console.warn(`[SEO] Description too short (${description.length} chars)`);
}
```

### 4.2 — Heading hierarchy

- Exactly 1 `<h1>` per page (the page title).
- `<h2>` for major sections. `<h3>` only inside `<h2>` blocks.
- Never skip levels. Never use heading tags for visual styling — use semantic classes.
- Each `<h2>` ideally contains a secondary keyword.

### 4.3 — Internal linking

- Every long-form page links to ≥ 3 other pages on the same site.
- Anchor text uses the target keyword, not "click here" / "learn more".
- Articles in the same topic cluster link to each other and to the pillar page.

### 4.4 — Image alt text quality

`alt` is mandatory (`pages-and-blocks.md` enforces) but presence ≠ quality. Rules:
- Describe the image's CONTENT, not its filename ("construction materials warehouse in the main service area" not "warehouse.jpg")
- Include a keyword when it fits naturally; do not stuff keywords.
- Decorative images get empty `alt=""` (already covered in `responsive.md`)
- Hero images get the page's primary keyword in alt

### 4.5 — Article schema (JSON-LD)

For every blog post / news article / detailed product page, emit `Article` JSON-LD via the builder. Add the `articleJsonLd(input)` factory to `src/lib/structured-data.ts` — full implementation in `_refs/nextjs/build-website/content-quality-refs.md` ("articleJsonLd builder"). It emits `@type: Article` with `headline`, `image`, `datePublished`/`dateModified`, a `Person` author, the `Organization` publisher, and locale-correct `inLanguage`. Render it in the article page next to the existing `Organization` schema (the JSON-LD `<script>` can include an array of multiple schemas).

### 4.6 — Open Graph article-specific

For articles, override `type: 'article'` in `buildMetadata` and add article-specific OG tags:

```typescript
// In buildMetadata, when type === 'article':
openGraph: {
  type: 'article',
  // ...
  article: {
    publishedTime: publishedAt?.toISOString(),
    modifiedTime: updatedAt?.toISOString(),
    authors: [authorUrl ?? authorName],
    section: category,        // e.g. "<localized text>"
    tags: keywords,
  },
}
```

(Note: Next.js's `Metadata` type accepts these fields under `openGraph` when `type: 'article'`.)

### 4.7 — Bilingual SEO

- Each locale has its OWN title, description, keywords — never auto-translated.
- `hreflang` alternates emitted by `buildMetadata` ✓ (already wired in `seo.md`).
- `og:locale` matches the page's locale.
- For each locale, run keyword research separately.

## Part 5 — Article authoring workflow

When user asks "<localized text>" / "add article about X":

1. **Confirm scope**:
   - Locale(s)? VI only / VI + EN
   - Length target? Standard (800-1200) / Pillar (1500+)
   - Has author + bio? If no, default to company name as `Organization` author
   - Primary keyword? (Required — drives title, h1, first paragraph, alt text)

2. **Outline first**:
   - H1
   - Lead paragraph (≤80 words, answers the search intent in 1-2 sentences)
   - 3-7 H2 sections with secondary keywords
   - Conclusion with CTA

3. **Write the body**:
   - Each H2 section: 150-300 words
   - Each paragraph: 2-4 sentences
   - Insert 1-2 images with descriptive alts
   - Insert 3-5 internal links

4. **Render**:
   - Either inline JSX in a `[locale]/<route>/page.tsx` (for evergreen pages)
   - OR MDX file under `src/content/<locale>/articles/<slug>.mdx` (for blog/news — uses MDX with `rehype-slug` + `rehype-autolink-headings`)

5. **Wire metadata + schema**:
   - `generateMetadata` with `type: 'article'` and per-locale title/description
   - Article JSON-LD in the page
   - Add to sitemap (or extend dynamic sitemap to fetch article slugs)

6. **Verify**:
   - Run `npm run check:i18n` — locale parity
   - Run `npm run check:content` — minimum word count
   - Run Lighthouse SEO audit — target ≥ 95
   - Validate JSON-LD at [Google Rich Results Test](https://search.google.com/test/rich-results)

## Rules

### MUST DO
- Strict VI/EN parity for `messages/*.json` and `content/<locale>/*.ts` — checked by `npm run check:i18n`
- Min word count per page type — checked by `npm run check:content`
- Exactly 1 `<h1>` per page; never skip heading levels
- `<title>` 50-60 chars; `<meta description>` 150-160 chars
- Active voice; sentence length avg 15-20 words
- ≥ 3 internal links per long-form page
- Descriptive `alt` text (content, not filename) on every meaningful image
- Article pages emit `Article` JSON-LD with author + dates
- Per-locale keyword research (no translated keywords)
- Tailwind Typography `prose` + `max-w-prose` for all long-form content
- Auto TOC for articles ≥ 4 H2 sections
- Wire `check:i18n` and `check:content` into `prebuild`

### MUST NOT
- Ship machine-translated EN (Google Translate / DeepL raw) — review with a fluent speaker first; if not possible, ship VI only with EN structure ready
- Use heading tags for visual styling (`<h3 class="text-sm">` for a label — wrong)
- Multiple `<h1>` on one page (CMS anti-pattern, Next.js doesn't enforce)
- Generic alt text ("image", "photo", "logo.png")
- Repeated title/description across many pages
- Lorem ipsum or placeholder copy in production
- Anchor text "click here", "learn more" without context — use the target keyword
- Below-minimum word count on About / Service / Product detail pages — Google's thin-content threshold
- Mix UI strings into content files (separation is from `i18n.md`)

## Anti-patterns

- **400-word About page filled with "We are committed to excellence"** — meaningless. Replace with: founding year, team size, specific milestones, 3-5 named clients with permission, certifications.
- **Same description repeated across product pages** — Google deduplicates and ranks one, drops the rest. Each product page needs its own description.
- **Article published, never updated** — set `dateModified` whenever the content changes substantively; Google weights freshness.
- **TOC with 2 items** — useless overhead; only render TOC if ≥ 4 H2 sections.
- **Diacritics broken in alt text or meta description** — symptoms of file encoding issues (UTF-16 BOM, CP1252 mis-decode). Confirm files are UTF-8.
- **No author byline on articles** — E-E-A-T (Experience, Expertise, Authoritativeness, Trust) suffers; even "<localized text>" is better than nothing.
- **EN copy that translates Vietnamese idioms literally** — "<localized text>" becomes "place customer at center" instead of "customer-first".
- **Forcing 1500 words on a 600-word topic** — Google penalizes padding too. Right-size the content to the question.

## Verification (hooks into `sdcorejs-ship (verify-before-done mode)`)

Add these as acceptance criteria for any landing-site spec:

| Criterion | Check |
|---|---|
| Bilingual parity | `npm run check:i18n` exits 0 |
| Minimum content length | `npm run check:content` exits 0 |
| Lighthouse SEO ≥ 95 | `npx lighthouse <url> --only-categories=seo` |
| JSON-LD valid | Manual: paste page source into Google Rich Results Test, 0 errors |
| Heading hierarchy | `npx pa11y <url>` (axe rules include heading-order) |
| No machine translation flagged | Manual: native speaker reviewed VI + EN |

## Cross-references
- Tailwind Typography plugin install: this skill (Part 3)
- Article JSON-LD builder: extends `seo.md`'s `structured-data.ts`
- Per-locale strings: `i18n.md` + `pages-and-blocks.md`
- Heading hierarchy reviewed by: `sdcorejs-review` (accessibility section)
- Min word count enforced by: `sdcorejs-ship (verify-before-done mode)`
- Image alt rules: `responsive.md` (presence) + this skill (quality)
- Reading-experience width: `responsive.md` uses `max-w-prose` from this skill
