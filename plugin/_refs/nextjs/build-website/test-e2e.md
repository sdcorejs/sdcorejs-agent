# Testing Knowledge — E2E (Next.js, build-website)

> Stack+level patterns loaded on demand by `sdcorejs-test` when the project is a
> Next.js site (`next.config.*` + `next` dep) and the level is e2e, AFTER the
> cross-track principles in `_refs/shared/testing-philosophy.md`. Not a
> dispatchable skill — no frontmatter. The orchestrator owns dispatch + run/report.

## Purpose
Cover the happy path of every user-visible page in a Next.js landing site with Playwright. SSR is the default for landing sites — tests must assert on what the server renders, not just what hydrates client-side. Locale-prefixed routing means every test runs against `/vi/...` (default) and a subset against `/en/...`.

Principles (test pyramid, what to mock, AAA) come from `_refs/shared/testing-philosophy.md`. This ref is the HOW for Next.js.

Prerequisites:
- Site builds (`npm run build`)
- Dev server runs on port 3000 OR a staging URL is provided
- Playwright installed (added to a fresh project on first invocation)

## What ships

| File | Purpose |
|---|---|
| `playwright.config.ts` | Project config — browsers, baseURL, retries, reporter |
| `e2e/fixtures.ts` | Shared fixtures (`pageWithLocale`, `consentedPage` for cookie banners) |
| `e2e/home.spec.ts` | Home page smoke per locale |
| `e2e/contact.spec.ts` | Contact form happy path + validation + rate limit |
| `e2e/seo.spec.ts` | sitemap.xml, robots.txt, JSON-LD, metadata |
| `e2e/i18n.spec.ts` | Locale switcher, URL pathnames per locale |
| `e2e/og.spec.ts` | OG image rendering (head meta) for each route |

## Workflow

### Step 1 — Install Playwright

```bash
npm install -D @playwright/test
npx playwright install chromium  # firefox + webkit if multi-browser is in scope
```

Add `e2e/` to `tsconfig.exclude` to avoid type clashes with app code.

### Step 2 — `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
  },

  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile',  use: { ...devices['Pixel 7'] } },
  ],

  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Why `npm run start` (not `dev`): production build catches SSR/hydration mismatches that dev mode papers over with eager re-render.

### Step 3 — Smoke per page (`e2e/home.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

const locales = ['vi', 'en'] as const;

for (const locale of locales) {
  test.describe(`home page — ${locale}`, () => {
    test('renders hero + nav + footer on SSR', async ({ page, request }) => {
      // Arrange — SSR check via raw HTML before hydration
      const res = await request.get(`/${locale}`);
      const html = await res.text();
      expect(res.status()).toBe(200);

      // Assert: server-rendered content present (not blank shell)
      const heroText = locale === 'vi' ? 'Đối tác tin cậy' : 'Trusted partner';
      expect(html).toContain(heroText);
      expect(html).toContain('<nav');
      expect(html).toContain('<footer');

      // Act — full page load (hydration)
      await page.goto(`/${locale}`);

      // Assert: client-side navigation works
      await expect(page).toHaveTitle(/.+/);
      await expect(page.locator('h1')).toBeVisible();
    });

    test('locale switcher changes URL prefix', async ({ page }) => {
      await page.goto(`/${locale}`);
      const other = locale === 'vi' ? 'en' : 'vi';
      await page.click(`button[aria-label*="${other.toUpperCase()}"]`);
      await expect(page).toHaveURL(new RegExp(`^.+/${other}(/|$)`));
    });
  });
}
```

The first test deliberately splits Arrange (raw HTTP, prove SSR) and Act (`page.goto`, prove hydration) — this catches the "works in dev, blank in prod" SSR/hydration bug.

### Step 4 — Form happy path (`e2e/contact.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('contact form', () => {
  test('submits successfully and shows confirmation', async ({ page }) => {
    await page.goto('/vi/lien-he');

    await page.fill('input[name="name"]', 'Nguyễn Văn A');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '0901234567');
    await page.fill('textarea[name="message"]', 'Cần báo giá xi măng PCB30, số lượng 5 tấn.');

    // Intercept the API call to avoid real email send in CI
    const submitPromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/contact') && resp.status() === 200,
    );
    await page.click('button[type="submit"]');
    await submitPromise;

    // Assert: success UI shown
    await expect(page.locator('[role="status"]').filter({ hasText: /thành công|success/i }))
      .toBeVisible({ timeout: 5000 });
  });

  test('shows error when email invalid', async ({ page }) => {
    await page.goto('/vi/lien-he');
    await page.fill('input[name="email"]', 'not-an-email');
    await page.fill('input[name="name"]', 'X');
    await page.click('button[type="submit"]');
    await expect(page.locator('[aria-invalid="true"][name="email"]')).toBeVisible();
  });

  test('rate limit: 6th submission within 15 min is blocked', async ({ page, request }) => {
    // Send 5 successful via API (avoid UI overhead)
    for (let i = 0; i < 5; i++) {
      await request.post('/api/contact', {
        data: { name: 'X', email: 'a@b.com', phone: '0900000000', message: 'Test ' + i },
      });
    }
    const blocked = await request.post('/api/contact', {
      data: { name: 'X', email: 'a@b.com', phone: '0900000000', message: 'Test 6' },
    });
    expect(blocked.status()).toBe(429);
  });
});
```

### Step 5 — SEO assertions (`e2e/seo.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test('sitemap.xml lists all routes × locales', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  expect(xml).toContain('<urlset');
  // Spot-check key URLs
  for (const u of ['/vi', '/en', '/vi/san-pham', '/en/products', '/vi/lien-he', '/en/contact']) {
    expect(xml).toContain(u);
  }
});

test('robots.txt allows / and points to sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  const txt = await res.text();
  expect(txt).toMatch(/Sitemap:.*\/sitemap\.xml/);
  expect(txt).toMatch(/Allow:\s*\//);
  expect(txt).toMatch(/Disallow:\s*\/api\//);
});

test('home page emits Organization JSON-LD', async ({ page }) => {
  await page.goto('/vi');
  const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
  const data = JSON.parse(jsonLd!);
  expect(Array.isArray(data) ? data[0] : data).toMatchObject({
    '@type': 'Organization',
    name: expect.any(String),
  });
});

test('each page has unique title + description', async ({ page }) => {
  const titles = new Set<string>();
  for (const path of ['/vi', '/vi/san-pham', '/vi/lien-he', '/vi/ve-chung-toi']) {
    await page.goto(path);
    const title = await page.title();
    expect(title.length).toBeGreaterThanOrEqual(30);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(titles.has(title)).toBe(false);
    titles.add(title);
  }
});
```

### Step 6 — OG image rendering (`e2e/og.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('OG previews', () => {
  test('home OG meta tags use absolute URLs', async ({ page }) => {
    await page.goto('/vi');
    const ogImage = await page.locator('meta[property="og:image"]').first().getAttribute('content');
    expect(ogImage).toMatch(/^https?:\/\//);

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();

    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    expect(['website', 'article']).toContain(ogType);
  });

  test('OG image URL returns a real image', async ({ request, page }) => {
    await page.goto('/vi');
    const ogImage = await page.locator('meta[property="og:image"]').first().getAttribute('content');
    const res = await request.get(ogImage!);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/^image\//);
  });
});
```

### Step 7 — Run + report

```bash
# Local
npx playwright test
npx playwright show-report   # if any failed

# CI
CI=1 E2E_BASE_URL=https://staging.example.vn npx playwright test --reporter=github
```

Target: full e2e suite < 5 min on a typical landing site.

## Rules

### MUST DO
- Inherit principles from `_refs/shared/testing-philosophy.md` (AAA, test names, what to mock)
- Use `npm run build && npm run start` for production-like behavior in `webServer`
- Test EACH locale on smoke tests (loop the `locales` array)
- Intercept the email-sending API in CI (don't send real email)
- Use raw `request.get(...)` for SSR HTML assertions BEFORE `page.goto` (catches hydration issues)
- Assert on `meta` tags, `<title>`, `script[type="application/ld+json"]` for SEO acceptance criteria
- Cap suite < 5 min — split into multiple workers if needed

### MUST NOT
- Use `page.waitForTimeout(...)` — use proper `waitForResponse` / `waitForSelector`
- Hit production endpoints from CI tests (real emails, real DB writes)
- Test in `dev` mode only — hides SSR bugs
- Skip the rate-limit test on contact form (it's the gating security check)
- Hardcode VI/EN labels in test strings without locale context — use `locale === 'vi' ? 'Đối tác' : 'Partner'`

## Anti-patterns

- **One giant spec testing all pages** — when it fails you don't know which page broke; split per page
- **`expect(true).toBe(true)` placeholder tests** — empty suite gives false safety; remove or implement
- **No retry, then complaining about flakiness** — retries are for transient infra issues, not real bugs; configure 2 retries in CI
- **Snapshot test on rendered HTML** — too brittle; assert on semantic content instead
- **Testing through dev server only** — production SSR + hydration is different; always test against `start`
- **Mocking `next-intl` instead of letting it run** — defeats the i18n test; let it use real messages

## Cross-references
- Cross-track principles: `_refs/shared/testing-philosophy.md`
- E2E for other stacks: `_refs/angular/test-e2e.md`, `_refs/nestjs/test-e2e.md`
- Verification gate: `orchestration/verify-before-done` (e2e is one of the criteria types)
- Stack build skills: `nextjs-write-code` (orchestrator that hands off here via `sdcorejs-test`)
