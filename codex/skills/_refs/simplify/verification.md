# Simplify Verification and Runtime Evidence

## Contents

- [Before-edit baseline](#before-edit-baseline)
- [Evidence reuse](#evidence-reuse)
- [Apply discipline](#apply-discipline)
- [Post-change verification](#post-change-verification)
- [Git boundary](#git-boundary)
- [Runtime simplify_context](#runtime-simplify_context)
- [Downstream integration](#downstream-integration)
- [Verification claims](#verification-claims)

## Before-edit baseline

Every apply action requires a current **green baseline**:

1. Discover the committed package manager, workspace, and existing scripts.
2. Select an executed check with an observable behavioral assertion covering
   the changed paths. Use lint, typecheck and build as supplementary evidence.
3. Run the narrowest sufficient commands before editing.
4. Record each exact command, cwd/scope, exit code, and result.
5. Separate pre-existing failures from failures introduced by the run.

Do not invent a command, install a runner, mix package managers, use
`npx --yes`, read ambient credentials, call a live model, or run a paid
evaluation.

If no suitable runnable oracle exists, default to analyze-only. Apply requires
a separate explicit override after warning and must record
`behavior_verification: limited`.

### Capturing evidence for a scoped write

The executor freezes the owner root, selected paths and authorized ranges before its first write. Use owner-relative paths and the execution contract's path normalization. Check actual changed files against the selection and the approved step's allowed and prohibited paths, including untracked files. For a current-diff selection compare the task base to the pre-Simplify worktree and take the **new side** with `simplifyPatchHunks(path, taskPatch, 'new')`. A task deletion leaves a gap and a task addition leaves editable lines. Freeze only the authorized ranges in `scope.files[].allowed_hunks`. For a named function, select its lines in that same pre-Simplify tree. An explicitly authorized whole file may omit ranges.

1. Save the original bytes of every selected regular source file. Capture absence for an authorized new or deleted file. Resolve the owner root and exclude symlinks, non-regular files and inaccessible paths before reading. Treat only a confirmed missing file as absent.
2. Use [scope-evidence.mjs](scope-evidence.mjs) to compute `simplifyScopeHash([{path, content}, ...])` on the entire selection, using raw file bytes or `null` for absence. It hashes the sorted normalized paths and their individual SHA-256 digests. Capture each phase's owner HEAD and digest independently from the scoped test receipt. Bracket the test execution with both identities and discard a run if either changes during it.
3. For each behavior receipt supply `kind: behavior`, the executed `command`, selected stable case ID in `assertion`, `exit_code: 0`, `result: PASSED`, `covered_paths`, `source_revision` and `diff_scope_hash`. Run the same assertion and command before and after. Match each phase's revision and digest to the independently captured baseline or final snapshot. Record one observation from each run.
   - For a test runner, read the report. Set `executed_tests` to the number of tests that ran. Copy the selected ID into `passed_assertions` only if the reporter shows that case passed. Use a fully qualified ID for ambiguous names. Omit skipped, pending and unrelated cases. Zero matches or missing results require a fresh run.
   - For a direct caller probe, record `caller_probe: {assertion, expected, observed}`. Freeze the expected value across both runs. Read the case ID and observed value from the probe after it invokes the public entry point. Compare the expected and observed values as text, using the same serialization for structured results. A direct probe supplies its own observation and omits the test-runner fields.
4. For each pass, record actual `changed_paths` and `hunks` as `{path, start, count}` from the complete diff, including unsuccessful writes before rollback. Preserve the pre-pass and candidate bytes. Compare individual file snapshots with Git's `diff --no-index --no-ext-diff --no-textconv --no-color --unified=0 --inter-hunk-context=0` and feed the complete output for that file to `simplifyPatchHunks(path, patch)`. Git exit code 1 means the files differ. A partial, binary or metadata-only change lacks text-hunk evidence.
5. Coordinates use original lines, starting at 1. An insertion has count 0 and names the gap after its anchor line (0 at file start). An allowed positive range includes insertions anchored to its lines. Keep the operation's original coordinates across passes. If the first pass shifts line numbers, map the second pass's actual edit back using the saved snapshots. Ambiguous ownership requires a narrower scope. Inspect both pass transitions, even when the final diff cancels an edit.
6. Count distinct normalized files per pass and across all passes, and distinct original ranges across all passes. Apply the [execution limits](scope-and-invariants.md#execution-limits) and return to scope selection when exceeded. After rolling back the entire operation, verify the restored baseline digest. An empty pass list finishes unchanged.

The evaluator checks these executor observations. File names, an estimated hunk count or a digest copied from the receipt do not establish what ran. Keep source bytes, diffs and logs local. The runtime handoff carries identities, ranges and test results.

## Evidence reuse

Reuse current `test_context` or `test_evidence` only when it:

- belongs to the same change and current diff/hash;
- covers the selected files and hunks;
- identifies the selected passing case or the matching result from a direct caller probe;
- is not stale after a later write.

Authored tests without execution are not a baseline. A prior review or ship
gate is not behavioral evidence. Any simplification write makes affected test,
review, and ship evidence stale until the proper owners rerun it.

## Apply discipline

- Run no more than two passes.
- Keep each pass a coherent local batch within the declared file/hunk limits.
- Capture the exact pre-pass diff or snippets for owned hunks.
- Apply the smallest clarity improvement.
- Do not touch unrelated or user-owned changes.
- Run focused verification after each pass.
- Stop when no clear improvement remains.

If a pass regresses, undo only that pass with **exact scoped edits** from its
pre-pass snapshot. Never use a Git restore/reset/checkout operation to revert a
pass and never overwrite adjacent user changes. Record `reverted: true` and
the verification result.

## Post-change verification

After every write pass and at finalization:

1. rerun the same focused baseline commands;
2. run an additional existing command only when the project contract requires
   it;
3. inspect the final diff and selected hunks;
4. confirm protected literals, prompts, public contracts, framework metadata,
   dependencies, configuration, manifests, and lockfiles did not change;
5. run `git diff --check`;
6. classify the result as `passed`, `failed`, `limited`, or `not-run`.

Post-change verification covers only the selected commands and current scope.
Tests increase confidence but are not a mathematical proof of equivalence.

## Git boundary

Read-only inspection is allowed:

- `git status --short`
- `git diff`
- `git diff --stat`
- `git diff --check`
- `git show`

**Git writes are forbidden.** Do not run:

- `git add`
- `git commit`
- `git push`
- `git checkout`
- `git switch`
- `git reset`
- `git restore`
- `git clean`
- `git stash`
- `git merge`
- `git rebase`
- `git tag`

Git artifacts belong to `sdcorejs-git`. Exact pass reversion uses scoped file
edits, not Git.

## Runtime `simplify_context`

Build this runtime-only evidence for every analyze, apply, blocked, unchanged,
partial, or reverted run. Pass it to the exact consumer without echoing the
full block to the user by default. The user projection preserves changed paths,
pass/revert outcome, verification, skipped checks, blockers, and risks.

```yaml
simplify_context:
  schema_version: 1
  source: sdcorejs-simplify
  action: analyze-current-diff | apply-current-diff | analyze-explicit-scope | apply-explicit-scope | planning-handoff
  invocation: direct | finish-gate | approved-plan

  artifact_identity:
    owner_repository_id: <stable repository id>
    owner_module_id: <module id or null>
    execution_host_repository_id: <stable repository id>
  source_revision: <owner repository revision>
  final_diff_scope_hash: <SHA-256 over the same selection at finalization>
  approved_plan_step:
    step_id: <id or null>
    owner_repository_id: <stable repository id or null>
    allowed_paths: []

  target_root: <path>
  target_root_kind: target-project | sdcorejs-agent-authoring-repo | skill-pack-authoring-repo | unknown

  source_context:
    execution_context: <reference or null>
    test_context: <reference or null>
    ai_agent_context: <reference or null>
    review_context: <reference or null>
    debug_context: <reference or null>

  baseline:
    branch: <branch>
    HEAD: <sha>
    status_snapshot: <summary>
    diff_scope_hash: <SHA-256 over selected paths and bytes>
    result: PASSED | FAILED
    package_manager: <manager>
    commands:
      - command: <exact command>
        scope: <scope>
        exit_code: <integer>
        result: passed | failed | skipped

  scope:
    requested: []
    files: [] # path, assessed surfaces and authorized allowed_hunks when bounded
    eligible_files: []
    eligible_hunks: []
    excluded:
      - path: <path>
        reason: protected-file | protected-content | outside-current-diff | generated | test-oracle | config | contract | user-owned | other
    expansion_required: false

  preserved_surfaces:
    return_values: verified | blocked | not-applicable
    output_shape: verified | blocked | not-applicable
    public_exports: verified | blocked | not-applicable
    public_types: verified | blocked | not-applicable
    public_API_and_signatures: verified | blocked | not-applicable
    routes_status_errors_validation_order: verified | blocked | not-applicable
    side_effects_and_order: verified | blocked | not-applicable
    async_concurrency_transaction: verified | blocked | not-applicable
    retry_timeout_cache: verified | blocked | not-applicable
    auth_permissions_tenant_approval: verified | blocked | not-applicable
    persistence_and_query: verified | blocked | not-applicable
    rendering_DOM_accessibility: verified | blocked | not-applicable
    telemetry_and_audit: verified | blocked | not-applicable
    strings_and_prompts: verified | blocked
    framework_metadata: verified | blocked | not-applicable
    dependencies_and_config: verified | blocked

  limits:
    max_passes: 2
    max_files_per_pass: 5
    max_total_files_without_reconfirmation: 8
    max_hunks_without_reconfirmation: 20

  passes:
    - pass: 1
      changed_paths: []
      hunks: [] # observed original-side path/start/count
      files: []
      rationale: []
      changes: []
      reverted: false
      verification_result: passed | failed | limited | not-run

  result:
    status: analyzed | simplified | unchanged | blocked | reverted | partial
    files_changed: []
    significant_changes: []
    deferred_opportunities: []
    protected_content_changes: none
    public_contract_changes: none
    dependency_changes: none

  behavior_evidence:
    before: <behavior receipt bound to the baseline>
    after: <behavior receipt bound to the final snapshot>

  verification:
    before: []
    after: []
    behavior_verification: covered-by-current-tests | limited | not-verified
    git_diff_check: passed | failed | not-run
    blockers: []
    risks: []

  artifact_context:
    schema_version: 1
    change_ref: <id or durable artifact path>
    source_spec: <path | none>
    source_plan: <path | none>
    required_with_change: []
    shared_owned: []
    conditional: []
    local_only: []
    unrelated_observed: []
```

Do not persist this block in a mutable session/global manifest. Do not create a
durable simplification report by default. If an explicit handoff requires one,
apply artifact lifecycle metadata and redact secrets, prompts, customer data,
and raw logs.

## Downstream integration

- `sdcorejs-test` consumes selected files/hunks and baseline commands, keeps
  pre-simplification and post-simplification runs distinct, reruns focused
  coverage, and never changes expectations to legitimize drift.
- `sdcorejs-review` checks scope expansion, protected content, contracts,
  strings/prompts, framework metadata, auth/tenant/permission, ordering,
  over-simplification, freshness, and dependency/config churn.
- `sdcorejs-repair-loop` preserves the original context. Repair writes make
  affected simplification verification stale and cannot turn the change into a
  semantic refactor. Neither workflow may recursively invoke the other; the
  caller owns at most one bounded handoff.
- `sdcorejs-debug` consumes pre/post evidence and the pass ledger to distinguish
  a pre-existing failure from a regression using the smallest sanitized
  reproduction.
- `sdcorejs-ship` blocks unverified writes, protected drift, unreverted failed
  passes, and stale test/review evidence. Limited verification needs an explicit
  risk/deferral.
- `sdcorejs-git` receives the final diff and file list but must not stage
  runtime-only context, temporary baselines, prompts, or sensitive evidence.

## Verification claims

Use:

- "covered by current focused tests" when the selected case passed before and after;
- the entry point, input and observed result for a direct caller probe;
- "limited" when an explicit override lacks a complete behavior oracle;
- "not verified" when required commands did not run.

Do not say "proved identical", "semantically equivalent for arbitrary code",
"safe to ship", or "production ready" based only on this workflow.
