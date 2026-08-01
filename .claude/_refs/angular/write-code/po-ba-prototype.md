> **Reference for the `sdcorejs-angular` orchestrator.** Loaded on demand only
> after an explicit opt-in to the registry `technical-prototype` profile and
> approval of its scope/assumptions. Not a standalone skill.

# Technical Prototype Mode

This profile is demo-only and **not production**. Its output cannot establish
production readiness, production auth, or acceptance evidence for unimplemented
requirements. Never infer it from a user's role or from missing input.

## When to use

Use this reference only when all of these are true:

- the approved artifact or current user request names `technical-prototype`;
- `explicit_profile_approval` is recorded;
- semantic application/module ownership is resolved;
- prototype assumptions and every optional feature are approved.

A PRD, story, stakeholder note, vague UI request, nontechnical/PO/BA role,
missing backend/design, or request for a demo is insufficient by itself.

Do not use this reference for production API integration. A mock API document,
PRD, endpoint table, or sample JSON is not a live backend unless the user also
provides a runnable endpoint, auth expectation, base URL/configuration, and
project service convention.

## Input handling

Validate the request with `_refs/angular/execution-contract.mjs`. Missing API,
backend, or design is tolerable only when the approved prototype assumptions
state the demo substitute. Missing target ownership, entity boundary, fields,
screens, or optional-feature approval blocks code generation. Record all
authorized substitutions under `Prototype assumptions` before generating.

## Source priority

Use this order when deriving screens and data:

1. PRD, user story, acceptance criteria, business rules, function list.
2. Existing project conventions, routes, feature folders, services, models,
   status labels, permission code shape, and local UI patterns.
3. Explicitly approved prototype assumptions.
4. Core UI starter template, component patterns, and style guide.

## Template-first invariant

Technical prototypes must be built on an approved Core UI application baseline,
not as a freeform new app design.

- New portal: run `init-portal.md` first, render the Core UI starter template,
  keep its app shell/layout/sidebar/permission bootstrap, and then add only the
  approved module, entity, list, detail, create/update, and action changes inside
  that baseline.
- Existing portal: modify the existing Core UI portal shell, routes, menu, and
  component conventions in place. Do not create a second shell or detached demo
  app beside it.
- Domain UI is customized through the normal `init-module`, `init-entity`,
  `screen-list`, `screen-detail`, and `actions` refs. Change fields, data,
  validators, routes, labels, and workflow behavior; do not replace the Core UI
  starter template with a new layout system.
- Do not design a custom portal shell, bespoke sidebar/header/menu, standalone
  dashboard, raw list/table, or hand-built create/update/detail form when the
  Core UI starter template and screen refs already provide the pattern.
- If the target is not an SDCoreJS/Core UI portal yet, treat that as a new
  portal init or ask which existing Core UI portal should receive the module.

## Required planning output

Before writing files, present this block in the user's language while keeping
identifiers, routes, env keys, permission codes, and file paths in English:

```text
Technical Prototype Plan:
- Prototype goal:
- Input source:
- Template baseline:
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

Also include a `Prototype assumptions` section covering every approved demo
substitution and anything deferred until a real API/design exists. Do not add
fields, statuses, validators, relations, route/menu labels, workflow actions,
seed data, admin, auth, or extra screens merely as defaults.

## Mock-first service mode

- Mock-first service mode is allowed only when named in the approved assumptions.
- Use `localStorage` by default, or reuse `MockCrudStore` when the target project
  already has that helper/convention.
- Do not create live API calls, hard-code mock API URLs, or require backend auth.
- Do not introduce login/auth dependencies for a prototype unless the request is
  specifically about auth.
- Create a local/demo-only user, tenant, auth, or permission stub only when that
  exact capability is approved. A stub is never production auth evidence.
- Keep mock services behind the same public service methods the future API mode
  will need, so the later backend swap is mechanical.
- Centralize seed rows in `services/<entity>.mock-data.ts` or the established
  project convention.

## Permission behavior

- A permission bypass requires explicit approval in the prototype assumptions.
- Preserve an existing portal's auth and permission behavior unless bypass is
  approved; do not silently turn authorization off.
- Create permission codes or route metadata only from approved requirements or
  an explicit profile/template contract.
- Report any bypass as demo-only, insecure for production, and not production
  evidence.

## Mock data rules

- Generate seed data only when `seed-data` is an approved optional feature.
- Use the approved row count; if absent, stop and add a row-count assumption for
  approval instead of silently choosing one.
- Seed realistic domain data. Never use generic placeholders such as `Name 1`,
  `Code 01`, repeated identical descriptions, or meaningless lorem text.
- Include status distribution with at least one record per important status.
- Include approved valid edge cases that help stakeholder review behavior:
  - nullable optional fields,
  - long descriptions,
  - inactive, overdue, expired, rejected, cancelled, or draft records when
    meaningful,
  - empty child collections when the workflow can have none,
  - boundary amounts/dates that remain realistic.
- Do not include real secrets, tokens, credentials, private customer data, or
  real personal information.
- Keep relations and lookup ids consistent across files.
- If approved seed data needs related lookups, seed those lookup rows too or
  reuse existing lookup data.

## UI rules

- Start from the selected template baseline. For new portals, this is the
  `init-portal` Core UI starter template. For existing portals, this is the
  current Core UI app shell plus local route/menu/component conventions.
- Generate only approved list/detail/create/update states and actions.
- Search/filter/sort/paging exist only when approved.
- Derive validators from approved requirements/API contracts; do not invent
  common-business-rule validators.
- Use a side-drawer for simple 5-6 field create/update/detail flows.
- Use a full page for complex, multi-section, workflow-heavy, or child-collection
  detail screens.
- Workflow actions such as submit, approve, reject, cancel, export, and sync
  become mock-first actions only when each action is explicitly approved.
- Sidebar/menu/routes must be navigable for demo review.
- Include empty, loading, error, and success states where the generated screen
  can naturally show them.
- Use the normal list/detail/create/update templates and Core UI component
  gates. Customize the generated screens for the PRD; do not invent a separate
  portal layout, raw table, or custom form system for prototype speed.
- Do not add visible in-app instructional prose explaining how the prototype
  works. The demo should feel like the actual portal.

## Approved input-to-EntitySchema mapping

Before creating files, run `reuse-existing-entities.md` and decide reuse,
extend, or create new for every primary and related entity.

Map only approved:

- Module and route path.
- Primary entity and related entities/lookups.
- List columns, external filters, sort defaults, and paging defaults.
- Create/update form fields and validators.
- Detail read-only facts, promoted identifiers, status display, and audit facts.
- Workflow actions and status transitions.
- Mock service methods and action methods.
- Permission metadata from an approved requirement/profile contract.

Keep Service and UI contracts explicit. Separate DTO, ListRes, DetailRes,
CreateReq, UpdateReq, SaveReq, and ViewModel when read, write, list, detail, and
screen-only fields diverge.

## Related reference routing

Use this reference as the prototype overlay, then continue through the normal
Angular refs:

1. `input-analysis.md` for PRD/requirement mapping and Core UI reuse.
2. `po-ba-prototype.md` for explicit profile validation and approved assumptions.
3. `init-portal.md` if a new portal is needed.
4. `admin-screens.md` only when its admin/auth/account/role/permission pack is
   explicitly approved.
5. `init-module.md` when the module does not exist.
6. `init-entity.md` for model/service/mock-data/routes/list/detail.
7. `screen-list.md`, `screen-detail.md`, and `actions.md` for refinements.
8. Finish gate and tail chain from the main Angular skill.

## Final response requirements

The final response for this mode must include:

- template baseline used,
- route/menu entries generated or changed,
- mock rows per listing,
- permission bypass status,
- how reviewers can run the demo locally,
- a prominent not-production statement,
- Prototype assumptions to confirm,
- next step when the real API/backend exists.

Keep the response runtime-localized for the user, while source files and reusable
skill text stay English-only.
