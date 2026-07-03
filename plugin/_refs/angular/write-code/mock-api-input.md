> **Reference for the `sdcorejs-angular` orchestrator.** Loaded when Angular UI
> generation is driven by a mock API contract, OpenAPI/Swagger file, Postman
> collection, MSW handler, endpoint list, JSON examples, API schema, or sample
> cURL request/response. Not a standalone skill.

# Mock API Input - Contract To UI Prototype

## Purpose

Turn PRD plus mock API artifacts into a runnable Angular UI prototype without
waiting for a live backend. The generated UI must let PO/QC users navigate,
create, edit, delete, and inspect realistic records using a mock-first service
that preserves the important contract shape.

## When To Run

Run this reference before building `EntitySchema`, models, services, or screens
when the input includes any of:

- mock API docs or endpoint tables
- OpenAPI, Swagger, Postman, Insomnia, MSW, WireMock, Prism, or JSON Server specs
- request/response examples, JSON fixtures, or sample cURL commands
- API schemas intended to drive a UI before backend integration

Also run `./input-analysis.md` for UI-affecting work and
`./reuse-existing-entities.md` before creating or extending contracts.

## Source Priority

Use source artifacts in this order:

1. Approved PRD, user stories, and acceptance criteria for behavior.
2. Mock API contract for data shape, endpoints, states, examples, and errors.
3. Visual/design handoff for layout and interaction structure.
4. Existing target-project code for naming, routes, services, and UI primitives.

If the PRD conflicts with the mock API, stop and surface the mismatch before
coding unless the user has already approved which source wins.

## Required Planning Output

Before implementation, output this concise block in the user's language while
keeping identifiers, paths, methods, endpoint paths, and model names in English:

```text
Mock API contract mapping:
- Source artifact:
  - <file/path/pasted source and format>
- Endpoint inventory:
  - LIST: <method path, params, response shape, or "not provided">
  - DETAIL: <method path, params, response shape, or "not provided">
  - CREATE: <method path, request, response, or "not provided">
  - UPDATE: <method path, request, response, or "not provided">
  - DELETE: <method path, request, response, or "not provided">
  - ACTIONS: <custom endpoints or "none">
  - SELECT/LOOKUP: <related entity endpoints or "none">
- Entities and relationships:
  - <primary + related entities>
- Service contract:
  - Public models: <SaveReq/CreateReq/UpdateReq/DTO/ListRes/DetailRes>
  - Raw API types/mappers needed: <items or "none">
- UI mapping:
  - List columns/filters/sort:
  - Create/update controls and validators:
  - Detail read-only fields:
  - Loading/empty/error/success states:
- Prototype mode:
  - <mock-first localStorage | live API integration> and reason
- Ambiguities:
  - <missing behavior/field/state decisions>
```

## Endpoint Inventory Rules

- Normalize each endpoint into UI states: list, detail, create, update, delete,
  custom action, lookup/select, upload/download, or child collection.
- Preserve HTTP method, path parameters, query parameters, request body,
  response body, example values, enum/status values, and documented error cases.
- Map paging/filter/sort conventions from the contract when present. If absent,
  use the project's existing `PagingRequest`/`PagingResponse` conventions and
  mark the assumption.
- Treat custom endpoints such as `approve`, `reject`, `cancel`, `submit`,
  `sync`, `export`, or `import` as actions and route them through
  `_refs/angular/write-code/actions.md`.
- For parent detail-scoped child collections, follow `screen-detail.md`: child
  CRUD runs in modal/drawer inside the parent DETAIL screen, passes the current
  parent id, and preserves the parent route plus active tab/section.

## Service Mode Decision

- Default PO prototype mode: generate a mock-first service backed by
  `MockCrudStore`/`localStorage`, seeded from contract examples plus realistic
  generated rows.
- Use live `BaseService`/API integration only when a runnable backend endpoint,
  base URL/configuration, auth expectation, and project service convention are
  explicitly available or the user explicitly asks for live integration.
- A mock API document alone is not a live backend. Do not hard-code absolute mock
  URLs into application source just because they appear in a sample.
- Even in mock-first mode, keep method names, request payloads, response fields,
  enum/status values, and error paths close enough to the contract that swapping
  to live API later is mechanical.

## Model And Mapper Rules

- Service public models (`SaveReq`, `CreateReq`, `UpdateReq`, `DTO`, `ListRes`,
  `DetailRes`) describe what components consume or send through the Service.
- Raw backend/mock API shapes that differ from the public Service contract must
  live in internal types near the Service/mapper, for example `<Entity>ApiRes`.
- Every public model field must be accepted, returned, processed, or derived by
  the Service/mapper. Do not add fields only because they are convenient in the
  component.
- UI-only state (`checked`, `selected`, `expanded`, `children`, `label`,
  `displayName`, `disabled`, `color`, `icon`) belongs in a component ViewModel
  unless the Service derives and guarantees it.
- If create and update payloads differ, generate separate request interfaces
  instead of forcing one `SaveReq`.

## Mock Data Rules

- Seed from provided examples first, after removing secrets, tokens, credentials,
  and real personal data.
- Generate enough additional realistic rows to reach the standard 20-40 row
  target for list UX, filtering, sorting, paging, empty states, and edge cases.
- Preserve enum/status distributions from the contract and include at least one
  row for each documented important state.
- Preserve relationship ids and lookup labels consistently across related mock
  data files. Do not create orphaned foreign keys.
- Include representative edge cases documented by the API, such as nullable
  optional fields, long text, inactive/closed states, empty child collections, or
  validation failures. Keep invalid records out of normal list seed data unless
  the UI explicitly displays invalid imports/errors.

## UI Generation Rules

- Derive `EntitySchema` from the merged PRD plus mock API contract, not from a
  generic entity name alone.
- List pages use lightweight list response fields for columns and filters.
- Create/update forms use request payload fields and validators from schema,
  required flags, enums, min/max, length, regex, and business rules.
- Detail screens show response meta/status/audit/derived fields as read-only
  sections when they are returned by detail/list responses.
- Relation controls use existing services/select components when available; do
  not force users to reselect a parent that is already known from the current
  detail context.
- Loading, empty, error, disabled, success, and permission states must be visible
  in the generated UI when the contract or PRD describes them.

## Verification Expectations

- Run the usual unit/component specs generated by the Angular track.
- When a browser/dev server is available, verify the generated route renders
  seed rows and that create/update/delete or the main custom action updates the
  mock store without leaving the route broken.
- If browser verification is unavailable, report the exact command the user can
  run locally and perform a code-level UI/contract review instead.

## Must Not

- Treat a mock API contract as permission to skip PRD/acceptance behavior.
- Switch to live API mode from contract text alone.
- Hard-code sample absolute URLs, credentials, tokens, or personal data.
- Expose raw API objects directly to components when a Service mapper is needed.
- Invent undocumented endpoints, roles, permissions, analytics, or side effects.
- Generate a selector/lookup by duplicating an existing related service.
