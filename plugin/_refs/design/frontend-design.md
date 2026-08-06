# Frontend Design Reference

Use this reference when `sdcorejs-design` turns PRDs, user stories, acceptance
criteria, or rough feature briefs into frontend handoff artifacts. It helps the
design track produce an intentional UI direction before Angular or Next.js
implementation begins.

## Contents

- [Goal](#goal)
- [Subject Grounding](#subject-grounding)
- [Two-Pass Design Process](#two-pass-design-process)
- [Layout Guidance](#layout-guidance)
- [Motion And Interaction](#motion-and-interaction)
- [Copy Guidance](#copy-guidance)
- [Implementation Governance](#implementation-governance)
- [Handoff Requirements](#handoff-requirements)

## Goal

Create a design direction that is specific to the feature, audience, and target
application. The result should not read like a generic scaffold inferred from a
PRD. It should give frontend executors concrete choices for visual hierarchy,
layout, states, copy, and interaction while preserving the product requirements
as the behavior source of truth.

For operational portals and admin tools, distinctive does not mean decorative.
Prefer dense, calm, scannable work surfaces with one memorable product-specific
choice over hero-style marketing composition.

## Subject Grounding

Before designing, identify:

- Subject: the concrete product area, entity, workflow, or domain object.
- Audience: the primary user role and their working context.
- Single job: the main thing this screen or flow must help the user accomplish.
- Source clues: product wording, domain artifacts, existing app conventions,
  target industry, and any known stakeholder preference.

If the brief leaves any of these vague, infer a conservative candidate and mark
it `inferred - needs confirmation` in the design spec or decision log.

Use the subject's real materials, terms, objects, and workflow pressure to shape
the design. Do not decorate with arbitrary numbers, badges, gradients, or
section markers unless they encode something useful about the content.

## Two-Pass Design Process

### Pass 1 - Design Plan

Create a compact frontend design plan before writing wireframes or PNG exports.
Persist the plan in `.sdcorejs/design/decisions/<feature>.md` and summarize it inside
`.sdcorejs/design/specs/<feature>.md`.

Include:

```markdown
## Frontend Design Plan

### Subject
- Subject:
- Audience:
- Single job:

### Visual Direction
- One-sentence concept:
- Product-specific rationale:
- Intentional risk:

### Tokens
Use this structure for the token plan. Do not copy placeholder values; in the
actual design plan, replace them with 4-6 subject-specific named colors and real
hex values derived from the brief.

| Token | Role | Hex | Intended use |
|---|---|---:|---|
| <Subject surface name> | Primary page surface | <hex> | Main background |
| <Raised surface name> | Elevated or inset surface | <hex> | Cards, panels, overlays |
| <Primary text name> | Primary text | <hex> | Headlines and body copy |
| <Muted text name> | Secondary text | <hex> | Captions, metadata, helper copy |
| <Accent/action name> | Brand/action accent | <hex> | Primary CTA, key interactive moments |
| <State/focus name> | Status or focus color | <hex> | Focus rings, errors, confirmations, warnings |

### Type
| Role | Typeface / stack | Weight | Usage |
|---|---|---|---|
| Display | <font or system stack> | <weight> | Screen title or key metric |
| Body | <font or system stack> | <weight> | Forms, tables, body copy |
| Utility | <font or system stack> | <weight> | Labels, captions, data |

### Layout
- Desktop:
- Tablet:
- Mobile:

### Signature Element
- The one memorable detail:
- Why it fits this feature:

### Copy Voice
- Register:
- Action naming:
- Empty/error guidance:
```

Token rules:

- Use 4-6 named colors with hex values and clear roles.
- For Core UI portals, map tokens to existing app variables or utility classes
  when possible; mark new visual tokens as `candidate`.
- Do not use a one-note palette dominated by a single hue family.
- Do not default to warm cream plus serif, near-black plus acid accent, or
  broadsheet newspaper styling unless the brief truly calls for it.
- Color choices must be usable, not just attractive. In the design plan,
  identify the main text/background, muted text/background, CTA, focus, and
  status-state pairings, and choose values with WCAG AA intent for normal
  interface text wherever practical. Focus indicators must be visible against
  both the component and surrounding surface. Status, error, warning, and
  success states must not rely on color alone; pair color with text, iconography,
  shape, pattern, or explicit state labels.
- Pick type roles deliberately. If custom fonts are unavailable, describe the
  intended system stack and type treatment instead of inventing unavailable
  assets.
- Typeface and asset choices in the design plan are candidate handoff decisions
  unless the brief explicitly authorizes implementation changes. When modifying
  an existing codebase, do not add new font files, external font imports, image
  assets, icon packs, motion libraries, or visual dependencies solely to satisfy
  the art direction without approval. Provide an approved-asset or system-font
  fallback when proposing a new visual asset.

### Pass 2 - Critique And Revise

Before producing final handoff artifacts, review the plan against the brief:

- Generic check: would the same plan fit a different CRUD feature with only the
  entity name changed?
- Subject check: does the signature element come from the feature's real domain
  or workflow?
- Restraint check: is boldness concentrated in one place while the rest stays
  disciplined?
- Operational check: for portals, does the UI remain fast to scan, compare,
  filter, edit, and repeat?
- Copy check: do labels and actions use words users recognize instead of system
  internals?

If any check fails, revise the design plan and record:

```markdown
## Design Critique
- Initial issue:
- Revision made:
- Why the revised direction fits better:
```

Do not move to implementation planning until the design direction is coherent
enough to guide frontend code.

## Layout Guidance

Structure is information:

- Use sequence markers only when order matters.
- Use grouping, section titles, tabs, filters, and table density to reveal how
  users think about the workflow.
- Reserve hero-scale type for true first-viewport hero experiences. Inside
  portals, use compact headings, clear actions, and stable page regions.
- Give tables, forms, toolbars, boards, and repeated items stable dimensions so
  state changes do not resize the layout unexpectedly.
- Include empty, loading, error, permission-denied, create, edit, detail, and
  success feedback states when they affect the workflow.

For admin/portal screens:

- Prefer a full-width work surface with constrained inner content or clear page
  bands, not nested decorative cards.
- Keep repeated item cards to 8px radius or less unless the existing design
  system requires otherwise.
- Use icon buttons for familiar tools and clear text buttons for commands where
  the action must be explicit.
- Show dense but readable data. Do not hide core work behind oversized hero
  sections or marketing copy.

## Motion And Interaction

Motion should serve the subject:

- Use one orchestrated interaction or micro-interaction when it clarifies state,
  progress, or hierarchy.
- Respect reduced motion in the design notes.
- Avoid scattered animation that makes the design feel generated rather than
  intentional.
- Describe hover, focus, keyboard, loading, disabled, and optimistic/success
  feedback states in the handoff.

## Copy Guidance

Words are part of the interface:

- Name things from the user's side of the screen, not from implementation.
- Use active, consistent action names: the `Publish` button should lead to
  `Published` feedback, not a different verb.
- Use sentence case unless the product has an established convention.
- Keep labels plain and specific.
- Treat empty states as direction: say what is missing and what to do next.
- Treat errors as diagnosis and repair: say what failed and how to recover.
- Do not make errors apologize or speak vaguely.

Preserve the user's runtime language for labels and copy. Keep route paths,
permission codes, component names, and identifiers in English.

## Implementation Governance

When building, express the approved color and type decisions as reusable design
tokens, preferably CSS variables or the project's existing token mechanism, and
derive component styles from those tokens rather than scattering raw hex values
and one-off font declarations through the stylesheet.

## Handoff Requirements

Read `_refs/shared/frontend-architecture.md` and use its route/page,
feature-local, shared/design-system, responsibility, state, and data-boundary
vocabulary. The design handoff informs implementation planning; it does not
replace codebase discovery.

Every design handoff should tell frontend executors:

- What source artifact each screen/state traces to.
- Which visual direction and token roles to follow.
- Which existing design-system or Core UI components are preferred.
- Which copy, states, responsive rules, accessibility notes, and interaction
  details are authoritative.
- Which decisions are confirmed, inferred, or still open.

Include both maps below in `.sdcorejs/design/specs/<feature>.md`:

```markdown
## Implementation Component Map

| UI region | Component | Classification | Existing path/candidate | State owner | Status |
|---|---|---|---|---|---|
| Page shell | <PageName> | Route/page container | <path, candidate, or unknown> | Page | confirmed / candidate / unknown / new |
| <region> | <ComponentName> | Feature-local / existing shared / design-system / interactive island | <path, candidate, or unknown> | <owner> | confirmed / candidate / unknown / new |

## Data and Interaction Map

| Component | Receives | Emits | Data source | Loading/error owner | Status |
|---|---|---|---|---|---|
| <component> | <inputs/props/content> | <events/actions> | <page/service/query/unknown> | <owner/unknown> | confirmed / candidate / unknown / new |
```

Classify cohesive feature regions even when they are used on one screen only.
Do not promote every region into shared UI, and do not split trivial markup into
components. When codebase evidence exists, name the exact reuse candidate/path.
When it does not, use `candidate` or `unknown`; do not invent a folder, provider,
service, declaration, route registration, or public export.

PNG previews are optional evidence. Editable specs and wireframes remain the
source of truth.
