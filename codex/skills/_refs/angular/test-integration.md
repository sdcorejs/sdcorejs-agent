# Angular Integration Testing

Use only for `core-ui-angular` or `legacy-core-ui-angular`. For `plain-angular`,
use `_refs/shared/test-generic.md`.

## Scope

Choose integration tests when requirements depend on multiple Angular pieces:
rendering plus forms, router transitions, dependency injection, HTTP adapters,
state management, overlays, permission-aware controls, or Core UI composition.
Do not create a fixed CRUD checklist.

## Test shape

- Render through the project's existing TestBed, component harness, or Testing
  Library setup.
- Query by accessible role, label, and visible state where possible.
- Reuse existing HTTP/router/provider helpers and assert meaningful contracts.
- Cover success, validation, denial, empty/error state, or retry only when the
  acceptance criteria or changed risk requires it.
- Keep data deterministic and owned by the test. Restore overrides and timers.

For authorization, component integration may prove visibility and interaction,
but server-side/API denial needs its own boundary test when applicable.

## Execution

Discover the current runner and correct workspace. Preserve configured coverage
policy and commands; do not install dependencies or impose a threshold. Return
requirement-linked v2 context/status/evidence and cleanup results.
