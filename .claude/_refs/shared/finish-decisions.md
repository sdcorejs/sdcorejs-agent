# Unresolved finish decisions

Load only for a material finish choice not already covered by session authority.
Apply `_refs/shared/session-authority.md` first. The examples below are menus,
not mandatory new confirmation gates.

### Step 1 - Tests

```text
Code generated for <scope>. Finish step 1/4: tests.

1. Standard tests - use the agreed TDD/post-hoc strategy and affected coverage. [Recommended]
2. Minimal tests - fastest useful coverage.
3. Full tests - broader edge-case and integration coverage.
4. Skip tests - only if the user explicitly accepts the risk.

Reply with `1`, `2`, `3`, or `4`.
```

### Step 2 - User/Technical Documentation

`code-documentation` is not part of this approval gate. Track skills apply
source-code documentation automatically when they create or modify source code.

For unresolved documentation scope, inspect whether this run implemented a new feature and
whether corresponding `user-guide` and `technical-doc` files already exist. If a
new feature has no corresponding docs and creation is not already authorized, ask:

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

Never auto-run simplification. Carry existing Apply/Analyze/Skip choices. Offer
an unresolved choice only when material; trivial work may omit this menu. Resolve eligibility from changed executable source,
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

If the user explicitly requested simplification in this session, execute
option `3` within that scope without reconfirmation, enforcing the green baseline. When tests were skipped and
there is no current green evidence, block option `3`; allow analyze-only or
return to the required focused tests.

### Step 4 - Review

```text
Finish step 4/4: review.

1. Ship now - skip extra review for this run and continue acceptance verification.
2. Run review only - read-only review; do not edit code.
3. Run review and repair loop. [Recommended]
4. Defer - stop before review/ship tail so the user can continue later.

Reply with `1`, `2`, `3`, or `4`.
```

Option `2` authorizes read-only `sdcorejs-review` only. Option `3` explicitly
authorizes the finish-gate caller to run the read-only `sdcorejs-review` and
then `sdcorejs-repair-loop` for blocking findings with the original
`review_context`. Option `1` skips extra review/repair, preserves the mandatory concise risk baseline, and continues to acceptance
verification. Option `4` stops the tail chain before review/ship and returns a
runtime-only status update. Create a durable handoff only when the user asks or
a real blocked/deferred transfer needs it. A direct
user-requested `sdcorejs-review` outside this finish gate remains strict
read-only and may only offer repair-loop or artifact persistence as explicit
next steps.

After resolving applicable choices, state the finishing scope:
write-producing documentation/task/memory artifacts first, then verification,
then branch-ready as the final read-only gate before any Git artifact handoff.
All write-producing steps run before final branch-ready.
All write-producing steps emit and merge `artifact_context` before final
branch-ready.
