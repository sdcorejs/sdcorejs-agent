# Content Quality — Reference Blocks

Extracted from the `content-quality` write-code pack (`_refs/nextjs/build-website/write-code/content-quality.md`) to keep that pack under the 500-line ideal. Load this file when generating the parity/length scripts or the article presentation components. Paths are repo-root-relative.

## `scripts/check-i18n-parity.ts` (bilingual parity)

Fails the build if VI/EN structures diverge. Wire into `prebuild`.

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
  console.log('<localized text>');
  process.exit(0);
}

console.error(`<localized text>`);
for (const i of issues) {
  console.error(`  [${i.file}] missing in ${i.missingIn}: ${i.key}`);
}
process.exit(1);
```

`package.json` wiring:
```json
{
  "scripts": {
    "check:i18n": "tsx scripts/check-i18n-parity.ts",
    "check:content": "tsx scripts/check-content-length.ts",
    "prebuild": "npm run check:i18n && npm run check:content"
  }
}
```

## `scripts/check-content-length.ts` (minimum word count)

Counts words in each `content/<locale>/*.ts` file's string fields; fails if below threshold. Unset files are skipped.

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
      console.error(`<localized text>`);
      failed++;
    } else {
      console.log(`<localized text>`);
    }
  }
}

if (failed > 0) {
  console.error(`\n${failed} file(s) below minimum word count.`);
  process.exit(1);
}
```

> **MDX caveat:** `extractStringLiterals` only sees `.ts` content files. Article bodies authored as `.mdx` are NOT word-counted by this script — count those at the per-slug level (e.g. a separate MDX frontmatter `wordCount` assertion, or extend the script to read `src/content/<locale>/articles/*.mdx` raw text).

## Presentation components

### `src/components/ui/prose.tsx`

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

`max-w-prose` is Tailwind's built-in ≈65ch — the optimal reading line-length.

### `src/components/ui/toc.tsx` (auto Table of Contents)

Render for articles ≥ 4 `<h2>` blocks. Extract TOC items server-side; for MDX use `rehype-slug` + `rehype-autolink-headings` + a custom extraction step.

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

### `src/components/sections/article-body.tsx`

```typescript
import { Prose } from '@/components/ui/prose';
import { TableOfContents } from '@/components/ui/toc';

interface ArticleBodyProps {
  title: string;
  lead: string;
  body: React.ReactNode;     // pre-rendered MDX or React tree with proper h2/h3 hierarchy
  toc?: { id: string; text: string; level: 2 | 3 }[];
  tocTitle: string;          // localized "<localized text>" / "Contents"
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
              {author && <span>{author.name}{author.role && `<localized text>`}</span>}
              {publishedAt && (
                <time dateTime={publishedAt.toISOString()}>
                  {publishedAt.toLocaleDateString()}
                </time>
              )}
              {updatedAt && updatedAt.getTime() !== publishedAt?.getTime() && (
                <span>Updated {updatedAt.toLocaleDateString()}</span>
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

## `articleJsonLd` builder (extends `src/lib/structured-data.ts`)

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
    inLanguage: input.locale === 'en'<localized text>'en-US' : 'vi-VN',
  };
}
```

Render next to the existing `Organization` schema (the JSON-LD `<script>` can include an array of multiple schemas).
