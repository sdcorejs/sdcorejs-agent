# UI Evidence Capture

## Contents

- [Action boundary](#action-boundary)
- [Capture contract](#capture-contract)
- [Verification](#verification)
- [Classification](#classification)
- [Documentation handoff](#documentation-handoff)

## Action boundary

`ui-evidence-capture` is a direct/internal test action used by documentation,
ship, or an explicitly requested capture. It reuses the target project's
existing browser runner and authenticated persona fixtures. It does not install
a runner, start an app, invent routes, bypass login, write guide prose, or
invoke Git.

## Capture contract

```yaml
ui_capture_context:
  schema_version: 1
  capture_id: capture-orders-list
  change_ref: <change-id>
  guide_path: .sdcorejs/documentation/user-guides/orders.md
  module_or_feature: orders
  scenario_id: orders-list-supervisor
  source_test_ref: e2e/orders-list.spec.ts
  associated_HEAD_or_diff: <sha-or-diff-fingerprint>
  environment:
    environment_id: local
    class: local
    base_url_source: E2E_BASE_URL
  persona:
    persona_id: supervisor
    auth_provenance: real-ui
    storage_state_id: supervisor
  runner: playwright
  target:
    route_or_state: /orders#orders-list-loaded
    viewport: { width: 1440, height: 1000 }
    locale: <detected-or-null>
    theme: <detected-or-null>
    selector_or_region: main
  assertions:
    login_redirect_absent: true
    access_denied_absent: true
    target_state_visible: true
    loading_complete: true
    pii_screening: pass
  image:
    file: .sdcorejs/documentation/user-guides/images/orders-list.png
    sha256: <digest>
    width: 1440
    height: 1000
    captured_at: <iso-time>
    kind: documentation
  redactions_applied: true
  classification: documentation # documentation | diagnostic
  result: verified
  blocker: null
```

References, not secret values, identify environment and actor.

## Verification

A verified capture requires:

1. the expected persona authenticated through `real-ui` or approved
   `manual-real-ui`;
2. `login_redirect_absent`, `access_denied_absent`, and
   `target_state_visible` all true;
3. the target state asserted before capture;
4. loading completed, PII screening passed, and necessary redactions applied;
5. an existing, non-empty, valid-decodable image with dimensions and SHA-256;
6. provenance tied to current `associated_HEAD_or_diff`.

A login page, access-denied page, blank state, stale build, failed selector, or
unknown auth provenance is not documentation evidence.

## Classification

- Verified, current, PII-safe guide capture: `documentation` and
  `required_with_change` when referenced by the changed guide.
- Failure screenshot, trace image, login redirect, or access-denied capture:
  `diagnostic` and `local_only`.
- Capture containing PII, secrets, tokens, or uncertain identity: blocked,
  `local_only`, and never promotable.
- Unknown or ambiguous provenance: blocked until re-captured or explicitly
  excluded.

Do not commit `storageState`, raw traces, videos, or diagnostic screenshots.

## Documentation handoff

Return `test_context`, `test_status`, `test_evidence.captures`,
`ui_capture_context`, and `artifact_context` to `sdcorejs-documentation`.
Documentation may link the image only after verification. It owns guide prose;
the test track owns the real UI capture and technical evidence.
