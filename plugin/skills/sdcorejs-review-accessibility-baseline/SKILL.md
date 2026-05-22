---
name: sdcorejs-review-accessibility-baseline
description: Cross-track accessibility baseline — WCAG 2.1 Level AA principles, the 12 checks that catch 80% of issues, automated probes (axe-core, pa11y, Lighthouse a11y) and the manual checklist for what automation cannot detect. Stack-specific skills (`review/accessibility/<stack>.md`) reference this and add per-framework checks (Angular CDK a11y, Next.js semantics, etc.). Triggers - "accessibility audit", "a11y check", "kiểm tra accessibility", "WCAG compliance", "screen reader test", "keyboard navigation broken", or invocation by any stack-specific a11y review skill. Bilingual (VI/EN).
allowed-tools: Read, Bash
---

# Review — Accessibility Baseline (Cross-Track)

## Purpose
WCAG 2.1 AA is the legal floor in most jurisdictions (Vietnam's MIC Circular 18/2014, EU EN 301 549, US Section 508, etc.). This skill is the cross-track checklist + tooling reference. Stack-specific skills add framework-specific probes (e.g. Angular CDK's `cdkTrapFocus`, Next.js's automatic anchor focus management).

A11y issues are 80% structural (semantic HTML, focus order, labels) and 20% visual (contrast, motion). Automation catches ~30% — the rest is keyboard + screen reader testing by a human.

## When invoked
- Pre-launch a11y audit
- User says "accessibility audit", "a11y check", "kiểm tra accessibility"
- After a major UI overhaul
- When a real user reports a barrier (e.g. "keyboard không vào được menu")

## Principles — POUR

WCAG organises everything under four principles:

| Principle | Means | Example failure |
|---|---|---|
| **P**erceivable | Content can be seen / heard | Image without alt; video without captions |
| **O**perable | All functionality via keyboard or assistive tech | Modal that traps focus; menu only opens on hover |
| **U**nderstandable | Predictable + readable + error-correctable | Form submits with no error feedback; placeholder used instead of label |
| **R**obust | Works with current and future user agents | Custom widget without ARIA roles; non-standard form controls |

Every finding should cite which POUR principle it violates — helps the user prioritise.

## The 12 checks that catch 80% of issues

### 1. Every `<img>` has `alt` (P)
- Meaningful image → describe content
- Decorative image → `alt=""` (NOT missing)
- Logo → `alt="Brand Name"` (NOT `alt="logo"`)

Probe: `grep -rE '<img(?!.*\balt=)' src/`

### 2. Form fields have associated labels (P, U)
- `<label htmlFor="email">Email</label> <input id="email" />` — explicit
- `<label>Email <input /></label>` — wrapped
- NOT `<input placeholder="Email" />` — placeholder is hint, not label

Probe: pa11y-ci, axe-core rule `label`

### 3. Page has one `<h1>` and heading hierarchy is sequential (P, U)
- Exactly 1 `<h1>` per page
- Don't skip levels (`<h2>` → `<h4>` is wrong)
- Headings reflect outline, not visual sizing

Probe: axe rule `heading-order`, `page-has-heading-one`

### 4. Color contrast ≥ 4.5:1 for text, 3:1 for large text and UI components (P)
- Body text on white background: at least #767676 dark (4.5:1)
- Large text (≥ 24 px or 18.5 px bold): 3:1 minimum
- Icons + form borders: 3:1 against adjacent colors

Probe: axe rule `color-contrast`, manual check with browser DevTools

### 5. All interactive elements reachable via Tab (O)
- Every button, link, input, custom widget gets focus
- Focus indicator visible (don't `outline: none` without replacement)
- Tab order matches visual order (don't `tabindex="999"` to reorder)

Probe: manual — press Tab repeatedly from page top, observe focus

### 6. Touch / click target ≥ 44×44 px (O)
- Buttons, icons, links — min 44px square on mobile
- Adjacent targets have ≥ 8px gap

Probe: visual inspection on mobile preset

### 7. No keyboard traps (O)
- Open modal → Esc closes
- Tab leaves the modal cycle correctly
- Custom widgets don't swallow focus

Probe: manual — open every modal/dialog, try to escape with keyboard only

### 8. Custom controls have ARIA role + state (R)
- Dropdown: `role="button" aria-haspopup="listbox" aria-expanded="true|false"`
- Tab list: `role="tablist"` + `role="tab"` + `aria-selected`
- Disclosure: `aria-expanded` toggles
- Live region for dynamic updates: `aria-live="polite"` (or `assertive` for errors)

Probe: axe rule `aria-*` family

### 9. Language is declared (R, U)
- `<html lang="vi">` or `<html lang="en">` set correctly
- Mixed-language content: inline `<span lang="en">English term</span>`

Probe: HTML inspection; for Next.js i18n, `<html lang={locale}>` in root layout

### 10. Form errors are announced + recoverable (U)
- Inline error message linked via `aria-describedby`
- Field marked `aria-invalid="true"` when in error
- Error summary at top of form for screen readers OR a focus moves to first error
- Don't rely on color alone (red border + icon + text)

Probe: pa11y, axe rule `form-field-multiple-labels`, manual screen reader test

### 11. No reliance on color alone for meaning (P)
- Required field has `*` + `aria-required="true"`, not just red label
- Error state has icon + text, not just red border
- Charts have patterns + labels, not just color

Probe: manual — view page in grayscale (Chrome DevTools Rendering tab)

### 12. Animations respect `prefers-reduced-motion` (O)
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

## Output: Accessibility Audit Report

```markdown
# Accessibility Audit — <page / feature> — <date>

## Automated probes
- Lighthouse a11y: <score>/100
- pa11y findings: <N>
- axe-core findings: <N> (Critical: <X>, Serious: <Y>, Moderate: <Z>, Minor: <W>)

## Findings by severity

### Critical (blocks compliance / blocks users)
| # | Location | POUR | Rule | Fix |
|---|---|---|---|---|

### Important (degrades UX significantly)
| # | Location | POUR | Rule | Fix |
|---|---|---|---|---|

### Minor (polish; cleanup sprint)
| # | Location | POUR | Rule | Fix |
|---|---|---|---|---|

## Manual checks
- [ ] Tab order logical: <pass/fail>
- [ ] Screen reader announces correctly (NVDA test): <pass/fail with notes>
- [ ] Modal focus traps + Esc: <pass/fail>
- [ ] Form errors announced: <pass/fail>
- [ ] Color contrast all states: <pass/fail>

## Recommendation
- Critical → `orchestration/repair-loop` with the list
- Important → user decides scope per finding
- Minor → batch
```

## Rules

### MUST DO
- Always run all 3 automated probes — they overlap but each catches different rules
- Always include a manual section — automation misses ~70%
- Cite WCAG SC number where the rule maps (e.g. WCAG 2.1 SC 1.1.1 Non-text Content)
- Map each finding to POUR principle for prioritisation
- Run on the actual built page, not Storybook in isolation

### MUST NOT
- Claim ✅ when only Lighthouse passed — that catches ~30% of issues
- Skip the manual section because "automation looks good"
- Reformat code while doing the audit — separate from `review/code/<stack>.md`
- Generic findings like "improve a11y" — every finding cites a rule + location

## Anti-patterns

- **`tabindex` everywhere** — usually means semantic HTML is wrong; fix the semantics first
- **`aria-label` on a button that already has text** — duplicates announcement; remove the aria-label
- **Skip-link only at top of page that doesn't go anywhere useful** — ship a real skip-to-main
- **Decorative icons announced** by screen reader — add `aria-hidden="true"` on decorative `<svg>`
- **Pa11y / axe disabled rules** without justification — every disable goes in a comment with the WCAG SC + the reason
- **"Looks ok visually" as the test** — a sighted developer is not the audience
- **Treating Lighthouse 100/100 as done** — Lighthouse runs ~30 of WCAG's ~78 success criteria

## References
- WCAG 2.1 Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/
- WAI-ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/
- Inclusive Components book by Heydon Pickering — patterns for ~14 common UI widgets

## Cross-references
- Stack-specific a11y checks: `review/accessibility/<stack>.md` (Angular CDK a11y, Next.js semantics, etc.)
- Touch targets enforced in responsive: `tracks/nextjs/build-website/17-responsive.md`
- Architecture-level a11y (e.g. global skip-link, lang attribute): `review/architecture`
- Acceptance verification: `orchestration/verify-before-done` runs the automated probes as criteria
