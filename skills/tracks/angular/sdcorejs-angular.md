---
name: sdcorejs-angular
description: Angular Core UI executor for approved implementation in new or existing @sdcorejs/angular and @sd-angular/core apps, covering portal init, CRUD/list/detail/form/action scope, explicit technical prototypes, or approved migration. Optional admin/auth packs require approved scope. Do not use for plain Angular apps or non-trivial work without verified approved spec and plan; route those through the governed workflow first. Runtime-localized.
required-actions: artifact.read, artifact.write, context.pass, verification.run, progress.create, progress.update, user.choose, user.approve, web.fetch, visual.present
---

# 07 — Write Code (Orchestrator)

## Approval preflight — first action, fail closed

Before project classification, TDD, frontend architecture, or reading any implementation reference, locate and verify the approved spec, approved plan, and completed `frontend_architecture` artifact.
The verbs `implement`, `build`, or `create` express write intent only; they are not spec approval or plan approval, never satisfy this executor's approved-artifact gate, and this executor must never treat the current prompt as the controlling approved scope.
When required approved artifacts are absent, remain read-only and must not modify source or test files. Stop this skill immediately and return the blocker: no project classification, TDD, architecture planning, implementation-reference reads, tests, or other work.
A fixture, lab, benchmark, disposable repository, hidden acceptance test, or generic-harness possibility never bypasses this gate. Eligibility may route only after the approval gate has passed.
A request combining a summary, filters, a result table, bulk actions, and workflow controls is non-trivial; without approved frontend architecture/spec/plan, stop before writing code and return to the owning gate.

For unresolved visual decisions, apply `_refs/sdlc/visual-offer-policy.md`;
forward `requirement_context.visual_companion` through `context.pass`
(portable `state_delta.visual_companion`) to the owning workflow.

## Shared Protocols

Read `_refs/shared/runtime-protocols.md` and `_refs/shared/artifact-lifecycle.md`; merge producer `artifact_context` through the finishing tail.

For required Design input, load `_refs/shared/design-handoff.md` and use
`resolveAngularExecution(request, { design_runtime })`. The host runtime pins
actual spec/plan/Design approval sources and runner evidence through
`_refs/shared/design-verification.mjs`; the resolver calls the verified path.
Profile-only resolution has no write target or production eligibility. An
omitted handoff, schema-valid draft, legacy payload, or serialized PASS cannot
waive an approved Design requirement. Preserve full artifact closure and
reverify fingerprints after source changes. An approved non-UI applicability
reason can explicitly take the non-Design path; do not invent one.

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

Before writing or changing any template, every generation action (portal, module, entity, list, detail, action and approved admin screens) also reads `_refs/angular/styling.md`: utility classes from the fetched STYLE-GUIDE, the spacing contract and minimal custom CSS.

### Step 0 — Read-oriented project context

Before dispatching any reference, assemble read-only `project_context`. Use
valid summary sections when available. If summary is missing, legacy, unknown,
or stale, continue with targeted reads; use a scoped code map only when
cross-module relationships remain unresolved. Never refresh merely because the
summary is absent. A brand-new approved `init-portal` may create summary v2
after the scaffold exists; an architecture-level refresh belongs only to the
sequential workflow or integration owner.

Read `_refs/shared/frontend-architecture.md` before formulating or presenting any
architecture decision for a non-trivial routed screen, form, table, child
collection, drawer, workflow panel, or frontend service.
Verify that the approved plan dispatched by `sdcorejs-execute-plan` contains the completed
`frontend_architecture` contract. This executor must not create or self-approve a
missing contract; stop and return through `sdcorejs-execute-plan` when the gate is
missing, incomplete, or contradicted by current codebase evidence.

For any UI-affecting request, and always when the input includes a screenshot,
wireframe, mockup, Figma export, PRD, requirement document, user story, feature
description, acceptance criteria, mock API, OpenAPI/Swagger file, Postman
collection, MSW handler, endpoint table, JSON fixture, schema, or sample cURL,
read `_refs/angular/write-code/input-analysis.md` before choosing components,
services, or templates. For eligible Core UI projects this preflight owns Core
UI docs registry resolution; for plain Angular projects the work should already
have been routed away from this skill. It also owns project-local reuse
scanning, image decomposition, PRD requirement mapping, mixed image+PRD mapping,
API/service assumptions, and the mandatory post-implementation UI check. Present
the required reuse analysis/mapping before implementation.

If the approved execution profile is `technical-prototype`, also read
`_refs/angular/write-code/po-ba-prototype.md` immediately after
`input-analysis.md`. Validate the profile, semantic owner, optional-feature
approvals, and prototype assumptions with
`_refs/angular/execution-contract.mjs`. Generate only the approved fields,
screens, routes, validators, actions, and demo data. Enforce the template-first
invariant from that reference before code generation.

If a mock API, OpenAPI/Swagger file, Postman collection, MSW handler, mock
endpoint list, JSON fixture, API schema, or sample cURL drives the UI, also read
`_refs/angular/write-code/mock-api-input.md` before building `EntitySchema` or
writing models/services. The PRD/acceptance criteria are the behavior source of
truth; the API artifact is the data/endpoint contract. A mock API document alone
does not authorize live API integration.

Before generating or extending any model, interface, type, service, store, repository, or API client, also run the entity reuse preflight in `_refs/angular/write-code/reuse-existing-entities.md`. This is mandatory for API docs, mock API contracts, PRDs, Figma/image/screenshot input, business descriptions, schemas, and any feature with related entities. The codebase is the source of truth for reuse decisions; the external artifact is only the new contract.

Before writing any helper, formatter, validator, mapper, pipe utility, paging/filter helper, random-id helper, query-param helper, upload/download helper, or clipboard/browser helper, read `_refs/shared/sdcorejs-utils.md` and reuse `@sdcorejs/utils` when it covers the behavior. The package must be a direct target-project dependency before generated code imports it; do not rely on Core UI's transitive dependencies.

### Execution order + hand-off

Execution order: application baseline → module → entity → screens → actions,
with any explicitly approved optional pack inserted at the plan-defined
dependency point. `portal` means the `init-portal` Core UI starter template
baseline, not a custom shell. Admin/auth/account/role/permission is never added
unless the approved requirement/profile names it. If the plan touches multiple
items, preserve its dependency order and do not parallelize shared-state steps.
After all referenced steps finish, hand off as follows:

Technical prototype flow: input-analysis -> explicit profile validation ->
prototype assumptions -> init-portal if approved/needed -> approved module/entity
screens/actions -> finish gate.

#### MANDATORY: Core UI usage summary (show the user right after generating)

After the code is written and before the finish gate, read
`_refs/angular/write-code/finishing.md` for the Core UI usage summary format and
the validation checklist to run before returning generated code.

This summary is Core UI only. If the target project is classified as
`plain-angular`, this skill must not run and no Core UI usage summary is
emitted.

For UI-affecting work, the final response must also include the concise
sections named `Core reuse summary` and `UI check`, as defined in
`_refs/angular/write-code/input-analysis.md`.

#### MANDATORY FINISH GATE

Use `completeAngularExecution` with `finish_context` and the current host runtime from
`_refs/shared/finish-gate.md`. Consume its `next_actions` after each owner
returns; the shared resolver owns the order and completion status. The gate
is mandatory after code generation, including direct requests; only unresolved
choices prompt. Reuse scope-bound decisions. Defer stops this tail without a
done claim. Review-only never dispatches repair or UI auto-fix. Workers return
unit evidence; only the integration owner runs the shared final gate.

The completion entrypoint is in `_refs/angular/execution-contract.mjs`.
Test authoring and the RED/GREEN/refactor loop remain mandatory before the
corresponding production code. Always run the smallest relevant unit and
contract tests; finish choices cannot remove required tests or AC. Unavailable
infrastructure is NOT RUN. Never label post-hoc tests RED-first.

Retain the Angular UI check from `_refs/angular/write-code/input-analysis.md`:
report source/rendered/interaction evidence separately; fixes need current
executor/repair authority. Source documentation for touched files, product
traceability when applicable, change execution records, authorized backlog,
memories, convention sync and approved guides are scoped owner hooks. Resolve
missing documentation authority with `_refs/documentation/gate.md` only for
unresolved scope; preference cannot authorize a new missing document. Merge
`artifact_context`, revalidate affected evidence after writes, then run Ship
verify-before-done and final read-only branch-ready. No automatic Git actions.

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

## Generation Process

### TDD Gate — mandatory before each code-generating step (NEVER skipped, NEVER gated behind a question)

Tests are a REQUIRED deliverable of this skill, not an optional add-on. Every code-gen run MUST leave a runnable `.spec.ts` next to every testable production file. Do NOT ask the user whether to write tests, and do NOT ask which coverage level first — default to **`standard`** coverage and proceed. Only switch to `minimal` / `full` if the user EXPLICITLY requested a different level (e.g. in `sdcorejs-brainstorming`). A missing spec is a generation defect, not a style choice. RED-first is the DEFAULT ordering (not post-hoc).

Before writing any production file (model / service / list / detail), invoke `sdcorejs-test (tdd mode)`:

1. Write the failing `.spec.ts` for that chunk first → run test → confirm RED
2. Generate the production file with minimal passing code → run test → confirm GREEN
3. Refactor if needed → run test → confirm still GREEN

Applies to: model (validators / type contracts), service (CRUD method contracts), list component (rendering + actions), detail component (form + state transitions). Default `standard` coverage = `should create` + route-permission + list data/sort + detail save-flow/state, per `_refs/angular/templates/entity-tests.md`.

Skip RED-first for: `mock-data` seed rows (pure data, no testable logic) and `routes.ts` (Angular config — but its `*.routes.spec.ts` permission-validation spec IS still written).

### Build and generate

Before building `EntitySchema` or writing any generated file, read
`_refs/angular/write-code/generation-process.md` completely. It owns input
resolution (including `technical-prototype` input resolution), semantic schema
refinement, `EntitySchema` construction, the per-file reference map, Core UI
package detection and on-demand docs discovery, and the carried generation
rules. If the user gives only an entity name or a vague description, stop code
generation and return to requirements/design clarification.

## Cross-Cutting Generation Rules

Before writing files, read
`_refs/angular/write-code/generation-rules.md` completely. It owns the shared
file/naming fallback, reuse and strict-TypeScript rules, OnPush/signal template
discipline, Service/ViewModel boundaries, validation, parent-detail child CRUD,
error handling, and code-documentation requirements. Apply it together with
the dispatched per-file reference and the approved frontend architecture.

## Rules

### MUST DO
- Create visible runtime progress from the START of generation through
  `progress.create`, with one item per planned unit and the finishing steps (tests, optional behavior-preserving simplification, review, code-documentation, technical-doc, user-guide).
  Keep one item `in_progress`, call `progress.update` after each unit, and never
  mirror live progress to a repository file.
- Resolve the **MANDATORY FINISH GATE** through `completeAngularExecution`; prompt only for unresolved scope-bound choices.
- Test authoring is mandatory and written RED-first at `standard` coverage by default (see the TDD Gate). The finish gate controls only additional integration/E2E execution; it cannot skip authored tests after RED/GREEN or downgrade a failure. NEVER ask a separate coverage question outside approved planning.
- Resolve semantic application/module ownership and optional-feature approval through `_refs/angular/execution-contract.mjs`, which consumes `_refs/shared/system-registry.json`. Portal is not a fallback owner for a module artifact.
- Run `admin-screens` only when admin/auth/account/role/permission is named in an approved requirement or explicit approved profile/template contract.
- Enforce the approved dependency order (application baseline → module → entity → screens → actions), inserting optional packs only where the approved plan names them.
- Run the full tail chain after the last step.
- Never handle `plain-angular` inside this skill. The generic harness owns plain Angular and must never import `@sdcorejs/angular` or `@sd-angular/core`, fetch Core UI docs, emit Core UI usage summaries, force admin screens, or assume `src/libs/**/features/**`.

### Documentation Gate Rule

- Resolve only missing documentation authority with `_refs/documentation/gate.md`; preserve exact approved docs scope and reuse current choices. Source documentation remains a scoped hook.

### MUST NOT
- Infer `technical-prototype` from a PO/BA/nontechnical role, vague wording, missing backend/design, PRD input, or desire for a demo.
- Infer admin/auth/account/role/permission, seed data, or extra screens outside approved requirement/profile scope.
- Skip test generation, defer it to "later", or block spec writing behind a coverage-level question — specs are a required deliverable, written RED-first at `standard` by default.
- Generate portal code that requires end users to open the Keycloak console to manage accounts or roles.
- Run `admin-screens` merely because a portal or domain entity is being created.

## Example: Complete Employee Entity Generation

A worked end-to-end example (user request → EntitySchema → final file tree, following `init-entity.md`) lives in [`_refs/angular/templates/orchestrator-step-examples.md#worked-end-to-end--employee-entity`](_refs/angular/templates/orchestrator-step-examples.md#worked-end-to-end--employee-entity). Read it when you want to see how the dispatch table cashes out on a real request.

## Design and UI review integration

Use _refs/shared/ui-review.md and the shared verified consumer path for applicable Design review before implementation and UI conformance after implementation. Preserve approved applicability; stack checks are additive. Required post-implementation captures remain pending in preflight. A review-only invocation never fixes source; authorized executor/repair writes retain owner/scope and invalidate affected evidence.
