---
name: sdcorejs-design
description: Design-track executor for FE handoff artifacts. Use for UI/UX design, wireframes, mockups, screen flows, PNG previews, design from product stories, or design review before frontend implementation. Writes design/ specs/flows/wireframes/exports and .sdcorejs/docs/design/ traceability; no production code. Runtime-localized.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Design Track


## Shared Protocols

Before executing this skill:
1. Read and apply `_refs/shared/tasklist.md` for non-trivial execution tasks.
2. Read and apply `_refs/shared/persona.md` if a project persona exists.
3. Read and apply `_refs/shared/project-context.md` for project memory, resume checkpoints, summaries, specs/plans, tasks, and relevant memories.
4. Current user request, current files, diffs, logs, failing tests, and command output override stored context.

## Purpose
Create FE handoff artifacts from product intent. The output should let Angular/Next.js executors implement screens without guessing layout, states, copy, interactions, or responsive behavior.

PNG generation is feasible, but a PNG alone is not a reliable source of truth. For exact FE implementation, always pair PNG previews with editable design artifacts and a written handoff spec.

## Step 0 - Context preflight

Before mapping stories to screens, run `sdcorejs-explore (summary mode)` through
`_refs/shared/project-context.md`.

- For an existing app/site, ensure `<target>/.sdcorejs/summary.md` exists or is
  refreshed so the design uses the real route structure, modules, component
  conventions, permissions, and target stack.
- For greenfield design before any app scaffold exists, continue from product
  docs and approved specs/plans, but mark UI component choices as `candidate`
  until the frontend/backend summary exists.
- If the summary conflicts with product stories, acceptance criteria, or current
  user attachments, surface the conflict instead of silently choosing one source.

## Inputs

Load what exists, in this order:

1. `product/prds/<feature>.md`
2. `product/user-stories/<feature>.md`
3. `product/acceptance-criteria/<feature>.md`
4. `product/uat-checklists/<feature>.md`
5. Approved specs/plans from `.sdcorejs/specs/` and `.sdcorejs/plans/`
6. Existing design docs under `design/`
7. Existing frontend conventions from `frontend/` or `_refs/angular/` / `_refs/nextjs/` when the target stack is known

If product stories or acceptance criteria are missing, write only an exploratory design draft and mark requirements as `inferred - needs confirmation`.

## Output Paths

For a feature:

```text
<target-project>/design/
  flows/<kebab-feature>.md
  specs/<kebab-feature>.md
  wireframes/<kebab-feature>/<screen>.html
  wireframes/<kebab-feature>/<screen>.svg
  exports/png/<kebab-feature>/<screen>.png
  decisions/<kebab-feature>.md

<target-project>/.sdcorejs/docs/design/<YYYY-MM-DD-HH-mm>-<kebab-feature>.md
```

Use whichever editable wireframe source best fits the target:

- `html` for implementation-ready FE handoff and screenshot-to-PNG.
- `svg` for static wireframes that need no runtime.
- PNG export only after a renderer actually produces the file.

## Workflow

### 1. Map stories to screens

Create a screen map:

| User Story | Screen | State | Primary Action | Notes |
|---|---|---|---|---|
| US1 | Class list | empty / loading / data / error | Create class | |

Cover at minimum:

- entry screen
- create/edit/detail states
- empty/loading/error/permission-denied states
- mobile and desktop behavior when the feature is user-facing
- UAT scenarios that need visual confirmation

### 2. Write the design spec

Write `design/specs/<feature>.md`:

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

## Components
| Need | Preferred component | Notes |
|---|---|---|

## States
| Screen | State | Behavior |
|---|---|---|

## Copy
<labels, buttons, empty states, validation messages>

## Responsive Rules
<desktop/tablet/mobile notes>

## Accessibility
<keyboard order, labels, contrast, focus, error messaging>

## Open Questions
```

For SDCoreJS Angular, prefer Core UI components and name expected components in the spec. If the Core UI fit is unknown, say `candidate` instead of inventing an API.

### 3. Produce editable wireframes

Write one HTML or SVG per important screen/state. Keep them plain and implementation-oriented:

- use realistic product labels from user stories
- show important tables/forms/actions
- include stable dimensions for desktop and mobile frames
- avoid decorative marketing art for operational tools
- include `data-story`, `data-ac`, or comments that link the wireframe section back to product IDs

### 4. Export PNG when requested or useful

Preferred PNG pipeline:

1. Render the HTML/SVG wireframe locally.
2. Screenshot/export to `design/exports/png/<feature>/<screen>.png`.
3. Verify the file exists and is non-empty.
4. Link the PNG from the design spec and `.sdcorejs/docs/design/` ledger.

Use project tooling if available. If Playwright or another browser renderer is already installed, use it. If no renderer is available, ask before adding dependencies; otherwise leave the editable HTML/SVG and mark PNG export as pending.

If an image-generation tool is available and the user explicitly wants high-fidelity visual concepts, it can create concept PNGs. Treat those as mood/reference only. Do not rely on AI-raster text for exact labels, tables, or form fields; exact UI text belongs in the design spec and editable wireframe source.

### 5. Write the design ledger

Write `.sdcorejs/docs/design/<timestamp>-<feature>.md`:

```markdown
---
feature: <kebab-feature>
status: draft | reviewed | approved | partial
sourceUserStories: <path>
sourceAcceptanceCriteria: <path>
updatedAt: <ISO-8601 timestamp>
---

# Design Ledger - <Feature>

## Outputs
- Spec:
- Wireframes:
- PNG exports:

## Traceability
| User Story | Acceptance Criteria | Design Artifact | Status |
|---|---|---|---|

## FE Handoff Notes
- <implementation notes for frontend track>

## Open Questions
- <question or None>
```

## Rules

### Must Do

- Preserve the user's language for user-facing labels and copy.
- Keep identifiers, route paths, permission codes, and component names in English.
- Link every screen to user story and acceptance criterion IDs when available.
- Produce editable design source before PNG export.
- Verify PNG files exist before claiming they were generated.
- Mark inferred design decisions clearly when product inputs are incomplete.
- Keep design docs in the target project, never in `sdcorejs-agent` unless that repo is explicitly the target.

### Must Not

- Generate production FE code; hand off to `sdcorejs-angular` or `sdcorejs-nextjs` for implementation.
- Treat a PNG as the only handoff artifact.
- Use AI-generated raster text as authoritative UI copy.
- Invent product requirements to make a design look complete.
- Add new rendering dependencies without user approval.
- Claim a design is approved without explicit user approval.

## Cross-references

- `sdcorejs-product` - source of PRDs, user stories, acceptance criteria, and UAT.
- `sdcorejs-execute-plan` - routes approved design plans here.
- `sdcorejs-parallel-dispatch` - can run Design as one role in full-stack role split.
- `sdcorejs-angular` / `sdcorejs-nextjs` - consume design specs and wireframes during FE implementation.
- `sdcorejs-test` - maps UAT/e2e coverage back to designed flows.

<!-- response-style: auto-injected by sync-skills; do not edit mirror by hand -->

**Response style (terse mode active for this skill - reduces token usage):**

While executing this skill:

- Drop articles (a/an/the), filler (just/really/basically/simply/actually), pleasantries (sure/of course/happy to), hedging.
- Fragments OK. Short synonyms (fix not "implement solution for", big not "extensive").
- Pattern: `[thing] [action] [reason]. [next step].`
- Technical terms exact. Error strings quoted verbatim. **Code, commits, PRs, file content: write normal - no caveman inside generated artifacts.**
- Auto-clarity: drop terse mode for security warnings, irreversible action confirmations, multi-step sequences where fragment order risks misread, or when user asks to clarify. Resume terse after the clear part is done.
- If user types "stop caveman" or "normal mode", revert to standard prose for the rest of the session.
