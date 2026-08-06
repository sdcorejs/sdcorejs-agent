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

## Shared Protocols

Read `_refs/shared/runtime-protocols.md` and
`_refs/shared/artifact-lifecycle.md`; merge producer `artifact_context` through
the finishing tail.

## Purpose

Single entry point for generating SDCoreJS/Core UI Angular portal code.
Transforms an approved plan from `sdcorejs-execute-plan` plus the user's
confirmed Core UI portal scope into complete CRUD entity code:
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
`sdcorejs-execute-plan`, READ the matching reference pack and follow it:

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

Right after the code is written and BEFORE the finish gate, emit a short table of every `@sdcorejs/angular` Core UI piece the feature actually uses — component, service, or directive — each with a one-line purpose **tied to this feature**, in the user's language. This gives the team a concise overview of the building blocks. Build the rows from what you ACTUALLY imported/used — never list a component you didn't use, never describe it generically.

```text
Core UI used in <feature name>:

| Core UI | Role in this feature |
|---|---|
| `SdTable` | Shows the <entity> list with pagination, filtering, and sorting |
| `SdNotifyService` | Shows success/error feedback when saving or deleting |
| `SdSection` | Groups fields on the detail screen |
| `sd-button` | Renders save, cancel, and action buttons |
```

Keep each purpose one line, concrete to the feature (not "a table component"). Use plain wording when the communication persona requests it. The same table is persisted into the module's user guide at the write-user-guide step.

This summary is Core UI only. If the target project is classified as
`plain-angular`, this skill must not run and no Core UI usage summary is
emitted.

For UI-affecting work, the final response must also include the concise
sections named `Core reuse summary` and `UI check`, as defined in
`_refs/angular/write-code/input-analysis.md`.

#### MANDATORY FINISH GATE (always — standalone trigger OR full SDLC flow)

**STOP and present the consolidated finish gate from [`_refs/shared/finish-gate.md`](../../../_refs/shared/finish-gate.md) before running ANY tail step.** This is UNCONDITIONAL: it fires even when this skill was triggered directly for a one-line request (e.g. "add entity", "create module X") — NOT only inside the spec→plan flow. The gate surfaces tests / user-guide / technical-doc / behavior-preserving simplification / review choices with defaults so the user always knows these steps exist and can opt out of new user/technical docs. "Small change" is not a reason to skip the gate. Read the ref for the exact prompt + rules.

Test authoring and the RED/GREEN/refactor loop are mandatory implementation
work completed before production code and cannot be disabled here. The finish
gate controls only extra integration/E2E execution plus optional documentation,
simplification, and review work. It cannot retroactively skip authored unit and
contract tests or convert a RED/GREEN failure into success.

Then run the tail in this order, honoring only those finish-gate choices:

Documentation supplement: immediately after the Finish Gate test decision, run
`sdcorejs-documentation (documentation-gate mode)` and read
`_refs/documentation/gate.md`. This gate asks or loads saved project
preferences from `<target>/.sdcorejs/documentation/preferences.md` for
`user-guide` and `technical-doc` only. It must ask before
creating a missing corresponding user-guide or technical-doc for a new feature.
`code-documentation` is automatic for touched source files and is not controlled
by this approval gate.

1. `sdcorejs-test` (sdcorejs-test) - ALWAYS run the smallest relevant unit and contract tests already written RED-first and report pass/fail + failing names. The finish gate may enable or decline only additional integration/E2E execution; unavailable infrastructure is reported as `NOT RUN`, never pass. If any testable file still lacks a required spec, return to the TDD gate before continuing.
2. *(if Review not skipped)* `sdcorejs-review` (skills/shared/workflow/review.md; auto-detects Angular and loads `_refs/angular/review-code.md`) - convention check; actionable Angular code-review table with severity, group, file/line, risk, fix, and gate
3. *(if Review not skipped)* `sdcorejs-repair-loop` - apply findings, iterate until `BLOCKER`/`REQUIRED` findings are fixed or explicitly deferred
4. `sdcorejs-documentation (code-documentation mode)` - automatically apply concise source-code documentation rules to touched source files. Do NOT ASK for approval. Cross-track baseline + per-track addenda live in `_refs/documentation/code-documentation.md`
5. *(if UI-affecting)* Angular UI check from `_refs/angular/write-code/input-analysis.md` - run browser/preview verification when available; otherwise perform and report a code-level UI review. Fix obvious UI issues before continuing. If this changes code, rerun the smallest relevant check.
6. `sdcorejs-product` *(when user-visible feature traceability is needed)* - seed/update `.sdcorejs/docs/product/` with requirement, implementation, and test mapping
7. *(if Technical doc approved)* `sdcorejs-documentation (write-technical-doc mode)` - create/update the approved technical doc from source evidence.
8. `_refs/orchestration/tail/auto-docs.md` *(always)* - change-scoped execution record written to `<target>/.sdcorejs/docs/angular/`
9. *(if User guide approved)* `sdcorejs-documentation (write-user-guide mode)` - create/update the touched module's `.sdcorejs/documentation/user-guides/<module>/<module>.md` only when approved by the documentation gate or explicitly requested. Per-module incremental; after all module updates, the aggregate rebuilds exactly once when a guide changed, when explicitly requested, or when stale inside approved scope.
10. `_refs/orchestration/tail/auto-task-tracker.md` *(only when the sequential workflow or integration owner is authorized to update the shared backlog)* - reconcile durable follow-up work; never mirror live progress
11. `sdcorejs-explore (memories mode)` - only if durable knowledge surfaced (recurring convention, stakeholder constraint, anti-pattern)
12. `sdcorejs-ship (verify-before-done mode)` *(always)* - BLOCK "done" until acceptance criteria from the selected scope are verified or explicitly deferred
13. `sdcorejs-ship (branch-ready mode)` *(always)* - final read-only branch-ready gate over the final diff before any Git artifact handoff. No writes after branch-ready unless branch-ready is run again.

The FINISH GATE itself is mandatory and unconditional. Change execution
records, relevant memories, `sdcorejs-ship (verify-before-done mode)`, and final
`sdcorejs-ship (branch-ready mode)` run regardless of gate answers. Durable
backlog reconciliation runs only with sequential/integration ownership. Do NOT
skip `sdcorejs-ship (verify-before-done mode)`; that is how acceptance criteria
silently slip.

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

## Input Resolution

### `technical-prototype` input resolution

Only after explicit opt-in and approved assumptions:

- Resolve application/module ownership with
  `_refs/angular/execution-contract.mjs`; an unresolved module blocks writes and
  never falls back to the portal repository.
- Use only approved assumptions to fill missing API/design details. Do not infer
  extra screens, admin/auth, roles, permissions, seed data, or workflow actions.
- Record every authorized assumption under `Prototype assumptions` and present
  the required `Technical Prototype Plan` block from
  `_refs/angular/write-code/po-ba-prototype.md` before writing code.
- Run `reuse-existing-entities.md` before creating or extending any entity
  contract, even in mock-first prototype mode.

Before generating an entity, clarify with user:

1. **Module**: Which module does this entity belong to? (module)
   - If missing: Ask which existing module, or propose creating new module first (init-module)

2. **Entity Name**: What's the entity name? (entity, entityPascal)
   - Examples: product, employee, purchase-order, sales-invoice

3. **Display Label**: What label should appear in UI? (entityLabel, entityLabelPlural)
   - Examples: "Product", "Employee", "Purchase Order"

4. **Fields**: What fields should this entity have?
   - Use approved requirements/design/API fields; do not infer a production schema
     from a vague entity name
  - For each field: name, type (string/number/date/select/etc), required?, label
  - When refining approved fields, derive labels/control choices from the field
    contract and current portal conventions
  - For localized portals, all generated labels must use proper diacritics

5. **UI Preferences**:
   - Detail layout: choose side-drawer or full-page from approved complexity and
     design handoff
   - Search/filter/delete/export exist only when approved. If asking,
     ask each toggle sequentially with `_refs/shared/user-choice-prompt.md`
     using `1. Yes` / `2. No`.
   - Permissions: use default naming pattern or custom? (default: {{ MODULE }}_{{ ENTITY }}_CREATE, etc.)

### Semantic schema refinement

If the user gives only an entity name or a vague description, stop code
generation and return to requirements/design clarification. Semantic refinement
may fill low-risk presentation metadata only after the approved artifact defines
the entity boundary and fields.

Use this refinement order:
1. Approved requirement, acceptance criteria, design, and API contract.
2. Existing portal conventions already confirmed in this repository.
3. Core UI component contract and accessibility requirements.

Refinement rules:
- Never invent an identity pair, classification, amount/date/status, free-text,
  upload, role, or permission field that is absent from approved scope.
- Separate writable fields (`SaveReq`) from read-only/detail fields (`DTO`) such as approval status, created info, updated info, or derived totals
- Include only approved list columns and states.
- If the approved form fits one compact business section, use `side-drawer`;
  otherwise follow the approved full-page design

## Generation Process

### TDD Gate — mandatory before each code-generating step (NEVER skipped, NEVER gated behind a question)

Tests are a REQUIRED deliverable of this skill, not an optional add-on. Every code-gen run MUST leave a runnable `.spec.ts` next to every testable production file. Do NOT ask the user whether to write tests, and do NOT ask which coverage level first — default to **`standard`** coverage and proceed. Only switch to `minimal` / `full` if the user EXPLICITLY requested a different level (e.g. in `sdcorejs-brainstorming`). A missing spec is a generation defect, not a style choice. RED-first is the DEFAULT ordering (not post-hoc).

Before writing any production file (model / service / list / detail), invoke `sdcorejs-test (tdd mode)`:

1. Write the failing `.spec.ts` for that chunk first → run test → confirm RED
2. Generate the production file with minimal passing code → run test → confirm GREEN
3. Refactor if needed → run test → confirm still GREEN

Applies to: model (validators / type contracts), service (CRUD method contracts), list component (rendering + actions), detail component (form + state transitions). Default `standard` coverage = `should create` + route-permission + list data/sort + detail save-flow/state, per `_refs/angular/templates/entity-tests.md`.

Skip RED-first for: `mock-data` seed rows (pure data, no testable logic) and `routes.ts` (Angular config — but its `*.routes.spec.ts` permission-validation spec IS still written).

### Step 1: Build EntitySchema (shared input for every reference)

From user input, product docs, design handoff, mock API contracts, or semantic inference, construct `EntitySchema` with all field metadata. The schema is the single input every reference pack consumes — init-entity, screen-list, and screen-detail all read these names + field flags (`visibleInList`, `visibleInDetail`, `type`, `required`, permission codes).

Before building the schema from visual or requirement input, complete the
`_refs/angular/write-code/input-analysis.md` planning output. Use the PRD or
acceptance criteria as the behavior source of truth, visual input as layout
direction, and Core UI/local project conventions as implementation primitives.
For an approved `technical-prototype`, complete
`_refs/angular/write-code/po-ba-prototype.md` before finalizing `EntitySchema`.
Use approved requirements and assumptions first, then existing conventions and
Core UI patterns. Keep Service contracts separate as DTO,
ListRes, DetailRes, CreateReq, UpdateReq, SaveReq, and Component ViewModel when
the prototype needs different read/write/UI shapes.

Before building the schema from mock API/API-contract input, complete
`_refs/angular/write-code/mock-api-input.md`. Use its endpoint inventory and
contract mapping to decide request types, response DTOs, validators, list
columns, detail read-only fields, lookup relations, custom actions, and mock
service behavior.

If a matching `.sdcorejs/design/specs/` or `.sdcorejs/design/wireframes/` handoff exists, read it before generating UI. Follow its screen/state/copy contract unless it conflicts with approved product criteria; if it conflicts, stop and surface the mismatch instead of silently choosing one.

If the input is a PRD, user story, acceptance criteria, or product description
for normal implementation and no matching design handoff exists, do not invent a
new visual direction inside `sdcorejs-angular`. Stop and route to
`sdcorejs-design` first, unless the approved plan or current user request
explicitly records an approved `technical-prototype` profile.

Before finalizing `EntitySchema`, identify the primary entity and every related entity, scan existing model/interface/type/dto/service/api/repository/store files, and record one decision per entity: `reuse`, `extend`, or `create new`. Relationship fields must point to existing imported types or minimal summary types when those contracts exist; use `<entity>Id` when the API only returns an id. Do not inline a related entity object or create a duplicate model/service after an existing contract is found.

Before outputting code, present a short reuse summary: existing model/service found, imports to reuse, files to extend, files to create, and why duplicate contracts are not being created.

For two worked examples (user-supplied Product fields + inferred Promotion schema), see [`_refs/angular/templates/orchestrator-step-examples.md#step-1--build-entityschema`](_refs/angular/templates/orchestrator-step-examples.md#step-1--build-entityschema).

### Step 2: Generate per the dispatched reference

Once the EntitySchema exists, generate each file by following the reference pack the dispatch table routed you to. The per-file rules, decision heuristics, and code-template links all live in the reference — do NOT re-derive them here. Map:

| File(s) | Reference + worked-code template |
|---|---|
| `<entity>.model.ts` (SaveReq / DTO / constants) | `init-entity.md` → [`orchestrator-step-examples.md#step-2--generate-model`](_refs/angular/templates/orchestrator-step-examples.md#step-2--generate-model-productmodelts) |
| `<entity>.mock-data.ts` + `<entity>.service.ts` (mock-first CRUD, 20–40 domain-realistic rows) | `init-entity.md` → [`orchestrator-step-examples.md#step-3--generate-mock-data--service`](_refs/angular/templates/orchestrator-step-examples.md#step-3--generate-mock-data--service) |
| `<entity>.routes.ts` (lazy-loaded, `data.permission`, provider placement from the approved lifecycle plan) | `init-entity.md` → [`orchestrator-step-examples.md#step-4--generate-routes`](_refs/angular/templates/orchestrator-step-examples.md#step-4--generate-routes-productroutests) |
| `pages/list/list.component.ts` | `screen-list.md` (+ `_refs/angular/templates/screen-list-component.md`) |
| `pages/detail/detail.component.ts` (CREATE / UPDATE / DETAIL + form) | `screen-detail.md` (+ `screen-detail-component.md`, `reactive-form-templates.md`) |
| Feature-local list/detail children, optional facade/form builder/mapper, and their contract tests | `screen-list.md` / `screen-detail.md` (+ `_refs/angular/templates/feature-component-boundaries.md`) |
| Action buttons (workflow / bulk / custom) | `actions.md` |

For a full new entity, read `init-entity.md` end-to-end (it covers model → service → routes → list → detail in one pass). For a single-file refinement on an existing entity, read just the screen-list / screen-detail / actions reference.

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
- Run the entity reuse preflight before generating model/service/entity code; identify primary + related entities, scan existing model/interface/type/dto/service/api/repository/store files, and decide reuse/extend/create new before writing code.
- Run `_refs/angular/write-code/input-analysis.md` before UI-affecting work, image/screenshot/Figma input, PRDs, user stories, feature descriptions, or acceptance criteria. Produce the SDCoreJS Core reuse analysis and the matching UI decomposition, requirement mapping, or image+PRD mapping before implementation.
- Run `_refs/angular/write-code/po-ba-prototype.md` only for an explicitly approved registry `technical-prototype` profile. Emit the required Technical Prototype Plan, mark it not production, and record approved Prototype assumptions before code generation.
- Enforce template-first technical-prototype generation: new portal prototypes run `init-portal.md` only when portal creation is approved; existing prototypes extend the existing Core UI shell/routes/menu. Do not create a parallel custom portal shell or bespoke list/detail/form layout system.
- Run `_refs/angular/write-code/mock-api-input.md` when UI generation is driven by mock API docs, OpenAPI/Swagger, Postman/Insomnia, MSW/WireMock/Prism/JSON Server specs, endpoint tables, schemas, JSON fixtures, or sample cURL. Produce the mock API contract mapping before writing models, services, or screens.
- Run the `@sdcorejs/utils` reuse preflight before writing helper/formatter/validator/mapper/pipe utility code; report which utilities were reused and why any custom helper remains necessary.
- After generating UI, show the **Core UI usage summary** table (every `@sdcorejs/angular` component/service/directive actually used + a one-line, feature-specific purpose, in the user's language) so the user sees the building blocks at a glance. List only what was used. Persist the same table into the module user guide at write-user-guide.
- Present the **MANDATORY FINISH GATE** ([`_refs/shared/finish-gate.md`](../../../_refs/shared/finish-gate.md)) after EVERY code-gen — standalone trigger or full SDLC flow. It surfaces extra integration/E2E execution, user-guide, technical-doc, behavior-preserving simplification, and review choices. Test authoring and the required unit/contract run are not opt-outs.
- Test authoring is mandatory and written RED-first at `standard` coverage by default (see the TDD Gate). The finish gate controls only additional integration/E2E execution; it cannot skip authored tests after RED/GREEN or downgrade a failure. NEVER ask a separate coverage question outside approved planning.
- Resolve semantic application/module ownership and optional-feature approval through `_refs/angular/execution-contract.mjs`, which consumes `_refs/shared/system-registry.json`. Portal is not a fallback owner for a module artifact.
- Run `admin-screens` only when admin/auth/account/role/permission is named in an approved requirement or explicit approved profile/template contract.
- Detect the installed Core UI package FIRST — a project is a Core UI portal if `package.json`, a lockfile, installed package metadata, or existing imports show EITHER `@sdcorejs/angular` (new default) OR `@sd-angular/core` (legacy alias — same code, same version, actively co-deployed). Treat both as equal: NEVER skip doc discovery just because the project uses the legacy name, and generate imports with whichever prefix the project installed. If neither package is present and the request is not new portal creation or an approved migration, stop and return to `sdcorejs-execute-plan` generic harness as `plain-angular`.
- Discover Core UI on-demand before generating (docs are NOT committed — pulled fresh from the published site, version-matched, cached): for existing Core UI projects run `node _refs/angular/core-docs-fetch.mjs --cwd <target-project> --require-installed --list` to see the component inventory, then `node _refs/angular/core-docs-fetch.mjs --cwd <target-project> --require-installed <id>` (e.g. `sd-button`, or `--print <id>` for inline content) to read a component's full API BEFORE using it. Before writing any template styling, ALWAYS fetch the Core UI style guide first — `node _refs/angular/core-docs-fetch.mjs --cwd <target-project> --require-installed --print assets/STYLE-GUIDE` — the single authoritative list of shipped utility classes. New portal creation may pass `--version <CORE_VERSION>` from `_refs/angular/core-version.md` before install. Never rely on hardcoded/memorized class names. Prefer a Core UI component when one fits; if none does, scaffold a skeleton + `alert('TODO: ...')` and flag it. It mojibake-guards upstream + falls back to cache offline. If a Core UI package exists but no remote/cache docs are available, continue only from local Core UI evidence and explicitly report the docs gap. If no Core UI package exists, do not use this docs fallback; route as `plain-angular`.
- For any detail/create/update screen, apply the Core UI component selection gate in [`_refs/angular/write-code/screen-detail.md`](../../../_refs/angular/write-code/screen-detail.md) before writing markup. Child arrays/line items saved with the parent payload must use the documented `FormArray` + Core UI table/grid or sectioned row-editor pattern; independent child CRUD must use the parent detail-scoped modal/drawer pattern and never self-draw a native table or unmanaged repeated divs.
- Before generating an entity detail or side-drawer view, classify fields by role via [`_refs/angular/write-code/init-entity.md`](../../../_refs/angular/write-code/init-entity.md): business identifiers, primary display, lifecycle/status, long text, visual identity, and server/audit. Business identifiers are create-only/edit-locked by default; DETAIL/side-drawer view should prefer compact read-only facts over a disabled edit form for simple data.
- Keep independent child CRUD scoped to the parent DETAIL screen: use modal/drawer flows, pass the current parent id into the child form, refresh the child collection after success, and preserve the parent route plus active tab/section.
- Style utility-first — see [`_refs/angular/styling.md`](../../../_refs/angular/styling.md). Lean on the Core UI utility classes from the STYLE-GUIDE (`d-flex`, `flex-1`, `justify-content-between`, `gap-16`, `m-*`/`p-*`, `w-full`, `rounded-8`, `text-primary`, `T14M`, `row`/`col-*`, `grid-container`/`grid-cols-*`, `mat-elevation-z*`) for layout / spacing / sizing / color / typography. If the consumer app ships Tailwind (`tailwind.config.*` or a `tailwindcss` dependency), use Tailwind utilities too, matching whatever the existing components use. Core UI spacing/sizing utilities are **px-based, integer 0–200** (`mb-16` = 16px — NOT a Bootstrap multiplier); use multiples of 4. Write custom component `.scss` ONLY when no utility fits, keep it token-based (`var(--sd-*)`), and flag each rule with a one-line `// why:`.
- Enforce the approved dependency order (application baseline → module → entity → screens → actions), inserting optional packs only where the approved plan names them.
- Generate every component with `changeDetection: ChangeDetectionStrategy.OnPush`; treat a missing OnPush decorator entry or missing import as a generation defect to fix before review.
- Precompute all values displayed or bound in templates with `signal()`, `computed()`, pure pipes, or view-model fields. Do not bind to component methods/getters for display, visibility, title/color, disabled/loading, permission, or list-derived values.
- Keep Service models as Service-owned contracts. Do not force them to equal the raw backend API when the Service maps the payload, and do not add UI-only fields to `SaveReq`/`DTO` unless the Service actually accepts/returns/derives those fields.
- For an approved technical prototype, stay mock-first within its assumptions unless a runnable backend endpoint, base URL/configuration, auth expectation, and project service convention are explicitly approved for live integration.
- For UI-affecting changes, perform the mandatory UI check from `_refs/angular/write-code/input-analysis.md` before final response. Prefer an actual browser/preview check when available; otherwise perform a code-level UI review and state that limitation honestly.
- Run the full tail chain after the last step.
- Never handle `plain-angular` inside this skill. The generic harness owns plain Angular and must never import `@sdcorejs/angular` or `@sd-angular/core`, fetch Core UI docs, emit Core UI usage summaries, force admin screens, or assume `src/libs/**/features/**`.

### Documentation Gate Rule

- Inside the mandatory finish gate, run `_refs/documentation/gate.md` immediately after the test decision. It owns user-guide / technical-doc creation or update approval. `code-documentation` is automatic and is not controlled by this gate.

### MUST NOT
- Hand-write CSS for flex / spacing / alignment / color / typography that a STYLE-GUIDE utility class already covers, or fill a component `.scss` with rules that duplicate shipped utilities — this is the "too many unnecessary CSS classes" anti-pattern. Put the utilities on the template; keep the `.scss` near-empty. Never use Bootstrap class names (`btn`, `card`, `form-control`, `modal` — they don't exist) or Tailwind syntax when the consumer has no Tailwind.
- Self-draw Core UI equivalents: native form fields, raw buttons, custom page headers, custom table HTML, or unstructured repeated row divs when a Core UI component or the detail row-editor fallback applies.
- Design a custom portal shell, landing page, dashboard, navigation system, page layout system, or form/table primitives for technical prototypes outside the approved `init-portal` baseline and existing target conventions.
- Create custom primitive controls, project-level shared components, or feature-specific components when Core UI or an existing local shared asset fits. Feature-specific components are for domain composition and behavior, not tiny markup fragments.
- Invent behavior, UI labels, routes, roles, fields, component APIs, or SDCoreJS Angular APIs from image or PRD input. If the Core UI docs cannot be checked, use local evidence and report the fallback.
- Treat a mock API document as a live backend integration target or hard-code sample absolute URLs.
- Infer `technical-prototype` from a PO/BA/nontechnical role, vague wording, missing backend/design, PRD input, or desire for a demo.
- Infer admin/auth/account/role/permission, seed data, or extra screens outside approved requirement/profile scope.
- Skip test generation, defer it to "later", or block spec writing behind a coverage-level question — specs are a required deliverable, written RED-first at `standard` by default.
- Generate portal code that requires end users to open the Keycloak console to manage accounts or roles.
- Run `admin-screens` merely because a portal or domain entity is being created.
- Create duplicate model/service/type/store/repository/API-client files for a related entity that already has a usable contract in the project.
- Inline a full related entity object inside another model when an imported related model or summary type exists.
- Navigate from a parent DETAIL child collection to independent child routes such as `/child/create`, `/child/:id/edit`, or `/child/:id`; use a modal/drawer scoped to the parent DETAIL screen.
- Show independent child create/edit/delete actions in parent CREATE or UPDATE states.
- Use inline `FormArray` for independently persisted child CRUD; reserve `FormArray` for child rows saved together with the parent payload.
- Recreate helper behavior already covered by `@sdcorejs/utils` (`DateUtilities`, `NumberUtilities`, `StringUtilities`, `ValidationUtilities`, `ArrayUtilities`, `FilterUtilities`, `Utilities`, `ObjectUtilities`, `ColorUtilities`, `BrowserUtilities`) or deep-import from `@sdcorejs/utils/dist/*`.

- Omit `ChangeDetectionStrategy.OnPush` from generated components.
- Call component methods/getters from HTML to compute displayed/bound values, including `{{ getLabel(...) }}`, `[title]="buildTitle()"`, `[disabled]="isDisabled()"`, `@if (canEdit())`, or `[class.foo]="hasFoo()"`. Use `computed()`/signals/pure pipes/view models instead. Event handlers remain valid.
- Treat Service DTOs as scratch objects for UI-only state (`checked`, `selected`, `expanded`, `children`, `displayName`, etc.). Use a component-local ViewModel or a documented Service mapper output instead.

## Validation Checklist

Before returning generated code:

✅ Mock API/OpenAPI/Postman/cURL input has a mock API contract mapping before implementation
✅ Any technical prototype has explicit opt-in, approved assumptions, a Technical Prototype Plan, clear not-production status, mock/live service decision, and approved owner/scope
✅ Any technical prototype used its approved template baseline; no parallel custom shell was created

✅ Each production file (model / service / list / detail) has a corresponding `.spec.ts` written RED before the file was created
✅ UI-affecting image/PRD/feature input has SDCoreJS Core reuse analysis and the matching decomposition/mapping before implementation
✅ Every generated component imports and declares `changeDetection: ChangeDetectionStrategy.OnPush`
✅ Templates bind only precomputed state (`signal`, `computed`, pure pipe, view model); no method/getter calls for displayed/derived values
✅ Service public models match the Service/mapper contract, with raw API-only fields isolated behind mapper/internal types
✅ UI-only fields live in component ViewModels/signals unless the Service explicitly derives and guarantees them
✅ All imports are correct (no circular dependencies)
✅ All fields from EntitySchema are included
✅ Field-role analysis was applied before rendering detail/side-drawer UI; business identifiers are locked on UPDATE after any whole-form enable and mapped safely in update payloads
✅ Simple DETAIL/side-drawer views use Core UI-first compact read-only facts, promote useful business identifiers, show status with existing status UI, and avoid duplicate promoted fields in the body
✅ Existing related models/services were scanned and reused or minimally extended before any new contract was created
✅ `@sdcorejs/utils` was checked before writing helper/formatter/validator/mapper/pipe utility code
✅ No duplicate model/service/type exists for the same domain entity
✅ Relationship fields use imported existing types or `<entity>Id` instead of unnecessary inline object shapes
✅ Parent detail-scoped child CRUD, when present, uses child-entity permissions, modal/drawer create/edit/view flows, parent-id prefill/lock, child collection refresh after success, and preserves the parent DETAIL route plus active tab/section
✅ Form validation matches field requirements
✅ Mock data exists only when `seed-data` is explicitly approved for a technical prototype
✅ Approved seed rows use realistic domain values and contain no secrets or personal data
✅ Mock-store wiring exists only inside the approved demo-only boundary
✅ Component decorators (@SdTabComponent) are present
✅ State management (CREATE/UPDATE/DETAIL) works correctly
✅ DETAIL route handles stale entity IDs by recovering to list instead of rendering blank fields
✅ Routes are lazy-loaded
✅ Column visibility matches schema
✅ Error handling is comprehensive
✅ TypeScript strict mode compliance
✅ No hardcoded values (use constants from schema)
✅ Naming conventions consistent throughout
✅ Comments explain complex logic
✅ UI-affecting changes have a UI check summary, with browser/preview verification claimed only when it actually ran

## Example: Complete Employee Entity Generation

A worked end-to-end example (user request → EntitySchema → final file tree, following `init-entity.md`) lives in [`_refs/angular/templates/orchestrator-step-examples.md#worked-end-to-end--employee-entity`](_refs/angular/templates/orchestrator-step-examples.md#worked-end-to-end--employee-entity). Read it when you want to see how the dispatch table cashes out on a real request.
