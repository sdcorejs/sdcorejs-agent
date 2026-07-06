> **Reference for the `sdcorejs-angular` orchestrator.** Loaded on demand when the
> confirmed request is a PO/BA portal, module, or feature prototype from PRD-like
> input with no API/backend/design available. Not a standalone skill.

# PO/BA Prototype Portal Mode

## When to use

Use this reference when the request asks for any of these outcomes:

- PO/BA portal, module, feature, or workflow demo.
- Generate a portal prototype from PRD, user story, acceptance criteria,
  business description, function list, or stakeholder notes.
- Build without API/backend, without design handoff, or before auth/permission
  services exist.
- Align module/screens with a client using realistic local demo data.
- Convert PRD to UI prototype or create a mock-first portal.

Do not use this reference for production API integration. A mock API document,
PRD, endpoint table, or sample JSON is not a live backend unless the user also
provides a runnable endpoint, auth expectation, base URL/configuration, and
project service convention.

## Input handling

Missing API, backend, design, exact fields, or permission data is not a blocker.
Infer a safe first prototype from the best available source. Ask only when a
missing value is genuinely unsafe to infer, such as:

- New portal project name.
- Target module when multiple existing modules could own the feature.
- Primary entity when the PRD describes several peers and no lead workflow is
  clear.

Record all inferred choices under `Prototype assumptions` before generating.

## Source priority

Use this order when deriving screens and data:

1. PRD, user story, acceptance criteria, business rules, function list.
2. Existing project conventions, routes, feature folders, services, models,
   status labels, permission code shape, and local UI patterns.
3. Domain semantics for the entity and workflow.
4. Core UI component patterns and style guide.
5. Safe prototype defaults from this reference.

## Required planning output

Before writing files, present this block in the user's language while keeping
identifiers, routes, env keys, permission codes, and file paths in English:

```text
PO/BA Prototype Plan:
- Prototype goal:
- Input source:
- Portal/module impact:
- Screens to generate:
- Primary entities:
- Related entities/lookups:
- Mock service mode:
- Permission mode:
- Mock data plan:
- UI assumptions:
- Business assumptions:
- Out of scope for prototype:
```

Also include a `Prototype assumptions` section covering inferred fields,
statuses, validators, relations, route/menu labels, workflow actions, seed-data
edges, and anything deferred until a real API exists.

## Mock-first service mode

- Default service mode is mock-first with local persistence.
- Use `localStorage` by default, or reuse `MockCrudStore` when the target project
  already has that helper/convention.
- Do not create live API calls, hard-code mock API URLs, or require backend auth.
- Do not introduce login/auth dependencies for a prototype unless the request is
  specifically about auth.
- Create a safe stub context when the shell expects current user, tenant, or
  permission data. The stub must be local/demo-only and easy to replace.
- Keep mock services behind the same public service methods the future API mode
  will need, so the later backend swap is mechanical.
- Centralize seed rows in `services/<entity>.mock-data.ts` or the established
  project convention.

## Permission behavior

- For a new portal prototype, generate `PermissionConfiguration.disabled = true`
  so the portal boots locally without a permission backend.
- For an existing portal prototype, keep routes and menu demoable when the
  permission backend is not ready.
- Keep route metadata and permission codes for future backend alignment, but
  default to allow in prototype mode when permission data is missing.
- Do not hide Create, Update, Detail, workflow, export, or sync buttons merely
  because permission data has not been seeded yet.
- In the final response, report the permission bypass status clearly.

## Mock data rules

- Use default 25 rows per primary listing when no count is provided.
- Acceptable prototype range is 20-30 rows. Use fewer only when the entity is a
  small lookup or the user explicitly requests it.
- Seed realistic domain data. Never use generic placeholders such as `Name 1`,
  `Code 01`, repeated identical descriptions, or meaningless lorem text.
- Include status distribution with at least one record per important status.
- Include valid edge cases that help PO/BA review behavior:
  - nullable optional fields,
  - long descriptions,
  - inactive, overdue, expired, rejected, cancelled, or draft records when
    meaningful,
  - empty child collections when the workflow can have none,
  - boundary amounts/dates that remain realistic.
- Do not include real secrets, tokens, credentials, private customer data, or
  real personal information.
- Keep relations and lookup ids consistent across files.
- If the entity needs related lookups, seed those lookup rows too or reuse
  existing lookup data.

## UI rules

- Every list screen must expose visible seed data immediately, plus
  search/filter/sort/paging behavior where the entity semantics support it.
- Detail must support CREATE, UPDATE, and DETAIL states unless the PRD explicitly
  defines a read-only screen.
- Infer validators from PRD, field semantics, status workflow, and common
  business rules. Keep validator inference light enough for PO/BA review and
  record stricter rules as assumptions when uncertain.
- Use a side-drawer for simple 5-6 field create/update/detail flows.
- Use a full page for complex, multi-section, workflow-heavy, or child-collection
  detail screens.
- Workflow actions such as submit, approve, reject, cancel, export, and sync
  become mock-first action buttons that update the mock store state.
- Sidebar/menu/routes must be navigable for demo review.
- Include empty, loading, error, and success states where the generated screen
  can naturally show them.
- Do not add visible in-app instructional prose explaining how the prototype
  works. The demo should feel like the actual portal.

## PRD-to-EntitySchema inference

Before creating files, run `reuse-existing-entities.md` and decide reuse,
extend, or create new for every primary and related entity.

Infer:

- Module and route path.
- Primary entity and related entities/lookups.
- List columns, external filters, sort defaults, and paging defaults.
- Create/update form fields and validators.
- Detail read-only facts, promoted identifiers, status display, and audit facts.
- Workflow actions and status transitions.
- Mock service methods and action methods.
- Permission metadata for future production alignment.

Keep Service and UI contracts explicit. Separate DTO, ListRes, DetailRes,
CreateReq, UpdateReq, SaveReq, and ViewModel when read, write, list, detail, and
screen-only fields diverge.

## Related reference routing

Use this reference as the prototype overlay, then continue through the normal
Angular refs:

1. `input-analysis.md` for PRD/requirement mapping and Core UI reuse.
2. `po-ba-prototype.md` for prototype assumptions and no-backend decisions.
3. `init-portal.md` if a new portal is needed.
4. `admin-screens.md` after new portal init.
5. `init-module.md` when the module does not exist.
6. `init-entity.md` for model/service/mock-data/routes/list/detail.
7. `screen-list.md`, `screen-detail.md`, and `actions.md` for refinements.
8. Finish gate and tail chain from the main Angular skill.

## Final response requirements

The final response for this mode must include:

- route/menu entries generated or changed,
- mock rows per listing,
- permission bypass status,
- how PO/BA can run the demo locally,
- Prototype assumptions to confirm,
- next step when the real API/backend exists.

Keep the response runtime-localized for the user, while source files and reusable
skill text stay English-only.
