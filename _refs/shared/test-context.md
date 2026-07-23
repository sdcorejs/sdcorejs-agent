# Test Context And Evidence Schema

> Loaded by `sdcorejs-test` to make test planning, execution, and handoffs
> reproducible.

## `test_context`

Emit `test_context` after classification and update it before the final report.

```text
test_context:
  test_action:
  stack_profile:
  target_paths:
  test_level:
  runner:
  package_manager:
  workspace:
  environment_class:
  side_effects_allowed:
  refs_loaded:
  commands_planned:
  commands_skipped:
  write_paths_planned:
  acceptance_criteria:
  traceability_ids:
  contract_id:
  feature_id:
  requirement_revision:
  approved_spec_path:
  approved_spec_hash:
  approved_spec_integrity_hash:
  approved_plan_path:
  approved_plan_hash:
  approved_plan_integrity_hash:
```

Rules:

- `test_action` must match the action chosen by `sdcorejs-test`.
- `stack_profile` must distinguish SDCoreJS profiles from plain framework profiles.
- `commands_skipped` must include a reason for every skipped expected command.
- `acceptance_criteria` must name the source file or say `none_found`.

## `test_evidence`

Emit `test_evidence` for every command that ran.

```text
test_evidence:
  evidence_id:
  kind: unit | integration | e2e | security | regression | manual-check
  requirement_ids:
  control_requirement_ids:
  source: sdcorejs-test
  evidence_type: "{compatibility alias equal to kind}"
  command:
  cwd:
  started_at:
  finished_at:
  observed_at:
  observed_by: sdcorejs-test
  observation_source: command | report | tool
  exit_code:
  outcome: passed | failed | blocked
  observed_result:
  expected_result_ref:
  duration:
  passed:
  failed:
  skipped:
  failed_specs:
  first_useful_error:
  environment:
    environment_name:
    runtime_versions: {}
    platform:
    locale:
    timezone:
    environment_fingerprint:
  verified_head:
  associated_diff:
    base_head:
    head:
    diff_hash:
    changed_paths: []
  diff_base: "{compatibility alias equal to associated_diff.base_head}"
  associated_head_or_diff: "{compatibility alias equal to associated_diff.head or diff_hash}"
  contract_id:
  feature_id:
  requirement_revision:
  approved_spec_path:
  approved_spec_hash:
  approved_spec_integrity_hash:
  approved_plan_path:
  approved_plan_hash:
  approved_plan_integrity_hash:
  relevant_paths:
  relevant_path_hashes: {}
  relevant_paths_hash:
  output_digest:
  environment_class: "{compatibility alias equal to environment.environment_name}"
  artifacts: []
  redaction:
    redaction_applied:
    redacted_fields: []
    excluded_paths: []
    secret_scan: passed | failed | unavailable | not_applicable
    pii_redacted:
    logs_sanitized:
  redaction_applied: "{compatibility alias equal to redaction.redaction_applied}"
  freshness:
    value: current | stale | unknown
    reasons: []
    evaluated_at:
    head_changed:
  freshness_value: "{compatibility alias equal to freshness.value}"
  stale: false | true | unknown
  stale_reason:
```

Rules:

- `freshness.value: current` requires matching `contract_id`, `feature_id`,
  `requirement_revision`, `approved_spec_path`, `approved_spec_hash`,
  `approved_spec_integrity_hash`, `approved_plan_path`, `approved_plan_hash`,
  and `approved_plan_integrity_hash`, plus a current relevant-path fingerprint. A
  global HEAD change alone does not stale product evidence when all relevant-path
  hashes still match; record the HEAD movement transparently.
- When a product contract is in scope, copy `feature_id`, the approved-spec
  path/body/integrity identity, and the approved-plan path/body/integrity
  identity from the validated execution authority.
  Missing or caller-invented values make freshness `unknown`; mismatches make it
  `stale` and cannot support a passed/ready claim.
- `freshness_value` and `stale` are backward-compatible projections of
  `freshness.value`: use `false` for
  `current`, `true` for `stale`, and `unknown` for `unknown`. Never persist
  contradictory values.
- `redaction_applied`, `environment_class`, `diff_base`,
  `associated_head_or_diff`, and `evidence_type` are compatibility projections.
  They must agree with their canonical nested or product-evidence fields.
- Automated evidence updates verification status only. It never changes UAT to
  `passed`; UAT requires a separately recorded manual execution or approved
  waiver/deferment.
- If tests were not run, do not fabricate pass/fail counts. State why execution was skipped.
- If artifacts were created, list them and whether they are intentionally untracked.

## Debug Handoff

When handing off to `sdcorejs-debug`, pass the final `test_context`, the relevant `test_evidence`, and the smallest failing command or reproduction.

Do not hand off stale or redacted-away evidence without saying what is missing.
Redact secrets and PII before hashing, persistence, or product/ship handoff.

## Git/PR Use

When the user later asks for git artifacts, include the current `test_context` and `test_evidence` summary in commit/PR notes only when it is relevant and current. Do not imply tests passed from stale evidence.
