# Test Context, Status, and Evidence v2

## Contents

- [Separation of concerns](#separation-of-concerns)
- [Test context](#test-context)
- [Test status](#test-status)
- [Test evidence](#test-evidence)
- [Freshness and legacy input](#freshness-and-legacy-input)
- [Redaction](#redaction)

## Separation of concerns

`test_context` is the runtime-only execution plan and constraints.
`test_status` is the current orthogonal lifecycle summary. `test_evidence` is
append-oriented, multi-run, multi-case evidence. Written does not mean executed.
Executed does not mean pass.

Build the full context/status/evidence for the exact consumer and pass it
through `context.pass`. User-facing output projects the requirement-linked
result, exact commands and exit codes, failures, skipped checks, blockers, and
next action; it does not echo the full structures by default. Use the validated
portable handoff when `runtime_context_channel` is unsupported or unknown.

## Test context

```yaml
test_context:
  schema_version: 2
  source: sdcorejs-test
  change:
    change_ref: <id-or-none>
    source_spec: <repo-relative-path-or-none>
    source_plan: <repo-relative-path-or-none>
    associated_HEAD_or_diff: <sha-or-diff-fingerprint>
    source_fingerprint: <sha256>
    source_revision_map: {}
  classification:
    test_action: <public-or-internal-action>
    stack_profile: general
    test_levels: []
    repository_kind: single-app # single-app | monorepo | multi-project | test-only | unknown
    environment_class: local
  scope:
    owner: target-project-convention
    owner_repository_id: <stable-repository-id>
    owner_module_id: <module-id-or-null>
    execution_host_repository_id: <stable-repository-id>
    orchestration_root: <path>
    workspaces: []
    target_projects: []
    target_modules: []
    target_paths: []
    routes_or_endpoints: []
    acceptance_criteria: []
    traceability_ids: []
    risk_dimensions: []
  runner:
    package_manager: project-defined
    runner_name: <discovered-runner>
    config_paths: []
    command_sources: []
    existing_scripts: []
    refs_loaded: []
    refs_skipped: []
  environment:
    environment_id: <logical-id>
    class: local
    base_url_source: <key-or-config-path>
    write_policy: isolated-only
    external_effects: []
    required_services: []
    blockers: []
  auth:
    required: false
    discovery_status: not-applicable
    provider: none
    login_mode: not-applicable
    persona_config_paths: []
    persona_ids: []
    storage_state_policy: not-applicable
    storage_states: []
    blockers: []
  data:
    strategy: read-only
    isolation_key: null
    setup_owner: null
    cleanup_owner: null
    cleanup_policy: not-applicable
    external_side_effect_policy: blocked
    records_owned_by_run: []
    ownership_filter: null
    blockers: []
  execution:
    working_directory: <path>
    commands_planned: []
    commands_run: []
    commands_skipped: []
    write_paths_planned: []
    local_artifact_paths: []
  coverage_matrix: []
  redaction_applied: true
```

Use only logical persona IDs and secret/base-URL key references. Planned writes
distinguish shared configuration from module-owned paths.

## Test status

```yaml
test_status:
  planning: missing # missing | planned | approved | not-applicable
  authoring: not-requested # not-requested | not-written | written | updated | existing
  executability: unknown # ready | blocked | unknown | not-applicable
  execution: not-run # not-run | executed | partial | interrupted
  result: unknown # pass | fail | blocked | unknown | not-applicable
  evidence: absent # absent | current | stale | partial
  documentation: not-requested # not-requested | pending | generated | verified | blocked
  blockers: []
```

These fields are independent. A file's existence is not execution evidence. An
executed command is not automatically a pass. Generated documentation is not a
verified capture. Missing credentials/environment produce `blocked`, not fail.
Manual UAT remains distinct from automated pass.

## Test evidence

```yaml
test_evidence:
  schema_version: 2
  source: sdcorejs-test
  change_ref: <id-or-none>
  associated_HEAD_or_diff: <sha-or-diff-fingerprint>
  status:
    planning: planned
    authoring: existing
    executability: ready
    execution: executed
    result: pass
    evidence: current
    documentation: not-requested
  runs:
    - run_id: run-1
      command: <redacted-command>
      command_source: package.json
      cwd: <path>
      runner: <runner>
      package_manager: <ecosystem>
      environment_id: local
      environment_class: local
      evidence_class: unit # unit | golden | container | full-e2e | live-agent | supplemental-smoke
      repository_id: <stable-repository-id>
      source_fingerprint: <sha256>
      portal_revision: <sha-or-null>
      module_revision: <sha-or-null>
      portal_pinned_module_revision: <sha-or-null>
      artifact_hashes: {}
      persona_ids: []
      started_at: <iso-time>
      finished_at: <iso-time>
      duration: <duration>
      exit_code: 0
      passed: <count-or-null>
      failed: <count-or-null>
      skipped: <count-or-null>
      interrupted: false
      failed_specs: []
      first_useful_error: null
      output_digest: <digest>
      artifacts_created: []
      redactions_applied: true
      stale: false
  cases:
    - case_id: case-1
      requirement_refs: [AC-1]
      test_ref: <path-and-case>
      persona_id: null
      result: pass # pass | fail | blocked | skipped | not-run
      evidence_run_id: run-1
      blocker_or_error: null
  data_lifecycle:
    setup_status: not-applicable
    cleanup_status: not-applicable
    residual_data_risk: none
  captures: []
  commands_skipped: []
  blockers: []
  residual_risks: []
  redactions_applied: true
```

Each executed command gets one run. Do not fabricate counts. Interrupted runs,
skipped commands, and cleanup failures cannot pass. Retain only a digest and
the first useful redacted error; discard verbose console streams that may
contain secrets.

## Freshness and legacy input

Evidence is current only when `associated_HEAD_or_diff`, scope, config,
environment, and command match the target state. Otherwise mark it stale.
`stale: false` is a verified fact, not a default.

For module-owned E2E, also require exact repository provenance, source
fingerprint, portal/module/pinned revisions, artifact hashes, actual command,
and evidence class from `_refs/shared/module-e2e-contract.md`. A module/pinned
revision mismatch is `mismatched`, not current. Golden/container/supplemental
smoke cannot satisfy full-E2E evidence.

Legacy v1 evidence remains readable as historical context. Map known fields
conservatively, leave unknown fields unknown, and never infer freshness, pass,
coverage, or documentation verification. Re-run under v2 for a current claim.

## Redaction

`redaction_applied: true` and `redactions_applied: true` are mandatory at their
respective boundaries. Never retain credential values, cookies, tokens,
authorization headers, storageState contents, PII, database dumps, secret URLs,
or raw provider payloads.
