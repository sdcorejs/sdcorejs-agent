# Finish Gate (cross-track) - consolidated finishing-steps ASK

Loaded by every track write-code orchestrator (`sdcorejs-angular`,
`sdcorejs-nestjs`, `sdcorejs-nextjs`). The gate is MANDATORY and
UNCONDITIONAL: present it after EVERY code-generation run, whether the skill
was reached through the full SDLC flow or triggered standalone (for example
"add entity", "create module X", "add a page"). It exists so the user always
knows these finishing steps exist and can choose; the steps are never silently
skipped, and never silently auto-run without the user seeing them.

Why this gate exists: standalone skill triggers used to stop right after
code-gen, so tests, documentation, review, and shipping checks silently never
happened. The gate makes the whole finishing chain visible at one decision
point, every time.

## When to present

Immediately after the last code-generating reference pack finishes, and BEFORE
running any tail step. Present exactly once per code-gen invocation. This
applies even to a one-line standalone request. "Small change" is not a reason
to skip the gate.

## Prompt Sequence

Adapt every prompt to the user's language. Ask these questions sequentially and
wait for each answer before asking the next one. Do not ask for a combined
multi-setting answer.

### Step 1 - Tests

```text
Code generated for <scope>. Finish step 1/3: tests.

1. Standard tests - write now, RED-first, standard coverage. [Recommended]
2. Minimal tests - fastest useful coverage.
3. Full tests - broader edge-case and integration coverage.
4. Skip tests - only if the user explicitly accepts the risk.

Reply with `1`, `2`, `3`, or `4`.
```

### Step 2 - Documentation

If saved documentation preferences exist with `ask_each_time: false`, report the
saved choices and skip this question unless the current request overrides them.
Otherwise ask:

```text
Finish step 2/3: documentation.

1. Ask documentation questions now - comments, user guide, technical doc, requirement record, and saved preference. [Recommended]
2. Skip optional documentation for this run.

Reply with `1` or `2`.
```

When the user chooses `1`, run `_refs/documentation/gate.md`, which asks its own
questions sequentially.

When the user chooses `2`, do not run `_refs/documentation/gate.md`. Set the
effective documentation choices explicitly:

```yaml
comment_code: skip
user_guide: skip
technical_doc: skip
requirement_record: skip
preference_saved: false
```

### Step 3 - Review

```text
Finish step 3/3: review.

1. Run review and repair loop. [Recommended]
2. Skip review for this run.

Reply with `1` or `2`.
```

After these answers, state the selected choices and the always-on steps:
verify acceptance criteria, branch-hygiene sweep, session docs, task tracker,
and durable memories.

## Rules

- UNCONDITIONAL. The gate fires for standalone single-skill triggers too, not
  only the SDLC flow. A one-line "add entity" still gets the gate.
- Tests default ON (RED-first, `standard`). The user may opt out (`skip`) or
  change the level. If the user says nothing about tests, write them; silence
  means accept the default, never skip.
- Documentation default ON. Read `_refs/documentation/gate.md` before asking.
  If `<target>/.sdcorejs/documentation/preferences.md` exists with
  `ask_each_time: false`, apply it and do not ask again unless the current
  request overrides it.
- The documentation gate captures `comment_code`, `user_guide`,
  `technical_doc`, and whether to save the preference. `skip` is valid for each
  documentation artifact, but the user must see the choice unless a saved
  preference applies.
- If the user chooses "Skip optional documentation" at Finish step 2, treat
  every documentation artifact as skipped for this run. Do not call
  documentation tail modes with undefined choices.
- Review default ON; the user may `skip` it.
- Execute the tail steps honoring the sequential answers, in the orchestrator's
  defined order. A skipped step is omitted; everything not skipped runs.
- Plumbing always runs: `sdcorejs-ship (verify-before-done mode)` ->
  `sdcorejs-ship (branch-ready mode)` -> auto-docs tail ref ->
  auto-task-tracker tail ref -> memories. These are not opt-out, but the gate
  lists them so the user is aware they happen.
- Localize the prompt; keep identifiers, permission codes, and route paths in
  English in every language.
- If the user already gave explicit instructions this turn (for example "add
  entity X with full tests and medium comments"), pre-fill the gate from those
  answers and present it for a quick confirm rather than re-asking blindly.

## Order of execution after the gate

1. (if tests not skipped) `sdcorejs-test` - run the RED-first specs written
   during the TDD gate and add happy-path coverage; report pass/fail.
2. (if review not skipped) `sdcorejs-review` -> `sdcorejs-repair-loop`.
3. (if `comment_code` is not `skip`) `sdcorejs-documentation (comment-code mode)` -
   apply the level captured by `_refs/documentation/gate.md`; do not ask again.
4. (if `technical_doc=write`, or if `technical_doc=auto` and the auto criteria
   are met) `sdcorejs-documentation (write-technical-doc mode)`.
5. `sdcorejs-ship (verify-before-done mode)` (always).
6. `sdcorejs-ship (branch-ready mode)` (always).
7. `_refs/orchestration/tail/auto-docs.md` (always).
8. (if `user_guide=update`) `sdcorejs-documentation (write-user-guide mode)`.
9. `_refs/orchestration/tail/auto-task-tracker.md` (always).
10. `sdcorejs-explore (memories mode)` when durable knowledge surfaced.
