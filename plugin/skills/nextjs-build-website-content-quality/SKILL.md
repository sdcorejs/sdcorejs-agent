---
name: nextjs-build-website-content-quality
description: Use to enforce content quality, strict bilingual parity, long-form authoring rules, on-page SEO, and reading-experience presentation across a Next.js landing site. Covers — minimum word counts per page type, sentence/paragraph clarity rules, heading hierarchy, Tailwind Typography (`prose`) styling, Table of Contents for long articles, Article JSON-LD with author/dates, bilingual parity check script, translation-quality rules (no machine translation), keyword research per locale, internal linking density, image alt-text quality. Triggers - "review content", "rà soát nội dung", "bài viết quá ngắn", "câu chữ chưa rõ", "set up content rules", "thin content warning", or automatic step of `07-write-code` after pages exist. Bilingual (VI/EN).
allowed-tools: Read, Write, Edit, Bash
---

# Build Website — Content Quality & On-Page SEO

## Purpose
Technical SEO (`13-seo`) + i18n plumbing (`15-i18n`) get you a site Google can crawl. **This skill is what makes Google actually rank you and humans actually read past the hero**: long-enough copy, clear sentences, scannable structure, strict bilingual parity, and on-page SEO best practices that the search algorithm rewards.

A landing site that ships with 50-word "Lorem ipsum about us" sections + auto-translated EN copy will:
1. Lose to competitors with 400-word, expert-written sections (thin-content penalty)
2. Lose EN traffic to anyone with native-quality copy (Google detects machine translation)
3. Look unprofessional to the human reader who actually scrolls past the hero

This skill enforces the floor: minimum lengths, prose discipline, parity check, on-page SEO.

## When invoked
- Automatic step in `07-write-code` after `12-pages-and-blocks` + `13-seo` (so we have pages and metadata to audit)
- User says "rà soát nội dung", "bài viết quá ngắn", "câu chữ chưa rõ", "review content quality"
- After adding new pages or articles — before launch
- Anytime `50-review-code` flags "Critical: thin content"

## Prerequisites
- Pages exist (`12-pages-and-blocks` done)
- Metadata factory exists (`13-seo` done)
- i18n wired (`15-i18n` done) — even for "VI only" sites, the structure must be bilingual-ready

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
- Literal word order ("Chúng tôi cung cấp chất lượng cao" → "We provide high quality" — grammatical but stilted)
- Wrong idioms ("dịch vụ chu đáo" → "thoughtful service" instead of "attentive service")
- Articles + plurals wrong (VI has no articles; auto-translate drops or doubles "a/the/an")
- Tense inconsistency

Rule: **EN copy must be reviewed by someone fluent in English**. If the user lacks an EN speaker, ship VI-only with EN structure ready (empty strings) rather than ship machine-translated EN.

For VI: same rule applies to EN→VI. Vietnamese has tones and diacritics that auto-translate often mangles in idiomatic phrases.

### Rule 1.3 — Keyword research per locale

VI "vật liệu xây dựng" and EN "construction materials" are not the same search query. They have different volumes, different competition, and different intent (B2B vs B2C splits differ by market). For each locale:
1. List 5-10 keywords with real search volume in THAT language (use Google Trends, Keyword Planner)
2. Use them in title, h1, first paragraph, image alt — for THAT locale
3. Don't translate keywords — research them

### Parity check script

`scripts/check-i18n-parity.ts`:

```typescript
#!/usr/bin/env tsx
/**
 * Bilingual parity check. Fails build if VI/EN structures diverge.
 * Run: npm run check:i18n
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const MESSAGES_DIR = join(ROOT, 'src/i18n/messages');
const CONTENT_DIR = join(ROOT, 'src/content');

type Issue = { file: string; missingIn: string; key: string };

function collectKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return [prefix];
  }
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    collectKeys(v, prefix ? `${prefix}.${k}` : k),
  );
}

function compareJson(viPath: string, enPath: string): Issue[] {
  const vi = JSON.parse(readFileSync(viPath, 'utf8'));
  const en = JSON.parse(readFileSync(enPath, 'utf8'));
  const viKeys = new Set(collectKeys(vi));
  const enKeys = new Set(collectKeys(en));
  const issues: Issue[] = [];
  for (const k of viKeys) if (!enKeys.has(k)) issues.push({ file: 'messages', missingIn: 'en', key: k });
  for (const k of enKeys) if (!viKeys.has(k)) issues.push({ file: 'messages', missingIn: 'vi', key: k });
  return issues;
}

// Compare top-level exports of content/<locale>/*.ts is harder without TS AST.
// Lightweight approach: compare the set of filenames in each locale dir.
function compareContentFiles(): Issue[] {
  const viDir = join(CONTENT_DIR, 'vi');
  const enDir = join(CONTENT_DIR, 'en');
  const viFiles = new Set(readdirSync(viDir).filter((f) => f.endsWith('.ts')));
  const enFiles = new Set(readdirSync(enDir).filter((f) => f.endsWith('.ts')));
  const issues: Issue[] = [];
  for (const f of viFiles) if (!enFiles.has(f)) issues.push({ file: 'content', missingIn: 'en', key: f });
  for (const f of enFiles) if (!viFiles.has(f)) issues.push({ file: 'content', missingIn: 'vi', key: f });
  return issues;
}

const issues = [
  ...compareJson(join(MESSAGES_DIR, 'vi.json'), join(MESSAGES_DIR, 'en.json')),
  ...compareContentFiles(),
];

if (issues.length === 0) {
  console.log('✓ Bilingual parity check passed.');
  process.exit(0);
}

console.error(`✗ ${issues.length} parity issue(s) found:\n`);
for (const i of issues) {
  console.error(`  [${i.file}] missing in ${i.missingIn}: ${i.key}`);
}
process.exit(1);
```

Wire into `package.json`:
```json
{
  "scripts": {
    "check:i18n": "tsx scripts/check-i18n-parity.ts",
    "check:content": "tsx scripts/check-content-length.ts",
    "prebuild": "npm run check:i18n && npm run check:content"
  }
}
```

Now `npm run build` fails fast if VI/EN drifted. `orchestration/verify-before-done` runs `npm run build` so this is enforced automatically.

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

Below the floor → `50-review-code` flags as **Critical: thin content**.

### Rule 2.2 — Sentence and paragraph discipline

- **Sentence length**: average 15-20 words; max 30. Long sentences break readability and translation accuracy.
- **Paragraph length**: 2-4 sentences (40-80 words). Mobile-first — long paragraphs become walls of text on phone.
- **Active voice over passive**: "Chúng tôi giao hàng trong 24 giờ" not "Hàng được giao trong 24 giờ". "We deliver in 24 hours" not "Delivery is provided within 24 hours".
- **Concrete over abstract**: "1000 m² kho hàng tại Bình Dương" not "kho hàng rộng rãi". Numbers and place names beat adjectives.
- **No filler**: cắt "trong việc / để có thể / nhằm mục đích" — tốn từ, không tăng nghĩa.

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
H2: Kết luận / Call to action
  → Internal link to product/contact page
```

Rules:
- **Exactly one `<h1>`** per page — same as the metadata title (or close to it).
- **3-7 `<h2>` sections** for a typical 800-1500 word article.
- **`<h3>` only inside `<h2>` blocks** — never skip levels (no `<h2>` followed by `<h4>`).
- **First paragraph contains the primary keyword** — Google weights early text more.
- **Last paragraph has the CTA** — never end with "and that's it!"; always guide the reader to the next step.

### Length check script

`scripts/check-content-length.ts` — counts words in each `content/<locale>/*.ts` file's exported string fields, fails if below threshold:

```typescript
#!/usr/bin/env tsx
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT_DIR = join(process.cwd(), 'src/content');

// Per-file minimum word count (sum of all string values).
// Adjust to match the page each file feeds.
const MIN_WORDS: Record<string, number> = {
  'home.ts': 400,
  'about.ts': 400,
  'products.ts': 600,
  'services.ts': 600,
  'contact.ts': 150,
  // Articles handled separately (per-slug)
};

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function extractStringLiterals(source: string): string[] {
  // Lightweight: grep for "..." / `...` literals. Good enough for plain content files.
  // For ICU/MDX, parse with TS compiler API.
  const out: string[] = [];
  for (const m of source.matchAll(/(['"`])([^'"`\n]{8,})\1/g)) {
    out.push(m[2]);
  }
  return out;
}

let failed = 0;
for (const locale of ['vi', 'en']) {
  const dir = join(CONTENT_DIR, locale);
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
    const min = MIN_WORDS[file];
    if (!min) continue;
    const literals = extractStringLiterals(readFileSync(join(dir, file), 'utf8'));
    const total = literals.reduce((sum, lit) => sum + countWords(lit), 0);
    if (total < min) {
      console.error(`✗ ${locale}/${file}: ${total} words (min ${min}) — THIN CONTENT`);
      failed++;
    } else {
      console.log(`✓ ${locale}/${file}: ${total} words`);
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} file(s) below minimum word count.`);
  process.exit(1);
}
```

For pages with truly little content (`contact.ts` at 150 words is fine), set `MIN_WORDS` accordingly. For unset files, the check is skipped.

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

### Step 3.3 — `Prose` wrapper component

`src/components/ui/prose.tsx`:
```typescript
import { cn } from '@/lib/utils';

interface ProseProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'base' | 'lg';
}

export function Prose({ children, className, size = 'base' }: ProseProps) {
  const sizeClass = { sm: 'prose-sm', base: 'prose-base', lg: 'prose-lg' }[size];
  return (
    <div className={cn('prose prose-neutral max-w-prose mx-auto', sizeClass, className)}>
      {children}
    </div>
  );
}
```

`max-w-prose` is Tailwind's built-in ≈65ch — the optimal reading line-length. Wider lines lose the reader's eye between rows.

### Step 3.4 — Auto Table of Contents

For articles ≥ 800 words / ≥ 4 `<h2>` blocks, render a sticky TOC on desktop. `src/components/ui/toc.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

export function TableOfContents({ items, title }: { items: TocItem[]; title: string }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: '-30% 0% -60% 0%' },
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={title} className="sticky top-24 hidden lg:block text-sm">
      <p className="font-semibold mb-3">{title}</p>
      <ul className="space-y-2 border-l border-neutral-200">
        {items.map((item) => (
          <li
            key={item.id}
            className={cn(
              'border-l-2 -ml-px pl-3 transition-colors',
              item.level === 3 && 'ml-3',
              active === item.id
                ? 'border-brand text-brand font-medium'
                : 'border-transparent text-neutral-600 hover:text-neutral-900',
            )}
          >
            <a href={`#${item.id}`}>{item.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

Extract TOC items at build time by walking the rendered article (server side); for MDX, use `rehype-slug` + `rehype-autolink-headings` + a custom extraction step.

### Step 3.5 — Article body section

`src/components/sections/article-body.tsx`:
```typescript
import { Prose } from '@/components/ui/prose';
import { TableOfContents } from '@/components/ui/toc';

interface ArticleBodyProps {
  title: string;
  lead: string;
  body: React.ReactNode;     // pre-rendered MDX or React tree with proper h2/h3 hierarchy
  toc?: { id: string; text: string; level: 2 | 3 }[];
  tocTitle: string;          // localized "Nội dung" / "Contents"
  author?: { name: string; role?: string; avatar?: string };
  publishedAt?: Date;
  updatedAt?: Date;
}

export function ArticleBody({
  title, lead, body, toc, tocTitle, author, publishedAt, updatedAt,
}: ArticleBodyProps) {
  return (
    <article className="container max-w-container mx-auto px-4 py-section">
      <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
        <div>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          {(author || publishedAt) && (
            <div className="flex items-center gap-3 text-sm text-neutral-500 mb-8">
              {author && <span>{author.name}{author.role && ` · ${author.role}`}</span>}
              {publishedAt && (
                <time dateTime={publishedAt.toISOString()}>
                  {publishedAt.toLocaleDateString()}
                </time>
              )}
              {updatedAt && updatedAt.getTime() !== publishedAt?.getTime() && (
                <span>· Cập nhật {updatedAt.toLocaleDateString()}</span>
              )}
            </div>
          )}
          <Prose>
            <p className="lead">{lead}</p>
            {body}
          </Prose>
        </div>
        {toc && toc.length >= 4 && <TableOfContents items={toc} title={tocTitle} />}
      </div>
    </article>
  );
}
```

## Part 4 — On-page SEO checklist

Every page must satisfy this checklist before launch. `orchestration/verify-before-done` includes it as acceptance criterion.

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

`alt` is mandatory (`12-pages-and-blocks` enforces) but presence ≠ quality. Rules:
- Describe the image's CONTENT, not its filename ("Kho vật liệu xây dựng tại Bình Dương" not "warehouse.jpg")
- Include keyword where it's truthful — don't stuff
- Decorative images get empty `alt=""` (already covered in `17-responsive`)
- Hero images get the page's primary keyword in alt

### 4.5 — Article schema (JSON-LD)

For every blog post / news article / detailed product page, emit `Article` JSON-LD via the builder. Add to `src/lib/structured-data.ts`:

```typescript
export function articleJsonLd(input: {
  title: string;
  description: string;
  image: string;
  datePublished: Date;
  dateModified?: Date;
  authorName: string;
  authorUrl?: string;
  url: string;
  locale: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    image: input.image,
    datePublished: input.datePublished.toISOString(),
    dateModified: (input.dateModified ?? input.datePublished).toISOString(),
    author: {
      '@type': 'Person',
      name: input.authorName,
      ...(input.authorUrl && { url: input.authorUrl }),
    },
    publisher: {
      '@type': 'Organization',
      name: company.name,
      logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png') },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    inLanguage: input.locale === 'en' ? 'en-US' : 'vi-VN',
  };
}
```

Render the article schema in the article page next to the existing `Organization` schema (the JSON-LD `<script>` can include an array of multiple schemas).

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
    section: category,        // e.g. "Tin tức ngành"
    tags: keywords,
  },
}
```

(Note: Next.js's `Metadata` type accepts these fields under `openGraph` when `type: 'article'`.)

### 4.7 — Bilingual SEO

- Each locale has its OWN title, description, keywords — never auto-translated.
- `hreflang` alternates emitted by `buildMetadata` ✓ (already wired in `13-seo`).
- `og:locale` matches the page's locale.
- For each locale, run keyword research separately.

## Part 5 — Article authoring workflow

When user asks "viết bài về X" / "add article about X":

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
- Mix UI strings into content files (separation is from `15-i18n`)

## Anti-patterns

- **400-word About page filled with "We are committed to excellence"** — meaningless. Replace with: founding year, team size, specific milestones, 3-5 named clients with permission, certifications.
- **Same description repeated across product pages** — Google deduplicates and ranks one, drops the rest. Each product page needs its own description.
- **Article published, never updated** — set `dateModified` whenever the content changes substantively; Google weights freshness.
- **TOC with 2 items** — useless overhead; only render TOC if ≥ 4 H2 sections.
- **Diacritics broken in alt text or meta description** — symptoms of file encoding issues (UTF-16 BOM, CP1252 mis-decode). Confirm files are UTF-8.
- **No author byline on articles** — E-E-A-T (Experience, Expertise, Authoritativeness, Trust) suffers; even "Đội ngũ Biên tập" is better than nothing.
- **EN copy that translates Vietnamese idioms literally** — "đặt khách hàng làm trung tâm" becomes "place customer at center" instead of "customer-first".
- **Forcing 1500 words on a 600-word topic** — Google penalizes padding too. Right-size the content to the question.

## Verification (hooks into `orchestration/verify-before-done`)

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
- Article JSON-LD builder: extends `13-seo`'s `structured-data.ts`
- Per-locale strings: `15-i18n` + `12-pages-and-blocks`
- Heading hierarchy reviewed by: `50-review-code` (accessibility section)
- Min word count enforced by: `orchestration/verify-before-done`
- Image alt rules: `17-responsive` (presence) + this skill (quality)
- Reading-experience width: `17-responsive` uses `max-w-prose` from this skill

<!-- response-style: auto-injected by sync-skills.sh; do not edit mirror by hand -->

**Response style (terse mode active for this skill — reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal — no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
