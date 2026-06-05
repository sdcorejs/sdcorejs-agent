---
name: sdcorejs-review-accessibility-nextjs
description: Use to audit a Next.js landing site for accessibility — runs the cross-track `review/accessibility/baseline.md` 12-check + Next.js-specific concerns (App Router focus management on route changes, `<html lang>` from locale, `next/link` semantics, server-rendered ARIA, locale switcher accessibility). Outputs Critical/Important/Minor findings with WCAG SC references. Triggers - "a11y check nextjs", "accessibility audit Next.js", "keyboard navigation broken", "screen reader test landing site", or invocation pre-launch. Bilingual (VI/EN).
allowed-tools: Read, Bash, Glob, Grep
---

# Review — Accessibility (Next.js)

## Purpose
Run the cross-track a11y baseline (`review/accessibility/baseline.md`) PLUS Next.js-specific checks. Next.js App Router has subtle a11y traps — focus management on navigation, `<html lang>` derivation, locale switcher semantics, that don't apply to other stacks.

## When invoked
- Pre-launch a11y audit
- User says "a11y nextjs", "accessibility audit", "keyboard không vào được"
- After adding a custom widget (modal, menu, tabs)

## Probe layer 1 — Run baseline (cross-track)

```bash
URL="${E2E_BASE_URL:-http://localhost:3000}"

# Lighthouse a11y
npx --yes lighthouse "$URL/vi" --only-categories=accessibility --quiet \
  --chrome-flags="--headless" --output=json --output-path=/tmp/lh-a11y-vi.json
node -e "console.log('VI a11y:', Math.round(require('/tmp/lh-a11y-vi.json').categories.accessibility.score * 100))"

npx --yes lighthouse "$URL/en" --only-categories=accessibility --quiet \
  --chrome-flags="--headless" --output=json --output-path=/tmp/lh-a11y-en.json
node -e "console.log('EN a11y:', Math.round(require('/tmp/lh-a11y-en.json').categories.accessibility.score * 100))"

# pa11y
npx --yes pa11y --reporter cli --runner axe --runner htmlcs "$URL/vi"

# axe-core CLI
npx --yes @axe-core/cli "$URL/vi"
```

Target: Lighthouse ≥ 95 per locale, axe 0 Critical / ≤ 3 Serious.

## Probe layer 2 — Next.js-specific checks

### NJ-1: `<html lang>` matches the request locale

In `src/app/[locale]/layout.tsx`, the root `<html>` tag must use the dynamic `locale` param:

```bash
grep -nE "<html\s+lang=" src/app/[locale]/layout.tsx
# Expect: <html lang={locale}>
# Anti-pattern: <html lang="vi">  (hardcoded, EN locale ships VI lang)
```

Severity: Critical — screen readers use `lang` to pick pronunciation engine.

WCAG SC 3.1.1 Language of Page.

### NJ-2: Locale switcher announces correctly

```bash
# Locale switcher should be a list of links/buttons with aria-current="true" on active locale
grep -nE "aria-current" src/components/layout/locale-switcher.tsx 2>/dev/null
```

Severity: Important — without `aria-current`, screen reader users can't tell which language they're on.

### NJ-3: Skip-link to main content

Landing sites with long navs benefit from a skip-link.

```bash
# Look for skip-link patterns
grep -rnE "skip[\\-_]?to[\\-_]?(content|main)|skipToMain" src/components/layout/
# Or: a hidden-until-focus anchor that jumps to <main>
```

Severity: Minor for sites with ≤ 6 nav items; Important for ≥ 8 nav items.

WCAG SC 2.4.1 Bypass Blocks.

### NJ-4: Focus management on route change

App Router does NOT automatically move focus on `router.push()`. After client-side navigation, focus stays where it was → screen reader users don't know the page changed.

```bash
# Sanity: is there a layout-level focus reset?
grep -rnE "focus\(\)|setFocus|tabIndex.*=.*-1" src/app/[locale]/layout.tsx src/components/layout/
```

For a landing site, this is usually fine because most navigation is full page reload + locale switcher resets focus naturally. But for SPA-like sections (modals, expanding cards), the pattern matters.

Severity: Important if site has custom client-side navigation; Minor otherwise.

WCAG SC 2.4.3 Focus Order.

### NJ-5: Modal / dialog uses proper focus trap

Next.js doesn't ship a dialog primitive. Custom modals need:
- `role="dialog"` + `aria-modal="true"` + `aria-labelledby`
- Focus moves INTO the dialog on open, BACK to trigger on close
- Tab cycles within dialog (focus trap)
- Esc closes

```bash
# Find dialog usage
grep -rnE "role=['\"]dialog['\"]|aria-modal" src/components/
# For each found dialog, manually verify it traps focus
```

Severity: Critical per dialog if focus management missing.

WCAG SC 2.4.3.

### NJ-6: `next/image` `alt` is descriptive (not generic)

```bash
# Suspicious alt values
grep -rnE "alt=['\"]?(image|photo|picture|img|logo)['\"]?\b" src/
# Empty alt is OK for decorative; should have alt="" not no alt at all
```

Severity: Important — alt="image" is worse than alt="" because it announces "image" without saying what it is.

### NJ-7: Form fields with `name` AND `id` matching the `htmlFor` label

```bash
# Pattern: <label htmlFor="X"> ... <input id="X" name="Y" />
# When id and name diverge, autofill / screen readers get confused.
grep -rnE "htmlFor=" src/components/sections/contact*.tsx
```

Severity: Important — every form field has both `id` (label association) and `name` (form submission).

WCAG SC 1.3.1 Info and Relationships, 3.3.2 Labels or Instructions.

### NJ-8: Heading hierarchy across the WHOLE page (not just per-section)

Sections compose a page. A page must have ONE `<h1>` (the hero) and `<h2>` for each section. Section components must use `<h2>`, NOT `<h1>`.

```bash
# Each section component should NOT contain <h1>
grep -rnE "<h1\b" src/components/sections/
# Only the page-level (or hero section as h1) is OK
```

Severity: Critical — multiple `<h1>` per page is a common Next.js mistake when devs copy-paste section components.

WCAG SC 1.3.1 + 2.4.6 Headings and Labels.

### NJ-9: Color contrast on hover + focus states

Tailwind hover states often have insufficient contrast.

```bash
# Look for hover:text-* / hover:bg-* in section components — manually verify with DevTools
grep -rnE "hover:(text|bg)-" src/components/sections/ | head -10
```

Severity: Important — automated tools rarely catch hover state contrast.

WCAG SC 1.4.11 Non-text Contrast.

### NJ-10: Buttons are `<button>`, not `<div onClick>`

```bash
grep -rnE "<div\s+onClick=" src/components/ src/app/
# Every match = anti-pattern
```

Severity: Critical — `<div onClick>` is not focusable, not announceable, not keyboard-operable.

WCAG SC 2.1.1 Keyboard, 4.1.2 Name Role Value.

### NJ-11: Touch targets via `min-h-11 min-w-11` (≥ 44px)

(From `_refs/nextjs/build-website/write-code/responsive.md` — re-check here for review surface.)

```bash
# Anti-pattern: small icon buttons without min-h/min-w
grep -rnE "(size|h)-(3|4|5)\s+.*(w)-(3|4|5)" src/components/
# These are likely touch-target violations on mobile (Tailwind's h-3 = 12px)
```

Severity: Important.

WCAG SC 2.5.5 Target Size (AAA — Level AA = 24px, but 44px is the practical floor).

### NJ-12: Locale-aware date / number formatting

Hardcoded date format breaks for EN users + screen readers in wrong locale.

```bash
grep -rnE "(toLocaleDateString|toLocaleString|toString\(\))\(\)" src/
# Should pass explicit locale: toLocaleDateString(locale)
# Better: use next-intl useFormatter() / getFormatter()
```

Severity: Minor — visual difference only, but EN screen reader announcing "ngày 15 tháng 5" is jarring.

## Manual checklist (cannot automate)

| Test | Procedure | Pass criteria |
|---|---|---|
| Keyboard only | Disconnect mouse. Tab through every page top to bottom. | Reach every interactive element. Focus visible. Tab order matches visual. |
| Screen reader (NVDA / VoiceOver) | Listen to home + contact + 1 article page | Page title announced, headings make outline sense, form errors announced |
| Locale switcher | Switch VI ↔ EN, listen to announcement | Active locale announced, page reloads correctly |
| Modal escape | Open every modal, try Esc | Closes; focus returns to trigger |
| Form errors | Submit each form with bad data | Error announced; focus moves to first error OR error summary read |
| Color blind / grayscale | Chrome DevTools → Rendering → "Emulate vision deficiency: Achromatopsia" | All info still conveyed (icons + text, not color alone) |
| Reduced motion | OS Settings → Reduce Motion. Reload. | Animations disabled or near-instant |
| Zoom 200% | Browser zoom 200%. Test home + contact | No content cut off, no horizontal scroll |

## Output: Accessibility Audit Report

```markdown
# Accessibility Audit (Next.js) — <site> — <date>

## Automated probes
- Lighthouse a11y (VI): <score>/100, (EN): <score>/100
- pa11y findings: <N>
- axe Critical: <X>, Serious: <Y>, Moderate: <Z>

## Next.js-specific findings (NJ-1 through NJ-12)

### Critical
| # | Check | Location | WCAG SC | Fix |
|---|---|---|---|---|

### Important
| # | Check | Location | WCAG SC | Fix |
|---|---|---|---|---|

### Minor
| # | Check | Location | WCAG SC | Fix |
|---|---|---|---|---|

## Manual checklist
- [ ] Keyboard-only: <pass/fail + notes>
- [ ] Screen reader: <pass/fail>
- [ ] Locale switcher announcement: <pass/fail>
- [ ] Modal focus + Esc: <pass/fail>
- [ ] Form error announcement: <pass/fail>
- [ ] Grayscale: <pass/fail>
- [ ] Reduced motion: <pass/fail>
- [ ] Zoom 200%: <pass/fail>

## Recommended next action
- Critical → `orchestration/repair-loop`
- Manual fails → file-by-file fix; usually a single component
```

## Rules

### MUST DO
- Run baseline a11y from `review/accessibility/baseline.md` first; this skill adds Next.js layer
- Run probes on BOTH locales (`/vi` + `/en`) — issues sometimes only appear in one
- Cite WCAG SC for every finding
- Include manual section — automation only catches ~30%
- Test on production build (`npm run start`), not dev — dev injects extra DOM for HMR

### MUST NOT
- Skip the `<html lang>` check — it's the cheapest win, often missed
- Claim ✅ on locale switcher without manually verifying announcement
- Run only Lighthouse — ~30% rule coverage; pa11y + axe add more

## Anti-patterns
- **`tabIndex="0"` on every clickable div** — fix the div, use `<button>`
- **`aria-label="Click here"`** — describe destination/action, not the act
- **Focus indicator removed for "design"** — provide a replacement; never remove without replacement
- **Modal that traps focus but doesn't return on Esc** — incomplete focus management
- **Multiple `<h1>` on a page** because each section uses `<h1>` — only the page hero gets `<h1>`
- **Hardcoded `lang="vi"` on `<html>`** — EN locale ships VI to screen readers

## Cross-references
- Cross-track baseline: `review/accessibility/baseline.md`
- Touch targets: `_refs/nextjs/build-website/write-code/responsive.md`
- Heading + alt rules: `_refs/nextjs/build-website/write-code/content-quality.md`
- Verification: `orchestration/verify-before-done` runs probes as criteria
- Repair loop: `orchestration/repair-loop`
