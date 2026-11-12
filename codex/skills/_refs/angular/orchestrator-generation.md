# Orchestrator Generation

Load only at the entrypoint trigger below. Preserve the shared session authority policy.

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

### Verification strategy before code generation

Verification is mandatory and risk-based; use the agreed TDD or post-hoc
strategy. Do not require a cosmetic `.spec.ts` beside every type/model file.
Reuse focused tests when they prove unchanged behavior, and add a meaningful
regression for new or changed behavior. Permissions, tenant boundaries and
complete-data paths need assertions that detect violations.

For TDD, write and run the failing test before implementation, then demonstrate
GREEN and preserve it during any authorized refactor. For post-hoc, implement
within confirmed scope and run the mapped regression before completion. Never
claim tests passed merely because files were authored; preserve NOT RUN reasons.

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
- Apply [`_refs/shared/static-analysis-compatibility.md`](../shared/static-analysis-compatibility.md) to generated code: always follow its good-practice defaults; when the target project shows analyzer evidence, add advisory (`Low`/`RECOMMENDED`) proposals to the generation summary, and never edit analyzer, lint or CI configuration or dependencies without explicit user approval.
- Apply the **MANDATORY FINISH GATE** ([`_refs/shared/finish-gate.md`](../shared/finish-gate.md)) after EVERY code-gen — standalone trigger or full SDLC flow. Resolve existing scoped authority first; surface only unresolved optional integration/E2E, documentation, simplification and review choices. Test authoring and the required unit/contract run are not opt-outs.
- Test authoring follows the agreed TDD/post-hoc strategy and affected risk.
  The finish gate cannot downgrade a failing check or relabel NOT RUN as PASS.
- Resolve semantic application/module ownership and optional-feature approval through `_refs/angular/execution-contract.mjs`, which consumes `_refs/shared/system-registry.json`. Portal is not a fallback owner for a module artifact.
- Run `admin-screens` only when admin/auth/account/role/permission is named in an approved requirement or explicit approved profile/template contract.
- Detect the installed Core UI package FIRST — a project is a Core UI portal if `package.json`, a lockfile, installed package metadata, or existing imports show EITHER `@sdcorejs/angular` (new default) OR `@sd-angular/core` (legacy alias — same code, same version, actively co-deployed). Treat both as equal: NEVER skip doc discovery just because the project uses the legacy name, and generate imports with whichever prefix the project installed. If neither package is present and the request is not new portal creation or an approved migration, stop and return to `sdcorejs-execute-plan` generic harness as `plain-angular`.
- Discover Core UI on-demand before generating (docs are NOT committed — pulled fresh from the published site, version-matched, cached): for existing Core UI projects run `node _refs/angular/core-docs-fetch.mjs --cwd <target-project> --require-installed --list` to see the component inventory, then `node _refs/angular/core-docs-fetch.mjs --cwd <target-project> --require-installed <id>` (e.g. `sd-button`, or `--print <id>` for inline content) to read a component's full API BEFORE using it. Before writing any template styling, ALWAYS fetch the Core UI style guide first — `node _refs/angular/core-docs-fetch.mjs --cwd <target-project> --require-installed --print assets/STYLE-GUIDE` — the single authoritative list of shipped utility classes. New portal creation may pass `--version <CORE_VERSION>` from `_refs/angular/core-version.md` before install. Never rely on hardcoded/memorized class names. Prefer a Core UI component when one fits; if none does, scaffold a skeleton with disabled actions and flag it in the generation summary. It mojibake-guards upstream + falls back to cache offline. If a Core UI package exists but no remote/cache docs are available, continue only from local Core UI evidence and explicitly report the docs gap. If no Core UI package exists, do not use this docs fallback; route as `plain-angular`.
- For any detail/create/update screen, apply the Core UI component selection gate in [`_refs/angular/write-code/screen-detail.md`](../angular/write-code/screen-detail.md) before writing markup. Child arrays/line items saved with the parent payload must use the documented `FormArray` + Core UI table/grid or sectioned row-editor pattern; independent child CRUD must use the parent detail-scoped modal/drawer pattern and never self-draw a native table or unmanaged repeated divs.
- Before generating an entity detail or side-drawer view, classify fields by role via [`_refs/angular/write-code/init-entity.md`](../angular/write-code/init-entity.md): business identifiers, primary display, lifecycle/status, long text, visual identity, and server/audit. Business identifiers are create-only/edit-locked by default; DETAIL/side-drawer view should prefer compact read-only facts over a disabled edit form for simple data.
- Keep independent child CRUD scoped to the parent DETAIL screen: use modal/drawer flows, pass the current parent id into the child form, refresh the child collection after success, and preserve the parent route plus active tab/section.
- Style utility-first — see [`_refs/angular/styling.md`](../angular/styling.md). Lean on the Core UI utility classes from the STYLE-GUIDE (`d-flex`, `flex-1`, `justify-content-between`, `gap-16`, `m-*`/`p-*`, `w-full`, `rounded-8`, `text-primary`, `T14M`, `row`/`col-*`, `grid-container`/`grid-cols-*`, `mat-elevation-z*`) for layout / spacing / sizing / color / typography. If the consumer app ships Tailwind (`tailwind.config.*` or a `tailwindcss` dependency), use Tailwind utilities too, matching whatever the existing components use. Core UI spacing/sizing utilities are **px-based, integer 0–200** (`mb-16` = 16px — NOT a Bootstrap multiplier); use multiples of 4. Write custom component `.scss` ONLY when no utility fits, keep it token-based (`var(--sd-*)`), and flag each rule with a one-line `// why:`.
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
- Skip required verification, hide failing checks, or silently change the agreed TDD/post-hoc strategy; author tests when meaningful for the affected behavior.
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
