# Shared Accessibility Baseline

Shared by design, implementation and independent review through the UI/UX index.
The parent review skill owns the report and severity; this file supplies checks.
For backend-only scopes, mark accessibility N/A unless generated UI/docs or an
explicit accessibility concern applies. Native apps need the detected platform's
accessibility guidance; HTML/ARIA examples are web-specific.

## Evidence and applicability

Source/status: standards-based web checks linked to
[WCAG 2.2](https://www.w3.org/TR/WCAG22/) and informative
[WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/) guidance. Record the project's
required WCAG version/level; do not silently call AAA criteria AA requirements or
infer a jurisdiction's legal obligations. Criteria below identify their level.
This focused baseline is not an exhaustive conformance audit.

Discover installed tools, scripts, runtime URL and UI scope before probes. Use
existing checks; do not download Lighthouse, pa11y or axe without authorization.
Automated results do not prove keyboard, screen-reader, visual or full WCAG
conformance. Source-only review can establish structural defects but must label
rendered contrast, focus movement, clipping and interaction as unverified.

### UX-A11Y-NAME - Expose purpose, relationships and state

- Applies: web content/controls, labels, headings, tables, images and status.
- Excludes: decorative imagery from meaningful alternative text; native controls
  use platform semantics. Do not add redundant ARIA that conflicts with HTML.
- Do: prefer native elements, associated labels, meaningful link text and visible
  label/name agreement. Give icon-only controls names, hide decorative icons from
  assistive output, provide useful image alternatives, semantic headings and
  table relationships, page language and programmatic control state. Heading
  structure communicates content; exactly one h1 is a convention, not a universal
  WCAG requirement. Announce meaningful status without needless focus moves.
- Avoid: placeholder-only labels, unnamed selection/actions, div-click controls
  without keyboard semantics, color-only meaning and indiscriminate assertive alerts.
- Verify: inspect accessible name/role/value, image purpose, heading/table outline,
  status announcements and visible-label agreement in the rendered accessibility
  tree and relevant assistive technology.
- Standards: 1.1.1, 1.3.1, 1.4.1, 2.4.4, 2.5.3, 3.1.1, 4.1.2 (A), 2.4.6, 4.1.3 (AA).

### UX-A11Y-KEYBOARD - Preserve operability and focus

- Applies: interactive web UI, navigation, drawers, dialogs and composite widgets.
- Excludes: pointer-path-dependent input where the criterion's exception applies;
  composite widgets may use one Tab stop and internal arrow-key navigation.
- Do: make functionality keyboard-operable with logical focus order, visible
  focus and an escape route from widgets. Modal dialogs contain Tab focus while
  open, expose a usable close/cancel mechanism, and return focus appropriately;
  containment alone is not an unlawful keyboard trap. Follow the actual widget's
  keyboard pattern. Keep focused controls from being fully covered by sticky UI.
- Avoid: positive tabindex ordering, hidden focused elements, forcing every grid
  cell into the page Tab sequence, or removing outlines without an equivalent.
- Verify: complete the affected flow with keyboard, open/close overlays, restore
  focus, test sticky headers/banners and inspect focus at supported viewport sizes.
- Standards: 2.1.1, 2.1.2, 2.4.3 (A), 2.4.7 (AA); 2.4.11 is WCAG 2.2 AA.

### UX-A11Y-CONTRAST - Measure according to the visual role

- Applies: required text and meaningful non-text UI/state information.
- Excludes: incidental text, logos and inactive controls under the applicable
  criterion; decorative borders need not all meet a component threshold.
- Do: measure text at 4.5:1, or 3:1 for large text (18 pt regular / 14 pt bold,
  approximately 24 / 18.67 CSS px). Required visual information identifying
  controls/states and meaningful graphics generally needs 3:1 against adjacent
  colors. Check actual computed pairs and all relevant states; focus must be
  visible, and criteria for its appearance depend on the required WCAG level.
- Avoid: a single blanket contrast rule for text, disabled controls, decoration
  and focus; substituting palette aesthetics for measurement.
- Verify: rendered computed colors, backgrounds/images, text size/weight,
  hover/focus/selected/error pairs and applicable exceptions. A hex token alone
  does not prove contrast against its eventual background.
- Standards: [1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  1.4.11 (AA); 2.4.13 Focus Appearance is WCAG 2.2 AAA.

### UX-A11Y-REFLOW - Preserve content under zoom and text changes

- Applies: responsive web layouts, fixed UI, text resizing/spacing.
- Excludes: inherently two-dimensional regions such as data tables/maps from
  reflow where the criterion permits; surrounding controls still reflow.
- Do: support 200% text resize and reflow at 320 CSS px width for vertically
  scrolling content (256 CSS px height for horizontal content). Test user text
  spacing without clipping or loss of functionality. Let fixed navigation,
  notices, drawers and actions adapt so they do not cover usable content/focus.
- Avoid: global overflow hiding, fixed heights clipping translated text, disabling
  browser zoom, or forcing all table columns into illegibly narrow cards.
- Verify: browser/text zoom, narrow view, text-spacing override, long labels,
  sticky regions, overlays and access to any legitimately scrollable region.
- Standards: 1.4.4, [1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html),
  1.4.12 (AA); focus occlusion also uses 2.4.11 in WCAG 2.2 AA.

### UX-A11Y-TARGET - Check pointer targets and alternatives

- Applies: pointer controls and gesture/drag interactions on web surfaces.
- Excludes: the documented spacing/equivalent/inline/user-agent/essential
  exceptions where their conditions hold; document the actual exception.
- Do: WCAG 2.2 AA 2.5.8 uses 24 by 24 CSS px targets or its exceptions, not a
  blanket 44 px minimum. Its spacing exception uses nonintersecting 24 px circles
  around undersized targets. Larger comfortable targets are a useful ergonomic
  heuristic; 44 by 44 CSS px is the enhanced AAA criterion 2.5.5. Provide simple
  pointer alternatives for multipoint/path gestures and dragging when required.
- Avoid: labeling every target under 44 px an AA failure or requiring a fixed
  8 px gap regardless of target size/context.
- Verify: rendered target bounds and adjacent targets, relevant exceptions,
  touch/pointer operation and equivalent visible controls for gestures/dragging.
- Standards: 2.5.1 (A), 2.5.7 and
  [2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
  (WCAG 2.2 AA), 2.5.5 (AAA).

### UX-A11Y-MOTION - Provide control and reduced-motion behavior

- Applies: moving/blinking/updating content and interaction-triggered animation.
- Excludes: the essential-motion exceptions where justified; no motion is required.
- Do: honor reduced-motion preferences as an inclusive design practice. Provide
  pause/stop/hide controls for applicable automatically moving/updating content,
  and avoid dangerous flashing. Disable or substitute nonessential interaction
  animation where required. Preserve state changes when reducing motion.
- Avoid: calling all reduced-motion behavior an AA criterion, blanket CSS that
  breaks completion events, or motion conveying the only status information.
- Verify: reduced-motion settings, pause controls, interruption/reversal and
  equivalent state feedback. Inspect relevant flashing risks separately.
- Standards: 2.2.2 and 2.3.1 (A); 2.3.3 Animation from Interactions is AAA.

### UX-A11Y-ERROR - Identify and recover from input errors

- Applies: form instructions, validation feedback and consequential submissions.
- Excludes: speculative validation rules not in the approved business contract.
- Do: identify errors in text, associate messages with fields, expose invalid
  state and suggest corrections when known and safe. Preserve input and a usable
  recovery path. Apply review/correct/confirm or reversibility for the submission
  categories covered by error-prevention criteria. Use an appropriate focus or
  summary strategy; a specific visual layout/timing is a heuristic.
- Avoid: color-only errors, resetting input on failure, silent invalid submit or
  treating a toast/screen-reader announcement as proof all errors are understood.
- Verify: invalid submit, corrected values, server errors, keyboard/screen-reader
  announcements and recovery through the real flow.
- Standards: 3.3.1, 3.3.2 (A), 3.3.3, 3.3.4 (AA).

## Reporting

Use the existing review contract and requested dimensions. A finding needs a
locator/screen, actual evidence, user impact, severity, proposed correction and
verification. Severity follows impact and scope, not a preassigned color per
criterion. Separate functional/accessibility defects, accepted-convention drift,
and advisory aesthetic suggestions. Record NOT RUN for missing runtime/visual
checks; do not use a Lighthouse score as a conformance threshold.
