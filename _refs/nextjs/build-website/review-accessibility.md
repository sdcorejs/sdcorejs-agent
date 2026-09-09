# Next.js Website Accessibility Addenda

Apply only to `nextjs-build-website` or explicit website-profile migration scope.
For `plain-nextjs`, mark this ref N/A and use the shared baseline plus actual
installed libraries/local components. Do not require `[locale]`, typed i18n,
Tailwind, next-intl or a section-library layout without project evidence.

Read `_refs/shared/review-accessibility.md` first. It owns criterion levels,
thresholds and exceptions; the parent review assigns severity from real impact.
These addenda contain stack probes, not a second set of accessibility rules.
Discover the actual Next.js/router/version, scripts, URLs and tools before
probing. Do not download tools or install dependencies without authorization.

## Focused probes

| Concern | Next.js/project evidence | Verify against shared rule |
|---|---|---|
| Document language | Inspect the actual root layout/document and configured locale mechanism. Test only supported languages and routes. | UX-A11Y-NAME: rendered language and language changes |
| Locale switching | When present, inspect link/button semantics, selected locale and current route preservation. | UX-A11Y-NAME and UX-A11Y-KEYBOARD |
| Route announcements | Inspect the installed router's announcement/focus behavior, page title and existing custom handling before adding anything. | UX-A11Y-KEYBOARD: actual client navigation, back and overlays |
| Dialogs | Inspect native dialog or installed primitive/wrapper semantics, initial focus and return. Absence of a particular library/directive is not a defect. | UX-A11Y-KEYBOARD: containment and keyboard exit |
| Images | Check `next/image` or actual image output for purpose-appropriate alternatives; decorative images may use empty alt. | UX-A11Y-NAME |
| Forms and server actions | Follow rendered label/error IDs and pending/error/success updates across the real Server/Client boundary. `name` is submission identity, not an accessible-label substitute; it need not equal `id`. | UX-A11Y-NAME and UX-A11Y-ERROR |
| Composed headings | Inspect the whole page outline and accepted page/section conventions. Do not infer a WCAG failure merely from multiple h1 elements or require a hero. | UX-A11Y-NAME |
| Bypass navigation | Verify a usable way past repeated blocks in the actual page structure; do not grade by an arbitrary number of nav items. | WCAG 2.4.1 (A), UX-A11Y-KEYBOARD |
| Hover/focus/selected styles | Inspect computed style pairs from actual CSS/tokens/utilities, including hydration and interactive states. | UX-A11Y-CONTRAST |
| Pointer controls | Inspect actual target geometry and supported responsive behavior; utility names alone do not prove size or spacing. | UX-A11Y-TARGET and UX-A11Y-REFLOW |
| Formatting | Use current locale/data formatting contracts and installed utilities; do not add next-intl or change date semantics from review. | Task correctness, with UX-A11Y-NAME when interpretation is affected |
| Motion and fixed UI | Inspect reduced-motion alternatives, sticky banners/actions, zoom and client-state updates. | UX-A11Y-MOTION and UX-A11Y-REFLOW |

Use the available app build and representative affected routes. Test actual
keyboard, assistive announcements, locale changes, error recovery, zoom and
reduced motion when supported. Report source-only limitations and missing probes
as NOT RUN. Automated scores are diagnostic evidence, never a conformance gate
or permission to ignore a known defect. Independent review makes no source edits.
