# Angular Generation Process

Read this reference completely before an eligible Core UI Angular executor
builds `EntitySchema` or writes any generated file. It never replaces the
approval, eligibility, frontend-architecture, Design-input, or TDD gates in
`sdcorejs-angular`; those gates must already have passed.

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

## Build EntitySchema and generate files

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

## Generation rules

### MUST DO

- Run the entity reuse preflight before generating model/service/entity code; identify primary + related entities, scan existing model/interface/type/dto/service/api/repository/store files, and decide reuse/extend/create new before writing code.
- Run `_refs/angular/write-code/input-analysis.md` before UI-affecting work, image/screenshot/Figma input, PRDs, user stories, feature descriptions, or acceptance criteria. Produce the SDCoreJS Core reuse analysis and the matching UI decomposition, requirement mapping, or image+PRD mapping before implementation.
- Run `_refs/angular/write-code/po-ba-prototype.md` only for an explicitly approved registry `technical-prototype` profile. Emit the required Technical Prototype Plan, mark it not production, and record approved Prototype assumptions before code generation.
- Run `_refs/angular/write-code/mock-api-input.md` when UI generation is driven by mock API docs, OpenAPI/Swagger, Postman/Insomnia, MSW/WireMock/Prism/JSON Server specs, endpoint tables, schemas, JSON fixtures, or sample cURL. Produce the mock API contract mapping before writing models, services, or screens.
- Run the `@sdcorejs/utils` reuse preflight before writing helper/formatter/validator/mapper/pipe utility code; report which utilities were reused and why any custom helper remains necessary.
- Detect the installed Core UI package FIRST — a project is a Core UI portal if `package.json`, a lockfile, installed package metadata, or existing imports show EITHER `@sdcorejs/angular` (new default) OR `@sd-angular/core` (legacy alias — same code, same version, actively co-deployed). Treat both as equal: NEVER skip doc discovery just because the project uses the legacy name, and generate imports with whichever prefix the project installed. If neither package is present and the request is not new portal creation or an approved migration, stop and return to `sdcorejs-execute-plan` generic harness as `plain-angular`.
- Discover Core UI on-demand before generating (docs are NOT committed — pulled fresh from the published site, version-matched, cached): for existing Core UI projects run `node _refs/angular/core-docs-fetch.mjs --cwd <target-project> --require-installed --list` to see the component inventory, then `node _refs/angular/core-docs-fetch.mjs --cwd <target-project> --require-installed <id>` (e.g. `sd-button`, or `--print <id>` for inline content) to read a component's full API BEFORE using it. Before writing any template styling, ALWAYS fetch the Core UI style guide first — `node _refs/angular/core-docs-fetch.mjs --cwd <target-project> --require-installed --print assets/STYLE-GUIDE` — the single authoritative list of shipped utility classes. New portal creation may pass `--version <CORE_VERSION>` from `_refs/angular/core-version.md` before install. Never rely on hardcoded/memorized class names. Prefer a Core UI component when one fits; if none does, scaffold a skeleton + `alert('TODO: ...')` and flag it. It mojibake-guards upstream + falls back to cache offline. If a Core UI package exists but no remote/cache docs are available, continue only from local Core UI evidence and explicitly report the docs gap. If no Core UI package exists, do not use this docs fallback; route as `plain-angular`.
- For any detail/create/update screen, apply the Core UI component selection gate in [`_refs/angular/write-code/screen-detail.md`](../../../_refs/angular/write-code/screen-detail.md) before writing markup. Child arrays/line items saved with the parent payload must use the documented `FormArray` + Core UI table/grid or sectioned row-editor pattern; independent child CRUD must use the parent detail-scoped modal/drawer pattern and never self-draw a native table or unmanaged repeated divs.
- Before generating an entity detail or side-drawer view, classify fields by role via [`_refs/angular/write-code/init-entity.md`](../../../_refs/angular/write-code/init-entity.md): business identifiers, primary display, lifecycle/status, long text, visual identity, and server/audit. Business identifiers are create-only/edit-locked by default; DETAIL/side-drawer view should prefer compact read-only facts over a disabled edit form for simple data.
- For an approved technical prototype, stay mock-first within its assumptions unless a runnable backend endpoint, base URL/configuration, auth expectation, and project service convention are explicitly approved for live integration.
- For UI-affecting changes, perform the mandatory UI check from `_refs/angular/write-code/input-analysis.md` before final response. Prefer an actual browser/preview check when available; otherwise perform a code-level UI review and state that limitation honestly.

### MUST NOT

- Self-draw Core UI equivalents: native form fields, raw buttons, custom page headers, custom table HTML, or unstructured repeated row divs when a Core UI component or the detail row-editor fallback applies.
- Create custom primitive controls, project-level shared components, or feature-specific components when Core UI or an existing local shared asset fits. Feature-specific components are for domain composition and behavior, not tiny markup fragments.
- Invent behavior, UI labels, routes, roles, fields, component APIs, or SDCoreJS Angular APIs from image or PRD input. If the Core UI docs cannot be checked, use local evidence and report the fallback.
- Treat a mock API document as a live backend integration target or hard-code sample absolute URLs.
- Create duplicate model/service/type/store/repository/API-client files for a related entity that already has a usable contract in the project.
- Inline a full related entity object inside another model when an imported related model or summary type exists.
- Recreate helper behavior already covered by `@sdcorejs/utils` (`DateUtilities`, `NumberUtilities`, `StringUtilities`, `ValidationUtilities`, `ArrayUtilities`, `FilterUtilities`, `Utilities`, `ObjectUtilities`, `ColorUtilities`, `BrowserUtilities`) or deep-import from `@sdcorejs/utils/dist/*`.
