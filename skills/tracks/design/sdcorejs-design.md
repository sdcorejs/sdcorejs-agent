---
name: sdcorejs-design
description: Design-track executor for UI/UX design and improvements, mobile app/mobile web design, wireframes, mockups, screen flows, PNG previews, and frontend handoff from product stories. Use for new or existing UI design; independent audits/findings belong to sdcorejs-review and production code to the implementation executor. Writes existing .sdcorejs/design/ artifacts and .sdcorejs/docs/design/ traceability. Runtime-localized.
required-actions: artifact.read, artifact.write, context.pass, verification.run, progress.create, progress.update, user.choose, user.approve, visual.present, visual.session.start, visual.session.publish, visual.session.read, visual.session.stop
---

# Design Track

## Shared Protocols

Read `_refs/shared/runtime-protocols.md` and `_refs/shared/artifact-lifecycle.md`; load `_refs/shared/design-handoff.md` for durable handoffs.
Resolve track/profile and artifact values from `_refs/shared/system-registry.json`, roots from `_refs/shared/artifact-paths.mjs`, approved spec/plan parents with `_refs/shared/approved-artifact.mjs`, and ownership with `_refs/shared/repository-contract.mjs`.
Emit `artifact_context` for every design artifact and ledger written. Never rebuild a Design path by hand.

Use the schema-2 payload example in `_refs/shared/design-handoff.md` as the
single handoff schema. `validateDesignHandoff` checks structure only.
`verifyDesignHandoff` in `_refs/shared/design-verification.mjs` reads actual
approved parents and Design approval through a trusted host runtime, then
checks current content and applicable evidence. Keep structural, parent,
approval/review, and rendered/interaction results separate. Missing verifier
or evidence is a limitation/blocker, never a PASS.

## Purpose
Create FE handoff artifacts from product intent. The output should let Angular/Next.js executors implement screens without guessing layout, states, copy, interactions, or responsive behavior.

Design does not write production code, replace a spec/plan, mutate an approved
artifact, invent behavior outside approved requirements, or create module code.

PNG generation is feasible, but a PNG alone is not a reliable source of truth. For exact FE implementation, always pair PNG previews with editable design artifacts and a written handoff spec.

Before designing UI from PRDs, user stories, acceptance criteria, or rough
feature briefs, read `_refs/design/frontend-design.md`. Use it to create a
compact visual direction grounded in existing tokens, copy voice, and
self-critique before writing final design specs or wireframes.

For frontend handoff, also read `_refs/shared/frontend-architecture.md`. Use
repository evidence to produce an implementation-oriented component/data/
interaction map. Design may propose `candidate` boundaries, but it must not claim
exact code paths, providers, or public exports are `confirmed` when the target
codebase has not been inspected.

When the target surface is a mobile app, PWA, responsive mobile web experience,
or explicitly mobile-first screen/flow, also read
`_refs/design/mobile-design.md`. Use it to add mobile context, platform fit,
touch ergonomics, navigation, mobile state coverage, and implementation
governance to the handoff.

## Step 0 - Context preflight

Before mapping stories to screens, assemble read-only `project_context`.

- For an existing app/site, use valid summary sections when present. Missing or
  stale summary does not block design; continue with targeted reads or a scoped
  code map. Do not refresh merely because design execution is write-approved.
- For greenfield design before any app scaffold exists, continue from product
  docs and approved specs/plans, but mark UI component choices as `candidate`
  until frontend/backend source evidence exists. Record the absent baseline only
  through the approved no-baseline record in `_refs/shared/design-handoff.md`.
- If the summary conflicts with product stories, acceptance criteria, or current
  user attachments, surface the conflict instead of silently choosing one source.

## Existing Design First

Before inventing a visual direction, inspect the project's existing interface
and treat it as the primary design source of truth for both new UI inside an
existing project and redesign work. Reuse established components, design tokens,
CSS variables, Tailwind/theme settings, typography scale, color palette,
spacing/radius/shadow conventions, icon and illustration style, layout patterns,
existing pages/screens, accessibility conventions, and interaction patterns
wherever they exist.

Only fall back to inferred design direction when the codebase or brief does not
provide enough design evidence. When inference is necessary, state the
assumption, keep it compatible with the surrounding product context, and avoid
introducing new fonts, external assets, icon packs, motion libraries, color
systems, visual dependencies, or a parallel design system without explicit
brief or project-owner approval.

## Task-focused UI/UX knowledge

Read `_refs/design/uiux/index.md` and select only references for the affected
surface, task and topics. For existing UI improvements, begin with the observed
problem and preserve business behavior, route/permission logic, tokens and icon
family. For new screens, reuse the surrounding design before proposing missing
roles. A small spacing/focus improvement may use the bounded path from
`sdcorejs-using-skills`; it does not require a full design system or a new durable
handoff. If a durable handoff is requested, its existing approval, resolver and
lifecycle gates still apply. Independent review belongs to `sdcorejs-review`; critique here improves the author's own design.

Before presenting or settling an open layout/flow decision, including direct
Design entry, apply `_refs/sdlc/visual-offer-policy.md`: actively assess and
invite at the first useful visual comparison. Preserve `visual_companion`
identity, pending/accepted/declined scope and consent through handoffs; restore
and forward portable `state_delta.visual_companion`. A direct
preview request proceeds to a supported surface without another invitation;
fixed or approved designs stay settled. Load the detailed companion lifecycle
only when preparing that surface or its required consent.

## Inputs

Load what exists, in this order:

1. `.sdcorejs/product/prds/<feature>.md`
2. `.sdcorejs/product/user-stories/<feature>.md`
3. `.sdcorejs/product/acceptance-criteria/<feature>.md`
4. `.sdcorejs/product/uat-checklists/<feature>.md`
5. Approved specs/plans from `.sdcorejs/specs/` and `.sdcorejs/plans/`
6. Existing design docs under `.sdcorejs/design/`
7. Existing frontend conventions from `frontend/` or `_refs/angular/` / `_refs/nextjs/` when the target stack is known
8. Frontend design guidance from `_refs/design/frontend-design.md` when the
   work includes UI layout, visual direction, copy, or frontend handoff
9. Mobile design guidance from `_refs/design/mobile-design.md` when the target
   surface includes a mobile app, PWA, responsive mobile web, or mobile-first
   flow
10. Legacy root-level `product/` or `design/` documents only as a read-only
    compatibility fallback when no canonical `.sdcorejs` equivalent exists. See
    [Legacy Layout Compatibility](#legacy-layout-compatibility).

Resolve every Design read through `resolveDesignArtifactSources` in
`_refs/shared/design-handoff.mjs` so canonical locations always win and a legacy
fallback is explicit.

If product stories or acceptance criteria are missing, write only an exploratory design draft and mark requirements as `inferred - needs confirmation`.

## Output Paths

Resolve schema-2 `experience_kind` and the registry semantic owner before any output path:

- `module` design belongs in the module repository; an unavailable/unwritable
  owner blocks and portal fallback is forbidden.
- `portal-shell` and `portal-composition` belong in the portal repository.
- `cross-module` belongs to one explicit portal/integration owner and references
  module handoffs using immutable repository/artifact/path/revision/hash
  identities. Never duplicate an editable module handoff.
- `standalone` belongs to a standalone website/app repository; use repository scope.
- `component-library` belongs to its library repository, including
  `sdcorejs/angular`; do not pretend it is a module or portal.

All owners must be available and writable. Separate these experience kinds
from `owner_repository_role` in the registry; do not create another role enum.

Obtain the complete path bundle from `resolveDesignHandoffTarget` in
`_refs/shared/design-handoff.mjs`. For a feature in the resolved owner:

```text
<semantic-owner-repository>/.sdcorejs/design/
  flows/<kebab-feature>.md
  specs/<kebab-feature>.md
  decisions/<kebab-feature>.md
  wireframes/<kebab-feature>/<screen>.html
  wireframes/<kebab-feature>/<screen>.svg
  exports/png/<kebab-feature>/<screen>.png
  references/<kebab-feature>/<screen>.png

<semantic-owner-repository>/.sdcorejs/docs/design/<kebab-feature>.md
```

Root-level `design/**` is never a write target. It is a read-only compatibility
input only.

Path roles:

| Artifact | Canonical location |
|---|---|
| Frontend design plan and critique | `.sdcorejs/design/decisions/<feature>.md` |
| Mobile design plan | `.sdcorejs/design/decisions/<feature>.md` |
| Screen flow | `.sdcorejs/design/flows/<feature>.md` |
| Handoff spec | `.sdcorejs/design/specs/<feature>.md` |
| Editable wireframe source | `.sdcorejs/design/wireframes/<feature>/<screen>.html` or `.svg` |
| Generated PNG export | `.sdcorejs/design/exports/png/<feature>/<screen>.png` |
| Real product screenshot reference | `.sdcorejs/design/references/<feature>/<screen>.png` |
| Design ledger | `.sdcorejs/docs/design/<feature>.md` |
| Generated diagnostic or failure capture | `.sdcorejs/design/diagnostics/**`, always `local_only` |

When authoring a handoff, choose the editable wireframe source with the rules
in `_refs/design/handoff-authoring.md`.

## Workflow

Before creating or updating a durable handoff, read
`_refs/design/handoff-authoring.md`. It owns the frontend design plan, the
story-to-screen map, the design spec template, editable wireframes, PNG export
and image provenance. Run its steps in order: 0 design plan, 1 screen map,
2 design spec, 3 editable wireframes, 4 PNG export when requested or useful.
Then write the ledger below.

### 5. Write the design ledger

Write the ledger at `.sdcorejs/docs/design/<feature>.md` using the canonical
schema-2 JSON handoff in `_refs/shared/design-handoff.md`. Its metadata path is
the ledger; flow/spec/decisions remain `design-asset` files. Record traceability
and FE handoff notes in those documents and include their actual content hashes.
The ledger's approved-artifact envelope retains approval schema 1; that is
separate from the schema-2 handoff in its body. Use the existing approval owner
and canonical approved-artifact helper; never fabricate approval fields or
rewrite an immutable approved ledger. A new approval uses the existing revision
lifecycle and independently pinned reference.

An exploratory draft may lack approved parents when exploration authority is
explicit. Keep `lifecycle.state: draft`; it is never an implementation contract.
A reviewed handoff requires actual approved spec/plan parents and loaded Design
approval. Material changes return to the decision/approval owner. A bounded
spacing change may reuse the existing approved scope only after the trusted
host reviews actual current content and refreshes affected evidence. Payload
labels or Visual Companion feedback cannot grant that review authority.

Derive required responsive surfaces from approved requirements and target.
Record a reason for approved `not-applicable` surfaces. Designed behavior,
rendered wireframe checks and interaction checks are distinct: required missing
receipts remain gaps. Do not assert desktop/tablet/mobile were all checked.
Generate real command/capture receipts with current fingerprints; same HEAD
alone does not keep evidence current. Confirmed component mappings require
actual source reads with repository, path, revision and content hash.

Emit this ledger plus every created or updated spec, flow, decision log, editable
wireframe, durable export, and approved screenshot reference in
`artifact_context.required_with_change`. Build that block with
`buildDesignArtifactContext`:

Every `.sdcorejs/design/**` document, wireframe, export, and reference plus the
`.sdcorejs/docs/design/<feature>.md` ledger belongs in `required_with_change`
with `kind: design-asset` or `kind: design-handoff`. Generated diagnostics under
`.sdcorejs/design/diagnostics/**` stay `local_only`. Emitting only the ledger is
a contract violation.

## Legacy Layout Compatibility

Older target projects keep Design artifacts in a root-level `design/**`
directory. That layout is a read-only compatibility input; it is never a write
target.

1. New writes always use `.sdcorejs/design/**`.
2. Canonical paths are preferred for reads; a legacy path is read only when no
   canonical equivalent exists, and never duplicated into a silent second copy.
3. Updating a legacy-only artifact migrates that feature bundle to
   `.sdcorejs/design/**` in the same approved change and updates every internal
   reference. Unrelated historical artifacts are never bulk-migrated.
4. Equivalent canonical/legacy copies retire the legacy copy; conflicting copies
   block, and competing Design sources are never silently merged.
5. Portal fallback stays forbidden, and ownership, artifact identity, source
   revisions, approval hashes, artifact hashes, image provenance, and
   `supersedes` semantics survive the move.
6. A legacy path is never valid in newly generated metadata;
   `validateDesignHandoff` rejects it with `LEGACY_DESIGN_ARTIFACT_PATH`.

The full matrix lives in `_refs/shared/design-handoff.md`.

Use `planDesignArtifactMigration` in `_refs/shared/design-handoff.mjs`. It
returns `not-required`, `migration-required`, or `blocked` plus the exact
`migrations`, `retirements`, `conflicts`, and blockers.

## Rules

### Must Do

- Preserve the user's language for user-facing labels and copy.
- Keep identifiers, route paths, permission codes, and component names in English.
- Link every screen to user story and acceptance criterion IDs when available.
- Read and apply `_refs/design/frontend-design.md` before producing UI
  handoff artifacts from PRDs or user stories.
- Read and apply `_refs/shared/frontend-architecture.md` for frontend handoff;
  include the implementation component map and data/interaction map without
  overstating unsupported code-level details.
- Read and apply `_refs/design/mobile-design.md` before producing mobile app,
  PWA, responsive mobile web, or mobile-first handoff artifacts.
- Record the frontend design plan, token source references, justified deviations, and critique
  in `.sdcorejs/design/decisions/<feature>.md`.
- Record the mobile design plan, target surface, ergonomics, mobile state
  coverage, platform notes, and implementation-governance constraints in
  `.sdcorejs/design/decisions/<feature>.md` when mobile applies.
- Produce editable design source before PNG export.
- Validate editable source, static visual classification, real screenshot
  provenance, responsive coverage, evidence-aware component mapping, existing
  design-system reuse, and cross-repository references through
  `_refs/shared/design-handoff.mjs`.
- Preserve approved spec/plan identities and hashes as parent references.
- Verify PNG files exist before claiming they were generated.
- Mark inferred design decisions clearly when product inputs are incomplete.
- Keep design docs in the target project, never in `sdcorejs-agent` unless that repo is explicitly the target.
- Write every Design artifact under `.sdcorejs/design/**` and every ledger under
  `.sdcorejs/docs/design/**`.
- Resolve paths through `resolveDesignHandoffTarget`; never hardcode a Design
  root in prose, metadata, or output.
- Report canonical paths in every handoff report, ledger link, and final
  response, including any legacy compatibility read that was used.

### Must Not

- Generate production FE code; hand off to `sdcorejs-angular` or `sdcorejs-nextjs` for implementation.
- Create or update a root-level `design/**` path.
- Emit a root-level `design/**` path in new or updated metadata, reports, or
  links.
- Keep an editable legacy copy alongside an equivalent canonical copy.
- Silently merge conflicting canonical and legacy Design sources.
- Treat a generated diagnostic, failure capture, trace, or video as a durable
  handoff artifact.
- Bypass the approved spec/plan, mutate approved artifacts, or expand
  implementation authority.
- Write a module handoff into the portal or duplicate an editable cross-repo
  handoff.
- Treat a PNG as the only handoff artifact.
- Use AI-generated raster text as authoritative UI copy.
- Invent product requirements to make a design look complete.
- Mark an exact implementation path, provider scope, or public export as
  confirmed when repository evidence is absent.
- Add new rendering dependencies without user approval.
- Claim a design is approved without explicit user approval.

## Cross-references

- `sdcorejs-product` - source of PRDs, user stories, acceptance criteria, and UAT under `.sdcorejs/product/**`.
- `_refs/shared/artifact-paths.mjs` - single canonical source for Product and Design roots.
- `_refs/design/frontend-design.md` - visual direction, token plan, copy voice, and self-critique guidance for UI handoff.
- `_refs/shared/frontend-architecture.md` - framework-neutral component,
  responsibility, state, data, registration, and public API vocabulary for handoff.
- `_refs/design/mobile-design.md` - mobile-first context, platform, ergonomics, state coverage, and implementation-governance guidance.
- `sdcorejs-execute-plan` - routes approved design plans here.
- `sdcorejs-parallel-dispatch` - can run Design as one role in full-stack role split.
- `sdcorejs-angular` / `sdcorejs-nextjs` - consume `.sdcorejs/design/specs/**` and `.sdcorejs/design/wireframes/**` during FE implementation.
- `sdcorejs-test` - maps UAT/e2e coverage back to designed flows.

## Design and UI review integration

Design owns artifacts and self-critique. Self-critique does not satisfy independent review. When requested or workflow-authorized, sdcorejs-review purpose design-artifact assesses requirements/AC against flows/screens/states/copy/responsive/accessibility/component mapping via _refs/shared/ui-review.md. It may assess an authorized candidate before Design approval and does not grant implementation authority. Use a separate reviewer context when available; disclose missing separation. Model/provider diversity is not a requirement. Visual Companion feedback still does not replace approval.
