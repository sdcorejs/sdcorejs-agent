# Finish Gate (cross-track) - finishing assessment

## Contents

- [When To Present](#when-to-present)
- [Prompt Sequence](#prompt-sequence)
- [Rules](#rules)
- [Execution Order](#order-of-execution-after-the-gate)

Read `_refs/shared/session-authority.md` first. This gate is MANDATORY after
every code-generation run, including standalone and fast-fix requests. It
assesses verification, concise review, applicable documentation and delivery.
It does not require a new user choice when current session authority covers the
action. Report the selected finishing scope and continue authorized work.

## When to present

After the last code-generating step, before the tail. For a bounded fix, apply
targeted tests and concise review without creating spec/plan artifacts. For
governed work, carry the approved plan and session choices.

## Prompt Sequence

Read `_refs/shared/finish-decisions.md` only for an unresolved material choice.
Ask that choice alone; keep independent work moving. Do not reconfirm explicit
session instructions or turn optional simplify/docs choices into blockers.

## Rules

- UNCONDITIONAL. The gate fires for standalone single-skill triggers too, not
  only the SDLC flow. A one-line "add entity" still gets the gate.
- Tests use the risk-appropriate agreed strategy (TDD or post-hoc). Existing
  focused tests may suffice for low-risk changes; skip reasons remain visible.
  Silence does not authorize an optional effect or waive required verification.
- Code documentation is automatic for Angular/NestJS/Next.js source-code
  changes. It is not optional in this gate and does not require approval.
- Apply existing documentation authority first. For new unresolved scope read
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
- Convention sync is a write-producing step. When it writes files after an
  earlier verification, rerun every affected final gate before branch-ready.
- Task-tail cleanup is bounded to already-known current-task artifacts after
  tests/review/fixes and durable finalization. Read `_refs/cleanup/workflow.md`
  when those artifacts or significant producer signals exist. Only an approved
  policy may automatically remove qualifying LOW reproducible task output;
  `local_only` does not imply disposable, and accepting analysis does not
  approve mutation. Failed, cancelled or interrupted tasks retain diagnostics.
- Workers emit cleanup findings only. The sequential/fan-in owner deduplicates
  signals, honors runtime decline/session-disable suppression across workflows,
  and presents at most one offer after primary work. Never scan the full repo
  on every task or interrupt debugging merely to offer housekeeping.
- Do not automatically simplify again after `sdcorejs-repair-loop`. A new pass
  requires a separate invocation.
- If the user chooses "Skip new user/technical docs" at Finish step 2, do not
  create new user-guide or technical-doc files for this run. Existing docs may
  still be updated only when the current request explicitly asked for that.
- Scoped review is part of completing an implementation request. `Run review only` must not edit code.
  Repair-loop runs when the session authorizes repair, including an explicit
  implementation-and-fix request; do not auto-edit after a direct read-only
  review.
- Execute the tail steps honoring the sequential answers, in the orchestrator's
  defined order. A skipped optional step is omitted; run only applicable authorized steps.
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
- Reuse explicit instructions from the current session and execute them; no
  quick confirmation is needed solely because a skill or phase changed.

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
12. `sdcorejs-explore (memories-readonly)` when durable knowledge surfaced;
    persist only with action-specific memory-write authority.
13. `sdcorejs-explore (conventions-sync-write-approved)` only when convention
    candidates or rule updates exist AND the project capture policy or explicit
    workflow authorization permits persistence. It runs after every other
    write-producing step so it revalidates the final source/config state, and it
    merges its `artifact_context` into the same-change closure. Never run it
    from a parallel worker, and never add convention sync to `sdcorejs-git`;
    Git consumes already-produced artifacts.
14. `sdcorejs-cleanup (task-tail-cleanup)` only when the finalized current task
    has known candidate artifacts or accepted bounded analysis. Apply only
    exact current-task LOW actions covered by an approved policy, or separately
    approved frozen actions. Keep durable/needed/unrelated/unknown files.
15. After any cleanup mutation, run affected verification and pass the exact
    receipt, independently captured current snapshot, and current mapped
    command/path evidence to ship/convergence. Filesystem checks alone are not
    affected verification; partial/failed actions remain blockers.
16. `sdcorejs-ship (verify-before-done mode)` (unless deferred).
17. `sdcorejs-ship (branch-ready mode)` (unless deferred) - final read-only
    gate over the final diff.

Every producer passes its `artifact_context` to the next step. Ship merges the
same-change closure and forwards it to `sdcorejs-git` when the user requests a
Git artifact.
Cleanup receipts and offer suppression remain runtime handoffs. Cleanup
delete/move/quarantine/archive/restore after branch-ready invalidates that
evidence and requires affected verification, convergence and final branch-ready
again before Git handoff.

`sdcorejs-git` is not part of the automatic finish-gate tail. It may run next
only when the user requests a Git artifact and current ship evidence plus final
branch-ready evidence is present for the final current `HEAD` or diff, or
explicitly deferred with the required risk note.

## Approved finish scope and fast fixes

When the user already approved exact tests, review and documentation in the
current session or plan, carry out those choices and show their status without asking them
again. Ask only for a genuinely unresolved finish decision. Every code change,
including fast-fix, retains the proportional baseline from
`_refs/harness/runtime-policy.mjs` and the evidence contract in
`_refs/shared/review-risk-contract.mjs`. Inspect applicable naming/routes,
effective protection, comparable screen states, hardcoded/completeness assumptions
and the assertion proving each affected risk. Use the field contract in
`_refs/shared/review-code.md#evidence-backed-risk-baseline`; record unavailable
evidence and reasons for non-applicability. Formatting-only changes do not
automatically require new tests. A small diff does not make
permission, tenant or complete-data behavior low risk. Complete authorized
Explore convention/bootstrap sync before affected verification and the final
read-only branch-ready check; never write AGENTS from review.
