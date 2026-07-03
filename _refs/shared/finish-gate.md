# Finish Gate (cross-track) - consolidated finishing-steps ASK

Loaded by every track write-code orchestrator (`sdcorejs-angular`,
`sdcorejs-nestjs`, `sdcorejs-nextjs`). The gate is MANDATORY and
UNCONDITIONAL: present it after EVERY code-generation run, whether the skill
was reached through the full SDLC flow or triggered standalone (for example
"add entity", "create module X", "add a page"). It exists so the user always
knows these finishing steps exist and can choose; the steps are never silently
skipped, and never silently auto-run without the user seeing them.

Why this gate exists: standalone skill triggers used to stop right after
code-gen, so tests, user/technical documentation, review, and shipping checks silently never
happened. The gate makes the whole finishing chain visible at one decision
point, every time.

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
Code generated for <scope>. Finish step 1/3: tests.

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
- If the user chooses "Skip new user/technical docs" at Finish step 2, do not
  create new user-guide or technical-doc files for this run. Existing docs may
  still be updated only when the current request explicitly asked for that.
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
  entity X with full tests and create the user guide"), pre-fill the gate from those
  answers and present it for a quick confirm rather than re-asking blindly.

## Order of execution after the gate

1. (if tests not skipped) `sdcorejs-test` - run the RED-first specs written
   during the TDD gate and add happy-path coverage; report pass/fail.
2. (if review not skipped) `sdcorejs-review` -> `sdcorejs-repair-loop`.
3. `sdcorejs-documentation (code-documentation mode)` - automatic for touched
   source files; use concise maintainability-focused rules and do not ask.
4. (if `technical_doc=create` or `technical_doc=update`)
   `sdcorejs-documentation (write-technical-doc mode)`.
5. `sdcorejs-ship (verify-before-done mode)` (always).
6. `sdcorejs-ship (branch-ready mode)` (always).
7. `_refs/orchestration/tail/auto-docs.md` (always).
8. (if `user_guide=create` or `user_guide=update`)
   `sdcorejs-documentation (write-user-guide mode)`.
9. `_refs/orchestration/tail/auto-task-tracker.md` (always).
10. `sdcorejs-explore (memories mode)` when durable knowledge surfaced.
