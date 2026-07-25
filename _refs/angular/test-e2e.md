# Angular End-to-End Testing

Use only for `core-ui-angular` or `legacy-core-ui-angular`. For `plain-angular`,
use `_refs/shared/test-generic.md`. Always apply
`_refs/shared/test-environment-guard.md`.

## Runner and scope

Preserve an existing Playwright, Cypress, Robot Framework, WebdriverIO, or other
browser runner. Load the runner-specific reference only when detected. Select
journeys from current acceptance criteria and high-risk boundaries; framework
or CRUD shape alone does not mandate cases.

## Browser behavior

- Navigate through the same route and controls a user uses.
- Prefer accessible roles, labels, names, and stable project-owned test IDs.
- Wait for a specific response, URL, control, or target state. Do not impose
  universal network-idle waits.
- Use real UI login for authenticated evidence and isolated per-persona state.
- Reuse project data helpers and record run ownership plus cleanup.
- Prove both allowed behavior and server-side/API denial when authorization is
  in scope; hiding a button alone is insufficient.
- Preserve responsive, keyboard, accessibility, and browser coverage only when
  required or already enforced by the project.

Do not mock the auth layer or product API merely to call a test e2e. If the
environment cannot support safe real behavior, mark the scenario blocked or
move the assertion to the appropriate lower boundary.

## Artifacts

Runner screenshots, traces, video, and raw reports are diagnostic/local-only by
default. Guide images require `_refs/shared/test-ui-evidence.md`, verified
provenance, PII screening, hashing, and artifact closure.

## Evidence

Run only discovered commands from the correct workspace. Return persona IDs and
key references, never credentials, plus v2 context/status/evidence, case-to-
requirement mapping, data cleanup, blockers, and capture classification.
