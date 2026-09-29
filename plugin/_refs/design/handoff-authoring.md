# Design Handoff Authoring

Read this reference only when creating or updating a durable Design handoff,
after context preflight, existing-design inspection and ownership resolution
in `sdcorejs-design`. It owns authoring detail; approval, evidence and
closure boundaries stay in the skill body.

## Paths

The canonical path tree, path-role table and the `resolveDesignHandoffTarget`
requirement stay in `sdcorejs-design`.

Use whichever editable wireframe source best fits the target:

- `html` for implementation-ready FE handoff and screenshot-to-PNG.
- `svg` for static wireframes that need no runtime.
- PNG export only after a renderer actually produces the file.

## Authoring steps

### 0. Create the frontend design plan

When the request includes UI design, author self-critique, wireframes, mockups, or a
frontend handoff from product artifacts, read `_refs/design/frontend-design.md`
before mapping screens.

Write a compact design plan and critique into
`.sdcorejs/design/decisions/<kebab-feature>.md`, then summarize the confirmed parts in
`.sdcorejs/design/specs/<kebab-feature>.md`. The plan must cover:

- subject, audience, and single job
- visual direction and product-specific rationale
- existing token/style source references and any evidenced missing roles
- existing type roles or available system stacks
- desktop/tablet/mobile layout concept
- a distinctive detail only when it helps the task; preserving the current UI is valid
- copy voice for actions, empty states, and errors
- self-critique against task effectiveness, selected UI/UX rules and existing conventions
- implementation component map covering route/page, feature-local, existing
  shared/design-system, and interactive-island candidates
- data and interaction map covering inputs, events, data source, and loading/
  error ownership

For Core UI portals, keep the direction compatible with the existing shell,
utility classes, component library, and operational density. Distinctive portal
design should improve recognition, scanning, and task flow; it must not replace
the app shell with a marketing layout.

When the target is mobile, also read `_refs/design/mobile-design.md` and add a
mobile design plan to `.sdcorejs/design/decisions/<kebab-feature>.md`. The mobile plan
must cover target surface, mobile context of use, navigation model, primary
action placement, touch/gesture/keyboard/safe-area notes, mobile state coverage,
dynamic type or zoom behavior, reduced motion, and no-new-dependency fallbacks
for candidate assets or interaction libraries.

### 1. Map stories to screens

Create a screen map:

| User Story | Screen | State | Primary Action | Notes |
|---|---|---|---|---|
| US1 | Class list | empty / loading / data / error | Create class | |

Cover at minimum:

- entry screen
- create/edit/detail states
- empty/loading/error/permission-denied states
- mobile-specific offline, poor-network, permission-denied, interrupted,
  backgrounded/resumed, dynamic-type/zoom, and small/large phone states when
  the target surface is mobile
- mobile and desktop behavior when the feature is user-facing
- UAT scenarios that need visual confirmation

### 2. Write the design spec

Write `.sdcorejs/design/specs/<feature>.md`:

```markdown
# Design Spec - <Feature>

## Source
- PRD:
- User stories:
- Acceptance criteria:

## Screens
| Screen | Route | Purpose | User Stories | Acceptance Criteria |
|---|---|---|---|---|

## Layout
<screen-by-screen structure, hierarchy, key controls>

## Frontend Design Plan
<visual direction, source token/type references, justified deviations, copy voice, and critique summary from .sdcorejs/design/decisions>

## Mobile Design Plan
<target surface, mobile context, navigation, reachability, safe-area/keyboard, gesture alternatives, mobile states, and platform notes when relevant>

## Components
| Need | Preferred component | Notes |
|---|---|---|

## Implementation Component Map
| UI region | Component | Classification | Existing path/candidate | State owner | Status |
|---|---|---|---|---|---|

Use `confirmed`, `candidate`, `unknown`, or `new`. Mark paths `candidate` or
`unknown` unless repository evidence supports them.

## Data and Interaction Map
| Component | Receives | Emits | Data source | Loading/error owner | Status |
|---|---|---|---|---|---|

## States
| Screen | State | Behavior |
|---|---|---|

## Copy
<labels, buttons, empty states, validation messages>

## Responsive Rules
<approved applicable surface behavior; include safe-area, keyboard, touch target, reachability, small/large phone, dynamic type/zoom, and reduced-motion notes when mobile applies>

## Accessibility
<keyboard order, labels, contrast, focus, error messaging>

## Open Questions
```

For SDCoreJS Angular, prefer Core UI components and name expected components in the spec. If the Core UI fit is unknown, say `candidate` instead of inventing an API.

For greenfield work with no existing UI or design system, the approved spec
declares `design_requirements.design_baseline: { kind: none, reason }`. Record
`design_system_reuse.no_baseline` with that reason and the verified spec
reference, leave `evidence_refs` empty, and keep every mapping `candidate`,
`unknown` or `new`. Without that approved declaration, cite real sources; see
`_refs/shared/design-handoff.md`.

### 3. Produce editable wireframes

Write one HTML or SVG per important screen/state into
`.sdcorejs/design/wireframes/<feature>/<screen>.html` or `.svg`. Keep them plain
and implementation-oriented:

- use realistic product labels from user stories
- show important tables/forms/actions
- reflect the confirmed frontend design plan, including token roles, type
  hierarchy, existing visual conventions, copy voice, and interaction states
- reflect the confirmed mobile design plan when relevant, including safe areas,
  keyboard space, reachable primary actions, gesture alternatives, and
  interruption/offline/permission states
- include stable dimensions for the surfaces required by approved requirements
- avoid decorative marketing art for operational tools
- include `data-story`, `data-ac`, or comments that link the wireframe section back to product IDs

### 4. Export PNG when requested or useful

Preferred PNG pipeline:

1. Render the HTML/SVG wireframe locally.
2. Screenshot/export to `.sdcorejs/design/exports/png/<feature>/<screen>.png`.
3. Verify the file exists and is non-empty.
4. Link the PNG from the design spec and `.sdcorejs/docs/design/` ledger.

Classify generated static images as `generated-mockup` or `illustration` and
bind them to the editable-source artifact hash. A real application capture is
`real-product-screenshot`, is stored under
`.sdcorejs/design/references/<feature>/<screen>.png`, and must carry repository
ID, source/app revisions, capture evidence ID/timestamp, and content hash. Never
present a generated image as a real product screenshot.

Durable PNG files participate in artifact closure as opaque bytes. They are
classified from their canonical path, runtime `artifact_context`, the Design
ledger relationship for the same feature, their content hash, and their declared
provenance. They are never parsed as Markdown, scanned as UTF-8 text, or printed.
Failure captures, traces, videos, auth/storage state, caches, and temporary
renderer output stay `local_only`; put them under
`.sdcorejs/design/diagnostics/**`.

Use project tooling if available. If Playwright or another browser renderer is
already installed, use it. If no renderer is available, apply
`_refs/shared/user-choice-prompt.md` before adding dependencies:
`1. Add renderer dependency` / `2. Leave PNG export pending`.

If an image-generation tool is available and the user explicitly wants high-fidelity visual concepts, it can create concept PNGs. Treat those as mood/reference only. Do not rely on AI-raster text for exact labels, tables, or form fields; exact UI text belongs in the design spec and editable wireframe source.

If the target editable surface is unavailable, record the concrete limitation,
leave the editable-source result blocked/limited, and do not claim editable
source pass. A PNG alone never satisfies the handoff.
