# Review-Accessibility Knowledge — Cross-Track Baseline

> Cross-track WCAG 2.1 AA checklist + tooling loaded on demand by the
> `sdcorejs-review` skill for every audit, before the stack-specific
> probes in `_refs/<track>/review-accessibility.md`. Not a dispatchable skill —
> has no frontmatter. The **output format** (color-coded report) is owned by the
> parent skill; this file only supplies *what to check*.

## Why
WCAG 2.1 AA is the legal floor in most jurisdictions (Vietnam's MIC Circular
18/2014, EU EN 301 549, US Section 508). A11y issues are ~80% structural
(semantic HTML, focus order, labels) and ~20% visual (contrast, motion).
Automation catches ~30% — the rest is keyboard + screen reader testing by a human.

## Principles — POUR

WCAG organises everything under four principles. Every finding should cite which
POUR principle it violates — helps the user prioritise.

| Principle | Means | Example failure |
|---|---|---|
| **P**erceivable | Content can be seen / heard | Image without alt; video without captions |
| **O**perable | All functionality via keyboard or assistive tech | Modal that traps focus; menu only opens on hover |
| **U**nderstandable | Predictable + readable + error-correctable | Form submits with no error feedback; placeholder used instead of label |
| **R**obust | Works with current and future user agents | Custom widget without ARIA roles; non-standard form controls |

## The 12 checks that catch 80% of issues

### 1. Every `<img>` has `alt` (P) — WCAG SC 1.1.1 Non-text Content
- Meaningful image → describe content
- Decorative image → `alt=""` (NOT missing)
- Logo → `alt="Brand Name"` (NOT `alt="logo"`)

Probe: `grep -rE '<img(?!.*\balt=)' src/`

### 2. Form fields have associated labels (P, U) — WCAG SC 1.3.1, 3.3.2
- `<label htmlFor="email">Email</label> <input id="email" />` — explicit
- `<label>Email <input /></label>` — wrapped
- NOT `<input placeholder="Email" />` — placeholder is a hint, not a label

Probe: pa11y-ci, axe-core rule `label`

### 3. Page has one `<h1>` and heading hierarchy is sequential (P, U) — WCAG SC 1.3.1, 2.4.6
- Exactly 1 `<h1>` per page
- Don't skip levels (`<h2>` → `<h4>` is wrong)
- Headings reflect outline, not visual sizing

Probe: axe rule `heading-order`, `page-has-heading-one`

### 4. Color contrast ≥ 4.5:1 for text, 3:1 for large text and UI components (P) — WCAG SC 1.4.3, 1.4.11
- Body text on white background: at least #767676 dark (4.5:1)
- Large text (≥ 24 px or 18.5 px bold): 3:1 minimum
- Icons + form borders: 3:1 against adjacent colors

Probe: axe rule `color-contrast`, manual check with browser DevTools

### 5. All interactive elements reachable via Tab (O) — WCAG SC 2.1.1, 2.4.7
- Every button, link, input, custom widget gets focus
- Focus indicator visible (don't `outline: none` without replacement)
- Tab order matches visual order (don't `tabindex="999"` to reorder)

Probe: manual — press Tab repeatedly from page top, observe focus

### 6. Touch / click target ≥ 44×44 px (O) — WCAG SC 2.5.5
- Buttons, icons, links — min 44px square on mobile
- Adjacent targets have ≥ 8px gap

Probe: visual inspection on mobile preset

### 7. No keyboard traps (O) — WCAG SC 2.1.2
- Open modal → Esc closes
- Tab leaves the modal cycle correctly
- Custom widgets don't swallow focus

Probe: manual — open every modal/dialog, try to escape with keyboard only

### 8. Custom controls have ARIA role + state (R) — WCAG SC 4.1.2, 4.1.3
- Dropdown: `role="button" aria-haspopup="listbox" aria-expanded="true|false"`
- Tab list: `role="tablist"` + `role="tab"` + `aria-selected`
- Disclosure: `aria-expanded` toggles
- Live region for dynamic updates: `aria-live="polite"` (or `assertive` for errors)

Probe: axe rule `aria-*` family

### 9. Language is declared (R, U) — WCAG SC 3.1.1 Language of Page
- `<html lang="vi">` or `<html lang="en">` set correctly
- Mixed-language content: inline `<span lang="en">English term</span>`

Probe: HTML inspection; for Next.js i18n, `<html lang={locale}>` in root layout

### 10. Form errors are announced + recoverable (U) — WCAG SC 3.3.1, 3.3.3
- Inline error message linked via `aria-describedby`
- Field marked `aria-invalid="true"` when in error
- Error summary at top of form for screen readers OR focus moves to first error
- Don't rely on color alone (red border + icon + text)

Probe: pa11y, axe rule `form-field-multiple-labels`, manual screen reader test

### 11. No reliance on color alone for meaning (P) — WCAG SC 1.4.1 Use of Color
- Required field has `*` + `aria-required="true"`, not just a red label
- Error state has icon + text, not just a red border
- Charts have patterns + labels, not just color

Probe: manual — view page in grayscale (Chrome DevTools Rendering tab)

### 12. Animations respect `prefers-reduced-motion` (O) — WCAG SC 2.3.3
- Decorative motion respects user preference
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Probe: System Settings → Reduce Motion → reload page → verify

## Automated probe — run all three layers

```bash
# 1. Lighthouse a11y category
npx --yes lighthouse "$URL" --only-categories=accessibility --quiet \
  --chrome-flags="--headless" --output=json --output-path=/tmp/lh-a11y.json
node -e "console.log('Lighthouse a11y:', Math.round(require('/tmp/lh-a11y.json').categories.accessibility.score * 100))"

# 2. pa11y (CLI wrapping axe + HTML CodeSniffer)
npx --yes pa11y --reporter cli --runner axe --runner htmlcs "$URL"

# 3. Standalone axe scan (more rules than Lighthouse's subset)
npx --yes @axe-core/cli "$URL"
```

Target: Lighthouse a11y ≥ 95, axe finding count = 0 Critical, ≤ 3 Serious.

## What automation does NOT catch (manual checklist)

| Concern | How to test |
|---|---|
| Screen reader announces correct content | Test with NVDA (Windows free) or VoiceOver (macOS built-in) on home + 1 form page |
| Tab order makes sense | Tab from top to bottom — does focus move logically? |
| Modal traps focus + Esc closes | Open each modal, attempt to Tab out + Esc out |
| Error messages reach the user | Submit form with bad data; does the error get announced? |
| Heading structure communicates outline | Read just the h1/h2/h3 list — does it summarise the page? |
| Link text makes sense out of context | Screen readers read links in isolation; "click here" is useless |
| Color contrast at all interactive states | Hover + focus + disabled — check each |

## Severity mapping
- 🔴 **Critical** — blocks compliance / blocks users (missing `lang`, keyboard trap, invisible focus, unannounced form errors, `<div onClick>` controls).
- 🟡 **Important** — degrades UX significantly (no `aria-current`, contrast on hover, missing skip-link on long navs, color-only status).
- 🔵 **Minor** — polish / cleanup sprint (relaxed touch-target on desktop-only, locale-aware date formatting).

## References
- WCAG 2.1 Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/
- WAI-ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/
- Inclusive Components by Heydon Pickering — patterns for ~14 common UI widgets

## Escalation
- Critical blocking a legally-required flow → loop in the compliance owner before the fix lands
- A Core UI / framework primitive itself is the defect → report upstream; isolate the workaround
- Pattern needs an actual assistive-tech user to validate → usability testing, not code review
