---
name: sdcorejs-review-accessibility-angular-portal
description: Use to audit an Angular portal for accessibility — extends `review/accessibility/baseline.md` with Angular-specific concerns (CDK a11y primitives, Core UI focus/label patterns, ARIA on dynamic dropdowns, keyboard navigation in SdTable, form error announcement via aria-live, RouterOutlet focus-on-navigation). Outputs Critical/Important/Minor findings tied to WCAG SC. Triggers - "a11y angular", "accessibility audit portal", "keyboard không vào được menu", "screen reader test portal", "audit Core UI a11y", or invocation pre-release. Bilingual (VI/EN).
allowed-tools: Read, Bash, Glob, Grep
---

# Review — Accessibility (Angular Portal)

## Purpose
Run the cross-track a11y baseline + Angular-specific checks. Angular CDK provides `cdkTrapFocus`, `cdkMonitorElementFocus`, `LiveAnnouncer`, etc. — using them correctly is the difference between an accessible portal and a frustrating one.

## When invoked
- Pre-release a11y audit
- After adding new screens / workflows
- User says "a11y angular", "audit accessibility", "keyboard không vào được"

## Probe layer 1 — Baseline

Run `review/accessibility/baseline.md` probes against a running portal (dev server or staging):

```bash
URL="${PORTAL_URL:-http://localhost:4200}"

# Lighthouse a11y on key routes
for path in '/' '/catalog/product' '/catalog/product/create'; do
  npx --yes lighthouse "$URL$path" --only-categories=accessibility --quiet \
    --chrome-flags="--headless" --output=json --output-path=/tmp/lh-$(echo $path | tr / _).json
  node -e "console.log('$path:', Math.round(require('/tmp/lh-$(echo $path | tr / _).json').categories.accessibility.score * 100))"
done

# pa11y + axe on home + 1 list + 1 detail
npx --yes pa11y "$URL/catalog/product"
npx --yes @axe-core/cli "$URL/catalog/product"
```

Target: Lighthouse ≥ 90 per route (portal apps are heavier than landing sites; 95+ is harder).

## Probe layer 2 — Angular / Core UI specifics

### AP-1: Modal / dialog uses `cdkTrapFocus`

Custom modals — not Core UI's — must trap focus with the CDK directive:

```bash
# Find modal/dialog components
grep -rnE "<.+dialog|<.+modal" src/libs/ src/app/ | grep -v "\.spec\."
# For each match, check for cdkTrapFocus
grep -rnE "cdkTrapFocus|FocusTrap" src/libs/
```

If a modal is open and Tab leaves the dialog → Critical (WCAG SC 2.4.3 Focus Order).

### AP-2: `cdkMonitorElementFocus` on custom focusable widgets

Custom widgets (tooltips, dropdowns) need to track focus state for proper announcement.

Severity: Important — easy to skip, hurts screen reader users.

### AP-3: Live region for async toasts / errors

Angular portals typically have a global toast service. The toast container needs `aria-live` so screen readers announce errors / success.

```bash
grep -rnE "aria-live" src/libs/shared/ src/app/ | head
# Expect: at least 1 hit on the toast container OR error summary
```

For Core UI toasts, verify `<sd-toast aria-live="polite">` (or whatever the Core UI catalog mandates).

Severity: Critical — errors that don't announce mean blind users hit submit, see nothing, try again, see nothing.

WCAG SC 4.1.3 Status Messages.

### AP-4: Form error association (aria-describedby + aria-invalid)

Every form field with validation must:
- Set `aria-invalid="true"` when in error state
- Set `aria-describedby="<error-id>"` pointing to the error element
- Error element has `id="<error-id>"`

```bash
# In template files — find form fields
grep -rnE "<input|<textarea|<select" src/libs/*/features/*/pages/ | head -10
# Each should have aria-describedby tied to its error <small> / <span>
```

Core UI components (`sd-input`, `sd-select`) likely handle this internally — verify by inspecting one rendered form in DevTools.

Severity: Critical for forms used by external users; Important for internal admin tools.

WCAG SC 3.3.1 Error Identification, 3.3.3 Error Suggestion.

### AP-5: SdTable keyboard navigation

`@sd-angular/core`'s `SdTable` should support:
- Arrow keys to move between cells (or rows)
- Enter to activate row action
- Space to select checkbox (bulk select)

Verify manually — keyboard-only test on a list page. Cite Core UI docs if non-compliant.

Severity: Important per WCAG SC 2.1.1 Keyboard.

### AP-6: RouterOutlet focus on navigation

When user navigates between routes (via menu, breadcrumb, button), focus should move to either:
- The new page's `<h1>`, OR
- A skip-link / live region announcing the navigation

```bash
# Look for focus reset logic on RouterOutlet events
grep -rnE "activate|RouterOutlet|router\.events" src/app/app.component.ts src/libs/shared/
```

In Angular, you typically subscribe to `router.events` filtering on `NavigationEnd` then `document.querySelector('main h1')?.focus()`.

Severity: Important per WCAG SC 2.4.3.

### AP-7: Headings inside `sd-section-item` / Core UI sections

A common Angular-portal mistake: every `sd-section-item` renders an `<h3>` internally, so a page with 5 sections has 5 `<h3>` but no `<h2>`. Outline broken.

```bash
# Check: page has 1 h1 (page title) and at least 1 h2 (section group)
# Inspect rendered DOM — usually fine if you use SdLayoutSplit / SdLayoutUnified correctly
```

Severity: Important — fix by adding `<h2>` for each major section group above `sd-section-item` blocks.

### AP-8: Focus visible on Core UI components

Core UI components must NOT remove the focus indicator. Verify:

```bash
grep -rnE "outline:\s*(none|0)" src/styles/ src/libs/shared/styles/
# Each match should have a corresponding focus-visible replacement
```

Severity: Critical — invisible focus = unusable keyboard portal.

WCAG SC 2.4.7 Focus Visible.

### AP-9: Touch target size on portal action buttons

Portals are mostly desktop but increasingly used on tablet. Buttons should be ≥ 32px (WCAG AA — relaxed from the 44px landing-site target).

Severity: Minor — flag, don't block.

### AP-10: Color-blind safe status indicators

Portals use a lot of status badges (PENDING / APPROVED / REJECTED). Color alone (red/yellow/green) fails for ~8% of male users.

```bash
# Look for status renderers
grep -rnE "(status|state)" src/libs/*/features/*/pages/ | grep -E "(class|css|color)" | head
# Each status should have an icon OR text label, not just color
```

Severity: Important per WCAG SC 1.4.1 Use of Color.

### AP-11: i18n + lang attribute

If portal supports VI + EN, `<html lang="...">` must reflect the user's locale, switched on language change.

```bash
grep -rnE "lang=" src/index.html src/app/app.component.ts
```

Severity: Critical per WCAG SC 3.1.1.

### AP-12: ARIA on disclosure widgets

Expandable filters / collapsible panels need `aria-expanded` + `aria-controls`.

```bash
# Look for "expand" / "collapse" UI
grep -rnE "(expand|collapse|toggle|accordion)" src/libs/shared/ | head
```

Severity: Important per WCAG SC 4.1.2 Name, Role, Value.

## Manual checklist

| Test | Procedure |
|---|---|
| Keyboard-only navigation | Unplug mouse. Tab from top of list page to bottom — every action reachable? |
| Screen reader (NVDA/VO) | Listen to home, 1 list page, 1 detail/create page. Errors announced? |
| Focus visible at all times | Tab through all interactive elements; focus indicator present + visible at each |
| Modal escape | Open every dialog, Esc closes, focus returns |
| Form error announcement | Submit blank form → first error announced + focused (or summary read) |
| RouterOutlet focus | Navigate via menu, listen — page change announced |
| 200% browser zoom | No content cut off; horizontal scroll only where unavoidable |

## Output

Same format as `review/accessibility/baseline.md` — Critical / Important / Minor table with WCAG SC + file:line + suggested fix.

## Rules

### MUST DO
- Run baseline probes first; this skill adds Angular layer
- Test BOTH a list page AND a detail/form page (different a11y patterns)
- For Core UI components: cite the catalog if a built-in feature is missing
- Cite WCAG SC for every finding
- Include manual section — automation catches ~30%

### MUST NOT
- Test in dev mode with HMR-injected DOM — use production build (`ng build --configuration=production`)
- Claim ✅ on form announcements without manually triggering an error and listening
- Skip the keyboard-only test — that's where most a11y bugs hide

## Anti-patterns
- **Replacing native `<button>` with `<div role="button" tabindex="0">`** — only legit when behaviour needs unusual semantics; otherwise use native
- **`aria-label` duplicating visible text** — read twice by SR; remove the aria-label
- **`tabindex="-1"` everywhere to "fix" tab order** — usually the SOURCE of the tab order problem; fix the DOM order
- **Focus reset on EVERY click** — too aggressive; only on route change + modal open/close
- **Removing `outline` for "clean design"** — provide a replacement (custom `:focus-visible` style); never strip without replacement

## Cross-references
- Cross-track baseline: `review/accessibility/baseline.md`
- Core UI a11y catalog: `tracks/angular-portal/_refs/sd-angular-core-catalog.md`
- Verification: `orchestration/verify-before-done`
- Repair loop: `orchestration/repair-loop`
