# Playwright Browser Testing

## Contents

- [Runner preservation](#runner-preservation)
- [UI-login-first](#ui-login-first)
- [Storage state](#storage-state)
- [Assertions and waiting](#assertions-and-waiting)
- [Artifacts](#artifacts)

## Runner preservation

Load this reference only when Playwright is already configured or the approved
scope explicitly calls for it. Preserve existing Cypress, Robot Framework, or
other existing runner conventions; do not migrate or duplicate them merely to
use this reference. Reuse the current config, web server, projects, fixtures,
reporters, and commands.

## UI-login-first

Authenticate through the real UI. Do not use `page.evaluate` to inject auth,
and do not write tokens to `localStorage`; both shortcuts are forbidden for
authenticated evidence. Use accessible labels and roles.
Keep one visible login test that does not use `storageState`.

If SSO, MFA, CAPTCHA, VPN, or device approval cannot be automated safely, use
`manual-real-ui` and mark automated execution blocked rather than bypassing the
control.

## Storage state

Generate per-persona state for each environment through a UI-login setup
project:

```text
<runner-artifact-root>/auth/<environment-id>/<persona-id>.json
```

Each `<environment-id>/<persona-id>.json` is `local_only`, ignored by Git,
redacted from reports, and regenerated when stale. Never share a state file
between personas, tenants, or environments. Record its logical ID and
provenance, never cookies or tokens.

## Assertions and waiting

Prefer accessible locators (`getByRole`, `getByLabel`, visible text) and
user-observable state. Wait for the specific response, control, URL, or state
transition required by the behavior. Do not impose universal `networkidle`.
Assert server-side/API denial for authorization boundaries when applicable;
hidden controls alone are insufficient.

Reuse existing data helpers. Tests should be retry-safe and isolated. Parallel
workers must not modify shared Playwright config, global setup, persona
catalogs, snapshots, or aggregate reporters.

## Artifacts

Collect traces, video, screenshots, and reports only under existing runner
retention policy or explicit request. Failure artifacts are diagnostic and
`local_only` by default. A guide screenshot is promotable only through
`ui-evidence-capture`, verified provenance, PII screening, hashing, and
`artifact_context` classification.
