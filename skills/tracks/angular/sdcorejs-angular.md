---
name: sdcorejs-angular
description: Angular Core UI executor for approved implementation in new or existing @sdcorejs/angular and @sd-angular/core apps, covering portal init, CRUD/list/detail/form/action scope, explicit technical prototypes, or approved migration. Optional admin/auth packs require approved scope. Bounded authorized fixes use the shared fast-fix policy. Do not use Core UI generation for plain Angular apps or non-trivial work without verified scope; route those through the governed workflow first. Runtime-localized.
required-actions: artifact.read, artifact.write, context.pass, verification.run, progress.create, progress.update, user.choose, user.approve, web.fetch, visual.present
---

# 07 — Write Code (Orchestrator)

## Approval preflight — first action, fail closed

First classify scope and risk using `_refs/shared/session-authority.md` and
`classifyTask` in `_refs/harness/runtime-policy.mjs`. A bounded authorized
low-risk fix may inspect the project, preserve the installed stack and perform
targeted edits, focused tests and concise review without spec/plan artifacts.
Plain Angular uses the generic harness and existing libraries, never Core UI
installation by inference. Permission/tenant/public-contract changes are not
fast-fixes merely because the diff is small.

For non-trivial work, locate and verify the approved spec, plan and required
`frontend_architecture` before implementation-reference reads or writes. The
verbs `implement`, `build` or `create` alone are not document approval. Explicit
delegation of spec/plan authoring and execution follows the session authority
policy and records its real provenance. Missing required authority keeps the
affected writes read-only; continue independent discovery needed to resolve it.
A fixture, lab or disposable repository does not bypass the risk/authority gate.

For unresolved visual decisions, apply `_refs/sdlc/visual-offer-policy.md`;
forward `requirement_context.visual_companion` through `context.pass`
(portable `state_delta.visual_companion`) to the owning workflow.

## Shared Protocols

Read `_refs/shared/runtime-protocols.md` and `_refs/shared/artifact-lifecycle.md`; merge producer `artifact_context` through the finishing tail.

## Purpose

Generate SDCoreJS/Core UI Angular portal code from an approved `sdcorejs-execute-plan`
and confirmed Core UI portal scope, producing complete CRUD entity code:
- Domain and transport contracts where required (DTO, SaveReq, validators)
- Data-access services and justified feature collaborators
- Lazy route/page containers
- Feature-local components derived from cohesive responsibilities
- Reused shared/Core UI components where justified
- Workflow / bulk / custom action buttons

List and detail route containers are minimum screen boundaries, not a maximum component count. A route must not own all summary, filters, result table, selection, bulk actions, and workflow responsibilities; the approved architecture must name meaningful feature-local boundaries.
A simple cohesive screen may remain one page component; shared or public promotion requires stronger ownership and consumer evidence. Feature-local extraction does not require multiple consumers.

## Eligibility preflight

Before reading any Angular write-code reference or generating files, classify the
target project using the same vocabulary as `sdcorejs-execute-plan`:

| Classification | This skill behavior |
|---|---|
| `core-ui-angular` | Continue. Use `@sdcorejs/angular` imports and fetch version-matched Core UI docs with `--require-installed`. |
| `legacy-core-ui-angular` | Continue. Preserve `@sd-angular/core` imports and fetch version-matched Core UI docs with `--require-installed`. |
| New SDCoreJS portal creation | Continue through `init-portal.md`; use `_refs/angular/core-version.md` as the install/version source before the package exists. |
| Approved `migration-request` | Continue only when the approved spec/plan explicitly includes installing or migrating to SDCoreJS Core UI. |
| `plain-angular` | Stop and return to `sdcorejs-execute-plan` generic harness. Do not fetch Core UI docs, import Core UI APIs, emit Core UI summaries, force admin screens, or assume `src/libs/**/features/**`. |

Plain Angular includes existing Angular apps that have `angular.json`,
`@angular/core`, components, routes, Angular Material, Bootstrap, PrimeNG,
Tailwind, or local/shared components, but do not depend on either
`@sdcorejs/angular` or `@sd-angular/core`. For those projects, reuse existing
local/shared/design-system components first and use installed UI libraries only
when they are already direct dependencies. Ask for explicit approval before
adding `@sdcorejs/angular`, `@sd-angular/core`, or `@angular/material`.

This executor defaults to the `developer` production profile. A user's
nontechnical role, a vague request, or missing backend/design evidence never
switches profiles or authorizes inferred screens, seed data, auth, or admin
features.

For normal feature implementation from PRDs, user stories, or acceptance
criteria, a design handoff is the preferred UI source of truth. The UI preflight
searches `.sdcorejs/design/specs/**` and `.sdcorejs/design/wireframes/**`. If no
matching artifact exists there and the approved execution profile is not
`technical-prototype`, route the work to `sdcorejs-design` first so layout,
states, copy, and visual direction are settled before code generation.

## Explicit `technical-prototype` profile

Enter this profile only when the approved spec/plan or current user request
explicitly opts into the registry profile `technical-prototype`. Record that
approval and its assumptions before writing. A prototype is demo-only and not
production-eligible evidence. Missing API/backend/design may be handled only
inside the approved assumptions; it is never itself a trigger. Do not infer this
profile from PO/BA/nontechnical identity, a PRD, stakeholder notes, or phrases
such as "quick screen" or "show a demo".

Template-first is mandatory for an approved technical prototype:
- New portal: run `init-portal.md` first, preserve the Core UI starter template
  shell/layout/sidebar/permission bootstrap, then add only approved
  module/entity screens inside that baseline.
- Existing portal: extend the existing Core UI portal shell, routes, menu, and
  local component conventions instead of creating a second shell.
- Do not create a parallel custom portal shell, bespoke navigation system,
  landing/dashboard layout, or hand-built list/detail/form primitives when the
  Core UI starter template and screen refs already cover the need.

This skill is an **orchestrator**: it does NOT inline the full generation rules for every file type. It picks the right **reference pack** for each scope item and reads it on demand. The detailed rules + code-template links for each concern live in `_refs/angular/write-code/*.md` (formerly the 10/11/12/20/21/31 sub-skills — consolidated here so the track exposes one skill instead of seven).

## Dispatch table

For each scope item in the approved plan dispatched by
`sdcorejs-execute-plan`, READ the matching reference pack; UI work also reads `_refs/design/uiux/index.md` for focused topics and exact-version Core UI evidence within existing approval/eligibility boundaries:

| Scope item | Reference pack to read |
|---|---|
| New portal (no existing project yet) | [`_refs/angular/write-code/init-portal.md`](_refs/angular/write-code/init-portal.md) (template baseline; run FIRST before any module work) |
| Approved admin/auth/account/role/permission scope only | [`_refs/angular/write-code/admin-screens.md`](_refs/angular/write-code/admin-screens.md) (conditional; never a portal default) |
| New module (`src/libs/<module>/`) | [`_refs/angular/write-code/init-module.md`](_refs/angular/write-code/init-module.md) |
| New entity with full CRUD (domain/data contracts + data-access services and justified collaborators + routes/page containers + architecture-derived feature components) | [`_refs/angular/write-code/init-entity.md`](_refs/angular/write-code/init-entity.md) |
| Shared frontend architecture preflight before non-trivial UI generation | [`_refs/shared/frontend-architecture.md`](_refs/shared/frontend-architecture.md) |
| Image/PRD/UI reuse preflight before UI-affecting work | [`_refs/angular/write-code/input-analysis.md`](_refs/angular/write-code/input-analysis.md) |
| Explicitly approved `technical-prototype` profile | [`_refs/angular/write-code/po-ba-prototype.md`](_refs/angular/write-code/po-ba-prototype.md) |
| Mock API/OpenAPI/Postman/cURL contract to UI/service mapping | [`_refs/angular/write-code/mock-api-input.md`](_refs/angular/write-code/mock-api-input.md) |
| Entity/model/service reuse preflight before generating or extending entity contracts | [`_refs/angular/write-code/reuse-existing-entities.md`](_refs/angular/write-code/reuse-existing-entities.md) |
| List page only (entity already exists) | [`_refs/angular/write-code/screen-list.md`](_refs/angular/write-code/screen-list.md) |
| Detail component — any state (CREATE / UPDATE / DETAIL), parent detail-scoped child CRUD, or form refinement (validators, FormArray, async validators) | [`_refs/angular/write-code/screen-detail.md`](_refs/angular/write-code/screen-detail.md) |
| Action buttons — workflow transitions, bulk operations, custom side-effects (export, re-sync, etc.) | [`_refs/angular/write-code/actions.md`](_refs/angular/write-code/actions.md) |

Read ON DEMAND only — load the one reference for the step you are executing, not all of them. Each reference further links to the literal code templates under `_refs/angular/templates/`.

## Execution and finish routing

For non-trivial Core UI generation, read `_refs/angular/orchestrator-workflow.md`
for read-oriented context, frontend architecture, execution order, Core UI usage
summary and finish handoff. Bounded fixes read only the affected implementation
reference and use the shared proportional finish gate. Never infer architecture,
backend contracts, optional admin scope or new dependencies from a short request.

## When to Use

When user requests a new entity in a module, or any of the dispatch-table scope items:
- "Generate product CRUD in sample module" → init-entity
- "Initialize portal-shop with dev/qc/uat/prod" → init-portal
- "Create catalog module" → init-module
- "Create user list screen" → screen-list
- "Add validator to product form" → screen-detail
- "Add an approval button for orders" → actions
- "Use the explicit technical-prototype profile approved in this plan" → po-ba-prototype
- "Build this demo-only mock-first module; I approve technical-prototype assumptions" → po-ba-prototype

## Generation invariants

For entity/schema generation or prototypes, read
`_refs/angular/orchestrator-generation.md` for input resolution, EntitySchema,
workflow, rules, validation and a complete example. Load
`_refs/angular/write-code/generation-rules.md` only for affected source concerns.
Reuse exact installed Core UI package/version, confirmed DTO/SaveReq fields and
existing service/state boundaries. Do not invent fields, permissions, screens,
API contracts or tests that only mirror declarations. Preserve tenant/auth,
complete-data, list/detail state and meaningful assertion coverage. Use the
agreed TDD/post-hoc strategy, then mandatory finish assessment; carry existing
session choices without reconfirmation.
