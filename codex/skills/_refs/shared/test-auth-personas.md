# Test Authentication and Personas

## Contents

- [Discovery](#discovery)
- [Persona contract](#persona-contract)
- [Fail-closed rules](#fail-closed-rules)
- [Authentication controls](#authentication-controls)
- [Safe reporting](#safe-reporting)

## Discovery

Decide whether authentication is required from requirements, routes, existing
tests, guards, and the target environment. Do not assume authentication for a
public flow. Prefer an existing persona/environment catalog. A persona is a
stable logical ID describing permissions and tenant context, not a username.

## Persona contract

Use a versioned, project-owned persona/environment catalog when authenticated
automation is in scope. Store references only:

```yaml
schemaVersion: 1
environments:
  local:
    baseUrlEnv: E2E_BASE_URL
    writePolicy: isolated-only
personas:
  supervisor:
    roles: [orders.approve]
    tenantRef: TENANT_ALPHA_ID
    credentialSource:
      type: env # env | existing-secret-provider | manual
      usernameRef: E2E_SUPERVISOR_USERNAME
      passwordRef: E2E_SUPERVISOR_PASSWORD
    storageStateId: supervisor
```

`credentialSource.type` is `env | existing-secret-provider | manual`.
`usernameRef` and `passwordRef` are secret key references. Never persist
credential values in skills, configs, fixtures, reports, screenshots, traces,
or chat output. Do not infer persona metadata from a username or role label;
resolve it from the selected catalog and logical environment.

## Fail-closed rules

Before an authenticated run, resolve the selected environment and every persona
reference. Missing base URL, username key, password key, tenant key, or secret
provider access is missing and makes executability blocked. Report only stable logical
persona IDs and missing key names, for example `missing:E2E_VIEWER_PASSWORD`.

Do not fall back to default credentials, another persona, a mock auth layer, or
client-side token injection. Unknown auth provenance is blocked.

## Authentication controls

Use real UI login for browser evidence when automation is supported. SSO, MFA,
CAPTCHA, VPN, device trust, expiring approval, or other interactive controls may
require `manual-real-ui`. Record the constraint and request manual approval or
human completion; do not bypass it.

Keep at least one visible login test that proves the actual login page and does
not use saved auth state. Authorization tests must cover both allowed behavior
plus unauthorized direct URL navigation and server/API denial when required.
Cross-tenant/resource isolation is added only when the product boundary or risk
requires it; use isolated personas and owned data.

## Safe reporting

Record auth provenance (`real-ui`, `manual-real-ui`, or `not-applicable`),
persona IDs, role/tenant references, and redaction status. Never echo
environment values, cookies, tokens, headers, one-time codes, or raw provider
responses. If a credential appears in command output, redact before retaining
the evidence summary.
