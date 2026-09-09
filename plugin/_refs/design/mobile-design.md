# Mobile Design Reference

Use this reference when `sdcorejs-design` turns PRDs, user stories,
acceptance criteria, or rough feature briefs into mobile app, PWA, or mobile
web handoff artifacts. It helps the design track produce mobile-first
interfaces that feel specific to the product, ergonomic in the hand, and honest
about platform constraints.

## Contents

- [Goal](#goal)
- [Mobile Situation](#mobile-situation)
- [Platform Fit](#platform-fit)
- [Mobile Design Principles](#mobile-design-principles)
- [Mobile State Coverage](#mobile-state-coverage)
- [Two-Pass Mobile Process](#two-pass-mobile-process)
- [Implementation Governance](#implementation-governance)
- [Handoff Requirements](#handoff-requirements)

## Goal

Create mobile design direction that is not a resized desktop page or generic
app template. The handoff should give frontend executors concrete decisions for
mobile structure, navigation, touch ergonomics, state behavior, copy,
accessibility, motion, and platform-sensitive implementation notes while
preserving product requirements as the behavior source of truth.

Distinctive mobile design must still be reachable, readable, reversible,
performant, and resilient to interruption.

## Mobile Situation

For a targeted mobile improvement, select only affected concerns through
`_refs/design/uiux/index.md`; the full mobile plan below is for a new flow or
durable handoff. For table-to-card conversion also select `table`, preserving
selection, row actions and opening behavior. These shared mobile patterns are
SDCoreJS-authored heuristics, candidate until grounded in the project/platform.

### UX-MOBILE-NAV - Keep destinations and alternatives discoverable

- Applies: mobile web/native navigation and gestures in the approved flow.
- Excludes: desktop-only layouts and navigation capabilities absent from scope.
- Do: preserve current back/history behavior, distinguish peer destinations from
  drill-in detail, and provide visible alternatives to essential gestures. Follow
  actual platform semantics; retain local navigation/component conventions.
- Avoid: adding a bottom bar by default, hiding essential actions behind swipe,
  or using mock native controls that cannot provide the promised interaction.
- Verify: back/deep links, return position/focus, touch and keyboard alternatives,
  reachable actions and interrupted navigation on the supported platform.

### UX-MOBILE-INPUT - Keep work visible with keyboard and safe areas

- Applies: phone/tablet input, fixed actions, viewport and text scaling.
- Excludes: platform-specific inset/haptic APIs on surfaces that do not use them.
- Do: account for the actual keyboard and system safe areas; keep focused fields,
  errors and submit controls accessible. Use suitable input types/autofill where
  supported, readable text scaling and touch spacing based on real tasks. Web
  target/reflow standards come from `_refs/shared/review-accessibility.md`;
  native target sizes and accessibility APIs require the actual platform docs.
- Avoid: assuming a screenshot proves keyboard behavior, disabling zoom, hiding
  submit behind the keyboard, or applying one fixed pixel inset across devices.
- Verify: small/large phone, orientation, keyboard open/closed, long text,
  platform text scaling, safe areas and the complete error/submit flow.

### UX-MOBILE-RESUME - Preserve truthful state through interruption

- Applies: background/resume, connectivity changes and approved offline behavior.
- Excludes: implementing new offline storage/sync/permission capabilities.
- Do: specify what is retained, pending, completed or failed after interruption.
  Preserve recoverable input, communicate stale/partial data and permission
  recovery, and reconcile results without duplicate operations.
- Avoid: fake queued/saved state, automatic non-idempotent retries, or claiming
  offline support because a loading placeholder exists.
- Verify: interrupt/resume during read/edit/submit; reconnect, permission changes,
  and completion/failure recovery using the actual supported contract.

Before designing, identify:

- Subject: the concrete product, workflow, or domain object.
- Audience: the user role and their mobile working context.
- Target surface: iOS app, Android app, cross-platform native app, PWA, or
  responsive mobile web.
- Mobile context: walking, commuting, field work, scanning, queue handling,
  one-handed use, notification response, poor network, or another relevant
  situation.
- Single job: the smallest useful task this screen or flow should help the user
  complete.

If any item is vague, infer a conservative candidate and mark it
`inferred - needs confirmation` in the design spec or decision log.

Design around attention, grip, interruption, reach, latency, permissions, and
the smallest useful next action. Do not treat mobile as a narrow desktop
viewport.

## Platform Fit

Respect the expectations of the selected target surface:

- safe areas and system chrome
- system back behavior and edge gestures
- keyboard behavior and input focus
- bottom bars, sheets, and dialogs
- permission timing and rationale
- dynamic type, browser zoom, and text scaling
- dark mode when supported
- reduced motion and accessibility settings
- offline, sync, and resume behavior

Use platform conventions where they reduce cognitive load. Diverge only when
the product benefits from a memorable interaction or brand-specific moment, and
explain why the divergence remains learnable, reachable, and reversible.

Do not specify fake native controls when the implementation cannot support the
real behavior. A simple honest custom pattern is better than a fake picker,
fake bottom sheet, fake swipe action, or fake permission screen.

## Mobile Design Principles

### The first screen is a decision

The first mobile screen must answer: where am I, what can I do now, and why does
this matter here?

For product screens, lead with the primary mobile task, live status, queue,
camera/map/scanner surface, onboarding choice, or single useful control. Avoid
generic app openings such as large gradient headers, floating phone mockups,
benefit cards, and rounded CTAs unless the brief truly calls for a marketing
landing page.

### Design for thumbs, not cursors

Touch targets must be large enough to hit confidently. Primary actions should
live where users can reach them in the expected grip. Common actions belong near
the bottom or in persistent controls when appropriate. Rare, destructive, or
complex actions should be protected from accidental taps.

Hover does not exist on most mobile surfaces. Essential information must be
visible, tappable, or progressively disclosed through a clear control.

Gestures should accelerate experienced use, not replace discoverable controls.
Swipe, long-press, pull, drag, pinch, and edge gestures need visible
alternatives or strong contextual cues.

### Navigation is memory

Choose navigation based on frequency, hierarchy, and user intent:

- tab bar for a few persistent peer destinations
- stack navigation for drill-in detail
- bottom sheet for temporary contextual tasks
- search for many retrievable objects
- segmented controls for parallel views of the same object
- wizard only when order is real and necessary

Do not add decorative steps, tabs, pills, or numbers unless they encode
information the user needs.

### Density is a mobile material

Limited space does not mean every pixel should be packed. Decide what the
screen is for, then remove anything that competes with that job.

Use progressive disclosure for secondary details, but do not bury required
decisions. Summaries, previews, inline expansion, sheets, and detail screens
must each have a clear reason to exist.

### Typography must survive the hand

Typography carries identity, but on mobile it must survive glare, motion, small
screens, variable font scaling, and tired eyes.

Pair type roles deliberately. Use a characterful display role with restraint, a
highly legible body role, and a utility style for metadata, captions, values, or
system labels when needed. Include mobile type scale guidance, line height,
truncation, and dynamic type or zoom behavior.

Typeface and asset choices in the design plan are candidate handoff decisions
unless the brief explicitly authorizes implementation changes. When modifying
an existing codebase, do not add new font files, external font imports, image
assets, icon packs, motion libraries, haptic libraries, or visual dependencies
solely to satisfy the art direction without approval. Provide an approved-asset
or system-font fallback when proposing a new visual asset.

### Color must work in motion, glare, and state

Color choices must be usable, not just attractive. In the design plan, identify
the main text/background, muted text/background, CTA, focus, selected, disabled,
  and status-state pairings. For web use `_refs/shared/review-accessibility.md`
  with the project's required WCAG version/level; for native use actual platform
  guidance. Record measured evidence separately from intended visual direction.

Focus indicators must be visible against both the component and surrounding
surface. Status, error, warning, success, syncing, offline, and selected states
must not rely on color alone; pair color with text, iconography, shape, pattern,
position, or explicit state labels.

Avoid generic mobile palettes that appear across unrelated apps, such as blue
gradient SaaS, dark glassmorphism with neon accent, beige wellness minimalism,
pastel bento cards, or endless white rounded cards with soft shadows, unless
the brief truly calls for them.

Use source token/component references and revisions for the token plan. Reuse
existing values; only an evidenced missing role needs a candidate value. There
is no color-count quota and no requirement for a new palette or font per screen.

| Token | Role | Source/evidence | Intended use |
|---|---|---:|---|
| <Subject surface name> | Primary app surface | <source reference or missing-role candidate> | Main screen background |
| <Raised or inset surface name> | Elevated or inset surface | <source reference or missing-role candidate> | Cards, sheets, panels, input fields |
| <Primary text name> | Primary text | <source reference or missing-role candidate> | Headlines, labels, body copy |
| <Muted text name> | Secondary text | <source reference or missing-role candidate> | Captions, metadata, helper text |
| <Accent/action name> | Brand/action accent | <source reference or missing-role candidate> | Primary actions, active states, signature interaction |
| <State/focus name> | Status or focus color | <source reference or missing-role candidate> | Focus rings, errors, warnings, confirmations, sync/offline state |

### Motion should explain the interface

Mobile motion should clarify continuity, causality, and touch response. A
transition should help the user understand where an object went, what changed,
or whether an action completed.

Use an existing transition or feedback only when it improves understanding.
No new animation or gesture is required. Reuse current motion conventions and
test interruption, reduced-motion alternatives and completion behavior.

Respect reduced motion. Avoid unnecessary parallax, endlessly animated
gradients, scroll-jacking, and heavy blur effects that degrade performance.

Haptics are implementation-sensitive. Treat haptic choices as candidate
interaction notes unless the platform and implementation path are clear. Never
use haptics to compensate for unclear visual feedback.

### Mobile copy is interface control

Mobile copy must be short, specific, and action-oriented. Name actions by what
people recognize and control, not by how the system is built.

Buttons should say what happens: `<specific action>`, not `Submit` or
`Continue` when the result is more specific. Use the same action name through
the whole flow.

Permission prompts need context before the system dialog appears. Explain why
location, camera, microphone, contacts, photos, notifications, or health data is
needed at the moment the user benefits from granting it.

Errors should explain what happened and how to fix it. Empty states should
invite the next useful action. Offline states should say what still works, what
is queued, and when the app will retry.

## Mobile State Coverage

Design beyond the happy path. Cover likely unstable mobile conditions:

- first launch and signed-out state
- loading, skeleton, empty, partial data, and retry states
- offline, poor network, queued sync, and sync conflict states
- permission denied and permission recovery states
- backgrounded, resumed, interrupted, and abandoned flows
- destructive confirmation and undo/recovery where appropriate
- disabled or unavailable actions
- long content, dynamic type, and zoomed text
- small phone and large phone layouts
- light mode and dark mode when supported

A mobile screen is not finished until its likely failure and interruption states
are designed.

## Two-Pass Mobile Process

### Pass 1 - Mobile Design Plan

Create a compact mobile design plan before writing wireframes or PNG exports.
Persist the plan in `.sdcorejs/design/decisions/<feature>.md` and summarize it inside
`.sdcorejs/design/specs/<feature>.md`.

Include:

```markdown
## Mobile Design Plan

### Subject Framing
- Subject:
- Audience:
- Target surface:
- Mobile context:
- Single job:

### Token System
- Color tokens:
- Type roles:
- Spacing rhythm:
- Shape/surface treatment:
- Existing motion behavior or justified candidate change:
- Reduced-motion behavior:

### Layout And Ergonomics
- Navigation model:
- Primary action placement:
- Reachability notes:
- Safe-area / keyboard notes:
- Gesture alternatives:

### Mobile States
- Offline / poor network:
- Permission denied:
- Interrupted / resumed flow:
- Dynamic type / zoom:
- Small and large phone:
```

Use ASCII wireframes when they clarify layout. Keep them simple and
implementation-oriented:

```text
+-----------------------+
| Status / app chrome   |
+-----------------------+
| Screen title          |
| Context / filter      |
+-----------------------+
| Primary content       |
|                       |
|                       |
+-----------------------+
| Secondary controls    |
+-----------------------+
| Primary action / nav  |
+-----------------------+
```

### Pass 2 - Critique And Revise

Before producing final handoff artifacts, review the mobile plan:

- Context check: does the design reflect the user's mobile situation?
- Reachability check: are frequent actions reachable and mistakes protected?
- Platform check: are conventions respected where they reduce cognitive load?
- State check: are interruption, permission, offline, and resume states covered?
- Generic check: would the same design fit a different mobile app with only the
  subject renamed?

If any check fails, revise the plan and record what changed in
`.sdcorejs/design/decisions/<feature>.md`.

## Implementation Governance

When building, express approved color, type, spacing, shape, and motion
decisions as reusable design tokens, preferably the project's existing token
mechanism or platform theme system. Derive component styles from those tokens
rather than scattering raw hex values, one-off font declarations, and bespoke
motion constants through the stylesheet or component code.

New fonts, images, icons, haptic libraries, motion libraries, and platform
dependencies are candidate handoff decisions unless implementation approval is
explicit. Provide a system fallback and a no-new-dependency fallback in the
handoff.

## Handoff Requirements

Every mobile design handoff should tell frontend executors:

- target surface and platform assumptions
- mobile context of use and single job
- navigation model and primary action placement
- touch, gesture, keyboard, safe-area, and reachability notes
- token, type, spacing, shape, and motion decisions
- offline, permission, interrupted-flow, and resume states
- accessibility notes for contrast, dynamic type/zoom, focus, labels, reduced
  motion, and non-color-only status
- which decisions are confirmed, inferred, or still open

PNG previews are optional evidence. Editable specs and wireframes remain the
source of truth.
