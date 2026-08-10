# Verification Gate

## Contents

- [Purpose](#purpose)
- [Invocation](#invocation)
- [Classify Mode](#step-1---classify-verification_mode)
- [Select Scope](#step-2---select-acceptance_scope)
- [Discover Commands](#step-3---discover-commands)
- [Verify By Mode](#step-4---verify-by-mode)
- [Next.js Profile Gate](#step-5---nextjs-profile-gate)
- [Convergence Gate](#step-55---convergence-gate)
- [Failure Handoff](#step-6---failure-handoff)
- [Report](#step-7---report)
- [Rules](#rules)
- [Cross-references](#cross-references)

Reference body for `sdcorejs-ship (verify-before-done mode)`. Load this file
only when that mode runs.

## Purpose

This gate proves the current work against the correct delivery contract before
any final branch-ready or Git artifact path. Passing tests are useful evidence,
but they are not automatically acceptance evidence. The gate classifies the
verification mode, selects the correct scope, discovers available commands, and
records current evidence in `ship_context`.

Read `_refs/shared/decision-coverage.md`. Verification preserves
`decision_coverage` and `goal_backward_review` exactly and treats missing
record/task/evidence coverage, invariant gaps, or unresolved goal-backward
critique blockers as failed readiness evidence rather than silently narrowing
the acceptance scope.
Read `_refs/shared/validation-map.md`. For plan-backed acceptance, call
`evaluateValidationEvidence` from `_refs/shared/validation-map.mjs` with the
approved map, exact coverage projection, actual evidence, and current state.
Read `_refs/shared/convergence-contract.md` and use its executable evaluator;
verification is not complete until delivery convergence is current.

## Invocation

Run before final `sdcorejs-ship (branch-ready mode)` when work is being marked
done, merged, pushed, released, or handed to `sdcorejs-git`.

Do not skip this gate for bug fixes, docs-only changes, dependency updates, or
specless changes. Instead, select the matching `verification_mode`.

## Step 1 - Classify verification_mode

Required values:

| verification_mode | Definition |
|---|---|
| `feature-acceptance` | A spec, plan, product ledger, acceptance criteria, or approved test plan exists and must be verified criterion by criterion. |
| `bugfix-verification` | A bug fix needs original repro or evidence-equivalent repro, regression evidence, and broader checks when available. |
| `specless-verification` | A small change has no explicit spec; verify changed scope and report manual done confirmation needs. |
| `dependency-regression` | Package manifest or lockfile changes need dependency risk, install consistency, audit where supported, and impacted checks. |
| `docs-only-hygiene` | Documentation, prompt, skill-text, fixture, or mirror-only changes need text/mirror/routing hygiene rather than product AC. |
| `release-readiness` | Release, tag, publish, or version preparation needs a release ledger and explicit approval for destructive actions. |
| `branch-ready-only` | The user asked only for final read-only branch hygiene; run branch-ready mode instead of feature acceptance. |

Rules:

- Do not treat every ship request as `feature-acceptance`.
- If no feature spec exists for a bug fix, use `bugfix-verification` rather than
  inventing acceptance criteria.
- If no spec exists for a small change, use `specless-verification` and state
  the manual confirmation gap.
- If only docs/prompt/skill text changed, use `docs-only-hygiene`.
- If package manifests or lockfiles changed, use `dependency-regression`.
- If release/tag/publish/version wording is present, use `release-readiness`.
- Record `verification_mode` in `ship_context`.

## Step 2 - Select acceptance_scope

Select the scope in this priority order:

1. Explicit user-provided spec, path, criteria, task ID, bug contract, or
   release range.
2. Current runtime task, approved plan/spec, or active workflow context.
3. Product ledger, plan ledger, or test plan associated with the current task.
4. Caller contexts: `review_context`, `repair_source`, `debug_context`, or
   `test_context`.
5. Changed files and current diff scope.
6. If multiple plausible scopes remain, ask one numbered choice using
   `_refs/shared/user-choice-prompt.md`.

Record:

```yaml
acceptance_scope:
  selected_spec:
  selected_plan:
  selected_task:
  changed_files_scope:
  criteria_count:
  manual_criteria:
  deferred_criteria:
  selection_reason:
```

Rules:

- Do not blindly pick the newest spec in a track folder.
- Do not default to `TRACK=angular` examples.
- Do not fabricate acceptance criteria when no spec or AC exists.
- If multiple specs match and caller context does not disambiguate, ask.
- Include the selected scope in `ship_context`.

## Step 3 - Discover commands

Discover verification commands from package manager, lockfiles, workspace
configuration, package.json scripts, project config, original failing command,
`test_context`, `debug_context`, `review_context`, `repair_source`, selected
criteria, and repo docs.

Rules:

- Do not hardcode npm/npx as a universal default.
- Do not mix npm, pnpm, yarn, or bun.
- Do not invent missing scripts.
- Do not assume build, lint, test, e2e, typecheck, i18n, content, smoke, or
  start scripts exist.
- Do not use auto-download probe tools without explicit approval for the exact
  command and reason.
- If a command, script, package manager, browser binary, server, or external
  probe is unavailable, record it in `commands_skipped` with evidence.
- Prefer focused commands first, then broader checks when available and
  appropriate.
- For monorepos, respect workspace/package scope when detectable.
- `commands_run` includes only commands actually run.
- Do not claim verification passed for a skipped command.

Use package-manager placeholders in guidance only after detection, such as
`<pm> run <existing-script>`. Replace placeholders with real commands in
reports only when the script exists.

## Step 4 - Verify By Mode

### feature-acceptance

1. Extract explicit AC from the selected scope and validate the approved
   `plan_context.validation_map` when present.
2. Map each AC to evidence: command, test, manual check, file inspection,
   screenshot/probe, or deferred note.
3. Mark each AC as `PASS`, `FAIL`, `MANUAL`, `DEFERRED`, or
   `NOT_APPLICABLE`.
4. Do not collapse multiple ACs into one generic tests-passed line.
5. Manual/deferred criteria require explicit user acknowledgement.
6. If any required AC fails, final verdict is `BLOCKED`.
7. If manual criteria remain, final verdict cannot be `READY` unless the user
   explicitly accepts the manual evidence or deferral under repo policy.
8. A failed, stale, drifted, manual-unacknowledged, or deferred
   `evaluateValidationEvidence` result blocks an automated `READY` verdict.

### bugfix-verification

Verify:

- original repro or evidence-equivalent focused repro;
- focused regression test if available;
- broader discovered checks when appropriate;
- no diagnostic instrumentation remains unless intentionally approved;
- `debug_context` was consumed when present;
- verification gaps are explicit.

If the original repro cannot run locally, record evidence-confirmed status and
state what remains unverified. Do not claim fixed in an environment that remains
unverified.

### specless-verification

Use changed file scope, current diff, and discovered project scripts. Do not
invent product AC. Report "manual done confirmation required" when there is no
objective AC. Use `READY_WITH_WARNINGS` or `DEFERRED` when verification is
partial.

### docs-only-hygiene

Product acceptance is usually `NOT_APPLICABLE`. Still run applicable discovered
hygiene:

- mirror sync/check if skills or refs changed;
- text hygiene if available;
- prompt e2e or invariant tests if fixtures, routing, skills, or refs changed;
- markdown/frontmatter validation if relevant;
- package-manager/script-discovered checks only.

Do not run expensive product e2e unless the changed scope or AC requires it.
Record docs-only rationale in `ship_context`.

### dependency-regression

Treat package and lockfile changes as high risk. Verify:

- dependency update type: patch, minor, major, security-fix,
  transitive-lockfile-only, dev-only, runtime, or toolchain;
- detected package manager and lockfile consistency;
- install or lockfile validation using the detected package manager when
  supported by project policy;
- audit only when supported by the package manager/tooling;
- impacted build, typecheck, lint, test, and smoke checks when available.

Unsupported audit/update commands are skipped with evidence, not invented.

### release-readiness

Collect release evidence:

- release type;
- version source;
- release range;
- changelog status;
- version bump status;
- tag status;
- publish status;
- branch status;
- CI/status evidence if available;
- compatibility/risk notes;
- rollback plan;
- manual approval requirements.

Do not create tags, push tags, bump versions, create GitHub releases, publish
packages, or push release branches by default. Every destructive release action
requires explicit approval.

### branch-ready-only

Return to `sdcorejs-ship (branch-ready mode)` and record that feature/product
verification was not in scope.

## Step 5 - Next.js Profile Gate

Build-website checks such as i18n parity, content length, Lighthouse SEO,
heading order, sitemap, metadata, localized routes, content parity, and public
site caching apply only when:

- `stack_profile` is `nextjs-build-website`; or
- acceptance criteria explicitly require those contracts; or
- project scripts/docs clearly define those checks for the target scope.

Plain Next.js projects use generic Next verification based on actual scripts,
routes, tests, build, smoke checks, and project evidence. Do not block
`plain-nextjs` dashboards, admin tools, or internal apps for missing
build-website conventions. Record `stack_profile` evidence when used.

## Step 5.5 - Convergence Gate

Assemble the canonical mode input from approved intent/spec/architecture/plan,
`execution_context.convergence_trace`, the validation map, current
`test_evidence.convergence_evidence_refs`, review architecture/convention
findings, required ledgers, source/module/pin identity, lifecycle writes, and
artifact closure. Call `evaluateConvergence`; do not reconstruct its rules.
Preserve its compact result as `ship_context.convergence_result`. `BLOCKED`,
`DEFERRED`, `fresh: false`, missing input, or a later write blocks readiness.

## Step 6 - Failure Handoff

When verification fails:

- Use `sdcorejs-repair-loop` for fixable collections of findings.
- Use `sdcorejs-debug` for concrete root-cause bugs or failing commands.
- Use `sdcorejs-test` for missing or large test coverage work.
- Use `sdcorejs-review` for quality, security, performance, accessibility, or
  architecture review requests.
- Do not patch directly inside verify-before-done.

Pass:

```yaml
repair_source:
  kind: verify-before-done
  verification_mode:
  acceptance_scope:
  original_commands:
  package_manager:
  failed_criteria:
  associated_HEAD_or_diff:
```

After repair/debug/test changes, re-run the relevant verification and then the
final branch-ready gate.

## Step 7 - Report

Output a concise report in the user's language and include a redacted
`ship_context` block:

```yaml
ship_context:
  source: sdcorejs-ship
  decision_coverage:
    schema_version: 1
    revision: <integer>
    records: []
    history: []
  goal_backward_review:
    schema_version: 1
    mode: sdcorejs-plan:goal-backward
    goals: []
    tasks: []
    repository_inventory:
      repositories: []
    critique_history: []
  validation_map: []
  convergence_result: <exact compact evaluateConvergence result>
  mode: verify-before-done
  verification_mode:
  delivery_type:
  target_root:
  current_HEAD:
  associated_HEAD_or_diff:
  acceptance_scope:
    selected_spec:
    selected_plan:
    selected_task:
    changed_files_scope:
    criteria_count:
    manual_criteria:
    deferred_criteria:
    selection_reason:
  verification:
    commands_run:
      - command:
        cwd:
        started_at:
        finished_at:
        result:
        exit:
        associated_HEAD_or_diff:
        output_digest:
        environment_fingerprint:
    commands_skipped:
      - command_or_probe:
        reason:
    criteria:
      - id:
        status: PASS | FAIL | MANUAL | DEFERRED | NOT_APPLICABLE
        evidence:
    result: PASS | FAIL | PARTIAL | SKIPPED
  contexts_consumed:
    explore_context:
    test_context:
    debug_context:
    review_context:
    repair_source:
  artifact_context:
    schema_version: 1
    change_ref:
    source_spec:
    source_plan:
    required_with_change: []
    shared_owned: []
    conditional: []
    local_only: []
    unrelated_observed: []
  manual_deferrals:
    - item:
      reason:
      approved_by_user: true | false
  final_verdict: READY | READY_WITH_WARNINGS | BLOCKED | DEFERRED
  git_handoff_allowed: false
  git_handoff_reason:
```

Rules:

- `ship_context` must not contain secrets or PII.
- `commands_run` includes only commands actually run.
- `commands_skipped` includes skipped commands/probes with evidence.
- Do not claim `PASS` for skipped verification.
- Record current `associated_HEAD_or_diff`.
- Preserve the current change's `artifact_context`; verification is read-only
  and must not promote unrelated or local-only artifacts.
- Bind every command to its exact cwd, HEAD/diff, output digest, timestamps, and
  environment fingerprint. A later write makes affected evidence stale.
- State what remains unverified when verification is partial or deferred.

## Rules

### MUST DO

- Classify `verification_mode` before selecting criteria or commands.
- Select `acceptance_scope` explicitly.
- Discover package manager and scripts before running commands.
- Run current commands and read current output before making success claims.
- Record commands run, skipped commands, criteria status, contexts consumed, and
  manual deferrals.
- Redact suspected secrets and PII.
- Re-run verification after repair/debug/test changes.

### MUST NOT

- Invent AC from thin air.
- Blindly use the newest spec.
- Hardcode one package manager as universal.
- Download probe tools without explicit approval.
- Treat skipped scripts as passing.
- Claim a manual criterion passed on behalf of the user.
- Patch source directly inside this read-only gate.
- Let this gate create Git artifacts.

## Cross-References

- `sdcorejs-ship` - parent readiness skill and `ship_context` schema.
- `sdcorejs-ship (branch-ready mode)` - final read-only gate after verification.
- `_refs/orchestration/tail/branch-ready.md` - branch hygiene checklist.
- `sdcorejs-repair-loop` - fixes failed verification findings.
- `sdcorejs-debug` - concrete root-cause workflow.
- `sdcorejs-test` - test evidence and additional coverage.
- `sdcorejs-review` - read-only quality evidence.
- `sdcorejs-nextjs` - build-website profile and content-quality checks when
  explicitly applicable.
