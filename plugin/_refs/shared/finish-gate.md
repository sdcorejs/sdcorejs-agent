# Finish Gate (cross-track) - consolidated finishing-steps ASK

## Contents

- [When To Present](#when-to-present)
- [Prompt Sequence](#prompt-sequence)
- [Rules](#rules)
- [Execution Order](#order-of-execution-after-the-gate)

Loaded by every track write-code orchestrator (`sdcorejs-angular`,
`sdcorejs-nestjs`, `sdcorejs-nextjs`). The gate is MANDATORY and
UNCONDITIONAL: present it after EVERY code-generation run, whether the skill
was reached through the full SDLC flow or triggered standalone (for example
"add entity", "create module X", "add a page"). It exists so the user always
knows these finishing steps exist and can choose; the steps are never silently
skipped, and never silently auto-run without the user seeing them.

Why this gate exists: standalone skill triggers used to stop right after
code-gen, so tests, user/technical documentation, optional behavior-preserving
simplification, review, and shipping checks silently never happened. The gate
makes the whole finishing chain visible, every time.

## When to present

Immediately after the last code-generating reference pack finishes, and BEFORE
running any tail step. Present exactly once per code-gen invocation. This
applies even to a one-line standalone request. "Small change" is not a reason
to skip the gate.

## Prompt Sequence

Adapt every prompt to the user's language. Ask the finish decisions
sequentially and wait for each answer before asking the next one. The
user/technical documentation decision is a single combined gate because both
artifacts share the same new-file approval boundary.

### Step 1 - Tests

```text
Code generated for <scope>. Finish step 1/4: tests.

1. Standard tests - write now, RED-first, standard coverage. [Recommended]
2. Minimal tests - fastest useful coverage.
3. Full tests - broader edge-case and integration coverage.
4. Skip tests - only if the user explicitly accepts the risk.

Reply with `1`, `2`, `3`, or `4`.
```

### Step 2 - User/Technical Documentation

`code-documentation` is not part of this approval gate. Track skills apply
source-code documentation automatically when they create or modify source code.

Immediately after Step 1, inspect whether this run implemented a new feature and
whether corresponding `user-guide` and `technical-doc` files already exist. If a
new feature has no corresponding docs, ask:

```text
Finish step 2/4: user/technical documentation.
Documentation approval gate:
This appears to be a new feature and I did not find an existing corresponding `user-guide` or `technical-doc`.

Should I create documentation for this feature?

Options:
1. Create/update `user-guide` - task-oriented documentation for end users, admins, support staff, or operators.
2. Create/update `technical-doc` - developer/operator-facing documentation for architecture, API, integration, deployment, troubleshooting, configuration, or security.
3. Create both - create/update both `user-guide` and `technical-doc`. [Recommended for user-visible features with developer-facing behavior]
4. Skip new user/technical docs for this change - no new user-guide or technical-doc file will be created.

Reply with `1`, `2`, `3`, or `4`.
```

When corresponding docs already exist, use the same gate wording but replace the
second sentence with the paths found and treat the selected options as updates.
Saved preferences may prefill the recommended option for updates, but they must
not silently create a missing `user-guide` or `technical-doc` for a new feature.

When the user chooses `4`, set the effective documentation choices explicitly:

```yaml
user_guide: skip
technical_doc: skip
requirement_record: skip
preference_saved: false
```

### Step 3 - Behavior-preserving simplification

Never auto-run simplification. Present the decision even when a simplification
recommendation is Skip. Resolve eligibility from changed executable source,
protected-file/content boundaries, and the selected test baseline.

```text
Finish step 3/4: behavior-preserving code simplification.

1. Skip simplification for this run.
2. Analyze eligible changed code and report opportunities only; do not edit.
3. Simplify eligible changed source code after a green baseline, then rerun the same focused verification.

Recommendation: <option> because <evidence-based reason>.

Reply with `1`, `2`, or `3`.
```

Recommend:

- `1` for docs/config/test-only/trivial changes, protected files, missing scope,
  or no runnable behavior oracle;
- `2` when scope or risk is not clear enough for an edit;
- `3` only for non-trivial eligible executable code with a bounded scope and a
  runnable green baseline.

If the user explicitly requested simplification in the same turn, prefill
option `3`, but still enforce the green baseline. When tests were skipped and
there is no current green evidence, block option `3`; allow analyze-only or
return to the required focused tests.

### Step 4 - Review

```text
Finish step 4/4: review.

1. Ship now - skip review for this run and continue acceptance verification.
2. Run review only - read-only review; do not edit code.
3. Run review and repair loop. [Recommended]
4. Defer - stop before review/ship tail so the user can continue later.

Reply with `1`, `2`, `3`, or `4`.
```

Option `2` authorizes read-only `sdcorejs-review` only. Option `3` explicitly
authorizes the finish-gate caller to run the read-only `sdcorejs-review` and
then `sdcorejs-repair-loop` for blocking findings with the original
`review_context`. Option `1` skips review/repair and continues to acceptance
verification. Option `4` stops the tail chain before review/ship and returns a
runtime-only status update. Create a durable handoff only when the user asks or
a real blocked/deferred transfer needs it. A direct
user-requested `sdcorejs-review` outside this finish gate remains strict
read-only and may only offer repair-loop or artifact persistence as explicit
next steps.

After these answers, state the selected choices and the always-on steps:
write-producing documentation/task/memory artifacts first, then verification,
then branch-ready as the final read-only gate before any Git artifact handoff.
All write-producing steps run before final branch-ready.
All write-producing steps emit and merge `artifact_context` before final
branch-ready.

## Rules

- UNCONDITIONAL. The gate fires for standalone single-skill triggers too, not
  only the SDLC flow. A one-line "add entity" still gets the gate.
- Tests default ON (RED-first, `standard`). The user may opt out (`skip`) or
  change the level. If the user says nothing about tests, write them; silence
  means accept the default, never skip.
- Code documentation is automatic for Angular/NestJS/Next.js source-code
  changes. It is not optional in this gate and does not require approval.
- User/technical documentation default is visible choice. Read
  `_refs/documentation/gate.md` before asking.
  If `<target>/.sdcorejs/documentation/preferences.md` exists with
  `ask_each_time: false`, it may apply to updates of existing docs, but it must
  not silently authorize new doc file creation for a new feature.
- The documentation gate captures `user_guide`, `technical_doc`, and whether a
  missing corresponding doc file may be created. `skip` is valid for user-guide
  and technical-doc, but skipping does not skip automatic code-documentation.
- Behavior-preserving simplification is a visible opt-in choice. Never silently
  choose or run it. `Analyze` is read-only. `Apply` must invoke
  `sdcorejs-simplify` with current test evidence and the bounded changed-source
  scope.
- A simplification write makes affected test, review, and ship evidence stale.
  Rerun the same focused tests before review and pass the resulting
  `simplify_context` through the remaining tail.
- Do not automatically simplify again after `sdcorejs-repair-loop`. A new pass
  requires a separate invocation.
- If the user chooses "Skip new user/technical docs" at Finish step 2, do not
  create new user-guide or technical-doc files for this run. Existing docs may
  still be updated only when the current request explicitly asked for that.
- Review default is a visible choice. `Run review only` must not edit code.
  Repair-loop is part of review only when the user chose
  "Run review and repair loop"; do not auto-edit after a direct read-only
  review.
- Execute the tail steps honoring the sequential answers, in the orchestrator's
  defined order. A skipped step is omitted; everything not skipped runs.
- Unless the user chose `Defer`, plumbing runs after the chosen review mode:
  all selected write-producing tail steps first, then
  `sdcorejs-ship (verify-before-done mode)`, then
  `sdcorejs-ship (branch-ready mode)` as the final read-only gate. If `Defer`
  is selected, stop after a concise runtime update and do not claim done.
- Branch-ready is the final read-only gate before Git artifacts. No writes after branch-ready unless branch-ready is run again.
- If finish-gate work writes files after an earlier branch-ready check, that
  evidence is stale and the tail must re-run branch-ready before Git artifact
  handoff.
- The finish gate does not auto-create Git artifacts. Invoke `sdcorejs-git`
  only when the user asks for commit, PR, changelog, release notes, or worktree
  artifacts after verify-before-done and final branch-ready evidence exists for
  the current `HEAD` or diff.
- Localize the prompt; keep identifiers, permission codes, and route paths in
  English in every language.
- If the user already gave explicit instructions this turn (for example "add
  entity X with full tests and create the user guide"), pre-fill the gate from those
  answers and present it for a quick confirm rather than re-asking blindly.

## Order of execution after the gate

1. (if tests not skipped) `sdcorejs-test` - execute the approved
   requirement/risk coverage scope using discovered commands. Preserve v2
   `test_context`, independent `test_status`, append-oriented `test_evidence`,
   capture evidence, and `artifact_context`; authored tests alone are not a
   pass.
   If the test output reveals a concrete product bug or failing command that
   needs a root-cause fix, route that item to `sdcorejs-debug` with the
   `test_context`/`test_status`/`test_evidence` and smallest reproduction, then
   resume this tail with the resulting `debug_context`.
2. (if simplification choice is `Analyze`) `sdcorejs-simplify
   (analyze-current-diff)` - inspect eligible changed source hunks and emit
   `simplify_context` without edits.
3. (if simplification choice is `Apply`) `sdcorejs-simplify
   (apply-current-diff)` - consume the green test baseline, refine only eligible
   changed source hunks, and emit `simplify_context`.
4. (after simplification Apply) `sdcorejs-test` - rerun affected focused
   commands, append post-simplification evidence, and mark it current before
   review. Do not change expectations to legitimize behavior drift.
5. (if review choice is `Run review only`) `sdcorejs-review` only; it must
   include `review_context` and must not edit code.
6. (if review choice is `Run review and repair loop`) `sdcorejs-review` ->
   `sdcorejs-repair-loop`; repair-loop receives the original `review_context`.
7. `sdcorejs-documentation (code-documentation mode)` - automatic for touched
   source files; use concise maintainability-focused rules and do not ask.
8. (if `technical_doc=create` or `technical_doc=update`)
   `sdcorejs-documentation (write-technical-doc mode)`.
9. `_refs/orchestration/tail/auto-docs.md` (unless deferred).
10. (if `user_guide=create` or `user_guide=update`)
   run Mode 1 per selected module, then Mode 2 exactly once if a guide changed
   or an aggregate was approved; export remains separate.
11. `_refs/orchestration/tail/auto-task-tracker.md` only when the sequential
   workflow or integration owner is authorized to reconcile the shared durable
   backlog (and unless deferred). Never use it for live progress.
12. `sdcorejs-explore (memories mode)` when durable knowledge surfaced.
13. `sdcorejs-ship (verify-before-done mode)` (unless deferred).
14. `sdcorejs-ship (branch-ready mode)` (unless deferred) - final read-only
    gate over the final diff.

Every producer passes its `artifact_context` to the next step. Ship merges the
same-change closure and forwards it to `sdcorejs-git` when the user requests a
Git artifact.

`sdcorejs-git` is not part of the automatic finish-gate tail. It may run next
only when the user requests a Git artifact and current ship evidence plus final
branch-ready evidence is present for the final current `HEAD` or diff, or
explicitly deferred with the required risk note.
