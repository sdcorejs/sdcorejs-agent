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
  command:
  cwd:
  exit_code:
  duration:
  passed:
  failed:
  skipped:
  failed_specs:
  first_useful_error:
  current_head_or_diff:
  environment_class:
  artifacts_created:
  redactions_applied:
  stale:
```

Rules:

- `stale: false` only when the command ran in the current turn or the evidence is clearly tied to the current `HEAD`/diff.
- If tests were not run, do not fabricate pass/fail counts. State why execution was skipped.
- If artifacts were created, list them and whether they are intentionally untracked.

## Debug Handoff

When handing off to `sdcorejs-debug`, pass the final `test_context`, the relevant `test_evidence`, and the smallest failing command or reproduction.

Do not hand off stale or redacted-away evidence without saying what is missing.

## Git/PR Use

When the user later asks for git artifacts, include the current `test_context` and `test_evidence` summary in commit/PR notes only when it is relevant and current. Do not imply tests passed from stale evidence.
