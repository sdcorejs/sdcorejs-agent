---
slug: recipes/ui
title: Improve an existing UI
description: Start with the user’s task and the actual interface; preserve behavior, tokens and components while clarifying layout and interaction.
section: Recipes / UI
kicker: Recipe · UI/UX
---

## Situation and inputs

A three-level sidebar makes the active state hard to read, or a desktop table needs better mobile usability. Prepare the source/route, screenshots when available, user task, permissions, tokens and installed components. This is a usage example, not an executed transcript.

## 1. Choose design or review

For proposals or improvement design, use Design. For independent findings, use read-only Review. A designer’s self-critique helps quality but must not be called an independent review.

```text
Use sdcorejs-review to audit the current sidebar read-only.
Focus on navigation, active/expanded states and keyboard behavior.
Separate functional/accessibility defects from aesthetic preferences.
State which checks were source-only and which inspected rendered UI.
```

## 2. Design a bounded change

```text
Use sdcorejs-design to improve the three-level sidebar.
Preserve existing routes, permissions, token roles and icon family.
Provide a component/data map, expanded/active behavior,
keyboard flow and responsive rules. Do not write production code.
```

Design selects relevant UI/UX references: navigation, hierarchy, accessibility and mobile when applicable. The existing UI is the starting point. Mark exact component APIs as candidates when evidence is unavailable.

When a real layout choice remains unresolved, compare visual alternatives. A live Visual Companion needs capabilities and scoped consent. Browser auto-open needs separate consent. Static HTML or Markdown is a fallback; choosing a mockup does not approve a spec/plan.

## 3. Implement from the handoff

A substantial UI change still needs an appropriate spec/plan. The executor uses the handoff and installed source. For Core UI, check the package alias and exact version; missing version-matched docs/source require an explicit unverified-API note.

Do not replace a table with cards while losing selection scope, row actions or detail navigation. Do not change routes/permissions merely to simplify the layout.

## 4. Verify the actual UI

- Keyboard: Tab, activation, expand/collapse, focus and focus position after closing an overlay.
- Mobile: small/large phone widths, long labels and safe areas for fixed controls.
- Reflow: 320 CSS px viewport and text resizing/spacing; avoid sticky UI obscuring content.
- Contrast: measure computed foreground/background for text and states according to their visual roles.
- Behavior: current route, back/deep links, permissions and actions remain correct.

A screenshot helps inspect layout; it does not prove keyboard or screen-reader behavior. If only source is available, record unexecuted rendered checks as NOT RUN. Do not call a focused audit complete WCAG conformance.

## Handoff outputs

Editable handoff, decisions/token/component map, changed paths, focused tests, rendered/interaction evidence and remaining findings. Read [artifacts](/docs/artifacts/) to distinguish mockups from real UI captures.

Sources: [UI/UX index](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/design/uiux/index.md), [Accessibility baseline](https://github.com/sdcorejs/sdcorejs-agent/blob/ac820d70bd247a04f977aab9bbb864f6a054acb7/_refs/shared/review-accessibility.md).
