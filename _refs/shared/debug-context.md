# Debug Context Schema

> Loaded by `sdcorejs-debug` to make bug investigations reproducible and safe to
> hand off to `sdcorejs-ship`, `sdcorejs-review`, `sdcorejs-repair-loop`, and
> `sdcorejs-git`.

## Required Final Block

Every debug session emits a redacted `debug_context` block:

```yaml
debug_context:
  source: sdcorejs-debug
  debug_mode: runtime-error | failing-test | wrong-behavior | flaky | ci-only | prod-only | performance-anomaly | environment-config | dependency-regression | security-sensitive | data-integrity | build-compile | browser-device-specific | unknown
  bug_class: null-or-undefined | async-race | state-lifecycle | validation | permission-authz | authentication | routing | database-query | transaction-consistency | serialization-deserialization | caching-staleness | timezone-locale | dependency-version | configuration | environment | network-third-party | type-contract | test-contract | performance-regression | memory-leak | unknown
  stack_profile: core-ui-angular | legacy-core-ui-angular | plain-angular | sdcorejs-nestjs | plain-nestjs | nextjs-build-website | plain-nextjs | react-vite | react-cra | react-next-generic | node-general | general
  repro_status: local-confirmed | evidence-confirmed | flaky-confirmed | blocked
  observed:
  expected:
  root_cause:
  root_hypothesis_id:
  confidence: high | medium | low
  files_touched:
    - path
  diagnostic_instrumentation:
    added:
    removed:
    remaining:
  regression_tests:
    added:
    updated:
    delegated_to_sdcorejs_test:
  commands_run:
    - command:
      result:
      exit:
      notes:
  commands_skipped:
    - command_or_probe:
      reason:
  package_manager:
  environment:
  secret_redaction:
    applied: true | false
    notes:
  verification:
    original_repro:
    focused_regression:
    broader_checks:
  ship_handoff:
    needed: true | false
    reason:
```

## Rules

- Do not include secrets, PII, raw production payloads, or full secret-bearing
  lines.
- `commands_run` must contain only commands that actually ran.
- Missing scripts, unsafe probes, and blocked environments belong in
  `commands_skipped` with evidence.
- Do not claim tests, build, lint, repro, CI, staging, or production passed
  unless the command or environment verification actually passed in the current
  session.
- If `repro_status` is `evidence-confirmed`, record what evidence replaces
  local reproduction and what original environment verification remains.
- If `repro_status` is `flaky-confirmed`, record pass/fail counts and sample
  size.
- If `repro_status` is `blocked`, record the missing evidence and do not report
  the bug as fixed.

## Handoff Use

- `sdcorejs-ship` consumes `debug_context.verification`, changed files,
  regression test evidence, and `ship_handoff`.
- `sdcorejs-review` can use `debug_context` for a follow-up security,
  performance, architecture, accessibility, or code review.
- `sdcorejs-repair-loop` preserves original finding IDs and may include
  `debug_context` when a repair item became a single-bug investigation.
- `sdcorejs-git` may summarize current redacted `debug_context` in commit or PR
  artifacts only after ship gates pass and the user asks for those artifacts.

