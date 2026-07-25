# Robot Framework Browser Conventions

## Contents

- [Applicability](#applicability)
- [Preservation rules](#preservation-rules)
- [Authentication and environment](#authentication-and-environment)
- [Authoring](#authoring)
- [Execution and evidence](#execution-and-evidence)

## Applicability

Load only when existing `*.robot`/`*.resource` files, Robot configuration, or
project dependencies prove Robot Framework is the target runner. Robot Browser
may use a Playwright engine internally, but that does not authorize replacing
the suite with Playwright Test.

## Preservation rules

Preserve the project's resource hierarchy, variable-file selection, keyword
libraries, runner wrapper, output directory, tags, parallelization, and report
integration. Existing low/high/verification keyword layers may be followed when
present; do not impose a specific product layout or keyword naming scheme on a
plain Robot project.

Prefer existing stable selectors. Accessible roles/labels and project-owned
test IDs are usually safer than generated XPath. Inspector exports can supply
selectors and observed state, but cannot invent flows, expected results, auth,
data, routes, or overlay behavior.

## Authentication and environment

Use a stable logical persona ID. Resolve credentials from an environment
variable or existing secret-provider configuration through secret key
references:

```yaml
credentialSource:
  type: env
  usernameRef: E2E_VIEWER_USERNAME
  passwordRef: E2E_VIEWER_PASSWORD
```

Never put plaintext username/password, tokens, cookies, or secret URLs in a
Robot suite, resource, YAML variable file, command, log, or report. Missing
references block execution. Preserve real-UI login; do not inject tokens into
browser storage.

## Authoring

- Derive cases from requirements and risk, not a universal positive/negative/
  navigation checklist.
- Reuse project keywords for browser setup, login, navigation, and cleanup.
- Wait for a specific element, response, or state transition using existing
  helpers; do not add arbitrary sleeps or a universal network-idle rule.
- Assert server/API denial separately when authorization is in scope.
- Use run-owned data and idempotent cleanup.

## Execution and evidence

Discover the existing `robot`, `pabot`, task-runner, or CI command and correct
cwd. Never invent a command or auto-install browsers. Keep Robot output/log/
report files local-only unless an explicit sanitized durable report is
approved. Return v2 test context/status/evidence with case IDs, persona IDs,
cleanup, redactions, and the first useful failure.
